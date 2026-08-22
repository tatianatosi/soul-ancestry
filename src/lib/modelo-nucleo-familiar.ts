/**
 * Modelo de composição contratual "NÚCLEO FAMILIAR — ADULTOS E DEPENDENTES — v1.0".
 *
 * Regra de composição de pessoas, escopo, assinaturas e anexos sobre o
 * contrato-base MODELO-ESTUDO + BASE-GEN-V2. Não cria corpo jurídico próprio.
 */

export const MODELO_NUCLEO_ID = "MODELO-COMPOSICAO-NUCLEO-FAMILIAR-ADULTOS-DEPENDENTES";
export const MODELO_NUCLEO_NOME = "NÚCLEO FAMILIAR — ADULTOS E DEPENDENTES";
export const MODELO_NUCLEO_VERSAO = "v1.0";
export const MODELO_NUCLEO_DATA = "2026-08-22";
export const MODELO_NUCLEO_STATUS = "under_legal_review" as const;
export const MODELO_NUCLEO_AUTOR = "Governança contratual (interno)";
export const MODELO_NUCLEO_FONTE = "docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md";
export const MODELO_NUCLEO_BASE = "MODELO-ESTUDO + BASE-GEN-V2";

export const MODELO_NUCLEO_FINALIDADE =
  "Compor um caso familiar com um ou mais adultos requerentes e dependentes identificados, sem transformar dependentes em signatários e sem inferir representação, parentesco ou responsabilidade financeira.";

export const MODELO_NUCLEO_AVISO =
  "Modelo em revisão jurídica: não habilita assinatura, cobrança, procuração, pesquisa externa, portal ou onboarding.";

export const PLACEHOLDERS_TESTE_NUCLEO = {
  adultoRequerente: "[ADULTO REQUERENTE]",
  adultoAdicional: "[ADULTO ADICIONAL, SE APLICÁVEL]",
  dependente: "[DEPENDENTE, SE APLICÁVEL — SEM ASSINATURA AUTOMÁTICA]",
} as const;

export const MARCA_PREVIA_TESTE_NUCLEO = "PRÉVIA TESTE — SEM DADOS REAIS OU DEMO";

/** Itens que nunca podem ser inferidos por este modelo. */
export const NAO_INFERIDOS_NUCLEO = [
  "guarda ou poder de representação",
  "responsabilidade financeira",
  "parentesco",
  "processos individuais",
  "consentimento",
  "país, órgão, poderes, preço, parcela ou vencimento",
] as const;

export type EstadoConfirmacaoNucleo = "pendente" | "confirmado_humano";

export type PapelNucleo = "adulto_requerente" | "dependente";

export type PessoaNucleo = {
  papel: PapelNucleo;
  identificado: EstadoConfirmacaoNucleo;
  parteContratante: EstadoConfirmacaoNucleo;
  signatario: EstadoConfirmacaoNucleo;
  relevanteAoEscopo: boolean;
  representacaoDocumentada: boolean;
  rotulo: string;
};

export function criarPessoaNucleo(
  papel: PapelNucleo,
  dados: Partial<Omit<PessoaNucleo, "papel">> = {},
): PessoaNucleo {
  return {
    papel,
    identificado: dados.identificado ?? "pendente",
    parteContratante: dados.parteContratante ?? "pendente",
    signatario: dados.signatario ?? "pendente",
    relevanteAoEscopo: dados.relevanteAoEscopo ?? false,
    representacaoDocumentada: dados.representacaoDocumentada ?? false,
    rotulo:
      dados.rotulo ??
      (papel === "adulto_requerente"
        ? PLACEHOLDERS_TESTE_NUCLEO.adultoRequerente
        : PLACEHOLDERS_TESTE_NUCLEO.dependente),
  };
}

export type ComposicaoNucleoFamiliar = {
  pessoas: PessoaNucleo[];
  propostaAprovadaNoCaso: boolean;
  escopoFamiliarCentral: boolean;
};

export type ClasseAnexoNucleo = "fixo" | "condicional" | "nao_aplicavel_por_padrao";

export type AnexoModeloNucleo = {
  codigo: string;
  titulo: string;
  classe: ClasseAnexoNucleo;
  regra: string;
  instanciasMaximas?: number;
};

export const ANEXOS_MODELO_NUCLEO: AnexoModeloNucleo[] = [
  {
    codigo: "ANX-ESCOPO",
    titulo: "Escopo familiar central",
    classe: "fixo",
    regra:
      "Um escopo familiar central por caso; escopos individuais vinculados apenas quando necessários e formalizados.",
    instanciasMaximas: 1,
  },
  {
    codigo: "ANX-COMERCIAL",
    titulo: "Condição comercial",
    classe: "fixo",
    regra: "Único por caso, vinculado à condição comercial homologada. Preço nunca inferido.",
    instanciasMaximas: 1,
  },
  {
    codigo: "ANX-PRIVACIDADE",
    titulo: "Privacidade e tratamento de dados",
    classe: "fixo",
    regra: "Aplicável ao contrato familiar conforme política jurídica vigente.",
    instanciasMaximas: 1,
  },
  {
    codigo: "ANX-INDIVIDUAL",
    titulo: "Anexo individual por adulto",
    classe: "condicional",
    regra: "Uma instância por adulto requerente aplicável e confirmado. Dependente não gera anexo individual.",
  },
  {
    codigo: "ANX-REPRESENTACAO",
    titulo: "Representação",
    classe: "condicional",
    regra:
      "Somente para menor/incapaz identificado ou necessidade formal documentada. Nunca por inferência de guarda ou parentesco.",
  },
  {
    codigo: "ANEXO-I",
    titulo: "Ordem de Serviço",
    classe: "condicional",
    regra: "Somente com proposta/OS aprovada do mesmo caso, com escopo, entregas, inclusões, exclusões e condição comercial.",
  },
  {
    codigo: "ANEXO-II",
    titulo: "Despesas externas",
    classe: "condicional",
    regra: "Regra institucional de despesas externas: fora de honorários, aprovadas e pagas pelo cliente.",
  },
  {
    codigo: "ANEXO-III",
    titulo: "Autorização de pesquisa",
    classe: "condicional",
    regra: "Pesquisa externa, contato institucional ou pedido a órgão somente com autorização vigente e gate de servidor.",
  },
  {
    codigo: "ANEXO-IV",
    titulo: "Procuração específica",
    classe: "condicional",
    regra: "Ato em nome do cliente somente com procuração vigente, país/órgão confirmado e finalidade delimitada.",
  },
  {
    codigo: "ANEXO-V",
    titulo: "Alteração de escopo",
    classe: "condicional",
    regra:
      "Alteração de pessoas, escopo, representação, preço ou prazo cria nova versão persistida da OS, preservando a anterior.",
  },
];

export type GateModeloNucleo = { codigo: string; regra: string; bloqueia: string };

export const GATES_MODELO_NUCLEO: GateModeloNucleo[] = [
  {
    codigo: "MN-G01",
    regra: "Pelo menos um adulto requerente identificado antes de instanciar o modelo.",
    bloqueia: "Instância sem adulto requerente identificado.",
  },
  {
    codigo: "MN-G02",
    regra: "Dependente só integra a composição se identificado e relevante ao escopo.",
    bloqueia: "Dependente genérico, inferido ou irrelevante ao escopo.",
  },
  {
    codigo: "MN-G03",
    regra: "Adulto vira parte/signatário somente após confirmação humana.",
    bloqueia: "Assinatura de adulto não confirmado.",
  },
  {
    codigo: "MN-G04",
    regra: "Dependente nunca se torna signatário automaticamente.",
    bloqueia: "Dependente marcado como signatário sem instrumento válido.",
  },
  {
    codigo: "MN-G05",
    regra: "ANX-INDIVIDUAL apenas para adulto requerente aplicável.",
    bloqueia: "Anexo individual para dependente ou pessoa não confirmada.",
  },
  {
    codigo: "MN-G06",
    regra: "ANX-REPRESENTACAO apenas para menor/incapaz ou necessidade formal documentada.",
    bloqueia: "Representação criada por padrão ou por inferência de guarda.",
  },
  {
    codigo: "MN-G07",
    regra: "Anexo I exige proposta/OS aprovada do mesmo caso.",
    bloqueia: "Ordem de Serviço sem proposta aprovada.",
  },
  {
    codigo: "MN-G08",
    regra: "Preço, parcela, vencimento, país, órgão e poderes nunca são inferidos.",
    bloqueia: "Preenchimento automático de condição comercial ou procuração.",
  },
  {
    codigo: "MN-G09",
    regra: "Alteração de pessoas, escopo ou representação exige Anexo V e nova versão da OS.",
    bloqueia: "Alteração direta sobre versão anterior.",
  },
  {
    codigo: "MN-G10",
    regra: "Modelo em under_legal_review não habilita assinatura, cobrança, pesquisa externa ou portal.",
    bloqueia: "Qualquer ação executável a partir do modelo.",
  },
];

export type ResultadoValidacaoNucleo = {
  valido: boolean;
  bloqueios: { codigo: string; mensagem: string }[];
  avisos: string[];
};

export function validarComposicaoNucleo(c: ComposicaoNucleoFamiliar): ResultadoValidacaoNucleo {
  const bloqueios: { codigo: string; mensagem: string }[] = [];
  const avisos: string[] = [];

  const adultos = c.pessoas.filter((p) => p.papel === "adulto_requerente");
  const dependentes = c.pessoas.filter((p) => p.papel === "dependente");

  if (adultos.length < 1) {
    bloqueios.push({ codigo: "MN-G01", mensagem: "É necessário ao menos um adulto requerente." });
  }
  if (adultos.some((a) => a.identificado !== "confirmado_humano")) {
    avisos.push("Há adulto requerente ainda não identificado por confirmação humana.");
  }
  for (const d of dependentes) {
    if (d.identificado !== "confirmado_humano" || !d.relevanteAoEscopo) {
      bloqueios.push({
        codigo: "MN-G02",
        mensagem: "Dependente só integra a composição se identificado e relevante ao escopo.",
      });
    }
    if (d.signatario === "confirmado_humano") {
      bloqueios.push({ codigo: "MN-G04", mensagem: "Dependente não se torna signatário automaticamente." });
    }
  }
  for (const a of adultos) {
    if (a.signatario === "confirmado_humano" && a.parteContratante !== "confirmado_humano") {
      bloqueios.push({ codigo: "MN-G03", mensagem: "Signatário exige parte contratante confirmada." });
    }
  }
  if (!c.propostaAprovadaNoCaso) {
    avisos.push("Sem proposta/OS aprovada no caso: Anexo I bloqueado.");
  }
  if (!c.escopoFamiliarCentral) {
    avisos.push("Escopo familiar central ainda não formalizado.");
  }

  return { valido: bloqueios.length === 0, bloqueios, avisos };
}

/** Anexos individuais previstos: um por adulto requerente aplicável; nunca para dependentes. */
export function anexosIndividuaisDoNucleo(c: ComposicaoNucleoFamiliar): string[] {
  return c.pessoas
    .filter((p) => p.papel === "adulto_requerente" && p.identificado === "confirmado_humano")
    .map((_, i) => `ANX-INDIVIDUAL-${i + 1}`);
}

/** Representação só é prevista sob regra válida (menor/incapaz ou necessidade documentada). */
export function representacaoPrevista(c: ComposicaoNucleoFamiliar): boolean {
  return c.pessoas.some((p) => p.papel === "dependente" && p.representacaoDocumentada);
}

export function previaTesteModeloNucleo() {
  return {
    marca: MARCA_PREVIA_TESTE_NUCLEO,
    partes: [
      PLACEHOLDERS_TESTE_NUCLEO.adultoRequerente,
      PLACEHOLDERS_TESTE_NUCLEO.adultoAdicional,
      PLACEHOLDERS_TESTE_NUCLEO.dependente,
    ],
    anexos: ANEXOS_MODELO_NUCLEO,
    gates: GATES_MODELO_NUCLEO,
  };
}
