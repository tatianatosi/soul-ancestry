/**
 * Radar Ancestral — as 6 dimensões do App Cliente (mockup aprovado, pág. 3/7:
 * Documentação, Origem, Conexões Familiares, Elegibilidade, Memória, Legado).
 *
 * 07/09/2026 — achado direto da proprietária: a tela `/portal/radar` real
 * nunca teve essas 6 dimensões. Era um radar diferente, de 4 eixos sobre
 * "estratégia e próximos passos" (radar-eixos.ts, mantido intacto — outra
 * tela o usa). Este módulo é novo, não substitui aquele.
 *
 * Duas honestidades que o desenho impõe, herdadas de portal-dados-vivos.ts:
 *
 * 1. Só usa fontes já autorizadas para o portal (documents, portal_projecoes)
 *    — nada de tabela interna sem RLS de portal comprovada (ver
 *    BLOQUEIOS_CA_PORTAL_02 em portal-dados-vivos.ts).
 *
 * 2. "Elegibilidade" nunca é um parecer jurídico nem lê legal_clause_matrix
 *    (staff-only, sem RLS de portal). radar-eixos.ts já proíbe prometer
 *    elegibilidade/cidadania/êxito jurídico — mostrar aqui um número que
 *    parecesse vir de análise legal seria romper essa regra.
 *
 *    07/09/2026 — decisão da proprietária, em duas etapas: primeiro ficou em
 *    espera (estado institucional, sem número); depois, para simplificar
 *    esta primeira versão, ela decidiu que Elegibilidade usa o MESMO
 *    princípio dos outros eixos sem denominador próprio — só que em vez de
 *    presença/ausência (0/100), é a média dos outros 5 eixos já calculados
 *    (Documentação, Origem, Conexões Familiares, Memória, Legado). Não é
 *    juízo jurídico: é só "o quanto do resto da jornada já está pronto",
 *    reaproveitando números que já existem — nenhum dado novo, nenhuma
 *    inferência legal. Quando o parecer jurídico do caso ganhar uma fonte
 *    com RLS de portal, esse número pode ganhar peso próprio na média.
 *
 * 3. Dimensão sem denominador real (quantas "origens" ou "achados de
 *    memória" um caso PODE ter não tem teto conhecido, ao contrário das
 *    conexões familiares, que têm teto genealógico) não ganha percentual
 *    fino fingindo precisão que não existe. Fica em dois degraus honestos:
 *    0% (nada publicado ainda) ou 100% (a equipe já publicou algo). Só
 *    Documentação e Conexões Familiares têm denominador real e por isso
 *    mostram percentual fino.
 */
import type { DocumentoPortal } from "@/lib/portal-dados-vivos";
import { publicacoesParaCliente, type ProjecaoBruta } from "@/lib/projecoes-cliente";

export type EstadoDimensaoRadar = "percentual" | "em_preparacao";

export type DimensaoRadar = {
  id: "documentacao" | "origem" | "conexoes" | "elegibilidade" | "memoria" | "legado";
  titulo: string;
  estado: EstadoDimensaoRadar;
  /** Só presente quando estado === "percentual". */
  percentual: number | null;
  legenda: string;
  /**
   * Rótulo de exibição no lugar do "%" (correção 2026-09-12, pedido da
   * Proprietária): eixos sem denominador real (origem, memória, legado)
   * usam presença/ausência (0/100) só para o cálculo — mostrar "100%" ao
   * cliente lia como "concluído", o que não é verdade. Aqui mostramos a
   * contagem real publicada; `percentual` continua 0/100 internamente
   * (usado pela média de Elegibilidade), sem mudar nenhum cálculo.
   */
  rotuloNumero: string;
  /**
   * A conta, em linguagem do cliente (03/10/2026, instrução da
   * Proprietária: "mostrando as percentagens e calculos de acordo com
   * premissas já aprovadas anteriormente no app e no portal app do
   * cliente").
   *
   * Existe porque percentual sem conta visível é número mágico: o cliente
   * via "62%" e não tinha como saber de onde veio. Aqui ele lê a fórmula —
   * e, nos eixos sem total conhecido, lê exatamente isso, em vez de um
   * percentual que fingiria precisão.
   */
  comoCalculamos: string;
};

/**
 * Teto matemático de ancestrais possíveis em 5 gerações (você + 2 pais + 4
 * avós + 8 bisavós + 16 trisavós = 31). Histórico: era usado como tentativa
 * de denominador de "Conexões Familiares" — a Proprietária corrigiu isso
 * (05/10/2026): o teto ilustrativo G1-G5 não é o denominador do caso real da
 * família. Continua exportado só porque `/portal/arvore` o usa para a
 * legenda "de um universo de 31 possíveis" nas 5 gerações — não para o
 * cálculo deste radar.
 */
export const TETO_ANCESTRAIS_G1_G5 = 1 + 2 + 4 + 8 + 16;

function percentualOuNulo(parte: number, total: number): number | null {
  if (total <= 0) return null;
  return percentual(parte, total);
}

function percentual(parte: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((parte / total) * 100)));
}

export function radarSeisDimensoes(entrada: {
  projecoes: ProjecaoBruta[];
  documentos: DocumentoPortal[];
  /**
   * Pessoas que a pesquisa já mapeou para este caso (05/10/2026, decisão da
   * Proprietária — PREMISSA, não reabrir): denominador real de "Conexões
   * Familiares", nunca o teto ilustrativo de 31. Vem de
   * `portal_casos.pessoas_mapeadas` (contagem sanitizada, sem PII — migration
   * 20261005180000). Omitido ou 0 = ainda não há ninguém mapeado: o eixo
   * continua em preparação, sem fingir um percentual.
   */
  pessoasMapeadas?: number;
}): DimensaoRadar[] {
  const publicacoes = publicacoesParaCliente(entrada.projecoes);
  const docs = entrada.documentos.filter((d) => d.is_demo !== true);
  const liberados = docs.filter((d) => d.liberado_cliente === true).length;

  const arvore = publicacoes.filter((p) => p.tipo === "arvore" || p.tipo === "linha_tempo");
  const achados = publicacoes.filter((p) => p.tipo === "achado");
  const marcos = publicacoes.filter((p) => p.tipo === "marco" || p.tipo === "resumo");

  // 07/10/2026 (Proprietária): sem total real, mostrar a lacuna, nunca 0% sobre 0.
  const temDocs = docs.length > 0;
  const documentacao: DimensaoRadar = {
    id: "documentacao",
    titulo: "Documentação",
    estado: temDocs ? "percentual" : "em_preparacao",
    percentual: temDocs ? percentual(liberados, docs.length) : null,
    legenda: temDocs
      ? `${liberados} de ${docs.length} documentos do seu caso já liberados para você.`
      : "Lacuna: a lista de documentos do seu caso ainda não foi registrada.",
    rotuloNumero: temDocs ? `${percentual(liberados, docs.length)}%` : "Lacuna",
    comoCalculamos: temDocs
      ? `Documentos liberados para você (${liberados}) ÷ documentos do seu caso (${docs.length}).`
      : "O percentual aparece quando a equipe registrar os documentos do seu caso; antes disso não há total para comparar.",
  };
  const origem: DimensaoRadar = {
    id: "origem",
    titulo: "Origem",
    // Sem teto conhecido de "quantos registros de origem um caso tem" —
    // dois degraus honestos, não percentual fino fingindo precisão. Usa a
    // mesma fonte de "Conexões Familiares" (publicações de árvore/linha),
    // só que como presença/ausência em vez de contagem contra um teto —
    // por isso os dois eixos sobem juntos; não é redundância acidental.
    estado: "percentual",
    percentual: null,
    legenda:
      arvore.length > 0
        ? `${arvore.length} registro(s) de origem/linha publicados pela equipe.`
        : "Ainda não há registro de origem publicado pela equipe.",
    // Presença/ausência, não "% concluído" — rótulo mostra a contagem real.
    rotuloNumero: arvore.length > 0 ? `${arvore.length} registro(s)` : "Nenhum ainda",
    comoCalculamos:
      "Não existe um total conhecido de registros de origem que um caso pode ter, então mostramos a contagem publicada em vez de uma porcentagem.",
  };
  const pessoasMapeadas = entrada.pessoasMapeadas ?? 0;
  const pessoasPublicadasNaArvore = new Set(
    entrada.projecoes
      .filter((p) => (p.projection_type === "arvore" || p.projection_type === "linha_tempo") && p.pessoa_id)
      .map((p) => String(p.pessoa_id)),
  ).size;
  const percentualConexoes = percentualOuNulo(pessoasPublicadasNaArvore, pessoasMapeadas);
  const conexoes: DimensaoRadar = {
    id: "conexoes",
    titulo: "Conexões Familiares",
    estado: percentualConexoes === null ? "em_preparacao" : "percentual",
    /*
     * 05/10/2026 — decisão da Proprietária, PREMISSA (não reabrir): o
     * percentual é APROVADO neste eixo, com denominador real = pessoas
     * mapeadas do caso (pesquisa), nunca o teto ilustrativo G1-G5 de 31.
     * Sem nenhuma pessoa mapeada ainda, fica honesto em preparação — não
     * finge um percentual sobre zero.
     */
    percentual: percentualConexoes,
    legenda:
      percentualConexoes !== null
        ? `${pessoasPublicadasNaArvore} de ${pessoasMapeadas} pessoas mapeadas pela pesquisa já publicadas na árvore ou linha familiar.`
        : arvore.length > 0
          ? `${arvore.length} registro(s) da árvore ou linha familiar compartilhados.`
          : "A árvore e as linhas familiares aparecerão quando forem compartilhadas.",
    rotuloNumero:
      percentualConexoes !== null
        ? `${percentualConexoes}%`
        : arvore.length > 0
          ? `${arvore.length} registro(s)`
          : "Lacuna",
    comoCalculamos:
      percentualConexoes !== null
        ? `Pessoas publicadas na árvore (${pessoasPublicadasNaArvore}) ÷ pessoas mapeadas pela pesquisa neste caso (${pessoasMapeadas}).`
        : "Ainda não há pessoas mapeadas pela pesquisa neste caso; o percentual aparece quando houver.",
  };
  const memoria: DimensaoRadar = {
    id: "memoria",
    titulo: "Memória",
    estado: "percentual",
    percentual: null,
    legenda:
      achados.length > 0
        ? `${achados.length} achado(s) de memória familiar publicados.`
        : "Nenhum achado de memória familiar publicado ainda.",
    rotuloNumero: achados.length > 0 ? `${achados.length} achado(s)` : "Nenhum ainda",
    comoCalculamos:
      "Não existe um total conhecido de achados de memória que uma família pode ter, então mostramos a contagem publicada em vez de uma porcentagem.",
  };
  const legado: DimensaoRadar = {
    id: "legado",
    titulo: "Legado",
    estado: "percentual",
    percentual: null,
    legenda:
      marcos.length > 0
        ? `${marcos.length} marco(s)/resumo(s) de jornada publicados.`
        : "Nenhum marco de jornada publicado ainda.",
    rotuloNumero: marcos.length > 0 ? `${marcos.length} marco(s)` : "Nenhum ainda",
    comoCalculamos:
      "Não existe um total fechado de marcos de legado, então mostramos a contagem publicada em vez de uma porcentagem.",
  };

  // RADAR-APP-SEMANTICA-PROGRESSO (18/09/2026): este eixo é a média dos
  // outros 5 já calculados. Decisão canônica da Proprietária: os percentuais
  // do Radar Ancestral representam progresso/andamento das seis dimensões da
  // jornada — nunca elegibilidade jurídica, chance, probabilidade, parecer
  // ou resultado conclusivo. "Elegibilidade" como rótulo induzia exatamente
  // essa leitura errada; o cálculo continua o mesmo, só o título e a legenda
  // mudaram. Nunca lê parecer jurídico (sem fonte com RLS de portal).
  const outros = [documentacao, origem, conexoes, memoria, legado];
  // Média só dos eixos com total real; sem nenhum, mostra a lacuna.
  const comTotal = outros.filter((d) => d.percentual !== null);
  const mediaOutros = comTotal.length
    ? Math.round(comTotal.reduce((soma, d) => soma + (d.percentual ?? 0), 0) / comTotal.length)
    : null;
  const elegibilidade: DimensaoRadar = {
    id: "elegibilidade",
    titulo: "Progresso Geral",
    estado: mediaOutros === null ? "em_preparacao" : "percentual",
    percentual: mediaOutros,
    legenda:
      mediaOutros === null
        ? "Lacuna: nenhum eixo tem ainda um total real para calcular o andamento — acompanhamento de progresso, não parecer jurídico, chance ou resultado."
        : "Andamento médio dos eixos que já têm total real — acompanhamento de progresso, não parecer jurídico, chance ou resultado.",
    rotuloNumero: mediaOutros === null ? "Lacuna" : `${mediaOutros}%`,
    comoCalculamos:
      mediaOutros === null
        ? "A média aparece quando ao menos um eixo tiver total real; eixos só com contagem não entram."
        : `Média dos eixos com total real: (${comTotal.map((d) => `${d.titulo} ${d.percentual}%`).join(" + ")}) ÷ ${comTotal.length}.`,
  };

  return [documentacao, origem, conexoes, elegibilidade, memoria, legado];
}
