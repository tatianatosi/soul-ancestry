import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { contextoInterno } from "@/lib/comercial.server";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { ehProprietariaAdministradora } from "@/lib/modo-proprietaria";
import type { DocumentoPortal } from "@/lib/portal-dados-vivos";
import type { ProjecaoBruta } from "@/lib/projecoes-cliente";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 28/08/2026 — "preciso com o acesso master ter acesso ao app cliente como
 * pessoa" (Proprietária). Só existia uma demo com dado fictício (Sophia),
 * sem consulta real. Esta função é a irmã autorizada de `dadosVivosDoPortal`
 * (CA-PORTAL-02): mesma forma de saída ({projecoes, documentos}), mesma
 * fonte (`portal_projecoes.content_sanitized`, já a projeção sanitizada —
 * nunca dado bruto do Desk/Mestre/Planejador), mas autorizada por papel de
 * staff dentro da organização em vez de `client_portal_access` do cliente.
 * Somente leitura; nenhum dado é alterado, nenhuma comunicação é disparada.
 */
export const dadosVivosDoPortalComoAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => {
    if (!data?.casoId) throw new Error("Selecione um caso.");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ projecoes: ProjecaoBruta[]; documentos: DocumentoPortal[] }> => {
    semCache();
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    if (!ehProprietariaAdministradora(papel)) {
      throw new Error("Somente a Proprietária Administradora pode abrir o App Cliente como uma pessoa real.");
    }

    const caso = await supabase
      .from("crm_casos")
      .select("id")
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const [proj, docs] = await Promise.all([
      supabase
        .from("portal_projecoes")
        .select("id, case_id, projection_type, content_sanitized, effective_from, updated_at")
        .eq("case_id", data.casoId),
      supabase.from("documents").select("id, liberado_cliente, origem, is_demo").eq("case_id", data.casoId),
    ]);

    return {
      projecoes: (proj.data ?? []) as ProjecaoBruta[],
      documentos: (docs.data ?? []) as DocumentoPortal[],
    };
  });

export type ResumoVisaoCliente = {
  acesso: {
    /** null quando o caso não tem nenhum registro de acesso ao portal. */
    statusAcesso: string | null;
    statusCaso: string | null;
    ultimoAcessoEm: string | null;
    /** As quatro condições exigidas por `portal_caso_permitido` no banco. */
    liberado: boolean;
  };
  ultimaAtualizacaoLiberada: { tipo: string; em: string } | null;
  microentregasProntasParaRevisao: number;
  producaoInternaEmRevisao: number;
  documentosDisponiveis: number;
  projecoesDeArvore: number;
  /** Sem fonte viva homologada nesta rodada — nunca inferido nem simulado. */
  preferencias: null;
  estadoPublicacao: { publicadas: number; pendentes: number; arquivadas: number };
};

/**
 * CA06-APP-NO-DESK (09/09/2026) — resumo "Visão do cliente" do Caso 360: o que
 * o App realmente mostrará, sem abrir a Biblioteca nem o modo "como pessoa".
 * Mesmas fontes de sempre (app_projections/client_portal_access/client_portal_case_access/
 * client_deliverables/documents), nenhuma tabela nova. `client_deliverables`
 * conta à parte, rotulado como produção interna — nunca somado ao que é
 * cliente-facing (decisão explícita da missão).
 */
export const resumoVisaoClienteCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => {
    if (!data?.casoId) throw new Error("Selecione um caso.");
    return data;
  })
  .handler(async ({ data, context }): Promise<ResumoVisaoCliente> => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const caso = await supabase
      .from("crm_casos")
      .select("id,app_access_status,app_visibility_level,consentimento_compartilhamento,info_cliente_liberada")
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const [acessoCaso, projecoes, entregas, documentos] = await Promise.all([
      supabase
        .from("client_portal_case_access")
        .select("access_status,revoked_at,client_portal_access:client_portal_access_id(access_status,last_authenticated_at)")
        .eq("organization_id", organizationId)
        .eq("case_id", data.casoId)
        .order("granted_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("app_projections")
        .select("id,projection_type,approval_status,effective_from,archived_at")
        .eq("organization_id", organizationId)
        .eq("case_id", data.casoId),
      supabase
        .from("client_deliverables")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("case_id", data.casoId)
        .eq("approval_status", "em_revisao")
        .is("archived_at", null),
      supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("case_id", data.casoId)
        .eq("liberado_cliente", true),
    ]);

    const listaProjecoes = (projecoes.data ?? []) as Record<string, any>[];
    const publicadas = listaProjecoes.filter((p) => p["approval_status"] === "published" && !p["archived_at"]);
    const pendentes = listaProjecoes.filter(
      (p) => !p["archived_at"] && ["draft", "in_review", "approved"].includes(String(p["approval_status"])),
    );
    const arquivadas = listaProjecoes.filter((p) => p["approval_status"] === "archived" || p["archived_at"]);
    const ultimaPublicada = [...publicadas].sort((a, b) =>
      String(b["effective_from"] ?? "").localeCompare(String(a["effective_from"] ?? "")),
    )[0];

    const acessoLinha = acessoCaso.data as Record<string, any> | null;
    const acessoCliente = acessoLinha?.["client_portal_access"] as Record<string, any> | null;

    return {
      acesso: {
        statusAcesso: acessoCliente?.["access_status"] ?? null,
        statusCaso: acessoLinha?.["access_status"] ?? null,
        ultimoAcessoEm: acessoCliente?.["last_authenticated_at"] ?? null,
        liberado:
          caso.data["app_access_status"] === "liberado" &&
          ["workspace", "completo"].includes(String(caso.data["app_visibility_level"])) &&
          Boolean(caso.data["consentimento_compartilhamento"]) &&
          Boolean(caso.data["info_cliente_liberada"]) &&
          acessoLinha?.["access_status"] === "active" &&
          acessoCliente?.["access_status"] === "active",
      },
      ultimaAtualizacaoLiberada: ultimaPublicada
        ? { tipo: String(ultimaPublicada["projection_type"] ?? ""), em: String(ultimaPublicada["effective_from"]) }
        : null,
      microentregasProntasParaRevisao: pendentes.length,
      producaoInternaEmRevisao: entregas.count ?? 0,
      documentosDisponiveis: documentos.count ?? 0,
      projecoesDeArvore: publicadas.filter((p) => p["projection_type"] === "arvore").length,
      preferencias: null,
      estadoPublicacao: { publicadas: publicadas.length, pendentes: pendentes.length, arquivadas: arquivadas.length },
    };
  });
