import { describe, expect, it } from "vitest";

import { materializarProposta } from "@/lib/cadeia-operacional.server";

/*
 * Caso real que motivou este teste: a proposta v1 da Ana (CA-CID-AT-FAM-2026-001)
 * é aprovada, origem Canva, com 7/7 páginas extraídas, e nunca passou pelo
 * pipeline Planejador -> Proposta (plan_id nulo). Antes desta guarda,
 * "Derivar proposta do planejador" (botão real em CadeiaOperacional) criaria
 * uma v2 e marcaria a v1 como substituída — apagando de fato a proposta Canva
 * real por uma derivada de um Planejador vazio. Isso nunca pode acontecer
 * sem confirmação humana explícita fora deste fluxo automático.
 */

type Registro = Record<string, any>;

function supabaseFalso(opts: { caso: Registro; blueprint: Registro | null; propostaAtual: Registro }) {
  const atualizacoes: { tabela: string; payload: Registro }[] = [];
  const insercoes: { tabela: string; payload: Registro }[] = [];
  let propostaViva: Registro = { ...opts.propostaAtual };

  function chain(tabela: string, modo: "select" | "update" | "insert" = "select", payload: Registro = {}): any {
    const api: any = {
      select: () => chain(tabela, modo, payload),
      eq: () => api,
      is: () => api,
      order: () => api,
      limit: () => api,
      match: () => api,
      maybeSingle: async () => {
        if (tabela === "crm_casos") return { data: opts.caso };
        if (tabela === "blueprint_parameters") return { data: opts.blueprint };
        if (tabela === "case_plans") return { data: null };
        if (tabela === "product_catalog") return { data: null };
        if (tabela === "nucleos_familiares") return { data: null };
        if (tabela === "proposals") return { data: propostaViva };
        // A proprietária (admin ativo) é quem opera este fluxo no caso real —
        // assumirOuRecusarComUsuario() consulta staff_access antes de chegar
        // na guarda que este teste verifica.
        if (tabela === "staff_access") return { data: { role: "admin", status: "active" } };
        return { data: null };
      },
      single: async () => {
        const nova = { id: "nova-proposta-v2", ...payload };
        insercoes.push({ tabela, payload });
        return { data: nova, error: null };
      },
      update: (novoPayload: Registro) => chain(tabela, "update", novoPayload),
      insert: (novoPayload: Registro) => chain(tabela, "insert", novoPayload),
      then: (resolve: (v: any) => unknown) => {
        if (modo === "update" && tabela === "proposals") {
          atualizacoes.push({ tabela, payload });
          propostaViva = { ...propostaViva, ...payload };
          return resolve({ data: [{ id: propostaViva.id }], error: null });
        }
        if (tabela === "case_members") return resolve({ data: [] });
        return resolve({ data: [], error: null });
      },
    };
    return api;
  }

  return {
    from: (tabela: string) => chain(tabela),
    _atualizacoes: atualizacoes,
    _insercoes: insercoes,
  };
}

describe("materializarProposta — não pode apagar proposta Canva real e aprovada", () => {
  const caso = { id: "caso-ana", codigo: "CA-CID-AT-FAM-2026-001", organization_id: "org-1", archived_at: null, demo: false, dados_teste: false };
  const blueprint = { id: "plano-1", product_catalog_id: null, fases_jornada: [], entregas_previstas: [], criterios_aceite: [] };
  const propostaCanvaAprovada = {
    id: "proposta-ana-v1",
    versao: 1,
    status: "aprovada",
    origem: "canva",
    origem_referencia: "DECK-CANVA-CA-CID-AT-FAM-2026-001-v1",
    plan_id: null,
    escopo_estruturado: { objetivo: "conteúdo real do Canva" },
  };

  it("vincula o plano sem versionar nem tocar escopo/valor da proposta Canva aprovada", async () => {
    const supabase = supabaseFalso({ caso, blueprint, propostaAtual: propostaCanvaAprovada });

    const r = await materializarProposta(supabase as any, {
      org: "org-1",
      userId: "user-1",
      caseId: "caso-ana",
      responsavelComercial: "Comercial",
      responsavelOperacional: "Operações",
    });

    expect(r.idempotente).toBe(true);
    expect((r as any).vinculoSomente).toBe(true);
    expect(r.proposalId).toBe("proposta-ana-v1");
    expect(r.versao).toBe(1);

    // Nenhuma proposta nova foi inserida (nunca cria v2 para substituir a Canva).
    expect(supabase._insercoes.filter((i) => i.tabela === "proposals")).toHaveLength(0);

    // A única gravação em proposals é o vínculo do plano — nada de escopo/valor/status.
    const gravacoes = supabase._atualizacoes.filter((a) => a.tabela === "proposals");
    expect(gravacoes).toHaveLength(1);
    expect(gravacoes[0].payload.plan_id).toBe("plano-1");
    expect(gravacoes[0].payload.escopo_estruturado).toBeUndefined();
    expect(gravacoes[0].payload.status).toBeUndefined();
    expect(gravacoes[0].payload.valor).toBeUndefined();
    expect(gravacoes[0].payload.origem).toBeUndefined();
  });

  it("não grava de novo se o plano já está vinculado (idempotente)", async () => {
    const jaVinculada = { ...propostaCanvaAprovada, plan_id: "plano-1" };
    const supabase = supabaseFalso({ caso, blueprint, propostaAtual: jaVinculada });

    const r = await materializarProposta(supabase as any, {
      org: "org-1",
      userId: "user-1",
      caseId: "caso-ana",
      responsavelComercial: "Comercial",
      responsavelOperacional: "Operações",
    });

    expect(r.idempotente).toBe(true);
    expect(supabase._atualizacoes.filter((a) => a.tabela === "proposals")).toHaveLength(0);
    expect(supabase._insercoes.filter((i) => i.tabela === "proposals")).toHaveLength(0);
  });
});
