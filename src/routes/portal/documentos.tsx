import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import { useState } from "react";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalVazio, PortalCarregando } from "@/components/portal/portal-shell";
import { baixarEntrega, minhasEntregas } from "@/lib/portal-cliente.functions";

export const Route = createFileRoute("/portal/documentos")({
  head: () => ({
    meta: [
      { title: "Documentos — Portal Clube Ancestral" },
      { name: "description", content: "Entregas liberadas pela equipe e situação dos documentos que você enviou." },
      { property: "og:title", content: "Documentos — Portal Clube Ancestral" },
      { property: "og:description", content: "Entregas liberadas e seus envios." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DocumentosPage,
});

function DocumentosPage() {
  const carregar = useServerFn(minhasEntregas);
  const baixar = useServerFn(baixarEntrega);
  const [erro, setErro] = useState<string | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["portal-entregas"], queryFn: () => carregar({}) });

  async function abrir(id: string) {
    setErro(null);
    try {
      const r = await baixar({ data: { documentoId: id } });
      window.open(r.url, "_blank", "noopener");
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <PortalShell titulo={COPY_TELAS.documentos.titulo} descricao={COPY_TELAS.documentos.descricao}>
      {erro ? (
        <p className="mb-4 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          {erro}
        </p>
      ) : null}

      {isLoading ? (
        <PortalCarregando />
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-xl">Preparado para você</h2>
            {!data || data.entregas.length === 0 ? (
              <div className="mt-3">
                <PortalVazio mensagem={COPY_TELAS.documentos.vazio} />
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.entregas.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy/10 bg-white p-4"
                  >
                    <div>
                      <p className="font-medium">{d.titulo}</p>
                      <p className="text-xs text-navy/50">{d.caso}</p>
                    </div>
                    <button
                      onClick={() => abrir(d.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-navy/20 px-3 py-2 text-sm"
                    >
                      <Download className="h-4 w-4" /> Baixar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-serif text-xl">O que você compartilhou</h2>
            {!data || data.envios.length === 0 ? (
              <div className="mt-3">
                <PortalVazio mensagem="Você ainda não compartilhou documentos conosco." />
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.envios.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy/10 bg-white p-4"
                  >
                    <div>
                      <p className="font-medium">{d.titulo}</p>
                      <p className="text-xs text-navy/50">
                        {d.caso} · enviado em {new Date(d.enviadoEm).toLocaleDateString("pt-BR")}
                      </p>
                      {d.motivo ? <p className="mt-1 text-sm text-navy/70">{d.motivo}</p> : null}
                    </div>
                    <span className="rounded-full border border-navy/15 bg-cream px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
                      {d.statusRotulo}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </PortalShell>
  );
}
