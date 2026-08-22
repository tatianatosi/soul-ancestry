import { describe, expect, it } from "vitest";

import {
  ACOES_DEPENDENTES_DE_TERCEIROS,
  ACOES_SO_DA_PROPRIETARIA,
  CASO_ANA_CODIGO_CANONICO,
  CHECKLIST_MIGRACAO_BACKUP,
  CONFIRMACAO_LITERAL,
  DOMINIOS,
  INVENTARIO,
  MAPA_DE_PARA,
  MATRIZ_FONTES,
  MATRIZ_LACUNAS,
  STATUS_INVENTARIO,
  camadasFaltantes,
  contarPorStatus,
  estaCompleto,
  idsDuplicados,
} from "@/lib/inventario-patrimonial";

describe("inventário patrimonial", () => {
  it("não tem itens duplicados", () => {
    expect(idsDuplicados()).toEqual([]);
    expect(new Set(INVENTARIO.map((i) => i.nomeCanonico)).size).toBe(INVENTARIO.length);
  });

  it("cobre todos os domínios obrigatórios", () => {
    for (const dominio of DOMINIOS) {
      expect(INVENTARIO.some((i) => i.dominio === dominio)).toBe(true);
    }
  });

  it("usa apenas status do vocabulário fechado", () => {
    for (const item of INVENTARIO) {
      expect(STATUS_INVENTARIO).toContain(item.status);
    }
  });

  it("só marca COMPLETO quando as cinco camadas existem", () => {
    for (const item of INVENTARIO) {
      if (item.status === "COMPLETO") {
        expect(estaCompleto(item)).toBe(true);
        expect(camadasFaltantes(item)).toEqual([]);
      }
      if (!estaCompleto(item)) {
        expect(item.status).not.toBe("COMPLETO");
      }
    }
  });

  it("declara camada ausente para todo item placeholder ou sem instância", () => {
    for (const item of INVENTARIO.filter((i) => ["PLACEHOLDER", "SEM_INSTANCIA", "SEM_HOMOLOGACAO"].includes(i.status))) {
      expect(camadasFaltantes(item).length).toBeGreaterThan(0);
    }
  });

  it("mantém as decisões canônicas fechadas", () => {
    const ana = INVENTARIO.find((i) => i.id === "INV-015");
    expect(ana?.nomeCanonico).toContain("CA-CID-AT-FAM-2026-001");
    expect(CASO_ANA_CODIGO_CANONICO).toBe("CA-CID-AT-FAM-2026-001");
    const tasks = INVENTARIO.find((i) => i.nomeCanonico.includes("Tasks e Calendar"));
    expect(tasks?.status).toBe("FORA_DO_ESCOPO");
  });

  it("não chama catálogo, planejador, CRM e App Cliente de prontos", () => {
    const porId = (id: string) => INVENTARIO.find((i) => i.id === id)!;
    expect(porId("INV-011").status).toBe("PARCIAL");
    expect(porId("INV-012").status).toBe("SEM_INSTANCIA");
    expect(porId("INV-020").status).toBe("PARCIAL");
    expect(porId("INV-021").status).toBe("SEM_VALIDACAO_AUTENTICADA");
  });

  it("entrega as matrizes e listas fechadas", () => {
    expect(MAPA_DE_PARA.length).toBeGreaterThan(0);
    expect(MATRIZ_LACUNAS.some((l) => l.severidade === "critica")).toBe(true);
    expect(MATRIZ_FONTES.length).toBeGreaterThan(0);
    expect(CHECKLIST_MIGRACAO_BACKUP.length).toBeGreaterThan(0);
    expect(ACOES_SO_DA_PROPRIETARIA.length).toBeGreaterThan(0);
    expect(ACOES_DEPENDENTES_DE_TERCEIROS.every((a) => a.dependeDe.length > 0)).toBe(true);
  });

  it("itens dependentes de terceiros não são marcados como autonomia interna", () => {
    for (const item of INVENTARIO) {
      if (item.dependeDe.includes("advogado")) {
        expect(item.proprietariaPodeAgirInternamente).toBe(false);
      }
    }
  });

  it("mantém a confirmação literal", () => {
    expect(CONFIRMACAO_LITERAL).toContain("Nenhum item foi declarado completo apenas por existir virtualmente");
  });

  it("contagem por status soma o total do inventário", () => {
    const soma = Object.values(contarPorStatus()).reduce((a, b) => a + b, 0);
    expect(soma).toBe(INVENTARIO.length);
  });
});
