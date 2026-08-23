import { describe, expect, it } from "vitest";

import { ehNomeTecnico, rotuloHumano } from "@/lib/rotulos-humanos";
import { PRONTIDAO_INTEGRACOES, ROTULO_ESTADO } from "@/lib/prontidao-integracoes";

describe("rótulos humanos", () => {
  it("traduz nomes técnicos conhecidos", () => {
    expect(rotuloHumano("case_plans")).toBe("Planos do caso");
    expect(rotuloHumano("citizenship_tracks")).toBe("Rota de cidadania");
    expect(rotuloHumano("audit_logs")).toBe("Registro de auditoria");
    expect(rotuloHumano("owner_override_events")).toBe("Decisões da proprietária");
  });

  it("humaniza chaves desconhecidas sem underscore", () => {
    expect(rotuloHumano("algo_desconhecido")).toBe("Algo desconhecido");
    expect(rotuloHumano(null)).toBe("—");
  });

  it("identifica nomes técnicos catalogados", () => {
    expect(ehNomeTecnico("commercial_conditions")).toBe(true);
    expect(ehNomeTecnico("nao_existe")).toBe(false);
  });
});

describe("prontidão de integrações", () => {
  it("declara estado válido e responsável para cada integração", () => {
    for (const i of PRONTIDAO_INTEGRACOES) {
      expect(Object.keys(ROTULO_ESTADO)).toContain(i.estado);
      expect(i.responsavel.length).toBeGreaterThan(0);
      expect(i.prerequisitos.length).toBeGreaterThan(0);
    }
  });

  it("nenhuma integração externa é declarada validada sem prova", () => {
    const validadas = PRONTIDAO_INTEGRACOES.filter((i) => i.estado === "VALIDADA_EM_QA");
    for (const i of validadas) expect(i.ultima_validacao).not.toBeNull();
  });
});
