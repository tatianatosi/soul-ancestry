import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalHome } from "@/routes/portal/index";
import { PortalJornada } from "@/routes/portal/jornada";
import { PortalRadar } from "@/routes/portal/radar";
import { PortalArvore } from "@/routes/portal/arvore";
import { PortalDocumentos } from "@/routes/portal/documentos";
import { PortalLegado } from "@/routes/portal/legado";
import { PortalConta } from "@/routes/portal/conta";
import { PortalEntregas } from "@/routes/portal/entregas";
import { PortalFase01 } from "@/routes/portal/fase-01";
import { PortalFase02 } from "@/routes/portal/fase-02";

/** Sete abas do mockup. Entregas / Fase 01 / Fase 02 não são 1º nível: abrem pela jornada. */
export const ABAS_APP_CLIENTE = [
  { chave: "home", rotulo: COPY_TELAS.home.navegacao, rota: "/portal", Componente: PortalHome },
  { chave: "jornada", rotulo: COPY_TELAS.jornada.navegacao, rota: "/portal/jornada", Componente: PortalJornada },
  { chave: "radar", rotulo: COPY_TELAS.radar.navegacao, rota: "/portal/radar", Componente: PortalRadar },
  { chave: "arvore", rotulo: COPY_TELAS.arvore.navegacao, rota: "/portal/arvore", Componente: PortalArvore },
  { chave: "documentos", rotulo: COPY_TELAS.documentos.navegacao, rota: "/portal/documentos", Componente: PortalDocumentos },
  { chave: "legado", rotulo: COPY_TELAS.legado.navegacao, rota: "/portal/legado", Componente: PortalLegado },
  { chave: "conta", rotulo: COPY_TELAS.conta.navegacao, rota: "/portal/conta", Componente: PortalConta },
] as const;

export const TELAS_INTERNAS_PORTAL: Record<string, (typeof ABAS_APP_CLIENTE)[number]["Componente"] | typeof PortalEntregas | typeof PortalFase01 | typeof PortalFase02> = {
  "/portal": PortalHome,
  "/portal/jornada": PortalJornada,
  "/portal/radar": PortalRadar,
  "/portal/arvore": PortalArvore,
  "/portal/documentos": PortalDocumentos,
  "/portal/legado": PortalLegado,
  "/portal/conta": PortalConta,
  "/portal/entregas": PortalEntregas,
  "/portal/fase-01": PortalFase01,
  "/portal/fase-02": PortalFase02,
};

export function rotaInternaDoPortal(path: string): string {
  if (path in TELAS_INTERNAS_PORTAL) return path;
  return "/portal";
}
