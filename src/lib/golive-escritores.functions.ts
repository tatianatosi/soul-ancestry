/**
 * Escritores da superfície de go-live.
 *
 * Cada função aqui grava de verdade, no caso canônico, com a RLS da
 * organização valendo. Regras fixas:
 * - nada é apagado: despublicar arquiva, não remove;
 * - nenhuma tabela nova: só entidades canônicas já existentes;
 * - nenhuma cobrança, assinatura, WhatsApp ou e-mail sai daqui sozinho;
 * - pessoa nunca é fundida automaticamente: e-mail igual reaproveita,
 *   telefone igual devolve "confirmar", nome sozinho cria nova.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { CODIGO_CASO_GO_LIVE } from "@/lib/golive.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

async function contexto(supabase: any, userId: string) {
  const membro = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  const organizationId = membro.data?.organization_id as string | undefined;
  if (!organizationId) throw new Error("Usuário sem organização ativa.");

  const { data: caso } = await supabase
    .from("crm_casos")
    .select("id, cliente_id, codigo")
    .eq("organization_id", organizationId)
    .eq("codigo", CODIGO_CASO_GO_LIVE)
    .is("archived_at", null)
    .maybeSingle();
  if (!caso) throw new Error("Caso canônico do piloto não encontrado nesta organização.");

  return { organizationId, casoId: String(caso.id), clienteId: caso.cliente_id as string | null, userId };
}

function erro(r: { error: { message: string } | null }) {
  if (r.error) throw new Error(r.error.message);
}

const texto = (v: unknown) => String(v ?? "").trim();

/* ------------------------------------------------------------------ *
 * 1. Lead, Discovery e Call
 * ------------------------------------------------------------------ */

export const registrarLeadGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { nome: string; email?: string; telefone?: string; origem?: string; objetivo?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.nome)) throw new Error("Nome é obrigatório.");

    const r = await s
      .from("leads")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        nome: texto(data.nome),
        email: texto(data.email) || null,
        telefone: texto(data.telefone) || null,
        origem: texto(data.origem) || null,
        objetivo: texto(data.objetivo) || null,
        estagio: "novo",
        data_origin: "real",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

export const registrarDiscoveryGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadId: string; resultado: string; resumo: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.resumo)) throw new Error("Resumo do discovery é obrigatório.");

    erro(
      await s
        .from("leads")
        .update({
          discovery_resultado: texto(data.resultado) || null,
          estagio: "qualificado",
          updated_by: userId,
        })
        .eq("id", data.leadId)
        .eq("organization_id", organizationId),
    );

    erro(
      await s.from("crm_interactions").insert({
        organization_id: organizationId,
        case_id: casoId,
        tipo: "reuniao",
        canal: "interno",
        direcao: "saida",
        resumo_interno: texto(data.resumo),
        ocorrido_em: new Date().toISOString(),
        registrado_por: userId,
        data_origin: "real",
        visibilidade: "interna",
      }),
    );
    return { ok: true };
  });

export const registrarCallGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadId: string; resumo: string; ocorridoEm?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.resumo)) throw new Error("Resumo da call é obrigatório.");
    const quando = texto(data.ocorridoEm) || new Date().toISOString();

    erro(
      await s
        .from("leads")
        .update({ call_realizada_em: quando, resumo_call: texto(data.resumo), updated_by: userId })
        .eq("id", data.leadId)
        .eq("organization_id", organizationId),
    );

    erro(
      await s.from("crm_interactions").insert({
        organization_id: organizationId,
        case_id: casoId,
        tipo: "call",
        canal: "video",
        direcao: "saida",
        resumo_interno: texto(data.resumo),
        ocorrido_em: quando,
        registrado_por: userId,
        data_origin: "real",
        visibilidade: "interna",
      }),
    );
    return { ok: true };
  });

/* ------------------------------------------------------------------ *
 * 2. Proposta (Canva registrada à mão) e escopo
 * ------------------------------------------------------------------ */

export const registrarPropostaCanva = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      link: string;
      versao?: number;
      data?: string;
      escopo: string;
      partes?: string;
      entregas?: string;
      condicao?: string;
      valor?: number;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, clienteId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.link)) throw new Error("Link da proposta é obrigatório.");
    if (!texto(data.escopo)) throw new Error("Escopo da proposta é obrigatório.");

    const r = await s
      .from("proposals")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        client_id: clienteId,
        versao: data.versao && data.versao > 0 ? data.versao : 1,
        status: "enviada",
        escopo: texto(data.escopo),
        valor: typeof data.valor === "number" ? data.valor : null,
        moeda: "BRL",
        forma_pagamento: texto(data.condicao) || null,
        enviada_em: texto(data.data) || new Date().toISOString(),
        origem: "canva",
        origem_referencia: texto(data.link),
        deck_referencia_interna: texto(data.link),
        observacoes_internas:
          [texto(data.partes) && `Partes: ${texto(data.partes)}`, texto(data.entregas) && `Entregas: ${texto(data.entregas)}`]
            .filter(Boolean)
            .join("\n") || null,
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

export const adicionarItemEscopoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { titulo: string; categoria?: string; contratoId?: string; propostaId?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.titulo)) throw new Error("Título do item de escopo é obrigatório.");

    let contratoId = texto(data.contratoId);
    if (!contratoId) {
      const c = await s
        .from("contracts")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("case_id", casoId)
        .is("archived_at", null)
        .limit(1);
      contratoId = c.data?.[0]?.id ? String(c.data[0].id) : "";
    }
    if (!contratoId) throw new Error("Registre o contrato antes de lançar itens de escopo.");

    const r = await s
      .from("contract_scope_items")
      .insert({
        organization_id: organizationId,
        contract_id: contratoId,
        proposal_id: texto(data.propostaId) || null,
        category: texto(data.categoria) || "contracted_scope",
        title: texto(data.titulo),
        status: "included",
        source_type: texto(data.propostaId) ? "proposal" : "manual_review",
        requires_human_validation: true,
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

/* ------------------------------------------------------------------ *
 * 3. Pessoa canônica
 * ------------------------------------------------------------------ */

export const resolverPessoaGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { nome: string; email?: string; telefone?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId } = await contexto(s, context.userId as string);
    const email = texto(data.email).toLowerCase();
    const telefone = texto(data.telefone).replace(/\D/g, "");

    if (email) {
      const r = await s
        .from("clientes")
        .select("id, nome, email")
        .eq("organization_id", organizationId)
        .ilike("email", email)
        .is("archived_at", null)
        .limit(1);
      const achado = (r.data ?? [])[0];
      if (achado) {
        return { acao: "reutilizar" as const, pessoa: { id: String(achado.id), nome: String(achado.nome ?? "") } };
      }
    }

    if (telefone) {
      const r = await s
        .from("clientes")
        .select("id, nome, telefone")
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .limit(200);
      const achado = ((r.data ?? []) as Linha[]).find(
        (c) => String(c["telefone"] ?? "").replace(/\D/g, "") === telefone,
      );
      if (achado) {
        return {
          acao: "confirmar" as const,
          pessoa: { id: String(achado["id"]), nome: String(achado["nome"] ?? "") },
          motivo: "Telefone igual a uma pessoa já cadastrada. Confirme antes de seguir — nada é fundido sozinho.",
        };
      }
    }

    return { acao: "nova" as const, pessoa: null };
  });

export const registrarMembroNucleoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { nome: string; papel: "contratante_signatario" | "dependente"; base: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.nome)) throw new Error("Nome é obrigatório.");
    if (!texto(data.base))
      throw new Error("Relação familiar exige evidência ou decisão humana registrada.");

    const n = await s
      .from("nucleos_familiares")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .is("archived_at", null)
      .limit(1);
    const nucleoId = n.data?.[0]?.id ? String(n.data[0].id) : null;
    if (!nucleoId) throw new Error("Núcleo familiar do caso ainda não existe.");

    const r = await s
      .from("nucleo_membros")
      .insert({
        organization_id: organizationId,
        nucleo_id: nucleoId,
        nome: texto(data.nome),
        papel: data.papel,
        vinculo: texto(data.base),
        status_cadastral: "pendente",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

/* ------------------------------------------------------------------ *
 * 4. Ordem de serviço e onboarding
 * ------------------------------------------------------------------ */

export const registrarOrdemServicoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { numero: string; resumo: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.numero)) throw new Error("Número da OS é obrigatório.");

    const c = await s
      .from("contracts")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .is("archived_at", null)
      .limit(1);
    const contratoId = c.data?.[0]?.id ? String(c.data[0].id) : null;
    if (!contratoId) throw new Error("Registre o contrato antes da ordem de serviço.");

    const r = await s
      .from("service_orders")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        contract_id: contratoId,
        service_order_number: texto(data.numero),
        status: "draft",
        start_condition_status: "pending",
        scope_summary: texto(data.resumo) || null,
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

/** Plano de onboarding D0–D14, com marcos declarados e revisão humana pendente. */
export const criarPlanoOnboardingGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { proximaAcao?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);

    const existente = await s
      .from("case_plans")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .is("archived_at", null)
      .limit(1);
    if (existente.data?.[0]) return { id: String(existente.data[0].id), criado: false };

    const emDias = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

    const r = await s
      .from("case_plans")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        fase_jornada: "onboarding",
        marco_atual: "D0 — boas-vindas e alinhamento",
        marcos: [
          "D0 — boas-vindas e alinhamento",
          "D3 — coleta de documentos do titular",
          "D7 — mapa familiar confirmado",
          "D14 — primeira microentrega de pesquisa",
        ],
        proxima_acao: texto(data.proximaAcao) || "Confirmar documentos do titular",
        prazo_proxima_acao: emDias(3),
        status: "ativo",
        revisao_humana: "pendente",
        responsavel_user_id: userId,
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id), criado: true };
  });

/* ------------------------------------------------------------------ *
 * 5. Pesquisa: fonte, evidência, achado
 * ------------------------------------------------------------------ */

async function pesquisaDoCaso(s: any, organizationId: string, casoId: string) {
  const r = await s
    .from("research_cases")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("case_id", casoId)
    .is("archived_at", null)
    .limit(1);
  const id = r.data?.[0]?.id ? String(r.data[0].id) : null;
  if (!id) throw new Error("Este caso ainda não tem pesquisa aberta.");
  return id;
}

export const registrarFonteGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { titulo: string; instituicao?: string; tipo?: string; url?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.titulo)) throw new Error("Título da fonte é obrigatório.");
    const pesquisaId = await pesquisaDoCaso(s, organizationId, casoId);

    const r = await s
      .from("research_sources")
      .insert({
        organization_id: organizationId,
        research_case_id: pesquisaId,
        title: texto(data.titulo),
        repository_or_institution: texto(data.instituicao) || null,
        source_type: texto(data.tipo) || "registro_civil",
        url: texto(data.url) || null,
        source_status: "referenced",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

export const registrarEvidenciaGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { titulo: string; tipo?: string; fonteId?: string; descricao?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.titulo)) throw new Error("Título da evidência é obrigatório.");
    const pesquisaId = await pesquisaDoCaso(s, organizationId, casoId);

    const r = await s
      .from("research_evidence_items")
      .insert({
        organization_id: organizationId,
        research_case_id: pesquisaId,
        title: texto(data.titulo),
        evidence_type: texto(data.tipo) || "documento",
        description: texto(data.descricao) || null,
        source_id: texto(data.fonteId) || null,
        evidence_status: "collected",
        client_visibility: "interna",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

export const registrarAchadoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { titulo: string; tipo?: string; resumo?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.titulo)) throw new Error("Título do achado é obrigatório.");

    const r = await s
      .from("genealogical_findings")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        title: texto(data.titulo),
        finding_type: texto(data.tipo) || "vinculo_familiar",
        internal_summary: texto(data.resumo) || null,
        validation_status: "em_revisao",
        eligible_for_client_deliverable: false,
        responsible_user_id: userId,
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

/* ------------------------------------------------------------------ *
 * 6. Financeiro manual
 * ------------------------------------------------------------------ */

export const registrarFaturaGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { numero: string; valor: number; vencimento?: string; descricao?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, clienteId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.numero)) throw new Error("Número da fatura é obrigatório.");
    if (!(Number(data.valor) > 0)) throw new Error("Informe um valor maior que zero.");

    const r = await s
      .from("invoices")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        client_id: clienteId,
        numero: texto(data.numero),
        valor: Number(data.valor),
        moeda: "BRL",
        vencimento: texto(data.vencimento) || null,
        descricao: texto(data.descricao) || null,
        status: "emitida",
        emitida_em: new Date().toISOString(),
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

export const registrarPagamentoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { faturaId: string; valor: number; metodo?: string; pagoEm?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, userId } = await contexto(s, context.userId as string);
    if (!(Number(data.valor) > 0)) throw new Error("Informe um valor maior que zero.");
    const quando = texto(data.pagoEm) || new Date().toISOString();

    const r = await s
      .from("payments")
      .insert({
        organization_id: organizationId,
        invoice_id: data.faturaId,
        valor: Number(data.valor),
        moeda: "BRL",
        metodo: texto(data.metodo) || "manual",
        pago_em: quando,
        status: "confirmado",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);

    erro(
      await s
        .from("invoices")
        .update({ status: "paga", valor_pago: Number(data.valor), paga_em: quando, updated_by: userId })
        .eq("id", data.faturaId)
        .eq("organization_id", organizationId),
    );
    return { id: String(r.data.id) };
  });

/* ------------------------------------------------------------------ *
 * 7. Microentrega, revisão e publicação
 * ------------------------------------------------------------------ */

export const criarMicroentregaGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { titulo: string; fase?: string; prazo?: string; descricao?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.titulo)) throw new Error("Título da microentrega é obrigatório.");

    const r = await s
      .from("ops_microentregas")
      .insert({
        organization_id: organizationId,
        caso_id: casoId,
        titulo: texto(data.titulo),
        descricao: texto(data.descricao) || null,
        fase: texto(data.fase) || "pesquisa_inicial",
        prazo: texto(data.prazo) || null,
        status: "pendente",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

export const aprovarMicroentregaGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; evidencia?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, userId } = await contexto(s, context.userId as string);

    erro(
      await s
        .from("ops_microentregas")
        .update({
          status: "concluida",
          concluida_em: new Date().toISOString(),
          concluida_por: userId,
          evidencia_descricao: texto(data.evidencia) || null,
          justificativa_sem_evidencia: texto(data.evidencia) ? null : "Revisão humana registrada no shell de go-live.",
          updated_by: userId,
        })
        .eq("id", data.id)
        .eq("organization_id", organizationId),
    );
    return { ok: true };
  });

/** Publica um conteúdo já sanitizado no App do cliente, com autor e data. */
export const publicarNoAppGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { microentregaId: string; resumoSanitizado: string; tipo?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.resumoSanitizado)) throw new Error("Escreva o texto que o cliente vai ler.");

    const agora = new Date().toISOString();
    const r = await s
      .from("app_projections")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        source_entity_type: "ops_microentregas",
        source_entity_id: data.microentregaId,
        projection_type: texto(data.tipo) || "microentrega",
        destination: "app_cliente",
        content_sanitized: texto(data.resumoSanitizado),
        approval_status: "published",
        approved_by: userId,
        approved_at: agora,
        effective_from: agora,
        visibility_scope: "titular",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

/** Despublicar arquiva a projeção com motivo — o histórico permanece. */
export const despublicarDoAppGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.motivo)) throw new Error("Informe o motivo de despublicar.");

    erro(
      await s
        .from("app_projections")
        .update({
          approval_status: "archived",
          archived_at: new Date().toISOString(),
          archived_reason: texto(data.motivo),
          updated_by: userId,
        })
        .eq("id", data.id)
        .eq("organization_id", organizationId),
    );
    return { ok: true };
  });
