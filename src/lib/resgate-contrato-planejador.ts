/**
 * Resgate do contrato governado pelo Planejador (autorização explícita da
 * Proprietária, 27/09/2026).
 *
 * Regra: caso com Produto-Pai no Planejador (`case_plans.produto_pai_id`) e
 * proposta de origem Canva é governado por Planejador + Produto-Pai +
 * proposta Canva aprovada (p. 1–7) + composição familiar — nunca por SKU
 * técnico, `product_catalog` ou Planilha Mestre. O instrumento é o Contrato
 * de Estudo Genealógico v2 (texto já vigente em contrato-base-consolidado.ts,
 * MODELO-ESTUDO + BASE-GEN-V2) — nada aqui cria texto jurídico.
 */

export const NOME_INSTRUMENTO = "Contrato de Estudo Genealógico v2";

export function casoGovernadoPeloPlanejador(e: {
  produtoPaiId: string | null | undefined;
  origemProposta: string | null | undefined;
}): boolean {
  return Boolean(e.produtoPaiId) && e.origemProposta === "canva";
}

export type ParteContrato = {
  id: string;
  person_name: string;
  role: string;
  phone: string | null;
  document_number: string | null;
  signature_required: boolean;
  client_id: string | null;
};

export type DependenteContrato = {
  id: string;
  nome_completo: string;
  status_representacao: string;
};

export type PendenciaHumana = {
  chave: string;
  titulo: string;
  detalhe: string;
  ancora: "partes" | "dependentes" | "revisar";
};

const digitos = (s: string | null | undefined) => String(s ?? "").replace(/\D/g, "");

/**
 * Só fatos humanos reais, uma vez cada: divergência de telefone com o
 * cadastro canônico (escolha de valor), documento de parte assinante
 * ausente, decisão sobre dependente e revisão da prévia. Divergência já
 * decidida com motivo (`aceitos`, chave `telefone:<partyId>`) não volta.
 */
export function pendenciasHumanasDoContrato(e: {
  partes: ParteContrato[];
  telefonesCanonicos: Record<string, string | null>;
  aceitos: Set<string>;
  dependentes: DependenteContrato[];
  revisaoAprovada: boolean;
}): PendenciaHumana[] {
  const out: PendenciaHumana[] = [];
  const pessoas = e.partes.filter((p) => p.role !== "provider" && p.role !== "dependent");

  for (const p of pessoas) {
    const canonico = p.client_id ? (e.telefonesCanonicos[p.client_id] ?? null) : null;
    if (!p.phone || !canonico) continue;
    if (digitos(p.phone) === digitos(canonico)) continue;
    if (e.aceitos.has(`telefone:${p.id}`)) continue;
    out.push({
      chave: `telefone:${p.id}`,
      titulo: `Telefone de ${p.person_name}`,
      detalhe: `Confirmar o número correto: contrato ${p.phone} · cadastro ${canonico}.`,
      ancora: "partes",
    });
  }

  for (const p of pessoas) {
    if (!p.signature_required || String(p.document_number ?? "").trim()) continue;
    out.push({
      chave: `documento:${p.id}`,
      titulo: `CPF/RG de ${p.person_name}`,
      detalhe: `Parte assinante sem documento de identificação registrado — coletar CPF e RG.`,
      ancora: "partes",
    });
  }

  for (const d of e.dependentes) {
    if (d.status_representacao !== "pendente") continue;
    out.push({
      chave: `dependente:${d.id}`,
      titulo: `${d.nome_completo}: fora do contrato ou dependente representado`,
      detalhe:
        "Decidir se fica fora deste contrato (não aplicável) ou entra como dependente representado (documentada, com o documento de representação).",
      ancora: "dependentes",
    });
  }

  if (!e.revisaoAprovada) {
    out.push({
      chave: "revisao_previa",
      titulo: `Revisar a prévia única do ${NOME_INSTRUMENTO}`,
      detalhe: "Depois dos dados acima, revisar e aprovar a versão. Assinatura e cobrança são atos externos posteriores.",
      ancora: "revisar",
    });
  }

  return out;
}

/** Condição particular do caso, da proposta aprovada / Planejador — nunca do catálogo. */
export function condicaoParticularDoCaso(
  servico: { condicao_comercial_aprovada: string | null; preco_acordado: number | null; composicao_familiar: string | null } | null,
  proposta: { valor: number | null; forma_pagamento: string | null } | null,
): { valor: number | null; condicao: string | null; composicao: string | null; fonte: string } {
  if (servico && (servico.condicao_comercial_aprovada || servico.preco_acordado !== null)) {
    return {
      valor: servico.preco_acordado ?? proposta?.valor ?? null,
      condicao: servico.condicao_comercial_aprovada ?? proposta?.forma_pagamento ?? null,
      composicao: servico.composicao_familiar ?? null,
      fonte: "Condição particular registrada no caso (Planejador), a partir da proposta aprovada",
    };
  }
  return {
    valor: proposta?.valor ?? null,
    condicao: proposta?.forma_pagamento ?? null,
    composicao: null,
    fonte: "Proposta aprovada",
  };
}
