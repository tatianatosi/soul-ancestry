import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { BrandLogo } from "@/components/brand";
import { BadgeDesk, CardIndicador, type TomEstado } from "@/components/desk/ui-desk";
import { GRUPOS_DESK } from "@/lib/navegacao-desk";
import { SELO_DEMO_PORTAL } from "@/lib/portal-demo-sophia";

/**
 * Prévia pública — faces Desk mockup 17 p.11–17 + vocabulário 47.
 * Chrome OKI + DEMO. Sem auth. Não restaura sidebar Lovable: 6 GRUPOS_DESK.
 * Deep-link: ?face=visao|caso360|checklist|juridica|radar|alertas|biblioteca
 */

export const Route = createFileRoute("/previa-desk-indicadores")({
  head: () => ({
    meta: [
      { title: "Prévia Desk faces 11–17 — Clube Ancestral" },
      {
        name: "description",
        content:
          "Prévia visual das faces Desk (Visão Geral, Caso 360, Checklist, Jurídica, Radar, Alertas, Biblioteca) sob marca OKI. Dados demonstrativos.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviaDeskIndicadores,
});

type FaceId =
  | "visao"
  | "caso360"
  | "checklist"
  | "juridica"
  | "radar"
  | "alertas"
  | "biblioteca";

const FACES: { id: FaceId; rotulo: string; pagina: string }[] = [
  { id: "visao", rotulo: "Visão Geral", pagina: "p.11" },
  { id: "caso360", rotulo: "Caso 360", pagina: "p.12" },
  { id: "checklist", rotulo: "Checklist", pagina: "p.13" },
  { id: "juridica", rotulo: "Validação Jurídica", pagina: "p.14" },
  { id: "radar", rotulo: "Radar Interno", pagina: "p.15" },
  { id: "alertas", rotulo: "Alertas", pagina: "p.16" },
  { id: "biblioteca", rotulo: "Biblioteca Mestre", pagina: "p.17" },
];

const FACES_VALIDAS = new Set<string>(FACES.map((f) => f.id));

function faceDaQuery(): FaceId {
  if (typeof window === "undefined") return "visao";
  const raw = new URLSearchParams(window.location.search).get("face")?.toLowerCase().trim();
  return raw && FACES_VALIDAS.has(raw) ? (raw as FaceId) : "visao";
}

function PreviaDeskIndicadores() {
  // SSR e 1º paint: sempre "visao" — evita mismatch de hidratação com ?face=
  const [face, setFace] = useState<FaceId>("visao");
  const meta = useMemo(() => FACES.find((f) => f.id === face)!, [face]);

  useEffect(() => {
    setFace(faceDaQuery());
  }, []);

  function irPara(id: FaceId) {
    setFace(id);
    const url = new URL(window.location.href);
    url.searchParams.set("face", id);
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <div className="min-h-screen bg-cream text-navy" data-previa-desk-indicadores data-face={face}>
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 bg-navy p-4 text-cream sm:block">
          <div className="flex items-center gap-2">
            <BrandLogo size={28} variant="client-dark" showText={false} />
            <p className="font-serif text-base text-gold">Clube Ancestral</p>
          </div>
          <div className="mt-3 h-0.5 w-full bg-gold/80" aria-hidden />
          <p className="mt-4 text-[10px] uppercase tracking-widest text-cream/50">Desk · 6 grupos</p>
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
            <span className="sm:hidden">
              <BrandLogo size={30} variant="client-light" showText={false} />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-serif text-2xl">{meta.rotulo}</h1>
              <p className="text-sm text-navy/60">
                Mockup 17 {meta.pagina} · chrome OKI · dados demonstrativos
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

          <nav
            aria-label="Faces Desk mockup 11–17"
            className="flex gap-1 overflow-x-auto border-b border-navy/10 bg-cream/80 px-3 py-2"
          >
            {FACES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => irPara(f.id)}
                data-face-tab={f.id}
                className={
                  face === f.id
                    ? "shrink-0 rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-cream"
                    : "shrink-0 rounded-lg px-3 py-1.5 text-xs text-navy/70 hover:bg-navy/5"
                }
              >
                {f.rotulo}
              </button>
            ))}
          </nav>

          <main className="space-y-6 p-4 lg:p-8">
            {face === "visao" ? <FaceVisao /> : null}
            {face === "caso360" ? <FaceCaso360 /> : null}
            {face === "checklist" ? <FaceChecklist /> : null}
            {face === "juridica" ? <FaceJuridica /> : null}
            {face === "radar" ? <FaceRadar /> : null}
            {face === "alertas" ? <FaceAlertas /> : null}
            {face === "biblioteca" ? <FaceBiblioteca /> : null}

            <p className="text-xs text-navy/50">
              Runtime vivo (auth staff): <code className="font-mono">/painel</code>,{" "}
              <code className="font-mono">/casos/$caseId</code>, <code className="font-mono">/tarefas</code>,{" "}
              <code className="font-mono">/matriz-juridica</code>, <code className="font-mono">/qualidade</code>,{" "}
              <code className="font-mono">/alertas</code>, <code className="font-mono">/biblioteca</code>.{" "}
              <code className="font-mono">GRUPOS_DESK</code> permanece 6.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}

function FaceVisao() {
  return (
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
        <CardIndicador rotulo="Leads sem próxima ação" valor={4} apoio="Mesa de Discovery" tom="atencao" />
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
  );
}

function FaceCaso360() {
  return (
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
  );
}

function FaceChecklist() {
  const itens: { titulo: string; status: string; prioridade: string; prazo: string; tom: TomEstado }[] = [
    {
      titulo: "Coletar certidão de nascimento (titular)",
      status: "Em andamento",
      prioridade: "Alta",
      prazo: "Hoje",
      tom: "atencao",
    },
    {
      titulo: "Validar vínculo G2–G3 na árvore",
      status: "Pendente",
      prioridade: "Média",
      prazo: "Amanhã",
      tom: "neutro",
    },
    {
      titulo: "Publicar nota sanitizada no Radar",
      status: "Bloqueada",
      prioridade: "Alta",
      prazo: "—",
      tom: "bloqueio",
    },
  ];
  return (
    <section aria-label="Checklist operacional" className="space-y-3">
      <p className="text-sm text-navy/65">
        Tarefas com caso, responsável, prazo e bloqueio — chrome cream (EntidadeCrud vivo em{" "}
        <code className="font-mono">/tarefas</code>).
      </p>
      <div className="grid gap-3">
        {itens.map((i) => (
          <article key={i.titulo} className="rounded-xl border border-navy/15 bg-cream/50 p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-medium text-navy">{i.titulo}</h3>
              <BadgeDesk texto={i.status} tom={i.tom} />
            </div>
            <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/60">
              <div>
                <dt className="inline text-navy/45">Prioridade: </dt>
                <dd className="inline">{i.prioridade}</dd>
              </div>
              <div>
                <dt className="inline text-navy/45">Prazo: </dt>
                <dd className="inline">{i.prazo}</dd>
              </div>
              <div>
                <dt className="inline text-navy/45">Caso: </dt>
                <dd className="inline font-mono">CA-ITA-SOPHI-PICCOLI</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function FaceJuridica() {
  const temas: { tema: string; status: string; bloqueia: boolean; tom: TomEstado }[] = [
    { tema: "Representação de menor", status: "Pendente", bloqueia: true, tom: "atencao" },
    { tema: "Escopo de pesquisa Fase 01", status: "Aprovado", bloqueia: false, tom: "sucesso" },
    { tema: "Compartilhamento com núcleo", status: "Em revisão", bloqueia: true, tom: "neutro" },
  ];
  return (
    <section aria-label="Validação Jurídica" className="space-y-3">
      <div className="rounded-xl border border-navy/10 bg-cream/50 p-4 text-sm text-navy">
        2 tema(s) bloqueante(s) sem decisão: assinatura fica como pendência.
      </div>
      <div className="space-y-3">
        {temas.map((t) => (
          <article key={t.tema} className="rounded-xl border border-navy/10 bg-cream/50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-serif text-lg text-navy">{t.tema}</h3>
              <BadgeDesk texto={t.status} tom={t.tom} />
            </div>
            <p className="mt-1 text-xs text-navy/55">
              {t.bloqueia ? "Bloqueia assinatura" : "Não bloqueia assinatura"} · sem redação de cláusula nesta
              tela
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FaceRadar() {
  const eixos = [
    ["Documental", "Checklist mínimo e gaps"],
    ["Genealógico", "Vínculos e fontes"],
    ["Jurídico", "Temas bloqueantes"],
    ["Operacional", "Prazo e responsável"],
  ];
  const tiles: { rotulo: string; valor: string; tom: TomEstado }[] = [
    { rotulo: "Críticas", valor: "2", tom: "critico" },
    { rotulo: "Atenção", valor: "5", tom: "atencao" },
    { rotulo: "Em dia", valor: "11", tom: "sucesso" },
    { rotulo: "Sem base", valor: "3", tom: "neutro" },
  ];
  return (
    <section aria-label="Radar Interno" className="space-y-4">
      <p className="text-sm text-navy/70">
        Matriz de prioridade da carteira + leitura de qualidade. Quatro eixos canônicos — mesmos do Radar do
        cliente.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {tiles.map((t) => (
          <div key={t.rotulo} className="rounded-xl border border-navy/10 bg-cream/50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">{t.rotulo}</p>
            <p className="mt-1 font-serif text-2xl tabular-nums text-navy">{t.valor}</p>
            <BadgeDesk texto={t.rotulo} tom={t.tom} />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-navy/10 bg-cream/40 p-4">
        <h3 className="font-serif text-base text-navy">Eixos canônicos</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {eixos.map(([t, d]) => (
            <article key={t} className="rounded-md border border-navy/10 bg-cream/60 p-3">
              <h4 className="text-sm font-medium text-navy">{t}</h4>
              <p className="mt-1 text-xs text-navy/60">{d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaceAlertas() {
  const linhas: { titulo: string; crit: string; status: string; tom: TomEstado }[] = [
    { titulo: "Prazo documental vencido", crit: "crítica", status: "Aberto", tom: "bloqueio" },
    { titulo: "Sem próxima ação no caso", crit: "alta", status: "Em tratamento", tom: "critico" },
    { titulo: "Evidência requer complemento", crit: "atenção", status: "Aberto", tom: "atencao" },
  ];
  return (
    <section aria-label="Alertas" className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-lg border border-navy/20 bg-cream px-2 py-1.5 text-sm text-navy/70">
          Todos os status
        </span>
        <span className="rounded-lg border border-navy/20 bg-cream px-2 py-1.5 text-sm text-navy/70">
          Toda criticidade
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-navy/10 bg-cream/40">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-navy/50">
            <tr>
              <th className="px-3 py-2">Sinal</th>
              <th className="px-3 py-2">Criticidade</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.titulo} className="border-t border-navy/10">
                <td className="px-3 py-2 text-navy">{l.titulo}</td>
                <td className="px-3 py-2">
                  <BadgeDesk texto={l.crit} tom={l.tom} />
                </td>
                <td className="px-3 py-2 text-navy/70">{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FaceBiblioteca() {
  const subs = ["Acervo", "Bases", "Taxonomias", "Trilhas", "Regras"];
  return (
    <section aria-label="Biblioteca Mestre" className="space-y-4">
      <p className="text-sm text-navy/65">
        Base operacional interna — nada aqui é exposto ao App Cliente sem publicação sanitizada.
      </p>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {subs.map((s, i) => (
          <div
            key={s}
            className={
              i === 0
                ? "rounded-xl border border-gold bg-gold/15 p-3 text-navy"
                : "rounded-xl border border-navy/10 bg-cream/40 p-3 text-navy"
            }
          >
            <div className="text-sm font-medium">{s}</div>
            <div className="text-xs text-navy/60">{i === 0 ? "12 itens" : `${3 + i} itens`}</div>
          </div>
        ))}
      </div>
      <article className="rounded-xl border border-navy/10 bg-cream/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-navy">Trilha Itália — jure sanguinis (DEMO)</h3>
            <p className="mt-0.5 text-xs text-navy/60">Referência interna de passos e documentos mínimos</p>
          </div>
          <BadgeDesk texto="Homologado" tom="sucesso" />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["país", "versão", "vigência"].map((d) => (
            <span
              key={d}
              className="rounded-full border border-navy/15 bg-cream px-2 py-0.5 text-xs text-navy/70"
            >
              {d}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}
