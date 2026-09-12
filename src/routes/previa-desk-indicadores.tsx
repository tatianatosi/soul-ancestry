import { createFileRoute, Link } from "@tanstack/react-router";

import { BrandLogo } from "@/components/brand";
import { CardIndicador } from "@/components/desk/ui-desk";
import { GRUPOS_DESK } from "@/lib/navegacao-desk";
import { SELO_DEMO_PORTAL } from "@/lib/portal-demo-sophia";

/**
 * Prévia pública — indicadores Desk (mockup 17 p.11–12 + vocabulário 47).
 * Chrome OKI + KPIs alinhados ao PainelDia / Caso 360. Sem auth.
 * Não restaura sidebar Lovable de 14 itens: lista os 6 GRUPOS_DESK.
 */

export const Route = createFileRoute("/previa-desk-indicadores")({
  head: () => ({
    meta: [
      { title: "Prévia indicadores Desk — Clube Ancestral" },
      {
        name: "description",
        content:
          "Prévia visual dos indicadores Visão Geral e Caso 360 sob marca OKI. Dados demonstrativos.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviaDeskIndicadores,
});

function PreviaDeskIndicadores() {
  return (
    <div className="min-h-screen bg-cream text-navy" data-previa-desk-indicadores>
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 bg-navy p-4 text-cream sm:block">
          <div className="flex items-center gap-2">
            <BrandLogo size={28} variant="client-dark" showText={false} />
            <p className="font-serif text-base text-gold">Clube Ancestral</p>
          </div>
          <div className="mt-3 h-0.5 w-full bg-gold/80" aria-hidden />
          <p className="mt-4 text-[10px] uppercase tracking-widest text-cream/50">
            Desk · 6 grupos
          </p>
          <nav className="mt-2 space-y-1">
            {GRUPOS_DESK.map((g) => (
              <div
                key={g.id}
                className={
                  g.id === "hoje"
                    ? "rounded-lg bg-gold px-3 py-2 text-sm font-medium text-navy"
                    : "rounded-lg px-3 py-2 text-sm text-cream/70"
                }
              >
                {g.label}
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-navy/10 bg-cream px-4 py-4 lg:px-8">
            <span className="sm:hidden"><BrandLogo size={30} variant="client-light" showText={false} /></span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-serif text-2xl">Visão Geral</h1>
              <p className="text-sm text-navy/60">
                Indicadores operacionais do dia — vocabulário mockup 47
              </p>
            </div>
            <Link
              to="/previa-app-cliente"
              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy hover:border-gold"
            >
              Ver App Cliente
            </Link>
          </header>

          <p
            role="status"
            className="border-b border-gold/40 bg-gold/15 px-4 py-2 text-center text-[11px] font-medium uppercase tracking-widest text-navy"
          >
            {SELO_DEMO_PORTAL}
          </p>

          <main className="space-y-8 p-4 lg:p-8">
            <section aria-label="KPIs Visão Geral" className="space-y-3">
              <p className="text-[11px] uppercase tracking-wide text-navy/50">
                Painel Hoje · decisão (sem receita / conversão)
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-navy/10 bg-cream/50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-navy/50">Casos ativos</p>
                  <p className="mt-1 text-sm font-medium text-navy">Ver contagem em Casos 360</p>
                  <p className="mt-0.5 text-xs text-navy/55">Fonte canônica — sem segundo número aqui</p>
                </div>
                <CardIndicador rotulo="Alertas pendentes" valor={7} apoio="Fila em Alertas" tom="atencao" />
                <CardIndicador
                  rotulo="Leads sem próxima ação"
                  valor={4}
                  apoio="Mesa de Discovery"
                  tom="atencao"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <CardIndicador rotulo="Ações vencidas" valor={3} apoio="Reprogramar ou concluir" tom="critico" />
                <CardIndicador rotulo="Ações para hoje" valor={5} apoio="Fila do dia" tom="atencao" />
                <CardIndicador rotulo="Sem responsável" valor={1} apoio="Atribuir dono" tom="atencao" />
                <CardIndicador rotulo="Exceções críticas" valor={2} apoio="Bloqueios operacionais" tom="critico" />
                <CardIndicador rotulo="SLA em risco" valor={null} apoio="Sem dados suficientes" />
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  ["Cadências atrasadas", "—", "Ops"],
                  ["Calls de hoje", "2", "Discovery"],
                  ["Propostas sem follow-up", "1", "Comercial"],
                ].map(([r, v, a]) => (
                  <div
                    key={r}
                    className="flex items-baseline justify-between gap-3 rounded-lg border border-navy/10 bg-cream/40 px-3 py-2 text-sm"
                  >
                    <span>
                      <span className="block text-[11px] uppercase tracking-wide text-navy/50">{r}</span>
                      <span className="text-xs text-navy/65">{a}</span>
                    </span>
                    <span className="font-serif text-xl tabular-nums">{v}</span>
                  </div>
                ))}
              </div>
            </section>

            <section aria-label="Caso 360 — quatro indicadores" className="space-y-3">
              <div>
                <h2 className="font-serif text-xl text-navy">Caso 360 · quatro indicadores</h2>
                <p className="text-sm text-navy/65">
                  Jornada · Pessoas · Contrato · Pesquisa (mockup p.12 / auditoria 47)
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Jornada/onboarding", "1 bloqueio de ativação"],
                  ["Pessoas/família", "3 pessoa(s) no caso"],
                  ["Contrato", "Formalização em andamento"],
                  ["Pesquisa/entregas", "4 evidência(s) · 1 pendência"],
                ].map(([t, d]) => (
                  <div key={t} className="rounded-xl border border-navy/10 bg-cream/50 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-navy/50">{t}</p>
                    <p className="mt-1 text-sm font-medium text-navy">{d}</p>
                  </div>
                ))}
              </div>
            </section>

            <p className="text-xs text-navy/50">
              Runtime vivo: <code className="font-mono">/painel</code> e{" "}
              <code className="font-mono">/casos/$caseId</code> (auth staff). Esta prévia é chrome +
              vocabulário para gate de marca/layout.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
