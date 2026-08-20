import { describe, expect, it } from "vitest";

import {
  avaliarAssinaturaPelaMatriz,
  canonicalizarTemaCodigo,
  planejarDeduplicacao,
  podeGerarClausula,
  preparacaoInternaPermitida,
  type LinhaMatriz,
} from "@/lib/matriz-juridica";

const linha = (p: Partial<LinhaMatriz>): LinhaMatriz => ({
  tema_codigo: "foro",
  tema: "Foro",
  status: "pendente_revisao_juridica",
  versao_juridica_aplicavel: null,
  responsavel_revisao: null,
  decisao: null,
  justificativa: null,
  decidido_em: null,
  referencia_versao: null,
  impacto_templates: ["BASE-GEN-V2"],
  bloqueia_assinatura: true,
  ...p,
});

describe("matriz jurídica — ANA-E-01", () => {
  it("1. mantém uma linha canônica por tema", () => {
    const planos = planejarDeduplicacao([
      { id: "a", tema_codigo: "foro", decidido_em: "2026-01-02" },
      { id: "b", tema_codigo: "foro", decidido_em: null, updated_at: "2026-01-01" },
      { id: "c", tema_codigo: "rescisao" },
    ]);
    expect(planos).toHaveLength(1);
    expect(planos[0]!.canonica_id).toBe("a");
  });

  it("2. duplicata é arquivada com trilha, sem exclusão física", () => {
    const [plano] = planejarDeduplicacao([
      { id: "a", tema_codigo: "dados_retencao", decidido_em: "2026-02-01" },
      { id: "b", tema_codigo: "retencao_dados", updated_at: "2026-01-01" },
    ]);
    expect(plano!.tema_codigo).toBe(canonicalizarTemaCodigo("dados_retencao"));
    expect(plano!.arquivar).toEqual([
      { id: "b", motivo: expect.stringContaining("Deduplicação"), substituido_por_id: "a" },
    ]);
  });

  it("3. tema bloqueante pendente impede assinatura", () => {
    const r = avaliarAssinaturaPelaMatriz([linha({}), linha({ tema_codigo: "parcelamento", tema: "Parcelamento", bloqueia_assinatura: false })]);
    expect(r.liberada).toBe(false);
    expect(r.bloqueios).toHaveLength(1);
  });

  it("4. tema aprovado com versão vigente libera apenas preparação interna", () => {
    const l = linha({ status: "aprovado", versao_juridica_aplicavel: "v2026.1" });
    expect(avaliarAssinaturaPelaMatriz([l]).liberada).toBe(true);
    expect(preparacaoInternaPermitida(l, ["v2026.1"]).permitido).toBe(true);
    expect(preparacaoInternaPermitida(l, ["v2025.4"]).permitido).toBe(false);
  });

  it("5. cláusula sem tema ou versão aprovada é negada", () => {
    expect(podeGerarClausula(null).permitido).toBe(false);
    expect(podeGerarClausula(linha({})).permitido).toBe(false);
    expect(podeGerarClausula(linha({ status: "aprovado" })).permitido).toBe(false);
  });
});
