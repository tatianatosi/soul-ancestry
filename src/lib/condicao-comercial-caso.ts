/**
 * Condição comercial versionada do caso — a fonte que a proposta e o contrato
 * leem (04/10/2026).
 *
 * Executa a regra do Prompt Canônico v2.1 que estava escrita e nunca ligada:
 * "Proposta deve ler exclusivamente `case_commercial_condition` e
 * `approved_offer_items` da versão aprovada" e "Propostas não podem ler
 * PARAMETROS, SKUS_REFERENCIA, Planilha Mestre ou lançamentos legados
 * diretamente".
 *
 * Por que isto precisava existir: a Proprietária apontou, com razão, que o
 * caso da Ana **não está condicionado a SKU** — a extração da proposta Canva
 * já estava feita (7 páginas, `extracao_status = extraida`, com valor,
 * parcelas, responsáveis e escopo por pessoa) e nada lia aquilo. O preço ia
 * continuar atravessando `condicao-comercial.ts`, que é o gate de homologação
 * de SKU do `product_catalog` — legado, e que nunca se aplicou a ela.
 *
 * Regras desta camada:
 *  - a condição de um caso **nunca** vira preço de catálogo nem de outro caso;
 *  - versão aprovada é snapshot: alteração cria versão nova, não reescreve;
 *  - sem condição aprovada, a resposta é "não há condição aprovada", nunca um
 *    número derivado do catálogo;
 *  - a soma dos itens aprovados tem de fechar com o total; divergência é
 *    declarada, não ajustada.
 */

export type ItemCondicao = { parte: string; valor: number; escopo: string };

export type CondicaoComercialCaso = {
  id: string;
  caseId: string;
  propostaId: string | null;
  propostaReferencia: string | null;
  versao: number;
  itens: ItemCondicao[];
  total: number | null;
  despesasTerceiros: string | null;
  taxasOficiais: string | null;
  formaPagamento: string | null;
  responsaveisFinanceiros: string[];
  parcelas: number | null;
  valorParcela: number | null;
  moeda: string;
  validade: string | null;
  estado: string;
  origem: string;
};

export const ESTADOS_CONDICAO = ["rascunho", "em_revisao", "aprovada", "substituida", "arquivada"] as const;
export type EstadoCondicao = (typeof ESTADOS_CONDICAO)[number];

/** Só a versão aprovada alimenta proposta, contrato e orçamento. */
export function condicaoVigente(condicoes: readonly CondicaoComercialCaso[]): CondicaoComercialCaso | null {
  const aprovadas = condicoes.filter((c) => c.estado === "aprovada");
  if (!aprovadas.length) return null;
  return aprovadas.reduce((a, b) => (b.versao > a.versao ? b : a));
}

export type ConferenciaCondicao = {
  fecha: boolean;
  somaDosItens: number;
  total: number | null;
  diferenca: number;
  /** Responsáveis × valor da parcela × parcelas, quando houver assinatura. */
  totalPelasAssinaturas: number | null;
  avisos: string[];
};

/**
 * Conferência aritmética da condição, sem corrigir nada. Serve para a tela
 * dizer "fecha" ou "não fecha, e por quanto" — nunca para ajustar o valor.
 */
export function conferirCondicao(c: CondicaoComercialCaso): ConferenciaCondicao {
  const avisos: string[] = [];
  const somaDosItens = c.itens.reduce((s, i) => s + (Number(i.valor) || 0), 0);
  const total = c.total ?? null;
  const diferenca = total === null ? 0 : Math.round((somaDosItens - total) * 100) / 100;
  if (total !== null && diferenca !== 0) {
    avisos.push(
      `A soma dos escopos por pessoa (${somaDosItens}) não fecha com o total aprovado (${total}); diferença de ${diferenca}. ` +
        "Nada foi ajustado: a divergência precisa de decisão humana.",
    );
  }

  let totalPelasAssinaturas: number | null = null;
  if (c.responsaveisFinanceiros.length && c.valorParcela && c.parcelas) {
    totalPelasAssinaturas = c.responsaveisFinanceiros.length * c.valorParcela * c.parcelas;
    if (total !== null && Math.abs(totalPelasAssinaturas - total) > 0.01) {
      avisos.push(
        `As assinaturas (${c.responsaveisFinanceiros.length} × ${c.valorParcela} × ${c.parcelas} = ${totalPelasAssinaturas}) ` +
          `não fecham com o total aprovado (${total}).`,
      );
    }
  }

  if (c.validade) {
    avisos.push(`Validade comercial registrada: ${c.validade}. Fora dela, a condição precisa de nova versão.`);
  }

  return { fecha: diferenca === 0, somaDosItens, total, diferenca, totalPelasAssinaturas, avisos };
}

/**
 * Partes que o contrato precisa cobrir com anexo próprio.
 *
 * A Proprietária apontou (04/10): "no contrato revise pois somente está
 * cobrindo um anexo quando na verdade são 04 anexos". Medido na estrutura
 * contratual do dossiê da Ana (14/08): contrato-mãe familiar + Anexo A (Ana
 * Luiza + filho), Anexo B (pai), Anexo C (irmã) e Anexo D (financeiro — as 3
 * assinaturas de R$ 320, vencimentos e política de atraso). O Anexo E
 * (despesas e reembolsos) já é o Anexo II governado do contrato-base, então
 * não se duplica aqui: por isso **quatro**, não cinco.
 *
 * Dependente menor entra DENTRO do anexo do seu representante — nunca como
 * anexo próprio, porque não assina.
 */
export const ANEXOS_POR_COMPOSICAO = ["A", "B", "C", "D"] as const;

export type AnexoDeComposicao = {
  letra: string;
  titulo: string;
  parte: string | null;
  tipo: "parte_contratante" | "financeiro";
  escopo: string | null;
  valor: number | null;
  dependentesRepresentados: string[];
};

export function anexosDaComposicao(
  c: CondicaoComercialCaso,
  dependentes: readonly { nome: string; representadoPor?: string | null }[] = [],
): AnexoDeComposicao[] {
  const comValor = c.itens.filter((i) => Number(i.valor) > 0);
  const semValor = c.itens.filter((i) => !(Number(i.valor) > 0));
  const letras = ["A", "B", "C", "D", "E", "F", "G", "H"];

  const anexos: AnexoDeComposicao[] = comValor.map((item, i) => {
    const representados = [
      ...dependentes.filter((d) => (d.representadoPor ?? "").trim() === item.parte).map((d) => d.nome),
      // Item sem valor é dependente representado: entra no anexo do titular,
      // e na falta de vínculo explícito fica no primeiro anexo (o do
      // contratante), nunca como anexo próprio.
      ...(i === 0 ? semValor.map((s) => s.parte) : []),
    ];
    return {
      letra: letras[i] ?? `${i + 1}`,
      titulo: `Anexo ${letras[i] ?? i + 1} — ${item.parte}`,
      parte: item.parte,
      tipo: "parte_contratante" as const,
      escopo: item.escopo,
      valor: Number(item.valor),
      dependentesRepresentados: [...new Set(representados)],
    };
  });

  anexos.push({
    letra: letras[anexos.length] ?? "D",
    titulo: `Anexo ${letras[anexos.length] ?? "D"} — Financeiro`,
    parte: null,
    tipo: "financeiro",
    escopo: c.formaPagamento,
    valor: c.total,
    dependentesRepresentados: [],
  });

  return anexos;
}

/** O que falta para o contrato cobrir a composição inteira. */
export function lacunasDeAnexos(cobertos: readonly string[], esperados: readonly AnexoDeComposicao[]): string[] {
  const temCobertura = (letra: string) => cobertos.some((c) => c.toUpperCase().includes(letra.toUpperCase()));
  return esperados
    .filter((a) => !temCobertura(a.letra))
    .map((a) => `${a.titulo} não está coberto por nenhum anexo registrado no contrato.`);
}
