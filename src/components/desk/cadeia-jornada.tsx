import { descreverCadeia, proximaAcaoDoPainel, type EstadoElo } from "@/lib/cadeia-jornada-visao";
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

  return (
    <section className="mt-6 border-t border-border pt-4" data-cadeia="jornada">
      <h3 className="text-sm font-medium text-foreground">Cadeia da jornada (11 elos)</h3>
      <p className="text-xs text-muted-foreground">
        Estado derivado de cada elo para este evento. Nenhuma etapa executa ação externa.
      </p>

      <div
        className="mt-3 rounded-lg border border-[hsl(var(--atencao))] bg-muted/20 p-3 text-xs"
        data-cadeia="proxima-acao"
      >
        <p className="font-medium text-foreground">Próxima ação no Painel Hoje</p>
        <p className="text-foreground">{proxima.rotulo}</p>
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
        <p className="mt-2 text-muted-foreground">{proxima.motivo}</p>
      </div>
      <ol className="mt-3 space-y-2">
        {elos.map((elo) => (
          <li
            key={elo.chave}
            className="flex flex-wrap items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs"
          >
            <span className="w-5 shrink-0 text-muted-foreground">{elo.ordem}</span>
            <div className="min-w-0 flex-1">
              <p className="text-foreground">{elo.rotulo}</p>
              <p className="text-muted-foreground">{elo.detalhe}</p>
            </div>
            <span className={`rounded-full border px-2 py-0.5 ${CLASSE_ESTADO[elo.estado]}`}>
              {ROTULO_ESTADO[elo.estado]}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
