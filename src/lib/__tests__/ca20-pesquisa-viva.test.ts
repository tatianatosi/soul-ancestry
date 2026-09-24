import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/*
 * CA20-PESQUISA-VIVA (09/09/2026) — o card "Pesquisa/entregas" do Caso 360
 * só linkava para 7 telas, sem resumir nada. Passa a mostrar um resumo real
 * (evidências, comprovadas, pendências/lacunas abertas, achados) lendo
 * `cadeiaPesquisaDoCaso`, a mesma função que já alimenta
 * /pesquisa-evidencias/$caseId — Caso 360 resume, não copia a base inteira
 * nem conclui cidadania/linhagem sozinho.
 */

const arquivo = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("CA20 — Caso 360 resume Pesquisa com a mesma fonte de /pesquisa-evidencias/$caseId", () => {
  it("importa e usa cadeiaPesquisaDoCaso (não cria leitura nova/paralela)", () => {
    expect(arquivo).toContain('import { cadeiaPesquisaDoCaso } from "@/lib/pesquisa-cadeia.functions"');
    expect(arquivo).toContain("useServerFn(cadeiaPesquisaDoCaso)");
  });

  it("a mesma função já é usada por /pesquisa-evidencias/$caseId (fonte compartilhada, não duplicada)", () => {
    const pesquisaEvidencias = readFileSync("src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx", "utf8");
    expect(pesquisaEvidencias).toContain("cadeiaPesquisaDoCaso");
  });

  it("o card Pesquisa/entregas calcula estado do dossiê, pendências abertas e achados", () => {
    /*
      22/09/2026: o bloco cresceu com §14 linha 6 (Estado do dossiê:
      Confirmados/Em revisão/Pendentes; donut; reconciliar). A slice foi
      ampliada para 3200 chars para caber o donut, e a asserção passou a
      travar o novo contrato canônico (estadoDossieDoCaso) — que é
      superset de evidenciaComprovada e sustenta a mesma leitura.
    */
    const bloco = arquivo.slice(arquivo.indexOf("Pesquisa/entregas"), arquivo.indexOf("Pesquisa/entregas") + 3200);
    expect(bloco).toContain("qPesquisa.isLoading");
    expect(bloco).toContain("qPesquisa.isError");
    expect(bloco).toContain("estadoDossieDoCaso(evidencias)");
    expect(bloco).toContain('p.status !== "resolvido"');
    expect(bloco).toContain("achados");
  });

  it("não introduz conclusão automática de cidadania/linhagem nem lista genérica fixa", () => {
    const bloco = arquivo.slice(arquivo.indexOf("Pesquisa/entregas"), arquivo.indexOf("Pesquisa/entregas") + 3200);
    expect(bloco).not.toMatch(/cidadania (confirmada|reconhecida|aprovada)/i);
    expect(bloco).not.toMatch(/linhagem (confirmada|comprovada)/i);
  });

  it("mantém os 7 links pré-existentes do card (nenhum removido)", () => {
    const bloco = arquivo.slice(arquivo.indexOf("Pesquisa/entregas"), arquivo.indexOf("Pesquisa/entregas") + 12000);
    for (const rota of [
      "/achados/$caseId",
      "/biblioteca-evidencias/$caseId",
      "/pesquisa-evidencias/$caseId",
      "/pessoas-linhagens/$caseId",
      "/plano-acao/$caseId",
    ]) {
      expect(bloco).toContain(rota);
    }
  });

  it("a query usa o mesmo id do caso e não faz retry silencioso divergente das outras queries da ficha", () => {
    const bloco = arquivo.slice(arquivo.indexOf("const qPesquisa = useQuery"), arquivo.indexOf("const qPesquisa = useQuery") + 220);
    expect(bloco).toContain('queryKey: ["ficha-caso-pesquisa", id]');
    expect(bloco).toContain("caseId: id");
    expect(bloco).toContain("retry: false");
  });
});
