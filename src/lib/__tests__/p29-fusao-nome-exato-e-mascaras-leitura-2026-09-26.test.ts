import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { evidenciaDeMesmaPessoa, podeTratarComoMesmaPessoa } from "@/lib/pessoa-identidade";
import { decidirClienteDoHandoff } from "@/lib/handoff-discovery";

// P29 (26/09/2026) — decisão explícita da Proprietária: "Pode fundir caso seja nome exato".
// Antes, nome idêntico caía na camada mais fraca (apenas_indicio) — camada que
// decidirClienteDoHandoff nem chegava a tratar como pendência, então um lead com nome
// IDÊNTICO a um cliente já cadastrado virava cliente novo duplicado, em silêncio. Subiu para
// "provavel" (mesma camada de telefone) — nunca funde sozinho, mas agora sempre pergunta.

describe("P29 — nome exato sobe de apenas_indicio para provavel, nunca vira confirmado", () => {
  it("nome idêntico é 'provavel', não mais invisível", () => {
    const e = evidenciaDeMesmaPessoa({ nome: "Fulano de Homologação" }, { nome: "Fulano de Homologação" });
    expect(e?.forca).toBe("provavel");
  });

  it("mesmo assim nunca funde sozinho — só confirmado funde sem pergunta", () => {
    const e = evidenciaDeMesmaPessoa({ nome: "Fulano de Homologação" }, { nome: "Fulano de Homologação" });
    expect(podeTratarComoMesmaPessoa(e)).toBe(false);
  });

  it("CPF/e-mail continuam sendo a única evidência que funde sem pergunta", () => {
    const porCpf = evidenciaDeMesmaPessoa({ cpf: "11144477735" }, { cpf: "111.444.777-35" });
    expect(porCpf?.forca).toBe("confirmado");
    expect(podeTratarComoMesmaPessoa(porCpf)).toBe(true);
  });

  it("nome exato normalizado (acento/maiúscula) também conta — mesma regra de normalizarNome", () => {
    const e = evidenciaDeMesmaPessoa({ nome: "JOÃO da Silva" }, { nome: "joao da silva" });
    expect(e?.forca).toBe("provavel");
  });

  it("nomes diferentes não geram evidência nenhuma", () => {
    expect(evidenciaDeMesmaPessoa({ nome: "Fulano" }, { nome: "Beltrano" })).toBeNull();
  });
});

describe("P29 — decidirClienteDoHandoff não cria mais duplicata silenciosa quando o nome bate", () => {
  it("nome exato sem outro elo agora pede confirmação, nunca cria cliente novo em silêncio", () => {
    const d = decidirClienteDoHandoff(
      { nome: "Fulano de Homologação" },
      [{ id: "hml-1", nome: "Fulano de Homologação" }],
    );
    expect(d.acao).toBe("confirmar");
  });

  it("dois clientes com o mesmo nome continuam pedindo escolha manual (ambiguidade, não fusão automática)", () => {
    const d = decidirClienteDoHandoff(
      { nome: "Fulano de Homologação" },
      [
        { id: "hml-1", nome: "Fulano de Homologação" },
        { id: "hml-2", nome: "Fulano de Homologação" },
      ],
    );
    expect(d.acao).toBe("confirmar");
    if (d.acao === "confirmar") expect(d.candidatos.length).toBe(2);
  });
});

describe("P29 — Pessoa 360: leitura de CPF/telefone volta a usar a mesma máscara do modo Editar", () => {
  const pagina = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

  it("CPF e telefone em modo leitura chamam formatarCpf/formatarTelefone, não o valor cru", () => {
    expect(pagina).toContain("formatarTelefone(String(cliente.telefone))");
    expect(pagina).toContain("formatarCpf(String(cliente.cpf))");
  });
});
