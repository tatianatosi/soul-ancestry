import { createFileRoute } from "@tanstack/react-router";

import { SaasShell, EstadoVazio } from "@/components/saas/shell";
import { FonteAlimento } from "@/components/desk/fonte-alimento";
import { PainelQualidade } from "@/components/qualidade/painel";
import {
  KpisQualidadeV4,
  PanoramaQualidadeV4,
  RecomendacoesQualidadeV4,
} from "@/components/qualidade/kpis-recomendacoes";
import { RadarInternoIntegrado } from "@/components/desk/radar-interno-integrado";
import { CaCard } from "@/components/ui/ca-card";
import { Selo } from "@/components/comercial/base";
import { EIXOS_RADAR_CANONICOS, garantirEixosCanonicos } from "@/lib/radar-eixos";
import "@/components/desk/mockup4-superficies.css";

export const Route = createFileRoute("/_authenticated/qualidade")({
  head: () => ({
    meta: [
      { title: "Radar & Matrizes — Clube Ancestral" },
      {
        name: "description",
        content:
          "Matriz de prioridade e Radar Individual sincronizados por caso; checklists e exportação em painel colapsado.",
      },
      { property: "og:title", content: "Radar & Matrizes — Clube Ancestral" },
      {
        property: "og:description",
        content: "Radar & Matrizes do Desk — leitura interna por organização.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QualidadePage,
});

// D6 (23/09/2026, autorização explícita da Proprietária): renomeado
// "Radar Interno" → "Radar & Matrizes" (§16 do De-Para) nas 4 fontes
// canônicas — navegação (navegacao-desk.ts), rótulos humanos e
// descoberta/rota (descoberta-desk.ts) e aqui, o título/taxonomia da
// própria rota. Eixos, cálculos e a separação Radar Desk (4 eixos) ×
// Radar App (6 dimensões) não mudam — só o nome.
function QualidadePage() {
  return (
    <SaasShell
      titulo="Radar & Matrizes"
      descricao="Matriz de elegibilidade × urgência e Radar Individual sincronizados; leitura interna por caso."
    >
      {/*
        19/10/2026 — reconciliação com o Lovable: FonteAlimento + moldura
        mockup4 do Lovable envolvendo o Radar Interno Integrado da branch;
        card explicativo "Como ler esta tela" da branch preservado. Nada
        duplicado, nada perdido.
      */}
      <FonteAlimento
        fonte="Urgência e hipótese de elegibilidade registradas em cada caso"
        consumidor="A prioridade dos casos no Painel Hoje — leitura interna, nunca exposta ao cliente"
        detalheTecnico="radar-interno-caso"
      />
      <div className="mb-6 min-w-0 rounded-2xl border border-navy/10 bg-card p-6 shadow-sm" data-desk-mockup4="radar">
        <RadarInternoIntegrado />
      </div>
      <CaCard
        titulo="Como ler esta tela"
        eyebrow="Radar & Matrizes · carteira e caso"
        className="mb-6"
      >
        <p className="text-sm text-navy/70">
          Alterne entre a carteira completa e a leitura de um caso. A matriz usa urgência e hipótese de
          elegibilidade; o Radar Individual reúne os quatro eixos, responsável, prazo, próxima ação e
          bloqueios do mesmo registro. Dados ausentes permanecem declarados, nunca inferidos.
        </p>
      </CaCard>
      <div className="mb-6">
        <KpisQualidadeV4 />
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <RecomendacoesQualidadeV4 />
        <PanoramaQualidadeV4 />
      </div>
      <details className="mb-6 rounded-xl border border-navy/10 bg-card p-4">
        <summary className="cursor-pointer font-serif text-base text-navy">
          Qualidade, checklists e exportação
        </summary>
        <div className="mt-4">
          <EixosCanonicosInternos />
          <PainelQualidade />
        </div>
      </details>
    </SaasShell>
  );
}

/**
 * Radar & Matrizes (Desk) usa os quatro eixos da jornada (radar-eixos.ts).
 * Distinto das seis dimensões do App Cliente (radar-seis-eixos.ts). Sem eixo extra aqui.
 *
 * DSA-1-BASE-TOKENS-CARDS (19/09/2026): primeiro consumidor do Desk a usar
 * `CaCard` (até então só no App Cliente, `routes/portal/index.tsx`) — mesmos
 * tokens (`bg-card`/`border-border`), sem hex novo. `garantirEixosCanonicos`
 * já filtra pela lista fixa de 4 IDs; o ramo de Estado Vazio é defensivo
 * (hoje inatingível com a lista atual), não um estado fabricado.
 */
function EixosCanonicosInternos() {
  const eixos = garantirEixosCanonicos(EIXOS_RADAR_CANONICOS);

  if (eixos.length === 0) {
    return (
      <EstadoVazio mensagem="Nenhum eixo canônico configurado em radar-eixos.ts — verifique a fonte antes de prosseguir." />
    );
  }

  return (
    <CaCard titulo="Eixos canônicos da leitura" eyebrow="Radar & Matrizes · 4 eixos" className="mb-4">
      <p className="text-xs text-navy/60">
        Radar & Matrizes do Desk — quatro eixos da jornada (radar-eixos.ts), compartilhados com a leitura de progresso do cliente. Distinto das 6 dimensões do App (radar-seis-eixos.ts). Nenhum eixo extra aqui.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {eixos.map((eixo) => (
          <article key={eixo.id} className="rounded-md border border-border bg-cream/60 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium text-navy">{eixo.titulo}</h3>
              <Selo
                texto="Compartilhado com o Radar do Cliente"
                tom="neutro"
                title="Fonte: src/lib/radar-eixos.ts — mesma leitura usada no Radar do App Cliente."
              />
            </div>
            <p className="mt-1 text-xs text-navy/60">{eixo.resumo}</p>
          </article>
        ))}
      </div>
    </CaCard>
  );
}
