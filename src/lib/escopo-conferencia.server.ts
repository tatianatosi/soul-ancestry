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
import { coberturaDoModelo } from "@/lib/aprovacao-modelo";
import { TEMAS_JURIDICOS, temasBloqueantesPendentes, type LinhaMatriz } from "@/lib/matriz-juridica";
import { GateBloqueadoError, bloqueiosDaAcao, ehAcaoGateadaInterna, type AcaoGateada } from "@/lib/gates-formalizacao";
import { extrairEscopoDaProposta, mapaCoberturaEscopo } from "@/lib/escopo-proposta";
import { sanearProposta, type SaneamentoProposta } from "@/lib/proposta-saneamento";
import { pessoasDoCasoComFallbackNucleo } from "@/lib/pessoa-vinculo";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";
import { proprietariaOperando } from "@/lib/autoridade.server";

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
): Promise<{ resultado: ResultadoConferencia; saneamento: SaneamentoProposta; dados: Record<string, any> }> {
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
      pessoasDoCasoComFallbackNucleo(supabase, caso.id).then((data) => ({ data })),
      supabase.from("nucleos_familiares").select("id,nome,dossie_mae").eq("case_id", caso.id).is("archived_at", null).maybeSingle(),
      supabase.from("third_party_expenses").select("*").eq("case_id", caso.id).is("archived_at", null),
      supabase
        .from("contract_case_parameters")
        .select("id,status,contract_id,contract_template_id")
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
          .select("page_number,extracao_status,campos_nao_localizados,observacao_interna")
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

  /*
   * 09/10/2026 — aprovação do MODELO × conferência da INSTÂNCIA. O Contrato de
   * Estudo Genealógico v2 já foi revisado juridicamente; revisão só volta a ser
   * exigida para alteração material fora do conteúdo aprovado (override de
   * cláusula no contrato do caso). Dados, representação e assinatura seguem
   * pelos seus próprios gates.
   */
  const templateCode = ficha?.contract_template_id
    ? ((
        await supabase.from("contract_templates").select("code").eq("id", ficha.contract_template_id).maybeSingle()
      ).data?.code ?? null)
    : null;
  const clausulasAlteradas = ficha?.contract_id
    ? ((
        await supabase
          .from("contract_clause_overrides")
          .select("clause_code,clause_title,action,change_reason,clause_text,archived_at")
          .eq("contract_id", ficha.contract_id)
          .is("archived_at", null)
      ).data ?? [])
    : [];
  const coberturaModelo = coberturaDoModelo({ templateCode, clausulasAlteradas });

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
      revisaoJuridicaOk:
        caso.revisao_humana_juridica === "aprovada" ||
        caso.revisao_humana_juridica === true ||
        coberturaModelo.dentroDoAprovado,
      contratoOsProntos: Boolean(ficha?.contract_id) || ficha?.status === "aprovado",
      assinaturaRegistrada: Boolean(caso.contrato_assinado),
      pagamentoConfirmado: Boolean(caso.pagamento_confirmado),
      autorizacaoPesquisa: Boolean(caso.consentimento_compartilhamento),
    },
    despesas,
    dependentesPendentes: bloqueiosDependentes(dependentes).map((b) => b.descricao),
    temasJuridicosBloqueantes: coberturaModelo.dentroDoAprovado ? [] : temasBloqueantesPendentes(matriz),
    alteracoesForaDoModelo: coberturaModelo.escalonamento.map((a) => `${a.clausula} (${a.motivo})`),
    paginasCanva: ((paginasRaw ?? []) as any[]).map((p) => ({
      page_number: Number(p.page_number),
      extracao_status: p.extracao_status ?? null,
      campos_nao_localizados: p.campos_nao_localizados ?? [],
    })),
    hoje,
  };

  const resultado = conferirEscopo(entrada);

  const saneamento = sanearProposta({
    proposta: proposta as any,
    paginas: ((paginasRaw ?? []) as any[]).map((p) => ({
      page_number: Number(p.page_number),
      extracao_status: p.extracao_status ?? null,
      campos_nao_localizados: p.campos_nao_localizados ?? [],
      observacao_interna: p.observacao_interna ?? null,
    })),
    cobertura: mapaCoberturaEscopo({
      proposta: proposta as any,
      extraidos: extrairEscopoDaProposta(proposta as any),
      valores: entrada.valores,
    }),
    hoje,
  });

  return {
    resultado,
    saneamento,
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
 *
 * A pendência nunca desaparece. Quando a Proprietária Administradora já
 * registrou decisão auditada (`owner_override_events`, categoria
 * `override_interno`, campo = ação) para uma ação INTERNA, o avanço interno é
 * permitido e a superação fica registrada em `audit_logs`. Ações externas
 * (assinatura, envio, pagamento) continuam bloqueadas aqui e só passam pela
 * janela final de confirmação explícita.
 */
export async function exigirGate(
  supabase: Sb,
  input: { caseId: string; acao: AcaoGateada; userId: string; organizationId?: string | null },
) {
  const { resultado, dados } = await montarConferencia(supabase, { caseId: input.caseId });
  const erros = bloqueiosDaAcao(input.acao, contextoGatesDaConferencia(resultado));
  if (!erros.length) return resultado;

  const organizationId = input.organizationId ?? dados.caso.organization_id;

  if (ehAcaoGateadaInterna(input.acao)) {
    const { data: decisao, error: erroDecisao } = await supabase
      .from("owner_override_events")
      .select("id,motivo,fonte,created_at,actor_user_id")
      .eq("organization_id", organizationId)
      .eq("categoria", "override_interno")
      .eq("entidade_id", input.caseId)
      .eq("campo", input.acao)
      .eq("acao_externa", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (erroDecisao) throw new Error(`Não foi possível ler as decisões da proprietária: ${erroDecisao.message}`);

    if (decisao) {
      await registrarAuditoria(supabase, {
        organization_id: organizationId,
        user_id: input.userId,
        acao: "gate_superado_por_decisao_proprietaria",
        entidade: "crm_casos",
        entidade_id: input.caseId,
        metadados: {
          acao_tentada: input.acao,
          codigos: erros.map((e) => e.codigo),
          descricoes: erros.map((e) => e.descricao),
          decisao_event_id: decisao.id,
          motivo: decisao.motivo,
          fonte: decisao.fonte,
          pendencia_preservada: true,
        },
      });
      return resultado;
    }

    /*
     * A05 (04/11/2026, decisão D5): a proprietária administradora não é bloqueada em ação interna.
     * Sem decisão prévia registrada, ela assume a pendência no próprio ato; a pendência continua
     * aberta e a superação vai para a auditoria com os mesmos códigos.
     */
    if (await proprietariaOperando(supabase, input.userId)) {
      await registrarAuditoria(supabase, {
        organization_id: organizationId,
        user_id: input.userId,
        acao: "gate_superado_por_decisao_proprietaria",
        entidade: "crm_casos",
        entidade_id: input.caseId,
        metadados: {
          acao_tentada: input.acao,
          codigos: erros.map((e) => e.codigo),
          descricoes: erros.map((e) => e.descricao),
          decisao_event_id: null,
          origem: "proprietaria_assumiu_no_ato",
          pendencia_preservada: true,
        },
      });
      return resultado;
    }
  }

  await registrarAuditoria(supabase, {
    organization_id: organizationId,
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

