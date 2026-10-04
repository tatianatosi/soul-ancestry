import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  CAMPOS_FICHA_MASTER,
  FRASES_DE_PREENCHIMENTO_VAZIO,
  TEXTO_ESTADO_CAMPO,
  lerCamposFichaMaster,
  resumoFichaMaster,
} from "@/lib/ficha-master-estado-campos";
import { FALLBACK } from "@/lib/evidence";
import { NOME_INSTRUMENTO } from "@/lib/resgate-contrato-planejador";

/**
 * MODO EXECUÇÃO CONTROLADA — caso real CA-CID-AT-FAM-2026-001 (04/10/2026).
 *
 * Item 2: "Use a Ficha Master como camada de leitura/projeção... Para cada
 * campo ausente, exiba 'sem dados suficientes' ou 'pendente de validação';
 * não use placeholder nem fallback demo."
 *
 * Achado que motivou o corte: `caseAdapter#toFichaPiloto` resolve campo vazio
 * com as frases de `FALLBACK` — "Em atualização documental", "Aguardando
 * confirmação", "Em validação documental", "Documento ainda não vinculado".
 * São placeholders que LEEM como conteúdo e escondem a ausência.
 */

const VAZIA: Record<string, unknown> = {};

describe("Ficha Master — 54 campos como camada de leitura (item 2)", () => {
  it("1. são exatamente os 54 campos do adaptador, sem sobra nem falta", () => {
    const adaptador = readFileSync("src/lib/caseAdapter.ts", "utf8");
    const corpo = adaptador.slice(adaptador.indexOf("return {"), adaptador.lastIndexOf("};"));
    const chaves = [...corpo.matchAll(/^\s{4}([a-z_0-9]+):/gm)].map((m) => m[1]);
    expect(chaves).toHaveLength(54);
    expect(CAMPOS_FICHA_MASTER).toHaveLength(54);
    expect(CAMPOS_FICHA_MASTER.map((c) => c.campo).sort()).toEqual([...chaves].sort());
  });

  it("2. cada campo declara um dono proprietário — a Ficha Master nunca é dona", () => {
    const donos = new Set(CAMPOS_FICHA_MASTER.map((c) => c.dono));
    for (const d of donos) expect(["pessoa", "nucleo", "pesquisa", "planejador", "contrato"]).toContain(d);
    expect(donos.size).toBeGreaterThanOrEqual(4);
  });

  it("3. campo ausente mostra o texto exigido, nunca placeholder", () => {
    const leituras = lerCamposFichaMaster(VAZIA);
    expect(leituras).toHaveLength(54);
    for (const l of leituras) {
      expect(l.valor).toBeNull();
      expect(["sem dados suficientes", "pendente de validação"]).toContain(l.exibicao);
    }
    expect(TEXTO_ESTADO_CAMPO.sem_dados_suficientes).toBe("sem dados suficientes");
    expect(TEXTO_ESTADO_CAMPO.pendente_de_validacao).toBe("pendente de validação");
  });

  it("4. frase institucional de preenchimento não passa por dado real", () => {
    const comFallback = {
      etapa_atual: FALLBACK.atualizacao,
      documento_foco: FALLBACK.aguardando,
      hipotese_principal: FALLBACK.validacao,
      entregavel_1: FALLBACK.semArquivo,
      descoberta_1: FALLBACK.semDescoberta,
    };
    for (const l of lerCamposFichaMaster(comFallback)) {
      if (Object.keys(comFallback).includes(l.campo)) {
        expect(l.estado, l.campo).not.toBe("preenchido");
        expect(l.valor, l.campo).toBeNull();
      }
    }
    // Toda frase de FALLBACK está na lista de "não é dado".
    for (const f of Object.values(FALLBACK)) expect(FRASES_DE_PREENCHIMENTO_VAZIO).toContain(f);
  });

  it("5. campo que depende de validação humana não vira 'sem dados suficientes'", () => {
    const leituras = lerCamposFichaMaster(VAZIA);
    const hipotese = leituras.find((l) => l.campo === "hipotese_principal")!;
    const heat = leituras.find((l) => l.campo === "heatmap_pct_1")!;
    expect(hipotese.estado).toBe("pendente_de_validacao");
    expect(heat.estado).toBe("pendente_de_validacao");
    const caseId = leituras.find((l) => l.campo === "case_id")!;
    expect(caseId.estado).toBe("sem_dados_suficientes");
  });

  it("6. os 6 campos de heatmap estão declarados e dependem de validação", () => {
    for (const c of ["heatmap_pais_1", "heatmap_pct_1", "heatmap_pais_2", "heatmap_pct_2", "heatmap_pais_3", "heatmap_pct_3"]) {
      const campo = CAMPOS_FICHA_MASTER.find((x) => x.campo === c);
      expect(campo, c).toBeDefined();
      expect(campo!.dependeDeValidacao, c).toBe(true);
      expect(campo!.dono, c).toBe("pesquisa");
    }
  });

  it("7. valor real sobrevive, inclusive número zero e lista", () => {
    const leituras = lerCamposFichaMaster({
      case_id: "CA-CID-AT-FAM-2026-001",
      origem_pessoas_conectadas: 0,
      link_fontes_extra: ["a", "b"],
    });
    const id = leituras.find((l) => l.campo === "case_id")!;
    expect(id.estado).toBe("preenchido");
    expect(id.valor).toBe("CA-CID-AT-FAM-2026-001");
    expect(leituras.find((l) => l.campo === "origem_pessoas_conectadas")!.estado).toBe("preenchido");
    expect(leituras.find((l) => l.campo === "link_fontes_extra")!.valor).toBe("a · b");
  });

  it("8. o resumo diz quanto falta e de quem é a falta", () => {
    const r = resumoFichaMaster(lerCamposFichaMaster(VAZIA));
    expect(r.total).toBe(54);
    expect(r.preenchidos).toBe(0);
    expect(r.pendentesDeValidacao + r.semDadosSuficientes).toBe(54);
    expect(r.porDono.pesquisa).toBeGreaterThan(0);
    expect(r.porDono.planejador).toBeGreaterThan(0);
  });

  it("9. é camada de leitura: sem escritor, sem consulta, sem quarta ficha", () => {
    const mod = readFileSync("src/lib/ficha-master-estado-campos.ts", "utf8");
    for (const proibido of ["createServerFn", "supabase", ".from(", "insert", "update"]) {
      expect(mod, proibido).not.toContain(proibido);
    }
    const comp = readFileSync("src/components/caso/ficha-master-54-campos.tsx", "utf8");
    expect(comp).not.toContain("useMutation");
    expect(comp).not.toContain("<input");
    expect(comp).not.toContain("<form");
    // Montada dentro da Ficha Única, não em rota nova.
    const unica = readFileSync("src/components/caso/ficha-unica.tsx", "utf8");
    expect(unica).toContain("FichaMaster54Campos");
  });
});

describe("Contrato: composição é premissa do v2, não outro contrato (item 5)", () => {
  it("10. o instrumento é sempre o Estudo Genealógico v2", () => {
    expect(NOME_INSTRUMENTO).toBe("Contrato de Estudo Genealógico v2");
  });

  it("11. a composição detectada aparece no fluxo, no cartão de partes", () => {
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
    const cartao2 = rota.indexOf('titulo="2. Partes e representação"');
    const cartao3 = rota.indexOf('titulo="3. Escopo e entregas"');
    const marca = rota.indexOf("data-composicao-detectada");
    expect(marca).toBeGreaterThan(cartao2);
    expect(marca).toBeLessThan(cartao3);
    expect(rota).toContain("Composição detectada:");
    expect(rota).toContain("premissa do mesmo instrumento, não outro contrato");
  });

  it("12. sem pessoas no caso, a composição é declarada ausente — não assumida", () => {
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
    expect(rota).toContain("Composição ainda não detectada");
    expect(rota).toContain("Registre as pessoas do caso");
  });
});
