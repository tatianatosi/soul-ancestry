import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { arvoreSanitizada } from "@/lib/portal-dados-vivos";
import {
  painelArvoreGeracoes,
  GERACOES_ARVORE_EXIBICAO,
  geracoesParaExibir,
  type GeracaoArvore,
} from "@/lib/portal-arvore-geracoes";
import { pessoasDaArvore, type PessoaNaArvore } from "@/lib/arvore-publicacao";
import { LinkPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { AvisoFalhaConexao } from "@/components/portal/aviso-falha-conexao";
import { PerfilPessoaArvore } from "@/components/portal/explorador-arvore";
import { GenogramaFamiliar } from "@/components/portal/genograma-familiar";
import { raizAutorizada } from "@/components/portal/genograma-layout";

/**
 * Corte 2a (28/09/2026): pessoa da família publicada pela equipe — nome e
 * vínculo, destaque dourado de "conectada". Só o que foi liberado no Desk.
 */
function NoPessoa({ pessoa }: { pessoa: PessoaNaArvore }) {
  return <PerfilPessoaArvore pessoa={pessoa} />;
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
      ) : isError ? (
        // 12/10/2026: erro de leitura nunca vira "Lacuna" nem "ninguém compartilhado".
        <AvisoFalhaConexao
          mensagem="Erro de conexão ao carregar a árvore. Nada foi perdido."
          rotuloBotao="Recarregar árvore"
          aoTentar={refetch}
        />
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
            const pessoas = pessoasDaArvore(vivo.projecoes).filter((p) => p.geracao !== null);
            const idsComPessoa = new Set(vivo.projecoes.filter((p) => p.pessoa_id).map((p) => String(p.id)));
            const itens = arvoreSanitizada(vivo.projecoes).filter((p) => !idsComPessoa.has(p.id));
            const painel = painelArvoreGeracoes(itens);
            const temConteudo = painel.temPublicacao || pessoas.length > 0;
            const pessoasDaGeracao = (id: string) => pessoas.filter((x) => `G${x.geracao}` === id);
             const geracoesPublicadas = new Set(pessoas.map((pessoa) => `G${pessoa.geracao}`));
             // Gerações vêm do que foi publicado (sem lista fixa nem teto).
             const geracoesExibidas = pessoas.length > 0
               ? geracoesParaExibir(pessoas.map((pessoa) => pessoa.geracao))
               : [];
             const maiorGeracao = geracoesExibidas.reduce(
               (maior, geracao) => Math.max(maior, Number(geracao.id.slice(1)) || 1),
               1,
             );
            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <div className="space-y-5" data-aba-arvore>
                  {/* A composição exibe G1 e as gerações com pessoas publicadas. */}
                  <section
                    aria-label={`Gerações G1 a G${maiorGeracao}`}
                    className="app-arvore-moldura min-w-0 py-2"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-widest text-navy/45">
                       As gerações que compõem você
                    </p>
                    <p className="mt-1 text-sm text-navy/65">
                      {temConteudo
                        ? pessoas.length > 0
                          ? "A árvore reúne as pessoas compartilhadas com você, nas gerações publicadas. Os vínculos aparecem somente quando também forem compartilhados."
                          : "Os nomes compartilhados estão abaixo. As posições na árvore aparecerão quando os vínculos e as gerações estiverem disponíveis."
                         : "Esta árvore ainda não tem nomes e vínculos liberados para a família."}
                    </p>
                    {pessoas.length > 0 ? (
                      <GenogramaFamiliar pessoas={pessoas} vinculos={"vinculosArvore" in vivo ? vivo.vinculosArvore : []} raizId={raizAutorizada(vivo.casoAtivoId, pessoas)} />
                    ) : (
                    <div className="mt-6 divide-y divide-border">
                      {geracoesExibidas.map((geracao: GeracaoArvore) => (
                        <div key={geracao.id} className="grid min-w-0 gap-3 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
                          <p className="text-xs font-medium leading-relaxed text-navy/70">
                            {geracao.id === "G1" ? "G1 · Você (âncora)" : `${geracao.id} · ${Number(geracao.id.slice(1))}ª geração`}
                          </p>
                          <div className="grid min-w-0 gap-2">
                            {geracao.id === "G1" ? (
                              <p className="rounded-lg bg-navy px-4 py-3 text-sm font-medium text-cream">Você</p>
                            ) : null}
                            {pessoas.length > 0 && geracao.id !== "G1" && !geracoesPublicadas.has(geracao.id) ? (
                              <p className="border-l-2 border-terracotta/40 pl-4 text-sm leading-relaxed text-navy/70" data-arvore-lacuna>
                                Em pesquisa · geração ainda sem pessoas compartilhadas.
                              </p>
                            ) : null}
                            {pessoasDaGeracao(geracao.id).map((pessoa) => (
                              <NoPessoa key={pessoa.chave} pessoa={pessoa} />
                            ))}
                            {pessoas.length === 0 && geracao.id !== "G1" ? <p className="app-estado-editorial">Em pesquisa</p> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                    )}


                    {/* Só contar nomes efetivamente publicados; o teto ilustrativo
                        do mockup não representa pessoas reais desta família. */}
                    <p
                      className="mt-5 border-t border-gold/40 py-4 text-sm text-navy/75"
                      data-arvore-contagem
                    >
                      {pessoas.length > 0 ? (
                        <>
                          <span className="font-serif text-base text-navy">
                            {pessoas.length}{" "}
                            {pessoas.length === 1 ? "pessoa conectada na linhagem" : "pessoas conectadas na linhagem"}
                          </span>
                          {/*
                            O rodapé "de um universo de N possíveis" do mockup de
                            17 páginas foi removido pelo Lovable 3 vezes (a 1ª
                            restauração foi 39d6929a). Decisão final e explícita
                            da Proprietária em 07/10/2026: a árvore é sem teto —
                            não há denominador teórico a mostrar (a árvore já
                            passou de 5 para 10 gerações, e o "31"/"1023" nunca
                            foi uma meta real de pessoas). Não restaurar de novo:
                            o contrato visual, neste ponto específico, foi
                            substituído por esta decisão.
                          */}
                        </>
                      ) : (
                        <span className="text-xs text-navy/60">
                           {temConteudo
                             ? "Os nomes já compartilhados ainda não têm posição disponível nesta árvore."
                             : "Em pesquisa — os nomes terão seu lugar aqui quando forem liberados."}
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
                      <p className="border-l-2 border-gold/40 pl-4 text-sm leading-relaxed text-navy/70">
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
