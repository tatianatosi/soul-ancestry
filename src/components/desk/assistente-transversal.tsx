import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

import { AssistentePesquisa } from "@/components/pesquisa/assistente";
import { assistenteVisivel, atalhosDoGrupo, estadoAssistente } from "@/lib/assistente-transversal";
import { cn } from "@/lib/utils";

/**
 * CA-UX-03 (adendo v1.0) — Assistente transversal.
 *
 * Ponto de entrada único e persistente em cada um dos 8 grupos do Desk.
 * Não é aba, não altera dado, não dispara ação externa e não eleva permissão.
 * Sem caso confirmado explicitamente, atua apenas como orientador de navegação.
 */
export function AssistenteTransversal({ papeis }: { papeis: readonly string[] }) {
  const rota = useRouterState({ select: (s) => s.location.pathname });
  const [aberto, setAberto] = useState(false);
  const [confirmado, setConfirmado] = useState<{ casoId: string; rota: string } | null>(null);

  // Mudança de URL/aba nunca troca o caso analisado: a confirmação é descartada.
  useEffect(() => {
    setConfirmado((atual) => (atual && atual.rota === rota ? atual : null));
  }, [rota]);

  const visivel = assistenteVisivel({ superficieInterna: true, papeis, rota });
  if (!visivel) return null;

  const estado = estadoAssistente({ rota, confirmado });
  const atalhos = atalhosDoGrupo(estado.grupo);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label="Assistente do Desk"
        aria-expanded={aberto}
        className="fixed bottom-5 right-5 z-40 hidden items-center justify-center gap-2 rounded-full border border-gold/50 bg-navy px-4 py-3 text-sm font-medium text-cream shadow-lg hover:bg-navy/90 md:flex"
      >
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">Assistente</span>
      </button>

      {aberto ? (
        <aside
          role="complementary"
          aria-label={`Assistente — ${estado.regra.label}`}
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto",
            "border-l border-navy/15 bg-cream/95 p-4 shadow-2xl backdrop-blur",
          )}
        >
          <header className="mb-3 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-navy/50">Assistente do Desk</p>
              <h2 className="font-serif text-xl text-navy">{estado.regra.label}</h2>
              <p className="mt-1 break-all text-xs text-navy/60">Rota atual: {estado.rota}</p>
              <p className="mt-1 text-xs text-navy/70">
                <span className="font-medium">Contexto disponível:</span> {estado.regra.contexto}
              </p>
              <p className="mt-1 text-xs text-navy/70">
                <span className="font-medium">Resultado permitido:</span> {estado.regra.resultado}
              </p>
              <p className="mt-1 text-xs text-navy/70">
                <span className="font-medium">Caso:</span>{" "}
                {estado.casoConfirmado
                  ? `confirmado (${estado.casoConfirmado})`
                  : estado.casoCandidato
                    ? "sugerido pela URL, ainda não confirmado"
                    : "nenhum caso no contexto"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar assistente"
              className="rounded-lg border border-navy/15 p-1 text-navy/70 hover:bg-navy/5"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {estado.regra.analisaCaso && estado.casoCandidato && !estado.casoConfirmado ? (
            <div className="mb-3 rounded-xl border border-gold/50 bg-gold/10 p-3 text-sm text-navy">
              <p>
                Confirme explicitamente que a análise deve usar o caso desta rota. Nenhum outro caso
                será usado como substituto.
              </p>
              <button
                type="button"
                onClick={() => setConfirmado({ casoId: estado.casoCandidato!, rota })}
                className="mt-2 rounded-lg bg-navy px-3 py-2 text-sm font-medium text-cream hover:bg-navy/90"
              >
                Confirmar este caso
              </button>
            </div>
          ) : null}

          {estado.modo === "analise" && estado.casoConfirmado ? (
            <AssistentePesquisa casoId={estado.casoConfirmado} />
          ) : (
            <div className="space-y-3">
              <p className="rounded-xl border border-navy/15 bg-cream/70 p-3 text-sm text-navy/80">
                Sem caso confirmado, o Assistente orienta apenas a navegação interna deste grupo.
                Ele não infere dados de caso, não altera registros e não dispara envio, cobrança,
                assinatura, publicação ou pesquisa externa.
              </p>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-navy/60">
                  Ir para (rotas existentes)
                </p>
                <ul className="space-y-1">
                  {atalhos.map((a) => (
                    <li key={`${a.to}-${a.label}`}>
                      <Link
                        to={a.to}
                        onClick={() => setAberto(false)}
                        className="block rounded-lg border border-navy/10 bg-cream/40 px-3 py-2 text-sm text-navy hover:border-gold/60"
                      >
                        {a.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </aside>
      ) : null}
    </>
  );
}
