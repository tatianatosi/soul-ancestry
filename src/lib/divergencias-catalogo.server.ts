/**
 * Leitura e triagem das divergências de catálogo registradas.
 *
 * Camada somente de consulta e de anotação: registra observação de resolução
 * com autor e data, sem aprovar preço, alterar catálogo ou liberar bloqueio.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type Sb = any;

export type StatusDivergencia = "atencao" | "bloqueio";

export type LinhaDivergencia = {
  id: string;
  sku: string;
  tipo: string;
  detalhe: string;
  severidade: StatusDivergencia;
  resolvido: boolean;
  fonte_referencia: string;
  caso_codigo: string | null;
  caso_titulo: string | null;
  contrato_numero: string | null;
  os_numero: string | null;
  observacao_resolucao: string | null;
  resolucao_registrada_em: string | null;
  created_at: string;
};

const severidadeDe = (row: any): StatusDivergencia =>
  row.severidade === "bloqueio" || String(row.detalhe ?? "").startsWith("[BLOQUEANTE]")
    ? "bloqueio"
    : "atencao";

/** Lista divergências da organização com os vínculos de caso, contrato e OS. */
export async function listarDivergencias(
  supabase: Sb,
  input: { org: string },
): Promise<{ linhas: LinhaDivergencia[]; resumo: { total: number; bloqueio: number; atencao: number; resolvidas: number } }> {
  const { data, error } = await supabase
    .from("catalog_source_divergences")
    .select(
      "id,sku,tipo,detalhe,severidade,resolvido,fonte_referencia,case_id,contract_id,service_order_id,observacao_resolucao,resolucao_registrada_em,created_at",
    )
    .eq("organization_id", input.org)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as any[];

  const casos = new Set<string>();
  const contratos = new Set<string>();
  const oss = new Set<string>();
  for (const r of rows) {
    if (r.case_id) casos.add(r.case_id);
    if (r.contract_id) contratos.add(r.contract_id);
    if (r.service_order_id) oss.add(r.service_order_id);
  }

  const mapaCaso = new Map<string, { codigo: string | null; titulo: string | null }>();
  if (casos.size) {
    const { data: cs } = await supabase
      .from("crm_casos")
      .select("id,codigo,titulo")
      .in("id", [...casos]);
    for (const c of (cs ?? []) as any[]) mapaCaso.set(c.id, { codigo: c.codigo ?? null, titulo: c.titulo ?? null });
  }

  const mapaContrato = new Map<string, string | null>();
  if (contratos.size) {
    const { data: cs } = await supabase.from("contracts").select("id,contract_number").in("id", [...contratos]);
    for (const c of (cs ?? []) as any[]) mapaContrato.set(c.id, c.contract_number ?? null);
  }

  const mapaOs = new Map<string, string | null>();
  if (oss.size) {
    const { data: os } = await supabase
      .from("service_orders")
      .select("id,service_order_number")
      .in("id", [...oss]);
    for (const o of (os ?? []) as any[]) mapaOs.set(o.id, o.service_order_number ?? null);
  }

  const linhas: LinhaDivergencia[] = rows.map((r) => ({
    id: r.id,
    sku: r.sku,
    tipo: r.tipo,
    detalhe: r.detalhe,
    severidade: severidadeDe(r),
    resolvido: !!r.resolvido,
    fonte_referencia: r.fonte_referencia,
    caso_codigo: r.case_id ? (mapaCaso.get(r.case_id)?.codigo ?? null) : null,
    caso_titulo: r.case_id ? (mapaCaso.get(r.case_id)?.titulo ?? null) : null,
    contrato_numero: r.contract_id ? (mapaContrato.get(r.contract_id) ?? null) : null,
    os_numero: r.service_order_id ? (mapaOs.get(r.service_order_id) ?? null) : null,
    observacao_resolucao: r.observacao_resolucao ?? null,
    resolucao_registrada_em: r.resolucao_registrada_em ?? null,
    created_at: r.created_at,
  }));

  return {
    linhas,
    resumo: {
      total: linhas.length,
      bloqueio: linhas.filter((l) => !l.resolvido && l.severidade === "bloqueio").length,
      atencao: linhas.filter((l) => !l.resolvido && l.severidade === "atencao").length,
      resolvidas: linhas.filter((l) => l.resolvido).length,
    },
  };
}

/** Anexa observação de resolução a uma divergência, com auditoria. */
export async function anotarResolucao(
  supabase: Sb,
  input: { org: string; userId: string; id: string; observacao: string },
) {
  const observacao = input.observacao.trim();
  if (observacao.length < 5) throw new Error("Descreva a resolução com pelo menos 5 caracteres.");

  const { data: atual } = await supabase
    .from("catalog_source_divergences")
    .select("id,organization_id,sku,tipo,observacao_resolucao")
    .eq("id", input.id)
    .maybeSingle();
  if (!atual || atual.organization_id !== input.org)
    throw new Error("Divergência não encontrada nesta organização.");

  const agora = new Date().toISOString();
  const { error } = await supabase
    .from("catalog_source_divergences")
    .update({
      observacao_resolucao: observacao,
      resolucao_registrada_em: agora,
      resolucao_registrada_por: input.userId,
    })
    .eq("id", input.id);
  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    organization_id: input.org,
    user_id: input.userId,
    acao: "divergencia_catalogo_observacao_registrada",
    entidade: "catalog_source_divergences",
    entidade_id: input.id,
    metadados: {
      sku: atual.sku,
      tipo: atual.tipo,
      antes: atual.observacao_resolucao ?? null,
      depois: observacao,
    },
  });

  return { ok: true, registrada_em: agora };
}
