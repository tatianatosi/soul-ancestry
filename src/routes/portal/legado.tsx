import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { legadoSanitizado } from "@/lib/portal-dados-vivos";

export const Route = createFileRoute("/portal/legado")({
  head: () => ({
    meta: [
      { title: "Legado — Portal Clube Ancestral" },
      { name: "description", content: "Materiais de legado publicados para você." },
      { property: "og:title", content: "Legado — Portal Clube Ancestral" },
      { property: "og:description", content: "Sua biblioteca de legado no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalLegado,
});

export function PortalLegado() {
  const { visibilidade, carregando } = useVisibilidade("biblio");
  const { data, isLoading, isError, error, refetch } = usePortalVivo();

  return (
    <PortalShell titulo={COPY_TELAS.legado.titulo} descricao={COPY_TELAS.legado.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <EstadoDados
          carregando={isLoading}
          erro={isError ? (error ?? true) : null}
          dados={data ? [data] : null}
          aoTentarNovamente={refetch}
          recurso="o seu legado"
        >
          {([vivo]) => {
            const entregas = legadoSanitizado(vivo.projecoes);
            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                {entregas.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-navy/20 bg-cream/60 p-6 text-center text-sm text-navy/60">
                    Nenhum material de legado publicado no momento.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {entregas.map((item) => (
                      <li key={item.id} className="rounded-lg border border-navy/10 bg-white p-4">
                        <p className="text-sm font-medium text-navy">{item.tipoRotulo}</p>
                        <p className="mt-1 whitespace-pre-line text-sm text-navy/80">{item.conteudo}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </BlocoVisibilidade>
            );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
