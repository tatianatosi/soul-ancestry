import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo, type Linha } from "@/lib/caso-canonico.server";
import { NUCLEO_PILOTO, PILOTO_ANA } from "@/lib/piloto-ana";
import { semCache } from "@/lib/no-store";
import { gravarComVerificacao } from "@/lib/persistencia.server";

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

async function localizar(supabase: any, organizationId: string) {
  const { data } = await supabase
    .from("crm_casos")
    .select("*")
    .eq("organization_id", organizationId)
    .or(CODIGOS_BUSCA_PILOTO.map((c) => `codigo.eq.${c}`).join(","))
    .maybeSingle();
  return (data ?? null) as Linha | null;
}

export const carregarPilotoAna = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const caso = await localizar(supabase, organizationId);
    if (!caso) return { caso: null, nucleos: [], membros: [], eventos: [] };
    const [nucleos, eventos] = await Promise.all([
      supabase.from("nucleos_familiares").select("*").eq("case_id", caso.id).is("archived_at", null),
      supabase.from("conversion_events").select("*").eq("case_id", caso.id).order("occurred_at", { ascending: false }),
    ]);
    const ids = ((nucleos.data ?? []) as Linha[]).map((n) => n.id);
    const membros = ids.length
      ? await supabase.from("nucleo_membros").select("*").in("nucleo_id", ids).is("archived_at", null)
      : { data: [] };
    return {
      caso,
      nucleos: (nucleos.data ?? []) as Linha[],
      membros: ((membros as any).data ?? []) as Linha[],
      eventos: (eventos.data ?? []) as Linha[],
    };
  });

/** Cria o caso-piloto e o núcleo internamente. Não dispara contrato, cobrança, assinatura nem comunicação. */
export const materializarPilotoAna = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    let caso = await localizar(supabase, organizationId);

    if (!caso) {
      const { data, error } = await supabase
        .from("crm_casos")
        .insert({
          organization_id: organizationId,
          codigo: CODIGO_BASE,
          titulo: `${PILOTO_ANA.nome} — cidadania familiar ${PILOTO_ANA.pais}`,
          pais: PILOTO_ANA.pais,
          via: PILOTO_ANA.referencia_juridica_interna,
          responsavel_principal: PILOTO_ANA.responsavel,
          eixo_comercial: "confirmacao_formal_recebida",
          eixo_formalizacao: "formalizacao_em_preparacao",
          data_confirmacao_formal_proposta: PILOTO_ANA.aceite_formal_confirmado_em,
          alias_historico: PILOTO_ANA.ids_historicos.join(" | "),
          ids_historicos: PILOTO_ANA.ids_historicos,
          resumo_interno: PILOTO_ANA.proposta_observacao,
          proposta_referencia_interna: `Proposta de referência interna: R$ ${PILOTO_ANA.proposta_referencia_valor} — ${PILOTO_ANA.proposta_referencia_participantes} participantes (evidência interna, não é cobrança).`,
        })
        .select("*")
        .single();
      if (error) throw new Error(`Não foi possível registrar o caso-piloto: ${error.message}`);
      caso = data as Linha;
    } else {
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
          nome: "Núcleo Silveira Rodrigues",
          contratante_nome: PILOTO_ANA.nome,
          descricao: "Adriel Felipe não integra este caso: processo separado, fora de escopo.",
        })
        .select("id")
        .single();
      if (error) throw new Error(`Núcleo familiar: ${error.message}`);
      nucleoId = novo.id as string;
    }

    const { data: membrosAtuais } = await supabase.from("nucleo_membros").select("nome").eq("nucleo_id", nucleoId);
    const nomes = new Set(((membrosAtuais ?? []) as Linha[]).map((m) => String(m.nome)));
    let ordem = 0;
    for (const m of NUCLEO_PILOTO) {
      ordem += 1;
      if (nomes.has(m.nome)) continue;
      await supabase.from("nucleo_membros").insert({
        organization_id: organizationId,
        nucleo_id: nucleoId,
        nome: m.nome,
        papel: m.papel,
        vinculo: m.signatario ? "signatário" : "dependente",
        processo: `${m.situacao}. ${m.observacao}`,
        ordem,
      });
    }

    return { caseId: caso.id as string };
  });

export const definirIdCanonicoPiloto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; idCanonico: string; decididoPor: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    if (!PILOTO_ANA.ids_historicos.includes(data.idCanonico)) {
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
