import { describe, expect, it } from "vitest";

import {
  ACOES_EXTERNAS_BLOQUEADAS,
  CAMADAS_WHATSAPP,
  CANAIS_HANDOFF,
  FRONTEIRA_MARKETING_COMERCIAL,
  MAPA_MARKETING,
  METRICAS_MARKETING,
  SECOES_MARKETING,
  SEM_DADOS,
  aprendizadosCampanha,
  desempenhoAgregado,
  desempenhoPorCanal,
  leituraMetricas,
  resumoPorOrigem,
} from "@/lib/marketing-aquisicao";

const vazio = {
  leads: [] as { origem?: string | null }[],
  eventos: [] as { origem?: string | null }[],
  investimentos: [],
  campanhas: [],
  fontes: [],
  atribuicoes: [],
};

describe("Marketing e aquisição — CA-UX-04", () => {
  it("separa marketing de comercial de forma explícita", () => {
    expect(FRONTEIRA_MARKETING_COMERCIAL.marketing).toMatch(/aquisi/i);
    expect(FRONTEIRA_MARKETING_COMERCIAL.comercial).toMatch(/lead identificado/i);
    expect(FRONTEIRA_MARKETING_COMERCIAL.regra).toMatch(/nunca duplica/i);
  });

  it("tem as 7 seções canônicas da aba mais o handoff", () => {
    expect(SECOES_MARKETING.map((s) => s.hash)).toEqual([
      "visao-geral",
      "canais-campanhas",
      "conteudo-ctas",
      "atribuicao",
      "funil-aquisicao",
      "metricas-canal",
      "aprendizados",
      "links-comercial",
    ]);
  });

  it("mapeia WhatsApp em camadas separadas e mantém envio externo desligado", () => {
    const camadas = CAMADAS_WHATSAPP.map((c) => c.camada);
    expect(camadas).toHaveLength(5);
    const envio = CAMADAS_WHATSAPP.find((c) => c.natureza === "externo")!;
    expect(envio.estado).toBe("ausente");
    expect(envio.regra).toMatch(/confirmação final/i);
  });

  it("declara lacuna e destino para cada item do mapa (tabela J)", () => {
    for (const l of MAPA_MARKETING) {
      expect(l.lacuna.length).toBeGreaterThan(5);
      expect(l.destino.length).toBeGreaterThan(5);
    }
  });

  it("toda métrica tem fonte e confiança declaradas (tabela K)", () => {
    for (const m of METRICAS_MARKETING) {
      expect(m.fonte.length).toBeGreaterThan(0);
      expect(["alta", "media", "baixa", "sem_dados"]).toContain(m.confianca);
    }
  });

  it("todo canal declara origem, handoff e risco (tabela L)", () => {
    for (const c of CANAIS_HANDOFF) {
      expect(c.origemGravada.length).toBeGreaterThan(0);
      expect(c.risco.length).toBeGreaterThan(5);
    }
  });

  it("sem dado, CAC e ROI nunca são estimados", () => {
    const leitura = leituraMetricas(vazio);
    for (const chave of ["cac", "roi"]) {
      const m = leitura.find((x) => x.chave === chave)!;
      expect(m.valor).toBe(SEM_DADOS);
      expect(m.confianca).toBe("sem_dados");
    }
  });

  it("27/08/2026 — CAC e ROI ficam reais quando há investimento e pagamento confirmado atribuído", () => {
    // Antes deste ajuste, CAC/ROI em /marketing nunca mostravam número —
    // sempre "Calculável — revisar classificação", mesmo com dado
    // suficiente. A leitura agora reusa a mesma fórmula de indicadores-marketing.ts
    // (a mesma que /financeiro já usa), só sem inventar valor quando falta dado.
    const entrada = {
      ...vazio,
      investimentos: [{ canal: "meta_ads", valor: 1000 }],
      atribuicoes: [{ canal: "meta_ads", case_id: "caso-1", valor_convertido: 3000 }],
      casos: [{ id: "caso-1", pagamento_confirmado: true }],
    };

    const agregado = desempenhoAgregado(entrada);
    expect(agregado.cac).toEqual({ estado: "ok", valor: 1000, unidade: "moeda" });
    expect(agregado.roi).toEqual({ estado: "ok", valor: 200, unidade: "percentual" });

    const leitura = leituraMetricas(entrada);
    expect(leitura.find((x) => x.chave === "cac")!.valor).not.toBe(SEM_DADOS);
    expect(leitura.find((x) => x.chave === "roi")!.valor).not.toBe(SEM_DADOS);
  });

  it("desempenho por canal nunca conta lead ou proposta como venda — só caso com pagamento confirmado", () => {
    const entrada = {
      ...vazio,
      investimentos: [{ canal: "google", valor: 500 }],
      atribuicoes: [{ canal: "google", case_id: "caso-2", valor_convertido: 900 }],
      casos: [{ id: "caso-2", pagamento_confirmado: false }],
    };
    const [linha] = desempenhoPorCanal(entrada);
    expect(linha.pagamentosAtribuidos).toBe(0);
    expect(linha.cac).toEqual({ estado: "sem_dados", motivo: expect.any(String) });
  });

  it("aprendizados das campanhas são derivados do desempenho, nunca uma lista fixa", () => {
    expect(aprendizadosCampanha(vazio)[0]).toMatch(/nenhum aprendizado/i);

    const comRetorno = aprendizadosCampanha({
      ...vazio,
      investimentos: [{ canal: "meta_ads", valor: 1000 }],
      atribuicoes: [{ canal: "meta_ads", case_id: "caso-3", valor_convertido: 3000 }],
      casos: [{ id: "caso-3", pagamento_confirmado: true }],
    });
    expect(comRetorno.join(" ")).toMatch(/melhor cac/i);

    const semRetorno = aprendizadosCampanha({
      ...vazio,
      investimentos: [{ canal: "google", valor: 500 }],
      atribuicoes: [],
      casos: [],
    });
    expect(semRetorno.join(" ")).toMatch(/sem nenhum pagamento atribuído/i);
  });

  it("agrupa origem sem inventar valor ausente", () => {
    const r = resumoPorOrigem({
      ...vazio,
      leads: [{ origem: "indicacao" }, { origem: null }, { origem: "indicacao" }],
    });
    expect(r.find((x) => x.rotulo === "indicacao")!.leads).toBe(2);
    expect(r.find((x) => x.rotulo === "Origem não informada")!.leads).toBe(1);
  });

  it("nenhuma ação externa é oferecida pela superfície", () => {
    expect(ACOES_EXTERNAS_BLOQUEADAS.length).toBeGreaterThanOrEqual(5);
  });
});
