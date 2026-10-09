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
    observacao: "Maior cadastro do Desk. A mesma allowlist serve /calls (roteiro SPIN) e /leads (pipeline).",
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
    observacao: "Dono canônico de identidade, contato e documentos civis. As outras abas leem daqui.",
    camposDescritos: [
      { campo: "nome", oQueColeta: "Nome civil completo — usado por contrato, núcleo e caso ao reconciliar a mesma pessoa.", quemPreenche: "Equipe (cadastro/Discovery)", visibilidade: "cliente" },
      { campo: "nome_social", oQueColeta: "Nome social, quando diferente do civil.", quemPreenche: "Equipe, a pedido da pessoa", visibilidade: "cliente" },
      { campo: "email", oQueColeta: "E-mail de contato para comunicação e acesso ao portal.", quemPreenche: "Equipe (cadastro/Discovery)", visibilidade: "cliente" },
      { campo: "telefone", oQueColeta: "Telefone de contato geral.", quemPreenche: "Equipe (cadastro/Discovery)", visibilidade: "cliente" },
      { campo: "telefone_whatsapp", oQueColeta: "WhatsApp — usado pela Mesa Discovery/varredura de conversa.", quemPreenche: "Equipe (cadastro/Discovery)", visibilidade: "cliente" },
      { campo: "sexo", oQueColeta: "Sexo registrado, para documentos civis e certidões.", quemPreenche: "Equipe (cadastro)", visibilidade: "cliente" },
      { campo: "nacionalidade", oQueColeta: "Nacionalidade atual da pessoa (não confundir com país de interesse do caso).", quemPreenche: "Equipe (cadastro)", visibilidade: "cliente" },
      { campo: "profissao", oQueColeta: "Profissão declarada.", quemPreenche: "Equipe (cadastro)", visibilidade: "cliente" },
      { campo: "cpf", oQueColeta: "CPF — campo mascarado e validado (validacao-pessoa.ts); reconciliado com case_members/contract_parties sem sobrescrever divergência.", quemPreenche: "Equipe (cadastro)", visibilidade: "interna" },
      { campo: "rg_numero", oQueColeta: "Número do RG, documento civil complementar ao CPF.", quemPreenche: "Equipe (cadastro)", visibilidade: "interna" },
      { campo: "rg_orgao_uf", oQueColeta: "Órgão expedidor e UF do RG.", quemPreenche: "Equipe (cadastro)", visibilidade: "interna" },
      { campo: "endereco_logradouro", oQueColeta: "Logradouro do endereço civil.", quemPreenche: "Equipe (cadastro)", visibilidade: "cliente" },
      { campo: "endereco_numero", oQueColeta: "Número do endereço civil.", quemPreenche: "Equipe (cadastro)", visibilidade: "cliente" },
      { campo: "endereco_complemento", oQueColeta: "Complemento do endereço civil.", quemPreenche: "Equipe (cadastro)", visibilidade: "cliente" },
      { campo: "endereco_bairro", oQueColeta: "Bairro do endereço civil.", quemPreenche: "Equipe (cadastro)", visibilidade: "cliente" },
      { campo: "endereco_cidade", oQueColeta: "Cidade do endereço civil.", quemPreenche: "Equipe (cadastro)", visibilidade: "cliente" },
      { campo: "endereco_uf", oQueColeta: "UF do endereço civil.", quemPreenche: "Equipe (cadastro)", visibilidade: "cliente" },
      { campo: "endereco_cep", oQueColeta: "CEP — campo mascarado e validado.", quemPreenche: "Equipe (cadastro)", visibilidade: "cliente" },
      { campo: "endereco_pais", oQueColeta: "País do endereço civil.", quemPreenche: "Equipe (cadastro)", visibilidade: "cliente" },
      { campo: "estado_civil", oQueColeta: "Estado civil declarado — relevante para certidões e representação.", quemPreenche: "Equipe (cadastro)", visibilidade: "interna" },
      { campo: "nome_conjuge", oQueColeta: "Nome do cônjuge, quando aplicável.", quemPreenche: "Equipe (cadastro)", visibilidade: "interna" },
      { campo: "data_nascimento", oQueColeta: "Data de nascimento — mascarada/validada, recusa data futura.", quemPreenche: "Equipe (cadastro)", visibilidade: "cliente" },
      { campo: "nome_pai", oQueColeta: "Nome do pai — usado na cadeia de linhagem/filiação.", quemPreenche: "Equipe (cadastro/pesquisa)", visibilidade: "interna" },
      { campo: "nome_mae", oQueColeta: "Nome da mãe — usado na cadeia de linhagem/filiação.", quemPreenche: "Equipe (cadastro/pesquisa)", visibilidade: "interna" },
      { campo: "cidade_nascimento", oQueColeta: "Cidade de nascimento — alimenta a Ficha Genealógica.", quemPreenche: "Equipe (cadastro/pesquisa)", visibilidade: "interna" },
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
    observacao: "Edição pontual: não toca plano_hash/versão. Produto-pai, rota, etapa, marco, responsável, próxima ação e prazo.",
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
  },
  {
    aba: "Ficha genealógica › Variantes de nome",
    rota: "src/routes/_authenticated/pessoas-linhagens.$caseId.tsx",
    tabela: "name_variants",
    modulo: "src/lib/pessoas-linhagens.functions.ts",
    allowlist: "CAMPOS_VARIANTE",
    campos: 10,
    estado: "vivo",
  },
  {
    aba: "Ficha genealógica › Relações",
    rota: "src/routes/_authenticated/pessoas-linhagens.$caseId.tsx",
    tabela: "genealogical_relationships",
    modulo: "src/lib/pessoas-linhagens.functions.ts",
    allowlist: "CAMPOS_RELACAO",
    campos: 12,
    estado: "vivo",
    observacao: "Zero linhas no caso da Ana — a árvore dela não tem vínculo gravado ainda.",
  },
  {
    aba: "Ficha genealógica › Eventos",
    rota: "src/routes/_authenticated/pessoas-linhagens.$caseId.tsx",
    tabela: "genealogical_events",
    modulo: "src/lib/pessoas-linhagens.functions.ts",
    allowlist: "CAMPOS_EVENTO",
    campos: 15,
    estado: "vivo",
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
  },
  {
    aba: "Ficha genealógica › Módulos históricos",
    rota: "src/routes/_authenticated/pessoas-linhagens.$caseId.tsx",
    tabela: "genealogical_modules",
    modulo: "src/lib/pessoas-linhagens.functions.ts",
    allowlist: "CAMPOS_MODULO",
    campos: 17,
    estado: "vivo",
    observacao: "Aqui client_visibility='aprovada' EXIGE status_verificacao='confirmado' — regra que não vale para a árvore de pessoas.",
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
  },
  {
    aba: "Pesquisa › Hipóteses",
    rota: "src/routes/_authenticated/pesquisa-modulo.$id.tsx",
    tabela: "research_case_hypotheses",
    modulo: "src/lib/pesquisa.server.ts",
    allowlist: "CAMPOS_HIPOTESE",
    campos: 7,
    estado: "vivo",
    observacao: "Criação na tabela legada research_hypotheses foi recusada em 24/09; aqui é o lugar.",
  },
  {
    aba: "Pesquisa › Evidências",
    rota: "src/routes/_authenticated/pesquisa-modulo.$id.tsx",
    tabela: "research_evidence_items",
    modulo: "src/lib/pesquisa.server.ts",
    allowlist: "CAMPOS_EVIDENCIA",
    campos: 20,
    estado: "vivo",
  },
  {
    aba: "Pesquisa › Eventos",
    rota: "src/routes/_authenticated/pesquisa-modulo.$id.tsx",
    tabela: "research_case_events",
    modulo: "src/lib/pesquisa.server.ts",
    allowlist: "CAMPOS_EVENTO",
    campos: 11,
    estado: "vivo",
  },
  {
    aba: "Pesquisa › Pendências",
    rota: "src/routes/_authenticated/pesquisa-modulo.$id.tsx",
    tabela: "research_pending_items",
    modulo: "src/lib/pesquisa.server.ts",
    allowlist: "CAMPOS_PENDENCIA",
    campos: 8,
    estado: "vivo",
    observacao: "Destino natural de cada item de checklist de dossiê (título, severidade, prazo, status).",
  },
  {
    aba: "Achados genealógicos",
    rota: "src/routes/_authenticated/achados.$caseId.tsx",
    tabela: "genealogical_findings",
    modulo: "src/lib/achados-genealogicos.functions.ts",
    allowlist: "CAMPOS_ACHADO",
    campos: 28,
    estado: "vivo",
  },
  {
    aba: "Achados › Encontros de linha",
    rota: "src/routes/_authenticated/achados.$caseId.tsx",
    tabela: "lineage_encounters",
    modulo: "src/lib/achados-genealogicos.functions.ts",
    allowlist: "CAMPOS_ENCONTRO",
    campos: 26,
    estado: "vivo",
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
  },
  {
    aba: "Biblioteca › Projeções ao App",
    rota: "src/routes/_authenticated/biblioteca-evidencias.$caseId.tsx",
    tabela: "app_projections",
    modulo: "src/lib/biblioteca-evidencias.functions.ts",
    allowlist: "CAMPOS_PROJECAO",
    campos: 14,
    estado: "vivo",
  },
  {
    aba: "Fontes e documentos do caso",
    rota: "src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx",
    tabela: "case_source_documents",
    modulo: "src/lib/fontes-documentos.functions.ts",
    allowlist: "CAMPOS_METADADOS",
    campos: 18,
    estado: "vivo",
    observacao: "18 em 04/10: eram 16 — legibilidade e integridade entraram com o checklist de revisão documental.",
  },
  {
    aba: "Bases e repositórios (catálogo de fontes)",
    rota: "src/routes/_authenticated/fontes-genealogicas.tsx",
    tabela: "genealogical_sources_catalog",
    modulo: "src/lib/fontes-genealogicas.functions.ts",
    allowlist: "CAMPOS_FONTE",
    campos: 27,
    estado: "vivo",
    observacao: "Taxonomia M1–M6 e prontidão de automação. responsavel_validacao tem default institucional (D-05).",
  },
  {
    aba: "Bases › Matriz do adendo",
    rota: "src/routes/_authenticated/fontes-genealogicas.tsx",
    tabela: "genealogical_sources_catalog",
    modulo: "src/lib/fontes-genealogicas.functions.ts",
    allowlist: "CAMPOS_MATRIZ",
    campos: 8,
    estado: "vivo",
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
      { campo: "title", oQueColeta: "Nome do instrumento (ex.: Contrato de Estudo Genealógico v2).", quemPreenche: "Equipe de contratos", visibilidade: "interna" },
      { campo: "purpose_summary", oQueColeta: "Resumo da finalidade do contrato, em texto livre.", quemPreenche: "Equipe de contratos", visibilidade: "interna" },
      { campo: "scope_summary", oQueColeta: "Resumo do escopo contratado — espelha o escopo aprovado na proposta/OS.", quemPreenche: "Equipe de contratos", visibilidade: "interna" },
      { campo: "exclusions_summary", oQueColeta: "Serviços excluídos explicitamente do instrumento.", quemPreenche: "Equipe de contratos", visibilidade: "interna" },
      { campo: "no_exclusions_confirmed", oQueColeta: "Confirmação humana de que a ausência de exclusões foi revisada, não é omissão.", quemPreenche: "Revisão humana/jurídica", visibilidade: "interna" },
      { campo: "effective_start_date", oQueColeta: "Data de início de vigência do instrumento.", quemPreenche: "Equipe de contratos", visibilidade: "interna" },
      { campo: "effective_end_date", oQueColeta: "Data de fim de vigência, quando houver prazo definido.", quemPreenche: "Equipe de contratos", visibilidade: "interna" },
      { campo: "effective_rule", oQueColeta: "Regra de vigência em texto (ex.: até conclusão do escopo, prazo fixo).", quemPreenche: "Equipe de contratos", visibilidade: "interna" },
      { campo: "privacy_terms_status", oQueColeta: "Estado dos termos de privacidade: pending | defined | not_applicable (CHECK real).", quemPreenche: "Equipe de contratos/jurídico", visibilidade: "interna" },
      { campo: "review_owner_user_id", oQueColeta: "Responsável humano pela revisão jurídica deste instrumento.", quemPreenche: "Atribuído pela equipe", visibilidade: "interna" },
      { campo: "internal_notes", oQueColeta: "Notas internas de equipe — nunca sanitizadas para o cliente.", quemPreenche: "Equipe de contratos", visibilidade: "interna" },
      { campo: "base_contract_reference", oQueColeta: "Referência ao contrato-base quando este é complemento/aditivo.", quemPreenche: "Equipe de contratos", visibilidade: "interna" },
      { campo: "case_id", oQueColeta: "Vínculo com o caso (crm_casos) — nunca editável livremente, definido na criação.", quemPreenche: "Sistema, na criação do instrumento", visibilidade: "interna" },
      { campo: "client_id", oQueColeta: "Vínculo com o cliente titular (clientes).", quemPreenche: "Sistema, na criação do instrumento", visibilidade: "interna" },
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
    observacao: "Gate financeiro propaga de conciliarPagamento quando há exatamente um contrato assinado.",
    camposDescritos: [
      { campo: "financial_change_status", oQueColeta: "Se a condição financeira mudou após a aprovação: no_change | pending_review | expressly_changed | not_applicable (CHECK real).", quemPreenche: "Financeiro/admin (gate de papel)", visibilidade: "interna" },
      { campo: "external_expense_status", oQueColeta: "Estado das despesas de terceiros: not_applicable | pending | estimated | approved | client_pays_directly | partially_paid (CHECK real).", quemPreenche: "Financeiro/admin", visibilidade: "interna" },
      { campo: "financial_gate_status", oQueColeta: "Gate que a OS consulta para liberar execução: not_applicable | pending_contract | pending_confirmation | confirmed | blocked | exception_authorized (CHECK real). Propagado automaticamente por conciliarPagamento quando há 1 contrato assinado no caso — não é sempre manual.", quemPreenche: "Automático (conciliarPagamento) ou financeiro/admin em exceção", visibilidade: "interna" },
      { campo: "invoice_reference", oQueColeta: "Referência da fatura associada a este instrumento.", quemPreenche: "Financeiro/admin", visibilidade: "interna" },
      { campo: "payment_reference", oQueColeta: "Referência do pagamento confirmado associado.", quemPreenche: "Financeiro/admin", visibilidade: "interna" },
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
    observacao: "Org-wide e versionado. É a contratada e o responsável padrão — nunca se pergunta por caso.",
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
export function abasPorTabela(itens: readonly AbaComCampos[] = INVENTARIO_CAMPOS_ABAS): Map<string, AbaComCampos[]> {
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
  regra: "o teste enumera os campos a cada execução e falha se alguém acrescentar campo de pessoa sem validador",
} as const;
