import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { contextoRg, PAPEIS_EDITA } from "@/lib/pesquisa-modulo.server";

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

/**
 * Religação 31/10/2026 — o piloto foi absorvido pelo Caso 360: toda função
 * daqui trabalha no caso ESCOLHIDO (`caseId`), nunca no "primeiro caso piloto".
 * Escrever exige papel de edição; liberar o portal exige admin ou operações.
 */
const PAPEIS_LIBERA_PORTAL = ["admin", "operacoes"];

async function orgComPapel(supabase: Sb, userId: string, permitidos: string[], acao: string) {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  if (!permitidos.includes(papel)) throw new Error(`Seu papel não pode ${acao}.`);
  return organizationId as string;
}

/** Painel de conferência do caso escolhido: dados conferidos, bloqueios e pesquisa. */
export const painelPiloto = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { caseId: string }) => input)
  .handler(async ({ context, data }) => {
    semCache();
    const supabase = context.supabase as Sb;
    const org = await orgDoUsuario(supabase, context.userId as string);

    const { data: casos } = await supabase
      .from("crm_casos")
      .select("*")
      .eq("organization_id", org)
      .eq("id", data.caseId)
      .is("archived_at", null);

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
      supabase.from("research_cases").select("id,status,external_research_gate_status").is("archived_at", null).eq("case_id", caso["id"]).maybeSingle(),
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
    const org = await orgComPapel(supabase, context.userId as string, PAPEIS_EDITA, "registrar dado conferido");
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
    const org = await orgComPapel(supabase, context.userId as string, PAPEIS_EDITA, "verificar dado conferido");
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


/** Cria a pesquisa do caso escolhido — só depois de o caso operacional estar canônico. */
export const criarPesquisaPiloto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { caseId: string }) => input)
  .handler(async ({ context, data }) => {
    const supabase = context.supabase as Sb;
    const org = await orgComPapel(supabase, context.userId as string, PAPEIS_EDITA, "criar a pesquisa do caso");

    const { data: caso } = await supabase
      .from("crm_casos")
      .select("id,codigo,titulo,cliente_id,demo")
      .eq("organization_id", org)
      .eq("id", data.caseId)
      .is("archived_at", null)
      .maybeSingle();
    if (!caso) throw new Error("Caso não encontrado nesta organização.");
    if (caso["demo"]) throw new Error("Pesquisa do piloto não pode partir de caso de demonstração.");

    const { data: existente } = await supabase
      .from("research_cases")
      .select("id")
      .is("archived_at", null)
      .eq("case_id", caso["id"])
      .maybeSingle();
    if (existente) return { id: existente["id"] as string, jaExistia: true };

    const { data: criada, error } = await supabase
      .from("research_cases")
      .insert({
        organization_id: org,
        case_id: caso["id"],
        status: "preparation",
        research_objective: `Preparação de pesquisa a partir de dados conferidos — ${String(caso["titulo"] ?? caso["codigo"] ?? "caso")}.`,
        external_research_gate_status: "blocked_by_contract",
        external_research_authorization_status: "not_requested",
        demo: false,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: criada["id"] as string, jaExistia: false };
  });

/** Libera o portal do cliente do caso escolhido, somente por ação humana explícita. */
export const liberarPortalPiloto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { caseId: string; liberar: boolean }) => input)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const org = await orgComPapel(supabase, context.userId as string, PAPEIS_LIBERA_PORTAL, "liberar o portal do cliente");
    const { data: linhas, error } = await supabase
      .from("crm_casos")
      .update({ app_access_status: data.liberar ? "liberado" : "bloqueado", updated_by: context.userId })
      .eq("organization_id", org)
      .eq("id", data.caseId)
      .select("id");
    if (error) throw new Error(error.message);
    if (!linhas?.length) throw new Error("NENHUMA_LINHA_AFETADA: caso não encontrado nesta organização.");
    return { ok: true };
  });
