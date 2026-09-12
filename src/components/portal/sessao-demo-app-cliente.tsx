import { useState } from "react";

import { FontePortalProvider } from "@/components/portal/fonte-portal";
import {
  ABAS_APP_CLIENTE,
  TELAS_INTERNAS_PORTAL,
  rotaInternaDoPortal,
} from "@/components/portal/abas-app-cliente";
import {
  CASO_DEMO_TITULO,
  DADOS_DEMO_SOPHIA,
  IDENTIDADE_DEMO_SOPHIA,
  SELO_DEMO_PORTAL,
} from "@/lib/portal-demo-sophia";
import { escopoAPartirDePublicacoes } from "@/lib/app-visibilidade";

/**
 * Sessão demo do App Cliente — componentes reais do portal + fixture.
 *
 * - `modo="cliente"`: full-bleed só com PortalShell (prévia go-live / mockup).
 * - `modo="desk"`: card + pills do Desk em volta (ferramenta interna).
 */

const ESCOPO_DEMO = escopoAPartirDePublicacoes({
  temCaso: true,
  tiposPublicados: DADOS_DEMO_SOPHIA.projecoes.map((p) => String(p.projection_type ?? "")),
});

export function SessaoDemoAppCliente({
  modo = "desk",
}: {
  modo?: "desk" | "cliente";
}) {
  const [rotaInterna, setRotaInterna] = useState("/portal");
  const Tela = TELAS_INTERNAS_PORTAL[rotaInterna] ?? TELAS_INTERNAS_PORTAL["/portal"]!;

  const app = (
    <FontePortalProvider
      fonte={{
        dados: DADOS_DEMO_SOPHIA,
        carregando: false,
        erro: false,
        escopo: ESCOPO_DEMO,
        aoNavegar: (path) => setRotaInterna(rotaInternaDoPortal(path)),
        rotaInterna,
        previa: {
          selo: SELO_DEMO_PORTAL,
          titulo: CASO_DEMO_TITULO,
          destinoSair: modo === "cliente" ? "/acesso" : "/acessos-portal",
          identidade: IDENTIDADE_DEMO_SOPHIA,
        },
      }}
    >
      <Tela />
    </FontePortalProvider>
  );

  if (modo === "cliente") {
    return <div data-previa-app-cliente-bleed>{app}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-navy/10 bg-white p-5">
        <h1 className="font-serif text-xl text-navy">Sessão demo do App Cliente</h1>
        <p className="mt-1 text-sm text-navy/70">
          A experiência que o cliente vê, com um caso fictício. São as telas reais do App Cliente —
          quando elas mudam, esta demonstração muda junto.
        </p>
        <p className="mt-2 text-xs text-navy/55">
          Caso: <span className="font-medium text-navy/75">{CASO_DEMO_TITULO}</span>. Nenhum dado de
          cliente real é lido aqui, e nada nesta tela envia, publica ou altera qualquer registro.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {ABAS_APP_CLIENTE.map((t) => (
            <button
              key={t.chave}
              type="button"
              onClick={() => setRotaInterna(t.rota)}
              aria-pressed={rotaInterna === t.rota}
              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                rotaInterna === t.rota
                  ? "border-navy bg-navy text-cream"
                  : "border-navy/15 text-navy/75 hover:bg-navy/5"
              }`}
            >
              {t.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-navy/15" data-demo-app-cliente>
        {app}
      </div>
    </div>
  );
}
