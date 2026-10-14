import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({ Link: (p: { children: React.ReactNode }) => <a>{p.children}</a> }));

/*
 * 13/10/2026 — Pessoa 360 na composição da Prancha V4, com dado real e
 * sem parentesco suposto.
 */
const rota = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

describe("Pessoa 360 — prancha V4", () => {
  it("a composição abre a tela e a ficha completa fica logo abaixo", () => {
    expect(rota).toContain("<ComposicaoPessoa360V4 nome={nome} dados={{ cliente, casos, caseMembers, documentos }} />");
    expect(rota.indexOf("<ComposicaoPessoa360V4")).toBeLessThan(rota.indexOf("data-pessoa360-ficha-completa"));
  });

  it("desenha todos os cartões mesmo sem nenhum dado", async () => {
    const { ComposicaoPessoa360V4 } = await import("@/components/pessoa/composicao-pessoa360-v4");
    const html = renderToStaticMarkup(
      <ComposicaoPessoa360V4 nome="Pessoa Exemplo" dados={{ cliente: { id: "c" }, casos: [], caseMembers: [], documentos: [] }} />,
    );
    for (const m of ["identidade", "parentesco", "casos", "fontes", "localizacao", "confianca", "completude", "rede"]) {
      expect(html).toContain(`data-pessoa360-${m}`);
    }
    expect(html).toContain("Nenhuma fonte registrada");
    expect(html).toContain("pai não registrado");
  });

  it("parentesco só vem de pai_id/mae_id gravados, nunca do sobrenome", async () => {
    const { ComposicaoPessoa360V4 } = await import("@/components/pessoa/composicao-pessoa360-v4");
    const html = renderToStaticMarkup(
      <ComposicaoPessoa360V4
        nome="Ana Silva"
        dados={{
          cliente: { id: "c" },
          casos: [],
          caseMembers: [
            { id: "eu", cliente_id: "c", nome: "Ana Silva", pai_id: "p" },
            { id: "p", nome: "José Silva" },
            { id: "x", nome: "Maria Silva" },
          ],
          documentos: [
            { id: "d1", titulo: "Certidão", status: "aprovado" },
            { id: "d2", titulo: "Registro", status: "em_revisao" },
          ],
        }}
      />,
    );
    expect(html).toContain("José Silva");
    expect(html).toContain("mãe não registrada"); // Maria Silva não vira mãe pelo sobrenome
    expect(html).toContain("1 de 2 fonte(s) confirmada(s)");
  });
});
