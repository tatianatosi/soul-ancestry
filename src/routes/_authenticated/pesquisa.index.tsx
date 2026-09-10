import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import { EstadoDados } from "@/components/saas/estado-dados";
import {
  BadgeDesk,
  CardIndicador,
  CarregandoDesk,
  PageHeader,
  VazioDesk,
} from "@/components/desk/ui-desk";
import { listarCasosPesquisa } from "@/lib/pesquisa.functions";
import { filtrarPorBusca } from "@/lib/rotulo-negocio";
import { PendenciasCriticasPesquisa } from "@/components/painel/pendencias-criticas-pesquisa";


export const Route = createFileRoute("/_authenticated/pesquisa/")({
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

  const casosAtivos = q.data ? casos.filter((c) => c["status"] === "ativo").length : null;
  const semVia = q.data ? casos.filter((c) => !c["via"]).length : null;
  const semPais = q.data ? casos.filter((c) => !c["pais"]).length : null;

  return (
    <SaasShell
      titulo="Pesquisa genealógica"
      descricao="Fontes, evidências e próximos passos do caso — uso interno."
    >
      <PageHeader
        titulo="Dossiê legado de pesquisa"
        subtitulo="Leitura do sistema anterior. A pesquisa operacional — fontes, evidências e próxima ação — está no módulo vivo."
      />
      <p className="mb-4 rounded-lg border border-navy/10 bg-cream/60 px-4 py-3 text-sm text-navy/70">
        Esta tela permanece disponível para consulta do dossiê antigo. Para trabalhar o caso, abra{" "}
        <Link to="/pesquisa-modulo" className="font-medium text-navy underline decoration-gold underline-offset-4">
          Pesquisa Genealógica e Evidências
        </Link>
        .
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CardIndicador rotulo="Casos em pesquisa" valor={q.data ? casos.length : null} tom="neutro" />
        <CardIndicador rotulo="Casos ativos" valor={casosAtivos} tom="sucesso" />
        <CardIndicador rotulo="Sem via jurídica definida" valor={semVia} tom={semVia ? "atencao" : "neutro"} />
        <CardIndicador rotulo="Sem país definido" valor={semPais} tom={semPais ? "atencao" : "neutro"} />
      </div>

      {q.isLoading ? <CarregandoDesk linhas={4} rotulo="Carregando casos de pesquisa" /> : null}

      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={casosCarregados}
        aoTentarNovamente={() => void q.refetch()}
        recurso="os casos em pesquisa"
      >
        {() => (
        <section aria-label="Casos em pesquisa" className="space-y-2">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por código, título, status ou país"
            className="w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm"
          />
          {casosVisiveis.map((c) => {
            const classe =
              "block rounded-xl border border-navy/10 bg-white p-4 transition-colors hover:border-navy/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2";
            const corpo = (
              <>
              <div className="flex flex-wrap items-center gap-2">
                <strong className="font-sans text-sm text-navy">{c["codigo"] as string}</strong>
                <span className="font-serif text-lg leading-tight text-navy">{c["titulo"] as string}</span>
                <BadgeDesk
                  texto={String(c["status"] ?? "—")}
                  tom={c["status"] === "ativo" ? "sucesso" : "neutro"}
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
            <VazioDesk
              titulo="Nenhum caso em pesquisa"
              descricao="Quando um caso for habilitado para pesquisa, ele aparece aqui com fontes, evidências e próximos passos."
            />
          ) : null}
        </section>
        )}
      </EstadoDados>

      <div className="mt-6">
        <PendenciasCriticasPesquisa />
      </div>
    </SaasShell>
  );
}

