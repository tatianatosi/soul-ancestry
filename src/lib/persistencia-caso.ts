/**
 * ANA-SAVE-SEC-01 — mapa formal de persistência da Aba Casos.
 *
 * Cada campo editável da tela declara entidade, tabela, coluna, tipo, validação,
 * permissão, payload, estado de implementação e o erro esperado quando o campo
 * não estiver mapeado. O documento em
 * docs/seguranca/MAPA_PERSISTENCIA_ABA_CASOS_v1.0.md é gerado a partir daqui.
 */

export type EstadoImplementacao = "implementado" | "somente_leitura" | "nao_mapeado";

export type LinhaPersistencia = {
  campoUi: string;
  entidade: string;
  tabela: string;
  coluna: string;
  tipo: string;
  validacao: string;
  permissao: string;
  payload: string;
  estado: EstadoImplementacao;
  erroEsperado: string;
};

const ERRO_NAO_MAPEADO = "CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA";
const ERRO_SEM_PAPEL = "Nada foi gravado: seu papel não permite editar este registro.";
const ERRO_DIVERGENCIA = "DIVERGENCIA_PERSISTENCIA";
const ERRO_SOMENTE_LEITURA = ERRO_NAO_MAPEADO;

const escrita = "papel de escrita (admin, operações, pesquisador, comercial, financeiro) + RLS por organização";
const leitura = "somente leitura na interface; gravação bloqueada no servidor";

function caso(
  campoUi: string,
  coluna: string,
  tipo: string,
  validacao: string,
  estado: EstadoImplementacao = "implementado",
): LinhaPersistencia {
  return {
    campoUi,
    entidade: "Caso",
    tabela: "crm_casos",
    coluna,
    tipo,
    validacao,
    permissao: estado === "somente_leitura" ? leitura : escrita,
    payload: `atualizarRegistro { entidade: "crm_casos", id, dados: { ${coluna} } }`,
    estado,
    erroEsperado: estado === "somente_leitura" ? ERRO_SOMENTE_LEITURA : ERRO_NAO_MAPEADO,
  };
}

function pessoa(campoUi: string, coluna: string, tipo: string, validacao: string): LinhaPersistencia {
  return {
    campoUi,
    entidade: "Pessoa do caso",
    tabela: "case_members",
    coluna,
    tipo,
    validacao,
    permissao: escrita,
    payload: `atualizarRegistro { entidade: "case_members", id, dados: { ${coluna} } }`,
    estado: "implementado",
    erroEsperado: ERRO_NAO_MAPEADO,
  };
}

export const MAPA_PERSISTENCIA: LinhaPersistencia[] = [
  /* --- Subaba Caso --- */
  caso("Título do caso", "titulo", "text", "obrigatório; string vazia não sobrescreve"),
  caso("Identificador canônico", "codigo", "text", "gerado pelo servidor (G-01); imutável", "somente_leitura"),
  caso("Modelo do identificador", "modelo", "text", "derivado do identificador canônico", "somente_leitura"),
  caso("Identificadores históricos", "—", "case_aliases", "histórico imutável, nunca vira chave", "somente_leitura"),
  caso("Data de entrada do caso", "data_entrada_caso", "date", "data ISO; vazio grava null"),
  caso("Trilha de cidadania", "citizenship_track_id", "uuid", "precisa de UUID existente, nunca texto livre"),
  caso("Responsável principal", "responsavel_principal", "text", "obrigatório para registrar próxima ação"),
  caso("Cargo do responsável", "cargo_responsavel_principal", "text", "livre"),
  caso("Supervisora do caso", "supervisora_do_caso", "text", "livre"),
  caso("Colaboradores do caso", "colaboradores_do_caso", "text[]", "lista; vazio grava lista vazia"),
  caso("Próxima ação", "proxima_acao_codigo", "text", "lista controlada PROXIMAS_ACOES"),
  caso("Justificativa da próxima ação", "proxima_acao_justificativa", "text", "obrigatória quando a ação é 'Outro'"),
  caso("Origem do brief", "origem_brief", "text", "lista controlada ORIGEM_BRIEF"),
  caso("Link de origem interna", "link_origem_interna", "text", "uso interno"),
  caso("Resumo interno", "resumo_interno", "text", "interno; nunca exposto ao cliente"),
  caso("Brief interno", "brief_interno", "text", "interno; nunca exposto ao cliente"),

  /* --- Subaba Comercial e formalização --- */
  caso("Etapa comercial", "eixo_comercial", "text", "lista controlada EIXO_COMERCIAL"),
  caso("Data da confirmação formal da proposta", "data_confirmacao_formal_proposta", "date", "data ISO"),
  caso("Etapa de formalização", "eixo_formalizacao", "text", "transição avaliada por gate no servidor (exigirGate)"),
  caso("Referência interna da proposta", "proposta_referencia_interna", "text", "livre"),
  caso("Data da proposta", "data_proposta", "date", "data ISO"),
  caso("Link interno da proposta", "proposta_url_interna", "text", "livre"),
  caso("Condição comercial interna", "condicao_comercial_interna_pendente", "boolean", "booleano; não aceita vazio"),
  caso("Escopo incluído (resumo)", "escopo_incluido_resumido", "text", "resumo interno"),
  caso("Escopo excluído (resumo)", "escopo_excluido_resumido", "text", "resumo interno"),

  /* --- Subaba Técnico e riscos --- */
  caso("País da linha prioritária", "pais_linha_prioritaria", "text", "lista controlada PAISES_LINHA"),
  caso("Via jurídica preliminar", "via_juridica_preliminar", "text", "lista controlada; sugestão nunca é conclusão"),
  caso("Status da via", "status_via", "text", "lista controlada STATUS_VIA"),
  caso("Revisão humana jurídica", "revisao_humana_juridica", "text", "lista controlada REVISAO_JURIDICA"),
  caso("Status do radar", "status_radar", "text", "lista controlada STATUS_RADAR"),
  caso("Aderência (%)", "radar_aderencia_percentual", "numeric", "número 0–100 revisado internamente"),
  caso("Hipótese de trabalho interna", "hipotese_trabalho_interna", "text", "interna e provisória"),
  caso("Riscos identificados", "riscos_identificados", "text[]", "lista controlada acumulável"),

  /* --- Subaba Próxima ação e alertas --- */
  caso("Prazo da próxima ação", "prazo_proxima_acao", "date", "obrigatório para registrar (PRAZO_OBRIGATORIO)"),
  caso("Público-alvo", "target_audience", "text", "obrigatório (PUBLICO_OBRIGATORIO)"),
  caso("Visibilidade", "visibility", "text", "obrigatória; incompatível com público externo + internal_only"),
  caso("Canal sugerido", "suggested_channel", "text", "obrigatório (CANAL_OBRIGATORIO)"),
  caso("Aprovação humana exigida", "requires_human_approval", "boolean", "obrigatória quando o canal é externo"),
  {
    campoUi: "Status do alerta interno",
    entidade: "Alerta do caso",
    tabela: "case_alerts",
    coluna: "status, acknowledged_at, acknowledged_by, completed_at, updated_by",
    tipo: "text + timestamptz + uuid",
    validacao: "status em pending/alerted/acknowledged/completed/overdue",
    permissao: escrita,
    payload: 'atualizarAlerta { id, status }',
    estado: "implementado",
    erroEsperado: ERRO_DIVERGENCIA,
  },
  {
    campoUi: "Texto do rascunho de comunicação",
    entidade: "Rascunho de comunicação",
    tabela: "communication_queue",
    coluna: "corpo_rascunho, status, approved_at, approved_by, updated_by",
    tipo: "text + timestamptz + uuid",
    validacao: "aprovação é registro interno; nenhum envio externo é executado",
    permissao: escrita,
    payload: "aprovarRascunho { id, corpo }",
    estado: "implementado",
    erroEsperado: ERRO_DIVERGENCIA,
  },

  /* --- Subaba Etiquetas --- */
  {
    campoUi: "Etiqueta aplicada",
    entidade: "Etiqueta do caso",
    tabela: "entity_labels",
    coluna: "label_id, entity_type, entity_id, applied_by, removed_at, removed_by, updated_by",
    tipo: "uuid + text + timestamptz",
    validacao: "somente etiqueta existente em label_taxonomy da organização",
    permissao: escrita,
    payload: "aplicarEtiqueta / removerEtiqueta",
    estado: "implementado",
    erroEsperado: "Etiqueta fora da taxonomia canônica.",
  },

  /* --- Subaba Onboarding --- */
  {
    campoUi: "Status e observação do item de onboarding",
    entidade: "Item de onboarding",
    tabela: "onboarding_checklist",
    coluna: "status, observacao, concluido_em, concluido_por, updated_by",
    tipo: "text + timestamptz + uuid",
    validacao: "item obrigatório marcado como não aplicável exige observação; liberação passa por gate",
    permissao: escrita,
    payload: "atualizarItemOnboarding { id, status, observacao }",
    estado: "implementado",
    erroEsperado: ERRO_DIVERGENCIA,
  },

  /* --- Subaba Produto e trilha --- */
  {
    campoUi: "Produto-pai, trilha e escopo do serviço",
    entidade: "Serviço do caso",
    tabela: "case_services",
    coluna: "product_catalog_id, citizenship_track_id, escopo_*, preco_acordado (derivado)",
    tipo: "uuid + text + numeric",
    validacao: "preço vem sempre do catálogo homologado, nunca da tela",
    permissao: escrita,
    payload: "salvarCaseService { caseId, id?, dados }",
    estado: "implementado",
    erroEsperado: ERRO_SEM_PAPEL,
  },

  /* --- Subaba Pessoas --- */
  pessoa("Papel no caso", "papel_no_caso", "text", "lista controlada PAPEIS_PESSOA"),
  pessoa("Status cadastral", "status_cadastral", "text", "lista controlada; vazio não sobrescreve"),
  pessoa("Parentesco", "parentesco", "text", "livre"),
  pessoa("Data de nascimento", "data_nascimento", "date", "menor de idade nunca é signatário"),
  pessoa("Local de nascimento", "local_nascimento", "text", "livre"),
  pessoa("Representante legal", "representante_legal", "text", "obrigatório para dependente menor"),
  pessoa("CPF", "cpf", "text", "dado sensível — mascarado na auditoria"),
  pessoa("RG / documento", "rg", "text", "dado sensível — mascarado na auditoria"),
  pessoa("Estado civil", "estado_civil", "text", "livre"),
  pessoa("Profissão", "profissao", "text", "livre"),
  pessoa("Telefone", "telefone", "text", "dado sensível — mascarado na auditoria"),
  pessoa("E-mail", "email", "text", "dado sensível — mascarado na auditoria"),
  pessoa("Endereço", "endereco", "text", "dado sensível — mascarado na auditoria"),
  pessoa("CEP", "cep", "text", "livre"),
  pessoa("Documentos pendentes", "documentos_pendentes", "text", "livre"),
  pessoa("Consentimentos", "consentimentos", "text", "referência ao consentimento registrado"),

  /* --- Origem do dado --- */
  {
    campoUi: "Origem do dado (real / demonstração)",
    entidade: "Caso",
    tabela: "crm_casos",
    coluna: "data_origin, demo",
    tipo: "text + boolean",
    validacao: "real | fixture_demo | importado | migrado; fixture força demo = true (trigger trg_data_origin)",
    permissao: "somente servidor; a interface apenas exibe o rótulo",
    payload: "—",
    estado: "somente_leitura",
    erroEsperado: ERRO_SOMENTE_LEITURA,
  },
];

export function linhasPorTabela(tabela: string): LinhaPersistencia[] {
  return MAPA_PERSISTENCIA.filter((l) => l.tabela === tabela);
}

export function campoMapeado(tabela: string, coluna: string): boolean {
  return MAPA_PERSISTENCIA.some((l) => l.tabela === tabela && l.coluna.split(", ").includes(coluna));
}

/** Markdown do mapa formal (fonte do documento em docs/seguranca). */
export function mapaEmMarkdown(): string {
  const cabecalho =
    "| Campo UI | Entidade | Tabela | Coluna | Tipo | Validação | Permissão | Payload | Estado | Erro esperado |\n" +
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |";
  const linhas = MAPA_PERSISTENCIA.map(
    (l) =>
      `| ${l.campoUi} | ${l.entidade} | ${l.tabela} | ${l.coluna} | ${l.tipo} | ${l.validacao} | ${l.permissao} | ${l.payload} | ${l.estado} | ${l.erroEsperado} |`,
  );
  return [cabecalho, ...linhas].join("\n");
}
