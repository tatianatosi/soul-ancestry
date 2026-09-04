import { describe, expect, it } from "vitest";

import { derivarPendenciasPiloto, ROTULO_ORIGEM_PENDENCIA } from "@/lib/piloto-ana";

const CASO_BASE = { id_canonico_decidido: "CA-CID-AT-FAM-2026-001" };

describe("Piloto Real — pendências vivas (Opção A)", () => {
  it("caso sem nenhum dado real produz pendências reais, não uma lista fixa", () => {
    const p = derivarPendenciasPiloto({
      caseId: "caso-1",
      caso: null,
      membros: [],
      contrato: null,
      ordemServico: null,
      perfilInstitucionalVigente: false,
    });
    expect(p.length).toBeGreaterThan(0);
    expect(p.every((x) => Object.values(ROTULO_ORIGEM_PENDENCIA).includes(ROTULO_ORIGEM_PENDENCIA[x.origem]))).toBe(true);
  });

  it("30/08/2026 — achado real: o caso antigo (gates A–H) nunca saía de NO_GO mesmo com tudo preenchido; a leitura derivada agora zera quando o estado real está completo", () => {
    const p = derivarPendenciasPiloto({
      caseId: "caso-1",
      caso: {
        ...CASO_BASE,
        id_canonico_decidido_por: "Tatiana Melani Tosi",
        metodo_assinatura: "eletronica",
        revisao_juridica_status: "aprovada",
        situacao_financeira: "quitado",
        ativacao_operacional: "aprovada",
      },
      membros: [{ nome: "Ana Luiza Gomes Silveira Rodrigues", papel: "contratante_signatario" }],
      contrato: { status: "signed" },
      ordemServico: { status: "active" },
      perfilInstitucionalVigente: true,
    });
    expect(p).toEqual([]);
  });

  it("contrato em rascunho gera pendência de origem contrato, não uma lista genérica", () => {
    const p = derivarPendenciasPiloto({
      caseId: "caso-1",
      caso: {
        ...CASO_BASE,
        metodo_assinatura: "eletronica",
        revisao_juridica_status: "aprovada",
        situacao_financeira: "quitado",
        ativacao_operacional: "aprovada",
      },
      membros: [],
      contrato: { status: "draft" },
      ordemServico: { status: "active" },
      perfilInstitucionalVigente: true,
    });
    expect(p).toHaveLength(1);
    expect(p[0].codigo).toBe("contrato_rascunho");
    expect(p[0].origem).toBe("contrato");
  });

  it("dependente sem representação documentada gera pendência vinculada à pessoa, não a um nome fixo hardcoded", () => {
    const p = derivarPendenciasPiloto({
      caseId: "caso-1",
      caso: {
        ...CASO_BASE,
        metodo_assinatura: "eletronica",
        revisao_juridica_status: "aprovada",
        situacao_financeira: "quitado",
        ativacao_operacional: "aprovada",
      },
      membros: [{ nome: "Felipe Silveira Rodrigues", papel: "dependente", processo: "menor vinculado" }],
      contrato: { status: "signed" },
      ordemServico: { status: "active" },
      perfilInstitucionalVigente: true,
    });
    expect(p.some((x) => x.codigo === "representacao_Felipe Silveira Rodrigues" && x.entidade === "Felipe Silveira Rodrigues")).toBe(
      true,
    );
  });

  it("nenhuma pendência aponta ação para envio, cobrança, assinatura ou pesquisa externa", () => {
    const p = derivarPendenciasPiloto({
      caseId: "caso-1",
      caso: null,
      membros: [],
      contrato: null,
      ordemServico: null,
      perfilInstitucionalVigente: false,
    });
    for (const item of p) {
      expect(item.origem).not.toBe("integracao_acao_externa");
    }
  });
});
