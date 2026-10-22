// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));

import {
  ACERVO_EM_CONFERENCIA,
  AcervoEmConferencia,
  CODIGO_CASO_ACERVO_ANA,
  acervoVisivelNoCaso,
} from "@/routes/portal/documentos";

afterEach(cleanup);

const fonte = readFileSync("src/routes/portal/documentos.tsx", "utf8");

describe("21/10/2026 — acervo de documentos da Ana Luiza só no caso dela", () => {
  it("resolve pelo código do caso: só CA-CID-AT-FAM-2026-001", () => {
    expect(CODIGO_CASO_ACERVO_ANA).toBe("CA-CID-AT-FAM-2026-001");
    expect(acervoVisivelNoCaso("CA-CID-AT-FAM-2026-001")).toBe(true);
    expect(acervoVisivelNoCaso("CA-CID-IT-IND-2026-002")).toBe(false);
    expect(acervoVisivelNoCaso(null)).toBe(false);
  });

  it("caso da Ana vê os 3 itens, com títulos, detalhes, ordem e selo intactos, sem ver/baixar", () => {
    const { container } = render(<AcervoEmConferencia visivel={acervoVisivelNoCaso(CODIGO_CASO_ACERVO_ANA)} />);
    const itens = [...container.querySelectorAll("[data-acervo-conferencia] li")];
    expect(itens.map((li) => li.querySelector("p")?.textContent)).toEqual([
      "Certidão de Nascimento",
      "Dossiê Genealógico da Família",
      "Registro da Comunidade Israelita",
    ]);
    expect(ACERVO_EM_CONFERENCIA.map((d) => d.detalhe)).toEqual([
      "Graz, Áustria · 1895",
      "Linhagem Friedmann-Reimer",
      "Viena · 1938–39",
    ]);
    expect(screen.getAllByText("Acervo sob conferência técnica")).toHaveLength(3);
    expect(container.querySelector("button, a")).toBeNull();
    expect(screen.queryByText("Seu acervo está em preparação")).toBeNull();
  });

  it("outro caso não vê nenhum dos 3 e vê o estado vazio", () => {
    render(<AcervoEmConferencia visivel={acervoVisivelNoCaso("CA-CID-IT-IND-2026-002")} />);
    for (const d of ACERVO_EM_CONFERENCIA) {
      expect(screen.queryByText(d.titulo)).toBeNull();
      expect(screen.queryByText(d.detalhe)).toBeNull();
    }
    expect(screen.getByText("Seu acervo está em preparação")).toBeTruthy();
  });

  it("os dois pontos de uso passam a visibilidade do caso ativo e o comentário foi atualizado", () => {
    expect(fonte.match(/<AcervoEmConferencia visivel=\{acervoVisivel\} \/>/g)).toHaveLength(2);
    expect(fonte).not.toMatch(/<AcervoEmConferencia \/>/);
    expect(fonte).toContain(
      "Evidências reais do dossiê da Ana Luiza (CA-CID-AT-FAM-2026-001), informadas pela Proprietária em 13/10 e confirmadas em 21/10/2026. Ligar aos registros do banco após o lançamento.",
    );
  });
});
