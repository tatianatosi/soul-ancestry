/**
 * Cadeia canônica — 11/09/2026.
 *
 * Legado não alimenta o planejador, o Caso 360 nem o App. A Planilha Mestre
 * e arquivos históricos entram só por leitura, inventário e migração única
 * para a lista-alimento versionada. Nenhuma tabela nova: o mapa abaixo é o
 * schema que já existe.
 */

import { rotuloFase } from "@/lib/fase-rotulo";

export const CADEIA_LEGADO_CASO = [
  {
    id: "legado",
    rotulo: "Legado (Planilha Mestre, planilhas e arquivos históricos)",
    passo: "leitura, inventário e migração única",
    tabelas: ["legacy_record_links"] as const,
  },
  {
    id: "lista_alimento",
    rotulo: "Lista-alimento versionada",
    passo: "dado de referência do planejador — nunca face comercial",
    tabelas: ["planner_catalog_feed", "price_catalog_rescued"] as const,
  },
  {
    id: "catalogo_planejador",
    rotulo: "Catálogo operacional do planejador",
    passo: "produto homologado que o Desk seleciona",
    tabelas: ["product_catalog"] as const,
  },
  {
    id: "caso_360",
    rotulo: "Caso 360",
    passo: "produto-pai + fase + trilha(s) + itens + condição particular",
    tabelas: ["crm_casos", "case_plans", "case_services", "citizenship_tracks"] as const,
  },
  {
    id: "desk",
    rotulo: "Desk produz, valida e libera",
    passo: "autorização humana antes de qualquer projeção",
    tabelas: ["app_projections", "client_deliverables"] as const,
  },
  {
    id: "app",
    rotulo: "App mostra valor autorizado",
    passo: "só o que o Desk publicou e sanitizou",
    tabelas: ["app_projections", "client_deliverables"] as const,
  },
  {
    id: "whatsapp",
    rotulo: "WhatsApp comunica",
    passo: "fila humana; nada sai sozinho",
    tabelas: ["communication_queue"] as const,
  },
] as const;

export type CamadaCadeiaLegado = (typeof CADEIA_LEGADO_CASO)[number]["id"];

export type ComposicaoCaso360 = {
  produtoPai: string | null;
  fase: string | null;
  faseRotulo: string;
  trilhas: string[];
  itens: string[];
  condicaoParticular: string | null;
  appPublicados: number;
  whatsappAguardando: number;
  whatsappEnviados: number;
};

type Plano = {
  fase_jornada?: string | null;
  entregas?: string[] | null;
  microentregas?: string[] | null;
  objetivo?: string | null;
};

type Servico = {
  product_catalog_id?: string | null;
  citizenship_track_id?: string | null;
  condicao_comercial_aprovada?: string | null;
  escopo_aprovado?: string | null;
};

type Produto = {
  id: string;
  nome_comercial?: string | null;
  code?: string | null;
  produto_pai?: string | null;
};

type Trilha = {
  id: string;
  pais?: string | null;
  code?: string | null;
  track_name?: string | null;
};

function texto(v: string | null | undefined): string | null {
  const t = String(v ?? "").trim();
  return t ? t : null;
}

/**
 * Compõe o Caso 360 a partir do planejador e do case service — nunca da
 * Planilha Mestre. Ausência vira "sem dado", nunca invenção.
 */
export function composicaoDoCaso360(entrada: {
  plano: Plano | null;
  servicos: Servico[];
  produtos: Produto[];
  trilhas: Trilha[];
  entregas?: { published_at?: string | null; approval_status?: string | null }[];
  comunicacoes?: { status?: string | null; sent_at?: string | null; approved_at?: string | null }[];
}): ComposicaoCaso360 {
  const plano = entrada.plano;
  const servicos = entrada.servicos ?? [];
  const porId = new Map(entrada.produtos.map((p) => [p.id, p]));
  const trilhaPorId = new Map(entrada.trilhas.map((t) => [t.id, t]));

  const produtosPai = new Set<string>();
  const trilhas = new Set<string>();
  const itens = new Set<string>();
  let condicao: string | null = null;

  for (const s of servicos) {
    const produto = s.product_catalog_id ? porId.get(s.product_catalog_id) : undefined;
    const pai = texto(produto?.produto_pai) ?? texto(produto?.nome_comercial);
    if (pai) produtosPai.add(pai);
    const item = texto(produto?.nome_comercial) ?? texto(s.escopo_aprovado);
    if (item) itens.add(item);
    const trilha = s.citizenship_track_id ? trilhaPorId.get(s.citizenship_track_id) : undefined;
    const nomeTrilha = trilha
      ? [trilha.pais, trilha.track_name ?? trilha.code].filter(Boolean).join(" — ")
      : null;
    if (nomeTrilha) trilhas.add(nomeTrilha);
    if (!condicao) condicao = texto(s.condicao_comercial_aprovada);
  }

  for (const e of plano?.entregas ?? []) if (texto(e)) itens.add(e.trim());
  for (const e of plano?.microentregas ?? []) if (texto(e)) itens.add(e.trim());

  const fase = texto(plano?.fase_jornada);
  const appPublicados = (entrada.entregas ?? []).filter(
    (e) => e.published_at || e.approval_status === "aprovada" || e.approval_status === "published",
  ).length;
  const filas = entrada.comunicacoes ?? [];
  const whatsappEnviados = filas.filter((c) => c.sent_at).length;
  const whatsappAguardando = filas.filter((c) => !c.sent_at && (c.status === "pending" || !c.approved_at)).length;

  return {
    produtoPai: [...produtosPai][0] ?? null,
    fase,
    faseRotulo: rotuloFase(fase),
    trilhas: [...trilhas],
    itens: [...itens],
    condicaoParticular: condicao,
    appPublicados,
    whatsappAguardando,
    whatsappEnviados,
  };
}

export function vazioComposicao(c: ComposicaoCaso360): boolean {
  return !c.produtoPai && !c.fase && c.trilhas.length === 0 && c.itens.length === 0 && !c.condicaoParticular;
}
