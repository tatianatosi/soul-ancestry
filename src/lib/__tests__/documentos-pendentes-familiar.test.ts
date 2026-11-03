import { describe, expect, it } from "vitest";
import { agruparPedidosPorFamiliar } from "@/lib/documentos-pendentes-familiar";

const p = (id: string, participante_nome: string | null, status: string) => ({
  id, titulo: id, status, obrigatorio: true, prazo: null, participante_nome,
});

describe("pendências documentais por familiar", () => {
  it("conta pendentes e concluídos por familiar e ignora cancelados", () => {
    const g = agruparPedidosPorFamiliar([
      p("a", "Adair", "aguardando"),
      p("b", "Adair", "aceito"),
      p("c", "Alice", "cancelado"),
      p("d", "Alice", "recusado"),
    ]);
    expect(g.find((x) => x.familiar === "Adair")).toMatchObject({ pendentes: 1, concluidos: 1 });
    expect(g.find((x) => x.familiar === "Alice")).toMatchObject({ pendentes: 1, concluidos: 0 });
    expect(g.find((x) => x.familiar === "Alice")!.pedidos).toHaveLength(1);
  });

  it("não inventa familiar quando o pedido não tem nome", () => {
    expect(agruparPedidosPorFamiliar([p("x", null, "aguardando")])[0].familiar).toBe("Familiar não registrado");
  });

  it("sem pedidos, nenhuma linha", () => {
    expect(agruparPedidosPorFamiliar([])).toEqual([]);
  });
});
