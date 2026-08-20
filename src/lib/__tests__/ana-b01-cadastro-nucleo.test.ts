import { describe, expect, it } from "vitest";

import { bloqueioCriacaoPorNome, chavePessoa, resumoPorPessoa, type ItemChecklist } from "@/lib/cadastro-checklist";
import { bloqueiosDependentes, type Dependente } from "@/lib/dependentes";
import { avaliarNucleo, pendenciasNucleo } from "@/lib/nucleo-completude";

const item = (p: Partial<ItemChecklist>): ItemChecklist => ({
  case_id: "caso", pessoa_tipo: "titular", pessoa_nome: "Adair Pinto Silveira Júnior",
  pessoa_ref_id: "membro-adair", campo: "cpf", campo_rotulo: "CPF", obrigatorio: true,
  status: "pendente", acesso_restrito: true, ordem: 0, ...p,
});

const felipe = (p: Partial<Dependente> = {}): Dependente => ({
  case_id: "caso", nome_completo: "Felipe", vinculo_com_titular: "filho",
  dependent_person_id: "membro-felipe", titular_responsavel_legal_id: "membro-ana",
  status_representacao: "pendente", participa_do_contrato: false, possui_acesso_app: false,
  anexo_individual_aplicavel: false, ...p,
});

describe("ANA-B-01 — cadastro por pessoa e núcleo", () => {
  it("1. checklist de Adair permanece na mesma pessoa canônica pelo ID", () => {
    const itens = [
      item({ campo: "cpf" }),
      item({ campo: "rg", pessoa_nome_historico: "Adair Gomes Silveira" }),
    ];
    const resumo = resumoPorPessoa(itens);
    expect(resumo).toHaveLength(1);
    expect(resumo[0]!.pessoa_ref_id).toBe("membro-adair");
    expect(resumo[0]!.pessoa_nome).toBe("Adair Pinto Silveira Júnior");
    expect(resumo[0]!.pessoa_nome_historico).toBe("Adair Gomes Silveira");
  });

  it("2. nome não é chave única: novo checklist por string é recusado quando a pessoa existe", () => {
    expect(chavePessoa(item({}))).toBe("ref::membro-adair");
    expect(
      bloqueioCriacaoPorNome({
        pessoa_tipo: "titular",
        pessoa_nome: "Adair Pinto Silveira Júnior",
        pessoasExistentes: [{ id: "membro-adair", nome: "Adair Pinto Silveira Júnior" }],
      }),
    ).toMatch(/referência por ID/);
    expect(bloqueioCriacaoPorNome({ pessoa_tipo: "titular", pessoa_nome: "Nova pessoa" })).toMatch(/pessoa_ref_id/);
    expect(bloqueioCriacaoPorNome({ pessoa_tipo: "titular", pessoa_nome: "X", pessoa_ref_id: "m1" })).toBeNull();
  });

  it("3. Felipe persiste as FKs de pessoa e responsável legal", () => {
    const d = felipe();
    expect(d.dependent_person_id).toBe("membro-felipe");
    expect(d.titular_responsavel_legal_id).toBe("membro-ana");
  });

  it("4. Felipe sem contrato/App/anexo não bloqueia só por existir", () => {
    expect(bloqueiosDependentes([felipe()])).toHaveLength(0);
  });

  it("5. Felipe participando sem representação documentada bloqueia", () => {
    const codigos = bloqueiosDependentes([felipe({ participa_do_contrato: true })]).map((b) => b.codigo);
    expect(codigos).toContain("DEPENDENTE_REPRESENTACAO_PENDENTE");
    const semFk = bloqueiosDependentes([
      felipe({ possui_acesso_app: true, titular_responsavel_legal_id: null }),
    ]).map((b) => b.codigo);
    expect(semFk).toContain("DEPENDENTE_SEM_VINCULO_POR_ID");
  });

  it("6. núcleo sem critérios completos não satisfaz nucleoOk", () => {
    const parcial = avaliarNucleo({
      nucleo: { id: "n1", contratante_nome: "Ana Luiza Gomes Silveira Rodrigues" },
      membros: [{ papel: "contratante_signatario" }, { papel: "" }],
      dependentes: [{ status_representacao: "pendente" }],
    });
    expect(parcial.completo).toBe(false);
    const chaves = pendenciasNucleo(parcial).map((p) => p.chave);
    expect(chaves).toContain("participantes");
    expect(chaves).toContain("dossie_ambiente");
    expect(pendenciasNucleo(parcial).every((p) => Boolean(p.motivo))).toBe(true);

    const completo = avaliarNucleo({
      nucleo: { id: "n1", contratante_nome: "Ana", dossie_mae: "DOSSIE-ANA", ambiente: "producao", nivel_acesso: "restrito" },
      membros: [{ papel: "contratante_signatario" }],
      dependentes: [{ status_representacao: "documentada" }],
    });
    expect(completo.completo).toBe(true);
  });
});
