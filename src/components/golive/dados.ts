import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useCallback } from "react";

import { carregarGoLive, type DadosGoLive } from "@/lib/golive.functions";

/**
 * GoLive por cliente (23/10/2026 — decisão da Proprietária).
 *
 * O GoLive é a vida COMPLETA de cada cliente. O caso escolhido viaja na URL
 * (`/golive/...?casoId=<id ou código>`), então qualquer tela GoLive aberta a
 * partir do Caso 360, de Todos os casos ou do seletor do topo mostra e grava
 * o MESMO caso. Sem `casoId` na URL, nada muda: continua o caso do piloto.
 */
export function useCasoGoLive(): string | undefined {
  const busca = useRouterState({ select: (s) => s.location.search as Record<string, unknown> });
  return casoDaBusca(busca);
}

export function casoDaBusca(busca: Record<string, unknown> | undefined | null): string | undefined {
  const v = busca?.casoId;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t && t.length <= 80 ? t : undefined;
}

/** Busca (query string) para manter o caso escolhido ao navegar entre telas GoLive. */
export function buscaDoCaso(casoId: string | undefined): { casoId?: string } {
  return casoId ? { casoId } : {};
}

export function useGoLive(casoIdExplicito?: string) {
  const carregar = useServerFn(carregarGoLive);
  const casoDaUrl = useCasoGoLive();
  const casoId = casoIdExplicito ?? casoDaUrl;
  return useQuery<DadosGoLive>({
    queryKey: ["go-live", casoId ?? "caso-canonico"],
    queryFn: () => carregar(casoId ? { data: { casoId } } : {}),
  });
}

/**
 * `useServerFn` para os escritores GoLive: injeta o caso escolhido no payload.
 * Sem caso na URL, o servidor mantém o caso do piloto (comportamento anterior).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEscritorGoLive<F extends (...args: any[]) => any>(fn: F): ReturnType<typeof useServerFn<F>> {
  const chamar = useServerFn(fn) as unknown as (opts?: { data?: Record<string, unknown> }) => Promise<unknown>;
  const casoId = useCasoGoLive();
  return useCallback(
    (opts?: { data?: Record<string, unknown> }) =>
      chamar({ ...(opts ?? {}), data: casoId ? { ...(opts?.data ?? {}), casoId } : opts?.data }),
    [chamar, casoId],
  ) as unknown as ReturnType<typeof useServerFn<F>>;
}

/** `validateSearch` comum das 19 telas /golive/*: só aceita `casoId` (texto curto). */
export function buscaGoLive(busca: Record<string, unknown>): { casoId?: string } {
  return buscaDoCaso(casoDaBusca(busca));
}
