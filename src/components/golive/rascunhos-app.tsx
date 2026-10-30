/**
 * Rascunhos do App Cliente (03/10/2026) — pedido literal da Proprietária:
 * "veja se temos um campo que podemos editar o texto antes de ser publicado
 * sempre com persistência universal... no futuro tudo terá que ser revisado
 * com copy da marca".
 *
 * Não tínhamos: a publicação era um ato único, de uma caixa de texto que não
 * guardava nada. Agora o texto é gravado como rascunho (grava → relê),
 * continua editável depois de recarregar a página, e a publicação é um
 * segundo ato explícito. Enquanto o texto não puder chegar ao cliente, o
 * motivo aparece aqui e o botão de publicar fica fechado — é o lugar onde a
 * revisão de copy da marca vai acontecer.
 */
import { useEffect, useState } from "react";
import { useCasoGoLive, useEscritorGoLive } from "@/components/golive/dados";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import {
  listarRascunhosProjecaoApp,
  publicarRascunhoProjecaoApp,
  salvarRascunhoProjecaoApp,
} from "@/lib/golive-escritores.functions";

const areaCls =
  "mt-1 w-full rounded-lg border border-navy/15 bg-white px-2.5 py-1.5 text-xs text-navy focus:border-gold focus:outline-none";

export function RascunhosApp() {
  const listar = useEscritorGoLive(listarRascunhosProjecaoApp);
  const salvar = useEscritorGoLive(salvarRascunhoProjecaoApp);
  const publicar = useEscritorGoLive(publicarRascunhoProjecaoApp);

  const casoRascunhos = useCasoGoLive();
  const q = useQuery({ queryKey: ["rascunhos-app", casoRascunhos ?? "caso-canonico"], queryFn: () => listar({}), retry: false });
  const [textos, setTextos] = useState<Record<string, string>>({});

  // O que vem do servidor é a verdade; a edição local só sobrepõe depois que
  // a pessoa digita. Recarregar a página mostra o rascunho persistido.
  useEffect(() => {
    if (!q.data) return;
    setTextos((atual) => {
      const novo = { ...atual };
      for (const r of q.data) if (novo[r.id] === undefined) novo[r.id] = r.conteudo;
      return novo;
    });
  }, [q.data]);

  const mSalvar = useMutation({
    mutationFn: (id: string) => salvar({ data: { id, resumoSanitizado: textos[id] ?? "" } }),
    onSuccess: (r) => {
      toast.success(
        r.recusa ? "Rascunho salvo. Ainda não pode ir ao cliente — veja o motivo abaixo." : "Rascunho salvo.",
      );
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mPublicar = useMutation({
    mutationFn: (id: string) => publicar({ data: { id } }),
    onSuccess: () => {
      toast.success("Publicado no App do cliente.");
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rascunhos = q.data ?? [];

  return (
    <section className="space-y-3 rounded-xl border border-gold/40 bg-gold/5 p-3" data-rascunhos-app>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Rascunhos para o App</h3>
        <span className="text-[11px] text-navy/55">Editável e persistido · publicar é um segundo passo</span>
      </div>

      {q.isLoading ? <p className="text-xs text-navy/60">Carregando rascunhos…</p> : null}
      {q.error ? (
        <p role="alert" className="text-xs text-terracotta">
          Não foi possível carregar os rascunhos: {(q.error as Error).message}
        </p>
      ) : null}
      {!q.isLoading && !q.error && rascunhos.length === 0 ? (
        <p className="text-xs text-navy/70">
          Nenhum rascunho aguardando revisão. Um texto salvo em “Escrever para a família” aparece aqui até ser publicado.
        </p>
      ) : null}

      <ul className="space-y-3">
        {rascunhos.map((r) => (
          <li key={r.id} className="rounded-lg border border-navy/10 bg-white/70 p-2">
            <p className="text-[11px] uppercase tracking-wide text-navy/45">{r.tipo}</p>
            <textarea
              className={areaCls}
              rows={3}
              value={textos[r.id] ?? ""}
              onChange={(e) => setTextos({ ...textos, [r.id]: e.target.value })}
              aria-invalid={Boolean(r.recusa)}
            />
            {r.recusa ? (
              <div role="alert" className="mt-1 space-y-0.5 text-[11px] text-terracotta">
                <p className="font-medium">{r.recusa.motivo}</p>
                <p className="text-navy/70">{r.recusa.comoCorrigir}</p>
              </div>
            ) : (
              <p className="mt-1 text-[11px] text-navy/55">Este texto pode ir ao cliente.</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={mSalvar.isPending || (textos[r.id] ?? "").trim().length === 0}
                onClick={() => mSalvar.mutate(r.id)}
                className="rounded-lg border border-navy/20 px-2.5 py-1 text-[11px] text-navy disabled:opacity-60"
              >
                {mSalvar.isPending ? "Salvando…" : "Salvar rascunho"}
              </button>
              <button
                type="button"
                disabled={Boolean(r.recusa) || mPublicar.isPending || (textos[r.id] ?? "") !== r.conteudo}
                onClick={() => mPublicar.mutate(r.id)}
                className="rounded-lg bg-navy px-2.5 py-1 text-[11px] text-cream disabled:opacity-60"
                title={
                  r.recusa
                    ? "Corrija o texto antes de publicar."
                    : (textos[r.id] ?? "") !== r.conteudo
                      ? "Salve a edição antes de publicar — publica-se o que está gravado."
                      : undefined
                }
              >
                {mPublicar.isPending ? "Publicando…" : "Publicar no App"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
