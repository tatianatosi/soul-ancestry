import { describe, expect, it } from "vitest";
import { conferirMembro, conferirCasoDoAcesso, exigirLeitura } from "../conferencia-acesso";

const membro = { id: "s", organization_id: "org", auth_user_id: "u", role: "operacoes", status: "active" };
const roles = [{ user_id: "u", organization_id: "org", role: "financeiro" }, { user_id: "u", organization_id: "outra", role: "admin" }];
describe("conferência somente leitura", () => {
  it("combina papéis reais somente da organização e identidade", () => {
    expect(conferirMembro(membro, roles).efetivos).toEqual(["operacoes", "financeiro"]);
  });
  it.each(["suspended", "invited", "revoked"])("%s não tem papéis efetivos", status => {
    expect(conferirMembro({ ...membro, status }, roles).efetivos).toEqual([]);
  });
  it("sem identidade não cria contexto", () => {
    expect(conferirMembro({ ...membro, auth_user_id: null }, roles).organizationId).toBeNull();
  });
  it("demo excluído de avaliações reais", () => {
    expect(conferirMembro({ ...membro, demo: true }, roles).efetivos).toEqual([]);
  });
  it("somente admin aprova preço e contrato no avaliador canônico", () => {
    for (const role of ["admin", "operacoes", "comercial", "financeiro", "pesquisador", "leitura"]) {
      const c = conferirMembro({ ...membro, role }, []);
      for (const capacidade of ["homologar_condicao_comercial", "aprovar_proposta_os_anexo_previa"]) {
        expect(c.operacoes.find(o => o.capacidade === capacidade)?.decisao).toBe(role === "admin" ? "permitir" : "bloquear");
      }
    }
  });
  it("falha de leitura é explícita, não lista vazia", () => {
    expect(() => exigirLeitura({ data: [], error: { message: "falha" } }, "papéis")).toThrow();
    expect(() => exigirLeitura({ data: null, error: null }, "papéis")).toThrow();
    expect(exigirLeitura({ data: [], error: null }, "papéis")).toEqual([]);
  });
});
const acesso = { id: "a", client_id: "p", auth_user_id: "u", access_status: "active", access_level: "client_workspace" };
const vinculo = { case_id: "c", client_portal_access_id: "a", access_status: "active" };
const caso = { id: "c", codigo: "C", titulo: "Caso", cliente_id: "p", contrato_assinado: true, pagamento_confirmado: true, documentos_minimos_ok: true, ativado_em: "2026-11-02", onboarding_iniciado_em: null, app_access_status: "liberado", demo: false };
describe("conferência de caso sem fingir login", () => {
  it("vínculo ativo não comprova primeiro acesso", () => {
    expect(conferirCasoDoAcesso(acesso, vinculo, caso)).toMatchObject({ escopoAtivo: true, loginRegistrado: false });
  });
  it("convite não é acesso concluído", () => {
    expect(conferirCasoDoAcesso({ ...acesso, access_status: "invited" }, vinculo, caso).escopoAtivo).toBe(false);
  });
  it("caso revogado não é autorizado", () => {
    expect(conferirCasoDoAcesso(acesso, { ...vinculo, access_status: "revoked" }, caso).escopoAtivo).toBe(false);
  });
  it("caso ausente ou bloqueado não é autorizado", () => {
    expect(conferirCasoDoAcesso(acesso, vinculo).escopoAtivo).toBe(false);
    expect(conferirCasoDoAcesso(acesso, vinculo, { ...caso, app_access_status: "bloqueado" }).escopoAtivo).toBe(false);
  });
});