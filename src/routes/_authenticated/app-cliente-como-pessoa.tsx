import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { FontePortalProvider } from "@/components/portal/fonte-portal";
import { comTimeout } from "@/lib/portal-resiliencia";
import {
  ABAS_APP_CLIENTE,
  TELAS_INTERNAS_PORTAL,
  rotaInternaDoPortal,
} from "@/components/portal/abas-app-cliente";
import { listarCasosFicha } from "@/lib/caso-ficha.functions";
import { dadosVivosDoPortalComoAdmin } from "@/lib/app-cliente-como-pessoa.functions";
import { identidadeDeCrmCaso } from "@/lib/caso-compartilhado";


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
  const [rotaInterna, setRotaInterna] = useState("/portal");
  const Tela = TELAS_INTERNAS_PORTAL[rotaInterna] ?? TELAS_INTERNAS_PORTAL["/portal"]!;
  const casoId = casoIdDaUrl ?? "";

  const carregarCasos = useServerFn(listarCasosFicha);
  const casos = useQuery({ queryKey: ["casos-ficha-picker"], queryFn: () => carregarCasos() });

  const carregarDados = useServerFn(dadosVivosDoPortalComoAdmin);
  const dados = useQuery({
    queryKey: ["app-cliente-como-pessoa", casoId],
    queryFn: () => comTimeout(carregarDados({ data: { casoId } })),
    enabled: Boolean(casoId),
    retry: false,
  });

  const casoEscolhido = useMemo(
    () => casos.data?.casos?.find((c: Record<string, unknown>) => c["id"] === casoId),
    [casos.data, casoId],
  );

  return (
    <div className="min-h-screen bg-cream" data-previa-app-cliente-real>
      {casoId ? (
        <div className="border-b-2 border-gold bg-navy px-4 py-2 text-center" role="note" data-banner-visao-master>
          <p className="font-serif text-base text-cream sm:text-lg">Visualização Master Administrativa — Sessão de Auditoria</p>
          <p className="text-[11px] tracking-wide text-gold">Somente leitura · você vê o aplicativo como a família, sem virar cliente</p>
        </div>
      ) : null}
      {!casoId ? (
        <div className="mx-auto max-w-xl p-6">
          <p className="rounded-xl border border-navy/10 bg-card p-5 text-sm text-navy/70">
            Abra esta prévia a partir de um caso para ver as sete telas do aplicativo.
          </p>
        </div>
      ) : casos.isLoading || dados.isLoading ? (
        <p className="p-6 text-center text-sm text-navy/60" role="status">Preparando o aplicativo da família…</p>
      ) : (
        <FontePortalProvider
          fonte={{
            dados: dados.data ?? { projecoes: [], documentos: [], proximaAcao: null },
            carregando: false,
            // 12/10/2026: falha de leitura chega a cada aba como erro (nunca
            // como vazio), com nova tentativa real.
            erro: dados.isError,
            recarregar: () => void dados.refetch(),
            escopo: dados.data?.escopo,
            aoNavegar: (path) => setRotaInterna(rotaInternaDoPortal(path)),
            rotaInterna,
            previa: {
              selo: "Visualização do aplicativo da família",
              titulo: casoEscolhido ? String(casoEscolhido["titulo"]) : "Sua história familiar",
              pais: casoEscolhido ? ((casoEscolhido["pais"] as string | null) ?? null) : null,
              ...(casoEscolhido
                ? {
                    identidade: identidadeDeCrmCaso({
                      id: String(casoEscolhido["id"]),
                      codigo: casoEscolhido["codigo"] as string | null,
                      titulo: casoEscolhido["titulo"] as string | null,
                    }),
                  }
                : {}),
            },
          }}
        >
          <Tela />
        </FontePortalProvider>
      )}
    </div>
  );
}
