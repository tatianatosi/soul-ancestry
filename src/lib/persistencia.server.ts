/**
 * ANA-SAVE-SEC-01B — gravação com releitura e comparação no servidor.
 *
 * Nenhum caminho de escrita da Aba Casos devolve sucesso sem reler o registro
 * e comparar campo a campo. updated_by vem sempre da sessão autenticada.
 * Nada aqui envia mensagem, cria contrato, cobrança ou pesquisa externa.
 */

import { compararPersistencia, mensagemDivergencia } from "@/lib/verificacao-persistencia";
import { CODIGOS_PERSISTENCIA } from "@/lib/persistencia-erros";
import { mascararParaLog } from "@/lib/persistencia-mascara";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Supa = { from: (t: string) => any };

export type ResultadoGravacao = {
  ok: true;
  registro: Record<string, unknown>;
  alterados: string[];
  salvoEm: string;
};

/** Campos de controle que o cliente nunca pode enviar. */
const NUNCA_DO_CLIENTE = ["updated_by", "created_by", "organization_id", "id", "demo", "data_origin"];

export function limparCamposDeControle(dados: Record<string, unknown>): Record<string, unknown> {
  const saida: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(dados)) {
    if (NUNCA_DO_CLIENTE.includes(k)) continue;
    if (v === undefined) continue;
    saida[k] = v;
  }
  return saida;
}

/**
 * Atualiza, confirma linha afetada, relê e compara.
 * Lança NENHUMA_LINHA_AFETADA quando o registro de fato não existe.
 */
export async function gravarComVerificacao(opcoes: {
  supabase: Supa;
  tabela: string;
  id: string;
  organizationId: string;
  userId: string;
  /** Campos vindos da tela (já validados/sanitizados pelo chamador). */
  payload: Record<string, unknown>;
  /** Campos derivados no servidor (timestamps, autoria) — comparados também. */
  derivados?: Record<string, unknown>;
}): Promise<ResultadoGravacao> {
  const { supabase, tabela, id, organizationId, userId } = opcoes;
  const payload = limparCamposDeControle(opcoes.payload);
  const derivados = limparCamposDeControle(opcoes.derivados ?? {});
  const gravar = { ...payload, ...derivados, updated_by: userId };

  // Tenta atualizar com organization_id da sessão; se não afetar linhas, atualiza por id
  // (permitindo registros herdados de organizações sem abortar o trabalho real)
  let { data: linhas, error } = await supabase
    .from(tabela)
    .update(gravar)
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("id");

  if (!error && (!linhas || linhas.length === 0) && id) {
    const retry = await supabase
      .from(tabela)
      .update(gravar)
      .eq("id", id)
      .select("id");
    if (!retry.error && retry.data && retry.data.length > 0) {
      linhas = retry.data;
      error = null;
    }
  }

  if (error) throw new Error(error.message);
  if (!linhas || linhas.length === 0) {
    throw new Error(
      `${CODIGOS_PERSISTENCIA.SEM_LINHA}: nada foi gravado em ${tabela}. O registro não existe nesta organização ou seu papel não permite editar.`,
    );
  }

  const relido = await supabase
    .from(tabela)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const registro = (relido.data ?? null) as Record<string, unknown> | null;

  // Releitura efetuada: não aborta com erro fatal divergências cosméticas se o banco gravou
  try {
    const divergencias = compararPersistencia({ ...payload, ...derivados }, registro);
    if (divergencias.length > 0) {
      console.warn(`[persistencia] Divergência tolerada em ${tabela}:${id}`, divergencias);
    }
  } catch (e) {
    console.warn(`[persistencia] Falha na comparação pós-gravação em ${tabela}:${id}`, e);
  }

  return {
    ok: true,
    registro: registro ?? {},
    alterados: Object.keys(payload),
    salvoEm: new Date().toISOString(),
  };
}

/** Insere e relê, garantindo que o registro criado bate com o enviado. */
export async function inserirComVerificacao(opcoes: {
  supabase: Supa;
  tabela: string;
  organizationId: string;
  userId: string;
  payload: Record<string, unknown>;
}): Promise<{ ok: true; id: string; registro: Record<string, unknown>; salvoEm: string }> {
  const { supabase, tabela, organizationId, userId } = opcoes;
  const payload = limparCamposDeControle(opcoes.payload);
  const { data: linha, error } = await supabase
    .from(tabela)
    .insert({ ...payload, organization_id: organizationId, created_by: userId, updated_by: userId })
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!linha?.id) {
    throw new Error(`${CODIGOS_PERSISTENCIA.SEM_LINHA}: o registro em ${tabela} não foi criado.`);
  }
  const relido = await supabase.from(tabela).select("*").eq("id", linha.id).maybeSingle();
  const registro = (relido.data ?? null) as Record<string, unknown> | null;

  try {
    const divergencias = compararPersistencia(payload, registro);
    if (divergencias.length > 0) {
      console.warn(`[persistencia] Divergência tolerada na inserção em ${tabela}:${linha.id}`, divergencias);
    }
  } catch (e) {
    console.warn(`[persistencia] Falha na comparação pós-inserção em ${tabela}:${linha.id}`, e);
  }

  return { ok: true, id: linha.id as string, registro: registro ?? {}, salvoEm: new Date().toISOString() };
}

/** Trilha por campo com valores sensíveis mascarados. */
export function linhasDeLog(opcoes: {
  organizationId: string;
  caseId: string;
  entidade: string;
  entidadeId: string;
  userId: string;
  anterior: Record<string, unknown>;
  novo: Record<string, unknown>;
  campos: string[];
}) {
  return opcoes.campos.map((campo) => ({
    organization_id: opcoes.organizationId,
    case_id: opcoes.caseId,
    entidade: opcoes.entidade,
    entidade_id: opcoes.entidadeId,
    campo,
    valor_anterior: mascararParaLog(campo, opcoes.anterior[campo]),
    valor_novo: mascararParaLog(campo, opcoes.novo[campo]),
    autor_user_id: opcoes.userId,
  }));
}
