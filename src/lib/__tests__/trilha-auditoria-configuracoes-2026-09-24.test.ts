import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * CA-TRILHA-AUDITORIA (24/09/2026) — achado real: `listarAuditoria`
 * (`saas.functions.ts`) já lia `audit_logs` org-wide com diff completo
 * (valores_anteriores/valores_posteriores), RLS já restringe a leitura a
 * admin no banco — mas não tinha nenhum consumidor em toda a base (zero
 * rota, componente ou teste). O motor de auditoria (escritores em dezenas
 * de módulos, RLS real) já estava pronto; só faltava a tela para o admin
 * de fato ver a trilha. Fecha em /configuracoes (já admin-only, já
 * hospeda Modo Proprietária) — sem rota nova, sem 7º item de navegação.
 */

const funcoes = readFileSync("src/lib/saas.functions.ts", "utf8");
const rota = readFileSync("src/routes/_authenticated/configuracoes.tsx", "utf8");

describe("listarAuditoria resolve o autor, não só o UUID cru", () => {
  it("busca profiles e mapeia nome/e-mail do autor, mesmo padrão de listarUsuarios", () => {
    const trecho = funcoes.slice(
      funcoes.indexOf("export const listarAuditoria"),
      funcoes.indexOf("export const listarUsuarios"),
    );
    expect(trecho).toContain('.from("profiles")');
    expect(trecho).toContain("autorNome");
    expect(trecho).toContain("autorEmail");
  });

  it("continua org-scoped, ordenado por mais recente, com o diff completo", () => {
    const trecho = funcoes.slice(
      funcoes.indexOf("export const listarAuditoria"),
      funcoes.indexOf("export const listarUsuarios"),
    );
    expect(trecho).toContain('.eq("organization_id", organizationId)');
    expect(trecho).toContain('.order("created_at", { ascending: false })');
    expect(trecho).toContain("valores_anteriores,valores_posteriores");
  });
});

describe("/configuracoes agora consome listarAuditoria (antes órfã)", () => {
  it("importa e chama listarAuditoria", () => {
    expect(rota).toContain('import { definirPapel, listarAuditoria, listarUsuarios, type Papel } from "@/lib/saas.functions"');
    expect(rota).toContain("useServerFn(listarAuditoria)");
  });

  it("a seção fica atrás do mesmo gate admin-only das demais seções da página", () => {
    const idx = rota.indexOf("Abrir trilha de auditoria");
    const trecho = rota.slice(idx, idx + 400);
    expect(trecho).toContain("!liberado");
    expect(trecho).toContain("<EstadoVazio");
    expect(trecho).toContain("<EstadoDados");
  });

  it("mostra ação, entidade, autor e data — não só um UUID", () => {
    const idx = rota.indexOf("function TrilhaAuditoria");
    const trecho = rota.slice(idx, idx + 1500);
    expect(trecho).toContain("rotuloAcaoEvento(");
    expect(trecho).toContain('e["entidade"]');
    expect(trecho).toContain('e["autorNome"]');
    expect(trecho).toContain("toLocaleString(\"pt-BR\")");
  });

  it("o diff antes/depois fica atrás de um details, não exposto por padrão", () => {
    const idx = rota.indexOf("function TrilhaAuditoria");
    const trecho = rota.slice(idx, idx + 1500);
    expect(trecho).toContain("Ver antes/depois");
    expect(trecho).toContain("<details");
  });

  it("não cria rota nova nem item de navegação — segue embutida em /configuracoes", () => {
    expect(rota).not.toContain("createFileRoute(\"/_authenticated/auditoria");
  });
});
