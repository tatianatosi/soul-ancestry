import { Clock, Info } from "lucide-react";

import {
  visibilidadeTela,
  type EscopoCliente,
  type TelaApp,
} from "@/lib/app-visibilidade";

/**
 * Faixa de estado exibida dentro da tela do App Cliente.
 * A tela nunca é removida da navegação por causa do estado.
 */
export function EstadoTelaCliente({ tela, escopo }: { tela: TelaApp; escopo: EscopoCliente }) {
  const v = visibilidadeTela(tela, escopo);
  if (v.estado === "released" || v.estado === "always_available") return null;

  const Icone = v.estado === "in_preparation" || v.estado === "available_empty" ? Clock : Info;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-gold/50 bg-gold/10 p-4">
      <Icone className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-navy">{v.titulo}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-navy/75">{v.mensagem}</p>
      </div>
    </div>
  );
}
