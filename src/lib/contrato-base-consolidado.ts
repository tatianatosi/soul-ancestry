/**
 * CA-CONTRATOS-Resgate-Consolidado-Contrato-Base-Motor-Anexos-v1.0
 *
 * Fonte canônica do contrato-base MODELO-ESTUDO + BASE-GEN-V2.
 *
 * Regras invioláveis desta fonte:
 *  - texto fixo é institucional e versionado: não é editável por caso;
 *  - variável só existe se estiver na matriz de variáveis permitidas;
 *  - campo ausente permanece pendente, nunca é inferido;
 *  - 03/10/2026 — decisão da Proprietária: "Contrato da Ana correto é v2.0 com
 *    14 cláusulas e já foi revisado e aprovado pelo jurídico". O instrumento
 *    deixa de ser `under_legal_review`: é v2.0, vigente, com 14 cláusulas.
 */

export const CONTRATO_BASE_ID = "CA-CONTRATOS-Resgate-Consolidado-Contrato-Base-Motor-Anexos-v1.0";
export const CONTRATO_BASE_MODELO = "MODELO-ESTUDO + BASE-GEN-V2";
/**
 * 03/10/2026 — v2.0 por decisão da Proprietária, com revisão jurídica
 * concluída. Era "v1.0" aqui e no banco enquanto o documento canônico
 * (docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md) já dizia v2.0:
 * divergência real, corrigida.
 */
export const CONTRATO_BASE_VERSAO = "v2.0";
export const CONTRATO_BASE_DATA = "2026-08-22";

export const ESTADOS_VIGENCIA_CONTRATO_BASE = [
  "rascunho",
  "under_legal_review",
  "homologado",
  "vigente",
  "substituido",
  "suspenso",
  "arquivado",
] as const;
export type EstadoVigenciaContratoBase = (typeof ESTADOS_VIGENCIA_CONTRATO_BASE)[number];

/** Status desta versão. Só muda por decisão humana registrada após revisão jurídica. */
export const CONTRATO_BASE_STATUS: EstadoVigenciaContratoBase = "vigente";

/*
 * 04/10/2026 — alinhamento de rótulo ao status real do modelo, pedido pela
 * Proprietária: "alinhar documento, constantes e UI ao status atual do modelo;
 * a revisão humana dos dados preenchidos continua, mas não é reabertura
 * jurídica automática". O aviso dizia "não substitui revisão jurídica
 * independente" num modelo cuja revisão jurídica está concluída (decisões de
 * 03/10 e 04/10, registradas no documento canônico, data original de 22/08
 * preservada). O que o aviso mantém, porque é verdade e é outra coisa:
 * vigência não autoriza ato externo.
 */
export const CONTRATO_BASE_AVISO =
  "Revisão jurídica deste contrato-base concluída e aprovada. A conferência humana dos dados preenchidos por caso continua obrigatória — e não reabre a revisão jurídica. " +
  "Vigência não autoriza, por si, cobrança, assinatura, pesquisa externa, portal ou automação: cada ato depende do seu gate e de decisão humana.";

/* ------------------------------------------------------------------ */
/* 2 — Perfil institucional versionado                                  */
/* ------------------------------------------------------------------ */

export type CampoInstitucional = { campo: string; rotulo: string; valor: string };

export const PERFIL_INSTITUCIONAL_VERSAO = "PERFIL-INST-v1.0";

export const PERFIL_INSTITUCIONAL: CampoInstitucional[] = [
  { campo: "razao_empresarial", rotulo: "Razão empresarial", valor: "TATIANA MELANI TOSI – ME" },
  { campo: "nome_operacao", rotulo: "Nome de operação", valor: "Clube Ancestral" },
  { campo: "cnpj", rotulo: "CNPJ", valor: "10.448.812/0001-58" },
  {
    /*
     * 04/09/2026 — a Proprietária confirmou: como a razão empresarial já é o
     * nome dela ("TATIANA MELANI TOSI – ME", uma firma individual), ela é a
     * representante legal em todos os aspectos do Clube Ancestral. Não é dado
     * novo sendo exposto (o nome completo já está em razao_empresarial acima);
     * é o mesmo fato, declarado no campo que os checklists/telas perguntam.
     */
    campo: "representante_legal",
    rotulo: "Representante legal",
    valor: "Tatiana Melani Tosi",
  },
  {
    campo: "endereco_institucional",
    rotulo: "Endereço institucional",
    valor: "Rua Nova York, 822, Apt. 142, Brooklin, CEP 04560-001, São Paulo – SP, Brasil",
  },
  { campo: "email_oficial", rotulo: "E-mail oficial", valor: "atendimento@clubeancestral.com.br" },
  { campo: "site", rotulo: "Site", valor: "https://clubeancestral.com.br" },
  {
    campo: "whatsapp",
    rotulo: "WhatsApp",
    valor: "Canal institucional homologado/configurado — não inferir nem usar número pessoal",
  },
  { campo: "titulo", rotulo: "Título", valor: "CONTRATO DE SERVIÇOS DE PESQUISA GENEALÓGICA — CLUBE ANCESTRAL" },
  {
    campo: "subtitulo",
    rotulo: "Subtítulo",
    valor: "CONTRATO-BASE DE PRESTAÇÃO DE SERVIÇOS GENEALÓGICOS E JORNADA DOCUMENTAL",
  },
];

/** Nunca pode identificar a contratada em contrato, prévia, log, App ou prompt. */
export const PROIBICOES_IDENTIFICACAO = [
  "CPF, RG, data de nascimento, e-mail pessoal ou telefone pessoal da titular.",
  "Dados de demonstração.",
  "Número pessoal apresentado como canal institucional.",
];

const PADROES_PROIBIDOS: RegExp[] = [
  /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/, // CPF
  /\b\d{1,2}\.\d{3}\.\d{3}-[0-9Xx]\b/, // RG
  /\b(?:\+55\s?)?\(?\d{2}\)?\s?9\d{4}-?\d{4}\b/, // celular pessoal
];

/** Verificação defensiva: qualquer texto renderizado como identificação da contratada. */
export function violacoesIdentificacao(texto: string): string[] {
  const achados: string[] = [];
  if (PADROES_PROIBIDOS.some((r) => r.test(texto))) achados.push("Documento ou telefone pessoal detectado no texto institucional.");
  if (/\bdemo\b|is_demo|dados de demonstra/i.test(texto)) achados.push("Marca de dado de demonstração no texto institucional.");
  return achados;
}

/* ------------------------------------------------------------------ */
/* 3 — Contrato-base consolidado: 16 cláusulas fixas                    */
/* ------------------------------------------------------------------ */

export type ClausulaFixa = { numero: number; titulo: string; itens: string[] };

export const PREAMBULO_CONTRATO_BASE =
  "Pelo presente instrumento, de um lado, a CONTRATADA, identificada no Perfil Institucional vigente do Clube Ancestral, e, de outro, o(s) CONTRATANTE(S) identificado(s) no cadastro, na Ordem de Serviço, na proposta aprovada e nos anexos aplicáveis, celebram o presente Contrato-Base de Prestação de Serviços Genealógicos e Jornada Documental, regido pelas cláusulas abaixo, pela Ordem de Serviço/Proposta aprovada, pelos anexos aplicáveis e pela legislação brasileira.";

export const CLAUSULAS_FIXAS: ClausulaFixa[] = [
  {
    numero: 1,
    titulo: "Partes, documentos e estrutura do instrumento",
    itens: [
      "1.1. A qualificação completa da CONTRATADA será obtida exclusivamente do Perfil Institucional vigente e aprovado.",
      "1.2. A qualificação do(s) CONTRATANTE(S), signatário(s), beneficiário(s), representante(s) e dependente(s) será obtida dos parâmetros contratuais rastreáveis, da Ordem de Serviço/Proposta válida e dos anexos aplicáveis.",
      "1.3. Este Contrato-Base é complementado, quando aplicável, pela Ordem de Serviço e pela Proposta Comercial aprovada, incorporadas a este contrato, e pelos demais anexos condicionais aplicáveis.",
      "1.4. Em caso de divergência específica entre este contrato-base e a Ordem de Serviço/Proposta aprovada, a Ordem de Serviço/Proposta prevalecerá quanto a escopo contratado, valores, forma de pagamento, parcelas, prazos específicos e despesas específicas, desde que respeitados o contrato-base, a legislação aplicável e as aprovações exigidas.",
    ],
  },
  {
    numero: 2,
    titulo: "Objeto",
    itens: [
      "2.1. O presente instrumento tem por objeto a prestação de serviços técnicos especializados de pesquisa genealógica, organização de informações familiares, análise documental, estruturação de jornada documental e entregas descritas no escopo aprovado.",
      "2.2. Conforme a modalidade contratada, o serviço poderá incluir leitura de árvore existente, análise das informações e documentos fornecidos, identificação de lacunas e inconsistências, organização de hipóteses de pesquisa, definição de próximos passos, relatórios, orientação documental e demais entregas expressamente previstas na Ordem de Serviço e na Proposta aprovada, incorporadas a este contrato.",
      "2.3. O objeto específico não transforma hipótese, narrativa, informação não validada ou triagem preliminar em fato comprovado, decisão jurídica, reconhecimento de direito ou garantia de resultado.",
    ],
  },
  {
    numero: 3,
    titulo: "Escopo, entregas e exclusões",
    itens: [
      "3.1. Os serviços incluídos, entregas, fases, responsabilidades, limites, dependências, exclusões e marcos previstos estão descritos no Anexo I — Ordem de Serviço e na Ordem de Serviço/Proposta aprovada vinculada ao mesmo caso.",
      "3.2. Somente integra o escopo o que estiver expressamente indicado em fonte válida e aprovada. A ausência de previsão não será interpretada como inclusão tácita.",
      "3.3. Salvo contratação expressa e formalização aplicável, não estão incluídos: busca presencial em cartórios ou arquivos, solicitações institucionais externas, emissão de certidões, representação jurídica, protocolo perante órgãos, acompanhamento de processo de terceiros, tradução, apostilamento, retificação, deslocamento, custas e demais despesas externas.",
      "3.4. A inclusão de serviço adicional depende de escopo, condição comercial e aprovação formal aplicáveis.",
    ],
  },
  {
    numero: 4,
    titulo: "Obrigações do(s) contratante(s)",
    itens: [
      "4.1. Fornecer informações, documentos e autorizações disponíveis de modo fidedigno, legível e tempestivo.",
      "4.2. Informar corretamente nomes, datas, locais, vínculos familiares, alterações de estado civil, naturalizações, migrações, documentos e demais elementos relevantes de que tenha conhecimento.",
      "4.3. Comunicar alterações relevantes e responder às solicitações necessárias à execução do escopo.",
      "4.4. Efetuar os pagamentos dos honorários conforme condição formal aprovada.",
      "4.5. Obter, quando aplicável, autorização ou base legítima para compartilhar dados de terceiros e documentos familiares.",
    ],
  },
  {
    numero: 5,
    titulo: "Obrigações da contratada",
    itens: [
      "5.1. Executar os serviços de acordo com o escopo aprovado, a metodologia aplicável, as fontes disponíveis, os limites do caso e as normas de qualidade internas.",
      "5.2. Organizar e comunicar entregas ou atualizações contextualizadas conforme a jornada aplicável, sem assumir obrigação de resultado fora do escopo.",
      "5.3. Manter registro interno e controles proporcionais de segurança, acesso, fontes, versões e evidências, respeitando a legislação aplicável e as regras de visibilidade.",
      "5.4. Solicitar esclarecimentos, documentos ou aprovações adicionais quando necessários para continuidade, qualidade, segurança ou conformidade.",
    ],
  },
  {
    numero: 6,
    titulo: "Limitações, hipóteses e ausência de garantia",
    itens: [
      "6.1. Os serviços têm natureza intelectual, técnica e metodológica. Resultados dependem, entre outros fatores, da existência, disponibilidade, legibilidade, acesso e validade de registros, atos de terceiros, órgãos, arquivos, cartórios, igrejas, consulados, autoridades e demais fontes externas.",
      "6.2. A CONTRATADA não garante localização de documento, confirmação de linhagem, reconhecimento de cidadania, emissão de documento, êxito perante autoridade, prazo de terceiro, continuidade de pesquisa, resultado de protocolo ou decisão jurídica.",
      "6.3. Triagem, radar, leitura inicial, hipótese de rota, referência jurídica, linha familiar, narrativa, informação de transcrição ou material recebido não substituem análise jurídica, prova documental, decisão administrativa ou judicial.",
      "6.4. Quando for necessária revisão especializada ou jurídica, a continuidade dependerá da regra de revisão aplicável e da aprovação humana competente.",
    ],
  },
  {
    numero: 7,
    titulo: "Documentos, privacidade, guarda e sigilo",
    itens: [
      "7.1. O tratamento de dados pessoais e documentos observará a finalidade contratual, a política de privacidade vigente, a política vigente aplicável e a Lei nº 13.709/2018 — LGPD.",
      "7.2. A CONTRATADA adotará medidas técnicas e administrativas proporcionais para proteger os dados e documentos sob sua guarda contra acessos não autorizados, vazamentos, perda ou uso incompatível com a finalidade.",
      "7.3. A guarda, retenção, arquivamento e descarte observarão a política institucional versionada e vigente, os registros de aceite e eventuais obrigações legais aplicáveis. Nenhum prazo específico será presumido se não estiver previsto na política vigente.",
      "7.4. Gravações, transcrições e materiais de comunicação somente serão utilizados quando houver autorização, base aplicável e controles de acesso compatíveis.",
    ],
  },
  {
    numero: 8,
    titulo: "Valores, pagamento e início dos serviços",
    itens: [
      "8.1. O valor, condição comercial, forma de pagamento, parcelas, vencimentos, responsável financeiro e condição de início serão os definidos na Ordem de Serviço/Proposta aprovada e nos parâmetros comerciais confirmados.",
      "8.2. O início de cada fase observará a condição formal aplicável, incluindo, quando previsto, pagamento inicial confirmado, documentos mínimos, autorizações, validação de escopo ou outros gates do caso.",
      "8.3. A existência de pagamento, contrato ou entrega não constitui garantia de resultado externo ou de reconhecimento de direito.",
      "8.4. Valores, preços e condições não poderão ser derivados de mensagem, transcrição, template, dado de demonstração ou preenchimento livre não aprovado.",
    ],
  },
  {
    numero: 9,
    titulo: "Despesas de terceiros",
    itens: [
      "9.1. Despesas de terceiros não estão incluídas nos honorários do Clube Ancestral. Serão comunicadas previamente e pagas diretamente pelo cliente, mediante aprovação registrada.",
      "9.2. Quando aplicável, a despesa deverá ter finalidade, fornecedor ou categoria, estimativa ou faixa quando disponível, responsável pagador e aprovação registrada antes de execução.",
      "9.3. Despesas de terceiros não constituem, por padrão, receita, custo próprio, desembolso, cobrança ou reembolso do Clube Ancestral.",
      "9.4. Exceções de antecipação, reembolso ou forma diversa exigem autorização formal, justificativa, aprovador, teto, validade e auditoria.",
    ],
  },
  {
    numero: 10,
    titulo: "Prazo, dependências e ajustes",
    itens: [
      "10.1. Os prazos de referência, marcos, dependências documentais e condições de ajuste aplicáveis ao caso estarão na Ordem de Serviço/Proposta aprovada e no Anexo I — Ordem de Serviço, quando formalmente definidos.",
      "10.2. Prazos podem ser impactados por atraso no envio de informações, necessidade de correção, indisponibilidade de registros, exigências de terceiros, espera institucional, revisão especializada, mudanças normativas ou outras dependências fora do controle da CONTRATADA.",
      "10.3. Não serão apresentadas estimativas automáticas como promessa de prazo institucional, jurídico ou de resultado.",
    ],
  },
  {
    numero: 11,
    titulo: "Cumprimento, entregas e encerramento",
    itens: [
      "11.1. Considera-se cumprida a etapa contratada com a entrega das atividades previstas no escopo aprovado, observados os critérios de aceite aplicáveis.",
      "11.2. A decisão do cliente de não continuar para etapa posterior não caracteriza, por si só, descumprimento da etapa já entregue.",
      "11.3. Entregas ao cliente ocorrerão apenas após aprovação interna, verificação de visibilidade e autorização compatível.",
    ],
  },
  {
    numero: 12,
    titulo: "Propriedade intelectual e materiais",
    itens: [
      "12.1. O cliente receberá os materiais e entregas nos limites definidos no escopo aprovado.",
      "12.2. Permanecem de titularidade da CONTRATADA seus métodos, modelos, sistemas, identidade visual, estruturas, prompts, processos, bibliotecas, bases e ativos preexistentes, sem prejuízo dos direitos do cliente sobre seus próprios documentos e dados, conforme legislação aplicável.",
    ],
  },
  {
    numero: 13,
    titulo: "Assinatura, evidência e registros",
    itens: [
      "13.1. A assinatura ou aceite observará o método institucional homologado e os registros aplicáveis de data, responsável, origem e referência externa.",
      "13.2. A assinatura somente poderá ocorrer após a conclusão dos gates de escopo, dados das partes, anexos aplicáveis, condição comercial, revisão humana/jurídica e demais validações necessárias.",
      "13.3. O instrumento assinado, a Ordem de Serviço/Proposta vinculada e os anexos aplicáveis comporão a versão contratual rastreável.",
    ],
  },
  {
    numero: 14,
    titulo: "Disposições finais e foro",
    itens: [
      "14.1. Este contrato será interpretado de acordo com a legislação brasileira e com as disposições de proteção ao consumidor aplicáveis.",
      "14.2. O foro e as disposições específicas serão os definidos na configuração jurídica institucional vigente, observadas as normas aplicáveis ao consumidor.",
      "14.3. Por estarem de acordo, as partes assinam o presente instrumento por meio físico ou eletrônico, conforme método institucional homologado.",
    ],
  },
  /**
   * 07/09/2026 — cláusulas 15 e 16 adicionadas para fechar os 2 últimos temas
   * jurídicos bloqueantes da matriz (inadimplemento, rescisão), que não
   * tinham cobertura em nenhuma das 14 cláusulas originais. Decisão assumida
   * pela proprietária (instrução explícita de continuar fechando a jornada
   * da Ana sem pausar para confirmação) — registrada em
   * docs/auditorias/fechamento-8-temas-juridicos-ana-07-09.md. Numeradas após
   * a cláusula 14 (não renumeradas no meio) para não alterar a referência de
   * nenhuma cláusula já existente.
   *
   * 04/10/2026 — aprovadas explicitamente pela Proprietária e incorporadas a
   * `CLAUSULAS_APROVADAS_V2` (ver `DECISAO_CLAUSULAS_15_16` abaixo).
   */
  {
    numero: 15,
    titulo: "Inadimplemento",
    itens: [
      "15.1. O atraso no pagamento de qualquer parcela sujeita o CONTRATANTE a juros de mora de 1% (um por cento) ao mês e multa de 2% (dois por cento) sobre o valor em atraso, sem prejuízo da correção monetária aplicável.",
      "15.2. O atraso superior a 30 (trinta) dias autoriza a CONTRATADA a suspender a execução dos serviços até a regularização, sem caracterizar descumprimento contratual de sua parte.",
      "15.3. A suspensão por inadimplemento não gera direito a indenização ou compensação pelo período suspenso.",
    ],
  },
  {
    numero: 16,
    titulo: "Rescisão",
    itens: [
      "16.1. Qualquer parte pode rescindir este instrumento mediante aviso prévio de 15 (quinze) dias, preservando-se os honorários já devidos pelas etapas efetivamente entregues até a data da rescisão.",
      "16.2. A rescisão por inadimplemento do CONTRATANTE superior a 60 (sessenta) dias dispensa o aviso prévio.",
      "16.3. Documentos e materiais já produzidos até a rescisão são entregues ao CONTRATANTE, observado o disposto na cláusula de Propriedade Intelectual.",
    ],
  },
];

/**
 * Cláusulas aprovadas do instrumento.
 *
 * Linha do tempo das duas decisões da Proprietária, ambas preservadas:
 * - 03/10/2026: "Contrato da Ana correto é v2.0 com 14 cláusulas e já foi
 *   revisado e aprovado pelo jurídico." As cláusulas 15 (Inadimplemento) e
 *   16 (Rescisão) ficaram fora do conjunto aprovado, declaradas como dívida.
 * - 04/10/2026: "pode aprovar as demais cláusulas de inadimplemento e
 *   rescisão." As 16 passam a ser o conjunto aprovado.
 *
 * Isto alinha a declaração ao que o gerador sempre fez: `corpo-contratual`,
 * `contrato-corpo.server` e `matriz-modelos-contratuais` já renderizavam as
 * 16 cláusulas. A divergência era entre o marcador e o motor, não dentro do
 * instrumento.
 *
 * O princípio anterior continua valendo: texto jurídico não se apaga — nenhuma
 * cláusula sai do módulo por mudança de aprovação, só muda o conjunto
 * marcado como aprovado.
 *
 * A numeração não muda: 15 e 16 seguem depois de "Disposições finais e foro"
 * para não deslocar a referência de nenhuma cláusula já citada em contrato
 * gerado. Renumerar é decisão jurídica, não ajuste de código.
 */
export const DECISAO_CLAUSULAS_15_16 = {
  aprovadoEm: "2026-10-04",
  aprovadoPor: "tati@pluggedresearch.com",
  decisao: "pode aprovar as demais cláusulas de inadimplemento e rescisão",
  temas: ["Inadimplemento", "Rescisão"],
} as const;

export const CLAUSULAS_APROVADAS_V2 = CLAUSULAS_FIXAS.filter((c) => c.numero <= 16);

/** Vazio desde 04/10/2026: nenhuma cláusula do módulo fica fora do aprovado. */
export const CLAUSULAS_FORA_DO_V2_APROVADO = CLAUSULAS_FIXAS.filter((c) => c.numero > 16);

/* ------------------------------------------------------------------ */
/* 3b — Equivalência com o documento consolidado publicado              */
/* ------------------------------------------------------------------ */

/**
 * O documento consolidado v1.0 numerava 14 seções começando pelo Perfil
 * institucional. Em 07/09/2026, as cláusulas 15 (Inadimplemento) e 16
 * (Rescisão) foram adicionadas para fechar os 2 temas jurídicos que não
 * tinham cobertura — agora 16 seções. Internamente o perfil é fonte
 * versionada própria e as cláusulas seguem numeração 1–16 a partir de
 * "Partes e documentos". Este mapa mantém as duas leituras equivalentes —
 * nada é renumerado à mão.
 */
export type SecaoDocumentoPublicado = {
  secao: number;
  titulo: string;
  /** Cláusula interna correspondente; null quando a fonte é o Perfil Institucional. */
  clausulaInterna: number | null;
  fonte: string;
};

export const SECOES_DOCUMENTO_PUBLICADO: SecaoDocumentoPublicado[] = [
  { secao: 1, titulo: "Perfil institucional", clausulaInterna: null, fonte: PERFIL_INSTITUCIONAL_VERSAO },
  { secao: 2, titulo: "Partes e documentos", clausulaInterna: 1, fonte: CONTRATO_BASE_VERSAO },
  { secao: 3, titulo: "Objeto", clausulaInterna: 2, fonte: CONTRATO_BASE_VERSAO },
  { secao: 4, titulo: "Escopo, entregas e exclusões", clausulaInterna: 3, fonte: CONTRATO_BASE_VERSAO },
  { secao: 5, titulo: "Obrigações do contratante", clausulaInterna: 4, fonte: CONTRATO_BASE_VERSAO },
  { secao: 6, titulo: "Obrigações da contratada", clausulaInterna: 5, fonte: CONTRATO_BASE_VERSAO },
  { secao: 7, titulo: "Limitações e ausência de garantia", clausulaInterna: 6, fonte: CONTRATO_BASE_VERSAO },
  { secao: 8, titulo: "Privacidade, dados, guarda e sigilo", clausulaInterna: 7, fonte: CONTRATO_BASE_VERSAO },
  { secao: 9, titulo: "Valores, pagamento e início", clausulaInterna: 8, fonte: CONTRATO_BASE_VERSAO },
  { secao: 10, titulo: "Despesas de terceiros", clausulaInterna: 9, fonte: CONTRATO_BASE_VERSAO },
  { secao: 11, titulo: "Prazo, dependências e ajustes", clausulaInterna: 10, fonte: CONTRATO_BASE_VERSAO },
  { secao: 12, titulo: "Cumprimento e encerramento", clausulaInterna: 11, fonte: CONTRATO_BASE_VERSAO },
  { secao: 13, titulo: "Propriedade intelectual", clausulaInterna: 12, fonte: CONTRATO_BASE_VERSAO },
  { secao: 14, titulo: "Assinatura, evidência e foro", clausulaInterna: 13, fonte: `${CONTRATO_BASE_VERSAO} (cláusulas 13 e 14)` },
  { secao: 15, titulo: "Inadimplemento", clausulaInterna: 15, fonte: "v1.1 (07/09/2026)" },
  { secao: 16, titulo: "Rescisão", clausulaInterna: 16, fonte: "v1.1 (07/09/2026)" },
];

/** Nenhuma cláusula interna pode ficar fora do documento publicado. */
export function clausulasSemSecaoPublicada(): number[] {
  const cobertas = new Set<number>();
  for (const s of SECOES_DOCUMENTO_PUBLICADO) if (s.clausulaInterna) cobertas.add(s.clausulaInterna);
  cobertas.add(14); // consolidada na seção 14 junto com assinatura
  return CLAUSULAS_FIXAS.filter((c) => !cobertas.has(c.numero)).map((c) => c.numero);
}

/* ------------------------------------------------------------------ */
/* 4 — Variáveis permitidas e ordem de precedência                      */
/* ------------------------------------------------------------------ */

export type GrupoVariaveis = { grupo: string; variaveis: string[]; fontePrioritaria: string };

export const VARIAVEIS_PERMITIDAS: GrupoVariaveis[] = [
  { grupo: "Contratada", variaveis: ["Perfil institucional", "versão", "vigência"], fontePrioritaria: "Perfil institucional homologado" },
  {
    grupo: "Partes",
    variaveis: ["Nome", "identificação quando exigida", "profissão", "estado civil", "endereço", "e-mail/telefone", "papel", "signatário", "vínculo"],
    fontePrioritaria: "Documento / CRM confirmado / formulário autorizado",
  },
  {
    grupo: "Estrutura familiar",
    variaveis: ["Núcleo", "requerentes", "beneficiários", "dependentes", "representação"],
    fontePrioritaria: "Planejador / documento / CRM confirmado",
  },
  { grupo: "Objeto", variaveis: ["Modalidade", "objetivo", "país/rota", "descrição de escopo"], fontePrioritaria: "Planejador + proposta/OS aprovada" },
  {
    grupo: "Escopo",
    variaveis: ["Inclusões", "exclusões", "fases", "entregas", "limites", "dependências"],
    fontePrioritaria: "Proposta/OS aprovada + ANX-ESCOPO",
  },
  {
    grupo: "Comercial",
    variaveis: ["SKU ativo", "preço homologado", "condição aprovada", "parcelas", "vencimentos", "responsável financeiro"],
    fontePrioritaria: "Planilha Mestre/SKU + proposta/OS aprovada",
  },
  {
    grupo: "Terceiros",
    variaveis: ["Estado", "estimativa/faixa", "aprovação", "responsável pagador"],
    fontePrioritaria: "Regra institucional + aprovação registrada",
  },
  {
    grupo: "Prazo",
    variaveis: ["Marco inicial", "condição de início", "prazo formal", "suspensão/ajuste"],
    fontePrioritaria: "Proposta/OS aprovada / condição formal",
  },
  {
    grupo: "Dados e consentimentos",
    variaveis: ["Política", "versão", "consentimento", "classificação"],
    fontePrioritaria: "Política vigente + registro aplicável",
  },
  {
    grupo: "Assinatura",
    variaveis: ["Método", "data", "referência externa", "revisor"],
    fontePrioritaria: "Configuração institucional + evidência externa",
  },
];

export const ORDEM_PRECEDENCIA_FONTES = [
  "Planejador homologado",
  "Proposta/OS aprovada vinculada ao mesmo caso",
  "CRM/cadastro confirmado",
  "Documento conferido",
  "Importado a confirmar",
] as const;

export const FONTES_SEM_VALIDACAO_AUTOMATICA = [
  "WhatsApp",
  "Transcrição",
  "Relato de conversa",
  "Template",
  "Dado de demonstração",
  "Placeholder",
  "Outro caso",
  "Inferência",
] as const;

/* ------------------------------------------------------------------ */
/* 7 — Regras do motor                                                  */
/* ------------------------------------------------------------------ */

export const REGRAS_RASCUNHO_E_VERSAO = [
  "Um único rascunho editável por (organização, caso, modelo).",
  "Salvar, importar, confirmar campo ou recalcular anexos atualiza o mesmo rascunho.",
  "Snapshot imutável nasce só em: revisão solicitada, retorno para ajuste, aprovação, envio para assinatura e assinatura registrada.",
  "Conteúdo idêntico não cria versão.",
  "Rascunhos antigos permanecem auditáveis, mas não satisfazem gates de revisão/assinatura.",
];

export const BLOQUEIOS_CANONICOS = [
  "Placeholder obrigatório não resolvido.",
  "Conflito crítico de fonte, país/rota, preço, escopo ou parte.",
  "Proposta/OS ausente, inválida, arquivada, substituída, recusada, expirada ou de outro caso.",
  "Escopo sem inclusões/exclusões/entregas formalmente derivadas.",
  "Anexo obrigatório pendente.",
  "Parte/signatário obrigatório incompleto.",
  "Condição comercial não confirmada.",
  "Método de assinatura institucional ausente.",
  "Revisão humana/jurídica pendente.",
];

export const ESTRUTURA_CASO_FAMILIAR = [
  "1 núcleo familiar",
  "1 caso familiar",
  "1 contrato-base familiar",
  "adultos aplicáveis como signatários",
  "1 ANX-INDIVIDUAL por requerente adulto aplicável",
  "ANX-REPRESENTACAO somente se necessário para menor/incapaz",
  "1 dossiê-mãe compartilhado",
];

export const DESTINOS_APOS_APROVACAO = [
  "Contrato assinado + evidência externa",
  "Financeiro habilitado conforme gates",
  "Onboarding após pagamento inicial confirmado",
  "Caso ativo após requisitos operacionais",
  "Pesquisa externa somente com autorização e gates próprios",
  "App Cliente somente com projeção aprovada e sanitizada",
];

/* ------------------------------------------------------------------ */
/* 8 — Matriz de renderização e aceite                                  */
/* ------------------------------------------------------------------ */

export type TipoBlocoRenderizacao = "fixo" | "parametrizado" | "fixo_parametro" | "condicional" | "derivado";

export type LinhaRenderizacao = {
  bloco: string;
  fonteExigida: string;
  tipo: TipoBlocoRenderizacao;
  apareceNaPrevia: true;
  /** "sempre" ou "quando_aplicavel" (blocos condicionais de anexo). */
  renderiza: "sempre" | "quando_aplicavel";
  gate: string;
  clausulas: number[];
  /** Código do anexo governado que alimenta o bloco, quando houver. */
  anexo?: string;
};

export const ROTULO_TIPO_RENDER: Record<TipoBlocoRenderizacao, string> = {
  fixo: "Fixo / versionado",
  parametrizado: "Parametrizado",
  fixo_parametro: "Fixo + parâmetro",
  condicional: "Condicional",
  derivado: "Derivado",
};

export const MATRIZ_RENDERIZACAO: LinhaRenderizacao[] = [
  { bloco: "Perfil da contratada", fonteExigida: "Perfil institucional", tipo: "fixo", apareceNaPrevia: true, renderiza: "sempre", gate: "Bloqueia se ausente ou inativo", clausulas: [1] },
  { bloco: "Partes e signatários", fonteExigida: "Parâmetros validados", tipo: "parametrizado", apareceNaPrevia: true, renderiza: "sempre", gate: "Bloqueia se incompleto", clausulas: [1] },
  { bloco: "Objeto", fonteExigida: "Contrato-base + Anexo I", tipo: "fixo_parametro", apareceNaPrevia: true, renderiza: "sempre", gate: "Bloqueia sem escopo", clausulas: [2], anexo: "ANEXO_I_ORDEM_SERVICO" },
  { bloco: "Inclusões e exclusões", fonteExigida: "Anexo I", tipo: "parametrizado", apareceNaPrevia: true, renderiza: "sempre", gate: "Bloqueia se não derivado", clausulas: [3], anexo: "ANEXO_I_ORDEM_SERVICO" },
  { bloco: "Obrigações", fonteExigida: "Contrato-base", tipo: "fixo", apareceNaPrevia: true, renderiza: "sempre", gate: "Não editável por caso", clausulas: [4, 5] },
  { bloco: "Limitações e não garantias", fonteExigida: "Contrato-base", tipo: "fixo", apareceNaPrevia: true, renderiza: "sempre", gate: "Não editável por caso", clausulas: [6] },
  { bloco: "Privacidade e LGPD", fonteExigida: "Contrato-base + ANX-PRIVACIDADE", tipo: "condicional", apareceNaPrevia: true, renderiza: "sempre", gate: "Conforme política e consentimento", clausulas: [7] },
  { bloco: "Comercial", fonteExigida: "Anexo I + Anexo II", tipo: "parametrizado", apareceNaPrevia: true, renderiza: "sempre", gate: "Bloqueia sem condição formal", clausulas: [8], anexo: "ANEXO_II_DESPESAS_EXTERNAS" },
  { bloco: "Terceiros", fonteExigida: "Regra institucional + Anexo II", tipo: "condicional", apareceNaPrevia: true, renderiza: "sempre", gate: "Exceção exige aprovação registrada", clausulas: [9], anexo: "ANEXO_II_DESPESAS_EXTERNAS" },
  { bloco: "Prazo", fonteExigida: "OS / escopo formal", tipo: "parametrizado", apareceNaPrevia: true, renderiza: "sempre", gate: "Não pode ser inferido", clausulas: [10] },
  { bloco: "Entregas e encerramento", fonteExigida: "Contrato-base + Anexo I", tipo: "fixo_parametro", apareceNaPrevia: true, renderiza: "sempre", gate: "Bloqueia sem escopo", clausulas: [11, 12], anexo: "ANEXO_I_ORDEM_SERVICO" },
  { bloco: "Pesquisa externa", fonteExigida: "Anexo III", tipo: "condicional", apareceNaPrevia: true, renderiza: "quando_aplicavel", gate: "Bloqueia ação externa sem autorização", clausulas: [2], anexo: "ANEXO_III_AUTORIZACAO_PESQUISA" },
  { bloco: "Procuração", fonteExigida: "Anexo IV", tipo: "condicional", apareceNaPrevia: true, renderiza: "quando_aplicavel", gate: "Bloqueia se instrumento exigido e não aprovado", clausulas: [2], anexo: "ANEXO_IV_PROCURACAO" },
  { bloco: "Alteração de escopo", fonteExigida: "Anexo V", tipo: "condicional", apareceNaPrevia: true, renderiza: "quando_aplicavel", gate: "Bloqueia mudança sem aceite", clausulas: [3], anexo: "ANEXO_V_ALTERACAO_ESCOPO" },
  { bloco: "Assinatura", fonteExigida: "Configuração institucional + revisão", tipo: "condicional", apareceNaPrevia: true, renderiza: "sempre", gate: "Bloqueia se método ou revisão ausentes", clausulas: [13] },
  { bloco: "Foro e disposições", fonteExigida: "Configuração jurídica", tipo: "fixo", apareceNaPrevia: true, renderiza: "sempre", gate: "Bloqueia se ausente", clausulas: [14] },
];

/* ------------------------------------------------------------------ */
/* 10 — Itens a validar juridicamente                                   */
/* ------------------------------------------------------------------ */

export const ITENS_REVISAO_JURIDICA = [
  "Adequação do texto às modalidades de estudo, pesquisa familiar, cidadania e execução documental.",
  "Política institucional de retenção, guarda e descarte de dados.",
  "Redação de cancelamento, arrependimento, serviços executados e despesas aprovadas.",
  "Foro e regras consumeristas aplicáveis.",
  "Requisitos de assinatura eletrônica e evidência externa.",
  "Representação de menor/incapaz e anexos correspondentes.",
  "Regras de preço, exceções, despesas de terceiros e cobrança.",
  "Escopo de orientação informativa versus atuação jurídica especializada.",
];

/** O contrato-base só é assinável quando estiver vigente após revisão jurídica. */
export function contratoBaseAssinavel(status: EstadoVigenciaContratoBase = CONTRATO_BASE_STATUS) {
  return status === "vigente";
}

/* ------------------------------------------------------------------ */
/* 8 — Adendos textuais em revisão jurídica (não reescrevem as 14)      */
/* ------------------------------------------------------------------ */

export type AdendoTextual = {
  id: string;
  titulo: string;
  status: EstadoVigenciaContratoBase;
  itens: string[];
};

/** Referência neutra ao WhatsApp institucional: nunca número pessoal. */
export const REFERENCIA_WHATSAPP_INSTITUCIONAL =
  "WhatsApp institucional homologado, conforme configuração vigente do Clube Ancestral.";

export function valorInstitucional(campo: string): string {
  return PERFIL_INSTITUCIONAL.find((c) => c.campo === campo)?.valor ?? "";
}

/**
 * Qualificação completa da contratada, composta a partir de TODO o perfil
 * institucional já homologado — não só razão social, CNPJ e endereço, mas
 * também os canais oficiais (e-mail, site, WhatsApp institucional) já
 * cadastrados em PERFIL_INSTITUCIONAL. Título/subtítulo do contrato ficam
 * de fora por não serem dado de qualificação da parte. Nunca digitada campo
 * a campo por caso: o parâmetro `contratada_qualificacao`
 * (parametros-dicionario.ts) usa este texto como valor de origem
 * `documento`, em vez de exigir preenchimento humano de um dado que já
 * existe e é o mesmo para todo caso.
 */
export function qualificacaoCompletaContratada(): string {
  const razao = valorInstitucional("razao_empresarial");
  const operacao = valorInstitucional("nome_operacao");
  const cnpj = valorInstitucional("cnpj");
  const endereco = valorInstitucional("endereco_institucional");
  const email = valorInstitucional("email_oficial");
  const site = valorInstitucional("site");
  const whatsapp = valorInstitucional("whatsapp");
  return (
    `${razao}, operando sob o nome de "${operacao}", CNPJ ${cnpj}, com sede em ${endereco}. ` +
    `Canais oficiais: e-mail ${email}, site ${site}, WhatsApp — ${whatsapp}`
  );
}

/**
 * Acréscimos textuais ao contrato-base. Ficam em `under_legal_review`:
 * não habilitam assinatura e não declaram regra jurídica ainda não aprovada.
 */
export const ADENDOS_TEXTUAIS: AdendoTextual[] = [
  {
    id: "ADENDO-CANCELAMENTO-v1.0",
    titulo: "Cancelamento e arrependimento",
    status: "under_legal_review",
    itens: [
      "Texto em revisão jurídica: nenhuma regra de cancelamento ou arrependimento está aprovada ou é oponível nesta versão.",
      "Pedido de cancelamento é registrado como evento formal no caso, com data, autor e motivo, sem execução automática.",
      "Serviços já executados, entregas já publicadas e despesas de terceiros já aprovadas seguem o tratamento definido nas cláusulas vigentes e na Ordem de Serviço aprovada.",
      "Nenhum efeito financeiro, estorno, cobrança ou encerramento é aplicado por este adendo enquanto o status permanecer em revisão jurídica.",
    ],
  },
  {
    id: "ADENDO-CANAIS-OFICIAIS-v1.0",
    titulo: "Canais oficiais de comunicação",
    status: "under_legal_review",
    itens: [
      `E-mail oficial: ${valorInstitucional("email_oficial")}.`,
      `Site oficial: ${valorInstitucional("site")}.`,
      REFERENCIA_WHATSAPP_INSTITUCIONAL,
      "Comunicações contratuais válidas ocorrem apenas pelos canais oficiais institucionais; nenhum telefone ou contato pessoal é canal contratual.",
    ],
  },
];
