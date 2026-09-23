import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

import { progressoPorFrente, ROTULO_FRENTE } from "@/lib/caso-ficha";

/**
 * D4 Caso 360 — §14 linha 5 do De-Para: "Progresso por frente —
 * Formalização, Pesquisa, Documentos, Publicação | concluída / em
 * andamento / em coleta / inicial. Não usar percentual sem fórmula
 * documentada."
 *
 * Cada frente deriva de dado já canônico usado em outro card do mesmo
 * Caso 360 (contrato_assinado, estadoDossieDoCaso, documentos_minimos_ok,
 * estadoPublicacao) — função pura testável sem mock de rede.
 */

describe("progressoPorFrente — função pura", () => {
  const base = {
    contratoAssinado: false,
    dossie: { confirmados: 0, emRevisao: 0, pendentes: 0, total: 0 },
    documentosMinimosOk: false,
    documentosRegistrados: 0,
    publicacao: { publicadas: 0, pendentes: 0, arquivadas: 0 },
  };

  it("Formalização concluída quando contrato assinado, inicial quando não", () => {
    expect(progressoPorFrente({ ...base, contratoAssinado: true }).formalizacao).toBe("concluida");
    expect(progressoPorFrente({ ...base, contratoAssinado: false }).formalizacao).toBe("inicial");
  });

  it("Pesquisa: inicial sem evidência, em_coleta só com pendente, concluída com tudo confirmado", () => {
    expect(progressoPorFrente(base).pesquisa).toBe("inicial");
    expect(
      progressoPorFrente({ ...base, dossie: { confirmados: 0, emRevisao: 0, pendentes: 3, total: 3 } }).pesquisa,
    ).toBe("em_coleta");
    expect(
      progressoPorFrente({ ...base, dossie: { confirmados: 3, emRevisao: 0, pendentes: 0, total: 3 } }).pesquisa,
    ).toBe("concluida");
    expect(
      progressoPorFrente({ ...base, dossie: { confirmados: 1, emRevisao: 1, pendentes: 1, total: 3 } }).pesquisa,
    ).toBe("em_andamento");
  });

  it("Documentos nunca usa em_andamento — só inicial/em_coleta/concluida (gate é booleano só)", () => {
    expect(progressoPorFrente(base).documentos).toBe("inicial");
    expect(progressoPorFrente({ ...base, documentosRegistrados: 2 }).documentos).toBe("em_coleta");
    expect(progressoPorFrente({ ...base, documentosMinimosOk: true }).documentos).toBe("concluida");
  });

  it("Publicação: inicial sem nenhum item, em_andamento com pendente, concluída sem pendente", () => {
    expect(progressoPorFrente(base).publicacao).toBe("inicial");
    expect(
      progressoPorFrente({ ...base, publicacao: { publicadas: 0, pendentes: 2, arquivadas: 0 } }).publicacao,
    ).toBe("em_andamento");
    expect(
      progressoPorFrente({ ...base, publicacao: { publicadas: 3, pendentes: 0, arquivadas: 1 } }).publicacao,
    ).toBe("concluida");
  });

  it("ROTULO_FRENTE cobre os 4 estados", () => {
    expect(Object.keys(ROTULO_FRENTE).sort()).toEqual(
      ["concluida", "em_andamento", "em_coleta", "inicial"].sort(),
    );
  });
});

describe("D4 · Caso 360 renderiza Progresso por frente sem query nova", () => {
  const rota = readFileSync(
    resolve(__dirname, "../../routes/_authenticated/casos.$caseId.index.tsx"),
    "utf8",
  );

  it("importa progressoPorFrente/ROTULO_FRENTE do módulo canônico", () => {
    expect(rota).toMatch(/from "@\/lib\/caso-ficha"/);
    expect(rota).toContain("progressoPorFrente");
    expect(rota).toContain("ROTULO_FRENTE");
  });

  it("reusa qPesquisa/qDocumentos/qVisaoCliente/caso já carregados, sem useQuery novo no bloco", () => {
    const idx = rota.indexOf("data-caso360-progresso-frente");
    const trecho = rota.slice(Math.max(0, idx - 1200), idx);
    expect(trecho).toContain("estadoDossieDoCaso(qPesquisa.data?.evidencias");
    expect(trecho).toContain('caso["contrato_assinado"]');
    expect(trecho).toContain('caso["documentos_minimos_ok"]');
    expect(trecho).toContain("qVisaoCliente.data?.estadoPublicacao");
    expect(trecho).not.toContain("useQuery(");
  });

  it("marca as 4 frentes com data-caso360-frente", () => {
    expect(rota).toMatch(/data-caso360-frente=\{chave\}/);
  });

  it("as 4 frentes aparecem na ordem do wireframe: Formalização, Pesquisa, Documentos, Publicação", () => {
    const idx = rota.indexOf("data-caso360-progresso-frente");
    const trecho = rota.slice(idx, idx + 1200);
    const ordem = ["Formalização", "Pesquisa", "Documentos", "Publicação"];
    let posAnterior = -1;
    for (const rotulo of ordem) {
      const pos = trecho.indexOf(`"${rotulo}"`);
      expect(pos).toBeGreaterThan(posAnterior);
      posAnterior = pos;
    }
  });
});
