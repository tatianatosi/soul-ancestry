/**
 * Cobertura do Modo Proprietária Administradora por módulo.
 *
 * Mostra, para cada módulo existente, as operações internas liberadas por
 * decisão auditada, a entidade canônica onde a alteração é gravada e os atos
 * que continuam exigindo confirmação final explícita.
 */
import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { COBERTURA_MODULOS, REGRAS_GERAIS } from "@/lib/modo-proprietaria-cobertura";
import { ROTULO_ACAO_EXTERNA } from "@/lib/modo-proprietaria";

export function CoberturaModulos() {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="font-serif text-lg text-foreground">Cobertura por área</h2>
        <p className="text-sm text-muted-foreground">
          Toda operação abaixo grava na entidade canônica, com autora, data/hora, valor anterior,
          valor novo, motivo e evento de auditoria. Nada é inferido.
        </p>
      </header>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Regra geral — vale para todas as áreas</p>
        <ul className="mt-2 grid gap-1 text-xs text-foreground/80 sm:grid-cols-2">
          {REGRAS_GERAIS.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {COBERTURA_MODULOS.map((m) => (
          <article key={m.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-serif text-base text-foreground">{m.rotulo}</h3>
              <Link to={m.rota} className="text-xs font-medium text-primary underline">
                Abrir módulo
              </Link>
            </div>

            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {m.operacoes.map((o) => (
                <li key={o.id} className="flex justify-between gap-3">
                  <span>• {o.rotulo}</span>
                  <code className="shrink-0 text-[10px] text-muted-foreground/70">{o.entidade}</code>
                </li>
              ))}
            </ul>

            {m.acoesExternas.length > 0 && (
              <p className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>
                  Confirmação final obrigatória:{" "}
                  {m.acoesExternas.map((a) => ROTULO_ACAO_EXTERNA[a]).join(", ")}.
                </span>
              </p>
            )}

            <ul className="mt-3 space-y-1 text-xs text-foreground/80">
              {m.regras.map((r) => (
                <li key={r}>— {r}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
