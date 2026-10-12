import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { radarSeisDimensoes } from "@/lib/radar-seis-eixos";
import { OrigemGeografica } from "@/components/portal/origem-geografica";
import { RadarSeisEixos } from "@/components/portal/radar-seis-eixos";
import { usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { jornadaSanitizada } from "@/lib/portal-dados-vivos";

export const Route = createFileRoute("/portal/radar")({
  head: () => ({
    meta: [
      { title: "Radar Ancestral — Portal Clube Ancestral" },
      { name: "description", content: "Seu equilíbrio nas 6 dimensões da jornada." },
      { property: "og:title", content: "Radar Ancestral — Portal Clube Ancestral" },
      { property: "og:description", content: "As 6 dimensões da sua jornada genealógica." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalRadar,
});

/*
 * 07/09/2026 — achado direto da proprietária: esta tela nunca teve as 6
 * dimensões do mockup aprovado (Documentação, Origem, Conexões Familiares,
 * Elegibilidade, Memória, Legado) — era um radar diferente, de 4 eixos sobre
 * "próximos passos", com quatro cartões de texto e nenhum gráfico. Ver
 * src/lib/radar-seis-eixos.ts para a fonte de cada dimensão.
 *
 * Reconciliação (03/10/2026) — autorização literal: "radar correto de 06
 * eixos no app e 04 eixos no desk reconciliação autorizada mostrando as
 * percentagens e calculos de acordo com premissas já aprovadas
 * anteriormente no app e no portal app do cliente".
 *
 * Este comentário afirmava, até hoje, que "Elegibilidade continua sem
 * percentual (decisão institucional)" — e o código fazia o contrário desde
 * 07/09, por decisão da Proprietária: o 4º eixo é a média dos outros 5.
 * Dois lugares do código discordavam sobre o mesmo eixo; isso era dívida,
 * não decisão. Fica valendo o código, e o texto passa a dizer o mesmo.
 *
 * A separação de superfícies, confirmada hoje e já implementada:
 * - App Cliente (esta tela): 6 dimensões (`radar-seis-eixos.ts`);
 * - Desk, Radar & Matrizes (`/qualidade`): 4 eixos da jornada
 *   (`radar-eixos.ts`). Sem eixo extra em nenhuma das duas.
 *
 * O percentual é PROGRESSO PUBLICADO — nunca chance, prazo, parecer
 * jurídico ou promessa de elegibilidade. Por isso o 4º eixo se chama
 * "Progresso Geral" desde 18/09: o rótulo "Elegibilidade" induzia a leitura
 * errada, e o cálculo nunca foi juízo legal.
 */
export function PortalRadar() {
  const { visibilidade, carregando } = useVisibilidade("radar");
  const { data, isLoading, isError, error, refetch } = usePortalVivo();

  return (
    <PortalShell titulo={COPY_TELAS.radar.titulo} descricao={COPY_TELAS.radar.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <EstadoDados
          superficie="app"
          carregando={isLoading}
          erro={isError ? (error ?? true) : null}
          dados={data ? [data] : null}
          aoTentarNovamente={refetch}
          recurso="o seu radar ancestral"
        >
          {([vivo]) => {
            const dimensoes = radarSeisDimensoes({
              projecoes: vivo.projecoes,
              documentos: vivo.documentos,
              // 05/10/2026 — PREMISSA da Proprietária: denominador real de
              // "Conexões Familiares", nunca o teto ilustrativo de 31.
              pessoasMapeadas: vivo.pessoasMapeadas ?? 0,
            });
             const passoPublicado = jornadaSanitizada(vivo.projecoes, new Date(), vivo.proximaAcao).linha.find((item) => item.tipo === "proxima_acao");
            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <div className="space-y-5" data-aba-radar>
                  <RadarSeisEixos dimensoes={dimensoes} />
                  <section aria-label="Checklist documental" className="border-l-2 border-terracotta/40 py-1 pl-4">
                    <h2 className="font-serif text-xl text-navy">Checklist documental</h2>
                    <p className="mt-2 text-sm leading-relaxed text-navy/75">O checklist completo do caso ainda não foi compartilhado. Sem essa lista, não há uma base documental completa para comparar.</p>
                  </section>

                  {/* Próximo passo real (mesma fonte de Home/Jornada) — nunca um passo por eixo inventado. */}
                  <section className="border-l-2 border-gold/60 py-1 pl-4">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">
                      Um passo de cada vez
                    </p>
                    <p className="mt-1 text-sm text-navy/80">
                       {passoPublicado?.conteudo ?? "Ainda não há um próximo passo liberado para a família."}
                    </p>
                  </section>

                  <section aria-label="Dimensões do Radar">
                    <h2 className="mb-3 font-serif text-xl text-navy">A história em seis dimensões</h2>
                     <ul className="divide-y divide-border">
                      {dimensoes.map((d, i) => {
                        // "Em preparação" só quando não há percentual nem registro publicado.
                        const temPercentual = d.percentual !== null;
                        const temRegistro = !["Nenhum ainda", "Em preparação", "Lacuna", ""].includes(d.rotuloNumero.trim());
                        const vazio = !temPercentual && !temRegistro;
                        const contagemConexoes =
                          d.id === "conexoes" && temPercentual ? d.legenda.match(/^(\d+) de (\d+)/) : null;
                        return (
                        <li key={d.id} className="min-w-0 py-4">
                          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-navy/60">
                                Parte {i + 1} de 6
                              </p>
                              <h3 className="mt-1 font-serif text-xl leading-tight text-navy">{d.titulo}</h3>
                            </div>
                            <span className="block max-w-32 break-words text-right font-serif text-xl leading-tight text-navy">
                              {vazio ? "Em pesquisa" : temPercentual ? `${d.percentual}%` : d.rotuloNumero}
                              {temPercentual && d.id !== "conexoes" && !d.rotuloNumero.includes("%") && temRegistro ? <span className="ml-1 font-sans text-xs text-navy/70">· {d.rotuloNumero}</span> : null}
                              {contagemConexoes ? (
                                <span className="mt-1 block font-sans text-xs text-navy/70">
                                  · {contagemConexoes[1]} de {contagemConexoes[2]} pessoas
                                </span>
                              ) : null}
                            </span>
                          </div>
                          {temPercentual ? <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy/10" aria-hidden="true">
                            <div
                              className="h-full rounded-full bg-gold"
                              style={{ width: `${temPercentual ? (d.percentual ?? 0) : 0}%` }}
                            />
                          </div> : null}
                          {d.legenda ? <p className="mt-2 text-sm leading-relaxed text-navy/75">{vazio ? d.legenda.replace(/^Lacuna:\s*/i, "").replace(/^./, (c) => c.toUpperCase()) : d.legenda}</p> : null}
                        </li>
                        );
                      })}
                    </ul>
                  </section>
                  <OrigemGeografica />
                </div>
              </BlocoVisibilidade>
            );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
