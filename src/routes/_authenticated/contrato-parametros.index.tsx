/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Painel, Selo } from "@/components/comercial/base";
import { SaasShell } from "@/components/saas/shell";
import { garantirParametros, listarParametros } from "@/lib/contrato-parametros.functions";

const TITULO = "Motor contratual parametrizável | Clube Ancestral";
const DESCRICAO =
  "Registro mestre por caso: parâmetros com origem rastreável que geram contrato, anexos, assinatura e cobrança sem redigitação.";

export const Route = createFileRoute("/_authenticated/contrato-parametros/")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const carregar = useServerFn(listarParametros);
  const garantir = useServerFn(garantirParametros);
  const navigate = useNavigate();

  const q = useQuery({ queryKey: ["contrato-parametros", "lista"], queryFn: () => carregar() });
  const m = useMutation({
    mutationFn: (caseId: string) => garantir({ data: { caseId } }),
    onSuccess: (r: any) => navigate({ to: "/contrato-parametros/$id", params: { id: r.id } }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <SaasShell titulo="Motor contratual — dados parametrizáveis">
      <Painel titulo="Como funciona">
        <p className="text-sm text-navy/75">
          Cada caso real tem um único registro mestre. Os parâmetros são preenchidos uma vez, com origem declarada, e
          alimentam contrato, anexos, assinatura, financeiro e ativação. Nenhum destino pede redigitação e nenhum dado de
          outro caso ou de demonstração é usado como preenchimento.
        </p>
      </Painel>

      <Painel titulo="Casos reais">
        {q.isLoading && <p className="text-sm text-navy/60">Carregando casos…</p>}
        {q.error && <p className="text-sm text-terracotta">{(q.error as Error).message}</p>}
        <div className="space-y-2">
          {(q.data?.casos ?? []).map((c: any) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/15 bg-white p-3">
              <div>
                <p className="text-sm font-medium text-navy">
                  {c.codigo} — {c.titulo}
                </p>
                <p className="text-xs text-navy/60">
                  {[c.pais, c.via].filter(Boolean).join(" / ") || "rota não declarada"} · status {c.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {c.parametros ? (
                  <>
                    <Selo texto={`${c.parametros.completude_pct}% completo`} tom={c.parametros.completude_pct === 100 ? "ok" : "alerta"} />
                    <Selo texto={c.parametros.status} tom={c.parametros.status === "assinado" ? "ok" : "neutro"} />
                    <Link
                      to="/contrato-parametros/$id"
                      params={{ id: c.parametros.id }}
                      className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream"
                    >
                      Abrir registro mestre
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => m.mutate(c.id)}
                    disabled={m.isPending}
                    className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80"
                  >
                    Criar registro mestre
                  </button>
                )}
              </div>
            </div>
          ))}
          {q.data && q.data.casos.length === 0 && (
            <p className="text-sm text-navy/60">Nenhum caso real nesta organização.</p>
          )}
        </div>
      </Painel>
    </SaasShell>
  );
}
