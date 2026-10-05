import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { contextoInterno } from "@/lib/comercial.server";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { ehProprietariaAdministradora } from "@/lib/modo-proprietaria";
import { linhas as linhasDe, linha as linhaDe } from "@/lib/linhas";
import { escopoAPartirDePublicacoes, type EscopoCliente } from "@/lib/app-visibilidade";
import { projetarProximaAcaoCliente, sinaisDoCasoPortal, type ProximaAcaoCliente } from "@/lib/motor-caso";
import type { DocumentoPortal } from "@/lib/portal-dados-vivos";
import type { ProjecaoBruta } from "@/lib/projecoes-cliente";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type DadosPortalComoAdmin = {
  projecoes: ProjecaoBruta[];
  documentos: DocumentoPortal[];
  proximaAcao: ProximaAcaoCliente | null;
  escopo: EscopoCliente;
};

/**
 * 28/08/2026 — "preciso com o acesso master ter acesso ao app cliente como
 * pessoa" (Proprietária). Só existia uma demo com dado fictício (Sophia),
 * sem consulta real. Esta função é a irmã autorizada de `dadosVivosDoPortal`
 * (CA-PORTAL-02): mesma forma de saída, mas lê `app_projections` como staff
 * (organização + caso + publicado + vigente). A view `portal_projecoes` exige
 * sessão de cliente (`portal_caso_permitido`); staff não é cliente — ler a
 * view deixava o acesso master vazio ou travado em Carregando.
 * Somente leitura; nenhum dado é alterado, nenhuma comunicação é disparada.
 */
export const dadosVivosDoPortalComoAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => {
    if (!data?.casoId) throw new Error("Selecione um caso.");
    return data;
  })
  .handler(async ({ data, context }): Promise<DadosPortalComoAdmin> => {
    semCache();
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    if (!ehProprietariaAdministradora(papel)) {
      throw new Error("Somente a Proprietária Administradora pode abrir o App Cliente como uma pessoa real.");
    }

    const caso = linhaDe<{
      id: string;
      status?: string | null;
      ativo?: boolean | null;
      suspenso_em?: string | null;
      cliente_id?: string | null;
    }>(
      await supabase
        .from("crm_casos")
        .select("id, status, ativo, suspenso_em, cliente_id")
        .eq("id", data.casoId)
        .eq("organization_id", organizationId)
        .maybeSingle(),
      "o caso deste acesso master",
    );
    if (!caso) throw new Error("Caso não encontrado nesta organização.");

    const agora = new Date().toISOString();
    // 30/09/2026 — a ponte admin saiu. Ela existia só "enquanto 20260911120000
    // não estiver no projeto remoto": essa migration já está aplicada
    // (fix_recursao_rls_app_projections_shares) e a policy hoje é
    // `app_proj_select = is_org_member(organization_id)`, sem recursão. Ler com
    // o JWT da equipe vale por RLS real e tira desta rota a dependência da
    // chave secreta do servidor, que o ambiente pode não ter — era isso que
    // virava "Invalid API key" no Acesso app como pessoa.
    const leitorProjecoes = supabase;

    const [proj, docs, pendencias, faturas] = await Promise.all([
      leitorProjecoes
        .from("app_projections")
        .select("id, case_id, projection_type, content_sanitized, pessoa_id, geracao_cliente, effective_from, updated_at")
        .eq("organization_id", organizationId)
        .eq("case_id", data.casoId)
        .eq("destination", "app")
        .eq("approval_status", "published")
        .is("archived_at", null)
        .not("effective_from", "is", null)
        .lte("effective_from", agora),
      supabase
        .from("documents")
        .select("id, liberado_cliente, origem")
        .eq("organization_id", organizationId)
        .eq("case_id", data.casoId),
      supabase
        .from("portal_document_requests")
        .select("id, status")
        .eq("organization_id", organizationId)
        .eq("case_id", data.casoId)
        .in("status", ["aguardando", "recusado"])
        .is("archived_at", null),
      supabase
        .from("invoices")
        .select("id, status")
        .eq("organization_id", organizationId)
        .eq("case_id", data.casoId)
        .in("status", ["aberta", "vencida"]),
    ]);

    const projecoes = linhasDe<ProjecaoBruta>(proj, "as publicações do App Cliente");
    const documentosBrutos = linhasDe<DocumentoPortal>(docs, "os documentos deste caso");
    const documentos = documentosBrutos.filter(
      (d) => d.liberado_cliente === true || d.origem === "cliente",
    );
    const documentosPendentes = linhasDe<{ id: string }>(
      pendencias,
      "as solicitações de documento do cliente",
    ).length;
    const pagamentoPendente =
      linhasDe<{ id: string }>(faturas, "as faturas deste caso").length > 0;

    return {
      projecoes,
      documentos,
      proximaAcao: projetarProximaAcaoCliente(
        sinaisDoCasoPortal({
          status: caso.status,
          ativo: caso.ativo,
          suspensoEm: caso.suspenso_em,
          documentosPendentes,
          pagamentoPendente,
        }),
      ),
      escopo: escopoAPartirDePublicacoes({
        temCaso: true,
        tiposPublicados: projecoes.map((p) => String(p.projection_type ?? "")),
      }),
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
  proximaAcao: ProximaAcaoCliente | null;
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
      .select(
        "id,status,ativo,suspenso_em,app_access_status,app_visibility_level,consentimento_compartilhamento,info_cliente_liberada",
      )
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    // Mesma decisão de dadosVivosDoPortalComoAdmin: RLS da equipe, sem admin.
    const leitorProjecoes = supabase;

    const [acessoCaso, projecoes, entregas, documentos, pendencias, faturas] = await Promise.all([
      supabase
        .from("client_portal_case_access")
        .select("access_status,revoked_at,client_portal_access:client_portal_access_id(access_status,last_authenticated_at)")
        .eq("organization_id", organizationId)
        .eq("case_id", data.casoId)
        .order("granted_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      leitorProjecoes
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
      // P27 (26/09/2026): "próximo passo publicado" pedido pelo Pacote de
      // Instruções — mesmas 2 consultas de dadosVivosDoPortalComoAdmin
      // acima, para alimentar projetarProximaAcaoCliente sem tabela nova.
      supabase
        .from("portal_document_requests")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("case_id", data.casoId)
        .in("status", ["aguardando", "recusado"])
        .is("archived_at", null),
      supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("case_id", data.casoId)
        .in("status", ["aberta", "vencida"]),
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

    const proximaAcao = projetarProximaAcaoCliente(
      sinaisDoCasoPortal({
        status: caso.data["status"] ?? null,
        ativo: caso.data["ativo"] ?? null,
        suspensoEm: caso.data["suspenso_em"] ?? null,
        documentosPendentes: pendencias.count ?? 0,
        pagamentoPendente: (faturas.count ?? 0) > 0,
      }),
    );

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
      proximaAcao,
      microentregasProntasParaRevisao: pendentes.length,
      producaoInternaEmRevisao: entregas.count ?? 0,
      documentosDisponiveis: documentos.count ?? 0,
      projecoesDeArvore: publicadas.filter((p) => p["projection_type"] === "arvore").length,
      preferencias: null,
      estadoPublicacao: { publicadas: publicadas.length, pendentes: pendentes.length, arquivadas: arquivadas.length },
    };
  });
