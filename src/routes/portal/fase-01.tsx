import { createFileRoute } from "@tanstack/react-router";
import { CartaoEditorial } from "@/components/portal/elementos-mockup";

import { COPY_TELAS } from "@/lib/portal-copy";
import { CASO_DEMO_CODIGO } from "@/lib/portal-demo-sophia";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { usePortalVivo, usePreviaPortal } from "@/components/portal/fonte-portal";
import { AvisoFalhaConexao } from "@/components/portal/aviso-falha-conexao";
import { publicacoesDeFase01 } from "@/lib/portal-dados-vivos";


function ChipMeta({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-cream/60 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">{rotulo}</p>
      <p className="mt-0.5 text-sm text-navy">{valor}</p>
    </div>
  );
}

export const Route = createFileRoute("/portal/fase-01")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Relatório preparado — Portal Clube Ancestral" },
      { name: "description", content: "Relatório da primeira etapa do seu acompanhamento." },
      { property: "og:title", content: "Relatório preparado — Portal Clube Ancestral" },
      { property: "og:description", content: "Acompanhe o relatório preparado para o seu processo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalFase01,
});

export function PortalFase01() {
  const { visibilidade, carregando } = useVisibilidade("relatorio");
  const previa = usePreviaPortal();
  const { data, isLoading, isError, refetch } = usePortalVivo();
  const itens = publicacoesDeFase01(data?.projecoes ?? []);

  return (
    <PortalShell titulo={COPY_TELAS.fase01.titulo} descricao={COPY_TELAS.fase01.descricao}>
      {carregando || isLoading ? (
        <PortalCarregando />
      ) : isError ? (
        // C3 (02/11/2026): falha de carga nunca vira "em preparação".
        <AvisoFalhaConexao mensagem="Não conseguimos carregar agora. Tente de novo." aoTentar={() => void refetch()} />
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>

          <div className="space-y-4">
            <div
              data-relatorio-meta
              className="flex flex-wrap gap-2 rounded-xl border border-navy/10 bg-cream/50 px-4 py-3"
            >
              <ChipMeta rotulo="Caso" valor={previa?.identidade?.codigo ?? (previa ? CASO_DEMO_CODIGO : "—")} />
              <ChipMeta rotulo="Tipo" valor="Relatório" />
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
            <CartaoEditorial texto="Os relatórios desta etapa terão seu lugar aqui quando forem publicados." />
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
