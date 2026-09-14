/**
 * Superfície de go-live — leitura enxuta do caso canônico.
 *
 * 14/09/2026 — decisão da Proprietária: em vez de remendar o Desk histórico,
 * existe um shell novo que carrega SOMENTE o caso canônico
 * `CA-CID-AT-FAM-2026-001` (Projeto familiar — Ana Luiza).
 *
 * Regras desta leitura:
 * - nada é apagado: registros de demonstração, teste, QA, homologação e
 *   fixtures simplesmente não são carregados aqui;
 * - nenhuma tabela nova, nenhuma migration, nenhum cliente administrativo;
 * - a RLS da organização continua sendo quem decide o que o usuário enxerga;
 * - ausência de dado vira estado vazio declarado, nunca número estimado.
 */

import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { ehRegistroDeTeste } from "@/lib/registros-teste";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

/** Código do único caso carregado pela superfície de go-live. */
export const CODIGO_CASO_GO_LIVE = "CA-CID-AT-FAM-2026-001";

async function organizacaoDo(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}

/** Leitura tolerante: tabela ausente, coluna diferente ou sem permissão vira lista vazia. */
async function lista(
  supabase: any,
  tabela: string,
  coluna: string,
  valor: string,
  campos = "*",
): Promise<Linha[]> {
  try {
    const { data, error } = await supabase
      .from(tabela)
      .select(campos)
      .eq(coluna, valor)
      .is("archived_at", null)
      .limit(50);
    if (error) return [];
    return (data ?? []) as Linha[];
  } catch {
    return [];
  }
}

export type DadosGoLive = Awaited<ReturnType<typeof carregarGoLive>>;

export const carregarGoLive = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data: caso, error } = await supabase
      .from("crm_casos")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("codigo", CODIGO_CASO_GO_LIVE)
      .is("archived_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!caso) {
      return {
        encontrado: false as const,
        codigo: CODIGO_CASO_GO_LIVE,
      };
    }

    const casoId = String(caso.id);
    const [
      membros,
      documentos,
      microentregas,
      projecoes,
      contratos,
      faturas,
      planos,
      equipe,
      leads,
      propostas,
      ordens,
      pesquisas,
      hipoteses,
      achadosBrutos,
      tarefasCaso,
      eventosCaso,
    ] = await Promise.all([
      lista(supabase, "case_members", "case_id", casoId),
      lista(supabase, "documents", "case_id", casoId),
      lista(supabase, "ops_microentregas", "caso_id", casoId),
      lista(supabase, "app_projections", "case_id", casoId),
      lista(supabase, "contracts", "case_id", casoId),
      lista(supabase, "invoices", "case_id", casoId),
      lista(supabase, "case_plans", "case_id", casoId),
      lista(supabase, "organization_members", "organization_id", organizationId),
      lista(supabase, "leads", "case_id", casoId),
      lista(supabase, "proposals", "case_id", casoId),
      lista(supabase, "service_orders", "case_id", casoId),
      lista(supabase, "research_cases", "case_id", casoId),
      lista(supabase, "research_hypotheses", "case_id", casoId),
      lista(supabase, "genealogical_findings", "case_id", casoId),
      lista(supabase, "tarefas", "caso_id", casoId),
      lista(supabase, "case_timeline_events", "case_id", casoId),
    ]);

    /* Carteira da organização — só identificadores e estado, sem filtro por texto.
       Serve aos KPIs de Hoje (casos ativos, sem próxima ação) e à rosca de prioridade. */
    const carteira = (
      await supabase
        .from("crm_casos")
        .select("id,codigo,titulo,status,prioridade,proxima_acao,prazo_proxima_acao,demo")
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .limit(500)
    ).data as Linha[] | null;

    /* Nomes de responsáveis: só para rotular carga; ausência vira "Sem responsável". */
    const idsResponsaveis = Array.from(
      new Set(
        [...(tarefasCaso ?? []), ...(microentregas ?? [])]
          .map((t) => t["responsavel_id"])
          .filter((v): v is string => typeof v === "string"),
      ),
    );
    const perfis = idsResponsaveis.length
      ? (((await supabase.from("profiles").select("id,nome").in("id", idsResponsaveis)).data ?? []) as Linha[])
      : [];
    const nomePerfil = new Map(perfis.map((p) => [String(p["id"]), String(p["nome"] ?? "")]));

    const pesquisaId = pesquisas[0] ? String(pesquisas[0]["id"]) : null;
    const [fontes, evidenciasPesquisa, escopoItens] = await Promise.all([
      pesquisaId ? lista(supabase, "research_sources", "research_case_id", pesquisaId) : Promise.resolve([]),
      pesquisaId ? lista(supabase, "research_evidence_items", "research_case_id", pesquisaId) : Promise.resolve([]),
      contratos[0]
        ? lista(supabase, "contract_scope_items", "contract_id", String(contratos[0]["id"]))
        : propostas[0]
          ? lista(supabase, "contract_scope_items", "proposal_id", String(propostas[0]["id"]))
          : Promise.resolve([]),
    ]);


    const limpar = (linhas: Linha[]) =>
      linhas.filter(
        (l) =>
          !ehRegistroDeTeste({
            codigo: l["codigo"] ?? l["contract_number"] ?? l["numero"],
            titulo: l["titulo"] ?? l["title"] ?? l["title_client"] ?? l["nome"],
            demo: l["demo"],
            is_demo: l["dados_teste"],
          }),
      );

    const plano = planos[0] ?? null;

    /* ------------------------------------------------------------------
     * Consolidação de referência da pessoa canônica (14/09/2026).
     * Só leitura: nenhuma tabela nova, nenhuma mesclagem automática,
     * nenhum registro apagado. Duplicidades ficam marcadas como legado
     * fora do shell, e conflito vira "revisar identidade" para a
     * Proprietária decidir — nunca escolha por inferência.
     * ---------------------------------------------------------------- */
    const normaliza = (v: unknown) =>
      String(v ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const clienteCanonico = caso.cliente_id
      ? (await supabase.from("clientes").select("id,nome,email,telefone").eq("id", caso.cliente_id).maybeSingle()).data
      : null;

    const membrosVivos = limpar(membros);
    const contratante =
      membrosVivos.find((m) => m["contratante"] === true || normaliza(m["papel_no_caso"]) === "contratante") ?? null;

    const nomeCanonico =
      (clienteCanonico?.nome as string) ?? (contratante?.["nome"] as string) ?? null;

    // Candidatos com o mesmo nome em outros cadastros (não são carregados no shell).
    const [outrosClientes, outrosMembros, outrosContatos, aliases] = await Promise.all([
      nomeCanonico
        ? supabase.from("clientes").select("id,nome,email").ilike("nome", `%${nomeCanonico.split(" ")[0]}%`).is("archived_at", null)
        : Promise.resolve({ data: [] }),
      nomeCanonico
        ? supabase.from("case_members").select("id,case_id,nome").ilike("nome", `%${nomeCanonico.split(" ")[0]}%`).is("archived_at", null)
        : Promise.resolve({ data: [] }),
      nomeCanonico
        ? supabase.from("contacts").select("id,nome").ilike("nome", `%${nomeCanonico.split(" ")[0]}%`).is("archived_at", null)
        : Promise.resolve({ data: [] }),
      supabase.from("case_aliases").select("id,alias,alias_type").eq("case_id", casoId),
    ]);

    const alvo = normaliza(nomeCanonico);
    const legado: { id: string; origem: string; rotulo: string; motivo: string }[] = [];

    for (const c of ((outrosClientes as any)?.data ?? []) as Linha[]) {
      if (String(c["id"]) === String(clienteCanonico?.id ?? "")) continue;
      if (normaliza(c["nome"]) !== alvo) continue;
      legado.push({ id: String(c["id"]), origem: "Cadastro de cliente", rotulo: String(c["nome"]), motivo: "Duplicidade mantida fora do piloto" });
    }
    for (const m of ((outrosMembros as any)?.data ?? []) as Linha[]) {
      if (String(m["case_id"]) === casoId) continue;
      if (normaliza(m["nome"]) !== alvo) continue;
      legado.push({ id: String(m["id"]), origem: "Pessoa em outro caso", rotulo: String(m["nome"]), motivo: "Caso fora do piloto" });
    }
    for (const c of ((outrosContatos as any)?.data ?? []) as Linha[]) {
      if (normaliza(c["nome"]) !== alvo) continue;
      legado.push({ id: String(c["id"]), origem: "Contato", rotulo: String(c["nome"]), motivo: "Registro histórico" });
    }
    for (const a of (((aliases as any)?.data ?? []) as Linha[])) {
      legado.push({
        id: String(a["id"]),
        origem: "Referência antiga do caso",
        rotulo: String(a["alias"]),
        motivo: "Resolve para o código canônico",
      });
    }

    // Pessoas do caso com nome equivalente ao canônico, além da própria.
    const duplicadasNoCaso = membrosVivos.filter(
      (m) => normaliza(m["nome"]) === alvo && String(m["id"]) !== String(contratante?.["id"] ?? ""),
    );

    const motivosConflito: string[] = [];
    if (!clienteCanonico && !contratante) motivosConflito.push("Nenhuma pessoa principal identificada no caso.");
    if (clienteCanonico && contratante && normaliza(clienteCanonico.nome) !== normaliza(contratante["nome"]))
      motivosConflito.push("Cliente do cadastro e contratante do caso têm nomes diferentes.");
    if (duplicadasNoCaso.length > 0) motivosConflito.push("Há mais de uma pessoa com o mesmo nome dentro do caso.");

    const nucleos = await lista(supabase, "nucleos_familiares", "case_id", casoId);
    const nucleo = nucleos[0] ?? null;
    const nucleoMembros = nucleo
      ? await lista(supabase, "nucleo_membros", "nucleo_id", String(nucleo["id"]), "id,nome,papel,vinculo")
      : [];

    const [acessosPortal, emailsAutorizados] = await Promise.all([
      clienteCanonico?.id
        ? lista(supabase, "client_portal_access", "client_id", String(clienteCanonico.id))
        : Promise.resolve([]),
      lista(supabase, "authorized_portal_emails", "case_id", casoId),
    ]);



    return {
      encontrado: true as const,
      codigo: CODIGO_CASO_GO_LIVE,
      identidade: {
        pessoaPrincipal: nomeCanonico,
        pessoaPrincipalId: String(clienteCanonico?.id ?? contratante?.["id"] ?? "") || null,
        email: (clienteCanonico?.email as string) ?? (contratante?.["email"] as string) ?? null,
        telefone: (clienteCanonico?.telefone as string) ?? (contratante?.["telefone"] as string) ?? null,
        casoCanonico: CODIGO_CASO_GO_LIVE,
        casoId,
        nucleo: nucleo ? String(nucleo["nome"] ?? "Núcleo familiar") : null,
        nucleoMembros: nucleoMembros.map((m) => ({
          id: String(m["id"]),
          nome: (m["nome"] as string) ?? "Pessoa sem nome registrado",
          papel: (m["papel"] as string) ?? (m["vinculo"] as string) ?? null,
        })),
        responsavel: (caso.responsavel_principal as string) ?? null,
        status: (caso.status as string) ?? null,
        revisarIdentidade: motivosConflito.length > 0,
        motivosConflito,
        legado,
      },
      caso: {
        id: casoId,
        codigo: String(caso.codigo ?? CODIGO_CASO_GO_LIVE),
        titulo: (caso.titulo as string) ?? "Projeto familiar — Ana Luiza",
        cliente: (caso.cliente_nome as string) ?? null,
        status: (caso.status as string) ?? null,
        fase: (caso.fase as string) ?? null,
        pais: (caso.pais as string) ?? null,
        proximaAcao: (caso.proxima_acao as string) ?? null,
        responsavel: (caso.proxima_acao_responsavel as string) ?? (caso.responsavel_principal as string) ?? null,
        prazo: (caso.prazo_proxima_acao as string) ?? null,
        contratoAssinado: caso.contrato_assinado === true,
        pagamentoConfirmado: caso.pagamento_confirmado === true,
        documentosMinimosOk: caso.documentos_minimos_ok === true,
      },
      plano: plano
        ? {
            fase: (plano["fase_jornada"] as string) ?? null,
            marco: (plano["marco_atual"] as string) ?? null,
            proximaAcao: (plano["proxima_acao"] as string) ?? null,
            prazo: (plano["prazo_proxima_acao"] as string) ?? null,
            proximaMicroentrega: (plano["proxima_microentrega"] as string) ?? null,
          }
        : null,
      pessoas: limpar(membros).map((m) => ({
        id: String(m["id"]),
        nome: (m["nome"] as string) ?? "Pessoa sem nome registrado",
        papel: (m["papel_no_caso"] as string) ?? (m["parentesco"] as string) ?? null,
      })),
      documentos: limpar(documentos).map((d) => ({
        id: String(d["id"]),
        titulo: (d["titulo"] as string) ?? (d["nome_arquivo"] as string) ?? "Documento sem título",
        status: (d["status"] as string) ?? null,
        liberadoCliente: d["liberado_cliente"] === true,
      })),
      microentregas: limpar(microentregas).map((m) => ({
        id: String(m["id"]),
        titulo: (m["titulo"] as string) ?? "Microentrega sem título",
        status: (m["status"] as string) ?? null,
        fase: (m["fase"] as string) ?? null,
        prazo: (m["prazo"] as string) ?? null,
      })),
      publicados: limpar(projecoes)
        .filter((p) => ["published", "publicada", "aprovada", "approved"].includes(String(p["approval_status"])))
        .map((p) => ({
          id: String(p["id"]),
          tipo: (p["projection_type"] as string) ?? "conteúdo",
          resumo: (p["content_sanitized"] as string) ?? null,
          em: (p["approved_at"] as string) ?? (p["effective_from"] as string) ?? null,
        })),
      contratos: limpar(contratos).map((c) => ({
        id: String(c["id"]),
        numero: (c["contract_number"] as string) ?? null,
        titulo: (c["title"] as string) ?? "Instrumento sem título",
        status: (c["status"] as string) ?? null,
        assinadoEm: (c["signed_at"] as string) ?? null,
      })),
      faturas: limpar(faturas).map((f) => ({
        id: String(f["id"]),
        numero: (f["numero"] as string) ?? null,
        valor: (f["valor"] as number) ?? null,
        status: (f["status"] as string) ?? null,
        vencimento: (f["vencimento"] as string) ?? null,
      })),
      lead: (() => {
        const l = limpar(leads)[0];
        if (!l) return null;
        return {
          id: String(l["id"]),
          nome: (l["nome"] as string) ?? null,
          estagio: (l["estagio"] as string) ?? null,
          origem: (l["origem"] as string) ?? (l["data_origin"] as string) ?? null,
          callAgendada: (l["call_agendada_em"] as string) ?? null,
          callRealizada: (l["call_realizada_em"] as string) ?? null,
          discoveryResultado: (l["discovery_resultado"] as string) ?? null,
          objetivo: (l["objetivo"] as string) ?? null,
        };
      })(),
      propostas: limpar(propostas).map((p) => ({
        id: String(p["id"]),
        versao: (p["versao"] as number) ?? null,
        status: (p["status"] as string) ?? null,
        valor: (p["valor"] as number) ?? null,
        moeda: (p["moeda"] as string) ?? "BRL",
        escopo: (p["escopo"] as string) ?? null,
        formaPagamento: (p["forma_pagamento"] as string) ?? null,
        enviadaEm: (p["enviada_em"] as string) ?? null,
        aprovadaEm: (p["aprovada_em"] as string) ?? null,
      })),
      escopo: escopoItens.map((i) => ({
        id: String(i["id"]),
        titulo: (i["title"] as string) ?? "Item de escopo",
        categoria: (i["category"] as string) ?? null,
        status: (i["status"] as string) ?? null,
        exigeRevisaoHumana: i["requires_human_validation"] === true,
      })),
      ordensServico: limpar(ordens).map((o) => ({
        id: String(o["id"]),
        numero: (o["service_order_number"] as string) ?? null,
        status: (o["status"] as string) ?? null,
        resumo: (o["scope_summary"] as string) ?? (o["deliverable_summary"] as string) ?? null,
        inicio: (o["start_date"] as string) ?? null,
      })),
      pesquisa: (() => {
        const r = pesquisas[0];
        if (!r) return null;
        return {
          id: String(r["id"]),
          objetivo: (r["research_objective"] as string) ?? null,
          proximaAcao: (r["next_research_action"] as string) ?? null,
          prazo: (r["next_research_action_due_at"] as string) ?? null,
          status: (r["status"] as string) ?? null,
          confianca: (r["confidence_level"] as string) ?? null,
        };
      })(),
      hipoteses: limpar(hipoteses).map((h) => ({
        id: String(h["id"]),
        titulo: (h["titulo"] as string) ?? "Pergunta de pesquisa",
        status: (h["status"] as string) ?? null,
        confianca: (h["grau_confianca"] as string) ?? null,
      })),
      fontes: fontes.map((f) => ({
        id: String(f["id"]),
        titulo: (f["title"] as string) ?? "Fonte sem título",
        tipo: (f["source_type"] as string) ?? null,
        status: (f["source_status"] as string) ?? null,
        instituicao: (f["repository_or_institution"] as string) ?? null,
      })),
      evidencias: evidenciasPesquisa.map((e) => ({
        id: String(e["id"]),
        titulo: (e["title"] as string) ?? "Evidência sem título",
        tipo: (e["evidence_type"] as string) ?? null,
        status: (e["evidence_status"] as string) ?? null,
        confianca: (e["confidence_level"] as string) ?? null,
      })),
      achados: limpar(achadosBrutos).map((a) => ({
        id: String(a["id"]),
        titulo: (a["title"] as string) ?? "Achado sem título",
        confianca: (a["confidence"] as string) ?? null,
        validacao: (a["validation_status"] as string) ?? null,
        publicavel: a["eligible_for_client_deliverable"] === true,
      })),
      portal: {
        acessos: limpar(acessosPortal).map((a) => ({
          id: String(a["id"]),
          email: (a["email"] as string) ?? null,
          nivel: String(a["access_level"] ?? ""),
          situacao: String(a["access_status"] ?? ""),
          ultimoAcesso: (a["last_authenticated_at"] as string) ?? null,
        })),
        emailsAutorizados: limpar(emailsAutorizados).map((e) => ({
          id: String(e["id"]),
          email: (e["email"] as string) ?? null,
          status: (e["status"] as string) ?? null,
        })),
      },
      equipeTotal: equipe.length,
    };

  });
