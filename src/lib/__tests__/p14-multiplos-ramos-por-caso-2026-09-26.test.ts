import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// P14 (26/09/2026): "múltiplos ramos por caso" — achado real é que a
// infraestrutura já existia por inteiro (lineage_paths com case_id/
// family_id/citizenship_track_id/pessoa_ancora_id, leitor+escritor+UI em
// pessoas-linhagens.functions.ts/.tsx, sem restrição a 1 linha por caso),
// mas nunca tinha sido aplicada — a tabela estava vazia para todo caso
// real. Este corte não cria tabela nova; só aplica a Ana Luiza (Cenário C
// da "Auditoria de Coerência — Produto-Pai, Jornada, Planejador Universal
// e Legado", v1.0 04/09/2026).
const migracao = readFileSync(
  "supabase/migrations/20260926100000_multiplos_ramos_por_caso_aplicado_ana.sql",
  "utf8",
);
const pessoasLinhagensFn = readFileSync("src/lib/pessoas-linhagens.functions.ts", "utf8");
const pessoasLinhagensUi = readFileSync("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx", "utf8");

describe("P14 — múltiplos ramos por caso: infraestrutura já existente, nenhuma tabela nova", () => {
  it("o escritor genérico G02 (salvarRegistroG02) nunca restringe lineage_paths a uma linha por caso", () => {
    const trecho = pessoasLinhagensFn.slice(pessoasLinhagensFn.indexOf("export const salvarRegistroG02"));
    // Sempre insere quando não há id (nova linhagem) — nunca faz upsert por case_id.
    expect(trecho).toContain("inserirComVerificacao");
    expect(trecho).not.toMatch(/limit\(1\).*lineage_paths|lineage_paths.*limit\(1\)/s);
  });

  it("a UI já deixa explícito que o mesmo caso aceita várias linhagens", () => {
    expect(pessoasLinhagensUi).toContain(
      "Linha dupla é configuração de análise: o mesmo caso aceita várias linhagens, sem duplicar pessoa nem criar caso novo.",
    );
  });

  it("a leitura de linhagens do caso não usa maybeSingle nem limit(1) — sempre lista", () => {
    const trecho = pessoasLinhagensFn.slice(
      pessoasLinhagensFn.indexOf('org("lineage_paths")'),
      pessoasLinhagensFn.indexOf('org("lineage_paths")') + 120,
    );
    expect(trecho).not.toContain("maybeSingle");
    expect(trecho).not.toContain("limit(1)");
  });
});

describe("P14 — aplicação real ao caso da Ana (Cenário C da auditoria)", () => {
  it("migration liga case_id, family_id, pessoa_ancora_id e citizenship_track_id já existentes — nenhum id novo inventado", () => {
    expect(migracao).toContain("'a11a0000-0000-4000-8000-000000000002'"); // caso Ana Luiza
    expect(migracao).toContain("'a11a0000-0000-4000-8000-0000000000f1'"); // núcleo Silveira/Friedmann-Reimer
    expect(migracao).toContain("'c1a50000-0000-4000-8000-0000000000e1'"); // pessoa âncora (Ana Luiza)
    expect(migracao).toContain("'adc77966-0aaf-44f0-a822-94bbba326903'"); // trilha canônica Áustria (dedup do P12)
  });

  it("é idempotente (where not exists / where ... is null) — nunca duplica a linhagem nem sobrescreve family_id humano", () => {
    expect(migracao).toContain("where not exists");
    expect(migracao).toContain("family_id is null");
  });

  it("tipo_da_linha usado é 'cidadania' — vocabulário já existente no CHECK real, nenhum valor novo", () => {
    expect(migracao).toContain("'cidadania'");
  });
});
