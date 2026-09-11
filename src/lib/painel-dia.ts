/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Painel Hoje — consolidação diária.
 *
 * Regra central: o painel responde apenas "o que precisa de ação hoje, por quem
 * e até quando". Cada lead/caso aparece UMA vez, com a ação principal e os
 * demais bloqueios listados dentro do próprio item (a ficha contextual detalha).
 * Governança de catálogo, planejamento, métricas de jornada e conversão não
 * pertencem a esta tela.
 */

import type { Fila, ItemFila } from "@/lib/crm-desk";

export type ItemDia = {
  id: string;
  tipo: "lead" | "caso";
  rotulo: string;
  /** Ação principal consolidada (fila mais crítica com prazo mais antigo). */
  acao: string;
  data: string | null;
  responsavel: string | null;
  area: string | null;
  etapa: string | null;
  /** Demais bloqueios do mesmo registro, para abrir na ficha. */
  bloqueios: string[];
  demo: boolean;
  /** Falha de qualidade: item operacional sem dono resolvido. */
  semResponsavel: boolean;
  semPrazo: boolean;
  /** Selo de origem da ação (quando o item é um caso com RPC canônica). */
  origemAcao?: "automatica" | "manual";
};

/** Filas que descrevem disciplina comercial (não bloqueio de execução). */
const FILAS_COMERCIAIS = new Set(["calls_hoje", "propostas_sem_followup", "leads_sem_proxima_acao"]);

/** Filas que representam bloqueio crítico acionável hoje. */
const FILAS_BLOQUEIO = new Set([
  "contratos_enviados_pendentes",
  "pagamentos_aguardados",
  "onboardings_pendentes",
  "casos_pendencia_documental",
]);

const eDemo = (rotulo: string) => /demo|demonstra|fixture|teste/i.test(rotulo);

export const hojeISO = (d = new Date()) => d.toISOString().slice(0, 10);

export function somarDias(base: string, dias: number) {
  const d = new Date(`${base}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Consolida todas as filas em um item por registro. */
export function consolidarDia(filas: Fila[], opcoes?: { incluirDemo?: boolean }): ItemDia[] {
  const mapa = new Map<string, ItemDia & { criticidade: number }>();

  const ordenadas = [...filas].sort((a, b) => a.criticidade - b.criticidade);
  for (const fila of ordenadas) {
    for (const item of fila.itens as ItemFila[]) {
      const chave = `${item.tipo}:${item.id}`;
      const atual = mapa.get(chave);
      const descricao = `${fila.rotulo}: ${item.detalhe}`;
      if (!atual) {
        mapa.set(chave, {
          id: item.id,
          tipo: item.tipo,
          rotulo: item.rotulo,
          acao: item.detalhe,
          data: item.data ? String(item.data).slice(0, 10) : null,
          responsavel: item.responsavel,
          area: item.area,
          etapa: item.etapa,
          bloqueios: [],
          demo: eDemo(item.rotulo),
          semResponsavel: !item.responsavel,
          semPrazo: !item.data,
          origemAcao: item.origemAcao,
          criticidade: fila.criticidade,
        });
        continue;
      }
      atual.bloqueios.push(descricao);
      const nova = item.data ? String(item.data).slice(0, 10) : null;
      if (nova && (!atual.data || nova < atual.data)) {
        atual.data = nova;
        atual.acao = item.detalhe;
        atual.origemAcao = item.origemAcao;
      }
      if (!atual.responsavel && item.responsavel) atual.responsavel = item.responsavel;
      atual.semResponsavel = !atual.responsavel;
      atual.semPrazo = !atual.data;
    }
  }

  const lista = [...mapa.values()].map(({ criticidade: _c, ...i }) => i);
  return opcoes?.incluirDemo ? lista : lista.filter((i) => !i.demo);
}

/** Ordenação por prazo sem sentinelas numéricas: sem prazo vai para o fim. */
const porPrazo = (a: ItemDia, b: ItemDia) => {
  if (a.data && b.data && a.data !== b.data) return a.data < b.data ? -1 : 1;
  if (a.data && !b.data) return -1;
  if (!a.data && b.data) return 1;
  return (a.responsavel ?? "").localeCompare(b.responsavel ?? "");
};

/** Texto de prazo sem número artificial. */
export function textoPrazo(data: string | null, aplicavel = true): string {
  if (data) return data.split("-").reverse().join("/");
  return aplicavel ? "Sem prazo definido" : "Prazo não aplicável";
}

export type FilaDia = { chave: "vencidas" | "hoje" | "proximos7"; rotulo: string; itens: ItemDia[] };

/**
 * Fila priorizada única: vencidas → hoje → próximos 7 dias.
 * Precedência exclusiva: um registro nunca aparece em duas faixas.
 */
export function filaPriorizada(itens: ItemDia[], hoje = hojeISO()): FilaDia[] {
  const limite = somarDias(hoje, 7);
  const vencidas: ItemDia[] = [];
  const doDia: ItemDia[] = [];
  const proximos: ItemDia[] = [];
  for (const i of itens) {
    if (!i.data) continue;
    if (i.data < hoje) vencidas.push(i);
    else if (i.data === hoje) doDia.push(i);
    else if (i.data <= limite) proximos.push(i);
  }
  return [
    { chave: "vencidas", rotulo: "Vencidas", itens: vencidas.sort(porPrazo) },
    { chave: "hoje", rotulo: "Hoje", itens: doDia.sort(porPrazo) },
    { chave: "proximos7", rotulo: "Próximos 7 dias", itens: proximos.sort(porPrazo) },
  ];
}

export type Excecao = { chave: string; rotulo: string; itens: ItemDia[] };

const chaveDe = (i: { tipo: string; id: string }) => `${i.tipo}:${i.id}`;

/**
 * Exceções que exigem dono — apenas registros que NÃO estão na fila priorizada,
 * para que nenhum item apareça duas vezes na tela.
 */
export function excecoesQueExigemDono(
  itens: ItemDia[],
  filas: Fila[],
  hoje = hojeISO(),
  jaExibidos?: Set<string>,
): Excecao[] {
  const bloqueioIds = new Set(
    filas.filter((f) => FILAS_BLOQUEIO.has(f.chave)).flatMap((f) => f.itens.map(chaveDe)),
  );
  const usados =
    jaExibidos ??
    new Set(
      filaPriorizada(itens, hoje)
        .flatMap((f) => f.itens)
        .map(chaveDe),
    );
  const restantes = itens.filter((i) => !usados.has(chaveDe(i)));
  const vistos = new Set<string>();
  const sem = (fn: (i: ItemDia) => boolean) =>
    restantes
      .filter((i) => !vistos.has(chaveDe(i)) && fn(i))
      .map((i) => {
        vistos.add(chaveDe(i));
        return i;
      })
      .sort(porPrazo);
  return [
    { chave: "sem_responsavel", rotulo: "Sem responsável", itens: sem((i) => i.semResponsavel) },
    { chave: "sem_proxima_acao", rotulo: "Sem próxima ação ou prazo", itens: sem((i) => i.semPrazo) },
    {
      chave: "bloqueio_critico",
      rotulo: "Bloqueio crítico sem prazo",
      itens: sem((i) => bloqueioIds.has(chaveDe(i))),
    },
  ].filter((e) => e.itens.length > 0);
}

/**
 * Comercial de hoje: apenas ações vencidas, de hoje ou dos próximos 7 dias,
 * excluindo registros já exibidos em outros blocos do painel.
 */
export function comercialHoje(
  filas: Fila[],
  opcoes?: { incluirDemo?: boolean; hoje?: string; jaExibidos?: Set<string> },
) {
  const hoje = opcoes?.hoje ?? hojeISO();
  const limite = somarDias(hoje, 7);
  const usados = opcoes?.jaExibidos ?? new Set<string>();
  const filtrar = (chave: string) =>
    (filas.find((f) => f.chave === chave)?.itens ?? []).filter((i) => {
      if (!opcoes?.incluirDemo && eDemo(i.rotulo)) return false;
      if (usados.has(chaveDe(i))) return false;
      const d = i.data ? String(i.data).slice(0, 10) : null;
      if (!d) return false;
      if (d > limite) return false;
      usados.add(chaveDe(i));
      return true;
    });
  return {
    calls: filtrar("calls_hoje"),
    propostas: filtrar("propostas_sem_followup"),
    semDisciplina: filtrar("leads_sem_proxima_acao"),
  };
}

/** Chaves já exibidas, para garantir item único por registro. */
export function chavesExibidas(grupos: { itens: { tipo: string; id: string }[] }[]): Set<string> {
  return new Set(grupos.flatMap((g) => g.itens.map(chaveDe)));
}

/**
 * Itens de uma fila que ainda não apareceram em nenhum bloco de trabalho.
 * Usado nos resumos (comercial e prazos) para contar sem duplicar linha de ação.
 */
export function itensNaoExibidos<T extends { id: string; tipo?: string; rotulo?: unknown }>(
  itens: readonly T[],
  usados: Set<string>,
  opcoes?: { incluirDemo?: boolean; tipoPadrao?: string },
): T[] {
  return itens.filter((i) => {
    if (!opcoes?.incluirDemo && eDemo(String(i.rotulo ?? ""))) return false;
    return !usados.has(`${i.tipo ?? opcoes?.tipoPadrao ?? "lead"}:${i.id}`);
  });
}

/** Dias sem touchpoint apresentáveis. Sentinelas (999, 9999) viram texto. */
export function textoDiasSemTouchpoint(dias: unknown): string {
  const n = Number(dias);
  if (!Number.isFinite(n) || n < 0 || n >= 365) return "sem touchpoint registrado";
  return `${n} dia${n === 1 ? "" : "s"} sem contato`;
}

/** Cadência exibível: somente com regra ativa e situação de atenção/crítica. */
export function cadenciaRelevante(casos: readonly Record<string, any>[], limite = 6, jaExibidos?: Set<string>) {
  return casos
    .filter((c) => {
      const cad = (c as any).cadencia;
      if (!cad) return false;
      if (jaExibidos?.has(`caso:${String((c as any).id)}`)) return false;
      if (cad.status !== "atencao" && cad.status !== "critico") return false;
      const dias = Number(cad.diasSemTouchpoint);
      return Number.isFinite(dias) && dias >= 0 && dias < 365;
    })
    .sort((a, b) => Number((b as any).cadencia.diasSemTouchpoint) - Number((a as any).cadencia.diasSemTouchpoint))
    .slice(0, limite);
}


export const FILAS_COMERCIAIS_CHAVES = FILAS_COMERCIAIS;


/** Grupos de manifestação de indicadores no Painel Hoje. */
export type GrupoIndicadorDia = "integridade" | "formalizacao" | "operacao" | "financeiro" | "cliente";

export type LinhaIndicadorDia = {
  /** Chave de deduplicação: o mesmo fato só aparece uma vez, na maior severidade. */
  chave: string;
  grupo: GrupoIndicadorDia;
  codigo: string;
  /** Motivo declarado do sinal. */
  motivo: string;
  /** Responsável pela ação; null vira “sem responsável definido”. */
  responsavel: string | null;
  /** Prazo ou idade do sinal, já em texto. */
  prazo: string;
  severidade: "P0" | "P1" | "P2";
};

const PESO_SEVERIDADE = { P0: 3, P1: 2, P2: 1 } as const;

/** Mantém um registro por chave, sempre no maior nível de severidade. */
export function deduplicarLinhasIndicadores(linhas: LinhaIndicadorDia[]): LinhaIndicadorDia[] {
  const mapa = new Map<string, LinhaIndicadorDia>();
  for (const l of linhas) {
    const atual = mapa.get(l.chave);
    if (!atual || PESO_SEVERIDADE[l.severidade] > PESO_SEVERIDADE[atual.severidade]) mapa.set(l.chave, l);
  }
  return [...mapa.values()].sort((a, b) => PESO_SEVERIDADE[b.severidade] - PESO_SEVERIDADE[a.severidade]);
}

/** Agrupa as linhas deduplicadas por grupo do Painel Hoje. */
export function agruparLinhasIndicadores(linhas: LinhaIndicadorDia[]): Record<GrupoIndicadorDia, LinhaIndicadorDia[]> {
  const base: Record<GrupoIndicadorDia, LinhaIndicadorDia[]> = {
    integridade: [],
    formalizacao: [],
    operacao: [],
    financeiro: [],
    cliente: [],
  };
  for (const l of deduplicarLinhasIndicadores(linhas)) base[l.grupo].push(l);
  return base;
}

/* ------------------------------------------------------------------ */
/* Cards do dia e filtros da fila priorizada                          */
/* ------------------------------------------------------------------ */

/** Destino clicável de cada cartão do topo — o número sem ação não opera. */
export const DESTINO_CARD_HOJE = {
  acoes_vencidas: { destino: "/calls", acao: "Abrir Painel de Calls — vencidos" },
  acoes_hoje: { destino: "/calls", acao: "Abrir o que vence hoje no Painel de Calls" },
  excecoes_criticas: { destino: "/ops-excecoes", acao: "Abrir exceções operacionais" },
  sla_em_risco: { destino: "/ops", acao: "Abrir operação e SLA" },
} as const;

export type CardHoje = {
  chave: string;
  rotulo: string;
  /**
   * Nulo quando a fonte canônica do indicador não está carregada. Ausência de
   * fonte nunca vira zero: o cartão declara "sem dados suficientes".
   */
  total: number | null;
  /** Leitura curta do que o número significa. Sem juízo de mérito. */
  leitura: string;
  destino: string;
  acao: string;
};

export type IndicadorCockpit = {
  chave: string;
  rotulo: string;
  total: number | null;
  destino: string;
  acao: string;
  leitura: string;
};

/**
 * Métricas de decisão do topo do Painel Hoje. 11/09/2026 — o card
 * "Sem responsável" saiu: a proprietária Tatiana Tosi é a única responsável.
 * Não repor. SLA em risco permanece declarado, mas sem fonte não entra na face.
 *
 * As filas de bloqueio que antes ocupavam um cartão cada (contrato enviado,
 * pagamento aguardado, onboarding pendente, documento aguardado) não se
 * perderam: consolidam-se em "Exceções críticas" e seguem detalhadas em
 * Sinais de atenção e nas páginas canônicas.
 */
export const CARDS_HOJE: { chave: string; rotulo: string; leitura: string }[] = [
  { chave: "acoes_vencidas", rotulo: "Vencidos", leitura: "Próxima ação com data anterior a hoje" },
  { chave: "acoes_hoje", rotulo: "Vence hoje", leitura: "Próxima ação datada para hoje" },
  {
    chave: "excecoes_criticas",
    rotulo: "Exceções críticas",
    leitura: "Contrato, pagamento, onboarding ou documento em bloqueio",
  },
  {
    chave: "sla_em_risco",
    rotulo: "SLA em risco",
    leitura: "Tarefa ou micro-entrega com SLA marcado em risco",
  },
];

/**
 * Contagem por cartão, respeitando o recorte de fixtures de demonstração.
 *
 * Cada cartão tem uma única fonte canônica e nenhum deles reconta um número já
 * exibido por outro bloco da mesma tela (CA-UX-02 §7, regra de não duplicação).
 */
export function cardsHoje(
  filas: Fila[],
  opcoes?: { incluirDemo?: boolean },
): CardHoje[] {
  const incluirDemo = opcoes?.incluirDemo ?? false;
  const visiveis = <T extends { rotulo: string }>(lista: T[]) =>
    incluirDemo ? lista : lista.filter((i) => !eDemo(i.rotulo));

  const daFila = (chave: string) =>
    visiveis((filas.find((f) => f.chave === chave)?.itens ?? []) as ItemFila[]).length;

  // Registros distintos presentes em qualquer fila de bloqueio. Conta registro,
  // não ocorrência: um caso travado em duas filas é uma exceção, não duas.
  const criticos = new Set(
    filas.filter((f) => FILAS_BLOQUEIO.has(f.chave)).flatMap((f) => visiveis(f.itens).map(chaveDe)),
  );

  const valor: Record<string, number | null> = {
    acoes_vencidas: daFila("acoes_vencidas"),
    acoes_hoje: daFila("acoes_hoje"),
    excecoes_criticas: criticos.size,
    // CA-UX-02 §7 pede SLA em risco. A fonte é tarefas.sla_status /
    // ops_microentregas.prazo_status, que a consulta do Painel Hoje ainda não
    // carrega. Sem a fonte, o cartão declara ausência — nunca zero.
    sla_em_risco: null,
  };

  return CARDS_HOJE.map((c) => {
    const destino = DESTINO_CARD_HOJE[c.chave as keyof typeof DESTINO_CARD_HOJE];
    return {
      ...c,
      total: valor[c.chave] ?? null,
      destino: destino?.destino ?? "/painel",
      acao: destino?.acao ?? "Abrir Painel Hoje",
    };
  });
}

/**
 * Faixa operacional extra do cockpit (Fase 1): cada item abre uma lista com
 * ação. Não entra no teto das cinco métricas de decisão — é atalho, não
 * segundo contador concorrente das mesmas filas do topo.
 */
export function faixaCockpitHoje(
  filas: Fila[],
  opcoes?: { incluirDemo?: boolean; cadenciasAtrasadas?: number },
): IndicadorCockpit[] {
  const incluirDemo = opcoes?.incluirDemo ?? false;
  const visiveis = <T extends { rotulo: string }>(lista: T[]) =>
    incluirDemo ? lista : lista.filter((i) => !eDemo(i.rotulo));
  const daFila = (chave: string) =>
    visiveis((filas.find((f) => f.chave === chave)?.itens ?? []) as ItemFila[]).length;

  return [
    {
      chave: "cadencias",
      rotulo: "Cadências atrasadas",
      total: opcoes?.cadenciasAtrasadas ?? 0,
      destino: "/casos",
      acao: "Abrir casos sem toque",
      leitura: "Casos acima da regra de dias sem touchpoint",
    },
    {
      chave: "documentos",
      rotulo: "Documentos aguardados",
      total: daFila("casos_pendencia_documental"),
      destino: "/evidencias",
      acao: "Abrir evidências e pedidos",
      leitura: "Caso com documento aguardando retorno",
    },
    {
      chave: "calls_hoje",
      rotulo: "Calls de hoje",
      total: daFila("calls_hoje"),
      destino: "/calls",
      acao: "Abrir Painel de Calls",
      leitura: "Leads com call marcada para hoje — mesma tabela leads",
    },
    {
      chave: "leads_sem_acao",
      rotulo: "Leads sem próxima ação",
      total: daFila("leads_sem_proxima_acao"),
      destino: "/calls",
      acao: "Definir próxima ação no CRM",
      leitura: "Lead ativo sem próxima ação datada",
    },
    {
      chave: "propostas",
      rotulo: "Propostas sem follow-up",
      total: daFila("propostas_sem_followup"),
      destino: "/propostas",
      acao: "Abrir propostas",
      leitura: "Proposta enviada sem follow-up registrado",
    },
    {
      chave: "contratos",
      rotulo: "Contratos parados",
      total: daFila("contratos_enviados_pendentes"),
      destino: "/contratos",
      acao: "Abrir contratos",
      leitura: "Contrato enviado sem avanço registrado",
    },
  ];
}

export type FiltrosDia = { responsavel?: string | null; area?: string | null; etapa?: string | null };

const valores = (itens: ItemDia[], campo: "responsavel" | "area" | "etapa") =>
  [...new Set(itens.map((i) => i[campo]).filter((v): v is string => Boolean(v)))].sort((a, b) => a.localeCompare(b));

/** Opções de filtro derivadas dos próprios itens do dia (sem entrada livre). */
export function opcoesFiltroDia(itens: ItemDia[]) {
  return {
    responsaveis: valores(itens, "responsavel"),
    areas: valores(itens, "area"),
    etapas: valores(itens, "etapa"),
  };
}

/** Aplica filtros de responsável, área e etapa. Filtro vazio não restringe. */
export function aplicarFiltrosDia(itens: ItemDia[], filtros: FiltrosDia): ItemDia[] {
  return itens.filter((i) => {
    if (filtros.responsavel && i.responsavel !== filtros.responsavel) return false;
    if (filtros.area && i.area !== filtros.area) return false;
    if (filtros.etapa && i.etapa !== filtros.etapa) return false;
    return true;
  });
}
