/**
 * MARKETING — filtros de período/canal, prontidão de atribuição e exportação CSV.
 *
 * Camada SOMENTE-LEITURA e pura: recorta o que já foi lido, explica lacunas de
 * CAC/ROI/ROAS e serializa indicadores em CSV — inclusive estados sem dados.
 * Não executa ação externa, não grava, não estima valor ausente.
 */

import {
  METRICAS_MARKETING,
  SEM_DADOS,
  VAZIOS_MARKETING,
  distribuicaoOrigens,
  leituraMetricas,
  resumoPorOrigem,
  separarMetricas,
  type Confianca,
  type EntradaAquisicao,
} from "@/lib/marketing-aquisicao";

/* ------------------------------------------------------------------ */
/* Filtros de período e canal                                          */
/* ------------------------------------------------------------------ */

export type PeriodoMarketing = "7d" | "30d" | "90d" | "365d" | "tudo";

export const PERIODOS_MARKETING: readonly { valor: PeriodoMarketing; rotulo: string; dias: number | null }[] = [
  { valor: "7d", rotulo: "Últimos 7 dias", dias: 7 },
  { valor: "30d", rotulo: "Últimos 30 dias", dias: 30 },
  { valor: "90d", rotulo: "Últimos 90 dias", dias: 90 },
  { valor: "365d", rotulo: "Últimos 12 meses", dias: 365 },
  { valor: "tudo", rotulo: "Todo o histórico", dias: null },
] as const;

export const CANAL_TODOS = "todos";
export const CANAL_SEM_ATRIBUICAO = "sem_atribuicao";

export type FiltroMarketing = { periodo: PeriodoMarketing; canal: string };

export const FILTRO_MARKETING_PADRAO: FiltroMarketing = { periodo: "tudo", canal: CANAL_TODOS };

type LinhaData = { criado_em?: string | null; created_at?: string | null; occurred_at?: string | null };

/** Data de referência da linha, sem inventar valor quando não houver. */
export function dataDaLinha(linha: unknown): Date | null {
  const l = (linha ?? {}) as LinhaData;
  const bruto = l.occurred_at ?? l.criado_em ?? l.created_at ?? null;
  if (!bruto) return null;
  const d = new Date(bruto);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Canal declarado da linha (canal, senão origem). Sem valor → sem atribuição. */
export function canalDaLinha(linha: unknown): string {
  const l = (linha ?? {}) as { canal?: string | null; origem?: string | null };
  const v = (l.canal ?? l.origem ?? "").toString().trim();
  return v || CANAL_SEM_ATRIBUICAO;
}

function dentroDoPeriodo(linha: unknown, periodo: PeriodoMarketing, agora: Date): boolean {
  const dias = PERIODOS_MARKETING.find((p) => p.valor === periodo)?.dias ?? null;
  if (dias === null) return true;
  const d = dataDaLinha(linha);
  // Linha sem data não é descartada em silêncio: fica fora de recorte datado
  // e é contabilizada como lacuna de captura na prontidão.
  if (!d) return false;
  return agora.getTime() - d.getTime() <= dias * 24 * 60 * 60 * 1000;
}

function combinaCanal(linha: unknown, canal: string): boolean {
  return canal === CANAL_TODOS || canalDaLinha(linha) === canal;
}

/** Canais presentes no recorte bruto, para popular o seletor. */
export function canaisDisponiveis(entrada: EntradaAquisicao): { valor: string; rotulo: string }[] {
  const set = new Set<string>();
  for (const l of entrada.leads) set.add(canalDaLinha(l));
  for (const e of entrada.eventos) set.add(canalDaLinha(e));
  return [...set].sort().map((v) => ({
    valor: v,
    rotulo: v === CANAL_SEM_ATRIBUICAO ? "Sem atribuição de canal" : v,
  }));
}

/** Aplica período e canal a leads, eventos, investimentos e atribuições. */
export function filtrarEntrada(
  entrada: EntradaAquisicao,
  filtro: FiltroMarketing,
  agora: Date = new Date(),
): EntradaAquisicao {
  const passa = (linha: unknown) => dentroDoPeriodo(linha, filtro.periodo, agora) && combinaCanal(linha, filtro.canal);
  return {
    ...entrada,
    leads: entrada.leads.filter(passa),
    eventos: entrada.eventos.filter(passa),
    investimentos: entrada.investimentos.filter(passa),
    atribuicoes: entrada.atribuicoes.filter(passa),
  };
}

export function rotuloPeriodo(periodo: PeriodoMarketing): string {
  return PERIODOS_MARKETING.find((p) => p.valor === periodo)?.rotulo ?? periodo;
}

export function rotuloCanal(canal: string): string {
  if (canal === CANAL_TODOS) return "Todos os canais";
  if (canal === CANAL_SEM_ATRIBUICAO) return "Sem atribuição de canal";
  return canal;
}

/* ------------------------------------------------------------------ */
/* Campos faltantes de CAC, ROI e ROAS                                 */
/* ------------------------------------------------------------------ */

export type CampoFaltante = { campo: string; onde: string; porque: string };

export type ExplicacaoMetrica = {
  chave: string;
  nome: string;
  formula: string;
  faltantes: CampoFaltante[];
  /** Texto pronto para tooltip: enumera exatamente o que falta. */
  tooltip: string;
};

const CAMPOS_CAC: CampoFaltante[] = [
  {
    campo: "valor e canal do investimento",
    onde: "marketing_investments.valor · canal · competencia",
    porque: "Sem custo classificado por canal não existe numerador de CAC.",
  },
  {
    campo: "atribuição de origem do lead",
    onde: "attribution_records.canal · leads.origem",
    porque: "Sem lead atribuível ao canal não existe denominador de CAC.",
  },
];

const CAMPOS_RECEITA: CampoFaltante[] = [
  {
    campo: "receita recebida atribuída",
    onde: "payments confirmados vinculados ao caso e ao canal de origem",
    porque: "Sem receita atribuída não há retorno para dividir pelo investimento.",
  },
];

const CAMPOS_CAPTURA: CampoFaltante[] = [
  {
    campo: "captura de UTM na entrada",
    onde: "formulário público ou link rastreável (não conectado)",
    porque: "Sem UTM na origem, a atribuição nasce quebrada e o cálculo seria estimativa.",
  },
];

/** Diagnóstico exato do que falta para calcular cada métrica sensível. */
export function explicarMetrica(chave: "cac" | "roi" | "roas", entrada: EntradaAquisicao): ExplicacaoMetrica {
  const temInvestimento = entrada.investimentos.length > 0;
  const temAtribuicao = entrada.atribuicoes.length > 0;
  const temOrigem = entrada.leads.some((l) => Boolean(l.origem));

  const faltantes: CampoFaltante[] = [];
  if (!temInvestimento) faltantes.push(CAMPOS_CAC[0]);
  if (!temAtribuicao && !temOrigem) faltantes.push(CAMPOS_CAC[1]);
  if (chave !== "cac") faltantes.push(...CAMPOS_RECEITA);
  if (!temAtribuicao) faltantes.push(...CAMPOS_CAPTURA);

  const nome = chave === "cac" ? "CAC" : chave === "roi" ? "ROI" : "ROAS";
  const formula =
    chave === "cac"
      ? "Investimento classificado ÷ leads atribuíveis no período"
      : chave === "roi"
        ? "(Receita atribuída recebida − investimento) ÷ investimento"
        : "Receita atribuída recebida ÷ investimento classificado";

  const tooltip = faltantes.length
    ? `${nome} = ${formula}. Faltam: ${faltantes.map((f) => f.campo).join("; ")}.`
    : `${nome} = ${formula}. Todos os campos exigidos estão presentes; revise a classificação antes de decidir.`;

  return { chave, nome, formula, faltantes, tooltip };
}

export const METRICAS_EXPLICADAS: readonly ("cac" | "roi" | "roas")[] = ["cac", "roi", "roas"] as const;

/* ------------------------------------------------------------------ */
/* Prontidão de atribuição                                             */
/* ------------------------------------------------------------------ */

export type ItemProntidao = {
  chave: string;
  grupo: "investimento" | "atribuicao" | "captura";
  titulo: string;
  exigencia: string;
  atendido: boolean;
  detalhe: string;
  comoResolver: string;
};

export type Prontidao = {
  itens: ItemProntidao[];
  atendidos: number;
  total: number;
  pronto: boolean;
  resumo: string;
};

const ROTULO_GRUPO_PRONTIDAO: Record<ItemProntidao["grupo"], string> = {
  investimento: "Investimento",
  atribuicao: "Atribuição",
  captura: "Captura",
};

export { ROTULO_GRUPO_PRONTIDAO };

/** Checklist do que precisa existir antes de calcular CAC, ROI e ROAS. */
export function prontidaoAtribuicao(entrada: EntradaAquisicao): Prontidao {
  const investimentos = entrada.investimentos.length;
  const campanhas = entrada.campanhas.length;
  const fontes = entrada.fontes.length;
  const atribuicoes = entrada.atribuicoes.length;
  const leadsComOrigem = entrada.leads.filter((l) => Boolean(l.origem)).length;

  const itens: ItemProntidao[] = [
    {
      chave: "investimento_lancado",
      grupo: "investimento",
      titulo: "Investimento lançado por canal e competência",
      exigencia: "Pelo menos um lançamento em marketing_investments com canal e competência.",
      atendido: investimentos > 0,
      detalhe: investimentos > 0 ? `${investimentos} lançamento(s) no recorte.` : VAZIOS_MARKETING.investimento,
      comoResolver: "Registrar o custo real do canal por competência antes de qualquer leitura de custo.",
    },
    {
      chave: "campanha_registrada",
      grupo: "investimento",
      titulo: "Campanha registrada com UTM",
      exigencia: "marketing_campaigns com utm_source, utm_medium e utm_campaign.",
      atendido: campanhas > 0,
      detalhe: campanhas > 0 ? `${campanhas} campanha(s) registrada(s).` : VAZIOS_MARKETING.campanhas,
      comoResolver: "Cadastrar a campanha e seus parâmetros de UTM antes de ligar o gasto ao canal.",
    },
    {
      chave: "catalogo_origem",
      grupo: "atribuicao",
      titulo: "Catálogo fechado de origem",
      exigencia: "lead_sources preenchido, para origem deixar de ser texto livre.",
      atendido: fontes > 0,
      detalhe: fontes > 0 ? `${fontes} origem(ns) catalogada(s).` : "Nenhuma origem catalogada.",
      comoResolver: "Homologar a taxonomia de origem e usar o mesmo valor no lead e no evento.",
    },
    {
      chave: "atribuicao_registrada",
      grupo: "atribuicao",
      titulo: "Registro de atribuição por contato",
      exigencia: "attribution_records ligando contato a canal e campanha.",
      atendido: atribuicoes > 0,
      detalhe: atribuicoes > 0 ? `${atribuicoes} registro(s) de atribuição.` : VAZIOS_MARKETING.atribuicao,
      comoResolver: "Gravar a origem no momento da entrada do contato, não depois.",
    },
    {
      chave: "lead_com_origem",
      grupo: "atribuicao",
      titulo: "Leads com origem preenchida",
      exigencia: "Cada lead do recorte com origem informada.",
      atendido: leadsComOrigem > 0 && leadsComOrigem === entrada.leads.length,
      detalhe: entrada.leads.length
        ? `${leadsComOrigem}/${entrada.leads.length} lead(s) com origem.`
        : "Sem leads no recorte.",
      comoResolver: "Exigir origem na triagem do lead em Comercial.",
    },
    {
      chave: "captura_utm",
      grupo: "captura",
      titulo: "Captura pública de UTM",
      exigencia: "Formulário ou link rastreável conectado gravando UTM na entrada.",
      atendido: false,
      detalhe: VAZIOS_MARKETING.captura,
      comoResolver: "Depende de decisão da Proprietária: ação externa não autorizada nesta superfície.",
    },
    {
      chave: "receita_atribuida",
      grupo: "captura",
      titulo: "Receita recebida vinculada à origem",
      exigencia: "Pagamentos confirmados rastreáveis até o canal de aquisição.",
      atendido: false,
      detalhe: "Receita não está vinculada ao canal de origem.",
      comoResolver: "Ligar pagamento → caso → lead → canal antes de qualquer leitura de ROI ou ROAS.",
    },
  ];

  const atendidos = itens.filter((i) => i.atendido).length;
  const pronto = itens.every((i) => i.atendido);
  return {
    itens,
    atendidos,
    total: itens.length,
    pronto,
    resumo: pronto
      ? "Pré-condições atendidas: métricas podem ser calculadas com a classificação vigente."
      : `${atendidos} de ${itens.length} pré-condições atendidas. Enquanto faltar item, CAC, ROI e ROAS permanecem “${SEM_DADOS}”.`,
  };
}

/* ------------------------------------------------------------------ */
/* Exportação CSV dos indicadores e agregados                          */
/* ------------------------------------------------------------------ */

const CONFIANCA_CSV: Record<Confianca, string> = {
  alta: "alta",
  media: "media",
  baixa: "baixa",
  sem_dados: "sem_dados",
};

export const CABECALHO_CSV_MARKETING = [
  "secao",
  "chave",
  "rotulo",
  "valor",
  "confianca",
  "fonte",
  "observacao",
  "periodo",
  "canal",
] as const;

function celula(valor: string | number | null | undefined): string {
  const texto = (valor ?? "").toString().replace(/\r?\n/g, " ").trim();
  return `"${texto.replace(/"/g, '""')}"`;
}

export type LinhaCsvMarketing = {
  secao: string;
  chave: string;
  rotulo: string;
  valor: string;
  confianca: string;
  fonte: string;
  observacao: string;
};

/** Linhas do CSV, incluindo explicitamente estados sem dados. */
export function linhasCsvMarketing(entrada: EntradaAquisicao, filtro: FiltroMarketing): LinhaCsvMarketing[] {
  const linhas: LinhaCsvMarketing[] = [];
  const metricas = leituraMetricas(entrada);
  const { principais, historico } = separarMetricas(metricas);
  const fonteDe = (chave: string) => METRICAS_MARKETING.find((m) => m.chave === chave)?.fonte ?? "—";

  for (const m of principais) {
    linhas.push({
      secao: "metrica_principal",
      chave: m.chave,
      rotulo: m.nome,
      valor: m.valor,
      confianca: CONFIANCA_CSV[m.confianca],
      fonte: fonteDe(m.chave),
      observacao: m.nota,
    });
  }
  for (const m of historico) {
    linhas.push({
      secao: "metrica_historico",
      chave: m.chave,
      rotulo: m.nome,
      valor: m.valor,
      confianca: CONFIANCA_CSV[m.confianca],
      fonte: fonteDe(m.chave),
      observacao: m.nota,
    });
  }

  const origens = resumoPorOrigem(entrada);
  if (origens.length === 0) {
    linhas.push({
      secao: "agregado_origem",
      chave: "sem_registro",
      rotulo: "Origens no recorte",
      valor: SEM_DADOS,
      confianca: "sem_dados",
      fonte: "leads.origem · conversion_events",
      observacao: "Nenhum lead ou evento de conversão no recorte selecionado.",
    });
  } else {
    for (const o of origens) {
      linhas.push({
        secao: "agregado_origem",
        chave: o.rotulo,
        rotulo: o.rotulo,
        valor: `${o.leads} lead(s) · ${o.eventos} evento(s)`,
        confianca: "baixa",
        fonte: "leads.origem · conversion_events",
        observacao: "Agregado de leitura; origem em texto livre.",
      });
    }
  }

  const catalogo = distribuicaoOrigens(entrada.leads);
  if (catalogo.length === 0) {
    linhas.push({
      secao: "catalogo_origem",
      chave: "sem_registro",
      rotulo: "Catálogo de origem",
      valor: SEM_DADOS,
      confianca: "sem_dados",
      fonte: "lead_sources",
      observacao: "Sem leads no recorte para classificar origem.",
    });
  } else {
    for (const c of catalogo) {
      linhas.push({
        secao: "catalogo_origem",
        chave: c.canonico,
        rotulo: c.rotulo,
        valor: `${c.total} lead(s)`,
        confianca: c.canonico === "origem_a_confirmar" ? "sem_dados" : "baixa",
        fonte: "lead_sources · leads.origem",
        observacao: "Valores fora do catálogo permanecem como origem a confirmar.",
      });
    }
  }

  const prontidao = prontidaoAtribuicao(entrada);
  for (const i of prontidao.itens) {
    linhas.push({
      secao: "prontidao_atribuicao",
      chave: i.chave,
      rotulo: i.titulo,
      valor: i.atendido ? "atendido" : "pendente",
      confianca: i.atendido ? "alta" : "sem_dados",
      fonte: i.exigencia,
      observacao: i.detalhe,
    });
  }

  for (const chave of METRICAS_EXPLICADAS) {
    const e = explicarMetrica(chave, entrada);
    linhas.push({
      secao: "campos_faltantes",
      chave: e.chave,
      rotulo: e.nome,
      valor: e.faltantes.length ? SEM_DADOS : "Calculável — revisar classificação",
      confianca: e.faltantes.length ? "sem_dados" : "baixa",
      fonte: e.formula,
      observacao: e.faltantes.length ? e.faltantes.map((f) => `${f.campo} (${f.onde})`).join(" | ") : "Nada faltando.",
    });
  }

  return linhas.map((l) => ({ ...l, secao: l.secao }));
}

export function gerarCsvMarketing(entrada: EntradaAquisicao, filtro: FiltroMarketing): string {
  const linhas = linhasCsvMarketing(entrada, filtro).map((l) =>
    [
      l.secao,
      l.chave,
      l.rotulo,
      l.valor,
      l.confianca,
      l.fonte,
      l.observacao,
      rotuloPeriodo(filtro.periodo),
      rotuloCanal(filtro.canal),
    ]
      .map(celula)
      .join(","),
  );
  return `\uFEFF${[CABECALHO_CSV_MARKETING.map(celula).join(","), ...linhas].join("\r\n")}\r\n`;
}

export function nomeArquivoCsvMarketing(filtro: FiltroMarketing, agora: Date = new Date()): string {
  const dia = agora.toISOString().slice(0, 10);
  return `marketing-indicadores_${dia}_periodo-${filtro.periodo}_canal-${filtro.canal}.csv`;
}

/** Dispara o download local. Nada é enviado para fora do dispositivo. */
export function baixarCsvMarketing(entrada: EntradaAquisicao, filtro: FiltroMarketing): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([gerarCsvMarketing(entrada, filtro)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivoCsvMarketing(filtro);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
