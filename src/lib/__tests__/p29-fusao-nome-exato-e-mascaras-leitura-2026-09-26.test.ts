import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { evidenciaDeMesmaPessoa, podeTratarComoMesmaPessoa } from "@/lib/pessoa-identidade";
import { decidirClienteDoHandoff } from "@/lib/handoff-discovery";

// P29→P30 (26/09/2026) — decisão explícita e REITERADA da Proprietária: "Pode fundir caso seja
// nome exato" / "homônimos irão sempre existir na face da terra". Nome idêntico normalizado
// funde automaticamente como CPF/e-mail (forca "confirmado") quando há exatamente um candidato
// com aquele nome na organização. Ambiguidade real (2+ candidatos com o mesmo nome — duas
// pessoas, não uma) continua caindo em "confirmar", a mesma regra que já protegia CPF/e-mail.

describe("P30 — nome exato funde como CPF/e-mail (decisão explícita e reiterada da Proprietária)", () => {
  it("nome idêntico é 'confirmado' — funde sozinho quando há um único candidato", () => {
    const e = evidenciaDeMesmaPessoa({ nome: "Fulano de Homologação" }, { nome: "Fulano de Homologação" });
    expect(e?.forca).toBe("confirmado");
    expect(podeTratarComoMesmaPessoa(e)).toBe(true);
  });

  it("nome exato normalizado (acento/maiúscula) também conta — mesma regra de normalizarNome", () => {
    const e = evidenciaDeMesmaPessoa({ nome: "JOÃO da Silva" }, { nome: "joao da silva" });
    expect(e?.forca).toBe("confirmado");
  });

  it("nomes diferentes não geram evidência nenhuma", () => {
    expect(evidenciaDeMesmaPessoa({ nome: "Fulano" }, { nome: "Beltrano" })).toBeNull();
  });

  it("CPF e e-mail continuam fundindo sozinhos, no mesmo nível — nada mudou para eles", () => {
    const porCpf = evidenciaDeMesmaPessoa({ cpf: "11144477735" }, { cpf: "111.444.777-35" });
    expect(porCpf?.forca).toBe("confirmado");
    const porEmail = evidenciaDeMesmaPessoa({ email: "a@b.com " }, { email: "A@B.COM" });
    expect(porEmail?.forca).toBe("confirmado");
  });

  it("telefone continua exigindo confirmação — família compartilha número, nome não é o mesmo caso", () => {
    const e = evidenciaDeMesmaPessoa({ telefone: "+5562981584015" }, { telefone: "5562981584015" });
    expect(e?.forca).toBe("provavel");
    expect(podeTratarComoMesmaPessoa(e)).toBe(false);
  });
});

describe("P30 — decidirClienteDoHandoff funde automaticamente por nome exato com um único candidato", () => {
  it("nome exato sem outro elo funde sozinho quando há exatamente um candidato — fecha o vazamento de duplicata silenciosa", () => {
    const d = decidirClienteDoHandoff(
      { nome: "Fulano de Homologação" },
      [{ id: "hml-1", nome: "Fulano de Homologação" }],
    );
    expect(d).toMatchObject({ acao: "reusar", clienteId: "hml-1" });
  });

  it("dois clientes com o mesmo nome continuam pedindo escolha manual — ambiguidade real, nunca ao acaso", () => {
    const d = decidirClienteDoHandoff(
      { nome: "Fulano de Homologação" },
      [
        { id: "hml-1", nome: "Fulano de Homologação" },
        { id: "hml-2", nome: "Fulano de Homologação" },
      ],
    );
    expect(d.acao).toBe("confirmar");
    if (d.acao === "confirmar") expect(d.candidatos.map((c) => c.id).sort()).toEqual(["hml-1", "hml-2"]);
  });
});

describe("P29 — Pessoa 360: leitura de CPF/telefone volta a usar a mesma máscara do modo Editar", () => {
  const pagina = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

  it("CPF e telefone em modo leitura chamam formatarCpf/formatarTelefone, não o valor cru", () => {
    expect(pagina).toContain("formatarTelefone(String(cliente.telefone))");
    expect(pagina).toContain("formatarCpf(String(cliente.cpf))");
  });
});
