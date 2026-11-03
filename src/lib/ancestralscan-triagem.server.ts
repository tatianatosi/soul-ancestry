/**
 * P10 (25/09/2026) — Motor de Triagem AncestralScan → CRM Vivo/Mesa
 * Discovery. Camada A/B/C do servidor: importar triagem (staff, manual —
 * nunca endpoint público), criar Lead a partir dela só por ação humana
 * explícita (reusa `salvarLeadDesk`), sugerir trilha explicável e
 * aceitar/rejeitar sem nunca sobrescrever escolha humana.
 */
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { orgDoUsuario } from "@/lib/cadeia-operacional.server";
import {
  mapearTriagemParaLead,
  sugerirTrilhasDaTriagem,
  validarTriagem,
  type PayloadTriagemAncestralScan,
  type SugestaoTrilha,
  type TrilhaAtiva,
} from "@/lib/ancestralscan-triagem";

/* eslint-disable @typescript-eslint/no-explicit-any */

function payloadDaTriagem(input: Partial<PayloadTriagemAncestralScan>) {
  return {
    versao_scan: input.versaoScan,
    origem_campanha: input.origemCampanha ?? "ancestralscan",
    respondido_em: input.respondidoEm,
    consentimento_status: input.consentimentoStatus,
    consentimento_versao_aviso: input.consentimentoVersaoAviso ?? null,
    consentimento_em: input.consentimentoEm ?? null,
    paises_declarados: input.paisesDeclarados ?? [],
    geracao_declarada: input.geracaoDeclarada ?? null,
    localidade_ascendente_declarada: input.localidadeAscendenteDeclarada ?? null,
    documentos_declarados: input.documentosDeclarados ?? [],
    respostas_publicas: input.respostasPublicas ?? {},
    alertas_publicos: input.alertasPublicos ?? [],
    scores_orientativos: input.scoresOrientativos ?? {},
  };
}

function triagemDoRegistro(row: Record<string, any>): PayloadTriagemAncestralScan {
  return {
    versaoScan: row.versao_scan,
    origemCampanha: row.origem_campanha ?? null,
    respondidoEm: row.respondido_em,
    consentimentoStatus: row.consentimento_status,
    consentimentoVersaoAviso: row.consentimento_versao_aviso ?? null,
    consentimentoEm: row.consentimento_em ?? null,
    paisesDeclarados: row.paises_declarados ?? [],
    geracaoDeclarada: row.geracao_declarada ?? null,
    localidadeAscendenteDeclarada: row.localidade_ascendente_declarada ?? null,
    documentosDeclarados: row.documentos_declarados ?? [],
    respostasPublicas: row.respostas_publicas ?? {},
    alertasPublicos: row.alertas_publicos ?? [],
    scoresOrientativos: row.scores_orientativos ?? {},
  };
}

/** Camada A — importação manual (staff), nunca endpoint público. */
export async function importarTriagemAncestralScan(
  supabase: any,
  input: { userId: string; payload: Partial<PayloadTriagemAncestralScan> },
) {
  const erros = validarTriagem(input.payload);
  if (erros.length) return { ok: false as const, erros };

  const organizationId = await orgDoUsuario(supabase, input.userId);
  const resultado = await inserirComVerificacao({
    supabase,
    tabela: "ancestralscan_triagens",
    organizationId,
    userId: input.userId,
    payload: payloadDaTriagem(input.payload),
  });
  return { ok: true as const, erros: [], triagemId: resultado.id, triagem: triagemDoRegistro(resultado.registro) };
}

/** Camada B item 1 — só por ação humana explícita; nunca automático. */
export async function criarLeadDaTriagem(
  supabase: any,
  input: { userId: string; triagemId: string; nome: string },
) {
  const { data: triagemRow, error } = await supabase
    .from("ancestralscan_triagens")
    .select("*")
    .eq("id", input.triagemId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!triagemRow) throw new Error("Triagem não encontrada nesta organização.");
  if (triagemRow.lead_id) {
    return { ok: false as const, motivo: "Esta triagem já criou um lead — abra o lead existente." };
  }

  const organizationId = await orgDoUsuario(supabase, input.userId);
  const triagem = triagemDoRegistro(triagemRow);
  const patch = { ...mapearTriagemParaLead(triagem, input.nome), scan_triagem_id: input.triagemId };

  const resultado = await inserirComVerificacao({
    supabase,
    tabela: "leads",
    organizationId,
    userId: input.userId,
    payload: patch,
  });

  // Mesma trilha de auditoria de `salvarLeadDesk` (entidade "lead",
  // ação "criar_lead") — `trilhaDoLead` lê essa tabela sem distinguir
  // origem, então o lead do Scan aparece na mesma trilha de qualquer outro.
  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    user_id: input.userId,
    acao: "criar_lead",
    entidade: "lead",
    entidade_id: resultado.id,
    valores_anteriores: null,
    valores_posteriores: resultado.registro,
    metadados: { fonte: "ancestralscan-triagem", triagem_id: input.triagemId },
  });

  await gravarComVerificacao({
    supabase,
    tabela: "ancestralscan_triagens",
    id: input.triagemId,
    organizationId,
    userId: input.userId,
    payload: { lead_id: resultado.id },
  });

  return { ok: true as const, leadId: resultado.id };
}

/** Camada B item 3 — resumo de contexto, nunca conclusão. */
export async function obterTriagemDoLead(supabase: any, input: { leadId: string }) {
  const { data: lead, error: errLead } = await supabase
    .from("leads")
    .select("scan_triagem_id")
    .eq("id", input.leadId)
    .maybeSingle();
  if (errLead) throw new Error(errLead.message);
  if (!lead?.scan_triagem_id) return { existe: false as const };

  const { data: row, error } = await supabase
    .from("ancestralscan_triagens")
    .select("*")
    .eq("id", lead.scan_triagem_id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) return { existe: false as const };
  return { existe: true as const, triagem: triagemDoRegistro(row) };
}

/** Camada C — sugestão explicável a partir da triagem ligada ao lead. */
export async function sugerirTrilhasParaLead(
  supabase: any,
  input: { leadId: string; trilhasAtivas: readonly TrilhaAtiva[] },
): Promise<{ existeTriagem: boolean; sugestoes: SugestaoTrilha[] }> {
  const contexto = await obterTriagemDoLead(supabase, { leadId: input.leadId });
  if (!contexto.existe) return { existeTriagem: false, sugestoes: [] };
  return { existeTriagem: true, sugestoes: sugerirTrilhasDaTriagem(contexto.triagem, input.trilhasAtivas) };
}

/**
 * Camada C — aceitar nunca sobrescreve trilha humana já escolhida (mesma
 * regra do achado de WhatsApp em `painel-calls.tsx`). Auditoria própria.
 */
export async function aceitarSugestaoTrilha(
  supabase: any,
  input: { userId: string; leadId: string; trackId: string },
) {
  const organizationId = await orgDoUsuario(supabase, input.userId);
  const { data: lead, error } = await supabase
    .from("leads")
    .select("id,trilha_referencia_id")
    .eq("id", input.leadId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!lead) throw new Error("Lead não encontrado nesta organização.");
  if (lead.trilha_referencia_id) {
    return { ok: false as const, motivo: "Este lead já tem uma trilha escolhida — a sugestão não sobrescreve." };
  }

  await gravarComVerificacao({
    supabase,
    tabela: "leads",
    id: input.leadId,
    organizationId,
    userId: input.userId,
    payload: { trilha_referencia_id: input.trackId },
  });
  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    user_id: input.userId,
    acao: "aceitar_sugestao_trilha_scan",
    entidade: "lead",
    entidade_id: input.leadId,
    valores_anteriores: { trilha_referencia_id: null },
    valores_posteriores: { trilha_referencia_id: input.trackId },
    metadados: { fonte: "ancestralscan-triagem", track_id: input.trackId },
  });
  return { ok: true as const };
}

/** Rejeitar nunca cria/altera caso — só registra o motivo, para auditoria. */
export async function rejeitarSugestaoTrilha(
  supabase: any,
  input: { userId: string; leadId: string; trackId: string; motivo: string },
) {
  if (!input.motivo.trim()) throw new Error("Motivo é obrigatório para rejeitar uma sugestão de trilha.");
  const organizationId = await orgDoUsuario(supabase, input.userId);
  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    user_id: input.userId,
    acao: "rejeitar_sugestao_trilha_scan",
    entidade: "lead",
    entidade_id: input.leadId,
    valores_anteriores: null,
    valores_posteriores: { motivo: input.motivo.trim() },
    metadados: { fonte: "ancestralscan-triagem", track_id: input.trackId },
  });
  return { ok: true as const };
}
