import { createFileRoute } from "@tanstack/react-router";
import { CartaoEditorial } from "@/components/portal/elementos-mockup";

import { COPY_TELAS } from "@/lib/portal-copy";
import { CASO_DEMO_CODIGO } from "@/lib/portal-demo-sophia";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { usePortalVivo, usePreviaPortal } from "@/components/portal/fonte-portal";
import { AvisoFalhaConexao } from "@/components/portal/aviso-falha-conexao";
import { publicacoesDeEntrega } from "@/lib/portal-dados-vivos";


function ChipMeta({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-cream/60 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">{rotulo}</p>
      <p className="mt-0.5 text-sm text-navy">{valor}</p>
    </div>
  );
}

export const Route = createFileRoute("/portal/entregas")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Materiais liberados — Portal Clube Ancestral" },
      { name: "description", content: "Materiais liberados para você dentro do seu acompanhamento." },
      { property: "og:title", content: "Materiais liberados — Portal Clube Ancestral" },
      { property: "og:description", content: "Materiais publicados pelo Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalEntregas,
});

export function PortalEntregas() {
  const { visibilidade, carregando } = useVisibilidade("entrega");
  const previa = usePreviaPortal();
  const { data, isLoading, isError, refetch } = usePortalVivo();
  const itens = publicacoesDeEntrega(data?.projecoes ?? []);

  return (
    <PortalShell titulo={COPY_TELAS.entregas.titulo} descricao={COPY_TELAS.entregas.descricao}>
      {carregando || isLoading ? (
        <PortalCarregando />
      ) : isError ? (
        // C3 (02/11/2026): falha de carga nunca vira "materiais em preparação".
        <AvisoFalhaConexao mensagem="Não conseguimos carregar agora. Tente de novo." aoTentar={() => void refetch()} />
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>

          <div className="space-y-4">
            <div
              data-materiais-meta
              className="flex flex-wrap gap-2 rounded-xl border border-navy/10 bg-cream/50 px-4 py-3"
            >
              <ChipMeta rotulo="Caso" valor={previa?.identidade?.codigo ?? (previa ? CASO_DEMO_CODIGO : "—")} />
              <ChipMeta rotulo="Tipo" valor="Materiais" />
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
            <CartaoEditorial texto="Os materiais terão seu lugar aqui quando forem liberados para a família." />
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
