import { useCallback, useEffect, useRef, useState } from "react";

import {
  descreverCadeia,
  detalharElo,
  proximaAcaoDoPainel,
  type EloDerivado,
  type EstadoElo,
} from "@/lib/cadeia-jornada-visao";
import {
  baixarResumoTxtPainelContextual,
  htmlImpressaoPainelContextual,
  imprimirPdfPainelContextual,
  resumoTextoPainelContextual,
  type DadosImpressaoPainel,
} from "@/lib/cadeia-jornada-pdf";
import {
  ROTULO_EVENTO,
  type EventoInterno,
  type ResultadoCadeia,
} from "@/lib/orquestracao-jornada";

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
  nao_aplicavel: "border-navy/15 text-navy/65",
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
  const [copiado, setCopiado] = useState<"ok" | "erro" | "baixado" | null>(null);

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

  const dadosImpressao: DadosImpressaoPainel = {
    evento: ROTULO_EVENTO[evento],
    data: new Date().toISOString().slice(0, 10),
    proxima,
    elos,
  };

  const exportarPdf = () => {
    imprimirPdfPainelContextual(dadosImpressao);
  };

  const copiarResumo = async () => {
    const texto = resumoTextoPainelContextual(dadosImpressao);
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado("ok");
    } catch {
      setCopiado("erro");
    }
    window.setTimeout(() => setCopiado(null), 4000);
  };

  const baixarResumoTxt = () => {
    const ok = baixarResumoTxtPainelContextual(dadosImpressao);
    setCopiado(ok ? "baixado" : "erro");
    window.setTimeout(() => setCopiado(null), 4000);
  };

  return (
    <section
      className="mt-6 border-t border-navy/15 pt-4"
      data-cadeia="jornada"
      aria-labelledby="cadeia-jornada-titulo"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id="cadeia-jornada-titulo" className="text-sm font-medium text-navy">
            Cadeia da jornada (11 elos)
          </h3>
          <p className="text-xs text-navy/65">
            Estado derivado de cada elo para este evento. Nenhuma etapa executa ação externa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copiarResumo}
            data-cadeia="copiar-resumo"
            aria-label="Copiar resumo padronizado do painel contextual (motivo, evidências e próxima ação)"
            className="rounded-lg border border-navy/15 px-3 py-1.5 text-xs text-navy hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Copiar resumo
          </button>
          <button
            type="button"
            onClick={baixarResumoTxt}
            data-cadeia="baixar-txt"
            aria-label="Baixar o resumo do painel contextual em arquivo .txt para arquivar junto ao PDF"
            className="rounded-lg border border-navy/15 px-3 py-1.5 text-xs text-navy hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Baixar resumo (.txt)
          </button>
          <button
            type="button"
            onClick={(e) => {
              gatilhoPreviaRef.current = e.currentTarget;
              setPrevia(true);
            }}
            data-cadeia="exportar-pdf"
            aria-haspopup="dialog"
            aria-expanded={previa}
            aria-label="Pré-visualizar o PDF somente leitura do painel contextual antes de imprimir"
            className="rounded-lg border border-navy/15 px-3 py-1.5 text-xs text-navy hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Gerar PDF somente leitura
          </button>
        </div>
      </div>

      <p
        className="mt-2 text-xs text-navy/65"
        data-cadeia="copiar-status"
        role="status"
        aria-live="polite"
      >
        {copiado === "baixado"
          ? "Resumo baixado em arquivo .txt."
          : copiado === "ok"
            ? "Resumo copiado para a área de transferência."
            : copiado === "erro"
              ? "Não foi possível copiar automaticamente. Use a prévia para revisar e copiar manualmente."
              : ""}
      </p>

      {previa ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cadeia-previa-titulo"
          data-cadeia="previa-pdf"
          onClick={fecharPrevia}
        >
          <div
            ref={previaRef}
            className="flex h-full max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-navy/15 bg-cream/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 border-b border-navy/15 p-4">
              <div>
                <p id="cadeia-previa-titulo" className="text-sm font-medium text-navy">
                  Prévia do PDF somente leitura
                </p>
                <p className="text-xs text-navy/65">
                  Exatamente o conteúdo que sai na impressão. Nada é enviado, publicado ou gravado.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={exportarPdf}
                  data-cadeia="previa-imprimir"
                  aria-label="Abrir a impressão do navegador para salvar o PDF revisado"
                  className="rounded-lg border border-navy/15 px-3 py-1.5 text-xs text-navy hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  Imprimir / salvar PDF
                </button>
                <button
                  type="button"
                  onClick={fecharPrevia}
                  aria-label="Fechar prévia do PDF"
                  className="rounded-lg border border-navy/15 px-3 py-1.5 text-xs text-navy hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  Fechar
                </button>
              </div>
            </div>
            <iframe
              title="Prévia do documento somente leitura do painel contextual"
              data-cadeia="previa-iframe"
              className="h-full w-full flex-1 bg-cream"
              srcDoc={htmlImpressaoPainelContextual(dadosImpressao)}
            />
          </div>
        </div>
      ) : null}

      <div
        className={`mt-3 rounded-lg border p-3 text-xs ${
          proxima.semPendencias
            ? "border-[hsl(var(--sucesso))] bg-cream/30"
            : "border-[hsl(var(--atencao))] bg-cream/30"
        }`}
        data-cadeia="proxima-acao"
        role="group"
        aria-label="Próxima ação no Painel Hoje"
      >
        <p className="font-medium text-navy">Próxima ação no Painel Hoje</p>
        <p className="text-navy/65" data-cadeia="status">
          {proxima.status}
          {proxima.semPendencias ? " Sugestão obtida por melhor ajuste." : ""}
        </p>
        <p className="mt-1 text-navy">{proxima.rotulo}</p>
        <dl className="mt-2 grid gap-2 sm:grid-cols-3">
          <div>
            <dt className="text-navy/65">Responsável</dt>
            <dd className="text-navy">{proxima.responsavel}</dd>
          </div>
          <div>
            <dt className="text-navy/65">Prazo</dt>
            <dd className="text-navy">{proxima.prazo}</dd>
          </div>
          <div>
            <dt className="text-navy/65">Objeto canônico</dt>
            <dd className="text-navy">{proxima.destino ?? "—"}</dd>
          </div>
        </dl>

        <div
          className="mt-3 rounded-lg border border-navy/15 bg-cream/40 p-3"
          data-cadeia="motivo-evidencias"
        >
          <p className="font-medium text-navy">Motivo e evidências</p>
          <p className="mt-1 text-navy/65">{proxima.motivo}</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-navy/65">
            {proxima.evidencias.map((ev, i) => (
              <li key={`${i}-${ev}`}>{ev}</li>
            ))}
          </ul>
        </div>

        {proxima.semPendencias && proxima.justificativa.length > 0 ? (
          <div
            className="mt-3 rounded-lg border border-navy/15 bg-cream/40 p-3"
            data-cadeia="melhor-ajuste"
          >
            <p className="font-medium text-navy">
              Pontuação do melhor ajuste:{" "}
              <span data-cadeia="pontuacao">{proxima.pontuacao ?? 0}</span> pontos
            </p>
            <p className="mt-1 text-navy/65">
              Critérios determinísticos usados para escolher o elo sugerido.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-navy/65">
              {proxima.justificativa.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <table className="mt-3 w-full text-left">
              <caption className="sr-only">Ranking de pontuação dos elos candidatos</caption>
              <thead>
                <tr className="text-navy/65">
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
                  <tr key={r.elo.chave} className="border-t border-navy/15">
                    <td className="py-1 text-navy">
                      {r.elo.ordem}. {r.elo.rotulo}
                    </td>
                    <td className="py-1 text-navy/65">{ROTULO_ESTADO[r.elo.estado]}</td>
                    <td className="py-1 text-navy">{r.pontos}</td>
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
              className="flex w-full flex-wrap items-start gap-2 rounded-lg border border-navy/15 bg-cream/30 p-3 text-left text-xs hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span className="w-5 shrink-0 text-navy/65">{elo.ordem}</span>
              <div className="min-w-0 flex-1">
                <p className="text-navy">{elo.rotulo}</p>
                <p className="text-navy/65">{elo.detalhe}</p>
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
            className="h-full w-full max-w-sm overflow-y-auto border-l border-navy/15 bg-cream/50 p-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p id="cadeia-drawer-titulo" className="text-sm font-medium text-navy">
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
                className="rounded-lg border border-navy/15 px-2 py-1 text-navy hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                Fechar
              </button>
            </div>

            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-navy/65">Tarefa canônica</dt>
                <dd className="text-navy">{detalhe.tarefa}</dd>
              </div>
              <div>
                <dt className="text-navy/65">Responsável</dt>
                <dd className="text-navy">{detalhe.responsavel}</dd>
              </div>
              <div>
                <dt className="text-navy/65">Prazo</dt>
                <dd className="text-navy">{detalhe.prazo}</dd>
              </div>
              <div>
                <dt className="text-navy/65">
                  Modelo sugerido para a próxima ação do Painel Hoje
                </dt>
                <dd className="text-navy" data-cadeia="drawer-template">
                  {detalhe.templateResumo}
                </dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-navy/15 pt-3" data-cadeia="drawer-evidencias">
              <p className="font-medium text-navy">Evidências</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-navy/65">
                {detalhe.evidencias.map((ev, i) => (
                  <li key={`${i}-${ev}`}>{ev}</li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-navy/65">
              Somente leitura: nenhum envio, publicação ou gravação é executado por este painel.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
