import { createFileRoute } from "@tanstack/react-router";

import { PortalShell } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { arvoreSanitizada } from "@/lib/portal-dados-vivos";
import { usePortalVivo } from "@/routes/portal/jornada";

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

function PortalArvore() {
  const { visibilidade, carregando } = useVisibilidade("arvore");
  const { data, isLoading } = usePortalVivo();
  const itens = arvoreSanitizada(data?.projecoes ?? []);

  return (
    <PortalShell titulo="Árvore" descricao="A leitura da sua família é publicada aqui quando estiver confirmada.">
      {carregando || isLoading ? (
        <p className="text-sm text-navy/60">Carregando…</p>
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          {itens.length === 0 ? (
            <p className="rounded-lg border border-dashed border-navy/20 bg-cream/60 p-6 text-center text-sm text-navy/60">
              Nenhuma pessoa, relação ou data foi publicada para visualização até agora.
            </p>
          ) : (
            <ul className="space-y-3">
              {itens.map((item) => (
                <li key={item.id} className="rounded-lg border border-navy/10 bg-white p-3 text-sm text-navy/70">
                  {item.conteudo}
                </li>
              ))}
            </ul>
          )}
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
