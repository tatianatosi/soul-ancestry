/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Guard de saída da prévia, no servidor — um lugar só (09/10/2026).
 *
 * `previa-vigente.ts` já tinha as regras puras (qual é a vigente, o que é
 * defasagem, o que é prévia sem corpo). O que faltava era a outra metade: a
 * medição mostrou que só PDF e DOCX consultavam essas regras, e mesmo esses
 * dois aceitavam QUALQUER `previaId` vivo — no caso da Ana existem duas
 * prévias vivas (o rascunho de trabalho v0 e a congelada v8), então bastava
 * mandar o id da outra. `solicitarRevisaoHumana` e `enviarParaAssinatura`
 * não consultavam nada: dava para pedir revisão e preparar assinatura com a
 * prévia defasada, que é exatamente o que a regra proíbe.
 *
 * Aqui a regra passa a ser uma só, chamada pelos quatro caminhos de saída:
 * documento (PDF/DOCX), revisão e assinatura.
 */
import { previaVigente, motivoBloqueioSaida, type PreviaRegistro } from "@/lib/previa-vigente";
import { RENDERIZADOR_VERSAO } from "@/lib/renderizador-versao";

const CAMPOS_PREVIA =
  "id,versao,tipo,estado,congelado_em,created_at,updated_at,aprovado_em,corpo_contratual,legado_sem_corpo,archived_at,parameters_id,renderizador_versao";

/** Prévias vivas da ficha, em ordem de versão — nunca as arquivadas. */
export async function previasVivasDoRegistro(
  supabase: any,
  args: { parametersId: string; organizationId: string },
): Promise<PreviaRegistro[]> {
  const { data, error } = await supabase
    .from("contract_parameter_previews")
    .select(CAMPOS_PREVIA)
    .eq("parameters_id", args.parametersId)
    .eq("organization_id", args.organizationId)
    .is("archived_at", null)
    .order("versao", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PreviaRegistro[];
}

/**
 * Quando um parâmetro COM valor mudou pela última vez.
 *
 * Linha semeada vazia (foi o que a migration de `modo_anexos` fez em 08/10)
 * não mudou o documento — não marca a prévia como velha nem trava a saída.
 */
export async function ultimaAlteracaoDeParametro(
  supabase: any,
  parametersId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("contract_parameter_values")
    .select("atualizado_em")
    .eq("parameters_id", parametersId)
    .not("valor", "is", null)
    .is("archived_at", null)
    .order("atualizado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.atualizado_em as string | undefined) ?? null;
}

export type SaidaDaPrevia = "documento" | "revisao" | "assinatura";

const COMO_SE_CHAMA: Record<SaidaDaPrevia, string> = {
  documento: "baixar o documento",
  revisao: "pedir revisão humana",
  assinatura: "preparar a assinatura",
};

/**
 * Recusa a saída quando a prévia não é a vigente, não tem corpo contratual,
 * ou está defasada. Devolve a prévia vigente quando libera.
 *
 * `previaId` é opcional: a revisão e a assinatura agem sobre a ficha, não
 * sobre um id escolhido na tela. Quando vem informado (PDF/DOCX), precisa
 * ser exatamente a vigente — id de prévia substituída é recusado com nome.
 */
export async function exigirPreviaVigenteLiberada(
  supabase: any,
  args: {
    parametersId: string;
    organizationId: string;
    saida: SaidaDaPrevia;
    previaId?: string | null;
  },
): Promise<PreviaRegistro> {
  const vivas = await previasVivasDoRegistro(supabase, args);
  const vigente = previaVigente(vivas);
  if (!vigente) {
    throw new Error(`Nenhuma prévia gerada para este contrato — gere a prévia antes de ${COMO_SE_CHAMA[args.saida]}.`);
  }
  if (args.previaId && args.previaId !== vigente.id) {
    throw new Error(
      `Esta prévia foi substituída pela vigente (v${vigente.versao ?? "?"}). ` +
        `Só a prévia vigente serve para ${COMO_SE_CHAMA[args.saida]} — abra a prévia atual e repita a ação.`,
    );
  }
  const alteradoEm = await ultimaAlteracaoDeParametro(supabase, args.parametersId);
  const bloqueio = motivoBloqueioSaida(vigente, alteradoEm, RENDERIZADOR_VERSAO);
  if (bloqueio) throw new Error(bloqueio);
  return vigente;
}
