/**
 * Cadeia operacional — ligação entre elos JÁ EXISTENTES.
 *
 * PLANEJADOR (case_plans) → PROPOSTA ESTRUTURADA (proposals) →
 * SKU/PREÇO (product_catalog, Planilha Mestre) → CONDIÇÃO COMERCIAL
 * (commercial_conditions) → OS/ANEXO I (service_orders + contract_scope_items)
 * → PRÉVIA CONTRATUAL PERSISTIDA (contract_parameter_previews) →
 * REVISÃO HUMANA → ASSINATURA (preparada e desabilitada).
 *
 * Lógica pura: nada aqui assina, cobra, comunica, pesquisa ou infere valor
 * ausente. Ausência de fonte vira pendência explícita; conflito vira bloqueio.
 */

import type { FaseJornada } from "@/lib/onboarding-jornada";
import type { ProdutoPaiId } from "@/lib/planejador-produtos-pai";

export const CADEIA_OPERACIONAL_VERSAO = "CADEIA-OPERACIONAL-v1.0";

export const COMPOSICOES = ["individual", "casal", "nucleo_familiar"] as const;
export type Composicao = (typeof COMPOSICOES)[number];

export type EstadoFonte = "confirmada" | "pendente" | "conflito";
export type Fonte = { chave: string; estado: EstadoFonte; referencia?: string | null };

export type EntradaPlanejador = {
  caseId: string;
  objetivo: string | null;
  etapa: string | null;
  composicao: Composicao | null;
  /** País/rota só quando confirmado — o motor nunca infere. */
  rotaConfirmada: string | null;
  produtoSkuCodigo: string | null;
  dadosDisponiveis: string[];
  dependenciasCliente: string[];
  dependenciasTerceiros: string[];
  fontes: Fonte[];
  responsavelUserId: string | null;
  proximaAcao: string | null;
  prazoProximaAcao: string | null;
  faseJornada: FaseJornada | null;
  /**
   * Produto-Pai canônico do caso (PP-01..PP-09).
   *
   * 21/09/2026 (regra de autoridade 2): governa jornada, marcos e ligação
   * multipaís. Nulo é estado legítimo — "ainda não definido" —, nunca
   * inferido do catálogo/SKU legado (regra 4).
   */
  produtoPaiId: ProdutoPaiId | null;
  checklist: string[];
  perguntas: string[];
  marcos: string[];
  entregas: string[];
  microentregas: string[];
  regrasAnexos: string[];
};

/**
 * Fase usada quando o planejador é salvo sem fase escolhida.
 *
 * 21/09/2026 — `case_plans.fase_jornada` é `text NOT NULL DEFAULT
 * 'aceite_e_formalizacao'` com CHECK de 8 valores (migration
 * `20260821123530`). O motor emitia `null` aqui, e `sincronizarPlanejador`
 * mandava esse `null` explícito no payload: em Postgres, NULL explícito NÃO
 * cai no DEFAULT — viola o NOT NULL. O default passa a ser explícito no
 * motor, com o mesmo valor da coluna, para que o contrato feche dos dois
 * lados. Isto não escolhe fase por ninguém: é o mesmo estado inicial que o
 * banco já assumiria.
 */
export const FASE_JORNADA_PADRAO: FaseJornada = "aceite_e_formalizacao";

export type SaidaPlanejador = {
  /** Nunca nulo: a coluna é NOT NULL com CHECK. Ver `FASE_JORNADA_PADRAO`. */
  fase_jornada: FaseJornada;
  /** Nulo é legítimo: coluna nullable, "produto-pai ainda não definido". */
  produto_pai_id: ProdutoPaiId | null;
  checklist_aplicavel: string[];
  perguntas: string[];
  dependencias_cliente: string[];
  dependencias_terceiros: string[];
  pendencias: string[];
  bloqueios: string[];
  responsavel_user_id: string | null;
  proxima_acao: string | null;
  prazo_proxima_acao: string | null;
  marcos: string[];
  entregas: string[];
  microentregas: string[];
  regras_anexos: string[];
  revisao_humana: "pendente" | "aprovada";
  hash: string;
};

/** Hash estável (djb2) usado para idempotência de reprocessamento e versões. */
export function hashConteudo(valor: unknown): string {
  const texto = JSON.stringify(valor ?? null);
  let h = 5381;
  for (let i = 0; i < texto.length; i += 1) h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
  return `h${h.toString(16)}`;
}

const vazio = (v: string | null | undefined) => !String(v ?? "").trim();
const limpar = (lista: string[] | null | undefined) =>
  [...new Set((lista ?? []).map((t) => String(t).trim()).filter((t) => t.length > 1))];

/**
 * Avalia o planejador: devolve saídas persistíveis, pendências explícitas
 * (ausência de fonte) e bloqueios (conflito de fonte). Não infere nada.
 */
export function avaliarPlanejador(e: EntradaPlanejador): SaidaPlanejador {
  const pendencias: string[] = [];
  const bloqueios: string[] = [];

  if (vazio(e.objetivo)) pendencias.push("Objetivo do caso não declarado no planejador.");
  if (vazio(e.etapa)) pendencias.push("Etapa atual não declarada no planejador.");
  if (!e.composicao) pendencias.push("Composição (individual, casal ou núcleo familiar) não declarada.");
  if (vazio(e.rotaConfirmada)) pendencias.push("País/rota ainda não confirmado — o motor não infere rota nem elegibilidade.");
  if (vazio(e.produtoSkuCodigo)) pendencias.push("SKU do catálogo não selecionado no planejador.");
  if (!e.responsavelUserId) pendencias.push("Plano sem responsável nominal.");
  if (vazio(e.proximaAcao)) pendencias.push("Plano sem próxima ação declarada.");
  if (!e.prazoProximaAcao) pendencias.push("Plano sem prazo datado da próxima ação.");

  const entregas = limpar(e.entregas);
  const microentregas = limpar(e.microentregas);
  const marcos = limpar(e.marcos);
  const checklist = limpar(e.checklist);

  if (!entregas.length) pendencias.push("Nenhuma entrega declarada no planejador.");
  if (!microentregas.length) pendencias.push("Nenhuma microentrega declarada no planejador.");
  if (!marcos.length) pendencias.push("Nenhum marco declarado no planejador.");
  if (!checklist.length) pendencias.push("Checklist aplicável não declarado.");

  for (const f of e.fontes) {
    if (f.estado === "pendente") pendencias.push(`Fonte “${f.chave}” pendente de confirmação.`);
    if (f.estado === "conflito") bloqueios.push(`Fonte “${f.chave}” em conflito: exige revisão humana.`);
  }

  const saida: Omit<SaidaPlanejador, "hash"> = {
    fase_jornada: e.faseJornada ?? FASE_JORNADA_PADRAO,
    produto_pai_id: e.produtoPaiId ?? null,
    checklist_aplicavel: checklist,
    perguntas: limpar(e.perguntas),
    dependencias_cliente: limpar(e.dependenciasCliente),
    dependencias_terceiros: limpar(e.dependenciasTerceiros),
    pendencias,
    bloqueios,
    responsavel_user_id: e.responsavelUserId,
    proxima_acao: e.proximaAcao,
    prazo_proxima_acao: e.prazoProximaAcao,
    marcos,
    entregas,
    microentregas,
    regras_anexos: limpar(e.regrasAnexos),
    revisao_humana: "pendente",
  };

  return { ...saida, hash: hashConteudo(saida) };
}

export function planejadorLiberaProposta(s: SaidaPlanejador): { ok: boolean; motivos: string[] } {
  const motivos = [...s.bloqueios, ...s.pendencias];
  return { ok: motivos.length === 0, motivos };
}

/* ------------------------------------------------------------------ */
/* Proposta estruturada                                                */
/* ------------------------------------------------------------------ */

export type PessoaEscopo = { nome: string; papel: string };

export type EscopoEstruturado = {
  objetivo: string | null;
  etapa: string | null;
  composicao: Composicao | null;
  pessoas: PessoaEscopo[];
  servicos_incluidos: string[];
  entregas: string[];
  microentregas: string[];
  inclusoes: string[];
  exclusoes: string[];
  dependencias_cliente: string[];
  dependencias_terceiros: string[];
  anexos_previstos: string[];
  origem: { plan_id: string | null; plano_hash: string | null; sku_codigo: string | null; fonte_preco: string | null };
};

export type SkuCanonicoProposta = {
  id: string;
  code: string;
  ativo: boolean;
  elegivel_para_proposta: boolean;
  preco_sugerido: number | null;
  moeda: string | null;
  fonte_referencia: string | null;
  inclusoes: string[];
  exclusoes: string[];
  entregaveis: string[];
  dados_teste: boolean;
};

export type PropostaEstruturada = {
  id?: string;
  case_id: string | null;
  plan_id: string | null;
  versao: number | null;
  status: string | null;
  escopo_estruturado: EscopoEstruturado | null;
  product_catalog_id: string | null;
  valor: number | null;
  moeda: string | null;
  preco_fonte_referencia: string | null;
  forma_pagamento: string | null;
  parcelas_declaradas: number | null;
  primeiro_vencimento_declarado: string | null;
  responsavel_comercial: string | null;
  responsavel_operacional: string | null;
};

/** Monta o escopo estruturado da proposta apenas com o que o planejador e o SKU declaram. */
export function montarEscopoEstruturado(input: {
  entrada: EntradaPlanejador;
  saida: SaidaPlanejador;
  planId: string | null;
  sku: SkuCanonicoProposta | null;
  pessoas: PessoaEscopo[];
}): EscopoEstruturado {
  return {
    objetivo: input.entrada.objetivo,
    etapa: input.entrada.etapa,
    composicao: input.entrada.composicao,
    pessoas: input.pessoas,
    servicos_incluidos: limpar(input.sku?.entregaveis ?? []),
    entregas: input.saida.entregas,
    microentregas: input.saida.microentregas,
    inclusoes: limpar(input.sku?.inclusoes ?? []),
    exclusoes: limpar(input.sku?.exclusoes ?? []),
    dependencias_cliente: input.saida.dependencias_cliente,
    dependencias_terceiros: input.saida.dependencias_terceiros,
    anexos_previstos: input.saida.regras_anexos,
    origem: {
      plan_id: input.planId,
      plano_hash: input.saida.hash,
      sku_codigo: input.sku?.code ?? null,
      fonte_preco: input.sku?.fonte_referencia ?? null,
    },
  };
}

/** Bloqueios de aprovação da proposta. Preço livre e inferência são proibidos. */
export function bloqueiosAprovacaoProposta(p: PropostaEstruturada, sku: SkuCanonicoProposta | null): string[] {
  const b: string[] = [];
  const e = p.escopo_estruturado;

  if (!p.case_id) b.push("Proposta sem caso vinculado.");
  if (!p.plan_id) b.push("Proposta sem origem no planejador.");
  if (!sku) b.push("Nenhum SKU do catálogo selecionado.");
  else {
    if (!sku.ativo || !sku.elegivel_para_proposta) b.push(`SKU ${sku.code} não está ativo/elegível para proposta.`);
    if (sku.preco_sugerido === null) b.push(`SKU ${sku.code} sem preço sugerido na fonte mestre.`);
    if (!sku.fonte_referencia) b.push(`SKU ${sku.code} sem referência da Planilha Mestre.`);
    if (!sku.inclusoes.length) b.push(`SKU ${sku.code} sem inclusões na fonte: exige complementação formal.`);
    if (!sku.exclusoes.length) b.push(`SKU ${sku.code} sem exclusões na fonte: exige complementação formal.`);
    if (p.valor !== null && sku.preco_sugerido !== null && Number(p.valor) !== Number(sku.preco_sugerido))
      b.push("Preço da proposta diverge do preço da fonte mestre: preço livre não é permitido.");
  }

  if (!e) b.push("Proposta sem escopo estruturado derivado do planejador.");
  else {
    if (vazio(e.objetivo)) b.push("Escopo sem objetivo.");
    if (!e.composicao) b.push("Escopo sem composição declarada.");
    if (!e.pessoas.length) b.push("Escopo sem pessoas abrangidas e seus papéis.");
    if (!e.servicos_incluidos.length) b.push("Escopo sem serviços incluídos.");
    if (!e.entregas.length) b.push("Escopo sem entregas.");
    if (!e.microentregas.length) b.push("Escopo sem microentregas.");
    if (!e.inclusoes.length) b.push("Escopo sem inclusões.");
    if (!e.exclusoes.length) b.push("Escopo sem exclusões.");
  }

  if (vazio(p.responsavel_comercial)) b.push("Proposta sem responsável comercial.");
  if (vazio(p.responsavel_operacional)) b.push("Proposta sem responsável operacional.");
  if (vazio(p.preco_fonte_referencia)) b.push("Proposta sem referência de fonte comercial.");

  return b;
}

/* ------------------------------------------------------------------ */
/* Condição comercial (elo 3)                                          */
/* ------------------------------------------------------------------ */

export type CondicaoDerivada = {
  proposal_id: string;
  product_catalog_id: string | null;
  valor_total_referencia: number;
  moeda: string;
  forma_pagamento: string | null;
  parcelas: number | null;
  primeiro_vencimento: string | null;
  origem: string;
  pendencias: string[];
};

/**
 * Deriva a condição comercial da proposta aprovada. Parcelas e vencimentos
 * só existem quando declarados; ausência vira pendência, nunca inferência.
 */
export function derivarCondicaoComercial(
  p: PropostaEstruturada,
  sku: SkuCanonicoProposta | null | undefined,
): CondicaoDerivada {
  const pendencias: string[] = [];
  // 25/10/2026: proposta sem SKU é aceita desde 10/10; antes isto lançava
  // TypeError (sku.id) e a condição nunca era gravada, travando a OS.
  if (!sku) {
    pendencias.push("Proposta sem SKU do catálogo — valor tomado da própria proposta.");
  }
  if (!p.forma_pagamento) pendencias.push("Modalidade de pagamento não declarada na proposta.");
  if (!p.parcelas_declaradas) pendencias.push("Parcelas não declaradas na proposta — o motor não infere.");
  if (!p.primeiro_vencimento_declarado)
    pendencias.push("Vencimentos não declarados na proposta — formalização final permanece bloqueada.");

  return {
    proposal_id: String(p.id),
    product_catalog_id: sku?.id ?? null,
    valor_total_referencia: sku ? Number(sku.preco_sugerido) : Number(p.valor ?? 0),
    moeda: sku?.moeda ?? "BRL",
    forma_pagamento: p.forma_pagamento,
    parcelas: p.parcelas_declaradas,
    primeiro_vencimento: p.primeiro_vencimento_declarado,
    origem: sku?.fonte_referencia ?? (sku ? "planilha_mestre" : "proposta_sem_sku"),
    pendencias,
  };
}

/* ------------------------------------------------------------------ */
/* OS / Anexo I (elo 4)                                                */
/* ------------------------------------------------------------------ */

export type ConteudoOS = {
  objetivo: string | null;
  escopo: string[];
  inclusoes: string[];
  exclusoes: string[];
  entregas: string[];
  microentregas: string[];
  dependencias: string[];
  pessoas: PessoaEscopo[];
  sku_codigo: string | null;
  condicao_id: string | null;
};

export function conteudoOSDaProposta(p: PropostaEstruturada, condicaoId: string | null): ConteudoOS {
  const e = p.escopo_estruturado;
  return {
    objetivo: e?.objetivo ?? null,
    escopo: e?.servicos_incluidos ?? [],
    inclusoes: e?.inclusoes ?? [],
    exclusoes: e?.exclusoes ?? [],
    entregas: e?.entregas ?? [],
    microentregas: e?.microentregas ?? [],
    dependencias: [...(e?.dependencias_cliente ?? []), ...(e?.dependencias_terceiros ?? [])],
    pessoas: e?.pessoas ?? [],
    sku_codigo: e?.origem.sku_codigo ?? null,
    condicao_id: condicaoId,
  };
}

export function bloqueiosOS(c: ConteudoOS): string[] {
  const b: string[] = [];
  if (vazio(c.objetivo)) b.push("OS sem objetivo da proposta.");
  if (!c.escopo.length) b.push("OS sem escopo real da proposta.");
  if (!c.inclusoes.length) b.push("OS sem inclusões.");
  if (!c.exclusoes.length) b.push("OS sem exclusões.");
  if (!c.entregas.length) b.push("OS sem entregas.");
  if (!c.pessoas.length) b.push("OS sem pessoas abrangidas.");
  if (!c.sku_codigo) b.push("OS sem SKU do catálogo.");
  if (!c.condicao_id) b.push("OS sem condição comercial persistida.");
  return b;
}

/* ------------------------------------------------------------------ */
/* Itens de escopo contratual derivados da proposta aprovada           */
/* ------------------------------------------------------------------ */

export type ItemEscopoContratual = {
  category:
    | "contracted_scope"
    | "deliverable"
    | "operational_condition"
    | "customer_obligation"
    | "exclusion"
    | "dependency";
  title: string;
  description: string | null;
  status: "included" | "excluded" | "pending" | "conditional";
  source_type: "proposal";
  source_reference: string;
  display_order: number;
  requires_human_validation: boolean;
};

export type ReferenciaOrigemEscopo = {
  propostaVersao: number | string;
  skuCodigo: string | null;
  condicaoCodigo?: string | null;
  osVersao?: number | null;
};

/** Texto de origem herdado por cada item: proposta → SKU → condição comercial → OS. */
export function referenciaOrigemEscopo(ref: ReferenciaOrigemEscopo): string {
  const partes = [
    `proposta v${ref.propostaVersao}`,
    `SKU ${ref.skuCodigo ?? "—"}`,
    `condição ${ref.condicaoCodigo ?? "—"}`,
  ];
  if (ref.osVersao) partes.push(`OS v${ref.osVersao}`);
  return partes.join(" · ");
}

/**
 * Deriva os itens de escopo do contrato a partir do conteúdo canônico da OS.
 * Toda linha nasce com origem `proposal` e a referência completa da cadeia:
 * nada aqui é inventado nem aprovado automaticamente.
 */
export function itensEscopoDaOS(c: ConteudoOS, ref: ReferenciaOrigemEscopo): ItemEscopoContratual[] {
  const origem = referenciaOrigemEscopo(ref);
  const itens: ItemEscopoContratual[] = [];
  const add = (
    category: ItemEscopoContratual["category"],
    status: ItemEscopoContratual["status"],
    titulo: string,
    descricao: string | null,
    validar = false,
  ) => {
    const title = titulo.trim();
    if (!title) return;
    itens.push({
      category,
      title,
      description: descricao,
      status,
      source_type: "proposal",
      source_reference: origem,
      display_order: itens.length + 1,
      requires_human_validation: validar,
    });
  };

  if (c.objetivo) add("contracted_scope", "included", c.objetivo, "Objetivo declarado na proposta aprovada.");
  for (const s of c.escopo) add("contracted_scope", "included", s, "Serviço incluído na proposta aprovada.");
  for (const s of c.inclusoes) add("contracted_scope", "included", s, "Inclusão homologada no catálogo.");
  for (const s of c.exclusoes) add("exclusion", "excluded", s, "Exclusão homologada no catálogo.");
  for (const s of c.entregas) add("deliverable", "included", s, "Entrega prevista no planejador.");
  for (const s of c.microentregas) add("deliverable", "included", s, "Microentrega prevista no planejador.");
  for (const s of c.dependencias) add("dependency", "conditional", s, "Dependência declarada na proposta.", true);
  for (const p of c.pessoas)
    add("operational_condition", "included", `Pessoa abrangida: ${p.nome}`, `Papel: ${p.papel}.`);

  return itens;
}


/* ------------------------------------------------------------------ */
/* Estado consolidado da cadeia                                        */
/* ------------------------------------------------------------------ */

export const ELOS_OPERACIONAIS = [
  { chave: "planejador", titulo: "Planejador operacional", entrada: "crm_casos/leads", saida: "case_plans" },
  { chave: "proposta", titulo: "Proposta estruturada", entrada: "case_plans", saida: "proposals" },
  { chave: "catalogo", titulo: "SKU/preço da Planilha Mestre", entrada: "proposals", saida: "product_catalog" },
  { chave: "condicao_comercial", titulo: "Condição comercial", entrada: "proposals", saida: "commercial_conditions" },
  { chave: "os_anexo_i", titulo: "Ordem de Serviço / Anexo I", entrada: "proposals", saida: "service_orders" },
  { chave: "previa", titulo: "Prévia contratual persistida", entrada: "service_orders", saida: "contract_parameter_previews" },
  { chave: "revisao_humana", titulo: "Revisão humana", entrada: "contract_parameter_previews", saida: "contract_case_parameters" },
  { chave: "assinatura", titulo: "Assinatura (preparada e desabilitada)", entrada: "contract_case_parameters", saida: "contracts" },
] as const;

export type ChaveEloOperacional = (typeof ELOS_OPERACIONAIS)[number]["chave"];
export type EloOperacional = {
  chave: ChaveEloOperacional;
  titulo: string;
  entrada: string;
  saida: string;
  estado: "ok" | "pendente" | "bloqueado";
  fonte: string | null;
  versao: string | null;
  motivos: string[];
};

export function consolidarCadeia(
  entradas: Record<ChaveEloOperacional, { motivos: string[]; fonte?: string | null; versao?: string | null }>,
  opcoes: { proprietaria?: boolean } = {},
): {
  versao: string;
  elos: EloOperacional[];
  proximoElo: ChaveEloOperacional | null;
  assinaturaLiberada: boolean;
  /** O que ainda falta para assinar, nomeado elo a elo. Vazio = liberada. */
  motivosAssinatura: string[];
  /** true quando o SKU legado deixou de contar por haver condição particular em ordem. */
  skuDispensadoPorCondicao: boolean;
} {
  const elos: EloOperacional[] = [];
  let travou = false;
  for (const def of ELOS_OPERACIONAIS) {
    const info = entradas[def.chave] ?? { motivos: ["Elo não avaliado."] };
    // Cascata de bloqueio.
    //
    // Diagnóstico de 05/09/2026: bastava um elo pendente para todos os
    // seguintes virarem "Bloqueado pelo elo anterior", mesmo os que estavam
    // em ordem. A tela mostrava uma parede de bloqueios que não existia, e a
    // proprietária não conseguia ver o que de fato faltava em cada etapa.
    //
    // Para a proprietária, cada elo passa a mostrar o próprio estado. A
    // sequência continua visível em `proximoElo`, mas não apaga o diagnóstico
    // dos elos seguintes.
    /*
     * 06/10/2026 — a cascata caiu para todo mundo, não só para a
     * Proprietária.
     *
     * A exceção de 05/09 consertava o sintoma pela metade: a equipe continuava
     * vendo a parede de "bloqueado pelo elo anterior", e um elo pendente lá no
     * começo escondia o diagnóstico de todos os seguintes. Isso é exatamente
     * "o elo que falha para a cadeia inteira" — o oposto da ordem recebida:
     * cada elo que falha gera PENDÊNCIA NOMEADA e os outros continuam sendo
     * avaliados.
     *
     * A sequência não se perde: `proximoElo` continua dizendo por onde
     * começar, e agora com o diagnóstico real de cada etapa ao lado.
     */
    const estado = info.motivos.length ? "pendente" : "ok";
    if (info.motivos.length) travou = true;
    elos.push({
      chave: def.chave,
      titulo: def.titulo,
      entrada: def.entrada,
      saida: def.saida,
      estado,
      fonte: info.fonte ?? null,
      versao: info.versao ?? null,
      motivos: info.motivos,
    });
  }
  /*
   * 06/10/2026 — PREMISSA da Proprietária (não reabrir): "o SKU nunca bloqueia
   * o contrato da Ana; ela é governada por condição particular aprovada".
   *
   * `assinaturaLiberada` exigia TODOS os elos em ok, e o elo `catalogo` é
   * "SKU/preço da Planilha Mestre" — catálogo que a própria Proprietária
   * declarou LEGADO. Um caso sem código de catálogo ficava impedido de assinar
   * para sempre por falta de um SKU que não existe para ele.
   *
   * O elo continua aparecendo, com o motivo nomeado: não desaparece nem vira
   * "ok" fingido. Ele só deixa de ser condição de assinatura quando a condição
   * comercial do caso está em ordem — ou seja, quando existe condição
   * particular aprovada governando o caso. Faltando a condição comercial, o
   * SKU volta a contar: não há governo nenhum para substituí-lo.
   */
  const condicaoEmOrdem = elos.find((e) => e.chave === "condicao_comercial")?.estado === "ok";
  const elosQueBloqueiamAssinatura = elos.filter((e) => !(e.chave === "catalogo" && condicaoEmOrdem));
  const pendentesParaAssinar = elosQueBloqueiamAssinatura.filter((e) => e.estado !== "ok");

  return {
    versao: CADEIA_OPERACIONAL_VERSAO,
    elos,
    proximoElo: elos.find((e) => e.estado === "pendente")?.chave ?? null,
    // A assinatura estava fixa em `false` no código: nenhum caminho do produto
    // conseguia habilitá-la, com todos os elos verdes ou não. Agora depende do
    // estado real da cadeia — menos o SKU legado, quando há condição
    // particular aprovada governando o caso.
    assinaturaLiberada: pendentesParaAssinar.length === 0,
    /** O que ainda falta para assinar, nomeado. Vazio = liberada. */
    motivosAssinatura: pendentesParaAssinar.flatMap((e) => e.motivos.map((m) => `${e.titulo}: ${m}`)),
    /** Declarado quando o SKU deixou de contar por causa da condição particular. */
    skuDispensadoPorCondicao:
      condicaoEmOrdem && elos.find((e) => e.chave === "catalogo")?.estado !== "ok",
  };
}

/** Pendências operacionais que o Painel Hoje consome (uma por caso, a mais prioritária). */
export function pendenciasParaPainel(input: {
  caseId: string;
  rotulo: string;
  responsavel: string | null;
  prazo: string | null;
  elos: EloOperacional[];
}): { id: string; rotulo: string; acao: string; responsavel: string | null; data: string | null; bloqueios: string[] } | null {
  const pendentes = input.elos.filter((e) => e.estado !== "ok");
  if (!pendentes.length) return null;
  const principal = pendentes[0];
  return {
    id: input.caseId,
    rotulo: input.rotulo,
    acao: `${principal.titulo}: ${principal.motivos[0] ?? "pendência operacional"}`,
    responsavel: input.responsavel,
    data: input.prazo,
    bloqueios: pendentes.slice(1).map((e) => `${e.titulo}: ${e.motivos[0] ?? "bloqueado pelo elo anterior"}`),
  };
}
