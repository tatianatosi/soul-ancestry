/**
 * Corte D (08/10/2026) — Planejador, países e SKU no motor contratual.
 *
 * Medido no banco vivo antes de escrever este módulo:
 *  - `planner_catalog_feed`: 99 itens vivos, 8 produtos-pai distintos,
 *    20 países em `country_scope` — e `country_scope` guarda **ISO-2**
 *    (`AT`, `IT`, `PT`…), não o nome do país.
 *  - `crm_casos.pais_linha_prioritaria` guarda o nome em minúsculas
 *    (`austria`), e `case_plans.rota_confirmada` guarda com acento
 *    (`Áustria`). Três grafias para a mesma coisa.
 *  - `CAT_PRODUTO_SKU` tinha **uma** opção fixa, com o código real
 *    `CA-CID-AT-001` colado num nome que o catálogo nunca emitiu
 *    ("Cidadania austríaca — atendimento familiar (§ 58c StbG)"). O nome
 *    real do item no feed é "Consultoria e Acompanhamento de Cidadania
 *    Austríaca". A string inteira está gravada hoje em
 *    `contract_parameter_values.produto_sku` do contrato da Ana.
 *
 * Este módulo é a leitura em cascata: país do caso → itens do catálogo
 * daquele país → produto-pai → SKU. Nada aqui inventa código, nome ou
 * país: o rótulo vem sempre de `item_id` + `name` do próprio feed.
 *
 * Camada pura: não lê banco, não escreve, não decide preço.
 */
import type { Opcao } from "@/lib/parametros-catalogos";
import { produtoPaiPorId } from "@/lib/planejador-produtos-pai";

/** Item do `planner_catalog_feed` como o leitor entrega. */
export type ItemCatalogoFeed = {
  itemId: string;
  nome: string | null;
  produtoPai: string | null;
  statusDicionario: string | null;
  paises: readonly string[] | null;
};

/**
 * De-para de LEITURA entre o nome do país (como o caso guarda) e o ISO-2
 * (como o feed guarda). Só os 20 países que existem hoje em
 * `planner_catalog_feed.country_scope`; os nomes são os mesmos já usados em
 * `marcos-fontes-oficiais.ts`. Isto nunca vira valor gravado.
 */
export const ISO_POR_PAIS: Readonly<Record<string, string>> = {
  alemanha: "DE",
  austria: "AT",
  belgica: "BE",
  brasil: "BR",
  croacia: "HR",
  eslovenia: "SI",
  espanha: "ES",
  estonia: "EE",
  franca: "FR",
  hungria: "HU",
  irlanda: "IE",
  italia: "IT",
  letonia: "LV",
  lituania: "LT",
  luxemburgo: "LU",
  "paises baixos": "NL",
  polonia: "PL",
  portugal: "PT",
  romenia: "RO",
  tchequia: "CZ",
};

/** Minúsculas, sem acento e sem espaço sobrando — só para casar a chave. */
function chaveDePais(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * ISO-2 do país do caso, a partir de qualquer das grafias que o banco usa
 * (`austria`, `Áustria`, `AT`). `null` quando não dá para afirmar — e
 * `null` significa "não filtra por país", nunca "chuta um país".
 */
export function isoDoPais(pais: string | null | undefined): string | null {
  const bruto = (pais ?? "").trim();
  if (!bruto) return null;
  if (/^[A-Z]{2}$/.test(bruto)) return bruto;
  // "Áustria — administrativa (§ 58c StbG)" → casa pelo primeiro termo.
  const primeiro = bruto.split(/[—–\-(,/]/)[0] ?? bruto;
  return ISO_POR_PAIS[chaveDePais(primeiro)] ?? ISO_POR_PAIS[chaveDePais(bruto)] ?? null;
}

/** Item arquivado por decisão da Proprietária nunca entra em seletor. */
function vivoNoCatalogo(i: ItemCatalogoFeed): boolean {
  return i.statusDicionario !== "ARQUIVADO_DECISAO_PROPRIETARIA";
}

/**
 * Opções de SKU para o campo `produto_sku`, em cascata.
 *
 * O valor gravado passa a ser o `item_id` do catálogo — nunca a frase de
 * rótulo. Ordem: itens do país do caso primeiro, e dentro deles os do
 * produto-pai do caso no topo. Nada é escondido: item de outro país
 * continua na lista, rotulado com o país.
 */
export function opcoesProdutoSku(
  itens: readonly ItemCatalogoFeed[],
  iso: string | null,
  produtoPaiIdDoCaso: string | null,
): Opcao[] {
  const nomeProdutoPai = produtoPaiPorId(produtoPaiIdDoCaso)?.nome ?? null;
  const doPais = (i: ItemCatalogoFeed) => Boolean(iso && (i.paises ?? []).includes(iso));
  const doProdutoPai = (i: ItemCatalogoFeed) => Boolean(nomeProdutoPai && i.produtoPai === nomeProdutoPai);

  return itens
    .filter(vivoNoCatalogo)
    .slice()
    .sort((a, b) => {
      const peso = (i: ItemCatalogoFeed) => (doPais(i) ? 0 : 2) + (doProdutoPai(i) ? 0 : 1);
      return peso(a) - peso(b) || a.itemId.localeCompare(b.itemId);
    })
    .map((i) => ({
      valor: i.itemId,
      rotulo: i.nome ? `${i.itemId} — ${i.nome}` : i.itemId,
      ajuda: [
        i.produtoPai ? `Produto-pai: ${i.produtoPai}.` : null,
        (i.paises ?? []).length ? `País: ${(i.paises ?? []).join(", ")}.` : null,
        i.statusDicionario ? `Catálogo: ${i.statusDicionario}.` : null,
        "Nome e código vêm do Planejador; o valor do caso continua governado pela condição particular aprovada.",
      ]
        .filter(Boolean)
        .join(" "),
    }));
}

/**
 * O valor gravado em `produto_sku` existe no catálogo vivo?
 *
 * Devolve o texto da divergência declarada, ou `null` quando confere.
 * Nunca reescreve o valor: trocar o SKU de um contrato é decisão comercial
 * da Proprietária, e o campo foi preenchido por humano.
 */
export function divergenciaProdutoSku(
  valorGravado: string | null | undefined,
  itens: readonly ItemCatalogoFeed[],
): string | null {
  const valor = (valorGravado ?? "").trim();
  if (!valor) return null;
  if (itens.some((i) => i.itemId === valor)) return null;

  const codigo = valor.split(/[\s—–]/)[0] ?? "";
  const item = itens.find((i) => i.itemId === codigo);
  if (item) {
    return (
      `O valor gravado carrega o código ${item.itemId} com um nome que o catálogo não emitiu. ` +
      `No Planejador este item se chama "${item.nome ?? "(sem nome)"}". ` +
      "Escolher a opção do catálogo grava só o código; o nome passa a vir do Planejador."
    );
  }
  return `O valor gravado não corresponde a nenhum item vivo do Planejador. Escolha um item do catálogo ou declare a divergência.`;
}

/**
 * O produto-pai do caso bate com o produto-pai do SKU escolhido?
 *
 * Medido em 08/10: o caso da Ana tem `case_plans.produto_pai_id = PP-03`
 * (Pesquisa Genealógica por Ramo Familiar), e o item `CA-CID-AT-001` está
 * no feed sob "Diagnóstico de Cidadania por Etapas" (PP-02). Qual dos dois
 * governa é decisão da Proprietária — aqui a divergência é só declarada.
 */
export function divergenciaProdutoPai(
  produtoPaiIdDoCaso: string | null | undefined,
  skuEscolhido: string | null | undefined,
  itens: readonly ItemCatalogoFeed[],
): string | null {
  const nomeDoCaso = produtoPaiPorId(produtoPaiIdDoCaso ?? null)?.nome ?? null;
  if (!nomeDoCaso) return null;
  const codigo = (skuEscolhido ?? "").trim().split(/[\s—–]/)[0] ?? "";
  const item = itens.find((i) => i.itemId === codigo);
  if (!item?.produtoPai || item.produtoPai === nomeDoCaso) return null;
  return (
    `O Planejador do caso aponta ${produtoPaiIdDoCaso} — ${nomeDoCaso}, ` +
    `mas o item ${item.itemId} está no catálogo sob "${item.produtoPai}". ` +
    "Decisão da Proprietária: qual dos dois governa a jornada deste caso."
  );
}
