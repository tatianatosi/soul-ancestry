import { Link } from "@tanstack/react-router";

import { EstadoDados } from "@/components/saas/estado-dados";
import { rotuloEventoRegistro, type EventoRegistro } from "@/lib/registro-semana";
import { AncoraApp } from "@/components/painel/ancora-app";

function Lista({ titulo, itens }: { titulo: string; itens: readonly EventoRegistro[] }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/50">{titulo}</h3>
      {itens.length ? (
        <ul className="mt-2 space-y-2">
          {itens.map((e) => (
            <li key={e.id} className="rounded-lg border border-navy/10 px-3 py-2">
              <Link
                to="/casos/$caseId"
                params={{ caseId: e.case_id }}
                className="text-sm font-medium text-navy underline underline-offset-2"
              >
                {rotuloEventoRegistro(e)}
              </Link>
              {e.next_action ? <p className="mt-0.5 text-xs text-navy/60">{e.next_action}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-navy/55">Nenhum evento nesta janela.</p>
      )}
    </div>
  );
}

/**
 * O que já foi registrado ontem e na semana — leitura de `case_timeline_events`.
 * Não dispara toque, cobrança nem comunicação.
 */
export function RegistroSemana({
  carregando,
  erro,
  dados,
  aoTentarNovamente,
}: {
  carregando: boolean;
  erro: unknown;
  dados: { ontem: EventoRegistro[]; semana: EventoRegistro[] } | undefined;
  aoTentarNovamente: () => void;
}) {
  return (
    <section data-painel-bloco="registro" className="rounded-2xl border border-navy/10 bg-card p-4 shadow-sm sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">Timeline</p>
      <h2 className="font-serif text-lg text-navy">Registro da semana</h2>
      <AncoraApp bloco="registro" />
      <p className="mt-0.5 text-xs text-navy/55">
        O que a timeline do caso já gravou. Ontem e os demais dias da semana — sem inventar
        conclusão.
      </p>
      <EstadoDados
        carregando={carregando}
        erro={erro}
        dados={dados ? [dados] : undefined}
        aoTentarNovamente={aoTentarNovamente}
        recurso="o registro da semana"
        vazio="Nenhum evento de timeline nesta semana."
      >
        {(lista) => {
          const recorte = lista[0]!;
          return (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Lista titulo="Ontem" itens={recorte.ontem} />
              <Lista titulo="Esta semana" itens={recorte.semana} />
            </div>
          );
        }}
      </EstadoDados>
    </section>
  );
}
