/**
 * Campos obrigatórios de conteúdo — rascunho sempre salva.
 *
 * Decisão da proprietária em 05/09/2026: o sistema exigia campo preenchido
 * antes de gravar mesmo em registro de trabalho. Salvar um lead pedia sete
 * campos ao mesmo tempo — nome, telefone ou e-mail, origem, interesse,
 * responsável, próxima ação e prazo. Enquanto faltasse um, nada era gravado e
 * o trabalho se perdia.
 *
 * Regra: para a proprietária administradora, campo de conteúdo faltando vira
 * pendência registrada, não recusa. O registro salva como está e a lista do
 * que falta acompanha o registro.
 *
 * Isto vale apenas para campo de CONTEÚDO (nome, resumo, origem, prazo).
 * Não vale para identificador (caso, pesquisa, cliente, fatura): sem o
 * identificador não há onde gravar, e afrouxar isso escreveria no registro
 * errado.
 */

import { proprietariaOperando } from "@/lib/autoridade.server";

export type CampoFaltante = { campo: string; mensagem: string };

/**
 * Verifica campos de conteúdo.
 *
 * - Proprietária: devolve a lista do que falta, sem lançar. O chamador grava
 *   assim mesmo e registra a pendência.
 * - Demais papéis: lança na primeira falta, como antes.
 */
export async function exigirCamposDeConteudo(
  supabase: { from: (t: string) => any },
  userId: string,
  faltantes: readonly CampoFaltante[],
): Promise<string[]> {
  const lista = faltantes.filter((f) => Boolean(f?.mensagem));
  if (lista.length === 0) return [];
  if (await proprietariaOperando(supabase, userId)) {
    return lista.map((f) => f.mensagem);
  }
  throw new Error(lista[0].mensagem);
}

/** Monta a lista de faltantes a partir de pares condição/mensagem. */
export function faltando(
  ...pares: readonly (readonly [boolean, string, string])[]
): CampoFaltante[] {
  return pares
    .filter(([condicaoDeFalta]) => condicaoDeFalta)
    .map(([, campo, mensagem]) => ({ campo, mensagem }));
}
