/**
 * CA-UX-03 Fase B — Fontes canônicas de indicadores e teto de métricas.
 *
 * Registro declarativo, sem efeito colateral: define qual superfície pode
 * exibir CONTAGEM de cada indicador e quais só podem exibir ETIQUETA/LINK
 * derivado. Nenhuma leitura de banco, nenhuma ação externa.
 *
 * Regra (todas as abas, subabas e grupos): uma métrica = uma superfície
 * canônica de contagem. As demais mostram link/etiqueta, nunca segundo número.
 */

export const TETO_METRICAS_PRINCIPAIS = 5;

export type TipoIndicador = "decisao" | "historico";
export type EstadoConfianca = "confirmado" | "parcial" | "a_confirmar";

export type IndicadorCanonico = {
  /** Nome humano do indicador. */
  indicador: string;
  /** Grupo do Desk (CA-UX-03). */
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

/** Indicadores com origem única de contagem (sem concorrência entre grupos). */
export const INDICADORES_CANONICOS: readonly IndicadorCanonico[] = [
  {
    indicador: "Vencidos e vence hoje",
    grupo: "Hoje",
    tipo: "decisao",
    fonteCanonica: "src/lib/painel-dia.ts (fila priorizada)",
    formula: "tarefas e marcos com prazo < hoje (vencido) ou = hoje (vence hoje), após filtrarParaFila",
    recorteTemporal: "dia corrente",
    responsavel: "responsável do registro",
    rotaAcao: "/calls",
    contagemEm: ["/painel"],
    etiquetaEm: ["/metricas", "/leads", "/casos", "/tarefas"],
    confianca: "confirmado",
    observacao:
      "Deduplicação obrigatória: um objeto aparece uma única vez na fila. O cartão abre a Mesa de Discovery porque a contagem atual é leads.proxima_acao_em.",
  },
  {
    indicador: "Sem responsável",
    grupo: "Hoje",
    tipo: "decisao",
    fonteCanonica: "src/lib/painel-dia.ts (consolidarDia → semResponsavel)",
    formula: "itens da fila do dia sem responsável nominal",
    recorteTemporal: "estado atual",
    responsavel: "proprietária / operações",
    rotaAcao: "/casos",
    contagemEm: ["/painel"],
    etiquetaEm: ["/casos", "/tarefas", "/metricas", "/ops"],
    confianca: "confirmado",
    observacao:
      "Distinto de «Sem responsável interno» em Casos 360 (gate de ativação). Contagem operacional só no Painel Hoje; Casos 360 conta o requisito de ativação.",
  },
  {
    indicador: "Sem responsável interno (ativação)",
    grupo: "Casos",
    tipo: "decisao",
    fonteCanonica: "listarEstadoAtivacao (requisito responsável interno)",
    formula: "casos não ativos cujo motivo de ativação inclui Responsável interno",
    recorteTemporal: "estado atual",
    responsavel: "operações",
    rotaAcao: "/casos",
    contagemEm: ["/casos"],
    etiquetaEm: ["/painel", "/metricas"],
    confianca: "confirmado",
    observacao: "Gate de ativação — não é o mesmo indicador que «Sem responsável» do Painel Hoje.",
  },
  {
    indicador: "Casos ativos (ativação 360)",
    grupo: "Casos",
    tipo: "decisao",
    fonteCanonica: "listarEstadoAtivacao (crm_casos + requisitos)",
    formula: "casos com todos os requisitos de ativação ok (e.ativo)",
    recorteTemporal: "estado atual",
    responsavel: "operações",
    rotaAcao: "/casos",
    contagemEm: ["/casos"],
    etiquetaEm: ["/painel", "/pesquisa", "/ops", "/metricas"],
    confianca: "confirmado",
    observacao:
      "Única contagem de «Casos ativos» no sentido de ativação. Painel Hoje e Pesquisa só linkam para /casos — não recontam via cadência ou status de pesquisa.",
  },
  {
    indicador: "Casos ativos (eixo operação)",
    grupo: "Operação",
    tipo: "decisao",
    fonteCanonica: "onboarding-jornada (eixo_operacao === caso_ativo)",
    formula: "casos com eixo_operacao = caso_ativo",
    recorteTemporal: "estado atual",
    responsavel: "operações",
    rotaAcao: "/ops",
    contagemEm: ["/ops"],
    etiquetaEm: ["/painel", "/casos", "/metricas"],
    confianca: "confirmado",
    observacao: "Contagem só em Onboarding e jornada (/ops). Não confundir com ativação 360.",
  },
  {
    indicador: "Cadência D10/D14",
    grupo: "Operação",
    tipo: "decisao",
    fonteCanonica: "PainelOnboardingJornada (/ops) + limiares Ana em cadencia-limiares.ts",
    formula: "casos com 10+ dias sem touchpoint (atenção) ou 14+ sem atualização (crítico)",
    recorteTemporal: "estado atual",
    responsavel: "operações",
    rotaAcao: "/ops",
    contagemEm: ["/ops"],
    etiquetaEm: ["/painel", "/casos", "/metricas"],
    confianca: "confirmado",
    observacao:
      "Uma superfície: PainelOnboardingJornada. MetricasJornada e PainelCadencia não montam em /ops. Faixa do Painel Hoje só linka.",
  },
  {
    indicador: "SLA em risco",
    grupo: "Operação",
    tipo: "decisao",
    fonteCanonica: "DeskOperacional / tarefas.sla_status e ops_microentregas",
    formula: "tarefas ou micro-entregas com SLA em risco ou atrasado",
    recorteTemporal: "estado atual",
    responsavel: "operações",
    rotaAcao: "/ops",
    contagemEm: ["/ops"],
    etiquetaEm: ["/painel", "/metricas", "/tarefas"],
    confianca: "parcial",
    observacao: "Painel Hoje pode mostrar cartão com ausência (null) e link para /ops — nunca zero inventado.",
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
    observacao: "Painel Hoje mostra o item na fila/exceções, não um contador concorrente.",
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
    indicador: "Casos em pesquisa",
    grupo: "Pesquisa",
    tipo: "decisao",
    fonteCanonica: "painel de /pesquisa-modulo (research_cases ativos)",
    formula: "pesquisas ativas no Desk",
    recorteTemporal: "estado atual",
    responsavel: "pesquisador",
    rotaAcao: "/pesquisa-modulo",
    contagemEm: ["/pesquisa-modulo"],
    etiquetaEm: ["/pesquisa", "/painel", "/metricas"],
    confianca: "confirmado",
    observacao: "/pesquisa (dossiê/legado) só linka; não reconta o mesmo total.",
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
    fonteCanonica: "src/lib/conversao-funil.ts (montarSaude) — sem reconta de leads sem próxima ação",
    formula:
      "follow-ups vencidos + propostas sem resposta + aceite verbal sem formalização + inconsistências (leads sem próxima ação contam só no Painel Hoje)",
    recorteTemporal: "estado atual",
    responsavel: "comercial",
    rotaAcao: "/conversao",
    contagemEm: ["/conversao"],
    etiquetaEm: ["/metricas", "/painel"],
    confianca: "confirmado",
    observacao:
      "«Leads ativos sem próxima ação» na saúde comercial vira etiqueta/link para o Painel Hoje — não segundo KPI.",
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
    etiquetaEm: ["/conversao", "/metricas", "/leads", "/calls"],
    confianca: "confirmado",
    observacao: "Resumo comercial único do Painel Hoje: uma frase, um número, sem listas concorrentes de KPI.",
  },
  {
    indicador: "CAC",
    grupo: "Marketing",
    tipo: "decisao",
    fonteCanonica: "src/lib/indicadores-marketing.ts (cac) via /marketing",
    formula: "investimento classificado ÷ leads atribuíveis",
    recorteTemporal: "recorte selecionável em Marketing",
    responsavel: "financeiro / comercial",
    rotaAcao: "/marketing#indicadores",
    contagemEm: ["/marketing"],
    etiquetaEm: ["/financeiro", "/metricas", "/painel"],
    confianca: "parcial",
    observacao: "Financeiro só linka para Marketing — não reconta CAC/CPL/ROI.",
  },
  {
    indicador: "ROI de mídia",
    grupo: "Marketing",
    tipo: "decisao",
    fonteCanonica: "src/lib/indicadores-marketing.ts (roi) via /marketing",
    formula: "receita atribuída ÷ investimento classificado",
    recorteTemporal: "recorte selecionável em Marketing",
    responsavel: "financeiro / comercial",
    rotaAcao: "/marketing#indicadores",
    contagemEm: ["/marketing"],
    etiquetaEm: ["/financeiro", "/metricas", "/painel"],
    confianca: "parcial",
    observacao: "Financeiro só linka para Marketing.",
  },
  {
    indicador: "CPL",
    grupo: "Marketing",
    tipo: "decisao",
    fonteCanonica: "src/lib/indicadores-marketing.ts (cpl) via /marketing",
    formula: "investimento classificado ÷ leads atribuíveis",
    recorteTemporal: "recorte selecionável em Marketing",
    responsavel: "financeiro / comercial",
    rotaAcao: "/marketing#indicadores",
    contagemEm: ["/marketing"],
    etiquetaEm: ["/financeiro", "/metricas", "/painel"],
    confianca: "parcial",
    observacao: "Financeiro só linka para Marketing.",
  },
];

/**
 * Comparação medida entre `painel-dia.tsx` e a rota `/painel` — passo 3 do
 * Saneamento V4, que a Proprietária pediu explicitamente ("a comparação entre
 * o painel dia e a rota painel", 04/10/2026).
 *
 * Diferente de `painel-desk-hoje.tsx` e `painel-hoje.tsx` (abaixo), que são
 * legado deliberado com decisão registrada, `painel-dia.tsx` NÃO tem decisão
 * nenhuma: nenhuma rota o renderiza, e ao mesmo tempo 18 arquivos de teste o
 * cobrem como se fosse o Painel Hoje vivo. Nenhum agente deve escolher por
 * ela — este registro existe para a escolha ser informada, não para ser feita
 * aqui.
 */
export const COMPARACAO_PAINEL_HOJE = {
  medidoEm: "2026-10-04",
  candidatos: [
    {
      arquivo: "src/components/painel/painel-dia.tsx",
      linhas: 1260,
      rota: null,
      leitores: [
        "painelHojeDesk",
        "painelCadencia",
        "listarAlertas",
        "estadoAcessoPainel",
        "casosBloqueadosPorCatalogo",
        "panoramaChecklistJuridico",
      ],
      forte:
        "Seis leitores especializados do Desk: cadência, alertas, caso em destaque, sinais por grupo, " +
        "checklist jurídico, bloqueio por catálogo e ações rápidas com gate de acesso.",
      fraco: "Nenhuma rota o renderiza — está vivo só em teste.",
      testes: 18,
    },
    {
      arquivo: "src/routes/_authenticated/painel.tsx",
      linhas: 693,
      rota: "/painel",
      leitores: ["useGoLive (agregado)", "radarMarcosJuridicosDoPainel"],
      forte:
        "É a rota real do menu, com 16 blocos: tarefas e microentregas, decisões prioritárias, " +
        "próximas ações comerciais, funil, ritmo, prioridades, casos por país e via, radar jurídico, " +
        "propostas, contratos, pagamentos, cadência, casos sem próxima ação, revisão e alertas.",
      fraco:
        "Depende de um único leitor agregado do Go Live, não dos leitores especializados do Desk.",
      testes: null,
    },
  ],
  /** O que a decisão dela resolve, em uma linha cada. */
  consequencias: [
    "Eleger /painel: os 18 testes de painel-dia passam a cobrir componente fora de rota — reclassificar.",
    "Eleger painel-dia: precisa de rota e de substituir os 16 blocos já em uso em /painel.",
    "Fundir: os seis leitores especializados entram em /painel bloco a bloco, sem perder os 16.",
  ],
  decisao: "PENDENTE_PROPRIETARIA",
} as const;

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

/** Painéis de cadência/métricas de jornada aposentados da rota /ops (código preservado). */
export const PAINEIS_OPS_APOSENTADOS_DA_ROTA = [
  {
    componente: "src/components/painel/metricas-jornada.tsx",
    substituidoPor: "PainelOnboardingJornada em /ops",
    motivo: "Recontava D14, casos e entregas já cobertos por Onboarding e jornada",
  },
  {
    componente: "src/components/painel/painel-cadencia.tsx",
    substituidoPor: "PainelOnboardingJornada em /ops",
    motivo: "Recontava regular/atenção/crítico da mesma régua Ana",
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
