/**
 * Relatório Completo — Fase 02 (módulo novo, não substitui o Relatório Visual).
 * Índice lateral no desktop, accordion no mobile, prévia premium quando não entregue.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, FileText, Lock, Printer, ShieldCheck } from "lucide-react";
import { FASE02_MICROCOPY, FASE02_STATUS_TOM, secoesFase02 } from "@/data/relatorio-fase02";
import { CONFIANCA_TOM, type CaseRecord } from "@/data/case-registry";

export function RelatorioFase02({ registro }: { registro: CaseRecord }) {
  const secoes = secoesFase02(registro);
  const [ativa, setAtiva] = useState(secoes[0].id);
  const [aberta, setAberta] = useState<string | null>(secoes[0].id);
  const entregue = registro.phase2Status === "Entregue";
  const secaoAtiva = secoes.find((s) => s.id === ativa) ?? secoes[0];

  return (
    <div className="space-y-5 p-5" data-tab="fase02" data-print-area>
      <header className="rounded-2xl bg-gradient-to-br from-navy to-navy-soft p-5 text-cream shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-widest text-gold/80">Fase 02 · Entrega aprofundada</div>
            <h1 className="font-serif text-2xl italic leading-tight">Relatório Completo de Pesquisa Genealógica</h1>
            <div className="text-[12px] text-cream/75">
              {registro.clientName} · {registro.country} · {registro.id}
            </div>
          </div>
          <span className={cn("shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold", FASE02_STATUS_TOM[registro.phase2Status])}>
            {registro.phase2Status}
          </span>
        </div>
        <p className="mt-4 rounded-xl bg-navy-soft/60 p-3 text-[12px] italic text-cream/80">{FASE02_MICROCOPY}</p>
      </header>

      {!entregue && (
        <section className="rounded-2xl border border-gold/50 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15 text-navy">
              <Lock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-widest text-terracotta">Prévia da entrega</div>
              <div className="text-sm text-navy">
                O Relatório Completo está <strong>{registro.phase2Status.toLowerCase()}</strong>. Abaixo, o índice do que será aprofundado.
              </div>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-navy/70">
            Nesta prévia não há afirmação de fatos ainda não pesquisados: cada seção descreve o que será investigado e como o
            resultado será classificado.
          </p>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        {/* índice lateral — desktop */}
        <nav data-print-hide className="hidden lg:block">
          <div className="sticky top-4 rounded-2xl border border-border bg-white p-3 shadow-sm">
            <div className="px-2 pb-2 text-[11px] uppercase tracking-widest text-terracotta">Índice</div>
            <ol className="space-y-0.5">
              {secoes.map((s, i) => (
                <li key={s.id}>
                  <button
                    onClick={() => setAtiva(s.id)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] transition",
                      s.id === ativa ? "bg-navy font-semibold text-cream" : "text-navy/75 hover:bg-areia",
                    )}
                  >
                    <span className={cn("mt-0.5 text-[10px]", s.id === ativa ? "text-gold" : "text-navy/40")}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-snug">{s.titulo}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* conteúdo — desktop */}
        <section className="hidden rounded-2xl border border-border bg-white p-6 shadow-sm lg:block">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">{secaoAtiva.resumo}</div>
          <h2 className="mt-1 font-serif text-2xl text-navy">{secaoAtiva.titulo}</h2>
          <Corpo secao={secaoAtiva} />
        </section>

        {/* accordion — mobile */}
        <div className="space-y-2 lg:hidden">
          {secoes.map((s, i) => {
            const open = aberta === s.id;
            return (
              <div key={s.id} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <button
                  onClick={() => setAberta(open ? null : s.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-widest text-navy/40">
                      Seção {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="block font-serif text-lg leading-snug text-navy">{s.titulo}</span>
                  </span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-navy/50 transition", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="border-t border-border px-4 pb-4">
                    <div className="pt-2 text-[11px] uppercase tracking-widest text-terracotta">{s.resumo}</div>
                    <Corpo secao={s} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-areia/60 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
          <p className="text-[12px] text-navy/75">
            Classificações usadas neste relatório: Confirmado, Em análise, Hipótese de pesquisa, Pendente de documento e Não
            aplicável. Nenhuma informação é apresentada como certeza jurídica sem documento que a sustente.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" data-print-hide>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-navy/25 px-4 py-2 text-[12px] font-semibold text-navy transition hover:bg-navy hover:text-cream"
          >
            <Printer className="h-3.5 w-3.5" /> Versão para impressão
          </button>
          <span className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-[12px] text-navy/50">
            <FileText className="h-3.5 w-3.5" /> Exportação em PDF em breve
          </span>
        </div>
      </section>
    </div>
  );
}

function Corpo({ secao }: { secao: ReturnType<typeof secoesFase02>[number] }) {
  return (
    <div className="mt-3 space-y-3">
      {secao.paragrafos.map((p) => (
        <p key={p} className="text-[13px] leading-relaxed text-navy/80">
          {p}
        </p>
      ))}
      {secao.itens && secao.itens.length > 0 && (
        <ul className="space-y-2">
          {secao.itens.map((it) => (
            <li key={it} className="flex items-start gap-2 rounded-lg border border-border bg-cream/60 p-3 text-[12px] text-navy/80">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span className="leading-snug">{it}</span>
            </li>
          ))}
        </ul>
      )}
      {secao.paragrafos.length === 0 && (!secao.itens || secao.itens.length === 0) && (
        <p className="text-[12px] italic text-navy/55">Conteúdo será preenchido durante a produção desta fase.</p>
      )}
    </div>
  );
}

export function ConfiancaTag({ nivel }: { nivel: keyof typeof CONFIANCA_TOM }) {
  return (
    <span className={cn("inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold", CONFIANCA_TOM[nivel])}>
      {nivel}
    </span>
  );
}
