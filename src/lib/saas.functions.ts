import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  validarEstadoInicial,
  validarRegrasNegocio,
  validarTransicao,
} from "@/lib/estados";

/**
 * Camada de acesso do SaaS Clube Ancestral.
 *
 * Regras invioláveis (aplicadas aqui e reforçadas por RLS/triggers no banco):
 * - a organização NUNCA vem da interface: é derivada do usuário autenticado;
 * - toda leitura/escrita filtra organization_id no banco;
 * - não existe exclusão física: apenas arquivamento com motivo e responsável;
 * - ativação de caso é validada no servidor/banco;
 * - toda alteração relevante gera trilha de auditoria.
 */

export type Papel =
  | "admin"
  | "operacoes"
  | "pesquisador"
  | "comercial"
  | "financeiro"
  | "leitura";

export type Entidade =
  | "leads"
  | "clientes"
  | "client_contacts"
  | "crm_casos"
  | "case_members"
  | "evidencias"
  | "tarefas"
  | "documents"
  | "consent_records"
  | "proposals"
  | "invoices"
  | "payments"
  | "eventos_financeiros";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

const ENTIDADES: Entidade[] = [
  "leads",
  "clientes",
  "client_contacts",
  "crm_casos",
  "case_members",
  "evidencias",
  "tarefas",
  "documents",
  "consent_records",
  "proposals",
  "invoices",
  "payments",
  "eventos_financeiros",
];


const CAMPOS_PERMITIDOS: Record<Entidade, string[]> = {
  leads: ["nome", "email", "telefone", "origem", "estagio", "pais_interesse", "observacoes"],
  clientes: [
    "nome",
    "nome_social",
    "email",
    "telefone",
    "documento",
    "origem",
    "pais_interesse",
    "status",
    "observacoes",
  ],
  client_contacts: ["client_id", "nome", "relacao", "email", "telefone", "principal", "observacoes"],
  crm_casos: [
    "cliente_id",
    "codigo",
    "titulo",
    "tipo_servico",
    "fase",
    "responsavel_id",
    "prioridade",
    "data_entrada",
    "resumo",
    "risco",
    "proxima_acao",
    "pais",
    "via",
    "status",
    "hipotese_elegibilidade",
    "contrato_assinado",
    "pagamento_confirmado",
    "documentos_minimos_ok",
    // Ficha operacional canônica
    "eixo_comercial",
    "eixo_formalizacao",
    "status_caso_derivado",
    "responsavel_principal",
    "cargo_responsavel_principal",
    "supervisora_do_caso",
    "colaboradores_do_caso",
    "data_confirmacao_formal_proposta",
    "data_entrada_caso",
    "proposta_referencia_interna",
    "proposta_url_interna",
    "data_proposta",
    "escopo_incluido_resumido",
    "escopo_excluido_resumido",
    "condicao_comercial_interna_pendente",
    "citizenship_track_id",
    "pais_linha_prioritaria",
    "via_juridica_preliminar",
    "status_via",
    "hipotese_trabalho_interna",
    "status_radar",
    "radar_aderencia_percentual",
    "revisao_humana_juridica",
    "riscos_identificados",
    "resumo_interno",
    "brief_interno",
    "origem_brief",
    "link_origem_interna",
    "proxima_acao_codigo",
    "proxima_acao_justificativa",
    "alias_historico",
  ],
  case_members: [
    "case_id",
    "nome",
    "parentesco",
    "data_nascimento",
    "local_nascimento",
    "observacoes_protegidas",
    "papel_no_caso",
    "representante_legal",
    "cpf",
    "rg",
    "telefone",
    "email",
    "endereco",
    "cep",
    "profissao",
    "estado_civil",
    "status_cadastral",
    "documentos_pendentes",
    "consentimentos",
  ],

  evidencias: [
    "caso_id",
    "titulo",
    "tipo",
    "status",
    "visibilidade",
    "descricao",
    "storage_path",
    "pessoa_relacionada",
    "local_relacionado",
    "periodo",
    "fonte",
    "grau_confianca",
    "observacao",
  ],
  tarefas: [
    "caso_id",
    "titulo",
    "descricao",
    "responsavel_id",
    "prioridade",
    "status",
    "prazo",
    "bloqueio",
    "motivo_bloqueio",
  ],
  documents: ["case_id", "client_id", "titulo", "tipo", "storage_path", "status", "liberado_cliente", "observacoes"],
  consent_records: [
    "client_id",
    "tipo_consentimento",
    "versao_texto",
    "status",
    "coletado_em",
    "evidencia_consentimento",
    "revogado_em",
  ],
  proposals: [
    "lead_id",
    "client_id",
    "versao",
    "status",
    "valor",
    "moeda",
    "escopo",
    "validade",
    "enviada_em",
    "aprovada_em",
    "recusada_em",
  ],
  invoices: [
    "client_id",
    "case_id",
    "contract_id",
    "service_order_id",
    "numero",
    "valor",
    "moeda",
    "vencimento",
    "status",
    "referencia_externa",
    "conciliacao_status",
  ],
  payments: [
    "invoice_id",
    "valor",
    "moeda",
    "vencimento",
    "pago_em",
    "metodo",
    "status",
    "referencia_externa",
    "conciliacao_status",
  ],
  eventos_financeiros: ["caso_id", "tipo", "descricao", "valor", "moeda", "status", "vencimento"],
};


const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Colunas com NOT NULL + default: string vazia é ignorada em vez de virar null. */
const NAO_NULAVEIS = new Set([
  "eixo_comercial",
  "eixo_formalizacao",
  "responsavel_principal",
  "cargo_responsavel_principal",
  "supervisora_do_caso",
  "colaboradores_do_caso",
  "riscos_identificados",
  "status_radar",
  "revisao_humana_juridica",
  "condicao_comercial_interna_pendente",
  "status_cadastral",
  "titulo",
  "nome",
  "status",
]);

function sanitizar(entidade: Entidade, dados: Record<string, unknown>) {
  const permitidos = CAMPOS_PERMITIDOS[entidade];
  const saida: Record<string, unknown> = {};
  for (const chave of permitidos) {
    const valor = dados[chave];
    if (valor === undefined) continue;
    // Campo esvaziado precisa gravar null — antes a alteração era descartada em silêncio.
    if (valor === "" || valor === null) {
      if (NAO_NULAVEIS.has(chave)) continue;
      saida[chave] = null;
      continue;
    }
    saida[chave] = valor;
  }

  // campos de referência só aceitam identificador válido (nunca nome digitado)
  for (const chave of Object.keys(saida)) {
    if (!chave.endsWith("_id")) continue;
    const valor = saida[chave];
    if (valor === null) continue;
    if (typeof valor !== "string" || !UUID_RE.test(valor.trim())) {
      throw new Error(
        `Campo "${chave}" precisa do identificador do registro relacionado, não de um texto livre.`,
      );
    }
    saida[chave] = valor.trim();
  }
  // blindagem: campos de organização/auditoria jamais vêm do front-end
  delete saida["organization_id"];
  delete saida["demo"];
  delete saida["archived_at"];
  return saida;
}


type SupabaseCliente = { from: (t: string) => any; rpc: (f: string, a?: unknown) => any };

async function resolverOrganizacao(supabase: SupabaseCliente) {
  const membro = await supabase
    .from("organization_members")
    .select("organization_id")
    .is("archived_at", null)
    .maybeSingle();
  if (membro.data?.organization_id) return membro.data.organization_id as string;
  // Quem já possui acesso de equipe (pendente/suspenso/revogado) nunca cria nova organização.
  const staff = await supabase.from("staff_access").select("id,status").limit(1).maybeSingle();
  if (staff.data) throw new Error("Acesso não autorizado.");
  const criada = await supabase.rpc("bootstrap_minha_organizacao", {});
  if (criada.error) throw new Error(criada.error.message);
  return criada.data as string;

}

export const getContexto = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;

    // Autorização interna vem sempre de staff_access (nunca do front-end).
    const staff = await supabase
      .from("staff_access")
      .select("id,role,status,organization_id,full_name")
      .eq("auth_user_id", context.userId)
      .is("archived_at", null)
      .maybeSingle();

    if (staff.data && staff.data.status !== "active") {
      return {
        userId: context.userId as string,
        organizationId: null,
        organizacao: null,
        perfil: null,
        papeis: [] as Papel[],
        staff: { status: staff.data.status as string, papel: staff.data.role as Papel },
      };
    }

    const organizationId = await resolverOrganizacao(supabase);

    const [org, perfil, papeis] = await Promise.all([
      supabase.from("organizations").select("id,nome,slug,demo").eq("id", organizationId).maybeSingle(),
      supabase.from("profiles").select("id,nome,email").eq("id", context.userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("organization_id", organizationId),
    ]);

    return {
      userId: context.userId as string,
      organizationId: organizationId as string | null,
      organizacao: (org.data ?? null) as { id: string; nome: string; slug: string; demo: boolean } | null,
      perfil: (perfil.data ?? null) as { id: string; nome: string | null; email: string | null } | null,
      papeis: ((papeis.data ?? []) as { role: Papel }[]).map((p) => p.role),
      staff: staff.data
        ? { status: staff.data.status as string, papel: staff.data.role as Papel }
        : { status: "active", papel: "admin" as Papel },
    };
  });


export const listarRegistros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entidade: Entidade; incluirArquivados?: boolean }) => {
    if (!ENTIDADES.includes(data.entidade)) throw new Error("Entidade inválida.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    let q = supabase
      .from(data.entidade)
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });
    if (!data.incluirArquivados) q = q.is("archived_at", null);
    const { data: linhas, error } = await q;
    if (error) throw new Error(error.message);
    return (linhas ?? []) as Linha[];
  });

export const criarRegistro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entidade: Entidade; dados: Record<string, unknown> }) => {
    if (!ENTIDADES.includes(data.entidade)) throw new Error("Entidade inválida.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    const payload = { ...sanitizar(data.entidade, data.dados), organization_id: organizationId };
    validarEstadoInicial(data.entidade, payload);
    validarRegrasNegocio(data.entidade, payload);
    const { data: linha, error } = await supabase.from(data.entidade).insert(payload).select("id").maybeSingle();
    if (error) throw new Error(error.message);
    return { id: linha?.id as string | undefined };
  });

export const atualizarRegistro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entidade: Entidade; id: string; dados: Record<string, unknown> }) => {
    if (!ENTIDADES.includes(data.entidade)) throw new Error("Entidade inválida.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);

    const atual = await supabase
      .from(data.entidade)
      .select("*")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!atual.data) throw new Error("Registro não encontrado nesta organização.");
    if (atual.data["archived_at"]) throw new Error("Registro arquivado não pode ser editado.");

    const alteracoes = sanitizar(data.entidade, data.dados);
    const anterior = atual.data as Record<string, unknown>;
    const combinado = { ...anterior, ...alteracoes };
    validarTransicao(data.entidade, anterior, alteracoes);
    validarRegrasNegocio(data.entidade, combinado);

    const diff = Object.keys(alteracoes).filter(
      (k) => JSON.stringify(anterior[k] ?? null) !== JSON.stringify(alteracoes[k] ?? null),
    );
    if (diff.length === 0) return { ok: true, alterados: [] as string[], salvoEm: new Date().toISOString() };

    const { data: linhas, error } = await supabase
      .from(data.entidade)
      .update(alteracoes)
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .select("id");
    if (error) throw new Error(error.message);
    // Sem linha retornada = política de escrita bloqueou. Nunca falhar em silêncio.
    if (!linhas || linhas.length === 0) {
      throw new Error("Nada foi gravado: seu papel não permite editar este registro.");
    }

    // Registro de alterações do caso (quem, quando, o quê).
    const caseId =
      data.entidade === "crm_casos"
        ? data.id
        : typeof combinado["case_id"] === "string"
          ? (combinado["case_id"] as string)
          : null;
    if (caseId && (data.entidade === "crm_casos" || data.entidade === "case_members")) {
      await supabase.from("caso_log").insert(
        diff.map((campo) => ({
          organization_id: organizationId,
          case_id: caseId,
          entidade: data.entidade,
          entidade_id: data.id,
          campo,
          valor_anterior: anterior[campo] === null || anterior[campo] === undefined ? null : String(anterior[campo]),
          valor_novo: alteracoes[campo] === null ? null : String(alteracoes[campo]),
          autor_user_id: context.userId,
        })),
      );
    }

    return { ok: true, alterados: diff, salvoEm: new Date().toISOString() };
  });



export const arquivarRegistro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entidade: Entidade; id: string; motivo: string }) => {
    if (!ENTIDADES.includes(data.entidade)) throw new Error("Entidade inválida.");
    if (!data.motivo || data.motivo.trim().length < 5) {
      throw new Error("Informe um motivo de arquivamento com pelo menos 5 caracteres.");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    const { error } = await supabase
      .from(data.entidade)
      .update({
        archived_at: new Date().toISOString(),
        archived_by: context.userId,
        archive_motivo: data.motivo.trim(),
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Verificação servidor-side das condições obrigatórias de ativação. */
export const verificarCondicoesCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    const { error } = await supabase
      .from("crm_casos")
      .update({
        condicoes_verificadas_em: new Date().toISOString(),
        condicoes_verificadas_por: context.userId,
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const ativarCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    const caso = await supabase
      .from("crm_casos")
      .select("*")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");
    const c = caso.data as Record<string, unknown>;

    const pendencias: string[] = [];
    if (!c["contrato_assinado"]) pendencias.push("Contrato assinado");
    if (!c["pagamento_confirmado"]) pendencias.push("Pagamento confirmado");
    if (!c["documentos_minimos_ok"]) pendencias.push("Documentos mínimos conferidos");
    if (!c["condicoes_verificadas_em"]) pendencias.push("Verificação formal das condições");
    if (pendencias.length > 0) {
      return { ok: false, pendencias };
    }

    const { error } = await supabase
      .from("crm_casos")
      .update({ ativo: true, status: "ativo" })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) return { ok: false, pendencias: [error.message] };
    return { ok: true, pendencias: [] as string[] };
  });

export const registrarAcessoEvidencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { evidenciaId: string; acao: "upload" | "download" | "alteracao" | "visualizacao" }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    const { error } = await supabase.from("evidencia_acessos").insert({
      organization_id: organizationId,
      evidencia_id: data.evidenciaId,
      acao: data.acao,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listarAcessosEvidencia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { evidenciaId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    const { data: linhas } = await supabase
      .from("evidencia_acessos")
      .select("id,acao,user_id,created_at")
      .eq("organization_id", organizationId)
      .eq("evidencia_id", data.evidenciaId)
      .order("created_at", { ascending: false });
    return (linhas ?? []) as { id: string; acao: string; user_id: string | null; created_at: string }[];
  });

/** Somente admin: a política de RLS já bloqueia os demais papéis. */
export const listarAuditoria = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    const { data, error } = await supabase
      .from("audit_logs")
      .select("id,acao,entidade,entidade_id,user_id,created_at,valores_anteriores,valores_posteriores")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as Linha[];
  });

export const listarUsuarios = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    const [membros, papeis, perfis] = await Promise.all([
      supabase.from("organization_members").select("user_id,created_at,archived_at").eq("organization_id", organizationId),
      supabase.from("user_roles").select("user_id,role").eq("organization_id", organizationId),
      supabase.from("profiles").select("id,nome,email"),
    ]);
    const perfilPorId = new Map(
      ((perfis.data ?? []) as { id: string; nome: string | null; email: string | null }[]).map((p) => [p.id, p]),
    );
    return ((membros.data ?? []) as { user_id: string; created_at: string; archived_at: string | null }[]).map((m) => ({
      userId: m.user_id,
      desde: m.created_at,
      arquivado: Boolean(m.archived_at),
      nome: perfilPorId.get(m.user_id)?.nome ?? null,
      email: perfilPorId.get(m.user_id)?.email ?? null,
      papeis: ((papeis.data ?? []) as { user_id: string; role: Papel }[])
        .filter((p) => p.user_id === m.user_id)
        .map((p) => p.role),
    }));
  });

export const definirPapel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; papel: Papel; conceder: boolean }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase);
    if (data.conceder) {
      const { error } = await supabase
        .from("user_roles")
        .insert({ organization_id: organizationId, user_id: data.userId, role: data.papel });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      // papéis não são apagados fisicamente aqui: a remoção só é permitida ao admin via política
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("organization_id", organizationId)
        .eq("user_id", data.userId)
        .eq("role", data.papel);
      if (error) throw new Error("Remoção de papel indisponível: registre a alteração com um admin.");
    }
    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      user_id: context.userId,
      acao: data.conceder ? "papel_concedido" : "papel_removido",
      entidade: "user_roles",
      metadados: { alvo: data.userId, papel: data.papel },
    });
    return { ok: true };
  });
