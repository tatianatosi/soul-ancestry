import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoOps, exigirEscrita, type Sb } from "@/lib/ops.server";
import {
  calcularCadencia,
  podeTransicionarEntrega,
  validarTouchpoint,
  type StatusAprovacao,
} from "@/lib/jornada-cliente";

/* eslint-disable @typescript-eslint/no-explicit-any */

const hojeISO = () => new Date().toISOString();

/** Jornada completa do caso: cadência, interações internas e micro-entregas. */
export const carregarJornadaCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);

    const { data: caso, error: erroCaso } = await supabase
      .from("crm_casos")
      .select("*")
      .eq("id", data.casoId)
      .eq("organization_id", ctx.organizationId)
      .maybeSingle();
    if (erroCaso) throw new Error(erroCaso.message);
    if (!caso) throw new Error("Caso não encontrado.");

    const [{ data: interacoes }, { data: entregas }] = await Promise.all([
      supabase
        .from("crm_interactions")
        .select("*")
        .eq("case_id", data.casoId)
        .order("ocorrido_em", { ascending: false })
        .limit(200),
      supabase
        .from("client_deliverables")
        .select("*")
        .eq("case_id", data.casoId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const cadencia = calcularCadencia({
      hoje: hojeISO(),
      ultimoTouchpointEm: (caso as any).ultimo_touchpoint_em ?? null,
      aguardandoInstituicaoExterna: !!(caso as any).aguardando_instituicao_externa,
      motivoEsperaExterna: (caso as any).motivo_espera_externa ?? null,
    });

    return {
      caso: caso as Record<string, any>,
      interacoes: (interacoes ?? []) as Record<string, any>[],
      entregas: (entregas ?? []) as Record<string, any>[],
      cadencia,
      papel: ctx.papel,
      podeEscrever: ctx.podeEscrever,
    };
  });

/** Interação interna imutável. Correção nunca edita: cria nova referenciando a anterior. */
export const registrarInteracao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      casoId: string;
      clienteId?: string | null;
      tipo: string;
      canal?: string;
      direcao?: string;
      ocorridoEm?: string;
      resumoInterno: string;
      resultado?: string | null;
      proximaAcao?: string | null;
      prazoProximaAcao?: string | null;
      visibilidade?: "interna" | "cliente_aprovado";
      corrigeInteracaoId?: string | null;
      contaComoTouchpoint?: boolean;
      touchpoint?: {
        oQueFoiFeito?: string;
        oQueEstaAguardando?: string;
        oQueNaoDependeDoCliente?: string;
        proximoMarcoVerificavel?: string;
      };
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    exigirEscrita(ctx);

    if (!data.resumoInterno?.trim()) throw new Error("Resumo interno é obrigatório.");

    if (data.contaComoTouchpoint) {
      const check = validarTouchpoint(data.touchpoint ?? {});
      if (!check.valido)
        throw new Error(`Touchpoint incompleto. Faltando: ${check.faltando.join(", ")}.`);
    }

    const { data: inserida, error } = await supabase
      .from("crm_interactions")
      .insert({
        organization_id: ctx.organizationId,
        case_id: data.casoId,
        client_id: data.clienteId ?? null,
        tipo: data.tipo,
        canal: data.canal ?? "outro",
        direcao: data.direcao ?? "saida",
        ocorrido_em: data.ocorridoEm ?? hojeISO(),
        resumo_interno: data.resumoInterno.trim(),
        resultado: data.resultado ?? null,
        proxima_acao: data.proximaAcao ?? null,
        prazo_proxima_acao: data.prazoProximaAcao ?? null,
        visibilidade: data.visibilidade ?? "interna",
        corrige_interacao_id: data.corrigeInteracaoId ?? null,
        registrado_por: context.userId as string,
        data_origin: "registro_humano",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    if (data.contaComoTouchpoint) {
      const t = data.touchpoint ?? {};
      const { error: erroCaso } = await supabase
        .from("crm_casos")
        .update({
          ultimo_touchpoint_em: data.ocorridoEm ?? hojeISO(),
          ultima_atualizacao_material_em: data.ocorridoEm ?? hojeISO(),
          proximo_marco_verificavel: t.proximoMarcoVerificavel ?? null,
        })
        .eq("id", data.casoId)
        .eq("organization_id", ctx.organizationId);
      if (erroCaso) throw new Error(erroCaso.message);
    }

    return inserida as Record<string, any>;
  });

/** Registra ou atualiza espera institucional externa (com motivo obrigatório). */
export const definirEsperaExterna = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string; aguardando: boolean; motivo?: string | null; limite?: string | null }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    exigirEscrita(ctx);
    if (data.aguardando && !(data.motivo ?? "").trim())
      throw new Error("Espera institucional externa exige motivo comunicado.");

    const { error } = await supabase
      .from("crm_casos")
      .update({
        aguardando_instituicao_externa: data.aguardando,
        motivo_espera_externa: data.aguardando ? (data.motivo ?? "").trim() : null,
        proxima_atualizacao_limite_em: data.limite ?? null,
      })
      .eq("id", data.casoId)
      .eq("organization_id", ctx.organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Cria uma micro-entrega em rascunho. Publicação é passo humano separado. */
export const criarMicroentregaCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      casoId: string;
      clienteId?: string | null;
      tipo: string;
      fase?: string | null;
      tituloCliente: string;
      resumoAprovado: string;
      deepLink?: string | null;
      referenciaInterna?: string | null;
      prioridade?: string;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    exigirEscrita(ctx);
    if (!data.tituloCliente?.trim() || !data.resumoAprovado?.trim())
      throw new Error("Título e resumo aprovados pelo cliente são obrigatórios.");

    const { data: criada, error } = await supabase
      .from("client_deliverables")
      .insert({
        organization_id: ctx.organizationId,
        case_id: data.casoId,
        client_id: data.clienteId ?? null,
        deliverable_type: data.tipo,
        journey_phase: data.fase ?? null,
        title_client: data.tituloCliente.trim(),
        summary_approved: data.resumoAprovado.trim(),
        deep_link: data.deepLink ?? null,
        internal_reference: data.referenciaInterna ?? null,
        priority: data.prioridade ?? "normal",
        approval_status: "rascunho",
        responsible_user_id: context.userId as string,
        created_by: context.userId as string,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return criada as Record<string, any>;
  });

/** Move a micro-entrega no fluxo de aprovação. Só "publicado" chega ao App Cliente. */
export const transicionarMicroentrega = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entregaId: string; para: StatusAprovacao; motivo?: string | null }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    exigirEscrita(ctx);

    const { data: atual, error: erroLeitura } = await supabase
      .from("client_deliverables")
      .select("id,approval_status,organization_id")
      .eq("id", data.entregaId)
      .eq("organization_id", ctx.organizationId)
      .maybeSingle();
    if (erroLeitura) throw new Error(erroLeitura.message);
    if (!atual) throw new Error("Micro-entrega não encontrada.");

    const de = (atual as any).approval_status as StatusAprovacao;
    if (!podeTransicionarEntrega(de, data.para))
      throw new Error(`Transição não permitida: ${de} → ${data.para}.`);

    const patch: Record<string, any> = {
      approval_status: data.para,
      updated_by: context.userId as string,
    };
    if (data.para === "publicado") patch['available_at'] = hojeISO();
    if (data.para === "arquivado") {
      patch['archived_at'] = hojeISO();
      patch['archived_by'] = context.userId as string;
      patch['archive_motivo'] = data.motivo ?? "Arquivada pela equipe";
    }

    const { error } = await supabase
      .from("client_deliverables")
      .update(patch)
      .eq("id", data.entregaId)
      .eq("organization_id", ctx.organizationId);
    if (error) throw new Error(error.message);
    return { ok: true, de, para: data.para };
  });

/** Painel de cadência: casos por saúde de contato, para uso diário do Desk. */
export const painelCadencia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);

    const { data: casos, error } = await supabase
      .from("crm_casos")
      .select(
        "id,case_id,titulo,cliente_nome,ultimo_touchpoint_em,ultima_atualizacao_material_em,proximo_marco_verificavel,aguardando_instituicao_externa,motivo_espera_externa,proxima_atualizacao_limite_em,created_at",
      )
      .eq("organization_id", ctx.organizationId)
      .is("archived_at", null)
      .limit(500);
    if (error) throw new Error(error.message);

    const hoje = hojeISO();
    const linhas = (casos ?? []).map((c: any) => ({
      ...c,
      cadencia: calcularCadencia({
        hoje,
        ultimoTouchpointEm: c.ultimo_touchpoint_em ?? c.created_at ?? null,
        aguardandoInstituicaoExterna: !!c.aguardando_instituicao_externa,
        motivoEsperaExterna: c.motivo_espera_externa ?? null,
      }),
    }));

    return {
      casos: linhas,
      resumo: {
        regular: linhas.filter((l: any) => l.cadencia.status === "regular").length,
        atencao: linhas.filter((l: any) => l.cadencia.status === "atencao").length,
        critico: linhas.filter((l: any) => l.cadencia.status === "critico").length,
      },
    };
  });
