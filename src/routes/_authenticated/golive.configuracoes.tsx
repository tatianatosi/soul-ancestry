import { createFileRoute } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Go-live Clube Ancestral" },
      { name: "description", content: "Equipe e organização da superfície de go-live." },
      { property: "og:title", content: "Configurações — Go-live Clube Ancestral" },
      { property: "og:description", content: "Equipe e organização da superfície de go-live." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfiguracoesGoLive,
});

function ConfiguracoesGoLive() {
  const { data, isPending } = useGoLive();

  return (
    <GoLiveShell titulo="Configurações" descricao="Equipe e organização.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      <Bloco titulo="Equipe">
        {data?.encontrado && data.equipeTotal > 0 ? (
          <p className="text-sm text-navy">{data.equipeTotal} pessoa(s) com acesso nesta organização.</p>
        ) : (
          <Vazio cta={<Button size="sm" variant="outline" disabled>Convidar pessoa da equipe</Button>} />
        )}
      </Bloco>
      <Bloco titulo="Organização">
        <p className="text-sm text-navy">Clube Ancestral — organização ativa desta conta.</p>
      </Bloco>
    </GoLiveShell>
  );
}
