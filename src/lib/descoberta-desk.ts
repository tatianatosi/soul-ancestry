/**
 * DESCOBERTA E NOMENCLATURA HUMANA DO DESK (CA-UX-02)
 *
 * Regras puras, sem dado operacional: mapeiam rota técnica → rótulo humano e
 * descrevem os atalhos de descoberta do Painel Hoje. Nada aqui cria, altera ou
 * lê registro; é apenas linguagem de navegação sobre rotas já existentes.
 * O campo `onde` é o grupo dono da rota — a aba onde a função vive.
 */

import { grupoDonoDaRota } from "@/lib/navegacao-desk";

/** Rótulo humano exibido na navegação e no cabeçalho, sem mudar a URL. */
export const ROTULOS_HUMANOS: Record<string, string> = {
  "/qualidade": "Radar & Matrizes",
  "/matriz-juridica": "Validação Jurídica",
  "/pesquisa-modulo": "Pesquisa Genealógica",
  "/integracoes": "Integrações",
  "/acessos-portal": "App Cliente",
  "/painel": "Visão Geral",
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
};

/**
 * Bloco "Encontrar no Desk": somente links para rotas existentes.
 * Nenhum atalho executa ação, cria tarefa, alerta, status ou fonte de verdade.
 */
function atalho(rota: string, rotulo: string): AtalhoDescoberta {
  return { rota, rotulo, onde: grupoDonoDaRota(rota) ?? "" };
}

export const ATALHOS_DESCOBERTA: readonly AtalhoDescoberta[] = [
  atalho("/qualidade", "Radar & Matrizes"),
  atalho("/matriz-juridica", "Validação Jurídica"),
  atalho("/casos", ROTULO_PRIORIDADE),
  atalho("/pesquisa-modulo", "Pesquisa Genealógica"),
  atalho("/integracoes", "Integrações"),
  atalho("/acessos-portal", "App Cliente"),
] as const;

/**
 * CA-UX-04: a referência histórica saiu do runtime. Banner, papéis e decisão de
 * acesso foram removidos junto com a rota; índice em docs/historico/mockups.
 */
