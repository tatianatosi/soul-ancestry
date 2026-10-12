import { BookOpen, Compass, FileText, Flag, GitFork, Home, UserRound } from "lucide-react";
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

/** Sete abas canônicas. Entregas / Fase 01 / Fase 02 não são 1º nível: abrem pela jornada. */
export const ABAS_APP_CLIENTE = [
  { chave: "home", rotulo: "Painel", rota: "/portal", Icone: Home, Componente: PortalHome },
  { chave: "jornada", rotulo: "Jornada", rota: "/portal/jornada", Icone: Flag, Componente: PortalJornada },
  { chave: "arvore", rotulo: "Árvore", rota: "/portal/arvore", Icone: GitFork, Componente: PortalArvore },
  { chave: "radar", rotulo: "Descobertas", rota: "/portal/radar", Icone: Compass, Componente: PortalRadar },
  { chave: "documentos", rotulo: "Documentos", rota: "/portal/documentos", Icone: FileText, Componente: PortalDocumentos },
  { chave: "legado", rotulo: "Biblioteca", rota: "/portal/legado", Icone: BookOpen, Componente: PortalLegado },
  { chave: "conta", rotulo: "Conta", rota: "/portal/conta", Icone: UserRound, Componente: PortalConta },
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
