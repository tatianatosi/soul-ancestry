import { useState } from "react";

import {
  descreverCadeia,
  detalharElo,
  proximaAcaoDoPainel,
  type EloDerivado,
  type EstadoElo,
} from "@/lib/cadeia-jornada-visao";
import type { EventoInterno, ResultadoCadeia } from "@/lib/orquestracao-jornada";

const ROTULO_ESTADO: Record<EstadoElo, string> = {
  concluido: "cumprido",
  pendente: "pendente",
  bloqueado: "bloqueado",
  nao_aplicavel: "não se aplica",
};

const CLASSE_ESTADO: Record<EstadoElo, string> = {
  concluido: "border-[hsl(var(--sucesso))] text-[hsl(var(--sucesso))]",
  pendente: "border-[hsl(var(--atencao))] text-[hsl(var(--atencao))]",
  bloqueado: "border-[hsl(var(--bloqueio))] text-[hsl(var(--bloqueio))]",
  nao_aplicavel: "border-border text-muted-foreground",
};

/**
 * Cadeia canônica da jornada em 11 elos, somente leitura.
 * Não envia, não publica, não persiste: apenas explica o estado derivado.
 */
export function CadeiaJornada({
  resultado,
  evento,
}: {
  resultado: ResultadoCadeia;
  evento: EventoInterno;
}) {
  const elos = descreverCadeia(resultado, { evento });
  const proxima = proximaAcaoDoPainel(resultado, elos);
  const [aberto, setAberto] = useState<EloDerivado | null>(null);
  const detalhe = aberto ? detalharElo(resultado, aberto) : null;

  return (
    <section className="mt-6 border-t border-border pt-4" data-cadeia="jornada">
      <h3 className="text-sm font-medium text-foreground">Cadeia da jornada (11 elos)</h3>
      <p className="text-xs text-muted-foreground">
        Estado derivado de cada elo para este evento. Nenhuma etapa executa ação externa.
      </p>

      <div
        className={`mt-3 rounded-lg border p-3 text-xs ${
          proxima.semPendencias
            ? "border-[hsl(var(--sucesso))] bg-muted/20"
            : "border-[hsl(var(--atencao))] bg-muted/20"
        }`}
        data-cadeia="proxima-acao"
      >
        <p className="font-medium text-foreground">Próxima ação no Painel Hoje</p>
        <p className="text-muted-foreground" data-cadeia="status">
          {proxima.status}
          {proxima.semPendencias ? " Sugestão obtida por melhor ajuste." : ""}
        </p>
        <p className="mt-1 text-foreground">{proxima.rotulo}</p>
        <dl className="mt-2 grid gap-2 sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Responsável</dt>
            <dd className="text-foreground">{proxima.responsavel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Prazo</dt>
            <dd className="text-foreground">{proxima.prazo}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Objeto canônico</dt>
            <dd className="text-foreground">{proxima.destino ?? "—"}</dd>
          </div>
        </dl>

        <div className="mt-3 rounded-lg border border-border bg-background/60 p-3" data-cadeia="motivo-evidencias">
          <p className="font-medium text-foreground">Motivo e evidências</p>
          <p className="mt-1 text-muted-foreground">{proxima.motivo}</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
            {proxima.evidencias.map((ev) => (
              <li key={ev}>{ev}</li>
            ))}
          </ul>
        </div>
      </div>
      <ol className="mt-3 space-y-2">
        {elos.map((elo) => (
          <li key={elo.chave}>
            <button
              type="button"
              onClick={() => setAberto(elo)}
              aria-label={`Ver detalhes do elo ${elo.ordem}: ${elo.rotulo}`}
              className="flex w-full flex-wrap items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-left text-xs hover:bg-muted"
            >
              <span className="w-5 shrink-0 text-muted-foreground">{elo.ordem}</span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground">{elo.rotulo}</p>
                <p className="text-muted-foreground">{elo.detalhe}</p>
              </div>
              <span className={`rounded-full border px-2 py-0.5 ${CLASSE_ESTADO[elo.estado]}`}>
                {ROTULO_ESTADO[elo.estado]}
              </span>
            </button>
          </li>
        ))}
      </ol>

      {detalhe ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-foreground/30"
          role="dialog"
          aria-modal="true"
          aria-label={`Detalhes do elo ${detalhe.elo.ordem}`}
          data-cadeia="drawer-elo"
          onClick={() => setAberto(null)}
        >
          <div
            className="h-full w-full max-w-sm overflow-y-auto border-l border-border bg-card p-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Elo {detalhe.elo.ordem} — {detalhe.elo.rotulo}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full border px-2 py-0.5 ${CLASSE_ESTADO[detalhe.elo.estado]}`}
                >
                  {ROTULO_ESTADO[detalhe.elo.estado]}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAberto(null)}
                className="rounded-lg border border-border px-2 py-1 text-foreground hover:bg-muted"
              >
                Fechar
              </button>
            </div>

            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-muted-foreground">Tarefa canônica</dt>
                <dd className="text-foreground">{detalhe.tarefa}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Responsável</dt>
                <dd className="text-foreground">{detalhe.responsavel}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Prazo</dt>
                <dd className="text-foreground">{detalhe.prazo}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  Modelo sugerido para a próxima ação do Painel Hoje
                </dt>
                <dd className="text-foreground">{detalhe.templateResumo}</dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-border pt-3">
              <p className="font-medium text-foreground">Evidências</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
                {detalhe.evidencias.map((ev) => (
                  <li key={ev}>{ev}</li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-muted-foreground">
              Somente leitura: nenhum envio, publicação ou gravação é executado por este painel.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

