import { describe, expect, it } from "vitest";

import {
  completudeFormal,
  etapaAtual,
  pipelineJuridico,
  riscosEPrazos,
  temInstrumento,
  type InstrumentosJur,
} from "./golive-juridico";

const AGORA = new Date(2026, 8, 15, 9, 0, 0);

const vazio: InstrumentosJur = { propostas: [], escopo: [], contratos: [], anexos: [], ordens: [] };

function contrato(p: Partial<InstrumentosJur["contratos"][number]> = {}) {
  return {
    id: p.id ?? "c1",
    status: p.status ?? "rascunho",
    assinadoEm: p.assinadoEm ?? null,
    liberadoParaEnvioEm: p.liberadoParaEnvioEm ?? null,
    vigenciaInicio: p.vigenciaInicio ?? null,
    vigenciaFim: p.vigenciaFim ?? null,
  };
}

describe("completude formal", () => {
  it("sem registro o instrumento fica em zero, nunca estimado", () => {
    const r = completudeFormal(vazio);
    expect(r.map((i) => i.rotulo)).toEqual(["Proposta", "Escopo", "Contrato", "Anexos", "OS"]);
    expect(r.every((i) => i.valor === 0)).toBe(true);
  });

  it("conta por situação gravada e por data de conclusão", () => {
    const r = completudeFormal({
      ...vazio,
      propostas: [
        { id: "p1", status: "enviada", aprovadaEm: "2026-09-01" },
        { id: "p2", status: "rascunho", aprovadaEm: null },
      ],
      contratos: [contrato({ assinadoEm: "2026-09-10" })],
    });
    expect(r.find((i) => i.rotulo === "Proposta")?.valor).toBe(50);
    expect(r.find((i) => i.rotulo === "Contrato")?.valor).toBe(100);
  });
});

describe("riscos e prazos", () => {
  it("conta revisão, assinatura e anexo pendentes", () => {
    const r = riscosEPrazos(
      {
        ...vazio,
        escopo: [
          { id: "e1", status: "pendente", exigeRevisaoHumana: true },
          { id: "e2", status: "aprovado", exigeRevisaoHumana: true },
        ],
        contratos: [contrato(), contrato({ id: "c2", assinadoEm: "2026-09-02" })],
        anexos: [{ id: "a1", status: "pendente", obrigatorio: true, revisadoEm: null }],
      },
      AGORA,
    );
    expect(r.find((i) => i.rotulo === "Revisão pendente")?.valor).toBe(2);
    expect(r.find((i) => i.rotulo === "Assinatura pendente")?.valor).toBe(1);
    expect(r.find((i) => i.rotulo === "Anexo pendente")?.valor).toBe(1);
  });

  it("prazo próximo só conta data futura dentro da janela", () => {
    const r = riscosEPrazos(
      {
        ...vazio,
        contratos: [contrato({ vigenciaFim: "2026-09-20" })],
        ordens: [{ id: "o1", status: "ativa", inicio: "2026-08-01", fim: "2026-12-30" }],
      },
      AGORA,
    );
    expect(r.find((i) => i.rotulo === "Prazo próximo")?.valor).toBe(1);
  });

  it("sem data gravada não inventa prazo", () => {
    const r = riscosEPrazos({ ...vazio, contratos: [contrato()] }, AGORA);
    expect(r.find((i) => i.rotulo === "Prazo próximo")?.valor).toBe(0);
  });
});

describe("pipeline", () => {
  it("tem os seis degraus na ordem do contrato visual", () => {
    expect(pipelineJuridico(vazio).map((p) => p.rotulo)).toEqual([
      "Proposta",
      "Escopo",
      "Rascunho",
      "Revisão humana",
      "Pronto para assinatura",
      "Registrado",
    ]);
  });

  it("degrau só fecha com registro gravado", () => {
    const p = pipelineJuridico({
      ...vazio,
      propostas: [{ id: "p1", status: "enviada", aprovadaEm: null }],
      escopo: [{ id: "e1", status: "pendente", exigeRevisaoHumana: false }],
      contratos: [contrato({ liberadoParaEnvioEm: "2026-09-05" })],
    });
    expect(p.map((d) => d.feito)).toEqual([true, true, true, true, true, false]);
    expect(etapaAtual(p)).toBe("Registrado");
  });

  it("etapa atual é o primeiro degrau em aberto; nada registrado começa pela proposta", () => {
    expect(etapaAtual(pipelineJuridico(vazio))).toBe("Proposta");
  });

  it("temInstrumento distingue vazio de com registro", () => {
    expect(temInstrumento(vazio)).toBe(false);
    expect(temInstrumento({ ...vazio, ordens: [{ id: "o", status: null, inicio: null, fim: null }] })).toBe(true);
  });
});
