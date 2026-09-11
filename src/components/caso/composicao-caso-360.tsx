import { Link } from "@tanstack/react-router";

import { composicaoDoCaso360, vazioComposicao, type ComposicaoCaso360 } from "@/lib/cadeia-legado-caso";

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-navy/55">{rotulo}</p>
      <p className="mt-0.5 text-sm font-medium text-navy">{valor}</p>
    </div>
  );
}

function lista(itens: string[]): string {
  return itens.length ? itens.join(" · ") : "Sem dado no planejador";
}

/**
 * Caso 360 = produto-pai + fase + trilha(s) + itens + condição particular.
 * Lê o planejador e o case service. Legado não entra aqui.
 */
export function ComposicaoCaso360({
  caseId,
  composicao,
}: {
  caseId: string;
  composicao: ComposicaoCaso360;
}) {
  const vazia = vazioComposicao(composicao);
  return (
    <section className="mb-4 rounded-xl border border-navy/10 bg-white p-4" data-composicao-caso>
      <p className="text-[11px] uppercase tracking-wide text-navy/50">Composição do caso</p>
      <p className="mt-1 text-xs text-navy/55">
        Produto-pai, fase, trilha, itens e condição particular — do planejador, não da Planilha Mestre.
      </p>
      {vazia ? (
        <p className="mt-3 text-sm text-navy/70">
          Ainda não há composição persistida neste caso.{" "}
          <a href="#secao-jornada" className="underline decoration-gold underline-offset-4">
            Abrir o planejador
          </a>
        </p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Linha rotulo="Produto-pai" valor={composicao.produtoPai ?? "Sem produto-pai no planejador"} />
          <Linha rotulo="Fase" valor={composicao.faseRotulo} />
          <Linha rotulo="Trilha(s)" valor={lista(composicao.trilhas)} />
          <Linha rotulo="Itens" valor={lista(composicao.itens)} />
          <Linha
            rotulo="Condição particular"
            valor={composicao.condicaoParticular ?? "Sem condição particular gravada"}
          />
        </div>
      )}
      <p className="mt-3 text-xs text-navy/60">
        Desk libera → App mostra o autorizado ({composicao.appPublicados} entrega(s) publicada(s)) →
        WhatsApp só comunica depois ({composicao.whatsappEnviados} enviada(s), {composicao.whatsappAguardando}{" "}
        na fila humana).
        <Link
          to="/app-cliente-como-pessoa"
          search={{ casoId: caseId }}
          className="ml-1 underline decoration-gold underline-offset-4"
        >
          Ver o que o App já pode ver
        </Link>
      </p>
    </section>
  );
}

export function composicaoAPartirDoCanonico(
  canonico:
    | {
        planos?: unknown[];
        servicos?: unknown[];
        produtos?: unknown[];
        trilhas?: unknown[];
        entregas?: unknown[];
        comunicacoes?: unknown[];
      }
    | null
    | undefined,
): ComposicaoCaso360 {
  const planos = (canonico?.planos ?? []) as { archived_at?: string | null }[];
  const plano = planos.find((p) => !p.archived_at) ?? planos[0] ?? null;
  return composicaoDoCaso360({
    plano: plano as never,
    servicos: (canonico?.servicos ?? []) as never,
    produtos: (canonico?.produtos ?? []) as never,
    trilhas: (canonico?.trilhas ?? []) as never,
    entregas: (canonico?.entregas ?? []) as never,
    comunicacoes: (canonico?.comunicacoes ?? []) as never,
  });
}
