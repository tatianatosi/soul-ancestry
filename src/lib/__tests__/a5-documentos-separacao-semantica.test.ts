import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * §7 do De-Para (App — Documentos): quatro caixas com semântica distinta,
 * sem duplicar fonte.
 *
 *   1. Solicitados  → proximaAcao com destino /portal/documentos / solicitacoesAbertas
 *   2. Recebidos    → envios (documents.origem === 'cliente')
 *   3. Conferência  → checklist consolidado (tom === 'analise')
 *   4. Liberados    → entregas (documents.liberado_cliente === true)
 *
 * Corte de origem: `ab16bbee` (fix/app: A5 Documentos separa Liberados de
 * Entregas, sem fonte duplicada). 26/10/2026 — Lovable (mockup17) trocou a
 * 4ª caixa, de "Entregas" (atalho sem fonte própria para Legado) para
 * "Conferência" (fonte própria: o checklist consolidado). Este teste trava
 * a separação atual para que uma refatoração futura não regrida silenciosamente.
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

  it("Conferência vem do checklist consolidado (tom analise), nunca lista duplicada", () => {
    expect(codigo).toContain("data-documentos-conferencia");
    const trechos = codigo.split("data-documentos-conferencia");
    // segunda ocorrência: a caixa do caminho "ao vivo" (a primeira é a prévia).
    const bloco = trechos[2] ?? trechos[1] ?? "";
    const fechamento = bloco.indexOf("</section>");
    const conteudo = fechamento > 0 ? bloco.slice(0, fechamento) : bloco;
    expect(conteudo).toMatch(/i\.tom === "analise"/);
    // sem lista renderizada dentro do bloco Conferência — nenhuma outra fonte é lida aqui.
    expect(conteudo).not.toMatch(/liberados_lista\.map/);
    expect(conteudo).not.toMatch(/recebidos\.map/);
  });

  it("Nunca soma duas listas para forjar contagem — agora não soma nada", () => {
    // 01/10/2026 — o Lovable foi além da regra: a caixa "Solicitados" deixou
    // de exibir contagem agregada e passou a mostrar o pedido real da equipe
    // (`solicitado`) ou um estado vazio honesto. Sem soma, não há o que forjar.
    expect(codigo).toMatch(/data-documentos-checklist/);
    expect(codigo).not.toMatch(/liberados\.length \+ enviados\.length/);
    // 26/10/2026 — o texto do vazio de Liberados agora vem de COPY_TELAS
    // (fonte única da copy), não de uma string inline.
    expect(codigo).toMatch(/COPY_TELAS\.documentos\.vazio/);
    // Sem contagem agregada, o que resta proteger é a exclusividade da fonte:
    // Liberados continua lendo `liberados_lista` (entregas do caso) e as
    // caixas Recebidos/Liberados (na prévia) continuam nos seus próprios
    // filtros de `docs`.
    expect(codigo).toMatch(/const liberados_lista = noCaso\(data\?\.entregas\)/);
    expect(codigo).toMatch(/docs\.filter\(\(d\) => d\.liberado_cliente\)/);
    expect(codigo).toMatch(/docs\.filter\(\(d\) => d\.origem === "cliente"\)/);
  });
});
