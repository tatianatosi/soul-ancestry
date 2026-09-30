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
 *   atualização seguinte (rota profunda; não é aba);
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
    navegacao: "Home",
    titulo: "Home",
    descricao: "Sua história, seus próximos passos e as descobertas compartilhadas.",
    vazio: "A história da sua família está sendo preparada para ser compartilhada.",
  },
  jornada: {
    navegacao: "Jornada",
    titulo: "Sua Jornada",
    descricao: "Duas linhas caminham juntas: a história e o seu processo.",
    vazio: "Sua jornada está começando. Novas etapas aparecerão aqui quando estiverem prontas para você.",
  },
  radar: {
    navegacao: "Radar",
    titulo: "Radar Ancestral",
    // RADAR-APP-SEMANTICA-PROGRESSO (18/09/2026): "elegibilidade" induzia
    // leitura de parecer jurídico/chance. Percentuais são progresso/andamento
    // das seis dimensões da jornada, nunca resultado conclusivo.
    descricao: "Seu equilíbrio nas 6 dimensões.",
    vazio: "Este desenho ganhará forma conforme documentos e descobertas forem compartilhados com você.",
  },
  arvore: {
    navegacao: "Árvore",
    titulo: "Árvore Familiar",
    descricao: "Cinco gerações que compõem você.",
    vazio: "Quando um novo vínculo estiver confirmado e pronto para compartilhar, você poderá encontrá-lo aqui e na Jornada.",
  },
  documentos: {
    navegacao: "Documentos",
    titulo: "Documentos",
    descricao: "Pedidos, recebimentos e materiais liberados em um só lugar.",
    vazio: "Ainda não há documentos liberados para você neste momento.",
  },
  entregas: {
    navegacao: "Materiais",
    titulo: "Materiais liberados",
    descricao: "Cada material aparece aqui quando a equipe libera para você.",
    vazio: "Este espaço recebe os materiais assim que houver algo pronto para compartilhar.",
  },
  fase01: {
    navegacao: "Relatório",
    titulo: "Relatório preparado",
    descricao: "Leitura da primeira etapa do seu acompanhamento.",
    vazio: "O relatório desta etapa aparece aqui quando estiver pronto para você.",
  },
  fase02: {
    navegacao: "Atualização",
    titulo: "Atualização seguinte",
    descricao: "Novidades da etapa seguinte do seu acompanhamento.",
    vazio: "A atualização desta etapa aparece aqui quando estiver pronta para você.",
  },
  legado: {
    navegacao: "Legado",
    titulo: "Seus Achados",
    descricao: "Biblioteca da família — seu legado, organizado por coleção.",
    vazio: "Este espaço vai reunir o que for preparado para ficar com a sua família.",
  },
  conta: {
    navegacao: "Conta",
    titulo: "Minha Conta",
    descricao: "Seu espaço para acompanhar novidades e conversar com a equipe.",
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
    navegacao: "Home",
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
