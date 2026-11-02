import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("A3: 'Salvo' só quando houve linha alterada; pós-gravação não vira erro", () => {
  const caso = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
  const atend = readFileSync("src/lib/portal-atendimento.functions.ts", "utf8");

  it("sem campo alterado a mensagem diz que nada mudou", () => {
    expect(caso).toContain("Nada mudou: nenhum campo foi alterado no banco.");
    expect(caso).not.toContain('Salvo e conferido no banco${alterados.length ? ');
  });

  it("auditoria e linha do tempo depois da gravação principal não derrubam a ação e vão ao coletor", () => {
    expect(atend).toContain("pos_gravacao_timeline");
    expect(atend).toContain("pos_gravacao_auditoria");
    expect(atend).toContain("if (error) throw new Error(error.message);");
  });
});

describe("B6: a condição aprovada continua vigente até a nova ser aprovada", () => {
  const f = readFileSync("src/lib/condicao-comercial-caso.functions.ts", "utf8");
  const reg = f.slice(
    f.indexOf("export const registrarVersaoCondicaoComercial"),
    f.indexOf("export const aprovarVersaoCondicaoComercial"),
  );

  it("criar rascunho não marca a aprovada como substituída", () => {
    expect(reg).not.toContain('approval_status: "substituida"');
    expect(reg).toContain('approval_status: "rascunho"');
  });

  it("existe escritor de aprovação, que grava aprovado_por/aprovado_em e só depois substitui a anterior", () => {
    const apr = f.slice(f.indexOf("export const aprovarVersaoCondicaoComercial"));
    expect(apr).toContain('approval_status: "aprovada"');
    expect(apr).toContain("aprovado_por: userId");
    expect(apr).toContain("aprovado_em: agora");
    expect(apr.indexOf('approval_status: "aprovada"')).toBeLessThan(apr.indexOf('approval_status: "substituida"'));
  });

  it("a tela oferece aprovar a versão pendente, mesmo sem versão vigente", () => {
    const ui = readFileSync("src/components/contrato/condicao-comercial-versionada.tsx", "utf8");
    expect(ui).toContain("data-versao-pendente");
    expect(ui).toContain("aprovarVersaoCondicaoComercial");
  });
});
