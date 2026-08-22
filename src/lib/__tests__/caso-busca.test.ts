import { describe, expect, it } from "vitest";
import { mensagemResolucao, normalizarCodigo } from "@/lib/caso-busca";

describe("busca de caso por código canônico ou histórico", () => {
  it("normaliza o código digitado", () => {
    expect(normalizarCodigo("  ca-cid-at-fam-2026-001 ")).toBe("CA-CID-AT-FAM-2026-001");
    expect(normalizarCodigo("ca-aut-analuiza fam-2026-001")).toBe("CA-AUT-ANALUIZAFAM-2026-001");
    expect(normalizarCodigo("   ")).toBe("");
  });

  it("mensagem aponta sempre o código canônico quando resolveu por alias", () => {
    const msg = mensagemResolucao({
      caseId: "x",
      codigoCanonico: "CA-CID-AT-FAM-2026-001",
      titulo: "Projeto familiar — Ana Luiza",
      termo: "CA-AUT-ANALUIZA-FAM-2026-001",
      viaAlias: true,
      aliasUsado: "CA-AUT-ANALUIZA-FAM-2026-001",
    });
    expect(msg).toContain("CA-AUT-ANALUIZA-FAM-2026-001");
    expect(msg).toContain("CA-CID-AT-FAM-2026-001");
    expect(msg).not.toMatch(/duplicid|pendente/i);
  });

  it("mensagem direta não menciona alias", () => {
    const msg = mensagemResolucao({
      caseId: "x",
      codigoCanonico: "CA-CID-AT-FAM-2026-001",
      titulo: null,
      termo: "CA-CID-AT-FAM-2026-001",
      viaAlias: false,
      aliasUsado: null,
    });
    expect(msg).toBe("Caso canônico CA-CID-AT-FAM-2026-001 localizado.");
  });
});
