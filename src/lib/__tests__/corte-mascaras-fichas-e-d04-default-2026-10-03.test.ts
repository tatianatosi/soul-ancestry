import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { ANO_MINIMO_GENEALOGICO, dataValida, nomeValido } from "@/lib/validacao-pessoa";
import { validarPerfil } from "@/lib/pessoas-linhagens";
import { FONTE_NOVA_APROVADA_POR_PADRAO } from "@/lib/decisoes-da-proprietaria";

/**
 * 03/10/2026 — "as máscaras deveriam ser aplicadas em todas as abas e telas
 * das fichas... desde lead até a pesquisa genealógica".
 *
 * A medição que motivou este arquivo: `validacao-pessoa.ts` tinha os
 * validadores desde 02/10 e 77 das 87 telas com campo mascarável não
 * importavam nenhum. Validador que existe e ninguém chama é o mesmo defeito
 * de sempre — construído e não ligado. Aqui cada campo religado tem prova de
 * comportamento, não de existência.
 */

describe("Ficha Genealógica — validarPerfil deixa de aceitar qualquer string", () => {
  it("recusa nome com dígito, que antes passava", () => {
    const erros = validarPerfil({ nome_completo: "João 123" });
    expect(erros.some((e) => e.includes("números"))).toBe(true);
  });

  it("aceita nome real com partícula, acento, apóstrofo e hífen", () => {
    for (const nome of ["Maria da Silveira", "Ana D'Ávila", "Maria-Clara Prade", "José de Souza Östa"]) {
      expect(validarPerfil({ nome_completo: nome }), nome).toEqual([]);
    }
  });

  it("recusa nascimento no futuro", () => {
    const futuro = String(new Date().getFullYear() + 2) + "-01-01";
    const erros = validarPerfil({ nome_completo: "Ana Luiza", nascimento_data: futuro });
    expect(erros.some((e) => e.includes("Data de nascimento"))).toBe(true);
  });

  it("ACEITA ancestral nascido antes de 1900 — o piso de pessoa viva quebraria a pesquisa", () => {
    /*
      Defeito real encontrado ao aplicar o validador: `dataValida` tinha piso
      1900 por ser escrito para pessoa viva. Numa ficha genealógica, 1820 é o
      caso normal — Maria/casamento Silveira 1912 é o dado real do caso da Ana.
    */
    expect(validarPerfil({ nome_completo: "Maria Silveira", nascimento_data: "1858-03-02" })).toEqual([]);
    expect(validarPerfil({ nome_completo: "Maria Silveira", morte_data: "1931-11-20" })).toEqual([]);
  });

  it("recusa ano abaixo do piso genealógico (erro de digitação, não registro)", () => {
    const erros = validarPerfil({ nome_completo: "Maria Silveira", nascimento_data: "0185-03-02" });
    expect(erros.some((e) => e.includes(String(ANO_MINIMO_GENEALOGICO)))).toBe(true);
  });

  it("dataValida mantém o piso 1900 por padrão (pessoa viva) e aceita o genealógico sob opção", () => {
    expect(dataValida("02/03/1858")).toBe(false);
    expect(dataValida("02/03/1858", { anoMinimo: ANO_MINIMO_GENEALOGICO })).toBe(true);
  });

  it("não afrouxa o resto: dia inexistente e campo vazio continuam inválidos", () => {
    expect(dataValida("31/02/1990", { anoMinimo: ANO_MINIMO_GENEALOGICO })).toBe(false);
    expect(dataValida("", { anoMinimo: ANO_MINIMO_GENEALOGICO })).toBe(false);
  });
});

describe("Máscaras religadas nas telas — cada campo chama o validador que já existia", () => {
  const alvos: { arquivo: string; campo: string }[] = [
    { arquivo: "src/routes/_authenticated/pessoas-linhagens.$caseId.tsx", campo: "nome/nascimento da ficha genealógica" },
    { arquivo: "src/routes/_authenticated/nucleos.tsx", campo: "nome do membro do núcleo" },
    { arquivo: "src/components/contrato/painel-dependentes.tsx", campo: "nome do dependente" },
  ];

  for (const { arquivo, campo } of alvos) {
    it(`${campo} importa e usa o validador`, () => {
      const src = readFileSync(arquivo, "utf8");
      expect(src).toContain('from "@/lib/validacao-pessoa"');
      expect(src).toContain("nomeValido(");
    });
  }

  it("a ficha genealógica usa o piso genealógico, nunca o de pessoa viva", () => {
    const src = readFileSync("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx", "utf8");
    expect(src).toContain("ANO_MINIMO_GENEALOGICO");
    expect(src).toContain("anoMinimo: ANO_MINIMO_GENEALOGICO");
  });

  it("o campo de texto compartilhado passou a ter estado de erro (antes não tinha)", () => {
    const src = readFileSync("src/components/caso/campos.tsx", "utf8");
    expect(src).toContain("erro?: string | null");
    expect(src).toContain("aria-invalid");
    // Mensagem de erro substitui a ajuda, nunca empilha as duas.
    expect(src).toContain("ajuda && !erro");
  });

  it("nenhuma tela aplica nomeValido a rótulo/título — o validador recusa dígito", () => {
    /*
      `nomeValido` recusa dígito. Isso é certo para nome de pessoa e ERRADO
      para "Linha materna 2" ou "Certidão 1912". Esta trava impede a varredura
      de virar dano: se alguém aplicar a nome de linha/documento, falha aqui.
      Fonte, documento e linha são nomes de coisa, não de pessoa.
    */
    for (const arquivo of [
      "src/routes/_authenticated/fontes-genealogicas.tsx",
      "src/routes/_authenticated/biblioteca.tsx",
    ]) {
      const src = readFileSync(arquivo, "utf8");
      expect(src.includes("nomeValido("), arquivo).toBe(false);
    }
  });
});

describe("D-04 ampliada — fonte nova nasce aprovada, sem abrir automação", () => {
  it("o default cobre documentação, maturidade, integração e modo de uso", () => {
    expect(FONTE_NOVA_APROVADA_POR_PADRAO).toEqual({
      status_documentacao: "completa",
      estagio_maturidade: "HOMOLOGADA_MANUAL",
      status_integracao: "homologada_manual",
      modo_de_uso_permitido: "manual",
      permite_automacao: "nao",
    });
  });

  it("automação NUNCA nasce liberada — M3-APROVADA segue sendo o portão", () => {
    expect(FONTE_NOVA_APROVADA_POR_PADRAO.permite_automacao).toBe("nao");
    expect(FONTE_NOVA_APROVADA_POR_PADRAO.estagio_maturidade).not.toBe("HOMOLOGADA_API");
    expect(FONTE_NOVA_APROVADA_POR_PADRAO.modo_de_uso_permitido).not.toBe("api_validada");
  });

  it("os valores do default estão no vocabulário real dos CHECKs do banco", () => {
    // `gsc_estagio_chk`, `gsc_status_int_chk` e `gsc_modo_chk`, lidos no banco
    // em 03/10 — nada de sinônimo novo.
    expect([
      "CATALOGADA",
      "DOCUMENTADA",
      "TERMOS_A_CONFIRMAR",
      "ELEGIVEL_PARA_PILOTO",
      "PILOTO_INTERNO",
      "HOMOLOGADA_MANUAL",
      "HOMOLOGADA_API",
      "RESTRITA",
      "DESCONTINUADA",
    ]).toContain(FONTE_NOVA_APROVADA_POR_PADRAO.estagio_maturidade);
    expect([
      "sem_integracao",
      "uso_manual",
      "piloto_interno",
      "homologada_manual",
      "homologada_api",
      "bloqueada",
    ]).toContain(FONTE_NOVA_APROVADA_POR_PADRAO.status_integracao);
    expect(["manual", "metadados_linkout", "api_candidata", "api_validada", "parceria", "restrito", "nao_validado"]).toContain(
      FONTE_NOVA_APROVADA_POR_PADRAO.modo_de_uso_permitido,
    );
  });

  it("o escritor aplica o default só na criação e só em campo vazio", () => {
    const src = readFileSync("src/lib/fontes-genealogicas.functions.ts", "utf8");
    expect(src).toContain("FONTE_NOVA_APROVADA_POR_PADRAO");
    expect(src).toMatch(/if \(!data\.id\) \{\s*\n\s*for \(const \[coluna, padrao\] of Object\.entries\(FONTE_NOVA_APROVADA_POR_PADRAO\)\)/);
    expect(src).toContain('if (!String(valores[coluna] ?? "").trim()) valores[coluna] = padrao;');
    // As 5 colunas precisam estar na lista gravável, ou o default é descartado
    // antes do insert (seria "default declarado e não executado" de novo).
    for (const coluna of Object.keys(FONTE_NOVA_APROVADA_POR_PADRAO)) {
      expect(src.includes(`"${coluna}"`), coluna).toBe(true);
    }
  });
});
