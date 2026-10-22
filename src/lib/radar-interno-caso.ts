/**
 * Radar Individual (micro) — leitura interna de UM caso, pelos mesmos 4 eixos
 * canônicos do Radar do cliente.
 *
 * 07/09/2026 — achado da proprietária: o Desk (Radar Interno) sempre teve
 * dois modos no mockup aprovado, "Matriz de Prioridade" (macro, todos os
 * casos — já real, ver matriz-prioridades-conectada.tsx) e "Radar
 * Individual" (micro, um caso por vez) — só o macro tinha sido construído.
 *
 * Taxonomia: `qualidade.tsx` já registra a regra ("mesma restrição do Radar
 * do cliente... para Cliente e Ops nunca divergirem") — por isso este módulo
 * reusa EIXOS_RADAR_CANONICOS de radar-eixos.ts em vez de inventar eixo novo.
 * A diferença para o cliente é só de conteúdo, nunca de estrutura: aqui os
 * itens podem mostrar hipótese, via jurídica e motivo de bloqueio (linguagem
 * interna), porque é tela de staff — o Radar do cliente sanitiza isso.
 *
 * Fonte: os mesmos campos que carregarFichaCaso já busca (nenhuma consulta
 * nova) — nucleoCompletude/nucleoCriterios, checksAtivacao, bloqueiosReais e
 * os campos do próprio crm_casos.
 */
import {
  EIXOS_RADAR_CANONICOS,
  garantirEixosCanonicos,
  type EixoRadar,
  type EstadoEixo,
} from "@/lib/radar-eixos";
// 22/10/2026 — decisão da Proprietária: o Radar mostrava o valor cru do banco
// ("nao_avaliada", "a_definir"). As mesmas listas que a ficha do caso já usa
// para esses campos passam a traduzir aqui também — nenhum vocabulário novo.
import { HIPOTESE_ELEGIBILIDADE, VIAS_JURIDICAS, rotulo } from "@/lib/caso-ficha";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

export function radarInternoDoCaso(entrada: {
  caso: { hipotese_elegibilidade?: string | null; via?: string | null; pais?: string | null };
  nucleoCompletude: boolean;
  nucleoCriterios: Linha[];
  checksAtivacao: Linha[];
  bloqueiosReais: Linha[];
}): EixoRadar[] {
  const criteriosOk = entrada.nucleoCriterios.filter((c) => c.ok);
  const checksOk = entrada.checksAtivacao.filter((c) => c.status === "ok" || c.status === "concluido");

  return garantirEixosCanonicos(EIXOS_RADAR_CANONICOS.map((canon): EixoRadar => {
    if (canon.id === "historia") {
      const estado: EstadoEixo = entrada.nucleoCompletude
        ? "identificado"
        : criteriosOk.length > 0
          ? "em_confirmacao"
          : "proxima_etapa";
      return {
        ...canon,
        estado,
        itens: entrada.nucleoCriterios.map((c) => ({
          rotulo: c.rotulo,
          valor: c.ok ? "atendido" : c.motivo || "pendente",
        })),
        mensagemVazio: "Nenhum critério de núcleo familiar avaliado ainda para este caso.",
      };
    }

    if (canon.id === "documentos") {
      const estado: EstadoEixo =
        entrada.checksAtivacao.length === 0
          ? "proxima_etapa"
          : checksOk.length === entrada.checksAtivacao.length
            ? "identificado"
            : "em_confirmacao";
      return {
        ...canon,
        estado,
        itens: [
          { rotulo: "Requisitos confirmados", valor: `${checksOk.length} de ${entrada.checksAtivacao.length}` },
          ...entrada.checksAtivacao
            .filter((c) => c.status !== "ok" && c.status !== "concluido")
            .slice(0, 5)
            .map((c) => ({ rotulo: c.label, valor: c.status })),
        ],
        mensagemVazio: "Nenhum requisito de ativação registrado para este caso.",
      };
    }

    if (canon.id === "estrategia") {
      // Tela interna: pode mostrar hipótese e via, ao contrário do Radar do
      // cliente (que nunca expõe isso — ver radar-eixos.ts, topo do arquivo).
      const itens = [
        entrada.caso.hipotese_elegibilidade
          ? {
              rotulo: "Hipótese de elegibilidade",
              valor: rotulo(HIPOTESE_ELEGIBILIDADE, entrada.caso.hipotese_elegibilidade),
            }
          : null,
        entrada.caso.via ? { rotulo: "Via jurídica", valor: rotulo(VIAS_JURIDICAS, entrada.caso.via) } : null,
        entrada.caso.pais ? { rotulo: "País alvo", valor: entrada.caso.pais } : null,
      ].filter((i): i is { rotulo: string; valor: string } => i !== null);
      return {
        ...canon,
        estado: itens.length > 0 ? "em_confirmacao" : "proxima_etapa",
        itens,
        mensagemVazio: "Hipótese e via ainda não registradas para este caso.",
      };
    }

    /* canon.id === "proximos" */
    const primeiro = entrada.bloqueiosReais[0] ?? null;
    return {
      ...canon,
      estado: entrada.bloqueiosReais.length === 0 ? "identificado" : "em_confirmacao",
      itens:
        entrada.bloqueiosReais.length === 0
          ? [{ rotulo: "Bloqueios reais", valor: "Nenhum — caso liberado para avançar" }]
          : [
              { rotulo: "Bloqueios reais pendentes", valor: String(entrada.bloqueiosReais.length) },
              ...(primeiro
                ? [{ rotulo: "Primeiro bloqueio", valor: `${primeiro.regra} — ${primeiro.motivo}` }]
                : []),
            ],
      mensagemVazio: "Nenhum bloqueio de ativação registrado para este caso.",
    };
  }));
}
