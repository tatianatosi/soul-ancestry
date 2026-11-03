import { semCache } from "@/lib/no-store";
import { linhas } from "@/lib/linhas";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MODULOS_HISTORICOS } from "@/lib/genealogia-modulos";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { normalizarNome } from "@/lib/pessoa-identidade";
import {
  arestasFiliacao,
  auditoriaDaRelacao,
  GERACAO_MAXIMA_LINHAGEM,
  geracaoAscendente,
  validarAderenciaPercentual,
  type PessoaGeracao,
  type Perfil,
  type Relacao,
} from "@/lib/pessoas-linhagens";
import { clienteElegivelParaPerfil, pessoasDoCasoComFallbackNucleo } from "@/lib/pessoa-vinculo";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { exigirPersistenciaConferida } from "@/lib/verificacao-persistencia";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";

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
  // Corte U2 (docs/design-system/de-para-pessoa-unificada.md): vínculo com a
  // Pessoa Canônica (clientes). Coluna nullable, já existe no banco desde a
  // migration 20260906134500 — nunca gravada automaticamente, só quando um
  // humano escolhe explicitamente "vincular a pessoa já cadastrada" na tela.
  "client_id",
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
  // Heatmap de aderência (Ficha Master, campos 14/16/18) — percentual
  // liberado no App em 01/10/2026, migration 20261002120000. CHECK no
  // banco recusa fora de 0-100; nunca gravar com símbolo "%".
  "aderencia_percentual",
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

/**
 * C7 — auditoria da despublicação em cascata (mesmo formato do `auditar` de
 * portal-atendimento). Falha de auditoria não derruba a ação, mas é registrada.
 */
async function auditarCascata(
  supabase: Sb,
  organizationId: string,
  userId: string,
  acao: string,
  entidade: string,
  entidadeId: string,
  metadados: any,
) {
  const { error } = await (supabase as any).from("audit_logs").insert({
    organization_id: organizationId,
    user_id: userId,
    acao,
    entidade,
    entidade_id: entidadeId,
    metadados,
  });
  if (error) console.error("[pos-gravacao] auditoria não gravou", acao, error.message);
}

/** Retira do App a projeção publicada da pessoa deste perfil, pelo caminho oficial de despublicação. */
async function despublicarPessoaDoPerfil(
  supabase: Sb,
  organizationId: string,
  userId: string,
  perfilId: string,
  motivo: string,
): Promise<number> {
  const { data: perfil } = await (supabase as any)
    .from("genealogical_person_profiles")
    .select("case_id, research_person_id")
    .eq("id", perfilId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  const p = perfil as { case_id?: string | null; research_person_id?: string | null } | null;
  if (!p?.case_id || !p.research_person_id) return 0;
  const { despublicarProjecoesDaPessoa } = await import("@/lib/projecao-app-despublicar.server");
  return despublicarProjecoesDaPessoa({
    supabase,
    organizationId,
    userId,
    caseId: p.case_id,
    pessoaId: p.research_person_id,
    motivo,
    auditar: (o, u, a, e, id, m) => auditarCascata(supabase, o, u, a, e, id, m),
  });
}

async function autorizarLeitura(supabase: Sb, userId: string) {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  if (!PAPEIS_LE_DETALHE.includes(papel))
    throw new Error("Seu papel não acessa a ficha genealógica interna.");
  return { organizationId, podeEditar: PAPEIS_EDITA.includes(papel) };
}

async function autorizarEscrita(supabase: Sb, userId: string) {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  if (!PAPEIS_EDITA.includes(papel))
    throw new Error("Seu papel não pode editar pessoas, relações ou linhagens.");
  return organizationId;
}


export type LeituraLinhagemNucleo = {
  linha: {
    id: string;
    nome: string | null;
    tipo: string | null;
    status: string | null;
    proximoMarco: string | null;
    riscoPrincipal: string | null;
  } | null;
  /** G1 = pessoa âncora da linha; sobe pela filiação persistida até G10. */
  geracoes: (PessoaGeracao & { localidade: string | null; clienteId: string | null; ano: string | null })[];
  /** Só arestas de filiação gravadas entre pessoas exibidas (pai → filho). */
  arestas: { pai: string; filho: string }[];
  /** Cônjuges da pessoa âncora (G1) só por relação `conjuge` gravada e não refutada. */
  conjugesAncora: { personId: string; nome: string; status: string }[];
  totalPerfis: number;
};

/** Ano de nascimento só do perfil gravado: data exata ou ano aproximado escrito. */
function anoDoPerfil(p: Perfil | undefined): string | null {
  if (!p) return null;
  const exata = typeof p.nascimento_data === "string" ? p.nascimento_data.match(/^(\d{4})/) : null;
  if (exata) return exata[1]!;
  const aprox = typeof p.nascimento_data_aproximada === "string" ? p.nascimento_data_aproximada.match(/\d{4}/) : null;
  return aprox ? `c. ${aprox[0]}` : null;
}

/**
 * 13/10/2026 — Pessoas & Linhagens (prancha V4) em /nucleos. Leitura pura:
 * diferente de `painelPessoasLinhagens`, não faz backfill de perfis nem
 * nenhuma outra escrita. Só lê perfis, relações e linhas do caso e sobe a
 * filiação persistida a partir da pessoa âncora da primeira linha ativa.
 * Sem âncora, sem gerações — nada é inferido.
 */
export const lerLinhagemDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }): Promise<LeituraLinhagemNucleo> => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await autorizarLeitura(supabase, context.userId as string);
    const org = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);
    const [perfisR, relacoesR, linhasR] = await Promise.all([
      org("genealogical_person_profiles").eq("case_id", data.caseId).is("archived_at", null),
      org("genealogical_relationships").eq("case_id", data.caseId).is("archived_at", null),
      org("lineage_paths").eq("case_id", data.caseId).is("archived_at", null).order("created_at", { ascending: true }),
    ]);
    const perfis = linhas<Perfil>(perfisR as any, "perfis genealógicos do caso");
    const relacoes = linhas<Relacao>(relacoesR as any, "relações genealógicas do caso");
    const linhaFoco = linhas<any>(linhasR as any, "linhas do caso").find((l) => l.pessoa_ancora_id) ?? null;
    const porPessoa = new Map(perfis.map((p) => [p.research_person_id, p]));
    const geracoes = geracaoAscendente(linhaFoco?.pessoa_ancora_id, perfis, relacoes)
      .filter((g) => g.geracao <= GERACAO_MAXIMA_LINHAGEM)
      .map((g) => ({
        ...g,
        localidade: porPessoa.get(g.personId)?.nascimento_localidade ?? null,
        clienteId: porPessoa.get(g.personId)?.client_id ?? null,
        ano: anoDoPerfil(porPessoa.get(g.personId)),
      }));
    const ancora = geracoes.find((g) => g.geracao === 1)?.personId ?? null;
    const conjugesAncora = ancora
      ? relacoes
          .filter(
            (r) =>
              !r.archived_at &&
              r.relation_type === "conjuge" &&
              r.status_pesquisa !== "refutado" &&
              r.status_pesquisa !== "descartado" &&
              (r.person_from_id === ancora || r.person_to_id === ancora),
          )
          .map((r) => (r.person_from_id === ancora ? r.person_to_id : r.person_from_id))
          .filter((id, i, l) => id !== ancora && l.indexOf(id) === i && porPessoa.has(id))
          .map((id) => ({
            personId: id,
            nome: porPessoa.get(id)!.nome_completo ?? "Pessoa não identificada",
            status: porPessoa.get(id)!.status_verificacao ?? "pendente",
          }))
      : [];
    const exibidas = new Set(geracoes.map((g) => g.personId));
    const vistas = new Set<string>();
    const arestas = arestasFiliacao(relacoes)
      .filter((a) => exibidas.has(a.pai) && exibidas.has(a.filho))
      .map((a) => ({ pai: a.pai, filho: a.filho }))
      .filter((a) => {
        const chave = `${a.pai}>${a.filho}`;
        if (vistas.has(chave)) return false;
        vistas.add(chave);
        return true;
      });
    return {
      linha: linhaFoco
        ? {
            id: String(linhaFoco.id),
            nome: linhaFoco.nome_da_linha ?? null,
            tipo: linhaFoco.tipo_da_linha ?? null,
            status: linhaFoco.status ?? null,
            proximoMarco: linhaFoco.proximo_marco ?? null,
            riscoPrincipal: linhaFoco.risco_principal ?? null,
          }
        : null,
      geracoes,
      arestas,
      conjugesAncora,
      totalPerfis: perfis.length,
    };
  });

/** Painel interno completo: pessoas, perfis, variantes, relações, eventos e linhagens. */
export const painelPessoasLinhagens = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, podeEditar } = await autorizarLeitura(
      supabase,
      context.userId as string,
    );
    const org = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);

    const pesquisas = await org("research_cases")
      .eq("case_id", data.caseId)
      .is("archived_at", null);
    const pesquisaIds = linhas<any>(pesquisas, "pesquisas do caso").map((p: any) => p.id as string);

    const pessoas = pesquisaIds.length
      ? await supabase
          .from("research_people")
          .select(
            "id,canonical_name,preferred_display_name,person_status,identity_status,research_case_id,archived_at",
          )
          .eq("organization_id", organizationId)
          .in("research_case_id", pesquisaIds)
          .is("archived_at", null)
      : { data: [] as any[] };

    const listaPessoas = linhas<any>(pessoas as any, "pessoas de pesquisa do caso");
    const personIds = listaPessoas.map((p: any) => p.id as string);

    /*
     * 05/09/2026 — achado real reportado pela Proprietária: a aba "Perfil
     * 360°" (e a árvore, a timeline e as lacunas, que também derivam de
     * genealogical_person_profiles) mostrava "Nenhuma pessoa cadastrada
     * neste caso" mesmo com research_people já tendo Ana, Adair, Alice e
     * Felipe reais para este caso. As duas tabelas nunca foram costuradas:
     * criarPessoaComPerfil cria as duas juntas, mas as 4 pessoas já
     * existiam de antes, sem perfil correspondente. Backfill idempotente:
     * toda pessoa de pesquisa sem perfil ganha um, com o nome real que já
     * existe — nunca um dado inventado.
     */
    if (personIds.length) {
      const perfisExistentes = await supabase
        .from("genealogical_person_profiles")
        .select("research_person_id")
        .is("archived_at", null)
        .eq("organization_id", organizationId)
        .in("research_person_id", personIds);
      const comPerfil = new Set(
        linhas<any>(perfisExistentes, "perfis genealógicos já existentes").map(
          (p: any) => p.research_person_id as string,
        ),
      );
      const semPerfil = listaPessoas.filter((p) => !comPerfil.has(p.id));
      if (semPerfil.length) {
        await supabase.from("genealogical_person_profiles").insert(
          semPerfil.map((p) => ({
            organization_id: organizationId,
            case_id: data.caseId,
            research_person_id: p.id,
            nome_completo:
              p.canonical_name || p.preferred_display_name || "Pessoa sem nome registrado",
          })),
        );
      }
    }

    const [
      perfis,
      variantes,
      relacoes,
      eventos,
      linhagens,
      evidencias,
      fontes,
      nucleos,
      trilhas,
      caso,
    ] = await Promise.all([
      org("genealogical_person_profiles")
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: true }),
      personIds.length
        ? supabase
            .from("name_variants")
            .select("*")
            .eq("organization_id", organizationId)
            .in("person_id", personIds)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [] as any[] }),
      org("genealogical_relationships")
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: true }),
      org("genealogical_events")
        .eq("case_id", data.caseId)
        .order("start_date", { ascending: true }),
      org("lineage_paths").eq("case_id", data.caseId).order("created_at", { ascending: true }),
      /*
       * 09/10/2026 — bug medido e reportado pela Proprietária: os seletores
       * de "Evidência de suporte" e "Fonte" liam a ORGANIZAÇÃO INTEIRA, sem
       * filtrar pelo caso. Resultado medido no caso da Ana: apareciam as 4
       * evidências "DEMO —" de outro caso (3f2b7d10…) ao lado da única
       * evidência real dela ("Certidão de casamento Silveira 1912"). Isso
       * não era só ruído de lista: era conteúdo de outro caso dentro da
       * ficha deste, e dava para vincular a evidência de um caso à pessoa
       * de outro.
       *
       * Passa a filtrar pelas pesquisas DESTE caso (`pesquisaIds`, já
       * resolvido acima). Sem pesquisa, a lista vem vazia — vazio honesto,
       * nunca a lista da organização.
       */
      pesquisaIds.length
        ? supabase
            .from("research_evidence_items")
            .select("id,title,evidence_status")
            .eq("organization_id", organizationId)
            .in("research_case_id", pesquisaIds)
            .is("archived_at", null)
        : Promise.resolve({ data: [] as any[] }),
      pesquisaIds.length
        ? supabase
            .from("research_sources")
            .select("id,title,source_type,source_status")
            .eq("organization_id", organizationId)
            .in("research_case_id", pesquisaIds)
            .is("archived_at", null)
        : Promise.resolve({ data: [] as any[] }),
      org("nucleos_familiares").eq("case_id", data.caseId).is("archived_at", null),
      supabase
        .from("citizenship_tracks")
        .select("id,code,pais,via_preliminar")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("crm_casos")
        .select("id,codigo,titulo,pais")
        .eq("id", data.caseId)
        .maybeSingle(),
    ]);

    const modulos = await Promise.all(
      MODULOS_HISTORICOS.map(async (m) => {
        const r = await org(m.tabela)
          .eq("case_id", data.caseId)
          .order("created_at", { ascending: true });
        return [m.tabela, linhas<any>(r as any, `módulo histórico ${m.tabela}`)] as const;
      }),
    );

    /*
     * Corte U2 — candidatos para o seletor "Vincular a pessoa já cadastrada
     * (opcional)": reaproveita a função canônica pessoasDoCasoComFallbackNucleo
     * (mesma usada por Caso 360, Pesquisa e Documentos — CA19) em vez de ler
     * case_members cru, para não recriar um 5º leitor da tabela. Só pessoas
     * já ligadas a este caso (com fallback de núcleo), nunca a organização
     * inteira. Sugestão, não fusão — o vínculo em
     * genealogical_person_profiles.client_id só é gravado se um humano
     * escolher explicitamente.
     */
    const membrosDoCaso = await pessoasDoCasoComFallbackNucleo(supabase, data.caseId);
    const clienteIdsVistos = new Set<string>();
    const clientesDoCaso = membrosDoCaso
      .filter((m: any) => m.cliente_id && !clienteIdsVistos.has(m.cliente_id) && clienteIdsVistos.add(m.cliente_id))
      .map((m: any) => ({ id: m.cliente_id as string, nome: m.nome as string }));

    return {
      podeEditar,
      clientesDoCaso,
      modulos: Object.fromEntries(modulos) as Record<string, any[]>,
      caso: (caso as any).data ?? null,
      pesquisas: linhas<any>(pesquisas, "pesquisas do caso"),
      pessoas: listaPessoas,
      perfis: linhas<any>(perfis, "perfis genealógicos do caso"),
      variantes: linhas<any>(variantes as any, "variantes de nome do caso"),
      relacoes: linhas<any>(relacoes, "relações genealógicas do caso"),
      eventos: linhas<any>(eventos, "eventos genealógicos do caso"),
      linhagens: linhas<any>(linhagens, "caminhos de linhagem do caso"),
      evidencias: linhas<any>(evidencias as any, "evidências de pesquisa"),
      fontes: linhas<any>(fontes as any, "fontes de pesquisa"),
      nucleos: linhas<any>(nucleos, "núcleos familiares do caso"),
      trilhas: linhas<any>(trilhas as any, "trilhas de cidadania"),
    };
  });

/**
 * Cria a pessoa no registro de pesquisa e o perfil genealógico 360° em um único
 * passo. Nada é inferido: apenas o nome é obrigatório.
 *
 * Idempotente por nome dentro da mesma pesquisa: "Ana Luiza Gomes Silveira
 * Rodrigues" clicado duas vezes (duplo clique, nova tentativa após demora)
 * não cria uma segunda pessoa nem um segundo perfil — reaproveita o que já
 * existe. Comparação por nome normalizado (sem acento/pontuação), nunca
 * decide que são pessoas diferentes por uma vírgula ou maiúscula a mais.
 */
export const criarPessoaComPerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { caseId: string; pesquisaId: string; valores: Record<string, unknown> }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const valores = filtrar("genealogical_person_profiles", data.valores);
    const nome = String(valores["nome_completo"] ?? "").trim();
    if (!data.pesquisaId) {
      throw new Error(
        "Este caso ainda não tem registro de pesquisa. Crie a pesquisa do caso antes de cadastrar pessoas.",
      );
    }

    const nomeNormalizado = normalizarNome(nome);
    const existentes = await supabase
      .from("research_people")
      .select("id,canonical_name")
      .eq("organization_id", organizationId)
      .eq("research_case_id", data.pesquisaId)
      .is("archived_at", null);
    if (existentes.error) throw new Error(existentes.error.message);
    const pessoaExistente = (nomeNormalizado
      ? ((existentes.data ?? []) as any[]).find(
          (p) => normalizarNome(p.canonical_name) === nomeNormalizado,
        )
      : null) as { id: string } | null | undefined;

    let pessoaId: string;
    if (pessoaExistente) {
      pessoaId = pessoaExistente.id;
    } else {
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
      pessoaId = pessoa.data.id as string;
    }

    const perfilExistente = await supabase
      .from("genealogical_person_profiles")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("research_person_id", pessoaId)
      .is("archived_at", null)
      .maybeSingle();
    if (perfilExistente.error) throw new Error(perfilExistente.error.message);
    if (perfilExistente.data) {
      return {
        id: perfilExistente.data.id as string,
        research_person_id: pessoaId,
        reaproveitado: true,
      };
    }

    const perfil = await supabase
      .from("genealogical_person_profiles")
      .insert({
        ...valores,
        case_id: data.caseId,
        organization_id: organizationId,
        research_person_id: pessoaId,
      })
      .select("*")
      .maybeSingle();
    if (perfil.error) throw new Error(perfil.error.message);
    return {
      id: perfil.data.id as string,
      research_person_id: pessoaId,
      reaproveitado: Boolean(pessoaExistente),
    };
  });

/**
 * Gravação genérica das entidades G-02, com confirmação de linha afetada,
 * releitura independente da gravação e comparação campo a campo. O retorno
 * só é "salvo" quando o valor relido do banco bate com o que foi enviado —
 * a UPDATE/INSERT devolver a própria linha não é, por si, confirmação.
 */
export const salvarRegistroG02 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { tabela: TabelaG02; id?: string; caseId?: string; valores: Record<string, unknown> }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    if (!TABELAS[data.tabela]) throw new Error("Entidade não reconhecida na ficha genealógica.");
    const valores = filtrar(data.tabela, data.valores);
    if (data.caseId && (TABELAS[data.tabela] as string[]).includes("case_id"))
      valores["case_id"] = data.caseId;

    // Heatmap de aderência (campos 14/16/18 da Ficha Master): validação do
    // lado da aplicação, com mensagem clara, antes de depender só do CHECK
    // do banco (lineage_paths_aderencia_percentual_ck).
    if (data.tabela === "lineage_paths" && "aderencia_percentual" in valores) {
      valores["aderencia_percentual"] = validarAderenciaPercentual(valores["aderencia_percentual"]);
    }

    /*
      24/09/2026 — Perfil genealógico é separado e opcional; o vínculo com a
      Pessoa Canônica só vale para quem já está no caso (antes a regra só
      existia no seletor da tela). Nunca funde: grava só o ponteiro
      client_id, e vincular/desvincular fica auditado.
    */
    const mexeNoVinculo = data.tabela === "genealogical_person_profiles" && "client_id" in valores;
    let clienteAnterior: string | null = null;
    let caseDoPerfil: string | null = (data.caseId as string | undefined) ?? null;
    if (mexeNoVinculo) {
      if (data.id) {
        const { data: atual } = await supabase
          .from("genealogical_person_profiles")
          .select("client_id, case_id")
          .eq("id", data.id)
          .eq("organization_id", organizationId)
          .maybeSingle();
        clienteAnterior = ((atual as any)?.client_id as string | null) ?? null;
        caseDoPerfil = caseDoPerfil ?? (((atual as any)?.case_id as string | null) ?? null);
      }
      const novoCliente = (valores["client_id"] as string | null) || null;
      valores["client_id"] = novoCliente;
      if (novoCliente) {
        if (!caseDoPerfil) throw new Error("Perfil sem caso: não há como conferir se a pessoa pertence a ele.");
        const pessoas = await pessoasDoCasoComFallbackNucleo(supabase, caseDoPerfil);
        if (!clienteElegivelParaPerfil(novoCliente, pessoas)) {
          throw new Error("Só é possível vincular o perfil a uma pessoa cadastrada que já faz parte deste caso.");
        }
      }
    }

    /*
     * Fio da Pessoa Unificada (05/10/2026). Medido antes: quando a equipe
     * vinculava o perfil à pessoa canônica, nada propagava esse vínculo para
     * `research_people` — e `research_people.family_member_id`, a coluna que
     * liga a pessoa de pesquisa ao membro do caso, não era escrita por
     * NENHUMA linha de código do repositório. Resultado: o vínculo era
     * registrado e o fio continuava arrebentado no elo seguinte.
     *
     * Aqui o vínculo passa a propagar sozinho, compondo duas decisões humanas
     * já registradas: o perfil diz qual é a pessoa canônica; `case_members`
     * diz qual é o membro dela neste caso. Não é inferência por nome — é a
     * composição do que alguém já decidiu. Composição ambígua (zero ou mais de
     * um membro para a mesma pessoa cadastrada) não grava nada; desvincular o
     * perfil limpa o ponteiro, para não ficar apontando para quem saiu.
     */
    const propagarFioParaPesquisa = async (perfilId: string) => {
      if (!mexeNoVinculo || !caseDoPerfil) return;
      const novoCliente = (valores["client_id"] as string | null) ?? null;
      const { data: pessoaPesquisa } = await supabase
        .from("research_people")
        .select("id,family_member_id,genealogical_person_profile_id")
        .is("archived_at", null)
        .eq("organization_id", organizationId)
        .eq("genealogical_person_profile_id", perfilId)
        .maybeSingle();
      const alvo = (pessoaPesquisa as any) ?? null;
      if (!alvo?.id) return;

      if (!novoCliente) {
        if (!alvo.family_member_id) return;
        await gravarComVerificacao({
          supabase,
          tabela: "research_people",
          id: String(alvo.id),
          organizationId,
          userId: context.userId as string,
          payload: { family_member_id: null },
        });
        return;
      }

      const { data: membros } = await supabase
        .from("case_members")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("case_id", caseDoPerfil)
        .eq("cliente_id", novoCliente)
        .is("archived_at", null);
      const candidatos = ((membros ?? []) as { id: string }[]).map((m) => String(m.id));
      if (candidatos.length !== 1) {
        /*
         * Silêncio é pior que lacuna: sem exatamente um membro ativo para esta
         * pessoa cadastrada, não há composição única e nada é gravado — mas
         * fica registrado, para o vínculo não parecer completo quando não
         * está. Zero acontece quando a composição da pessoa vive no núcleo e o
         * membro duplicado da ficha foi arquivado pela reconciliação; mais de
         * um é duplicidade a resolver antes.
         */
        await registrarAuditoria(supabase, {
          organization_id: organizationId,
          user_id: context.userId as string,
          acao: "fio_membro_nao_derivado",
          entidade: "research_people",
          entidade_id: String(alvo.id),
          metadados: {
            motivo:
              candidatos.length === 0
                ? "Nenhum membro ativo da ficha do caso para esta pessoa cadastrada: a composição dela vive no núcleo. research_people.family_member_id é FK de case_members, então o elo não fecha sem restaurar o membro ou estender a referência."
                : `${candidatos.length} membros ativos da ficha do caso para a mesma pessoa cadastrada: duplicidade a resolver antes de derivar o vínculo.`,
            case_id: caseDoPerfil,
            client_id: novoCliente,
            regra: "Composição ambígua ou ausente nunca é gravada por conta própria.",
          },
        });
        return;
      }
      if (alvo.family_member_id === candidatos[0]) return;
      await gravarComVerificacao({
        supabase,
        tabela: "research_people",
        id: String(alvo.id),
        organizationId,
        userId: context.userId as string,
        payload: { family_member_id: candidatos[0] },
      });
    };

    const registrarVinculo = async (perfilId: string) => {
      if (!mexeNoVinculo) return;
      const novo = (valores["client_id"] as string | null) ?? null;
      if (novo === clienteAnterior) return;
      await propagarFioParaPesquisa(perfilId);
      await registrarAuditoria(supabase, {
        organization_id: organizationId,
        entidade: "genealogical_person_profiles",
        entidade_id: perfilId,
        acao: novo ? "perfil_genealogico_vinculado_a_pessoa" : "perfil_genealogico_desvinculado",
        user_id: context.userId as string,
        valores_anteriores: { client_id: clienteAnterior },
        valores_posteriores: { client_id: novo },
      });
      if (caseDoPerfil) {
        await registrarTimelineCaso(supabase, {
          organizationId,
          caseId: caseDoPerfil,
          eventType: "caso",
          title: novo ? "Perfil genealógico vinculado à pessoa cadastrada" : "Perfil genealógico desvinculado da pessoa",
          sourceEntityType: "genealogical_person_profiles",
          sourceEntityId: perfilId,
          userId: context.userId as string,
        });
      }
    };

    /*
     * 30/10/2026 — resgate da PR #32. Desde 24/10 os helpers compartilhados
     * só registram aviso quando a releitura diverge, e a tela mostrava "Salvo
     * e confirmado no banco" mesmo assim. Na ficha genealógica a regra volta
     * a ser estrita: releitura vazia ou valor diferente do enviado é erro,
     * antes de propagar vínculo, auditoria ou linha do tempo.
     */
    // C6: relação — leitura do estado anterior para auditar publicação/tipo.
    const ehRelacao = data.tabela === "genealogical_relationships";
    const auditarRelacao = async (
      relacaoId: string,
      anterior: { relation_type?: string | null; client_visibility?: string | null } | null,
      caseDaRelacao: string | null,
    ) => {
      if (!ehRelacao) return;
      for (const m of auditoriaDaRelacao(anterior, valores as any)) {
        await registrarAuditoria(supabase, {
          organization_id: organizationId,
          user_id: context.userId as string,
          entidade: "genealogical_relationships",
          entidade_id: relacaoId,
          acao: m.acao,
          valores_anteriores: { valor: m.de },
          valores_posteriores: { valor: m.para },
          metadados: { case_id: caseDaRelacao },
        });
      }
    };

    let relacaoAnterior: any = null;
    if (ehRelacao && data.id) {
      const { data: atual } = await supabase
        .from("genealogical_relationships")
        .select("relation_type, client_visibility, case_id")
        .eq("id", data.id)
        .eq("organization_id", organizationId)
        .maybeSingle();
      relacaoAnterior = (atual as any) ?? null;
    }

    // C7: rebaixar a visibilidade do perfil (qualquer valor diferente de 'aprovada')
    // retira a pessoa do App ANTES de gravar — fail-closed: se a despublicação
    // falhar, o erro propaga e a visibilidade não muda.
    if (
      data.id &&
      data.tabela === "genealogical_person_profiles" &&
      "client_visibility" in valores &&
      valores["client_visibility"] !== "aprovada"
    ) {
      await despublicarPessoaDoPerfil(
        supabase,
        organizationId,
        context.userId as string,
        data.id,
        `Visibilidade do perfil rebaixada para "${String(valores["client_visibility"] ?? "interna")}".`,
      );
    }

    if (data.id) {
      const r = await gravarComVerificacao({
        supabase,
        tabela: data.tabela,
        id: data.id,
        organizationId,
        userId: context.userId as string,
        payload: valores,
      });
      exigirPersistenciaConferida(valores, r.registro);
      await registrarVinculo(data.id);
      await auditarRelacao(data.id, relacaoAnterior, relacaoAnterior?.case_id ?? data.caseId ?? null);
      return { registro: r.registro } as any;
    }

    const r = await inserirComVerificacao({
      supabase,
      tabela: data.tabela,
      organizationId,
      userId: context.userId as string,
      payload: valores,
    });
    exigirPersistenciaConferida(valores, r.registro);
    await registrarVinculo(r.id);
    await auditarRelacao(r.id, null, (valores["case_id"] as string | null) ?? data.caseId ?? null);
    return { registro: r.registro } as any;
  });

/** Sem exclusão física: somente arquivamento com motivo. */
export const arquivarRegistroG02 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tabela: TabelaG02; id: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    if (!TABELAS[data.tabela]) throw new Error("Entidade não reconhecida na ficha genealógica.");
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const temCaseId = (TABELAS[data.tabela] as string[]).includes("case_id");
    // C7: arquivar o perfil de uma pessoa retira a pessoa do App (despublica a
    // projeção, com motivo e auditoria) antes de arquivar; falha propaga.
    if (data.tabela === "genealogical_person_profiles") {
      await despublicarPessoaDoPerfil(
        supabase,
        organizationId,
        context.userId as string,
        data.id,
        `Perfil arquivado: ${motivo}`,
      );
    }
    const r = await supabase
      .from(data.tabela)
      .update({ archived_at: new Date().toISOString(), archive_reason: motivo })
      .eq("id", data.id)
      .select(temCaseId ? "id, case_id" : "id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data)
      throw new Error("Nada foi gravado: registro fora da sua organização ou sem permissão.");
    const caseId = temCaseId ? ((r.data as { case_id?: string }).case_id ?? null) : null;
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: `Registro arquivado (${data.tabela})`,
        summaryInternal: motivo,
        sourceEntityType: data.tabela,
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });
