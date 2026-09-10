import { describe, expect, it } from "vitest";

import {
  clienteCorrespondentePorNome,
  ordemDoContratantePrincipal,
  pessoaDoCasoAPartirDoNucleo,
  pessoasDoCasoComFallbackNucleo,
  type MembroNucleoBruto,
} from "@/lib/pessoa-vinculo";

/*
 * Caso real que motivou este arquivo: as 4 linhas de case_members do caso da
 * Ana Luiza (CA-CID-AT-FAM-2026-001) foram arquivadas em 21/08 (migration
 * 20260821152043 — "fonte de verdade passa a ser Núcleos"), mas 4 funções do
 * Desk continuaram lendo só case_members, vendo lista vazia desde então.
 */
const MEMBROS_ANA: MembroNucleoBruto[] = [
  { id: "m1", nome: "Ana Luiza Gomes Silveira Rodrigues", papel: "contratante_signatario", vinculo: "Titular adulta, contratante e signatária", processo: "Processo A", ordem: 1, cliente_id: "cli-ana" },
  { id: "m2", nome: "Adair Pinto Silveira Júnior", papel: "contratante_signatario", vinculo: "Adulto contratante e signatário", processo: "Processo B", ordem: 2, cliente_id: "cli-adair" },
  { id: "m3", nome: "Alice Gomes Silveira", papel: "contratante_signatario", vinculo: "Adulta contratante e signatária", processo: "Processo C", ordem: 3, cliente_id: "cli-alice" },
  { id: "m4", nome: "Felipe", papel: "dependente", vinculo: "Dependente/beneficiário menor vinculado a Ana Luiza", processo: "Processo A (dependente)", ordem: 4, cliente_id: null },
];

describe("pessoaDoCasoAPartirDoNucleo", () => {
  it("marca só o membro de menor ordem como contratante; os demais titulares", () => {
    const ordemMinima = ordemDoContratantePrincipal(MEMBROS_ANA);
    expect(ordemMinima).toBe(1);

    const mapeados = MEMBROS_ANA.map((m) => pessoaDoCasoAPartirDoNucleo(m, ordemMinima));
    expect(mapeados[0]).toMatchObject({ nome: "Ana Luiza Gomes Silveira Rodrigues", contratante: true, titular: true, dependente: false, papel_no_caso: "contratante" });
    expect(mapeados[1]).toMatchObject({ nome: "Adair Pinto Silveira Júnior", contratante: false, titular: true, dependente: false, papel_no_caso: "titular" });
    expect(mapeados[2]).toMatchObject({ nome: "Alice Gomes Silveira", contratante: false, titular: true, dependente: false, papel_no_caso: "titular" });
    expect(mapeados[3]).toMatchObject({ nome: "Felipe", contratante: false, titular: false, dependente: true, papel_no_caso: "dependente" });
  });

  it("nunca inventa CPF, data de nascimento ou status cadastral — mantém como pendente/nulo", () => {
    const m = pessoaDoCasoAPartirDoNucleo(MEMBROS_ANA[0], 1);
    expect(m.cpf).toBeNull();
    expect(m.data_nascimento).toBeNull();
    expect(m.representante_legal).toBeNull();
    expect(m.status_cadastral).toBe("pendente");
  });
});

function supabaseFalso(opts: { caseMembers: unknown[]; nucleo: { id: string } | null; nucleoMembros: unknown[] }) {
  return {
    from(tabela: string) {
      const chain = {
        select: () => chain,
        eq: () => chain,
        is: () => chain,
        order: () => chain,
        maybeSingle: async () => ({ data: tabela === "nucleos_familiares" ? opts.nucleo : null }),
        then: (resolve: (v: { data: unknown[] }) => unknown) =>
          resolve({ data: tabela === "case_members" ? opts.caseMembers : tabela === "nucleo_membros" ? opts.nucleoMembros : [] }),
      };
      return chain;
    },
  };
}

describe("pessoasDoCasoComFallbackNucleo", () => {
  it("usa case_members quando há linha ativa (comportamento inalterado no caminho comum)", async () => {
    const supabase = supabaseFalso({
      caseMembers: [{ id: "cm1", nome: "Fulano", papel_no_caso: "titular", titular: true, contratante: false, dependente: false, cliente_id: "cli-1" }],
      nucleo: null,
      nucleoMembros: [],
    });
    const pessoas = await pessoasDoCasoComFallbackNucleo(supabase, "case-1");
    expect(pessoas).toHaveLength(1);
    expect(pessoas[0].origem).toBe("case_members");
    expect(pessoas[0].nome).toBe("Fulano");
  });

  it("cai para nucleo_membros quando case_members está vazio (caso real da Ana)", async () => {
    const supabase = supabaseFalso({
      caseMembers: [],
      nucleo: { id: "nucleo-ana" },
      nucleoMembros: MEMBROS_ANA,
    });
    const pessoas = await pessoasDoCasoComFallbackNucleo(supabase, "case-ana");
    expect(pessoas).toHaveLength(4);
    expect(pessoas.every((p) => p.origem === "nucleo")).toBe(true);
    expect(pessoas.find((p) => p.nome.startsWith("Ana"))?.contratante).toBe(true);
    expect(pessoas.find((p) => p.nome === "Felipe")?.dependente).toBe(true);
  });

  it("devolve lista vazia (não quebra) quando o caso não tem núcleo nem case_members", async () => {
    const supabase = supabaseFalso({ caseMembers: [], nucleo: null, nucleoMembros: [] });
    const pessoas = await pessoasDoCasoComFallbackNucleo(supabase, "case-sem-nucleo");
    expect(pessoas).toEqual([]);
  });
});

describe("clienteCorrespondentePorNome", () => {
  it("liga nome curto a nome completo sem ambiguidade", () => {
    const id = clienteCorrespondentePorNome("Ana Luiza", [{ id: "cli-ana", nome: "Ana Luiza Gomes Silveira Rodrigues" }]);
    expect(id).toBe("cli-ana");
  });

  it("não escolhe às cegas quando há mais de um candidato", () => {
    const id = clienteCorrespondentePorNome("Ana", [
      { id: "a", nome: "Ana Luiza" },
      { id: "b", nome: "Ana Paula" },
    ]);
    expect(id).toBeNull();
  });
});
