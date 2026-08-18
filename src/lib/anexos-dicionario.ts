/**
 * Dicionário de anexos contratuais: por que cada anexo entra, o que ele
 * carrega e o que acontece se estiver ausente. Regras derivadas dos
 * parâmetros — anexo nunca é escolhido manualmente sem justificativa.
 */

export type RegraAnexo = {
  codigo: string;
  titulo: string;
  finalidade: string;
  regra: string;
  campos: string[];
  impactoAusencia: string;
  obrigatorio: boolean;
  aplicavel: boolean;
  motivo: string;
};

type Entrada = {
  produto?: string | null;
  paisRota?: string | null;
  beneficiarios?: string | null;
  representacaoLegal?: string | null;
  valorTotal?: string | null;
  formaPagamento?: string | null;
};

function pessoas(texto?: string | null) {
  return String(texto ?? "")
    .split("||")
    .map((p) => p.trim())
    .filter(Boolean);
}

export function dicionarioAnexos(entrada: Entrada): RegraAnexo[] {
  const lista = pessoas(entrada.beneficiarios);
  const temRepresentacao = /represent/i.test(String(entrada.representacaoLegal ?? "")) && !/não há representação/i.test(
    String(entrada.representacaoLegal ?? ""),
  );
  const temComercial = Boolean((entrada.valorTotal ?? "").trim() || (entrada.formaPagamento ?? "").trim());

  return [
    {
      codigo: "ANX-ESCOPO",
      titulo: "Escopo e entregas",
      finalidade: "Detalha serviços incluídos, excluídos, fases e prazos de referência.",
      regra: "Obrigatório em todo instrumento gerado pelo MODELO-ESTUDO.",
      campos: ["escopo_resumo", "servicos_incluidos", "servicos_excluidos", "fases_entregas", "prazos_referencia"],
      impactoAusencia: "Bloqueia a versão final: o contrato ficaria sem delimitação de escopo.",
      obrigatorio: true,
      aplicavel: true,
      motivo: "Regra fixa do modelo homologado.",
    },
    {
      codigo: "ANX-PRIVACIDADE",
      titulo: "Privacidade e tratamento de dados",
      finalidade: "Base legal, finalidade, retenção e consentimento por titular.",
      regra: "Obrigatório sempre que houver tratamento de dados pessoais — todos os casos.",
      campos: ["beneficiarios", "partes_signatarias"],
      impactoAusencia: "Bloqueia a versão final e a ativação do caso (consentimento por titular).",
      obrigatorio: true,
      aplicavel: true,
      motivo: "Regra fixa do modelo homologado.",
    },
    {
      codigo: "ANX-COMERCIAL",
      titulo: "Condições comerciais",
      finalidade: "Valor total, parcelas, vencimentos, responsáveis e despesas de terceiros.",
      regra: "Aplicável quando houver valor total ou forma de pagamento parametrizada.",
      campos: ["valor_total", "forma_pagamento", "parcelas", "vencimentos", "despesas_externas", "excecoes_comerciais"],
      impactoAusencia: "Sem ele não há base contratual para cobrança: o financeiro permanece bloqueado.",
      obrigatorio: temComercial,
      aplicavel: temComercial,
      motivo: temComercial ? "Há condições comerciais parametrizadas." : "Nenhuma condição comercial parametrizada ainda.",
    },
    {
      codigo: "ANX-INDIVIDUAL",
      titulo: "Processo individual por beneficiário",
      finalidade: "Uma ficha por pessoa: qualificação, documentos e etapa do processo.",
      regra: "Aplicável quando houver mais de uma pessoa vinculada ao mesmo instrumento.",
      campos: ["beneficiarios", "vinculo_familiar", "ancestral_referencia", "membros_excluidos"],
      impactoAusencia: "Beneficiário sem anexo individual não é atendido pelo contrato assinado.",
      obrigatorio: lista.length > 1,
      aplicavel: lista.length > 0,
      motivo:
        lista.length > 1
          ? `${lista.length} pessoas vinculadas ao instrumento.`
          : lista.length === 1
            ? "Apenas uma pessoa vinculada: anexo opcional."
            : "Nenhum beneficiário parametrizado.",
    },
    {
      codigo: "ANX-REPRESENTACAO",
      titulo: "Representação legal",
      finalidade: "Qualifica representante e poderes quando há menor ou incapaz.",
      regra: "Aplicável somente quando houver menor/incapaz representado nos parâmetros.",
      campos: ["representacao_legal", "partes_signatarias"],
      impactoAusencia: "Sem ele, a assinatura por representante fica sem lastro e a revisão humana é bloqueada.",
      obrigatorio: temRepresentacao,
      aplicavel: temRepresentacao,
      motivo: temRepresentacao
        ? "Representação legal declarada nos parâmetros."
        : "Nenhuma representação legal declarada (todos os titulares maiores de idade).",
    },
  ];
}
