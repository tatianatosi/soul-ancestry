import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ChecklistDocumentalCliente } from "@/lib/portal-dados-vivos";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { SecaoDocumental } from "@/components/portal/secao-documental";
import { Download, FileText, LockKeyhole, UploadCloud } from "lucide-react";
import { useState } from "react";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { AvisoFalhaConexao } from "@/components/portal/aviso-falha-conexao";
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
      <PortalShell titulo="Cofre Digital" descricao="Documentos e registros da sua história familiar.">
        {vivo.isLoading ? (
          <PortalCarregando />
        ) : vivo.isError ? (
          <AvisoFalhaConexao
            mensagem="Instabilidade de conexão ao carregar seus documentos."
            aoTentar={vivo.refetch}
          />
        ) : (
          <div className="app-v11-secoes" data-aba-documentos>
            <ChecklistDocumental checklist={vivo.data?.checklist} />
            <>

            {/* 1. Solicitados — só o pedido real da equipe, com a instrução de envio integrada ao card. */}
            <section
              data-documentos-solicitados
              data-documentos-checklist
              className="app-v11-faixa"
            >
              <SecaoDocumental tipo="solicitados" titulo="Solicitados à Família">
              
              <div className="py-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-xl text-navy">Solicitados</h2>
                <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                   Quando precisarmos de você
                </span>
                </div>
              {(vivo.data?.checklist?.itens ?? []).some((i) => i.tom === "pendente") ? <ul className="mt-3 space-y-3">{(vivo.data?.checklist?.itens ?? []).filter((i) => i.tom === "pendente").map((i) => <li key={i.id} className="flex items-start justify-between gap-3 text-sm text-navy"><span>{i.titulo}</span><span className="app-chip" data-tom="pendente">Aguardando</span></li>)}</ul> : solicitado ? (
                <div className="mt-3 rounded-lg border border-gold/35 bg-gold/10 px-4 py-3 text-sm text-navy">{solicitado}</div>
              ) : (
                <p className="app-estado-editorial mt-3">
                   A lista de documentos será apresentada quando for compartilhada com você.
                </p>
              )}
              <p className="mt-3 text-xs text-navy/50">Se precisarmos de algo, o pedido e a orientação para enviar aparecerão aqui.</p>
              </div>
            
              </SecaoDocumental>
</section>

            {/* 2. Recebidos — enviar nunca comunica validação automática. */}
            <section data-documentos-recebidos data-documentos-enviados className="app-v11-faixa">
              <SecaoDocumental tipo="recebidos" titulo="Em conferência">
              
              <div className="py-1">
              <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-serif text-xl text-navy">Em conferência</h2><span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">Aguardam conferência</span></div>
              <p className="mt-1 text-sm text-navy/60">Os documentos que você nos enviar ficam aqui enquanto a equipe os confere.</p>
              {enviados.length === 0 ? (
                <p className="app-estado-editorial mt-3">
                  Quando você compartilhar um documento, poderá acompanhá-lo aqui.
                </p>
              ) : (
                <p className="mt-3 text-sm text-navy/70">{enviados.length} {enviados.length === 1 ? "documento recebido" : "documentos recebidos"} para conferência.</p>
              )}
              </div>
            
              </SecaoDocumental>
</section>

            <section data-documentos-conferencia className="app-v11-faixa"><SecaoDocumental tipo="conferencia" titulo="Em validação"><p className="mt-3 text-sm text-navy/70">{(vivo.data?.checklist?.itens ?? []).filter((i) => i.tom === "analise").map((i) => i.titulo).join(" · ") || "Nenhum documento em validação no momento. Novidades aparecerão quando a equipe compartilhar a revisão."}</p></SecaoDocumental></section>
            {/* 3. Liberados — somente publicações reais. */}
            <section data-documentos-liberados data-documentos-preparado className="app-v11-faixa">
              <SecaoDocumental tipo="liberados" titulo="Entregas Liberadas">
              
              <div className="py-1">
              <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-serif text-xl text-navy">Entregas Liberadas</h2><span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/65">Abertos para você</span></div>
              {liberados.length === 0 ? (
                <p className="app-estado-editorial mt-3">
                  {COPY_TELAS.documentos.vazio}
                </p>
              ) : (
                <>
                  <p className="mt-3 text-sm text-navy/70">{liberados.length} {liberados.length === 1 ? "documento disponível" : "documentos disponíveis"} para você consultar.</p>
                  <ul className="mt-3 space-y-2" data-documentos-liberados-lista>
                    {liberados.map((d) => (
                      <li key={`lib-${d.id}`} className="app-documento-registro grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
                        <div className="min-w-0">
                          <p className="flex items-start gap-2 font-medium text-navy"><FileText className="h-5 w-5 shrink-0" aria-hidden="true" /><span className="min-w-0 break-words">{textoParaCliente(d.titulo) || "Não registrado"}</span></p>
                          {d.liberado_em ? <p className="text-xs text-navy/50">liberado em {new Date(d.liberado_em).toLocaleDateString("pt-BR")}</p> : null}
                        </div>
                        <span className="app-chip shrink-0" data-tom="ok">Liberado</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              </div>
              </SecaoDocumental>
            </section>
            </>
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
    <PortalShell titulo="Cofre Digital" descricao="Documentos e registros da sua história familiar.">
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
              26/10/2026 (Lovable, mockup17) — §7 do De-Para separa quatro
              estados que nunca podem se misturar. Cada seção lê a fonte
              exata do seu estado — nada de somar duas listas para forjar
              contagem. A caixa "Entregas → atalho para Legado" (material
              editorial sem fonte própria aqui, ver histórico em
              portal-dados-vivos.ts/BLOQUEIOS_CA_PORTAL_02) saiu da tela:
              em nenhum lugar substituída, era um placeholder.

              Solicitados  → solicitacoesAbertas (portal_document_requests) /
                             proximaAcao com destino /portal/documentos
              Recebidos    → envios (documents.origem === 'cliente')
              Conferência  → checklist.itens com tom "analise"
              Liberados    → entregas (documents.liberado_cliente === true)
            */
            const liberados_lista = noCaso(data?.entregas);
            const recebidos = noCaso(data?.envios);
            const proximaAcao = vivo.data?.proximaAcao ?? null;
            const solicitado = proximaAcao?.destino === "/portal/documentos" ? proximaAcao.acao : null;
            const solicitacoesAbertas = vivo.data?.solicitacoes ?? [];
            return (
        <div className="app-v11-secoes" data-aba-documentos-vivo>
          <ChecklistDocumental checklist={vivo.data?.checklist} />
          <>

          {/* 1. Solicitados — o que a equipe pediu, com a instrução de envio integrada ao card. */}
          <section data-documentos-solicitados className="app-v11-faixa">
              <SecaoDocumental tipo="solicitados" titulo="Solicitados à Família">
            
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
              <p className="app-estado-editorial mt-3">
                 A lista de documentos será apresentada quando for compartilhada com você.
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
              <SecaoDocumental tipo="recebidos" titulo="Em conferência">
            
            <div className="py-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-serif text-xl text-navy">Em conferência</h2>
              <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                Aguardam conferência
              </span>
            </div>
            <p className="mt-1 text-sm text-navy/60">
              Os documentos que você nos enviar ficam aqui enquanto a equipe os confere.
            </p>
            {recebidos.length === 0 ? (
              <p className="app-estado-editorial mt-3">
                 Quando você compartilhar um documento, poderá acompanhá-lo aqui.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {recebidos.map((d) => (
                  <li
                    key={`rec-${d.id}`}
                    className="app-documento-registro grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4"
                  >
                    <div className="min-w-0">
                      <p className="flex items-start gap-2 font-medium text-navy"><FileText className="h-5 w-5 shrink-0" aria-hidden="true" />{textoParaCliente(d.titulo)}</p>
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

            <section data-documentos-conferencia className="app-v11-faixa"><SecaoDocumental tipo="conferencia" titulo="Em validação"><p className="mt-3 text-sm text-navy/70">{(vivo.data?.checklist?.itens ?? []).filter((i) => i.tom === "analise").map((i) => i.titulo).join(" · ") || "Nenhum documento em validação no momento. Novidades aparecerão quando a equipe compartilhar a revisão."}</p></SecaoDocumental></section>
          {/* 3. Liberados — conferidos e abertos para a família. */}
          <section data-documentos-liberados className="app-v11-faixa">
              <SecaoDocumental tipo="liberados" titulo="Entregas Liberadas">
            
            <div className="py-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-serif text-xl text-navy">Entregas Liberadas</h2>
              <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                Abertos para você
              </span>
            </div>
            {liberados_lista.length === 0 ? (
              <p className="app-estado-editorial mt-3">
                {COPY_TELAS.documentos.vazio}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {liberados_lista.map((d) => (
                  <li
                    key={d.id}
                    className="app-documento-registro grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4"
                  >
                    <div className="min-w-0">
                      <p className="flex items-start gap-2 font-medium text-navy"><FileText className="h-5 w-5 shrink-0" aria-hidden="true" />{textoParaCliente(d.titulo)}</p>
                      <p className="text-xs text-navy/50">{textoParaCliente(d.caso)}</p>
                      {d.liberadoEm ? <p className="mt-1 text-xs text-navy/70">Liberado em {new Date(d.liberadoEm).toLocaleDateString("pt-BR")}</p> : null}
                    </div>
                    <Button variant="default"
                      onClick={() => abrir(d.id)}
                      className="inline-flex min-h-11 shrink-0 items-center gap-2 bg-navy px-3 py-2 text-sm text-primary-foreground"
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

          </>
        </div>
          );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}

/**
 * Pedidos documentais reais da equipe, pela mesma fonte sanitizada no App
 * e na prévia. Ausência de pedidos não é conclusão nem lista do mockup.
 */
function ChecklistDocumental({ checklist }: { checklist?: ChecklistDocumentalCliente | null }) {
  const legenda: Array<{ tom: "ok" | "analise" | "pendente"; rotulo: string }> = [
    { tom: "ok", rotulo: "Liberado" },
    { tom: "analise", rotulo: "Em análise" },
    { tom: "pendente", rotulo: "Aguardando" },
  ];
  const itens = checklist?.itens ?? [];
  const comItens = itens.length > 0;
  return (
    <section className="app-folha" aria-label="Checklist consolidado" data-documentos-checklist-caso>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
        <h2 className="min-w-0 font-serif text-xl text-navy">Checklist consolidado</h2>
        {comItens ? (
          <span className="app-chip" data-tom="ok" data-checklist-contador>
            {checklist?.concluidos ?? 0} de {checklist?.total ?? 0} {checklist?.total === 1 ? "concluído" : "concluídos"}
          </span>
        ) : (
          <span className="app-chip" data-tom="preparo">Em preparação</span>
        )}
      </div>
      {comItens ? (
        <ul className="mt-3 divide-y divide-navy/10" aria-label="Documentos pedidos à sua família" data-checklist-itens>
          {itens.map((i) => (
            <li key={i.id} className="flex items-start justify-between gap-3 py-2.5" data-checklist-item data-tom={i.tom}>
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy">{i.titulo}</p>
                {i.prazo ? (
                  <p className="text-xs text-navy/60">Até {new Date(`${i.prazo}T12:00:00`).toLocaleDateString("pt-BR")}</p>
                ) : null}
              </div>
              <span className="app-chip shrink-0" data-tom={i.tom}>{i.tom === "ok" ? "Liberado" : i.tom === "analise" ? "Em análise" : "Aguardando"}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-navy/70">
          A lista de documentos de cada pessoa da família, com o cartório ou arquivo de origem, aparece aqui assim que a equipe a compartilhar com você.
        </p>
      )}
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Como cada documento será sinalizado">
        {legenda.map((l) => (
          <li key={l.tom}><span className="app-chip" data-tom={l.tom}>{l.rotulo}</span></li>
        ))}
      </ul>
    </section>
  );
}
