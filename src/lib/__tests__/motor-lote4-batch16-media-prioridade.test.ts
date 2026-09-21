import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 4, batch 16 (prioridade Média).
// privacidade/painel.tsx, qualidade/painel.tsx, portal/atendimento-interno.tsx,
// pessoas-linhagens.$caseId.tsx (+ genealogia/aba-modulos.tsx, mesmo escritor
// arquivarRegistroG02) e o histórico que faltava em pessoas-linhagens.functions.ts.

const privacidade = readFileSync("src/components/privacidade/painel.tsx", "utf8");
const qualidade = readFileSync("src/components/qualidade/painel.tsx", "utf8");
const atendimento = readFileSync("src/components/portal/atendimento-interno.tsx", "utf8");
const pessoasLinhagens = readFileSync("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx", "utf8");
const abaModulos = readFileSync("src/components/genealogia/aba-modulos.tsx", "utf8");
const pessoasLinhagensFn = readFileSync("src/lib/pessoas-linhagens.functions.ts", "utf8");

describe("nenhum window.prompt()/window.confirm() restante nos arquivos do batch", () => {
  it.each([
    ["privacidade/painel.tsx", privacidade],
    ["qualidade/painel.tsx", qualidade],
    ["portal/atendimento-interno.tsx", atendimento],
    ["pessoas-linhagens.$caseId.tsx", pessoasLinhagens],
    ["genealogia/aba-modulos.tsx", abaModulos],
  ])("%s", (_nome, conteudo) => {
    expect(conteudo).not.toContain("window.prompt(");
    expect(conteudo).not.toContain("window.confirm(");
  });
});

describe("privacidade/painel.tsx — arquivar documento / revogar consentimento", () => {
  it("usam AcaoOperacional", () => {
    expect(privacidade).toContain('acaoExterna="arquivar_documento"');
    expect(privacidade).toContain('acaoExterna="revogar_consentimento"');
  });
});

describe("qualidade/painel.tsx — Não aplicável", () => {
  it("usa AcaoOperacional com justificativa via parâmetro, não prompt", () => {
    expect(qualidade).toContain('acaoExterna="marcar_item_checklist_nao_aplicavel"');
    expect(qualidade).toContain("function marcar(item: Linha, status: string, justificativa?: string)");
  });

  it("Cumprido e Reabrir continuam como botão simples (não são irreversíveis)", () => {
    expect(qualidade).toContain('onClick={() => marcar(i, "cumprido")}');
    expect(qualidade).toContain('onClick={() => marcar(i, "pendente")}');
  });
});

describe("portal/atendimento-interno.tsx — cancelar atendimento / pedir reenvio", () => {
  it("usam AcaoOperacional", () => {
    expect(atendimento).toContain('acaoExterna="cancelar_solicitacao_documental"');
    expect(atendimento).toContain('acaoExterna="pedir_reenvio_documento_cliente"');
  });
});

describe("pessoas-linhagens.$caseId.tsx — arquivar pessoa / relação", () => {
  it("usam AcaoOperacional", () => {
    expect(pessoasLinhagens).toContain('acaoExterna="arquivar_pessoa_perfil_360"');
    expect(pessoasLinhagens).toContain('acaoExterna="arquivar_relacao_genealogica"');
  });
});

describe("genealogia/aba-modulos.tsx — arquivar módulo", () => {
  it("usa AcaoOperacional", () => {
    expect(abaModulos).toContain('acaoExterna="arquivar_modulo_genealogico"');
  });
});

describe("pessoas-linhagens.functions.ts::arquivarRegistroG02 — passou a registrar histórico", () => {
  it("resolve organizationId, busca case_id quando a tabela tem essa coluna e chama registrarTimelineCaso", () => {
    const trecho = pessoasLinhagensFn.slice(
      pessoasLinhagensFn.indexOf("export const arquivarRegistroG02"),
    );
    expect(trecho).toContain("const organizationId = await autorizarEscrita(supabase, context.userId as string);");
    expect(trecho).toContain('.includes("case_id")');
    expect(trecho).toContain("registrarTimelineCaso(supabase, {");
  });
});
