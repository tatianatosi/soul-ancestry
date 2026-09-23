import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { COPY_TELAS } from "@/lib/portal-copy";
import { CASO_DEMO_CODIGO, CLIENTE_DEMO_NOME } from "@/lib/portal-demo-sophia";
import { PortalShell, usePortal, PortalCarregando } from "@/components/portal/portal-shell";
import { LinkPortal, usePreviaPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { minhasFaturas } from "@/lib/portal-cliente.functions";

export const Route = createFileRoute("/portal/conta")({
  head: () => ({
    meta: [
      { title: "Conta — Portal Clube Ancestral" },
      { name: "description", content: "Seus dados de acesso ao portal do Clube Ancestral." },
      { property: "og:title", content: "Conta — Portal Clube Ancestral" },
      { property: "og:description", content: "Dados básicos do seu acesso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalConta,
});

function Chip({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">{rotulo}</p>
      <p className="mt-0.5 text-sm text-navy">{valor}</p>
    </div>
  );
}

export function PortalConta() {
  const previa = usePreviaPortal();
  const { visibilidade, carregando } = useVisibilidade("conta");
  const { data } = usePortal();
  const vivo = usePortalVivo();
  const carregarFaturas = useServerFn(minhasFaturas);
  const faturas = useQuery({
    queryKey: ["portal-conta-faturas"],
    queryFn: () => carregarFaturas({}),
    retry: false,
    enabled: previa === null,
  });
  const temFatura = (faturas.data?.length ?? 0) > 0;
  const falhaFaturas = faturas.isError;

  /**
   * APP-CASE-ID-CONTA-RADAR (19/09/2026): `previa` cobre dois casos distintos
   * — Acesso Master de um caso real (`identidade.fonte !== "demo"`, ver
   * `app-cliente-como-pessoa.tsx`) e a demo institucional (`fonte === "demo"`,
   * `sessao-demo-app-cliente.tsx`). Antes, qualquer `previa` caía direto nos
   * valores fixos de Sophia — em prévia real de outro caso, a Conta mostrava
   * o titular/país errados (os da demo). `radar.tsx` já prioriza
   * `previa.identidade.codigo`; aqui replica o mesmo padrão e usa `fonte`
   * para nunca fabricar titular/país fora da demo de verdade.
   */
  const previaDemo = previa?.identidade?.fonte === "demo";
  const titular = data?.cliente?.nome ?? (previaDemo ? CLIENTE_DEMO_NOME : null) ?? "—";
  const casosPortal = (data as { casos?: { id?: string; codigo?: string | null }[] } | null)?.casos;
  // Segue o caso que a leitura de fato usou, em vez de fixar o primeiro —
  // senão o chip "Caso" da Conta contradiz o conteúdo das outras abas.
  const casoDoPortal =
    casosPortal?.find((c) => c.id && c.id === vivo.data?.casoAtivoId) ?? casosPortal?.[0];
  const casoCodigo =
    previa?.identidade?.codigo ?? casoDoPortal?.codigo ?? (previaDemo ? CASO_DEMO_CODIGO : null) ?? "—";
  const paisInteresse = data?.cliente?.pais_interesse ?? (previaDemo ? "Itália" : null) ?? "—";
  const planoEstado = previa || data?.autorizado ? "Acompanhamento ativo" : "Aguardando publicação";

  /**
   * Alertas usa o mesmo `proximaAcao` já publicado para Home/Documentos —
   * nunca uma fonte nova. Só vira alerta quando o motor sinaliza algo
   * acionável (documento pendente ou pagamento em aberto); qualquer outro
   * destino (jornada seguindo, caso encerrado/pausado) fica no "sem alerta".
   */
  const proximaAcao = vivo.data?.proximaAcao ?? null;
  const alertaAcionavel =
    proximaAcao &&
    (proximaAcao.destino === "/portal/documentos" || proximaAcao.destino === "/portal/conta")
      ? proximaAcao
      : null;

  return (
    <PortalShell titulo={COPY_TELAS.conta.titulo} descricao={COPY_TELAS.conta.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          <div className="space-y-5" data-aba-conta>
            <div
              data-conta-meta
              className="flex flex-wrap gap-2 rounded-xl border border-border bg-card px-4 py-3"
            >
              <Chip rotulo="Titular" valor={titular} />
              <Chip rotulo="Caso" valor={casoCodigo} />
              <Chip rotulo="Interesse" valor={paisInteresse} />
              <Chip rotulo="Acesso" valor="App Cliente" />
            </div>

            <section
              data-conta-perfil
              className="overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-xl text-navy">Dados da conta</h2>
                <span className="text-[10px] font-medium uppercase tracking-wide text-navy/45">
                  Dados pessoais
                </span>
              </div>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Titular</dt>
                  <dd className="text-sm text-navy">{titular}</dd>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Caso vinculado</dt>
                  <dd className="font-mono text-sm text-navy">{casoCodigo}</dd>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Preferência</dt>
                  <dd className="text-sm text-navy">{paisInteresse}</dd>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Canal</dt>
                  <dd className="text-sm text-navy">Aplicativo do cliente</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-navy/55">
                Preferências de comunicação e convites familiares aparecem aqui quando a equipe
                libera o acesso.
              </p>
            </section>

            <section data-conta-plano className="overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-xl text-navy">Acompanhamento</h2>
                <span className="rounded-full border border-gold/40 bg-gold/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy">
                  {planoEstado}
                </span>
              </div>
              <p className="mt-2 text-sm text-navy/75">
                Acompanhamento do seu caso. Os detalhes do plano aparecem aqui quando a equipe os
                publica para você.
              </p>
              {/* Acabamento 2026-09-13 (referência Lovable): texto corrido no lugar
                  de grade de 3 crachás — mesmos três dados reais, leitura mais serena. */}
              <p className="mt-3 text-xs text-navy/55">
                Escopo: o caso vinculado a você. Publicação:{" "}
                {previaDemo ? "Demo" : previa ? "Prévia da equipe (caso real)" : "Quando a equipe publica"}.
              </p>
            </section>

            <section data-conta-alertas className="overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-xl text-navy">Atualizações para você</h2>
                <span className="text-[10px] font-medium uppercase tracking-wide text-navy/45">
                  Pessoais do caso
                </span>
              </div>
              {alertaAcionavel ? (
                <div className="mt-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
                    {alertaAcionavel.destino === "/portal/conta" ? "Pagamento em aberto" : "Documento pendente"}
                  </p>
                  <p className="mt-1 text-sm text-navy">{alertaAcionavel.acao}</p>
                  {alertaAcionavel.destino === "/portal/documentos" ? (
                    <LinkPortal
                      to="/portal/documentos"
                      className="mt-2 inline-flex text-xs font-medium text-navy/70 underline hover:text-navy"
                    >
                      Ver documentos solicitados
                    </LinkPortal>
                  ) : null}
                </div>
              ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-navy/20 bg-cream/60 px-4 py-5 text-center">
                  <p className="text-sm text-navy/70">Sem alerta publicado no momento.</p>
                  <p className="mt-1 text-xs text-navy/50">
                    Documentos pendentes e próximas ações do seu caso aparecem aqui quando a equipe
                    publica um aviso sanitizado.
                  </p>
                </div>
              )}
            </section>

            <section data-conta-historico className="overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-xl text-navy">Movimentos disponíveis</h2>
                <span className="text-[10px] font-medium uppercase tracking-wide text-navy/45">
                  Pagamentos · acessos
                </span>
              </div>
              {falhaFaturas ? (
                <p className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
                  Não conseguimos abrir o seu histórico de pagamentos agora.
                  <button
                    type="button"
                    onClick={() => void faturas.refetch()}
                    className="rounded-md border border-terracotta/50 px-2 py-0.5 text-xs font-medium text-terracotta"
                  >
                    Tentar novamente
                  </button>
                </p>
              ) : temFatura && !previa ? (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-navy/75">Há movimentos disponíveis para consulta.</p>
                  <Link
                    to="/portal/faturas"
                    className="inline-flex rounded-lg border border-navy/15 bg-cream/60 px-3 py-1.5 text-xs text-navy hover:bg-cream"
                  >
                    Ver pagamentos já feitos
                  </Link>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-navy/20 bg-cream/60 px-4 py-5 text-center">
                  <p className="text-sm text-navy/70">Nenhum pagamento ou movimento listado ainda.</p>
                  <p className="mt-1 text-xs text-navy/50">
                    Histórico de acessos e faturas publicadas para você aparece neste bloco — sem
                    inventar lançamento.
                  </p>
                </div>
              )}
            </section>
          </div>
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
