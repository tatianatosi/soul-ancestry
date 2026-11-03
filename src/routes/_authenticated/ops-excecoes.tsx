import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { EstadoDados } from "@/components/saas/estado-dados";
import { SaasShell } from "@/components/saas/shell";
import { Campo, Selo, inputCls } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { Indicador } from "@/components/prancha-v4/kit";
import { listarExcecoes, referenciasOps, registrarExcecao } from "@/lib/ops.functions";
import { TIPOS_EXCECAO } from "@/lib/ops.server";
import { cn } from "@/lib/utils";
import { semFixtures } from "@/lib/fixtures";

export const Route = createFileRoute("/_authenticated/ops-excecoes")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Exceções operacionais — Clube Ancestral" },
      {
        name: "description",
        content: "Autorizações excepcionais de operação: caso pausado, reabertura de caso e desbloqueios.",
      },
      { property: "og:title", content: "Exceções operacionais — Clube Ancestral" },
      { property: "og:description", content: "Autorizações excepcionais registradas e auditadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ExcecoesPage,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

function dataHora(v: unknown) {
  if (!v) return "—";
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
}

function ExcecoesPage() {
  const qc = useQueryClient();
  const fnListar = useServerFn(listarExcecoes);
  const fnRefs = useServerFn(referenciasOps);
  const fnRegistrar = useServerFn(registrarExcecao);

  const lista = useQuery({ queryKey: ["ops", "excecoes"], queryFn: () => fnListar() });
  const refs = useQuery({ queryKey: ["ops", "refs"], queryFn: () => fnRefs() });

  // Autoridade operacional (05/09/2026): o flag de admin do servidor deixou de
  // esconder o formulário de exceção. O formulário renderiza sempre; a
  // pendência de vínculo fica declarada na tela e o servidor revalida.
  const pendenciaAdmin =
    lista.data && !lista.data.ehAdmin
      ? "O servidor não reconhece seu vínculo como administrador — o registro de exceção segue disponível por decisão sua e é revalidado no servidor."
      : null;
  // A falha desta consulta já aparece em `falhaRefs`, com botão de nova
  // tentativa: a lista vazia aqui nunca substitui a mensagem de erro.
  const casos = (Array.isArray(refs.data?.casos) ? refs.data.casos : []) as Linha[];
  // V4-05: contagem real do histórico carregado; sem leitura, traço.
  const excecoesLidas = lista.data?.excecoes as Linha[] | undefined;
  const kpi = (contar: (l: Linha[]) => number) =>
    lista.isLoading ? "…" : lista.error || !excecoesLidas ? "—" : String(contar(excecoesLidas));
  const falhaRefs = refs.isError ? "Não foi possível carregar a lista de casos para vincular a exceção." : null;

  return (
    <SaasShell
      titulo="Exceções operacionais"
      descricao="Toda exceção exige motivo, autor e fica auditada. Sem exceção, o banco bloqueia a operação."
    >
      <div className="space-y-4">
        {pendenciaAdmin ? (
          <p className="rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
            Pendência registrada: {pendenciaAdmin}
          </p>
        ) : null}
        {falhaRefs ? (
          <p role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
            {falhaRefs}
            <button
              type="button"
              onClick={() => void refs.refetch()}
              className="rounded-md border border-terracotta/50 px-2 py-1 text-[11px] font-medium text-terracotta hover:bg-terracotta/10"
            >
              Tentar novamente
            </button>
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-excecoes-kpis-v4>
          <Indicador rotulo="Exceções registradas" valor={kpi((l) => l.length)} />
          <Indicador rotulo="Disponíveis" valor={kpi((l) => l.filter((e) => !e["consumida_em"]).length)} />
          <Indicador rotulo="Consumidas" valor={kpi((l) => l.filter((e) => e["consumida_em"]).length)} />
          <Indicador rotulo="Vinculadas a caso" valor={kpi((l) => l.filter((e) => e["crm_casos"]).length)} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
        <CaCard variante="compacto" titulo="Registrar exceção">
          <form
            onSubmit={async (ev) => {
              ev.preventDefault();
              const form = ev.currentTarget;
              const fd = new FormData(form);
              try {
                await fnRegistrar({
                  data: {
                    tipo: String(fd.get("tipo") ?? ""),
                    casoId: String(fd.get("casoId") ?? "") || undefined,
                    motivo: String(fd.get("motivo") ?? ""),
                    validoAte: String(fd.get("validoAte") ?? "") || undefined,
                  },
                });
                toast.success("Exceção autorizada e registrada em auditoria.");
                form.reset();
                qc.invalidateQueries({ queryKey: ["ops"] });
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            className="space-y-3"
          >
            <Campo rotulo="Tipo de exceção">
              <select name="tipo" required className={inputCls} defaultValue="">
                <option value="">Selecione…</option>
                {Object.entries(TIPOS_EXCECAO).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Caso">
              <select name="casoId" className={inputCls} defaultValue="">
                <option value="">Sem caso vinculado</option>
                {semFixtures(casos).map((c) => (
                  <option key={c["id"]} value={c["id"]}>
                    {c["codigo"]} — {c["titulo"]} ({c["status"]})
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Motivo (mínimo 10 caracteres)">
              <textarea name="motivo" required minLength={10} className={cn(inputCls, "h-24")} />
            </Campo>
            <Campo rotulo="Válida até">
              <input type="datetime-local" name="validoAte" className={inputCls} />
            </Campo>
            <button className="rounded-lg bg-navy px-4 py-2 text-sm text-cream">Autorizar exceção</button>
          </form>
        </CaCard>

        <CaCard variante="compacto" titulo="Histórico de exceções">
          <EstadoDados
            carregando={lista.isLoading}
            erro={lista.error}
            dados={lista.data?.excecoes as Linha[] | undefined}
            aoTentarNovamente={() => void lista.refetch()}
            recurso="o histórico de exceções"
            vazio="Consulta concluída: nenhuma exceção registrada."
          >
            {(excecoes) => (
              <div className="space-y-2">
                {excecoes.map((e) => (
                  <div key={e["id"]} className="rounded-xl border border-navy/10 bg-cream/40 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm">{TIPOS_EXCECAO[e["tipo"]] ?? e["tipo"]}</strong>
                      <Selo
                        texto={e["consumida_em"] ? "Consumida" : "Disponível"}
                        tom={e["consumida_em"] ? "neutro" : "alerta"}
                      />
                      {e["crm_casos"] && <Selo texto={String(e["crm_casos"]["codigo"])} />}
                    </div>
                    <p className="mt-1 text-sm">{e["motivo"]}</p>
                    <p className="text-xs text-navy/50">
                      Autorizada em {dataHora(e["autorizado_em"])} · válida até{" "}
                      {e["valido_ate"] ? dataHora(e["valido_ate"]) : "sem prazo"}
                      {e["consumida_em"] ? ` · usada em ${dataHora(e["consumida_em"])}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </EstadoDados>
        </CaCard>
        </div>
      </div>
    </SaasShell>
  );
}
