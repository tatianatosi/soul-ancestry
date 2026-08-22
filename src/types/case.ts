/**
 * Clube Ancestral — tipagem do modelo reutilizável de casos.
 *
 * COMO CADASTRAR O PRÓXIMO CASO (nota interna):
 * 1. Duplique `src/data/caseTemplate.ts` como `src/data/caseData<Nome>.ts`.
 * 2. Preencha apenas os campos conhecidos — campos vazios são ocultados na interface.
 * 3. Em `src/data/activeCase.ts` troque a linha final por:
 *      export const activeCase = caseData<Nome>;
 * Nenhum componente visual precisa ser alterado.
 */

export type StatusCaso = "novo" | "em_leitura" | "em_documentos" | "em_upgrade";

export type EvidenceStatus =
  | "confirmado_documentalmente"
  | "referencia_localizada"
  | "relato_familiar"
  | "pendente_validacao";

export type NivelAlerta = "informativo" | "atencao" | "critico";

export type PessoaBase = {
  nome: string;
  nascimento?: string;
  falecimento?: string;
  observacoes?: string;
  /** Observação curta de validação (exibida como nota da pessoa). */
  observacao?: string;
  batismo?: string;
  sepultamento?: string;
  local_relevante?: string;
  ocupacao?: string;
  origem_hipotese?: string;
  variantes_nome?: string[];
  familysearch_id?: string;
  familysearch_url?: string;
  status_evidencia: EvidenceStatus;
};

/** Estados operacionais de uma procuração (uso interno). */
export type StatusProcuracao =
  | "nao_iniciada"
  | "rascunho_em_preparacao"
  | "aguardando_revisao_interna"
  | "aguardando_assinatura_cliente"
  | "assinada"
  | "enviada"
  | "respondida";

export type Procuracao = {
  status: StatusProcuracao;
  finalidade: string;
  data_assinatura: string;
  data_envio: string;
  observacao: string;
};

export type CaseProcuracoes = {
  portugues: Procuracao;
  italiano: Procuracao;
};

export type StatusContrato = "aguardando_confirmacao" | "confirmado" | "nao_aplicavel";

export type ItemChecklist = { item: string; feito: boolean };

export type CaseContrato = {
  produto_sku: string;
  produto_nome: string;
  status: StatusContrato;
  arquivo_url: string;
  proposta_final_url: string;
  data_assinatura: string;
  pagamento_status: StatusContrato;
  observacao: string;
  /** Checklist "Formalização e contrato" (operacional, visão interna). */
  checklist: ItemChecklist[];
};

export type CaseGeral = {
  case_id: string;
  case_nome: string;
  cliente_nome: string;
  cliente_nome_exibicao: string;
  ano_nascimento_cliente: number | null;
  cidade_cliente: string;
  estado_cliente: string;
  status_caso: StatusCaso;
  produto_atual: string;
  data_abertura: string;
  ultima_atualizacao: string;
};

export type CaseCliente = {
  nome_completo: string;
  ano_nascimento: number | null;
  municipio_nascimento: string;
  estado_nascimento: string;
  estado_civil: string;
  possui_filhos: boolean | null;
  endereco_resumido: string;
  email: string;
  telefone: string;
};

export type CaseFamiliaDireta = {
  pai: PessoaBase;
  mae: PessoaBase;
  avo_paterno: PessoaBase;
  avo_paterna: PessoaBase;
  bisavo_paterno: PessoaBase;
  bisavo_paterna: PessoaBase;
  avo_materno: PessoaBase;
  avo_materna: PessoaBase;
  /** Geração anterior ao bisavô paterno (exibida na árvore expandida). */
  pai_de_alessandro?: PessoaBase;
};

export type CaseArvore = {
  linha_prioritaria: string;
  pessoas_conectadas: number;
  geracoes_lidas: number;
  conexao_chave: string;
  conexao_territorial: string;
  lacuna_critica: string;
  pessoas_colaterais: string[];
};

export type CaseRota = {
  pais_principal: string;
  aderencia_principal: number | null;
  pais_secundario: string;
  aderencia_secundaria: number | null;
  pais_terciario: string;
  aderencia_terciaria: number | null;
  hipotese_principal: string;
  status_hipotese: EvidenceStatus;
  resumo_radar: string;
  /** Hipótese de caminho técnico — muda apenas a redação cliente-facing. */
  via_provavel?: "administrativa" | "judicial";
};

export type CaseJornada = {
  etapa_atual: string;
  contexto_resumo: string;
  trilha_origem: string;
  trilha_cidadania: string;
  trilha_memoria: string;
  jornada_ancestral_1: string;
  jornada_cliente_1: string;
  jornada_intersecao_1: string;
  jornada_intersecao_2: string;
};

export type CaseDescoberta = {
  titulo: string;
  texto: string;
  pessoa_relacionada: string;
  tipo_evidencia: EvidenceStatus;
  destaque: boolean;
  data: string;
  /** Projeção autorizada (Legado): origem, autorização e publicação. */
  origem?: "app_projection" | "client_deliverable";
  autorizado?: boolean;
  publicado?: boolean;
};

export type CaseDocumentos = {
  documento_principal: string;
  pendencia_principal: string;
  status_documental: string;
  documentos_localizados: string[];
  documentos_pendentes: string[];
  proximas_solicitacoes: string[];
  /** Opcional — itens já enviados e em conferência interna. */
  documentos_em_validacao?: string[];
};

export type CaseFontes = {
  base_1_url: string;
  base_2_url: string;
  base_3_url: string;
  links_extras: string[];
  pasta_documentos_url: string;
  pasta_imagens_url: string;
};

export type CaseAlerta = {
  titulo: string;
  texto: string;
  nivel: NivelAlerta;
  ativo: boolean;
};

export type CaseConta = {
  produto_atual: string;
  status_jornada: string;
  ultima_atualizacao: string;
  historico: string[];
  texto_upgrade: string;
};

export type CaseGovernanca = {
  responsavel_caso: string;
  observacoes_internas: string;
  dados_sensiveis_ocultos: boolean;
  regra_input_output: string;
};

export type CaseData = {
  geral: CaseGeral;
  cliente: CaseCliente;
  familia_direta: CaseFamiliaDireta;
  arvore: CaseArvore;
  rota: CaseRota;
  jornada: CaseJornada;
  descobertas: CaseDescoberta[];
  documentos: CaseDocumentos;
  fontes: CaseFontes;
  alerta: CaseAlerta;
  conta: CaseConta;
  governanca: CaseGovernanca;
  /** Estados operacionais de procuração (visão interna). */
  procuracoes?: CaseProcuracoes;
  /** Contrato e formalização do caso (visão interna). */
  contrato?: CaseContrato;
  /** Kit contratual: contrato-base, OS, despesas, autorizações e escopo. */
  contratacao?: CaseContratacao;
};

/* ---------------- Kit contratual ---------------- */

export type StatusContratoBase = "nao_enviado" | "aguardando_aceite" | "aceito" | "arquivado";

export type StatusOrdemServico =
  | "nao_criada"
  | "rascunho"
  | "aguardando_aceite"
  | "aceita"
  | "arquivada";

export type StatusDespesas =
  | "nao_aplicavel"
  | "estimativa"
  | "incluida_no_orcamento"
  | "antecipada_pelo_clube"
  | "aguardando_comprovante"
  | "ajuste_pendente"
  | "aprovada_pela_cliente"
  | "reembolsada";

export type PoliticaDespesas =
  | "nao_definida"
  | "incluida_no_orcamento"
  | "antecipacao_parcial_pelo_clube"
  | "antecipacao_total_pelo_clube"
  | "pagamento_direto_pela_cliente";

export type ContratoBase = {
  versao: string;
  status: StatusContratoBase;
  data_aceite: string;
  documento_disponivel: boolean;
  /** Só é usado quando `documento_disponivel = true`. */
  secure_url: string;
};

export type OrdemServico = {
  status: StatusOrdemServico;
  case_id: string;
  produto_sku: string;
  produto_nome: string;
  escopo_resumo: string;
  etapa_inicial: string;
  entregaveis: string[];
  modalidade_escolhida: string;
  valor_contratado: string;
  meio_pagamento: string;
  parcelas_ou_recorrencia: string;
  primeiro_vencimento: string;
  proximo_vencimento: string;
  documento_disponivel: boolean;
  secure_url: string;
};

export type DespesaItem = {
  item: string;
  finalidade: string;
  estimativa: string;
  valor_real: string;
  status: StatusDespesas;
  aprovacao: string;
  comprovante: boolean;
  reembolso: string;
};

export type DespesasExternas = {
  politica: PoliticaDespesas;
  descricao_cliente: string;
  status: StatusDespesas;
  valor_estimado_total: string;
  valor_real_confirmado: string;
  saldo_ajuste: string;
  requer_aprovacao_para_excedente: boolean;
  itens: DespesaItem[];
  comprovantes_disponiveis: boolean;
  secure_url: string;
};

export type AutorizacaoPesquisa = {
  finalidade: string;
  orgao_destinatario: string;
  pessoas_relacionadas: string[];
  documentos_solicitados: string[];
  teto_valor: string;
  prazo: string;
  status: StatusProcuracao;
  aceite: string;
};

export type ProcuracaoDocumento = {
  status: StatusProcuracao;
  finalidade: string;
  orgao_destinatario: string;
  pessoas_vinculadas?: string[];
  validade?: string;
  observacoes?: string;
  documento_disponivel: boolean;
  secure_url: string;
};

export type AlteracaoEscopo = {
  escopo_anterior: string;
  alteracao: string;
  motivo: string;
  impacto_prazo: string;
  impacto_financeiro: string;
  aceite: string;
  data: string;
};

export type CaseContratacao = {
  contrato_base: ContratoBase;
  ordem_servico: OrdemServico;
  despesas_externas: DespesasExternas;
  autorizacoes: {
    pesquisa_especifica: AutorizacaoPesquisa[];
    procuracao_brasileira: ProcuracaoDocumento;
    procuracao_europeia: ProcuracaoDocumento;
  };
  alteracoes_escopo: AlteracaoEscopo[];
  /** Timeline contratual do caso (Desk completo, resumo na área da cliente). */
  timeline?: EtapaContratual[];
};

/* ---------------- Timeline contratual ---------------- */

export type StatusEtapa =
  | "concluido"
  | "em_andamento"
  | "aguardando"
  | "bloqueado"
  | "nao_iniciado";

export type VisibilidadeEtapa = "cliente" | "interna" | "ambas";

export type EtapaContratual = {
  id: string;
  titulo: string;
  status: StatusEtapa;
  /** Só preencher com data real; vazio nunca gera data fictícia. */
  data: string;
  responsavel: string;
  descricao: string;
  proxima_acao: string;
  visibilidade: VisibilidadeEtapa;
  /** Observação exibida quando o status é "bloqueado". */
  motivo_bloqueio?: string;
};

/* ---------------- Estados de documento ---------------- */

export type EstadoDocumento =
  | "nao_criado"
  | "rascunho"
  | "aguardando_revisao"
  | "aguardando_aceite"
  | "aceito"
  | "arquivado"
  | "indisponivel";


