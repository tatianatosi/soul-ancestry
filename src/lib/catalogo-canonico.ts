/**
 * Catálogo canônico de SKUs — saneamento e homologação.
 *
 * Regras institucionais:
 * - `product_catalog` é o ÚNICO modelo canônico de SKU/produto/preço.
 *   `sku_catalog` permanece apenas como registro legado.
 * - A Planilha Mestre de Produtos é fonte externa de referência. Nada é
 *   importado automaticamente: o sistema guarda somente metadados de fonte.
 * - Nada aqui cria, altera, ativa, desativa ou arquiva SKU, preço, link Asaas,
 *   proposta, cobrança ou pagamento. Nenhuma chamada externa é executada.
 * - Preço, prazo, parcelamento, vencimento, entregável, país, processo,
 *   elegibilidade, link e homologação NUNCA são inferidos.
 */

export type EstadoCatalogo =
  | "rascunho"
  | "em_revisao"
  | "homologado_ativo"
  | "pausado"
  | "arquivado"
  | "substituido";

export type PrioridadePortfolio = "top_10" | "top_30" | "cauda_longa" | "fora_do_portfolio";

export type TipoCobranca = "avulsa" | "parcelada" | "recorrente" | "sob_consulta" | "nao_cobravel_diretamente";

export type EstadoPreco = "nao_homologado" | "em_revisao" | "homologado" | "sob_consulta";

export type EstadoLinkCobranca =
  | "nao_criado"
  | "pendente_revisao"
  | "ativo_validado"
  | "ativo_em_uso"
  | "duplicado_sobreposto"
  | "desatualizado"
  | "pausado"
  | "arquivado"
  | "quebrado"
  | "nao_aplicavel";

export const ROTULO_ESTADO_CATALOGO: Record<EstadoCatalogo, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em revisão",
  homologado_ativo: "Homologado ativo",
  pausado: "Pausado",
  arquivado: "Arquivado",
  substituido: "Substituído",
};

export const ROTULO_PRIORIDADE: Record<PrioridadePortfolio, string> = {
  top_10: "Top 10",
  top_30: "Top 30",
  cauda_longa: "Cauda longa",
  fora_do_portfolio: "Fora do portfólio",
};

export const ROTULO_ESTADO_LINK: Record<EstadoLinkCobranca, string> = {
  nao_criado: "Link não criado",
  pendente_revisao: "Link pendente de revisão",
  ativo_validado: "Link ativo validado",
  ativo_em_uso: "Link ativo em uso",
  duplicado_sobreposto: "Link duplicado/sobreposto",
  desatualizado: "Link desatualizado",
  pausado: "Link pausado",
  arquivado: "Link arquivado",
  quebrado: "Link quebrado",
  nao_aplicavel: "Link não aplicável",
};

export type LinkCobrancaRef = {
  id: string;
  sku_codigo: string;
  estado_link: EstadoLinkCobranca;
  tipo_link: string;
  referencia_url: string | null;
  valor_validado: number | null;
  moeda: string;
  validado_em: string | null;
  validado_por: string | null;
  versao_sku_associada: string | null;
  versao_preco_associada: string | null;
  divergencia: string | null;
  observacao_interna: string | null;
  dados_teste: boolean;
};

export type SkuCanonico = {
  id: string;
  sku_codigo: string;
  produto: string;
  categoria: string | null;
  subcategoria: string | null;
  estado_catalogo: EstadoCatalogo;
  prioridade_portfolio: PrioridadePortfolio;
  responsavel_comercial: string | null;
  responsavel_operacional: string | null;
  versao_catalogo: string;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  preco: number | null;
  moeda: string;
  preco_fonte: string | null;
  preco_estado_homologacao: EstadoPreco;
  tipo_cobranca: TipoCobranca;
  entregaveis: string[];
  inclusoes: string[];
  exclusoes: string[];
  pre_requisitos: string[];
  dependencias_externas: string[];
  prazo_fonte_formal: string | null;
  escopo_aplicavel: string[];
  regras_anexos: string[];
  regra_uso: string | null;
  planilha_mestre_versao: string | null;
  planilha_mestre_identificador: string | null;
  responsavel_validacao_fonte: string | null;
  estado_reconciliacao: string;
  homologado_por: string | null;
  homologado_em: string | null;
  substituido_por: string | null;
  dados_teste: boolean;
  atualizado_em: string | null;
  /** Fase da jornada na fonte (`product_catalog.jornada_fase`), vocabulário próprio — traduzir com `jornada-de-para.ts` antes de exibir. */
  jornada_fase: string | null;
  links: LinkCobrancaRef[];
  /** Quantidade de propostas/casos pendentes que já referenciam este SKU. */
  usos_pendentes: number;
};

/** Preço, prazo, parcelas e vencimento nunca são inferidos. */
export function valorInferido(): null {
  return null;
}

/** Requisitos verificáveis para um SKU poder ser homologado. */
export function pendenciasDeHomologacao(s: SkuCanonico): string[] {
  const p: string[] = [];
  if (!s.sku_codigo.trim()) p.push("Código do SKU ausente");
  if (!s.produto.trim() || !s.categoria) p.push("Produto/categoria incompletos");
  if (!s.responsavel_comercial) p.push("Sem responsável comercial");
  if (!s.responsavel_operacional) p.push("Sem responsável operacional");
  if (s.tipo_cobranca !== "sob_consulta" && s.tipo_cobranca !== "nao_cobravel_diretamente") {
    if (s.preco === null || s.preco_estado_homologacao !== "homologado" || !s.preco_fonte) {
      p.push("Preço sem fonte homologada");
    }
  }
  if (!s.entregaveis.length) p.push("Sem entregáveis");
  if (!s.inclusoes.length) p.push("Sem inclusões");
  if (!s.exclusoes.length) p.push("Sem exclusões");
  if (!s.versao_catalogo || !s.vigencia_inicio) p.push("Versão/vigência incompletas");
  if (!s.regra_uso && !s.escopo_aplicavel.length) p.push("Sem regra de aplicabilidade");
  if (!s.planilha_mestre_versao || !s.planilha_mestre_identificador) p.push("Sem origem/referência de planilha");
  if (!s.homologado_por || !s.homologado_em) p.push("Sem auditoria de aprovação humana");
  return p;
}

/** Um link só é considerado validado quando bate com a versão homologada do SKU. */
export function linkConsistente(s: SkuCanonico, l: LinkCobrancaRef): { consistente: boolean; motivo: string | null } {
  if (l.estado_link === "nao_aplicavel") return { consistente: true, motivo: null };
  if (l.estado_link !== "ativo_validado" && l.estado_link !== "ativo_em_uso")
    return { consistente: false, motivo: ROTULO_ESTADO_LINK[l.estado_link] };
  if (s.estado_catalogo !== "homologado_ativo") return { consistente: false, motivo: "SKU não homologado" };
  if (l.valor_validado === null || s.preco === null || Number(l.valor_validado) !== Number(s.preco))
    return { consistente: false, motivo: "Valor do link divergente do preço homologado" };
  if (l.moeda !== s.moeda) return { consistente: false, motivo: "Moeda divergente" };
  if (l.versao_sku_associada !== s.versao_catalogo)
    return { consistente: false, motivo: "Versão do SKU divergente do link" };
  if (!l.validado_em || !l.validado_por) return { consistente: false, motivo: "Validação sem data/responsável" };
  if (l.divergencia) return { consistente: false, motivo: l.divergencia };
  return { consistente: true, motivo: null };
}

/** Checkout só é habilitado com link efetivamente validado e coerente. */
export function checkoutHabilitado(s: SkuCanonico): boolean {
  if (s.tipo_cobranca === "sob_consulta" || s.tipo_cobranca === "nao_cobravel_diretamente") return false;
  if (s.estado_catalogo !== "homologado_ativo") return false;
  const validos = s.links.filter((l) => linkConsistente(s, l).consistente && l.estado_link !== "nao_aplicavel");
  return validos.length === 1;
}

/** Bloqueios de uso do SKU em proposta, OS, Anexo I/II, condição comercial ou checkout. */
export function bloqueiosDeUso(s: SkuCanonico, opcoes?: { exigeCheckout?: boolean }): string[] {
  const b: string[] = [];
  if (s.estado_catalogo !== "homologado_ativo") b.push(`SKU ${ROTULO_ESTADO_CATALOGO[s.estado_catalogo].toLowerCase()}`);
  if (s.dados_teste) b.push("SKU marcado como TESTE");
  const cobravel = s.tipo_cobranca !== "sob_consulta" && s.tipo_cobranca !== "nao_cobravel_diretamente";
  if (cobravel && (s.preco === null || s.preco_estado_homologacao !== "homologado"))
    b.push("Preço sem homologação");
  if (!s.entregaveis.length || !s.inclusoes.length || !s.exclusoes.length)
    b.push("Entregáveis/inclusões/exclusões incompletos");
  if (!s.responsavel_comercial || !s.responsavel_operacional) b.push("SKU sem proprietário");
  if (s.estado_reconciliacao === "divergente") b.push("Conflito de versão/preço com a fonte");
  if (opcoes?.exigeCheckout && !checkoutHabilitado(s)) b.push("Link de cobrança não validado");
  return b;
}

export function podeAlimentarProposta(s: SkuCanonico, opcoes?: { exigeCheckout?: boolean }): boolean {
  return bloqueiosDeUso(s, opcoes).length === 0;
}

/* ------------------------------------------------------------------ */
/* Filas de saneamento do Painel Hoje                                  */
/* ------------------------------------------------------------------ */

export type FilaCatalogo =
  | "bloqueia_proposta"
  | "revisar_link"
  | "pronto_homologacao"
  | "portfolio_racionalizar";

export const ROTULO_FILA_CATALOGO: Record<FilaCatalogo, string> = {
  bloqueia_proposta: "Bloqueia proposta/contrato",
  revisar_link: "Revisar link de cobrança",
  pronto_homologacao: "Pronto para homologação",
  portfolio_racionalizar: "Portfólio a racionalizar",
};

export type ItemFilaCatalogo = {
  fila: FilaCatalogo;
  sku_codigo: string;
  produto: string;
  prioridade: PrioridadePortfolio;
  estado: EstadoCatalogo;
  pendencia_principal: string;
  responsavel: string | null;
  impacto: string;
  atualizado_em: string | null;
  acao_humana: string;
  dados_teste: boolean;
  /** Peso de priorização (menor = mais urgente). */
  ordem: number;
};

const PESO_PRIORIDADE: Record<PrioridadePortfolio, number> = {
  top_10: 0,
  top_30: 1,
  cauda_longa: 2,
  fora_do_portfolio: 3,
};

function pesoOrdem(s: SkuCanonico, fila: FilaCatalogo): number {
  const top = s.prioridade_portfolio === "top_10" || s.prioridade_portfolio === "top_30";
  if (fila === "bloqueia_proposta" && top) return 1;
  if (s.usos_pendentes > 0) return 2;
  if (fila === "revisar_link") return 3;
  if (fila === "portfolio_racionalizar" && s.estado_catalogo === "substituido") return 4;
  if (fila === "portfolio_racionalizar") return 5;
  return 3 + PESO_PRIORIDADE[s.prioridade_portfolio];
}

function item(s: SkuCanonico, fila: FilaCatalogo, pendencia: string, acao: string): ItemFilaCatalogo {
  return {
    fila,
    sku_codigo: s.sku_codigo,
    produto: s.produto,
    prioridade: s.prioridade_portfolio,
    estado: s.estado_catalogo,
    pendencia_principal: pendencia,
    responsavel: s.responsavel_comercial ?? s.responsavel_operacional ?? null,
    impacto:
      s.usos_pendentes > 0
        ? `${s.usos_pendentes} proposta(s)/caso(s) pendente(s) dependem deste SKU`
        : "Sem proposta/caso pendente dependente",
    atualizado_em: s.atualizado_em,
    acao_humana: acao,
    dados_teste: s.dados_teste,
    ordem: pesoOrdem(s, fila),
  };
}

function ordenar(itens: ItemFilaCatalogo[]): ItemFilaCatalogo[] {
  return [...itens].sort(
    (a, b) =>
      a.ordem - b.ordem ||
      PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade] ||
      a.sku_codigo.localeCompare(b.sku_codigo),
  );
}

/** Um SKU aparece no máximo uma vez por fila (dedup por código). */
function dedup(itens: ItemFilaCatalogo[]): ItemFilaCatalogo[] {
  const vistos = new Set<string>();
  return ordenar(itens).filter((i) => (vistos.has(i.sku_codigo) ? false : (vistos.add(i.sku_codigo), true)));
}

export type FilasCatalogo = Record<FilaCatalogo, ItemFilaCatalogo[]>;

export type IndicadoresCatalogo = {
  por_estado: Record<EstadoCatalogo, number>;
  top_10: number;
  top_30: number;
  bloqueiam_proposta: number;
  pendencias_por_responsavel: { responsavel: string; total: number }[];
  links_por_estado: Record<string, number>;
  prontos_para_homologacao: number;
};

export type SaneamentoCatalogo = { filas: FilasCatalogo; indicadores: IndicadoresCatalogo };

/**
 * Deriva as filas de saneamento. Sem efeitos: apenas leitura e classificação.
 * `incluirTeste = false` esconde registros TESTE por padrão.
 */
export function saneamentoDeCatalogo(
  skus: ReadonlyArray<SkuCanonico>,
  opcoes?: { incluirTeste?: boolean },
): SaneamentoCatalogo {
  const lista = skus.filter((s) => (opcoes?.incluirTeste ? true : !s.dados_teste));

  const bloqueia: ItemFilaCatalogo[] = [];
  const link: ItemFilaCatalogo[] = [];
  const pronto: ItemFilaCatalogo[] = [];
  const portfolio: ItemFilaCatalogo[] = [];

  for (const s of lista) {
    const ativoOuPareto =
      s.estado_catalogo === "homologado_ativo" ||
      s.prioridade_portfolio === "top_10" ||
      s.prioridade_portfolio === "top_30";

    const bloqueios = bloqueiosDeUso(s).filter((m) => m !== "SKU marcado como TESTE");
    if (ativoOuPareto && bloqueios.length) {
      bloqueia.push(item(s, "bloqueia_proposta", bloqueios[0], "Completar dado na fonte e submeter à homologação"));
    }

    const problemasLink = s.links.length
      ? s.links
          .map((l) => linkConsistente(s, l))
          .filter((r) => !r.consistente)
          .map((r) => r.motivo as string)
      : s.tipo_cobranca === "sob_consulta" || s.tipo_cobranca === "nao_cobravel_diretamente"
        ? []
        : ["Link de cobrança ausente"];
    const duplicado = s.links.filter((l) => l.estado_link === "ativo_validado" || l.estado_link === "ativo_em_uso").length > 1;
    if (duplicado) problemasLink.unshift("Link duplicado/sobreposto");
    if (problemasLink.length) {
      link.push(item(s, "revisar_link", problemasLink[0], "Revalidar link contra a versão homologada do SKU"));
    }

    const pendencias = pendenciasDeHomologacao(s);
    if (
      !pendencias.length &&
      s.estado_reconciliacao !== "divergente" &&
      (s.estado_catalogo === "em_revisao" || s.estado_catalogo === "rascunho")
    ) {
      pronto.push(item(s, "pronto_homologacao", "Campos completos, sem conflito", "Decisão humana de homologação"));
    }

    const racionalizar =
      s.estado_catalogo === "substituido" ||
      s.prioridade_portfolio === "fora_do_portfolio" ||
      (s.prioridade_portfolio === "cauda_longa" && s.usos_pendentes === 0) ||
      s.links.some((l) => l.estado_link === "duplicado_sobreposto");
    if (racionalizar) {
      const motivo =
        s.estado_catalogo === "substituido"
          ? "Substituído por outro SKU"
          : s.links.some((l) => l.estado_link === "duplicado_sobreposto")
            ? "Link duplicado/sobreposto"
            : s.prioridade_portfolio === "fora_do_portfolio"
              ? "Fora do portfólio alvo"
              : "Cauda longa sem uso";
      portfolio.push(item(s, "portfolio_racionalizar", motivo, "Decidir manter, fundir ou arquivar"));
    }
  }

  const por_estado = {
    rascunho: 0,
    em_revisao: 0,
    homologado_ativo: 0,
    pausado: 0,
    arquivado: 0,
    substituido: 0,
  } as Record<EstadoCatalogo, number>;
  const links_por_estado: Record<string, number> = {};
  const porResponsavel = new Map<string, number>();

  for (const s of lista) {
    por_estado[s.estado_catalogo] += 1;
    for (const l of s.links) links_por_estado[l.estado_link] = (links_por_estado[l.estado_link] ?? 0) + 1;
  }
  for (const i of [...bloqueia, ...link]) {
    const r = i.responsavel ?? "Sem responsável";
    porResponsavel.set(r, (porResponsavel.get(r) ?? 0) + 1);
  }

  const filasDedup: FilasCatalogo = {
    bloqueia_proposta: dedup(bloqueia),
    revisar_link: dedup(link),
    pronto_homologacao: dedup(pronto),
    portfolio_racionalizar: dedup(portfolio),
  };

  return {
    filas: filasDedup,
    indicadores: {
      por_estado,
      top_10: lista.filter((s) => s.prioridade_portfolio === "top_10").length,
      top_30: lista.filter((s) => s.prioridade_portfolio === "top_30").length,
      bloqueiam_proposta: filasDedup.bloqueia_proposta.length,
      pendencias_por_responsavel: [...porResponsavel.entries()]
        .map(([responsavel, total]) => ({ responsavel, total }))
        .sort((a, b) => b.total - a.total || a.responsavel.localeCompare(b.responsavel)),
      links_por_estado,
      prontos_para_homologacao: filasDedup.pronto_homologacao.length,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Motor: catálogo por fase da jornada                                 */
/* ------------------------------------------------------------------ */

export type ItemCatalogoPorFase = {
  sku_codigo: string;
  produto: string;
  estado_catalogo: EstadoCatalogo;
  prioridade_portfolio: PrioridadePortfolio;
  bloqueado: boolean;
  pendencia_principal: string | null;
};

export type FaseComCatalogo = {
  fase: string | null;
  rotulo: string;
  /** Verdadeiro quando pelo menos um SKU da fase chegou por correspondência aproximada. */
  temAproximacao: boolean;
  itens: ItemCatalogoPorFase[];
  homologados: number;
  bloqueados: number;
  total: number;
};

/**
 * Agrupa o catálogo real por fase canônica da jornada, traduzindo
 * `jornada_fase` pelo dicionário `produto_catalogo` (`jornada-de-para.ts`).
 * SKU sem `jornada_fase` reconhecido cai em `fase: null` ("sem fase
 * reconhecida") em vez de ser descartado ou de ganhar fase inventada — é
 * motor de leitura, não reclassifica nada na fonte.
 */
export function catalogoPorFaseJornada(
  skus: ReadonlyArray<SkuCanonico>,
  traduzir: (dicionario: "produto_catalogo", valor: string) => { canonico: string | null; rotuloCanonico: string; precisao: "exata" | "aproximada" } | null,
  opcoes?: { incluirTeste?: boolean },
): FaseComCatalogo[] {
  const lista = skus.filter((s) => (opcoes?.incluirTeste ? true : !s.dados_teste));
  const grupos = new Map<string | null, FaseComCatalogo>();

  for (const s of lista) {
    const correspondencia = s.jornada_fase ? traduzir("produto_catalogo", s.jornada_fase) : null;
    const fase = correspondencia?.canonico ?? null;
    const rotuloFase = correspondencia?.rotuloCanonico ?? (s.jornada_fase ? `Sem correspondência canônica (${s.jornada_fase})` : "Sem fase informada na fonte");
    const aproximada = correspondencia?.precisao === "aproximada";

    if (!grupos.has(fase)) {
      grupos.set(fase, { fase, rotulo: rotuloFase, temAproximacao: false, itens: [], homologados: 0, bloqueados: 0, total: 0 });
    }
    const grupo = grupos.get(fase)!;
    const bloqueios = bloqueiosDeUso(s);
    grupo.itens.push({
      sku_codigo: s.sku_codigo,
      produto: s.produto,
      estado_catalogo: s.estado_catalogo,
      prioridade_portfolio: s.prioridade_portfolio,
      bloqueado: bloqueios.length > 0,
      pendencia_principal: bloqueios[0] ?? null,
    });
    grupo.total += 1;
    if (s.estado_catalogo === "homologado_ativo") grupo.homologados += 1;
    if (bloqueios.length > 0) grupo.bloqueados += 1;
    if (aproximada) grupo.temAproximacao = true;
  }

  const ORDEM_FASES = [
    "aceite_e_formalizacao",
    "onboarding",
    "pesquisa_inicial",
    "pesquisa_e_validacao",
    "preparacao_documental",
    "protocolo_e_acompanhamento",
    "reconhecimento",
    "pos_reconhecimento",
  ];
  return [...grupos.values()].sort((a, b) => {
    const ia = a.fase ? ORDEM_FASES.indexOf(a.fase) : -1;
    const ib = b.fase ? ORDEM_FASES.indexOf(b.fase) : -1;
    if (ia === -1 && ib === -1) return a.rotulo.localeCompare(b.rotulo);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}
