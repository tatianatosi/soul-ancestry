import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Primeira família inteira migrada de DSA-10 (Painel → CaCard canônico)
 * após as rotas isoladas: Privacidade — src/components/privacidade/
 * painel.tsx (5 blocos) + src/routes/_authenticated/privacidade.index.tsx
 * (1 bloco). Mesmo mecanismo mecânico dos cortes anteriores.
 */

const COMPONENTE = "src/components/privacidade/painel.tsx";
const ROTA = "src/routes/_authenticated/privacidade.index.tsx";
const componente = readFileSync(COMPONENTE, "utf8");
const rota = readFileSync(ROTA, "utf8");

describe("privacidade/painel.tsx — migrado para CaCard canônico", () => {
  it("não usa mais Painel de @/components/comercial/base", () => {
    expect(componente).not.toMatch(/<Painel[\s>]/);
    expect(componente).not.toContain("</Painel>");
    expect(componente).not.toMatch(/import\s*\{[^}]*\bPainel\b/);
  });

  it("importa CaCard e usa variante compacto nos 5 blocos", () => {
    expect(componente).toContain('import { CaCard } from "@/components/ui/ca-card";');
    expect(componente.match(/<CaCard variante="compacto"/g)?.length).toBe(5);
  });

  it("preserva os 5 rótulos (Documentos, Consentimentos, Exceções, Matriz, Eventos)", () => {
    expect(componente).toContain('titulo="Documentos do caso"');
    expect(componente).toContain('titulo="Consentimentos registrados"');
    expect(componente).toContain('titulo="Exceções formais"');
    expect(componente).toContain('titulo="Matriz de permissões deste caso"');
    expect(componente).toContain('titulo="Eventos recentes de documentos e consentimentos"');
  });
});

describe("privacidade.index.tsx — migrado para CaCard canônico", () => {
  it("não usa mais Painel de @/components/comercial/base", () => {
    expect(rota).not.toMatch(/<Painel[\s>]/);
    expect(rota).not.toContain("</Painel>");
    expect(rota).not.toMatch(/import\s*\{[^}]*\bPainel\b/);
  });

  it("importa CaCard e usa variante compacto no bloco Casos", () => {
    expect(rota).toContain('import { CaCard } from "@/components/ui/ca-card";');
    expect(rota).toContain('<CaCard variante="compacto" titulo="Casos">');
  });
});
