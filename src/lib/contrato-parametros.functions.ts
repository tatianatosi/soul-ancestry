import { semCache } from "@/lib/no-store";
import { linhas } from "@/lib/linhas";
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
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
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
  qualificacaoContratadaCoerente,
} from "@/lib/contrato-base-consolidado";
import { renderCorpoContratual, type ClausulaOverride } from "@/lib/contrato-corpo.server";
import {
  ORIGEM_CANVA,
  STATUS_CANVA,
  aPreencher,
  divergencias,
  planoDePreenchimento,
  type PaginaCanva,
} from "@/lib/canva-para-parametros";
import { anexarOpcoesVivasDoCatalogo } from "@/lib/catalogo-opcoes-contrato.server";
import { pessoasDoCasoComFallbackNucleo } from "@/lib/pessoa-vinculo";
import { condicaoVigente } from "@/lib/condicao-comercial-caso";
import {
  dispensarAnexoManualmente,
  instanciasDeAnexos,
  reativarAnexoManual,
  sincronizarAnexosPersistidos,
  sincronizarComercialDaProposta,
} from "@/lib/anexos-persistidos.server";
import { ehAnexoRevisado, planejarMaterializacao } from "@/lib/anexos-materializacao";

import { skuHomologadoParaCaso } from "@/lib/catalogo-sku.server";
import { parametrosDoPlanejador } from "@/lib/planejador-parametros";
import { referenciaFinanceiraDoCaso } from "@/lib/financeiro-referencia.server";
import {
  CONFLITO_PAIS_ROTA,
  textoCompativel,
  qualificadorPaisDoCodigo,
} from "@/lib/coerencia-caso";
import {
  MARCA_CORRECAO_PLANEJADOR,
  exigirCoerencia,
  temCorrecaoHomologada,
} from "@/lib/coerencia-caso.server";
import { exigirGate } from "@/lib/escopo-conferencia.server";
import {
  MARCA_ESVAZIADO_PELA_EQUIPE,
  definicaoCampo,
  validarValorCampo,
} from "@/lib/parametros-dicionario";
import { candidatosComerciaisDaProposta, propostaAptaParaPrecarga } from "@/lib/proposta-comercial";
import { exigirPreviaVigenteLiberada } from "@/lib/previa-vigente.server";
import { RENDERIZADOR_VERSAO } from "@/lib/renderizador-versao";

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

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA: contract_parameter_values só tem
// parameters_id (aponta para contract_case_parameters, o registro mestre) —
// resolve o case_id por lá para poder registrar no histórico do caso.
async function casoDoRegistroParametros(supabase: Sb, parametersId: string) {
  const { data } = await supabase
    .from("contract_case_parameters")
    .select("case_id")
    .eq("id", parametersId)
    .maybeSingle();
  return (data?.case_id as string | undefined) ?? null;
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

    const porCaso = new Map<string, any>(
      linhas<any>(registros, "registros mestres de parâmetros").map((r: any) => [r.case_id, r]),
    );
    return {
      casos: linhas<any>(casos, "casos com parâmetros contratuais").map((c: any) => ({
        ...c,
        parametros: porCaso.get(c.id) ?? null,
      })),
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
    if (!caso || caso.organization_id !== org)
      throw new Error("Caso não encontrado nesta organização.");
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
    await registrarTimelineCaso(supabase, {
      organizationId: org,
      caseId: data.caseId,
      eventType: "caso",
      title: "Parâmetros contratuais inicializados",
      sourceEntityType: "contract_case_parameters",
      sourceEntityId: novo.id as string,
      userId: context.userId as string,
    });
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
        .select(
          "id,versao,tipo,placeholders_pendentes,anexos,congelado_em,aprovado_em,aprovado_por,template_code,template_version",
        )
        .eq("parameters_id", data.id)
        .is("archived_at", null)
        .order("versao", { ascending: false }),
      supabase.from("crm_casos").select("*").eq("id", registro.case_id).maybeSingle(),
      registro.contract_template_id
        ? supabase
            .from("contract_templates")
            .select("id,code,name,template_version,status")
            .eq("id", registro.contract_template_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.rpc("contract_parameters_completude", { _id: data.id }),
      supabase.rpc("contract_parameters_pendencias", { _id: data.id }),
    ]);

    const cliente = caso.data?.cliente_id
      ? (
          await supabase
            .from("clientes")
            .select("id,nome,email,telefone,demo")
            .eq("id", caso.data.cliente_id)
            .maybeSingle()
        ).data
      : null;

    const contrato = registro.contract_id
      ? (
          await supabase
            .from("contracts")
            .select("id,contract_number,status,signed_at,signature_reference,signed_source")
            .eq("id", registro.contract_id)
            .maybeSingle()
        ).data
      : null;

    const valoresLista = await anexarOpcoesVivasDoCatalogo(
      supabase,
      (registro as any).organization_id ?? null,
      (registro as any).case_id ?? null,
      await preencherQualificacaoContratada(
        supabase,
        data.id,
        linhas<any>(valores, "valores dos parâmetros do contrato"),
      ),
    );

    return {
      registro,
      caso: caso.data ?? null,
      cliente,
      template: (template as any).data ?? null,
      contrato,
      valores: valoresLista,
      previas: linhas<any>(previas, "prévias do registro de parâmetros"),
      completude: completude.data ?? null,
      pendencias: linhas<any>(pendencias, "pendências dos parâmetros do contrato"),
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
  if (!linha) return valores;

  const canonico = qualificacaoCompletaContratada();
  const atual = String(linha.valor ?? "").trim();
  // Coerente com o perfil institucional = nada a corrigir, mesmo que a redação
  // seja outra. Só falta ou divergência de FATO justifica trocar o texto.
  if (atual === canonico || qualificacaoContratadaCoerente(atual)) return valores;

  /*
   * 09/10/2026 — medido no contrato da Ana: o campo estava preenchido, mas
   * com texto digitado à mão (origem `preenchimento_humano`), divergente do
   * perfil institucional — sem os canais oficiais (e-mail, site, WhatsApp) e
   * com pontuação própria. A regra antiga só preenchia campo VAZIO, então a
   * divergência ficava para sempre dentro do contrato.
   *
   * Qualificação da contratada é dado institucional de fonte única
   * (PERFIL_INSTITUCIONAL, versionado): não é juízo por caso. Divergência
   * aqui é defeito de cópia, não decisão comercial — por isso o texto
   * canônico prevalece, com a origem corrigida e a troca auditada.
   *
   * Nunca toca contrato já assinado: `exigirContratoNaoAssinado` barra antes.
   */
  if (await contratoAssinadoDoRegistro(supabase, parametersId)) return valores;

  const preenchendoVazio = atual === "";
  const { data: atualizado, error } = await supabase
    .from("contract_parameter_values")
    .update({
      valor: canonico,
      origem: "documento",
      origem_detalhe: "Perfil institucional homologado do Clube Ancestral.",
      // Vazio → a confirmar, como antes. Divergência corrigida pela fonte
      // única continua validada: o texto passou a ser exatamente o canônico.
      status: preenchendoVazio ? "importado_a_confirmar" : linha.status,
    })
    .eq("id", linha.id)
    .select("*")
    .maybeSingle();
  if (error || !atualizado) return valores;

  if (!preenchendoVazio) {
    await supabase.from("audit_logs").insert({
      organization_id: atualizado.organization_id,
      entidade: "contract_parameter_values",
      entidade_id: String(linha.id),
      acao: "qualificacao_contratada_reconciliada_com_perfil_institucional",
      valores_anteriores: { valor: atual, origem: linha.origem },
      valores_posteriores: { valor: canonico, origem: "documento" },
    });
  }

  return valores.map((v) => (v.id === linha.id ? atualizado : v));
}

/** Contrato do registro de parâmetros já está assinado? */
async function contratoAssinadoDoRegistro(supabase: Sb, parametersId: string): Promise<boolean> {
  const { data } = await supabase
    .from("contract_case_parameters")
    .select("contract_id")
    .eq("id", parametersId)
    .maybeSingle();
  const contractId = (data as any)?.contract_id as string | null | undefined;
  if (!contractId) return false;
  const { data: contrato } = await supabase
    .from("contracts")
    .select("signed_at")
    .eq("id", contractId)
    .maybeSingle();
  return Boolean((contrato as any)?.signed_at);
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
  .handler(async ({ data, context }) => preencherDeOrigensNucleo(context.supabase as Sb, data.id));

/**
 * Modo de preenchimento a partir das origens.
 *
 * 26/10/2026 — `somentePreencherVazios` é o modo AUTOMÁTICO, que roda em toda
 * geração de documento. Ele só preenche campo vazio: nunca substitui, nunca
 * limpa, nunca reescreve a origem de um valor existente. Divergência vira o
 * sinal de conflito que já existe, nunca uma escrita.
 *
 * Por que essa restrição: uma edição manual grava com status
 * `importado_a_confirmar` (não `validado`), e no modo do botão manual um
 * candidato de confiança igual ou maior a substitui — `crm` (4) empata com
 * `preenchimento_humano` (4). Rodando sozinho a cada geração, isso apagaria a
 * correção da Proprietária com o valor do cadastro, recriando o "nada salva".
 * É a regra que ela mesma decidiu na P32b: "só deixar o cadastro mais
 * completo, somente adicionando dado".
 *
 * Sem modo (botão manual "importar das origens"): comportamento intacto.
 */
type ModoPreenchimento = { somentePreencherVazios?: boolean };

async function preencherDeOrigensNucleo(supabase: Sb, id: string, modo: ModoPreenchimento = {}) {
  const data = { id };

  const { data: registro } = await supabase
    .from("contract_case_parameters")
    .select("*")
    .eq("id", data.id)
    .maybeSingle();
  if (!registro) throw new Error("Registro de parâmetros não encontrado.");

  const { data: caso } = await supabase
    .from("crm_casos")
    .select("*")
    .eq("id", registro.case_id)
    .maybeSingle();
  if (!caso || caso.demo)
    throw new Error("Origem indisponível: o caso é inválido ou de demonstração.");
  const cliente = caso.cliente_id
    ? (await supabase.from("clientes").select("*").eq("id", caso.cliente_id).maybeSingle()).data
    : null;
  if (cliente?.demo) throw new Error("Cliente de demonstração não pode alimentar o contrato real.");

  // Identidade da própria contratada: mesma em todo caso, independente do
  // Planejador (que é específico da rota/país do caso da Ana etc.).
  const { qualificacaoContratadaTexto } = await import("@/lib/perfil-institucional");
  const candidatos: { campo: string; valor: unknown; origem: string; detalhe: string }[] = [
    {
      campo: "contratada_qualificacao",
      valor: qualificacaoContratadaTexto(),
      origem: "perfil_institucional",
      detalhe: "Perfil institucional vigente do Clube Ancestral",
    },
  ];

  // Fonte da pré-carga específica do caso: Planejador Universal homologado.
  // SKU só entra se product_catalog confirmar o código da convenção (P7 / #68).
  const orgDoCaso = (registro.organization_id ?? caso.organization_id) as string | undefined;
  const skuHomologado = await skuHomologadoParaCaso(supabase, orgDoCaso, caso.codigo);
  // Parâmetro financeiro vem de dado vivo (condição do caso ou referência
  // do país), nunca do lookup estático legado (P22, 2026-09-26).
  const paisCodigo = qualificadorPaisDoCodigo(caso.codigo)?.sigla ?? null;
  const referenciaFinanceira = orgDoCaso
    ? await referenciaFinanceiraDoCaso(supabase, orgDoCaso, caso.id, paisCodigo)
    : null;
  const planejador = parametrosDoPlanejador(caso.codigo, skuHomologado, referenciaFinanceira);
  if (!planejador.convencao) {
    throw new Error("Sem convenção homologada no Planejador para este caso: nada a pré-carregar.");
  }

  // Corte U2 (28/09/2026): partes vêm da Pessoa 360 (origem "crm"); o
  // cadastro legado do Planejador só cobre o que a Pessoa 360 não tem.
  const { parametrosCanonicosDoCaso, mesclarComPessoaCanonica } =
    await import("@/lib/contrato-partes-canonicas.server");
  const canonicos = await parametrosCanonicosDoCaso(
    supabase,
    orgDoCaso,
    caso as { id: string; cliente_id?: string | null },
  );
  candidatos.push(
    ...mesclarComPessoaCanonica(planejador.parametros, canonicos).map((p) => ({
      campo: p.campo,
      valor: p.valor,
      origem: "origem" in p ? p.origem : "planejador",
      detalhe: p.detalhe,
    })),
  );

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
        conflitosProposta.push({
          campo: c.campo,
          proposta: c.valor,
          planejador: String(homologado.valor ?? ""),
        });
      }
      continue;
    }
    candidatos.push({ campo: c.campo, valor: c.valor, origem: "proposta", detalhe: c.detalhe });
  }

  /*
   * 04/10/2026 — os 3 obrigatórios vazios que já tinham fonte real.
   *
   * Medição do caso canônico CA-CID-AT-FAM-2026-001: 5 parâmetros
   * obrigatórios vazios travavam a prévia. Três deles tinham fonte viva e
   * nenhuma delas era lida aqui; dois não têm fonte e continuam pendência
   * humana declarada (`vencimentos`, porque a condição comercial do caso não
   * tem dia de vencimento nem parcelas; `ancestral_referencia`, porque a
   * âncora da linhagem é a própria requerente, não o ancestral — derivar
   * dali poria a cliente como ancestral de si mesma).
   *
   * Nada é inferido: cada candidato abaixo só existe se a fonte existir.
   */
  if (propostaApta) {
    const exclusoes = String((propostaCaso as any)?.exclusoes ?? "").trim();
    if (exclusoes && !camposDoPlanejador.has("servicos_excluidos")) {
      candidatos.push({
        campo: "servicos_excluidos",
        valor: exclusoes,
        origem: "proposta",
        detalhe: `Exclusões declaradas na proposta aprovada v${(propostaCaso as any)?.versao ?? "?"}`,
      });
    }
  }

  /*
   * Produto contratado vem do PRODUTO-PAI do Planejador, não de SKU de
   * catálogo: "planilha mestre é legado, SKU não manda" (Proprietária,
   * 03/10/2026). O campo se chama `produto_sku` por histórico de schema —
   * o conteúdo é o produto-pai homologado e a rota confirmada.
   */
  const { data: planoAtivo } = await supabase
    .from("case_plans")
    .select("produto_pai_id,rota_confirmada")
    .eq("case_id", registro.case_id)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const produtoPaiId = String(planoAtivo?.produto_pai_id ?? "").trim();
  if (produtoPaiId) {
    const { produtoPaiPorId } = await import("@/lib/planejador-produtos-pai");
    const pp = produtoPaiPorId(produtoPaiId as never);
    const rota = String(planoAtivo?.rota_confirmada ?? "").trim();
    candidatos.push({
      campo: "produto_sku",
      valor: [produtoPaiId, pp?.nome, rota ? `rota ${rota}` : null].filter(Boolean).join(" — "),
      origem: "planejador",
      detalhe: "Produto-pai homologado no Planejador do caso (sem SKU técnico de catálogo)",
    });
  }

  /*
   * Anexos aplicáveis: derivados da instância já persistida em
   * `contract_annexes` — o que foi materializado para este caso, não uma
   * segunda derivação em memória que poderia divergir da instância salva.
   */
  const { data: anexosDoCaso } = await supabase
    .from("contract_annexes")
    .select("annex_code,status,annex_version")
    .eq("organization_id", orgDoCaso ?? "")
    .eq("case_id", registro.case_id)
    .is("archived_at", null)
    .order("annex_version", { ascending: false });
  const aplicaveis = [
    ...new Set(
      ((anexosDoCaso ?? []) as any[])
        .filter((a) => !["not_applicable", "archived"].includes(String(a.status)))
        .map((a) => String(a.annex_code)),
    ),
  ].sort();
  if (aplicaveis.length) {
    candidatos.push({
      campo: "anexos_aplicaveis",
      valor: aplicaveis.join(", "),
      origem: "calculo_aprovado",
      detalhe: "Derivado das instâncias de anexo já materializadas para o caso",
    });
  }

  const valoresRes = await supabase
    .from("contract_parameter_values")
    .select("*")
    .eq("parameters_id", data.id)
    .is("archived_at", null);
  const valores = linhas<any>(valoresRes, "valores dos parâmetros do contrato");

  let importados = 0;
  const conflitos: {
    campo: string;
    atual: string;
    origem_atual: string;
    candidato: string;
    origem_candidata: string;
  }[] = [];

  const qualificador = qualificadorPaisDoCodigo(caso.codigo);
  const incoerentes: { campo: string; valor: string; esperado: string }[] = [];

  // Higiene: valor gravado com origem `planejador` que não corresponde mais à
  // convenção homologada (campo revogado ou país incoerente com o código canônico)
  // é limpo, virando pendência — nunca permanece herdado de outra cidadania.
  const camposHomologados = new Set(candidatos.map((c) => c.campo));
  const limpos: { campo: string; valor: string }[] = [];
  // Limpar valor é decisão: só o botão manual faz. O modo automático só soma.
  for (const v of modo.somentePreencherVazios ? [] : valores) {
    if (v.origem !== "planejador" || !v.valor?.trim()) continue;
    if (temCorrecaoHomologada(v)) continue;
    const revogado = !camposHomologados.has(v.campo);
    const incoerente = Boolean(qualificador) && !textoCompativel(v.valor, qualificador!.sigla);
    if (!revogado && !incoerente) continue;
    const { data: linhaLimpa, error } = await supabase
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
      .eq("id", v.id)
      .select("id");
    if (error) throw new Error(error.message);
    if (!linhaLimpa?.length) throw new Error("NENHUMA_LINHA_AFETADA: parâmetro não foi limpo.");

    limpos.push({ campo: v.campo, valor: v.valor });
    v.valor = "";
    v.status = "vazio";
    v.origem = null;
  }

  for (const c of candidatos) {
    const texto = String(c.valor ?? "").trim();
    if (!texto || PLACEHOLDER_PARAM.test(texto)) continue;
    const atual = valores.find((v: any) => v.campo === c.campo);
    if (!atual) continue;

    // Correção humana homologada nunca é sobrescrita pela pré-carga.
    if (temCorrecaoHomologada(atual)) continue;

    // Coerência com o qualificador de país do código canônico.
    if (qualificador && !textoCompativel(texto, qualificador.sigla)) {
      incoerentes.push({ campo: c.campo, valor: texto, esperado: qualificador.pais });
      const rIncoerente = await supabase
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
        .eq("id", atual.id)
        .select("id");
      if (rIncoerente.error) throw new Error(rIncoerente.error.message);
      if (!rIncoerente.data?.length)
        throw new Error("NENHUMA_LINHA_AFETADA: conflito de país não foi registrado.");
      continue;
    }

    if (atual.valor && atual.valor.trim() === texto) {
      // Mesmo valor, origem diferente: a ficha passa a registrar a proposta
      // aprovada como fonte, preservando a origem anterior na auditoria.
      if (
        !modo.somentePreencherVazios &&
        c.origem === "proposta" &&
        atual.origem !== "proposta" &&
        atual.status !== "validado"
      ) {
        const rOrigem = await supabase
          .from("contract_parameter_values")
          .update({
            origem: "proposta",
            origem_detalhe: c.detalhe,
            justificativa: `Origem corrigida para proposta aprovada após conferência; origem anterior: ${atual.origem ?? "não informada"}.`,
          })
          .eq("id", atual.id)
          .select("id");
        if (rOrigem.error) throw new Error(rOrigem.error.message);
        if (!rOrigem.data?.length)
          throw new Error("NENHUMA_LINHA_AFETADA: origem do parâmetro não foi corrigida.");
        atual.origem = "proposta";
      }
      continue;
    }

    // Fonte de menor confiança nunca sobrescreve valor já carregado
    // (o Planejador homologado é a fonte mais confiável): vira conflito.
    // A proposta também nunca sobrescreve valor já presente: só abre conflito.
    const menorConfianca = Boolean(atual.valor) && confianca(c.origem) < confianca(atual.origem);
    const propostaSobreValorExistente = c.origem === "proposta" && Boolean(atual.valor?.trim());

    // Modo automático: campo já preenchido nunca é substituído — só sinaliza.
    const automaticoSobreValorExistente =
      Boolean(modo.somentePreencherVazios) && Boolean(atual.valor?.trim());

    if (
      (atual.status === "validado" && atual.valor) ||
      menorConfianca ||
      propostaSobreValorExistente ||
      automaticoSobreValorExistente
    ) {
      conflitos.push({
        campo: c.campo,
        atual: atual.valor,
        origem_atual: atual.origem,
        candidato: texto,
        origem_candidata: c.origem,
      });
      const rConflito = await supabase
        .from("contract_parameter_values")
        .update({
          conflito: [
            {
              origem: c.origem,
              detalhe: c.detalhe,
              valor: texto,
              detectado_em: new Date().toISOString(),
            },
          ],
        })
        .eq("id", atual.id)
        .select("id");
      if (rConflito.error) throw new Error(rConflito.error.message);
      if (!rConflito.data?.length)
        throw new Error("NENHUMA_LINHA_AFETADA: conflito de parâmetro não foi registrado.");
      continue;
    }

    const { data: linhaImportada, error } = await supabase
      .from("contract_parameter_values")
      .update({
        valor: texto,
        origem: c.origem,
        origem_detalhe: c.detalhe,
        status: "importado_a_confirmar",
      })
      .eq("id", atual.id)
      .select("id");
    if (error) throw new Error(error.message);
    if (!linhaImportada?.length)
      throw new Error("NENHUMA_LINHA_AFETADA: parâmetro não foi importado.");
    importados += 1;
    // mantém o estado local coerente para os próximos candidatos do mesmo campo
    atual.valor = texto;
    atual.origem = c.origem;
    atual.origem_detalhe = c.detalhe;
    atual.status = "importado_a_confirmar";
  }

  // Divergência proposta × Planejador: o Planejador já venceu na pré-carga acima
  // (candidatos só tem o valor do Planejador quando ele existe, linha ~298), mas a
  // proposta descartada não fica visível em lugar nenhum — some ao fechar o toast
  // desta ação. Grava a mesma marca de conflito por campo (contract_parameter_values.conflito)
  // já usada para incoerência de país/rota, para que apareça de forma persistente em
  // LinhaParametro e possa ser resolvida do mesmo jeito (editar o valor limpa o conflito).
  for (const cp of conflitosProposta) {
    const atual = valores.find((v: any) => v.campo === cp.campo);
    if (!atual) continue;
    const rConflitoProposta = await supabase
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
      .eq("id", atual.id)
      .select("id");
    if (rConflitoProposta.error) throw new Error(rConflitoProposta.error.message);
    if (!rConflitoProposta.data?.length) {
      throw new Error("NENHUMA_LINHA_AFETADA: conflito proposta×planejador não foi registrado.");
    }
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
}

/** Grava um parâmetro com origem obrigatória e valor dentro do dicionário. */
export const salvarParametro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id: string;
      valor: string;
      origem: string;
      origemDetalhe?: string;
      justificativa?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const valor = String(data.valor ?? "").trim();
    if (valor && !ORIGENS_PARAM.includes(data.origem as any)) throw new Error("Origem inválida.");
    if (valor.length > 4000) throw new Error("Valor excede 4000 caracteres.");
    if (valor && PLACEHOLDER_PARAM.test(valor))
      throw new Error("Placeholder não é aceito como parâmetro contratual.");

    const { data: linha } = await supabase
      .from("contract_parameter_values")
      .select("id,campo,valor,origem,status,organization_id,parameters_id")
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

    /*
     * 06/10/2026 — origem divergente aceita com justificativa vira SINAL
     * declarado, não recusa (ver validarValorCampo). O sinal precisa ficar
     * gravado junto do valor: sem isto, "aceita com justificativa" seria
     * indistinguível de "aceita normalmente" na releitura, e a divergência
     * desapareceria da tela no próximo F5.
     */
    const sinalOrigem = check.sinal ?? null;

    // Resalvar o MESMO valor e a mesma origem que já estavam confirmados não
    // desfaz a validação — só uma mudança real de conteúdo ou origem exige
    // reconfirmação. Antes disso, "Salvar" derrubava qualquer campo já
    // "validado" de volta para "a confirmar" mesmo sem edição nenhuma.
    const inalterado = valor === (linha.valor ?? "") && data.origem === linha.origem;
    const statusFinal = !valor
      ? "vazio"
      : inalterado && linha.status === "validado"
        ? "validado"
        : "importado_a_confirmar";

    const r = await gravarComVerificacao({
      supabase,
      tabela: "contract_parameter_values",
      id: data.id,
      organizationId: linha.organization_id,
      userId: context.userId as string,
      payload: {
        valor: valor || null,
        origem: valor ? data.origem : null,
        // Corte 1 (27/09/2026): esvaziar de propósito fica marcado, para a
        // pré-carga ao abrir a preparação não devolver o valor apagado.
        origem_detalhe: valor
          ? (data.origemDetalhe ?? "").slice(0, 300)
          : MARCA_ESVAZIADO_PELA_EQUIPE,
        justificativa: (data.justificativa ?? "").slice(0, 500) || null,
        status: statusFinal,
        conflito: sinalOrigem ? [sinalOrigem] : [],
      },
    });
    const caseId = await casoDoRegistroParametros(supabase, linha.parameters_id as string);
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId: linha.organization_id as string,
        caseId,
        eventType: "caso",
        title: `Parâmetro contratual (${linha.campo}) atualizado`,
        sourceEntityType: "contract_parameter_values",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true, salvoEm: r.salvoEm };
  });

/** Confirmação humana de um parâmetro (ou bloqueio explícito). */
export const definirStatusParametro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id: string;
      status: "validado" | "bloqueado" | "importado_a_confirmar";
      justificativa?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;

    const { data: atual } = await supabase
      .from("contract_parameter_values")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!atual) throw new Error("Parâmetro não encontrado.");

    /**
     * 06/09/2026 — execução do PROMPT_REMOCAO_TOTAL_BARREIRAS_OPERACIONAIS e do
     * PROMPT_REVERSAO_EMERGENCIAL_PLATAFORMA_OPERACIONAL, por ordem direta da
     * proprietária. Ambos nomeiam literalmente "confiança mínima 4" e
     * "confiança mínima como impedimento" entre as barreiras a remover.
     *
     * Antes: origem de baixa confiança (ou WhatsApp/transcrição) fazia esta
     * função LANÇAR, ou seja, a dona não conseguia validar o próprio parâmetro
     * do próprio contrato de jeito nenhum — sem override, sem decisão, sem
     * caminho. Agora a pendência continua existindo e é gravada na
     * justificativa (liberar não é apagar), mas para a proprietária vira
     * decisão assumida em vez de parede. Para os demais papéis nada muda.
     *
     * Parâmetro sem valor continua bloqueado para todos: não é barreira de
     * processo, é campo vazio — não há o que validar.
     */
    let pendenciasAssumidas: string[] = [];
    if (data.status === "validado") {
      if (!atual.valor) throw new Error("Não é possível validar um parâmetro vazio.");

      const pendencias: string[] = [];
      if (["whatsapp", "transcricao"].includes(atual.origem)) {
        pendencias.push(
          `Origem “${atual.origem}” não confirmada por documento, proposta ou preenchimento humano.`,
        );
      }
      const def = definicaoCampo(atual.campo);
      if (confianca(atual.origem) < def.confiancaMinima) {
        pendencias.push(
          `Origem de confiança ${confianca(atual.origem)} abaixo da exigida (${def.confiancaMinima}) para “${atual.label}”.`,
        );
      }

      const { assumirOuRecusarComUsuario } = await import("@/lib/autoridade.server");
      pendenciasAssumidas = await assumirOuRecusarComUsuario(
        supabase as never,
        context.userId as string,
        pendencias,
        pendencias.join(" "),
      );
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
        justificativa:
          (pendenciasAssumidas.length
            ? [
                (data.justificativa ?? "").trim(),
                `Validado por decisão da proprietária com pendência registrada: ${pendenciasAssumidas.join(" ")}`,
              ]
                .filter(Boolean)
                .join(" — ")
            : (data.justificativa ?? "")
          ).slice(0, 500) || atual.justificativa,
        conflito: data.status === "validado" ? [] : atual.conflito,
      },
    });
    const caseId = await casoDoRegistroParametros(supabase, atual.parameters_id as string);
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId: atual.organization_id as string,
        caseId,
        eventType: "caso",
        title: `Parâmetro contratual (${atual.campo}): status alterado para ${data.status}`,
        summaryInternal: pendenciasAssumidas.length ? pendenciasAssumidas.join(" ") : undefined,
        sourceEntityType: "contract_parameter_values",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true, salvoEm: r.salvoEm };
  });

/** Gera uma prévia imutável versionada a partir dos parâmetros. */
/**
 * Monta o conteúdo da prévia a partir dos parâmetros do registro mestre.
 * Não grava nada: quem grava decide se é rascunho editável ou snapshot.
 */
async function montarDoRegistro(supabase: Sb, id: string, tipo: "rascunho" | "final") {
  const { data: registro } = await supabase
    .from("contract_case_parameters")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!registro) throw new Error("Registro de parâmetros não encontrado.");

  const [valoresRes, { data: caso }, { data: template }] = await Promise.all([
    supabase
      .from("contract_parameter_values")
      .select("*")
      .eq("parameters_id", id)
      .is("archived_at", null)
      .order("grupo")
      .order("ordem"),
    supabase.from("crm_casos").select("*").eq("id", registro.case_id).maybeSingle(),
    registro.contract_template_id
      ? supabase
          .from("contract_templates")
          .select("code,template_version")
          .eq("id", registro.contract_template_id)
          .maybeSingle()
      : Promise.resolve({ data: null } as any),
  ]);

  if (!["MODELO-ESTUDO", "BASE-GEN-V2"].includes(template.code)) {
    throw new Error("Modelo histórico não pode gerar prévia. Use MODELO-ESTUDO + BASE-GEN-V2.");
  }

  const cliente = caso?.cliente_id
    ? (await supabase.from("clientes").select("nome").eq("id", caso.cliente_id).maybeSingle()).data
    : null;

  /*
   * 27/10/2026 — fase 2 das edições de cláusula. A fase 1 (gravar/listar/
   * escalar em `contract_clause_overrides`) existia desde antes, mas este
   * montador nunca leu a tabela: a edição era salva e não aparecia no
   * documento, sem nada dizer por quê.
   *
   * Decisão da Proprietária, perguntada nominalmente em 27/10/2026:
   * "override só depois da revisão humana". `revisado` é `reviewed_at`
   * preenchido — quem não foi revisado não entra no texto e aparece
   * declarado como pendente (ver `secaoEdicoesPendentesDeRevisao`).
   */
  const clausulaOverrides: ClausulaOverride[] = registro.contract_id
    ? (
        linhas<any>(
          await supabase
            .from("contract_clause_overrides")
            .select(
              "clause_code,clause_title,action,clause_text,change_reason,precedence_statement,reviewed_at",
            )
            .eq("contract_id", registro.contract_id)
            .is("archived_at", null)
            .order("clause_code"),
          "edições de cláusula do contrato",
        ) ?? []
      ).map((o) => ({
        clauseCode: String(o.clause_code ?? ""),
        clauseTitle: String(o.clause_title ?? ""),
        action: o.action as ClausulaOverride["action"],
        clauseText: (o.clause_text as string | null) ?? null,
        changeReason: (o.change_reason as string | null) ?? null,
        precedenceStatement: (o.precedence_statement as string | null) ?? null,
        revisado: Boolean(o.reviewed_at),
      }))
    : [];

  const valores = linhas<any>(valoresRes, "valores dos parâmetros do contrato");
  const valoresFicha = valores.map((v) => ({
    campo: v.campo,
    valor: v.valor,
    origem: v.origem,
    /*
     * 09/10/2026 — `origem_detalhe` estava sendo descartado aqui. Com ele
     * fora, o corpo do contrato declarava a procedência do objeto por
     * literal ("CRM confirmado") em vez de dizer o que está gravado: "Deck
     * Canva da proposta, página 2 — decisão da Proprietária em 09/10/2026".
     */
    origem_detalhe: v.origem_detalhe,
    status: v.status,
  }));

  const anexosInternos = anexosPorRegra({
    produto: valoresFicha.find((v) => v.campo === "produto_sku")?.valor ?? null,
    pais: valoresFicha.find((v) => v.campo === "pais_rota")?.valor ?? null,
    membros: valoresFicha.find((v) => v.campo === "beneficiarios")?.valor ?? null,
    representacao: valoresFicha.find((v) => v.campo === "representacao_legal")?.valor ?? null,
  });

  /*
   * 04/10/2026 — o corpo passa a carregar a composição do caso e a condição
   * comercial aprovada. Antes, esse conteúdo existia só dentro do Anexo I, e
   * por isso a ausência do anexo era lida como "sem escopo contratado".
   *
   * Pessoas vêm da função canônica (CA19); dependentes e representação vêm
   * como estão registrados — nada é inferido por valor zero ou posição.
   */
  const [membrosDoCaso, { data: dependentesDoCaso }, { data: condicoesDoCaso }] = await Promise.all(
    [
      pessoasDoCasoComFallbackNucleo(supabase, registro.case_id),
      supabase
        .from("case_dependents")
        .select("nome_completo,titular_responsavel_legal_nome,status_representacao")
        .eq("organization_id", registro.organization_id)
        .eq("case_id", registro.case_id)
        .is("archived_at", null),
      supabase
        .from("case_commercial_condition")
        .select(
          "approved_items,fees,moeda,proposal_reference,approval_status,versao,responsaveis_financeiros",
        )
        .eq("organization_id", registro.organization_id)
        .eq("case_id", registro.case_id)
        .is("archived_at", null)
        .order("versao", { ascending: false }),
    ],
  );

  const vigente = condicaoVigente(
    ((condicoesDoCaso ?? []) as any[]).map((c) => ({
      id: "",
      caseId: registro.case_id,
      propostaId: null,
      propostaReferencia: (c.proposal_reference as string | null) ?? null,
      versao: Number(c.versao ?? 1),
      itens: Array.isArray(c.approved_items)
        ? (c.approved_items as any[]).map((i) => ({
            parte: String(i.parte ?? ""),
            valor: Number(i.valor ?? 0),
            escopo: String(i.escopo ?? ""),
          }))
        : [],
      total: c.fees === null || c.fees === undefined ? null : Number(c.fees),
      despesasTerceiros: null,
      taxasOficiais: null,
      formaPagamento: null,
      responsaveisFinanceiros: [],
      parcelas: null,
      valorParcela: null,
      moeda: String(c.moeda ?? "BRL"),
      validade: null,
      estado: String(c.approval_status ?? "rascunho"),
      origem: "",
    })),
  );

  const responsaveisFinanceiros = ((condicoesDoCaso ?? []) as any[])
    .filter((c) => c.approval_status === "aprovada")
    .flatMap((c) =>
      Array.isArray(c.responsaveis_financeiros) ? (c.responsaveis_financeiros as any[]) : [],
    )
    .map((x) => String(x));

  const corpo = renderCorpoContratual({
    caseId: registro.case_id,
    casoCodigo: caso?.codigo ?? null,
    clienteNome: cliente?.nome ?? null,
    responsavel: null,
    valores: valoresFicha,
    anexosInternos,
    pessoas: {
      membros: membrosDoCaso.map((m) => ({
        nome: String(m.nome ?? ""),
        papelNoCaso: (m.papel_no_caso as string | null) ?? null,
        dependente: Boolean(m.dependente),
      })),
      dependentes: ((dependentesDoCaso ?? []) as any[]).map((d) => ({
        nome: String(d.nome_completo ?? ""),
        representadoPor: (d.titular_responsavel_legal_nome as string | null) ?? null,
        statusRepresentacao: (d.status_representacao as string | null) ?? null,
      })),
      itensCondicao: vigente?.itens ?? [],
      responsaveisFinanceiros,
    },
    condicao: vigente
      ? {
          total: vigente.total,
          moeda: vigente.moeda,
          propostaReferencia: vigente.propostaReferencia,
        }
      : null,
    clausulaOverrides,
  });

  const previa = montarPrevia({
    tipo,
    caso,
    cliente,
    templateCode: template.code,
    templateVersion: template.template_version ?? null,
    valores: valores as any,
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
  const instancias = instanciasDeAnexos({
    anexos: input.corpo.anexos,
    internos: input.anexosInternos as any,
  });
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

    const existentes = await supabase
      .from("contract_annexes")
      .select(
        "annex_code,title,status,annex_version,model_version,file_hash,rendered_html,updated_at,is_test",
      )
      .eq("organization_id", registro.organization_id)
      .eq("case_id", registro.case_id)
      .is("archived_at", null);

    const persistidas = linhas<any>(existentes, "anexos já persistidos do caso").map((l) => ({
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

    const codigosAMaterializar = new Set(
      plano.filter((p) => p.acao === "materializar").map((p) => p.codigo),
    );
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

    return {
      simulado: false,
      plano,
      materializados: resultado.novas,
      mantidas: resultado.mantidas,
    };
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
    const { registro, corpo, anexosInternos } = await montarDoRegistro(
      supabase,
      data.id,
      "rascunho",
    );

    const instancias = instanciasDeAnexos({
      anexos: corpo.anexos,
      internos: anexosInternos as any,
    });

    const existentes = await supabase
      .from("contract_annexes")
      .select("annex_code,annex_version,file_hash")
      .eq("organization_id", registro.organization_id)
      .eq("case_id", registro.case_id)
      .is("archived_at", null);

    const vigentePorCodigo = new Map<string, any>();
    for (const l of linhas<any>(existentes, "anexos vigentes do caso")) {
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
          "ja_canonica" | "materializar",
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

    return {
      simulado: false,
      plano,
      materializados: resultado.novas,
      mantidas: resultado.mantidas,
    };
  });

/**
 * Dispensa um anexo (governado I–V ou interno) com motivo humano — decisão
 * operacional, não jurídica. Nunca reescreve cláusula, nunca toca instância
 * já anexada/assinada/arquivada. A auto-cura (`ressincronizarAnexosDoCaso`)
 * passa a preservar esta decisão em vez de recalcular pela regra.
 */
export const dispensarAnexoComMotivo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; annexCode: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const userId = context.userId as string;
    const { registro } = await montarDoRegistro(supabase, data.id, "rascunho");

    const resultado = await dispensarAnexoManualmente(supabase, {
      organizationId: registro.organization_id,
      caseId: registro.case_id,
      parametersId: registro.id,
      contractId: registro.contract_id ?? null,
      userId,
      annexCode: data.annexCode,
      motivo: data.motivo,
    });

    await supabase.from("audit_logs").insert({
      organization_id: registro.organization_id,
      entidade: "contract_annexes",
      entidade_id: registro.case_id,
      acao: "anexo_dispensado_com_motivo",
      user_id: userId,
      metadados: { parameters_id: registro.id, annex_code: data.annexCode, motivo: data.motivo },
    });
    await registrarTimelineCaso(supabase, {
      organizationId: registro.organization_id,
      caseId: registro.case_id,
      eventType: "caso",
      title: `Anexo ${data.annexCode} dispensado: ${data.motivo}`,
      sourceEntityType: "contract_annexes",
      sourceEntityId: registro.case_id,
      userId,
    });

    return resultado;
  });

/** Reverte a dispensa manual de um anexo, recalculando-o pela regra vigente. Não-op se já ativo. */
export const reativarAnexoDispensado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; annexCode: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const userId = context.userId as string;
    const { registro, corpo, anexosInternos } = await montarDoRegistro(
      supabase,
      data.id,
      "rascunho",
    );

    const todasAsInstancias = instanciasDeAnexos({
      anexos: corpo.anexos,
      internos: anexosInternos as any,
    });
    const instanciaAtual = todasAsInstancias.find((i) => i.annex_code === data.annexCode);
    if (!instanciaAtual) throw new Error("Regra atual não reconhece mais este código de anexo.");

    const { data: previa } = await supabase
      .from("contract_parameter_previews")
      .select("id")
      .eq("parameters_id", registro.id)
      .is("archived_at", null)
      .order("versao", { ascending: false })
      .limit(1)
      .maybeSingle();

    const resultado = await reativarAnexoManual(
      supabase,
      {
        organizationId: registro.organization_id,
        caseId: registro.case_id,
        parametersId: registro.id,
        previaId: (previa?.id as string) ?? null,
        contractId: registro.contract_id ?? null,
        userId,
      },
      instanciaAtual,
    );

    if (!resultado.jaAtivo) {
      await supabase.from("audit_logs").insert({
        organization_id: registro.organization_id,
        entidade: "contract_annexes",
        entidade_id: registro.case_id,
        acao: "anexo_dispensa_revertida",
        user_id: userId,
        metadados: { parameters_id: registro.id, annex_code: data.annexCode },
      });
    }

    return resultado;
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
    // 26/10/2026: toda geração parametriza antes — só preenche vazio.
    const parametrizacao = await parametrizarAutomaticamente(supabase, data.id);
    const r = await gerarPreviaNucleo(supabase, context.userId as string, data);
    return { ...r, parametrizacao };
  });

/** Gera ou atualiza o rascunho de trabalho do registro (núcleo do `gerarPrevia`). */
async function gerarPreviaNucleo(
  supabase: Sb,
  userId: string,
  data: { id: string; tipo: "rascunho" | "final" },
) {
  const { registro, template, previa, corpo, anexosInternos } = await montarDoRegistro(
    supabase,
    data.id,
    "rascunho",
  );
  if (data.tipo === "final") {
    await exigirCoerencia(supabase, registro, {
      userId: userId,
      organizationId: registro.organization_id,
    });
    await exigirGate(supabase, {
      caseId: registro.case_id,
      acao: "gerar_versao_final",
      userId: userId,
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
        .update({ updated_by: userId })
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
        renderizador_versao: RENDERIZADOR_VERSAO,
        legado_sem_corpo: false,
        legado_sem_evento: false,
        template_code: template.code,
        template_version: template.template_version ?? null,
        gerado_por: userId,
        updated_by: userId,
      })
      .eq("id", rascunho.id);
    if (error) throw new Error(error.message);
    const sync = await sincronizarMotor(supabase, {
      registro,
      previaId: rascunho.id as string,
      userId: userId,
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
      renderizador_versao: RENDERIZADOR_VERSAO,
      template_code: template.code,
      template_version: template.template_version ?? null,
      gerado_por: userId,
      created_by: userId,
      updated_by: userId,
    })
    .select("id,versao")
    .single();
  if (error) throw new Error(error.message);
  const sync = await sincronizarMotor(supabase, {
    registro,
    previaId: nova.id as string,
    userId: userId,
    corpo,
    anexosInternos,
  });
  await atualizarCompletude(supabase, data.id);
  return {
    previaId: nova.id as string,
    versao: 0,
    identico: false,
    rascunho: true,
    pendentes: previa.placeholdersPendentes,
    ...sync,
  };
}

/**
 * Parametrização automática em toda geração de documento (26/10/2026).
 *
 * O motor `preencherDeOrigens` já existia e é cuidadoso — Pessoa 360,
 * Planejador, proposta, anexos; nunca sobrescreve correção homologada — mas só
 * rodava num botão manual. Era a fase que faltava: o parâmetro
 * `contratante_documento` foi digitado à mão em 23/10 enquanto o cadastro
 * canônico tinha o dado, e o contrato ficou trancado.
 *
 * Roda no modo que só preenche vazio. Falha de origem (caso sem convenção no
 * Planejador, caso de demonstração) não impede gerar o documento: volta como
 * aviso, nunca é engolida em silêncio.
 */
async function parametrizarAutomaticamente(supabase: Sb, id: string) {
  try {
    const r = await preencherDeOrigensNucleo(supabase, id, { somentePreencherVazios: true });
    return {
      executada: true,
      preenchidos: r.importados,
      conflitos: r.conflitos.length,
      aviso: null as string | null,
    };
  } catch (e) {
    return {
      executada: false,
      preenchidos: 0,
      conflitos: 0,
      aviso: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * Documento do contrato a partir do dado ATUAL — decisão da Proprietária em
 * 26/10/2026 (opção "b"), com duas condições dela: ter acesso à versão criada
 * e parametrizar automaticamente.
 *
 * 1. Parametriza (só preenche vazio).
 * 2. Regera o rascunho de trabalho pelo mesmo núcleo do `gerarPrevia`. A
 *    versão fica PERSISTIDA em `contract_parameter_previews`, com hash de
 *    conteúdo — é a "versão criada", acessível depois pelo id.
 * 3. Devolve o id para o download, que passa pelo guard de sempre. Como o
 *    rascunho acabou de ser regerado depois dos parâmetros (o trigger
 *    `fn_cpp_guard` grava `updated_at = now()` em toda atualização, mesmo com
 *    conteúdo idêntico), a defasagem que trancou o contrato da Ana em 23/10
 *    não pode mais acontecer.
 *
 * POST porque grava. Registro resolvido sempre com filtro de organização da
 * sessão — nunca vindo do cliente.
 */
export const gerarDocumentoAtual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => {
    if (!d?.caseId) throw new Error("Caso não informado.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const organizationId = await orgDoUsuario(supabase, context.userId as string);
    const { data: registro, error } = await supabase
      .from("contract_case_parameters")
      .select("id")
      .eq("case_id", data.caseId)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!registro) {
      throw new Error(
        "Este caso ainda não tem matriz de parâmetros do contrato — abra a preparação do contrato primeiro.",
      );
    }
    const parametrizacao = await parametrizarAutomaticamente(supabase, registro.id as string);
    const previa = await gerarPreviaNucleo(supabase, context.userId as string, {
      id: registro.id as string,
      tipo: "rascunho",
    });
    return {
      previaId: previa.previaId,
      versao: previa.versao,
      identico: previa.identico,
      parametrizacao,
    };
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
    if (!EVENTOS_SNAPSHOT.includes(data.evento))
      throw new Error("Evento inválido para congelar versão.");
    const motivo = (String(data.motivo ?? "").trim() || "Sem motivo informado.").slice(0, 500);

    const tipo = ["aprovacao", "envio_assinatura", "assinatura_registrada"].includes(data.evento)
      ? "final"
      : "rascunho";
    const { registro, template, previa, corpo, anexosInternos } = await montarDoRegistro(
      supabase,
      data.id,
      tipo as any,
    );
    if (tipo === "final") {
      await exigirCoerencia(supabase, registro, {
        userId: context.userId as string,
        organizationId: registro.organization_id,
      });
      await exigirGate(supabase, {
        caseId: registro.case_id,
        acao: data.evento === "envio_assinatura" ? "solicitar_assinatura" : "gerar_versao_final",
        userId: context.userId as string,
        organizationId: registro.organization_id,
      });
    }
    // Autoridade operacional (05/09/2026): pendência informa, não impede. Tudo
    // que a proprietária assume aqui é devolvido e gravado em audit_logs junto
    // com a versão congelada. Para os demais papéis segue bloqueando.
    const pendenciasAssumidas: string[] = [];
    if (tipo === "final") {
      const { contextoInterno } = await import("@/lib/comercial.server");
      const { assumirOuRecusar } = await import("@/lib/autoridade.server");
      const { papel } = await contextoInterno(supabase as never, context.userId as string);

      if (previa.placeholdersPendentes.length > 0) {
        pendenciasAssumidas.push(
          ...assumirOuRecusar(
            papel,
            previa.placeholdersPendentes.map(
              (p) => `${p.label ?? p.campo} (${p.campo}): ${p.status}`,
            ),
            `Versão final bloqueada: ${previa.placeholdersPendentes.length} parâmetro(s) obrigatório(s) ainda não validados.`,
          ),
        );
      }

      const anexoBloqueante = corpo.anexos.find(
        (a) => a.aplicavel && a.obrigatorio && a.pendencias.length > 0,
      );
      if (anexoBloqueante) {
        pendenciasAssumidas.push(
          ...assumirOuRecusar(
            papel,
            anexoBloqueante.pendencias as string[],
            `Versão final bloqueada por ${anexoBloqueante.codigo}: ${anexoBloqueante.pendencias[0]}`,
          ).map((p) => `${anexoBloqueante.codigo}: ${p}`),
        );
      }

      if (!previa.corpoContratual) {
        pendenciasAssumidas.push(
          ...assumirOuRecusar(
            papel,
            ["Prévia sem corpo contratual persistido."],
            "Versão final bloqueada: prévia sem corpo contratual persistido.",
          ),
        );
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
      return {
        previaId: iguais.id as string,
        versao: iguais.versao as number,
        duplicada: true,
        pendentes: previa.placeholdersPendentes,
      };
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
        renderizador_versao: RENDERIZADOR_VERSAO,
        template_code: template.code,
        template_version: template.template_version ?? null,
        gerado_por: context.userId,
        created_by: context.userId,
        updated_by: context.userId,
      })
      .select("id,versao")
      .single();
    if (error) throw new Error(error.message);

    /*
     * 09/10/2026 — "as antigas ficam marcadas como substituídas, sem apagar".
     * Isso tinha sido feito à mão nas prévias da Ana (UPDATE com
     * `archive_reason`), e o congelamento seguinte voltaria a deixar duas
     * versões congeladas vivas ao mesmo tempo, sem dizer qual vale. Agora o
     * próprio congelamento substitui as congeladas anteriores: arquiva — nunca
     * apaga, nunca toca o rascunho de trabalho — com o motivo nomeando a nova
     * versão. O histórico inteiro continua legível em `previasHistorico`.
     */
    const { data: substituidas } = await supabase
      .from("contract_parameter_previews")
      .update({
        archived_at: new Date().toISOString(),
        archived_by: context.userId,
        archive_reason: `Substituída pela versão ${nova.versao} (${data.evento}). Preservada no histórico, não apagada.`,
        updated_by: context.userId,
      })
      .eq("parameters_id", data.id)
      .eq("estado", "congelado")
      .is("archived_at", null)
      .neq("id", nova.id)
      .select("id,versao");

    if ((substituidas ?? []).length > 0) {
      await supabase.from("audit_logs").insert({
        organization_id: registro.organization_id,
        user_id: context.userId,
        entidade: "contract_parameter_previews",
        entidade_id: nova.id as string,
        acao: "previas_substituidas_por_versao_nova",
        metadados: {
          parameters_id: registro.id,
          case_id: registro.case_id,
          versao_vigente: nova.versao,
          substituidas: (substituidas as any[]).map((x) => ({ id: x.id, versao: x.versao })),
          regra: "substituir nao e apagar: a linha fica com archive_reason",
        },
      });
    }
    const sync = await sincronizarMotor(supabase, {
      registro,
      previaId: nova.id as string,
      userId: context.userId as string,
      corpo,
      anexosInternos,
    });
    await atualizarCompletude(supabase, data.id);

    if (registro.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId: registro.organization_id,
        caseId: registro.case_id,
        eventType: "caso",
        title: `Prévia contratual congelada (${data.evento}, versão ${nova.versao})`,
        summaryInternal: motivo,
        sourceEntityType: "contract_parameter_previews",
        sourceEntityId: nova.id as string,
        userId: context.userId as string,
      });
    }

    // Liberar não é apagar: a pendência assumida fica registrada na auditoria
    // do próprio congelamento.
    if (pendenciasAssumidas.length > 0) {
      await supabase.from("audit_logs").insert({
        organization_id: registro.organization_id,
        user_id: context.userId,
        entidade: "contract_parameter_previews",
        entidade_id: nova.id as string,
        acao: "versao_final_com_pendencia_assumida",
        metadados: {
          parameters_id: registro.id,
          case_id: registro.case_id,
          evento: data.evento,
          versao: nova.versao,
          pendencias_assumidas: pendenciasAssumidas,
          decidido_por: "proprietaria_administradora",
          politica: "pendência informa, não impede",
        },
      });
    }

    return {
      previaId: nova.id as string,
      versao: nova.versao as number,
      duplicada: false,
      pendentes: previa.placeholdersPendentes,
      pendenciasAssumidas,
      ...sync,
    };
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
      .select(
        "id,versao,tipo,estado,evento,motivo,html,anexos,placeholders_pendentes,template_code,template_version,congelado_em,gerado_por",
      )
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

    // Autoridade operacional (05/09/2026): pendência informa, não impede.
    // Antes, a aprovação da prévia era recusada por placeholder pendente mesmo
    // com a proprietária confirmando. Era um dos pontos em que ela relatava
    // não conseguir fazer nada na área de contrato.
    {
      const { contextoInterno } = await import("@/lib/comercial.server");
      const { assumirOuRecusar } = await import("@/lib/autoridade.server");
      const { papel } = await contextoInterno(supabase as never, context.userId as string);
      assumirOuRecusar(
        papel,
        (previa.placeholders_pendentes ?? []) as string[],
        "Há campos obrigatórios em placeholder. Aprovação bloqueada.",
      );
    }

    const { data: registroAprovacao } = await supabase
      .from("contract_case_parameters")
      .select("id,case_id,proposal_id,organization_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!registroAprovacao) throw new Error("Registro de parâmetros não encontrado.");
    await exigirCoerencia(supabase, registroAprovacao, {
      userId: context.userId as string,
      organizationId: registroAprovacao.organization_id,
    });

    const { data: linhaPrevia, error: e1 } = await supabase
      .from("contract_parameter_previews")
      .update({ aprovado_por: context.userId, aprovado_em: new Date().toISOString() })
      .eq("id", data.previaId)
      .select("id");
    if (e1) throw new Error(e1.message);
    if (!linhaPrevia?.length) throw new Error("NENHUMA_LINHA_AFETADA: prévia não foi aprovada.");

    const agora = new Date().toISOString();
    const { data: linhaParametros, error: e2 } = await supabase
      .from("contract_case_parameters")
      .update({
        status: "aprovado",
        revisao_humana_por: context.userId,
        revisao_humana_em: agora,
        aprovado_por: context.userId,
        aprovado_em: agora,
      })
      .eq("id", data.id)
      .select("id");
    if (e2) throw new Error(e2.message);
    if (!linhaParametros?.length)
      throw new Error("NENHUMA_LINHA_AFETADA: parâmetros do caso não foram aprovados.");

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
    if (registro.status !== "aprovado") {
      // 25/10/2026: a Proprietária envia direto; a coerência abaixo continua valendo.
      const { proprietariaOperando } = await import("@/lib/autoridade.server");
      if (!(await proprietariaOperando(supabase as never, context.userId as string)))
        throw new Error("Aprove os parâmetros antes de enviar para assinatura.");
    }
    await exigirCoerencia(supabase, registro);
    /*
     * 09/10/2026 — mesmo gap da revisão, com consequência maior: preparar
     * assinatura exigia parâmetros aprovados e coerência, mas não olhava a
     * prévia. Instrumento defasado, substituído ou sem corpo contratual não
     * entra em assinatura.
     */
    await exigirPreviaVigenteLiberada(supabase, {
      parametersId: registro.id,
      organizationId: registro.organization_id,
      saida: "assinatura",
    });
    await exigirGate(supabase, {
      caseId: registro.case_id,
      acao: "solicitar_assinatura",
      userId: context.userId as string,
      organizationId: registro.organization_id,
    });

    const valoresRes = await supabase
      .from("contract_parameter_values")
      .select("*")
      .eq("parameters_id", data.id)
      .is("archived_at", null);
    const valores = linhas<any>(valoresRes, "valores dos parâmetros do contrato");
    const pegar = (campo: string) => valores.find((v: any) => v.campo === campo)?.valor ?? null;

    const { data: caso } = await supabase
      .from("crm_casos")
      .select("*")
      .eq("id", registro.case_id)
      .maybeSingle();

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
          // CHECK contracts_status_check + fn_contracts_guard: novo instrumento começa em rascunho.
          status: "draft",
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

      const { error: erroParteContratante } = await supabase.from("contract_parties").insert({
        organization_id: registro.organization_id,
        contract_id: contratoId,
        role: "contracting_client",
        client_id: caso?.cliente_id ?? null,
        person_name: pegar("contratante_nome") ?? "",
        document_number: pegar("contratante_documento"),
        address: pegar("contratante_endereco"),
        signature_required: true,
        created_by: context.userId,
        updated_by: context.userId,
      });
      if (erroParteContratante) {
        throw new Error(
          `Falha ao registrar a parte contratante do contrato ${contratoId}: ${erroParteContratante.message}`,
        );
      }

      const escopo = [
        {
          category: "contracted_scope",
          title: "Serviços incluídos",
          description: pegar("servicos_incluidos"),
        },
        {
          category: "exclusion",
          title: "Serviços excluídos",
          description: pegar("servicos_excluidos"),
        },
        {
          category: "deliverable",
          title: "Fases e entregas",
          description: pegar("fases_entregas"),
        },
      ].filter((s) => s.description);
      if (escopo.length) {
        const { error: erroEscopo } = await supabase.from("contract_scope_items").insert(
          escopo.map((s, i) => ({
            organization_id: registro.organization_id,
            contract_id: contratoId,
            category: s.category,
            title: s.title,
            description: s.description,
            // contract_scope_items: status só aceita included/excluded/pending/conditional/not_applicable;
            // source_type só aceita proposal/case/manual_review/template/annex.
            status: s.category === "exclusion" ? "excluded" : "included",
            source_type: "case",
            source_reference: data.id,
            display_order: i,
            created_by: context.userId,
            updated_by: context.userId,
          })),
        );
        if (erroEscopo) {
          throw new Error(
            `Falha ao registrar o escopo do contrato ${contratoId}: ${erroEscopo.message}`,
          );
        }
      }
    }

    const { data: linhaEnvio, error: e2 } = await supabase
      .from("contract_case_parameters")
      .update({ contract_id: contratoId, status: "enviado_assinatura" })
      .eq("id", data.id)
      .select("id");
    if (e2) throw new Error(e2.message);
    if (!linhaEnvio?.length)
      throw new Error("NENHUMA_LINHA_AFETADA: envio para assinatura não foi registrado.");

    return { contratoId };
  });

/**
 * Registro humano da assinatura externa — reusa as partes já aprovadas.
 *
 * P0-ASSINATURA-REVISAO-HUMANA (18/09/2026): as três escritas abaixo não são
 * uma transação — se uma etapa posterior falhar, as anteriores já foram
 * gravadas. Por isso cada etapa verifica `error` e linha afetada e, ao
 * falhar, interrompe imediatamente com uma mensagem que diz exatamente até
 * onde a gravação chegou, para revisão humana antes de repetir a ação. Não
 * há compensação/rollback automático — decisão de escopo explícita.
 */
export const registrarAssinatura = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id: string;
      dataAssinatura: string;
      origemExterna: string;
      referencia: string;
      motivo?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const dataAssinatura = exigirTexto(data.dataAssinatura, "data da assinatura", 40);
    const origem = exigirTexto(data.origemExterna, "origem externa da assinatura", 200);
    const referencia = exigirTexto(data.referencia, "referência da assinatura", 200);
    // P0-ASSINATURA-REVISAO-HUMANA: motivo é obrigatório no fluxo confirmado
    // (casos.$caseId.contrato.preparar.tsx, via AcaoOperacional). Opcional
    // aqui só para não quebrar o outro chamador existente
    // (contrato-parametros.$id.tsx), que ainda não tem confirmação humana —
    // dívida declarada, fora do escopo deste corte (limite de três arquivos).
    const motivo = data.motivo
      ? exigirTexto(data.motivo, "motivo da confirmação", 2000)
      : "Motivo não informado (fluxo sem confirmação humana explícita).";

    const { data: registro } = await supabase
      .from("contract_case_parameters")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!registro?.contract_id)
      throw new Error("Envie para assinatura antes de registrar o instrumento assinado.");
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

    const contratoRes = await supabase
      .from("contracts")
      .update({
        status: "signed",
        signed_at: new Date(dataAssinatura).toISOString(),
        signed_source: origem,
        signature_reference: referencia,
        updated_by: context.userId,
      })
      .eq("id", registro.contract_id)
      .select("id");
    if (contratoRes.error) throw new Error(contratoRes.error.message);
    if (!contratoRes.data?.length) {
      throw new Error("Contrato não encontrado ao registrar assinatura — nada foi alterado.");
    }

    const parametrosRes = await supabase
      .from("contract_case_parameters")
      .update({ status: "assinado" })
      .eq("id", data.id)
      .select("id");
    if (parametrosRes.error || !parametrosRes.data?.length) {
      throw new Error(
        `Contrato marcado como assinado, mas os parâmetros do contrato não foram atualizados` +
          `${parametrosRes.error ? `: ${parametrosRes.error.message}` : " (nenhuma linha afetada)"}.` +
          " Estado parcial — revisão humana necessária antes de repetir a ação.",
      );
    }

    // Propaga a assinatura para o campo que o gate de acesso ao App Cliente
    // de fato verifica (portal-elegibilidade.ts/fn_portal_case_access_guard).
    // Sem isto, o contrato fica "assinado" no motor novo sem nunca liberar o portal.
    const casoRes = await supabase
      .from("crm_casos")
      .update({ contrato_assinado: true })
      .eq("id", registro.case_id)
      .select("id");
    if (casoRes.error || !casoRes.data?.length) {
      throw new Error(
        `Contrato e parâmetros atualizados, mas o caso não foi atualizado` +
          `${casoRes.error ? `: ${casoRes.error.message}` : " (nenhuma linha afetada)"}.` +
          " Estado parcial — revisão humana necessária antes de repetir a ação; o acesso ao Portal pode não refletir a assinatura.",
      );
    }

    await registrarTimelineCaso(supabase, {
      organizationId: registro.organization_id,
      caseId: registro.case_id,
      eventType: "caso",
      title: "Assinatura externa registrada",
      summaryInternal: `Origem: ${origem}. Referência: ${referencia}. Data: ${dataAssinatura}. Motivo: ${motivo}`,
      sourceEntityType: "contracts",
      sourceEntityId: registro.contract_id,
      userId: context.userId as string,
    });

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
    (d: {
      valorId: string;
      valorAnterior: string;
      novoValor: string;
      justificativa: string;
      versaoHomologacao: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const userId = context.userId as string;

    const novoValor = exigirTexto(data.novoValor, "novo valor", 4000);
    const justificativa = (
      String(data.justificativa ?? "").trim() || "Sem justificativa informada."
    ).slice(0, 500);
    const versao = exigirTexto(
      data.versaoHomologacao,
      "nova versão de homologação do Planejador",
      120,
    );
    if (PLACEHOLDER_PARAM.test(novoValor))
      throw new Error("Placeholder não é aceito como parâmetro contratual.");

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
    const { data: autorizado } = await supabase.rpc("contract_pode_aprovar", {
      _org: registro.organization_id,
    });
    if (!autorizado) throw new Error("Sem permissão para corrigir o parâmetro homologado.");

    const { data: caso } = await supabase
      .from("crm_casos")
      .select("codigo")
      .eq("id", registro.case_id)
      .maybeSingle();
    const qualificador = qualificadorPaisDoCodigo(caso?.codigo);
    if (qualificador && !textoCompativel(novoValor, qualificador.sigla)) {
      throw new Error(
        `O novo valor continua incompatível com o código canônico (${qualificador.sigla} — ${qualificador.pais}).`,
      );
    }

    const agora = new Date().toISOString();
    const { data: linhaCorrigida, error } = await supabase
      .from("contract_parameter_values")
      .update({
        valor: novoValor,
        origem: "planejador",
        origem_detalhe: `${MARCA_CORRECAO_PLANEJADOR} · ${versao} · corrigido em ${agora}`,
        justificativa,
        status: "validado",
        conflito: [],
      })
      .eq("id", valor.id)
      .select("id");
    if (error) throw new Error(error.message);
    if (!linhaCorrigida?.length)
      throw new Error("NENHUMA_LINHA_AFETADA: parâmetro não foi corrigido.");

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

    const legadas = await supabase
      .from("contract_parameter_previews")
      .update({ legado_sem_corpo: true })
      .eq("organization_id", org)
      .eq("corpo_contratual", false)
      .is("aprovado_por", null)
      .select("id");

    return {
      modelos: (modelos ?? []).map((m: any) => m.code),
      clausulas: CLAUSULAS_FIXAS.length,
      previasLegado: linhas<any>(legadas, "prévias legadas sem corpo contratual").length,
    };
  });

/**
 * Preenche os parâmetros do caso a partir das páginas do Canva já extraídas
 * (04/10/2026).
 *
 * Proprietária: "o Canva já está autorizado na proposta". Medido: as 7 páginas
 * do caso dela estão `extraida` e carregam serviços excluídos, despesas
 * externas, escopos individuais e as etapas da jornada — e **nada** escrevia
 * isso nos parâmetros. `servicos_excluidos` vazio era a única pendência
 * impeditiva de conteúdo do contrato.
 *
 * Preenche só campo vazio, com origem `proposta` e status
 * `importado_a_confirmar`. Campo já preenchido e diferente vira **divergência
 * declarada** — nunca sobrescrita, nem quando está validado. Não envia, não
 * assina, não cobra.
 */
export const preencherParametrosDoCanva = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo: string }) => {
    if (!d?.id) throw new Error("Registro de parâmetros é obrigatório.");
    if (!String(d?.motivo ?? "").trim())
      throw new Error("Informe o motivo do preenchimento a partir do deck.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const userId = context.userId as string;

    const { data: registro } = await supabase
      .from("contract_case_parameters")
      .select("id,case_id,organization_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!registro) throw new Error("Registro de parâmetros não encontrado.");

    const [{ data: paginas }, { data: valores }] = await Promise.all([
      supabase
        .from("proposal_canva_pages")
        .select("page_number,extracao_status,page_content_structured,campos_nao_localizados")
        .eq("organization_id", registro.organization_id)
        .eq("case_id", registro.case_id)
        .is("archived_at", null)
        .order("page_number"),
      supabase
        .from("contract_parameter_values")
        .select("id,campo,valor,status,origem")
        .eq("parameters_id", registro.id)
        .is("archived_at", null),
    ]);

    const linhas = (paginas ?? []) as PaginaCanva[];
    if (!linhas.some((p) => p.extracao_status === "extraida")) {
      throw new Error("Nenhuma página do deck está extraída: não há conteúdo autorizado a trazer.");
    }

    const atuais = ((valores ?? []) as any[]).map((v) => ({
      campo: String(v.campo),
      valor: (v.valor as string | null) ?? null,
      status: (v.status as string | null) ?? null,
      origem: (v.origem as string | null) ?? null,
    }));
    const plano = planoDePreenchimento(linhas, atuais);

    const gravados: string[] = [];
    for (const item of aPreencher(plano)) {
      const linha = ((valores ?? []) as any[]).find((v) => v.campo === item.campo);
      if (!linha?.id || !item.valorCanva) continue;
      await gravarComVerificacao({
        supabase,
        tabela: "contract_parameter_values",
        id: linha.id as string,
        organizationId: registro.organization_id as string,
        userId,
        payload: {
          valor: item.valorCanva.slice(0, 4000),
          origem: ORIGEM_CANVA,
          origem_detalhe: `Deck Canva da proposta, página ${item.pagina}`.slice(0, 300),
          status: STATUS_CANVA,
          justificativa: data.motivo.slice(0, 500),
          conflito: [],
        },
      });
      gravados.push(item.campo);
    }

    const divergentes = divergencias(plano).map((d) => d.campo);

    if (gravados.length || divergentes.length) {
      await supabase.from("audit_logs").insert({
        organization_id: registro.organization_id,
        entidade: "contract_parameter_values",
        entidade_id: null,
        acao: "parametros_preenchidos_do_deck_canva",
        user_id: userId,
        valores_posteriores: { gravados, divergentes },
        metadados: {
          case_id: registro.case_id,
          motivo: data.motivo,
          regra:
            "Só campo vazio é preenchido; campo preenchido e diferente fica como divergência declarada, nunca sobrescrito.",
        },
      });
    }

    if (gravados.length) {
      await atualizarCompletude(supabase, registro.id as string);
      await registrarTimelineCaso(supabase, {
        organizationId: registro.organization_id as string,
        caseId: registro.case_id as string,
        eventType: "caso",
        title: `Parâmetros preenchidos do deck Canva: ${gravados.join(", ")}`,
        summaryInternal: data.motivo,
        sourceEntityType: "contract_case_parameters",
        sourceEntityId: registro.id as string,
        userId,
      });
    }

    return { gravados, divergentes, plano };
  });
