import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { painelAtendimento } from "@/lib/portal-atendimento.functions";
import {
  agruparPedidosPorFamiliar,
  pedidoPendente,
  rotuloStatusPedido,
  type PedidoDocumental,
} from "@/lib/documentos-pendentes-familiar";

/** Pendências documentais por familiar, lidas dos pedidos canônicos do caso. */
export function PendenciasDocumentaisFamiliar({ casoId }: { casoId: string }) {
  const carregar = useServerFn(painelAtendimento);
  const q = useQuery({
    queryKey: ["pendencias-documentais-familiar", casoId],
    queryFn: () => carregar({ data: { casoId } }),
  });

  if (q.isLoading) return <p className="text-xs text-navy/60">Carregando pedidos de documentos…</p>;
  if (q.isError)
    return (
      <p className="text-xs text-terracota" role="alert">
        Não foi possível carregar os pedidos de documentos.{" "}
        <button className="underline" onClick={() => void q.refetch()}>Tentar novamente</button>
      </p>
    );

  const pedidos = (((q.data as any)?.solicitacoes ?? []) as PedidoDocumental[]);
  const grupos = agruparPedidosPorFamiliar(pedidos);
  const totalPendentes = grupos.reduce((s, g) => s + g.pendentes, 0);

  return (
    <section data-pendencias-familiar className="mb-4 rounded-xl border border-navy/10 p-3">
      <h3 className="font-serif text-lg text-navy">Pendências por familiar</h3>
      <p className="text-xs text-navy/60">
        {grupos.length
          ? `${totalPendentes} pedido(s) ainda pendente(s) antes da aprovação.`
          : "Não registrado: nenhum pedido de documento foi lançado para este caso."}
      </p>
      <ul className="mt-3 space-y-3">
        {grupos.map((g) => (
          <li key={g.familiar} className="rounded-lg border border-navy/10 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-navy">{g.familiar}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${g.pendentes ? "bg-terracota/10 text-terracota" : "bg-navy/5 text-navy"}`}
              >
                {g.pendentes ? `${g.pendentes} pendente(s)` : "Concluído"} · {g.concluidos}/{g.pedidos.length} validado(s)
              </span>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {g.pedidos.map((p) => (
                <li key={p.id} className="flex flex-wrap justify-between gap-x-3">
                  <span className="min-w-0 break-words text-navy">
                    {p.titulo ?? "Pedido sem título"}
                    {p.obrigatorio ? " · obrigatório" : ""}
                  </span>
                  <span className={`text-xs ${pedidoPendente(p) ? "text-terracota" : "text-navy/60"}`}>
                    {rotuloStatusPedido(p.status)}
                    {p.prazo ? ` · prazo ${new Date(p.prazo).toLocaleDateString("pt-BR")}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
