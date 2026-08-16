import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell } from "@/components/saas/shell";
import { Painel, Selo } from "@/components/comercial/base";
import { listarCasosPesquisa } from "@/lib/pesquisa.functions";

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

  return (
    <SaasShell>
      <Painel titulo="Pesquisa genealógica por caso">
        {q.isLoading && <p className="text-sm text-navy/60">Carregando casos…</p>}
        {q.error && <p className="text-sm text-terracotta">{(q.error as Error).message}</p>}
        <div className="space-y-2">
          {(q.data ?? []).map((c) => (
            <Link
              key={c["id"] as string}
              to="/pesquisa/$id"
              params={{ id: c["id"] as string }}
              className="block rounded-xl border border-navy/10 bg-white p-3 hover:border-navy/30"
            >
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-sm">{c["codigo"] as string}</strong>
                <span className="text-sm text-navy/70">{c["titulo"] as string}</span>
                <Selo texto={String(c["status"] ?? "—")} tom={c["status"] === "ativo" ? "ok" : "neutro"} />
              </div>
              <p className="text-xs text-navy/50">
                {String(c["pais"] ?? "país não informado")} · via {String(c["via"] ?? "não definida")}
              </p>
            </Link>
          ))}
          {q.data && q.data.length === 0 && <p className="text-sm text-navy/60">Nenhum caso disponível.</p>}
        </div>
      </Painel>
    </SaasShell>
  );
}
