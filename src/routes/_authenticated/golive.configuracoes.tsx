/**
 * Configurações no shell de go-live.
 *
 * Acesso da família ao App, equipe com acesso e organização ativa.
 * Só leitura do motor aprovado: nada é criado, convidado ou gravado aqui.
 */
import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";

export const Route = createFileRoute("/_authenticated/golive/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Go-live Clube Ancestral" },
      { name: "description", content: "Acesso da família, equipe e organização da superfície de go-live." },
      { property: "og:title", content: "Configurações — Go-live Clube Ancestral" },
      { property: "og:description", content: "Acesso da família, equipe e organização ativa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfiguracoesGoLive,
});

function ConfiguracoesGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  return (
    <GoLiveShell titulo="Configurações" descricao="Acesso da família, equipe e organização.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      <Bloco titulo="Acesso da família ao App">
        {caso?.portal.acessos.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {caso.portal.acessos.map((a) => (
              <li key={a.id} className="break-words">
                {a.email ?? "Sem e-mail registrado"} — {humano(a.situacao)} · {humano(a.nivel)}
                {a.ultimoAcesso ? (
                  <span className="text-navy/55"> · último acesso {dataHumana(a.ultimoAcesso)}</span>
                ) : (
                  <span className="text-navy/55"> · ainda não entrou</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Vazio cta={<Link to="/acessos-portal"><Button size="sm">Liberar acesso da família</Button></Link>} />
        )}
      </Bloco>

      <Bloco titulo="E-mails autorizados">
        {caso?.portal.emailsAutorizados.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {caso.portal.emailsAutorizados.map((e) => (
              <li key={e.id} className="break-words">
                {e.email ?? "Sem e-mail registrado"} — {humano(e.status)}
              </li>
            ))}
          </ul>
        ) : (
          <Vazio cta={<Link to="/acessos-portal"><Button size="sm">Autorizar e-mail</Button></Link>} />
        )}
      </Bloco>

      <Bloco titulo="Equipe">
        {caso && caso.equipeTotal > 0 ? (
          <p className="text-sm text-navy">{caso.equipeTotal} pessoa(s) com acesso nesta organização.</p>
        ) : (
          <Vazio cta={<Link to="/equipe"><Button size="sm">Convidar pessoa da equipe</Button></Link>} />
        )}
      </Bloco>

      <Bloco titulo="Organização">
        <p className="text-sm text-navy">Clube Ancestral — organização ativa desta conta.</p>
      </Bloco>
    </GoLiveShell>
  );
}
