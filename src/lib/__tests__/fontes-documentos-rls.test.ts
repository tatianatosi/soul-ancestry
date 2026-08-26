import { describe, expect, it } from "vitest";

import {
  avaliarAcessoDocumento,
  podeArquivarDocumento,
  podeExcluirFisicamente,
  podePesquisarCaso,
  type Caso,
  type Documento,
  type Usuario,
} from "@/lib/fontes-documentos-rls";

const ORG_A = "org-a";
const ORG_B = "org-b";

const casoAna: Caso = { id: "caso-ana", organizationId: ORG_A, responsavelId: "u-pesq-1" };
const casoOutro: Caso = { id: "caso-outro", organizationId: ORG_A, responsavelId: "u-pesq-2" };
const casoOutraOrg: Caso = { id: "caso-b", organizationId: ORG_B, responsavelId: null };

const docAna: Documento = {
  id: "doc-1",
  organizationId: ORG_A,
  caseId: casoAna.id,
  confidencialidade: "equipe_do_caso",
};
const docOutroCaso: Documento = { ...docAna, id: "doc-2", caseId: casoOutro.id };
const docOutraOrg: Documento = {
  ...docAna,
  id: "doc-3",
  organizationId: ORG_B,
  caseId: casoOutraOrg.id,
};
const docRestrito: Documento = { ...docAna, id: "doc-4", confidencialidade: "restrito" };

const admin: Usuario = { userId: "u-admin", organizacoes: [ORG_A], papeis: { [ORG_A]: "admin" } };
const pesquisadorResponsavel: Usuario = {
  userId: "u-pesq-1",
  organizacoes: [ORG_A],
  papeis: { [ORG_A]: "pesquisador" },
};
const pesquisadorOutro: Usuario = {
  userId: "u-pesq-3",
  organizacoes: [ORG_A],
  papeis: { [ORG_A]: "pesquisador" },
};
const leitura: Usuario = {
  userId: "u-leitura",
  organizacoes: [ORG_A],
  papeis: { [ORG_A]: "leitura" },
};
const deOutraOrg: Usuario = { userId: "u-b", organizacoes: [ORG_B], papeis: { [ORG_B]: "admin" } };

describe("RLS de fontes e documentos — acessos legítimos", () => {
  it("admin da organização lê, inclui, edita e arquiva no caso da própria org", () => {
    for (const acao of ["select", "insert", "update"] as const) {
      expect(avaliarAcessoDocumento(acao, admin, docAna, casoAna).permitido).toBe(true);
    }
    expect(podeArquivarDocumento(admin, docAna, casoAna).permitido).toBe(true);
  });

  it("pesquisador responsável pelo caso tem acesso completo àquele caso", () => {
    expect(podePesquisarCaso(pesquisadorResponsavel, casoAna)).toBe(true);
    expect(
      avaliarAcessoDocumento("update", pesquisadorResponsavel, docAna, casoAna).permitido,
    ).toBe(true);
  });
});

describe("RLS de fontes e documentos — negativas por caso", () => {
  it("pesquisador não responsável não lê documentos de outro caso", () => {
    const v = avaliarAcessoDocumento("select", pesquisadorResponsavel, docOutroCaso, casoOutro);
    expect(v).toEqual({ permitido: false, motivo: "SEM_ACESSO_A_ESTE_CASO" });
  });

  it("pesquisador de outro caso não insere documento no caso da Ana", () => {
    expect(avaliarAcessoDocumento("insert", pesquisadorOutro, docAna, casoAna).motivo).toBe(
      "SEM_ACESSO_A_ESTE_CASO",
    );
  });

  it("pesquisador de outro caso não edita nem arquiva documento do caso da Ana", () => {
    expect(avaliarAcessoDocumento("update", pesquisadorOutro, docAna, casoAna).permitido).toBe(
      false,
    );
    expect(podeArquivarDocumento(pesquisadorOutro, docAna, casoAna).permitido).toBe(false);
  });

  it("documento cujo case_id aponta para caso de outra organização é negado em todas as ações", () => {
    const doc: Documento = { ...docAna, caseId: casoOutraOrg.id };
    for (const acao of ["select", "insert", "update"] as const) {
      expect(avaliarAcessoDocumento(acao, admin, doc, casoOutraOrg)).toEqual({
        permitido: false,
        motivo: "CASO_FORA_DA_ORGANIZACAO",
      });
    }
  });

  it("caso inexistente bloqueia leitura, inclusão, edição e arquivamento", () => {
    for (const acao of ["select", "insert", "update"] as const) {
      expect(avaliarAcessoDocumento(acao, admin, docAna, undefined).permitido).toBe(false);
    }
  });
});

describe("RLS de fontes e documentos — negativas por organização e papel", () => {
  it("usuário de outra organização não lê, insere, edita nem arquiva", () => {
    for (const acao of ["select", "insert", "update"] as const) {
      expect(avaliarAcessoDocumento(acao, deOutraOrg, docAna, casoAna)).toEqual({
        permitido: false,
        motivo: "FORA_DA_ORGANIZACAO",
      });
    }
    expect(podeArquivarDocumento(admin, docOutraOrg, casoOutraOrg).motivo).toBe(
      "FORA_DA_ORGANIZACAO",
    );
  });

  it("papel leitura consulta, mas não inclui, edita nem arquiva", () => {
    expect(avaliarAcessoDocumento("select", leitura, docAna, casoAna).permitido).toBe(false);
    expect(avaliarAcessoDocumento("insert", leitura, docAna, casoAna).permitido).toBe(false);
    expect(podeArquivarDocumento(leitura, docAna, casoAna).permitido).toBe(false);
  });

  it("documento restrito só é lido por admin ou pesquisador do caso", () => {
    expect(avaliarAcessoDocumento("select", admin, docRestrito, casoAna).permitido).toBe(true);
    expect(
      avaliarAcessoDocumento("select", pesquisadorResponsavel, docRestrito, casoAna).permitido,
    ).toBe(true);
    const comercial: Usuario = {
      userId: "u-com",
      organizacoes: [ORG_A],
      papeis: { [ORG_A]: "comercial" },
    };
    expect(avaliarAcessoDocumento("select", comercial, docRestrito, casoAna)).toEqual({
      permitido: false,
      motivo: "DOCUMENTO_RESTRITO",
    });
  });

  it("nenhum papel pode excluir fisicamente", () => {
    expect(podeExcluirFisicamente()).toEqual({
      permitido: false,
      motivo: "EXCLUSAO_FISICA_PROIBIDA",
    });
  });
});
