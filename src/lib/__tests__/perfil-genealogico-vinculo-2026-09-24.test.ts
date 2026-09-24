import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { clienteElegivelParaPerfil } from "@/lib/pessoa-vinculo";

/**
 * Corte C (24/09/2026, "Motores Pessoa Unificada, Núcleos e Dossiê"):
 * perfil genealógico é separado e opcional. Só se liga à Pessoa Canônica
 * por escolha humana, só a quem já está no caso, com auditoria no vínculo
 * e no desvínculo. Pessoa 360 lê pelo vínculo (client_id), nunca pelo
 * caso inteiro nem por nome. Nunca funde.
 */
const linhagens = readFileSync("src/lib/pessoas-linhagens.functions.ts", "utf8");
const pessoaFn = readFileSync("src/lib/pessoa.functions.ts", "utf8");
const pessoa360 = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");
const telaLinhagens = readFileSync("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx", "utf8");

const salvar = linhagens.slice(linhagens.indexOf("export const salvarRegistroG02"));
const consultaPerfil = pessoaFn.slice(
  pessoaFn.indexOf('.from("genealogical_person_profiles")'),
  pessoaFn.indexOf('.from("research_cases")'),
);

describe("clienteElegivelParaPerfil — só quem já está no caso", () => {
  const pessoas = [{ cliente_id: "c-ana" }, { cliente_id: null }, { cliente_id: "c-adair" }];
  it("aceita pessoa canônica que já é membro do caso", () => {
    expect(clienteElegivelParaPerfil("c-ana", pessoas)).toBe(true);
  });
  it("recusa pessoa de fora do caso", () => {
    expect(clienteElegivelParaPerfil("c-outro-caso", pessoas)).toBe(false);
  });
  it("membro sem cadastro canônico não habilita vínculo", () => {
    expect(clienteElegivelParaPerfil("", [{ cliente_id: null }])).toBe(false);
  });
  it("caso sem pessoas não aceita vínculo nenhum", () => {
    expect(clienteElegivelParaPerfil("c-ana", [])).toBe(false);
  });
});

describe("salvarRegistroG02 — writer do vínculo perfil ↔ pessoa", () => {
  it("valida elegibilidade no servidor, não só no seletor da tela", () => {
    expect(salvar).toContain("pessoasDoCasoComFallbackNucleo(supabase, caseDoPerfil)");
    expect(salvar).toContain("clienteElegivelParaPerfil(novoCliente, pessoas)");
    expect(salvar).toContain("Só é possível vincular o perfil a uma pessoa cadastrada que já faz parte deste caso.");
  });
  it("desvincular é gravar client_id nulo (vazio vira null)", () => {
    expect(salvar).toMatch(/const novoCliente = \(valores\["client_id"\] as string \| null\) \|\| null;/);
    expect(salvar).toContain('valores["client_id"] = novoCliente;');
  });
  it("vínculo e desvínculo ficam auditados com antes/depois e na timeline", () => {
    expect(salvar).toContain('"perfil_genealogico_vinculado_a_pessoa"');
    expect(salvar).toContain('"perfil_genealogico_desvinculado"');
    expect(salvar).toContain("valores_anteriores: { client_id: clienteAnterior }");
    expect(salvar).toContain("registrarTimelineCaso(supabase");
  });
  it("gravar e inserir passam pela releitura e registram o vínculo", () => {
    expect(salvar).toContain("gravarComVerificacao(");
    expect(salvar).toContain("inserirComVerificacao(");
    expect(salvar).toContain("await registrarVinculo(data.id);");
    expect(salvar).toContain("await registrarVinculo(r.id);");
  });
  it("nunca funde: não copia dados do perfil para clientes", () => {
    expect(salvar).not.toMatch(/from\("clientes"\)\s*\.(update|insert|upsert)/);
  });
});

describe("Pessoa 360 — lê só o perfil vinculado", () => {
  it("consulta por client_id da pessoa, org e não arquivado — não pelo caso inteiro", () => {
    expect(consultaPerfil).toContain('.eq("client_id", data.clienteId)');
    expect(consultaPerfil).toContain('.eq("organization_id", organizationId)');
    expect(consultaPerfil).toContain('.is("archived_at", null)');
    expect(consultaPerfil).not.toContain('.in("case_id"');
  });
  it("rótulo 'Perfil genealógico vinculado' com link para conferir na ficha do caso", () => {
    expect(pessoa360).toContain("Perfil genealógico vinculado:");
    expect(pessoa360).toContain("data-pessoa360-perfil-vinculado");
    expect(pessoa360).toContain("Conferir vínculo");
    expect(pessoa360).not.toContain("Perfil 360°:");
  });
});

describe("Ficha genealógica — vínculo opcional por escolha humana", () => {
  it("seletor oferece só clientes do caso e a opção de desvincular", () => {
    expect(telaLinhagens).toContain("Vincular a pessoa já cadastrada (opcional)");
    expect(telaLinhagens).toContain('vazio="Sem vínculo com pessoa cadastrada"');
    expect(telaLinhagens).toContain("clientesDoCaso.map");
  });
});
