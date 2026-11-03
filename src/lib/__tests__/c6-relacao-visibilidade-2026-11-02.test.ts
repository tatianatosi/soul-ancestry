import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { auditoriaDaRelacao } from "../pessoas-linhagens";
import { VISIBILIDADE_CLIENTE } from "../genealogia-modulos";

const ler = (rel: string) => readFileSync(resolve(__dirname, rel), "utf8");

describe("C6 relação genealógica: visibilidade editável e auditada", () => {
  it("opções são exatamente as do CHECK real (interna, sanitizada, aprovada)", () => {
    expect(VISIBILIDADE_CLIENTE.map((o) => o.id)).toEqual(["interna", "sanitizada", "aprovada"]);
  });

  it("formulário: padrão seguro 'interna', campo de visibilidade, edição por relação e confirmação ao publicar", () => {
    const tela = ler("../../routes/_authenticated/pessoas-linhagens.$caseId.tsx");
    const aba = tela.slice(tela.indexOf("function AbaRelacoes"), tela.indexOf("function AbaVariantes"));
    expect(aba).toContain('client_visibility: "interna"');
    expect(aba).toContain("Visibilidade no App Cliente");
    expect(aba).toContain("Salvar alteração");
    expect(aba).toMatch(/onSalvar\(r\.id, \{ relation_type: editando\.relation_type, client_visibility: editando\.client_visibility \}\)/);
    expect(aba).not.toContain("window.confirm");
    expect(aba).toContain("Confirmar publicação no App Cliente");
  });

  it("escritor existente aceita client_visibility e audita publicação/tipo", () => {
    const fn = ler("../pessoas-linhagens.functions.ts");
    expect(fn).toMatch(/CAMPOS_RELACAO = \[[^\]]*"client_visibility"/s);
    expect(fn).toContain("auditoriaDaRelacao(anterior, valores as any)");
    expect(fn).toContain('entidade: "genealogical_relationships"');
  });

  it("auditoria: publicar e mudar tipo geram eventos com valor anterior; nada muda, nada audita", () => {
    expect(
      auditoriaDaRelacao({ relation_type: "a_confirmar", client_visibility: "interna" }, { relation_type: "pai_mae", client_visibility: "aprovada" }),
    ).toEqual([
      { acao: "relacao_genealogica_publicada_para_cliente", de: "interna", para: "aprovada" },
      { acao: "relacao_genealogica_tipo_alterado", de: "a_confirmar", para: "pai_mae" },
    ]);
    expect(auditoriaDaRelacao({ relation_type: "pai_mae", client_visibility: "aprovada" }, { client_visibility: "interna" })).toEqual([
      { acao: "relacao_genealogica_visibilidade_alterada", de: "aprovada", para: "interna" },
    ]);
    expect(auditoriaDaRelacao({ relation_type: "pai_mae", client_visibility: "interna" }, { relation_type: "pai_mae", client_visibility: "interna" })).toEqual([]);
  });

  it("criação não publicada não gera ruído; criação já publicada audita", () => {
    expect(auditoriaDaRelacao(null, { relation_type: "pai_mae", client_visibility: "interna" })).toEqual([]);
    expect(auditoriaDaRelacao(null, { client_visibility: "aprovada" })).toHaveLength(1);
  });
});
