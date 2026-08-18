/**
 * Catálogos controlados (listas fechadas) dos campos classificatórios do motor
 * contratual. Campo classificatório NÃO aceita texto livre: a interface mostra
 * dropdown e o servidor rejeita qualquer valor fora da lista.
 *
 * Cada opção carrega uma ajuda curta explicando o significado e o efeito no
 * contrato ou no gate correspondente.
 */

export type Opcao = { valor: string; rotulo: string; ajuda?: string };

export const CAT_STATUS_PARAMETRO: Opcao[] = [
  {
    valor: "vazio",
    rotulo: "Vazio",
    ajuda: "Nenhum dado real registrado. Campo obrigatório vazio bloqueia a versão final.",
  },
  {
    valor: "importado_a_confirmar",
    rotulo: "A confirmar",
    ajuda: "Dado registrado, ainda sem conferência humana/documental. Não libera revisão nem assinatura.",
  },
  {
    valor: "validado",
    rotulo: "Validado",
    ajuda: "Dado conferido pela regra/fonte exigida. Alimenta a versão atual do contrato e dos anexos.",
  },
  {
    valor: "conflito",
    rotulo: "Conflito",
    ajuda: "Dados incompatíveis entre origens. Bloqueia prévia final, revisão, assinatura e ativação.",
  },
  {
    valor: "bloqueado",
    rotulo: "Bloqueado",
    ajuda: "Bloqueio humano explícito com justificativa. Impede uso do campo até nova decisão registrada.",
  },
  {
    valor: "substituido",
    rotulo: "Substituído",
    ajuda: "Preservado no histórico, mas não alimenta a versão atual.",
  },
  {
    valor: "arquivado",
    rotulo: "Arquivado",
    ajuda: "Histórico. Não pode alimentar novo contrato sem restauração registrada.",
  },
];

export const CAT_ORIGEM: Opcao[] = [
  { valor: "planejador", rotulo: "Planejador homologado", ajuda: "Fonte de maior confiança (6). Prevalece sobre qualquer outra origem." },
  { valor: "documento", rotulo: "Documento", ajuda: "Confiança 5. Documento conferido e arquivado no caso." },
  { valor: "crm", rotulo: "CRM", ajuda: "Confiança 4. Cadastro interno do caso/cliente." },
  { valor: "proposta", rotulo: "Proposta", ajuda: "Confiança 4. Somente proposta ativa e aprovada." },
  { valor: "preenchimento_humano", rotulo: "Preenchimento humano", ajuda: "Confiança 4. Exige justificativa quando substitui outra origem." },
  { valor: "calculo_aprovado", rotulo: "Cálculo aprovado", ajuda: "Confiança 4. Resultado de cálculo comercial já aprovado." },
  { valor: "formulario", rotulo: "Formulário", ajuda: "Confiança 3. Declarado pelo cliente em formulário." },
  { valor: "whatsapp", rotulo: "WhatsApp", ajuda: "Confiança 2. Não pode ser validado diretamente." },
  { valor: "transcricao", rotulo: "Transcrição", ajuda: "Confiança 1. Não pode ser validado diretamente." },
];

export const CAT_CONFIANCA: Opcao[] = [
  { valor: "6", rotulo: "6 — Planejador homologado" },
  { valor: "5", rotulo: "5 — Documento conferido" },
  { valor: "4", rotulo: "4 — Cadastro/proposta/humano" },
  { valor: "3", rotulo: "3 — Formulário declarado" },
  { valor: "2", rotulo: "2 — Mensagem (WhatsApp)" },
  { valor: "1", rotulo: "1 — Transcrição" },
];

export const CAT_PAPEL_PARTE: Opcao[] = [
  { valor: "contratante", rotulo: "Contratante", ajuda: "Assina e responde pelas obrigações do contrato." },
  { valor: "contratada", rotulo: "Contratada", ajuda: "Prestadora do serviço." },
  { valor: "beneficiario", rotulo: "Beneficiário", ajuda: "Pessoa incluída no escopo; gera anexo individual." },
  { valor: "representante_legal", rotulo: "Representante legal", ajuda: "Exige ANX-REPRESENTAÇÃO." },
  { valor: "testemunha", rotulo: "Testemunha" },
  { valor: "pagador_autorizado", rotulo: "Pagador autorizado", ajuda: "Responsável financeiro declarado no ANX-COMERCIAL." },
];

export const CAT_TIPO_VINCULO: Opcao[] = [
  {
    valor: "nucleo_familiar_compartilhado",
    rotulo: "Núcleo familiar compartilhado",
    ajuda: "Requerente principal + beneficiários do mesmo ancestral: 1 contrato familiar + anexos individuais.",
  },
  { valor: "requerente_individual", rotulo: "Requerente individual", ajuda: "Contrato individual, sem anexos individuais adicionais." },
  { valor: "conjuges", rotulo: "Cônjuges" },
  { valor: "menor_representado", rotulo: "Menor/incapaz representado", ajuda: "Obriga ANX-REPRESENTAÇÃO." },
];

export const CAT_TIPO_PROCESSO: Opcao[] = [
  { valor: "cidadania_austriaca_58c", rotulo: "Cidadania austríaca — § 58c StbG" },
  { valor: "cidadania_italiana", rotulo: "Cidadania italiana" },
  { valor: "cidadania_portuguesa", rotulo: "Cidadania portuguesa" },
  { valor: "cidadania_espanhola", rotulo: "Cidadania espanhola" },
  { valor: "estudo_viabilidade", rotulo: "Estudo de viabilidade documental" },
];

export const CAT_PAIS: Opcao[] = [
  { valor: "Áustria", rotulo: "Áustria" },
  { valor: "Itália", rotulo: "Itália" },
  { valor: "Portugal", rotulo: "Portugal" },
  { valor: "Espanha", rotulo: "Espanha" },
  { valor: "Alemanha", rotulo: "Alemanha" },
  { valor: "Polônia", rotulo: "Polônia" },
];

export const CAT_ROTA: Opcao[] = [
  {
    valor: "Austria",
    rotulo: "Áustria — administrativa (§ 58c StbG)",
    ajuda: "Rota homologada do Planejador para o prefixo CA-CID-AT. Divergência com o código do caso gera conflito crítico.",
  },
  { valor: "Itália — administrativa", rotulo: "Itália — administrativa" },
  { valor: "Itália — judicial", rotulo: "Itália — judicial" },
  { valor: "Portugal — administrativa", rotulo: "Portugal — administrativa" },
  { valor: "Espanha — Ley de Memoria", rotulo: "Espanha — Ley de Memoria Democrática" },
];

export const CAT_TIPO_CONTRATO: Opcao[] = [
  { valor: "contract_base", rotulo: "Contrato-base", ajuda: "Instrumento principal do caso." },
  { valor: "contract_complement", rotulo: "Contrato complementar", ajuda: "Não substitui o contrato-base." },
  { valor: "amendment", rotulo: "Aditivo", ajuda: "Altera somente as cláusulas expressamente indicadas." },
];

export const CAT_ESTADO_PROPOSTA: Opcao[] = [
  { valor: "rascunho", rotulo: "Rascunho", ajuda: "Editável. Não satisfaz o gate de proposta válida." },
  { valor: "em_revisao", rotulo: "Em revisão", ajuda: "Em conferência interna." },
  { valor: "enviada", rotulo: "Enviada", ajuda: "Entregue ao cliente; edição só por versão derivada." },
  { valor: "em_negociacao", rotulo: "Em negociação", ajuda: "Ajustes em discussão com o cliente." },
  { valor: "aprovada", rotulo: "Aceita/aprovada", ajuda: "Única situação que satisfaz o gate de proposta válida." },
  { valor: "recusada", rotulo: "Recusada" },
  { valor: "expirada", rotulo: "Expirada", ajuda: "Validade vencida; exige renovação registrada." },
  { valor: "substituida", rotulo: "Substituída", ajuda: "Preservada no histórico; não gera contrato." },
];

export const CAT_ESTADO_REVISAO: Opcao[] = [
  { valor: "nao_solicitada", rotulo: "Não solicitada" },
  { valor: "solicitada", rotulo: "Solicitada" },
  { valor: "em_revisao", rotulo: "Em revisão humana" },
  { valor: "aprovada", rotulo: "Aprovada", ajuda: "Libera a criação da solicitação de assinatura." },
  { valor: "devolvida", rotulo: "Devolvida para ajuste" },
];

export const CAT_ESTADO_ASSINATURA: Opcao[] = [
  { valor: "nao_iniciada", rotulo: "Não iniciada" },
  { valor: "aguardando", rotulo: "Aguardando assinatura" },
  { valor: "assinado", rotulo: "Assinado", ajuda: "Não cria cobrança nem libera pesquisa externa por si só." },
  { valor: "cancelada", rotulo: "Cancelada" },
];

export const CAT_ESTADO_CONSENTIMENTO: Opcao[] = [
  { valor: "pendente", rotulo: "Pendente", ajuda: "Bloqueia ativação do caso." },
  { valor: "registrado", rotulo: "Registrado" },
  { valor: "dispensado", rotulo: "Dispensado com justificativa" },
  { valor: "revogado", rotulo: "Revogado", ajuda: "Suspende tratamento e pesquisa externa." },
];

export const CAT_CONDICAO_COMERCIAL: Opcao[] = [
  { valor: "aprovada_proposta", rotulo: "Conforme proposta aprovada" },
  { valor: "excecao_autorizada", rotulo: "Exceção comercial autorizada", ajuda: "Exige justificativa e responsável." },
  { valor: "pendente_aprovacao", rotulo: "Pendente de aprovação" },
];

export const CAT_FORMA_PAGAMENTO: Opcao[] = [
  { valor: "assinatura_mensal", rotulo: "Assinatura mensal recorrente", ajuda: "Encerra automaticamente após a última cobrança prevista." },
  { valor: "parcelado_cartao", rotulo: "Parcelado no cartão" },
  { valor: "pix_avista", rotulo: "PIX à vista" },
  { valor: "boleto_parcelado", rotulo: "Boleto parcelado" },
  { valor: "transferencia", rotulo: "Transferência bancária" },
];

export const CAT_STATUS_DESPESA_TERCEIRO: Opcao[] = [
  { valor: "nao_aplicavel", rotulo: "Não aplicável" },
  { valor: "estimada", rotulo: "Estimada", ajuda: "Valor não fechado; exige aprovação antes da contratação." },
  { valor: "aprovada", rotulo: "Aprovada pelo cliente" },
  { valor: "provisionada", rotulo: "Provisionada" },
  { valor: "paga_direto", rotulo: "Paga diretamente pelo cliente" },
];

export const CAT_RESPONSAVEL_PAGAMENTO: Opcao[] = [
  { valor: "contratante", rotulo: "Contratante" },
  { valor: "cada_beneficiario", rotulo: "Cada beneficiário", ajuda: "Uma assinatura por responsável, conforme ANX-COMERCIAL." },
  { valor: "pagador_autorizado", rotulo: "Pagador autorizado" },
];

export const CAT_STATUS_DOCUMENTO: Opcao[] = [
  { valor: "pendente", rotulo: "Pendente de coleta" },
  { valor: "recebido", rotulo: "Recebido" },
  { valor: "conferido", rotulo: "Conferido" },
  { valor: "rejeitado", rotulo: "Rejeitado" },
];

export const CAT_STATUS_CONFLITO: Opcao[] = [
  { valor: "sem_conflito", rotulo: "Sem conflito" },
  { valor: "aberto", rotulo: "Aberto", ajuda: "Bloqueia prévia final, revisão, assinatura e ativação." },
  { valor: "resolvido", rotulo: "Resolvido com correção rastreável" },
];

export const CAT_TIPO_ANEXO: Opcao[] = [
  { valor: "ANX-ESCOPO", rotulo: "Escopo e entregas" },
  { valor: "ANX-PRIVACIDADE", rotulo: "Privacidade e dados" },
  { valor: "ANX-COMERCIAL", rotulo: "Condições comerciais" },
  { valor: "ANX-INDIVIDUAL", rotulo: "Processo individual" },
  { valor: "ANX-REPRESENTACAO", rotulo: "Representação legal" },
];

export const CAT_APLICABILIDADE_ANEXO: Opcao[] = [
  { valor: "obrigatorio", rotulo: "Obrigatório", ajuda: "Ausência bloqueia a versão final." },
  { valor: "aplicavel", rotulo: "Aplicável" },
  { valor: "opcional", rotulo: "Opcional" },
  { valor: "pendente", rotulo: "Pendente de dados" },
  { valor: "em_revisao", rotulo: "Em revisão" },
  { valor: "aprovado", rotulo: "Aprovado" },
  { valor: "substituido", rotulo: "Substituído" },
  { valor: "arquivado", rotulo: "Arquivado" },
  { valor: "nao_aplicavel", rotulo: "Não aplicável" },
];

export const CAT_MOTIVO_ARQUIVAMENTO: Opcao[] = [
  { valor: "substituida_por_nova_versao", rotulo: "Substituída por nova versão" },
  { valor: "cliente_desistiu", rotulo: "Cliente desistiu" },
  { valor: "condicoes_expiradas", rotulo: "Condições expiradas" },
  { valor: "erro_de_registro", rotulo: "Erro de registro" },
  { valor: "reorganizacao_do_caso", rotulo: "Reorganização do caso" },
];

export const CAT_MOTIVO_SUBSTITUICAO: Opcao[] = [
  { valor: "ajuste_de_valor", rotulo: "Ajuste de valor" },
  { valor: "ajuste_de_escopo", rotulo: "Ajuste de escopo" },
  { valor: "mudanca_de_beneficiarios", rotulo: "Mudança de beneficiários" },
  { valor: "correcao_de_dados", rotulo: "Correção de dados" },
];

export const CAT_TIPO_EXCECAO: Opcao[] = [
  { valor: "comercial", rotulo: "Exceção comercial" },
  { valor: "documental", rotulo: "Exceção documental" },
  { valor: "prazo", rotulo: "Exceção de prazo" },
  { valor: "consentimento", rotulo: "Exceção de consentimento" },
];

export const CAT_PRODUTO_SKU: Opcao[] = [
  {
    valor: "CA-CID-AT-001 — Cidadania austríaca — atendimento familiar (§ 58c StbG)",
    rotulo: "CA-CID-AT-001 — Cidadania austríaca familiar (§ 58c StbG)",
    ajuda: "SKU homologado no Planejador para o prefixo CA-CID-AT-FAM.",
  },
];

export const CAT_FORMA_ASSINATURA: Opcao[] = [
  { valor: "eletronica_externa", rotulo: "Eletrônica em plataforma externa", ajuda: "Assinatura registrada manualmente com referência/comprovante." },
  { valor: "fisica_digitalizada", rotulo: "Física digitalizada" },
];

export const CAT_BOOLEANO: Opcao[] = [
  { valor: "sim", rotulo: "Sim" },
  { valor: "nao", rotulo: "Não" },
];
