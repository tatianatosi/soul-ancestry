import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  FASES_HISTORICO,
  MARCADOR_HISTORICO_FASE,
  faseValida,
  paraRegistroHistorico,
  rotuloFase,
  validarEntradaHistorico,
} from "@/lib/historico-fase";

/**
 * Item E (07/10/2026) — "em cada fase (Lead, Discovery, Proposta, Contrato,
 * Pesquisa, Árvore) a equipe registra o histórico daquela fase, com data,
 * fonte e anexo ou texto colado. Auditado, sem importação em bloco."
 *
 * Sem tabela nova: reusa `case_timeline_events`, já lido nesta mesma seção
 * de Caso 360 ("Histórico de fases do caso").
 */

describe("vocabulário de fases", () => {
  it("são exatamente as 6 fases pedidas", () => {
    expect(FASES_HISTORICO.map((f) => f.valor)).toEqual([
      "lead",
      "discovery",
      "proposta",
      "contrato",
      "pesquisa",
      "arvore",
    ]);
  });

  it("faseValida recusa fase fora da lista", () => {
    expect(faseValida("lead")).toBe(true);
    expect(faseValida("arvore")).toBe(true);
    expect(faseValida("inventada")).toBe(false);
  });

  it("rotuloFase devolve o rótulo humano", () => {
    expect(rotuloFase("arvore")).toBe("Árvore");
    expect(rotuloFase("discovery")).toBe("Discovery");
  });
});

describe("validarEntradaHistorico", () => {
  const ok = { fase: "pesquisa", dataOcorrencia: "2026-10-01", fonte: "Equipe de pesquisa", conteudo: "Achado X confirmado." };

  it("aceita entrada completa e válida", () => {
    expect(validarEntradaHistorico(ok)).toEqual([]);
  });

  it("recusa fase fora do vocabulário", () => {
    expect(validarEntradaHistorico({ ...ok, fase: "inventada" }).length).toBeGreaterThan(0);
  });

  it("recusa data futura além de 1 dia de tolerância", () => {
    const futuro = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);
    expect(validarEntradaHistorico({ ...ok, dataOcorrencia: futuro }).length).toBeGreaterThan(0);
  });

  it("aceita data retroativa (o evento aconteceu no passado)", () => {
    expect(validarEntradaHistorico({ ...ok, dataOcorrencia: "2026-01-01" })).toEqual([]);
  });

  it("recusa fonte curta/ausente", () => {
    expect(validarEntradaHistorico({ ...ok, fonte: "" }).length).toBeGreaterThan(0);
    expect(validarEntradaHistorico({ ...ok, fonte: "ab" }).length).toBeGreaterThan(0);
  });

  it("recusa conteúdo ausente — histórico não pode ficar vazio", () => {
    expect(validarEntradaHistorico({ ...ok, conteudo: "" }).length).toBeGreaterThan(0);
  });
});

describe("paraRegistroHistorico — normaliza a linha crua de case_timeline_events", () => {
  it("mapeia event_type/title/summary_internal/occurred_at para o formato da tela", () => {
    const linha = {
      id: "abc",
      event_type: "contrato",
      occurred_at: "2026-10-01T00:00:00Z",
      title: "Equipe comercial",
      summary_internal: "Contrato revisado e aprovado internamente.",
      created_at: "2026-10-07T12:00:00Z",
      responsavel_nome: "Tatiana",
    };
    const r = paraRegistroHistorico(linha);
    expect(r).toEqual({
      id: "abc",
      fase: "contrato",
      dataOcorrencia: "2026-10-01T00:00:00Z",
      fonte: "Equipe comercial",
      conteudo: "Contrato revisado e aprovado internamente.",
      registradoEm: "2026-10-07T12:00:00Z",
      registradoPor: "Tatiana",
    });
  });
});

describe("Corte E — .functions.ts lê/grava só case_timeline_events, org-scoped, marcado", () => {
  const codigo = readFileSync("src/lib/historico-fase.functions.ts", "utf8");

  it("usa a mesma tabela do histórico automático — nenhuma tabela nova", () => {
    expect(codigo).toContain('"case_timeline_events"');
    expect(codigo).not.toMatch(/\.from\("historico_fase/);
  });

  it("marca os registros manuais com o marcador, para nunca se confundir com evento automático", () => {
    expect(codigo).toContain("source_entity_type: MARCADOR_HISTORICO_FASE");
    expect(codigo).toContain("source_entity_type\", MARCADOR_HISTORICO_FASE");
    expect(MARCADOR_HISTORICO_FASE).toBe("historico_fase_registro");
  });

  it("toda leitura/escrita é filtrada por organization_id resolvido da sessão", () => {
    const ocorrencias = codigo.match(/organizationId/g) ?? [];
    expect(ocorrencias.length).toBeGreaterThan(3);
  });

  it("arquivar exige motivo — nunca apaga a linha", () => {
    expect(codigo).toContain("Informe o motivo do arquivamento");
    expect(codigo).not.toMatch(/\.delete\s*\(/);
  });

  it("valida a entrada antes de gravar — nunca confia só na tela", () => {
    expect(codigo).toContain("validarEntradaHistorico(data)");
  });
});

describe("Corte E — ligado em Caso 360, dentro da seção Histórico já existente (sem 9ª seção)", () => {
  const rota = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

  it("usa HistoricoPorFase dentro de secao-log, não cria seção nova", () => {
    const indiceSecaoLog = rota.indexOf('id="secao-log"');
    const indiceComponente = rota.indexOf("<HistoricoPorFase");
    expect(indiceSecaoLog).toBeGreaterThan(-1);
    expect(indiceComponente).toBeGreaterThan(indiceSecaoLog);
  });

  it("SECOES continua com 8 itens — nenhuma seção nova criada", () => {
    const bloco = rota.slice(rota.indexOf("const SECOES = ["), rota.indexOf("] as const;") + 12);
    const ocorrencias = bloco.match(/\{ id:/g) ?? [];
    expect(ocorrencias.length).toBe(8);
  });
});
