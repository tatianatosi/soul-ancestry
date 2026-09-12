import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { BrandLogo } from "@/components/brand";
import { CadeiaJornada } from "@/components/desk/cadeia-jornada";
import { BadgeDesk, CardIndicador, type TomEstado } from "@/components/desk/ui-desk";
import { GRUPOS_DESK } from "@/lib/navegacao-desk";
import { executarCadeiaJornada } from "@/lib/orquestracao-jornada";
import { SELO_DEMO_PORTAL } from "@/lib/portal-demo-sophia";

/**
 * Prévia pública — faces Desk mockup 17 p.11–17 + vocabulário 47.
 * Chrome OKI + DEMO. Sem auth. Não restaura sidebar Lovable: 6 GRUPOS_DESK.
 * Deep-link: ?face=visao|caso360|checklist|juridica|radar|alertas|biblioteca|pessoas|jornada|comercial|formalizacao|pesquisa|governanca
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
  | "biblioteca"
  | "pessoas"
  | "jornada"
  | "comercial"
  | "formalizacao"
  | "pesquisa"
  | "governanca";

const FACES: { id: FaceId; rotulo: string; pagina: string }[] = [
  { id: "visao", rotulo: "Visão Geral", pagina: "p.11" },
  { id: "caso360", rotulo: "Caso 360", pagina: "p.12" },
  { id: "checklist", rotulo: "Checklist", pagina: "p.13" },
  { id: "juridica", rotulo: "Validação Jurídica", pagina: "p.14" },
  { id: "radar", rotulo: "Radar Interno", pagina: "p.15" },
  { id: "alertas", rotulo: "Alertas", pagina: "p.16" },
  { id: "biblioteca", rotulo: "Biblioteca Mestre", pagina: "p.17" },
  { id: "pessoas", rotulo: "Pessoas", pagina: "grupo" },
  { id: "jornada", rotulo: "Cadeia Jornada", pagina: "ops" },
  { id: "comercial", rotulo: "Marketing & Comercial", pagina: "grupo" },
  { id: "formalizacao", rotulo: "Formalização & Financeiro", pagina: "grupo" },
  { id: "pesquisa", rotulo: "Inteligência & Pesquisa", pagina: "grupo" },
  { id: "governanca", rotulo: "Governança & Admin", pagina: "grupo" },
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
            {GRUPOS_DESK.map((g) => {
              const destacado =
                ((face === "pessoas" || face === "jornada" || face === "caso360") && g.id === "casos") ||
                (face === "comercial" && g.id === "comercial") ||
                (face === "formalizacao" && g.id === "contratos") ||
                (face === "pesquisa" && g.id === "pesquisa") ||
                (face === "governanca" && g.id === "governanca") ||
                (
                  (face === "visao" ||
                    face === "alertas" ||
                    face === "checklist" ||
                    face === "juridica" ||
                    face === "radar" ||
                    face === "biblioteca") &&
                  g.id === "hoje"
                );
              return (
                <div
                  key={g.id}
                  className={
                    destacado
                      ? "rounded-lg bg-gold px-3 py-2 text-sm font-medium text-navy"
                      : "rounded-lg px-3 py-2 text-sm text-cream/70"
                  }
                >
                  {g.label}
                </div>
              );
            })}
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
            {face === "pessoas" ? <FacePessoas /> : null}
            {face === "jornada" ? <FaceJornada /> : null}
            {face === "comercial" ? <FaceComercial /> : null}
            {face === "formalizacao" ? <FaceFormalizacao /> : null}
            {face === "pesquisa" ? <FacePesquisa /> : null}
            {face === "governanca" ? <FaceGovernanca /> : null}

            <p className="text-xs text-navy/50">
              Runtime vivo (auth staff): <code className="font-mono">/painel</code>,{" "}
              <code className="font-mono">/marketing</code>, <code className="font-mono">/leads</code>,{" "}
              <code className="font-mono">/casos</code>, <code className="font-mono">/clientes</code>,{" "}
              <code className="font-mono">/pesquisa</code>, <code className="font-mono">/contratos</code>,{" "}
              <code className="font-mono">/financeiro</code>, <code className="font-mono">/biblioteca</code>.{" "}
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
    <section aria-label="KPIs Visão Geral" className="space-y-4" data-face-visao>
      <p className="text-sm text-navy/65">
        Mockup 47 / p.11: fila do dia · ações vencidas · sem responsável · exceções · SLA. Sem KPI de
        receita/conversão. Runtime <code className="font-mono text-xs">/painel</code>.
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
      <div className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Fila do dia (DEMO)</p>
          <ul className="mt-2 space-y-2 text-sm text-navy">
            <li className="flex justify-between gap-2 border-b border-navy/10 pb-2">
              <span>Confirmar docs mínimos · Caso Piccoli</span>
              <span className="text-xs text-terracotta">vencida</span>
            </li>
            <li className="flex justify-between gap-2 border-b border-navy/10 pb-2">
              <span>Call Discovery · LD-DEMO-014</span>
              <span className="text-xs text-navy/60">hoje 14h</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Publicar entrega sanitizada · Árvore</span>
              <span className="text-xs text-navy/60">hoje</span>
            </li>
          </ul>
        </article>
        <article className="rounded-xl border border-gold/40 bg-cream/50 p-4">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Bloqueios visíveis</p>
          <p className="mt-1 text-sm font-medium text-navy">2 exceções críticas · 1 sem responsável</p>
          <p className="mt-1 text-xs text-navy/65">
            Chrome cream no PainelDia vivo — sem cards brancos SaaS. GRUPOS_DESK = 6.
          </p>
        </article>
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
    <section aria-label="Caso 360 — quatro indicadores" className="space-y-4" data-face-caso360>
      <p className="text-sm text-navy/65">
        Mockup 47 / p.12: caso · responsável · próxima ação · bloqueio · quatro eixos (Jornada · Pessoas ·
        Contrato · Pesquisa). Runtime <code className="font-mono text-xs">/casos/$caseId</code>.
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-navy/10 bg-cream/40 px-4 py-3 text-xs text-navy/70">
        <span>
          <span className="text-navy/45">Caso: </span>
          <span className="font-mono">CA-DEMO-014</span>
        </span>
        <span>
          <span className="text-navy/45">Código: </span>
          <span className="font-mono">PICCOLI-IT</span>
        </span>
        <span>
          <span className="text-navy/45">Responsável: </span>
          Operação
        </span>
        <span>
          <span className="text-navy/45">Fase: </span>
          Pesquisa e validação
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Jornada", "1 bloqueio de ativação"],
          ["Pessoas", "3 pessoa(s) no caso"],
          ["Contrato", "Formalização em andamento"],
          ["Pesquisa", "4 evidência(s) · 1 pendência"],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border border-navy/10 bg-cream/50 p-4">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">{t}</p>
            <p className="mt-1 text-sm font-medium text-navy">{d}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-navy/10 bg-cream/50 p-4">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Próxima ação</p>
          <p className="mt-1 font-medium text-navy">Confirmar documentos mínimos com o titular</p>
          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/60">
            <div>
              <dt className="inline text-navy/45">Responsável: </dt>
              <dd className="inline">Operação</dd>
            </div>
            <div>
              <dt className="inline text-navy/45">Prazo: </dt>
              <dd className="inline">Hoje</dd>
            </div>
          </dl>
        </article>
        <article className="rounded-xl border border-gold/40 bg-gold/10 p-4">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Bloqueio em destaque</p>
          <p className="mt-1 font-medium text-navy">Ativação do portal aguarda checklist mínimo</p>
          <p className="mt-1 text-xs text-navy/60">Pendência informa — não impede override da proprietária</p>
        </article>
      </div>
    </section>
  );
}

function FaceChecklist() {
  const itens: {
    titulo: string;
    caso: string;
    responsavel: string;
    status: string;
    prioridade: string;
    prazo: string;
    tom: TomEstado;
  }[] = [
    {
      titulo: "Coletar certidão de nascimento (titular)",
      caso: "CA-DEMO-014",
      responsavel: "Operação",
      status: "Em andamento",
      prioridade: "Alta",
      prazo: "Hoje",
      tom: "atencao",
    },
    {
      titulo: "Validar vínculo G2–G3 na árvore",
      caso: "CA-DEMO-014",
      responsavel: "Pesquisa",
      status: "Pendente",
      prioridade: "Média",
      prazo: "Amanhã",
      tom: "neutro",
    },
    {
      titulo: "Publicar nota sanitizada no Radar",
      caso: "CA-DEMO-021",
      responsavel: "—",
      status: "Bloqueada",
      prioridade: "Alta",
      prazo: "—",
      tom: "bloqueio",
    },
  ];
  return (
    <section aria-label="Checklist operacional" className="space-y-3" data-face-checklist>
      <p className="text-sm text-navy/65">
        Mockup 47 / p.13: tarefa · caso · responsável · prazo · bloqueio. Runtime{" "}
        <code className="font-mono text-xs">/tarefas</code>.
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
                <dt className="inline text-navy/45">Caso: </dt>
                <dd className="inline font-mono">{i.caso}</dd>
              </div>
              <div>
                <dt className="inline text-navy/45">Responsável: </dt>
                <dd className="inline">{i.responsavel}</dd>
              </div>
              <div>
                <dt className="inline text-navy/45">Prioridade: </dt>
                <dd className="inline">{i.prioridade}</dd>
              </div>
              <div>
                <dt className="inline text-navy/45">Prazo: </dt>
                <dd className="inline">{i.prazo}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function FaceJuridica() {
  /** Vocabulário mockup 47 / p.14 — alinhado a TEMAS_JURIDICOS + STATUS_TEMA (sem rótulo “Fase 01”). */
  const temas: {
    tema: string;
    status: string;
    responsavel: string;
    versao: string;
    bloqueia: boolean;
    tom: TomEstado;
  }[] = [
    {
      tema: "Dependentes e representação",
      status: "Pendente de revisão jurídica",
      responsavel: "Jurídico",
      versao: "—",
      bloqueia: true,
      tom: "atencao",
    },
    {
      tema: "Limite do relatório e ausência de parecer jurídico individual",
      status: "Aprovado",
      responsavel: "Jurídico",
      versao: "MODELO-ESTUDO",
      bloqueia: true,
      tom: "sucesso",
    },
    {
      tema: "Parcelamento",
      status: "Não aplicável",
      responsavel: "—",
      versao: "—",
      bloqueia: false,
      tom: "neutro",
    },
  ];
  return (
    <section aria-label="Validação Jurídica" className="space-y-3" data-face-juridica>
      <p className="text-sm text-navy/65">
        Mockup 47 / p.14: tema · status · responsável · versão jurídica · bloqueia assinatura. Sem
        redação de cláusula. Runtime <code className="font-mono text-xs">/matriz-juridica</code>.
      </p>
      <div className="rounded-xl border border-navy/10 bg-cream/50 p-4 text-sm text-navy">
        1 tema bloqueante sem decisão: assinatura fica como pendência.
      </div>
      <div className="space-y-3">
        {temas.map((t) => (
          <article key={t.tema} className="rounded-xl border border-navy/10 bg-cream/50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-serif text-lg text-navy">{t.tema}</h3>
              <BadgeDesk texto={t.status} tom={t.tom} />
            </div>
            <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/60">
              <div>
                <dt className="inline text-navy/45">Responsável: </dt>
                <dd className="inline">{t.responsavel}</dd>
              </div>
              <div>
                <dt className="inline text-navy/45">Versão jurídica: </dt>
                <dd className="inline font-mono">{t.versao}</dd>
              </div>
              <div>
                <dt className="inline text-navy/45">Assinatura: </dt>
                <dd className="inline">{t.bloqueia ? "Bloqueia" : "Não bloqueia"}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function FaceRadar() {
  const eixosJornada = [
    ["História familiar", "Pessoas e gerações reconhecidas"],
    ["Documentos e evidências", "Registros que sustentam a história"],
    ["Estratégia e possibilidades", "Hipóteses — não conclusões"],
    ["Próximos passos e progresso", "Onde estamos e o que segue"],
  ];
  const dimsApp = [
    "Documentação",
    "Origem",
    "Conexões Familiares",
    "Elegibilidade",
    "Memória",
    "Legado",
  ];
  const tiles: { rotulo: string; valor: string; tom: TomEstado }[] = [
    { rotulo: "Críticas", valor: "2", tom: "critico" },
    { rotulo: "Atenção", valor: "5", tom: "atencao" },
    { rotulo: "Em dia", valor: "11", tom: "sucesso" },
    { rotulo: "Sem base", valor: "3", tom: "neutro" },
  ];
  return (
    <section aria-label="Radar Interno" className="space-y-4" data-face-radar>
      <p className="text-sm text-navy/70">
        Desk <strong>Radar Interno</strong> (p.15 / <code className="font-mono text-xs">/qualidade</code>):{" "}
        <strong>4 eixos da jornada</strong> — mesmos de <code className="font-mono text-xs">radar-eixos.ts</code>.
        App Cliente (mockup 17): <strong>6 dimensões</strong> distintas (
        <code className="font-mono text-xs">radar-seis-eixos.ts</code>). Não misturar identidades.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.rotulo} className="rounded-xl border border-navy/10 bg-cream/50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">{tile.rotulo}</p>
            <p className="mt-1 font-serif text-2xl tabular-nums text-navy">{tile.valor}</p>
            <BadgeDesk texto={tile.rotulo} tom={tile.tom} />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-navy/10 bg-cream/40 p-4">
        <h3 className="font-serif text-base text-navy">4 eixos da jornada (Desk)</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {eixosJornada.map(([titulo, resumo]) => (
            <article key={titulo} className="rounded-md border border-navy/10 bg-cream/60 p-3">
              <h4 className="text-sm font-medium text-navy">{titulo}</h4>
              <p className="mt-1 text-xs text-navy/60">{resumo}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gold/40 bg-cream/50 p-4">
        <h3 className="font-serif text-base text-navy">App Cliente · 6 dimensões (mockup)</h3>
        <p className="mt-1 text-xs text-navy/60">
          Prova de taxonomia — Elegibilidade ≠ parecer jurídico (média honesta dos outros eixos).
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {dimsApp.map((d) => (
            <span
              key={d}
              className="rounded-lg border border-navy/15 bg-cream/40 px-3 py-2 text-center text-xs font-medium text-navy"
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaceAlertas() {
  const linhas: {
    titulo: string;
    caso: string;
    responsavel: string;
    crit: string;
    status: string;
    tom: TomEstado;
  }[] = [
    {
      titulo: "Prazo documental vencido",
      caso: "CA-DEMO-014",
      responsavel: "Operação",
      crit: "crítica",
      status: "Aberto",
      tom: "bloqueio",
    },
    {
      titulo: "Sem próxima ação no caso",
      caso: "CA-DEMO-021",
      responsavel: "—",
      crit: "alta",
      status: "Em tratamento",
      tom: "critico",
    },
    {
      titulo: "Evidência requer complemento",
      caso: "CA-DEMO-033",
      responsavel: "Pesquisa",
      crit: "atenção",
      status: "Aberto",
      tom: "atencao",
    },
  ];
  return (
    <section aria-label="Alertas" className="space-y-3" data-face-alertas>
      <p className="text-sm text-navy/65">
        Mockup 47 / p.16: sinal · caso · responsável · criticidade · status. Runtime{" "}
        <code className="font-mono text-xs">/alertas</code>.
      </p>
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
              <th className="px-3 py-2">Caso</th>
              <th className="px-3 py-2">Responsável</th>
              <th className="px-3 py-2">Criticidade</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.titulo} className="border-t border-navy/10">
                <td className="px-3 py-2 text-navy">{l.titulo}</td>
                <td className="px-3 py-2 font-mono text-xs text-navy/70">{l.caso}</td>
                <td className="px-3 py-2 text-navy/70">{l.responsavel}</td>
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
  /** Subáreas alinhadas a SUBAREAS_BIBLIOTECA (naFace) — mockup 47 / p.17. */
  const subs: { label: string; itens: string; dims: string }[] = [
    { label: "Acervo", itens: "12", dims: "Tipo · Versão · Aprovação" },
    { label: "Bases Genealógicas", itens: "8", dims: "País · Localidade · Acesso" },
    { label: "Dicionários e taxonomias", itens: "6", dims: "Domínio · Termo canônico" },
    { label: "Trilhas de pesquisa", itens: "5", dims: "País · Via · Riscos" },
    { label: "Regras jurídicas versionadas", itens: "4", dims: "Fonte · Vigência · Revisão" },
  ];
  return (
    <section aria-label="Biblioteca Mestre" className="space-y-4" data-face-biblioteca>
      <p className="text-sm text-navy/65">
        Mockup 47 / p.17: subárea · item · país · versão · vigência · responsável · status. Interno —
        nada vai ao App Cliente sem publicação sanitizada. Runtime{" "}
        <code className="font-mono text-xs">/biblioteca</code>.
      </p>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {subs.map((s, i) => (
          <div
            key={s.label}
            className={
              i === 0
                ? "rounded-xl border border-gold bg-gold/15 p-3 text-navy"
                : "rounded-xl border border-navy/10 bg-cream/40 p-3 text-navy"
            }
          >
            <div className="text-sm font-medium">{s.label}</div>
            <div className="text-xs text-navy/60">{s.itens} itens</div>
            <div className="mt-1 text-[10px] leading-snug text-navy/45">{s.dims}</div>
          </div>
        ))}
      </div>
      <article className="rounded-xl border border-navy/10 bg-cream/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-navy">Trilha Itália — via preliminar (DEMO)</h3>
            <p className="mt-0.5 text-xs text-navy/60">
              Referência interna de passos e documentos prioritários — exige revisão humana
            </p>
          </div>
          <BadgeDesk texto="Homologado" tom="sucesso" />
        </div>
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/60">
          <div>
            <dt className="inline text-navy/45">País: </dt>
            <dd className="inline">Itália</dd>
          </div>
          <div>
            <dt className="inline text-navy/45">Versão: </dt>
            <dd className="inline font-mono">v1.2</dd>
          </div>
          <div>
            <dt className="inline text-navy/45">Vigência: </dt>
            <dd className="inline">Ativa</dd>
          </div>
          <div>
            <dt className="inline text-navy/45">Responsável: </dt>
            <dd className="inline">Pesquisa</dd>
          </div>
          <div>
            <dt className="inline text-navy/45">Status: </dt>
            <dd className="inline">Homologado</dd>
          </div>
        </dl>
      </article>
    </section>
  );
}

/** Chrome do grupo Pessoas & Casos (`/clientes`) — não é página 11–17 do mockup. */
function FacePessoas() {
  const linhas: { nome: string; camada: string; status: string; tom: TomEstado }[] = [
    { nome: "Sophia Piccoli (DEMO)", camada: "Cliente", status: "Ativo", tom: "sucesso" },
    { nome: "Núcleo Piccoli — 3 participantes", camada: "Núcleo", status: "Em acompanhamento", tom: "atencao" },
    { nome: "Lead Discovery — sem caso", camada: "Pré-cliente", status: "Triagem", tom: "neutro" },
  ];
  return (
    <section aria-label="Pessoas e clientes" className="space-y-4" data-face-pessoas>
      <p className="text-sm text-navy/70">
        Lista operacional de pessoas/clientes com chrome OKI (navy/cream/gold). Runtime vivo:{" "}
        <code className="font-mono text-xs">/clientes</code>. Sem inventar genealogia.
      </p>
      <div className="flex flex-wrap gap-2">
        {["Ativos", "Suspensos", "Encerrados", "Arquivados"].map((aba, i) => (
          <span
            key={aba}
            className={
              i === 0
                ? "rounded-lg border border-navy bg-navy/10 px-3 py-1.5 text-xs font-medium text-navy"
                : "rounded-lg border border-navy/15 bg-cream/50 px-3 py-1.5 text-xs text-navy/65"
            }
          >
            {aba}
          </span>
        ))}
        <span className="ml-auto rounded-md bg-navy px-3 py-1.5 text-xs text-cream">Novo cadastro</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-navy/10 bg-cream/40">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-navy/50">
            <tr>
              <th className="px-3 py-2">Pessoa</th>
              <th className="px-3 py-2">Camada</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.nome} className="border-t border-navy/10">
                <td className="px-3 py-2 text-navy">{l.nome}</td>
                <td className="px-3 py-2 text-navy/70">{l.camada}</td>
                <td className="px-3 py-2">
                  <BadgeDesk texto={l.status} tom={l.tom} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Painel real CadeiaJornada (somente leitura) — chrome OKI no runtime Desk. */
function FaceJornada() {
  const resultado = executarCadeiaJornada({
    hoje: "2026-09-12",
    evento: "proposta_enviada",
    caso_id: "CA-DEMO-PREVIA",
    responsavel_id: "demo",
    prazo: "2026-09-20",
  });
  return (
    <section aria-label="Cadeia da jornada" className="space-y-4" data-face-jornada>
      <p className="text-sm text-navy/70">
        Cadeia canônica de 11 elos com chrome OKI. Somente leitura — não envia nem persiste. Runtime:{" "}
        <code className="font-mono text-xs">/biblioteca-mensagens</code> (orquestração contextual).
      </p>
      <div className="rounded-xl border border-navy/10 bg-cream/40 p-3">
        <CadeiaJornada resultado={resultado} evento="proposta_enviada" />
      </div>
    </section>
  );
}

/** Chrome do grupo Marketing & Comercial — Mesa Discovery + CRM (`/calls`, `/leads`, …). */
function FaceComercial() {
  const etapas = ["Abertura", "SPIN", "Elegibilidade", "Proposta", "Handoff"];
  return (
    <section aria-label="Marketing e Comercial" className="space-y-4" data-face-comercial>
      <p className="text-sm text-navy/70">
        Mesa de Discovery e CRM vivo com chrome OKI (painéis cream). Runtime:{" "}
        <code className="font-mono text-xs">/calls</code>,{" "}
        <code className="font-mono text-xs">/leads</code>,{" "}
        <code className="font-mono text-xs">/conversao</code>,{" "}
        <code className="font-mono text-xs">/propostas</code>,{" "}
        <code className="font-mono text-xs">/crm-mestre</code>. Sem inventar receita.
      </p>
      <div className="flex flex-wrap gap-2" aria-label="Etapas Mesa Discovery">
        {etapas.map((e, i) => (
          <span
            key={e}
            className={
              i === 1
                ? "rounded-lg border border-gold bg-gold/15 px-3 py-1.5 text-xs font-medium text-navy"
                : "rounded-lg border border-navy/15 bg-cream/40 px-3 py-1.5 text-xs text-navy/70"
            }
          >
            {e}
          </span>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Leads na triagem", "12", "Fila Discovery"],
          ["Sem próxima ação", "4", "Atribuir dono"],
          ["Calls hoje", "2", "Mesa"],
        ].map(([r, v, a]) => (
          <div key={r} className="rounded-xl border border-navy/10 bg-cream/40 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">{r}</p>
            <p className="mt-1 font-serif text-2xl tabular-nums text-navy">{v}</p>
            <p className="text-xs text-navy/60">{a}</p>
          </div>
        ))}
      </div>
      <article className="rounded-xl border border-navy/10 bg-cream/40 p-4">
        <p className="text-[11px] uppercase tracking-wide text-navy/50">Call em curso (DEMO)</p>
        <p className="mt-1 text-sm font-medium text-navy">LD-DEMO-014 · etapa SPIN</p>
        <p className="mt-1 text-xs text-navy/65">
          Próxima pergunta: implicação do prazo documental — sem checkbox paralelo à Mesa.
        </p>
      </article>
      <div className="overflow-x-auto rounded-xl border border-navy/10 bg-cream/40">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-navy/50">
            <tr>
              <th className="px-3 py-2">Lead</th>
              <th className="px-3 py-2">Origem</th>
              <th className="px-3 py-2">Próxima ação</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["LD-DEMO-014", "Indicação", "Agendar Discovery"],
              ["LD-DEMO-021", "Site institucional", "Enviar proposta"],
              ["LD-DEMO-033", "WhatsApp", "Confirmar elegibilidade"],
            ].map(([c, o, p]) => (
              <tr key={c} className="border-t border-navy/10">
                <td className="px-3 py-2 text-navy">{c}</td>
                <td className="px-3 py-2 text-navy/70">{o}</td>
                <td className="px-3 py-2 text-navy/80">{p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FaceFormalizacao() {
  return (
    <section aria-label="Formalização e Financeiro" className="space-y-4" data-face-formalizacao>
      <p className="text-sm text-navy/70">
        Contratos e financeiro ligados ao caso — chrome cream OKI. Runtime:{" "}
        <code className="font-mono text-xs">/contratos</code>,{" "}
        <code className="font-mono text-xs">/financeiro</code>. Sem Asaas legado como fonte.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Contratos</p>
          <p className="mt-1 text-sm font-medium text-navy">3 em preparação · 1 aguardando assinatura</p>
          <p className="mt-1 text-xs text-navy/60">Eixo: crm_casos + formalização</p>
        </article>
        <article className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Financeiro do caso</p>
          <p className="mt-1 text-sm font-medium text-navy">Eventos ligados a caso/contrato</p>
          <p className="mt-1 text-xs text-navy/60">Não substitui planejador nem tarefas</p>
        </article>
      </div>
      <div className="rounded-xl border border-gold/40 bg-cream/50 p-4">
        <p className="text-[11px] uppercase tracking-wide text-navy/50">Gate visual</p>
        <p className="mt-1 text-sm text-navy">
          Painéis cream (não branco SaaS) em Formalização & Financeiro — prova desta fatia.
        </p>
      </div>
    </section>
  );
}

/** Chrome do grupo Inteligência & Pesquisa (`/pesquisa`, módulo). */
function FacePesquisa() {
  return (
    <section aria-label="Inteligência e Pesquisa" className="space-y-4" data-face-pesquisa>
      <p className="text-sm text-navy/70">
        Pesquisa genealógica + módulo com chrome OKI. Runtime:{" "}
        <code className="font-mono text-xs">/pesquisa</code>,{" "}
        <code className="font-mono text-xs">/pesquisa-modulo</code>. Hipótese ≠ fato; status só do
        CHECK.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Casos de pesquisa", "5", "research_cases"],
          ["Fontes em revisão", "8", "research_sources"],
          ["Achados a confirmar", "3", "status_pesquisa"],
        ].map(([r, v, a]) => (
          <div key={r} className="rounded-xl border border-navy/10 bg-cream/40 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">{r}</p>
            <p className="mt-1 font-serif text-2xl tabular-nums text-navy">{v}</p>
            <p className="text-xs text-navy/60">{a}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        {["Fontes", "Pessoas", "Achados", "Plano"].map((aba, i) => (
          <span
            key={aba}
            className={
              i === 0
                ? "rounded-lg border border-navy bg-navy/10 px-3 py-2 text-center text-xs font-medium text-navy"
                : "rounded-lg border border-navy/15 bg-cream/40 px-3 py-2 text-center text-xs text-navy/65"
            }
          >
            {aba}
          </span>
        ))}
      </div>
      <ul className="space-y-2">
        {[
          ["Fonte", "Registro civil · cartório (DEMO)"],
          ["Transcrição", "Trecho sanitizado — sem nota interna"],
          ["Hipótese", "Rótulo explícito: ainda não confirmado"],
        ].map(([k, v]) => (
          <li key={k} className="rounded-xl border border-navy/10 bg-cream/40 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">{k}</p>
            <p className="mt-0.5 text-sm text-navy">{v}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Chrome do grupo Governança & Administração (`/integracoes`, ops, equipe, acessos). */
function FaceGovernanca() {
  return (
    <section aria-label="Governança e Administração" className="space-y-4" data-face-governanca>
      <p className="text-sm text-navy/70">
        Integrações, ops, equipe e acessos do portal com chrome OKI. Runtime:{" "}
        <code className="font-mono text-xs">/integracoes</code>,{" "}
        <code className="font-mono text-xs">/equipe</code>,{" "}
        <code className="font-mono text-xs">/acessos-portal</code>,{" "}
        <code className="font-mono text-xs">/governanca/decisoes</code>. Sem inventar política.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Integrações", "3 ativas", "Centro"],
          ["Ops / exceções", "2 críticas", "Desk operacional"],
          ["Equipe", "5 contas", "Papéis"],
          ["Acessos portal", "1 convite", "Cliente"],
        ].map(([r, v, a]) => (
          <div key={r} className="rounded-xl border border-navy/10 bg-cream/40 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">{r}</p>
            <p className="mt-1 font-serif text-xl text-navy">{v}</p>
            <p className="text-xs text-navy/60">{a}</p>
          </div>
        ))}
      </div>
      <article className="rounded-xl border border-navy/10 bg-cream/40 p-4">
        <p className="text-[11px] uppercase tracking-wide text-navy/50">Prontidão (DEMO)</p>
        <ul className="mt-2 space-y-1 text-sm text-navy/80">
          <li>· Auth / sessão — ok</li>
          <li>· RLS portal — estrutural (prova UI A×B pendente)</li>
          <li>· Segredos fora do cliente — ok</li>
        </ul>
      </article>
      <div className="rounded-xl border border-gold/40 bg-cream/50 p-4">
        <p className="text-[11px] uppercase tracking-wide text-navy/50">Gate visual</p>
        <p className="mt-1 text-sm text-navy">
          App deep (proposta/mensagens/faturas/docs) + Desk Governança em cream — prova desta fatia.
          GRUPOS_DESK permanece 6.
        </p>
      </div>
    </section>
  );
}
