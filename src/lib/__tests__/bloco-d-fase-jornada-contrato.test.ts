import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  avaliarPlanejador,
  FASE_JORNADA_PADRAO,
  type EntradaPlanejador,
} from "../cadeia-operacional";
import { FASES_JORNADA } from "../onboarding-jornada";

/**
 * Bloco D da ordem "Execução Técnica Total" (21/09/2026).
 *
 * `case_plans.fase_jornada` é `text NOT NULL DEFAULT 'aceite_e_formalizacao'`
 * com CHECK de 8 valores (migration `20260821123530`). O motor emitia `null`
 * e `sincronizarPlanejador` mandava esse `null` explícito no payload — e em
 * Postgres o DEFAULT não resgata NULL explícito: viola o NOT NULL.
 *
 * Estes testes travam o contrato dos dois lados: o motor nunca emite NULL, e
 * o valor emitido está sempre dentro do CHECK.
 */

const entradaMinima = (): EntradaPlanejador => ({
  caseId: "caso-1",
  objetivo: null,
  etapa: null,
  composicao: null,
  rotaConfirmada: null,
  produtoSkuCodigo: null,
  dadosDisponiveis: [],
  dependenciasCliente: [],
  dependenciasTerceiros: [],
  fontes: [],
  responsavelUserId: null,
  proximaAcao: null,
  prazoProximaAcao: null,
  faseJornada: null,
  produtoPaiId: null,
  checklist: [],
  perguntas: [],
  marcos: [],
  entregas: [],
  microentregas: [],
  regrasAnexos: [],
});

const VALORES_DO_CHECK = [
  "aceite_e_formalizacao",
  "onboarding",
  "pesquisa_inicial",
  "pesquisa_e_validacao",
  "preparacao_documental",
  "protocolo_e_acompanhamento",
  "reconhecimento",
  "pos_reconhecimento",
];

describe("fase_jornada nunca vira NULL numa coluna NOT NULL", () => {
  it("sem fase escolhida, emite o padrão em vez de null", () => {
    const saida = avaliarPlanejador(entradaMinima());
    expect(saida.fase_jornada).not.toBeNull();
    expect(saida.fase_jornada).toBe(FASE_JORNADA_PADRAO);
  });

  it("o padrão é exatamente o DEFAULT da coluna — o motor não inventa estado", () => {
    expect(FASE_JORNADA_PADRAO).toBe("aceite_e_formalizacao");
  });

  it("a fase escolhida é preservada, não sobrescrita pelo padrão", () => {
    const saida = avaliarPlanejador({ ...entradaMinima(), faseJornada: "pesquisa_e_validacao" });
    expect(saida.fase_jornada).toBe("pesquisa_e_validacao");
  });

  it("qualquer das 8 fases do catálogo atravessa o motor intacta", () => {
    for (const f of FASES_JORNADA) {
      const saida = avaliarPlanejador({ ...entradaMinima(), faseJornada: f.id });
      expect(saida.fase_jornada).toBe(f.id);
    }
  });

  it("toda saída possível está dentro do CHECK da migration", () => {
    const emitidas = new Set<string>([avaliarPlanejador(entradaMinima()).fase_jornada]);
    for (const f of FASES_JORNADA) {
      emitidas.add(avaliarPlanejador({ ...entradaMinima(), faseJornada: f.id }).fase_jornada);
    }
    for (const v of emitidas) expect(VALORES_DO_CHECK).toContain(v);
  });

  it("o catálogo de fases e o CHECK da migration não divergiram", () => {
    // Se alguém acrescentar fase no TS sem migration (ou vice-versa), o
    // planejador volta a gravar valor recusado pelo banco.
    const migration = readFileSync(
      "supabase/migrations/20260821123530_377b03ff-c6ca-4730-b0d7-58e6ce874189.sql",
      "utf8",
    );
    for (const f of FASES_JORNADA) expect(migration).toContain(`'${f.id}'`);
    expect(FASES_JORNADA).toHaveLength(VALORES_DO_CHECK.length);
  });
});

describe("a tela do planejador deixou de mandar fase nula", () => {
  const form = readFileSync("src/components/contrato/planejador-operacional.tsx", "utf8");

  it("não envia mais faseJornada hardcoded como null", () => {
    expect(form).not.toContain("faseJornada: null");
    expect(form).toContain("faseJornada: estado.faseJornada || null");
  });

  it("oferece a escolha da fase a partir do catálogo canônico, sem lista paralela", () => {
    expect(form).toContain('from "@/lib/onboarding-jornada"');
    expect(form).toContain("FASES_JORNADA.map");
  });
});

describe("bloqueios do planejador", () => {
  it("fonte em conflito vira bloqueio explícito", () => {
    const saida = avaliarPlanejador({
      ...entradaMinima(),
      fontes: [{ chave: "certidao", estado: "conflito" }],
    });
    expect(saida.bloqueios.length).toBe(1);
    expect(saida.bloqueios[0]).toContain("certidao");
  });

  it("fonte pendente vira pendência, não bloqueio", () => {
    const saida = avaliarPlanejador({
      ...entradaMinima(),
      fontes: [{ chave: "certidao", estado: "pendente" }],
    });
    expect(saida.bloqueios).toHaveLength(0);
    expect(saida.pendencias.some((p) => p.includes("certidao"))).toBe(true);
  });
});
