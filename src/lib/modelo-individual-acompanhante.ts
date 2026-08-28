/**
 * Modelo de composição contratual:
 * "INDIVIDUAL — REQUERENTE ÚNICO COM ACOMPANHANTE — v1.0"
 *
 * Modelo interno, reutilizável e versionado. NÃO substitui e NÃO reclassifica
 * `MODELO-ESTUDO + BASE-GEN-V2`: é complementar e descreve apenas a composição
 * de pessoas, anexos e gates.
 *
 * Fonte canônica do texto-base: docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md
 *
 * O modelo não libera contrato, revisão, assinatura, cobrança, procuração,
 * pesquisa externa, portal ou comunicação.
 */

export const MODELO_INDIVIDUAL_ID = "MODELO-COMPOSICAO-INDIVIDUAL-ACOMPANHANTE";
export const MODELO_INDIVIDUAL_NOME = "INDIVIDUAL — REQUERENTE ÚNICO COM ACOMPANHANTE";
export const MODELO_INDIVIDUAL_VERSAO = "v1.0";
export const MODELO_INDIVIDUAL_DATA = "2026-08-22";
export const MODELO_INDIVIDUAL_STATUS = "vigente" as const;
export const MODELO_INDIVIDUAL_AUTOR = "Governança contratual (interno)";
export const MODELO_INDIVIDUAL_FONTE = "docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md";
export const MODELO_INDIVIDUAL_BASE = "MODELO-ESTUDO + BASE-GEN-V2";

export const MODELO_INDIVIDUAL_FINALIDADE =
  "Compor contrato individual com um único requerente contratante e signatário, admitindo acompanhante facultativa apenas como referência de contexto ou participação em reuniões, sem integrá-la ao escopo, ao contrato ou à prestação de serviço.";

export const MODELO_INDIVIDUAL_AVISO =
  "Modelo interno em revisão jurídica. Não gera contrato, proposta, Ordem de Serviço, assinatura, cobrança, procuração, pesquisa externa, portal ou comunicação.";

/* ------------------------------------------------------------------ */
/* Placeholders neutros da prévia TESTE                                 */
/* ------------------------------------------------------------------ */

export const PLACEHOLDERS_TESTE = {
  requerente: "[REQUERENTE PRINCIPAL]",
  acompanhante: "[ACOMPANHANTE OPCIONAL — NÃO INTEGRANTE DO ESCOPO]",
  escopo: "[ESCOPO APROVADO]",
  comercial: "[CONDIÇÃO COMERCIAL HOMOLOGADA]",
} as const;

export const MARCA_PREVIA_TESTE_MODELO = "PRÉVIA TESTE — SEM DADOS REAIS OU DEMO";

/* ------------------------------------------------------------------ */
/* Estrutura                                                            */
/* ------------------------------------------------------------------ */

export type EstadoConfirmacao = "pendente" | "confirmado_humano";

export type FontePermitida =
  | "planejador_homologado"
  | "proposta_os_aprovada"
  | "crm_confirmado"
  | "documento"
  | "importado_a_confirmar";

export type RequerentePrincipal = {
  papel: "requerente_principal";
  nome?: string;
  identificacao?: string;
  estadoDados?: string;
  estadoDocumentos?: string;
  processoIndividualAbrangido?: string;
  parteContratante: true;
  signatario: true;
  fonte?: FontePermitida;
  confirmacao: EstadoConfirmacao;
};

export type Acompanhante = {
  papel: "acompanhante";
  nome?: string;
  vinculoDeclarado?: string;
  finalidadeAcompanhamento?: string;
  autorizacaoParticipacao?: boolean;
  fonte?: FontePermitida;
  confirmacao: EstadoConfirmacao;
};

/** Travas fixas da acompanhante. Não são parametrizáveis por caso. */
export const TRAVAS_ACOMPANHANTE = {
  parte_contratante: false,
  signatario: false,
  requerente: false,
  beneficiario_automatico_do_escopo: false,
  anexo_individual_aplicavel: false,
  pode_acessar_dados: false,
} as const;

export type ComposicaoIndividual = {
  requerentes: RequerentePrincipal[];
  acompanhante?: Acompanhante;
};

export function criarRequerentePrincipal(
  dados: Partial<Omit<RequerentePrincipal, "papel" | "parteContratante" | "signatario">> = {},
): RequerentePrincipal {
  return {
    papel: "requerente_principal",
    parteContratante: true,
    signatario: true,
    confirmacao: "pendente",
    ...dados,
  };
}

export function criarAcompanhante(dados: Partial<Omit<Acompanhante, "papel">> = {}): Acompanhante {
  return { papel: "acompanhante", confirmacao: "pendente", ...dados };
}

/* ------------------------------------------------------------------ */
/* Anexos do modelo                                                     */
/* ------------------------------------------------------------------ */

export type ClasseAnexo = "fixo" | "condicional" | "nao_aplicavel_por_padrao";

export type AnexoDoModelo = {
  codigo: string;
  titulo: string;
  classe: ClasseAnexo;
  regra: string;
  instanciasMaximas?: number;
};

export const ANEXOS_MODELO_INDIVIDUAL: AnexoDoModelo[] = [
  {
    codigo: "ANX-ESCOPO",
    titulo: "Escopo do caso",
    classe: "fixo",
    regra: "Único por caso, derivado de proposta/OS aprovada do mesmo caso.",
    instanciasMaximas: 1,
  },
  {
    codigo: "ANX-COMERCIAL",
    titulo: "Condição comercial",
    classe: "fixo",
    regra: "Único, vinculado à condição comercial homologada no catálogo/Planilha Mestre.",
    instanciasMaximas: 1,
  },
  {
    codigo: "ANX-PRIVACIDADE",
    titulo: "Privacidade e tratamento de dados",
    classe: "fixo",
    regra: "Aplicável conforme política jurídica vigente.",
    instanciasMaximas: 1,
  },
  {
    codigo: "ANX-INDIVIDUAL",
    titulo: "Anexo individual do requerente",
    classe: "condicional",
    regra: "Uma única instância, apenas para o requerente principal, quando aplicável.",
    instanciasMaximas: 1,
  },
  {
    codigo: "ANX-REPRESENTACAO",
    titulo: "Representação",
    classe: "nao_aplicavel_por_padrao",
    regra: "Não aplicável neste modelo; exige menor ou incapaz representado e alteração formal.",
    instanciasMaximas: 0,
  },
  {
    codigo: "ANEXO-I",
    titulo: "Ordem de Serviço",
    classe: "condicional",
    regra: "Somente após proposta/OS válida, aprovada/aceita e vinculada ao mesmo caso.",
  },
  {
    codigo: "ANEXO-II",
    titulo: "Despesas externas",
    classe: "condicional",
    regra: "Conforme política institucional: fora de honorários, aprovadas e pagas pelo cliente.",
  },
  {
    codigo: "ANEXO-III",
    titulo: "Autorização de pesquisa",
    classe: "condicional",
    regra: "Somente com ação externa aplicável e aceite rastreável registrado.",
  },
  {
    codigo: "ANEXO-IV",
    titulo: "Procuração específica",
    classe: "condicional",
    regra:
      "Somente quando exigida pela atividade, com país/órgão confirmado por fonte válida, finalidade delimitada, revisão jurídica e evidência de assinatura.",
  },
  {
    codigo: "ANEXO-V",
    titulo: "Alteração de escopo",
    classe: "condicional",
    regra:
      "Exigido para qualquer inclusão futura da acompanhante como requerente ou pessoa atendida.",
  },
];

/* ------------------------------------------------------------------ */
/* Regras e gates                                                       */
/* ------------------------------------------------------------------ */

export type GateModelo = { codigo: string; regra: string; bloqueia: string };

export const GATES_MODELO_INDIVIDUAL: GateModelo[] = [
  {
    codigo: "MI-G01",
    regra: "Exatamente um requerente principal.",
    bloqueia: "Instância com zero ou mais de um requerente principal.",
  },
  {
    codigo: "MI-G02",
    regra: "Acompanhante nunca é parte, signatária, requerente, pessoa atendida, responsável financeiro ou destinatária de documentos.",
    bloqueia: "Qualquer campo que a classifique como tal.",
  },
  {
    codigo: "MI-G03",
    regra: "Dados da acompanhante não vão a portal, comunicação ou compartilhamento sem autorização aplicável.",
    bloqueia: "Exibição e envio por padrão.",
  },
  {
    codigo: "MI-G04",
    regra: "Contrato, Anexo I, assinatura e condição comercial final exigem proposta/OS válida.",
    bloqueia: "Geração sem proposta/OS aprovada vinculada ao mesmo caso.",
  },
  {
    codigo: "MI-G05",
    regra: "Nada é inferido: escopo, preço, parcelas, vencimentos, país, órgão, poderes, vínculo ou consentimento.",
    bloqueia: "Preenchimento automático de campo sem fonte permitida.",
  },
  {
    codigo: "MI-G06",
    regra: "Pesquisa externa exige Anexo III aprovado quando aplicável.",
    bloqueia: "Ação externa sem autorização registrada.",
  },
  {
    codigo: "MI-G07",
    regra: "Atividade que exige procuração depende de Anexo IV aprovado.",
    bloqueia: "Ato jurídico sem procuração válida.",
  },
  {
    codigo: "MI-G08",
    regra: "Inclusão posterior da acompanhante exige Anexo V, revisão humana e nova versão persistida do Anexo I.",
    bloqueia: "Edição de versão anterior do Anexo I.",
  },
  {
    codigo: "MI-G09",
    regra: "Confirmação humana obrigatória antes de qualquer instância final.",
    bloqueia: "Instância final com pessoa em estado pendente.",
  },
];

export const REGRAS_PRIVACIDADE_MODELO = [
  "Acompanhante não recebe acesso a dados ou portal por padrão.",
  "Participação em reunião depende de consentimento apropriado registrado.",
  "Nenhum vínculo, estado civil, parentesco, cidadania, residência, processo, poder ou autorização é presumido.",
  "Isolamento por organização permanece no banco (RLS); este modelo não cria tabela nem amplia acesso.",
];

/* ------------------------------------------------------------------ */
/* Validação                                                            */
/* ------------------------------------------------------------------ */

export type ResultadoValidacao = {
  valido: boolean;
  bloqueios: { codigo: string; mensagem: string }[];
  anexosAplicaveis: string[];
};

export function validarComposicaoIndividual(
  composicao: ComposicaoIndividual,
): ResultadoValidacao {
  const bloqueios: { codigo: string; mensagem: string }[] = [];
  const principais = composicao.requerentes.filter((p) => p.papel === "requerente_principal");

  if (principais.length === 0) {
    bloqueios.push({ codigo: "MI-G01", mensagem: "Nenhum requerente principal informado." });
  }
  if (principais.length > 1) {
    bloqueios.push({
      codigo: "MI-G01",
      mensagem: `Modelo admite exatamente um requerente principal (recebidos: ${principais.length}).`,
    });
  }

  const acompanhante = composicao.acompanhante;
  if (acompanhante) {
    const proibido = acompanhante as unknown as Record<string, unknown>;
    for (const chave of [
      "parteContratante",
      "signatario",
      "requerente",
      "beneficiarioAutomaticoDoEscopo",
      "anexoIndividualAplicavel",
      "podeAcessarDados",
    ]) {
      if (proibido[chave] === true) {
        bloqueios.push({
          codigo: "MI-G02",
          mensagem: `Acompanhante não pode ter "${chave}" verdadeiro sem Anexo V e revisão humana.`,
        });
      }
    }
  }

  const anexosAplicaveis = ANEXOS_MODELO_INDIVIDUAL.filter((a) => a.classe === "fixo").map(
    (a) => a.codigo,
  );
  if (principais.length === 1) anexosAplicaveis.push("ANX-INDIVIDUAL");

  return { valido: bloqueios.length === 0, bloqueios, anexosAplicaveis };
}

/** Instâncias de ANX-INDIVIDUAL geradas pela composição (acompanhante nunca gera). */
export function anexosIndividuaisDaComposicao(composicao: ComposicaoIndividual): string[] {
  return composicao.requerentes
    .filter((p) => p.papel === "requerente_principal")
    .map((p) => `ANX-INDIVIDUAL · ${p.nome ?? PLACEHOLDERS_TESTE.requerente}`);
}

/** Requisitos formais para incluir a acompanhante no escopo depois. */
export const REQUISITOS_INCLUSAO_ACOMPANHANTE = [
  "ANEXO-V aprovado com motivo, impacto de prazo e impacto financeiro",
  "Fonte válida para o dado da pessoa incluída",
  "Revisão humana registrada",
  "Nova versão persistida do ANEXO-I (a anterior permanece imutável)",
] as const;

export function requisitosInclusaoAcompanhante(): readonly string[] {
  return REQUISITOS_INCLUSAO_ACOMPANHANTE;
}

/** Prévia TESTE: somente placeholders neutros, sem dado real ou DEMO. */
export function previaTesteModeloIndividual() {
  return {
    marca: MARCA_PREVIA_TESTE_MODELO,
    modelo: `${MODELO_INDIVIDUAL_NOME} — ${MODELO_INDIVIDUAL_VERSAO}`,
    status: MODELO_INDIVIDUAL_STATUS,
    base: MODELO_INDIVIDUAL_BASE,
    blocos: [
      { titulo: "Requerente principal", conteudo: PLACEHOLDERS_TESTE.requerente },
      { titulo: "Acompanhante (facultativa)", conteudo: PLACEHOLDERS_TESTE.acompanhante },
      { titulo: "Escopo", conteudo: PLACEHOLDERS_TESTE.escopo },
      { titulo: "Condição comercial", conteudo: PLACEHOLDERS_TESTE.comercial },
    ],
  };
}
