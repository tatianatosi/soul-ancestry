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
  { item: "Desk p.14 Jurídica: tema · status · responsável · versão · bloqueia (sem rótulo Fase 01)", status: "ok" },
  { item: "Desk p.17 Biblioteca: subáreas canônicas + país/versão/vigência/responsável", status: "ok" },
  { item: "Desk p.11/12: Visão (fila/ações/responsável) + Caso 360 (caso·próxima ação·4 eixos)", status: "ok" },
  { item: "App Home cream puro (sem gradiente to-white) + caseId prévia em cream", status: "ok" },
  { item: "Formalização cream (contrato/anexo/governança sem bg-white SaaS)", status: "ok" },
  { item: "Painel Hoje abertura cream (sem gradiente to-white) + relatório visual cream", status: "ok" },
  { item: "Pesquisa Desk: fonte · pessoa · status CHECK · hipótese≠fato · caso", status: "ok" },
  { item: "Canvas cliente cream (entrega por link) + Pessoas/Comercial/Governança vocab 47", status: "ok" },
  { item: "TIPO_CLIENTE.cartao cream (token permanente App — sem bg-white)", status: "ok" },
  { item: "Cadeia Jornada Desk: elo · caso · responsável · prazo (vocab 47)", status: "ok" },
  { item: "Governança modelos + RelatorioVisual: Card/bg-card → cream (sem #FFF SaaS)", status: "ok" },
  { item: "Mockup primitives (/mockup): Card/Kpi/nav cream (sem bg-card)", status: "ok" },
  { item: "App Conta densificada: perfil · plano · alertas · histórico (vocab 47 + vaz específicos)", status: "ok" },
  { item: "App Legado densificado: prateleiras Cadernos·Relatórios·Narrativas·Memória + Premium só com publicação", status: "ok" },
  { item: "DetalhesTecnicos cream (sem bg-card residual)", status: "ok" },
  { item: "App Documentos: checklist sem inventar certidão; meta caso·liberados·enviados + próxima ação real", status: "ok" },
  { item: "App Jornada/Árvore/Radar: meta strips vocab 47 (caso·marcos/G1–G5/6 dims) sem inventar nomes/%", status: "ok" },
  { item: "App Home: meta caso·progresso·próxima ação·achados (sem % inventado na barra)", status: "ok" },
  { item: "App Jornada: duas linhas História|Seu caso + União de Ramos só com publicações reais", status: "ok" },
  { item: "Rotas profundas densificadas: meta caso·tipo·publicados·estado (Materiais/Relatório/Atualização)", status: "ok" },
  { item: "Rotas profundas App: Materiais/Relatório/Atualização (sem H1 Fase 01/02)", status: "ok" },
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
            Hex de runtime. Pantone/CMYK ficam na impressão (guia OKI) — não inventar código
            Pantone no runtime. Tipografia funcional: {MARCA_TIPOGRAFIA.guiaImpressoFuncional};
            títulos no app: Cormorant Garamond.
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
          <p data-pantone-nota className="mt-3 rounded-lg border border-navy/10 bg-cream/40 px-3 py-2 text-xs text-navy/65">
            Hex canônicos em <code className="font-mono">MARCA_CORES</code> (#2F4B6E · #FCB73A · #ECDFCD · #9A3A2F).
            Pantone/CMYK só no guia impresso — runtime não inventa código Pantone.
          </p>
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
            Mapa mockup 17 → runtime + vocabulário 47
          </h2>
          <p className="mt-1 text-sm text-navy/65">
            Cada linha: página · vocabulário de prova · atalho. De-para completo em{" "}
            <code className="font-mono text-xs">RESGATE-MOCKUP-MARCA-APP-DESK.md</code>.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-navy/10 bg-cream/40 p-4">
              <p className="text-[11px] uppercase tracking-wide text-navy/50">App Cliente · 7 abas (mockup)</p>
              <ul className="mt-2 divide-y divide-navy/10 text-sm">
                {[
                  ["Home", "caso · progresso · próxima ação · achados", "/previa-app-cliente?aba=home"],
                  ["Jornada", "linha do tempo · publicações sanitizadas", "/previa-app-cliente?aba=jornada"],
                  ["Radar", "6 dimensões (≠ Desk 4 eixos)", "/previa-app-cliente?aba=radar"],
                  ["Árvore", "G1–G5 · sem nomes inventados", "/previa-app-cliente?aba=arvore"],
                  ["Documentos", "checklist · uploads · entregas", "/previa-app-cliente?aba=documentos"],
                  ["Legado", "biblioteca · Premium só com publicação", "/previa-app-cliente?aba=legado"],
                  ["Conta", "perfil · plano · alertas · histórico", "/previa-app-cliente?aba=conta"],
                ].map(([label, vocab, href]) => (
                  <li key={href} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                    <a
                      href={href}
                      className="font-medium text-navy underline decoration-gold/50 underline-offset-2 hover:decoration-gold"
                    >
                      {label}
                    </a>
                    <span className="text-[11px] text-navy/55">{vocab}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-navy/10 bg-cream/40 p-4">
              <p className="text-[11px] uppercase tracking-wide text-navy/50">Desk · faces 11–17 (auditoria 47)</p>
              <ul className="mt-2 divide-y divide-navy/10 text-sm">
                {[
                  ["p.11 Visão", "fila · vencidas · responsável · exceções", "visao"],
                  ["p.12 Caso 360", "caso · próxima ação · 4 eixos · bloqueio", "caso360"],
                  ["p.13 Checklist", "tarefa · caso · responsável · prazo", "checklist"],
                  ["p.14 Jurídica", "tema · status · versão · bloqueia", "juridica"],
                  ["p.15 Radar", "4 eixos jornada (≠ App 6 dims)", "radar"],
                  ["p.16 Alertas", "sinal · caso · responsável · criticidade", "alertas"],
                  ["p.17 Biblioteca", "subárea · país · versão · vigência", "biblioteca"],
                ].map(([label, vocab, face]) => (
                  <li key={face} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                    <a
                      href={`/previa-desk-indicadores?face=${face}`}
                      className="font-medium text-navy underline decoration-gold/50 underline-offset-2 hover:decoration-gold"
                    >
                      {label}
                    </a>
                    <span className="text-[11px] text-navy/55">{vocab}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-navy/50">
                Grupos satélite (não são p.11–17):{" "}
                <a href="/previa-desk-indicadores?face=comercial" className="underline decoration-gold/40">
                  Comercial
                </a>
                {" · "}
                <a href="/previa-desk-indicadores?face=governanca" className="underline decoration-gold/40">
                  Governança
                </a>
                {" · "}
                <a href="/previa-caseid" className="underline decoration-gold/40">
                  caseId
                </a>
                {" · "}
                <a href="/previa-app-cliente?aba=entregas" className="underline decoration-gold/40">
                  Materiais
                </a>
                {" · "}
                <a href="/previa-app-cliente?aba=fase-01" className="underline decoration-gold/40">
                  Relatório
                </a>
                {" · "}
                <a href="/previa-app-cliente?aba=fase-02" className="underline decoration-gold/40">
                  Atualização
                </a>
              </p>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-gold/40 bg-cream/50 px-4 py-3 text-sm text-navy">
            De-para 47: cada indicador exige escritor + RPC/persistência + UI + print. Ordens 3–7 backend
            bloqueadas até <strong>marca/layout</strong> + merge autorizado.
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
