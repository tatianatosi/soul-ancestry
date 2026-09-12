import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { COPY_GERAL, COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalVazio, PortalCarregando } from "@/components/portal/portal-shell";
import { minhasFaturas } from "@/lib/portal-cliente.functions";

export const Route = createFileRoute("/portal/faturas")({
  head: () => ({
    meta: [
      { title: "Faturas — Portal Clube Ancestral" },
      { name: "description", content: "Consulte as faturas liberadas para visualização no seu acesso." },
      { property: "og:title", content: "Faturas — Portal Clube Ancestral" },
      { property: "og:description", content: "Faturas liberadas do seu caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FaturasPage,
});

function FaturasPage() {
  const carregar = useServerFn(minhasFaturas);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal-faturas"],
    queryFn: () => carregar({}),
    retry: false,
  });

  return (
    <PortalShell titulo={COPY_TELAS.faturas.titulo} descricao={COPY_TELAS.faturas.descricao}>
      {isLoading ? (
        <PortalCarregando />
      ) : isError ? (
        <PortalVazio mensagem={COPY_GERAL.semPermissao} />
      ) : !data || data.length === 0 ? (
        <PortalVazio mensagem={COPY_TELAS.faturas.vazio} />
      ) : (
        <ul className="space-y-2">
          {data.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy/10 bg-cream/40 p-4"
            >
              <div>
                <p className="font-medium">{f.descricao ?? f.numero ?? "Fatura"}</p>
                <p className="text-xs text-navy/50">
                  {f.caso} · vencimento{" "}
                  {f.vencimento ? new Date(f.vencimento).toLocaleDateString("pt-BR") : "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: f.moeda || "BRL" }).format(f.valor)}
                </p>
                <span className="rounded-full border border-navy/15 bg-cream px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
                  {f.statusRotulo}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  );
}
