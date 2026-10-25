import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ITEM_CODE_D7,
  MARCA_DERIVADO_D7,
  alertaD7Devido,
  contarSlaEmRisco,
  lacunasD7,
  microentregaD7,
  patchChecklistD7,
  prazoD7,
  proximaAcaoD7,
  recusaTickManualD7,
} from "@/lib/d7-microentrega";
import { proximaEntregaCliente } from "@/lib/portal-dados-vivos";

/**
 * P3 — Onboarding único e micro-entregas reais (25/09/2026). O D7 deixa de
 * ser caixinha: segue a micro-entrega real em ops_microentregas, e o
 * reconciliador único espelha checklist, plano, case_plans e alerta.
 */

/* ---------------------------------------------- banco em memória */
type Linha = Record<string, any>;
const banco = vi.hoisted(() => ({ tabelas: {} as Record<string, Record<string, any>[]>, seq: 0 }));

vi.mock("@/lib/persistencia.server", () => ({
  inserirComVerificacao: async (o: { tabela: string; payload: Linha; organizationId: string }) => {
    banco.seq += 1;
    const linha = {
      id: `${o.tabela}-${banco.seq}`,
      organization_id: o.organizationId,
      archived_at: null,
      created_at: `2026-09-25T00:00:${String(banco.seq).padStart(2, "0")}Z`,
      ...o.payload,
    };
    (banco.tabelas[o.tabela] ??= []).push(linha);
    return { ok: true, id: linha.id, registro: linha, salvoEm: "agora" };
  },
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
    let modo: "select" | "update" = "select";
    let patch: Linha = {};
    const linhas = () =>
      (banco.tabelas[tabela] ?? []).filter((l) => filtros.every(([c, v]) => (l[c] ?? null) === v));
    const q: any = {
      select: () => q,
      eq: (c: string, v: unknown) => (filtros.push([c, v]), q),
      is: (c: string, v: unknown) => (filtros.push([c, v]), q),
      limit: () => q,
      order: () => q,
      maybeSingle: async () => ({ data: linhas()[0] ?? null, error: null }),
      update: (p: Linha) => ((modo = "update"), (patch = p), q),
      insert: (obj: Linha) => {
        banco.seq += 1;
        (banco.tabelas[tabela] ??= []).push({ id: `${tabela}-${banco.seq}`, ...obj });
        return Promise.resolve({ error: null });
      },
      then: (ok: (r: unknown) => unknown) => {
        if (modo === "update") {
          for (const l of linhas()) Object.assign(l, patch);
          return Promise.resolve({ error: null }).then(ok);
        }
        return Promise.resolve({ data: linhas(), error: null }).then(ok);
      },
    };
    return q;
  };
  return { from: consulta };
}

const ORG = "org-1";
const CASO = "caso-1";
function semear(extra: Partial<Record<string, Linha[]>> = {}) {
  banco.seq = 0;
  timeline.length = 0;
  banco.tabelas = {
    crm_casos: [
      {
        id: CASO,
        organization_id: ORG,
        responsavel_id: "resp-1",
        onboarding_iniciado_em: "2026-09-01T12:00:00Z",
        contrato_assinado: true,
        pagamento_confirmado: true,
      },
    ],
    ops_microentregas: [],
    onboarding_checklist: [
      { id: "item-d7", organization_id: ORG, case_id: CASO, item_code: ITEM_CODE_D7, status: "pendente", observacao: null, archived_at: null },
    ],
    onboarding_planos: [],
    nucleos_familiares: [],
    case_plans: [
      { id: "plano-1", organization_id: ORG, case_id: CASO, status: "ativo", archived_at: null, proxima_microentrega: null },
    ],
    case_alerts: [],
    ...extra,
  } as Record<string, Linha[]>;
}

async function reconciliar(criarSeFaltar: boolean) {
  const { reconciliarD7Caso } = await import("@/lib/d7-microentrega.server");
  return reconciliarD7Caso(supabaseFalso(), { organizationId: ORG, caseId: CASO, userId: "u-1", criarSeFaltar });
}

describe("regras puras do D7", () => {
  const m = (p: Linha) => ({ id: "m", titulo: "Prancha 1", status: "pendente", ...p });
  it("D7 é a micro-entrega ativa mais antiga; cancelada ou arquivada não conta", () => {
    expect(microentregaD7([])).toBeNull();
    expect(microentregaD7([m({ status: "cancelada" }), m({ archived_at: "x" })])).toBeNull();
    const d = microentregaD7([m({ id: "b", created_at: "2026-09-10" }), m({ id: "a", created_at: "2026-09-02" })]);
    expect(d?.id).toBe("a");
  });
  it("prazo D7 conta do D0 do onboarding; sem D0, de hoje", () => {
    expect(prazoD7("2026-09-01T12:00:00Z", "2026-09-25T00:00:00Z")).toBe("2026-09-08");
    expect(prazoD7(null, "2026-09-25T00:00:00Z")).toBe("2026-10-02");
  });
  it("lacunas e próxima ação dizem o que falta", () => {
    expect(lacunasD7(m({}))).toEqual(["sem responsável", "sem prazo"]);
    expect(proximaAcaoD7(null)).toMatch(/Criar a primeira micro-entrega/);
    expect(proximaAcaoD7(m({ responsavel_id: "r", prazo: "2026-09-30" }))).toBe('Entregar "Prancha 1" até 2026-09-30.');
    expect(proximaAcaoD7(m({ status: "concluida", responsavel_id: "r", prazo: "x" }))).toMatch(/concluída/);
  });
  it("espelho do checklist: conclui pelo dado, preserva não aplicável, só desfaz o que ele mesmo fez", () => {
    const micro = m({ id: "m1" });
    expect(patchChecklistD7(micro, { status: "pendente" })?.status).toBe("concluido");
    const feito = patchChecklistD7(micro, { status: "pendente" })!;
    expect(patchChecklistD7(micro, { status: "concluido", observacao: feito.observacao })).toBeNull();
    expect(patchChecklistD7(micro, { status: "nao_aplicavel" })).toBeNull();
    expect(patchChecklistD7(null, { status: "concluido", observacao: `${MARCA_DERIVADO_D7} m1: x` })?.status).toBe("pendente");
    expect(patchChecklistD7(null, { status: "concluido", observacao: "evidência manual antiga" })).toBeNull();
  });
  it("alerta só depois do D7 e sem micro-entrega", () => {
    expect(alertaD7Devido({ micro: null, onboardingIniciadoEm: "2026-09-01", hojeIso: "2026-09-25" })).toBe(true);
    expect(alertaD7Devido({ micro: null, onboardingIniciadoEm: "2026-09-20", hojeIso: "2026-09-25" })).toBe(false);
    expect(alertaD7Devido({ micro: m({}), onboardingIniciadoEm: "2026-09-01", hojeIso: "2026-09-25" })).toBe(false);
    expect(alertaD7Devido({ micro: null, onboardingIniciadoEm: null, hojeIso: "2026-09-25" })).toBe(false);
  });
  it("tick manual: concluído/pendente recusados no item D7; não aplicável e outros itens seguem", () => {
    expect(recusaTickManualD7(ITEM_CODE_D7, "concluido")).toMatch(/micro-entrega real/);
    expect(recusaTickManualD7(ITEM_CODE_D7, "pendente")).not.toBeNull();
    expect(recusaTickManualD7(ITEM_CODE_D7, "nao_aplicavel")).toBeNull();
    expect(recusaTickManualD7("plano_acao", "concluido")).toBeNull();
  });
});

describe("reconciliador — cria, completa, não duplica", () => {
  beforeEach(() => semear());

  it("cria a micro-entrega D7 com prazo, responsável, estado e critério; espelha checklist e plano", async () => {
    const r = await reconciliar(true);
    expect(r.criada).toBe(true);
    const micros = banco.tabelas.ops_microentregas;
    expect(micros).toHaveLength(1);
    expect(micros[0]).toMatchObject({ caso_id: CASO, status: "pendente", prazo: "2026-09-08", responsavel_id: "resp-1" });
    expect(String(micros[0].criterio_aceite).length).toBeGreaterThan(5);
    expect(banco.tabelas.onboarding_checklist[0].status).toBe("concluido");
    expect(banco.tabelas.onboarding_checklist[0].observacao).toContain(MARCA_DERIVADO_D7);
    expect(banco.tabelas.case_plans[0].proxima_microentrega).toContain("até 2026-09-08");
    expect(r.proximaAcao).toMatch(/^Entregar/);
    expect(timeline).toHaveLength(1);
  });

  it("reexecutar não cria segunda micro-entrega nem novo evento", async () => {
    await reconciliar(true);
    const r2 = await reconciliar(true);
    expect(r2.criada).toBe(false);
    expect(r2.checklistD7).toBe("inalterado");
    expect(banco.tabelas.ops_microentregas).toHaveLength(1);
    expect(timeline).toHaveLength(1);
  });

  it("micro-entrega já existente (outro título) é reaproveitada e só completa o que falta", async () => {
    semear({
      ops_microentregas: [
        { id: "prancha", organization_id: ORG, caso_id: CASO, titulo: "Prancha 1", status: "pendente", prazo: "2026-09-30", responsavel_id: null, archived_at: null, created_at: "2026-09-10" },
      ],
    });
    const r = await reconciliar(true);
    expect(r.criada).toBe(false);
    expect(r.completou).toEqual(["responsável"]);
    expect(banco.tabelas.ops_microentregas).toHaveLength(1);
    expect(banco.tabelas.ops_microentregas[0]).toMatchObject({ responsavel_id: "resp-1", prazo: "2026-09-30" });
    expect(banco.tabelas.onboarding_checklist[0].status).toBe("concluido");
  });

  it("sem micro-entrega e sem pedido de criação: nada é criado, alerta abre após o D7 e depois resolve", async () => {
    const r = await reconciliar(false);
    expect(r.microentregaId).toBeNull();
    expect(banco.tabelas.ops_microentregas).toHaveLength(0);
    expect(r.alerta).toBe("aberto");
    expect(banco.tabelas.case_alerts).toHaveLength(1);
    await reconciliar(false);
    expect(banco.tabelas.case_alerts).toHaveLength(1);
    const r3 = await reconciliar(true);
    expect(r3.alerta).toBe("resolvido");
    expect(banco.tabelas.case_alerts[0].status).toBe("completed");
  });

  it("cancelar a micro-entrega devolve o D7 a pendente; não aplicável humano é preservado", async () => {
    await reconciliar(true);
    banco.tabelas.ops_microentregas[0].status = "cancelada";
    const r = await reconciliar(false);
    expect(r.checklistD7).toBe("pendente");
    expect(banco.tabelas.onboarding_checklist[0].status).toBe("pendente");
    banco.tabelas.onboarding_checklist[0].status = "nao_aplicavel";
    const r2 = await reconciliar(true);
    expect(r2.checklistD7).toBe("nao_aplicavel");
    expect(banco.tabelas.onboarding_checklist[0].status).toBe("nao_aplicavel");
  });

  it("tick manual no D7 segue a realidade: aceita o que bate, recusa o que não bate", async () => {
    const { tratarTickManualD7 } = await import("@/lib/d7-microentrega.server");
    const s = supabaseFalso();
    const sem = await tratarTickManualD7(s, { organizationId: ORG, caseId: CASO, userId: "u-1", status: "concluido" });
    expect(sem.ok).toBe(false);
    expect(banco.tabelas.onboarding_checklist[0].status).toBe("pendente");
    await reconciliar(true);
    const com = await tratarTickManualD7(s, { organizationId: ORG, caseId: CASO, userId: "u-1", status: "concluido" });
    expect(com.ok).toBe(true);
  });
});

describe("ligações e superfícies", () => {
  const plano = readFileSync("src/lib/onboarding-plano.functions.ts", "utf8");
  const ops = readFileSync("src/lib/ops.functions.ts", "utf8");
  const onb = readFileSync("src/lib/onboarding.functions.ts", "utf8");
  const canon = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");
  it("criar, recalcular, salvar e arquivar micro-entrega passam pelo reconciliador único", () => {
    expect(plano.match(/reconciliarD7Caso\(supabase, \{/g)?.length).toBe(2);
    expect(ops.match(/reconciliarD7Caso\(supabase, \{/g)?.length).toBe(3);
  });
  it("nenhuma tela escreve o checklist de 14 itens: o tick manual do D7 deixou de existir", () => {
    // 25/10/2026 — decisão da Proprietária: o checklist saiu de /onboarding/$id e do Caso 360.
    // O D7 segue a micro-entrega real (reconciliarD7Caso), que escreve na tabela direto.
    expect(onb).not.toContain("atualizarItemChecklistOnboarding");
    expect(canon).not.toContain("atualizarItemOnboarding");
    expect(canon).not.toContain("recusaTickManualD7");
    expect(readFileSync("src/routes/_authenticated/onboarding.$id.tsx", "utf8")).not.toContain("Checklist de onboarding");
    expect(readFileSync("src/components/caso/onboarding-caso.tsx", "utf8")).not.toContain("Checklist de onboarding");
  });
  it("Caso 360 mostra o D7 com prazo, responsável, estado e próxima ação", () => {
    const ui = readFileSync("src/components/caso/onboarding-plano.tsx", "utf8");
    expect(ui).toContain("data-d7-microentrega");
    for (const t of ["Prazo:", "Responsável:", "Estado:", "Próxima ação:", "Criar ou reconciliar micro-entrega D7"]) expect(ui).toContain(t);
  });
  it("Painel Hoje: SLA em risco vem da fonte real, sem cartão novo", () => {
    const desk = readFileSync("src/lib/crm-desk.functions.ts", "utf8");
    expect(desk).toContain('.from("v_ops_microentregas")');
    expect(desk).toContain('.from("v_ops_tarefas")');
    expect(readFileSync("src/lib/painel-dia.ts", "utf8")).toContain("sla_em_risco: opcoes?.slaEmRisco ?? null");
    const n = contarSlaEmRisco({
      microentregas: [{ caso_id: "a", prazo_status: "atrasada" }, { caso_id: "b", prazo_status: "em_risco" }, { caso_id: "a", prazo_status: "no_prazo" }],
      tarefas: [{ caso_id: "a", sla_status: "em_risco" }],
      casosVisiveis: new Set(["a"]),
    });
    expect(n).toEqual({ total: 2, microentregas: 1, tarefas: 1 });
  });
});

describe("App: só a data sanitizada da próxima entrega", () => {
  it("texto de cliente só com a data; data inválida vira nada", () => {
    expect(proximaEntregaCliente("2026-09-30")).toEqual({ data: "2026-09-30", texto: "Próxima entrega prevista para 30/09/2026." });
    expect(proximaEntregaCliente(null)).toBeNull();
    expect(proximaEntregaCliente("amanhã")).toBeNull();
  });
  it("a view expõe só a data; o App não lê ops_microentregas", () => {
    const mig = readFileSync("supabase/migrations/20260925120000_portal_casos_proxima_entrega.sql", "utf8");
    expect(mig).toContain("security_barrier = true, security_invoker = false");
    expect(mig).toContain("portal_caso_permitido(c.id)");
    expect(mig).toMatch(/select min\(m\.prazo\)/);
    expect(mig).not.toMatch(/m\.titulo|m\.descricao|m\.responsavel_id/);
    const vivo = readFileSync("src/lib/portal-dados-vivos.functions.ts", "utf8");
    expect(vivo).not.toContain('from("ops_microentregas")');
    expect(vivo).toContain("proximaEntregaCliente(casoAtivo.proxima_entrega_prevista_em)");
  });
});
