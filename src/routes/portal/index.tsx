import { createFileRoute, Link } from "@tanstack/react-router";

import { PortalShell, PortalVazio, usePortal } from "@/components/portal/portal-shell";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Meus casos — Portal Clube Ancestral" },
      { name: "description", content: "Acompanhe o andamento da sua pesquisa genealógica e da sua cidadania." },
      { property: "og:title", content: "Meus casos — Portal Clube Ancestral" },
      { property: "og:description", content: "Andamento da sua jornada de dupla cidadania." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalHome,
});

function PortalHome() {
  const { data, isLoading } = usePortal();

  return (
    <PortalShell titulo="Meus casos" descricao="Somente casos liberados pela equipe aparecem aqui.">
      {isLoading ? (
        <PortalVazio mensagem="Carregando…" />
      ) : !data?.autorizado ? (
        <PortalVazio mensagem="Seu acesso ainda não foi liberado pela equipe." />
      ) : data.casos.length === 0 ? (
        <PortalVazio mensagem="Nenhum caso liberado para visualização no momento." />
      ) : (
        <ul className="space-y-3">
          {data.casos.map((c) => (
            <li key={c.id}>
              <Link
                to="/portal/casos/$id"
                params={{ id: c.id }}
                className="block rounded-xl border border-navy/10 bg-white p-4 transition-colors hover:border-gold"
              >
                <p className="font-serif text-lg">{c.titulo}</p>
                <p className="mt-1 text-sm text-navy/60">
                  {[c.pais, c.via, c.status].filter(Boolean).join(" · ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  );
}
