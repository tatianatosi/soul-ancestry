import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * DSA-11: quarto consumidor real do Design System no Desk (DSA-1
 * `qualidade.tsx`, DSA-2 `painel.tsx`, DSA-8 `pessoas.$clienteId.tsx`). O
 * arquivo já usava `EstadoVazio`; faltava `CaCard` nas cinco seções
 * ad-hoc (`<section className="rounded-xl border ...">`) — Publicação por
 * caso, Fila editorial, E-mails autorizados, Novo convite e Acessos. Sem
 * criar componente novo, sem mudar fonte de dado ou writer.
 *
 * A grade sem título (`<section className="grid gap-3 md:grid-cols-2">`,
 * os dois cartões de "Nível de acesso") fica de fora de propósito: não tem
 * cabeçalho/título — não é a mesma forma que CaCard resolve.
 */
const ARQUIVO = readFileSync("src/routes/_authenticated/acessos-portal.tsx", "utf8");

describe("DSA-11 — CaCard aplicado às cinco seções tituladas de Acessos ao portal", () => {
  it("importa CaCard do módulo canônico, não recria", () => {
    expect(ARQUIVO).toMatch(/import\s*\{\s*CaCard\s*\}\s*from\s*"@\/components\/ui\/ca-card"/);
  });

  it("as cinco seções tituladas viraram CaCard", () => {
    for (const titulo of [
      'titulo="Publicação por caso"',
      'titulo="Fila editorial"',
      'titulo="E-mails autorizados"',
      'titulo="Novo convite"',
      'titulo="Acessos"',
    ]) {
      expect(ARQUIVO, `CaCard ausente: ${titulo}`).toContain(titulo);
    }
    const abertas = ARQUIVO.match(/<CaCard/g) ?? [];
    const fechadas = ARQUIVO.match(/<\/CaCard>/g) ?? [];
    expect(abertas.length).toBe(5);
    expect(fechadas.length).toBe(5);
  });

  it("a grade sem título (Nível de acesso) continua fora do CaCard — não tem cabeçalho para migrar", () => {
    expect(ARQUIVO).toContain('<section className="grid gap-3 md:grid-cols-2">');
  });

  it("os data-attributes exigidos por outros testes continuam presentes", () => {
    expect(ARQUIVO).toContain("data-resumo-publicacao-por-caso");
    expect(ARQUIVO).toContain("data-fila-editorial-portal");
    expect(ARQUIVO).toContain("data-fila-editorial-item");
  });

  it("estados vazios honestos das duas listas de tabela usam EstadoVazio", () => {
    for (const mensagem of [
      "Nenhum caso com acesso ao portal configurado ainda.",
      "Nenhum item aguardando revisão ou publicação agora.",
    ]) {
      const idx = ARQUIVO.indexOf(mensagem);
      expect(idx, `mensagem ausente: ${mensagem}`).toBeGreaterThan(-1);
      expect(ARQUIVO.slice(Math.max(0, idx - 60), idx)).toContain("EstadoVazio");
    }
    // "Acessos" já usava EstadoVazio antes deste corte — não regrediu.
    expect(ARQUIVO).toContain('mensagem="Nenhum acesso ao portal criado ainda."');
  });

  it("nenhuma fonte de dado ou writer foi trocado (mesmas queries/mutações)", () => {
    expect(ARQUIVO).toContain('queryKey: ["acessos-portal"]');
    expect(ARQUIVO).toContain("useServerFn(listarAcessosPortal)");
    expect(ARQUIVO).toContain("useServerFn(criarConvitePortal)");
    expect(ARQUIVO).toContain("useServerFn(alterarStatusAcessoPortal)");
    expect(ARQUIVO).toContain("resumoPublicacaoPorCaso");
    expect(ARQUIVO).toContain("filaEditorialPortal(projecoes, casos)");
  });

  it("o card de Acessos preserva ações operacionais (suspender/reativar/revogar) reais", () => {
    const trecho = ARQUIVO.slice(ARQUIVO.indexOf('titulo="Acessos"'));
    expect(trecho).toContain("suspender_acesso_portal");
    expect(trecho).toContain("reativar_acesso_portal");
    expect(trecho).toContain("revogar_acesso_portal");
  });
});
