import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  avaliarPromocao,
  DOCUMENTO_DE_REFERENCIAS,
  fonteOficialDoPais,
  FONTES_OFICIAIS_POR_PAIS,
  LIFECYCLE_MARCO_HOMOLOGADO,
  notaDePromocao,
  PAISES_SEM_FONTE_DOCUMENTADA,
  STATUS_MARCO_VIGENTE,
  type MarcoParaPromover,
} from "@/lib/marcos-fontes-oficiais";

/**
 * Corte MARCOS (03/10/2026) — "promova os 43 marcos juridicos" + a varredura
 * do material por país ("na premissa de centro de inteligência").
 *
 * A medição que definiu o corte: 43 marcos, 15 com fonte, 28 sem, 0 vigentes,
 * enquanto as URLs das autoridades oficiais de 7 países estavam documentadas
 * no repositório sem nunca chegar ao banco.
 *
 * Ampliado (mesmo dia, "Memória Europeia"): marcos-fontes-oficiais.ts passou
 * de 7 para 20 países. Este teste cobria só os 7 originais e usava "Romênia"
 * como exemplo de país sem fonte — Romênia ganhou fonte na ampliação. As 13
 * URLs novas foram adicionadas aqui sem nunca entrar no documento de
 * referências; corrigido junto com este teste (10/10/2026).
 */

const marco = (p: Partial<MarcoParaPromover> = {}): MarcoParaPromover => ({
  id: "m1",
  label: "Procedimento de confirmação de cidadania",
  status: "a_revisar",
  lifecycle_status: "em_revisao",
  official_source_url: null,
  notes: null,
  ...p,
});

describe("fontes oficiais por país", () => {
  it("cobre os 20 países da Memória Europeia, cada um com autoridade documentada", () => {
    expect(Object.keys(FONTES_OFICIAIS_POR_PAIS).sort()).toEqual(
      [
        "Alemanha", "Áustria", "Bélgica", "Brasil", "Croácia", "Eslovênia", "Espanha",
        "Estônia", "França", "Hungria", "Irlanda", "Itália", "Letônia", "Lituânia",
        "Luxemburgo", "Países Baixos", "Polônia", "Portugal", "Romênia", "Tchéquia",
      ].sort(),
    );
  });

  it("cada URL é um endereço de autoridade oficial, nunca agregador nem busca", () => {
    for (const [pais, fonte] of Object.entries(FONTES_OFICIAIS_POR_PAIS)) {
      expect(fonte.url, pais).toMatch(/^https?:\/\//);
      // perplexity/google/wikipedia nunca são fonte oficial de marco jurídico
      for (const u of [fonte.url, ...(fonte.complementares ?? [])]) {
        expect(u, `${pais} ${u}`).not.toMatch(/perplexity|google\.|wikipedia|chatgpt/i);
      }
      expect(fonte.autoridade.trim().length, pais).toBeGreaterThan(3);
      // Identifica de qual item do documento de referências a URL saiu —
      // não é obrigado a conter a palavra "item" (rótulo livre, ex. "MSWiA Polônia").
      expect(fonte.itemDoDocumento.trim().length, pais).toBeGreaterThan(0);
    }
  });

  it("cada URL aplicada existe verbatim no documento de referências do repo", () => {
    const doc = readFileSync(DOCUMENTO_DE_REFERENCIAS, "utf8");
    for (const [pais, fonte] of Object.entries(FONTES_OFICIAIS_POR_PAIS)) {
      expect(doc.includes(fonte.url), `${pais}: ${fonte.url} não está em ${DOCUMENTO_DE_REFERENCIAS}`).toBe(true);
    }
  });

  it("nenhum país está nas duas listas (com fonte e sem fonte documentada)", () => {
    for (const pais of PAISES_SEM_FONTE_DOCUMENTADA) {
      expect(fonteOficialDoPais(pais), pais).toBeNull();
    }
  });
});

describe("avaliarPromocao — recusa com motivo, nunca em silêncio", () => {
  it("promove quando o marco já tem fonte oficial", () => {
    const r = avaliarPromocao(marco({ official_source_url: "https://www.normattiva.it" }), "Itália");
    expect(r).toEqual({ pode: true, urlAAplicar: null });
  });

  it("aplica a fonte documentada quando o marco está sem URL", () => {
    const r = avaliarPromocao(marco(), "Polônia");
    expect(r.pode).toBe(true);
    expect(r.pode && r.urlAAplicar).toBe(FONTES_OFICIAIS_POR_PAIS["Polônia"].url);
  });

  it("recusa país sem fonte documentada, e diz que não inventa endereço", () => {
    // Romênia tinha fonte ausente quando este teste foi escrito; a ampliação
    // Memória Europeia (mesmo dia) documentou a autoridade dela (ANC). Um país
    // fora do catálogo dos 20 continua sem fonte — a asserção vale igual.
    const r = avaliarPromocao(marco({ label: "Marco oficial a homologar" }), "Marrocos");
    expect(r.pode).toBe(false);
    expect(r.pode === false && r.motivo).toBe("sem_fonte_oficial");
    expect(r.pode === false && r.explicacao).toMatch(/Marrocos/);
  });

  it('recusa o marco "Não aplicável" (trilha multipaís) mesmo com fonte', () => {
    const r = avaliarPromocao(marco({ label: "Não aplicável", official_source_url: "https://x.gov" }), "Multipaís");
    expect(r.pode === false && r.motivo).toBe("nao_aplicavel");
  });

  it("é idempotente: marco já vigente não é promovido de novo", () => {
    const r = avaliarPromocao(marco({ status: "vigente", official_source_url: "https://x.gov" }), "Itália");
    expect(r.pode === false && r.motivo).toBe("ja_vigente");
  });
});

describe("vocabulário e nota", () => {
  it("usa só os valores dos CHECKs reais", () => {
    expect(STATUS_MARCO_VIGENTE).toBe("vigente");
    expect(LIFECYCLE_MARCO_HOMOLOGADO).toBe("homologado");
  });

  it("a nota cita autoridade, documento de origem e responsável", () => {
    const nota = notaDePromocao("Croácia", FONTES_OFICIAIS_POR_PAIS["Croácia"], "Tatiana Melani Tosi", "2026-10-03");
    expect(nota).toMatch(/Ministarstvo/);
    expect(nota).toContain(DOCUMENTO_DE_REFERENCIAS);
    expect(nota).toMatch(/Tatiana Melani Tosi/);
  });
});

describe("o escritor é o único caminho, e é país a país", () => {
  const fn = readFileSync("src/lib/marcos-juridicos.functions.ts", "utf8");

  it("promove por país, com responsável — nunca um botão que promove tudo", () => {
    expect(fn).toMatch(/promoverMarcosDoPais/);
    expect(fn).toMatch(/pais: string; responsavel\?: string/);
    expect(fn).not.toMatch(/promoverTodosOsMarcos|promoverTudo/);
  });

  it("grava com releitura e auditoria, nunca update cru", () => {
    expect(fn).toMatch(/gravarComVerificacao/);
    expect(fn).toMatch(/marco_juridico_promovido_a_vigente/);
  });

  it("não dispensa a revisão humana ao promover", () => {
    expect(fn).not.toMatch(/review_required:\s*"dispensa_homologada"/);
  });

  it("nunca apaga nota de outro humano", () => {
    expect(fn).toMatch(/if \(!\(m\.notes \?\? ""\)\.trim\(\)/);
  });

  it("a promoção está ligada a uma tela do Desk, não só ao servidor", () => {
    const rota = readFileSync("src/routes/_authenticated/fontes-genealogicas.tsx", "utf8");
    expect(rota).toMatch(/MarcosJuridicosPorPais/);
    const painel = readFileSync("src/components/pesquisa/marcos-juridicos-paises.tsx", "utf8");
    expect(painel).toMatch(/promoverMarcosDoPais/);
    expect(painel).toMatch(/painelMarcosJuridicos/);
  });

  it("o painel mostra a pendência dos países sem fonte, em vez de esconder", () => {
    const painel = readFileSync("src/components/pesquisa/marcos-juridicos-paises.tsx", "utf8");
    expect(painel).toMatch(/paisesSemFonteDocumentada/);
    expect(painel).toMatch(/nenhum endereço é inventado/);
  });
});
