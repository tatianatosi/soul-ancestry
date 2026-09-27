import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { evidenciaDeMesmaPessoa, podeTratarComoMesmaPessoa } from "@/lib/pessoa-identidade";
import { decidirClienteDoHandoff } from "@/lib/handoff-discovery";

// P29→P30 (26/09/2026, REVOGADO na Fase 0 do "Prompt Canônicos", 27/09/2026)
// — P30 tratava nome exato normalizado como "confirmado" (fusão automática
// com um único candidato). A Proprietária autorizou explicitamente revogar
// isso: "nome exato nunca é suficiente para fundir Pessoa, Lead, Contato,
// Membro de Caso ou Perfil Genealógico". Nome agora tem a MESMA força que
// telefone ("provavel") — sempre exige confirmação humana. CPF e e-mail
// não foram tocados pela revogação.

describe("Fase 0 — nome exato é só sinal de possível duplicidade (P30 revogado)", () => {
  it("nome idêntico é 'provavel', nunca 'confirmado' — nunca funde sozinho", () => {
    const e = evidenciaDeMesmaPessoa({ nome: "Fulano de Homologação" }, { nome: "Fulano de Homologação" });
    expect(e?.forca).toBe("provavel");
    expect(podeTratarComoMesmaPessoa(e)).toBe(false);
  });

  it("nome exato normalizado (acento/maiúscula) também vira só sinal — mesma regra de normalizarNome", () => {
    const e = evidenciaDeMesmaPessoa({ nome: "JOÃO da Silva" }, { nome: "joao da silva" });
    expect(e?.forca).toBe("provavel");
  });

  it("nomes diferentes não geram evidência nenhuma", () => {
    expect(evidenciaDeMesmaPessoa({ nome: "Fulano" }, { nome: "Beltrano" })).toBeNull();
  });

  it("CPF e e-mail continuam fundindo sozinhos, no mesmo nível — a revogação é só do nome", () => {
    const porCpf = evidenciaDeMesmaPessoa({ cpf: "11144477735" }, { cpf: "111.444.777-35" });
    expect(porCpf?.forca).toBe("confirmado");
    const porEmail = evidenciaDeMesmaPessoa({ email: "a@b.com " }, { email: "A@B.COM" });
    expect(porEmail?.forca).toBe("confirmado");
  });

  it("telefone continua exigindo confirmação — mesmo nível que o nome agora, nunca 'confirmado'", () => {
    const e = evidenciaDeMesmaPessoa({ telefone: "+5562981584015" }, { telefone: "5562981584015" });
    expect(e?.forca).toBe("provavel");
    expect(podeTratarComoMesmaPessoa(e)).toBe(false);
  });
});

describe("Fase 0 — decidirClienteDoHandoff nunca funde automaticamente só por nome", () => {
  it("nome exato sem outro elo, mesmo com um único candidato, sempre pede confirmação humana", () => {
    const d = decidirClienteDoHandoff(
      { nome: "Fulano de Homologação" },
      [{ id: "hml-1", nome: "Fulano de Homologação" }],
    );
    expect(d.acao).toBe("confirmar");
    if (d.acao === "confirmar") expect(d.candidatos.map((c) => c.id)).toEqual(["hml-1"]);
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
