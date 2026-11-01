import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { CardIndicador, CarregandoDesk, VazioDesk, type TomEstado } from "@/components/desk/ui-desk";
import { contarEntregasPorEstado, listarFilaMicroentregas } from "@/lib/biblioteca-evidencias.functions";
import { APROVACOES } from "@/lib/biblioteca-evidencias";

const ORDEM = ["draft", "in_review", "approved", "published"] as const;
const TOM: Record<string, TomEstado> = { draft: "neutro", in_review: "atencao", approved: "sucesso", published: "sucesso" };
/** Estados equivalentes das entregas ao cliente (português ou inglês) por etapa da fila. */
const EQUIVALENTES: Record<(typeof ORDEM)[number], string[]> = {
  draft: ["draft", "rascunho"],
  in_review: ["in_review", "em_revisao", "revisao"],
  approved: ["approved", "aprovado", "aprovada"],
  published: ["published", "publicado", "publicada"],
};

function rotulo(status: string) {
  return APROVACOES.find((i) => i.id === status)?.rotulo ?? status;
}

/**
 * Fila rascunho → revisão → aprovado → publicado lida das projeções reais
 * (app_projections) da organização. Não cria cópia nem publica nada.
 * 21/10/2026: com `caseId`, filtra o caso e mostra também as entregas ao
 * cliente por estado (Caso 360, lote D, e visão interna do App) — só leitura.
 */
export function FilaPublicacaoReal({ caseId }: { caseId?: string } = {}) {
  const carregar = useServerFn(listarFilaMicroentregas);
  const contarEntregas = useServerFn(contarEntregasPorEstado);
  const q = useQuery({ queryKey: ["fila-microentregas"], queryFn: () => carregar() });
  const qEntregas = useQuery({
    queryKey: ["fila-entregas-por-estado", caseId],
    queryFn: () => contarEntregas({ data: { caseId } }),
    enabled: Boolean(caseId),
  });
  const itens = (q.data ?? []).filter((i) => !caseId || i.caseId === caseId);

  return (
    <section className="rounded-xl border border-navy/10 bg-cream/50 p-4" aria-label="Fila de publicação" data-fila-publicacao-real={caseId ? "caso" : "organizacao"}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg text-navy">Rascunho → revisão → aprovado → publicado</h2>
          <p className="mt-1 text-sm text-navy/65">
            {caseId
              ? "Contagem real deste caso. Somente leitura: a publicação para o App continua humana e sanitizada."
              : "Contagem real das microentregas registradas. A publicação para o App Cliente continua humana e sanitizada."}
          </p>
        </div>
        {caseId ? null : (
          <Button asChild variant="outline" size="sm">
            <Link to="/microentregas">Abrir fila de Microentregas</Link>
          </Button>
        )}
      </div>

      {q.isLoading ? <CarregandoDesk linhas={1} rotulo="Carregando fila editorial" /> : null}
      {q.isError ? (
        <div role="alert" className="rounded-lg border border-terracotta/40 bg-terracotta/5 p-3 text-sm text-terracotta">
          <p>Não foi possível ler a fila editorial. Isto é falha de leitura, não fila vazia.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void q.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : null}
      {!q.isLoading && !q.isError ? (
        caseId ? (
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-navy/55">Conteúdo para o App</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {ORDEM.map((status) => {
                const total = itens.filter((i) => i.status === status).length;
                return <CardIndicador key={status} rotulo={rotulo(status)} valor={total} apoio="Conteúdo do caso" tom={total > 0 ? TOM[status] : "neutro"} />;
              })}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-navy/55">Entregas ao cliente</p>
            {qEntregas.isLoading ? (
              <CarregandoDesk linhas={1} rotulo="Carregando entregas" />
            ) : qEntregas.isError ? (
              <p role="alert" className="text-sm text-terracotta">Não foi possível ler as entregas. Isto é falha de leitura, não ausência.</p>
            ) : Object.keys(qEntregas.data ?? {}).length === 0 ? (
              <p className="rounded-lg border border-navy/10 bg-card p-3 text-sm text-navy/60">Não registrado — nenhuma entrega ao cliente neste caso.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {ORDEM.map((status) => {
                  const total = EQUIVALENTES[status].reduce((s, k) => s + ((qEntregas.data ?? {})[k] ?? 0), 0);
                  return <CardIndicador key={status} rotulo={rotulo(status)} valor={total} apoio="Entregas do caso" tom={total > 0 ? TOM[status] : "neutro"} />;
                })}
              </div>
            )}
          </div>
        ) : itens.length === 0 ? (
          <VazioDesk
            titulo="Nenhuma microentrega registrada"
            descricao="Quando uma projeção for criada a partir de evidência ou entrega, ela aparece aqui."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {ORDEM.map((status) => {
              const total = itens.filter((i) => i.status === status).length;
              return <CardIndicador key={status} rotulo={rotulo(status)} valor={total} apoio="Projeções reais" tom={total > 0 ? TOM[status] : "neutro"} />;
            })}
          </div>
        )
      ) : null}
    </section>
  );
}
