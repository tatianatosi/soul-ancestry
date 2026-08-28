import { describe, expect, it } from "vitest";

import { ADENDOS_TEXTUAIS, PERFIL_INSTITUCIONAL_VERSAO } from "@/lib/contrato-base-consolidado";
import {
  deveCriarSnapshotInstitucional,
  edicaoPeloCasoPermitida,
  montarPayloadInstitucional,
  pendenciasConfiguracao,
  perfilHabilitaAssinatura,
  rascunhoInternoPermitido,
  violacoesDoPayload,
} from "@/lib/perfil-institucional-persistido";

describe("perfil institucional persistido", () => {
  it("persiste a versão institucional existente sem dado pessoal", () => {
    const payload = montarPayloadInstitucional(true);
    expect(payload.versao).toBe(PERFIL_INSTITUCIONAL_VERSAO);
    expect(payload.status).toBe("under_legal_review");
    expect(violacoesDoPayload(payload)).toEqual([]);
    for (const campo of [
      "razao_empresarial",
      "nome_operacao",
      "cnpj",
      "endereco_institucional",
      "email_oficial",
      "site",
      "whatsapp",
      "titulo",
      "subtitulo",
    ]) {
      expect(payload.campos.some((c) => c.campo === campo && c.valor.trim())).toBe(true);
    }
  });

  it("nunca é editável pelo caso e não habilita assinatura", () => {
    expect(edicaoPeloCasoPermitida().permitido).toBe(false);
    expect(perfilHabilitaAssinatura(montarPayloadInstitucional(true))).toBe(false);
  });

  it("WhatsApp ausente gera pendência de configuração não bloqueante para rascunho", () => {
    const payload = montarPayloadInstitucional(false);
    const pendencias = pendenciasConfiguracao(payload);
    expect(pendencias).toHaveLength(1);
    expect(pendencias[0].bloqueiaRascunho).toBe(false);
    expect(rascunhoInternoPermitido(payload).permitido).toBe(true);
    expect(pendenciasConfiguracao(montarPayloadInstitucional(true))).toEqual([]);
  });

  it("snapshot só é criado por evento de governança e preserva o anterior", () => {
    expect(deveCriarSnapshotInstitucional("versao_contratual_criada", false).criar).toBe(true);
    expect(deveCriarSnapshotInstitucional("abertura_de_tela", false).criar).toBe(false);
    expect(deveCriarSnapshotInstitucional("versao_contratual_criada", true).criar).toBe(false);
  });

  it("adendos textuais não ativam assinatura nem citam contato pessoal", () => {
    expect(ADENDOS_TEXTUAIS.map((a) => a.id)).toEqual([
      "ADENDO-CANCELAMENTO-v1.0",
      "ADENDO-CANAIS-OFICIAIS-v1.0",
    ]);
    for (const adendo of ADENDOS_TEXTUAIS) {
      expect(adendo.status).toBe("under_legal_review");
      const texto = adendo.itens.join(" ");
      expect(texto).not.toMatch(/\(?\d{2}\)?\s?9\d{4}-?\d{4}/);
    }
    const canais = ADENDOS_TEXTUAIS[1].itens.join(" ");
    expect(canais).toContain("clubeancestral.com.br");
    expect(canais).toContain("WhatsApp institucional homologado");
  });
});
