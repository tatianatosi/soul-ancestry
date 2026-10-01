/**
 * Corte 3a (01/10/2026) — "Publicar plano no App" (Desk). A equipe escreve o
 * nome do plano, a situação e a vigência que o cliente vê na aba Conta.
 * O servidor recusa preço, parcela, SKU e dado interno. Confirmações inline.
 */
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { SITUACOES_PLANO } from "@/lib/plano-publicacao";
import {
  despublicarPlanoDoApp,
  listarPlanoDoCaso,
  publicarPlanoNoApp,
} from "@/lib/plano-publicacao.functions";

export function PublicarPlanoApp({ caseId }: { caseId: string }) {
  const listar = useServerFn(listarPlanoDoCaso);
  const publicar = useServerFn(publicarPlanoNoApp);
  const despublicar = useServerFn(despublicarPlanoDoApp);
  const q = useQuery({ queryKey: ["plano-app", caseId], queryFn: () => listar({ data: { caseId } }), retry: false });

  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [situacao, setSituacao] = useState<string>("ativo");
  const [vigencia, setVigencia] = useState("");
  const [retirando, setRetirando] = useState(false);
  const [motivo, setMotivo] = useState("");

  const mPublicar = useMutation({
    mutationFn: () => publicar({ data: { caseId, nomeComercial: nome, situacao, vigencia } }),
    onSuccess: () => {
      toast.success("Plano publicado na Conta do App.");
      setAberto(false);
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mDespublicar = useMutation({
    mutationFn: () => despublicar({ data: { caseId, projecaoId: q.data!.id, motivo } }),
    onSuccess: () => {
      toast.success("Plano retirado do App.");
      setRetirando(false);
      setMotivo("");
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="space-y-2 rounded-xl border border-gold/40 bg-gold/5 p-3" data-publicar-plano-app>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Publicar plano no App</h3>
        <span className="text-[11px] text-navy/55">Nome, situação e vigência — nunca preço, parcela ou SKU</span>
      </div>

      <p className="text-xs text-navy/75">
        {q.isLoading
          ? "Carregando…"
          : q.data
            ? `No App: “${q.data.conteudo}”${q.data.publicadoEm ? ` · desde ${new Date(q.data.publicadoEm).toLocaleDateString("pt-BR")}` : ""}`
            : "Nenhum plano publicado para este cliente ainda."}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            const [n, , v] = (q.data?.conteudo ?? "").split(" · ");
            setNome(n ?? "");
            setVigencia(v ?? "");
            setAberto((a) => !a);
          }}
          className="rounded border border-navy/20 px-2 py-1 text-xs hover:bg-cream/60"
        >
          {q.data ? "Editar no App" : "Publicar plano"}
        </button>
        {q.data ? (
          <button
            type="button"
            onClick={() => setRetirando((v) => !v)}
            className="rounded border border-terracotta/40 px-2 py-1 text-xs text-terracotta"
          >
            Retirar do App
          </button>
        ) : null}
      </div>

      {aberto ? (
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <label className="block">
            <span className="text-[11px] text-navy/60">Nome do plano (como o cliente lê)</span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 w-full rounded border border-navy/20 bg-cream/40 px-2 py-1 text-xs"
            />
          </label>
          <label className="block">
            <span className="text-[11px] text-navy/60">Situação</span>
            <select
              value={situacao}
              onChange={(e) => setSituacao(e.target.value)}
              className="mt-1 w-full rounded border border-navy/20 bg-cream/40 px-2 py-1 text-xs"
            >
              {SITUACOES_PLANO.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] text-navy/60">Vigência (opcional)</span>
            <input
              value={vigencia}
              onChange={(e) => setVigencia(e.target.value)}
              placeholder="ex.: até dezembro de 2026"
              className="mt-1 w-full rounded border border-navy/20 bg-cream/40 px-2 py-1 text-xs"
            />
          </label>
          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              type="button"
              disabled={mPublicar.isPending || nome.trim().length < 3}
              onClick={() => mPublicar.mutate()}
              className="rounded bg-navy px-3 py-1 text-xs text-cream disabled:opacity-40"
            >
              {mPublicar.isPending ? "Publicando…" : "Confirmar publicação"}
            </button>
            <span className="text-[11px] text-navy/55">Preço e parcela são recusados pelo servidor.</span>
          </div>
        </div>
      ) : null}

      {retirando && q.data ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo (obrigatório)"
            className="min-w-[14rem] flex-1 rounded border border-navy/20 bg-cream/40 px-2 py-1 text-xs"
          />
          <button
            type="button"
            disabled={mDespublicar.isPending || motivo.trim().length < 5}
            onClick={() => mDespublicar.mutate()}
            className="rounded bg-terracotta px-3 py-1 text-xs text-cream disabled:opacity-40"
          >
            Confirmar retirada
          </button>
        </div>
      ) : null}
    </section>
  );
}
