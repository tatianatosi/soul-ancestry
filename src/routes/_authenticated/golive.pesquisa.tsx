import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/pesquisa")({
  head: () => ({
    meta: [
      { title: "Pesquisa — Go-live Clube Ancestral" },
      { name: "description", content: "Fontes, evidências e achados do caso canônico, com estado vazio declarado." },
      { property: "og:title", content: "Pesquisa — Go-live Clube Ancestral" },
      { property: "og:description", content: "Fontes, evidências e achados do caso canônico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PesquisaGoLive,
});

function PesquisaGoLive() {
  const { data, isPending } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const fontes = caso?.documentos.filter((d) => (d.status ?? "").length > 0) ?? [];

  return (
    <GoLiveShell titulo="Pesquisa" descricao="Fonte, evidência e achado — nesta ordem.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}

      <Bloco titulo="Fontes">
        {fontes.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {fontes.map((f) => (
              <li key={f.id} className="break-words">{f.titulo}</li>
            ))}
          </ul>
        ) : (
          <Vazio cta={<Link to="/golive/caso"><Button size="sm">Registrar fonte no caso</Button></Link>} />
        )}
      </Bloco>

      <Bloco titulo="Evidências">
        <Vazio cta={<Link to="/golive/caso"><Button size="sm">Anexar evidência</Button></Link>} />
      </Bloco>

      <Bloco titulo="Achados">
        <Vazio cta={<Link to="/golive/caso"><Button size="sm">Registrar achado</Button></Link>} />
      </Bloco>
    </GoLiveShell>
  );
}
