import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * P32 (26/09/2026) — pedido direto da Proprietária: "verifique quais deles
 * podem ser validados em todos os campos... o que se complementam o que se
 * repete e o que é redundante na pessoa canônica... um cadastro do lead que
 * permeia em toda a sua jornada... que esse mesmo cadastro somente se
 * complemente ao caminhar para aba... sem forms infinitos".
 *
 * Auditoria (agente Explore) confirmou: Ficha Piloto NÃO duplica cadastro —
 * é 100% leitura sobre as mesmas tabelas da Ficha Genealógica
 * (`carregarFichaPiloto`, só SELECT). O problema real são 6 pares
 * `case_members` × `clientes` nunca reconciliados (CPF/telefone/CEP já
 * tinham sido fechados em cortes anteriores): email, RG, nacionalidade, data
 * de nascimento, profissão, estado civil. Em vez de 6 painéis novos
 * (repetindo CPF/telefone/CEP), este corte generaliza o mecanismo — um único
 * escritor, um único componente, um bloco por campo dentro de UM painel.
 */

import {
  CAMPOS_CIVIS_RECONCILIAVEIS,
  COLUNA_CLIENTE_CIVIL,
  COLUNA_MEMBRO_CIVIL,
  estadoCampoCivilMembroCaso,
  ROTULO_CAMPO_CIVIL,
  sinalCampoCivilDaPessoaPorCaso,
} from "@/lib/pessoa-vinculo";

describe("P32 — estadoCampoCivilMembroCaso é genérico, cobre os campos civis (6 + nome/endereço no Corte Fase C, 27/09/2026)", () => {
  it("cobre email, rg, nacionalidade, data_nascimento, profissao, estado_civil, e agora nome e endereco", () => {
    expect(CAMPOS_CIVIS_RECONCILIAVEIS).toEqual([
      "nome",
      "email",
      "rg",
      "nacionalidade",
      "data_nascimento",
      "profissao",
      "estado_civil",
      "endereco",
      "local_nascimento",
      "telefone_whatsapp",
    ]);
  });

  it("dependente nunca sincroniza, em qualquer campo", () => {
    for (const campo of CAMPOS_CIVIS_RECONCILIAVEIS) {
      expect(estadoCampoCivilMembroCaso(campo, { dependente: true, valor: null }, "algo")).toBe(
        "dependente_nao_sincronizado",
      );
    }
  });

  it("sem dado canônico, nada a fazer", () => {
    expect(estadoCampoCivilMembroCaso("email", { valor: null }, null)).toBe("sem_dado_canonico");
    expect(estadoCampoCivilMembroCaso("email", { valor: null }, "")).toBe("sem_dado_canonico");
  });

  it("membro vazio e canônico preenchido: preencher", () => {
    expect(estadoCampoCivilMembroCaso("email", { valor: null }, "ana@exemplo.com")).toBe("preencher");
  });

  it("e-mail: compara case-insensitive e com espaço", () => {
    expect(estadoCampoCivilMembroCaso("email", { valor: "Ana@Exemplo.com " }, "ana@exemplo.com")).toBe(
      "ja_sincronizado",
    );
    expect(estadoCampoCivilMembroCaso("email", { valor: "outro@exemplo.com" }, "ana@exemplo.com")).toBe("conflito");
  });

  it("RG: compara ignorando pontuação/espaço/caixa (não tem dígito nacional único)", () => {
    expect(estadoCampoCivilMembroCaso("rg", { valor: "12.345.678-9" }, "123456789")).toBe("ja_sincronizado");
    expect(estadoCampoCivilMembroCaso("rg", { valor: "12.345.678-0" }, "123456789")).toBe("conflito");
  });

  it("data_nascimento: compara só os 10 primeiros caracteres (ignora hora, se houver)", () => {
    expect(estadoCampoCivilMembroCaso("data_nascimento", { valor: "1990-05-10T00:00:00Z" }, "1990-05-10")).toBe(
      "ja_sincronizado",
    );
    expect(estadoCampoCivilMembroCaso("data_nascimento", { valor: "1990-05-11" }, "1990-05-10")).toBe("conflito");
  });

  it("nacionalidade/profissao/estado_civil: compara texto normalizado", () => {
    expect(estadoCampoCivilMembroCaso("nacionalidade", { valor: "BRASILEIRA" }, "brasileira")).toBe(
      "ja_sincronizado",
    );
    expect(estadoCampoCivilMembroCaso("estado_civil", { valor: "casado" }, "solteiro")).toBe("conflito");
  });
});

describe("P32 — sinalCampoCivilDaPessoaPorCaso agrega por caso, ignora núcleo", () => {
  it("só conta conflito/preencher de case_members da mesma pessoa", () => {
    const sinal = sinalCampoCivilDaPessoaPorCaso(
      "profissao",
      [
        { case_id: "c1", cliente_id: "p1", profissao: null, origem: "case_members" },
        { case_id: "c1", cliente_id: "p1", profissao: "Advogada", origem: "case_members" },
        { case_id: "c2", cliente_id: "p1", profissao: "Médica", origem: "nucleo" },
      ],
      "p1",
      "Médica",
    );
    expect(sinal.c1).toEqual({ conflito: 1, preencher: 1 });
    expect(sinal.c2).toBeUndefined();
  });
});

describe("P32 — colunas: RG e endereço divergem de nome entre case_members e clientes", () => {
  it("rg → rg_numero em clientes; endereco é composto (placeholder, nunca lido direto); os demais mantêm o mesmo nome", () => {
    expect(COLUNA_CLIENTE_CIVIL.rg).toBe("rg_numero");
    expect(COLUNA_MEMBRO_CIVIL.rg).toBe("rg");
    for (const campo of CAMPOS_CIVIS_RECONCILIAVEIS.filter((c) => c !== "rg" && c !== "endereco" && c !== "local_nascimento")) {
      expect(COLUNA_CLIENTE_CIVIL[campo]).toBe(COLUNA_MEMBRO_CIVIL[campo]);
    }
  });

  it("cada campo tem rótulo cliente-facing, nunca o nome cru da coluna", () => {
    for (const campo of CAMPOS_CIVIS_RECONCILIAVEIS) {
      expect(ROTULO_CAMPO_CIVIL[campo]).toBeTruthy();
      expect(ROTULO_CAMPO_CIVIL[campo]).not.toBe(campo);
    }
  });
});

describe("P32 — um único escritor genérico, não 6 cópias (caso-canonico.functions.ts)", () => {
  const arquivo = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");

  it("conferirDivergenciaCampoCivilMembrosCaso existe e recusa campo desconhecido", () => {
    expect(arquivo).toContain("export const conferirDivergenciaCampoCivilMembrosCaso");
    const inicio = arquivo.indexOf("export const conferirDivergenciaCampoCivilMembrosCaso");
    const trecho = arquivo.slice(inicio, inicio + 1200);
    expect(trecho).toContain("CAMPO_NAO_RECONCILIAVEL");
  });

  it("P32b (26/09/2026): sem dedup — nenhuma ação de resolver conflito com motivo, conflito é só sinal", () => {
    const inicio = arquivo.indexOf("export const conferirDivergenciaCampoCivilMembrosCaso");
    const fim = arquivo.indexOf("\n  });", inicio);
    const trecho = arquivo.slice(inicio, fim);
    expect(trecho).not.toContain("resolverMembroId");
    expect(trecho).not.toContain("mResolver");
  });

  it("só preenche vazio em lote, nunca sobrescreve valor já gravado", () => {
    const inicio = arquivo.indexOf("export const conferirDivergenciaCampoCivilMembrosCaso");
    const trecho = arquivo.slice(inicio, inicio + 4500);
    expect(trecho).toContain('if (item.acao !== "preencher") continue;');
  });
});

describe("P32 — Caso 360: um painel único (não 6 cards) para os 6 campos civis", () => {
  const arquivo = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

  it("importa e usa PainelDadosCivisMembrosCaso nos dois ramos (com e sem núcleo)", () => {
    expect(arquivo).toContain(
      'import { PainelDadosCivisMembrosCaso } from "@/components/caso/reconciliar-dados-civis-membros-caso"',
    );
    const ocorrencias = arquivo.match(/<PainelDadosCivisMembrosCaso/g) ?? [];
    expect(ocorrencias.length).toBe(2);
  });
});

describe("P32 — componente genérico não recria 6 painéis (reconciliar-dados-civis-membros-caso.tsx)", () => {
  const arquivo = readFileSync(
    "src/components/caso/reconciliar-dados-civis-membros-caso.tsx",
    "utf8",
  );

  it("um único bloco reaproveitado via .map sobre CAMPOS_CIVIS_RECONCILIAVEIS", () => {
    expect(arquivo).toContain("CAMPOS_CIVIS_RECONCILIAVEIS.map((campo) =>");
    // guarda de regressão: não deve haver 6 componentes hard-coded distintos.
    const declaracoesDeComponente = arquivo.match(/^function \w+\(/gm) ?? [];
    expect(declaracoesDeComponente.length).toBeLessThanOrEqual(2);
  });
});

describe("P32 — Pessoa 360: sinal consolidado dos 6 campos civis (não 6 avisos separados)", () => {
  const arquivo = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

  it("usa sinalCampoCivilDaPessoaPorCaso e um único bloco data-pessoa360-sinal-civil", () => {
    expect(arquivo).toContain("sinalCampoCivilDaPessoaPorCaso");
    expect(arquivo).toContain("data-pessoa360-sinal-civil");
    const ocorrencias = arquivo.match(/data-pessoa360-sinal-civil/g) ?? [];
    expect(ocorrencias.length).toBe(1);
  });
});

describe("P32 — handoff Lead→Cliente: nacionalidades_interesse deixa de ficar invisível na pessoa", () => {
  const arquivo = readFileSync("src/lib/handoff-discovery.ts", "utf8");

  it("payloadClienteDoLead acrescenta as nacionalidades de interesse às observações quando há mais de uma", () => {
    const inicio = arquivo.indexOf("export function payloadClienteDoLead");
    const trecho = arquivo.slice(inicio, inicio + 1200);
    expect(trecho).toContain("nacionalidades_interesse");
    expect(trecho).toContain("Nacionalidades de interesse (Discovery)");
  });
});

describe("P32 — Pessoa 360 deixa de mostrar só a coluna morta de nascimento/óbito", () => {
  const funcoes = readFileSync("src/lib/pessoa.functions.ts", "utf8");
  const rota = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

  it("carregarPessoa passa a ler nascimento_data/localidade e morte_data/localidade de genealogical_person_profiles", () => {
    expect(funcoes).toContain("nascimento_data, nascimento_localidade, morte_data, morte_localidade");
  });

  it("a tela mostra o perfil vinculado com nascimento/óbito, não só nome e status", () => {
    const inicio = rota.indexOf("Perfil genealógico vinculado");
    const trecho = rota.slice(inicio, inicio + 700);
    expect(trecho).toContain("p.nascimento_data");
    expect(trecho).toContain("p.morte_data");
  });
});
