import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * A4 (auditoria auth-sessao, 02/11/2026): o contexto de acesso precisa concordar com o que o banco permite
 * gravar, e nunca esconder erro de leitura atrás de "sem vínculo" ou de "admin por padrão".
 */
describe("getContexto concorda com o banco e não esconde erro", () => {
  const src = readFileSync("src/lib/saas.functions.ts", "utf8");
  const ctx = src.slice(src.indexOf("export const getContexto"), src.indexOf("export const listarRegistros"));
  const res = src.slice(src.indexOf("async function resolverOrganizacao"), src.indexOf("export const getContexto"));

  it("erro ao ler staff_access, vínculo ou papéis é lançado (não vira 'sem staff')", () => {
    // A04 (04/11/2026): a leitura de staff_access passou a listar vínculos (sem maybeSingle) e escolher o vigente.
    expect(ctx).toContain("if (staffLinhas.error) throw new Error(");
    expect(ctx).not.toMatch(/from\("staff_access"\)[^;]*\.maybeSingle\(\)/);
    expect(ctx).toContain("if (papeis.error) throw new Error(");
    expect(res).toContain("if (membro.error) throw new Error(");
    expect(res).toContain("if (staff.error) throw new Error(");
  });

  it("não devolve mais 'active/admin' para quem não tem staff_access nem papel", () => {
    expect(ctx).not.toContain('{ status: "active", papel: "admin" as Papel }');
    expect(ctx).toContain('status: "sem_acesso"');
  });

  it("refaz o vínculo a partir do staff_access ativo quando falta o papel em user_roles", () => {
    expect(ctx).toContain("sincronizarVinculo");
    expect(ctx).toContain("!papeisPersistidos.includes(staff.data.role as Papel)");
    expect(ctx).toContain("reparo_vinculo");
  });
});
