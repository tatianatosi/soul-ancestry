import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

import {
  EVENTOS_INTERNOS,
  ROTULO_EVENTO,
  executarCadeiaJornada,
  templatesVigentesPorEtapaCanal,
  type EventoInterno,
} from "@/lib/orquestracao-jornada";

/**
 * Painel contextual da Biblioteca de Mensagens (CA-OPS-01).
 *
 * Somente leitura: mostra, por evento canônico, a etapa, a tarefa canônica,
 * o template vigente sugerido e a rota de ação. Nada é enviado, agendado,
 * publicado ou persistido — a sugestão é sempre rascunho interno.
 */
export function OrquestracaoContextual({ hoje }: { hoje?: string }) {
  const dia = hoje ?? new Date().toISOString().slice(0, 10);
  const [evento, setEvento] = useState<EventoInterno>("lead_novo");

  const cadeia = useMemo(
    () => executarCadeiaJornada({ hoje: dia, evento, caso_id: "contexto-biblioteca" }),
    [dia, evento],
  );
  const vigentes = useMemo(() => templatesVigentesPorEtapaCanal(dia), [dia]);
  const template = cadeia.template.template;

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-foreground">Uso contextual por etapa e evento</h2>
          <p className="text-xs text-muted-foreground">
            Sugestão de modelo vigente para o evento interno. Nenhum envio, publicação ou cobrança é
            executado aqui.
          </p>
        </div>
        <label className="text-xs text-muted-foreground">
          <span className="sr-only">Evento canônico</span>
          <select
            value={evento}
            onChange={(e) => setEvento(e.target.value as EventoInterno)}
            aria-label="Evento canônico"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            {EVENTOS_INTERNOS.map((ev) => (
              <option key={ev} value={ev}>
                {ROTULO_EVENTO[ev]}
              </option>
            ))}
          </select>
        </label>
      </header>

      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Etapa da jornada</dt>
          <dd className="text-foreground">{template?.etapa_jornada ?? "Sem etapa associada"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tarefa canônica sugerida</dt>
          <dd className="text-foreground">{cadeia.plano.tarefaSugerida ?? "Nenhuma tarefa nova para este evento"}</dd>
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
            Rascunho interno para revisão humana. Envio externo permanece desligado.
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
        <Link
          to={cadeia.plano.objetoCanonico}
          className="rounded-lg border border-border px-3 py-1.5 text-foreground hover:bg-muted"
        >
          Abrir objeto canônico ({cadeia.plano.objetoCanonico})
        </Link>
        <span className="text-muted-foreground">
          {vigentes.length} modelos vigentes por etapa × canal × evento.
        </span>
      </div>
    </section>
  );
}
