import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Corte 0-bis (03/10/2026) — achado da Proprietária: o Corte 0 fechou o lado
 * do ESCRITOR (as 4 rotas gravam em `research_evidence_items`), mas sete
 * LEITORES continuaram consultando `evidences` — tabela com zero linhas e sem
 * escritor desde o Corte 1a. A Biblioteca de Evidências, o Relatório de fase e
 * a aba de Documentos mostravam lista vazia mesmo com evidência real gravada.
 *
 * Este teste prova o comportamento: o leitor canônico encontra a evidência
 * real do caso (pela ponte `research_cases.case_id`) e devolve os apelidos de
 * leitura que as telas já usam, sem inventar valor nenhum.
 */

type Linha = Record<string, any>;
const banco = vi.hoisted(() => ({ tabelas: {} as Record<string, Linha[]> }));

vi.mock("@/lib/persistencia.server", () => ({
  inserirComVerificacao: async () => ({ ok: true, id: "x", registro: {}, salvoEm: "agora" }),
  gravarComVerificacao: async () => ({ ok: true, registro: {}, salvoEm: "agora" }),
}));
vi.mock("@/lib/timeline-operacional.server", () => ({ registrarTimelineCaso: async () => {} }));

/**
 * Supabase falso que entende o filtro por tabela embutida
 * (`research_cases!inner(case_id)` + `.eq("research_cases.case_id", x)`) —
 * é exatamente o mecanismo que liga `research_evidence_items` ao caso.
 */
function supabaseFalso() {
  const consulta = (tabela: string) => {
    const filtros: [string, unknown][] = [];
    let juncao = false;
    const resolver = () => {
      let linhas = (banco.tabelas[tabela] ?? []).map((l) => {
        if (!juncao) return l;
        const pesquisa = (banco.tabelas["research_cases"] ?? []).find((p) => p.id === l.research_case_id);
        return { ...l, research_cases: pesquisa ? { case_id: pesquisa.case_id } : null };
      });
      for (const [coluna, valor] of filtros) {
        if (coluna === "research_cases.case_id") {
          linhas = linhas.filter((l) => (l["research_cases"]?.case_id ?? null) === valor);
        } else if (Array.isArray(valor)) {
          linhas = linhas.filter((l) => (valor as unknown[]).includes(l[coluna]));
        } else {
          linhas = linhas.filter((l) => (l[coluna] ?? null) === valor);
        }
      }
      return linhas;
    };
    const q: any = {
      select: (cols?: string) => {
        if (cols?.includes("research_cases!inner")) juncao = true;
        return q;
      },
      eq: (c: string, v: unknown) => (filtros.push([c, v]), q),
      is: (c: string, v: unknown) => (filtros.push([c, v]), q),
      in: (c: string, v: unknown[]) => (filtros.push([c, v]), q),
      order: async () => ({ data: resolver(), error: null }),
      maybeSingle: async () => ({ data: resolver()[0] ?? null, error: null }),
      then: (res: (v: { data: Linha[]; error: null }) => unknown) => res({ data: resolver(), error: null }),
    };
    return q;
  };
  return { from: (t: string) => consulta(t) } as any;
}

const ORG = "org-1";
const CASO = "caso-ana";

beforeEach(() => {
  banco.tabelas = {
    research_cases: [{ id: "rc-1", organization_id: ORG, case_id: CASO, archived_at: null }],
    research_evidence_items: [
      {
        id: "ev-1",
        organization_id: ORG,
        research_case_id: "rc-1",
        title: "Certidão de nascimento de Maria (1912)",
        description: "Transcrição do comune, grafia a confirmar.",
        validation_rationale: "Revisão interna pendente.",
        person_id: "pessoa-maria",
        evidence_status: "collected",
        workflow_status: "registrada",
        confidence_level: "media",
        epistemic_validation_status: "em_revisao",
        archived_at: null,
        created_at: "2026-10-01T10:00:00Z",
      },
      {
        id: "ev-arquivada",
        organization_id: ORG,
        research_case_id: "rc-1",
        title: "Registro descartado",
        description: null,
        validation_rationale: null,
        person_id: null,
        evidence_status: "discarded",
        workflow_status: "rejeitada_inaplicavel",
        confidence_level: "baixa",
        archived_at: "2026-10-02T00:00:00Z",
        created_at: "2026-09-30T10:00:00Z",
      },
    ],
    // A tabela não-canônica continua vazia: é o estado real do banco.
    evidences: [],
  };
});

describe("Corte 0-bis — leitor canônico acha a evidência real do caso", () => {
  it("lista a evidência do caso pela ponte research_cases.case_id (a tabela evidences está vazia)", async () => {
    const { listarEvidenciasCanonicasDoCaso } = await import("@/lib/evidencia-canonica.server");
    const linhas = await listarEvidenciasCanonicasDoCaso(supabaseFalso(), ORG, CASO);
    expect(linhas.map((l) => l.id)).toEqual(["ev-1"]);
    expect(banco.tabelas["evidences"]).toEqual([]);
  });

  it("devolve os apelidos de leitura que as telas já usam, derivados da linha canônica", async () => {
    const { listarEvidenciasCanonicasDoCaso } = await import("@/lib/evidencia-canonica.server");
    const [ev] = await listarEvidenciasCanonicasDoCaso(supabaseFalso(), ORG, CASO);
    expect(ev.title_internal).toBe("Certidão de nascimento de Maria (1912)");
    expect(ev.description_internal).toBe("Transcrição do comune, grafia a confirmar.");
    expect(ev.validation_notes_internal).toBe("Revisão interna pendente.");
    expect(ev.research_person_id).toBe("pessoa-maria");
    expect(ev.case_id).toBe(CASO);
    // O nome canônico continua disponível — o apelido não substitui, acrescenta.
    expect(ev["title"]).toBe("Certidão de nascimento de Maria (1912)");
  });

  it("arquivada fica de fora por padrão e entra só quando pedida explicitamente", async () => {
    const { listarEvidenciasCanonicasDoCaso } = await import("@/lib/evidencia-canonica.server");
    const sb = supabaseFalso();
    expect((await listarEvidenciasCanonicasDoCaso(sb, ORG, CASO)).map((l) => l.id)).toEqual(["ev-1"]);
    const comArquivadas = await listarEvidenciasCanonicasDoCaso(supabaseFalso(), ORG, CASO, {
      incluirArquivadas: true,
    });
    expect(comArquivadas.map((l) => l.id).sort()).toEqual(["ev-1", "ev-arquivada"]);
  });

  it("caso de outra organização ou sem área de pesquisa devolve vazio, nunca a evidência alheia", async () => {
    const { listarEvidenciasCanonicasDoCaso } = await import("@/lib/evidencia-canonica.server");
    expect(await listarEvidenciasCanonicasDoCaso(supabaseFalso(), "org-outra", CASO)).toEqual([]);
    expect(await listarEvidenciasCanonicasDoCaso(supabaseFalso(), ORG, "caso-sem-pesquisa")).toEqual([]);
  });

  it("por id devolve a linha com o case_id resolvido (é o que lerAlvo/validação epistêmica precisam)", async () => {
    const { evidenciaCanonicaPorId, evidenciasCanonicasPorIds } = await import("@/lib/evidencia-canonica.server");
    const ev = await evidenciaCanonicaPorId(supabaseFalso(), ORG, "ev-1");
    expect(ev?.case_id).toBe(CASO);
    expect(ev?.epistemic_validation_status).toBe("em_revisao");
    expect(await evidenciasCanonicasPorIds(supabaseFalso(), ORG, [])).toEqual([]);
    const dois = await evidenciasCanonicasPorIds(supabaseFalso(), ORG, ["ev-1", "ev-arquivada"]);
    expect(dois.map((l) => l.id).sort()).toEqual(["ev-1", "ev-arquivada"]);
  });
});

describe("Corte 0-bis — nenhum leitor de tela continua apontado para a tabela vazia", () => {
  const arquivos = [
    "src/lib/biblioteca-evidencias.functions.ts",
    "src/lib/relatorios-fase.functions.ts",
    "src/lib/documentos-solicitacoes.functions.ts",
    "src/lib/pesquisa-cadeia.functions.ts",
  ];

  it("Biblioteca, Relatório de fase, Documentos e o hub de Pesquisa não leem mais .from(\"evidences\")", () => {
    for (const caminho of arquivos) {
      const src = readFileSync(caminho, "utf8");
      expect(src, caminho).not.toContain('.from("evidences")');
      expect(src, caminho).not.toContain('.from("evidencias")');
    }
  });

  it("os quatro usam o leitor canônico do módulo único, sem recriar o de-para", () => {
    for (const caminho of arquivos.filter((a) => !a.includes("pesquisa-cadeia"))) {
      const src = readFileSync(caminho, "utf8");
      expect(src, caminho).toContain("evidencia-canonica.server");
    }
  });

  it("a validação epistêmica grava na canônica (era um 5º escritor apontado para a tabela vazia)", () => {
    const src = readFileSync("src/lib/biblioteca-evidencias.functions.ts", "utf8");
    expect(src).not.toMatch(/tabela:\s*"evidences"/);
    expect(src).toMatch(/tabela:\s*"research_evidence_items"/);
  });

  it("lerAlvo valida o vínculo contra a canônica (antes recusava evidência real como inexistente)", () => {
    const src = readFileSync("src/lib/fontes-documentos-integracao.functions.ts", "utf8");
    expect(src).toContain("evidenciaCanonicaPorId(");
  });
});

describe("Corte 0-bis — dívidas que seguem declaradas, não escondidas", () => {
  it("`evidencias` legado continua lida SÓ para baixar anexo histórico (storage_path), nunca para listar", () => {
    const src = readFileSync("src/lib/pesquisa.functions.ts", "utf8");
    expect(src).toContain('.from("evidencias")');
    expect(src).toContain("storage_path");
  });

  it("`evidences` segue lida em um único ponto, só para rotular vínculo histórico já gravado", () => {
    const src = readFileSync("src/lib/fontes-documentos-integracao.functions.ts", "utf8");
    expect(src).toContain("evidenciaLegado");
    const ocorrencias = src.split('.from("evidences")').length - 1;
    expect(ocorrencias).toBe(1);
  });
});
