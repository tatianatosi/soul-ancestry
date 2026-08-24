import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell } from "@/components/saas/shell";
import {
  AlertaDesk,
  BadgeDesk,
  CarregandoDesk,
  PageHeader,
  VazioDesk,
} from "@/components/desk/ui-desk";
import { listarCasosPesquisa } from "@/lib/pesquisa.functions";
import { PendenciasCriticasPesquisa } from "@/components/painel/pendencias-criticas-pesquisa";


export const Route = createFileRoute("/_authenticated/pesquisa/")({
  head: () => ({
    meta: [
      { title: "Pesquisa genealógica — Clube Ancestral" },
      { name: "description", content: "Dossiês de pesquisa, evidências e pendências por caso." },
      { property: "og:title", content: "Pesquisa genealógica — Clube Ancestral" },
      { property: "og:description", content: "Dossiês de pesquisa, evidências e pendências por caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PesquisaIndex,
});

function PesquisaIndex() {
  const carregar = useServerFn(listarCasosPesquisa);
  const q = useQuery({ queryKey: ["pesquisa", "casos"], queryFn: () => carregar() });
  const casos = q.data ?? [];

  return (
    <SaasShell
      titulo="Pesquisa genealógica"
      descricao="Fontes, evidências e próximos passos do caso — uso interno."
    >
      <PageHeader
        titulo="Casos em pesquisa"
        subtitulo="Hierarquia de leitura: caso → hipótese → fonte → evidência → estado de validação. Achados são hipóteses com estado de validação, nunca confirmação."
      />

      {q.isLoading ? <CarregandoDesk linhas={4} rotulo="Carregando casos de pesquisa" /> : null}
      {q.error ? (
        <AlertaDesk tom="critico" titulo="Não foi possível carregar os casos">
          {(q.error as Error).message}
        </AlertaDesk>
      ) : null}

      {!q.isLoading && !q.error ? (
        <section aria-label="Casos em pesquisa" className="space-y-2">
          {casos.map((c) => (
            <Link
              key={c["id"] as string}
              to="/pesquisa/$id"
              params={{ id: c["id"] as string }}
              className="block rounded-xl border border-navy/10 bg-white p-4 transition-colors hover:border-navy/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <strong className="font-sans text-sm text-navy">{c["codigo"] as string}</strong>
                <span className="font-serif text-lg leading-tight text-navy">{c["titulo"] as string}</span>
                <BadgeDesk
                  texto={String(c["status"] ?? "—")}
                  tom={c["status"] === "ativo" ? "sucesso" : "neutro"}
                />
              </div>
              <p className="mt-1 text-xs text-navy/55">
                {String(c["pais"] ?? "país não informado")} · via {String(c["via"] ?? "não definida")}
              </p>
            </Link>
          ))}
          {casos.length === 0 ? (
            <VazioDesk
              titulo="Nenhum caso em pesquisa"
              descricao="Quando um caso for habilitado para pesquisa, ele aparece aqui com fontes, evidências e próximos passos."
            />
          ) : null}
        </section>
      ) : null}

      <div className="mt-6">
        <PendenciasCriticasPesquisa />
      </div>
    </SaasShell>
  );
}

