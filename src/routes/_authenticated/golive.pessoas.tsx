import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, FaixaKpis, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaFluxo, FaixaIdentidade } from "@/components/golive/identidade";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive, useEscritorGoLive, buscaGoLive } from "@/components/golive/dados";
import { registrarMembroNucleoGoLive, resolverPessoaGoLive } from "@/lib/golive-escritores.functions";
import { AcaoConferirPessoa } from "@/components/golive/acoes-registro";
import { Barras, Rede, Rosca } from "@/components/golive/graficos";
import {
  coberturaPorGeracao,
  composicaoDoNucleo,
  estadoDeConfirmacao,
  pessoasDoNucleo,
  relacoesAprovadas,
  type PessoaCaso,
} from "@/lib/golive-pessoas";
import { impactoNaArvore } from "@/lib/golive-pesquisa";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/pessoas")({
  validateSearch: buscaGoLive,
  head: () => ({
    meta: [
      { title: "Pessoas & Famílias — Go-live Clube Ancestral" },
      { name: "description", content: "Núcleo familiar e pessoas vinculadas ao caso escolhido." },
      { property: "og:title", content: "Pessoas & Famílias — Go-live Clube Ancestral" },
      { property: "og:description", content: "Núcleo familiar e pessoas vinculadas ao caso canônico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PessoasGoLive,
});

function PessoasGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const adicionarMembro = useEscritorGoLive(registrarMembroNucleoGoLive);
  const conferirPessoa = useEscritorGoLive(resolverPessoaGoLive);

  /* Fonte: nucleo_membros (núcleo do caso), case_members e case_dependents.
     Geração e relação só saem de pai_id/mae_id gravados. */
  const pessoasCaso: PessoaCaso[] = caso?.pessoas.length
    ? (caso.pessoas as PessoaCaso[])
    : pessoasDoNucleo(caso?.identidade.nucleoMembros ?? [], {
        nome: caso?.identidade.pessoaPrincipal ?? null,
        email: caso?.identidade.email ?? null,
        telefone: caso?.identidade.telefone ?? null,
      });
  const geracoes = coberturaPorGeracao(pessoasCaso).filter((g) => g.valor > 0);
  const composicao = composicaoDoNucleo(pessoasCaso, caso?.dependentes ?? []).filter((c) => c.valor > 0);
  const relacoes = relacoesAprovadas(pessoasCaso);

  const membros = caso?.identidade.nucleoMembros ?? [];
  const titular = membros.find((m) => m.nome === caso?.identidade.pessoaPrincipal) ?? null;
  const dependentes = membros.filter((m) => (m.papel ?? "").toLowerCase().includes("depend"));
  const participantes = membros.filter((m) => m !== titular && !dependentes.includes(m));

  return (
    <GoLiveShell titulo="Pessoas & Famílias" descricao="Quem faz parte deste núcleo e deste caso.">
      <FaixaFluxo atual="Núcleo" />
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}
      {data && !data.encontrado ? (
        <Bloco titulo="Núcleo familiar">
          <Vazio
            cta={
              <Link to="/nucleos">
                <Button size="sm">Criar núcleo</Button>
              </Link>
            }
          />
          <p className="text-xs text-navy/55">Nenhum núcleo familiar criado.</p>
        </Bloco>
      ) : null}

      {caso ? (
        <>
          <FaixaIdentidade dados={caso} />
          <FaixaKpis itens={[
            { rotulo: "Pessoas no núcleo", valor: membros.length, tom: membros.length ? "azul" : "cinza", fonte: "Núcleo familiar do caso", formula: "Contagem dos membros vinculados ao núcleo", periodo: "Estado atual" },
            { rotulo: "Participantes", valor: participantes.length, tom: participantes.length ? "azul" : "cinza", fonte: "Papéis do núcleo", formula: "Membros exceto titular e dependentes", periodo: "Estado atual" },
            { rotulo: "Dependentes", valor: dependentes.length, tom: dependentes.length ? "dourado" : "cinza", fonte: "Papéis do núcleo", formula: "Membros com papel de dependente registrado", periodo: "Estado atual" },
            { rotulo: "Relações aprovadas", valor: relacoes.length, tom: relacoes.length ? "verde" : "cinza", fonte: "Relações genealógicas explícitas", formula: "Contagem de vínculos aprovados, sem inferência", periodo: "Estado atual" },
          ]} />

          <Bloco titulo={`Núcleo familiar — ${caso.identidade.nucleo ?? "não registrado"}`}>
            <p className="text-sm text-navy/70">
              {membros.length} pessoa{membros.length === 1 ? "" : "s"} no núcleo · {dependentes.length} dependente
              {dependentes.length === 1 ? "" : "s"} · {caso.pessoas.length} pessoa
              {caso.pessoas.length === 1 ? "" : "s"} no caso
            </p>

            <Grupo titulo="Titular">
              {titular ? (
                <Pessoa nome={titular.nome} papel={titular.papel} />
              ) : (
                <p className="text-sm text-navy/60">Titular ainda não registrado no núcleo.</p>
              )}
            </Grupo>

            <Grupo titulo="Participantes">
              {participantes.length ? (
                participantes.map((m) => <Pessoa key={m.id} nome={m.nome} papel={m.papel} />)
              ) : (
                <p className="text-sm text-navy/60">Sem itens nesta etapa</p>
              )}
            </Grupo>

            <Grupo titulo="Dependentes">
              {dependentes.length ? (
                dependentes.map((m) => <Pessoa key={m.id} nome={m.nome} papel={m.papel} />)
              ) : (
                <p className="text-sm text-navy/60">Sem itens nesta etapa</p>
              )}
            </Grupo>

            <Acoes>
              <Acao
                rotulo="Adicionar pessoa ao núcleo"
                titulo="Nova pessoa do núcleo familiar"
                variante="outline"
                campos={[
                  { nome: "nome", rotulo: "Nome completo", obrigatorio: true },
                  {
                    nome: "papel",
                    rotulo: "Papel",
                    tipo: "escolha",
                    obrigatorio: true,
                    opcoes: [
                      { valor: "contratante_signatario", rotulo: "Contratante / signatário" },
                      { valor: "dependente", rotulo: "Dependente" },
                    ],
                  },
                  {
                    nome: "base",
                    rotulo: "Base da relação",
                    tipo: "area",
                    obrigatorio: true,
                    ajuda: "Documento, evidência ou decisão humana que sustenta o vínculo.",
                  },
                ]}
                aoConfirmar={(v) =>
                  adicionarMembro({
                    data: {
                      nome: v["nome"] ?? "",
                      papel: (v["papel"] as "contratante_signatario" | "dependente") ?? "dependente",
                      base: v["base"] ?? "",
                    },
                  })
                }
                confirmacao="Pessoa adicionada ao núcleo."
              />
              <AcaoConferirPessoa
                aoConfirmar={(v) => conferirPessoa({ data: v as Parameters<typeof conferirPessoa>[0]["data"] })}
              />
            </Acoes>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link search={true} to="/golive/pessoa" className="text-sm text-navy underline decoration-gold underline-offset-4">
                Abrir Pessoa 360
              </Link>
              <Link search={true} to="/golive/caso" className="text-sm text-navy underline decoration-gold underline-offset-4">
                Abrir Caso 360
              </Link>
            </div>
          </Bloco>

          <Bloco titulo="Pessoas do caso">
            {caso.pessoas.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.pessoas.map((p) => (
                  <li key={p.id} className="break-words">
                    {p.nome} {p.papel ? <span className="text-navy/55">— {humano(p.papel)}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio
                cta={
                  <Link search={true} to="/golive/pessoa">
                    <Button size="sm">Abrir Pessoa 360</Button>
                  </Link>
                }
              />
            )}
          </Bloco>

          <Bloco titulo="Composição do núcleo">
            {composicao.length ? (
              <Rosca dados={composicao} titulo="Titular, participantes e dependentes" />
            ) : (
              <Vazio
                cta={
                  <Link to="/nucleos">
                    <Button size="sm">Criar núcleo</Button>
                  </Link>
                }
              />
            )}
          </Bloco>

          <ArvoreAprovada pessoas={pessoasCaso} relacoes={relacoes} />

          <ImpactoDaPesquisa achados={caso.achados} />
        </>
      ) : null}
    </GoLiveShell>
  );
}

/**
 * Impacto interno da pesquisa na árvore: só achado já aprovado internamente.
 * Aprovação não publica nada para a família e não cria vínculo sozinha.
 */
function ImpactoDaPesquisa({
  achados,
}: {
  achados: { id: string; titulo?: string | null; validacao?: string | null; validadoEm?: string | null; impactoArvore?: string | null }[];
}) {
  const impacto = impactoNaArvore(achados);
  return (
    <Bloco titulo="Impacto da pesquisa aprovada na árvore">
      {impacto.validados ? (
        <div className="min-w-0 space-y-2">
          <p className="text-sm text-navy">
            {impacto.validados} achado(s) aprovado(s) internamente · {impacto.aplicados} aplicado(s) e{" "}
            {impacto.propostos} proposto(s) na árvore.
          </p>
          <ul className="space-y-1 text-sm text-navy">
            {impacto.itens.map((i) => (
              <li key={i.id} className="break-words">
                {i.titulo}{" "}
                <span className="text-navy/55">
                  — {humano(i.impacto)}
                  {i.validadoEm ? ` · aprovado em ${dataHumana(i.validadoEm)}` : ""}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-navy/50">
            Aprovação interna não publica nada para a família. {impacto.emRevisao} achado(s) ainda em revisão.
          </p>
        </div>
      ) : (
        <Vazio
          cta={
            <Link search={true} to="/golive/pesquisa">
              <Button size="sm">Aprovar achado na Pesquisa</Button>
            </Link>
          }
        />
      )}
    </Bloco>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-navy/10 bg-cream/70 p-3">
      <p className="text-[11px] uppercase tracking-wide text-navy/50">{titulo}</p>
      <div className="mt-1 space-y-1">{children}</div>
    </div>
  );
}

function Pessoa({ nome, papel }: { nome: string; papel: string | null }) {
  return (
    <p className="break-words text-sm text-navy">
      {nome} {papel ? <span className="text-navy/55">— {humano(papel)}</span> : null}
    </p>
  );
}

/**
 * Árvore: mostra somente pessoas e relações aprovadas, isto é, com vínculo
 * registrado no núcleo. Quem está sem parentesco declarado não entra na
 * árvore — nada é inferido.
 */
function ArvoreAprovada({
  pessoas,
  relacoes,
}: {
  pessoas: PessoaCaso[];
  relacoes: { id: string; de: string; para: string; rotulo: string }[];
}) {
  return (
    <Bloco titulo="Árvore — pessoas e relações aprovadas">
      {pessoas.length ? (
        <div className="min-w-0 space-y-3">
          {relacoes.length ? (
            <Rede relacoes={relacoes} />
          ) : (
            <p className="text-xs text-navy/55">Nenhum parentesco declarado ainda — só o estado de cada pessoa.</p>
          )}
          <ul className="space-y-1">
            {pessoas.map((p) => (
              <li key={p.id} className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-navy">
                <span className="min-w-0 break-words">{p.nome}</span>
                <span className="shrink-0 rounded-full border border-navy/15 px-2 py-0.5 text-[11px] text-navy/65">
                  {estadoDeConfirmacao(p)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-navy/50">Somente vínculos já declarados no caso aparecem aqui.</p>
        </div>
      ) : (
        <Vazio
          cta={
            <Link search={true} to="/golive/caso">
              <Button size="sm">Aprovar vínculos no caso</Button>
            </Link>
          }
        />
      )}
    </Bloco>
  );
}
