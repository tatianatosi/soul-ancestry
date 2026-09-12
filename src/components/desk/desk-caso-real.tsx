import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, FolderOpen, LayoutDashboard, Library, Scale, ShieldCheck, Target } from "lucide-react";

import { BrandLogo } from "@/components/marca/brand-logo";
import { CardIndicador, CarregandoDesk, VazioDesk, type TomEstado } from "@/components/desk/ui-desk";
import { resumoDeskDoCaso, type BlocoDesk, type ResumoDeskCaso } from "@/lib/desk-caso-real.functions";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Desk no caso real.
 *
 * As mesmas 15 superfícies da prancha `/previa-desk`, porém lendo o caso
 * canônico em `crm_casos` e suas tabelas donas do dado. Só leitura: nenhuma
 * escrita, nenhuma automação e nenhum número inventado. Bloco vazio diz que
 * está vazio; bloco que falhou diz que falhou.
 */

const GRUPOS = [
  { id: "hoje", label: "Hoje", icon: LayoutDashboard },
  { id: "comercial", label: "Marketing & Comercial", icon: Target },
  { id: "casos", label: "Pessoas & Casos", icon: FolderOpen },
  { id: "pesquisa", label: "Inteligência & Pesquisa", icon: Library },
  { id: "contratos", label: "Formalização & Financeiro", icon: Scale },
  { id: "governanca", label: "Governança & Administração", icon: ShieldCheck },
] as const;

function Cartao({ titulo, apoio, children }: { titulo: string; apoio?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-card p-4">
      <h3 className="font-serif text-lg leading-snug text-navy">{titulo}</h3>
      {apoio ? <p className="mb-2 text-xs text-navy/60">{apoio}</p> : null}
      <div className="mt-2 space-y-2 text-sm text-navy/80">{children}</div>
    </section>
  );
}

function Etiqueta({ texto, tom = "neutro" }: { texto: string; tom?: TomEstado }) {
  const classes: Record<TomEstado, string> = {
    neutro: "border-navy/15 bg-cream/70 text-navy/75",
    critico: "border-critico/30 bg-critico-suave text-critico",
    atencao: "border-atencao/30 bg-atencao-suave text-atencao",
    sucesso: "border-sucesso/30 bg-sucesso-suave text-sucesso",
    bloqueio: "border-bloqueio/25 bg-bloqueio-suave text-bloqueio",
  };
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", classes[tom])}>
      {texto}
    </span>
  );
}

/** Lista honesta: erro de leitura, vazio real ou linhas. */
function Bloco({
  bloco,
  vazio,
  linha,
}: {
  bloco: BlocoDesk<Record<string, any>>;
  vazio: string;
  linha: (r: Record<string, any>, i: number) => ReactNode;
}) {
  if (bloco.erro) {
    return (
      <p role="alert" className="rounded-lg border border-terracotta/40 bg-terracotta/5 p-3 text-xs text-terracotta">
        Não foi possível ler estes registros: {bloco.erro}. Isto é falha de leitura, não ausência de dados.
      </p>
    );
  }
  if (bloco.linhas.length === 0) return <VazioDesk titulo={vazio} descricao="Nada registrado para este caso até agora." />;
  return <ul className="space-y-2">{bloco.linhas.map((r, i) => <li key={String(r["id"] ?? i)}>{linha(r, i)}</li>)}</ul>;
}

function Item({ titulo, apoio, etiqueta, tom }: { titulo: string; apoio?: string | null; etiqueta?: string | null; tom?: TomEstado }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-navy/10 bg-cream/40 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm text-navy">{titulo}</p>
        {apoio ? <p className="truncate text-xs text-navy/55">{apoio}</p> : null}
      </div>
      {etiqueta ? <Etiqueta texto={etiqueta} tom={tom ?? "neutro"} /> : null}
    </div>
  );
}

const data = (v: unknown) => (v ? new Date(String(v)).toLocaleDateString("pt-BR") : "sem data");
const total = (b: BlocoDesk<any>) => (b.erro ? null : b.linhas.length);

type Tela = { id: string; titulo: string; grupo: string; rota: string; render: (d: ResumoDeskCaso) => ReactNode };

const TELAS: Tela[] = [
  {
    id: "hoje",
    titulo: "Hoje",
    grupo: "hoje",
    rota: "/painel",
    render: (d) => (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <CardIndicador rotulo="Alertas abertos" valor={total(d.alertas)} apoio="registrados no caso" tom="atencao" />
          <CardIndicador rotulo="Tarefas do caso" valor={total(d.tarefas)} apoio="na fila operacional" />
          <CardIndicador rotulo="Pendências de ativação" valor={d.gates.erro ? null : d.gates.linhas.filter((g) => g["status"] !== "ok" && g["status"] !== "validado").length} apoio="gates não validados" tom="critico" />
          <CardIndicador rotulo="Microentregas publicadas" valor={d.projecoes.erro ? null : d.projecoes.linhas.filter((p) => p["approval_status"] === "published").length} apoio="visíveis ao cliente" tom="sucesso" />
        </div>
        <Cartao titulo="Próxima ação do caso" apoio="Campo canônico de crm_casos">
          {d.proximaAcao ? (
            <Item titulo={d.proximaAcao} apoio={`Responsável: ${d.responsavelProximaAcao ?? "não definido"} · Prazo: ${data(d.prazoProximaAcao)}`} etiqueta="Próxima ação" tom="atencao" />
          ) : (
            <VazioDesk titulo="Sem próxima ação definida" descricao="O caso está sem ação registrada — isso é uma pendência, não um estado neutro." />
          )}
        </Cartao>
        <Cartao titulo="Alertas do caso">
          <Bloco bloco={d.alertas} vazio="Nenhum alerta" linha={(r) => <Item titulo={String(r["titulo"] ?? "Alerta")} apoio={`${r["detalhe"] ?? ""} · vence ${data(r["due_at"])}`} etiqueta={String(r["criticidade"] ?? r["status"] ?? "")} tom="critico" />} />
        </Cartao>
      </div>
    ),
  },
  {
    id: "comercial",
    titulo: "Comercial / CRM Vivo",
    grupo: "comercial",
    rota: "/crm-mestre",
    render: (d) => (
      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao titulo="Propostas do caso" apoio="proposals">
          <Bloco bloco={d.propostas} vazio="Nenhuma proposta" linha={(r) => <Item titulo={`Versão ${r["versao"] ?? "—"}`} apoio={`Valor ${r["valor"] ?? "—"} ${r["moeda"] ?? ""} · enviada ${data(r["enviada_em"])}`} etiqueta={String(r["status"] ?? "")} />} />
        </Cartao>
        <Cartao titulo="Interações registradas" apoio="crm_interactions">
          <Bloco bloco={d.interacoes} vazio="Nenhuma interação registrada" linha={(r) => <Item titulo={String(r["tipo"] ?? "Interação")} apoio={`${r["canal"] ?? ""} · ${data(r["ocorrida_em"])}`} />} />
        </Cartao>
      </div>
    ),
  },
  {
    id: "kanban",
    titulo: "Kanban operacional",
    grupo: "casos",
    rota: "/tarefas",
    render: (d) => (
      <Cartao titulo="Tarefas por estado" apoio="tarefas (caso_id)">
        <Bloco bloco={d.tarefas} vazio="Nenhuma tarefa" linha={(r) => <Item titulo={String(r["titulo"] ?? "Tarefa")} apoio={`Prazo ${data(r["prazo"])} · prioridade ${r["prioridade"] ?? "—"}${r["bloqueio"] ? ` · bloqueio: ${r["motivo_bloqueio"] ?? "sim"}` : ""}`} etiqueta={String(r["status"] ?? "")} tom={r["bloqueio"] ? "bloqueio" : "neutro"} />} />
      </Cartao>
    ),
  },
  {
    id: "caso360",
    titulo: "Caso 360",
    grupo: "casos",
    rota: "/casos",
    render: (d) => (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <CardIndicador rotulo="Pessoas no caso" valor={total(d.pessoas)} apoio="case_members" />
          <CardIndicador rotulo="Itens de checklist" valor={total(d.checklist)} apoio="case_checklist_items" />
          <CardIndicador rotulo="Eventos na linha do tempo" valor={total(d.timeline)} apoio="case_timeline_events" />
        </div>
        <Cartao titulo="Linha do tempo do caso" apoio="20 eventos mais recentes">
          <Bloco bloco={d.timeline} vazio="Sem eventos" linha={(r) => <Item titulo={String(r["title"] ?? "Evento")} apoio={`${r["phase"] ?? ""} · ${data(r["occurred_at"])} · ${r["responsavel_nome"] ?? "sem responsável"}${r["next_action"] ? ` · próxima: ${r["next_action"]}` : ""}`} etiqueta={String(r["status"] ?? "")} tom={r["bloqueio"] ? "bloqueio" : "neutro"} />} />
        </Cartao>
        <Cartao titulo="Checklist do caso">
          <Bloco bloco={d.checklist} vazio="Sem checklist" linha={(r) => <Item titulo={String(r["label"] ?? "Item")} apoio={String(r["fase"] ?? "")} etiqueta={String(r["status"] ?? "")} tom={r["status"] === "concluido" ? "sucesso" : "atencao"} />} />
        </Cartao>
      </div>
    ),
  },
  {
    id: "pessoa360",
    titulo: "Pessoa 360",
    grupo: "casos",
    rota: "/clientes",
    render: (d) => (
      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao titulo="Integrantes do caso" apoio="case_members">
          <Bloco bloco={d.pessoas} vazio="Nenhuma pessoa vinculada" linha={(r) => <Item titulo={String(r["nome"] ?? "Pessoa")} apoio={`${r["papel_no_caso"] ?? r["parentesco"] ?? "papel não informado"}`} etiqueta={r["requerente"] ? "Requerente" : String(r["status_cadastral"] ?? "")} />} />
        </Cartao>
        <Cartao titulo="Dependentes" apoio="case_dependents">
          <Bloco bloco={d.dependentes} vazio="Nenhum dependente" linha={(r) => <Item titulo={String(r["nome_completo"] ?? "Dependente")} apoio={String(r["vinculo_com_titular"] ?? "")} etiqueta={String(r["status_representacao"] ?? "")} />} />
        </Cartao>
      </div>
    ),
  },
  {
    id: "radar",
    titulo: "Radar & Matrizes",
    grupo: "casos",
    rota: "/proximas-acoes",
    render: (d) => (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <CardIndicador rotulo="Alertas" valor={total(d.alertas)} tom="atencao" apoio="case_alerts" />
          <CardIndicador rotulo="Tarefas bloqueadas" valor={d.tarefas.erro ? null : d.tarefas.linhas.filter((t) => t["bloqueio"]).length} tom="bloqueio" apoio="bloqueio = verdadeiro" />
          <CardIndicador rotulo="Gates obrigatórios" valor={d.gates.erro ? null : d.gates.linhas.filter((g) => g["obrigatorio"]).length} apoio="case_activation_checks" />
          <CardIndicador rotulo="Evidências" valor={total(d.evidencias)} apoio="evidences" />
        </div>
        <Cartao titulo="Gates de ativação" apoio="Estado real, sem projeção">
          <Bloco bloco={d.gates} vazio="Sem gates registrados" linha={(r) => <Item titulo={String(r["label"] ?? "Gate")} apoio={`${r["dominio"] ?? ""}${r["observacao"] ? ` · ${r["observacao"]}` : ""}`} etiqueta={String(r["status"] ?? "")} tom={r["status"] === "ok" ? "sucesso" : "atencao"} />} />
        </Cartao>
      </div>
    ),
  },
  {
    id: "pesquisa",
    titulo: "Pesquisa",
    grupo: "pesquisa",
    rota: "/pesquisa",
    render: (d) => (
      <div className="space-y-4">
        <Cartao titulo="Caso de pesquisa" apoio="research_cases">
          <Bloco bloco={d.pesquisa} vazio="Nenhum caso de pesquisa aberto" linha={(r) => <Item titulo={String(r["research_objective"] ?? "Pesquisa do caso")} apoio={`Próxima ação: ${r["next_research_action"] ?? "não definida"} · prazo ${data(r["next_research_action_due_at"])} · confiança ${r["confidence_level"] ?? "—"}`} etiqueta={String(r["status"] ?? "")} />} />
        </Cartao>
        <Cartao titulo="Evidências" apoio="Fonte → transcrição → interpretação → hipótese → conclusão">
          <Bloco bloco={d.evidencias} vazio="Nenhuma evidência registrada" linha={(r) => <Item titulo={String(r["titulo"] ?? "Evidência")} apoio={String(r["tipo_fonte"] ?? "")} etiqueta={String(r["workflow_status"] ?? "")} />} />
        </Cartao>
      </div>
    ),
  },
  {
    id: "biblioteca",
    titulo: "Biblioteca Mestre",
    grupo: "pesquisa",
    rota: "/biblioteca",
    render: (d) => (
      <Cartao titulo="Fila rascunho → revisão → aprovado → publicado" apoio="app_projections deste caso">
        <Bloco bloco={d.projecoes} vazio="Nenhuma projeção criada" linha={(r) => <Item titulo={String(r["projection_type"] ?? "Projeção")} apoio={`Destino ${r["destination"] ?? "—"} · vigente desde ${data(r["effective_from"])}`} etiqueta={String(r["approval_status"] ?? "")} tom={r["approval_status"] === "published" ? "sucesso" : "atencao"} />} />
      </Cartao>
    ),
  },
  {
    id: "financeiro",
    titulo: "Financeiro",
    grupo: "contratos",
    rota: "/financeiro",
    render: (d) => (
      <Cartao titulo="Faturas do caso" apoio="invoices">
        <Bloco bloco={d.faturas} vazio="Nenhuma fatura emitida" linha={(r) => <Item titulo={`Fatura ${r["numero"] ?? "—"}`} apoio={`${r["valor"] ?? "—"} ${r["moeda"] ?? ""} · vence ${data(r["vencimento"])}`} etiqueta={String(r["status"] ?? "")} />} />
      </Cartao>
    ),
  },
  {
    id: "juridico",
    titulo: "Jurídico & Contrato",
    grupo: "contratos",
    rota: "/contratos",
    render: (d) => (
      <Cartao titulo="Contratos do caso" apoio="contracts">
        <Bloco bloco={d.contratos} vazio="Nenhum contrato registrado" linha={(r) => <Item titulo={`${r["contract_number"] ?? "Contrato"} — ${r["title"] ?? ""}`} apoio={`Assinado ${data(r["signed_at"])} · gate de pesquisa ${r["research_gate_status"] ?? "—"} · gate financeiro ${r["financial_gate_status"] ?? "—"}`} etiqueta={String(r["status"] ?? "")} />} />
      </Cartao>
    ),
  },
  {
    id: "pessoas",
    titulo: "Pessoas & Famílias",
    grupo: "casos",
    rota: "/nucleos",
    render: (d) => (
      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao titulo="Núcleo do caso" apoio="Integrantes e parentesco reais">
          <Bloco bloco={d.pessoas} vazio="Nenhuma pessoa vinculada" linha={(r) => <Item titulo={String(r["nome"] ?? "Pessoa")} apoio={String(r["parentesco"] ?? "parentesco não informado")} />} />
        </Cartao>
        <Cartao titulo="Documentos por pessoa" apoio="documents">
          <Bloco bloco={d.documentos} vazio="Nenhum documento" linha={(r) => <Item titulo={String(r["titulo"] ?? "Documento")} apoio={String(r["categoria"] ?? "")} etiqueta={String(r["status"] ?? "")} />} />
        </Cartao>
      </div>
    ),
  },
  {
    id: "portal",
    titulo: "Portal interno",
    grupo: "governanca",
    rota: "/acessos-portal",
    render: (d) => (
      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao titulo="O que já foi publicado" apoio="app_projections publicadas">
          <Bloco bloco={{ linhas: d.projecoes.linhas.filter((p) => p["approval_status"] === "published"), erro: d.projecoes.erro }} vazio="Nada publicado ainda" linha={(r) => <Item titulo={String(r["projection_type"] ?? "Projeção")} apoio={`Escopo ${r["visibility_scope"] ?? "—"}`} etiqueta="Publicado" tom="sucesso" />} />
        </Cartao>
        <Cartao titulo="Documentos liberados ao cliente" apoio="documents.liberado_cliente">
          <Bloco bloco={{ linhas: d.documentos.linhas.filter((r) => r["liberado_cliente"]), erro: d.documentos.erro }} vazio="Nenhum documento liberado" linha={(r) => <Item titulo={String(r["titulo"] ?? "Documento")} etiqueta="Liberado" tom="sucesso" />} />
        </Cartao>
      </div>
    ),
  },
  {
    id: "appcliente",
    titulo: "App Cliente (visão interna)",
    grupo: "governanca",
    rota: "/app-cliente-como-pessoa",
    render: (d) => (
      <div className="space-y-4">
        <Cartao titulo="O que o cliente vê hoje" apoio="Somente etapa, próxima ação e microentregas publicadas">
          {d.proximaAcao ? <Item titulo={d.proximaAcao} apoio={`Prazo ${data(d.prazoProximaAcao)}`} etiqueta="Próxima ação" /> : <VazioDesk titulo="Sem próxima ação publicada" descricao="Nada é mostrado ao cliente enquanto não houver ação definida." />}
          <Bloco bloco={{ linhas: d.projecoes.linhas.filter((p) => p["approval_status"] === "published"), erro: d.projecoes.erro }} vazio="Nenhuma microentrega publicada" linha={(r) => <Item titulo={String(r["projection_type"] ?? "Microentrega")} etiqueta="Publicada" tom="sucesso" />} />
        </Cartao>
        <p className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs text-navy/70">
          Alertas internos, notas e gates nunca aparecem no App Cliente. Esta tela só mostra o que já está autorizado.
        </p>
      </div>
    ),
  },
  {
    id: "configuracao",
    titulo: "Configuração & Governança",
    grupo: "governanca",
    rota: "/governanca/decisoes",
    render: (d) => (
      <div className="grid gap-4 sm:grid-cols-3">
        <CardIndicador rotulo="Caso canônico" valor={d.identidade.codigo ?? "—"} apoio={`Identificador interno ${d.identidade.caseId.slice(0, 8)}…`} />
        <CardIndicador rotulo="Situação" valor={d.status ?? null} apoio="crm_casos.status" />
        <CardIndicador rotulo="Origem da leitura" valor="crm_casos" apoio="Sessão autenticada, RLS da organização" />
      </div>
    ),
  },
  {
    id: "depara",
    titulo: "Mapa de aplicação real",
    grupo: "governanca",
    rota: "leitura · sem mudança de rotas",
    render: () => (
      <div className="grid gap-3 lg:grid-cols-2">
        {TELAS.filter((t) => t.id !== "depara").map((t) => (
          <article key={t.id} className="rounded-lg border border-navy/10 bg-card p-4">
            <p className="font-serif text-lg text-navy">{t.titulo}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase text-gold">{GRUPOS.find((g) => g.id === t.grupo)?.label}</p>
            <p className="mt-2 text-xs text-navy/60">
              Tela dona do dado: <Link to={t.rota as any} className="underline">{t.rota}</Link>
            </p>
          </article>
        ))}
      </div>
    ),
  },
];

export function DeskCasoReal({ codigo = "CA-CID-AT-FAM-2026-001" }: { codigo?: string }) {
  const [ativa, setAtiva] = useState(TELAS[0]!.id);
  const carregar = useServerFn(resumoDeskDoCaso);
  const q = useQuery({
    queryKey: ["desk-caso-real", codigo],
    queryFn: () => carregar({ data: { codigo } }),
    retry: false,
  });

  const tela = TELAS.find((t) => t.id === ativa) ?? TELAS[0]!;
  const d = q.data;

  return (
    <div className="min-h-screen bg-background font-sans text-navy">
      <div className="bg-navy px-4 py-2 text-center text-[11px] font-medium uppercase tracking-widest text-cream">
        Desk no caso real · {d?.identidade.codigo ?? codigo} · somente leitura
      </div>

      <div className="lg:flex">
        <aside className="min-w-0 max-w-full overflow-hidden bg-navy px-3 py-4 lg:min-h-[calc(100vh-2rem)] lg:w-64 lg:shrink-0">
          <div className="px-2 pb-4">
            <BrandLogo size={34} showText variant="client-dark" />
          </div>
          <nav className="flex w-full gap-1 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Áreas do Desk">
            {GRUPOS.map((g) => {
              const Icone = g.icon;
              const ativo = tela.grupo === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    const primeira = TELAS.find((t) => t.grupo === g.id);
                    if (primeira) setAtiva(primeira.id);
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left font-serif text-sm transition-colors",
                    ativo ? "bg-gold text-navy" : "text-cream/80 hover:bg-primary-foreground/10 hover:text-cream",
                  )}
                >
                  <Icone className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{g.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="mt-3 border-t border-primary-foreground/15 pt-3">
            <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Superfícies da área selecionada">
              {TELAS.filter((item) => item.grupo === tela.grupo).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAtiva(item.id)}
                  className={cn(
                    "shrink-0 rounded-md border px-2.5 py-1.5 text-left text-[10px] transition-colors lg:w-full",
                    item.id === tela.id
                      ? "border-gold bg-primary-foreground/10 font-semibold text-gold"
                      : "border-primary-foreground/10 text-primary-foreground/65 hover:border-primary-foreground/25 hover:text-primary-foreground",
                  )}
                >
                  {item.titulo}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <main className="p-4 lg:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate font-serif text-3xl leading-tight text-navy">{tela.titulo}</h1>
                <p className="mt-1 text-xs text-navy/60">
                  Tela dona do dado: <span className="font-medium">{tela.rota}</span>
                  {d ? <> · caso {d.identidade.codigo} — {d.identidade.titulo}</> : null}
                </p>
              </div>
              <Etiqueta texto="Dados reais do caso" tom="sucesso" />
            </div>

            {q.isLoading ? <CarregandoDesk linhas={3} rotulo="Carregando o caso real" /> : null}
            {q.isError ? (
              <p role="alert" className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4 text-sm text-terracotta">
                {q.error instanceof Error ? q.error.message : "Falha ao carregar o caso."}
              </p>
            ) : null}
            {d ? tela.render(d) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
