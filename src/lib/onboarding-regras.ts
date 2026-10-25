/**
 * Regras puras de onboarding e ativação (compartilhadas cliente/servidor).
 * O banco repete todas elas em triggers — aqui só explicamos o bloqueio.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type SupabaseCliente = { from: (t: string) => any; rpc: (f: string, a?: unknown) => any };

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

export async function resolverOrganizacao(supabase: SupabaseCliente, userId?: string) {
  // Organizações com mais de um membro devolvem várias linhas visíveis: a
  // consulta é restringida à própria pessoa e limitada a 1 registro.
  let consulta = supabase
    .from("organization_members")
    .select("organization_id")
    .is("archived_at", null);
  if (userId) consulta = consulta.eq("user_id", userId);
  const membro = await consulta.limit(1).maybeSingle();
  if (!membro.data?.organization_id) throw new Error("Acesso não autorizado.");
  return membro.data.organization_id as string;
}


/**
 * Papéis da PESSOA na organização. 25/10/2026: antes filtrava só pela
 * organização e devolvia o papel de todo mundo (qualquer membro herdava
 * "admin"). Agora: staff_access ativo dela + user_roles dela.
 */
export async function meusPapeis(
  supabase: SupabaseCliente,
  organizationId: string,
  userId: string,
): Promise<Papel[]> {
  const [roles, staff] = await Promise.all([
    supabase.from("user_roles").select("role").eq("organization_id", organizationId).eq("user_id", userId),
    supabase.from("staff_access").select("role,status").eq("auth_user_id", userId).is("archived_at", null).maybeSingle(),
  ]);
  const lista = ((roles.data ?? []) as { role: Papel }[]).map((r) => r.role);
  const s = staff.data as { role?: Papel; status?: string } | null;
  if (s?.status === "active" && s.role && !lista.includes(s.role)) lista.push(s.role);
  return lista;
}

export async function registrar(
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

