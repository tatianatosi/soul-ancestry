import { STATUS_SOLICITACAO } from "@/lib/atendimento";

/**
 * Agrupa os pedidos documentais canônicos (portal_document_requests) por
 * familiar, para a Proprietária conferir o que falta antes de aprovar.
 * Leitura pura: sem pedido registrado, nada é inferido.
 */
export type PedidoDocumental = {
  id: string;
  titulo: string | null;
  status: string | null;
  obrigatorio: boolean | null;
  prazo: string | null;
  participante_nome: string | null;
};

const ROTULO: Record<string, string> = {
  ...STATUS_SOLICITACAO,
  aguardando: "Aguardando o cliente",
  recebido: "Recebido, a conferir",
  em_revisao: "Em revisão",
};

/** Estados que ainda impedem considerar o pedido resolvido. */
const PENDENTES = new Set(["aguardando", "pendente", "recebido", "enviado", "em_revisao", "recusado"]);

export function rotuloStatusPedido(status: string | null): string {
  return (status && ROTULO[status]) || "Status não registrado";
}

export function pedidoPendente(p: PedidoDocumental): boolean {
  return PENDENTES.has(p.status ?? "");
}

export type GrupoFamiliar = {
  familiar: string;
  pedidos: PedidoDocumental[];
  pendentes: number;
  concluidos: number;
};

export function agruparPedidosPorFamiliar(pedidos: PedidoDocumental[]): GrupoFamiliar[] {
  const mapa = new Map<string, PedidoDocumental[]>();
  for (const p of pedidos) {
    if (p.status === "cancelado") continue;
    const nome = p.participante_nome?.trim() || "Familiar não registrado";
    mapa.set(nome, [...(mapa.get(nome) ?? []), p]);
  }
  return [...mapa.entries()]
    .map(([familiar, lista]) => ({
      familiar,
      pedidos: lista,
      pendentes: lista.filter(pedidoPendente).length,
      concluidos: lista.filter((p) => p.status === "aceito").length,
    }))
    .sort((a, b) => b.pendentes - a.pendentes || a.familiar.localeCompare(b.familiar, "pt-BR"));
}
