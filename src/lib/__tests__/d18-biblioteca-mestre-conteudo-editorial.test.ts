import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

import { prateleiraDe, PRATELEIRAS } from "@/lib/projecoes-cliente";

/**
 * §18 do De-Para (Desk — Biblioteca Mestre). Achado real: a rota `/biblioteca`
 * já existe e já lê `app_projections` org-wide com caso/autor/status
 * resolvidos (listarFilaMicroentregas, hoje só usada para 4 contadores por
 * `FilaPublicacaoReal`) — faltava só classificar por coleção (mesma
 * `prateleiraDe` que o App usa em /portal/legado) e listar/agir sobre os
 * itens. Não era dívida estrutural: era peça órfã sub-utilizada.
 */
describe("prateleiraDe é compartilhada entre App (Legado) e Desk (Biblioteca Mestre)", () => {
  it("classifica por palavra-chave no conteúdo ou no rótulo do tipo", () => {
    expect(prateleiraDe({ conteudo: "Certidão de batismo encontrada", tipoRotulo: "x" })).toBe("cadernos");
    expect(prateleiraDe({ conteudo: "x", tipoRotulo: "Relatório de pesquisa" })).toBe("relatorios");
    expect(prateleiraDe({ conteudo: "Linha do tempo da família", tipoRotulo: "x" })).toBe("narrativas");
  });

  it("sem match nenhum, cai em cadernos por padrão (nunca perde o item)", () => {
    expect(prateleiraDe({ conteudo: "texto qualquer sem palavra-chave", tipoRotulo: "Atualização" })).toBe(
      "cadernos",
    );
  });

  it("as 4 coleções do mockup existem: Cadernos, Relatórios, Narrativas, Memória", () => {
    expect(PRATELEIRAS.map((p) => p.rotulo)).toEqual(["Cadernos", "Relatórios", "Narrativas", "Memória"]);
  });
});

describe("D18 · Biblioteca Mestre (Desk) mostra Coleções, Lista de conteúdo e Ações", () => {
  const componente = readFileSync(
    resolve(__dirname, "../../components/biblioteca/conteudo-editorial-conectado.tsx"),
    "utf8",
  );
  const rota = readFileSync(resolve(__dirname, "../../routes/_authenticated/biblioteca.tsx"), "utf8");
  const funcoes = readFileSync(resolve(__dirname, "../biblioteca-evidencias.functions.ts"), "utf8");

  it("reusa a mesma queryKey de FilaPublicacaoReal, sem busca duplicada", () => {
    expect(componente).toContain('queryKey: ["fila-microentregas"]');
  });

  it("classifica os itens com a função canônica de coleção (mesma do App)", () => {
    expect(componente).toMatch(/from "@\/lib\/projecoes-cliente"/);
    expect(componente).toContain("prateleiraDe({ conteudo: item.descricao, tipoRotulo })");
  });

  it("marca as zonas Coleções e Lista de conteúdo", () => {
    expect(componente).toContain("data-biblioteca-colecoes");
    expect(componente).toContain("data-biblioteca-lista-conteudo");
  });

  it("as ações reusam as mesmas funções já usadas por /biblioteca-evidencias/$caseId (não duplica mutation)", () => {
    expect(componente).toContain("aprovarProjecao");
    expect(componente).toContain("despublicarProjecao");
    expect(componente).toContain("arquivarRegistroG03");
  });

  it("listarFilaMicroentregas expõe atualizadoEm (data real) e não inventa versão", () => {
    expect(funcoes).toContain('atualizadoEm: (p["updated_at"] ?? null) as string | null');
    expect(funcoes).toMatch(/não tem coluna de versão/);
  });

  it("a rota importa e renderiza ConteudoEditorialConectado ao lado de FilaPublicacaoReal", () => {
    expect(rota).toContain("ConteudoEditorialConectado");
    const idxFila = rota.indexOf("<FilaPublicacaoReal");
    const idxEditorial = rota.indexOf("<ConteudoEditorialConectado");
    expect(idxEditorial).toBeGreaterThan(idxFila);
  });
});
