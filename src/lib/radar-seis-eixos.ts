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
 * 2. "Elegibilidade" NUNCA vira percentual. radar-eixos.ts já proíbe isso
 *    explicitamente ("nunca prometer elegibilidade, cidadania, êxito
 *    jurídico") e não existe hoje nenhuma fonte com RLS de portal para o
 *    parecer jurídico do caso (legal_clause_matrix é staff-only). Mostrar um
 *    número ali seria inventar dado, exatamente o que a proprietária proibiu.
 *    Fica com estado institucional, igual ao eixo "estrategia" já existente.
 *
 *    07/09/2026 — a proprietária confirmou colocar este eixo em espera, mas
 *    apontou a direção certa para quando for construído: o percentual deve
 *    vir de um algoritmo combinando completude documental + achados
 *    confirmados + marcos jurídicos trazidos pela equipe — não um número
 *    isolado. Registrado aqui para não se perder: falta decidir o peso de
 *    cada parte e a fonte com RLS de portal para marcos jurídicos (hoje só
 *    existe em legal_clause_matrix, staff-only).
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

  return [
    {
      id: "documentacao",
      titulo: "Documentação",
      estado: "percentual",
      percentual: percentual(liberados, docs.length),
      legenda:
        docs.length > 0
          ? `${liberados} de ${docs.length} documentos do seu caso já liberados para você.`
          : "Nenhum documento vinculado ao seu caso ainda.",
    },
    {
      id: "origem",
      titulo: "Origem",
      estado: "percentual",
      // Sem teto conhecido de "quantos registros de origem um caso tem" —
      // dois degraus honestos, não percentual fino fingindo precisão. Usa a
      // mesma fonte de "Conexões Familiares" (publicações de árvore/linha),
      // só que como presença/ausência em vez de contagem contra um teto —
      // por isso os dois eixos sobem juntos; não é redundância acidental.
      percentual: arvore.length > 0 ? 100 : 0,
      legenda:
        arvore.length > 0
          ? `${arvore.length} registro(s) de origem/linha publicados pela equipe.`
          : "Ainda não há registro de origem publicado pela equipe.",
    },
    {
      id: "conexoes",
      titulo: "Conexões Familiares",
      estado: "percentual",
      percentual: percentual(arvore.length, TETO_ANCESTRAIS_G1_G5),
      legenda: `${arvore.length} de até ${TETO_ANCESTRAIS_G1_G5} ancestrais possíveis em 5 gerações (você, pais, avós, bisavós e trisavós).`,
    },
    {
      id: "elegibilidade",
      titulo: "Elegibilidade",
      estado: "em_preparacao",
      percentual: null,
      legenda:
        "A análise de elegibilidade é jurídica e não vira percentual aqui — acompanhe pela equipe quando houver parecer.",
    },
    {
      id: "memoria",
      titulo: "Memória",
      estado: "percentual",
      percentual: achados.length > 0 ? 100 : 0,
      legenda:
        achados.length > 0
          ? `${achados.length} achado(s) de memória familiar publicados.`
          : "Nenhum achado de memória familiar publicado ainda.",
    },
    {
      id: "legado",
      titulo: "Legado",
      estado: "percentual",
      percentual: marcos.length > 0 ? 100 : 0,
      legenda:
        marcos.length > 0
          ? `${marcos.length} marco(s)/resumo(s) de jornada publicados.`
          : "Nenhum marco de jornada publicado ainda.",
    },
  ];
}
