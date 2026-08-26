import { describe, expect, it } from "vitest";

import {
  EMAIL_PROPRIETARIA,
  ORGANIZACAO_CANONICA_ID,
  ORGANIZACAO_CANONICA_SLUG,
  verificarAcessoProprietaria,
  type RetratoAcesso,
} from "../verificacao-acesso-proprietaria";

const USER = "92fa5a0c-0000-0000-0000-000000000000";

function retratoIntegro(): RetratoAcesso {
  return {
    perfis: [{ id: USER, email: EMAIL_PROPRIETARIA }],
    organizacao: {
      id: ORGANIZACAO_CANONICA_ID,
      slug: ORGANIZACAO_CANONICA_SLUG,
      archived_at: null,
    },
    memberships: [{ organization_id: ORGANIZACAO_CANONICA_ID, user_id: USER, archived_at: null }],
    papeis: [{ organization_id: ORGANIZACAO_CANONICA_ID, user_id: USER, role: "admin" }],
    staff: [
      {
        organization_id: ORGANIZACAO_CANONICA_ID,
        auth_user_id: USER,
        status: "active",
        role: "admin",
        archived_at: null,
      },
    ],
  };
}

function chave(r: ReturnType<typeof verificarAcessoProprietaria>, k: string) {
  return r.itens.find((i) => i.chave === k)!;
}

describe("verificação de acesso da Proprietária Administradora", () => {
  it("aprova o retrato íntegro após a restauração da organização", () => {
    const r = verificarAcessoProprietaria(retratoIntegro());
    expect(r.aprovado).toBe(true);
    expect(r.userId).toBe(USER);
    expect(r.itens).toHaveLength(5);
  });

  it("reprova quando a organização continua arquivada logicamente", () => {
    const base = retratoIntegro();
    base.organizacao = { ...base.organizacao!, archived_at: "2026-08-16T00:00:00Z" };
    const r = verificarAcessoProprietaria(base);
    expect(r.aprovado).toBe(false);
    expect(chave(r, "organizacao_ativa").aprovado).toBe(false);
  });

  it("reprova quando o vínculo com a organização foi arquivado", () => {
    const base = retratoIntegro();
    base.memberships = [
      {
        organization_id: ORGANIZACAO_CANONICA_ID,
        user_id: USER,
        archived_at: "2026-08-20T00:00:00Z",
      },
    ];
    const r = verificarAcessoProprietaria(base);
    expect(chave(r, "membership_ativo").aprovado).toBe(false);
    expect(r.aprovado).toBe(false);
  });

  it("reprova quando o papel admin não está persistido", () => {
    const base = retratoIntegro();
    base.papeis = [{ organization_id: ORGANIZACAO_CANONICA_ID, user_id: USER, role: "leitura" }];
    const r = verificarAcessoProprietaria(base);
    expect(chave(r, "papel_admin").aprovado).toBe(false);
    expect(chave(r, "papel_admin").detalhe).toContain("leitura");
  });

  it("reprova quando o papel admin pertence a outra organização", () => {
    const base = retratoIntegro();
    base.papeis = [{ organization_id: "outra-org", user_id: USER, role: "admin" }];
    expect(verificarAcessoProprietaria(base).aprovado).toBe(false);
  });

  it("reprova quando o cadastro de equipe está suspenso ou arquivado", () => {
    const suspenso = retratoIntegro();
    suspenso.staff = [{ ...suspenso.staff[0]!, status: "suspended" }];
    expect(chave(verificarAcessoProprietaria(suspenso), "staff_ativo").aprovado).toBe(false);

    const arquivado = retratoIntegro();
    arquivado.staff = [{ ...arquivado.staff[0]!, archived_at: "2026-08-21T00:00:00Z" }];
    expect(chave(verificarAcessoProprietaria(arquivado), "staff_ativo").aprovado).toBe(false);
  });

  it("reprova e não resolve usuário quando há conta duplicada para o mesmo e-mail", () => {
    const base = retratoIntegro();
    base.perfis = [
      { id: USER, email: EMAIL_PROPRIETARIA },
      { id: "outro", email: "TATI@PluggedResearch.com" },
    ];
    const r = verificarAcessoProprietaria(base);
    expect(r.userId).toBeNull();
    expect(chave(r, "conta_unica").aprovado).toBe(false);
    expect(r.aprovado).toBe(false);
  });

  it("ignora perfis de outros e-mails ao resolver a proprietária", () => {
    const base = retratoIntegro();
    base.perfis = [
      { id: "demo", email: "admin.demo@exemplo.test" },
      { id: USER, email: EMAIL_PROPRIETARIA },
    ];
    expect(verificarAcessoProprietaria(base).aprovado).toBe(true);
  });
});
