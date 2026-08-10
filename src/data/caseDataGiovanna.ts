import type { CaseData } from "@/types/case";

/** Primeiro preenchimento real do modelo — caso piloto. */
export const caseDataGiovanna: CaseData = {
  geral: {
    case_id: "CA-CID-IT-2026-001",
    case_nome: "Caso Giovanna Prade — linha paterna Prade",
    cliente_nome: "Giovanna da Veiga Prade",
    cliente_nome_exibicao: "Giovanna",
    ano_nascimento_cliente: 1985,
    cidade_cliente: "São Paulo",
    estado_cliente: "SP",
    status_caso: "em_leitura",
    produto_atual: "CA-CID-023 — Assessoria Completa de Cidadania Italiana",
    data_abertura: "2026-08-10",
    ultima_atualizacao: "Linha Prade conectada até os bisavós paternos",
  },
  cliente: {
    nome_completo: "Giovanna da Veiga Prade",
    ano_nascimento: 1985,
    municipio_nascimento: "",
    estado_nascimento: "",
    estado_civil: "",
    possui_filhos: null,
    endereco_resumido: "São Paulo, SP",
    email: "",
    telefone: "",
  },
  familia_direta: {
    pai: {
      nome: "Péricles Luiz Medeiros Prade",
      nascimento: "",
      falecimento: "",
      observacoes: "",
      status_evidencia: "relato_familiar",
    },
    mae: {
      nome: "Arminda Souza da Veiga e Medeiros Prade",
      nascimento: "",
      falecimento: "",
      observacoes: "",
      status_evidencia: "relato_familiar",
    },
    avo_paterno: {
      nome: "Erwin Prade",
      nascimento: "16 de agosto de 1917",
      batismo:
        "19 de agosto de 1917 — Paróquia de São Francisco de Assis, Rodeio, Santa Catarina, Brasil",
      falecimento: "11 de abril de 1969",
      sepultamento: "Cemitério Luterano Centro, Timbó, Santa Catarina, Brasil",
      local_relevante: "Rodeio, Santa Catarina, Brasil",
      ocupacao: "indador — transcrição a confirmar",
      variantes_nome: ["Ervino Prade", "Erwin Prada"],
      familysearch_id: "LBK7-D99",
      familysearch_url: "https://www.familysearch.org/pt/tree/pedigree/landscape/LBK7-D99",
      status_evidencia: "referencia_localizada",
    },
    avo_paterna: {
      nome: "Áurea Medeiros",
      nascimento: "",
      falecimento: "",
      variantes_nome: [],
      familysearch_id: "GZ1D-YYB",
      familysearch_url: "https://www.familysearch.org/pt/tree/person/GZ1D-YYB",
      status_evidencia: "referencia_localizada",
    },
    bisavo_paterno: {
      nome: "Alessandro Prade",
      nascimento: "1874",
      falecimento: "1926",
      origem_hipotese: "Origem italiana a confirmar por documentação oficial",
      variantes_nome: [],
      familysearch_id: "LBK7-47N",
      familysearch_url: "https://www.familysearch.org/pt/tree/person/LBK7-47N",
      status_evidencia: "referencia_localizada",
    },
    bisavo_paterna: {
      nome: "Margherita Maiocchi",
      nascimento: "1877",
      falecimento: "1962",
      variantes_nome: ["Margarida"],
      familysearch_id: "LBK7-CT5",
      familysearch_url: "https://www.familysearch.org/pt/tree/person/LBK7-CT5",
      status_evidencia: "referencia_localizada",
    },
    avo_materno: {
      nome: "Martinho Cardoso da Veiga",
      nascimento: "",
      falecimento: "",
      observacoes: "",
      status_evidencia: "relato_familiar",
    },
    avo_materna: {
      nome: "Jacyna de Souza Veiga",
      nascimento: "",
      falecimento: "",
      observacoes: "",
      status_evidencia: "relato_familiar",
    },
    pai_de_alessandro: {
      nome: "Paolo Prade",
      nascimento: "",
      falecimento: "",
      variantes_nome: [],
      familysearch_id: "",
      familysearch_url: "",
      status_evidencia: "relato_familiar",
      observacao:
        "Informação atual a validar por documento oficial ou fonte genealógica compatível.",
    },
  },
  arvore: {
    linha_prioritaria:
      "Paolo Prade → Alessandro Prade → Erwin Prade → Péricles Luiz Medeiros Prade → Giovanna da Veiga Prade",

    pessoas_conectadas: 26,
    geracoes_lidas: 4,
    conexao_chave:
      "A linha paterna foi conectada de Giovanna até Alessandro Prade por meio de Péricles e Erwin Prade.",
    conexao_territorial:
      "Rodeio e Timbó, em Santa Catarina, concentram referências para Erwin Prade; a origem italiana de Alessandro segue em validação.",
    lacuna_critica:
      "Faltam os documentos oficiais que comprovem a cadeia entre Alessandro, Erwin, Péricles e Giovanna, além da confirmação de eventual registro italiano.",
    pessoas_colaterais: [
      "Hermenegilda Prade",
      "Maria Prade",
      "Justina Prade",
      "Anna Prade",
      "Gelmira Prade",
      "Adolfo Prade",
      "Paulo Prade Neto",
      "Paulina Prade",
      "Tranquila Prade",
      "Alexandre Medeiros Prade",
      "Luana Medeiros Prade",
      "Camila da Veiga Prade",
      "Priscila Medeiros Prade",
      "Armando Medeiros Prade",
      "Glacir Medeiros Prade",
      "Umberto Medeiros Prade",
      "Maria Margarida Medeiros Prade",
    ],
  },
  rota: {
    pais_principal: "Itália",
    aderencia_principal: 88,
    pais_secundario: "",
    aderencia_secundaria: null,
    pais_terciario: "",
    aderencia_terciaria: null,
    hipotese_principal:
      "Há forte aderência à rota italiana pelo ramo paterno Prade, ainda dependente de validação documental.",
    status_hipotese: "pendente_validacao",
    resumo_radar:
      "A Itália lidera pela linha Prade e pelas referências familiares conectadas. A rota final depende da validação dos atos italianos e brasileiros.",
  },
  jornada: {
    etapa_atual: "linha Prade mapeada; validação documental em preparação",
    contexto_resumo:
      "Giovanna da Veiga Prade, nascida em 1985, é filha de Péricles Luiz Medeiros Prade e Arminda Souza da Veiga e Medeiros Prade. A linha paterna alcançou Alessandro Prade e Margherita Maiocchi. A próxima etapa é validar os documentos e investigar a situação registral na Itália.",
    trilha_origem:
      "A árvore paterna alcançou Alessandro Prade e Margherita Maiocchi. A pesquisa agora busca comprovar a origem e a rota migratória.",
    trilha_cidadania:
      "A prioridade é validar a cadeia Alessandro → Erwin → Péricles → Giovanna e verificar a existência de eventual registro na Comune ou no Consulado.",
    trilha_memoria:
      "O ramo Prade reúne uma história familiar ampla em Santa Catarina e abre caminho para reconstruir as raízes da família.",
    jornada_ancestral_1:
      "Erwin Prade, nascido em Rodeio em 1917, foi conectado a Alessandro Prade e Margherita Maiocchi.",
    jornada_cliente_1:
      "O caso começou com o desejo de compreender a própria história e avaliar a possibilidade de cidadania italiana.",
    jornada_intersecao_1:
      "A identificação de Erwin conecta a memória familiar à primeira trilha documental verificável da linha Prade.",
    jornada_intersecao_2:
      "A localização do ato italiano de Alessandro poderá definir o próximo passo documental da jornada.",
  },
  descobertas: [
    {
      titulo: "A linha Prade alcançou os bisavós paternos",
      texto:
        "Alessandro Prade e Margherita Maiocchi foram conectados à linha paterna de Giovanna por meio de Erwin Prade.",
      pessoa_relacionada: "Alessandro Prade e Margherita Maiocchi",
      tipo_evidencia: "referencia_localizada",
      destaque: true,
      data: "2026-08-10",
    },
    {
      titulo: "Registro de Erwin Prade localizado",
      texto:
        "Há referência de nascimento em 16 de agosto de 1917, em Rodeio, Santa Catarina, e batismo em 19 de agosto de 1917.",
      pessoa_relacionada: "Erwin Prade",
      tipo_evidencia: "referencia_localizada",
      destaque: true,
      data: "2026-08-10",
    },
  ],
  documentos: {
    documento_principal: "Diagnóstico Inicial — Linha Prade",
    pendencia_principal: "Ato de nascimento italiano de Alessandro Prade",
    status_documental: "3 referências-chave localizadas; certidões oficiais pendentes",
    documentos_localizados: [
      "Referência FamilySearch de Erwin Prade",
      "Referência FamilySearch de Alessandro Prade",
      "Referência FamilySearch de Margherita Maiocchi",
    ],
    documentos_pendentes: [
      "Certidão de nascimento de Giovanna",
      "Certidão de nascimento de Péricles Luiz Medeiros Prade",
      "Certidão de casamento de Péricles e Arminda, se existente",
      "Certidão de nascimento e casamento de Erwin Prade",
      "Ato italiano de nascimento de Alessandro Prade",
      "Ato de casamento de Alessandro Prade e Margherita Maiocchi",
      "Verificação de eventual registro de Giovanna na Comune ou Consulado",
    ],
    proximas_solicitacoes: [
      "Confirmar município de nascimento de Giovanna",
      "Solicitar certidão de nascimento de Giovanna",
      "Solicitar comprovante de residência atualizado",
      "Verificar documentos, passaportes ou registros antigos da família",
      "Confirmar a formalização do contrato antes de qualquer consulta externa",
    ],
    documentos_em_validacao: [],
  },
  fontes: {
    base_1_url: "https://www.familysearch.org/pt/tree/pedigree/landscape/LBK7-D99",
    base_2_url: "https://www.familysearch.org/pt/tree/person/LBK7-47N",
    base_3_url: "https://www.familysearch.org/pt/tree/person/LBK7-CT5",
    links_extras: ["https://www.familysearch.org/pt/tree/person/GZ1D-YYB"],
    pasta_documentos_url: "",
    pasta_imagens_url: "",
  },
  alerta: {
    titulo: "Um novo ramo da sua história foi conectado",
    texto:
      "Localizamos referências para seu avô Erwin Prade e conectamos seus pais, Alessandro Prade e Margherita Maiocchi. Agora vamos validar os documentos que ligam essa história à sua rota italiana.",
    nivel: "informativo",
    ativo: true,
  },
  conta: {
    produto_atual: "CA-CID-023 — Assessoria Completa de Cidadania Italiana",
    status_jornada: "origem em análise; linha Prade mapeada; documentos oficiais pendentes",
    ultima_atualizacao: "Erwin Prade foi conectado a Alessandro Prade e Margherita Maiocchi",
    historico: [
      "Linha Prade atualizada até os bisavós paternos.",
      "Referências FamilySearch adicionadas ao dossiê interno.",
      "Próxima etapa: validar atos civis, eclesiásticos e eventual registro italiano.",
    ],
    texto_upgrade:
      "Após a validação documental da Fase 1, a próxima etapa poderá organizar a estratégia de rota, a busca de certidões e as ações necessárias para o caso.",
  },
  procuracoes: {
    portugues: {
      status: "nao_iniciada",
      finalidade: "Consulta documental e comunicação com órgãos brasileiros, quando aplicável",
      data_assinatura: "",
      data_envio: "",
      observacao: "Preparar somente após revisão do escopo documental e aprovação interna.",
    },
    italiano: {
      status: "nao_iniciada",
      finalidade: "Consulta documental e comunicação com órgãos italianos, quando aplicável",
      data_assinatura: "",
      data_envio: "",
      observacao:
        "Não preparar, assinar ou enviar antes de confirmar a Comune ou o órgão competente.",
    },
  },
  contrato: {
    produto_sku: "CA-CID-023",
    produto_nome: "Assessoria Completa de Cidadania Italiana",
    status: "aguardando_confirmacao",
    arquivo_url: "",
    proposta_final_url: "",
    data_assinatura: "",
    pagamento_status: "aguardando_confirmacao",
    observacao:
      "A Fase 1 integra a Assessoria Completa e não deve ser cadastrada como produto avulso.",
    checklist: [
      { item: "Proposta comercial final revisada", feito: false },
      { item: "Contrato correto identificado", feito: false },
      { item: "Contrato vinculado ao caso CA-CID-IT-2026-001", feito: false },
      {
        item: "Produto contratado confirmado: CA-CID-023 — Assessoria Completa de Cidadania Italiana",
        feito: false,
      },
      { item: "Nome civil da cliente conferido no contrato", feito: false },
      { item: "CPF e documento de identidade conferidos no contrato", feito: false },
      { item: "Escopo da Fase 1 descrito corretamente", feito: false },
      { item: "Regra sobre despesas externas revisada", feito: false },
      { item: "Assinatura da cliente confirmada", feito: false },
      { item: "Assinatura/aceite do Clube Ancestral confirmado", feito: false },
      { item: "Comprovante ou condição de pagamento verificada", feito: false },
      { item: "Pasta de contrato vinculada ao dossiê", feito: false },
      { item: "Cliente recebeu confirmação de abertura do caso", feito: false },
    ],
  },
  governanca: {
    responsavel_caso: "Equipe Clube Ancestral",
    observacoes_internas:
      "Não apresentar origem italiana, Belluno, Comune, cidadania ou rota jurídica como fatos definitivos antes de validação oficial.",
    dados_sensiveis_ocultos: true,
    regra_input_output:
      "Input registra fatos brutos, fontes, links, dados familiares e documentos. Output traduz apenas informações adequadas à cliente, com linguagem acolhedora, clara e sem promessa de resultado jurídico.",
  },
  contratacao: {
    contrato_base: {
      versao: "em revisão jurídica",
      status: "nao_enviado",
      data_aceite: "",
      documento_disponivel: false,
      secure_url: "",
    },
    ordem_servico: {
      status: "rascunho",
      case_id: "CA-CID-IT-2026-001",
      produto_sku: "CA-CID-023",
      produto_nome: "Assessoria Completa de Cidadania Italiana",
      escopo_resumo:
        "Validação do status registral de Giovanna, organização documental da linha Prade e definição da rota aplicável conforme as evidências do caso.",
      etapa_inicial: "Validação de registro e reconstrução documental da linha Prade.",
      entregaveis: [
        "Ficha-mãe validada",
        "Árvore comentada da linha Prade",
        "Matriz de evidências",
        "Checklist documental acionável",
        "Relatório de Situação Inicial",
      ],
      modalidade_escolhida: "pendente",
      valor_contratado: "",
      meio_pagamento: "",
      parcelas_ou_recorrencia: "",
      primeiro_vencimento: "",
      proximo_vencimento: "",
      documento_disponivel: false,
      secure_url: "",
    },
    despesas_externas: {
      politica: "antecipacao_parcial_pelo_clube",
      descricao_cliente:
        "Certidões, traduções, apostilas e taxas administrativas poderão ser previstas no orçamento consolidado. Ajustes fora do previsto dependerão de aprovação prévia.",
      status: "estimativa",
      valor_estimado_total: "",
      valor_real_confirmado: "",
      saldo_ajuste: "",
      requer_aprovacao_para_excedente: true,
      itens: [],
      comprovantes_disponiveis: false,
      secure_url: "",
    },
    autorizacoes: {
      pesquisa_especifica: [],
      procuracao_brasileira: {
        status: "nao_iniciada",
        finalidade: "",
        orgao_destinatario: "",
        pessoas_vinculadas: [],
        validade: "",
        observacoes: "",
        documento_disponivel: false,
        secure_url: "",
      },
      procuracao_italiana: {
        status: "nao_iniciada",
        finalidade: "",
        orgao_destinatario: "",
        pessoas_vinculadas: [],
        validade: "",
        observacoes: "",
        documento_disponivel: false,
        secure_url: "",
      },
    },
    alteracoes_escopo: [],
  },
};

