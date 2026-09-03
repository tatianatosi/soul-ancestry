import { createFileRoute, Link } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, usePortal, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";

export const Route = createFileRoute("/portal/conta")({
  head: () => ({
    meta: [
      { title: "Conta — Portal Clube Ancestral" },
      { name: "description", content: "Seus dados de acesso ao portal do Clube Ancestral." },
      { property: "og:title", content: "Conta — Portal Clube Ancestral" },
      { property: "og:description", content: "Dados básicos do seu acesso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalConta,
});

function PortalConta() {
  const { visibilidade, carregando } = useVisibilidade("conta");
  const { data } = usePortal();

  return (
    <PortalShell titulo={COPY_TELAS.conta.titulo} descricao={COPY_TELAS.conta.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-navy/10 bg-cream/60 p-3">
              <dt className="text-[11px] uppercase tracking-widest text-navy/50">Titular</dt>
              <dd className="text-sm text-navy">{data?.cliente?.nome ?? "—"}</dd>
            </div>
            <div className="rounded-lg border border-navy/10 bg-cream/60 p-3">
              <dt className="text-[11px] uppercase tracking-widest text-navy/50">Acesso</dt>
              <dd className="text-sm text-navy">Aplicativo do cliente</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/portal/faturas" className="rounded-lg border border-navy/15 px-3 py-1.5 text-xs text-navy">
              Faturas
            </Link>
          </div>
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
