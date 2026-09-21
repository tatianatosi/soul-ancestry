import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// Auditoria de Formalização/Jurídico, batch 19 (Média): linha-parametro.tsx
// (Bloquear), contratos.$id.tsx (Salvar rascunho / Criar tarefa),
// regra-comercial.functions.ts (histórico de exceção comercial) e
// contratos.functions.ts::salvarOrdemServico (histórico ao ativar OS).

const linhaParametro = readFileSync("src/components/contrato/linha-parametro.tsx", "utf8");
const contratosId = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");
const regraComercialFn = readFileSync("src/lib/regra-comercial.functions.ts", "utf8");
const contratosFn = readFileSync("src/lib/contratos.functions.ts", "utf8");

describe("linha-parametro.tsx — Bloquear exige motivo via AcaoOperacional", () => {
  it("usa AcaoOperacional com acaoExterna", () => {
    expect(linhaParametro).toContain('acaoExterna="bloquear_parametro_contratual"');
    expect(linhaParametro).toContain('onConfirmar={(motivo) => mStatus.mutate({ status: "bloqueado", motivo })}');
  });

  it("Confirmar (validado) continua botão simples, sem motivo obrigatório", () => {
    expect(linhaParametro).toContain('onClick={() => mStatus.mutate({ status: "validado" })}');
  });
});

describe("contratos.$id.tsx — sem prompt()/window.prompt() nativo restante", () => {
  it("não usa mais prompt() para resumo de versão nem título de tarefa", () => {
    expect(contratosId).not.toMatch(/[^.]prompt\(/);
    expect(contratosId).not.toContain("window.prompt(");
  });

  it("Salvar rascunho usa campo de resumo controlado por estado", () => {
    expect(contratosId).toContain("const [resumoVersao, setResumoVersao] = useState");
    expect(contratosId).toContain("mGerar.mutate((d.versoes as any[]).length ? resumoVersao : undefined)");
  });

  it("Criar tarefa usa campo de título controlado por estado", () => {
    expect(contratosId).toContain("const [tituloTarefa, setTituloTarefa] = useState");
  });
});

describe("regra-comercial.functions.ts::registrarExcecaoComercial — passou a registrar histórico", () => {
  it("chama registrarTimelineCaso após aprovar a exceção", () => {
    const trecho = regraComercialFn.slice(regraComercialFn.indexOf("export const registrarExcecaoComercial"));
    expect(trecho).toContain("registrarTimelineCaso(supabase, {");
  });
});

describe("contratos.functions.ts::salvarOrdemServico — histórico ao ativar OS", () => {
  it("registra evento de timeline quando status vira active e há case_id", () => {
    const trecho = contratosFn.slice(
      contratosFn.indexOf("export const salvarOrdemServico"),
      contratosFn.indexOf("export const criarExcecao"),
    );
    expect(trecho).toContain('data.status === "active" && linhaAtualizada.case_id');
    expect(trecho).toContain("registrarTimelineCaso(supabase, {");
  });
});
