/**
 * DESCOBERTA E NOMENCLATURA HUMANA DO DESK (CA-UX-02)
 *
 * Regras puras, sem dado operacional: mapeiam rota técnica → rótulo humano e
 * descrevem os atalhos de descoberta do Painel Hoje. Nada aqui cria, altera ou
 * lê registro; é apenas linguagem de navegação sobre rotas já existentes.
 */

import { PAPEIS_INTERNOS, ehPapelInterno } from "@/lib/superficie-interna-regras";

/** Rótulo humano exibido na navegação e no cabeçalho, sem mudar a URL. */
export const ROTULOS_HUMANOS: Record<string, string> = {
  "/qualidade": "Radar Interno",
  "/matriz-juridica": "Validação Jurídica",
  "/pesquisa-modulo": "Pesquisa Genealógica",
  "/integracoes": "Integrações",
  "/acessos-portal": "App Cliente",
  "/painel": "Painel Hoje",
  "/referencia-mockup-desk": "Mockup original — 14 abas",
};

export function rotuloHumano(rota: string, padrao?: string): string {
  return ROTULOS_HUMANOS[rota] ?? padrao ?? rota;
}

/** Rótulo único da prioridade derivada onde ela aparece (Painel Hoje e Casos). */
export const ROTULO_PRIORIDADE = "Prioridade dos casos";

export type AtalhoDescoberta = {
  rota: string;
  rotulo: string;
  onde: string;
  /** Verdadeiro apenas para a referência histórica (não é superfície operacional). */
  referencia?: boolean;
};

/**
 * Bloco "Encontrar no Desk": somente links para rotas existentes.
 * Nenhum atalho executa ação, cria tarefa, alerta, status ou fonte de verdade.
 */
export const ATALHOS_DESCOBERTA: readonly AtalhoDescoberta[] = [
  { rota: "/qualidade", rotulo: "Radar Interno", onde: "Casos e núcleos" },
  { rota: "/matriz-juridica", rotulo: "Validação Jurídica", onde: "Governança e biblioteca" },
  { rota: "/casos", rotulo: ROTULO_PRIORIDADE, onde: "Casos 360 e Painel Hoje" },
  { rota: "/pesquisa-modulo", rotulo: "Pesquisa Genealógica", onde: "Pesquisa genealógica" },
  { rota: "/integracoes", rotulo: "Integrações", onde: "Governança e biblioteca" },
  { rota: "/acessos-portal", rotulo: "App Cliente", onde: "App Cliente" },
  {
    rota: "/referencia-mockup-desk",
    rotulo: "Referência: mockup original de 14 abas",
    onde: "Somente leitura, uso interno",
    referencia: true,
  },
] as const;

export const BANNER_REFERENCIA_MOCKUP =
  "REFERÊNCIA HISTÓRICA — MOCKUP ORIGINAL DE 14 ABAS. NÃO É A SUPERFÍCIE OPERACIONAL.";

/** Papéis autorizados a abrir a referência histórica. */
export const PAPEIS_REFERENCIA = PAPEIS_INTERNOS;

export type AcessoReferencia = "permitir" | "entrar" | "portal";

/**
 * Acesso à referência histórica `/referencia-mockup-desk`.
 * Cliente autenticado por link mágico (sem papel interno) vai para o App Cliente.
 */
export function decidirAcessoReferencia(estado: {
  autenticado: boolean;
  papeis: readonly (string | null | undefined)[];
}): AcessoReferencia {
  if (!estado.autenticado) return "entrar";
  return estado.papeis.some(ehPapelInterno) ? "permitir" : "portal";
}
