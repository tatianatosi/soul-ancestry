import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Onboarding e ativação de casos.
 *
 * Nenhuma trava aqui é decorativa: o banco repete todas elas
 * (triggers fn_activation_check_guard, fn_guard_ativacao, fn_estado_caso).
 * A interface apenas explica o bloqueio — nunca o contorna.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type SupabaseCliente = { from: (t: string) => any; rpc: (f: string, a?: unknown) => any };

export type Papel = "admin" | "operacoes" | "pesquisador" | "comercial" | "financeiro" | "leitura";

export type CheckAtivacao = {
  id: string;
  check_key: string;
  label: string;
  dominio: "operacional" | "comercial" | "contratual" | "financeiro";
  obrigatorio: boolean;
  status: "pendente" | "validado" | "isento" | "nao_aplicavel";
  validado_em: string | null;
  validado_por: string | null;
  observacao: string | null;
  origem_validacao: string | null;
  isencao_motivo: string | null;
  isencao_autorizada_por: string | null;
  isencao_autorizada_em: string | null;
  isencao_expira_em: string | null;
};

export type EventoOnboarding = {
  id: string;
  acao: string;
  entidade: string;
  quando: string;
  detalhe: string;
};

const RESPONSAVEL_POR_DOMINIO: Record<string, string> = {
  operacional: "Operações ou admin",
  comercial: "Comercial, operações ou admin",
  contratual: "Operações ou admin (isenção somente admin)",
  financeiro: "Financeiro ou admin (isenção somente admin)",
};

export function responsavelDoCheck(dominio: string) {
  return RESPONSAVEL_POR_DOMINIO[dominio] ?? "Admin";
}

export function podeValidar(papeis: Papel[], dominio: string, alvo: string) {
  if (papeis.includes("admin")) return true;
  if (alvo === "isento" || alvo === "nao_aplicavel") return false;
  if (papeis.includes("leitura") && papeis.length === 1) return false;
  if (papeis.includes("pesquisador") && papeis.length === 1) return false;
  if (dominio === "financeiro") return papeis.includes("financeiro");
  if (dominio === "comercial") return papeis.includes("comercial") || papeis.includes("operacoes");
  if (dominio === "contratual") return papeis.includes("operacoes");
  return papeis.some((p) => p === "operacoes" || p === "comercial" || p === "financeiro");
}

export function podeAtivar(papeis: Papel[]) {
  return papeis.includes("admin") || papeis.includes("operacoes");
}

async function resolverOrganizacao(supabase: SupabaseCliente) {
  const membro = await supabase
    .from("organization_members")
    .select("organization_id")
    .is("archived_at", null)
    .maybeSingle();
  if (!membro.data?.organization_id) throw new Error("Acesso não autorizado.");
  return membro.data.organization_id as string;
}

async function meusPapeis(supabase: SupabaseCliente, organizationId: string): Promise<Papel[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("organization_id", organizationId);
  return ((data ?? []) as { role: Papel }[]).map((r) => r.role);
}

async function registrar(
  supabase: SupabaseCliente,
  organizationId: string,
  acao: string,
  casoId: string,
  metadados: Record<string, unknown>,
) {
  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    acao,
    entidade: "crm_casos",
    entidade_id: casoId,
    metadados,
  });
}

export const obterOnboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    const papeis = await meusPapeis(supabase, organizationId);

    const caso = await supabase
      .from("crm_casos")
      .select(
        "id,codigo,titulo,status,ativo,ativado_em,ativado_por,data_ativacao,responsavel_id,cliente_id,tipo_servico,suspenso_motivo,suspenso_em,created_at",
      )
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const checks = await supabase
      .from("case_activation_checks")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("case_id", data.casoId)
      .order("created_at", { ascending: true });

    const pendencias = await supabase.rpc("case_activation_pendencias", { _case: data.casoId });

    const logs = await supabase
      .from("audit_logs")
      .select("id,acao,entidade,entidade_id,metadados,created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(200);

    const linha = (caso.data ?? {}) as Record<string, unknown>;
    const listaChecks = ((checks.data ?? []) as CheckAtivacao[]).sort((a, b) =>
      a.check_key.localeCompare(b.check_key),
    );
    const idsChecks = new Set(listaChecks.map((c) => c.id));

    const timeline: EventoOnboarding[] = ((logs.data ?? []) as Record<string, any>[])
      .filter(
        (l) =>
          l["entidade_id"] === data.casoId ||
          (l["entidade"] === "case_activation_checks" && idsChecks.has(String(l["entidade_id"]))),
      )
      .map((l) => ({
        id: String(l["id"]),
        acao: String(l["acao"]),
        entidade: String(l["entidade"]),
        quando: String(l["created_at"]),
        detalhe:
          l["entidade"] === "case_activation_checks"
            ? String(listaChecks.find((c) => c.id === l["entidade_id"])?.label ?? "Requisito de ativação")
            : String((l["metadados"] as any)?.["resumo"] ?? "Caso"),
      }));

    return {
      caso: linha,
      papeis,
      checks: listaChecks,
      pendencias: ((pendencias.data ?? []) as { check_key: string; label: string; motivo: string }[]) ?? [],
      podeAtivar: podeAtivar(papeis),
      timeline,
    };
  });

export const atualizarCheckAtivacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      checkId: string;
      status: "pendente" | "validado" | "isento" | "nao_aplicavel";
      observacao?: string;
      isencaoMotivo?: string;
      isencaoExpiraEm?: string | null;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    const papeis = await meusPapeis(supabase, organizationId);

    const atual = await supabase
      .from("case_activation_checks")
      .select("*")
      .eq("id", data.checkId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!atual.data) throw new Error("Requisito não encontrado.");
    const check = atual.data as CheckAtivacao & { case_id: string };

    if (!podeValidar(papeis, check.dominio, data.status)) {
      return { ok: false, erro: "Seu papel não permite esta validação." };
    }
    if (data.status === "isento") {
      if (!papeis.includes("admin")) return { ok: false, erro: "Somente admin autoriza isenção." };
      if (!data.isencaoMotivo || data.isencaoMotivo.trim().length < 10) {
        return { ok: false, erro: "Isenção exige motivo com no mínimo 10 caracteres." };
      }
    }

    const patch: Record<string, unknown> = {
      status: data.status,
      observacao: data.observacao ?? check.observacao,
      origem_validacao: data.status === "isento" ? "isencao_admin" : "validacao_manual",
    };
    if (data.status === "isento") {
      patch["isencao_motivo"] = data.isencaoMotivo!.trim();
      patch["isencao_expira_em"] = data.isencaoExpiraEm || null;
    }

    const { error } = await supabase
      .from("case_activation_checks")
      .update(patch)
      .eq("id", data.checkId)
      .eq("organization_id", organizationId);
    if (error) return { ok: false, erro: error.message };

    await registrar(
      supabase,
      organizationId,
      data.status === "isento" ? "isencao_autorizada" : "check_ativacao_atualizado",
      check.case_id,
      {
        resumo: `${check.label}: ${data.status}`,
        check_key: check.check_key,
        motivo: data.isencaoMotivo ?? null,
        expira_em: data.isencaoExpiraEm ?? null,
      },
    );

    return { ok: true, erro: null as string | null };
  });

export const ativarCasoComChecks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    const papeis = await meusPapeis(supabase, organizationId);
    if (!podeAtivar(papeis)) return { ok: false, pendencias: ["Somente admin ou operações podem ativar."] };

    const pend = await supabase.rpc("case_activation_pendencias", { _case: data.casoId });
    const lista = ((pend.data ?? []) as { label: string; motivo: string }[]).map(
      (p) => `${p.label} (${p.motivo})`,
    );
    if (lista.length > 0) return { ok: false, pendencias: lista };

    const { error } = await supabase
      .from("crm_casos")
      .update({ status: "ativo", ativo: true })
      .eq("id", data.casoId)
      .eq("organization_id", organizationId);
    if (error) return { ok: false, pendencias: [error.message] };

    await registrar(supabase, organizationId, "caso_ativado", data.casoId, {
      resumo: "Caso ativado com todos os requisitos válidos",
    });
    return { ok: true, pendencias: [] as string[] };
  });

export const suspenderCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string; motivo: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    const papeis = await meusPapeis(supabase, organizationId);
    if (!podeAtivar(papeis)) return { ok: false, erro: "Somente admin ou operações podem suspender." };
    if (!data.motivo || data.motivo.trim().length < 10) {
      return { ok: false, erro: "Suspensão exige motivo com no mínimo 10 caracteres." };
    }

    const { error } = await supabase
      .from("crm_casos")
      .update({ status: "pausado", suspenso_motivo: data.motivo.trim() })
      .eq("id", data.casoId)
      .eq("organization_id", organizationId);
    if (error) return { ok: false, erro: error.message };

    await registrar(supabase, organizationId, "caso_suspenso", data.casoId, {
      resumo: "Caso suspenso",
      motivo: data.motivo.trim(),
    });
    return { ok: true, erro: null as string | null };
  });
