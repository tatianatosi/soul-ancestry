/**
 * NAVEGAÇÃO CANÔNICA DO DESK — CA-UX-03 (8 grupos principais)
 *
 * Registro puro de navegação: mapeia grupos → rótulos humanos → rotas já
 * existentes. Não cria dado, não altera dado, não executa ação externa.
 *
 * Regras aplicadas:
 * - Exatamente 8 grupos principais para usuário interno autorizado.
 * - Nenhuma rota operacional é removida: toda rota de menu anterior continua
 *   presente no menu principal ou no menu da conta (ver `ROTAS_PRESERVADAS`).
 * - Marketing é a aba 2 (aquisição, canal, conteúdo, atribuição e análise);
 *   Comercial mantém apenas link contextual, sem duplicar a lista de leads.
 * - Configurações, Equipe, Perfis e Preferências saem da navegação principal e
 *   passam ao menu da conta (`MENU_CONTA`) — sem criar nona aba.
 * - Rótulos de interface mudam; URLs permanecem idênticas.
 */

export type ItemNav =
  { grupo: string } | { to: string; label: string; hash?: string; adminOnly?: boolean };

export type GrupoDesk = {
  id: string;
  /** Rota de entrada do grupo (já existente). */
  to: string;
  label: string;
  /** Descrição curta e humana exibida no menu e no topo do grupo. */
  descricao: string;
  icone:
    | "hoje"
    | "marketing"
    | "comercial"
    | "casos"
    | "pesquisa"
    | "contratos"
    | "cliente"
    | "governanca";

  agrupador?: boolean;
  sub: readonly ItemNav[];
};

export const GRUPOS_DESK: readonly GrupoDesk[] = [
  {
    id: "hoje",
    to: "/painel",
    label: "Hoje",
    descricao: "Fila operacional única do dia, prioridades, alertas derivados e atalhos.",
    icone: "hoje",
    sub: [
      { to: "/painel", label: "Painel Hoje" },
      { to: "/painel", hash: "encontrar-no-desk", label: "Encontrar no Desk" },
      { to: "/metricas", label: "Métricas comerciais e operacionais" },
      { to: "/relatorios", label: "Relatórios" },
    ],
  },
  {
    id: "marketing",
    to: "/marketing",
    label: "Marketing",
    descricao: "Aquisição, canais, campanhas, conteúdo, atribuição e análise por canal.",
    icone: "marketing",
    agrupador: true,
    sub: [
      { grupo: "Aquisição" },
      { to: "/marketing", label: "Visão geral de aquisição" },
      { to: "/marketing", hash: "canais-campanhas", label: "Canais e campanhas" },
      { to: "/marketing", hash: "conteudo-ctas", label: "Conteúdo e CTAs" },
      { grupo: "Origem e análise" },
      { to: "/marketing", hash: "atribuicao", label: "Atribuição e origem" },
      { to: "/marketing", hash: "funil-aquisicao", label: "Funil de aquisição" },
      { to: "/marketing", hash: "metricas-canal", label: "Métricas por canal" },
      { to: "/marketing", hash: "aprendizados", label: "Aprendizados" },
      { grupo: "Handoff" },
      { to: "/marketing", hash: "links-comercial", label: "Links contextuais para Comercial" },
    ],
  },
  {
    id: "comercial",
    to: "/leads",
    label: "Comercial",
    descricao: "Lead identificado, triagem, Discovery, proposta e formalização.",
    icone: "comercial",
    agrupador: true,
    sub: [
      { grupo: "Aquisição" },
      { to: "/marketing", label: "Marketing e aquisição (aba 2)" },

      { to: "/leads", label: "Leads e triagem" },
      { to: "/calls", label: "Calls Discovery" },
      { grupo: "CRM" },
      { to: "/leads", hash: "crm-contatos", label: "CRM, contatos e interações" },
      { to: "/crm-mestre", label: "CRM Mestre, Discovery e handoff" },
      {
        to: "/governanca/dicionario-calls-crm",
        label: "Dicionário de validações (Calls → CRM)",
      },
      { to: "/proximas-acoes", label: "Próximas ações dos leads" },

      { to: "/propostas", label: "Propostas" },
      { to: "/conversao", label: "Conversão, follow-up e handoff" },
      { grupo: "Relacionamento" },
      { to: "/clientes", label: "Clientes e núcleos comerciais" },
      { to: "/matriz-juridica", label: "Validação Jurídica (bloqueios)" },
    ],
  },
  {
    id: "casos",
    to: "/casos",
    label: "Casos",
    descricao: "Casos 360, núcleos, tarefas, exceções, qualidade, onboarding e go-live.",
    icone: "casos",
    agrupador: true,
    sub: [
      { grupo: "Operação do caso" },
      { to: "/casos", label: "Casos 360" },
      { to: "/nucleos", label: "Núcleos familiares e dossiê-mãe" },
      { to: "/tarefas", label: "Tarefas e entregas internas" },
      { to: "/ops", label: "Operação" },
      { to: "/ops-excecoes", label: "Exceções operacionais" },
      { to: "/qualidade", label: "Radar Interno e Qualidade" },
      { grupo: "Ativação" },
      { to: "/piloto", label: "Piloto e go-live" },
      { to: "/piloto-ana", label: "Caso-piloto Ana Luiza" },
      { to: "/casos", hash: "onboarding", label: "Onboarding do caso" },
      { to: "/matriz-juridica", label: "Validação Jurídica (bloqueios)" },
    ],
  },
  {
    id: "pesquisa",
    to: "/pesquisa",
    label: "Pesquisa",
    descricao: "Pesquisa genealógica, evidências, fontes, achados e relatórios F1/F2.",
    icone: "pesquisa",
    agrupador: true,
    sub: [
      { grupo: "Investigação" },
      { to: "/pesquisa-modulo", label: "Pesquisa Genealógica e Evidências" },
      { to: "/pesquisa", label: "Plano de ação e ficha genealógica" },
      { to: "/nucleos", hash: "pessoas-linhagens", label: "Pessoas, famílias e ramos" },
      { grupo: "Fontes e prova" },
      { to: "/fontes-genealogicas", label: "Fontes, consultas e bases genealógicas" },
      { to: "/evidencias", label: "Evidências e documentos" },
      { to: "/privacidade", label: "Privacidade e consentimento" },
      { grupo: "Resultado" },
      { to: "/qualidade", hash: "pesquisa", label: "Validação e pendências" },
      { to: "/relatorios", label: "Achados, microentregas e relatórios F1/F2" },
      { to: "/pesquisa-modulo", hash: "assistente-ia", label: "Assistente IA de pesquisa" },
      { to: "/pesquisa", hash: "historico", label: "Alertas e histórico de pesquisa" },
    ],
  },
  {
    id: "contratos",
    to: "/contratos",
    label: "Contratos e financeiro",
    descricao: "Escopo aprovado, contratos, ordens de serviço, catálogo e financeiro.",
    icone: "contratos",
    agrupador: true,
    sub: [
      { grupo: "Formalização" },
      { to: "/escopo-origem", label: "Propostas aprovadas e origem de escopo" },
      { to: "/contratos", label: "Contratos, versões e anexos" },
      { to: "/contrato-parametros", label: "Parâmetros contratuais" },
      { to: "/ordens-servico", label: "Ordens de serviço" },
      { grupo: "Catálogo" },
      { to: "/catalogo", label: "Catálogo e SKUs" },
      { to: "/homologacao-skus", label: "Homologação de SKUs" },
      { to: "/conciliacao-catalogo", label: "Conciliação de catálogo" },
      { to: "/divergencias-catalogo", label: "Divergências de catálogo" },
      {
        to: "/governanca/catalogo-operacional-30",
        label: "Catálogo Operacional 30 (CA-06)",
      },
      { grupo: "Financeiro" },
      { to: "/financeiro", label: "Condições, faturas e pagamentos internos" },
      { to: "/conciliacao-catalogo", hash: "bloqueios", label: "Bloqueios de cobrança" },
    ],
  },
  {
    id: "cliente",
    to: "/acessos-portal",
    label: "Cliente",
    descricao: "Acessos ao portal, atendimento, solicitações e publicação autorizada.",
    icone: "cliente",
    sub: [
      { to: "/acessos-portal", label: "Acessos ao portal e App Cliente" },
      { to: "/atendimento", label: "Atendimento e solicitações de documentos" },
      { to: "/atendimento", hash: "publicacao", label: "Publicação de entregas autorizadas" },
      // 25/08/2026 — o item apontava para `/acessos-portal#espelho`, âncora que
      // nunca existiu naquela página: o link levava a uma tela de convites, sem
      // espelho nenhum. Passa a apontar para a sessão demo, que é real e usa os
      // componentes do próprio App Cliente. O espelho de caso real (mesma
      // camada, outra fonte de dado) entra como passo seguinte.
      { to: "/app-cliente-demo", label: "Sessão demo do App Cliente" },
    ],
  },
  {
    id: "governanca",
    to: "/biblioteca",
    label: "Governança",
    descricao: "Jurídico, radar interno, bibliotecas, auditoria, conformidade e integrações.",
    icone: "governanca",
    agrupador: true,
    sub: [
      { grupo: "Conformidade" },
      { to: "/matriz-juridica", label: "Validação Jurídica" },
      { to: "/qualidade", label: "Radar Interno e Qualidade" },
      { to: "/governanca/matriz-conformidade", label: "Matriz de conformidade" },
      { to: "/governanca/criterios-aceite", label: "Critérios de aceite" },
      { to: "/governanca/corte-vertical", label: "Corte vertical e fontes" },
      { grupo: "Bibliotecas" },
      { to: "/biblioteca", label: "Biblioteca Mestre" },
      { to: "/biblioteca-mensagens", label: "Biblioteca de Mensagens" },
      { to: "/governanca/contrato-base", label: "Contrato-base consolidado" },
      { to: "/governanca/modelo-individual", label: "Modelo individual + acompanhante" },
      { to: "/governanca/modelo-familiar-casal", label: "Modelo familiar — casal" },
      { to: "/governanca/modelos-contratuais", label: "Matriz de modelos contratuais" },
      { grupo: "Registro e risco" },
      { to: "/auditoria", label: "Auditoria", adminOnly: true },
      { to: "/governanca/decisoes", label: "Decisões" },
      { to: "/governanca/indicadores", label: "Indicadores" },
      { to: "/governanca/inventario-recuperacao", label: "Inventário e recuperação" },
      { to: "/governanca/inventario-patrimonial", label: "Inventário patrimonial" },
      { to: "/governanca/varredura-completude", label: "Completude" },
      { to: "/governanca/modulos-contextuais", label: "Módulos contextuais" },
      {
        to: "/governanca/matriz-equivalencia",
        label: "Matriz de equivalência — rota → dado → estado",
      },
      { to: "/governanca/identificadores", label: "Identificadores" },
      { grupo: "Integrações" },
      { to: "/integracoes", label: "Integrações" },
      { to: "/importacoes", label: "Importações e migração" },
    ],
  },
] as const;

/**
 * Menu da conta (não é grupo principal, não é nona aba).
 * Configurações, Equipe, Perfis/Preferências e verificação administrativa saem
 * da navegação principal e passam a viver no menu da conta / Modo Proprietária,
 * com exatamente as mesmas rotas e as mesmas permissões de antes.
 */
export const MENU_CONTA: {
  id: "conta";
  label: string;
  descricao: string;
  itens: readonly ItemNav[];
} = {
  id: "conta",
  label: "Conta e administração",
  descricao: "Modo Proprietária, equipe, papéis, configurações e verificação de segurança.",
  itens: [
    { to: "/modo-proprietaria", label: "Modo Proprietária" },
    { to: "/equipe", label: "Equipe e papéis", adminOnly: true },
    { to: "/configuracoes", label: "Configurações e preferências" },
    { to: "/etiquetas", label: "Etiquetas canônicas" },
    { to: "/reconfirmar-propriedade", label: "Segurança e reconfirmação de propriedade" },
    { to: "/governanca/varredura-administracao", label: "Verificação administrativa" },
  ],
} as const;

/**
 * Rotas que existiam no menu anterior (7 grupos) e continuam com link direto.
 * Serve de trava de regressão: nenhuma delas pode sumir da navegação.
 */
export const ROTAS_PRESERVADAS: readonly string[] = [
  "/painel",
  "/metricas",
  "/relatorios",
  "/leads",
  "/calls",
  "/proximas-acoes",
  "/propostas",
  "/conversao",
  "/clientes",
  "/casos",
  "/nucleos",
  "/tarefas",
  "/ops-excecoes",
  "/qualidade",
  "/piloto",
  "/piloto-ana",
  "/pesquisa-modulo",
  "/evidencias",
  "/fontes-genealogicas",
  "/privacidade",
  "/contratos",
  "/ordens-servico",
  "/escopo-origem",
  "/conciliacao-catalogo",
  "/divergencias-catalogo",
  "/homologacao-skus",
  "/contrato-parametros",
  "/financeiro",
  "/modo-proprietaria",
  "/reconfirmar-propriedade",
  "/governanca/contrato-base",
  "/governanca/modelo-individual",
  "/governanca/modelo-familiar-casal",
  "/governanca/modelos-contratuais",
  "/catalogo",
  "/biblioteca",
  "/biblioteca-mensagens",
  "/matriz-juridica",
  "/governanca/criterios-aceite",
  "/governanca/matriz-conformidade",
  "/governanca/indicadores",
  "/governanca/decisoes",
  "/governanca/corte-vertical",
  "/governanca/inventario-recuperacao",
  "/governanca/inventario-patrimonial",
  "/governanca/modulos-contextuais",
  "/governanca/matriz-equivalencia",
  "/governanca/identificadores",
  "/governanca/varredura-administracao",
  "/governanca/varredura-completude",
  "/etiquetas",
  "/integracoes",
  "/importacoes",
  "/configuracoes",
  "/acessos-portal",
  "/atendimento",
  "/equipe",
  "/auditoria",
] as const;

/** Todas as rotas com link direto no menu principal ou no menu da conta. */
export function rotasDoMenu(): string[] {
  const set = new Set<string>();
  for (const g of GRUPOS_DESK) {
    set.add(g.to);
    for (const s of g.sub) if ("to" in s) set.add(s.to);
  }
  for (const s of MENU_CONTA.itens) if ("to" in s) set.add(s.to);
  return [...set];
}

/** Rotas presentes apenas no menu da conta (fora dos 8 grupos principais). */
export function rotasDoMenuConta(): string[] {
  return MENU_CONTA.itens.flatMap((s) => ("to" in s ? [s.to] : []));
}

/** Rotas preservadas que perderam link de menu (devem ser zero). */
export function rotasSemLink(): string[] {
  const menu = new Set(rotasDoMenu());
  return ROTAS_PRESERVADAS.filter((r) => !menu.has(r));
}

/**
 * Um mesmo destino (rota + hash) não pode se repetir DENTRO de um grupo.
 * Entre grupos, a repetição é link contextual declarado (ex.: Validação
 * Jurídica em Governança com atalho em Comercial e Casos) — não é fila nova.
 */
export function destinosDuplicados(): string[] {
  const dup: string[] = [];
  for (const g of GRUPOS_DESK) {
    const vistos = new Set<string>();
    for (const s of g.sub) {
      if (!("to" in s)) continue;
      const chave = `${g.id}:${s.to}#${s.hash ?? ""}`;
      if (vistos.has(chave)) dup.push(chave);
      vistos.add(chave);
    }
  }
  return dup;
}

/** Links contextuais: mesma rota citada em mais de um grupo, de forma explícita. */
export const LINKS_CONTEXTUAIS: readonly { rota: string; origem: string; tambemEm: string[] }[] = [
  { rota: "/matriz-juridica", origem: "Governança", tambemEm: ["Comercial", "Casos"] },
  { rota: "/qualidade", origem: "Governança", tambemEm: ["Casos", "Pesquisa"] },
  { rota: "/relatorios", origem: "Hoje", tambemEm: ["Pesquisa"] },
  { rota: "/nucleos", origem: "Casos", tambemEm: ["Pesquisa"] },
  { rota: "/marketing", origem: "Marketing", tambemEm: ["Comercial"] },
] as const;

/** Lacunas conhecidas: sem fonte canônica, permanecem declaradas e não simuladas. */
export const LACUNAS_CONHECIDAS: readonly { item: string; motivo: string }[] = [
  { item: "Radar multi-país", motivo: "Sem fonte canônica definida; nenhum cálculo é simulado." },
  {
    item: "Atividade real de abertura/download no App Cliente",
    motivo: "Só é exibida quando houver evento canônico registrado.",
  },
  {
    item: "Espelho do App Cliente",
    motivo: "Reutiliza exclusivamente a projeção sanitizada; nenhuma cópia é criada.",
  },
] as const;
