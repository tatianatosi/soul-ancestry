import { describe, expect, it } from "vitest";
import { calcularEtapas, etapaAtual } from "@/lib/etapas-caso";

describe("calcularEtapas", () => {
  it("sem verificações: tudo aguardando", () => {
    const e = calcularEtapas([]);
    expect(e).toHaveLength(5);
    expect(e.every((x) => x.estado === "aguardando")).toBe(true);
    expect(etapaAtual(e)?.id).toBe("diagnostico");
  });

  it("conta validado/isento/não aplicável e ignora isenção expirada", () => {
    const e = calcularEtapas(
      [
        { check_key: "cliente_identificado", status: "validado" },
        { check_key: "consentimento_registrado", status: "isento", isencao_expira_em: "2000-01-01" },
        { check_key: "proposta_aprovada_ou_isencao_autorizada", status: "nao_aplicavel" },
        { check_key: "contrato_assinado_ou_isencao_autorizada", status: "isento" },
      ],
      Date.parse("2026-10-12"),
    );
    const d = e.find((x) => x.id === "diagnostico")!;
    expect(d.feitos).toBe(1);
    expect(d.estado).toBe("andamento");
    expect(e.find((x) => x.id === "juridico")!.estado).toBe("concluido");
  });
});

import { calcularEtapas as calc2 } from "../etapas-caso";
import { it as it2, expect as expect2 } from "vitest";
it2("contrato não assinado no caso mantém Jurídico em andamento", () => {
  const checks = ["proposta_aprovada_ou_isencao_autorizada", "contrato_assinado_ou_isencao_autorizada"].map((k) => ({ check_key: k, status: "validado" }));
  const j = calc2(checks, Date.now(), { contratoAssinado: false }).find((e) => e.id === "juridico")!;
  expect2(j.estado).toBe("andamento");
  expect2(calc2(checks).find((e) => e.id === "juridico")!.estado).toBe("concluido");
});
