/**
 * Peças compartilhadas do shell de go-live.
 *
 * Uma única identidade em todas as telas e o mesmo fluxo visual
 * Lead → Mesa de Discovery → Call → Pessoa → Núcleo → Caso.
 *
 * Tudo aqui é apresentação: lê apenas o que o motor aprovado
 * (`carregarGoLive`) já devolve. Não cria dado, não infere, não filtra por
 * palavra e não grava.
 */
import type { DadosGoLive } from "@/lib/golive.functions";

type Caso = Extract<DadosGoLive, { encontrado: true }>;

const ETAPAS = ["Lead", "Mesa de Discovery", "Call", "Pessoa", "Núcleo", "Caso"] as const;

/** Faixa do fluxo comercial até o caso, com a etapa alcançada destacada. */
export function FaixaFluxo({ atual }: { atual: (typeof ETAPAS)[number] }) {
  const indiceAtual = ETAPAS.indexOf(atual);
  return (
    <nav aria-label="Fluxo do caso" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1.5">
        {ETAPAS.map((etapa, i) => {
          const alcancada = i <= indiceAtual;
          return (
            <li key={etapa} className="flex min-w-0 items-center gap-1.5">
              <span
                aria-current={i === indiceAtual ? "step" : undefined}
                className={
                  i === indiceAtual
                    ? "rounded-full bg-gold/25 px-2.5 py-1 text-[11px] font-semibold text-navy"
                    : alcancada
                      ? "rounded-full border border-navy/15 px-2.5 py-1 text-[11px] text-navy/75"
                      : "rounded-full border border-dashed border-navy/15 px-2.5 py-1 text-[11px] text-navy/40"
                }
              >
                {etapa}
              </span>
              {i < ETAPAS.length - 1 ? (
                <span aria-hidden className="text-navy/25">
                  ›
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Cabeçalho de identidade única: mesma pessoa e mesmo caso em toda tela. */
export function FaixaIdentidade({ dados }: { dados: Caso }) {
  const { identidade, caso } = dados;
  return (
    <section className="min-w-0 rounded-2xl border border-navy/10 bg-white/70 p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-serif text-base text-navy">
          {identidade.pessoaPrincipal ?? "Pessoa principal não identificada"}
        </p>
        <p className="text-xs text-navy/55 break-words">
          {caso.codigo} · {caso.titulo}
        </p>
      </div>
      <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ItemIdentidade rotulo="Núcleo" valor={identidade.nucleo} />
        <ItemIdentidade rotulo="Responsável" valor={identidade.responsavel} />
        <ItemIdentidade rotulo="Status" valor={identidade.status} />
      </dl>
      {identidade.revisarIdentidade ? (
        <p className="mt-2 text-xs font-semibold text-[var(--terracota,#9A3A2F)]">
          Revisar identidade — nada foi mesclado automaticamente.
        </p>
      ) : null}
    </section>
  );
}

function ItemIdentidade({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="break-words text-sm text-navy">{valor ?? "Sem itens nesta etapa"}</dd>
    </div>
  );
}
