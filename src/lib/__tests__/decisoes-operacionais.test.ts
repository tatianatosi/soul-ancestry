import { describe, expect, it } from "vitest";

import { dicionarioAnexos } from "@/lib/anexos-dicionario";
import {
  CASO_CANONICO,
  CONFERENCIA,
  DECISOES,
  ESTADOS_PROPOSTA,
  ESTRUTURA_FAMILIAR,
  SUPERFICIES_CANONICAS,
} from "@/lib/decisoes-operacionais";

describe("CA-DEC-2026-08-17-01 — estrutura familiar", () => {
  it("mantém um caso canônico e três cadastros individuais sem duplicidade", () => {
    expect(ESTRUTURA_FAMILIAR.caso).toBe("CA-CID-AT-FAM-2026-001");
    expect(ESTRUTURA_FAMILIAR.crm).toEqual(["Ana Luiza", "Adair", "Alice"]);
    expect(new Set(ESTRUTURA_FAMILIAR.crm).size).toBe(3);
  });

  it("trata Ana, Adair e Alice como signatários adultos e Felipe apenas como dependente", () => {
    expect(ESTRUTURA_FAMILIAR.signatarios).toEqual(["Ana Luiza", "Adair", "Alice"]);
    expect(ESTRUTURA_FAMILIAR.signatarios).not.toContain("Felipe");
    expect(ESTRUTURA_FAMILIAR.dependentes[0]!.nome).toBe("Felipe");
    expect(ESTRUTURA_FAMILIAR.dependentes[0]!.vinculo).toMatch(/Processo A de Ana/i);
  });

  it("gera três instâncias ANX-INDIVIDUAL, com Felipe agregado à titular", () => {
    const regras = dicionarioAnexos({
      beneficiarios: "Ana Luiza || Adair || Alice",
      dependentes: "Felipe (Ana Luiza)",
      valorTotal: "9600",
      formaPagamento: "assinatura_mensal",
    });
    const individual = regras.find((r) => r.codigo === "ANX-INDIVIDUAL");
    expect(individual?.instancias).toHaveLength(3);
    const titulos = individual!.instancias.map((i) => i.titulo).join(" | ");
    expect(titulos).toMatch(/Ana Luiza/);
    expect(titulos).toMatch(/Felipe/);
    expect(individual!.instancias.filter((i) => /Felipe/.test(i.titulo))).toHaveLength(1);
  });

  it("mantém um único anexo comercial para o núcleo familiar", () => {
    const regras = dicionarioAnexos({
      beneficiarios: "Ana Luiza || Adair || Alice",
      dependentes: "Felipe (Ana Luiza)",
      valorTotal: "9600",
      formaPagamento: "assinatura_mensal",
    });
    expect(regras.find((r) => r.codigo === "ANX-COMERCIAL")?.instancias).toHaveLength(1);
  });
});

describe("CA-DEC-2026-08-17-03 — propostas e limites", () => {
  it("só reconhece a proposta aceita como satisfatória para o gate", () => {
    const satisfazem = ESTADOS_PROPOSTA.filter((e) => /satisfaz o gate/i.test(e.efeito)).map((e) => e.estado);
    expect(satisfazem).toEqual(["aceita"]);
    const arquivada = ESTADOS_PROPOSTA.find((e) => e.estado === "arquivada")!;
    expect(arquivada.efeito).toMatch(/não satisfaz gate/i);
    expect(arquivada.efeito).toMatch(/recuperável/i);
  });

  it("proíbe ação real por correção de motor", () => {
    const d = DECISOES.find((x) => x.codigo === "CA-DEC-2026-08-17-03")!;
    expect(d.limites.join(" ")).toMatch(/Nenhuma assinatura, cobrança, portal, pesquisa externa/i);
  });
});

describe("CA-DEC-2026-08-17-04 — superfícies e conferência", () => {
  it("declara responsabilidade única por superfície, sem repetição", () => {
    const nomes = SUPERFICIES_CANONICAS.map((s) => s.superficie);
    expect(new Set(nomes).size).toBe(nomes.length);
    for (const s of SUPERFICIES_CANONICAS) {
      expect(s.responsabilidade.length).toBeGreaterThan(10);
      expect(s.naoContem.length).toBeGreaterThan(10);
    }
  });

  it("mantém a conferência amarrada às decisões vigentes e ao caso canônico", () => {
    const codigos = new Set(DECISOES.map((d) => d.codigo));
    expect(codigos).toEqual(
      new Set([
        "CA-DEC-2026-08-17-01",
        "CA-DEC-2026-08-17-03",
        "CA-DEC-2026-08-17-04",
        "CA-DEC-2026-08-19-01",
        "CA-DEC-2026-08-20-01",
        "CA-DEC-2026-08-20-02",
      ]),
    );
    for (const c of CONFERENCIA) expect(codigos.has(c.decisao)).toBe(true);
    expect(CONFERENCIA.some((c) => c.evidencia.includes(CASO_CANONICO))).toBe(true);
  });
});
