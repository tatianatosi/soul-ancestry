import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { GRUPOS_DESK, grupoNavAtivo, itemNavAtivo, rotaAtendeDestino } from "@/lib/navegacao-desk";
import {
  filtrarPorBusca,
  pendenciaPesquisaAberta,
  rotuloFonteNegocio,
  separarNotaTecnica,
  workflowStatusDeEvidenciaModulo,
} from "@/lib/rotulo-negocio";

describe("rota do menu sem colisão de prefixo", () => {
  it("/pesquisa não marca /pesquisa-modulo; /casos marca a ficha", () => {
    expect(rotaAtendeDestino("/pesquisa-modulo", "/pesquisa")).toBe(false);
    expect(rotaAtendeDestino("/pesquisa-modulo/abc", "/pesquisa-modulo")).toBe(true);
    expect(rotaAtendeDestino("/casos/xyz", "/casos")).toBe(true);
    expect(rotaAtendeDestino("/casos", "/casos")).toBe(true);
    expect(rotaAtendeDestino("/crm-mestre", "/crm")).toBe(false);
  });

  it("item com hash só fica ativo no âncora correspondente", () => {
    expect(itemNavAtivo("/marketing", "canais-campanhas", { to: "/marketing", hash: "canais-campanhas" })).toBe(true);
    expect(itemNavAtivo("/marketing", "canais-campanhas", { to: "/marketing" })).toBe(false);
    expect(itemNavAtivo("/marketing", "", { to: "/marketing" })).toBe(true);
  });

  it("atalho não doura o grupo errado", () => {
    const pesquisa = GRUPOS_DESK.find((g) => g.id === "pesquisa")!;
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    expect(grupoNavAtivo("/matriz-juridica", "", comercial)).toBe(false);
    // V4: trilha jurídica virou alimento do caso e saiu do menu.
    expect(grupoNavAtivo("/matriz-juridica", "", pesquisa)).toBe(false);
    expect(grupoNavAtivo("/pesquisa-modulo", "", pesquisa)).toBe(true);
  });

  it("o grupo Inteligência entra no módulo vivo e no dossiê do Legado", () => {
    const bib = GRUPOS_DESK.find((g) => g.id === "pesquisa")!;
    expect(bib.to).toBe("/pesquisa-modulo");
    const rotas = bib.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotas).toContain("/pesquisa-modulo");
    // V4: o dossiê legado saiu do menu; o módulo vivo é /pesquisa-modulo.
    expect(rotas).toContain("/pesquisa-modulo");
  });
});

describe("rótulos de negócio e notas técnicas", () => {
  it("traduz nomes de tabela sem apagar o técnico no mapa", () => {
    expect(rotuloFonteNegocio("genealogical_sources_catalog")).toBe("Catálogo de bases genealógicas");
    expect(rotuloFonteNegocio("evidences · research_evidence_items")).toContain("Cadeia de custódia");
    expect(rotuloFonteNegocio("evidences · research_evidence_items")).toContain("módulo de pesquisa");
  });

  it("separa log técnico da justificativa humana", () => {
    const { humana, tecnica } = separarNotaTecnica(
      "Manter cláusula de foro.\nRestaurado em 08/09/2026 14:02\nCHECK constraint workflow_status",
    );
    expect(humana).toContain("foro");
    expect(tecnica).toMatch(/Restaurado em/i);
  });

  it("filtra lista por texto visível", () => {
    const linhas = filtrarPorBusca(
      [
        { codigo: "CA-1", titulo: "Família Rossi" },
        { codigo: "CA-2", titulo: "Família Silva" },
      ],
      "rossi",
      ["codigo", "titulo"],
    );
    expect(linhas).toHaveLength(1);
    expect(linhas[0]!.codigo).toBe("CA-1");
  });

  it("mapeia evidência do módulo vivo para a cadeia e reconhece pendência aberta", () => {
    expect(workflowStatusDeEvidenciaModulo("validated")).toBe("aprovada_para_entrega");
    expect(pendenciaPesquisaAberta("open")).toBe(true);
    expect(pendenciaPesquisaAberta("resolved")).toBe(false);
    expect(pendenciaPesquisaAberta("resolvido")).toBe(false);
  });
});

describe("regressão das distorções P0/P1 no código", () => {
  it("painel operacional não exibe o aviso técnico à vista", () => {
    const src = readFileSync("src/components/painel/painel-dia.tsx", "utf8");
    expect(src).toContain("<details");
    expect(src).toMatch(/Detalhes t[eé]cnicos de leitura/);
  });

  it("App Cliente mantém só as 7 abas aprovadas na barra", () => {
    const src = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
    expect(src).not.toContain("/portal/entregas");
    expect(src).not.toContain("/portal/fase-01");
    expect(src).not.toContain("/portal/fase-02");
    // 01/11/2026: rotas vêm de `portal-navegacao.ts` (fonte única), não de lista no shell.
    expect(src).toContain("abasCanonicasDoPortal()");
    const nav = readFileSync("src/lib/portal-navegacao.ts", "utf8");
    expect(nav).toContain("/portal/jornada");
    expect(nav).toContain("/portal/conta");
  });

  it("Comercial não usa o título técnico de funil na casca", () => {
    const src = readFileSync("src/routes/_authenticated/conversao.tsx", "utf8");
    expect(src).toContain('titulo="Comercial"');
    expect(src).not.toContain('titulo="Conversão — funil por eventos"');
  });

  it("Radar & Matrizes não carrega frase histórica no subtítulo", () => {
    const src = readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8");
    expect(src).not.toContain("Antes chamado Qualidade");
  });
});
