import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { diagnosticarOnboarding } from "@/lib/onboarding-jornada";
import {
  CHECKLIST_INICIAL_PADRAO,
  checklistComGates,
  primeiraMicroentregaReal,
} from "@/lib/onboarding-plano";

/**
 * Corte D (24/09/2026, "Motores Pessoa Unificada, Núcleos e Dossiê"):
 * "Primeira microentrega D7" passa a vir da linha real em
 * ops_microentregas. Texto em case_plans.proxima_microentrega e
 * checkbox manual deixam de valer como prova.
 */
const casoOk = {
  contrato_assinado: true,
  pagamento_confirmado: true,
  responsavel_principal: "Equipe",
  dossie_mae_referencia: "DOS-1",
  app_visibility_level: "basico",
  case_service_id: "svc-1",
  eixo_operacao: "pagamento_inicial_confirmado",
  onboarding_iniciado_em: null,
};
const planoComTexto = {
  status: "ativo",
  responsavel_user_id: "u1",
  proxima_acao: "Levantar certidões",
  prazo_proxima_acao: "2026-09-01",
  proxima_microentrega: "Boas-vindas",
  proxima_atualizacao_limite_em: "2026-09-05T00:00:00Z",
};
const gateD7 = (d: ReturnType<typeof diagnosticarOnboarding>) =>
  [...d.gates_ok, ...d.gates_pendentes].find((g) => g.codigo === "primeira_microentrega")!;

describe("primeiraMicroentregaReal", () => {
  it("planejada (pendente) já conta — o marco é 'planejada até D7'", () => {
    expect(primeiraMicroentregaReal([{ status: "pendente", archived_at: null }])).toBe(true);
  });
  it("cancelada ou arquivada não conta", () => {
    expect(primeiraMicroentregaReal([{ status: "cancelada" }])).toBe(false);
    expect(primeiraMicroentregaReal([{ status: "pendente", archived_at: "2026-09-20" }])).toBe(false);
  });
  it("sem linha = sem micro-entrega", () => {
    expect(primeiraMicroentregaReal([])).toBe(false);
    expect(primeiraMicroentregaReal(null)).toBe(false);
  });
});

describe("diagnosticarOnboarding — gate D7 só com dado real", () => {
  it("texto em proxima_microentrega sozinho não aprova", () => {
    const d = diagnosticarOnboarding(casoOk, { plano: planoComTexto });
    expect(gateD7(d).ok).toBe(false);
    expect(gateD7(d).motivo).toContain("ops_microentregas");
  });
  it("checkbox manual concluído no checklist não aprova", () => {
    const d = diagnosticarOnboarding(casoOk, {
      plano: planoComTexto,
      checklist: [{ item_code: "primeira_microentrega", status: "concluido" }],
    });
    expect(gateD7(d).ok).toBe(false);
  });
  it("micro-entrega real aprova, mesmo sem texto no plano", () => {
    const d = diagnosticarOnboarding(casoOk, {
      plano: { ...planoComTexto, proxima_microentrega: null },
      primeiraMicroentregaReal: true,
    });
    expect(gateD7(d).ok).toBe(true);
  });
});

describe("checklistComGates — itens derivados do dado real", () => {
  const item = (lista: { item: string; status: string }[], re: RegExp) => lista.find((i) => re.test(i.item))!.status;
  it("marca micro-entrega e dossiê-mãe como ok quando o dado existe", () => {
    const l = checklistComGates({}, CHECKLIST_INICIAL_PADRAO, { primeiraMicroentrega: true, dossieMaeAtivo: true });
    expect(item(l, /micro-entrega/i)).toBe("ok");
    expect(item(l, /Dossiê-mãe/i)).toBe("ok");
  });
  it("volta a pendente se o dado deixa de existir (não é tick permanente)", () => {
    const marcado = CHECKLIST_INICIAL_PADRAO.map((i) => ({ ...i, status: "ok" }));
    const l = checklistComGates({}, marcado, { primeiraMicroentrega: false, dossieMaeAtivo: false });
    expect(item(l, /micro-entrega/i)).toBe("pendente");
    expect(item(l, /Dossiê-mãe/i)).toBe("pendente");
  });
  it("sem derivados calculados, não mexe nos itens (compatível com chamadas antigas)", () => {
    const l = checklistComGates({}, CHECKLIST_INICIAL_PADRAO);
    expect(item(l, /micro-entrega/i)).toBe("pendente");
  });
});

describe("writers e leitor ligados à mesma fonte", () => {
  const plano = readFileSync("src/lib/onboarding-plano.functions.ts", "utf8");
  const painel = readFileSync("src/lib/onboarding-jornada.functions.ts", "utf8");
  it("recalcular e criar micro-entrega recalculam o checklist pelo dado real", () => {
    expect(plano).toContain("async function derivadosDoCaso(");
    expect(plano).toContain('.from("ops_microentregas")');
    expect(plano).toContain("dossieMaeDoCaso(");
    // P3 (25/09/2026): criar micro-entrega passa pelo reconciliador único,
    // que recalcula o checklist do plano pelo mesmo dado real.
    const criar = plano.slice(plano.indexOf("export const criarPrimeiraMicroentregaOnboarding"));
    expect(criar).toContain("reconciliarD7Caso(supabase, {");
    const reconciliador = readFileSync("src/lib/d7-microentrega.server.ts", "utf8");
    expect(reconciliador).toContain("dossieMaeDoCaso(");
    expect(reconciliador).toContain("payload: { checklist_inicial: checklist }");
  });
  it("painel de jornada usa ops_microentregas para D7, cadência e contador", () => {
    expect(painel).toContain('.from("ops_microentregas")');
    expect(painel).toContain("primeiraMicroentregaReal: temMicroentrega");
    expect(painel).toContain("primeiraMicroentregaPlanejada: temMicroentrega");
    expect(painel).toContain("if (!temMicroentrega) semMicroentrega += 1;");
    expect(painel).not.toContain('plano?.["proxima_microentrega"]');
  });
});
