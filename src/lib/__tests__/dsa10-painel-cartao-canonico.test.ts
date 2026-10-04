import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * DSA-10 (23/09/2026, autorização explícita da Proprietária): primeira
 * etapa real da iniciativa governada Painel → Cartão Canônico.
 *
 * Não é troca isolada de um arquivo: `CaCard` (@/components/ui/ca-card)
 * ganha `variante="compacto"`, reproduzindo exatamente a superfície visual
 * que `Painel` (@/components/comercial/base) sempre teve. `Painel` vira um
 * adapter fino sobre o componente canônico — API e renderização
 * preservadas para os ~30 consumidores ainda não migrados. Só a família
 * contratual (as duas telas irmãs de preparação de contrato + os 13
 * componentes `contrato/*` que elas compõem e que usavam `Painel` como
 * wrapper de seção) migra nesta rodada para chamar `CaCard` diretamente.
 * CRM, Pesquisa, Privacidade, Ops e Financeiro não são tocados.
 */

const caCard = readFileSync("src/components/ui/ca-card.tsx", "utf8");
const base = readFileSync("src/components/comercial/base.tsx", "utf8");

const FAMILIA_CONTRATUAL = [
  "src/routes/_authenticated/contrato-parametros.$id.tsx",
  "src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx",
  "src/components/contrato/anexos-aplicaveis.tsx",
  "src/components/contrato/cadeia-operacional.tsx",
  "src/components/contrato/cadeia-formalizacao.tsx",
  "src/components/contrato/ficha-governanca.tsx",
  "src/components/contrato/planejador-operacional.tsx",
  "src/components/contrato/matriz-juridica-preparacao.tsx",
  "src/components/contrato/conflito-coerencia.tsx",
  "src/components/contrato/painel-instrumentos.tsx",
  "src/components/contrato/estrutura-familiar.tsx",
  "src/components/contrato/regra-comercial.tsx",
  "src/components/contrato/painel-bloqueios.tsx",
  "src/components/contrato/escopo-proposta.tsx",
  "src/components/contrato/painel-preparacao.tsx",
];

describe("DSA-10 — CaCard ganha variante canônica (padrao/compacto)", () => {
  it("expõe os slots exigidos: titulo, eyebrow, acao, className, children, variante", () => {
    expect(caCard).toMatch(/titulo\?:\s*string/);
    expect(caCard).toMatch(/eyebrow\?:\s*string/);
    expect(caCard).toMatch(/acao\?:\s*ReactNode/);
    expect(caCard).toMatch(/className\?:\s*string/);
    expect(caCard).toMatch(/variante\?:\s*VarianteCaCard/);
  });

  it("a variante padrao continua com a mesma superfície visual de sempre (sem regressão)", () => {
    expect(caCard).toContain("rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5");
  });

  it("a variante compacto reproduz exatamente a superfície visual que Painel sempre teve", () => {
    expect(caCard).toContain("rounded-xl border border-navy/10 bg-cream/40 p-4");
    const inicio = caCard.indexOf('variante === "compacto"');
    const fim = caCard.indexOf("return (", caCard.indexOf("return (", inicio) + 1);
    const trechoCompacto = caCard.slice(inicio, fim);
    expect(trechoCompacto).toContain('className="font-serif text-lg"');
    expect(trechoCompacto).toContain('className="mt-3"');
  });
});

describe("DSA-10 — Painel é adapter compatível de CaCard, nenhum import quebra", () => {
  it("Painel continua exportado com a mesma assinatura (titulo, children)", () => {
    expect(base).toMatch(/export function Painel\(\{\s*titulo,\s*children\s*\}:\s*\{\s*titulo:\s*string;\s*children:\s*ReactNode\s*\}\)/);
  });

  it("Painel delega para CaCard variante compacto — não tem markup próprio", () => {
    const trecho = base.slice(base.indexOf("export function Painel"));
    expect(trecho).toContain("<CaCard titulo={titulo} variante=\"compacto\">");
    expect(trecho).not.toContain("rounded-xl border border-navy/10");
  });

  it("Painel importa CaCard do módulo canônico", () => {
    expect(base).toContain('import { CaCard } from "@/components/ui/ca-card";');
  });
});

describe("DSA-10 — família contratual migrada, nenhum arquivo mais importa Painel", () => {
  for (const arquivo of FAMILIA_CONTRATUAL) {
    it(`${arquivo} não importa mais Painel de comercial/base`, () => {
      const codigo = readFileSync(arquivo, "utf8");
      expect(codigo).not.toMatch(/import\s*\{[^}]*\bPainel\b[^}]*\}\s*from\s*"@\/components\/comercial\/base"/);
    });

    it(`${arquivo} importa CaCard e usa variante="compacto" onde usava Painel`, () => {
      const codigo = readFileSync(arquivo, "utf8");
      expect(codigo).toContain('import { CaCard } from "@/components/ui/ca-card";');
      expect(codigo).toMatch(/<CaCard variante="compacto"/);
      expect(codigo).not.toMatch(/<Painel[\s>]/);
      expect(codigo).not.toContain("</Painel>");
    });
  }
});

describe("DSA-10 — os dois fluxos contratuais irmãos usam a mesma superfície canônica", () => {
  it("contrato-parametros.$id.tsx e casos.$caseId.contrato.preparar.tsx chamam CaCard, não um wrapper próprio", () => {
    for (const arquivo of [
      "src/routes/_authenticated/contrato-parametros.$id.tsx",
      "src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx",
    ]) {
      const codigo = readFileSync(arquivo, "utf8");
      const ocorrencias = codigo.match(/<CaCard variante="compacto"/g) ?? [];
      expect(ocorrencias.length).toBeGreaterThan(0);
    }
  });
});

describe("DSA-10 — nenhuma regra de negócio, writer, dado ou texto jurídico foi tocado", () => {
  it("os writers/servidores da família contratual continuam sendo importados sem alteração de nome", () => {
    const preparar = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
    // Amostra de escritores reais que já existiam antes deste corte — a
    // presença deles confirma que a migração foi só de superfície.
    expect(preparar).toContain("PainelBloqueios");
    expect(preparar).toContain("PainelDependentes");
    /*
     * 04/10/2026 — a Proprietária mandou retirar as auditorias repetidas das
     * abas. `PainelInstrumentos`, `PainelPreparacao` e `MatrizJuridicaPreparacao`
     * deixaram de ser montados na tela de contrato (eram três conferências do
     * mesmo ato). Os componentes continuam no repositório, com o nome e o
     * writer intactos — que é o que este teste protege.
     */
    for (const arquivo of [
      "src/components/contrato/painel-instrumentos.tsx",
      "src/components/contrato/painel-preparacao.tsx",
      "src/components/contrato/matriz-juridica-preparacao.tsx",
    ]) {
      expect(existsSync(arquivo), arquivo).toBe(true);
    }
    expect(preparar).toContain("PainelPendenciasContratuais");
  });
});
