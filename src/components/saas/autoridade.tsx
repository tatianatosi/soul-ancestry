/**
 * Autoridade operacional na interface.
 *
 * `useAutoridade()` é o único ponto que uma tela deve consultar para saber se
 * pode oferecer uma ação. Substitui os testes espalhados por `somenteLeitura`,
 * `podeEscrever` e gates de domínio, que na prática desabilitavam controles
 * para a própria proprietária.
 *
 * Regra: só se desabilita controle quando a decisão é `bloquear`. Pendência de
 * gate não desabilita — ela vira confirmação com motivo registrado.
 */

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useSaas } from "@/components/saas/shell";
import {
  decidirAcao,
  deveDesabilitar,
  ehProprietaria,
  rotuloDecisao,
  type PedidoAcao,
  type ResultadoAutoridade,
} from "@/lib/autoridade-operacional";

export type Autoridade = {
  papeis: readonly string[];
  organizationId: string | null;
  carregando: boolean;
  /** Verdadeiro para o papel `admin` da própria organização. */
  proprietaria: boolean;
  /** Decide uma ação concreta. */
  decidir: (pedido: PedidoAcao) => ResultadoAutoridade;
  /** Atalho: o controle deve ficar desabilitado? */
  bloqueado: (pedido: PedidoAcao) => boolean;
  /** Atalho: rótulo curto do estado da ação, ou null quando livre. */
  rotulo: (pedido: PedidoAcao) => string | null;
};

const ContextoAutoridade = createContext<Autoridade | null>(null);

export function useAutoridade(): Autoridade {
  const doContexto = useContext(ContextoAutoridade);
  const saas = useSaas();

  const papeis = (saas.papeis ?? []) as readonly string[];
  const organizationId = (saas.contexto?.organizationId ?? null) as string | null;
  const carregando = Boolean(saas.isLoading);

  const decidir = useCallback(
    (pedido: PedidoAcao) => decidirAcao({ papeis, organizationId, carregando }, pedido),
    [papeis, organizationId, carregando],
  );

  const valor = useMemo<Autoridade>(
    () => ({
      papeis,
      organizationId,
      carregando,
      proprietaria: ehProprietaria(papeis),
      decidir,
      bloqueado: (pedido) => deveDesabilitar(decidir(pedido)),
      rotulo: (pedido) => rotuloDecisao(decidir(pedido)),
    }),
    [papeis, organizationId, carregando, decidir],
  );

  return doContexto ?? valor;
}

/** Opcional: permite injetar autoridade em testes e em pré-visualizações. */
export function AutoridadeProvider({
  valor,
  children,
}: {
  valor: Autoridade;
  children: ReactNode;
}) {
  return <ContextoAutoridade.Provider value={valor}>{children}</ContextoAutoridade.Provider>;
}
