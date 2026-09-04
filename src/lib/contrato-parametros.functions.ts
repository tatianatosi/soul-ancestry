import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  EVENTOS_SNAPSHOT,
  ORIGENS_PARAM,
  PLACEHOLDER_PARAM,
  anexosPorRegra,
  confianca,
  hashConteudo,
  montarPrevia,
  type EventoSnapshot,
} from "@/lib/contrato-parametros.server";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import {
  CLAUSULAS_FIXAS,
  CONTRATO_BASE_ID,
  CONTRATO_BASE_MODELO,
  CONTRATO_BASE_STATUS,
  CONTRATO_BASE_VERSAO,
  PERFIL_INSTITUCIONAL,
  PERFIL_INSTITUCIONAL_VERSAO,
  PREAMBULO_CONTRATO_BASE,
  qualificacaoCompletaContratada,
} from "@/lib/contrato-base-consolidado";
import { renderCorpoContratual } from "@/lib/contrato-corpo.server";
import {
  instanciasDeAnexos,
  sincronizarAnexosPersistidos,
  sincronizarComercialDaProposta,
} from "@/lib/anexos-persistidos.server";
import { ehAnexoRevisado, planejarMaterializacao } from "@/lib/anexos-materializacao";


import { parametrosDoPlanejador } from "@/lib/planejador-parametros";
import { CONFLITO_PAIS_ROTA, textoCompativel, qualificadorPaisDoCodigo } from "@/lib/coerencia-caso";
import { MARCA_CORRECAO_PLANEJADOR, exigirCoerencia, temCorrecaoHomologada } from "@/lib/coerencia-caso.server";
import { exigirGate } from "@/lib/escopo-conferencia.server";
import { definicaoCampo, validarValorCampo } from "@/lib/parametros-dicionario";
import { candidatosComerciaisDaProposta, propostaAptaParaPrecarga } from "@/lib/proposta-comercial";

/** Chave de conflito por campo quando a proposta aprovada diverge do valor homologado no Planejador. */
const CONFLITO_PROPOSTA_PLANEJADOR = "proposal_planner_value_conflict";


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
    semCache();
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
    semCache();
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

    const valoresLista = await preencherQualificacaoContratada(supabase, data.id, (valores.data ?? []) as any[]);

    return {
      registro,
      caso: caso.data ?? null,
      cliente,
      template: (template as any).data ?? null,
      contrato,
      valores: valoresLista,
      previas: previas.data ?? [],
      completude: completude.data ?? null,
      pendencias: pendencias.data ?? [],
    };
  });

/**
 * A qualificação completa da contratada é dado institucional fixo (mesma
 * razão social, CNPJ e endereço em todo caso), não algo que varia por
 * caso — nunca deveria exigir preenchimento humano repetido. Se o campo
 * `contratada_qualificacao` ainda está vazio, grava o texto já homologado
 * em `perfil-institucional` (origem "documento", status
 * "importado_a_confirmar" — mesma trilha usada para outras pré-cargas
 * automáticas) em vez de deixar a proprietária digitar o próprio nome de
 * novo em cada caso.
 */
async function preencherQualificacaoContratada(supabase: Sb, parametersId: string, valores: any[]) {
  const linha = valores.find((v) => v.campo === "contratada_qualificacao");
  if (!linha || linha.valor?.trim()) return valores;

  const { data: atualizado, error } = await supabase
    .from("contract_parameter_values")
    .update({
      valor: qualificacaoCompletaContratada(),
      origem: "documento",
      origem_detalhe: "Perfil institucional homologado do Clube Ancestral.",
      status: "importado_a_confirmar",
    })
    .eq("id", linha.id)
    .select("*")
    .maybeSingle();
  if (error || !atualizado) return valores;

  return valores.map((v) => (v.id === linha.id ? atualizado : v));
}

/**
 * Pré-preenchimento seguro: importa EXCLUSIVAMENTE os parâmetros homologados do
 * Planejador Universal (origem `planejador`). CRM, proposta, WhatsApp,
 * transcrição e qualquer outra fonte de menor confiança nunca entram na
 * pré-carga — só por preenchimento humano registrado na própria ficha.
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

    // Fonte única da pré-carga: Planejador Universal homologado.
    const planejador = parametrosDoPlanejador(caso.codigo);
    if (!planejador.convencao) {
      throw new Error("Sem convenção homologada no Planejador para este caso: nada a pré-carregar.");
    }

    const candidatos: { campo: string; valor: unknown; origem: string; detalhe: string }[] =
      planejador.parametros.map((p) => ({ campo: p.campo, valor: p.valor, origem: "planejador", detalhe: p.detalhe }));

    // Exceção controlada (somente domínio comercial): quando o Planejador não
    // possui parâmetro financeiro homologado para a rota, a proposta vinculada,
    // ativa e aprovada pré-carrega os campos comerciais como
    // `importado_a_confirmar`. Planejador continua tendo precedência: se ele
    // homologou o campo, a proposta só pode gerar conflito, nunca sobrescrever.
    const { data: propostaCaso } = await supabase
      .from("proposals")
      .select("id,versao,status,archived_at,valor,moeda,forma_pagamento,escopo,exclusoes")
      .eq("case_id", registro.case_id)
      .is("archived_at", null)
      .order("versao", { ascending: false })
      .limit(1)
      .maybeSingle();

    const propostaApta = propostaAptaParaPrecarga(propostaCaso as any);
    const camposDoPlanejador = new Set(candidatos.map((c) => c.campo));
    const conflitosProposta: { campo: string; proposta: string; planejador: string }[] = [];
    const candidatosProposta = candidatosComerciaisDaProposta(propostaCaso as any);
    for (const c of candidatosProposta) {
      const homologado = candidatos.find((p) => p.campo === c.campo);
      if (homologado) {
        if (String(homologado.valor ?? "").trim() !== c.valor) {
          conflitosProposta.push({ campo: c.campo, proposta: c.valor, planejador: String(homologado.valor ?? "") });
        }
        continue;
      }
      candidatos.push({ campo: c.campo, valor: c.valor, origem: "proposta", detalhe: c.detalhe });
    }




    const { data: valores } = await supabase
      .from("contract_parameter_values")
      .select("*")
      .eq("parameters_id", data.id)
      .is("archived_at", null);

    let importados = 0;
    const conflitos: { campo: string; atual: string; origem_atual: string; candidato: string; origem_candidata: string }[] = [];

    const qualificador = qualificadorPaisDoCodigo(caso.codigo);
    const incoerentes: { campo: string; valor: string; esperado: string }[] = [];

    // Higiene: valor gravado com origem `planejador` que não corresponde mais à
    // convenção homologada (campo revogado ou país incoerente com o código canônico)
    // é limpo, virando pendência — nunca permanece herdado de outra cidadania.
    const camposHomologados = new Set(candidatos.map((c) => c.campo));
    const limpos: { campo: string; valor: string }[] = [];
    for (const v of (valores ?? []) as any[]) {
      if (v.origem !== "planejador" || !v.valor?.trim()) continue;
      if (temCorrecaoHomologada(v)) continue;
      const revogado = !camposHomologados.has(v.campo);
      const incoerente = Boolean(qualificador) && !textoCompativel(v.valor, qualificador!.sigla);
      if (!revogado && !incoerente) continue;
      const { error } = await supabase
        .from("contract_parameter_values")
        .update({
          valor: "",
          status: "vazio",
          origem: null,
          origem_detalhe: null,
          conflito: [],
          justificativa: revogado
            ? `Parâmetro revogado na convenção homologada ${planejador.convencao?.prefixo} (${planejador.versao}): valor anterior removido e devolvido a pendência.`
            : `Valor incoerente com o qualificador de país do código canônico (${qualificador?.pais}): removido e devolvido a pendência.`,
        })
        .eq("id", v.id);

      if (!error) {
        limpos.push({ campo: v.campo, valor: v.valor });
        v.valor = "";
        v.status = "vazio";
        v.origem = null;
      }

    }


    for (const c of candidatos) {
      const texto = String(c.valor ?? "").trim();
      if (!texto || PLACEHOLDER_PARAM.test(texto)) continue;
      const atual = (valores ?? []).find((v: any) => v.campo === c.campo);
      if (!atual) continue;

      // Correção humana homologada nunca é sobrescrita pela pré-carga.
      if (temCorrecaoHomologada(atual)) continue;

      // Coerência com o qualificador de país do código canônico.
      if (qualificador && !textoCompativel(texto, qualificador.sigla)) {
        incoerentes.push({ campo: c.campo, valor: texto, esperado: qualificador.pais });
        await supabase
          .from("contract_parameter_values")
          .update({
            conflito: [
              {
                chave: CONFLITO_PAIS_ROTA,
                origem: c.origem,
                detalhe: c.detalhe,
                valor: texto,
                esperado: qualificador.pais,
                detectado_em: new Date().toISOString(),
              },
            ],
          })
          .eq("id", atual.id);
        continue;
      }

      if (atual.valor && atual.valor.trim() === texto) {
        // Mesmo valor, origem diferente: a ficha passa a registrar a proposta
        // aprovada como fonte, preservando a origem anterior na auditoria.
        if (c.origem === "proposta" && atual.origem !== "proposta" && atual.status !== "validado") {
          await supabase
            .from("contract_parameter_values")
            .update({
              origem: "proposta",
              origem_detalhe: c.detalhe,
              justificativa: `Origem corrigida para proposta aprovada após conferência; origem anterior: ${atual.origem ?? "não informada"}.`,
            })
            .eq("id", atual.id);
          atual.origem = "proposta";
        }
        continue;
      }

      // Fonte de menor confiança nunca sobrescreve valor já carregado
      // (o Planejador homologado é a fonte mais confiável): vira conflito.
      // A proposta também nunca sobrescreve valor já presente: só abre conflito.
      const menorConfianca = Boolean(atual.valor) && confianca(c.origem) < confianca(atual.origem);
      const propostaSobreValorExistente = c.origem === "proposta" && Boolean(atual.valor?.trim());

      if ((atual.status === "validado" && atual.valor) || menorConfianca || propostaSobreValorExistente) {

        conflitos.push({
          campo: c.campo,
          atual: atual.valor,
          origem_atual: atual.origem,
          candidato: texto,
          origem_candidata: c.origem,
        });
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
      if (!error) {
        importados += 1;
        // mantém o estado local coerente para os próximos candidatos do mesmo campo
        atual.valor = texto;
        atual.origem = c.origem;
        atual.origem_detalhe = c.detalhe;
        atual.status = "importado_a_confirmar";
      }
    }

    // Divergência proposta × Planejador: o Planejador já venceu na pré-carga acima
    // (candidatos só tem o valor do Planejador quando ele existe, linha ~298), mas a
    // proposta descartada não fica visível em lugar nenhum — some ao fechar o toast
    // desta ação. Grava a mesma marca de conflito por campo (contract_parameter_values.conflito)
    // já usada para incoerência de país/rota, para que apareça de forma persistente em
    // LinhaParametro e possa ser resolvida do mesmo jeito (editar o valor limpa o conflito).
    for (const cp of conflitosProposta) {
      const atual = (valores ?? []).find((v: any) => v.campo === cp.campo);
      if (!atual) continue;
      await supabase
        .from("contract_parameter_values")
        .update({
          conflito: [
            {
              chave: CONFLITO_PROPOSTA_PLANEJADOR,
              origem: "proposta",
              detalhe: `Proposta aprovada tem valor diferente do homologado no Planejador (${cp.planejador || "vazio"}).`,
              valor: cp.proposta,
              esperado: cp.planejador,
              detectado_em: new Date().toISOString(),
            },
          ],
        })
        .eq("id", atual.id);
    }

    return {
      importados,
      conflitos,
      incoerentes,
      limpos,
      propostaAprovada: propostaApta,
      proposta: propostaApta
        ? {
            id: String((propostaCaso as any).id),
            versao: Number((propostaCaso as any).versao ?? 1),
            campos: candidatosProposta.map((c) => c.campo),
            conflitos: conflitosProposta,
          }
        : null,


      planejador: {
        convencao: planejador.convencao?.prefixo ?? null,
        versao: planejador.versao,
        homologadoEm: planejador.homologadoEm,
        campos: planejador.parametros.length,
      },
    };
  });


/** Grava um parâmetro com origem obrigatória e valor dentro do dicionário. */
export const salvarParametro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; valor: string; origem: string; origemDetalhe?: string; justificativa?: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const valor = String(data.valor ?? "").trim();
    if (valor && !ORIGENS_PARAM.includes(data.origem as any)) throw new Error("Origem inválida.");
    if (valor.length > 4000) throw new Error("Valor excede 4000 caracteres.");
    if (valor && PLACEHOLDER_PARAM.test(valor)) throw new Error("Placeholder não é aceito como parâmetro contratual.");

    const { data: linha } = await supabase
      .from("contract_parameter_values")
      .select("id,campo,valor,organization_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!linha) throw new Error("Parâmetro não encontrado.");

    const check = validarValorCampo({
      campo: linha.campo,
      valor,
      origem: data.origem,
      justificativa: data.justificativa,
      valorAtual: linha.valor,
    });
    if (!check.ok) throw new Error(check.erro);

    const r = await gravarComVerificacao({
      supabase,
      tabela: "contract_parameter_values",
      id: data.id,
      organizationId: linha.organization_id,
      userId: context.userId as string,
      payload: {
        valor: valor || null,
        origem: valor ? data.origem : null,
        origem_detalhe: valor ? (data.origemDetalhe ?? "").slice(0, 300) : null,
        justificativa: (data.justificativa ?? "").slice(0, 500) || null,
        status: valor ? "importado_a_confirmar" : "vazio",
        conflito: [],
      },
    });
    return { ok: true, salvoEm: r.salvoEm };
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
      const def = definicaoCampo(atual.campo);
      if (confianca(atual.origem) < def.confiancaMinima) {
        throw new Error(
          `Confiança insuficiente para validar “${atual.label}”: este campo exige origem de confiança ${def.confiancaMinima} ou superior.`,
        );
      }
    }

    if (data.status === "bloqueado") exigirTexto(data.justificativa, "justificativa do bloqueio");

    const r = await gravarComVerificacao({
      supabase,
      tabela: "contract_parameter_values",
      id: data.id,
      organizationId: atual.organization_id,
      userId: context.userId as string,
      payload: {
        status: data.status,
        justificativa: (data.justificativa ?? "").slice(0, 500) || atual.justificativa,
        conflito: data.status === "validado" ? [] : atual.conflito,
      },
    });
    return { ok: true, salvoEm: r.salvoEm };
  });

/** Gera uma prévia imutável versionada a partir dos parâmetros. */
/**
 * Monta o conteúdo da prévia a partir dos parâmetros do registro mestre.
 * Não grava nada: quem grava decide se é rascunho editável ou snapshot.
 */
async function montarDoRegistro(supabase: Sb, id: string, tipo: "rascunho" | "final") {
  const { data: registro } = await supabase.from("contract_case_parameters").select("*").eq("id", id).maybeSingle();
  if (!registro) throw new Error("Registro de parâmetros não encontrado.");

  const [{ data: valores }, { data: caso }, { data: template }] = await Promise.all([
    supabase
      .from("contract_parameter_values")
      .select("*")
      .eq("parameters_id", id)
      .is("archived_at", null)
      .order("grupo")
      .order("ordem"),
    supabase.from("crm_casos").select("*").eq("id", registro.case_id).maybeSingle(),
    registro.contract_template_id
      ? supabase.from("contract_templates").select("code,template_version").eq("id", registro.contract_template_id).maybeSingle()
      : Promise.resolve({ data: null } as any),
  ]);

  if (!template?.code) throw new Error("Selecione o MODELO ESTUDO ativo antes de gerar a prévia.");
  if (!["MODELO-ESTUDO", "BASE-GEN-V2"].includes(template.code)) {
    throw new Error("Modelo histórico não pode gerar prévia. Use MODELO-ESTUDO + BASE-GEN-V2.");
  }

  const cliente = caso?.cliente_id
    ? (await supabase.from("clientes").select("nome").eq("id", caso.cliente_id).maybeSingle()).data
    : null;

  const valoresFicha = ((valores ?? []) as any[]).map((v) => ({
    campo: v.campo,
    valor: v.valor,
    origem: v.origem,
    status: v.status,
  }));

  const anexosInternos = anexosPorRegra({
    produto: valoresFicha.find((v) => v.campo === "produto_sku")?.valor ?? null,
    pais: valoresFicha.find((v) => v.campo === "pais_rota")?.valor ?? null,
    membros: valoresFicha.find((v) => v.campo === "beneficiarios")?.valor ?? null,
    representacao: valoresFicha.find((v) => v.campo === "representacao_legal")?.valor ?? null,
  });

  const corpo = renderCorpoContratual({
    caseId: registro.case_id,
    casoCodigo: caso?.codigo ?? null,
    clienteNome: cliente?.nome ?? null,
    responsavel: null,
    valores: valoresFicha,
    anexosInternos,
  });

  const previa = montarPrevia({
    tipo,
    caso,
    cliente,
    templateCode: template.code,
    templateVersion: template.template_version ?? null,
    valores: (valores ?? []) as any,
    corpo,
  });

  return { registro, template, previa, corpo, anexosInternos };
}


async function atualizarCompletude(supabase: Sb, id: string) {
  const completude = await supabase.rpc("contract_parameters_completude", { _id: id });
  await supabase
    .from("contract_case_parameters")
    .update({ completude_pct: (completude.data as any)?.pct ?? 0 })
    .eq("id", id);
}

/**
 * Persistência do motor: instâncias versionadas dos anexos + condição comercial
 * derivada da proposta/OS aprovada. Nenhuma cobrança ou envio é executado.
 */
async function sincronizarMotor(
  supabase: Sb,
  input: { registro: any; previaId: string; userId: string; corpo: any; anexosInternos: any[] },
) {
  const instancias = instanciasDeAnexos({ anexos: input.corpo.anexos, internos: input.anexosInternos as any });
  const anexosPersistidos = await sincronizarAnexosPersistidos(
    supabase,
    {
      organizationId: input.registro.organization_id,
      caseId: input.registro.case_id,
      parametersId: input.registro.id,
      previaId: input.previaId,
      contractId: input.registro.contract_id ?? null,
      userId: input.userId,
    },
    instancias,
  );
  const comercial = await sincronizarComercialDaProposta(supabase, {
    organizationId: input.registro.organization_id,
    caseId: input.registro.case_id,
    userId: input.userId,
  });
  return { anexosPersistidos, comercial };
}




/**
 * Materializa os Anexos II, IV e V JÁ REVISADOS JURIDICAMENTE como instância
 * documental canônica do caso. Cria apenas vínculo e versão: nunca reescreve
 * conteúdo aprovado, nunca toca instância assinada/anexada/arquivada e nunca
 * dispara ação externa.
 */
export const materializarAnexosRevisados = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; confirmar?: boolean }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const userId = context.userId as string;
    const { registro, corpo } = await montarDoRegistro(supabase, data.id, "rascunho");

    const todas = instanciasDeAnexos({ anexos: corpo.anexos, internos: [] });
    const doLote = todas.filter((i) => ehAnexoRevisado(i.annex_code));

    const { data: existentes } = await supabase
      .from("contract_annexes")
      .select("annex_code,title,status,annex_version,model_version,file_hash,rendered_html,updated_at,is_test")
      .eq("organization_id", registro.organization_id)
      .eq("case_id", registro.case_id)
      .is("archived_at", null);

    const persistidas = ((existentes ?? []) as any[]).map((l) => ({
      annex_code: l.annex_code as string,
      title: (l.title ?? "") as string,
      status: (l.status ?? "") as string,
      annex_version: Number(l.annex_version ?? 0),
      model_version: (l.model_version ?? null) as string | null,
      file_hash: (l.file_hash ?? null) as string | null,
      tem_conteudo: Boolean(String(l.rendered_html ?? "").trim()),
      atualizado_em: (l.updated_at ?? null) as string | null,
      is_test: Boolean(l.is_test),
    }));

    const plano = planejarMaterializacao({
      candidatos: doLote.map((i) => ({
        codigo: i.annex_code,
        titulo: i.title,
        hash: hashConteudo({ d: i.structured_data, s: i.status, m: i.model_version }),
      })),
      persistidas,
    });

    if (!data.confirmar) return { simulado: true, plano, materializados: 0 };

    const codigosAMaterializar = new Set(plano.filter((p) => p.acao === "materializar").map((p) => p.codigo));
    const aGravar = doLote.filter((i) => codigosAMaterializar.has(i.annex_code));
    if (!aGravar.length) return { simulado: false, plano, materializados: 0 };

    const { data: previa } = await supabase
      .from("contract_parameter_previews")
      .select("id")
      .eq("parameters_id", registro.id)
      .is("archived_at", null)
      .order("versao", { ascending: false })
      .limit(1)
      .maybeSingle();

    const resultado = await sincronizarAnexosPersistidos(
      supabase,
      {
        organizationId: registro.organization_id,
        caseId: registro.case_id,
        parametersId: registro.id,
        previaId: (previa?.id as string) ?? null,
        contractId: registro.contract_id ?? null,
        userId,
      },
      aGravar,
    );

    await supabase.from("audit_logs").insert({
      organization_id: registro.organization_id,
      entidade: "contract_annexes",
      entidade_id: registro.case_id,
      acao: "anexos_revisados_materializados",
      user_id: userId,
      metadados: {
        parameters_id: registro.id,
        case_id: registro.case_id,
        lote: "ANEXOS-II-IV-V-REVISADOS",
        plano,
        versoes_novas: resultado.novas,
        mantidas: resultado.mantidas,
        observacao: "Somente vínculo e versão. Conteúdo jurídico aprovado não foi reescrito.",
      },
    });

    return { simulado: false, plano, materializados: resultado.novas, mantidas: resultado.mantidas };
  });

/**
 * Auto-cura (D-02): re-sincroniza as instâncias de TODOS os anexos —
 * incluindo o Anexo I, Ordem de Serviço — a partir da ficha atual do caso,
 * sem exigir uma nova prévia e sem inventar dado. Corrige o caso em que
 * `contract_annexes` ficou vazio porque a última prévia do caso é anterior
 * à entrada em operação da camada de persistência (`sincronizarAnexosPersistidos`
 * só é chamada, no caminho normal, a partir de `gerarPrevia`/`congelarPrevia`).
 * Idempotente: só grava quando o hash do conteúdo muda; instância já
 * congelada (assinada/anexada/arquivada) nunca é sobrescrita, porque
 * `sincronizarAnexosPersistidos` sempre cria versão nova, nunca edita a atual.
 */
export const ressincronizarAnexosDoCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; confirmar?: boolean }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const userId = context.userId as string;
    const { registro, corpo, anexosInternos } = await montarDoRegistro(supabase, data.id, "rascunho");

    const instancias = instanciasDeAnexos({ anexos: corpo.anexos, internos: anexosInternos as any });

    const { data: existentes } = await supabase
      .from("contract_annexes")
      .select("annex_code,annex_version,file_hash")
      .eq("organization_id", registro.organization_id)
      .eq("case_id", registro.case_id)
      .is("archived_at", null);

    const vigentePorCodigo = new Map<string, any>();
    for (const l of (existentes ?? []) as any[]) {
      const atual = vigentePorCodigo.get(l.annex_code);
      if (!atual || l.annex_version > atual.annex_version) vigentePorCodigo.set(l.annex_code, l);
    }

    const plano = instancias.map((i) => {
      const hash = hashConteudo({ d: i.structured_data, s: i.status, m: i.model_version });
      const vigente = vigentePorCodigo.get(i.annex_code);
      return {
        codigo: i.annex_code,
        titulo: i.title,
        acao: (vigente && vigente.file_hash === hash ? "ja_canonica" : "materializar") as
          | "ja_canonica"
          | "materializar",
        versaoAtual: (vigente?.annex_version as number | undefined) ?? null,
      };
    });

    if (!data.confirmar) return { simulado: true, plano, materializados: 0 };

    const { data: previa } = await supabase
      .from("contract_parameter_previews")
      .select("id")
      .eq("parameters_id", registro.id)
      .is("archived_at", null)
      .order("versao", { ascending: false })
      .limit(1)
      .maybeSingle();

    const resultado = await sincronizarAnexosPersistidos(
      supabase,
      {
        organizationId: registro.organization_id,
        caseId: registro.case_id,
        parametersId: registro.id,
        previaId: (previa?.id as string) ?? null,
        contractId: registro.contract_id ?? null,
        userId,
      },
      instancias,
    );

    await supabase.from("audit_logs").insert({
      organization_id: registro.organization_id,
      entidade: "contract_annexes",
      entidade_id: registro.case_id,
      acao: "anexos_ressincronizados_da_ficha_atual",
      user_id: userId,
      metadados: {
        parameters_id: registro.id,
        case_id: registro.case_id,
        motivo: "D-02: ultima previa anterior a entrada em operacao da camada de persistencia",
        plano,
        versoes_novas: resultado.novas,
        mantidas: resultado.mantidas,
      },
    });

    return { simulado: false, plano, materializados: resultado.novas, mantidas: resultado.mantidas };
  });

/**
 * Rascunho de trabalho: UM por case_id + modelo ativo. Salvar atualiza o mesmo
 * rascunho; conteúdo idêntico não gera nem versão nem novo registro.
 */
export const gerarPrevia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; tipo: "rascunho" | "final" }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const { registro, template, previa, corpo, anexosInternos } = await montarDoRegistro(supabase, data.id, "rascunho");
    if (data.tipo === "final") {
      await exigirCoerencia(supabase, registro);
      await exigirGate(supabase, {
        caseId: registro.case_id,
        acao: "gerar_versao_final",
        userId: context.userId as string,
        organizationId: registro.organization_id,
      });
    }

    const hash = hashConteudo(previa.conteudo);

    const { data: rascunho } = await supabase
      .from("contract_parameter_previews")
      .select("id,versao,conteudo_hash")
      .eq("parameters_id", data.id)
      .eq("estado", "rascunho_editavel")
      .is("archived_at", null)
      .maybeSingle();

    if (rascunho) {
      if (rascunho.conteudo_hash === hash) {
        await supabase
          .from("contract_parameter_previews")
          .update({ updated_by: context.userId })
          .eq("id", rascunho.id);
        await atualizarCompletude(supabase, data.id);
        return {
          previaId: rascunho.id as string,
          versao: rascunho.versao as number,
          identico: true,
          rascunho: true,
          pendentes: previa.placeholdersPendentes,
        };
      }
      const { error } = await supabase
        .from("contract_parameter_previews")
        .update({
          conteudo: previa.conteudo,
          html: previa.html,
          anexos: previa.anexos,
          placeholders_pendentes: previa.placeholdersPendentes,
          conteudo_hash: hash,
          evento: "rascunho_atualizado",
          corpo_contratual: previa.corpoContratual,
          legado_sem_corpo: false,
          legado_sem_evento: false,
          template_code: template.code,
          template_version: template.template_version ?? null,
          gerado_por: context.userId,
          updated_by: context.userId,
        })
        .eq("id", rascunho.id);
      if (error) throw new Error(error.message);
      const sync = await sincronizarMotor(supabase, {
        registro,
        previaId: rascunho.id as string,
        userId: context.userId as string,
        corpo,
        anexosInternos,
      });
      await atualizarCompletude(supabase, data.id);
      return {
        previaId: rascunho.id as string,
        versao: rascunho.versao as number,
        identico: false,
        rascunho: true,
        pendentes: previa.placeholdersPendentes,
        ...sync,
      };
    }


    const { data: nova, error } = await supabase
      .from("contract_parameter_previews")
      .insert({
        organization_id: registro.organization_id,
        parameters_id: data.id,
        versao: 0,
        tipo: "rascunho",
        estado: "rascunho_editavel",
        evento: "rascunho_atualizado",
        motivo: "Rascunho de trabalho do caso",
        conteudo: previa.conteudo,
        conteudo_hash: hash,
        html: previa.html,
        anexos: previa.anexos,
        placeholders_pendentes: previa.placeholdersPendentes,
        corpo_contratual: previa.corpoContratual,
        template_code: template.code,
        template_version: template.template_version ?? null,
        gerado_por: context.userId,
        created_by: context.userId,
        updated_by: context.userId,
      })
      .select("id,versao")
      .single();
    if (error) throw new Error(error.message);
    const sync = await sincronizarMotor(supabase, {
      registro,
      previaId: nova.id as string,
      userId: context.userId as string,
      corpo,
      anexosInternos,
    });
    await atualizarCompletude(supabase, data.id);
    return { previaId: nova.id as string, versao: 0, identico: false, rascunho: true, pendentes: previa.placeholdersPendentes, ...sync };

  });

/**
 * Snapshot imutável. Só existe em evento de governança: pedido de revisão,
 * retorno para ajuste, aprovação, envio para assinatura e assinatura registrada.
 */
export const congelarPrevia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; evento: EventoSnapshot; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    if (!EVENTOS_SNAPSHOT.includes(data.evento)) throw new Error("Evento inválido para congelar versão.");
    const motivo = (String(data.motivo ?? "").trim() || "Sem motivo informado.").slice(0, 500);

    const tipo = ["aprovacao", "envio_assinatura", "assinatura_registrada"].includes(data.evento) ? "final" : "rascunho";
    const { registro, template, previa, corpo, anexosInternos } = await montarDoRegistro(supabase, data.id, tipo as any);
    if (tipo === "final") {
      await exigirCoerencia(supabase, registro);
      await exigirGate(supabase, {
        caseId: registro.case_id,
        acao: data.evento === "envio_assinatura" ? "solicitar_assinatura" : "gerar_versao_final",
        userId: context.userId as string,
        organizationId: registro.organization_id,
      });
    }
    if (tipo === "final" && previa.placeholdersPendentes.length > 0) {
      throw new Error(
        `Versão final bloqueada: ${previa.placeholdersPendentes.length} parâmetro(s) obrigatório(s) ainda não validados.`,
      );
    }
    if (tipo === "final") {
      const anexoBloqueante = corpo.anexos.find((a) => a.aplicavel && a.obrigatorio && a.pendencias.length > 0);
      if (anexoBloqueante) {
        throw new Error(
          `Versão final bloqueada por ${anexoBloqueante.codigo}: ${anexoBloqueante.pendencias[0]}`,
        );
      }
      if (!previa.corpoContratual) {
        throw new Error("Versão final bloqueada: prévia sem corpo contratual persistido.");
      }
    }


    const hash = hashConteudo(previa.conteudo);

    const { data: iguais } = await supabase
      .from("contract_parameter_previews")
      .select("id,versao,evento")
      .eq("parameters_id", data.id)
      .eq("estado", "congelado")
      .eq("conteudo_hash", hash)
      .eq("evento", data.evento)
      .is("archived_at", null)
      .maybeSingle();
    if (iguais) {
      return { previaId: iguais.id as string, versao: iguais.versao as number, duplicada: true, pendentes: previa.placeholdersPendentes };
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
        tipo,
        estado: "congelado",
        evento: data.evento,
        motivo,
        conteudo: previa.conteudo,
        conteudo_hash: hash,
        html: previa.html,
        anexos: previa.anexos,
        placeholders_pendentes: previa.placeholdersPendentes,
        corpo_contratual: previa.corpoContratual,
        template_code: template.code,
        template_version: template.template_version ?? null,
        gerado_por: context.userId,
        created_by: context.userId,
        updated_by: context.userId,
      })
      .select("id,versao")
      .single();
    if (error) throw new Error(error.message);
    const sync = await sincronizarMotor(supabase, {
      registro,
      previaId: nova.id as string,
      userId: context.userId as string,
      corpo,
      anexosInternos,
    });
    await atualizarCompletude(supabase, data.id);
    return { previaId: nova.id as string, versao: nova.versao as number, duplicada: false, pendentes: previa.placeholdersPendentes, ...sync };
  });


/** HTML de uma prévia congelada (visualização interna). */
export const lerPrevia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { previaId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as Sb;
    const { data: previa } = await supabase
      .from("contract_parameter_previews")
      .select("id,versao,tipo,estado,evento,motivo,html,anexos,placeholders_pendentes,template_code,template_version,congelado_em,gerado_por")
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

    const { data: registroAprovacao } = await supabase
      .from("contract_case_parameters")
      .select("id,case_id,proposal_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!registroAprovacao) throw new Error("Registro de parâmetros não encontrado.");
    await exigirCoerencia(supabase, registroAprovacao);

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
    await exigirCoerencia(supabase, registro);
    await exigirGate(supabase, {
      caseId: registro.case_id,
      acao: "solicitar_assinatura",
      userId: context.userId as string,
      organizationId: registro.organization_id,
    });

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
    await exigirGate(supabase, {
      caseId: registro.case_id,
      acao: "formalizacao_contrato_enviado",
      userId: context.userId as string,
      organizationId: registro.organization_id,
    });

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

    // Propaga a assinatura para o campo que o gate de acesso ao App Cliente
    // de fato verifica (portal-elegibilidade.ts/fn_portal_case_access_guard).
    // Sem isto, o contrato fica "assinado" no motor novo sem nunca liberar o portal.
    await supabase.from("crm_casos").update({ contrato_assinado: true }).eq("id", registro.case_id);

    return { ok: true };
  });

/** Destinos que reutilizam os parâmetros aprovados — leitura, sem redigitação. */
export const destinosParametros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
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


/**
 * Correção humana rastreável do parâmetro homologado do Planejador.
 * Não há substituição automática: exige valor anterior, novo valor,
 * justificativa, responsável, data/hora e nova versão de homologação.
 * O histórico anterior fica preservado em audit_logs.
 */
export const corrigirParametroPlanejador = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { valorId: string; valorAnterior: string; novoValor: string; justificativa: string; versaoHomologacao: string }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const userId = context.userId as string;

    const novoValor = exigirTexto(data.novoValor, "novo valor", 4000);
    const justificativa = (String(data.justificativa ?? "").trim() || "Sem justificativa informada.").slice(0, 500);
    const versao = exigirTexto(data.versaoHomologacao, "nova versão de homologação do Planejador", 120);
    if (PLACEHOLDER_PARAM.test(novoValor)) throw new Error("Placeholder não é aceito como parâmetro contratual.");

    const { data: valor } = await supabase
      .from("contract_parameter_values")
      .select("*")
      .eq("id", data.valorId)
      .maybeSingle();
    if (!valor) throw new Error("Parâmetro não encontrado.");

    const anteriorReal = String(valor.valor ?? "").trim();
    if (String(data.valorAnterior ?? "").trim() !== anteriorReal) {
      throw new Error("O valor anterior informado não confere com o valor registrado.");
    }

    const { data: registro } = await supabase
      .from("contract_case_parameters")
      .select("id,organization_id,case_id")
      .eq("id", valor.parameters_id)
      .maybeSingle();
    if (!registro) throw new Error("Ficha de parâmetros não encontrada.");

    // Somente perfil autorizado a preparar/aprovar contrato pode corrigir a fonte.
    const { data: autorizado } = await supabase.rpc("contract_pode_aprovar", { _org: registro.organization_id });
    if (!autorizado) throw new Error("Sem permissão para corrigir o parâmetro homologado.");

    const { data: caso } = await supabase.from("crm_casos").select("codigo").eq("id", registro.case_id).maybeSingle();
    const qualificador = qualificadorPaisDoCodigo(caso?.codigo);
    if (qualificador && !textoCompativel(novoValor, qualificador.sigla)) {
      throw new Error(
        `O novo valor continua incompatível com o código canônico (${qualificador.sigla} — ${qualificador.pais}).`,
      );
    }

    const agora = new Date().toISOString();
    const { error } = await supabase
      .from("contract_parameter_values")
      .update({
        valor: novoValor,
        origem: "planejador",
        origem_detalhe: `${MARCA_CORRECAO_PLANEJADOR} · ${versao} · corrigido em ${agora}`,
        justificativa,
        status: "validado",
        conflito: [],
      })
      .eq("id", valor.id);
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      organization_id: registro.organization_id,
      entidade: "contract_parameter_values",
      entidade_id: valor.id,
      acao: "planejador_parametro_corrigido",
      user_id: userId,
      metadados: {
        conflito: CONFLITO_PAIS_ROTA,
        parameters_id: registro.id,
        case_id: registro.case_id,
        campo: valor.campo,
        valor_anterior: anteriorReal || null,
        origem_anterior: valor.origem ?? null,
        origem_detalhe_anterior: valor.origem_detalhe ?? null,
        status_anterior: valor.status ?? null,
        novo_valor: novoValor,
        versao_homologacao: versao,
        justificativa,
        responsavel: userId,
        corrigido_em: agora,
      },
    });

    return { ok: true, corrigidoEm: agora };
  });

/**
 * Persiste o corpo do contrato-base versionado (perfil institucional, preâmbulo
 * e as 14 cláusulas fixas) nos modelos ativos, e marca as prévias anteriores ao
 * corpo contratual como legado — inaptas a revisão e assinatura.
 */
export const sincronizarContratoBase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as Sb;
    const org = await orgDoUsuario(supabase, context.userId as string);

    const corpo = {
      contrato_base_id: CONTRATO_BASE_ID,
      versao: CONTRATO_BASE_VERSAO,
      modelo: CONTRATO_BASE_MODELO,
      status: CONTRATO_BASE_STATUS,
      perfil_institucional_versao: PERFIL_INSTITUCIONAL_VERSAO,
      perfil_institucional: PERFIL_INSTITUCIONAL,
      preambulo: PREAMBULO_CONTRATO_BASE,
      clausulas: CLAUSULAS_FIXAS,
    };

    const { data: modelos, error } = await supabase
      .from("contract_templates")
      .update({ default_clauses: corpo, updated_by: context.userId })
      .eq("organization_id", org)
      .in("code", ["MODELO-ESTUDO", "BASE-GEN-V2"])
      .is("archived_at", null)
      .select("id,code");
    if (error) throw new Error(error.message);

    const { data: legadas } = await supabase
      .from("contract_parameter_previews")
      .update({ legado_sem_corpo: true })
      .eq("organization_id", org)
      .eq("corpo_contratual", false)
      .is("aprovado_por", null)
      .select("id");

    return {
      modelos: (modelos ?? []).map((m: any) => m.code),
      clausulas: CLAUSULAS_FIXAS.length,
      previasLegado: (legadas ?? []).length,
    };
  });
