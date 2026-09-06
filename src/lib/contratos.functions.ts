import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gravarComVerificacao } from "@/lib/persistencia.server";
// Alias obrigatório: este arquivo já usa `linhas` como variável local.
import { linhas as linhasDe } from "@/lib/linhas";

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

async function evento(
  supabase: Sb,
  organizationId: string,
  contractId: string,
  tipo: string,
  metadata: Record<string, unknown> = {},
  versionId?: string | null,
) {
  await supabase.from("contract_review_events").insert({
    organization_id: organizationId,
    contract_id: contractId,
    contract_version_id: versionId ?? null,
    event_type: tipo,
    metadata,
  });
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
        case_id: data.case_id ?? null,
        client_id: data.client_id ?? null,
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
    if (data.contract_type === "contract_base" && data.case_id) {
      await supabase
        .from("contract_case_parameters")
        .update({ contract_id: novo.id, updated_by: context.userId })
        .eq("case_id", data.case_id)
        .is("contract_id", null);
    }

    await evento(supabase, organizationId, novo.id, "created", { tipo: data.contract_type });
    return novo as { id: string; contract_number: string };
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

    await gravarComVerificacao({
      supabase,
      tabela: "contracts",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: patch,
    });
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
  return saida;
}

export const salvarItemContrato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { tabela: Filho; contract_id: string; id?: string; dados: Record<string, unknown> }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, PAPEIS_FILHO[data.tabela], "Seu papel não permite alterar este bloco do instrumento.");

    const dados = sanitizarFilho(data.tabela, data.dados);
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
      const { error } = await supabase.from(data.tabela).insert({
        ...dados,
        organization_id: organizationId,
        contract_id: data.contract_id,
      });
      if (error) throw new Error(error.message);
    }
    await evento(supabase, organizationId, data.contract_id, "version_created", {
      bloco: data.tabela,
      operacao: data.id ? "atualizado" : "criado",
    });
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
export const sincronizarPessoaDoCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; confirmar?: boolean }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contexto(supabase, context.userId as string);

    const { data: contrato } = await supabase
      .from("contracts")
      .select("id,signed_at")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!contrato?.id) throw new Error("Nenhum contrato vinculado a este caso.");

    const { data: partes } = await supabase
      .from("contract_parties")
      .select("id,person_name,document_type,document_number,client_id")
      .eq("contract_id", contrato.id)
      .is("archived_at", null);

    const clientIds = Array.from(new Set(((partes ?? []) as any[]).map((p) => p.client_id).filter(Boolean)));
    const { data: clientesRaw } = clientIds.length
      ? await supabase.from("clientes").select("id,nome,cpf").in("id", clientIds)
      : { data: [] as any[] };
    const clientePorId = new Map(((clientesRaw ?? []) as any[]).map((c) => [c.id, c]));
    const normalizar = (s: string) => s.replace(/\D/g, "");

    const plano = ((partes ?? []) as any[]).map((p) => {
      const cliente = p.client_id ? clientePorId.get(p.client_id) : null;
      if (!cliente?.cpf) return { parte: p.person_name, id: p.id, acao: "sem_dado_canonico" as const };
      if (p.document_number) {
        return normalizar(String(p.document_number)) !== normalizar(String(cliente.cpf))
          ? { parte: p.person_name, id: p.id, acao: "conflito" as const, atual: p.document_number, canonico: cliente.cpf }
          : { parte: p.person_name, id: p.id, acao: "ja_sincronizado" as const };
      }
      return { parte: p.person_name, id: p.id, acao: "preencher" as const, cpf: cliente.cpf as string };
    });

    if (!data.confirmar) return { simulado: true, plano, contratoAssinado: Boolean(contrato.signed_at) };
    if (contrato.signed_at) throw new Error("Contrato já assinado: partes não podem ser alteradas.");

    let atualizados = 0;
    for (const item of plano) {
      if (item.acao !== "preencher") continue;
      const { error } = await supabase
        .from("contract_parties")
        .update({ document_type: "CPF", document_number: item.cpf })
        .eq("id", item.id);
      if (error) throw new Error(error.message);
      atualizados++;
    }

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "contract_parties",
      entidade_id: contrato.id,
      acao: "pessoa_sincronizada_do_cadastro_canonico",
      user_id: context.userId as string,
      metadados: { case_id: data.caseId, plano, atualizados },
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
    return { ok: true };
  });

/* ==================== VERSÕES, VALIDAÇÃO E REVISÃO ==================== */

export const gerarRascunhoInterno = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string; change_summary?: string }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    exigir(papel, PREPARA, "Seu papel não permite gerar rascunhos.");

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
    });

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

    return {
      versionId: versao.id as string,
      versao: versao.version_number as number,
      falhaRenderizacao: falha,
      snapshotInstitucional: snapshot,
      pendenciasConciliacao,
    };

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

    await gravarComVerificacao({
      supabase,
      tabela: "contracts",
      id: data.contract_id,
      organizationId,
      userId: context.userId as string,
      payload: { status: "ready_for_review" },
    });
    await evento(supabase, organizationId, data.contract_id, "review_requested", {});
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
    await gravarComVerificacao({
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

    const impedimentos: string[] = ((linhas ?? []) as any[])
      .filter((r) => r.status === "open" && ["blocking", "high"].includes(r.severity))
      .map((r) => r.label as string);
    if (versao.review_decision !== "approved") impedimentos.push("Revisão humana ainda não aprovada");
    if (!versao.rendered_file_path || !versao.rendered_file_hash)
      impedimentos.push("Arquivo privado renderizado e hash registrado");

    {
      const { conciliacaoDoContrato } = await import("@/lib/conciliacao-catalogo.server");
      const conc = await conciliacaoDoContrato(supabase as any, {
        org: organizationId,
        contractId: data.contract_id,
      });
      if (conc) for (const b of conc.bloqueios) impedimentos.push(`Conciliação de catálogo: ${b}`);
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

    await gravarComVerificacao({
      supabase,
      tabela: "contracts",
      id: data.contract_id,
      organizationId,
      userId: context.userId as string,
      payload: { status: "approved_for_send", approved_for_send_by: context.userId, approved_for_send_at: agora },
    });
    await evento(supabase, organizationId, data.contract_id, "approved_for_send", {}, data.version_id);
    return { ok: true, impedimentos: [] as string[] };
  });

/** Nesta fase envio e assinatura são desabilitados: a tentativa é bloqueada e auditada. */
export const tentarEtapaExterna = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string; etapa: "envio" | "assinatura" | "cobranca" | "pesquisa_externa" }) => data)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contexto(supabase, context.userId as string);
    await evento(supabase, organizationId, data.contract_id, "send_blocked", { etapa: data.etapa, motivo: "fase_sem_integracao" });
    return {
      ok: false,
      mensagem:
        "Etapa desabilitada nesta fase. Envio, assinatura, cobrança e pesquisa externa exigem configuração de integração e aprovação humana específica.",
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

    await gravarComVerificacao({
      supabase,
      tabela: "contracts",
      id: data.contract_id,
      organizationId,
      userId: context.userId as string,
      payload: { status: "archived", archived_at: new Date().toISOString(), archive_reason: data.motivo },
    });
    await evento(supabase, organizationId, data.contract_id, "archived", {});
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
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, mensagem: error.message };
      if (!linhaAtualizada?.id) {
        return { ok: false, mensagem: "Nada foi gravado: ordem de serviço não encontrada nesta organização." };
      }
    } else {
      const { error } = await supabase.from("service_orders").insert({
        ...corpo,
        organization_id: organizationId,
        contract_id: data.contract_id,
        service_order_number: "auto",
      });
      if (error) return { ok: false, mensagem: error.message };
    }
    return { ok: true, mensagem: "Ordem de serviço registrada." };
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
