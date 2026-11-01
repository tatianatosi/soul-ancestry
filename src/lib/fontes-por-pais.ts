/**
 * Fontes de pesquisa por país (03/10/2026) — Corte PAÍSES.
 *
 * Instrução literal da Proprietária: "corte países execute todos que temos a
 * bases nas fontes de pesquisas genealogicas 5a".
 *
 * ## O defeito que isto fecha
 *
 * O Planejador oferece 10 países de linha prioritária, e o catálogo 5A tem
 * base documentada para 7 deles. Para os outros, a tela ficava em silêncio:
 * a equipe escolhia o país, ia procurar a fonte vinculada e não encontrava
 * nada — sem saber se era falta de cadastro, erro de filtro ou ausência real
 * de base. Silêncio é pior que ausência declarada.
 *
 * `FONTES_EM_PREPARACAO` é o estado explícito para país habilitado no
 * Planejador e ainda sem base catalogada. País habilitado NÃO é parecer
 * jurídico nem promessa de pesquisa: é rota disponível para análise interna.
 *
 * Nenhuma fonte é inventada aqui. Quando um país não tem base, isso é dito —
 * não preenchido com um arquivo plausível.
 */

/** Texto único, para as telas não divergirem sobre o mesmo estado. */
export const FONTES_EM_PREPARACAO =
  "Fontes em preparação: este país está habilitado para análise interna, mas ainda não tem base de pesquisa catalogada. Registre a sugestão no backlog de ativação em vez de usar uma fonte não homologada.";

export type EstadoFontesPais = "com_base" | "em_preparacao";

export type ResumoFontesPais = {
  /** Valor do país como o Planejador/CRM grava (`PAISES_LINHA_PRIORITARIA`). */
  valor: string;
  rotulo: string;
  estado: EstadoFontesPais;
  /** Quantas fontes vivas o catálogo tem para este país. */
  fontes: number;
  /** Quantas delas têm endereço próprio (categoria não tem). */
  comRota: number;
  mensagem: string | null;
};

/**
 * Como o `pais_eixo` do catálogo se liga ao valor do Planejador.
 *
 * O catálogo também tem eixos transversais (Global, Europa, Vários) que
 * servem a qualquer país — eles contam como apoio, nunca como base própria
 * do país: uma árvore colaborativa global não substitui o arquivo nacional.
 */
export const EIXOS_TRANSVERSAIS = ["Global", "Europa", "Vários"] as const;

const DE_PARA_EIXO: Record<string, string> = {
  italia: "Itália",
  portugal: "Portugal",
  espanha: "Espanha",
  alemanha: "Alemanha",
  austria: "Áustria",
  polonia: "Polônia",
  hungria: "Hungria",
  luxemburgo: "Luxemburgo",
  croacia: "Croácia",
  romenia: "Romênia",
};

export type FonteCatalogo = {
  pais_eixo?: string | null;
  url_canonica?: string | null;
  archived_at?: string | null;
};

/** Eixo do catálogo correspondente ao país do Planejador, ou null. */
export function eixoDoPais(valorPlanejador: string): string | null {
  return DE_PARA_EIXO[String(valorPlanejador ?? "").trim().toLowerCase()] ?? null;
}

/**
 * Resumo por país: quantas fontes próprias existem e, quando não existe
 * nenhuma, o texto de preparação. `multipais` e `a_definir` não são países —
 * ficam fora, porque não têm eixo no catálogo e inventar um estado para eles
 * seria ruído.
 */
export function resumoFontesPorPais(
  paises: readonly { valor: string; rotulo: string }[],
  fontes: readonly FonteCatalogo[],
): ResumoFontesPais[] {
  const vivas = fontes.filter((f) => !f.archived_at);
  return paises
    .map((p) => {
      const eixo = eixoDoPais(p.valor);
      if (!eixo) return null;
      const doPais = vivas.filter((f) => String(f.pais_eixo ?? "").trim() === eixo);
      const comRota = doPais.filter((f) => String(f.url_canonica ?? "").trim().length > 0).length;
      const estado: EstadoFontesPais = doPais.length > 0 ? "com_base" : "em_preparacao";
      return {
        valor: p.valor,
        rotulo: p.rotulo,
        estado,
        fontes: doPais.length,
        comRota,
        mensagem: estado === "em_preparacao" ? FONTES_EM_PREPARACAO : null,
      } satisfies ResumoFontesPais;
    })
    .filter((x): x is ResumoFontesPais => x !== null);
}
