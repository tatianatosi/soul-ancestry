import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Reconciliação código × banco (02/11/2026).
 *
 * A auditoria de 25/10 achou, à mão, consultas que pediam tabela ou coluna que não existe no banco: o
 * erro era engolido (`data ?? []`) e a tela ficava vazia ou "não salvava". Esta trava faz o mesmo achado
 * de forma mecânica, sobre o esquema real (`types.ts`, gerado do banco): se alguém escrever de novo uma
 * consulta com tabela, coluna de select/filtro/escrita ou função (`rpc`) inexistente, o CI falha.
 */
describe("reconciliação código × banco", () => {
  it("nenhuma consulta usa tabela, coluna ou função que não existe no banco", () => {
    const saida = execFileSync(
      "node",
      ["scripts/reconciliar-codigo-banco.mjs", ".", "--sem-gravar"],
      {
        encoding: "utf8",
      },
    );
    const [resumo, ...achados] = saida.trim().split("\n");
    const { achados_unicos } = JSON.parse(resumo) as { achados_unicos: number };
    expect(
      achados_unicos,
      `Consulta com nome que não existe no banco:\n${achados.join("\n")}`,
    ).toBe(0);
  });

  it("os dois erros reais achados em 02/11/2026 ficaram corrigidos", () => {
    const docs = readFileSync("src/lib/documentos.functions.ts", "utf8");
    expect(docs).toContain('select("id,status:access_status,created_at")');
    const integ = readFileSync("src/lib/integracoes.functions.ts", "utf8");
    expect(integ).toContain("nome:full_name");
    expect(integ).not.toMatch(/\.select\("auth_user_id, nome, email/);
  });
});
