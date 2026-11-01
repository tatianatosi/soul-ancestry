import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Bloco, FaixaKpis, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaFluxo, FaixaIdentidade } from "@/components/golive/identidade";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive, useEscritorGoLive, buscaGoLive } from "@/components/golive/dados";
import { definirProximaAcaoGoLive } from "@/lib/golive-escritores.functions";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import {
  faixaDePrazo,
  kpisPrazo,
  type AcaoOperacional,
} from "@/lib/golive-operacao";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/kanban")({
  staticData: { sitemap: false },
  validateSearch: buscaGoLive,
  head: () => ({
    meta: [
      { title: "Kanban — Go-live Clube Ancestral" },
      { name: "description", content: "Ações e microentregas do caso canônico organizadas por prazo e estado registrado." },
      { property: "og:title", content: "Kanban — Go-live Clube Ancestral" },
      { property: "og:description", content: "Ações do caso canônico por prazo e estado real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KanbanGoLive,
});

const COLUNAS = ["Vencida", "Hoje", "Próximos 7 dias", "Aguardando externo"] as const;
type Coluna = (typeof COLUNAS)[number];

function KanbanGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const definir = useEscritorGoLive(definirProximaAcaoGoLive);
  const [colunaMobile, setColunaMobile] = useState<Coluna>("Hoje");

  /* Fonte das colunas: ações do caso (tarefas) e microentregas em aberto,
     classificadas somente pelo estado e pelo prazo já gravados. */
  const itens: AcaoOperacional[] = caso
    ? [
        ...caso.tarefas,
        ...caso.microentregas.map((m) => ({
          id: m.id,
          titulo: m.titulo,
          status: m.status,
          prazo: m.prazo,
          bloqueio: false,
          concluidaEm: m.concluidaEm,
          responsavel: m.responsavel,
        })),
      ]
    : [];

  const colunas = new Map<Coluna, AcaoOperacional[]>(COLUNAS.map((c) => [c, [] as AcaoOperacional[]]));
  for (const i of itens) {
    const faixa = faixaDePrazo(i);
    if ((COLUNAS as readonly string[]).includes(faixa)) colunas.get(faixa as Coluna)!.push(i);
  }

  const kpis = kpisPrazo(itens);
  return (
    <GoLiveShell titulo="Kanban" descricao="O trabalho do caso organizado por prazo.">
      <FaixaFluxo atual="Caso" />
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}
      {data && !data.encontrado ? (
        <Vazio cta={<span className="text-sm text-navy/60">Nenhum trabalho em andamento nesta conta.</span>} />
      ) : null}

      {caso ? (
        <>
          <FaixaIdentidade dados={caso} />
          <FaixaKpis itens={[
            { rotulo: "Vencidas", valor: kpis.vencida, tom: kpis.vencida ? "terracota" : "cinza" },
            { rotulo: "Hoje", valor: kpis.hoje, tom: kpis.hoje ? "azul" : "cinza" },
            { rotulo: "Próximos sete dias", valor: kpis.proximos7, tom: kpis.proximos7 ? "azul" : "cinza" },
            { rotulo: "Aguardando externo", valor: kpis.externo, tom: kpis.externo ? "dourado" : "cinza" },
          ]} />

          {/* Mobile: uma coluna por vez, sem rolagem horizontal. */}
          <div className="lg:hidden">
            <nav aria-label="Colunas de prazo" className="min-w-0">
              <ul className="flex flex-wrap gap-1.5">
                {COLUNAS.map((c) => (
                  <li key={c}>
                    <button
                      type="button"
                      aria-current={c === colunaMobile ? "true" : undefined}
                      onClick={() => setColunaMobile(c)}
                      className={
                        c === colunaMobile
                          ? "rounded-full bg-gold/25 px-3 py-1.5 text-xs font-semibold text-navy"
                          : "rounded-full border border-navy/15 px-3 py-1.5 text-xs text-navy/70"
                      }
                    >
                      {c} ({colunas.get(c)!.length})
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-3">
              <ColunaKanban titulo={colunaMobile} itens={colunas.get(colunaMobile)!} />
            </div>
          </div>

          {/* Desktop: as quatro colunas lado a lado. */}
          <div className="hidden gap-3 lg:grid lg:grid-cols-4">
            {COLUNAS.map((c) => (
              <ColunaKanban key={c} titulo={c} itens={colunas.get(c)!} />
            ))}
          </div>

          <Bloco titulo="Próxima ação do caso">
            <p className="break-words text-sm text-navy">
              {humano(caso.plano?.proximaAcao ?? caso.caso.proximaAcao) ?? "Sem itens nesta etapa"}
              {caso.plano?.prazo ?? caso.caso.prazo ? (
                <span className="text-navy/55"> · até {dataHumana(caso.plano?.prazo ?? caso.caso.prazo)}</span>
              ) : null}
            </p>
            <Acoes>
              <Acao
                rotulo="Definir próxima ação"
                titulo="O que vem agora neste caso"
                variante="outline"
                campos={[
                  { nome: "proximaAcao", rotulo: "Próxima ação", tipo: "area", obrigatorio: true },
                  { nome: "responsavel", rotulo: "Responsável" },
                  { nome: "prazo", rotulo: "Prazo", tipo: "data" },
                ]}
                aoConfirmar={(v) =>
                  definir({
                    data: {
                      proximaAcao: v["proximaAcao"] ?? "",
                      responsavel: v["responsavel"] ?? "",
                      prazo: v["prazo"] ?? "",
                    },
                  })
                }
                confirmacao="Próxima ação registrada no planejador."
              />
            </Acoes>
          </Bloco>
        </>
      ) : null}
    </GoLiveShell>
  );
}

function LinkCaso() {
  return (
    <Link search={true} to="/golive/caso">
      <Button size="sm" variant="outline">
        Abrir Caso 360
      </Button>
    </Link>
  );
}

function ColunaKanban({ titulo, itens }: { titulo: string; itens: AcaoOperacional[] }) {
  return (
    <Bloco titulo={`${titulo} (${itens.length})`}>
      {itens.length ? (
        <ul className="space-y-2">
          {itens.map((i) => (
            <li key={i.id} className="min-w-0 rounded-xl border border-navy/10 bg-cream px-3 py-2">
              <p className="break-words text-sm text-navy">{i.titulo}</p>
              <p className="text-xs text-navy/55">
                {dataHumana(i.prazo)} · {humano(i.status, "Sem estado registrado")}
              </p>
              <p className="text-xs text-navy/45">{i.responsavel ?? "Sem responsável registrado"}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-navy/20 bg-white/60 p-4 text-center">
          <p className="text-sm text-navy/70">Sem itens nesta etapa</p>
          <Link search={true} to="/golive/caso" className="mt-2 inline-block text-sm text-navy underline decoration-gold underline-offset-4">
            Abrir Caso 360
          </Link>
        </div>
      )}
    </Bloco>
  );
}

