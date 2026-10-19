/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { EstadoVazio, SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { Selo } from "@/components/comercial/base";
import { rotulo } from "@/components/pesquisa/modulo-campos";
import {
  criarPesquisaParaCaso,
  miniaturaFamiliarDoCaso,
  painelPesquisaModulo,
  rodarScanPesquisa,
} from "@/lib/pesquisa-modulo.functions";
import { filtrarPorBusca } from "@/lib/rotulo-negocio";
import { CardIndicador } from "@/components/desk/ui-desk";
import { CaCard } from "@/components/ui/ca-card";
import { semFixtures } from "@/lib/fixtures";
import {
  AnelPercentual,
  BarrasHorizontais,
  Cartao,
  Etiqueta,
  GraficoColunas,
  Linha,
  Pessoa,
  ReguaEtapas,
  type Tom,
} from "@/components/prancha-v4/kit";
import { papelDoRegistro } from "@/lib/caso-ficha";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Tipos reais de `source_type` mostrados em zero quando ainda não há fonte (formato da prancha). */
const TIPOS_FONTE_VAZIOS = ["Registro civil", "Paroquial", "Arquivo público", "Documento familiar"];

/** Tom da etiqueta por `research_sources.source_status` real. */
function tomStatusFonte(status: string): Tom {
  if (status === "verified" || status === "reviewed") return "sucesso";
  if (status === "located") return "atencao";
  if (status === "inaccessible" || status === "rejected") return "critico";
  return "neutro";
}

/** Tom da etiqueta por `research_case_hypotheses.status` real. */
function tomStatusHipotese(status: string): Tom {
  if (status === "supported") return "sucesso";
  if (status === "not_supported") return "critico";
  if (status === "open" || status === "under_review") return "atencao";
  return "neutro";
}

export const Route = createFileRoute("/_authenticated/pesquisa-modulo/")({
  head: () => ({
    meta: [
      { title: "Módulo de pesquisa e evidências — Clube Ancestral" },
      {
        name: "description",
        content: "Pesquisas genealógicas por caso: pessoas, evidências, pendências e travas de pesquisa externa.",
      },
      { property: "og:title", content: "Módulo de pesquisa e evidências — Clube Ancestral" },
      {
        property: "og:description",
        content: "Pesquisas genealógicas por caso: pessoas, evidências, pendências e travas de pesquisa externa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Index,
});

function Index() {
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  const podeEscrever = !autoridade.bloqueado({ capacidade: "avancar_pesquisa_evidencia_microentrega" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const carregar = useServerFn(painelPesquisaModulo);
  const criar = useServerFn(criarPesquisaParaCaso);
  const scan = useServerFn(rodarScanPesquisa);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [casoId, setCasoId] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [busca, setBusca] = useState("");
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [filtroStatusFonte, setFiltroStatusFonte] = useState("");
  const [casoMiniatura, setCasoMiniatura] = useState("");

  const q = useQuery({ queryKey: ["pesquisa-modulo", "painel"], queryFn: () => carregar() });

  const carregarMiniatura = useServerFn(miniaturaFamiliarDoCaso);
  const miniaturaQuery = useQuery({
    queryKey: ["pesquisa-modulo", "miniatura-familiar", casoMiniatura],
    queryFn: () => carregarMiniatura({ data: { caseId: casoMiniatura } }),
    enabled: Boolean(casoMiniatura),
    retry: false,
  });

  const mCriar = useMutation({
    mutationFn: () => criar({ data: { casoId, objetivo } }),
    onSuccess: (r) => {
      toast.success(r.jaExistia ? "Este caso já possuía pesquisa." : "Pesquisa criada.");
      navigate({ to: "/pesquisa-modulo/$id", params: { id: r.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mScan = useMutation({
    mutationFn: () => scan(),
    onSuccess: (r) => {
      toast.success(`Verificação concluída: ${r.criadas} novas, ${r.sanadas} sanadas, ${r.abertas} abertas.`);
      qc.invalidateQueries({ queryKey: ["pesquisa-modulo", "painel"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const d = q.data;
  const casosParaMiniatura = d
    ? Array.from(
        new Map(
          [...d.pesquisas.map((p: any) => p.caso).filter(Boolean), ...d.casosSemPesquisa].map((c: any) => [
            c["id"],
            c,
          ]),
        ).values(),
      )
    : [];
  useEffect(() => {
    if (!casoMiniatura && casosParaMiniatura[0]?.["id"]) {
      const real = casosParaMiniatura.find((c: any) => papelDoRegistro(c).valor !== "demo");
      setCasoMiniatura(String((real ?? casosParaMiniatura[0])["id"]));
    }
  }, [casoMiniatura, casosParaMiniatura]);
  const opcoesStatusFonte = d
    ? Array.from(new Map(d.dossie.fontesRecentes.map((f) => [f.status, f.rotuloStatus])).entries()).map(
        ([status, rotulo]) => ({ status, rotulo }),
      )
    : [];
  const fontesExibidas = d
    ? d.dossie.fontesRecentes.filter((f) => !filtroStatusFonte || f.status === filtroStatusFonte)
    : [];
  const pesquisasFiltradas = d
    ? filtrarPorBusca(
        d.pesquisas.map((p: any) => ({
          ...p,
          codigo: p.caso?.codigo,
          titulo: p.caso?.titulo,
          pais: p.caso?.pais,
        })),
        busca,
        ["codigo", "titulo", "status", "pais"],
      )
    : [];

  return (
    <SaasShell
      titulo="Pesquisa"
      descricao="Dossiê de pesquisa: fontes, hipóteses, vínculos e produção de evidências, com dado real do Desk."
    >
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      {q.isLoading && <p className="text-sm text-navy/60">Carregando painel…</p>}
      {q.error ? (
        <p className="flex flex-wrap items-center gap-3 text-sm text-terracotta">
          {(q.error as Error).message}
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      ) : null}

      {d && (
        <div className="space-y-4">
          <CaCard
            titulo="Dossiê de pesquisa"
            acao={
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarFiltro((v) => !v)}
                  className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5"
                  aria-pressed={mostrarFiltro}
                  data-dossie-botao-filtros
                >
                  Filtros
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById("abrir-pesquisa-caso")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-cream hover:bg-navy/90"
                  data-dossie-botao-nova-consulta
                >
                  Nova consulta
                </button>
              </div>
            }
          >
            <p className="text-xs text-navy/60" data-dossie-subtitulo>
              Fontes, transcrições, interpretações, hipóteses e conclusões permanecem separadas
            </p>
            {mostrarFiltro ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-navy/15 bg-cream/40 p-2" data-dossie-filtro>
                <span className="text-[11px] font-medium uppercase tracking-wide text-navy/55">Status da fonte</span>
                <button
                  type="button"
                  onClick={() => setFiltroStatusFonte("")}
                  className={`rounded-full border px-2.5 py-1 text-[11px] ${
                    filtroStatusFonte === "" ? "border-navy bg-navy text-cream" : "border-navy/20 text-navy/70 hover:bg-navy/5"
                  }`}
                >
                  Todos
                </button>
                {opcoesStatusFonte.map((o) => (
                  <button
                    key={o.status}
                    type="button"
                    onClick={() => setFiltroStatusFonte(o.status)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] ${
                      filtroStatusFonte === o.status ? "border-navy bg-navy text-cream" : "border-navy/20 text-navy/70 hover:bg-navy/5"
                    }`}
                  >
                    {o.rotulo}
                  </button>
                ))}
              </div>
            ) : null}
          </CaCard>

          {/* Prancha V4 — linha 1: três cartões (fontes · hipóteses · miniatura). */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-dossie-linha-cartoes>
            <Cartao titulo="Fontes e referências" data-dossie-fontes>
              {fontesExibidas.length === 0 ? (
                <div className="space-y-1">
                  <Linha rotulo={filtroStatusFonte ? "Nenhuma fonte com este status." : "Nenhuma fonte registrada ainda."} valor="—" />
                </div>
              ) : (
                <div>
                  {fontesExibidas.map((f) => (
                    <Linha key={f.id} rotulo={f.instituicao ? `${f.titulo} — ${f.instituicao}` : f.titulo} valor={f.rotuloStatus} tom={tomStatusFonte(f.status)} />
                  ))}
                </div>
              )}
              <div className="mt-3 rounded-lg border border-navy/10 bg-cream/50 px-3 py-2" data-dossie-referencia-auxiliar>
                <p className="text-[10px] font-medium uppercase tracking-widest text-navy/55">Referência auxiliar</p>
                <Link to="/fontes-genealogicas" className="mt-0.5 block text-xs text-navy underline decoration-gold">
                  Catálogo de acervos genealógicos ·{" "}
                  {d.dossie.acervosMapeados === 0
                    ? "nenhum acervo mapeado ainda"
                    : `${d.dossie.acervosMapeados} ${d.dossie.acervosMapeados === 1 ? "acervo mapeado" : "acervos mapeados"}`}
                </Link>
              </div>
            </Cartao>

            <Cartao titulo="Hipóteses e confiança" data-dossie-hipoteses>
              <div className="flex items-center gap-3 border-b border-navy/10 pb-3">
                <AnelPercentual valor={d.dossie.confiancaCadeiaPct} tituloAcessivel="Confiança da cadeia" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy">Confiança da cadeia</p>
                  <p className="text-[11px] text-navy/55">
                    {d.dossie.confiancaCadeiaPct === null
                      ? "Sem hipótese ativa com nível de confiança registrado — nada a calcular."
                      : `Média do nível de confiança de ${d.dossie.baseConfiancaCadeia} ${
                          d.dossie.baseConfiancaCadeia === 1 ? "hipótese ativa" : "hipóteses ativas"
                        } (baixa 33 · média 66 · alta 100).`}
                  </p>
                </div>
              </div>
              <div className="mt-1">
                {d.dossie.hipotesesRecentes.length === 0 ? (
                  <Linha rotulo="Nenhuma hipótese registrada ainda." valor="—" />
                ) : (
                  d.dossie.hipotesesRecentes.map((h) => (
                    <div key={h.id} className="flex items-center justify-between gap-2 border-b border-navy/5 py-1.5 last:border-0">
                      <span className="min-w-0 truncate text-xs text-navy/80">{h.titulo}</span>
                      <span className="flex shrink-0 gap-1">
                        <Etiqueta texto={h.rotuloConfianca} />
                        <Etiqueta texto={h.rotuloStatus} tom={tomStatusHipotese(h.status)} />
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Cartao>

            <Cartao titulo="Miniatura familiar" className="md:col-span-2 xl:col-span-1" data-dossie-miniatura-familiar>
              {casosParaMiniatura.length > 0 ? (
                <Select value={casoMiniatura} onValueChange={setCasoMiniatura}>
                  <SelectTrigger aria-label="Selecionar caso para a miniatura familiar" className="mb-3 h-8 bg-cream text-xs text-navy">
                    <SelectValue placeholder="Selecione um caso" />
                  </SelectTrigger>
                  <SelectContent>
                    {casosParaMiniatura.map((c: any) => {
                      const demonstrativo = papelDoRegistro(c).valor === "demo";
                      return (
                        <SelectItem key={c["id"]} value={String(c["id"])}>
                          {String(c["codigo"] ?? c["titulo"] ?? c["id"])}
                          {demonstrativo ? " · demonstração" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : null}
              {miniaturaQuery.isLoading ? (
                <p className="text-xs text-navy/50">Carregando vínculos…</p>
              ) : miniaturaQuery.isError ? (
                <p className="text-xs text-terracotta">Vínculos não puderam ser lidos agora.</p>
              ) : !miniaturaQuery.data || miniaturaQuery.data.pessoas.length === 0 ? (
                <div data-dossie-miniatura-vazia>
                  <div className="grid grid-cols-2 gap-3" aria-hidden="true">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="h-8 w-8 shrink-0 rounded-full border border-dashed border-navy/25" />
                        <span className="h-2 w-16 rounded-full bg-navy/10" />
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-navy/55">
                    {casosParaMiniatura.length === 0
                      ? "Nenhum caso disponível para leitura familiar."
                      : "Nenhum vínculo genealógico registrado para este caso ainda."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2" data-dossie-miniatura-pessoas>
                    {miniaturaQuery.data.pessoas.slice(0, 6).map((p) => (
                      <Pessoa key={p.id} nome={p.nome} papel={p.papel} />
                    ))}
                  </div>
                  {miniaturaQuery.data.pessoas.length > 6 ? (
                    <p className="mt-1 text-[11px] text-navy/50">+{miniaturaQuery.data.pessoas.length - 6} pessoa(s)</p>
                  ) : null}
                  {miniaturaQuery.data.relacoes.length > 0 ? (
                    <ul className="mt-3 space-y-0.5 text-[10px] text-navy/60" data-dossie-miniatura-relacoes>
                      {miniaturaQuery.data.relacoes.slice(0, 4).map((r) => (
                        <li key={r.id} className="truncate">
                          {r.de} → {r.para} · {r.rotulo}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              )}
              <div className="mt-3 border-t border-navy/10 pt-2" data-dossie-geracoes>
                <Linha
                  rotulo="Gerações documentadas"
                  valor={
                    miniaturaQuery.data && miniaturaQuery.data.geracoesDocumentadas > 0
                      ? String(miniaturaQuery.data.geracoesDocumentadas)
                      : "—"
                  }
                  tom={miniaturaQuery.data && miniaturaQuery.data.geracoesDocumentadas > 0 ? "atencao" : "neutro"}
                />
              </div>
            </Cartao>
          </div>

          {/* Prancha V4 — linha 2: régua larga. */}
          <Cartao titulo="Da pergunta à microentrega" data-dossie-etapas>
            <ReguaEtapas
              etapas={d.dossie.etapas.map((etapa) => {
                const n = d.dossie.contagemPorEtapa[etapa.id];
                return {
                  rotulo: etapa.titulo,
                  estado: etapa.ativa ? ("feito" as const) : ("pendente" as const),
                  apoio: n === null || n === undefined ? "sem rastro no schema" : `${n} ${n === 1 ? "registro" : "registros"}`,
                };
              })}
            />
            <p className="mt-2 text-[11px] text-navy/50">
              Pergunta e Pronta para revisão não têm tabela própria no schema — ficam sempre neutras, nunca
              marcadas como concluídas sem base real.
            </p>
          </Cartao>

          {/* Prancha V4 — linha 3: dois gráficos. */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Cartao titulo="Cobertura das fontes" data-dossie-cobertura>
              <BarrasHorizontais
                tituloAcessivel="Cobertura das fontes por tipo"
                itens={(d.dossie.coberturaFontes.length > 0
                  ? d.dossie.coberturaFontes
                  : TIPOS_FONTE_VAZIOS.map((rotulo) => ({ tipo: rotulo, rotulo, quantidade: 0 }))
                ).map((c, i) => ({
                  rotulo: c.rotulo,
                  valor: d.dossie.totalFontes > 0 ? (c.quantidade / d.dossie.totalFontes) * 100 : 0,
                  apoio: `${c.quantidade} ${c.quantidade === 1 ? "fonte" : "fontes"}`,
                  tom: i % 2 === 1 ? ("gold" as const) : ("navy" as const),
                }))}
              />
              {d.dossie.totalFontes === 0 ? (
                <p className="mt-2 text-[11px] text-navy/55">Nenhuma fonte registrada ainda.</p>
              ) : null}
            </Cartao>

            <Cartao titulo="Produção de evidências" data-dossie-producao>
              <GraficoColunas
                tituloAcessivel="Evidências registradas por mês, últimos 6 meses"
                itens={d.dossie.producaoEvidencias.map((m, i, todos) => ({
                  rotulo: m.mes,
                  valor: m.quantidade,
                  destaque: i === todos.length - 1 && m.quantidade > 0,
                }))}
              />
              {d.dossie.producaoEvidencias.every((m) => m.quantidade === 0) ? (
                <p className="mt-2 text-[11px] text-navy/55">Nenhuma evidência registrada nos últimos 6 meses.</p>
              ) : null}
            </Cartao>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-dossie-kpis>
            <CardIndicador rotulo="Acervos mapeados" valor={d.dossie.acervosMapeados} apoio="Catálogo de fontes da organização" />
            <CardIndicador
              rotulo="Hipóteses em aberto"
              valor={d.dossie.hipotesesEmAberto}
              apoio="Abertas ou em revisão"
              tom={d.dossie.hipotesesEmAberto > 0 ? "atencao" : "sucesso"}
            />
            <CardIndicador
              rotulo="Evidências validadas"
              valor={d.dossie.evidenciasValidadas}
              apoio="Revisão humana concluída"
              tom="sucesso"
            />
            <CardIndicador
              rotulo="Cartórios acionados"
              valor={d.dossie.cartoriosAcionados}
              apoio="Instituições distintas com pedido feito"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <CardIndicador rotulo="Casos em pesquisa" valor={d.pesquisas.length} apoio="Pesquisas ativas no Desk" />
            <CardIndicador
              rotulo="Pendências críticas"
              valor={d.pesquisas.reduce((s: number, p: any) => s + (p.pendencias_criticas ?? 0), 0)}
              apoio="Soma por pesquisa"
              tom="critico"
            />
            <CardIndicador
              rotulo="Pendências vencidas"
              valor={d.pesquisas.reduce((s: number, p: any) => s + (p.pendencias_vencidas ?? 0), 0)}
              apoio="Soma por pesquisa"
              tom="atencao"
            />
            <CardIndicador
              rotulo="Evidências em revisão"
              valor={d.pesquisas.reduce((s: number, p: any) => s + (p.evidencias_revisao ?? 0), 0)}
              apoio="Aguardando validação humana"
              tom="atencao"
            />
            <CardIndicador
              rotulo="Casos sem pesquisa iniciada"
              valor={d.casosSemPesquisa.length}
              apoio="Elegíveis, ainda não abertos"
            />
          </div>

          <CaCard variante="compacto" titulo="Pesquisas em andamento">
            <button
              className="mb-3 rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
              onClick={() => mScan.mutate()}
            >
              Rodar verificação de qualidade da pesquisa
            </button>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por código, título, status ou país"
              className="mb-3 w-full rounded-lg border border-navy/15 bg-cream/40 px-3 py-1.5 text-sm"
            />
            <div className="space-y-2">
              {pesquisasFiltradas.map((p: any) => (
                <div
                  key={p["id"]}
                  className="block rounded-xl border border-navy/10 bg-cream/40 p-3 hover:border-navy/30"
                  data-pesquisa-caso
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to="/pesquisa-modulo/$id" params={{ id: p["id"] }} className="text-sm font-semibold underline decoration-gold">
                      {String(p.caso?.codigo ?? "caso")}
                    </Link>
                    <span className="text-sm text-navy/70">{String(p.caso?.titulo ?? "")}</span>
                    <Selo texto={rotulo(p["status"])} />
                    {p["pendencias_criticas"] > 0 && (
                      <Selo texto={`${p["pendencias_criticas"]} pendência(s) crítica(s)`} tom="erro" />
                    )}
                    {p["pendencias_vencidas"] > 0 && (
                      <Selo texto={`${p["pendencias_vencidas"]} vencida(s)`} tom="alerta" />
                    )}
                    {p["evidencias_revisao"] > 0 && (
                      <Selo texto={`${p["evidencias_revisao"]} evidência(s) em revisão`} tom="alerta" />
                    )}
                  </div>
                  <p className="text-xs text-navy/50">{String(p["research_objective"] ?? "objetivo não descrito")}</p>
                  {p.caso?.id ? (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]" data-pesquisa-atalhos>
                      <Link
                        to="/pessoas-linhagens/$caseId"
                        params={{ caseId: String(p.caso.id) }}
                        className="underline decoration-gold"
                      >
                        Ficha genealógica (lacunas, módulos históricos, eventos, linhagens)
                      </Link>
                      <Link to="/pesquisa-evidencias/$caseId" params={{ caseId: String(p.caso.id) }} className="underline decoration-gold">
                        Evidências do caso
                      </Link>
                      <Link to="/achados/$caseId" params={{ caseId: String(p.caso.id) }} className="underline decoration-gold">
                        Achados
                      </Link>
                      <Link
                        to="/plano-acao/$caseId"
                        params={{ caseId: String(p.caso.id) }}
                        search={{ foco: undefined }}
                        className="underline decoration-gold"
                      >
                        Plano de ação
                      </Link>
                    </div>
                  ) : null}
                </div>
              ))}
              {pesquisasFiltradas.length === 0 && <p className="text-sm text-navy/60">Nenhuma pesquisa criada ainda.</p>}
            </div>
          </CaCard>

          <div id="abrir-pesquisa-caso" className="scroll-mt-24">
            <CaCard variante="compacto" titulo="Abrir pesquisa para um caso existente">
              <form
                className="grid gap-3 md:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  mCriar.mutate();
                }}
              >
                <label className="text-xs text-navy/70">
                  Caso
                  <select
                    value={casoId}
                    onChange={(e) => setCasoId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-navy/15 bg-cream/40 px-2 py-1 text-sm text-navy"
                  >
                    <option value="">Selecione…</option>
                    {semFixtures(d.casosSemPesquisa).map((c: any) => (
                      <option key={c["id"]} value={c["id"]}>
                        {String(c["codigo"])} — {String(c["titulo"])}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-navy/70 md:col-span-2">
                  Objetivo da pesquisa
                  <textarea
                    rows={2}
                    value={objetivo}
                    onChange={(e) => setObjetivo(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-navy/15 bg-cream/40 px-2 py-1 text-sm text-navy"
                    placeholder="Ex.: Localização de certidão de nascimento de ascendente austríaco em Graz"
                  />
                </label>
                <div>
                  <button
                    type="submit"
                    disabled={!casoId || mCriar.isPending}
                    className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-cream hover:bg-navy/90 disabled:opacity-40"
                  >
                    {mCriar.isPending ? "Criando…" : "Abrir pesquisa"}
                  </button>
                </div>
              </form>
            </CaCard>
          </div>

          <CaCard titulo="Inconsistências de pesquisa em aberto" eyebrow="Pesquisa Genealógica · Centro de Inteligência">
            {d.inconsistencias.length === 0 ? (
              <EstadoVazio mensagem="Nenhuma inconsistência aberta." />
            ) : (
              <ul className="space-y-1 text-sm text-navy/70">
                {d.inconsistencias.map((i: any) => (
                  <li key={i["id"]}>
                    <Selo texto={String(i["severidade"])} tom={i["severidade"] === "critica" ? "erro" : "alerta"} />{" "}
                    {String(i["titulo"])}
                  </li>
                ))}
              </ul>
            )}
          </CaCard>
        </div>
      )}
    </SaasShell>
  );
}
