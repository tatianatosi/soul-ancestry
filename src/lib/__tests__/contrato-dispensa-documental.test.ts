import { expect, it } from "vitest";
import { impedimentosContratuais } from "../contrato-dispensa-documental";
const linhas = ["annexes_required", "party_documents", "financial_classification", "party_minor", "effective_period"].map(validation_key => ({validation_key, label:validation_key, severity:"blocking", status:"open"}));
it("dispensa somente documentos e anexos quando autorizada", () => {
  expect(impedimentosContratuais(linhas, true)).toEqual(["financial_classification", "party_minor", "effective_period"]);
});
it("sem autorização mantém documentos e anexos pendentes", () => {
  expect(impedimentosContratuais(linhas, false)).toEqual(linhas.map(r=>r.label));
});