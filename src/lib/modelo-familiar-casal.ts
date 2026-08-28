/**
 * Modelo de composição contratual:
 * "FAMILIAR — CASAL DOIS ADULTOS — v1.0"
 *
 * Modelo interno, reutilizável e versionado. NÃO substitui e NÃO reclassifica
 * `MODELO-ESTUDO + BASE-GEN-V2`: é complementar e descreve apenas a composição
 * de pessoas, anexos e gates de um núcleo familiar com dois adultos.
 *
 * Fonte canônica do texto-base: docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md
 *
 * O modelo não libera contrato, revisão, assinatura, cobrança, procuração,
 * pesquisa externa, portal ou comunicação. Não usa dados reais nem DEMO.
 */

export const MODELO_FAMILIAR_CASAL_ID = "MODELO-COMPOSICAO-FAMILIAR-CASAL-DOIS-ADULTOS";
export const MODELO_FAMILIAR_CASAL_NOME = "FAMILIAR — CASAL DOIS ADULTOS";
export const MODELO_FAMILIAR_CASAL_VERSAO = "v1.0";
export const MODELO_FAMILIAR_CASAL_DATA = "2026-08-22";
export const MODELO_FAMILIAR_CASAL_STATUS = "vigente" as const;
export const MODELO_FAMILIAR_CASAL_AUTOR = "Governança contratual (interno)";
export const MODELO_FAMILIAR_CASAL_FONTE =
  "docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md";
export const MODELO_FAMILIAR_CASAL_BASE = "MODELO-ESTUDO + BASE-GEN-V2";

export const MODELO_FAMILIAR_CASAL_FINALIDADE =
  "Compor um caso familiar com exatamente dois adultos — requerente principal e cônjuge/segunda requerente — sob um único contrato-base familiar, com anexo individual por adulto aplicável e assinatura individual de cada adulto que seja parte contratante. Sem dependentes e sem representação legal por padrão.";

export const MODELO_FAMILIAR_CASAL_AVISO =
  "Modelo interno em revisão jurídica. Não gera contrato, proposta, Ordem de Serviço, assinatura, cobrança, procuração, pesquisa externa, portal ou comunicação.";

/* ------------------------------------------------------------------ */
/* Núcleo familiar                                                      */
/* ------------------------------------------------------------------ */

export const NUCLEO_FAMILIAR_CASAL = {
  tipo_nucleo: "casal_dois_adultos",
  adultos_minimos: 2,
  adultos_maximos: 2,
  dependentes_permitidos: false,
  representacao_legal_padrao: false,
} as const;

export const NAO_INFERIDOS = [
  "parentesco",
  "união estável ou estado civil",
  "nacionalidade",
  "residência",
  "país",
  "órgão",
  "processo",
  "poderes",
  "condição jurídica",
  "preço, parcelas e vencimentos",
] as const;

/* ------------------------------------------------------------------ */
/* Placeholders neutros da prévia TESTE                                 */
/* ------------------------------------------------------------------ */

export const PLACEHOLDERS_TESTE_FAMILIAR = {
  requerentePrincipal: "[REQUERENTE PRINCIPAL]",
  segundaRequerente: "[SEGUNDA REQUERENTE]",
  vinculo: "[VÍNCULO DECLARADO]",
  escopo: "[ESCOPO APROVADO]",
  comercial: "[CONDIÇÃO COMERCIAL HOMOLOGADA]",
} as const;

export const MARCA_PREVIA_TESTE_FAMILIAR = "PRÉVIA TESTE — SEM DADOS REAIS OU DEMO";

/* ------------------------------------------------------------------ */
/* Pessoas e papéis                                                     */
/* ------------------------------------------------------------------ */

export type EstadoConfirmacaoFamiliar = "pendente" | "confirmado_humano";

export type FontePermitidaFamiliar =
  | "planejador_homologado"
  | "proposta_os_aprovada"
  | "crm_confirmado"
  | "documento"
  | "importado_a_confirmar";

export type PapelAdulto = "requerente_principal" | "conjuge_segunda_requerente";

export type AdultoFamiliar = {
  papel: PapelAdulto;
  identificado: boolean;
  nome?: string;
  identificacao?: string;
  vinculoDeclarado?: string;
  parteContratante: boolean;
  signatario: boolean;
  processoIndividualAbrangido?: string;
  estadoDados?: string;
  estadoDocumentos?: string;
  fonte?: FontePermitidaFamiliar;
  confirmacao: EstadoConfirmacaoFamiliar;
};

export const CAMPOS_OBRIGATORIOS_POR_PESSOA = [
  "papel (requerente principal ou cônjuge/segunda requerente)",
  "vínculo declarado",
  "parte contratante (sim/não)",
  "signatário (sim/não)",
  "processo individual abrangido",
  "estado de dados/documentos",
  "fonte permitida e confirmação humana",
] as const;

export type ComposicaoFamiliarCasal = {
  adultos: AdultoFamiliar[];
  dependentes?: unknown[];
  representacaoLegal?: boolean;
};

export function criarAdultoFamiliar(
  papel: PapelAdulto,
  dados: Partial<Omit<AdultoFamiliar, "papel">> = {},
): AdultoFamiliar {
  return {
    papel,
    identificado: false,
    parteContratante: false,
    signatario: false,
    confirmacao: "pendente",
    ...dados,
  };
}

/* ------------------------------------------------------------------ */
/* Anexos do modelo                                                     */
/* ------------------------------------------------------------------ */

export type ClasseAnexoFamiliar = "fixo" | "condicional" | "nao_aplicavel_por_padrao";

export type AnexoModeloFamiliar = {
  codigo: string;
  titulo: string;
  classe: ClasseAnexoFamiliar;
  regra: string;
  instanciasMaximas?: number;
};

export const ANEXOS_MODELO_FAMILIAR_CASAL: AnexoModeloFamiliar[] = [
  {
    codigo: "ANX-ESCOPO",
    titulo: "Escopo do caso familiar",
    classe: "fixo",
    regra: "Único por caso familiar, derivado de proposta/OS aprovada do mesmo caso.",
    instanciasMaximas: 1,
  },
  {
    codigo: "ANX-COMERCIAL",
    titulo: "Condição comercial",
    classe: "fixo",
    regra: "Único, vinculado à proposta/condição comercial homologada (SKU homologado).",
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
    regra: "Uma instância por adulto aplicável — no máximo duas neste modelo.",
    instanciasMaximas: 2,
  },
  {
    codigo: "ANX-REPRESENTACAO",
    titulo: "Representação",
    classe: "nao_aplicavel_por_padrao",
    regra:
      "Não aplicável por padrão; só existe com necessidade real de representação comprovada por fonte documental.",
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
    regra: "Conforme regra institucional: fora de honorários, aprovadas e pagas pelo cliente.",
  },
  {
    codigo: "ANEXO-III",
    titulo: "Autorização de pesquisa",
    classe: "condicional",
    regra: "Somente se houver ação externa aplicável, com aceite rastreável registrado.",
  },
  {
    codigo: "ANEXO-IV",
    titulo: "Procuração específica",
    classe: "condicional",
    regra:
      "Somente quando a atividade/órgão exigir e o país/órgão estiver confirmado por fonte válida.",
  },
  {
    codigo: "ANEXO-V",
    titulo: "Alteração de escopo",
    classe: "condicional",
    regra: "Somente para mudança formal posterior, sem efeito retroativo.",
  },
];

/* ------------------------------------------------------------------ */
/* Gates                                                                */
/* ------------------------------------------------------------------ */

export type GateModeloFamiliar = { codigo: string; regra: string; bloqueia: string };

export const GATES_MODELO_FAMILIAR_CASAL: GateModeloFamiliar[] = [
  {
    codigo: "MF-G01",
    regra: "Exatamente duas pessoas adultas identificadas antes de instanciar o modelo.",
    bloqueia: "Instância com uma, três ou mais pessoas adultas.",
  },
  {
    codigo: "MF-G02",
    regra: "Papéis distintos: um requerente principal e um cônjuge/segunda requerente.",
    bloqueia: "Papéis duplicados ou ausentes.",
  },
  {
    codigo: "MF-G03",
    regra: "Quem não é parte contratante não vira signatário automaticamente.",
    bloqueia: "Signatário sem condição de parte contratante.",
  },
  {
    codigo: "MF-G04",
    regra: "Contrato e Anexo I exigem proposta/OS aprovada e vinculada ao mesmo caso.",
    bloqueia: "Geração de contrato/OS sem proposta aprovada.",
  },
  {
    codigo: "MF-G05",
    regra:
      "Anexo I exige escopo, inclusões, exclusões, entregas e condição comercial obrigatória presentes.",
    bloqueia: "Anexo I com parâmetro obrigatório ausente.",
  },
  {
    codigo: "MF-G06",
    regra: "Nada inferido: preço, parcelas, vencimentos, país, órgão, poderes ou vínculo.",
    bloqueia: "Preço sem SKU e condição homologados; parcelas ou vencimentos inferidos.",
  },
  {
    codigo: "MF-G07",
    regra: "Ação externa exige Anexo III aprovado, quando aplicável.",
    bloqueia: "Pesquisa externa sem autorização registrada.",
  },
  {
    codigo: "MF-G08",
    regra: "Atividade que exige procuração depende de Anexo IV aprovado.",
    bloqueia: "Ato jurídico sem procuração válida e país/órgão confirmado.",
  },
  {
    codigo: "MF-G09",
    regra: "Representação legal só com fonte documental; não aplicável por padrão.",
    bloqueia: "ANX-REPRESENTACAO gerado por padrão ou sem documento.",
  },
  {
    codigo: "MF-G10",
    regra:
      "Assinatura só após revisão humana, parâmetros completos, anexos aplicáveis persistidos e gates anteriores aprovados.",
    bloqueia: "Assinatura antecipada ou com pessoa em estado pendente.",
  },
];

export const REGRAS_PRIVACIDADE_FAMILIAR = [
  "Cada adulto assina individualmente; não há assinatura por representação sem fonte documental.",
  "Dados de um adulto não são expostos ao outro sem autorização aplicável registrada.",
  "Dependentes não existem neste modelo por padrão; inclusão exige Anexo V e revisão humana.",
  "Isolamento por organização permanece no banco (RLS); o modelo não amplia acesso.",
];

/* ------------------------------------------------------------------ */
/* Validação                                                            */
/* ------------------------------------------------------------------ */

export type BloqueioFamiliar = { codigo: string; mensagem: string };

export type ResultadoValidacaoFamiliar = {
  valido: boolean;
  bloqueios: BloqueioFamiliar[];
  anexosAplicaveis: string[];
};

export function validarComposicaoFamiliarCasal(
  composicao: ComposicaoFamiliarCasal,
): ResultadoValidacaoFamiliar {
  const bloqueios: BloqueioFamiliar[] = [];
  const adultos = composicao.adultos ?? [];
  const identificados = adultos.filter((a) => a.identificado);

  if (identificados.length !== NUCLEO_FAMILIAR_CASAL.adultos_minimos) {
    bloqueios.push({
      codigo: "MF-G01",
      mensagem: `O modelo exige exatamente ${NUCLEO_FAMILIAR_CASAL.adultos_minimos} adultos identificados; recebidos ${identificados.length}.`,
    });
  }

  const principais = adultos.filter((a) => a.papel === "requerente_principal");
  const conjuges = adultos.filter((a) => a.papel === "conjuge_segunda_requerente");
  if (principais.length !== 1 || conjuges.length !== 1) {
    bloqueios.push({
      codigo: "MF-G02",
      mensagem:
        "É obrigatório exatamente um requerente principal e um cônjuge/segunda requerente.",
    });
  }

  for (const adulto of adultos) {
    if (adulto.signatario && !adulto.parteContratante) {
      bloqueios.push({
        codigo: "MF-G03",
        mensagem: `${adulto.papel}: não pode ser signatário sem ser parte contratante.`,
      });
    }
    if (adulto.identificado && !adulto.vinculoDeclarado) {
      bloqueios.push({
        codigo: "MF-G02",
        mensagem: `${adulto.papel}: vínculo declarado é obrigatório.`,
      });
    }
  }

  if ((composicao.dependentes?.length ?? 0) > 0) {
    bloqueios.push({
      codigo: "MF-G09",
      mensagem: "Dependentes não são permitidos por padrão neste modelo.",
    });
  }
  if (composicao.representacaoLegal === true) {
    bloqueios.push({
      codigo: "MF-G09",
      mensagem: "Representação legal exige fonte documental e alteração formal do modelo.",
    });
  }

  const anexosAplicaveis = ANEXOS_MODELO_FAMILIAR_CASAL.filter((a) => a.classe === "fixo").map(
    (a) => a.codigo,
  );
  if (bloqueios.length === 0) {
    for (const _adulto of adultos.filter((a) => a.identificado && a.parteContratante)) {
      anexosAplicaveis.push("ANX-INDIVIDUAL");
    }
  }

  return { valido: bloqueios.length === 0, bloqueios, anexosAplicaveis };
}

/** Instâncias de ANX-INDIVIDUAL: uma por adulto aplicável (parte contratante). */
export function anexosIndividuaisFamiliar(composicao: ComposicaoFamiliarCasal): string[] {
  return (composicao.adultos ?? [])
    .filter((a) => a.identificado && a.parteContratante)
    .map(
      (a) =>
        `ANX-INDIVIDUAL · ${
          a.nome ??
          (a.papel === "requerente_principal"
            ? PLACEHOLDERS_TESTE_FAMILIAR.requerentePrincipal
            : PLACEHOLDERS_TESTE_FAMILIAR.segundaRequerente)
        }`,
    );
}

/* ------------------------------------------------------------------ */
/* Gatilhos dos anexos condicionais                                     */
/* ------------------------------------------------------------------ */

export type GatilhosAnexos = {
  propostaOsAprovada?: boolean;
  escopoCompleto?: boolean;
  condicaoComercialHomologada?: boolean;
  despesaExternaPrevista?: boolean;
  acaoExternaAplicavel?: boolean;
  atividadeExigeProcuracao?: boolean;
  paisOrgaoConfirmado?: boolean;
  alteracaoFormalPosterior?: boolean;
  necessidadeRepresentacaoDocumentada?: boolean;
};

/** Retorna somente os anexos condicionais cujos gatilhos formais estão satisfeitos. */
export function anexosCondicionaisAplicaveis(gatilhos: GatilhosAnexos = {}): string[] {
  const aplicaveis: string[] = [];
  if (gatilhos.propostaOsAprovada && gatilhos.escopoCompleto && gatilhos.condicaoComercialHomologada)
    aplicaveis.push("ANEXO-I");
  if (gatilhos.despesaExternaPrevista) aplicaveis.push("ANEXO-II");
  if (gatilhos.acaoExternaAplicavel) aplicaveis.push("ANEXO-III");
  if (gatilhos.atividadeExigeProcuracao && gatilhos.paisOrgaoConfirmado)
    aplicaveis.push("ANEXO-IV");
  if (gatilhos.alteracaoFormalPosterior) aplicaveis.push("ANEXO-V");
  if (gatilhos.necessidadeRepresentacaoDocumentada) aplicaveis.push("ANX-REPRESENTACAO");
  return aplicaveis;
}

/* ------------------------------------------------------------------ */
/* Gates de contrato/assinatura                                         */
/* ------------------------------------------------------------------ */

export type ContextoContratoFamiliar = {
  composicao: ComposicaoFamiliarCasal;
  propostaOsAprovada?: boolean;
  escopoCompleto?: boolean;
  condicaoComercialHomologada?: boolean;
  skuHomologado?: boolean;
  precoInformado?: boolean;
  parcelasInferidas?: boolean;
  vencimentosInferidos?: boolean;
  revisaoHumana?: boolean;
  anexosAplicaveisPersistidos?: boolean;
};

export function avaliarGeracaoContratoFamiliar(
  ctx: ContextoContratoFamiliar,
): ResultadoValidacaoFamiliar {
  const base = validarComposicaoFamiliarCasal(ctx.composicao);
  const bloqueios = [...base.bloqueios];

  if (!ctx.propostaOsAprovada) {
    bloqueios.push({
      codigo: "MF-G04",
      mensagem: "Sem proposta/OS aprovada vinculada ao caso: contrato e Anexo I bloqueados.",
    });
  }
  if (!ctx.escopoCompleto || !ctx.condicaoComercialHomologada) {
    bloqueios.push({
      codigo: "MF-G05",
      mensagem:
        "Anexo I exige escopo, inclusões, exclusões, entregas e condição comercial obrigatória.",
    });
  }
  if (ctx.precoInformado && !ctx.skuHomologado) {
    bloqueios.push({ codigo: "MF-G06", mensagem: "Preço sem SKU e condição homologados." });
  }
  if (ctx.parcelasInferidas || ctx.vencimentosInferidos) {
    bloqueios.push({ codigo: "MF-G06", mensagem: "Parcelas e vencimentos não podem ser inferidos." });
  }

  return { valido: bloqueios.length === 0, bloqueios, anexosAplicaveis: base.anexosAplicaveis };
}

export function podeAssinarFamiliar(ctx: ContextoContratoFamiliar): ResultadoValidacaoFamiliar {
  const contrato = avaliarGeracaoContratoFamiliar(ctx);
  const bloqueios = [...contrato.bloqueios];

  if (!ctx.revisaoHumana) {
    bloqueios.push({ codigo: "MF-G10", mensagem: "Revisão humana não registrada." });
  }
  if (!ctx.anexosAplicaveisPersistidos) {
    bloqueios.push({ codigo: "MF-G10", mensagem: "Anexos aplicáveis ainda não persistidos." });
  }
  for (const adulto of ctx.composicao.adultos ?? []) {
    if (adulto.parteContratante && adulto.confirmacao !== "confirmado_humano") {
      bloqueios.push({
        codigo: "MF-G10",
        mensagem: `${adulto.papel}: confirmação humana pendente.`,
      });
    }
  }

  return { valido: bloqueios.length === 0, bloqueios, anexosAplicaveis: contrato.anexosAplicaveis };
}

/** Prévia TESTE: somente placeholders neutros, sem dado real ou DEMO. */
export function previaTesteModeloFamiliarCasal() {
  return {
    marca: MARCA_PREVIA_TESTE_FAMILIAR,
    modelo: `${MODELO_FAMILIAR_CASAL_NOME} — ${MODELO_FAMILIAR_CASAL_VERSAO}`,
    status: MODELO_FAMILIAR_CASAL_STATUS,
    base: MODELO_FAMILIAR_CASAL_BASE,
    blocos: [
      { titulo: "Requerente principal", conteudo: PLACEHOLDERS_TESTE_FAMILIAR.requerentePrincipal },
      { titulo: "Cônjuge / segunda requerente", conteudo: PLACEHOLDERS_TESTE_FAMILIAR.segundaRequerente },
      { titulo: "Vínculo declarado", conteudo: PLACEHOLDERS_TESTE_FAMILIAR.vinculo },
      { titulo: "Escopo", conteudo: PLACEHOLDERS_TESTE_FAMILIAR.escopo },
      { titulo: "Condição comercial", conteudo: PLACEHOLDERS_TESTE_FAMILIAR.comercial },
    ],
  };
}
