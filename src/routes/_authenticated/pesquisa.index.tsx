import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import { FonteAlimento } from "@/components/desk/fonte-alimento";
import { EstadoDados } from "@/components/saas/estado-dados";
import { CarregandoDesk, PageHeader } from "@/components/desk/ui-desk";
import { CaCard } from "@/components/ui/ca-card";
// Corte 2 do Design System — superfície piloto: Cartão, Selo, KPI e Estado vazio.
import {
  FaixaIndicadoresCA,
  IndicadorCA,
  SeloCA,
  VazioCA,
  classesCartaoCA,
} from "@/components/clube-ancestral-kit/primitivos";
import { listarCasosPesquisa } from "@/lib/pesquisa.functions";
import { filtrarPorBusca } from "@/lib/rotulo-negocio";
import { PendenciasCriticasPesquisa } from "@/components/painel/pendencias-criticas-pesquisa";


export const Route = createFileRoute("/_authenticated/pesquisa/")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Pesquisa genealógica — Clube Ancestral" },
      { name: "description", content: "Dossiês de pesquisa, evidências e pendências por caso." },
      { property: "og:title", content: "Pesquisa genealógica — Clube Ancestral" },
      { property: "og:description", content: "Dossiês de pesquisa, evidências e pendências por caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PesquisaIndex,
});

function PesquisaIndex() {
  const carregar = useServerFn(listarCasosPesquisa);
  const q = useQuery({ queryKey: ["pesquisa", "casos"], queryFn: () => carregar() });
  const [busca, setBusca] = useState("");
  // `undefined` significa leitura não concluída ou falha; lista vazia real vem como [].
  const casos = q.data ?? [];
  const casosCarregados = q.data;
  const casosVisiveis = useMemo(
    () => filtrarPorBusca(casos, busca, ["codigo", "titulo", "status", "pais"]),
    [casos, busca],
  );

  const semVia = q.data ? casos.filter((c) => !c["via"]).length : null;
  const semPais = q.data ? casos.filter((c) => !c["pais"]).length : null;

  return (
    <SaasShell
      titulo="Pesquisa genealógica"
      descricao="Fontes, evidências e próximos passos do caso — uso interno."
      visualKit="pantone"
    >
      <FonteAlimento
        fonte="Fontes, evidências e hipóteses registradas do caso"
        consumidor="Dossiê, relatórios e, após publicação autorizada, a aba Legado do App Cliente"
        detalheTecnico="fontes-pesquisa-canonicas"
      />
      <PageHeader
        titulo="Dossiê e repositório do Legado"
        subtitulo="Núcleo de pesquisa: o repositório do caso. O que for aprovado e publicado daqui é o que o App Cliente mostra na aba Legado."
      />
      <p className="mb-4 rounded-lg border border-navy/10 bg-cream/60 px-4 py-3 text-sm text-navy/70">
        Trabalho operacional (fontes, evidências, próxima ação) fica em{" "}
        <Link to="/pesquisa-modulo" className="font-medium text-navy underline decoration-gold underline-offset-4">
          Pesquisa Genealógica e Evidências
        </Link>
        . Para o material aparecer no Legado do App Cliente, publique a projeção sanitizada tipo{" "}
        <span className="font-medium">legado</span> na Biblioteca de evidências do caso.
      </p>

      <FaixaIndicadoresCA>
        {/*
          Casos em pesquisa / Casos ativos: contagens canônicas em
          /pesquisa-modulo e /casos. Aqui só etiqueta (CA-UX-03 dedup global).
        */}
        <Link
          to="/pesquisa-modulo"
          className="block rounded-xl border border-navy/10 bg-cream/40 px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          data-indicador-etiqueta="casos-em-pesquisa"
        >
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Casos em pesquisa</p>
          <p className="mt-1 text-sm font-medium text-navy">Ver contagem em Pesquisa e Evidências</p>
          <p className="mt-0.5 text-xs text-navy/55">Fonte canônica — sem segundo número neste dossiê</p>
        </Link>
        <Link
          to="/casos"
          className="block rounded-xl border border-navy/10 bg-cream/40 px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          data-indicador-etiqueta="casos-ativos"
        >
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Casos ativos</p>
          <p className="mt-1 text-sm font-medium text-navy">Ver contagem em Casos 360</p>
          <p className="mt-0.5 text-xs text-navy/55">Ativação canônica — não reconta status de pesquisa</p>
        </Link>
        <IndicadorCA
          rotulo="Sem via jurídica definida"
          valor={semVia}
          fonte="Casos em pesquisa — leitura atual"
          estado={semVia ? "aguardando" : "ausente"}
        />
        <IndicadorCA
          rotulo="Sem país definido"
          valor={semPais}
          fonte="Casos em pesquisa — leitura atual"
          estado={semPais ? "aguardando" : "ausente"}
        />
      </FaixaIndicadoresCA>

      {q.isLoading ? <CarregandoDesk linhas={4} rotulo="Carregando casos de pesquisa" /> : null}

      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={casosCarregados}
        aoTentarNovamente={() => void q.refetch()}
        recurso="os casos em pesquisa"
      >
        {() => (
        <CaCard titulo="Casos em pesquisa" eyebrow="Pesquisa · dossiês por caso" className="mt-4">
        <section aria-label="Casos em pesquisa" className="space-y-2">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por código, título, status ou país"
            className="w-full rounded-lg border border-navy/20 bg-cream/40 px-3 py-2 text-sm"
          />
          {casosVisiveis.map((c) => {
            const classe = classesCartaoCA({ interativo: true, className: "block" });
            const corpo = (
              <>
              <div className="flex flex-wrap items-center gap-2">
                <strong className="font-sans text-sm text-navy">{c["codigo"] as string}</strong>
                <span className="font-serif text-lg leading-tight text-navy">{c["titulo"] as string}</span>
                <SeloCA
                  texto={String(c["status"] ?? "—")}
                  estado={c["status"] === "ativo" ? "concluido" : "ausente"}
                />
              </div>
              <p className="mt-1 text-xs text-navy/55">
                {String(c["pais"] ?? "país não informado")} · via {String(c["via"] ?? "não definida")}
              </p>
              </>
            );
            return c["research_case_id"] ? (
              <Link
                key={c["id"] as string}
                to="/pesquisa-modulo/$id"
                params={{ id: String(c["research_case_id"]) }}
                className={classe}
              >
                {corpo}
              </Link>
            ) : (
              <Link
                key={c["id"] as string}
                to="/pesquisa/$id"
                params={{ id: c["id"] as string }}
                className={classe}
              >
                {corpo}
              </Link>
            );
          })}
          {casosVisiveis.length === 0 ? (
            <VazioCA
              titulo="Nenhum caso em pesquisa"
              descricao="Quando um caso for habilitado para pesquisa, ele aparece aqui com fontes, evidências e próximos passos."
            />
          ) : null}
        </section>
        </CaCard>
        )}
      </EstadoDados>

      <div className="mt-6">
        <PendenciasCriticasPesquisa />
      </div>
    </SaasShell>
  );
}

