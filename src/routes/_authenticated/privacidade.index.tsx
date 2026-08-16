import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell } from "@/components/saas/shell";
import { Painel, Selo } from "@/components/comercial/base";
import { listarClientesECasos } from "@/lib/documentos.functions";

export const Route = createFileRoute("/_authenticated/privacidade/")({
  head: () => ({
    meta: [
      { title: "Privacidade e documentos — Clube Ancestral" },
      { name: "description", content: "Documentos, consentimentos e permissões de acesso por caso." },
      { property: "og:title", content: "Privacidade e documentos — Clube Ancestral" },
      { property: "og:description", content: "Documentos, consentimentos e permissões de acesso por caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrivacidadeIndex,
});

function PrivacidadeIndex() {
  const carregar = useServerFn(listarClientesECasos);
  const q = useQuery({ queryKey: ["privacidade", "vinculos"], queryFn: () => carregar() });
  const casos = q.data?.casos ?? [];

  return (
    <SaasShell
      titulo="Privacidade e documentos"
      descricao="Escolha um caso para gerir documentos, consentimentos e permissões."
    >
      <Painel titulo="Casos">
        {q.isLoading && <p className="text-sm text-navy/60">Carregando casos…</p>}
        {q.error && <p className="text-sm text-terracotta">{(q.error as Error).message}</p>}
        <div className="space-y-2">
          {casos.map((c: Record<string, unknown>) => (
            <Link
              key={c["id"] as string}
              to="/privacidade/$id"
              params={{ id: c["id"] as string }}
              className="block rounded-xl border border-navy/10 bg-white p-3 hover:border-navy/30"
            >
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-sm">{String(c["codigo"] ?? "—")}</strong>
                <span className="text-sm text-navy/70">{String(c["titulo"] ?? "")}</span>
                <Selo texto={String(c["status"] ?? "—")} tom={c["status"] === "ativo" ? "ok" : "neutro"} />
              </div>
            </Link>
          ))}
          {q.data && casos.length === 0 && <p className="text-sm text-navy/60">Nenhum caso disponível.</p>}
        </div>
      </Painel>
    </SaasShell>
  );
}
