import { useMemo, useState } from "react";

import {
  EVENTOS_INTERNOS,
  ROTULO_EVENTO,
  executarCadeiaJornada,
  templatesVigentesPorEtapaCanal,
  type EventoInterno,
} from "@/lib/orquestracao-jornada";

/**
 * Painel contextual da Biblioteca de Mensagens (CA-OPS-02).
 *
 * Somente leitura: resolve, por evento canônico, a etapa, a tarefa canônica e o
 * template vigente já existente em `orquestracao-jornada.ts`. Não envia, não
 * persiste, não cria fila, touchpoint, rascunho, log, tarefa, alerta ou dado.
 * O único resultado é um preview interno para revisão e cópia manual.
 */
export function OrquestracaoContextual({ hoje }: { hoje?: string }) {
  const dia = hoje ?? new Date().toISOString().slice(0, 10);
  const [evento, setEvento] = useState<EventoInterno | "">("");

  const cadeia = useMemo(
    () =>
      evento
        ? executarCadeiaJornada({ hoje: dia, evento, caso_id: "contexto-biblioteca" })
        : null,
    [dia, evento],
  );
  const vigentes = useMemo(() => templatesVigentesPorEtapaCanal(dia), [dia]);
  const template = cadeia?.template.template ?? null;

  const preview = template
    ? [
        `Modelo: ${template.titulo} (v${cadeia?.template.versao ?? 1})`,
        `Etapa: ${template.etapa_jornada} · Canal previsto: ${template.canal_previsto}`,
        `Público elegível: ${template.publico_elegivel}`,
        `Finalidade: ${template.finalidade}`,
        "",
        "Sugestão interna — nenhum envio é realizado pelo sistema.",
      ].join("\n")
    : "";

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-foreground">Uso contextual por etapa e evento</h2>
          <p className="text-xs text-muted-foreground">
            Sugestão interna — nenhum envio é realizado pelo sistema. O modelo vigente é apenas
            exibido para revisão e cópia manual.
          </p>
        </div>
        <label className="text-xs text-muted-foreground">
          <span className="sr-only">Evento canônico</span>
          <select
            value={evento}
            onChange={(e) => setEvento(e.target.value as EventoInterno | "")}
            aria-label="Evento canônico"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Selecione um evento canônico</option>
            {EVENTOS_INTERNOS.map((ev) => (
              <option key={ev} value={ev}>
                {ROTULO_EVENTO[ev]}
              </option>
            ))}
          </select>
        </label>
      </header>

      {!cadeia ? (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
          Nenhum evento selecionado. Escolha um evento canônico para ver o modelo vigente sugerido.
          Nenhum dado de caso é carregado neste painel.
        </p>
      ) : (
        <>
          <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Etapa da jornada</dt>
              <dd className="text-foreground">{template?.etapa_jornada ?? "Sem etapa associada"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tarefa canônica sugerida</dt>
              <dd className="text-foreground">
                {cadeia.plano.tarefaSugerida ?? "Nenhuma tarefa nova para este evento"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Modelo vigente</dt>
              <dd className="text-foreground">
                {template
                  ? `${template.titulo} (v${cadeia.template.versao ?? 1} · ${template.canal_previsto})`
                  : cadeia.template.motivo}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Público elegível</dt>
              <dd className="text-foreground">{template?.publico_elegivel ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Regra de bloqueio</dt>
              <dd className="text-foreground">{template?.regra_de_bloqueio ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Resultado possível</dt>
              <dd className="text-foreground">
                Preview interno para revisão humana. Envio externo permanece desligado.
              </dd>
            </div>
          </dl>

          {template ? (
            <div className="mt-4 space-y-2">
              <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-xs text-foreground">
                {preview}
              </pre>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(preview).catch(() => undefined);
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted"
              >
                Copiar preview interno
              </button>
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
              Nenhum modelo vigente aplicável a este evento. Nada é sugerido, criado ou enviado.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <a
              href={cadeia.plano.objetoCanonico}
              className="rounded-lg border border-border px-3 py-1.5 text-foreground hover:bg-muted"
            >
              Abrir objeto canônico ({cadeia.plano.objetoCanonico})
            </a>
            <span className="text-muted-foreground">
              {vigentes.length} modelos vigentes por etapa × canal × evento.
            </span>
          </div>
        </>
      )}
    </section>
  );
}
