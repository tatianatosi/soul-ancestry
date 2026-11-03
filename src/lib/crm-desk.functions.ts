import { semCache } from "@/lib/no-store";
import { sinaisDuplicidade } from "@/lib/duplicidade-comparacao";
import { AVISO_PRIVACIDADE } from "@/lib/decisoes-da-proprietaria";
// Alias obrigatório: este arquivo já usa `linhas` como variável local.
import { linhas as linhasDe } from "@/lib/linhas";
import { createServerFn } from "@tanstack/react-start";

import { semFixtures } from "@/lib/fixtures";
import { limparCamposLead as limpar } from "@/lib/crm-lead-campos";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  calcularMetricasCrm,
  errosBloqueantesAlteracao,
  montarFilasHoje,
  validarLead,
  type LeadDesk,
} from "@/lib/crm-desk";
import { sincronizarParametroDependentes } from "@/lib/dependentes.server";
import { TEMAS_JURIDICOS, avaliarAssinaturaPelaMatriz, canonicalizarTemaCodigo, type LinhaMatriz } from "@/lib/matriz-juridica";
import { avaliarValidacaoJuridicaCaso } from "@/lib/validacao-juridica-caso";
import { raciocinarJuridicoPorFase } from "@/lib/raciocinio-juridico-jornada";
import type { Dependente } from "@/lib/dependentes";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { camposParaPreencherNaPessoa } from "@/lib/lead-para-pessoa";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { proprietariaOperando } from "@/lib/autoridade.server";
import { contarSlaEmRisco } from "@/lib/d7-microentrega";
import {
  normalizarRegistro,
  registrarBloco,
  registrarResposta,
  registrarSugestao,
  type DecisaoSugestao,
  type OrigemSugestao,
} from "@/lib/discovery-registro";
import type { EtapaSpin } from "@/lib/discovery-roteiro";
import { CONSENTIMENTOS, RESPOSTAS_CONSENTIMENTO, validarPosCall, type TipoConsentimento } from "@/lib/discovery-roteiro-mestre";
import {
  eventosDeCall,
  exigeMotivoDeCall,
  ROTULO_EVENTO_CALL,
  rotuloTrilhaLead,
  type EventoCall,
} from "@/lib/crm-vivo";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const UUID = /^[0-9a-f-]{36}$/i;
const exigirUuid = (v: unknown, campo: string) => {
  if (!UUID.test(String(v ?? ""))) throw new Error(`${campo} inválido.`);
  return String(v);
};


async function orgDoUsuario(supabase: any, userId: string) {
  const { data } = await supabase.from("organization_members").select("organization_id").eq("user_id", userId).limit(1).maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}

/**
 * Lista de leads do Desk com validação espelhada e resultado derivado.
 *
 * Lead arquivado nunca aparece na listagem padrão — a mesma trava de "sem
 * exclusão física" que o resto do app usa (nucleos_familiares, crm_casos):
 * arquivar não é apagar, mas também não deve continuar poluindo a fila de
 * trabalho ativa. `incluirArquivados` existe só para quem precisa consultar
 * o que já foi arquivado.
 */
export const listarLeadsDesk = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { incluirArquivados?: boolean }) => ({ incluirArquivados: d?.incluirArquivados === true }))
  .handler(async ({ data: input, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(1000);
    if (!input.incluirArquivados) query = query.is("archived_at", null);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    const leads = (data ?? []) as LeadDesk[];
    const caseIds = Array.from(
      new Set(leads.map((l) => l.case_id).filter((id): id is string => Boolean(id))),
    );
    const clientePorCaso = new Map<string, string>();
    if (caseIds.length) {
      const { data: casos, error: errCasos } = await supabase
        .from("crm_casos")
        .select("id,cliente_id")
        .in("id", caseIds);
      if (errCasos) throw new Error(errCasos.message);
      for (const c of casos ?? []) {
        if (c?.id && c.cliente_id) clientePorCaso.set(c.id as string, c.cliente_id as string);
      }
    }
    const livre = await proprietariaOperando(supabase, (context as any).userId as string);
    return leads.map((l) => ({
      ...l,
      cliente_id: (l.case_id && clientePorCaso.get(l.case_id)) || l.cliente_id || null,
      pendencias: validarLead(l, livre),
    }));
  });

/** Cria ou atualiza um lead. Rejeita valores fora das listas controladas. */
/**
 * §12 do De-Para: ações comerciais são "sempre auditáveis". Cada gravação de
 * lead — criar, atualizar etapa/dados, registrar interação, definir próxima
 * ação, arquivar — deposita um evento em `audit_logs` com `valores_anteriores`
 * e `valores_posteriores`. A classificação da ação vem dos campos alterados,
 * não de um parâmetro extra do chamador, para não depender da UI passar o
 * rótulo certo — trocou etapa, é "atualizar_etapa"; mexeu na call/discovery,
 * é "registrar_interacao"; mexeu na proxima_acao, é "definir_proxima_acao".
 * Só cria trilha quando algo mudou de fato — patches vazios não geram
 * evento.
 */
type Sb = { from: (t: string) => any };
function classificarAcaoLead(campos: string[]): string {
  const conjunto = new Set(campos);
  if (conjunto.has("archived_at") || conjunto.has("archive_motivo")) return "arquivar_lead";
  if (conjunto.has("estagio") || conjunto.has("eixo_comercial")) return "atualizar_etapa";
  if (
    conjunto.has("call_agendada_em") ||
    conjunto.has("call_realizada_em") ||
    conjunto.has("discovery_resultado") ||
    conjunto.has("resumo_call") ||
    conjunto.has("consentimento_status")
  ) {
    return "registrar_interacao";
  }
  if (conjunto.has("proxima_acao") || conjunto.has("proxima_acao_em")) {
    return "definir_proxima_acao";
  }
  return "atualizar_lead";
}

/**
 * P2 (24/09/2026): eventos nomeados da call na trilha do lead — call
 * agendada, realizada, no-show, cancelada, discovery concluída. Um registro
 * por evento; o motivo de no-show/cancelamento vai nos metadados.
 */
async function registrarEventosCall(
  supabase: Sb,
  organizationId: string,
  userId: string,
  leadId: string,
  eventos: EventoCall[],
  motivo: string | null,
): Promise<void> {
  for (const evento of eventos) {
    try {
      await registrarAuditoria(supabase, {
        organization_id: organizationId,
        user_id: userId,
        acao: evento,
        entidade: "lead",
        entidade_id: leadId,
        metadados: {
          fonte: "crm-vivo",
          evento: ROTULO_EVENTO_CALL[evento],
          ...(evento === "call_no_show" || evento === "call_cancelada"
            ? motivo
              ? { motivo }
              : { motivo_pendente: true }
            : {}),
        },
      });
    } catch (err) {
      console.error("[audit_logs] falha ao registrar evento de call", err);
    }
  }
}

/**
 * 10/10/2026 — nome, telefone e país de interesse anotados na call completam a
 * Pessoa 360 do lead (a pessoa criada no handoff, `clientes.lead_id`), sem nova
 * digitação. Só preenche campo vazio e nunca bloqueia o salvamento do lead.
 */
async function levarDadosCivisParaPessoa(
  supabase: Sb,
  organizationId: string,
  userId: string,
  leadId: string,
  lead: Record<string, unknown>,
): Promise<void> {
  try {
    const { data: pessoas } = await supabase
      .from("clientes")
      .select("id,nome,telefone,pais_interesse")
      .eq("organization_id", organizationId)
      .eq("lead_id", leadId)
      .is("archived_at", null);
    for (const pessoa of (pessoas ?? []) as Array<Record<string, unknown>>) {
      const payload = camposParaPreencherNaPessoa(lead as never, pessoa as never);
      if (Object.keys(payload).length === 0) continue;
      await gravarComVerificacao({
        supabase,
        tabela: "clientes",
        id: String(pessoa.id),
        organizationId,
        userId,
        payload,
      });
    }
  } catch (e) {
    console.warn("[crm] Pessoa 360 não recebeu os dados civis da call:", (e as Error).message);
  }
}

async function registrarAuditoriaLead(
  supabase: Sb,
  organizationId: string,
  userId: string,
  leadId: string,
  acao: string,
  anteriores: Record<string, unknown> | null,
  posteriores: Record<string, unknown>,
): Promise<void> {
  // audit_insert_member (RLS): membro da org pode inserir; nunca falha
  // silenciosamente — se falhar, o chamador vê. Erros de auditoria não
  // devem, porém, derrubar a gravação principal: são registrados mas não
  // relançados, para não confundir defeito operacional com defeito de log.
  try {
    await registrarAuditoria(supabase, {
      organization_id: organizationId,
      user_id: userId,
      acao,
      entidade: "lead",
      entidade_id: leadId,
      valores_anteriores: anteriores,
      valores_posteriores: posteriores,
      metadados: { fonte: "crm-desk" },
    });
  } catch (err) {
    console.error("[audit_logs] falha ao registrar evento de lead", err);
  }
}

export const salvarLeadDesk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string | null; valores: Record<string, unknown>; motivoCall?: string | null }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const patch = limpar(data.valores ?? {});
    const motivoCall = String(data.motivoCall ?? "").trim() || null;

    let atual: LeadDesk | null = null;
    if (data.id) {
      exigirUuid(data.id, "id");
      const { data: row } = await supabase.from("leads").select("*").eq("id", data.id).maybeSingle();
      if (!row) throw new Error("Lead não encontrado nesta organização.");
      if (row.archived_at) throw new Error("Lead arquivado: edição bloqueada.");
      atual = row as LeadDesk;
    }

    const candidato = { ...(atual ?? { nome: "" }), ...patch } as LeadDesk;
    const livre = await proprietariaOperando(supabase, userId);
    const erros = errosBloqueantesAlteracao(atual, candidato, Object.keys(patch), livre);
    // P2 (24/09/2026): no-show e cancelamento de call exigem motivo, que fica
    // na trilha do lead (audit_logs) — sem coluna nova. Proprietária operando:
    // pendência informa, não impede (política de autoridade operacional) —
    // o evento fica com o motivo marcado como pendente.
    const eventosCall = eventosDeCall(atual, candidato);
    if (exigeMotivoDeCall(eventosCall) && !motivoCall && !livre) {
      erros.push({ campo: "status_call", motivo: "No-show ou cancelamento de call exige o motivo." });
    }
    if (erros.length) {
      return { ok: false as const, erros, lead: atual };
    }

    if (data.id) {
      const organizationId = (atual as unknown as { organization_id: string }).organization_id;
      const resultado = await gravarComVerificacao({
        supabase,
        tabela: "leads",
        id: data.id,
        organizationId,
        userId,
        payload: patch,
      });
      const acao = classificarAcaoLead(Object.keys(patch));
      await registrarAuditoriaLead(
        supabase,
        organizationId,
        userId,
        data.id,
        acao,
        atual as unknown as Record<string, unknown>,
        resultado.registro,
      );
      await registrarEventosCall(supabase, organizationId, userId, data.id, eventosCall, motivoCall);
      await levarDadosCivisParaPessoa(supabase, organizationId, userId, data.id, resultado.registro as Record<string, unknown>);
      return { ok: true as const, erros: [], lead: resultado.registro as LeadDesk };
    }

    const organization_id = await orgDoUsuario(supabase, userId);
    const resultadoInsert = await inserirComVerificacao({
      supabase,
      tabela: "leads",
      organizationId: organization_id,
      userId,
      payload: patch,
    });
    const row = resultadoInsert.registro;
    await registrarAuditoriaLead(
      supabase,
      organization_id,
      userId,
      resultadoInsert.id,
      "criar_lead",
      null,
      row,
    );
    await registrarEventosCall(supabase, organization_id, userId, resultadoInsert.id, eventosCall, motivoCall);
    return { ok: true as const, erros: [], lead: row as LeadDesk };
  });

/* ------------------------------------------------------------------ */
/* Mesa Discovery viva (autorização explícita, 27/09/2026)             */
/* ------------------------------------------------------------------ */

async function leadParaDiscovery(supabase: Sb, leadId: string) {
  exigirUuid(leadId, "leadId");
  const { data: row } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (!row) throw new Error("Lead não encontrado nesta organização.");
  if (row.archived_at) throw new Error("Lead arquivado: edição bloqueada.");
  return row as LeadDesk & { organization_id: string; discovery_registro?: unknown };
}

async function auditarDiscovery(
  supabase: Sb,
  organizationId: string,
  userId: string,
  leadId: string,
  acao: string,
  metadados: Record<string, unknown>,
) {
  try {
    await registrarAuditoria(supabase, {
      organization_id: organizationId,
      user_id: userId,
      acao,
      entidade: "lead",
      entidade_id: leadId,
      metadados: { fonte: "mesa-discovery", ...metadados },
    });
  } catch (err) {
    console.error("[audit_logs] falha ao registrar evento da Mesa Discovery", err);
  }
}

/** Nota opcional e/ou dispensa com motivo de um bloco SPIN. Grava e relê. */
export const registrarBlocoDiscovery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { leadId: string; bloco: EtapaSpin; nota?: string | null; dispensado?: boolean; motivo?: string | null }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const lead = await leadParaDiscovery(supabase, data.leadId);
    const r = registrarBloco(
      normalizarRegistro(lead.discovery_registro),
      data.bloco,
      { nota: data.nota, dispensado: data.dispensado, motivo: data.motivo },
      { em: new Date().toISOString(), por: userId },
    );
    if (!r.ok) return { ok: false as const, erro: r.erro };
    const resultado = await gravarComVerificacao({
      supabase,
      tabela: "leads",
      id: data.leadId,
      organizationId: lead.organization_id,
      userId,
      payload: { discovery_registro: r.registro },
    });
    const b = r.registro.blocos[data.bloco]!;
    await auditarDiscovery(supabase, lead.organization_id, userId, data.leadId, b.dispensado ? "discovery_bloco_dispensado" : "discovery_bloco_nota", {
      bloco: data.bloco,
      motivo: b.motivo_dispensa,
      tem_nota: Boolean(b.nota),
    });
    return { ok: true as const, lead: resultado.registro as LeadDesk };
  });

/**
 * Decisão humana sobre uma sugestão da varredura/transcrição. Aceitar grava o
 * valor no campo do lead (mesma validação de `salvarLeadDesk`); rejeitar e
 * "virar hipótese" só registram a decisão. Sempre com origem e auditoria.
 * Nunca cria caso, pesquisa, hipótese jurídica, produto/SKU ou preço.
 */
export const decidirSugestaoDiscovery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { leadId: string; campo: string; valor: string; decisao: DecisaoSugestao; origem: OrigemSugestao }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const lead = await leadParaDiscovery(supabase, data.leadId);
    const r = registrarSugestao(
      normalizarRegistro(lead.discovery_registro),
      { campo: data.campo, valor: data.valor, decisao: data.decisao, origem: data.origem },
      { em: new Date().toISOString(), por: userId },
    );
    if (!r.ok) return { ok: false as const, erros: [{ campo: data.campo, motivo: r.erro }] };

    let patchCampo: Record<string, unknown> = {};
    if (data.decisao === "aceita" || data.decisao === "hipotese") {
      const atualCampo = (lead as unknown as Record<string, unknown>)[data.campo];
      const valorCampo = Array.isArray(atualCampo)
        ? Array.from(new Set([...(atualCampo as string[]), data.valor]))
        : data.valor;
      patchCampo = limpar({ [data.campo]: valorCampo });
      if (!(data.campo in patchCampo)) {
        return { ok: false as const, erros: [{ campo: data.campo, motivo: "Campo fora da ficha do lead." }] };
      }
      const candidato = { ...lead, ...patchCampo } as LeadDesk;
      const livre = await proprietariaOperando(supabase, userId);
      const erros = errosBloqueantesAlteracao(lead, candidato, Object.keys(patchCampo), livre);
      if (erros.length) return { ok: false as const, erros };
    }
    const resultado = await gravarComVerificacao({
      supabase,
      tabela: "leads",
      id: data.leadId,
      organizationId: lead.organization_id,
      userId,
      payload: { ...patchCampo, discovery_registro: r.registro },
    });
    await auditarDiscovery(supabase, lead.organization_id, userId, data.leadId, `discovery_sugestao_${data.decisao}`, {
      campo: r.sugestao.campo,
      valor: r.sugestao.valor,
      origem: r.sugestao.origem,
    });
    return { ok: true as const, erros: [], lead: resultado.registro as LeadDesk };
  });

/** Resposta narrativa de uma pergunta do roteiro (SPIN ou extensão de país), com origem. */
export const salvarRespostaDiscovery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadId: string; perguntaId: string; texto?: string | null; origem?: string | null; naoSabe?: boolean }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const lead = await leadParaDiscovery(supabase, data.leadId);
    const r = registrarResposta(
      normalizarRegistro(lead.discovery_registro),
      data.perguntaId,
      { texto: data.texto, origem: data.origem, naoSabe: data.naoSabe },
      { em: new Date().toISOString(), por: userId },
    );
    if (!r.ok) return { ok: false as const, erro: r.erro };
    const resultado = await gravarComVerificacao({
      supabase,
      tabela: "leads",
      id: data.leadId,
      organizationId: lead.organization_id,
      userId,
      payload: { discovery_registro: r.registro },
    });
    await auditarDiscovery(supabase, lead.organization_id, userId, data.leadId, "discovery_resposta", {
      pergunta: data.perguntaId,
      origem: data.origem ?? "relato_call",
      nao_sabe: data.naoSabe === true,
    });
    return { ok: true as const, lead: resultado.registro as LeadDesk };
  });

/** Pós-call (roteiro mestre): só valores das listas fechadas; campo livre com limite. */
export const salvarPosCallDiscovery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadId: string; posCall: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const lead = await leadParaDiscovery(supabase, data.leadId);
    const v = validarPosCall(data.posCall ?? {});
    if (!v.ok) return { ok: false as const, erro: v.erro };
    const atual = normalizarRegistro(lead.discovery_registro);
    const registro = { ...atual, pos_call: { ...atual.pos_call, ...v.valor } };
    const resultado = await gravarComVerificacao({
      supabase,
      tabela: "leads",
      id: data.leadId,
      organizationId: lead.organization_id,
      userId,
      payload: { discovery_registro: registro },
    });
    await auditarDiscovery(supabase, lead.organization_id, userId, data.leadId, "discovery_pos_call", {
      campos: Object.keys(v.valor),
    });
    return { ok: true as const, lead: resultado.registro as LeadDesk };
  });

/**
 * Os quatro consentimentos, separados. O de gravação/transcrição também grava
 * nas colunas do lead que a trava da varredura e o trigger de gravação leem.
 */
export const salvarConsentimentosDiscovery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadId: string; consentimentos: Partial<Record<TipoConsentimento, string | null>>; canal?: string | null }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const lead = await leadParaDiscovery(supabase, data.leadId);
    const atual = normalizarRegistro(lead.discovery_registro);
    const consentimentos = { ...atual.consentimentos };
    for (const [tipo, valor] of Object.entries(data.consentimentos ?? {})) {
      if (!CONSENTIMENTOS.some((c) => c.tipo === tipo)) return { ok: false as const, erro: `Consentimento desconhecido: ${tipo}.` };
      if (valor && !RESPOSTAS_CONSENTIMENTO.some((o) => o.valor === valor)) return { ok: false as const, erro: "Resposta de consentimento fora da lista." };
      consentimentos[tipo as TipoConsentimento] = valor || null;
    }
    const payload: Record<string, unknown> = { discovery_registro: { ...atual, consentimentos } };
    if ("gravacao" in (data.consentimentos ?? {})) {
      const g = data.consentimentos.gravacao;
      payload.consentimento_status = g === "sim" ? "concedido" : g === "nao" ? "recusado" : "pendente";
      payload.consentimento_gravacao = g === "sim";
      payload.consentimento_em = g ? new Date().toISOString() : null;
      if (data.canal) payload.consentimento_canal = data.canal;
      /*
        D-01 ligado (03/10/2026). Defeito que o gate escondia: o trigger do
        banco recusa `concedido` sem data/hora, canal E versão do aviso, e
        esta função nunca gravava a versão. Conceder consentimento pela tela
        falhava sempre — por isso os 11 leads estavam todos em
        `nao_solicitado`. Não era falta de dado: era caminho inalcançável.

        A versão vem da política publicada (`AVISO_PRIVACIDADE`), e só é
        carimbada quando o lead ainda não tem uma: consentimento antigo
        continua apontando para a versão que foi de fato apresentada.
      */
      if (g === "sim") {
        if (!String(payload.consentimento_canal ?? lead.consentimento_canal ?? "").trim()) {
          return {
            ok: false as const,
            erro: "Consentimento concedido exige o canal em que foi dado (ex.: verbal na call).",
          };
        }
        if (!String(lead.consentimento_versao_aviso ?? "").trim()) {
          payload.consentimento_versao_aviso = AVISO_PRIVACIDADE.versao;
        }
      }
    }
    const resultado = await gravarComVerificacao({
      supabase,
      tabela: "leads",
      id: data.leadId,
      organizationId: lead.organization_id,
      userId,
      payload,
      // consentimento_em é carimbado aqui; o banco pode devolver outro formato de data.
    });
    await auditarDiscovery(supabase, lead.organization_id, userId, data.leadId, "discovery_consentimentos", {
      consentimentos,
    });
    return { ok: true as const, lead: resultado.registro as LeadDesk };
  });

/**
 * P2 CRM Vivo (24/09/2026): trilha do lead — call criada, realizada,
 * no-show, discovery concluída, handoff e conversão, lidos da mesma
 * `audit_logs` (entidade "lead"), filtrados pela organização do usuário.
 * RLS vigente (`audit_select_admin`): só administrador lê a trilha; para
 * os demais a lista volta vazia e a tela diz isso — não é "sem eventos".
 */
export const trilhaDoLead = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organizationId = await orgDoUsuario(supabase, userId);
    const { data: linhas, error } = await supabase
      .from("audit_logs")
      .select("id,acao,created_at,user_id,metadados")
      .eq("organization_id", organizationId)
      .eq("entidade", "lead")
      .eq("entidade_id", data.leadId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return ((linhas ?? []) as Array<Record<string, any>>).map((l) => ({
      id: String(l.id),
      acao: String(l.acao),
      rotulo: rotuloTrilhaLead(String(l.acao)),
      created_at: String(l.created_at),
      motivo: (l.metadados?.motivo ?? null) as string | null,
      motivoPendente: l.metadados?.motivo_pendente === true,
      codigoCaso: (l.metadados?.codigo_caso ?? null) as string | null,
    }));
  });

/** Arquiva um lead. Nunca há exclusão física. */
export const arquivarLeadDesk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo: string }) => {
    exigirUuid(d?.id, "id");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const { data: lead } = await supabase
      .from("leads")
      .select("organization_id,case_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!lead) throw new Error("Lead não encontrado nesta organização.");
    const patchArquivar = { archived_at: new Date().toISOString(), archived_by: userId, archive_motivo: motivo };
    await gravarComVerificacao({
      supabase,
      tabela: "leads",
      id: data.id,
      organizationId: lead.organization_id as string,
      userId,
      payload: patchArquivar,
    });
    await registrarAuditoriaLead(
      supabase,
      lead.organization_id as string,
      userId,
      data.id,
      "arquivar_lead",
      lead as Record<string, unknown>,
      patchArquivar,
    );
    if (lead.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId: lead.organization_id as string,
        caseId: lead.case_id as string,
        eventType: "caso",
        title: "Lead arquivado",
        summaryInternal: motivo,
        sourceEntityType: "leads",
        sourceEntityId: data.id,
        userId,
      });
    }
    return { ok: true };
  });

/** Painel Hoje + métricas comerciais e operacionais. */
export const painelHojeDesk = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { incluirDemo?: boolean }) => ({ incluirDemo: d?.incluirDemo === true }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const [leadsRes, casosRes] = await Promise.all([
      supabase.from("leads").select("*").limit(1000),
      supabase
        .from("crm_casos")
        .select("id,codigo,titulo,pais,via,documentos_minimos_ok,prazo_proxima_acao,responsavel_principal,ativo,data_origin,dados_teste")
        .is("archived_at", null)
        .limit(1000),
    ]);
    // Fixtures de demonstração ficam fora das filas e métricas por padrão;
    // só entram quando o filtro explícito "Incluir demonstrações" é acionado.
    const leads = linhasDe<any>(leadsRes, "leads do Painel Hoje");
    const casos = linhasDe<any>(casosRes, "casos do Painel Hoje");
    const listaLeads = (data.incluirDemo ? leads : semFixtures(leads as never)) as unknown as LeadDesk[];
    const listaCasos = ((data.incluirDemo ? casos : semFixtures(casos as never)) as any[]).filter(
      // Massa TESTE nunca aparece no Painel Hoje padrão.
      (c) => data.incluirDemo || c.dados_teste !== true,
    );
    const { orgDoUsuario, pendenciasCadeiaPainel } = await import("@/lib/cadeia-operacional.server");
    const org = await orgDoUsuario(supabase, (context as any).userId);
    const cadeia = await pendenciasCadeiaPainel(supabase, org, { incluirTeste: data.incluirDemo });
    // Decisão 1 (CA-DECISÕES-DA-PROPRIETÁRIA, 09/09/2026) — mesma RPC
    // canônica de Ficha 360/Lista de Casos, em lote, para que o TEXTO da
    // ação exibida no Painel Hoje nunca seja uma segunda narrativa.
    const idsComPendenciaDocumental = listaCasos
      .filter((c) => c.documentos_minimos_ok === false)
      .map((c) => c.id as string);
    let proximasAcoes: Record<string, { nivel: number; motivo: string; origem_tabela: string | null; origem_id: string | null; prazo: string | null }> = {};
    if (idsComPendenciaDocumental.length > 0) {
      const { data: lote } = await supabase.rpc("proxima_acao_prioritaria_lote", { _cases: idsComPendenciaDocumental });
      for (const r of (lote ?? []) as any[]) {
        proximasAcoes[r.case_id as string] = {
          nivel: r.nivel,
          motivo: r.motivo,
          origem_tabela: r.origem_tabela,
          origem_id: r.origem_id,
          prazo: r.prazo,
        };
      }
    }
    // P3 (25/09/2026): cartão "SLA em risco" com a fonte canônica
    // (v_ops_tarefas.sla_status + v_ops_microentregas.prazo_status), só dos
    // casos visíveis. Falha de leitura = null (ausência declarada, nunca zero).
    const [slaTarefas, slaMicro] = await Promise.all([
      supabase.from("v_ops_tarefas").select("caso_id,sla_status").eq("organization_id", org).is("archived_at", null),
      supabase
        .from("v_ops_microentregas")
        .select("caso_id,prazo_status")
        .eq("organization_id", org)
        .is("archived_at", null),
    ]);
    const slaEmRisco =
      slaTarefas.error || slaMicro.error
        ? null
        : contarSlaEmRisco({
            tarefas: (slaTarefas.data ?? []) as any[],
            microentregas: (slaMicro.data ?? []) as any[],
            casosVisiveis: new Set(listaCasos.map((c) => String(c.id))),
          });
    return {
      filas: montarFilasHoje({ leads: listaLeads, casos: listaCasos, cadeia, proximasAcoes }),
      metricas: calcularMetricasCrm({ leads: listaLeads, casos: listaCasos }),
      slaEmRisco,
    };
  });


/* ---------------- Dependentes ---------------- */

export const listarDependentes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => ({ caseId: exigirUuid(d?.caseId, "caseId") }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const { data: rows, error } = await supabase
      .from("case_dependents")
      .select("*")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at");
    if (error) throw new Error(error.message);
    return (rows ?? []) as Dependente[];
  });

export const salvarDependente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string | null; caseId: string; valores: Record<string, unknown> }) => {
    exigirUuid(d?.caseId, "caseId");
    if (d.id) exigirUuid(d.id, "id");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const campos = [
      "nome_completo",
      "vinculo_com_titular",
      "titular_responsavel_legal_nome",
      "status_representacao",
      "documento_representacao_referencia_interna",
      "participa_do_contrato",
      "possui_acesso_app",
      "anexo_individual_aplicavel",
      "observacao_interna",
    ];
    const patch: Record<string, unknown> = {};
    for (const c of campos) if (c in data.valores) patch[c] = data.valores[c] === "" ? null : data.valores[c];

    const { data: caso } = await supabase.from("crm_casos").select("organization_id").eq("id", data.caseId).maybeSingle();
    if (!caso) throw new Error("Caso não encontrado nesta organização.");

    if (data.id) {
      await gravarComVerificacao({
        supabase,
        tabela: "case_dependents",
        id: data.id,
        organizationId: caso.organization_id as string,
        userId,
        payload: patch,
      });
      await sincronizarParametroDependentes(supabase, data.caseId, caso.organization_id as string);
      return { ok: true };
    }
    await inserirComVerificacao({
      supabase,
      tabela: "case_dependents",
      organizationId: caso.organization_id as string,
      userId,
      payload: { ...patch, case_id: data.caseId },
    });
    await sincronizarParametroDependentes(supabase, data.caseId, caso.organization_id as string);
    return { ok: true };
  });

/* ---------------- Matriz jurídica ---------------- */

/** Lê a matriz garantindo que todo tema normativo apareça, mesmo sem decisão. */
export const listarMatrizJuridica = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;
    // 08/09/2026 — esta leitura não filtrava organização (dependia só de RLS).
    // O banco tem três organizações com matriz jurídica; sem o filtro, uma
    // aprovação gravada em outra organização podia ser lida como se fosse
    // desta, ou o inverso — foi exatamente o que mascarou 7 temas bloqueantes
    // arquivados na organização operante. Filtro explícito, sem depender de RLS.
    const organization_id = await orgDoUsuario(supabase, (context as any).userId as string);
    const matrizRes = await supabase
      .from("legal_clause_matrix")
      .select("*")
      .eq("organization_id", organization_id)
      .is("archived_at", null);
    const rows = linhasDe<any>(matrizRes, "matriz jurídica");
    const linhas: LinhaMatriz[] = TEMAS_JURIDICOS.map((t) => {
      const l = rows.find((r) => r.tema_codigo === t.tema_codigo);
      return {
        tema_codigo: t.tema_codigo,
        tema: t.tema,
        status: l?.status ?? "pendente_revisao_juridica",
        versao_juridica_aplicavel: l?.versao_juridica_aplicavel ?? null,
        responsavel_revisao: l?.responsavel_revisao ?? null,
        decisao: l?.decisao ?? null,
        justificativa: l?.justificativa ?? null,
        decidido_em: l?.decidido_em ?? null,
        referencia_versao: l?.referencia_versao ?? null,
        impacto_templates: l?.impacto_templates ?? t.impacto_templates,
        bloqueia_assinatura: l?.bloqueia_assinatura ?? t.bloqueia_assinatura,
      };
    });
    return linhas;
  });

/** Registra decisão de um tema. Nunca grava texto de cláusula. */
export const registrarDecisaoTema = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      tema_codigo: string;
      status: string;
      decisao?: string | null;
      justificativa?: string | null;
      responsavel_revisao?: string | null;
      versao_juridica_aplicavel?: string | null;
      referencia_versao?: string | null;
    }) => {
      const tema = TEMAS_JURIDICOS.find((t) => t.tema_codigo === d?.tema_codigo);
      if (!tema) throw new Error("Tema fora da matriz normativa.");
      return d;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);
    const tema = TEMAS_JURIDICOS.find((t) => t.tema_codigo === data.tema_codigo)!;
    const registro = {
      organization_id,
      tema_codigo: tema.tema_codigo,
      tema: tema.tema,
      status: data.status,
      decisao: data.decisao ?? null,
      justificativa: data.justificativa ?? null,
      responsavel_revisao: data.responsavel_revisao ?? null,
      versao_juridica_aplicavel: data.versao_juridica_aplicavel ?? null,
      referencia_versao: data.referencia_versao ?? null,
      impacto_templates: tema.impacto_templates,
      bloqueia_assinatura: tema.bloqueia_assinatura,
      decidido_em: data.status === "pendente_revisao_juridica" ? null : new Date().toISOString(),
      updated_by: userId,
    } as Record<string, unknown>;
    // Achado real (08/09/2026): a chave única é (organization_id, tema_codigo) e
    // NÃO exclui linha arquivada. Um dedupe anterior (07/09) arquivou 11 dos 13
    // temas desta organização como "duplicata de seed", sem perceber que isso
    // deixava o tema sem NENHUMA linha ativa — e a busca abaixo, ao ignorar
    // linhas arquivadas, nunca as encontrava. Resultado: toda tentativa de
    // registrar decisão nesses temas caía no INSERT e colidia com a própria
    // linha arquivada, travando a tela com "duplicate key value violates
    // unique constraint" para a Proprietária. Corrigido: busca por organização
    // (nunca confia só em RLS para isolar) e independente de arquivamento —
    // reaproveita a linha existente (arquivada ou não) em vez de tentar duplicar,
    // e desarquiva ao registrar: registrar decisão é exatamente o ato que torna
    // o tema vigente de novo.
    const { data: existente } = await supabase
      .from("legal_clause_matrix")
      .select("id,archived_at")
      .eq("organization_id", organization_id)
      .eq("tema_codigo", tema.tema_codigo)
      .order("archived_at", { ascending: true, nullsFirst: true })
      .limit(1)
      .maybeSingle();
    if (existente?.archived_at) {
      registro.archived_at = null;
      registro.archive_motivo = null;
      registro.substituido_por_id = null;
      registro.substituicao_motivo = null;
    }
    if (existente?.id) {
      await gravarComVerificacao({
        supabase,
        tabela: "legal_clause_matrix",
        id: existente.id,
        organizationId: organization_id,
        userId,
        payload: { ...registro, archived_at: null, archived_by: null, archive_motivo: null },
      });
    } else {
      await inserirComVerificacao({
        supabase,
        tabela: "legal_clause_matrix",
        organizationId: organization_id,
        userId,
        payload: registro,
      });
    }
    return { ok: true };
  });

/* ---------------- Páginas da proposta Canva ---------------- */

export const listarPaginasCanva = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { proposalId: string }) => ({ proposalId: exigirUuid(d?.proposalId, "proposalId") }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const paginasRes = await supabase
      .from("proposal_canva_pages")
      .select("*")
      .eq("proposal_id", data.proposalId)
      .is("archived_at", null)
      .order("page_number");
    return linhasDe<any>(paginasRes, "páginas da proposta Canva");
  });

/** Registra a extração de uma página 1–7 da proposta Canva. */
export const salvarPaginaCanva = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      proposalId: string;
      caseId: string;
      page_number: number;
      extracao_status: string;
      page_content_structured?: Record<string, unknown> | null;
      campos_nao_localizados?: string[] | null;
      observacao_interna?: string | null;
    }) => {
      exigirUuid(d?.proposalId, "proposalId");
      exigirUuid(d?.caseId, "caseId");
      if (![1, 2, 3, 4, 5, 6, 7].includes(Number(d?.page_number))) throw new Error("Somente páginas 1 a 7 são fonte de escopo.");
      if (!["pendente", "em_extracao", "extraida", "nao_aplicavel"].includes(d?.extracao_status))
        throw new Error("Status de extração inválido.");
      return d;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const { data: caso } = await supabase.from("crm_casos").select("organization_id").eq("id", data.caseId).maybeSingle();
    if (!caso) throw new Error("Caso não encontrado nesta organização.");
    const registro = {
      organization_id: caso.organization_id,
      proposal_id: data.proposalId,
      case_id: data.caseId,
      page_number: data.page_number,
      extracao_status: data.extracao_status,
      page_content_structured: data.page_content_structured ?? {},
      campos_nao_localizados: data.campos_nao_localizados ?? [],
      observacao_interna: data.observacao_interna ?? null,
      extraido_por: userId,
      extraido_em: new Date().toISOString(),
      updated_by: userId,
    };
    const { data: existente } = await supabase
      .from("proposal_canva_pages")
      .select("id")
      .eq("proposal_id", data.proposalId)
      .eq("page_number", data.page_number)
      .is("archived_at", null)
      .maybeSingle();
    if (existente?.id) {
      await gravarComVerificacao({
        supabase,
        tabela: "proposal_canva_pages",
        id: existente.id,
        organizationId: caso.organization_id as string,
        userId,
        payload: registro,
      });
    } else {
      await inserirComVerificacao({
        supabase,
        tabela: "proposal_canva_pages",
        organizationId: caso.organization_id as string,
        userId,
        payload: registro,
      });
    }
    return { ok: true };
  });

/* ---------------- ANA-E-01: consolidação e diagnóstico de instrumentos ---------------- */

/** Deduplicação lógica auditada da matriz (uma linha canônica por tema). Não apaga nada. */
export const consolidarMatrizJuridica = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);
    const { data, error } = await supabase.rpc("matriz_juridica_deduplicar", { _org: organization_id });
    if (error) throw new Error(error.message);
    return { consolidados: (data ?? []) as any[] };
  });

/**
 * Leitura agregada para preparação de instrumentos: matriz jurídica, dependentes,
 * checklist cadastral, case service/critérios e conferência da proposta Canva.
 * Só diagnostica bloqueios — não redige cláusula nem cria artefato externo.
 */
export const diagnosticoInstrumentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => ({ caseId: exigirUuid(d?.caseId, "caseId") }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    // 26/10/2026 (auditoria): sem filtro de organização aqui, a leitura
    // dependia só de RLS — a mesma classe de vazamento entre organizações já
    // corrigida em listarMatrizJuridica (comentário de 08/09/2026 acima).
    const organization_id = await orgDoUsuario(supabase, (context as any).userId as string);

    const [matrizRes, depRes, checkRes, servRes, critRes, confRes] = await Promise.all([
      supabase.from("legal_clause_matrix").select("*").eq("organization_id", organization_id).is("archived_at", null),
      supabase.from("case_dependents").select("*").eq("case_id", data.caseId).is("archived_at", null),
      supabase.from("checklist_cadastral").select("*").eq("case_id", data.caseId).is("archived_at", null),
      supabase.from("case_services").select("*").eq("case_id", data.caseId).is("archived_at", null),
      supabase.from("case_service_criterios").select("*").eq("case_id", data.caseId).is("archived_at", null),
      supabase
        .from("piloto_conferencia")
        .select("*")
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    const rows = linhasDe<any>(matrizRes, "matriz jurídica");
    const linhas: LinhaMatriz[] = TEMAS_JURIDICOS.map((t) => {
      const l = rows.find((r) => canonicalizarTemaCodigo(r.tema_codigo) === t.tema_codigo);
      return {
        tema_codigo: t.tema_codigo,
        tema: t.tema,
        status: l?.status ?? "pendente_revisao_juridica",
        versao_juridica_aplicavel: l?.versao_juridica_aplicavel ?? null,
        responsavel_revisao: l?.responsavel_revisao ?? null,
        decisao: l?.decisao ?? null,
        justificativa: l?.justificativa ?? null,
        decidido_em: l?.decidido_em ?? null,
        referencia_versao: l?.referencia_versao ?? null,
        impacto_templates: l?.impacto_templates ?? t.impacto_templates,
        bloqueia_assinatura: l?.bloqueia_assinatura ?? t.bloqueia_assinatura,
      };
    });

    const assinatura = avaliarAssinaturaPelaMatriz(linhas);
    const bloqueios = assinatura.bloqueios.map((b) => ({ origem: "matriz_juridica", detalhe: `${b.tema}: ${b.motivo}` }));

    const dependentes = linhasDe<any>(depRes, "dependentes do caso");
    for (const d of dependentes) {
      if (String(d.status_representacao ?? "") !== "documentada") {
        bloqueios.push({
          origem: "dependentes",
          detalhe: `Representação pendente para dependente ${d.nome ?? d.id}.`,
        });
      }
    }

    const checklist = linhasDe<any>(checkRes, "checklist cadastral do caso");
    // 26/10/2026: "completo" não é valor do CHECK de checklist_cadastral.status
    // (pendente|informado|verificado|nao_aplicavel|aguarda_fonte_societaria) —
    // a comparação nunca era verdadeira e todo item contava como pendente.
    const CHECKLIST_CONCLUIDO = new Set(["verificado", "nao_aplicavel"]);
    const checklistPendente = checklist.filter((c) => !CHECKLIST_CONCLUIDO.has(String(c.status ?? ""))).length;
    if (checklistPendente) {
      bloqueios.push({ origem: "checklist_cadastral", detalhe: `${checklistPendente} item(ns) cadastrais pendentes.` });
    }

    const servicos = linhasDe<any>(servRes, "case services do caso");
    const servicoNaoConsolidado = servicos.filter((s) => !["approved", "contracted"].includes(String(s.status ?? ""))).length;
    if (!servicos.length) bloqueios.push({ origem: "case_service", detalhe: "Nenhum case service registrado." });
    else if (servicoNaoConsolidado)
      bloqueios.push({ origem: "case_service", detalhe: `${servicoNaoConsolidado} case service(s) fora de estado consolidado.` });

    const criterios = linhasDe<any>(critRes, "critérios de aceite do caso");
    const criteriosPendentes = criterios.filter((c) => String(c.estado ?? c.status ?? "") !== "aceito").length;
    if (criteriosPendentes)
      bloqueios.push({ origem: "criterios_aceite", detalhe: `${criteriosPendentes} critério(s) de aceite pendentes.` });

    const conferencia = linhasDe<any>(confRes, "conferência de escopo da proposta")[0] ?? null;
    if (!conferencia) bloqueios.push({ origem: "conferencia_canva", detalhe: "Conferência de escopo da proposta não registrada." });

    return {
      linhas,
      assinatura,
      bloqueios,
      resumo: {
        dependentes: dependentes.length,
        checklist_pendente: checklistPendente,
        criterios_pendentes: criteriosPendentes,
        case_services: servicos.length,
        conferencia_status: conferencia?.status ?? null,
      },
      nenhuma_acao_externa: true,
    };
  });

/**
 * Validação Jurídica por caso (CA08-JURIDICO-PROPORCIONAL, 09/09/2026):
 * rota/marco aplicável, estado, decisão humana necessária, documento/evidência
 * pendente e qual ato formal é afetado. Mesmas fontes de sempre
 * (citizenship_tracks, versioned_legal_rules, legal_reference_milestones via
 * case_services.citizenship_track_id, legal_clause_matrix, case_dependents) —
 * nenhuma tabela ou taxonomia nova. Só diagnostica: nenhuma ação externa.
 */
export const validacaoJuridicaCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => ({ caseId: exigirUuid(d?.caseId, "caseId") }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    // 26/10/2026 (auditoria): mesma correção de diagnosticoInstrumentos acima —
    // sem filtro de organização, a leitura dependia só de RLS.
    const organization_id = await orgDoUsuario(supabase, (context as any).userId as string);

    const [servRes, matrizRes, depRes, planoRes] = await Promise.all([
      supabase
        .from("case_services")
        .select("citizenship_track_id")
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .not("citizenship_track_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase.from("legal_clause_matrix").select("*").eq("organization_id", organization_id).is("archived_at", null),
      supabase.from("case_dependents").select("nome:nome_completo,participa_do_contrato,status_representacao").eq("case_id", data.caseId).is("archived_at", null),
      supabase
        .from("case_plans")
        .select("fase_jornada")
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const trackId = linhasDe<any>(servRes, "case services do caso")[0]?.citizenship_track_id as string | undefined;

    const [trackRes, marcosRes, regrasRes] = trackId
      ? await Promise.all([
          supabase.from("citizenship_tracks").select("*").eq("id", trackId).is("archived_at", null).maybeSingle(),
          supabase.from("legal_reference_milestones").select("*").eq("track_id", trackId).is("archived_at", null),
          supabase.from("versioned_legal_rules").select("*").eq("track_id", trackId).is("archived_at", null),
        ])
      : [{ data: null }, { data: [] }, { data: [] }];

    const trackRow = (trackRes as any).data as Record<string, any> | null;
    const track = trackRow
      ? {
          trackId: trackRow.id as string,
          pais: trackRow.pais ?? null,
          nacionalidade: trackRow.nacionalidade ?? null,
          viaPreliminar: trackRow.via_preliminar ?? null,
          statusVia: trackRow.status_via ?? null,
          trackName: trackRow.track_name ?? null,
          lifecycleStatus: trackRow.lifecycle_status ?? "rascunho",
          revisaoHumanaJuridica: trackRow.revisao_humana_juridica ?? null,
        }
      : null;

    const matrizRows = linhasDe<any>(matrizRes, "matriz jurídica");
    const temasMatriz = TEMAS_JURIDICOS.map((t) => {
      const l = matrizRows.find((r) => canonicalizarTemaCodigo(r.tema_codigo) === t.tema_codigo);
      return {
        tema_codigo: t.tema_codigo,
        tema: t.tema,
        status: l?.status ?? "pendente_revisao_juridica",
        bloqueia_assinatura: l?.bloqueia_assinatura ?? t.bloqueia_assinatura,
        versao_juridica_aplicavel: l?.versao_juridica_aplicavel ?? null,
      };
    });

    const resultado = avaliarValidacaoJuridicaCaso({
      track,
      marcos: ((marcosRes as any).data ?? []) as any[],
      regras: ((regrasRes as any).data ?? []) as any[],
      temasMatriz,
      dependentes: linhasDe<any>(depRes, "dependentes do caso"),
    });

    const faseJornada = ((planoRes as any).data?.fase_jornada as string | null | undefined) ?? null;
    const raciocinioFase = raciocinarJuridicoPorFase({
      faseJornada,
      validacao: resultado,
      alertaInternoPais: (trackRow?.riscos_internos as string | null | undefined) ?? null,
    });

    return { ...resultado, raciocinioFase };
  });

/* ————— Cadastro manual de lead (Comercial → Leads → Novo lead) ————— */

export type PossivelDuplicidade = {
  id: string;
  codigo: string | null;
  nome: string;
  email: string | null;
  telefone: string | null;
  motivo: string;
};

/**
 * Procura possíveis duplicidades por e-mail e telefone, usando nome como sinal
 * complementar.
 *
 * Exportada em 04/10/2026: a varredura de cadastros paralelos de lead mostrou
 * que `registrarLeadGoLive` inseria direto, sem nenhuma checagem — dois
 * caminhos de criação, só um com dedup. Mesma função nos dois, em vez de uma
 * segunda regra de duplicidade.
 */
export async function buscarDuplicidades(
  supabase: any,
  entrada: { nome: string; email?: string | null; telefone?: string | null },
): Promise<PossivelDuplicidade[]> {
  const leadsRes = await supabase.from("leads").select("id, codigo, nome, email, telefone").is("archived_at", null).limit(2000);
  const linhas = linhasDe<{ id: string; codigo: string | null; nome: string; email: string | null; telefone: string | null }>(
    leadsRes,
    "leads para checagem de duplicidade",
  );

  const achados: PossivelDuplicidade[] = [];
  for (const l of linhas) {
    const motivos = sinaisDuplicidade(entrada, l);
    if (motivos.length) achados.push({ ...l, motivo: motivos.join(" + ") });
  }
  return achados;
}

export const verificarDuplicidadeLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { nome: string; email?: string | null; telefone?: string | null }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    return { duplicidades: await buscarDuplicidades(supabase, data) };
  });

/** Cria contato/lead manual já em Triagem, com deduplicação prévia. */
export const criarLeadManual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      nome: string;
      email?: string | null;
      telefone?: string | null;
      origem: string;
      objetivo: string;
      area_responsavel?: string | null;
      responsavel_nome: string;
      proxima_acao: string;
      proxima_acao_em: string;
      resumo_call?: string | null;
      indicado_por?: string | null;
      confirmarDuplicidade?: boolean;
    }) => {
      // Campos de conteudo do lead (05/09/2026).
      //
      // Antes exigia sete campos ao mesmo tempo para gravar. Faltando um, nada
      // era salvo e o trabalho se perdia. Agora so o nome e obrigatorio - sem
      // ele nao ha lead. O que falta vira pendencia visivel no proprio
      // registro, para completar depois.
      if (!d?.nome?.trim()) throw new Error("Informe ao menos o nome para criar o lead.");
      return d;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;

    /*
     * Verificação de duplicidade NÃO bloqueante (ordem de 19/10/2026): antes,
     * encontrar mesmo e-mail/telefone/nome impedia a primeira gravação —
     * quem estava cadastrando em plena call tinha de clicar de novo só para
     * confirmar "é outro contato mesmo". Agora a duplicidade é só aviso: o
     * lead sempre grava já na primeira tentativa, e a lista de duplicidades
     * encontradas volta no mesmo retorno de sucesso para a tela mostrar o
     * selo/aviso, sem nunca travar o salvamento.
     */
    const duplicidades = await buscarDuplicidades(supabase, data);

    const candidato: LeadDesk = {
      nome: data.nome.trim(),
      email: data.email?.trim() || null,
      telefone: data.telefone?.trim() || null,
      origem: data.origem,
      objetivo: data.objetivo,
      area_responsavel: data.area_responsavel?.trim() || "comercial",
      responsavel_nome: data.responsavel_nome.trim(),
      proxima_acao: data.proxima_acao,
      proxima_acao_em: data.proxima_acao_em,
      eixo_comercial: "triagem",
      eixo_formalizacao: "nao_iniciado",
      resumo_call: data.resumo_call?.trim() || null,
      indicado_por: data.indicado_por?.trim() || null,
    };

    const livre = await proprietariaOperando(supabase, userId);
    const erros = validarLead(candidato, livre);
    if (erros.length) return { ok: false as const, duplicidades, erros, lead: null };

    const organization_id = await orgDoUsuario(supabase, userId);
    const { data: row, error } = await supabase
      .from("leads")
      .insert({ ...candidato, organization_id, created_by: userId, updated_by: userId })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { ok: true as const, duplicidades, erros: [], lead: row as LeadDesk };
  });
