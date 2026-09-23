import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { listarRegistros } from "@/lib/saas.functions";
import { papelDoRegistro } from "@/lib/caso-ficha";
import { posicionar } from "@/lib/matriz-posicionamento";
import { MatrizPrioridades } from "@/components/desk/matriz-prioridades";
import { MatrizPrioridadeNominal, type PontoMatrizPrioridade } from "@/components/clube-ancestral-kit";
import type { CasoPosicionado } from "@/lib/matriz-posicionamento";
import { ROTULO_SINAL, type SinalPrioridade } from "@/lib/prioridade-matriz";

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

const CHIP_SINAL: Record<SinalPrioridade, string> = {
  critica: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  atencao: "border-gold/60 bg-gold/10 text-navy",
  acompanhada: "border-emerald-500/40 bg-emerald-50 text-emerald-800",
  sem_dados: "border-navy/15 bg-cream text-navy/60",
};

function contarPorSinal(casos: readonly CasoPosicionado[]): Record<SinalPrioridade, number> {
  const total: Record<SinalPrioridade, number> = {
    critica: 0,
    atencao: 0,
    acompanhada: 0,
    sem_dados: 0,
  };
  for (const caso of casos) total[caso.sinal] += 1;
  return total;
}

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
 * a matriz e a coluna de prioridade nunca discordarem.
 *
 * BUG-MATRIZ-DEMO-VAZA (2026-09-23): `posicionar()` já calcula `origemNaoReal`
 * internamente (via `calcularPrioridade`), mas `CasoPosicionado` nunca expôs
 * esse campo — então nenhum caso demo era excluído da matriz, violando a
 * regra do projeto ("registros com selo DEMO nunca entram em indicadores").
 * Corrigido filtrando ANTES de chamar `posicionar`, com o mesmo padrão de
 * checkbox "Incluir demonstrações" já usado em financeiro.tsx — oculto por
 * padrão, nunca escondido silenciosamente sem explicar.
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
  const [incluirDemos, setIncluirDemos] = useState(false);

  const linhasTodas = (q.data ?? []) as Record<string, unknown>[];
  const linhasDemo = linhasTodas.filter((l) => papelDoRegistro(l).valor === "demo").length;

  const casos = useMemo(() => {
    const linhas = incluirDemos
      ? linhasTodas
      : linhasTodas.filter((l) => papelDoRegistro(l).valor !== "demo");
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
  }, [linhasTodas, incluirDemos]);

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

  const contagem = contarPorSinal(casos);
  const semDadosReais = casos.length === 0;
  const ordem: SinalPrioridade[] = ["critica", "atencao", "acompanhada", "sem_dados"];

  return (
    <div className="space-y-6">
      {linhasDemo > 0 ? (
        <label className="flex items-center gap-2 text-xs text-navy/60" data-matriz-toggle-demo>
          <input
            type="checkbox"
            checked={incluirDemos}
            onChange={(e) => setIncluirDemos(e.target.checked)}
            className="h-3.5 w-3.5 accent-navy"
          />
          Incluir demonstrações ({linhasDemo} oculta{linhasDemo === 1 ? "" : "s"} por padrão; nunca entram em
          indicadores/contagem sem esta marcação)
        </label>
      ) : null}
      <div
        className="flex flex-wrap items-center gap-2 rounded-lg border border-navy/10 bg-cream/50 px-3 py-2 text-xs text-navy/70"
        data-radar-legenda-ordem
        aria-label="Ordem de atendimento por sinal de prioridade"
      >
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-navy/50">
          Ordem de atendimento ·
        </span>
        {semDadosReais ? (
          <span
            className="rounded-full border border-navy/15 bg-cream px-2 py-0.5 text-[11px] text-navy/60"
            data-radar-chip-sem-dados
          >
            Sem dados reais
          </span>
        ) : (
          ordem.map((sinal) => (
            <span
              key={sinal}
              data-radar-chip-sinal={sinal}
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${CHIP_SINAL[sinal]}`}
              title={`${ROTULO_SINAL[sinal]} · fonte: prioridade-matriz.ts`}
            >
              {ROTULO_SINAL[sinal]}: {contagem[sinal]}
            </span>
          ))
        )}
        <span className="ml-auto text-[10px] text-navy/45">
          Total: {casos.length} caso(s) · matriz e Radar Individual sincronizam pelo caso escolhido.
        </span>
      </div>
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
