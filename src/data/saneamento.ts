/**
 * Ancestral Canvas — mapa de ORIGEM DOS DADOS e SAÚDE DE SKU.
 *
 * Este módulo existe para deixar explícito, dentro do próprio Canvas, quais blocos
 * dependem diretamente de:
 *   - CA · FIN · Planilha Mestre de Produtos OFICIAL (abas "Catalogo Produtos" e "SKU · Histórico & Status")
 *   - planejador-universal-simulador-todas-cidadanias.xlsx (PARAMETROS, SKUS_REFERENCIA, CASOS, LANCAMENTOS, PAGAMENTOS, PAINEL)
 *   - checklists_go_live_casos_clientes.xlsx / checklist_prioridades_clube_ancestral.xlsx
 *
 * É insumo para o saneamento de SKUs que será feito no Perplexity Computer:
 * nada aqui altera preços ou rótulos — apenas documenta dependências e pontos frágeis.
 */

export type FonteId = "planilha-mestre" | "planejador-universal" | "checklists" | "catalogo-meta-agent";

export type BlocoCanvas = {
  bloco: string;
  onde: "desk" | "app-cliente" | "ambos";
  fontes: FonteId[];
  depende: string;
  ganhoComSaneamento: string;
};

/** Blocos do Canvas × planilhas de origem. */
export const ORIGEM_DADOS_CANVAS: BlocoCanvas[] = [
  {
    bloco: "Seção Propostas",
    onde: "desk",
    fontes: ["planilha-mestre", "planejador-universal"],
    depende: "PORTFOLIO_MESTRE (preço atual/sugerido, papel, gatilho) × CASOS/PARAMETROS (referência total, parcelas).",
    ganhoComSaneamento: "Rótulos de SKU padronizados e preço atual único elimina divergência entre proposta e catálogo.",
  },
  {
    bloco: "Cards Financeiro (por caso)",
    onde: "desk",
    fontes: ["planejador-universal"],
    depende: "CASOS + LANCAMENTOS/PAGAMENTOS (Pago Cliente, Desembolsado Clube, Saldo).",
    ganhoComSaneamento: "SKU saneado permite conciliar lançamento ↔ produto e gerar link de pagamento Asaas por SKU.",
  },
  {
    bloco: "Painel Financeiro universal",
    onde: "desk",
    fontes: ["planejador-universal"],
    depende: "Aba PAINEL (totais de honorários, despesas, taxas, pago, desembolsado).",
    ganhoComSaneamento: "Consolidação por família de produto (F1..F5) em vez de soma por caso.",
  },
  {
    bloco: "Planos WhatsApp (CA-WPP-001, CA-WPP-002, CA-FAM-001, CA-FAM-002)",
    onde: "desk",
    fontes: ["planilha-mestre", "catalogo-meta-agent"],
    depende: "Planilha Mestre para preço atual/sugerido; ainda SEM presença em LANCAMENTOS/PAGAMENTOS.",
    ganhoComSaneamento: "Definir preço final (79→59 / 149→119 / 280→290 / 490) e criar SKU de recorrência com link Asaas.",
  },
  {
    bloco: "Conta / Legado (app cliente)",
    onde: "app-cliente",
    fontes: ["planilha-mestre", "planejador-universal"],
    depende: "PROPOSTAS (referência total, formato recomendado, SKUs inclusos) + PLANO_LEGADO.",
    ganhoComSaneamento: "Nomes comerciais amigáveis por SKU evitam exibir rótulo interno ao cliente.",
  },
  {
    bloco: "Checklists AppCliente e tarefas críticas",
    onde: "ambos",
    fontes: ["checklists"],
    depende: "checklists_go_live_casos_clientes.xlsx + checklist_prioridades_clube_ancestral.xlsx (T-003, T-017, T-018, T-026, T-043).",
    ganhoComSaneamento: "Baixo — não depende de SKU, apenas de status de tarefa.",
  },
];

export type ConjuntoDados = {
  id: FonteId;
  arquivo: string;
  usadoEm: string;
  precisa_saneamento: boolean;
  nota: string;
};

/** Flags simples de saneamento por conjunto de dados. */
export const SANEAMENTO_FONTES: ConjuntoDados[] = [
  {
    id: "planilha-mestre",
    arquivo: "CA · FIN · Planilha Mestre de Produtos OFICIAL.xlsx",
    usadoEm: "Propostas, planos WhatsApp, Conta/Legado",
    precisa_saneamento: true,
    nota: "Preço atual × preço sugerido divergem em vários SKUs; nomes longos e categorias duplicadas.",
  },
  {
    id: "planejador-universal",
    arquivo: "planejador-universal-simulador-todas-cidadanias.xlsx",
    usadoEm: "Financeiro por caso, Painel universal, Propostas",
    precisa_saneamento: true,
    nota: "SKUS_REFERENCIA não cobre todos os SKUs da Planilha Mestre; LANCAMENTOS sem coluna de SKU normalizada.",
  },
  {
    id: "catalogo-meta-agent",
    arquivo: "Catálogo Meta Agent (WhatsApp / recorrência)",
    usadoEm: "Planos WhatsApp familiar",
    precisa_saneamento: true,
    nota: "Ainda não conciliado com a Planilha Mestre; sem link de pagamento Asaas por plano.",
  },
  {
    id: "checklists",
    arquivo: "checklists_go_live_casos_clientes.xlsx + checklist_prioridades_clube_ancestral.xlsx",
    usadoEm: "Checklist AppCliente, Integrações, Alertas",
    precisa_saneamento: false,
    nota: "Estrutura estável; não depende de SKU.",
  },
];

/** Pontos onde o saneamento de SKUs traz ganho direto. */
export const SAUDE_SKU = {
  snapshots: ["output/skus_snapshot.csv", "output/casos_financeiro_snapshot.csv"],
  pontosDeMelhoria: [
    "Rótulos: nome comercial curto por SKU (hoje o nome interno vaza para a Conta do cliente).",
    "Preços: consolidar preço atual × preço sugerido em um único preço vigente.",
    "Cobertura: SKUs da Planilha Mestre ausentes em SKUS_REFERENCIA do planejador universal.",
    "Lançamentos: LANCAMENTOS/PAGAMENTOS sem SKU normalizado — conciliação hoje é por caso.",
    "Asaas: link de pagamento por SKU/recorrência (hoje um link genérico por caso).",
  ],
} as const;
