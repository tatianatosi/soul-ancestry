/**
 * Validação cruzada de coerência aplicada aos registros contratuais.
 * Server-only: usa o cliente Supabase autenticado do contexto.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { CONFLITO_PAIS_ROTA, validarCoerenciaCaso } from "@/lib/coerencia-caso";
import { parametrosDoPlanejador } from "@/lib/planejador-parametros";

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

/** Lança erro quando há conflito crítico de país/rota. */
export async function exigirCoerencia(supabase: Sb, registro: any) {
  const { conflitos } = await conflitosCoerenciaDoRegistro(supabase, registro);
  if (conflitos.length) throw new Error(`Conflito crítico (${CONFLITO_PAIS_ROTA}): ${conflitos[0].mensagem}`);
}
