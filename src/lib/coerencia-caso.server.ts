/**
 * Validação cruzada de coerência aplicada aos registros contratuais.
 * Server-only: usa o cliente Supabase autenticado do contexto.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { CONFLITO_PAIS_ROTA, validarCoerenciaCaso } from "@/lib/coerencia-caso";
import { parametrosDoPlanejador } from "@/lib/planejador-parametros";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";

type Sb = any;

export const MARCA_CORRECAO_PLANEJADOR = "correção homologada do Planejador";

/** true quando o parâmetro já recebeu correção humana homologada do Planejador. */
export function temCorrecaoHomologada(valor: any) {
  return valor?.origem === "planejador" && String(valor?.origem_detalhe ?? "").includes(MARCA_CORRECAO_PLANEJADOR);
}

/**
 * Validação cruzada obrigatória: código canônico x Planejador x parâmetros x
 * proposta. Divergência é conflito crítico e bloqueia as transições.
 */
export async function conflitosCoerenciaDoRegistro(supabase: Sb, registro: any) {
  const { data: caso } = await supabase.from("crm_casos").select("id,codigo,pais,via").eq("id", registro.case_id).maybeSingle();
  const [{ data: valores }, propostaRes] = await Promise.all([
    supabase.from("contract_parameter_values").select("campo,valor,origem,origem_detalhe,status").eq("parameters_id", registro.id).is("archived_at", null),
    registro.proposal_id
      ? supabase.from("proposals").select("escopo,versao").eq("id", registro.proposal_id).maybeSingle()
      : Promise.resolve({ data: null } as any),
  ]);
  const linha = (campo: string) => (valores ?? []).find((v: any) => v.campo === campo) ?? null;
  const pegar = (campo: string) => linha(campo)?.valor ?? null;
  const planejador = parametrosDoPlanejador(caso?.codigo);
  const corrigido = temCorrecaoHomologada(linha("pais_rota"));
  const planejadorPais = corrigido ? null : (planejador.parametros.find((p) => p.campo === "pais_rota")?.valor ?? null);

  return validarCoerenciaCaso({
    codigo: caso?.codigo,
    fontes: [
      { fonte: "planejador", rotulo: "o Planejador homologado", valor: planejadorPais },
      { fonte: "parametro", rotulo: "o parâmetro contratual país/rota", valor: pegar("pais_rota") },
      { fonte: "crm", rotulo: "o cadastro do caso", valor: [caso?.pais, caso?.via].filter(Boolean).join(" / ") },
      { fonte: "produto", rotulo: "o produto/SKU parametrizado", valor: null },
      { fonte: "proposta", rotulo: "a proposta vinculada", valor: propostaRes?.data?.escopo ?? null },
    ],
  });
}

/** Ação de override interno reservada para o conflito país/rota — mesmo padrão de gates-formalizacao.ts. */
export const ACAO_OVERRIDE_CONFLITO_PAIS_ROTA = "confirmar_conflito_pais_rota";

/**
 * Lança erro quando há conflito crítico de país/rota — a menos que a
 * Proprietária Administradora já tenha registrado uma decisão auditada para
 * este caso especificamente (mesmo mecanismo de `exigirGate`,
 * escopo-conferencia.server.ts:281-322: ação interna, superável por decisão
 * auditada; nunca aplicável a ação externa/irreversível).
 *
 * 04/09/2026 — antes deste ajuste este era o único gate do fluxo contratual
 * sem nenhum caminho de override, mesmo sendo uma verificação de coerência de
 * dado (não uma aprovação externa) — achado da execução do pedido histórico
 * de remoção de barreiras operacionais.
 */
export async function exigirCoerencia(
  supabase: Sb,
  registro: any,
  ctx?: { userId: string; organizationId: string },
) {
  const { conflitos } = await conflitosCoerenciaDoRegistro(supabase, registro);
  if (!conflitos.length) return;

  if (ctx) {
    const { data: decisao } = await supabase
      .from("owner_override_events")
      .select("id")
      .eq("organization_id", ctx.organizationId)
      .eq("categoria", "override_interno")
      .eq("entidade_id", registro.case_id)
      .eq("campo", ACAO_OVERRIDE_CONFLITO_PAIS_ROTA)
      .eq("acao_externa", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (decisao) {
      await registrarAuditoria(supabase, {
        organization_id: ctx.organizationId,
        user_id: ctx.userId,
        acao: "conflito_pais_rota_superado_por_decisao_proprietaria",
        entidade: "crm_casos",
        entidade_id: registro.case_id,
        metadados: { conflito: conflitos[0].mensagem, decisao_event_id: decisao.id, pendencia_preservada: true },
      });
      return;
    }
  }

  throw new Error(`Conflito crítico (${CONFLITO_PAIS_ROTA}): ${conflitos[0].mensagem}`);
}
