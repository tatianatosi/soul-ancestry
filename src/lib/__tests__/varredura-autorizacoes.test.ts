import { describe, expect, it } from "vitest";

import { ACOES_EXTERNAS, exigeConfirmacaoFinal } from "@/lib/modo-proprietaria";
import {
  AREAS_CANONICAS,
  CAMPOS_EXCECAO,
  CATALOGO_EXCECOES,
  CLASSES_DOCUMENTO,
  ESTADO_MAXIMO_INTERNO,
  ESTADOS_DOCUMENTO,
  EXCECAO_NUNCA_FALSIFICA,
  FLUXO_DOCUMENTOS,
  REGRAS_DOCUMENTO,
  STATUS_EXCECAO,
  excecaoDeveReaparecerNaFila,
  fluxoDocumentoPorEtapa,
  acoesInternas,
  documentoPodeSerAdicionadoEm,
  excecaoPorChave,
  excecaoVencida,
  resumoVarredura,
  validadeSugerida,
} from "@/lib/varredura-autorizacoes";
import { TIPOS_EXCECAO } from "@/lib/ops.server";

describe("varredura de autorizações", () => {
  it("nenhuma ação interna bloqueia o avanço da proprietária", () => {
    expect(acoesInternas().every((a) => a.bloqueiaInterno === false)).toBe(true);
    expect(resumoVarredura().bloqueiosInternos).toBe(0);
  });

  it("toda área canônica tem ao menos uma ação interna liberada", () => {
    for (const area of AREAS_CANONICAS) {
      expect(area.acoes.some((a) => a.natureza === "interna")).toBe(true);
    }
  });

  it("toda ação externa pertence ao catálogo canônico e exige confirmação", () => {
    const externas = AREAS_CANONICAS.flatMap((a) => a.acoes).filter((a) => a.natureza === "externa");
    expect(externas.length).toBeGreaterThan(0);
    for (const acao of externas) {
      expect(ACOES_EXTERNAS as readonly string[]).toContain(acao.chave);
      expect(acao.autorizacao).toMatch(/confirmação final/i);
    }
  });

  it("o seletor de exceções do Desk usa o catálogo canônico", () => {
    for (const e of CATALOGO_EXCECOES) expect(TIPOS_EXCECAO[e.chave]).toBe(e.rotulo);
    expect(Object.keys(TIPOS_EXCECAO)).toHaveLength(CATALOGO_EXCECOES.length);
  });

  it("cada exceção declara quando ocorre, quem autoriza e como regularizar", () => {
    for (const e of CATALOGO_EXCECOES) {
      expect(e.quando.length).toBeGreaterThan(10);
      expect(e.autoriza).toMatch(/[Pp]roprietária/);
      expect(e.regularizacao.length).toBeGreaterThan(10);
      expect(e.impacto.length).toBeGreaterThan(5);
    }
  });

  it("exceção regularizada nunca é vencida e prazo sugerido respeita o tipo", () => {
    const base = new Date("2026-01-01T00:00:00.000Z");
    expect(excecaoVencida({ valido_ate: "2025-01-01T00:00:00.000Z", regularizado_em: "2025-02-01" }, base)).toBe(false);
    expect(excecaoVencida({ valido_ate: "2025-01-01T00:00:00.000Z" }, base)).toBe(true);
    expect(excecaoVencida({ valido_ate: null }, base)).toBe(false);

    const prazo = validadeSugerida("documento_pendente", base);
    expect(prazo).not.toBeNull();
    expect(new Date(prazo as string).getTime()).toBeGreaterThan(base.getTime());
    expect(validadeSugerida("reabertura_caso", base)).toBeNull();
    expect(excecaoPorChave("inexistente")).toBeUndefined();
  });

  it("documentos podem ser adicionados em qualquer etapa do ciclo", () => {
    expect(documentoPodeSerAdicionadoEm("pos_entrega")).toBe(true);
    expect(documentoPodeSerAdicionadoEm("lead")).toBe(true);
    expect(documentoPodeSerAdicionadoEm("etapa_inexistente")).toBe(false);
  });
});

describe("varredura final — áreas, exceções e documentos", () => {
  it("todas as áreas obrigatórias estão cobertas", () => {
    const chaves = AREAS_CANONICAS.map((a) => a.chave);
    for (const obrigatoria of [
      "planejador",
      "leads_discovery",
      "proposta_comercial",
      "catalogo_sku",
      "pessoas_familias",
      "casos_tarefas",
      "pesquisa",
      "contrato",
      "ordens_servico",
      "documentos",
      "financeiro",
      "app_cliente",
      "painel_hoje",
      "marketing",
      "governanca",
    ]) {
      expect(chaves).toContain(obrigatoria);
    }
  });

  it("toda área chega ao estado interno máximo sem ato externo", () => {
    for (const area of AREAS_CANONICAS) {
      expect(area.estadoMaximoInterno).toBe(ESTADO_MAXIMO_INTERNO);
    }
  });

  it("classificações obrigatórias de exceção existem no catálogo", () => {
    const chaves = CATALOGO_EXCECOES.map((e) => e.chave);
    for (const c of [
      "documento_pendente",
      "condicao_comercial_fora_padrao",
      "contrato_assinatura_pendente",
      "proposta_incompleta",
      "sku_nao_homologado",
      "dado_cadastral_incompleto",
      "pesquisa_recheque_pendente",
      "responsavel_prazo_ausente",
      "onboarding_acesso_pendente",
      "integracao_indisponivel",
      "dado_teste_demo",
      "conflito_ou_falta_de_fonte",
    ]) {
      expect(chaves).toContain(c);
    }
  });

  it("exceção reaparece na fila antes de expirar e nunca falsifica atos", () => {
    const agora = new Date("2026-01-10T00:00:00.000Z");
    expect(excecaoDeveReaparecerNaFila({ valido_ate: "2026-01-12T00:00:00.000Z" }, agora)).toBe(true);
    expect(excecaoDeveReaparecerNaFila({ valido_ate: "2026-02-12T00:00:00.000Z" }, agora)).toBe(false);
    expect(excecaoDeveReaparecerNaFila({ valido_ate: "2026-01-12T00:00:00.000Z", regularizado_em: "2026-01-11" }, agora)).toBe(false);
    expect(EXCECAO_NUNCA_FALSIFICA).toContain("pagamento");
    expect(STATUS_EXCECAO).toEqual(["aberta", "regularizada", "expirada", "revogada"]);
    expect(CAMPOS_EXCECAO).toContain("responsavel_regularizacao");
  });

  it("documento pode ser estruturado e anexado depois em todas as etapas A–F", () => {
    expect(FLUXO_DOCUMENTOS).toHaveLength(6);
    for (const f of FLUXO_DOCUMENTOS) {
      expect(f.permiteEstrutura).toBe(true);
      expect(f.permiteAnexoPosterior).toBe(true);
      expect(f.bloqueiaInterno).toBe(false);
    }
    expect(fluxoDocumentoPorEtapa("app_cliente")?.regra).toMatch(/quarentena/i);
    expect(fluxoDocumentoPorEtapa("publicacao")?.regra).toMatch(/confirmação final/i);
    expect(ESTADOS_DOCUMENTO).toContain("ilegivel");
    expect(ESTADOS_DOCUMENTO).toContain("aguardando_instituicao");
    expect(CLASSES_DOCUMENTO).toContain("evidencia_pesquisa");
    expect(REGRAS_DOCUMENTO.exclusaoFisica).toBe(false);
  });

  it("migration e restauração de backup exigem confirmação final", () => {
    expect(exigeConfirmacaoFinal("aplicar_migration_producao")).toBe(true);
    expect(exigeConfirmacaoFinal("restaurar_backup")).toBe(true);
    expect(exigeConfirmacaoFinal("editar_rascunho")).toBe(false);
  });
});
