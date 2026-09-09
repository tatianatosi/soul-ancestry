import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gravarComVerificacao } from "@/lib/persistencia.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Sb = any;

const ORIGENS = [
  "proposta_aprovada",
  "whatsapp_confirmado",
  "reuniao_transcricao",
  "documento",
  "formulario",
  "preenchimento_humano",
] as const;

const PLACEHOLDER = /(\[ex\.|\bex\.:|lorem ipsum|preencher|placeholder|xxx|<[^>]*>)/i;

async function orgDoUsuario(supabase: Sb, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .maybeSingle();
  const org = data?.organization_id as string | undefined;
  if (!org) throw new Error("Usuário sem organização.");
  return org;
}

/** Painel do piloto real: caso canônico único, conferência de dados e bloqueios. */
export const painelPiloto = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as Sb;
    const org = await orgDoUsuario(supabase, context.userId as string);

    const { data: casos } = await supabase
      .from("crm_casos")
      .select("*")
      .eq("organization_id", org)
      .eq("piloto", true)
      .eq("demo", false)
      .is("archived_at", null)
      .order("created_at", { ascending: true });

    const caso = (casos ?? [])[0] as Record<string, any> | undefined;
    if (!caso) return { caso: null, cliente: null, campos: [], bloqueios: [], pesquisa: null, duplicatas: 0 };

    const [cliente, campos, bloqueios, pesquisa] = await Promise.all([
      supabase.from("clientes").select("id,nome,email,telefone,demo").eq("id", caso["cliente_id"]).maybeSingle(),
      supabase
        .from("piloto_conferencia")
        .select("*")
        .eq("case_id", caso["id"])
        .is("archived_at", null)
        .order("secao", { ascending: true })
        .order("campo", { ascending: true }),
      supabase
        .from("piloto_bloqueios")
        .select("*")
        .eq("case_id", caso["id"])
        .is("archived_at", null)
        .order("chave", { ascending: true }),
      supabase.from("research_cases").select("id,status,external_research_gate_status").eq("case_id", caso["id"]).maybeSingle(),
    ]);

    return {
      caso,
      cliente: cliente.data ?? null,
      campos: (campos.data ?? []) as Record<string, any>[],
      bloqueios: (bloqueios.data ?? []) as Record<string, any>[],
      pesquisa: pesquisa.data ?? null,
      duplicatas: Math.max(0, (casos ?? []).length - 1),
    };
  });

/** Registra ou atualiza um dado conferido, sempre com origem declarada. */
export const salvarDadoPiloto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; valor: string; origem: string; origemDetalhe?: string; observacao?: string }) => {
    const valor = input.valor.trim();
    if (valor && PLACEHOLDER.test(valor)) {
      throw new Error("Valor contém texto de exemplo. Deixe o campo vazio como pendência.");
    }
    return { ...input, valor };
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const org = await orgDoUsuario(supabase, context.userId as string);
    await gravarComVerificacao({
      supabase,
      tabela: "piloto_conferencia",
      id: data.id,
      organizationId: org,
      userId: context.userId as string,
      payload: {
        valor: data.valor || null,
        origem: data.valor ? data.origem : null,
        origem_detalhe: data.origemDetalhe?.trim() || null,
        observacao: data.observacao?.trim() || null,
      },
    });
    return { ok: true };
  });

/** Marca um dado como verificado por revisão humana (fonte bruta não valida). */
export const verificarDadoPiloto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; verificado: boolean }) => input)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const org = await orgDoUsuario(supabase, context.userId as string);
    if (data.verificado) {
      const { data: atual } = await supabase
        .from("piloto_conferencia")
        .select("valor,origem")
        .eq("id", data.id)
        .maybeSingle();
      if (!atual?.valor) throw new Error("Campo sem dado não pode ser verificado.");
      if (["whatsapp_confirmado", "reuniao_transcricao"].includes(String(atual.origem))) {
        throw new Error(
          "Fonte bruta (WhatsApp/reunião/transcrição) não valida o campo. Registre documento, proposta aprovada ou formulário validado antes de verificar.",
        );
      }
    }
    await gravarComVerificacao({
      supabase,
      tabela: "piloto_conferencia",
      id: data.id,
      organizationId: org,
      userId: context.userId as string,
      payload: { verificado: data.verificado },
    });
    return { ok: true };
  });


/** Resolve um bloqueio crítico (admin ou operações, com justificativa). */
export const resolverBloqueioPiloto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "resolvido" | "nao_aplicavel"; justificativa: string }) => input)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const org = await orgDoUsuario(supabase, context.userId as string);
    const justificativa = (data.justificativa ?? "").trim() || "Sem justificativa informada.";
    await gravarComVerificacao({
      supabase,
      tabela: "piloto_bloqueios",
      id: data.id,
      organizationId: org,
      userId: context.userId as string,
      payload: { status: data.status, justificativa },
    });
    return { ok: true };
  });

/** Cria a pesquisa do piloto — só depois de o caso operacional estar canônico. */
export const criarPesquisaPiloto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as Sb;
    const org = await orgDoUsuario(supabase, context.userId as string);

    const { data: caso } = await supabase
      .from("crm_casos")
      .select("id,codigo,cliente_id,demo")
      .eq("organization_id", org)
      .eq("piloto", true)
      .is("archived_at", null)
      .maybeSingle();
    if (!caso) throw new Error("Caso piloto não encontrado.");
    if (caso["demo"]) throw new Error("Pesquisa do piloto não pode partir de caso de demonstração.");

    const { data: existente } = await supabase
      .from("research_cases")
      .select("id")
      .eq("case_id", caso["id"])
      .maybeSingle();
    if (existente) return { id: existente["id"] as string, jaExistia: true };

    const { data: criada, error } = await supabase
      .from("research_cases")
      .insert({
        organization_id: org,
        case_id: caso["id"],
        status: "preparation",
        research_objective: "Piloto real — preparação de pesquisa a partir de dados conferidos.",
        external_research_gate_status: "blocked_by_contract",
        external_research_authorization_status: "not_requested",
        demo: false,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: criada["id"] as string, jaExistia: false };
  });

/** Libera o portal do cliente somente por ação humana explícita. */
export const liberarPortalPiloto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { liberar: boolean }) => input)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const org = await orgDoUsuario(supabase, context.userId as string);
    const { data: linhas, error } = await supabase
      .from("crm_casos")
      .update({ app_access_status: data.liberar ? "liberado" : "bloqueado", updated_by: context.userId })
      .eq("organization_id", org)
      .eq("piloto", true)
      .select("id");
    if (error) throw new Error(error.message);
    if (!linhas?.length) throw new Error("NENHUMA_LINHA_AFETADA: nenhum caso piloto encontrado nesta organização.");
    return { ok: true };
  });
