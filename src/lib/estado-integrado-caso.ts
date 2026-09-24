/**
 * Textos das linhas do "Estado integrado do caso" acrescentadas na ordem P0
 * transversal (24/09/2026): lead/origem, país/via, pesquisa e próximo
 * passo/bloqueio. Funções puras — o componente só desenha; aqui fica a
 * regra, testada. Nada é inferido: ausência vira texto explícito.
 */

type Linha = Record<string, unknown>;

export function textoLeadOrigem(lead: Linha | null | undefined): string {
  if (!lead) return "Sem lead vinculado ao caso";
  return `${String(lead["nome"] ?? "Lead")} · origem ${String(lead["origem"] ?? "não informada")} · ${String(lead["estagio"] ?? "sem estágio")}`;
}

export function textoPaisVia(caso: Linha): string {
  const pais = caso["pais_linha_prioritaria"] ?? caso["pais"] ?? null;
  const via = caso["via_juridica_preliminar"] ?? caso["via"] ?? null;
  return `${pais ? String(pais) : "País não definido"} · ${via ? String(via) : "via não definida"}`;
}

export type ResumoPesquisa = {
  pessoas: number;
  relacoes: number;
  evidencias: number;
  confirmadas: number;
  achados: number;
};

export function textoPesquisa(p: ResumoPesquisa | null | undefined): string {
  if (!p) return "Pesquisa não iniciada ou não lida";
  return `${p.pessoas} pessoa(s) · ${p.relacoes} relação(ões) · ${p.evidencias} evidência(s), ${p.confirmadas} aprovada(s) · ${p.achados} achado(s)`;
}

export type ProximoPasso = {
  acao: string | null;
  responsavel: string | null;
  prazo: string | null;
  bloqueios: number;
  primeiroBloqueio: string | null;
};

/** "Sem informação" nunca é estado: falta de responsável/prazo é dita. */
export function textoProximoPasso(p: ProximoPasso | null | undefined): string {
  if (!p) return "Próxima ação ainda não calculada";
  const acao = p.acao ?? "Sem próxima ação";
  const quem = p.responsavel ? ` · ${p.responsavel}` : " · sem responsável";
  const quando = p.prazo ? ` · até ${String(p.prazo).slice(0, 10)}` : " · sem prazo";
  const bloqueio =
    p.bloqueios === 0 ? "sem bloqueio real" : `${p.bloqueios} bloqueio(s), primeiro: ${p.primeiroBloqueio ?? "—"}`;
  return `${acao}${quem}${quando} — ${bloqueio}`;
}
