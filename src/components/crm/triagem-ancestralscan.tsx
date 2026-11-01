/**
 * P10 (25/09/2026) — Camada B item 3 + Camada C: resumo de contexto da
 * triagem AncestralScan (se o lead veio dela) e sugestões explicáveis de
 * trilha, para a Mesa Discovery. Nunca um veredito: só o que a pessoa
 * declarou, mais os sinais que levaram a cada sugestão. Some por completo
 * quando o lead não tem `scan_triagem_id` — a maioria dos leads.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import {
  aceitarSugestaoDeTrilha,
  lerTriagemDoLead,
  listarSugestoesTrilha,
  rejeitarSugestaoDeTrilha,
} from "@/lib/ancestralscan-triagem.functions";
import type { TrilhaAtiva } from "@/lib/ancestralscan-triagem";

const CARTAO = "rounded-xl border border-navy/10 bg-cream/40 p-4";

export function TriagemAncestralScanDoLead({
  leadId,
  trilhasAtivas,
  trilhaJaEscolhida,
}: {
  leadId: string;
  trilhasAtivas: readonly TrilhaAtiva[];
  trilhaJaEscolhida: boolean;
}) {
  const carregarTriagem = useServerFn(lerTriagemDoLead);
  const qTriagem = useQuery({
    queryKey: ["triagem-ancestralscan-lead", leadId],
    queryFn: () => carregarTriagem({ data: { leadId } }),
    retry: false,
  });

  const carregarSugestoes = useServerFn(listarSugestoesTrilha);
  const qSugestoes = useQuery({
    queryKey: ["sugestoes-trilha-scan", leadId],
    queryFn: () => carregarSugestoes({ data: { leadId, trilhasAtivas } }),
    enabled: Boolean(qTriagem.data?.existe),
    retry: false,
  });

  const qc = useQueryClient();
  const aceitarFn = useServerFn(aceitarSugestaoDeTrilha);
  const aceitar = useMutation({
    mutationFn: (trackId: string) => aceitarFn({ data: { leadId, trackId } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sugestoes-trilha-scan", leadId] });
      void qc.invalidateQueries({ queryKey: ["lead-desk", leadId] });
    },
    // Laudo #189, primeiro corte (27/10/2026): mutation sem onError era
    // indistinguível de "nada salva" — o clique recusava em silêncio.
    onError: (e: Error) => toast.error(e.message),
  });
  const rejeitarFn = useServerFn(rejeitarSugestaoDeTrilha);
  const rejeitar = useMutation({
    mutationFn: (input: { trackId: string; motivo: string }) =>
      rejeitarFn({ data: { leadId, ...input } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["sugestoes-trilha-scan", leadId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  if (qTriagem.isLoading) return null;
  if (!qTriagem.data?.existe) return null;
  const triagem = qTriagem.data.triagem;

  return (
    <div className={CARTAO} data-triagem-ancestralscan>
      <p className="text-xs font-medium uppercase tracking-wide text-navy/60">
        Contexto declarado no AncestralScan
      </p>
      <p className="mt-1 text-[11px] text-navy/50">
        Orientativo — declarado pela pessoa, não confirma elegibilidade, via ou direito.
      </p>
      <dl className="mt-2 grid gap-1 text-xs text-navy">
        <div>
          <dt className="inline font-medium">País(es) declarado(s): </dt>
          <dd className="inline">{triagem.paisesDeclarados.join(", ") || "não informado"}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Geração declarada: </dt>
          <dd className="inline">{triagem.geracaoDeclarada ?? "não informada"}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Documentos declarados: </dt>
          <dd className="inline">{triagem.documentosDeclarados.join(", ") || "nenhum"}</dd>
        </div>
        {triagem.alertasPublicos.length ? (
          <div>
            <dt className="inline font-medium">Alertas públicos do Scan: </dt>
            <dd className="inline">{triagem.alertasPublicos.join(", ")}</dd>
          </div>
        ) : null}
      </dl>

      {qSugestoes.data?.sugestoes.length ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-navy/60">
            Sugestão de trilha (explicável, não é veredito)
          </p>
          {qSugestoes.data.sugestoes.map((s) => (
            <div key={s.trackId} className="rounded-lg border border-navy/10 bg-white p-2 text-xs">
              <p className="font-medium text-navy">
                {s.pais} {s.via ? `· ${s.via}` : ""} —{" "}
                <span className="text-navy/60">{s.estado}</span>
              </p>
              <p className="mt-1 text-navy/70">Sinais: {s.sinais.join("; ")}</p>
              {s.perguntasFaltantes.length ? (
                <p className="mt-1 text-navy/70">
                  Perguntas ainda em aberto: {s.perguntasFaltantes.join("; ")}
                </p>
              ) : null}
              {trilhaJaEscolhida ? (
                <p className="mt-2 text-navy/50">
                  Lead já tem trilha escolhida — sugestão não sobrescreve.
                </p>
              ) : (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => aceitar.mutate(s.trackId)}
                    disabled={aceitar.isPending}
                    className="rounded bg-navy px-2 py-1 text-cream"
                  >
                    Aplicar esta trilha
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const motivo = window.prompt("Motivo da rejeição:") ?? "";
                      if (motivo.trim())
                        rejeitar.mutate({ trackId: s.trackId, motivo: motivo.trim() });
                    }}
                    disabled={rejeitar.isPending}
                    className="rounded border border-navy/30 px-2 py-1 text-navy"
                  >
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
