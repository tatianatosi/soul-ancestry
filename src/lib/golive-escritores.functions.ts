/**
 * Escritores da superfície de go-live.
 *
 * Cada função aqui grava de verdade, no caso canônico, com a RLS da
 * organização valendo. Regras fixas:
 * - nada é apagado: despublicar arquiva, não remove;
 * - nenhuma tabela nova: só entidades canônicas já existentes;
 * - nenhuma cobrança, assinatura, WhatsApp ou e-mail sai daqui sozinho;
 * - pessoa nunca é fundida automaticamente: e-mail igual reaproveita,
 *   telefone igual devolve "confirmar", nome sozinho cria nova.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { CODIGO_CASO_GO_LIVE } from "@/lib/golive.functions";
import { etapaDoResultado, passoDeEtapa } from "@/lib/golive-comercial";


/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

async function contexto(supabase: any, userId: string) {
  const membro = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  const organizationId = membro.data?.organization_id as string | undefined;
  if (!organizationId) throw new Error("Usuário sem organização ativa.");

  const { data: caso } = await supabase
    .from("crm_casos")
    .select("id, cliente_id, codigo")
    .eq("organization_id", organizationId)
    .eq("codigo", CODIGO_CASO_GO_LIVE)
    .is("archived_at", null)
    .maybeSingle();
  if (!caso) throw new Error("Caso canônico do piloto não encontrado nesta organização.");

  return { organizationId, casoId: String(caso.id), clienteId: caso.cliente_id as string | null, userId };
}

function erro(r: { error: { message: string } | null }) {
  if (r.error) throw new Error(r.error.message);
}

const texto = (v: unknown) => String(v ?? "").trim();

/* ------------------------------------------------------------------ *
 * 1. Lead, Discovery e Call
 * ------------------------------------------------------------------ */

/**
 * Entrada real de lead no Comercial.
 *
 * O lead nasce sem caso vinculado: o vínculo com o caso é o handoff, que
 * acontece depois. Por isso o cartão aparece na coluna Lead do funil, no
 * kanban da etapa escolhida e na Mesa de Discovery.
 */
export const registrarLeadGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      nome: string;
      email?: string;
      telefone?: string;
      origem?: string;
      objetivo?: string;
      etapa?: string;
      area?: string;
      responsavel?: string;
      proximoPasso?: string;
      proximoPassoEm?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, userId } = await contexto(s, context.userId as string);
    const nome = texto(data.nome);
    if (!nome) throw new Error("Nome é obrigatório.");
    if (nome.length > 160) throw new Error("Nome muito longo.");
    if (!texto(data.origem)) throw new Error("Origem é obrigatória.");
    if (!texto(data.responsavel)) throw new Error("Responsável é obrigatório.");
    if (!texto(data.proximoPasso)) throw new Error("Próximo passo é obrigatório.");
    // Regra do banco para lead ativo: área responsável e data da próxima ação.
    if (!texto(data.area)) throw new Error("Área responsável é obrigatória.");
    if (!texto(data.proximoPassoEm)) throw new Error("Data do próximo passo é obrigatória.");

    const r = await s
      .from("leads")
      .insert({
        organization_id: organizationId,
        nome,
        email: texto(data.email) || null,
        telefone: texto(data.telefone) || null,
        origem: texto(data.origem),
        objetivo: texto(data.objetivo) || null,
        estagio: texto(data.etapa) || "novo",
        eixo_comercial: texto(data.etapa) || null,
        area_responsavel: texto(data.area),
        responsavel_nome: texto(data.responsavel),
        proxima_acao: texto(data.proximoPasso),
        proxima_acao_em: texto(data.proximoPassoEm),

        data_origin: "real",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

export const registrarDiscoveryGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadId: string; resultado: string; resumo: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.resumo)) throw new Error("Resumo do discovery é obrigatório.");

    erro(
      await s
        .from("leads")
        .update({
          discovery_resultado: texto(data.resultado) || null,
          estagio: "qualificado",
          updated_by: userId,
        })
        .eq("id", data.leadId)
        .eq("organization_id", organizationId),
    );

    erro(
      await s.from("crm_interactions").insert({
        organization_id: organizationId,
        case_id: casoId,
        tipo: "reuniao",
        canal: "interno",
        direcao: "saida",
        resumo_interno: texto(data.resumo),
        ocorrido_em: new Date().toISOString(),
        registrado_por: userId,
        data_origin: "real",
        visibilidade: "interna",
      }),
    );
    return { ok: true };
  });

export const registrarCallGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadId: string; resumo: string; ocorridoEm?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.resumo)) throw new Error("Resumo da call é obrigatório.");
    const quando = texto(data.ocorridoEm) || new Date().toISOString();

    erro(
      await s
        .from("leads")
        .update({ call_realizada_em: quando, resumo_call: texto(data.resumo), updated_by: userId })
        .eq("id", data.leadId)
        .eq("organization_id", organizationId),
    );

    erro(
      await s.from("crm_interactions").insert({
        organization_id: organizationId,
        case_id: casoId,
        tipo: "call",
        canal: "video",
        direcao: "saida",
        resumo_interno: texto(data.resumo),
        ocorrido_em: quando,
        registrado_por: userId,
        data_origin: "real",
        visibilidade: "interna",
      }),
    );
    return { ok: true };
  });

/**
 * Atendimento do lead: Discovery e call em um registro só.
 *
 * Grava no próprio lead (situação e data da call, resultado do Discovery,
 * próxima ação com prazo e responsável) e deixa o histórico interno em
 * `crm_interactions`. Não cria tabela, não move o lead sozinho para etapa
 * fora da lista do banco e não envia nada para fora.
 */
export const registrarAtendimentoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      leadId: string;
      situacaoCall: string;
      callEm?: string;
      resultado?: string;
      resumo: string;
      proximoPasso: string;
      proximoPassoEm?: string;
      responsavel?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.leadId)) throw new Error("Lead é obrigatório.");
    if (!texto(data.situacaoCall)) throw new Error("Situação da call é obrigatória.");
    if (!texto(data.resumo)) throw new Error("Resumo interno é obrigatório.");
    if (!texto(data.proximoPasso)) throw new Error("Próxima ação é obrigatória.");

    const situacao = texto(data.situacaoCall);
    const quando = texto(data.callEm) || null;
    const resultado = texto(data.resultado) || null;
    const atualLead = await s
      .from("leads")
      .select("estagio")
      .eq("id", texto(data.leadId))
      .eq("organization_id", organizationId)
      .maybeSingle();
    erro(atualLead);
    // Respeita a máquina de estados do banco: só grava um passo válido por vez.
    const etapa = passoDeEtapa(atualLead?.data?.estagio, etapaDoResultado(resultado));

    const atualizacao: Linha = {
      status_call: situacao,
      resumo_call: texto(data.resumo),
      proxima_acao: texto(data.proximoPasso),
      proxima_acao_em: texto(data.proximoPassoEm) || null,
      updated_by: userId,
    };
    if (resultado) atualizacao["discovery_resultado"] = resultado;
    if (etapa) atualizacao["estagio"] = etapa;
    if (texto(data.responsavel)) atualizacao["responsavel_nome"] = texto(data.responsavel);
    if (situacao === "realizada") {
      // Regra do banco: call realizada exige resumo validado, resultado e prazo.
      if (!resultado) throw new Error("Call realizada exige o resultado do Discovery.");
      if (!texto(data.proximoPassoEm)) throw new Error("Call realizada exige prazo da próxima ação.");
      atualizacao["resumo_validado"] = true;
      atualizacao["call_realizada_em"] = quando ?? new Date().toISOString();
    }
    else if (quando) atualizacao["call_agendada_em"] = quando;

    erro(
      await s.from("leads").update(atualizacao).eq("id", texto(data.leadId)).eq("organization_id", organizationId),
    );

    erro(
      await s.from("crm_interactions").insert({
        organization_id: organizationId,
        case_id: casoId,
        tipo: situacao === "realizada" ? "call" : "reuniao",
        canal: "interno",
        direcao: "saida",
        resumo_interno: texto(data.resumo),
        ocorrido_em: quando ?? new Date().toISOString(),
        registrado_por: userId,
        data_origin: "real",
        visibilidade: "interna",
      }),
    );
    return { ok: true };
  });



/**
 * Arquivamento lógico do lead.
 *
 * Nada é apagado: o lead recebe etapa `arquivado`, motivo, autor e data.
 * Sai das listas de trabalho (funil, kanban e mesa) e continua consultável
 * no histórico. Exige motivo escrito.
 */
export const arquivarLeadGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadId: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.leadId)) throw new Error("Lead é obrigatório.");
    if (!texto(data.motivo)) throw new Error("Motivo do arquivamento é obrigatório.");

    const atual = await s
      .from("leads")
      .select("id, estagio, archived_at")
      .eq("id", texto(data.leadId))
      .eq("organization_id", organizationId)
      .maybeSingle();
    erro(atual);
    if (!atual?.data) throw new Error("Lead não encontrado nesta organização.");
    if (atual.data.archived_at) throw new Error("Lead já está arquivado.");

    // Respeita a máquina de estados: um passo por vez até `arquivado`.
    const etapa = passoDeEtapa(atual.data.estagio, "arquivado") ?? "arquivado";
    const agora = new Date().toISOString();
    erro(
      await s
        .from("leads")
        .update({
          estagio: etapa,
          archive_motivo: texto(data.motivo),
          archived_at: agora,
          archived_by: userId,
          updated_by: userId,
        })
        .eq("id", texto(data.leadId))
        .eq("organization_id", organizationId),
    );
    return { ok: true, etapa, arquivadoEm: agora };
  });

/* ------------------------------------------------------------------ *
 * 2. Proposta (Canva registrada à mão) e escopo
 * ------------------------------------------------------------------ */

export const registrarPropostaCanva = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      link: string;
      versao?: number;
      data?: string;
      escopo: string;
      partes?: string;
      entregas?: string;
      condicao?: string;
      valor?: number;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, clienteId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.link)) throw new Error("Link da proposta é obrigatório.");
    if (!texto(data.escopo)) throw new Error("Escopo da proposta é obrigatório.");

    const r = await s
      .from("proposals")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        client_id: clienteId,
        versao: data.versao && data.versao > 0 ? data.versao : 1,
        status: "enviada",
        escopo: texto(data.escopo),
        valor: typeof data.valor === "number" ? data.valor : null,
        moeda: "BRL",
        forma_pagamento: texto(data.condicao) || null,
        enviada_em: texto(data.data) || new Date().toISOString(),
        origem: "canva",
        origem_referencia: texto(data.link),
        deck_referencia_interna: texto(data.link),
        observacoes_internas:
          [texto(data.partes) && `Partes: ${texto(data.partes)}`, texto(data.entregas) && `Entregas: ${texto(data.entregas)}`]
            .filter(Boolean)
            .join("\n") || null,
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

export const adicionarItemEscopoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { titulo: string; categoria?: string; contratoId?: string; propostaId?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.titulo)) throw new Error("Título do item de escopo é obrigatório.");

    let contratoId = texto(data.contratoId);
    if (!contratoId) {
      const c = await s
        .from("contracts")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("case_id", casoId)
        .is("archived_at", null)
        .limit(1);
      contratoId = c.data?.[0]?.id ? String(c.data[0].id) : "";
    }
    if (!contratoId) throw new Error("Registre o contrato antes de lançar itens de escopo.");

    const r = await s
      .from("contract_scope_items")
      .insert({
        organization_id: organizationId,
        contract_id: contratoId,
        proposal_id: texto(data.propostaId) || null,
        category: texto(data.categoria) || "contracted_scope",
        title: texto(data.titulo),
        status: "included",
        source_type: texto(data.propostaId) ? "proposal" : "manual_review",
        requires_human_validation: true,
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

/**
 * Aprovação do escopo apresentado na proposta.
 *
 * Só aprova o que já tem referência e versão do Canva registradas à mão.
 * Não assina nada, não cria contrato, não gera cobrança.
 */
export const aprovarEscopoPropostaGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { propostaId: string; observacao?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    const propostaId = texto(data.propostaId);
    if (!propostaId) throw new Error("Escolha a proposta que teve o escopo aprovado.");

    const atual = await s
      .from("proposals")
      .select("id, status, versao, origem_referencia, deck_referencia_interna, escopo, archived_at, observacoes_internas")
      .eq("id", propostaId)
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .maybeSingle();
    erro(atual);
    const p = atual.data;
    if (!p) throw new Error("Proposta não encontrada neste caso.");
    if (p.archived_at) throw new Error("Proposta arquivada não pode ser aprovada.");
    if (p.status === "aprovada") throw new Error("Esta proposta já está aprovada.");
    if (!texto(p.origem_referencia) && !texto(p.deck_referencia_interna))
      throw new Error("Registre o link/referência do Canva antes de aprovar o escopo.");
    if (!(Number(p.versao) > 0)) throw new Error("Registre a versão do Canva antes de aprovar o escopo.");
    if (!texto(p.escopo)) throw new Error("A proposta precisa do escopo apresentado antes da aprovação.");

    const nota = texto(data.observacao);
    const r = await s
      .from("proposals")
      .update({
        status: "aprovada",
        aprovada_em: new Date().toISOString(),
        observacoes_internas:
          [texto(p.observacoes_internas), nota && `Escopo aprovado: ${nota}`].filter(Boolean).join("\n") || null,
        updated_by: userId,
      })
      .eq("id", propostaId)
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .select("id, versao, status, aprovada_em")
      .single();
    erro(r);
    return {
      id: String(r.data.id),
      versao: (r.data.versao as number) ?? null,
      status: String(r.data.status ?? ""),
      aprovadaEm: (r.data.aprovada_em as string) ?? null,
    };
  });

/** Contrato entra em revisão humana. Não envia, não assina, não cobra. */
export const enviarContratoParaRevisaoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { contratoId: string; observacao?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    const contratoId = texto(data.contratoId);
    if (!contratoId) throw new Error("Escolha o contrato que vai para revisão.");

    const atual = await s
      .from("contracts")
      .select("id, status, archived_at")
      .eq("id", contratoId)
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .maybeSingle();
    erro(atual);
    const c = atual.data;
    if (!c) throw new Error("Contrato não encontrado neste caso.");
    if (c.archived_at) throw new Error("Contrato arquivado não pode ir para revisão.");
    if (c.status === "signed") throw new Error("Contrato já assinado não volta para revisão por aqui.");

    const aprovada = await s
      .from("proposals")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .eq("status", "aprovada")
      .is("archived_at", null)
      .limit(1);
    if (!(aprovada.data ?? []).length)
      throw new Error("Aprove o escopo da proposta antes de mandar o contrato para revisão.");

    const r = await s
      .from("contracts")
      .update({
        status: "under_human_review",
        internal_notes: texto(data.observacao) || null,
        updated_by: userId,
      })
      .eq("id", contratoId)
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .select("id, status")
      .single();
    erro(r);
    return { id: String(r.data.id), status: String(r.data.status ?? "") };
  });

/**
 * Assinatura registrada só quando existe ato formal.
 *
 * Exige referência do ato (protocolo, documento assinado, ata) e data.
 * Nada é enviado a provedor externo daqui.
 */
export const registrarAssinaturaContratoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { contratoId: string; referencia: string; assinadoEm: string; forma?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    const contratoId = texto(data.contratoId);
    if (!contratoId) throw new Error("Escolha o contrato assinado.");
    if (!texto(data.referencia)) throw new Error("Informe a referência do ato formal de assinatura.");
    if (!texto(data.assinadoEm)) throw new Error("Informe a data da assinatura.");

    const atual = await s
      .from("contracts")
      .select("id, status, archived_at")
      .eq("id", contratoId)
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .maybeSingle();
    erro(atual);
    const c = atual.data;
    if (!c) throw new Error("Contrato não encontrado neste caso.");
    if (c.archived_at) throw new Error("Contrato arquivado não pode ser assinado.");
    if (c.status === "signed") throw new Error("Este contrato já está assinado.");
    if (!["under_human_review", "approved_for_send", "sent"].includes(String(c.status)))
      throw new Error("Passe o contrato por revisão humana antes de registrar a assinatura.");

    const r = await s
      .from("contracts")
      .update({
        status: "signed",
        signed_at: texto(data.assinadoEm),
        signature_reference: texto(data.referencia),
        signed_source: texto(data.forma) || "ato_formal_manual",
        updated_by: userId,
      })
      .eq("id", contratoId)
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .select("id, status, signed_at, signature_reference")
      .single();
    erro(r);
    return {
      id: String(r.data.id),
      status: String(r.data.status ?? ""),
      assinadoEm: (r.data.signed_at as string) ?? null,
      referencia: (r.data.signature_reference as string) ?? null,
    };
  });

/* ------------------------------------------------------------------ *
 * 3. Pessoa canônica
 * ------------------------------------------------------------------ */

export const resolverPessoaGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { nome: string; email?: string; telefone?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId } = await contexto(s, context.userId as string);
    const email = texto(data.email).toLowerCase();
    const telefone = texto(data.telefone).replace(/\D/g, "");

    if (email) {
      const r = await s
        .from("clientes")
        .select("id, nome, email")
        .eq("organization_id", organizationId)
        .ilike("email", email)
        .is("archived_at", null)
        .limit(1);
      const achado = (r.data ?? [])[0];
      if (achado) {
        return { acao: "reutilizar" as const, pessoa: { id: String(achado.id), nome: String(achado.nome ?? "") } };
      }
    }

    if (telefone) {
      const r = await s
        .from("clientes")
        .select("id, nome, telefone")
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .limit(200);
      const achado = ((r.data ?? []) as Linha[]).find(
        (c) => String(c["telefone"] ?? "").replace(/\D/g, "") === telefone,
      );
      if (achado) {
        return {
          acao: "confirmar" as const,
          pessoa: { id: String(achado["id"]), nome: String(achado["nome"] ?? "") },
          motivo: "Telefone igual a uma pessoa já cadastrada. Confirme antes de seguir — nada é fundido sozinho.",
        };
      }
    }

    return { acao: "nova" as const, pessoa: null };
  });

export const registrarMembroNucleoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { nome: string; papel: "contratante_signatario" | "dependente"; base: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.nome)) throw new Error("Nome é obrigatório.");
    if (!texto(data.base))
      throw new Error("Relação familiar exige evidência ou decisão humana registrada.");

    const n = await s
      .from("nucleos_familiares")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .is("archived_at", null)
      .limit(1);
    const nucleoId = n.data?.[0]?.id ? String(n.data[0].id) : null;
    if (!nucleoId) throw new Error("Núcleo familiar do caso ainda não existe.");

    const r = await s
      .from("nucleo_membros")
      .insert({
        organization_id: organizationId,
        nucleo_id: nucleoId,
        nome: texto(data.nome),
        papel: data.papel,
        vinculo: texto(data.base),
        status_cadastral: "pendente",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

/* ------------------------------------------------------------------ *
 * 4. Ordem de serviço e onboarding
 * ------------------------------------------------------------------ */

export const registrarOrdemServicoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { numero: string; resumo: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.numero)) throw new Error("Número da OS é obrigatório.");

    const c = await s
      .from("contracts")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .is("archived_at", null)
      .limit(1);
    const contratoId = c.data?.[0]?.id ? String(c.data[0].id) : null;
    if (!contratoId) throw new Error("Registre o contrato antes da ordem de serviço.");

    const r = await s
      .from("service_orders")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        contract_id: contratoId,
        service_order_number: texto(data.numero),
        status: "draft",
        start_condition_status: "pending",
        scope_summary: texto(data.resumo) || null,
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

/** Plano de onboarding D0–D14, com marcos declarados e revisão humana pendente. */
export const criarPlanoOnboardingGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { proximaAcao?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);

    const existente = await s
      .from("case_plans")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .is("archived_at", null)
      .limit(1);
    if (existente.data?.[0]) return { id: String(existente.data[0].id), criado: false };

    const emDias = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

    const r = await s
      .from("case_plans")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        fase_jornada: "onboarding",
        marco_atual: "D0 — boas-vindas e alinhamento",
        marcos: [
          "D0 — boas-vindas e alinhamento",
          "D3 — coleta de documentos do titular",
          "D7 — mapa familiar confirmado",
          "D14 — primeira microentrega de pesquisa",
        ],
        proxima_acao: texto(data.proximaAcao) || "Confirmar documentos do titular",
        prazo_proxima_acao: emDias(3),
        status: "ativo",
        revisao_humana: "pendente",
        responsavel_user_id: userId,
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id), criado: true };
  });

/* ------------------------------------------------------------------ *
 * 5. Pesquisa: fonte, evidência, achado
 * ------------------------------------------------------------------ */

async function pesquisaDoCaso(s: any, organizationId: string, casoId: string) {
  const r = await s
    .from("research_cases")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("case_id", casoId)
    .is("archived_at", null)
    .limit(1);
  const id = r.data?.[0]?.id ? String(r.data[0].id) : null;
  if (!id) throw new Error("Este caso ainda não tem pesquisa aberta.");
  return id;
}

/** De-para dos rótulos do formulário para o vocabulário aceito pelo banco. */
const TIPO_FONTE: Record<string, string> = {
  registro_civil: "civil_record",
  civil_record: "civil_record",
  registro_religioso: "religious_record",
  religious_record: "religious_record",
  arquivo_publico: "public_archive",
  public_archive: "public_archive",
  documento_familiar: "family_document",
  family_document: "family_document",
  entrevista: "interview",
  interview: "interview",
  outro: "other",
  other: "other",
};

const TIPO_EVIDENCIA: Record<string, string> = {
  documento: "document",
  document: "document",
  registro: "registry_entry",
  registry_entry: "registry_entry",
  foto: "photo",
  photo: "photo",
  trecho: "record_excerpt",
  record_excerpt: "record_excerpt",
  referencia_arquivo: "archive_reference",
  archive_reference: "archive_reference",
  outro: "other",
  other: "other",
};

const TIPO_ACHADO: Record<string, string> = {
  vinculo_familiar: "estrutura_familiar",
  estrutura_familiar: "estrutura_familiar",
  registro_civil: "registro_civil",
  registro_religioso: "registro_religioso",
  migracao: "migracao",
  linha_do_tempo: "linha_do_tempo",
  hipotese: "hipotese_pesquisa",
  hipotese_pesquisa: "hipotese_pesquisa",
  outro: "outro",
};

export const registrarFonteGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { titulo: string; instituicao?: string; tipo?: string; url?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.titulo)) throw new Error("Título da fonte é obrigatório.");
    const pesquisaId = await pesquisaDoCaso(s, organizationId, casoId);

    const r = await s
      .from("research_sources")
      .insert({
        organization_id: organizationId,
        research_case_id: pesquisaId,
        title: texto(data.titulo),
        repository_or_institution: texto(data.instituicao) || null,
        source_type: TIPO_FONTE[texto(data.tipo)] ?? "civil_record",
        url: texto(data.url) || null,
        source_status: "referenced",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

export const registrarEvidenciaGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { titulo: string; tipo?: string; fonteId?: string; descricao?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.titulo)) throw new Error("Título da evidência é obrigatório.");
    const pesquisaId = await pesquisaDoCaso(s, organizationId, casoId);

    const r = await s
      .from("research_evidence_items")
      .insert({
        organization_id: organizationId,
        research_case_id: pesquisaId,
        title: texto(data.titulo),
        evidence_type: TIPO_EVIDENCIA[texto(data.tipo)] ?? "document",
        description: texto(data.descricao) || null,
        source_id: texto(data.fonteId) || null,
        evidence_status: "collected",
        client_visibility: "never",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

export const registrarAchadoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { titulo: string; tipo?: string; resumo?: string; evidenciaId?: string; fonteId?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.titulo)) throw new Error("Título do achado é obrigatório.");
    if (!texto(data.evidenciaId) && !texto(data.fonteId))
      throw new Error("Escolha a evidência ou a fonte que sustenta o achado.");

    const r = await s
      .from("genealogical_findings")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        title: texto(data.titulo),
        finding_type: TIPO_ACHADO[texto(data.tipo)] ?? "estrutura_familiar",
        internal_summary: texto(data.resumo) || null,
        evidence_links: texto(data.evidenciaId) ? [texto(data.evidenciaId)] : [],
        source_links: texto(data.fonteId) ? [texto(data.fonteId)] : [],
        validation_status: "em_revisao",
        eligible_for_client_deliverable: false,
        responsible_user_id: userId,
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

/**
 * Aprovação interna do achado — escrita real, sem publicar nada para a família.
 *
 * Grava `validation_status = validado_internamente` e o impacto declarado na
 * árvore ("proposto" ou "aplicado"). Não mexe em elegibilidade de entrega, não
 * cria projeção, não publica e não envia nada. Hipótese de pesquisa continua
 * bloqueada pela regra do banco.
 */
export const aprovarAchadoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { achadoId: string; impactoArvore?: string; observacao?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    const achadoId = texto(data.achadoId);
    if (!achadoId) throw new Error("Escolha o achado que será aprovado.");

    const impacto = texto(data.impactoArvore) || "proposto";
    if (!["nenhum", "proposto", "aplicado"].includes(impacto))
      throw new Error("Impacto na árvore inválido.");

    const atual = await s
      .from("genealogical_findings")
      .select("id, title, finding_type, validation_status, internal_notes, archived_at")
      .eq("id", achadoId)
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .maybeSingle();
    erro(atual);
    const achado = atual.data;
    if (!achado) throw new Error("Achado não encontrado neste caso.");
    if (achado.archived_at) throw new Error("Achado arquivado não pode ser aprovado.");
    if (achado.finding_type === "hipotese_pesquisa")
      throw new Error("Hipótese de pesquisa não pode ser validada; converta o tipo quando houver documento.");

    const nota = texto(data.observacao);
    const historico = [texto(achado.internal_notes as string), nota].filter(Boolean).join("\n");

    const r = await s
      .from("genealogical_findings")
      .update({
        validation_status: "validado_internamente",
        tree_impact: impacto,
        responsible_user_id: userId,
        internal_notes: historico || null,
      })
      .eq("id", achadoId)
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .select("id, title, validation_status, tree_impact, validated_at")
      .single();
    erro(r);
    return {
      id: String(r.data.id),
      titulo: String(r.data.title ?? ""),
      validacao: String(r.data.validation_status ?? ""),
      impactoArvore: String(r.data.tree_impact ?? "nenhum"),
      validadoEm: (r.data.validated_at as string) ?? null,
    };
  });

/* ------------------------------------------------------------------ *
 * 6. Financeiro manual
 * ------------------------------------------------------------------ */

export const registrarFaturaGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { numero: string; valor: number; vencimento?: string; descricao?: string; autorizacao?: string }) => d,
  )
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, clienteId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.numero)) throw new Error("Número da fatura é obrigatório.");
    if (!(Number(data.valor) > 0)) throw new Error("Informe um valor maior que zero.");
    if (!texto(data.autorizacao))
      throw new Error("A fatura só é registrada com a autorização declarada (quem autorizou e quando).");

    const assinado = await s
      .from("contracts")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .eq("status", "signed")
      .is("archived_at", null)
      .limit(1);
    if (!(assinado.data ?? []).length)
      throw new Error("Registre a assinatura do contrato antes de emitir fatura deste caso.");

    const r = await s
      .from("invoices")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        client_id: clienteId,
        numero: texto(data.numero),
        valor: Number(data.valor),
        moeda: "BRL",
        vencimento: texto(data.vencimento) || null,
        descricao:
          [texto(data.descricao), `Autorização: ${texto(data.autorizacao)}`].filter(Boolean).join(" · ") || null,
        status: "emitida",
        emitida_em: new Date().toISOString(),
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

export const registrarPagamentoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { faturaId: string; valor: number; metodo?: string; pagoEm?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, userId } = await contexto(s, context.userId as string);
    if (!(Number(data.valor) > 0)) throw new Error("Informe um valor maior que zero.");
    const quando = texto(data.pagoEm) || new Date().toISOString();

    const r = await s
      .from("payments")
      .insert({
        organization_id: organizationId,
        invoice_id: data.faturaId,
        valor: Number(data.valor),
        moeda: "BRL",
        metodo: texto(data.metodo) || "manual",
        pago_em: quando,
        status: "confirmado",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);

    erro(
      await s
        .from("invoices")
        .update({ status: "paga", valor_pago: Number(data.valor), paga_em: quando, updated_by: userId })
        .eq("id", data.faturaId)
        .eq("organization_id", organizationId),
    );
    return { id: String(r.data.id) };
  });

/* ------------------------------------------------------------------ *
 * 7. Microentrega, revisão e publicação
 * ------------------------------------------------------------------ */

export const criarMicroentregaGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { titulo: string; fase?: string; prazo?: string; descricao?: string; criterio?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.titulo)) throw new Error("Título da microentrega é obrigatório.");
    if (!texto(data.criterio)) throw new Error("Escreva o critério de aceite da microentrega.");

    const r = await s
      .from("ops_microentregas")
      .insert({
        organization_id: organizationId,
        caso_id: casoId,
        titulo: texto(data.titulo),
        descricao: texto(data.descricao) || null,
        fase: texto(data.fase) || "pesquisa_inicial",
        criterio_aceite: texto(data.criterio) || null,
        prazo: texto(data.prazo) || null,
        status: "pendente",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

export const aprovarMicroentregaGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; evidencia?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, userId } = await contexto(s, context.userId as string);

    erro(
      await s
        .from("ops_microentregas")
        .update({
          status: "concluida",
          concluida_em: new Date().toISOString(),
          concluida_por: userId,
          evidencia_descricao: texto(data.evidencia) || null,
          justificativa_sem_evidencia: texto(data.evidencia) ? null : "Revisão humana registrada no shell de go-live.",
          updated_by: userId,
        })
        .eq("id", data.id)
        .eq("organization_id", organizationId),
    );
    return { ok: true };
  });

/** Publica um conteúdo já sanitizado no App do cliente, com autor e data. */
export const publicarNoAppGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { microentregaId: string; resumoSanitizado: string; tipo?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.resumoSanitizado)) throw new Error("Escreva o texto que o cliente vai ler.");

    const agora = new Date().toISOString();
    const r = await s
      .from("app_projections")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        source_entity_type: "milestone",
        source_entity_id: data.microentregaId,
        projection_type: texto(data.tipo) || "microentrega",
        destination: "app",
        content_sanitized: texto(data.resumoSanitizado),
        approval_status: "published",
        approved_by: userId,
        approved_at: agora,
        effective_from: agora,
        visibility_scope: "titular",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id) };
  });

/**
 * Publica no App o cartão do contrato ou da proposta: só título, número e
 * situação. O texto é montado a partir do registro gravado, nunca digitado à
 * mão, e nenhum valor interno, cláusula ou preço técnico entra na projeção.
 */
const SITUACAO_HUMANA: Record<string, string> = {
  draft: "Em preparação",
  rascunho: "Em preparação",
  pending_data: "Aguardando dados",
  pending_signature: "Aguardando assinatura",
  aguardando_assinatura: "Aguardando assinatura",
  active: "Ativo",
  signed: "Assinado",
  aprovada: "Aprovada",
  em_analise: "Em análise",
};

/** Traduz a situação gravada para uma frase legível pela família. */
function situacaoHumana(valor: unknown): string {
  const chave = texto(valor);
  if (!chave) return "Em preparação";
  return SITUACAO_HUMANA[chave] ?? chave.replace(/_/g, " ");
}

export const publicarInstrumentoNoAppGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tipo: "contrato" | "proposta"; id: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    const id = texto(data.id);
    if (!id) throw new Error("Escolha o contrato ou a proposta que será publicada.");
    if (data.tipo !== "contrato" && data.tipo !== "proposta") throw new Error("Tipo inválido.");

    let titulo = "";
    let numero = "";
    let situacao = "";
    /* Prazo e condição de parcelas só entram quando já estão gravados no
       próprio instrumento. Nada é estimado, calculado ou completado aqui. */
    let prazo = "";
    let parcelas = "";

    const diaBR = (v: unknown) => {
      const t = texto(v);
      if (!t) return "";
      const d = new Date(t.length <= 10 ? `${t}T00:00:00` : t);
      return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
    };

    if (data.tipo === "contrato") {
      const r = await s
        .from("contracts")
        .select("id, title, contract_number, status, signed_at, effective_start_date, effective_end_date, proposal_id")
        .eq("id", id)
        .eq("organization_id", organizationId)
        .eq("case_id", casoId)
        .maybeSingle();
      erro(r);
      if (!r.data) throw new Error("Contrato não encontrado neste caso.");
      titulo = String(r.data.title ?? "Contrato");
      numero = String(r.data.contract_number ?? "");
      situacao = r.data.signed_at ? "Assinado" : situacaoHumana(r.data.status);
      const inicio = diaBR(r.data.effective_start_date);
      const fim = diaBR(r.data.effective_end_date);
      if (inicio) prazo = fim ? `Vigência de ${inicio} a ${fim}` : `Vigência a partir de ${inicio}`;
      /* Condição de parcelas: a combinada na proposta vinculada ao contrato. */
      if (r.data.proposal_id) {
        const p = await s
          .from("proposals")
          .select("forma_pagamento")
          .eq("id", r.data.proposal_id)
          .eq("organization_id", organizationId)
          .maybeSingle();
        erro(p);
        parcelas = texto(p.data?.forma_pagamento) ? `Parcelas: ${texto(p.data.forma_pagamento)}` : "";
      }
    } else {
      const r = await s
        .from("proposals")
        .select("id, versao, status, aprovada_em, validade, forma_pagamento")
        .eq("id", id)
        .eq("organization_id", organizationId)
        .eq("case_id", casoId)
        .maybeSingle();
      erro(r);
      if (!r.data) throw new Error("Proposta não encontrada neste caso.");
      titulo = "Proposta do estudo";
      numero = `Versão ${r.data.versao ?? 1}`;
      situacao = r.data.aprovada_em ? "Aprovada" : situacaoHumana(r.data.status);
      const validade = diaBR(r.data.validade);
      if (validade) prazo = `Validade até ${validade}`;
      parcelas = texto(r.data.forma_pagamento) ? `Parcelas: ${texto(r.data.forma_pagamento)}` : "";
    }

    const resumo = [titulo, numero, situacao, prazo, parcelas].filter(Boolean).join(" · ");
    const agora = new Date().toISOString();
    // Republicar substitui o cartão anterior: o registro antigo é arquivado, nunca apagado.
    const anterior = await s
      .from("app_projections")
      .update({ approval_status: "archived" })
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .eq("projection_type", data.tipo)
      .eq("approval_status", "published");
    erro(anterior);
    const r = await s
      .from("app_projections")
      .insert({
        organization_id: organizationId,
        case_id: casoId,
        source_entity_type: "case",
        source_entity_id: id,
        projection_type: data.tipo,
        destination: "app",
        content_sanitized: resumo,
        approval_status: "published",
        approved_by: userId,
        approved_at: agora,
        effective_from: agora,
        visibility_scope: "titular",
        created_by: userId,
      })
      .select("id")
      .single();
    erro(r);
    return { id: String(r.data.id), resumo };
  });

/** Despublicar arquiva a projeção com motivo — o histórico permanece. */
export const despublicarDoAppGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.motivo)) throw new Error("Informe o motivo de despublicar.");

    erro(
      await s
        .from("app_projections")
        .update({
          approval_status: "archived",
          archived_at: new Date().toISOString(),
          archived_reason: texto(data.motivo),
          updated_by: userId,
        })
        .eq("id", data.id)
        .eq("organization_id", organizationId),
    );
    return { ok: true };
  });

/* ------------------------------------------------------------------ *
 * 8. Planejador: próxima ação do caso
 * ------------------------------------------------------------------ */

/**
 * Grava a próxima ação, o responsável e o prazo no planejador do caso.
 * Atualiza o plano quando ele existe e sempre reflete no caso, que é a
 * leitura de Hoje e do Kanban. Nada é inferido: tudo vem do formulário.
 */
export const definirProximaAcaoGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { proximaAcao: string; responsavel?: string; prazo?: string; marco?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const s = context.supabase as any;
    const { organizationId, casoId, userId } = await contexto(s, context.userId as string);
    if (!texto(data.proximaAcao)) throw new Error("Descreva a próxima ação.");

    const prazo = texto(data.prazo) || null;
    const responsavel = texto(data.responsavel) || null;

    const plano = await s
      .from("case_plans")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", casoId)
      .is("archived_at", null)
      .limit(1);

    if (plano.data?.[0]?.id) {
      const patch: Linha = { proxima_acao: texto(data.proximaAcao), updated_by: userId };
      if (prazo) patch["prazo_proxima_acao"] = prazo;
      if (texto(data.marco)) patch["marco_atual"] = texto(data.marco);
      erro(await s.from("case_plans").update(patch).eq("id", plano.data[0].id).eq("organization_id", organizationId));
    }

    const patchCaso: Linha = { proxima_acao: texto(data.proximaAcao) };
    if (prazo) patchCaso["prazo_proxima_acao"] = prazo;
    if (responsavel) patchCaso["proxima_acao_responsavel"] = responsavel;
    erro(await s.from("crm_casos").update(patchCaso).eq("id", casoId).eq("organization_id", organizationId));

    return { ok: true };
  });
