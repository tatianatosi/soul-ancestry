/**
 * União de Ramos genérica (03/10/2026) — o momento em que a linha da
 * história e a linha do processo se encontram, na aba Jornada do App.
 *
 * Até aqui isso existia só como constante da demo
 * (`UNIAO_DE_RAMOS_DEMO_SOPHIA`): dois ids fixos e uma legenda fixa. Para
 * cliente real, a ponte simplesmente não aparecia. A migration
 * `20261001120000` já criou o campo de vínculo (`app_projections
 * .vinculo_projecao_id`) e a view `portal_projecoes` já expõe as duas
 * pontas — faltava a regra e o escritor. Este módulo é a regra.
 *
 * Fronteiras que a ponte NÃO atravessa:
 * - vínculo é EXPLÍCITO, por id. Nunca inferido por proximidade de data,
 *   por nome parecido ou por sobrenome em comum.
 * - as duas pontas precisam estar publicadas e visíveis ao cliente. Ponte
 *   apontando para algo que o cliente não vê seria um buraco na tela.
 * - a legenda é texto editorial da equipe. Não afirma efeito jurídico,
 *   não conclui parentesco e passa pelos mesmos filtros de fronteira do
 *   App que qualquer outra publicação.
 */

export type PonteUniaoRamos = {
  /** Id da própria projeção de união — é o que o Desk despublica. */
  id: string;
  /** Ponta da história/pesquisa (`source_entity_id`). */
  historiaProjecaoId: string;
  /** Ponta do processo/jornada (`vinculo_projecao_id`). */
  casoProjecaoId: string;
  legenda: string;
};

export type ProjecaoUniaoBruta = {
  id?: string | null;
  projection_type?: string | null;
  content_sanitized?: string | null;
  source_entity_id?: string | null;
  vinculo_projecao_id?: string | null;
};

export const TIPO_UNIAO_RAMOS = "uniao_ramos";

/** Motivos de recusa da publicação. Lista vazia = pode publicar. */
export function validarUniaoDeRamos(entrada: {
  historiaProjecaoId?: string | null;
  casoProjecaoId?: string | null;
  legenda?: string | null;
  idsPublicadosDoCaso: readonly string[];
}): string[] {
  const erros: string[] = [];
  const historia = String(entrada.historiaProjecaoId ?? "").trim();
  const caso = String(entrada.casoProjecaoId ?? "").trim();
  const legenda = String(entrada.legenda ?? "").trim();

  if (!historia || !caso) {
    erros.push("Escolha as duas pontas: a publicação da história e a do processo.");
  } else if (historia === caso) {
    erros.push("As duas pontas precisam ser publicações diferentes — uma união consigo mesma não é união.");
  } else {
    const publicados = new Set(entrada.idsPublicadosDoCaso);
    if (!publicados.has(historia)) erros.push("A publicação da história não está publicada neste caso.");
    if (!publicados.has(caso)) erros.push("A publicação do processo não está publicada neste caso.");
  }

  if (legenda.length < 10) {
    erros.push("Escreva a legenda da união (mínimo 10 letras) — é o texto que o cliente lê.");
  }
  return erros;
}

/**
 * Pontes que o App deve desenhar, a partir das projeções brutas do caso.
 *
 * `idsVisiveis` são as publicações que de fato chegaram ao cliente depois da
 * sanitização — não as linhas cruas. Ponte cuja ponta foi descartada pelo
 * filtro de fronteira não aparece: melhor ausência do que um elo pendurado.
 * `legendaPorId` chega já sanitizada por quem chama (o App tem o
 * sanitizador), para este módulo seguir puro e sem regra de texto própria —
 * uma segunda regra de texto seria uma segunda fronteira para manter.
 */
export function pontesDeUniaoDeRamos(
  brutas: readonly ProjecaoUniaoBruta[],
  idsVisiveis: readonly string[],
  legendaPorId: ReadonlyMap<string, string>,
): PonteUniaoRamos[] {
  const visiveis = new Set(idsVisiveis);
  const vistos = new Set<string>();
  const pontes: PonteUniaoRamos[] = [];

  for (const linha of brutas) {
    if (String(linha.projection_type ?? "").trim().toLowerCase() !== TIPO_UNIAO_RAMOS) continue;
    const id = String(linha.id ?? "").trim();
    const historia = String(linha.source_entity_id ?? "").trim();
    const caso = String(linha.vinculo_projecao_id ?? "").trim();
    if (!id || !historia || !caso || historia === caso) continue;
    if (!visiveis.has(historia) || !visiveis.has(caso)) continue;

    const legenda = String(legendaPorId.get(id) ?? "").trim();
    if (!legenda) continue;

    // Mesma dupla publicada duas vezes conta uma vez — a tela mostra o
    // encontro, não o histórico de republicação.
    const chave = `${historia}>${caso}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    pontes.push({ id, historiaProjecaoId: historia, casoProjecaoId: caso, legenda });
  }
  return pontes;
}
