import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import { useState } from "react";

import { COPY_TELAS } from "@/lib/portal-copy";
import { CASO_DEMO_CODIGO } from "@/lib/portal-demo-sophia";
import { PortalShell, PortalVazio, PortalCarregando } from "@/components/portal/portal-shell";
import { usePreviaPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { baixarEntrega, minhasEntregas } from "@/lib/portal-cliente.functions";
import { mensagemDeFalha, rotuloEstadoVivo, textoParaCliente } from "@/lib/portal-linguagem-viva";

function ChipMeta({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">{rotulo}</p>
      <p className="mt-0.5 text-sm text-navy">{valor}</p>
    </div>
  );
}

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
    const casoCodigo = previa.identidade?.codigo ?? CASO_DEMO_CODIGO;
    const proxima = vivo.data?.proximaAcao?.acao ?? null;
    return (
      <PortalShell titulo={COPY_TELAS.documentos.titulo} descricao={COPY_TELAS.documentos.descricao}>
        {vivo.isLoading ? (
          <PortalCarregando />
        ) : (
          <div className="space-y-6" data-aba-documentos>
            <div
              data-documentos-meta
              className="flex flex-wrap gap-2 rounded-xl border border-border bg-card px-4 py-3"
            >
              <ChipMeta rotulo="Caso" valor={casoCodigo} />
              <ChipMeta
                rotulo="Checklist"
                valor={docs.length === 0 ? "Aguardando pedidos" : `${docs.length} item(ns)`}
              />
              <ChipMeta rotulo="Liberados" valor={String(liberados.length)} />
              <ChipMeta rotulo="Enviados" valor={String(enviados.length)} />
            </div>
            <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-navy/65">
              Envio de arquivo acontece quando a equipe solicita — sem inventar upload nem status de certidão nesta tela.
            </p>

            {/* Checklist só com itens reais — nunca inventar estado de certidão. */}
            <section
              data-documentos-checklist
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-base font-semibold text-navy">Checklist do caso</h2>
                <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                  Só publicações reais
                </span>
              </div>
              <p className="mt-1 text-sm text-navy/60">
                Situação a partir do que a equipe pediu ou liberou. Arquivos e status só aparecem com
                publicação real — sem inventar certidão.
              </p>
              {docs.length === 0 ? (
                <div className="mt-4 space-y-3">
                  <p className="rounded-xl border border-dashed border-navy/20 bg-cream/60 px-4 py-5 text-center text-sm text-navy/65">
                    Nenhum documento pedido ou liberado neste momento.
                  </p>
                  {proxima ? (
                    <div className="rounded-xl border border-gold/35 bg-gold/10 px-4 py-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
                        Próxima ação publicada
                      </p>
                      <p className="mt-1 text-sm text-navy">{proxima}</p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <ul className="mt-4 space-y-2">
                  {liberados.map((d, i) => (
                    <li
                      key={d.id ?? `lib-${i}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5"
                    >
                      <span className="text-sm text-navy/85">Documento liberado</span>
                      <span className="rounded-full border border-navy/15 bg-cream/40 px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
                        Liberado para você
                      </span>
                    </li>
                  ))}
                  {enviados.map((d, i) => (
                    <li
                      key={d.id ?? `env-${i}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5"
                    >
                      <span className="text-sm text-navy/85">Envio seu</span>
                      <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
                        Compartilhado
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section data-documentos-preparado className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-base font-semibold text-navy">Preparado para você</h2>
              {liberados.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-navy/20 bg-cream/60 px-4 py-4 text-center text-sm text-navy/60">
                  {COPY_TELAS.documentos.vazio}
                </p>
              ) : (
                <p className="mt-3 text-sm text-navy/70">
                  {liberados.length} documento(s) liberado(s) neste caso.
                </p>
              )}
            </section>

            <section data-documentos-enviados className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-base font-semibold text-navy">O que você compartilhou</h2>
              {enviados.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-navy/20 bg-cream/60 px-4 py-4 text-center text-sm text-navy/60">
                  Você ainda não compartilhou documentos conosco.
                </p>
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
          {() => {
            const liberados = data?.entregas?.length ?? 0;
            const enviados = data?.envios?.length ?? 0;
            const checklist = liberados + enviados;
            const casoCodigo =
              data?.entregas?.[0]?.caso ||
              data?.envios?.[0]?.caso ||
              "—";
            return (
        <div className="space-y-8" data-aba-documentos-vivo>
          <div
            data-documentos-meta
            className="flex flex-wrap gap-2 rounded-xl border border-border bg-card px-4 py-3"
          >
            <ChipMeta rotulo="Caso" valor={String(casoCodigo)} />
            <ChipMeta
              rotulo="Checklist"
              valor={checklist === 0 ? "Aguardando pedidos" : `${checklist} item(ns)`}
            />
            <ChipMeta rotulo="Liberados" valor={String(liberados)} />
            <ChipMeta rotulo="Enviados" valor={String(enviados)} />
          </div>
          <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-navy/65">
            Envio de arquivo acontece quando a equipe solicita — não inventamos upload nem status de certidão nesta tela.
          </p>
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-navy">Checklist do caso</h2>
            <p className="mt-1 text-sm text-navy/60">
              Situação a partir dos documentos já pedidos ou liberados — sem inventar itens.
            </p>
            {!data || (data.entregas.length === 0 && data.envios.length === 0) ? (
              <p className="mt-4 rounded-lg border border-dashed border-navy/20 bg-cream/50 px-3 py-4 text-center text-sm text-navy/60">
                Quando a equipe pedir ou liberar um documento, a situação aparece aqui.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {data.entregas.map((d) => (
                  <li
                    key={`ent-${d.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5"
                  >
                    <span className="text-sm text-navy/85">{textoParaCliente(d.titulo)}</span>
                    <span className="rounded-full border border-navy/15 bg-cream/40 px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
                      Liberado para você
                    </span>
                  </li>
                ))}
                {data.envios.map((d) => (
                  <li
                    key={`env-${d.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5"
                  >
                    <span className="text-sm text-navy/85">{textoParaCliente(d.titulo)}</span>
                    <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
                      {rotuloEstadoVivo(d.statusRotulo)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="text-base font-semibold">Preparado para você</h2>
            {!data || data.entregas.length === 0 ? (
              <div className="mt-3">
                <PortalVazio mensagem={COPY_TELAS.documentos.vazio} />
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.entregas.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4"
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
            <h2 className="text-base font-semibold">O que você compartilhou</h2>
            {!data || data.envios.length === 0 ? (
              <div className="mt-3">
                <PortalVazio mensagem="Você ainda não compartilhou documentos conosco." />
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.envios.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4"
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
          );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
