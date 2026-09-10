import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { arvoreSanitizada } from "@/lib/portal-dados-vivos";
import { usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";

export const Route = createFileRoute("/portal/arvore")({
  head: () => ({
    meta: [
      { title: "Árvore — Portal Clube Ancestral" },
      { name: "description", content: "Espaço da sua árvore familiar dentro do acompanhamento." },
      { property: "og:title", content: "Árvore — Portal Clube Ancestral" },
      { property: "og:description", content: "Sua árvore familiar no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalArvore,
});

export function PortalArvore() {
  const { visibilidade, carregando } = useVisibilidade("arvore");
  const { data, isLoading, isError, error, refetch } = usePortalVivo();

  return (
    <PortalShell titulo={COPY_TELAS.arvore.titulo} descricao={COPY_TELAS.arvore.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <EstadoDados
          carregando={isLoading}
          erro={isError ? (error ?? true) : null}
          dados={data ? [data] : null}
          aoTentarNovamente={refetch}
          recurso="a sua árvore"
        >
          {([vivo]) => {
            const itens = arvoreSanitizada(vivo.projecoes);
            return (
        <BlocoVisibilidade visibilidade={visibilidade}>
          {itens.length === 0 ? (
            <p className="rounded-lg border border-dashed border-navy/20 bg-cream/60 p-6 text-center text-sm text-navy/60">
              {COPY_TELAS.arvore.vazio}
            </p>
          ) : (
            <ul className="space-y-3">
              {itens.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-navy/10 bg-white p-3 text-sm text-navy/70"
                >
                  {item.conteudo}
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
