/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Dossiê consolidado do caso — leitor e semeador do checklist §58c (04/10/2026).
 *
 * Proprietária: "pode seguir executar pela tabela de rotas, leia e execute o
 * dossiê da Ana e junto do histórico completo da Ana... anexei também o skill
 * que foi criado para trazer e montar o dossiê de cada cliente".
 *
 * A skill `ca-client-go-live` monta o dossiê como documento no Drive. O que
 * **falta** e é desta camada: o dossiê como dado do Desk, com estado por item.
 * Medido antes de executar, e ela está certa: o caso da Ana tinha 6 pendências
 * de pesquisa (todas `resolved`) e **nenhuma** linha dos quatro BLOCOS do
 * checklist §58c — o material tinha sido enviado e nunca teve destino.
 *
 * O que este módulo faz: compõe o dossiê a partir das fontes que já existem
 * (composição do caso, linhagem, checklist, histórico, condição comercial,
 * anexos) e semeia as instâncias do checklist no caso, uma vez, de forma
 * idempotente.
 *
 * O que ele **não** faz: não consulta fonte externa, não solicita documento,
 * não aprova despesa, não conclui prova, não publica nada ao cliente e não cria
 * pasta, evento de calendário ou mensagem. As fases externas da skill (Drive,
 * Canva, Calendar, WhatsApp, planilha de go-live) ficam fora: exigem conector
 * autorizado e ação para fora, que esta sessão não executa.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { semCache } from "@/lib/no-store";
import { inserirComVerificacao } from "@/lib/persistencia.server";
import { pessoasDoCasoComFallbackNucleo } from "@/lib/pessoa-vinculo";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import {
  BLOCOS_58C,
  CHECKLIST_58C,
  DE_PARA_CAMPOS_CHECKLIST,
  MARCA_CHECKLIST_58C,
  acaoDoItem,
  estadoInicialDespesa,
  itensComAcao,
  itensSemAcaoDeTerceiro,
  tituloInstancia,
  totalDeInstancias,
  type ItemChecklist58c,
} from "@/lib/dossie-58c";
import { calcularTetoDespesas, paisIsoDoCaso } from "@/lib/teto-despesas-produto-pai";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";

/** Pessoas do caso, pelos papéis que o checklist precisa distinguir. */
type ComposicaoDoCaso = {
  adultos: string[];
  dependentes: string[];
  /** Elos da cadeia de descendência, do ascendente ao requerente. */
  elos: string[];
  /** Ascendentes prioritários (os que sustentam o vínculo e a perseguição). */
  ascendentes: string[];
};

async function composicaoDoCaso(
  supabase: any,
  organizationId: string,
  caseId: string,
): Promise<ComposicaoDoCaso> {
  /*
   * Pessoas do caso vêm da função canônica (CA19): nunca de leitura crua de
   * `case_members`, que é redundante com `nucleo_membros` e já derrubou um
   * leitor em silêncio antes.
   */
  const [membros, { data: deps }, { data: pesquisa }] = await Promise.all([
    pessoasDoCasoComFallbackNucleo(supabase, caseId),
    supabase
      .from("case_dependents")
      .select("nome_completo")
      .eq("organization_id", organizationId)
      .eq("case_id", caseId)
      .is("archived_at", null),
    supabase
      .from("research_cases")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", caseId)
      .is("archived_at", null)
      .maybeSingle(),
  ]);

  const adultos = membros
    .filter((m) => !m.dependente)
    .map((m) => String(m.nome ?? ""))
    .filter(Boolean);
  const dependentes = ((deps ?? []) as any[]).map((d) => String(d.nome_completo ?? "")).filter(Boolean);

  let elos: string[] = [];
  let ascendentes: string[] = [];
  const researchCaseId = (pesquisa as any)?.id as string | undefined;
  if (researchCaseId) {
    const { data: pessoas } = await supabase
      .from("research_people")
      .select("canonical_name,person_status,geracao")
      .eq("organization_id", organizationId)
      .eq("research_case_id", researchCaseId)
      .is("archived_at", null)
      .order("geracao", { ascending: false, nullsFirst: false });
    const linhas = ((pessoas ?? []) as any[]).filter((p) => String(p.canonical_name ?? "").trim());
    elos = linhas.map((p) => String(p.canonical_name));
    ascendentes = linhas.filter((p) => p.person_status === "ancestor").map((p) => String(p.canonical_name));
  }

  return { adultos, dependentes, elos, ascendentes };
}

/** Pessoas a quem o item se aplica. Lista vazia = instância única do caso. */
function pessoasDoItem(item: ItemChecklist58c, c: ComposicaoDoCaso): string[] {
  if (item.alcance === "cada_adulto_requerente") return c.adultos;
  if (item.alcance === "cada_dependente") return c.dependentes;
  if (item.alcance === "cada_elo_da_cadeia") return c.elos;
  return [];
}

/**
 * Descrição da instância. Para os itens de alcance `ascendentes_prioritarios`,
 * o documento da Proprietária nomeia as pessoas prioritárias dentro da própria
 * linha — então a instância é única e nomeia quem são, em vez de multiplicar
 * uma linha por ascendente (que inflaria a fila de pendências do caso).
 */
function descricaoDaInstancia(item: ItemChecklist58c, c: ComposicaoDoCaso): string {
  const partes: string[] = [`Checklist §58c · BLOCO ${item.bloco} · ${item.secao}.`];
  if (item.fonteProvavel) partes.push(`Fonte provável: ${item.fonteProvavel}.`);
  if (item.alcance === "ascendentes_prioritarios") {
    partes.push(
      c.ascendentes.length
        ? `Ascendentes prioritários: ${c.ascendentes.join(", ")}.`
        : "Ascendentes prioritários ainda não registrados na pesquisa do caso — registrar antes de solicitar.",
    );
  }
  if (item.observacao) partes.push(item.observacao);
  return partes.join(" ");
}

/**
 * Dossiê consolidado: o que a skill produziria como documento, aqui como
 * leitura do dado real. Nenhum número é inventado — item sem instância aparece
 * como "não semeado", nunca como concluído.
 */
export const dossieConsolidadoDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!data?.caseId) throw new Error("Caso é obrigatório.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const composicao = await composicaoDoCaso(supabase, organizationId, data.caseId);

    const { data: pesquisa } = await supabase
      .from("research_cases")
      .select("id,status,country_context")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .maybeSingle();
    const researchCaseId = (pesquisa as any)?.id as string | undefined;

    let pendencias: any[] = [];
    if (researchCaseId) {
      const { data: itens } = await supabase
        .from("research_pending_items")
        .select("id,title,description,category,severity,status,blocking_reason,due_at,resolution_note")
        .eq("organization_id", organizationId)
        .eq("research_case_id", researchCaseId)
        .is("archived_at", null)
        .order("title");
      pendencias = (itens ?? []) as any[];
    }

    const doChecklist = pendencias.filter((p) => String(p.title ?? "").startsWith(MARCA_CHECKLIST_58C));
    const foraDoChecklist = pendencias.filter((p) => !String(p.title ?? "").startsWith(MARCA_CHECKLIST_58C));

    /* Estado por BLOCO: contagem real, com "não semeado" explícito. */
    const blocos = BLOCOS_58C.map((b) => {
      const prefixo = `${MARCA_CHECKLIST_58C} ${b.numero}.`;
      const linhas = doChecklist.filter((p) => String(p.title).startsWith(prefixo));
      return {
        numero: b.numero,
        titulo: b.titulo,
        resumo: b.resumo,
        previstos: CHECKLIST_58C.filter((i) => i.bloco === b.numero).length,
        instancias: linhas.length,
        abertos: linhas.filter((l) => l.status === "open").length,
        emAndamento: linhas.filter((l) => l.status === "in_progress").length,
        bloqueados: linhas.filter((l) => l.status === "blocked").length,
        resolvidos: linhas.filter((l) => l.status === "resolved").length,
        naoAplicaveis: linhas.filter((l) => l.status === "not_applicable").length,
        criticosAbertos: linhas.filter((l) => l.severity === "critical" && l.status !== "resolved" && l.status !== "not_applicable").length,
      };
    });

    /*
     * Plano de ação por item: é onde moram custo estimado, moeda, aprovação de
     * despesa, pagador, prazo, canal e link de evidência. Sem isso o checklist
     * seria "só renderizado", que foi exatamente a crítica.
     */
    const { data: acoes } = await supabase
      .from("research_action_plan_items")
      .select(
        "id,titulo,action_type,status,priority,due_date,responsible_user_id,estimated_cost_amount,estimated_cost_currency,expense_approval_status,payer,suggested_channel,internal_evidence_link,next_action",
      )
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("titulo");

    const acoesDoChecklist = ((acoes ?? []) as any[]).filter((a) =>
      String(a.titulo ?? "").startsWith(MARCA_CHECKLIST_58C),
    );

    /*
     * Teto de despesas do produto-pai (Corte C, 31/10/2026): as planilhas de
     * produtos-pai já estão em `price_catalog_rescued` como teto por país.
     * Só leitura; o teto nunca é repartido entre os itens.
     */
    const { data: casoPais } = await supabase
      .from("crm_casos")
      .select("pais,pais_linha_prioritaria")
      .eq("organization_id", organizationId)
      .eq("id", data.caseId)
      .maybeSingle();
    const paisDoCaso = paisIsoDoCaso({
      linhaPrioritaria: (casoPais as any)?.pais_linha_prioritaria ?? null,
      pais: (casoPais as any)?.pais ?? null,
      contextoPesquisa: (pesquisa as any)?.country_context ?? null,
    });
    let linhasPreco: any[] = [];
    if (paisDoCaso) {
      const { data: precos } = await supabase
        .from("price_catalog_rescued")
        .select("country_code,price_component,amount,currency,price_status,archived_at")
        .eq("organization_id", organizationId)
        .eq("country_code", paisDoCaso.iso)
        .in("price_component", ["despesas", "taxas"])
        .eq("price_status", "VIGENTE")
        .is("archived_at", null);
      linhasPreco = (precos ?? []) as any[];
    }
    const tetoDespesas = calcularTetoDespesas({
      pais: paisDoCaso,
      linhasPreco,
      acoes: acoesDoChecklist.map((a) => ({
        titulo: String(a.titulo ?? ""),
        custo:
          a.estimated_cost_amount === null || a.estimated_cost_amount === undefined
            ? null
            : Number(a.estimated_cost_amount),
        moeda: (a.estimated_cost_currency as string | null) ?? null,
        aprovacaoDespesa: String(a.expense_approval_status ?? ""),
      })),
    });

    /* Histórico: a timeline do caso é o histórico consolidado, não um doc. */
    const { data: eventos } = await supabase
      .from("case_timeline_events")
      .select("id,event_type,title,status,occurred_at,summary_internal,bloqueio")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("occurred_at", { ascending: true, nullsFirst: false });

    /* Linhagem registrada: o dossiê sem cadeia é dossiê sem objeto. */
    const { data: linhas } = await supabase
      .from("lineage_paths")
      .select("id,nome_da_linha,tipo_da_linha,status,geracao_alvo,aderencia_percentual,proximo_marco,risco_principal")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null);

    const previsto = totalDeInstancias({
      adultos: composicao.adultos.length,
      dependentes: composicao.dependentes.length,
      elos: composicao.elos.length,
    });

    return {
      composicao,
      pesquisa: pesquisa ?? null,
      blocos,
      previsto,
      semeados: doChecklist.length,
      /** Pendências do caso que não vêm do template — não são tocadas pelo seed. */
      outrasPendencias: foraDoChecklist.map((p) => ({
        id: String(p.id),
        titulo: String(p.title ?? ""),
        categoria: String(p.category ?? ""),
        severidade: String(p.severity ?? ""),
        status: String(p.status ?? ""),
      })),
      criticosAbertos: doChecklist
        .filter((p) => p.severity === "critical" && p.status !== "resolved" && p.status !== "not_applicable")
        .map((p) => ({ id: String(p.id), titulo: String(p.title ?? ""), status: String(p.status ?? "") })),
      historico: ((eventos ?? []) as any[]).map((e) => ({
        id: String(e.id),
        tipo: String(e.event_type ?? ""),
        titulo: String(e.title ?? ""),
        status: String(e.status ?? ""),
        quando: (e.occurred_at as string | null) ?? null,
        bloqueio: Boolean(e.bloqueio),
      })),
      linhagem: ((linhas ?? []) as any[]).map((l) => ({
        id: String(l.id),
        nome: String(l.nome_da_linha ?? ""),
        tipo: String(l.tipo_da_linha ?? ""),
        status: String(l.status ?? ""),
        geracaoAlvo: l.geracao_alvo === null || l.geracao_alvo === undefined ? null : Number(l.geracao_alvo),
        aderencia: l.aderencia_percentual === null || l.aderencia_percentual === undefined ? null : Number(l.aderencia_percentual),
        proximoMarco: (l.proximo_marco as string | null) ?? null,
        risco: (l.risco_principal as string | null) ?? null,
      })),
      /** Ações de terceiro do checklist, com os campos que o item exige. */
      acoes: acoesDoChecklist.map((a) => ({
        id: String(a.id),
        titulo: String(a.titulo ?? ""),
        tipo: String(a.action_type ?? ""),
        status: String(a.status ?? ""),
        prioridade: String(a.priority ?? ""),
        prazo: (a.due_date as string | null) ?? null,
        temResponsavel: Boolean(a.responsible_user_id),
        custo:
          a.estimated_cost_amount === null || a.estimated_cost_amount === undefined
            ? null
            : Number(a.estimated_cost_amount),
        moeda: (a.estimated_cost_currency as string | null) ?? null,
        aprovacaoDespesa: String(a.expense_approval_status ?? ""),
        pagador: String(a.payer ?? ""),
        canal: String(a.suggested_channel ?? ""),
        arquivo: (a.internal_evidence_link as string | null) ?? null,
      })),
      /** Teto de despesas do produto-pai para o país do caso (leitura). */
      tetoDespesas,
      /** Quantos itens do template geram ação de terceiro e quantos são internos. */
      acoesPrevistas: itensComAcao().length,
      itensInternos: itensSemAcaoDeTerceiro().length,
      /** Onde cada um dos oito campos do checklist mora. Não é texto solto. */
      deParaCampos: DE_PARA_CAMPOS_CHECKLIST.map((d) => ({ ...d })),
    };
  });

/**
 * Semeia as instâncias do checklist §58c no caso. Idempotente por título: o que
 * já existe não é recriado, e nada existente é alterado — nem status, nem
 * responsável, nem resolução.
 */
export const semearChecklist58cNoCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; motivo: string }) => {
    if (!data?.caseId) throw new Error("Caso é obrigatório.");
    if (!String(data?.motivo ?? "").trim()) throw new Error("Informe o motivo da semeadura do checklist.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const organizationId = await organizacaoDo(supabase, userId);

    const { data: pesquisa } = await supabase
      .from("research_cases")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .maybeSingle();
    const researchCaseId = (pesquisa as any)?.id as string | undefined;
    if (!researchCaseId) {
      throw new Error(
        "Este caso ainda não tem pesquisa aberta. O checklist §58c pertence à pesquisa do caso — abra a pesquisa antes de semear.",
      );
    }

    const { data: existentes } = await supabase
      .from("research_pending_items")
      .select("title")
      .is("archived_at", null)
      .eq("organization_id", organizationId)
      .eq("research_case_id", researchCaseId);
    const jaGravados = new Set(((existentes ?? []) as any[]).map((p) => String(p.title ?? "")));

    const composicao = await composicaoDoCaso(supabase, organizationId, data.caseId);

    const criados: string[] = [];
    const acoesCriadas: string[] = [];
    const lacunas: string[] = [];

    /* Plano de ação já existente do caso, para não duplicar linha por título. */
    const { data: acoesExistentes } = await supabase
      .from("research_action_plan_items")
      .select("titulo")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null);
    const acoesGravadas = new Set(((acoesExistentes ?? []) as any[]).map((a) => String(a.titulo ?? "")));

    /*
     * Instituições de referência. O guard do plano (`fn_g07_plan_guard`) recusa
     * ação de canal externo sem instituição vinculada — e está certo: "vincule a
     * instituição de referência em vez de repetir contatos na tarefa". Se a
     * instituição do item não estiver cadastrada, a ação **não** é criada e a
     * lacuna é nomeada; nunca se inventa instituição nem se burla o canal.
     */
    const { data: instituicoes } = await supabase
      .from("institutions")
      .select("id,name")
      .eq("organization_id", organizationId)
      .is("archived_at", null);
    const idDaInstituicao = new Map(
      ((instituicoes ?? []) as any[]).map((i) => [String(i.name ?? ""), String(i.id)]),
    );
    for (const item of CHECKLIST_58C) {
      const pessoas = pessoasDoItem(item, composicao);
      const alvos = pessoas.length ? pessoas : [null];
      if (!pessoas.length && item.alcance !== "caso" && item.alcance !== "ascendentes_prioritarios") {
        lacunas.push(
          `${item.id}: nenhuma pessoa registrada para o alcance "${item.alcance}" — item semeado uma vez no caso, a desdobrar quando a composição estiver registrada.`,
        );
      }
      for (const pessoa of alvos) {
        const titulo = tituloInstancia(item, pessoa);
        if (jaGravados.has(titulo)) continue;
        await inserirComVerificacao({
          supabase,
          tabela: "research_pending_items",
          organizationId,
          userId,
          payload: {
            research_case_id: researchCaseId,
            title: titulo,
            description: descricaoDaInstancia(item, composicao),
            category: item.categoria,
            severity: item.severidade,
            status: "open",
          },
        });
        jaGravados.add(titulo);
        criados.push(titulo);

        /*
         * Complemento de 04/10/2026: "adicione todos os campos necessários, não
         * somente renderizados". O item que depende de terceiro ganha a linha de
         * plano de ação, que é onde moram custo estimado, moeda, aprovação de
         * despesa, pagador, prazo, canal e link de evidência. Campo sem fonte
         * fica **vazio**: custo não é estimado por conta própria, despesa nunca
         * nasce aprovada e pagador nasce não definido.
         */
        const acao = acaoDoItem(item);
        if (acao && !acoesGravadas.has(titulo)) {
          const instituicaoId = acao.instituicao ? (idDaInstituicao.get(acao.instituicao) ?? null) : null;
          if (acao.canal !== "desk_only" && !instituicaoId) {
            lacunas.push(
              `${item.id}: a ação depende da instituição "${acao.instituicao ?? "não definida"}", que não está cadastrada. ` +
                "Cadastre a instituição de referência antes — contato não se repete dentro da tarefa.",
            );
            continue;
          }
          await inserirComVerificacao({
            supabase,
            tabela: "research_action_plan_items",
            organizationId,
            userId,
            payload: {
              case_id: data.caseId,
              action_type: acao.tipo,
              titulo,
              priority: acao.prioridade,
              reason: descricaoDaInstancia(item, composicao),
              status: "planejada",
              suggested_channel: acao.canal,
              institution_id: instituicaoId,
              requires_human_approval: true,
              estimated_cost_amount: null,
              estimated_cost_currency: null,
              expense_approval_status: estadoInicialDespesa(acao),
              payer: "nao_definido",
              due_date: null,
              notes_internal:
                `Item ${item.id} do checklist §58c. Custo, prazo e pagador em branco: não são estimados por inferência.`,
              data_origin: "real",
            },
          });
          acoesGravadas.add(titulo);
          acoesCriadas.push(titulo);
        }
      }
    }

    if (criados.length || acoesCriadas.length) {
      await registrarAuditoria(supabase, {
        organization_id: organizationId,
        entidade: "research_pending_items",
        entidade_id: null,
        acao: "checklist_58c_semeado",
        user_id: userId,
        valores_posteriores: { criados: criados.length, acoes: acoesCriadas.length, lacunas: lacunas.length },
        metadados: { case_id: data.caseId, research_case_id: researchCaseId, motivo: data.motivo },
      });
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.caseId,
        eventType: "caso",
        title: `Checklist §58c semeado: ${criados.length} itens e ${acoesCriadas.length} ações de plano`,
        summaryInternal: data.motivo,
        sourceEntityType: "research_pending_items",
        sourceEntityId: researchCaseId,
        userId,
      });
    }

    return {
      criados: criados.length,
      acoesCriadas: acoesCriadas.length,
      jaExistiam: jaGravados.size - criados.length,
      lacunas,
    };
  });
