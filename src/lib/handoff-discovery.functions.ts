/**
 * Handoff Discovery → pessoa + caso (persistência).
 *
 * Uma confirmação humana no Painel de Calls:
 * 1) resolve ou cria `clientes` (pré-cliente);
 * 2) abre `crm_casos` (ou reusa se o lead já tem case_id);
 * 3) grava `leads.case_id` + eixo_comercial diagnóstico;
 * 4) espelha próxima ação/prazo/responsável no caso.
 *
 * Sem tabela nova, sem CRM paralelo, sem ação externa. Textos em PT-BR.
 */

import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  PROXIMA_ACAO_ABERTURA,
  TITULO_PRIMEIRA_TAREFA_CASO,
  validarAberturaCasoOperacional,
} from "@/lib/abrir-caso-operacional";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import type { LeadDesk } from "@/lib/crm-desk";
import {
  decidirClienteDoHandoff,
  entradaCasoDoLead,
  payloadClienteDoLead,
  podeExecutarHandoffDiscovery,
  type CandidatoCliente,
} from "@/lib/handoff-discovery";
import { assumirOuRecusarComUsuario } from "@/lib/autoridade.server";
import { nomeResponsavelSessao } from "@/lib/cadeia-operacional.server";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { nomeResponsavelPadrao } from "@/lib/responsavel-padrao";
import { autoSatisfazerChecksIdentidade } from "@/lib/checks-identidade-startup";
import { garantirTarefaAberta } from "@/lib/tarefa-garantida.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * O guard `fn_lead_case_id_guard` só aceita `case_id` com `estagio = ganho`.
 * A máquina de estados do lead só avança um passo por vez
 * (novo → qualificado → proposta_em_preparo → proposta_enviada → ganho).
 * Handoff Discovery = abertura formal: percorre a trilha até ganho.
 */
const TRILHA_ATE_GANHO = [
  "novo",
  "qualificado",
  "proposta_em_preparo",
  "proposta_enviada",
  "ganho",
] as const;

async function promoverLeadParaGanho(args: {
  supabase: any;
  leadId: string;
  organizationId: string;
  userId: string;
  estagioAtual: string | null | undefined;
}): Promise<void> {
  const atual = String(args.estagioAtual ?? "novo").toLowerCase();
  if (atual === "ganho") return;
  if (atual === "perdido" || atual === "arquivado") {
    throw new Error(
      `Lead em estágio «${atual}» — reabra a trilha comercial antes do handoff para pessoa e caso.`,
    );
  }
  const idx = TRILHA_ATE_GANHO.indexOf(atual as (typeof TRILHA_ATE_GANHO)[number]);
  if (idx < 0) {
    throw new Error(`Estágio de lead não reconhecido: «${atual}».`);
  }
  for (let i = idx + 1; i < TRILHA_ATE_GANHO.length; i++) {
    await gravarComVerificacao({
      supabase: args.supabase,
      tabela: "leads",
      id: args.leadId,
      organizationId: args.organizationId,
      userId: args.userId,
      payload: { estagio: TRILHA_ATE_GANHO[i] },
    });
  }
}

export type ResultadoHandoffDiscovery =
  | {
      ok: true;
      clienteId: string;
      casoId: string;
      codigoCaso: string | null;
      clienteCriado: boolean;
      casoCriado: boolean;
    }
  | {
      ok: false;
      precisaConfirmarCliente: true;
      candidatos: Array<{ id: string; nome: string; motivo: string }>;
    };

/**
 * P2 CRM Vivo (24/09/2026): o handoff e a conversão ficam na trilha do
 * próprio lead (audit_logs, entidade "lead"), ao lado dos eventos da call.
 * O lead não é apagado nem copiado — só ganha o vínculo com pessoa e caso.
 */
async function registrarHandoffNaTrilhaDoLead(
  supabase: any,
  args: {
    organizationId: string;
    userId: string;
    leadId: string;
    clienteId: string;
    casoId: string;
    codigoCaso: string | null;
    clienteCriado: boolean;
    casoCriado: boolean;
  },
): Promise<void> {
  const base = {
    organization_id: args.organizationId,
    user_id: args.userId,
    entidade: "lead",
    entidade_id: args.leadId,
  };
  const vinculo = {
    fonte: "crm-vivo",
    cliente_id: args.clienteId,
    case_id: args.casoId,
    codigo_caso: args.codigoCaso,
    cliente_criado: args.clienteCriado,
    caso_criado: args.casoCriado,
  };
  try {
    await supabase.from("audit_logs").insert([
      { ...base, acao: "handoff_concluido", metadados: { ...vinculo, evento: "Handoff concluído" } },
      {
        ...base,
        acao: "lead_convertido",
        metadados: { ...vinculo, evento: "Conversão em pessoa canônica e caso" },
      },
    ]);
  } catch (err) {
    console.error("[audit_logs] falha ao registrar handoff na trilha do lead", err);
  }
}

export const executarHandoffDiscovery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      leadId: string;
      clienteIdConfirmado?: string | null;
      forcarCriarCliente?: boolean;
      tipoServico?: string | null;
      rascunho?: Record<string, unknown>;
      motivoOverride?: string | null;
    }) => {
      if (!UUID.test(String(data?.leadId ?? ""))) throw new Error("leadId inválido.");
      if (data.clienteIdConfirmado && !UUID.test(String(data.clienteIdConfirmado))) {
        throw new Error("clienteIdConfirmado inválido.");
      }
      return {
        leadId: String(data.leadId),
        clienteIdConfirmado: data.clienteIdConfirmado ? String(data.clienteIdConfirmado) : null,
        forcarCriarCliente: data.forcarCriarCliente === true,
        tipoServico: data.tipoServico?.trim() || null,
        rascunho: data.rascunho ?? {},
        motivoOverride: data.motivoOverride?.trim() || null,
      };
    },
  )
  .handler(async ({ data, context }): Promise<ResultadoHandoffDiscovery> => {
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const organizationId = await organizacaoDo(supabase, userId);
    const responsavelPadrao = nomeResponsavelPadrao(
      await nomeResponsavelSessao(supabase, organizationId, userId),
    );

    const { data: leadRow, error: errLead } = await supabase
      .from("leads")
      .select("*")
      .eq("id", data.leadId)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .maybeSingle();
    if (errLead) throw new Error(errLead.message);
    if (!leadRow) throw new Error("Lead não encontrado nesta organização.");

    const rascunho = data.rascunho ?? {};
    if (Object.keys(rascunho).filter((k) => rascunho[k] !== undefined).length > 0) {
      await gravarComVerificacao({
        supabase,
        tabela: "leads",
        id: data.leadId,
        organizationId,
        userId,
        payload: rascunho,
      });
    }

    const { data: leadAtual } = await supabase
      .from("leads")
      .select("*")
      .eq("id", data.leadId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    const lead = (leadAtual ?? leadRow) as LeadDesk;

    const gate = podeExecutarHandoffDiscovery(lead);
    if (!gate.ok) {
      // Pendência informa: proprietária assume e segue; demais papéis bloqueiam.
      const assumidas = await assumirOuRecusarComUsuario(
        supabase,
        userId,
        [gate.motivo ?? "Handoff bloqueado."],
        gate.motivo ?? "Handoff bloqueado.",
      );
      if (assumidas.length) {
        await supabase.from("owner_override_events").insert({
          organization_id: organizationId,
          actor_user_id: userId,
          actor_papel: "admin",
          categoria: "override_interno",
          acao: "handoff_discovery_com_pendencia",
          modulo: "mesa_discovery",
          operacao: "avanco_fase_caso",
          entidade: "leads",
          entidade_id: data.leadId,
          motivo:
            data.motivoOverride ||
            "Handoff Discovery avançado pela proprietária com checklist incompleto (startup solo).",
          fonte: "mesa_discovery",
          pendencias_assumidas: assumidas,
          acao_externa: false,
          irreversivel: false,
          confirmacao_manual: true,
          executado: true,
        });
      }
    }

    if (lead.case_id) {
      const { data: casoExistente } = await supabase
        .from("crm_casos")
        .select("id,codigo,cliente_id")
        .eq("id", lead.case_id)
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .maybeSingle();
      if (!casoExistente?.id) throw new Error("O case_id do lead não aponta para um caso ativo.");

      const patchCaso: Record<string, unknown> = {};
      if (lead.proxima_acao) patchCaso.proxima_acao = lead.proxima_acao;
      if (lead.proxima_acao_em) patchCaso.prazo_proxima_acao = lead.proxima_acao_em;
      patchCaso.responsavel_principal =
        lead.responsavel_nome?.trim() || responsavelPadrao;
      patchCaso.responsavel_id = userId;
      if (Object.keys(patchCaso).length) {
        await gravarComVerificacao({
          supabase,
          tabela: "crm_casos",
          id: casoExistente.id as string,
          organizationId,
          userId,
          payload: patchCaso,
        });
      }

      await promoverLeadParaGanho({
        supabase,
        leadId: data.leadId,
        organizationId,
        userId,
        estagioAtual: (lead as { estagio?: string | null }).estagio,
      });

      await gravarComVerificacao({
        supabase,
        tabela: "leads",
        id: data.leadId,
        organizationId,
        userId,
        payload: {
          case_id: casoExistente.id,
          estagio: "ganho",
          eixo_comercial: "diagnostico_em_elaboracao",
        },
      });

      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: casoExistente.id as string,
        eventType: "caso",
        title: "Handoff Discovery reaproveitou caso já existente",
        summaryInternal: (casoExistente.codigo as string | null) ?? undefined,
        sourceEntityType: "leads",
        sourceEntityId: data.leadId,
        userId,
      });

      await registrarHandoffNaTrilhaDoLead(supabase, {
        organizationId,
        userId,
        leadId: data.leadId,
        clienteId: String(casoExistente.cliente_id),
        casoId: casoExistente.id as string,
        codigoCaso: (casoExistente.codigo as string | null) ?? null,
        clienteCriado: false,
        casoCriado: false,
      });

      return {
        ok: true,
        clienteId: String(casoExistente.cliente_id),
        casoId: casoExistente.id as string,
        codigoCaso: (casoExistente.codigo as string | null) ?? null,
        clienteCriado: false,
        casoCriado: false,
      };
    }

    const { data: clientesRows } = await supabase
      .from("clientes")
      .select("id,nome,email,telefone")
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .limit(2000);
    const candidatos = (clientesRows ?? []) as CandidatoCliente[];
    const decisao = data.forcarCriarCliente
      ? ({ acao: "criar" } as const)
      : decidirClienteDoHandoff(
          { nome: lead.nome, email: lead.email, telefone: lead.telefone },
          candidatos,
          data.clienteIdConfirmado,
        );

    if (decisao.acao === "confirmar") {
      return {
        ok: false,
        precisaConfirmarCliente: true,
        candidatos: decisao.candidatos.map((c) => ({
          id: c.id,
          nome: c.nome,
          motivo: c.evidencia.motivo,
        })),
      };
    }

    let clienteId: string;
    let clienteCriado = false;
    if (decisao.acao === "reusar") {
      clienteId = decisao.clienteId;
    } else {
      const payload = payloadClienteDoLead(lead);
      if (!payload.nome) throw new Error("Lead sem nome — não dá para criar pessoa.");
      const criado = await inserirComVerificacao({
        supabase,
        tabela: "clientes",
        organizationId,
        userId,
        payload: {
          nome: payload.nome,
          email: payload.email,
          telefone: payload.telefone,
          origem: payload.origem,
          pais_interesse: payload.pais_interesse,
          classificacao: payload.classificacao,
          status: payload.status,
          observacoes: payload.observacoes,
        },
      });
      clienteId = criado.id;
      clienteCriado = true;
    }

    const entrada = entradaCasoDoLead(lead, clienteId, data.tipoServico);
    const validacao = validarAberturaCasoOperacional(entrada);
    if (!validacao.ok) throw new Error(validacao.erros.join(" "));

    const { data: recente } = await supabase
      .from("crm_casos")
      .select("id,codigo,titulo,cliente_id,tipo_servico,proxima_acao")
      .eq("organization_id", organizationId)
      .eq("cliente_id", entrada.cliente_id)
      .eq("titulo", entrada.titulo)
      .is("archived_at", null)
      .gte("created_at", new Date(Date.now() - 60_000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let casoId: string;
    let codigoCaso: string | null;
    let casoCriado = false;

    if (recente?.id) {
      casoId = recente.id as string;
      codigoCaso = (recente.codigo as string | null) ?? null;
    } else {
      const { data: caso, error } = await supabase
        .from("crm_casos")
        .insert({
          organization_id: organizationId,
          cliente_id: entrada.cliente_id,
          titulo: entrada.titulo,
          tipo_servico: entrada.tipo_servico,
          resumo: entrada.resumo,
          status: "rascunho",
          proxima_acao: lead.proxima_acao?.trim() || PROXIMA_ACAO_ABERTURA,
          prazo_proxima_acao: lead.proxima_acao_em ?? null,
          responsavel_principal: lead.responsavel_nome?.trim() || responsavelPadrao,
          responsavel_id: userId,
          created_by: userId,
          updated_by: userId,
        })
        .select("id,codigo,titulo,cliente_id,tipo_servico,proxima_acao")
        .single();
      if (error) throw new Error(error.message);
      if (!caso?.id) throw new Error("NENHUMA_LINHA_AFETADA: o caso não foi criado.");
      casoId = caso.id as string;
      codigoCaso = (caso.codigo as string | null) ?? null;
      casoCriado = true;

      const tarefa = await garantirTarefaAberta(supabase, {
        organizationId,
        casoId,
        titulo: lead.proxima_acao?.trim() || TITULO_PRIMEIRA_TAREFA_CASO,
        tipo: "geral",
        descricao: "Handoff Discovery — confirmar serviço e jornada no planejador do caso.",
        userId,
      });

      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: casoId,
        eventType: "caso",
        title: "Caso aberto via handoff Discovery",
        summaryInternal: codigoCaso ?? entrada.titulo,
        sourceEntityType: "crm_casos",
        sourceEntityId: casoId,
        userId,
        nextAction: lead.proxima_acao?.trim() || PROXIMA_ACAO_ABERTURA,
      });
      if (tarefa.criada) {
        await registrarTimelineCaso(supabase, {
          organizationId,
          caseId: casoId,
          eventType: "tarefa",
          title: "Tarefa criada",
          summaryInternal: lead.proxima_acao?.trim() || TITULO_PRIMEIRA_TAREFA_CASO,
          sourceEntityType: "tarefas",
          sourceEntityId: tarefa.id,
          userId,
        });
      }
    }

    await promoverLeadParaGanho({
      supabase,
      leadId: data.leadId,
      organizationId,
      userId,
      estagioAtual: (lead as { estagio?: string | null }).estagio,
    });

    await gravarComVerificacao({
      supabase,
      tabela: "leads",
      id: data.leadId,
      organizationId,
      userId,
      payload: {
        case_id: casoId,
        estagio: "ganho",
        eixo_comercial: "diagnostico_em_elaboracao",
      },
    });

    await autoSatisfazerChecksIdentidade(supabase, {
      organizationId,
      caseId: casoId,
      userId,
      temResponsavel: true,
    });

    await registrarHandoffNaTrilhaDoLead(supabase, {
      organizationId,
      userId,
      leadId: data.leadId,
      clienteId,
      casoId,
      codigoCaso,
      clienteCriado,
      casoCriado,
    });

    return {
      ok: true,
      clienteId,
      casoId,
      codigoCaso,
      clienteCriado,
      casoCriado,
    };
  });
