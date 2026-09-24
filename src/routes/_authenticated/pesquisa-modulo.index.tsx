/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { EstadoVazio, SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { Selo } from "@/components/comercial/base";
import { rotulo } from "@/components/pesquisa/modulo-campos";
import { criarPesquisaParaCaso, painelPesquisaModulo, rodarScanPesquisa } from "@/lib/pesquisa-modulo.functions";
import { filtrarPorBusca } from "@/lib/rotulo-negocio";
import { CardIndicador } from "@/components/desk/ui-desk";
import { CaCard } from "@/components/ui/ca-card";

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
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
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

  const q = useQuery({ queryKey: ["pesquisa-modulo", "painel"], queryFn: () => carregar() });

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
                <Link
                  key={p["id"]}
                  to="/pesquisa-modulo/$id"
                  params={{ id: p["id"] }}
                  className="block rounded-xl border border-navy/10 bg-cream/40 p-3 hover:border-navy/30"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">{String(p.caso?.codigo ?? "caso")}</strong>
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
                </Link>
              ))}
              {pesquisasFiltradas.length === 0 && <p className="text-sm text-navy/60">Nenhuma pesquisa criada ainda.</p>}
            </div>
          </CaCard>

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
                  {d.casosSemPesquisa.map((c: any) => (
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
                  placeholder="Ex.: reconstruir a linha paterna até o ancestral emigrado e localizar registros civis correspondentes."
                />
              </label>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={!casoId || mCriar.isPending}
                  className="rounded-lg bg-navy px-3 py-1.5 text-sm text-cream disabled:opacity-50"
                >
                  {mCriar.isPending ? "Criando…" : "Criar pesquisa"}
                </button>
              </div>
            </form>
          </CaCard>

          {/*
            DSA-3-CENTRO-INTELIGENCIA (21/09/2026): terceiro consumidor do
            Desk a usar `CaCard`/`EstadoVazio` (após DSA-1 em qualidade.tsx e
            DSA-2 em painel.tsx), mesmos tokens, sem hex novo. Troca só o
            invólucro deste bloco (antes `Painel`); dado, mutation e demais
            blocos da tela (Painel "Pesquisas em andamento" / "Abrir
            pesquisa") permanecem intocados.
          */}
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
