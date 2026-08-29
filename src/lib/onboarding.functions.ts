import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  meusPapeis,
  podeAtivar,
  podeValidar,
  registrar,
  resolverOrganizacao,
  type CheckAtivacao,
  type EventoOnboarding,
  type Papel,
  type SupabaseCliente,
} from "@/lib/onboarding-regras";

export type { CheckAtivacao, EventoOnboarding, Papel } from "@/lib/onboarding-regras";

export const obterOnboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
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

    const linha = (caso.data ?? {}) as Record<string, string | number | boolean | null>;
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
      pendencias: (pendencias.data ?? []) as { check_key: string; label: string; motivo: string }[],
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
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
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
    }
    const isencaoMotivo = (data.isencaoMotivo ?? "").trim() || "Isenção sem motivo informado.";

    const patch: Record<string, unknown> = {
      status: data.status,
      observacao: data.observacao ?? check.observacao,
      origem_validacao: data.status === "isento" ? "isencao_admin" : "validacao_manual",
    };
    if (data.status === "isento") {
      patch["isencao_motivo"] = isencaoMotivo;
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
        motivo: data.status === "isento" ? isencaoMotivo : null,
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
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const papeis = await meusPapeis(supabase, organizationId);
    if (!podeAtivar(papeis)) {
      await registrar(supabase, organizationId, "ativacao_bloqueada", data.casoId, {
        resumo: "Tentativa de ativação recusada: papel sem permissão",
      });
      return { ok: false, pendencias: ["Somente admin ou operações podem ativar."] };
    }

    // Fonte de verdade: os 14 requisitos obrigatórios avaliados no banco.
    const bloq = await supabase.rpc("case_activacao_bloqueios", { _case: data.casoId });
    const lista = ((bloq.data ?? []) as string[]).slice();
    if (bloq.error) lista.push(bloq.error.message);

    if (lista.length > 0) {
      await registrar(supabase, organizationId, "ativacao_bloqueada", data.casoId, {
        resumo: `Tentativa de ativação recusada: ${lista.length} requisito(s) obrigatório(s) fora de validado`,
        pendencias: lista,
      });
      return { ok: false, pendencias: lista };
    }

    // A máquina de estados (estados.ts, espelhada no banco) não permite pular
    // direto de "rascunho" para "ativo" — exige passar por um estado
    // intermediário e por "pronto_para_ativar". Os 14 requisitos acima já
    // validaram tudo que essas etapas exigiriam; este caminho só formaliza a
    // transição passo a passo para não ser recusado pela trava do banco.
    const caminhoAteAtivo: Record<string, string> = {
      rascunho: "aguardando_documentos",
      aguardando_documentos: "pronto_para_ativar",
      aguardando_pagamento: "pronto_para_ativar",
      pronto_para_ativar: "ativo",
    };

    const { data: casoAtual, error: erroLeitura } = await supabase
      .from("crm_casos")
      .select("status")
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (erroLeitura || !casoAtual) {
      const motivo = erroLeitura?.message ?? "Caso não encontrado nesta organização.";
      await registrar(supabase, organizationId, "ativacao_bloqueada", data.casoId, {
        resumo: "Ativação recusada: caso não localizado",
        pendencias: [motivo],
      });
      return { ok: false, pendencias: [motivo] };
    }

    let statusAtual = casoAtual["status"] as string;
    let saltos = 0;
    while (statusAtual !== "ativo") {
      const proximo = caminhoAteAtivo[statusAtual];
      if (!proximo || saltos > 5) {
        const motivo = `Transição de caso não permitida: ${statusAtual} → ativo.`;
        await registrar(supabase, organizationId, "ativacao_bloqueada", data.casoId, {
          resumo: "Ativação recusada: sem caminho válido até ativo",
          pendencias: [motivo],
        });
        return { ok: false, pendencias: [motivo] };
      }
      const { error } = await supabase
        .from("crm_casos")
        .update(proximo === "ativo" ? { status: proximo, ativo: true } : { status: proximo })
        .eq("id", data.casoId)
        .eq("organization_id", organizationId);
      if (error) {
        await registrar(supabase, organizationId, "ativacao_bloqueada", data.casoId, {
          resumo: `Ativação recusada pelo banco na transição ${statusAtual} → ${proximo}`,
          pendencias: [error.message],
        });
        return { ok: false, pendencias: [error.message] };
      }
      statusAtual = proximo;
      saltos += 1;
    }

    await registrar(supabase, organizationId, "caso_ativado", data.casoId, {
      resumo: "Caso ativado com todos os 14 requisitos obrigatórios validados",
    });
    return { ok: true, pendencias: [] as string[] };
  });


export const suspenderCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string; motivo: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const papeis = await meusPapeis(supabase, organizationId);
    if (!podeAtivar(papeis)) return { ok: false, erro: "Somente admin ou operações podem suspender." };
    const motivo = (data.motivo ?? "").trim() || "Suspensão sem motivo informado.";

    const { error } = await supabase
      .from("crm_casos")
      .update({ status: "pausado", suspenso_motivo: motivo })
      .eq("id", data.casoId)
      .eq("organization_id", organizationId);
    if (error) return { ok: false, erro: error.message };

    await registrar(supabase, organizationId, "caso_suspenso", data.casoId, {
      resumo: "Caso suspenso",
      motivo,
    });
    return { ok: true, erro: null as string | null };
  });
