import { describe, expect, it } from "vitest";

import {
  UFS_BRASIL,
  cepValido,
  cpfValido,
  emailValido,
  formatarCep,
  formatarCpf,
  formatarTelefone,
  rgOrgaoUfValido,
  telefoneValido,
  ufValida,
} from "@/lib/validacao-pessoa";

describe("formatarCpf", () => {
  it("aplica a máscara progressivamente", () => {
    expect(formatarCpf("123")).toBe("123");
    expect(formatarCpf("123456")).toBe("123.456");
    expect(formatarCpf("123456789")).toBe("123.456.789");
    expect(formatarCpf("12345678900")).toBe("123.456.789-00");
  });

  it("ignora caracteres não numéricos e trunca em 11 dígitos", () => {
    expect(formatarCpf("123.456.789-00extra")).toBe("123.456.789-00");
  });
});

describe("cpfValido", () => {
  it("aceita um CPF com dígito verificador correto", () => {
    expect(cpfValido("111.444.777-35")).toBe(true);
  });

  it("rejeita dígito verificador incorreto", () => {
    expect(cpfValido("111.444.777-36")).toBe(false);
  });

  it("rejeita sequência repetida", () => {
    expect(cpfValido("111.111.111-11")).toBe(false);
  });

  it("rejeita tamanho incorreto", () => {
    expect(cpfValido("123")).toBe(false);
  });
});

describe("formatarCep / cepValido", () => {
  it("aplica a máscara 00000-000", () => {
    expect(formatarCep("01525001")).toBe("01525-001");
    expect(formatarCep("01525")).toBe("01525");
  });

  it("valida 8 dígitos", () => {
    expect(cepValido("01525-001")).toBe(true);
    expect(cepValido("01525")).toBe(false);
  });
});

describe("UFS_BRASIL / ufValida", () => {
  it("tem as 26 unidades federativas mais o Distrito Federal", () => {
    expect(UFS_BRASIL).toHaveLength(27);
  });

  it("valida sigla existente, ignorando caixa e espaços", () => {
    expect(ufValida("sp")).toBe(true);
    expect(ufValida(" GO ")).toBe(true);
  });

  it("rejeita sigla inventada ou nome por extenso", () => {
    expect(ufValida("XX")).toBe(false);
    expect(ufValida("São Paulo")).toBe(false);
  });
});

describe("formatarTelefone / telefoneValido — Brasil", () => {
  it("aplica máscara de celular com DDD", () => {
    expect(formatarTelefone("62981584015")).toBe("(62) 98158-4015");
  });

  it("aplica máscara de fixo com DDD", () => {
    expect(formatarTelefone("1132906259")).toBe("(11) 3290-6259");
  });

  it("valida 10 ou 11 dígitos, rejeita o resto", () => {
    expect(telefoneValido("(62) 98158-4015")).toBe(true);
    expect(telefoneValido("(11) 3290-6259")).toBe(true);
    expect(telefoneValido("123")).toBe(false);
  });
});

describe("formatarTelefone / telefoneValido — exterior", () => {
  it("preserva o DDI explícito sem impor DDD brasileiro", () => {
    expect(formatarTelefone("+1 205 555 0134", "exterior")).toBe("+12055550134");
  });

  it("valida por quantidade mínima de dígitos, não por DDD", () => {
    expect(telefoneValido("+43 664 1234567", "exterior")).toBe(true);
    expect(telefoneValido("123", "exterior")).toBe(false);
  });

  it("detecta exterior sozinho pelo + inicial, sem seletor de país", () => {
    expect(formatarTelefone("+43 664 1234567")).toBe("+436641234567");
    expect(telefoneValido("+43 664 1234567")).toBe(true);
  });

  it("sem +, mesmo campo continua tratando como Brasil", () => {
    expect(formatarTelefone("62981584015")).toBe("(62) 98158-4015");
  });
});

describe("emailValido (P31, 26/09/2026)", () => {
  it("aceita formato algo@dominio.tld", () => {
    expect(emailValido("tati@pluggedresearch.com")).toBe(true);
    expect(emailValido("  ana.luiza@clubeancestral.com.br ")).toBe(true);
  });

  it("rejeita sem @ ou sem domínio", () => {
    expect(emailValido("tati.pluggedresearch.com")).toBe(false);
    expect(emailValido("tati@")).toBe(false);
    expect(emailValido("")).toBe(false);
  });
});

describe("rgOrgaoUfValido (P31, 26/09/2026)", () => {
  it("aceita vazio (campo opcional)", () => {
    expect(rgOrgaoUfValido("")).toBe(true);
    expect(rgOrgaoUfValido("   ")).toBe(true);
  });

  it("aceita UF real separada por /, - ou espaço", () => {
    expect(rgOrgaoUfValido("SSP/SP")).toBe(true);
    expect(rgOrgaoUfValido("SSP-MT")).toBe(true);
    expect(rgOrgaoUfValido("SESP SP")).toBe(true);
  });

  it("rejeita UF inventada no mesmo formato", () => {
    expect(rgOrgaoUfValido("SSP/XX")).toBe(false);
  });

  it("não confunde o fim de uma palavra do nome do órgão com uma UF", () => {
    // "...Pública" termina em minúsculas — nunca é lido como sigla de UF.
    expect(rgOrgaoUfValido("Secretaria de Segurança Pública")).toBe(true);
  });

  it("órgão sem UF reconhecível não é erro (ex.: RG estrangeiro)", () => {
    expect(rgOrgaoUfValido("Polizia di Stato")).toBe(true);
  });
});
