/**
 * Corte 3c (03/10/2026) — "Publicar União de Ramos" (Desk). A equipe escolhe
 * as duas publicações que se encontram (a da história e a do processo) e
 * escreve a legenda que o cliente lê na aba Jornada.
 *
 * O vínculo é explícito, por id: o App nunca liga dois marcos por
 * proximidade de data, sobrenome em comum ou nome parecido. O servidor
 * recusa legenda com preço, SKU, nome técnico de fonte, URL ou dado
 * interno, e recusa ponta que não esteja publicada neste caso.
 */
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import {
  despublicarUniaoDeRamos,
  listarUniaoDeRamosDoCaso,
  publicarUniaoDeRamos,
} from "@/lib/uniao-ramos.functions";

const selectCls =
  "mt-1 w-full rounded-lg border border-navy/15 bg-white px-2.5 py-1.5 text-xs text-navy focus:border-gold focus:outline-none";

export function PublicarUniaoRamos({ caseId }: { caseId: string }) {
  const listar = useServerFn(listarUniaoDeRamosDoCaso);
  const publicar = useServerFn(publicarUniaoDeRamos);
  const despublicar = useServerFn(despublicarUniaoDeRamos);
  const q = useQuery({
    queryKey: ["uniao-ramos", caseId],
    queryFn: () => listar({ data: { caseId } }),
    retry: false,
  });

  const [historia, setHistoria] = useState("");
  const [processo, setProcesso] = useState("");
  const [legenda, setLegenda] = useState("");
  const [retirando, setRetirando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");

  const limpar = () => {
    setHistoria("");
    setProcesso("");
    setLegenda("");
  };

  const mPublicar = useMutation({
    mutationFn: () =>
      publicar({ data: { caseId, historiaProjecaoId: historia, casoProjecaoId: processo, legenda } }),
    onSuccess: () => {
      toast.success("União de Ramos publicada na Jornada do App.");
      limpar();
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mDespublicar = useMutation({
    mutationFn: (projecaoId: string) => despublicar({ data: { caseId, projecaoId, motivo } }),
    onSuccess: () => {
      toast.success("União de Ramos retirada do App.");
      setRetirando(null);
      setMotivo("");
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const candidatas = q.data?.candidatas ?? [];
  const unioes = q.data?.unioes ?? [];
  const rotulo = (id: string | null) => {
    const c = candidatas.find((x) => x.id === id);
    return c ? `${c.tipoRotulo} — ${c.conteudo.slice(0, 60)}` : "publicação não localizada";
  };

  return (
    <section className="space-y-3 rounded-xl border border-gold/40 bg-gold/5 p-3" data-publicar-uniao-ramos>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Publicar União de Ramos</h3>
        <span className="text-[11px] text-navy/55">Vínculo explícito entre duas publicações — nunca por data</span>
      </div>

      {q.isLoading ? <p className="text-xs text-navy/60">Carregando publicações do caso…</p> : null}
      {q.error ? (
        <p role="alert" className="text-xs text-terracotta">
          Não foi possível carregar as publicações deste caso: {(q.error as Error).message}
        </p>
      ) : null}

      {!q.isLoading && !q.error && candidatas.length < 2 ? (
        <p className="text-xs text-navy/70">
          A União de Ramos liga duas publicações já no App. Este caso tem {candidatas.length} publicação
          {candidatas.length === 1 ? "" : "ões"} — publique pelo menos duas (história e processo) para poder ligá-las.
        </p>
      ) : null}

      {unioes.length > 0 ? (
        <ul className="space-y-2">
          {unioes.map((u) => (
            <li key={u.id} className="rounded-lg border border-navy/10 bg-white/70 p-2 text-xs">
              <p className="text-navy/85">{u.legenda}</p>
              <p className="mt-1 text-[11px] text-navy/55">
                história: {rotulo(u.historiaProjecaoId)} · processo: {rotulo(u.casoProjecaoId)}
              </p>
              {retirando === u.id ? (
                <div className="mt-2 space-y-1.5">
                  <input
                    className={selectCls}
                    placeholder="Motivo para retirar do App (mínimo 5 letras)"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={motivo.trim().length < 5 || mDespublicar.isPending}
                      onClick={() => mDespublicar.mutate(u.id)}
                      className="rounded-lg bg-terracotta px-2.5 py-1 text-[11px] text-cream disabled:opacity-60"
                    >
                      {mDespublicar.isPending ? "Retirando…" : "Confirmar retirada"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRetirando(null);
                        setMotivo("");
                      }}
                      className="rounded-lg border border-navy/20 px-2.5 py-1 text-[11px] text-navy"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setRetirando(u.id)}
                  className="mt-2 rounded-lg border border-navy/20 px-2.5 py-1 text-[11px] text-navy"
                >
                  Retirar do App
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {candidatas.length >= 2 ? (
        <div className="grid gap-2 md:grid-cols-2">
          <label className="block text-xs text-navy/70">
            Publicação da história (pesquisa)
            <select className={selectCls} value={historia} onChange={(e) => setHistoria(e.target.value)}>
              <option value="">Escolha…</option>
              {candidatas
                .filter((c) => c.id !== processo)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.tipoRotulo} — {c.conteudo.slice(0, 70)}
                  </option>
                ))}
            </select>
          </label>
          <label className="block text-xs text-navy/70">
            Publicação do processo (jornada)
            <select className={selectCls} value={processo} onChange={(e) => setProcesso(e.target.value)}>
              <option value="">Escolha…</option>
              {candidatas
                .filter((c) => c.id !== historia)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.tipoRotulo} — {c.conteudo.slice(0, 70)}
                  </option>
                ))}
            </select>
          </label>
          <label className="block text-xs text-navy/70 md:col-span-2">
            Legenda da união (o cliente lê esta frase)
            <input
              className={selectCls}
              placeholder="Ex.: O registro de 1912 confirma o ramo investigado nesta etapa."
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="button"
              disabled={!historia || !processo || legenda.trim().length < 10 || mPublicar.isPending}
              onClick={() => mPublicar.mutate()}
              className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-60"
            >
              {mPublicar.isPending ? "Publicando…" : "Publicar união"}
            </button>
            <p className="mt-1 text-[11px] text-navy/55">
              A legenda não pode afirmar efeito jurídico nem concluir parentesco. Preço, SKU, nome técnico de fonte e
              endereço na internet são recusados pelo servidor.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
