/**
 * Rótulo humano de fase da jornada — ponto único onde a divergência de
 * vocabulário fica visível.
 *
 * 26/08/2026 (CA-AUD-12): a jornada de entrega tem HOJE dois conjuntos de
 * identificadores para as mesmas oito fases:
 *
 *   - `jornada-cliente.ts`   → aceite_formalizacao, pesquisa_validacao, …
 *   - `onboarding-jornada.ts` → aceite_e_formalizacao, pesquisa_e_validacao, …
 *
 * Quem GRAVA em `case_plans.fase_jornada` é o segundo; quem ROTULA nas telas era
 * o primeiro. A coluna é `string` livre no banco, então nada impede a
 * divergência — e o resultado aparecia na tela como `aceite_e_formalizacao — 3`.
 *
 * Este módulo NÃO escolhe o vocabulário canônico: essa é decisão de dado, com
 * migração, e não cabe a uma função de exibição. Ele apenas garante que os dois
 * conjuntos rendam o mesmo rótulo legível, e deixa a divergência registrada em
 * um lugar só, para que a unificação futura tenha um alvo óbvio.
 */

import { FASES_JORNADA as FASES_ONBOARDING } from "@/lib/onboarding-jornada";
import { ROTULO_FASE as ROTULO_ENTREGA } from "@/lib/jornada-cliente";

/** Remove o "_e_" opcional para que as duas grafias colidam na mesma chave. */
function normalizar(valor: string): string {
  return valor.trim().toLowerCase().replace(/_e_/g, "_");
}

const MAPA = new Map<string, string>();
for (const [id, rotulo] of Object.entries(ROTULO_ENTREGA)) MAPA.set(normalizar(id), rotulo);
for (const f of FASES_ONBOARDING) MAPA.set(normalizar(f.id), f.rotulo);

/**
 * Rótulo interno da fase. Valor desconhecido volta como veio — inventar um
 * rótulo esconderia justamente o dado fora do catálogo que precisa aparecer.
 */
export function rotuloFase(valor: string | null | undefined): string {
  if (!valor) return "Sem fase registrada";
  return MAPA.get(normalizar(valor)) ?? valor;
}

/** Rótulo que o cliente lê, quando a fase existe no catálogo de onboarding. */
export function rotuloFaseCliente(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const alvo = normalizar(valor);
  return FASES_ONBOARDING.find((f) => normalizar(f.id) === alvo)?.cliente ?? null;
}
