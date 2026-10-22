/**
 * Jurídico & Contrato da prancha V4 na primeira leitura de /contratos
 * (Proprietária, 21/10/2026). Somente leitura, sobre leitores existentes:
 * painelContratual, obterContrato e validacaoJuridicaCaso. Nada é enviado,
 * assinado, aprovado ou cobrado daqui.
 */
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { KitCard } from "@/components/clube-ancestral-kit/base";
import { HorizontalBars, KpiCard } from "@/components/clube-ancestral-kit/visualizacao";
import { ROTULO_STATUS_ANEXO, ROTULO_STATUS_CONTRATO, Selo } from "@/components/contratos/rotulos";
import { obterContrato, painelContratual } from "@/lib/contratos.functions";
import { validacaoJuridicaCaso } from "@/lib/crm-desk.functions";
import { ROTULO_ATO_FORMAL } from "@/lib/validacao-juridica-caso";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Contrato-base do caso piloto exibido na primeira leitura. */
export const NUMERO_CONTRATO_PILOTO = "2026-CB-0001";

const ORDEM_STATUS = ["draft", "ready_for_review", "under_human_review", "approved", "signed"];
const ANEXO_DEFINIDO = new Set(["ready_for_review", "approved", "attached", "not_applicable"]);

function humano(v: string | null | undefined): string {
  if (!v) return "Não registrado";
  const t = v.replace(/_/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Barras de completude formal só com base real; sem base = null (Dados insuficientes). */
export function completudeFormal(entrada: { status: string; anexos: { status: string }[]; validacoes: { status: string }[] }) {
  const idx = ORDEM_STATUS.indexOf(entrada.status);
  const anexosDef = entrada.anexos.filter((a) => ANEXO_DEFINIDO.has(a.status)).length;
  const valFechadas = entrada.validacoes.filter((v) => v.status !== "open").length;
  return [
    { label: "Contrato-base", pct: idx >= 0 ? Math.round((idx / (ORDEM_STATUS.length - 1)) * 100) : null, detalhe: ROTULO_STATUS_CONTRATO[entrada.status] ?? humano(entrada.status) },
    { label: "Anexos I–V", pct: entrada.anexos.length ? Math.round((anexosDef / entrada.anexos.length) * 100) : null, detalhe: `${anexosDef} de ${entrada.anexos.length} definidos` },
    { label: "Validações do instrumento", pct: entrada.validacoes.length ? Math.round((valFechadas / entrada.validacoes.length) * 100) : null, detalhe: `${valFechadas} de ${entrada.validacoes.length} concluídas` },
    { label: "Assinatura", pct: entrada.status === "signed" ? 100 : 0, detalhe: entrada.status === "signed" ? "Assinado" : "Não assinado" },
  ];
}

export function JuridicoContratoV4() {
  const fPainel = useServerFn(painelContratual);
  const fContrato = useServerFn(obterContrato);
  const fJuridico = useServerFn(validacaoJuridicaCaso);

  const qPainel = useQuery({ queryKey: ["painel-contratual"], queryFn: () => fPainel() });
  const piloto = (qPainel.data?.contratos ?? []).find((c: any) => c.contract_number === NUMERO_CONTRATO_PILOTO) as any;
  const qContrato = useQuery({
    queryKey: ["contrato", piloto?.id],
    queryFn: () => fContrato({ data: { id: String(piloto.id) } }),
    enabled: Boolean(piloto?.id),
  });
  const caseId = (qContrato.data?.contrato as any)?.case_id as string | undefined;
  const qJur = useQuery({
    queryKey: ["validacao-juridica-caso", caseId],
    queryFn: () => fJuridico({ data: { caseId: String(caseId) } }),
    enabled: Boolean(caseId),
  });

  if (qPainel.isLoading) return <p className="mb-6 text-sm text-navy/60" role="status">Carregando jurídico e contrato…</p>;
  if (qPainel.isError || !qPainel.data) {
    return <p role="alert" className="mb-6 rounded-lg border border-terracotta/40 bg-terracotta/5 p-3 text-sm text-terracotta">Não foi possível ler o estado contratual. Isto é falha de leitura, não ausência de contratos.</p>;
  }
  const p = qPainel.data as any;
  const assinados = (p.contratos as any[]).filter((c) => c.status === "signed").length;
  const c = qContrato.data as any;
  const anexos = ((c?.anexos ?? []) as any[]).filter((a) => !a.archived_at);
  const versoes = (c?.versoes ?? []) as any[];
  const conflitos = [
    ...(p.bloqueios as any[]).map((b) => ({ id: b.id, texto: b.label ?? "Validação bloqueante", selo: "Bloqueia assinatura", tom: "alerta" as const })),
    ...(p.pendencias as any[]).map((b) => ({ id: b.id, texto: b.label ?? "Validação pendente", selo: "Conferir", tom: "alerta" as const })),
    ...(p.excecoesExpiradas as any[]).map((e) => ({ id: e.id, texto: e.reason ?? e.motivo ?? "Exceção registrada", selo: "Exceção vencida", tom: "alerta" as const })),
    ...((p.excecoesVigentes ?? []) as any[]).map((e) => ({ id: e.id, texto: e.reason ?? e.motivo ?? "Exceção registrada", selo: "Exceção vigente", tom: "neutro" as const })),
    ...(p.ordensImpedidas as any[]).map((o) => ({ id: o.id, texto: `Ordem de serviço ${o.service_order_number ?? ""}`.trim(), selo: "Início impedido", tom: "alerta" as const })),
  ];

  return (
    <section className="mb-6 space-y-4" data-juridico-contrato-v4 aria-label="Jurídico e contrato">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Instrumentos vivos" value={p.contratos.length} detail="Contratos não arquivados" />
        <KpiCard label="Aguardando revisão humana" value={p.revisaoPendente.length} detail="Antes de qualquer envio" tone={p.revisaoPendente.length ? "attention" : "neutral"} />
        <KpiCard label="Anexos exigidos ausentes" value={p.anexosAusentes.length} detail="Exigidos e não definidos" tone={p.anexosAusentes.length ? "attention" : "neutral"} />
        <KpiCard label="Contratos assinados" value={assinados} detail="Assinatura registrada" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <KitCard title="Escopo e assinatura" eyebrow={`Contrato ${NUMERO_CONTRATO_PILOTO}`}>
          {!piloto ? (
            <p className="text-sm text-navy/60">Não registrado.</p>
          ) : qContrato.isLoading ? (
            <p className="text-sm text-navy/60" role="status">Carregando instrumento…</p>
          ) : qContrato.isError ? (
            <p className="text-sm text-terracotta" role="alert">Não foi possível ler o instrumento.</p>
          ) : (
            <ul className="divide-y divide-navy/10 text-sm">
              <li className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="min-w-0 text-navy">
                  Contrato-base {versoes[0] ? `· versão ${versoes[0].version_number}` : ""}
                  <span className="block text-[11px] text-navy/55">{piloto.title}</span>
                </span>
                <Selo texto={ROTULO_STATUS_CONTRATO[piloto.status] ?? humano(piloto.status)} tom={piloto.status === "signed" ? "ok" : "alerta"} />
              </li>
              {anexos.length === 0 ? (
                <li className="py-2 text-navy/60">Anexos: não registrados.</li>
              ) : (
                anexos.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span className="min-w-0 text-navy">{a.title}</span>
                    <Selo texto={ROTULO_STATUS_ANEXO[a.status] ?? humano(a.status)} tom={ANEXO_DEFINIDO.has(a.status) ? "ok" : "alerta"} />
                  </li>
                ))
              )}
              <li className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-navy">Assinatura</span>
                <Selo texto={piloto.status === "signed" ? "Assinado" : "Não assinado — aguarda revisão humana"} tom={piloto.status === "signed" ? "ok" : "alerta"} />
              </li>
            </ul>
          )}
          {piloto ? (
            <Link to="/contratos/$id" params={{ id: String(piloto.id) }} className="mt-3 inline-block text-xs font-medium text-navy underline decoration-gold underline-offset-4">
              Abrir o contrato para leitura
            </Link>
          ) : null}
        </KitCard>

        <KitCard title="Completude formal" eyebrow="Por instrumento">
          {!c ? (
            <p className="text-sm text-navy/60">Dados insuficientes.</p>
          ) : (
            <HorizontalBars
              label="Completude formal"
              items={completudeFormal({ status: piloto.status, anexos, validacoes: c.validacoes ?? [] }).map((b) => ({
                label: b.label,
                value: b.pct ?? 0,
                detail: b.pct == null ? "Dados insuficientes" : b.detalhe,
                tone: b.pct === 100 ? "navy" : "gold",
              }))}
            />
          )}
        </KitCard>
      </div>

      <KitCard title="Validação jurídica" eyebrow="Trilha do caso, regras versionadas e marcos de referência">
        {!caseId ? (
          <p className="text-sm text-navy/60">Não registrado — o contrato não está ligado a um caso.</p>
        ) : qJur.isLoading ? (
          <p className="text-sm text-navy/60" role="status">Carregando validação jurídica…</p>
        ) : qJur.isError || !qJur.data ? (
          <p className="text-sm text-terracotta" role="alert">Não foi possível ler a validação jurídica.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-lg border border-navy/10 bg-cream/50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-navy/55">Trilha</p>
              {qJur.data.semRotaAplicavel || !qJur.data.rota ? (
                <p className="mt-1 text-sm text-navy/70">Não registrado</p>
              ) : (
                <>
                  <p className="mt-1 text-sm font-medium text-navy">{qJur.data.rota.trackName ?? qJur.data.rota.pais ?? "Não registrado"}</p>
                  <p className="text-[11px] text-navy/55">Via: {humano(qJur.data.rota.viaPreliminar)}</p>
                  <span className="mt-2 inline-block"><Selo texto={`Situação: ${humano(qJur.data.rota.lifecycleStatus)}`} /></span>
                </>
              )}
            </article>
            {qJur.data.pendencias.length === 0 ? (
              <article className="rounded-lg border border-navy/10 bg-card p-3 text-sm text-navy/60">Nenhuma pendência jurídica registrada.</article>
            ) : (
              qJur.data.pendencias.map((pd, i) => (
                <article key={`${pd.rotulo}-${i}`} className="rounded-lg border border-navy/10 bg-card p-3">
                  <p className="text-sm font-medium text-navy">{pd.rotulo}</p>
                  <p className="mt-1 text-[11px] text-navy/60">{pd.decisaoHumanaNecessaria}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Selo texto={humano(pd.estado)} tom={/aprovad|validad|conclu/i.test(pd.estado) ? "ok" : "alerta"} />
                    <Selo texto={ROTULO_ATO_FORMAL[pd.atoAfetado] ?? humano(pd.atoAfetado)} />
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </KitCard>

      <KitCard title="Conflitos e conferências" eyebrow="Somente divergências já registradas">
        {conflitos.length === 0 ? (
          <p className="text-sm text-navy/60">Nenhuma divergência registrada.</p>
        ) : (
          <ul className="divide-y divide-navy/10 text-sm">
            {conflitos.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="min-w-0 text-navy">{x.texto}</span>
                <Selo texto={x.selo} tom={x.tom} />
              </li>
            ))}
          </ul>
        )}
      </KitCard>
    </section>
  );
}
