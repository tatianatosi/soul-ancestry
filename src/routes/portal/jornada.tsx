import { createFileRoute } from "@tanstack/react-router";
import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { LinkPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { jornadaSanitizada } from "@/lib/portal-dados-vivos";

export const Route = createFileRoute("/portal/jornada")({
  head: () => ({
    meta: [
      { title: "Jornada — Portal Clube Ancestral" },
      {
        name: "description",
        content: "Linha do tempo do seu acompanhamento com o Clube Ancestral.",
      },
      { property: "og:title", content: "Jornada — Portal Clube Ancestral" },
      { property: "og:description", content: "Acompanhe as etapas da sua jornada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalJornada,
});

export function PortalJornada() {
  const { visibilidade, carregando } = useVisibilidade("jornada");
  const entrega = useVisibilidade("entrega");
  const fase1 = useVisibilidade("relatorio");
  const fase2 = useVisibilidade("fase02");
  const { data, isLoading, isError, error, refetch } = usePortalVivo();

  const abreJornada = (r: typeof entrega.visibilidade) =>
    r.navegavel && r.estado !== "hidden_by_permission" && r.estado !== "not_applicable";

  return (
    <PortalShell titulo={COPY_TELAS.jornada.titulo} descricao={COPY_TELAS.jornada.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <EstadoDados
          carregando={isLoading}
          erro={isError ? (error ?? true) : null}
          dados={data ? [data] : null}
          aoTentarNovamente={refetch}
          recurso="o seu acompanhamento"
        >
          {([vivo]) => {
            const jornada = jornadaSanitizada(vivo.projecoes, new Date(), vivo.proximaAcao);
            const destino = vivo.proximaAcao?.destino ?? null;
            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <p className="mb-4 rounded-lg border border-navy/10 bg-cream/60 p-3 text-sm text-navy/70">
                  <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/45">
                    {jornada.ritmo === "sem_publicacao"
                      ? "Aguardando primeira publicação"
                      : jornada.ritmo === "regular"
                        ? "Ritmo em dia"
                        : jornada.ritmo === "atencao"
                          ? "Próxima atualização em preparação"
                          : "Atualização em revisão"}
                  </span>
                  {jornada.proximoPasso}{" "}
                  {destino ? (
                    <LinkPortal to={destino} className="font-medium text-terracotta underline-offset-2 hover:underline">
                      Abrir
                    </LinkPortal>
                  ) : null}
                </p>
                {jornada.linha.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-navy/20 p-6 text-center text-sm text-navy/60">
                    {COPY_TELAS.jornada.vazio}
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {jornada.linha.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-3 rounded-lg border border-navy/10 bg-white p-3"
                      >
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                        <div>
                          <p className="text-sm font-medium text-navy">{item.tipoRotulo}</p>
                          <p className="text-sm text-navy/70">{item.conteudo}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                {(abreJornada(entrega.visibilidade) ||
                  abreJornada(fase1.visibilidade) ||
                  abreJornada(fase2.visibilidade)) && (
                  <p className="mt-4 text-[11px] text-navy/50">
                    Conteúdo publicado (rota profunda, não aba):{" "}
                    {abreJornada(entrega.visibilidade) ? (
                      <LinkPortal to="/portal/entregas" className="underline underline-offset-2 hover:text-navy/70">
                        Entregas
                      </LinkPortal>
                    ) : null}
                    {abreJornada(entrega.visibilidade) && abreJornada(fase1.visibilidade) ? " · " : null}
                    {abreJornada(fase1.visibilidade) ? (
                      <LinkPortal to="/portal/fase-01" className="underline underline-offset-2 hover:text-navy/70">
                        Relatório Fase 01
                      </LinkPortal>
                    ) : null}
                    {(abreJornada(entrega.visibilidade) || abreJornada(fase1.visibilidade)) &&
                    abreJornada(fase2.visibilidade)
                      ? " · "
                      : null}
                    {abreJornada(fase2.visibilidade) ? (
                      <LinkPortal to="/portal/fase-02" className="underline underline-offset-2 hover:text-navy/70">
                        Fase 02
                      </LinkPortal>
                    ) : null}
                  </p>
                )}
              </BlocoVisibilidade>
            );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
