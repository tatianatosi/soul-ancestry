import { describe, expect, it } from "vitest";

import {
  evidenciaDeMesmaPessoa,
  montarLinhaDoTempoDaPessoa,
  normalizarCpf,
  normalizarEmail,
  normalizarNome,
  normalizarTelefone,
  podeTratarComoMesmaPessoa,
} from "../pessoa-identidade";

describe("normalizar o que identifica", () => {
  it("apara o espaço que existe de verdade no banco", () => {
    // O e-mail da Ana Luiza está gravado com espaço no fim. Sem aparar, ela
    // não casa nem consigo mesma.
    expect(normalizarEmail("analuizabox@gmail.com ")).toBe("analuizabox@gmail.com");
    expect(normalizarEmail(" ANALUIZABOX@Gmail.com")).toBe("analuizabox@gmail.com");
  });

  it("recusa o que não é e-mail em vez de devolver lixo", () => {
    expect(normalizarEmail("analuiza")).toBeNull();
    expect(normalizarEmail("")).toBeNull();
    expect(normalizarEmail(null)).toBeNull();
  });

  it("compara telefone pelo fim, que é a parte estável", () => {
    // O mesmo número aparece com e sem nono dígito, com e sem DDI.
    expect(normalizarTelefone("(62) 8158-4015")).toBe("81584015");
    expect(normalizarTelefone("+55 62 98158-4015")).toBe("81584015");
    expect(normalizarTelefone("062981584015")).toBe("81584015");
  });

  it("recusa telefone curto demais para identificar", () => {
    expect(normalizarTelefone("1234")).toBeNull();
    expect(normalizarTelefone("")).toBeNull();
  });

  it("compara nome sem acento, sem pontuação e sem o sufixo de fixture", () => {
    expect(normalizarNome("Ana Luiza (dado de teste)")).toBe("ana luiza");
    expect(normalizarNome("ANA LUÍZA")).toBe("ana luiza");
    expect(normalizarNome("Ana  Luiza ")).toBe("ana luiza");
  });

  // Ordem P1 (21/09/2026, "Uma identidade operacional do Lead ao Caso"):
  // busca preventiva por e-mail/telefone/CPF — CPF era o único sinal
  // ausente. Lead nunca tem CPF (só é coletado depois de virar cliente); o
  // sinal importa ao comparar `clientes` entre si.
  it("compara CPF só pelos 11 dígitos", () => {
    expect(normalizarCpf("123.456.789-01")).toBe("12345678901");
    expect(normalizarCpf("12345678901")).toBe("12345678901");
  });

  it("recusa CPF com contagem de dígitos errada", () => {
    expect(normalizarCpf("123.456.789-0")).toBeNull();
    expect(normalizarCpf("")).toBeNull();
    expect(normalizarCpf(null)).toBeNull();
  });
});

describe("evidência de mesma pessoa", () => {
  it("e-mail idêntico confirma", () => {
    const e = evidenciaDeMesmaPessoa(
      { nome: "Ana Luiza", email: "analuizabox@gmail.com " },
      { nome: "Outro nome qualquer", email: "ANALUIZABOX@gmail.com" },
    );
    expect(e?.forca).toBe("confirmado");
    expect(podeTratarComoMesmaPessoa(e)).toBe(true);
  });

  it("telefone idêntico é provável, não confirmado", () => {
    // Família compartilha número. Confirmar por telefone fundiria mãe e filha.
    const e = evidenciaDeMesmaPessoa(
      { nome: "Ana Luiza", telefone: "(62) 8158-4015" },
      { nome: "Ana Luiza", telefone: "+5562981584015" },
    );
    expect(e?.forca).toBe("provavel");
    expect(podeTratarComoMesmaPessoa(e)).toBe(false);
    expect(e?.motivo).toMatch(/família/);
  });

  it("nome igual nunca funde sozinho, mas P29 (26/09/2026) passou a exigir confirmação humana em vez de ignorar em silêncio", () => {
    // Fundir duas pessoas diferentes é pior que deixar duas fichas separadas —
    // "provavel" nunca funde sozinho (podeTratarComoMesmaPessoa exige
    // "confirmado"); decisão da Proprietária foi só parar de tratar nome
    // exato como pista invisível (apenas_indicio, que nem chegava a
    // decidirClienteDoHandoff) e passar a perguntar, como já fazia com
    // telefone.
    const e = evidenciaDeMesmaPessoa({ nome: "Ana Luiza" }, { nome: "Ana Luiza" });
    expect(e?.forca).toBe("provavel");
    expect(podeTratarComoMesmaPessoa(e)).toBe(false);
  });

  it("o e-mail vence o nome divergente", () => {
    const e = evidenciaDeMesmaPessoa(
      { nome: "Ana Luiza Gomes Silveira Rodrigues", email: "x@y.com" },
      { nome: "A. L. G. S. Rodrigues", email: "x@y.com" },
    );
    expect(e?.forca).toBe("confirmado");
  });

  it("sem nada em comum devolve null, que é resposta", () => {
    expect(
      evidenciaDeMesmaPessoa({ nome: "Ana", email: "a@a.com" }, { nome: "João", email: "j@j.com" }),
    ).toBeNull();
  });

  it("CPF idêntico confirma, mesmo com nomes e e-mails diferentes", () => {
    const e = evidenciaDeMesmaPessoa(
      { nome: "Ana Luiza", cpf: "123.456.789-01", email: "a@a.com" },
      { nome: "A. L. G. S. Rodrigues", cpf: "12345678901", email: "b@b.com" },
    );
    expect(e?.forca).toBe("confirmado");
    expect(e?.motivo).toBe("mesmo CPF");
    expect(podeTratarComoMesmaPessoa(e)).toBe(true);
  });

  it("CPF é checado antes do e-mail — não muda o resultado quando os dois confirmam, mas é o sinal mais forte disponível", () => {
    const e = evidenciaDeMesmaPessoa(
      { nome: "Ana Luiza", cpf: "12345678901", email: "a@a.com" },
      { nome: "Ana Luiza", cpf: "99999999999", email: "a@a.com" },
    );
    // CPF diverge — mas o e-mail idêntico ainda confirma (nenhum sinal vira
    // bloqueio; divergência de CPF aqui não é perseguida por este teste,
    // é responsabilidade de reconciliação de dado, não desta função).
    expect(e?.forca).toBe("confirmado");
  });

  it("o lead-fixture da Ana Luiza não casa com a cliente real", () => {
    // O lead "Ana Luiza (dado de teste)" não tem e-mail nem telefone. Só o
    // nome bate — e nome não é vínculo. É exatamente o caso do banco hoje.
    const e = evidenciaDeMesmaPessoa(
      { nome: "Ana Luiza (dado de teste)", email: null, telefone: null },
      {
        nome: "Ana Luiza Gomes Silveira Rodrigues",
        email: "analuizabox@gmail.com ",
        telefone: "(62) 8158-4015",
      },
    );
    expect(e).toBeNull();
  });
});

describe("a linha do tempo da pessoa", () => {
  const entradas = [
    {
      casoCodigo: "CA-CID-AT-FAM-2026-001",
      casoTitulo: "Projeto familiar — Ana Luiza",
      eventos: [
        { occurred_at: "2026-08-14", title: "Confirmação formal", phase: "Formalização", bloqueio: false },
        { occurred_at: "2026-08-10", title: "Discovery familiar realizado", phase: "Discovery" },
        { occurred_at: "2026-08-20", title: "Preparação contratual", bloqueio: true, alerta: "NO_GO" },
      ],
    },
    {
      casoCodigo: "CA-OUTRO-2026-002",
      casoTitulo: "Segundo processo",
      eventos: [{ occurred_at: "2026-08-16", title: "Abertura do segundo caso" }],
    },
  ];

  it("junta os casos numa história só, em ordem", () => {
    const l = montarLinhaDoTempoDaPessoa(entradas);
    expect(l.eventos.map((e) => e.titulo)).toEqual([
      "Discovery familiar realizado",
      "Confirmação formal",
      "Abertura do segundo caso",
      "Preparação contratual",
    ]);
  });

  it("cada evento continua sabendo de que caso veio", () => {
    const l = montarLinhaDoTempoDaPessoa(entradas);
    const segundo = l.eventos.find((e) => e.titulo === "Abertura do segundo caso");
    expect(segundo?.casoCodigo).toBe("CA-OUTRO-2026-002");
  });

  it("informa o período e quantos casos alimentam a linha", () => {
    const l = montarLinhaDoTempoDaPessoa(entradas);
    expect(l.de?.slice(0, 10)).toBe("2026-08-10");
    expect(l.ate?.slice(0, 10)).toBe("2026-08-20");
    expect(l.casos).toBe(2);
  });

  it("preserva bloqueio e alerta", () => {
    const l = montarLinhaDoTempoDaPessoa(entradas);
    const ultimo = l.eventos[l.eventos.length - 1];
    expect(ultimo.bloqueio).toBe(true);
    expect(ultimo.alerta).toBe("NO_GO");
  });

  it("conta o evento sem data em vez de sumir com ele", () => {
    const l = montarLinhaDoTempoDaPessoa([
      { casoCodigo: "X", casoTitulo: "X", eventos: [{ title: "Sem data nenhuma" }] },
    ]);
    expect(l.eventos).toHaveLength(0);
    expect(l.semData).toBe(1);
  });

  it("cai para created_at quando não há occurred_at", () => {
    const l = montarLinhaDoTempoDaPessoa([
      { casoCodigo: "X", casoTitulo: "X", eventos: [{ created_at: "2026-08-05", title: "Registrado" }] },
    ]);
    expect(l.eventos[0].quando.slice(0, 10)).toBe("2026-08-05");
  });

  it("não quebra sem caso nenhum", () => {
    const l = montarLinhaDoTempoDaPessoa([]);
    expect(l.eventos).toEqual([]);
    expect(l.de).toBeNull();
  });
});
