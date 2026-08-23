/**
 * CA-OPS-02 — Matriz de capacidades da jornada.
 *
 * Módulo puro e somente-leitura. Reconcilia, para cada capacidade do Desk:
 * o que os mockups/estudos definem, o estado atual do Desk, o papel
 * operacional correto, a rota canônica, os elos da cadeia CA-OPS-01 que a
 * capacidade cobre e as guardas que continuam valendo.
 *
 * Não executa, não persiste e não envia nada.
 */

import { ELOS_CADEIA, type EloCadeia } from "./orquestracao-jornada";

export const CAPACIDADES = [
  "biblioteca_mensagens",
  "whatsapp",
  "crm_calls",
  "onboarding",
  "microentregas",
  "alertas",
  "cadencia",
  "indicadores",
  "app_cliente",
] as const;
export type Capacidade = (typeof CAPACIDADES)[number];

export type LinhaCapacidade = {
  capacidade: Capacidade;
  rotulo: string;
  /** O que os mockups/estudos definem. */
  definicaoMockup: string;
  /** Como está hoje no Desk operacional. */
  deskAtual: string;
  /** Papel operacional correto (destino desta reconciliação). */
  papelOperacional: string;
  /** Rota canônica onde a capacidade é operada. */
  rotaCanonica: string;
  /** Elos da cadeia CA-OPS-01 cobertos pela capacidade. */
  elos: readonly EloCadeia[];
  /** Guardas invioláveis que permanecem ativas. */
  guardas: readonly string[];
  /** Nenhuma capacidade executa ação externa por conta própria. */
  acaoExternaAutomatica: false;
};

export const MATRIZ_CAPACIDADES: readonly LinhaCapacidade[] = [
  {
    capacidade: "biblioteca_mensagens",
    rotulo: "Biblioteca de Mensagens",
    definicaoMockup: "Templates governados e comunicação por jornada.",
    deskAtual: "Biblioteca isolada em /biblioteca-mensagens.",
    papelOperacional:
      "Repositório de templates acionável por etapa e evento, com versão vigente resolvida automaticamente.",
    rotaCanonica: "/biblioteca-mensagens",
    elos: ["template_sugerido", "rascunho_ou_microentrega"],
    guardas: [
      "sugestão nasce sempre como rascunho_interno",
      "somente versão vigente da etapa/canal é sugerida",
      "template expirado gera alerta, nunca envio",
    ],
    acaoExternaAutomatica: false,
  },
  {
    capacidade: "whatsapp",
    rotulo: "WhatsApp",
    definicaoMockup: "Atualização essencial ao cliente; onboarding por WhatsApp previsto.",
    deskAtual: "Integração externa desligada.",
    papelOperacional: "Prévia e fila interna; envio só após configuração homologada e gate liberado.",
    rotaCanonica: "/integracoes",
    elos: ["publicacao_ou_fila"],
    guardas: [
      "envio externo permanece desligado",
      "fila interna não dispara mensagem",
      "confirmação humana final é obrigatória",
    ],
    acaoExternaAutomatica: false,
  },
  {
    capacidade: "crm_calls",
    rotulo: "CRM e Calls",
    definicaoMockup: "Lead, interação, responsável e próxima ação datada.",
    deskAtual: "Leads, Calls e Conversão existem.",
    papelOperacional: "Disparar tarefa e sugerir template pela fase/evento do caso.",
    rotaCanonica: "/leads",
    elos: ["evento_ou_fase", "regra_de_jornada", "tarefa_responsavel_prazo"],
    guardas: [
      "sem promoção automática de lead para cliente",
      "tarefa exige responsável e prazo para ficar completa",
    ],
    acaoExternaAutomatica: false,
  },
  {
    capacidade: "onboarding",
    rotulo: "Onboarding",
    definicaoMockup: "Contrato + pagamento + checklist mínimo antes de ativar.",
    deskAtual: "Gates e checklist existem.",
    papelOperacional: "Criar cadência de acolhimento e primeira entrega assim que os gates estiverem cumpridos.",
    rotaCanonica: "/onboarding/$id",
    elos: ["regra_de_jornada", "tarefa_responsavel_prazo"],
    guardas: ["contrato assinado e pagamento confirmados no servidor", "gate pendente bloqueia ativação"],
    acaoExternaAutomatica: false,
  },
  {
    capacidade: "microentregas",
    rotulo: "Microentregas",
    definicaoMockup: "21 tipos, rascunho → revisão → aprovado → publicado → arquivado.",
    deskAtual: "Entregas/atendimento e publicação existem.",
    papelOperacional: "Conectar cada microentrega a fase, responsável, prazo e atualização ao cliente.",
    rotaCanonica: "/atendimento",
    elos: ["rascunho_ou_microentrega", "revisao_humana", "publicacao_ou_fila", "touchpoint_ou_entrega"],
    guardas: [
      "resumo interno obrigatório; resumo do cliente obrigatório para publicar",
      "somente estado publicado projeta ao App Cliente",
      "conteúdo projetado é sanitizado, sem juízo de mérito",
    ],
    acaoExternaAutomatica: false,
  },
  {
    capacidade: "alertas",
    rotulo: "Alertas",
    definicaoMockup: "Achados e notificações.",
    deskAtual: "Derivados e consolidados no Painel Hoje.",
    papelOperacional: "Sinalizar exceção e abrir o objeto canônico com a ação correspondente.",
    rotaCanonica: "/painel",
    elos: ["alerta_derivado"],
    guardas: ["alerta é visão derivada, nunca entidade própria", "sem duplicação entre painéis"],
    acaoExternaAutomatica: false,
  },
  {
    capacidade: "cadencia",
    rotulo: "Cadência",
    definicaoMockup: "Touchpoint em até 14 dias; regular / atenção / crítico.",
    deskAtual: "Tarefas e Painel Hoje existem.",
    papelOperacional: "Regra única de cadência, com próximo marco verificável por caso.",
    rotaCanonica: "/painel",
    elos: ["touchpoint_ou_entrega", "cadencia_recalculada"],
    guardas: [
      "touchpoint só conta com os 4 fatores preenchidos",
      "espera de instituição externa exige motivo registrado",
    ],
    acaoExternaAutomatica: false,
  },
  {
    capacidade: "indicadores",
    rotulo: "Indicadores",
    definicaoMockup: "Saúde do caso e funil.",
    deskAtual: "Fase B consolidou métricas.",
    papelOperacional: "Medir o resultado dos fluxos, sem criar cards concorrentes.",
    rotaCanonica: "/metricas",
    elos: ["painel_hoje"],
    guardas: ["teto de 5 métricas primárias", "sem fonte homologada exibe 'Sem dados suficientes'"],
    acaoExternaAutomatica: false,
  },
  {
    capacidade: "app_cliente",
    rotulo: "App Cliente",
    definicaoMockup: "Jornada, documentos, entregas e histórico.",
    deskAtual: "Portal real mais simples.",
    papelOperacional: "Receber somente microentrega publicada e atualizações autorizadas.",
    rotaCanonica: "/portal",
    elos: ["publicacao_ou_fila"],
    guardas: [
      "App Cliente é projeção, nunca fonte",
      "assistente transversal não aparece no portal",
      "nenhum nome técnico de tabela exposto",
    ],
    acaoExternaAutomatica: false,
  },
];

export function capacidade(id: Capacidade): LinhaCapacidade {
  const linha = MATRIZ_CAPACIDADES.find((l) => l.capacidade === id);
  if (!linha) throw new Error(`Capacidade desconhecida: ${id}`);
  return linha;
}

export function capacidadesDoElo(elo: EloCadeia): readonly LinhaCapacidade[] {
  return MATRIZ_CAPACIDADES.filter((l) => l.elos.includes(elo));
}

/** Elos da cadeia CA-OPS-01 que nenhuma capacidade cobre. */
export function elosSemCobertura(): readonly EloCadeia[] {
  return ELOS_CADEIA.filter((elo) => capacidadesDoElo(elo).length === 0);
}
