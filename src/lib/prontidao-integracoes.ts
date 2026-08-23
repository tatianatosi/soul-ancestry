/**
 * Matriz de prontidão de integrações — somente leitura.
 *
 * Declara o estado comprovável de cada integração externa. Nada aqui executa
 * envio, cobrança, assinatura, mensagem, publicação ou pesquisa externa.
 */

export type EstadoIntegracao =
  | "VALIDADA_EM_QA"
  | "CONFIGURADA_NAO_TESTADA"
  | "NAO_CONFIGURADA"
  | "BLOQUEADA_POR_DADO"
  | "AGUARDA_CONFIRMACAO_DA_PROPRIETARIA";

export const ROTULO_ESTADO: Record<EstadoIntegracao, string> = {
  VALIDADA_EM_QA: "Validada em QA",
  CONFIGURADA_NAO_TESTADA: "Configurada, não testada",
  NAO_CONFIGURADA: "Não configurada",
  BLOQUEADA_POR_DADO: "Bloqueada por dado",
  AGUARDA_CONFIRMACAO_DA_PROPRIETARIA: "Aguarda confirmação da proprietária",
};

export type ProntidaoIntegracao = {
  chave: string;
  nome: string;
  estado: EstadoIntegracao;
  ambiente: string;
  ultima_validacao: string | null;
  escopo: string;
  habilita: string;
  prerequisitos: string[];
  erro_acionavel: string | null;
  responsavel: string;
  sandbox: boolean;
  exige_confirmacao_final: boolean;
};

/**
 * Estado declarado a partir do que é comprovável hoje no ambiente publicado.
 * Qualquer item sem prova permanece como não testado/não configurado.
 */
export const PRONTIDAO_INTEGRACOES: ProntidaoIntegracao[] = [
  {
    chave: "auth_email",
    nome: "E-mail transacional de autenticação (recuperação e magic link)",
    estado: "BLOQUEADA_POR_DADO",
    ambiente: "Provedor de autenticação do ambiente publicado",
    ultima_validacao: null,
    escopo: "Recuperação de senha da equipe e magic link do cliente",
    habilita: "Definição de senha por e-mail e acesso do cliente por link único",
    prerequisitos: [
      "Domínio de remetente tati.pluggedresearch.com verificado (DNS pendente)",
      "URLs de redirect autorizadas incluindo /equipe/redefinir-senha",
      "Caixa de QA autorizada para teste de entrega",
    ],
    erro_acionavel:
      "Remetente de marca indisponível enquanto o DNS não estiver verificado. Não bloqueia login por senha, sessão, RLS nem papel admin.",
    responsavel: "Proprietária administradora",
    sandbox: false,
    exige_confirmacao_final: true,
  },
  {
    chave: "assinatura_eletronica",
    nome: "Assinatura eletrônica de contrato",
    estado: "NAO_CONFIGURADA",
    ambiente: "Nenhum provedor conectado",
    ultima_validacao: null,
    escopo: "Envio de contrato e coleta de assinatura",
    habilita: "Solicitar assinatura a partir de uma versão contratual concreta",
    prerequisitos: [
      "Provedor contratado e credenciais válidas",
      "Callback/redirect configurado",
      "Versão contratual e anexos materializados no caso",
    ],
    erro_acionavel:
      "Sem provedor: o botão de solicitação de assinatura não envia nada e permanece desabilitado.",
    responsavel: "Proprietária administradora",
    sandbox: false,
    exige_confirmacao_final: true,
  },
  {
    chave: "financeiro_asaas",
    nome: "Financeiro (Asaas) — cobrança e link de pagamento",
    estado: "NAO_CONFIGURADA",
    ambiente: "Nenhuma conexão sandbox ou produção registrada",
    ultima_validacao: null,
    escopo: "Cliente, cobrança, link de pagamento e webhook de baixa",
    habilita: "Emissão de cobrança a partir de condição comercial aprovada",
    prerequisitos: [
      "Chave de ambiente sandbox",
      "Condição comercial aprovada com valor, moeda e destinatário",
      "Regra de idempotência por condição/parcela",
    ],
    erro_acionavel:
      "Sem sandbox disponível não é possível validar emissão; nenhuma cobrança, link ou assinatura foi criada.",
    responsavel: "Proprietária administradora",
    sandbox: false,
    exige_confirmacao_final: true,
  },
  {
    chave: "whatsapp",
    nome: "WhatsApp operacional",
    estado: "NAO_CONFIGURADA",
    ambiente: "Nenhum provedor de canal conectado",
    ultima_validacao: null,
    escopo: "Mensagens operacionais a partir de templates aprovados",
    habilita: "Comunicação com cliente vinculada a caso e template",
    prerequisitos: ["Provedor de canal", "Templates homologados", "Destinatário autorizado no caso"],
    erro_acionavel: "Nenhuma mensagem pode ser enviada; ações permanecem desabilitadas.",
    responsavel: "Proprietária administradora",
    sandbox: false,
    exige_confirmacao_final: true,
  },
  {
    chave: "pesquisa_externa",
    nome: "Pesquisa externa e requisições institucionais",
    estado: "AGUARDA_CONFIRMACAO_DA_PROPRIETARIA",
    ambiente: "Execução manual assistida",
    ultima_validacao: null,
    escopo: "Solicitação a arquivos, cartórios e instituições",
    habilita: "Abertura de pedido externo vinculado a caso e fonte",
    prerequisitos: ["Caso ativo", "Fonte catalogada", "Confirmação final explícita"],
    erro_acionavel:
      "Nenhuma pesquisa externa é disparada automaticamente. Referências seguem pendentes até validação documental humana.",
    responsavel: "Proprietária administradora",
    sandbox: true,
    exige_confirmacao_final: true,
  },
  {
    chave: "webhooks_publicos",
    nome: "Webhooks públicos (/api/public/*)",
    estado: "CONFIGURADA_NAO_TESTADA",
    ambiente: "Ambiente publicado",
    ultima_validacao: null,
    escopo: "Recepção de eventos externos com verificação de assinatura",
    habilita: "Ingestão de eventos sem escrita concorrente em dados reais",
    prerequisitos: ["Segredo de assinatura", "Payload QA isolado", "Log estruturado"],
    erro_acionavel: "Não sincronizado contra dados reais neste trabalho.",
    responsavel: "Proprietária administradora",
    sandbox: true,
    exige_confirmacao_final: false,
  },
  {
    chave: "google_workspace",
    nome: "Google Sheets, Apps Script e Drive",
    estado: "NAO_CONFIGURADA",
    ambiente: "Fora do escopo por decisão registrada",
    ultima_validacao: null,
    escopo: "Planilhas e scripts legados",
    habilita: "Nada no fluxo canônico: o Desk é o CRM canônico",
    prerequisitos: ["Decisão expressa da proprietária para reabrir escopo"],
    erro_acionavel: "Não manter CRM paralelo com escrita concorrente.",
    responsavel: "Proprietária administradora",
    sandbox: false,
    exige_confirmacao_final: true,
  },
];

/** Ações externas que permanecem não executadas por política. */
export const ACOES_EXTERNAS_NAO_EXECUTADAS = [
  "Envio de e-mail real a cliente ou terceiro",
  "Envio de mensagem por WhatsApp",
  "Envio de contrato para assinatura",
  "Criação de cliente, cobrança, link de pagamento ou assinatura financeira",
  "Requisição institucional ou pesquisa externa",
  "Publicação de conteúdo no App Cliente",
  "Alteração de DNS, domínio, plano ou integração externa",
];
