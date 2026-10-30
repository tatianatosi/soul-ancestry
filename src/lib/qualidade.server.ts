/**
 * Helpers server-only do módulo de Qualidade.
 *
 * O banco é a autoridade: varredura (quality_scan), travas de ativação,
 * exigência de comentário/evidência ao resolver e proibição de exclusão.
 * Aqui só resolvemos contexto e definimos os campos permitidos em CSV.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Sb = any;

export const SEVERIDADES = ["critica", "alta", "media", "baixa"] as const;

export const ROTULO_SEVERIDADE: Record<string, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const ROTULO_STATUS_ISSUE: Record<string, string> = {
  aberta: "Aberta",
  reconhecida: "Reconhecida",
  resolvida: "Resolvida",
  falso_positivo: "Falso positivo",
  sanada: "Sanada pela varredura",
};

export const ROTULO_DOMINIO: Record<string, string> = {
  crm: "CRM",
  privacidade: "Consentimento",
  contrato: "Contrato",
  pagamento: "Pagamento",
  evidencia: "Evidências",
  entrega: "Entrega",
};

export const ROTULO_CHECKLIST: Record<string, string> = {
  pendente: "Pendente",
  cumprido: "Cumprido",
  nao_aplicavel: "Não aplicável",
};

/**
 * Conjuntos exportáveis em CSV.
 * Lista fechada: nenhum documento, link privado, caminho de storage,
 * identificador de arquivo ou dado sensível do titular entra aqui.
 */
export const CONJUNTOS_CSV: Record<
  string,
  { rotulo: string; descricao: string; campos: { chave: string; rotulo: string }[] }
> = {
  inconsistencias: {
    rotulo: "Inconsistências",
    descricao: "Lista de inconsistências detectadas pela varredura, sem dados pessoais do titular.",
    campos: [
      { chave: "regra_key", rotulo: "Regra" },
      { chave: "dominio", rotulo: "Domínio" },
      { chave: "severidade", rotulo: "Severidade" },
      { chave: "entidade", rotulo: "Entidade" },
      { chave: "titulo", rotulo: "Título" },
      { chave: "status", rotulo: "Situação" },
      { chave: "detectada_em", rotulo: "Detectada em" },
      { chave: "resolvida_em", rotulo: "Resolvida em" },
    ],
  },
  relatorio_semanal: {
    rotulo: "Relatório operacional semanal",
    descricao: "Indicadores agregados da semana, sem qualquer identificação de caso ou cliente.",
    campos: [
      { chave: "indicador", rotulo: "Indicador" },
      { chave: "valor", rotulo: "Valor" },
    ],
  },
  checklists: {
    rotulo: "Checklists por caso",
    descricao: "Situação dos itens de checklist por código de caso, sem observações internas.",
    campos: [
      { chave: "caso_codigo", rotulo: "Caso" },
      { chave: "fase", rotulo: "Fase" },
      { chave: "item_key", rotulo: "Item" },
      { chave: "label", rotulo: "Descrição do item" },
      { chave: "obrigatorio", rotulo: "Obrigatório" },
      { chave: "status", rotulo: "Situação" },
      { chave: "concluido_em", rotulo: "Concluído em" },
    ],
  },
};

export const PAPEIS_QUALIDADE = ["admin", "operacoes"];

/** Resolve organização e papel do usuário interno autenticado. */
export async function contextoQualidade(supabase: Sb, userId: string) {
  const { data, error } = await supabase
    .from("staff_access")
    .select("organization_id,role,status")
    .eq("auth_user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.status !== "active") throw new Error("Acesso interno não autorizado.");
  const papel = data.role as string;
  return {
    organizationId: data.organization_id as string,
    papel,
    ehAdmin: papel === "admin",
    podeTratar: PAPEIS_QUALIDADE.includes(papel),
  };
}

/** Serializa linhas em CSV, escapando aspas e separadores. */
export function paraCsv(campos: { chave: string; rotulo: string }[], linhas: Record<string, unknown>[]) {
  const escapar = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const bruto = String(v);
    const s = /^[=+\-@\t\r]/.test(bruto) ? `'${bruto}` : bruto;
    return /[",;\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  const cabecalho = campos.map((c) => escapar(c.rotulo)).join(";");
  const corpo = linhas.map((l) => campos.map((c) => escapar(l[c.chave])).join(";"));
  return [cabecalho, ...corpo].join("\n");
}
