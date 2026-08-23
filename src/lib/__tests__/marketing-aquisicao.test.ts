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
