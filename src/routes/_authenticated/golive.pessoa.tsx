import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaFluxo, FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive } from "@/components/golive/dados";
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

  return (
    <GoLiveShell titulo="Pessoa 360" descricao="A mesma pessoa, em uma leitura só.">
      <FaixaFluxo atual="Pessoa" />
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}
      {data && !data.encontrado ? (
        <Vazio cta={<span className="text-sm text-navy/60">Nenhuma pessoa disponível nesta conta.</span>} />
      ) : null}

      {caso ? (
        <>
          <FaixaIdentidade dados={caso} />

          <Bloco titulo="Contato">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo rotulo="E-mail" valor={caso.identidade.email} />
              <Campo rotulo="Telefone" valor={caso.identidade.telefone} />
            </dl>
          </Bloco>

          <Bloco titulo="Caso desta pessoa">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo rotulo="Caso" valor={`${caso.caso.codigo} — ${caso.caso.titulo}`} />
              <Campo rotulo="Etapa" valor={caso.plano?.fase ?? caso.caso.fase} />
              <Campo rotulo="Próxima ação" valor={caso.plano?.proximaAcao ?? caso.caso.proximaAcao} />
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
                    {d.titulo} {d.status ? <span className="text-navy/55">— {d.status}</span> : null}
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

          <Bloco titulo="Registros antigos fora do piloto">
            {caso.identidade.legado.length ? (
              <ul className="space-y-1 text-sm text-navy/75">
                {caso.identidade.legado.map((l) => (
                  <li key={`${l.origem}-${l.id}`} className="break-words">
                    {l.rotulo} <span className="text-navy/50">— {l.origem}: {l.motivo}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={<span className="text-sm text-navy/60">Nenhum registro duplicado localizado.</span>} />
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
