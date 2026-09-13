import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";

import { listarRegistros } from "@/lib/saas.functions";
import { papelDoRegistro } from "@/lib/caso-ficha";
import { posicionar } from "@/lib/matriz-posicionamento";
import { MatrizPrioridades } from "@/components/desk/matriz-prioridades";
import { MatrizPrioridadeNominal, type PontoMatrizPrioridade } from "@/components/clube-ancestral-kit";
import type { CasoPosicionado } from "@/lib/matriz-posicionamento";

/*
  13/09/2026 — a matriz do kit visual passa a ler os MESMOS casos reais já
  posicionados pelo motor. Nenhum número novo é calculado aqui: a posição
  vem de `posicionar`, e este mapa só traduz faixa em coordenada de desenho.
*/
const ESCALA_ELEGIBILIDADE: Record<CasoPosicionado["elegibilidade"], number> = {
  forte: 95,
  provavel: 78,
  possivel_com_pesquisa: 58,
  baixa: 34,
  inconclusiva: 18,
  nao_avaliada: 8,
};

const ESCALA_URGENCIA: Record<CasoPosicionado["urgencia"], number> = {
  vencida: 92,
  aproximando: 68,
  em_dia: 40,
  sem_base: 10,
};

const PESO_SINAL: Record<CasoPosicionado["sinal"], number> = {
  critica: 0,
  atencao: 1,
  acompanhada: 2,
  sem_dados: 3,
};

function paraPontosDoKit(casos: readonly CasoPosicionado[]): PontoMatrizPrioridade[] {
  return [...casos]
    .sort((a, b) =>
      PESO_SINAL[a.sinal] - PESO_SINAL[b.sinal] ||
      ESCALA_URGENCIA[b.urgencia] - ESCALA_URGENCIA[a.urgencia] ||
      ESCALA_ELEGIBILIDADE[b.elegibilidade] - ESCALA_ELEGIBILIDADE[a.elegibilidade],
    )
    .map((caso, indice) => ({
      id: caso.id,
      nome: caso.rotulo,
      prioridade: indice + 1,
      elegibilidade: ESCALA_ELEGIBILIDADE[caso.elegibilidade],
      urgencia: ESCALA_URGENCIA[caso.urgencia],
      sinal: caso.sinal,
    }));
}

/**
 * Liga a matriz aos casos reais.
 *
 * Alimenta o motor com os MESMOS campos que a lista de Casos 360 já usa, para
 * a matriz e a coluna de prioridade nunca discordarem. Registro demonstrativo
 * entra classificado como tal, e o motor decide o que fazer com isso.
 */
export function MatrizPrioridadesConectada({
  casoSelecionado,
  onSelecionarCaso,
}: {
  casoSelecionado?: string | null;
  onSelecionarCaso?: (caseId: string) => void;
}) {
  const carregar = useServerFn(listarRegistros);
  const q = useQuery({
    queryKey: ["saas", "crm_casos", false],
    queryFn: () => carregar({ data: { entidade: "crm_casos", incluirArquivados: false } }),
    retry: false,
  });

  const casos = useMemo(() => {
    const linhas = (q.data ?? []) as Record<string, unknown>[];
    return linhas.map((l) =>
      posicionar({
        tipo: "caso",
        id: String(l["id"]),
        rotulo: String(l["codigo"] ?? l["titulo"] ?? l["id"]),
        elegibilidade: (l["hipotese_elegibilidade"] as string) ?? null,
        prazo: (l["prazo_proxima_acao"] as string) ?? null,
        diasSemTouchpoint: (l["dias_sem_touchpoint"] as number) ?? null,
        esperaExternaAtiva: !!l["aguardando_instituicao_externa"],
        responsavel: (l["proxima_acao_responsavel"] as string) ?? null,
        origem: papelDoRegistro(l).valor === "demo" ? "demo" : "real",
      }),
    );
  }, [q.data]);

  if (q.isLoading) return <p className="text-sm text-navy/50">Carregando matriz de prioridades…</p>;
  if (q.isError) {
    // Sem fonte, a matriz não desenha nada: quadrante vazio por falha de
    // leitura seria lido como "não há ninguém aqui".
    return (
      <p className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-4 text-sm text-terracotta">
        A matriz de prioridades não pôde ser lida agora. Nenhum quadrante é exibido, para não
        parecer que a carteira está vazia.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <MatrizPrioridadeNominal
        casos={paraPontosDoKit(casos)}
        casoSelecionado={casoSelecionado}
        onSelecionarCaso={onSelecionarCaso}
      />
      <details className="rounded-xl border border-navy/10 bg-cream/40 p-4">
        <summary className="cursor-pointer text-sm font-medium text-navy">
          Grade completa por faixa de elegibilidade e urgência
        </summary>
        <div className="mt-4">
          <MatrizPrioridades
            casos={casos}
            casoSelecionado={casoSelecionado}
            onSelecionarCaso={onSelecionarCaso}
          />
        </div>
      </details>
    </div>
  );
}
