import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

import { resumoPublicacaoPorCaso } from "@/lib/portal-elegibilidade";

/**
 * §22 do De-Para (Desk — Portal do Cliente, visão interna): "Resumo por
 * família/caso — status geral de publicação do App — módulos publicados,
 * pendentes, última atualização".
 *
 * DIVERGÊNCIA REGISTRADA (§29): a prancha nomeia uma "Matriz de módulos"
 * (uma linha por aba — Home/Jornada/Radar/Árvore/Documentos/Legado/Conta
 * — cada uma com estado próprio). Isso não existe no modelo de dado —
 * `app_projections` grava aprovação por ITEM de conteúdo, não por aba.
 * `resumoPublicacaoPorCaso` agrega o que o dado sustenta de verdade:
 * contagem de itens publicados/pendentes/arquivados por caso, mesma
 * classificação que `resumoVisaoClienteCaso` já usa (Caso 360), agora
 * para todos os casos de uma vez.
 */

describe("resumoPublicacaoPorCaso — função pura", () => {
  it("classifica publicada: approval_status=published sem archived_at", () => {
    const mapa = resumoPublicacaoPorCaso([
      { case_id: "c1", approval_status: "published", archived_at: null },
    ]);
    expect(mapa.get("c1")).toEqual({ publicadas: 1, pendentes: 0, arquivadas: 0 });
  });

  it("classifica arquivada mesmo se approval_status ainda diz published, quando archived_at existe", () => {
    const mapa = resumoPublicacaoPorCaso([
      { case_id: "c1", approval_status: "published", archived_at: "2026-01-01" },
    ]);
    expect(mapa.get("c1")).toEqual({ publicadas: 0, pendentes: 0, arquivadas: 1 });
  });

  it("classifica pendente: draft/in_review/approved sem archived_at", () => {
    const mapa = resumoPublicacaoPorCaso([
      { case_id: "c1", approval_status: "draft", archived_at: null },
      { case_id: "c1", approval_status: "in_review", archived_at: null },
      { case_id: "c1", approval_status: "approved", archived_at: null },
    ]);
    expect(mapa.get("c1")).toEqual({ publicadas: 0, pendentes: 3, arquivadas: 0 });
  });

  it("agrega por caso sem misturar casos diferentes", () => {
    const mapa = resumoPublicacaoPorCaso([
      { case_id: "c1", approval_status: "published", archived_at: null },
      { case_id: "c2", approval_status: "draft", archived_at: null },
    ]);
    expect(mapa.get("c1")).toEqual({ publicadas: 1, pendentes: 0, arquivadas: 0 });
    expect(mapa.get("c2")).toEqual({ publicadas: 0, pendentes: 1, arquivadas: 0 });
  });

  it("ignora projeção sem case_id, sem quebrar", () => {
    const mapa = resumoPublicacaoPorCaso([{ case_id: null, approval_status: "published", archived_at: null }]);
    expect(mapa.size).toBe(0);
  });
});

describe("D11 · listarAcessosPortal agrega app_projections via ponte admin", () => {
  const arquivo = readFileSync(resolve(__dirname, "../portal.functions.ts"), "utf8");

  it("usa supabaseAdmin com filtro explícito de organização (evita recursão RLS)", () => {
    const trecho = arquivo.slice(
      arquivo.indexOf("export const listarAcessosPortal"),
      arquivo.indexOf("/* ---- E-mails previamente autorizados ---- */"),
    );
    expect(trecho).toContain("leitorProjecoes");
    expect(trecho).toMatch(/\.from\("app_projections"\)/);
    expect(trecho).toMatch(/\.eq\("organization_id", organizationId\)/);
  });

  it("retorna projecoes no payload", () => {
    expect(arquivo).toMatch(/projecoes: exigirLeitura\(projecoes,/);
  });
});

describe("D11 · acessos-portal.tsx renderiza Publicação por caso", () => {
  const rota = readFileSync(
    resolve(__dirname, "../../routes/_authenticated/acessos-portal.tsx"),
    "utf8",
  );

  it("importa resumoPublicacaoPorCaso do módulo canônico", () => {
    expect(rota).toMatch(/from "@\/lib\/portal-elegibilidade"/);
    expect(rota).toContain("resumoPublicacaoPorCaso");
  });

  it("marca a seção com data-resumo-publicacao-por-caso", () => {
    expect(rota).toContain("data-resumo-publicacao-por-caso");
  });

  it("só lista casos com vínculo real de acesso ao portal, não a carteira inteira", () => {
    expect(rota).toMatch(/casosComAcessoPortal = casos\.filter\(/);
  });

  it("mostra estado honesto 'Nunca acessou' em vez de data vazia/inventada", () => {
    expect(rota).toMatch(/Nunca acessou/);
  });
});
