import { describe, expect, it } from "vitest";
import { conteudoProjetavel } from "@/lib/biblioteca-evidencias";

describe("Fila de publicação ao App — guard de fronteira (Governança 5A, 10/10/2026)", () => {
  it("recusa nome técnico de fonte, token, API, score e RG", () => {
    for (const texto of [
      "Encontramos a certidão no FamilySearch.",
      "Registro localizado no Antenati em 1912.",
      "Resultado com score de 0,92.",
      "Chamada de API retornou o registro.",
      "RG do avô confirmado.",
    ]) {
      expect(conteudoProjetavel(texto).ok, texto).toBe(false);
    }
  });

  it("segue recusando URL, hipótese e CPF", () => {
    expect(conteudoProjetavel("Veja https://exemplo.com/arquivo").ok).toBe(false);
    expect(conteudoProjetavel("Há uma hipótese sobre o avô.").ok).toBe(false);
    expect(conteudoProjetavel("CPF 111.444.777-35").ok).toBe(false);
  });

  it("aceita resumo aprovado em linguagem simples", () => {
    expect(conteudoProjetavel("Certidão de casamento de 1912 recebida e conferida pela equipe.").ok).toBe(true);
    expect(conteudoProjetavel("Os pares de irmãos aparecem na mesma certidão.").ok).toBe(true);
    expect(conteudoProjetavel("Capital do estado onde a família viveu.").ok).toBe(true);
  });
});
