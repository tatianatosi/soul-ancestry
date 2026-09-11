/**
 * Navegação do App Cliente.
 *
 * Spec histórico CA-UX-01.2 listava 10 telas. Memória permanente + mockup 17
 * + Enterprise PRD (adendo 2026-09-11): barra de 1º nível = **exatamente 7**.
 * Entregas / Fase 01 / Fase 02 permanecem como rotas profundas, não abas.
 */
import type { TelaApp } from "@/lib/app-visibilidade";

export type RotaTelaSpec = {
  tela: TelaApp;
  rota: string;
  rotulo: string;
  /** A tela já existia no portal real antes de CA-PORTAL-01? */
  origem: "ja_existia" | "construida" | "integrada";
  /** Se false, não entra na barra canônica do App Cliente. */
  abaPrimeiroNivel?: boolean;
};

/** As 7 abas canônicas — ordem e rótulos do mockup aprovado. */
export const PORTAL_ABAS_CANONICAS = [
  "Home",
  "Jornada",
  "Radar",
  "Árvore",
  "Documentos",
  "Legado",
  "Conta",
] as const;

export const PORTAL_ROTAS_SPEC: RotaTelaSpec[] = [
  { tela: "home", rota: "/portal", rotulo: "Home", origem: "integrada", abaPrimeiroNivel: true },
  { tela: "jornada", rota: "/portal/jornada", rotulo: "Jornada", origem: "construida", abaPrimeiroNivel: true },
  { tela: "radar", rota: "/portal/radar", rotulo: "Radar", origem: "construida", abaPrimeiroNivel: true },
  { tela: "arvore", rota: "/portal/arvore", rotulo: "Árvore", origem: "construida", abaPrimeiroNivel: true },
  { tela: "docs", rota: "/portal/documentos", rotulo: "Documentos", origem: "integrada", abaPrimeiroNivel: true },
  {
    tela: "entrega",
    rota: "/portal/entregas",
    rotulo: "Entregas da Jornada",
    origem: "construida",
    abaPrimeiroNivel: false,
  },
  {
    tela: "relatorio",
    rota: "/portal/fase-01",
    rotulo: "Fase 01",
    origem: "construida",
    abaPrimeiroNivel: false,
  },
  {
    tela: "fase02",
    rota: "/portal/fase-02",
    rotulo: "Fase 02",
    origem: "construida",
    abaPrimeiroNivel: false,
  },
  { tela: "biblio", rota: "/portal/legado", rotulo: "Legado", origem: "construida", abaPrimeiroNivel: true },
  { tela: "conta", rota: "/portal/conta", rotulo: "Conta", origem: "construida", abaPrimeiroNivel: true },
];

/** Rotas profundas / conteúdo — não são abas de primeiro nível. */
export const PORTAL_ROTAS_PROFUNDAS = PORTAL_ROTAS_SPEC.filter((r) => r.abaPrimeiroNivel === false);

/** Abas fora do mockup 17, mantidas acessíveis sem promoção à barra. */
export const PORTAL_ROTAS_FORA_DO_SPEC = [
  { rota: "/portal/faturas", rotulo: "Faturas", opcaoRecomendada: "A. Faturas dentro de Conta" },
  { rota: "/portal/proposta", rotulo: "Proposta", opcaoRecomendada: "B. Proposta dentro de Home/Jornada" },
] as const;

export function abasCanonicasDoPortal(): RotaTelaSpec[] {
  return PORTAL_ROTAS_SPEC.filter((r) => r.abaPrimeiroNivel !== false);
}

export function rotaDaTela(tela: TelaApp): string {
  const achado = PORTAL_ROTAS_SPEC.find((r) => r.tela === tela);
  if (!achado) throw new Error(`Tela fora do spec CA-UX-01.2: ${tela}`);
  return achado.rota;
}
