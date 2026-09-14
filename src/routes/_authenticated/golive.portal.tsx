/**
 * Portal / Configuração Master no shell de go-live.
 *
 * Acesso do cliente, equipe/organização, publicação com autor e data e o
 * espelho interno do que o cliente enxerga. Só apresentação: nenhuma
 * publicação é disparada aqui e nenhum dado é criado.
 */
import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";

export const Route = createFileRoute("/_authenticated/golive/portal")({
  head: () => ({
    meta: [
      { title: "Portal do cliente — Go-live Clube Ancestral" },
      { name: "description", content: "Acesso do cliente, equipe e conteúdo publicado do caso do piloto." },
      { property: "og:title", content: "Portal do cliente — Go-live Clube Ancestral" },
      { property: "og:description", content: "Acesso do cliente, equipe e conteúdo publicado do caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PortalGoLive,
});

function PortalGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const publicados = caso?.publicados ?? [];

  return (
    <GoLiveShell titulo="Portal do cliente" descricao="Acesso, equipe e o que o cliente já enxerga.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <Bloco titulo="Acesso do cliente">
        {caso?.identidade.email ? (
          <div className="space-y-2">
            <p className="break-words text-sm text-navy">
              {caso.identidade.pessoaPrincipal} · {caso.identidade.email}
            </p>
            <Link to="/acessos-portal" className="text-sm text-navy underline decoration-gold underline-offset-4">
              Gerenciar acesso e convite
            </Link>
          </div>
        ) : (
          <Vazio
            cta={
              <Link to="/acessos-portal">
                <Button size="sm">Autorizar e-mail do cliente</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="Equipe e organização">
        {caso && caso.equipeTotal > 0 ? (
          <p className="text-sm text-navy">
            Clube Ancestral · {caso.equipeTotal} pessoa{caso.equipeTotal === 1 ? "" : "s"} com acesso interno.
          </p>
        ) : (
          <Vazio
            cta={
              <Link to="/acessos-portal">
                <Button size="sm">Gerenciar equipe</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="Publicado para o cliente">
        {publicados.length ? (
          <ul className="space-y-2 text-sm text-navy">
            {publicados.map((p) => (
              <li key={p.id} className="break-words rounded-xl border border-navy/10 bg-cream/70 p-3">
                <p className="font-medium">{humano(p.tipo)}</p>
                {p.resumo ? <p className="text-navy/75">{p.resumo}</p> : null}
                <p className="mt-1 text-xs text-navy/55">
                  Publicado em {dataHumana(p.em, "data não registrada")}
                  {caso?.identidade.responsavel ? ` · por ${caso.identidade.responsavel}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio
            cta={
              <Link to="/golive/caso">
                <Button size="sm">Publicar microentrega</Button>
              </Link>
            }
          />
        )}
        <p className="text-xs text-navy/55">
          Publicar e despublicar continua sendo ação do Caso 360, sempre com autor e data.
        </p>
      </Bloco>

      <Bloco titulo="Espelho interno do App">
        <p className="text-sm text-navy/70">
          Veja exatamente o que o cliente enxerga hoje, sem entrar na conta dele.
        </p>
        <Link to="/golive/app" className="text-sm text-navy underline decoration-gold underline-offset-4">
          Abrir espelho do App Cliente
        </Link>
      </Bloco>
    </GoLiveShell>
  );
}
