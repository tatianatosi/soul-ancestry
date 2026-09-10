import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { itensPorDominio } from "@/lib/inventario-patrimonial";

/*
 * CA13-CONTRATO-V2-E-ANEXOS (09/09/2026) — o Contrato de Estudo Genealógico
 * v2 (contrato-base-consolidado.ts, MODELO-ESTUDO + BASE-GEN-V2) e seus
 * anexos I–V já eram ativos reais e catalogados em detalhe no inventário
 * patrimonial (inventario-patrimonial.ts) — versão, situação, fonte de
 * verdade, risco e ação necessária —, mas nenhuma tela nunca mostrava esse
 * inventário: zero consumidores. `/contratos` (a área contratual real, já
 * usada para instrumentos, gates e revisão jurídica) passa a exibir esses
 * 9 ativos preservados, somente leitura, com link para o texto do
 * contrato-base já existente em /governanca/contrato-base. Nenhum texto
 * jurídico foi reescrito, nenhum ativo foi apagado ou substituído.
 */

const tela = readFileSync("src/routes/_authenticated/contratos.index.tsx", "utf8");

describe("CA13 — /contratos passa a ser a área única que encontra versão, anexos, situação e acesso", () => {
  it("consome o inventário patrimonial já existente (contrato_base + anexos), não uma leitura nova", () => {
    expect(tela).toContain('from "@/lib/inventario-patrimonial"');
    expect(tela).toContain('itensPorDominio("contrato_base")');
    expect(tela).toContain('itensPorDominio("anexos")');
  });

  it("lista exatamente os 9 ativos preservados (3 contrato-base + 6 anexos)", () => {
    const base = itensPorDominio("contrato_base");
    const anexos = itensPorDominio("anexos");
    expect(base.length).toBe(3);
    expect(anexos.length).toBe(6);
    expect(base.map((i) => i.nomeCanonico)).toContain("Contrato-base — Estudo Genealógico v2 (14 cláusulas)");
    expect(anexos.map((i) => i.nomeCanonico)).toEqual(
      expect.arrayContaining([
        "Anexo I — Ordem de Serviço",
        "Anexo II — Despesas Externas",
        "Anexo III — Autorização de Pesquisa",
        "Anexo IV — Procuração",
        "Anexo V — Alteração de Escopo",
      ]),
    );
  });

  it("oferece acesso ao texto do contrato-base já existente, sem criar leitor novo", () => {
    expect(tela).toContain('to="/governanca/contrato-base"');
  });

  it("declara explicitamente que é somente leitura e não reescreve texto jurídico", () => {
    const bloco = tela.slice(tela.indexOf("Contrato de Estudo Genealógico v2 e anexos"));
    expect(bloco.slice(0, 600)).toMatch(/somente leitura/i);
    expect(bloco.slice(0, 600)).toMatch(/nenhum texto[\s\S]{0,20}jurídico[\s\S]{0,20}reescrito/i);
  });

  it("data do inventário fica visível — nunca apresentado como leitura ao vivo do banco", () => {
    expect(tela).toContain("INVENTARIO_DATA");
  });

  it("não cria nova rota, nova tabela nem nova aba: renderiza dentro da rota /contratos já existente", () => {
    expect(tela).toContain('createFileRoute("/_authenticated/contratos/")');
  });
});

describe("CA13 — nenhum ativo preservado foi alterado por esta rodada", () => {
  it("todo item de contrato_base/anexos continua com os campos ricos do inventário original", () => {
    for (const item of [...itensPorDominio("contrato_base"), ...itensPorDominio("anexos")]) {
      expect(item.nomeCanonico.length).toBeGreaterThan(0);
      expect(item.fonteDeVerdadeAtual.length).toBeGreaterThan(0);
      expect(item.status.length).toBeGreaterThan(0);
    }
  });
});
