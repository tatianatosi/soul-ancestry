/**
 * Checks cerimoniais de identidade (contratada / responsável).
 *
 * Em startup solo a proprietária É a contratada e o responsável padrão.
 * Pedir tick de checklist a cada caso só acrescenta burocracia.
 *
 * Estes itens são auto-satisfeitos quando o caso já tem responsável
 * (Tatiana / sessão admin) e saem da lista de ação — ficam só como
 * registro interno, se existirem.
 */

export const CHECKS_ATIVACAO_IDENTIDADE = [
  "responsavel_designado",
  "aprovacao_interna_ativacao",
] as const;

export const ITEMS_ONBOARDING_IDENTIDADE = ["responsavel_principal"] as const;

export const LABELS_ONBOARDING_IDENTIDADE = [
  "Responsável definido",
  "Responsável principal definido",
] as const;

export function ehCheckAtivacaoIdentidade(checkKey: string): boolean {
  return (CHECKS_ATIVACAO_IDENTIDADE as readonly string[]).includes(checkKey);
}

export function ehItemOnboardingIdentidade(itemCode: string, label?: string | null): boolean {
  if ((ITEMS_ONBOARDING_IDENTIDADE as readonly string[]).includes(itemCode)) return true;
  const l = (label ?? "").trim();
  return (LABELS_ONBOARDING_IDENTIDADE as readonly string[]).includes(l);
}

/** Filtra checks de ativação que a UI ainda pediria para “Validar”. */
export function filtrarChecksAtivacaoOperacionais<T extends { check_key: string }>(
  checks: readonly T[],
): T[] {
  return checks.filter((c) => !ehCheckAtivacaoIdentidade(c.check_key));
}

/** Filtra itens de onboarding que só reconfirmam responsável. */
export function filtrarItensOnboardingOperacionais<
  T extends { item_code?: string; item?: string; label?: string | null },
>(itens: readonly T[]): T[] {
  return itens.filter((i) => {
    const code = i.item_code ?? i.item ?? "";
    return !ehItemOnboardingIdentidade(code, i.label);
  });
}

type Sb = {
  from: (t: string) => any;
};

/**
 * Marca no banco os checks de identidade como resolvidos.
 * Idempotente. Não inventa tabela — só atualiza linhas já existentes.
 */
export async function autoSatisfazerChecksIdentidade(
  supabase: Sb,
  entrada: {
    organizationId: string;
    caseId: string;
    userId: string;
    temResponsavel: boolean;
  },
): Promise<{ ativacao: number; onboarding: number }> {
  if (!entrada.temResponsavel) return { ativacao: 0, onboarding: 0 };

  const agora = new Date().toISOString();
  let ativacao = 0;
  let onboarding = 0;

  const { data: checksAtivacao } = await supabase
    .from("case_activation_checks")
    .select("id,check_key,status")
    .eq("organization_id", entrada.organizationId)
    .eq("case_id", entrada.caseId)
    .in("check_key", [...CHECKS_ATIVACAO_IDENTIDADE]);

  for (const c of (checksAtivacao ?? []) as { id: string; check_key: string; status: string }[]) {
    if (c.status === "validado" || c.status === "nao_aplicavel" || c.status === "isento") continue;
    const status = c.check_key === "aprovacao_interna_ativacao" ? "nao_aplicavel" : "validado";
    const { error } = await supabase
      .from("case_activation_checks")
      .update({
        status,
        validado_em: agora,
        validado_por: entrada.userId,
        origem_validacao: "identidade_startup_auto",
        observacao:
          c.check_key === "aprovacao_interna_ativacao"
            ? "Não aplicável em operação solo: ativar o caso é a aprovação."
            : "Auto-validado: responsável padrão (Tatiana / sessão admin).",
      })
      .eq("id", c.id)
      .eq("organization_id", entrada.organizationId);
    if (!error) ativacao += 1;
  }

  const { data: itensOnb } = await supabase
    .from("onboarding_checklist")
    .select("id,item_code,label,status")
    .eq("organization_id", entrada.organizationId)
    .eq("case_id", entrada.caseId)
    .is("archived_at", null);

  for (const i of (itensOnb ?? []) as {
    id: string;
    item_code: string;
    label: string | null;
    status: string;
  }[]) {
    if (!ehItemOnboardingIdentidade(i.item_code, i.label)) continue;
    if (i.status === "concluido" || i.status === "nao_aplicavel") continue;
    const { error } = await supabase
      .from("onboarding_checklist")
      .update({
        status: "concluido",
        observacao: "Auto-concluído: responsável padrão da operação (Tatiana / sessão admin).",
        concluido_em: agora,
        concluido_por: entrada.userId,
        updated_by: entrada.userId,
      })
      .eq("id", i.id)
      .eq("organization_id", entrada.organizationId);
    if (!error) onboarding += 1;
  }

  return { ativacao, onboarding };
}
