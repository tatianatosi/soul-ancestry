import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { conteudoDoAnexoSalvo } from "@/lib/anexos-conteudo";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  anexoIIncorporadoNoCorpo,
  coberturaContratual,
  montarBlocosIncorporados,
  montarPessoasContratuais,
} from "@/lib/contrato-blocos-incorporados";
import { CLAUSULA_DESPESAS_TERCEIROS } from "@/lib/despesas-terceiros";
import { instrumentosPosteriores } from "@/lib/contrato-blocos-incorporados";
import {
  CAMPOS_FORA_DO_CANVA,
  aPreencher,
  divergencias,
  falsosNaoLocalizados,
  planoDePreenchimento,
} from "@/lib/canva-para-parametros";
import { CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";
import { anexosIaV, entradaDeValores } from "@/lib/anexos-i-v";
import { CONFLITO_PAIS_ROTA, qualificadorPaisDoCodigo } from "@/lib/coerencia-caso";
import { conflitosCoerenciaDoRegistro, exigirCoerencia } from "@/lib/coerencia-caso.server";
import { PLACEHOLDER_PARAM, anexosPorRegra } from "@/lib/contrato-parametros.server";
import { MARCA_ESVAZIADO_PELA_EQUIPE } from "@/lib/parametros-dicionario";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { anexarOpcoesVivasDoCatalogo } from "@/lib/catalogo-opcoes-contrato.server";
import { AVISO_ANEXOS_NO_CORPO, MOTIVO_SEM_ANEXO_APLICAVEL, ausenciaDeAnexoEhPendencia, modoAnexosEfetivo } from "@/lib/modo-anexos";
import { skuHomologadoParaCaso } from "@/lib/catalogo-sku.server";
import { parametrosDoPlanejador } from "@/lib/planejador-parametros";
import { referenciaFinanceiraDoCaso } from "@/lib/financeiro-referencia.server";
import {
  bloqueiosDeEscopo,
  extrairEscopoDaProposta,
  mapaCoberturaEscopo,
  propostaComPaginasCanva,
  validarPropostaCanva,
} from "@/lib/escopo-proposta";
import { pessoasDoCasoComFallbackNucleo } from "@/lib/pessoa-vinculo";
import { exigirPreviaVigenteLiberada } from "@/lib/previa-vigente.server";
import {
  NOME_INSTRUMENTO,
  casoGovernadoPeloPlanejador,
  condicaoParticularDoCaso,
  pendenciasHumanasDoContrato,
  type DependenteContrato,
  type ParteContrato,
} from "@/lib/resgate-contrato-planejador";

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

/**
 * Auditoria sem dados sensíveis completos: só identificadores, contagens e rótulos.
 * Eventos repetitivos (abertura de tela) são consolidados em janela de 30 minutos:
 * em vez de nova linha, incrementa o contador de ocorrências do evento existente.
 */
async function auditar(
  supabase: Sb,
  input: {
    org: string;
    userId: string;
    acao: string;
    entidadeId: string;
    metadados?: Record<string, unknown>;
    consolidar?: boolean;
  },
) {
  if (input.consolidar) {
    const desde = new Date(Date.now() - 30 * 60_000).toISOString();
    const { data: recente } = await supabase
      .from("audit_logs")
      .select("id,metadados")
      .eq("entidade", "contract_case_parameters")
      .eq("entidade_id", input.entidadeId)
      .eq("acao", input.acao)
      .eq("user_id", input.userId)
      .gte("created_at", desde)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recente) {
      const anterior = (recente.metadados ?? {}) as Record<string, unknown>;
      await supabase
        .from("audit_logs")
        .update({
          metadados: {
            ...anterior,
            ...(input.metadados ?? {}),
            ocorrencias: Number(anterior.ocorrencias ?? 1) + 1,
            ultima_ocorrencia_em: new Date().toISOString(),
          },
        })
        .eq("id", recente.id);
      return;
    }
  }

  await supabase.from("audit_logs").insert({
    organization_id: input.org,
    user_id: input.userId,
    acao: input.acao,
    entidade: "contract_case_parameters",
    entidade_id: input.entidadeId,
    metadados: { ...(input.metadados ?? {}), ...(input.consolidar ? { ocorrencias: 1 } : {}) },
  });
}


/**
 * Abre a preparação contratual de UM caseId, reaproveitando obrigatoriamente
 * a ficha mestre, a proposta vinculada, o MODELO ESTUDO ativo e a base v2.
 * Nunca usa DEMO, fallback, outro caso ou inferência.
 */
export const abrirPreparacaoContrato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const userId = context.userId as string;
    const org = await orgDoUsuario(supabase, userId);

    // Referência recebida pode ser o case_id canônico ou um código legado (alias
    // histórico). O alias nunca abre fluxo novo: resolve para o caso canônico,
    // sem copiar, migrar ou duplicar dados.
    const ehUuid = /^[0-9a-f-]{36}$/i.test(data.caseId);
    let aliasDe: string | null = null;
    let idCanonico = data.caseId;
    if (!ehUuid) {
      const { data: resolvido } = await supabase.rpc("resolver_case_canonico", { _ref: data.caseId });
      const linha = Array.isArray(resolvido) ? resolvido[0] : resolvido;
      if (!linha) throw new Error("Referência de caso não encontrada nesta organização.");
      idCanonico = linha.case_id;
      if (linha.alias) aliasDe = data.caseId;
    }

    const { data: caso } = await supabase
      .from("crm_casos")
      .select(
        "id,codigo,titulo,pais,via,status,demo,cliente_id,organization_id,contrato_assinado,archived_at,codigos_legados,documentos_minimos_ok,condicoes_verificadas_em,condicoes_verificadas_por",
      )
      .eq("id", idCanonico)
      .maybeSingle();
    if (!caso || caso.organization_id !== org) throw new Error("Caso não encontrado nesta organização.");
    if (caso.archived_at) throw new Error("Caso arquivado: preparação bloqueada.");
    if (caso.demo) throw new Error("Casos de demonstração não alimentam o motor contratual real.");

    const cliente = caso.cliente_id
      ? (
          await supabase
            .from("clientes")
            .select("id,nome,email,telefone,demo")
            .eq("id", caso.cliente_id)
            .maybeSingle()
        ).data
      : null;
    if (cliente?.demo) throw new Error("Cliente de demonstração não pode alimentar o contrato real.");

    const [{ data: proposta }, { data: modelo }, { data: base }, { data: membros }, { data: planoAtivo }, { data: faturas }] = await Promise.all([
      supabase
        .from("proposals")
        .select(
          "id,case_id,versao,status,valor,moeda,forma_pagamento,escopo,exclusoes,validade,archived_at,substituida_em,substituida_por_id,recusada_em,origem,origem_referencia,paginas_registradas,escopo_paginas",
        )
        .eq("case_id", caso.id)
        .is("archived_at", null)
        .order("versao", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("contract_templates")
        .select("id,code,name,template_version,status")
        .eq("organization_id", org)
        .eq("code", "MODELO-ESTUDO")
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("contract_templates")
        .select("id,code,name,template_version,status")
        .eq("organization_id", org)
        .eq("code", "BASE-GEN-V2")
        .eq("status", "active")
        .maybeSingle(),
      pessoasDoCasoComFallbackNucleo(supabase, caso.id).then((data) => ({ data })),
      // Checklist pré-contrato (item 5, corte 2026-09-23): produto-pai já
      // persistido em case_plans (Corte 3, 21/09/2026) — mesmo padrão de
      // leitura usado em Caso 360 (qCadeia.data.planejador.produto_pai_id).
      supabase
        .from("case_plans")
        .select("id,produto_pai_id,rota_confirmada,fase_jornada,marco_atual")
        .eq("case_id", caso.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("invoices")
        .select("id,status,valor_pago,paga_em,referencia_externa,created_at")
        .eq("case_id", caso.id)
        .is("archived_at", null)
        .order("created_at", { ascending: true }),
    ]);

    /*
     * Achado real (06/09/2026): esta tela lia proposals.escopo_paginas/
     * paginas_registradas direto — colunas legadas que nenhuma tela grava
     * mais. A extração real acontece em "Preparar contrato" (CompletudeCanva),
     * que grava em proposal_canva_pages. cadeia-formalizacao.server.ts já
     * fazia essa fusão; esta tela (a que a proprietária de fato usa) não
     * fazia, e por isso mostrava um escopo desatualizado/diferente da mesma
     * proposta em cada tela.
     */
    const { data: paginasCanva } = proposta?.id
      ? await supabase
          .from("proposal_canva_pages")
          .select("page_number,extracao_status,page_content_structured,campos_nao_localizados")
          .eq("proposal_id", proposta.id)
          .is("archived_at", null)
      : { data: [] as any[] };
    const propostaEfetiva = propostaComPaginasCanva(proposta as any, (paginasCanva ?? []) as any[]);

    // Ficha única por caso: reaproveita se já existir, nunca duplica.
    let { data: registro } = await supabase
      .from("contract_case_parameters")
      .select("*")
      .eq("case_id", caso.id)
      .is("archived_at", null)
      .maybeSingle();

    let fichaCriada = false;
    if (!registro) {
      const { data: novo, error } = await supabase
        .from("contract_case_parameters")
        .insert({
          organization_id: org,
          case_id: caso.id,
          proposal_id: proposta?.id ?? null,
          contract_template_id: modelo?.id ?? null,
          contract_template_version: modelo?.template_version ?? null,
          created_by: userId,
          updated_by: userId,
        })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      registro = novo;
      fichaCriada = true;
    } else if (!registro.proposal_id && proposta?.id) {
      const resultado = await gravarComVerificacao({
        supabase,
        tabela: "contract_case_parameters",
        id: registro.id,
        organizationId: org,
        userId,
        payload: { proposal_id: proposta.id },
      });
      registro = resultado.registro;
    }

    const [{ data: valores }, { data: previas }, { data: previasHistorico }, completude, pendencias, { data: anexosPersistidosRaw }] = await Promise.all([
      supabase
        .from("contract_parameter_values")
        .select("id,grupo,campo,label,obrigatorio,ordem,valor,origem,origem_detalhe,status,conflito,justificativa,atualizado_em")
        .eq("parameters_id", registro.id)
        .is("archived_at", null)
        .order("grupo", { ascending: true })
        .order("ordem", { ascending: true }),
      supabase
        .from("contract_parameter_previews")
        .select(
          /*
           * 09/10/2026 — sem `updated_at` a tela calculava a defasagem do rascunho
           * pela data de CRIAÇÃO (21/08), não pela da última geração; sem
           * `corpo_contratual`/`legado_sem_corpo`/`renderizador_versao` as outras
           * metades da regra não tinham dado. Mesma linha que o guard do servidor lê.
           */
          "id,versao,tipo,estado,evento,motivo,conteudo,placeholders_pendentes,anexos,congelado_em,created_at,updated_at,gerado_por,aprovado_em,aprovado_por,template_code,template_version,corpo_contratual,legado_sem_corpo,renderizador_versao",
        )
        .eq("parameters_id", registro.id)
        .is("archived_at", null)
        .order("estado", { ascending: true })
        .order("versao", { ascending: false }),
      /*
       * 09/10/2026 — histórico completo das prévias, inclusive as
       * substituídas. `previas` continua só com as vivas (os consumidores
       * desta tela escolhem rascunho/final a partir dela e não podem passar a
       * ver linha arquivada); este é o que a aba "Versões e histórico" lista:
       * identificador, data, versão do modelo e estado, com a substituída
       * dizendo por que foi substituída. Substituir não é apagar.
       */
      supabase
        .from("contract_parameter_previews")
        .select(
          "id,versao,tipo,estado,evento,congelado_em,created_at,updated_at,aprovado_em,template_code,template_version,conteudo_hash,corpo_contratual,legado_sem_corpo,archived_at,archive_reason,renderizador_versao",
        )
        .eq("parameters_id", registro.id)
        .order("versao", { ascending: false }),
      supabase.rpc("contract_parameters_completude", { _id: registro.id }),
      supabase.rpc("contract_parameters_pendencias", { _id: registro.id }),
      // Estado real persistido dos anexos (id, versão vigente, dispensa manual
      // com motivo) — a leitura em `d.anexos` abaixo é a regra computada,
      // somente-leitura; esta é a instância gravada em `contract_annexes`,
      // necessária para a tela oferecer "dispensar com motivo"/"reativar".
      supabase
        .from("contract_annexes")
        .select("id,annex_code,annex_version,status,reason_not_applicable,structured_data")
        .eq("organization_id", org)
        .eq("case_id", caso.id)
        .is("archived_at", null)
        .order("annex_version", { ascending: false }),
    ]);
    const anexosPersistidosPorCodigo = new Map<string, any>();
    for (const l of (anexosPersistidosRaw ?? []) as any[]) {
      if (!anexosPersistidosPorCodigo.has(l.annex_code)) anexosPersistidosPorCodigo.set(l.annex_code, l);
    }
    const anexosPersistidos = [...anexosPersistidosPorCodigo.values()].map((l) => ({
      id: l.id as string,
      annexCode: l.annex_code as string,
      annexVersion: Number(l.annex_version ?? 0),
      status: l.status as string,
      reasonNotApplicable: (l.reason_not_applicable ?? null) as string | null,
      overrideManual: (l.structured_data as any)?.overrideManual === true,
      // 04/10/2026: o conteúdo salvo acompanha o anexo no próprio fluxo, para
      // a equipe ver o que aprova sem abrir o bloco de auditoria.
      conteudo: conteudoDoAnexoSalvo(l.structured_data),
    }));

    const contrato = registro.contract_id
      ? (
          await supabase
            .from("contracts")
            .select("id,contract_number,title,status,signed_at,signature_reference,signed_source")
            .eq("id", registro.contract_id)
            .maybeSingle()
        ).data
      : null;

    /*
      Resgate Ana (27/09/2026): a tela só mostra fatos humanos reais, uma vez
      cada — calculados das partes do instrumento, dos dependentes e da
      revisão. Leitura pura; nenhuma escrita aqui.
    */
    const [{ data: partesRaw }, { data: dependentesRaw }, { data: servicoRaw }, { data: aceitosRaw }] = await Promise.all([
      contrato?.id
        ? supabase
            .from("contract_parties")
            .select("id,person_name,role,phone,document_number,signature_required,client_id")
            .eq("contract_id", contrato.id)
            .is("archived_at", null)
            .order("display_order", { ascending: true })
        : { data: [] as any[] },
      supabase
        .from("case_dependents")
        .select("id,nome_completo,status_representacao,participa_do_contrato,titular_responsavel_legal_nome")
        .eq("case_id", caso.id)
        .is("archived_at", null),
      supabase
        .from("case_services")
        .select("condicao_comercial_aprovada,preco_acordado,composicao_familiar,escopo_aprovado")
        .eq("case_id", caso.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      contrato?.id
        ? supabase
            .from("contract_review_events")
            .select("metadata")
            .eq("organization_id", org)
            .eq("contract_id", contrato.id)
            .eq("event_type", "conflito_mantido_com_motivo")
            .limit(100)
        : { data: [] as any[] },
    ]);
    const partesContrato = (partesRaw ?? []) as ParteContrato[];
    const idsClientesPartes = [...new Set(partesContrato.map((p) => p.client_id).filter(Boolean))] as string[];
    const { data: clientesPartes } = idsClientesPartes.length
      ? await supabase.from("clientes").select("id,telefone").eq("organization_id", org).in("id", idsClientesPartes)
      : { data: [] as any[] };
    const telefonesCanonicos: Record<string, string | null> = Object.fromEntries(
      ((clientesPartes ?? []) as any[]).map((c) => [c.id, c.telefone ?? null]),
    );
    const aceitos = new Set<string>();
    for (const ev of (aceitosRaw ?? []) as { metadata: Record<string, unknown> }[]) {
      const m = ev.metadata ?? {};
      const parte = partesContrato.find((p) => p.id === m["itemId"]);
      if (m["campo"] !== "telefone" || !parte?.client_id) continue;
      if (String(m["atual"] ?? "") === String(parte.phone ?? "") && String(m["canonico"] ?? "") === String(telefonesCanonicos[parte.client_id] ?? ""))
        aceitos.add(`telefone:${parte.id}`);
    }

    let lista = (valores ?? []) as any[];
    const skuHomologado = await skuHomologadoParaCaso(supabase, org, caso.codigo);
    const paisCodigo = qualificadorPaisDoCodigo(caso.codigo)?.sigla ?? null;
    const referenciaFinanceira = await referenciaFinanceiraDoCaso(supabase, org, caso.id, paisCodigo);
    // Só preenche campo ainda vazio — valor já persistido (incluindo
    // case_plans / edição humana) prevalece. Parâmetro financeiro vem de
    // dado vivo (condição do caso ou referência do país), nunca do lookup
    // estático legado (P22, 2026-09-26).
    const planejador = parametrosDoPlanejador(caso.codigo, skuHomologado, referenciaFinanceira);
    // Corte U2 (28/09/2026): partes vêm da Pessoa 360 (origem "crm"); o
    // cadastro legado do Planejador só cobre o que a Pessoa 360 não tem.
    const { parametrosCanonicosDoCaso, mesclarComPessoaCanonica } = await import("@/lib/contrato-partes-canonicas.server");
    const canonicos = await parametrosCanonicosDoCaso(supabase, org, caso as { id: string; cliente_id?: string | null });
    for (const c of mesclarComPessoaCanonica(planejador.parametros, canonicos)) {
      const atual = lista.find((v) => v.campo === c.campo);
      if (!atual || String(atual.valor ?? "").trim()) continue;
      // Corte 1: linha esvaziada pela equipe não volta preenchida sozinha.
      if (atual.origem_detalhe === MARCA_ESVAZIADO_PELA_EQUIPE) continue;
      const texto = String(c.valor ?? "").trim();
      if (!texto || PLACEHOLDER_PARAM.test(texto)) continue;
      const { data: atualizado, error } = await supabase
        .from("contract_parameter_values")
        .update({
          valor: texto,
          origem: "origem" in c ? c.origem : "planejador",
          origem_detalhe: c.detalhe,
          status: "importado_a_confirmar",
        })
        .eq("id", atual.id)
        .select("*")
        .maybeSingle();
      if (!error && atualizado) lista = lista.map((v) => (v.id === atual.id ? atualizado : v));
    }
    const escopoProposta = String(propostaEfetiva?.escopo ?? "").trim();
    const linhaEscopo = lista.find((v) => v.campo === "escopo_resumo");
    if (linhaEscopo && !String(linhaEscopo.valor ?? "").trim() && linhaEscopo.origem_detalhe !== MARCA_ESVAZIADO_PELA_EQUIPE && escopoProposta && !PLACEHOLDER_PARAM.test(escopoProposta)) {
      const { data: atualizado, error } = await supabase
        .from("contract_parameter_values")
        .update({
          valor: escopoProposta,
          origem: "proposta",
          origem_detalhe: "Escopo da proposta aprovada vinculada ao caso.",
          status: "importado_a_confirmar",
        })
        .eq("id", linhaEscopo.id)
        .select("*")
        .maybeSingle();
      if (!error && atualizado) lista = lista.map((v) => (v.id === linhaEscopo.id ? atualizado : v));
    }
    const pegar = (campo: string) => lista.find((v) => v.campo === campo)?.valor ?? null;
    const anexos = anexosPorRegra({
      produto: pegar("produto_sku"),
      pais: pegar("pais_rota") ?? caso.pais,
      membros: pegar("beneficiarios") ?? (membros ?? []).map((m: any) => m.nome).join(", "),
      representacao: pegar("representacao_legal"),
    });

    const finalAprovada = (previas ?? []).find((p: any) => p.tipo === "final" && p.aprovado_em);

    // Gates de bloqueio — nenhuma geração final/envio sem todos resolvidos.
    const bloqueios: { chave: string; motivo: string }[] = [];
    if (!proposta) bloqueios.push({ chave: "proposta", motivo: "Nenhuma proposta vinculada ao caso." });
    else if (proposta.status !== "aprovada")
      bloqueios.push({ chave: "condicao_comercial", motivo: `Proposta v${proposta.versao} não está aprovada (${proposta.status}).` });
    if (!modelo) bloqueios.push({ chave: "template", motivo: "MODELO ESTUDO ativo não localizado." });
    if (!base) bloqueios.push({ chave: "anexo", motivo: "Contrato-base genérico v2 ativo não localizado." });
    /*
     * Corte C / D3 (08/10/2026): a escolha registrada em `modo_anexos`
     * manda; sem escolha, vale o modo derivado dos blocos do Anexo I.
     *
     * No modo incorporado, não existir anexo aplicável é o estado CORRETO
     * (o conteúdo está no corpo), não uma pendência. O gate de proposta
     * vinculada e aprovada, logo acima, NÃO é afetado: a proposta aprovada
     * é a fonte da condição comercial incorporada, não um anexo dispensável.
     */
    if (!anexos.length) bloqueios.push({ chave: "anexo", motivo: MOTIVO_SEM_ANEXO_APLICAVEL });

    const obrigatoriosVazios = lista.filter((v) => v.obrigatorio && !v.valor);
    if (obrigatoriosVazios.length)
      bloqueios.push({ chave: "campo_obrigatorio", motivo: `${obrigatoriosVazios.length} campo(s) obrigatório(s) vazio(s).` });

    const naoValidados = lista.filter((v) => v.obrigatorio && v.valor && v.status !== "validado");
    if (naoValidados.length)
      bloqueios.push({ chave: "revisao_campo", motivo: `${naoValidados.length} campo(s) obrigatório(s) ainda a confirmar.` });

    const comPlaceholder = lista.filter((v) => v.valor && PLACEHOLDER_PARAM.test(v.valor));
    if (comPlaceholder.length)
      bloqueios.push({ chave: "placeholder", motivo: `${comPlaceholder.length} campo(s) com placeholder remanescente.` });

    const conflitantes = lista.filter((v) => (v.conflito ?? []).length > 0);
    if (conflitantes.length) bloqueios.push({ chave: "conflito", motivo: `${conflitantes.length} conflito(s) de origem não resolvido(s).` });

    const signatarios = lista.filter((v) => v.grupo === "partes" && v.obrigatorio);
    if (signatarios.some((v) => !v.valor || v.status !== "validado"))
      bloqueios.push({ chave: "signatario", motivo: "Qualificação de parte/signatário obrigatória incompleta." });

    if (!finalAprovada) bloqueios.push({ chave: "revisao_humana", motivo: "Revisão humana da versão final ainda não aprovada." });

    // Escopo mandatório: proposta Canva vigente aprovada, páginas 1–7.
    const validadeEscopo = validarPropostaCanva(propostaEfetiva as any, caso.id);
    const extraidos = extrairEscopoDaProposta(propostaEfetiva as any);
    const cobertura = mapaCoberturaEscopo({
      proposta: propostaEfetiva as any,
      extraidos,
      valores: lista.map((v) => ({ campo: v.campo, valor: v.valor, origem: v.origem, status: v.status })),
    });
    const conflitosEscopo = cobertura
      .filter((l) => l.estado === "divergente")
      .map((l) => ({ campo: l.campo, label: l.label, proposta: l.valorProposta, outraFonte: "ficha", valor: l.divergencia ?? "" }));
    for (const b of bloqueiosDeEscopo({ validade: validadeEscopo, extraidos, conflitos: conflitosEscopo })) {
      bloqueios.push(b);
    }

    // Validação cruzada: código canônico x Planejador x parâmetros x proposta.
    const coerencia = await conflitosCoerenciaDoRegistro(supabase, registro);
    for (const c of coerencia.conflitos) {
      bloqueios.push({ chave: CONFLITO_PAIS_ROTA, motivo: c.mensagem });
    }


    await auditar(supabase, {
      org,
      userId,
      acao: fichaCriada ? "contrato_preparacao_ficha_criada" : "contrato_preparacao_aberta",
      entidadeId: registro.id,
      consolidar: !fichaCriada,
      metadados: {
        case_id: caso.id,
        caso_codigo: caso.codigo,
        proposta_id: proposta?.id ?? null,
        template_code: modelo?.code ?? null,
        campos_carregados: lista.filter((v) => v.valor).length,
        bloqueios: [...new Set(bloqueios.map((b) => b.chave))],
      },
    });

    /*
     * Cobertura material do contrato (04/10/2026). Instrução da Proprietária:
     * "não dizer que falta escopo quando o escopo está no contrato" e "não
     * inferir que item sem valor é dependente". A cobertura passa a ser
     * calculada sobre pessoa + papel + escopo + entregas + condição comercial +
     * representação, com as pendências separadas entre o que impede a
     * assinatura inicial e o que é ato posterior.
     */
    const { data: condicoesComerciais } = await supabase
      .from("case_commercial_condition")
      .select("approved_items,fees,moeda,proposal_reference,approval_status,versao,responsaveis_financeiros")
      .eq("organization_id", org)
      .eq("case_id", caso.id)
      .is("archived_at", null)
      .order("versao", { ascending: false });

    const condicaoAprovada = ((condicoesComerciais ?? []) as any[]).find((c) => c.approval_status === "aprovada") ?? null;
    const itensCondicao = Array.isArray(condicaoAprovada?.approved_items)
      ? (condicaoAprovada!.approved_items as any[]).map((i) => ({
          parte: String(i.parte ?? ""),
          valor: Number(i.valor ?? 0),
          escopo: String(i.escopo ?? ""),
        }))
      : [];

    const pessoasContratuais = montarPessoasContratuais({
      /*
       * A lista registrada em `contract_parties` é a fonte primária de partes e
       * papéis quando existe — medido correto no caso da Ana, enquanto a
       * condição comercial (vinda do deck) traz um nome divergente do pai.
       */
      partesRegistradas: ((partesRaw ?? []) as any[]).map((p) => ({
        nome: String(p.person_name ?? ""),
        papel: (p.role as string | null) ?? null,
        assinaturaExigida: Boolean(p.signature_required),
      })),
      membros: ((membros ?? []) as any[]).map((m) => ({
        nome: String(m.nome ?? ""),
        papelNoCaso: (m.papel_no_caso as string | null) ?? null,
        dependente: Boolean(m.dependente),
      })),
      dependentes: ((dependentesRaw ?? []) as any[]).map((d) => ({
        nome: String(d.nome_completo ?? ""),
        representadoPor: (d.titular_responsavel_legal_nome as string | null) ?? null,
        statusRepresentacao: (d.status_representacao as string | null) ?? null,
      })),
      itensCondicao,
      responsaveisFinanceiros: Array.isArray(condicaoAprovada?.responsaveis_financeiros)
        ? (condicaoAprovada!.responsaveis_financeiros as any[]).map((x) => String(x))
        : [],
    });

    const valorDoCampo = (campo: string) => {
      const v = lista.find((x: any) => x.campo === campo)?.valor;
      return v && String(v).trim() ? String(v) : null;
    };

    const blocosIncorporados = montarBlocosIncorporados({
      pessoas: pessoasContratuais,
      contratadaQualificacao: valorDoCampo("contratada_qualificacao"),
      objeto: valorDoCampo("objeto_contrato"),
      paisRota: valorDoCampo("pais_rota"),
      escopoResumo: valorDoCampo("escopo_resumo"),
      servicosIncluidos: valorDoCampo("servicos_incluidos"),
      servicosExcluidos: valorDoCampo("servicos_excluidos"),
      fasesEntregas: valorDoCampo("fases_entregas"),
      prazosReferencia: valorDoCampo("prazos_referencia"),
      despesasExternas: valorDoCampo("despesas_externas"),
      total:
        condicaoAprovada?.fees === null || condicaoAprovada?.fees === undefined
          ? valorDoCampo("valor_total")
            ? Number(valorDoCampo("valor_total"))
            : null
          : Number(condicaoAprovada.fees),
      moeda: String(condicaoAprovada?.moeda ?? "BRL"),
      formaPagamento: valorDoCampo("forma_pagamento"),
      parcelas: valorDoCampo("parcelas"),
      vencimentos: valorDoCampo("vencimentos"),
      propostaReferencia:
        (condicaoAprovada?.proposal_reference as string | null) ??
        ((proposta as any)?.origem_referencia as string | null) ??
        null,
      regraDespesasInstitucional: CLAUSULA_DESPESAS_TERCEIROS,
      /* A procedência que a tela declara vem do próprio parâmetro, não de literal. */
      origens: Object.fromEntries(
        (lista as any[]).map((v) => [
          String(v.campo),
          { origem: (v.origem as string | null) ?? null, detalhe: (v.origem_detalhe as string | null) ?? null },
        ]),
      ),
    });

    /*
     * Plano do deck Canva (04/10/2026). O Canva está autorizado na proposta e as
     * páginas estão extraídas; o que faltava era escrever o conteúdo nos
     * parâmetros. Aqui é só leitura: diz o que será preenchido, o que divergiu e
     * o que o deck realmente não traz.
     */
    const planoCanva = planoDePreenchimento((paginasCanva ?? []) as any[], lista.map((v: any) => ({
      campo: String(v.campo),
      valor: (v.valor as string | null) ?? null,
      status: (v.status as string | null) ?? null,
      origem: (v.origem as string | null) ?? null,
    })));
    const falsosNaoLocalizadosCanva = ((paginasCanva ?? []) as any[]).flatMap((p) =>
      falsosNaoLocalizados(p).map((campo) => ({ pagina: p.page_number as number, campo })),
    );

    const coberturaMaterial = coberturaContratual(pessoasContratuais, blocosIncorporados);
    const anexoIIncorporado = anexoIIncorporadoNoCorpo(blocosIncorporados);
    const modoAnexos = modoAnexosEfetivo(pegar("modo_anexos"), anexoIIncorporado);
    if (!ausenciaDeAnexoEhPendencia(modoAnexos.modo)) {
      const i = bloqueios.findIndex((b) => b.motivo === MOTIVO_SEM_ANEXO_APLICAVEL);
      if (i >= 0) bloqueios.splice(i, 1);
    }

    /*
     * Aplicabilidade real dos cinco anexos, pela mesma regra única. Nenhum
     * deles, ausente por não aplicabilidade, bloqueia a assinatura inicial:
     * Anexo I porque o conteúdo está no corpo; II, III, IV e V porque dependem
     * de um ato concreto que pode nunca acontecer.
     */
    const anexosGovernados = anexosIaV({
      ...entradaDeValores({
        caseId: caso.id,
        clienteNome: cliente?.nome ?? null,
        responsavel: null,
        contratoBaseVersao: CONTRATO_BASE_VERSAO,
        modelo: "MODELO-ESTUDO",
        valores: lista.map((v: any) => ({
          campo: v.campo,
          valor: v.valor,
          origem: v.origem,
          status: v.status,
        })),
      }),
      anexoIIncorporadoNoCorpo: anexoIIncorporado,
    });
    const posterioresCondicionais = instrumentosPosteriores(anexosGovernados);

    return {
      canva: {
        registroId: registro?.id ?? null,
        plano: planoCanva,
        aPreencher: aPreencher(planoCanva).map((i) => i.campo),
        divergentes: divergencias(planoCanva).map((i) => i.campo),
        foraDoCanva: CAMPOS_FORA_DO_CANVA.map((c) => ({ ...c })),
        falsosNaoLocalizados: falsosNaoLocalizadosCanva,
      },
      coberturaContratual: {
        completa: coberturaMaterial.completa,
        anexoIIncorporadoNoCorpo: anexoIIncorporado,
        blocos: blocosIncorporados.map((b) => ({
          chave: b.chave,
          titulo: b.titulo,
          clausula: b.clausula,
          pendencias: b.pendencias,
          bloqueiaAssinaturaInicial: b.bloqueiaAssinaturaInicial,
        })),
        pessoas: pessoasContratuais.map((p) => ({
          nome: p.nome,
          papeis: p.papeis,
          escopoIndividual: p.escopoIndividual,
          valorIndividual: p.valorIndividual,
          representadoPor: p.representadoPor,
          representacaoConfirmada: p.representacaoConfirmada,
          pendencias: p.pendencias,
        })),
        impeditivas: coberturaMaterial.impeditivas,
        posteriores: coberturaMaterial.posteriores,
        anexos: anexosGovernados.map((a) => ({
          codigo: a.codigo,
          titulo: a.titulo,
          aplicavel: a.aplicavel,
          obrigatorio: a.obrigatorio,
          estado: a.estado,
          motivo: a.motivo,
          pendencias: a.pendencias,
          bloqueiaAssinaturaInicial: false,
        })),
        instrumentosPosteriores: posterioresCondicionais,
      },
      caso: {
        id: caso.id,
        codigo: caso.codigo,
        titulo: caso.titulo,
        pais: caso.pais,
        via: caso.via,
        status: caso.status,
        contrato_assinado: caso.contrato_assinado,
        codigos_legados: caso.codigos_legados ?? [],
        // §20 do De-Para (Jurídico & Contrato, zona 4 "Validação
        // jurídica"): "cadeia documental completa validada" — já existia
        // como o gate real que o portal consulta
        // (AGENTS.md: confirmarDocumentosMinimos), mas nunca era exibido
        // nesta tela de contrato do mesmo caso.
        documentos_minimos_ok: caso.documentos_minimos_ok,
      },
      aliasDe,
      cliente: cliente ? { id: cliente.id, nome: cliente.nome, email: cliente.email, telefone: cliente.telefone } : null,
      registro,
      proposta: (propostaEfetiva ?? null) as any,
      modelo: modelo ?? null,
      base: base ?? null,
      membros: membros ?? [],
      contrato,
      valores: await anexarOpcoesVivasDoCatalogo(supabase, org, caso.id, lista),
      modoAnexos: { ...modoAnexos, avisoNoCorpo: AVISO_ANEXOS_NO_CORPO },
      previas: previas ?? [],
      previasHistorico: previasHistorico ?? [],
      /*
       * 08/10/2026 — quando o parâmetro mais recente foi alterado. A tela usa
       * isto para dizer "Prévia desatualizada" e travar PDF/revisão/assinatura
       * até regerar; o servidor aplica a mesma regra ao gerar o documento.
       */
      /*
       * 09/10/2026: só parâmetro COM valor conta. Semear uma linha nova e
       * vazia (a migration de `modo_anexos`, em 08/10) não mudou o
       * documento — não pode marcar a prévia como velha nem travar o PDF.
       */
      parametroAlteradoEm:
        ((valores ?? []) as { atualizado_em?: string | null; valor?: string | null }[])
          .filter((v) => String(v.valor ?? "").trim() !== "")
          .map((v) => v.atualizado_em ?? "")
          .filter(Boolean)
          .sort()
          .pop() ?? null,
      anexos,
      anexosPersistidos,
      completude: (completude as any).data ?? null,
      pendencias: (pendencias as any).data ?? [],
      bloqueios,
      coerencia,
      produtoPaiId: planoAtivo?.produto_pai_id ?? null,
      planejador: planoAtivo
        ? {
            produtoPaiId: planoAtivo.produto_pai_id ?? null,
            rota: planoAtivo.rota_confirmada ?? null,
            fase: planoAtivo.fase_jornada ?? null,
            marco: planoAtivo.marco_atual ?? null,
          }
        : null,
      governadoPeloPlanejador: casoGovernadoPeloPlanejador({
        produtoPaiId: planoAtivo?.produto_pai_id,
        origemProposta: (proposta as any)?.origem,
      }),
      instrumento: NOME_INSTRUMENTO,
      partesContrato,
      dependentes: dependentesRaw ?? [],
      condicaoParticular: condicaoParticularDoCaso((servicoRaw as any) ?? null, (proposta as any) ?? null),
      pendenciasHumanas: pendenciasHumanasDoContrato({
        partes: partesContrato,
        telefonesCanonicos,
        aceitos,
        dependentes: (dependentesRaw ?? []) as DependenteContrato[],
        revisaoAprovada: Boolean(finalAprovada),
      }),
      faturas: faturas ?? [],
      escopo: { validade: validadeEscopo, cobertura, conflitos: conflitosEscopo.length },
      revisaoAprovadaEm: finalAprovada?.aprovado_em ?? null,
    };
  });

/** Registra o pedido de revisão humana enquanto houver bloqueios. */
export const solicitarRevisaoHumana = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; nota: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Sb;
    const userId = context.userId as string;
    const nota = String(data.nota ?? "").trim();
    if (!nota) throw new Error("Descreva o que precisa de revisão humana.");
    if (nota.length > 500) throw new Error("A nota de revisão excede 500 caracteres.");

    const { data: registro } = await supabase
      .from("contract_case_parameters")
      .select("id,organization_id,case_id,status")
      .eq("id", data.id)
      .maybeSingle();
    if (!registro) throw new Error("Ficha de parâmetros não encontrada.");

    const { data: completo } = await supabase
      .from("contract_case_parameters")
      .select("id,case_id,proposal_id")
      .eq("id", registro.id)
      .maybeSingle();
    await exigirCoerencia(supabase, completo ?? registro, { userId, organizationId: registro.organization_id });

    /*
     * 09/10/2026 — gap medido: a regra de prévia desatualizada travava PDF e
     * DOCX e NÃO travava a revisão. Dava para pedir revisão humana de um
     * documento gerado antes da última alteração de parâmetro, ou de uma
     * prévia sem corpo contratual — a pessoa revisaria o texto errado.
     */
    await exigirPreviaVigenteLiberada(supabase, {
      parametersId: registro.id,
      organizationId: registro.organization_id,
      saida: "revisao",
    });

    await auditar(supabase, {
      org: registro.organization_id,
      userId,
      acao: "contrato_revisao_humana_solicitada",
      entidadeId: registro.id,
      metadados: { case_id: registro.case_id, nota_tamanho: nota.length, status: registro.status },
    });

    if (["rascunho", "em_validacao"].includes(registro.status)) {
      await gravarComVerificacao({
        supabase,
        tabela: "contract_case_parameters",
        id: registro.id,
        organizationId: registro.organization_id,
        userId,
        payload: { status: "em_validacao" },
      });
    }

    return { ok: true };
  });

/** Auditoria da preparação, sem expor conteúdo sensível. */
export const auditoriaPreparacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as Sb;
    const { data: eventos } = await supabase
      .from("audit_logs")
      .select("id,acao,created_at,metadados")
      .eq("entidade", "contract_case_parameters")
      .eq("entidade_id", data.id)
      .order("created_at", { ascending: false })
      .limit(30);
    return { eventos: eventos ?? [] };
  });
