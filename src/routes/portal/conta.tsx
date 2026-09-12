import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { COPY_TELAS } from "@/lib/portal-copy";
import { CASO_DEMO_CODIGO, CLIENTE_DEMO_NOME } from "@/lib/portal-demo-sophia";
import { PortalShell, usePortal, PortalCarregando } from "@/components/portal/portal-shell";
import { usePreviaPortal } from "@/components/portal/fonte-portal";
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
    <div className="rounded-lg border border-navy/10 bg-cream/60 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">{rotulo}</p>
      <p className="mt-0.5 text-sm text-navy">{valor}</p>
    </div>
  );
}

export function PortalConta() {
  const previa = usePreviaPortal();
  const { visibilidade, carregando } = useVisibilidade("conta");
  const { data } = usePortal();
  const carregarFaturas = useServerFn(minhasFaturas);
  const faturas = useQuery({
    queryKey: ["portal-conta-faturas"],
    queryFn: () => carregarFaturas({}),
    retry: false,
    enabled: previa === null,
  });
  const temFatura = (faturas.data?.length ?? 0) > 0;
  const falhaFaturas = faturas.isError;

  const titular = data?.cliente?.nome ?? (previa ? CLIENTE_DEMO_NOME : null) ?? "—";
  const casosPortal = (data as { casos?: { codigo?: string | null }[] } | null)?.casos;
  const casoCodigo =
    casosPortal?.[0]?.codigo ?? (previa ? CASO_DEMO_CODIGO : null) ?? "—";
  const paisInteresse = data?.cliente?.pais_interesse ?? (previa ? "Itália" : null) ?? "—";
  const planoEstado = previa || data?.autorizado ? "Acompanhamento ativo" : "Aguardando publicação";

  return (
    <PortalShell titulo={COPY_TELAS.conta.titulo} descricao={COPY_TELAS.conta.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          <div className="space-y-4" data-aba-conta>
            <div
              data-conta-meta
              className="flex flex-wrap gap-2 rounded-xl border border-navy/10 bg-cream/50 px-4 py-3"
            >
              <Chip rotulo="Titular" valor={titular} />
              <Chip rotulo="Caso" valor={casoCodigo} />
              <Chip rotulo="Interesse" valor={paisInteresse} />
              <Chip rotulo="Acesso" valor="App Cliente" />
            </div>

            <section
              data-conta-perfil
              className="rounded-2xl border border-navy/10 bg-cream/50 p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-lg text-navy">Perfil</h2>
                <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                  Dados pessoais
                </span>
              </div>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-navy/10 bg-cream/60 p-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Titular</dt>
                  <dd className="text-sm text-navy">{titular}</dd>
                </div>
                <div className="rounded-lg border border-navy/10 bg-cream/60 p-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Caso vinculado</dt>
                  <dd className="font-mono text-sm text-navy">{casoCodigo}</dd>
                </div>
                <div className="rounded-lg border border-navy/10 bg-cream/60 p-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Preferência</dt>
                  <dd className="text-sm text-navy">{paisInteresse}</dd>
                </div>
                <div className="rounded-lg border border-navy/10 bg-cream/60 p-3">
                  <dt className="text-[11px] uppercase tracking-widest text-navy/50">Canal</dt>
                  <dd className="text-sm text-navy">Aplicativo do cliente</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-navy/55">
                Preferências de comunicação e convites familiares aparecem aqui quando a equipe
                libera o acesso.
              </p>
            </section>

            <section data-conta-plano className="rounded-2xl border border-navy/10 bg-cream/40 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-lg text-navy">Plano</h2>
                <span className="rounded-full border border-gold/40 bg-gold/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy">
                  {planoEstado}
                </span>
              </div>
              <p className="mt-2 text-sm text-navy/75">
                Acompanhamento do reconhecimento — SKU, preço técnico e gates internos não aparecem
                nesta tela. Detalhes do plano publicado pela equipe ficam neste bloco.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <Chip rotulo="Estado" valor={planoEstado} />
                <Chip rotulo="Publicação" valor={previa ? "Demo" : "Quando a equipe publica"} />
                <Chip rotulo="Escopo" valor="Caso vinculado" />
              </div>
            </section>

            <section data-conta-alertas className="rounded-2xl border border-navy/10 bg-cream/50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-lg text-navy">Alertas</h2>
                <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                  Pessoais do caso
                </span>
              </div>
              <div className="mt-3 rounded-xl border border-dashed border-navy/20 bg-cream/60 px-4 py-5 text-center">
                <p className="text-sm text-navy/70">Sem alerta publicado no momento.</p>
                <p className="mt-1 text-xs text-navy/50">
                  Documentos pendentes e próximas ações do seu caso aparecem aqui quando a equipe
                  publica um aviso sanitizado.
                </p>
              </div>
            </section>

            <section data-conta-historico className="rounded-2xl border border-navy/10 bg-cream/40 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-serif text-lg text-navy">Histórico</h2>
                <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
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
