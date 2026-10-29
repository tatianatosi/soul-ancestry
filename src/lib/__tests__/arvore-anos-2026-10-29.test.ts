import { describe, expect, it } from "vitest";
import { rotuloAnoArvore } from "@/lib/arvore-publicacao";
import { layoutGenograma } from "@/components/portal/genograma-layout";

describe("ano sob o nome na Árvore (29/10/2026, autorizado pela Proprietária)", () => {
  it("perfil aprovado com data exata mostra o ano de nascimento", () => {
    expect(rotuloAnoArvore({ nascimento_data: "1873-09-21", nascimento_precisao: "exata", morte_data: null })).toBe("n. 1873");
  });
  it("data aproximada é marcada como aproximada, nunca apresentada como exata", () => {
    expect(rotuloAnoArvore({ nascimento_data: "1895-01-01", nascimento_precisao: "aproximada", morte_data: null })).toBe("n. c. 1895");
  });
  it("perfil sem data registrada não gera ano — nada é deduzido", () => {
    expect(rotuloAnoArvore({ nascimento_data: null, nascimento_precisao: "aproximada", morte_data: null })).toBeNull();
    expect(rotuloAnoArvore({ nascimento_data: "   ", morte_data: null })).toBeNull();
  });
  it("nascimento e morte formam o intervalo do mockup; morte sozinha é marcada", () => {
    expect(rotuloAnoArvore({ nascimento_data: "1873-09-21", morte_data: "1950-03-02" })).toBe("1873–1950");
    expect(rotuloAnoArvore({ nascimento_data: null, morte_data: "1950-03-02", morte_precisao: "exata" })).toBe("† 1950");
  });
  it("cartão com ano reserva espaço próprio; cartão sem ano não muda de tamanho", () => {
    const pessoas = [
      { chave: "rudolf", nome: "Rudolf Friedmann", vinculo: null, geracao: 5 },
      { chave: "otto", nome: "Otto Reimer", vinculo: null, geracao: 4 },
    ];
    const comAno = layoutGenograma(pessoas, { rudolf: "n. 1873" });
    const semAno = layoutGenograma(pessoas);
    const noRudolf = comAno.nos.find((n) => n.pessoa.chave === "rudolf");
    const noOtto = comAno.nos.find((n) => n.pessoa.chave === "otto");
    expect(noRudolf?.ano).toBe("n. 1873");
    expect(noOtto?.ano).toBeNull();
    const linhasRudolf = semAno.nos.find((n) => n.pessoa.chave === "rudolf");
    expect((noRudolf?.altura ?? 0) - (linhasRudolf?.altura ?? 0)).toBe(16);
    // O ano fica entre o nome e o rótulo da geração, sem sobrepor nenhum.
    expect((noRudolf?.ano ? 26 + (noRudolf.linhas.length - 1) * 16 + 18 : 0)).toBeLessThan(noRudolf?.geracaoY ?? 0);
  });
});
