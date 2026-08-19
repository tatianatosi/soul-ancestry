/**
 * Leitura server-only que monta a entrada da conferência de escopo/gates.
 * Só lê: não cria contrato, anexo, cobrança, mensagem ou documento.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { conferirEscopo, type EntradaConferencia, type ResultadoConferencia } from "@/lib/escopo-conferencia";
import { conferirPrecoCanonico, type ProdutoCanonico } from "@/lib/preco-canonico";
import type { Despesa } from "@/lib/despesas-terceiros";
import { contextoGatesDaConferencia } from "@/lib/escopo-conferencia";
import { bloqueiosDependentes, type Dependente } from "@/lib/dependentes";
import { TEMAS_JURIDICOS, temasBloqueantesPendentes, type LinhaMatriz } from "@/lib/matriz-juridica";
import { GateBloqueadoError, bloqueiosDaAcao, type AcaoGateada } from "@/lib/gates-formalizacao";

type Sb = any;

function ehMenor(nascimento: string | null | undefined, hoje: Date): boolean {
  if (!nascimento) return false;
  const d = new Date(nascimento);
  if (Number.isNaN(d.getTime())) return false;
  const anos = (hoje.getTime() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
  return anos < 18;
}

export async function montarConferencia(
  supabase: Sb,
  input: { caseId: string; proposalId?: string | null; hoje?: Date },
): Promise<{ resultado: ResultadoConferencia; dados: Record<string, any> }> {
  const hoje = input.hoje ?? new Date();

  const { data: caso } = await supabase
    .from("crm_casos")
    .select(
      "id,codigo,organization_id,archived_at,demo,case_service_id,contrato_assinado,pagamento_confirmado,consentimento_compartilhamento,revisao_humana_juridica,eixo_formalizacao",
    )
    .eq("id", input.caseId)
    .maybeSingle();
  if (!caso) throw new Error("Caso não encontrado nesta organização.");
  if (caso.archived_at) throw new Error("Caso arquivado: conferência bloqueada.");

  let propostaQuery = supabase
    .from("proposals")
    .select(
      "id,case_id,versao,status,valor,moeda,forma_pagamento,validade,aprovada_em,archived_at,substituida_em,substituida_por_id,recusada_em,origem,origem_referencia,paginas_registradas,escopo_paginas",
    )
    .eq("case_id", caso.id);
  propostaQuery = input.proposalId
    ? propostaQuery.eq("id", input.proposalId)
    : propostaQuery.is("archived_at", null).order("versao", { ascending: false }).limit(1);
  const { data: propostaRaw } = await propostaQuery.maybeSingle();
  const proposta = propostaRaw ?? null;

  const [{ data: caseService }, { data: membros }, { data: nucleo }, { data: despesasRaw }, { data: ficha }, { data: checklist }] =
    await Promise.all([
      caso.case_service_id
        ? supabase
            .from("case_services")
            .select("id,product_catalog_id,status,preco_acordado,condicao_comercial_aprovada")
            .eq("id", caso.case_service_id)
            .maybeSingle()
        : supabase
            .from("case_services")
            .select("id,product_catalog_id,status,preco_acordado,condicao_comercial_aprovada")
            .eq("case_id", caso.id)
            .is("archived_at", null)
            .limit(1)
            .maybeSingle(),
      supabase
        .from("case_members")
        .select("id,nome,data_nascimento,representante_legal,status_cadastral,contratante,titular,dependente,cpf")
        .eq("case_id", caso.id)
        .is("archived_at", null),
      supabase.from("nucleos_familiares").select("id,nome,dossie_mae").eq("case_id", caso.id).is("archived_at", null).maybeSingle(),
      supabase.from("third_party_expenses").select("*").eq("case_id", caso.id).is("archived_at", null),
      supabase
        .from("contract_case_parameters")
        .select("id,status,contract_id")
        .eq("case_id", caso.id)
        .is("archived_at", null)
        .maybeSingle(),
      supabase.from("onboarding_checklist").select("item_code,status,obrigatorio").eq("case_id", caso.id),
    ]);

  const produto: ProdutoCanonico | null = caseService?.product_catalog_id
    ? (
        await supabase
          .from("product_catalog")
          .select(
            "id,code,nome_comercial,status_homologacao,elegivel_para_proposta,preco_comercial_vigente,condicao_comercial_padrao,parcelas_padrao,vigencia_inicio,vigencia_fim,homologado_por,homologado_em,origem_legada_referencia,ativo,archived_at",
          )
          .eq("id", caseService.product_catalog_id)
          .maybeSingle()
      ).data
    : null;

  const valores = ficha?.id
    ? ((
        await supabase
          .from("contract_parameter_values")
          .select("campo,label,valor,origem,status")
          .eq("parameters_id", ficha.id)
          .is("archived_at", null)
      ).data ?? [])
    : [];

  const [{ data: dependentesRaw }, { data: matrizRaw }, { data: paginasRaw }] = await Promise.all([
    supabase.from("case_dependents").select("*").eq("case_id", caso.id).is("archived_at", null),
    supabase.from("legal_clause_matrix").select("*").is("archived_at", null),
    proposta?.id
      ? supabase
          .from("proposal_canva_pages")
          .select("page_number,extracao_status,campos_nao_localizados")
          .eq("proposal_id", proposta.id)
          .is("archived_at", null)
      : Promise.resolve({ data: [] }),
  ]);

  const dependentes = ((dependentesRaw ?? []) as any[]) as Dependente[];
  const matriz: LinhaMatriz[] = TEMAS_JURIDICOS.map((t) => {
    const linha = ((matrizRaw ?? []) as any[]).find((m) => m.tema_codigo === t.tema_codigo);
    return {
      tema_codigo: t.tema_codigo,
      tema: t.tema,
      status: linha?.status ?? "pendente_revisao_juridica",
      versao_juridica_aplicavel: linha?.versao_juridica_aplicavel ?? null,
      responsavel_revisao: linha?.responsavel_revisao ?? null,
      decisao: linha?.decisao ?? null,
      justificativa: linha?.justificativa ?? null,
      decidido_em: linha?.decidido_em ?? null,
      referencia_versao: linha?.referencia_versao ?? null,
      impacto_templates: linha?.impacto_templates ?? t.impacto_templates,
      bloqueia_assinatura: linha?.bloqueia_assinatura ?? t.bloqueia_assinatura,
    };
  });

  const { data: excecao } = await supabase
    .from("sku_price_exceptions")
    .select("id,preco_total,condicao_pagamento,status,valido_ate,aprovado_em,motivo")
    .eq("case_id", caso.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const numero = (v: unknown) => {
    if (v == null) return null;
    const n = Number(String(v).replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  const preco = conferirPrecoCanonico({
    produto,
    excecao: excecao
      ? {
          id: excecao.id,
          aprovada: excecao.status === "aprovada" && Boolean(excecao.aprovado_em),
          valor: excecao.preco_total,
          condicao: excecao.condicao_pagamento,
          valida_ate: excecao.valido_ate,
          motivo: excecao.motivo,
        }
      : null,
    observados: [
      { fonte: "case_service", valor: caseService?.preco_acordado ?? null },
      { fonte: "proposta_canva", valor: proposta?.valor ?? null },
      {
        fonte: "planejador",
        valor: numero((valores as any[]).find((v) => v.campo === "valor_total" && v.origem === "planejador")?.valor),
      },
      {
        fonte: "whatsapp",
        valor: numero(
          (valores as any[]).find((v) => v.campo === "valor_total" && ["whatsapp", "manual"].includes(String(v.origem)))?.valor,
        ),
      },
    ],
    hoje,
  });

  const listaMembros = (membros ?? []) as any[];
  const menores = listaMembros.filter((m) => ehMenor(m.data_nascimento, hoje));
  const despesas = ((despesasRaw ?? []) as any[]).map((d) => d as Despesa);

  const entrada: EntradaConferencia = {
    caseId: caso.id,
    proposta: proposta as any,
    valores: (valores as any[]).map((v) => ({
      campo: v.campo,
      label: v.label,
      valor: v.valor,
      origem: v.origem,
      status: v.status,
    })),
    caseService: caseService
      ? {
          id: caseService.id,
          product_catalog_id: caseService.product_catalog_id,
          status: caseService.status,
          preco_acordado: caseService.preco_acordado,
        }
      : null,
    preco,
    nucleo: {
      validado: Boolean(nucleo?.id) && listaMembros.length > 0,
      menorEnvolvido: menores.length > 0,
      representacaoRegistrada: menores.every((m) => Boolean(m.representante_legal)),
      cadastroCompleto:
        listaMembros.length > 0 && listaMembros.every((m) => m.nome && m.status_cadastral && m.status_cadastral !== "incompleto"),
    },
    checklist: {
      revisaoJuridicaOk: caso.revisao_humana_juridica === "aprovada" || caso.revisao_humana_juridica === true,
      contratoOsProntos: Boolean(ficha?.contract_id) || ficha?.status === "aprovado",
      assinaturaRegistrada: Boolean(caso.contrato_assinado),
      pagamentoConfirmado: Boolean(caso.pagamento_confirmado),
      autorizacaoPesquisa: Boolean(caso.consentimento_compartilhamento),
    },
    despesas,
    dependentesPendentes: bloqueiosDependentes(dependentes).map((b) => b.descricao),
    temasJuridicosBloqueantes: temasBloqueantesPendentes(matriz),
    paginasCanva: ((paginasRaw ?? []) as any[]).map((p) => ({
      page_number: Number(p.page_number),
      extracao_status: p.extracao_status ?? null,
      campos_nao_localizados: p.campos_nao_localizados ?? [],
    })),
    hoje,
  };

  const resultado = conferirEscopo(entrada);

  return {
    resultado,
    dados: {
      caso,
      proposta,
      caseService: caseService ?? null,
      produto,
      preco,
      despesas,
      membros: listaMembros.map((m) => ({ id: m.id, nome: m.nome, dependente: m.dependente, contratante: m.contratante })),
      nucleo: nucleo ?? null,
      fichaId: ficha?.id ?? null,
      checklistOnboarding: checklist ?? [],
      excecao: excecao ?? null,
      dependentes,
      matrizJuridica: matriz,
      paginasCanva: paginasRaw ?? [],
    },
  };
}

/**
 * Trava executável no servidor: nenhuma transição passa pelo front-end.
 * Registra toda tentativa bloqueada no histórico interno (audit_logs).
 */
export async function exigirGate(
  supabase: Sb,
  input: { caseId: string; acao: AcaoGateada; userId: string; organizationId?: string | null },
) {
  const { resultado, dados } = await montarConferencia(supabase, { caseId: input.caseId });
  const erros = bloqueiosDaAcao(input.acao, contextoGatesDaConferencia(resultado));
  if (!erros.length) return resultado;

  await supabase.from("audit_logs").insert({
    organization_id: input.organizationId ?? dados.caso.organization_id,
    user_id: input.userId,
    acao: "gate_formalizacao_bloqueado",
    entidade: "crm_casos",
    entidade_id: input.caseId,
    metadados: {
      acao_tentada: input.acao,
      status_conferencia: resultado.status,
      codigos: erros.map((e) => e.codigo),
      descricoes: erros.map((e) => e.descricao),
      proposal_id: resultado.proposal_id,
      proposal_version: resultado.proposal_version,
    },
  });

  throw new GateBloqueadoError(input.acao, erros);
}
