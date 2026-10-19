import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { publicacoesParaCliente, rotuloTipoProjecao } from "@/lib/projecoes-cliente";

/**
 * Corte 3b (01/10/2026) — "Atualização da equipe": o terceiro tipo do seletor
 * de /atendimento, lido em "Novidades para você" na Conta do App.
 */
const ler = (p: string) => readFileSync(p, "utf8");

describe("Desk: o seletor de /atendimento publica atualização", () => {
  const tela = ler("src/components/portal/atendimento-interno.tsx");
  const fn = ler("src/lib/portal-atendimento.functions.ts");

  it("a opção existe na tela e o estado aceita os três tipos", () => {
    expect(tela).toContain('<option value="atualizacao">Atualização da equipe</option>');
    expect(tela).toContain('useState<"marco" | "arvore" | "atualizacao">("marco")');
  });

  it("o servidor aceita o tipo novo e mantém as travas de sempre", () => {
    expect(fn).toContain('tipo: "marco" | "arvore" | "atualizacao"');
    // O gate de conteúdo interno e a publicação com autor/data continuam.
    expect(fn).toContain("contemConteudoInterno(conteudo)");
    expect(fn).toContain("approved_by: userId");
    expect(fn).toContain("inserirComVerificacao(");
  });

  it("cada tipo tem exemplo próprio, nenhum texto inventado pelo sistema", () => {
    expect(tela).toContain('publicacaoTipo === "atualizacao"');
  });
});

describe("App: a Conta lê as atualizações publicadas", () => {
  const tela = ler("src/routes/portal/conta.tsx");

  it("filtra pelo tipo e sanitiza pelo caminho de sempre", () => {
    expect(tela).toContain('p.projection_type === "atualizacao"');
    expect(tela).toContain("publicacoesParaCliente(");
    expect(tela).toContain("data-conta-atualizacoes");
  });

  it("o estado vazio só aparece quando não há alerta nem atualização", () => {
    expect(tela).toContain("atualizacoes.length === 0 ?");
    expect(tela).toContain("Em preparação — os recados da equipe aparecem aqui quando forem compartilhados.");
  });

  it("a Conta não importa escritor do Desk", () => {
    expect(tela).not.toContain("portal-atendimento.functions");
  });
});

describe("o tipo tem rótulo aprovado e passa pela sanitização", () => {
  it('"atualizacao" vira "Atualização da equipe" para o cliente', () => {
    expect(rotuloTipoProjecao("atualizacao")).toBe("Atualização da equipe");
  });

  it("publicação vazia é descartada; a mais recente vem primeiro", () => {
    const linhas = [
      { id: "1", projection_type: "atualizacao", content_sanitized: "Antiga", effective_from: "2026-09-01" },
      { id: "2", projection_type: "atualizacao", content_sanitized: "   ", effective_from: "2026-09-15" },
      { id: "3", projection_type: "atualizacao", content_sanitized: "Nova", effective_from: "2026-10-01" },
    ];
    const r = publicacoesParaCliente(linhas);
    expect(r.map((p) => p.conteudo)).toEqual(["Nova", "Antiga"]);
  });
});
