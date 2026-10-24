import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import type {
  DocumentoPortal,
  EtapaCliente,
  EventoTimelinePortal,
  MarcoHistoricoCliente,
  ChecklistDocumentalCliente,
  SolicitacaoChecklistBruta,
  SolicitacaoDocumentoBruta,
  SolicitacaoDocumentoCliente,
} from "@/lib/portal-dados-vivos";
import {
  checklistDocumentalCliente,
  composicaoDoCasoCliente,
  etapaDoCasoCliente,
  historicoSanitizado,
  proximaEntregaCliente,
  solicitacoesAbertasCliente,
} from "@/lib/portal-dados-vivos";
import type { ProjecaoBruta } from "@/lib/projecoes-cliente";
import { lerResumoCaso, type ResumoCasoCliente } from "@/lib/portal-resumo-caso";
import { projetarProximaAcaoCliente, sinaisDoCasoPortal, type ProximaAcaoCliente } from "@/lib/motor-caso";

export type VinculoArvoreCliente = { de: string; para: string; tipo: "pai_mae" | "conjuge" };

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * CA-PORTAL-02 — leitura viva do portal, sempre pelo client autenticado do
 * próprio usuário (RLS decide no banco). Nenhuma tabela interna sem policy de
 * portal é consultada; nenhum filtro de segurança vive no React.
 *
 * 21/09/2026 — esta função sempre soube recortar por `casoId`, mas o recorte
 * era opcional e o único chamador nunca o passava: sem `casoId`, a leitura
 * somava TODOS os casos autorizados nas quatro consultas, e cinco abas do App
 * exibiam conteúdo de casos diferentes na mesma tela. Pior, a próxima ação
 * saía do primeiro caso sobre o conteúdo de todos.
 *
 * Agregar nunca é correto numa superfície de cliente. Então o padrão deixou
 * de ser "todos" e passou a ser "um": sem `casoId`, o primeiro caso
 * autorizado. A defesa fica aqui, no servidor, e não depende de cada
 * chamador lembrar de passar o caso.
 *
 * Caso não autorizado (ou revogado) continua devolvendo conjunto vazio e
 * `casoAtivoId: null` — nunca cai silenciosamente em outro caso.
 */
export const dadosVivosDoPortal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId?: string } | undefined) => data ?? {})
  .handler(async ({ data, context }): Promise<{
    projecoes: ProjecaoBruta[];
    documentos: DocumentoPortal[];
    proximaAcao: ProximaAcaoCliente | null;
    /** Qual caso a leitura de fato usou. Nulo quando nenhum está disponível. */
    casoAtivoId: string | null;
    /**
     * Etapa e composição do caso ativo, já sanitizadas. Vêm da view
     * `portal_casos`, que projeta `case_plans.fase_jornada`/`composicao` do
     * plano ativo — nenhuma outra coluna do plano cruza a fronteira.
     */
    etapa: EtapaCliente | null;
    composicao: string | null;
    /** P3: só a data da próxima micro-entrega aberta, já em texto de cliente. */
    proximaEntrega: { data: string; texto: string } | null;
    /** Marcos da jornada aprovados explicitamente para a família (Conta). */
    historico: MarcoHistoricoCliente[];
    /** Documentos pedidos pela equipe e ainda abertos, com o nome do pedido. */
    solicitacoes: SolicitacaoDocumentoCliente[];
    checklist: ChecklistDocumentalCliente;
    /**
     * Pessoas mapeadas pela pesquisa neste caso (05/10/2026, PREMISSA da
     * Proprietária): denominador real do eixo "Conexões Familiares" do
     * Radar, nunca o teto ilustrativo de 31. Contagem sanitizada, sem PII —
     * `portal_casos.pessoas_mapeadas` (migration 20261005180000).
     */
    pessoasMapeadas: number;
    /**
     * 12/10/2026 — ligações da Árvore autorizadas pela Proprietária. Só
     * vínculos com `client_visibility = 'aprovada'`, não arquivados, cujas
     * DUAS pontas já estão publicadas na Árvore deste caso. Sai apenas
     * de/para/tipo — nenhuma nota, fonte ou status interno.
     */
    vinculosArvore: VinculoArvoreCliente[];
    /** Régua das 5 etapas, estado do caso e perfil da titular (13/10/2026). */
    resumoCaso: ResumoCasoCliente | null;
  }> => {
    semCache();
    const supabase = context.supabase as any;

    // P3 (25/09/2026) `proxima_entrega_prevista_em`, P4 (25/09/2026)
    // `pendencia_cliente_pendente` e 05/10/2026 `pessoas_mapeadas` vêm de
    // migrations aditivas na view portal_casos. Se o banco conectado ainda
    // não tiver uma delas, relê sem a coluna ausente — o App segue igual, só
    // sem aquele sinal, nunca finge o dado.
    const COLUNAS = "id, status, ativo, suspenso_em, fase_jornada, composicao";
    const COL_ENTREGA = "proxima_entrega_prevista_em";
    const COL_PENDENCIA = "pendencia_cliente_pendente";
    const COL_MAPEADAS = "pessoas_mapeadas";
    let casos = await supabase
      .from("portal_casos")
      .select(`${COLUNAS}, ${COL_ENTREGA}, ${COL_PENDENCIA}, ${COL_MAPEADAS}`);
    if (casos.error && new RegExp(COL_MAPEADAS).test(String(casos.error.message ?? ""))) {
      casos = await supabase.from("portal_casos").select(`${COLUNAS}, ${COL_ENTREGA}, ${COL_PENDENCIA}`);
    }
    if (casos.error && new RegExp(COL_PENDENCIA).test(String(casos.error.message ?? ""))) {
      casos = await supabase.from("portal_casos").select(`${COLUNAS}, ${COL_ENTREGA}`);
    }
    if (casos.error && new RegExp(COL_ENTREGA).test(String(casos.error.message ?? ""))) {
      casos = await supabase.from("portal_casos").select(COLUNAS);
    }
    const permitidos = ((casos.data ?? []) as {
      id: string;
      status?: string;
      ativo?: boolean;
      suspenso_em?: string | null;
      fase_jornada?: string | null;
      composicao?: string | null;
      proxima_entrega_prevista_em?: string | null;
      pendencia_cliente_pendente?: boolean | null;
      pessoas_mapeadas?: number | null;
    }[]);

    // Um caso por leitura. Pedido explícito só vale se estiver entre os
    // autorizados; sem pedido, o primeiro. Nunca o conjunto inteiro.
    const casoAtivo = data.casoId
      ? (permitidos.find((c) => String(c.id) === data.casoId) ?? null)
      : (permitidos[0] ?? null);
    if (!casoAtivo)
      return {
        projecoes: [],
        documentos: [],
        proximaAcao: null,
        casoAtivoId: null,
        etapa: null,
        composicao: null,
        proximaEntrega: null,
        historico: [],
        solicitacoes: [],
        checklist: { itens: [], total: 0, concluidos: 0 },
        pessoasMapeadas: 0,
        vinculosArvore: [],
        resumoCaso: null,
      };
    const alvo = [String(casoAtivo.id)];

    const [proj, docs, pendencias, faturas, timeline] = await Promise.all([
      supabase
        .from("portal_projecoes")
        // Corte 2a (28/09/2026): pessoa e geração publicadas pela equipe para a aba Árvore.
        // Corte 3c (02/10/2026): as duas pontas da União de Ramos, só usadas quando projection_type = uniao_ramos.
        .select(
          "id, case_id, projection_type, content_sanitized, effective_from, updated_at, pessoa_id, geracao_cliente, source_entity_id, vinculo_projecao_id",
        )
        .in("case_id", alvo),
      supabase.from("documents").select("id, liberado_cliente, origem, is_demo").in("case_id", alvo),
      // REVERIFICACAO-ADVERSARIAL-GIOVANNA (27/09/2026): mesma consulta de antes,
      // agora também com título/descrição/prazo (policy `pdr_sel_portal`) — a
      // aba Documentos passa a nomear QUAL documento é pedido.
      supabase
        .from("portal_document_requests")
        .select("id, case_id, status, titulo, descricao, prazo, motivo_recusa, obrigatorio")
        .in("case_id", alvo)
        // P0 do App (24/10/2026): lê TODOS os pedidos do caso (a policy `pdr_sel_portal`
        // já os entrega à família, sem arquivados) para montar o checklist com
        // contador. As contagens de pendência abaixo continuam só com aguardando/recusado.
        .is("archived_at", null),
      supabase.from("invoices").select("case_id, status").in("case_id", alvo).in("status", ["aberta", "vencida"]),
      // REVERIFICACAO-ADVERSARIAL-GIOVANNA (27/09/2026): "Histórico (3 marcos)"
      // da Ficha Piloto. RLS (`cte_select_portal`) já restringe a leitura a
      // `visibility = 'cliente_aprovado'` do próprio caso; o filtro explícito
      // abaixo é defesa em profundidade, mesmo padrão das outras consultas
      // desta função.
      supabase
        .from("case_timeline_events")
        .select("id, summary_client_approved, occurred_at, created_at, visibility")
        .in("case_id", alvo)
        .eq("visibility", "cliente_aprovado")
        .order("occurred_at", { ascending: false })
        .limit(3),
    ]);

    const pedidos = (pendencias.data ?? []) as Array<SolicitacaoChecklistBruta & { case_id: string }>;
    const documentosPendentes = pedidos.filter((p) => p.status === "aguardando" || p.status === "recusado").length;
    const pagamentoPendente = ((faturas.data ?? []) as { case_id: string }[]).length > 0;
    // Mesma origem do conteúdo. Antes era `permitidos.find(...) ?? permitidos[0]`,
    // que com o alvo agregado devolvia o PRIMEIRO caso — a próxima ação de um
    // caso anunciada sobre os marcos de outro.
    const proximaAcao = projetarProximaAcaoCliente(
      sinaisDoCasoPortal({
        status: casoAtivo.status,
        ativo: casoAtivo.ativo,
        suspensoEm: casoAtivo.suspenso_em,
        documentosPendentes,
        pagamentoPendente,
        pendenciaClientePendente: casoAtivo.pendencia_cliente_pendente === true,
      }),
    );

    // Acesso ao caso já foi decidido pela RLS de `portal_casos` acima. A
    // tabela de relações não tem policy de portal, então a leitura é feita no
    // servidor e recortada aqui: só pontas publicadas, só vínculo aprovado.
    const projecoes = (proj.data ?? []) as ProjecaoBruta[];
    const publicados = new Set(
      projecoes
        .filter((p: any) => String(p.projection_type ?? "").toLowerCase() === "arvore" && p.pessoa_id)
        .map((p: any) => String(p.pessoa_id)),
    );
    let vinculosArvore: VinculoArvoreCliente[] = [];
    if (publicados.size > 1) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const rel = await (supabaseAdmin as any)
        .from("genealogical_relationships")
        .select("person_from_id, person_to_id, relation_type")
        .eq("case_id", String(casoAtivo.id))
        .eq("client_visibility", "aprovada")
        .is("archived_at", null)
        .in("relation_type", ["pai_mae", "conjuge"]);
      vinculosArvore = ((rel.data ?? []) as { person_from_id: string; person_to_id: string; relation_type: string }[])
        .filter((r) => publicados.has(String(r.person_from_id)) && publicados.has(String(r.person_to_id)))
        .map((r) => ({
          de: String(r.person_from_id),
          para: String(r.person_to_id),
          tipo: r.relation_type === "conjuge" ? ("conjuge" as const) : ("pai_mae" as const),
        }));
    }

    // Acesso ao caso já decidido pela RLS de `portal_casos`; leitura do resumo
    // no servidor, recortada a campos sanitizados (sem CPF/RG/endereço).
    let resumoCaso: ResumoCasoCliente | null = null;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      resumoCaso = await lerResumoCaso(supabaseAdmin, String(casoAtivo.id));
    } catch {
      resumoCaso = null;
    }

    return {
      resumoCaso,
      vinculosArvore,
      projecoes,
      documentos: (docs.data ?? []) as DocumentoPortal[],
      proximaAcao,
      casoAtivoId: String(casoAtivo.id),
      etapa: etapaDoCasoCliente(casoAtivo.fase_jornada),
      composicao: composicaoDoCasoCliente(casoAtivo.composicao),
      proximaEntrega: proximaEntregaCliente(casoAtivo.proxima_entrega_prevista_em),
      historico: historicoSanitizado((timeline.data ?? []) as EventoTimelinePortal[]),
      solicitacoes: solicitacoesAbertasCliente(pedidos),
      checklist: checklistDocumentalCliente(pedidos),
      pessoasMapeadas: Math.max(0, Number(casoAtivo.pessoas_mapeadas ?? 0)),
    };
  });
