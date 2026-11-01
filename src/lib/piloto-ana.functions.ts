import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo, type Linha } from "@/lib/caso-canonico.server";
import { contextoRg, PAPEIS_EDITA } from "@/lib/pesquisa-modulo.server";
import { derivarPendenciasPiloto, NUCLEO_PILOTO, PILOTO_ANA, type MembroPiloto } from "@/lib/piloto-ana";
import { perfilInstitucionalRenderizado } from "@/lib/perfil-institucional";
import { semCache } from "@/lib/no-store";
import { gravarComVerificacao, exigirLinhaGravada } from "@/lib/persistencia.server";
import { clienteCorrespondentePorNome } from "@/lib/pessoa-vinculo";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Caso-piloto Ana Luiza: leitura, materialização interna e decisão humana do ID canônico. */

const CODIGO_BASE = PILOTO_ANA.ids_historicos[0];

/**
 * Localiza o caso-piloto tanto pelos códigos legados quanto pelo código
 * canônico já decidido. Sem o canônico aqui, um caso cujo `codigo` já foi
 * atualizado para CA-CID-AT-FAM-2026-001 nunca era encontrado — a busca só
 * olhava para os aliases — e materializarPilotoAna tentava inserir de novo
 * usando um código legado, que o gerador do banco já rejeita por já existir
 * como alias histórico ("Este identificador já existe como alias histórico").
 */
const CODIGOS_BUSCA_PILOTO = [
  ...PILOTO_ANA.ids_historicos,
  ...(PILOTO_ANA.id_canonico_decidido ? [PILOTO_ANA.id_canonico_decidido] : []),
];

/**
 * Religação 31/10/2026 — o caso vem SEMPRE do que foi escolhido no Caso 360
 * (`caseId`), nunca de uma busca pelos códigos da Ana. Os dados fixos da Ana
 * (`PILOTO_ANA`, `NUCLEO_PILOTO`) só valem para o caso cujo código é um dos
 * identificadores dela; qualquer outro caso usa o próprio dado.
 */
async function localizar(supabase: any, organizationId: string, caseId: string) {
  const { data } = await supabase
    .from("crm_casos")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", caseId)
    .maybeSingle();
  return (data ?? null) as Linha | null;
}

/** O caso escolhido é o caso da Ana Luiza (único com núcleo semeado a partir de `NUCLEO_PILOTO`)? */
function ehCasoDaAna(caso: Linha | null): boolean {
  return !!caso && CODIGOS_BUSCA_PILOTO.includes(String(caso.codigo));
}

async function organizacaoQueEdita(supabase: any, userId: string, acao: string) {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  if (!PAPEIS_EDITA.includes(papel)) throw new Error(`Seu papel não pode ${acao}.`);
  return organizationId as string;
}

export const carregarPilotoAna = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ context, data }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const caso = await localizar(supabase, organizationId, data.caseId);
    if (!caso) return { caso: null, nucleos: [], membros: [], eventos: [], pendencias: [] };
    const [nucleos, eventos, contrato, ordemServico] = await Promise.all([
      supabase.from("nucleos_familiares").select("*").eq("case_id", caso.id).is("archived_at", null),
      supabase.from("conversion_events").select("*").eq("case_id", caso.id).order("occurred_at", { ascending: false }),
      supabase
        .from("contracts")
        .select("id,status")
        .eq("organization_id", organizationId)
        .eq("case_id", caso.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("service_orders")
        .select("id,status")
        .eq("organization_id", organizationId)
        .eq("case_id", caso.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    const ids = ((nucleos.data ?? []) as Linha[]).map((n) => n.id);
    const membros = ids.length
      ? await supabase.from("nucleo_membros").select("*").in("nucleo_id", ids).is("archived_at", null)
      : { data: [] };

    const pendencias = derivarPendenciasPiloto({
      caseId: caso.id as string,
      caso: caso as Record<string, unknown>,
      membros: ((membros as any).data ?? []) as { nome: string; papel: string; processo?: string | null }[],
      contrato: (contrato.data ?? null) as { status: string } | null,
      ordemServico: (ordemServico.data ?? null) as { status: string } | null,
      perfilInstitucionalVigente: perfilInstitucionalRenderizado().vigente,
    });

    return {
      caso,
      nucleos: (nucleos.data ?? []) as Linha[],
      membros: ((membros as any).data ?? []) as Linha[],
      eventos: (eventos.data ?? []) as Linha[],
      pendencias,
    };
  });

/**
 * Materializa o núcleo familiar do caso escolhido, internamente. Não dispara
 * contrato, cobrança, assinatura nem comunicação. No caso da Ana semeia os
 * participantes conferidos dela; em qualquer outro caso cria o núcleo vazio a
 * partir do cliente do próprio caso — nada de família alheia.
 */
export const materializarPilotoAna = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ context, data: entrada }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoQueEdita(supabase, context.userId as string, "materializar o núcleo do caso");
    const caso = await localizar(supabase, organizationId, entrada.caseId);
    if (!caso) throw new Error("Caso não encontrado nesta organização.");
    const casoDaAna = ehCasoDaAna(caso);

    if (casoDaAna) {
      await gravarComVerificacao({
        supabase,
        tabela: "crm_casos",
        id: caso.id,
        organizationId,
        userId: context.userId as string,
        payload: {
          responsavel_principal: PILOTO_ANA.responsavel,
          eixo_formalizacao: "formalizacao_em_preparacao",
          data_confirmacao_formal_proposta: PILOTO_ANA.aceite_formal_confirmado_em,
          ids_historicos: PILOTO_ANA.ids_historicos,
        },
      });
    }

    let nomeDoCliente: string | null = null;
    if (caso.cliente_id) {
      const { data: cli } = await supabase
        .from("clientes")
        .select("nome")
        .eq("id", caso.cliente_id)
        .eq("organization_id", organizationId)
        .maybeSingle();
      nomeDoCliente = (cli?.nome as string | undefined) ?? null;
    }
    const membrosASemear: MembroPiloto[] = casoDaAna
      ? NUCLEO_PILOTO
      : nomeDoCliente
        ? [
            {
              nome: nomeDoCliente,
              papel: "contratante_signatario",
              signatario: true,
              situacao: "cadastro em conferência",
              observacao: "Contratante do caso.",
            },
          ]
        : [];

    const { data: nucleoExistente } = await supabase
      .from("nucleos_familiares")
      .select("*")
      .eq("case_id", caso.id)
      .is("archived_at", null)
      .maybeSingle();

    let nucleoId = nucleoExistente?.id as string | undefined;
    if (!nucleoId) {
      const { data: novo, error } = await supabase
        .from("nucleos_familiares")
        .insert({
          organization_id: organizationId,
          case_id: caso.id,
          nome: casoDaAna ? "Núcleo Silveira Rodrigues" : `Núcleo — ${String(caso.titulo ?? caso.codigo ?? "caso")}`,
          contratante_nome: casoDaAna ? PILOTO_ANA.nome : nomeDoCliente,
          descricao: casoDaAna ? "Adriel Felipe não integra este caso: processo separado, fora de escopo." : null,
        })
        .select("id")
        .single();
      if (error) throw new Error(`Núcleo familiar: ${error.message}`);
      nucleoId = novo.id as string;
    }

    const { data: membrosAtuais } = await supabase
      .from("nucleo_membros")
      .select("id,nome,cliente_id")
      .eq("nucleo_id", nucleoId);
    const membrosPorNome = new Map(((membrosAtuais ?? []) as Linha[]).map((m) => [String(m.nome), m]));

    const { data: clientesOrg } = await supabase
      .from("clientes")
      .select("id,nome")
      .eq("organization_id", organizationId)
      .is("archived_at", null);
    const clientes = (clientesOrg ?? []) as { id: string; nome: string }[];

    let ordem = 0;
    for (const m of membrosASemear) {
      ordem += 1;
      const existente = membrosPorNome.get(m.nome);
      const clienteId = clienteCorrespondentePorNome(m.nome, clientes);
      if (existente) {
        /*
         * 04/09/2026 — achado real (Ana Luiza): o cliente canônico foi
         * cadastrado com nome curto ("Ana Luiza") e o núcleo, dois dias
         * depois, com nome completo. O `left join` por igualdade exata na
         * migration original nunca ligou os dois; esta materialização
         * também nunca corrigia porque só inseria membro novo, nunca
         * atualizava um já existente. Agora, se o membro já existe sem
         * cliente_id e um cliente correspondente é encontrado, o vínculo é
         * completado — sem tocar em nenhum outro campo.
         */
        if (!existente.cliente_id && clienteId) {
          const { error, data: gravadasNucleo } = await supabase.from("nucleo_membros").update({ cliente_id: clienteId }).eq("id", existente.id)
    .select("id");
          exigirLinhaGravada({ error: error, data: gravadasNucleo }, "nucleo_membros");
          if (error) throw new Error(`Vínculo do requerente (${m.nome}): ${error.message}`);
        }
        continue;
      }
      const { error } = await supabase.from("nucleo_membros").insert({
        organization_id: organizationId,
        nucleo_id: nucleoId,
        cliente_id: clienteId,
        nome: m.nome,
        papel: m.papel,
        vinculo: m.signatario ? "signatário" : "dependente",
        processo: `${m.situacao}. ${m.observacao}`,
        ordem,
      });
      if (error) throw new Error(`Requerente do núcleo (${m.nome}): ${error.message}`);
    }

    return { caseId: caso.id as string };
  });

export const definirIdCanonicoPiloto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; idCanonico: string; decididoPor: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoQueEdita(supabase, context.userId as string, "decidir o ID canônico");
    const caso = await localizar(supabase, organizationId, data.caseId);
    if (!caso) throw new Error("Caso não encontrado nesta organização.");
    // O canônico é escolhido entre os identificadores do PRÓPRIO caso (código atual + históricos).
    const identificadoresDoCaso = [
      String(caso.codigo ?? ""),
      ...(((caso.ids_historicos as string[] | null) ?? []) as string[]),
    ].filter(Boolean);
    if (!identificadoresDoCaso.includes(data.idCanonico)) {
      throw new Error("O ID canônico deve ser um dos identificadores históricos preservados. Nenhum terceiro ID é criado automaticamente.");
    }
    await gravarComVerificacao({
      supabase,
      tabela: "crm_casos",
      id: data.caseId,
      organizationId,
      userId: context.userId as string,
      payload: {
        id_canonico_decidido: data.idCanonico,
        id_canonico_decidido_por: data.decididoPor,
        id_canonico_decidido_em: new Date().toISOString(),
      },
    });

    /*
      A decisão do ID canônico e o bloqueio "id_canonico_pendente" em
      piloto_bloqueios contavam o mesmo fato em duas tabelas que nunca se
      falavam: esta função decidia o ID, mas o bloqueio ficava aberto para
      sempre, e o piloto continuava lido como NO_GO por uma pendência já
      resolvida. Resolver os dois juntos é a mesma transação de decisão.
      Zero linhas aqui é um resultado válido (bloqueio já resolvido ou nunca
      existiu) — só o erro de banco é tratado como falha real.
    */
    const { error: erroBloqueio } = await supabase
      .from("piloto_bloqueios")
      .update({
        status: "resolvido",
        justificativa: `ID canônico decidido: ${data.idCanonico} (por ${data.decididoPor}).`,
      })
      .eq("case_id", data.caseId)
      .eq("chave", "id_canonico_pendente")
      .eq("status", "aberto");
    if (erroBloqueio) throw new Error(erroBloqueio.message);

    return { ok: true };
  });
