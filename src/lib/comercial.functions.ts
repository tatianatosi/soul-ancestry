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
import { gravarComVerificacao } from "@/lib/persistencia.server";

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
      await supabase.from("audit_logs").insert({
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



/** Catálogos auxiliares (clientes, casos, contratos, faturas) para vínculos e rótulos. */
export const listarVinculos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoInterno(supabase, context.userId as string);
    const [clientes, casos, contratos, faturas, propostas] = await Promise.all([
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
    ]);
    return {
      clientes: (clientes.data ?? []) as { id: string; nome: string }[],
      casos: (casos.data ?? []) as { id: string; codigo: string | null; titulo: string }[],
      contratos: (contratos.data ?? []) as { id: string; contract_number: string; title: string; status: string }[],
      faturas: (faturas.data ?? []) as { id: string; numero: string | null; valor: number; moeda: string; status: string }[],
      propostas: (propostas.data ?? []) as { id: string; versao: number; status: string; client_id: string | null }[],
    };
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
      const { error } = await supabase
        .from("proposals")
        .update(dados)
        .eq("id", data.id)
        .eq("organization_id", organizationId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    if (!dados["client_id"] && !dados["lead_id"]) throw new Error("Informe o cliente ou o lead da proposta.");
    const proximaVersao = await supabase
      .from("proposals")
      .select("versao")
      .eq("organization_id", organizationId)
      .eq("client_id", dados["client_id"] ?? null)
      .order("versao", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data: linha, error } = await supabase
      .from("proposals")
      .insert({
        ...dados,
        organization_id: organizationId,
        status: "rascunho",
        versao: Number(proximaVersao.data?.versao ?? 0) + 1,
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { id: linha?.id as string };
  });

export const mudarStatusProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_COMERCIAL, "Somente comercial, operações ou admin movem propostas.");
    const atual = await supabase
      .from("proposals")
      .select("status,validade,validade_renovada_em")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!atual.data) throw new Error("Proposta não encontrada nesta organização.");
    validarFluxo("proposals", atual.data.status as string, data.status);
    const { error } = await supabase
      .from("proposals")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const renovarValidadeProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; validade: string; motivo: string }) => {
    if (!data.validade) throw new Error("Informe a nova validade.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_COMERCIAL, "Somente comercial, operações ou admin renovam validade.");
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const { error } = await supabase
      .from("proposals")
      .update({ validade: data.validade, validade_renovada_motivo: motivo })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
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

    const { data: nova, error } = await supabase
      .from("proposals")
      .insert({
        ...base,
        organization_id: organizationId,
        status: "rascunho",
        versao: Number(atual.data.versao ?? 0) + 1,
        derivada_de_id: atual.data.id,
      })
      .select("id,versao")
      .maybeSingle();
    if (error) throw new Error(error.message);

    // Proposta arquivada permanece arquivada: o rascunho derivado nasce novo, sem alterar o histórico.
    const permiteSubstituir =
      !atual.data.archived_at && ["enviada", "em_negociacao", "aprovada", "recusada", "expirada"].includes(atual.data.status);

    if (permiteSubstituir) {
      const { error: e2 } = await supabase
        .from("proposals")
        .update({ status: "substituida", substituida_por_id: nova?.id })
        .eq("id", atual.data.id)
        .eq("organization_id", organizationId);
      if (e2) throw new Error(e2.message);
    }

    return { id: nova?.id as string, versao: nova?.versao as number, substituiu: permiteSubstituir };
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
    const { error } = await supabase
      .from("proposals")
      .update({
        archived_at: null,
        archived_by: null,
        restaurado_em: new Date().toISOString(),
        restaurado_por: context.userId,
        restauracao_motivo: motivo,
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
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
    const { data: linha, error } = await supabase
      .from("service_orders")
      .insert({
        organization_id: organizationId,
        contract_id: data.contract_id,
        case_id: data.case_id,
        scope_summary: data.scope_summary,
        status: "draft",
        service_order_number: "pendente",
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { id: linha?.id as string };
  });

/**
 * Edita observação/escopo de uma ordem de serviço já existente, em qualquer status.
 * Não é transição de status (isso é `mudarStatusOrdem`) e não exige nenhum gate,
 * validação ou aprovação — só grava o texto e atualiza `updated_at`.
 */
export const atualizarObservacaoOrdem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; scope_summary?: string; internal_notes?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_COMERCIAL, "Somente operações, comercial ou admin editam ordens de serviço.");
    const patch: Record<string, unknown> = {};
    if (data.scope_summary !== undefined) patch.scope_summary = data.scope_summary;
    if (data.internal_notes !== undefined) patch.internal_notes = data.internal_notes;
    const r = await gravarComVerificacao({
      supabase,
      tabela: "service_orders",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: patch,
    });
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
      .select("status")
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
      const { error } = await supabase
        .from("invoices")
        .update(dados)
        .eq("id", data.id)
        .eq("organization_id", organizationId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: linha, error } = await supabase
      .from("invoices")
      .insert({ ...dados, organization_id: organizationId, status: dados["status"] ?? "rascunho" })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { id: linha?.id as string };
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
    const { error } = await supabase.from("invoice_adjustments").insert({
      organization_id: organizationId,
      invoice_id: data.invoice_id,
      valor: Number(data.valor),
      motivo,
      referencia_externa: data.referencia_externa || null,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
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

export const salvarPagamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id?: string; dados: Record<string, unknown> }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_FINANCEIRO, "Alteração financeira exige papel financeiro ou admin.");
    const dados = limpar("payments", data.dados);
    if (data.id) {
      const { error } = await supabase
        .from("payments")
        .update(dados)
        .eq("id", data.id)
        .eq("organization_id", organizationId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    if (!dados["invoice_id"]) throw new Error("Vincule o pagamento a uma fatura.");
    const { data: linha, error } = await supabase
      .from("payments")
      .insert({ ...dados, organization_id: organizationId, status: dados["status"] ?? "pendente" })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { id: linha?.id as string };
  });

/** Conciliação manual: exige data, valor e referência; divergência é marcada pelo banco. */
export const conciliarPagamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; pago_em: string; valor: number; referencia_externa: string }) => {
    if (!data.pago_em) throw new Error("Conciliação exige data do pagamento.");
    if (!Number.isFinite(Number(data.valor)) || Number(data.valor) <= 0) throw new Error("Conciliação exige valor do pagamento.");
    if (!data.referencia_externa || !data.referencia_externa.trim()) {
      throw new Error("Conciliação exige referência externa.");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    exigirPapel(papel, PAPEIS_FINANCEIRO, "Conciliação exige papel financeiro ou admin.");
    const { error } = await supabase
      .from("payments")
      .update({
        pago_em: data.pago_em,
        valor: Number(data.valor),
        referencia_externa: data.referencia_externa.trim(),
        status: "confirmado",
        conciliacao_status: "conciliado",
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    const conferido = await supabase
      .from("payments")
      .select("conciliacao_status")
      .eq("id", data.id)
      .maybeSingle();
    return { conciliacao: (conferido.data?.conciliacao_status ?? "conciliado") as string };
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
    const { error } = await supabase
      .from(data.recurso)
      .update(payload)
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
