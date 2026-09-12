/**
 * De-para canônico: abas do App Cliente (mockup 17) → rotas reais do produto
 * → componentes do kit consolidado (`@/components/clube-ancestral-kit/kit-consolidado`).
 *
 * Isto NÃO cria aba, rota nem taxonomia nova: apenas declara, em um único
 * lugar, a correspondência entre as 7 abas aprovadas e as telas que já
 * existem em `src/routes/portal/`. A barra do App Cliente é montada a partir
 * daqui, de modo que rótulo, ordem e destino não possam divergir.
 */

export type AbaAppCliente = "home" | "jornada" | "radar" | "arvore" | "documentos" | "legado" | "conta";

export type MapaAbaKit = {
  aba: AbaAppCliente;
  /** Rota real, já existente e autenticada. */
  rota: string;
  /** Arquivo de rota que responde por ela. */
  arquivo: string;
  /** Componentes do kit consolidado usados nessa tela. */
  kit: string[];
};

/** Ordem e rótulos vêm de COPY_TELAS; aqui fica o destino real de cada aba. */
export const MAPA_APP_CLIENTE_KIT: MapaAbaKit[] = [
  {
    aba: "home",
    rota: "/portal",
    arquivo: "src/routes/portal/index.tsx",
    kit: ["KitCard", "NextActionCard", "MicrodeliveryCard", "JourneyProgress", "KitEmptyState"],
  },
  {
    aba: "jornada",
    rota: "/portal/jornada",
    arquivo: "src/routes/portal/jornada.tsx",
    kit: ["JourneyTimeline", "JourneyProgress", "NextActionCard", "KitEmptyState"],
  },
  {
    aba: "radar",
    rota: "/portal/radar",
    arquivo: "src/routes/portal/radar.tsx",
    kit: ["RadarChart", "KpiCard", "KitCard"],
  },
  {
    aba: "arvore",
    rota: "/portal/arvore",
    arquivo: "src/routes/portal/arvore.tsx",
    kit: ["MiniFamilyTree", "PersonNode", "RelationshipLine", "GenealogyEvent", "KitEmptyState"],
  },
  {
    aba: "documentos",
    rota: "/portal/documentos",
    arquivo: "src/routes/portal/documentos.tsx",
    kit: ["KitTable", "ResearchArtifactCard", "KitBadge", "KitEmptyState"],
  },
  {
    aba: "legado",
    rota: "/portal/legado",
    arquivo: "src/routes/portal/legado.tsx",
    kit: ["ContentShelf", "KitCard", "KitEmptyState"],
  },
  {
    aba: "conta",
    rota: "/portal/conta",
    arquivo: "src/routes/portal/conta.tsx",
    kit: ["KitCard", "KitField", "KitBadge", "KitTable"],
  },
];

export function rotaDaAba(aba: AbaAppCliente): string {
  const achado = MAPA_APP_CLIENTE_KIT.find((item) => item.aba === aba);
  if (!achado) throw new Error(`Aba fora da taxonomia aprovada: ${aba}`);
  return achado.rota;
}
