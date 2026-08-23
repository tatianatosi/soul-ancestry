import { Link } from "@tanstack/react-router";

import { AVISO_VISAO_HISTORICA } from "@/lib/fontes-canonicas-indicadores";

/**
 * Faixa discreta exibida em painéis aposentados visualmente (CA-UX-03 Fase B).
 * Não redireciona, não altera dados: apenas orienta para a superfície canônica.
 */
export function FaixaHistorica() {
  return (
    <div
      data-faixa="historica"
      className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/15 bg-cream px-3 py-2 text-xs text-navy/70"
    >
      <span>{AVISO_VISAO_HISTORICA}</span>
      <Link to="/painel" className="underline">
        Abrir Painel Hoje
      </Link>
    </div>
  );
}
