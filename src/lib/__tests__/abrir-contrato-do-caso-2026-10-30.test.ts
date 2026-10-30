import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * 30/10/2026 — achado real: o Caso 360 ("Motor e matriz de contrato") só
 * tinha o link "Preparar contrato" (`/casos/$caseId/contrato/preparar`), uma
 * tela de leitura que mostra um contrato SE já existir
 * (`registro.contract_id`) mas nunca cria um. Não existia nenhum caminho de
 * um clique para abrir/reaproveitar o `contract_base` a partir do Caso 360 —
 * era preciso ir para /contratos e criar manualmente.
 *
 * `abrirContratoDoCaso` fecha esse buraco: reaproveita o contrato existente
 * (nunca duplica) e, ao criar, segue o mesmo caminho de `criarInstrumento`
 * — inclusive a reconexão de `contract_case_parameters` órfãos.
 */
const fn = readFileSync("src/lib/contratos.functions.ts", "utf8");
const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("abrirContratoDoCaso existe e reaproveita sem duplicar", () => {
  it("o servidor expõe a função e checa um contract_base existente antes de criar", () => {
    expect(fn).toContain("export const abrirContratoDoCaso");
    const inicio = fn.indexOf("export const abrirContratoDoCaso");
    const bloco = fn.slice(inicio, inicio + 3500);
    expect(bloco).toContain('.eq("contract_type", "contract_base")');
    expect(bloco).toContain("criado: false");
    expect(bloco).toContain("criado: true");
  });

  it("recusa caso arquivado ou de demonstração, igual a criarInstrumento", () => {
    const inicio = fn.indexOf("export const abrirContratoDoCaso");
    const bloco = fn.slice(inicio, inicio + 2000);
    expect(bloco).toContain("Caso arquivado");
    expect(bloco).toContain("demonstração não alimenta o motor contratual real");
  });

  it("reconecta contract_case_parameters órfãos ao criar, como criarInstrumento", () => {
    const inicio = fn.indexOf("export const abrirContratoDoCaso");
    const bloco = fn.slice(inicio, inicio + 2500);
    expect(bloco).toContain("contract_case_parameters");
    expect(bloco).toContain('.is("contract_id", null)');
  });
});

describe("Caso 360 — botão 'Abrir contrato (rascunho)' está ligado de verdade", () => {
  it("importa e chama abrirContratoDoCaso, não só o link de leitura", () => {
    expect(caso360).toContain('import { abrirContratoDoCaso } from "@/lib/contratos.functions"');
    expect(caso360).toContain("useServerFn(abrirContratoDoCaso)");
    expect(caso360).toContain("Abrir contrato (rascunho)");
  });

  it("ao gerar, navega para a tela real do contrato com o id devolvido", () => {
    const inicio = caso360.indexOf("mAbrirContrato = useMutation");
    const bloco = caso360.slice(inicio, inicio + 600);
    expect(bloco).toContain('to: "/contratos/$id"');
    expect(bloco).toContain("params: { id: r.id }");
  });

  it("erro do servidor aparece na tela, nunca fica silencioso", () => {
    const inicio = caso360.indexOf("mAbrirContrato = useMutation");
    const bloco = caso360.slice(inicio, inicio + 600);
    expect(bloco).toContain("onError:");
    expect(bloco).toContain("toast.error");
  });

  it("o link de leitura 'Preparar contrato' continua existindo ao lado — nada removido", () => {
    expect(caso360).toContain("Preparar contrato");
    expect(caso360).toContain("/casos/$caseId/contrato/preparar");
  });
});
