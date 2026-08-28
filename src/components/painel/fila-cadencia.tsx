import { Link } from "@tanstack/react-router";

import {
  ROTULO_MOTIVO_FOLLOW_UP,
  estadoCarregamentoFila,
  type ItemFollowUp,
} from "@/lib/fila-follow-up-proprietaria";
import { textoPrazo } from "@/lib/painel-dia";

/**
 * Cadência do dia — o toque que faz cada cliente avançar.
 *
 * Só exibe. Nenhum botão aqui envia mensagem, agenda reunião, cobra ou muda
 * etapa: cada item leva ao registro canônico, onde a ação acontece com as
 * guardas do módulo proprietário.
 */

const TOM_PRIORIDADE: Record<1 | 2 | 3, { rotulo: string; classe: string }> = {
  1: { rotulo: "Trava o avanço", classe: "border-terracotta/50 bg-terracotta/5 text-terracotta" },
  2: { rotulo: "Atrasa o avanço", classe: "border-gold/50 bg-gold/10 text-navy" },
  3: { rotulo: "Próximo passo", classe: "border-navy/20 text-navy/60" },
};

function ItemCadencia({ item }: { item: ItemFollowUp }) {
  const tom = TOM_PRIORIDADE[item.prioridade];
  return (
    <li
      data-registro={item.pessoaOuCasoId}
      className="min-w-0 rounded-lg border border-navy/10 p-3"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Link
          to={item.rotaDestino}
          className="min-w-0 break-words font-medium text-navy underline underline-offset-2"
        >
          {item.pessoa}
        </Link>
        <span
          className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${tom.classe}`}
        >
          {tom.rotulo}
        </span>
      </div>

      <p className="mt-1 text-[11px] uppercase tracking-wide text-navy/50">
        {ROTULO_MOTIVO_FOLLOW_UP[item.motivo]}
      </p>

      <p className="mt-1 break-words text-xs text-navy/70">{item.estado}</p>

      <p className="mt-2 break-words text-xs text-navy">
        <span className="font-medium">Toque que faz avançar: </span>
        {item.recomendacao}
      </p>

      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-navy/50">
        <span>
          {item.responsavel ? `Responsável: ${item.responsavel}` : "Sem responsável definido"}
        </span>
        <span>{textoPrazo(item.prazo)}</span>
        <span className="break-words">{item.evidenciaOrigem}</span>
      </p>
    </li>
  );
}

export function FilaCadencia({
  itens,
  carregando,
  erro,
  limite = 6,
}: {
  itens: ItemFollowUp[];
  carregando: boolean;
  erro: boolean;
  limite?: number;
}) {
  const estado = estadoCarregamentoFila({ carregando, erro, quantidade: itens.length });

  if (estado === "carregando")
    return <p className="mt-3 text-xs text-navy/50">Carregando a cadência…</p>;
  if (estado === "erro")
    return (
      <p className="mt-3 text-xs text-terracotta">
        Não foi possível calcular a cadência. Nenhuma pendência foi concluída por causa desta falha.
      </p>
    );
  if (estado === "vazio")
    return (
      <p className="mt-3 text-xs text-navy/50">Nenhum cliente parado esperando um toque hoje.</p>
    );

  const visiveis = itens.slice(0, limite);
  const restantes = itens.length - visiveis.length;

  return (
    <>
      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {visiveis.map((i) => (
          <ItemCadencia key={i.chave} item={i} />
        ))}
      </ul>
      {restantes > 0 ? (
        <p className="mt-2 text-[11px] text-navy/50">
          Mais {restantes} em cadência de atenção. Os demais ficam em Casos 360 e em Operação.
        </p>
      ) : null}
    </>
  );
}
