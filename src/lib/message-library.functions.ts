import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { gravarComVerificacao } from "@/lib/persistencia.server";

/**
 * Biblioteca de Mensagens e Conteúdos — camada interna e governada.
 *
 * Regras invioláveis aplicadas aqui e reforçadas por RLS/triggers:
 * - a organização nunca vem da interface: é derivada do usuário autenticado;
 * - nada é enviado, agendado ou disparado por este módulo — o uso é manual;
 * - modelo só é usado quando aprovado/vigente e com os gates cumpridos;
 * - não existe exclusão física: apenas arquivamento com motivo e autor;
 * - versões são imutáveis e o log de uso não guarda dado sensível nem token.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Cliente = { from: (t: string) => any; rpc: (f: string, a?: Record<string, unknown>) => any };

export type StatusTemplate =
  | "rascunho"
  | "em_revisao"
  | "aprovado"
  | "vigente"
  | "substituido"
  | "suspenso"
  | "arquivado";

export const STATUS_TEMPLATE: { valor: StatusTemplate; rotulo: string }[] = [
  { valor: "rascunho", rotulo: "Rascunho" },
  { valor: "em_revisao", rotulo: "Em revisão" },
  { valor: "aprovado", rotulo: "Aprovado" },
  { valor: "vigente", rotulo: "Vigente" },
  { valor: "substituido", rotulo: "Substituído" },
  { valor: "suspenso", rotulo: "Suspenso" },
  { valor: "arquivado", rotulo: "Arquivado" },
];

/** Só o administrador muda o modelo para estes estados. */
const ESTADOS_ADMIN: StatusTemplate[] = ["vigente", "suspenso", "substituido", "arquivado"];

export const CANAIS = ["whatsapp", "email", "portal", "artigo", "newsletter", "social", "interno"] as const;
export type Canal = (typeof CANAIS)[number];

export interface Categoria {
  id: string;
  key: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

export interface Template {
  id: string;
  categoriaId: string;
  categoriaKey: string;
  categoriaNome: string;
  key: string;
  nome: string;
  objetivo: string | null;
  canal: Canal;
  etapa: string | null;
  publico: string;
  corpo: string;
  assunto: string | null;
  variaveisSeguras: string[];
  variaveisObrigatorias: string[];
  restricoes: string[];
  exigeRevisaoHumana: boolean;
  exigeGate: boolean;
  status: StatusTemplate;
  versao: number;
  arquivado: boolean;
  motivoArquivo: string | null;
  demo: boolean;
  sucessorId: string | null;
  atualizadoEm: string | null;
}

export interface VersaoTemplate {
  id: string;
  versao: number;
  corpo: string;
  assunto: string | null;
  status: string;
  motivo: string | null;
  criadoEm: string;
}

export interface UsoTemplate {
  id: string;
  versao: number;
  canal: string;
  finalidade: string | null;
  situacao: string;
  em: string;
}

export interface ConteudoEditorial {
  id: string;
  titulo: string;
  tipo: string;
  tema: string | null;
  etapaFunil: string | null;
  publico: string | null;
  status: string;
  planejadoPara: string | null;
  publicadoEm: string | null;
  arquivado: boolean;
  responsavel: string | null;
  proximaAcao: string;
  vinculos: VinculoEditorial[];
}

export interface VinculoEditorial {
  linkType: string;
  entidadeTipo: string;
  entidadeId: string;
}

/** Rótulo dos 8 estados de editorial_content_items — nenhum é omitido nem simplificado. */
export const STATUS_EDITORIAL: { valor: string; rotulo: string }[] = [
  { valor: "ideia", rotulo: "Ideia" },
  { valor: "pauta_aprovada", rotulo: "Pauta aprovada" },
  { valor: "rascunho", rotulo: "Rascunho" },
  { valor: "em_revisao", rotulo: "Em revisão" },
  { valor: "aprovado", rotulo: "Aprovado" },
  { valor: "agendado", rotulo: "Agendado" },
  { valor: "publicado", rotulo: "Publicado" },
  { valor: "arquivado", rotulo: "Arquivado" },
];

export function rotuloStatusEditorial(status: string): string {
  return STATUS_EDITORIAL.find((s) => s.valor === status)?.rotulo ?? status;
}

const PROXIMA_ACAO_EDITORIAL: Record<string, string> = {
  ideia: "Aprovar pauta",
  pauta_aprovada: "Produzir rascunho",
  rascunho: "Enviar para revisão",
  em_revisao: "Aprovar conteúdo",
  aprovado: "Agendar publicação",
  agendado: "Publicar",
  publicado: "Nenhuma ação pendente — publicado",
  arquivado: "Nenhuma ação — arquivado",
};

/** Próxima ação derivada do estado do conteúdo — nunca uma lista morta sem ação. */
export function proximaAcaoEditorial(status: string): string {
  return PROXIMA_ACAO_EDITORIAL[status] ?? "Sem próxima ação definida para este estado.";
}

export const ROTULO_LINK_EDITORIAL: Record<string, string> = {
  referencia: "Referência",
  derivado_de: "Derivado de",
  reutiliza_template: "Reutiliza modelo",
  relacionado_a: "Relacionado a",
};

/** Termos vetados em texto cliente-facing (mérito, promessa, cobrança, dado sensível). */
const TERMOS_VETADOS = [
  "chance de",
  "garantid",
  "certeza de êxito",
  "hipótese forte",
  "aprovação certa",
  "cpf",
  "senha",
  "token",
  "boleto",
  "pix ",
];

/** Validação de conteúdo — usada na criação e na edição de modelos. */
export function validarConteudoTemplate(corpo: string, publico: string): string[] {
  const problemas: string[] = [];
  const texto = (corpo ?? "").toLowerCase();
  if (!corpo?.trim()) problemas.push("Corpo da mensagem é obrigatório.");
  if (publico !== "interno") {
    for (const termo of TERMOS_VETADOS) {
      if (texto.includes(termo)) problemas.push(`Texto cliente-facing contém termo não permitido: “${termo.trim()}”.`);
    }
  }
  const variaveis = [...(corpo ?? "").matchAll(/\{([a-z_]+)\}/g)].map((m) => m[1]!);
  for (const v of variaveis) {
    if (["cpf", "rg", "token", "senha", "documento", "valor"].includes(v)) {
      problemas.push(`Variável “${v}” não é um campo seguro de personalização.`);
    }
  }
  return problemas;
}

async function resolverOrg(supabase: Cliente, userId: string): Promise<string> {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("Acesso não autorizado.");
  return data.organization_id as string;
}

/** Papéis da PESSOA (não da organização inteira): staff_access ativo + user_roles dela. */
async function papeis(supabase: Cliente, org: string, userId: string): Promise<string[]> {
  const [roles, staff] = await Promise.all([
    supabase.from("user_roles").select("role").eq("organization_id", org).eq("user_id", userId).is("archived_at", null),
    supabase.from("staff_access").select("role,status").eq("auth_user_id", userId).is("archived_at", null).maybeSingle(),
  ]);
  const lista = ((roles.data ?? []) as { role: string }[]).map((r) => r.role);
  const s = staff.data as { role?: string; status?: string } | null;
  if (s?.status === "active" && s.role && !lista.includes(s.role)) lista.push(s.role);
  return lista;
}

function lista(valor: unknown): string[] {
  return Array.isArray(valor) ? valor.map(String) : [];
}

export const listarBibliotecaMensagens = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({
      context,
    }): Promise<{
      categorias: Categoria[];
      templates: Template[];
      editorial: ConteudoEditorial[];
      ehAdmin: boolean;
      papeis: string[];
    }> => {
      semCache();
      const supabase = context.supabase as unknown as Cliente;
      const org = await resolverOrg(supabase, context.userId as string);
      const meus = await papeis(supabase, org, context.userId as string);

      const [cats, tpls, edit, links] = await Promise.all([
        supabase
          .from("message_template_categories")
          .select("id,key,name,description,sort_order")
          .eq("organization_id", org)
          .is("archived_at", null)
          .order("sort_order"),
        supabase
          .from("message_templates")
          .select(
            "id,category_id,key,name,objective,channel,stage_scope,audience,body,subject,safe_variables,required_variables,prohibited_claims,requires_human_review,requires_gate_validation,status,version,archived_at,archive_reason,is_demo,supersedes_template_id,updated_at",
          )
          .eq("organization_id", org)
          .order("name"),
        supabase
          .from("editorial_content_items")
          .select("id,title,content_type,theme,funnel_stage,target_audience,status,planned_for,published_at,archived_at,owner_id")
          .eq("organization_id", org)
          .order("created_at", { ascending: false }),
        supabase
          .from("editorial_content_links")
          .select("editorial_content_item_id,linked_entity_type,linked_entity_id,link_type")
          .eq("organization_id", org)
          .is("archived_at", null),
      ]);

      // CA10-MARKETING-CONTEUDO-VIVO (09/09/2026): owner_id e
      // editorial_content_links existem desde a migração original mas nunca
      // tinham sido lidos por nenhuma tela — "motor pronto, nunca ligado".
      // Nome do responsável vem de staff_access (fonte real de identidade
      // interna), nunca de texto livre. Vínculo é sempre entidade-a-entidade
      // (campanha/fonte/modelo etc.) — nunca pessoa, lead ou caso, conforme a
      // regra editorial já vigente nesta tela.
      const ownerIds = [...new Set(((edit.data ?? []) as any[]).map((e) => e.owner_id).filter(Boolean))];
      const staffRows = ownerIds.length
        ? (
            await supabase
              .from("staff_access")
              .select("auth_user_id,full_name,email")
              .eq("organization_id", org)
              .in("auth_user_id", ownerIds)
          ).data
        : [];
      const nomePorOwner = new Map(
        ((staffRows ?? []) as any[]).map((s) => [s.auth_user_id, (s.full_name ?? "").trim() || (s.email ?? "").trim() || null]),
      );

      const vinculosPorItem = new Map<string, VinculoEditorial[]>();
      for (const l of (links.data ?? []) as any[]) {
        const arr = vinculosPorItem.get(l.editorial_content_item_id) ?? [];
        arr.push({ linkType: l.link_type, entidadeTipo: l.linked_entity_type, entidadeId: l.linked_entity_id });
        vinculosPorItem.set(l.editorial_content_item_id, arr);
      }

      const categorias: Categoria[] = (cats.data ?? []).map((c: any) => ({
        id: c.id,
        key: c.key,
        name: c.name,
        description: c.description ?? null,
        sortOrder: c.sort_order ?? 0,
      }));
      const porId = new Map(categorias.map((c) => [c.id, c]));

      const templates: Template[] = (tpls.data ?? []).map((t: any) => ({
        id: t.id,
        categoriaId: t.category_id,
        categoriaKey: porId.get(t.category_id)?.key ?? "interno",
        categoriaNome: porId.get(t.category_id)?.name ?? "—",
        key: t.key,
        nome: t.name,
        objetivo: t.objective ?? null,
        canal: t.channel,
        etapa: t.stage_scope || null,
        publico: t.audience,
        corpo: t.body,
        assunto: t.subject ?? null,
        variaveisSeguras: lista(t.safe_variables),
        variaveisObrigatorias: lista(t.required_variables),
        restricoes: lista(t.prohibited_claims),
        exigeRevisaoHumana: !!t.requires_human_review,
        exigeGate: !!t.requires_gate_validation,
        status: t.status,
        versao: t.version,
        arquivado: !!t.archived_at,
        motivoArquivo: t.archive_reason ?? null,
        demo: !!t.is_demo,
        sucessorId: t.supersedes_template_id ?? null,
        atualizadoEm: t.updated_at ?? null,
      }));

      const editorial: ConteudoEditorial[] = (edit.data ?? []).map((e: any) => ({
        id: e.id,
        titulo: e.title,
        tipo: e.content_type,
        tema: e.theme ?? null,
        etapaFunil: e.funnel_stage ?? null,
        publico: e.target_audience ?? null,
        status: e.status,
        planejadoPara: e.planned_for ?? null,
        publicadoEm: e.published_at ?? null,
        arquivado: !!e.archived_at,
        responsavel: e.owner_id ? (nomePorOwner.get(e.owner_id) ?? null) : null,
        proximaAcao: proximaAcaoEditorial(e.status),
        vinculos: vinculosPorItem.get(e.id) ?? [],
      }));

      return { categorias, templates, editorial, ehAdmin: meus.includes("admin"), papeis: meus };
    },
  );

export const listarVersoesTemplate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { templateId: string }) => {
    if (!data?.templateId) throw new Error("Modelo inválido.");
    return { templateId: data.templateId };
  })
  .handler(async ({ context, data }): Promise<{ versoes: VersaoTemplate[] }> => {
    semCache();
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    const { data: linhas } = await supabase
      .from("message_template_versions")
      .select("id,version,body_snapshot,subject_snapshot,status_snapshot,change_reason,created_at")
      .eq("organization_id", org)
      .eq("template_id", data.templateId)
      .order("created_at", { ascending: false });
    return {
      versoes: (linhas ?? []).map((v: any) => ({
        id: v.id,
        versao: v.version,
        corpo: v.body_snapshot,
        assunto: v.subject_snapshot ?? null,
        status: v.status_snapshot,
        motivo: v.change_reason ?? null,
        criadoEm: v.created_at,
      })),
    };
  });

export const salvarTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id?: string;
      categoriaId: string;
      key: string;
      nome: string;
      objetivo?: string;
      canal: Canal;
      etapa?: string;
      publico: string;
      corpo: string;
      assunto?: string;
      variaveisSeguras?: string[];
      variaveisObrigatorias?: string[];
    }) => {
      const problemas = validarConteudoTemplate(data.corpo, data.publico);
      if (problemas.length) throw new Error(problemas.join(" "));
      return {
        id: data.id ?? null,
        categoriaId: data.categoriaId,
        key: data.key.trim().toLowerCase().replace(/\s+/g, "_"),
        nome: data.nome.trim(),
        objetivo: data.objetivo?.trim() || null,
        canal: data.canal,
        etapa: data.etapa?.trim() || null,
        publico: data.publico,
        corpo: data.corpo,
        assunto: data.assunto?.trim() || null,
        variaveisSeguras: data.variaveisSeguras ?? [],
        variaveisObrigatorias: data.variaveisObrigatorias ?? [],
      };
    },
  )
  .handler(async ({ context, data }) => {
    semCache();
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);

    const linha = {
      organization_id: org,
      category_id: data.categoriaId,
      key: data.key,
      name: data.nome,
      objective: data.objetivo,
      channel: data.canal,
      stage_scope: data.etapa,
      audience: data.publico,
      body: data.corpo,
      subject: data.assunto,
      safe_variables: data.variaveisSeguras,
      required_variables: data.variaveisObrigatorias,
    };

    if (data.id) {
      await gravarComVerificacao({
        supabase,
        tabela: "message_templates",
        id: data.id,
        organizationId: org,
        userId: context.userId as string,
        payload: linha,
      });
      return { ok: true, id: data.id };
    }

    const { data: criado, error } = await supabase
      .from("message_templates")
      .insert({ ...linha, status: "rascunho", version: 1 })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: criado.id as string };
  });

export const definirStatusTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: StatusTemplate; motivo?: string; sucessorId?: string | null }) => {
    if (!data?.id) throw new Error("Modelo inválido.");
    if (!STATUS_TEMPLATE.some((s) => s.valor === data.status)) throw new Error("Estado inválido.");
    if (data.status === "arquivado" && (data.motivo ?? "").trim().length < 5) {
      throw new Error("Arquivamento exige motivo com pelo menos 5 caracteres.");
    }
    return {
      id: data.id,
      status: data.status,
      motivo: data.motivo?.trim() || null,
      sucessorId: data.sucessorId || null,
    };
  })
  .handler(async ({ context, data }) => {
    semCache();
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    const meus = await papeis(supabase, org, context.userId as string);
    if (ESTADOS_ADMIN.includes(data.status) && !meus.includes("admin")) {
      throw new Error("Somente administrador pode tornar o modelo vigente, suspenso, substituído ou arquivado.");
    }

    const patch: Record<string, unknown> = { status: data.status };
    if (data.status === "arquivado") {
      patch["archived_at"] = new Date().toISOString();
      patch["archive_reason"] = data.motivo;
    }
    if (data.status === "substituido") patch["supersedes_template_id"] = data.sucessorId;
    if (data.status === "vigente") patch["effective_from"] = new Date().toISOString();

    await gravarComVerificacao({
      supabase,
      tabela: "message_templates",
      id: data.id,
      organizationId: org,
      userId: context.userId as string,
      payload: patch,
    });
    return { ok: true };
  });

export interface ResultadoValidacao {
  permitido: boolean;
  bloqueios: string[];
  versao: number | null;
}

/** Confere no banco se o modelo pode ser usado neste contexto. Não envia nada. */
export const validarUsoTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { templateId: string; casoId?: string | null; leadId?: string | null }) => {
    if (!data?.templateId) throw new Error("Modelo inválido.");
    return { templateId: data.templateId, casoId: data.casoId || null, leadId: data.leadId || null };
  })
  .handler(async ({ context, data }): Promise<ResultadoValidacao> => {
    semCache();
    const supabase = context.supabase as unknown as Cliente;
    const { data: r, error } = await supabase.rpc("fn_validar_uso_template", {
      _template_id: data.templateId,
      _actor_id: context.userId,
      _lead_id: data.leadId,
      _case_id: data.casoId,
    });
    if (error) throw new Error(error.message);
    return {
      permitido: !!r?.permitido,
      bloqueios: lista(r?.bloqueios),
      versao: r?.template_version ?? null,
    };
  });

/** Registra que o texto foi copiado para envio manual. Nunca dispara mensagem. */
export const registrarUsoTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      templateId: string;
      casoId?: string | null;
      leadId?: string | null;
      finalidade?: string;
      variaveis?: Record<string, string>;
    }) => {
      if (!data?.templateId) throw new Error("Modelo inválido.");
      return {
        templateId: data.templateId,
        casoId: data.casoId || null,
        leadId: data.leadId || null,
        finalidade: data.finalidade?.trim() || null,
        variaveis: data.variaveis ?? {},
      };
    },
  )
  .handler(async ({ context, data }) => {
    semCache();
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);

    const { data: validacao, error: erroValidacao } = await supabase.rpc("fn_validar_uso_template", {
      _template_id: data.templateId,
      _actor_id: context.userId,
      _lead_id: data.leadId,
      _case_id: data.casoId,
    });
    if (erroValidacao) throw new Error(erroValidacao.message);

    // Autoridade operacional (05/09/2026): pendência informa, não impede. O
    // registro de uso do modelo era recusado no servidor pelos bloqueios da
    // validação, e a proprietária ficava sem conseguir sequer registrar que
    // copiou o texto. Ela assume os bloqueios, que ficam gravados no próprio
    // registro de uso; os demais papéis seguem bloqueados.
    let pendenciasAssumidas: string[] = [];
    if (!validacao?.permitido) {
      const bloqueios = lista(validacao?.bloqueios);
      const { assumirOuRecusarComUsuario } = await import("@/lib/autoridade.server");
      pendenciasAssumidas = await assumirOuRecusarComUsuario(
        supabase,
        context.userId as string,
        bloqueios.length ? bloqueios : ["Uso do modelo não permitido pela validação vigente."],
        `Uso bloqueado: ${bloqueios.join(" ")}`,
      );
    }

    const { data: modelo } = await supabase
      .from("message_templates")
      .select("channel,version")
      .eq("id", data.templateId)
      .eq("organization_id", org)
      .maybeSingle();
    if (!modelo) throw new Error("Modelo indisponível.");

    // O log guarda apenas quais variáveis foram usadas, nunca os valores.
    const chaves = Object.keys(data.variaveis).filter((k) => (data.variaveis[k] ?? "").trim().length > 0);

    const { error } = await supabase.from("message_template_usage").insert({
      organization_id: org,
      template_id: data.templateId,
      template_version: modelo.version,
      case_id: data.casoId,
      lead_id: data.leadId,
      channel: modelo.channel,
      variables_used: Object.fromEntries(chaves.map((k) => [k, "preenchido"])),
      purpose: data.finalidade,
      external_send_status: "copiado_para_envio_manual",
      // Liberar não é apagar: o uso fica marcado com a pendência assumida.
      bloqueado: pendenciasAssumidas.length > 0,
      bloqueios: pendenciasAssumidas,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listarUsosTemplate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { templateId: string }) => {
    if (!data?.templateId) throw new Error("Modelo inválido.");
    return { templateId: data.templateId };
  })
  .handler(async ({ context, data }): Promise<{ usos: UsoTemplate[] }> => {
    semCache();
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    const { data: linhas } = await supabase
      .from("message_template_usage")
      .select("id,template_version,channel,purpose,external_send_status,used_at")
      .eq("organization_id", org)
      .eq("template_id", data.templateId)
      .order("used_at", { ascending: false })
      .limit(50);
    return {
      usos: (linhas ?? []).map((u: any) => ({
        id: u.id,
        versao: u.template_version,
        canal: u.channel,
        finalidade: u.purpose ?? null,
        situacao: u.external_send_status,
        em: u.used_at,
      })),
    };
  });
