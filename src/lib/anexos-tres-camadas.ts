/**
 * Reconciliação Anexos I–V — três camadas independentes.
 *
 * Camada SOMENTE-LEITURA / classificação. Nenhuma função aqui cria, edita,
 * arquiva, exclui, move, vincula ou publica anexo, contrato, documento,
 * template, configuração ou integração. Nenhuma ação externa é executada.
 *
 * Origem da evidência: consulta direta a public.contract_annexes em
 * 2026-08-22 (id, organization_id, case_id, contract_id, parameters_id,
 * annex_code, annex_version, model_version, status, archived_at,
 * structured_data, rendered_html, file_hash, created_at, updated_at).
 */

export const ANEXOS_TRES_CAMADAS_VERSAO = "CA-ANEXOS-TRES-CAMADAS-v1.0";
export const ANEXOS_TRES_CAMADAS_DATA = "2026-08-22";

/** Caso canônico da Ana Luiza (alias histórico resolve para o mesmo caso). */
export const CASO_ANA_CODIGO_CANONICO = "CA-CID-AT-FAM-2026-001";
export const CASO_ANA_ID = "a11a0000-0000-4000-8000-000000000002";
export const CASO_ANA_REFERENCIA_LEGADA = "CA-AUT-ANALUIZA-FAM-2026-001";

/** Caso técnico de validação do motor contratual (não é caso de cliente). */
export const CASO_VALIDACAO_MOTOR_CODIGO = "CA-TESTE-VAL-2026-001";
export const CASO_VALIDACAO_MOTOR_ID = "7e57ca5e-0000-4000-8000-000000000001";

/* ------------------------------------------------------------------ */
/* Vocabulário único (proibido rótulo ambíguo)                         */
/* ------------------------------------------------------------------ */

export const ESTADOS_RECONCILIACAO = [
  "TECNICAMENTE_EXISTE",
  "MODELO_JURIDICO_NAO_LOCALIZADO",
  "INSTANCIA_DO_CASO_AUSENTE",
  "INSTANCIA_DO_CASO_PARCIAL",
  "CONTEUDO_PLACEHOLDER",
  "PRONTO_PARA_PREVIA_INTERNA",
  "AGUARDA_REVISAO_JURIDICA",
] as const;
export type EstadoReconciliacao = (typeof ESTADOS_RECONCILIACAO)[number];

export const ROTULO_ESTADO_RECONCILIACAO: Record<EstadoReconciliacao, string> = {
  TECNICAMENTE_EXISTE: "Instância técnica existe no app",
  MODELO_JURIDICO_NAO_LOCALIZADO: "Modelo jurídico homologado não localizado",
  INSTANCIA_DO_CASO_AUSENTE: "Instância do caso ausente",
  INSTANCIA_DO_CASO_PARCIAL: "Instância do caso parcial",
  CONTEUDO_PLACEHOLDER: "Conteúdo placeholder (descritivo, não minuta)",
  PRONTO_PARA_PREVIA_INTERNA: "Pronto para prévia interna",
  AGUARDA_REVISAO_JURIDICA: "Aguarda revisão jurídica",
};

/** Rótulo proibido fora deste vocabulário quando não se nomeia a camada. */
export const CAMADAS = ["instancia_tecnica_no_app", "conteudo_juridico_homologado", "instancia_especifica_do_caso"] as const;
export type Camada = (typeof CAMADAS)[number];

export const ROTULO_CAMADA: Record<Camada, string> = {
  instancia_tecnica_no_app: "A. Instância técnica no app",
  conteudo_juridico_homologado: "B. Conteúdo jurídico homologado",
  instancia_especifica_do_caso: "C. Instância específica do caso",
};

/* ------------------------------------------------------------------ */
/* Evidência direta do banco (sem expor conteúdo sensível)             */
/* ------------------------------------------------------------------ */

export type EvidenciaAnexoBanco = {
  registroId: string;
  organizationId: string;
  caseId: string | null;
  casoCodigo: string | null;
  contractId: string | null;
  parametersId: string | null;
  annexCode: string;
  annexVersion: number;
  modelVersion: string | null;
  status: string;
  arquivado: boolean;
  temStructuredData: boolean;
  tamanhoRenderedHtml: number;
  temHash: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

/**
 * Linhas observadas em public.contract_annexes. Metadados apenas — nenhum
 * trecho de conteúdo jurídico ou dado pessoal é reproduzido aqui.
 */
export const EVIDENCIA_CONTRACT_ANNEXES: EvidenciaAnexoBanco[] = [
  {
    registroId: "4f0d0fa0-f3cf-45fc-aff5-8a3800527f14",
    organizationId: "11f32aae-ea08-47e0-8114-f5d8a900c9a1",
    caseId: CASO_VALIDACAO_MOTOR_ID,
    casoCodigo: CASO_VALIDACAO_MOTOR_CODIGO,
    contractId: null,
    parametersId: "b64053d3-029c-4f6f-9901-afea0a1ccaa1",
    annexCode: "ANEXO_I_ORDEM_SERVICO",
    annexVersion: 1,
    modelVersion: "ANEXO-I-ORDEM-DE-SERVICO-v1.0",
    status: "missing",
    arquivado: false,
    temStructuredData: true,
    tamanhoRenderedHtml: 266,
    temHash: true,
    criadoEm: "2026-08-22T17:59:28Z",
    atualizadoEm: "2026-08-22T17:59:28Z",
  },
  {
    registroId: "d7d2a81a-986f-4a92-81d3-bde10bb00000",
    organizationId: "11f32aae-ea08-47e0-8114-f5d8a900c9a1",
    caseId: CASO_VALIDACAO_MOTOR_ID,
    casoCodigo: CASO_VALIDACAO_MOTOR_CODIGO,
    contractId: null,
    parametersId: "b64053d3-029c-4f6f-9901-afea0a1ccaa1",
    annexCode: "ANEXO_II_DESPESAS_EXTERNAS",
    annexVersion: 1,
    modelVersion: "ANEXO-II-DESPESAS-EXTERNAS-v1.0",
    status: "missing",
    arquivado: false,
    temStructuredData: true,
    tamanhoRenderedHtml: 277,
    temHash: true,
    criadoEm: "2026-08-22T17:59:29Z",
    atualizadoEm: "2026-08-22T17:59:29Z",
  },
  {
    registroId: "fae0e808-a8dc-45f0-b22a-ef12ecad17e4",
    organizationId: "11f32aae-ea08-47e0-8114-f5d8a900c9a1",
    caseId: CASO_VALIDACAO_MOTOR_ID,
    casoCodigo: CASO_VALIDACAO_MOTOR_CODIGO,
    contractId: null,
    parametersId: "b64053d3-029c-4f6f-9901-afea0a1ccaa1",
    annexCode: "ANEXO_III_AUTORIZACAO_PESQUISA",
    annexVersion: 1,
    modelVersion: "ANEXO-III-AUTORIZACAO-PESQUISA-v1.0",
    status: "not_applicable",
    arquivado: false,
    temStructuredData: true,
    tamanhoRenderedHtml: 269,
    temHash: true,
    criadoEm: "2026-08-22T17:59:29Z",
    atualizadoEm: "2026-08-22T17:59:29Z",
  },
  {
    registroId: "2de29faf-b216-4616-a170-164e81b0d1b1",
    organizationId: "11f32aae-ea08-47e0-8114-f5d8a900c9a1",
    caseId: CASO_VALIDACAO_MOTOR_ID,
    casoCodigo: CASO_VALIDACAO_MOTOR_CODIGO,
    contractId: null,
    parametersId: "b64053d3-029c-4f6f-9901-afea0a1ccaa1",
    annexCode: "ANEXO_IV_PROCURACAO",
    annexVersion: 1,
    modelVersion: "ANEXO-IV-PROCURACAO-ESPECIFICA-v1.0",
    status: "not_applicable",
    arquivado: false,
    temStructuredData: true,
    tamanhoRenderedHtml: 239,
    temHash: true,
    criadoEm: "2026-08-22T17:59:29Z",
    atualizadoEm: "2026-08-22T17:59:29Z",
  },
  {
    registroId: "ca0ae966-5441-4776-8018-bd23f13c033b",
    organizationId: "11f32aae-ea08-47e0-8114-f5d8a900c9a1",
    caseId: CASO_VALIDACAO_MOTOR_ID,
    casoCodigo: CASO_VALIDACAO_MOTOR_CODIGO,
    contractId: null,
    parametersId: "b64053d3-029c-4f6f-9901-afea0a1ccaa1",
    annexCode: "ANEXO_V_ALTERACAO_ESCOPO",
    annexVersion: 1,
    modelVersion: "ANEXO-V-ALTERACAO-DE-ESCOPO-v1.0",
    status: "not_applicable",
    arquivado: false,
    temStructuredData: true,
    tamanhoRenderedHtml: 261,
    temHash: true,
    criadoEm: "2026-08-22T17:59:29Z",
    atualizadoEm: "2026-08-22T17:59:29Z",
  },
  {
    // Linha legada vazia, de outra organização, arquivada em lote anterior.
    registroId: "8bb590b2-61bc-434e-a9d1-e8aa185ce2c0",
    organizationId: "b0fa3d42-43f4-4c7a-b942-11520e40cdd9",
    caseId: null,
    casoCodigo: null,
    contractId: "d7c287a9-bb3b-4fc4-b66f-74fade471c4b",
    parametersId: null,
    annexCode: "ANEXO-I",
    annexVersion: 1,
    modelVersion: null,
    status: "missing",
    arquivado: true,
    temStructuredData: false,
    tamanhoRenderedHtml: 0,
    temHash: false,
    criadoEm: "2026-08-16T16:06:11Z",
    atualizadoEm: "2026-08-22T22:29:21Z",
  },
];

export function evidenciasPorCodigo(annexCode: string): EvidenciaAnexoBanco[] {
  return EVIDENCIA_CONTRACT_ANNEXES.filter((e) => e.annexCode === annexCode);
}

export function evidenciasDoCaso(caseId: string): EvidenciaAnexoBanco[] {
  return EVIDENCIA_CONTRACT_ANNEXES.filter((e) => e.caseId === caseId && !e.arquivado);
}

export function linhasLegadasVazias(): EvidenciaAnexoBanco[] {
  return EVIDENCIA_CONTRACT_ANNEXES.filter(
    (e) => !e.temStructuredData && e.tamanhoRenderedHtml === 0 && !e.temHash,
  );
}

/* ------------------------------------------------------------------ */
/* Classificação em três camadas                                       */
/* ------------------------------------------------------------------ */

export type CamadaTecnica = {
  presente: boolean;
  registrosAtivos: number;
  registrosArquivados: number;
  vinculoCanonico: string;
  caseIdPreenchido: boolean;
  modelVersion: string | null;
  temStructuredData: boolean;
  tamanhoRenderedHtml: number;
  temHash: boolean;
  funcaoRenderizacao: string;
  previaInterna: string;
  rlsProprietaria: string;
};

export type CamadaJuridica = {
  presente: boolean;
  fonteAprovada: string | null;
  versao: string | null;
  vigencia: string | null;
  responsavel: string | null;
  exigeRevisaoJuridica: boolean;
  observacao: string;
};

export type CamadaCaso = {
  presente: boolean;
  parcial: boolean;
  registroId: string | null;
  parametrosAusentes: string[];
  estado: string;
  previa: string;
};

export type LinhaTresCamadas = {
  codigo: "ANEXO_I" | "ANEXO_II" | "ANEXO_III" | "ANEXO_IV" | "ANEXO_V";
  nome: string;
  annexCode: string;
  tecnica: CamadaTecnica;
  juridica: CamadaJuridica;
  caso: CamadaCaso;
  estados: EstadoReconciliacao[];
  frasePadrao: string;
  acaoExternaPermitida: false;
};

const RLS_PROPRIETARIA =
  "RLS ativa em contract_annexes; leitura e edição interna liberadas para admin/operações da própria organização.";

function tecnica(annexCode: string, extra: Partial<CamadaTecnica> = {}): CamadaTecnica {
  const registros = evidenciasPorCodigo(annexCode);
  const ativos = registros.filter((r) => !r.arquivado);
  const base = ativos[0] ?? null;
  return {
    presente: ativos.length > 0,
    registrosAtivos: ativos.length,
    registrosArquivados: registros.length - ativos.length,
    vinculoCanonico: base
      ? `case_id ${base.caseId} (${base.casoCodigo}) · parameters_id ${base.parametersId}`
      : "sem vínculo",
    caseIdPreenchido: Boolean(base?.caseId),
    modelVersion: base?.modelVersion ?? null,
    temStructuredData: Boolean(base?.temStructuredData),
    tamanhoRenderedHtml: base?.tamanhoRenderedHtml ?? 0,
    temHash: Boolean(base?.temHash),
    funcaoRenderizacao: "renderizarAnexo (src/lib/anexos-i-v.ts) + persistência em src/lib/anexos-persistidos.server.ts",
    previaInterna: "Prévia interna disponível com marca de rascunho; nenhum envio externo.",
    rlsProprietaria: RLS_PROPRIETARIA,
    ...extra,
  };
}

const CASO_AUSENTE_ANA: CamadaCaso = {
  presente: false,
  parcial: false,
  registroId: null,
  parametrosAusentes: [],
  estado: "Nenhum registro de contract_annexes vinculado ao caso CA-CID-AT-FAM-2026-001.",
  previa: "Prévia possível apenas a partir do motor, ainda sem instância persistida do caso.",
};

export const ANEXOS_TRES_CAMADAS: LinhaTresCamadas[] = [
  {
    codigo: "ANEXO_I",
    nome: "Anexo I — Ordem de Serviço",
    annexCode: "ANEXO_I_ORDEM_SERVICO",
    tecnica: tecnica("ANEXO_I_ORDEM_SERVICO"),
    juridica: {
      presente: true,
      fonteAprovada: "docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md (derivação de escopo)",
      versao: "ANEXO-I-ORDEM-DE-SERVICO-v1.0",
      vigencia: "vigente para uso interno",
      responsavel: "Proprietária Administradora",
      exigeRevisaoJuridica: false,
      observacao:
        "Estrutura e campos derivam do contrato-base; o corpo renderizado hoje é descritivo e depende da proposta/OS aprovada do caso.",
    },
    caso: {
      ...CASO_AUSENTE_ANA,
      parametrosAusentes: ["Proposta/OS aprovada do caso", "SKU homologado", "Condição comercial vigente"],
    },
    estados: [
      "TECNICAMENTE_EXISTE",
      "CONTEUDO_PLACEHOLDER",
      "INSTANCIA_DO_CASO_AUSENTE",
      "PRONTO_PARA_PREVIA_INTERNA",
    ],
    frasePadrao:
      "Anexo I: instância técnica existe no app (caso de validação do motor); modelo jurídico derivado do contrato-base está localizado; instância do caso de Ana Luiza ausente; prévia interna disponível; nenhuma ação externa permitida.",
    acaoExternaPermitida: false,
  },
  {
    codigo: "ANEXO_II",
    nome: "Anexo II — Controle/autorização de despesas externas",
    annexCode: "ANEXO_II_DESPESAS_EXTERNAS",
    tecnica: tecnica("ANEXO_II_DESPESAS_EXTERNAS"),
    juridica: {
      presente: false,
      fonteAprovada: null,
      versao: null,
      vigencia: null,
      responsavel: null,
      exigeRevisaoJuridica: true,
      observacao:
        "Nenhuma minuta jurídica homologada localizada em docs/contratos. O texto persistido é descritivo (placeholder), não instrumento.",
    },
    caso: { ...CASO_AUSENTE_ANA, parametrosAusentes: ["Despesa externa concreta", "Teto por destino", "Política de reembolso homologada"] },
    estados: [
      "TECNICAMENTE_EXISTE",
      "MODELO_JURIDICO_NAO_LOCALIZADO",
      "CONTEUDO_PLACEHOLDER",
      "INSTANCIA_DO_CASO_AUSENTE",
      "PRONTO_PARA_PREVIA_INTERNA",
      "AGUARDA_REVISAO_JURIDICA",
    ],
    frasePadrao:
      "Anexo II: instância técnica existe no app; modelo jurídico homologado não foi localizado; sem despesa concreta no caso; prévia interna disponível; nenhuma ação externa permitida.",
    acaoExternaPermitida: false,
  },
  {
    codigo: "ANEXO_III",
    nome: "Anexo III — Autorização específica de pesquisa",
    annexCode: "ANEXO_III_AUTORIZACAO_PESQUISA",
    tecnica: tecnica("ANEXO_III_AUTORIZACAO_PESQUISA"),
    juridica: {
      presente: true,
      fonteAprovada: "Cláusula de pesquisa do contrato-base v2 + gate em src/lib/anexos-persistidos.server.ts",
      versao: "ANEXO-III-AUTORIZACAO-PESQUISA-v1.0",
      vigencia: "vigente para uso interno",
      responsavel: "Proprietária Administradora",
      exigeRevisaoJuridica: false,
      observacao:
        "Regras de autorização (órgão, pessoas, documentos, teto, prazo) existem; o corpo renderizado ainda é descritivo até a pesquisa nominal do caso.",
    },
    caso: { ...CASO_AUSENTE_ANA, parametrosAusentes: ["Órgão/fonte alvo", "Pessoas e documentos", "Teto e prazo"] },
    estados: [
      "TECNICAMENTE_EXISTE",
      "CONTEUDO_PLACEHOLDER",
      "INSTANCIA_DO_CASO_AUSENTE",
      "PRONTO_PARA_PREVIA_INTERNA",
    ],
    frasePadrao:
      "Anexo III: instância técnica existe no app; modelo jurídico derivado do contrato-base está localizado; instância do caso de Ana Luiza ausente; prévia interna disponível; nenhuma ação externa permitida.",
    acaoExternaPermitida: false,
  },
  {
    codigo: "ANEXO_IV",
    nome: "Anexo IV — Procuração específica",
    annexCode: "ANEXO_IV_PROCURACAO",
    tecnica: tecnica("ANEXO_IV_PROCURACAO"),
    juridica: {
      presente: false,
      fonteAprovada: null,
      versao: null,
      vigencia: null,
      responsavel: null,
      exigeRevisaoJuridica: true,
      observacao:
        "Minuta de procuração homologada não localizada; o tipo de poderes ainda depende de exigência do órgão e de revisão jurídica.",
    },
    caso: { ...CASO_AUSENTE_ANA, parametrosAusentes: ["Órgão exigente", "Poderes específicos", "Outorgante/outorgado qualificados"] },
    estados: [
      "TECNICAMENTE_EXISTE",
      "MODELO_JURIDICO_NAO_LOCALIZADO",
      "CONTEUDO_PLACEHOLDER",
      "INSTANCIA_DO_CASO_AUSENTE",
      "PRONTO_PARA_PREVIA_INTERNA",
      "AGUARDA_REVISAO_JURIDICA",
    ],
    frasePadrao:
      "Anexo IV: instância técnica existe no app; modelo jurídico homologado não foi localizado; sem exigência de órgão registrada no caso; prévia interna disponível; nenhuma ação externa permitida.",
    acaoExternaPermitida: false,
  },
  {
    codigo: "ANEXO_V",
    nome: "Anexo V — Termo de alteração de escopo",
    annexCode: "ANEXO_V_ALTERACAO_ESCOPO",
    tecnica: tecnica("ANEXO_V_ALTERACAO_ESCOPO"),
    juridica: {
      presente: false,
      fonteAprovada: null,
      versao: null,
      vigencia: null,
      responsavel: null,
      exigeRevisaoJuridica: true,
      observacao:
        "Regras de impacto (prazo, valor, despesa) existem no motor; texto de aditivo aprovado não localizado.",
    },
    caso: { ...CASO_AUSENTE_ANA, parametrosAusentes: ["Alteração de escopo aprovada", "Impacto de prazo/valor", "Aceite do cliente"] },
    estados: [
      "TECNICAMENTE_EXISTE",
      "MODELO_JURIDICO_NAO_LOCALIZADO",
      "CONTEUDO_PLACEHOLDER",
      "INSTANCIA_DO_CASO_AUSENTE",
      "PRONTO_PARA_PREVIA_INTERNA",
      "AGUARDA_REVISAO_JURIDICA",
    ],
    frasePadrao:
      "Anexo V: instância técnica existe no app; modelo jurídico homologado não foi localizado; sem alteração de escopo registrada no caso; prévia interna disponível; nenhuma ação externa permitida.",
    acaoExternaPermitida: false,
  },
];

export function linha(codigo: LinhaTresCamadas["codigo"]): LinhaTresCamadas {
  const l = ANEXOS_TRES_CAMADAS.find((a) => a.codigo === codigo);
  if (!l) throw new Error(`Anexo desconhecido: ${codigo}`);
  return l;
}

export function anexosComModeloJuridicoAusente(): LinhaTresCamadas[] {
  return ANEXOS_TRES_CAMADAS.filter((a) => !a.juridica.presente);
}

export function anexosComInstanciaTecnica(): LinhaTresCamadas[] {
  return ANEXOS_TRES_CAMADAS.filter((a) => a.tecnica.presente);
}

export function anexosSemInstanciaDoCaso(): LinhaTresCamadas[] {
  return ANEXOS_TRES_CAMADAS.filter((a) => !a.caso.presente);
}

export function permitePreviaInterna(a: LinhaTresCamadas): boolean {
  return a.estados.includes("PRONTO_PARA_PREVIA_INTERNA") && a.acaoExternaPermitida === false;
}

export function exigeFonteJuridicaAntesDeUsoExterno(a: LinhaTresCamadas): boolean {
  return !a.juridica.presente || a.juridica.exigeRevisaoJuridica;
}

/* ------------------------------------------------------------------ */
/* Caso Ana Luiza                                                      */
/* ------------------------------------------------------------------ */

export function resolveCasoAna(referencia: string): { id: string; codigo: string; alias: boolean } | null {
  const ref = referencia.trim().toUpperCase();
  if (ref === CASO_ANA_CODIGO_CANONICO) return { id: CASO_ANA_ID, codigo: CASO_ANA_CODIGO_CANONICO, alias: false };
  if (ref === CASO_ANA_REFERENCIA_LEGADA) return { id: CASO_ANA_ID, codigo: CASO_ANA_CODIGO_CANONICO, alias: true };
  return null;
}

export type QuadroAna = {
  casoCodigo: string;
  casoId: string;
  contratoId: string | null;
  contratoStatus: string | null;
  anexosComVinculoDeCaso: string[];
  anexosApenasVinculadosAoContrato: string[];
  anexosComParametrosAusentes: string[];
  anexosComConteudoPlaceholder: string[];
  anexosComPreviaInterna: string[];
  anexosQueExigemFonteJuridica: string[];
  observacao: string;
};

export const QUADRO_ANA: QuadroAna = {
  casoCodigo: CASO_ANA_CODIGO_CANONICO,
  casoId: CASO_ANA_ID,
  contratoId: "a11a0000-0000-4000-8000-0000000000c1",
  contratoStatus: "pending_data",
  anexosComVinculoDeCaso: evidenciasDoCaso(CASO_ANA_ID).map((e) => e.annexCode),
  anexosApenasVinculadosAoContrato: [],
  anexosComParametrosAusentes: ANEXOS_TRES_CAMADAS.filter((a) => a.caso.parametrosAusentes.length > 0).map((a) => a.codigo),
  anexosComConteudoPlaceholder: ANEXOS_TRES_CAMADAS.filter((a) => a.estados.includes("CONTEUDO_PLACEHOLDER")).map((a) => a.codigo),
  anexosComPreviaInterna: ANEXOS_TRES_CAMADAS.filter(permitePreviaInterna).map((a) => a.codigo),
  anexosQueExigemFonteJuridica: ANEXOS_TRES_CAMADAS.filter(exigeFonteJuridicaAntesDeUsoExterno).map((a) => a.codigo),
  observacao:
    "O caso canônico de Ana Luiza não possui nenhum registro em contract_annexes. As cinco instâncias I–V pertencem ao caso técnico CA-TESTE-VAL-2026-001, usado para validar o motor contratual. O contrato do caso está em pending_data e ainda não gerou anexos.",
};

/* ------------------------------------------------------------------ */
/* Causa da contradição e correções de afirmação                       */
/* ------------------------------------------------------------------ */

export const CAUSA_CONTRADICAO =
  "As duas conclusões mediram camadas diferentes. A auditoria de realidade leu a camada técnica (linhas persistidas em contract_annexes, com versão, dados estruturados e hash) e concluiu 'existe'. A varredura de completude leu a camada jurídica e a camada do caso (minuta homologada e instância vinculada ao caso de Ana Luiza) e concluiu 'não localizado'. Ambas estavam parcialmente certas e usaram um rótulo único para três realidades distintas.";

export type CorrecaoAfirmacao = {
  id: string;
  afirmacaoAnterior: string;
  origem: "auditoria_de_realidade" | "varredura_de_completude";
  correcao: string;
};

export const CORRECOES_AFIRMACOES: CorrecaoAfirmacao[] = [
  {
    id: "C-01",
    afirmacaoAnterior: "Anexos II, IV e V existem como instâncias versionadas do caso.",
    origem: "auditoria_de_realidade",
    correcao:
      "Incompleta: existem como instâncias técnicas versionadas do caso técnico CA-TESTE-VAL-2026-001, não do caso de cliente. Nenhuma delas é instância do caso de Ana Luiza.",
  },
  {
    id: "C-02",
    afirmacaoAnterior: "Anexos II, IV e V estão NAO_LOCALIZADO.",
    origem: "varredura_de_completude",
    correcao:
      "Incorreta como rótulo único: a instância técnica existe e renderiza. O que não foi localizado é o modelo jurídico homologado (camada B); a instância do caso (camada C) também está ausente.",
  },
  {
    id: "C-03",
    afirmacaoAnterior: "Anexos I e III estão PARCIAL com instância do caso ausente.",
    origem: "varredura_de_completude",
    correcao:
      "Direção correta, rótulo impreciso: camada técnica existe (TECNICAMENTE_EXISTE), o conteúdo persistido é descritivo (CONTEUDO_PLACEHOLDER) e a camada do caso está ausente (INSTANCIA_DO_CASO_AUSENTE).",
  },
  {
    id: "C-04",
    afirmacaoAnterior: "contract_annexes possui 9 linhas persistidas relevantes aos Anexos I–V.",
    origem: "auditoria_de_realidade",
    correcao:
      "Incompleta: das 9 linhas, 5 são Anexos I–V do caso técnico, 3 são anexos internos (ANX-ESCOPO, ANX-COMERCIAL, ANX-PRIVACIDADE) e 1 é a linha legada vazia ANEXO-I de outra organização, hoje arquivada.",
  },
  {
    id: "C-05",
    afirmacaoAnterior: "O caso de Ana Luiza tem Anexo I parcial.",
    origem: "varredura_de_completude",
    correcao:
      "Corrigida: o caso CA-CID-AT-FAM-2026-001 não possui nenhuma linha em contract_annexes; o contrato do caso está em pending_data.",
  },
];

export const CONFIRMACAO_RECONCILIACAO_ANEXOS =
  "Foi reconciliada a diferença entre existência técnica, conteúdo jurídico homologado e instância específica do caso. Nenhum Anexo I–V foi declarado ausente sem identificar a camada ausente. Nenhum dado, documento, contrato, integração ou ação externa foi alterado.";
