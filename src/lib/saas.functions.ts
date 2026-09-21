import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { exigirGate } from "@/lib/escopo-conferencia.server";
import type { AcaoGateada } from "@/lib/gates-formalizacao";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gravarComVerificacao, linhasDeLog } from "@/lib/persistencia.server";
import { exigirProximaAcaoCompleta } from "@/lib/proxima-acao-regras";
import { exigirProximaAcaoOperavel } from "@/lib/proxima-acao-startup";
import { proprietariaOperando } from "@/lib/autoridade.server";
import { nomeResponsavelSessao } from "@/lib/cadeia-operacional.server";
import { nomeResponsavelPadrao } from "@/lib/responsavel-padrao";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import {
  validarEstadoInicial,
  validarRegrasNegocio,
  validarTransicao,
} from "@/lib/estados";

/** Campos que compõem a Próxima ação (validados em conjunto no servidor). */
const CAMPOS_PROXIMA_ACAO = [
  "proxima_acao_codigo",
  "proxima_acao_justificativa",
  "prazo_proxima_acao",
  "target_audience",
  "visibility",
  "suggested_channel",
  "requires_human_approval",
];


/**
 * Camada de acesso do SaaS Clube Ancestral.
 *
 * Regras invioláveis (aplicadas aqui e reforçadas por RLS/triggers no banco):
 * - a organização NUNCA vem da interface: é derivada do usuário autenticado;
 * - toda leitura/escrita filtra organization_id no banco;
 * - não existe exclusão física: apenas arquivamento com motivo e responsável;
 * - ativação de caso é validada no servidor/banco;
 * - toda alteração relevante gera trilha de auditoria.
 */

export type Papel =
  | "admin"
  | "operacoes"
  | "pesquisador"
  | "comercial"
  | "financeiro"
  | "leitura";

export type Entidade =
  | "leads"
  | "clientes"
  | "client_contacts"
  | "crm_casos"
  | "case_members"
  | "evidencias"
  | "tarefas"
  | "documents"
  | "consent_records"
  | "proposals"
  | "invoices"
  | "payments"
  | "eventos_financeiros";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

const ENTIDADES: Entidade[] = [
  "leads",
  "clientes",
  "client_contacts",
  "crm_casos",
  "case_members",
  "evidencias",
  "tarefas",
  "documents",
  "consent_records",
  "proposals",
  "invoices",
  "payments",
  "eventos_financeiros",
];


const CAMPOS_PERMITIDOS: Record<Entidade, string[]> = {
  leads: ["nome", "email", "telefone", "origem", "estagio", "pais_interesse", "observacoes"],
  clientes: [
    "nome",
    "nome_social",
    "email",
    "telefone",
    "documento",
    "origem",
    "pais_interesse",
    "status",
    "status_comercial",
    "classificacao",
    "observacoes",
  ],
  client_contacts: ["client_id", "nome", "relacao", "email", "telefone", "principal", "observacoes"],
  crm_casos: [
    "cliente_id",
    // "codigo" e "modelo" não são graváveis: identificador canônico é gerado pelo servidor e imutável (G-01).
    "titulo",

    "tipo_servico",
    "fase",
    "responsavel_id",
    "prioridade",
    "data_entrada",
    "resumo",
    "risco",
    "proxima_acao",
    "pais",
    "via",
    "status",
    "hipotese_elegibilidade",
    "contrato_assinado",
    "pagamento_confirmado",
    "documentos_minimos_ok",
    // Ficha operacional canônica
    "eixo_comercial",
    "eixo_formalizacao",
    "status_caso_derivado",
    "responsavel_principal",
    "cargo_responsavel_principal",
    "supervisora_do_caso",
    "colaboradores_do_caso",
    "data_confirmacao_formal_proposta",
    "data_entrada_caso",
    "proposta_referencia_interna",
    "proposta_url_interna",
    "data_proposta",
    "escopo_incluido_resumido",
    "escopo_excluido_resumido",
    "condicao_comercial_interna_pendente",
    "citizenship_track_id",
    "pais_linha_prioritaria",
    "via_juridica_preliminar",
    "status_via",
    "hipotese_trabalho_interna",
    "status_radar",
    "radar_aderencia_percentual",
    "revisao_humana_juridica",
    "riscos_identificados",
    "resumo_interno",
    "brief_interno",
    "origem_brief",
    "link_origem_interna",
    "proxima_acao_codigo",
    "proxima_acao_justificativa",
    // "alias_historico" migrou para case_aliases (histórico imutável, somente leitura na ficha).
    // Jornada, comunicação e alertas
    "proposta_id_origem",
    "marcos_gerais_da_proposta",
    "sinal_aderencia_preliminar",
    "confianca_triagem",
    "risco_observacao_interna",
    "prazo_proxima_acao",
    "target_audience",
    "visibility",
    "suggested_channel",
    "requires_human_approval",
    "communication_status",
    "alert_status",
    "dossie_mae_referencia",
    "case_service_id",
    // Prompt 05 — eixos independentes e próxima ação completa
    "situacao_financeira",
    "situacao_operacional",
    "proxima_acao_responsavel",
    "proxima_acao_dependencia",
    "proxima_acao_criterio_conclusao",
    "data_prevista_contrato",
    "data_prevista_pagamento",
    "data_prevista_onboarding",
  ],
  case_members: [
    "case_id",
    "nome",
    "parentesco",
    "data_nascimento",
    "local_nascimento",
    "observacoes_protegidas",
    "papel_no_caso",
    "representante_legal",
    "cpf",
    "rg",
    "telefone",
    "email",
    "endereco",
    "cep",
    "profissao",
    "estado_civil",
    "status_cadastral",
    "documentos_pendentes",
    "consentimentos",
    "contratante",
    "titular",
    "dependente",
    "representa_pessoa_id",
    "fonte_origem_dado",
    "data_verificacao_dado",
  ],

  evidencias: [
    "caso_id",
    "titulo",
    "tipo",
    "status",
    "visibilidade",
    "descricao",
    "storage_path",
    "pessoa_relacionada",
    "local_relacionado",
    "periodo",
    "fonte",
    "grau_confianca",
    "observacao",
  ],
  tarefas: [
    "caso_id",
    "titulo",
    "descricao",
    "tipo",
    "responsavel_id",
    "prioridade",
    "status",
    "prazo",
    "bloqueio",
    "motivo_bloqueio",
  ],
  documents: ["case_id", "client_id", "titulo", "tipo", "storage_path", "status", "liberado_cliente", "observacoes"],
  consent_records: [
    "client_id",
    "tipo_consentimento",
    "versao_texto",
    "status",
    "coletado_em",
    "evidencia_consentimento",
    "revogado_em",
  ],
  proposals: [
    "lead_id",
    "client_id",
    "versao",
    "status",
    "valor",
    "moeda",
    "escopo",
    "validade",
    "enviada_em",
    "aprovada_em",
    "recusada_em",
  ],
  invoices: [
    "client_id",
    "case_id",
    "contract_id",
    "service_order_id",
    "numero",
    "valor",
    "moeda",
    "vencimento",
    "status",
    "referencia_externa",
    "conciliacao_status",
  ],
  payments: [
    "invoice_id",
    "valor",
    "moeda",
    "vencimento",
    "pago_em",
    "metodo",
    "status",
    "referencia_externa",
    "conciliacao_status",
  ],
  eventos_financeiros: ["caso_id", "tipo", "descricao", "valor", "moeda", "status", "vencimento"],
};


const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Colunas com NOT NULL + default: string vazia é ignorada em vez de virar null. */
const NAO_NULAVEIS = new Set([
  "eixo_comercial",
  "eixo_formalizacao",
  "responsavel_principal",
  "cargo_responsavel_principal",
  "supervisora_do_caso",
  "colaboradores_do_caso",
  "riscos_identificados",
  "status_radar",
  "revisao_humana_juridica",
  "condicao_comercial_interna_pendente",
  "status_cadastral",
  "titulo",
  "nome",
  "status",
]);

const BLINDADOS = new Set(["organization_id", "demo", "archived_at", "archived_by", "id", "created_at", "updated_at"]);

/**
 * Filtra o payload para as colunas persistíveis.
 * Retorna também os campos descartados: enviar um campo não persistível
 * costumava ser ignorado em silêncio — a tela dizia "salvo" e o banco não mudava.
 */
function sanitizar(entidade: Entidade, dados: Record<string, unknown>) {
  const permitidos = CAMPOS_PERMITIDOS[entidade];
  const saida: Record<string, unknown> = {};
  const ignorados: string[] = [];

  for (const chave of Object.keys(dados)) {
    if (dados[chave] === undefined) continue;
    if (BLINDADOS.has(chave)) continue;
    if (!permitidos.includes(chave)) ignorados.push(chave);
  }

  for (const chave of permitidos) {
    const valor = dados[chave];
    if (valor === undefined) continue;
    // Campo esvaziado precisa gravar null — antes a alteração era descartada em silêncio.
    if (valor === "" || valor === null) {
      if (NAO_NULAVEIS.has(chave)) continue;
      saida[chave] = null;
      continue;
    }
    saida[chave] = valor;
  }

  // campos de referência só aceitam identificador válido (nunca nome digitado)
  for (const chave of Object.keys(saida)) {
    if (!chave.endsWith("_id")) continue;
    const valor = saida[chave];
    if (valor === null) continue;
    if (typeof valor !== "string" || !UUID_RE.test(valor.trim())) {
      throw new Error(
        `Campo "${chave}" precisa do identificador do registro relacionado, não de um texto livre.`,
      );
    }
    saida[chave] = valor.trim();
  }
  return { saida, ignorados };
}


type SupabaseCliente = { from: (t: string) => any; rpc: (f: string, a?: unknown) => any };

async function resolverOrganizacao(supabase: SupabaseCliente, userId?: string) {
  // Uma organização com mais de uma pessoa devolve várias linhas visíveis: por
  // isso a consulta é sempre restringida à própria pessoa e limitada a 1.
  let consulta = supabase
    .from("organization_members")
    .select("organization_id")
    .is("archived_at", null);
  if (userId) consulta = consulta.eq("user_id", userId);
  const membro = await consulta.limit(1).maybeSingle();
  if (membro.data?.organization_id) return membro.data.organization_id as string;
  // Quem já possui acesso de equipe (pendente/suspenso/revogado) nunca cria nova organização.
  const staff = await supabase.from("staff_access").select("id,status").limit(1).maybeSingle();
  if (staff.data) throw new Error("Acesso não autorizado.");
  const criada = await supabase.rpc("bootstrap_minha_organizacao", {});
  if (criada.error) throw new Error(criada.error.message);
  return criada.data as string;

}


export const getContexto = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as SupabaseCliente;

    // Autorização interna vem sempre de staff_access (nunca do front-end).
    const staff = await supabase
      .from("staff_access")
      .select("id,role,status,organization_id,full_name")
      .eq("auth_user_id", context.userId)
      .is("archived_at", null)
      .maybeSingle();

    if (staff.data && staff.data.status !== "active") {
      return {
        userId: context.userId as string,
        organizationId: null,
        organizacao: null,
        perfil: null,
        papeis: [] as Papel[],
        staff: { status: staff.data.status as string, papel: staff.data.role as Papel },
      };
    }

    // staff_access é a fonte canônica do vínculo interno. Não refaça a
    // resolução pela membership quando o acesso ativo já identifica a org:
    // políticas de leitura transitórias não podem transformar admin em
    // "sem permissão" durante a montagem do contexto.
    const organizationId = staff.data?.organization_id
      ? (staff.data.organization_id as string)
      : await resolverOrganizacao(supabase, context.userId as string);

    const [org, perfil, papeis] = await Promise.all([
      supabase.from("organizations").select("id,nome,slug,demo").eq("id", organizationId).maybeSingle(),
      supabase.from("profiles").select("id,nome,email").eq("id", context.userId).maybeSingle(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("organization_id", organizationId)
        .eq("user_id", context.userId),
    ]);

    // Para a equipe interna, staff_access é a fonte canônica da autorização.
    // A leitura de user_roles continua compondo o contexto, mas uma resposta
    // vazia transitória de RLS não pode retirar o papel já validado do staff e
    // expulsar a proprietária durante reload, renovação do token ou nova aba.
    const papeisPersistidos = ((papeis.data ?? []) as { role: Papel }[]).map((p) => p.role);
    const papeisEfetivos = staff.data?.status === "active"
      ? Array.from(new Set<Papel>([staff.data.role as Papel, ...papeisPersistidos]))
      : papeisPersistidos;

    return {
      userId: context.userId as string,
      organizationId: organizationId as string | null,
      organizacao: (org.data ?? null) as { id: string; nome: string; slug: string; demo: boolean } | null,
      perfil: (perfil.data ?? null) as { id: string; nome: string | null; email: string | null } | null,
      papeis: papeisEfetivos,
      staff: staff.data
        ? { status: staff.data.status as string, papel: staff.data.role as Papel }
        : { status: "active", papel: "admin" as Papel },
    };
  });


export const listarRegistros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entidade: Entidade; incluirArquivados?: boolean }) => {
    if (!ENTIDADES.includes(data.entidade)) throw new Error("Entidade inválida.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    let q = supabase
      .from(data.entidade)
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });
    if (!data.incluirArquivados) q = q.is("archived_at", null);
    const { data: linhas, error } = await q;
    if (error) throw new Error(error.message);
    return (linhas ?? []) as Linha[];
  });

export const criarRegistro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entidade: Entidade; dados: Record<string, unknown> }) => {
    if (!ENTIDADES.includes(data.entidade)) throw new Error("Entidade inválida.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const livre = await proprietariaOperando(supabase, context.userId as string);
    const responsavelNome = nomeResponsavelPadrao(
      await nomeResponsavelSessao(supabase, organizationId, context.userId as string),
    );
    const payload = {
      ...sanitizar(data.entidade, data.dados).saida,
      organization_id: organizationId,
      created_by: context.userId,
      updated_by: context.userId,
    } as Record<string, unknown>;
    if (data.entidade === "crm_casos") {
      if (!payload["responsavel_id"]) payload["responsavel_id"] = context.userId;
      if (!payload["responsavel_principal"] || String(payload["responsavel_principal"]).trim() === "") {
        payload["responsavel_principal"] = responsavelNome;
      }
    }
    if (data.entidade === "tarefas" && !payload["responsavel_id"]) {
      payload["responsavel_id"] = context.userId;
    }
    validarEstadoInicial(data.entidade, payload);
    validarRegrasNegocio(data.entidade, payload, { livreProprietaria: livre });

    // Idempotência (achado de 09/09/2026, rodada de limpeza pré-Perfil 360):
    // este CRUD genérico atende a tela /tarefas sem a proteção que
    // salvarTarefa (ops.functions.ts) já tem — reabrir um modal ou duas abas
    // podia criar duas tarefas idênticas. Mesma regra: caso_id + título +
    // status aberto reaproveita em vez de duplicar.
    const payloadGenerico = payload;
    if (data.entidade === "crm_casos") {
      if (!payloadGenerico["cliente_id"] || String(payloadGenerico["cliente_id"]).trim() === "") {
        throw new Error("Caso operacional exige cliente vinculado.");
      }
      if (!payloadGenerico["tipo_servico"] || String(payloadGenerico["tipo_servico"]).trim() === "") {
        throw new Error("Caso operacional exige tipo de serviço.");
      }
    }
    if (data.entidade === "tarefas") {
      if (!payloadGenerico["caso_id"] || String(payloadGenerico["caso_id"]).trim() === "") {
        throw new Error("Tarefa operacional exige caso vinculado.");
      }
    }
    if (data.entidade === "tarefas" && payloadGenerico["caso_id"] && payloadGenerico["titulo"]) {
      const janela = new Date(Date.now() - 60_000).toISOString();
      const { data: existente } = await supabase
        .from("tarefas")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("caso_id", payloadGenerico["caso_id"] as string)
        .eq("titulo", payloadGenerico["titulo"] as string)
        .not("status", "in", "(concluida,cancelada)")
        .is("archived_at", null)
        .gte("created_at", janela)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existente?.id) return { id: existente.id as string };
    }

    const { data: linha, error } = await supabase.from(data.entidade).insert(payload).select("id").maybeSingle();
    if (error) throw new Error(error.message);
    const novoId = linha?.id as string | undefined;
    if (novoId && data.entidade === "crm_casos") {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: novoId,
        eventType: "caso",
        title: "Caso aberto",
        summaryInternal: String(payloadGenerico["titulo"] ?? novoId),
        sourceEntityType: "crm_casos",
        sourceEntityId: novoId,
        userId: context.userId as string,
        nextAction: typeof payloadGenerico["proxima_acao"] === "string" ? payloadGenerico["proxima_acao"] : null,
      });
    }
    if (novoId && data.entidade === "tarefas" && payloadGenerico["caso_id"]) {
      const bloqueada = payloadGenerico["status"] === "bloqueada";
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: String(payloadGenerico["caso_id"]),
        eventType: bloqueada ? "pendencia" : "tarefa",
        title: bloqueada ? "Pendência/bloqueio registrado" : "Tarefa criada",
        summaryInternal: String(payloadGenerico["titulo"] ?? ""),
        sourceEntityType: "tarefas",
        sourceEntityId: novoId,
        bloqueio: bloqueada,
        userId: context.userId as string,
      });
    }
    return { id: novoId };
  });

export const atualizarRegistro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entidade: Entidade; id: string; dados: Record<string, unknown> }) => {
    if (!ENTIDADES.includes(data.entidade)) throw new Error("Entidade inválida.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const livre = await proprietariaOperando(supabase, context.userId as string);
    const responsavelNome = nomeResponsavelPadrao(
      await nomeResponsavelSessao(supabase, organizationId, context.userId as string),
    );

    const atual = await supabase
      .from(data.entidade)
      .select("*")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!atual.data) throw new Error("Registro não encontrado nesta organização.");
    if (atual.data["archived_at"]) throw new Error("Registro arquivado não pode ser editado.");

    const { saida: alteracoesBrutas, ignorados } = sanitizar(data.entidade, data.dados);
    const alteracoes = { ...alteracoesBrutas } as Record<string, unknown>;
    const anterior = atual.data as Record<string, unknown>;
    let combinado = { ...anterior, ...alteracoes };
    validarTransicao(data.entidade, anterior, alteracoes);
    validarRegrasNegocio(data.entidade, combinado, { livreProprietaria: livre });

    // Gates de formalização: nenhuma transição de eixo pode ser liberada pela
    // interface — a avaliação roda aqui, no servidor, e registra a tentativa.
    if (data.entidade === "crm_casos" && typeof alteracoes["eixo_formalizacao"] === "string") {
      const destino = String(alteracoes["eixo_formalizacao"]);
      const mapa: Record<string, AcaoGateada> = {
        contrato_enviado: "formalizacao_contrato_enviado",
        contrato_assinado: "formalizacao_contrato_assinado",
        pagamento_inicial_confirmado: "formalizacao_pagamento_confirmado",
        onboarding_iniciado: "liberar_onboarding",
      };
      const acao = mapa[destino];
      if (acao && anterior["eixo_formalizacao"] !== destino) {
        await exigirGate(supabase as never, {
          caseId: data.id,
          acao,
          userId: context.userId as string,
          organizationId,
        });
      }
    }

    // Campo enviado que não existe na tabela nunca mais some em silêncio.
    if (ignorados.length > 0 && Object.keys(alteracoes).length === 0) {
      throw new Error(
        `CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA: nada foi gravado. Campo(s) sem coluna correspondente: ${ignorados.join(", ")}.`,
      );
    }


    // Próxima ação: proprietária recebe defaults de startup; equipe segue regra completa.
    if (data.entidade === "crm_casos" && CAMPOS_PROXIMA_ACAO.some((c) => c in alteracoes)) {
      if (livre) {
        const { estado, pendenciasAssumidas } = exigirProximaAcaoOperavel(combinado, {
          livreProprietaria: true,
          responsavelPreferido: responsavelNome,
        });
        for (const k of [
          "responsavel_principal",
          "prazo_proxima_acao",
          "target_audience",
          "visibility",
          "suggested_channel",
        ] as const) {
          if (estado[k] !== undefined && estado[k] !== combinado[k]) {
            alteracoes[k] = estado[k];
          }
        }
        if (!combinado["responsavel_id"]) alteracoes["responsavel_id"] = context.userId;
        combinado = { ...combinado, ...alteracoes };
        void pendenciasAssumidas;
        void exigirProximaAcaoCompleta;
      } else {
        exigirProximaAcaoCompleta(combinado as Record<string, unknown>);
      }
    }

    const diff = Object.keys(alteracoes).filter(
      (k) => JSON.stringify(anterior[k] ?? null) !== JSON.stringify(alteracoes[k] ?? null),
    );
    if (diff.length === 0) {
      return { ok: true, alterados: [] as string[], ignorados, salvoEm: new Date().toISOString() };
    }

    // eventos_financeiros não tem coluna updated_by (confirmado na migration):
    // gravarComVerificacao sempre grava updated_by, então essa tabela precisa
    // do mesmo UPDATE verificado manualmente, sem esse campo.
    let salvoEm: string;
    if (data.entidade === "eventos_financeiros") {
      const { data: linhaAtualizada, error: erroAtualizar } = await supabase
        .from(data.entidade)
        .update(alteracoes)
        .eq("id", data.id)
        .eq("organization_id", organizationId)
        .select("*")
        .maybeSingle();
      if (erroAtualizar) throw new Error(erroAtualizar.message);
      if (!linhaAtualizada) throw new Error("NENHUMA_LINHA_AFETADA: nada foi gravado.");
      for (const campo of diff) {
        if (JSON.stringify((linhaAtualizada as any)[campo] ?? null) !== JSON.stringify(alteracoes[campo] ?? null)) {
          throw new Error(`DIVERGENCIA_PERSISTENCIA: o campo "${campo}" não foi gravado como enviado.`);
        }
      }
      salvoEm = new Date().toISOString();
    } else {
      const gravacao = await gravarComVerificacao({
        supabase: supabase as never,
        tabela: data.entidade,
        id: data.id,
        organizationId,
        userId: context.userId as string,
        payload: alteracoes,
      });
      salvoEm = gravacao.salvoEm;
    }

    // Registro de alterações do caso (quem, quando, o quê) — sensíveis mascarados.
    const caseId =
      data.entidade === "crm_casos"
        ? data.id
        : typeof combinado["case_id"] === "string"
          ? (combinado["case_id"] as string)
          : null;
    if (caseId && (data.entidade === "crm_casos" || data.entidade === "case_members")) {
      await supabase.from("caso_log").insert(
        linhasDeLog({
          organizationId,
          caseId,
          entidade: data.entidade,
          entidadeId: data.id,
          userId: context.userId as string,
          anterior,
          novo: alteracoes,
          campos: diff,
        }),
      );
    }

    const casoDaTarefa =
      data.entidade === "tarefas" && typeof combinado["caso_id"] === "string"
        ? (combinado["caso_id"] as string)
        : null;
    if (data.entidade === "crm_casos" && (diff.includes("proxima_acao") || diff.includes("status"))) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.id,
        eventType: "caso",
        title: diff.includes("proxima_acao") ? "Próxima ação atualizada" : "Status do caso alterado",
        summaryInternal: String(combinado["proxima_acao"] ?? combinado["status"] ?? ""),
        sourceEntityType: "crm_casos",
        sourceEntityId: data.id,
        userId: context.userId as string,
        nextAction: typeof combinado["proxima_acao"] === "string" ? combinado["proxima_acao"] : null,
      });
    }
    if (casoDaTarefa && (diff.includes("status") || diff.includes("motivo_bloqueio") || diff.includes("prazo") || diff.includes("responsavel_id"))) {
      const bloqueada = combinado["status"] === "bloqueada";
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: casoDaTarefa,
        eventType: bloqueada ? "pendencia" : "tarefa",
        title: "Tarefa atualizada",
        summaryInternal: `${String(combinado["titulo"] ?? "")} → ${String(combinado["status"] ?? "")}`,
        sourceEntityType: "tarefas",
        sourceEntityId: data.id,
        bloqueio: bloqueada,
        userId: context.userId as string,
      });
    }

    return { ok: true, alterados: diff, ignorados, salvoEm };

  });



export const arquivarRegistro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entidade: Entidade; id: string; motivo: string }) => {
    if (!ENTIDADES.includes(data.entidade)) throw new Error("Entidade inválida.");
    return { ...data, motivo: data.motivo?.trim() || "Motivo não informado." };
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const payload = {
      archived_at: new Date().toISOString(),
      archived_by: context.userId,
      archive_motivo: data.motivo.trim(),
    };
    let caseId: string | null = null;
    // eventos_financeiros não tem coluna updated_by (ver atualizarRegistro).
    if (data.entidade === "eventos_financeiros") {
      const { data: linhaAtualizada, error } = await supabase
        .from(data.entidade)
        .update(payload)
        .eq("id", data.id)
        .eq("organization_id", organizationId)
        .select("id,caso_id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!linhaAtualizada?.id) throw new Error("NENHUMA_LINHA_AFETADA: nada foi gravado.");
      caseId = ((linhaAtualizada as Linha)?.caso_id as string | undefined) ?? null;
    } else {
      const r = await gravarComVerificacao({
        supabase: supabase as never,
        tabela: data.entidade,
        id: data.id,
        organizationId,
        userId: context.userId as string,
        payload,
      });
      const registro = r.registro as Linha;
      // MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA: arquivamento é irreversível
      // pela tela, então precisa deixar rastro no histórico do caso quando
      // a entidade for case-scoped. Cada tabela usa um nome de coluna
      // diferente (case_id vs. caso_id) e payments só chega ao caso via
      // invoice_id — leads/clientes/client_contacts não têm caso ainda.
      if (data.entidade === "crm_casos") {
        caseId = data.id;
      } else if (data.entidade === "evidencias" || data.entidade === "tarefas") {
        caseId = (registro?.["caso_id"] as string | undefined) ?? null;
      } else if (data.entidade === "payments") {
        const invoiceId = registro?.["invoice_id"] as string | undefined;
        if (invoiceId) {
          const { data: fatura } = await supabase
            .from("invoices")
            .select("case_id")
            .eq("id", invoiceId)
            .maybeSingle();
          caseId = ((fatura as Linha | null)?.["case_id"] as string | undefined) ?? null;
        }
      } else if (
        data.entidade === "case_members" ||
        data.entidade === "documents" ||
        data.entidade === "consent_records" ||
        data.entidade === "proposals" ||
        data.entidade === "invoices"
      ) {
        caseId = (registro?.["case_id"] as string | undefined) ?? null;
      }
    }

    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: `Registro arquivado: ${data.entidade}`,
        summaryInternal: data.motivo.trim(),
        sourceEntityType: data.entidade,
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }

    return { ok: true };
  });

/** Mesma exigência de motivo de `arquivarRegistro`: desfazer também se justifica. */
export function validarEntradaRestauracao(data: { entidade: Entidade; id: string; motivo: string }) {
  if (!ENTIDADES.includes(data.entidade)) throw new Error("Entidade inválida.");
  return { ...data, motivo: data.motivo?.trim() || "Motivo não informado." };
}

/**
 * Par genérico de `arquivarRegistro`: arquivamento é lógico, então desfazê-lo
 * também exige motivo rastreável, organização derivada da sessão e rastro no
 * histórico do caso. Corpo exposto como função simples porque o encadeamento
 * de `createServerFn` é reescrito no build e não é chamável em teste.
 */
export async function restaurarRegistroNaOrganizacao(
  supabase: SupabaseCliente,
  entrada: { entidade: Entidade; id: string; motivo: string; userId: string },
) {
  const organizationId = await resolverOrganizacao(supabase, entrada.userId);

  // Releitura antes de gravar: gravarComVerificacao confirma linha afetada,
  // mas não distingue registro ativo de registro arquivado — restaurar o que
  // nunca foi arquivado não mudaria nada e devolveria sucesso falso.
  const leitura = await supabase
    .from(entrada.entidade)
    .select("*")
    .eq("id", entrada.id)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (leitura.error) throw new Error(leitura.error.message);
  const atual = (leitura.data ?? null) as Linha | null;
  if (!atual) throw new Error("Registro não encontrado nesta organização.");
  if (!atual["archived_at"]) throw new Error("Registro não está arquivado: não há o que restaurar.");

  const payload = { archived_at: null, archived_by: null, archive_motivo: null };
  // eventos_financeiros não tem coluna updated_by (ver atualizarRegistro).
  if (entrada.entidade === "eventos_financeiros") {
    const { data: linhaAtualizada, error } = await supabase
      .from(entrada.entidade)
      .update(payload)
      .eq("id", entrada.id)
      .eq("organization_id", organizationId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!(linhaAtualizada as Linha | null)?.["id"]) throw new Error("NENHUMA_LINHA_AFETADA: nada foi gravado.");
  } else {
    await gravarComVerificacao({
      supabase: supabase as never,
      tabela: entrada.entidade,
      id: entrada.id,
      organizationId,
      userId: entrada.userId,
      payload,
    });
  }

  // Mesmo mapa de caso usado em arquivarRegistro: cada tabela nomeia a coluna
  // de forma diferente (case_id vs. caso_id) e payments só chega ao caso via
  // invoice_id — leads/clientes/client_contacts não têm caso.
  let caseId: string | null = null;
  if (entrada.entidade === "crm_casos") {
    caseId = entrada.id;
  } else if (
    entrada.entidade === "evidencias" ||
    entrada.entidade === "tarefas" ||
    entrada.entidade === "eventos_financeiros"
  ) {
    caseId = (atual["caso_id"] as string | undefined) ?? null;
  } else if (entrada.entidade === "payments") {
    const invoiceId = atual["invoice_id"] as string | undefined;
    if (invoiceId) {
      const { data: fatura } = await supabase
        .from("invoices")
        .select("case_id")
        .eq("id", invoiceId)
        .maybeSingle();
      caseId = ((fatura as Linha | null)?.["case_id"] as string | undefined) ?? null;
    }
  } else if (
    entrada.entidade === "case_members" ||
    entrada.entidade === "documents" ||
    entrada.entidade === "consent_records" ||
    entrada.entidade === "proposals" ||
    entrada.entidade === "invoices"
  ) {
    caseId = (atual["case_id"] as string | undefined) ?? null;
  }

  if (caseId) {
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId,
      eventType: "caso",
      title: `Registro restaurado: ${entrada.entidade}`,
      summaryInternal: entrada.motivo.trim(),
      sourceEntityType: entrada.entidade,
      sourceEntityId: entrada.id,
      userId: entrada.userId,
    });
  }

  return { ok: true };
}

export const restaurarRegistro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validarEntradaRestauracao)
  .handler(async ({ data, context }) =>
    restaurarRegistroNaOrganizacao(context.supabase as unknown as SupabaseCliente, {
      ...data,
      userId: context.userId as string,
    }),
  );

/** Verificação servidor-side das condições obrigatórias de ativação. */
export const verificarCondicoesCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    await gravarComVerificacao({
      supabase: supabase as never,
      tabela: "crm_casos",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: {
        condicoes_verificadas_em: new Date().toISOString(),
        condicoes_verificadas_por: context.userId,
      },
    });
    return { ok: true };
  });

export const ativarCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const caso = await supabase
      .from("crm_casos")
      .select("*")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");
    const c = caso.data as Record<string, unknown>;

    const pendencias: string[] = [];
    if (!c["contrato_assinado"]) pendencias.push("Contrato assinado");
    if (!c["pagamento_confirmado"]) pendencias.push("Pagamento confirmado");
    if (!c["documentos_minimos_ok"]) pendencias.push("Documentos mínimos conferidos");
    if (!c["condicoes_verificadas_em"]) pendencias.push("Verificação formal das condições");
    if (pendencias.length > 0) {
      return { ok: false, pendencias };
    }

    try {
      await gravarComVerificacao({
        supabase: supabase as never,
        tabela: "crm_casos",
        id: data.id,
        organizationId,
        userId: context.userId as string,
        payload: { ativo: true, status: "ativo" },
      });
    } catch (erro) {
      return { ok: false, pendencias: [erro instanceof Error ? erro.message : "Não foi possível ativar o caso."] };
    }
    return { ok: true, pendencias: [] as string[] };
  });

export const registrarAcessoEvidencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { evidenciaId: string; acao: "upload" | "download" | "alteracao" | "visualizacao" }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const { error } = await supabase.from("evidencia_acessos").insert({
      organization_id: organizationId,
      evidencia_id: data.evidenciaId,
      acao: data.acao,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listarAcessosEvidencia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { evidenciaId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const { data: linhas } = await supabase
      .from("evidencia_acessos")
      .select("id,acao,user_id,created_at")
      .eq("organization_id", organizationId)
      .eq("evidencia_id", data.evidenciaId)
      .order("created_at", { ascending: false });
    return (linhas ?? []) as { id: string; acao: string; user_id: string | null; created_at: string }[];
  });

/** Somente admin: a política de RLS já bloqueia os demais papéis. */
export const listarAuditoria = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const { data, error } = await supabase
      .from("audit_logs")
      .select("id,acao,entidade,entidade_id,user_id,created_at,valores_anteriores,valores_posteriores")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as Linha[];
  });

export const listarUsuarios = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const [membros, papeis, perfis] = await Promise.all([
      supabase.from("organization_members").select("user_id,created_at,archived_at").eq("organization_id", organizationId),
      supabase.from("user_roles").select("user_id,role").eq("organization_id", organizationId),
      supabase.from("profiles").select("id,nome,email"),
    ]);
    const perfilPorId = new Map(
      ((perfis.data ?? []) as { id: string; nome: string | null; email: string | null }[]).map((p) => [p.id, p]),
    );
    return ((membros.data ?? []) as { user_id: string; created_at: string; archived_at: string | null }[]).map((m) => ({
      userId: m.user_id,
      desde: m.created_at,
      arquivado: Boolean(m.archived_at),
      nome: perfilPorId.get(m.user_id)?.nome ?? null,
      email: perfilPorId.get(m.user_id)?.email ?? null,
      papeis: ((papeis.data ?? []) as { user_id: string; role: Papel }[])
        .filter((p) => p.user_id === m.user_id)
        .map((p) => p.role),
    }));
  });

export const definirPapel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; papel: Papel; conceder: boolean; motivo?: string }) => ({
    ...data,
    motivo: data.motivo?.trim() || "Motivo não informado (fluxo sem confirmação humana explícita).",
  }))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    if (data.conceder) {
      const { data: linha, error } = await supabase
        .from("user_roles")
        .insert({ organization_id: organizationId, user_id: data.userId, role: data.papel })
        .select("id");
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
      if (!error && !linha?.length) throw new Error("NENHUMA_LINHA_AFETADA: papel não foi concedido.");
    } else {
      // papéis não são apagados fisicamente aqui: a remoção só é permitida ao admin via política
      const { data: linha, error } = await supabase
        .from("user_roles")
        .delete()
        .eq("organization_id", organizationId)
        .eq("user_id", data.userId)
        .eq("role", data.papel)
        .select("id");
      if (error) throw new Error("Remoção de papel indisponível: registre a alteração com um admin.");
      if (!linha?.length) throw new Error("NENHUMA_LINHA_AFETADA: papel não foi removido — verifique se ele existia.");
    }
    const auditRes = await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      user_id: context.userId,
      acao: data.conceder ? "papel_concedido" : "papel_removido",
      entidade: "user_roles",
      metadados: { alvo: data.userId, papel: data.papel, motivo: data.motivo },
    });
    if (auditRes.error) throw new Error(auditRes.error.message);
    return { ok: true };
  });
