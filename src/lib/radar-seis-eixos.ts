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
 * avós + 8 bisavós + 16 trisavós = 31). Não é estimativa do caso: é o máximo
 * genealógico do formato de árvore G1-G5 já usado em /portal/arvore — mesma
 * conta que o mockup aprovado usa ("de um universo de 31 possíveis").
 */
export const TETO_ANCESTRAIS_G1_G5 = 1 + 2 + 4 + 8 + 16;

function percentual(parte: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((parte / total) * 100)));
}

export function radarSeisDimensoes(entrada: {
  projecoes: ProjecaoBruta[];
  documentos: DocumentoPortal[];
}): DimensaoRadar[] {
  const publicacoes = publicacoesParaCliente(entrada.projecoes);
  const docs = entrada.documentos.filter((d) => d.is_demo !== true);
  const liberados = docs.filter((d) => d.liberado_cliente === true).length;

  const arvore = publicacoes.filter((p) => p.tipo === "arvore" || p.tipo === "linha_tempo");
  const achados = publicacoes.filter((p) => p.tipo === "achado");
  const marcos = publicacoes.filter((p) => p.tipo === "marco" || p.tipo === "resumo");

  const documentacao: DimensaoRadar = {
    id: "documentacao",
    titulo: "Documentação",
    estado: "percentual",
    percentual: percentual(liberados, docs.length),
    legenda:
      docs.length > 0
        ? `${liberados} de ${docs.length} documentos do seu caso já liberados para você.`
        : "Nenhum documento vinculado ao seu caso ainda.",
    rotuloNumero: `${percentual(liberados, docs.length)}%`,
    comoCalculamos: `Documentos liberados para você (${liberados}) ÷ documentos do seu caso (${docs.length}).`,
  };
  const origem: DimensaoRadar = {
    id: "origem",
    titulo: "Origem",
    estado: "percentual",
    // Sem teto conhecido de "quantos registros de origem um caso tem" —
    // dois degraus honestos, não percentual fino fingindo precisão. Usa a
    // mesma fonte de "Conexões Familiares" (publicações de árvore/linha),
    // só que como presença/ausência em vez de contagem contra um teto —
    // por isso os dois eixos sobem juntos; não é redundância acidental.
    estado: "percentual",
    percentual: arvore.length > 0 ? 100 : 0,
    legenda:
      arvore.length > 0
        ? `${arvore.length} registro(s) de origem/linha publicados pela equipe.`
        : "Ainda não há registro de origem publicado pela equipe.",
    // Presença/ausência, não "% concluído" — rótulo mostra a contagem real.
    rotuloNumero: arvore.length > 0 ? `${arvore.length} registro(s)` : "Nenhum ainda",
    comoCalculamos:
      "Não existe um total conhecido de registros de origem que um caso pode ter, então mostramos a contagem publicada em vez de uma porcentagem.",
  };
  const conexoes: DimensaoRadar = {
    id: "conexoes",
    titulo: "Conexões Familiares",
    estado: "em_preparacao",
    // Não tomar o teto ilustrativo G1–G5 como denominador do caso da família.
    percentual: null,
    legenda: arvore.length > 0
      ? `${arvore.length} registro(s) da árvore ou linha familiar compartilhados.`
      : "A árvore e as linhas familiares aparecerão quando forem compartilhadas.",
    rotuloNumero: arvore.length > 0 ? `${arvore.length} registro(s)` : "Em preparação",
    comoCalculamos: "Mostramos somente os registros compartilhados; não há um total previsto para a família.",
  };
  const memoria: DimensaoRadar = {
    id: "memoria",
    titulo: "Memória",
    estado: "percentual",
    percentual: achados.length > 0 ? 100 : 0,
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
    percentual: marcos.length > 0 ? 100 : 0,
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
  const mediaOutros = Math.round(
    outros.reduce((soma, d) => soma + (d.percentual ?? 0), 0) / outros.length,
  );
  const elegibilidade: DimensaoRadar = {
    id: "elegibilidade",
    titulo: "Progresso Geral",
    estado: "percentual",
    percentual: mediaOutros,
    legenda:
      "Andamento médio dos outros 5 eixos da sua jornada — acompanhamento de progresso, não parecer jurídico, chance ou resultado.",
    rotuloNumero: `${mediaOutros}%`,
    comoCalculamos: `Média dos outros 5 eixos: (${outros.map((d) => `${d.percentual ?? 0}`).join(" + ")}) ÷ ${outros.length}.`,
  };

  return [documentacao, origem, conexoes, elegibilidade, memoria, legado];
}
