import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  EIXOS_VISIBILIDADE_PESSOA,
  RESUMO_GATE_ARVORE,
  prontidaoParaArvore,
} from "@/lib/visibilidade-arvore";
import { validarPublicacaoArvore } from "@/lib/arvore-publicacao";
import {
  AJUDA_RESPONSAVEL_PADRAO,
  EQUIPE_INSTITUCIONAL_PADRAO,
  RESPONSAVEL_INSTITUCIONAL_PADRAO,
  ehResponsavelPadrao,
  responsavelOuPadrao,
  rotuloResponsavel,
} from "@/lib/responsavel-institucional";
import {
  RESPONSAVEL_VALIDACAO_INSTITUCIONAL,
  RESPONSAVEL_VALIDACAO_PADRAO,
} from "@/lib/decisoes-da-proprietaria";

/**
 * Proprietária, 04/10/2026, dois relatos de bloqueio:
 *
 * 1. "por mais que eu queira publicar os parentes da Ana que estão como
 *    restrito, altamente restrito e padrão, eu não consigo nem mudar o status
 *    e tampouco sei qual status é entre verificado, aprovado e confirmado".
 *    Medido: o formulário do Perfil 360° não tinha seletor de visibilidade —
 *    `client_visibility` já era gravável, mas nenhuma tela o oferecia. Os 4
 *    perfis da Ana estavam `interna` + `pendente`, com sensibilidade
 *    `restricted` (que nunca bloqueou). Bloqueio real, não impressão.
 *
 * 2. "por default a equipe do Clube Ancestral sou eu, então não preciso ficar
 *    repetindo diversas vezes e em lugares diferentes que sou eu a equipe."
 */

const PERFIL = "src/routes/_authenticated/pessoas-linhagens.$caseId.tsx";
const PAINEL = "src/components/genealogia/publicar-arvore-app.tsx";
const leitura = (p: string) => readFileSync(p, "utf8");

describe("os três eixos — só um gateia a Árvore", () => {
  it("registra visibilidade, sensibilidade e status de verificação, e só a visibilidade gateia", () => {
    const chaves = EIXOS_VISIBILIDADE_PESSOA.map((e) => e.chave);
    expect(chaves).toEqual(["client_visibility", "sensitivity_level", "status_verificacao"]);
    expect(EIXOS_VISIBILIDADE_PESSOA.filter((e) => e.gateiaArvore).map((e) => e.chave)).toEqual(["client_visibility"]);
  });

  it("cada eixo diz onde mudar o valor — nunca só o nome da coluna", () => {
    for (const eixo of EIXOS_VISIBILIDADE_PESSOA) {
      expect(eixo.ondeMudar).toMatch(/›/);
      expect(eixo.onde).toMatch(/\./);
    }
  });

  it("o resumo diz as três coisas que ela não sabia, em uma frase", () => {
    expect(RESUMO_GATE_ARVORE).toContain("Aprovada");
    expect(RESUMO_GATE_ARVORE).toContain("Confirmado");
    expect(RESUMO_GATE_ARVORE).toContain("altamente restrita");
  });
});

describe("prontidão para a árvore — bloqueio nomeado, com caminho", () => {
  it("interna bloqueia e aponta o campo exato do Perfil 360°", () => {
    const r = prontidaoParaArvore({ clientVisibility: "interna", sensitivityLevel: "restricted" });
    expect(r.pode).toBe(false);
    expect(r.bloqueios.map((b) => b.chave)).toEqual(["client_visibility"]);
    expect(r.bloqueios[0]!.ondeResolver).toContain("Perfil 360°");
  });

  it("“restrito” NÃO bloqueia — era a confusão relatada", () => {
    const r = prontidaoParaArvore({ clientVisibility: "aprovada", sensitivityLevel: "restricted" });
    expect(r.pode).toBe(true);
    expect(r.observacoes.join(" ")).toContain("não impede");
  });

  it("“padrão” (standard) também publica", () => {
    expect(prontidaoParaArvore({ clientVisibility: "aprovada", sensitivityLevel: "standard" }).pode).toBe(true);
  });

  it("“altamente restrita” bloqueia, mesmo aprovada", () => {
    const r = prontidaoParaArvore({ clientVisibility: "aprovada", sensitivityLevel: "highly_restricted" });
    expect(r.pode).toBe(false);
    expect(r.bloqueios.map((b) => b.chave)).toContain("sensitivity_level");
  });

  it("sanitizada é tratada como “falta aprovar”, não como interna", () => {
    const r = prontidaoParaArvore({ clientVisibility: "sanitizada" });
    expect(r.bloqueios[0]!.texto).toContain("aguarda aprovação");
  });

  it("perfil sem pessoa de pesquisa é bloqueio próprio e nomeado", () => {
    const r = prontidaoParaArvore({ clientVisibility: "aprovada", temPessoaPesquisa: false });
    expect(r.bloqueios.map((b) => b.chave)).toContain("research_person_id");
  });

  it("status de verificação pendente não entra como bloqueio da árvore", () => {
    const r = prontidaoParaArvore({ clientVisibility: "aprovada", sensitivityLevel: "restricted" });
    expect(JSON.stringify(r)).not.toContain("status_verificacao");
    // e o validador do servidor segue sem exigir "confirmado"
    expect(
      validarPublicacaoArvore({ clientVisibility: "aprovada", sensitivityLevel: "restricted", geracao: 3, nome: "Maria Silveira" }),
    ).toEqual([]);
  });
});

describe("o bloqueio da tela foi desfeito", () => {
  it("Perfil 360° passou a oferecer o seletor de visibilidade ao cliente", () => {
    const fonte = leitura(PERFIL);
    expect(fonte).toContain('label="Visibilidade ao cliente"');
    expect(fonte).toContain('set("client_visibility", v)');
    expect(fonte).toContain("RESUMO_GATE_ARVORE");
  });

  it("o campo continua na allowlist do escritor (nada de coluna nova)", () => {
    expect(leitura("src/lib/pessoas-linhagens.functions.ts")).toContain('"client_visibility"');
  });

  it("o status de verificação ganhou a ajuda que o separa da árvore", () => {
    expect(leitura(PERFIL)).toContain("Não é o que libera a Árvore do App");
  });

  it("o painel de publicação não repete mais a frase sem saída", () => {
    const fonte = leitura(PAINEL);
    expect(fonte).not.toContain("Visibilidade ao cliente não aprovada — não pode ser publicada");
    expect(fonte).toContain("prontidaoParaArvore");
    expect(fonte).toContain("data-arvore-bloqueios");
    expect(fonte).toContain("Resolver em:");
  });

  it("o leitor passou a trazer a sensibilidade, que mora em research_people", () => {
    const fonte = leitura("src/lib/arvore-publicacao.functions.ts");
    expect(fonte).toContain("sensitivityLevel");
    expect(fonte).toContain('from("research_people")');
    expect(fonte).toContain("temPessoaPesquisa");
  });
});

describe("responsável e contratada — uma fonte, sem repetir", () => {
  it("o padrão sai do perfil institucional, não de um nome digitado de novo", () => {
    const perfil = leitura("src/lib/contrato-base-consolidado.ts");
    expect(perfil).toContain(RESPONSAVEL_INSTITUCIONAL_PADRAO);
    expect(leitura("src/lib/responsavel-institucional.ts")).not.toContain(`"${RESPONSAVEL_INSTITUCIONAL_PADRAO}"`);
    expect(RESPONSAVEL_INSTITUCIONAL_PADRAO.length).toBeGreaterThan(3);
    expect(EQUIPE_INSTITUCIONAL_PADRAO).toBe("equipe Clube Ancestral");
  });

  it("D-05 deixou de ser uma segunda cópia do mesmo nome", () => {
    expect(RESPONSAVEL_VALIDACAO_PADRAO).toBe(RESPONSAVEL_INSTITUCIONAL_PADRAO);
    expect(RESPONSAVEL_VALIDACAO_INSTITUCIONAL).toBe(EQUIPE_INSTITUCIONAL_PADRAO);
  });

  it("campo vazio resolve no padrão — não vira pendência nem pergunta", () => {
    expect(responsavelOuPadrao("")).toBe(RESPONSAVEL_INSTITUCIONAL_PADRAO);
    expect(responsavelOuPadrao(null)).toBe(RESPONSAVEL_INSTITUCIONAL_PADRAO);
    expect(ehResponsavelPadrao("")).toBe(true);
    expect(ehResponsavelPadrao(EQUIPE_INSTITUCIONAL_PADRAO)).toBe(true);
    expect(rotuloResponsavel(null)).toContain("padrão");
  });

  it("delegar a outra pessoa continua possível e prevalece", () => {
    expect(responsavelOuPadrao("Fulana de Tal")).toBe("Fulana de Tal");
    expect(ehResponsavelPadrao("Fulana de Tal")).toBe(false);
    expect(AJUDA_RESPONSAVEL_PADRAO).toContain("delegar");
  });
});
