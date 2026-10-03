/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Escritor da União de Ramos (03/10/2026). Fecha o Corte 3c, cuja leitura
 * já estava pronta desde `da238ef7` e cujo escritor nunca existiu — a aba
 * Jornada montava a ponte a partir de dois ids fixos da demo.
 *
 * Nenhuma tabela nova: `app_projections` com `projection_type =
 * 'uniao_ramos'`, `source_entity_id` = ponta da história,
 * `vinculo_projecao_id` = ponta do processo, `content_sanitized` = legenda.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { semCache } from "@/lib/no-store";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { exigirPublicavelNoApp } from "@/lib/projecao-publicavel";
import { TIPO_PROJECAO_ROTULO, tipoChegaAoCliente } from "@/lib/projecoes-cliente";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { TIPO_UNIAO_RAMOS, validarUniaoDeRamos } from "@/lib/uniao-ramos";

const COLUNAS = "id,projection_type,content_sanitized,source_entity_id,vinculo_projecao_id,effective_from,approved_at";

/**
 * O que o Desk precisa para montar o painel: as publicações do caso que
 * podem ser ponta (tudo que chega ao cliente, menos a própria união) e as
 * uniões já publicadas.
 */
export const listarUniaoDeRamosDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!data?.caseId) throw new Error("Caso não informado.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const { data: linhas, error } = await supabase
      .from("app_projections")
      .select(COLUNAS)
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .eq("destination", "app")
      .eq("approval_status", "published")
      .is("archived_at", null);
    if (error) throw new Error(error.message);

    const todas = (linhas ?? []) as any[];
    const candidatas = todas
      .filter((l) => {
        const tipo = String(l.projection_type ?? "").trim().toLowerCase();
        // Uma união não pode ser ponta de outra união, e tipo que não chega
        // ao cliente (contrato, proposta) nunca é ponta de nada.
        return tipo !== TIPO_UNIAO_RAMOS && tipoChegaAoCliente(tipo);
      })
      .map((l) => ({
        id: l.id as string,
        tipo: String(l.projection_type ?? ""),
        tipoRotulo: TIPO_PROJECAO_ROTULO[String(l.projection_type ?? "")] ?? "Atualização",
        conteudo: String(l.content_sanitized ?? ""),
        publicadoEm: (l.effective_from as string | null) ?? (l.approved_at as string | null) ?? null,
      }))
      .sort((a, b) => new Date(b.publicadoEm ?? 0).getTime() - new Date(a.publicadoEm ?? 0).getTime());

    const uniões = todas
      .filter((l) => String(l.projection_type ?? "").trim().toLowerCase() === TIPO_UNIAO_RAMOS)
      .map((l) => ({
        id: l.id as string,
        historiaProjecaoId: (l.source_entity_id as string | null) ?? null,
        casoProjecaoId: (l.vinculo_projecao_id as string | null) ?? null,
        legenda: String(l.content_sanitized ?? ""),
        publicadoEm: (l.effective_from as string | null) ?? (l.approved_at as string | null) ?? null,
      }));

    return { candidatas, unioes: uniões };
  });

export const publicarUniaoDeRamos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; historiaProjecaoId: string; casoProjecaoId: string; legenda: string }) => {
    if (!data?.caseId) throw new Error("Caso não informado.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;

    // As duas pontas precisam ser publicações reais DESTE caso. Isso é lido
    // do banco, não aceito do cliente da chamada.
    const { data: publicadas, error } = await supabase
      .from("app_projections")
      .select("id,projection_type")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .eq("destination", "app")
      .eq("approval_status", "published")
      .is("archived_at", null);
    if (error) throw new Error(error.message);
    const idsPublicadosDoCaso = ((publicadas ?? []) as any[])
      .filter((l) => String(l.projection_type ?? "").trim().toLowerCase() !== TIPO_UNIAO_RAMOS)
      .map((l) => String(l.id));

    const erros = validarUniaoDeRamos({ ...data, idsPublicadosDoCaso });
    if (erros.length) throw new Error(erros.join(" "));

    // Mesma fronteira de qualquer texto que vai ao App: nada de preço, SKU,
    // nome técnico de fonte, URL ou dado interno na legenda.
    const legenda = exigirPublicavelNoApp(data.legenda.trim());

    const agora = new Date().toISOString();
    const payload = {
      content_sanitized: legenda,
      approval_status: "published",
      approved_by: userId,
      approved_at: agora,
    };

    // Republicar a mesma dupla atualiza a legenda, não cria uma segunda ponte.
    const { data: existente } = await supabase
      .from("app_projections")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .eq("projection_type", TIPO_UNIAO_RAMOS)
      .eq("source_entity_id", data.historiaProjecaoId)
      .eq("vinculo_projecao_id", data.casoProjecaoId)
      .eq("approval_status", "published")
      .is("archived_at", null)
      .limit(1);
    const idExistente = ((existente ?? []) as { id: string }[])[0]?.id ?? null;

    const r = idExistente
      ? await gravarComVerificacao({ supabase, tabela: "app_projections", id: idExistente, organizationId, userId, payload })
      : await inserirComVerificacao({
          supabase,
          tabela: "app_projections",
          organizationId,
          userId,
          payload: {
            ...payload,
            case_id: data.caseId,
            projection_type: TIPO_UNIAO_RAMOS,
            destination: "app",
            source_entity_type: "app_projections",
            source_entity_id: data.historiaProjecaoId,
            vinculo_projecao_id: data.casoProjecaoId,
            visibility_scope: "titular",
            effective_from: agora,
          },
        });

    const id = idExistente ?? ((r as { id?: string }).id ?? null);
    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "app_projections",
      entidade_id: id,
      acao: idExistente ? "uniao_ramos_atualizada" : "uniao_ramos_publicada",
      user_id: userId,
      metadados: {
        case_id: data.caseId,
        historia_projecao_id: data.historiaProjecaoId,
        caso_projecao_id: data.casoProjecaoId,
      },
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: idExistente ? "União de Ramos atualizada no App" : "União de Ramos publicada no App",
      summaryInternal: legenda,
      sourceEntityType: "app_projections",
      sourceEntityId: id ?? data.caseId,
      userId,
    });
    return { ok: true, id, legenda, salvoEm: r.salvoEm };
  });

export const despublicarUniaoDeRamos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; projecaoId: string; motivo: string }) => {
    if ((data?.motivo ?? "").trim().length < 5) {
      throw new Error("Informe o motivo (mínimo 5 letras) para retirar a União de Ramos do App.");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;
    const { data: proj } = await supabase
      .from("app_projections")
      .select("id,projection_type")
      .eq("id", data.projecaoId)
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .maybeSingle();
    if (!proj || String(proj.projection_type ?? "").toLowerCase() !== TIPO_UNIAO_RAMOS) {
      throw new Error("União de Ramos não encontrada neste caso.");
    }
    // Arquiva com motivo; nunca apaga a linha (as duas pontas seguem publicadas).
    const r = await gravarComVerificacao({
      supabase,
      tabela: "app_projections",
      id: proj.id,
      organizationId,
      userId,
      payload: { approval_status: "archived", archived_at: new Date().toISOString(), archived_reason: data.motivo.trim() },
    });
    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "app_projections",
      entidade_id: proj.id,
      acao: "uniao_ramos_despublicada",
      user_id: userId,
      metadados: { case_id: data.caseId, motivo: data.motivo.trim() },
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: "União de Ramos retirada do App",
      summaryInternal: data.motivo.trim(),
      sourceEntityType: "app_projections",
      sourceEntityId: proj.id,
      userId,
    });
    return { ok: true, salvoEm: r.salvoEm };
  });
