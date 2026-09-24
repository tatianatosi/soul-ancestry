import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/*
 * CA19-PESSOAS-E-FAMILIA-CANONICAS (09/09/2026) — auditoria completa (grep
 * de todo `src/lib` por `.from("case_members")`) mostrou que os leitores
 * restantes já haviam sido migrados para `pessoasDoCasoComFallbackNucleo`
 * em 07/09/2026: caso-ficha.functions.ts (Caso 360), pesquisa.functions.ts
 * (Pesquisa) e fontes-documentos.functions.ts (Documentos) já chamam a
 * função única, com o mesmo comentário de achado ("mesmo achado do cotejo
 * tela a tela"). Os únicos `.from("case_members")` restantes são: a própria
 * `pessoasDoCasoComFallbackNucleo` (pessoa-vinculo.ts), duas escritas
 * (insert/update, não leitura) e uma reconciliação legítima em
 * caso-canonico.functions.ts que precisa comparar as duas tabelas para
 * detectar o que falta sincronizar — não uma leitura de exibição.
 *
 * Este teste tranca o estado: qualquer novo `.from("case_members")` fora da
 * lista abaixo quebra a suíte, para a redundância não voltar por descuido.
 */

const LIB_DIR = "src/lib";

const PERMITIDOS: { arquivo: string; motivo: string }[] = [
  { arquivo: "pessoa-vinculo.ts", motivo: "é a própria função canônica pessoasDoCasoComFallbackNucleo" },
  { arquivo: "caso-canonico.functions.ts", motivo: "reconciliação case_members × nucleo_membros (grava o que falta, não é leitura de exibição)" },
  { arquivo: "cadastro-checklist.functions.ts", motivo: "escreve cliente_id de volta em case_members (não é leitura crua para exibição)" },
  {
    arquivo: "caso-ficha.functions.ts",
    motivo:
      "lê case_members só para decidir se precisa do fallback (mesma regra interna de pessoasDoCasoComFallbackNucleo, reimplementada aqui para reaproveitar o Promise.all da ficha)",
  },
  {
    arquivo: "golive.functions.ts",
    motivo: "busca candidatos homônimos em case_members para revisão humana de duplicidade (não exibe pessoas do caso)",
  },
];

function arquivosTs(dir: string): string[] {
  const out: string[] = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) {
      if (entrada.name === "__tests__") continue;
      out.push(...arquivosTs(caminho));
    } else if (entrada.name.endsWith(".ts") && !entrada.name.endsWith(".test.ts")) {
      out.push(caminho);
    }
  }
  return out;
}

describe("CA19 — nenhum leitor cru de case_members fora da lista permitida", () => {
  it("todo .from(\"case_members\") em src/lib está na lista de exceções documentadas", () => {
    const ofensores: string[] = [];
    for (const caminho of arquivosTs(LIB_DIR)) {
      const conteudo = readFileSync(caminho, "utf8");
      if (!conteudo.includes('.from("case_members")')) continue;
      const nomeArquivo = caminho.split("/").pop()!;
      if (!PERMITIDOS.some((p) => p.arquivo === nomeArquivo)) ofensores.push(caminho);
    }
    expect(ofensores).toEqual([]);
  });

  it("Caso 360 (caso-ficha.functions.ts) usa pessoasDoCasoComFallbackNucleo como fallback", () => {
    const arquivo = readFileSync("src/lib/caso-ficha.functions.ts", "utf8");
    expect(arquivo).toContain("pessoasDoCasoComFallbackNucleo(supabase, data.id)");
  });

  it("Pesquisa (pesquisa.functions.ts) usa pessoasDoCasoComFallbackNucleo, não case_members cru", () => {
    const arquivo = readFileSync("src/lib/pesquisa.functions.ts", "utf8");
    expect(arquivo).toContain("pessoasDoCasoComFallbackNucleo(supabase, data.casoId)");
    expect(arquivo).not.toMatch(/\.from\("case_members"\)/);
  });

  it("Documentos (fontes-documentos.functions.ts) usa pessoasDoCasoComFallbackNucleo, não case_members cru", () => {
    const arquivo = readFileSync("src/lib/fontes-documentos.functions.ts", "utf8");
    expect(arquivo).toContain("pessoasDoCasoComFallbackNucleo(supabase, caseId)");
    expect(arquivo).not.toMatch(/\.from\("case_members"\)/);
  });

  it("dependentes e representação continuam por fonte própria (case_dependents), não fundidos aqui", () => {
    const cadastro = readFileSync("src/lib/cadastro-checklist.functions.ts", "utf8");
    expect(cadastro).toContain("case_dependents");
  });
});
