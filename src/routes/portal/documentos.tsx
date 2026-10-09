import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { SecaoDocumental } from "@/components/portal/secao-documental";
import { BlocoExemploVisual } from "@/components/portal/bloco-exemplo-visual";
import { Download } from "lucide-react";
import { useState } from "react";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { LinkPortal, usePreviaPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { EnviarDocumento } from "@/components/portal/enviar-documento";
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
    const proximaAcao = vivo.data?.proximaAcao ?? null;
    const solicitado = proximaAcao?.destino === "/portal/documentos" ? proximaAcao.acao : null;
    return (
      <PortalShell titulo={COPY_TELAS.documentos.titulo} descricao={COPY_TELAS.documentos.descricao}>
        {vivo.isLoading ? (
          <PortalCarregando />
        ) : (
          <div className="app-v11-secoes" data-aba-documentos>
            <p className="border-l-2 border-gold pl-4 text-sm leading-relaxed text-navy/75">Cada documento terá seu estado aqui assim que a equipe compartilhar a lista completa com você.</p>
            {docs.length === 0 && !solicitado ? <BlocoExemploVisual tipo="documentos" /> : null}
            {/* 1. Solicitados — só o pedido real da equipe, com a instrução de envio integrada ao card. */}
            <section
              data-documentos-solicitados
              data-documentos-checklist
              className="app-v11-faixa"
            >
              <SecaoDocumental tipo="solicitados" titulo="Solicitados">
              
              <div className="py-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-xl text-navy">Solicitados</h2>
                <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                   Quando precisarmos de você
                </span>
                </div>
              {solicitado ? (
                <div className="mt-3 rounded-lg border border-gold/35 bg-gold/10 px-4 py-3 text-sm text-navy">{solicitado}</div>
              ) : (
                <p className="app-v11-lacuna mt-3 text-navy/65">
                   Por enquanto, não precisamos de nenhum documento seu. A lista completa ainda não foi compartilhada.
                </p>
              )}
              <p className="mt-3 text-xs text-navy/50">Se precisarmos de algo, o pedido e a orientação para enviar aparecerão aqui.</p>
              </div>
            
              </SecaoDocumental>
</section>

            {/* 2. Recebidos — enviar nunca comunica validação automática. */}
            <section data-documentos-recebidos data-documentos-enviados className="app-v11-faixa">
              <SecaoDocumental tipo="recebidos" titulo="Recebidos">
              
              <div className="py-1">
              <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-serif text-xl text-navy">Recebidos</h2><span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">Aguardam conferência</span></div>
              <p className="mt-1 text-sm text-navy/60">Os documentos que você nos enviar ficam aqui enquanto a equipe os confere.</p>
              {enviados.length === 0 ? (
                <p className="app-v11-lacuna mt-3 text-navy/65">
                  Quando você compartilhar um documento, poderá acompanhá-lo aqui.
                </p>
              ) : (
                <p className="mt-3 text-sm text-navy/70">{enviados.length} {enviados.length === 1 ? "documento recebido" : "documentos recebidos"} para conferência.</p>
              )}
              </div>
            
              </SecaoDocumental>
</section>

            {/* 3. Liberados — somente publicações reais. */}
            <section data-documentos-liberados data-documentos-preparado className="app-v11-faixa">
              <SecaoDocumental tipo="liberados" titulo="Liberados">
              
              <div className="py-1">
              <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-serif text-xl text-navy">Liberados</h2><span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/65">Abertos para você</span></div>
              {liberados.length === 0 ? (
                <p className="app-v11-lacuna mt-3 text-navy/65">
                  {COPY_TELAS.documentos.vazio}
                </p>
              ) : (
                <p className="mt-3 text-sm text-navy/70">{liberados.length} {liberados.length === 1 ? "documento disponível" : "documentos disponíveis"} para você consultar.</p>
              )}
              </div>
            
              </SecaoDocumental>
</section>

            {/* 4. Entregas — atalho contextual; a lista editorial continua em Legado. */}
            <section data-documentos-entregas className="app-v11-faixa">
              <SecaoDocumental tipo="entregas" titulo="Entregas do Legado">
              
              <div className="py-1">
                <h2 className="font-serif text-xl text-navy">Entregas do Legado</h2>
                <p className="mt-2 text-sm text-navy/70">As histórias e os materiais preparados para a sua família ficam reunidos no Legado, quando estiverem disponíveis.</p>
                 <LinkPortal to="/portal/legado" className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-navy underline decoration-gold underline-offset-4 hover:text-terracotta">Conhecer o Legado</LinkPortal>
              </div>
            
              </SecaoDocumental>
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
            const proximaAcao = vivo.data?.proximaAcao ?? null;
            const solicitado = proximaAcao?.destino === "/portal/documentos" ? proximaAcao.acao : null;
            const solicitacoesAbertas = vivo.data?.solicitacoes ?? [];
            return (
        <div className="app-v11-secoes" data-aba-documentos-vivo>
          <p className="border-l-2 border-gold pl-4 text-sm leading-relaxed text-navy/75">Os pedidos pendentes ficam em Solicitados. A conferência acompanha cada envio em Recebidos; os materiais abertos para você ficam em Liberados.</p>
          {liberados_lista.length === 0 && recebidos.length === 0 && solicitacoesAbertas.length === 0 && !solicitado ? <BlocoExemploVisual tipo="documentos" /> : null}
          {/* 1. Solicitados — o que a equipe pediu, com a instrução de envio integrada ao card. */}
          <section data-documentos-solicitados className="app-v11-faixa">
              <SecaoDocumental tipo="solicitados" titulo="Solicitados">
            
            <div className="py-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-serif text-xl text-navy">Solicitados</h2>
              <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                 Quando precisarmos de você
              </span>
            </div>
            {solicitacoesAbertas.length > 0 ? <p className="mt-2 text-xs text-navy/60">{solicitacoesAbertas.length} {solicitacoesAbertas.length === 1 ? "pedido aberto" : "pedidos abertos"}</p> : null}
            {/*
              REVERIFICACAO-ADVERSARIAL-GIOVANNA (27/09/2026): Ficha Piloto
              #6 "Documento foco" / #28 "Pendência principal". Antes só a
              frase genérica do motor ("Há 1 documento para você enviar.");
              agora cada pedido aberto aparece pelo nome que a equipe deu
              (portal_document_requests, policy pdr_sel_portal), com envio
              ligado ao próprio pedido.
            */}
            {solicitacoesAbertas.length > 0 ? (
              <ul className="mt-3 space-y-2" data-documentos-solicitados-lista>
                {solicitacoesAbertas.map((s) => (
                  <li key={s.id} className="rounded-xl border border-gold/35 bg-gold/10 px-4 py-3">
                    <p className="text-sm font-medium text-navy">{s.titulo}</p>
                    {s.descricao ? <p className="mt-1 text-sm text-navy/70">{s.descricao}</p> : null}
                    {s.prazo ? (
                      <p className="mt-1 text-xs text-navy/55">
                        Até {s.prazo.split("-").reverse().join("/")}
                      </p>
                    ) : null}
                    {s.recusado ? (
                      <p className="mt-2 rounded-lg bg-cream px-3 py-2 text-xs text-navy/70">
                        Precisamos de um novo envio{s.motivoRecusa ? `: ${s.motivoRecusa}` : "."}
                      </p>
                    ) : null}
                    <div className="mt-2">
                      <EnviarDocumento casoId={casoAtivo} solicitacaoId={s.id} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : solicitado ? (
              <div className="mt-3 rounded-xl border border-gold/35 bg-gold/10 px-4 py-3">
                <p className="text-sm text-navy">{solicitado}</p>
              </div>
            ) : (
              <p className="app-v11-lacuna mt-3 text-navy/65">
                 Por enquanto, não precisamos de nenhum documento seu. A lista completa ainda não foi compartilhada.
              </p>
            )}
            <div className="mt-4">
              <EnviarDocumento casoId={casoAtivo} />
            </div>
            </div>
          
              </SecaoDocumental>
</section>

          {/* 2. Recebidos — chegou, mas ainda não foi conferido. */}
          <section data-documentos-recebidos className="app-v11-faixa">
              <SecaoDocumental tipo="recebidos" titulo="Recebidos">
            
            <div className="py-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-serif text-xl text-navy">Recebidos</h2>
              <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                Aguardam conferência
              </span>
            </div>
            <p className="mt-1 text-sm text-navy/60">
              Os documentos que você nos enviar ficam aqui enquanto a equipe os confere.
            </p>
            {recebidos.length === 0 ? (
              <p className="app-v11-lacuna mt-3 text-navy/65">
                 Quando você compartilhar um documento, poderá acompanhá-lo aqui.
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
          
              </SecaoDocumental>
</section>

          {/* 3. Liberados — conferidos e abertos para a família. */}
          <section data-documentos-liberados className="app-v11-faixa">
              <SecaoDocumental tipo="liberados" titulo="Liberados">
            
            <div className="py-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-serif text-xl text-navy">Liberados</h2>
              <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                Abertos para você
              </span>
            </div>
            {liberados_lista.length === 0 ? (
              <p className="app-v11-lacuna mt-3 text-navy/65">
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
                    <Button variant="outline"
                      onClick={() => abrir(d.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy"
                    >
                      <Download className="h-4 w-4" /> Baixar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            </div>
          
              </SecaoDocumental>
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
          <section data-documentos-entregas className="app-v11-faixa">
              <SecaoDocumental tipo="entregas" titulo="Entregas do Legado">
            
            <div className="py-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
               <h2 className="font-serif text-xl text-navy">Entregas do Legado</h2>
              <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                Cadernos, relatórios e narrativas
              </span>
            </div>
            <p className="mt-3 text-sm text-navy/70">
               As histórias e os materiais preparados para a sua família ficam reunidos no Legado, quando estiverem disponíveis.
            </p>
            <LinkPortal
              to="/portal/legado"
               className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-navy underline decoration-gold underline-offset-4 hover:text-terracotta"
            >
               Conhecer o Legado
            </LinkPortal>
            </div>
          
              </SecaoDocumental>
</section>
        </div>
          );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
