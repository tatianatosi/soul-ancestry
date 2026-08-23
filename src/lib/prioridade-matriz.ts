/**
 * P1.2 — Matriz Elegibilidade × Urgência como SINAL derivado.
 *
 * Regras vinculantes:
 *  - A matriz é apenas um sinal operacional de leitura. NUNCA altera status de
 *    caso, ativação, proposta, contrato, assinatura, cobrança, onboarding ou
 *    conteúdo do App Cliente.
 *  - Nada é inventado: cada fator declara o campo canônico de origem e, quando
 *    o campo não existe, o fator fica indisponível e é listado como pendência.
 *  - Sem score oculto: o sinal é decidido por regras nomeadas, na ordem
 *    declarada em REGRAS_SINAL.
 *  - Ausência de responsável não gera atribuição automática: vira exceção.
 *  - Nenhum campo desta matriz é projetado ao App Cliente.
 */

export const MATRIZ_VERSAO = "matriz-elegibilidade-urgencia-v1.0";

export type SinalPrioridade = "critica" | "atencao" | "acompanhada" | "sem_dados";

export const ROTULO_SINAL: Record<SinalPrioridade, string> = {
  critica: "Prioridade crítica",
  atencao: "Prioridade em atenção",
  acompanhada: "Acompanhada",
  sem_dados: "Dados insuficientes",
};

/** Eixo de elegibilidade — valores já existentes na ficha do caso (hipótese). */
export type EixoElegibilidade =
  | "forte"
  | "provavel"
  | "possivel_com_pesquisa"
  | "baixa"
  | "inconclusiva"
  | "nao_avaliada";

const ELEGIBILIDADE_VALIDA: EixoElegibilidade[] = [
  "forte",
  "provavel",
  "possivel_com_pesquisa",
  "baixa",
  "inconclusiva",
  "nao_avaliada",
];

export type EntradaPrioridade = {
  /** Identificação do objeto (para deduplicação de fila). */
  tipo: "caso" | "lead";
  id: string;
  /** Hipótese de elegibilidade registrada no caso. null = campo não preenchido. */
  elegibilidade?: EixoElegibilidade | string | null;
  /** Prazo da próxima ação (YYYY-MM-DD). null = sem prazo definido. */
  prazo?: string | null;
  /** Dias sem touchpoint (mesma base D10/D14 dos alertas). */
  diasSemTouchpoint?: number | null;
  /** Espera externa registrada suspende a leitura de cadência. */
  esperaExternaAtiva?: boolean;
  /** Gates/bloqueios pendentes já registrados no caso. */
  bloqueios?: string[];
  /** Status de SLA já calculado na tarefa/micro-entrega vinculada. */
  slaStatus?: "atrasada" | "em_risco" | "no_prazo" | null;
  /** Responsável nominal. null = falha de qualidade. */
  responsavel?: string | null;
  /** Classificação de origem do dado (P0.2). */
  origem?: string | null;
};

export type FatorPrioridade = {
  codigo: "elegibilidade" | "urgencia" | "bloqueios" | "prazo" | "sla" | "responsavel" | "origem";
  rotulo: string;
  /** Campo canônico que alimenta o fator. */
  campo: string;
  disponivel: boolean;
  /** Texto exibível do valor; null quando indisponível. */
  valor: string | null;
  /** O que precisa ser preenchido/decidido quando indisponível. */
  pendencia: string | null;
};

export type ResultadoPrioridade = {
  versao: string;
  tipo: "caso" | "lead";
  id: string;
  sinal: SinalPrioridade;
  rotulo: string;
  /** Nome da regra que determinou o sinal. Sem matemática escondida. */
  regra: string;
  explicacao: string;
  fatores: FatorPrioridade[];
  /** Campos/decisões humanas que faltam para leitura completa. */
  faltantes: string[];
  /** Exceções que exigem dono (nunca resolvidas automaticamente). */
  excecoes: string[];
  /** Sinal derivado de dado não-real; só visível a perfis internos. */
  origemNaoReal: boolean;
};

const CLASSIFICACOES_NAO_REAIS = ["demo", "mock", "seed", "modelo", "importado_a_confirmar", "nao_classificado"];

export const CADENCIA_ATENCAO_DIAS = 10;
export const CADENCIA_CRITICA_DIAS = 14;

/** Ordem de avaliação. A primeira regra satisfeita define o sinal. */
export const REGRAS_SINAL = [
  {
    nome: "R0_dados_insuficientes",
    descricao:
      "Sem elegibilidade registrada E sem nenhum fator de urgência disponível (prazo, cadência, SLA ou bloqueio) ⇒ dados insuficientes.",
  },
  {
    nome: "R1_urgencia_vencida",
    descricao: "Prazo anterior a hoje, SLA atrasado ou cadência ≥ 14 dias ⇒ crítica.",
  },
  {
    nome: "R2_bloqueio_com_prazo_no_dia",
    descricao: "Bloqueio registrado com prazo para hoje ⇒ crítica.",
  },
  {
    nome: "R3_janela_proxima",
    descricao: "Prazo até 7 dias, SLA em risco, cadência ≥ 10 dias ou bloqueio registrado ⇒ atenção.",
  },
  {
    nome: "R4_elegibilidade_alta_com_prazo",
    descricao:
      "Elegibilidade forte ou provável com prazo definido dentro dos próximos 30 dias ⇒ atenção (elevação única declarada).",
  },
  { nome: "R5_acompanhada", descricao: "Nenhuma condição acima ⇒ acompanhada." },
] as const;

const somarDias = (base: string, dias: number) => {
  const d = new Date(`${base}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

export const hojeISO = (d = new Date()) => d.toISOString().slice(0, 10);

function normalizarElegibilidade(v: unknown): EixoElegibilidade | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return (ELEGIBILIDADE_VALIDA as string[]).includes(s) ? (s as EixoElegibilidade) : null;
}

/** Calcula o sinal derivado. Função pura: não escreve em lugar nenhum. */
export function calcularPrioridade(e: EntradaPrioridade, hoje = hojeISO()): ResultadoPrioridade {
  const elegibilidade = normalizarElegibilidade(e.elegibilidade);
  const prazo = e.prazo ? String(e.prazo).slice(0, 10) : null;
  const dias =
    typeof e.diasSemTouchpoint === "number" && Number.isFinite(e.diasSemTouchpoint) && e.diasSemTouchpoint >= 0
      ? e.diasSemTouchpoint
      : null;
  const cadenciaLida = dias !== null && !e.esperaExternaAtiva;
  const bloqueios = (e.bloqueios ?? []).filter((b) => String(b).trim() !== "");
  const sla = e.slaStatus ?? null;
  const responsavel = e.responsavel && String(e.responsavel).trim() !== "" ? String(e.responsavel) : null;
  const origem = e.origem && String(e.origem).trim() !== "" ? String(e.origem) : null;

  const fatores: FatorPrioridade[] = [
    {
      codigo: "elegibilidade",
      rotulo: "Elegibilidade (hipótese)",
      campo: "crm_casos.hipotese_elegibilidade",
      disponivel: elegibilidade !== null && elegibilidade !== "nao_avaliada",
      valor: elegibilidade,
      pendencia:
        elegibilidade === null || elegibilidade === "nao_avaliada"
          ? "Registrar a hipótese de elegibilidade na ficha do caso (decisão humana)."
          : null,
    },
    {
      codigo: "prazo",
      rotulo: "Prazo da próxima ação",
      campo: "crm_casos.prazo_proxima_acao",
      disponivel: prazo !== null,
      valor: prazo,
      pendencia: prazo === null ? "Definir prazo da próxima ação no registro canônico." : null,
    },
    {
      codigo: "urgencia",
      rotulo: "Cadência (dias sem touchpoint)",
      campo: "crm_casos.dias_sem_touchpoint",
      disponivel: cadenciaLida,
      valor: cadenciaLida ? `${dias} dias` : e.esperaExternaAtiva ? "espera externa ativa" : null,
      pendencia: cadenciaLida
        ? null
        : e.esperaExternaAtiva
          ? "Cadência suspensa por espera externa registrada."
          : "Registrar touchpoint para haver base de cadência.",
    },
    {
      codigo: "sla",
      rotulo: "SLA de tarefa/micro-entrega",
      campo: "tarefas.sla_status / ops_microentregas.prazo_status",
      disponivel: sla !== null,
      valor: sla,
      pendencia: sla === null ? "Nenhuma tarefa ou micro-entrega vinculada com SLA calculado." : null,
    },
    {
      codigo: "bloqueios",
      rotulo: "Bloqueios e gates pendentes",
      campo: "case_activation_checks",
      disponivel: true,
      valor: bloqueios.length ? bloqueios.join(", ") : "nenhum registrado",
      pendencia: null,
    },
    {
      codigo: "responsavel",
      rotulo: "Responsável",
      campo: "crm_casos.responsavel_id",
      disponivel: responsavel !== null,
      valor: responsavel,
      pendencia: responsavel === null ? "Atribuição humana necessária — não há atribuição automática." : null,
    },
    {
      codigo: "origem",
      rotulo: "Origem do dado",
      campo: "classificacao_origem",
      disponivel: origem !== null,
      valor: origem,
      pendencia: origem === null ? "Classificar a origem do dado (P0.2)." : null,
    },
  ];

  const faltantes = fatores.filter((f) => !f.disponivel && f.pendencia).map((f) => `${f.rotulo}: ${f.pendencia}`);

  const excecoes: string[] = [];
  if (responsavel === null) excecoes.push("Sem responsável definido — exceção que exige dono.");
  if (prazo === null && bloqueios.length > 0) excecoes.push("Bloqueio registrado sem prazo definido.");

  const temUrgencia = prazo !== null || cadenciaLida || sla !== null || bloqueios.length > 0;
  const origemNaoReal = origem !== null && CLASSIFICACOES_NAO_REAIS.includes(origem);

  const base = {
    versao: MATRIZ_VERSAO,
    tipo: e.tipo,
    id: e.id,
    fatores,
    faltantes,
    excecoes,
    origemNaoReal,
  };

  const decidir = (sinal: SinalPrioridade, regra: string, explicacao: string): ResultadoPrioridade => ({
    ...base,
    sinal,
    rotulo: ROTULO_SINAL[sinal],
    regra,
    explicacao,
  });

  if ((elegibilidade === null || elegibilidade === "nao_avaliada") && !temUrgencia) {
    return decidir(
      "sem_dados",
      "R0_dados_insuficientes",
      "Sem hipótese de elegibilidade e sem prazo, cadência, SLA ou bloqueio registrados. Nenhum score foi atribuído.",
    );
  }

  if (prazo !== null && prazo < hoje)
    return decidir("critica", "R1_urgencia_vencida", `Prazo ${prazo} anterior a hoje (${hoje}).`);
  if (sla === "atrasada") return decidir("critica", "R1_urgencia_vencida", "SLA registrado como atrasado.");
  if (cadenciaLida && (dias as number) >= CADENCIA_CRITICA_DIAS)
    return decidir("critica", "R1_urgencia_vencida", `${dias} dias sem touchpoint (limite crítico: ${CADENCIA_CRITICA_DIAS}).`);

  if (bloqueios.length > 0 && prazo === hoje)
    return decidir("critica", "R2_bloqueio_com_prazo_no_dia", `Bloqueio registrado com prazo para hoje: ${bloqueios.join(", ")}.`);

  if (prazo !== null && prazo <= somarDias(hoje, 7))
    return decidir("atencao", "R3_janela_proxima", `Prazo ${prazo} dentro dos próximos 7 dias.`);
  if (sla === "em_risco") return decidir("atencao", "R3_janela_proxima", "SLA registrado em risco.");
  if (cadenciaLida && (dias as number) >= CADENCIA_ATENCAO_DIAS)
    return decidir("atencao", "R3_janela_proxima", `${dias} dias sem touchpoint (limite de atenção: ${CADENCIA_ATENCAO_DIAS}).`);
  if (bloqueios.length > 0)
    return decidir("atencao", "R3_janela_proxima", `Bloqueio registrado: ${bloqueios.join(", ")}.`);

  if ((elegibilidade === "forte" || elegibilidade === "provavel") && prazo !== null && prazo <= somarDias(hoje, 30))
    return decidir(
      "atencao",
      "R4_elegibilidade_alta_com_prazo",
      `Elegibilidade ${elegibilidade} com prazo ${prazo} nos próximos 30 dias.`,
    );

  return decidir("acompanhada", "R5_acompanhada", "Nenhuma condição de urgência registrada para hoje.");
}

/* ------------------------------------------------------------------ efeitos */

/**
 * Prova explícita de que a matriz é somente leitura: não há efeito colateral
 * autorizado sobre nenhuma entidade canônica.
 */
export const EFEITOS_COLATERAIS_AUTORIZADOS: readonly string[] = [];

/** Devolve o registro canônico intacto. Usada em teste de não-alteração. */
export function aplicarSinal<T extends Record<string, unknown>>(registro: T, _r: ResultadoPrioridade): T {
  void _r;
  return registro;
}

/** Nada da matriz é projetado ao App Cliente. */
export function prioridadeVisivelParaCliente(_r: ResultadoPrioridade): null {
  void _r;
  return null;
}

/** Origem só é exibível a perfis internos autorizados. */
export function origemVisivel(r: ResultadoPrioridade, perfilInterno: boolean): string | null {
  if (!perfilInterno) return null;
  return r.fatores.find((f) => f.codigo === "origem")?.valor ?? null;
}

/* -------------------------------------------------------- fila e alertas */

const chaveDe = (r: { tipo: string; id: string }) => `${r.tipo}:${r.id}`;

/**
 * Etiqueta de prioridade para um objeto JÁ presente numa fila.
 * Não cria linha nova: se o objeto não está na fila, não há etiqueta.
 */
export function etiquetaParaFila(
  r: ResultadoPrioridade,
  jaExibidos: Set<string>,
): { texto: string; explicacao: string } | null {
  if (!jaExibidos.has(chaveDe(r))) return null;
  return { texto: r.rotulo, explicacao: `${r.regra} — ${r.explicacao}` };
}

/** Exceções derivadas da matriz que ainda não apareceram em outra fila. */
export function excecoesDaMatriz(resultados: ResultadoPrioridade[], jaExibidos: Set<string>): ResultadoPrioridade[] {
  return resultados.filter((r) => r.excecoes.length > 0 && !jaExibidos.has(chaveDe(r)));
}

/**
 * Alertas só consomem a prioridade quando existe exceção definida.
 * Prioridade crítica sozinha NÃO vira alerta.
 */
export function geraAlerta(r: ResultadoPrioridade): boolean {
  return r.excecoes.length > 0;
}

/** Demos ficam ocultas por padrão; só aparecem com “Incluir demonstrações”. */
export function filtrarPorOrigem(
  resultados: ResultadoPrioridade[],
  opcoes?: { incluirDemo?: boolean },
): ResultadoPrioridade[] {
  return opcoes?.incluirDemo ? resultados : resultados.filter((r) => !r.origemNaoReal);
}
