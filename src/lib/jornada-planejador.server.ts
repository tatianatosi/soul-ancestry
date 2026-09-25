/**
 * P4 (25/09/2026) — leitor + escritor pontual da jornada do planejador em
 * Caso 360. `case_plans` continua sendo gravada em cheio só por
 * `sincronizarPlanejador` (elo 1 da cadeia, hash + versão); esta escrita
 * pontual nunca cria linha nem toca `plano_hash`/`versao`/`status`.
 */
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { produtoPaiPorId, type ProdutoPaiId } from "@/lib/planejador-produtos-pai";
import { bloqueiosDoPlano, jornadaMudou, patchJornada, prazoValido, type CamposJornada } from "@/lib/jornada-planejador";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function planoAtualDoCaso(supabase: any, organizationId: string, caseId: string) {
  const { data, error } = await supabase
    .from("case_plans")
    .select(
      "id,versao,status,etapa,rota_confirmada,produto_pai_id,marco_atual,marcos,responsavel_user_id,proxima_acao,prazo_proxima_acao,proxima_microentrega,motivos_bloqueio,product_catalog_id,updated_at,updated_by",
    )
    .eq("organization_id", organizationId)
    .eq("case_id", caseId)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Record<string, any> | null;
}

/** Leitura da jornada persistida do caso — nunca cria nada. */
export async function lerJornadaDoCaso(supabase: any, organizationId: string, caseId: string) {
  const plano = await planoAtualDoCaso(supabase, organizationId, caseId);
  if (!plano) return { existe: false as const };

  const [responsavel, sku] = await Promise.all([
    plano.responsavel_user_id
      ? supabase.from("profiles").select("id,nome").eq("id", plano.responsavel_user_id).maybeSingle()
      : Promise.resolve({ data: null }),
    // P4 item 4: SKU só informativo — lido aqui só para exibir, nunca gate.
    plano.product_catalog_id
      ? supabase.from("product_catalog").select("code,nome_comercial").eq("id", plano.product_catalog_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const produtoPai = produtoPaiPorId(plano.produto_pai_id as ProdutoPaiId | null);

  return {
    existe: true as const,
    id: plano.id as string,
    versao: Number(plano.versao ?? 0),
    status: (plano.status as string) ?? null,
    etapa: (plano.etapa as string | null) ?? null,
    rotaConfirmada: (plano.rota_confirmada as string | null) ?? null,
    produtoPaiId: (plano.produto_pai_id as ProdutoPaiId | null) ?? null,
    produtoPaiNome: produtoPai?.nome ?? null,
    marcoAtual: (plano.marco_atual as string | null) ?? null,
    marcos: (Array.isArray(plano.marcos) ? plano.marcos : []) as string[],
    responsavelUserId: (plano.responsavel_user_id as string | null) ?? null,
    responsavelNome: (responsavel.data?.nome as string | undefined) ?? null,
    proximaAcao: (plano.proxima_acao as string | null) ?? null,
    prazoProximaAcao: (plano.prazo_proxima_acao as string | null) ?? null,
    proximaMicroentrega: (plano.proxima_microentrega as string | null) ?? null,
    bloqueios: bloqueiosDoPlano(plano.motivos_bloqueio),
    skuCodigo: (sku.data?.code as string | undefined) ?? null,
    skuNome: (sku.data?.nome_comercial as string | undefined) ?? null,
    atualizadoEm: (plano.updated_at as string | null) ?? null,
    atualizadoPorId: (plano.updated_by as string | null) ?? null,
  };
}

/**
 * Edição pontual dos campos da jornada. Nunca cria a linha (o formulário
 * grande — "Preencher planejador" — é quem cria); recusa com mensagem clara
 * se ainda não há plano, em vez de fingir persistência. O payload gravado
 * nunca inclui `versao`/`plano_hash`/`status` — só os 7 campos da jornada.
 */
export async function salvarJornadaDoCaso(
  supabase: any,
  input: { organizationId: string; caseId: string; userId: string; campos: CamposJornada },
) {
  if (!prazoValido(input.campos.prazo_proxima_acao)) {
    return { ok: false as const, erro: "Prazo da próxima ação inválido — use o seletor de data." };
  }

  const plano = await planoAtualDoCaso(supabase, input.organizationId, input.caseId);
  if (!plano) {
    return {
      ok: false as const,
      erro: 'Este caso ainda não tem planejador preenchido. Use "Preencher planejador" abaixo antes de editar a jornada.',
    };
  }

  const patch = patchJornada(input.campos);
  if (!jornadaMudou(patch)) {
    return { ok: true as const, mudou: false as const };
  }

  const resultado = await gravarComVerificacao({
    supabase,
    tabela: "case_plans",
    id: plano.id as string,
    organizationId: input.organizationId,
    userId: input.userId,
    payload: patch,
  });

  await registrarTimelineCaso(supabase, {
    organizationId: input.organizationId,
    caseId: input.caseId,
    eventType: "caso",
    title: "Jornada do planejador atualizada",
    summaryInternal: Object.keys(patch)
      .map((c) => `${c}: ${String((resultado.registro as Record<string, unknown>)[c] ?? "—")}`)
      .join(" · "),
    sourceEntityType: "case_plans",
    sourceEntityId: plano.id as string,
    userId: input.userId,
    nextAction: (resultado.registro as Record<string, unknown>)["proxima_acao"] as string | null,
  });

  return { ok: true as const, mudou: true as const };
}
