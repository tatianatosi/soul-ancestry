import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { PAISES_LINHA_PRIORITARIA } from "@/lib/crm-desk";
import { FONTE_NOVA_APROVADA_POR_PADRAO } from "@/lib/decisoes-da-proprietaria";
import {
  ESTAGIOS,
  MODOS_USO,
  PRIORIDADES,
  STATUS_BACKLOG,
  STATUS_DOCUMENTACAO,
  STATUS_INTEGRACAO,
} from "@/lib/fontes-genealogicas";
import {
  FONTES_EM_PREPARACAO,
  FONTES_SUGESTAO_REGISTRADA,
  FONTE_CANDIDATA_PADRAO,
  ehFonteCandidata,
  montarSugestaoFonte,
  resumoFontesPorPais,
} from "@/lib/fontes-por-pais";

/**
 * Fontes por país deixa de ser só leitura (31/10/2026, decisão da Proprietária):
 * faz parte da Validação Jurídica e do roteiro Discovery / Painel de Calls, e
 * país sem base aceita sugestão de fonte no backlog de ativação.
 */
const viva = (pais_eixo: string, extra: Record<string, unknown> = {}) => ({
  pais_eixo,
  url_canonica: "https://exemplo.invalid/fonte",
  archived_at: null,
  ...extra,
});

describe("sugestão de fonte: a candidata não vira base", () => {
  it("país sem fonte nenhuma continua em preparação", () => {
    const r = resumoFontesPorPais(PAISES_LINHA_PRIORITARIA, []).find(
      (x) => x.valor === "alemanha",
    )!;
    expect(r.estado).toBe("em_preparacao");
    expect(r.mensagem).toBe(FONTES_EM_PREPARACAO);
    expect(r.sugestoes).toBe(0);
  });

  it("só fonte candidata (CATALOGADA) vira 'sugestão registrada', nunca 'com base'", () => {
    const r = resumoFontesPorPais(PAISES_LINHA_PRIORITARIA, [
      viva("Alemanha", { estagio_maturidade: "CATALOGADA" }),
    ]).find((x) => x.valor === "alemanha")!;
    expect(r.estado).toBe("sugestao_registrada");
    expect(r.fontes).toBe(0);
    expect(r.comRota).toBe(0);
    expect(r.sugestoes).toBe(1);
    expect(r.mensagem).toBe(FONTES_SUGESTAO_REGISTRADA);
  });

  it("com base documentada e uma candidata, a candidata não infla a contagem de base", () => {
    const r = resumoFontesPorPais(PAISES_LINHA_PRIORITARIA, [
      viva("Áustria", { estagio_maturidade: "HOMOLOGADA_MANUAL" }),
      viva("Áustria", { estagio_maturidade: "CATALOGADA" }),
    ]).find((x) => x.valor === "austria")!;
    expect(r.estado).toBe("com_base");
    expect(r.fontes).toBe(1);
    expect(r.sugestoes).toBe(1);
  });

  it("fonte sem estágio informado segue contando como base (compatível com o resumo anterior)", () => {
    const r = resumoFontesPorPais(PAISES_LINHA_PRIORITARIA, [viva("Itália")]).find(
      (x) => x.valor === "italia",
    )!;
    expect(r.estado).toBe("com_base");
    expect(ehFonteCandidata({ pais_eixo: "Itália" })).toBe(false);
  });

  it("fonte candidata arquivada não conta como sugestão", () => {
    const r = resumoFontesPorPais(PAISES_LINHA_PRIORITARIA, [
      viva("Hungria", { estagio_maturidade: "CATALOGADA", archived_at: "2026-10-01T00:00:00Z" }),
    ]).find((x) => x.valor === "hungria")!;
    expect(r.estado).toBe("em_preparacao");
  });
});

describe("montarSugestaoFonte: sem tabela nova, sem herdar o padrão de fonte homologada", () => {
  const entrada = {
    paisValor: "alemanha",
    paisRotulo: "Alemanha",
    nome: "  Bundesarchiv  ",
    motivo: " Filiação em Berlim ",
  };

  it("monta a fonte candidata no eixo do país, com os padrões do banco e não os de fonte homologada", () => {
    const s = montarSugestaoFonte(entrada);
    expect(s.eixo).toBe("Alemanha");
    expect(s.fonte).toMatchObject({
      nome: "Bundesarchiv",
      pais_eixo: "Alemanha",
      ...FONTE_CANDIDATA_PADRAO,
    });
    // D-04 faz fonte nova nascer homologada; sugerir não é avaliar.
    expect(s.fonte["estagio_maturidade"]).not.toBe(
      FONTE_NOVA_APROVADA_POR_PADRAO.estagio_maturidade,
    );
    expect(s.fonte["status_documentacao"]).not.toBe(
      FONTE_NOVA_APROVADA_POR_PADRAO.status_documentacao,
    );
    expect(s.fonte["permite_automacao"]).toBe("nao");
  });

  it("monta o item de backlog ligado à fonte, com motivo e aguardando aprovação humana", () => {
    const b = montarSugestaoFonte(entrada).backlog("id-da-fonte");
    expect(b).toMatchObject({
      source_id: "id-da-fonte",
      motivo: "Filiação em Berlim",
      prioridade: "media",
      status: "planejada",
    });
    expect(String(b["acao_interna"])).toContain("Alemanha");
    expect(String(b["acao_interna"])).toContain("Bundesarchiv");
    // `salvarBacklogFonte` já grava requires_human_approval = true na criação.
    expect(readFileSync("src/lib/fontes-genealogicas.functions.ts", "utf8")).toContain(
      "requires_human_approval: true",
    );
  });

  it("exige nome e motivo, e recusa país sem eixo no catálogo", () => {
    expect(() => montarSugestaoFonte({ ...entrada, nome: "  " })).toThrow(/nome da fonte/);
    expect(() => montarSugestaoFonte({ ...entrada, motivo: "" })).toThrow(/motivo/);
    expect(() => montarSugestaoFonte({ ...entrada, paisValor: "multipais" })).toThrow(/eixo/);
  });

  it("usa só vocabulário que já existe (nenhum valor novo de CHECK)", () => {
    expect(Object.keys(ESTAGIOS)).toContain(FONTE_CANDIDATA_PADRAO.estagio_maturidade);
    expect(Object.keys(STATUS_DOCUMENTACAO)).toContain(FONTE_CANDIDATA_PADRAO.status_documentacao);
    expect(Object.keys(STATUS_INTEGRACAO)).toContain(FONTE_CANDIDATA_PADRAO.status_integracao);
    expect(Object.keys(MODOS_USO)).toContain(FONTE_CANDIDATA_PADRAO.modo_de_uso_permitido);
    const b = montarSugestaoFonte(entrada).backlog("x");
    expect(Object.keys(STATUS_BACKLOG)).toContain(String(b["status"]));
    expect(Object.keys(PRIORIDADES)).toContain(String(b["prioridade"]));
  });
});

describe("o painel compartilhado está nas três telas e é editável", () => {
  const lerTela = (p: string) => readFileSync(p, "utf8");
  const painel = lerTela("src/components/pesquisa/fontes-por-pais-painel.tsx");

  it("Fontes genealógicas, Validação Jurídica e Painel de Calls montam o mesmo componente", () => {
    expect(lerTela("src/routes/_authenticated/fontes-genealogicas.tsx")).toContain(
      "<FontesPorPaisPainel",
    );
    expect(lerTela("src/routes/_authenticated/matriz-juridica.tsx")).toContain(
      "<FontesPorPaisPainel",
    );
    expect(lerTela("src/components/crm/painel-calls.tsx")).toContain("<FontesPorPaisPainel");
  });

  it("no Discovery o país vem do lead em atendimento, e o roteiro vem logo depois", () => {
    const calls = lerTela("src/components/crm/painel-calls.tsx");
    expect(calls).toContain("paisValor={lead.pais_linha_prioritaria}");
    expect(calls.indexOf("<FontesPorPaisPainel")).toBeLessThan(
      calls.indexOf('id="calls-roteiro-vivo"'),
    );
  });

  it("não ficou uma segunda versão só leitura em Fontes genealógicas", () => {
    expect(lerTela("src/routes/_authenticated/fontes-genealogicas.tsx")).not.toContain(
      "function CoberturaDeFontesPorPais",
    );
  });

  it("grava pelas funções existentes, respeita o papel e nunca exclui", () => {
    expect(painel).toContain("salvarFonte");
    expect(painel).toContain("salvarBacklogFonte");
    expect(painel).toContain("data?.podeEditar");
    expect(painel).toContain('queryKey: ["g08-fontes"]');
    expect(painel).not.toMatch(/\.delete\(|excluir/i);
  });

  it("falha do backlog depois de criar a fonte é dita em voz alta, não engolida", () => {
    expect(painel).toContain("A fonte candidata foi registrada, mas o item de backlog não");
  });
});
