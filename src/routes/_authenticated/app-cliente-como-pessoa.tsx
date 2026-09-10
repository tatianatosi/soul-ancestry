import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { EstadoDados } from "@/components/saas/estado-dados";
import { FontePortalProvider } from "@/components/portal/fonte-portal";
import { ABAS_APP_CLIENTE } from "@/components/portal/abas-app-cliente";
import { listarCasosFicha } from "@/lib/caso-ficha.functions";
import { dadosVivosDoPortalComoAdmin } from "@/lib/app-cliente-como-pessoa.functions";

/**
 * Acesso master ao App Cliente com dado real de um caso.
 * Sete abas do mockup. Entregas / Fase 01 / Fase 02 não são 1º nível:
 * abrem pela jornada quando a visibilidade da pessoa libera.
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

function AppClienteComoPessoa() {
  const { casoId: casoIdDaUrl } = Route.useSearch();
  const [casoId, setCasoId] = useState<string>(casoIdDaUrl ?? "");
  const [ativa, setAtiva] = useState<(typeof ABAS_APP_CLIENTE)[number]["chave"]>("home");
  const Tela = ABAS_APP_CLIENTE.find((t) => t.chave === ativa)?.Componente ?? ABAS_APP_CLIENTE[0]!.Componente;

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
    () => casos.data?.casos?.find((c: Record<string, unknown>) => c["id"] === casoId),
    [casos.data, casoId],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-navy/10 bg-white p-5">
        <h1 className="font-serif text-xl text-navy">App Cliente como pessoa — acesso master</h1>
        <p className="mt-1 text-sm text-navy/70">
          As sete telas reais do App Cliente, com dado real de um caso escolhido — a mesma projeção
          sanitizada que a pessoa veria. Somente leitura.
        </p>

        <div className="mt-4 max-w-sm">
          <EstadoDados<Record<string, unknown>>
            carregando={casos.isLoading}
            erro={casos.error}
            dados={casos.data?.casos}
            aoTentarNovamente={() => void casos.refetch()}
            recurso="a lista de casos"
            vazio="Nenhum caso cadastrado ainda. Sem caso não há App Cliente para abrir."
          >
            {(lista) => (
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
                  Caso
                </span>
                <select
                  value={casoId}
                  onChange={(e) => setCasoId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold"
                >
                  <option value="">Selecione um caso…</option>
                  {lista.map((c) => (
                    <option key={String(c["id"])} value={String(c["id"])}>
                      {String(c["codigo"])} — {String(c["titulo"])}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </EstadoDados>
        </div>

        {casoId ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {ABAS_APP_CLIENTE.map((t) => (
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
