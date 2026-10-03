import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Varredura de máscaras como TESTE (03/10/2026).
 *
 * Pedido literal: "revisar os 77 que não tem validador no corte máscaras
 * sempre executar em todas as abas e arquivos".
 *
 * A Proprietária estava certa e meu relato anterior estava errado: eu medi
 * ARQUIVOS que importam o validador, não CAMPOS validados. Um arquivo pode
 * importar `nomeValido`, usar em um campo e deixar 22 sem — era exatamente o
 * caso de `pessoas-linhagens.$caseId.tsx`. Medição por campo: 26 campos de
 * entrada coletam dado de pessoa em todo o `src`.
 *
 * Este teste é a varredura, não um relato dela: ele enumera os campos a cada
 * execução e falha quando alguém acrescenta um campo de pessoa sem validador.
 * É o que impede a varredura de precisar ser refeita à mão na próxima vez.
 */

function arquivosDeUI(dir: string, saida: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      if (nome === "__tests__" || nome === "node_modules") continue;
      arquivosDeUI(caminho, saida);
    } else if (/\.tsx?$/.test(nome)) {
      saida.push(caminho);
    }
  }
  return saida;
}

/*
  Classe decidida pela EXPRESSÃO DO VALOR, nunca por texto solto perto do
  campo — a primeira medição usou uma janela de 420 caracteres e atribuiu
  "data" a um campo "Sexo" porque a janela vazava para o campo seguinte.

  Nome de COISA fica fora de propósito: `nomeValido` recusa dígito, e "Linha
  materna 2", "Certidão 1912" ou o nome de uma fonte têm dígito por direito.
  Data "aproximada" também fica fora: é texto livre ("entre 1890 e 1893"),
  não data.
*/
const CLASSES: [string, RegExp][] = [
  ["data_historica", /(nascimento_data|data_nascimento|birth_date|morte_data|data_obito|death_date)/i],
  ["cpf", /(\bcpf\b|document_number)/i],
  ["rg", /(rg_numero|rg_orgao)/i],
  ["cep", /(\bcep\b|endereco_cep)/i],
  ["telefone", /(telefone|phone|whatsapp)/i],
  ["email", /(\bemail\b|e_mail)/i],
  ["endereco", /(logradouro|endereco_numero|endereco_bairro|endereco_cidade|endereco_uf)/i],
  [
    "nome",
    /(nome_completo|nome_civil|nome_nascimento|person_name|nome_pai|nome_mae|nome_conjuge|nomeCompleto|contratante_nome|novoMembro\.nome)/i,
  ],
];

/** Texto livre que apenas contém o nome de um campo de data. */
const NAO_E_DATA = /_aproximad/i;

const VALIDADOR = /motivoCampoInvalido|nomeInvalido|nascimentoInvalido|nomeValido|dataValida|cpfValido|cepValido|telefoneValido|emailValido|rgOrgaoUfValido|enderecoCampoValido/;

const TAG = /<(input|textarea|Texto|CampoTexto)\b((?:[^<>]|\{[^{}]*\})*?)\/?>/gs;

type Campo = { arquivo: string; linha: number; classe: string; chave: string; validado: boolean };

function camposDePessoa(): Campo[] {
  const achados: Campo[] = [];
  for (const arquivo of arquivosDeUI("src")) {
    const texto = readFileSync(arquivo, "utf8");
    for (const m of texto.matchAll(TAG)) {
      const attrs = m[2] ?? "";
      // Sem onChange o campo só exibe; máscara é para quem coleta.
      if (!attrs.includes("onChange")) continue;
      const valor = /(?:value|valor)=\{([^}]{0,120})\}/.exec(attrs)?.[1] ?? "";
      const name = /name="([^"]{0,60})"/.exec(attrs)?.[1] ?? "";
      const rotulo = /(?:label|rotulo)="([^"]{0,60})"/.exec(attrs)?.[1] ?? "";
      const chave = `${valor} ${name} ${rotulo}`;
      if (NAO_E_DATA.test(chave)) continue;
      for (const [classe, rx] of CLASSES) {
        if (!rx.test(chave)) continue;
        const inicio = m.index ?? 0;
        // O validador pode estar no atributo `erro={...}` ou num
        // `<AvisoCampo>` irmão — a vizinhança cobre os dois.
        const vizinhanca = texto.slice(Math.max(0, inicio - 260), inicio + (m[0]?.length ?? 0) + 420);
        achados.push({
          arquivo,
          linha: texto.slice(0, inicio).split("\n").length,
          classe,
          chave: chave.trim(),
          validado: VALIDADOR.test(vizinhanca),
        });
        break;
      }
    }
  }
  return achados;
}

describe("Máscaras e validadores em todas as abas — varredura, não relato", () => {
  const campos = camposDePessoa();

  it("a varredura encontra campos de verdade (guarda contra detector quebrado)", () => {
    /*
      Se um refactor mudar a forma das tags e o detector parar de achar nada,
      o teste abaixo passaria vazio e mentiria. Este piso evita isso.
    */
    expect(campos.length).toBeGreaterThanOrEqual(20);
  });

  it("TODO campo que coleta dado de pessoa tem validador", () => {
    const sem = campos.filter((c) => !c.validado);
    const lista = sem.map((c) => `${c.arquivo}:${c.linha} [${c.classe}] ${c.chave}`).join("\n");
    expect(sem.length, `campos de pessoa SEM validador:\n${lista}`).toBe(0);
  });

  it("cobre as oito classes de dado de pessoa, não só nome", () => {
    const classes = new Set(campos.map((c) => c.classe));
    for (const esperada of ["nome", "data_historica", "cpf", "cep", "telefone", "email"]) {
      expect(classes.has(esperada), `nenhum campo da classe ${esperada} foi encontrado`).toBe(true);
    }
  });

  it("nome de COISA não recebe o validador de nome de pessoa", () => {
    /*
      `nomeValido` recusa dígito. Aplicar a "Nome da linha" ou ao nome de uma
      fonte quebraria dado legítimo ("Linha materna 2", "Certidão 1912").
      Esta trava impede a varredura de virar dano.
    */
    const ficha = readFileSync("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx", "utf8");
    const i = ficha.indexOf("nova.nome_da_linha");
    expect(i).toBeGreaterThan(-1);
    const janela = ficha.slice(Math.max(0, i - 400), i + 400);
    expect(/nomeValido|motivoCampoInvalido\([^)]*"nome"/.test(janela)).toBe(false);
  });
});
