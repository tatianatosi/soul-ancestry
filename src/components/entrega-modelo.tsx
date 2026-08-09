/**
 * Ancestral Canvas — Fase 01 do modelo de entrega consultiva.
 *
 * Renderiza os blocos da leitura inicial (capa, achado principal, linha familiar,
 * raízes, elegibilidade, pontos fortes, pendências, documentos e próximo passo).
 * Todo o conteúdo vem de `src/data/caso-sophia.ts` — nada fixo aqui.
 *
 * Visão do cliente: sem preço, SKU, link de pagamento, notas internas,
 * contrato ou dados de outros casos.
 */

import { cn } from "@/lib/utils";
import {
  STATUS_DOC_TOM,
  type GrupoChecklist,
  type ModeloEntrega,
} from "@/data/caso-sophia";
import { ArrowRight, Download, FileText, Info, MapPin, MessageCircle, Sparkles, TreeDeciduous } from "lucide-react";

export function EntregaModeloTab({ modelo }: { modelo: ModeloEntrega }) {
  return (
    <div className="space-y-4 p-5 lg:mx-auto lg:max-w-5xl" data-print-area>
      {/* A. Capa */}
      <section className="rounded-2xl bg-gradient-to-br from-navy to-navy-soft p-6 text-cream shadow-lg">
        <div className="text-[11px] uppercase tracking-widest text-gold/80">
          Clube Ancestral · Fase 01 — {modelo.reportValidationStatus}
        </div>
        <h2 className="mt-2 font-serif text-2xl leading-snug">{modelo.capa.titulo}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-cream/80">{modelo.capa.subtitulo}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          <Chip>{modelo.clientName}</Chip>
          <Chip>{modelo.country}</Chip>
          <Chip tone="gold">{modelo.eligibilityBadge}</Chip>
        </div>
      </section>

      {/* B. Achado principal */}
      <Card icon={<Sparkles className="h-4 w-4" />} titulo="Achado principal">
        <p className="border-l-2 border-gold pl-3 text-[13px] leading-relaxed text-navy/85">{modelo.achadoPrincipal}</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* C. Linha familiar */}
        <Card icon={<TreeDeciduous className="h-4 w-4" />} titulo="Linha familiar">
          <div className="mb-3 inline-flex rounded-full bg-gold/20 px-3 py-1 text-[11px] font-semibold text-navy">
            {modelo.linhaSelo}
          </div>
          {modelo.linhaFamiliar.length === 0 ? (
            <Vazio />
          ) : (
            <ol className="space-y-2">
              {modelo.linhaFamiliar.map((n, i) => (
                <li key={n.nome + i} className="rounded-xl border border-border bg-cream/60 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-navy">{n.nome}</div>
                      <div className="text-[11px] uppercase tracking-wide text-navy/55">{n.papel}</div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        n.confirmado ? "border-sage/40 bg-sage/10 text-sage" : "border-gold/50 bg-gold/10 text-navy",
                      )}
                    >
                      {n.confirmado ? "Documento validado" : "Informação conhecida"}
                    </span>
                  </div>
                  <div className="mt-1 text-[12px] text-navy/75">{n.detalhe}</div>
                </li>
              ))}
            </ol>
          )}
        </Card>

        {/* D. Raiz italiana identificada */}
        <Card icon={<MapPin className="h-4 w-4" />} titulo={`Raiz ${modelo.country === "Itália" ? "italiana" : "europeia"} identificada`}>
          {modelo.raizes.length === 0 ? (
            <Vazio />
          ) : (
            <div className="space-y-2">
              {modelo.raizes.map((r) => (
                <div key={r.nome} className="rounded-xl border border-border bg-white p-3">
                  <div className="font-serif text-lg text-navy">{r.nome}</div>
                  <div className="text-[12px] text-navy/75">
                    {r.local} — {r.nascimento}
                  </div>
                  <div className="mt-1 text-[11px] italic text-navy/55">{modelo.raizDisclaimer}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* E. Elegibilidade sintética */}
      <Card icon={<Info className="h-4 w-4" />} titulo="Elegibilidade — leitura inicial">
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3 py-1 text-[11px] font-semibold text-navy">
          {modelo.eligibilityBadge}
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-navy/85">{modelo.eligibilitySummary}</p>
        <p className="mt-3 rounded-lg bg-cream p-3 text-[11px] leading-relaxed text-navy/70">
          {modelo.transmissionSummary}
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* F. Pontos fortes */}
        <Card icon={<Sparkles className="h-4 w-4" />} titulo="Pontos fortes">
          {modelo.pontosFortes.length === 0 ? (
            <Vazio />
          ) : (
            <ul className="space-y-1.5">
              {modelo.pontosFortes.map((p) => (
                <li key={p} className="flex gap-2 text-[13px] leading-snug text-navy/85">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" /> {p}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* G. O que precisa ser confirmado */}
        <Card icon={<Info className="h-4 w-4" />} titulo="O que precisa ser confirmado">
          {modelo.criticalGaps.length === 0 ? (
            <Vazio />
          ) : (
            <ul className="space-y-1.5">
              {modelo.criticalGaps.map((g) => (
                <li key={g} className="flex gap-2 text-[13px] leading-snug text-navy/80">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" /> {g}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Documentos por grupo */}
      <Card icon={<FileText className="h-4 w-4" />} titulo="Documentos e fontes">
        {modelo.documentsChecklist.length === 0 ? (
          <Vazio />
        ) : (
          <div className="space-y-4">
            {modelo.documentsChecklist.map((g) => (
              <GrupoDocs key={g.grupo} grupo={g} />
            ))}
          </div>
        )}
      </Card>

      {/* H. Próximo passo */}
      <section className="rounded-2xl border-2 border-gold bg-white p-5 shadow-lg">
        <div className="text-[11px] uppercase tracking-widest text-navy/60">Próximo passo recomendado</div>
        <h3 className="mt-1 font-serif text-xl text-navy">{modelo.recommendedNextStep.titulo}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-navy/80">{modelo.recommendedNextStep.texto}</p>
        <div data-print-hide className="mt-4 flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold/90">
            {modelo.recommendedNextStep.ctaPrimaria} <ArrowRight className="h-4 w-4" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-navy/25 px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy/5">
            <MessageCircle className="h-4 w-4" /> {modelo.recommendedNextStep.ctaSecundaria}
          </button>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-navy/60">
          {modelo.recommendedSku || modelo.paymentUrl
            ? "Condição comercial definida pela equipe."
            : "Produto, valor e condições serão apresentados pela equipe do Clube Ancestral junto com a proposta."}
        </p>
      </section>

      {/* Fase 02 */}
      <section className="rounded-2xl border border-border bg-white p-5">
        <div className="text-[11px] uppercase tracking-widest text-navy/60">Fase 02</div>
        <h3 className="mt-1 font-serif text-lg text-navy">Relatório Completo de Pesquisa Genealógica</h3>
        <p className="mt-1 text-[12px] leading-relaxed text-navy/70">
          Disponível após contratação da pesquisa documental aprofundada. Será construído a partir das fontes localizadas e
          analisadas durante a pesquisa.
        </p>
      </section>

      <section data-print-hide className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-5">
        <div>
          <h3 className="font-serif text-lg text-navy">Exportar diagnóstico em PDF</h3>
          <p className="text-[12px] text-navy/70">Versão institucional para compartilhar · {modelo.reportSource.versao}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-navy-soft"
        >
          <Download className="h-4 w-4" /> Exportar em PDF
        </button>
      </section>

      <footer className="pt-2 text-center text-[10px] uppercase tracking-widest text-navy/45">
        Clube Ancestral · {modelo.caseId} · {modelo.reportSource.versao} · {modelo.reportValidationStatus}
      </footer>
    </div>
  );
}

function GrupoDocs({ grupo }: { grupo: GrupoChecklist }) {
  return (
    <div>
      <div className="mb-2 text-[11px] uppercase tracking-widest text-terracotta">{grupo.grupo}</div>
      <div className="space-y-2">
        {grupo.itens.map((i) => (
          <div key={i.item} className="rounded-xl border border-border bg-cream/50 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 text-[13px] text-navy">{i.item}</div>
              <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", STATUS_DOC_TOM[i.status])}>
                {i.status}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-navy/60">
              {i.responsavel} · fonte: {i.fonte} · atualizado em {i.atualizadoEm}
            </div>
            <div className="mt-1 text-[11px] text-navy/70">{i.observacao}</div>
            <div className="mt-1 text-[11px] font-medium text-navy">Próxima ação: {i.proximaAcao}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Vazio() {
  return <p className="text-[12px] italic text-navy/55">Aguardando consolidação da pesquisa.</p>;
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: "gold" }) {
  return (
    <span className={cn("rounded-full px-3 py-1 font-semibold", tone === "gold" ? "bg-gold text-navy" : "bg-cream/15 text-cream")}>
      {children}
    </span>
  );
}

function Card({ icon, titulo, children }: { icon: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-navy">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-navy/5">{icon}</span>
        <h3 className="font-serif text-lg">{titulo}</h3>
      </div>
      {children}
    </section>
  );
}
