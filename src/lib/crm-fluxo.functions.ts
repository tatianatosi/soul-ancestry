import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  EVENTO_PARA_ETAPA,
  PROXIMA_ACAO_PADRAO_ACEITE_VERBAL,
  eventoPermitido,
  sanitizarParaAuditoria,
  validarConfirmacaoFormal,
  validarOportunidade,
} from "@/lib/crm-fluxo";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { NOME_RESPONSAVEL_PADRAO } from "@/lib/responsavel-padrao";

/* eslint-disable @typescript-eslint/no-explicit-any */

const UUID = /^[0-9a-f-]{36}$/i;
const exigirUuid = (v: unknown, campo: string) => {
  if (!UUID.test(String(v ?? ""))) throw new Error(`${campo} inválido.`);
  return String(v);
};

async function orgDoUsuario(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}

/**
 * Abre o caso real de qualquer oportunidade na confirmação formal — não só a piloto.
 * Idempotente por opportunities.case_id. O código canônico nunca é escolhido aqui:
 * fica a cargo do gerador transacional já implantado (trigger fn_case_codigo_canonico
 * + gerar_case_id), a mesma trava que impede duas oportunidades formalizadas em
 * paralelo de colidirem no mesmo número de sequência.
 */
async function materializarCasoDaOportunidade(
  supabase: any,
  organizationId: string,
  userId: string,
  op: { id: string; contact_id: string; case_id: string | null; objetivo_declarado: string; pais_linha_prioritaria?: string | null; citizenship_track_id?: string | null; via_preliminar?: string | null; responsavel_nome?: string | null; resumo_interno?: string | null },
): Promise<string> {
  if (op.case_id) return op.case_id;

  const { data: contato } = await supabase.from("contacts").select("nome").eq("id", op.contact_id).maybeSingle();

  const { data: caso, error } = await supabase
    .from("crm_casos")
    .insert({
      organization_id: organizationId,
      titulo: `${contato?.nome ?? "Caso sem nome"} — ${op.objetivo_declarado}`,
      pais: op.pais_linha_prioritaria ?? null,
      via: op.via_preliminar || "a-definir",
      citizenship_track_id: op.citizenship_track_id ?? null,
      responsavel_principal: op.responsavel_nome || NOME_RESPONSAVEL_PADRAO,
      responsavel_id: userId,
      eixo_comercial: "confirmacao_formal_recebida",
      eixo_formalizacao: "formalizacao_em_preparacao",
      data_confirmacao_formal_proposta: new Date().toISOString().slice(0, 10),
      resumo_interno: op.resumo_interno ?? null,
      created_by: userId,
      updated_by: userId,
    })
    .select("id")
    .single();
  if (error) throw new Error(`Não foi possível abrir o caso a partir da oportunidade: ${error.message}`);

  await gravarComVerificacao({
    supabase,
    tabela: "opportunities",
    id: op.id,
    organizationId,
    userId,
    payload: { case_id: caso.id },
  });

  return caso.id as string;
}

async function registrarEvento(
  supabase: any,
  userId: string,
  organizationId: string,
  ev: {
    event_type: string;
    contact_id?: string | null;
    opportunity_id?: string | null;
    case_id?: string | null;
    evidencia_referencia?: string | null;
    observacao?: string | null;
  },
) {
  if (!eventoPermitido(ev.event_type)) throw new Error(`Evento comercial não permitido: ${ev.event_type}`);
  const { error } = await supabase.from("conversion_events").insert({
    organization_id: organizationId,
    event_type: ev.event_type,
    contact_id: ev.contact_id ?? null,
    opportunity_id: ev.opportunity_id ?? null,
    case_id: ev.case_id ?? null,
    occurred_at: new Date().toISOString(),
    responsavel_id: userId,
    evidencia_referencia: ev.evidencia_referencia ? sanitizarParaAuditoria(ev.evidencia_referencia) : null,
    observacao: sanitizarParaAuditoria(ev.observacao),
    created_by: userId,
  });
  if (error) throw new Error(error.message);
}

/** Leitura consolidada do fluxo comercial: contatos, oportunidades, interações, Discovery e eventos. */
export const painelCrmFluxo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const [contatos, oportunidades, interacoes, discovery, eventos] = await Promise.all([
      supabase
        .from("contacts")
        .select("id,nome,email,telefone,origem,origem_detalhe,responsavel_user_id,status,archived_at,created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("opportunities")
        .select(
          "id,contact_id,case_id,lead_id,objetivo_declarado,pais_linha_prioritaria,citizenship_track_id,via_preliminar,etapa_comercial,responsavel_user_id,responsavel_nome,proxima_acao,prazo_proxima_acao,resumo_interno,bloqueio_interno,archived_at,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("crm_interactions")
        .select(
          "id,contact_id,opportunity_id,case_id,tipo,canal,direcao,ocorrido_em,resumo_interno,proxima_acao,prazo_proxima_acao,origem_referencia_interna,consentimento_gravacao,corrige_interacao_id,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("discovery_assessments").select("*").order("created_at", { ascending: false }).limit(300),
      supabase
        .from("conversion_events")
        .select("id,event_type,contact_id,opportunity_id,case_id,occurred_at,responsavel_id,evidencia_referencia,observacao")
        .order("occurred_at", { ascending: false })
        .limit(500),
    ]);

    const erro = contatos.error ?? oportunidades.error ?? interacoes.error ?? discovery.error ?? eventos.error;
    if (erro) throw new Error(erro.message);

    const listaOps = (oportunidades.data ?? []) as any[];
    return {
      contatos: (contatos.data ?? []) as any[],
      oportunidades: listaOps.map((o) => ({ ...o, pendencias: validarOportunidade(o) })),
      interacoes: (interacoes.data ?? []) as any[],
      discovery: (discovery.data ?? []) as any[],
      eventos: (eventos.data ?? []) as any[],
    };
  });

/** Registra um contato. Sem inferência de dados ausentes. */
export const registrarContato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Record<string, unknown>) => {
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);
    const { data: row, error } = await supabase
      .from("contacts")
      .insert({
        organization_id,
        nome: String(data["nome"]).trim(),
        email: (data["email"] as string) || null,
        telefone: (data["telefone"] as string) || null,
        origem: (data["origem"] as string) || "nao_informada",
        origem_detalhe: (data["origem_detalhe"] as string) || null,
        responsavel_user_id: (data["responsavel_user_id"] as string) || userId,
        status: (data["status"] as string) || "novo",
        observacao_interna: sanitizarParaAuditoria(data["observacao_interna"] as string) || null,
        created_by: userId,
        updated_by: userId,
      })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    await registrarEvento(supabase, userId, organization_id, { event_type: "lead_criado", contact_id: row.id });
    return row;
  });

/** Cria ou atualiza oportunidade, exigindo responsável, próxima ação e prazo quando ativa. */
export const salvarOportunidade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string | null; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);

    let atual: any = null;
    if (data.id) {
      exigirUuid(data.id, "id");
      const { data: row } = await supabase.from("opportunities").select("*").eq("id", data.id).maybeSingle();
      if (!row) throw new Error("Oportunidade não encontrada nesta organização.");
      if (row.archived_at) throw new Error("Oportunidade arquivada: edição bloqueada.");
      atual = row;
    }

    const patch: Record<string, unknown> = {};
    for (const campo of [
      "contact_id",
      "case_id",
      "lead_id",
      "objetivo_declarado",
      "pais_linha_prioritaria",
      "citizenship_track_id",
      "via_preliminar",
      "etapa_comercial",
      "responsavel_user_id",
      "responsavel_nome",
      "proxima_acao",
      "prazo_proxima_acao",
      "resumo_interno",
      "bloqueio_interno",
    ]) {
      if (campo in (data.valores ?? {})) {
        const v = data.valores[campo];
        patch[campo] = typeof v === "string" && v.trim() === "" ? null : v;
      }
    }

    const candidato = { ...(atual ?? {}), ...patch };
    const pendencias = validarOportunidade(candidato);
    if (pendencias.length) return { ok: false as const, pendencias, oportunidade: atual };

    const etapaAnterior = atual?.etapa_comercial ?? null;
    let row: any;
    if (data.id) {
      const resultado = await gravarComVerificacao({
        supabase,
        tabela: "opportunities",
        id: data.id,
        organizationId: organization_id,
        userId,
        payload: patch,
      });
      row = resultado.registro;
    } else {
      const r = await supabase
        .from("opportunities")
        .insert({ ...patch, organization_id, created_by: userId, updated_by: userId })
        .select("*")
        .maybeSingle();
      if (r.error) throw new Error(r.error.message);
      row = r.data;
    }

    if (row && row.etapa_comercial !== etapaAnterior) {
      const evento = Object.entries(EVENTO_PARA_ETAPA).find(([, etapa]) => etapa === row.etapa_comercial)?.[0];
      if (evento && evento !== "aceite_verbal_confirmado" && evento !== "confirmacao_formal_recebida") {
        await registrarEvento(supabase, userId, organization_id, {
          event_type: evento,
          contact_id: row.contact_id,
          opportunity_id: row.id,
          case_id: row.case_id,
          observacao: `Etapa comercial: ${etapaAnterior ?? "—"} → ${row.etapa_comercial}`,
        });
      }
    }

    return { ok: true as const, pendencias: [], oportunidade: row };
  });

/** Registra interação imutável. Correção cria novo registro apontando para o anterior. */
export const registrarInteracao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Record<string, unknown>) => {
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);
    const { data: row, error } = await supabase
      .from("crm_interactions")
      .insert({
        organization_id,
        contact_id: (data["contact_id"] as string) || null,
        opportunity_id: (data["opportunity_id"] as string) || null,
        case_id: (data["case_id"] as string) || null,
        tipo: data["tipo"],
        canal: (data["canal"] as string) || (data["tipo"] as string),
        direcao: (data["direcao"] as string) || "internal",
        ocorrido_em: (data["ocorreu_em"] as string) || new Date().toISOString(),
        resumo_interno: sanitizarParaAuditoria(data["resumo_interno"] as string),
        origem_referencia_interna: (data["origem_referencia_interna"] as string) || null,
        consentimento_gravacao:
          data["consentimento_gravacao"] === undefined ? null : Boolean(data["consentimento_gravacao"]),
        proxima_acao: (data["proxima_acao"] as string) || null,
        prazo_proxima_acao: (data["prazo_proxima_acao"] as string) || null,
        corrige_interacao_id: (data["corrige_interacao_id"] as string) || null,
        registrado_por: userId,
        data_origin: "registro_interno",
      })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

/** Registra a triagem de Discovery vinculada à oportunidade. */
export const registrarDiscovery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Record<string, unknown>) => {
    exigirUuid(d?.["opportunity_id"], "opportunity_id");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);
    const campos = [
      "interaction_id",
      "opportunity_id",
      "objetivo_principal",
      "estrutura_familiar",
      "ascendente_ou_geracao_informada",
      "linha_transmissao",
      "estado_documental_inicial",
      "complexidade_percebida",
      "pais_linha_prioritaria",
      "via_preliminar",
      "sinal_aderencia_preliminar",
      "confianca_triagem",
      "riscos_internos",
      "notas_internas",
    ];
    const payload: Record<string, unknown> = { organization_id, created_by: userId };
    for (const c of campos) {
      const v = data[c];
      payload[c] = typeof v === "string" && v.trim() === "" ? null : (v ?? null);
    }
    const { data: row, error } = await supabase.from("discovery_assessments").insert(payload).select("*").maybeSingle();
    if (error) throw new Error(error.message);

    const { data: op } = await supabase
      .from("opportunities")
      .select("id,contact_id,case_id")
      .eq("id", data["opportunity_id"])
      .maybeSingle();
    await registrarEvento(supabase, userId, organization_id, {
      event_type: "discovery_realizada",
      contact_id: op?.contact_id ?? null,
      opportunity_id: op?.id ?? null,
      case_id: op?.case_id ?? null,
    });
    return row;
  });

/**
 * Aceite verbal: registra o evento e a próxima ação padrão.
 * Não cria cliente ativo e não libera contrato, cobrança, assinatura,
 * onboarding, pesquisa externa ou App Cliente.
 */
export const registrarAceiteVerbal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { opportunityId: string; observacao?: string }) => {
    exigirUuid(d?.opportunityId, "opportunityId");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);
    const { data: op } = await supabase.from("opportunities").select("*").eq("id", data.opportunityId).maybeSingle();
    if (!op) throw new Error("Oportunidade não encontrada.");

    const prazo = new Date();
    prazo.setDate(prazo.getDate() + 3);
    await gravarComVerificacao({
      supabase,
      tabela: "opportunities",
      id: op.id,
      organizationId: organization_id,
      userId,
      payload: {
        etapa_comercial: "aceite_verbal",
        proxima_acao: PROXIMA_ACAO_PADRAO_ACEITE_VERBAL,
        prazo_proxima_acao: prazo.toISOString().slice(0, 10),
      },
    });

    await registrarEvento(supabase, userId, organization_id, {
      event_type: "aceite_verbal_confirmado",
      contact_id: op.contact_id,
      opportunity_id: op.id,
      case_id: op.case_id,
      observacao: data.observacao,
    });
    await registrarEvento(supabase, userId, organization_id, {
      event_type: "confirmacao_formal_pendente",
      contact_id: op.contact_id,
      opportunity_id: op.id,
      case_id: op.case_id,
      observacao: PROXIMA_ACAO_PADRAO_ACEITE_VERBAL,
    });
    return {
      ok: true as const,
      liberado: [] as string[],
      nota: "Aceite verbal não cria cliente ativo, contrato, cobrança, assinatura, onboarding, pesquisa externa ou App Cliente.",
    };
  });

/** Confirmação formal: exige referência interna e libera apenas preparação interna de formalização. */
export const registrarConfirmacaoFormal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { opportunityId: string; referenciaInterna: string; observacao?: string }) => {
    exigirUuid(d?.opportunityId, "opportunityId");
    const v = validarConfirmacaoFormal(d?.referenciaInterna);
    if (!v.ok) throw new Error(v.erro!);
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);
    const { data: op } = await supabase.from("opportunities").select("*").eq("id", data.opportunityId).maybeSingle();
    if (!op) throw new Error("Oportunidade não encontrada.");

    const caseId = await materializarCasoDaOportunidade(supabase, organization_id, userId, op);

    const prazo = new Date();
    prazo.setDate(prazo.getDate() + 5);
    await gravarComVerificacao({
      supabase,
      tabela: "opportunities",
      id: op.id,
      organizationId: organization_id,
      userId,
      payload: {
        etapa_comercial: "formalizacao_em_preparacao",
        proxima_acao: "Preparar instrumentos internamente (sem contrato, cobrança ou assinatura)",
        prazo_proxima_acao: prazo.toISOString().slice(0, 10),
      },
    });

    await registrarEvento(supabase, userId, organization_id, {
      event_type: "confirmacao_formal_recebida",
      contact_id: op.contact_id,
      opportunity_id: op.id,
      case_id: caseId,
      evidencia_referencia: (data.referenciaInterna ?? "").trim() || "Sem referência informada.",
      observacao: data.observacao,
    });
    await registrarEvento(supabase, userId, organization_id, {
      event_type: "formalizacao_em_preparacao",
      contact_id: op.contact_id,
      opportunity_id: op.id,
      case_id: caseId,
      observacao: "Caso aberto internamente. Nenhum contrato, cobrança, assinatura ou onboarding foi criado.",
    });
    return {
      ok: true as const,
      caseId,
      liberado: ["preparacao_interna_formalizacao"],
      nota: "O caso foi aberto internamente; somente a preparação interna de formalização foi liberada.",
    };
  });

/** Arquivamento lógico da oportunidade, com motivo. Exclusão física é proibida. */
export const arquivarOportunidade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo: string }) => {
    exigirUuid(d?.id, "id");
    if (!d?.motivo?.trim()) throw new Error("Motivo do arquivamento é obrigatório.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);
    await gravarComVerificacao({
      supabase,
      tabela: "opportunities",
      id: data.id,
      organizationId: organization_id,
      userId,
      payload: {
        archived_at: new Date().toISOString(),
        archived_by: userId,
        archive_motivo: sanitizarParaAuditoria(data.motivo),
        etapa_comercial: "arquivada",
      },
    });
    return { ok: true as const };
  });
