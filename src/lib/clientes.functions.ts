import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assumirOuRecusar } from "@/lib/autoridade.server";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { contextoInterno } from "@/lib/comercial.server";
import { elegibilidadeAtivacao, type Classificacao, type PessoaLista } from "@/lib/clientes-lista";
import { semCache } from "@/lib/no-store";
import { semFixtures } from "@/lib/fixtures";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { normalizarCpf } from "@/lib/pessoa-identidade";
import { sinaisDuplicidade } from "@/lib/duplicidade-comparacao";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Lista real ou erro visível — nunca os dois confundidos. Antes, um erro de
 * rede/RLS (seja lançado, seja em `r.error`) virava `[]` do mesmo jeito que
 * "sem registros", escondendo instabilidade como se fosse lista vazia.
 */
export const seguro = async (p: any): Promise<any[]> => {
  const r = await p;
  if (r?.error) throw new Error(r.error.message ?? "Falha ao ler dados.");
  return (r?.data ?? []) as any[];
};

/** Leitura da base de pessoas com classificação, condições objetivas e vínculos de núcleo. */
export const listarPessoasCliente = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PessoaLista[]> => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const eq = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);

    const [pessoas, casos, membros, nucleos] = await Promise.all([
      seguro(eq("clientes").order("nome")),
      seguro(eq("crm_casos").is("archived_at", null)),
      seguro(eq("nucleo_membros")),
      seguro(eq("nucleos_familiares").is("archived_at", null)),
    ]);

    const nomeNucleo = new Map<string, string>(nucleos.map((n) => [n.id, n.nome ?? "Núcleo familiar"]));

    return pessoas.map((p) => {
      const meus = casos.filter((c) => c.cliente_id === p.id);
      return {
        id: p.id,
        nome: p.nome,
        nome_social: p.nome_social ?? null,
        email: p.email ?? null,
        telefone: p.telefone ?? null,
        origem: p.origem ?? null,
        status_comercial: p.status_comercial ?? null,
        pais_interesse: p.pais_interesse ?? null,
        status: p.status ?? "pre_onboarding",
        classificacao: (p.classificacao ?? "pre_cliente") as Classificacao,
        is_demo: Boolean(p.is_demo ?? p.demo),
        archived_at: p.archived_at ?? null,
        archive_motivo: p.archive_motivo ?? null,
        ativacao_decidida_em: p.ativacao_decidida_em ?? null,
        ativacao_justificativa: p.ativacao_justificativa ?? null,
        contratoAssinado: meus.some((c) => Boolean(c.contrato_assinado)),
        pagamentoConfirmado: meus.some((c) => Boolean(c.pagamento_confirmado)),
        casosVinculados: meus.length,
        participacoes: membros
          .filter((m) => m.cliente_id === p.id)
          .map((m) => ({ nucleo: nomeNucleo.get(m.nucleo_id) ?? null, papel: m.papel ?? m.vinculo ?? null })),
      } satisfies PessoaLista;
    });
  });

/** Decisão humana de ativação. O banco recusa sem contrato assinado e pagamento confirmado. */
export const ativarCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; justificativa: string }) => {
    if (!data.justificativa || data.justificativa.trim().length < 5) {
      throw new Error("Registre a justificativa da decisão de ativação (mínimo 5 caracteres).");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    // Trava de servidor: recalcula a camada e as condições objetivas antes de promover.
    const eq = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);
    const [linhas, casos, membros] = await Promise.all([
      seguro(eq("clientes").eq("id", data.id)),
      seguro(eq("crm_casos").is("archived_at", null)),
      seguro(eq("nucleo_membros").eq("cliente_id", data.id)),
    ]);
    const bruto = linhas[0];
    if (!bruto) throw new Error("Cadastro não encontrado nesta organização.");
    const meus = casos.filter((c) => c.cliente_id === data.id);
    const pessoa = {
      ...bruto,
      classificacao: (bruto.classificacao ?? "pre_cliente") as Classificacao,
      status_comercial: bruto.status_comercial ?? null,
      archived_at: bruto.archived_at ?? null,
      contratoAssinado: meus.some((c) => Boolean(c.contrato_assinado)),
      pagamentoConfirmado: meus.some((c) => Boolean(c.pagamento_confirmado)),
      casosVinculados: meus.length,
      participacoes: membros.map((m) => ({ nucleo: m.nucleo_id ?? null, papel: m.papel ?? null })),
    } as PessoaLista;
    // Autoridade operacional (05/09/2026): pendência informa, não impede.
    // Antes, a promoção a cliente ativo era recusada no servidor mesmo com a
    // proprietária confirmando na tela. Agora ela assume a pendência, que fica
    // preservada e registrada. Para os demais papéis segue bloqueando.
    const eleg = elegibilidadeAtivacao(pessoa);
    const { papel } = await contextoInterno(supabase, context.userId as string);
    const pendenciasAssumidas = assumirOuRecusar(
      papel,
      eleg.apto ? [] : eleg.pendencias,
      `Promoção a cliente ativo bloqueada. ${eleg.pendencias.join(" ")}`,
    );
    void pendenciasAssumidas;

    const r = await gravarComVerificacao({
      supabase,
      tabela: "clientes",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: {
        classificacao: "cliente_ativo",
        status: "ativo",
        ativacao_decidida_em: new Date().toISOString(),
        ativacao_decidida_por: context.userId,
        ativacao_justificativa: data.justificativa.trim(),
      },
    });
    return { ok: true, salvoEm: r.salvoEm };
  });

export type PossivelDuplicidadeCliente = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  classificacao: string | null;
  motivo: string;
};

/**
 * Cadastro de cliente (clientes.tsx) não tinha nenhuma checagem de
 * duplicidade — mesmo padrão que já existe para lead (`buscarDuplicidades`
 * em crm-desk.functions.ts), aqui restrito à mesma organização e a
 * registros não arquivados.
 *
 * Ordem P1 (21/09/2026): CPF entra como sinal preventivo "quando
 * disponível". O comentário anterior desta função afirmava que `clientes`
 * não tinha coluna de documento e que CPF era de `case_members` — errado:
 * `clientes.cpf` existe desde a migration `20260902144855_pessoa_canonica_
 * extensao_clientes.sql` ("Pessoa Canônica — campo próprio"), e é a coluna
 * que `sincronizarPessoaDoCaso` já usa como valor canônico. A ausência em
 * `src/integrations/supabase/types.ts` é drift de tipo, não de schema.
 *
 * CPF é o sinal mais forte (documento não se compartilha; e-mail e telefone
 * de família, sim) — por isso vem primeiro no motivo. A normalização vem de
 * `pessoa-identidade.ts`, a mesma usada por `evidenciaDeMesmaPessoa`, para
 * não criar uma terceira regra paralela de comparação de CPF.
 */
export const verificarDuplicidadeCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { nome: string; email?: string | null; telefone?: string | null; cpf?: string | null }) => d,
  )
  .handler(async ({ data, context }): Promise<{ duplicidades: PossivelDuplicidadeCliente[] }> => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data: linhas } = await supabase
      .from("clientes")
      .select("id, nome, email, telefone, cpf, classificacao, demo, is_demo, data_origin")
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .limit(2000);

    const cpf = normalizarCpf(data.cpf ?? null);

    const achados: PossivelDuplicidadeCliente[] = [];
    /*
      Corte 1c-bis (03/10/2026): a detecção de duplicidade comparava contra
      clientes de demonstração também, e apontava fixture como "possível
      duplicata" de pessoa real. Fixture nunca é candidata a fusão.
    */
    for (const l of semFixtures((linhas ?? []) as PossivelDuplicidadeCliente[]) as PossivelDuplicidadeCliente[]) {
      const motivos: string[] = [];
      if (cpf && normalizarCpf(l.cpf) === cpf) motivos.push("mesmo CPF");
      motivos.push(...sinaisDuplicidade(data, l));
      if (motivos.length) achados.push({ ...l, motivo: motivos.join(" + ") });
    }
    return { duplicidades: achados };
  });

/** Reclassifica a pessoa (pré-cliente ou participante do núcleo), sem exclusão física. */
export const reclassificarPessoa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; classificacao: Exclude<Classificacao, "cliente_ativo">; motivo: string }) => {
    if (!data.motivo || data.motivo.trim().length < 5) throw new Error("Informe o motivo da reclassificação.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const r = await gravarComVerificacao({
      supabase,
      tabela: "clientes",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: {
        classificacao: data.classificacao,
        status: "pre_onboarding",
        ativacao_decidida_em: null,
        ativacao_decidida_por: null,
        ativacao_justificativa: data.motivo.trim(),
      },
    });
    return { ok: true, salvoEm: r.salvoEm };
  });
