import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  arquivarMarcoJornada,
  criarMarcoJornada,
  listarMarcosJornada,
  publicarMarcoJornada,
} from "@/lib/marcos-jornada.functions";

/** Curadoria dos marcos históricos da Jornada do App, dentro do Caso 360. */
export function MarcosJornadaDesk({ caseId }: { caseId: string }) {
  const qc = useQueryClient();
  const listar = useServerFn(listarMarcosJornada);
  const criar = useServerFn(criarMarcoJornada);
  const publicar = useServerFn(publicarMarcoJornada);
  const arquivar = useServerFn(arquivarMarcoJornada);
  const q = useQuery({ queryKey: ["marcos-jornada", caseId], queryFn: () => listar({ data: { caseId } }) });

  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [local, setLocal] = useState("");
  const [publicarAgora, setPublicarAgora] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const recarregar = () => qc.invalidateQueries({ queryKey: ["marcos-jornada", caseId] });
  const executar = async (fn: () => Promise<unknown>, ok: string) => {
    setOcupado(true);
    try {
      await fn();
      toast.success(ok);
      await recarregar();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar.");
      return false;
    } finally {
      setOcupado(false);
    }
  };

  const salvar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const ok = await executar(
      () => criar({ data: { caseId, titulo, data, local, publicar: publicarAgora } }),
      publicarAgora ? "Atualização publicada no App da cliente." : "Marco salvo como rascunho interno.",
    );
    if (ok) {
      setTitulo(""); setData(""); setLocal(""); setPublicarAgora(false); setAberto(false);
    }
  };

  const campo = "mt-1 w-full min-h-11 rounded-md border border-navy/20 bg-card px-3 text-sm text-navy";

  return (
    <section aria-label="Marcos da Jornada" className="rounded-lg border border-navy/15 bg-card p-4" data-marcos-jornada-desk>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif text-lg text-navy">Marcos da Jornada no App</h3>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="min-h-11 rounded-full bg-navy px-4 text-sm font-medium text-cream"
        >
          {aberto ? "Fechar" : "Novo marco da Jornada"}
        </button>
      </div>

      {aberto ? (
        <form onSubmit={salvar} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-navy/70 sm:col-span-2">Título do evento
            <input className={campo} value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={200} required />
          </label>
          <label className="text-xs text-navy/70">Data / ano
            <input className={campo} value={data} onChange={(e) => setData(e.target.value)} maxLength={40} placeholder="24/09/1895" required />
          </label>
          <label className="text-xs text-navy/70">Local / origem
            <input className={campo} value={local} onChange={(e) => setLocal(e.target.value)} maxLength={120} />
          </label>
          <fieldset className="sm:col-span-2">
            <legend className="text-xs text-navy/70">Estado</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {[{ v: false, r: "Rascunho interno" }, { v: true, r: "Publicado para a cliente" }].map((o) => (
                <button
                  key={o.r}
                  type="button"
                  aria-pressed={publicarAgora === o.v}
                  onClick={() => setPublicarAgora(o.v)}
                  className={`min-h-11 rounded-full border px-4 text-sm ${publicarAgora === o.v ? "border-gold bg-gold/15 text-navy" : "border-navy/20 text-navy/70"}`}
                >
                  {o.r}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-navy/60">
              Publicado aparece na Jornada do App. Depois de publicado, só pode ser arquivado (com motivo).
            </p>
          </fieldset>
          <p className="text-[11px] text-navy/60 sm:col-span-2">
            Documento comprobatório: o vínculo fica disponível quando houver arquivo enviado neste caso.
          </p>
          <div className="sm:col-span-2">
            <button type="submit" disabled={ocupado} className="min-h-11 rounded-full bg-navy px-5 text-sm font-medium text-cream disabled:opacity-60">
              {publicarAgora ? "Publicar marco" : "Salvar rascunho"}
            </button>
          </div>
        </form>
      ) : null}

      {q.isLoading ? (
        <p className="mt-3 text-sm text-navy/60">Carregando marcos…</p>
      ) : q.isError ? (
        <p className="mt-3 text-sm text-terracotta">
          Não foi possível ler os marcos.{" "}
          <button type="button" className="underline" onClick={() => void q.refetch()}>Tentar novamente</button>
        </p>
      ) : (q.data ?? []).length === 0 ? (
        <p className="mt-3 text-sm text-navy/60">Nenhum marco registrado neste caso.</p>
      ) : (
        <ul className="mt-3 divide-y divide-navy/10">
          {q.data!.map((m) => (
            <li key={m.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] ${m.estado === "publicado" ? "border-gold bg-gold/15 text-navy" : "border-navy/20 text-navy/70"}`}>
                  {m.estado === "publicado" ? "Publicado para a cliente" : "Rascunho interno"}
                </span>
                <p className="mt-1 break-words text-sm text-navy">{m.texto}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {m.estado === "rascunho" ? (
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => void executar(() => publicar({ data: { caseId, id: m.id } }), "Atualização publicada no App da cliente.")}
                    className="min-h-11 rounded-full bg-navy px-4 text-xs font-medium text-cream"
                  >
                    Publicar
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => {
                    const motivo = window.prompt("Motivo do arquivamento (fica no histórico):");
                    if (motivo?.trim()) void executar(() => arquivar({ data: { caseId, id: m.id, motivo } }), "Marco arquivado.");
                  }}
                  className="min-h-11 rounded-full border border-navy/20 px-4 text-xs text-navy"
                >
                  Arquivar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
