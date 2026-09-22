import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { BLOQUEIOS_CA_PORTAL_02 } from "@/lib/portal-dados-vivos";

/**
 * §7 do De-Para (App — 05. Documentos) separa QUATRO estados que a tela nunca
 * pode fundir. Ao reler o corte anterior, achei que Liberados e Entregas
 * liam o MESMO array `entregas` — fusão que §7 proíbe. Corrigido: cada
 * seção lê a fonte do seu estado, e a caixa Entregas vira atalho canônico
 * para Legado enquanto client_deliverables não tem policy de portal.
 */
const arquivo = readFileSync("src/routes/portal/documentos.tsx", "utf8");

describe("as quatro caixas têm data-attribute próprio (§7 wireframe)", () => {
  it.each([
    "data-documentos-solicitados",
    "data-documentos-recebidos",
    "data-documentos-liberados",
    "data-documentos-entregas",
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
    expect(arquivo).toContain("Receber não é conferir");
  });

  it("Liberados vem de entregas (documents.liberado_cliente = true)", () => {
    expect(arquivo).toContain("noCaso(data?.entregas)");
    // A variável foi renomeada para deixar CLARO que não é o mesmo array
    // que a caixa "Entregas" da prancha 5/7 nomeia.
    expect(arquivo).toContain("liberados_lista.map((d)");
    expect(arquivo).toContain("liberados_lista.length === 0");
  });

  it("Liberados NÃO reusa a variável que se chamaria 'entregas'", () => {
    // Sinal explícito da separação: dentro da caixa Liberados, nenhum
    // `entregas.map(` ou `entregas.length` — teriam sido o bug antigo.
    const secao = arquivo.slice(
      arquivo.indexOf("data-documentos-liberados"),
      arquivo.indexOf("data-documentos-entregas"),
    );
    expect(secao).not.toMatch(/\bentregas\.length\b/);
    expect(secao).not.toMatch(/\bentregas\.map\(/);
  });

  it("Entregas é atalho canônico para Legado, com motivo declarado", () => {
    expect(arquivo).toContain('to="/portal/legado"');
    expect(arquivo).toContain("Cadernos, relatórios e narrativas");
    // Nenhuma lista fingida nesta caixa: nada de .map( dentro dela.
    const secao = arquivo.slice(
      arquivo.indexOf("data-documentos-entregas"),
      arquivo.indexOf("</section>", arquivo.indexOf("data-documentos-entregas")),
    );
    expect(secao).not.toMatch(/\.map\(/);
  });
});

describe("a decisão de linkar Entregas para Legado vem de bloqueio real, não escolha estética", () => {
  it("client_deliverables está declarada como sem policy de portal", () => {
    const bloqueio = BLOQUEIOS_CA_PORTAL_02.find(
      (b) => b.fonte === "public.client_deliverables",
    );
    expect(bloqueio).toBeDefined();
    expect(bloqueio!.motivo).toContain("não existe policy de portal");
  });

  it("o comentário do código aponta o catálogo de bloqueios como fonte da decisão", () => {
    // A rota do App não pode citar `client_deliverables` pelo nome — regra
    // travada por `ca05-cadencia-microentregas.test.ts`. A citação vai pelo
    // arquivo canônico onde o bloqueio está catalogado.
    expect(arquivo).toContain("portal-dados-vivos.ts");
    expect(arquivo).not.toContain("client_deliverables");
  });
});

describe("regras semânticas de §7 continuam explícitas na copy", () => {
  it("Recebido não é validado: a copy diz isso ao cliente", () => {
    expect(arquivo).toContain("Receber não é conferir");
  });

  it("Envio não desaparece do fluxo depois do post — o card mostra estado", () => {
    expect(arquivo).toContain("rotuloEstadoVivo(d.statusRotulo)");
  });
});
