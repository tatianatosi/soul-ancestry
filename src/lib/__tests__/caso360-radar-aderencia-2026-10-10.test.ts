import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { agruparHeatmapPorPais, faixaDeCalor } from "@/lib/heatmap-aderencia";
import { montarCivilDoCaso } from "@/lib/ficha-civil-pessoa360";
import { saudeDoCaso } from "@/components/caso/case-health-hero";
import { montarBlocosFichaUnica } from "@/lib/ficha-unica-caso";
import { FALLBACK } from "@/lib/evidence";

describe("heatmap de aderência por país", () => {
  it("agrupa por país, maior aderência primeiro; sem percentual vai por último e nunca vira 0", () => {
    const linhas = agruparHeatmapPorPais([
      { id: "1", nome_da_linha: "Linha Itália", pais: "Itália", aderencia_percentual: 40, evidencias_chave: ["a"] },
      { id: "2", nome_da_linha: "Linha Áustria (§58c)", pais: "Áustria", aderencia_percentual: 85, evidencias_chave: [] },
      { id: "3", nome_da_linha: "Linha X", pais: "Itália", aderencia_percentual: 62, evidencias_chave: null },
      { id: "4", nome_da_linha: "Sem calculo", pais: null, aderencia_percentual: null, evidencias_chave: [] },
    ]);
    expect(linhas.map((l) => l.pais)).toEqual(["Áustria", "Itália", "País não informado"]);
    expect(linhas[1].pct).toBe(62);
    expect(linhas[2].pct).toBeNull();
    expect(faixaDeCalor(null)).toBe("nao_calculada");
    expect(faixaDeCalor(85)).toBe("alta");
  });

  it("valor inválido vindo do banco é tratado como ausência pelo validador existente", () => {
    const [l] = agruparHeatmapPorPais([
      { id: "1", nome_da_linha: "x", pais: "Áustria", aderencia_percentual: 150, evidencias_chave: [] },
    ]);
    expect(l.pct).toBeNull();
  });
});

describe("dados civis lidos da Pessoa 360", () => {
  it("titular vem de clientes; ausente mostra 'sem dados suficientes'; membro sem vínculo é declarado", () => {
    const civil = montarCivilDoCaso({
      clienteId: "c1",
      pessoas360: [{ id: "c1", nome: "Ana Luiza", data_nascimento: "1985-03-09", cpf: "12345678901" }],
      membros: [
        { id: "m1", nome: "Ana Luiza", cliente_id: "c1" },
        { id: "m2", nome: "Filho", cliente_id: null },
      ],
    });
    expect(civil).toHaveLength(2);
    const ana = civil[0];
    expect(ana.campos.find((c) => c.rotulo === "Data de nascimento")?.exibicao).toBe("09/03/1985");
    expect(ana.campos.find((c) => c.rotulo === "CPF")?.exibicao).toBe("•••.•••.•••-01");
    expect(ana.campos.find((c) => c.rotulo === "Nacionalidade")?.exibicao).toBe("sem dados suficientes");
    expect(civil[1].clienteId).toBeNull();
  });
});

describe("saúde do caso e Ficha Única sem fallback de demonstração", () => {
  it("bloqueio vence; falta de ação/responsável/prazo é atenção", () => {
    expect(saudeDoCaso({ bloqueios: 1, temProximaAcao: true, temResponsavel: true, temPrazo: true })).toBe("bloqueado");
    expect(saudeDoCaso({ bloqueios: 0, temProximaAcao: true, temResponsavel: false, temPrazo: true })).toBe("atencao");
    expect(saudeDoCaso({ bloqueios: 0, temProximaAcao: true, temResponsavel: true, temPrazo: true })).toBe("em_dia");
  });

  it("frase institucional de preenchimento vira ausência nos blocos", () => {
    const frase = Object.values(FALLBACK)[0] as string;
    const blocos = montarBlocosFichaUnica({
      caseId: "x",
      ficha: { case_id: "C1", case_nome: "N", cliente_nome: frase } as never,
      piloto: null,
      rotulos: {} as never,
    });
    expect(blocos[0].campos?.find((c) => c.rotulo === "Cliente")?.valor).toBeNull();
  });

  it("hero está ligado ao Caso 360 e o heatmap ao Radar & Matrizes", () => {
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    expect(rota).toContain("<CaseHealthHero");
    expect(rota).toContain("pessoas360=");
    const radar = readFileSync("src/components/desk/radar-interno-integrado.tsx", "utf8");
    expect(radar).toContain("<HeatmapAderenciaPais");
  });

  it("preserva as quatro correções visuais da auditoria de 10/10", () => {
    const heatmap = readFileSync("src/components/desk/heatmap-aderencia-pais.tsx", "utf8");
    expect(heatmap).toContain("mb-24");
    expect(heatmap).toContain("md:mr-40");

    const jornada = readFileSync("src/routes/portal/jornada.tsx", "utf8");
    expect(jornada).not.toContain("Radar · média dos eixos com base");
    expect(jornada).toContain("Os próximos passos aparecerão aqui quando estiverem prontos para compartilhar.");

    const legado = readFileSync("src/routes/portal/legado.tsx", "utf8");
    expect(legado).toContain("data-legado-disclaimer");
    expect(legado).toContain("Não substitui acompanhamento terapêutico, psicológico ou médico.");

    const conta = readFileSync("src/routes/portal/conta.tsx", "utf8");
    expect(conta).toContain("Condição familiar: 3 assinaturas / parcelas mensais");
    expect(conta).toContain("a11a0000-0000-4000-8000-000000000002");
  });
});
