import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Continuação de DSA-10 (Painel → CaCard canônico). Correção de escopo: a
 * rota qualidade.tsx nunca usou o Painel genérico — o único <Painel> ali
 * era um falso positivo de grep (PainelQualidade, componente próprio e
 * diferente). O uso real de Painel de @/components/comercial/base estava
 * em src/components/qualidade/painel.tsx (o componente PainelQualidade em
 * si), com 6 blocos. Mesmo mecanismo mecânico dos cortes anteriores.
 */

const ARQUIVO = "src/components/qualidade/painel.tsx";
const arquivo = readFileSync(ARQUIVO, "utf8");

describe("qualidade/painel.tsx (PainelQualidade) — migrado para CaCard canônico", () => {
  it("não usa mais o Painel genérico de @/components/comercial/base", () => {
    expect(arquivo).not.toMatch(/<Painel[\s>]/);
    expect(arquivo).not.toContain("</Painel>");
    expect(arquivo).not.toMatch(/import\s*\{[^}]*\bPainel\b/);
  });

  it("importa CaCard e usa variante compacto nos 6 blocos", () => {
    expect(arquivo).toContain('import { CaCard } from "@/components/ui/ca-card";');
    expect(arquivo.match(/<CaCard variante="compacto"/g)?.length).toBe(6);
  });

  it("preserva os 6 rótulos (Modelos por tipo/fase, Fase dinâmica, Inconsistências, Carga por responsável, Exportar CSV, Histórico)", () => {
    expect(arquivo).toContain('titulo="Modelos por tipo de serviço e fase"');
    expect(arquivo).toContain("titulo={`Fase: ${fase}`}");
    expect(arquivo).toContain('titulo="Inconsistências em aberto por severidade"');
    expect(arquivo).toContain('titulo="Carga por responsável"');
    expect(arquivo).toContain('titulo="Exportar em CSV"');
    expect(arquivo).toContain('titulo="Histórico de exportações"');
  });
});

describe("qualidade.tsx (a rota) — nunca usou Painel genérico, confirmado", () => {
  const rota = readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8");

  it("PainelQualidade continua um componente próprio, não o Painel de comercial/base", () => {
    expect(rota).toContain('import { PainelQualidade } from "@/components/qualidade/painel";');
    expect(rota).not.toMatch(/from "@\/components\/comercial\/base"[^;]*;\s*\n[\s\S]*<Painel[\s>]/);
  });
});
