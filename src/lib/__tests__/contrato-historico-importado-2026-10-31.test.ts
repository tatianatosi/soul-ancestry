import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  resumirHistoricoImportado,
  type LinhaHistoricoImportado,
} from "@/lib/contrato-historico-importado";

const linha = (
  source_table: string,
  payload: Record<string, unknown>,
  source_created_at: string | null = null,
): LinhaHistoricoImportado => ({
  id: Math.random().toString(36),
  source_table,
  source_created_at,
  payload,
  import_note: null,
});

describe("histórico importado do contrato (31/10/2026)", () => {
  it("resume versões, validações por status e eventos, em ordem", () => {
    const r = resumirHistoricoImportado([
      linha("contract_versions", {
        version_number: 2,
        status: "approved_for_send",
        created_at: "2026-09-01T00:00:00Z",
      }),
      linha("contract_versions", {
        version_number: 1,
        status: "draft",
        created_at: "2026-08-21T00:00:00Z",
      }),
      linha("contract_validation_results", { status: "passed" }),
      linha("contract_validation_results", { status: "passed" }),
      linha("contract_validation_results", { status: "open" }),
      linha("contract_review_events", {
        event_type: "version_created",
        occurred_at: "2026-08-21T15:14:56Z",
      }),
    ]);
    expect(r.versoes.map((v) => v.numero)).toEqual([1, 2]);
    expect(r.validacoes).toEqual({ total: 3, porStatus: { passed: 2, open: 1 } });
    expect(r.eventos).toHaveLength(1);
    expect(r.vazio).toBe(false);
  });

  it("sem linhas é vazio honesto; payload ausente não inventa status", () => {
    expect(resumirHistoricoImportado([]).vazio).toBe(true);
    const r = resumirHistoricoImportado([{ ...linha("contract_versions", {}), payload: null }]);
    expect(r.versoes[0]).toMatchObject({ numero: null, status: "sem status" });
  });

  it("a ficha do instrumento monta o histórico pelo id da rota, dentro de Versões e histórico", () => {
    const tela = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");
    expect(tela).toContain("<HistoricoImportado contratoId={id} />");
    expect(tela.indexOf("<Versoes dados={d}")).toBeLessThan(tela.indexOf("<HistoricoImportado"));
  });

  it("o leitor é só leitura, escopado por organização e contrato, e não grava", () => {
    const fn = readFileSync("src/lib/contratos.functions.ts", "utf8");
    const bloco = fn.slice(fn.indexOf("export const historicoImportadoDoContrato"));
    expect(bloco).toContain('.from("contract_history_imports")');
    expect(bloco).toContain('.eq("organization_id", organizationId)');
    expect(bloco).toContain('.eq("contract_id", data.contract_id)');
    expect(bloco).not.toMatch(/\.(insert|update|delete|upsert)\(/);
  });
});
