import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell } from "@/components/saas/shell";
import { EstadoDados } from "@/components/saas/estado-dados";
import { Selo } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { listarClientesECasos } from "@/lib/documentos.functions";
import { RegistroConsentimentos } from "@/components/privacidade/registro-consentimentos";

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

  // De-para id → rótulo, para o registro da organização nomear cliente e caso
  // sem nenhuma consulta nova: a lista de vínculos já está carregada aqui.
  const nomePorCliente: Record<string, string> = {};
  for (const c of (q.data?.clientes ?? []) as Record<string, unknown>[]) {
    nomePorCliente[String(c["id"])] = String(c["nome"] ?? "—");
  }
  const codigoPorCaso: Record<string, string> = {};
  for (const c of (q.data?.casos ?? []) as Record<string, unknown>[]) {
    codigoPorCaso[String(c["id"])] = String(c["codigo"] ?? c["titulo"] ?? "—");
  }

  return (
    <SaasShell
      titulo="Privacidade e documentos"
      descricao="Escolha um caso para gerir documentos, consentimentos e permissões."
    >
      <CaCard variante="compacto" titulo="Casos">
        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={q.data?.casos as Record<string, unknown>[] | undefined}
          aoTentarNovamente={() => void q.refetch()}
          recurso="os casos"
          vazio="Nenhum caso disponível."
        >
          {(casos) => (
        <div className="space-y-2">
          {casos.map((c: Record<string, unknown>) => (
            <div
              key={c["id"] as string}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy/10 bg-cream/40 p-3"
            >
              <Link
                to="/privacidade/$id"
                params={{ id: c["id"] as string }}
                className="min-w-0 flex-1 hover:opacity-90"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{String(c["codigo"] ?? "—")}</strong>
                  <span className="text-sm text-navy/70">{String(c["titulo"] ?? "")}</span>
                  <Selo texto={String(c["status"] ?? "—")} tom={c["status"] === "ativo" ? "ok" : "neutro"} />
                </div>
              </Link>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link
                  to="/casos/$caseId"
                  params={{ caseId: c["id"] as string }}
                  className="rounded-lg border border-navy/20 px-2 py-1 text-navy underline-offset-2 hover:underline"
                >
                  Caso 360
                </Link>
                {c["cliente_id"] ? (
                  <Link
                    to="/pessoas/$clienteId"
                    params={{ clienteId: String(c["cliente_id"]) }}
                    className="rounded-lg border border-gold/50 bg-gold/10 px-2 py-1 font-medium text-navy underline-offset-2 hover:underline"
                  >
                    Pessoa 360
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
          )}
        </EstadoDados>
      </CaCard>

      <div className="mt-4">
        <RegistroConsentimentos nomePorCliente={nomePorCliente} codigoPorCaso={codigoPorCaso} />
      </div>
    </SaasShell>
  );
}
