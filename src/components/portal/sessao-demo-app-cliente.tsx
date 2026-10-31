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
import { BlocoExemploVisual } from "@/components/portal/bloco-exemplo-visual";
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

/**
 * Resolve aba inicial da prévia a partir do `aba` já validado pela rota
 * (7 abas + entregas|fase-01|fase-02 profundas) — função pura, sem tocar
 * `window`. O valor chega igual no servidor e no cliente porque quem lê a
 * URL é o Router (`validateSearch`), não este componente; isso é o que
 * elimina o mismatch de hidratação que existia ao ler `window.location`
 * direto num `useState` (o servidor não tem `window` e caía sempre em
 * "Home", o cliente corrigia depois de hidratar).
 */
function rotaInicialDaPrevia(aba?: string): string {
  const chave = aba?.toLowerCase().trim();
  if (!chave || chave === "home") return "/portal";
  const candidata = `/portal/${chave}`;
  return candidata in TELAS_INTERNAS_PORTAL ? candidata : "/portal";
}

export function SessaoDemoAppCliente({
  modo = "desk",
  abaInicial,
}: {
  modo?: "desk" | "cliente";
  abaInicial?: string;
}) {
  const [rotaInterna, setRotaInterna] = useState(() => rotaInicialDaPrevia(abaInicial));
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
      <div className="rounded-xl border border-navy/10 bg-cream/40 p-5">
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

      <details className="rounded-xl border border-navy/10 bg-card p-4" data-demo-exemplos-visuais>
        <summary className="cursor-pointer text-sm font-medium text-navy">
          Exemplos visuais ilustrativos (sem dado de família)
        </summary>
        <div className="mt-3 grid gap-4">
          {(["historia", "arvore", "origem", "documentos"] as const).map((tipo) => (
            <BlocoExemploVisual key={tipo} tipo={tipo} />
          ))}
        </div>
      </details>
    </div>
  );
}
