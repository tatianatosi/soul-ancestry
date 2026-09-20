import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assumirOuRecusar } from "@/lib/autoridade.server";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { contextoInterno } from "@/lib/comercial.server";
import { elegibilidadeAtivacao, type Classificacao, type PessoaLista } from "@/lib/clientes-lista";
import { semCache } from "@/lib/no-store";
import { gravarComVerificacao } from "@/lib/persistencia.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const seguro = async (p: any): Promise<any[]> => {
  try {
    const r = await p;
    return (r?.data ?? []) as any[];
  } catch {
    return [];
  }
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

const soDigitos = (v: string) => v.replace(/\D+/g, "");
const normalizarNome = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export type PossivelDuplicidadeCliente = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  classificacao: string | null;
  motivo: string;
};

/**
 * Cadastro de cliente (clientes.tsx) não tinha nenhuma checagem de
 * duplicidade — mesmo padrão que já existe para lead (`buscarDuplicidades`
 * em crm-desk.functions.ts), aqui restrito à mesma organização e a
 * registros não arquivados. Não usa CPF: `clientes` não tem coluna de
 * documento validada (ver `docs/design-system/mascaras-e-validadores.md`,
 * "CPF" é dona de `case_members.cpf", não de `clientes`) — checagem por
 * e-mail/telefone/nome, igual ao lead.
 */
export const verificarDuplicidadeCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { nome: string; email?: string | null; telefone?: string | null }) => d)
  .handler(async ({ data, context }): Promise<{ duplicidades: PossivelDuplicidadeCliente[] }> => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data: linhas } = await supabase
      .from("clientes")
      .select("id, nome, email, telefone, classificacao")
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .limit(2000);

    const email = (data.email ?? "").trim().toLowerCase();
    const tel = soDigitos(data.telefone ?? "");
    const telChave = tel.length >= 8 ? tel.slice(-8) : "";
    const nome = normalizarNome(data.nome ?? "");

    const achados: PossivelDuplicidadeCliente[] = [];
    for (const l of (linhas ?? []) as PossivelDuplicidadeCliente[]) {
      const motivos: string[] = [];
      if (email && (l.email ?? "").trim().toLowerCase() === email) motivos.push("mesmo e-mail");
      const lTel = soDigitos(l.telefone ?? "");
      if (telChave && lTel.length >= 8 && lTel.slice(-8) === telChave) motivos.push("mesmo telefone");
      if (nome && normalizarNome(l.nome ?? "") === nome) motivos.push("mesmo nome");
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
