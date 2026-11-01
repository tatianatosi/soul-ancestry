import { createFileRoute } from "@tanstack/react-router";
import { CartaoEditorial } from "@/components/portal/elementos-mockup";

import { COPY_TELAS } from "@/lib/portal-copy";
import { CASO_DEMO_CODIGO } from "@/lib/portal-demo-sophia";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { usePortalVivo, usePreviaPortal } from "@/components/portal/fonte-portal";
import { publicacoesDeFase02 } from "@/lib/portal-dados-vivos";

function ChipMeta({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-cream/60 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">{rotulo}</p>
      <p className="mt-0.5 text-sm text-navy">{valor}</p>
    </div>
  );
}

export const Route = createFileRoute("/portal/fase-02")({
  head: () => ({
    meta: [
      { title: "Atualização seguinte — Portal Clube Ancestral" },
      { name: "description", content: "Atualização da etapa seguinte do seu acompanhamento." },
      { property: "og:title", content: "Atualização seguinte — Portal Clube Ancestral" },
      { property: "og:description", content: "Acompanhe a atualização seguinte do seu processo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalFase02,
});

export function PortalFase02() {
  const { visibilidade, carregando } = useVisibilidade("fase02");
  const previa = usePreviaPortal();
  const { data, isLoading } = usePortalVivo();
  const itens = publicacoesDeFase02(data?.projecoes ?? []);

  return (
    <PortalShell titulo={COPY_TELAS.fase02.titulo} descricao={COPY_TELAS.fase02.descricao}>
      {carregando || isLoading ? (
        <PortalCarregando />
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          {/* permiteUpsell é sempre false: nenhuma oferta, preço ou CTA de compra. */}
          <div className="space-y-4">
            <div
              data-atualizacao-meta
              className="flex flex-wrap gap-2 rounded-xl border border-navy/10 bg-cream/50 px-4 py-3"
            >
              <ChipMeta
                rotulo="Caso"
                valor={previa?.identidade?.codigo ?? (previa ? CASO_DEMO_CODIGO : "—")}
              />
              <ChipMeta rotulo="Tipo" valor="Atualização" />
              <ChipMeta
                rotulo="Publicados"
                valor={itens.length === 0 ? "Em preparação" : String(itens.length)}
              />
              <ChipMeta
                rotulo="Estado"
                valor={itens.length === 0 ? "Aguardando liberação" : "Conteúdo liberado"}
              />
            </div>
            {itens.length === 0 ? (
              <CartaoEditorial texto="As atualizações desta etapa terão seu lugar aqui quando forem publicadas." />
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
          </div>
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
