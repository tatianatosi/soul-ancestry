import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import type { InstanciaPersistida } from "@/lib/anexos-instancia";
import { montarTresCamadasDoCaso } from "@/lib/anexos-tres-camadas-caso";

const inst = (over: Partial<InstanciaPersistida>): InstanciaPersistida => ({
  annex_code: "ANEXO_I_ORDEM_SERVICO",
  title: "Anexo I",
  status: "ready",
  annex_version: 1,
  model_version: "ANEXO-I-ORDEM-DE-SERVICO-v1.0",
  file_hash: "abc",
  tem_conteudo: true,
  atualizado_em: "2026-10-30T10:00:00Z",
  is_test: false,
  ...over,
});

describe("três camadas dos anexos I–V por caso (31/10/2026)", () => {
  it("caso sem nenhuma linha: tudo 'sem registro', nada herdado de outro caso", () => {
    const r = montarTresCamadasDoCaso([]);
    expect(r.totalInstancias).toBe(0);
    expect(r.linhas).toHaveLength(5);
    for (const l of r.linhas) {
      expect(l.tecnica.presente).toBe(false);
      expect(l.situacaoDoCaso).toBe("ausente");
      expect(l.estados).toContain("INSTANCIA_DO_CASO_AUSENTE");
      expect(l.estados).not.toContain("TECNICAMENTE_EXISTE");
      expect(l.estados).not.toContain("PRONTO_PARA_PREVIA_INTERNA");
    }
  });

  it("instância com conteúdo e status resolvido: presente, pronta para prévia interna", () => {
    const r = montarTresCamadasDoCaso([inst({})]);
    const l = r.linhas.find((x) => x.codigo === "ANEXO_I")!;
    expect(l.situacaoDoCaso).toBe("presente");
    expect(l.parametrosAusentes).toEqual([]);
    expect(l.estados).toEqual(
      expect.arrayContaining(["TECNICAMENTE_EXISTE", "PRONTO_PARA_PREVIA_INTERNA"]),
    );
    expect(l.tecnica).toMatchObject({
      versao: 1,
      temHash: true,
      temConteudo: true,
      ehTeste: false,
    });
  });

  it("status 'missing' ou sem conteúdo: parcial, e os parâmetros pendentes aparecem", () => {
    const r = montarTresCamadasDoCaso([
      inst({ annex_code: "ANEXO_II_DESPESAS_EXTERNAS", status: "missing", tem_conteudo: false }),
    ]);
    const l = r.linhas.find((x) => x.codigo === "ANEXO_II")!;
    expect(l.situacaoDoCaso).toBe("parcial");
    expect(l.estados).toContain("INSTANCIA_DO_CASO_PARCIAL");
    expect(l.estados).not.toContain("PRONTO_PARA_PREVIA_INTERNA");
    expect(l.parametrosAusentes.length).toBeGreaterThan(0);
  });

  it("modelo jurídico não localizado (II, IV, V) continua nomeado, independente do caso", () => {
    const r = montarTresCamadasDoCaso([]);
    const sem = r.linhas
      .filter((l) => l.estados.includes("MODELO_JURIDICO_NAO_LOCALIZADO"))
      .map((l) => l.codigo);
    expect(sem).toEqual(["ANEXO_II", "ANEXO_IV", "ANEXO_V"]);
  });

  it("usa a versão mais recente e lista anexos fora de I–V sem inferir nada deles", () => {
    const r = montarTresCamadasDoCaso([
      inst({ annex_version: 1, status: "missing", tem_conteudo: false }),
      inst({ annex_version: 2 }),
      inst({ annex_code: "ANX-ESCOPO", status: "ready" }),
    ]);
    const a1 = r.linhas.find((l) => l.codigo === "ANEXO_I")!;
    expect(a1.tecnica.versao).toBe(2);
    expect(a1.situacaoDoCaso).toBe("presente");
    expect(r.outrosAnexos).toEqual([{ annexCode: "ANX-ESCOPO", status: "ready" }]);
  });

  it("marca instância de teste", () => {
    const r = montarTresCamadasDoCaso([inst({ is_test: true })]);
    expect(r.linhas[0]!.tecnica.ehTeste).toBe(true);
  });
});

describe("montagem do painel na preparação do contrato", () => {
  const preparar = readFileSync(
    "src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx",
    "utf8",
  );
  const painel = readFileSync("src/components/governanca/anexos-tres-camadas.tsx", "utf8");

  it("a tela de preparar monta o painel com as instâncias do caso aberto", () => {
    expect(preparar).toContain(
      'import { AnexosTresCamadasPainel } from "@/components/governanca/anexos-tres-camadas"',
    );
    expect(preparar).toMatch(/<AnexosTresCamadasPainel[\s\S]*instancias=\{qi\.data\}/);
  });

  it("o painel não carrega dado de família fixo nem o quadro estático da Ana", () => {
    expect(painel).not.toMatch(/QUADRO_ANA|EVIDENCIA_CONTRACT_ANNEXES|Ana Luiza|CASO_ANA/);
    expect(painel).toContain("montarTresCamadasDoCaso");
  });

  it("somente leitura: sem mutação nem ação externa", () => {
    expect(painel).not.toMatch(/useMutation|onConfirmar|AcaoOperacional/);
  });
});
