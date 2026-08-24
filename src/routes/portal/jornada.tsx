import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { PortalShell } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { dadosVivosDoPortal } from "@/lib/portal-dados-vivos.functions";
import { jornadaSanitizada } from "@/lib/portal-dados-vivos";

export const Route = createFileRoute("/portal/jornada")({
  head: () => ({
    meta: [
      { title: "Jornada — Portal Clube Ancestral" },
      { name: "description", content: "Linha do tempo do seu acompanhamento com o Clube Ancestral." },
      { property: "og:title", content: "Jornada — Portal Clube Ancestral" },
      { property: "og:description", content: "Acompanhe as etapas da sua jornada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalJornada,
});

export function usePortalVivo() {
  const carregar = useServerFn(dadosVivosDoPortal);
  return useQuery({ queryKey: ["portal-dados-vivos"], queryFn: () => carregar({ data: {} }) });
}

function PortalJornada() {
  const { visibilidade, carregando } = useVisibilidade("jornada");
  const { data, isLoading } = usePortalVivo();
  const jornada = jornadaSanitizada(data?.projecoes ?? []);

  return (
    <PortalShell titulo="Jornada" descricao="As etapas do seu acompanhamento, em linguagem simples.">
      {carregando || isLoading ? (
        <p className="text-sm text-navy/60">Carregando…</p>
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          <p className="mb-4 rounded-lg border border-navy/10 bg-cream/60 p-3 text-sm text-navy/70">
            {jornada.proximoPasso}
          </p>
          {jornada.linha.length === 0 ? (
            <p className="rounded-lg border border-dashed border-navy/20 p-6 text-center text-sm text-navy/60">
              Nenhuma atualização publicada até agora.
            </p>
          ) : (
            <ol className="space-y-3">
              {jornada.linha.map((item) => (
                <li key={item.id} className="flex items-start gap-3 rounded-lg border border-navy/10 bg-white p-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <div>
                    <p className="text-sm font-medium text-navy">{item.tipoRotulo}</p>
                    <p className="text-sm text-navy/70">{item.conteudo}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
