import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 4, batch 17 (prioridade Baixa,
// opcional). fontes-vinculos.tsx (consistência de componente, ação
// reversível), integracoes/centro.tsx (confirmação + trilha já existente via
// audit_logs) e qualidade.functions.ts::sincronizarChecklist (histórico novo,
// case-scoped).

const fontesVinculos = readFileSync("src/components/pesquisa/fontes-vinculos.tsx", "utf8");
const integracoesCentro = readFileSync("src/components/integracoes/centro.tsx", "utf8");
const qualidadeFn = readFileSync("src/lib/qualidade.functions.ts", "utf8");

describe("nenhum window.prompt()/window.confirm() restante nos arquivos do batch", () => {
  it.each([
    ["pesquisa/fontes-vinculos.tsx", fontesVinculos],
    ["integracoes/centro.tsx", integracoesCentro],
  ])("%s", (_nome, conteudo) => {
    expect(conteudo).not.toContain("window.prompt(");
    expect(conteudo).not.toContain("window.confirm(");
  });
});

describe("pesquisa/fontes-vinculos.tsx — criar evidência em rascunho", () => {
  it("usa AcaoOperacional (ação reversível, sem acaoExterna)", () => {
    expect(fontesVinculos).toContain("<AcaoOperacional");
    expect(fontesVinculos).toContain("Criar evidência em rascunho a partir deste documento");
    expect(fontesVinculos).toContain("onConfirmar={() => criarEvidencia.mutate()}");
  });
});

describe("integracoes/centro.tsx — resolver revisão e pausar", () => {
  it("usam AcaoOperacional com acaoExterna", () => {
    expect(integracoesCentro).toContain('acaoExterna="resolver_revisao_integracao"');
    expect(integracoesCentro).toContain('acaoExterna="pausar_integracao"');
  });

  it("Pausar preserva a restrição de papel via validacaoFormulario", () => {
    const idx = integracoesCentro.indexOf('acaoExterna="pausar_integracao"');
    const trecho = integracoesCentro.slice(idx - 400, idx + 200);
    expect(trecho).toContain("validacaoFormulario={!podeConfigurar");
  });
});

describe("qualidade.functions.ts::sincronizarChecklist — passou a registrar histórico", () => {
  it("chama registrarTimelineCaso quando itens são criados", () => {
    const trecho = qualidadeFn.slice(
      qualidadeFn.indexOf("export const sincronizarChecklist"),
      qualidadeFn.indexOf("export const marcarItemChecklist"),
    );
    expect(trecho).toContain("registrarTimelineCaso(supabase, {");
    expect(trecho).toContain("if (criados > 0)");
  });
});
