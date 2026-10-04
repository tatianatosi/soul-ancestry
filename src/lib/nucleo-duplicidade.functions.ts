import { ehFixtureLinha, semFixtures } from "@/lib/fixtures";
import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CONFIRMACAO_UNIFICAR,
  detectarDuplicidades,
  exigirConfirmacaoUnificar,
  montarPlanoUnificacao,
  validarPosMerge,
  type NucleoParaComparar,
} from "@/lib/nucleo-duplicidade";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Sb = any;

const UUID = /^[0-9a-f-]{36}$/i;

async function orgDoUsuario(supabase: Sb, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}

async function auditarUnificacao(
  supabase: Sb,
  input: {
    org: string;
    userId: string;
    acao: string;
    entidadeId: string;
    metadados?: Record<string, unknown>;
  },
) {
  const { error } = await supabase.from("audit_logs").insert({
    organization_id: input.org,
    user_id: input.userId,
    acao: input.acao,
    entidade: "nucleos_familiares",
    entidade_id: input.entidadeId,
    metadados: input.metadados ?? {},
  });
  if (error) throw new Error(error.message);
}

/**
 * Fase 1 (Detecção) da unificação controlada de núcleos familiares.
 * Carrega núcleos ativos da organização, requerentes, caso vinculado e
 * contagem de leads, e roda `detectarDuplicidades`.
 *
 * Não decide e não funde. A execução (fases 2–6) está em
 * `executarUnificacaoNucleo`, com as colunas já existentes
 * (archived_at / archive_motivo / archived_by / status arquivado).
 */
export const listarCandidatosDuplicidadeNucleo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;

    const { data: nucleos, error } = await supabase
      .from("nucleos_familiares")
      .select(
        "id,case_id,nome,dossie_mae,contratante_nome,dossie_status,status,archived_at,created_at,updated_at",
      )
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = ((nucleos ?? []) as any[]).map((n) => n.id);
    const caseIds = Array.from(new Set(((nucleos ?? []) as any[]).map((n) => n.case_id).filter(Boolean)));

    const [{ data: membros }, { data: casos }, { data: leads }] = await Promise.all([
      ids.length
        ? supabase
            .from("nucleo_membros")
            .select("id,nucleo_id,nome,papel,archived_at")
            .in("nucleo_id", ids)
        : Promise.resolve({ data: [] }),
      caseIds.length
        ? supabase.from("crm_casos").select("id,codigo,titulo,pais,dados_teste,data_origin").in("id", caseIds)
        : Promise.resolve({ data: [] }),
      ids.length
        ? supabase.from("leads").select("id,nucleo_id,nome").in("nucleo_id", ids).is("archived_at", null)
        : Promise.resolve({ data: [] }),
    ]);

    const porCaso = new Map(((casos ?? []) as any[]).map((c) => [c.id, c]));
    /*
     * 04/10/2026, modo execução controlada: o núcleo real da Ana tem um lead
     * de demonstração pendurado ("Ana Luiza (dado de teste)", sem case_id).
     * Contá-lo como lead ativo do núcleo faz o Desk mostrar um número que não
     * corresponde a nenhuma oportunidade real. Fica no banco, fora da conta.
     */
    const leadsPorNucleo = new Map<string, number>();
    for (const l of semFixtures((leads ?? []) as never) as any[]) {
      leadsPorNucleo.set(l.nucleo_id, (leadsPorNucleo.get(l.nucleo_id) ?? 0) + 1);
    }

    /*
     * Varredura de demonstração em todas as abas (04/10/2026, pedido da
     * Proprietária). Esta tela UNIFICA registros: núcleo de demonstração não
     * pode entrar na lista de candidatos e virar candidato a fusão com um
     * núcleo real. Filtra pelo próprio núcleo (nome) e pelo caso vinculado;
     * nada é apagado.
     */
    const nucleosReais = ((nucleos ?? []) as any[]).filter((n) => {
      if (ehFixtureLinha({ nome: n.nome } as never)) return false;
      const c = n.case_id ? porCaso.get(n.case_id) : null;
      return !c || !ehFixtureLinha(c as never);
    });

    const paraComparar: NucleoParaComparar[] = nucleosReais.map((n) => ({
      id: n.id,
      nome: n.nome,
      dossie_mae: n.dossie_mae,
      contratante_nome: n.contratante_nome,
      dossie_status: n.dossie_status,
      status: n.status,
      archived_at: n.archived_at ?? null,
      created_at: n.created_at,
      updated_at: n.updated_at,
      case_id: n.case_id,
      caso: n.case_id ? (porCaso.get(n.case_id) ?? null) : null,
      leadsAtivos: leadsPorNucleo.get(n.id) ?? 0,
      membros: ((membros ?? []) as any[])
        .filter((m) => m.nucleo_id === n.id)
        .map((m) => ({
          id: m.id,
          nucleo_id: m.nucleo_id,
          nome: m.nome,
          papel: m.papel,
          archived_at: m.archived_at ?? null,
        })),
    }));

    return detectarDuplicidades(paraComparar);
  });

function paraCompararDoBanco(n: any, membros: any[], leadsAtivos: number): NucleoParaComparar {
  return {
    id: n.id,
    nome: n.nome,
    dossie_mae: n.dossie_mae ?? null,
    contratante_nome: n.contratante_nome ?? null,
    dossie_status: n.dossie_status ?? null,
    status: n.status ?? null,
    archived_at: n.archived_at ?? null,
    created_at: n.created_at,
    updated_at: n.updated_at,
    case_id: n.case_id ?? null,
    caso: null,
    leadsAtivos,
    membros: membros.map((m) => ({
      id: m.id,
      nucleo_id: m.nucleo_id,
      nome: m.nome,
      papel: m.papel,
      archived_at: m.archived_at ?? null,
    })),
  };
}

/**
 * Fases 2–6: comparação, plano, confirmação humana UNIFICAR, reapontamento,
 * arquivamento lógico do núcleo de origem e validação após refresh.
 *
 * Sem fusão automática, sem caso/núcleo novo, sem case_participants.
 * Grava archived_at / archive_motivo / archived_by / status arquivado.
 */
export const executarUnificacaoNucleo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { canonicoId: string; origemId: string; confirmacao: string }) => {
    if (!UUID.test(data?.canonicoId ?? "") || !UUID.test(data?.origemId ?? "")) {
      throw new Error("Identificadores de núcleo inválidos.");
    }
    exigirConfirmacaoUnificar(data.confirmacao ?? "");
    return {
      canonicoId: data.canonicoId,
      origemId: data.origemId,
      confirmacao: CONFIRMACAO_UNIFICAR,
    };
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as Sb;
    const userId = context.userId as string;
    const organizationId = await orgDoUsuario(supabase, userId);
    const agora = new Date().toISOString();

    if (data.canonicoId === data.origemId) {
      throw new Error("Canônico e origem são o mesmo núcleo.");
    }

    const { data: nucleos, error: erroNucleos } = await supabase
      .from("nucleos_familiares")
      .select("*")
      .in("id", [data.canonicoId, data.origemId])
      .eq("organization_id", organizationId);
    if (erroNucleos) throw new Error(erroNucleos.message);

    const canonico = ((nucleos ?? []) as any[]).find((n) => n.id === data.canonicoId);
    const origem = ((nucleos ?? []) as any[]).find((n) => n.id === data.origemId);
    if (!canonico || !origem) {
      throw new Error("Núcleo não encontrado nesta organização.");
    }

    const [{ data: membrosCanonicoTodos }, { data: membrosOrigemTodos }, { data: leadsOrigem }] =
      await Promise.all([
        supabase.from("nucleo_membros").select("id,nucleo_id,nome,papel,archived_at").eq("nucleo_id", data.canonicoId),
        supabase.from("nucleo_membros").select("id,nucleo_id,nome,papel,archived_at").eq("nucleo_id", data.origemId),
        supabase.from("leads").select("id,nucleo_id").eq("nucleo_id", data.origemId),
      ]);

    const membrosCanonico = (membrosCanonicoTodos ?? []) as any[];
    const membrosOrigem = (membrosOrigemTodos ?? []) as any[];
    const leads = (leadsOrigem ?? []) as any[];

    const plano = montarPlanoUnificacao(
      paraCompararDoBanco(canonico, membrosCanonico, 0),
      paraCompararDoBanco(origem, membrosOrigem, leads.length),
    );
    if (plano.recusado) {
      throw new Error(plano.motivoRecusa ?? "Unificação recusada.");
    }

    if (plano.caso.acao === "transferir" && plano.caso.caseIdFinal) {
      await gravarComVerificacao({
        supabase,
        tabela: "nucleos_familiares",
        id: data.canonicoId,
        organizationId,
        userId,
        payload: { case_id: plano.caso.caseIdFinal },
      });
    }

    for (const acao of plano.membros) {
      const membroId = acao.membroId;
      if (!membroId) {
        throw new Error(`Membro "${acao.nome}" sem identificador — unificação interrompida.`);
      }
      if (acao.acao === "arquivar_por_conflito") {
        await gravarComVerificacao({
          supabase,
          tabela: "nucleo_membros",
          id: membroId,
          organizationId,
          userId,
          payload: {
            archived_at: agora,
            archived_by: userId,
            archive_motivo: `Nome já existe no núcleo canônico "${canonico.nome}" (${canonico.id}).`,
          },
        });
      } else {
        await gravarComVerificacao({
          supabase,
          tabela: "nucleo_membros",
          id: membroId,
          organizationId,
          userId,
          payload: { nucleo_id: data.canonicoId },
        });
      }
    }

    for (const lead of leads) {
      await gravarComVerificacao({
        supabase,
        tabela: "leads",
        id: lead.id,
        organizationId,
        userId,
        payload: { nucleo_id: data.canonicoId },
      });
    }

    await gravarComVerificacao({
      supabase,
      tabela: "nucleos_familiares",
      id: data.origemId,
      organizationId,
      userId,
      payload: {
        archived_at: agora,
        archived_by: userId,
        archive_motivo: plano.arquivoOrigem.motivo,
        status: "arquivado",
      },
    });

    const [{ data: origemRelido }, { data: canonicoRelido }, { data: membrosRelidos }, { data: leadsRelidos }] =
      await Promise.all([
        supabase
          .from("nucleos_familiares")
          .select("id,status,archived_at,case_id")
          .eq("id", data.origemId)
          .eq("organization_id", organizationId)
          .maybeSingle(),
        supabase
          .from("nucleos_familiares")
          .select("id,status,archived_at,case_id")
          .eq("id", data.canonicoId)
          .eq("organization_id", organizationId)
          .maybeSingle(),
        supabase
          .from("nucleo_membros")
          .select("id,nucleo_id,nome,archived_at")
          .in("nucleo_id", [data.canonicoId, data.origemId]),
        supabase.from("leads").select("id,nucleo_id").in("nucleo_id", [data.canonicoId, data.origemId]),
      ]);

    if (!origemRelido || !canonicoRelido) {
      throw new Error("Falha ao reler os núcleos após a unificação.");
    }

    const checagem = validarPosMerge({
      canonicoId: data.canonicoId,
      origemId: data.origemId,
      caseIdEsperado: plano.caso.caseIdFinal,
      origem: origemRelido,
      canonico: canonicoRelido,
      membros: (membrosRelidos ?? []) as any[],
      leads: (leadsRelidos ?? []) as any[],
    });
    if (!checagem.ok) {
      throw new Error(`Validação pós-unificação falhou: ${checagem.falhas.join(" ")}`);
    }

    await auditarUnificacao(supabase, {
      org: organizationId,
      userId,
      acao: "unificar_nucleo",
      entidadeId: data.canonicoId,
      metadados: {
        origem_id: data.origemId,
        canonico_id: data.canonicoId,
        origem_nome: origem.nome,
        canonico_nome: canonico.nome,
        case_id_final: plano.caso.caseIdFinal,
        membros_movidos: plano.membros.filter((m) => m.acao === "mover").length,
        membros_arquivados_por_conflito: plano.membros.filter((m) => m.acao === "arquivar_por_conflito").length,
        leads_reapontados: leads.length,
        confirmacao: CONFIRMACAO_UNIFICAR,
      },
    });

    if (plano.caso.caseIdFinal) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: plano.caso.caseIdFinal,
        eventType: "caso",
        title: "Núcleos familiares unificados",
        summaryInternal: `Canônico "${canonico.nome}" absorveu "${origem.nome}" — ${plano.membros.filter((m) => m.acao === "mover").length} membro(s) movido(s), ${plano.membros.filter((m) => m.acao === "arquivar_por_conflito").length} arquivado(s) por conflito.`,
        sourceEntityType: "nucleos_familiares",
        sourceEntityId: data.canonicoId,
        userId,
      });
    }

    return {
      ok: true as const,
      canonicoId: data.canonicoId,
      origemId: data.origemId,
      caseIdFinal: plano.caso.caseIdFinal,
      validacao: checagem,
    };
  });
