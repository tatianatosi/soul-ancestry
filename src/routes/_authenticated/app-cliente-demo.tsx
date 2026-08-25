import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { FontePortalProvider } from "@/components/portal/fonte-portal";
import { PortalJornada } from "@/routes/portal/jornada";
import { PortalArvore } from "@/routes/portal/arvore";
import { PortalRadar } from "@/routes/portal/radar";
import { CASO_DEMO_TITULO, DADOS_DEMO_SOPHIA, SELO_DEMO_PORTAL } from "@/lib/portal-demo-sophia";

/**
 * Sessão demo do App Cliente — superfície interna do Desk.
 *
 * Existe para a Proprietária mostrar a experiência do cliente a um futuro
 * cliente, compartilhando tela (decisão de 25/08/2026), e para conferir como
 * as telas estão de fato, sem depender de conta de cliente.
 *
 * O que faz esta tela valer: **ela renderiza os componentes reais do portal**,
 * não uma reprodução. `FontePortalProvider` troca a origem do dado, e só isso.
 * Quando o App Cliente muda, a demo muda junto — e bug aparece aqui porque é
 * o mesmo código.
 *
 * Nada de real é tocado: o dado vem de fixture declarado, nenhuma consulta ao
 * portal é disparada (a query fica desabilitada sob provider) e a trava de
 * classificação do portal autenticado segue intacta, porque este caminho não
 * passa por ela.
 */

export const Route = createFileRoute("/_authenticated/app-cliente-demo")({
  head: () => ({
    meta: [
      { title: "Sessão demo do App Cliente — Clube Ancestral" },
      {
        name: "description",
        content:
          "Demonstração interna da experiência do App Cliente, com caso fictício. Superfície do Desk.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppClienteDemo,
});

const TELAS = [
  { chave: "jornada", rotulo: "Jornada", Componente: PortalJornada },
  { chave: "arvore", rotulo: "Árvore da família", Componente: PortalArvore },
  { chave: "radar", rotulo: "Radar de países", Componente: PortalRadar },
] as const;

function AppClienteDemo() {
  const [ativa, setAtiva] = useState<(typeof TELAS)[number]["chave"]>("jornada");
  const Tela = TELAS.find((t) => t.chave === ativa)?.Componente ?? PortalJornada;

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
          {TELAS.map((t) => (
            <button
              key={t.chave}
              type="button"
              onClick={() => setAtiva(t.chave)}
              aria-pressed={ativa === t.chave}
              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                ativa === t.chave
                  ? "border-navy bg-navy text-cream"
                  : "border-navy/15 text-navy/75 hover:bg-navy/5"
              }`}
            >
              {t.rotulo}
            </button>
          ))}
        </div>
      </div>

      {/*
        A partir daqui é o App Cliente de verdade, com o dado da demo. O
        provider também põe o shell em modo de prévia: sem redirecionar quem
        não é cliente, com o selo no topo e sem encerrar a sessão do Desk.
      */}
      <div className="overflow-hidden rounded-xl border border-navy/15">
        <FontePortalProvider
          fonte={{
            dados: DADOS_DEMO_SOPHIA,
            carregando: false,
            erro: false,
            previa: { selo: SELO_DEMO_PORTAL, titulo: CASO_DEMO_TITULO },
          }}
        >
          <Tela />
        </FontePortalProvider>
      </div>
    </div>
  );
}
