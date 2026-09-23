import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import { useState } from "react";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { LinkPortal, usePreviaPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { EnviarDocumento } from "@/components/portal/enviar-documento";
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
    const casoCodigo = previa.identidade?.codigo ?? "—";
    const proximaAcao = vivo.data?.proximaAcao ?? null;
    const solicitado = proximaAcao?.destino === "/portal/documentos" ? proximaAcao.acao : null;
    return (
      <PortalShell titulo={COPY_TELAS.documentos.titulo} descricao={COPY_TELAS.documentos.descricao}>
        {vivo.isLoading ? (
          <PortalCarregando />
        ) : (
          <div className="space-y-5" data-aba-documentos>
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

            {/* 1. Solicitados — só o pedido real da equipe. */}
            <section
              data-documentos-solicitados
              data-documentos-checklist
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="h-1 bg-gold" aria-hidden="true" />
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-xl text-navy">Solicitados</h2>
                <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                  Ação da família
                </span>
                </div>
              {solicitado ? (
                <div className="mt-3 rounded-lg border border-gold/35 bg-gold/10 px-4 py-3 text-sm text-navy">{solicitado}</div>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-navy/20 bg-cream/60 px-4 py-5 text-center text-sm text-navy/65">
                  Nenhum documento solicitado no momento.
                </p>
              )}
              </div>
            </section>

            {/* 2. Recebidos — enviar nunca comunica validação automática. */}
            <section data-documentos-recebidos data-documentos-enviados className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="h-1 bg-navy" aria-hidden="true" />
              <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-serif text-xl text-navy">Recebidos</h2><span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">Aguardam conferência</span></div>
              <p className="mt-1 text-sm text-navy/60">Receber não é validar: cada envio passa pela equipe.</p>
              {enviados.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-navy/20 bg-cream/60 px-4 py-4 text-center text-sm text-navy/60">
                  Você ainda não compartilhou documentos conosco.
                </p>
              ) : (
                <p className="mt-3 text-sm text-navy/70">{enviados.length} envio(s) recebido(s) e aguardando conferência.</p>
              )}
              </div>
            </section>

            {/* 3. Liberados — somente publicações reais. */}
            <section data-documentos-liberados data-documentos-preparado className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="h-1 bg-gold" aria-hidden="true" />
              <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-serif text-xl text-navy">Liberados</h2><span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/65">Abertos para você</span></div>
              {liberados.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-navy/20 bg-cream/60 px-4 py-4 text-center text-sm text-navy/60">
                  {COPY_TELAS.documentos.vazio}
                </p>
              ) : (
                <p className="mt-3 text-sm text-navy/70">{liberados.length} documento(s) revisado(s) e liberado(s) neste caso.</p>
              )}
              </div>
            </section>

            {/* 4. Entregas — atalho contextual; a lista editorial continua em Legado. */}
            <section data-documentos-entregas className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="h-1 bg-navy" aria-hidden="true" />
              <div className="p-5">
                <h2 className="font-serif text-xl text-navy">Entregas</h2>
                <p className="mt-2 text-sm text-navy/70">Os materiais publicados pela equipe ficam organizados na aba Legado.</p>
                <LinkPortal to="/portal/legado" className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-navy/20 px-3 py-2 text-sm font-medium text-navy hover:border-gold">Ver material publicado no Legado</LinkPortal>
              </div>
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
          superficie="app"
          erro={erroLeitura}
          dados={data ? [data] : null}
          aoTentarNovamente={() => void refetch()}
          recurso="os seus documentos"
        >
          {() => {
            /* Caso ativo único: todas as abas leem o mesmo caso da URL. */
            const casoAtivo = vivo.data?.casoAtivoId ?? null;
            const noCaso = <T extends { caseId?: string | null }>(l: T[] | undefined) =>
              (l ?? []).filter((d) => !casoAtivo || !d.caseId || d.caseId === casoAtivo);
            /*
              §7 do De-Para separa quatro estados que nunca podem se
              misturar. Cada seção lê a fonte exata do seu estado — nada de
              somar duas listas para forjar contagem.

              Solicitados  → proximaAcao com destino /portal/documentos
              Recebidos    → envios (documents.origem === 'cliente')
              Liberados    → entregas (documents.liberado_cliente === true)
              Entregas     → material editorial (cadernos/relatórios/narrativas)
                             — só chega ao portal via portal_projecoes,
                             consumida pela aba Legado. Como a rota Documentos
                             não tem fonte própria para essa lista, a caixa
                             vira atalho para Legado até haver uma fonte
                             sanitizada por caso. Bloqueio catalogado em
                             portal-dados-vivos.ts (BLOQUEIOS_CA_PORTAL_02).
            */
            const liberados_lista = noCaso(data?.entregas);
            const recebidos = noCaso(data?.envios);
            const liberados = liberados_lista.length;
            const enviados = recebidos.length;
            const checklist = liberados + enviados;
            const casoCodigo = liberados_lista[0]?.caso || recebidos[0]?.caso || "—";
            const proximaAcao = vivo.data?.proximaAcao ?? null;
            const solicitado = proximaAcao?.destino === "/portal/documentos" ? proximaAcao.acao : null;
            return (
        <div className="space-y-5" data-aba-documentos-vivo>
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

          {/* 1. Solicitados — o que a equipe pediu. */}
          <section data-documentos-solicitados className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="h-1 bg-gold" aria-hidden="true" />
            <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-serif text-xl text-navy">Solicitados</h2>
              <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                Pedido da equipe
              </span>
            </div>
            {solicitado ? (
              <div className="mt-3 rounded-xl border border-gold/35 bg-gold/10 px-4 py-3">
                <p className="text-sm text-navy">{solicitado}</p>
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-navy/20 bg-cream/60 px-4 py-4 text-center text-sm text-navy/60">
                Nenhum documento solicitado no momento.
              </p>
            )}
            <div className="mt-4">
              <EnviarDocumento casoId={casoAtivo} />
            </div>
            </div>
          </section>

          {/* 2. Recebidos — chegou, mas ainda não foi conferido. */}
          <section data-documentos-recebidos className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="h-1 bg-navy" aria-hidden="true" />
            <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-serif text-xl text-navy">Recebidos</h2>
              <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                Aguardam conferência
              </span>
            </div>
            <p className="mt-1 text-sm text-navy/60">
              Receber não é conferir: cada envio passa pela equipe antes de virar parte do caso.
            </p>
            {recebidos.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-navy/20 bg-cream/60 px-4 py-4 text-center text-sm text-navy/60">
                Você ainda não compartilhou documentos conosco.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {recebidos.map((d) => (
                  <li
                    key={`rec-${d.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-navy">{textoParaCliente(d.titulo)}</p>
                      <p className="text-xs text-navy/50">
                        enviado em {new Date(d.enviadoEm).toLocaleDateString("pt-BR")}
                      </p>
                      {textoParaCliente(d.motivo) ? (
                        <p className="mt-1 text-sm text-navy/70">{textoParaCliente(d.motivo)}</p>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
                      {rotuloEstadoVivo(d.statusRotulo)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            </div>
          </section>

          {/* 3. Liberados — conferidos e abertos para a família. */}
          <section data-documentos-liberados className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="h-1 bg-gold" aria-hidden="true" />
            <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-serif text-xl text-navy">Liberados</h2>
              <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                Abertos para você
              </span>
            </div>
            {liberados_lista.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-navy/20 bg-cream/60 px-4 py-4 text-center text-sm text-navy/60">
                {COPY_TELAS.documentos.vazio}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {liberados_lista.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-navy">{textoParaCliente(d.titulo)}</p>
                      <p className="text-xs text-navy/50">{textoParaCliente(d.caso)}</p>
                    </div>
                    <button
                      onClick={() => abrir(d.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy"
                    >
                      <Download className="h-4 w-4" /> Baixar
                    </button>
                  </li>
                ))}
              </ul>
            )}
            </div>
          </section>

          {/*
            4. Entregas — material editorial publicado.

            §7 do De-Para: "Entregas" contém somente material final para
            consulta/download. Hoje esse material vive em portal_projecoes
            (fonte SANITIZADA que a aba Legado consome via
            legadoSanitizado). A aba Documentos NÃO tem fonte por caso
            para essa lista — a alternativa seria duplicar Legado, o que
            criaria duas fontes de verdade. A caixa vira atalho canônico
            para Legado. Bloqueio catalogado em portal-dados-vivos.ts.
          */}
          <section data-documentos-entregas className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="h-1 bg-navy" aria-hidden="true" />
            <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-serif text-xl text-navy">Entregas</h2>
              <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                Cadernos, relatórios e narrativas
              </span>
            </div>
            <p className="mt-3 text-sm text-navy/70">
              As entregas editoriais publicadas pela equipe ficam organizadas
              por coleção na aba Legado.
            </p>
            <LinkPortal
              to="/portal/legado"
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-navy/20 px-3 py-2 text-sm font-medium text-navy hover:border-gold"
            >
              Ver material publicado no Legado
            </LinkPortal>
            </div>
          </section>
        </div>
          );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
