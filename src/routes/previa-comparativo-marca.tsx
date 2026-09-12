import { createFileRoute, Link } from "@tanstack/react-router";

import { BrandLogo } from "@/components/brand";
import { MARCA_CORES, MARCA_TIPOGRAFIA, SITE_OFICIAL } from "@/lib/marca";
import { GRUPOS_DESK } from "@/lib/navegacao-desk";
import { SELO_DEMO_PORTAL } from "@/lib/portal-demo-sophia";

/**
 * Prévia pública — gate de marca/layout (OKI + mockup 17/47).
 * Paleta oficial + checklist de alinhamento + atalhos App/Desk.
 * Não declara aprovação; aguarda “Aprova marca/layout?” da proprietária.
 */

export const Route = createFileRoute("/previa-comparativo-marca")({
  head: () => ({
    meta: [
      { title: "Prévia comparativo marca — Clube Ancestral" },
      {
        name: "description",
        content:
          "Comparativo visual da marca OKI (hex) com App Cliente e Desk. Dados demonstrativos. Aguarda aprovação de marca/layout.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviaComparativoMarca,
});

const SWATCHES: { chave: string; hex: string; papel: string }[] = [
  { chave: "Navy", hex: MARCA_CORES.azul, papel: "Header / sidebar / títulos" },
  { chave: "Gold", hex: MARCA_CORES.dourado, papel: "CTA / destaque / filete" },
  { chave: "Cream", hex: MARCA_CORES.creme, papel: "Canvas / fundo" },
  { chave: "Terracotta", hex: MARCA_CORES.terracota, papel: "Alerta / ênfase" },
  { chave: "Preto", hex: MARCA_CORES.preto, papel: "Texto denso" },
];

const CHECKLIST: { item: string; status: "ok" | "prova" }[] = [
  { item: "App Cliente: exatamente 7 abas (Home → Conta)", status: "ok" },
  { item: "Entregas / Fase 01 / Fase 02 fora da barra", status: "ok" },
  { item: "Desk: 6 grupos GRUPOS_DESK (sem sidebar Lovable)", status: "ok" },
  { item: "Radar: teia 6 eixos em canvas cream + gold", status: "ok" },
  { item: "Árvore: estrutura G1–G5, G1 em gold, sem nomes inventados", status: "ok" },
  { item: "Home/Jornada/Documentos/Legado/Conta em painéis cream (sem SaaS branco)", status: "ok" },
  { item: "Desk Caso 360 / Pessoa 360 em painéis cream (não branco SaaS)", status: "ok" },
  { item: "Cadeia Jornada Desk com chrome OKI", status: "ok" },
  { item: "Desk Marketing/Leads/Financeiro/Contratos/Pesquisa em painéis cream", status: "ok" },
  { item: "Mesa Discovery (/calls) + conversão/propostas/CRM + módulo pesquisa em cream", status: "ok" },
  { item: "Painel Hoje (/painel) + Governança/Contrato detalhe/Onboarding/Evidências em cream", status: "ok" },
  { item: "App deep (proposta/mensagens/faturas) + Desk Governança/integrações/ops em cream", status: "ok" },
  { item: "Entregas sanitizadas (consultiva/modelo/fase02/studio) + módulos Desk em cream", status: "ok" },
  { item: "Mapa mockup 17 (7 App + faces Desk) + de-para 47 no gate de marca", status: "ok" },
  { item: "Radar: Desk 4 eixos jornada ≠ App 6 dimensões (identidades documentadas)", status: "ok" },
  { item: "Desk p.13/16: checklist e alertas com caso + responsável (vocabulário 47)", status: "ok" },
  { item: "Rotas profundas sem H1 Entregas/Fase 01/Fase 02", status: "ok" },
  { item: "Tokens hex = guia OKI (navy/gold/cream/terracotta)", status: "ok" },
  { item: "Site SEO ≠ app Vercel", status: "ok" },
];

function PreviaComparativoMarca() {
  return (
    <div className="min-h-screen bg-cream text-navy" data-previa-comparativo-marca>
      <header className="border-b border-navy/10 bg-navy px-4 py-6 text-cream sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size={48} variant="client-dark" showText={false} />
            <div>
              <p className="font-serif text-3xl leading-none text-gold sm:text-4xl">Clube Ancestral</p>
              <p className="mt-1 text-sm text-cream/70">Gate visual · marca OKI · mockup 17/47</p>
            </div>
          </div>
          <p
            role="status"
            className="rounded-md border border-gold/50 bg-gold/20 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-gold"
          >
            {SELO_DEMO_PORTAL}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-10 px-4 py-8 sm:px-8">
        <section aria-labelledby="paleta-titulo">
          <h1 id="paleta-titulo" className="font-serif text-2xl text-navy">
            Paleta oficial (guia OKI)
          </h1>
          <p className="mt-1 text-sm text-navy/65">
            Hex de runtime. Pantone/CMYK ficam na impressão. Tipografia funcional:{" "}
            {MARCA_TIPOGRAFIA.guiaImpressoFuncional}; títulos no app: Cormorant Garamond.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SWATCHES.map((s) => (
              <li
                key={s.chave}
                className="overflow-hidden rounded-xl border border-navy/10 bg-cream/60 shadow-sm"
                data-swatch={s.chave.toLowerCase()}
              >
                <div className="h-16 w-full" style={{ backgroundColor: s.hex }} aria-hidden />
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-navy">{s.chave}</p>
                  <p className="font-mono text-xs text-navy/60">{s.hex}</p>
                  <p className="mt-0.5 text-[11px] text-navy/50">{s.papel}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="checklist-titulo">
          <h2 id="checklist-titulo" className="font-serif text-xl text-navy">
            Checklist de alinhamento
          </h2>
          <p className="mt-1 text-sm text-navy/65">
            Conteúdo Ordem 1 já aprovado. Marca/layout ainda aguardam evidência + resposta da
            proprietária.
          </p>
          <ul className="mt-4 space-y-2">
            {CHECKLIST.map((c) => (
              <li
                key={c.item}
                className="flex items-start gap-3 rounded-lg border border-navy/10 bg-cream/50 px-3 py-2 text-sm"
              >
                <span
                  className={
                    c.status === "ok"
                      ? "mt-0.5 shrink-0 rounded bg-navy/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-navy"
                      : "mt-0.5 shrink-0 rounded bg-gold/25 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-navy"
                  }
                >
                  {c.status === "ok" ? "feito" : "prova"}
                </span>
                <span className="text-navy/80">{c.item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="atalhos-titulo">
          <h2 id="atalhos-titulo" className="font-serif text-xl text-navy">
            Abrir superfícies de prova
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href="/previa-app-cliente?aba=radar"
              className="rounded-xl border border-navy/15 bg-cream/70 px-4 py-3 text-sm text-navy transition-colors hover:border-gold"
            >
              <span className="font-medium">App · Radar</span>
              <span className="mt-0.5 block text-xs text-navy/55">/previa-app-cliente?aba=radar</span>
            </a>
            <a
              href="/previa-app-cliente?aba=arvore"
              className="rounded-xl border border-navy/15 bg-cream/70 px-4 py-3 text-sm text-navy transition-colors hover:border-gold"
            >
              <span className="font-medium">App · Árvore</span>
              <span className="mt-0.5 block text-xs text-navy/55">/previa-app-cliente?aba=arvore</span>
            </a>
            <Link
              to="/previa-app-cliente"
              className="rounded-xl border border-navy/15 bg-cream/70 px-4 py-3 text-sm text-navy transition-colors hover:border-gold"
            >
              <span className="font-medium">App Cliente (7 abas)</span>
              <span className="mt-0.5 block text-xs text-navy/55">/previa-app-cliente</span>
            </Link>
            <Link
              to="/previa-desk-indicadores"
              className="rounded-xl border border-navy/15 bg-cream/70 px-4 py-3 text-sm text-navy transition-colors hover:border-gold"
            >
              <span className="font-medium">Desk faces 11–17</span>
              <span className="mt-0.5 block text-xs text-navy/55">/previa-desk-indicadores</span>
            </Link>

            <a
              href="/previa-desk-indicadores?face=comercial"
              className="rounded-xl border border-navy/15 bg-cream/70 px-4 py-3 text-sm text-navy transition-colors hover:border-gold"
            >
              <span className="font-medium">Desk · Marketing & Comercial</span>
              <span className="mt-0.5 block text-xs text-navy/55">/previa-desk-indicadores?face=comercial</span>
            </a>
            <a
              href="/previa-desk-indicadores?face=formalizacao"
              className="rounded-xl border border-navy/15 bg-cream/70 px-4 py-3 text-sm text-navy transition-colors hover:border-gold"
            >
              <span className="font-medium">Desk · Formalização & Financeiro</span>
              <span className="mt-0.5 block text-xs text-navy/55">/previa-desk-indicadores?face=formalizacao</span>
            </a>
            <a
              href="/previa-desk-indicadores?face=pesquisa"
              className="rounded-xl border border-navy/15 bg-cream/70 px-4 py-3 text-sm text-navy transition-colors hover:border-gold"
            >
              <span className="font-medium">Desk · Inteligência & Pesquisa</span>
              <span className="mt-0.5 block text-xs text-navy/55">/previa-desk-indicadores?face=pesquisa</span>
            </a>

            <a
              href="/previa-desk-indicadores?face=governanca"
              className="rounded-xl border border-navy/15 bg-cream/40 px-4 py-3 text-sm text-navy transition-colors hover:border-gold"
            >
              <span className="font-medium">Desk · Governança & Admin</span>
              <span className="mt-0.5 block text-xs text-navy/55">/previa-desk-indicadores?face=governanca</span>
            </a>
            <Link
              to="/previa-caseid"
              className="rounded-xl border border-navy/15 bg-cream/70 px-4 py-3 text-sm text-navy transition-colors hover:border-gold"
            >
              <span className="font-medium">Ordem 2 · caseId</span>
              <span className="mt-0.5 block text-xs text-navy/55">/previa-caseid</span>
            </Link>
          </div>
        </section>

        <section
          aria-labelledby="desk-grupos"
          className="rounded-xl border border-navy/10 bg-navy p-4 text-cream"
        >
          <h2 id="desk-grupos" className="font-serif text-lg text-gold">
            Desk vigente — 6 grupos
          </h2>
          <ol className="mt-3 grid gap-1 sm:grid-cols-2">
            {GRUPOS_DESK.map((g, i) => (
              <li key={g.id} className="text-sm text-cream/80">
                <span className="text-gold/80">{i + 1}.</span> {g.label}
              </li>
            ))}
          </ol>
        </section>

        
        <section aria-labelledby="mapa-titulo">
          <h2 id="mapa-titulo" className="font-serif text-xl text-navy">
            Mapa mockup 17 → runtime (prova)
          </h2>
          <p className="mt-1 text-sm text-navy/65">
            Cada célula abre a prévia correspondente. Auditoria 47 (estados/indicadores) acompanha o de-para
            em <code className="font-mono text-xs">RESGATE-MOCKUP-MARCA-APP-DESK.md</code>.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-navy/10 bg-cream/40 p-4">
              <p className="text-[11px] uppercase tracking-wide text-navy/50">App Cliente · 7 abas</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {[
                  ["Home", "/previa-app-cliente?aba=home"],
                  ["Jornada", "/previa-app-cliente?aba=jornada"],
                  ["Radar", "/previa-app-cliente?aba=radar"],
                  ["Árvore", "/previa-app-cliente?aba=arvore"],
                  ["Documentos", "/previa-app-cliente?aba=documentos"],
                  ["Legado", "/previa-app-cliente?aba=legado"],
                  ["Conta", "/previa-app-cliente?aba=conta"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <a href={href} className="text-navy underline decoration-gold/50 underline-offset-2 hover:decoration-gold">
                      {label}
                    </a>
                    <span className="ml-2 font-mono text-[10px] text-navy/45">{href.replace("/previa-app-cliente?aba=", "")}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-navy/10 bg-cream/40 p-4">
              <p className="text-[11px] uppercase tracking-wide text-navy/50">Desk · faces 11–17 + grupos</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {[
                  ["p.11 Visão", "visao"],
                  ["p.12 Caso 360", "caso360"],
                  ["p.13 Checklist", "checklist"],
                  ["p.14 Jurídica", "juridica"],
                  ["p.15 Radar", "radar"],
                  ["p.16 Alertas", "alertas"],
                  ["p.17 Biblioteca", "biblioteca"],
                  ["Comercial / Mesa", "comercial"],
                  ["Governança", "governanca"],
                ].map(([label, face]) => (
                  <li key={face}>
                    <a
                      href={`/previa-desk-indicadores?face=${face}`}
                      className="text-navy underline decoration-gold/50 underline-offset-2 hover:decoration-gold"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-gold/40 bg-cream/50 px-4 py-3 text-sm text-navy">
            De-para 47 (KPIs / estados): Visão · Caso 360 · Checklist · Jurídica · Radar · Alertas · Biblioteca —
            cada linha exige escritor + RPC + UI + print. Ordens 3–7 bloqueadas até marca/layout + merge.
          </div>
        </section>

        <section
          aria-labelledby="gate-titulo"
          className="rounded-xl border-2 border-gold/60 bg-gold/15 px-4 py-5 text-center"
        >
          <h2 id="gate-titulo" className="font-serif text-xl text-navy">
            Gate da proprietária
          </h2>
          <p className="mt-2 text-sm text-navy/75">
            Marca/layout <strong>ainda não aprovados</strong>. Conteúdo Ordem 1 (mobile/desktop) já
            aprovado. Sem merge de produção sem <strong>sim</strong> + branch + SHA.
          </p>
          <ul className="mt-4 space-y-1 text-sm font-medium text-navy">
            <li>1. Aprova marca/layout?</li>
            <li>2. Aprova Ordem 2 caseId para merge?</li>
            <li>3. Produção: sim + branch + SHA?</li>
          </ul>
          <p className="mt-4 text-xs text-navy/50">
            Site institucional:{" "}
            <a href={SITE_OFICIAL} className="underline decoration-gold/60" rel="noreferrer">
              {SITE_OFICIAL}
            </a>{" "}
            (não é o app).
          </p>
        </section>
      </main>
    </div>
  );
}
