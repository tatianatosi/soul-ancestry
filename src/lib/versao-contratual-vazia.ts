/**
 * Versão contratual vazia — o sinal que faltava (03/10/2026).
 *
 * ## O achado, medido no caso real da Ana
 *
 * A Proprietária disse: "o contrato também está errado da Ana, o certo é o
 * Contrato de Estudo Genealógico v2 completo já verificado pelo jurídico e
 * não o contrato base". Ela está certa, e o banco mostra exatamente onde:
 *
 * | o que | valor no banco (03/10) |
 * |---|---|
 * | `contracts.title` | "Contrato de Estudo Genealógico v2 — Silveira / Friedmann-Reimer (Áustria)" |
 * | modelo vinculado | "MODELO ESTUDO" (12 KB de cláusulas completas, ativo) |
 * | versão 1, gerada em | **21/08/2026** |
 * | `generated_content.contrato.title` | **"Contrato-base familiar — …"** |
 * | `generated_content.contrato.contract_type` | **"contract_base"** |
 * | `generated_content.clausulas` | **[]** |
 * | `generated_content.escopo` / `anexos` | **[]** |
 *
 * Ou seja: o instrumento está nomeado como v2 e aponta para o modelo certo,
 * mas a ÚNICA versão gerada é de 21/08 — anterior às correções do gerador de
 * 05/09 e 06/09, quando `gerarRascunhoInterno` passou a ler
 * `contract_templates.default_clauses`. Até então o rascunho saía sem
 * cláusula nenhuma, rotulado "contrato-base". A versão da Ana é esse rascunho
 * vazio, congelado, com `review_decision = 'rejected'` e nota de revisão em
 * branco.
 *
 * Nada aqui reescreve texto jurídico nem gera versão sozinho: o texto
 * completo já está no modelo aprovado, e gerar é ato humano na tela. O que
 * faltava era o **sinal** — a tela mostrava a versão vazia como se fosse o
 * contrato, em silêncio.
 */

export type VersaoContratual = {
  version_number?: number | null;
  status?: string | null;
  review_decision?: string | null;
  created_at?: string | null;
  generated_content?: unknown;
};

/** Data em que o gerador passou a incluir as cláusulas do modelo aprovado. */
export const GERADOR_COM_CLAUSULAS_DESDE = "2026-09-06";

export type DiagnosticoVersao = {
  /** true quando a versão existe mas não carrega o texto contratual. */
  vazia: boolean;
  /** true quando foi gerada antes da correção do gerador. */
  anteriorAoGerador: boolean;
  /** Rótulo que o conteúdo da versão diz de si mesmo. */
  tipoDeclarado: string | null;
  motivos: string[];
  /** O que a equipe deve fazer, em uma frase. */
  acao: string | null;
};

function conteudo(v: VersaoContratual): Record<string, any> | null {
  const c = v.generated_content;
  if (!c || typeof c !== "object") return null;
  return c as Record<string, any>;
}

/**
 * Diagnostica a versão mais recente. Sem versão nenhuma, devolve "não vazia"
 * — a tela já trata esse caso dizendo que não há rascunho.
 */
export function diagnosticarVersaoContratual(v: VersaoContratual | null | undefined): DiagnosticoVersao {
  const vazio: DiagnosticoVersao = {
    vazia: false,
    anteriorAoGerador: false,
    tipoDeclarado: null,
    motivos: [],
    acao: null,
  };
  if (!v) return vazio;

  const c = conteudo(v);
  const motivos: string[] = [];

  /*
   * Correção de 09/10/2026. A regra anterior era `vazia = clausulas === 0`, e
   * isso marcava como vazia uma versão CORRETA: o array `clausulas` guarda só
   * as cláusulas SOBRESCRITAS por contrato (`contract_clause_overrides`), que
   * ficam legitimamente vazias quando o instrumento usa o texto do modelo
   * aprovado sem alterar nada. O texto das cláusulas, nesse caso, vive no HTML
   * renderizado a partir de `contract_templates.default_clauses`.
   *
   * Medido no caso da Ana: a v2 regenerada tem 0 overrides, 21 itens de escopo
   * e 17 ocorrências de "Cláusula" no HTML — está completa. A v1 de 21/08 tem
   * 0 overrides, 0 escopo e 642 bytes — essa sim está vazia.
   */
  const clausulas = Array.isArray(c?.clausulas) ? c!.clausulas.length : 0;
  const html = typeof c?.html === "string" ? c.html : "";
  const clausulasNoHtml = (html.match(/Cl[áa]usula/g) ?? []).length;
  const semCorpo = clausulas === 0 && clausulasNoHtml === 0;
  if (semCorpo) {
    motivos.push(
      clausulas === 0 && !html
        ? "A versão não tem cláusula sobrescrita nem HTML renderizado: o corpo contratual está vazio."
        : "A versão não tem nenhuma cláusula: o corpo contratual está vazio.",
    );
  }

  const escopo = Array.isArray(c?.escopo) ? c!.escopo.length : 0;
  if (escopo === 0) motivos.push("A versão não tem itens de escopo.");

  const tipoDeclarado =
    (c?.contrato?.contract_type as string | undefined) ?? (c?.contrato?.title as string | undefined) ?? null;
  if (typeof tipoDeclarado === "string" && /contract_base|contrato[- ]base/i.test(tipoDeclarado)) {
    motivos.push(
      `O conteúdo gravado se declara "${tipoDeclarado}" — contrato-base, não o Contrato de Estudo Genealógico v2 completo.`,
    );
  }

  const criadoEm = String(v.created_at ?? "").slice(0, 10);
  const anteriorAoGerador = Boolean(criadoEm) && criadoEm < GERADOR_COM_CLAUSULAS_DESDE;
  if (anteriorAoGerador) {
    motivos.push(
      `Gerada em ${criadoEm}, antes de ${GERADOR_COM_CLAUSULAS_DESDE}, quando o gerador ainda não lia as cláusulas do modelo aprovado.`,
    );
  }

  const vazia = semCorpo && escopo === 0;
  return {
    vazia,
    anteriorAoGerador,
    tipoDeclarado: typeof tipoDeclarado === "string" ? tipoDeclarado : null,
    motivos,
    acao: vazia
      ? 'Gere o rascunho de novo em "Salvar rascunho": o modelo aprovado já tem o texto completo, e a versão nova nasce com as cláusulas. A versão antiga continua no histórico — nada é apagado.'
      : null,
  };
}

/** A versão mais recente de uma lista, pelo número da versão. */
export function versaoMaisRecente(versoes: readonly VersaoContratual[]): VersaoContratual | null {
  let atual: VersaoContratual | null = null;
  for (const v of versoes) {
    if (!atual || Number(v.version_number ?? 0) > Number(atual.version_number ?? 0)) atual = v;
  }
  return atual;
}
