import { describe, expect, it } from "vitest";

import {
  CAMPOS_VARRIDOS,
  CAMPO_LEAD_POR_VARREDURA,
  codigoLeadDoAchado,
  lerConversa,
  varrerConversa,
} from "../varredura-whatsapp";

/** Dump no formato iOS, com colchetes. */
const DUMP_IOS = `[10/08/2026, 14:32:05] Tatiana: Oi Ana! Me conta um pouco da sua história familiar.
[10/08/2026, 14:35:11] Ana Luiza: Oi Tatiana! Então, meu bisavô era italiano, veio da Itália novinho.
Ele desembarcou aqui por volta de 1910, pelo lado do meu pai.
[10/08/2026, 14:36:02] Ana Luiza: Eu tenho a certidão de nascimento dele e a certidão de casamento dos meus avós.
[10/08/2026, 14:38:40] Ana Luiza: Queria fazer para a família toda, tenho dois filhos menores.
[10/08/2026, 14:41:00] Tatiana: Perfeito. Você tem passaporte italiano de alguém da família?
[10/08/2026, 14:44:19] Ana Luiza: Não. Quanto custa mais ou menos? Preciso conversar com meu marido.`;

/** Mesmo conteúdo no formato Android, com hífen. */
const DUMP_ANDROID = `10/08/2026 14:35 - Ana Luiza: meu bisavô era italiano
10/08/2026 14:36 - Ana Luiza: tenho a certidão de nascimento dele`;

describe("ler o dump", () => {
  it("entende o formato com colchetes", () => {
    const m = lerConversa(DUMP_IOS);
    expect(m[0].autor).toBe("Tatiana");
    expect(m[0].quando?.slice(0, 10)).toBe("2026-08-10");
  });

  it("entende o formato com hífen", () => {
    const m = lerConversa(DUMP_ANDROID);
    expect(m).toHaveLength(2);
    expect(m[0].autor).toBe("Ana Luiza");
  });

  it("junta a quebra de linha à mensagem anterior", () => {
    // Descartar a continuação perderia justamente as respostas longas, que
    // são as que interessam.
    const m = lerConversa(DUMP_IOS);
    const segunda = m[1];
    expect(segunda.texto).toContain("desembarcou");
    expect(segunda.texto).toContain("bisavô");
  });

  it("não inventa mensagem a partir de texto solto", () => {
    expect(lerConversa("isso aqui não é um dump")).toEqual([]);
    expect(lerConversa("")).toEqual([]);
  });

  it("converte AM/PM corretamente", () => {
    const m = lerConversa("[10/08/2026, 2:30 PM] X: oi");
    expect(m[0].quando).toContain("T14:30");
    const n = lerConversa("[10/08/2026, 12:15 AM] X: oi");
    expect(n[0].quando).toContain("T00:15");
  });
});

describe("varrer a conversa da Ana Luiza", () => {
  const r = varrerConversa(DUMP_IOS, { autoresDaCasa: ["Tatiana"] });
  const valores = (campo: string) => r.achados.filter((a) => a.campo === campo).map((a) => a.valor);

  it("acha o país", () => {
    expect(valores("nacionalidades_interesse")).toContain("Itália");
  });

  it("acha a geração do ascendente", () => {
    expect(valores("geracao_ascendente")).toContain("bisavô ou bisavó");
  });

  it("acha a linha de transmissão", () => {
    expect(valores("linha_transmissao")).toContain("paterna");
  });

  it("acha os documentos citados", () => {
    const docs = valores("documentos_chave");
    expect(docs).toContain("certidão de nascimento");
    expect(docs).toContain("certidão de casamento");
  });

  it("acha a estrutura familiar", () => {
    const e = valores("estrutura_familiar");
    expect(e).toContain("há menores envolvidos");
    expect(e).toContain("mais de um requerente");
  });

  it("acha as duas objeções", () => {
    const o = valores("objecao_predominante");
    expect(o).toContain("preço");
    expect(o).toContain("decisão adiada");
  });

  it("todo achado carrega o trecho de onde veio", () => {
    // A evidência viaja junto, sempre: sem ela, o achado é palpite.
    for (const a of r.achados) {
      expect(a.trecho.length).toBeGreaterThan(0);
      expect(a.autor).toBe("Ana Luiza");
    }
  });
});

describe("o que a equipe disse não vira achado", () => {
  it("ignora a pergunta da casa", () => {
    // A Tatiana pergunta "você tem passaporte italiano?". Contar isso como
    // achado inverteria o sentido da conversa: pergunta não é resposta.
    const r = varrerConversa(DUMP_IOS, { autoresDaCasa: ["Tatiana"] });
    expect(r.achados.map((a) => a.valor)).not.toContain("passaporte");
  });

  it("sem informar os autores da casa, tudo entra", () => {
    // Comportamento honesto do padrão: sem saber quem é a casa, não dá para
    // filtrar, e filtrar por engano esconderia resposta de verdade.
    const r = varrerConversa(DUMP_IOS);
    expect(r.achados.map((a) => a.valor)).toContain("passaporte");
  });
});

describe("o que não foi encontrado é dito", () => {
  it("lista os campos do roteiro sem achado", () => {
    const r = varrerConversa("[10/08/2026, 14:00] Ana: bom dia", { autoresDaCasa: [] });
    expect(r.camposSemAchado).toEqual(CAMPOS_VARRIDOS);
    expect(r.achados).toEqual([]);
  });

  it("informa período, autores e volume", () => {
    const r = varrerConversa(DUMP_IOS, { autoresDaCasa: ["Tatiana"] });
    expect(r.mensagens).toBe(6);
    expect(r.autores).toEqual(["Tatiana", "Ana Luiza"]);
    expect(r.de?.slice(0, 10)).toBe("2026-08-10");
  });
});

describe("precisão acima de cobertura", () => {
  it("não tenta adivinhar localidade", () => {
    // "Santa Maria" pode ser cidade, paróquia ou nome de pessoa. Um palpite
    // errado aqui manda a pesquisa para o lugar errado.
    const r = varrerConversa("[10/08/2026, 14:00] Ana: meus avós eram de Santa Maria");
    expect(r.achados.every((a) => a.campo !== ("localidades_conhecidas" as never))).toBe(true);
  });

  it("conta repetição sem duplicar o achado", () => {
    const r = varrerConversa(
      `[10/08/2026, 14:00] Ana: era italiano
[10/08/2026, 14:01] Ana: da Itália mesmo`,
    );
    const italia = r.achados.filter((a) => a.valor === "Itália");
    expect(italia).toHaveLength(1);
    expect(italia[0].ocorrencias).toBe(2);
  });
});

describe("acento não engole achado", () => {
  /*
    `\b` do JavaScript é ASCII: depois de "ô" não existe fronteira de palavra,
    porque para o motor "ô" já é caractere de não-palavra. A primeira versão
    usava `\b` e perdia "bisavô", "avô" e "óbito" — achava só "avós", que
    termina em "s". Estes casos existem para que isso não volte.
  */
  const varrer = (texto: string) => varrerConversa(`[10/08/2026, 14:00] Ana: ${texto}`);
  const achou = (texto: string, valor: string) =>
    varrer(texto).achados.some((a) => a.valor === valor);

  it("acha palavra terminada em acento", () => {
    expect(achou("meu bisavô veio de longe", "bisavô ou bisavó")).toBe(true);
    expect(achou("meu avô veio de longe", "avô ou avó")).toBe(true);
    expect(achou("minha avó veio de longe", "avô ou avó")).toBe(true);
  });

  it("acha palavra iniciada em acento", () => {
    expect(achou("tenho a certidão de óbito", "certidão de óbito")).toBe(true);
  });

  it("não confunde bisavô com avô", () => {
    // "bisavô" contém "avô". Sem exigir que nada venha colado antes, uma
    // menção ao bisavô viraria também uma menção ao avô.
    const r = varrer("meu bisavô era italiano");
    const geracoes = r.achados.filter((a) => a.campo === "geracao_ascendente").map((a) => a.valor);
    expect(geracoes).toEqual(["bisavô ou bisavó"]);
  });

  it("não casa dentro de outra palavra", () => {
    expect(achou("o navio chamava Caronte", "certidão de casamento")).toBe(false);
  });
});

describe("de-para do sinal para o lead — só o valor normalizado, nunca o trecho (PR #48)", () => {
  it("mapeia os achados da conversa da Ana Luiza para código de opção controlada", () => {
    const r = varrerConversa(DUMP_IOS, { autoresDaCasa: ["Tatiana"] });
    const codigos = new Map(r.achados.map((a) => [`${a.campo}::${a.valor}`, codigoLeadDoAchado(a)]));
    expect(codigos.get("nacionalidades_interesse::Itália")).toBe("italiana");
    expect(codigos.get("geracao_ascendente::bisavô ou bisavó")).toBe("bisavo");
    expect(codigos.get("linha_transmissao::paterna")).toBe("paterna");
    expect(codigos.get("documentos_chave::certidão de nascimento")).toBe("certidao_nascimento");
    expect(CAMPO_LEAD_POR_VARREDURA.geracao_ascendente.campoLead).toBe("geracao_ascendente");
  });

  it("não inventa código quando o achado não tem de-para inequívoco", () => {
    expect(codigoLeadDoAchado({ campo: "objecao_predominante", valor: "decisão adiada" })).toBeNull();
  });
});
