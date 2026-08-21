/**
 * Desk operacional diário — CRM de leads/oportunidades.
 *
 * Listas controladas da aba LISTAS_BASE (CA 04 CRM Discovery Handoff v1.1).
 * Todo campo classificatório é select fechado: entrada livre é rejeitada.
 * Texto livre só existe para resumo da call, observação, narrativa familiar e
 * links internos. Preço, SKU, link Asaas e despesa de terceiro NUNCA são campo
 * livre aqui — o CRM guarda apenas referência de proposta/documento.
 */

export type Opcao = { valor: string; rotulo: string };

export const AREAS_RESPONSAVEIS: Opcao[] = [
  { valor: "comercial", rotulo: "Comercial" },
  { valor: "pesquisa", rotulo: "Pesquisa genealógica" },
  { valor: "operacoes", rotulo: "Operações" },
  { valor: "juridico_interno", rotulo: "Jurídico interno" },
  { valor: "financeiro", rotulo: "Financeiro" },
  { valor: "atendimento", rotulo: "Atendimento/Relacionamento" },
];

export const ORIGENS_LEAD: Opcao[] = [
  { valor: "indicacao", rotulo: "Indicação" },
  { valor: "formulario", rotulo: "Formulário" },
  { valor: "whatsapp", rotulo: "WhatsApp" },
  { valor: "instagram", rotulo: "Instagram" },
  { valor: "meta_ads", rotulo: "Meta Ads" },
  { valor: "google", rotulo: "Google" },
  { valor: "site", rotulo: "Site" },
  { valor: "evento", rotulo: "Evento" },
  { valor: "parceria", rotulo: "Parceria" },
  { valor: "base_legada", rotulo: "Base legada/importação" },
  { valor: "outra_origem", rotulo: "Outra origem declarada" },
];

export const OBJETIVOS: Opcao[] = [
  { valor: "cidadania", rotulo: "Cidadania" },
  { valor: "pesquisa_genealogica", rotulo: "Pesquisa genealógica" },
  { valor: "documentacao", rotulo: "Documentação/retificação" },
  { valor: "consultoria_pontual", rotulo: "Consultoria pontual" },
  { valor: "objetivo_a_definir", rotulo: "Objetivo a definir" },
];

export const NACIONALIDADES: Opcao[] = [
  { valor: "portuguesa", rotulo: "Portuguesa" },
  { valor: "italiana", rotulo: "Italiana" },
  { valor: "espanhola", rotulo: "Espanhola" },
  { valor: "austriaca", rotulo: "Austríaca" },
  { valor: "alema", rotulo: "Alemã" },
  { valor: "polonesa", rotulo: "Polonesa" },
  { valor: "outra_nacionalidade", rotulo: "Outra nacionalidade" },
  { valor: "nacionalidade_a_confirmar", rotulo: "A confirmar" },
];

export const VIAS_JURIDICAS: Opcao[] = [
  { valor: "descendencia", rotulo: "Descendência" },
  { valor: "casamento", rotulo: "Casamento/união" },
  { valor: "naturalizacao_residencia", rotulo: "Naturalização/residência" },
  { valor: "reparacao_historica", rotulo: "Reparação histórica" },
  { valor: "via_a_confirmar", rotulo: "Via a confirmar" },
];

export const STATUS_VIA: Opcao[] = [
  { valor: "em_confirmacao_juridica", rotulo: "Em confirmação jurídica" },
  { valor: "triagem_preliminar", rotulo: "Triagem preliminar" },
  { valor: "confirmada_internamente", rotulo: "Confirmada internamente" },
  { valor: "inviavel_preliminar", rotulo: "Inviável em triagem preliminar" },
];

export const EIXO_COMERCIAL: Opcao[] = [
  { valor: "novo_lead", rotulo: "Novo lead" },
  { valor: "triagem", rotulo: "Triagem" },
  { valor: "discovery_agendada", rotulo: "Discovery agendada" },
  { valor: "discovery_realizada", rotulo: "Discovery realizada" },
  { valor: "diagnostico_em_elaboracao", rotulo: "Diagnóstico em elaboração" },
  { valor: "proposta_enviada", rotulo: "Proposta enviada" },
  { valor: "negociacao", rotulo: "Negociação" },
  { valor: "nutricao", rotulo: "Nutrição" },
  { valor: "perdido", rotulo: "Perdido" },
  { valor: "encerrado_sem_aderencia", rotulo: "Encerrado sem aderência" },
];

export const EIXO_FORMALIZACAO: Opcao[] = [
  { valor: "nao_iniciado", rotulo: "Não iniciado" },
  { valor: "confirmacao_formal_recebida", rotulo: "Confirmação formal recebida" },
  { valor: "contrato_enviado", rotulo: "Contrato enviado" },
  { valor: "contrato_assinado", rotulo: "Contrato assinado" },
  { valor: "pagamento_inicial_confirmado", rotulo: "Pagamento inicial confirmado" },
  { valor: "cliente_ativo", rotulo: "Cliente ativo" },
  { valor: "onboarding_iniciado", rotulo: "Onboarding iniciado" },
  { valor: "caso_ativo", rotulo: "Caso ativo" },
  { valor: "arquivado", rotulo: "Arquivado" },
];

export const RESULTADOS_DISCOVERY: Opcao[] = [
  { valor: "aderente", rotulo: "Aderente ao serviço" },
  { valor: "aderente_com_ressalva", rotulo: "Aderente com ressalva" },
  { valor: "sem_aderencia", rotulo: "Sem aderência" },
  { valor: "reagendar", rotulo: "Reagendar" },
  { valor: "no_show", rotulo: "No-show" },
];

export const MOTIVOS_PERDA: Opcao[] = [
  { valor: "preco", rotulo: "Preço" },
  { valor: "timing", rotulo: "Timing" },
  { valor: "sem_aderencia_tecnica", rotulo: "Sem aderência técnica" },
  { valor: "concorrencia", rotulo: "Concorrência" },
  { valor: "sem_resposta", rotulo: "Sem resposta" },
  { valor: "desistencia", rotulo: "Desistência declarada" },
];

export const PROXIMAS_ACOES: Opcao[] = [
  { valor: "agendar_call", rotulo: "Agendar call" },
  { valor: "confirmar_call", rotulo: "Confirmar call" },
  { valor: "realizar_discovery", rotulo: "Realizar Discovery" },
  { valor: "enviar_checklist", rotulo: "Enviar checklist" },
  { valor: "elaborar_diagnostico", rotulo: "Elaborar diagnóstico" },
  { valor: "enviar_proposta", rotulo: "Enviar proposta" },
  { valor: "follow_up_proposta", rotulo: "Follow-up de proposta" },
  { valor: "enviar_contrato", rotulo: "Enviar contrato" },
  { valor: "confirmar_pagamento", rotulo: "Confirmar pagamento" },
  { valor: "iniciar_onboarding", rotulo: "Iniciar onboarding" },
  { valor: "solicitar_documentos", rotulo: "Solicitar documentos" },
  { valor: "nutrir_relacionamento", rotulo: "Nutrir relacionamento" },
];

export const SERVICOS_INICIAIS: Opcao[] = [
  { valor: "diagnostico_por_etapas", rotulo: "Diagnóstico por etapas" },
  { valor: "estudo_genealogico", rotulo: "Estudo genealógico" },
  { valor: "consultoria_documental", rotulo: "Consultoria documental" },
  { valor: "servico_a_definir", rotulo: "Serviço a definir" },
];


/* ------------------------------------------------------------------ *
 * Ficha de Discovery e triagem (CA 04 CRM Discovery Handoff v1.1)
 * Triagem comercial/técnica preliminar — nunca decisão jurídica final.
 * ------------------------------------------------------------------ */

export const STATUS_CALL: Opcao[] = [
  { valor: "agendada", rotulo: "Agendada" },
  { valor: "confirmada", rotulo: "Confirmada" },
  { valor: "realizada", rotulo: "Realizada" },
  { valor: "remarcada", rotulo: "Remarcada" },
  { valor: "no_show", rotulo: "No-show" },
  { valor: "cancelada_lead", rotulo: "Cancelada pelo lead" },
  { valor: "cancelada_clube", rotulo: "Cancelada pelo Clube" },
];

export const ELEGIBILIDADE_PRELIMINAR: Opcao[] = [
  { valor: "forte", rotulo: "Forte" },
  { valor: "provavel", rotulo: "Provável" },
  { valor: "possivel_com_pesquisa", rotulo: "Possível com pesquisa" },
  { valor: "baixa", rotulo: "Baixa" },
  { valor: "inconclusiva", rotulo: "Inconclusiva" },
  { valor: "sem_aderencia_atual", rotulo: "Sem aderência atual" },
];

export const CONFIANCA_TRIAGEM: Opcao[] = [
  { valor: "alta", rotulo: "Alta — documentos-chave vistos" },
  { valor: "media", rotulo: "Média — narrativa + parte documental" },
  { valor: "baixa", rotulo: "Baixa — apenas relato inicial" },
];

export const GERACOES_ASCENDENTE: Opcao[] = [
  { valor: "pai_mae", rotulo: "Pai/mãe" },
  { valor: "avo", rotulo: "Avô/avó" },
  { valor: "bisavo", rotulo: "Bisavô/bisavó" },
  { valor: "trisavo", rotulo: "Trisavô/trisavó" },
  { valor: "tetravo_ou_anterior", rotulo: "Tetravô/tetravó ou anterior" },
  { valor: "nao_identificado", rotulo: "Ainda não identificado" },
];

export const LINHAS_TRANSMISSAO: Opcao[] = [
  { valor: "paterna", rotulo: "Paterna" },
  { valor: "materna", rotulo: "Materna" },
  { valor: "mista", rotulo: "Mista" },
  { valor: "nao_confirmada", rotulo: "Linha única ainda não confirmada" },
];

export const RISCOS_RUPTURA: Opcao[] = [
  { valor: "nenhum", rotulo: "Nenhum identificado" },
  { valor: "naturalizacao_estrangeira", rotulo: "Naturalização estrangeira" },
  { valor: "divergencia_nomes_datas", rotulo: "Divergência de nomes/datas" },
  { valor: "casamento_estado_civil", rotulo: "Casamento/estado civil" },
  { valor: "linha_materna_pre_1948", rotulo: "Linha materna pré-1948" },
  { valor: "adocao_reconhecimento", rotulo: "Adoção/reconhecimento" },
  { valor: "falta_certidao", rotulo: "Falta de certidão" },
  { valor: "perseguicao_prova_historica", rotulo: "Perseguição/prova histórica" },
  { valor: "outro", rotulo: "Outro" },
  { valor: "em_investigacao", rotulo: "Em investigação" },
];

export const COMPLEXIDADE_DOCUMENTAL: Opcao[] = [
  { valor: "baixa", rotulo: "Baixa" },
  { valor: "media", rotulo: "Média" },
  { valor: "alta", rotulo: "Alta" },
  { valor: "muito_alta", rotulo: "Muito alta" },
];

export const ESTADO_DOCUMENTAL_INICIAL: Opcao[] = [
  { valor: "chave_disponiveis", rotulo: "Documentos-chave disponíveis" },
  { valor: "parciais", rotulo: "Documentos parciais" },
  { valor: "so_orais", rotulo: "Só informações orais" },
  { valor: "arvore_sem_certidoes", rotulo: "Árvore/nomes sem certidões" },
  { valor: "sem_dados", rotulo: "Sem dados suficientes" },
];

export const PENDENCIAS_DOCUMENTAIS: Opcao[] = [
  { valor: "certidao_nascimento", rotulo: "Certidão de nascimento" },
  { valor: "certidao_casamento", rotulo: "Certidão de casamento" },
  { valor: "certidao_obito", rotulo: "Certidão de óbito" },
  { valor: "naturalizacao_negativa", rotulo: "Naturalização/negativa" },
  { valor: "passaporte", rotulo: "Passaporte" },
  { valor: "imigracao", rotulo: "Imigração" },
  { valor: "registro_militar", rotulo: "Registro militar" },
  { valor: "registro_religioso", rotulo: "Registro religioso" },
  { valor: "retificacao", rotulo: "Retificação" },
  { valor: "traducao", rotulo: "Tradução" },
  { valor: "apostila", rotulo: "Apostila" },
  { valor: "prova_historica", rotulo: "Prova histórica" },
  { valor: "documento_pessoal_requerente", rotulo: "Documento pessoal do requerente" },
  { valor: "nenhuma", rotulo: "Nenhuma" },
  { valor: "a_definir", rotulo: "A definir" },
];

export const EXIGE_IDIOMA_ENTREVISTA: Opcao[] = [
  { valor: "nao", rotulo: "Não" },
  { valor: "idioma", rotulo: "Sim — idioma" },
  { valor: "entrevista", rotulo: "Sim — entrevista" },
  { valor: "ambos", rotulo: "Sim — ambos" },
  { valor: "a_confirmar", rotulo: "A confirmar" },
];

export const ESTRUTURAS_FAMILIARES: Opcao[] = [
  { valor: "individual", rotulo: "Individual" },
  { valor: "casal", rotulo: "Casal" },
  { valor: "nucleo_familiar", rotulo: "Núcleo familiar" },
  { valor: "familia_ampliada", rotulo: "Família ampliada" },
  { valor: "linha_com_menores", rotulo: "Linha com menores" },
  { valor: "a_definir", rotulo: "A definir" },
];

export const PRODUTOS_RECOMENDADOS: Opcao[] = [
  { valor: "diagnostico", rotulo: "Diagnóstico" },
  { valor: "pesquisa_genealogica", rotulo: "Pesquisa genealógica" },
  { valor: "assessoria_completa", rotulo: "Assessoria completa" },
  { valor: "montagem_pasta", rotulo: "Montagem de pasta" },
  { valor: "certidoes", rotulo: "Certidões" },
  { valor: "retificacao", rotulo: "Retificação" },
  { valor: "traducao", rotulo: "Tradução" },
  { valor: "apostila", rotulo: "Apostila" },
  { valor: "protocolo_acompanhamento", rotulo: "Protocolo/acompanhamento" },
  { valor: "pos_cidadania", rotulo: "Pós-cidadania" },
  { valor: "memoria_familiar", rotulo: "Memória familiar" },
  { valor: "outro_sku", rotulo: "Outro SKU — consultar Planilha Mestre" },
];

export const DESPESAS_TERCEIROS_STATUS: Opcao[] = [
  { valor: "nao_aplicavel", rotulo: "Não aplicável" },
  { valor: "estimativa_pendente", rotulo: "Estimativa pendente" },
  { valor: "estimadas_comunicadas", rotulo: "Estimadas e comunicadas" },
  { valor: "aguardando_aprovacao", rotulo: "Aguardando aprovação" },
  { valor: "aprovadas", rotulo: "Aprovadas" },
  { valor: "pagas_pelo_cliente", rotulo: "Pagas diretamente pelo cliente" },
  { valor: "parcialmente_pagas", rotulo: "Parcialmente pagas" },
  { valor: "pendencia_cliente", rotulo: "Pendência do cliente" },
];

export const DESPESAS_TERCEIROS_REGRA: Opcao[] = [
  { valor: "cliente_paga_direto", rotulo: "Cliente paga diretamente ao terceiro" },
  { valor: "cliente_antecipa_aprovado", rotulo: "Cliente antecipa valor aprovado" },
  { valor: "clube_nao_antecipa", rotulo: "Clube não antecipa nem reembolsa despesas de terceiros" },
];

export const DESPESAS_TERCEIROS_FAIXA: Opcao[] = [
  { valor: "sem_estimativa", rotulo: "Sem estimativa" },
  { valor: "ate_1000", rotulo: "Até R$ 1.000" },
  { valor: "1001_3000", rotulo: "R$ 1.001–3.000" },
  { valor: "3001_6000", rotulo: "R$ 3.001–6.000" },
  { valor: "6001_10000", rotulo: "R$ 6.001–10.000" },
  { valor: "acima_10000", rotulo: "Acima de R$ 10.000" },
  { valor: "sob_consulta", rotulo: "Sob consulta" },
];

export const OBJECOES: Opcao[] = [
  { valor: "preco", rotulo: "Preço" },
  { valor: "prazo", rotulo: "Prazo" },
  { valor: "falta_documentos", rotulo: "Falta de documentos" },
  { valor: "duvida_elegibilidade", rotulo: "Dúvida de elegibilidade" },
  { valor: "familia_decisor", rotulo: "Família/decisor" },
  { valor: "confianca", rotulo: "Confiança" },
  { valor: "momento_financeiro", rotulo: "Momento financeiro" },
  { valor: "idioma", rotulo: "Idioma" },
  { valor: "concorrente", rotulo: "Comparação com concorrente" },
  { valor: "nao_houve", rotulo: "Não houve" },
  { valor: "outro", rotulo: "Outro" },
];

export const NIVEIS_INTENCAO: Opcao[] = [
  { valor: "alta", rotulo: "Alta — quer avançar" },
  { valor: "media", rotulo: "Média — precisa avaliar" },
  { valor: "baixa", rotulo: "Baixa — exploratório" },
  { valor: "sem_intencao", rotulo: "Sem intenção atual" },
];

/* Consentimento de gravação/transcrição (CA-LOVABLE-CRM-Discovery v1.0) */
export const CONSENTIMENTO_STATUS: Opcao[] = [
  { valor: "nao_solicitado", rotulo: "Não solicitado" },
  { valor: "pendente", rotulo: "Pendente" },
  { valor: "concedido", rotulo: "Concedido" },
  { valor: "recusado", rotulo: "Recusado" },
];

export const CANAIS_CONSENTIMENTO: Opcao[] = [
  { valor: "verbal_em_call", rotulo: "Verbal registrado na call" },
  { valor: "whatsapp", rotulo: "WhatsApp" },
  { valor: "email", rotulo: "E-mail" },
  { valor: "formulario", rotulo: "Formulário" },
  { valor: "termo_assinado", rotulo: "Termo assinado" },
];

export const PAISES_LINHA_PRIORITARIA: Opcao[] = [
  { valor: "italia", rotulo: "Itália" },
  { valor: "portugal", rotulo: "Portugal" },
  { valor: "espanha", rotulo: "Espanha" },
  { valor: "alemanha", rotulo: "Alemanha" },
  { valor: "austria", rotulo: "Áustria" },
  { valor: "polonia", rotulo: "Polônia" },
  { valor: "hungria", rotulo: "Hungria" },
  { valor: "luxemburgo", rotulo: "Luxemburgo" },
  { valor: "croacia", rotulo: "Croácia" },
  { valor: "romenia", rotulo: "Romênia" },
  { valor: "multipais", rotulo: "Multipaís" },
  { valor: "a_definir", rotulo: "A definir" },
];

export const PESQUISA_PREVIA_AUTORIZACAO: Opcao[] = [
  { valor: "nao_solicitada", rotulo: "Não solicitada" },
  { valor: "pendente", rotulo: "Pendente" },
  { valor: "registrada", rotulo: "Registrada" },
  { valor: "nao_autorizada", rotulo: "Não autorizada" },
  { valor: "nao_aplicavel", rotulo: "Não aplicável" },
];

export const PESQUISA_PREVIA_ESCOPO: Opcao[] = [
  { valor: "triagem_publica", rotulo: "Triagem pública" },
  { valor: "documentos_fornecidos", rotulo: "Documentos fornecidos" },
  { valor: "pesquisa_genealogica", rotulo: "Pesquisa genealógica" },
  { valor: "outro", rotulo: "Outro" },
];

export const DOCUMENTOS_CHAVE: Opcao[] = [
  { valor: "certidao_nascimento", rotulo: "Certidão de nascimento" },
  { valor: "certidao_casamento", rotulo: "Certidão de casamento" },
  { valor: "certidao_obito", rotulo: "Certidão de óbito" },
  { valor: "passaporte", rotulo: "Passaporte" },
  { valor: "registro_imigracao", rotulo: "Registro de imigração" },
  { valor: "registro_militar", rotulo: "Registro militar" },
  { valor: "registro_religioso", rotulo: "Registro religioso" },
  { valor: "naturalizacao_negativa", rotulo: "Naturalização/negativa de naturalização" },
  { valor: "registro_consular", rotulo: "Registro consular" },
  { valor: "prova_perseguicao", rotulo: "Prova de perseguição" },
  { valor: "documento_pessoal_requerente", rotulo: "Documento pessoal do requerente" },
  { valor: "nenhum_ainda", rotulo: "Nenhum ainda" },
];

/** Status de uso da trilha jurídica de referência (Biblioteca Mestre). */
export const STATUS_TRILHA: Opcao[] = [
  { valor: "aberta", rotulo: "Aberta" },
  { valor: "aberta_com_requisito", rotulo: "Aberta com requisito específico" },
  { valor: "aberta_com_prazo", rotulo: "Aberta com prazo" },
  { valor: "restrita", rotulo: "Restrita" },
  { valor: "encerrada", rotulo: "Encerrada para novos pedidos" },
  { valor: "em_confirmacao_juridica", rotulo: "Em confirmação jurídica" },
  { valor: "nao_aplicavel", rotulo: "Não aplicável" },
];

/** Situação do marco jurídico de referência. */
export const STATUS_MARCO: Opcao[] = [
  { valor: "vigente", rotulo: "Vigente" },
  { valor: "a_revisar", rotulo: "A revisar" },
  { valor: "desatualizado", rotulo: "Desatualizado" },
  { valor: "historico", rotulo: "Histórico" },
  { valor: "encerrado", rotulo: "Encerrado" },
];

/** Marcos que não podem sustentar rota/protocolo nem comunicação externa. */
export const MARCOS_BLOQUEIA_EXTERNO = ["a_revisar", "desatualizado", "encerrado"];

/** Todos os catálogos classificatórios por campo. Entrada fora da lista é rejeitada. */
export const CATALOGOS: Record<string, Opcao[]> = {
  area_responsavel: AREAS_RESPONSAVEIS,
  origem: ORIGENS_LEAD,
  objetivo: OBJETIVOS,
  nacionalidade: NACIONALIDADES,
  via_juridica_preliminar: VIAS_JURIDICAS,
  status_via: STATUS_VIA,
  eixo_comercial: EIXO_COMERCIAL,
  eixo_formalizacao: EIXO_FORMALIZACAO,
  discovery_resultado: RESULTADOS_DISCOVERY,
  motivo_perda: MOTIVOS_PERDA,
  proxima_acao: PROXIMAS_ACOES,
  servico_inicial_aprovado: SERVICOS_INICIAIS,
  status_call: STATUS_CALL,
  elegibilidade_preliminar: ELEGIBILIDADE_PRELIMINAR,
  confianca_triagem: CONFIANCA_TRIAGEM,
  geracao_ascendente: GERACOES_ASCENDENTE,
  linha_transmissao: LINHAS_TRANSMISSAO,
  risco_ruptura: RISCOS_RUPTURA,
  complexidade_documental: COMPLEXIDADE_DOCUMENTAL,
  estado_documental_inicial: ESTADO_DOCUMENTAL_INICIAL,
  pendencia_documental_prioritaria: PENDENCIAS_DOCUMENTAIS,
  exige_idioma_entrevista: EXIGE_IDIOMA_ENTREVISTA,
  estrutura_familiar: ESTRUTURAS_FAMILIARES,
  despesas_terceiros_status: DESPESAS_TERCEIROS_STATUS,
  despesas_terceiros_regra: DESPESAS_TERCEIROS_REGRA,
  despesas_terceiros_faixa: DESPESAS_TERCEIROS_FAIXA,
  objecao_predominante: OBJECOES,
  nivel_intencao: NIVEIS_INTENCAO,
  consentimento_status: CONSENTIMENTO_STATUS,
  consentimento_canal: CANAIS_CONSENTIMENTO,
  pais_linha_prioritaria: PAISES_LINHA_PRIORITARIA,
  pesquisa_previa_autorizacao: PESQUISA_PREVIA_AUTORIZACAO,
};

export const CAMPOS_TEXTO_LIVRE = [
  "nome",
  "email",
  "telefone",
  "responsavel_nome",
  "indicado_por",
  "resumo_call",
  "observacoes",
  "narrativa_familiar",
  "proposta_link_interno",
  "proposta_referencia_interna",
  "contrato_link_interno",
  "asaas_evento_referencia",
] as const;

/** Campos que o CRM nunca aceita como entrada livre. */
export const CAMPOS_PROIBIDOS_NO_CRM = ["preco", "valor", "valor_total", "sku", "link_asaas", "link_pagamento", "despesa_terceiro"];

export function rotulo(campo: string, valor: string | null | undefined): string {
  if (!valor) return "—";
  return CATALOGOS[campo]?.find((o) => o.valor === valor)?.rotulo ?? valor;
}

export type LeadDesk = {
  id?: string;
  codigo?: string | null;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  origem?: string | null;
  area_responsavel?: string | null;
  responsavel_nome?: string | null;
  indicado_por?: string | null;
  proxima_acao?: string | null;
  proxima_acao_em?: string | null;
  eixo_comercial?: string | null;
  eixo_formalizacao?: string | null;
  objetivo?: string | null;
  nacionalidade?: string | null;
  via_juridica_preliminar?: string | null;
  status_via?: string | null;
  discovery_resultado?: string | null;
  resumo_call?: string | null;
  resumo_validado?: boolean | null;
  call_agendada_em?: string | null;
  call_realizada_em?: string | null;
  proposta_link_interno?: string | null;
  proposta_referencia_interna?: string | null;
  contrato_link_interno?: string | null;
  asaas_evento_referencia?: string | null;
  motivo_perda?: string | null;
  servico_inicial_aprovado?: string | null;
  pagamento_previsto_em?: string | null;
  dados_teste?: boolean | null;
  case_id?: string | null;
  nucleo_id?: string | null;
  ultimo_followup_em?: string | null;
  archived_at?: string | null;
  created_at?: string | null;
  status_call?: string | null;
  elegibilidade_preliminar?: string | null;
  confianca_triagem?: string | null;
  geracao_ascendente?: string | null;
  linha_transmissao?: string | null;
  risco_ruptura?: string | null;
  complexidade_documental?: string | null;
  estado_documental_inicial?: string | null;
  pendencia_documental_prioritaria?: string | null;
  exige_idioma_entrevista?: string | null;
  requerentes_potenciais?: number | null;
  estrutura_familiar?: string | null;
  objecao_predominante?: string | null;
  nivel_intencao?: string | null;
  produtos_recomendados?: string[] | null;
  sku_referencia?: string | null;
  despesas_terceiros_status?: string | null;
  despesas_terceiros_regra?: string | null;
  despesas_terceiros_faixa?: string | null;
  consentimento_gravacao?: boolean | null;
  spin_situacao?: boolean | null;
  spin_problema?: boolean | null;
  spin_implicacao?: boolean | null;
  spin_necessidade?: boolean | null;
  gravacao_link_interno?: string | null;
  dossie_link_interno?: string | null;
  /* Consentimento, trilha e pesquisa prévia (Discovery v1.0) */
  consentimento_status?: string | null;
  consentimento_em?: string | null;
  consentimento_canal?: string | null;
  consentimento_versao_aviso?: string | null;
  nacionalidades_interesse?: string[] | null;
  pais_linha_prioritaria?: string | null;
  localidades_conhecidas?: string | null;
  documentos_chave?: string[] | null;
  trilha_referencia_id?: string | null;
  marco_referencia_id?: string | null;
  pesquisa_previa_autorizacao?: string | null;
  pesquisa_previa_escopo?: string[] | null;
  pesquisa_previa_limite?: string | null;
};

/** Resultado comercial é DERIVADO: nunca substitui os dois eixos. */
export function resultadoComercialDerivado(l: LeadDesk): string {
  if (l.eixo_comercial === "perdido") return "Perdido";
  if (l.eixo_comercial === "encerrado_sem_aderencia") return "Encerrado sem aderência";
  if (l.eixo_formalizacao === "caso_ativo") return "Ganho — caso ativo";
  if (l.eixo_formalizacao === "onboarding_iniciado" || l.eixo_formalizacao === "cliente_ativo") return "Ganho — em onboarding";
  if (l.eixo_formalizacao === "pagamento_inicial_confirmado") return "Ganho — pagamento confirmado";
  if (l.eixo_formalizacao === "contrato_assinado") return "Ganho — contrato assinado";
  if (l.eixo_formalizacao === "contrato_enviado") return "Em formalização";
  if (l.eixo_formalizacao === "confirmacao_formal_recebida") return "Aceite confirmado — formalização pendente";
  if (l.eixo_comercial === "nutricao") return "Em nutrição";
  return "Em andamento comercial";
}

export type ErroValidacao = { campo: string; motivo: string };

/** Espelha as travas do banco para dar feedback imediato antes de gravar. */
export function validarLead(l: LeadDesk): ErroValidacao[] {
  const erros: ErroValidacao[] = [];
  const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

  for (const [campo, opcoes] of Object.entries(CATALOGOS)) {
    const v = (l as Record<string, unknown>)[campo];
    if (!vazio(v) && !opcoes.some((o) => o.valor === v)) {
      erros.push({ campo, motivo: `Valor fora da lista controlada de ${campo}.` });
    }
  }

  if (vazio(l.nome)) erros.push({ campo: "nome", motivo: "Nome é obrigatório." });

  const ativo = !l.archived_at && !["perdido", "encerrado_sem_aderencia"].includes(String(l.eixo_comercial));
  if (ativo) {
    if (vazio(l.area_responsavel)) erros.push({ campo: "area_responsavel", motivo: "Lead ativo exige área responsável." });
    if (vazio(l.responsavel_nome)) erros.push({ campo: "responsavel_nome", motivo: "Lead ativo exige responsável nominal." });
    if (vazio(l.proxima_acao)) erros.push({ campo: "proxima_acao", motivo: "Lead ativo exige próxima ação." });
    if (vazio(l.proxima_acao_em)) erros.push({ campo: "proxima_acao_em", motivo: "Lead ativo exige data da próxima ação." });
  }

  if (["discovery_realizada", "diagnostico_em_elaboracao", "proposta_enviada", "negociacao"].includes(String(l.eixo_comercial))) {
    if (vazio(l.discovery_resultado)) erros.push({ campo: "discovery_resultado", motivo: "Call realizada exige resultado da Discovery." });
    if (!l.resumo_validado) erros.push({ campo: "resumo_validado", motivo: "Call realizada exige resumo validado." });
    if (vazio(l.proxima_acao_em)) erros.push({ campo: "proxima_acao_em", motivo: "Call realizada exige próxima ação datada." });
  }

  if (["proposta_enviada", "negociacao"].includes(String(l.eixo_comercial))) {
    if (vazio(l.proposta_link_interno)) erros.push({ campo: "proposta_link_interno", motivo: "Proposta enviada exige link interno da proposta." });
    if (vazio(l.responsavel_nome)) erros.push({ campo: "responsavel_nome", motivo: "Proposta enviada exige responsável nominal." });
  }

  if (l.eixo_comercial === "perdido" && vazio(l.motivo_perda)) {
    erros.push({ campo: "motivo_perda", motivo: "Perdido exige motivo de perda." });
  }

  const formalizados = ["contrato_assinado", "pagamento_inicial_confirmado", "cliente_ativo", "onboarding_iniciado", "caso_ativo"];
  if (formalizados.includes(String(l.eixo_formalizacao)) && vazio(l.contrato_link_interno)) {
    erros.push({ campo: "contrato_link_interno", motivo: "Contrato assinado exige link interno do contrato." });
  }

  const pagos = ["pagamento_inicial_confirmado", "cliente_ativo", "onboarding_iniciado", "caso_ativo"];
  if (pagos.includes(String(l.eixo_formalizacao)) && vazio(l.asaas_evento_referencia)) {
    erros.push({
      campo: "asaas_evento_referencia",
      motivo: "Pagamento inicial confirmado exige referência ao evento transacional do Asaas.",
    });
  }

  if (String(l.eixo_formalizacao) === "onboarding_iniciado" && vazio(l.asaas_evento_referencia)) {
    erros.push({ campo: "eixo_formalizacao", motivo: "Onboarding não inicia sem pagamento inicial confirmado." });
  }

  if (String(l.status_call) === "realizada") {
    if (vazio(l.discovery_resultado)) erros.push({ campo: "discovery_resultado", motivo: "Call realizada exige resultado da Discovery." });
    if (vazio(l.proxima_acao)) erros.push({ campo: "proxima_acao", motivo: "Call realizada exige próxima ação." });
  }

  if (["forte", "provavel"].includes(String(l.elegibilidade_preliminar))) {
    if (vazio(l.via_juridica_preliminar)) erros.push({ campo: "via_juridica_preliminar", motivo: "Elegibilidade Forte/Provável exige via jurídica preliminar." });
    if (vazio(l.geracao_ascendente)) erros.push({ campo: "geracao_ascendente", motivo: "Elegibilidade Forte/Provável exige geração do ascendente." });
    if (vazio(l.estado_documental_inicial)) erros.push({ campo: "estado_documental_inicial", motivo: "Elegibilidade Forte/Provável exige estado documental inicial." });
  }

  if (!vazio(l.sku_referencia) && (l.produtos_recomendados ?? []).length === 0) {
    erros.push({ campo: "sku_referencia", motivo: "Referência de SKU só após indicar produtos/serviços recomendados." });
  }

  if (String(l.despesas_terceiros_status) === "aprovadas") {
    if (vazio(l.despesas_terceiros_faixa)) erros.push({ campo: "despesas_terceiros_faixa", motivo: "Despesas aprovadas exigem faixa estimada registrada." });
    if (vazio(l.despesas_terceiros_regra)) erros.push({ campo: "despesas_terceiros_regra", motivo: "Despesas aprovadas exigem a regra de pagamento pelo cliente." });
  }

  if (!l.consentimento_gravacao && !vazio(l.gravacao_link_interno)) {
    erros.push({ campo: "gravacao_link_interno", motivo: "Sem consentimento de gravação não é possível registrar link de gravação/transcrição." });
  }

  if (l.requerentes_potenciais !== null && l.requerentes_potenciais !== undefined && Number(l.requerentes_potenciais) < 1) {
    erros.push({ campo: "requerentes_potenciais", motivo: "Número de requerentes deve ser inteiro positivo." });
  }

  if ((l.produtos_recomendados ?? []).some((p) => !PRODUTOS_RECOMENDADOS.some((o) => o.valor === p))) {
    erros.push({ campo: "produtos_recomendados", motivo: "Produto fora da lista controlada." });
  }

  if (String(l.status_via) === "inviavel_preliminar" && (l.produtos_recomendados ?? []).includes("protocolo_acompanhamento")) {
    erros.push({ campo: "produtos_recomendados", motivo: "Via inviável em triagem preliminar: permitido apenas diagnóstico, pesquisa de alternativas ou nutrição." });
  }

  if (String(l.eixo_formalizacao) === "caso_ativo" && vazio(l.case_id)) {
    erros.push({ campo: "eixo_formalizacao", motivo: "Caso ativo exige caso operacional vinculado: Discovery ou proposta não abrem caso." });
  }

  return erros;
}

/* ------------------------------------------------------------------ *
 * Painel “Hoje” — filas ordenadas por criticidade e data
 * ------------------------------------------------------------------ */

export const CRITICIDADE_FILA: Record<string, number> = {
  acoes_vencidas: 1,
  pagamentos_aguardados: 2,
  contratos_enviados_pendentes: 3,
  onboardings_pendentes: 4,
  acoes_hoje: 5,
  leads_sem_responsavel: 6,
  leads_sem_proxima_acao: 7,
  propostas_sem_followup: 8,
  calls_hoje: 9,
  casos_pendencia_documental: 10,
};

export const ROTULO_FILA: Record<string, string> = {
  acoes_vencidas: "Ações vencidas",
  acoes_hoje: "Ações de hoje",
  leads_sem_responsavel: "Leads ativos sem responsável",
  leads_sem_proxima_acao: "Leads ativos sem próxima ação",
  calls_hoje: "Calls de hoje",
  propostas_sem_followup: "Propostas sem follow-up",
  contratos_enviados_pendentes: "Contratos enviados pendentes",
  pagamentos_aguardados: "Pagamentos iniciais aguardados",
  onboardings_pendentes: "Onboardings pendentes",
  casos_pendencia_documental: "Casos com pendência documental",
};

export type ItemFila = {
  id: string;
  rotulo: string;
  detalhe: string;
  data: string | null;
  tipo: "lead" | "caso";
  /** Filtros operacionais do Painel Hoje. */
  area: string | null;
  responsavel: string | null;
  etapa: string | null;
};
export type Fila = { chave: string; rotulo: string; criticidade: number; itens: ItemFila[] };

const dia = (d: string | Date) => new Date(d).toISOString().slice(0, 10);

export function montarFilasHoje(input: {
  leads: LeadDesk[];
  casos: { id: string; codigo: string | null; titulo: string | null; documentos_minimos_ok: boolean | null; prazo_proxima_acao: string | null }[];
  hoje?: Date;
}): Fila[] {
  const hojeStr = dia(input.hoje ?? new Date());
  const ativos = input.leads.filter(
    (l) => !l.archived_at && !["perdido", "encerrado_sem_aderencia"].includes(String(l.eixo_comercial)),
  );
  const itemLead = (l: LeadDesk, detalhe: string, data: string | null): ItemFila => ({
    id: String(l.id),
    rotulo: `${l.codigo ?? "sem código"} · ${l.nome}`,
    detalhe,
    data,
    tipo: "lead",
    area: l.area_responsavel ?? null,
    responsavel: l.responsavel_nome ?? null,
    etapa: l.eixo_comercial ?? null,
  });


  const filas: Fila[] = [
    {
      chave: "acoes_vencidas",
      itens: ativos
        .filter((l) => l.proxima_acao_em && dia(l.proxima_acao_em) < hojeStr)
        .map((l) => itemLead(l, rotulo("proxima_acao", l.proxima_acao), l.proxima_acao_em ?? null)),
    },
    {
      chave: "acoes_hoje",
      itens: ativos
        .filter((l) => l.proxima_acao_em && dia(l.proxima_acao_em) === hojeStr)
        .map((l) => itemLead(l, rotulo("proxima_acao", l.proxima_acao), l.proxima_acao_em ?? null)),
    },
    {
      chave: "leads_sem_responsavel",
      itens: ativos.filter((l) => !l.responsavel_nome).map((l) => itemLead(l, "Sem responsável nominal", null)),
    },
    {
      chave: "leads_sem_proxima_acao",
      itens: ativos.filter((l) => !l.proxima_acao || !l.proxima_acao_em).map((l) => itemLead(l, "Sem próxima ação datada", null)),
    },
    {
      chave: "calls_hoje",
      itens: ativos
        .filter((l) => l.call_agendada_em && dia(l.call_agendada_em) === hojeStr)
        .map((l) => itemLead(l, "Call agendada", l.call_agendada_em ?? null)),
    },
    {
      chave: "propostas_sem_followup",
      itens: ativos
        .filter((l) => ["proposta_enviada", "negociacao"].includes(String(l.eixo_comercial)) && !l.ultimo_followup_em)
        .map((l) => itemLead(l, "Proposta enviada sem follow-up registrado", l.proxima_acao_em ?? null)),
    },
    {
      chave: "contratos_enviados_pendentes",
      itens: ativos
        .filter((l) => l.eixo_formalizacao === "contrato_enviado")
        .map((l) => itemLead(l, "Contrato enviado aguardando assinatura", l.proxima_acao_em ?? null)),
    },
    {
      chave: "pagamentos_aguardados",
      itens: ativos
        .filter((l) => l.eixo_formalizacao === "contrato_assinado")
        .map((l) => itemLead(l, "Pagamento inicial aguardado", l.pagamento_previsto_em ?? null)),
    },
    {
      chave: "onboardings_pendentes",
      itens: ativos
        .filter((l) => l.eixo_formalizacao === "pagamento_inicial_confirmado" || l.eixo_formalizacao === "cliente_ativo")
        .map((l) => itemLead(l, "Onboarding pendente de início", l.proxima_acao_em ?? null)),
    },
    {
      chave: "casos_pendencia_documental",
      itens: input.casos
        .filter((c) => c.documentos_minimos_ok === false)
        .map((c) => ({
          id: c.id,
          rotulo: `${c.codigo ?? "caso"} · ${c.titulo ?? "sem título"}`,
          detalhe: "Documentos aguardados — pendência documental",
          data: c.prazo_proxima_acao,
          tipo: "caso" as const,
          area: "operacoes",
          responsavel: null,
          etapa: "caso_ativo",
        })),
    },
  ].map((f) => ({
    ...f,
    rotulo: ROTULO_FILA[f.chave],
    criticidade: CRITICIDADE_FILA[f.chave],
    itens: [...f.itens].sort((a, b) => (a.data ?? "9999").localeCompare(b.data ?? "9999")),
  }));

  return filas.sort((a, b) => a.criticidade - b.criticidade);
}

/**
 * Lista única priorizada do Painel Hoje: ordenada pela DATA DA PRÓXIMA AÇÃO
 * (mais antiga primeiro) e, em empate, pela criticidade da fila.
 * Itens sem data ficam ao final, nunca ordenados por data de criação.
 */
export function listaPrioritaria(
  filas: Fila[],
  filtro?: { area?: string; responsavel?: string; etapa?: string },
): (ItemFila & { fila: string; criticidade: number })[] {
  const linhas = filas.flatMap((f) =>
    f.itens.map((i) => ({ ...i, fila: f.rotulo, criticidade: f.criticidade })),
  );
  const visiveis = linhas.filter((i) => {
    if (filtro?.area && i.area !== filtro.area) return false;
    if (filtro?.responsavel && i.responsavel !== filtro.responsavel) return false;
    if (filtro?.etapa && i.etapa !== filtro.etapa) return false;
    return true;
  });
  return visiveis.sort((a, b) => {
    const da = a.data ? String(a.data).slice(0, 10) : "9999-12-31";
    const db = b.data ? String(b.data).slice(0, 10) : "9999-12-31";
    if (da !== db) return da.localeCompare(db);
    return a.criticidade - b.criticidade;
  });
}

/** Classifica o prazo da próxima ação: atraso, hoje ou futuro. Nunca usa data de criação. */
export function classificarPrazo(
  data: string | null | undefined,
  hoje: string,
): { chave: "atrasado" | "hoje" | "futuro" | "sem_data"; rotulo: string } {
  if (!data) return { chave: "sem_data", rotulo: "Sem prazo definido" };
  const d = String(data).slice(0, 10);
  if (d < hoje) return { chave: "atrasado", rotulo: "Em atraso" };
  if (d === hoje) return { chave: "hoje", rotulo: "Para hoje" };
  return { chave: "futuro", rotulo: "Próxima ação futura" };
}

/* ------------------------------------------------------------------ *
 * Escada de conversão e handoff Discovery → oportunidade → operação
 * ------------------------------------------------------------------ */

export type DegrauEscada = {
  chave: "aceite_verbal" | "confirmacao_formal" | "contrato_cobranca" | "onboarding";
  rotulo: string;
  estado: "concluido" | "em_andamento" | "bloqueado";
  nota: string;
};

/**
 * Escada canônica: aceite verbal → confirmação formal → contrato e cobrança → onboarding.
 * Aceite verbal NÃO cria cliente nem libera contrato, cobrança, onboarding,
 * pesquisa externa ou App Cliente. Nenhum estado é avançado automaticamente aqui.
 */
export function escadaConversao(l: LeadDesk): DegrauEscada[] {
  const f = String(l.eixo_formalizacao ?? "");
  const c = String(l.eixo_comercial ?? "");
  const ordemFormal = EIXO_FORMALIZACAO.map((o) => o.valor);
  const idx = (v: string) => ordemFormal.indexOf(v);
  const atingiu = (v: string) => idx(f) >= 0 && idx(v) >= 0 && idx(f) >= idx(v);

  const aceiteVerbal = c === "negociacao" || c === "proposta_enviada" || idx(f) > 0;
  /** Confirmação formal registrada no eixo de formalização (não antecipa contrato nem cobrança). */
  const confirmacao = atingiu("confirmacao_formal_recebida");
  const contratoOk = atingiu("contrato_assinado");
  const pagamentoOk = atingiu("pagamento_inicial_confirmado");
  const onboardingOk = atingiu("onboarding_iniciado");

  return [
    {
      chave: "aceite_verbal",
      rotulo: "Aceite verbal",
      estado: aceiteVerbal ? "concluido" : "em_andamento",
      nota: "Não cria cliente e não libera contrato, cobrança, assinatura, onboarding, pesquisa externa nem App Cliente.",
    },
    {
      chave: "confirmacao_formal",
      rotulo: "Confirmação formal",
      estado: confirmacao ? "concluido" : aceiteVerbal ? "em_andamento" : "bloqueado",
      nota: "Libera apenas a preparação da formalização.",
    },
    {
      chave: "contrato_cobranca",
      rotulo: "Contrato e cobrança",
      estado: contratoOk && pagamentoOk ? "concluido" : confirmacao ? "em_andamento" : "bloqueado",
      nota: contratoOk
        ? pagamentoOk
          ? "Contrato assinado e pagamento inicial confirmado."
          : "Contrato assinado; pagamento inicial ainda não confirmado."
        : "Bloqueado até confirmação formal registrada.",
    },
    {
      chave: "onboarding",
      rotulo: "Onboarding",
      estado: onboardingOk ? "concluido" : contratoOk && pagamentoOk ? "em_andamento" : "bloqueado",
      nota: "Exige contrato assinado, pagamento inicial confirmado e demais gates do caso.",
    },
  ];
}

export type Handoff = {
  confirmado: string[];
  falta: string[];
  responsavel: string | null;
  area: string | null;
  proximaAcao: string | null;
  prazo: string | null;
  bloqueios: { alvo: "proposta" | "formalizacao" | "onboarding"; motivo: string }[];
  operavel: boolean;
};

/**
 * Leitura de handoff Discovery → oportunidade → operação.
 * Somente deriva do registro existente: não cria segunda ficha nem avança estados.
 */
export function handoffLead(l: LeadDesk): Handoff {
  const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === "";
  const confirmado: string[] = [];
  const falta: string[] = [];

  const marcar = (ok: boolean, texto: string) => (ok ? confirmado : falta).push(texto);
  marcar(!vazio(l.objetivo), "Interesse inicial declarado");
  marcar(!vazio(l.nacionalidade), "Nacionalidade de interesse");
  marcar(!vazio(l.via_juridica_preliminar), "Via jurídica preliminar (sinal interno, não é parecer)");
  marcar(!vazio(l.call_realizada_em), "Call de Discovery realizada");
  marcar(!vazio(l.discovery_resultado), "Resultado da Discovery registrado");
  marcar(Boolean(l.resumo_validado), "Resumo da call validado");
  marcar(!vazio(l.responsavel_nome), "Responsável nominal definido");
  marcar(!vazio(l.proxima_acao) && !vazio(l.proxima_acao_em), "Próxima ação com prazo");

  const bloqueios: Handoff["bloqueios"] = [];
  if (vazio(l.discovery_resultado) || !l.resumo_validado) {
    bloqueios.push({ alvo: "proposta", motivo: "Proposta exige Discovery com resultado e resumo validado." });
  }
  if (vazio(l.responsavel_nome) || vazio(l.proxima_acao) || vazio(l.proxima_acao_em)) {
    bloqueios.push({ alvo: "proposta", motivo: "Oportunidade sem responsável, próxima ação ou prazo não é operável." });
  }
  const escada = escadaConversao(l);
  const confirmacaoOk = escada[1]?.estado === "concluido";
  if (!confirmacaoOk) {
    bloqueios.push({ alvo: "formalizacao", motivo: "Formalização só é preparada após confirmação formal registrada." });
  }
  if (escada[2]?.estado !== "concluido") {
    bloqueios.push({ alvo: "onboarding", motivo: "Onboarding bloqueado até contrato assinado e pagamento inicial confirmado." });
  }

  return {
    confirmado,
    falta,
    responsavel: l.responsavel_nome ?? null,
    area: l.area_responsavel ?? null,
    proximaAcao: l.proxima_acao ?? null,
    prazo: l.proxima_acao_em ? String(l.proxima_acao_em).slice(0, 10) : null,
    bloqueios,
    operavel: !vazio(l.responsavel_nome) && !vazio(l.proxima_acao) && !vazio(l.proxima_acao_em),
  };
}



/* ------------------------------------------------------------------ *
 * Métricas comerciais e operacionais
 * ------------------------------------------------------------------ */

export type MetricasCrm = {
  porOrigem: { origem: string; total: number }[];
  entradaSemanal: { periodo: string; total: number }[];
  entradaMensal: { periodo: string; total: number }[];
  calls: { agendadas: number; realizadas: number; noShow: number; conversao: number | null };
  funil: { etapa: string; taxa: number | null; de: number; para: number }[];
  semProximaAcao: number;
  followupsVencidos: number;
  casosPorNacionalidadeVia: { chave: string; total: number }[];
  pendenciasDocumentais: { chave: string; total: number }[];
};

function semanaDe(iso: string): string {
  const d = new Date(iso);
  const alvo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (alvo.getUTCDay() + 6) % 7;
  alvo.setUTCDate(alvo.getUTCDate() - dow + 3);
  const primeira = new Date(Date.UTC(alvo.getUTCFullYear(), 0, 4));
  const semana = 1 + Math.round(((alvo.getTime() - primeira.getTime()) / 86400000 - 3 + ((primeira.getUTCDay() + 6) % 7)) / 7);
  return `${alvo.getUTCFullYear()}-S${String(semana).padStart(2, "0")}`;
}

function contar<T>(itens: T[], chave: (t: T) => string | null): { chave: string; total: number }[] {
  const m = new Map<string, number>();
  for (const i of itens) {
    const k = chave(i);
    if (!k) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([chave, total]) => ({ chave, total })).sort((a, b) => b.total - a.total);
}

const taxa = (de: number, para: number) => (de > 0 ? Math.round((para / de) * 1000) / 10 : null);

export function calcularMetricasCrm(input: {
  leads: LeadDesk[];
  casos: { pais: string | null; via: string | null; documentos_minimos_ok: boolean | null; responsavel_principal: string | null; ativo: boolean | null }[];
  hoje?: Date;
}): MetricasCrm {
  const hojeStr = dia(input.hoje ?? new Date());
  const leads = input.leads;
  const ordem = EIXO_COMERCIAL.map((o) => o.valor);
  const chegouAte = (l: LeadDesk, etapa: string) => {
    const i = ordem.indexOf(String(l.eixo_comercial));
    const j = ordem.indexOf(etapa);
    return i >= 0 && j >= 0 && i >= j && !["perdido", "encerrado_sem_aderencia"].includes(String(l.eixo_comercial));
  };
  const formalOrdem = EIXO_FORMALIZACAO.map((o) => o.valor);
  const formalAte = (l: LeadDesk, etapa: string) => {
    const i = formalOrdem.indexOf(String(l.eixo_formalizacao));
    const j = formalOrdem.indexOf(etapa);
    return i >= 0 && j >= 0 && i >= j;
  };

  const discovery = leads.filter((l) => l.call_realizada_em).length;
  const agendadas = leads.filter((l) => l.call_agendada_em).length;
  const noShow = leads.filter((l) => l.discovery_resultado === "no_show").length;
  const propostas = leads.filter((l) => chegouAte(l, "proposta_enviada")).length;
  const contratos = leads.filter((l) => formalAte(l, "contrato_assinado")).length;
  const pagos = leads.filter((l) => formalAte(l, "pagamento_inicial_confirmado")).length;
  const onboardings = leads.filter((l) => formalAte(l, "onboarding_iniciado")).length;

  return {
    porOrigem: contar(leads, (l) => l.origem ?? null).map((c) => ({ origem: rotulo("origem", c.chave), total: c.total })),
    entradaSemanal: contar(leads, (l) => (l.created_at ? semanaDe(l.created_at) : null))
      .map((c) => ({ periodo: c.chave, total: c.total }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo)),
    entradaMensal: contar(leads, (l) => (l.created_at ? l.created_at.slice(0, 7) : null))
      .map((c) => ({ periodo: c.chave, total: c.total }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo)),
    calls: { agendadas, realizadas: discovery, noShow, conversao: taxa(agendadas, discovery) },
    funil: [
      { etapa: "Discovery → Proposta", de: discovery, para: propostas, taxa: taxa(discovery, propostas) },
      { etapa: "Proposta → Contrato", de: propostas, para: contratos, taxa: taxa(propostas, contratos) },
      { etapa: "Contrato → Pagamento inicial", de: contratos, para: pagos, taxa: taxa(contratos, pagos) },
      { etapa: "Pagamento → Onboarding", de: pagos, para: onboardings, taxa: taxa(pagos, onboardings) },
    ],
    semProximaAcao: leads.filter(
      (l) => !l.archived_at && !["perdido", "encerrado_sem_aderencia"].includes(String(l.eixo_comercial)) && (!l.proxima_acao || !l.proxima_acao_em),
    ).length,
    followupsVencidos: leads.filter((l) => l.proxima_acao_em && dia(l.proxima_acao_em) < hojeStr && !l.archived_at).length,
    casosPorNacionalidadeVia: contar(
      input.casos.filter((c) => c.ativo !== false),
      (c) => `${c.pais ?? "país não declarado"} · ${c.via ?? "via não declarada"}`,
    ),
    pendenciasDocumentais: contar(
      input.casos.filter((c) => c.documentos_minimos_ok === false),
      (c) => c.responsavel_principal ?? "sem responsável",
    ),
  };
}
