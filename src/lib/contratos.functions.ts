import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gravarComVerificacao, inserirComVerificacao, exigirLinhaGravada } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
// Alias obrigatório: este arquivo já usa `linhas` como variável local.
import { linhas as linhasDe } from "@/lib/linhas";
import { cpfValido, emailValido, formatarCpf, formatarTelefone, telefoneValido } from "@/lib/validacao-pessoa";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";

/**
 * Motor contratual — camada de servidor.
 *
 * Regras invioláveis (também aplicadas por RLS e triggers no banco):
 * - organização vem sempre do usuário autenticado, nunca da interface;
 * - nenhum texto gerado é aprovado, enviado ou assinado automaticamente;
 * - versão congelada não é editada: cria-se nova versão de trabalho;
 * - arquivos ficam em bucket privado, isolados por organização, sem URL pública;
 * - envio, assinatura, cobrança, pesquisa externa e ativação exigem gatilhos próprios;
 * - sem exclusão física: apenas arquivamento com motivo, data e responsável.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type TipoInstrumento = "contract_base" | "contract_complement" | "amendment";

type Sb = { from: (t: string) => any; rpc: (f: string, a?: unknown) => any };

/** Liga ao contrato os parâmetros do Planejador ainda soltos no caso. Falha aparece: sem isto o contrato nasce sem os 22 campos e ninguém vê. */
async function religarParametrosAoContrato(supabase: Sb, caseId: string, contractId: string, userId: string) {
  const { error } = await supabase
    .from("contract_case_parameters")
    .update({ contract_id: contractId, updated_by: userId })
    .eq("case_id", caseId)
    .is("contract_id", null);
  if (error) {
    throw new Error(`O contrato foi criado, mas os parâmetros do caso não foram ligados a ele: ${error.message}`);
  }
}

async function contexto(supabase: Sb, userId: string) {
  const { data, error } = await supabase
    .from("staff_access")
    .select("organization_id,role,status")
    .eq("auth_user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.status !== "active") throw new Error("Acesso interno não autorizado.");
  return { organizationId: data.organization_id as string, papel: data.role as string };
}

const PREPARA = ["admin", "operacoes", "comercial", "financeiro"];
const JURIDICO = ["admin", "operacoes"];
const FINANCEIRO = ["admin", "financeiro"];

function exigir(papel: string, permitidos: string[], mensagem: string) {
  if (!permitidos.includes(papel)) throw new Error(mensagem);
}

/** Vocabulário de contract_review_events_event_type_check (lido de pg_constraint em 02/11/2026). */
export const TIPOS_EVENTO_REVISAO = [
  "created",
  "version_created",
  "validation_run",
  "review_requested",
  "review_started",
  "changes_requested",
  "approved_for_send",
  "send_blocked",
  "signature_recorded",
  "financial_gate_blocked",
  "activation_gate_blocked",
  "archived",
  "restored",
  "exception_created",
  "render_failed",
  "document_downloaded",
] as const;

/** Tipo aceito pelo banco; o nome específico do evento fica em metadata.tipo_original. */
export function tipoEventoDoBanco(tipo: string): (typeof TIPOS_EVENTO_REVISAO)[number] {
  if ((TIPOS_EVENTO_REVISAO as readonly string[]).includes(tipo)) {
    return tipo as (typeof TIPOS_EVENTO_REVISAO)[number];
  }
  if (tipo.includes("conflito")) return "validation_run";
  if (tipo.startsWith("render")) return "render_failed";
  if (tipo === "document_previewed") return "document_downloaded";
  return "created";
}

async function evento(
  supabase: Sb,
  organizationId: string,
  contractId: string,
  tipo: string,
  metadata: Record<string, unknown> = {},
  versionId?: string | null,
) {
  const tipoBanco = tipoEventoDoBanco(tipo);
  const { error } = await supabase.from("contract_review_events").insert({
    organization_id: organizationId,
    contract_id: contractId,
    contract_version_id: versionId ?? null,
    event_type: tipoBanco,
    metadata: tipoBanco === tipo ? metadata : { ...metadata, tipo_original: tipo },
  });
  // Antes o erro era engolido e a decisão "manter com motivo" nunca ficava registrada.
  if (error) throw new Error(`Falha ao registrar o evento do contrato: ${error.message}`);
}

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA: contract_review_events (acima) é a
// trilha interna do instrumento, nunca aparece no histórico do Caso 360.
// Blocos filhos (partes, escopo, cláusulas, anexos, fontes, exceções) só têm
// contract_id, não case_id — resolve pelo contrato para poder registrar em
// case_timeline_events também.
async function casoDoContrato(supabase: Sb, organizationId: string, contractId: string) {
  const { data, error } = await supabase
    .from("contracts")
    .select("case_id")
    .eq("id", contractId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.case_id as string | undefined) ?? null;
}

/* ============================ LEITURA ============================ */

export const listarContratos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { tipo?: string; status?: string; busca?: string; incluirArquivados?: boolean } = {}) => data)
  .handler(async ({ context, data }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);

    let q = supabase
      .from("contracts")
      .select(
        "id,contract_number,contract_type,title,status,relationship_type,case_id,client_id,parent_contract_id,financial_change_status,financial_gate_status,research_gate_status,review_owner_user_id,current_version_id,archived_at,updated_at,demo",
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (!data.incluirArquivados) q = q.is("archived_at", null);
    if (data.tipo) q = q.eq("contract_type", data.tipo);
    if (data.status) q = q.eq("status", data.status);
    if (data.busca) q = q.ilike("title", `%${data.busca}%`);

    const { data: linhas, error } = await q;
    if (error) throw new Error(error.message);
    return { papel, contratos: (linhas ?? []) as any[] };
  });

export const obterContrato = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);

    const base = { organization_id: organizationId, contract_id: data.id };
    const tabela = (nome: string, ordem: string) =>
      supabase.from(nome).select("*").match(base).order(ordem, { ascending: true });

    const [contrato, partes, escopo, clausulas, anexos, fontes, versoes, validacoes, eventos, ordens, excecoes] =
      await Promise.all([
        supabase.from("contracts").select("*").eq("organization_id", organizationId).eq("id", data.id).maybeSingle(),
        tabela("contract_parties", "display_order"),
        tabela("contract_scope_items", "display_order"),
        tabela("contract_clause_overrides", "clause_code"),
        tabela("contract_annexes", "annex_code"),
        tabela("contract_source_links", "created_at"),
        supabase
          .from("contract_versions")
          .select("*")
          .match(base)
          .order("version_number", { ascending: false }),
        supabase.from("contract_validation_results").select("*").match(base).order("severity", { ascending: true }),
        supabase
          .from("contract_review_events")
          .select("id,event_type,occurred_at,actor_user_id,metadata,contract_version_id")
          .match(base)
          .order("occurred_at", { ascending: false })
          .limit(80),
        supabase.from("service_orders").select("*").match(base).order("created_at", { ascending: false }),
        supabase.from("contract_exceptions").select("*").match(base).order("authorized_at", { ascending: false }),
      ]);

    if (!contrato.data) throw new Error("Instrumento não encontrado nesta organização.");

    let contratoBase: any = null;
    if (contrato.data.parent_contract_id) {
      const r = await supabase
        .from("contracts")
        .select("id,contract_number,title,status,contract_type")
        .eq("organization_id", organizationId)
        .eq("id", contrato.data.parent_contract_id)
        .maybeSingle();
      contratoBase = r.data ?? null;
    }

    // Parâmetros já capturados pelo Planejador para o mesmo caso — nem sempre
    // existem (nem todo contrato nasce de um caso com Planejador rodado), mas
    // quando existem precisam estar acessíveis daqui, não só por URL direta.
    const parametros = contrato.data.case_id
      ? (
          await supabase
            .from("contract_case_parameters")
            .select("id,contract_parameter_values(campo,valor)")
            .eq("organization_id", organizationId)
            .eq("case_id", contrato.data.case_id)
            .is("archived_at", null)
            .maybeSingle()
        ).data
      : null;
    const valoresParametros = (parametros as any)?.contract_parameter_values as
      | { campo: string; valor: string | null }[]
      | undefined;

    return {
      papel,
      contrato: contrato.data,
      contratoBase,
      parametrosId: (parametros?.id as string | undefined) ?? null,
      valorReferencia: valoresParametros?.find((v) => v.campo === "valor_total")?.valor ?? null,
      prazoReferencia: valoresParametros?.find((v) => v.campo === "vencimentos")?.valor ?? null,
      partes: linhasDe<any>(partes, "partes do instrumento"),
      escopo: linhasDe<any>(escopo, "itens de escopo do instrumento"),
      clausulas: linhasDe<any>(clausulas, "cláusulas do instrumento"),
      anexos: linhasDe<any>(anexos, "anexos do instrumento"),
      fontes: linhasDe<any>(fontes, "fontes vinculadas ao instrumento"),
      versoes: linhasDe<any>(versoes, "versões do instrumento"),
      validacoes: linhasDe<any>(validacoes, "validações do instrumento"),
      eventos: linhasDe<any>(eventos, "eventos de revisão do instrumento"),
      ordens: linhasDe<any>(ordens, "ordens de serviço do instrumento"),
      excecoes: linhasDe<any>(excecoes, "exceções do instrumento"),
    };
  });

/** Painel de completude: bloqueios, revisões pendentes, anexos ausentes e OSs impedidas. */
export const painelContratual = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contexto(supabase, context.userId as string);
    const org = { organization_id: organizationId };

    const [contratos, validacoes, anexos, ordens, excecoes] = await Promise.all([
      supabase
        .from("contracts")
        .select("id,contract_number,title,contract_type,status,review_owner_user_id,financial_gate_status")
        .match(org)
        .is("archived_at", null),
      supabase
        .from("contract_validation_results")
        .select("id,contract_id,validation_key,label,severity,status")
        .match(org)
        .eq("status", "open"),
      supabase
        .from("contract_annexes")
        .select("id,contract_id,annex_code,title,status,required_for_contract")
        .match(org)
        .eq("required_for_contract", true)
        .is("archived_at", null),
      supabase
        .from("service_orders")
        .select("id,contract_id,service_order_number,status,start_condition_status")
        .match(org)
        .is("archived_at", null),
      supabase.from("contract_exceptions").select("*").match(org).is("archived_at", null),
    ]);

    const listaContratos = linhasDe<any>(contratos, "instrumentos do painel contratual");
    const abertas = linhasDe<any>(validacoes, "validações abertas do painel contratual");
    const anexosPendentes = linhasDe<any>(anexos, "anexos exigidos do painel contratual").filter(
      (a) => !["ready_for_review", "approved", "attached", "not_applicable"].includes(a.status),
    );
    const ordensImpedidas = linhasDe<any>(ordens, "ordens de serviço do painel contratual").filter((o) =>
      ["draft", "pending_approval", "approved", "paused"].includes(o.status),
    );
    const agora = Date.now();

    return {
      contratos: listaContratos,
      bloqueios: abertas.filter((v) => v.severity === "blocking"),
      pendencias: abertas.filter((v) => v.severity !== "blocking"),
      revisaoPendente: listaContratos.filter((c) =>
        ["ready_for_review", "under_human_review"].includes(c.status),
      ),
      anexosAusentes: anexosPendentes,
      ordensImpedidas,
      excecoesExpiradas: linhasDe<any>(excecoes, "exceções do painel contratual").filter(
        (e) => e.expires_at && new Date(e.expires_at).getTime() < agora,
      ),
      excecoesVigentes: linhasDe<any>(excecoes, "exceções do painel contratual").filter(
        (e) => !e.revoked_at && (!e.expires_at || new Date(e.expires_at).getTime() >= agora),
      ),
    };
  });

/* ============================ ESCRITA ============================ */

export const criarInstrumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      contract_type: TipoInstrumento;
      title: string;
      purpose_summary?: string;
      parent_contract_id?: string | null;
      base_contract_reference?: string | null;
      case_id?: string | null;
      client_id?: string | null;
      template_id?: string | null;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, PREPARA, "Seu papel não permite criar instrumentos contratuais.");

    const derivado = data.contract_type !== "contract_base";
    if (data.contract_type === "contract_base" && !data.case_id) {
      throw new Error("Contrato-base precisa de um caso operacional.");
    }

    let caseId = data.case_id ?? null;
    let clientId = data.client_id ?? null;
    if (derivado && data.parent_contract_id) {
      const pai = await supabase
        .from("contracts")
        .select("case_id, client_id")
        .eq("id", data.parent_contract_id)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (pai.error) throw new Error(pai.error.message);
      caseId = caseId ?? pai.data?.case_id ?? null;
      clientId = clientId ?? pai.data?.client_id ?? null;
    }
    if (caseId && !clientId) {
      const caso = await supabase
        .from("crm_casos")
        .select("cliente_id")
        .eq("id", caseId)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (caso.error) throw new Error(caso.error.message);
      clientId = caso.data?.cliente_id ?? null;
    }

    const { data: novo, error } = await supabase
      .from("contracts")
      .insert({
        organization_id: organizationId,
        contract_number: "auto",
        contract_type: data.contract_type,
        title: data.title,
        purpose_summary: data.purpose_summary ?? null,
        parent_contract_id: derivado ? data.parent_contract_id ?? null : null,
        base_contract_reference: derivado ? data.base_contract_reference ?? null : null,
        relationship_type: derivado
          ? data.contract_type === "amendment"
            ? "amendment"
            : "complement"
          : "independent",
        case_id: caseId,
        client_id: clientId,
        template_id: data.template_id ?? null,
        status: "draft",
      })
      .select("id,contract_number")
      .single();
    if (error) throw new Error(error.message);

    // Reconecta com os parâmetros já capturados pelo Planejador para este caso
    // (contract_case_parameters), quando existirem — sem isso, o contrato-base
    // nasce desconectado de tudo que já foi validado para o caso (nome,
    // documento, endereço, valor, escopo), como aconteceu com o caso real da
    // Ana Luiza: os 22 campos existiam, só nunca foram ligados a este contrato.
    if (data.contract_type === "contract_base" && caseId) {
      await religarParametrosAoContrato(supabase, caseId, novo.id, context.userId as string);
    }

    await evento(supabase, organizationId, novo.id, "created", { tipo: data.contract_type });
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: "Instrumento contratual criado",
        summaryInternal: `${data.contract_type} — ${data.title}`,
        sourceEntityType: "contracts",
        sourceEntityId: novo.id as string,
        userId: context.userId as string,
      });
    }
    return novo as { id: string; contract_number: string };
  });

/**
 * Abre o instrumento-base (rascunho) do caso a partir do Caso 360: reaproveita
 * se já existir um `contract_base` não arquivado para o caso, nunca cria um
 * segundo em paralelo. Quando precisa criar, segue exatamente o mesmo caminho
 * de `criarInstrumento` (inclusive a reconexão de `contract_case_parameters`
 * órfãos — achado real do caso da Ana, onde os parâmetros já existiam e nunca
 * tinham sido ligados a um contrato).
 */
export const abrirContratoDoCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, PREPARA, "Seu papel não permite abrir instrumentos contratuais.");

    const { data: caso } = await supabase
      .from("crm_casos")
      .select("id,codigo,titulo,cliente_id,organization_id,archived_at,demo")
      .eq("id", data.caseId)
      .maybeSingle();
    if (!caso || caso.organization_id !== organizationId) throw new Error("Caso não encontrado nesta organização.");
    if (caso.archived_at) throw new Error("Caso arquivado: não é possível abrir contrato.");
    if (caso.demo) throw new Error("Caso de demonstração não alimenta o motor contratual real.");

    const { data: existente } = await supabase
      .from("contracts")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", caso.id)
      .eq("contract_type", "contract_base")
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existente?.id) return { id: existente.id as string, criado: false };

    const { data: novo, error } = await supabase
      .from("contracts")
      .insert({
        organization_id: organizationId,
        contract_number: "auto",
        contract_type: "contract_base",
        title: `Contrato — ${caso.titulo ?? caso.codigo}`,
        relationship_type: "independent",
        case_id: caso.id,
        client_id: caso.cliente_id ?? null,
        status: "draft",
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!novo?.id) throw new Error("O instrumento não foi criado.");

    await religarParametrosAoContrato(supabase, caso.id, novo.id, context.userId as string);

    await evento(supabase, organizationId, novo.id, "created", { tipo: "contract_base", origem: "caso_360" });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: caso.id,
      eventType: "caso",
      title: "Instrumento contratual criado",
      summaryInternal: `contract_base — Contrato — ${caso.titulo ?? caso.codigo}`,
      sourceEntityType: "contracts",
      sourceEntityId: novo.id as string,
      userId: context.userId as string,
    });
    return { id: novo.id as string, criado: true };
  });

const CAMPOS_GERAIS = [
  "title",
  "purpose_summary",
  "scope_summary",
  "exclusions_summary",
  "no_exclusions_confirmed",
  "effective_start_date",
  "effective_end_date",
  "effective_rule",
  "privacy_terms_status",
  "review_owner_user_id",
  "internal_notes",
  "base_contract_reference",
  "case_id",
  "client_id",
];
const CAMPOS_FINANCEIROS = [
  "financial_change_status",
  "external_expense_status",
  "financial_gate_status",
  "invoice_reference",
  "payment_reference",
];

export const atualizarContrato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; patch: Record<string, unknown> }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, PREPARA, "Seu papel não permite editar instrumentos.");

    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data.patch)) {
      if (CAMPOS_FINANCEIROS.includes(k)) {
        exigir(papel, FINANCEIRO, "Somente financeiro ou admin altera condições financeiras.");
        patch[k] = v;
      } else if (CAMPOS_GERAIS.includes(k)) {
        if (["scope_summary", "exclusions_summary", "no_exclusions_confirmed"].includes(k)) {
          exigir(papel, JURIDICO, "Somente operações ou admin altera escopo e exclusões.");
        }
        patch[k] = v === "" ? null : v;
      }
    }
    if (!Object.keys(patch).length) return { ok: true };

    const r = await gravarComVerificacao({
      supabase,
      tabela: "contracts",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: patch,
    });
    if (typeof patch.case_id === "string" && patch.case_id) {
      await religarParametrosAoContrato(supabase, patch.case_id, data.id, context.userId as string);
    }
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: "Contrato atualizado",
        sourceEntityType: "contracts",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

type Filho = "contract_parties" | "contract_scope_items" | "contract_clause_overrides" | "contract_annexes" | "contract_source_links";

const CAMPOS_FILHO: Record<Filho, string[]> = {
  contract_parties: [
    "role",
    "client_id",
    "person_name",
    "preferred_name",
    "document_type",
    "document_number",
    "email",
    "phone",
    "address",
    "relationship_to_case",
    "legal_capacity_status",
    "represented_by_party_id",
    "signature_required",
    "display_order",
    "active",
  ],
  contract_scope_items: [
    "category",
    "title",
    "description",
    "status",
    "source_type",
    "source_reference",
    "display_order",
    "requires_human_validation",
  ],
  contract_clause_overrides: [
    "contract_version_id",
    "clause_code",
    "clause_title",
    "action",
    "base_contract_clause_reference",
    "clause_text",
    "change_reason",
    "precedence_statement",
  ],
  contract_annexes: [
    "contract_version_id",
    "annex_code",
    "title",
    "annex_type",
    "required_for_contract",
    "status",
    "source_reference",
    "reason_not_applicable",
    "internal_notes",
  ],
  contract_source_links: ["source_type", "source_id", "source_reference", "access_level", "verified", "notes"],
};

const PAPEIS_FILHO: Record<Filho, string[]> = {
  contract_parties: ["admin", "operacoes", "comercial"],
  contract_scope_items: JURIDICO.concat("comercial"),
  contract_clause_overrides: JURIDICO,
  contract_annexes: ["admin", "operacoes", "financeiro"],
  contract_source_links: ["admin", "operacoes", "comercial", "financeiro"],
};

function sanitizarFilho(tabela: Filho, dados: Record<string, unknown>) {
  const saida: Record<string, unknown> = {};
  for (const c of CAMPOS_FILHO[tabela]) if (dados[c] !== undefined) saida[c] = dados[c] === "" ? null : dados[c];
  if (tabela === "contract_parties") validarContatoParte(saida);
  return saida;
}

/** C01 (04/11/2026): CPF, telefone e e-mail da parte passam pelos validadores canônicos antes de gravar. */
export function validarContatoParte(saida: Record<string, unknown>) {
  const tipo = String(saida["document_type"] ?? "cpf").toLowerCase();
  const doc = saida["document_number"];
  if (typeof doc === "string" && tipo === "cpf") {
    if (!cpfValido(doc)) throw new Error("CPF da parte inválido.");
    saida["document_number"] = formatarCpf(doc);
  }
  const tel = saida["phone"];
  if (typeof tel === "string") {
    if (!telefoneValido(tel)) throw new Error("Telefone da parte inválido.");
    saida["phone"] = formatarTelefone(tel);
  }
  const em = saida["email"];
  if (typeof em === "string") {
    if (!emailValido(em)) throw new Error("E-mail da parte inválido.");
    saida["email"] = em.trim().toLowerCase();
  }
}

export const salvarItemContrato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { tabela: Filho; contract_id: string; id?: string; dados: Record<string, unknown> }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, PAPEIS_FILHO[data.tabela], "Seu papel não permite alterar este bloco do instrumento.");

    const dados = sanitizarFilho(data.tabela, data.dados);
    let idGravado = data.id;
    if (data.id) {
      await gravarComVerificacao({
        supabase,
        tabela: data.tabela,
        id: data.id,
        organizationId,
        userId: context.userId as string,
        payload: dados,
      });
    } else {
      const inserido = await inserirComVerificacao({
        supabase,
        tabela: data.tabela,
        organizationId,
        userId: context.userId as string,
        payload: { ...dados, contract_id: data.contract_id },
      });
      idGravado = inserido.id;
    }
    await evento(supabase, organizationId, data.contract_id, "version_created", {
      bloco: data.tabela,
      operacao: data.id ? "atualizado" : "criado",
    });
    const caseId = await casoDoContrato(supabase, organizationId, data.contract_id);
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: `Item do contrato (${data.tabela}) ${data.id ? "atualizado" : "criado"}`,
        sourceEntityType: data.tabela,
        sourceEntityId: idGravado ?? data.contract_id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

/**
 * Fase 3 da unificação de pessoa (autorizada pela proprietária, 06/09/2026):
 * sincroniza documento (CPF) das partes do contrato a partir do cadastro
 * canônico (clientes), pelo mesmo padrão já em produção em
 * ressincronizarAnexosDoCaso — "Verificar" (confirmar: false) devolve um
 * plano, "Sincronizar" (confirmar: true) grava. Só preenche o que está
 * vazio; um valor diferente já registrado nunca é sobrescrito sozinho,
 * vira conflito para decisão humana. Nunca mexe em parte de contrato já
 * assinado.
 */
/**
 * Fase E (27/09/2026): antes de `contract_parties` congelar/enviar, um
 * conflito com o cadastro canônico não pode ficar só sinalizado para
 * sempre — a Proprietária precisa de 3 decisões explícitas, cada uma
 * exigindo motivo (auditoria, nunca automática):
 * - `atualizar_snapshot`: o contrato passa a valer o dado canônico
 *   (mesma direção do preenchimento automático, agora para um valor já
 *   preenchido e divergente).
 * - `manter_com_motivo`: o contrato mantém o valor como está; a
 *   divergência fica registrada como decisão humana aceita (não volta a
 *   aparecer como conflito enquanto nenhum dos dois lados mudar).
 * - `corrigir_pessoa_canonica`: o cadastro canônico (`clientes`) é quem
 *   está desatualizado — corrige-o com o valor do contrato (única
 *   direção inversa desta sessão; achado real da Ficha Piloto: o
 *   contrato às vezes tem dado mais completo/atual que `clientes`).
 * Nunca disponível em contrato já assinado (snapshot imutável).
 */
export type DecisaoConflitoContrato = "atualizar_snapshot" | "manter_com_motivo" | "corrigir_pessoa_canonica";

async function decisaoConflitoJaAceita(
  supabase: Sb,
  organizationId: string,
  contratoId: string,
  campo: string,
  itemId: string,
  atual: unknown,
  canonico: unknown,
) {
  const { data } = await supabase
    .from("contract_review_events")
    .select("metadata,created_at")
    .eq("organization_id", organizationId)
    .eq("contract_id", contratoId)
    .eq("event_type", "validation_run")
    .eq("metadata->>tipo_original", "conflito_mantido_com_motivo")
    .order("created_at", { ascending: false })
    .limit(50);
  return ((data ?? []) as { metadata: Record<string, unknown> }[]).some((e) => {
    const m = e.metadata ?? {};
    return (
      m["campo"] === campo &&
      m["itemId"] === itemId &&
      String(m["atual"] ?? "") === String(atual ?? "") &&
      String(m["canonico"] ?? "") === String(canonico ?? "")
    );
  });
}

export const sincronizarPessoaDoCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      caseId: string;
      confirmar?: boolean;
      resolverPartyId?: string;
      decisao?: DecisaoConflitoContrato;
      motivo?: string;
    }) => {
      if (d.resolverPartyId && !d.decisao) throw new Error("Informe a decisão para resolver o conflito de CPF.");
      if (d.resolverPartyId && !(d.motivo ?? "").trim()) {
        throw new Error("Resolver conflito de CPF exige o motivo da decisão.");
      }
      return d;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contexto(supabase, context.userId as string);
    const userId = context.userId as string;

    const { data: contrato } = await supabase
      .from("contracts")
      .select("id,signed_at,case_id")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!contrato?.id) throw new Error("Nenhum contrato vinculado a este caso.");

    const { data: partes } = await supabase
      .from("contract_parties")
      .select("id,person_name,role,document_type,document_number,client_id")
      .eq("contract_id", contrato.id)
      .is("archived_at", null);

    const clientIds = Array.from(new Set(((partes ?? []) as any[]).map((p) => p.client_id).filter(Boolean)));
    const { data: clientesRaw } = clientIds.length
      ? await supabase.from("clientes").select("id,nome,cpf").is("archived_at", null).eq("organization_id", organizationId).in("id", clientIds)
      : { data: [] as any[] };
    const clientePorId = new Map(((clientesRaw ?? []) as any[]).map((c) => [c.id, c]));
    const normalizar = (s: string) => s.replace(/\D/g, "");

    const planoBruto = await Promise.all(
      ((partes ?? []) as any[]).map(async (p) => {
        // Dependente (ex.: menor sem cadastro próprio) pode ter client_id
        // apontando para o responsável — nunca herdar o documento de outra
        // pessoa. Achado real: Felipe (dependente) tem client_id da própria
        // mãe; sincronizar por engano gravaria o CPF dela como se fosse dele.
        if (p.role === "dependent")
          return { parte: p.person_name, id: p.id, acao: "dependente_nao_sincronizado" as const };
        const cliente = p.client_id ? clientePorId.get(p.client_id) : null;
        if (!cliente?.cpf) return { parte: p.person_name, id: p.id, acao: "sem_dado_canonico" as const };
        if (p.document_number) {
          if (normalizar(String(p.document_number)) === normalizar(String(cliente.cpf))) {
            return { parte: p.person_name, id: p.id, acao: "ja_sincronizado" as const };
          }
          const aceito = await decisaoConflitoJaAceita(
            supabase,
            organizationId,
            contrato.id,
            "cpf",
            p.id,
            p.document_number,
            cliente.cpf,
          );
          return {
            parte: p.person_name,
            id: p.id,
            acao: (aceito ? "conflito_aceito" : "conflito") as "conflito" | "conflito_aceito",
            atual: p.document_number,
            canonico: cliente.cpf as string,
            clientId: p.client_id as string,
          };
        }
        return { parte: p.person_name, id: p.id, acao: "preencher" as const, cpf: cliente.cpf as string };
      }),
    );
    const plano = planoBruto;

    if (data.resolverPartyId) {
      if (contrato.signed_at) throw new Error("Contrato já assinado: partes não podem ser alteradas.");
      const alvo = plano.find((p) => p.id === data.resolverPartyId) as
        | { id: string; parte: string; acao: string; atual?: string; canonico?: string; clientId?: string }
        | undefined;
      if (!alvo || (alvo.acao !== "conflito" && alvo.acao !== "conflito_aceito")) {
        throw new Error("Esta parte não está em conflito de CPF com o cadastro canônico — nada a resolver.");
      }
      const decisao = data.decisao as DecisaoConflitoContrato;
      if (decisao === "atualizar_snapshot") {
        const r = await gravarComVerificacao({
          supabase,
          tabela: "contract_parties",
          id: alvo.id,
          organizationId,
          userId,
          payload: { document_type: "CPF", document_number: alvo.canonico },
        });
        await evento(supabase, organizationId, contrato.id, "cpf_conflito_atualizar_snapshot", {
          case_id: data.caseId,
          parteId: alvo.id,
          motivo: data.motivo?.trim(),
        });
        return { simulado: false, plano, atualizados: 1, resolvido: alvo.id, salvoEm: r.salvoEm };
      }
      if (decisao === "corrigir_pessoa_canonica") {
        if (!alvo.clientId) throw new Error("Esta parte não tem Pessoa Canônica vinculada para corrigir.");
        const r = await gravarComVerificacao({
          supabase,
          tabela: "clientes",
          id: alvo.clientId,
          organizationId,
          userId,
          payload: { cpf: alvo.atual },
        });
        await evento(supabase, organizationId, contrato.id, "cpf_conflito_corrigir_pessoa_canonica", {
          case_id: data.caseId,
          parteId: alvo.id,
          clientId: alvo.clientId,
          motivo: data.motivo?.trim(),
        });
        return { simulado: false, plano, atualizados: 1, resolvido: alvo.id, salvoEm: r.salvoEm };
      }
      // manter_com_motivo — nunca escreve; só registra a decisão aceita.
      await evento(supabase, organizationId, contrato.id, "conflito_mantido_com_motivo", {
        case_id: data.caseId,
        campo: "cpf",
        itemId: alvo.id,
        atual: alvo.atual,
        canonico: alvo.canonico,
        motivo: data.motivo?.trim(),
      });
      return { simulado: false, plano, atualizados: 0, resolvido: alvo.id };
    }

    if (!data.confirmar) return { simulado: true, plano, contratoAssinado: Boolean(contrato.signed_at) };
    if (contrato.signed_at) throw new Error("Contrato já assinado: partes não podem ser alteradas.");

    let atualizados = 0;
    for (const item of plano) {
      if (item.acao !== "preencher") continue;
      const { error, data: gravadasCpf } = await supabase
        .from("contract_parties")
        .update({ document_type: "CPF", document_number: (item as { cpf: string }).cpf })
        .eq("id", item.id)
        .select("id");
      exigirLinhaGravada({ error: error, data: gravadasCpf }, "contract_parties");
      if (error) throw new Error(error.message);
      atualizados++;
    }

    await registrarAuditoria(supabase, {
      organization_id: organizationId,
      entidade: "contract_parties",
      entidade_id: contrato.id,
      acao: "pessoa_sincronizada_do_cadastro_canonico",
      user_id: userId,
      metadados: { case_id: data.caseId, plano, atualizados },
    });

    return { simulado: false, plano, atualizados };
  });

/**
 * Fase 0 (27/09/2026) — "Prompt Canônicos": `contract_parties` é snapshot
 * documental de uma versão, nunca fonte mestre de pessoa. `sincronizarPessoaDoCaso`
 * (acima) já resolvia isso para CPF; generalizado aqui para nome/e-mail/
 * telefone e, no Corte 4 do plano de motor jurídico/Caso 360 unificado
 * (27/09/2026), também para endereço — mesma filosofia sem dedup já
 * decidida para os campos civis de `case_members` (P32b, 26/09/2026): só
 * preenche o que está vazio; um valor já preenchido e divergente vira só
 * sinal passivo, nunca um botão de sobrescrever.
 *
 * Endereço é composto a partir dos campos estruturados de `clientes`
 * (`endereco_logradouro/numero/complemento/bairro/cidade/uf/cep`) numa
 * única string formatada, comparada contra `contract_parties.address`
 * (texto livre) — nunca grava de volta nos campos estruturados, só lê.
 */
export type CampoContatoParte = "nome" | "email" | "telefone" | "endereco";
export const CAMPOS_CONTATO_PARTE_RECONCILIAVEIS: readonly CampoContatoParte[] = [
  "nome",
  "email",
  "telefone",
  "endereco",
];
export const ROTULO_CAMPO_CONTATO_PARTE: Record<CampoContatoParte, string> = {
  nome: "Nome",
  email: "E-mail",
  telefone: "Telefone",
  endereco: "Endereço",
};
const COLUNA_PARTE_CONTATO: Record<CampoContatoParte, string> = {
  nome: "person_name",
  email: "email",
  telefone: "phone",
  endereco: "address",
};
const COLUNA_CLIENTE_CONTATO: Record<CampoContatoParte, string> = {
  nome: "nome",
  email: "email",
  telefone: "telefone",
  endereco: "endereco_logradouro", // placeholder — endereço resolve por montarEnderecoCanonico, nunca por esta coluna única
};
const NORMALIZAR_CONTATO_PARTE: Record<CampoContatoParte, (s: string) => string> = {
  nome: (s) => s.trim().toLowerCase(),
  email: (s) => s.trim().toLowerCase(),
  telefone: (s) => s.replace(/\D/g, ""),
  endereco: (s) => s.trim().toLowerCase().replace(/\s+/g, " "),
};

export const COLUNAS_CLIENTE_ENDERECO = [
  "endereco_logradouro",
  "endereco_numero",
  "endereco_complemento",
  "endereco_bairro",
  "endereco_cidade",
  "endereco_uf",
  "endereco_cep",
] as const;

/**
 * Compõe uma string única a partir do endereço estruturado de `clientes`.
 * Exige ao menos logradouro, cidade e UF — sem isso, não há endereço
 * canônico suficiente para comparar (nunca inventa parte faltante).
 */
export function montarEnderecoCanonico(cliente: Record<string, unknown> | null | undefined): string | null {
  if (!cliente) return null;
  const logradouro = String(cliente["endereco_logradouro"] ?? "").trim();
  const cidade = String(cliente["endereco_cidade"] ?? "").trim();
  const uf = String(cliente["endereco_uf"] ?? "").trim();
  if (!logradouro || !cidade || !uf) return null;

  const numero = String(cliente["endereco_numero"] ?? "").trim();
  const complemento = String(cliente["endereco_complemento"] ?? "").trim();
  const bairro = String(cliente["endereco_bairro"] ?? "").trim();
  const cep = String(cliente["endereco_cep"] ?? "").trim();

  const linha1 = [logradouro, numero].filter(Boolean).join(", ") + (complemento ? ` - ${complemento}` : "");
  const linha2 = [bairro, `${cidade}/${uf}`].filter(Boolean).join(" - ");
  const partes = [linha1, linha2, cep ? `CEP ${cep}` : null].filter(Boolean);
  return partes.join(" - ");
}

export const sincronizarContatoPartesDoCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      caseId: string;
      campo: CampoContatoParte;
      confirmar?: boolean;
      resolverPartyId?: string;
      decisao?: DecisaoConflitoContrato;
      motivo?: string;
    }) => {
      if (!CAMPOS_CONTATO_PARTE_RECONCILIAVEIS.includes(d.campo)) {
        throw new Error("Campo fora da lista controlada.");
      }
      if (d.resolverPartyId && !d.decisao) throw new Error("Informe a decisão para resolver o conflito.");
      if (d.resolverPartyId && !(d.motivo ?? "").trim()) {
        throw new Error("Resolver conflito exige o motivo da decisão.");
      }
      // Endereço é composto de 7 colunas estruturadas em `clientes` — não há
      // como "corrigir a Pessoa Canônica" a partir de uma única string livre
      // do contrato sem inventar como fatiar logradouro/número/bairro/etc.
      if (d.resolverPartyId && d.decisao === "corrigir_pessoa_canonica" && d.campo === "endereco") {
        throw new Error(
          "Endereço não pode corrigir a Pessoa Canônica por aqui — edite o cadastro estruturado em Pessoa 360.",
        );
      }
      return d;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contexto(supabase, context.userId as string);
    const userId = context.userId as string;
    const campo = data.campo;
    const colunaParte = COLUNA_PARTE_CONTATO[campo];
    const colunaCliente = COLUNA_CLIENTE_CONTATO[campo];
    const normalizar = NORMALIZAR_CONTATO_PARTE[campo];
    const rotulo = ROTULO_CAMPO_CONTATO_PARTE[campo];

    const { data: contrato } = await supabase
      .from("contracts")
      .select("id,signed_at")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!contrato?.id) throw new Error("Nenhum contrato vinculado a este caso.");

    const colunasParte = Array.from(new Set(["id", "role", "client_id", "person_name", colunaParte]));
    const { data: partes } = await supabase
      .from("contract_parties")
      .select(colunasParte.join(","))
      .eq("contract_id", contrato.id)
      .is("archived_at", null);

    const clientIds = Array.from(new Set(((partes ?? []) as any[]).map((p) => p.client_id).filter(Boolean)));
    const colunasCliente =
      campo === "endereco"
        ? Array.from(new Set(["id", ...COLUNAS_CLIENTE_ENDERECO]))
        : Array.from(new Set(["id", colunaCliente]));
    const { data: clientesRaw } = clientIds.length
      ? await supabase
          .from("clientes")
          .select(colunasCliente.join(","))
          .is("archived_at", null)
          .eq("organization_id", organizationId)
          .in("id", clientIds)
      : { data: [] as any[] };
    const clientePorId = new Map(((clientesRaw ?? []) as any[]).map((c) => [c.id, c]));

    const plano = await Promise.all(
      ((partes ?? []) as any[]).map(async (p) => {
        if (p.role === "dependent") {
          return { parte: p.person_name, id: p.id, acao: "dependente_nao_sincronizado" as const };
        }
        const cliente = p.client_id ? clientePorId.get(p.client_id) : null;
        const valorCanonico = campo === "endereco" ? montarEnderecoCanonico(cliente) : (cliente?.[colunaCliente] ?? null);
        if (!valorCanonico || !String(valorCanonico).trim()) {
          return { parte: p.person_name, id: p.id, acao: "sem_dado_canonico" as const };
        }
        const atual = p[colunaParte];
        if (atual && String(atual).trim()) {
          if (normalizar(String(atual)) === normalizar(String(valorCanonico))) {
            return { parte: p.person_name, id: p.id, acao: "ja_sincronizado" as const };
          }
          const aceito = await decisaoConflitoJaAceita(
            supabase,
            organizationId,
            contrato.id,
            campo,
            p.id,
            atual,
            valorCanonico,
          );
          return {
            parte: p.person_name,
            id: p.id,
            acao: (aceito ? "conflito_aceito" : "conflito") as "conflito" | "conflito_aceito",
            atual,
            canonico: valorCanonico as string,
            clientId: p.client_id as string,
          };
        }
        return { parte: p.person_name, id: p.id, acao: "preencher" as const, valor: valorCanonico as string };
      }),
    );

    if (data.resolverPartyId) {
      if (contrato.signed_at) throw new Error("Contrato já assinado: partes não podem ser alteradas.");
      const alvo = plano.find((p) => p.id === data.resolverPartyId) as
        | { id: string; parte: string; acao: string; atual?: string; canonico?: string; clientId?: string }
        | undefined;
      if (!alvo || (alvo.acao !== "conflito" && alvo.acao !== "conflito_aceito")) {
        throw new Error("Esta parte não está em conflito neste campo — nada a resolver.");
      }
      const decisao = data.decisao as DecisaoConflitoContrato;
      if (decisao === "atualizar_snapshot") {
        const r = await gravarComVerificacao({
          supabase,
          tabela: "contract_parties",
          id: alvo.id,
          organizationId,
          userId,
          payload: { [colunaParte]: alvo.canonico },
        });
        await evento(supabase, organizationId, contrato.id, `${campo}_conflito_atualizar_snapshot`, {
          case_id: data.caseId,
          parteId: alvo.id,
          motivo: data.motivo?.trim(),
        });
        return { simulado: false, plano, atualizados: 1, resolvido: alvo.id, salvoEm: r.salvoEm };
      }
      if (decisao === "corrigir_pessoa_canonica") {
        if (!alvo.clientId) throw new Error("Esta parte não tem Pessoa Canônica vinculada para corrigir.");
        const r = await gravarComVerificacao({
          supabase,
          tabela: "clientes",
          id: alvo.clientId,
          organizationId,
          userId,
          payload: { [colunaCliente]: alvo.atual },
        });
        await evento(supabase, organizationId, contrato.id, `${campo}_conflito_corrigir_pessoa_canonica`, {
          case_id: data.caseId,
          parteId: alvo.id,
          clientId: alvo.clientId,
          motivo: data.motivo?.trim(),
        });
        return { simulado: false, plano, atualizados: 1, resolvido: alvo.id, salvoEm: r.salvoEm };
      }
      // manter_com_motivo — nunca escreve; só registra a decisão aceita.
      await evento(supabase, organizationId, contrato.id, "conflito_mantido_com_motivo", {
        case_id: data.caseId,
        campo,
        itemId: alvo.id,
        atual: alvo.atual,
        canonico: alvo.canonico,
        motivo: data.motivo?.trim(),
      });
      return { simulado: false, plano, atualizados: 0, resolvido: alvo.id };
    }

    if (!data.confirmar) return { simulado: true, plano, contratoAssinado: Boolean(contrato.signed_at) };
    if (contrato.signed_at) throw new Error("Contrato já assinado: partes não podem ser alteradas.");

    let atualizados = 0;
    for (const item of plano) {
      if (item.acao !== "preencher") continue;
      const { error, data: gravadasParte } = await supabase
        .from("contract_parties")
        .update({ [colunaParte]: (item as { valor: string }).valor })
        .eq("id", item.id)
        .select("id");
      exigirLinhaGravada({ error: error, data: gravadasParte }, "contract_parties");
      if (error) throw new Error(error.message);
      atualizados++;
    }

    await registrarAuditoria(supabase, {
      organization_id: organizationId,
      entidade: "contract_parties",
      entidade_id: contrato.id,
      acao: `${campo}_parte_sincronizado_do_cadastro_canonico`,
      user_id: userId,
      metadados: { case_id: data.caseId, campo: rotulo, plano, atualizados },
    });

    return { simulado: false, plano, atualizados };
  });

export const arquivarItemContrato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { tabela: Filho; contract_id: string; id: string; motivo: string }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, PAPEIS_FILHO[data.tabela], "Seu papel não permite arquivar este item.");
    if (!data.motivo?.trim()) throw new Error("Arquivamento exige motivo.");

    await gravarComVerificacao({
      supabase,
      tabela: data.tabela,
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: { archived_at: new Date().toISOString(), archive_reason: data.motivo },
    });
    await evento(supabase, organizationId, data.contract_id, "archived", { bloco: data.tabela });
    const caseId = await casoDoContrato(supabase, organizationId, data.contract_id);
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: `Item do contrato (${data.tabela}) arquivado`,
        summaryInternal: data.motivo,
        sourceEntityType: data.tabela,
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

/* ==================== VERSÕES, VALIDAÇÃO E REVISÃO ==================== */

/**
 * B02 (05/11/2026): leitura do instrumento e montagem do texto, compartilhada por "Nova versão"
 * (`gerarRascunhoInterno`, cria a versão seguinte) e "Salvar rascunho" (`salvarRascunhoAtual`,
 * regrava a versão de trabalho aberta). Uma montagem só, para as duas ações nunca divergirem.
 */
async function montarConteudoDoInstrumento(supabase: Sb, organizationId: string, contractId: string) {
  const data = { contract_id: contractId };
  const helpers = await import("./contratos.server");
  const base = { organization_id: organizationId, contract_id: data.contract_id };
  const [contrato, partes, escopo, clausulas, anexos, ultima] = await Promise.all([
    supabase
      .from("contracts")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("id", data.contract_id)
      .maybeSingle(),
    supabase.from("contract_parties").select("*").match(base).is("archived_at", null),
    supabase.from("contract_scope_items").select("*").match(base).is("archived_at", null),
    supabase.from("contract_clause_overrides").select("*").match(base).is("archived_at", null),
    supabase.from("contract_annexes").select("*").match(base).is("archived_at", null),
    supabase
      .from("contract_versions")
      .select("id,version_number")
      .match(base)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (!contrato.data) throw new Error("Instrumento não encontrado nesta organização.");
  if (contrato.data.status === "signed") throw new Error("Contrato assinado é imutável: use complementar ou aditivo.");

  // Achado 06/09 (CA-CONTRATO-RASCUNHO-SEM-MODELO-013): o instrumento é
  // vinculado a um contract_templates.id (contrato.data.template_id) desde a
  // criação, mas esse ID nunca era lido de volta — só gravado como rótulo em
  // contract_versions.source_template_id. O modelo real (14 cláusulas
  // completas, preâmbulo, perfil institucional, em
  // contract_templates.default_clauses) ficava 100% sem uso: quem editava o
  // contrato via UI (contract_clause_overrides vazio) sempre via "Cláusulas
  // indicadas: Pendente de preenchimento", mesmo com o modelo pronto e
  // aprovado no banco. Buscamos o modelo aqui para servir de piso textual
  // quando não há cláusula específica sobrescrita para este contrato.
  let modelo: any = null;
  if (contrato.data.template_id) {
    const r = await supabase
      .from("contract_templates")
      .select("id,name,default_clauses,status")
      .eq("organization_id", organizationId)
      .eq("id", contrato.data.template_id)
      .maybeSingle();
    modelo = r.data ?? null;
  }

  /*
    Achado 05/09 (CA-CONTRATO-OS-SEM-BLOQUEIO-SURREAL-011): esta checagem
    barrava a própria geração do RASCUNHO INTERNO — que a tela já rotula
    "não enviar/não assinar" — com requisitos que só fazem sentido para um
    ato externo. Criar/editar minuta interna precisa ser sempre possível;
    quem realmente barra envio/assinatura é aprovarParaEnvio (re-executa
    esta mesma conciliação) e tentarEtapaExterna (etapa desabilitada nesta
    fase, incondicionalmente). Aqui a pendência só passa a ser registrada —
    no evento de auditoria e devolvida ao chamador — nunca mais lançada como
    erro que impede salvar o trabalho em andamento.
  */
  let pendenciasConciliacao: string[] = [];
  {
    const { conciliacaoDoContrato } = await import("@/lib/conciliacao-catalogo.server");
    const { mensagemBloqueio } = await import("@/lib/conciliacao-catalogo");
    const conc = await conciliacaoDoContrato(supabase as any, {
      org: organizationId,
      contractId: data.contract_id,
    });
    if (conc) {
      const barra = mensagemBloqueio(conc);
      if (barra) {
        pendenciasConciliacao = conc.bloqueios;
        await evento(supabase, organizationId, data.contract_id, "render_blocked", {
          motivo: "conciliacao_catalogo",
          bloqueios: conc.bloqueios.length,
          observacao: "rascunho interno gerado mesmo assim — pendência registrada, não impeditiva",
        });
      }
    } else if (!linhasDe<any>(escopo, "itens de escopo do instrumento").length) {
      pendenciasConciliacao = ["Escopo insuficiente: o instrumento não tem proposta conciliada nem itens de escopo homologados."];
    }
  }


  let contratoBase: any = null;
  if (contrato.data.parent_contract_id) {
    const r = await supabase
      .from("contracts")
      .select("id,contract_number")
      .eq("organization_id", organizationId)
      .eq("id", contrato.data.parent_contract_id)
      .maybeSingle();
    contratoBase = r.data ?? null;
  }

  const conteudo = helpers.montarRascunho({
    contrato: contrato.data,
    partes: linhasDe<any>(partes, "partes do instrumento"),
    escopo: linhasDe<any>(escopo, "itens de escopo do instrumento"),
    clausulas: linhasDe<any>(clausulas, "cláusulas do instrumento"),
    anexos: linhasDe<any>(anexos, "anexos do instrumento"),
    contratoBase,
    modeloClausulas: modelo?.default_clauses ?? null,
    modeloStatus: modelo?.status ?? null,
  });
  return { contrato: { data: contrato.data }, ultima, conteudo, pendenciasConciliacao, helpers };
}

export const gerarRascunhoInterno = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string; change_summary?: string }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, PREPARA, "Seu papel não permite gerar rascunhos.");

    const { contrato, ultima, conteudo, pendenciasConciliacao, helpers } = await montarConteudoDoInstrumento(
      supabase,
      organizationId,
      data.contract_id,
    );

    const proxima = (ultima.data?.version_number ?? 0) + 1;

    const { data: versao, error } = await supabase
      .from("contract_versions")
      .insert({
        organization_id: organizationId,
        contract_id: data.contract_id,
        version_number: proxima,
        status: "working",
        // Mantém a representação HTML junto da versão para que a prévia interna
        // continue disponível mesmo se o arquivo privado precisar ser reprocessado.
        generated_content: conteudo,
        source_template_id: contrato.data.template_id,
        change_summary: data.change_summary ?? null,
        created_from_version_id: ultima.data?.id ?? null,
      })
      .select("id,version_number")
      .single();
    if (error) throw new Error(error.message);

    // Arquivo privado, isolado por organização e por versão. Nunca sobrescreve caminho anterior.
    let caminho: string | null = null;
    let hash: string | null = null;
    let falha: string | null = null;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      caminho = helpers.caminhoVersao(organizationId, data.contract_id, versao.version_number);
      hash = await helpers.hashConteudo(conteudo.html);
      const up = await supabaseAdmin.storage
        .from(helpers.BUCKET_CONTRATOS)
        .upload(caminho, new Blob([conteudo.html], { type: "text/html" }), { upsert: false });
      if (up.error) throw new Error(up.error.message);
      await gravarComVerificacao({
        supabase,
        tabela: "contract_versions",
        id: versao.id,
        organizationId,
        userId: context.userId as string,
        payload: { rendered_file_path: caminho, rendered_file_hash: hash },
      });
    } catch (e) {
      falha = e instanceof Error ? e.message : "falha na renderização";
      const { error: erroFalha } = await supabase
        .from("contract_versions")
        .update({ status: "validation_failed", render_error: falha })
        .eq("organization_id", organizationId)
        .eq("id", versao.id);
      if (erroFalha) falha = `${falha} (e não foi possível registrar a falha: ${erroFalha.message})`;
      await evento(supabase, organizationId, data.contract_id, "render_failed", { etapa: "upload" }, versao.id);
    }

    await gravarComVerificacao({
      supabase,
      tabela: "contracts",
      id: data.contract_id,
      organizationId,
      userId: context.userId as string,
      payload: { current_version_id: versao.id, status: "pending_data" },
    });

    await evento(
      supabase,
      organizationId,
      data.contract_id,
      "version_created",
      { versao: versao.version_number, arquivo_registrado: Boolean(caminho && !falha) },
      versao.id,
    );

    // Snapshot institucional: a versão nasce carimbada com o perfil institucional
    // persistido (estado under_legal_review). Nunca sobrescreve snapshot anterior.
    const { gravarSnapshotInstitucional } = await import("@/lib/perfil-institucional-persistido.server");
    const snapshot = await gravarSnapshotInstitucional(supabase, {
      org: organizationId,
      contractVersionId: versao.id,
      evento: "versao_contratual_criada",
      userId: context.userId as string,
    });

    if (contrato.data.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: contrato.data.case_id as string,
        eventType: "caso",
        title: `Rascunho interno do contrato gerado (versão ${versao.version_number})`,
        summaryInternal: falha ? `Falha na renderização: ${falha}` : undefined,
        sourceEntityType: "contract_versions",
        sourceEntityId: versao.id as string,
        userId: context.userId as string,
      });
    }

    return {
      versionId: versao.id as string,
      versao: versao.version_number as number,
      falhaRenderizacao: falha,
      snapshotInstitucional: snapshot,
      pendenciasConciliacao,
    };

  });

/**
 * B02 (05/11/2026): "Salvar rascunho" regrava a versão de trabalho aberta com a edição atual
 * (partes, escopo, cláusulas e anexos já salvos), sem criar número de versão. "Nova versão" continua
 * em `gerarRascunhoInterno`. Versão fechada (aprovada, congelada, substituída) não muda: o banco
 * recusa, e aqui a recusa vem antes, com o caminho certo. O arquivo vai para caminho novo — nunca
 * sobrescreve o anterior — e só depois de gravado a versão passa a apontar para ele.
 */
export const salvarRascunhoAtual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, PREPARA, "Seu papel não permite salvar rascunhos.");

    const { contrato, conteudo, pendenciasConciliacao, helpers } = await montarConteudoDoInstrumento(
      supabase,
      organizationId,
      data.contract_id,
    );
    const atualId = (contrato.data.current_version_id as string | null) ?? null;
    if (!atualId) throw new Error("Este contrato ainda não tem versão. Use “Nova versão” para criar a primeira.");

    const { data: atual, error: erroAtual } = await supabase
      .from("contract_versions")
      .select("id,version_number,status,frozen_at,archived_at")
      .eq("organization_id", organizationId)
      .eq("contract_id", data.contract_id)
      .eq("id", atualId)
      .maybeSingle();
    if (erroAtual) throw new Error(`Não foi possível ler a versão atual: ${erroAtual.message}`);
    if (!atual || atual.archived_at) throw new Error("A versão atual não foi encontrada. Use “Nova versão”.");
    if (atual.status !== "working" || atual.frozen_at) {
      throw new Error(
        `A versão ${atual.version_number} está fechada e não muda. Use “Nova versão” para registrar as alterações.`,
      );
    }

    const caminho = helpers
      .caminhoVersao(organizationId, data.contract_id, atual.version_number as number)
      .replace(/instrumento\.html$/, `rascunho-${Date.now()}.html`);
    const hash = await helpers.hashConteudo(conteudo.html);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const up = await supabaseAdmin.storage
      .from(helpers.BUCKET_CONTRATOS)
      .upload(caminho, new Blob([conteudo.html], { type: "text/html" }), { upsert: false });
    if (up.error) throw new Error(`Rascunho não salvo: o arquivo da versão falhou (${up.error.message}). Nada mudou.`);

    await gravarComVerificacao({
      supabase,
      tabela: "contract_versions",
      id: atual.id as string,
      organizationId,
      userId: context.userId as string,
      payload: { generated_content: conteudo, rendered_file_path: caminho, rendered_file_hash: hash },
    });

    await evento(
      supabase,
      organizationId,
      data.contract_id,
      "version_created",
      { versao: atual.version_number, acao: "rascunho_salvo_na_versao_atual", arquivo_registrado: true },
      atual.id as string,
    );

    if (contrato.data.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: contrato.data.case_id as string,
        eventType: "caso",
        title: `Rascunho do contrato salvo na versão ${atual.version_number}`,
        sourceEntityType: "contract_versions",
        sourceEntityId: atual.id as string,
        userId: context.userId as string,
      });
    }

    return { versionId: atual.id as string, versao: atual.version_number as number, pendenciasConciliacao };
  });

export const executarValidacoes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string; version_id?: string | null }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    await contexto(supabase, context.userId as string);
    const { data: linhas, error } = await supabase.rpc("validate_contract_readiness", {
      _contract_id: data.contract_id,
      _version_id: data.version_id ?? null,
    });
    if (error) throw new Error(error.message);
    const resultados = (linhas ?? []) as any[];
    return {
      resultados,
      bloqueios: resultados.filter((r) => r.status === "open" && r.severity === "blocking").length,
      abertas: resultados.filter((r) => r.status === "open").length,
    };
  });

export const solicitarRevisaoHumana = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, PREPARA, "Seu papel não permite solicitar revisão.");

    const { data: linhas, error } = await supabase.rpc("validate_contract_readiness", {
      _contract_id: data.contract_id,
      _version_id: null,
    });
    if (error) throw new Error(error.message);
    const bloqueios = ((linhas ?? []) as any[]).filter((r) => r.status === "open" && r.severity === "blocking");
    if (bloqueios.length) {
      await evento(supabase, organizationId, data.contract_id, "send_blocked", { bloqueios: bloqueios.length });
      return { ok: false, bloqueios: bloqueios.map((b) => b.label as string) };
    }

    const r = await gravarComVerificacao({
      supabase,
      tabela: "contracts",
      id: data.contract_id,
      organizationId,
      userId: context.userId as string,
      payload: { status: "ready_for_review" },
    });
    await evento(supabase, organizationId, data.contract_id, "review_requested", {});
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: "Revisão humana do contrato solicitada",
        sourceEntityType: "contracts",
        sourceEntityId: data.contract_id,
        userId: context.userId as string,
      });
    }
    return { ok: true, bloqueios: [] as string[] };
  });

export const registrarDecisaoRevisao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { contract_id: string; version_id: string; decisao: "approved" | "changes_requested" | "rejected"; notas?: string }) =>
      data,
  )
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, ["admin"], "Somente admin conclui a revisão humana.");

    const agora = new Date().toISOString();
    await gravarComVerificacao({
      supabase,
      tabela: "contract_versions",
      id: data.version_id,
      organizationId,
      userId: context.userId as string,
      payload: {
        review_decision: data.decisao,
        review_notes: data.notas ?? null,
        reviewed_at: agora,
        reviewed_by: context.userId,
        status: data.decisao === "approved" ? "ready_for_review" : "working",
      },
    });

    const status =
      data.decisao === "approved" ? "under_human_review" : data.decisao === "rejected" ? "rejected" : "pending_data";
    const r = await gravarComVerificacao({
      supabase,
      tabela: "contracts",
      id: data.contract_id,
      organizationId,
      userId: context.userId as string,
      payload: { status },
    });

    await evento(
      supabase,
      organizationId,
      data.contract_id,
      data.decisao === "changes_requested" ? "changes_requested" : "review_started",
      { decisao: data.decisao },
      data.version_id,
    );
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: `Decisão de revisão do contrato: ${data.decisao}`,
        summaryInternal: data.notas,
        sourceEntityType: "contract_versions",
        sourceEntityId: data.version_id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

export const aprovarParaEnvio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string; version_id: string }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, ["admin"], "Somente admin aprova instrumentos para envio futuro.");

    const [{ data: versao }, { data: linhas, error }] = await Promise.all([
      supabase
        .from("contract_versions")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("id", data.version_id)
        .maybeSingle(),
      supabase.rpc("validate_contract_readiness", { _contract_id: data.contract_id, _version_id: data.version_id }),
    ]);
    if (error) throw new Error(error.message);
    if (!versao) throw new Error("Versão não encontrada.");

    const { data: dispensas, error: erroDispensa } = await supabase.from("contract_exceptions")
      .select("id,reason,impact,expires_at")
      .eq("organization_id", organizationId).eq("contract_id", data.contract_id)
      .eq("scope", "validation_waiver").is("archived_at", null).is("revoked_at", null);
    if (erroDispensa) throw new Error(erroDispensa.message);
    const dispensa = (dispensas ?? []).find((d: { reason: string; impact: string; expires_at: string | null }) =>
      d.reason?.trim() && d.impact?.trim() && (!d.expires_at || new Date(d.expires_at).getTime() > Date.now()));
    const { impedimentosContratuais } = await import("@/lib/contrato-dispensa-documental");
    const impedimentos = impedimentosContratuais(linhas ?? [], Boolean(dispensa));
    if (versao.review_decision !== "approved") impedimentos.push("Revisão humana ainda não aprovada");
    if (!versao.rendered_file_path || !versao.rendered_file_hash)
      impedimentos.push("Arquivo privado renderizado e hash registrado");

    {
      const { conciliacaoDoContrato } = await import("@/lib/conciliacao-catalogo.server");
      const conc = await conciliacaoDoContrato(supabase as any, {
        org: organizationId,
        contractId: data.contract_id,
      });
      // Caso governado pelo Planejador: bloqueios já vêm como "Proposta Canva: …" — nunca catálogo.
      const governado = conc && "governanca" in conc;
      if (conc) for (const b of conc.bloqueios) impedimentos.push(governado ? b : `Conciliação de catálogo: ${b}`);
    }

    if (impedimentos.length) {
      await evento(supabase, organizationId, data.contract_id, "send_blocked", { itens: impedimentos.length }, data.version_id);
      return { ok: false, impedimentos };
    }

    const agora = new Date().toISOString();
    // Congelamento: garante o snapshot institucional antes de travar a versão.
    const { gravarSnapshotInstitucional } = await import("@/lib/perfil-institucional-persistido.server");
    await gravarSnapshotInstitucional(supabase, {
      org: organizationId,
      contractVersionId: data.version_id,
      evento: "versao_contratual_congelada",
      userId: context.userId as string,
    });
    await gravarComVerificacao({
      supabase,
      tabela: "contract_versions",
      id: data.version_id,
      organizationId,
      userId: context.userId as string,
      payload: { status: "approved_for_send", frozen_at: agora, frozen_by: context.userId, approved_at: agora, approved_by: context.userId },
    });

    const r = await gravarComVerificacao({
      supabase,
      tabela: "contracts",
      id: data.contract_id,
      organizationId,
      userId: context.userId as string,
      payload: { status: "approved_for_send", approved_for_send_by: context.userId, approved_for_send_at: agora },
    });
    await evento(supabase, organizationId, data.contract_id, "approved_for_send", {
      dispensa_documental_id: dispensa?.id ?? null,
      pendencias_documentais_preservadas: (linhas ?? []).filter((r: { validation_key: string; status: string }) =>
        r.status === "open" && ["annexes_required", "party_documents"].includes(r.validation_key)),
    }, data.version_id);
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: "Contrato aprovado para envio",
        sourceEntityType: "contracts",
        sourceEntityId: data.contract_id,
        userId: context.userId as string,
      });
    }
    return { ok: true, impedimentos: [] as string[] };
  });

/** Nesta fase envio e assinatura são desabilitados: a tentativa é bloqueada e auditada. */
/**
 * 30/10/2026 — "envio" deixa de ser um stub sempre recusado. Segue o mesmo
 * padrão já usado em todo o resto do app para qualquer efeito externo
 * (`communication_queue`, ver `caso-canonico.functions.ts#sincronizarProximaAcao`):
 * cria um RASCUNHO aguardando aprovação humana, nunca envia nada sozinho.
 * Nenhuma peça de e-mail/WhatsApp real existe em lugar nenhum do código —
 * é assim de propósito, não um buraco a preencher. "Assinatura", "cobrança"
 * e "pesquisa_externa" continuam sem integração: seguem recusadas.
 */
export const tentarEtapaExterna = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string; etapa: "envio" | "assinatura" | "cobranca" | "pesquisa_externa" }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);

    if (data.etapa !== "envio") {
      await evento(supabase, organizationId, data.contract_id, "send_blocked", { etapa: data.etapa, motivo: "fase_sem_integracao" });
      return {
        ok: false,
        mensagem: "Etapa desabilitada nesta fase. Assinatura, cobrança e pesquisa externa exigem configuração de integração específica.",
      };
    }
    exigir(papel, PREPARA, "Seu papel não permite preparar o envio do contrato.");

    const { data: contrato } = await supabase
      .from("contracts")
      .select("id,title,case_id,client_id,status")
      .eq("organization_id", organizationId)
      .eq("id", data.contract_id)
      .maybeSingle();
    if (!contrato) throw new Error("Instrumento não encontrado nesta organização.");
    if (contrato.status === "signed") throw new Error("Contrato assinado é imutável.");
    if (!contrato.case_id) throw new Error("Contrato sem caso vinculado: não é possível preparar o envio.");

    const { data: versoes } = await supabase
      .from("contract_versions")
      .select("version_number,status,review_decision,created_at,generated_content")
      .eq("organization_id", organizationId)
      .eq("contract_id", data.contract_id)
      .is("archived_at", null);
    const { versaoMaisRecente, diagnosticarVersaoContratual } = await import("@/lib/versao-contratual-vazia");
    const atual = versaoMaisRecente((versoes ?? []) as never[]);
    const diagnostico = diagnosticarVersaoContratual(atual);
    if (diagnostico.vazia) {
      await evento(supabase, organizationId, data.contract_id, "send_blocked", { etapa: "envio", motivo: "versao_vazia" });
      return {
        ok: false,
        mensagem: `A versão mais recente não tem texto contratual (${diagnostico.motivos.join("; ") || "ver diagnóstico"}). Gere um rascunho completo antes de preparar o envio.`,
      };
    }

    const cliente = contrato.client_id
      ? (await supabase.from("clientes").select("id,nome,email").eq("id", contrato.client_id).maybeSingle()).data
      : null;

    const nomeCliente = (cliente?.nome as string | undefined) ?? "cliente";
    const { criarRascunhoSeNaoHouver } = await import("@/lib/rascunho-comunicacao");
    const fila = await criarRascunhoSeNaoHouver(supabase, {
      organization_id: organizationId,
      case_id: contrato.case_id,
      acao_codigo: "envio_contrato",
      target_audience: "cliente",
      visibility: "cliente",
      suggested_channel: "email",
      assunto: `${contrato.title ?? "Contrato"} — pronto para envio`,
      corpo_rascunho: `Olá, ${nomeCliente}. Segue o contrato "${contrato.title ?? ""}" (v${atual?.version_number ?? "?"}) para sua análise. Qualquer dúvida, estamos à disposição.`,
      status: "awaiting_approval",
      requires_human_approval: true,
      created_by: context.userId,
      observacao_interna: cliente?.email
        ? `Rascunho criado em /contratos/${data.contract_id}. E-mail do cliente: ${cliente.email}. Envio externo depende de aprovação e ação humana — nenhum e-mail é disparado automaticamente.`
        : `Rascunho criado em /contratos/${data.contract_id}. Cliente sem e-mail cadastrado — confirme o contato antes de aprovar. Envio externo depende de aprovação e ação humana.`,
    });
    if (!fila.criado) {
      return {
        ok: true,
        rascunhoId: fila.id,
        mensagem: "Já existe um rascunho de envio aguardando aprovação na fila de comunicações deste caso — nada duplicado.",
      };
    }

    await evento(supabase, organizationId, data.contract_id, "send_drafted", { etapa: "envio", communication_queue_id: fila.id });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: contrato.case_id,
      eventType: "caso",
      title: "Rascunho de envio do contrato criado",
      summaryInternal: `Aguardando aprovação em communication_queue (${fila.id})`,
      sourceEntityType: "contracts",
      sourceEntityId: data.contract_id,
      userId: context.userId as string,
    });

    return {
      ok: true,
      rascunhoId: fila.id,
      mensagem: "Rascunho de envio criado — revise e aprove na fila de comunicações deste caso. Nenhum e-mail foi enviado ainda.",
    };
  });

export const arquivarContrato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string; motivo: string }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, ["admin", "operacoes"], "Seu papel não permite arquivar instrumentos.");
    if (!data.motivo?.trim()) throw new Error("Arquivamento exige motivo.");

    const r = await gravarComVerificacao({
      supabase,
      tabela: "contracts",
      id: data.contract_id,
      organizationId,
      userId: context.userId as string,
      payload: { status: "archived", archived_at: new Date().toISOString(), archive_reason: data.motivo },
    });
    await evento(supabase, organizationId, data.contract_id, "archived", {});
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: "Contrato arquivado",
        summaryInternal: data.motivo,
        sourceEntityType: "contracts",
        sourceEntityId: data.contract_id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

/**
 * B03 (04/11/2026): cancelar é diferente de arquivar. Cancelado = o instrumento deixou de valer para o
 * caso (status `cancelled` + `cancellation_reason`, vocabulário do CHECK contracts_status_check); o
 * registro continua na operação e no histórico. Contrato assinado não é cancelado aqui (o banco o
 * mantém imutável; o caminho é aditivo ou complemento).
 */
export const STATUS_QUE_NAO_CANCELAM = ["signed", "cancelled", "archived"] as const;

export const cancelarContrato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string; motivo: string }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, ["admin", "operacoes"], "Seu papel não permite cancelar instrumentos.");
    const motivo = data.motivo?.trim();
    if (!motivo) throw new Error("Cancelamento exige motivo.");

    const { data: atual, error } = await supabase
      .from("contracts")
      .select("id,status,case_id")
      .eq("organization_id", organizationId)
      .eq("id", data.contract_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!atual) throw new Error("Instrumento não encontrado nesta organização.");
    if ((STATUS_QUE_NAO_CANCELAM as readonly string[]).includes(atual.status)) {
      throw new Error(
        atual.status === "signed"
          ? "Contrato assinado não é cancelado: registre um aditivo ou complemento."
          : `O instrumento já está ${atual.status === "cancelled" ? "cancelado" : "arquivado"}.`,
      );
    }

    await gravarComVerificacao({
      supabase,
      tabela: "contracts",
      id: data.contract_id,
      organizationId,
      userId: context.userId as string,
      payload: { status: "cancelled", cancellation_reason: motivo },
    });
    if (atual.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: atual.case_id as string,
        eventType: "caso",
        title: "Contrato cancelado",
        summaryInternal: motivo,
        sourceEntityType: "contracts",
        sourceEntityId: data.contract_id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

/* ==================== ORDENS DE SERVIÇO E EXCEÇÕES ==================== */

export const salvarOrdemServico = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id?: string;
      contract_id: string;
      case_id?: string | null;
      scope_summary?: string;
      deliverable_summary?: string;
      status?: string;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, ["admin", "operacoes"], "Seu papel não permite preparar ordens de serviço.");
    if (data.status === "active") exigir(papel, ["admin"], "Somente admin tenta ativar uma ordem de serviço.");

    const corpo = {
      scope_summary: data.scope_summary ?? null,
      deliverable_summary: data.deliverable_summary ?? null,
      case_id: data.case_id ?? null,
      ...(data.status ? { status: data.status } : {}),
    };

    if (data.id) {
      const { data: linhaAtualizada, error } = await supabase
        .from("service_orders")
        .update(corpo)
        .eq("organization_id", organizationId)
        .eq("id", data.id)
        .select("id,case_id")
        .maybeSingle();
      if (error) return { ok: false, mensagem: error.message };
      if (!linhaAtualizada?.id) {
        return { ok: false, mensagem: "Nada foi gravado: ordem de serviço não encontrada nesta organização." };
      }
      if (data.status === "active" && linhaAtualizada.case_id) {
        await registrarTimelineCaso(supabase, {
          organizationId,
          caseId: linhaAtualizada.case_id as string,
          eventType: "caso",
          title: "Ordem de serviço ativada",
          sourceEntityType: "service_orders",
          sourceEntityId: data.id,
          userId: context.userId as string,
        });
      }
      return { ok: true, mensagem: "Ordem de serviço registrada." };
    }

    /*
     * Corte B (09/09/2026) — escritor único e idempotente. Este formulário
     * inseria direto em service_orders, sem checar OS existente nem
     * preencher proposal_id/commercial_condition_id/hash: dois caminhos
     * podiam criar duas OS para o mesmo caso. Agora chama o mesmo escritor
     * do caminho automático (emitirOuRecuperarOS), com origem="manual" —
     * localiza a OS ativa/rascunho do caso antes de inserir, ou explica a
     * pendência comercial em vez de criar uma OS solta e desvinculada.
     */
    let caseId = data.case_id ?? null;
    if (!caseId) {
      const { data: contrato } = await supabase
        .from("contracts")
        .select("case_id")
        .eq("organization_id", organizationId)
        .eq("id", data.contract_id)
        .maybeSingle();
      caseId = contrato?.case_id ?? null;
    }
    if (!caseId) {
      return { ok: false, mensagem: "Ordem de serviço exige um caso vinculado ao contrato para localizar a proposta aprovada." };
    }
    try {
      const { emitirOuRecuperarOS } = await import("@/lib/cadeia-operacional.server");
      const r = await emitirOuRecuperarOS(supabase, {
        org: organizationId,
        userId: context.userId as string,
        origem: "manual",
        caseId,
      });
      return {
        ok: true,
        mensagem: r.idempotente
          ? "Ordem de serviço já existia para este caso — reaproveitada, não duplicada."
          : "Ordem de serviço registrada.",
      };
    } catch (e) {
      return { ok: false, mensagem: e instanceof Error ? e.message : "Não foi possível registrar a ordem de serviço." };
    }
  });

export const criarExcecao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      contract_id: string;
      service_order_id?: string | null;
      scope: "financial_gate" | "activation_gate" | "validation_waiver" | "other";
      reason: string;
      impact: string;
      expires_at?: string | null;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, ["admin"], "Somente admin registra exceções.");
    if (!data.reason?.trim() || !data.impact?.trim()) throw new Error("Exceção exige motivo e impacto.");

    const { error } = await supabase.from("contract_exceptions").insert({
      organization_id: organizationId,
      contract_id: data.contract_id,
      service_order_id: data.service_order_id ?? null,
      scope: data.scope,
      reason: data.reason,
      impact: data.impact,
      authorized_by: context.userId,
      expires_at: data.expires_at ?? null,
    });
    if (error) throw new Error(error.message);
    await evento(supabase, organizationId, data.contract_id, "exception_created", { escopo: data.scope });
    const caseId = await casoDoContrato(supabase, organizationId, data.contract_id);
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: `Exceção contratual registrada (${data.scope})`,
        summaryInternal: `${data.reason} — impacto: ${data.impact}`,
        sourceEntityType: "contract_exceptions",
        sourceEntityId: data.contract_id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

/** Download interno auditado: URL assinada de curta duração, nunca registrada em log. */
export const visualizarVersaoInterna = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string; version_id: string }) => data)
  .handler(async ({ context, data }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contexto(supabase, context.userId as string);

    const { data: versao } = await supabase
      .from("contract_versions")
      .select(
        "id,contract_id,generated_content,rendered_file_path,render_error,version_number,status,institutional_profile_id,institutional_profile_snapshot",
      )
      .eq("organization_id", organizationId)
      .eq("contract_id", data.contract_id)
      .eq("id", data.version_id)
      .maybeSingle();
    if (!versao) throw new Error("Versão não encontrada neste instrumento.");

    // A prévia usa o perfil institucional efetivamente snapshotado nesta versão.
    // Se ainda não houver snapshot, ele é registrado agora pelo evento de prévia
    // — perfil persistido, nunca texto avulso.
    const perfilServer = await import("@/lib/perfil-institucional-persistido.server");
    if (!versao.institutional_profile_snapshot) {
      await perfilServer.gravarSnapshotInstitucional(supabase, {
        org: organizationId,
        contractVersionId: versao.id,
        evento: "versao_contratual_criada",
        userId: context.userId as string,
      });
      const { data: recarregada } = await supabase
        .from("contract_versions")
        .select("institutional_profile_id,institutional_profile_snapshot")
        .eq("organization_id", organizationId)
        .eq("id", versao.id)
        .maybeSingle();
      if (recarregada) {
        versao.institutional_profile_id = recarregada.institutional_profile_id;
        versao.institutional_profile_snapshot = recarregada.institutional_profile_snapshot;
      }
    }


    const persistido = versao.generated_content as { html?: unknown } | null;
    let html = typeof persistido?.html === "string" ? persistido.html : null;
    let origem: "conteudo_persistido" | "arquivo_privado" = "conteudo_persistido";

    if (!html && versao.rendered_file_path) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const helpers = await import("./contratos.server");
      const { data: arquivo, error } = await supabaseAdmin.storage
        .from(helpers.BUCKET_CONTRATOS)
        .download(versao.rendered_file_path);
      if (!error && arquivo) {
        html = await arquivo.text();
        origem = "arquivo_privado";
      }
    }

    if (!html) {
      throw new Error(
        versao.render_error
          ? `Prévia indisponível: a renderização registrada falhou (${versao.render_error}).`
          : "Prévia indisponível: esta versão legada não possui conteúdo renderizado.",
      );
    }

    const snap = (versao.institutional_profile_snapshot ?? null) as
      | { versao?: string; status?: string; capturado_em?: string; evento?: string }
      | null;

    await evento(
      supabase,
      organizationId,
      data.contract_id,
      "document_previewed",
      {
        versao: versao.version_number,
        origem,
        somente_leitura: true,
        perfil_institucional: snap?.versao ?? null,
        perfil_status: snap?.status ?? null,
      },
      versao.id,
    );
    return {
      html,
      versao: versao.version_number as number,
      status: versao.status as string,
      origem,
      rascunho: versao.status !== "approved_for_send",
      perfilInstitucional: snap
        ? {
            versao: snap.versao ?? null,
            status: snap.status ?? null,
            capturadoEm: snap.capturado_em ?? null,
            evento: snap.evento ?? null,
            habilitaAssinatura: snap.status === "vigente",
          }
        : null,
    };
  });


/** Download interno auditado: URL assinada de curta duração, nunca registrada em log. */
export const baixarVersaoInterna = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string; version_id: string }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    if (papel === "leitura") throw new Error("Papel de leitura não baixa arquivos restritos.");

    const { data: versao } = await supabase
      .from("contract_versions")
      .select("id,rendered_file_path,version_number")
      .eq("organization_id", organizationId)
      .eq("contract_id", data.contract_id)
      .eq("id", data.version_id)
      .maybeSingle();
    if (!versao?.rendered_file_path) throw new Error("Versão sem arquivo renderizado.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const helpers = await import("./contratos.server");
    const { data: assinada, error } = await supabaseAdmin.storage
      .from(helpers.BUCKET_CONTRATOS)
      .createSignedUrl(versao.rendered_file_path, 60);
    if (error || !assinada) throw new Error("Não foi possível preparar o arquivo.");

    await evento(supabase, organizationId, data.contract_id, "document_downloaded", { versao: versao.version_number }, versao.id);
    return { url: assinada.signedUrl as string };
  });

/* ==================== PANORAMA DE REVISÃO JURÍDICA ==================== */

/**
 * Consolida o checklist jurídico automático de todos os instrumentos em
 * preparação (rascunho/em revisão) da organização. Somente leitura: não grava,
 * não aprova e não executa nenhuma ação externa.
 */
export const panoramaChecklistJuridico = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { incluirDemo?: boolean } = {}) => data)
  .handler(async ({ context, data }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    const { montarChecklistJuridico } = await import("@/lib/checklist-juridico");

    let q = supabase
      .from("contracts")
      .select("id,contract_number,title,contract_type,status,case_id,client_id,demo,updated_at")
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .in("status", ["draft", "internal_review", "legal_review"])
      .order("updated_at", { ascending: true });
    if (!data.incluirDemo) q = q.or("demo.is.null,demo.eq.false");

    const { data: contratos, error } = await q;
    if (error) throw new Error(error.message);
    const lista = (contratos ?? []) as any[];
    if (lista.length === 0) return { papel, instrumentos: [] as any[] };

    const ids = lista.map((c) => c.id);
    const relacionada = async (tabela: string, campos: string) => {
      const { data: linhas, error: e } = await supabase
        .from(tabela)
        .select(campos)
        .eq("organization_id", organizationId)
        .in("contract_id", ids);
      if (e) throw new Error(e.message);
      return (linhas ?? []) as any[];
    };

    const [partes, escopo, clausulas, anexos, versoes] = await Promise.all([
      relacionada("contract_parties", "*"),
      relacionada("contract_scope_items", "*"),
      relacionada("contract_clause_overrides", "*"),
      relacionada("contract_annexes", "*"),
      relacionada("contract_versions", "*"),
    ]);

    // Valor total e vencimento não existem em `contracts` — vêm dos
    // parâmetros do Planejador vinculados (contract_case_parameters.contract_id
    // → contract_parameter_values), quando o contrato já estiver religado.
    const parametrosVinculados = await supabase
      .from("contract_case_parameters")
      .select("contract_id,contract_parameter_values(campo,valor)")
      .eq("organization_id", organizationId)
      .in("contract_id", ids);
    const referenciaPorContrato = new Map<string, { valor: string | null; prazo: string | null }>();
    for (const reg of linhasDe<any>(parametrosVinculados, "parâmetros do Planejador vinculados aos contratos")) {
      const valores = (reg.contract_parameter_values ?? []) as { campo: string; valor: string | null }[];
      referenciaPorContrato.set(reg.contract_id, {
        valor: valores.find((v) => v.campo === "valor_total")?.valor ?? null,
        prazo: valores.find((v) => v.campo === "vencimentos")?.valor ?? null,
      });
    }

    const por = (linhas: any[], id: string) => linhas.filter((l) => l.contract_id === id);

    const instrumentos = lista.map((c) => {
      const referencia = referenciaPorContrato.get(c.id);
      const resumo = montarChecklistJuridico({
        contrato: c,
        partes: por(partes, c.id),
        escopo: por(escopo, c.id),
        clausulas: por(clausulas, c.id),
        anexos: por(anexos, c.id),
        versoes: por(versoes, c.id),
        valorReferencia: referencia?.valor ?? null,
        prazoReferencia: referencia?.prazo ?? null,
      });
      return {
        id: c.id as string,
        numero: (c.contract_number ?? null) as string | null,
        titulo: (c.title ?? "Instrumento sem título") as string,
        tipo: c.contract_type as string,
        status: c.status as string,
        demo: Boolean(c.demo),
        total: resumo.total,
        conformes: resumo.conformes,
        pendentes: resumo.pendentes,
        bloqueios: resumo.bloqueios,
        apto: resumo.aptoParaRevisaoHumana,
        faltantes: resumo.itens
          .filter((i) => i.estado !== "ok")
          .map((i) => ({ chave: i.chave, label: i.label, grupo: i.grupo, estado: i.estado })),
      };
    });

    return { papel, instrumentos };
  });

/** Histórico do banco antigo guardado em `contract_history_imports` (somente leitura; a RLS libera admin/operações). */
export const historicoImportadoDoContrato = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string }) => data)
  .handler(async ({ context, data }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contexto(supabase, context.userId as string);
    const { data: linhas, error } = await supabase
      .from("contract_history_imports")
      .select("id,source_table,source_created_at,payload,import_note")
      .eq("organization_id", organizationId)
      .eq("contract_id", data.contract_id)
      .order("source_created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (linhas ?? []) as {
      id: string;
      source_table: string;
      source_created_at: string | null;
      payload: Record<string, string | number | boolean | null | object> | null;
      import_note: string | null;
    }[];
  });
