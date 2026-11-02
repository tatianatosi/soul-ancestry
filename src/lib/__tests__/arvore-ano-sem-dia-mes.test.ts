import { expect, it } from "vitest";
import { rotuloAnoArvore } from "../arvore-publicacao";
it("mostra ano registrado sem fabricar dia ou mês", () => {
  expect(rotuloAnoArvore({ nascimento_data: null, nascimento_data_aproximada: "1902", nascimento_precisao: "estimada", morte_data: null })).toBe("n. c. 1902");
});
it("não escolhe um ano dentro de um intervalo", () => {
  expect(rotuloAnoArvore({ nascimento_data: null, nascimento_data_aproximada: "entre 1900 e 1902", morte_data: null })).toBeNull();
});