import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * A1 Home — §3 linha 5 do De-Para: card "MICROENTREGA" (distinto de
 * "ACHADOS", linha 4). `microentregaPublicada` já existia e já era
 * testada em portal-dados-vivos.ts, mas nenhuma tela a consumia — este
 * corte só conecta, sem query nova (reusa `vivo.data?.projecoes`).
 */

const ROTA = resolve(__dirname, "../../routes/portal/index.tsx");
const codigo = readFileSync(ROTA, "utf8");

describe("A1 Home — card Microentrega conectado", () => {
  it("importa microentregaPublicada do módulo canônico", () => {
    expect(codigo).toMatch(/from "@\/lib\/portal-dados-vivos"/);
    expect(codigo).toContain("microentregaPublicada");
  });

  it("calcula a partir de vivo.data?.projecoes, sem query nova", () => {
    expect(codigo).toMatch(/microentregaPublicada\(vivo\.data\?\.projecoes \?\? \[\]\)/);
  });

  it("passa microentrega para as duas chamadas de PainelHomeMockup (prévia e caso real)", () => {
    const ocorrencias = codigo.match(/microentrega=\{microentrega\}/g) ?? [];
    expect(ocorrencias.length).toBe(2);
  });

  it("marca o bloco com data-microentrega-home", () => {
    expect(codigo).toContain("data-microentrega-home");
  });

  it("mostra estado vazio honesto 'Nenhuma publicação nova', não lista duplicada de achados", () => {
    expect(codigo).toMatch(/Nenhuma publicação nova/);
  });

  it("card de microentrega renderiza tipoRotulo/conteudo, não reaproveita o card de achado", () => {
    const bloco = codigo.slice(codigo.indexOf("data-microentrega-home"));
    const fimSecao = bloco.indexOf("</section>");
    const trecho = bloco.slice(0, fimSecao);
    expect(trecho).toContain("microentrega.tipoRotulo");
    expect(trecho).toContain("microentrega.conteudo");
  });
});
