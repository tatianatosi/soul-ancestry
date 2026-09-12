import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { usePortalVivo } from "@/components/portal/fonte-portal";
import { publicacoesDeFase01 } from "@/lib/portal-dados-vivos";

export const Route = createFileRoute("/portal/fase-01")({
  head: () => ({
    meta: [
      { title: "Relatório preparado — Portal Clube Ancestral" },
      { name: "description", content: "Situação da Fase 01 dentro do seu acompanhamento." },
      { property: "og:title", content: "Relatório preparado — Portal Clube Ancestral" },
      { property: "og:description", content: "Acompanhe a Fase 01 do seu processo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalFase01,
});

export function PortalFase01() {
  const { visibilidade, carregando } = useVisibilidade("relatorio");
  const { data, isLoading } = usePortalVivo();
  const itens = publicacoesDeFase01(data?.projecoes ?? []);

  return (
    <PortalShell titulo={COPY_TELAS.fase01.titulo} descricao={COPY_TELAS.fase01.descricao}>
      {carregando || isLoading ? (
        <PortalCarregando />
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          {itens.length === 0 ? (
            <p className="rounded-lg border border-dashed border-navy/20 bg-cream/60 p-6 text-center text-sm text-navy/60">
              Nenhum conteúdo desta fase foi publicado para consulta até agora.
            </p>
          ) : (
            <ul className="space-y-3">
              {itens.map((item) => (
                <li key={item.id} className="rounded-lg border border-navy/10 bg-cream/40 p-4">
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
