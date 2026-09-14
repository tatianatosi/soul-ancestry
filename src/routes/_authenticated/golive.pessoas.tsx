import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaFluxo, FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive } from "@/components/golive/dados";
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

  return (
    <GoLiveShell titulo="Pessoas & Famílias" descricao="Quem faz parte deste núcleo e deste caso.">
      <FaixaFluxo atual="Núcleo" />
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}
      {data && !data.encontrado ? (
        <Vazio cta={<span className="text-sm text-navy/60">Nenhum núcleo disponível nesta conta.</span>} />
      ) : null}

      {caso ? (
        <>
          <FaixaIdentidade dados={caso} />

          <Bloco titulo={caso.identidade.nucleo ?? "Núcleo familiar"}>
            {caso.identidade.nucleoMembros.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.identidade.nucleoMembros.map((m) => (
                  <li key={m.id} className="break-words">
                    {m.nome} {m.papel ? <span className="text-navy/55">— {m.papel}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio
                cta={
                  <Link to="/golive/caso">
                    <Button size="sm">Ver pessoas no caso</Button>
                  </Link>
                }
              />
            )}
          </Bloco>

          <Bloco titulo="Pessoas do caso">
            {caso.pessoas.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.pessoas.map((p) => (
                  <li key={p.id} className="break-words">
                    {p.nome} {p.papel ? <span className="text-navy/55">— {p.papel}</span> : null}
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
