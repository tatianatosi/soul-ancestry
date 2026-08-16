import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { PortalShell, PortalVazio } from "@/components/portal/portal-shell";
import { portalCaso } from "@/lib/portal.functions";

export const Route = createFileRoute("/portal/casos/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe do caso — Portal Clube Ancestral" },
      { name: "description", content: "Andamento, evidências liberadas e próximos passos do seu caso." },
      { property: "og:title", content: "Detalhe do caso — Portal Clube Ancestral" },
      { property: "og:description", content: "Acompanhe evidências e status do seu caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CasoPage,
});

function CasoPage() {
  const { id } = useParams({ from: "/portal/casos/$id" });
  const carregar = useServerFn(portalCaso);
  const { data, isLoading } = useQuery({ queryKey: ["portal-caso", id], queryFn: () => carregar({ data: { id } }) });

  if (isLoading) return <PortalShell titulo="Caso"><PortalVazio mensagem="Carregando…" /></PortalShell>;
  if (!data?.caso)
    return (
      <PortalShell titulo="Caso">
        <PortalVazio mensagem="Este caso não está disponível para o seu acesso." />
      </PortalShell>
    );

  return (
    <PortalShell titulo={data.caso.titulo} descricao={[data.caso.pais, data.caso.via].filter(Boolean).join(" · ")}>
      <div className="rounded-xl border border-navy/10 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-navy/50">Situação</p>
        <p className="mt-1 font-medium">{data.caso.status}</p>
      </div>

      <h2 className="mt-6 font-serif text-xl">Evidências liberadas</h2>
      {data.evidencias.length === 0 ? (
        <div className="mt-3">
          <PortalVazio mensagem="Nenhuma evidência liberada para você até o momento." />
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {data.evidencias.map((e) => (
            <li key={e.id} className="rounded-xl border border-navy/10 bg-white p-4">
              <p className="font-medium">{e.titulo}</p>
              <p className="mt-1 text-sm text-navy/60">{[e.tipo, e.status].filter(Boolean).join(" · ")}</p>
              {e.descricao ? <p className="mt-2 text-sm text-navy/70">{e.descricao}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  );
}
