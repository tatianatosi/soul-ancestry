import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolverOrganizacao, type SupabaseCliente } from "@/lib/onboarding-regras";

export type EstadoAtivacaoCaso = {
  caseId: string;
  total: number;
  validados: number;
  pendentes: number;
  ativo: boolean;
};

/**
 * Estado de ativação por caso, calculado no servidor a partir dos requisitos
 * obrigatórios. A lista de Casos nunca decide ativação: apenas exibe o estado.
 */
export const listarEstadoAtivacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);

    const checks = await supabase
      .from("case_activation_checks")
      .select("case_id,status,obrigatorio,isencao_expira_em")
      .eq("organization_id", organizationId)
      .eq("obrigatorio", true);

    const casos = await supabase
      .from("crm_casos")
      .select("id,ativo")
      .eq("organization_id", organizationId);

    const mapa = new Map<string, EstadoAtivacaoCaso>();
    for (const c of (casos.data ?? []) as { id: string; ativo: boolean | null }[]) {
      mapa.set(c.id, { caseId: c.id, total: 0, validados: 0, pendentes: 0, ativo: Boolean(c.ativo) });
    }

    const agora = Date.now();
    for (const k of (checks.data ?? []) as {
      case_id: string;
      status: string;
      isencao_expira_em: string | null;
    }[]) {
      const atual = mapa.get(k.case_id);
      if (!atual) continue;
      atual.total += 1;
      const isencaoExpirada =
        k.status === "isento" && !!k.isencao_expira_em && new Date(k.isencao_expira_em).getTime() < agora;
      const ok = (k.status === "validado" || k.status === "nao_aplicavel" || k.status === "isento") && !isencaoExpirada;
      if (ok) atual.validados += 1;
      else atual.pendentes += 1;
    }

    return Array.from(mapa.values());
  });
