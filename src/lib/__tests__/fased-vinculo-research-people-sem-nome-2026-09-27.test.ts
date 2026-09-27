import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Fase D (27/09/2026) — achado real: `carregarPessoa` (Pessoa 360) decidia
 * quais `research_people` pertenciam a esta pessoa comparando
 * `canonical_name`/`preferred_display_name` contra o nome da Pessoa
 * Canônica (igualdade OU inclusão parcial de string) — uma fusão
 * automática por nome, exatamente o que a "REGRA ABSOLUTA" desta sessão
 * proíbe (nome é sinal, nunca vínculo). O vínculo real já existe e já é
 * auditado: `genealogical_person_profiles.client_id` (Corte C,
 * pessoas-linhagens.functions.ts#salvarRegistroG02) + `research_person_id`
 * obrigatório de cada perfil. Este corte troca o filtro para usar essa
 * cadeia real, nunca o texto do nome.
 */
const arquivo = readFileSync("src/lib/pessoa.functions.ts", "utf8");

describe("Fase D — vínculo research_people ↔ Pessoa Canônica nunca por nome", () => {
  it("não compara mais canonical_name/preferred_display_name contra o nome da pessoa", () => {
    expect(arquivo).not.toContain("nomeDaPessoa");
    expect(arquivo).not.toContain('p["canonical_name"] ?? p["preferred_display_name"]');
  });

  it("perfisGenealogicos passa a selecionar research_person_id (a FK real do vínculo)", () => {
    const inicio = arquivo.indexOf('.from("genealogical_person_profiles")');
    const trecho = arquivo.slice(inicio, inicio + 900);
    expect(trecho).toContain("research_person_id");
    expect(trecho).toContain('.eq("client_id", data.clienteId)');
  });

  it("fichaDestaPessoa filtra por research_person_id vinculado, não por nome", () => {
    const inicio = arquivo.indexOf("const idsResearchPeopleVinculados");
    expect(inicio).toBeGreaterThan(-1);
    const trecho = arquivo.slice(inicio, inicio + 700);
    expect(trecho).toContain('p["research_person_id"]');
    expect(trecho).toContain("idsResearchPeopleVinculados.has(p[\"id\"]");
  });

  it("outrosDaMesmaPesquisa é o complemento exato (não vinculados), sem duplicar lógica de nome", () => {
    const inicio = arquivo.indexOf("const outrosDaMesmaPesquisa");
    const trecho = arquivo.slice(inicio, inicio + 200);
    expect(trecho).toContain("!idsResearchPeopleVinculados.has(");
  });
});

/**
 * Fase D — confirmação (não reconstrução): "Perfil genealógico" (G-02,
 * pessoas-linhagens.functions.ts) já não tem nenhum caminho de escrita em
 * `clientes` — vínculo é sempre no sentido perfil→cliente (client_id),
 * nunca criando/editando a Pessoa Canônica a partir da pesquisa. Trava
 * regressiva, não introduz mecanismo novo.
 */
describe("Fase D — Perfil genealógico nunca auto-cria/edita a Pessoa Canônica", () => {
  const g02 = readFileSync("src/lib/pessoas-linhagens.functions.ts", "utf8");

  it("nenhum insert/update em clientes a partir do módulo G-02", () => {
    expect(g02).not.toMatch(/\.from\(["']clientes["']\)/);
  });

  it("o vínculo com a Pessoa Canônica é sempre client_id opcional, nunca criação de cliente novo", () => {
    expect(g02).toContain('"client_id"');
    expect(g02).not.toMatch(/inserirComVerificacao\(\{\s*supabase,\s*tabela:\s*["']clientes["']/);
  });
});

/**
 * Fase D — confirmação: dossiê-mãe já é único por caso (Corte B, fase
 * "Pessoa Unificada" anterior a esta rodada, SHAs 5931a272…ec38b4a6) —
 * `nucleoComMesmoDossieAtivo`/`dossieMaeDoCaso` recusam um segundo núcleo
 * ativo com dossiê ativo no mesmo caso. Só confirmar que segue existindo,
 * não recriar.
 */
describe("Fase D — dossiê-mãe único por caso continua vigente (Corte B, confirmado)", () => {
  const nucleoCompletude = readFileSync("src/lib/nucleo-completude.ts", "utf8");

  it("nucleoComMesmoDossieAtivo e dossieMaeDoCaso existem e seguem sendo a fonte única", () => {
    expect(nucleoCompletude).toContain("export function nucleoComMesmoDossieAtivo");
    expect(nucleoCompletude).toContain("export function dossieMaeDoCaso");
  });
});
