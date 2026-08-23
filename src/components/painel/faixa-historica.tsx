import { Link } from "@tanstack/react-router";

import { AVISO_VISAO_HISTORICA, ROTA_PAINEL_CANONICO } from "@/lib/fontes-canonicas-indicadores";

/**
 * Faixa discreta exibida quando um painel aposentado é aberto diretamente por
 * usuário interno autorizado. Não redireciona, não altera dado, não aparece
 * para cliente (as rotas vivem sob a superfície interna autenticada).
 */
export function FaixaVisaoHistorica() {
  return (
    <div
      data-faixa-historica
      className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-navy/75"
    >
      <span>{AVISO_VISAO_HISTORICA}</span>
      <Link to={ROTA_PAINEL_CANONICO} className="font-medium text-navy underline underline-offset-2">
        Abrir Painel Hoje
      </Link>
    </div>
  );
}
