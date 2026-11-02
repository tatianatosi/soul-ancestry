import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// 02/11/2026: /api/saude passa a dizer se o servidor publicado fala com o banco, sem expor nenhum segredo.
const rota = readFileSync("src/routes/api/saude.ts", "utf8");

describe("/api/saude: sonda do banco", () => {
  it("devolve o veredito do banco além do commit publicado", () => {
    expect(rota).toContain("banco,");
    expect(rota).toContain("bancoOk:");
    expect(rota).toContain("projetoConfere");
    expect(rota).toContain("leituraDoServidor");
  });

  it("não devolve credencial: só veredito, e nunca coloca a credencial na resposta", () => {
    const corpo = rota.slice(
      rota.indexOf("JSON.stringify({"),
      rota.indexOf("}),", rota.indexOf("JSON.stringify({")),
    );
    expect(corpo).not.toMatch(/credencial\b(?!Serve)/);
    expect(corpo).not.toMatch(/chaveSecreta|apikey|Authorization/i);
  });

  it("guarda o resultado por 60 s e limita a espera, para a rota pública não gastar a credencial a cada acesso", () => {
    expect(rota).toContain("60_000");
    expect(rota).toContain("4000");
  });

  it("falha na sonda nunca derruba a rota: `ok` segue verdadeiro", () => {
    expect(rota).toMatch(/\.catch\(/);
    expect(rota).toContain("ok: true");
  });
});
