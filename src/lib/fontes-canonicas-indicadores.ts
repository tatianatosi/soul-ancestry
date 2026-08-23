/**
 * CA-UX-03 Fase B — Fontes canônicas de indicadores e aposentadoria visual de
 * painéis redundantes.
 *
 * Regras puras, sem acesso a dado, banco, RLS ou ação externa. Servem para:
 * 1) aplicar o teto de 5 métricas principais por área do Desk;
 * 2) declarar a origem única de contagem dos KPIs duplicados;
 * 3) identificar rotas de painéis históricos (visíveis apenas por acesso direto).
 */

export const TETO_METRICAS_PRINCIPAIS = 5;

export type TipoIndicador = "decisao" | "historico";

export interface FonteCanonicaIndicador {
  indicador: string;
  grupo: string;
  tipo: TipoIndicador;
  fonteCanonica: string;
  formula: string;
  recorteTemporal: string;
  responsavel: string;
  rotaAcao: string;
  ondeConta: string;
  ondeApenasEtiqueta: string;
  confianca: "alta" | "media" | "a_confirmar";
  observacao: string;
}

/** Os 6 KPIs duplicados identificados na Fase A e sua origem única de contagem. */
export const KPIS_DUPLICADOS = [
  "vencidos_hoje",
  "sem_responsavel",
  "contratos_pagamentos",
  "divergencia_catalogo",
  "pendencia_documental",
  "funil_comercial",
] as const;

export type KpiDuplicado = (typeof KPIS_DUPLICADOS)[number];

/** Superfície única autorizada a exibir a contagem de cada KPI duplicado. */
export const ORIGEM_UNICA_CONTAGEM: Record<KpiDuplicado, string> = {
  vencidos_hoje: "/painel",
  sem_responsavel: "/painel",
  contratos_pagamentos: "/financeiro",
  divergencia_catalogo: "/conciliacao-catalogo",
  pendencia_documental: "/pesquisa",
  funil_comercial: "/metricas",
};

export function origemUnicaContagem(kpi: KpiDuplicado): string {
  return ORIGEM_UNICA_CONTAGEM[kpi];
}

/** True quando a rota pode exibir contagem própria do KPI; caso contrário só etiqueta/link. */
export function podeContar(kpi: KpiDuplicado, rota: string): boolean {
  return ORIGEM_UNICA_CONTAGEM[kpi] === rota;
}

export const FONTES_CANONICAS: FonteCanonicaIndicador[] = [
  {
    indicador: "Ações vencidas / vence hoje",
    grupo: "Hoje",
    tipo: "decisao",
    fonteCanonica: "src/lib/painel-dia.ts (fila priorizada)",
    formula: "tarefas e próximas ações com prazo < hoje ou = hoje, após filtrarParaFila()",
    recorteTemporal: "dia corrente",
    responsavel: "responsável do registro",
    rotaAcao: "/painel",
    ondeConta: "/painel",
    ondeApenasEtiqueta: "/metricas, /casos, /leads",
    confianca: "alta",
    observacao: "Origem única de contagem diária.",
  },
  {
    indicador: "Sem responsável",
    grupo: "Hoje",
    tipo: "decisao",
    fonteCanonica: "src/lib/alertas-derivados.ts",
    formula: "casos e tarefas ativos com responsavel_id nulo",
    recorteTemporal: "estado atual",
    responsavel: "proprietária administradora",
    rotaAcao: "/painel",
    ondeConta: "/painel",
    ondeApenasEtiqueta: "/casos, /metricas",
    confianca: "alta",
    observacao: "Exceção que exige dono; resolvida na origem, some do painel.",
  },
  {
    indicador: "Contratos enviados / pagamentos aguardados",
    grupo: "Contratos e Financeiro",
    tipo: "decisao",
    fonteCanonica: "cadeia de formalização (contratos + financeiro)",
    formula: "contratos aguardando assinatura + cobranças aguardando confirmação",
    recorteTemporal: "estado atual",
    responsavel: "financeiro",
    rotaAcao: "/financeiro",
    ondeConta: "/financeiro",
    ondeApenasEtiqueta: "/painel, /metricas",
    confianca: "alta",
    observacao: "Nenhuma cobrança ou envio parte da leitura.",
  },
  {
    indicador: "Divergência de catálogo",
    grupo: "Contratos e Financeiro",
    tipo: "decisao",
    fonteCanonica: "src/lib/conciliacao-catalogo.ts",
    formula: "SKUs com preço/escopo divergentes da fonte homologada",
    recorteTemporal: "estado atual",
    responsavel: "operações",
    rotaAcao: "/conciliacao-catalogo",
    ondeConta: "/conciliacao-catalogo",
    ondeApenasEtiqueta: "/painel, /divergencias-catalogo, /metricas",
    confianca: "alta",
    observacao: "Bloqueia emissão de OS na própria origem.",
  },
  {
    indicador: "Pendência documental",
    grupo: "Pesquisa",
    tipo: "decisao",
    fonteCanonica: "pesquisa/documentos (crm-desk.functions → pendenciasDocumentais)",
    formula: "documentos exigidos sem instância válida por responsável",
    recorteTemporal: "estado atual",
    responsavel: "pesquisador / operações",
    rotaAcao: "/pesquisa",
    ondeConta: "/pesquisa",
    ondeApenasEtiqueta: "/painel, /metricas, /evidencias",
    confianca: "alta",
    observacao: "Somente hipótese/pendência; nunca juízo de mérito.",
  },
  {
    indicador: "Funil comercial",
    grupo: "Comercial",
    tipo: "historico",
    fonteCanonica: "src/lib/indicadores-marketing.ts (13 eventos)",
    formula: "conversão etapa a etapa sobre eventos de funil persistidos",
    recorteTemporal: "acumulado, com recorte semanal/mensal",
    responsavel: "comercial",
    rotaAcao: "/metricas",
    ondeConta: "/metricas",
    ondeApenasEtiqueta: "/painel, /leads, /conversao",
    confianca: "media",
    observacao: "Leitura histórica; não cria fila nem tarefa.",
  },
];

/** Painéis aposentados visualmente (arquivos, rotas e testes preservados). */
export const PAINEIS_APOSENTADOS = [
  {
    componente: "src/components/painel/painel-desk-hoje.tsx",
    rotaHistorica: "/historico/painel-desk-hoje",
    motivo: "Duplicava a fila diária do Painel Hoje canônico.",
  },
  {
    componente: "src/components/painel/painel-hoje.tsx",
    rotaHistorica: "/historico/painel-hoje",
    motivo: "Painel legado com o mesmo nome humano do canônico.",
  },
] as const;

export const ROTA_PAINEL_CANONICO = "/painel";

export const AVISO_VISAO_HISTORICA = "Visão histórica — use Painel Hoje para execução diária.";

export const ROTAS_PAINEL_HISTORICO = PAINEIS_APOSENTADOS.map((p) => p.rotaHistorica);

export function ehRotaPainelHistorico(pathname: string): boolean {
  return ROTAS_PAINEL_HISTORICO.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

/** Nenhum painel aposentado pode figurar em navegação, atalho ou breadcrumb. */
export function podeAparecerEmNavegacao(rota: string): boolean {
  return !ehRotaPainelHistorico(rota);
}

/** Teto de 5 métricas principais por área. */
export function respeitaTetoMetricas(quantidade: number): boolean {
  return quantidade <= TETO_METRICAS_PRINCIPAIS;
}
