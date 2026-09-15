/**
 * Distribuição do conteúdo publicado pelas sete abas do App Cliente.
 *
 * Funções puras: nada de banco, nada de dedução. Só organiza projeções que a
 * equipe já aprovou ou publicou para o titular. Sem publicação, a aba fica
 * vazia — nunca preenchida com dado interno do Desk.
 */

export type ProjecaoPublicada = {
  id: string;
  tipo: string;
  origem?: string | null;
  resumo?: string | null;
  em?: string | null;
};

export type AbaApp = "Home" | "Jornada" | "Radar" | "Árvore" | "Documentos" | "Legado" | "Conta";

export const ABAS_APP: readonly AbaApp[] = [
  "Home",
  "Jornada",
  "Radar",
  "Árvore",
  "Documentos",
  "Legado",
  "Conta",
];

/** Aba de destino de uma publicação, pela origem canônica do conteúdo. */
export function abaDaPublicacao(p: ProjecaoPublicada): AbaApp | null {
  const chave = `${p.origem ?? ""} ${p.tipo ?? ""}`.toLowerCase();
  if (/lineage|linhagem|arvore|árvore|relationship|parentesco/.test(chave)) return "Árvore";
  if (/evidence|evidencia|evidência|document/.test(chave)) return "Documentos";
  if (/finding|achado|legado|memoria|memória|colec|coleç/.test(chave)) return "Legado";
  if (/milestone|event|case|caso|jornada|resumo|etapa/.test(chave)) return "Jornada";
  return null;
}

/** Publicações de uma aba, da mais recente para a mais antiga. */
export function publicacoesDaAba(
  publicados: readonly ProjecaoPublicada[],
  aba: AbaApp,
): ProjecaoPublicada[] {
  return publicados
    .filter((p) => abaDaPublicacao(p) === aba)
    .slice()
    .sort((a, b) => String(b.em ?? "").localeCompare(String(a.em ?? "")));
}

/** Publicação mais recente do caso, em qualquer aba. */
export function ultimaPublicacao(
  publicados: readonly ProjecaoPublicada[],
): ProjecaoPublicada | null {
  const ordenadas = publicados
    .slice()
    .sort((a, b) => String(b.em ?? "").localeCompare(String(a.em ?? "")));
  return ordenadas[0] ?? null;
}

export type Marco = { id: string; titulo: string; quando: string | null; atual: boolean };

/**
 * Stepper da Jornada: de quatro a seis marcos já publicados. O marco atual é
 * o mais recente; nada é projetado para o futuro.
 */
export function marcosPublicados(publicados: readonly ProjecaoPublicada[]): Marco[] {
  const jornada = publicacoesDaAba(publicados, "Jornada").slice(0, 6).reverse();
  return jornada.map((p, i) => ({
    id: p.id,
    titulo: p.resumo ?? p.tipo,
    quando: p.em ?? null,
    atual: i === jornada.length - 1,
  }));
}

export type DocumentoCliente = { id: string; titulo: string; status?: string | null };

export type SituacaoDocumentos = { solicitados: number; emRevisao: number; liberados: number };

/** Três situações que a família entende: pedido, em conferência e liberado. */
export function situacaoDocumentos(
  documentos: readonly DocumentoCliente[],
): SituacaoDocumentos {
  const combina = (d: DocumentoCliente, re: RegExp) => re.test(String(d.status ?? ""));
  return {
    solicitados: documentos.filter((d) => combina(d, /solicit|pendente|aguard|request/i)).length,
    emRevisao: documentos.filter((d) => combina(d, /revis|analis|conferen|review/i)).length,
    liberados: documentos.filter((d) => combina(d, /liberad|entregue|aprovad|public/i)).length,
  };
}
