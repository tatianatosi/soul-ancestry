import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { COPY_TELAS } from "@/lib/portal-copy";
import { CLIENTE_DEMO_NOME } from "@/lib/portal-demo-sophia";
import { PortalShell, usePortal, PortalCarregando } from "@/components/portal/portal-shell";
import { usePreviaPortal } from "@/components/portal/fonte-portal";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { minhasFaturas } from "@/lib/portal-cliente.functions";

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

export function PortalConta() {
  const previa = usePreviaPortal();
  const { visibilidade, carregando } = useVisibilidade("conta");
  const { data } = usePortal();
  const carregarFaturas = useServerFn(minhasFaturas);
  const faturas = useQuery({
    queryKey: ["portal-conta-faturas"],
    queryFn: () => carregarFaturas({}),
    retry: false,
    enabled: previa === null,
  });
  const temFatura = (faturas.data?.length ?? 0) > 0;
  const falhaFaturas = faturas.isError;

  return (
    <PortalShell titulo={COPY_TELAS.conta.titulo} descricao={COPY_TELAS.conta.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          <div className="space-y-4">
            <section className="rounded-2xl border border-navy/10 bg-cream/50 p-5 shadow-sm">
              <h2 className="font-serif text-lg text-navy">Perfil</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-navy/10 bg-cream/60 p-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Titular</dt>
                  <dd className="text-sm text-navy">{data?.cliente?.nome ?? (previa ? CLIENTE_DEMO_NOME : null) ?? "—"}</dd>
                </div>
                <div className="rounded-lg border border-navy/10 bg-cream/60 p-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Acesso</dt>
                  <dd className="text-sm text-navy">Aplicativo do cliente</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-navy/10 bg-cream/40 p-5">
              <h2 className="font-serif text-lg text-navy">Plano</h2>
              <p className="mt-2 text-sm text-navy/75">
                Acompanhamento ativo do reconhecimento — detalhes do plano aparecem aqui quando a equipe publica.
              </p>
            </section>

            <section className="rounded-2xl border border-navy/10 bg-cream/50 p-5">
              <h2 className="font-serif text-lg text-navy">Alertas</h2>
              <p className="mt-2 text-sm text-navy/75">
                Avisos sobre documentos e próximas ações do seu caso. Sem alerta publicado no momento.
              </p>
            </section>

            <section className="rounded-2xl border border-navy/10 bg-cream/40 p-5">
              <h2 className="font-serif text-lg text-navy">Histórico</h2>
              <p className="mt-2 text-sm text-navy/75">
                Pagamentos e movimentos da conta ficam reunidos aqui quando disponíveis.
              </p>
            </section>
          </div>

          {falhaFaturas ? (
            <p className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
              Não conseguimos abrir o seu histórico de pagamentos agora.
              <button
                type="button"
                onClick={() => void faturas.refetch()}
                className="rounded-md border border-terracotta/50 px-2 py-0.5 text-xs font-medium text-terracotta"
              >
                Tentar novamente
              </button>
            </p>
          ) : null}

          {temFatura && !previa ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/portal/faturas" className="rounded-lg border border-navy/15 px-3 py-1.5 text-xs text-navy">
                Pagamentos já feitos
              </Link>
            </div>
          ) : null}
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
