import { describe, expect, it } from "vitest";

import { montarCaseDataReal } from "@/lib/ficha-master.server";
import { toFichaPiloto } from "@/lib/caseAdapter";

/**
 * Prioridade 1 da sequência de 02/10/2026: "Ligar CaseData real ao
 * adaptador da Ficha Master". `toFichaPiloto` (caseAdapter.ts) continua o
 * único mapeador; este teste prova que `montarCaseDataReal` monta o
 * `CaseData` a partir de linhas reais (nunca do estático de demo) e que o
 * resultado passa por `toFichaPiloto` sem alterar o adaptador.
 */
type Linha = Record<string, any>;

function supabaseFalso(tabelas: Record<string, Linha[]>) {
  const consulta = (tabela: string) => {
    const filtros: [string, unknown][] = [];
    const nots: [string, unknown][] = [];
    const ins: [string, unknown[]][] = [];
    let ordenarPor: string | null = null;
    let asc = true;
    let lim: number | null = null;
    const linhas = () => {
      let r = (tabelas[tabela] ?? []).filter((l) =>
        filtros.every(([c, v]) => (l[c] ?? null) === v),
      );
      r = r.filter((l) => nots.every(([c, v]) => (l[c] ?? null) !== v));
      r = r.filter((l) => ins.every(([c, vs]) => vs.includes(l[c])));
      if (ordenarPor) {
        r = [...r].sort((a, b) => {
          const av = a[ordenarPor!] ?? "";
          const bv = b[ordenarPor!] ?? "";
          return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
        });
      }
      if (lim !== null) r = r.slice(0, lim);
      return r;
    };
    const q: any = {
      select: () => q,
      eq: (c: string, v: unknown) => (filtros.push([c, v]), q),
      is: (c: string, v: unknown) => (filtros.push([c, v]), q),
      not: (c: string, _op: string, v: unknown) => (nots.push([c, v]), q),
      in: (c: string, v: unknown[]) => (ins.push([c, v]), q),
      order: (c: string, o?: { ascending?: boolean }) => ((ordenarPor = c), (asc = o?.ascending ?? true), q),
      limit: (n: number) => ((lim = n), q),
      maybeSingle: async () => ({ data: linhas()[0] ?? null, error: null }),
      then: (ok: (r: unknown) => unknown) => Promise.resolve({ data: linhas(), error: null }).then(ok),
    };
    return q;
  };
  return { from: consulta };
}

const ORG = "org-1";
const CASO = "caso-1";

describe("montarCaseDataReal: Ficha Master lê dado real, nunca estático de demo", () => {
  it("monta CaseData a partir de crm_casos/clientes/case_plans/research_cases/app_projections reais", async () => {
    const supabase = supabaseFalso({
      crm_casos: [
        {
          id: CASO,
          organization_id: ORG,
          codigo: "CA-CID-TEST-001",
          titulo: "Caso de teste",
          status: "ativo",
          cliente_id: "cli-1",
          pais: "Itália",
          citizenship_track_id: "trilha-1",
          created_at: "2026-09-01T00:00:00Z",
          updated_at: "2026-10-01T00:00:00Z",
        },
      ],
      clientes: [{ id: "cli-1", nome: "Cliente Real", pais_interesse: "Itália" }],
      citizenship_tracks: [{ id: "trilha-1", pais: "Itália" }],
      case_plans: [
        {
          organization_id: ORG,
          case_id: CASO,
          archived_at: null,
          fase_jornada: "pesquisa_e_validacao",
          status: "ativo",
          proxima_acao: "Revisar documento",
          created_at: "2026-09-15T00:00:00Z",
        },
      ],
      research_cases: [
        {
          organization_id: ORG,
          case_id: CASO,
          archived_at: null,
          internal_hypothesis: "Linha materna italiana via Milão",
          created_at: "2026-09-10T00:00:00Z",
        },
      ],
      app_projections: [
        {
          id: "p1",
          organization_id: ORG,
          case_id: CASO,
          archived_at: null,
          projection_type: "resumo",
          content_sanitized: "Resumo publicado do caso.",
          pessoa_id: null,
          geracao_cliente: null,
          effective_from: "2026-09-20T00:00:00Z",
        },
        {
          id: "p2",
          organization_id: ORG,
          case_id: CASO,
          archived_at: null,
          projection_type: "arvore",
          content_sanitized: "Maria Silveira|bisavó materna",
          pessoa_id: "pessoa-1",
          geracao_cliente: 3,
          effective_from: "2026-09-22T00:00:00Z",
        },
      ],
      documents: [
        {
          organization_id: ORG,
          case_id: CASO,
          archived_at: null,
          liberado_cliente: true,
          titulo: "Certidão liberada",
          liberado_em: "2026-09-25T00:00:00Z",
        },
      ],
      portal_document_requests: [],
      case_timeline_events: [
        {
          organization_id: ORG,
          case_id: CASO,
          archived_at: null,
          summary_client_approved: "Marco aprovado 1",
          occurred_at: "2026-09-28T00:00:00Z",
        },
      ],
    });

    const caseData = await montarCaseDataReal({ supabase, organizationId: ORG, caseId: CASO });

    expect(caseData.geral.case_id).toBe("CA-CID-TEST-001");
    expect(caseData.geral.case_nome).toBe("Caso de teste");
    expect(caseData.geral.cliente_nome).toBe("Cliente Real");
    expect(caseData.jornada.contexto_resumo).toBe("Resumo publicado do caso.");
    expect(caseData.rota.hipotese_principal).toBe("Linha materna italiana via Milão");
    expect(caseData.rota.pais_principal).toBe("Itália");
    expect(caseData.arvore.pessoas_conectadas).toBe(1);
    expect(caseData.arvore.geracoes_lidas).toBe(3);
    expect(caseData.documentos.documento_principal).toBe("Certidão liberada");
    expect(caseData.conta.historico).toEqual(["Marco aprovado 1"]);

    // O adaptador existente continua sendo o único mapeador — nenhum campo
    // novo inventado fora de toFichaPiloto.
    const ficha = toFichaPiloto(caseData);
    expect(ficha.case_id).toBe("CA-CID-TEST-001");
    expect(ficha.cliente_nome).toBe("Cliente Real");
    expect(ficha.contexto_resumo).toBe("Resumo publicado do caso.");
    expect(ficha.origem_pessoas_conectadas).toBe(1);
    // heatmap de percentual: sem fonte real ainda (Prioridade 2, migration pendente) — nunca inventado.
    expect(ficha.heatmap_pct_1).toBeNull();
  });

  it("caso sem cliente/plano/pesquisa/projeções monta CaseData com campos vazios, nunca inventados", async () => {
    const supabase = supabaseFalso({
      crm_casos: [
        {
          id: CASO,
          organization_id: ORG,
          codigo: "CA-CID-VAZIO-001",
          titulo: "Caso vazio",
          status: "ativo",
          cliente_id: null,
          pais: null,
          citizenship_track_id: null,
          created_at: "2026-10-01T00:00:00Z",
          updated_at: "2026-10-01T00:00:00Z",
        },
      ],
    });

    const caseData = await montarCaseDataReal({ supabase, organizationId: ORG, caseId: CASO });
    expect(caseData.geral.cliente_nome).toBe("");
    expect(caseData.jornada.contexto_resumo).toBe("");
    expect(caseData.rota.hipotese_principal).toBe("");
    expect(caseData.arvore.pessoas_conectadas).toBe(0);
    expect(caseData.geral.status_caso).toBe("novo");

    const ficha = toFichaPiloto(caseData);
    expect(ficha.descoberta_1).toBe("A próxima descoberta será adicionada após a validação da pesquisa");
  });

  it("lança erro explícito quando o caso não existe na organização", async () => {
    const supabase = supabaseFalso({ crm_casos: [] });
    await expect(montarCaseDataReal({ supabase, organizationId: ORG, caseId: "inexistente" })).rejects.toThrow(
      /não encontrado/,
    );
  });
});

describe("Heatmap de aderência (Prioridade 2, 02/10/2026): os 3 ramos de maior aderência, nunca inventados", () => {
  it("usa os ramos reais do caso (lineage_paths + citizenship_tracks), ordenados por aderência desc", async () => {
    const supabase = supabaseFalso({
      crm_casos: [
        {
          id: CASO,
          organization_id: ORG,
          codigo: "CA-CID-HEATMAP-001",
          titulo: "Caso com ramos",
          status: "ativo",
          cliente_id: null,
          pais: null,
          citizenship_track_id: null,
          created_at: "2026-10-01T00:00:00Z",
          updated_at: "2026-10-01T00:00:00Z",
        },
      ],
      lineage_paths: [
        { organization_id: ORG, case_id: CASO, archived_at: null, citizenship_track_id: "t-it", aderencia_percentual: 60 },
        { organization_id: ORG, case_id: CASO, archived_at: null, citizenship_track_id: "t-pt", aderencia_percentual: 85 },
        { organization_id: ORG, case_id: CASO, archived_at: null, citizenship_track_id: "t-at", aderencia_percentual: null },
        { organization_id: ORG, case_id: CASO, archived_at: null, citizenship_track_id: "t-br", aderencia_percentual: 40 },
      ],
      citizenship_tracks: [
        { id: "t-it", pais: "Itália" },
        { id: "t-pt", pais: "Portugal" },
        { id: "t-at", pais: "Áustria" },
        { id: "t-br", pais: "Brasil" },
      ],
    });

    const caseData = await montarCaseDataReal({ supabase, organizationId: ORG, caseId: CASO });
    // Maior aderência primeiro; o ramo sem aderência (Áustria) fica de fora do top 3.
    expect(caseData.rota.pais_principal).toBe("Portugal");
    expect(caseData.rota.aderencia_principal).toBe(85);
    expect(caseData.rota.pais_secundario).toBe("Itália");
    expect(caseData.rota.aderencia_secundaria).toBe(60);
    expect(caseData.rota.pais_terciario).toBe("Brasil");
    expect(caseData.rota.aderencia_terciaria).toBe(40);

    const ficha = toFichaPiloto(caseData);
    expect(ficha.heatmap_pais_1).toBe("Portugal");
    expect(ficha.heatmap_pct_1).toBe(85);
    expect(ficha.heatmap_pais_2).toBe("Itália");
    expect(ficha.heatmap_pct_2).toBe(60);
  });

  it("sem nenhum ramo com aderência registrada, cai no país único — percentual nunca inventado", async () => {
    const supabase = supabaseFalso({
      crm_casos: [
        {
          id: CASO,
          organization_id: ORG,
          codigo: "CA-CID-HEATMAP-002",
          titulo: "Caso sem ramos",
          status: "ativo",
          cliente_id: null,
          pais: "Itália",
          citizenship_track_id: null,
          created_at: "2026-10-01T00:00:00Z",
          updated_at: "2026-10-01T00:00:00Z",
        },
      ],
    });
    const caseData = await montarCaseDataReal({ supabase, organizationId: ORG, caseId: CASO });
    expect(caseData.rota.pais_principal).toBe("Itália");
    expect(caseData.rota.aderencia_principal).toBeNull();
    const ficha = toFichaPiloto(caseData);
    expect(ficha.heatmap_pct_1).toBeNull();
  });
});
