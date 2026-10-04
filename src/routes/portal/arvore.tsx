import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { arvoreSanitizada } from "@/lib/portal-dados-vivos";
import {
  painelArvoreGeracoes,
  GERACOES_ARVORE_EXIBICAO,
  PESSOAS_POSSIVEIS_CINCO_GERACOES,
  type GeracaoArvore,
} from "@/lib/portal-arvore-geracoes";
import { pessoasDaArvore, type PessoaNaArvore } from "@/lib/arvore-publicacao";
import { LinkPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { cn } from "@/lib/utils";
import { Search, Clock } from "lucide-react";

/**
 * Conector real entre gerações (correção 2026-09-12): um leque de linhas da
 * geração anterior até cada slot desta geração — mostra a estrutura real de
 * descendência entre as duas faixas, sem inventar QUAL slot é filho de qual
 * (essa relação pessoa-a-pessoa não existe em dado publicado no portal).
 */
function ConectorGeracao({ slots }: { slots: number }) {
  const pontos = Array.from({ length: slots }, (_, i) => ((i + 0.5) / slots) * 100);
  return (
    <svg viewBox="0 0 100 20" className="mx-auto block h-4 w-full max-w-xs" preserveAspectRatio="none" aria-hidden="true">
      {pontos.map((x, i) => (
        <path key={i} d={`M 50 0 L ${x} 20`} stroke="var(--gold)" strokeOpacity={0.4} strokeWidth={1} fill="none" />
      ))}
    </svg>
  );
}

function NoArvore({
  ehG1,
  estado,
  titulo,
}: {
  ehG1: boolean;
  estado: "em_pesquisa" | "a_publicar";
  titulo?: string;
}) {
  const rotuloEstado = estado === "em_pesquisa" ? "Em pesquisa" : "A publicar";
  return (
    <div
      className={cn(
        "flex h-9 w-9 flex-col items-center justify-center gap-0.5 rounded-md border text-center shadow-sm sm:h-14 sm:w-14 sm:rounded-lg",
        ehG1 ? "border-2 border-navy bg-navy font-semibold text-cream shadow-sm" : "border-gold/40 bg-card text-navy/55",
      )}
      title={ehG1 ? "Você (G1)" : rotuloEstado}
    >
      {ehG1 ? (
          <span className="text-[8px] sm:text-[10px]">Você</span>
      ) : (
        <>
          {/* Ajuste 2026-09-12 (opcional, pedido da Proprietária): no desktop,
              ícone + tooltip evita repetir o mesmo texto em vários nós; no
              mobile (sem hover), o texto continua visível. */}
          {estado === "em_pesquisa" ? (
            <Search className="hidden h-3.5 w-3.5 text-gold/70 lg:block" aria-hidden="true" />
          ) : (
            <Clock className="hidden h-3.5 w-3.5 text-navy/40 lg:block" aria-hidden="true" />
          )}
          <span className="sr-only">{rotuloEstado}</span>
        </>
      )}
    </div>
  );
}

/**
 * Corte 2a (28/09/2026): pessoa da família publicada pela equipe — nome e
 * vínculo, destaque dourado de "conectada". Só o que foi liberado no Desk.
 */
function NoPessoa({ pessoa }: { pessoa: PessoaNaArvore }) {
  return (
    <div
      className="flex min-h-9 min-w-[5.5rem] max-w-[9rem] flex-col items-center justify-center rounded-md border-2 border-gold bg-gold/15 px-2 py-1 text-center shadow-sm sm:min-h-14 sm:rounded-lg"
      data-arvore-pessoa
    >
      <span className="text-[10px] font-semibold leading-tight text-navy sm:text-xs">{pessoa.nome}</span>
      {pessoa.vinculo ? <span className="text-[9px] leading-tight text-navy/60 sm:text-[10px]">{pessoa.vinculo}</span> : null}
    </div>
  );
}

export const Route = createFileRoute("/portal/arvore")({
  head: () => ({
    meta: [
      { title: "Árvore — Portal Clube Ancestral" },
      { name: "description", content: "Espaço da sua árvore familiar dentro do acompanhamento." },
      { property: "og:title", content: "Árvore — Portal Clube Ancestral" },
      { property: "og:description", content: "Sua árvore familiar no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalArvore,
});

export function PortalArvore() {
  const { visibilidade, carregando } = useVisibilidade("arvore");
  const { data, isLoading, isError, error, refetch } = usePortalVivo();

  return (
    <PortalShell titulo={COPY_TELAS.arvore.titulo} descricao={COPY_TELAS.arvore.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <EstadoDados
          superficie="app"
          carregando={isLoading}
          erro={isError ? (error ?? true) : null}
          dados={data ? [data] : null}
          aoTentarNovamente={refetch}
          recurso="a sua árvore"
        >
          {([vivo]) => {
            // Corte 2a: pessoas nomeadas (uma por pessoa) viram nós; o restante
            // das publicações da árvore continua como nota.
            const pessoas = pessoasDaArvore(vivo.projecoes);
            const idsComPessoa = new Set(vivo.projecoes.filter((p) => p.pessoa_id).map((p) => String(p.id)));
            const itens = arvoreSanitizada(vivo.projecoes).filter((p) => !idsComPessoa.has(p.id));
            const painel = painelArvoreGeracoes(itens);
            const temConteudo = painel.temPublicacao || pessoas.length > 0;
            const pessoasDaGeracao = (id: string) => pessoas.filter((x) => `G${x.geracao}` === id);
            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <div className="space-y-5" data-aba-arvore>
                  {/* Estrutura G1–G5 do mockup — chrome visual, sem inventar pessoas. */}
                  <section
                    aria-label="Gerações G1 a G5"
                    className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-widest text-navy/45">
                      Cinco gerações da sua família
                    </p>
                    <p className="mt-1 text-sm text-navy/65">
                      {temConteudo
                        ? "A árvore reúne as pessoas e os vínculos já confirmados e compartilhados com você."
                         : "Esta árvore ainda não tem nomes e vínculos liberados para a família."}
                    </p>
                    <div className="mt-5 space-y-1">
                      {GERACOES_ARVORE_EXIBICAO.map((geracao: GeracaoArvore, gi) => (
                        <div key={geracao.id}>
                          {gi > 0 ? <ConectorGeracao slots={geracao.slots} /> : null}
                          <p className="mb-2 text-center text-[10px] uppercase tracking-[0.14em] text-navy/45">
                            {geracao.rotulo}
                          </p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {geracao.id === "G1" ? (
                              <NoArvore ehG1 estado={painel.estadoSlotAnonimo} />
                            ) : null}
                            {pessoasDaGeracao(geracao.id).map((pessoa) => (
                              <NoPessoa key={pessoa.chave} pessoa={pessoa} />
                            ))}
                            {Array.from({
                              length: Math.max(
                                0,
                                geracao.slots - (geracao.id === "G1" ? 1 : 0) - pessoasDaGeracao(geracao.id).length,
                              ),
                            }).map((_, i) => (
                              <NoArvore
                                key={`${geracao.id}-${i}`}
                                ehG1={false}
                                estado={temConteudo ? "em_pesquisa" : painel.estadoSlotAnonimo}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mockup p.6: "N pessoas conectadas recuperadas — de um universo
                        de 31 possíveis nas 5 gerações". Sem publicação, estado vazio. */}
                    <p
                      className="mt-5 rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-center text-sm text-navy/75"
                      data-arvore-contagem
                    >
                      {pessoas.length > 0 ? (
                        <>
                          <span className="font-serif text-base text-navy">
                            {pessoas.length}{" "}
                            {pessoas.length === 1 ? "pessoa conectada recuperada" : "pessoas conectadas recuperadas"}
                          </span>
                          {/*
                            Rodapé normativo do mockup aprovado de 17 páginas.
                            Removido por commit do Lovable em 04/10/2026 (segunda
                            vez: a primeira restauração foi 39d6929a). Restaurado
                            no merge para manter o contrato visual.
                          */}
                          <span className="mt-0.5 block text-xs text-navy/60">
                            de um universo de {PESSOAS_POSSIVEIS_CINCO_GERACOES} possíveis nas 5 gerações —
                            compartilhadas com a família
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-navy/60">
                           Nenhum nome liberado para esta árvore até agora.
                        </span>
                      )}
                    </p>
                  </section>

                  {/*
                    §6 linha 4 do De-Para ("LIGAÇÃO COM A JORNADA"; "Próxima
                    atualização"; "Próxima conexão liberada ou estado vazio").
                    Antes esta seção só existia com `notasPublicadas.length >
                    0` — sem publicação, ela desaparecia por inteiro. O
                    wireframe pede o card sempre presente, com estado vazio
                    honesto quando não há nada ainda (mesmo padrão do card
                    Microentrega da Home).
                  */}
                  <section aria-label="Ligação com a jornada" className="space-y-3" data-arvore-ligacao-jornada>
                    <div className="flex items-center justify-between gap-2">
                       <h2 className="font-serif text-xl text-navy">Próxima atualização da árvore</h2>
                      {painel.notasPublicadas.length > 0 ? (
                        <LinkPortal to="/portal/jornada" className="text-xs font-medium text-navy/60 hover:text-navy">
                          Ver na Jornada
                        </LinkPortal>
                      ) : null}
                    </div>
                    {painel.notasPublicadas.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-navy/20 bg-cream/60 p-4 text-sm text-navy/60">
                          A próxima ligação da família aparecerá aqui quando estiver confirmada e liberada.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {painel.notasPublicadas.map((item) => (
                          <li
                            key={item.id}
                            className="rounded-lg border border-border bg-card p-3 text-sm text-navy/75"
                          >
                            <p className="text-[11px] font-medium uppercase tracking-wide text-navy/45">
                              {item.tipoRotulo}
                            </p>
                            <p className="mt-1 whitespace-pre-line">{item.conteudo}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </BlocoVisibilidade>
            );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
