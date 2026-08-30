import { describe, expect, it } from "vitest";

import { detectarDuplicidades, type NucleoParaComparar } from "@/lib/nucleo-duplicidade";

function nucleo(overrides: Partial<NucleoParaComparar>): NucleoParaComparar {
  return {
    id: "id",
    nome: "Núcleo",
    dossie_mae: null,
    contratante_nome: null,
    dossie_status: null,
    status: "ativo",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    case_id: null,
    caso: null,
    membros: [],
    ...overrides,
  };
}

describe("detectarDuplicidades — Fase 1 (Detecção) da unificação de núcleos", () => {
  it("não sugere nada quando não há nenhum sinal em comum", () => {
    const a = nucleo({ id: "a", nome: "Família Silva" });
    const b = nucleo({ id: "b", nome: "Família Costa" });
    expect(detectarDuplicidades([a, b])).toEqual([]);
  });

  it("marca confiança alta quando os dois núcleos apontam para o mesmo caso", () => {
    const a = nucleo({ id: "a", case_id: "caso-1" });
    const b = nucleo({ id: "b", case_id: "caso-1" });
    const [c] = detectarDuplicidades([a, b]);
    expect(c.confianca).toBe("alta");
    expect(c.motivos).toContain("Os dois núcleos apontam para o mesmo caso.");
  });

  it("marca confiança alta quando duas ou mais pessoas de nome completo coincidem", () => {
    const a = nucleo({ id: "a", membros: [{ nome: "João Pedro Silva" }, { nome: "Maria Costa Silva" }] });
    const b = nucleo({ id: "b", membros: [{ nome: "João Pedro Silva" }, { nome: "Maria Costa Silva" }] });
    const [c] = detectarDuplicidades([a, b]);
    expect(c.confianca).toBe("alta");
    expect(c.pessoasEmComum).toEqual(["joao pedro silva", "maria costa silva"]);
  });

  it("marca confiança média quando só uma pessoa de nome completo coincide", () => {
    const a = nucleo({ id: "a", membros: [{ nome: "João Pedro Silva" }] });
    const b = nucleo({ id: "b", membros: [{ nome: "João Pedro Silva" }, { nome: "Outra Pessoa Distinta" }] });
    const [c] = detectarDuplicidades([a, b]);
    expect(c.confianca).toBe("media");
  });

  it("ignora primeiro nome isolado em comum para não gerar falso positivo", () => {
    const a = nucleo({ id: "a", nome: "Família Silva", membros: [{ nome: "Ana" }] });
    const b = nucleo({ id: "b", nome: "Família Costa", membros: [{ nome: "Ana" }] });
    expect(detectarDuplicidades([a, b])).toEqual([]);
  });

  it("marca confiança alta quando o nome do contratante é igual, ignorando acento e caixa", () => {
    const a = nucleo({ id: "a", contratante_nome: "José da Silva" });
    const b = nucleo({ id: "b", contratante_nome: "JOSE DA SILVA" });
    const [c] = detectarDuplicidades([a, b]);
    expect(c.confianca).toBe("alta");
    expect(c.motivos).toContain("Mesmo nome de contratante registrado nos dois núcleos.");
  });

  it("nunca compara núcleo arquivado", () => {
    const a = nucleo({ id: "a", status: "arquivado", case_id: "caso-1" });
    const b = nucleo({ id: "b", case_id: "caso-1" });
    expect(detectarDuplicidades([a, b])).toEqual([]);
  });

  it("nunca decide nem funde: todo candidato sai com status 'sugerido'", () => {
    const a = nucleo({ id: "a", case_id: "caso-1" });
    const b = nucleo({ id: "b", case_id: "caso-1" });
    const [c] = detectarDuplicidades([a, b]);
    expect(c.status).toBe("sugerido");
  });

  it("ordena candidatos por confiança, da alta para a baixa", () => {
    const a = nucleo({ id: "a", nome: "Dossiê Alpha", case_id: "caso-1" });
    const b = nucleo({ id: "b", nome: "Dossiê Alpha", case_id: "caso-1" });
    const x = nucleo({ id: "x", membros: [{ nome: "Pedro Henrique Lima" }] });
    const y = nucleo({ id: "y", membros: [{ nome: "Pedro Henrique Lima" }, { nome: "Sem Relação Nenhuma" }] });
    const candidatos = detectarDuplicidades([x, y, a, b]);
    expect(candidatos[0]!.confianca).toBe("alta");
    expect(candidatos[candidatos.length - 1]!.confianca).not.toBe("alta");
  });
});
