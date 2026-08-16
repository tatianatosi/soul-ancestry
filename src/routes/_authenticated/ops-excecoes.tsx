import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { SaasShell } from "@/components/saas/shell";
import { Campo, Painel, Selo, inputCls } from "@/components/comercial/base";
import { listarExcecoes, referenciasOps, registrarExcecao } from "@/lib/ops.functions";
import { TIPOS_EXCECAO } from "@/lib/ops.server";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/ops-excecoes")({
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

  const ehAdmin = lista.data?.ehAdmin ?? false;
  const casos = (refs.data?.casos ?? []) as Linha[];

  return (
    <SaasShell
      titulo="Exceções operacionais"
      descricao="Toda exceção exige motivo, autor e fica auditada. Sem exceção, o banco bloqueia a operação."
    >
      <div className="space-y-4">
        {ehAdmin ? (
          <Painel titulo="Registrar exceção">
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
                  {casos.map((c) => (
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
          </Painel>
        ) : (
          <p className="rounded-xl border border-navy/15 bg-white p-4 text-sm text-navy/70">
            Somente a administração autoriza exceções operacionais. Abaixo, o histórico para consulta.
          </p>
        )}

        <Painel titulo="Histórico de exceções">
          {lista.isLoading && <p className="text-sm text-navy/60">Carregando…</p>}
          {lista.error && <p className="text-sm text-terracotta">{(lista.error as Error).message}</p>}
          <div className="space-y-2">
            {(lista.data?.excecoes ?? []).length === 0 && (
              <p className="text-sm text-navy/60">Nenhuma exceção registrada.</p>
            )}
            {(lista.data?.excecoes ?? []).map((e: Linha) => (
              <div key={e["id"]} className="rounded-xl border border-navy/10 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{TIPOS_EXCECAO[e["tipo"]] ?? e["tipo"]}</strong>
                  <Selo texto={e["consumida_em"] ? "Consumida" : "Disponível"} tom={e["consumida_em"] ? "neutro" : "alerta"} />
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
        </Painel>
      </div>
    </SaasShell>
  );
}
