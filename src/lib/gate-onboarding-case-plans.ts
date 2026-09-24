/**
 * Gate de onboarding em case_plans — convivência pré/pós migration.
 *
 * A migration `20260924190000_case_plans_gate_onboarding` está versionada,
 * mas NÃO foi aplicada no banco conectado (decisão da Proprietária,
 * 24/09/2026: não aplicar sem nova autorização de banco). Enquanto isso,
 * qualquer leitura ou escrita dessas colunas precisa dizer o que aconteceu
 * em vez de engolir o erro:
 *
 * - leitura pré-migration: usa onboarding_planos (fonte real do gate) e
 *   devolve o aviso — nunca finge que leu case_plans;
 * - escrita pré-migration: não grava nada em lugar nenhum além da escrita
 *   real já feita em onboarding_planos, e devolve o aviso;
 * - qualquer outro erro: é erro, com mensagem explícita.
 *
 * Nada aqui grava em outra tabela para "compensar" a coluna ausente.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export const MIGRATION_GATE_CASE_PLANS = "20260924190000_case_plans_gate_onboarding";

export const AVISO_PRE_MIGRATION_GATE =
  `As colunas do gate de onboarding ainda não existem em case_plans no banco conectado (migration ${MIGRATION_GATE_CASE_PLANS} pendente). ` +
  "O gate foi lido de onboarding_planos; nada foi gravado em case_plans.";

type ErroBanco = { code?: string | null; message?: string | null } | null | undefined;

/** Erro de coluna inexistente (Postgres 42703 ou PostgREST PGRST204). */
export function colunaAusenteNoBanco(error: ErroBanco): boolean {
  if (!error) return false;
  if (error.code === "42703" || error.code === "PGRST204") return true;
  const msg = String(error.message ?? "");
  return /column .* does not exist/i.test(msg) || /could not find the '.*' column/i.test(msg);
}

export type LeituraGateCasePlans =
  | { estado: "pos_migration"; motivos: unknown }
  | { estado: "pre_migration"; aviso: string };

/**
 * Interpreta a leitura de `case_plans.motivos_bloqueio`. Linha ausente
 * (data null, sem erro) é pós-migration sem linha: motivos = undefined e o
 * leitor cai para onboarding_planos pela regra já existente.
 */
export function lerGateCasePlans(r: { data?: any; error?: ErroBanco }): LeituraGateCasePlans {
  if (colunaAusenteNoBanco(r.error)) return { estado: "pre_migration", aviso: AVISO_PRE_MIGRATION_GATE };
  if (r.error) {
    throw new Error(`Não foi possível ler o gate de onboarding em case_plans: ${r.error.message ?? "erro desconhecido"}`);
  }
  return { estado: "pos_migration", motivos: r.data?.motivos_bloqueio };
}

/** Motivos a passar para `onboardingLiberadoDoCaso` — só quando a coluna existe. */
export function motivosDaLeitura(l: LeituraGateCasePlans): unknown {
  return l.estado === "pos_migration" ? l.motivos : undefined;
}

export type ResultadoEspelhoCasePlans = {
  estado: "espelhado" | "sem_linha_case_plans" | "pre_migration" | "erro";
  aviso: string | null;
};

/**
 * Espelha `motivos_bloqueio` na linha de case_plans com
 * fase_jornada = 'onboarding', quando ela existe. Nunca cria linha, nunca
 * grava em outra tabela. Não derruba a escrita real (onboarding_planos) —
 * mas devolve o que aconteceu, para a tela e o teste verem.
 */
export async function espelharMotivosBloqueioEmCasePlans(
  supabase: any,
  input: { organizationId: string; caseId: string; motivos: string[]; userId: string },
): Promise<ResultadoEspelhoCasePlans> {
  const { data, error } = await supabase
    .from("case_plans")
    .update({ motivos_bloqueio: input.motivos, updated_by: input.userId })
    .eq("organization_id", input.organizationId)
    .eq("case_id", input.caseId)
    .eq("fase_jornada", "onboarding")
    .is("archived_at", null)
    .select("id");
  if (colunaAusenteNoBanco(error)) return { estado: "pre_migration", aviso: AVISO_PRE_MIGRATION_GATE };
  if (error) {
    return {
      estado: "erro",
      aviso: `O espelho do gate em case_plans falhou (${error.message ?? "erro desconhecido"}); o plano de onboarding foi gravado normalmente.`,
    };
  }
  if (!Array.isArray(data) || data.length === 0) {
    return {
      estado: "sem_linha_case_plans",
      aviso: "O caso ainda não tem plano de jornada na fase de onboarding; o gate ficou só em onboarding_planos.",
    };
  }
  return { estado: "espelhado", aviso: null };
}
