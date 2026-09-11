/**
 * Planejador Universal — os 9 produtos-pai canônicos e a leitura agrupada do
 * catálogo multipaís (`planner_catalog_feed`).
 *
 * Camada pura: não lê banco, não escreve, não decide preço. Decisão de
 * taxonomia (PP-01–09, não PP-01–08) confirmada pela proprietária em
 * 07/09/2026, resolvendo a pergunta 6 de
 * docs/arquitetura/2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md.
 */
import type { ItemPlannerCatalogFeed } from "@/lib/planejador-produtos-pai.functions";

export type ProdutoPai = {
  id: string;
  nome: string;
  faseDaVida: string;
};

/** Ordem e rótulos canônicos — seção 1 do Motor do Planejador (04/09, v1.1). */
export const PRODUTOS_PAI_CANONICOS: ProdutoPai[] = [
  { id: "PP-01", nome: "Diagnóstico Familiar Multipaís", faseDaVida: "Descoberta" },
  { id: "PP-02", nome: "Diagnóstico de Cidadania por Etapas", faseDaVida: "Diagnóstico" },
  { id: "PP-03", nome: "Pesquisa Genealógica por Ramo Familiar", faseDaVida: "Prova e pesquisa" },
  { id: "PP-04", nome: "Preparação de Prova e Pasta Documental", faseDaVida: "Prova e pesquisa" },
  { id: "PP-05", nome: "Estratégia de Via e Composição Familiar", faseDaVida: "Estratégia" },
  { id: "PP-06", nome: "Acompanhamento Familiar de Nacionalidade", faseDaVida: "Execução" },
  { id: "PP-07", nome: "Regularização e Vida Civil Pós-Reconhecimento", faseDaVida: "Pós-reconhecimento" },
  { id: "PP-08", nome: "História de Família, Memória e Legado", faseDaVida: "Memória e legado" },
  { id: "PP-09", nome: "Continuidade e Acervo Familiar", faseDaVida: "Continuidade" },
];

export type GrupoProdutoPai = {
  produtoPai: ProdutoPai | null;
  itens: ItemPlannerCatalogFeed[];
  paisesCobertos: string[];
};

/**
 * Agrupa a lista-alimento por produto-pai, na ordem canônica. Itens sem
 * `product_parent` (ambiguidade real, nunca resolvida pelos documentos-fonte
 * — ex.: CA-CID-021) caem em um grupo à parte, nunca escondidos.
 */
export function agruparPorProdutoPai(itens: ItemPlannerCatalogFeed[]): GrupoProdutoPai[] {
  const porNome = new Map<string, ItemPlannerCatalogFeed[]>();
  for (const item of itens) {
    const chave = item.product_parent ?? "__sem_produto_pai__";
    const lista = porNome.get(chave) ?? [];
    lista.push(item);
    porNome.set(chave, lista);
  }

  const grupos: GrupoProdutoPai[] = [];
  for (const pp of PRODUTOS_PAI_CANONICOS) {
    const lista = porNome.get(pp.nome) ?? [];
    porNome.delete(pp.nome);
    grupos.push({
      produtoPai: pp,
      itens: lista,
      paisesCobertos: paisesUnicos(lista),
    });
  }

  // Produtos-pai citados na lista-alimento mas fora dos 9 canônicos (não deveria
  // acontecer após a reconciliação de 04/09, mas nunca escondido se acontecer).
  for (const [nome, lista] of porNome) {
    if (nome === "__sem_produto_pai__") continue;
    grupos.push({
      produtoPai: { id: "?", nome, faseDaVida: "Fora da lista canônica de 9" },
      itens: lista,
      paisesCobertos: paisesUnicos(lista),
    });
  }

  const semProdutoPai = porNome.get("__sem_produto_pai__") ?? [];
  if (semProdutoPai.length) {
    grupos.push({ produtoPai: null, itens: semProdutoPai, paisesCobertos: paisesUnicos(semProdutoPai) });
  }

  return grupos;
}

function paisesUnicos(itens: ItemPlannerCatalogFeed[]): string[] {
  const s = new Set<string>();
  for (const item of itens) {
    for (const p of item.country_scope ?? []) s.add(p);
  }
  return [...s].sort();
}

/** Rótulo legível dos códigos de país/via usados em `country_scope`. */
export const ROTULO_PAIS: Record<string, string> = {
  IT: "Itália",
  PT: "Portugal",
  ES: "Espanha",
  DE: "Alemanha",
  PL: "Polônia",
  HU: "Hungria",
  AT: "Áustria",
  LU: "Luxemburgo",
  HR: "Croácia",
  RO: "Romênia",
  IE: "Irlanda",
  BR: "Brasil (naturalização)",
  FR: "França (naturalização)",
};

export function rotuloPais(codigo: string): string {
  return ROTULO_PAIS[codigo] ?? codigo;
}

export type EnriquecimentoProdutoPai = {
  produto_pai: string | null;
  status_reconciliacao: string | null;
};

/**
 * CA09-CATALOGO-PRODUTOS-PAI (09/09/2026) — mapa único código→produto-pai,
 * extraído de `caso-canonico.functions.ts` para que Caso e Catálogo leiam o
 * mesmo enriquecimento, nunca dois cálculos separados. `item_id` e
 * `legacy_aliases` cobrem tanto o código vigente quanto códigos antigos do
 * mesmo item na lista-alimento (`planner_catalog_feed`).
 */
export function construirMapaProdutoPaiPorCodigo(
  feed: ReadonlyArray<{
    item_id: string;
    product_parent: string | null;
    status_dictionary: string | null;
    legacy_aliases?: readonly string[] | null;
  }>,
): Map<string, EnriquecimentoProdutoPai> {
  const mapa = new Map<string, EnriquecimentoProdutoPai>();
  for (const item of feed) {
    const valor = { produto_pai: item.product_parent ?? null, status_reconciliacao: item.status_dictionary ?? null };
    mapa.set(String(item.item_id), valor);
    for (const alias of item.legacy_aliases ?? []) mapa.set(String(alias), valor);
  }
  return mapa;
}

/** Produto-pai + status de reconciliação de um código, ou ambos nulos se o código não está na lista-alimento. */
export function produtoPaiDoCodigo(
  codigo: string | null | undefined,
  mapa: Map<string, EnriquecimentoProdutoPai>,
): EnriquecimentoProdutoPai {
  return mapa.get(String(codigo ?? "")) ?? { produto_pai: null, status_reconciliacao: null };
}

/** Itens da lista-alimento que o motor não oferece — nunca viram opção no Planejador. */
export const STATUS_FORA_DO_MOTOR = ["NAO_USAR_NO_MOTOR", "ARQUIVADO_DECISAO_PROPRIETARIA"] as const;

export function itemAlimentoOfereceNoMotor(status: string | null | undefined): boolean {
  if (!status) return true;
  return !(STATUS_FORA_DO_MOTOR as readonly string[]).includes(status);
}
