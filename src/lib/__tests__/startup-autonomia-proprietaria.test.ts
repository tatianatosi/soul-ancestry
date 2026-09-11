import { describe, expect, it } from "vitest";

import {
  EMAIL_RESPONSAVEL_PADRAO,
  NOME_RESPONSAVEL_PADRAO,
  nomeResponsavelPadrao,
  resolverResponsavelPadrao,
} from "@/lib/responsavel-padrao";
import {
  aplicarPadroesProximaAcaoStartup,
  exigirProximaAcaoOperavel,
  PADRAO_CANAL_DESK,
  PADRAO_PUBLICO_INTERNO,
} from "@/lib/proxima-acao-startup";
import { readFileSync } from "node:fs";

describe("responsável padrão Tatiana", () => {
  it("usa o nome institucional quando nada foi informado", () => {
    expect(nomeResponsavelPadrao(null)).toBe(NOME_RESPONSAVEL_PADRAO);
    expect(nomeResponsavelPadrao("")).toBe("Tatiana Melani Tosi");
    expect(EMAIL_RESPONSAVEL_PADRAO).toContain("pluggedresearch");
  });

  it("preserva nome já informado", () => {
    expect(nomeResponsavelPadrao("Ana Ops")).toBe("Ana Ops");
  });

  it("resolve userId da sessão com nome padrão", () => {
    const r = resolverResponsavelPadrao({ userId: "u-1", staffNome: null, staffEmail: null });
    expect(r).toEqual({ nome: NOME_RESPONSAVEL_PADRAO, userId: "u-1" });
  });
});

describe("próxima ação startup — pendência informa", () => {
  it("preenche defaults internos e exige só a ação", () => {
    const { estado, pendenciasAssumidas } = exigirProximaAcaoOperavel(
      { proxima_acao_codigo: "revisar_documentos" },
      { livreProprietaria: true },
    );
    expect(estado.responsavel_principal).toBe(NOME_RESPONSAVEL_PADRAO);
    expect(estado.target_audience).toBe(PADRAO_PUBLICO_INTERNO);
    expect(estado.suggested_channel).toBe(PADRAO_CANAL_DESK);
    expect(pendenciasAssumidas.length).toBeGreaterThan(0);
  });

  it("equipe sem defaults continua bloqueada se incompleto", () => {
    expect(() =>
      exigirProximaAcaoOperavel({ proxima_acao_codigo: "revisar_documentos" }, { livreProprietaria: false }),
    ).toThrow(/PROXIMA_ACAO_INCOMPLETA/);
  });

  it("aplicarPadroes não apaga o que já veio preenchido", () => {
    const e = aplicarPadroesProximaAcaoStartup({
      responsavel_principal: "Colega",
      prazo_proxima_acao: "2030-01-01",
    });
    expect(e.responsavel_principal).toBe("Colega");
    expect(e.prazo_proxima_acao).toBe("2030-01-01");
  });
});

describe("superfícies deixam de esconder ação da proprietária", () => {
  const ler = (p: string) => readFileSync(p, "utf8");

  it("onboarding mostra ativação com AcaoOperacional mesmo com pendência", () => {
    const onboarding = ler("src/routes/_authenticated/onboarding.$id.tsx");
    expect(onboarding).toContain("AcaoOperacional");
    expect(onboarding).toContain("Ativar mesmo com pendências");
    expect(onboarding).not.toContain("Sem botão de ativação");
  });

  it("Mesa não desabilita handoff por checklist de discovery", () => {
    const calls = ler("src/components/crm/painel-calls.tsx");
    expect(calls).toContain("AcaoOperacional");
    expect(calls).toContain("podeExecutarHandoffDiscovery");
    expect(calls).not.toContain("!avaliacao?.liberado || avaliacao?.destino !== \"proposta\"");
  });

  it("abertura de caso e tarefa gravam responsável", () => {
    expect(ler("src/lib/abrir-caso-operacional.functions.ts")).toContain("responsavel_id: userId");
    expect(ler("src/lib/tarefa-garantida.server.ts")).toContain("responsavel_id: input.userId");
    expect(ler("src/lib/responsavel-padrao.ts")).toContain(NOME_RESPONSAVEL_PADRAO);
  });

  it("ativação no servidor assume pendência para proprietária", () => {
    const onb = ler("src/lib/onboarding.functions.ts");
    expect(onb).toContain("assumirOuRecusarComUsuario");
    expect(onb).toContain("ativar_caso_com_pendencia");
  });
});
