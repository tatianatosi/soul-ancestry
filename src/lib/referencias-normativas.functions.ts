import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  aplicavelAoCaso,
  ordenarReferencias,
  situacaoDe,
  type ContextoNormativo,
  type ReferenciaNormativa,
} from "@/lib/referencias-normativas";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Leitura contextual das referências normativas aplicáveis a um caso.
 * Nenhuma escrita, upload, ativação de fonte, consulta externa ou publicação.
 */
export const referenciasNormativasDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;

    const caso = await supabase
      .from("crm_casos")
      .select("id,codigo,titulo,pais,citizenship_track_id")
      .eq("id", data.caseId)
      .maybeSingle();

    const pesquisa = await supabase
      .from("research_cases")
      .select("case_id,country_context,citizenship_track_id")
      .eq("case_id", data.caseId)
      .maybeSingle();

    const ctx: ContextoNormativo = {
      pais: pesquisa.data?.country_context ?? caso.data?.pais ?? null,
      trilhaId: pesquisa.data?.citizenship_track_id ?? caso.data?.citizenship_track_id ?? null,
    };

    const [acervo, trilhas, taxonomias, regras, bases, decisoes] = await Promise.all([
      supabase
        .from("master_library_items")
        .select("id,categoria,titulo,versao,status,owner,archived_at"),
      supabase
        .from("citizenship_tracks")
        .select("id,pais,nacionalidade,via_preliminar,status_via,ativo,responsavel_revisao,archived_at"),
      supabase.from("controlled_taxonomies").select("id,dominio,nome,versao,ativo,responsavel,archived_at"),
      supabase.from("versioned_legal_rules").select("id,tema,escopo,versao,status,reviewed_by,archived_at"),
      supabase
        .from("genealogical_sources_catalog")
        .select(
          "id,nome,pais_eixo,citizenship_track_id,tipo_de_acervo,cobertura_geografica,estagio_maturidade,status_integracao,responsavel_revisao,archived_at",
        ),
      supabase
        .from("decisions")
        .select("id,titulo,dominio,status,versao,responsavel_nome,vigencia_inicio,archived_at,case_id")
        .eq("case_id", data.caseId),
    ]);

    const biblioteca: ReferenciaNormativa[] = [];

    for (const r of acervo.data ?? []) {
      const ap = aplicavelAoCaso({}, ctx);
      if (!ap.aplicavel) continue;
      biblioteca.push({
        id: r.id,
        origem: "biblioteca",
        subarea: "Acervo",
        titulo: r.titulo,
        tipo: r.categoria ?? null,
        escopo: null,
        situacao: situacaoDe(r),
        versao: r.versao ?? null,
        responsavel: r.owner ?? null,
        trilha: null,
        apenasCatalogada: false,
        motivoAplicabilidade: ap.motivo,
      });
    }

    for (const r of trilhas.data ?? []) {
      const ap = aplicavelAoCaso({ pais: r.pais, citizenship_track_id: r.id }, ctx);
      if (!ap.aplicavel) continue;
      biblioteca.push({
        id: r.id,
        origem: "biblioteca",
        subarea: "Trilhas",
        titulo: `${r.pais} — ${r.via_preliminar ?? "via a confirmar"}`,
        tipo: r.nacionalidade ?? null,
        escopo: r.pais ?? null,
        situacao: situacaoDe({ archived_at: r.archived_at, status: r.status_via, ativo: r.ativo }),
        versao: null,
        responsavel: r.responsavel_revisao ?? null,
        trilha: r.via_preliminar ?? null,
        apenasCatalogada: true,
        motivoAplicabilidade: ap.motivo,
      });
    }

    for (const r of taxonomias.data ?? []) {
      const ap = aplicavelAoCaso({}, ctx);
      if (!ap.aplicavel) continue;
      biblioteca.push({
        id: r.id,
        origem: "biblioteca",
        subarea: "Dicionários",
        titulo: r.nome,
        tipo: r.dominio ?? null,
        escopo: null,
        situacao: situacaoDe({ archived_at: r.archived_at, status: r.ativo ? "ativo" : null, ativo: r.ativo }),
        versao: r.versao ?? null,
        responsavel: r.responsavel ?? null,
        trilha: null,
        apenasCatalogada: false,
        motivoAplicabilidade: ap.motivo,
      });
    }

    for (const r of regras.data ?? []) {
      const ap = aplicavelAoCaso({}, ctx);
      if (!ap.aplicavel) continue;
      biblioteca.push({
        id: r.id,
        origem: "biblioteca",
        subarea: "Jurídico",
        titulo: r.tema,
        tipo: "Regra versionada",
        escopo: r.escopo ?? null,
        situacao: situacaoDe(r),
        versao: r.versao ?? null,
        responsavel: r.reviewed_by ?? null,
        trilha: null,
        apenasCatalogada: false,
        motivoAplicabilidade: ap.motivo,
      });
    }

    const listaBases: ReferenciaNormativa[] = [];
    for (const r of bases.data ?? []) {
      const ap = aplicavelAoCaso({ pais: r.pais_eixo, citizenship_track_id: r.citizenship_track_id }, ctx);
      if (!ap.aplicavel) continue;
      listaBases.push({
        id: r.id,
        origem: "bases",
        subarea: "Bases Genealógicas",
        titulo: r.nome,
        tipo: r.tipo_de_acervo ?? null,
        escopo: r.cobertura_geografica ?? r.pais_eixo ?? null,
        situacao: situacaoDe({ archived_at: r.archived_at, status: r.status_integracao }),
        versao: null,
        responsavel: r.responsavel_revisao ?? null,
        trilha: r.estagio_maturidade ?? null,
        apenasCatalogada: true,
        motivoAplicabilidade: ap.motivo,
      });
    }

    const listaDecisoes: ReferenciaNormativa[] = (decisoes.data ?? []).map((r: any) => ({
      id: r.id,
      origem: "decisoes" as const,
      subarea: "Log de decisões",
      titulo: r.titulo,
      tipo: r.dominio ?? null,
      escopo: r.vigencia_inicio ? `vigente desde ${String(r.vigencia_inicio).slice(0, 10)}` : null,
      situacao: situacaoDe(r),
      versao: r.versao ?? null,
      responsavel: r.responsavel_nome ?? null,
      trilha: null,
      apenasCatalogada: false,
      motivoAplicabilidade: "Decisão vinculada ao caso",
    }));

    return {
      contexto: {
        codigo: caso.data?.codigo ?? null,
        pais: ctx.pais,
        trilhaId: ctx.trilhaId,
      },
      biblioteca: ordenarReferencias(biblioteca),
      bases: ordenarReferencias(listaBases),
      decisoes: ordenarReferencias(listaDecisoes),
    };
  });
