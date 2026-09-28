import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { anoCitado, pendenciasHumanasDoCaso } from "@/lib/pendencias-humanas-caso";
import { sinaisDaPessoa } from "@/lib/pessoa-sinais";
import { pessoasDoCasoComFallbackNucleo, COLUNAS_CASE_MEMBERS_PESSOA } from "@/lib/pessoa-vinculo";

/**
 * Corte U3 (28/09/2026): a Pessoa 360 mostra uma só pendência de cadastro;
 * decisões humanas do caso aparecem a partir do dado real, sem alterar nada.
 * Dados fictícios.
 */
const hoje = new Date("2026-09-28T12:00:00Z");
const ler = (p: string) => readFileSync(p, "utf8");

describe("decisões humanas do caso — regras genéricas", () => {
  const base = { caso: { via_juridica_preliminar: "reparacao_historica", dossie_mae_referencia: "DOS-A" }, hoje };

  it("signatário cujo vínculo cita ano antigo vira 'provável ancestral'", () => {
    const r = pendenciasHumanasDoCaso({
      ...base,
      membros: [{ nome: "Antepassada", papel: "contratante_signatario", vinculo: "Certidão de casamento 1905.", cliente_id: null }],
      leads: [],
    });
    expect(r.map((p) => p.tipo)).toEqual(["provavel_ancestral_como_signatario"]);
    expect(anoCitado("nascido em 1888")).toBe(1888);
    expect(anoCitado("Titular adulta")).toBeNull();
  });

  it("signatário atual sem Pessoa 360 vinculada também é pendência", () => {
    const r = pendenciasHumanasDoCaso({ ...base, membros: [{ nome: "Adulto", papel: "contratante_signatario", vinculo: "Adulto" }], leads: [] });
    expect(r.map((p) => p.tipo)).toEqual(["signatario_sem_pessoa"]);
  });

  it("menor sem representação: pela data de nascimento ou pelo vínculo quando não há data", () => {
    const r = pendenciasHumanasDoCaso({
      ...base,
      membros: [
        { nome: "Criança A", papel: "dependente", data_nascimento: "2016-01-01", representacao_necessaria: false },
        { nome: "Criança B", papel: "dependente", vinculo: "Dependente menor", representacao_necessaria: false },
        { nome: "Criança C", papel: "dependente", data_nascimento: "2016-01-01", representacao_necessaria: true },
        { nome: "Adulto D", papel: "dependente", data_nascimento: "1990-01-01", vinculo: "já foi menor", representacao_necessaria: false },
      ],
      leads: [],
    });
    expect(r.filter((p) => p.tipo === "menor_sem_representacao").map((p) => p.titulo.split(":")[0])).toEqual(["Criança A", "Criança B"]);
  });

  it("dossiê-mãe com duas referências só quando as duas existem e diferem", () => {
    const tipos = (nucleo: string | null, caso: string | null) =>
      pendenciasHumanasDoCaso({ caso: { dossie_mae_referencia: caso }, nucleo: { dossie_mae: nucleo }, membros: [], leads: [], hoje }).map((p) => p.tipo);
    expect(tipos("DOS-N", "DOS-A")).toEqual(["dossie_mae_divergente"]);
    expect(tipos("DOS-A", "DOS-A")).toEqual([]);
    expect(tipos("DOS-N", null)).toEqual([]);
  });

  it("via do lead diferente da via do caso e lead de teste ligado ao núcleo", () => {
    const r = pendenciasHumanasDoCaso({ ...base, membros: [], leads: [{ via_juridica_preliminar: "descendencia", dados_teste: true }] });
    expect(r.map((p) => p.tipo).sort()).toEqual(["lead_de_teste_no_nucleo", "via_divergente_do_lead"]);
    const igual = pendenciasHumanasDoCaso({ ...base, membros: [], leads: [{ via_juridica_preliminar: "reparacao_historica" }] });
    expect(igual).toEqual([]);
  });

  it("é só leitura: o leitor do servidor não grava nada", () => {
    const fn = ler("src/lib/pendencias-humanas-caso.functions.ts");
    expect(fn).not.toMatch(/\.(insert|update|upsert|delete)\(/);
    expect(fn).toContain('.eq("organization_id", organizationId)');
    expect(ler("src/routes/_authenticated/casos.$caseId.index.tsx")).toContain("<PendenciasHumanasCaso caseId={id} />");
    expect(ler("src/routes/_authenticated/pessoas.$clienteId.tsx")).toContain("<PendenciasHumanasCaso");
  });
});

describe("Pessoa 360: uma só pendência de cadastro para o contrato", () => {
  const completo = { id: "c1", nome: "X", cpf: "1", email: "x@x.invalid", data_nascimento: "1980-01-01" };

  it("lista o que falta (filiação e endereço contam se qualquer parte falta)", () => {
    const s = sinaisDaPessoa({
      cliente: { ...completo, rg_numero: "", nome_mae: "Mãe", nome_pai: null, profissao: "P", estado_civil: "casado", endereco_logradouro: "R", endereco_cidade: "C", endereco_cep: null },
    });
    const p = s.find((x) => x.titulo === "Cadastro para o contrato incompleto");
    expect(p?.detalhe).toContain("Faltando: RG, filiação, endereço.");
    expect(p?.prioridade).toBe("media");
  });

  it("chamador que não envia esses campos não ganha pendência falsa", () => {
    expect(sinaisDaPessoa({ cliente: completo })).toEqual([]);
  });
});

describe("pessoas do caso: causa raiz corrigida", () => {
  it("case_members não pede coluna que só existe em nucleo_membros", () => {
    expect(COLUNAS_CASE_MEMBERS_PESSOA).not.toContain("representacao_");
  });

  function falso(tabelas: Record<string, { data: unknown; error?: unknown }>) {
    return {
      from(t: string) {
        const r = tabelas[t] ?? { data: [] };
        const q: any = {
          select: () => q,
          eq: () => q,
          is: () => q,
          order: () => Promise.resolve(r),
          maybeSingle: () => Promise.resolve(r),
        };
        return q;
      },
    };
  }

  it("com núcleo com membros, usa o núcleo e traz a representação real", async () => {
    const r = await pessoasDoCasoComFallbackNucleo(
      falso({
        nucleos_familiares: { data: { id: "n1" } },
        nucleo_membros: { data: [{ id: "m1", nome: "Menor", papel: "dependente", vinculo: "menor", ordem: 1, cliente_id: null, representacao_necessaria: true, representacao_documentada: false }] },
        case_members: { data: [{ id: "x" }] },
      }),
      "caso",
    );
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ origem: "nucleo", representacao_necessaria: true, representacao_documentada: false });
  });

  it("sem núcleo, usa case_members; erro de leitura aparece em vez de sumir", async () => {
    const r = await pessoasDoCasoComFallbackNucleo(
      falso({ nucleos_familiares: { data: null }, case_members: { data: [{ id: "cm1", nome: "Pessoa" }] } }),
      "caso",
    );
    expect(r[0]).toMatchObject({ origem: "case_members", id: "cm1" });
    await expect(
      pessoasDoCasoComFallbackNucleo(falso({ nucleos_familiares: { data: null }, case_members: { data: null, error: { message: "boom" } } }), "caso"),
    ).rejects.toThrow("boom");
  });
});
