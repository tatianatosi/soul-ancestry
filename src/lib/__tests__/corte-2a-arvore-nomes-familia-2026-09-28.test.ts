import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  conteudoArvore,
  ehMenor,
  nomeParaArvore,
  pessoasDaArvore,
  validarPublicacaoArvore,
} from "@/lib/arvore-publicacao";

/**
 * Corte 2a (28/09/2026): nomes da família (vivos e falecidos) na aba Árvore
 * do App, publicados pela equipe no Desk. Dados fictícios.
 */
const ler = (p: string) => readFileSync(p, "utf8");
const hoje = new Date("2026-09-28T12:00:00Z");

describe("regras de publicação", () => {
  it("menor aparece só pelo primeiro nome", () => {
    expect(ehMenor({ nascimento: "2016-03-01" }, hoje)).toBe(true);
    expect(ehMenor({ is_minor: true }, hoje)).toBe(true);
    expect(ehMenor({ nascimento: "1950-03-01" }, hoje)).toBe(false);
    expect(nomeParaArvore("  Criança  Exemplo Silva ", true)).toBe("Criança");
    expect(nomeParaArvore("Avó  Exemplo", false)).toBe("Avó Exemplo");
  });

  it("só perfil aprovado; nunca altamente restrito; geração 1–5; sem dado interno", () => {
    const ok = { clientVisibility: "aprovada", sensitivityLevel: "standard", geracao: 4, nome: "Bisavó Exemplo", vinculo: "bisavó materna" };
    expect(validarPublicacaoArvore(ok)).toEqual([]);
    expect(validarPublicacaoArvore({ ...ok, clientVisibility: "sanitizada" }).join(" ")).toMatch(/aprovada/);
    expect(validarPublicacaoArvore({ ...ok, sensitivityLevel: "highly_restricted" }).join(" ")).toMatch(/altamente restrita/);
    expect(validarPublicacaoArvore({ ...ok, geracao: 6 }).join(" ")).toMatch(/geração/);
    expect(validarPublicacaoArvore({ ...ok, vinculo: "dossiê 12" }).join(" ")).toMatch(/dado interno/);
    expect(conteudoArvore("Nome", "vínculo")).toBe("Nome · vínculo");
  });
});

describe("App: pessoas distintas por geração, nunca contagem de publicações", () => {
  const base = { projection_type: "arvore", effective_from: "2026-09-01T00:00:00Z" };
  it("uma pessoa por pessoa_id (a publicação mais recente vale); sem pessoa continua nota", () => {
    const r = pessoasDaArvore([
      { ...base, id: "1", pessoa_id: "p1", content_sanitized: "Nome Antigo · avó", geracao_cliente: 3 },
      { ...base, id: "2", pessoa_id: "p1", content_sanitized: "Nome Novo · avó materna", geracao_cliente: 3, effective_from: "2026-09-20T00:00:00Z" },
      { ...base, id: "3", pessoa_id: "p2", content_sanitized: "Bisavô Exemplo", geracao_cliente: 4 },
      { ...base, id: "4", pessoa_id: null, content_sanitized: "Nota geral da árvore" },
      { ...base, id: "5", pessoa_id: "p3", content_sanitized: "Alguém · dossiê 7", geracao_cliente: 2 },
      { id: "6", projection_type: "marco", pessoa_id: "p4", content_sanitized: "Marco" },
    ]);
    expect(r).toEqual([
      { chave: "p1", nome: "Nome Novo", vinculo: "avó materna", geracao: 3 },
      { chave: "p2", nome: "Bisavô Exemplo", vinculo: null, geracao: 4 },
    ]);
  });

  it("a aba Árvore usa as pessoas, conta pessoas distintas e mostra a faixa de liberação", () => {
    const tela = ler("src/routes/portal/arvore.tsx");
    expect(tela).toContain("pessoasDaArvore(vivo.projecoes)");
    // Corte 2b (29/09/2026): a contagem virou o rodapé do mockup (p.6) — continua
    // sendo pessoas distintas, agora com o universo possível ao lado.
    expect(tela).toContain("data-arvore-contagem");
    expect(tela).toContain("{pessoas.length}{\" \"}");
    expect(tela).toContain("de um universo de {PESSOAS_POSSIVEIS_CINCO_GERACOES} possíveis nas 5 gerações");
    expect(tela).toContain("A árvore mostra somente nomes e vínculos já liberados.");
    expect(ler("src/lib/portal-dados-vivos.functions.ts")).toContain("pessoa_id, geracao_cliente");
  });

  it("o caminho do App não importa o escritor do Desk", () => {
    expect(ler("src/routes/portal/arvore.tsx")).not.toContain("arvore-publicacao.functions");
    expect(ler("src/lib/arvore-publicacao.ts")).not.toMatch(/from "@\/lib\/contrato/);
  });
});

describe("Desk: publicar e despublicar sem SQL manual", () => {
  const fn = ler("src/lib/arvore-publicacao.functions.ts");
  it("publica com aprovador e data, destino app, tipo arvore, pessoa e geração", () => {
    for (const t of [
      'projection_type: "arvore"',
      'destination: "app"',
      'approval_status: "published"',
      "approved_by: userId",
      "approved_at: agora",
      "pessoa_id: pessoa.id",
      "geracao_cliente: Number(data.geracao)",
      "inserirComVerificacao(",
      "gravarComVerificacao(",
    ])
      expect(fn).toContain(t);
  });
  it("menor e restrição são aplicados no servidor; tudo filtrado pela organização", () => {
    expect(fn).toContain("nomeParaArvore(data.nome, menor)");
    expect(fn).toContain("validarPublicacaoArvore(");
    expect((fn.match(/\.eq\("organization_id", organizationId\)/g) ?? []).length).toBeGreaterThanOrEqual(6);
  });
  it("despublicar arquiva com motivo (a trava do banco exige 5 letras)", () => {
    expect(fn).toContain('approval_status: "archived", archived_at:');
    expect(fn).toContain("motivo (mínimo 5 letras)");
  });
  it("painel no Desk, na aba Projeção ao cliente, com confirmação inline", () => {
    expect(ler("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx")).toContain("<PublicarArvoreApp caseId={caseId} />");
    const painel = ler("src/components/genealogia/publicar-arvore-app.tsx");
    expect(painel).toContain("Confirmar publicação");
    expect(painel).toContain("Confirmar retirada");
    expect(painel).not.toContain("window.confirm");
  });
  it("migration: view do portal mantém filtro e opções e expõe pessoa e geração", () => {
    const sql = ler("supabase/migrations/20260928120000_app_projections_geracao_cliente_portal_pessoa.sql");
    expect(sql).toContain("security_barrier = true, security_invoker = true");
    expect(sql).toContain("p.approval_status = 'published'");
    expect(sql).toContain("p.pessoa_id,\n       p.geracao_cliente");
    expect(sql).toContain("geracao_cliente BETWEEN 1 AND 5");
  });
});
