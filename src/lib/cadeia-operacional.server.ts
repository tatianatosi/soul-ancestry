/**
 * Persistência da cadeia operacional. Reutiliza as entidades canônicas já
 * existentes: case_plans, proposals, product_catalog, commercial_conditions,
 * service_orders, contract_scope_items, contract_parameter_previews.
 *
 * Nada aqui assina, cobra, comunica, pesquisa fora ou cria entidade paralela.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  avaliarPlanejador,
  bloqueiosAprovacaoProposta,
  bloqueiosOS,
  conteudoOSDaProposta,
  consolidarCadeia,
  derivarCondicaoComercial,
  hashConteudo,
  itensEscopoDaOS,
  referenciaOrigemEscopo,
  montarEscopoEstruturado,
  pendenciasParaPainel,
  planejadorLiberaProposta,
  type ChaveEloOperacional,
  type EntradaPlanejador,
  type PropostaEstruturada,
  type SkuCanonicoProposta,
} from "@/lib/cadeia-operacional";
import { linhas } from "@/lib/linhas";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { pessoasDoCasoComFallbackNucleo } from "@/lib/pessoa-vinculo";

type Sb = any;

export async function orgDoUsuario(supabase: Sb, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .maybeSingle();
  const org = data?.organization_id as string | undefined;
  if (!org) throw new Error("Usuário sem organização.");
  return org;
}

async function auditar(
  supabase: Sb,
  input: { org: string; userId: string; acao: string; entidade: string; entidadeId: string | null; metadados: any },
) {
  await supabase.from("audit_logs").insert({
    organization_id: input.org,
    user_id: input.userId,
    acao: input.acao,
    entidade: input.entidade,
    entidade_id: input.entidadeId,
    metadados: input.metadados,
  });
}

async function casoDaCadeia(supabase: Sb, org: string, caseId: string) {
  const { data: caso } = await supabase
    .from("crm_casos")
    .select("id,codigo,titulo,organization_id,archived_at,demo,dados_teste,responsavel_id,responsavel_principal,prazo_proxima_acao")
    .eq("id", caseId)
    .maybeSingle();
  if (!caso || caso.organization_id !== org) throw new Error("Caso não encontrado nesta organização.");
  if (caso.archived_at) throw new Error("Caso arquivado: cadeia operacional bloqueada.");
  if (caso.demo) throw new Error("Caso DEMO não alimenta a cadeia operacional.");
  return caso;
}

function skuCanonico(row: any | null): SkuCanonicoProposta | null {
  if (!row) return null;
  const lista = (v: any): string[] =>
    Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : String(v ?? "").split(/\r?\n|;/).map((t) => t.trim()).filter(Boolean);
  const preco = row.preco_sugerido_fonte ?? row.preco_comercial_vigente ?? null;
  return {
    id: row.id,
    code: row.code,
    ativo: row.ativo !== false && !row.archived_at,
    elegivel_para_proposta: row.elegivel_para_proposta !== false,
    preco_sugerido: preco === null || preco === undefined ? null : Number(preco),
    moeda: row.moeda ?? "BRL",
    fonte_referencia:
      row.planilha_mestre_identificador || row.planilha_mestre_versao
        ? `Planilha Mestre ${row.planilha_mestre_versao ?? ""} · ${row.planilha_mestre_identificador ?? ""}`.trim()
        : null,
    inclusoes: lista(row.inclusoes),
    exclusoes: lista(row.exclusoes),
    entregaveis: lista(row.entregaveis),
    dados_teste: row.dados_teste === true,
  };
}

const SELECT_SKU =
  "id,code,ativo,archived_at,elegivel_para_proposta,preco_sugerido_fonte,preco_comercial_vigente,moeda,planilha_mestre_versao,planilha_mestre_identificador,inclusoes,exclusoes,entregaveis,dados_teste";

/* ------------------------------------------------------------------ */
/* Elo 1 — planejador persistido (idempotente)                         */
/* ------------------------------------------------------------------ */

export async function sincronizarPlanejador(
  supabase: Sb,
  input: { org: string; userId: string; entrada: EntradaPlanejador },
) {
  const caso = await casoDaCadeia(supabase, input.org, input.entrada.caseId);
  const saida = avaliarPlanejador(input.entrada);

  const { data: existente } = await supabase
    .from("case_plans")
    .select("id,versao,plano_hash")
    .eq("case_id", caso.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // O SKU do planejador só pode vir do catálogo canônico (Planilha Mestre).
  const { data: skuPlano } = input.entrada.produtoSkuCodigo
    ? await supabase
        .from("product_catalog")
        .select("id")
        .eq("code", input.entrada.produtoSkuCodigo)
        .is("archived_at", null)
        .maybeSingle()
    : { data: null };

  const payload: Record<string, any> = {
    organization_id: input.org,
    case_id: caso.id,
    product_catalog_id: skuPlano?.id ?? null,
    objetivo: input.entrada.objetivo,
    etapa: input.entrada.etapa,
    composicao: input.entrada.composicao,
    rota_confirmada: input.entrada.rotaConfirmada,
    fase_jornada: saida.fase_jornada,
    checklist_aplicavel: saida.checklist_aplicavel,
    perguntas: saida.perguntas,
    marcos: saida.marcos,
    entregas: saida.entregas,
    microentregas: saida.microentregas,
    dependencias_cliente: saida.dependencias_cliente,
    dependencias_terceiros: saida.dependencias_terceiros,
    pendencias_cliente: saida.dependencias_cliente,
    pendencias_internas: saida.pendencias,
    fontes: Object.fromEntries(input.entrada.fontes.map((f) => [f.chave, { estado: f.estado, referencia: f.referencia ?? null }])),
    regras_anexos: saida.regras_anexos,
    responsavel_user_id: saida.responsavel_user_id,
    proxima_acao: saida.proxima_acao,
    prazo_proxima_acao: saida.prazo_proxima_acao,
    revisao_humana: "pendente",
    plano_hash: saida.hash,
    dados_teste: caso.dados_teste === true,
    status: "rascunho",
    updated_by: input.userId,
  };

  // Reprocessamento idempotente: hash igual não cria versão nem duplica itens.
  if (existente?.plano_hash === saida.hash) {
    return { planId: existente.id, versao: existente.versao, saida, idempotente: true };
  }

  let planId = existente?.id as string | undefined;
  let versao = (existente?.versao ?? 0) + 1;
  payload.versao = versao;

  if (planId) {
    const { error } = await supabase.from("case_plans").update(payload).eq("id", planId);
    if (error) throw new Error(error.message);
  } else {
    versao = 1;
    payload.versao = 1;
    const { data, error } = await supabase
      .from("case_plans")
      .insert({ ...payload, created_by: input.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    planId = data.id;
  }

  await auditar(supabase, {
    org: input.org,
    userId: input.userId,
    acao: "planejador_sincronizado",
    entidade: "case_plans",
    entidadeId: planId ?? null,
    metadados: { case_id: caso.id, versao, hash: saida.hash, pendencias: saida.pendencias.length, bloqueios: saida.bloqueios.length },
  });

  return { planId: planId as string, versao, saida, idempotente: false };
}

/* ------------------------------------------------------------------ */
/* Elo 2 — proposta estruturada derivada do planejador                 */
/* ------------------------------------------------------------------ */

/**
 * Decisão 5 (CA-DECISÕES-DA-PROPRIETÁRIA, 09/09/2026) — resolve o nome real
 * de quem está autenticado (staff_access.full_name/email), nunca um texto
 * fixo do tipo "Comercial responsável"/"Operações responsável" vindo do
 * cliente. Sem cadastro na organização, cai no próprio userId — nunca fica
 * vazio nem inventa nome.
 */
export async function nomeResponsavelSessao(supabase: Sb, org: string, userId: string): Promise<string> {
  const { data: staff } = await supabase
    .from("staff_access")
    .select("full_name,email")
    .eq("organization_id", org)
    .eq("auth_user_id", userId)
    .maybeSingle();
  const nome = (staff?.full_name as string | null)?.trim();
  const email = (staff?.email as string | null)?.trim();
  return nome || email || userId;
}

export async function materializarProposta(
  supabase: Sb,
  input: { org: string; userId: string; caseId: string },
) {
  const caso = await casoDaCadeia(supabase, input.org, input.caseId);
  const responsavelSessao = await nomeResponsavelSessao(supabase, input.org, input.userId);
  // Responsável operacional real do caso quando já atribuído; sem isso, cai
  // em quem está materializando a proposta agora — nunca um rótulo fixo.
  const responsavelOperacional = (caso as { responsavel_principal?: string | null }).responsavel_principal?.trim() || responsavelSessao;

  // Fonte do planejador — duas tabelas reais coexistem, nenhuma é descartável
  // por si só (achado de 08/09/2026, prompt "Fechar o elo Planejador →
  // Proposta → Condição Comercial"):
  //
  // `case_plans` tem o formulário real e testado (`PlanejadorOperacional`,
  // ligado desde 28/08 — ver comentário nesse componente) e schema idêntico
  // a `EntradaPlanejador`/`SaidaPlanejador`, mas está com zero linhas na base
  // inteira: ninguém ainda salvou por essa tela.
  //
  // `blueprint_parameters` tem dado real para casos já preparados (ex.: Ana,
  // seed de 20/08), mas nenhuma tela do runtime escreve nela — só existe por
  // inserção direta — e seu schema NÃO é o mesmo de `case_plans` (não tem
  // objetivo/etapa/composição/marcos/checklist; tem `entregas_previstas` e
  // `criterios_aceite`, que `entradaDoPlano` também já lê). O diagnóstico de
  // 05/09 fixou blueprint como sempre preferencial — o que significa que,
  // quando a proprietária preencher `case_plans` pela tela real de um caso
  // que já tem blueprint seed antigo, a entrada dela seria ignorada. Corrigido
  // aqui: vence quem foi atualizado por último, não uma tabela fixa.
  const [{ data: blueprint }, { data: planoLegado }] = await Promise.all([
    supabase
      .from("blueprint_parameters")
      .select("*")
      .eq("case_id", caso.id)
      .is("archived_at", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("case_plans")
      .select("*")
      .eq("case_id", caso.id)
      .is("archived_at", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const plano =
    !blueprint ? planoLegado
    : !planoLegado ? blueprint
    : new Date(planoLegado.updated_at).getTime() > new Date(blueprint.updated_at).getTime() ? planoLegado
    : blueprint;
  if (!plano) {
    throw new Error(
      "Sem planejador persistido: crie o Planejador Universal do caso antes de materializar a proposta.",
    );
  }

  const { data: skuRow } = plano.product_catalog_id
    ? await supabase.from("product_catalog").select(SELECT_SKU).eq("id", plano.product_catalog_id).is("archived_at", null).maybeSingle()
    : { data: null };
  const sku = skuCanonico(skuRow);
  // O Planejador Universal define escopo, fases, entregas e critérios sem
  // depender de SKU do catálogo. Exigir SKU aqui era a regra antiga, e travava
  // caso com blueprint completo. Para a proprietária, a ausência de SKU vira
  // pendência assumida; para os demais papéis segue bloqueando.
  if (!sku) {
    const { assumirOuRecusarComUsuario } = await import("@/lib/autoridade.server");
    await assumirOuRecusarComUsuario(
      supabase as never,
      input.userId,
      ["Planejador sem SKU homologado do catálogo (Planilha Mestre)."],
      "Planejador sem SKU homologado do catálogo (Planilha Mestre): proposta bloqueada.",
    );
  }

  const entrada = entradaDoPlano(plano, caso.id, sku?.code ?? "");
  const saida = avaliarPlanejador(entrada);
  const libera = planejadorLiberaProposta(saida);
  // Autoridade operacional (05/09/2026): pendência do planejador informa, não
  // impede. Este era o primeiro elo da cadeia comercial e travava tudo adiante.
  if (!libera.ok) {
    const { assumirOuRecusarComUsuario } = await import("@/lib/autoridade.server");
    await assumirOuRecusarComUsuario(
      supabase as never,
      input.userId,
      libera.motivos,
      `Planejador com pendência: ${libera.motivos.slice(0, 3).join(" · ")}${libera.motivos.length > 3 ? " …" : ""}`,
    );
  }


  // 07/09/2026 — mesmo achado do cotéjo tela a tela aplicado à Ficha 360:
  // leitura crua de case_members sem fallback para Núcleos. Troca para a
  // função única já usada por contrato/escopo/cadastro/consolidação.
  const membrosComFallback = await pessoasDoCasoComFallbackNucleo(supabase as never, caso.id);
  const pessoas = membrosComFallback.map((m) => ({
    nome: m.nome,
    papel: (m as { papel_no_caso?: string | null }).papel_no_caso ?? (m.titular ? "titular" : m.contratante ? "contratante" : m.dependente ? "dependente" : "participante"),
  }));

  const escopo = montarEscopoEstruturado({ entrada, saida, planId: plano.id, sku, pessoas });

  const { data: atual } = await supabase
    .from("proposals")
    .select("id,versao,status,escopo_estruturado,origem,plan_id,origem_referencia")
    .eq("case_id", caso.id)
    .is("archived_at", null)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Achado real (08/09/2026, prompt "Fechar o elo Planejador → Proposta →
  // Condição Comercial", parte B): a proposta real da Ana é aprovada, origem
  // Canva, e nunca passou por este pipeline (plan_id nulo). Sem esta guarda,
  // clicar "Derivar proposta do planejador" aqui criaria uma v2 e marcaria a
  // v1 aprovada como substituída — apagando de fato a proposta Canva real
  // por uma gerada a partir de um Planejador vazio/desatualizado. Regra do
  // prompt: "a decisão do Planejador deve entrar como origem complementar/
  // versionada do escopo, jamais apagar metadados de Canva". Corrigido:
  // proposta Canva já aprovada, sem plan_id, nunca é versionada por aqui —
  // só recebe o vínculo ao plano (rastreabilidade), sem tocar escopo, valor,
  // origem ou páginas extraídas.
  if (atual && atual.origem === "canva" && atual.status !== "rascunho") {
    if (!atual.plan_id) {
      await gravarComVerificacao({
        supabase,
        tabela: "proposals",
        id: atual.id,
        organizationId: input.org,
        userId: input.userId,
        payload: { plan_id: plano.id },
      });
      await auditar(supabase, {
        org: input.org,
        userId: input.userId,
        acao: "planejador_vinculado_a_proposta_canva_sem_versionar",
        entidade: "proposals",
        entidadeId: atual.id,
        metadados: { case_id: caso.id, plan_id: plano.id, origem_referencia: atual.origem_referencia },
      });
    }
    return { proposalId: atual.id, versao: atual.versao, idempotente: true, escopo: null, vinculoSomente: true };
  }

  const payload: Record<string, any> = {
    organization_id: input.org,
    case_id: caso.id,
    plan_id: plano.id,
    status: "rascunho",
    escopo: escopo.servicos_incluidos.map((s) => `• ${s}`).join("\n"),
    exclusoes: escopo.exclusoes.map((s) => `• ${s}`).join("\n"),
    escopo_estruturado: escopo,
    // Sem SKU, o Planejador Universal e a proposta aprovada sao a fonte:
    // preco vem do blueprint ou da propria proposta, nunca inventado.
    product_catalog_id: sku?.id ?? null,
    valor: sku?.preco_sugerido ?? (plano as { preco_comercial_vigente?: number | null }).preco_comercial_vigente ?? null,
    moeda: sku?.moeda ?? "BRL",
    preco_fonte_referencia: sku?.fonte_referencia ?? "planejador_universal",
    responsavel_comercial: responsavelSessao,
    responsavel_operacional: responsavelOperacional,
    dados_teste: caso.dados_teste === true,
    updated_by: input.userId,
  };

  // Conteúdo idêntico não gera nova versão.
  if (atual && hashConteudo(atual.escopo_estruturado) === hashConteudo(escopo) && atual.status === "rascunho") {
    return { proposalId: atual.id, versao: atual.versao, idempotente: true, escopo };
  }

  let proposalId: string;
  let versao: number;
  if (atual && atual.status === "rascunho") {
    versao = atual.versao ?? 1;
    const { error } = await supabase.from("proposals").update(payload).eq("id", atual.id);
    if (error) throw new Error(error.message);
    proposalId = atual.id;
  } else {
    versao = (atual?.versao ?? 0) + 1;
    const { data, error } = await supabase
      .from("proposals")
      .insert({ ...payload, versao, derivada_de_id: atual?.id ?? null, created_by: input.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    proposalId = data.id;
    if (atual) {
      await supabase
        .from("proposals")
        .update({ substituida_em: new Date().toISOString(), substituida_por_id: proposalId })
        .eq("id", atual.id);
    }
  }

  await auditar(supabase, {
    org: input.org,
    userId: input.userId,
    acao: "proposta_estruturada_derivada_do_planejador",
    entidade: "proposals",
    entidadeId: proposalId,
    metadados: { case_id: caso.id, plan_id: plano.id, versao, sku: sku?.code ?? null, fonte_planejador: "blueprint_parameters", plano_hash: saida.hash },
  });

  return { proposalId, versao, idempotente: false, escopo };
}

/**
 * Traduz a linha de planejador (case_plans OU blueprint_parameters — schemas
 * diferentes, ver comentário em `materializarProposta`) para a entrada pura
 * do motor. Campos que só existem em `case_plans` (objetivo, etapa,
 * composição, rota, marcos, checklist, perguntas, responsável, próxima ação)
 * ficam `null`/`[]` quando a origem é `blueprint_parameters` — isso é
 * pendência real e honesta (o motor não infere o que a fonte não declara),
 * não um bug a mascarar. `entregas` aceita `entregas_previstas` do blueprint
 * como equivalente direto (mesmo significado, nome de coluna diferente).
 */
export function entradaDoPlano(plano: any, caseId: string, skuCodigo: string | null): EntradaPlanejador {
  const fontes = Object.entries((plano.fontes ?? {}) as Record<string, any>).map(([chave, v]) => ({
    chave,
    estado: (v?.estado ?? "pendente") as any,
    referencia: v?.referencia ?? null,
  }));
  return {
    caseId,
    objetivo: plano.objetivo ?? null,
    etapa: plano.etapa ?? null,
    composicao: plano.composicao ?? null,
    rotaConfirmada: plano.rota_confirmada ?? null,
    produtoSkuCodigo: skuCodigo,
    dadosDisponiveis: plano.checklist_aplicavel ?? [],
    dependenciasCliente: plano.dependencias_cliente ?? [],
    dependenciasTerceiros: plano.dependencias_terceiros ?? [],
    fontes,
    responsavelUserId: plano.responsavel_user_id ?? null,
    proximaAcao: plano.proxima_acao ?? null,
    prazoProximaAcao: plano.prazo_proxima_acao ?? null,
    faseJornada: plano.fase_jornada ?? null,
    checklist: plano.checklist_aplicavel ?? [],
    perguntas: plano.perguntas ?? [],
    marcos: plano.marcos ?? [],
    entregas: plano.entregas ?? plano.entregas_previstas ?? [],
    microentregas: plano.microentregas ?? [],
    regrasAnexos: plano.regras_anexos ?? [],
  };
}

/* ------------------------------------------------------------------ */
/* Elos 3 e 4 — aprovação, condição comercial e OS/Anexo I             */
/* ------------------------------------------------------------------ */

function propostaCanonica(row: any): PropostaEstruturada {
  const e = row.escopo_estruturado ?? null;
  return {
    id: row.id,
    case_id: row.case_id,
    plan_id: row.plan_id,
    versao: row.versao,
    status: row.status,
    escopo_estruturado: e,
    product_catalog_id: row.product_catalog_id,
    valor: row.valor === null || row.valor === undefined ? null : Number(row.valor),
    moeda: row.moeda,
    preco_fonte_referencia: row.preco_fonte_referencia,
    forma_pagamento: row.forma_pagamento,
    parcelas_declaradas: row.parcelas_declaradas ?? null,
    primeiro_vencimento_declarado: row.primeiro_vencimento_declarado ?? null,
    responsavel_comercial: row.responsavel_comercial,
    responsavel_operacional: row.responsavel_operacional,
  };
}

export async function aprovarPropostaEstruturada(
  supabase: Sb,
  input: {
    org: string;
    userId: string;
    proposalId: string;
    formaPagamento?: string | null;
    parcelasDeclaradas?: number | null;
    primeiroVencimentoDeclarado?: string | null;
  },
) {
  const { data: row } = await supabase.from("proposals").select("*").eq("id", input.proposalId).maybeSingle();
  if (!row || row.organization_id !== input.org) throw new Error("Proposta não encontrada nesta organização.");
  const caso = await casoDaCadeia(supabase, input.org, row.case_id);

  const proposta = propostaCanonica({
    ...row,
    forma_pagamento: input.formaPagamento ?? row.forma_pagamento,
    parcelas_declaradas: input.parcelasDeclaradas ?? null,
    primeiro_vencimento_declarado: input.primeiroVencimentoDeclarado ?? null,
  });

  const { data: skuRow } = await supabase.from("product_catalog").select(SELECT_SKU).eq("id", row.product_catalog_id).maybeSingle();
  const sku = skuCanonico(skuRow);
  const bloqueios = bloqueiosAprovacaoProposta(proposta, sku);
  // Pendência de aprovação informa, não impede. Segundo elo da cadeia.
  if (bloqueios.length) {
    const { assumirOuRecusarComUsuario } = await import("@/lib/autoridade.server");
    await assumirOuRecusarComUsuario(
      supabase as never,
      input.userId,
      bloqueios,
      `Proposta não pode ser aprovada: ${bloqueios.join(" · ")}`,
    );
  }

  const condicao = derivarCondicaoComercial(proposta, sku as SkuCanonicoProposta);

  const { error: erroProposta } = await supabase
    .from("proposals")
    .update({
      status: "aprovada",
      aprovada_em: new Date().toISOString(),
      forma_pagamento: proposta.forma_pagamento,
      updated_by: input.userId,
    })
    .eq("id", row.id);
  if (erroProposta) throw new Error(erroProposta.message);

  const { data: ccExistente } = await supabase
    .from("commercial_conditions")
    .select("id")
    .eq("proposal_id", row.id)
    .is("archived_at", null)
    .maybeSingle();

  const payloadCC = {
    organization_id: input.org,
    case_id: caso.id,
    proposal_id: row.id,
    codigo: `CC-${caso.codigo}-P${row.versao}`,
    product_catalog_id: condicao.product_catalog_id,
    valor_total_referencia: condicao.valor_total_referencia,
    forma_pagamento: condicao.forma_pagamento,
    parcelas: condicao.parcelas,
    valor_parcela: condicao.parcelas ? Number((condicao.valor_total_referencia / condicao.parcelas).toFixed(2)) : null,
    primeiro_vencimento: condicao.primeiro_vencimento,
    origem: condicao.origem,
    status: condicao.pendencias.length ? "pendente" : "registrada",
    observacao_interna: condicao.pendencias.join(" · ") || null,
    dados_teste: caso.dados_teste === true,
    updated_by: input.userId,
  };

  let condicaoId: string;
  if (ccExistente?.id) {
    const { error } = await supabase.from("commercial_conditions").update(payloadCC).eq("id", ccExistente.id);
    if (error) throw new Error(error.message);
    condicaoId = ccExistente.id;
  } else {
    const { data, error } = await supabase
      .from("commercial_conditions")
      .insert({ ...payloadCC, created_by: input.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    condicaoId = data.id;
  }

  await auditar(supabase, {
    org: input.org,
    userId: input.userId,
    acao: "proposta_aprovada_condicao_derivada",
    entidade: "commercial_conditions",
    entidadeId: condicaoId,
    metadados: {
      case_id: caso.id,
      proposal_id: row.id,
      sku: sku?.code,
      fonte_preco: condicao.origem,
      pendencias: condicao.pendencias,
    },
  });

  return { proposalId: row.id, condicaoId, pendencias: condicao.pendencias };
}

/**
 * Persiste os itens de escopo do contrato herdando a origem da proposta
 * aprovada (proposta → condição comercial → OS). Nunca apaga: itens que saíram
 * da proposta são arquivados com motivo declarado.
 */
async function sincronizarEscopoContratual(
  supabase: Sb,
  input: {
    org: string;
    userId: string;
    contratoId: string;
    proposalId: string;
    condicaoId: string;
    osId: string;
    itens: ReturnType<typeof itensEscopoDaOS>;
  },
) {
  const atuais = await supabase
    .from("contract_scope_items")
    .select("id,title,category,archived_at")
    .eq("organization_id", input.org)
    .eq("contract_id", input.contratoId)
    .eq("source_type", "proposal");

  const chave = (c: string, t: string) => `${c}::${t}`;
  const existentes = new Map<string, any>();
  for (const r of linhas<any>(atuais, "itens de escopo já vinculados ao contrato"))
    existentes.set(chave(r.category, r.title), r);

  let inseridos = 0;
  let atualizados = 0;
  const desejados = new Set<string>();

  for (const item of input.itens) {
    const k = chave(item.category, item.title);
    desejados.add(k);
    const comum = {
      organization_id: input.org,
      contract_id: input.contratoId,
      proposal_id: input.proposalId,
      commercial_condition_id: input.condicaoId,
      service_order_id: input.osId,
      category: item.category,
      title: item.title,
      description: item.description,
      status: item.status,
      source_type: item.source_type,
      source_reference: item.source_reference,
      display_order: item.display_order,
      requires_human_validation: item.requires_human_validation,
      updated_by: input.userId,
    };
    const atual = existentes.get(k);
    if (atual) {
      const { error } = await supabase
        .from("contract_scope_items")
        .update({ ...comum, archived_at: null, archived_by: null, archive_reason: null })
        .eq("id", atual.id);
      if (error) throw new Error(error.message);
      atualizados += 1;
    } else {
      const { error } = await supabase
        .from("contract_scope_items")
        .insert({ ...comum, created_by: input.userId });
      if (error) throw new Error(error.message);
      inseridos += 1;
    }
  }

  let arquivados = 0;
  for (const [k, r] of existentes) {
    if (desejados.has(k) || r.archived_at) continue;
    const { error } = await supabase
      .from("contract_scope_items")
      .update({
        archived_at: new Date().toISOString(),
        archived_by: input.userId,
        archive_reason: "Item deixou de constar na proposta aprovada vigente.",
        updated_by: input.userId,
      })
      .eq("id", r.id);
    if (error) throw new Error(error.message);
    arquivados += 1;
  }

  return { inseridos, atualizados, arquivados };
}



/**
 * Escritor único e idempotente de OS/Anexo I (Corte B, 09/09/2026 —
 * docs/relatorios/2026-09-09_consolidacao_3_redundancias_criticas_execucao.md).
 * Antes, o caminho automático (esta função, então chamada `emitirOSAnexoI`) e
 * o formulário manual (`salvarOrdemServico`, contratos.functions.ts)
 * escreviam `service_orders` por caminhos incompatíveis — o manual inseria
 * direto, sem checar OS existente nem preencher proposal_id/commercial_
 * condition_id/hash. Os dois agora chamam esta função; `origem` só registra
 * como esta versão nasceu, não cria um segundo motor.
 *
 * `proposalId` explícito é o caminho automático (vem do Planejador/Proposta/
 * Condição já resolvidos). Quando ausente (formulário manual, que só tem
 * `caseId`), resolve a proposta aprovada mais recente do caso — mesma regra
 * de "mais recente vence" já usada em `materializarProposta`.
 */
export async function emitirOuRecuperarOS(
  supabase: Sb,
  input: {
    org: string;
    userId: string;
    origem: "planejador_proposta_condicao" | "manual" | "reabertura_ou_ajuste";
    proposalId?: string;
    caseId?: string;
  },
) {
  let proposalId = input.proposalId ?? null;
  if (!proposalId) {
    if (!input.caseId) throw new Error("OS/Anexo I exige proposalId ou caseId para localizar a proposta aprovada.");
    const { data: propostaRecente } = await supabase
      .from("proposals")
      .select("id")
      .eq("organization_id", input.org)
      .eq("case_id", input.caseId)
      .eq("status", "aprovada")
      .is("archived_at", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!propostaRecente?.id) {
      throw new Error(
        "OS/Anexo I exige proposta aprovada para o caso (Proposta → Condição comercial → OS) — nenhuma encontrada.",
      );
    }
    proposalId = propostaRecente.id;
  }

  const { data: row } = await supabase.from("proposals").select("*").eq("id", proposalId).maybeSingle();
  if (!row || row.organization_id !== input.org) throw new Error("Proposta não encontrada nesta organização.");
  if (row.status !== "aprovada") throw new Error("OS/Anexo I exige proposta aprovada.");
  const caso = await casoDaCadeia(supabase, input.org, row.case_id);

  const { data: condicao } = await supabase
    .from("commercial_conditions")
    .select("id,codigo,status,primeiro_vencimento,parcelas,forma_pagamento")
    .eq("proposal_id", row.id)
    .is("archived_at", null)
    .maybeSingle();

  // A OS/Anexo I é peça do contrato: exige contrato-rascunho já preparado no caso.
  const { data: contrato } = await supabase
    .from("contracts")
    .select("id,status")
    .eq("case_id", caso.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!contrato)
    throw new Error("OS/Anexo I exige contrato preparado para o caso (ficha contratual e minuta em rascunho).");

  if (!condicao?.id)
    throw new Error(
      "OS/Anexo I exige condição comercial persistida a partir da proposta aprovada (Proposta → Condição comercial → OS).",
    );

  const conteudo = conteudoOSDaProposta(propostaCanonica(row), condicao.id);
  const bloqueios = bloqueiosOS(conteudo);
  // Pendência estrutural da OS informa, não impede. Terceiro elo da cadeia.
  if (bloqueios.length) {
    const { assumirOuRecusarComUsuario } = await import("@/lib/autoridade.server");
    await assumirOuRecusarComUsuario(
      supabase as never,
      input.userId,
      bloqueios,
      `OS/Anexo I bloqueada por pendência estrutural: ${bloqueios.join(" · ")}`,
    );
  }

  // Conciliação contra o catálogo homologado: SKU, preço, condição e
  // suficiência de escopo. 09/09/2026 — mesmo achado já corrigido em
  // gerarRascunhoInterno (contratos.functions.ts): divergência de catálogo
  // travava a própria criação da OS em rascunho, quando deveria travar só o
  // ato externo (protocolo/assinatura). OS nasce em status "draft" — a
  // pendência informa (mesmo padrão de `bloqueios`/assumirOuRecusarComUsuario
  // logo acima), nunca impede o registro do rascunho interno.
  const { registrarConciliacao } = await import("@/lib/conciliacao-catalogo.server");
  const { mensagemBloqueio } = await import("@/lib/conciliacao-catalogo");
  const conciliacao = await registrarConciliacao(supabase, {
    org: input.org,
    userId: input.userId,
    proposalId: row.id,
  });
  let pendenciasConciliacao: string[] = [];
  if (mensagemBloqueio(conciliacao)) {
    const { assumirOuRecusarComUsuario } = await import("@/lib/autoridade.server");
    pendenciasConciliacao = await assumirOuRecusarComUsuario(
      supabase as never,
      input.userId,
      conciliacao.bloqueios,
      `OS/Anexo I registrada com pendência de conciliação de catálogo: ${conciliacao.bloqueios.join(" · ")}`,
    );
  }


  const hash = hashConteudo(conteudo);
  const { data: osExistente } = await supabase
    .from("service_orders")
    .select("id,versao,conteudo_hash")
    .eq("proposal_id", row.id)
    .is("archived_at", null)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (osExistente?.conteudo_hash === hash) {
    return { osId: osExistente.id, versao: osExistente.versao, idempotente: true, conteudo, pendenciasConciliacao };
  }

  const versao = (osExistente?.versao ?? 0) + 1;
  const { data: os, error } = await supabase
    .from("service_orders")
    .insert({
      organization_id: input.org,
      case_id: caso.id,
      contract_id: contrato.id,
      proposal_id: row.id,
      commercial_condition_id: condicao.id,
      versao,
      conteudo_hash: hash,
      status: "draft",
      origem: input.origem,
      // Decisão 5 (CA-DECISÕES-DA-PROPRIETÁRIA, 09/09/2026) — nunca vazio
      // nem fictício: responsável real do caso quando atribuído, senão quem
      // está emitindo a OS agora.
      responsible_user_id: (caso as { responsavel_id?: string | null }).responsavel_id ?? input.userId,
      start_condition_status: "pending",
      scope_summary: [
        `Objetivo: ${conteudo.objetivo}`,
        ...conteudo.escopo.map((s) => `• ${s} (fonte: proposta v${row.versao} · SKU ${conteudo.sku_codigo})`),
        ...conteudo.inclusoes.map((s) => `+ inclusão: ${s} (fonte: catálogo/Planilha Mestre)`),
        ...conteudo.exclusoes.map((s) => `- exclusão: ${s} (fonte: catálogo/Planilha Mestre)`),
      ].join("\n"),
      deliverable_summary: [
        ...conteudo.entregas.map((s) => `• entrega: ${s} (fonte: planejador)`),
        ...conteudo.microentregas.map((s) => `• microentrega: ${s} (fonte: planejador)`),
      ].join("\n"),
      internal_notes: [
        `Pessoas abrangidas: ${conteudo.pessoas.map((p) => `${p.nome} (${p.papel})`).join("; ")}`,
        `Dependências: ${conteudo.dependencias.join("; ") || "não declaradas"}`,
        `Condição comercial: ${condicao?.id ?? "ausente"} (${condicao?.status ?? "—"})`,
      ].join("\n"),
      dados_teste: caso.dados_teste === true,
      created_by: input.userId,
      updated_by: input.userId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const itensEscopo = await sincronizarEscopoContratual(supabase, {
    org: input.org,
    userId: input.userId,
    contratoId: contrato.id,
    proposalId: row.id,
    condicaoId: condicao.id,
    osId: os.id,
    itens: itensEscopoDaOS(conteudo, {
      propostaVersao: row.versao,
      skuCodigo: conteudo.sku_codigo,
      condicaoCodigo: condicao.codigo ?? null,
      osVersao: versao,
    }),
  });

  await auditar(supabase, {
    org: input.org,
    userId: input.userId,
    acao: "os_anexo_i_emitida_da_proposta",
    entidade: "service_orders",
    entidadeId: os.id,
    metadados: {
      case_id: caso.id,
      proposal_id: row.id,
      versao,
      hash,
      origem_os: input.origem,
      condicao_id: condicao.id,
      escopo_inseridos: itensEscopo.inseridos,
      escopo_atualizados: itensEscopo.atualizados,
      origem: referenciaOrigemEscopo({
        propostaVersao: row.versao,
        skuCodigo: conteudo.sku_codigo,
        condicaoCodigo: condicao.codigo ?? null,
        osVersao: versao,
      }),
    },
  });

  return { osId: os.id, versao, idempotente: false, conteudo, escopo: itensEscopo, pendenciasConciliacao };
}

/* ------------------------------------------------------------------ */
/* Estado consolidado (leitura)                                        */
/* ------------------------------------------------------------------ */

export async function estadoCadeiaOperacional(
  supabase: Sb,
  org: string,
  caseId: string,
  opcoes: { userId?: string } = {},
) {
  const caso = await casoDaCadeia(supabase, org, caseId);

  const { data: contratoDaCadeia } = await supabase
    .from("contracts")
    .select("id,status,contract_number")
    .eq("case_id", caseId)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const [{ data: plano }, { data: proposta }] = await Promise.all([
    supabase.from("case_plans").select("*").eq("case_id", caso.id).is("archived_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("proposals").select("*").eq("case_id", caso.id).is("archived_at", null).order("versao", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const [{ data: condicao }, { data: os }, { data: ficha }] = await Promise.all([
    proposta?.id
      ? supabase.from("commercial_conditions").select("*").eq("proposal_id", proposta.id).is("archived_at", null).maybeSingle()
      : Promise.resolve({ data: null }),
    proposta?.id
      ? supabase.from("service_orders").select("*").eq("proposal_id", proposta.id).is("archived_at", null).order("versao", { ascending: false }).limit(1).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("contract_case_parameters").select("id,status,revisao_humana_em").eq("case_id", caso.id).is("archived_at", null).maybeSingle(),
  ]);

  const { data: previa } = ficha?.id
    ? await supabase
        .from("contract_parameter_previews")
        .select("id,tipo,congelado_em,aprovado_em")
        .eq("parameters_id", ficha.id)
        .order("congelado_em", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const catalogoId = proposta?.product_catalog_id ?? plano?.product_catalog_id ?? null;
  const skuRow = catalogoId
    ? (await supabase.from("product_catalog").select(SELECT_SKU).eq("id", catalogoId).maybeSingle()).data
    : null;
  const sku = skuCanonico(skuRow);

  const entradaPlano = plano ? entradaDoPlano(plano, caso.id, sku?.code ?? null) : null;
  const saidaPlano = entradaPlano ? avaliarPlanejador(entradaPlano) : null;
  const propostaCanon = proposta ? propostaCanonica(proposta) : null;

  const motivos: Record<ChaveEloOperacional, { motivos: string[]; fonte?: string | null; versao?: string | null }> = {
    planejador: {
      motivos: plano ? [...(saidaPlano?.bloqueios ?? []), ...(saidaPlano?.pendencias ?? [])] : ["Planejador não persistido para o caso."],
      fonte: "case_plans",
      versao: plano ? `v${plano.versao} · ${plano.plano_hash}` : null,
    },
    proposta: {
      motivos: proposta
        ? propostaCanon?.escopo_estruturado
          ? []
          : proposta.origem === "canva" && !proposta.plan_id
            ? [] // proposta Canva vigente: escopo vem do Canva, não do Planejador — informativo, não pendência.
            : ["Proposta sem escopo estruturado derivado do planejador."]
        : ["Proposta estruturada não materializada."],
      fonte: proposta?.origem === "canva" ? "proposals (origem: Canva)" : "proposals",
      versao: proposta
        ? `v${proposta.versao} · ${proposta.status}` +
          (proposta.origem === "canva" ? (proposta.plan_id ? " · Planejador vinculado" : " · Planejador não vinculado") : "")
        : null,
    },
    catalogo: {
      motivos: sku ? (sku.fonte_referencia ? [] : ["SKU sem referência da Planilha Mestre."]) : ["SKU do catálogo não vinculado à proposta."],
      fonte: sku?.fonte_referencia ?? "product_catalog",
      versao: sku?.code ?? null,
    },
    condicao_comercial: {
      motivos: condicao
        ? condicao.status === "pendente"
          ? [condicao.observacao_interna ?? "Condição comercial com pendência declarada."]
          : []
        : ["Condição comercial não persistida a partir da proposta aprovada."],
      fonte: condicao?.origem ?? null,
      versao: condicao?.status ?? null,
    },
    os_anexo_i: {
      motivos: os ? [] : ["OS/Anexo I ainda não emitida a partir da proposta aprovada."],
      fonte: "service_orders",
      versao: os ? `v${os.versao} · ${os.conteudo_hash}` : null,
    },
    previa: {
      motivos: previa ? [] : ["Prévia contratual persistida ainda não gerada."],
      fonte: "contract_parameter_previews",
      versao: previa?.tipo ?? null,
    },
    revisao_humana: {
      motivos: ficha?.revisao_humana_em ? [] : ["Revisão humana da prévia ainda não registrada."],
      fonte: "contract_case_parameters",
      versao: ficha?.status ?? null,
    },
    // A assinatura tinha motivo fixo no codigo e ficava pendente para sempre,
    // com a cadeia inteira verde ou nao. Passa a refletir o contrato real.
    assinatura: {
      motivos: contratoDaCadeia?.status === "signed"
        ? []
        : contratoDaCadeia
          ? [`Contrato ${contratoDaCadeia.contract_number ?? ""} em "${contratoDaCadeia.status}": assinatura ainda nao registrada.`]
          : ["Nenhum instrumento contratual criado para este caso."],
      fonte: "contracts",
      versao: contratoDaCadeia?.status ?? null,
    },
  };

  const { proprietariaOperando } = await import("@/lib/autoridade.server");
  const proprietaria = opcoes.userId
    ? await proprietariaOperando(supabase as never, opcoes.userId)
    : false;
  const cadeia = consolidarCadeia(motivos, { proprietaria });
  return {
    caso: { id: caso.id, codigo: caso.codigo, titulo: caso.titulo, dados_teste: caso.dados_teste === true },
    ...cadeia,
    // Ordem P0 (21/09/2026, "Sistema Único Transversal"): etapa/rota/SKU já
    // eram calculados em entradaDoPlano só para avaliar bloqueios/pendências
    // — nunca chegavam ao chamador. Adição aditiva (3 campos a mais no
    // objeto já retornado), nenhum campo existente mudou de nome ou valor.
    planejador: saidaPlano
      ? {
          ...saidaPlano,
          etapa: entradaPlano?.etapa ?? null,
          rotaConfirmada: entradaPlano?.rotaConfirmada ?? null,
          produtoSkuCodigo: entradaPlano?.produtoSkuCodigo ?? null,
        }
      : null,
    proposta: propostaCanon,
    condicaoId: condicao?.id ?? null,
    osId: os?.id ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Pendências da cadeia consumidas pelo Painel Hoje                    */
/* ------------------------------------------------------------------ */

/**
 * Deriva, para os casos com planejador persistido, a pendência operacional
 * mais prioritária da cadeia. Não cria fila nova nem painel novo: devolve
 * itens no formato já consumido pelo Painel Hoje.
 * Dados TESTE ficam ocultos por padrão.
 */
export async function pendenciasCadeiaPainel(
  supabase: Sb,
  org: string,
  opcoes?: { incluirTeste?: boolean; limite?: number },
) {
  const planos = await supabase
    .from("case_plans")
    .select("case_id")
    .eq("organization_id", org)
    .is("archived_at", null)
    .limit(opcoes?.limite ?? 100);

  const ids = [...new Set(linhas<any>(planos, "planos de caso do painel").map((p) => p.case_id).filter(Boolean))];
  if (!ids.length) return [];

  const casos = await supabase
    .from("crm_casos")
    .select("id,codigo,titulo,dados_teste,demo,archived_at,responsavel_principal,prazo_proxima_acao")
    .in("id", ids)
    .is("archived_at", null);

  const elegiveis = linhas<any>(casos, "casos do painel da cadeia operacional").filter(
    (c) => !c.demo && (opcoes?.incluirTeste === true || c.dados_teste !== true),
  );

  const itens: {
    id: string;
    rotulo: string;
    detalhe: string;
    data: string | null;
    tipo: "caso";
    area: string | null;
    responsavel: string | null;
    etapa: string | null;
  }[] = [];

  for (const caso of elegiveis) {
    let estado: Awaited<ReturnType<typeof estadoCadeiaOperacional>>;
    try {
      estado = await estadoCadeiaOperacional(supabase, org, caso.id);
    } catch {
      continue;
    }
    const pendencia = pendenciasParaPainel({
      caseId: caso.id,
      rotulo: `${caso.codigo ?? "caso"} · ${caso.titulo ?? "sem título"}`,
      responsavel: caso.responsavel_principal ?? null,
      prazo: caso.prazo_proxima_acao ?? null,
      // O elo de assinatura permanece desabilitado e não vira pendência de painel.
      elos: estado.elos.filter((e) => e.chave !== "assinatura"),
    });
    if (!pendencia) continue;
    itens.push({
      id: pendencia.id,
      rotulo: pendencia.rotulo,
      detalhe: pendencia.acao,
      data: pendencia.data,
      tipo: "caso",
      area: "operacoes",
      responsavel: pendencia.responsavel,
      etapa: "cadeia_operacional",
    });
  }
  return itens;
}
