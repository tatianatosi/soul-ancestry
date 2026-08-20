/**
 * Visão Geral do caso — linha do tempo operacional como visão padrão.
 * Somente leitura: nenhuma ação externa é executada a partir daqui.
 */
import { montarLinhaDoTempo, rotuloEvento, faseDoEvento, type EventoTimeline } from "@/lib/timeline-caso";
import { STATUS_FILA_DRIVE } from "@/lib/drive-provisioning";
import { STATUS_PREPARACAO_BLUEPRINT } from "@/lib/blueprint";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

function data(v?: string | null): string {
  return v ? new Date(v).toLocaleDateString("pt-BR") : "—";
}

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-white p-5">
      <h2 className="mb-3 font-serif text-lg text-navy">{titulo}</h2>
      {children}
    </section>
  );
}

function Evento({ e }: { e: EventoTimeline }) {
  return (
    <li className="border-l-2 border-gold/60 pl-3">
      <p className="text-sm font-medium text-navy">
        {rotuloEvento(e.event_type)} — {e.title}
      </p>
      <p className="text-xs text-navy/55">
        Fase {e.phase ?? faseDoEvento(e.event_type)} · {e.status}
        {e.occurred_at ? ` · ocorrido em ${data(e.occurred_at)}` : ""}
        {e.due_at ? ` · previsto para ${data(e.due_at)}` : ""}
        {e.responsavel_nome ? ` · ${e.responsavel_nome}` : ""}
      </p>
      {e.summary_internal ? <p className="mt-1 text-xs text-navy/70">{e.summary_internal}</p> : null}
    </li>
  );
}

export function AbaVisaoGeral({
  caso,
  timeline,
  blueprint,
  filaDrive,
}: {
  caso: Linha;
  timeline: Linha[];
  blueprint: Linha[];
  filaDrive: Linha[];
}) {
  const eventos = timeline as EventoTimeline[];
  const t = montarLinhaDoTempo(eventos);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Cartao titulo="Passado registrado">
        {t.passado.length ? (
          <ul className="space-y-3">
            {t.passado.map((e, i) => (
              <Evento key={e.id ?? i} e={e} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-navy/55">Nenhum evento registrado ainda.</p>
        )}
      </Cartao>

      <Cartao titulo="Próximos marcos">
        {t.proximosMarcos.length ? (
          <ul className="space-y-3">
            {t.proximosMarcos.map((e, i) => (
              <Evento key={e.id ?? i} e={e} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-navy/55">Nenhum marco previsto.</p>
        )}
      </Cartao>

      <Cartao titulo="Bloqueios, responsável e próxima ação">
        <p className="text-sm text-navy">
          <span className="text-navy/55">Responsável principal:</span> {caso["responsavel_principal"] ?? "—"}
        </p>
        <p className="mt-1 text-sm text-navy">
          <span className="text-navy/55">Próxima ação:</span>{" "}
          {t.proximaAcao?.next_action ?? t.proximaAcao?.title ?? caso["proxima_acao"] ?? "—"}
        </p>
        <ul className="mt-3 space-y-2 text-sm text-navy/80">
          {t.bloqueios.length ? (
            t.bloqueios.map((e, i) => (
              <li key={e.id ?? i} className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2">
                {rotuloEvento(e.event_type)} — {e.title}
              </li>
            ))
          ) : (
            <li className="text-navy/55">Sem bloqueios registrados na linha do tempo.</li>
          )}
        </ul>
        {t.alertas.length ? (
          <ul className="mt-3 space-y-1 text-xs text-navy/70">
            {t.alertas.map((a, i) => (
              <li key={i}>⚠ {a}</li>
            ))}
          </ul>
        ) : null}
      </Cartao>

      <Cartao titulo="Blueprint e fila do Drive">
        <p className="text-xs uppercase tracking-wide text-navy/50">Ancestral Blueprint</p>
        {blueprint.length ? (
          <ul className="mt-1 space-y-1 text-sm text-navy/80">
            {blueprint.map((b) => (
              <li key={b["id"]}>
                Preparação: {STATUS_PREPARACAO_BLUEPRINT.find((s) => s.valor === b["status_preparacao"])?.rotulo ?? b["status_preparacao"]} ·
                origem do preço: {b["origem_preco"]} · valor: {b["preco_comercial_vigente"] ?? "—"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-navy/55">Nenhum Blueprint registrado para este caso.</p>
        )}

        <p className="mt-4 text-xs uppercase tracking-wide text-navy/50">Fila de provisionamento do Drive</p>
        {filaDrive.length ? (
          <ul className="mt-1 space-y-1 text-sm text-navy/80">
            {filaDrive.map((f) => (
              <li key={f["id"]}>
                {f["stage_trigger"]} → {STATUS_FILA_DRIVE.find((s) => s.valor === f["status"])?.rotulo ?? f["status"]}
                {f["external_result_reference"] ? ` · resultado: ${f["external_result_reference"]}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-navy/55">Nenhum item na fila. Nada é criado no Drive automaticamente.</p>
        )}
      </Cartao>
    </div>
  );
}
