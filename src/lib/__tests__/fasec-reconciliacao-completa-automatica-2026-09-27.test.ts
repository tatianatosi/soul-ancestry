import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  CAMPOS_CIVIS_RECONCILIAVEIS,
  ROTULO_CAMPO_CIVIL,
  estadoCampoCivilMembroCaso,
} from "@/lib/pessoa-vinculo";

/**
 * Fase C (27/09/2026): completa a reconciliação Pessoa Canônica ↔
 * case_members (nome/endereço faltavam) e torna o preenchimento de campo
 * vazio automático em todos os mecanismos existentes — conflito e
 * contrato assinado continuam nunca disparando escrita sozinhos.
 */

describe("Fase C — nome e endereço adicionados ao vocabulário civil reconciliável", () => {
  it("CAMPOS_CIVIS_RECONCILIAVEIS inclui nome e endereco", () => {
    expect(CAMPOS_CIVIS_RECONCILIAVEIS).toContain("nome");
    expect(CAMPOS_CIVIS_RECONCILIAVEIS).toContain("endereco");
    expect(ROTULO_CAMPO_CIVIL.nome).toBe("Nome");
    expect(ROTULO_CAMPO_CIVIL.endereco).toBe("Endereço");
  });

  it("estadoCampoCivilMembroCaso funciona para nome (preencher/conflito/dependente)", () => {
    expect(estadoCampoCivilMembroCaso("nome", { valor: null, dependente: false }, "Ana Luiza")).toBe("preencher");
    expect(estadoCampoCivilMembroCaso("nome", { valor: "Ana", dependente: false }, "Ana Luiza")).toBe("conflito");
    expect(estadoCampoCivilMembroCaso("nome", { valor: null, dependente: true }, "Ana Luiza")).toBe(
      "dependente_nao_sincronizado",
    );
  });
});

describe("Fase C — caso-canonico.functions.ts compõe endereço canônico via montarEnderecoCanonico", () => {
  const arquivo = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");

  it("importa montarEnderecoCanonico/COLUNAS_CLIENTE_ENDERECO de contratos.functions (reaproveita o Corte 4)", () => {
    expect(arquivo).toContain("COLUNAS_CLIENTE_ENDERECO, montarEnderecoCanonico");
    expect(arquivo).toContain('from "@/lib/contratos.functions"');
  });

  it("special-case: quando campo === 'endereco', usa montarEnderecoCanonico em vez de coluna única", () => {
    expect(arquivo).toContain('campo === "endereco" ? montarEnderecoCanonico(cliente ?? null)');
  });
});

describe("Fase C — preenchimento automático nos 5 mecanismos, sem segundo clique", () => {
  const arquivosComAutoFill = [
    "src/components/caso/reconciliar-dados-civis-membros-caso.tsx",
    "src/components/contrato/reconciliar-contato-partes.tsx",
    "src/routes/_authenticated/casos.$caseId.index.tsx",
    "src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx",
  ];

  it("cada arquivo dispara mutate(true) automaticamente quando há item 'preencher' no plano simulado", () => {
    for (const arq of arquivosComAutoFill) {
      const conteudo = readFileSync(arq, "utf8");
      expect(conteudo, `${arq} deveria conter auto-preenchimento`).toMatch(
        /acao === "preencher"[\s\S]{0,80}\.mutate\(true\)/,
      );
    }
  });

  it("contratos: auto-preenchimento nunca dispara em contrato já assinado", () => {
    const contato = readFileSync("src/components/contrato/reconciliar-contato-partes.tsx", "utf8");
    const prepararTsx = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
    expect(contato).toContain("!contratoAssinado &&");
    expect(prepararTsx).toContain("!r.contratoAssinado &&");
  });

  it("conflito nunca é escrito automaticamente — só 'preencher' dispara mutate(true)", () => {
    for (const arq of arquivosComAutoFill) {
      const conteudo = readFileSync(arq, "utf8");
      expect(conteudo).not.toMatch(/acao === "conflito"[\s\S]{0,80}\.mutate\(true\)/);
    }
  });
});

describe("Fase C — Pessoa 360 continua só sinal/link, nunca formulário paralelo de Case Member", () => {
  const pagina = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

  it("não importa nenhum componente de reconciliação/edição de case_members como formulário próprio", () => {
    expect(pagina).not.toContain("reconciliar-dados-civis-membros-caso");
    expect(pagina).not.toContain("reconciliar-cpf-membros-caso");
  });
});
