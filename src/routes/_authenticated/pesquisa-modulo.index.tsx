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
import { Pessoa } from "@/components/prancha-v4/kit";
import { papelDoRegistro } from "@/lib/caso-ficha";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      titulo="Pesquisa Genealógica e Evidências"
      descricao="Pesquisas por caso, com pendências, evidências e travas de pesquisa externa."
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
            eyebrow="Pesquisa Genealógica · Centro de Inteligência"
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
            {mostrarFiltro ? (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-navy/15 bg-cream/40 p-2" data-dossie-filtro>
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

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div data-dossie-cobertura>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-navy/55">
                  Cobertura das fontes
                </h4>
                {d.dossie.coberturaFontes.length === 0 ? (
                  <EstadoVazio mensagem="Nenhuma fonte registrada ainda." />
                ) : (
                  <ul className="space-y-2">
                    {d.dossie.coberturaFontes.map((c) => (
                      <li key={c.tipo}>
                        <div className="mb-1 flex items-center justify-between text-xs text-navy/70">
                          <span>{c.rotulo}</span>
                          <span className="tabular-nums">{c.quantidade} fonte(s)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-navy/10">
                          <div
                            className="h-2 rounded-full bg-gold"
                            style={{
                              width: `${Math.max(4, Math.round((c.quantidade / d.dossie.totalFontes) * 100))}%`,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div data-dossie-producao>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-navy/55">
                  Produção de evidências (6 meses)
                </h4>
                {d.dossie.producaoEvidencias.every((m) => m.quantidade === 0) ? (
                  <EstadoVazio mensagem="Nenhuma evidência registrada nos últimos 6 meses." />
                ) : (
                  <div className="flex h-32 items-end gap-3">
                    {(() => {
                      const max = Math.max(1, ...d.dossie.producaoEvidencias.map((m) => m.quantidade));
                      return d.dossie.producaoEvidencias.map((m) => (
                        <div key={m.mes} className="flex flex-1 flex-col items-center gap-1">
                          <span className="text-[11px] tabular-nums text-navy/60">{m.quantidade}</span>
                          <div
                            className="w-full rounded-t-md bg-navy/60"
                            style={{ height: `${Math.max(4, Math.round((m.quantidade / max) * 100))}%` }}
                          />
                          <span className="text-[10px] uppercase text-navy/50">{m.mes}</span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5" data-dossie-etapas>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-navy/55">
                Da pergunta à microentrega
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                {d.dossie.etapas.map((etapa, i) => (
                  <div key={etapa.id} className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        etapa.ativa
                          ? "border-sucesso/30 bg-sucesso-suave text-sucesso"
                          : "border-navy/15 bg-cream/70 text-navy/50"
                      }`}
                      title={etapa.semRastro ? "Sem rastro estruturado no schema" : undefined}
                    >
                      {etapa.ativa ? "✔ " : ""}
                      {etapa.titulo}
                    </span>
                    {i < d.dossie.etapas.length - 1 && <span className="text-navy/30">→</span>}
                  </div>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-navy/50">
                Pergunta e Pronta para revisão não têm tabela própria no schema — ficam sempre neutras, nunca
                marcadas como concluídas sem base real.
              </p>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div data-dossie-fontes>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-navy/55">
                  Fontes e referências
                </h4>
                {fontesExibidas.length === 0 ? (
                  <EstadoVazio mensagem="Nenhuma fonte registrada ainda." />
                ) : (
                  <ul className="space-y-1.5">
                    {fontesExibidas.map((f) => (
                      <li key={f.id} className="flex items-center justify-between gap-2 rounded-lg border border-navy/10 bg-cream/40 px-3 py-1.5">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-navy">{f.titulo}</p>
                          {f.instituicao ? <p className="truncate text-[11px] text-navy/50">{f.instituicao}</p> : null}
                        </div>
                        <Selo texto={f.rotuloStatus} tom={f.status === "verified" || f.status === "reviewed" ? "ok" : "neutro"} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div data-dossie-hipoteses>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-navy/55">
                  Hipóteses e confiança
                </h4>
                {d.dossie.confiancaCadeiaPct === null ? (
                  <p className="mb-3 text-xs text-navy/50">
                    Confiança agregada ainda não calculada — sem hipótese ativa para a fórmula (média de
                    confidence_level entre hipóteses não encerradas).
                  </p>
                ) : (
                  <p className="mb-3 text-xs text-navy/70">
                    Confiança média das hipóteses ativas:{" "}
                    <span className="font-serif text-lg text-navy">{d.dossie.confiancaCadeiaPct}%</span>
                  </p>
                )}
                {d.dossie.hipotesesRecentes.length === 0 ? (
                  <EstadoVazio mensagem="Nenhuma hipótese registrada ainda." />
                ) : (
                  <ul className="space-y-1.5">
                    {d.dossie.hipotesesRecentes.map((h) => (
                      <li key={h.id} className="flex items-center justify-between gap-2 rounded-lg border border-navy/10 bg-cream/40 px-3 py-1.5">
                        <p className="truncate text-xs font-medium text-navy">{h.titulo}</p>
                        <div className="flex shrink-0 gap-1">
                          <Selo texto={h.rotuloConfianca} />
                          <Selo texto={h.rotuloStatus} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div data-dossie-miniatura-familiar>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-navy/55">
                  Miniatura familiar
                </h4>
                {casosParaMiniatura.length === 0 ? (
                  <EstadoVazio mensagem="Nenhum caso disponível para leitura familiar." />
                ) : (
                  <>
                    <Select value={casoMiniatura} onValueChange={setCasoMiniatura}>
                      <SelectTrigger aria-label="Selecionar caso para a miniatura familiar" className="mb-2 bg-cream text-navy">
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
                    {miniaturaQuery.isLoading ? (
                      <p className="text-xs text-navy/50">Carregando vínculos…</p>
                    ) : miniaturaQuery.isError ? (
                      <p className="text-xs text-terracotta">Vínculos não puderam ser lidos agora.</p>
                    ) : !miniaturaQuery.data || miniaturaQuery.data.pessoas.length === 0 ? (
                      <EstadoVazio mensagem="Nenhum vínculo genealógico registrado para este caso ainda." />
                    ) : (
                      <div className="flex flex-wrap gap-x-3 gap-y-2" data-dossie-miniatura-pessoas>
                        {miniaturaQuery.data.pessoas.slice(0, 6).map((p) => (
                          <Pessoa key={p.id} nome={p.nome} papel={p.papel} />
                        ))}
                        {miniaturaQuery.data.pessoas.length > 6 ? (
                          <span className="self-center text-[11px] text-navy/50">
                            +{miniaturaQuery.data.pessoas.length - 6} pessoa(s)
                          </span>
                        ) : null}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CaCard>

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
        </div>
      )}
    </SaasShell>
  );
}
