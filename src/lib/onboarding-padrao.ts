/**
 * Template operacional padrão de onboarding, reutilizável para todos os casos.
 * Somente planejamento interno: não cria pasta, documento, cobrança ou mensagem externa.
 */

export const TEMPLATE_ONBOARDING_CODIGO = "ONB-PADRAO";
export const TEMPLATE_ONBOARDING_VERSAO = "v1";

export type FaseOnboarding = {
  codigo: string;
  numero: number;
  nome: string;
  objetivo: string;
};

export const FASES_ONBOARDING: FaseOnboarding[] = [
  { codigo: "fase_1_confirmacao_formal", numero: 1, nome: "Confirmação formal", objetivo: "Evidência escrita do aceite registrada no Desk." },
  { codigo: "fase_2_cadastro_escopo", numero: 2, nome: "Cadastro e escopo", objetivo: "Contratante, participantes e escopo da proposta aprovada conferidos." },
  { codigo: "fase_3_contrato_os", numero: 3, nome: "Contrato e OS", objetivo: "Preparação contratual e Anexo I/OS conforme modelo aprovado." },
  { codigo: "fase_4_pagamento", numero: 4, nome: "Pagamento", objetivo: "Cobrança autorizada por humano e pagamento inicial confirmado na fonte transacional." },
  { codigo: "fase_5_onboarding", numero: 5, nome: "Onboarding", objetivo: "Ambiente, acesso, checklist documental e plano de ação." },
  { codigo: "fase_6_caso_ativo", numero: 6, nome: "Caso ativo e primeira entrega", objetivo: "Operação plena com primeira micro-entrega planejada." },
];

export type ItemOnboarding = {
  item: string;
  fase: string;
  ordem: number;
  obrigatorio: boolean;
  prazo_dias: number | null;
  descricao: string;
};

export const CHECKLIST_ONBOARDING: ItemOnboarding[] = [
  { item: "Contrato assinado", fase: "fase_3_contrato_os", ordem: 1, obrigatorio: true, prazo_dias: null, descricao: "Assinatura registrada pelo método homologado." },
  { item: "Pagamento inicial confirmado", fase: "fase_4_pagamento", ordem: 2, obrigatorio: true, prazo_dias: null, descricao: "Confirmação vinda da fonte transacional canônica." },
  { item: "Responsável definido", fase: "fase_2_cadastro_escopo", ordem: 3, obrigatorio: false, prazo_dias: null, descricao: "Derivado do caso (padrão Tatiana). Sem tick manual." },
  { item: "Núcleo familiar e participantes", fase: "fase_2_cadastro_escopo", ordem: 4, obrigatorio: true, prazo_dias: null, descricao: "Signatários, dependentes e representação registrados." },
  { item: "Dossiê-mãe", fase: "fase_5_onboarding", ordem: 5, obrigatorio: true, prazo_dias: 7, descricao: "Dossiê consolidado do caso criado ou vinculado." },
  { item: "Ambiente e nível de acesso", fase: "fase_5_onboarding", ordem: 6, obrigatorio: true, prazo_dias: 3, descricao: "Acesso autorizado por caso, sem URL pública." },
  { item: "Checklist documental", fase: "fase_5_onboarding", ordem: 7, obrigatorio: true, prazo_dias: 5, descricao: "Lista de documentos por participante." },
  { item: "Plano de ação", fase: "fase_5_onboarding", ordem: 8, obrigatorio: true, prazo_dias: 5, descricao: "Sequência de tarefas e responsáveis." },
  { item: "Call de onboarding", fase: "fase_5_onboarding", ordem: 9, obrigatorio: true, prazo_dias: 7, descricao: "Agendada com o cliente pelo canal homologado." },
  { item: "Boas-vindas", fase: "fase_5_onboarding", ordem: 10, obrigatorio: true, prazo_dias: 2, descricao: "Rascunho aprovado por humano antes de qualquer envio." },
  { item: "Primeira micro-entrega prevista", fase: "fase_6_caso_ativo", ordem: 11, obrigatorio: true, prazo_dias: 7, descricao: "Planejada até D7 do onboarding." },
  { item: "Data-limite de atualização contextualizada", fase: "fase_6_caso_ativo", ordem: 12, obrigatorio: true, prazo_dias: 14, descricao: "Nenhum cliente sem atualização por mais de 14 dias." },
];

export const REGRA_VALOR_PERCEBIDO = [
  "Primeira micro-entrega planejada até D7 do início do onboarding.",
  "Nenhum cliente fica sem atualização contextualizada por mais de 14 dias, salvo espera externa comunicada e registrada.",
  "Conteúdo do App Cliente sai apenas de entregas aprovadas e sanitizadas.",
];

export const LIMITE_ALERTA_DIAS = 10;
export const LIMITE_CRITICO_DIAS = 14;
export const LIMITE_PRIMEIRA_ENTREGA_DIAS = 7;

export function diasDesde(data?: string | null): number | null {
  if (!data) return null;
  const t = new Date(data).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}
