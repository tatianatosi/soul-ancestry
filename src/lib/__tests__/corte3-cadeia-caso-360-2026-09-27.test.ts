import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  camadaLiberacao,
  camadaPlano,
  camadaProdutoPai,
  camadaTrilhaJuridica,
  montarCadeiaCaso360,
} from "@/lib/cadeia-caso-360";

/**
 * Corte 3 (27/09/2026): Cadeia Caso 360 — camada de leitura unificada
 * pedida explicitamente pela Proprietária ("uma das premissas principais
 * do caso... deve estar na visão"). Reconstruído do zero (não revive a
 * branch abandonada), só leitura, nenhum writer/tabela novo.
 */

describe("Corte 3 — camadaProdutoPai", () => {
  it("sem case_service ou produto vinculado, fica pendente", () => {
    const c = camadaProdutoPai(null, null);
    expect(c.estado).toBe("pendente");
    expect(c.codigo).toBeNull();
  });

  it("com produto vinculado mas sem condição comercial aprovada, ainda pendente", () => {
    const c = camadaProdutoPai(
      { product_catalog_id: "p1", composicao_familiar: "titular+dependente", condicao_comercial_aprovada: null },
      { code: "PP-01", nome_comercial: "Diagnóstico Familiar Multipaís" },
    );
    expect(c.estado).toBe("pendente");
    expect(c.codigo).toBe("PP-01");
  });

  it("com condição comercial aprovada, operável", () => {
    const c = camadaProdutoPai(
      { product_catalog_id: "p1", composicao_familiar: null, condicao_comercial_aprovada: "aprovado em 20/09" },
      { code: "PP-01", nome_comercial: "Diagnóstico Familiar Multipaís" },
    );
    expect(c.estado).toBe("operavel");
  });
});

describe("Corte 3 — camadaTrilhaJuridica", () => {
  it("sem trilha, pendente", () => {
    expect(camadaTrilhaJuridica(null).estado).toBe("pendente");
  });

  it("lifecycle vigente/homologado, operável", () => {
    expect(
      camadaTrilhaJuridica({ pais: "Itália", via_preliminar: "materna", status_via: "em_analise", lifecycle_status: "vigente" })
        .estado,
    ).toBe("operavel");
  });

  it("lifecycle suspenso/arquivado, bloqueado — nunca escondido como pendente", () => {
    expect(
      camadaTrilhaJuridica({ pais: "Itália", via_preliminar: null, status_via: null, lifecycle_status: "suspenso" }).estado,
    ).toBe("bloqueado");
  });
});

describe("Corte 3 — camadaPlano", () => {
  it("status ativo ou concluido, operável; arquivado, bloqueado; senão pendente", () => {
    expect(camadaPlano({ produto_pai_id: null, fase_jornada: null, status: "ativo", proxima_acao: null }).estado).toBe(
      "operavel",
    );
    expect(
      camadaPlano({ produto_pai_id: null, fase_jornada: null, status: "concluido", proxima_acao: null }).estado,
    ).toBe("operavel");
    expect(
      camadaPlano({ produto_pai_id: null, fase_jornada: null, status: "arquivado", proxima_acao: null }).estado,
    ).toBe("bloqueado");
    expect(camadaPlano({ produto_pai_id: null, fase_jornada: null, status: "rascunho", proxima_acao: null }).estado).toBe(
      "pendente",
    );
  });
});

describe("Corte 3 — camadaLiberacao (estágio de liberação Desk→App, nunca envio automático)", () => {
  it("sem nenhuma projeção, pendente", () => {
    expect(camadaLiberacao([]).estado).toBe("pendente");
  });

  it("com ao menos uma publicada, operável", () => {
    const c = camadaLiberacao([{ approval_status: "draft" }, { approval_status: "published" }]);
    expect(c.estado).toBe("operavel");
    expect(c.publicadas).toBe(1);
    expect(c.rascunhos).toBe(1);
  });
});

describe("Corte 3 — montarCadeiaCaso360 compõe as 4 camadas + raciocínio jurídico, sem fundir nada", () => {
  /*
   * 04/10/2026 — passou a 6 campos: `indiceInterno` entrou por correção de
   * escopo da Proprietária ("não está proibido o score; uso interno de
   * elegibilidade está dentro das premissas do radar e matrizes"). Os 5
   * anteriores continuam intactos e separados — o índice é composição, não
   * fusão: os três componentes seguem expostos ao lado dele.
   */
  it("devolve os 6 campos esperados, cada um com sua própria estrutura", () => {
    const r = montarCadeiaCaso360({
      caseService: null,
      produtoCatalogo: null,
      track: null,
      plano: null,
      projecoes: [],
      raciocinioJuridico: {
        continuidade: [],
        completude: { documentosMinimosOk: false, totalEvidencias: 0, evidenciasValidadas: 0, proporcaoValidada: null, pendencias: [] },
        confiabilidade: {
          totalRegras: 0,
          regrasAprovadas: 0,
          totalMarcos: 0,
          marcosVigentes: 0,
          proporcaoRegrasAprovadas: null,
          proporcaoMarcosVigentes: null,
          pendencias: [],
        },
      },
    });
    expect(Object.keys(r).sort()).toEqual([
      "indiceInterno",
      "liberacao",
      "plano",
      "produtoPai",
      "raciocinioJuridico",
      "trilhaJuridica",
    ]);
    // o índice não substitui os três: eles continuam lá, cada um com sua forma
    expect(r.raciocinioJuridico.completude.proporcaoValidada).toBeNull();
    expect(r.indiceInterno.usoPermitido).toBe("interno_radar_e_matrizes");
    expect(r.indiceInterno.componentes).toEqual({ continuidade: 0, completude: 0, confiabilidade: 0 });
  });
});

describe("Corte 3 — montado na Visão de Caso 360, ao lado de FasesMotorCidadania (não substituindo Jornada/Pesquisa)", () => {
  const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

  it("CadeiaCaso360 é importado e renderizado logo após FasesMotorCidadania", () => {
    expect(pagina).toContain('import { CadeiaCaso360 } from "@/components/caso/cadeia-caso-360"');
    const posFases = pagina.indexOf("<FasesMotorCidadania caseId={id} />");
    const posCadeia = pagina.indexOf("<CadeiaCaso360 caseId={id} />");
    expect(posFases).toBeGreaterThan(-1);
    expect(posCadeia).toBeGreaterThan(posFases);
    expect(posCadeia - posFases).toBeLessThan(100);
  });

  it("SecaoAncora da Visão continua existindo (não substitui a estrutura das 8 seções)", () => {
    expect(pagina).toMatch(/<SecaoAncora\s+id="visao"/);
  });
});
