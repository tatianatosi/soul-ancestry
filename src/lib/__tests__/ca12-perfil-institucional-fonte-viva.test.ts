import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { garantirPerfilInstitucional } from "@/lib/perfil-institucional-persistido.server";

/*
 * CA12-PERFIL (09/09/2026) — Perfil Institucional (razão empresarial, CNPJ,
 * representante legal etc.) já era um ativo real e vigente (contrato-base-
 * consolidado.ts), e já tinha uma camada de persistência versionada por
 * organização (institutional_profiles, garantirPerfilInstitucional,
 * registrarPerfilInstitucional) — mas nenhuma tela chamava essas funções:
 * a leitura persistida não filtrava por organização e a tela de preparação
 * de contrato só lia a constante em código, sem confirmar nem oferecer
 * registrar a versão viva daquela organização. Não foi criado formulário
 * novo, dado novo ou tabela nova — só a fonte que já existia passou a ser
 * lida e a ter uma ação real quando ausente.
 */

function fakeSupabase(opts: { existente: Record<string, unknown> | null }) {
  const inseridos: Record<string, unknown>[] = [];
  const eventos: Record<string, unknown>[] = [];
  return {
    from: (tabela: string) => {
      if (tabela === "institutional_profiles") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: opts.existente }),
              }),
            }),
          }),
          insert: (payload: Record<string, unknown>) => ({
            select: () => ({
              maybeSingle: async () => {
                const linha = { id: "perfil-novo", ...payload };
                inseridos.push(linha);
                return { data: linha, error: null };
              },
            }),
          }),
        };
      }
      if (tabela === "institutional_profile_events") {
        return {
          insert: async (payload: Record<string, unknown>) => {
            eventos.push(payload);
            return { data: null, error: null };
          },
        };
      }
      throw new Error(`tabela inesperada: ${tabela}`);
    },
    inseridos,
    eventos,
  };
}

describe("CA12 — garantirPerfilInstitucional é idempotente por organização", () => {
  it("sem versão persistida, cria uma e registra evento de governança", async () => {
    const sb = fakeSupabase({ existente: null });
    const r = await garantirPerfilInstitucional(sb as never, { org: "org-1", userId: "user-1" });
    expect(r.criado).toBe(true);
    expect(r.perfil?.status).toBe("vigente");
    expect(sb.inseridos).toHaveLength(1);
    expect(sb.eventos).toHaveLength(1);
    expect(sb.eventos[0]).toMatchObject({ organization_id: "org-1", evento: "perfil_institucional_registrado" });
  });

  it("com a mesma versão já persistida, não duplica nem gera evento novo", async () => {
    const sb = fakeSupabase({ existente: { id: "perfil-existente", versao: "PERFIL-INST-v1.0", status: "vigente" } });
    const r = await garantirPerfilInstitucional(sb as never, { org: "org-1", userId: "user-1" });
    expect(r.criado).toBe(false);
    expect(r.perfil?.id).toBe("perfil-existente");
    expect(sb.inseridos).toHaveLength(0);
    expect(sb.eventos).toHaveLength(0);
  });
});

describe("CA12 — leitura persistida escopada por organização (antes vazava entre organizações)", () => {
  const arquivo = readFileSync("src/lib/perfil-institucional-persistido.functions.ts", "utf8");

  it("lerPerfilInstitucionalPersistido filtra por organization_id da sessão", () => {
    const bloco = arquivo.slice(
      arquivo.indexOf("export const lerPerfilInstitucionalPersistido"),
      arquivo.indexOf("export const garantirPerfilInstitucionalDaSessao"),
    );
    expect(bloco).toContain("organizacaoDo(supabase");
    expect(bloco).toMatch(/\.eq\("organization_id",\s*organizationId\)/);
  });

  it("garantirPerfilInstitucionalDaSessao existe e nunca recebe organization_id do cliente", () => {
    expect(arquivo).toContain("export const garantirPerfilInstitucionalDaSessao");
    const inicio = arquivo.indexOf("export const garantirPerfilInstitucionalDaSessao");
    const fim = arquivo.indexOf("export const registrarPerfilInstitucional");
    const bloco = arquivo.slice(inicio, fim);
    expect(bloco).toContain("organizacaoDo(supabase");
    expect(bloco).not.toContain(".inputValidator(");
  });
});

describe("CA12 — tela de preparação de contrato confirma a fonte viva e oferece ação quando ausente", () => {
  const tela = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");

  it("consome a leitura persistida e a ação de registro, não um formulário novo", () => {
    expect(tela).toContain("lerPerfilInstitucionalPersistido");
    expect(tela).toContain("garantirPerfilInstitucionalDaSessao");
  });

  it("mostra pendência honesta e uma ação real quando o perfil não está persistido", () => {
    const bloco = tela.slice(tela.indexOf("qPerfilPersistido.data &&"), tela.indexOf("<PerfilInstitucionalBloco"));
    expect(bloco).toMatch(/ainda não registrado como fonte viva/i);
    expect(bloco).toContain("mGarantirPerfil.mutate()");
  });

  it("não duplica o motor de perfil institucional: continua usando PerfilInstitucionalBloco existente", () => {
    expect(tela.match(/PerfilInstitucionalBloco/g)?.length).toBeGreaterThanOrEqual(1);
    expect(tela).not.toMatch(/function\s+PerfilInstitucionalBloco/);
  });
});
