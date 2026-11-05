import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Bloco Q01/Q08 (05/11/2026): a triagem roda num clone completo só por disparo manual e sem escrever no repositório. */
const wf = readFileSync(".github/workflows/triagem-branches.yml", "utf8");

describe("Q01 — fluxo manual de triagem", () => {
  it("só dispara manualmente (sem push, agenda ou PR)", () => {
    expect(wf).toContain("workflow_dispatch:");
    expect(wf).not.toMatch(/^\s*(push|schedule|pull_request|pull_request_target):/m);
  });

  it("permissão só de leitura e clone completo com todas as branches", () => {
    expect(wf).toMatch(/permissions:\n\s+contents: read\n/);
    expect(wf).not.toMatch(/:\s*write/);
    expect(wf).toContain("fetch-depth: 0");
    expect(wf).toContain("+refs/heads/*:refs/remotes/origin/*");
  });

  it("roda o script canônico de triagem, sem outro recuperador", () => {
    expect(wf).toContain("node scripts/triagem-branches-e-docs.mjs");
  });
});
