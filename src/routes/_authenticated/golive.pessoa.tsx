import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaFluxo, FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive } from "@/components/golive/dados";
import { humano } from "@/lib/rotulos-golive";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/pessoa")({
  head: () => ({
    meta: [
      { title: "Pessoa 360 — Go-live Clube Ancestral" },
      { name: "description", content: "Identidade única da pessoa do piloto: contato, núcleo, caso e documentos." },
      { property: "og:title", content: "Pessoa 360 — Go-live Clube Ancestral" },
      { property: "og:description", content: "Contato, núcleo, caso e documentos da pessoa canônica." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PessoaGoLive,
});

function PessoaGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  const papelNoNucleo =
    caso?.identidade.nucleoMembros.find((m) => m.nome === caso.identidade.pessoaPrincipal)?.papel ?? null;

  return (
    <GoLiveShell titulo="Pessoa 360" descricao="A mesma pessoa, em uma leitura só.">
      <FaixaFluxo atual="Pessoa" />
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}
      {data && !data.encontrado ? (
        <Bloco titulo="Pessoa">
          <Vazio
            cta={
              <Link to="/clientes">
                <Button size="sm">Buscar pessoa</Button>
              </Link>
            }
          />
          <p className="text-xs text-navy/55">Nenhuma pessoa selecionada.</p>
        </Bloco>
      ) : null}

      {caso ? (
        <>
          <FaixaIdentidade dados={caso} />

          <Bloco titulo="Identidade e contato">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo rotulo="Papel no núcleo" valor={humano(papelNoNucleo, "Papel ainda não registrado")} />
              <Campo rotulo="Núcleo" valor={caso.identidade.nucleo} />
              <Campo rotulo="E-mail" valor={caso.identidade.email} />
              <Campo rotulo="Telefone" valor={caso.identidade.telefone} />
            </dl>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/golive/pessoas" className="text-sm text-navy underline decoration-gold underline-offset-4">
                Ver núcleo familiar
              </Link>
              <Link
                to="/pessoas-linhagens/$caseId"
                params={{ caseId: caso.caso.id }}
                className="text-sm text-navy underline decoration-gold underline-offset-4"
              >
                Ver árvore
              </Link>
            </div>
          </Bloco>

          <Bloco titulo="Caso desta pessoa">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo rotulo="Caso" valor={caso.caso.titulo} />
              <Campo rotulo="Etapa" valor={humano(caso.plano?.fase ?? caso.caso.fase)} />
              <Campo rotulo="Próxima ação" valor={humano(caso.plano?.proximaAcao ?? caso.caso.proximaAcao)} />
              <Campo rotulo="Responsável" valor={caso.caso.responsavel} />
            </dl>
            <Link to="/golive/caso">
              <Button size="sm">Abrir Caso 360</Button>
            </Link>
          </Bloco>

          <Bloco titulo="Documentos da pessoa">
            {caso.documentos.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.documentos.map((d) => (
                  <li key={d.id} className="break-words">
                    {d.titulo} {d.status ? <span className="text-navy/55">— {humano(d.status)}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio
                cta={
                  <Link to="/golive/caso">
                    <Button size="sm">Ver documentos no caso</Button>
                  </Link>
                }
              />
            )}
          </Bloco>
        </>
      ) : null}
    </GoLiveShell>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="break-words text-sm text-navy">{valor ?? "Sem itens nesta etapa"}</dd>
    </div>
  );
}
