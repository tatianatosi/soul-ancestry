import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/formalizacao")({
  head: () => ({
    meta: [
      { title: "Formalização — Go-live Clube Ancestral" },
      { name: "description", content: "Proposta, contrato e pagamento manual do caso canônico." },
      { property: "og:title", content: "Formalização — Go-live Clube Ancestral" },
      { property: "og:description", content: "Proposta, contrato e pagamento manual do caso canônico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FormalizacaoGoLive,
});

function FormalizacaoGoLive() {
  const { data, isPending } = useGoLive();
  const caso = data?.encontrado ? data : null;

  return (
    <GoLiveShell titulo="Formalização" descricao="Proposta, contrato e pagamento — registro manual.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}

      <Bloco titulo="Contrato">
        {caso?.contratos.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {caso.contratos.map((c) => (
              <li key={c.id} className="break-words">
                {c.numero ? `${c.numero} — ` : ""}{c.titulo} <span className="text-navy/55">{c.status ?? ""}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio cta={<Link to="/golive/caso"><Button size="sm">Registrar contrato</Button></Link>} />
        )}
      </Bloco>

      <Bloco titulo="Pagamento">
        {caso?.faturas.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {caso.faturas.map((f) => (
              <li key={f.id} className="break-words">
                {f.numero ?? "Cobrança"} — {f.status ?? "sem estado"} {f.vencimento ? `· vence ${f.vencimento}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <Vazio cta={<Link to="/golive/caso"><Button size="sm">Registrar pagamento manual</Button></Link>} />
        )}
      </Bloco>
    </GoLiveShell>
  );
}
