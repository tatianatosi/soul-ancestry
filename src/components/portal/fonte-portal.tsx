import { createContext, useContext, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { dadosVivosDoPortal } from "@/lib/portal-dados-vivos.functions";
import type { DocumentoPortal } from "@/lib/portal-dados-vivos";
import type { ProjecaoBruta } from "@/lib/projecoes-cliente";
import type { ProximaAcaoCliente } from "@/lib/motor-caso";
import type { EscopoCliente } from "@/lib/app-visibilidade";
import type { IdentidadeCaso } from "@/lib/caso-compartilhado";

/**
 * Fonte de dados do App Cliente — ponto único de desacoplamento.
 *
 * As telas do portal sempre leram direto de `dadosVivosDoPortal`, que exige
 * sessão de cliente. Isso as tornava impossíveis de exibir de dentro do Desk:
 * nem para demonstrar a um futuro cliente, nem para conferir o que um cliente
 * real está vendo.
 *
 * Aqui a leitura passa a ter duas portas, e uma regra:
 *
 * - **sem provider** (o portal autenticado de verdade) o hook chama o servidor,
 *   exatamente como antes — comportamento inalterado;
 * - **com provider** (demo e espelho, dentro do Desk) o hook devolve o que o
 *   provider entregar.
 *
 * A regra é que **os componentes são os mesmos**. Nada aqui reimplementa tela:
 * quem muda é a origem do dado. É isso que impede a demo de divergir do
 * produto — quando o App Cliente muda, ela muda junto, e bug aparece nela
 * porque é o mesmo código.
 *
 * Nada disso afrouxa a trava de classificação: o portal autenticado continua
 * passando por `filtrarParaCliente`, e o provider só é montado em rota interna
 * do Desk, que nunca serve o cliente.
 */

export type DadosPortal = {
  projecoes: ProjecaoBruta[];
  documentos: DocumentoPortal[];
  /** Mesma próxima ação do motor, quando a fonte já a calculou. */
  proximaAcao?: ProximaAcaoCliente | null;
  /** D0 real do acompanhamento (onboarding iniciado, ou criação do caso). */
  inicioEm?: string | null;
};

/**
 * Prévia: presente apenas quando as telas do portal são exibidas de dentro do
 * Desk. Governa três coisas que não podem valer para o cliente real:
 *
 *  - o `PortalShell` não redireciona quem não é cliente autorizado (numa rota
 *    interna, ninguém é — e a redireção expulsaria a Proprietária da página);
 *  - o cabeçalho mostra de quem é a projeção, em vez do nome do cliente logado;
 *  - o selo aparece no topo, sempre, sem depender de quem montou a tela.
 */
export type PreviaPortal = {
  /** Faixa obrigatória no topo. Nunca vazia. */
  selo: string;
  /** Identifica a origem do que está sendo exibido. */
  titulo: string;
  /**
   * Para onde o botão Sair leva na prévia.
   * Desk demo → `/acessos-portal`. Prévia pública go-live → `/acesso`.
   */
  destinoSair?: string;
  /** Identidade canônica do caso (Ordem 2) — UUID = crm_casos.id. */
  identidade?: IdentidadeCaso;
};

export type FontePortal = {
  dados: DadosPortal;
  carregando: boolean;
  erro: boolean;
  previa: PreviaPortal;
  /** Escopo real do caso, quando o acesso master já o calculou. */
  escopo?: EscopoCliente;
  /** Em prévia, a barra do App não pode usar Link para /portal — sai do Desk. */
  aoNavegar?: (path: string) => void;
  /** Rota interna destacada na barra, quando a prévia não usa o router. */
  rotaInterna?: string;
};

const FontePortalContext = createContext<FontePortal | null>(null);

export function FontePortalProvider({
  fonte,
  children,
}: {
  fonte: FontePortal;
  children: ReactNode;
}) {
  return <FontePortalContext.Provider value={fonte}>{children}</FontePortalContext.Provider>;
}

export function useFontePortal(): FontePortal | null {
  return useContext(FontePortalContext);
}

/**
 * Dados do App Cliente para a tela atual.
 *
 * A consulta ao servidor fica desabilitada quando há provider — não é só
 * ignorada: uma rota interna do Desk não deve nem tentar ler o portal como se
 * fosse cliente.
 */
export function usePortalVivo() {
  const externa = useContext(FontePortalContext);
  const carregar = useServerFn(dadosVivosDoPortal);
  const consulta = useQuery({
    queryKey: ["portal-dados-vivos"],
    queryFn: () => carregar({ data: {} }),
    enabled: externa === null,
  });

  if (externa) {
    return {
      data: externa.dados,
      isLoading: externa.carregando,
      isError: externa.erro,
      error: externa.erro ? new Error("Falha ao carregar os dados do acompanhamento.") : null,
      refetch: () => {},
    };
  }
  return {
    data: consulta.data,
    isLoading: consulta.isLoading,
    isError: consulta.isError,
    error: consulta.error,
    refetch: () => void consulta.refetch(),
  };
}

/**
 * `null` no App Cliente de verdade; preenchido quando a tela está sendo
 * exibida de dentro do Desk. É o único sinal que distingue os dois casos —
 * não existe prop solta nem flag global.
 */
export function usePreviaPortal(): PreviaPortal | null {
  return useContext(FontePortalContext)?.previa ?? null;
}

/**
 * Link do App Cliente: na prévia do Desk permanece dentro do provider.
 * No portal autenticado continua sendo rota de verdade.
 */
export function LinkPortal({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) {
  const fonte = useContext(FontePortalContext);
  if (fonte?.previa && fonte.aoNavegar) {
    return (
      <button type="button" onClick={() => fonte.aoNavegar?.(to)} className={className}>
        {children}
      </button>
    );
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}
