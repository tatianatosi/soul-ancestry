import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { dadosVivosDoPortal } from "@/lib/portal-dados-vivos.functions";
import type { DocumentoPortal } from "@/lib/portal-dados-vivos";
import type { ProjecaoBruta } from "@/lib/projecoes-cliente";

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
};

export type FontePortal = {
  dados: DadosPortal;
  carregando: boolean;
  erro: boolean;
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
    return { data: externa.dados, isLoading: externa.carregando, isError: externa.erro };
  }
  return { data: consulta.data, isLoading: consulta.isLoading, isError: consulta.isError };
}
