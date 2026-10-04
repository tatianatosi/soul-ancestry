/**
 * Trilho de prontidão do contrato: 8 passos numa linha, o estado de cada um e
 * uma única frase com a próxima ação. Clicar leva ao cartão que resolve.
 *
 * Diretriz da Proprietária, 04/10/2026: verificação rápida, não um excesso de
 * auditorias. Nenhum cartão foi removido — este trilho é a camada que responde
 * "onde está e o que falta" sem abrir nenhum deles.
 */

import type { EstadoPasso, ResumoProntidao } from "@/lib/contrato-prontidao";

const COR: Record<EstadoPasso, string> = {
  ok: "border-navy/20 bg-cream/60 text-navy/70",
  pendente: "border-gold/50 bg-gold/10 text-navy/80",
  bloqueado: "border-terracotta/40 bg-terracotta/10 text-terracotta",
};

const MARCA: Record<EstadoPasso, string> = { ok: "✓", pendente: "•", bloqueado: "!" };

export function TrilhoProntidaoContrato({ resumo }: { resumo: ResumoProntidao }) {
  return (
    <section
      className="rounded-lg border border-navy/15 bg-card p-3"
      data-trilho-prontidao
      aria-label="Prontidão do contrato"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-navy">Onde este contrato está</h2>
        <span className="text-[11px] text-navy/55" data-prontidao-contagem>
          {resumo.concluidos} de {resumo.total} passos concluídos
        </span>
      </div>

      <ol className="mt-2 flex flex-wrap gap-1.5">
        {resumo.passos.map((p, i) => (
          <li key={p.chave}>
            <a
              href={p.ancora}
              title={p.detalhe}
              data-passo={p.chave}
              data-estado={p.estado}
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${COR[p.estado]}`}
            >
              <span aria-hidden="true">{MARCA[p.estado]}</span>
              <span className="tabular-nums opacity-60">{i + 1}.</span>
              {p.rotulo}
            </a>
          </li>
        ))}
      </ol>

      <p
        className={`mt-2 text-xs ${resumo.pronto ? "text-navy/70" : "font-medium text-navy"}`}
        data-prontidao-frase
      >
        {resumo.frase}
      </p>
      {!resumo.pronto && resumo.proximo && (
        <a
          href={resumo.proximo.ancora}
          className="mt-1 inline-block text-[11px] font-medium text-navy underline underline-offset-2"
        >
          Ir para {resumo.proximo.rotulo} →
        </a>
      )}
    </section>
  );
}
