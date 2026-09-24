import { readFileSync as lerArquivo } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  AVISO_PRE_MIGRATION_GATE,
  MIGRATION_GATE_CASE_PLANS,
  colunaAusenteNoBanco,
  espelharMotivosBloqueioEmCasePlans,
  lerGateCasePlans,
  motivosDaLeitura,
} from "@/lib/gate-onboarding-case-plans";
import { onboardingLiberadoDoCaso } from "@/lib/onboarding-plano";

/**
 * Migration 20260924190000 versionada e NÃO aplicada (24/09/2026). Pré e
 * pós-migration testados separadamente, com supabase falso: pré falha de
 * forma explicável e não grava em lugar nenhum; pós usa case_plans.
 */

const ERRO_COLUNA = { code: "42703", message: 'column case_plans.motivos_bloqueio does not exist' };

/** Supabase falso que registra toda escrita, por tabela. */
function supabaseFalso(resposta: { data?: unknown; error?: unknown }) {
  const escritas: { tabela: string; op: string }[] = [];
  const cadeia = (tabela: string) => {
    const q: any = {
      update: () => {
        escritas.push({ tabela, op: "update" });
        return q;
      },
      insert: () => {
        escritas.push({ tabela, op: "insert" });
        return q;
      },
      upsert: () => {
        escritas.push({ tabela, op: "upsert" });
        return q;
      },
      eq: () => q,
      is: () => q,
      select: () => Promise.resolve(resposta),
    };
    return q;
  };
  return { cliente: { from: (t: string) => cadeia(t) }, escritas };
}

const entrada = { organizationId: "org-1", caseId: "caso-1", motivos: ["Contrato assinado pendente."], userId: "u-1" };

describe("colunaAusenteNoBanco", () => {
  it("reconhece Postgres 42703 e PostgREST PGRST204", () => {
    expect(colunaAusenteNoBanco({ code: "42703" })).toBe(true);
    expect(colunaAusenteNoBanco({ code: "PGRST204" })).toBe(true);
  });
  it("reconhece pela mensagem quando não há código", () => {
    expect(colunaAusenteNoBanco({ message: "column x.y does not exist" })).toBe(true);
    expect(colunaAusenteNoBanco({ message: "Could not find the 'motivos_bloqueio' column of 'case_plans'" })).toBe(true);
  });
  it("não confunde outros erros (RLS, rede) com coluna ausente", () => {
    expect(colunaAusenteNoBanco({ code: "42501", message: "permission denied" })).toBe(false);
    expect(colunaAusenteNoBanco(null)).toBe(false);
  });
});

describe("PRÉ-migration (estado atual do banco conectado)", () => {
  it("leitura: devolve pre_migration com aviso que cita a migration", () => {
    const l = lerGateCasePlans({ data: null, error: ERRO_COLUNA });
    expect(l.estado).toBe("pre_migration");
    expect(AVISO_PRE_MIGRATION_GATE).toContain(MIGRATION_GATE_CASE_PLANS);
    expect(AVISO_PRE_MIGRATION_GATE).toContain("nada foi gravado em case_plans");
  });
  it("leitura: o gate vem de onboarding_planos, não de um motivo inventado", () => {
    const l = lerGateCasePlans({ data: null, error: ERRO_COLUNA });
    expect(motivosDaLeitura(l)).toBeUndefined();
    expect(onboardingLiberadoDoCaso({ motivosBloqueioCasePlans: motivosDaLeitura(l), estadoOnboardingPlanos: "bloqueado" })).toBe(false);
    expect(
      onboardingLiberadoDoCaso({ motivosBloqueioCasePlans: motivosDaLeitura(l), estadoOnboardingPlanos: "liberado_preparacao" }),
    ).toBe(true);
  });
  it("escrita: devolve pre_migration e não grava em nenhuma outra tabela", async () => {
    const { cliente, escritas } = supabaseFalso({ data: null, error: ERRO_COLUNA });
    const r = await espelharMotivosBloqueioEmCasePlans(cliente, entrada);
    expect(r.estado).toBe("pre_migration");
    expect(r.aviso).toBe(AVISO_PRE_MIGRATION_GATE);
    expect(escritas).toEqual([{ tabela: "case_plans", op: "update" }]);
  });
});

describe("PÓS-migration", () => {
  it("leitura: usa case_plans.motivos_bloqueio", () => {
    const l = lerGateCasePlans({ data: { motivos_bloqueio: [] }, error: null });
    expect(l.estado).toBe("pos_migration");
    expect(onboardingLiberadoDoCaso({ motivosBloqueioCasePlans: motivosDaLeitura(l), estadoOnboardingPlanos: "bloqueado" })).toBe(
      true,
    );
  });
  it("leitura sem linha de case_plans cai para onboarding_planos pela regra existente", () => {
    const l = lerGateCasePlans({ data: null, error: null });
    expect(motivosDaLeitura(l)).toBeUndefined();
  });
  it("escrita com linha: espelhado, sem aviso", async () => {
    const { cliente } = supabaseFalso({ data: [{ id: "cp-1" }], error: null });
    expect(await espelharMotivosBloqueioEmCasePlans(cliente, entrada)).toEqual({ estado: "espelhado", aviso: null });
  });
  it("escrita sem linha: sem_linha_case_plans, com aviso — nunca cria a linha", async () => {
    const { cliente, escritas } = supabaseFalso({ data: [], error: null });
    const r = await espelharMotivosBloqueioEmCasePlans(cliente, entrada);
    expect(r.estado).toBe("sem_linha_case_plans");
    expect(r.aviso).toBeTruthy();
    expect(escritas.some((e) => e.op !== "update")).toBe(false);
  });
});

describe("outros erros não viram silêncio", () => {
  it("leitura com erro de permissão lança mensagem explícita", () => {
    expect(() => lerGateCasePlans({ data: null, error: { code: "42501", message: "permission denied" } })).toThrow(
      /Não foi possível ler o gate de onboarding em case_plans: permission denied/,
    );
  });
  it("escrita com erro de permissão devolve estado erro com a mensagem", async () => {
    const { cliente } = supabaseFalso({ data: null, error: { code: "42501", message: "permission denied" } });
    const r = await espelharMotivosBloqueioEmCasePlans(cliente, entrada);
    expect(r.estado).toBe("erro");
    expect(r.aviso).toContain("permission denied");
  });
});

describe("backfill e tela de migração — pré-migration para antes de gravar", () => {
  const backfill = lerArquivo("src/lib/onboarding-gate-backfill.functions.ts", "utf8");
  const rota = lerArquivo("src/routes/_authenticated/governanca.migracao-onboarding-gate.tsx", "utf8");
  it("detecta a coluna ausente e retorna schemaPendente antes de qualquer update", () => {
    const deteccao = backfill.indexOf("colunaAusenteNoBanco(erroAlvos)");
    expect(deteccao).toBeGreaterThan(0);
    expect(backfill.indexOf(".update(")).toBeGreaterThan(deteccao);
    expect(backfill).toContain("schemaPendente: true, aviso: AVISO_PRE_MIGRATION_GATE");
  });
  it("falha de update vira lista de falhas, não some", () => {
    expect(backfill).toContain("falhas.push({ caseId: item.caseId, motivo: error.message })");
  });
  it("a tela mostra o aviso e não mostra plano enganoso de 'sem alvo'", () => {
    expect(rota).toContain("data-migracao-schema-pendente");
    expect(rota).toContain("{plano && !aviso && (");
  });
});
