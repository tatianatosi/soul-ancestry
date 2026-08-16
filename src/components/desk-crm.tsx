import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  alternarTarefa,
  alternarVisibilidadeEntrega,
  getCrmCaso,
  listCrmCasos,
  publicarCanvas,
  registrarTouchpoint,
} from "@/lib/crm.functions";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Eye, EyeOff, Link2, MessageSquare, Radio } from "lucide-react";

const CANAIS = ["whatsapp", "call", "discovery", "transcricao", "outro"] as const;

const CANAL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  call: "Call",
  discovery: "Discovery",
  transcricao: "Transcrição",
  outro: "Outro",
};

function horasDesde(iso?: string | null) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 36e5);
}

export function DeskCrm() {
  const listar = useServerFn(listCrmCasos);
  const qc = useQueryClient();
  const [caseId, setCaseId] = useState<string | null>(null);

  const overview = useQuery({ queryKey: ["crm", "casos"], queryFn: () => listar() });

  const casos = overview.data?.casos ?? [];
  const sla = overview.data?.sla ?? [];
  const ativo = caseId ?? casos[0]?.case_id ?? null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl italic text-navy">CRM vivo</h1>
        <p className="mt-1 text-sm text-navy/70">
          Base conectada: casos, touchpoints (WhatsApp, calls, discovery e transcrições),
          microentregas, Planner e SLA.
        </p>
      </header>

      {overview.isLoading && <p className="text-sm text-navy/60">Carregando base…</p>}
      {overview.isError && (
        <p className="text-sm text-terracotta">Não foi possível ler a base do CRM agora.</p>
      )}

      {sla.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sla.map((r) => (
            <div key={r.chave} className="rounded-xl border border-border bg-white p-3">
              <div className="text-[11px] uppercase tracking-wide text-navy/55">SLA</div>
              <div className="font-medium text-navy">{r.rotulo}</div>
              <div className="mt-1 font-serif text-2xl text-navy">{r.horas_alvo}h</div>
              {r.descricao && <p className="mt-1 text-[11px] text-navy/60">{r.descricao}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-cream/60 text-[11px] uppercase tracking-wide text-navy/60">
            <tr>
              {["Cliente", "País / via", "Situação", "Touchpoints", "Planner", "Entregas", "Canvas"].map((h) => (
                <th key={h} className="p-2 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {casos.map((c) => {
              const h = horasDesde(c.ultimo_touchpoint);
              return (
                <tr
                  key={c.id}
                  onClick={() => setCaseId(c.case_id)}
                  className={cn(
                    "cursor-pointer border-t border-border/70 transition hover:bg-cream/50",
                    ativo === c.case_id && "bg-gold/10",
                  )}
                >
                  <td className="p-2 font-medium text-navy">{c.cliente_nome}</td>
                  <td className="p-2 text-navy/70">
                    {c.pais ?? "—"} · {c.via ?? "—"}
                  </td>
                  <td className="p-2 text-navy/70">{c.status ?? "—"}</td>
                  <td className="p-2 text-navy/70">
                    {c.touchpoints}
                    {h != null && <span className="ml-1 text-[11px] text-navy/50">(há {h}h)</span>}
                  </td>
                  <td className="p-2 text-navy/70">
                    {c.tarefas_abertas} abertas
                    {c.tarefas_alta > 0 && (
                      <span className="ml-1 rounded-full bg-terracotta/15 px-2 py-0.5 text-[11px] text-terracotta">
                        {c.tarefas_alta} alta
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-navy/70">
                    {c.entregas_visiveis}/{c.entregas_total} visíveis
                  </td>
                  <td className="p-2 text-navy/70">
                    {c.canvas_publicado ? (
                      <span className="text-sage">publicado</span>
                    ) : (
                      <span className="text-navy/45">não publicado</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {ativo && <CasoCrm caseId={ativo} onChanged={() => qc.invalidateQueries({ queryKey: ["crm"] })} />}
    </div>
  );
}

function CasoCrm({ caseId, onChanged }: { caseId: string; onChanged: () => void }) {
  const carregar = useServerFn(getCrmCaso);
  const qc = useQueryClient();
  const detalhe = useQuery({
    queryKey: ["crm", "caso", caseId],
    queryFn: () => carregar({ data: { caseId } }),
  });

  const novoTouchpoint = useServerFn(registrarTouchpoint);
  const alternar = useServerFn(alternarTarefa);
  const alternarEntrega = useServerFn(alternarVisibilidadeEntrega);
  const publicar = useServerFn(publicarCanvas);

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ["crm", "caso", caseId] });
    onChanged();
  };

  const mTouchpoint = useMutation({ mutationFn: novoTouchpoint, onSuccess: invalidar });
  const mTarefa = useMutation({ mutationFn: alternar, onSuccess: invalidar });
  const mEntrega = useMutation({ mutationFn: alternarEntrega, onSuccess: invalidar });
  const mCanvas = useMutation({ mutationFn: publicar, onSuccess: invalidar });

  const [canal, setCanal] = useState<string>("whatsapp");
  const [resumo, setResumo] = useState("");
  const [transcricao, setTranscricao] = useState("");

  const d = detalhe.data;
  const etapas = useMemo(() => {
    const g: Record<string, typeof d extends null ? never : NonNullable<typeof d>["tarefas"]> = {};
    for (const t of d?.tarefas ?? []) (g[t.etapa ?? "outros"] ??= []).push(t);
    return g;
  }, [d]);

  if (detalhe.isLoading) return <p className="text-sm text-navy/60">Carregando caso…</p>;
  if (!d) return <p className="text-sm text-navy/60">Caso não encontrado na base.</p>;

  const canvasUrl =
    typeof window !== "undefined" ? `${window.location.origin}/canvas/${d.caso.canvas_token}` : "";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-xl border border-border bg-white p-4">
        <h2 className="font-serif text-xl text-navy">{d.caso.cliente_nome}</h2>
        <p className="mt-1 text-[12px] text-navy/65">
          {d.caso.produto_nome ?? "Produto a definir"} · responsável {d.caso.responsavel ?? "—"}
        </p>

        <div className="mt-4 rounded-lg border border-gold/40 bg-gold/10 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-navy">
            <Link2 className="h-4 w-4" /> Canvas isolado do cliente
          </div>
          <p className="mt-1 break-all text-[11px] text-navy/70">{canvasUrl}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => mCanvas.mutate({ data: { caseId, publicado: !d.caso.canvas_publicado } })}
              className="rounded-full bg-navy px-3 py-1 text-[12px] text-cream"
            >
              {d.caso.canvas_publicado ? "Despublicar" : "Publicar Canvas"}
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(canvasUrl)}
              className="rounded-full border border-navy/25 px-3 py-1 text-[12px] text-navy"
            >
              Copiar link
            </button>
          </div>
        </div>

        <h3 className="mt-5 flex items-center gap-2 font-serif text-lg text-navy">
          <MessageSquare className="h-4 w-4" /> Touchpoints
        </h3>
        <ul className="mt-2 space-y-2">
          {d.touchpoints.map((t) => (
            <li key={t.id} className="rounded-lg border border-border bg-cream/40 p-2.5 text-sm text-navy">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-navy/55">
                <span>{CANAL_LABEL[t.canal] ?? t.canal}</span>
                <span>{new Date(t.ocorrido_em).toLocaleDateString("pt-BR")}</span>
              </div>
              <p className="mt-1">{t.resumo ?? "—"}</p>
              {t.transcricao && (
                <p className="mt-1 text-[12px] italic text-navy/65">{t.transcricao}</p>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-2 rounded-lg border border-border p-3">
          <div className="flex flex-wrap gap-1">
            {CANAIS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCanal(c)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px]",
                  canal === c ? "border-gold bg-gold/20 text-navy" : "border-navy/20 text-navy/65",
                )}
              >
                {CANAL_LABEL[c]}
              </button>
            ))}
          </div>
          <input
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            placeholder="Resumo do contato"
            className="w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
          <textarea
            value={transcricao}
            onChange={(e) => setTranscricao(e.target.value)}
            placeholder="Transcrição ou notas (opcional)"
            className="h-20 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
          <button
            type="button"
            disabled={!resumo.trim() || mTouchpoint.isPending}
            onClick={() =>
              mTouchpoint.mutate(
                { data: { caseId, canal, resumo, transcricao: transcricao || undefined } },
                {
                  onSuccess: () => {
                    setResumo("");
                    setTranscricao("");
                  },
                },
              )
            }
            className="rounded-full bg-navy px-3 py-1.5 text-[12px] text-cream disabled:opacity-40"
          >
            Registrar touchpoint
          </button>
        </div>
      </section>

      <section className="space-y-5">
        <div className="rounded-xl border border-border bg-white p-4">
          <h3 className="flex items-center gap-2 font-serif text-lg text-navy">
            <Radio className="h-4 w-4" /> Microentregas
          </h3>
          <ul className="mt-2 space-y-2">
            {d.microentregas.map((m) => (
              <li
                key={m.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border bg-cream/40 p-2.5 text-sm text-navy"
              >
                <div>
                  <div className="font-medium">{m.titulo}</div>
                  <div className="text-[11px] text-navy/60">
                    {m.descricao} · {m.status}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => mEntrega.mutate({ data: { id: m.id, visivel: !m.visivel_cliente } })}
                  className="shrink-0 rounded-full border border-navy/20 p-1.5"
                  title={m.visivel_cliente ? "Ocultar do cliente" : "Liberar ao cliente"}
                >
                  {m.visivel_cliente ? (
                    <Eye className="h-4 w-4 text-sage" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-navy/45" />
                  )}
                </button>
              </li>
            ))}
            {d.microentregas.length === 0 && (
              <li className="text-[12px] text-navy/60">Nenhuma microentrega registrada.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <h3 className="font-serif text-lg text-navy">Planner</h3>
          {Object.entries(etapas).map(([etapa, tarefas]) => (
            <div key={etapa} className="mt-3">
              <div className="text-[11px] uppercase tracking-wide text-navy/55">{etapa}</div>
              <ul className="mt-1 space-y-1">
                {tarefas.map((t) => {
                  const feita = t.status === "concluida";
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => mTarefa.mutate({ data: { id: t.id, concluida: !feita } })}
                        className="flex w-full items-start gap-2 rounded-lg border border-border bg-cream/40 p-2 text-left text-sm text-navy"
                      >
                        {feita ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-navy/30" />
                        )}
                        <span className={cn(feita && "line-through opacity-60")}>
                          {t.titulo}
                          {t.prioridade === "alta" && !feita && (
                            <span className="ml-1 text-[11px] text-terracotta">· alta</span>
                          )}
                          {t.observacao && (
                            <span className="block text-[11px] italic text-navy/60">{t.observacao}</span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
