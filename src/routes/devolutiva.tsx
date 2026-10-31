import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { decidirAcessoDesk } from "@/lib/superficie-interna-regras";
import { CLIENT_ONE_PAGES, onePageByCaso, ONE_PAGE_GUILHERME } from "@/data/client-one-page";
import { ClientResearchOnePageModal } from "@/components/client-research-one-page";

export const Route = createFileRoute("/devolutiva")({
  // 25/10/2026 (auditoria pré-lançamento): a página mostra one-pages com nomes
  // de clientes e estava aberta sem login. Mesmo portão do Desk (_authenticated).
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    const usuario = data.session?.user ?? null;
    if (!usuario) throw redirect({ to: "/equipe/entrar" });
    const { data: papeis, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", usuario.id)
      .is("archived_at", null);
    const decisao = decidirAcessoDesk({
      autenticado: true,
      papeis: (papeis ?? []).map((p) => p.role as string),
      erroLeitura: Boolean(error),
    });
    if (decisao === "portal") throw redirect({ to: "/portal" });
  },
  validateSearch: (search: Record<string, unknown>): { cliente?: string } => ({
    cliente: typeof search["cliente"] === "string" ? search["cliente"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Devolutiva Inicial — Clube Ancestral" },
      {
        name: "description",
        content:
          "Preview interno da one-page de leitura inicial de pesquisa genealógica, pronta para exportação em PNG ou PDF.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Devolutiva Inicial — Clube Ancestral" },
      {
        property: "og:description",
        content: "One-page de leitura inicial de pesquisa genealógica — preview interno.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DevolutivaPage,
});

function DevolutivaPage() {
  const { cliente } = Route.useSearch();
  const navigate = useNavigate();
  const data = onePageByCaso(cliente) ?? ONE_PAGE_GUILHERME;

  return (
    <div className="min-h-screen bg-cream">
      <div className="flex flex-wrap gap-2 px-4 py-3">
        {Object.values(CLIENT_ONE_PAGES).map((p) => (
          <button
            key={p.clientId}
            type="button"
            onClick={() => navigate({ to: "/devolutiva", search: { cliente: p.clientId } })}
            className={`rounded-full border px-3 py-1 text-xs ${
              p.clientId === data.clientId
                ? "border-gold bg-gold/15 text-navy"
                : "border-navy/20 bg-cream/50 text-navy/70"
            }`}
          >
            {p.displayName}
          </button>
        ))}
      </div>
      <ClientResearchOnePageModal data={data} onClose={() => navigate({ to: "/" })} />
    </div>
  );
}
