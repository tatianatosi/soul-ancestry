import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/*
 * CA20-PESQUISA-VIVA (09/09/2026) + macro 11/09/2026 —
 * o card "Pesquisa/entregas" do Caso 360 resume evidências/comprovadas/
 * pendências/achados com a mesma fonte de /pesquisa-evidencias/$caseId.
 * Não embute muro de 7 links nem conclui cidadania/linhagem.
 * Uma única ponte para a superfície dona de Pesquisa.
 */

const arquivo = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
const superficie = readFileSync("src/lib/caso-360-superficie.ts", "utf8");

describe("CA20 — Caso 360 resume Pesquisa (macro, sem muro)", () => {
  it("importa e usa cadeiaPesquisaDoCaso (não cria leitura nova/paralela)", () => {
    expect(arquivo).toContain('import { cadeiaPesquisaDoCaso } from "@/lib/pesquisa-cadeia.functions"');
    expect(arquivo).toContain("useServerFn(cadeiaPesquisaDoCaso)");
  });

  it("a mesma função já é usada por /pesquisa-evidencias/$caseId (fonte compartilhada)", () => {
    const pesquisaEvidencias = readFileSync(
      "src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx",
      "utf8",
    );
    expect(pesquisaEvidencias).toContain("cadeiaPesquisaDoCaso");
  });

  it("o card Pesquisa/entregas calcula evidências, comprovadas, pendências abertas e achados", () => {
    const bloco = arquivo.slice(
      arquivo.indexOf("Pesquisa/entregas"),
      arquivo.indexOf("Pesquisa/entregas") + 1600,
    );
    expect(bloco).toContain("qPesquisa.isLoading");
    expect(bloco).toContain("qPesquisa.isError");
    expect(bloco).toContain("STATUS_EVIDENCIA_COMPROVADA_RESUMO");
    expect(bloco).toContain('p.status !== "resolvido"');
    expect(bloco).toContain("achados");
  });

  it('contagem comprovada usa só status do CHECK vigente ("aprovada_para_entrega")', () => {
    expect(superficie).toContain('STATUS_EVIDENCIA_COMPROVADA_RESUMO = "aprovada_para_entrega"');
    expect(arquivo).not.toContain('workflow_status === "validada_internamente"');
  });

  it("não introduz conclusão automática de cidadania/linhagem", () => {
    const bloco = arquivo.slice(
      arquivo.indexOf("Pesquisa/entregas"),
      arquivo.indexOf("Pesquisa/entregas") + 1600,
    );
    expect(bloco).not.toMatch(/cidadania (confirmada|reconhecida|aprovada)/i);
    expect(bloco).not.toMatch(/linhagem (confirmada|comprovada)/i);
  });

  it("remove o muro de 7 links — uma única ponte para a superfície dona", () => {
    const bloco = arquivo.slice(
      arquivo.indexOf("Pesquisa/entregas"),
      arquivo.indexOf("Pesquisa/entregas") + 1800,
    );
    expect(bloco).toContain("Abrir Pesquisa deste caso");
    expect(bloco).toContain("PONTE_PESQUISA_CASO");
    for (const rota of [
      "/achados/$caseId",
      "/biblioteca-evidencias/$caseId",
      "/pessoas-linhagens/$caseId",
      "/plano-acao/$caseId",
      "/relatorios-fase/$caseId",
      "/fontes-genealogicas",
    ]) {
      expect(bloco, `muro ainda aponta para ${rota}`).not.toContain(rota);
    }
  });

  it("a query usa o mesmo id do caso e retry: false como as demais da ficha", () => {
    const bloco = arquivo.slice(
      arquivo.indexOf("const qPesquisa = useQuery"),
      arquivo.indexOf("const qPesquisa = useQuery") + 220,
    );
    expect(bloco).toContain('queryKey: ["ficha-caso-pesquisa", id]');
    expect(bloco).toContain("caseId: id");
    expect(bloco).toContain("retry: false");
  });
});
