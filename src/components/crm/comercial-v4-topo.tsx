/**
 * Topo comercial da prancha V4 em /calls (decisão da Proprietária, 21/10/2026).
 *
 * Revoga, para /calls, a decisão de 14/10/2026 (PR #157) que deixava funil e
 * Kanban só em /leads. Somente leitura: tudo vem dos mesmos leads reais que a
 * Mesa já carrega (listarLeadsDesk). Nada é gravado aqui; "Novo lead" leva ao
 * cadastro que já existe em /leads.
 */
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { KitCard } from "@/components/clube-ancestral-kit/base";
import { CrmKanban } from "@/components/clube-ancestral-kit/operacao";
import { ColumnChart, HorizontalBars } from "@/components/clube-ancestral-kit/visualizacao";
import { colunasPorEtapaComercial } from "@/components/desk/superficies-kit-conectadas";
import { ETAPAS_PIPELINE, etapaPipeline, rotulo, type EtapaPipeline, type LeadDesk } from "@/lib/crm-desk";

/** Códigos gravados (ex.: follow_up_proposta) lidos como texto. */
function textoHumano(v: string): string {
  if (!/^[a-z0-9_]+$/.test(v)) return v;
  const t = v.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const SEM_ORIGEM = "Sem origem registrada";

/** Rótulo do funil V4: a primeira etapa do pipeline é a entrada pela origem. */
export const ROTULO_FUNIL_V4: Record<EtapaPipeline, string> = {
  leads: "Origem",
  discovery: "Discovery",
  diagnostico: "Diagnóstico",
  proposta: "Proposta",
  contrato: "Contrato",
};

const ENCERRADOS = new Set(["perdido", "encerrado_sem_aderencia"]);

export function origemDoLead(l: Pick<LeadDesk, "origem">): string {
  return l.origem ? rotulo("origem", l.origem) : SEM_ORIGEM;
}

/** Leads ativos contados pela etapa já gravada (sem cálculo novo). */
export function funilV4(leads: readonly LeadDesk[]): { etapa: EtapaPipeline; total: number }[] {
  const ativos = leads.filter((l) => !l.archived_at && !ENCERRADOS.has(String(l.eixo_comercial ?? "")));
  return ETAPAS_PIPELINE.map((etapa) => ({ etapa, total: ativos.filter((l) => etapaPipeline(l) === etapa).length }));
}

/** Quantos leads chegaram pelo menos até cada etapa, sobre a base da etapa de origem. */
export function conversaoPorEtapaV4(funil: { etapa: EtapaPipeline; total: number }[]) {
  const base = funil.reduce((s, f) => s + f.total, 0);
  return funil.map((f, i) => {
    const chegaram = funil.slice(i).reduce((s, x) => s + x.total, 0);
    return { etapa: f.etapa, chegaram, base, pct: base > 0 ? Math.round((chegaram / base) * 100) : null };
  });
}

export function ComercialV4Topo({ leads }: { leads: readonly LeadDesk[] }) {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [origem, setOrigem] = useState("");
  const origens = useMemo(() => [...new Set(leads.map(origemDoLead))].sort(), [leads]);
  const filtrados = useMemo(() => (origem ? leads.filter((l) => origemDoLead(l) === origem) : leads), [leads, origem]);

  const funil = funilV4(filtrados);
  const conversao = conversaoPorEtapaV4(funil);
  const base = conversao[0]?.base ?? 0;

  const porCanal = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of filtrados) m.set(origemDoLead(l), (m.get(origemDoLead(l)) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value, highlighted: label !== SEM_ORIGEM }));
  }, [filtrados]);

  // Origem e qualidade: só leads com origem declarada; qualidade = chegou ao Discovery ou além.
  const qualidade = useMemo(() => {
    const m = new Map<string, { total: number; avancaram: number }>();
    for (const l of filtrados) {
      if (!l.origem) continue;
      const k = origemDoLead(l);
      const atual = m.get(k) ?? { total: 0, avancaram: 0 };
      atual.total += 1;
      if (etapaPipeline(l) !== "leads") atual.avancaram += 1;
      m.set(k, atual);
    }
    return [...m.entries()].map(([label, v]) => ({
      label,
      value: Math.round((v.avancaram / v.total) * 100),
      detail: `${v.avancaram} de ${v.total} chegaram ao Discovery`,
      tone: "gold" as const,
    }));
  }, [filtrados]);

  const colunas = useMemo(() => {
    const ativos = filtrados.filter((l) => !ENCERRADOS.has(String(l.eixo_comercial ?? "")));
    return colunasPorEtapaComercial(ativos as unknown as Record<string, unknown>[]).map((c) => ({
      ...c,
      items: c.items.map((i) => {
        const l = ativos.find((x) => x.id === i.id);
        return { ...i, context: l ? origemDoLead(l) : i.context, nextAction: i.nextAction ? textoHumano(i.nextAction) : i.nextAction };
      }),
    }));
  }, [filtrados]);

  return (
    <section className="mb-8 space-y-4" data-comercial-v4-topo aria-label="Funil comercial vivo">
      <KitCard
        title="Funil comercial vivo"
        eyebrow="Origem → Discovery → Diagnóstico → Proposta → Contrato"
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-expanded={filtrosAbertos}
              onClick={() => setFiltrosAbertos((v) => !v)}
              className="min-h-9 rounded-full border border-navy/20 px-3 text-xs text-navy hover:bg-navy/5"
            >
              Filtros{origem ? " · 1" : ""}
            </button>
            <Link to="/leads" className="inline-flex min-h-9 items-center rounded-full bg-navy px-3 text-xs font-medium text-cream hover:bg-navy/90">
              Novo lead
            </Link>
          </div>
        }
      >
        {filtrosAbertos ? (
          <label className="mb-3 block max-w-xs text-xs text-navy/60">
            Origem do lead
            <select value={origem} onChange={(e) => setOrigem(e.target.value)} className="mt-1 w-full rounded-lg border border-navy/15 bg-card px-2 py-1.5 text-xs text-navy">
              <option value="">Todas as origens</option>
              {origens.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
        ) : null}
        {base === 0 ? (
          <p className="text-sm text-navy/60">Sem dados suficientes — nenhum lead ativo registrado.</p>
        ) : (
          <ol className="grid gap-2 sm:grid-cols-5">
            {funil.map((f) => (
              <li key={f.etapa} className="rounded-lg border border-navy/10 bg-cream/50 px-3 py-2">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-navy/55">{ROTULO_FUNIL_V4[f.etapa]}</span>
                <span className="font-serif text-2xl tabular-nums text-navy">{f.total}</span>
                <span className="block text-[10px] text-navy/50">lead(s) nesta etapa</span>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-2 text-[11px] text-navy/50">Etapa já gravada no lead. Leads perdidos ou encerrados não entram.</p>
      </KitCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <KitCard title="Aquisição por canal">
          {porCanal.length === 0 ? (
            <p className="text-sm text-navy/60">Sem dados suficientes.</p>
          ) : (
            <ColumnChart items={porCanal} label="Aquisição por canal" />
          )}
          <p className="mt-2 text-[11px] text-navy/50">Origem registrada no lead; sem origem entra como "{SEM_ORIGEM}".</p>
        </KitCard>
        <KitCard title="Conversão por etapa">
          {base === 0 ? (
            <p className="text-sm text-navy/60">Sem dados suficientes.</p>
          ) : (
            <HorizontalBars
              label="Conversão por etapa"
              items={conversao.map((c) => ({ label: ROTULO_FUNIL_V4[c.etapa], value: c.pct ?? 0, detail: `${c.chegaram} de ${c.base}` }))}
            />
          )}
          <p className="mt-2 text-[11px] text-navy/50">Leads que chegaram pelo menos até a etapa, sobre o total ativo.</p>
        </KitCard>
        <KitCard title="Origem e qualidade">
          {qualidade.length === 0 ? (
            <p className="text-sm text-navy/60">Sem dados suficientes — nenhum lead com origem registrada.</p>
          ) : (
            <HorizontalBars label="Origem e qualidade" items={qualidade} />
          )}
        </KitCard>
      </div>

      <div>
        <h2 className="mb-2 font-serif text-lg text-navy">Leads por etapa</h2>
        {colunas.length === 0 ? (
          <p className="rounded-lg border border-navy/10 bg-card p-4 text-sm text-navy/60">Sem dados suficientes — nenhum lead ativo.</p>
        ) : (
          <CrmKanban columns={colunas} />
        )}
      </div>
    </section>
  );
}
