/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Selo } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { Indicador } from "@/components/prancha-v4/kit";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { EstadoDados } from "@/components/saas/estado-dados";
import { garantirParametros, listarParametros } from "@/lib/contrato-parametros.functions";

const TITULO = "Motor contratual parametrizável | Clube Ancestral";
const DESCRICAO =
  "Registro mestre por caso: parâmetros com origem rastreável que geram contrato, anexos, assinatura e cobrança sem redigitação.";

export const Route = createFileRoute("/_authenticated/contrato-parametros/")({
  staticData: { sitemap: false },
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
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "corrigir_condicao_comercial" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const carregar = useServerFn(listarParametros);
  const garantir = useServerFn(garantirParametros);
  const navigate = useNavigate();

  const q = useQuery({ queryKey: ["contrato-parametros", "lista"], queryFn: () => carregar() });
  const m = useMutation({
    mutationFn: (caseId: string) => garantir({ data: { caseId } }),
    onSuccess: (r: any) => navigate({ to: "/contrato-parametros/$id", params: { id: r.id } }),
    onError: (e: Error) => toast.error(e.message),
  });

  // V4-05: contagem real da lista carregada; sem lista, traço — nunca zero inventado.
  const casosLista = (q.data?.casos ?? []) as any[];
  const kpi = (n: number) => (q.isLoading ? "…" : q.error || q.data === undefined ? "—" : String(n));

  return (
    <SaasShell
      titulo="Motor contratual — dados parametrizáveis"
      descricao="Um registro mestre por caso real, com origem declarada de cada parâmetro."
    >
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4" data-parametros-kpis-v4>
        <Indicador rotulo="Casos reais" valor={kpi(casosLista.length)} />
        <Indicador rotulo="Com registro mestre" valor={kpi(casosLista.filter((c) => c.parametros).length)} />
        <Indicador rotulo="Sem registro mestre" valor={kpi(casosLista.filter((c) => !c.parametros).length)} />
        <Indicador
          rotulo="Parâmetros completos"
          valor={kpi(casosLista.filter((c) => c.parametros?.completude_pct === 100).length)}
        />
      </div>
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      <CaCard variante="compacto" titulo="Como funciona">
        <p className="text-sm text-navy/75">
          Cada caso real tem um único registro mestre. Os parâmetros são preenchidos uma vez, com origem declarada, e
          alimentam contrato, anexos, assinatura, financeiro e ativação. Nenhum destino pede redigitação e nenhum dado de
          outro caso ou de demonstração é usado como preenchimento.
        </p>
      </CaCard>

      <CaCard variante="compacto" titulo="Casos reais">
        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={q.data?.casos as any[] | undefined}
          aoTentarNovamente={() => void q.refetch()}
          recurso="os casos reais"
          vazio="Nenhum caso real nesta organização."
        >
          {(casos) => (
        <div className="space-y-2">
          {casos.map((c: any) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/15 bg-cream/40 p-3">
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
        </div>
          )}
        </EstadoDados>
      </CaCard>
    </SaasShell>
  );
}
