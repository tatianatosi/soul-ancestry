import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaFluxo, FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/kanban")({
  head: () => ({
    meta: [
      { title: "Kanban — Go-live Clube Ancestral" },
      { name: "description", content: "Microentregas do caso canônico organizadas pelo estado registrado." },
      { property: "og:title", content: "Kanban — Go-live Clube Ancestral" },
      { property: "og:description", content: "Microentregas do caso canônico por estado real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KanbanGoLive,
});

function KanbanGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  const colunas = new Map<string, { id: string; titulo: string; prazo: string | null }[]>();
  for (const m of caso?.microentregas ?? []) {
    const chave = m.status ?? "Sem estado registrado";
    const atual = colunas.get(chave) ?? [];
    atual.push({ id: m.id, titulo: m.titulo, prazo: m.prazo });
    colunas.set(chave, atual);
  }

  return (
    <GoLiveShell titulo="Kanban" descricao="Microentregas do caso, pelo estado registrado.">
      <FaixaFluxo atual="Caso" />
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}
      {data && !data.encontrado ? (
        <Vazio cta={<span className="text-sm text-navy/60">Nenhum trabalho em andamento nesta conta.</span>} />
      ) : null}

      {caso ? (
        <>
          <FaixaIdentidade dados={caso} />

          {colunas.size ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...colunas.entries()].map(([estado, itens]) => (
                <Bloco key={estado} titulo={estado}>
                  <ul className="space-y-2">
                    {itens.map((i) => (
                      <li key={i.id} className="min-w-0 rounded-xl border border-navy/10 bg-cream px-3 py-2">
                        <p className="break-words text-sm text-navy">{i.titulo}</p>
                        {i.prazo ? <p className="text-xs text-navy/55">Prazo: {i.prazo}</p> : null}
                      </li>
                    ))}
                  </ul>
                </Bloco>
              ))}
            </div>
          ) : (
            <Bloco titulo="Microentregas">
              <Vazio
                cta={
                  <Link to="/golive/caso">
                    <Button size="sm">Publicar uma atualização no caso</Button>
                  </Link>
                }
              />
            </Bloco>
          )}
        </>
      ) : null}
    </GoLiveShell>
  );
}
