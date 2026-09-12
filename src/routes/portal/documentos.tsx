import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import { useState } from "react";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalVazio, PortalCarregando } from "@/components/portal/portal-shell";
import { usePreviaPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { baixarEntrega, minhasEntregas } from "@/lib/portal-cliente.functions";
import { mensagemDeFalha, rotuloEstadoVivo, textoParaCliente } from "@/lib/portal-linguagem-viva";

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
  component: PortalDocumentos,
});

export function PortalDocumentos() {
  const previa = usePreviaPortal();
  const vivo = usePortalVivo();
  const carregar = useServerFn(minhasEntregas);
  const baixar = useServerFn(baixarEntrega);
  const [erro, setErro] = useState<string | null>(null);
  const {
    data,
    isLoading,
    error: erroLeitura,
    refetch,
  } = useQuery({
    queryKey: ["portal-entregas"],
    queryFn: () => carregar({}),
    enabled: previa === null,
  });

  if (previa) {
    const docs = (vivo.data?.documentos ?? []).filter((d) => d.is_demo !== true);
    const liberados = docs.filter((d) => d.liberado_cliente);
    const enviados = docs.filter((d) => d.origem === "cliente");
    return (
      <PortalShell titulo={COPY_TELAS.documentos.titulo} descricao={COPY_TELAS.documentos.descricao}>
        {vivo.isLoading ? (
          <PortalCarregando />
        ) : (
          <div className="space-y-8">
            {/* Checklist visual do mockup — estados de acompanhamento, sem arquivo inventado. */}
            <section className="rounded-2xl border border-navy/10 bg-white/80 p-5 shadow-sm">
              <h2 className="font-serif text-xl text-navy">Checklist do caso</h2>
              <p className="mt-1 text-sm text-navy/60">
                Situação dos documentos pedidos neste acompanhamento. Arquivos só aparecem quando a equipe libera.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  { rotulo: "Certidão de nascimento — linha direta", estado: "Recebido", tom: "ok" as const },
                  { rotulo: "Certidão de casamento — linha direta", estado: "Em revisão", tom: "neutro" as const },
                  { rotulo: "Documento de identidade", estado: "Pendente com você", tom: "atencao" as const },
                  { rotulo: "Registro paroquial / batismo", estado: "Em conferência", tom: "neutro" as const },
                ].map((item) => (
                  <li
                    key={item.rotulo}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/10 bg-cream/40 px-3 py-2.5"
                  >
                    <span className="text-sm text-navy/85">{item.rotulo}</span>
                    <span
                      className={
                        item.tom === "ok"
                          ? "rounded-full border border-navy/15 bg-white px-2.5 py-0.5 text-[11px] font-medium text-navy/70"
                          : item.tom === "atencao"
                            ? "rounded-full border border-terracotta/30 bg-terracotta/10 px-2.5 py-0.5 text-[11px] font-medium text-terracotta"
                            : "rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-navy/70"
                      }
                    >
                      {item.estado}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-serif text-xl">Preparado para você</h2>
              {liberados.length === 0 ? (
                <div className="mt-3">
                  <PortalVazio mensagem={COPY_TELAS.documentos.vazio} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-navy/70">{liberados.length} documento(s) liberado(s) neste caso.</p>
              )}
            </section>
            <section>
              <h2 className="font-serif text-xl">O que você compartilhou</h2>
              {enviados.length === 0 ? (
                <div className="mt-3">
                  <PortalVazio mensagem="Você ainda não compartilhou documentos conosco." />
                </div>
              ) : (
                <p className="mt-3 text-sm text-navy/70">{enviados.length} envio(s) neste caso.</p>
              )}
            </section>
          </div>
        )}
      </PortalShell>
    );
  }

  async function abrir(id: string) {
    setErro(null);
    try {
      const r = await baixar({ data: { documentoId: id } });
      window.open(r.url, "_blank", "noopener");
    } catch (e) {
      // Falha nunca revela ID, tabela, política ou endpoint ao cliente.
      setErro(mensagemDeFalha(e));
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
        <EstadoDados
          erro={erroLeitura}
          dados={data ? [data] : null}
          aoTentarNovamente={() => void refetch()}
          recurso="os seus documentos"
        >
          {() => (
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
                      <p className="font-medium">{textoParaCliente(d.titulo)}</p>
                      <p className="text-xs text-navy/50">{textoParaCliente(d.caso)}</p>
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
                      <p className="font-medium">{textoParaCliente(d.titulo)}</p>
                      <p className="text-xs text-navy/50">
                        {textoParaCliente(d.caso)} · enviado em {new Date(d.enviadoEm).toLocaleDateString("pt-BR")}
                      </p>
                      {textoParaCliente(d.motivo) ? (
                        <p className="mt-1 text-sm text-navy/70">{textoParaCliente(d.motivo)}</p>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-navy/15 bg-cream px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
                      {rotuloEstadoVivo(d.statusRotulo)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
          )}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
