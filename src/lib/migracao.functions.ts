import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo, type Linha } from "@/lib/caso-canonico.server";
import {
  MAPPING_VERSION,
  aplicarMapeamento,
  lerCsv,
  planejarImportacao,
  sugerirMapeamento,
  type LinhaPlacego,
  type ResultadoLinha,
} from "@/lib/migracao-legado";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Camada de migração: leitura de lotes, prévia e execução da importação Placego. */

async function contexto(supabase: any) {
  const organizationId = await organizacaoDo(supabase);
  return { organizationId };
}

export const carregarMigracao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as any;
    const { organizationId } = await contexto(supabase);
    const eq = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);
    const [lotes, excecoes, vinculos] = await Promise.all([
      eq("import_batches").order("started_at", { ascending: false }).limit(50),
      eq("migration_exceptions").order("created_at", { ascending: false }).limit(200),
      eq("legacy_record_links").order("imported_at", { ascending: false }).limit(200),
    ]);
    return {
      lotes: (lotes.data ?? []) as Linha[],
      excecoes: (excecoes.data ?? []) as Linha[],
      vinculos: (vinculos.data ?? []) as Linha[],
    };
  });

type EntradaImportacao = {
  csv: string;
  mapeamento?: Record<string, string>;
  arquivo?: string;
};

async function planejar(supabase: any, organizationId: string, entrada: EntradaImportacao) {
  const { cabecalho, linhas } = lerCsv(entrada.csv);
  if (cabecalho.length === 0) throw new Error("Arquivo vazio ou sem cabeçalho.");
  const mapeamento = entrada.mapeamento && Object.keys(entrada.mapeamento).length ? entrada.mapeamento : sugerirMapeamento(cabecalho);
  const registros = aplicarMapeamento(cabecalho, linhas, mapeamento);

  const [leads, vinculos] = await Promise.all([
    supabase.from("leads").select("id, nome, email, telefone").eq("organization_id", organizationId).is("archived_at", null),
    supabase
      .from("legacy_record_links")
      .select("legacy_record_id, canonical_record_id")
      .eq("organization_id", organizationId)
      .eq("legacy_system", "placego")
      .eq("entity_type", "lead"),
  ]);

  const plano = planejarImportacao(registros, (leads.data ?? []) as any[], (vinculos.data ?? []) as any[]);
  return { cabecalho, mapeamento, ...plano };
}

export const previewImportacaoPlacego = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: EntradaImportacao) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const { organizationId } = await contexto(supabase);
    return planejar(supabase, organizationId, data);
  });

export const executarImportacaoPlacego = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: EntradaImportacao) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const { organizationId } = await contexto(supabase);
    const plano = await planejar(supabase, organizationId, data);

    const { data: lote, error: erroLote } = await supabase
      .from("import_batches")
      .insert({
        organization_id: organizationId,
        source_system: "placego",
        source_file_or_endpoint: data.arquivo ?? "csv",
        imported_by: context.userId,
        total_rows: plano.linhas.length,
        mapping_version: MAPPING_VERSION,
        mapping: plano.mapeamento,
        status: "em_execucao",
      })
      .select("*")
      .single();
    if (erroLote) throw new Error(`Não foi possível abrir o lote de importação: ${erroLote.message}`);

    const erros: { linha: number; motivo: string }[] = [];
    let criados = 0;
    let atualizados = 0;

    const vincular = async (r: ResultadoLinha, canonicalId: string | null, confianca: string) => {
      const { error } = await supabase.from("legacy_record_links").upsert(
        {
          organization_id: organizationId,
          entity_type: "lead",
          canonical_record_id: canonicalId,
          canonical_reference: r.registro.nome ?? null,
          legacy_system: "placego",
          legacy_record_id: r.registro.lead_id_placego,
          legacy_reference: JSON.stringify(r.registro).slice(0, 4000),
          migration_batch_id: lote.id,
          confidence: confianca,
          deduplication_reason: r.motivo ?? null,
        },
        { onConflict: "organization_id,legacy_system,legacy_record_id,entity_type" },
      );
      if (error) erros.push({ linha: r.indice + 2, motivo: `Vínculo legado: ${error.message}` });
    };

    const observacaoLegada = (reg: LinhaPlacego) =>
      [
        reg.observacao_legada ? `Observação legada: ${reg.observacao_legada}` : null,
        reg.status ? `Status legado Placego: ${reg.status}` : null,
        reg.responsavel ? `Responsável legado: ${reg.responsavel}` : null,
        reg.data_entrada ? `Data de entrada legada: ${reg.data_entrada}` : null,
        `Origem migrada do Placego (ID ${reg.lead_id_placego}).`,
      ]
        .filter(Boolean)
        .join("\n");

    for (const r of plano.linhas) {
      if (r.acao === "criar") {
        const { data: novo, error } = await supabase
          .from("leads")
          .insert({
            organization_id: organizationId,
            nome: r.registro.nome,
            email: r.registro.email || null,
            telefone: r.registro.telefone || null,
            origem: r.registro.origem || "placego",
            observacoes: observacaoLegada(r.registro),
          })
          .select("id")
          .single();
        if (error) {
          erros.push({ linha: r.indice + 2, motivo: error.message });
          continue;
        }
        criados += 1;
        await vincular(r, novo.id, "alta");
        await supabase.from("conversion_events").insert({
          organization_id: organizationId,
          event_type: "lead_criado",
          lead_id: novo.id,
          occurred_at: r.registro.data_entrada ? new Date(r.registro.data_entrada).toISOString() : new Date().toISOString(),
          origem: r.registro.origem || "placego",
          canal: r.registro.utm_medium || r.registro.origem || "placego",
          evidencia_referencia: `import_batch:${lote.id}`,
          observacao: "Evento reconstruído a partir de migração Placego.",
          created_by: context.userId,
        });
      } else if (r.acao === "atualizar") {
        atualizados += 1;
        await vincular(r, r.alvoId ?? null, "alta");
      } else if (r.acao === "duplicado") {
        await vincular(r, r.alvoId ?? null, "media");
        await supabase.from("migration_exceptions").insert({
          organization_id: organizationId,
          migration_batch_id: lote.id,
          source_system: "placego",
          source_record_id: r.registro.lead_id_placego || null,
          exception_type: "duplicidade",
          reason: r.motivo ?? "Possível duplicidade.",
          proposed_resolution: "Revisar humanamente e decidir consolidação do lead canônico.",
          payload: r.registro,
        });
      } else {
        await supabase.from("migration_exceptions").insert({
          organization_id: organizationId,
          migration_batch_id: lote.id,
          source_system: "placego",
          source_record_id: r.registro.lead_id_placego || null,
          exception_type: "rejeitado",
          reason: r.motivo ?? "Registro rejeitado.",
          proposed_resolution: "Completar dados na origem legada e reimportar.",
          payload: r.registro,
        });
      }
    }

    await supabase
      .from("import_batches")
      .update({
        finished_at: new Date().toISOString(),
        created_records: criados,
        updated_records: atualizados,
        duplicated_records: plano.resumo.duplicado,
        rejected_records: plano.resumo.rejeitado,
        error_log: erros,
        status: erros.length ? "concluido_com_erros" : "concluido",
      })
      .eq("id", lote.id);

    return {
      loteId: lote.id as string,
      criados,
      atualizados,
      duplicados: plano.resumo.duplicado,
      rejeitados: plano.resumo.rejeitado,
      erros,
    };
  });

export const atualizarExcecaoMigracao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string; proposed_resolution?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const { organizationId } = await contexto(supabase);
    const { error } = await supabase
      .from("migration_exceptions")
      .update({
        status: data.status,
        proposed_resolution: data.proposed_resolution ?? undefined,
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
