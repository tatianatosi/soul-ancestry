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

  const documentacao: DimensaoRadar =
    docs.length === 0
      ? {
          id: "documentacao",
          titulo: "Documentação",
          estado: "em_preparacao",
          percentual: null,
          legenda: "Ainda sem documentos vinculados — sem percentual inventado.",
        }
      : {
          id: "documentacao",
          titulo: "Documentação",
          estado: "percentual",
          percentual: percentual(liberados, docs.length),
          legenda: `${liberados} de ${docs.length} documentos do seu caso já liberados para você.`,
        };

  // Sem teto conhecido de "quantos registros de origem" — presença/ausência
  // honesta, ou em_preparacao quando nada foi publicado (não fingir 0% medido).
  const origem: DimensaoRadar =
    arvore.length === 0
      ? {
          id: "origem",
          titulo: "Origem",
          estado: "em_preparacao",
          percentual: null,
          legenda: "Aguardando registro de origem/linha publicado pela equipe.",
        }
      : {
          id: "origem",
          titulo: "Origem",
          estado: "percentual",
          percentual: 100,
          legenda: `${arvore.length} registro(s) de origem/linha publicados pela equipe.`,
        };

  const conexoes: DimensaoRadar =
    arvore.length === 0
      ? {
          id: "conexoes",
          titulo: "Conexões Familiares",
          estado: "em_preparacao",
          percentual: null,
          legenda: `Sem publicação de árvore ainda — o teto de ${TETO_ANCESTRAIS_G1_G5} só vale com dados reais.`,
        }
      : {
          id: "conexoes",
          titulo: "Conexões Familiares",
          estado: "percentual",
          percentual: percentual(arvore.length, TETO_ANCESTRAIS_G1_G5),
          legenda: `${arvore.length} de até ${TETO_ANCESTRAIS_G1_G5} ancestrais possíveis em 5 gerações (você, pais, avós, bisavós e trisavós).`,
        };

  const memoria: DimensaoRadar =
    achados.length === 0
      ? {
          id: "memoria",
          titulo: "Memória",
          estado: "em_preparacao",
          percentual: null,
          legenda: "Nenhum achado de memória familiar publicado ainda.",
        }
      : {
          id: "memoria",
          titulo: "Memória",
          estado: "percentual",
          percentual: 100,
          legenda: `${achados.length} achado(s) de memória familiar publicados.`,
        };

  const legado: DimensaoRadar =
    marcos.length === 0
      ? {
          id: "legado",
          titulo: "Legado",
          estado: "em_preparacao",
          percentual: null,
          legenda: "Nenhum marco de jornada publicado ainda.",
        }
      : {
          id: "legado",
          titulo: "Legado",
          estado: "percentual",
          percentual: 100,
          legenda: `${marcos.length} marco(s)/resumo(s) de jornada publicados.`,
        };

  // Elegibilidade = média só dos eixos com percentual real. Sem fonte jurídica.
  // Se nenhum eixo tem % ainda, fica em_preparacao — não inventa 0% medido.
  const outros = [documentacao, origem, conexoes, memoria, legado];
  const comPercentual = outros.filter((d) => d.estado === "percentual");
  const elegibilidade: DimensaoRadar =
    comPercentual.length === 0
      ? {
          id: "elegibilidade",
          titulo: "Elegibilidade",
          estado: "em_preparacao",
          percentual: null,
          legenda:
            "Aguardando publicações nos outros eixos — média só com dados reais; não é parecer jurídico.",
        }
      : {
          id: "elegibilidade",
          titulo: "Elegibilidade",
          estado: "percentual",
          percentual: Math.round(
            comPercentual.reduce((soma, d) => soma + (d.percentual ?? 0), 0) /
              comPercentual.length,
          ),
          legenda:
            "Média de completude dos eixos já publicados — não é parecer jurídico nem promessa de resultado.",
        };

  return [documentacao, origem, conexoes, elegibilidade, memoria, legado];
}
