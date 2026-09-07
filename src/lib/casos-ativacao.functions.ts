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
  /**
   * Fonte única de "próxima ação" (RPC proxima_acao_prioritaria_lote,
   * 07/09/2026) — substitui a leitura crua de crm_casos.proxima_acao nesta
   * tela. null só quando a RPC não retornou nada para o caso (falha de
   * leitura, nunca ocultado como "tudo certo").
   */
  proximaAcaoCanonica: { nivel: number; motivo: string; prazo: string | null } | null;
};

type BloqueioReal = { regra: string; motivo: string };

/**
 * 07/09/2026 — achado real: esta lista de 14 itens e a leitura da coluna
 * `case_activation_checks.obrigatorio` (por linha) ficaram desatualizadas
 * quando a Fase B do Cockpit reduziu os requisitos realmente obrigatórios
 * para 8 (ver docs/politicas/de-para-cockpit-must-have-vs-sobreposicao-07-09.md).
 * A fonte real de "obrigatório" é `activation_check_definicoes()` (função
 * de banco, única e org-wide) — a coluna por linha não é lida pelo gate
 * real. Mantida só como rótulo para os motivos já retornados pela RPC
 * abaixo; não decide mais total/validados (ver TOTAL_OBRIGATORIOS_HOJE).
 */
const REQUISITOS_OBRIGATORIOS: { chave: string; label: string }[] = [
  { chave: "contrato_assinado_ou_isencao_autorizada", label: "Contrato assinado" },
  {
    chave: "pagamento_confirmado_ou_condicao_financeira_autorizada",
    label: "Pagamento inicial confirmado",
  },
  { chave: "responsavel_designado", label: "Responsável interno definido" },
  { chave: "cliente_identificado", label: "Contratante e participantes conferidos" },
  { chave: "nucleo_familiar_conferido", label: "Núcleo familiar confirmado" },
  { chave: "dossie_mae_criado", label: "Dossiê-mãe criado e vinculado" },
  { chave: "consentimento_registrado", label: "Dados mínimos e consentimento registrados" },
  {
    chave: "proposta_aprovada_ou_isencao_autorizada",
    label: "Escopo, SKU, preço e vencimento reconciliados",
  },
  { chave: "ordem_de_servico_criada", label: "Ordem de serviço / Anexo I vinculada" },
  { chave: "escopo_definido", label: "Ambiente operacional provisionado" },
  { chave: "ambiente_acesso_definido", label: "Nível de acesso definido" },
  { chave: "checklist_documental_e_plano_preparados", label: "Checklist documental publicado" },
  { chave: "primeira_tarefa_criada", label: "Plano de ação e primeira micro-entrega previstos" },
  { chave: "aprovacao_interna_ativacao", label: "Aprovação interna de ativação registrada" },
];

/**
 * Contagem real de requisitos obrigatórios hoje: os 8 indicadores do Cockpit
 * (6 em case_activation_checks + app_cliente e micro_entrega_d7 em
 * onboarding_checklist), todos já cobertos pela RPC case_ativacao_bloqueios_reais.
 * Não usar REQUISITOS_OBRIGATORIOS.length (14) para nenhuma contagem exibida.
 */
const TOTAL_OBRIGATORIOS_HOJE = 8;

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

    const porCaso = new Map<
      string,
      Map<string, { status: string; isencao_expira_em: string | null }>
    >();
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
          k.status === "isento" &&
          !!k.isencao_expira_em &&
          new Date(k.isencao_expira_em).getTime() < agora;
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
        // total/validados provisórios (base nos 14 itens); sobrescritos logo
        // abaixo com a contagem real de TOTAL_OBRIGATORIOS_HOJE (8) para
        // todo caso, ativo ou não — nunca exibir "14" na tela.
        total: REQUISITOS_OBRIGATORIOS.length,
        validados,
        pendentes: motivos.length,
        ativo: Boolean(c.ativo),
        motivos,
        proximaAcaoCanonica: null,
      });
    }

    /*
     * 05/09/2026 — achado real: este card contava "pendentes"/"motivos"
     * olhando só para case_activation_checks (checklist clicável). Um caso
     * podia mostrar 14/14 validado aqui e ainda ser recusado pelo banco por
     * consentimento real ausente, item de onboarding_checklist pendente ou
     * inconsistência crítica em quality_issues — nenhuma das três é lida
     * nesta tabela. Sobrescrevemos pendentes/motivos com a mesma projeção
     * usada pela tela de ativação (case_ativacao_bloqueios_reais), sem
     * cases ativos: para um caso já ativo o card continua mostrando "Caso
     * ativo" e não precisa reavaliar bloqueios.
     */
    await Promise.all(
      resultado.map(async (r) => {
        r.total = TOTAL_OBRIGATORIOS_HOJE;
        if (r.ativo) {
          // Caso já ativo passou pelo gate real no banco — não reavalia
          // bloqueios aqui, mesma convenção já usada na Ficha 360.
          r.motivos = [];
          r.pendentes = 0;
          r.validados = TOTAL_OBRIGATORIOS_HOJE;
          return;
        }
        const { data } = await supabase.rpc("case_ativacao_bloqueios_reais", { _case: r.caseId });
        const reais = (data ?? []) as BloqueioReal[];
        r.motivos = reais.map((b) => b.motivo);
        r.pendentes = reais.length;
        r.validados = Math.max(0, TOTAL_OBRIGATORIOS_HOJE - reais.length);
      }),
    );

    /*
     * 07/09/2026 — achado real: a Lista de Casos mostrava crm_casos.proxima_acao
     * (texto manual) enquanto a Ficha 360 já usa a RPC proxima_acao_prioritaria
     * (9 níveis, incluindo bloqueio de ativação real, tarefa vencida, documento
     * pendente). Hoje os dois concordam porque todos os casos estão em nível 1,
     * mas divergem assim que um caso tiver, por exemplo, uma tarefa vencida sem
     * bloqueio de ativação pendente. Adiciona a fonte canônica sem remover o
     * campo manual — a tela decide como exibir os dois.
     */
    const idsNaoAtivos = resultado.filter((r) => !r.ativo).map((r) => r.caseId);
    if (idsNaoAtivos.length > 0) {
      const { data: canonicas } = await supabase.rpc("proxima_acao_prioritaria_lote", {
        _cases: idsNaoAtivos,
      });
      const porCasoCanonica = new Map(
        ((canonicas ?? []) as { case_id: string; nivel: number; motivo: string; prazo: string | null }[]).map(
          (p) => [p.case_id, { nivel: p.nivel, motivo: p.motivo, prazo: p.prazo }],
        ),
      );
      for (const r of resultado) {
        r.proximaAcaoCanonica = porCasoCanonica.get(r.caseId) ?? null;
      }
    }

    return resultado;
  });
