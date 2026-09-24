import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { pessoasDoCasoComFallbackNucleo } from "@/lib/pessoa-vinculo";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A pessoa, e tudo que o sistema sabe dela.
 *
 * Existe porque o Desk tinha casos e não tinha gente: `clientes` é lista, e não
 * havia página de ninguém. Quem quisesse ver a história de uma pessoa tinha de
 * abrir os casos dela um a um e juntar de cabeça.
 *
 * A leitura não funde registro nem preenche o `case_id` que falta nos leads —
 * vínculo de identidade é decisão de gente, e este módulo só mostra a
 * evidência para que a decisão seja tomada com o que existe à vista.
 *
 * 05/09/2026 — achado real reportado pela Proprietária: esta página exibia
 * os dados civis da Pessoa Canônica (CPF, RG, endereço etc.) mas não tinha
 * nenhuma forma de editá-los — em toda a aplicação não existia uma única
 * tela de edição de `clientes` além do cadastro inicial. "Não consigo editar
 * nada na Ana" era literal. `atualizarPessoa` fecha essa lacuna.
 *
 * Usa o cliente com RLS do próprio usuário, nunca o administrativo: ler a
 * carteira da própria organização não precisa de chave secreta.
 */
type Linha = Record<string, any>;

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

export const carregarPessoa = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { clienteId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data: cliente } = await supabase
      .from("clientes")
      .select(
        "id, nome, nome_social, email, telefone, documento, origem, pais_interesse, status_comercial, created_at," +
          " sexo, nacionalidade, profissao, cpf, rg_numero, rg_orgao_uf," +
          " endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_uf, endereco_cep, endereco_pais," +
          " estado_civil, nome_conjuge, procurador_cliente_id, procurador_escopo," +
          " data_nascimento, nome_pai, nome_mae, cidade_nascimento",
      )
      .eq("id", data.clienteId)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .maybeSingle();

    if (!cliente) return { encontrada: false as const };

    const { data: casos } = await supabase
      .from("crm_casos")
      .select(
        "id, codigo, titulo, fase, pais, via, data_entrada, ativo, prioridade, proxima_acao, prazo_proxima_acao, proxima_acao_responsavel, responsavel_principal, situacao_operacional, eixo_formalizacao",
      )
      .eq("cliente_id", cliente.id)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .order("data_entrada", { ascending: true });

    const listaCasosBruta = (casos ?? []) as Linha[];
    const ids = listaCasosBruta.map((c) => c.id);

    /*
      11/09/2026 — Pessoa 360 sem próxima ação canônica: a ficha do caso já
      usa proxima_acao_prioritaria; o perfil só mostrava fase/código. Mesma
      RPC em lote, sem tabela nova.
    */
    const porCasoCanonica = new Map<
      string,
      { nivel: number; motivo: string; prazo: string | null }
    >();
    if (ids.length > 0) {
      const { data: canonicas } = await supabase.rpc("proxima_acao_prioritaria_lote", {
        _cases: ids,
      });
      for (const p of (canonicas ?? []) as {
        case_id: string;
        nivel: number;
        motivo: string;
        prazo: string | null;
      }[]) {
        porCasoCanonica.set(p.case_id, {
          nivel: p.nivel,
          motivo: p.motivo,
          prazo: p.prazo,
        });
      }
    }
    const listaCasos: Linha[] = listaCasosBruta.map((c) => ({
      ...c,
      proximaAcaoCanonica: porCasoCanonica.get(String(c.id)) ?? null,
    }));

    const { data: eventos } = ids.length
      ? await supabase
          .from("case_timeline_events")
          .select(
            "case_id, occurred_at, created_at, title, phase, status, summary_internal, responsavel_nome, bloqueio, alerta",
          )
          .in("case_id", ids)
          .is("archived_at", null)
          .order("occurred_at", { ascending: true })
          .limit(500)
      : { data: [] };

    /*
      Leads candidatos. O elo `leads.case_id` está nulo em todo o banco, então
      não há como percorrer o caminho oficial: sobra procurar evidência.
      A carteira de leads é pequena; quando deixar de ser, isto vira consulta
      filtrada por e-mail e telefone normalizados no próprio banco.
    */
    const { data: leads } = await supabase
      .from("leads")
      .select(
        "id, nome, email, telefone, estagio, origem, created_at, case_id, call_realizada_em, discovery_resultado",
      )
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .limit(500);

    /*
      Perfil 360 (execução sobre tabelas existentes, sem tabela nova):
      núcleo/papéis, propostas, contratos/partes e documentos liberados são
      todos vínculos que já existem no banco — clientes.id é a Pessoa
      Canônica; nucleo_membros.cliente_id, contract_parties.client_id,
      proposals.client_id e documents.client_id já apontam para ela. Esta
      função só passa a ler os quatro juntos; nenhum schema muda.
    */
    const [
      nucleoMembros,
      propostas,
      contratos,
      contractParties,
      documentos,
      projecoes,
      perfisGenealogicos,
      pesquisaCasos,
    ] = await Promise.all([
      supabase
        .from("nucleo_membros")
        .select("id, nucleo_id, nome, papel, vinculo, processo, ordem")
        .eq("cliente_id", cliente.id)
        .is("archived_at", null),
      supabase
        .from("proposals")
        .select("id, case_id, status, valor, created_at")
        .eq("client_id", cliente.id)
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("contracts")
        .select("id, case_id, status, signed_at, created_at")
        .eq("client_id", cliente.id)
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("contract_parties")
        .select("id, contract_id, person_name, document_type")
        .eq("client_id", cliente.id)
        .is("archived_at", null),
      ids.length
        ? supabase
            .from("documents")
            .select("id, case_id, titulo, status, liberado_cliente, created_at")
            .in("case_id", ids)
            .eq("client_id", cliente.id)
            .is("archived_at", null)
            .order("created_at", { ascending: false })
            .limit(200)
        : { data: [] },
      ids.length
        ? supabase
            .from("app_projections")
            .select("id, case_id, projection_type, approval_status, effective_from, created_at")
            .in("case_id", ids)
            .is("archived_at", null)
            .order("created_at", { ascending: false })
            .limit(200)
        : { data: [] },
      /*
          Camada 3 (pesquisa genealógica) é isolamento deliberado — nunca vai
          ao App Cliente. Aqui é só leitura Desk.
          05/09/2026 — achado real: esta consulta olhava só para
          genealogical_person_profiles por correspondência de NOME, uma
          tabela quase vazia (2 linhas de teste em toda a organização). A
          ficha genealógica de verdade — a que pessoas-linhagens.$caseId usa,
          com Ana, Adair, Alice e Felipe já cadastrados — vive em
          research_people, ligada por research_cases.case_id, não por nome.
          "Correspondência de nome" nunca tinha achado nada para a Ana porque
          o registro real dela está em outra tabela e vinculado pelo caso,
          não pelo texto do nome. Trocado para o vínculo real.
        */
      ids.length
        ? supabase
            .from("genealogical_person_profiles")
            .select("id, nome_completo, status_verificacao, case_id")
            .eq("organization_id", organizationId)
            .in("case_id", ids)
            .is("archived_at", null)
        : { data: [] },
      ids.length
        ? supabase
            .from("research_cases")
            .select("id, case_id, status")
            .eq("organization_id", organizationId)
            .in("case_id", ids)
            .is("archived_at", null)
        : { data: [] },
    ]);

    /*
      22/09/2026 — achado real: case_members.pai_id/mae_id (migration
      20260816201830) já grava parentesco administrativo do caso — mesma
      coluna que /golive/pessoas já lê. A zona "Relações" de Pessoa 360
      nunca tinha buscado isso. Usa a função canônica (CA19 trava leitor cru
      de case_members fora dela) por caso, para resolver os nomes nas duas
      pontas de cada vínculo mesmo quando o caso já migrou para Núcleos.
    */
    const membrosPorCaso = await Promise.all(
      ids.map(async (caseId) => {
        const membros = await pessoasDoCasoComFallbackNucleo(supabase, String(caseId));
        return membros.map((m) => ({ ...m, case_id: String(caseId) }));
      }),
    );
    const caseMembers = membrosPorCaso.flat();

    const idsPesquisaDoCaso = (pesquisaCasos.data ?? []).map((p: Linha) => p.id as string);
    const { data: fichaGenealogica } = idsPesquisaDoCaso.length
      ? await supabase
          .from("research_people")
          .select(
            "id, canonical_name, preferred_display_name, papel_na_linhagem, geracao, identity_status, birth_date, birth_place, research_case_id",
          )
          .eq("organization_id", organizationId)
          .in("research_case_id", idsPesquisaDoCaso)
          .is("archived_at", null)
      : { data: [] as Linha[] };

    const nomeDaPessoa = (cliente.nome_social || cliente.nome || "").trim().toLowerCase();
    const fichaDestaPessoa = ((fichaGenealogica ?? []) as Linha[]).filter((p) => {
      const nome = String(p["canonical_name"] ?? p["preferred_display_name"] ?? "").toLowerCase();
      return (
        nome &&
        nomeDaPessoa &&
        (nome === nomeDaPessoa || nomeDaPessoa.includes(nome) || nome.includes(nomeDaPessoa))
      );
    });
    const outrosDaMesmaPesquisa = ((fichaGenealogica ?? []) as Linha[]).filter(
      (p) => !fichaDestaPessoa.some((f) => f["id"] === p["id"]),
    );

    /*
      24/09/2026 — decisão explícita da Proprietária: agregar achados de
      pesquisa (genealogical_findings) nesta ficha. O schema já tem a chave
      pronta (primary_research_person_id → research_people.id) desde a
      migration 20260816201830; só faltava alguém consultar o vínculo que já
      existia. Mesmo isolamento das linhas acima: camada de pesquisa, nunca
      vai ao App Cliente por aqui.
    */
    const idsPessoaPesquisa = fichaDestaPessoa.map((p) => p["id"] as string);
    const { data: achadosDaPessoa } = idsPessoaPesquisa.length
      ? await supabase
          .from("genealogical_findings")
          .select(
            "id, case_id, title, finding_type, validation_status, relevance, found_at, internal_summary, confirmed_facts, tree_impact, eligible_for_client_deliverable",
          )
          .eq("organization_id", organizationId)
          .in("primary_research_person_id", idsPessoaPesquisa)
          .is("archived_at", null)
          .order("found_at", { ascending: false })
      : { data: [] as Linha[] };

    /*
      24/09/2026 — Inventário documental da pessoa (não é o Dossiê-mãe, que
      é do núcleo): varredura com escopo interno (nunca Drive/Dropbox, sem
      integração real neste produto).
      `case_source_documents.pessoa_ref_id` já aponta tanto para
      case_members.id quanto para research_people.id (mesmo par que
      fontes-documentos.functions.ts já combina) — só nunca tinha sido
      agregado na ficha da pessoa.
    */
    const idsPessoaRef = [
      ...new Set([
        ...caseMembers.filter((m) => m["cliente_id"] === cliente.id).map((m) => m["id"] as string),
        ...idsPessoaPesquisa,
      ]),
    ];
    const { data: materiaisCatalogados } = idsPessoaRef.length
      ? await supabase
          .from("case_source_documents")
          .select(
            "id, case_id, titulo_interno, nome_arquivo, tipo_documento, origem_documento, status, data_documento, instituicao_emissora",
          )
          .eq("organization_id", organizationId)
          .in("pessoa_ref_id", idsPessoaRef)
          .is("archived_at", null)
      : { data: [] as Linha[] };

    /*
      24/09/2026 — Dossiê-mãe é do NÚCLEO (decisão da Proprietária). A pessoa
      lê o dossiê-mãe dos núcleos a que pertence, da mesma fonte que
      /nucleos e o gate de ativação usam — nunca uma cópia própria.
    */
    const idsNucleos = [
      ...new Set(((nucleoMembros.data ?? []) as Linha[]).map((m) => m["nucleo_id"] as string).filter(Boolean)),
    ];
    const { data: nucleosDaPessoa } = idsNucleos.length
      ? await supabase
          .from("nucleos_familiares")
          .select("id, nome, case_id, dossie_mae, dossie_status")
          .eq("organization_id", organizationId)
          .in("id", idsNucleos)
          .is("archived_at", null)
      : { data: [] as Linha[] };

    return {
      encontrada: true as const,
      cliente: cliente as Linha,
      casos: listaCasos,
      eventos: (eventos ?? []) as Linha[],
      leads: (leads ?? []) as Linha[],
      nucleoMembros: (nucleoMembros.data ?? []) as Linha[],
      propostas: (propostas.data ?? []) as Linha[],
      contratos: (contratos.data ?? []) as Linha[],
      contractParties: (contractParties.data ?? []) as Linha[],
      documentos: (documentos.data ?? []) as Linha[],
      projecoesPublicadas: (projecoes.data ?? []) as Linha[],
      perfisGenealogicos: (perfisGenealogicos.data ?? []) as Linha[],
      fichaGenealogica: fichaDestaPessoa,
      fichaGenealogicaEquipe: outrosDaMesmaPesquisa,
      caseMembers: caseMembers as Linha[],
      achadosPesquisa: (achadosDaPessoa ?? []) as Linha[],
      materiaisDossie: (materiaisCatalogados ?? []) as Linha[],
      nucleos: (nucleosDaPessoa ?? []) as Linha[],
    };
  });

const CAMPOS_EDITAVEIS = [
  "nome",
  "nome_social",
  "email",
  "telefone",
  "sexo",
  "nacionalidade",
  "profissao",
  "cpf",
  "rg_numero",
  "rg_orgao_uf",
  "endereco_logradouro",
  "endereco_numero",
  "endereco_complemento",
  "endereco_bairro",
  "endereco_cidade",
  "endereco_uf",
  "endereco_cep",
  "endereco_pais",
  "estado_civil",
  "nome_conjuge",
  "data_nascimento",
  "nome_pai",
  "nome_mae",
  "cidade_nascimento",
] as const;

type CampoEditavel = (typeof CAMPOS_EDITAVEIS)[number];

/** Edita os dados da Pessoa Canônica. Grava e relê para confirmar — nunca assume sucesso. */
export const atualizarPessoa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { clienteId: string; campos: Partial<Record<CampoEditavel, string | null>> }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const payload: Record<string, string | null> = {};
    for (const chave of CAMPOS_EDITAVEIS) {
      if (chave in data.campos) {
        const v = data.campos[chave];
        payload[chave] = typeof v === "string" ? v.trim() || null : null;
      }
    }
    if (Object.keys(payload).length === 0) throw new Error("Nenhum campo para gravar.");

    const resultado = await gravarComVerificacao({
      supabase,
      tabela: "clientes",
      id: data.clienteId,
      organizationId,
      userId: context.userId as string,
      payload,
    });

    return { ok: true, registro: resultado.registro as Linha };
  });
