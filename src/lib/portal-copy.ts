/**
 * COPY CANÔNICO DO APLICATIVO CLIENTE (portal).
 *
 * Fonte única de linguagem para navegação, títulos, cartões, botões,
 * estados vazios, preparação, indisponibilidade e erro.
 *
 * Regras invioláveis:
 * - português brasileiro, humano, acolhedor, sem prometer prazo;
 * - nenhum termo de operação interna (Desk, CRM, banco, fila, gate, SLA,
 *   registro técnico, código, SKU, preço técnico, hipótese, risco);
 * - nenhum juízo de mérito sobre o caso e nenhuma linguagem de venda na
 *   Fase 02;
 * - nenhuma mensagem vaga ("erro desconhecido", "sem dados", "nenhum
 *   registro encontrado", "null", "undefined").
 */

import type { EstadoVisibilidade } from "@/lib/app-visibilidade";

/** Título curto de cada estado, em linguagem de cliente. */
export const COPY_ESTADO_TITULO: Record<EstadoVisibilidade, string> = {
  always_available: "Disponível para você",
  available_empty: "Ainda sem material publicado",
  in_preparation: "Em preparação pela equipe",
  contracted_not_released: "Faz parte da sua jornada",
  released: "Disponível para você",
  not_applicable: "Fora do seu percurso atual",
  hidden_by_permission: "Área indisponível neste acesso",
};

/** Texto de cada estado. Sem prazo, sem promessa e sem termo interno. */
export const COPY_ESTADO_TEXTO: Record<EstadoVisibilidade, string> = {
  always_available: "Você pode acompanhar esta parte da sua jornada sempre que quiser.",
  available_empty:
    "Este espaço vai receber conteúdo assim que houver material apropriado para compartilhar com você.",
  in_preparation:
    "A equipe está preparando esta etapa com cuidado. Assim que estiver pronta, ela aparece aqui para você.",
  contracted_not_released:
    "Esta etapa faz parte do seu acompanhamento e ainda não foi disponibilizada.",
  released: "Aqui está o material já preparado e liberado para você.",
  not_applicable: "Esta etapa não faz parte do percurso combinado para o seu acompanhamento.",
  hidden_by_permission: "Esta área não está disponível no seu acesso. A equipe pode orientar você.",
};

/** Uma tela do App Cliente, com toda a sua linguagem reunida. */
export type CopyTela = {
  navegacao: string;
  titulo: string;
  descricao: string;
  vazio: string;
};

export const COPY_TELAS = {
  home: {
    navegacao: "Início",
    titulo: "Sua jornada",
    descricao: "Um resumo simples de onde o seu acompanhamento está agora.",
    vazio: "Assim que houver algo preparado para você, ele aparece aqui.",
  },
  jornada: {
    navegacao: "Jornada",
    titulo: "Jornada",
    descricao: "As etapas do seu acompanhamento, contadas em linguagem simples.",
    vazio: "Ainda não há atualizações publicadas. Este espaço é atualizado a cada nova etapa concluída.",
  },
  radar: {
    navegacao: "Radar",
    titulo: "Radar Ancestral",
    descricao: "Seu equilíbrio nas 6 dimensões da jornada. Nada aqui é conclusão sobre a sua história.",
    vazio: "Estas leituras aparecem assim que houver material preparado para compartilhar.",
  },
  arvore: {
    navegacao: "Árvore",
    titulo: "Árvore da família",
    descricao: "Pessoas, vínculos e datas aparecem aqui depois de confirmados pela equipe.",
    vazio: "Nenhuma pessoa ou ligação familiar foi publicada até agora.",
  },
  documentos: {
    navegacao: "Documentos",
    titulo: "Documentos",
    descricao: "Aqui ficam os documentos preparados para você e os que você compartilhou conosco.",
    vazio: "Ainda não há documentos preparados para você neste momento.",
  },
  entregas: {
    navegacao: "Entregas",
    titulo: "Entregas da jornada",
    descricao: "Cada entrega aparece aqui quando estiver pronta para você.",
    vazio: "Este espaço vai receber as entregas assim que houver material pronto para compartilhar.",
  },
  fase01: {
    navegacao: "Fase 01",
    titulo: "Fase 01",
    descricao: "Como está a primeira fase do seu acompanhamento.",
    vazio: "O material desta fase aparece aqui quando estiver pronto para você.",
  },
  fase02: {
    navegacao: "Fase 02",
    titulo: "Fase 02",
    descricao: "Como está a segunda fase do seu acompanhamento.",
    vazio: "O material desta fase aparece aqui quando estiver pronto para você.",
  },
  legado: {
    navegacao: "Legado",
    titulo: "Legado",
    descricao: "Materiais preparados para permanecer com a sua família.",
    vazio: "Este espaço vai reunir o que for preparado para ficar com a sua família.",
  },
  conta: {
    navegacao: "Conta",
    titulo: "Sua conta",
    descricao: "Os dados do seu acesso ao Clube Ancestral.",
    vazio: "As informações do seu acesso aparecem aqui.",
  },
  faturas: {
    navegacao: "Faturas",
    titulo: "Faturas",
    descricao: "Aqui ficam as faturas disponibilizadas para você.",
    vazio: "Não há faturas disponíveis para você neste momento.",
  },
  proposta: {
    navegacao: "Proposta",
    titulo: "Proposta",
    descricao: "O resumo do que foi apresentado a você pela equipe.",
    vazio: "A sua proposta aparece aqui assim que estiver disponível para consulta.",
  },
  casos: {
    navegacao: "Início",
    titulo: "Seu acompanhamento",
    descricao: "Aqui aparece o acompanhamento disponível para o seu acesso.",
    vazio: "Ainda não há um acompanhamento disponível para o seu acesso.",
  },
  atendimento: {
    navegacao: "Atendimento",
    titulo: "Atendimento",
    descricao: "Sua conversa direta com a equipe do Clube Ancestral.",
    vazio: "Ainda não há mensagens nesta conversa.",
  },
} as const satisfies Record<string, CopyTela>;

export type ChaveTelaCopy = keyof typeof COPY_TELAS;

/** Mensagens transversais de estado da interface. */
export const COPY_GERAL = {
  carregando: "Carregando as suas informações…",
  erro:
    "Não conseguimos carregar esta parte agora. Tente novamente em instantes — se continuar assim, a equipe pode ajudar você.",
  indisponivel: "Esta área não está disponível para o seu acesso no momento.",
  semPermissao: "Este conteúdo não está disponível no seu acesso. A equipe pode orientar você.",
  sair: "Sair",
  voltar: "Voltar",
  irParaConteudo: "Ir para o conteúdo",
  atualizadoRecentemente: "Atualizado recentemente",
} as const;

/**
 * Termos que jamais podem aparecer em superfície de cliente.
 * Usado nos testes de copy do portal.
 */
export const TERMOS_PROIBIDOS_CLIENTE = [
  "desk",
  "crm",
  "rls",
  "webhook",
  "pipeline",
  "gate",
  "sla",
  "touchpoint",
  "sku",
  "backlog",
  "mockup",
  "seed",
  "placeholder",
  "erro desconhecido",
  "null",
  "undefined",
  "sem dados",
  "nenhum registro encontrado",
  "hipótese",
  "risco",
  "upsell",
  "contrate",
  "adquira",
] as const;

/** `true` quando o texto contém termo interno proibido ao cliente. */
export function contemTermoProibido(texto: string): boolean {
  const t = texto.toLowerCase();
  return TERMOS_PROIBIDOS_CLIENTE.some((termo) => new RegExp(`(^|[^a-zà-ú])${termo}([^a-zà-ú]|$)`, "i").test(t));
}
