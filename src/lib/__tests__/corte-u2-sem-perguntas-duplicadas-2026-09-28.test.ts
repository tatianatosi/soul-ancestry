import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { parametrosDasPartesCanonicas, idadeEm } from "@/lib/contrato-partes-canonicas";
import { mesclarComPessoaCanonica } from "@/lib/contrato-partes-canonicas.server";
import { COLUNA_CLIENTE_CIVIL, COLUNA_MEMBRO_CIVIL, estadoCampoCivilMembroCaso } from "@/lib/pessoa-vinculo";
import { jornadaDoPlanoSalvo } from "@/lib/planejador-salvo";

/**
 * Corte U2 (28/09/2026): o que a Pessoa 360 já tem não é perguntado de
 * novo — nem no contrato, nem no Caso 360, nem no Núcleo, nem no
 * Planejador. Dados de pessoa nos testes são fictícios.
 */

const ler = (p: string) => readFileSync(p, "utf8");
const hoje = new Date("2026-09-28T12:00:00Z");

describe("contrato pré-carrega as partes a partir da Pessoa 360", () => {
  const contratante = {
    nome: "Pessoa Exemplo",
    papel: "Contratante",
    cpf: "000.000.000-00",
    estado_civil: "casado",
    data_nascimento: "1980-01-01",
    endereco: "Rua Fictícia, 1 — Cidade/UF",
    email: "exemplo@teste.invalid",
  };

  it("contratante: nome, documento, endereço e contato com origem crm", () => {
    const p = parametrosDasPartesCanonicas(contratante, [], hoje);
    const campo = (c: string) => p.find((x) => x.campo === c);
    expect(campo("contratante_nome")?.valor).toBe("Pessoa Exemplo");
    expect(campo("contratante_documento")?.valor).toContain("CPF 000.000.000-00");
    expect(campo("contratante_documento")?.valor).toContain("Casado(a)");
    expect(campo("contratante_endereco")?.valor).toBe("Rua Fictícia, 1 — Cidade/UF");
    expect(campo("contratante_contato")?.valor).toBe("exemplo@teste.invalid");
    expect(p.every((x) => x.origem === "crm")).toBe(true);
  });

  it("campo vazio na Pessoa 360 fica vazio — nunca inventado", () => {
    const p = parametrosDasPartesCanonicas({ nome: "Só Nome", papel: "Contratante" }, [], hoje);
    expect(p.find((x) => x.campo === "contratante_endereco")).toBeUndefined();
    expect(p.find((x) => x.campo === "contratante_contato")).toBeUndefined();
    expect(parametrosDasPartesCanonicas(null, [], hoje)).toEqual([]);
  });

  it("menor de idade só é afirmado quando a data de nascimento sustenta; sem data vira pendência", () => {
    const menor = { nome: "Criança Exemplo", papel: "Dependente", data_nascimento: "2015-06-01" };
    const semData = { nome: "Sem Data", papel: "Titular" };
    const rep = parametrosDasPartesCanonicas(contratante, [menor, semData], hoje).find((x) => x.campo === "representacao_legal");
    expect(rep?.valor).toContain("Criança Exemplo — representação legal necessária");
    expect(rep?.valor).toContain("Data de nascimento não informada na Pessoa 360: Sem Data");
    expect(idadeEm("2015-06-01", hoje)).toBe(11);
    expect(idadeEm(null, hoje)).toBeNull();
  });

  it("a Pessoa 360 prevalece sobre o cadastro do Planejador no mesmo campo; o resto continua", () => {
    const planejador = [
      { campo: "contratante_nome", valor: "Antigo", origem: "planejador" },
      { campo: "valor_total", valor: "R$ 1", origem: "planejador" },
    ];
    const canonicos = parametrosDasPartesCanonicas({ nome: "Novo", papel: "Contratante" }, [], hoje);
    const r = mesclarComPessoaCanonica(planejador, canonicos);
    expect(r.filter((x) => x.campo === "contratante_nome").map((x) => x.valor)).toEqual(["Novo"]);
    expect(r.some((x) => x.campo === "valor_total")).toBe(true);
  });

  it("os dois caminhos de pré-carga do contrato usam as partes canônicas", () => {
    expect(ler("src/lib/contrato-preparar.functions.ts")).toContain("mesclarComPessoaCanonica(");
    expect(ler("src/lib/contrato-parametros.functions.ts")).toContain("parametrosCanonicosDoCaso(");
  });
});

describe("Caso 360 › Adicionar pessoa: sempre uma Pessoa 360 com cliente_id", () => {
  const fn = ler("src/lib/caso-canonico.functions.ts");
  const bloco = fn.slice(fn.indexOf("export const adicionarPessoaAoCaso"), fn.indexOf("export const listarPessoasParaCaso"));

  it("cria a pessoa nova em clientes e o membro com cliente_id e parentesco (coluna NOT NULL)", () => {
    expect(bloco).toContain('tabela: "clientes"');
    expect(bloco).toContain('tabela: "case_members"');
    expect(bloco).toContain("cliente_id: clienteId");
    expect(bloco).toContain('parentesco: (data.parentesco ?? "").trim() || "a informar"');
  });

  it("pessoa escolhida precisa ser da mesma organização e não pode entrar duas vezes no caso", () => {
    expect(bloco).toMatch(/from\("clientes"\)[\s\S]*?\.eq\("organization_id", organizationId\)/);
    expect(bloco).toContain("já faz parte deste caso.");
    expect(bloco).toMatch(/from\("crm_casos"\)[\s\S]*?\.eq\("organization_id", organizationId\)/);
  });

  it("a tela usa o escritor novo, com seletor de pessoa, e não cria mais case_members solto", () => {
    const tela = ler("src/routes/_authenticated/casos.$caseId.index.tsx");
    expect(tela).toContain("useServerFn(adicionarPessoaAoCaso)");
    expect(tela).toContain('aria-label="Pessoa já cadastrada"');
    expect(tela).not.toContain('criar({ data: { entidade: "case_members", dados: { case_id: casoId, nome: novo.trim() } } })');
  });
});

describe("reconciliadores ganham local de nascimento e WhatsApp", () => {
  it("local_nascimento do caso ↔ cidade_nascimento da Pessoa 360", () => {
    expect(COLUNA_MEMBRO_CIVIL.local_nascimento).toBe("local_nascimento");
    expect(COLUNA_CLIENTE_CIVIL.local_nascimento).toBe("cidade_nascimento");
    expect(estadoCampoCivilMembroCaso("local_nascimento", { valor: null }, "Cidade  Exemplo")).toBe("preencher");
    expect(estadoCampoCivilMembroCaso("local_nascimento", { valor: "cidade exemplo" }, "Cidade  Exemplo")).toBe("ja_sincronizado");
    expect(estadoCampoCivilMembroCaso("local_nascimento", { valor: "Outra" }, "Cidade Exemplo")).toBe("conflito");
  });

  it("WhatsApp: 'não' também é resposta — nunca sobrescrito como se fosse vazio", () => {
    expect(estadoCampoCivilMembroCaso("telefone_whatsapp", { valor: false }, true)).toBe("conflito");
    expect(estadoCampoCivilMembroCaso("telefone_whatsapp", { valor: null }, false)).toBe("preencher");
    expect(estadoCampoCivilMembroCaso("telefone_whatsapp", { valor: true }, true)).toBe("ja_sincronizado");
    expect(estadoCampoCivilMembroCaso("telefone_whatsapp", { valor: null }, null)).toBe("sem_dado_canonico");
  });

  it("a Pessoa 360 carrega as colunas que o sinal compara (sem falso 'a preencher')", () => {
    const sel = ler("src/lib/pessoa-vinculo.ts");
    for (const c of ["local_nascimento", "telefone_whatsapp", "email", "rg", "profissao", "estado_civil", "endereco"]) {
      expect(sel).toMatch(new RegExp(`from\\("case_members"\\)\\s*\\.select\\("[^"]*\\b${c}\\b`));
    }
  });
});

describe("/nucleos: escolher a pessoa traz o nome; membros vão ao caso por botão", () => {
  const tela = ler("src/routes/_authenticated/nucleos.tsx");
  it("escolher a pessoa preenche o nome do membro", () => {
    expect(tela).toContain("setNovoMembro({ ...novoMembro, clienteId: v, nome })");
  });
  it("sincronizarMembrosDoCaso ganha tela: prévia e confirmação inline", () => {
    expect(tela).toContain("useServerFn(sincronizarMembrosDoCaso)");
    expect(tela).toContain("confirmar: false");
    expect(tela).toContain("confirmar: true");
    expect(tela).not.toContain("window.confirm");
  });
});

describe("Planejador × Jornada: um só lugar de edição", () => {
  it("com plano salvo, rota, produto-pai e próxima ação vêm do plano (só leitura)", () => {
    expect(jornadaDoPlanoSalvo(null)).toBeNull();
    expect(
      jornadaDoPlanoSalvo({ rota_confirmada: "Itália", produto_pai_id: "PP-01", proxima_acao: " Ligar ", prazo_proxima_acao: "2026-10-01T00:00:00Z" }),
    ).toEqual({ rotaConfirmada: "Itália", produtoPaiId: "PP-01", proximaAcao: "Ligar", prazoProximaAcao: "2026-10-01" });
    const tela = ler("src/components/contrato/planejador-operacional.tsx");
    expect(tela).toContain("proximaAcao: jornada ? jornada.proximaAcao");
    expect(tela).toContain("Vindo da Jornada do planejador (editar no cartão acima)");
  });

  it("salvar o formulário grande espelha a próxima ação no caso (mesmo espelho da Jornada)", () => {
    expect(ler("src/lib/cadeia-operacional.server.ts")).toContain("espelharProximaAcaoNoCaso(supabase, {");
    expect(ler("src/lib/jornada-planejador.server.ts")).toContain("export async function espelharProximaAcaoNoCaso(");
  });
});
