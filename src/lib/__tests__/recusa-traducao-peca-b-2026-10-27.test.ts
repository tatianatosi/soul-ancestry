import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { traduzirRecusa } from "@/lib/recusa-traducao.server";
import { exigirLinhaGravada } from "@/lib/persistencia.server";

/**
 * Peça B do laudo "nada persiste" (#189, 27/10/2026): "Hoje a recusa chega
 * como texto cru do Postgres. Um mapa de raise → orientação, aplicado no
 * ponto único por onde as recusas já passam (persistencia.server.ts). Um
 * lugar, 692 recusas."
 *
 * O "um lugar" é o mecanismo (exigirLinhaGravada), não um mapa completo
 * dos 692 — só 3 entradas têm o texto exato verificado contra o trigger
 * vivo (pg_get_functiondef), as dos dois guards de ativação. As demais
 * 689 passam pelo mesmo hook sem alteração — nunca uma orientação
 * inventada para um RAISE EXCEPTION que não foi lido.
 */
describe("Peça B — tradutor de recusa, aplicado no ponto único", () => {
  it("recusa conhecida (fn_piloto_caso_guard) ganha orientação, sem perder o texto original", () => {
    const traduzida = traduzirRecusa(
      "Ativação operacional NO_GO. Bloqueios críticos abertos: Contrato assinado pendente.",
    );
    expect(traduzida).toContain("Ativação operacional NO_GO. Bloqueios críticos abertos:");
    expect(traduzida).toContain("Decisão da Proprietária");
  });

  it("recusa conhecida (fn_guard_ativacao) ganha orientação", () => {
    const traduzida = traduzirRecusa(
      "Ativação bloqueada. Requisitos pendentes: Contrato assinado.",
    );
    expect(traduzida).toContain("Ativação bloqueada. Requisitos pendentes:");
    expect(traduzida).toContain("case_activation_checks");
  });

  it("recusa desconhecida passa intacta — nunca inventa orientação", () => {
    const original = "Arquivamento exige motivo registrado.";
    expect(traduzirRecusa(original)).toBe(original);
  });

  it("exigirLinhaGravada aplica a tradução no erro do Postgres, sem tocar na mensagem de zero linhas", () => {
    expect(() =>
      exigirLinhaGravada(
        { error: { message: "Ativação operacional NO_GO. Bloqueios críticos abertos: X." } },
        "crm_casos",
      ),
    ).toThrowError(/Decisão da Proprietária/);

    // Zero linhas (nenhum res.error) continua com a mensagem própria, não passa por traduzirRecusa.
    expect(() => exigirLinhaGravada({ data: [] }, "crm_casos")).toThrowError(
      /nada foi gravado em crm_casos/,
    );
  });

  it("o ponto único é persistencia.server.ts — erroOuNadaGravado do GoLive delega para a mesma função", () => {
    const src = readFileSync("src/lib/golive-escritores.functions.ts", "utf8");
    expect(src).toContain("exigirLinhaGravada(r, tabela)");
  });
});
