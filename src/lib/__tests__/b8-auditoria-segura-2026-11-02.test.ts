import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/producao-erros.server", () => ({ capturarErroProducao: vi.fn(async () => undefined) }));

import { registrarAuditoria } from "@/lib/auditoria-segura.server";
import { capturarErroProducao } from "@/lib/producao-erros.server";

function clienteQueResponde(error: { message?: string } | null) {
  const inserir = vi.fn(async () => ({ error }));
  return { cliente: { from: vi.fn(() => ({ insert: inserir })) }, inserir };
}

describe("B8: auditoria lê o erro e nunca falha calada", () => {
  it("devolve true quando o banco aceita e não aciona o coletor", async () => {
    const { cliente, inserir } = clienteQueResponde(null);
    expect(await registrarAuditoria(cliente, { acao: "teste" })).toBe(true);
    expect(cliente.from).toHaveBeenCalledWith("audit_logs");
    expect(inserir).toHaveBeenCalledWith({ acao: "teste" });
  });

  it("quando o banco recusa, devolve false, registra no coletor e NÃO lança", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { cliente } = clienteQueResponde({ message: "new row violates row-level security policy" });
    await expect(registrarAuditoria(cliente, { acao: "contrato_aprovado" })).resolves.toBe(false);
    expect(capturarErroProducao).toHaveBeenCalled();
  });

  it("se o próprio cliente lançar, também não derruba a ação já gravada", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const cliente = { from: () => ({ insert: async () => { throw new Error("rede"); } }) };
    await expect(registrarAuditoria(cliente as never, [{ acao: "a" }])).resolves.toBe(false);
  });
});

describe("B8: nenhuma gravação solta em audit_logs sobrou nos arquivos convertidos", () => {
  const arquivos = readdirSync("src/lib").filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
  it("os arquivos que usam o helper o importam", () => {
    for (const f of arquivos) {
      const s = readFileSync(`src/lib/${f}`, "utf8");
      if (/\bawait registrarAuditoria\(/.test(s) && !/function registrarAuditoria/.test(s)) {
        expect(s, f).toContain('from "@/lib/auditoria-segura.server"');
      }
    }
  });

  it("o coletor de erros não usa o helper (evita laço: falha de auditoria → coletor → auditoria)", () => {
    expect(readFileSync("src/lib/erro-no-banco.server.ts", "utf8")).not.toContain("registrarAuditoria(");
  });
});
