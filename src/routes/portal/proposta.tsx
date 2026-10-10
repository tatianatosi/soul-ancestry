import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { COPY_GERAL, COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalVazio, PortalCarregando } from "@/components/portal/portal-shell";
import { EstadoDados } from "@/components/saas/estado-dados";
import { portalProposta } from "@/lib/portal.functions";

export const Route = createFileRoute("/portal/proposta")({
  head: () => ({
    meta: [
      { title: "Proposta — Portal Clube Ancestral" },
      { name: "description", content: "Sua proposta de pesquisa genealógica e condições comerciais." },
      { property: "og:title", content: "Proposta — Portal Clube Ancestral" },
      { property: "og:description", content: "Condições e etapas da sua proposta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PropostaPage,
});

function formatarValor(v: number, moeda: string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda || "BRL" }).format(Number(v ?? 0));
}

function PropostaPage() {
  const carregar = useServerFn(portalProposta);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["portal-proposta"],
    queryFn: () => carregar({}),
  });

  return (
    <PortalShell titulo={COPY_TELAS.proposta.titulo} descricao={COPY_TELAS.proposta.descricao}>
      {isLoading ? (
        <PortalCarregando />
      ) : (
        <EstadoDados
          superficie="app"
          erro={error}
          dados={data ? [data] : null}
          aoTentarNovamente={() => void refetch()}
          recurso="a sua proposta"
        >
          {() => (
        <div className="space-y-6">
          <section>
            <h2 className="font-serif text-xl">Escopo</h2>
            {!data?.casos.length ? (
              <div className="mt-3">
                <PortalVazio mensagem="O detalhamento aparece aqui assim que estiver disponível para você." />
              </div>
            ) : (
              <ul className="mt-3 space-y-3">
                {data.casos.map((c) => (
                  <li key={c.id} className="rounded-xl border border-navy/10 bg-cream/40 p-4">
                    <p className="font-medium">{c.titulo}</p>
                    <p className="mt-1 text-sm text-navy/60">{[c.pais, c.via].filter(Boolean).join(" · ")}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-serif text-xl">Condições</h2>
            {!data?.faturas.length ? (
              <div className="mt-3">
                <PortalVazio
                  mensagem={
                    data?.restritoAoContratante
                      ? COPY_GERAL.faturasApenasContratante
                      : "As condições combinadas aparecem aqui assim que estiverem disponíveis para você."
                  }
                />
              </div>
            ) : (
              <ul className="mt-3 space-y-3">
                {data.faturas.map((f) => (
                  <li key={f.id} className="flex items-center justify-between rounded-xl border border-navy/10 bg-cream/40 p-4">
                    <div>
                      <p className="font-medium">{f.numero ? `Fatura ${f.numero}` : "Fatura"}</p>
                      <p className="text-sm text-navy/60">
                        {f.status}
                        {f.vencimento ? ` · vence em ${new Date(f.vencimento).toLocaleDateString("pt-BR")}` : ""}
                      </p>
                    </div>
                    <p className="font-serif text-lg">{formatarValor(f.valor, f.moeda)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
          )}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
