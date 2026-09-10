import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { usePortalVivo } from "@/components/portal/fonte-portal";
import { publicacoesDeEntrega } from "@/lib/portal-dados-vivos";

export const Route = createFileRoute("/portal/entregas")({
  head: () => ({
    meta: [
      { title: "Entregas da Jornada — Portal Clube Ancestral" },
      { name: "description", content: "Entregas liberadas para você dentro do seu acompanhamento." },
      { property: "og:title", content: "Entregas da Jornada — Portal Clube Ancestral" },
      { property: "og:description", content: "Suas entregas publicadas pelo Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalEntregas,
});

export function PortalEntregas() {
  const { visibilidade, carregando } = useVisibilidade("entrega");
  const { data, isLoading } = usePortalVivo();
  const itens = publicacoesDeEntrega(data?.projecoes ?? []);

  return (
    <PortalShell titulo={COPY_TELAS.entregas.titulo} descricao={COPY_TELAS.entregas.descricao}>
      {carregando || isLoading ? (
        <PortalCarregando />
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          {itens.length === 0 ? (
            <p className="rounded-lg border border-dashed border-navy/20 bg-cream/60 p-6 text-center text-sm text-navy/60">
              Nenhuma entrega publicada para consulta no momento.
            </p>
          ) : (
            <ul className="space-y-3">
              {itens.map((item) => (
                <li key={item.id} className="rounded-lg border border-navy/10 bg-white p-4">
                  <p className="text-sm font-medium text-navy">{item.tipoRotulo}</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-navy/80">{item.conteudo}</p>
                </li>
              ))}
            </ul>
          )}
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
