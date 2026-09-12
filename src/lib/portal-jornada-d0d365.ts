/**
 * D0–D365 do App Cliente — régua de tempo derivada de data real do caso.
 *
 * D0 é a data em que o acompanhamento começou de verdade:
 * `crm_casos.onboarding_iniciado_em` e, na falta dela, `created_at` — ambas já
 * expostas pela view `portal_casos` (RLS de portal). Não há estimativa, meta
 * projetada nem prazo inventado: sem data real, a faixa devolve `null` e a
 * tela mostra estado explícito.
 */
import { diasEntre } from "@/lib/onboarding-jornada";

export const TOTAL_DIAS_JORNADA = 365;

export type FaixaJornada = {
  /** Dia corrente do acompanhamento (D0 = dia de início). `null` sem data real. */
  dia: number | null;
  total: number;
  /** Percentual do ciclo de 365 dias já percorrido. `null` sem data real. */
  percentual: number | null;
  /** Rótulo curto: "D48 de 365" ou estado explícito. */
  rotulo: string;
  inicioEm: string | null;
};

export function faixaD0D365(
  inicioEm?: string | null,
  hoje = new Date(),
): FaixaJornada {
  const dias = diasEntre(inicioEm ?? null, hoje);
  if (dias === null || dias < 0) {
    return {
      dia: null,
      total: TOTAL_DIAS_JORNADA,
      percentual: null,
      rotulo: "Data de início ainda não registrada",
      inicioEm: inicioEm ?? null,
    };
  }
  const dia = dias;
  const percentual = Math.min(100, Math.round((dia / TOTAL_DIAS_JORNADA) * 100));
  return {
    dia,
    total: TOTAL_DIAS_JORNADA,
    percentual,
    rotulo:
      dia > TOTAL_DIAS_JORNADA
        ? `D${dia} — além do ciclo de ${TOTAL_DIAS_JORNADA} dias`
        : `D${dia} de ${TOTAL_DIAS_JORNADA}`,
    inicioEm: inicioEm ?? null,
  };
}
