import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import type { DocumentoPortal, EtapaCliente } from "@/lib/portal-dados-vivos";
import { composicaoDoCasoCliente, etapaDoCasoCliente, proximaEntregaCliente } from "@/lib/portal-dados-vivos";
import type { ProjecaoBruta } from "@/lib/projecoes-cliente";
import { projetarProximaAcaoCliente, sinaisDoCasoPortal, type ProximaAcaoCliente } from "@/lib/motor-caso";

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
  }> => {
    semCache();
    const supabase = context.supabase as any;

    // P3 (25/09/2026): proxima_entrega_prevista_em vem da migration
    // 20260925120000. Se o banco conectado ainda não a tem, relê sem ela
    // (o App segue igual, sem a linha da próxima entrega).
    const COLUNAS = "id, status, ativo, suspenso_em, fase_jornada, composicao";
    let casos = await supabase.from("portal_casos").select(`${COLUNAS}, proxima_entrega_prevista_em`);
    if (casos.error && /proxima_entrega_prevista_em/.test(String(casos.error.message ?? ""))) {
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
    }[]);

    // Um caso por leitura. Pedido explícito só vale se estiver entre os
    // autorizados; sem pedido, o primeiro. Nunca o conjunto inteiro.
    const casoAtivo = data.casoId
      ? (permitidos.find((c) => String(c.id) === data.casoId) ?? null)
      : (permitidos[0] ?? null);
    if (!casoAtivo)
      return { projecoes: [], documentos: [], proximaAcao: null, casoAtivoId: null, etapa: null, composicao: null, proximaEntrega: null };
    const alvo = [String(casoAtivo.id)];

    const [proj, docs, pendencias, faturas] = await Promise.all([
      supabase
        .from("portal_projecoes")
        .select("id, case_id, projection_type, content_sanitized, effective_from, updated_at")
        .in("case_id", alvo),
      supabase.from("documents").select("id, liberado_cliente, origem, is_demo").in("case_id", alvo),
      supabase.from("portal_document_requests").select("case_id, status").in("case_id", alvo).in("status", ["aguardando", "recusado"]),
      supabase.from("invoices").select("case_id, status").in("case_id", alvo).in("status", ["pendente", "vencida"]),
    ]);

    const documentosPendentes = ((pendencias.data ?? []) as { case_id: string }[]).length;
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
      }),
    );

    return {
      projecoes: (proj.data ?? []) as ProjecaoBruta[],
      documentos: (docs.data ?? []) as DocumentoPortal[],
      proximaAcao,
      casoAtivoId: String(casoAtivo.id),
      etapa: etapaDoCasoCliente(casoAtivo.fase_jornada),
      composicao: composicaoDoCasoCliente(casoAtivo.composicao),
      proximaEntrega: proximaEntregaCliente(casoAtivo.proxima_entrega_prevista_em),
    };
  });
