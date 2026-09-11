import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { evidenciaDeMesmaPessoa } from "@/lib/pessoa-identidade";

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
    const listaCasos = listaCasosBruta.map((c) => ({
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
        "id, codigo, nome, email, telefone, estagio, origem, created_at, case_id, nucleo_id," +
          " call_realizada_em, call_agendada_em, discovery_resultado, resumo_call, narrativa_familiar," +
          " proxima_acao, proxima_acao_em, status_call, consentimento_canal," +
          " nacionalidades_interesse, geracao_ascendente, linha_transmissao, documentos_chave",
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
        .select(
          "id, nucleo_id, nome, papel, vinculo, processo, ordem, cliente_id, representacao_necessaria, status_cadastral",
        )
        .eq("cliente_id", cliente.id)
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("proposals")
        .select("id, case_id, status, valor, moeda, created_at, enviada_em, aprovada_em, validade")
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

    const idsPesquisaDoCaso = (pesquisaCasos.data ?? []).map((p: Linha) => p.id as string);
    const idsNucleoDoMembro = (nucleoMembros.data ?? []).map((m: Linha) => String(m.nucleo_id)).filter(Boolean);
    const idsNucleoDoLead = ((leads ?? []) as Linha[])
      .filter((l) => l.nucleo_id && evidenciaDeMesmaPessoa(l, cliente))
      .map((l) => String(l.nucleo_id));
    const idsNucleo = [...new Set([...idsNucleoDoMembro, ...idsNucleoDoLead])];

    const [fichaGenealogicaRes, familiaRes, nucleosRes, achadosRes, evidenciasRes, whatsappRes] = await Promise.all([
      idsPesquisaDoCaso.length
        ? supabase
            .from("research_people")
            .select(
              "id, canonical_name, preferred_display_name, papel_na_linhagem, geracao, identity_status, birth_date, birth_place, research_case_id",
            )
            .eq("organization_id", organizationId)
            .in("research_case_id", idsPesquisaDoCaso)
            .is("archived_at", null)
        : { data: [] as Linha[] },
      idsNucleo.length
        ? supabase
            .from("nucleo_membros")
            .select(
              "id, nucleo_id, nome, papel, vinculo, processo, ordem, cliente_id, representacao_necessaria, status_cadastral",
            )
            .in("nucleo_id", idsNucleo)
            .eq("organization_id", organizationId)
            .is("archived_at", null)
            .order("ordem", { ascending: true })
        : { data: [] as Linha[] },
      idsNucleo.length
        ? supabase
            .from("nucleos_familiares")
            .select("id, nome, case_id, dossie_mae, status, contratante_nome")
            .eq("organization_id", organizationId)
            .in("id", idsNucleo)
            .is("archived_at", null)
        : { data: [] as Linha[] },
      ids.length
        ? supabase
            .from("genealogical_findings")
            .select(
              "id, case_id, title, finding_type, validation_status, confidence, client_projection_status, internal_summary, found_at, updated_at, locality, generation",
            )
            .eq("organization_id", organizationId)
            .in("case_id", ids)
            .is("archived_at", null)
            .order("found_at", { ascending: false })
            .limit(100)
        : { data: [] as Linha[] },
      ids.length
        ? supabase
            .from("evidences")
            .select("id, case_id, title_internal, evidence_type, workflow_status, confidence_level, created_at")
            .eq("organization_id", organizationId)
            .in("case_id", ids)
            .is("archived_at", null)
            .order("created_at", { ascending: false })
            .limit(100)
        : { data: [] as Linha[] },
      ids.length
        ? supabase
            .from("touchpoints")
            .select("id, caso_id, canal, resumo, ocorrido_em, direcao")
            .in("caso_id", ids)
            .eq("canal", "whatsapp")
            .order("ocorrido_em", { ascending: false })
            .limit(50)
        : { data: [] as Linha[] },
    ]);
    const fichaGenealogica = fichaGenealogicaRes.data ?? [];

    const nomeDaPessoa = (cliente.nome_social || cliente.nome || "").trim().toLowerCase();
    const fichaDestaPessoa = (fichaGenealogica as Linha[]).filter((p) => {
      const nome = String(p["canonical_name"] ?? p["preferred_display_name"] ?? "").toLowerCase();
      return (
        nome &&
        nomeDaPessoa &&
        (nome === nomeDaPessoa || nomeDaPessoa.includes(nome) || nome.includes(nomeDaPessoa))
      );
    });
    const outrosDaMesmaPesquisa = (fichaGenealogica as Linha[]).filter(
      (p) => !fichaDestaPessoa.some((f) => f["id"] === p["id"]),
    );

    return {
      encontrada: true as const,
      cliente: cliente as Linha,
      casos: listaCasos,
      eventos: (eventos ?? []) as Linha[],
      leads: (leads ?? []) as Linha[],
      nucleoMembros: (nucleoMembros.data ?? []) as Linha[],
      nucleos: (nucleosRes.data ?? []) as Linha[],
      familiaMembros: (familiaRes.data ?? []) as Linha[],
      propostas: (propostas.data ?? []) as Linha[],
      contratos: (contratos.data ?? []) as Linha[],
      contractParties: (contractParties.data ?? []) as Linha[],
      documentos: (documentos.data ?? []) as Linha[],
      projecoesPublicadas: (projecoes.data ?? []) as Linha[],
      perfisGenealogicos: (perfisGenealogicos.data ?? []) as Linha[],
      fichaGenealogica: fichaDestaPessoa,
      fichaGenealogicaEquipe: outrosDaMesmaPesquisa,
      achados: (achadosRes.data ?? []) as Linha[],
      evidencias: (evidenciasRes.data ?? []) as Linha[],
      touchpointsWhatsapp: (whatsappRes.data ?? []) as Linha[],
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
