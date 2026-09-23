import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * §23 do De-Para (Desk — Configuração & Acesso): 5 zonas — Usuários, Papéis,
 * Acessos por família/caso, Parâmetros, Integrações/auditoria. `/equipe` já
 * cobria Usuários; as outras 4 são adicionadas aqui como links para as
 * superfícies canônicas reais (/acessos-portal, /configuracoes,
 * /integracoes) — nunca duplicando estado, regra explícita do próprio §23
 * ("Legado: configurações duplicadas que alteram o mesmo estado em lugares
 * diferentes"). Onde não existe matriz de permissão por domínio versionada,
 * a rota declara a lacuna (§29) em vez de fabricar um "sim/não" por papel.
 */

const rota = readFileSync("src/routes/_authenticated/equipe.tsx", "utf8");

describe("Configuração & Acesso — as 5 zonas do §23 em /equipe", () => {
  it("Usuários: nome, papel, status, último acesso (já existia, não regredido)", () => {
    expect(rota).toContain("m.full_name");
    expect(rota).toContain("STATUS_LABEL[m.status]");
    expect(rota).toContain("m.last_login_at");
  });

  it("Papéis: lista os papéis reais e declara a lacuna da matriz por domínio, sem inventar permissão", () => {
    expect(rota).toContain("data-config-papeis");
    expect(rota).toContain("CAPACIDADES_PROPRIETARIA");
    expect(rota).toContain("DIVERGÊNCIA REGISTRADA (§29)");
    expect(rota).toContain("Sem matriz central por domínio");
  });

  it("Acessos por família/caso: linka para /acessos-portal, não duplica a tela", () => {
    expect(rota).toContain("data-config-acessos");
    expect(rota).toContain('to="/acessos-portal"');
  });

  it("Parâmetros: linka para /configuracoes, não duplica a tela", () => {
    expect(rota).toContain("data-config-parametros");
    expect(rota).toContain('to="/configuracoes"');
  });

  it("Integrações/auditoria: linka para /integracoes, cita audit_logs como fonte de registro", () => {
    expect(rota).toContain("data-config-integracoes");
    expect(rota).toContain('to="/integracoes"');
    expect(rota).toContain("audit_logs");
  });

  it("nenhuma das 4 zonas novas expõe segredo, token ou credencial", () => {
    const trecho = rota.slice(rota.indexOf("data-config-papeis"), rota.indexOf("<section>", rota.indexOf("data-config-integracoes")));
    expect(trecho.toLowerCase()).not.toMatch(/service_role|api[_-]?key|secret|token de acesso/);
  });
});
