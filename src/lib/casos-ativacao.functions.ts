import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolverOrganizacao, type SupabaseCliente } from "@/lib/onboarding-regras";

export type EstadoAtivacaoCaso = {
  caseId: string;
  total: number;
  validados: number;
  pendentes: number;
  ativo: boolean;
  /** Motivos específicos do bloqueio, na ordem dos requisitos. */
  motivos: string[];
};

/** Os 14 requisitos obrigatórios (espelho de activation_check_definicoes()). */
const REQUISITOS_OBRIGATORIOS: { chave: string; label: string }[] = [
  { chave: "contrato_assinado_ou_isencao_autorizada", label: "Contrato assinado" },
  { chave: "pagamento_confirmado_ou_condicao_financeira_autorizada", label: "Pagamento inicial confirmado" },
  { chave: "responsavel_designado", label: "Responsável interno definido" },
  { chave: "cliente_identificado", label: "Contratante e participantes conferidos" },
  { chave: "nucleo_familiar_conferido", label: "Núcleo familiar confirmado" },
  { chave: "dossie_mae_criado", label: "Dossiê-mãe criado e vinculado" },
  { chave: "consentimento_registrado", label: "Dados mínimos e consentimento registrados" },
  { chave: "proposta_aprovada_ou_isencao_autorizada", label: "Escopo, SKU, preço e vencimento reconciliados" },
  { chave: "ordem_de_servico_criada", label: "Ordem de serviço / Anexo I vinculada" },
  { chave: "escopo_definido", label: "Ambiente operacional provisionado" },
  { chave: "ambiente_acesso_definido", label: "Nível de acesso definido" },
  { chave: "checklist_documental_e_plano_preparados", label: "Checklist documental publicado" },
  { chave: "primeira_tarefa_criada", label: "Plano de ação e primeira micro-entrega previstos" },
  { chave: "aprovacao_interna_ativacao", label: "Aprovação interna de ativação registrada" },
];

/**
 * Estado de ativação por caso, calculado no servidor a partir dos 14 requisitos
 * obrigatórios. A lista de Casos nunca decide ativação: apenas exibe o estado
 * e o motivo específico do bloqueio. A recusa efetiva ocorre no banco
 * (trigger trg_caso_ativacao_gates_guard).
 */
export const listarEstadoAtivacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);

    const checks = await supabase
      .from("case_activation_checks")
      .select("case_id,check_key,status,obrigatorio,isencao_expira_em")
      .eq("organization_id", organizationId)
      .eq("obrigatorio", true);

    const casos = await supabase
      .from("crm_casos")
      .select("id,ativo")
      .eq("organization_id", organizationId);

    const porCaso = new Map<string, Map<string, { status: string; isencao_expira_em: string | null }>>();
    for (const k of (checks.data ?? []) as {
      case_id: string;
      check_key: string;
      status: string;
      isencao_expira_em: string | null;
    }[]) {
      const atual = porCaso.get(k.case_id) ?? new Map();
      atual.set(k.check_key, { status: k.status, isencao_expira_em: k.isencao_expira_em });
      porCaso.set(k.case_id, atual);
    }

    const agora = Date.now();
    const resultado: EstadoAtivacaoCaso[] = [];
    for (const c of (casos.data ?? []) as { id: string; ativo: boolean | null }[]) {
      const mapa = porCaso.get(c.id);
      const motivos: string[] = [];
      let validados = 0;

      for (const req of REQUISITOS_OBRIGATORIOS) {
        const k = mapa?.get(req.chave);
        if (!k) {
          motivos.push(`${req.label} — não avaliada`);
          continue;
        }
        const isencaoExpirada =
          k.status === "isento" && !!k.isencao_expira_em && new Date(k.isencao_expira_em).getTime() < agora;
        if (isencaoExpirada) {
          motivos.push(`${req.label} — isenção expirada`);
          continue;
        }
        if (k.status === "validado" || k.status === "nao_aplicavel" || k.status === "isento") {
          validados += 1;
          continue;
        }
        motivos.push(`${req.label} — aguardando validação com evidência`);
      }

      resultado.push({
        caseId: c.id,
        total: REQUISITOS_OBRIGATORIOS.length,
        validados,
        pendentes: motivos.length,
        ativo: Boolean(c.ativo),
        motivos,
      });
    }

    return resultado;
  });

