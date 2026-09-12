import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { CardIndicador, CarregandoDesk, VazioDesk, type TomEstado } from "@/components/desk/ui-desk";
import { listarFilaMicroentregas } from "@/lib/biblioteca-evidencias.functions";
import { APROVACOES } from "@/lib/biblioteca-evidencias";

const ORDEM = ["draft", "in_review", "approved", "published"] as const;
const TOM: Record<string, TomEstado> = { draft: "neutro", in_review: "atencao", approved: "sucesso", published: "sucesso" };

function rotulo(status: string) {
  return APROVACOES.find((i) => i.id === status)?.rotulo ?? status;
}

/**
 * Fila rascunho → revisão → aprovado → publicado lida das projeções reais
 * (app_projections) da organização. Não cria cópia nem publica nada.
 */
export function FilaPublicacaoReal() {
  const carregar = useServerFn(listarFilaMicroentregas);
  const q = useQuery({ queryKey: ["fila-microentregas"], queryFn: () => carregar() });

  return (
    <section className="rounded-xl border border-navy/10 bg-cream/50 p-4" aria-label="Fila de publicação">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg text-navy">Rascunho → revisão → aprovado → publicado</h2>
          <p className="mt-1 text-sm text-navy/65">
            Contagem real das microentregas registradas. A publicação para o App Cliente continua humana e sanitizada.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/microentregas">Abrir fila de Microentregas</Link>
        </Button>
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
        (q.data ?? []).length === 0 ? (
          <VazioDesk
            titulo="Nenhuma microentrega registrada"
            descricao="Quando uma projeção for criada a partir de evidência ou entrega, ela aparece aqui."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {ORDEM.map((status) => {
              const total = (q.data ?? []).filter((i) => i.status === status).length;
              return <CardIndicador key={status} rotulo={rotulo(status)} valor={total} apoio="Projeções reais" tom={total > 0 ? TOM[status] : "neutro"} />;
            })}
          </div>
        )
      ) : null}
    </section>
  );
}
