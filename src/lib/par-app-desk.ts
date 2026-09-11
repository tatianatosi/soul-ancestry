/**
 * Par App ↔ Desk — cada bloco do Desk sabe que tela do cliente ele sustenta.
 *
 * Decisão da Proprietária (26/08/2026), a partir do mockup "Intelligence Desk
 * v2 — visão interna": "veja a simplicidade de antes". A simplicidade daquele
 * mockup não era ter menos coisa; era cada cartão do Desk **nomear o bloco
 * correspondente do App e dizer só a diferença de profundidade** — "App mostra
 * 4–6 marcos principais; aqui vemos todos com tags de risco e prioridade".
 *
 * Fonte: as tabelas "Pontos de unificação" e "Leitura do Desk" do documento de
 * fluxo (WhatsApp → App Cliente → Desk Intelligence). Nada aqui é inventado: o
 * que não está nas tabelas não recebe par.
 *
 * Isto NÃO remove, funde nem move nada — o próprio documento diz "não apagar
 * nem fundir abas agora", e o CA-UX-02 §3.1 proíbe remoção silenciosa de tela
 * aprovada. É camada de leitura, e só.
 */

/**
 * Até onde o conteúdo deste bloco pode chegar ao cliente.
 *
 * Não é decoração: `nunca` marca bloco que não tem projeção nenhuma ao App, e
 * essa é a mesma disciplina da trava de classificação do portal.
 */
export type AlcanceNoCliente = "direto" | "sanitizado" | "nunca";

export type ParAppDesk = {
  /** Chave do bloco no Desk (data-painel-bloco, ou id de tela). */
  chave: string;
  /** A tela do App Cliente que este bloco sustenta. */
  telaApp: string;
  /** O que o cliente vê lá. */
  oQueOClienteVe: string;
  /** O que o Desk vê a mais, aqui. */
  oQueODeskVe: string;
  alcance: AlcanceNoCliente;
};

/**
 * De-para Base × Premium, da planilha
 * "Item · App Cliente Fase 1 (Base) · App + Intelligence Desk v2 (Premium)".
 *
 * É a fonte da diferença de profundidade por item. Ticket NÃO entra aqui: a
 * própria planilha diz "ajustar pela sua planilha", e preço segue bloqueado por
 * DH-001/002/008 — nenhum valor comercial é exibido a partir deste módulo.
 */
export const DE_PARA_BASE_PREMIUM: readonly {
  item: string;
  base: string;
  premium: string;
}[] = [
  {
    item: "Linha do tempo do caso",
    base: "4–6 marcos principais",
    premium: "Versão estendida com insights adicionais",
  },
  {
    item: "Documentos",
    base: "Lista + status + instruções simples",
    premium: "Lista + priorização de riscos + comentários",
  },
  {
    item: "Comunicação",
    base: "Atualizações essenciais + WhatsApp",
    premium: "Atualizações + relatórios consolidados",
  },
  {
    item: "Radar de países",
    base: "Indicação básica (país foco)",
    premium: "Radar multi-país com índice de elegibilidade",
  },
  {
    item: "Árvore / genograma",
    base: "Versão simplificada",
    premium: "Versão avançada com marcação de nós críticos",
  },
  {
    item: "Inteligência interna",
    base: "Organização simples no Desk",
    premium: "Desk completo com matriz de fontes e alertas",
  },
] as const;

export const PARES_APP_DESK: readonly ParAppDesk[] = [
  {
    chave: "jornada",
    telaApp: "Jornada / Timeline",
    oQueOClienteVe: "4–6 marcos principais",
    oQueODeskVe: "Versão estendida, com estágio, prioridade e dias sem toque",
    alcance: "sanitizado",
  },
  {
    chave: "destaque",
    telaApp: "Home / Painel",
    oQueOClienteVe: "Status do caso e sensação de caso vivo",
    oQueODeskVe: "Por que este caso está no topo, com a regra que o colocou lá",
    alcance: "sanitizado",
  },
  {
    chave: "prazos",
    telaApp: "Home / Painel",
    oQueOClienteVe: "Atualizações essenciais e WhatsApp",
    oQueODeskVe: "Quem precisa de um toque e o que faz avançar",
    alcance: "sanitizado",
  },
  {
    chave: "excecoes",
    telaApp: "Documentos",
    oQueOClienteVe: "Lista, status e instruções simples",
    oQueODeskVe: "Priorização de riscos, bloqueio, dono nominal e gate pendente",
    alcance: "sanitizado",
  },
  {
    chave: "fila_priorizada",
    telaApp: "—",
    oQueOClienteVe: "Nada: fila interna não tem espelho no App",
    oQueODeskVe: "Eixos de decisão e fila explicável",
    alcance: "nunca",
  },
  {
    chave: "comercial",
    telaApp: "—",
    oQueOClienteVe: "Nada: SKU, preço, ranking e catálogo nunca aparecem",
    oQueODeskVe: "Proposta, condição e conversão",
    alcance: "nunca",
  },
  {
    chave: "cards",
    telaApp: "—",
    oQueOClienteVe: "Nada: métrica de carteira é leitura interna",
    oQueODeskVe: "Casos, receita, funil e prioridades do mockup",
    alcance: "nunca",
  },
  {
    chave: "descoberta",
    telaApp: "—",
    oQueOClienteVe: "Nada: navegação interna do Desk",
    oQueODeskVe: "Onde encontrar cada assunto no Desk",
    alcance: "nunca",
  },
  {
    chave: "registro",
    telaApp: "Jornada / Timeline",
    oQueOClienteVe: "Marcos já publicados",
    oQueODeskVe: "O que a timeline gravou ontem e na semana",
    alcance: "sanitizado",
  },
  {
    chave: "alertas",
    telaApp: "—",
    oQueOClienteVe: "Nada: alerta interno não dispara sozinho",
    oQueODeskVe: "Achados aguardando leitura humana",
    alcance: "nunca",
  },
] as const;

export function parDoBloco(chave: string): ParAppDesk | null {
  return PARES_APP_DESK.find((p) => p.chave === chave) ?? null;
}

/**
 * Minusculiza só a primeira letra, para a frase emendar.
 *
 * `toLowerCase()` na string inteira rebaixava nome próprio no meio do texto —
 * "onde encontrar cada assunto no desk" saía com a marca em minúscula na tela.
 */
function emendar(texto: string): string {
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}

/**
 * Frase curta no formato do mockup: o que o App mostra, o que o Desk mostra.
 * Devolve null quando o bloco não tem par declarado — sem par, nada é escrito.
 */
export function frasePar(chave: string): string | null {
  const p = parDoBloco(chave);
  if (!p) return null;
  if (p.alcance === "nunca") return `Não chega ao cliente. Aqui: ${emendar(p.oQueODeskVe)}.`;
  return `App mostra ${emendar(p.oQueOClienteVe)}; aqui, ${emendar(p.oQueODeskVe)}.`;
}
