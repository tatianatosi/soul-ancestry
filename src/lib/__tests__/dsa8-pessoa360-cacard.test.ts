import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * DSA-8: terceiro consumidor real do Design System no Desk (DSA-1
 * `qualidade.tsx`, DSA-2 `painel.tsx`). Mesma regra: não cria componente
 * novo, só aplica `CaCard`/`EstadoVazio` já existentes às dez seções ad-hoc
 * (`<section className="rounded-xl border ...">`) da Pessoa 360 — sem mudar
 * fonte de dado nem writer.
 */
const ARQUIVO = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

describe("DSA-8 — CaCard e EstadoVazio aplicados à Pessoa 360", () => {
  it("importa CaCard e EstadoVazio dos módulos canônicos, não recria", () => {
    expect(ARQUIVO).toMatch(/import\s*\{\s*SaasShell,\s*useSaas,\s*EstadoVazio\s*\}\s*from\s*"@\/components\/saas\/shell"/);
    expect(ARQUIVO).toMatch(/import\s*\{\s*CaCard\s*\}\s*from\s*"@\/components\/ui\/ca-card"/);
  });

  it("nenhuma seção usa mais <section> ad-hoc — todas são CaCard", () => {
    // Onze desde 24/09/2026: "Achados de pesquisa" (genealogical_findings)
    // entrou como 11ª seção — ainda CaCard, nunca <section> ad-hoc de volta.
    expect(ARQUIVO).not.toMatch(/<section/);
    expect(ARQUIVO).not.toMatch(/<\/section>/);
    const abertas = ARQUIVO.match(/<CaCard/g) ?? [];
    const fechadas = ARQUIVO.match(/<\/CaCard>/g) ?? [];
    expect(abertas.length).toBe(11);
    expect(fechadas.length).toBe(11);
  });

  it("os data-attributes exigidos por outros testes continuam presentes", () => {
    expect(ARQUIVO).toContain("data-pessoa360-sinais");
    expect(ARQUIVO).toContain("data-pessoa360-sinal-prioridade");
    expect(ARQUIVO).toContain("data-relacoes-familiares-caso");
  });

  it("estados vazios honestos usam EstadoVazio, não <p> solto, nos pontos convertidos", () => {
    for (const mensagem of [
      "Nenhum sinal aberto para esta pessoa",
      "Nenhum caso aberto para esta pessoa.",
      "Esta pessoa não está vinculada a nenhum núcleo familiar.",
      "Nenhum vínculo de pai/mãe gravado para esta pessoa",
      "Nada foi publicado para o App Cliente nos casos desta pessoa ainda.",
      "Ainda não há fatos registrados na linha do tempo dos casos desta pessoa.",
    ]) {
      const idx = ARQUIVO.indexOf(mensagem);
      expect(idx, `mensagem ausente: ${mensagem}`).toBeGreaterThan(-1);
      expect(ARQUIVO.slice(Math.max(0, idx - 200), idx)).toContain("EstadoVazio");
    }
  });

  it("nenhuma fonte de dado ou writer foi trocado (mesmas queries/mutações)", () => {
    expect(ARQUIVO).toContain('queryKey: ["pessoa", clienteId]');
    expect(ARQUIVO).toContain("useServerFn(carregarPessoa)");
    expect(ARQUIVO).toContain("useServerFn(atualizarPessoa)");
    expect(ARQUIVO).toContain("useServerFn(salvarLeadDesk)");
  });

  it("o card de identidade preserva o formulário de edição e o botão Salvar", () => {
    const trecho = ARQUIVO.slice(ARQUIVO.indexOf('titulo="Quem é"'), ARQUIVO.indexOf('titulo="Sinais"'));
    expect(trecho).toContain("salvarComValidacao");
    expect(trecho).toContain("CAMPOS_FORM.map");
  });

  it("a seção de pesquisa genealógica interna preserva o estilo tracejado/restrito", () => {
    expect(ARQUIVO).toContain('className="border-dashed border-navy/20 bg-cream/20"');
  });
});
