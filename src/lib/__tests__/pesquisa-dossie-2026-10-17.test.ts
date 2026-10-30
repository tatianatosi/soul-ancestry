import { describe, expect, it } from "vitest";

import { agregarDossiePesquisa } from "@/lib/pesquisa-dossie";

describe("Tela 07 — dossiê de pesquisa (/pesquisa-modulo)", () => {
  it("1. KPIs contam acervos, hipóteses abertas, evidências validadas e cartórios acionados", () => {
    const d = agregarDossiePesquisa({
      acervosCatalogo: [{ id: "a1" }, { id: "a2" }, { id: "a3" }],
      hipoteses: [
        { status: "open" },
        { status: "under_review" },
        { status: "supported" },
        { status: "closed" },
      ],
      evidencias: [
        { evidence_status: "validated", created_at: "2026-10-01" },
        { evidence_status: "validated", created_at: "2026-09-15" },
        { evidence_status: "under_review", created_at: "2026-10-05" },
      ],
      fontes: [{ source_type: "civil_record" }],
      pedidos: [
        { status: "requested_from_client", target_institution: "Cartório de Lucca" },
        { status: "completed", target_institution: "Cartório de Lucca" },
        { status: "draft", target_institution: "Paróquia de Santos" },
        { status: "under_review", target_institution: null },
      ],
    });

    expect(d.acervosMapeados).toBe(3);
    expect(d.hipotesesEmAberto).toBe(2);
    expect(d.evidenciasValidadas).toBe(2);
    // "Cartório de Lucca" só conta uma vez; pedido em draft e sem instituição não contam.
    expect(d.cartoriosAcionados).toBe(1);
  });

  it("2. cobertura de fontes agrupa por source_type real, maior quantidade primeiro, com rótulo pt-BR", () => {
    const d = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [],
      evidencias: [],
      fontes: [
        { source_type: "civil_record" },
        { source_type: "civil_record" },
        { source_type: "religious_record" },
      ],
      pedidos: [],
    });

    expect(d.totalFontes).toBe(3);
    expect(d.coberturaFontes).toEqual([
      { tipo: "civil_record", rotulo: "Registro civil", quantidade: 2 },
      { tipo: "religious_record", rotulo: "Paroquial", quantidade: 1 },
    ]);
  });

  it("3. tipo de fonte fora do dicionário conhecido não é descartado nem inventa rótulo falso", () => {
    const d = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [],
      evidencias: [],
      fontes: [{ source_type: "other" }],
      pedidos: [],
    });
    expect(d.coberturaFontes).toEqual([{ tipo: "other", rotulo: "Outra fonte", quantidade: 1 }]);
  });

  it("4. sem nenhum dado real, todos os KPIs e listas ficam honestamente vazios (nunca inferidos)", () => {
    const d = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [],
      evidencias: [],
      fontes: [],
      pedidos: [],
    });
    expect(d).toMatchObject({
      acervosMapeados: 0,
      hipotesesEmAberto: 0,
      evidenciasValidadas: 0,
      cartoriosAcionados: 0,
      coberturaFontes: [],
      totalFontes: 0,
    });
    expect(d.producaoEvidencias).toHaveLength(6);
    expect(d.producaoEvidencias.every((m) => m.quantidade === 0)).toBe(true);
  });

  it("5. produção mensal de evidências soma só por mês de created_at, 6 meses em ordem cronológica", () => {
    const hoje = new Date();
    const esteAno = hoje.getFullYear();
    const esteMes = String(hoje.getMonth() + 1).padStart(2, "0");
    const d = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [],
      evidencias: [
        { created_at: `${esteAno}-${esteMes}-10` },
        { created_at: `${esteAno}-${esteMes}-20` },
        { created_at: "2019-01-01" },
      ],
      fontes: [],
      pedidos: [],
    });
    expect(d.producaoEvidencias).toHaveLength(6);
    expect(d.producaoEvidencias[5]!.quantidade).toBe(2);
    const total = d.producaoEvidencias.reduce((s, m) => s + m.quantidade, 0);
    expect(total).toBe(2);
  });

  it("6. fontes recentes mapeiam source_status real, sem inventar rótulo nem descartar instituição ausente", () => {
    const d = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [],
      evidencias: [],
      fontes: [
        { id: "f1", title: "Arquivo paroquial — Lucca", source_status: "reviewed", repository_or_institution: "Paróquia de Lucca", created_at: "2026-10-01" },
        { id: "f2", title: "Lista de imigração", source_status: "located", repository_or_institution: null, created_at: "2026-10-02" },
      ],
      pedidos: [],
    });
    expect(d.fontesRecentes).toEqual([
      { id: "f2", titulo: "Lista de imigração", status: "located", rotuloStatus: "Localizada", instituicao: null },
      { id: "f1", titulo: "Arquivo paroquial — Lucca", status: "reviewed", rotuloStatus: "Revisada", instituicao: "Paróquia de Lucca" },
    ]);
  });

  it("7. hipóteses recentes mapeiam status e confidence_level reais, mais recente primeiro", () => {
    const d = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [
        { id: "h1", title: "Grafia alternativa", status: "under_review", confidence_level: "medium", created_at: "2026-10-01" },
        { id: "h2", title: "Segundo casamento", status: "open", confidence_level: "low", created_at: "2026-10-05" },
      ],
      evidencias: [],
      fontes: [],
      pedidos: [],
    });
    expect(d.hipotesesRecentes[0]).toMatchObject({ id: "h2", rotuloStatus: "Aberta", rotuloConfianca: "Baixa" });
    expect(d.hipotesesRecentes[1]).toMatchObject({ id: "h1", rotuloStatus: "Em revisão", rotuloConfianca: "Média" });
  });

  it("8. confiança da cadeia é a média de confidence_level (low=33/medium=66/high=100) só entre hipóteses não encerradas", () => {
    const comDado = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [
        { status: "open", confidence_level: "high" },
        { status: "under_review", confidence_level: "medium" },
        { status: "closed", confidence_level: "low" }, // encerrada: não entra na média
      ],
      evidencias: [],
      fontes: [],
      pedidos: [],
    });
    expect(comDado.confiancaCadeiaPct).toBe(83); // (100+66)/2 = 83

    const semHipoteseAtiva = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [{ status: "closed", confidence_level: "high" }],
      evidencias: [],
      fontes: [],
      pedidos: [],
    });
    expect(semHipoteseAtiva.confiancaCadeiaPct).toBeNull();
  });

  it("9. etapas da pesquisa: Pergunta e Pronta para revisão sempre sem rastro; as demais refletem presença real", () => {
    const vazio = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [],
      evidencias: [],
      fontes: [],
      pedidos: [],
    });
    expect(vazio.etapas).toEqual([
      { id: "pergunta", titulo: "Pergunta", ativa: false, semRastro: true },
      { id: "fonte", titulo: "Fonte", ativa: false },
      { id: "evidencia", titulo: "Evidência", ativa: false },
      { id: "achado", titulo: "Achado", ativa: false },
      { id: "microentrega", titulo: "Microentrega", ativa: false },
      { id: "revisao", titulo: "Pronta para revisão", ativa: false, semRastro: true },
    ]);

    const comDado = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [],
      evidencias: [{ evidence_status: "validated", created_at: "2026-10-01" }],
      fontes: [{ source_type: "civil_record" }],
      pedidos: [],
      achados: [{ id: "a1" }],
      microentregas: [{ id: "m1" }],
    });
    expect(comDado.etapas.find((e) => e.id === "fonte")?.ativa).toBe(true);
    expect(comDado.etapas.find((e) => e.id === "evidencia")?.ativa).toBe(true);
    expect(comDado.etapas.find((e) => e.id === "achado")?.ativa).toBe(true);
    expect(comDado.etapas.find((e) => e.id === "microentrega")?.ativa).toBe(true);
    expect(comDado.etapas.find((e) => e.id === "pergunta")?.ativa).toBe(false);
    expect(comDado.etapas.find((e) => e.id === "revisao")?.ativa).toBe(false);
  });

  it("10. prancha V4: contagem real por etapa (Pergunta/Revisão sem rastro = null) e denominador da confiança", () => {
    const vazio = agregarDossiePesquisa({ acervosCatalogo: [], hipoteses: [], evidencias: [], fontes: [], pedidos: [] });
    expect(vazio.contagemPorEtapa).toEqual({
      pergunta: null,
      fonte: 0,
      evidencia: 0,
      achado: 0,
      microentrega: 0,
      revisao: null,
    });
    expect(vazio.baseConfiancaCadeia).toBe(0);

    const comDado = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [
        { status: "open", confidence_level: "high" },
        { status: "open", confidence_level: "" }, // sem nível: fora do denominador
        { status: "closed", confidence_level: "low" },
      ],
      evidencias: [
        { evidence_status: "validated", created_at: "2026-10-01" },
        { evidence_status: "under_review", created_at: "2026-10-01" },
      ],
      fontes: [{ source_type: "civil_record" }, { source_type: "other" }],
      pedidos: [],
      achados: [{ id: "a1" }],
      microentregas: [],
    });
    expect(comDado.contagemPorEtapa).toMatchObject({ fonte: 2, evidencia: 1, achado: 1, microentrega: 0 });
    expect(comDado.baseConfiancaCadeia).toBe(1);
    expect(comDado.confiancaCadeiaPct).toBe(100);
  });
});
