/**
 * Leitor do catálogo vivo para os campos classificatórios do contrato
 * (Corte D, 08/10/2026). Só leitura: anexa `opcoes_vivas` e
 * `divergencia_catalogo` na linha do parâmetro. Não grava nada.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  divergenciaProdutoPai,
  divergenciaProdutoSku,
  isoDoPais,
  opcoesProdutoSku,
  type ItemCatalogoFeed,
} from "@/lib/catalogo-opcoes-contrato";

type Sb = any;

/**
 * Corte D (08/10/2026) — os campos classificatórios de catálogo deixam de
 * ter lista fixa no código e passam a ler o Planejador vivo.
 *
 * Anexa, na própria linha do parâmetro, `opcoes_vivas` (o que o seletor
 * deve oferecer) e `divergencia_catalogo` (o que o valor gravado contraria).
 * Mesmo padrão de pós-processamento já usado por
 * `preencherQualificacaoContratada` — nenhuma rota nova, nenhum writer novo:
 * esta função **não grava nada**, só descreve.
 */
export async function anexarOpcoesVivasDoCatalogo(
  supabase: Sb,
  organizationId: string | null | undefined,
  caseId: string | null | undefined,
  valores: any[],
) {
  if (!valores.some((v) => v.campo === "produto_sku")) return valores;

  let consulta = supabase
    .from("planner_catalog_feed")
    .select("item_id,name,product_parent,status_dictionary,country_scope")
    .is("archived_at", null)
    .order("item_id", { ascending: true });
  if (organizationId) consulta = consulta.eq("organization_id", organizationId);
  const { data: feed } = await consulta;

  const itens: ItemCatalogoFeed[] = ((feed ?? []) as any[]).map((r) => ({
    itemId: String(r.item_id),
    nome: (r.name as string | null) ?? null,
    produtoPai: (r.product_parent as string | null) ?? null,
    statusDicionario: (r.status_dictionary as string | null) ?? null,
    paises: (r.country_scope as string[] | null) ?? null,
  }));
  if (!itens.length) return valores;

  // País e produto-pai do caso: o Planejador é a fonte (regra de autoridade 2).
  let produtoPaiDoCaso: string | null = null;
  let paisDoCaso: string | null = null;
  if (caseId) {
    const [{ data: plano }, { data: caso }] = await Promise.all([
      supabase
        .from("case_plans")
        .select("produto_pai_id,rota_confirmada")
        .eq("case_id", caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("crm_casos").select("pais_linha_prioritaria").eq("id", caseId).maybeSingle(),
    ]);
    produtoPaiDoCaso = ((plano as any)?.produto_pai_id as string | null) ?? null;
    paisDoCaso =
      ((caso as any)?.pais_linha_prioritaria as string | null) ??
      ((plano as any)?.rota_confirmada as string | null) ??
      null;
  }
  const iso = isoDoPais(paisDoCaso);

  /*
   * O produto-pai não é parâmetro contratual (não existe campo
   * `produto_pai` no dicionário, e não vou inventar um): ele é obrigatório
   * no Planejador e aqui aparece como contexto e como divergência quando o
   * SKU escolhido pertence a outro produto-pai.
   */
  return valores.map((v) =>
    v.campo === "produto_sku"
      ? {
          ...v,
          opcoes_vivas: opcoesProdutoSku(itens, iso, produtoPaiDoCaso),
          produto_pai_do_caso: produtoPaiDoCaso,
          divergencia_catalogo:
            divergenciaProdutoSku(v.valor, itens) ?? divergenciaProdutoPai(produtoPaiDoCaso, v.valor, itens),
        }
      : v,
  );
}

