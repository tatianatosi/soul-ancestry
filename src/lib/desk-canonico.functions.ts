import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  eventoSensivel,
  proximaAcaoPadrao,
  validarConversa,
  validarEvento,
  type EventoFunil,
  type TipoConversa,
} from "@/lib/desk-canonico";

/* eslint-disable @typescript-eslint/no-explicit-any */

const UUID = /^[0-9a-f-]{36}$/i;
const opcionalUuid = (v: unknown) => (UUID.test(String(v ?? "")) ? String(v) : null);
const exigirUuid = (v: unknown, campo: string) => {
  if (!UUID.test(String(v ?? ""))) throw new Error(`${campo} inválido.`);
  return String(v);
};

/** Tipos canônicos do Desk mapeados para a lista física já existente em crm_interactions. */
const TIPO_FISICO: Record<TipoConversa, string> = {
  whatsapp_registrado: "whatsapp",
  call: "call",
  reuniao: "reuniao",
  email_registrado: "email",
  transcricao_resumida: "outro",
  nota_interna: "sistema",
};

async function orgDoUsuario(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}

/* ------------------------------ Contatos ------------------------------ */

export const listarContatosCanonicos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const { data, error } = await supabase
      .from("contacts")
      .select("id,nome,email,telefone,origem,origem_detalhe,responsavel_user_id,status,created_at,archived_at")
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as any[];
  });

/* --------------------------- Oportunidades --------------------------- */

export const listarOportunidadesCanonicas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const { data, error } = await supabase
      .from("opportunities")
      .select(
        "id,contact_id,case_id,objetivo_declarado,pais_linha_prioritaria,via_preliminar,etapa_comercial,responsavel_user_id,responsavel_nome,proxima_acao,prazo_proxima_acao,resumo_interno,created_at,archived_at",
      )
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as any[];
  });

/* ------------------------------ Conversas ----------------------------- */

export const listarConversasCanonicas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { contactId?: string | null; opportunityId?: string | null; caseId?: string | null } | undefined) => d ?? {})
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    let q = supabase
      .from("crm_interactions")
      .select(
        "id,tipo,canal,direcao,ocorrido_em,resumo_interno,proxima_acao,prazo_proxima_acao,contact_id,opportunity_id,case_id,corrige_interacao_id,origem_referencia_interna,registrado_por,created_at",
      )
      .order("ocorrido_em", { ascending: false })
      .limit(300);
    if (data.contactId) q = q.eq("contact_id", data.contactId);
    if (data.opportunityId) q = q.eq("opportunity_id", data.opportunityId);
    if (data.caseId) q = q.eq("case_id", data.caseId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as any[];
  });

/**
 * Registra uma conversa interna. Nunca envia mensagem, nunca cria aceite,
 * contrato, cobrança ou onboarding. Correção só por novo registro.
 */
export const registrarConversa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      tipo: string;
      direcao?: string | null;
      ocorreu_em: string;
      resumo_validado: string;
      proxima_acao: string;
      prazo_proxima_acao: string;
      referencia_interna?: string | null;
      contact_id?: string | null;
      opportunity_id?: string | null;
      case_id?: string | null;
      supersedes_conversation_id?: string | null;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;

    const erros = validarConversa({ ...data, responsavel_user_id: userId });
    if (erros.length) return { ok: false as const, erros };

    const organization_id = await orgDoUsuario(supabase, userId);
    const tipo = data.tipo as TipoConversa;

    const { data: row, error } = await supabase
      .from("crm_interactions")
      .insert({
        organization_id,
        tipo: TIPO_FISICO[tipo],
        canal: tipo,
        direcao: data.direcao ?? "internal",
        ocorrido_em: data.ocorreu_em,
        resumo_interno: data.resumo_validado.trim(),
        proxima_acao: data.proxima_acao.trim(),
        prazo_proxima_acao: data.prazo_proxima_acao,
        origem: "desk_intelligence",
        origem_referencia_interna: data.referencia_interna?.trim() || null,
        contact_id: opcionalUuid(data.contact_id),
        opportunity_id: opcionalUuid(data.opportunity_id),
        case_id: opcionalUuid(data.case_id),
        corrige_interacao_id: opcionalUuid(data.supersedes_conversation_id),
        visibilidade: "interna",
        data_origin: "real",
        registrado_por: userId,
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { ok: true as const, erros: [], id: row?.id as string | undefined };
  });

/* --------------------------- Eventos de funil -------------------------- */

export const listarEventosFunil = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { contactId?: string | null; opportunityId?: string | null; caseId?: string | null } | undefined) => d ?? {})
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    let q = supabase
      .from("conversion_events")
      .select("id,event_type,occurred_at,responsavel,responsavel_id,evidencia_referencia,observacao,contact_id,opportunity_id,case_id,created_at")
      .order("occurred_at", { ascending: false })
      .limit(300);
    if (data.contactId) q = q.eq("contact_id", data.contactId);
    if (data.opportunityId) q = q.eq("opportunity_id", data.opportunityId);
    if (data.caseId) q = q.eq("case_id", data.caseId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as any[];
  });

/**
 * Botão controlado de evento de funil: tipo manual, responsável, data/hora,
 * referência interna e confirmação humana para eventos sensíveis.
 * Não dispara nenhuma ação externa nem cria contrato, cobrança ou onboarding.
 */
export const registrarEventoFunil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      tipo_evento: string;
      ocorreu_em: string;
      evidencia_referencia_interna: string;
      observacao_interna?: string | null;
      confirmado?: boolean;
      contact_id?: string | null;
      opportunity_id?: string | null;
      case_id?: string | null;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;

    const erros = validarEvento({ ...data, responsavel_user_id: userId });
    if (erros.length) return { ok: false as const, erros };

    const organization_id = await orgDoUsuario(supabase, userId);
    const tipo = data.tipo_evento as EventoFunil;

    const { data: row, error } = await supabase
      .from("conversion_events")
      .insert({
        organization_id,
        event_type: tipo,
        occurred_at: data.ocorreu_em,
        responsavel_id: userId,
        evidencia_referencia: data.evidencia_referencia_interna.trim(),
        observacao: data.observacao_interna?.trim() || null,
        contact_id: opcionalUuid(data.contact_id),
        opportunity_id: opcionalUuid(data.opportunity_id),
        case_id: opcionalUuid(data.case_id),
        origem: "desk_intelligence",
        created_by: userId,
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);

    // Efeito permitido: apenas atualizar a próxima ação interna da oportunidade.
    const opportunityId = opcionalUuid(data.opportunity_id);
    if (opportunityId) {
      const prazo = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
      await supabase
        .from("opportunities")
        .update({ proxima_acao: proximaAcaoPadrao(tipo), prazo_proxima_acao: prazo, updated_by: userId })
        .eq("id", opportunityId)
        .is("archived_at", null);
    }

    return {
      ok: true as const,
      erros: [],
      id: row?.id as string | undefined,
      sensivel: eventoSensivel(tipo),
      proximaAcao: proximaAcaoPadrao(tipo),
    };
  });
