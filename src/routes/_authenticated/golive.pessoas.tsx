import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaFluxo, FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive } from "@/components/golive/dados";
import { humano } from "@/lib/rotulos-golive";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/pessoas")({
  head: () => ({
    meta: [
      { title: "Pessoas & Famílias — Go-live Clube Ancestral" },
      { name: "description", content: "Núcleo familiar e pessoas vinculadas ao caso canônico do piloto." },
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

          <Bloco titulo={caso.identidade.nucleo ?? "Núcleo familiar"}>
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

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link to="/golive/pessoa" className="text-sm text-navy underline decoration-gold underline-offset-4">
                Abrir Pessoa 360
              </Link>
              <Link to="/golive/caso" className="text-sm text-navy underline decoration-gold underline-offset-4">
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
                  <Link to="/golive/pessoa">
                    <Button size="sm">Abrir Pessoa 360</Button>
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
