import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { dossieMaeDoCaso, motivosDossieMaeNaoAtivavel, nucleoComMesmoDossieAtivo } from "@/lib/nucleo-completude";
import { diagnosticarOnboarding } from "@/lib/onboarding-jornada";

/**
 * Corte B (24/09/2026, "Motores Pessoa Unificada, Núcleos e Dossiê"):
 * Dossiê-mãe é do núcleo e é único; criação de membro no núcleo passa a
 * existir; gate de ativação lê o núcleo; leitura por pessoa se chama
 * "Inventário documental da pessoa".
 */
const funcoes = readFileSync("src/lib/nucleos-desk.functions.ts", "utf8");
const nucleosPg = readFileSync("src/routes/_authenticated/nucleos.tsx", "utf8");
const jornadaFn = readFileSync("src/lib/onboarding-jornada.functions.ts", "utf8");
const pessoaFn = readFileSync("src/lib/pessoa.functions.ts", "utf8");
const pessoaPg = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");
const migracao = readFileSync("supabase/migrations/20260818201721_818f92ac-fdac-403d-a1b8-b17a4a5cf300.sql", "utf8");

const completo = {
  dossie_mae: "DM-ANA-001",
  ambiente: "drive_clube_ancestral",
  nivel_acesso: "restrito",
  link_interno: "https://drive.exemplo/x",
  responsavel_nome: "Tati",
  dossie_status: "ativo",
};

describe("Dossiê-mãe ativo — regras no servidor, não só no texto da tela", () => {
  it("ativo sem os metadados é recusado, com o que falta dito", () => {
    expect(motivosDossieMaeNaoAtivavel({ ...completo, link_interno: "", responsavel_nome: " " })).toEqual([
      "link interno",
      "responsável nominal",
    ]);
  });
  it("em preparação pode ficar incompleto", () => {
    expect(motivosDossieMaeNaoAtivavel({ dossie_status: "em_preparacao" })).toEqual([]);
  });
  it("a mesma referência não pode ser dossiê-mãe ativo de dois núcleos", () => {
    const outros = [
      { id: "n2", nome: "Família Silva", dossie_mae: " dm-ana-001 ", dossie_status: "ativo", archived_at: null },
    ];
    expect(nucleoComMesmoDossieAtivo("n1", completo, outros)).toEqual({ id: "n2", nome: "Família Silva" });
  });
  it("o próprio núcleo, núcleo arquivado ou não-ativo não conflitam", () => {
    const outros = [
      { id: "n1", dossie_mae: "DM-ANA-001", dossie_status: "ativo" },
      { id: "n3", dossie_mae: "DM-ANA-001", dossie_status: "ativo", archived_at: "2026-09-01" },
      { id: "n4", dossie_mae: "DM-ANA-001", dossie_status: "em_preparacao" },
    ];
    expect(nucleoComMesmoDossieAtivo("n1", completo, outros)).toBeNull();
  });
  it("o banco já garante um núcleo ativo por caso (índice único)", () => {
    expect(migracao).toContain("nucleos_familiares_caso_unico on public.nucleos_familiares (case_id) where archived_at is null");
  });
  it("salvarDossieNucleo aplica as duas regras e filtra a organização", () => {
    const trecho = funcoes.slice(funcoes.indexOf("export const salvarDossieNucleo"), funcoes.indexOf("export const salvarMembroNucleo"));
    expect(trecho).toContain("motivosDossieMaeNaoAtivavel(data)");
    expect(trecho).toContain("nucleoComMesmoDossieAtivo(data.nucleoId, data");
    expect(trecho).toContain('.eq("organization_id", organization_id)');
  });
});

describe("dossieMaeDoCaso — leitura canônica (núcleo primeiro, caso só como legado)", () => {
  it("núcleo com referência é a fonte", () => {
    expect(dossieMaeDoCaso({ id: "n1", dossie_mae: "DM-1", dossie_status: "ativo" }, "LEGADO")).toMatchObject({
      fonte: "nucleo",
      referencia: "DM-1",
      ativo: true,
    });
  });
  it("sem núcleo, o ponteiro do caso aparece rotulado como legado e nunca conta como ativo", () => {
    expect(dossieMaeDoCaso(null, "LEGADO")).toMatchObject({ fonte: "legado_caso", ativo: false });
  });
  it("nada cadastrado é ausente", () => {
    expect(dossieMaeDoCaso(null, null).fonte).toBe("ausente");
  });
});

describe("gate de ativação dossie_mae lê o núcleo", () => {
  const caso = { dossie_mae_referencia: "LEGADO" } as never;
  const gate = (ctx: Parameters<typeof diagnosticarOnboarding>[1]) =>
    [...diagnosticarOnboarding(caso, ctx).gates_ok, ...diagnosticarOnboarding(caso, ctx).gates_pendentes].find(
      (g) => g.codigo === "dossie_mae",
    )!;
  it("ponteiro antigo do caso não libera quando a leitura canônica existe", () => {
    const g = gate({ dossieMae: { ativo: false, fonte: "legado_caso" } });
    expect(g.ok).toBe(false);
    expect(g.motivo).toContain("cadastre-o no núcleo familiar");
  });
  it("dossiê ativo no núcleo libera", () => {
    expect(gate({ dossieMae: { ativo: true, fonte: "nucleo" } }).ok).toBe(true);
  });
  it("painel de jornada monta a leitura canônica a partir de nucleos_familiares", () => {
    expect(jornadaFn).toContain('.from("nucleos_familiares")');
    expect(jornadaFn).toContain("dossieMaeDoCaso(");
  });
});

describe("adicionarMembroNucleo — criação real de membro", () => {
  const trecho = funcoes.slice(funcoes.indexOf("export const adicionarMembroNucleo"), funcoes.indexOf("export const encaminharFilaDrive"));
  it("grava com inserirComVerificacao (insere e relê) e registra no caso", () => {
    expect(trecho).toContain('tabela: "nucleo_membros"');
    expect(trecho).toContain("inserirComVerificacao({");
    expect(trecho).toContain('title: "Membro adicionado ao núcleo familiar"');
  });
  it("papel só dentro do CHECK real; nome repetido no núcleo é recusado; vínculo só por escolha", () => {
    expect(funcoes).toContain('PAPEIS_GRAVAVEIS_MEMBRO = ["contratante_signatario", "dependente"] as const');
    expect(trecho).toContain("já é membro deste núcleo");
    expect(trecho).toContain("cliente_id: data.clienteId || null");
  });
  it("a tela /nucleos oferece o formulário e relê a lista do servidor após gravar", () => {
    expect(nucleosPg).toContain("+ Adicionar membro ao núcleo");
    expect(nucleosPg).toContain("useServerFn(adicionarMembroNucleo)");
    expect(nucleosPg).toContain('queryKey: ["nucleos-desk"]');
  });
});

describe("Pessoa 360 — mesma fonte de núcleo/dossiê e nomenclatura correta", () => {
  it("lê o dossiê-mãe dos núcleos da pessoa em nucleos_familiares", () => {
    expect(pessoaFn).toContain('.select("id, nome, case_id, dossie_mae, dossie_status")');
    expect(pessoaPg).toContain("Dossiê-mãe do núcleo:");
    expect(pessoaPg).toContain('to="/nucleos"');
  });
  it("a leitura por pessoa não se chama mais dossiê", () => {
    expect(pessoaPg).toContain('titulo="Inventário documental da pessoa"');
    expect(pessoaPg).not.toContain('titulo="Inventário do dossiê"');
  });
});
