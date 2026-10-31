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

/**
 * `sugestao_registrada`: nenhuma fonte documentada ainda, mas há fonte candidata
 * (estágio CATALOGADA) registrada pela equipe. Sugestão NÃO é base: o país
 * continua sem base catalogada até a candidata ser avaliada e avançar.
 */
export type EstadoFontesPais = "com_base" | "sugestao_registrada" | "em_preparacao";

export const FONTES_SUGESTAO_REGISTRADA =
  "Sugestão registrada: há fonte candidata aguardando avaliação no backlog de ativação. O país segue sem base catalogada até ela ser avaliada.";

export type ResumoFontesPais = {
  /** Valor do país como o Planejador/CRM grava (`PAISES_LINHA_PRIORITARIA`). */
  valor: string;
  rotulo: string;
  estado: EstadoFontesPais;
  /** Quantas fontes vivas o catálogo tem para este país. */
  fontes: number;
  /** Quantas delas têm endereço próprio (categoria não tem). */
  comRota: number;
  /** Fontes candidatas (CATALOGADA) registradas como sugestão; não contam como base. */
  sugestoes: number;
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
  /** Ausente (fonte sem estágio informado) conta como base, como antes. */
  estagio_maturidade?: string | null;
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
/** Fonte candidata registrada como sugestão: catalogada, ainda não documentada nem homologada. */
export function ehFonteCandidata(f: FonteCatalogo): boolean {
  return String(f.estagio_maturidade ?? "").trim() === "CATALOGADA";
}

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
      const candidatas = doPais.filter(ehFonteCandidata);
      const base = doPais.filter((f) => !ehFonteCandidata(f));
      const comRota = base.filter((f) => String(f.url_canonica ?? "").trim().length > 0).length;
      const estado: EstadoFontesPais =
        base.length > 0 ? "com_base" : candidatas.length > 0 ? "sugestao_registrada" : "em_preparacao";
      return {
        valor: p.valor,
        rotulo: p.rotulo,
        estado,
        fontes: base.length,
        comRota,
        sugestoes: candidatas.length,
        mensagem:
          estado === "em_preparacao"
            ? FONTES_EM_PREPARACAO
            : estado === "sugestao_registrada"
              ? FONTES_SUGESTAO_REGISTRADA
              : null,
      } satisfies ResumoFontesPais;
    })
    .filter((x): x is ResumoFontesPais => x !== null);
}

/**
 * Sugestão de fonte para país sem base (31/10/2026).
 *
 * Decisão da Proprietária: fontes por país não é só leitura. Registrar a
 * sugestão cria uma fonte CANDIDATA no catálogo e um item no backlog de
 * ativação, sem tabela nova. A candidata nasce com os padrões do banco
 * (estágio CATALOGADA, não documentada, sem integração, uso não validado) e NÃO
 * com o padrão D-04 de fonte nova homologada: sugerir não é avaliar.
 * Homologar e documentar continuam sendo atos da avaliação, em Fontes
 * genealógicas.
 */
export const FONTE_CANDIDATA_PADRAO = {
  estagio_maturidade: "CATALOGADA",
  status_documentacao: "nao_documentada",
  status_integracao: "sem_integracao",
  modo_de_uso_permitido: "nao_validado",
  permite_automacao: "nao",
} as const;

export type EntradaSugestaoFonte = {
  /** Valor do país como o Planejador/CRM grava. */
  paisValor: string;
  paisRotulo: string;
  nome: string;
  motivo: string;
  prioridade?: "critica" | "alta" | "media" | "baixa";
};

export function montarSugestaoFonte(e: EntradaSugestaoFonte) {
  const eixo = eixoDoPais(e.paisValor);
  if (!eixo) throw new Error("Este país não tem eixo no catálogo de fontes.");
  const nome = String(e.nome ?? "").trim();
  const motivo = String(e.motivo ?? "").trim();
  if (!nome) throw new Error("Informe o nome da fonte sugerida.");
  if (!motivo) throw new Error("Informe o motivo da sugestão.");
  return {
    eixo,
    fonte: { nome, pais_eixo: eixo, ...FONTE_CANDIDATA_PADRAO } as Record<string, unknown>,
    backlog: (sourceId: string) =>
      ({
        source_id: sourceId,
        acao_interna: `Avaliar fonte sugerida para ${e.paisRotulo}: ${nome}`,
        motivo,
        prioridade: e.prioridade ?? "media",
        status: "planejada",
      }) as Record<string, unknown>,
  };
}
