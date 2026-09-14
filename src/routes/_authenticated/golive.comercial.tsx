import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaFluxo, FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/comercial")({
  head: () => ({
    meta: [
      { title: "Comercial — Go-live Clube Ancestral" },
      {
        name: "description",
        content: "Lead, Mesa de Discovery, call, pessoa, núcleo e caso do piloto canônico em uma leitura só.",
      },
      { property: "og:title", content: "Comercial — Go-live Clube Ancestral" },
      { property: "og:description", content: "Da entrada comercial até o caso aberto, com identidade única." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ComercialGoLive,
});

function ComercialGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  return (
    <GoLiveShell titulo="Comercial" descricao="Da entrada comercial até o caso aberto.">
      <FaixaFluxo atual="Caso" />
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}
      {data && !data.encontrado ? (
        <Vazio cta={<span className="text-sm text-navy/60">Nenhuma entrada comercial disponível nesta conta.</span>} />
      ) : null}

      {caso ? (
        <>
          <FaixaIdentidade dados={caso} />

          <Bloco titulo="Mesa de Discovery">
            <Vazio
              cta={
                <Link to="/golive/caso">
                  <Button size="sm">Abrir o caso desta pessoa</Button>
                </Link>
              }
            />
            <p className="text-xs text-navy/55">
              A entrada comercial desta pessoa já virou caso; nada mais está aberto na mesa.
            </p>
          </Bloco>

          <Bloco titulo="Pessoa e núcleo">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo rotulo="Pessoa" valor={caso.identidade.pessoaPrincipal} />
              <Campo rotulo="E-mail" valor={caso.identidade.email} />
              <Campo rotulo="Telefone" valor={caso.identidade.telefone} />
              <Campo rotulo="Núcleo" valor={caso.identidade.nucleo} />
            </dl>
            <Link to="/golive/pessoa" className="text-sm text-navy underline decoration-gold underline-offset-4">
              Ver Pessoa 360
            </Link>
          </Bloco>

          <Bloco titulo="Caso aberto">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo rotulo="Etapa" valor={caso.plano?.fase ?? caso.caso.fase} />
              <Campo rotulo="Próxima ação" valor={caso.plano?.proximaAcao ?? caso.caso.proximaAcao} />
              <Campo rotulo="Responsável" valor={caso.caso.responsavel} />
              <Campo rotulo="Prazo" valor={caso.plano?.prazo ?? caso.caso.prazo} />
            </dl>
            <Link to="/golive/caso">
              <Button size="sm">Abrir Caso 360</Button>
            </Link>
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
