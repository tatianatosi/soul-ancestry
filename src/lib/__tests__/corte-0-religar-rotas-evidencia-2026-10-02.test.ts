import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Corte 0 (02/10/2026) — religar as 4 rotas de evidência ao núcleo canônico.
 * O Corte 1a aposentou os 4 escritores concorrentes (só throw); o Corte 0
 * fecha a outra metade: cada rota passa a delegar a `evidencia-canonica.server.ts`,
 * nunca grava direto em `evidences`/`evidencias`, e a trava do D-06 critério D
 * (busca negativa exige fonte + data) vale para qualquer chamador.
 */

/* ---------------------------------------------- banco em memória */
type Linha = Record<string, any>;
const banco = vi.hoisted(() => ({ tabelas: {} as Record<string, Linha[]>, seq: 0 }));

vi.mock("@/lib/persistencia.server", () => ({
  inserirComVerificacao: async (o: { tabela: string; payload: Linha; organizationId: string }) => {
    banco.seq += 1;
    const linha = {
      id: `${o.tabela}-${banco.seq}`,
      organization_id: o.organizationId,
      archived_at: null,
      created_at: `2026-10-02T00:00:${String(banco.seq).padStart(2, "0")}Z`,
      ...o.payload,
    };
    (banco.tabelas[o.tabela] ??= []).push(linha);
    return { ok: true, id: linha.id, registro: linha, salvoEm: "agora" };
  },
  gravarComVerificacao: async (o: { tabela: string; id: string; payload: Linha; organizationId: string }) => {
    const linha = (banco.tabelas[o.tabela] ?? []).find(
      (l) => l.id === o.id && l.organization_id === o.organizationId,
    );
    if (!linha) throw new Error("NENHUMA_LINHA_AFETADA");
    Object.assign(linha, o.payload);
    return { ok: true, registro: { ...linha }, salvoEm: "agora" };
  },
}));

const timeline: Linha[] = [];
vi.mock("@/lib/timeline-operacional.server", () => ({
  registrarTimelineCaso: async (_s: unknown, e: Linha) => {
    timeline.push(e);
  },
}));

function supabaseFalso() {
  const consulta = (tabela: string) => {
    const filtros: [string, unknown][] = [];
    const linhas = () =>
      (banco.tabelas[tabela] ?? []).filter((l) => filtros.every(([c, v]) => (l[c] ?? null) === v));
    const q: any = {
      select: () => q,
      eq: (c: string, v: unknown) => (filtros.push([c, v]), q),
      is: (c: string, v: unknown) => (filtros.push([c, v]), q),
      order: () => q,
      limit: () => q,
      maybeSingle: async () => ({ data: linhas()[0] ?? null, error: null }),
      insert: (obj: Linha) => {
        banco.seq += 1;
        (banco.tabelas[tabela] ??= []).push({ id: `${tabela}-${banco.seq}`, ...obj });
        return Promise.resolve({ error: null });
      },
      then: (ok: (r: unknown) => unknown) => Promise.resolve({ data: linhas(), error: null }).then(ok),
    };
    return q;
  };
  return { from: consulta };
}

const ORG = "org-1";
const CASO = "caso-1";

beforeEach(() => {
  banco.tabelas = {};
  banco.seq = 0;
  timeline.length = 0;
  banco.tabelas["research_cases"] = [
    { id: "pesquisa-1", organization_id: ORG, case_id: CASO, archived_at: null, created_at: "2026-10-01T00:00:00Z" },
  ];
});

describe("Corte 0: as 4 rotas gravam no núcleo canônico, nunca em evidences/evidencias", () => {
  it("gravarEvidenciaCanonica cria em research_evidence_items, com o estado inicial do grafo", async () => {
    const { gravarEvidenciaCanonica } = await import("@/lib/evidencia-canonica.server");
    const r = await gravarEvidenciaCanonica(supabaseFalso(), "user-1", ORG, {
      caseId: CASO,
      titulo: "Certidão de nascimento",
      tipo: "document",
      origem: "biblioteca_evidencias",
    });
    expect(r.ok).toBe(true);
    expect(banco.tabelas["research_evidence_items"]).toHaveLength(1);
    expect(banco.tabelas["evidences"]).toBeUndefined();
    expect(banco.tabelas["evidencias"]).toBeUndefined();
    const linha = banco.tabelas["research_evidence_items"][0];
    expect(linha.workflow_status).toBe("recebida");
    expect(banco.tabelas["audit_logs"]).toHaveLength(1);
    expect(timeline).toHaveLength(1);
  });

  it("busca negativa sem fonte nem data é recusada (D-06 critério D) e nada é gravado", async () => {
    const { gravarEvidenciaCanonica } = await import("@/lib/evidencia-canonica.server");
    await expect(
      gravarEvidenciaCanonica(supabaseFalso(), "user-1", ORG, {
        caseId: CASO,
        titulo: "Busca no cartório X",
        tipo: "document",
        natureza: "busca_negativa",
      }),
    ).rejects.toThrow(/Busca negativa exige/);
    expect(banco.tabelas["research_evidence_items"]).toBeUndefined();
  });

  it("busca negativa com fonte e data é aceita", async () => {
    const { gravarEvidenciaCanonica } = await import("@/lib/evidencia-canonica.server");
    const r = await gravarEvidenciaCanonica(supabaseFalso(), "user-1", ORG, {
      caseId: CASO,
      titulo: "Busca no cartório X",
      tipo: "document",
      natureza: "busca_negativa",
      buscaNegativaFonte: "Cartório do 1º Ofício de Milão",
      buscaNegativaData: "2026-10-01",
    });
    expect(r.ok).toBe(true);
  });

  it("mudarSituacaoEvidenciaCanonica recusa transição fora do grafo e exige justificativa", async () => {
    banco.tabelas["research_evidence_items"] = [
      {
        id: "ev-1",
        organization_id: ORG,
        archived_at: null,
        title: "x",
        workflow_status: "divergente",
        evidence_status: "inconclusive",
        research_case_id: "pesquisa-1",
      },
    ];
    const { mudarSituacaoEvidenciaCanonica } = await import("@/lib/evidencia-canonica.server");
    // Transição proibida pelo grafo: de "divergente" não se vai direto a entrega.
    await expect(
      mudarSituacaoEvidenciaCanonica(supabaseFalso(), "user-1", ORG, {
        id: "ev-1",
        para: "aprovada_para_entrega",
        justificativa: "revisão concluída",
        origem: "pesquisa_evidencias_do_caso",
      }),
    ).rejects.toThrow(/não permitida/);
    // Transição permitida, mas sem justificativa: também recusada.
    await expect(
      mudarSituacaoEvidenciaCanonica(supabaseFalso(), "user-1", ORG, {
        id: "ev-1",
        para: "requer_complemento",
        justificativa: "",
        origem: "pesquisa_evidencias_do_caso",
      }),
    ).rejects.toThrow();
    // Linha nunca muda quando a transição é recusada.
    expect(banco.tabelas["research_evidence_items"][0].workflow_status).toBe("divergente");
  });
});

describe("Corte 0: os 4 escritores religados nunca reintroduzem writer próprio de evidences", () => {
  // `evidences`/`evidencias` seguem lidas em outras funções destes mesmos
  // arquivos (histórico, painéis) — isso é permitido (AGENTS.md: legado só
  // leitura). O que o Corte 0 proíbe é ESCREVER nelas de novo.
  it("nenhum dos 4 arquivos faz insert/update/upsert em evidences/evidencias", async () => {
    const { readFileSync } = await import("node:fs");
    const escritaProibida = /\.from\((?:"evidences"|"evidencias")\)[^;]*?\.(insert|update|upsert)\(/s;
    for (const f of [
      "src/lib/biblioteca-evidencias.functions.ts",
      "src/lib/fontes-documentos-integracao.functions.ts",
      "src/lib/pesquisa-cadeia.functions.ts",
      "src/lib/golive-escritores.functions.ts",
    ]) {
      const corpo = readFileSync(f, "utf8");
      expect(corpo, f).not.toMatch(escritaProibida);
    }
  });
});
