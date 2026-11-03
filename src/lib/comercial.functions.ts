import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  contextoInterno,
  exigirPapel,
  limpar,
  PAPEIS_COMERCIAL,
  PAPEIS_DEMO_VISIVEL,
  TEM_MARCA_TESTE,
  PAPEIS_FINANCEIRO,
  RECURSOS,
  validarFluxo,
  type Recurso,
  type Sb,
} from "@/lib/comercial.server";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { calcularResumoFinanceiroCaso, type ResumoFinanceiroCaso } from "@/lib/financeiro-caso";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Lista um recurso comercial/financeiro com filtro por status.
 *  Registros DEMO/TESTE (dados_teste = true) ficam fora por padrão — inclusive quando
 *  a marca está na entidade relacionada (fatura de um pagamento). Só perfis internos
 *  autorizados podem pedir a inclusão explícita com incluirDemos. */
export const listarComercial = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    recurso: Recurso;
    status?: string;
    incluirArquivados?: boolean;
    apenasArquivados?: boolean;
    incluirDemos?: boolean;
  }) => {
    if (!RECURSOS.includes(data.recurso)) throw new Error("Recurso inválido.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    if (data.recurso === "invoices" || data.recurso === "payments") {
      exigirPapel(papel, [...PAPEIS_FINANCEIRO, "operacoes", "leitura"], "Sem acesso financeiro.");
    }
    const incluirDemos = data.incluirDemos === true && PAPEIS_DEMO_VISIVEL.includes(papel);
    // Auditoria da tentativa bloqueada de trazer dado TESTE para leitura operacional.
    // Registra apenas metadados (recurso e papel); nenhum conteúdo sensível é gravado.
    if (data.incluirDemos === true && !incluirDemos) {
      await registrarAuditoria(supabase, {
        organization_id: organizationId,
        user_id: context.userId as string,
        entidade: data.recurso,
        acao: "leitura_demo_bloqueada",
        metadados: { papel, motivo: "papel sem permissão para incluir demonstrações" },
      } as never);
    }
    let q = supabase
      .from(data.recurso)
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });
    if (data.status) q = q.eq("status", data.status);
    if (data.apenasArquivados) q = q.not("archived_at", "is", null);
    else if (!data.incluirArquivados) q = q.is("archived_at", null);
    if (!incluirDemos && TEM_MARCA_TESTE.includes(data.recurso)) q = q.or("dados_teste.is.null,dados_teste.eq.false");

    const { data: linhas, error } = await q;
    if (error) throw new Error(error.message);
    let saida = (linhas ?? []) as Record<string, any>[];

    // Defesa em profundidade: a marca de origem também vale quando está na entidade relacionada
    // (cliente demonstrativo ou fatura demonstrativa). Nada é alterado no banco, apenas ocultado.
    if (!incluirDemos && saida.length > 0) {
      const clientesDemo = new Set<string>();
      const { data: cli } = await supabase
        .from("clientes")
        .select("id,is_demo")
        .eq("organization_id", organizationId)
        .eq("is_demo", true);
      for (const c of (cli ?? []) as { id: string }[]) clientesDemo.add(c.id);

      if (data.recurso === "invoices" || data.recurso === "proposals") {
        saida = saida.filter((l) => !clientesDemo.has(String(l["client_id"])));
      }
      if (data.recurso === "payments") {
        const ids = [...new Set(saida.map((l) => l["invoice_id"]).filter(Boolean))];
        if (ids.length > 0) {
          const { data: faturas } = await supabase
            .from("invoices")
            .select("id,dados_teste,client_id")
            .eq("organization_id", organizationId)
            .in("id", ids);
          const demos = new Set(
            ((faturas ?? []) as { id: string; dados_teste: boolean | null; client_id: string | null }[])
              .filter((f) => f.dados_teste === true || (f.client_id ? clientesDemo.has(f.client_id) : false))
              .map((f) => f.id),
          );
          saida = saida.filter((l) => !demos.has(String(l["invoice_id"])));
        }
      }
    }
    return saida;
  });

/**
 * Despesas de terceiro (emolumentos, certidões, apostilamentos, traduções),
 * agregadas por toda a organização — autorizado pela Proprietária em
 * 13/10/2026 para o KPI "Obrigações e parcelas" do Financeiro V4. Mesma
 * tabela e colunas já lidas por `obterResumoFinanceiroCaso` (id, estado,
 * valor_pago), só sem o filtro `case_id` de um caso único.
 */
export const listarDespesasTerceiros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, [...PAPEIS_FINANCEIRO, "operacoes", "leitura"], "Sem acesso financeiro.");
    const { data, error } = await supabase
      .from("third_party_expenses")
      .select("id,case_id,categoria,estado,valor_pago")
      .eq("organization_id", organizationId)
      .is("archived_at", null);
    if (error) throw new Error(error.message);
    return (data ?? []) as { id: string; case_id: string | null; categoria: string | null; estado: string; valor_pago: number | null }[];
  });

/**
 * Investimento em marketing, somado por toda a organização — mesma tabela
 * (`marketing_investments`) já lida por `carregarConversao` (conversao.
 * functions.ts) para a tela de Marketing, aqui só o total agregado para o
 * KPI "Investimento em Marketing" do Comercial V4 (Proprietária,
 * 13/10/2026), sem repetir os 2000 eventos de conversão daquela leitura.
 */
export const totalInvestimentoMarketing = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoInterno(supabase, context.userId as string);
    const { data, error } = await supabase
      .from("marketing_investments")
      .select("valor")
      .eq("organization_id", organizationId)
      .is("archived_at", null);
    if (error) throw new Error(error.message);
    const linhas = (data ?? []) as { valor: number | null }[];
    return { total: linhas.reduce((soma, l) => soma + (l.valor ?? 0), 0), lancamentos: linhas.length };
  });

/** Catálogos auxiliares (clientes, casos, contratos, faturas, equipe ativa) para vínculos e rótulos. */
export const listarVinculos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoInterno(supabase, context.userId as string);
    const [clientes, casos, contratos, faturas, propostas, equipe] = await Promise.all([
      supabase.from("clientes").select("id,nome,is_demo").eq("organization_id", organizationId).is("archived_at", null),
      supabase.from("crm_casos").select("id,codigo,titulo").eq("organization_id", organizationId).is("archived_at", null),
      supabase
        .from("contracts")
        .select("id,contract_number,title,status")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("invoices")
        .select("id,numero,valor,moeda,status")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("proposals")
        .select("id,versao,status,client_id")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      // Só para popular o seletor de responsável (ex.: ordens de serviço) —
      // reusa staff_access, não é gestão de equipe (isso continua em equipe.functions.ts).
      supabase
        .from("staff_access")
        .select("auth_user_id,full_name,email")
        .eq("status", "active")
        .is("archived_at", null),
    ]);
    return {
      clientes: (clientes.data ?? []) as { id: string; nome: string }[],
      casos: (casos.data ?? []) as { id: string; codigo: string | null; titulo: string }[],
      contratos: (contratos.data ?? []) as { id: string; contract_number: string; title: string; status: string }[],
      faturas: (faturas.data ?? []) as { id: string; numero: string | null; valor: number; moeda: string; status: string }[],
      propostas: (propostas.data ?? []) as { id: string; versao: number; status: string; client_id: string | null }[],
      equipe: ((equipe.data ?? []) as { auth_user_id: string | null; full_name: string | null; email: string }[])
        .filter((m) => m.auth_user_id)
        .map((m) => ({ authUserId: m.auth_user_id as string, nome: m.full_name ?? m.email })),
    };
  });

/**
 * Proposta Canva real do cliente do caso (a mais recente não arquivada), com
 * completude de extração das páginas 1–7. Substitui o antigo campo livre
 * "Proposta (referência interna)" — só existe conteúdo aqui quando há
 * proposta real vinculada; nunca texto digitado à mão.
 */
export const obterPropostaCanvaDoCliente = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { clienteId: string }) => {
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoInterno(supabase, context.userId as string);
    const { data: proposta } = await supabase
      .from("proposals")
      .select("id,versao,status,valor,moeda,validade,enviada_em,aprovada_em,created_at")
      .eq("organization_id", organizationId)
      .eq("client_id", data.clienteId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!proposta) return { proposta: null, paginasExtraidas: 0 };
    const { data: paginas } = await supabase
      .from("proposal_canva_pages")
      .select("page_number,extracao_status")
      .eq("organization_id", organizationId)
      .eq("proposal_id", proposta.id as string)
      .is("archived_at", null);
    const extraidas = ((paginas ?? []) as { extracao_status: string }[]).filter(
      (p) => p.extracao_status === "extraida",
    ).length;
    return { proposta, paginasExtraidas: extraidas };
  });

/** Histórico de auditoria de um registro. */
export const historicoRegistro = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entidade: string; id: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoInterno(supabase, context.userId as string);
    const { data: linhas, error } = await supabase
      .from("audit_logs")
      .select("id,acao,entidade,entidade_id,created_at,user_id,valores_posteriores")
      .eq("organization_id", organizationId)
      .eq("entidade", data.entidade)
      .eq("entidade_id", data.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return ((linhas ?? []) as Record<string, any>[]).map((l) => ({
      id: l["id"] as string,
      acao: l["acao"] as string,
      created_at: l["created_at"] as string,
      status: (l["valores_posteriores"]?.["status"] ?? null) as string | null,
    }));
  });

/* ============================ PROPOSTAS ============================ */

export const salvarProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id?: string; dados: Record<string, unknown> }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_COMERCIAL, "Somente comercial, operações ou admin editam propostas.");
    const dados = limpar("proposals", data.dados);
    if (data.id) {
      const atual = await supabase
        .from("proposals")
        .select("status")
        .eq("id", data.id)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (!atual.data) throw new Error("Proposta não encontrada nesta organização.");
      delete dados["status"];
      const r = await gravarComVerificacao({
        supabase,
        tabela: "proposals",
        id: data.id,
        organizationId,
        userId: context.userId as string,
        payload: dados,
      });
      if (r.registro["case_id"]) {
        await registrarTimelineCaso(supabase, {
          organizationId,
          caseId: r.registro["case_id"] as string,
          eventType: "caso",
          title: "Proposta atualizada",
          sourceEntityType: "proposals",
          sourceEntityId: data.id,
          userId: context.userId as string,
        });
      }
      return { id: data.id };
    }
    const proximaVersao = await supabase
      .from("proposals")
      .select("versao")
      .eq("organization_id", organizationId)
      .eq("client_id", dados["client_id"] ?? null)
      .order("versao", { ascending: false })
      .limit(1)
      .maybeSingle();
    const r = await inserirComVerificacao({
      supabase,
      tabela: "proposals",
      organizationId,
      userId: context.userId as string,
      payload: { ...dados, status: "rascunho", versao: Number(proximaVersao.data?.versao ?? 0) + 1 },
    });
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: "Proposta criada",
        sourceEntityType: "proposals",
        sourceEntityId: r.id,
        userId: context.userId as string,
      });
    }
    return { id: r.id };
  });

export const mudarStatusProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_COMERCIAL, "Somente comercial, operações ou admin movem propostas.");
    if (data.status === "aprovada") {
      const { exigirAdminAprovador } = await import("@/lib/aprovacao-admin.server");
      await exigirAdminAprovador(supabase, organizationId);
    }
    const atual = await supabase
      .from("proposals")
      .select("status,validade,validade_renovada_em,case_id")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!atual.data) throw new Error("Proposta não encontrada nesta organização.");
    validarFluxo("proposals", atual.data.status as string, data.status);
    await gravarComVerificacao({
      supabase,
      tabela: "proposals",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: { status: data.status },
    });
    if (atual.data.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: atual.data.case_id as string,
        eventType: "caso",
        title: `Proposta: status alterado para ${data.status}`,
        sourceEntityType: "proposals",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

export const renovarValidadeProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; validade: string; motivo: string }) => {
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_COMERCIAL, "Somente comercial, operações ou admin renovam validade.");
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const r = await gravarComVerificacao({
      supabase,
      tabela: "proposals",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: { validade: data.validade, validade_renovada_motivo: motivo },
    });
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: "Validade da proposta renovada",
        summaryInternal: motivo,
        sourceEntityType: "proposals",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

/**
 * Cria uma versão de ajuste: duplica a proposta como rascunho editável e
 * marca a original como substituída (preservada no histórico, sem exclusão).
 * Proposta substituída ou arquivada não satisfaz o gate de geração contratual.
 */
export const criarVersaoAjusteProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; motivo: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_COMERCIAL, "Somente comercial, operações ou admin criam versões de proposta.");

    const atual = await supabase
      .from("proposals")
      .select("*")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!atual.data) throw new Error("Proposta não encontrada nesta organização.");
    if (atual.data.status === "substituida") throw new Error("Esta proposta já foi substituída por outra versão.");


    const base = { ...(atual.data as Record<string, any>) };
    for (const campo of [
      "id",
      "created_at",
      "updated_at",
      "archived_at",
      "archived_by",
      "archive_motivo",
      "substituida_por_id",
      "derivada_de_id",
      "restaurado_em",
      "restaurado_por",
      "restauracao_motivo",
      "versao",
      "status",
    ]) {
      delete base[campo];
    }

    const nova = await inserirComVerificacao({
      supabase,
      tabela: "proposals",
      organizationId,
      userId: context.userId as string,
      payload: { ...base, status: "rascunho", versao: Number(atual.data.versao ?? 0) + 1, derivada_de_id: atual.data.id },
    });

    // Proposta arquivada permanece arquivada: o rascunho derivado nasce novo, sem alterar o histórico.
    const permiteSubstituir =
      !atual.data.archived_at && ["enviada", "em_negociacao", "aprovada", "recusada", "expirada"].includes(atual.data.status);

    if (permiteSubstituir) {
      await gravarComVerificacao({
        supabase,
        tabela: "proposals",
        id: atual.data.id,
        organizationId,
        userId: context.userId as string,
        payload: { status: "substituida", substituida_por_id: nova.id },
      });
    }

    if (atual.data.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: atual.data.case_id as string,
        eventType: "caso",
        title: "Versão de ajuste da proposta criada",
        summaryInternal: `Versão ${nova.registro["versao"]}${permiteSubstituir ? " — substitui a anterior" : ""}`,
        sourceEntityType: "proposals",
        sourceEntityId: nova.id,
        userId: context.userId as string,
      });
    }

    return { id: nova.id, versao: nova.registro["versao"] as number, substituiu: permiteSubstituir };
  });

/** Restaura uma proposta arquivada, com motivo rastreável. */
export const restaurarProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; motivo: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_COMERCIAL, "Somente comercial, operações ou admin restauram propostas.");
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const r = await gravarComVerificacao({
      supabase,
      tabela: "proposals",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: {
        archived_at: null,
        archived_by: null,
        restaurado_em: new Date().toISOString(),
        restaurado_por: context.userId,
        restauracao_motivo: motivo,
      },
    });
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: "Proposta restaurada",
        summaryInternal: motivo,
        sourceEntityType: "proposals",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });


/* ======================= ORDENS DE SERVIÇO ======================= */

export const criarOrdemServico = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string; case_id: string; scope_summary: string }) => {
    if (!data.contract_id) throw new Error("Vincule a ordem a um contrato.");
    if (!data.case_id) throw new Error("Vincule a ordem a um caso.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_COMERCIAL, "Somente operações, comercial ou admin criam ordens de serviço.");
    const linha = await inserirComVerificacao({
      supabase,
      tabela: "service_orders",
      organizationId,
      userId: context.userId as string,
      payload: {
        contract_id: data.contract_id,
        case_id: data.case_id,
        scope_summary: data.scope_summary,
        status: "draft",
        service_order_number: "pendente",
      },
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.case_id,
      eventType: "caso",
      title: "Ordem de serviço criada",
      sourceEntityType: "service_orders",
      sourceEntityId: linha.id,
      userId: context.userId as string,
    });
    return { id: linha.id };
  });

/**
 * Edita observação/escopo/planejamento (responsável, início, prazo) de uma
 * ordem de serviço já existente, em qualquer status. Não é transição de
 * status (isso é `mudarStatusOrdem`) e não exige nenhum gate, validação ou
 * aprovação — só grava os campos informados e atualiza `updated_at`.
 * `responsible_user_id`/`start_date`/`end_date` já existiam na tabela
 * `service_orders` sem escritor exposto na tela (Contrato de Uma Hora,
 * autorização 2026-09-24, item "OS real").
 */
export const atualizarObservacaoOrdem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id: string;
      scope_summary?: string;
      internal_notes?: string;
      responsible_user_id?: string | null;
      start_date?: string | null;
      end_date?: string | null;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_COMERCIAL, "Somente operações, comercial ou admin editam ordens de serviço.");
    const patch: Record<string, unknown> = {};
    if (data.scope_summary !== undefined) patch.scope_summary = data.scope_summary;
    if (data.internal_notes !== undefined) patch.internal_notes = data.internal_notes;
    if (data.responsible_user_id !== undefined) patch.responsible_user_id = data.responsible_user_id || null;
    if (data.start_date !== undefined) patch.start_date = data.start_date || null;
    if (data.end_date !== undefined) patch.end_date = data.end_date || null;
    const r = await gravarComVerificacao({
      supabase,
      tabela: "service_orders",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: patch,
    });
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: "Observação/escopo/planejamento da ordem de serviço atualizado",
        sourceEntityType: "service_orders",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true, salvoEm: r.salvoEm };
  });

export const mudarStatusOrdem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_COMERCIAL, "Somente operações, comercial ou admin movem ordens de serviço.");
    const atual = await supabase
      .from("service_orders")
      .select("status,case_id")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!atual.data) throw new Error("Ordem de serviço não encontrada nesta organização.");
    validarFluxo("service_orders", atual.data.status as string, data.status);
    await gravarComVerificacao({
      supabase,
      tabela: "service_orders",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: { status: data.status },
    });
    if (atual.data.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: atual.data.case_id as string,
        eventType: "caso",
        title: `Ordem de serviço: status alterado para ${data.status}`,
        sourceEntityType: "service_orders",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

/* ============================ FINANCEIRO ============================ */

export const salvarFatura = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id?: string; dados: Record<string, unknown> }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_FINANCEIRO, "Alteração financeira exige papel financeiro ou admin.");
    const dados = limpar("invoices", data.dados);
    if (data.id) {
      const atual = await supabase
        .from("invoices")
        .select("status,valor")
        .eq("id", data.id)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (!atual.data) throw new Error("Fatura não encontrada nesta organização.");
      if (dados["status"] && dados["status"] !== atual.data.status) {
        validarFluxo("invoices", atual.data.status as string, String(dados["status"]));
      }
      if (atual.data.status === "paga" && Number(dados["valor"]) !== Number(atual.data.valor)) {
        throw new Error("Fatura paga não pode ter o valor editado. Registre um ajuste de fatura.");
      }
      const r = await gravarComVerificacao({
        supabase,
        tabela: "invoices",
        id: data.id,
        organizationId,
        userId: context.userId as string,
        payload: dados,
      });
      if (r.registro["case_id"]) {
        await registrarTimelineCaso(supabase, {
          organizationId,
          caseId: r.registro["case_id"] as string,
          eventType: "caso",
          title: "Fatura atualizada",
          sourceEntityType: "invoices",
          sourceEntityId: data.id,
          userId: context.userId as string,
        });
      }
      return { id: data.id };
    }
    const linha = await inserirComVerificacao({
      supabase,
      tabela: "invoices",
      organizationId,
      userId: context.userId as string,
      payload: { ...dados, status: dados["status"] ?? "rascunho" },
    });
    if (linha.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: linha.registro["case_id"] as string,
        eventType: "caso",
        title: "Fatura criada",
        sourceEntityType: "invoices",
        sourceEntityId: linha.id,
        userId: context.userId as string,
      });
    }
    return { id: linha.id };
  });

export const registrarAjusteFatura = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { invoice_id: string; valor: number; motivo: string; referencia_externa?: string }) => {
    if (!data.invoice_id) throw new Error("Selecione a fatura.");
    if (!Number.isFinite(Number(data.valor)) || Number(data.valor) === 0) throw new Error("Informe o valor do ajuste.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_FINANCEIRO, "Ajuste de fatura exige papel financeiro ou admin.");
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const linha = await inserirComVerificacao({
      supabase,
      tabela: "invoice_adjustments",
      organizationId,
      userId: context.userId as string,
      payload: {
        invoice_id: data.invoice_id,
        valor: Number(data.valor),
        motivo,
        referencia_externa: data.referencia_externa || null,
      },
    });
    const caseId = await casoDaFatura(supabase, organizationId, data.invoice_id);
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: "Ajuste de fatura registrado",
        summaryInternal: `Valor: ${data.valor} — ${motivo}`,
        sourceEntityType: "invoice_adjustments",
        sourceEntityId: linha.id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

export const listarAjustes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoInterno(supabase, context.userId as string);
    const { data, error } = await supabase
      .from("invoice_adjustments")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Record<string, any>[];
  });

/**
 * MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA: mesma busca já usada em
 * conciliarPagamento para achar o caso de uma fatura, extraída aqui para
 * também ser reaproveitada por salvarPagamento — sem tabela nova, sem
 * segundo escritor.
 */
async function casoDaFatura(supabase: Sb, organizationId: string, invoiceId: string | null | undefined) {
  if (!invoiceId) return null;
  const { data: fatura, error } = await supabase
    .from("invoices")
    .select("case_id")
    .eq("id", invoiceId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (fatura?.case_id as string | undefined) ?? null;
}

export const salvarPagamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id?: string; dados: Record<string, unknown> }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_FINANCEIRO, "Alteração financeira exige papel financeiro ou admin.");
    const dados = limpar("payments", data.dados);
    if (data.id) {
      const r = await gravarComVerificacao({
        supabase,
        tabela: "payments",
        id: data.id,
        organizationId,
        userId: context.userId as string,
        payload: dados,
      });
      const caseId = await casoDaFatura(supabase, organizationId, r.registro["invoice_id"] as string | null | undefined);
      if (caseId) {
        await registrarTimelineCaso(supabase, {
          organizationId,
          caseId,
          eventType: "caso",
          title: "Pagamento atualizado",
          summaryInternal: `Status: ${String(r.registro["status"] ?? "")}`,
          sourceEntityType: "payments",
          sourceEntityId: data.id,
          userId: context.userId as string,
        });
      }
      return { id: data.id };
    }
    if (!dados["invoice_id"]) throw new Error("Vincule o pagamento a uma fatura.");
    const linha = await inserirComVerificacao({
      supabase,
      tabela: "payments",
      organizationId,
      userId: context.userId as string,
      payload: { ...dados, status: dados["status"] ?? "pendente" },
    });
    const caseId = await casoDaFatura(supabase, organizationId, linha.registro["invoice_id"] as string | null | undefined);
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: "Pagamento registrado",
        summaryInternal: `Status: ${String(linha.registro["status"] ?? "")}`,
        sourceEntityType: "payments",
        sourceEntityId: linha.id,
        userId: context.userId as string,
      });
    }
    return { id: linha.id };
  });

/** Conciliação manual: exige data, valor e referência; divergência é marcada pelo banco. */
export const conciliarPagamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { id: string; pago_em: string; valor: number; referencia_externa: string; metodo?: string; motivo?: string }) => {
      if (!data.pago_em) throw new Error("Conciliação exige data do pagamento.");
      if (!Number.isFinite(Number(data.valor)) || Number(data.valor) <= 0) throw new Error("Conciliação exige valor do pagamento.");
      if (!data.referencia_externa || !data.referencia_externa.trim()) {
        throw new Error("Conciliação exige referência externa.");
      }
      return { ...data, motivo: data.motivo?.trim() || "Motivo não informado (fluxo sem confirmação humana explícita)." };
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_FINANCEIRO, "Conciliação exige papel financeiro ou admin.");
    const r = await gravarComVerificacao({
      supabase,
      tabela: "payments",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: {
        pago_em: data.pago_em,
        valor: Number(data.valor),
        referencia_externa: data.referencia_externa.trim(),
        // Frente 4 (19/10/2026): `metodo` existe em `payments` desde sempre e
        // nenhuma tela o preenchia na baixa manual — a conciliação do link
        // de pagamento do Asaas ficava sem registrar a forma. Opcional: não
        // sobrescreve com string vazia nem força um valor que o humano não
        // confirmou.
        ...(data.metodo && data.metodo.trim() ? { metodo: data.metodo.trim() } : {}),
        status: "confirmado",
        conciliacao_status: "conciliado",
      },
    });

    // Propaga a conciliação para o campo que o gate de acesso ao App Cliente
    // de fato verifica (portal-elegibilidade.ts/fn_portal_case_access_guard),
    // mesmo padrão já aplicado à assinatura de contrato em
    // contrato-parametros.functions.ts (registrarAssinatura). Sem isto, um
    // pagamento conciliado aqui nunca libera o portal — mesma lacuna, campo
    // diferente. Só propaga quando a fatura está de fato vinculada a um caso.
    // MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA (Lote 1): esta escrita era feita
    // sem checar erro nem linha afetada — igual ao bug já corrigido em
    // assinatura, só que aqui nem usava gravarComVerificacao. Também não
    // deixava evento de histórico no caso.
    const invoiceId = r.registro["invoice_id"] as string | null | undefined;
    if (invoiceId) {
      const { data: fatura, error: erroFatura } = await supabase
        .from("invoices")
        .select("case_id")
        .eq("id", invoiceId)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (erroFatura) throw new Error(erroFatura.message);
      if (fatura?.case_id) {
        const casoRes = await supabase
          .from("crm_casos")
          .update({ pagamento_confirmado: true })
          .eq("id", fatura.case_id)
          .eq("organization_id", organizationId)
          .select("id");
        if (casoRes.error) throw new Error(casoRes.error.message);
        if (!casoRes.data?.length) {
          throw new Error(
            "NENHUMA_LINHA_AFETADA: pagamento conciliado, mas o caso não foi marcado — revisão humana necessária antes de repetir a ação.",
          );
        }
        await registrarTimelineCaso(supabase, {
          organizationId,
          caseId: fatura.case_id as string,
          eventType: "caso",
          title: "Pagamento conciliado",
          summaryInternal: `Referência ${data.referencia_externa.trim()} — ${data.motivo}`,
          sourceEntityType: "payments",
          sourceEntityId: data.id,
          userId: context.userId as string,
        });

        /*
          CA-GATE-FINANCEIRO-OS (24/09/2026) — achado real: `contracts.
          financial_gate_status` é o campo que a trigger de banco
          `fn_service_orders_guard` exige em ('confirmed','not_applicable')
          para uma Ordem de Serviço poder sair de "approved" para "active" —
          e nada nesta função (nem em nenhuma outra) o propagava. Um
          pagamento conciliado aqui de verdade deixava a OS do mesmo caso
          bloqueada até um humano visitar /contratos/$id e escolher
          manualmente no dropdown, sem nenhuma pista na tela de que o
          pagamento já tinha acontecido.

          Só propaga quando existe exatamente UM contrato assinado para o
          caso — um caso pode ter contrato base + complementos/aditivos, e
          decidir por adivinhação qual deles receber a confirmação seria o
          mesmo erro que este projeto já evita em outros pontos (nunca
          fundir/adivinhar vínculo). Com mais de um ou nenhum contrato
          assinado, o dropdown manual em /contratos/$id continua sendo o
          caminho — nada quebra, só deixa de ganhar o atalho automático.
        */
        const { data: contratosAssinados, error: erroContratos } = await supabase
          .from("contracts")
          .select("id, financial_gate_status")
          .eq("case_id", fatura.case_id)
          .eq("organization_id", organizationId)
          .eq("status", "signed")
          .is("archived_at", null);
        if (erroContratos) throw new Error(erroContratos.message);
        if (contratosAssinados?.length === 1) {
          const contrato = contratosAssinados[0];
          if (contrato.financial_gate_status !== "confirmed") {
            await gravarComVerificacao({
              supabase,
              tabela: "contracts",
              id: contrato.id as string,
              organizationId,
              userId: context.userId as string,
              payload: { financial_gate_status: "confirmed" },
            });
          }
        }
      }
    }

    return { conciliacao: (r.registro["conciliacao_status"] ?? "conciliado") as string };
  });

export const arquivarComercial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { recurso: Recurso; id: string; motivo: string }) => {
    if (!RECURSOS.includes(data.recurso)) throw new Error("Recurso inválido.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    if (data.recurso === "invoices" || data.recurso === "payments") {
      exigirPapel(papel, PAPEIS_FINANCEIRO, "Arquivar registro financeiro exige papel financeiro ou admin.");
    } else {
      exigirPapel(papel, PAPEIS_COMERCIAL, "Sem permissão para arquivar este registro.");
    }
    const usaReason = data.recurso === "contracts" || data.recurso === "service_orders";
    const payload: Record<string, unknown> = {
      archived_at: new Date().toISOString(),
      archived_by: context.userId,
    };
    payload[usaReason ? "archive_reason" : "archive_motivo"] = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const r = await gravarComVerificacao({
      supabase,
      tabela: data.recurso,
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload,
    });
    // MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA: arquivamento comercial/financeiro
    // é irreversível pela tela e nunca deixava rastro no histórico do caso.
    // payments só chega ao caso indiretamente via invoice_id.
    const caseId =
      data.recurso === "payments"
        ? await casoDaFatura(supabase, organizationId, r.registro["invoice_id"] as string | null | undefined)
        : ((r.registro["case_id"] as string | undefined) ?? null);
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: `Registro comercial arquivado: ${data.recurso}`,
        summaryInternal: String(payload[usaReason ? "archive_reason" : "archive_motivo"]),
        sourceEntityType: data.recurso,
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

/**
 * CA07-FINANCEIRO-SIMPLES (09/09/2026) — leitura financeira única por caso.
 * Mesmas três fontes de sempre (proposals, invoices, third_party_expenses),
 * nenhuma nova: valor contratado só de proposals; recebido/saldo só de
 * invoices.valor_pago (já mantido por trigger a partir de payments
 * conciliados — nunca resomado aqui). Sem exceção comercial: essa fila
 * (sku_price_exceptions) já é lida por conferirRegraComercial e não repete
 * métrica de valor com esta leitura.
 */
export const obterResumoFinanceiroCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!data?.caseId) throw new Error("Selecione um caso.");
    return data;
  })
  .handler(async ({ data, context }): Promise<ResumoFinanceiroCaso> => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoInterno(supabase, context.userId as string);

    const [propostas, faturas, despesas] = await Promise.all([
      supabase
        .from("proposals")
        .select("id,status,valor,moeda,forma_pagamento")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("id,status,valor,valor_pago,moeda,vencimento")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null),
      supabase
        .from("third_party_expenses")
        .select("id,estado,valor_pago")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null),
    ]);

    // CA16-FINANCEIRO-E-CAMPANHAS (09/09/2026): payments.status='estornado'
    // nunca era lido nesta leitura — o trigger fn_payments_pos já excluía o
    // estorno de valor_pago, mas nada mostrava que o reembolso aconteceu.
    const idsFaturas = ((faturas.data ?? []) as any[]).map((f) => f.id);
    const pagamentos = idsFaturas.length
      ? await supabase
          .from("payments")
          .select("id,invoice_id,status,valor,moeda")
          .eq("organization_id", organizationId)
          .in("invoice_id", idsFaturas)
          .is("archived_at", null)
      : { data: [] as any[] };

    return calcularResumoFinanceiroCaso(
      (propostas.data ?? []) as any[],
      (faturas.data ?? []) as any[],
      (despesas.data ?? []) as any[],
      new Date().toISOString().slice(0, 10),
      (pagamentos.data ?? []) as any[],
    );
  });
