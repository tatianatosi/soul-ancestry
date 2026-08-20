import type { CaseData } from "@/types/case";

/**
 * Caso CA-ITA-SOPHI-PICCOLI — Sophia Piccoli Santiago.
 *
 * Espelha, no formato `CaseData` (usado pela Home, Árvore, Documentos e Conta),
 * exatamente o conteúdo editorial da Fase 01 registrado em
 * `src/data/caso-sophia.ts` (MODELO_SOPHIA). Nenhum dado afirma cidadania
 * reconhecida, elegibilidade confirmada, documento localizado ou via definida.
 * Produto, preço e link de pagamento seguem vazios por decisão da equipe.
 */
export const caseDataSophia: CaseData = {
  geral: {
    case_id: "CA-ITA-SOPHI-PICCOLI",
    case_nome: "Linha Piccoli — Veneto (IT)",
    cliente_nome: "Sophia Piccoli Santiago",
    cliente_nome_exibicao: "Sophia",
    ano_nascimento_cliente: 2006,
    cidade_cliente: "",
    estado_cliente: "",
    status_caso: "em_leitura",
    produto_atual: "Diagnóstico inicial — Fase 01",
    data_abertura: "07/08/2026",
    ultima_atualizacao: "09/08/2026",
  },
  cliente: {
    nome_completo: "Sophia Piccoli Santiago",
    ano_nascimento: 2006,
    municipio_nascimento: "",
    estado_nascimento: "",
    estado_civil: "",
    possui_filhos: null,
    endereco_resumido: "",
    email: "",
    telefone: "",
  },
  familia_direta: {
    pai: {
      nome: "",
      status_evidencia: "pendente_validacao",
    },
    mae: {
      nome: "Juliana Picoli",
      observacoes: "Filha de Orlando Picoli e Sandra da Silva Lopes — registros civis a confirmar.",
      status_evidencia: "relato_familiar",
    },
    avo_paterno: { nome: "", status_evidencia: "pendente_validacao" },
    avo_paterna: { nome: "", status_evidencia: "pendente_validacao" },
    bisavo_paterno: { nome: "", status_evidencia: "pendente_validacao" },
    bisavo_paterna: { nome: "", status_evidencia: "pendente_validacao" },
    avo_materno: {
      nome: "Orlando Picoli",
      observacoes:
        "Casado com Sandra da Silva Lopes (Sandra Silva Picoli), atualmente separados — averbações a confirmar.",
      variantes_nome: ["Orlando Piccoli"],
      status_evidencia: "relato_familiar",
    },
    avo_materna: {
      nome: "Sandra da Silva Lopes",
      observacoes: "Também registrada como Sandra Silva Picoli após o casamento.",
      status_evidencia: "relato_familiar",
    },
  },
  arvore: {
    linha_prioritaria: "Linha materna Piccoli — Veneto (Itália)",
    pessoas_conectadas: 7,
    geracoes_lidas: 6,
    conexao_chave:
      "Ângelo Piccoli, trisavô da requerente, nascido em 30/08/1872 em Noventa Vicentina (Vicenza).",
    conexao_territorial: "Noventa Vicentina (VI), Istrana (TV) e Padernello, Paese (TV) — Veneto.",
    lacuna_critica:
      "Certidão de nascimento italiana de Ângelo Piccoli e certidões brasileiras da cadeia até a requerente.",
    pessoas_colaterais: ["Isadora Picoli Santiago — irmã (interesse futuro, fora do escopo atual)"],
  },
  rota: {
    pais_principal: "Itália",
    aderencia_principal: null,
    pais_secundario: "",
    aderencia_secundaria: null,
    pais_terciario: "",
    aderencia_terciaria: null,
    hipotese_principal:
      "Cidadania italiana por descendência a partir de Ângelo Piccoli — potencial em análise.",
    status_hipotese: "pendente_validacao",
    via_provavel: "judicial",
    resumo_radar:
      "Linha organizada até o ascendente italiano; pela distância geracional, a hipótese mais provável é a via judicial, a ser confirmada após a análise documental completa.",
  },
  jornada: {
    etapa_atual: "Fase 01 — diagnóstico inicial disponível",
    contexto_resumo:
      "A leitura inicial organizou a linha Piccoli até Ângelo Piccoli, nascido em Noventa Vicentina (Vicenza), e identificou os nomes e localidades de origem de seus pais no Veneto. Como Ângelo é trisavô da requerente, o caminho técnico mais provável é a via judicial — hipótese sujeita à confirmação documental completa.",
    trilha_origem: "Veneto — Noventa Vicentina, Istrana e Paese",
    trilha_cidadania: "Itália — potencial em análise",
    trilha_memoria: "Grafias Piccoli e Picoli ao longo das gerações brasileiras",
    jornada_ancestral_1: "1872 — nascimento de Ângelo Piccoli em Noventa Vicentina (VI)",
    jornada_cliente_1: "2006 — nascimento de Sophia Piccoli Santiago",
    jornada_intersecao_1: "A família mantém a memória da origem vêneta e a grafia do sobrenome",
    jornada_intersecao_2:
      "A assessoria completa por via judicial é o próximo elo entre as duas pontas, começando pela organização documental",
  },
  descobertas: [
    {
      titulo: "Ascendente italiano identificado",
      texto:
        "Ângelo Piccoli, trisavô da requerente, com nascimento informado em 30/08/1872 em Noventa Vicentina, província de Vicenza.",
      pessoa_relacionada: "Ângelo Piccoli",
      tipo_evidencia: "relato_familiar",
      destaque: true,
      origem: "app_projection",
      autorizado: true,
      publicado: true,
      data: "09/08/2026",
    },
    {
      titulo: "Pais do ascendente localizados no Veneto",
      texto:
        "Giovanni Piccoli (c. 1868, Istrana — Treviso) e Benedetta Bresolin (c. 1866, Padernello, Paese — Treviso).",
      pessoa_relacionada: "Giovanni Piccoli e Benedetta Bresolin",
      tipo_evidencia: "relato_familiar",
      destaque: false,
      origem: "app_projection",
      autorizado: true,
      publicado: true,
      data: "09/08/2026",
    },
    {
      titulo: "Divergência de grafia mapeada",
      texto:
        "A grafia italiana Piccoli aparece simplificada como Picoli nas gerações brasileiras — ponto a tratar nas certidões.",
      pessoa_relacionada: "Linha Piccoli / Picoli",
      tipo_evidencia: "pendente_validacao",
      destaque: false,
      origem: "app_projection",
      autorizado: true,
      publicado: true,
      data: "09/08/2026",
    },
  ],
  documentos: {
    documento_principal: "Certidão de nascimento de Ângelo Piccoli (Noventa Vicentina, VI)",
    pendencia_principal: "Certidões brasileiras de nascimento e casamento da cadeia até a requerente",
    status_documental: "Nenhum documento anexado — diagnóstico baseado no relato familiar",
    documentos_localizados: [],
    documentos_pendentes: [
      "Certidão de nascimento de Ângelo Piccoli (30/08/1872 — Noventa Vicentina, Vicenza)",
      "Registros de Giovanni Piccoli (c. 1868 — Istrana, Treviso)",
      "Registros de Benedetta Bresolin (c. 1866 — Padernello, Paese, Treviso)",
      "Certidão de nascimento de João Picoli",
      "Certidão de nascimento de Orlando Picoli",
      "Certidão de nascimento de Juliana Picoli",
      "Certidão de nascimento de Sophia Piccoli Santiago",
      "Naturalização brasileira de Ângelo Piccoli, se aplicável",
    ],
    proximas_solicitacoes: [
      "Documento de identidade da requerente (RG/CPF)",
      "Inteiro teor das certidões brasileiras já existentes na família",
      "Autorização para pesquisa documental nos comuni do Veneto",
    ],
    documentos_em_validacao: [],
  },
  fontes: {
    base_1_url: "",
    base_2_url: "",
    base_3_url: "",
    links_extras: [],
    pasta_documentos_url: "",
    pasta_imagens_url: "",
  },
  alerta: {
    titulo: "Diagnóstico inicial disponível",
    texto:
      "Esta é uma leitura inicial da sua linha familiar. Ainda não há documento localizado nem elegibilidade confirmada — o próximo passo é iniciar a assessoria completa de cidadania italiana por via judicial, começando pela organização documental.",
    nivel: "informativo",
    ativo: true,
  },
  conta: {
    produto_atual: "Diagnóstico inicial — Fase 01",
    status_jornada: "Fase 01 entregue — proposta de pesquisa em preparação",
    ultima_atualizacao: "09/08/2026",
    historico: [
      "07/08/2026 — Caso aberto a partir do relato familiar",
      "09/08/2026 — Diagnóstico inicial da linha Piccoli disponível",
    ],
    texto_upgrade:
      "O próximo passo recomendado é a assessoria completa de cidadania italiana por via judicial: organização documental, coordenação de retificações, traduções e apostilamentos, intermediação com advogado parceiro na Itália e acompanhamento do processo até a sentença. A equipe está preparando a proposta com escopo e prazo.",
  },
  governanca: {
    responsavel_caso: "Tatiana",
    observacoes_internas:
      "Conteúdo da Fase 01 em src/data/caso-sophia.ts (MODELO_SOPHIA). Produto, SKU e valor ainda não definidos.",
    dados_sensiveis_ocultos: true,
    regra_input_output: "Somente dados informados pela família; nenhuma inferência apresentada como fato.",
  },
};
