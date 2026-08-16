import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { PortalShell, PortalVazio } from "@/components/portal/portal-shell";
import { meusCasos } from "@/lib/portal-cliente.functions";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Meus casos — Portal Clube Ancestral" },
      { name: "description", content: "Acompanhe o andamento da sua pesquisa genealógica em linguagem simples." },
      { property: "og:title", content: "Meus casos — Portal Clube Ancestral" },
      { property: "og:description", content: "Andamento do seu processo com o Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalHome,
});

function PortalHome() {
  const carregar = useServerFn(meusCasos);
  const { data, isLoading } = useQuery({ queryKey: ["portal-meus-casos"], queryFn: () => carregar({}) });

  return (
    <PortalShell titulo="Meus casos" descricao="Somente casos liberados para o seu acesso aparecem aqui.">
      {isLoading ? (
        <PortalVazio mensagem="Carregando…" />
      ) : !data || data.length === 0 ? (
        <PortalVazio mensagem="Nenhum caso liberado para visualização no momento." />
      ) : (
        <ul className="space-y-3">
          {data.map((c) => (
            <li key={c.id}>
              <Link
                to="/portal/casos/$id"
                params={{ id: c.id }}
                className="block rounded-xl border border-navy/10 bg-white p-4 transition-colors hover:border-gold"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-serif text-lg">{c.titulo}</p>
                  <span className="rounded-full border border-navy/15 bg-cream px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
                    {c.statusRotulo}
                  </span>
                </div>
                <p className="mt-1 text-sm text-navy/70">{c.statusTexto}</p>
                {c.pendencias > 0 ? (
                  <p className="mt-2 text-sm text-terracotta">
                    {c.pendencias === 1 ? "1 documento pendente de envio" : `${c.pendencias} documentos pendentes de envio`}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  );
}
