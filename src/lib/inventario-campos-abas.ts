/**
 * Inventário de campos por aba — medido do código, não escrito à mão.
 *
 * Pedido da Proprietária (04/10/2026): "prepare a tabela de Campos não só dos
 * 54 campos da ficha única, como dos demais cadastros em todas as abas item
 * por item, veja o que está coberto o que tem rota o que está vivo morto, e o
 * que falta ser executado com máscaras".
 *
 * Por que isto é um módulo e não um documento: um documento com a contagem
 * envelhece no dia seguinte. Aqui cada linha aponta o arquivo e a constante
 * reais, e o teste `inventario-campos-abas-2026-10-04` **recalcula** a
 * contagem lendo o código. Se alguém acrescentar ou remover um campo, o teste
 * falha e o número volta a ser verdade — nunca mais há "tabela de campos"
 * desatualizada.
 *
 * O que cada coluna significa:
 *  - `aba`: a superfície como ela aparece no Desk;
 *  - `rota`: a rota real (o teste confirma que o arquivo existe);
 *  - `tabela`: onde o dado persiste;
 *  - `allowlist`: a constante que o escritor usa — é ela que define, campo a
 *    campo, o que a aba realmente grava. Campo fora dela é recusado com nome
 *    (`CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA`), nunca descartado em silêncio;
 *  - `estado`: `vivo` (tela grava e relê), `leitura` (projeta, não grava),
 *    `legado` (preservado por decisão, sem escritor).
 *
 * Máscaras não entram como coluna aqui de propósito: elas são por CAMPO, não
 * por aba, e já têm varredura própria que falha sozinha —
 * `cobertura-mascaras-todas-as-abas-2026-10-03`, 26/26 campos de dado pessoal
 * em todo o `src`. Duas medições do mesmo fato divergiriam; esta aponta para
 * aquela.
 */

export type EstadoAba = "vivo" | "leitura" | "legado";

/**
 * Descrição de UM campo real — o que falta desde 04/10/2026 (Corte G item 1):
 * "não só os 54 campos da ficha única, como os demais cadastros... o que cada
 * campo coleta". Por campo, não por aba.
 */
export type CampoDescrito = {
  /** Nome exato da coluna/chave, como aparece na allowlist do escritor. */
  campo: string;
  /** O que o campo coleta, em uma frase — nunca o nome técnico sozinho. */
  oQueColeta: string;
  /** Quem preenche: papel ou automação real, nunca "o sistema" genérico. */
  quemPreenche: string;
  /** O App Cliente pode ver este campo? Desk-only é o padrão default. */
  visibilidade: "interna" | "cliente";
};

export type AbaComCampos = {
  aba: string;
  rota: string;
  tabela: string;
  /** Arquivo onde vive a allowlist do escritor. */
  modulo: string;
  /** Constante da allowlist. O teste conta os campos dela no arquivo. */
  allowlist: string;
  /** Quantidade medida em 04/10/2026. O teste recalcula e falha se mudar. */
  campos: number;
  estado: EstadoAba;
  observacao?: string;
  /**
   * Descrição por campo (Corte G item 1). Opcional porque está sendo
   * preenchida aba a aba — o teste confere, quando presente, que cada nome
   * listado aqui existe de fato na allowlist (nunca inventa campo).
   */
  camposDescritos?: CampoDescrito[];
};

export const INVENTARIO_CAMPOS_ABAS: AbaComCampos[] = [
  /* ---------------------------------------------- Marketing & Comercial */
  {
    aba: "Lead / Mesa Discovery",
    rota: "src/routes/_authenticated/leads.tsx",
    tabela: "leads",
    modulo: "src/lib/crm-lead-campos.ts",
    allowlist: "CAMPOS_LEAD",
    campos: 78,
    estado: "vivo",
    observacao:
      "Maior cadastro do Desk. A mesma allowlist serve /calls (roteiro SPIN) e /leads (pipeline).",
  },

  /* ----------------------------------------------------- Pessoas & Casos */
  {
    aba: "Pessoa 360",
    rota: "src/routes/_authenticated/pessoas.$clienteId.tsx",
    tabela: "clientes",
    modulo: "src/lib/pessoa.functions.ts",
    allowlist: "CAMPOS_EDITAVEIS",
    campos: 25,
    estado: "vivo",
    observacao:
      "Dono canônico de identidade, contato e documentos civis. As outras abas leem daqui.",
    camposDescritos: [
      {
        campo: "nome",
        oQueColeta:
          "Nome civil completo — usado por contrato, núcleo e caso ao reconciliar a mesma pessoa.",
        quemPreenche: "Equipe (cadastro/Discovery)",
        visibilidade: "cliente",
      },
      {
        campo: "nome_social",
        oQueColeta: "Nome social, quando diferente do civil.",
        quemPreenche: "Equipe, a pedido da pessoa",
        visibilidade: "cliente",
      },
      {
        campo: "email",
        oQueColeta: "E-mail de contato para comunicação e acesso ao portal.",
        quemPreenche: "Equipe (cadastro/Discovery)",
        visibilidade: "cliente",
      },
      {
        campo: "telefone",
        oQueColeta: "Telefone de contato geral.",
        quemPreenche: "Equipe (cadastro/Discovery)",
        visibilidade: "cliente",
      },
      {
        campo: "telefone_whatsapp",
        oQueColeta: "WhatsApp — usado pela Mesa Discovery/varredura de conversa.",
        quemPreenche: "Equipe (cadastro/Discovery)",
        visibilidade: "cliente",
      },
      {
        campo: "sexo",
        oQueColeta: "Sexo registrado, para documentos civis e certidões.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "cliente",
      },
      {
        campo: "nacionalidade",
        oQueColeta: "Nacionalidade atual da pessoa (não confundir com país de interesse do caso).",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "cliente",
      },
      {
        campo: "profissao",
        oQueColeta: "Profissão declarada.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "cliente",
      },
      {
        campo: "cpf",
        oQueColeta:
          "CPF — campo mascarado e validado (validacao-pessoa.ts); reconciliado com case_members/contract_parties sem sobrescrever divergência.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
      {
        campo: "rg_numero",
        oQueColeta: "Número do RG, documento civil complementar ao CPF.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
      {
        campo: "rg_orgao_uf",
        oQueColeta: "Órgão expedidor e UF do RG.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
      {
        campo: "endereco_logradouro",
        oQueColeta: "Logradouro do endereço civil.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "cliente",
      },
      {
        campo: "endereco_numero",
        oQueColeta: "Número do endereço civil.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "cliente",
      },
      {
        campo: "endereco_complemento",
        oQueColeta: "Complemento do endereço civil.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "cliente",
      },
      {
        campo: "endereco_bairro",
        oQueColeta: "Bairro do endereço civil.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "cliente",
      },
      {
        campo: "endereco_cidade",
        oQueColeta: "Cidade do endereço civil.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "cliente",
      },
      {
        campo: "endereco_uf",
        oQueColeta: "UF do endereço civil.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "cliente",
      },
      {
        campo: "endereco_cep",
        oQueColeta: "CEP — campo mascarado e validado.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "cliente",
      },
      {
        campo: "endereco_pais",
        oQueColeta: "País do endereço civil.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "cliente",
      },
      {
        campo: "estado_civil",
        oQueColeta: "Estado civil declarado — relevante para certidões e representação.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
      {
        campo: "nome_conjuge",
        oQueColeta: "Nome do cônjuge, quando aplicável.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
      {
        campo: "data_nascimento",
        oQueColeta: "Data de nascimento — mascarada/validada, recusa data futura.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "cliente",
      },
      {
        campo: "nome_pai",
        oQueColeta: "Nome do pai — usado na cadeia de linhagem/filiação.",
        quemPreenche: "Equipe (cadastro/pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "nome_mae",
        oQueColeta: "Nome da mãe — usado na cadeia de linhagem/filiação.",
        quemPreenche: "Equipe (cadastro/pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "cidade_nascimento",
        oQueColeta: "Cidade de nascimento — alimenta a Ficha Genealógica.",
        quemPreenche: "Equipe (cadastro/pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Caso 360 › Jornada (Planejador)",
    rota: "src/routes/_authenticated/casos.$caseId.index.tsx",
    tabela: "case_plans",
    modulo: "src/lib/jornada-planejador.ts",
    allowlist: "CAMPOS_EDITAVEIS_JORNADA",
    campos: 7,
    estado: "vivo",
    observacao:
      "Edição pontual: não toca plano_hash/versão. Produto-pai, rota, etapa, marco, responsável, próxima ação e prazo.",
    camposDescritos: [
      {
        campo: "etapa",
        oQueColeta: "Etapa atual da jornada do caso no Planejador.",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
      {
        campo: "rota_confirmada",
        oQueColeta: "Rota/país de cidadania confirmada para este plano, depois de homologada.",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
      {
        campo: "produto_pai_id",
        oQueColeta: "Produto-pai do Planejador Universal homologado para este caso.",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
      {
        campo: "marco_atual",
        oQueColeta: "Marco corrente da jornada, usado na linha do tempo e no resumo do caso.",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
      {
        campo: "responsavel_user_id",
        oQueColeta: "Pessoa da equipe responsável por avançar este plano.",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
      {
        campo: "proxima_acao",
        oQueColeta: "Texto da próxima ação do plano, para a tela de Caso 360.",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
      {
        campo: "prazo_proxima_acao",
        oQueColeta: "Data-limite da próxima ação registrada.",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Caso 360 › Próxima ação",
    rota: "src/routes/_authenticated/casos.$caseId.index.tsx",
    tabela: "crm_casos",
    modulo: "src/lib/saas.functions.ts",
    allowlist: "CAMPOS_PROXIMA_ACAO",
    campos: 7,
    estado: "vivo",
    observacao: "Espelha em crm_casos, que é o que a RPC proxima_acao_prioritaria lê.",
    camposDescritos: [
      {
        campo: "proxima_acao_codigo",
        oQueColeta: "Código normativo da próxima ação prioritária do caso.",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
      {
        campo: "proxima_acao_justificativa",
        oQueColeta: "Por que esta é a próxima ação, em texto — o que a tela mostra como motivo.",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
      {
        campo: "prazo_proxima_acao",
        oQueColeta: "Data-limite da próxima ação prioritária.",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
      {
        campo: "target_audience",
        oQueColeta: "Para quem a próxima ação é dirigida (equipe, cliente).",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
      {
        campo: "visibility",
        oQueColeta: "Se a próxima ação é visível ao cliente ou só interna.",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
      {
        campo: "suggested_channel",
        oQueColeta: "Canal sugerido para comunicar a próxima ação (ex.: WhatsApp, portal).",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
      {
        campo: "requires_human_approval",
        oQueColeta:
          "Se a próxima ação precisa de aprovação humana antes de ser publicada ao cliente.",
        quemPreenche: "Equipe (operação do caso)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Checklist de cadastro (titulares)",
    rota: "src/routes/_authenticated/casos.$caseId.index.tsx",
    tabela: "case_members / case_dependents",
    modulo: "src/lib/cadastro-checklist.ts",
    allowlist: "CAMPOS_TITULAR",
    campos: 9,
    estado: "vivo",
    observacao: "A contratada NÃO entra aqui: é o perfil institucional (org-wide).",
    camposDescritos: [
      {
        campo: "nome_completo",
        oQueColeta:
          "Nome completo confirmado do titular/dependente, para o checklist de cadastro do caso.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
      {
        campo: "cpf",
        oQueColeta: "CPF do titular, exigido para formalização.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
      {
        campo: "rg",
        oQueColeta: "RG ou documento de identidade equivalente.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
      {
        campo: "profissao",
        oQueColeta: "Profissão declarada do titular.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
      {
        campo: "estado_civil",
        oQueColeta: "Estado civil, relevante para certidões e representação.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
      {
        campo: "endereco",
        oQueColeta: "Endereço completo do titular.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
      {
        campo: "cep",
        oQueColeta: "CEP do endereço do titular.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
      {
        campo: "telefone",
        oQueColeta: "Telefone de contato do titular.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
      {
        campo: "email",
        oQueColeta: "E-mail de contato do titular.",
        quemPreenche: "Equipe (cadastro)",
        visibilidade: "interna",
      },
    ],
  },

  /* ------------------------------------------------ Inteligência & Pesquisa */
  {
    aba: "Ficha genealógica › Perfil 360°",
    rota: "src/routes/_authenticated/pessoas-linhagens.$caseId.tsx",
    tabela: "genealogical_person_profiles",
    modulo: "src/lib/pessoas-linhagens.functions.ts",
    allowlist: "CAMPOS_PERFIL",
    campos: 22,
    estado: "vivo",
    observacao: "Inclui client_visibility, o gate da Árvore do App (seletor exposto em 04/10).",
    camposDescritos: [
      {
        campo: "case_id",
        oQueColeta: "Caso a que este perfil genealógico pertence.",
        quemPreenche: "Sistema, na criação do registro",
        visibilidade: "interna",
      },
      {
        campo: "research_person_id",
        oQueColeta: "Vínculo com a pessoa de pesquisa (research_people) que originou este perfil.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "nome_completo",
        oQueColeta: "Nome completo da pessoa na linhagem, como aparece na árvore.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "nome_nascimento",
        oQueColeta: "Nome de nascimento, quando diferente do nome usado depois.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "sexo",
        oQueColeta: "Sexo registrado da pessoa na linhagem.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "nascimento_data",
        oQueColeta: "Data de nascimento, quando documentada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "nascimento_data_aproximada",
        oQueColeta: 'Se a data de nascimento é aproximada (marca o "c." na árvore).',
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "nascimento_localidade",
        oQueColeta: "Localidade de nascimento documentada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "morte_data",
        oQueColeta: "Data de falecimento, quando documentada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "morte_data_aproximada",
        oQueColeta: "Se a data de falecimento é aproximada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "morte_localidade",
        oQueColeta: "Localidade de falecimento documentada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "causa_morte",
        oQueColeta: "Causa de morte, quando constar da fonte documental.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "sepultamento_localidade",
        oQueColeta: "Localidade de sepultamento, quando documentada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "status_verificacao",
        oQueColeta: "Estado de verificação do perfil (ex.: confirmado, em validação).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "evidence_id",
        oQueColeta: "Evidência canônica que sustenta este perfil.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "source_id",
        oQueColeta: "Fonte do catálogo de onde o dado veio.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "internal_notes",
        oQueColeta: "Notas internas de pesquisa sobre esta pessoa, nunca enviadas ao cliente.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "nascimento_precisao",
        oQueColeta: "Precisão da data de nascimento (dia, mês, ano, década).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "morte_precisao",
        oQueColeta: "Precisão da data de falecimento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "responsible_user_id",
        oQueColeta: "Pessoa da equipe responsável por este perfil.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "client_visibility",
        oQueColeta: "Gate que decide se esta pessoa aparece na Árvore do App Cliente.",
        quemPreenche: "Equipe (pesquisa), decisão explícita",
        visibilidade: "interna",
      },
      {
        campo: "client_id",
        oQueColeta:
          "Vínculo opcional com a Pessoa Canônica (clientes), quando um humano confirma que é a mesma pessoa.",
        quemPreenche: "Equipe, escolha explícita",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Ficha genealógica › Variantes de nome",
    rota: "src/routes/_authenticated/pessoas-linhagens.$caseId.tsx",
    tabela: "name_variants",
    modulo: "src/lib/pessoas-linhagens.functions.ts",
    allowlist: "CAMPOS_VARIANTE",
    campos: 10,
    estado: "vivo",
    camposDescritos: [
      {
        campo: "person_id",
        oQueColeta: "Pessoa da linhagem a que esta variante de nome pertence.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "variante",
        oQueColeta: "A variante do nome em si (ex.: Rodolfo Friedmann para Rudolf Friedmann).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "tipo",
        oQueColeta: "Tipo da variante (grafia, tradução, abreviação etc.).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "periodo",
        oQueColeta: "Período em que esta variante foi usada, quando conhecido.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "localidade",
        oQueColeta: "Localidade onde esta variante aparece documentada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "estado_validacao",
        oQueColeta: "Estado de validação desta variante.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "nivel_confianca",
        oQueColeta: "Nível de confiança de que a variante é da mesma pessoa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "evidence_id",
        oQueColeta: "Evidência que documenta esta variante de nome.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "source_id",
        oQueColeta: "Fonte do catálogo de onde a variante foi extraída.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "observacao_interna",
        oQueColeta: "Observação interna sobre esta variante, nunca enviada ao cliente.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Ficha genealógica › Relações",
    rota: "src/routes/_authenticated/pessoas-linhagens.$caseId.tsx",
    tabela: "genealogical_relationships",
    modulo: "src/lib/pessoas-linhagens.functions.ts",
    allowlist: "CAMPOS_RELACAO",
    campos: 12,
    estado: "vivo",
    observacao:
      "Corte D (30/10/2026): o caso da Ana já tem 8 relações gravadas (cadeia Heinrich→Rudolf→Lotte/Otto→Ana Maria→Cleusa→Adair→Ana Luiza) — esta observação estava desatualizada.",
    camposDescritos: [
      {
        campo: "case_id",
        oQueColeta: "Caso a que esta relação de parentesco pertence.",
        quemPreenche: "Sistema, na criação do registro",
        visibilidade: "interna",
      },
      {
        campo: "person_from_id",
        oQueColeta: "Pessoa de origem da relação (ex.: o pai, em pai_mae).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "person_to_id",
        oQueColeta: "Pessoa de destino da relação (ex.: o filho, em pai_mae).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "relation_type",
        oQueColeta: "Tipo da relação (pai_mae, conjuge etc.) — define a aresta da árvore.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "relation_date",
        oQueColeta: "Data do evento que originou a relação (ex.: casamento), quando documentada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "relation_date_aproximada",
        oQueColeta: "Se a data da relação é aproximada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "locality",
        oQueColeta: "Localidade do evento que originou a relação.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "status_pesquisa",
        oQueColeta: "Estado de pesquisa desta relação (ex.: asserted, em verificação).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "evidence_id",
        oQueColeta: "Evidência que sustenta esta relação.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "source_id",
        oQueColeta: "Fonte do catálogo de onde a relação foi extraída.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "internal_notes",
        oQueColeta: "Notas internas sobre esta relação, nunca enviadas ao cliente.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "client_visibility",
        oQueColeta: "Gate que decide se esta relação (aresta) aparece na Árvore do App Cliente.",
        quemPreenche: "Equipe (pesquisa), decisão explícita",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Ficha genealógica › Eventos",
    rota: "src/routes/_authenticated/pessoas-linhagens.$caseId.tsx",
    tabela: "genealogical_events",
    modulo: "src/lib/pessoas-linhagens.functions.ts",
    allowlist: "CAMPOS_EVENTO",
    campos: 15,
    estado: "vivo",
    camposDescritos: [
      {
        campo: "case_id",
        oQueColeta: "Caso a que este evento genealógico pertence.",
        quemPreenche: "Sistema, na criação do registro",
        visibilidade: "interna",
      },
      {
        campo: "person_id",
        oQueColeta: "Pessoa da linhagem a que este evento se refere.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "event_type",
        oQueColeta: "Tipo do evento (nascimento, casamento, imigração, serviço militar etc.).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "start_date",
        oQueColeta: "Data de início do evento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "end_date",
        oQueColeta: "Data de fim do evento, quando houver duração.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "approximate_date",
        oQueColeta: "Se a data do evento é aproximada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "locality",
        oQueColeta: "Localidade onde o evento ocorreu.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "description_internal",
        oQueColeta: "Descrição interna do evento, nunca enviada ao cliente sem sanitização.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "validation_status",
        oQueColeta: "Estado de validação do evento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "evidence_id",
        oQueColeta: "Evidência que documenta este evento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "source_id",
        oQueColeta: "Fonte do catálogo de onde o evento foi extraído.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "family_id",
        oQueColeta: "Núcleo familiar a que este evento se associa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "impact_type",
        oQueColeta: "Tipo de impacto deste evento na linhagem (ex.: ruptura documental, migração).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "data_precisao",
        oQueColeta: "Precisão da data do evento (dia, mês, ano, década).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "client_visibility",
        oQueColeta:
          "Gate que decide se este evento aparece na Árvore/linha do tempo do App Cliente.",
        quemPreenche: "Equipe (pesquisa), decisão explícita",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Ficha genealógica › Linhagens",
    rota: "src/routes/_authenticated/pessoas-linhagens.$caseId.tsx",
    tabela: "lineage_paths",
    modulo: "src/lib/pessoas-linhagens.functions.ts",
    allowlist: "CAMPOS_LINHAGEM",
    campos: 14,
    estado: "vivo",
    observacao: "Carrega aderencia_percentual (heatmap, campos 14/16/18 da Ficha Master).",
    camposDescritos: [
      {
        campo: "case_id",
        oQueColeta: "Caso a que esta linha de pesquisa pertence.",
        quemPreenche: "Sistema, na criação do registro",
        visibilidade: "interna",
      },
      {
        campo: "family_id",
        oQueColeta: "Núcleo familiar a que esta linhagem se associa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "nome_da_linha",
        oQueColeta: "Nome da linha de pesquisa (ex.: linha paterna de Rudolf Friedmann).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "pessoa_ancora_id",
        oQueColeta: "Pessoa que ancora esta linha (ponto de partida da subida genealógica).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "tipo_da_linha",
        oQueColeta: "Tipo da linha (paterna, materna etc.).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "citizenship_track_id",
        oQueColeta: "Trilha de cidadania a que esta linha de pesquisa se candidata.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "objetivo",
        oQueColeta: "Objetivo probatório desta linha de pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "geracao_alvo",
        oQueColeta: "Geração-alvo que esta linha precisa alcançar para fechar a cadeia.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "status",
        oQueColeta: "Estado da linha de pesquisa (ex.: em andamento, concluída).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "evidencias_chave",
        oQueColeta: "Lista das evidências-chave desta linha de pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "risco_principal",
        oQueColeta: "Principal risco de não fechar esta linha (ex.: lacuna documental).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "proximo_marco",
        oQueColeta: "Próximo marco de pesquisa desta linha.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "responsavel",
        oQueColeta: "Pessoa da equipe responsável por esta linha de pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "aderencia_percentual",
        oQueColeta:
          "Percentual de aderência probatória da linha (0-100), usado no heatmap da Ficha Master.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Ficha genealógica › Módulos históricos",
    rota: "src/routes/_authenticated/pessoas-linhagens.$caseId.tsx",
    tabela: "genealogical_modules",
    modulo: "src/lib/pessoas-linhagens.functions.ts",
    allowlist: "CAMPOS_MODULO",
    campos: 17,
    estado: "vivo",
    observacao:
      "Aqui client_visibility='aprovada' EXIGE status_verificacao='confirmado' — regra que não vale para a árvore de pessoas.",
    camposDescritos: [
      {
        campo: "case_id",
        oQueColeta: "Caso a que este módulo histórico pertence.",
        quemPreenche: "Sistema, na criação do registro",
        visibilidade: "interna",
      },
      {
        campo: "family_id",
        oQueColeta: "Núcleo familiar a que este módulo histórico se associa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "person_id",
        oQueColeta: "Pessoa a que este módulo histórico se refere.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "titulo",
        oQueColeta: "Título do módulo histórico (ex.: contexto de emigração, serviço militar).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "subtipo",
        oQueColeta: "Subtipo do módulo histórico.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "periodo_inicio",
        oQueColeta: "Início do período coberto pelo módulo histórico.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "periodo_fim",
        oQueColeta: "Fim do período coberto pelo módulo histórico.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "data_precisao",
        oQueColeta: "Precisão das datas do período (dia, mês, ano, década).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "localidade",
        oQueColeta: "Localidade coberta pelo módulo histórico.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "descricao_interna",
        oQueColeta: "Descrição interna de pesquisa, nunca enviada ao cliente sem sanitização.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "dados",
        oQueColeta:
          "Conteúdo estruturado do módulo histórico (texto aprovado para o cliente, quando houver).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "evidence_id",
        oQueColeta: "Evidência que sustenta este módulo histórico.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "source_id",
        oQueColeta: "Fonte do catálogo de onde este módulo foi extraído.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "institution_id",
        oQueColeta: "Instituição associada a este módulo histórico, quando aplicável.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "status_verificacao",
        oQueColeta:
          "Estado de verificação do módulo — precisa ser 'confirmado' para liberar ao cliente.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "client_visibility",
        oQueColeta:
          "Gate que decide se este módulo aparece ao cliente — exige status_verificacao='confirmado'.",
        quemPreenche: "Equipe (pesquisa), decisão explícita",
        visibilidade: "interna",
      },
      {
        campo: "responsible_user_id",
        oQueColeta: "Pessoa da equipe responsável por este módulo histórico.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Pesquisa › Pessoas de pesquisa",
    rota: "src/routes/_authenticated/pesquisa-modulo.$id.tsx",
    tabela: "research_people",
    modulo: "src/lib/pesquisa.server.ts",
    allowlist: "CAMPOS_PESSOA",
    campos: 11,
    estado: "vivo",
    observacao: "Dono de sensitivity_level — o eixo 'restrito / altamente restrito / padrão'.",
    camposDescritos: [
      {
        campo: "nome",
        oQueColeta: "Nome da pessoa de pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "parentesco",
        oQueColeta: "Parentesco desta pessoa em relação ao requerente.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "requerente",
        oQueColeta: "Se esta pessoa é a própria requerente do caso.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "nacionalidade",
        oQueColeta: "Nacionalidade da pessoa de pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "data_nascimento",
        oQueColeta: "Data de nascimento da pessoa de pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "local_nascimento",
        oQueColeta: "Local de nascimento da pessoa de pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "data_obito",
        oQueColeta: "Data de óbito, quando aplicável.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "local_obito",
        oQueColeta: "Local de óbito, quando aplicável.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "pai_id",
        oQueColeta: "Vínculo com o registro do pai, dentro desta pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "mae_id",
        oQueColeta: "Vínculo com o registro da mãe, dentro desta pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "observacoes_protegidas",
        oQueColeta:
          "Observações sensíveis sobre a pessoa — nível de proteção mais alto, nunca sanitizadas automaticamente.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Pesquisa › Hipóteses",
    rota: "src/routes/_authenticated/pesquisa-modulo.$id.tsx",
    tabela: "research_case_hypotheses",
    modulo: "src/lib/pesquisa.server.ts",
    allowlist: "CAMPOS_HIPOTESE",
    campos: 7,
    estado: "vivo",
    observacao:
      "Criação na tabela legada research_hypotheses foi recusada em 24/09; aqui é o lugar.",
    camposDescritos: [
      {
        campo: "person_id",
        oQueColeta: "Pessoa de pesquisa a que esta hipótese se refere.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "titulo",
        oQueColeta: "Título da hipótese de pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "descricao",
        oQueColeta: "Descrição da hipótese, o que ela propõe provar ou refutar.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "status",
        oQueColeta: "Estado da hipótese (ex.: aberta, confirmada, descartada).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "grau_confianca",
        oQueColeta: "Grau de confiança atual na hipótese.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "justificativa",
        oQueColeta: "Justificativa para o grau de confiança atribuído.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "pesquisador_id",
        oQueColeta: "Pesquisador responsável por esta hipótese.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Pesquisa › Evidências",
    rota: "src/routes/_authenticated/pesquisa-modulo.$id.tsx",
    tabela: "research_evidence_items",
    modulo: "src/lib/pesquisa.server.ts",
    allowlist: "CAMPOS_EVIDENCIA",
    campos: 20,
    estado: "vivo",
    camposDescritos: [
      {
        campo: "hypothesis_id",
        oQueColeta: "Hipótese que esta evidência sustenta ou refuta.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "person_id",
        oQueColeta: "Pessoa de pesquisa a que esta evidência se refere.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "titulo",
        oQueColeta: "Título da evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "tipo",
        oQueColeta: "Tipo da evidência (documento, registro civil, depoimento etc.).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "status",
        oQueColeta: "Estado da evidência (ex.: em análise, validada).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "descricao",
        oQueColeta: "Descrição do conteúdo da evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "fonte",
        oQueColeta: "Fonte de onde a evidência foi obtida.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "url",
        oQueColeta: "URL externa da evidência, quando aplicável.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "storage_path",
        oQueColeta: "Caminho do arquivo da evidência no armazenamento interno.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "local_relacionado",
        oQueColeta: "Local relacionado ao conteúdo da evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "pessoa_relacionada",
        oQueColeta: "Pessoa relacionada ao conteúdo da evidência, em texto.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "data_inicio",
        oQueColeta: "Data de início do período que a evidência documenta.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "data_fim",
        oQueColeta: "Data de fim do período que a evidência documenta.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "periodo",
        oQueColeta: "Período da evidência, em texto livre quando a data exata não existe.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "grau_confianca",
        oQueColeta: "Grau de confiança na evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "relacao_hipotese",
        oQueColeta: "Como esta evidência se relaciona com a hipótese (apoia, refuta, neutra).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "justificativa",
        oQueColeta: "Justificativa de por que esta evidência apoia ou refuta a hipótese.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "pesquisador_id",
        oQueColeta: "Pesquisador que registrou esta evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "revisado_em",
        oQueColeta: "Data em que a evidência foi revisada por outro humano.",
        quemPreenche: "Equipe (pesquisa, revisão)",
        visibilidade: "interna",
      },
      {
        campo: "observacao",
        oQueColeta: "Observação livre sobre a evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Pesquisa › Eventos",
    rota: "src/routes/_authenticated/pesquisa-modulo.$id.tsx",
    tabela: "research_case_events",
    modulo: "src/lib/pesquisa.server.ts",
    allowlist: "CAMPOS_EVENTO",
    campos: 11,
    estado: "vivo",
    camposDescritos: [
      {
        campo: "person_id",
        oQueColeta: "Pessoa de pesquisa a que este evento se refere.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "evidencia_id",
        oQueColeta: "Evidência que documenta este evento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "hypothesis_id",
        oQueColeta: "Hipótese a que este evento se associa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "titulo",
        oQueColeta: "Título do evento de pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "tipo",
        oQueColeta: "Tipo do evento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "local",
        oQueColeta: "Local onde o evento ocorreu.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "data_inicio",
        oQueColeta: "Data de início do evento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "data_fim",
        oQueColeta: "Data de fim do evento, quando houver duração.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "periodo_texto",
        oQueColeta: "Período do evento em texto livre, quando não há data exata.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "descricao",
        oQueColeta: "Descrição do evento de pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "confirmado",
        oQueColeta: "Se o evento já foi confirmado por evidência documental.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Pesquisa › Pendências",
    rota: "src/routes/_authenticated/pesquisa-modulo.$id.tsx",
    tabela: "research_pending_items",
    modulo: "src/lib/pesquisa.server.ts",
    allowlist: "CAMPOS_PENDENCIA",
    campos: 8,
    estado: "vivo",
    observacao:
      "Destino natural de cada item de checklist de dossiê (título, severidade, prazo, status).",
    camposDescritos: [
      {
        campo: "titulo",
        oQueColeta: "Título da pendência de pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "descricao",
        oQueColeta: "Descrição do que falta para resolver a pendência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "status",
        oQueColeta: "Estado da pendência (ex.: aberta, resolvida).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "prioridade",
        oQueColeta: "Prioridade/severidade da pendência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "prazo",
        oQueColeta: "Prazo para resolver a pendência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "person_id",
        oQueColeta: "Pessoa de pesquisa a que a pendência se refere.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "evidencia_id",
        oQueColeta: "Evidência associada a esta pendência, quando houver.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "hypothesis_id",
        oQueColeta: "Hipótese associada a esta pendência, quando houver.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Achados genealógicos",
    rota: "src/routes/_authenticated/achados.$caseId.tsx",
    tabela: "genealogical_findings",
    modulo: "src/lib/achados-genealogicos.functions.ts",
    allowlist: "CAMPOS_ACHADO",
    campos: 28,
    estado: "vivo",
    camposDescritos: [
      {
        campo: "case_id",
        oQueColeta: "Caso a que este achado genealógico pertence.",
        quemPreenche: "Sistema, na criação do registro",
        visibilidade: "interna",
      },
      {
        campo: "family_id",
        oQueColeta: "Núcleo familiar a que este achado se associa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "research_item_id",
        oQueColeta: "Item do plano de ação de pesquisa que originou este achado.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "primary_research_person_id",
        oQueColeta: "Pessoa de pesquisa principal deste achado.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "title",
        oQueColeta: "Título do achado.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "generation",
        oQueColeta: "Geração da linhagem a que o achado se refere.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "finding_type",
        oQueColeta: "Tipo do achado (ex.: confirmação, divergência, descoberta nova).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "internal_summary",
        oQueColeta: "Resumo interno do achado, nunca enviado ao cliente sem sanitização.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "confirmed_facts",
        oQueColeta: "Fatos já confirmados por evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "facts_to_confirm",
        oQueColeta: "Fatos que ainda precisam de confirmação.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "period_start",
        oQueColeta: "Início do período coberto pelo achado.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "period_end",
        oQueColeta: "Fim do período coberto pelo achado.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "locality",
        oQueColeta: "Localidade associada ao achado.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "family_relationship",
        oQueColeta: "Relação familiar que o achado esclarece ou confirma.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "relevance",
        oQueColeta: "Relevância do achado para o caso (ex.: crítico, informativo).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "validation_status",
        oQueColeta: "Estado de validação do achado.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "evidence_links",
        oQueColeta: "Evidências vinculadas que sustentam o achado.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "source_links",
        oQueColeta: "Fontes vinculadas que sustentam o achado.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "negative_source_consulted_at",
        oQueColeta:
          "Quando uma fonte foi consultada e não trouxe o dado esperado (resultado negativo registrado).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "negative_next_action",
        oQueColeta: "Próxima ação planejada depois de um resultado negativo de busca.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "tree_impact",
        oQueColeta: "Se este achado deve alterar a árvore genealógica publicada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "timeline_impact",
        oQueColeta: "Se este achado deve alterar a linha do tempo publicada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "planning_impact",
        oQueColeta: "Se este achado deve alterar o plano/estratégia do caso.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "eligible_for_client_deliverable",
        oQueColeta: "Se o achado está apto a virar entrega publicável ao cliente.",
        quemPreenche: "Equipe (pesquisa), decisão explícita",
        visibilidade: "interna",
      },
      {
        campo: "client_deliverable_id",
        oQueColeta: "Entrega ao cliente gerada a partir deste achado, quando houver.",
        quemPreenche: "Sistema, ao publicar",
        visibilidade: "interna",
      },
      {
        campo: "responsible_user_id",
        oQueColeta: "Pessoa da equipe responsável por este achado.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "found_at",
        oQueColeta: "Data em que o achado foi registrado.",
        quemPreenche: "Sistema, na criação do registro",
        visibilidade: "interna",
      },
      {
        campo: "internal_notes",
        oQueColeta: "Notas internas sobre o achado, nunca enviadas ao cliente.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Achados › Encontros de linha",
    rota: "src/routes/_authenticated/achados.$caseId.tsx",
    tabela: "lineage_encounters",
    modulo: "src/lib/achados-genealogicos.functions.ts",
    allowlist: "CAMPOS_ENCONTRO",
    campos: 26,
    estado: "vivo",
    camposDescritos: [
      {
        campo: "case_id",
        oQueColeta: "Caso a que este encontro de linhas pertence.",
        quemPreenche: "Sistema, na criação do registro",
        visibilidade: "interna",
      },
      {
        campo: "family_id",
        oQueColeta: "Núcleo familiar a que este encontro se associa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "lineage_path_a_id",
        oQueColeta: "Primeira linha de pesquisa que se encontra com a outra.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "lineage_path_b_id",
        oQueColeta: "Segunda linha de pesquisa que se encontra com a primeira.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "encounter_type",
        oQueColeta: "Tipo do encontro entre as duas linhas (ex.: casamento, mesma localidade).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "title_internal",
        oQueColeta: "Título interno do encontro de linhas.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "title_client",
        oQueColeta: "Título aprovado para o cliente, quando o encontro é publicável.",
        quemPreenche: "Equipe (pesquisa), decisão explícita",
        visibilidade: "cliente",
      },
      {
        campo: "contexto_historico",
        oQueColeta: "Contexto histórico que explica o encontro das duas linhas.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "territorios_migratorios",
        oQueColeta: "Territórios de migração envolvidos no encontro.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "memoria_familiar",
        oQueColeta: "Memória familiar relatada sobre o encontro das linhas.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "praticas_culturais_documentadas",
        oQueColeta: "Práticas culturais documentadas associadas ao encontro.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "encontros_no_brasil",
        oQueColeta: "Se o encontro das linhas ocorreu já no Brasil.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "repertorios_narrativos",
        oQueColeta: "Repertórios narrativos associados a este encontro.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "resumo_interno",
        oQueColeta: "Resumo interno do encontro de linhas.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "resumo_aprovado_cliente",
        oQueColeta: "Resumo aprovado para publicação ao cliente.",
        quemPreenche: "Equipe (pesquisa), decisão explícita",
        visibilidade: "cliente",
      },
      {
        campo: "evidence_links_a",
        oQueColeta: "Evidências da primeira linha que sustentam o encontro.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "evidence_links_b",
        oQueColeta: "Evidências da segunda linha que sustentam o encontro.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "confidence_internal",
        oQueColeta: "Grau de confiança interno de que o encontro é real.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "validation_status",
        oQueColeta: "Estado de validação do encontro de linhas.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "disclaimer_obrigatorio",
        oQueColeta: "Aviso obrigatório que acompanha a publicação deste encontro ao cliente.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "tree_impact",
        oQueColeta: "Se este encontro deve alterar a árvore genealógica publicada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "timeline_impact",
        oQueColeta: "Se este encontro deve alterar a linha do tempo publicada.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "approval_status",
        oQueColeta: "Estado de aprovação para publicação ao cliente.",
        quemPreenche: "Equipe (pesquisa), decisão explícita",
        visibilidade: "interna",
      },
      {
        campo: "client_deliverable_id",
        oQueColeta: "Entrega ao cliente gerada a partir deste encontro, quando houver.",
        quemPreenche: "Sistema, ao publicar",
        visibilidade: "interna",
      },
      {
        campo: "responsible_user_id",
        oQueColeta: "Pessoa da equipe responsável por este encontro de linhas.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "data_marco",
        oQueColeta: "Data-marco do encontro, quando houver uma data que o represente.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Biblioteca de evidências",
    rota: "src/routes/_authenticated/biblioteca-evidencias.$caseId.tsx",
    tabela: "research_evidence_items",
    modulo: "src/lib/biblioteca-evidencias.functions.ts",
    allowlist: "CAMPOS_EVIDENCIA",
    campos: 22,
    estado: "vivo",
    observacao: "Delega ao módulo canônico de evidência desde o Corte 0.",
    camposDescritos: [
      {
        campo: "case_id",
        oQueColeta: "Caso a que esta evidência pertence.",
        quemPreenche: "Sistema, na criação do registro",
        visibilidade: "interna",
      },
      {
        campo: "research_item_id",
        oQueColeta: "Item do plano de ação que originou a coleta desta evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "research_person_id",
        oQueColeta: "Pessoa de pesquisa a que esta evidência se refere.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "source_id",
        oQueColeta: "Fonte do catálogo de onde a evidência foi obtida.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "evidence_type",
        oQueColeta: "Tipo da evidência (ex.: certidão, registro paroquial).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "evidence_nature",
        oQueColeta: "Natureza da evidência (documental, testemunhal etc.).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "title_internal",
        oQueColeta: "Título interno da evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "description_internal",
        oQueColeta: "Descrição interna do conteúdo da evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "reference_date",
        oQueColeta: "Data de referência do conteúdo da evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "reference_location",
        oQueColeta: "Localidade de referência do conteúdo da evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "cliente",
      },
      {
        campo: "storage_reference_internal",
        oQueColeta: "Referência interna do arquivo da evidência no armazenamento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "access_level",
        oQueColeta: "Nível de acesso/sensibilidade da evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "workflow_status",
        oQueColeta: "Estado desta evidência no fluxo de trabalho da pesquisa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "epistemic_validation_status",
        oQueColeta: "Estado de validação epistêmica (confiabilidade do conteúdo) da evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "confidence_level",
        oQueColeta: "Grau de confiança na evidência.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "negative_search_source",
        oQueColeta: "Fonte consultada sem sucesso (resultado negativo registrado).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "negative_search_date",
        oQueColeta: "Data em que a busca sem sucesso foi feita.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "negative_search_next_action",
        oQueColeta: "Próxima ação planejada depois de uma busca sem sucesso.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "reviewed_by",
        oQueColeta: "Pessoa que revisou esta evidência.",
        quemPreenche: "Equipe (pesquisa, revisão)",
        visibilidade: "interna",
      },
      {
        campo: "reviewed_at",
        oQueColeta: "Data em que a evidência foi revisada.",
        quemPreenche: "Equipe (pesquisa, revisão)",
        visibilidade: "interna",
      },
      {
        campo: "legal_review_status",
        oQueColeta: "Estado da revisão jurídica desta evidência, quando aplicável.",
        quemPreenche: "Equipe jurídica",
        visibilidade: "interna",
      },
      {
        campo: "legal_review_notes_internal",
        oQueColeta: "Notas internas da revisão jurídica, nunca enviadas ao cliente.",
        quemPreenche: "Equipe jurídica",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Biblioteca › Projeções ao App",
    rota: "src/routes/_authenticated/biblioteca-evidencias.$caseId.tsx",
    tabela: "app_projections",
    modulo: "src/lib/biblioteca-evidencias.functions.ts",
    allowlist: "CAMPOS_PROJECAO",
    campos: 14,
    estado: "vivo",
    camposDescritos: [
      {
        campo: "source_entity_type",
        oQueColeta: "Tipo da entidade de origem que gerou esta projeção (ex.: achado, evidência).",
        quemPreenche: "Sistema, ao publicar",
        visibilidade: "interna",
      },
      {
        campo: "source_entity_id",
        oQueColeta: "Identificador da entidade de origem desta projeção.",
        quemPreenche: "Sistema, ao publicar",
        visibilidade: "interna",
      },
      {
        campo: "case_id",
        oQueColeta: "Caso a que esta projeção pertence.",
        quemPreenche: "Sistema, na criação do registro",
        visibilidade: "interna",
      },
      {
        campo: "pessoa_id",
        oQueColeta: "Pessoa a que esta projeção se refere, quando aplicável.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "due_at",
        oQueColeta: "Data prevista de publicação da projeção.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "projection_type",
        oQueColeta: "Tipo de conteúdo projetado ao App (ex.: achado, marco, legado).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "destination",
        oQueColeta: "Aba/destino do App Cliente onde este conteúdo aparece.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "content_sanitized",
        oQueColeta:
          "O texto já sanitizado, aprovado para leitura do cliente — nunca o texto interno bruto.",
        quemPreenche: "Equipe (pesquisa), decisão explícita",
        visibilidade: "cliente",
      },
      {
        campo: "approval_status",
        oQueColeta: "Estado de aprovação desta projeção para publicação.",
        quemPreenche: "Equipe (pesquisa), decisão explícita",
        visibilidade: "interna",
      },
      {
        campo: "approved_by",
        oQueColeta: "Pessoa que aprovou a publicação desta projeção.",
        quemPreenche: "Equipe (pesquisa), decisão explícita",
        visibilidade: "interna",
      },
      {
        campo: "approved_at",
        oQueColeta: "Data em que a projeção foi aprovada para publicação.",
        quemPreenche: "Sistema, ao aprovar",
        visibilidade: "interna",
      },
      {
        campo: "visibility_scope",
        oQueColeta: "Alcance de visibilidade da projeção (ex.: todos os titulares, só um titular).",
        quemPreenche: "Equipe (pesquisa), decisão explícita",
        visibilidade: "interna",
      },
      {
        campo: "effective_from",
        oQueColeta: "Data a partir da qual a projeção fica visível no App.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "titular_client_id",
        oQueColeta:
          "Pessoa (clientes.id) que vê este achado por padrão quando visibility_scope='titular'.",
        quemPreenche: "Equipe (pesquisa), decisão explícita",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Fontes e documentos do caso",
    rota: "src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx",
    tabela: "case_source_documents",
    modulo: "src/lib/fontes-documentos.functions.ts",
    allowlist: "CAMPOS_METADADOS",
    campos: 18,
    estado: "vivo",
    observacao:
      "18 em 04/10: eram 16 — legibilidade e integridade entraram com o checklist de revisão documental.",
    camposDescritos: [
      {
        campo: "tipo_documento",
        oQueColeta: "Tipo do documento de fonte (ex.: certidão, registro paroquial).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "origem_documento",
        oQueColeta: "Origem do documento (ex.: cliente, arquivo público).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "status",
        oQueColeta: "Estado deste documento no fluxo de revisão.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "qualidade_origem",
        oQueColeta: "Qualidade da fonte de origem do documento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "confidencialidade",
        oQueColeta: "Nível de confidencialidade do documento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "pessoa_ref_id",
        oQueColeta: "Pessoa a que este documento se refere.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "pessoa_nao_identificada",
        oQueColeta:
          "Se o documento traz pessoa não identificada (inverso de PESSOA_IDENTIFICAVEL do checklist).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "titulo_interno",
        oQueColeta: "Título interno do documento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "data_documento",
        oQueColeta: "Data do documento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "pais",
        oQueColeta: "País de origem do documento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "estado_provincia",
        oQueColeta: "Estado/província de origem do documento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "cidade",
        oQueColeta: "Cidade de origem do documento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "instituicao_emissora",
        oQueColeta: "Instituição que emitiu o documento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "referencia_origem",
        oQueColeta: "Referência/código de origem do documento na instituição emissora.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "idioma",
        oQueColeta: "Idioma do documento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "observacoes",
        oQueColeta: "Observações internas sobre o documento.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "legibilidade",
        oQueColeta: "Checklist de revisão documental: se o documento está legível (LEGIVEL).",
        quemPreenche: "Equipe (pesquisa, revisão)",
        visibilidade: "interna",
      },
      {
        campo: "integridade",
        oQueColeta:
          "Checklist de revisão documental: se o documento está íntegro (INTEGRO), sem páginas faltantes ou corrompidas.",
        quemPreenche: "Equipe (pesquisa, revisão)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Bases e repositórios (catálogo de fontes)",
    rota: "src/routes/_authenticated/fontes-genealogicas.tsx",
    tabela: "genealogical_sources_catalog",
    modulo: "src/lib/fontes-genealogicas.functions.ts",
    allowlist: "CAMPOS_FONTE",
    campos: 27,
    estado: "vivo",
    observacao:
      "Taxonomia M1–M6 e prontidão de automação. responsavel_validacao tem default institucional (D-05).",
    camposDescritos: [
      {
        campo: "nome",
        oQueColeta: "Nome da fonte/repositório genealógico.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "pais_eixo",
        oQueColeta: "País-eixo a que esta fonte se associa.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "citizenship_track_id",
        oQueColeta: "Trilha de cidadania a que esta fonte serve.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "tipo_de_acervo",
        oQueColeta: "Tipo do acervo (ex.: registro civil, paroquial, militar).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "cobertura_temporal",
        oQueColeta: "Período temporal coberto pela fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "cobertura_geografica",
        oQueColeta: "Cobertura geográfica da fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "nivel_de_fonte",
        oQueColeta: "Nível da fonte na taxonomia M1–M6.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "acesso",
        oQueColeta: "Como se acessa a fonte (ex.: online gratuito, presencial, pago).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "licenca_termos",
        oQueColeta: "Licença/termos de uso da fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "url_referencia_interna",
        oQueColeta: "URL de referência interna da fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "custo",
        oQueColeta: "Custo de acesso à fonte, quando houver.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "autenticacao_necessaria",
        oQueColeta: "Se a fonte exige autenticação/login para acesso.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "trata_dados_pessoais",
        oQueColeta: "Se a fonte trata dados pessoais (relevante para LGPD).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "risco",
        oQueColeta: "Nível de risco associado ao uso desta fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "uso_recomendado",
        oQueColeta: "Recomendação de uso desta fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "prioridade",
        oQueColeta: "Prioridade de uso desta fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "modo_de_uso_permitido",
        oQueColeta: "Modo de uso permitido para esta fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "scraping_status",
        oQueColeta: "Estado de automação/scraping desta fonte, quando aplicável.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "ultima_verificacao",
        oQueColeta: "Data da última verificação de que a fonte ainda está acessível/válida.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "status_documentacao",
        oQueColeta: "Estado de documentação desta fonte no catálogo.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "status_integracao",
        oQueColeta: "Estado de integração técnica desta fonte, quando aplicável.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "proxima_acao",
        oQueColeta: "Próxima ação planejada para esta fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "observacao_risco",
        oQueColeta: "Observação sobre o risco associado a esta fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "responsavel_revisao",
        oQueColeta: "Pessoa responsável por revisar esta fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "estagio_maturidade",
        oQueColeta: "Estágio de maturidade desta fonte no catálogo.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "responsavel_validacao",
        oQueColeta: "Pessoa responsável por validar esta fonte — tem default institucional (D-05).",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "permite_automacao",
        oQueColeta: "Se esta fonte permite automação/scraping.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Bases › Matriz do adendo",
    rota: "src/routes/_authenticated/fontes-genealogicas.tsx",
    tabela: "genealogical_sources_catalog",
    modulo: "src/lib/fontes-genealogicas.functions.ts",
    allowlist: "CAMPOS_MATRIZ",
    campos: 8,
    estado: "vivo",
    camposDescritos: [
      {
        campo: "source_id",
        oQueColeta: "Fonte do catálogo a que esta avaliação se refere.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "criterio",
        oQueColeta: "Critério de avaliação da matriz do adendo.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "nota",
        oQueColeta: "Nota atribuída a este critério.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "parecer_interno",
        oQueColeta: "Parecer interno sobre este critério.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "evidencia_interna",
        oQueColeta: "Evidência interna que sustenta a nota atribuída.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "avaliado_em",
        oQueColeta: "Data em que este critério foi avaliado.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "avaliado_por",
        oQueColeta: "Pessoa que avaliou este critério.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "bloqueante",
        oQueColeta: "Se este critério, reprovado, bloqueia o uso da fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Bases › Backlog de ativação",
    rota: "src/routes/_authenticated/fontes-genealogicas.tsx",
    tabela: "sources_activation_backlog",
    modulo: "src/lib/fontes-genealogicas.functions.ts",
    allowlist: "CAMPOS_BACKLOG",
    campos: 9,
    estado: "vivo",
    observacao: "Sugestão de fonte nova nunca homologa sozinha.",
    camposDescritos: [
      {
        campo: "source_id",
        oQueColeta: "Fonte candidata a ativação no catálogo.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "acao_interna",
        oQueColeta: "Ação interna necessária para ativar esta fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "motivo",
        oQueColeta: "Motivo para sugerir a ativação desta fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "prioridade",
        oQueColeta: "Prioridade de ativação desta fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "status",
        oQueColeta: "Estado do item no backlog de ativação.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "responsavel",
        oQueColeta: "Pessoa responsável por este item do backlog.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "prazo",
        oQueColeta: "Prazo para avançar este item do backlog.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "bloqueio_atual",
        oQueColeta: "Bloqueio atual que impede a ativação desta fonte.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
      {
        campo: "resultado_interno",
        oQueColeta: "Resultado interno da avaliação deste item.",
        quemPreenche: "Equipe (pesquisa)",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Plano de ação de pesquisa",
    rota: "src/routes/_authenticated/plano-acao.$caseId.tsx",
    tabela: "research_action_plan_items",
    modulo: "src/lib/plano-acao-pesquisa.functions.ts",
    allowlist: "CAMPOS_ITEM",
    campos: 25,
    estado: "vivo",
  },
  {
    aba: "Plano de ação › Instituições",
    rota: "src/routes/_authenticated/plano-acao.$caseId.tsx",
    tabela: "research_institutions",
    modulo: "src/lib/plano-acao-pesquisa.functions.ts",
    allowlist: "CAMPOS_INSTITUICAO",
    campos: 14,
    estado: "vivo",
  },
  {
    aba: "Plano de ação › Estimativas",
    rota: "src/routes/_authenticated/plano-acao.$caseId.tsx",
    tabela: "research_cost_estimates",
    modulo: "src/lib/plano-acao-pesquisa.functions.ts",
    allowlist: "CAMPOS_ESTIMATIVA",
    campos: 14,
    estado: "vivo",
  },
  {
    aba: "Relatórios de fase",
    rota: "src/routes/_authenticated/relatorios-fase.$caseId.tsx",
    tabela: "research_reports",
    modulo: "src/lib/relatorios-fase.functions.ts",
    allowlist: "CAMPOS_RELATORIO",
    campos: 17,
    estado: "vivo",
  },
  {
    aba: "Solicitações documentais",
    rota: "src/routes/_authenticated/atendimento.tsx",
    tabela: "portal_document_requests",
    modulo: "src/lib/documentos-solicitacoes.functions.ts",
    allowlist: "CAMPOS_SOLICITACAO",
    campos: 25,
    estado: "vivo",
  },

  /* ------------------------------------------- Formalização & Financeiro */
  {
    aba: "Contrato › dados gerais",
    rota: "src/routes/_authenticated/contratos.$id.tsx",
    tabela: "contracts",
    modulo: "src/lib/contratos.functions.ts",
    allowlist: "CAMPOS_GERAIS",
    campos: 14,
    estado: "vivo",
    camposDescritos: [
      {
        campo: "title",
        oQueColeta: "Nome do instrumento (ex.: Contrato de Estudo Genealógico v2).",
        quemPreenche: "Equipe de contratos",
        visibilidade: "interna",
      },
      {
        campo: "purpose_summary",
        oQueColeta: "Resumo da finalidade do contrato, em texto livre.",
        quemPreenche: "Equipe de contratos",
        visibilidade: "interna",
      },
      {
        campo: "scope_summary",
        oQueColeta: "Resumo do escopo contratado — espelha o escopo aprovado na proposta/OS.",
        quemPreenche: "Equipe de contratos",
        visibilidade: "interna",
      },
      {
        campo: "exclusions_summary",
        oQueColeta: "Serviços excluídos explicitamente do instrumento.",
        quemPreenche: "Equipe de contratos",
        visibilidade: "interna",
      },
      {
        campo: "no_exclusions_confirmed",
        oQueColeta:
          "Confirmação humana de que a ausência de exclusões foi revisada, não é omissão.",
        quemPreenche: "Revisão humana/jurídica",
        visibilidade: "interna",
      },
      {
        campo: "effective_start_date",
        oQueColeta: "Data de início de vigência do instrumento.",
        quemPreenche: "Equipe de contratos",
        visibilidade: "interna",
      },
      {
        campo: "effective_end_date",
        oQueColeta: "Data de fim de vigência, quando houver prazo definido.",
        quemPreenche: "Equipe de contratos",
        visibilidade: "interna",
      },
      {
        campo: "effective_rule",
        oQueColeta: "Regra de vigência em texto (ex.: até conclusão do escopo, prazo fixo).",
        quemPreenche: "Equipe de contratos",
        visibilidade: "interna",
      },
      {
        campo: "privacy_terms_status",
        oQueColeta:
          "Estado dos termos de privacidade: pending | defined | not_applicable (CHECK real).",
        quemPreenche: "Equipe de contratos/jurídico",
        visibilidade: "interna",
      },
      {
        campo: "review_owner_user_id",
        oQueColeta: "Responsável humano pela revisão jurídica deste instrumento.",
        quemPreenche: "Atribuído pela equipe",
        visibilidade: "interna",
      },
      {
        campo: "internal_notes",
        oQueColeta: "Notas internas de equipe — nunca sanitizadas para o cliente.",
        quemPreenche: "Equipe de contratos",
        visibilidade: "interna",
      },
      {
        campo: "base_contract_reference",
        oQueColeta: "Referência ao contrato-base quando este é complemento/aditivo.",
        quemPreenche: "Equipe de contratos",
        visibilidade: "interna",
      },
      {
        campo: "case_id",
        oQueColeta:
          "Vínculo com o caso (crm_casos) — nunca editável livremente, definido na criação.",
        quemPreenche: "Sistema, na criação do instrumento",
        visibilidade: "interna",
      },
      {
        campo: "client_id",
        oQueColeta: "Vínculo com o cliente titular (clientes).",
        quemPreenche: "Sistema, na criação do instrumento",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Contrato › financeiro",
    rota: "src/routes/_authenticated/contratos.$id.tsx",
    tabela: "contracts",
    modulo: "src/lib/contratos.functions.ts",
    allowlist: "CAMPOS_FINANCEIROS",
    campos: 5,
    estado: "vivo",
    observacao:
      "Gate financeiro propaga de conciliarPagamento quando há exatamente um contrato assinado.",
    camposDescritos: [
      {
        campo: "financial_change_status",
        oQueColeta:
          "Se a condição financeira mudou após a aprovação: no_change | pending_review | expressly_changed | not_applicable (CHECK real).",
        quemPreenche: "Financeiro/admin (gate de papel)",
        visibilidade: "interna",
      },
      {
        campo: "external_expense_status",
        oQueColeta:
          "Estado das despesas de terceiros: not_applicable | pending | estimated | approved | client_pays_directly | partially_paid (CHECK real).",
        quemPreenche: "Financeiro/admin",
        visibilidade: "interna",
      },
      {
        campo: "financial_gate_status",
        oQueColeta:
          "Gate que a OS consulta para liberar execução: not_applicable | pending_contract | pending_confirmation | confirmed | blocked | exception_authorized (CHECK real). Propagado automaticamente por conciliarPagamento quando há 1 contrato assinado no caso — não é sempre manual.",
        quemPreenche: "Automático (conciliarPagamento) ou financeiro/admin em exceção",
        visibilidade: "interna",
      },
      {
        campo: "invoice_reference",
        oQueColeta: "Referência da fatura associada a este instrumento.",
        quemPreenche: "Financeiro/admin",
        visibilidade: "interna",
      },
      {
        campo: "payment_reference",
        oQueColeta: "Referência do pagamento confirmado associado.",
        quemPreenche: "Financeiro/admin",
        visibilidade: "interna",
      },
    ],
  },
  {
    aba: "Perfil institucional (contratada)",
    rota: "src/routes/_authenticated/configuracoes.tsx",
    tabela: "institutional_profiles",
    modulo: "src/lib/perfil-institucional.ts",
    allowlist: "CAMPOS_INSTITUCIONAIS_OBRIGATORIOS",
    campos: 10,
    estado: "vivo",
    observacao:
      "Org-wide e versionado. É a contratada e o responsável padrão — nunca se pergunta por caso.",
  },

  /* ------------------------------------------------------------- Operação */
  {
    aba: "Ops › Tarefas",
    rota: "src/routes/_authenticated/ops.tsx",
    tabela: "tarefas",
    modulo: "src/lib/ops.server.ts",
    allowlist: "CAMPOS_TAREFA",
    campos: 9,
    estado: "vivo",
  },
  {
    aba: "Ops › Microentregas",
    rota: "src/routes/_authenticated/ops.tsx",
    tabela: "ops_microentregas",
    modulo: "src/lib/ops.server.ts",
    allowlist: "CAMPOS_MICRO",
    campos: 12,
    estado: "vivo",
    observacao: "Fonte única do D7 (primeira microentrega).",
  },
];

/** Soma dos campos graváveis inventariados. */
export function totalDeCampos(itens: readonly AbaComCampos[] = INVENTARIO_CAMPOS_ABAS): number {
  return itens.reduce((s, i) => s + i.campos, 0);
}

/** Agrupamento por tabela — revela onde o mesmo dado é tocado por duas abas. */
export function abasPorTabela(
  itens: readonly AbaComCampos[] = INVENTARIO_CAMPOS_ABAS,
): Map<string, AbaComCampos[]> {
  const mapa = new Map<string, AbaComCampos[]>();
  for (const i of itens) {
    if (!mapa.has(i.tabela)) mapa.set(i.tabela, []);
    mapa.get(i.tabela)!.push(i);
  }
  return mapa;
}

/**
 * A varredura de máscaras é por campo e vive em outro lugar, de propósito.
 * Esta constante existe para a tabela poder apontar para ela em vez de
 * duplicar o número e divergir.
 */
export const VARREDURA_DE_MASCARAS = {
  teste: "src/lib/__tests__/cobertura-mascaras-todas-as-abas-2026-10-03.test.ts",
  cobertura: "26 de 26 campos de dado pessoal em todo o src",
  regra:
    "o teste enumera os campos a cada execução e falha se alguém acrescentar campo de pessoa sem validador",
} as const;
