/**
 * Regra canônica — PREÇO SUGERIDO COMO REFERÊNCIA COMERCIAL OPERACIONAL.
 *
 * Decisão institucional já tomada: todo SKU utilizável usa o `preco_sugerido`
 * canônico (`product_catalog.preco_sugerido_fonte`) como referência comercial
 * operacional interna — exibível e selecionável em Planejador, Comercial,
 * Proposta, Condição Comercial, Anexo I/OS, métricas e Painel Hoje.
 *
 * Preço sugerido NÃO é preço homologado para cobrança, preço definitivo de
 * proposta, autorização de link/pagamento, substituto de condição aprovada nem
 * criação automática de condição comercial.
 *
 * Camada pura: não grava, não importa, não inventa, não cobra, não comunica e
 * não executa nenhuma ação externa. Nenhum preço é inferido: se não houver
 * valor, moeda, origem/versão e vigência na fonte canônica, o estado é
 * bloqueado.
 */

export type EstadoPrecoSugerido =
  | "PRECO_SUGERIDO_DISPONIVEL"
  | "PRECO_SUGERIDO_COM_RESSALVA"
  | "PRECO_SUGERIDO_BLOQUEADO";

export const ROTULO_ESTADO_PRECO_SUGERIDO: Record<EstadoPrecoSugerido, string> = {
  PRECO_SUGERIDO_DISPONIVEL: "Preço sugerido disponível",
  PRECO_SUGERIDO_COM_RESSALVA: "Preço sugerido — requer validação comercial final",
  PRECO_SUGERIDO_BLOQUEADO: "Preço sugerido indisponível",
};

export const SELO_PRECO_SUGERIDO = "Preço sugerido — requer validação comercial final";

/** Divergência da fonte (catalog_source_divergences), já persistida. */
export type DivergenciaFonte = {
  tipo: string;
  detalhe?: string | null;
  resolvido?: boolean | null;
  fonte_referencia?: string | null;
};

/** Tipos de divergência que impedem uso interno do preço sugerido. */
export const DIVERGENCIAS_CRITICAS = new Set([
  "divergencia_moeda",
  "divergencia_vigencia",
  "divergencia_escopo_critica",
  "conflito_preco_critico",
  "sku_conflitante",
]);

/** Divergências informativas: permitem uso interno com ressalva. */
export function divergenciaCritica(d: DivergenciaFonte): boolean {
  return d.resolvido !== true && DIVERGENCIAS_CRITICAS.has(d.tipo);
}

export type SkuPrecoSugerido = {
  id: string;
  code: string | null;
  nome: string | null;
  preco_sugerido: number | null;
  moeda: string | null;
  fonte_versao: string | null;
  fonte_referencia?: string | null;
  vigencia_inicio?: string | null;
  vigencia_fim?: string | null;
  status_produto?: string | null;
  status_fonte?: string | null;
  ativo?: boolean | null;
  archived_at?: string | null;
  dados_teste?: boolean | null;
  /** Preço praticado registrado na fonte, usado só para apontar divergência. */
  preco_atual?: number | null;
};

export type MotivoPreco = { codigo: string; descricao: string };

export type ResolucaoPrecoSugerido = {
  sku: string | null;
  estado: EstadoPrecoSugerido;
  valor: number | null;
  moeda: string | null;
  origem: string | null;
  vigencia: { inicio: string | null; fim: string | null };
  selecionavel_internamente: boolean;
  selo: string | null;
  motivos: MotivoPreco[];
};

export const COD_PRECO = {
  SEM_SKU: "PS_SEM_SKU",
  SEM_VALOR: "PS_SEM_VALOR",
  SEM_MOEDA: "PS_SEM_MOEDA",
  SEM_ORIGEM: "PS_SEM_ORIGEM",
  FORA_VIGENCIA: "PS_FORA_DE_VIGENCIA",
  SKU_INDISPONIVEL: "PS_SKU_INDISPONIVEL",
  DEMO: "PS_DADOS_TESTE",
  DIVERGENCIA_CRITICA: "PS_DIVERGENCIA_CRITICA",
  DIVERGENCIA_INFORMATIVA: "PS_DIVERGENCIA_INFORMATIVA",
  PRECO_PRATICADO_DIFERENTE: "PS_PRECO_PRATICADO_DIFERENTE",
} as const;

const STATUS_INDISPONIVEL = new Set(["arquivado", "suspenso", "bloqueado", "inativo", "descontinuado"]);

function statusIndisponivel(s?: string | null): boolean {
  return !!s && STATUS_INDISPONIVEL.has(s.toLowerCase());
}

function foraDaVigencia(sku: SkuPrecoSugerido, hoje: Date): boolean {
  if (sku.vigencia_inicio && new Date(sku.vigencia_inicio) > hoje) return true;
  if (sku.vigencia_fim && new Date(sku.vigencia_fim) < hoje) return true;
  return false;
}

/**
 * Classifica o preço sugerido canônico de um SKU.
 * Nunca deriva valor de outra fonte e nunca resolve divergência sozinho.
 */
export function resolverPrecoSugerido(
  sku: SkuPrecoSugerido | null | undefined,
  divergencias: DivergenciaFonte[] = [],
  hoje: Date = new Date(),
): ResolucaoPrecoSugerido {
  const motivos: MotivoPreco[] = [];
  const base: ResolucaoPrecoSugerido = {
    sku: sku?.code ?? null,
    estado: "PRECO_SUGERIDO_BLOQUEADO",
    valor: null,
    moeda: null,
    origem: null,
    vigencia: { inicio: sku?.vigencia_inicio ?? null, fim: sku?.vigencia_fim ?? null },
    selecionavel_internamente: false,
    selo: null,
    motivos,
  };

  if (!sku) {
    motivos.push({ codigo: COD_PRECO.SEM_SKU, descricao: "Nenhum SKU canônico vinculado." });
    return base;
  }

  const valor =
    sku.preco_sugerido === null || sku.preco_sugerido === undefined || !Number.isFinite(Number(sku.preco_sugerido))
      ? null
      : Number(sku.preco_sugerido);
  const moeda = sku.moeda?.trim() || null;
  const origem = sku.fonte_versao?.trim() || sku.fonte_referencia?.trim() || null;

  if (sku.dados_teste === true)
    motivos.push({ codigo: COD_PRECO.DEMO, descricao: "SKU marcado como DEMO/TESTE: fora do uso operacional." });
  if (sku.archived_at || sku.ativo === false || statusIndisponivel(sku.status_produto) || statusIndisponivel(sku.status_fonte))
    motivos.push({ codigo: COD_PRECO.SKU_INDISPONIVEL, descricao: "SKU arquivado, suspenso ou bloqueado." });
  if (valor === null || valor <= 0)
    motivos.push({ codigo: COD_PRECO.SEM_VALOR, descricao: "SKU sem preço sugerido numérico na fonte canônica." });
  if (!moeda) motivos.push({ codigo: COD_PRECO.SEM_MOEDA, descricao: "Preço sugerido sem moeda registrada." });
  if (!origem)
    motivos.push({ codigo: COD_PRECO.SEM_ORIGEM, descricao: "Preço sugerido sem origem/versão rastreável." });
  if (foraDaVigencia(sku, hoje))
    motivos.push({ codigo: COD_PRECO.FORA_VIGENCIA, descricao: "Preço sugerido fora da vigência registrada." });

  const abertas = divergencias.filter((d) => d.resolvido !== true);
  const criticas = abertas.filter(divergenciaCritica);
  for (const d of criticas)
    motivos.push({
      codigo: COD_PRECO.DIVERGENCIA_CRITICA,
      descricao: d.detalhe?.trim() || `Divergência crítica não resolvida (${d.tipo}).`,
    });

  if (motivos.length > 0) return base;

  const informativas = abertas.filter((d) => !divergenciaCritica(d));
  for (const d of informativas)
    motivos.push({
      codigo: COD_PRECO.DIVERGENCIA_INFORMATIVA,
      descricao: d.detalhe?.trim() || `Divergência informativa aberta (${d.tipo}).`,
    });

  const praticado =
    sku.preco_atual === null || sku.preco_atual === undefined ? null : Number(sku.preco_atual);
  if (praticado !== null && Number.isFinite(praticado) && Math.abs(praticado - (valor as number)) > 0.01)
    motivos.push({
      codigo: COD_PRECO.PRECO_PRATICADO_DIFERENTE,
      descricao: `Preço praticado na fonte (${praticado}) difere do preço sugerido (${valor}).`,
    });

  const comRessalva = motivos.length > 0;
  return {
    ...base,
    estado: comRessalva ? "PRECO_SUGERIDO_COM_RESSALVA" : "PRECO_SUGERIDO_DISPONIVEL",
    valor,
    moeda,
    origem,
    selecionavel_internamente: true,
    selo: comRessalva ? SELO_PRECO_SUGERIDO : null,
    motivos,
  };
}

/* ------------------------------------------------------------------ */
/* Matriz de precedência                                               */
/* ------------------------------------------------------------------ */

export type OrigemValorOperacional =
  | "condicao_comercial_aprovada"
  | "proposta_aprovada"
  | "preco_sugerido_catalogo"
  | "sem_preco";

export const MATRIZ_PRECEDENCIA_PRECO: { ordem: number; origem: OrigemValorOperacional; regra: string }[] = [
  {
    ordem: 1,
    origem: "condicao_comercial_aprovada",
    regra: "Condição comercial específica aprovada e vigente prevalece sobre tudo.",
  },
  {
    ordem: 2,
    origem: "proposta_aprovada",
    regra: "Proposta aprovada prevalece quando não houver condição comercial aprovada.",
  },
  {
    ordem: 3,
    origem: "preco_sugerido_catalogo",
    regra: "Preço sugerido canônico é a referência operacional interna enquanto não houver aprovação específica.",
  },
  { ordem: 4, origem: "sem_preco", regra: "Sem valor utilizável: preencher a partir da fonte canônica." },
];

export type ValorOperacional = {
  origem: OrigemValorOperacional;
  valor: number | null;
  moeda: string | null;
  fonte: string | null;
  /** Valor final para cobrança/contrato só existe com aprovação específica. */
  valor_final: boolean;
  /** Referência interna que ainda exige validação comercial. */
  requer_validacao_comercial: boolean;
  selo: string | null;
  estado_preco_sugerido: EstadoPrecoSugerido | null;
  motivos: MotivoPreco[];
};

export function resolverValorOperacional(input: {
  condicaoAprovada?: { valor: number | null; moeda?: string | null; referencia?: string | null } | null;
  propostaAprovada?: { valor: number | null; moeda?: string | null; referencia?: string | null } | null;
  precoSugerido?: ResolucaoPrecoSugerido | null;
}): ValorOperacional {
  const c = input.condicaoAprovada;
  if (c && c.valor !== null && c.valor !== undefined)
    return {
      origem: "condicao_comercial_aprovada",
      valor: Number(c.valor),
      moeda: c.moeda ?? "BRL",
      fonte: c.referencia ?? "Condição comercial aprovada",
      valor_final: true,
      requer_validacao_comercial: false,
      selo: null,
      estado_preco_sugerido: input.precoSugerido?.estado ?? null,
      motivos: [],
    };

  const p = input.propostaAprovada;
  if (p && p.valor !== null && p.valor !== undefined)
    return {
      origem: "proposta_aprovada",
      valor: Number(p.valor),
      moeda: p.moeda ?? "BRL",
      fonte: p.referencia ?? "Proposta aprovada",
      valor_final: true,
      requer_validacao_comercial: false,
      selo: null,
      estado_preco_sugerido: input.precoSugerido?.estado ?? null,
      motivos: [],
    };

  const s = input.precoSugerido;
  if (s && s.selecionavel_internamente && s.valor !== null)
    return {
      origem: "preco_sugerido_catalogo",
      valor: s.valor,
      moeda: s.moeda,
      fonte: s.origem,
      valor_final: false,
      requer_validacao_comercial: true,
      selo: SELO_PRECO_SUGERIDO,
      estado_preco_sugerido: s.estado,
      motivos: s.motivos,
    };

  return {
    origem: "sem_preco",
    valor: null,
    moeda: null,
    fonte: null,
    valor_final: false,
    requer_validacao_comercial: true,
    selo: null,
    estado_preco_sugerido: s?.estado ?? null,
    motivos: s?.motivos ?? [{ codigo: COD_PRECO.SEM_SKU, descricao: "Sem preço utilizável na fonte canônica." }],
  };
}

/* ------------------------------------------------------------------ */
/* Uso por área                                                        */
/* ------------------------------------------------------------------ */

/** Planejador/Comercial podem selecionar preço disponível ou com ressalva. */
export function selecionavelNoPlanejador(r: ResolucaoPrecoSugerido): boolean {
  return r.selecionavel_internamente;
}

/** Rascunho de proposta/condição pode partir do preço sugerido válido. */
export function podeIniciarRascunhoComercial(r: ResolucaoPrecoSugerido): boolean {
  return r.selecionavel_internamente;
}

/**
 * Preço sugerido nunca autoriza cobrança, link, fatura ou Asaas.
 * Esta camada jamais autoriza ato externo: cobrança exige confirmação humana
 * explícita fora daqui, mesmo com valor aprovado.
 */
export function autorizaCobranca(_v: ValorOperacional): boolean {
  return false;
}

/** Financeiro: preço sugerido entra apenas como previsão interna. */
export function previsaoFinanceira(v: ValorOperacional): {
  previsao: number | null;
  moeda: string | null;
  caixa: false;
  rotulo: string;
} {
  return {
    previsao: v.valor,
    moeda: v.moeda,
    caixa: false,
    rotulo:
      v.origem === "preco_sugerido_catalogo"
        ? "Previsão interna a partir do preço sugerido — não é caixa, fatura nem cobrança."
        : "Previsão interna a partir de valor aprovado — não é caixa, fatura nem cobrança.",
  };
}

/* ------------------------------------------------------------------ */
/* Sinais do Painel Hoje                                               */
/* ------------------------------------------------------------------ */

export type SinalPrecoPainel = {
  codigo: string;
  severidade: "bloqueio" | "atencao";
  titulo: string;
  detalhe: string;
  destino: string;
};

/** Painel nunca lista catálogo: só sinais de bloqueio ligados a caso/SKU. */
export function sinaisPrecoPainel(itens: {
  casos: {
    caseId: string;
    codigo: string;
    sku: string | null;
    resolucao: ResolucaoPrecoSugerido;
    condicaoAprovada: boolean;
    condicaoVencida?: boolean;
  }[];
}): SinalPrecoPainel[] {
  const sinais: SinalPrecoPainel[] = [];
  for (const c of itens.casos) {
    if (c.condicaoAprovada && !c.condicaoVencida) continue;
    if (c.resolucao.estado === "PRECO_SUGERIDO_BLOQUEADO") {
      sinais.push({
        codigo: "PAINEL_PRECO_SUGERIDO_BLOQUEADO",
        severidade: "bloqueio",
        titulo: `${c.codigo} — sem preço sugerido utilizável`,
        detalhe: c.resolucao.motivos[0]?.descricao ?? "SKU sem preço sugerido canônico.",
        destino: `/casos/${c.caseId}`,
      });
      continue;
    }
    const critica = c.resolucao.motivos.find((m) => m.codigo === COD_PRECO.DIVERGENCIA_CRITICA);
    if (critica)
      sinais.push({
        codigo: "PAINEL_PRECO_DIVERGENCIA_CRITICA",
        severidade: "bloqueio",
        titulo: `${c.codigo} — divergência crítica de preço`,
        detalhe: critica.descricao,
        destino: `/casos/${c.caseId}`,
      });
    if (c.condicaoVencida)
      sinais.push({
        codigo: "PAINEL_CONDICAO_VENCIDA",
        severidade: "atencao",
        titulo: `${c.codigo} — condição comercial vencida ou ausente`,
        detalhe: "Valor operacional está apoiado apenas em referência do catálogo.",
        destino: `/casos/${c.caseId}`,
      });
  }
  return sinais;
}

/* ------------------------------------------------------------------ */
/* Override auditado da Proprietária                                   */
/* ------------------------------------------------------------------ */

export type PedidoOverridePreco = {
  papel: string;
  sku: string;
  motivo: string;
  fonte: string;
  valor_anterior: number | null;
  valor_novo: number | null;
  divergencias: DivergenciaFonte[];
  autora: string;
  em: string;
};

export type ResultadoOverridePreco =
  | { permitido: false; motivo: string }
  | {
      permitido: true;
      evento: {
        tipo: "override_divergencia_preco_sugerido";
        sku: string;
        motivo: string;
        fonte: string;
        valor_anterior: number | null;
        valor_novo: number | null;
        autora: string;
        em: string;
        estado_alvo: "pronto_para_confirmacao_externa";
      };
    };

/** Só a Proprietária Administradora (admin) assume divergência não crítica. */
export function avaliarOverrideDivergencia(p: PedidoOverridePreco): ResultadoOverridePreco {
  if (p.papel !== "admin")
    return { permitido: false, motivo: "Assumir divergência de preço é exclusivo da Proprietária Administradora." };
  if (!p.motivo.trim()) return { permitido: false, motivo: "Override exige motivo registrado." };
  if (!p.fonte.trim()) return { permitido: false, motivo: "Override exige fonte do valor." };
  if (p.divergencias.some(divergenciaCritica))
    return { permitido: false, motivo: "Divergência crítica não pode ser assumida: exige saneamento na fonte." };
  return {
    permitido: true,
    evento: {
      tipo: "override_divergencia_preco_sugerido",
      sku: p.sku,
      motivo: p.motivo.trim(),
      fonte: p.fonte.trim(),
      valor_anterior: p.valor_anterior,
      valor_novo: p.valor_novo,
      autora: p.autora,
      em: p.em,
      estado_alvo: "pronto_para_confirmacao_externa",
    },
  };
}

/** Atos que continuam exigindo confirmação final explícita da Proprietária. */
export const CONFIRMACAO_EXTERNA_OBRIGATORIA = [
  "envio_proposta",
  "contrato",
  "assinatura",
  "cobranca",
  "link_asaas",
  "pagamento",
  "comunicacao",
  "publicacao",
] as const;

export function exigeConfirmacaoExterna(acao: string): boolean {
  return (CONFIRMACAO_EXTERNA_OBRIGATORIA as readonly string[]).includes(acao);
}

/** Consolida contagem por estado para métricas internas. */
export function contarEstados(resolucoes: ResolucaoPrecoSugerido[]): Record<EstadoPrecoSugerido, number> {
  const base: Record<EstadoPrecoSugerido, number> = {
    PRECO_SUGERIDO_DISPONIVEL: 0,
    PRECO_SUGERIDO_COM_RESSALVA: 0,
    PRECO_SUGERIDO_BLOQUEADO: 0,
  };
  for (const r of resolucoes) base[r.estado] += 1;
  return base;
}
