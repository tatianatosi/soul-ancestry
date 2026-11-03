/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Escritor da tabela de preços vigente (`price_catalog_rescued`) — tela viva
 * "Catálogo de produtos-pai" (Configuração › Catálogo e preços, 07/10/2026).
 *
 * Fecha o único gap real confirmado por leitura: o banco já concede
 * INSERT/UPDATE a `authenticated` (`can_write`) desde a migration
 * 20260904180000, mas nenhum módulo em `src/lib` jamais os usava — toda
 * gravação até hoje era SQL manual via canal do Lovable. Esta é a primeira
 * tela que cria, edita e arquiva com motivo, sem SQL manual.
 *
 * `price_catalog_rescued` não tem `updated_at`/`updated_by` — por isso não
 * usa o helper genérico `gravarComVerificacao` (que sempre grava
 * `updated_by`, coluna inexistente aqui); grava e relê manualmente, mesmo
 * padrão já usado em `conciliacao-catalogo.server.ts`.
 *
 * Nunca exclui fisicamente: arquivar é `archived_at`+`archive_motivo`.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { semCache } from "@/lib/no-store";
import {
  type EntradaEdicaoPreco,
  type EntradaNovoPreco,
  type LinhaPrecoCatalogo,
  validarEdicaoPreco,
  validarMotivoArquivamento,
  validarNovoPreco,
} from "@/lib/catalogo-precos-produtos-pai";

const SELECT_LINHA =
  "id,item_id,country_code,phase,price_component,amount,currency,source_type,source_reference,source_date,price_status,effective_from,effective_to,case_only,notes,created_at,archived_at,archive_motivo";

/** Lê todas as linhas da organização (inclui arquivadas — gestão, não só a calculadora). */
export const listarPrecosCatalogoGerenciavel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const { data, error } = await supabase
      .from("price_catalog_rescued")
      .select(SELECT_LINHA)
      .eq("organization_id", organizationId)
      .order("country_code", { ascending: true })
      .order("price_component", { ascending: true });
    if (error) throw new Error(error.message);
    return { linhas: (data ?? []) as LinhaPrecoCatalogo[] };
  });

/** Cria uma linha nova. Nunca promove sozinho a VIGENTE sem o estado vir explícito da tela. */
export const criarPrecoCatalogo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: EntradaNovoPreco) => {
    const v = validarNovoPreco(data);
    if (!v.ok) throw new Error(v.erro);
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;

    const payload = {
      // Approval remains explicit and restricted; draft creation stays available.
      organization_id: organizationId,
      item_id: data.item_id?.trim() || null,
      country_code: data.country_code?.trim().toUpperCase() || null,
      phase: data.phase?.trim() || null,
      price_component: data.price_component,
      amount: data.amount === null || data.amount === undefined || data.amount === "" ? null : Number(data.amount),
      currency: data.currency?.trim() || "BRL",
      source_type: data.source_type.trim(),
      source_reference: data.source_reference.trim(),
      source_date: data.source_date || null,
      price_status: data.price_status,
      effective_from: data.effective_from || null,
      effective_to: data.effective_to || null,
      case_only: !!data.case_only,
      notes: data.notes?.trim() || null,
      created_by: userId,
    };
    if (["VIGENTE", "HOMOLOGADO_CATALOGO", "CONDICAO_PARTICULAR_DE_CASO"].includes(data.price_status)) {
      const { exigirAdminAprovador } = await import("@/lib/aprovacao-admin.server");
      await exigirAdminAprovador(supabase, organizationId);
    }

    const { data: criada, error } = await supabase
      .from("price_catalog_rescued")
      .insert(payload)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!criada?.id) throw new Error("Nenhuma linha foi criada em price_catalog_rescued.");

    const relida = await supabase
      .from("price_catalog_rescued")
      .select(SELECT_LINHA)
      .eq("id", criada.id)
      .maybeSingle();
    if (!relida.data) throw new Error("A linha criada não pôde ser relida — gravação não confirmada.");

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      user_id: userId,
      acao: "catalogo_preco_produto_pai_criado",
      entidade: "price_catalog_rescued",
      entidade_id: criada.id,
      metadados: { price_component: data.price_component, country_code: payload.country_code, price_status: data.price_status },
    });

    return { ok: true as const, linha: relida.data as LinhaPrecoCatalogo };
  });

/** Edita uma linha existente, não arquivada. Nunca muda componente/país/item (isso é criar linha nova). */
export const editarPrecoCatalogo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string } & EntradaEdicaoPreco) => {
    if (!data?.id) throw new Error("Id da linha é obrigatório.");
    const v = validarEdicaoPreco(data);
    if (!v.ok) throw new Error(v.erro);
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;

    const payload: Record<string, unknown> = {};
    if (data.price_status !== undefined) payload.price_status = data.price_status;
    if (data.amount !== undefined) payload.amount = data.amount === null || data.amount === "" ? null : Number(data.amount);
    if (data.currency !== undefined) payload.currency = data.currency?.trim() || "BRL";
    if (data.source_date !== undefined) payload.source_date = data.source_date || null;
    if (data.effective_from !== undefined) payload.effective_from = data.effective_from || null;
    if (data.effective_to !== undefined) payload.effective_to = data.effective_to || null;
    if (data.notes !== undefined) payload.notes = data.notes?.trim() || null;

    if (Object.keys(payload).length === 0) throw new Error("Nenhum campo para editar foi enviado.");
    const atual = await supabase.from("price_catalog_rescued").select("price_status")
      .eq("id", data.id).eq("organization_id", organizationId).is("archived_at", null).maybeSingle();
    if (atual.error) throw new Error(atual.error.message);
    if (!atual.data) throw new Error("Preço não encontrado nesta organização.");
    if ([atual.data.price_status, data.price_status].some((status) =>
      ["VIGENTE", "HOMOLOGADO_CATALOGO", "CONDICAO_PARTICULAR_DE_CASO"].includes(status ?? ""))) {
      const { exigirAdminAprovador } = await import("@/lib/aprovacao-admin.server");
      await exigirAdminAprovador(supabase, organizationId);
    }

    const { data: linhas, error } = await supabase
      .from("price_catalog_rescued")
      .update(payload)
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .select("id");
    if (error) throw new Error(error.message);
    if (!linhas || linhas.length === 0) {
      throw new Error("Nenhuma linha foi alterada — a linha não existe nesta organização ou já está arquivada.");
    }

    const relida = await supabase
      .from("price_catalog_rescued")
      .select(SELECT_LINHA)
      .eq("id", data.id)
      .maybeSingle();
    if (!relida.data) throw new Error("A linha editada não pôde ser relida — gravação não confirmada.");

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      user_id: userId,
      acao: "catalogo_preco_produto_pai_editado",
      entidade: "price_catalog_rescued",
      entidade_id: data.id,
      metadados: { campos: Object.keys(payload) },
    });

    return { ok: true as const, linha: relida.data as LinhaPrecoCatalogo };
  });

/** Arquiva com motivo — nunca apaga fisicamente, nunca arquiva sem motivo declarado. */
export const arquivarPrecoCatalogo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; motivo: string }) => {
    if (!data?.id) throw new Error("Id da linha é obrigatório.");
    const v = validarMotivoArquivamento(data.motivo);
    if (!v.ok) throw new Error(v.erro);
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;

    const { data: linhas, error } = await supabase
      .from("price_catalog_rescued")
      .update({ archived_at: new Date().toISOString(), archived_by: userId, archive_motivo: data.motivo.trim() })
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .select("id");
    if (error) throw new Error(error.message);
    if (!linhas || linhas.length === 0) {
      throw new Error("Nenhuma linha foi arquivada — a linha não existe nesta organização ou já estava arquivada.");
    }

    const relida = await supabase
      .from("price_catalog_rescued")
      .select(SELECT_LINHA)
      .eq("id", data.id)
      .maybeSingle();
    if (!relida.data) throw new Error("A linha arquivada não pôde ser relida — gravação não confirmada.");

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      user_id: userId,
      acao: "catalogo_preco_produto_pai_arquivado",
      entidade: "price_catalog_rescued",
      entidade_id: data.id,
      metadados: { motivo: data.motivo.trim() },
    });

    return { ok: true as const, linha: relida.data as LinhaPrecoCatalogo };
  });
