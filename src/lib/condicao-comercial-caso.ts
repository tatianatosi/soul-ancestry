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
 * Cobertura por requerente — **instância do Anexo I**, não anexo novo.
 *
 * Correção de 04/10/2026, instrução da Proprietária: "o correto é anexo de I
 * até V; os demais são cópias dos mesmos". Eu havia criado Anexos A–D por
 * parte contratante; era duplicata de terceiro nível, porque
 * `anexos-dicionario.ts` já gerava uma instância por titular. O de-para
 * completo (o que cada anexo repetia, qual cláusula do contrato e qual anexo
 * I–V já cobria) está em `anexos-de-para-duplicidade.ts`.
 *
 * Aqui fica só a composição: quem é titular, quem é dependente representado,
 * e qual instância do Anexo I cobre cada um. Dependente menor nunca é
 * instância própria — não assina.
 */
export type InstanciaCobertura = {
  chave: string;
  titulo: string;
  parte: string;
  escopo: string | null;
  valor: number | null;
  dependentesRepresentados: string[];
};

export function instanciasDeCobertura(
  c: CondicaoComercialCaso,
  dependentes: readonly { nome: string; representadoPor?: string | null }[] = [],
): InstanciaCobertura[] {
  const comValor = c.itens.filter((i) => Number(i.valor) > 0);
  const semValor = c.itens.filter((i) => !(Number(i.valor) > 0));

  return comValor.map((item, i) => {
    const representados = [
      ...dependentes.filter((d) => (d.representadoPor ?? "").trim() === item.parte).map((d) => d.nome),
      // Item sem valor na condição é dependente representado: entra na
      // instância do titular, e sem vínculo explícito fica na do contratante.
      ...(i === 0 ? semValor.map((s) => s.parte) : []),
    ];
    return {
      chave: `ANEXO_I_ORDEM_SERVICO::${item.parte}`,
      titulo: `Anexo I — Ordem de Serviço · ${item.parte}`,
      parte: item.parte,
      escopo: item.escopo,
      valor: Number(item.valor),
      dependentesRepresentados: [...new Set(representados)],
    };
  });
}

/**
 * O que falta para o contrato cobrir a composição. Agora a pergunta é se o
 * **Anexo I** tem instância para cada titular — não se existe um anexo por
 * pessoa.
 */
export function lacunasDeCobertura(
  anexosRegistrados: readonly string[],
  instancias: readonly InstanciaCobertura[],
): string[] {
  const lacunas: string[] = [];
  const temAnexoI = anexosRegistrados.some((a) => a.toUpperCase().includes("ANEXO_I_ORDEM_SERVICO"));
  if (!temAnexoI) {
    lacunas.push("O Anexo I (Ordem de Serviço) não está registrado no contrato — sem ele não há escopo contratado.");
    return lacunas;
  }
  for (const i of instancias) {
    if (!anexosRegistrados.some((a) => a === i.chave)) {
      lacunas.push(`${i.titulo} — o Anexo I ainda não tem instância para esta pessoa.`);
    }
  }
  return lacunas;
}
