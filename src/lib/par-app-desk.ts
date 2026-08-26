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

export const PARES_APP_DESK: readonly ParAppDesk[] = [
  {
    chave: "jornada",
    telaApp: "Jornada / Timeline",
    oQueOClienteVe: "Progresso e próximos passos",
    oQueODeskVe: "Estágio operacional, prioridade e há quanto tempo está sem toque",
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
    oQueOClienteVe: "Novidades relevantes, quando liberadas",
    oQueODeskVe: "Quem precisa de um toque e o que faz avançar",
    alcance: "sanitizado",
  },
  {
    chave: "excecoes",
    telaApp: "Documentos",
    oQueOClienteVe: "O que já existe e o que falta, em linguagem clara",
    oQueODeskVe: "Bloqueio, dono nominal e gate pendente",
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
    oQueODeskVe: "As cinco métricas de decisão do dia",
    alcance: "nunca",
  },
  {
    chave: "descoberta",
    telaApp: "—",
    oQueOClienteVe: "Nada: navegação interna do Desk",
    oQueODeskVe: "Onde encontrar cada assunto no Desk",
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
