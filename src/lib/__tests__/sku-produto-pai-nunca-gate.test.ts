import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// ADENDO CANÔNICO — Pesquisa/Planejador/Produtos-pai (18-20/09/2026): SKU é
// legado/histórico; quem rege a jornada hoje é o Planejador de Cidadania e
// produtos-pai como categorização. "Produtos-pai/SKU nunca bloqueia" é
// absoluto, não só para a Proprietária.
//
// Achado: `pendenciaGate` (autoridade-operacional.ts) vira `confirmar` (não
// bloqueia) só para a Proprietária — para qualquer outro papel vira
// `bloquear` de verdade (decidirAcao, ramo "pendência" → bloquear quando
// !proprietaria). O gate de SKU não-homologado em produto-trilha.tsx
// bloqueava a equipe, só não bloqueava a Proprietária. Removido: a
// informação continua visível, mas nunca mais impede salvar.
//
// bloqueio-emissao-os.tsx foi investigado e NÃO precisou de mudança: o botão
// real "Emitir OS / Anexo I" (cadeia-operacional.tsx) já não depende do
// resultado da conciliação de catálogo — BloqueioEmissaoOS é só um aviso
// informativo, nunca desabilita o botão de emissão.

const componente = readFileSync("src/components/caso/produto-trilha.tsx", "utf8");
const cadeiaOperacional = readFileSync("src/components/contrato/cadeia-operacional.tsx", "utf8");

describe("SKU/produto-pai nunca bloqueia — produto-trilha.tsx", () => {
  it("'Salvar/Criar serviço do caso' não tem mais pendenciaGate", () => {
    const idx = componente.indexOf("<AcaoDeEscrita");
    const fimTag = componente.indexOf("/>", idx);
    const trecho = componente.slice(idx, fimTag);
    expect(trecho).not.toContain("pendenciaGate");
  });

  it("a informação de homologação continua visível, como texto, não como bloqueio", () => {
    expect(componente).toContain("ainda não está homologado no catálogo");
    expect(componente).toContain("contexto, não impede salvar");
  });

  it("SKU/produto-pai é citado como decisão da Proprietária no comentário, não como TODO", () => {
    expect(componente).toMatch(/SKU\/produto-pai é contexto comercial e legado.*nunca bloqueia/s);
  });
});

describe("SKU/produto-pai nunca bloqueia — emissão de OS (bloqueio-emissao-os.tsx) — comportamento preservado", () => {
  it("o botão real de emissão de OS não depende do resultado da conciliação de catálogo", () => {
    const idx = cadeiaOperacional.indexOf('Emitir OS / Anexo I (rascunho)');
    expect(idx).toBeGreaterThan(-1);
    const trecho = cadeiaOperacional.slice(Math.max(0, idx - 300), idx);
    expect(trecho).toContain("disabled={ocupado || !proposalId}");
    expect(trecho).not.toContain("pode_gerar_os");
    expect(trecho).not.toContain("resumoBloqueio");
  });

  it("BloqueioEmissaoOS continua renderizado só como aviso, separado do botão de emitir", () => {
    expect(cadeiaOperacional).toContain("<BloqueioEmissaoOS");
  });
});
