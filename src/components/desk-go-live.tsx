/**
 * Desk Intelligence — Go-live e registro central de casos (módulo novo).
 * Filtros, detalhe do caso em 4 blocos, checklist pós-fechamento e alertas.
 */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Circle, Filter, Link2, MessageCircle, Search } from "lucide-react";
import {
  alertasDoRegistro,
  CASE_REGISTRY,
  CASE_STATES,
  CONFIANCA_TOM,
  GO_LIVE_CHECKLIST,
  INTEGRACOES_FUTURAS,
  type CaseRecord,
} from "@/data/case-registry";

export function GoLiveDesk() {
  const [busca, setBusca] = useState("");
  const [estado, setEstado] = useState<string>("todos");
  const [pais, setPais] = useState<string>("todos");
  const [selecionado, setSelecionado] = useState<string>(CASE_REGISTRY[0].id);
  const [ticks, setTicks] = useState<Record<string, Record<string, boolean>>>({});

  const paises = useMemo(() => ["todos", ...Array.from(new Set(CASE_REGISTRY.map((c) => c.country)))], []);
  const lista = CASE_REGISTRY.filter(
    (c) =>
      (estado === "todos" || c.caseStatus === estado) &&
      (pais === "todos" || c.country === pais) &&
      (busca.trim() === "" ||
        `${c.clientName} ${c.id} ${c.caseOwner} ${c.nextAction}`.toLowerCase().includes(busca.toLowerCase())),
  );
  const caso = CASE_REGISTRY.find((c) => c.id === selecionado) ?? CASE_REGISTRY[0];
  const alertas = alertasDoRegistro();
  const alertasCaso = alertas.filter((a) => a.caso === caso.clientName);

  const marcado = (item: string, padrao?: boolean) =>
    ticks[caso.id]?.[item] ?? padrao ?? caso.checklist.find((i) => i.item === item)?.feito ?? false;
  const alternar = (item: string, padrao?: boolean) =>
    setTicks((t) => ({ ...t, [caso.id]: { ...(t[caso.id] ?? {}), [item]: !marcado(item, padrao) } }));

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
        <p className="font-medium">Arquivo histórico — fora da operação</p>
        <p className="mt-1 text-terracotta/90">
          “Go-live” saiu do vocabulário de produto (decisão 2026-09-11). Registro de casos, fechamento e
          ativação vivem em Casos 360 (`/casos`) e onboarding. Este componente usa fixture local e não
          grava no motor.
        </p>
      </div>
      <div>
        <h1 className="font-serif text-3xl text-navy">Go-live (legado) — registro demonstrativo</h1>
        <p className="mt-1 text-sm text-navy/70">
          Estados padronizados e checklist pós-fechamento do protótipo. Dados demonstrativos e locais —
          sem integração ativa com Asaas, CRM ou planilha mestre.
        </p>
      </div>

      {/* filtros */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-navy/10 bg-cream/40 p-3">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-navy/10 px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-navy/40" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Cliente, ID, responsável ou próxima ação"
            className="w-full bg-transparent text-[12px] text-navy outline-none placeholder:text-navy/40"
          />
        </div>
        <Select value={estado} onChange={setEstado} options={["todos", ...CASE_STATES]} label="Status do caso" />
        <Select value={pais} onChange={setPais} options={paises} label="País" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.3fr]">
        {/* lista */}
        <div className="space-y-2">
          {lista.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelecionado(c.id)}
              className={cn(
                "w-full rounded-xl border bg-cream/40 p-4 text-left shadow-sm transition",
                c.id === caso.id ? "border-gold ring-2 ring-gold/25" : "border-navy/10 hover:bg-areia/50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-serif text-lg leading-snug text-navy">{c.clientName}</div>
                  <div className="text-[11px] text-navy/60">
                    {c.id} · {c.country}
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-navy/20 bg-areia px-2.5 py-0.5 text-[10px] font-semibold text-navy">
                  {c.caseStatus}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                <Tag>Proposta: {c.proposalStatus}</Tag>
                <Tag>Contrato: {c.contractStatus}</Tag>
                <Tag>Pagamento: {c.paymentStatus}</Tag>
                <Tag>F1: {c.phase1Status}</Tag>
                <Tag>F2: {c.phase2Status}</Tag>
              </div>
              <div className="mt-2 text-[11px] text-navy/70">
                Responsável: {c.caseOwner} · Próxima ação: {c.nextAction}
              </div>
            </button>
          ))}
          {lista.length === 0 && (
            <div className="rounded-xl border border-dashed border-navy/10 p-6 text-center text-[12px] text-navy/60">
              Nenhum caso com esses filtros.
            </div>
          )}
        </div>

        {/* detalhe */}
        <div className="space-y-4">
          <Bloco titulo="Jornada e entregas">
            <div className="grid gap-2 sm:grid-cols-2">
              <Linha k="Fase 01" v={caso.phase1Status} />
              <Linha k="Fase 02" v={caso.phase2Status} />
              <Linha k="Última atualização" v={caso.lastUpdate} />
              <Linha k="Caminho" v={caso.citizenshipPath} />
            </div>
            <div className="mt-3 space-y-1.5">
              {caso.reports.length === 0 && <p className="text-[12px] italic text-navy/55">Nenhuma entrega criada ainda.</p>}
              {caso.reports.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-cream/70 px-3 py-2 text-[11px]">
                  <span className="text-navy">{r.titulo}</span>
                  <span className="text-navy/60">
                    {r.status} · {r.versao} · {r.responsavel}
                  </span>
                </div>
              ))}
            </div>
          </Bloco>

          <Bloco titulo="Documentos">
            <div className="space-y-1.5">
              {caso.documents.map((d) => (
                <div key={d.item} className="rounded-lg border border-navy/10 px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[12px] text-navy">{d.item}</span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", CONFIANCA_TOM[d.status])}>
                      {d.status}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-navy/60">
                    {d.origem} · {d.responsavel} · atualizado em {d.atualizadoEm} — {d.observacao}
                  </div>
                </div>
              ))}
            </div>
          </Bloco>

          <Bloco titulo="Comercial e financeiro">
            <div className="grid gap-2 sm:grid-cols-2">
              <Linha k="Proposta" v={caso.proposalStatus} />
              <Linha k="Contrato" v={caso.contractStatus} />
              <Linha k="Pagamento" v={caso.paymentStatus} />
              <Linha k="paymentUrl" v={caso.paymentUrl || "não configurado"} />
            </div>
            <p className="mt-2 text-[12px] text-navy/70">{caso.proposalSummary}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full border border-navy/20 px-2.5 py-1 text-navy/70">
                <Link2 className="h-3 w-3" /> Link de contratação configurável pela equipe
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-navy/20 px-2.5 py-1 text-navy/70">
                <MessageCircle className="h-3 w-3" /> Mensagem de WhatsApp enviada manualmente
              </span>
            </div>
          </Bloco>

          <Bloco titulo="Operação">
            <div className="grid gap-2 sm:grid-cols-2">
              <Linha k="Responsável" v={caso.caseOwner} />
              <Linha k="Próxima ação" v={caso.nextAction} />
              {caso.caseType && <Linha k="Tipo do caso" v={caso.caseType} />}
              <Linha k="Fase 01" v={caso.phase1Status} />
            </div>
            <p className="mt-2 text-[12px] text-navy/70">{caso.confidenceNote}</p>
            {caso.internalNotes?.map((n) => (
              <p key={n} className="mt-1 text-[11px] italic text-navy/60">
                Nota interna: {n}
              </p>
            ))}
            <div className="mt-3 space-y-1.5">
              {alertasCaso.length === 0 ? (
                <p className="text-[12px] italic text-navy/55">Sem alertas para este caso.</p>
              ) : (
                alertasCaso.map((a, i) => (
                  <div
                    key={`${a.titulo}-${i}`}
                    className={cn(
                      "flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px]",
                      a.nivel === "alto" ? "border-terracotta/40 bg-terracotta/10 text-terracotta" : "border-gold/50 bg-gold/10 text-navy",
                    )}
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      <strong>{a.titulo}</strong> — {a.detalhe}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Bloco>

          {caso.reportSource && (
            <Bloco titulo="Fonte do relatório">
              <div className="grid gap-2 sm:grid-cols-2">
                <Linha k="Arquivo/anexo" v={caso.reportSource.arquivo} />
                <Linha k="Data" v={caso.reportSource.data} />
                <Linha k="Versão" v={caso.reportSource.versao} />
                <Linha k="Responsável" v={caso.reportSource.responsavel} />
                <Linha k="Status de validação" v={caso.reportSource.validacao} />
              </div>
              <p className="mt-2 text-[12px] text-navy/70">{caso.reportSource.observacoes}</p>
              <p className="mt-1 text-[11px] italic text-navy/55">
                Anexe aqui o arquivo e registre data, versão e responsável quando a pesquisa real for consolidada.
              </p>
            </Bloco>
          )}

          {caso.internalChecklist?.length ? (
            <Bloco titulo="Checklist interno do caso">
              <div className="space-y-1">
                {caso.internalChecklist.map((i) => {
                  const ok = marcado(i.item, i.feito);
                  return (
                    <button
                      key={i.item}
                      onClick={() => alternar(i.item, i.feito)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] text-navy transition hover:bg-areia/60"
                    >
                      {ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-sage" /> : <Circle className="h-4 w-4 shrink-0 text-navy/30" />}
                      <span className={cn(ok && "text-navy/50 line-through")}>{i.item}</span>
                    </button>
                  );
                })}
              </div>
            </Bloco>
          ) : null}

          <Bloco titulo="Checklist de go-live (pós-fechamento)">
            <div className="space-y-1">
              {GO_LIVE_CHECKLIST.map((item) => {
                const ok = marcado(item);
                return (
                  <button
                    key={item}
                    onClick={() => alternar(item)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] text-navy transition hover:bg-areia/60"
                  >
                    {ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-sage" /> : <Circle className="h-4 w-4 shrink-0 text-navy/30" />}
                    <span className={cn(ok && "text-navy/50 line-through")}>{item}</span>
                  </button>
                );
              })}
            </div>
          </Bloco>
        </div>
      </div>

      <Bloco titulo="Integração futura (dados demonstrativos)">
        <div className="grid gap-2 md:grid-cols-2">
          {INTEGRACOES_FUTURAS.map((i) => (
            <div key={i.nome} className="rounded-lg border border-navy/10 px-3 py-2">
              <div className="text-[12px] font-semibold text-navy">{i.nome}</div>
              <div className="text-[11px] text-navy/60">{i.campos}</div>
              <div className="mt-1 inline-block rounded-full bg-areia px-2 py-0.5 text-[10px] font-semibold text-navy">{i.estado}</div>
            </div>
          ))}
        </div>
      </Bloco>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-cream/40 p-4 shadow-sm">
      <div className="mb-3 text-[11px] uppercase tracking-widest text-terracotta">{titulo}</div>
      {children}
    </section>
  );
}

function Linha({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-cream/70 px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-navy/50">{k}</div>
      <div className="text-[12px] text-navy">{v}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-navy/15 bg-cream px-2 py-0.5 text-navy/70">{children}</span>;
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-navy/10 px-3 py-1.5 text-[12px] text-navy">
      <Filter className="h-3.5 w-3.5 text-navy/40" />
      <span className="text-navy/50">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent text-navy outline-none">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export type { CaseRecord };
