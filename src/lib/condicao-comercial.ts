/**
 * ANA-C-01 — consolidação de case service, condição comercial e critérios de
 * aceite. Lógica pura, sem efeito externo.
 *
 * Regras institucionais:
 * - Preço elegível exige rastro completo de homologação no product_catalog.
 * - Proposta, planejador, WhatsApp e texto manual nunca são fonte final.
 * - Divergência vira bloqueio registrado; nada é ajustado automaticamente.
 * - Nenhum campo de preço é gravado livremente por oportunidade ou caso.
 * - Nada aqui cria SKU, cobrança, link, parcela em cobrança, checkout,
 *   contrato, OS, anexo, assinatura ou comunicação.
 */

export type ProdutoHomologacao = {
  id: string;
  code: string | null;
  nome_comercial?: string | null;
  status_homologacao: string | null;
  preco_comercial_vigente: number | null;
  condicao_comercial_padrao?: string | null;
  homologado_por: string | null;
  homologado_em: string | null;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  ativo?: boolean | null;
};

export type ElegibilidadePreco = {
  elegivel: boolean;
  /** Fonte final admitida. Nunca proposta, planejador, WhatsApp ou texto manual. */
  fonte: "product_catalog" | null;
  preco_referencia_interna: number | null;
  uso_contratual_financeiro: "liberado" | "bloqueado";
  motivos: string[];
};

/** Regra A: só é elegível com homologador, data e vigência ativa registrados. */
export function avaliarElegibilidadePreco(
  produto: ProdutoHomologacao | null | undefined,
  hoje = new Date(),
): ElegibilidadePreco {
  const motivos: string[] = [];
  if (!produto)
    return {
      elegivel: false,
      fonte: null,
      preco_referencia_interna: null,
      uso_contratual_financeiro: "bloqueado",
      motivos: ["Serviço sem produto do catálogo vinculado."],
    };

  if (produto.status_homologacao !== "homologado") motivos.push(`Produto ${produto.code ?? produto.id} não está homologado.`);
  if (!produto.homologado_por) motivos.push("Sem responsável pela homologação (homologado_por).");
  if (!produto.homologado_em) motivos.push("Sem data de homologação (homologado_em).");
  if (!produto.vigencia_inicio) motivos.push("Sem início de vigência registrado.");
  if (produto.vigencia_inicio && new Date(produto.vigencia_inicio) > hoje) motivos.push("Vigência ainda não iniciada.");
  if (produto.vigencia_fim && new Date(produto.vigencia_fim) < hoje) motivos.push("Vigência encerrada.");
  if (produto.preco_comercial_vigente == null) motivos.push("Sem preço comercial vigente no catálogo.");
  if (produto.ativo === false) motivos.push("Produto inativo no catálogo.");

  const elegivel = motivos.length === 0;
  return {
    elegivel,
    fonte: elegivel ? "product_catalog" : null,
    preco_referencia_interna: produto.preco_comercial_vigente ?? null,
    uso_contratual_financeiro: elegivel ? "liberado" : "bloqueado",
    motivos: elegivel
      ? []
      : [...motivos, "Preço marcado como não homologado para uso contratual/financeiro; permanece apenas referência interna."],
  };
}

// ---------------------------------------------------------------------------
// Condição comercial estruturada
// ---------------------------------------------------------------------------

export type StatusCondicao = "rascunho" | "em_revisao" | "homologada" | "recusada" | "substituida";

export type CondicaoComercial = {
  id?: string;
  codigo: string;
  forma_pagamento: string | null;
  parcelas: number | null;
  valor_parcela: number | null;
  valor_total_referencia: number | null;
  vencimento_dia: number | null;
  primeiro_vencimento: string | null;
  condicao_aplicavel: string | null;
  status: StatusCondicao;
  homologado_por: string | null;
  homologado_em: string | null;
  observacao_interna?: string | null;
};

export const CAMPOS_CONDICAO: { campo: keyof CondicaoComercial; label: string }[] = [
  { campo: "forma_pagamento", label: "Forma de pagamento" },
  { campo: "parcelas", label: "Parcelas" },
  { campo: "valor_parcela", label: "Valor da parcela" },
  { campo: "valor_total_referencia", label: "Valor total de referência" },
  { campo: "vencimento_dia", label: "Dia de vencimento" },
  { campo: "condicao_aplicavel", label: "Condição aplicável" },
];

export type AvaliacaoCondicao = {
  homologavel: boolean;
  homologada: boolean;
  camposPendentes: string[];
  bloqueios: { codigo: string; descricao: string }[];
};

/** Regra B: condição homologada é estruturada e separada de texto Canva. */
export function avaliarCondicao(
  condicao: CondicaoComercial | null | undefined,
  elegibilidade: ElegibilidadePreco,
): AvaliacaoCondicao {
  const bloqueios: { codigo: string; descricao: string }[] = [];
  if (!condicao) {
    return {
      homologavel: false,
      homologada: false,
      camposPendentes: CAMPOS_CONDICAO.map((c) => c.label),
      bloqueios: [
        {
          codigo: "CONDICAO_INEXISTENTE",
          descricao: "Nenhuma condição comercial estruturada registrada — texto da proposta não substitui condição homologada.",
        },
      ],
    };
  }

  const camposPendentes = CAMPOS_CONDICAO.filter((c) => {
    const v = condicao[c.campo];
    return v === null || v === undefined || String(v).trim() === "";
  }).map((c) => c.label);

  if (camposPendentes.length)
    bloqueios.push({ codigo: "CONDICAO_INCOMPLETA", descricao: `Campos estruturados pendentes: ${camposPendentes.join(", ")}.` });

  if (!elegibilidade.elegivel)
    bloqueios.push({
      codigo: "PRECO_NAO_HOMOLOGADO",
      descricao: `Preço não homologado para uso contratual/financeiro: ${elegibilidade.motivos[0] ?? "rastro de homologação incompleto"}`,
    });

  const homologada = condicao.status === "homologada" && Boolean(condicao.homologado_por && condicao.homologado_em);
  if (condicao.status === "homologada" && !homologada)
    bloqueios.push({ codigo: "CONDICAO_SEM_RESPONSAVEL", descricao: "Condição marcada como homologada sem responsável e data." });

  return { homologavel: bloqueios.length === 0, homologada: homologada && bloqueios.length === 0, camposPendentes, bloqueios };
}

export type ValorObservado = { origem: "proposta_canva" | "product_catalog" | "case_service" | "condicao_comercial"; valor: number | null };

export const ROTULO_ORIGEM_CONDICAO: Record<ValorObservado["origem"], string> = {
  proposta_canva: "Proposta Canva",
  product_catalog: "Catálogo homologado",
  case_service: "Case service",
  condicao_comercial: "Condição comercial",
};

/** Regra B: divergência é registrada como bloqueio, nunca resolvida sozinha. */
export function divergenciasDeValor(
  observados: readonly ValorObservado[],
  precoCatalogo: number | null,
): { codigo: string; origem: ValorObservado["origem"]; descricao: string }[] {
  if (precoCatalogo == null) return [];
  const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;
  return observados
    .filter((o) => o.origem !== "product_catalog" && o.valor != null && Math.abs(Number((o.valor - precoCatalogo).toFixed(2))) >= 0.01)
    .map((o) => ({
      codigo: "VALOR_DIVERGENTE",
      origem: o.origem,
      descricao: `${ROTULO_ORIGEM_CONDICAO[o.origem]} registra ${fmt(o.valor as number)} e o catálogo registra ${fmt(
        precoCatalogo,
      )}. Divergência registrada para decisão humana — nenhum valor foi ajustado.`,
    }));
}

// ---------------------------------------------------------------------------
// Critérios de aceite e promoção do case service
// ---------------------------------------------------------------------------

export type CriterioRegistro = {
  id?: string;
  criterio_codigo: string;
  criterio_descricao?: string | null;
  obrigatorio: boolean;
  status: "pendente_decisao_humana" | "aceito" | "recusado" | "nao_aplicavel";
  decidido_por?: string | null;
  decidido_em?: string | null;
  justificativa?: string | null;
  evidencia_interna?: string | null;
};

export type LinhaCriterio = CriterioRegistro & { completo: boolean; faltando: string[] };

/** Regra C: cada critério registra estado, decisão, responsável, data, justificativa e evidência. */
export function avaliarCriterios(itens: readonly CriterioRegistro[]): LinhaCriterio[] {
  return itens.map((i) => {
    const faltando: string[] = [];
    if (i.status === "pendente_decisao_humana") faltando.push("decisão humana");
    if (i.status !== "pendente_decisao_humana") {
      if (!i.decidido_por) faltando.push("responsável");
      if (!i.decidido_em) faltando.push("data da decisão");
      if (!i.justificativa) faltando.push("justificativa");
      if (i.status === "aceito" && !i.evidencia_interna) faltando.push("evidência interna");
    }
    return { ...i, faltando, completo: faltando.length === 0 };
  });
}

export type PromocaoCaseService = {
  statusPermitido: "draft" | "approved";
  bloqueios: { codigo: string; descricao: string }[];
};

/** Regra C: sem referência contratual, condição homologada e critérios, fica draft. */
export function avaliarPromocaoCaseService(input: {
  criterios: readonly CriterioRegistro[];
  condicao: AvaliacaoCondicao;
  referenciaContratualInterna: string | null | undefined;
  divergencias: readonly { descricao: string }[];
}): PromocaoCaseService {
  const bloqueios: { codigo: string; descricao: string }[] = [];
  const pendentes = avaliarCriterios(input.criterios).filter((c) => c.obrigatorio && !c.completo);
  if (!input.criterios.length)
    bloqueios.push({ codigo: "CRITERIOS_NAO_CRIADOS", descricao: "Critérios de aceite ainda não registrados." });
  if (pendentes.length)
    bloqueios.push({
      codigo: "CRITERIO_ACEITE_PENDENTE",
      descricao: `${pendentes.length} critério(s) obrigatório(s) incompleto(s): ${pendentes
        .map((c) => `${c.criterio_codigo} (falta ${c.faltando.join(", ")})`)
        .join("; ")}.`,
    });
  if (!input.condicao.homologada)
    bloqueios.push({ codigo: "CONDICAO_COMERCIAL_NAO_HOMOLOGADA", descricao: "Condição comercial homologada ausente." });
  if (!input.referenciaContratualInterna || !String(input.referenciaContratualInterna).trim())
    bloqueios.push({ codigo: "REFERENCIA_CONTRATUAL_AUSENTE", descricao: "Referência contratual interna não registrada." });
  for (const d of input.divergencias) bloqueios.push({ codigo: "VALOR_DIVERGENTE", descricao: d.descricao });

  return { statusPermitido: bloqueios.length ? "draft" : "approved", bloqueios };
}

// ---------------------------------------------------------------------------
// Plano inicial (substitui planoInicialOk)
// ---------------------------------------------------------------------------

export const CRITERIOS_PLANO_INICIAL = [
  "responsavel_principal",
  "case_service_consolidado",
  "proxima_acao_datada",
  "checklist_aplicavel_criado",
  "primeira_entrega_planejada",
] as const;
export type CriterioPlanoInicial = (typeof CRITERIOS_PLANO_INICIAL)[number];

export const ROTULO_PLANO_INICIAL: Record<CriterioPlanoInicial, string> = {
  responsavel_principal: "Responsável principal designado",
  case_service_consolidado: "Case service consolidado",
  proxima_acao_datada: "Próxima ação com data",
  checklist_aplicavel_criado: "Checklist aplicável criado",
  primeira_entrega_planejada: "Primeira entrega planejada (só com onboarding liberado)",
};

export type PlanoInicial = {
  criterios: { criterio: CriterioPlanoInicial; label: string; ok: boolean; detalhe: string }[];
  ok: boolean;
  pendentes: string[];
};

/** Regra D: plano inicial é avaliado por critérios persistidos, não por contagem de tarefas. */
export function avaliarPlanoInicial(e: {
  responsavelUserId: string | null | undefined;
  caseServiceStatusPermitido: "draft" | "approved";
  proximaAcao: { descricao: string | null | undefined; data: string | null | undefined } | null;
  checklistItens: number;
  onboardingLiberado: boolean;
  primeiraEntrega: { titulo: string | null | undefined; data: string | null | undefined } | null;
}): PlanoInicial {
  const proximaOk = Boolean(e.proximaAcao?.descricao && e.proximaAcao?.data);
  const entregaOk = e.onboardingLiberado && Boolean(e.primeiraEntrega?.titulo && e.primeiraEntrega?.data);

  const criterios: PlanoInicial["criterios"] = [
    {
      criterio: "responsavel_principal",
      label: ROTULO_PLANO_INICIAL.responsavel_principal,
      ok: Boolean(e.responsavelUserId),
      detalhe: e.responsavelUserId ? "Responsável registrado no case service." : "Nenhum responsável principal designado.",
    },
    {
      criterio: "case_service_consolidado",
      label: ROTULO_PLANO_INICIAL.case_service_consolidado,
      ok: e.caseServiceStatusPermitido === "approved",
      detalhe:
        e.caseServiceStatusPermitido === "approved"
          ? "Case service sem bloqueios de consolidação."
          : "Case service permanece em rascunho por bloqueios abertos.",
    },
    {
      criterio: "proxima_acao_datada",
      label: ROTULO_PLANO_INICIAL.proxima_acao_datada,
      ok: proximaOk,
      detalhe: proximaOk ? "Próxima ação registrada com data." : "Próxima ação sem descrição ou sem data.",
    },
    {
      criterio: "checklist_aplicavel_criado",
      label: ROTULO_PLANO_INICIAL.checklist_aplicavel_criado,
      ok: e.checklistItens > 0,
      detalhe: e.checklistItens > 0 ? `${e.checklistItens} item(ns) de checklist.` : "Nenhum checklist aplicável criado.",
    },
    {
      criterio: "primeira_entrega_planejada",
      label: ROTULO_PLANO_INICIAL.primeira_entrega_planejada,
      ok: entregaOk,
      detalhe: !e.onboardingLiberado
        ? "Onboarding não liberado: primeira entrega não pode ser planejada ainda."
        : entregaOk
          ? "Primeira entrega planejada com data."
          : "Onboarding liberado, mas sem primeira entrega planejada.",
    },
  ];

  return {
    criterios,
    ok: criterios.every((c) => c.ok),
    pendentes: criterios.filter((c) => !c.ok).map((c) => c.label),
  };
}

/** Campos de preço que nunca podem ser gravados livremente por caso/oportunidade. */
export const CAMPOS_PRECO_BLOQUEADOS = ["preco_acordado", "preco_comercial_vigente", "valor_total_referencia"] as const;

/** Regra E5: qualquer gravação livre de preço fora do catálogo é recusada. */
export function validarGravacaoPreco(input: {
  campos: Record<string, unknown>;
  precoCatalogo: number | null;
  elegibilidade: ElegibilidadePreco;
  /** Parcelamento declarado, para conferir valor_parcela contra o total. */
  parcelamento?: { parcelas: number | null; valor_parcela: number | null } | null;
}): { permitido: boolean; erros: string[] } {
  const erros: string[] = [];
  for (const campo of CAMPOS_PRECO_BLOQUEADOS) {
    if (!(campo in input.campos)) continue;
    const valor = input.campos[campo];
    if (valor == null) continue;
    if (!input.elegibilidade.elegivel) {
      erros.push(`${campo}: preço não homologado no catálogo — gravação bloqueada.`);
      continue;
    }
    if (input.precoCatalogo == null || Math.abs(Number(valor) - input.precoCatalogo) >= 0.01) {
      erros.push(`${campo}: valor livre não permitido — deve espelhar o catálogo homologado.`);
    }
  }
  const parc = input.parcelamento;
  if (parc?.valor_parcela != null) {
    const total = input.precoCatalogo;
    if (!input.elegibilidade.elegivel || total == null) {
      erros.push("valor_parcela: sem preço homologado no catálogo, nenhuma parcela pode ser derivada.");
    } else if (!parc.parcelas || Math.abs(parc.parcelas * parc.valor_parcela - total) >= 0.01) {
      erros.push("valor_parcela: parcelas × valor da parcela devem fechar exatamente com o total homologado.");
    }
  }
  return { permitido: erros.length === 0, erros };
}
