import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * §7 do De-Para (App — Documentos): quatro caixas com semântica distinta,
 * sem duplicar fonte.
 *
 *   1. Solicitados  → proximaAcao com destino /portal/documentos
 *   2. Recebidos    → envios (documents.origem === 'cliente')
 *   3. Liberados    → entregas (documents.liberado_cliente === true)
 *   4. Entregas     → material editorial (Legado): atalho para /portal/legado,
 *                     nunca lista duplicada de Liberados
 *
 * Corte de origem: `ab16bbee` (fix/app: A5 Documentos separa Liberados de
 * Entregas, sem fonte duplicada). Este teste trava a separação para que
 * uma refatoração futura não regrida silenciosamente.
 */

const ROTA = resolve(__dirname, "../../routes/portal/documentos.tsx");
const codigo = readFileSync(ROTA, "utf8");

describe("A5 Documentos — 4 caixas com fonte semântica exclusiva (§7 De-Para)", () => {
  it("Solicitados vem de proximaAcao com destino /portal/documentos", () => {
    expect(codigo).toContain("data-documentos-solicitados");
    expect(codigo).toMatch(/proximaAcao\?\.destino === "\/portal\/documentos"/);
  });

  it("Recebidos vem de data.envios (origem cliente), sem misturar com Liberados", () => {
    expect(codigo).toContain("data-documentos-recebidos");
    expect(codigo).toMatch(/const recebidos = noCaso\(data\?\.envios\)/);
  });

  it("Liberados vem de data.entregas (documents.liberado_cliente=true)", () => {
    expect(codigo).toContain("data-documentos-liberados");
    expect(codigo).toMatch(/const liberados_lista = noCaso\(data\?\.entregas\)/);
  });

  it("Entregas é atalho para /portal/legado, nunca lista duplicada", () => {
    expect(codigo).toContain("data-documentos-entregas");
    // atalho canônico via LinkPortal
    expect(codigo).toMatch(/to="\/portal\/legado"/);
    // sem lista renderizada dentro do bloco Entregas — a única lista de
    // documentos no arquivo é `liberados_lista.map`. Se aparecer .map em
    // outra variável dentro do bloco Entregas, é regressão de duplicação.
    const bloco = codigo.split("data-documentos-entregas")[1] ?? "";
    const fechamento = bloco.indexOf("</section>");
    const conteudoEntregas = fechamento > 0 ? bloco.slice(0, fechamento) : bloco;
    expect(conteudoEntregas).not.toMatch(/liberados_lista\.map/);
    expect(conteudoEntregas).not.toMatch(/recebidos\.map/);
    expect(conteudoEntregas).not.toMatch(/entregas\.map/);
  });

  it("Nunca soma duas listas para forjar contagem — checklist só soma liberados+enviados", () => {
    expect(codigo).toMatch(/const checklist = liberados \+ enviados/);
    // liberados vem do length de liberados_lista, enviados de recebidos —
    // duas fontes diferentes, nunca a mesma lista contada duas vezes.
    expect(codigo).toMatch(/const liberados = liberados_lista\.length/);
    expect(codigo).toMatch(/const enviados = recebidos\.length/);
  });

  it("Documenta o bloqueio CA_PORTAL_02 no cabeçalho da seção Entregas", () => {
    expect(codigo).toMatch(/BLOQUEIOS_CA_PORTAL_02/);
  });
});
