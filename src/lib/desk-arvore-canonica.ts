/**
 * ÁRVORE CANÔNICA DE ABAS DO DESK INTELLIGENCE (CA-UX-01.3)
 *
 * Registro normativo das 14 abas aprovadas do Desk e dos conteúdos que residem
 * dentro de cada uma. Nenhum item filho pode virar aba principal nova; nenhuma
 * aba pode ser removida, renomeada ou deslocada sem matriz de equivalência
 * mockup → rota → dado → estado.
 */

/** Chaves de aba usadas pela navegação do Desk (src/components/desk-app.tsx). */
export type AbaDeskKey =
  | "overview"
  | "crm"
  | "casos"
  | "propostas"
  | "golive"
  | "formalizacao"
  | "appcliente"
  | "financeiro"
  | "checklist"
  | "juridica"
  | "radar"
  | "alertas"
  | "integracoes"
  | "biblio";

export type NoDesk = {
  nome: string;
  /** Sub-itens do nó, quando houver (ex.: Pesquisa Genealógica dentro de Casos 360). */
  filhos?: NoDesk[];
};

export type AbaDesk = {
  chave: AbaDeskKey;
  nome: string;
  conteudos: NoDesk[];
};

export const ARVORE_DESK: AbaDesk[] = [
  {
    chave: "overview",
    nome: "Visão Geral",
    conteudos: [
      { nome: "Painel Hoje" },
      { nome: "KPIs, receita, conversão e funil" },
      { nome: "Alertas executivos" },
      { nome: "Prioridades de hoje" },
    ],
  },
  {
    chave: "crm",
    nome: "CRM Vivo",
    conteudos: [
      { nome: "Leads e oportunidades" },
      { nome: "Discovery e Brief" },
      { nome: "Aceite, proposta e conversão" },
      { nome: "Clientes e núcleos familiares" },
      { nome: "Placego / importações" },
    ],
  },
  {
    chave: "casos",
    nome: "Casos 360",
    conteudos: [
      { nome: "Ficha canônica" },
      { nome: "Timeline" },
      { nome: "Produto, trilha e Blueprint" },
      { nome: "Família, dependentes e etiquetas" },
      {
        nome: "Pesquisa Genealógica",
        filhos: [
          { nome: "Pessoas e linhagens" },
          { nome: "Fontes" },
          { nome: "Documentos" },
          { nome: "Evidências" },
          { nome: "Achados" },
          { nome: "Relatórios" },
          { nome: "Plano de ação" },
        ],
      },
      { nome: "Dossiê e Drive futuro" },
      { nome: "Histórico / auditoria" },
    ],
  },
  {
    chave: "propostas",
    nome: "Propostas",
    conteudos: [
      { nome: "Blueprint" },
      { nome: "Proposta Canva" },
      { nome: "Versões" },
      { nome: "Aceite" },
      { nome: "Completude 1–7" },
    ],
  },
  {
    chave: "golive",
    nome: "Go-live",
    conteudos: [
      { nome: "Gates de ativação" },
      { nome: "Onboarding" },
      { nome: "Dossiê" },
      { nome: "Acessos" },
      { nome: "Primeira entrega" },
    ],
  },
  {
    chave: "formalizacao",
    nome: "Formalização",
    conteudos: [
      { nome: "Preparação contratual" },
      { nome: "Case service" },
      { nome: "Parâmetros" },
      { nome: "Preço homologado" },
      { nome: "OS e anexos" },
      { nome: "Gates" },
    ],
  },
  {
    chave: "appcliente",
    nome: "Checklist AppCliente",
    conteudos: [
      { nome: "Projeções" },
      { nome: "Entregas" },
      { nome: "Fase 1 / Fase 2" },
      { nome: "Documentos visíveis" },
      { nome: "Privacidade" },
      { nome: "Studio de Devolutivas" },
    ],
  },
  {
    chave: "financeiro",
    nome: "Financeiro",
    conteudos: [
      { nome: "Preço de SKU homologado" },
      { nome: "Exceções comerciais" },
      { nome: "Eventos Asaas referenciados" },
      { nome: "Despesas de terceiros" },
      { nome: "Receita mensal" },
    ],
  },
  {
    chave: "checklist",
    nome: "Checklist semanal",
    conteudos: [
      { nome: "Prioridades" },
      { nome: "Tarefas" },
      { nome: "SLA" },
      { nome: "Exceções" },
      { nome: "Carga de trabalho" },
    ],
  },
  {
    chave: "juridica",
    nome: "Validação Jurídica",
    conteudos: [
      { nome: "Matriz jurídica" },
      { nome: "Marcos e fontes oficiais" },
      { nome: "Dependentes / representação" },
      { nome: "Revisão humana" },
    ],
  },
  {
    chave: "radar",
    nome: "Radar Interno",
    conteudos: [
      { nome: "Matriz de prioridade" },
      { nome: "Saúde do caso" },
      { nome: "Radar individual" },
      { nome: "Bloqueios" },
    ],
  },
  {
    chave: "alertas",
    nome: "Alertas",
    conteudos: [
      { nome: "Achados" },
      { nome: "Documentos" },
      { nome: "D10 / D14" },
      { nome: "Gates" },
      { nome: "Fila de comunicação" },
    ],
  },
  {
    chave: "integracoes",
    nome: "Integrações",
    conteudos: [
      { nome: "Importações / migração" },
      { nome: "Placego" },
      { nome: "Drive futuro" },
      { nome: "Asaas futuro" },
      { nome: "Meta Agent futuro" },
      { nome: "Fontes 5B" },
    ],
  },
  {
    chave: "biblio",
    nome: "Biblioteca Mestre",
    conteudos: [
      { nome: "Acervo" },
      { nome: "Bases Genealógicas" },
      { nome: "Dicionários e taxonomias" },
      { nome: "Trilhas de pesquisa" },
      { nome: "Regras jurídicas versionadas" },
      { nome: "Governança" },
      { nome: "Modelos F1 / F2" },
      { nome: "Catálogo Top 30" },
      { nome: "Mapas operacionais" },
      { nome: "Arquivo histórico" },
    ],
  },
];

export const ABAS_DESK_CANONICAS = ARVORE_DESK.map((a) => a.chave);

export function abaCanonica(chave: string): AbaDesk | null {
  return ARVORE_DESK.find((a) => a.chave === chave) ?? null;
}

/** Total de conteúdos declarados, contando sub-itens. */
export function contarConteudos(aba: AbaDesk): number {
  return aba.conteudos.reduce((n, c) => n + 1 + (c.filhos?.length ?? 0), 0);
}

/** Confere se a navegação implementada corresponde exatamente à árvore canônica. */
export function conferirNavegacao(chavesImplementadas: readonly string[]): {
  ok: boolean;
  faltando: string[];
  excedentes: string[];
  ordemPreservada: boolean;
} {
  const faltando = ABAS_DESK_CANONICAS.filter((c) => !chavesImplementadas.includes(c));
  const excedentes = chavesImplementadas.filter((c) => !ABAS_DESK_CANONICAS.includes(c as AbaDeskKey));
  const ordemPreservada = chavesImplementadas.join(",") === ABAS_DESK_CANONICAS.join(",");
  return { ok: faltando.length === 0 && excedentes.length === 0, faltando, excedentes, ordemPreservada };
}
