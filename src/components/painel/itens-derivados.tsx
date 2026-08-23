import { Link } from "@tanstack/react-router";

import type { ItemDerivadoPainel } from "@/lib/painel-derivados";

const TOM: Record<ItemDerivadoPainel["criticidade"], string> = {
  critica: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  alta: "border-gold/50 bg-gold/10 text-navy",
  atencao: "border-navy/15 bg-navy/5 text-navy/70",
};

const ROTULO: Record<ItemDerivadoPainel["criticidade"], string> = {
  critica: "Crítico",
  alta: "Alta",
  atencao: "Atenção",
};

/**
 * Exibição somente leitura dos itens derivados. Não cria tarefa, prazo,
 * comunicação nem estado próprio: cada linha apenas abre o registro canônico.
 */
export function ItensDerivados({
  itens,
  vazio = "Nenhum item derivado além do que já está na fila.",
}: {
  itens: ItemDerivadoPainel[];
  vazio?: string;
}) {
  if (itens.length === 0) {
    return <p className="text-xs text-navy/50">{vazio}</p>;
  }
  return (
    <ul data-itens-derivados className="space-y-2 text-sm">
      {itens.map((i) => (
        <li
          key={i.chave}
          data-item-derivado={i.chave}
          data-registro={`caso:${i.casoId}`}
          className="rounded-lg border border-navy/10 bg-white p-3"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="min-w-0 font-medium text-navy">{i.titulo}</p>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${TOM[i.criticidade]}`}>
              {ROTULO[i.criticidade]}
            </span>
          </div>
          <p className="mt-1 text-xs text-navy/65">{i.detalhe}</p>
          <p className="mt-1 text-[11px] text-navy/50">Encerra quando: {i.encerraQuando}</p>
          <Link
            to="/casos/$caseId"
            params={{ caseId: i.casoId }}
            className="mt-2 inline-block text-xs text-navy underline underline-offset-2"
          >
            Abrir {i.caso ?? "o caso"}
          </Link>
        </li>
      ))}
    </ul>
  );
}
