import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo, type Linha } from "@/lib/caso-canonico.server";
import { NUCLEO_PILOTO, PILOTO_ANA } from "@/lib/piloto-ana";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Caso-piloto Ana Luiza: leitura, materialização interna e decisão humana do ID canônico. */

const CODIGO_BASE = PILOTO_ANA.ids_historicos[0];

async function localizar(supabase: any, organizationId: string) {
  const { data } = await supabase
    .from("crm_casos")
    .select("*")
    .eq("organization_id", organizationId)
    .or(PILOTO_ANA.ids_historicos.map((c) => `codigo.eq.${c}`).join(","))
    .maybeSingle();
  return (data ?? null) as Linha | null;
}

export const carregarPilotoAna = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
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
    const organizationId = await organizacaoDo(supabase);
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
      await supabase
        .from("crm_casos")
        .update({
          responsavel_principal: PILOTO_ANA.responsavel,
          eixo_formalizacao: "formalizacao_em_preparacao",
          data_confirmacao_formal_proposta: PILOTO_ANA.aceite_formal_confirmado_em,
          ids_historicos: PILOTO_ANA.ids_historicos,
        })
        .eq("id", caso.id);
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
          observacao_interna: "Adriel Felipe não integra este caso: processo separado, fora de escopo.",
        })
        .select("id")
        .single();
      if (error) throw new Error(`Núcleo familiar: ${error.message}`);
      nucleoId = novo.id as string;
    }

    const { data: membrosAtuais } = await supabase.from("nucleo_membros").select("nome").eq("nucleo_id", nucleoId);
    const nomes = new Set(((membrosAtuais ?? []) as Linha[]).map((m) => String(m.nome)));
    for (const m of NUCLEO_PILOTO) {
      if (nomes.has(m.nome)) continue;
      await supabase.from("nucleo_membros").insert({
        organization_id: organizationId,
        nucleo_id: nucleoId,
        nome: m.nome,
        papel: m.papel,
        signatario: m.signatario,
        observacao_interna: `${m.situacao}. ${m.observacao}`,
      });
    }

    return { caseId: caso.id as string };
  });

export const definirIdCanonicoPiloto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; idCanonico: string; decididoPor: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    if (!PILOTO_ANA.ids_historicos.includes(data.idCanonico)) {
      throw new Error("O ID canônico deve ser um dos identificadores históricos preservados. Nenhum terceiro ID é criado automaticamente.");
    }
    const { error } = await supabase
      .from("crm_casos")
      .update({
        id_canonico_decidido: data.idCanonico,
        id_canonico_decidido_por: data.decididoPor,
        id_canonico_decidido_em: new Date().toISOString(),
      })
      .eq("id", data.caseId)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
