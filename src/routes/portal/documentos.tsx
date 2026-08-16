import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { PortalShell, PortalVazio } from "@/components/portal/portal-shell";
import { portalDocumentos } from "@/lib/portal.functions";

export const Route = createFileRoute("/portal/documentos")({
  head: () => ({
    meta: [
      { title: "Documentos — Portal Clube Ancestral" },
      { name: "description", content: "Documentos e certidões liberados para o seu acompanhamento." },
      { property: "og:title", content: "Documentos — Portal Clube Ancestral" },
      { property: "og:description", content: "Documentos liberados do seu caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DocumentosPage,
});

function DocumentosPage() {
  const carregar = useServerFn(portalDocumentos);
  const { data, isLoading } = useQuery({ queryKey: ["portal-documentos"], queryFn: () => carregar({}) });

  return (
    <PortalShell titulo="Documentos" descricao="Apenas documentos liberados pela equipe.">
      {isLoading ? (
        <PortalVazio mensagem="Carregando…" />
      ) : !data || data.length === 0 ? (
        <PortalVazio mensagem="Nenhum documento liberado para você até o momento." />
      ) : (
        <ul className="space-y-3">
          {data.map((d) => (
            <li key={d.id} className="rounded-xl border border-navy/10 bg-white p-4">
              <p className="font-medium">{d.titulo}</p>
              <p className="mt-1 text-sm text-navy/60">{[d.tipo, d.status].filter(Boolean).join(" · ")}</p>
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  );
}
