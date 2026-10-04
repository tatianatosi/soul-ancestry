import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { FONTES_PESQUISA, mensagemLegadoSemCriacao } from "@/lib/fontes-pesquisa-canonicas";
import { COMPARACAO_PAINEL_HOJE, PAINEIS_HISTORICOS } from "@/lib/fontes-canonicas-indicadores";

/**
 * Passo 5 do Saneamento V4 — "hipótese, ficha e evidência únicas"
 * (Proprietária, 03/10/2026) + a comparação Painel Dia × /painel que ela
 * pediu explicitamente em 04/10/2026.
 *
 * Medição que motivou o corte: hipótese vivia em três tabelas sem registro de
 * qual manda, e `salvarPesquisa` ainda CRIAVA em `research_hypotheses`, a
 * legada — enquanto a hipótese estruturada (categoria, status, nível de
 * confiança) é `research_case_hypotheses`, no módulo de Pesquisa.
 */

describe("Saneamento V4 passo 5 — hipótese com fonte única", () => {
  it("1. hipótese entra no registro canônico, com os três papéis nomeados", () => {
    const fontes = FONTES_PESQUISA.hipotese;
    expect(fontes.map((f) => f.tabela)).toEqual([
      "research_case_hypotheses",
      "research_cases.internal_hypothesis",
      "research_hypotheses",
    ]);
    expect(fontes.filter((f) => f.papel === "canonica")).toHaveLength(1);
    expect(fontes.find((f) => f.papel === "canonica")!.tabela).toBe("research_case_hypotheses");
    expect(fontes.find((f) => f.tabela === "research_hypotheses")!.papel).toBe("legado");
  });

  it("2. a legada não tem escritor para registro novo; a canônica tem", () => {
    const legado = FONTES_PESQUISA.hipotese.find((f) => f.tabela === "research_hypotheses")!;
    expect(legado.escritaNova).toBeNull();
    const canonica = FONTES_PESQUISA.hipotese.find((f) => f.papel === "canonica")!;
    expect(canonica.escritaNova).toContain("pesquisa-modulo.functions.ts");
  });

  it("3. `salvarPesquisa` deixou de criar hipótese na tabela legada", () => {
    const fn = readFileSync("src/lib/pesquisa.functions.ts", "utf8");
    expect(fn).toContain('data.bloco === "hipoteses"');
    expect(fn).toContain("mensagemLegadoSemCriacao");
    // Editar e arquivar o que já existe continua permitido — nada é apagado.
    expect(fn).toContain("!data.id &&");
    expect(mensagemLegadoSemCriacao("hipotese")).toContain("hipótese nova");
    expect(mensagemLegadoSemCriacao("hipotese")).toContain("/pesquisa-modulo/$id");
  });

  it("4. o resumo em texto é outro objeto, e a divergência com o texto do V4 está declarada", () => {
    const resumo = FONTES_PESQUISA.hipotese.find((f) => f.tabela === "research_cases.internal_hypothesis")!;
    expect(resumo.papel).toBe("camada_propria");
    expect(resumo.representa).toContain("não é a lista de hipóteses");
    expect(resumo.ponte).toContain("Divergência declarada");
    expect(resumo.ponte).toContain("somente leitura");
  });

  it("5. o hub de pesquisa leva à lista estruturada, sem gravar nela", () => {
    const hub = readFileSync("src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx", "utf8");
    expect(hub).toContain("/pesquisa-modulo/$id");
    expect(hub).not.toContain('.from("research_case_hypotheses"');
  });
});

describe("Saneamento V4 passo 3 — comparação Painel Dia × /painel", () => {
  it("6. a comparação está medida e registrada, e a decisão continua sendo dela", () => {
    expect(COMPARACAO_PAINEL_HOJE.decisao).toBe("PENDENTE_PROPRIETARIA");
    expect(COMPARACAO_PAINEL_HOJE.candidatos).toHaveLength(2);
    const dia = COMPARACAO_PAINEL_HOJE.candidatos.find((c) => c.arquivo.includes("painel-dia"))!;
    const rota = COMPARACAO_PAINEL_HOJE.candidatos.find((c) => c.rota === "/painel")!;
    // O achado central: um tem seis leitores e nenhuma rota; o outro é a rota.
    expect(dia.rota).toBeNull();
    expect(dia.leitores.length).toBe(6);
    expect(dia.testes).toBe(18);
    expect(rota.rota).toBe("/painel");
    expect(COMPARACAO_PAINEL_HOJE.consequencias).toHaveLength(3);
  });

  it("7. painel-dia continua fora do registro de legado deliberado — não tem decisão", () => {
    const historicos = PAINEIS_HISTORICOS.map((p) => p.componente);
    expect(historicos).toContain("src/components/painel/painel-desk-hoje.tsx");
    expect(historicos).toContain("src/components/painel/painel-hoje.tsx");
    expect(historicos).not.toContain("src/components/painel/painel-dia.tsx");
  });

  it("8. nenhuma rota renderiza painel-dia — o componente segue vivo só em teste", () => {
    const rotas = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");
    expect(rotas).not.toContain("painel-dia");
    expect(rotas).not.toContain("PainelDia");
  });
});

describe("Cadastro de lead: dois caminhos, uma só regra de duplicidade", () => {
  it("9. o caminho canônico pede confirmação; o paralelo recusa e aponta para ele", () => {
    const canonico = readFileSync("src/lib/crm-desk.functions.ts", "utf8");
    expect(canonico).toContain("export async function buscarDuplicidades");
    expect(canonico).toContain("confirmarDuplicidade");

    const paralelo = readFileSync("src/lib/golive-escritores.functions.ts", "utf8");
    expect(paralelo).toContain("buscarDuplicidades");
    expect(paralelo).toContain("Já existe lead com");
    expect(paralelo).toContain("Comercial › Leads");
    // Uma só regra de duplicidade: o paralelo não implementa a sua.
    expect(paralelo).not.toContain("mesmo e-mail");
    expect(paralelo).not.toContain("slice(-8)");
  });
});
