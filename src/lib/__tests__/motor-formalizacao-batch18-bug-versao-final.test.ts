import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// Auditoria de Formalização/Jurídico, batch 18 (Alta) — bug real encontrado
// em contrato-parametros.$id.tsx: "Gerar versão final" chamava gerarPrevia,
// que SEMPRE grava estado "rascunho_editavel" (nunca congela nada), embora o
// toast dissesse "congelada". Corrigido para usar congelarPrevia (mesma
// função já usada por casos.$caseId.contrato.preparar.tsx para "Congelar
// versão final"), que de fato grava um snapshot imutável e já registra
// histórico (registrarTimelineCaso).

const rota = readFileSync("src/routes/_authenticated/contrato-parametros.$id.tsx", "utf8");
const parametrosFn = readFileSync("src/lib/contrato-parametros.functions.ts", "utf8");

describe("contrato-parametros.$id.tsx — Gerar versão final usa congelarPrevia, não gerarPrevia", () => {
  it("importa e instancia congelarPrevia", () => {
    expect(rota).toContain("congelarPrevia,");
    expect(rota).toContain("const congelar = useServerFn(congelarPrevia);");
  });

  it("mCongelar chama o serviço de congelamento com evento aprovacao", () => {
    expect(rota).toContain('mutationFn: (v: { evento: "aprovacao"; motivo: string }) => congelar({ data: { id, ...v } })');
    expect(rota).toContain('onConfirmar={(motivo) => mCongelar.mutate({ evento: "aprovacao", motivo })}');
  });

  it('"Gerar versão final" está em AcaoOperacional com acaoExterna e não é mais um botão cru chamando mGerar("final")', () => {
    expect(rota).toContain('acaoExterna="congelar_versao_final_parametros"');
    expect(rota).not.toContain('mGerar.mutate("final")');
  });

  it("mGerar (rascunho) não recebe mais argumento de tipo — gerarPrevia é só para rascunho aqui", () => {
    expect(rota).toContain('mutationFn: () => gerar({ data: { id, tipo: "rascunho" } })');
    expect(rota).not.toContain('mGerar.mutate("rascunho")');
    expect(rota).toContain("onClick={() => mGerar.mutate()}");
  });
});

describe("contrato-parametros.functions.ts — confirma o bug em gerarPrevia (documentado, não corrigido nesta função)", () => {
  it("gerarPrevia sempre grava estado rascunho_editavel/tipo rascunho, mesmo quando data.tipo é final", () => {
    const trecho = parametrosFn.slice(
      parametrosFn.indexOf("export const gerarPrevia"),
      parametrosFn.indexOf("export const congelarPrevia"),
    );
    expect(trecho).toContain('estado: "rascunho_editavel"');
    expect(trecho).not.toContain('estado: "congelado"');
  });

  it("congelarPrevia (agora usada pela tela) já registra histórico do caso", () => {
    const trecho = parametrosFn.slice(parametrosFn.indexOf("export const congelarPrevia"));
    expect(trecho).toContain("registrarTimelineCaso(supabase, {");
  });
});
