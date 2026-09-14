import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaFluxo, FaixaIdentidade } from "@/components/golive/identidade";
import { Barras } from "@/components/golive/graficos";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive } from "@/components/golive/dados";
import { definirProximaAcaoGoLive } from "@/lib/golive-escritores.functions";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/kanban")({
  head: () => ({
    meta: [
      { title: "Kanban — Go-live Clube Ancestral" },
      { name: "description", content: "Microentregas do caso canônico organizadas por prazo e estado registrado." },
      { property: "og:title", content: "Kanban — Go-live Clube Ancestral" },
      { property: "og:description", content: "Microentregas do caso canônico por prazo e estado real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KanbanGoLive,
});

const COLUNAS = ["Hoje", "Próximos 7 dias", "Aguardando externo", "Concluído"] as const;
type Coluna = (typeof COLUNAS)[number];

type Cartao = { id: string; titulo: string; prazo: string | null; status: string | null; etiqueta: string };

/** Classificação apenas de apresentação, pelo estado e pelo prazo já gravados. */
function classificar(status: string | null, prazo: string | null): { coluna: Coluna; etiqueta: string } {
  const s = (status ?? "").toLowerCase();
  if (/public|conclu|entreg|aprovad|arquiv/.test(s)) return { coluna: "Concluído", etiqueta: "Concluída" };
  if (/aguard|extern|pendente_cliente|espera/.test(s))
    return { coluna: "Aguardando externo", etiqueta: "Aguardando externo" };

  if (!prazo) return { coluna: "Próximos 7 dias", etiqueta: "Sem prazo" };
  const d = new Date(prazo);
  if (Number.isNaN(d.getTime())) return { coluna: "Próximos 7 dias", etiqueta: "Sem prazo" };
  const hoje = new Date();
  const dias = Math.floor((d.setHours(0, 0, 0, 0) - hoje.setHours(0, 0, 0, 0)) / 86400000);
  if (dias < 0) return { coluna: "Hoje", etiqueta: "Vencida" };
  if (dias === 0) return { coluna: "Hoje", etiqueta: "Hoje" };
  if (dias <= 7) return { coluna: "Próximos 7 dias", etiqueta: "Futura" };
  return { coluna: "Próximos 7 dias", etiqueta: "Futura" };
}

function KanbanGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const definir = useServerFn(definirProximaAcaoGoLive);

  const colunas = new Map<Coluna, Cartao[]>(COLUNAS.map((c) => [c, [] as Cartao[]]));
  for (const m of caso?.microentregas ?? []) {
    const { coluna, etiqueta } = classificar(m.status, m.prazo);
    colunas.get(coluna)!.push({ id: m.id, titulo: m.titulo, prazo: m.prazo, status: m.status, etiqueta });
  }
  const total = [...colunas.values()].reduce((n, v) => n + v.length, 0);

  return (
    <GoLiveShell titulo="Operação" descricao="O trabalho do caso por prazo.">
      <FaixaFluxo atual="Caso" />
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}
      {data && !data.encontrado ? (
        <Vazio cta={<span className="text-sm text-navy/60">Nenhum trabalho em andamento nesta conta.</span>} />
      ) : null}

      {caso ? (
        <>
          <FaixaIdentidade dados={caso} />

          {total > 0 ? (
            <Bloco titulo="Distribuição do trabalho">
              <Barras
                titulo="Microentregas por coluna"
                dados={COLUNAS.map((c) => ({ rotulo: c, valor: colunas.get(c)!.length }))}
              />
            </Bloco>
          ) : null}



          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
            {COLUNAS.map((coluna) => {
              const itens = colunas.get(coluna)!;
              return (
                <Bloco key={coluna} titulo={`${coluna} (${itens.length})`}>
                  {itens.length ? (
                    <ul className="space-y-2">
                      {itens.map((i) => (
                        <li key={i.id} className="min-w-0 rounded-xl border border-navy/10 bg-cream px-3 py-2">
                          <p className="break-words text-sm text-navy">{i.titulo}</p>
                          <p className="text-xs text-navy/55">
                            {i.etiqueta} · {dataHumana(i.prazo)}
                          </p>
                          <p className="text-xs text-navy/45">{humano(i.status, "Sem estado registrado")}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-xl border border-dashed border-navy/20 bg-white/60 p-4 text-center">
                      <p className="text-sm text-navy/70">Nenhum item nesta coluna</p>
                      <Link to="/golive/caso" className="mt-2 inline-block text-sm text-navy underline decoration-gold underline-offset-4">
                        Abrir Caso 360
                      </Link>
                    </div>
                  )}
                </Bloco>
              );
            })}
          </div>

          <Bloco titulo="Próxima ação do caso">
            <p className="break-words text-sm text-navy">
              {caso.plano?.proximaAcao ?? caso.caso.proximaAcao ?? "Sem itens nesta etapa"}
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

          {total === 0 ? (
            <p className="text-xs text-navy/55">
              Nenhuma microentrega registrada até agora. Crie a primeira no Caso 360.
            </p>
          ) : null}
        </>
      ) : null}
    </GoLiveShell>
  );
}
