/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Ficha Master — liga `CaseData` (54 campos da Ficha Giovanna/Piloto,
 * `src/types/case.ts`) a dado real do banco, em vez do dado estático de
 * demonstração (`caseDataGiovanna.ts`, `caseTemplate.ts` etc., zero
 * consumidores reais). `caseAdapter.ts#toFichaPiloto` continua sendo o
 * único mapeador CaseData → 54 campos planos — este arquivo só constrói
 * o `CaseData` a partir de leituras reais, nunca inventa um segundo mapa.
 *
 * Prioridade 1 da sequência de 02/10/2026 (instrução da Proprietária:
 * "Ligar CaseData real ao adaptador da Ficha Master").
 *
 * De-para completo: `docs/arquitetura/2026-10-01_FICHA-MASTER-54-CAMPOS-DE-PARA.md`.
 * Campo sem fonte real hoje (heatmap_pct_1..3, heatmap_pais_2/3, 2ª/3ª
 * pessoa do genograma além da já publicada, jornada_ancestral_1,
 * jornada_intersecao_1/2 — dependem de `uniao_ramos`, ainda não construído,
 * Corte 3c) entra vazio/nulo — nunca fabricado. O heatmap de percentual
 * (campos 14/16/18) é a Prioridade 2 da mesma sequência (migration de
 * `aderencia_percentual` nos ramos do caso, ainda não aplicada).
 *
 * Só leitura. Nenhum escritor aqui.
 */
import type { CaseData, EvidenceStatus, PessoaBase, StatusCaso } from "@/types/case";
import { FASES_JORNADA } from "@/lib/onboarding-jornada";
import { etapaDoCasoCliente } from "@/lib/portal-dados-vivos";
import { pessoasDaArvore, type ProjecaoArvore } from "@/lib/arvore-publicacao";

const PESSOA_SEM_DADO: PessoaBase = { nome: "", status_evidencia: "pendente_validacao" as EvidenceStatus };

function pessoaDeNome(nome: string | null | undefined): PessoaBase {
  const n = (nome ?? "").trim();
  return n ? { nome: n, status_evidencia: "pendente_validacao" as EvidenceStatus } : PESSOA_SEM_DADO;
}

/**
 * `status_caso` (input, dono Caso/eixo) não tem coluna própria com esse
 * vocabulário em `crm_casos` — deriva, de forma honesta e aproximada, da
 * posição na jornada (`case_plans.fase_jornada`), já que as 8 fases do
 * CHECK real (`FASES_JORNADA`) cobrem o mesmo espectro novo→reconhecimento.
 * Sem plano, cai em "novo" (nunca estado avançado sem evidência).
 */
function statusCasoDeFase(faseJornada: string | null | undefined): StatusCaso {
  const idx = FASES_JORNADA.findIndex((f) => f.id === faseJornada);
  if (idx < 0) return "novo";
  if (idx <= 1) return "novo";
  if (idx <= 3) return "em_leitura";
  if (idx <= 5) return "em_documentos";
  return "em_upgrade";
}

function textoProjecao(p: { content_sanitized?: string | null } | undefined): string {
  return (p?.content_sanitized ?? "").trim();
}

function maisRecente<T extends { effective_from?: string | null; updated_at?: string | null; created_at?: string | null }>(
  linhas: readonly T[],
): T | undefined {
  return [...linhas].sort((a, b) => {
    const da = a.effective_from ?? a.updated_at ?? a.created_at ?? "";
    const db = b.effective_from ?? b.updated_at ?? b.created_at ?? "";
    return db.localeCompare(da);
  })[0];
}

export type MontarCaseDataRealParams = { supabase: any; organizationId: string; caseId: string };

/**
 * Monta um `CaseData` real para o caso, lendo direto das tabelas canônicas.
 * `caseId` é o uuid de `crm_casos.id` (não o código `CA-...`).
 */
export async function montarCaseDataReal({
  supabase,
  organizationId,
  caseId,
}: MontarCaseDataRealParams): Promise<CaseData> {
  const casoRes = await supabase
    .from("crm_casos")
    .select("id,codigo,titulo,status,cliente_id,pais,citizenship_track_id,created_at,updated_at")
    .eq("organization_id", organizationId)
    .eq("id", caseId)
    .maybeSingle();
  if (casoRes.error) throw new Error(casoRes.error.message);
  const caso = casoRes.data as Record<string, any> | null;
  if (!caso) throw new Error("Caso não encontrado nesta organização.");

  const [clienteRes, trilhaRes, planoRes, pesquisaRes, projecoesRes, docLiberadoRes, docPendenteRes, timelineRes, ramosRes] =
    await Promise.all([
      caso.cliente_id
        ? supabase.from("clientes").select("nome,pais_interesse").eq("id", caso.cliente_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      caso.citizenship_track_id
        ? supabase.from("citizenship_tracks").select("pais").eq("id", caso.citizenship_track_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("case_plans")
        .select("fase_jornada,status,proxima_acao")
        .eq("organization_id", organizationId)
        .eq("case_id", caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("research_cases")
        .select("internal_hypothesis")
        .eq("organization_id", organizationId)
        .eq("case_id", caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("app_projections")
        .select("id,projection_type,content_sanitized,pessoa_id,geracao_cliente,effective_from,updated_at")
        .eq("organization_id", organizationId)
        .eq("case_id", caseId)
        .is("archived_at", null),
      supabase
        .from("documents")
        .select("titulo")
        .eq("organization_id", organizationId)
        .eq("case_id", caseId)
        .eq("liberado_cliente", true)
        .is("archived_at", null)
        .order("liberado_em", { ascending: false })
        .limit(1),
      supabase
        .from("portal_document_requests")
        .select("titulo")
        .eq("organization_id", organizationId)
        .eq("case_id", caseId)
        .is("archived_at", null)
        .in("status", ["pendente", "solicitado", "aguardando"])
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("case_timeline_events")
        .select("summary_client_approved,occurred_at")
        .eq("organization_id", organizationId)
        .eq("case_id", caseId)
        .is("archived_at", null)
        .not("summary_client_approved", "is", null)
        .order("occurred_at", { ascending: false })
        .limit(3),
      // Heatmap de aderência (campos 13-18 da Ficha Master, Prioridade 2 de
      // 02/10/2026): os ramos do caso (P14, múltiplos ramos). aderencia_percentual
      // é a coluna nova (migration 20261002120000); país vem de
      // citizenship_tracks, resolvido abaixo (dois passos, sem depender de
      // embed do PostgREST — mais simples de testar e de ler).
      supabase
        .from("lineage_paths")
        .select("citizenship_track_id,aderencia_percentual")
        .eq("organization_id", organizationId)
        .eq("case_id", caseId)
        .is("archived_at", null),
    ]);

  const cliente = (clienteRes.data ?? null) as { nome?: string; pais_interesse?: string } | null;
  const trilha = (trilhaRes.data ?? null) as { pais?: string } | null;
  const plano = ((planoRes.data ?? [])[0] ?? null) as { fase_jornada?: string; status?: string; proxima_acao?: string } | null;
  const pesquisa = ((pesquisaRes.data ?? [])[0] ?? null) as { internal_hypothesis?: string } | null;
  const projecoes = (projecoesRes.data ?? []) as ProjecaoArvore[];
  const docLiberado = ((docLiberadoRes.data ?? [])[0] ?? null) as { titulo?: string } | null;
  const docPendente = ((docPendenteRes.data ?? [])[0] ?? null) as { titulo?: string } | null;
  const timeline = (timelineRes.data ?? []) as { summary_client_approved?: string }[];
  const ramosBrutos = (ramosRes.data ?? []) as { citizenship_track_id?: string | null; aderencia_percentual?: number | null }[];

  // Top 3 ramos por aderência (desc; sem aderência registrada vai para o
  // fim, nunca inventa um valor). Resolve o país de cada ramo numa segunda
  // consulta — só os citizenship_track_id realmente usados pelo caso.
  const idsTrilhasRamos = [...new Set(ramosBrutos.map((r) => r.citizenship_track_id).filter(Boolean))] as string[];
  const trilhasRamosRes = idsTrilhasRamos.length
    ? await supabase.from("citizenship_tracks").select("id,pais").in("id", idsTrilhasRamos)
    : { data: [] as { id: string; pais?: string | null }[] };
  const paisPorTrilha = new Map(
    ((trilhasRamosRes.data ?? []) as { id: string; pais?: string | null }[]).map((t) => [t.id, t.pais ?? ""]),
  );
  const ramosOrdenados = [...ramosBrutos]
    .filter((r) => r.citizenship_track_id)
    .sort((a, b) => (b.aderencia_percentual ?? -1) - (a.aderencia_percentual ?? -1))
    .slice(0, 3);
  const heatmap = ramosOrdenados.map((r) => ({
    pais: paisPorTrilha.get(r.citizenship_track_id as string) ?? "",
    pct: typeof r.aderencia_percentual === "number" ? r.aderencia_percentual : null,
  }));

  const porTipo = (tipo: string) =>
    projecoes.filter((p) => String(p.projection_type ?? "").toLowerCase() === tipo);
  const resumo = maisRecente(porTipo("resumo"));
  const arvoreTexto = maisRecente(porTipo("arvore").filter((p) => !p.pessoa_id));
  const atualizacao = maisRecente(porTipo("atualizacao"));
  const marco = maisRecente(porTipo("marco"));
  const legado = maisRecente(porTipo("legado"));
  const plano_ = maisRecente(porTipo("plano"));
  const achados = porTipo("achado");

  const pessoas = pessoasDaArvore(projecoes);
  const pessoasOrdenadas = [...pessoas].sort((a, b) => (a.geracao ?? 99) - (b.geracao ?? 99));
  const etapa = etapaDoCasoCliente(plano?.fase_jornada ?? null);

  const caseData: CaseData = {
    geral: {
      case_id: String(caso.codigo ?? ""),
      case_nome: String(caso.titulo ?? ""),
      cliente_nome: String(cliente?.nome ?? ""),
      cliente_nome_exibicao: String(cliente?.nome ?? ""),
      ano_nascimento_cliente: null,
      cidade_cliente: "",
      estado_cliente: "",
      status_caso: statusCasoDeFase(plano?.fase_jornada),
      produto_atual: String(plano_ ? textoProjecao(plano_) : ""),
      data_abertura: String(caso.created_at ?? ""),
      ultima_atualizacao: String(caso.updated_at ?? ""),
    },
    cliente: {
      nome_completo: String(cliente?.nome ?? ""),
      ano_nascimento: null,
      municipio_nascimento: "",
      estado_nascimento: "",
      estado_civil: "",
      possui_filhos: null,
      endereco_resumido: "",
      email: "",
      telefone: "",
    },
    familia_direta: {
      pai: PESSOA_SEM_DADO,
      mae: PESSOA_SEM_DADO,
      avo_paterno: PESSOA_SEM_DADO,
      avo_paterna: PESSOA_SEM_DADO,
      bisavo_paterno: pessoaDeNome(pessoasOrdenadas[2]?.nome),
      bisavo_paterna: PESSOA_SEM_DADO,
      avo_materno: PESSOA_SEM_DADO,
      avo_materna: PESSOA_SEM_DADO,
    },
    arvore: {
      linha_prioritaria: "",
      pessoas_conectadas: pessoas.length,
      geracoes_lidas: pessoas.reduce((max, p) => Math.max(max, p.geracao ?? 0), 0),
      conexao_chave: textoProjecao(arvoreTexto),
      conexao_territorial: String(trilha?.pais ?? caso.pais ?? ""),
      lacuna_critica: "",
      pessoas_colaterais: [],
    },
    rota: {
      // Heatmap (campos 13-18): os ramos reais do caso, por aderência
      // desc. Sem ramo cadastrado, cai no país único da trilha/cliente —
      // nunca inventa um 2º/3º país.
      pais_principal: String(heatmap[0]?.pais || trilha?.pais || cliente?.pais_interesse || caso.pais || ""),
      aderencia_principal: heatmap[0]?.pct ?? null,
      pais_secundario: String(heatmap[1]?.pais ?? ""),
      aderencia_secundaria: heatmap[1]?.pct ?? null,
      pais_terciario: String(heatmap[2]?.pais ?? ""),
      aderencia_terciaria: heatmap[2]?.pct ?? null,
      hipotese_principal: String(pesquisa?.internal_hypothesis ?? ""),
      status_hipotese: "pendente_validacao",
      resumo_radar: "",
    },
    jornada: {
      etapa_atual: etapa?.rotulo ?? "",
      contexto_resumo: textoProjecao(resumo),
      trilha_origem: textoProjecao(resumo),
      trilha_cidadania: textoProjecao(marco),
      trilha_memoria: textoProjecao(legado),
      jornada_ancestral_1: "",
      jornada_cliente_1: textoProjecao(marco),
      jornada_intersecao_1: "",
      jornada_intersecao_2: "",
    },
    descobertas: achados.map((a) => ({
      titulo: textoProjecao(a).slice(0, 120),
      texto: textoProjecao(a),
      pessoa_relacionada: "",
      tipo_evidencia: "pendente_validacao" as EvidenceStatus,
      destaque: false,
      data: String(a.effective_from ?? a.updated_at ?? ""),
    })),
    documentos: {
      documento_principal: String(docLiberado?.titulo ?? ""),
      pendencia_principal: String(docPendente?.titulo ?? ""),
      status_documental: docLiberado ? "Documento liberado" : docPendente ? "Pendência em aberto" : "",
      documentos_localizados: [],
      documentos_pendentes: [],
      proximas_solicitacoes: [],
    },
    fontes: {
      base_1_url: "",
      base_2_url: "",
      base_3_url: "",
      links_extras: [],
      pasta_documentos_url: "",
      pasta_imagens_url: "",
    },
    alerta: {
      titulo: atualizacao ? textoProjecao(atualizacao).slice(0, 90) : "",
      texto: textoProjecao(atualizacao),
      nivel: "informativo",
      ativo: Boolean(atualizacao),
    },
    conta: {
      produto_atual: String(plano_ ? textoProjecao(plano_) : ""),
      status_jornada: etapa?.rotulo ?? "",
      ultima_atualizacao: String(resumo?.effective_from ?? resumo?.updated_at ?? ""),
      historico: timeline.map((t) => String(t.summary_client_approved ?? "")).filter(Boolean),
      texto_upgrade: "",
    },
    governanca: {
      responsavel_caso: "",
      observacoes_internas: "",
      dados_sensiveis_ocultos: true,
      regra_input_output: "Campo output nunca é digitado pela equipe; é sempre derivado de publicação aprovada.",
    },
  };

  return caseData;
}
