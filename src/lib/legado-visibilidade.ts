/**
 * LEGADO — VISIBILIDADE E SANITIZAÇÃO (CA-UX-05)
 *
 * Regras:
 * - Legado permanece sempre visível na navegação do App Cliente (mockup aprovado).
 * - Legado NÃO é produto, fase nem entrega liberada automaticamente.
 * - Sem conteúdo autorizado e publicado, exibe apenas estado vazio sanitizado.
 * - Só aparece o que vier de app_projection ou client_deliverable autorizado,
 *   sanitizado e publicado.
 * - Nunca expõe fontes, evidências brutas, hipóteses, riscos, dados de terceiros,
 *   documentos internos, preços ou dados de pesquisa.
 */

export type OrigemLegado = "app_projection" | "client_deliverable";

export type ItemLegadoBruto = {
  titulo: string;
  texto?: string | null;
  pessoa_relacionada?: string | null;
  data?: string | null;
  /** Origem autorizada da projeção. Qualquer outra origem é descartada. */
  origem?: OrigemLegado | string | null;
  /** Autorização humana registrada no Desk. */
  autorizado?: boolean;
  /** Publicação explícita no App Cliente. */
  publicado?: boolean;
  /** Campos internos que nunca podem ser projetados. */
  tipo_evidencia?: string | null;
  fonte?: string | null;
  hipotese?: string | null;
  risco?: string | null;
  preco?: number | string | null;
  documento_interno?: string | null;
};

export type ItemLegadoPublicado = {
  titulo: string;
  texto: string;
  pessoa_relacionada: string;
  data: string;
  origem: OrigemLegado;
};

export type EstadoLegado = "sem_conteudo_publicado" | "com_conteudo_publicado";

export type ResultadoLegado = {
  /** Legado nunca sai do menu. */
  navegavel: true;
  estado: EstadoLegado;
  titulo: string;
  mensagem: string;
  itens: ItemLegadoPublicado[];
  /** Legado não é produto/fase: nunca há CTA de contratação aqui. */
  permiteUpsell: false;
};

const ORIGENS_AUTORIZADAS: OrigemLegado[] = ["app_projection", "client_deliverable"];

/** Termos internos que jamais podem chegar ao App Cliente pelo Legado. */
export const TERMOS_INTERNOS_LEGADO = [
  "hipótese",
  "hipotese",
  "risco",
  "evidência bruta",
  "evidencia bruta",
  "fonte:",
  "arquivo interno",
  "documento interno",
  "sku",
  "r$",
  "honorário",
  "honorario",
  "preço",
  "preco",
  "pesquisa externa",
] as const;

export const LEGADO_VAZIO_TITULO = "Ainda não há conteúdo publicado";
export const LEGADO_VAZIO_MENSAGEM =
  "Quando um material do seu acompanhamento for aprovado e publicado pela equipe, ele aparece aqui.";
export const LEGADO_DISPONIVEL_TITULO = "Conteúdo publicado";
export const LEGADO_DISPONIVEL_MENSAGEM =
  "Estes materiais foram aprovados e publicados pela equipe para o seu acompanhamento.";

export function contemTermoInterno(texto?: string | null): boolean {
  const t = (texto ?? "").toLowerCase();
  if (!t) return false;
  return TERMOS_INTERNOS_LEGADO.some((termo) => t.includes(termo));
}

function limpar(valor?: string | null): string {
  const v = (valor ?? "").trim();
  if (!v) return "";
  return contemTermoInterno(v) ? "" : v;
}

/** Retorna o item sanitizado, ou null quando não pode ser projetado. */
export function sanitizarItemLegado(item: ItemLegadoBruto | null | undefined): ItemLegadoPublicado | null {
  if (!item) return null;
  const origem = (item.origem ?? "") as OrigemLegado;
  if (!ORIGENS_AUTORIZADAS.includes(origem)) return null;
  if (item.autorizado !== true || item.publicado !== true) return null;

  const titulo = limpar(item.titulo);
  if (!titulo) return null;

  return {
    titulo,
    texto: limpar(item.texto),
    pessoa_relacionada: limpar(item.pessoa_relacionada),
    data: limpar(item.data),
    origem,
  };
}

export function visibilidadeLegado(itens?: ItemLegadoBruto[] | null): ResultadoLegado {
  const publicados = (itens ?? [])
    .map(sanitizarItemLegado)
    .filter((i): i is ItemLegadoPublicado => i !== null);

  if (publicados.length === 0) {
    return {
      navegavel: true,
      estado: "sem_conteudo_publicado",
      titulo: LEGADO_VAZIO_TITULO,
      mensagem: LEGADO_VAZIO_MENSAGEM,
      itens: [],
      permiteUpsell: false,
    };
  }

  return {
    navegavel: true,
    estado: "com_conteudo_publicado",
    titulo: LEGADO_DISPONIVEL_TITULO,
    mensagem: LEGADO_DISPONIVEL_MENSAGEM,
    itens: publicados,
    permiteUpsell: false,
  };
}
