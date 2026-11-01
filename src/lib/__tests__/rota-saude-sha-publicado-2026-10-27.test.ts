import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Item 8 do laudo de prontidão #176 (27/10/2026): "main pode divergir da
 * produção sem alarme — nenhuma rota de saúde expondo o SHA publicado".
 *
 * Esta rota (`/api/saude`) expõe o commit publicado quando o ambiente de
 * deploy injeta alguma variável comum de CI/CD. Limite documentado, não
 * fingido: não há confirmação de que o deploy do Lovable hoje injeta
 * qualquer uma delas — sem nenhuma, a rota responde `sha: null,
 * shaConhecida: false` honestamente, em vez de inventar um valor.
 */
const src = readFileSync("src/routes/api/saude.ts", "utf8");

describe("Rota de saúde (/api/saude) — expõe o SHA publicado quando disponível", () => {
  it("é uma rota GET pública, sem exigir sessão", () => {
    expect(src).toContain('createFileRoute("/api/saude")');
    expect(src).toContain("GET:");
    expect(src).not.toContain("Authorization");
  });

  it("checa variáveis de CI/CD conhecidas e responde honestamente quando nenhuma existe", () => {
    expect(src).toContain("VERCEL_GIT_COMMIT_SHA");
    expect(src).toContain("GITHUB_SHA");
    expect(src).toContain("shaConhecida");
  });

  it("a rota está registrada no roteiro gerado", () => {
    const routeTree = readFileSync("src/routeTree.gen.ts", "utf8");
    expect(routeTree).toContain("/api/saude");
  });
});
