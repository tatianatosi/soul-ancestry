import { useState } from "react";
import { SUBAREAS_BIBLIOTECA, type SubareaBiblioteca } from "@/lib/biblioteca-mestre";
import { cn } from "@/lib/utils";
import { RadarChart } from "./cliente-app";
import { BrandLogo } from "./brand";
import {
  CASOS,
  ETAPAS,
  INTEGRACOES,
  STATUS_APP,
  brl,
  painelUniversal,
  resumoCaso,
} from "@/data/casos";
import {
  PROPOSTAS,
  produtoMestre,
  RECOMENDACOES_WHATSAPP,
  recomendacaoWhatsappPorCaso,
  planoWhatsapp,
  type RecomendacaoWhatsapp,
} from "@/data/propostas";
import { ORIGEM_DADOS_CANVAS, SANEAMENTO_FONTES, SAUDE_SKU } from "@/data/saneamento";
import { GoLiveDesk } from "./desk-go-live";
import { DeskCrm } from "./desk-crm";
import { KitContratual } from "./kit-contratual";
import {
  resolverContextoEuropeu,
  TITULO_PROCURACAO_BRASIL,
  TITULO_PROCURACAO_EUROPEIA_GENERICO,
} from "@/lib/procuracao-europeia";
import { TimelineContratualDesk } from "./timeline-contratual";
import {
  LayoutGrid,
  Users,
  ListChecks,
  Radar as RadarIcon,
  Bell,
  Library,
  TrendingUp,
  DollarSign,
  Send,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Scale,
  Radio,
  Wallet,
  Plug,
  Smartphone,
  FileText,
  Rocket,
  FileSignature,
  Link2,
} from "lucide-react";
import { PainelModulosContextuais, AssistenteLateral } from "@/components/desk/modulos-contextuais";
import type { TelaDesk } from "@/lib/desk-modulos";
import { useActiveCase } from "@/lib/useActiveCase";
import {
  CONTRATO_LABEL,
  FALLBACK,
  PROCURACAO_LABEL,
  lista,
  preenchido,
  texto,
} from "@/lib/evidence";

type Section =
  | "overview"
  | "casos"
  | "checklist"
  | "juridica"
  | "radar"
  | "alertas"
  | "biblio"
  | "financeiro"
  | "appcliente"
  | "integracoes"
  | "propostas"
  | "golive"
  | "formalizacao"
  | "crm";

export function DeskApp() {
  const [sec, setSec] = useState<Section>("overview");
  const nav = [
    ["overview", LayoutGrid, "Visão Geral"],
    ["crm", Radio, "CRM vivo"],
    ["casos", Users, "Casos 360"],
    ["propostas", FileText, "Propostas"],
    ["golive", Rocket, "Go-live"],
    ["formalizacao", FileSignature, "Formalização"],
    ["appcliente", Smartphone, "Checklist AppCliente"],
    ["financeiro", Wallet, "Financeiro"],
    ["checklist", ListChecks, "Checklist semanal"],
    ["juridica", Scale, "Validação Jurídica"],
    ["radar", RadarIcon, "Radar Interno"],
    ["alertas", Bell, "Alertas"],
    ["integracoes", Plug, "Integrações"],
    ["biblio", Library, "Biblioteca Mestre"],
  ] as const;

  return (
    <div className="flex min-h-[calc(100vh-52px)] bg-cream">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-navy text-cream md:sticky md:top-[52px] md:flex md:h-[calc(100vh-52px)] md:flex-col">
        <div className="border-b border-cream/10 px-5 py-4">
          <BrandLogo size={30} showText={true} textColor="#C9A84C" />
          <div className="mt-2 text-[11px] uppercase tracking-widest text-gold/80">
            Desk Intelligence
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setSec(id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition text-left",
                sec === id ? "bg-gold text-navy font-semibold" : "text-cream/80 hover:bg-navy-soft",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-cream/10 p-4 text-xs text-cream/50">
          Equipe · 4 analistas online
        </div>
      </aside>

      {/* mobile nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex snap-x snap-mandatory overflow-x-auto border-t border-border bg-navy text-cream [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {nav.map(([id, Icon, label]) => (
          <button
            key={id}
            ref={(el) => {
              if (el && sec === id) {
                el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
              }
            }}
            onClick={() => setSec(id)}
            aria-current={sec === id ? "page" : undefined}
            className={cn(
              "flex min-w-[76px] shrink-0 snap-center flex-col items-center gap-1 px-2 py-2 text-[10px] leading-tight",
              sec === id ? "border-t-2 border-gold text-gold" : "text-cream/70",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>



      <main className="flex-1 overflow-x-hidden px-5 py-8 pb-24 md:px-8 md:pb-10">
        <div className="mx-auto max-w-6xl">
          <PainelModulosContextuais tela={sec as TelaDesk} />
          {sec === "overview" && <Overview />}
          {sec === "crm" && <DeskCrm />}
          {sec === "casos" && <Casos />}
          {sec === "propostas" && <Propostas />}
          {sec === "golive" && <GoLiveDesk />}
          {sec === "formalizacao" && <Formalizacao />}

          {sec === "appcliente" && <ChecklistAppCliente />}
          {sec === "financeiro" && <Financeiro />}
          {sec === "checklist" && <Checklist />}
          {sec === "juridica" && <ValidacaoJuridica />}
          {sec === "radar" && <RadarInterno />}
          {sec === "alertas" && <Alertas />}
          {sec === "integracoes" && <Integracoes />}
          {sec === "biblio" && <BiblioMestre />}
        </div>
      </main>

      <AssistenteLateral contexto={`Desk · ${sec}`} />
    </div>
  );
}

/* --- Formalização: contrato, procurações e fontes internas --- */
function Formalizacao() {
  const caso = useActiveCase();
  const contrato = caso.contrato;
  const procuracoes = caso.procuracoes;
  const ctxProcuracaoEuropeia = resolverContextoEuropeu({
    casoConfirmado: { pais: caso.rota?.pais_principal ?? null, versao: null },
  });
  const f = caso.familia_direta;

  const pessoas = [
    { papel: "Bisavô paterno", p: f.bisavo_paterno },
    { papel: "Bisavó paterna", p: f.bisavo_paterna },
    { papel: "Avô paterno", p: f.avo_paterno },
    { papel: "Avó paterna", p: f.avo_paterna },
    { papel: "Pai do bisavô", p: f.pai_de_alessandro },
  ].filter((x) => x.p && preenchido(x.p.nome));

  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">
          Visão interna · {caso.geral.case_id}
        </div>
        <h1 className="font-serif text-3xl italic text-navy">Formalização e fontes</h1>
        <p className="mt-1 text-sm text-navy/70">{caso.geral.case_nome}</p>
      </header>

      {/* contrato */}
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-widest text-terracotta">
              Produto contratado
            </div>
            <div className="font-serif text-xl text-navy">
              {contrato
                ? `${contrato.produto_sku} — ${contrato.produto_nome}`
                : FALLBACK.aguardando}
            </div>
          </div>
          <span className="rounded-full border border-terracotta/40 bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta">
            {contrato ? CONTRATO_LABEL[contrato.status] : FALLBACK.aguardando}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Arquivo do contrato", contrato?.arquivo_url],
            ["Proposta final", contrato?.proposta_final_url],
            ["Data de assinatura", contrato?.data_assinatura],
          ].map(([l, v]) => (
            <div
              key={l as string}
              className="rounded-xl border border-border bg-cream/60 p-3 text-sm"
            >
              <div className="text-[11px] uppercase tracking-wide text-navy/60">{l}</div>
              <div className="font-medium text-navy">
                {texto(v as string, "Documento ainda não vinculado")}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm text-navy">
          Pagamento: {contrato ? CONTRATO_LABEL[contrato.pagamento_status] : FALLBACK.aguardando}
        </div>
        {contrato && preenchido(contrato.observacao) && (
          <p className="mt-3 text-[12px] italic text-navy/70">{contrato.observacao}</p>
        )}

        <h3 className="mt-6 font-serif text-lg text-navy">Formalização e contrato</h3>
        <ul className="mt-2 space-y-2">
          {(contrato?.checklist ?? []).map((c) => (
            <li
              key={c.item}
              className="flex items-start gap-2 rounded-lg border border-border bg-cream/40 p-2.5 text-sm text-navy"
            >
              {c.feito ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-navy/30" />
              )}
              <span className="min-w-0">{c.item}</span>
            </li>
          ))}
        </ul>
      </section>

      <TimelineContratualDesk caso={caso} />

      <KitContratual />

      {/* procurações */}
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h3 className="font-serif text-xl text-navy">Procurações</h3>
        <p className="mt-1 text-[12px] text-navy/70">
          A etapa de consulta externa depende de revisão documental e autorização formal.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {(
            [
              [TITULO_PROCURACAO_BRASIL, procuracoes?.portugues],
              [ctxProcuracaoEuropeia.state === "confirmado" ? ctxProcuracaoEuropeia.title : TITULO_PROCURACAO_EUROPEIA_GENERICO, procuracoes?.italiano],
            ] as const
          ).map(([label, proc]) => (
            <div key={label} className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-navy">{label}</div>
                <span className="rounded-full border border-terracotta/40 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-terracotta">
                  {proc ? PROCURACAO_LABEL[proc.status] : "Não iniciada"}
                </span>
              </div>
              <div className="mt-2 text-[12px] text-navy/75">
                {texto(proc?.finalidade, FALLBACK.atualizacao)}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-navy/70">
                <div>Assinatura: {texto(proc?.data_assinatura, "Ação ainda não iniciada")}</div>
                <div>Envio: {texto(proc?.data_envio, "Ação ainda não iniciada")}</div>
              </div>
              {proc && preenchido(proc.observacao) && (
                <p className="mt-2 text-[11px] italic text-navy/70">{proc.observacao}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* fontes internas */}
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h3 className="font-serif text-xl text-navy">Referências de pesquisa (uso interno)</h3>
        <p className="mt-1 text-[12px] text-navy/70">
          FamilySearch é referência de pesquisa. Nunca é prova documental final e não confirma
          sozinho vínculo familiar, origem, Comune ou rota jurídica.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-navy/60">
              <tr>
                <th className="p-2">Pessoa</th>
                <th className="p-2">Papel</th>
                <th className="p-2">ID / URL</th>
                <th className="p-2">Evidência</th>
                <th className="p-2">Documento necessário</th>
              </tr>
            </thead>
            <tbody>
              {pessoas.map(({ papel, p }) => (
                <tr key={papel} className="border-t border-border align-top">
                  <td className="p-2 font-medium text-navy">{p!.nome}</td>
                  <td className="p-2 text-navy/70">{papel}</td>
                  <td className="p-2 text-navy/70">
                    {preenchido(p!.familysearch_id) ? (
                      <span className="inline-flex items-center gap-1">
                        <Link2 className="h-3 w-3 text-gold" /> FamilySearch | {p!.familysearch_id}
                      </span>
                    ) : (
                      "Documento ainda não vinculado"
                    )}
                  </td>
                  <td className="p-2 text-navy/70">
                    {p!.status_evidencia === "referencia_localizada"
                      ? "Referência localizada"
                      : "Em validação documental"}
                  </td>
                  <td className="p-2 text-navy/70">Certidão oficial correspondente</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-[11px] text-navy/60">
          Responsável pela validação: {texto(caso.governanca.responsavel_caso, FALLBACK.aguardando)}{" "}
          · Inclusão: {texto(caso.geral.data_abertura, FALLBACK.aguardando)}
        </div>
        {lista(caso.documentos.documentos_pendentes).length > 0 && (
          <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-3 text-[12px] text-navy">
            Documentos oficiais necessários:{" "}
            {lista(caso.documentos.documentos_pendentes).join(" · ")}
          </div>
        )}
      </section>
    </div>
  );
}

/* --- Overview --- */
function Overview() {
  const kpis = [
    { l: "Casos ativos", v: "23", i: Users, tint: "bg-navy text-cream" },
    { l: "Alertas pendentes", v: "7", i: Bell, tint: "bg-terracotta text-cream" },
    { l: "Receita do mês", v: "R$ 18.400", i: DollarSign, tint: "bg-gold text-navy" },
    { l: "Taxa de conversão", v: "34%", i: TrendingUp, tint: "bg-sage text-white" },
  ];
  const alerts = [
    { c: "Marina Alves", t: "Achado documental", d: 2 },
    { c: "Ricardo Vieira", t: "Nova conexão familiar", d: 4 },
    { c: "Camila Santos", t: "Registro paroquial", d: 5 },
    { c: "João Ferreira", t: "Contexto histórico", d: 7 },
    { c: "Beatriz Lima", t: "Certidão validada", d: 9 },
  ];
  const checklist = [
    { t: "Revisar dossiê Alves", tone: "done" },
    { t: "Enviar micro-entrega Vieira", tone: "todo" },
    { t: "Confirmar certidão consular Lima", tone: "warn" },
  ];
  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">
          Visão geral · Julho 2026
        </div>
        <h1 className="font-serif text-3xl italic text-navy">Bom dia, equipe.</h1>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.l} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className={cn("mb-4 grid h-10 w-10 place-items-center rounded-lg", k.tint)}>
              <k.i className="h-5 w-5" />
            </div>
            <div className="text-xs uppercase tracking-wide text-navy/70">{k.l}</div>
            <div className="mt-1 font-serif text-3xl text-navy">{k.v}</div>
          </div>
        ))}
      </div>

      {/* Funil de leads */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg text-navy">Funil de leads</h3>
          <span className="text-[11px] uppercase tracking-widest text-gold">Últimos 30 dias</span>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { l: "Novos leads", v: "58", bar: 100, c: "bg-navy" },
            { l: "Leads em WhatsApp", v: "31", bar: 53, c: "bg-sage" },
            { l: "Lead → diagnóstico", v: "42%", bar: 42, c: "bg-gold" },
            { l: "Lead → cliente", v: "12%", bar: 12, c: "bg-terracotta" },
          ].map((f) => (
            <div key={f.l} className="rounded-xl border border-border bg-cream/60 p-4">
              <div className="text-xs uppercase tracking-wide text-navy/70">{f.l}</div>
              <div className="mt-1 font-serif text-2xl text-navy">{f.v}</div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full", f.c)} style={{ width: `${f.bar}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-serif text-lg text-navy">Alertas de achados pendentes</h3>
            <span className="rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta">
              5 não enviados
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-navy/70">
                <tr>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Espera</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {alerts.map((a) => (
                  <tr key={a.c} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium text-navy whitespace-nowrap">{a.c}</td>
                    <td className="px-5 py-3 text-navy/75">{a.t}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
                          a.d > 5
                            ? "bg-terracotta/15 text-terracotta"
                            : "bg-orange-100 text-orange-700",
                        )}
                      >
                        {a.d}d
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="inline-flex items-center gap-1 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-cream whitespace-nowrap">
                        <Send className="h-3 w-3" /> Enviar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-serif text-lg text-navy">Prioridades de hoje</h3>
          <ul className="space-y-3">
            {checklist.map((c) => (
              <li key={c.t} className="flex items-start gap-3">
                {c.tone === "done" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />}
                {c.tone === "todo" && <Circle className="mt-0.5 h-4 w-4 text-sage" />}
                {c.tone === "warn" && <AlertTriangle className="mt-0.5 h-4 w-4 text-terracotta" />}
                <span
                  className={cn(
                    "text-sm",
                    c.tone === "done" ? "text-navy/50 line-through" : "text-navy",
                  )}
                >
                  {c.t}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* --- Casos 360 --- */
function Casos() {
  const dot = { saudavel: "bg-emerald-500", atencao: "bg-orange-500", critico: "bg-red-500" };
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">Operação · aba CASOS</div>
        <h1 className="font-serif text-3xl italic text-navy">Casos 360</h1>
        <p className="mt-1 text-[13px] text-navy/70">
          Um registro por ID de caso, com saúde e próxima ação.
        </p>
      </header>
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-navy text-left text-[11px] uppercase tracking-wide text-cream">
              <tr>
                <th className="px-4 py-3">ID do caso</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tipo de processo</th>
                <th className="px-4 py-3">País / base jurídica</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Início</th>
                <th className="px-4 py-3">Saúde</th>
                <th className="px-4 py-3">Próxima ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {CASOS.map((c) => (
                <tr key={c.id} className="align-top hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-navy">
                    {c.id}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-navy">{c.cliente}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-navy/75">{c.tipoProcesso}</td>
                  <td className="px-4 py-3 text-navy/75">
                    <div className="font-medium text-navy">{c.pais}</div>
                    <div className="text-[12px]">{c.baseJuridica}</div>
                  </td>
                  <td className="px-4 py-3 text-navy/75">{c.responsavel}</td>
                  <td className="px-4 py-3">
                    <span className="whitespace-nowrap rounded-full bg-muted px-2 py-0.5 text-xs text-navy">
                      {c.status === "proposta-aceita"
                        ? "Proposta aceita"
                        : c.status === "em-proposta"
                          ? "Em proposta"
                          : "Em andamento"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-navy/75">{c.dataInicio}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <span className={cn("h-2.5 w-2.5 rounded-full", dot[c.saude])} />
                      <span className="text-[12px] text-navy/75">
                        {c.saude === "saudavel"
                          ? "saudável"
                          : c.saude === "atencao"
                            ? "atenção"
                            : "crítico"}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy/75">{c.proximaAcao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* --- Checklist --- */
function Checklist() {
  const sections: { title: string; tone: "confirm" | "review" | "critical"; items: string[] }[] = [
    {
      title: "Confirmar",
      tone: "confirm",
      items: [
        "Dossiê Marina Alves — pronto para envio",
        "Micro-entrega Camila Santos aprovada",
        "Certidão consular João Ferreira validada",
      ],
    },
    {
      title: "Em Revisão",
      tone: "review",
      items: [
        "Registro paroquial Vieira — 1887",
        "Narrativa contextual Santos",
        "Fotografia restaurada Lima",
        "Transcrição livro Coimbra",
      ],
    },
    {
      title: "Pendente Crítico",
      tone: "critical",
      items: [
        "Corrigir data no dossiê Beatriz Lima",
        "Reenviar procuração Paulo Neto",
        "Prazo consular Alemanha — 3 dias",
      ],
    },
  ];
  const styles = {
    confirm: {
      border: "border-emerald-300",
      bg: "bg-emerald-50",
      chip: "bg-emerald-600 text-white",
      Icon: CheckCircle2,
      iconColor: "text-emerald-600",
    },
    review: {
      border: "border-blue-300",
      bg: "bg-blue-50",
      chip: "bg-blue-600 text-white",
      Icon: Clock,
      iconColor: "text-blue-600",
    },
    critical: {
      border: "border-red-400",
      bg: "bg-red-50",
      chip: "bg-red-600 text-white",
      Icon: AlertTriangle,
      iconColor: "text-red-600",
    },
  };
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">Prioridade máxima</div>
        <h1 className="font-serif text-3xl italic text-navy">Checklist da Semana</h1>
        <p className="mt-1 text-[13px] text-navy/70">
          A ferramenta interna mais usada — o que precisa acontecer agora.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {sections.map((s) => {
          const st = styles[s.tone];
          return (
            <div
              key={s.title}
              className={cn("rounded-2xl border-2 p-5 shadow-sm", st.border, st.bg)}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-xl text-navy">{s.title}</h3>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", st.chip)}>
                  {s.items.length}
                </span>
              </div>
              <ul className="space-y-3">
                {s.items.map((it, i) => {
                  const done = s.tone === "confirm";
                  return (
                    <li key={i} className="flex items-start gap-3 rounded-lg bg-white/70 p-3">
                      <st.Icon className={cn("mt-0.5 h-4 w-4 shrink-0", st.iconColor)} />
                      <span
                        className={cn(
                          "text-sm",
                          done ? "text-navy/50 line-through" : "text-navy font-medium",
                        )}
                      >
                        {it}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- Validação Jurídica --- */
function ValidacaoJuridica() {
  const rows = CASOS.flatMap((c) =>
    c.marcosJuridicos.map((m) => ({
      c: c.cliente,
      p: c.pais,
      cr: m.titulo,
      g: ETAPAS.find((e) => e.key === c.etapaAtual)?.label ?? "—",
      s:
        m.situacao === "aberta"
          ? "Confirmado"
          : m.situacao === "condicionada"
            ? "Em Análise"
            : "Pendente",
      obs: m.nota,
    })),
  );

  const badge = (s: string) =>
    s === "Confirmado"
      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
      : s === "Em Análise"
        ? "bg-blue-100 text-blue-700 border-blue-300"
        : "bg-orange-100 text-orange-700 border-orange-300";
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">
          Elegibilidade & viabilidade
        </div>
        <h1 className="font-serif text-3xl italic text-navy">Validação Jurídica</h1>
        <p className="mt-1 text-[13px] text-navy/70">Critérios legais aplicáveis a cada caso.</p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-navy text-cream text-left text-[11px] uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">País Alvo</th>
                <th className="px-4 py-3">Critério Jurídico</th>
                <th className="px-4 py-3">Etapa atual</th>
                <th className="px-4 py-3">Elegibilidade</th>
                <th className="px-4 py-3">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => (
                <tr key={r.c + i} className="hover:bg-muted/30 align-top">
                  <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">{r.c}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.p}</td>
                  <td className="px-4 py-3 text-navy">{r.cr}</td>
                  <td className="px-4 py-3 text-navy/75 whitespace-nowrap">{r.g}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
                        badge(r.s),
                      )}
                    >
                      {r.s}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy/75 italic">{r.obs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* --- Radar Interno --- */
type Client = {
  name: string;
  eleg: number;
  urg: number;
  health: "green" | "yellow" | "red";
  values: number[];
};
const CLIENTS: Client[] = [
  { name: "Marina Alves", eleg: 82, urg: 60, health: "green", values: [78, 90, 65, 82, 55, 40] },
  { name: "Ricardo Vieira", eleg: 55, urg: 70, health: "yellow", values: [55, 60, 80, 55, 70, 30] },
  { name: "Camila Santos", eleg: 88, urg: 45, health: "green", values: [88, 72, 60, 88, 80, 65] },
  { name: "João Ferreira", eleg: 40, urg: 55, health: "yellow", values: [40, 50, 45, 40, 35, 20] },
  { name: "Beatriz Lima", eleg: 62, urg: 92, health: "red", values: [70, 65, 55, 62, 50, 30] },
  { name: "Paulo Neto", eleg: 75, urg: 30, health: "green", values: [75, 78, 68, 75, 60, 45] },
  { name: "Helena Duarte", eleg: 45, urg: 82, health: "red", values: [45, 50, 40, 45, 30, 25] },
  { name: "Rafael Costa", eleg: 90, urg: 20, health: "green", values: [90, 82, 78, 90, 70, 60] },
  { name: "Sofia Mendes", eleg: 30, urg: 65, health: "yellow", values: [30, 40, 35, 30, 25, 15] },
  { name: "Otávio Pires", eleg: 68, urg: 78, health: "yellow", values: [68, 60, 55, 68, 45, 40] },
  { name: "Luana Braga", eleg: 85, urg: 50, health: "green", values: [85, 80, 72, 85, 65, 55] },
  { name: "Diego Nogueira", eleg: 50, urg: 88, health: "red", values: [50, 55, 48, 50, 40, 30] },
];

function RadarInterno() {
  const [view, setView] = useState<"matrix" | "individual">("matrix");
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">Análise comparativa</div>
        <h1 className="font-serif text-3xl italic text-navy">Radar Interno</h1>
        <p className="mt-1 text-[13px] text-navy/70">Priorização estratégica dos casos ativos.</p>
      </header>

      <div className="inline-flex rounded-full border border-border bg-white p-1 shadow-sm">
        {(["matrix", "individual"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition",
              view === v ? "bg-navy text-cream" : "text-sage hover:text-navy",
            )}
          >
            {v === "matrix" ? "Matriz de Prioridade" : "Radar Individual"}
          </button>
        ))}
      </div>

      {view === "matrix" ? <PriorityMatrix /> : <RadarIndividual />}
    </div>
  );
}

function PriorityMatrix() {
  const size = 520;
  const pad = 44;
  const w = size - pad * 2;
  const dotColor = { green: "#059669", yellow: "#D97706", red: "#DC2626" };
  const x = (v: number) => pad + (v / 100) * w;
  const y = (v: number) => pad + (1 - v / 100) * w;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div className="overflow-x-auto rounded-2xl border border-border bg-white p-5 shadow-sm">
        <svg viewBox={`0 0 ${size} ${size + 30}`} className="mx-auto block w-full min-w-[420px]">
          {/* Quadrants */}
          <rect x={pad} y={pad} width={w / 2} height={w / 2} fill="#F5F0E8" opacity="0.6" />
          <rect
            x={pad + w / 2}
            y={pad}
            width={w / 2}
            height={w / 2}
            fill="#C9A84C"
            opacity="0.15"
          />
          <rect
            x={pad}
            y={pad + w / 2}
            width={w / 2}
            height={w / 2}
            fill="#8B4513"
            opacity="0.08"
          />
          <rect
            x={pad + w / 2}
            y={pad + w / 2}
            width={w / 2}
            height={w / 2}
            fill="#6B7B5E"
            opacity="0.10"
          />

          {/* Grid */}
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v} stroke="#E4DBC8" strokeWidth="0.5">
              <line x1={x(v)} y1={pad} x2={x(v)} y2={pad + w} />
              <line x1={pad} y1={y(v)} x2={pad + w} y2={y(v)} />
            </g>
          ))}
          {/* Axes */}
          <line
            x1={pad}
            y1={pad + w}
            x2={pad + w}
            y2={pad + w}
            stroke="#1B2B4B"
            strokeWidth="1.5"
          />
          <line x1={pad} y1={pad} x2={pad} y2={pad + w} stroke="#1B2B4B" strokeWidth="1.5" />

          {/* Quadrant labels */}
          <text
            x={pad + w * 0.75}
            y={pad + 18}
            textAnchor="middle"
            fontSize="10"
            fill="#1B2B4B"
            fontWeight="700"
          >
            AGIR AGORA
          </text>
          <text
            x={pad + w * 0.25}
            y={pad + 18}
            textAnchor="middle"
            fontSize="10"
            fill="#8B4513"
            fontWeight="700"
          >
            AVALIAR
          </text>
          <text
            x={pad + w * 0.75}
            y={pad + w - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#6B7B5E"
            fontWeight="700"
          >
            CULTIVAR
          </text>
          <text
            x={pad + w * 0.25}
            y={pad + w - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#8B4513"
            fontWeight="700"
          >
            MONITORAR
          </text>

          {/* Axis labels */}
          <text
            x={pad + w / 2}
            y={size + 20}
            textAnchor="middle"
            fontSize="11"
            fill="#1B2B4B"
            fontWeight="600"
          >
            Elegibilidade →
          </text>
          <text
            x={14}
            y={pad + w / 2}
            textAnchor="middle"
            fontSize="11"
            fill="#1B2B4B"
            fontWeight="600"
            transform={`rotate(-90 14 ${pad + w / 2})`}
          >
            Urgência →
          </text>

          {/* Dots */}
          {CLIENTS.map((c) => (
            <g key={c.name}>
              <circle
                cx={x(c.eleg)}
                cy={y(c.urg)}
                r="8"
                fill={dotColor[c.health]}
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={x(c.eleg) + 12}
                y={y(c.urg) + 3}
                fontSize="9"
                fill="#1B2B4B"
                fontWeight="600"
              >
                {c.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-serif text-lg text-navy">Legenda — saúde</h3>
          <ul className="space-y-2 text-sm">
            {[
              {
                c: "#059669",
                l: "Saudável",
                n: CLIENTS.filter((c) => c.health === "green").length,
              },
              {
                c: "#D97706",
                l: "Atenção",
                n: CLIENTS.filter((c) => c.health === "yellow").length,
              },
              { c: "#DC2626", l: "Crítico", n: CLIENTS.filter((c) => c.health === "red").length },
            ].map((it) => (
              <li key={it.l} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: it.c }} />
                  <span className="text-navy">{it.l}</span>
                </div>
                <span className="text-[12px] text-navy/70">{it.n} casos</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-muted/60 p-4 text-[12px] text-navy/70">
          Cada ponto é um cliente ativo. Priorize o quadrante superior direito — alta elegibilidade
          e alta urgência — para maximizar conversão.
        </div>
      </div>
    </div>
  );
}

function RadarIndividual() {
  const [sel, setSel] = useState<string>(CLIENTS[0].name);
  const client = CLIENTS.find((c) => c.name === sel)!;
  const axes = [
    { k: "Documentação", v: client.values[0] },
    { k: "Origem", v: client.values[1] },
    { k: "Conexões", v: client.values[2] },
    { k: "Elegibilidade", v: client.values[3] },
    { k: "Memória", v: client.values[4] },
    { k: "Legado", v: client.values[5] },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gold">Cliente</div>
            <div className="font-serif text-xl text-navy">{client.name}</div>
          </div>
          <select
            value={sel}
            onChange={(e) => setSel(e.target.value)}
            className="rounded-lg border border-border bg-cream px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {CLIENTS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <RadarChart axes={axes} size={440} color="#C9A84C" />
      </div>
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-serif text-lg text-navy">Dimensões</h3>
        <ul className="space-y-3">
          {axes.map((a) => (
            <li key={a.k}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-navy">{a.k}</span>
                <span className="font-semibold text-gold">{a.v}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gold" style={{ width: `${a.v}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* --- Alertas --- */
function Alertas() {
  const rows = [
    {
      c: "Marina Alves",
      t: "Achado documental",
      d: "Registro batismo Coimbra 1887",
      w: 2,
      s: "novo",
    },
    {
      c: "Ricardo Vieira",
      t: "Nova conexão familiar",
      d: "Ramo materno identificado — Napoli",
      w: 4,
      s: "novo",
    },
    {
      c: "Camila Santos",
      t: "Registro paroquial",
      d: "Livro S. Maria pág. 142",
      w: 5,
      s: "revisado",
    },
    {
      c: "João Ferreira",
      t: "Contexto histórico",
      d: "Emigração 1920 — Minho",
      w: 7,
      s: "revisado",
    },
    {
      c: "Beatriz Lima",
      t: "Certidão validada",
      d: "Consulado alemão confirmou",
      w: 9,
      s: "urgente",
    },
    { c: "Paulo Neto", t: "Fotografia restaurada", d: "Foto do 1º avô — 1932", w: 3, s: "novo" },
    {
      c: "Helena Duarte",
      t: "Narrativa produzida",
      d: "Capítulo 2 do dossiê pronto",
      w: 1,
      s: "novo",
    },
  ];
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">Gestão de descobertas</div>
        <h1 className="font-serif text-3xl italic text-navy">Alertas</h1>
      </header>
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy text-cream text-left text-[11px] uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Descoberta</th>
                <th className="px-4 py-3">Espera</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">{r.c}</td>
                  <td className="px-4 py-3 text-navy/75 whitespace-nowrap">{r.t}</td>
                  <td className="px-4 py-3 text-navy/75 italic">{r.d}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
                        r.w > 5
                          ? "bg-terracotta/15 text-terracotta"
                          : "bg-orange-100 text-orange-700",
                      )}
                    >
                      {r.w}d
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wide font-semibold whitespace-nowrap",
                        r.s === "novo" && "bg-blue-100 text-blue-700",
                        r.s === "revisado" && "bg-emerald-100 text-emerald-700",
                        r.s === "urgente" && "bg-red-100 text-red-700",
                      )}
                    >
                      {r.s}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-navy whitespace-nowrap">
                      <Send className="h-3 w-3" /> Enviar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* --- Biblioteca Mestre --- */
function BiblioMestre() {
  const [sub, setSub] = useState<SubareaBiblioteca>("acervo");
  const meta = SUBAREAS_BIBLIOTECA.find((s) => s.chave === sub)!;

  const groups = [
    {
      client: "Marina Alves",
      items: [
        { t: "Dossiê linhagem paterna", type: "Dossiê", s: "Publicado" },
        { t: "Registro Coimbra 1887", type: "Registro", s: "Publicado" },
        { t: "Narrativa emigração", type: "Narrativa", s: "Em produção" },
      ],
    },
    {
      client: "Ricardo Vieira",
      items: [
        { t: "Dossiê Napoli", type: "Dossiê", s: "Em produção" },
        { t: "Certidão civil 1902", type: "Registro", s: "Revisão" },
      ],
    },
    {
      client: "Camila Santos",
      items: [
        { t: "Narrativa Andaluzia", type: "Narrativa", s: "Publicado" },
        { t: "Dossiê consolidado", type: "Dossiê", s: "Publicado" },
        { t: "Álbum fotográfico", type: "Registro", s: "Em produção" },
      ],
    },
  ];
  const chip = (s: string) =>
    s === "Publicado"
      ? "bg-emerald-100 text-emerald-700"
      : s === "Revisão"
        ? "bg-blue-100 text-blue-700"
        : "bg-orange-100 text-orange-700";

  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">Curadoria interna</div>
        <h1 className="font-serif text-3xl italic text-navy">Biblioteca Mestre</h1>
        <p className="mt-1 text-[13px] text-navy/70">
          Subáreas contextuais da biblioteca — conteúdo interno, sem exposição ao App Cliente.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {SUBAREAS_BIBLIOTECA.map((s) => (
          <button
            key={s.chave}
            type="button"
            onClick={() => setSub(s.chave)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12px] font-medium transition",
              sub === s.chave
                ? "border-navy bg-navy text-cream"
                : "border-border bg-white text-navy/70 hover:border-gold",
            )}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="text-[11px] uppercase tracking-widest text-gold">Subárea</div>
        <h2 className="font-serif text-2xl text-navy">{meta.label}</h2>
        <p className="mt-1 text-[13px] text-navy/70">{meta.finalidade}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {meta.dimensoes.map((d) => (
            <div key={d} className="rounded-lg bg-cream/60 px-3 py-2 text-[12px] text-navy">
              {d}
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-[12px] text-navy">
          Regra interna: {meta.regra}
        </p>
      </section>

      {sub === "acervo" &&
        groups.map((g) => (
          <section key={g.client}>
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-serif text-xl text-navy">{g.client}</h3>
              <span className="text-[12px] text-navy/70">{g.items.length} peças</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((it) => (
                <div key={it.t} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-widest text-gold">
                      {it.type}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        chip(it.s),
                      )}
                    >
                      {it.s}
                    </span>
                  </div>
                  <div className="font-serif text-lg text-navy">{it.t}</div>
                  <div className="mt-3 h-24 rounded-lg bg-gradient-to-br from-cream to-muted" />
                </div>
              ))}
            </div>
          </section>
        ))}

      {sub !== "acervo" && (
        <section className="rounded-2xl border border-dashed border-border bg-cream/40 p-6 text-center">
          <p className="text-[13px] text-navy/70">
            Nenhum item catalogado nesta subárea ainda. Os registros entram pelas rotinas internas de
            curadoria e permanecem restritos ao Desk.
          </p>
        </section>
      )}
    </div>
  );
}


/* --- Checklist AppCliente por caso --- */
function ChecklistAppCliente() {
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">
          Go-live · Checklist_AppCliente
        </div>
        <h1 className="font-serif text-3xl italic text-navy">Checklist AppCliente por caso</h1>
        <p className="mt-1 text-[13px] text-navy/70">
          O que precisa estar configurado no app de cada cliente.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {CASOS.map((c) => {
          const feitos = c.checklistAppCliente.filter((i) => i.feito).length;
          const total = c.checklistAppCliente.length;
          return (
            <section key={c.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-[11px] text-navy/60">{c.id}</div>
                  <h3 className="font-serif text-xl text-navy">{c.cliente}</h3>
                  <div className="text-[12px] text-navy/70">{c.tipoProcesso}</div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                    feitos === total ? "bg-emerald-600 text-white" : "bg-gold text-navy",
                  )}
                >
                  {feitos}/{total}
                </span>
              </div>
              <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${(feitos / total) * 100}%` }}
                />
              </div>
              <ul className="space-y-2">
                {c.checklistAppCliente.map((i) => (
                  <li key={i.item} className="flex items-start gap-3 rounded-lg bg-cream/60 p-3">
                    {i.feito ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-navy/40" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        i.feito ? "text-navy/50 line-through" : "font-medium text-navy",
                      )}
                    >
                      {i.item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/* --- Financeiro: resumo por caso + painel universal --- */
function Financeiro() {
  const p = painelUniversal();
  const [detalhe, setDetalhe] = useState<string | null>(null);
  const [explic, setExplic] = useState(false);
  const aberto = CASOS.find((c) => c.id === detalhe) ?? null;
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-gold">
            RESUMO_CASOS · PAINEL
          </div>
          <h1 className="font-serif text-3xl italic text-navy">Painel financeiro</h1>
          <p className="mt-1 text-[13px] text-navy/70">
            Previsto x realizado por caso e o agregado universal.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExplic(true)}
          className="rounded-full border border-gold px-4 py-2 text-[12px] font-semibold text-navy transition hover:bg-gold/20"
        >
          Como ler estes números
        </button>
      </header>

      {/* Painel universal */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-serif text-lg text-navy">Painel universal</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {[
            ["Total honorários", brl(p.honorarios)],
            ["Total despesas", brl(p.despesas)],
            ["Total taxas", brl(p.taxas)],
            ["Pago Cliente", brl(p.pago)],
            ["Desembolsado Clube", brl(p.desembolsado)],
            ["Saldo Total", brl(p.saldo)],
            ["Quantidade de casos", String(p.casos)],
            ["Ticket médio", brl(p.ticketMedio)],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-border bg-cream/60 p-4">
              <div className="text-xs uppercase tracking-wide text-navy/70">{l}</div>
              <div className="mt-1 font-serif text-2xl text-navy">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-gold/50 bg-gold/10 p-3 text-[12px] leading-relaxed text-navy/80">
          <strong className="text-navy">“Desembolsado Clube”</strong> = despesas que o Clube paga
          dentro do orçamento. <strong className="text-navy">“Pago Cliente”</strong> = o que já
          entrou do cliente.
        </div>
      </div>

      {/* Resumo por caso */}
      <div className="grid gap-6 lg:grid-cols-2">
        {CASOS.map((c) => {
          const { previsto, saldo } = resumoCaso(c);
          return (
            <section key={c.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-[11px] text-navy/60">{c.id}</div>
                  <h3 className="font-serif text-xl text-navy">{c.cliente}</h3>
                  <div className="text-[12px] text-navy/70">
                    {c.plano.nome} · {c.plano.formato}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                    saldo > 0 ? "bg-terracotta text-white" : "bg-emerald-600 text-white",
                  )}
                >
                  {saldo > 0 ? "Saldo em aberto" : "Quitado"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Honorários previstos", brl(c.plano.honorariosBase)],
                  ["Despesas previstas", brl(c.plano.despesasPrevistas)],
                  ["Taxas previstas", brl(c.plano.taxasPrevistas)],
                  ["Total previsto", brl(previsto)],
                  ["Pago pelo cliente", brl(c.financeiro.pagoCliente)],
                  ["Desembolsado Clube", brl(c.financeiro.desembolsadoClube)],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-lg border border-border bg-cream/60 p-3">
                    <div className="text-[12px] text-navy/70">{l}</div>
                    <div className="font-semibold text-navy">{v}</div>
                  </div>
                ))}
              </div>
              <div
                className={cn(
                  "mt-3 flex items-center justify-between rounded-lg p-3",
                  saldo > 0
                    ? "border border-terracotta/40 bg-terracotta/10"
                    : "border border-emerald-300 bg-emerald-50",
                )}
              >
                <span className="text-[12px] font-semibold uppercase tracking-wide text-navy/70">
                  Saldo total
                </span>
                <span
                  className={cn(
                    "font-serif text-xl",
                    saldo > 0 ? "text-terracotta" : "text-emerald-700",
                  )}
                >
                  {brl(saldo)}
                </span>
              </div>
              <div className="mt-2 text-[12px] text-navy/70">
                Parcelas sugeridas: {c.plano.parcelas}
              </div>
              <div className="mt-2 text-[11px] leading-relaxed text-navy/60">
                “Desembolsado Clube” = despesas pagas pelo Clube dentro do orçamento · “Pago
                Cliente” = valores já recebidos do cliente.
              </div>
              <button
                type="button"
                onClick={() => setDetalhe(c.id)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-navy/25 px-3 py-1.5 text-[12px] font-semibold text-navy transition hover:bg-navy hover:text-cream"
              >
                <FileText className="h-3.5 w-3.5" /> Ver detalhes
              </button>
            </section>
          );
        })}
      </div>

      {aberto && <DetalheCasoPanel caso={aberto} onClose={() => setDetalhe(null)} />}
      {explic && <ExplicacaoFinanceiroModal onClose={() => setExplic(false)} />}
    </div>
  );
}

/* --- Modal de explicação das métricas financeiras --- */
function ExplicacaoFinanceiroModal({ onClose }: { onClose: () => void }) {
  const itens = [
    [
      "Honorários previstos",
      "Valor do serviço do Clube (PARAMETROS / plano do caso). Não inclui despesas nem taxas.",
    ],
    [
      "Despesas previstas",
      "Certidões, traduções, apostilas e envios estimados no orçamento do caso.",
    ],
    [
      "Taxas previstas",
      "Taxas oficiais (consulado, comune, cartórios) previstas na planilha do planejador universal.",
    ],
    [
      "Total previsto",
      "Honorários + despesas + taxas — é a referência total mostrada também na proposta.",
    ],
    ["Pago Cliente", "Somatório do que o cliente já pagou ao Clube (LANCAMENTOS/PAGAMENTOS)."],
    [
      "Desembolsado Clube",
      "Quanto o Clube já adiantou de despesas/taxas dentro do orçamento, antes do reembolso.",
    ],
    ["Saldo total", "Total previsto menos o que o cliente já pagou. Positivo = ainda em aberto."],
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gold/40 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[11px] uppercase tracking-widest text-gold">Como ler este painel</div>
        <h3 className="font-serif text-2xl italic text-navy">Explicação das métricas</h3>
        <ul className="mt-4 space-y-3">
          {itens.map(([t, d]) => (
            <li key={t} className="rounded-xl border border-navy/15 bg-cream/60 p-3">
              <div className="text-[13px] font-semibold text-navy">{t}</div>
              <div className="text-[12px] leading-relaxed text-navy/70">{d}</div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] leading-relaxed text-navy/60">
          Origem: Planilha Mestre de Produtos + planejador universal (PARAMETROS, CASOS,
          LANCAMENTOS, RESUMO_CASOS). Valores são de referência e podem ser ajustados conforme os
          dados reais evoluem.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-navy py-2.5 text-[13px] font-semibold text-cream"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}

/* --- Painel secundário: lançamentos e pagamentos do caso --- */
function DetalheCasoPanel({
  caso: c,
  onClose,
}: {
  caso: (typeof CASOS)[number];
  onClose: () => void;
}) {
  const { previsto, saldo } = resumoCaso(c);
  const lancamentos = [
    ...c.plano.skus.map((sku) => {
      const p = produtoMestre(sku);
      return { rotulo: p?.nome ?? sku, sku, valor: p?.precoAtual ?? 0, tipo: "Honorário / SKU" };
    }),
    {
      rotulo: "Despesas previstas (certidões, traduções, apostilas)",
      sku: "—",
      valor: c.plano.despesasPrevistas,
      tipo: "Despesa",
    },
    { rotulo: "Taxas oficiais previstas", sku: "—", valor: c.plano.taxasPrevistas, tipo: "Taxa" },
  ];
  const pagamentos = [
    {
      rotulo: "Pago pelo cliente",
      valor: c.financeiro.pagoCliente,
      nota: `Formato: ${c.plano.formato} · ${c.plano.parcelas}`,
    },
    {
      rotulo: "Desembolsado pelo Clube",
      valor: c.financeiro.desembolsadoClube,
      nota: "Adiantado dentro do orçamento",
    },
    { rotulo: "Saldo em aberto", valor: saldo, nota: "Total previsto − pago pelo cliente" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy/50" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md overflow-y-auto border-l border-gold/40 bg-cream p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-mono text-[11px] text-navy/60">{c.id}</div>
            <h3 className="font-serif text-2xl italic text-navy">{c.cliente}</h3>
            <div className="text-[12px] text-navy/70">{c.plano.nome}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-navy/25 px-3 py-1 text-[12px] font-semibold text-navy"
          >
            Fechar
          </button>
        </div>

        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">
            Lançamentos previstos
          </div>
          <div className="mt-2 space-y-2">
            {lancamentos.map((l, i) => (
              <div
                key={`${l.sku}-${i}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-navy/15 bg-white p-3"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold leading-snug text-navy">{l.rotulo}</div>
                  <div className="font-mono text-[11px] text-navy/60">
                    {l.sku} · {l.tipo}
                  </div>
                </div>
                <div className="shrink-0 text-[13px] font-semibold text-navy">{brl(l.valor)}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl bg-areia p-3">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-navy/70">
              Total previsto
            </span>
            <span className="font-serif text-xl text-navy">{brl(previsto)}</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">Pagamentos</div>
          <div className="mt-2 space-y-2">
            {pagamentos.map((p) => (
              <div key={p.rotulo} className="rounded-xl border border-navy/15 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold text-navy">{p.rotulo}</span>
                  <span className="text-[13px] font-semibold text-navy">{brl(p.valor)}</span>
                </div>
                <div className="text-[11px] text-navy/60">{p.nota}</div>
              </div>
            ))}
          </div>
        </div>

        {c.historico?.length > 0 && (
          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-widest text-terracotta">
              Histórico do caso
            </div>
            <ul className="mt-2 space-y-2">
              {c.historico.map((h, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-navy/15 bg-white p-2.5 text-[12px] text-navy/80"
                >
                  <span className="font-mono text-[11px] text-navy/60">{h.t}</span> · {h.d}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-[11px] leading-relaxed text-navy/60">
          Lançamentos derivados da Planilha Mestre (SKUs do plano) e do planejador universal
          (despesas e taxas previstas). Visão interna — não exibida ao cliente.
        </p>
      </aside>
    </div>
  );
}

/* --- Integrações de pagamento + status do App Cliente --- */
function Integracoes() {
  const flag = {
    configurado: {
      cls: "bg-emerald-100 text-emerald-700 border-emerald-300",
      label: "Configurado",
    },
    "em-teste": { cls: "bg-blue-100 text-blue-700 border-blue-300", label: "Em teste" },
    pendente: { cls: "bg-orange-100 text-orange-700 border-orange-300", label: "Pendente" },
  };
  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">
          Checklist de prioridades
        </div>
        <h1 className="font-serif text-3xl italic text-navy">Integrações e status do app</h1>
        <p className="mt-1 text-[13px] text-navy/70">
          Pagamentos (T-003, T-017, T-018) e escopo MVP x fase 2 (T-026, T-043).
        </p>
      </header>

      <section>
        <h3 className="mb-3 font-serif text-xl text-navy">Status de integração de pagamentos</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {INTEGRACOES.map((i) => {
            const f = flag[i.flag];
            return (
              <div
                key={i.tarefa}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-navy/60">{i.tarefa}</span>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                      f.cls,
                    )}
                  >
                    {f.label}
                  </span>
                </div>
                <div className="font-serif text-lg text-navy">{i.titulo}</div>
                <div className="mt-1 text-[12px] text-navy/70">{i.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-xl text-navy">App Cliente — MVP x fase 2</h3>
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-navy text-left text-[11px] uppercase tracking-wide text-cream">
                <tr>
                  <th className="px-4 py-3">Tela / elemento</th>
                  <th className="px-4 py-3">Fase</th>
                  <th className="px-4 py-3">Situação</th>
                  <th className="px-4 py-3">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {STATUS_APP.map((s) => (
                  <tr key={s.tela} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-navy">{s.tela}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          s.fase === "MVP" ? "bg-gold/25 text-navy" : "bg-plum/15 text-plum",
                        )}
                      >
                        {s.fase}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 whitespace-nowrap text-[12px]",
                          s.ativo ? "text-emerald-700" : "text-navy/60",
                        )}
                      >
                        {s.ativo ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                        {s.ativo ? "Ativa" : "Planejada"}
                      </span>
                    </td>
                    <td className="px-4 py-3 italic text-navy/75">{s.nota}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SaneamentoSkus />
    </div>
  );
}

/* --- Saneamento de SKUs: origem dos dados + flags (interno) --- */
function SaneamentoSkus() {
  return (
    <section>
      <h3 className="mb-1 font-serif text-xl text-navy">Saneamento de SKUs</h3>
      <p className="mb-3 text-[12px] text-navy/70">
        Arquivos de origem e flags de saneamento. Snapshots exportados para análise externa:{" "}
        {SAUDE_SKU.snapshots.join(" · ")}.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {SANEAMENTO_FONTES.map((f) => (
          <div key={f.id} className="rounded-2xl border border-navy/25 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="font-serif text-lg leading-tight text-navy">{f.arquivo}</div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                  f.precisa_saneamento
                    ? "border-orange-300 bg-orange-100 text-orange-700"
                    : "border-emerald-300 bg-emerald-100 text-emerald-700",
                )}
              >
                precisa_saneamento: {String(f.precisa_saneamento)}
              </span>
            </div>
            <div className="text-[11px] uppercase tracking-widest text-terracotta">Usado em</div>
            <div className="text-[12px] text-navy">{f.usadoEm}</div>
            <p className="mt-2 text-[12px] leading-snug text-navy/70">{f.nota}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy/25 bg-areia p-5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-navy/70">
            Blocos do Canvas dependentes das planilhas
          </div>
          <ul className="mt-2 space-y-2">
            {ORIGEM_DADOS_CANVAS.map((b) => (
              <li key={b.bloco} className="text-[12px] text-navy">
                <span className="font-semibold">{b.bloco}</span>{" "}
                <span className="text-[10px] uppercase tracking-wide text-navy/60">({b.onde})</span>
                <div className="text-[11px] text-navy/70">{b.depende}</div>
                <div className="text-[11px] italic text-navy/60">Ganho: {b.ganhoComSaneamento}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-gold/50 bg-gold/10 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-navy/70">
            Onde o saneamento traz ganho direto
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-[12px] text-navy">
            {SAUDE_SKU.pontosDeMelhoria.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* --- Propostas: resumo por caso (src/data/propostas.ts) --- */
function Propostas() {
  return (
    <div data-tab="desk-propostas">
      <h2 className="font-serif text-2xl text-navy">Resumo da proposta por caso</h2>
      <p className="mt-1 text-[13px] text-navy/70">
        Valores consolidados da Planilha Mestre de Produtos × planejador universal — mesma base
        usada no app cliente (Conta e Legado).
      </p>

      <div className="mt-4 rounded-xl border border-gold/50 bg-gold/10 p-3 text-[12px] leading-relaxed text-navy/80">
        <strong className="text-navy">De onde vêm estes valores:</strong> todos os preços, SKUs e
        totais são lidos da Planilha Mestre de Produtos (catálogo e histórico de SKU) cruzada com o
        planejador universal (PARAMETROS, CASOS, RESUMO_CASOS). Nada é calculado fora dessas
        planilhas — ajustes finos de rótulo, preço e composição de pacote acontecem conforme os
        dados reais de cada caso evoluem.
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {PROPOSTAS.map((p) => (
          <div key={p.casoId} className="rounded-2xl border border-navy/25 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-serif text-xl text-navy">{p.cliente}</div>
                <div className="text-[11px] uppercase tracking-widest text-terracotta">
                  {p.casoId}
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-navy px-3 py-1 text-[11px] font-semibold text-cream">
                {p.capa.pais}
              </span>
            </div>

            <div className="mt-4 flex items-end justify-between rounded-xl bg-areia p-3">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-navy/70">
                  Referência total
                </div>
                <div className="font-serif text-2xl text-navy">{brl(p.capa.referenciaTotal)}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-widest text-navy/70">
                  Formato recomendado
                </div>
                <div className="text-[13px] font-semibold text-navy">{p.formatoRecomendado}</div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              {p.visaoGeral.caminhosInvestimento.map((c) => (
                <div
                  key={c.formato}
                  className={cn(
                    "rounded-lg border p-2",
                    c.formato === p.formatoRecomendado
                      ? "border-gold bg-gold/15"
                      : "border-navy/20 bg-cream",
                  )}
                >
                  <div className="text-navy/70">{c.titulo}</div>
                  <div className="font-semibold text-navy">{c.valor}</div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-navy/70">
                Principais SKUs inclusos
              </div>
              <ul className="mt-2 space-y-1">
                {p.skusPrincipais.map((s) => (
                  <li
                    key={s.sku}
                    className="flex items-start justify-between gap-3 text-[12px] text-navy"
                  >
                    <span className="min-w-0">
                      <span className="font-semibold">{s.sku}</span> · {s.nome}
                    </span>
                    <span className="shrink-0 font-semibold">{brl(s.valor)}</span>
                  </li>
                ))}
                {p.skusPrincipais.length === 0 && (
                  <li className="text-[12px] text-navy/60">
                    Pacote a definir (PARAMETROS pendentes).
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-plum/30 bg-plum/5 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-plum">
                Upsells sugeridos
              </div>
              <ul className="mt-2 space-y-1">
                {p.upsells.map((s) => (
                  <li
                    key={s.sku}
                    className="flex items-start justify-between gap-3 text-[12px] text-navy"
                  >
                    <span className="min-w-0">{s.nome}</span>
                    <span className="shrink-0 font-semibold">{brl(s.valor)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <PlanoWhatsappCard casoId={p.casoId} />

            <div className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
              {[
                p.resumoFinanceiro.linhaHonorarios,
                p.resumoFinanceiro.linhaDiagnostico,
                p.resumoFinanceiro.linhaDespesas,
                p.resumoFinanceiro.linhaTaxas,
                p.resumoFinanceiro.linhaSaldo,
              ].map((l) => (
                <div key={l.rotulo} className="rounded-lg bg-cream p-2">
                  <div className="text-navy/70">{l.rotulo}</div>
                  <div className="font-semibold text-navy">{brl(l.valor)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {RECOMENDACOES_WHATSAPP.filter((r) => !r.casoId).length > 0 && (
        <div className="mt-6">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-navy/70">
            Casos ainda não cadastrados em CASOS
          </div>
          <div className="mt-2 grid gap-4 md:grid-cols-2">
            {RECOMENDACOES_WHATSAPP.filter((r) => !r.casoId).map((r) => (
              <div
                key={r.cliente}
                className="rounded-2xl border border-navy/25 bg-white p-5 shadow-sm"
              >
                <div className="font-serif text-xl text-navy">{r.cliente}</div>
                <RecWhatsappBloco r={r} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Plano WhatsApp sugerido (interno — não exibido ao cliente) --- */
function PlanoWhatsappCard({ casoId }: { casoId: string }) {
  const r = recomendacaoWhatsappPorCaso(casoId);
  if (!r) return null;
  return <RecWhatsappBloco r={r} />;
}

function RecWhatsappBloco({ r }: { r: RecomendacaoWhatsapp }) {
  return (
    <div className="mt-4 rounded-xl border border-sage/40 bg-sage/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-navy">
          Plano WhatsApp sugerido
        </div>
        <span className="rounded-full bg-navy px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cream">
          interno
        </span>
      </div>
      <div className="mt-2 text-[12px] font-semibold text-navy">{r.combinacao}</div>
      <div className="mt-1 text-[11px] text-navy/70">
        Familiar direto: {r.familiarDireto} · Momento: {r.momento} · {r.status}
      </div>
      <ul className="mt-2 space-y-1">
        {r.skus.map((sku) => {
          const pl = planoWhatsapp(sku);
          if (!pl) return null;
          return (
            <li key={sku} className="flex items-start justify-between gap-3 text-[12px] text-navy">
              <span className="min-w-0">
                <span className="font-semibold">{pl.sku}</span> · {pl.rotulo}
                <span className="block text-[10px] uppercase tracking-wide text-navy/60">
                  {pl.tipo === "individual" ? "plano individual" : "plano familiar"} ·{" "}
                  {pl.faseGoLive}
                </span>
              </span>
              <span className="shrink-0 text-right font-semibold">
                {brl(pl.precoAtual)}
                <span className="block text-[10px] font-normal text-navy/60">
                  sugerido {brl(pl.precoSugerido)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] leading-snug text-navy/70">{r.nota}</p>
      <p className="mt-1 text-[10px] text-navy/55">
        Valores da Planilha Mestre (Catalogo Produtos / SKU · Histórico). Nenhum desses SKUs aparece
        em LANCAMENTOS ou PAGAMENTOS — nada contratado, não exibir na Conta do app cliente.
      </p>
    </div>
  );
}
