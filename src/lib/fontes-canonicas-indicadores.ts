/**
 * CA-UX-03 Fase B — Fontes canônicas de indicadores e teto de métricas.
 *
 * Registro declarativo, sem efeito colateral: define qual superfície pode
 * exibir CONTAGEM de cada indicador e quais só podem exibir ETIQUETA/LINK
 * derivado. Nenhuma leitura de banco, nenhuma ação externa.
 */

export const TETO_METRICAS_PRINCIPAIS = 5;

export type TipoIndicador = "decisao" | "historico";
export type EstadoConfianca = "confirmado" | "parcial" | "a_confirmar";

export type IndicadorCanonico = {
  /** Nome humano do indicador. */
  indicador: string;
  /** Grupo do Desk (CA-UX-03, 8 grupos). */
  grupo: string;
  tipo: TipoIndicador;
  /** Módulo/rota que é a única origem de contagem. */
  fonteCanonica: string;
  formula: string;
  recorteTemporal: string;
  responsavel: string;
  /** Rota aberta pela ação do card. */
  rotaAcao: string;
  /** Superfícies autorizadas a mostrar o número. */
  contagemEm: readonly string[];
  /** Superfícies que só podem mostrar etiqueta ou link derivado. */
  etiquetaEm: readonly string[];
  confianca: EstadoConfianca;
  observacao: string;
};

/** Os 6 KPIs antes duplicados, agora com origem única de contagem. */
export const INDICADORES_CANONICOS: readonly IndicadorCanonico[] = [
  {
    indicador: "Vencidos e vence hoje",
    grupo: "Hoje",
    tipo: "decisao",
    fonteCanonica: "src/lib/painel-dia.ts (fila priorizada)",
    formula: "tarefas e marcos com prazo < hoje (vencido) ou = hoje (vence hoje), após filtrarParaFila",
    recorteTemporal: "dia corrente",
    responsavel: "responsável do registro",
    rotaAcao: "/painel",
    contagemEm: ["/painel"],
    etiquetaEm: ["/metricas", "/leads", "/casos", "/tarefas"],
    confianca: "confirmado",
    observacao: "Deduplicação obrigatória: um objeto aparece uma única vez na fila.",
  },
  {
    indicador: "Sem responsável",
    grupo: "Hoje",
    tipo: "decisao",
    fonteCanonica: "src/lib/alertas-derivados.ts",
    formula: "casos e tarefas ativos com responsavel_id nulo",
    recorteTemporal: "estado atual",
    responsavel: "proprietária / operações",
    rotaAcao: "/painel",
    contagemEm: ["/painel"],
    etiquetaEm: ["/casos", "/tarefas", "/metricas"],
    confianca: "confirmado",
    observacao: "Alerta derivado: some quando o registro canônico recebe responsável.",
  },
  {
    indicador: "Contratos enviados e pagamentos aguardados",
    grupo: "Contratos e financeiro",
    tipo: "decisao",
    fonteCanonica: "cadeia de formalização (contracts, commercial_conditions, service_orders)",
    formula: "contratos com envio registrado sem assinatura + condições aprovadas sem pagamento confirmado",
    recorteTemporal: "estado atual",
    responsavel: "financeiro",
    rotaAcao: "/contratos",
    contagemEm: ["/contratos"],
    etiquetaEm: ["/financeiro", "/painel", "/metricas"],
    confianca: "confirmado",
    observacao: "Painel Hoje mostra o item na fila, não um contador concorrente.",
  },
  {
    indicador: "Divergência de catálogo",
    grupo: "Contratos e financeiro",
    tipo: "decisao",
    fonteCanonica: "src/lib/conciliacao-catalogo.ts",
    formula: "itens de escopo com SKU ou preço divergente da fonte homologada",
    recorteTemporal: "última conciliação executada",
    responsavel: "comercial / financeiro",
    rotaAcao: "/conciliacao-catalogo",
    contagemEm: ["/conciliacao-catalogo"],
    etiquetaEm: ["/divergencias-catalogo", "/painel", "/metricas"],
    confianca: "confirmado",
    observacao: "Bloqueio de emissão de OS continua no registro canônico.",
  },
  {
    indicador: "Pendência documental",
    grupo: "Pesquisa",
    tipo: "decisao",
    fonteCanonica: "pesquisa e evidências (evidencias, solicitações de documento)",
    formula: "documentos solicitados sem entrega válida, por responsável",
    recorteTemporal: "estado atual",
    responsavel: "pesquisador / operações",
    rotaAcao: "/pesquisa-modulo",
    contagemEm: ["/pesquisa-modulo"],
    etiquetaEm: ["/evidencias", "/painel", "/metricas"],
    confianca: "confirmado",
    observacao: "Métricas exibe apenas link para a fila canônica.",
  },
  {
    indicador: "Funil comercial",
    grupo: "Comercial",
    tipo: "decisao",
    fonteCanonica: "src/lib/conversao-funil.ts (montarFunil, eventos de src/lib/conversao.ts)",
    formula: "razão entre eventos consecutivos do funil, por período",
    recorteTemporal: "semana e mês corrente",
    responsavel: "comercial",
    rotaAcao: "/conversao",
    contagemEm: ["/conversao"],
    etiquetaEm: ["/metricas", "/painel"],
    confianca: "confirmado",
    observacao: "Fase B: /conversao é a única superfície com número; /metricas exibe apenas link.",
  },
  {
    indicador: "Higiene comercial",
    grupo: "Comercial",
    tipo: "decisao",
    fonteCanonica: "src/lib/conversao-funil.ts (montarSaude) + leads (follow-up e próxima ação)",
    formula: "leads ativos sem próxima ação + follow-ups com prazo vencido",
    recorteTemporal: "estado atual",
    responsavel: "comercial",
    rotaAcao: "/conversao",
    contagemEm: ["/conversao"],
    etiquetaEm: ["/metricas", "/painel"],
    confianca: "confirmado",
    observacao: "Fase B: card removido visualmente de /metricas; permanece como link.",
  },
  {
    indicador: "Leads aguardando ação",
    grupo: "Hoje",
    tipo: "decisao",
    fonteCanonica: "src/lib/comercial-hoje-canonico.ts (sobre painel-dia.ts → comercialHoje)",
    formula:
      "união deduplicada de calls_hoje + propostas_sem_followup + leads_sem_proxima_acao, com data ≤ hoje+7, excluídos itens já exibidos em filas anteriores e registros demo quando incluirDemo=false",
    recorteTemporal: "dia corrente até hoje+7",
    responsavel: "comercial",
    rotaAcao: "/conversao",
    contagemEm: ["/painel"],
    etiquetaEm: ["/conversao", "/metricas", "/leads"],
    confianca: "confirmado",
    observacao: "Resumo comercial único do Painel Hoje: uma frase, um número, sem listas concorrentes.",
  },
];


/** Painéis aposentados visualmente: arquivo, rota e teste preservados. */
export const PAINEIS_HISTORICOS = [
  {
    componente: "src/components/painel/painel-desk-hoje.tsx",
    rotaHistorica: "/historico/painel-desk-hoje",
    substituidoPor: "/painel",
  },
  {
    componente: "src/components/painel/painel-hoje.tsx",
    rotaHistorica: "/historico/painel-hoje",
    substituidoPor: "/painel",
  },
] as const;

export const ROTA_PAINEL_CANONICO = "/painel";

export const AVISO_VISAO_HISTORICA = "Visão histórica — use Painel Hoje para execução diária.";

/** Verifica se uma rota é painel histórico aposentado visualmente. */
export function ehPainelHistorico(rota: string): boolean {
  return PAINEIS_HISTORICOS.some((p) => p.rotaHistorica === rota);
}

/** Indicadores que uma superfície pode exibir como número. */
export function contagensPermitidas(rota: string): readonly string[] {
  return INDICADORES_CANONICOS.filter((i) => i.contagemEm.includes(rota)).map((i) => i.indicador);
}

/** true quando a rota só pode mostrar etiqueta/link do indicador. */
export function somenteEtiqueta(indicador: string, rota: string): boolean {
  const i = INDICADORES_CANONICOS.find((x) => x.indicador === indicador);
  if (!i) return false;
  return !i.contagemEm.includes(rota);
}

/** Aplica o teto de métricas principais por área. */
export function respeitaTetoMetricas(quantidade: number): boolean {
  return quantidade <= TETO_METRICAS_PRINCIPAIS;
}

/** Nenhum indicador pode ter duas origens de contagem concorrentes. */
export function indicadoresComContagemConcorrente(): string[] {
  return INDICADORES_CANONICOS.filter((i) => {
    const grupos = new Set(i.contagemEm.map((r) => r.split("/")[1] ?? r));
    return grupos.size > 1;
  }).map((i) => i.indicador);
}
