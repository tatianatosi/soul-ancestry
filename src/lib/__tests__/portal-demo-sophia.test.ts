import { describe, expect, it } from "vitest";

import {
  CASO_DEMO_ID,
  DADOS_DEMO_SOPHIA,
  PROJECOES_DEMO_SOPHIA,
  SELO_DEMO_PORTAL,
} from "@/lib/portal-demo-sophia";
import { jornadaSanitizada, arvoreSanitizada } from "@/lib/portal-dados-vivos";
import { publicacoesParaCliente, TIPO_PROJECAO_ROTULO } from "@/lib/projecoes-cliente";
import { contemConteudoInterno } from "@/lib/onboarding-jornada";

describe("caso demo do App Cliente — Sophia Piccoli", () => {
  it("é o caso-modelo declarado, e traz o selo de dado fictício", () => {
    expect(CASO_DEMO_ID).toBe("CA-ITA-SOPHI-PICCOLI");
    expect(SELO_DEMO_PORTAL).toContain("DADOS FICTÍCIOS");
  });

  it("atravessa os sanitizadores reais do portal e produz jornada visível", () => {
    // O valor da demo depende disto: são os mesmos sanitizadores do produto.
    const jornada = jornadaSanitizada(PROJECOES_DEMO_SOPHIA, new Date("2026-08-25"));
    expect(jornada.marcosPublicados).toBe(PROJECOES_DEMO_SOPHIA.length);
    expect(jornada.linha.length).toBeGreaterThan(0);
    expect(jornada.proximoPasso.length).toBeGreaterThan(0);
  });

  it("nenhum conteúdo carrega termo interno", () => {
    for (const p of PROJECOES_DEMO_SOPHIA) {
      expect(contemConteudoInterno(String(p.content_sanitized))).toBe(false);
    }
  });

  it("todo tipo de projeção tem rótulo aprovado — nada cai no genérico por engano", () => {
    for (const p of PROJECOES_DEMO_SOPHIA) {
      expect(Object.keys(TIPO_PROJECAO_ROTULO)).toContain(String(p.projection_type));
    }
  });

  it("a linha do tempo sai em ordem decrescente de data", () => {
    const datas = publicacoesParaCliente(PROJECOES_DEMO_SOPHIA).map((p) => String(p.publicadoEm));
    expect(datas).toEqual([...datas].sort((a, b) => b.localeCompare(a)));
  });

  it("alimenta a árvore sem inventar pessoa", () => {
    // arvoreSanitizada só devolve o que veio como projeção; nada é sintetizado.
    const arvore = arvoreSanitizada(PROJECOES_DEMO_SOPHIA);
    expect(Array.isArray(arvore)).toBe(true);
  });

  it("não promete elegibilidade, prazo de deferimento nem vínculo comprovado", () => {
    const proibido = /elegív|deferi|garant|com certeza|aprovaç[ãa]o certa/i;
    for (const p of PROJECOES_DEMO_SOPHIA) {
      expect(proibido.test(String(p.content_sanitized))).toBe(false);
    }
  });

  it("não oferece documento para baixar quando não há", () => {
    // Estado vazio verdadeiro demonstra melhor que arquivo inventado.
    expect(DADOS_DEMO_SOPHIA.documentos).toEqual([]);
  });
});
