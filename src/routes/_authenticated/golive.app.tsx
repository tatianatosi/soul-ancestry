import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/app")({
  head: () => ({
    meta: [
      { title: "App Cliente — Go-live Clube Ancestral" },
      { name: "description", content: "Prévia do App Cliente com Home, Jornada, Documentos e Legado publicados." },
      { property: "og:title", content: "App Cliente — Go-live Clube Ancestral" },
      { property: "og:description", content: "Prévia do App Cliente com conteúdos publicados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppClienteGoLive,
});

const ABAS = ["Home", "Jornada", "Documentos", "Legado"] as const;

function AppClienteGoLive() {
  const { data, isPending } = useGoLive();
  const [aba, setAba] = useState<(typeof ABAS)[number]>("Home");
  const caso = data?.encontrado ? data : null;
  const publicados = caso?.publicados ?? [];
  const documentosLiberados = caso?.documentos.filter((d) => d.liberadoCliente) ?? [];

  return (
    <GoLiveShell titulo="App Cliente" descricao="Somente o que foi publicado para a cliente.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}

      <div className="flex flex-wrap gap-2">
        {ABAS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setAba(item)}
            aria-current={aba === item}
            className={`rounded-full px-3 py-1.5 text-sm ${aba === item ? "bg-navy text-cream" : "border border-navy/15 text-navy/70"}`}
          >
            {item}
          </button>
        ))}
      </div>

      {aba === "Home" ? (
        <Bloco titulo="Sua jornada">
          {publicados.length ? (
            <p className="text-sm text-navy">{publicados[0]?.resumo}</p>
          ) : (
            <Vazio cta={<Button size="sm" variant="outline" disabled>Aguardando publicação da equipe</Button>} />
          )}
        </Bloco>
      ) : null}

      {aba === "Jornada" ? (
        <Bloco titulo="Atualizações publicadas">
          {publicados.length ? (
            <ul className="space-y-2 text-sm text-navy">
              {publicados.map((p) => (
                <li key={p.id} className="break-words rounded-xl border border-navy/10 bg-white p-3">
                  {p.resumo}
                  {p.em ? <span className="block text-xs text-navy/50">{new Date(p.em).toLocaleDateString("pt-BR")}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <Vazio cta={<Button size="sm" variant="outline" disabled>Aguardando publicação da equipe</Button>} />
          )}
        </Bloco>
      ) : null}

      {aba === "Documentos" ? (
        <Bloco titulo="Documentos disponíveis">
          {documentosLiberados.length ? (
            <ul className="space-y-1 text-sm text-navy">
              {documentosLiberados.map((d) => (
                <li key={d.id} className="break-words">{d.titulo}</li>
              ))}
            </ul>
          ) : (
            <Vazio cta={<Button size="sm" variant="outline" disabled>Aguardando liberação da equipe</Button>} />
          )}
        </Bloco>
      ) : null}

      {aba === "Legado" ? (
        <Bloco titulo="Memória da família">
          <Vazio cta={<Button size="sm" variant="outline" disabled>Aguardando publicação da equipe</Button>} />
        </Bloco>
      ) : null}
    </GoLiveShell>
  );
}
