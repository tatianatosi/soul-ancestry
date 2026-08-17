import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ORIGENS_PARAM, PLACEHOLDER_PARAM, confianca, montarPrevia } from "@/lib/contrato-parametros.server";
import { parametrosDoPlanejador } from "@/lib/planejador-parametros";


/* eslint-disable @typescript-eslint/no-explicit-any */

type Sb = any;

async function orgDoUsuario(supabase: Sb, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .maybeSingle();
  const org = data?.organization_id as string | undefined;
  if (!org) throw new Error("Usuário sem organização.");
  return org;
}

function exigirTexto(v: unknown, campo: string, max = 4000) {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`Campo obrigatório: ${campo}.`);
  if (s.length > max) throw new Error(`${campo} excede o limite de ${max} caracteres.`);
  return s;
}

/** Lista os casos reais e o estado do registro mestre de cada um. */
export const listarParametros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as Sb;
    const org = await orgDoUsuario(supabase, context.userId as string);

    const [casos, registros] = await Promise.all([
      supabase
        .from("crm_casos")
        .select("id,codigo,titulo,pais,via,status,demo,cliente_id,contrato_assinado")
        .eq("organization_id", org)
        .eq("demo", false)
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("contract_case_parameters")
        .select("*")
        .eq("organization_id", org)
        .is("archived_at", null),
    ]);

    const porCaso = new Map<string, any>((registros.data ?? []).map((r: any) => [r.case_id, r]));
    return {
      casos: (casos.data ?? []).map((c: any) => ({ ...c, parametros: porCaso.get(c.id) ?? null })),
    };
  });

/** Cria (ou reaproveita) o registro mestre único do caso. */
export const garantirParametros = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const org = await orgDoUsuario(supabase, context.userId as string);

    const { data: caso } = await supabase
      .from("crm_casos")
      .select("id,demo,organization_id,cliente_id")
      .eq("id", data.caseId)
      .maybeSingle();
    if (!caso || caso.organization_id !== org) throw new Error("Caso não encontrado nesta organização.");
    if (caso.demo) throw new Error("Casos de demonstração não alimentam o motor contratual real.");

    const { data: existente } = await supabase
      .from("contract_case_parameters")
      .select("id")
      .eq("case_id", data.caseId)
      .maybeSingle();
    if (existente) return { id: existente.id as string, criado: false };

    const { data: template } = await supabase
      .from("contract_templates")
      .select("id,template_version")
      .eq("organization_id", org)
      .eq("code", "MODELO-ESTUDO")
      .eq("status", "active")
      .maybeSingle();

    const { data: proposta } = await supabase
      .from("proposals")
      .select("id")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("versao", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: novo, error } = await supabase
      .from("contract_case_parameters")
      .insert({
        organization_id: org,
        case_id: data.caseId,
        proposal_id: proposta?.id ?? null,
        contract_template_id: template?.id ?? null,
        contract_template_version: template?.template_version ?? null,
        created_by: context.userId,
        updated_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: novo.id as string, criado: true };
  });

/** Painel completo de um registro mestre. */
export const painelParametros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;

    const { data: registro } = await supabase
      .from("contract_case_parameters")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!registro) throw new Error("Registro de parâmetros não encontrado.");

    const [valores, previas, caso, template, completude, pendencias] = await Promise.all([
      supabase
        .from("contract_parameter_values")
        .select("*")
        .eq("parameters_id", data.id)
        .is("archived_at", null)
        .order("grupo", { ascending: true })
        .order("ordem", { ascending: true }),
      supabase
        .from("contract_parameter_previews")
        .select("id,versao,tipo,placeholders_pendentes,anexos,congelado_em,aprovado_em,aprovado_por,template_code,template_version")
        .eq("parameters_id", data.id)
        .is("archived_at", null)
        .order("versao", { ascending: false }),
      supabase.from("crm_casos").select("*").eq("id", registro.case_id).maybeSingle(),
      registro.contract_template_id
        ? supabase.from("contract_templates").select("id,code,name,template_version,status").eq("id", registro.contract_template_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.rpc("contract_parameters_completude", { _id: data.id }),
      supabase.rpc("contract_parameters_pendencias", { _id: data.id }),
    ]);

    const cliente = caso.data?.cliente_id
      ? (await supabase.from("clientes").select("id,nome,email,telefone,demo").eq("id", caso.data.cliente_id).maybeSingle()).data
      : null;

    const contrato = registro.contract_id
      ? (await supabase.from("contracts").select("id,contract_number,status,signed_at,signature_reference,signed_source").eq("id", registro.contract_id).maybeSingle()).data
      : null;

    return {
      registro,
      caso: caso.data ?? null,
      cliente,
      template: (template as any).data ?? null,
      contrato,
      valores: valores.data ?? [],
      previas: previas.data ?? [],
      completude: completude.data ?? null,
      pendencias: pendencias.data ?? [],
    };
  });

/**
 * Pré-preenchimento seguro: só importa dados já existentes com origem rastreável
 * (CRM e proposta aprovada). Nunca sobrescreve validado com origem menor,
 * nunca usa DEMO, outro caso, placeholder ou inferência.
 */
export const preencherDeOrigens = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;

    const { data: registro } = await supabase
      .from("contract_case_parameters")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!registro) throw new Error("Registro de parâmetros não encontrado.");

    const { data: caso } = await supabase.from("crm_casos").select("*").eq("id", registro.case_id).maybeSingle();
    if (!caso || caso.demo) throw new Error("Origem indisponível: o caso é inválido ou de demonstração.");
    const cliente = caso.cliente_id
      ? (await supabase.from("clientes").select("*").eq("id", caso.cliente_id).maybeSingle()).data
      : null;
    if (cliente?.demo) throw new Error("Cliente de demonstração não pode alimentar o contrato real.");

    const proposta = registro.proposal_id
      ? (await supabase.from("proposals").select("*").eq("id", registro.proposal_id).maybeSingle()).data
      : null;
    const propostaAprovada = proposta && proposta.status === "aprovada" ? proposta : null;

    // Ordem de confiança do pré-carregamento:
    // 1) Planejador homologado, 2) proposta aprovada, 3) CRM confirmado,
    // 4) documento conferido, 5) importado a confirmar.
    const planejador = parametrosDoPlanejador(caso.codigo);

    const candidatos: { campo: string; valor: unknown; origem: string; detalhe: string }[] = [
      ...planejador.parametros.map((p) => ({ campo: p.campo, valor: p.valor, origem: "planejador", detalhe: p.detalhe })),
      { campo: "escopo_resumo", valor: propostaAprovada?.escopo, origem: "proposta", detalhe: `Proposta v${propostaAprovada?.versao ?? ""}` },
      { campo: "servicos_excluidos", valor: propostaAprovada?.exclusoes, origem: "proposta", detalhe: `Proposta v${propostaAprovada?.versao ?? ""}` },
      {
        campo: "valor_total",
        valor: propostaAprovada?.valor != null ? `${propostaAprovada.moeda ?? "BRL"} ${propostaAprovada.valor}` : null,
        origem: "proposta",
        detalhe: `Proposta v${propostaAprovada?.versao ?? ""}`,
      },
      { campo: "forma_pagamento", valor: propostaAprovada?.forma_pagamento, origem: "proposta", detalhe: `Proposta v${propostaAprovada?.versao ?? ""}` },
      { campo: "contratante_nome", valor: cliente?.nome, origem: "crm", detalhe: "Cadastro do cliente" },
      { campo: "contratante_contato", valor: [cliente?.email, cliente?.telefone].filter(Boolean).join(" · "), origem: "crm", detalhe: "Cadastro do cliente" },
      { campo: "contratante_documento", valor: (cliente as any)?.documento, origem: "crm", detalhe: "Cadastro do cliente" },
      { campo: "contratante_endereco", valor: (cliente as any)?.endereco, origem: "crm", detalhe: "Cadastro do cliente" },
      { campo: "objeto_contrato", valor: caso.titulo, origem: "crm", detalhe: `Caso ${caso.codigo}` },
      { campo: "pais_rota", valor: [caso.pais, caso.via].filter(Boolean).join(" / "), origem: "crm", detalhe: `Caso ${caso.codigo}` },
    ];


    const { data: valores } = await supabase
      .from("contract_parameter_values")
      .select("*")
      .eq("parameters_id", data.id)
      .is("archived_at", null);

    let importados = 0;
    const conflitos: { campo: string; atual: string; origem_atual: string; candidato: string; origem_candidata: string }[] = [];

    for (const c of candidatos) {
      const texto = String(c.valor ?? "").trim();
      if (!texto || PLACEHOLDER_PARAM.test(texto)) continue;
      const atual = (valores ?? []).find((v: any) => v.campo === c.campo);
      if (!atual) continue;

      if (atual.valor && atual.valor.trim() === texto) continue;

      if (atual.status === "validado" && atual.valor) {
        if (confianca(c.origem) > confianca(atual.origem)) {
          conflitos.push({
            campo: c.campo,
            atual: atual.valor,
            origem_atual: atual.origem,
            candidato: texto,
            origem_candidata: c.origem,
          });
        } else if (atual.valor !== texto) {
          conflitos.push({
            campo: c.campo,
            atual: atual.valor,
            origem_atual: atual.origem,
            candidato: texto,
            origem_candidata: c.origem,
          });
        }
        await supabase
          .from("contract_parameter_values")
          .update({
            conflito: [{ origem: c.origem, detalhe: c.detalhe, valor: texto, detectado_em: new Date().toISOString() }],
          })
          .eq("id", atual.id);
        continue;
      }

      const { error } = await supabase
        .from("contract_parameter_values")
        .update({
          valor: texto,
          origem: c.origem,
          origem_detalhe: c.detalhe,
          status: "importado_a_confirmar",
        })
        .eq("id", atual.id);
      if (!error) importados += 1;
    }

    return { importados, conflitos, propostaAprovada: Boolean(propostaAprovada) };
  });

/** Grava um parâmetro com origem obrigatória. */
export const salvarParametro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; valor: string; origem: string; origemDetalhe?: string; justificativa?: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const valor = String(data.valor ?? "").trim();
    if (valor && !ORIGENS_PARAM.includes(data.origem as any)) throw new Error("Origem inválida.");
    if (valor.length > 4000) throw new Error("Valor excede 4000 caracteres.");
    if (valor && PLACEHOLDER_PARAM.test(valor)) throw new Error("Placeholder não é aceito como parâmetro contratual.");

    const { error } = await supabase
      .from("contract_parameter_values")
      .update({
        valor: valor || null,
        origem: valor ? data.origem : null,
        origem_detalhe: valor ? (data.origemDetalhe ?? "").slice(0, 300) : null,
        justificativa: (data.justificativa ?? "").slice(0, 500) || null,
        status: valor ? "importado_a_confirmar" : "vazio",
        conflito: [],
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Confirmação humana de um parâmetro (ou bloqueio explícito). */
export const definirStatusParametro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "validado" | "bloqueado" | "importado_a_confirmar"; justificativa?: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;

    const { data: atual } = await supabase
      .from("contract_parameter_values")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!atual) throw new Error("Parâmetro não encontrado.");

    if (data.status === "validado") {
      if (!atual.valor) throw new Error("Não é possível validar um parâmetro vazio.");
      if (["whatsapp", "transcricao"].includes(atual.origem)) {
        throw new Error(
          "Dado de WhatsApp/transcrição não pode ser validado diretamente: confirme com documento, proposta ou preenchimento humano.",
        );
      }
    }
    if (data.status === "bloqueado") exigirTexto(data.justificativa, "justificativa do bloqueio");

    const { error } = await supabase
      .from("contract_parameter_values")
      .update({
        status: data.status,
        justificativa: (data.justificativa ?? "").slice(0, 500) || atual.justificativa,
        conflito: data.status === "validado" ? [] : atual.conflito,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Gera uma prévia imutável versionada a partir dos parâmetros. */
export const gerarPrevia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; tipo: "rascunho" | "final" }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;

    const { data: registro } = await supabase
      .from("contract_case_parameters")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!registro) throw new Error("Registro de parâmetros não encontrado.");

    const [{ data: valores }, { data: caso }, { data: template }] = await Promise.all([
      supabase
        .from("contract_parameter_values")
        .select("*")
        .eq("parameters_id", data.id)
        .is("archived_at", null)
        .order("grupo")
        .order("ordem"),
      supabase.from("crm_casos").select("*").eq("id", registro.case_id).maybeSingle(),
      registro.contract_template_id
        ? supabase.from("contract_templates").select("code,template_version").eq("id", registro.contract_template_id).maybeSingle()
        : Promise.resolve({ data: null } as any),
    ]);

    if (!template?.code) throw new Error("Selecione o MODELO ESTUDO ativo antes de gerar a prévia.");

    const cliente = caso?.cliente_id
      ? (await supabase.from("clientes").select("nome").eq("id", caso.cliente_id).maybeSingle()).data
      : null;

    const previa = montarPrevia({
      tipo: data.tipo,
      caso,
      cliente,
      templateCode: template.code,
      templateVersion: template.template_version ?? null,
      valores: (valores ?? []) as any,
    });

    if (data.tipo === "final" && previa.placeholdersPendentes.length > 0) {
      throw new Error(
        `Versão final bloqueada: ${previa.placeholdersPendentes.length} parâmetro(s) obrigatório(s) ainda não validados.`,
      );
    }

    const { data: ultima } = await supabase
      .from("contract_parameter_previews")
      .select("versao")
      .eq("parameters_id", data.id)
      .order("versao", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: nova, error } = await supabase
      .from("contract_parameter_previews")
      .insert({
        organization_id: registro.organization_id,
        parameters_id: data.id,
        versao: (ultima?.versao ?? 0) + 1,
        tipo: data.tipo,
        conteudo: previa.conteudo,
        html: previa.html,
        anexos: previa.anexos,
        placeholders_pendentes: previa.placeholdersPendentes,
        template_code: template.code,
        template_version: template.template_version ?? null,
        gerado_por: context.userId,
        created_by: context.userId,
        updated_by: context.userId,
      })
      .select("id,versao")
      .single();
    if (error) throw new Error(error.message);

    const completude = await supabase.rpc("contract_parameters_completude", { _id: data.id });
    await supabase
      .from("contract_case_parameters")
      .update({ completude_pct: (completude.data as any)?.pct ?? 0 })
      .eq("id", data.id);

    return { previaId: nova.id as string, versao: nova.versao as number, pendentes: previa.placeholdersPendentes };
  });

/** HTML de uma prévia congelada (visualização interna). */
export const lerPrevia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { previaId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const { data: previa } = await supabase
      .from("contract_parameter_previews")
      .select("id,versao,tipo,html,anexos,placeholders_pendentes")
      .eq("id", data.previaId)
      .maybeSingle();
    if (!previa) throw new Error("Prévia não encontrada.");
    return previa;
  });

/** Revisão humana + aprovação da prévia final. */
export const aprovarParametros = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; previaId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;

    const { data: previa } = await supabase
      .from("contract_parameter_previews")
      .select("*")
      .eq("id", data.previaId)
      .maybeSingle();
    if (!previa) throw new Error("Prévia não encontrada.");
    if (previa.tipo !== "final") throw new Error("Somente a prévia final pode ser aprovada.");
    if ((previa.placeholders_pendentes ?? []).length > 0) {
      throw new Error("Há campos obrigatórios em placeholder. Aprovação bloqueada.");
    }

    const { error: e1 } = await supabase
      .from("contract_parameter_previews")
      .update({ aprovado_por: context.userId, aprovado_em: new Date().toISOString() })
      .eq("id", data.previaId);
    if (e1) throw new Error(e1.message);

    const agora = new Date().toISOString();
    const { error: e2 } = await supabase
      .from("contract_case_parameters")
      .update({
        status: "aprovado",
        revisao_humana_por: context.userId,
        revisao_humana_em: agora,
        aprovado_por: context.userId,
        aprovado_em: agora,
      })
      .eq("id", data.id);
    if (e2) throw new Error(e2.message);

    return { ok: true };
  });

/**
 * Reuso downstream: cria/atualiza o contrato, as partes e o escopo a partir
 * dos parâmetros aprovados. Nenhum destino pede redigitação.
 */
export const enviarParaAssinatura = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;

    const { data: registro } = await supabase
      .from("contract_case_parameters")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!registro) throw new Error("Registro de parâmetros não encontrado.");
    if (registro.status !== "aprovado") throw new Error("Aprove os parâmetros antes de enviar para assinatura.");

    const { data: valores } = await supabase
      .from("contract_parameter_values")
      .select("*")
      .eq("parameters_id", data.id)
      .is("archived_at", null);
    const pegar = (campo: string) => (valores ?? []).find((v: any) => v.campo === campo)?.valor ?? null;

    const { data: caso } = await supabase.from("crm_casos").select("*").eq("id", registro.case_id).maybeSingle();

    let contratoId = registro.contract_id as string | null;
    if (!contratoId) {
      const numero = `CTR-${caso?.codigo ?? "CASO"}-${new Date().getFullYear()}`;
      const { data: novo, error } = await supabase
        .from("contracts")
        .insert({
          organization_id: registro.organization_id,
          contract_number: numero,
          contract_type: "contract_base",
          title: pegar("objeto_contrato") ?? `Instrumento — ${caso?.codigo}`,
          case_id: registro.case_id,
          client_id: caso?.cliente_id ?? null,
          proposal_id: registro.proposal_id,
          template_id: registro.contract_template_id,
          status: "in_review",
          purpose_summary: pegar("objeto_contrato"),
          scope_summary: pegar("escopo_resumo"),
          exclusions_summary: pegar("servicos_excluidos"),
          demo: false,
          created_by: context.userId,
          updated_by: context.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      contratoId = novo.id as string;

      await supabase.from("contract_parties").insert({
        organization_id: registro.organization_id,
        contract_id: contratoId,
        role: "contratante",
        client_id: caso?.cliente_id ?? null,
        person_name: pegar("contratante_nome") ?? "",
        document_number: pegar("contratante_documento"),
        address: pegar("contratante_endereco"),
        signature_required: true,
        created_by: context.userId,
        updated_by: context.userId,
      });

      const escopo = [
        { category: "included", title: "Serviços incluídos", description: pegar("servicos_incluidos") },
        { category: "excluded", title: "Serviços excluídos", description: pegar("servicos_excluidos") },
        { category: "deliverable", title: "Fases e entregas", description: pegar("fases_entregas") },
      ].filter((s) => s.description);
      if (escopo.length) {
        await supabase.from("contract_scope_items").insert(
          escopo.map((s, i) => ({
            organization_id: registro.organization_id,
            contract_id: contratoId,
            category: s.category,
            title: s.title,
            description: s.description,
            status: "approved",
            source_type: "contract_parameters",
            source_reference: data.id,
            display_order: i,
            created_by: context.userId,
            updated_by: context.userId,
          })),
        );
      }
    }

    const { error: e2 } = await supabase
      .from("contract_case_parameters")
      .update({ contract_id: contratoId, status: "enviado_assinatura" })
      .eq("id", data.id);
    if (e2) throw new Error(e2.message);

    return { contratoId };
  });

/** Registro humano da assinatura externa — reusa as partes já aprovadas. */
export const registrarAssinatura = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; dataAssinatura: string; origemExterna: string; referencia: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const dataAssinatura = exigirTexto(data.dataAssinatura, "data da assinatura", 40);
    const origem = exigirTexto(data.origemExterna, "origem externa da assinatura", 200);
    const referencia = exigirTexto(data.referencia, "referência da assinatura", 200);

    const { data: registro } = await supabase
      .from("contract_case_parameters")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!registro?.contract_id) throw new Error("Envie para assinatura antes de registrar o instrumento assinado.");

    const { count } = await supabase
      .from("contract_parties")
      .select("id", { count: "exact", head: true })
      .eq("contract_id", registro.contract_id)
      .eq("signature_required", true);
    if (!count) throw new Error("Não há partes signatárias qualificadas no contrato.");

    const { error } = await supabase
      .from("contracts")
      .update({
        status: "signed",
        signed_at: new Date(dataAssinatura).toISOString(),
        signed_source: origem,
        signature_reference: referencia,
        updated_by: context.userId,
      })
      .eq("id", registro.contract_id);
    if (error) throw new Error(error.message);

    await supabase.from("contract_case_parameters").update({ status: "assinado" }).eq("id", data.id);
    return { ok: true };
  });

/** Destinos que reutilizam os parâmetros aprovados — leitura, sem redigitação. */
export const destinosParametros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const { data: registro } = await supabase
      .from("contract_case_parameters")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!registro) throw new Error("Registro não encontrado.");

    const assinado = registro.status === "assinado";
    const aprovado = ["aprovado", "enviado_assinatura", "assinado"].includes(registro.status);

    return {
      destinos: [
        {
          nome: "Assinatura",
          recebe: "Partes qualificadas e instrumento aprovado do mesmo contract_id",
          liberado: ["enviado_assinatura", "assinado"].includes(registro.status),
          bloqueio: aprovado ? null : "Aguardando aprovação dos parâmetros",
        },
        {
          nome: "Financeiro",
          recebe: "Somente condições comerciais aprovadas (valor, parcelas, vencimentos)",
          liberado: assinado,
          bloqueio: assinado ? null : "Cobrança bloqueada até o gate de contrato assinado",
        },
        {
          nome: "Caso / CRM",
          recebe: "Identificadores e status operacionais necessários",
          liberado: aprovado,
          bloqueio: aprovado ? null : "Aguardando aprovação dos parâmetros",
        },
        {
          nome: "Portal do cliente",
          recebe: "Somente projeções explicitamente liberadas",
          liberado: false,
          bloqueio: "Liberação individual e manual pela equipe",
        },
      ],
    };
  });
