/**
 * CA-PORTAL-01 — Mapa das 10 telas do spec CA-UX-01.2 para rotas reais do
 * portal do cliente.
 *
 * Regras:
 * - nenhuma tela do spec sai da navegação por falta de dado; o que muda é o
 *   estado interno devolvido por `visibilidadeTela()` em `app-visibilidade.ts`;
 * - Faturas e Proposta não pertencem ao spec: seguem acessíveis nas rotas
 *   atuais, listadas à parte, sem remoção, redirecionamento ou alteração de
 *   acesso nesta etapa.
 */
import type { TelaApp } from "@/lib/app-visibilidade";

export type RotaTelaSpec = {
  tela: TelaApp;
  rota: string;
  rotulo: string;
  /** A tela já existia no portal real antes de CA-PORTAL-01? */
  origem: "ja_existia" | "construida" | "integrada";
};

export const PORTAL_ROTAS_SPEC: RotaTelaSpec[] = [
  { tela: "home", rota: "/portal", rotulo: "Home", origem: "integrada" },
  { tela: "jornada", rota: "/portal/jornada", rotulo: "Jornada", origem: "construida" },
  { tela: "radar", rota: "/portal/radar", rotulo: "Radar", origem: "construida" },
  { tela: "arvore", rota: "/portal/arvore", rotulo: "Árvore", origem: "construida" },
  { tela: "docs", rota: "/portal/documentos", rotulo: "Documentos", origem: "integrada" },
  { tela: "entrega", rota: "/portal/entregas", rotulo: "Entregas da Jornada", origem: "construida" },
  { tela: "relatorio", rota: "/portal/fase-01", rotulo: "Fase 01", origem: "construida" },
  { tela: "fase02", rota: "/portal/fase-02", rotulo: "Fase 02", origem: "construida" },
  { tela: "biblio", rota: "/portal/legado", rotulo: "Legado", origem: "construida" },
  { tela: "conta", rota: "/portal/conta", rotulo: "Conta", origem: "construida" },
];

/** Abas fora do spec CA-UX-01.2, mantidas acessíveis sem alteração. */
export const PORTAL_ROTAS_FORA_DO_SPEC = [
  { rota: "/portal/faturas", rotulo: "Faturas", opcaoRecomendada: "A. Faturas dentro de Conta" },
  { rota: "/portal/proposta", rotulo: "Proposta", opcaoRecomendada: "B. Proposta dentro de Home/Jornada" },
] as const;

export function rotaDaTela(tela: TelaApp): string {
  const achado = PORTAL_ROTAS_SPEC.find((r) => r.tela === tela);
  if (!achado) throw new Error(`Tela fora do spec CA-UX-01.2: ${tela}`);
  return achado.rota;
}
