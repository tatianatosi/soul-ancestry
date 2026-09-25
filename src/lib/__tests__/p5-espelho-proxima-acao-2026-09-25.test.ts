import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * P5 (25/09/2026) — a RPC canônica `proxima_acao_prioritaria` (nível 8,
 * `supabase/migrations/20260905130000_proxima_acao_prioritaria_caso.sql`)
 * só lê `crm_casos.proxima_acao`/`prazo_proxima_acao` — nunca `case_plans`.
 * `salvarJornadaDoCaso` (P4) grava só em `case_plans`; sem este espelho a
 * jornada não move nada em Painel Hoje/Ficha/Lista de Casos. Achado por
 * leitura direta do corpo da função, confirmado independentemente do que a
 * branch órfã `motor-planejador-ponta-a-ponta-fced` já tinha implementado
 * (nunca mesclada, obsoleta hoje).
 */

type Linha = Record<string, any>;
const banco = vi.hoisted(() => ({ tabelas: {} as Record<string, Record<string, any>[]> }));

vi.mock("@/lib/persistencia.server", () => ({
  gravarComVerificacao: async (o: { tabela: string; id: string; payload: Linha; organizationId: string }) => {
    const linha = (banco.tabelas[o.tabela] ?? []).find((l) => l.id === o.id && l.organization_id === o.organizationId);
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
      then: (ok: (r: unknown) => unknown) => Promise.resolve({ data: linhas(), error: null }).then(ok),
    };
    return q;
  };
  return { from: consulta };
}

const ORG = "org-1";
const CASO = "caso-1";

function semear(extra: Partial<Record<string, Linha[]>> = {}) {
  timeline.length = 0;
  banco.tabelas = {
    case_plans: [
      {
        id: "plano-1",
        organization_id: ORG,
        case_id: CASO,
        versao: 2,
        plano_hash: "h123",
        status: "rascunho",
        etapa: "Discovery concluído",
        rota_confirmada: null,
        produto_pai_id: null,
        marco_atual: null,
        marcos: [],
        responsavel_user_id: null,
        proxima_acao: null,
        prazo_proxima_acao: null,
        motivos_bloqueio: [],
        archived_at: null,
      },
    ],
    crm_casos: [
      {
        id: CASO,
        organization_id: ORG,
        proxima_acao: null,
        prazo_proxima_acao: null,
        proxima_acao_responsavel: null,
      },
    ],
    profiles: [{ id: "resp-1", nome: "Ana Consultora" }],
    ...extra,
  } as Record<string, Linha[]>;
}

async function salvar(campos: Record<string, unknown>) {
  const { salvarJornadaDoCaso } = await import("@/lib/jornada-planejador.server");
  return salvarJornadaDoCaso(supabaseFalso(), { organizationId: ORG, caseId: CASO, userId: "u-1", campos: campos as never });
}

describe("P5 — espelho da próxima ação em crm_casos", () => {
  beforeEach(() => semear());

  it("grava próxima ação + prazo na jornada e espelha em crm_casos", async () => {
    const r = await salvar({ proxima_acao: "Agendar call de onboarding", prazo_proxima_acao: "2026-10-01" });
    expect(r.ok).toBe(true);
    const caso = banco.tabelas.crm_casos[0];
    expect(caso.proxima_acao).toBe("Agendar call de onboarding");
    expect(caso.prazo_proxima_acao).toBe("2026-10-01");
  });

  it("resolve o nome do responsável (profiles) — nunca grava o UUID no campo de texto do caso", async () => {
    await salvar({ responsavel_user_id: "resp-1" });
    const caso = banco.tabelas.crm_casos[0];
    expect(caso.proxima_acao_responsavel).toBe("Ana Consultora");
    expect(caso.proxima_acao_responsavel).not.toBe("resp-1");
  });

  it("nunca apaga um valor existente em crm_casos quando o campo não veio no patch", async () => {
    semear({
      crm_casos: [
        {
          id: CASO,
          organization_id: ORG,
          proxima_acao: "Ação anterior de outra origem",
          prazo_proxima_acao: "2026-09-20",
          proxima_acao_responsavel: "Responsável anterior",
        },
      ],
    });
    await salvar({ etapa: "Aceite formalizado" });
    const caso = banco.tabelas.crm_casos[0];
    expect(caso.proxima_acao).toBe("Ação anterior de outra origem");
    expect(caso.prazo_proxima_acao).toBe("2026-09-20");
    expect(caso.proxima_acao_responsavel).toBe("Responsável anterior");
  });

  it("sem mudança real (reenvio idêntico), não toca crm_casos nem duplica timeline", async () => {
    await salvar({ proxima_acao: "Agendar call" });
    const antes = { ...banco.tabelas.crm_casos[0] };
    const r2 = await salvar({});
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.mudou).toBe(false);
    expect(banco.tabelas.crm_casos[0]).toEqual(antes);
    expect(timeline).toHaveLength(1);
  });

  it("edição pontual continua sem tocar versao/hash/status de case_plans mesmo com o espelho novo", async () => {
    await salvar({ proxima_acao: "Agendar call", prazo_proxima_acao: "2026-10-01" });
    const plano = banco.tabelas.case_plans[0];
    expect(plano.versao).toBe(2);
    expect(plano.plano_hash).toBe("h123");
    expect(plano.status).toBe("rascunho");
  });
});

describe("P5 — sincronia com a RPC proxima_acao_prioritaria (nível 8)", () => {
  it("a RPC (nível 8) lê exatamente os mesmos 3 campos de crm_casos que o espelho grava", async () => {
    const { readFileSync } = await import("node:fs");
    const sql = readFileSync("supabase/migrations/20260905130000_proxima_acao_prioritaria_caso.sql", "utf8");
    expect(sql).toMatch(/cc\.proxima_acao is not null/);
    expect(sql).toMatch(/from crm_casos cc/);
    expect(sql).not.toMatch(/from case_plans/);
  });
});
