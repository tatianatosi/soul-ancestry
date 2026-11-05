import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { ehRegistroDeTeste } from "@/lib/registros-teste";

/**
 * Leitura real das cinco superfícies do kit visual (Hoje, Comercial,
 * Inteligência & Pesquisa, Formalização & Financeiro, Governança).
 *
 * 14/09/2026 — decisão da Proprietária: as telas do kit param de exibir aviso
 * e passam a ler o eixo canônico `crm_casos` da organização do usuário
 * autenticado. Sem tabela nova, sem cliente administrativo, sem inferência:
 * a RLS da organização é quem decide o que o usuário enxerga, e ausência de
 * dado aparece declarada na tela.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

async function organizacaoDo(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}

/** Contagem tolerante: tabela ausente ou sem permissão vira `null`, nunca número inventado. */
async function contar(supabase: any, tabela: string, organizationId: string, filtro?: (q: any) => any) {
  try {
    let q = supabase.from(tabela).select("id", { count: "exact", head: true }).eq("organization_id", organizationId);
    if (filtro) q = filtro(q);
    const { count, error } = await q;
    if (error) return null;
    return typeof count === "number" ? count : null;
  } catch {
    return null;
  }
}

export type SuperficiesKit = Awaited<ReturnType<typeof carregarSuperficiesKit>>;

/**
 * DB-01 (05/11/2026): contar `audit_logs` era a leitura mais cara do banco (608 chamadas, média 503 ms),
 * porque a regra de leitura confere o papel de admin linha a linha. Só a Governança mostra esse número,
 * mas a contagem rodava em toda tela que usa os indicadores do kit. Agora roda só onde aparece, e uma
 * falha de leitura vira erro visível em vez de zero.
 */
export const contarAuditoriaKit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const { count, error } = await supabase
      .from("audit_logs")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId);
    if (error) throw new Error(`Não foi possível contar os registros de auditoria: ${error.message}`);
    return { auditoriaTotal: typeof count === "number" ? count : null };
  });

export const carregarSuperficiesKit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data, error } = await supabase
      .from("crm_casos")
      .select(
        [
          "id",
          "codigo",
          "titulo",
          "status",
          "fase",
          "prioridade",
          "risco",
          "ativo",
          "demo",
          "eixo_comercial",
          "eixo_formalizacao",
          "eixo_operacao",
          "contrato_assinado",
          "pagamento_confirmado",
          "documentos_minimos_ok",
          "aguardando_instituicao_externa",
          "proxima_acao",
          "prazo_proxima_acao",
          "responsavel_principal",
          "updated_at",
        ].join(","),
      )
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);

    const casos = (data ?? []) as Linha[];
    const reais = casos.filter(
      (c) => c["demo"] !== true && !ehRegistroDeTeste({ codigo: c["codigo"], titulo: c["titulo"] }),
    );
    const hoje = new Date();

    const vencidos = reais.filter((c) => {
      const prazo = c["prazo_proxima_acao"];
      return typeof prazo === "string" && prazo.length > 0 && new Date(prazo) < hoje;
    });
    const semProximaAcao = reais.filter(
      (c) => !(typeof c["proxima_acao"] === "string" && c["proxima_acao"].trim()),
    );
    const semResponsavel = reais.filter(
      (c) => !(typeof c["responsavel_principal"] === "string" && c["responsavel_principal"].trim()),
    );
    const esperaExterna = reais.filter((c) => c["aguardando_instituicao_externa"] === true);
    const ativos = reais.filter((c) => c["ativo"] === true);

    const porChave = (campo: string) => {
      const mapa = new Map<string, number>();
      for (const c of reais) {
        const chave = typeof c[campo] === "string" && c[campo].trim() ? (c[campo] as string) : "Sem registro";
        mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
      }
      return [...mapa.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
    };

    // DB-01 (05/11/2026): a contagem de auditoria saiu daqui — ver `contarAuditoriaKit`.
    const [leadsTotal, evidenciasTotal, projecoesTotal, faturasTotal] = await Promise.all([
      contar(supabase, "leads", organizationId),
      contar(supabase, "evidences", organizationId),
      contar(supabase, "app_projections", organizationId),
      contar(supabase, "invoices", organizationId),
    ]);

    return {
      totalCasos: reais.length,
      casosAtivos: ativos.length,
      vencidos: vencidos.length,
      semProximaAcao: semProximaAcao.length,
      semResponsavel: semResponsavel.length,
      esperaExterna: esperaExterna.length,
      contratoAssinado: reais.filter((c) => c["contrato_assinado"] === true).length,
      pagamentoConfirmado: reais.filter((c) => c["pagamento_confirmado"] === true).length,
      documentosMinimosOk: reais.filter((c) => c["documentos_minimos_ok"] === true).length,
      porFase: porChave("fase"),
      porStatus: porChave("status"),
      porEixoComercial: porChave("eixo_comercial"),
      porEixoFormalizacao: porChave("eixo_formalizacao"),
      porEixoOperacao: porChave("eixo_operacao"),
      leadsTotal,
      evidenciasTotal,
      projecoesTotal,
      faturasTotal,
      destaques: reais.slice(0, 8).map((c) => ({
        id: c["id"] as string,
        codigo: (c["codigo"] as string) ?? null,
        titulo: (c["titulo"] as string) ?? null,
        fase: (c["fase"] as string) ?? null,
        status: (c["status"] as string) ?? null,
        prioridade: (c["prioridade"] as string) ?? null,
        responsavel: (c["responsavel_principal"] as string) ?? null,
        proximaAcao: (c["proxima_acao"] as string) ?? null,
        prazo: (c["prazo_proxima_acao"] as string) ?? null,
      })),
    };
  });
