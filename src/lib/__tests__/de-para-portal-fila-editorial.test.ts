import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { filaEditorialPortal } from "@/lib/portal-elegibilidade";

/**
 * §22 do De-Para (Desk — Portal do Cliente, zona "Fila editorial — itens
 * para revisar e publicar: tipo de conteúdo, família, origem, responsável,
 * prazo"). A "Matriz de módulos" (7 linhas por aba) já tinha divergência
 * declarada — schema não sustenta estado de publicação por aba. A Fila
 * editorial é diferente: `app_projections` já grava tipo/origem/autor/data
 * por item, e nenhuma tela lia isso — mesma fonte de `resumoPublicacaoPorCaso`,
 * item a item em vez de agregada.
 */

const rota = readFileSync("src/routes/_authenticated/acessos-portal.tsx", "utf8");
const funcoes = readFileSync("src/lib/portal.functions.ts", "utf8");

describe("filaEditorialPortal — pura, sem fabricar responsável/prazo", () => {
  const casos = [{ id: "c1", codigo: "CA-001", titulo: null }];

  it("inclui apenas itens em draft/in_review/approved e não arquivados", () => {
    const itens = filaEditorialPortal(
      [
        { case_id: "c1", approval_status: "draft", archived_at: null, id: "p1" },
        { case_id: "c1", approval_status: "published", archived_at: null, id: "p2" },
        { case_id: "c1", approval_status: "approved", archived_at: "2026-01-01", id: "p3" },
      ],
      casos,
    );
    expect(itens.map((i) => i.id)).toEqual(["p1"]);
  });

  it("resolve família pelo código do caso, nunca pelo id cru quando há código", () => {
    const [item] = filaEditorialPortal(
      [{ case_id: "c1", approval_status: "in_review", archived_at: null, id: "p1" }],
      casos,
    );
    expect(item!.familia).toBe("CA-001");
  });

  it("sem autor registrado, responsável fica null — nunca um nome inventado", () => {
    const [item] = filaEditorialPortal(
      [{ case_id: "c1", approval_status: "draft", archived_at: null, id: "p1", created_by: null, updated_by: null }],
      casos,
    );
    expect(item!.responsavel).toBeNull();
  });

  it("prioriza updated_by sobre created_by quando ambos existem", () => {
    const [item] = filaEditorialPortal(
      [
        {
          case_id: "c1",
          approval_status: "draft",
          archived_at: null,
          id: "p1",
          created_by: "autor-original",
          updated_by: "ultimo-editor",
        },
      ],
      casos,
    );
    expect(item!.responsavel).toBe("ultimo-editor");
  });
});

describe("Fila editorial — rota e leitura (sem query nova)", () => {
  it("a rota importa e renderiza a fila editorial", () => {
    expect(rota).toContain("filaEditorialPortal");
    expect(rota).toContain("data-fila-editorial-portal");
    expect(rota).toContain("filaEditorialPortal(projecoes, casos)");
  });

  it("a leitura de app_projections ganha os campos aditivos, sem tabela/coluna nova", () => {
    expect(funcoes).toContain(
      "id, case_id, approval_status, archived_at, projection_type, source_entity_type, created_by, updated_by, effective_from, created_at",
    );
  });
});
