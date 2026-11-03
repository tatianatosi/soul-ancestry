import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { CHAVES_CONFERENCIA_MANUAL, PREFIXO_CHAVE_FORMALIZACAO, type RegistroPersistido } from "@/lib/formalizacao-cartoes";
import { CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";
import { exigirLinhaGravada } from "@/lib/persistencia.server";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Sb = any;

const FASE = "formalizacao";
const TIPO_SERVICO = "contrato";

async function orgDoUsuario(supabase: Sb, userId: string) {
  const { data } = await supabase.from("organization_members").select("organization_id").eq("user_id", userId).maybeSingle();
  const org = data?.organization_id as string | undefined;
  if (!org) throw new Error("Usuário sem organização.");
  return org;
}

async function exigirCasoDaOrganizacao(supabase: Sb, org: string, caseId: string) {
  const { data } = await supabase.from("crm_casos").select("id").eq("id", caseId).eq("organization_id", org).maybeSingle();
  if (!data?.id) throw new Error("Caso não encontrado nesta organização.");
}

/**
 * Estado persistido da formalização do caso: marcações de conferência humana
 * (`case_checklist_items`, fase "formalizacao") e as cláusulas alteradas do
 * contrato (`contract_clause_overrides`) — que são o único gatilho de escalada
 * jurídica excepcional. Só leitura.
 */
export const lerEstadoFormalizacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; contractId?: string | null }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as Sb;
    const org = await orgDoUsuario(supabase, context.userId as string);
    await exigirCasoDaOrganizacao(supabase, org, data.caseId);

    const { data: linhas, error } = await supabase
      .from("case_checklist_items")
      .select("item_key,status,observacao,concluido_por,concluido_em")
      .eq("organization_id", org)
      .eq("case_id", data.caseId)
      .eq("fase", FASE)
      .like("item_key", `${PREFIXO_CHAVE_FORMALIZACAO}%`);
    if (error) throw new Error(error.message);

    const persistidos: Record<string, RegistroPersistido> = {};
    for (const l of (linhas ?? []) as any[]) {
      persistidos[l.item_key] = {
        status: l.status,
        observacao: l.observacao ?? null,
        por: l.concluido_por ?? null,
        em: l.concluido_em ?? null,
      };
    }

    let clausulasAlteradas: any[] = [];
    if (data.contractId) {
      const { data: ov, error: e2 } = await supabase
        .from("contract_clause_overrides")
        .select("clause_code,clause_title,action,change_reason,clause_text,archived_at")
        .eq("organization_id", org)
        .eq("contract_id", data.contractId)
        .is("archived_at", null);
      if (e2) throw new Error(e2.message);
      clausulasAlteradas = ov ?? [];
    }

    return { persistidos, clausulasAlteradas };
  });

/**
 * Marca (ou desmarca) um item de CONFERÊNCIA HUMANA. Só chaves da whitelist;
 * fato derivado (dados, partes, escopo, anexos) nunca é marcado à mão.
 *
 * Grava → relê → compara, e registra a auditoria automaticamente (caso,
 * instrumento, versão, usuário, data, ação, campos alterados, evidência) —
 * sem checklist de auditoria manual. Não envia, não assina, não cobra, não
 * publica e não toca contrato assinado.
 */
export const marcarItemFormalizacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      caseId: string;
      chave: string;
      status: "pendente" | "cumprido" | "nao_aplicavel";
      observacao?: string | null;
      rotulo: string;
      contractId?: string | null;
      evidencia?: string | null;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const userId = context.userId as string;
    const org = await orgDoUsuario(supabase, userId);
    await exigirCasoDaOrganizacao(supabase, org, data.caseId);

    if (!(CHAVES_CONFERENCIA_MANUAL as readonly string[]).includes(data.chave)) {
      throw new Error("Este item é derivado de dados do caso e não pode ser marcado à mão.");
    }
    if (!["pendente", "cumprido", "nao_aplicavel"].includes(data.status)) throw new Error("Estado inválido.");
    const observacao = (data.observacao ?? "").trim() || null;
    if (data.status === "nao_aplicavel" && (observacao?.length ?? 0) < 10) {
      throw new Error("Marcar como não aplicável exige justificativa com ao menos 10 caracteres.");
    }

    if (data.contractId) {
      const { data: contrato } = await supabase
        .from("contracts")
        .select("id,signed_at,status")
        .eq("organization_id", org)
        .eq("id", data.contractId)
        .maybeSingle();
      if (contrato?.signed_at || contrato?.status === "signed") {
        throw new Error("Contrato já assinado: a conferência registrada não é alterada.");
      }
    }

    const { data: atual, error: eLer } = await supabase
      .from("case_checklist_items")
      .select("id,status,observacao")
      .eq("organization_id", org)
      .eq("case_id", data.caseId)
      .eq("item_key", data.chave)
      .maybeSingle();
    if (eLer) throw new Error(eLer.message);

    const payload = {
      status: data.status,
      observacao,
      evidencia_url: data.evidencia ?? null,
      archived_at: null as string | null,
    };
    let id = atual?.id as string | undefined;
    if (id) {
      const { error, data: gravadasChecklist } = await supabase.from("case_checklist_items").update(payload).eq("id", id).eq("organization_id", org)
    .select("id");
      exigirLinhaGravada({ error: error, data: gravadasChecklist }, "case_checklist_items");
      if (error) throw new Error(error.message);
    } else {
      const { data: criado, error } = await supabase
        .from("case_checklist_items")
        .insert({
          organization_id: org,
          case_id: data.caseId,
          item_key: data.chave,
          label: data.rotulo,
          fase: FASE,
          tipo_servico: TIPO_SERVICO,
          obrigatorio: false,
          ...payload,
        })
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      id = criado?.id;
    }
    if (!id) throw new Error("Nada foi gravado.");

    const { data: relido } = await supabase
      .from("case_checklist_items")
      .select("id,status,observacao,concluido_por,concluido_em")
      .eq("id", id)
      .maybeSingle();
    if (!relido || relido.status !== data.status || (relido.observacao ?? null) !== observacao) {
      throw new Error("A conferência não foi confirmada na releitura. Nada foi dado como salvo.");
    }

    await registrarAuditoria(supabase, {
      organization_id: org,
      user_id: userId,
      acao: "formalizacao_conferencia_marcada",
      entidade: "case_checklist_items",
      entidade_id: id,
      valores_anteriores: atual ? { status: atual.status, observacao: atual.observacao } : null,
      valores_posteriores: { status: relido.status, observacao: relido.observacao },
      metadados: {
        case_id: data.caseId,
        instrumento: "Contrato de Estudo Genealógico v2",
        versao_modelo: CONTRATO_BASE_VERSAO,
        contract_id: data.contractId ?? null,
        item: data.chave,
        campos_alterados: ["status", ...(atual?.observacao !== observacao ? ["observacao"] : [])],
        evidencia: data.evidencia ?? null,
      },
    });

    return {
      ok: true as const,
      registro: {
        status: relido.status as RegistroPersistido["status"],
        observacao: (relido.observacao ?? null) as string | null,
        por: (relido.concluido_por ?? null) as string | null,
        em: (relido.concluido_em ?? null) as string | null,
      },
    };
  });
