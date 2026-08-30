import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MODULOS_HISTORICOS } from "@/lib/genealogia-modulos";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * G-02 — servidores da área Pessoas e Linhagens.
 *
 * Toda gravação é interna: nenhuma pesquisa externa é iniciada, nenhum documento,
 * pasta, contrato, cobrança, assinatura, mensagem ou publicação é criado.
 * O banco continua sendo a autoridade final das travas (evidência obrigatória,
 * bloqueio de exclusão física e isolamento por organização).
 */

const CAMPOS_PERFIL = [
  "case_id",
  "research_person_id",
  "nome_completo",
  "nome_nascimento",
  "sexo",
  "nascimento_data",
  "nascimento_data_aproximada",
  "nascimento_localidade",
  "morte_data",
  "morte_data_aproximada",
  "morte_localidade",
  "causa_morte",
  "sepultamento_localidade",
  "status_verificacao",
  "evidence_id",
  "source_id",
  "internal_notes",
  "nascimento_precisao",
  "morte_precisao",
  "responsible_user_id",
  "client_visibility",
];

const CAMPOS_VARIANTE = [
  "person_id",
  "variante",
  "tipo",
  "periodo",
  "localidade",
  "estado_validacao",
  "nivel_confianca",
  "evidence_id",
  "source_id",
  "observacao_interna",
];

const CAMPOS_RELACAO = [
  "case_id",
  "person_from_id",
  "person_to_id",
  "relation_type",
  "relation_date",
  "relation_date_aproximada",
  "locality",
  "status_pesquisa",
  "evidence_id",
  "source_id",
  "internal_notes",
  "client_visibility",
];

const CAMPOS_EVENTO = [
  "case_id",
  "person_id",
  "event_type",
  "start_date",
  "end_date",
  "approximate_date",
  "locality",
  "description_internal",
  "validation_status",
  "evidence_id",
  "source_id",
  "family_id",
  "impact_type",
  "data_precisao",
  "client_visibility",
];

const CAMPOS_LINHAGEM = [
  "case_id",
  "family_id",
  "nome_da_linha",
  "pessoa_ancora_id",
  "tipo_da_linha",
  "citizenship_track_id",
  "objetivo",
  "geracao_alvo",
  "status",
  "evidencias_chave",
  "risco_principal",
  "proximo_marco",
  "responsavel",
];

const CAMPOS_MODULO = [
  "case_id",
  "family_id",
  "person_id",
  "titulo",
  "subtipo",
  "periodo_inicio",
  "periodo_fim",
  "data_precisao",
  "localidade",
  "descricao_interna",
  "dados",
  "evidence_id",
  "source_id",
  "institution_id",
  "status_verificacao",
  "client_visibility",
  "responsible_user_id",
];

const TABELAS: Record<string, string[]> = {
  genealogical_person_profiles: CAMPOS_PERFIL,
  name_variants: CAMPOS_VARIANTE,
  genealogical_relationships: CAMPOS_RELACAO,
  genealogical_events: CAMPOS_EVENTO,
  lineage_paths: CAMPOS_LINHAGEM,
  ...Object.fromEntries(MODULOS_HISTORICOS.map((m) => [m.tabela, CAMPOS_MODULO])),
};

type TabelaG02 = keyof typeof TABELAS;

/** Filtra o payload e denuncia campo enviado que não existe no mapa de persistência. */
function filtrar(tabela: TabelaG02, entrada: Record<string, unknown>) {
  const campos = TABELAS[tabela] as string[];
  const out: Record<string, unknown> = {};
  const ignorados: string[] = [];
  for (const [chave, valor] of Object.entries(entrada)) {
    if (campos.includes(chave)) out[chave] = valor === "" ? null : valor;
    else if (chave !== "id") ignorados.push(chave);
  }
  if (ignorados.length > 0) {
    throw new Error(`CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA: ${ignorados.join(", ")} em ${tabela}.`);
  }
  return out;
}

async function autorizarLeitura(supabase: Sb, userId: string) {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa a ficha genealógica interna.");
  return { organizationId, podeEditar: PAPEIS_EDITA.includes(papel) };
}

async function autorizarEscrita(supabase: Sb, userId: string) {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode editar pessoas, relações ou linhagens.");
  return organizationId;
}

/** Painel interno completo: pessoas, perfis, variantes, relações, eventos e linhagens. */
export const painelPessoasLinhagens = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, podeEditar } = await autorizarLeitura(supabase, context.userId as string);
    const org = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);

    const pesquisas = await org("research_cases").eq("case_id", data.caseId).is("archived_at", null);
    const pesquisaIds = (pesquisas.data ?? []).map((p: any) => p.id as string);

    const pessoas = pesquisaIds.length
      ? await supabase
          .from("research_people")
          .select("id,canonical_name,preferred_display_name,person_status,identity_status,research_case_id,archived_at")
          .eq("organization_id", organizationId)
          .in("research_case_id", pesquisaIds)
          .is("archived_at", null)
      : { data: [] as any[] };

    const personIds = (pessoas.data ?? []).map((p: any) => p.id as string);

    const [perfis, variantes, relacoes, eventos, linhagens, evidencias, fontes, nucleos, trilhas, caso] =
      await Promise.all([
        org("genealogical_person_profiles").eq("case_id", data.caseId).order("created_at", { ascending: true }),
        personIds.length
          ? supabase
              .from("name_variants")
              .select("*")
              .eq("organization_id", organizationId)
              .in("person_id", personIds)
              .order("created_at", { ascending: true })
          : Promise.resolve({ data: [] as any[] }),
        org("genealogical_relationships").eq("case_id", data.caseId).order("created_at", { ascending: true }),
        org("genealogical_events").eq("case_id", data.caseId).order("start_date", { ascending: true }),
        org("lineage_paths").eq("case_id", data.caseId).order("created_at", { ascending: true }),
        supabase
          .from("research_evidence_items")
          .select("id,title,evidence_status")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
        supabase
          .from("research_sources")
          .select("id,title,source_type,source_status")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
        org("nucleos_familiares").eq("case_id", data.caseId).is("archived_at", null),
        supabase
          .from("citizenship_tracks")
          .select("id,code,pais,via_preliminar")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
        supabase.from("crm_casos").select("id,codigo,titulo,pais").eq("id", data.caseId).maybeSingle(),
      ]);

    const modulos = await Promise.all(
      MODULOS_HISTORICOS.map(async (m) => {
        const r = await org(m.tabela).eq("case_id", data.caseId).order("created_at", { ascending: true });
        return [m.tabela, ((r as any).data ?? []) as any[]] as const;
      }),
    );

    return {
      podeEditar,
      modulos: Object.fromEntries(modulos) as Record<string, any[]>,
      caso: (caso as any).data ?? null,
      pesquisas: (pesquisas.data ?? []) as any[],
      pessoas: ((pessoas as any).data ?? []) as any[],
      perfis: (perfis.data ?? []) as any[],
      variantes: (((variantes as any).data ?? []) as any[]),
      relacoes: (relacoes.data ?? []) as any[],
      eventos: (eventos.data ?? []) as any[],
      linhagens: (linhagens.data ?? []) as any[],
      evidencias: ((evidencias as any).data ?? []) as any[],
      fontes: ((fontes as any).data ?? []) as any[],
      nucleos: (nucleos.data ?? []) as any[],
      trilhas: ((trilhas as any).data ?? []) as any[],
    };
  });

/**
 * Cria a pessoa no registro de pesquisa e o perfil genealógico 360° em um único
 * passo. Nada é inferido: apenas o nome é obrigatório.
 */
export const criarPessoaComPerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; pesquisaId: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const valores = filtrar("genealogical_person_profiles", data.valores);
    const nome = String(valores["nome_completo"] ?? "").trim();
    if (!nome) throw new Error("Nome completo é obrigatório.");
    if (!data.pesquisaId) {
      throw new Error("Este caso ainda não tem registro de pesquisa. Crie a pesquisa do caso antes de cadastrar pessoas.");
    }

    const pessoa = await supabase
      .from("research_people")
      .insert({
        organization_id: organizationId,
        research_case_id: data.pesquisaId,
        canonical_name: nome,
        person_status: "related_person",
        identity_status: "unreviewed",
      })
      .select("id")
      .maybeSingle();
    if (pessoa.error) throw new Error(pessoa.error.message);

    const perfil = await supabase
      .from("genealogical_person_profiles")
      .insert({
        ...valores,
        case_id: data.caseId,
        organization_id: organizationId,
        research_person_id: pessoa.data.id,
      })
      .select("*")
      .maybeSingle();
    if (perfil.error) throw new Error(perfil.error.message);
    return { id: perfil.data.id as string, research_person_id: pessoa.data.id as string };
  });

/** Gravação genérica das entidades G-02, com releitura de conferência. */
export const salvarRegistroG02 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tabela: TabelaG02; id?: string; caseId?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    if (!TABELAS[data.tabela]) throw new Error("Entidade não reconhecida na ficha genealógica.");
    const valores = filtrar(data.tabela, data.valores);
    if (data.caseId && (TABELAS[data.tabela] as string[]).includes("case_id")) valores["case_id"] = data.caseId;

    const r = data.id
      ? await supabase.from(data.tabela).update(valores).eq("id", data.id).select("*").maybeSingle()
      : await supabase
          .from(data.tabela)
          .insert({ ...valores, organization_id: organizationId })
          .select("*")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data) throw new Error("Nada foi gravado: registro fora da sua organização ou sem permissão.");
    return { registro: r.data as any };
  });

/** Sem exclusão física: somente arquivamento com motivo. */
export const arquivarRegistroG02 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tabela: TabelaG02; id: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    await autorizarEscrita(supabase, context.userId as string);
    if (!TABELAS[data.tabela]) throw new Error("Entidade não reconhecida na ficha genealógica.");
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const r = await supabase
      .from(data.tabela)
      .update({ archived_at: new Date().toISOString(), archive_reason: motivo })
      .eq("id", data.id)
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data) throw new Error("Nada foi gravado: registro fora da sua organização ou sem permissão.");
    return { ok: true };
  });
