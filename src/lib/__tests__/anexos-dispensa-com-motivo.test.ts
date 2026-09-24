import { describe, expect, it } from "vitest";

import {
  anexoDispensadoManualmente,
  dispensarAnexoManualmente,
  reativarAnexoManual,
  sincronizarAnexosPersistidos,
  type InstanciaAnexo,
} from "@/lib/anexos-persistidos.server";

/*
 * Achado real ao investigar "Contrato de Uma Hora" (autorização da
 * proprietária, 2026-09-24): os Anexos I–V eram somente-leitura em produção
 * — sem "dispensar com motivo" apesar de `contract_annexes.reason_not_applicable`
 * e do status `not_applicable` já existirem no banco. Este teste exercita o
 * escritor novo contra um Supabase falso (mesmo padrão de
 * `materializar-proposta-canva-guard.test.ts`): sempre nasce versão nova
 * (nunca edita a vigente), e a auto-cura (`sincronizarAnexosPersistidos`)
 * preserva a decisão manual em vez de recalculá-la pela regra.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

function supabaseFalso(linhasIniciais: Record<string, unknown>[]) {
  let linhas = [...linhasIniciais];
  const inseridas: Record<string, unknown>[] = [];

  function chain(filtros: Record<string, unknown> = {}): any {
    const api: any = {
      select: () => api,
      eq: (campo: string, valor: unknown) => chain({ ...filtros, [campo]: valor }),
      is: (campo: string, valor: unknown) => chain({ ...filtros, [`is:${campo}`]: valor }),
      order: (campo: string, opts?: { ascending?: boolean }) => {
        const asc = opts?.ascending !== false;
        api._ordem = { campo, asc };
        return api;
      },
      limit: () => api,
      insert: (payload: Record<string, unknown>) => {
        linhas.push({ id: `nova-${inseridas.length}`, archived_at: null, ...payload });
        inseridas.push(payload);
        return { then: (ok: (v: unknown) => unknown) => Promise.resolve(ok({ error: null })) };
      },
      maybeSingle: async () => {
        let filtradas = linhas.filter((l) =>
          Object.entries(filtros).every(([k, v]) => (k.startsWith("is:") ? (l as any)[k.slice(3)] === v : (l as any)[k] === v)),
        );
        if (api._ordem) {
          filtradas = [...filtradas].sort((a: any, b: any) => {
            const d = (b[api._ordem.campo] ?? 0) - (a[api._ordem.campo] ?? 0);
            return api._ordem.asc ? -d : d;
          });
        }
        return { data: filtradas[0] ?? null, error: null };
      },
      then: (ok: (v: unknown) => unknown) => {
        const filtradas = linhas.filter((l) =>
          Object.entries(filtros).every(([k, v]) => (k.startsWith("is:") ? (l as any)[k.slice(3)] === v : (l as any)[k] === v)),
        );
        return Promise.resolve(ok({ data: filtradas, error: null }));
      },
    };
    return api;
  }

  return {
    from: (_tabela: string) => chain(),
    _linhas: () => linhas,
    _inseridas: inseridas,
  };
}

const CTX = { organizationId: "org-1", caseId: "caso-1", parametersId: "params-1", contractId: null, userId: "user-1" };

const VIGENTE_ANEXO_III = {
  annex_code: "ANEXO_III_AUTORIZACAO_PESQUISA",
  annex_version: 2,
  status: "ready_for_review",
  title: "Autorização de pesquisa",
  annex_type: "authorization",
  applicability_rule: "regra",
  source: "contrato-base + ficha do caso",
  source_reference: "parametros:params-1",
  model_version: "ANEXO-III-v1",
  organization_id: "org-1",
  case_id: "caso-1",
  structured_data: { aplicavel: true, pendencias: [] },
  rendered_html: "<h3>ANEXO III</h3>",
  reason_not_applicable: null,
  is_test: false,
  archived_at: null,
};

describe("anexoDispensadoManualmente", () => {
  it("só é true com status not_applicable + override manual marcado", () => {
    expect(anexoDispensadoManualmente(null)).toBe(false);
    expect(anexoDispensadoManualmente({ status: "not_applicable", structured_data: {} })).toBe(false);
    expect(anexoDispensadoManualmente({ status: "not_applicable", structured_data: { overrideManual: true } })).toBe(true);
    expect(anexoDispensadoManualmente({ status: "missing", structured_data: { overrideManual: true } })).toBe(false);
  });
});

describe("dispensarAnexoManualmente", () => {
  it("exige motivo não vazio", async () => {
    const supabase = supabaseFalso([VIGENTE_ANEXO_III]);
    await expect(
      dispensarAnexoManualmente(supabase as any, { ...CTX, annexCode: "ANEXO_III_AUTORIZACAO_PESQUISA", motivo: "   " }),
    ).rejects.toThrow(/motivo/i);
  });

  it("recusa dispensar anexo já anexado/assinado/arquivado", async () => {
    const supabase = supabaseFalso([{ ...VIGENTE_ANEXO_III, status: "signed_with_contract" }]);
    await expect(
      dispensarAnexoManualmente(supabase as any, { ...CTX, annexCode: "ANEXO_III_AUTORIZACAO_PESQUISA", motivo: "Cliente dispensou" }),
    ).rejects.toThrow(/signed_with_contract/);
  });

  it("recusa dispensar anexo que ainda não foi sincronizado", async () => {
    const supabase = supabaseFalso([]);
    await expect(
      dispensarAnexoManualmente(supabase as any, { ...CTX, annexCode: "ANEXO_III_AUTORIZACAO_PESQUISA", motivo: "Motivo qualquer" }),
    ).rejects.toThrow(/ainda não sincronizado/);
  });

  it("cria versão nova com status not_applicable, motivo e marca de override — nunca edita a vigente", async () => {
    const supabase = supabaseFalso([VIGENTE_ANEXO_III]);
    const r = await dispensarAnexoManualmente(supabase as any, {
      ...CTX,
      annexCode: "ANEXO_III_AUTORIZACAO_PESQUISA",
      motivo: "Cliente não fará pesquisa externa nesta fase — decisão registrada em reunião.",
    });

    expect(r.ok).toBe(true);
    expect(r.annexVersion).toBe(3);
    expect(supabase._inseridas).toHaveLength(1);
    const nova = supabase._inseridas[0] as any;
    expect(nova.annex_version).toBe(3);
    expect(nova.status).toBe("not_applicable");
    expect(nova.reason_not_applicable).toContain("Cliente não fará pesquisa externa");
    expect(nova.structured_data.overrideManual).toBe(true);
    expect(nova.structured_data.overrideMotivo).toContain("Cliente não fará pesquisa externa");
    expect(nova.structured_data.overrideUserId).toBe("user-1");

    // A linha antiga permanece intacta — nunca foi editada em lugar.
    const antiga = supabase._linhas().find((l: any) => l.annex_version === 2);
    expect((antiga as any).status).toBe("ready_for_review");
  });
});

describe("sincronizarAnexosPersistidos — preserva dispensa manual", () => {
  const instanciaRegraAtual: InstanciaAnexo = {
    annex_code: "ANEXO_III_AUTORIZACAO_PESQUISA",
    title: "Autorização de pesquisa",
    annex_type: "authorization",
    natureza: "governado",
    applicability_rule: "regra atualizada",
    source: "contrato-base + ficha do caso",
    model_version: "ANEXO-III-v1",
    required_for_contract: true,
    status: "missing",
    structured_data: { aplicavel: true, pendencias: ["Falta procuração"] },
    rendered_html: "<h3>ANEXO III</h3><p>novo</p>",
    reason_not_applicable: null,
  };

  it("não recria versão para um anexo dispensado manualmente, mesmo com a regra tendo mudado", async () => {
    const dispensado = {
      ...VIGENTE_ANEXO_III,
      annex_version: 3,
      status: "not_applicable",
      structured_data: { overrideManual: true, overrideMotivo: "Cliente dispensou", overrideUserId: "user-1" },
      reason_not_applicable: "Cliente dispensou",
    };
    const supabase = supabaseFalso([dispensado]);

    const resultado = await sincronizarAnexosPersistidos(
      supabase as any,
      { ...CTX, previaId: null },
      [instanciaRegraAtual],
    );

    expect(resultado.dispensadosPreservados).toBe(1);
    expect(resultado.novas).toBe(0);
    expect(supabase._inseridas).toHaveLength(0);
  });

  it("continua versionando normalmente um anexo que não está dispensado", async () => {
    const supabase = supabaseFalso([{ ...VIGENTE_ANEXO_III, structured_data: { aplicavel: true, pendencias: [] } }]);

    const resultado = await sincronizarAnexosPersistidos(
      supabase as any,
      { ...CTX, previaId: null },
      [instanciaRegraAtual],
    );

    expect(resultado.dispensadosPreservados).toBe(0);
    expect(resultado.novas).toBe(1);
  });
});

describe("reativarAnexoManual", () => {
  const instanciaRegraAtual: InstanciaAnexo = {
    annex_code: "ANEXO_III_AUTORIZACAO_PESQUISA",
    title: "Autorização de pesquisa",
    annex_type: "authorization",
    natureza: "governado",
    applicability_rule: "regra atualizada",
    source: "contrato-base + ficha do caso",
    model_version: "ANEXO-III-v1",
    required_for_contract: true,
    status: "missing",
    structured_data: { aplicavel: true, pendencias: ["Falta procuração"] },
    rendered_html: "<h3>ANEXO III</h3><p>novo</p>",
    reason_not_applicable: null,
  };

  it("é não-op quando o anexo não está dispensado", async () => {
    const supabase = supabaseFalso([VIGENTE_ANEXO_III]);
    const r = await reativarAnexoManual(supabase as any, { ...CTX, previaId: null }, instanciaRegraAtual);
    expect(r.jaAtivo).toBe(true);
    expect(supabase._inseridas).toHaveLength(0);
  });

  it("cria versão nova recalculada pela regra quando o anexo estava dispensado", async () => {
    const dispensado = {
      ...VIGENTE_ANEXO_III,
      annex_version: 3,
      status: "not_applicable",
      structured_data: { overrideManual: true, overrideMotivo: "Cliente dispensou", overrideUserId: "user-1" },
      reason_not_applicable: "Cliente dispensou",
    };
    const supabase = supabaseFalso([dispensado]);

    const r = await reativarAnexoManual(supabase as any, { ...CTX, previaId: null }, instanciaRegraAtual);
    expect(r.jaAtivo).toBe(false);
    expect(r.versoesNovas).toBe(1);
    expect(supabase._inseridas).toHaveLength(1);
    const nova = supabase._inseridas[0] as any;
    expect(nova.status).toBe("missing");
    expect(nova.structured_data.overrideManual).toBeUndefined();
    expect(nova.annex_version).toBe(4);
  });
});
