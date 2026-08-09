/**
 * Ancestral Canvas — Modelo de Entrega Consultiva (template parametrizável).
 *
 * ADITIVO: não substitui `entrega-consultiva.ts`. Este módulo guarda o conteúdo
 * editorial da Fase 01 ("Relatório Visual" da entrega consultiva) em campos
 * parametrizáveis, para que o mesmo modelo sirva a Itália, Portugal, Espanha,
 * Alemanha, Áustria e demais cidadanias do portfólio.
 *
 * REGRA DE VERDADE OPERACIONAL:
 * nenhum dado aqui afirma cidadania reconhecida, elegibilidade confirmada,
 * documento localizado ou via definida. Todo item traz status de confiança e
 * fonte. Preço, SKU e link de pagamento só aparecem quando a equipe definir no
 * Desk (campos vazios = ainda não definido).
 *
 * COMO DUPLICAR PARA OUTRO CLIENTE: use `duplicarModelo()` no fim do arquivo.
 */

export type StatusDocumento =
  | "Dado de pesquisa inicial"
  | "Pendente de documento"
  | "Em análise"
  | "Confirmado por fonte"
  | "Não aplicável";

export const STATUS_DOC_TOM: Record<StatusDocumento, string> = {
  "Dado de pesquisa inicial": "border-plum/40 bg-plum/10 text-plum",
  "Pendente de documento": "border-terracotta/40 bg-terracotta/10 text-terracotta",
  "Em análise": "border-gold/50 bg-gold/10 text-navy",
  "Confirmado por fonte": "border-sage/40 bg-sage/10 text-sage",
  "Não aplicável": "border-navy/20 bg-navy/5 text-navy/60",
};

export type ValidacaoRelatorio = "Em preparação" | "Diagnóstico inicial disponível" | "Revisado" | "Liberado para o cliente";

export type ItemChecklist = {
  item: string;
  status: StatusDocumento;
  responsavel: string;
  fonte: string;
  atualizadoEm: string;
  observacao: string;
  proximaAcao: string;
};

export type GrupoChecklist = { grupo: string; itens: ItemChecklist[] };

export type NoLinha = {
  nome: string;
  papel: string;
  detalhe: string;
  /** true quando a informação já tem documento validado. */
  confirmado: boolean;
};

export type RaizIdentificada = { nome: string; local: string; nascimento: string };

/** Origem do relatório — preenchida pela equipe quando houver arquivo/fonte. */
export type FonteRelatorio = {
  arquivo: string;
  data: string;
  versao: string;
  responsavel: string;
  observacoes: string;
  validacao: ValidacaoRelatorio;
};

export type ModeloEntrega = {
  caseId: string;
  clientName: string;
  clientFirstName: string;
  birthDate: string;
  /* --- campos parametrizáveis --- */
  country: string;
  citizenshipPath: string;
  transmissionSummary: string;
  eligibilitySummary: string;
  eligibilityBadge: string;
  documentsChecklist: GrupoChecklist[];
  criticalGaps: string[];
  recommendedNextStep: { titulo: string; texto: string; ctaPrimaria: string; ctaSecundaria: string };
  /** Vazio = a equipe ainda não definiu produto/preço no Desk. */
  recommendedSku: string;
  paymentUrl: string;
  reportSource: FonteRelatorio;
  reportValidationStatus: ValidacaoRelatorio;
  /* --- conteúdo da Fase 01 --- */
  capa: { titulo: string; subtitulo: string };
  achadoPrincipal: string;
  linhaFamiliar: NoLinha[];
  linhaSelo: string;
  raizes: RaizIdentificada[];
  raizDisclaimer: string;
  pontosFortes: string[];
  observacoes: string[];
};

const hoje = "09/08/2026";

const item = (
  it: string,
  status: StatusDocumento,
  fonte: string,
  observacao: string,
  proximaAcao: string,
  responsavel = "Equipe Clube Ancestral",
): ItemChecklist => ({ item: it, status, responsavel, fonte, atualizadoEm: hoje, observacao, proximaAcao });

/** Caso CA-ITA-SOPHI-PICCOLI — Fase 01 com dados reais informados pela família. */
export const MODELO_SOPHIA: ModeloEntrega = {
  caseId: "CA-ITA-SOPHI-PICCOLI",
  clientName: "Sophia Piccoli Santiago",
  clientFirstName: "Sophia",
  birthDate: "18/05/2006",
  country: "Itália",
  citizenshipPath: "Cidadania italiana por descendência — potencial em análise",
  transmissionSummary:
    "Linha organizada a partir de Ângelo Piccoli, trisavô da requerente, nascido em Noventa Vicentina (Vicenza). A continuidade entre as gerações brasileiras ainda precisa ser comprovada documento a documento.",
  eligibilitySummary:
    "A linha familiar já apresenta uma base relevante para pesquisa: foi identificado um ascendente italiano, sua localidade de origem e os nomes de seus pais. Como Ângelo Piccoli é trisavô da requerente, o caminho administrativo direto está sujeito às restrições aplicáveis ao caso e precisa de análise cuidadosa. A eventual possibilidade de via judicial depende da confirmação documental completa da cadeia familiar e da avaliação técnica do cenário.",
  eligibilityBadge: "Potencial de cidadania italiana em análise",
  documentsChecklist: [
    {
      grupo: "Fontes e dados iniciais",
      itens: [
        item(
          "Relato familiar da linha Piccoli (nomes, datas e localidades)",
          "Dado de pesquisa inicial",
          "Briefing da família",
          "Base do diagnóstico da Fase 01 — sem documento anexado.",
          "Registrar anexo/áudio/planilha de origem no Desk",
        ),
        item(
          "Identificação da requerente (Sophia Piccoli Santiago, 18/05/2006)",
          "Pendente de documento",
          "Cliente",
          "Documento de identidade ainda não enviado.",
          "Solicitar RG/CPF e certidão de nascimento",
        ),
      ],
    },
    {
      grupo: "Documentos italianos a localizar",
      itens: [
        item(
          "Certidão de nascimento de Ângelo Piccoli (30/08/1872 — Noventa Vicentina, Vicenza)",
          "Pendente de documento",
          "Comune de Noventa Vicentina / arquivo diocesano",
          "Data e localidade vêm do relato familiar.",
          "Solicitar estratto/atto di nascita ao comune",
        ),
        item(
          "Registros de Giovanni Piccoli (c. 1868 — Istrana, Treviso)",
          "Hipótese de pesquisa" as StatusDocumento extends never ? never : StatusDocumento,
          "Comune de Istrana",
          "Ano aproximado — busca por faixa de anos.",
          "Pesquisar registros civis e paroquiais de Istrana",
        ),
        item(
          "Registros de Benedetta Bresolin (c. 1866 — Padernello, Paese, Treviso)",
          "Dado de pesquisa inicial",
          "Comune de Paese (frazione Padernello)",
          "Ano aproximado — busca por faixa de anos.",
          "Pesquisar registros civis e paroquiais de Paese",
        ),
        item(
          "Casamento de Giovanni Piccoli e Benedetta Bresolin",
          "Dado de pesquisa inicial",
          "Arquivos do Veneto",
          "Ajuda a amarrar a origem de Ângelo.",
          "Incluir no escopo da pesquisa documental na Itália",
        ),
      ],
    },
    {
      grupo: "Certidões brasileiras a confirmar",
      itens: [
        item("Certidão de nascimento de João Picoli (filho de Ângelo, nascido no Brasil)", "Pendente de documento", "Cartórios BR", "Elo entre a geração italiana e a brasileira.", "Localizar cartório e pedir inteiro teor"),
        item("Certidão de nascimento de Orlando Picoli", "Pendente de documento", "Cartórios BR", "Necessária para a cadeia.", "Solicitar inteiro teor"),
        item("Certidão de nascimento de Juliana Picoli", "Pendente de documento", "Cartórios BR", "Necessária para a cadeia.", "Solicitar inteiro teor"),
        item("Certidão de nascimento de Sophia Piccoli Santiago", "Pendente de documento", "Cartório BR", "Documento da requerente.", "Solicitar inteiro teor"),
      ],
    },
    {
      grupo: "Eventos civis e divergências de nome",
      itens: [
        item(
          "Casamento de Orlando Picoli e Sandra da Silva Lopes (Sandra Silva Picoli) — atualmente separados",
          "Em análise",
          "Relato familiar",
          "Alteração de nome após casamento pode gerar divergência nos registros.",
          "Confirmar averbações na certidão de casamento",
        ),
        item(
          "Divergência de grafia Piccoli / Picoli ao longo das gerações",
          "Em análise",
          "Relato familiar",
          "Grafia italiana com duas consoantes e grafia brasileira simplificada.",
          "Mapear grafias em cada certidão e avaliar retificação",
        ),
        item("Óbitos e demais eventos civis da cadeia", "Pendente de documento", "Cartórios BR", "Podem impactar a comprovação da transmissão.", "Levantar durante a pesquisa documental"),
      ],
    },
    {
      grupo: "Análise de naturalização e transmissão",
      itens: [
        item("Naturalização brasileira de Ângelo Piccoli (se aplicável)", "Pendente de documento", "Arquivo Nacional", "Determinante para a continuidade da transmissão.", "Consultar Arquivo Nacional e registros de imigração"),
        item("Documentos de imigração/desembarque de Ângelo Piccoli", "Dado de pesquisa inicial", "Arquivos de imigração", "Ajudam a confirmar identidade e origem.", "Buscar lista de bordo e registro de entrada"),
        item("Enquadramento jurídico da cadeia (administrativa ou judicial)", "Em análise", "Análise técnica interna", "Depende da confirmação documental completa.", "Avaliar após a pesquisa documental aprofundada"),
      ],
    },
  ],
  criticalGaps: [
    "Certidão de nascimento italiana de Ângelo Piccoli.",
    "Registros italianos de Giovanni Piccoli e Benedetta Bresolin.",
    "Certidões brasileiras de nascimento, casamento e óbito da cadeia de descendência.",
    "Continuidade dos vínculos entre cada geração.",
    "Possíveis diferenças de grafia: Piccoli / Picoli.",
    "Naturalização brasileira do ascendente italiano, se aplicável.",
    "Casamentos, óbitos, alterações de nome e demais eventos que impactem a transmissão.",
    "Critérios jurídicos aplicáveis à eventual estratégia administrativa ou judicial.",
  ],
  recommendedNextStep: {
    titulo: "Pesquisa documental completa na Itália",
    texto:
      "Para confirmar a cadeia de descendência, localizar certidões na Itália e transformar esta leitura inicial em um caminho de cidadania claro, a próxima etapa recomendada é a pesquisa documental aprofundada.",
    ctaPrimaria: "Quero receber a proposta de pesquisa",
    ctaSecundaria: "Falar com o Clube Ancestral pelo WhatsApp",
  },
  recommendedSku: "",
  paymentUrl: "",
  reportSource: {
    arquivo: "—",
    data: hoje,
    versao: "v0.1",
    responsavel: "Tatiana",
    observacoes: "Dados provenientes do relato familiar. Anexos e fontes documentais ainda não vinculados.",
    validacao: "Diagnóstico inicial disponível",
  },
  reportValidationStatus: "Diagnóstico inicial disponível",
  capa: {
    titulo: "Diagnóstico de Ancestralidade e Potencial de Cidadania Italiana",
    subtitulo:
      "Uma leitura inicial da linha Piccoli, das evidências já identificadas e dos próximos passos de pesquisa.",
  },
  achadoPrincipal:
    "Foi possível organizar a linha familiar até Ângelo Piccoli, trisavô da requerente, nascido em 30 de agosto de 1872 em Noventa Vicentina, na província de Vicenza, Itália. Também foram identificados os nomes e localidades de origem de seus pais na região do Veneto.",
  linhaFamiliar: [
    { nome: "Giovanni Piccoli + Benedetta Bresolin", papel: "Pais do ascendente italiano", detalhe: "Istrana (TV) · Padernello, Paese (TV) — nascimentos aproximados em 1868 e 1866", confirmado: false },
    { nome: "Ângelo Piccoli", papel: "Trisavô (4ª geração) — ascendente italiano", detalhe: "n. 30/08/1872 · Noventa Vicentina, Vicenza (IT)", confirmado: false },
    { nome: "João Picoli", papel: "Bisavô — filho de Ângelo", detalhe: "Nascido no Brasil — data e local a confirmar", confirmado: false },
    { nome: "Orlando Picoli", papel: "Avô — filho de João", detalhe: "Casado com Sandra da Silva Lopes (Sandra Silva Picoli) — atualmente separados", confirmado: false },
    { nome: "Juliana Picoli", papel: "Mãe — filha de Orlando e Sandra", detalhe: "Dados civis a confirmar", confirmado: false },
    { nome: "Sophia Piccoli Santiago", papel: "Requerente", detalhe: "n. 18/05/2006", confirmado: false },
  ],
  linhaSelo: "Linha inicial organizada — validação documental pendente",
  raizes: [
    { nome: "Ângelo Piccoli", local: "Noventa Vicentina, Vicenza", nascimento: "nascimento informado em 30/08/1872" },
    { nome: "Giovanni Piccoli", local: "Istrana, Treviso", nascimento: "nascimento aproximado em 1868" },
    { nome: "Benedetta Bresolin", local: "Padernello, Paese, Treviso", nascimento: "nascimento aproximado em 1866" },
  ],
  raizDisclaimer: "Dado de pesquisa inicial — requer confirmação por fonte documental.",
  pontosFortes: [
    "Ascendente italiano identificado com data e cidade de nascimento.",
    "Nomes dos pais do ascendente identificados.",
    "Cadeia geracional inicial organizada até a requerente.",
    "Região de origem familiar localizada no Veneto.",
  ],
  observacoes: [
    "Irmã: Isadora Picoli Santiago — interesse futuro, fora do escopo atual do caso.",
  ],
};

/** Registro dos casos que usam o modelo de entrega consultiva. */
export const MODELOS_ENTREGA: Record<string, ModeloEntrega> = {
  [MODELO_SOPHIA.caseId]: MODELO_SOPHIA,
};

export const modeloByCaso = (casoId: string): ModeloEntrega | undefined => MODELOS_ENTREGA[casoId];

/**
 * Duplica o modelo para um novo cliente/país.
 *
 * ```ts
 * export const MODELO_NOVO = duplicarModelo({
 *   caseId: "CA-PRT-NOME",
 *   clientName: "Nome do Cliente",
 *   clientFirstName: "Nome",
 *   country: "Portugal",
 *   citizenshipPath: "Cidadania portuguesa por descendência — potencial em análise",
 *   linhaFamiliar: [...],
 *   documentsChecklist: [...],
 * });
 * ```
 */
export function duplicarModelo(overrides: Partial<ModeloEntrega> & { caseId: string; clientName: string }): ModeloEntrega {
  return {
    ...MODELO_SOPHIA,
    clientFirstName: overrides.clientName.split(" ")[0],
    birthDate: "—",
    achadoPrincipal: "Aguardando consolidação da pesquisa.",
    linhaFamiliar: [],
    raizes: [],
    pontosFortes: [],
    criticalGaps: [],
    documentsChecklist: [],
    observacoes: [],
    recommendedSku: "",
    paymentUrl: "",
    reportValidationStatus: "Em preparação",
    reportSource: { arquivo: "—", data: "—", versao: "v0.1", responsavel: "A definir", observacoes: "A ser preenchido a partir das fontes do caso.", validacao: "Em preparação" },
    ...overrides,
  };
}
