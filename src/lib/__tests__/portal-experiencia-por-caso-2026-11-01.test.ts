import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { experienciaIntegralDoCaso, NAO_REGISTRADO } from "@/lib/portal-experiencia-integral";
import { fallbackHonestoDoCaso } from "@/lib/portal-fallback-canonico";

const NOMES_DE_FAMILIA = /Ana Luiza|Adair|Alice|Felipe|Friedmann|Reimer|Klaus Becker|CA-CID-AT-FAM|2026-CB-0001|98838/;

describe("experiência integral por caso (Onda 1)", () => {
  it("os dois módulos não têm mais nome, valor ou contrato de família escritos no código", () => {
    for (const f of ["src/lib/portal-experiencia-integral.ts", "src/lib/portal-fallback-canonico.ts"]) {
      const src = readFileSync(f, "utf8");
      expect(src, f).not.toMatch(NOMES_DE_FAMILIA);
      expect(src, f).not.toMatch(/R\$ ?\d/);
      expect(src, f).not.toContain("saneamento-desk-app-v4");
    }
  });

  it("sem leitura do caso, tudo é 'Não registrado' e nada é inventado", () => {
    const e = fallbackHonestoDoCaso();
    expect(e.estado).toBe("vazio");
    expect(e.casoId).toBeNull();
    expect(e.etapa).toBeNull();
    expect(e.condicao).toBeNull();
    expect(e.documentosLiberados).toEqual([]);
    expect(e.ausencias.join(" ")).toContain(NAO_REGISTRADO);
  });

  it("usa só o que veio do caso: documentos liberados e condição vêm dos números do caso", () => {
    const e = experienciaIntegralDoCaso({
      casoAtivoId: "caso-x",
      etapa: { rotulo: "Pesquisa", posicao: 3, total: 8, fracao: 0.375 },
      proximaEntrega: null,
      documentos: [
        { id: "1", titulo: "Certidão A", liberado_cliente: true, liberado_em: "2026-10-01" },
        { id: "2", titulo: "Rascunho interno", liberado_cliente: false },
      ],
      historico: [],
      condicaoComercial: { assinaturas: 2, mensalCentavos: 50000, meses: 4, adultoCentavos: 200000, totalCentavos: 400000, moeda: "BRL" },
    });
    expect(e.casoId).toBe("caso-x");
    expect(e.documentosLiberados.map((d) => d.titulo)).toEqual(["Certidão A"]);
    expect(e.condicao?.responsaveis).toBe(2);
    expect(e.condicao?.total.replace(/\s/g, " ")).toMatch(/4\.000,00/);
    expect(e.estado).toBe("completo");
    expect(e.ausencias.join(" ")).toContain("Próxima entrega");
  });

  it("dois casos diferentes dão experiências diferentes (nada vaza de um para o outro)", () => {
    const base = { etapa: null, proximaEntrega: null, historico: [], condicaoComercial: null };
    const a = experienciaIntegralDoCaso({ ...base, casoAtivoId: "a", documentos: [{ id: "1", titulo: "Só do A", liberado_cliente: true }] });
    const b = experienciaIntegralDoCaso({ ...base, casoAtivoId: "b", documentos: [] });
    expect(a.documentosLiberados).toHaveLength(1);
    expect(b.documentosLiberados).toHaveLength(0);
  });
});
