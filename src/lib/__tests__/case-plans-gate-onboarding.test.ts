import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Decisão da Proprietária, 2026-09-24: em resposta a uma pergunta direta
 * sobre a autorização "case_plans vira fonte canônica única, onboarding_
 * planos em absorção", investigação prévia mostrou que produto_pai_id/
 * rota_confirmada/fase_jornada/composicao NUNCA estiveram duplicados em
 * onboarding_planos (já eram exclusivos de case_plans) — o overlap real
 * era só em 7 colunas do gate de onboarding, sem equivalente em
 * case_plans. Escolhida a opção "migrar case_plans para cobrir os campos
 * exclusivos". Este teste confere: a migration replica os domínios/CHECKs
 * exatos de onboarding_planos (sem inventar vocabulário novo), o
 * espelhamento é best-effort e nunca derruba a escrita real, e o backfill
 * nunca cria linha de case_plans nova.
 */

const MIGRATION = "supabase/migrations/20260924190000_case_plans_gate_onboarding.sql";
const MIGRATION_ORIGINAL_ONBOARDING_PLANOS =
  "supabase/migrations/20260820182049_6117e5d9-c6ae-4961-9bac-176ee1f9a0d6.sql";

describe("migration — case_plans ganha o gate de onboarding", () => {
  const sql = readFileSync(MIGRATION, "utf8");
  const original = readFileSync(MIGRATION_ORIGINAL_ONBOARDING_PLANOS, "utf8");

  it("adiciona as 7 colunas, todas nullable (aditiva, sem quebrar linha existente)", () => {
    for (const coluna of [
      "inicio_previsto date",
      "dossie_mae_status text",
      "dossie_mae_referencia text",
      "ambiente_autorizado text",
      "nivel_acesso text",
      "grupo_familiar_status text",
    ]) {
      expect(sql).toContain(`ADD COLUMN IF NOT EXISTS ${coluna}`);
    }
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS motivos_bloqueio jsonb NOT NULL DEFAULT '[]'::jsonb");
  });

  it("não apaga nem renomeia nenhuma coluna existente", () => {
    expect(sql).not.toMatch(/DROP COLUMN/i);
    expect(sql).not.toMatch(/RENAME COLUMN/i);
  });

  it("replica o domínio exato de dossie_mae_status de onboarding_planos, sem inventar valor novo", () => {
    const valoresOriginais = original.match(/dossie_mae_status text[^)]*CHECK \(dossie_mae_status IN \(([^)]+)\)\)/);
    expect(valoresOriginais).not.toBeNull();
    const valoresMigrados = sql.match(/dossie_mae_status IS NULL OR dossie_mae_status IN \(([^)]+)\)/);
    expect(valoresMigrados).not.toBeNull();
    expect(valoresMigrados![1]).toBe(valoresOriginais![1]);
  });

  it("replica o domínio exato de grupo_familiar_status de onboarding_planos, sem inventar valor novo", () => {
    const valoresOriginais = original.match(/grupo_familiar_status text[^)]*CHECK \(grupo_familiar_status IN \(([^)]+)\)\)/);
    expect(valoresOriginais).not.toBeNull();
    const valoresMigrados = sql.match(/grupo_familiar_status IS NULL OR grupo_familiar_status IN \(([^)]+)\)/);
    expect(valoresMigrados).not.toBeNull();
    expect(valoresMigrados![1]).toBe(valoresOriginais![1]);
  });

  it("usa DO $$ ... EXCEPTION WHEN duplicate_object para os CHECKs, mesmo padrão de case_plans_produto_pai.sql", () => {
    expect(sql.match(/EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;/g)?.length).toBe(2);
  });
});

/*
 * 24/09/2026 — a migration NÃO foi aplicada no banco conectado (decisão da
 * Proprietária: só com nova autorização de banco). types.ts é gerado do
 * banco, então ele diz em que estado estamos. O teste antigo exigia as 7
 * colunas (assumia pós-migration) e falhava; agora afirma o estado real e o
 * que precisa valer em cada um — sem pular nenhum dos dois.
 */
const COLUNAS_GATE = [
  "ambiente_autorizado",
  "dossie_mae_referencia",
  "dossie_mae_status",
  "grupo_familiar_status",
  "inicio_previsto",
  "motivos_bloqueio",
  "nivel_acesso",
];

describe("integrations/supabase/types.ts — estado da migration no banco conectado", () => {
  const types = readFileSync("src/integrations/supabase/types.ts", "utf8");
  const inicio = types.indexOf("case_plans: {");
  const fim = types.indexOf("case_source_documents", inicio) > -1 ? types.indexOf("case_source_documents", inicio) : inicio + 6000;
  const bloco = types.slice(inicio, fim);
  const presentes = COLUNAS_GATE.filter((c) => (bloco.match(new RegExp(`${c}\\??: `, "g"))?.length ?? 0) >= 3);
  const estado = presentes.length === 0 ? "pre_migration" : presentes.length === COLUNAS_GATE.length ? "pos_migration" : "parcial";

  it("o banco está em um estado coerente: todas as 7 colunas ou nenhuma", () => {
    expect(estado).not.toBe("parcial");
  });

  it("migration aplicada em 24/09/2026: tipos gerados trazem as 7 colunas (pós-migration)", () => {
    expect(estado).toBe("pos_migration");
  });

  it("pré-migration: nenhum código lê as colunas pelo tipo gerado sem tratar a ausência", () => {
    if (estado !== "pre_migration") return;
    for (const arquivo of ["src/lib/fechamento-caso.functions.ts", "src/lib/case-service-consolidacao.functions.ts"]) {
      const src = readFileSync(arquivo, "utf8");
      expect(src, arquivo).toContain("lerGateCasePlans(");
      expect(src, arquivo).toContain("motivosDaLeitura(gateCasePlans)");
    }
    const backfill = readFileSync("src/lib/onboarding-gate-backfill.functions.ts", "utf8");
    expect(backfill).toContain("colunaAusenteNoBanco(erroAlvos)");
  });

  it("pós-migration: Row/Insert/Update têm os 7 campos", () => {
    if (estado !== "pos_migration") return;
    for (const campo of COLUNAS_GATE) {
      expect(bloco.match(new RegExp(`${campo}\\??: `, "g"))?.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("espelhamento em case_plans — best-effort, mas nunca mudo", () => {
  const fn = readFileSync("src/lib/onboarding-plano.functions.ts", "utf8");
  const modulo = readFileSync("src/lib/gate-onboarding-case-plans.ts", "utf8");
  const corpo = modulo.slice(modulo.indexOf("export async function espelharMotivosBloqueioEmCasePlans"));

  it("chama o espelhamento nos dois caminhos de escrita (criar e recalcular)", () => {
    expect(fn.match(/espelharMotivosBloqueioEmCasePlans\(/g)?.length).toBe(2);
    expect(fn).toContain("espelhoCasePlans");
  });

  it("não engole o erro: sem try/catch vazio, devolve o estado", () => {
    expect(corpo).not.toContain("} catch {");
    expect(corpo).toContain('estado: "pre_migration"');
    expect(corpo).toContain('estado: "sem_linha_case_plans"');
    expect(corpo).toContain('estado: "erro"');
    expect(corpo).toContain('.eq("fase_jornada", "onboarding")');
  });

  it("nunca cria linha de case_plans nem grava em outra tabela — só UPDATE em case_plans", () => {
    expect(corpo).toContain(".update(");
    expect(corpo).not.toContain(".insert(");
    expect(corpo.match(/\.from\("([a-z_]+)"\)/g)).toEqual(['.from("case_plans")']);
  });
});

describe("onboarding-gate-backfill.functions.ts — nunca cria linha de case_plans", () => {
  const fn = readFileSync("src/lib/onboarding-gate-backfill.functions.ts", "utf8");

  it("classifica caso sem case_plans(onboarding) como sem_alvo, não como erro", () => {
    expect(fn).toContain('"sem_alvo"');
  });

  it("não tem nenhum .insert em case_plans", () => {
    const trechosCasePlans = fn.match(/\.from\("case_plans"\)[\s\S]{0,80}/g) ?? [];
    for (const t of trechosCasePlans) expect(t).not.toContain(".insert(");
  });

  it("só grava quando confirmar=true (dry-run por padrão)", () => {
    expect(fn).toContain("if (!data.confirmar) return { simulado: true");
  });
});

describe("rota de migração — governanca/migracao-onboarding-gate", () => {
  const rota = readFileSync("src/routes/_authenticated/governanca.migracao-onboarding-gate.tsx", "utf8");

  it("tem os dois passos (ver o que será feito / sincronizar agora)", () => {
    expect(rota).toContain("Ver o que será feito");
    expect(rota).toContain("Sincronizar agora");
  });

  it("o botão de sincronizar fica desabilitado sem pendências", () => {
    expect(rota).toContain("disabled={m.isPending || !pendentes}");
  });
});
