import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { FontePortalProvider } from "@/components/portal/fonte-portal";
import { PortalJornada } from "@/routes/portal/jornada";
import { PortalArvore } from "@/routes/portal/arvore";
import { PortalRadar } from "@/routes/portal/radar";
import { listarCasosFicha } from "@/lib/caso-ficha.functions";
import { dadosVivosDoPortalComoAdmin } from "@/lib/app-cliente-como-pessoa.functions";

/**
 * 28/08/2026 — "preciso com o acesso master ter acesso ao app cliente como
 * pessoa" (Proprietária). A única visão do App Cliente de dentro do Desk era
 * a demo com caso fictício (Sophia). Esta tela usa o mesmo mecanismo (as
 * telas reais, fonte de dado trocada) só que com dado real de um caso
 * escolhido — via `dadosVivosDoPortalComoAdmin`, que lê a mesma projeção
 * sanitizada que o cliente veria (`portal_projecoes.content_sanitized`),
 * autorizada por papel de staff em vez de sessão de cliente.
 *
 * Cobre hoje 3 das 10 telas do App Cliente — as únicas que já exportam um
 * componente reutilizável fora da própria rota (mesmo limite da demo). As
 * outras 7 (Documentos, Entregas, Fase 01/02, Legado, Conta, Faturas) só
 * exportam `Route`; precisam do mesmo tratamento antes de entrar aqui.
 */
export const Route = createFileRoute("/_authenticated/app-cliente-como-pessoa")({
  head: () => ({
    meta: [
      { title: "App Cliente como pessoa — Clube Ancestral" },
      {
        name: "description",
        content: "Acesso master somente leitura: o App Cliente real de um caso escolhido, com a mesma projeção sanitizada que o cliente vê.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    casoId: typeof search["casoId"] === "string" ? search["casoId"] : undefined,
  }),
  component: AppClienteComoPessoa,
});

const TELAS = [
  { chave: "jornada", rotulo: "Jornada", Componente: PortalJornada },
  { chave: "arvore", rotulo: "Árvore da família", Componente: PortalArvore },
  { chave: "radar", rotulo: "Radar de países", Componente: PortalRadar },
] as const;

function AppClienteComoPessoa() {
  const { casoId: casoIdDaUrl } = Route.useSearch();
  const [casoId, setCasoId] = useState<string>(casoIdDaUrl ?? "");
  const [ativa, setAtiva] = useState<(typeof TELAS)[number]["chave"]>("jornada");
  const Tela = TELAS.find((t) => t.chave === ativa)?.Componente ?? PortalJornada;

  // Chegando de "Abrir visão do cliente" (ficha do cliente ou do caso): pré-seleciona o caso.
  useEffect(() => {
    if (casoIdDaUrl) setCasoId(casoIdDaUrl);
  }, [casoIdDaUrl]);

  const carregarCasos = useServerFn(listarCasosFicha);
  const casos = useQuery({ queryKey: ["casos-ficha-picker"], queryFn: () => carregarCasos() });

  const carregarDados = useServerFn(dadosVivosDoPortalComoAdmin);
  const dados = useQuery({
    queryKey: ["app-cliente-como-pessoa", casoId],
    queryFn: () => carregarDados({ data: { casoId } }),
    enabled: Boolean(casoId),
    retry: false,
  });

  const casoEscolhido = useMemo(
    () => (casos.data?.casos ?? []).find((c: Record<string, unknown>) => c["id"] === casoId),
    [casos.data, casoId],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-navy/10 bg-white p-5">
        <h1 className="font-serif text-xl text-navy">App Cliente como pessoa — acesso master</h1>
        <p className="mt-1 text-sm text-navy/70">
          As telas reais do App Cliente, com dado real de um caso escolhido — a mesma projeção
          sanitizada que a pessoa veria, nunca dado bruto do Desk. Somente leitura: nada aqui envia,
          publica ou altera qualquer registro.
        </p>

        <label className="mt-4 block max-w-sm">
          <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">Caso</span>
          <select
            value={casoId}
            onChange={(e) => setCasoId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold"
          >
            <option value="">Selecione um caso…</option>
            {(casos.data?.casos ?? []).map((c: Record<string, unknown>) => (
              <option key={String(c["id"])} value={String(c["id"])}>
                {String(c["codigo"])} — {String(c["titulo"])}
              </option>
            ))}
          </select>
          {casos.isError ? (
            <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-terracotta">
              Não foi possível carregar a lista de casos. A lista acima está incompleta.
              <button
                type="button"
                onClick={() => void casos.refetch()}
                className="rounded-md border border-terracotta/50 px-2 py-0.5 font-medium text-terracotta hover:bg-terracotta/10"
              >
                Tentar novamente
              </button>
            </span>
          ) : null}
        </label>

        {casoId ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {TELAS.map((t) => (
              <button
                key={t.chave}
                type="button"
                onClick={() => setAtiva(t.chave)}
                aria-pressed={ativa === t.chave}
                className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                  ativa === t.chave
                    ? "border-navy bg-navy text-cream"
                    : "border-navy/15 text-navy/75 hover:bg-navy/5"
                }`}
              >
                {t.rotulo}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {!casoId ? (
        <p className="rounded-xl border border-navy/10 bg-white p-5 text-sm text-navy/60">
          Escolha um caso acima para abrir o App Cliente dele.
        </p>
      ) : dados.isError ? (
        <p className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-5 text-sm text-terracotta">
          {(dados.error as Error)?.message ?? "Não foi possível carregar este caso."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-navy/15">
          <FontePortalProvider
            fonte={{
              dados: dados.data ?? { projecoes: [], documentos: [] },
              carregando: dados.isLoading,
              erro: dados.isError,
              previa: {
                selo: "ACESSO MASTER — VISÃO REAL DO APP CLIENTE",
                titulo: casoEscolhido
                  ? `${String(casoEscolhido["codigo"])} — ${String(casoEscolhido["titulo"])}`
                  : "Carregando caso…",
              },
            }}
          >
            <Tela />
          </FontePortalProvider>
        </div>
      )}
    </div>
  );
}
