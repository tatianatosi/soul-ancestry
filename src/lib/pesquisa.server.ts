/**
 * Helpers server-only do módulo de Pesquisa Genealógica.
 *
 * Linguagem de pesquisa, nunca de conclusão jurídica: registramos hipóteses,
 * evidências e pendências. O banco continua sendo a autoridade final das travas.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Sb = any;

export const PAPEIS_PESQUISA = ["admin", "operacoes", "pesquisador"];

export const CAMPOS_PESSOA = [
  "nome",
  "parentesco",
  "requerente",
  "nacionalidade",
  "data_nascimento",
  "local_nascimento",
  "data_obito",
  "local_obito",
  "pai_id",
  "mae_id",
  "observacoes_protegidas",
];

export const CAMPOS_HIPOTESE = [
  "person_id",
  "titulo",
  "descricao",
  "status",
  "grau_confianca",
  "justificativa",
  "pesquisador_id",
];

export const CAMPOS_EVIDENCIA = [
  "hypothesis_id",
  "person_id",
  "titulo",
  "tipo",
  "status",
  "descricao",
  "fonte",
  "url",
  "storage_path",
  "local_relacionado",
  "pessoa_relacionada",
  "data_inicio",
  "data_fim",
  "periodo",
  "grau_confianca",
  "relacao_hipotese",
  "justificativa",
  "pesquisador_id",
  "revisado_em",
  "observacao",
];

export const CAMPOS_EVENTO = [
  "person_id",
  "evidencia_id",
  "hypothesis_id",
  "titulo",
  "tipo",
  "local",
  "data_inicio",
  "data_fim",
  "periodo_texto",
  "descricao",
  "confirmado",
];

export const CAMPOS_PENDENCIA = [
  "titulo",
  "descricao",
  "status",
  "prioridade",
  "prazo",
  "person_id",
  "evidencia_id",
  "hypothesis_id",
];

const VAZIO_PARA_NULO = new Set([
  "person_id",
  "pai_id",
  "mae_id",
  "hypothesis_id",
  "evidencia_id",
  "pesquisador_id",
  "data_inicio",
  "data_fim",
  "data_nascimento",
  "data_obito",
  "prazo",
  "revisado_em",
]);

const BOOLEANOS = new Set(["requerente", "confirmado"]);

/** Mantém apenas campos permitidos e normaliza vazios em nulo. */
export function limparCampos(permitidos: string[], dados: Record<string, unknown>) {
  const saida: Record<string, unknown> = {};
  for (const chave of permitidos) {
    if (!(chave in dados)) continue;
    const bruto = dados[chave];
    if (BOOLEANOS.has(chave)) {
      saida[chave] = bruto === true || bruto === "true" || bruto === "on";
      continue;
    }
    const valor = typeof bruto === "string" ? bruto.trim() : bruto;
    if (valor === "" || valor === undefined) {
      saida[chave] = VAZIO_PARA_NULO.has(chave) ? null : null;
      continue;
    }
    saida[chave] = valor;
  }
  return saida;
}

export async function contextoPesquisa(supabase: Sb, userId: string) {
  const { data, error } = await supabase
    .from("staff_access")
    .select("organization_id,role,status")
    .eq("auth_user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data && data.status === "active") {
    return { organizationId: data.organization_id as string, papel: data.role as string };
  }
  const membro = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (!membro.data?.organization_id) throw new Error("Acesso interno não autorizado.");
  const papeis = await supabase
    .from("user_roles")
    .select("role")
    .eq("organization_id", membro.data.organization_id)
    .eq("user_id", userId); // 25/10/2026: só os papéis DESTA pessoa
  const lista = ((papeis.data ?? []) as { role: string }[]).map((p) => p.role);
  return {
    organizationId: membro.data.organization_id as string,
    papel: lista.includes("admin") ? "admin" : (lista[0] ?? "leitura"),
  };
}

/** Pesquisador só escreve em casos sob sua responsabilidade; admin/operações sem restrição. */
export async function exigirPesquisaNoCaso(
  supabase: Sb,
  organizationId: string,
  papel: string,
  userId: string,
  casoId: string,
) {
  if (!PAPEIS_PESQUISA.includes(papel)) {
    throw new Error("Seu papel não permite alterar a pesquisa deste caso.");
  }
  const { data, error } = await supabase
    .from("crm_casos")
    .select("id,responsavel_id")
    .eq("id", casoId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Caso não encontrado nesta organização.");
  if (papel === "pesquisador" && data.responsavel_id !== userId) {
    throw new Error("Pesquisadores só editam casos para os quais estão designados.");
  }
}
