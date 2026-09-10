import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalHome } from "@/routes/portal/index";
import { PortalJornada } from "@/routes/portal/jornada";
import { PortalRadar } from "@/routes/portal/radar";
import { PortalArvore } from "@/routes/portal/arvore";
import { PortalDocumentos } from "@/routes/portal/documentos";
import { PortalLegado } from "@/routes/portal/legado";
import { PortalConta } from "@/routes/portal/conta";

/** Sete abas do mockup. Entregas / Fase 01 / Fase 02 não são 1º nível: abrem pela jornada. */
export const ABAS_APP_CLIENTE = [
  { chave: "home", rotulo: COPY_TELAS.home.navegacao, Componente: PortalHome },
  { chave: "jornada", rotulo: COPY_TELAS.jornada.navegacao, Componente: PortalJornada },
  { chave: "radar", rotulo: COPY_TELAS.radar.navegacao, Componente: PortalRadar },
  { chave: "arvore", rotulo: COPY_TELAS.arvore.navegacao, Componente: PortalArvore },
  { chave: "documentos", rotulo: COPY_TELAS.documentos.navegacao, Componente: PortalDocumentos },
  { chave: "legado", rotulo: COPY_TELAS.legado.navegacao, Componente: PortalLegado },
  { chave: "conta", rotulo: COPY_TELAS.conta.navegacao, Componente: PortalConta },
] as const;
