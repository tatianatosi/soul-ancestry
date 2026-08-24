import { useCallback, useEffect, useRef, useState } from "react";

import {
  descreverCadeia,
  detalharElo,
  proximaAcaoDoPainel,
  type EloDerivado,
  type EstadoElo,
} from "@/lib/cadeia-jornada-visao";
import {
  htmlImpressaoPainelContextual,
  imprimirPdfPainelContextual,
  resumoTextoPainelContextual,
  type DadosImpressaoPainel,
} from "@/lib/cadeia-jornada-pdf";
import { ROTULO_EVENTO, type EventoInterno, type ResultadoCadeia } from "@/lib/orquestracao-jornada";

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

  const [previa, setPrevia] = useState(false);
  const [copiado, setCopiado] = useState<"ok" | "erro" | null>(null);

  const listaRef = useRef<HTMLOListElement | null>(null);
  const fecharRef = useRef<HTMLButtonElement | null>(null);
  const gatilhoRef = useRef<HTMLButtonElement | null>(null);
  const painelDrawerRef = useRef<HTMLDivElement | null>(null);
  const previaRef = useRef<HTMLDivElement | null>(null);
  const gatilhoPreviaRef = useRef<HTMLButtonElement | null>(null);

  const fechar = useCallback(() => {
    setAberto(null);
    gatilhoRef.current?.focus();
  }, []);

  const fecharPrevia = useCallback(() => {
    setPrevia(false);
    gatilhoPreviaRef.current?.focus();
  }, []);

  /** Mantém o foco preso dentro do container enquanto o diálogo está aberto. */
  const prenderFoco = (container: HTMLElement | null, e: KeyboardEvent) => {
    if (e.key !== "Tab" || !container) return;
    const foco = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute("disabled"));
    if (foco.length === 0) return;
    const primeiro = foco[0]!;
    const ultimo = foco[foco.length - 1]!;
    const ativo = document.activeElement;
    if (e.shiftKey && (ativo === primeiro || !container.contains(ativo))) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && ativo === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  };

  // Foco inicial, ciclo de Tab/Shift+Tab e Escape no drawer por elo.
  useEffect(() => {
    if (!detalhe) return;
    fecharRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        fechar();
        return;
      }
      prenderFoco(painelDrawerRef.current, e);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [detalhe, fechar]);

  // Foco inicial, ciclo de Tab/Shift+Tab e Escape na prévia de impressão.
  useEffect(() => {
    if (!previa) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        fecharPrevia();
        return;
      }
      prenderFoco(previaRef.current, e);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [previa, fecharPrevia]);

  /** Navegação por setas, Home e End entre os 11 elos. */
  const navegarPorTeclado = (e: React.KeyboardEvent<HTMLButtonElement>, indice: number) => {
    const teclas = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!teclas.includes(e.key)) return;
    e.preventDefault();
    const botoes = Array.from(
      listaRef.current?.querySelectorAll<HTMLButtonElement>("button[data-elo]") ?? [],
    );
    if (botoes.length === 0) return;
    const destino =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? botoes.length - 1
          : e.key === "ArrowDown"
            ? (indice + 1) % botoes.length
            : (indice - 1 + botoes.length) % botoes.length;
    botoes[destino]?.focus();
  };

  const exportarPdf = () => {
    imprimirPdfPainelContextual({
      evento: ROTULO_EVENTO[evento],
      data: new Date().toISOString().slice(0, 10),
      proxima,
      elos,
    });
  };

  return (
    <section
      className="mt-6 border-t border-border pt-4"
      data-cadeia="jornada"
      aria-labelledby="cadeia-jornada-titulo"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id="cadeia-jornada-titulo" className="text-sm font-medium text-foreground">
            Cadeia da jornada (11 elos)
          </h3>
          <p className="text-xs text-muted-foreground">
            Estado derivado de cada elo para este evento. Nenhuma etapa executa ação externa.
          </p>
        </div>
        <button
          type="button"
          onClick={exportarPdf}
          data-cadeia="exportar-pdf"
          aria-label="Gerar PDF somente leitura do painel contextual para revisão e arquivamento"
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Gerar PDF somente leitura
        </button>
      </div>

      <div
        className={`mt-3 rounded-lg border p-3 text-xs ${
          proxima.semPendencias
            ? "border-[hsl(var(--sucesso))] bg-muted/20"
            : "border-[hsl(var(--atencao))] bg-muted/20"
        }`}
        data-cadeia="proxima-acao"
        role="group"
        aria-label="Próxima ação no Painel Hoje"
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

        <div
          className="mt-3 rounded-lg border border-border bg-background/60 p-3"
          data-cadeia="motivo-evidencias"
        >
          <p className="font-medium text-foreground">Motivo e evidências</p>
          <p className="mt-1 text-muted-foreground">{proxima.motivo}</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
            {proxima.evidencias.map((ev) => (
              <li key={ev}>{ev}</li>
            ))}
          </ul>
        </div>

        {proxima.semPendencias && proxima.justificativa.length > 0 ? (
          <div
            className="mt-3 rounded-lg border border-border bg-background/60 p-3"
            data-cadeia="melhor-ajuste"
          >
            <p className="font-medium text-foreground">
              Pontuação do melhor ajuste:{" "}
              <span data-cadeia="pontuacao">{proxima.pontuacao ?? 0}</span> pontos
            </p>
            <p className="mt-1 text-muted-foreground">
              Critérios determinísticos usados para escolher o elo sugerido.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
              {proxima.justificativa.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <table className="mt-3 w-full text-left">
              <caption className="sr-only">Ranking de pontuação dos elos candidatos</caption>
              <thead>
                <tr className="text-muted-foreground">
                  <th scope="col" className="py-1 font-normal">
                    Elo
                  </th>
                  <th scope="col" className="py-1 font-normal">
                    Estado
                  </th>
                  <th scope="col" className="py-1 font-normal">
                    Pontos
                  </th>
                </tr>
              </thead>
              <tbody>
                {proxima.ranking.map((r) => (
                  <tr key={r.elo.chave} className="border-t border-border/60">
                    <td className="py-1 text-foreground">
                      {r.elo.ordem}. {r.elo.rotulo}
                    </td>
                    <td className="py-1 text-muted-foreground">{ROTULO_ESTADO[r.elo.estado]}</td>
                    <td className="py-1 text-foreground">{r.pontos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
      <ol className="mt-3 space-y-2" ref={listaRef} aria-label="Elos da cadeia da jornada">
        {elos.map((elo, i) => (
          <li key={elo.chave}>
            <button
              type="button"
              data-elo={elo.chave}
              onClick={(e) => {
                gatilhoRef.current = e.currentTarget;
                setAberto(elo);
              }}
              onKeyDown={(e) => navegarPorTeclado(e, i)}
              aria-label={`Ver detalhes do elo ${elo.ordem}: ${elo.rotulo} — ${ROTULO_ESTADO[elo.estado]}`}
              aria-haspopup="dialog"
              aria-expanded={aberto?.chave === elo.chave}
              className="flex w-full flex-wrap items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-left text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          aria-labelledby="cadeia-drawer-titulo"
          data-cadeia="drawer-elo"
          onClick={fechar}
        >
          <div
            className="h-full w-full max-w-sm overflow-y-auto border-l border-border bg-card p-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p id="cadeia-drawer-titulo" className="text-sm font-medium text-foreground">
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
                ref={fecharRef}
                onClick={fechar}
                aria-label="Fechar detalhes do elo"
                className="rounded-lg border border-border px-2 py-1 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                <dd className="text-foreground" data-cadeia="drawer-template">
                  {detalhe.templateResumo}
                </dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-border pt-3" data-cadeia="drawer-evidencias">
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
