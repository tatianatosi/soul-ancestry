import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalVazio, PortalCarregando } from "@/components/portal/portal-shell";
import { usePreviaPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { meusCasos } from "@/lib/portal-cliente.functions";
import { EstadoDados } from "@/components/saas/estado-dados";
import { jornadaSanitizada } from "@/lib/portal-dados-vivos";

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

export function PortalHome() {
  const previa = usePreviaPortal();
  const vivo = usePortalVivo();
  const carregar = useServerFn(meusCasos);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["portal-meus-casos"],
    queryFn: () => carregar({}),
    enabled: previa === null,
  });

  if (previa) {
    const jornada = jornadaSanitizada(vivo.data?.projecoes ?? [], new Date(), vivo.data?.proximaAcao);
    return (
      <PortalShell titulo={COPY_TELAS.home.titulo} descricao={COPY_TELAS.home.descricao}>
        {vivo.isLoading ? (
          <PortalCarregando />
        ) : (
          <div className="rounded-xl border border-navy/10 bg-white p-4">
            <p className="font-serif text-lg">{previa.titulo}</p>
            <p className="mt-2 text-sm text-navy/70">Próximo passo: {jornada.proximoPasso}</p>
          </div>
        )}
      </PortalShell>
    );
  }

  return (
    <PortalShell titulo={COPY_TELAS.home.titulo} descricao={COPY_TELAS.home.descricao}>
      <EstadoDados
        carregando={isLoading}
        erro={error}
        dados={data}
        aoTentarNovamente={() => void refetch()}
        recurso="os seus casos"
        vazio={COPY_TELAS.casos.vazio}
      >
        {(casos) => (
        <ul className="space-y-3">
          {casos.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-navy/10 bg-white p-4 transition-colors hover:border-gold"
            >
              <Link
                to="/portal/casos/$id"
                params={{ id: c.id }}
                className="block"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-serif text-lg">{c.titulo}</p>
                  <span className="rounded-full border border-navy/15 bg-cream px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
                    {c.statusRotulo}
                  </span>
                </div>
                <p className="mt-1 text-sm text-navy/70">{c.statusTexto}</p>
              </Link>
              {c.proximoPasso ? (
                <p className="mt-2 text-sm text-navy">
                  Próximo passo: {c.proximoPasso}{" "}
                  {c.proximoPassoDestino ? (
                    <Link
                      to={c.proximoPassoDestino}
                      className="font-medium text-terracotta underline-offset-2 hover:underline"
                    >
                      Abrir
                    </Link>
                  ) : null}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        )}
      </EstadoDados>
    </PortalShell>
  );
}
