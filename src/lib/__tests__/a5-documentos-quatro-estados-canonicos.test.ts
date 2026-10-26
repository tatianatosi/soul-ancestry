import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * §7 do De-Para (App — 05. Documentos) separa QUATRO estados que a tela nunca
 * pode fundir. Cada seção lê a fonte exata do seu estado.
 *
 * 26/10/2026 — Lovable (mockup17) reformulou a tela: a caixa "Entregas"
 * (atalho canônico para Legado, sem fonte própria aqui) saiu; entrou
 * "Conferência", que lê o checklist consolidado (tom "analise") — um estado
 * real da família, não um placeholder. As outras três caixas mantiveram a
 * fonte exclusiva de antes.
 */
const arquivo = readFileSync("src/routes/portal/documentos.tsx", "utf8");

describe("as quatro caixas têm data-attribute próprio (§7 wireframe)", () => {
  it.each([
    "data-documentos-solicitados",
    "data-documentos-recebidos",
    "data-documentos-conferencia",
    "data-documentos-liberados",
  ])("%s existe", (attr) => {
    expect(arquivo).toContain(attr);
  });
});

describe("cada caixa lê a fonte do seu estado, sem fundir", () => {
  it("Solicitados vem de proximaAcao com destino /portal/documentos", () => {
    expect(arquivo).toContain('proximaAcao?.destino === "/portal/documentos"');
  });

  it("Recebidos vem de envios (documents.origem = cliente)", () => {
    expect(arquivo).toContain("noCaso(data?.envios)");
    expect(arquivo).toContain("enquanto a equipe os confere");
  });

  it("Conferência vem do checklist consolidado (tom analise), fonte própria", () => {
    const secao = arquivo.slice(
      arquivo.lastIndexOf("data-documentos-conferencia"),
      arquivo.indexOf("</section>", arquivo.lastIndexOf("data-documentos-conferencia")),
    );
    expect(secao).toMatch(/checklist\?\.itens.*filter\(\(i\) => i\.tom === "analise"\)/);
    // Sem lista de documentos renderizada aqui — nenhuma das outras fontes é lida nesta caixa.
    expect(secao).not.toMatch(/\bliberados_lista\.map\(/);
    expect(secao).not.toMatch(/\brecebidos\.map\(/);
  });

  it("Liberados vem de entregas (documents.liberado_cliente = true)", () => {
    expect(arquivo).toContain("noCaso(data?.entregas)");
    // A variável foi renomeada para deixar CLARO que não é a mesma lista da
    // antiga caixa "Entregas" da prancha 5/7 (que não existe mais na tela).
    expect(arquivo).toContain("liberados_lista.map((d)");
    expect(arquivo).toContain("liberados_lista.length === 0");
  });

  it("Liberados não lê a fonte de Recebidos nem de Conferência", () => {
    const secao = arquivo.slice(
      arquivo.lastIndexOf("data-documentos-liberados"),
      arquivo.length,
    );
    expect(secao).not.toMatch(/\brecebidos\.map\(/);
  });
});

describe("regras semânticas de §7 continuam explícitas na copy", () => {
  it("Recebido comunica conferência sem tom de erro", () => {
    expect(arquivo).toContain("enquanto a equipe os confere");
  });

  it("Envio não desaparece do fluxo depois do post — o card mostra estado", () => {
    expect(arquivo).toContain("rotuloEstadoVivo(d.statusRotulo)");
  });
});
