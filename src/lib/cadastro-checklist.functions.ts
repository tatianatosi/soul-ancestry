import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import {
  camposDoTipo,
  pendenciasCadastro,
  resolvivelPelaPessoa360,
  valorCanonicoDoCampo,
  rascunhoSolicitacaoCadastro,
  resumoPorPessoa,
  type ItemChecklist,
  type PessoaTipo,
} from "@/lib/cadastro-checklist";
import { clienteCorrespondentePorNome, pessoasDoCasoComFallbackNucleo } from "@/lib/pessoa-vinculo";
import { PERFIL_INSTITUCIONAL } from "@/lib/contrato-base-consolidado";

/*
 * 04/09/2026 — achado real reportado pela Proprietária: o checklist cadastral
 * marcava razão social/CNPJ/endereço/e-mail da própria contratada (Clube
 * Ancestral) como "aguarda fonte societária" em TODO caso novo — mesmo esse
 * dado já sendo canônico, versionado e conhecido em PERFIL_INSTITUCIONAL
 * (contrato-base-consolidado.ts). Tratar dado institucional já homologado
 * como pendência de verificação por caso não fazia sentido e aparecia como
 * bloqueio vermelho permanente sem ação possível de resolver de verdade
 * (o valor já é conhecido; não há "fonte societária" nova a declarar por
 * caso). De-para campo do checklist → campo do perfil institucional:
 */
const CAMPO_CONTRATADA_PARA_PERFIL: Record<string, string> = {
  razao_social: "razao_empresarial",
  cnpj: "cnpj",
  endereco: "endereco_institucional",
  email: "email_oficial",
  // 04/09/2026 — Proprietária confirmou: dona da firma individual, portanto
  // representante legal em todos os aspectos do Clube Ancestral. Passou a
  // ter correspondente canônico em PERFIL_INSTITUCIONAL.
  representante_legal: "representante_legal",
};

/* eslint-disable @typescript-eslint/no-explicit-any */

const UUID = /^[0-9a-f-]{36}$/i;
const exigirUuid = (v: unknown, campo: string) => {
  if (!UUID.test(String(v ?? ""))) throw new Error(`${campo} inválido.`);
  return String(v);
};

async function contexto(supabase: any, caseId: string) {
  const { data: caso } = await supabase
    .from("crm_casos")
    .select("id,codigo,titulo,organization_id,prazo_proxima_acao,proxima_acao")
    .eq("id", caseId)
    .maybeSingle();
  if (!caso) throw new Error("Caso não encontrado.");
  return caso;
}


/**
 * Reconciliação Pessoa 360 → checklist cadastral (09/10/2026).
 *
 * Bug medido no caso da Ana: o checklist listava "CPF: não informado",
 * "RG: não informado", "Endereço completo: não informado" para pessoas que
 * TÊM esses dados em `clientes`. A semeadura criava toda linha como
 * "pendente" e nunca olhava a pessoa canônica — e, como o upsert usa
 * `ignoreDuplicates`, semear de novo nunca corrigiria as linhas já criadas.
 * O contrato ficava travado por pendência que não existe.
 *
 * Esta passagem roda na LEITURA e é conservadora por desenho:
 *  - só toca linha ainda `pendente` (decisão humana registrada fica);
 *  - só marca `verificado` quando o valor canônico existe de fato;
 *  - grava `fonte: "crm"` (a Pessoa 360 é o registro canônico do CRM) e a
 *    data — nunca inventa fonte nova nem valor;
 *  - falha de gravação não derruba a tela: devolve a lista como está.
 *
 * Campo sem valor canônico continua pendente, e é pendência de verdade.
 */
async function resolverPelaPessoa360(
  supabase: any,
  organizationId: string,
  userId: string,
  itens: ItemChecklist[],
): Promise<ItemChecklist[]> {
  const clienteIds = [
    ...new Set(itens.map((i) => (i as any).cliente_id as string | null).filter(Boolean) as string[]),
  ];
  if (!clienteIds.length) return itens;

  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .eq("organization_id", organizationId)
    .in("id", clienteIds)
    .is("archived_at", null);
  const porId = new Map(((clientes ?? []) as any[]).map((c) => [String(c.id), c as Record<string, unknown>]));
  if (!porId.size) return itens;

  const hoje = new Date().toISOString().slice(0, 10);
  const resolvidos = itens.filter((i) => resolvivelPelaPessoa360(i as any, porId.get(String((i as any).cliente_id))));
  if (!resolvidos.length) return itens;

  const atualizados = new Map<string, ItemChecklist>();
  for (const item of resolvidos) {
    try {
      const r = await gravarComVerificacao({
        supabase,
        tabela: "checklist_cadastral",
        id: String((item as any).id),
        organizationId,
        userId,
        payload: { status: "verificado", fonte: "crm", data_verificacao: hoje },
      });
      atualizados.set(String((item as any).id), r.registro as ItemChecklist);
    } catch {
      // Lacuna é melhor que silêncio invertido: se a gravação falhar, a
      // linha continua pendente na tela em vez de parecer resolvida.
    }
  }
  return itens.map((i) => atualizados.get(String((i as any).id)) ?? i);
}

/** Leitura do checklist + resumo por pessoa + pendências + rascunhos já registrados. */
export const carregarChecklistCadastral = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => ({ caseId: exigirUuid(data?.caseId, "caseId") }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const caso = await contexto(supabase, data.caseId);

    const { data: itens } = await supabase
      .from("checklist_cadastral")
      .select("*")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("pessoa_tipo")
      .order("pessoa_nome")
      .order("ordem");

    const { data: comunicacoes } = await supabase
      .from("communication_queue")
      .select("id,assunto,corpo_rascunho,status,target_audience,suggested_channel,created_at,sent_at,acao_codigo")
      .eq("case_id", data.caseId)
      .eq("acao_codigo", "cadastro_pendente")
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    const lista = await resolverPelaPessoa360(
      supabase,
      caso.organization_id,
      (context as any).userId as string,
      (itens ?? []) as ItemChecklist[],
    );
    return {
      caso,
      itens: lista,
      resumo: resumoPorPessoa(lista),
      pendencias: pendenciasCadastro(lista),
      comunicacoes: comunicacoes ?? [],
    };
  });

/**
 * Materializa as linhas do checklist a partir das pessoas já registradas
 * (titulares em case_members, dependentes em case_dependents e a contratada).
 * Não inventa pessoa nem preenche valor: cria a linha em "pendente".
 */
export const semearChecklistCadastral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => ({ caseId: exigirUuid(data?.caseId, "caseId") }))
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const caso = await contexto(supabase, data.caseId);

    const membros = await pessoasDoCasoComFallbackNucleo(supabase, data.caseId);

    const { data: dependentes } = await supabase
      .from("case_dependents")
      .select("id,nome_completo,dependent_person_id")
      .eq("case_id", data.caseId)
      .is("archived_at", null);

    // Clientes canônicos da organização para reconciliar pessoa → cliente por ID.
    /*
     * 09/10/2026: a linha inteira, não só `id,nome`. A semeadura passa a
     * conferir o que a Pessoa 360 já tem (CPF, RG, endereço, telefone,
     * e-mail…) em vez de criar tudo como pendente.
     */
    const { data: clientes } = await supabase
      .from("clientes")
      .select("*")
      .eq("organization_id", caso.organization_id)
      .is("archived_at", null);
    const clientesOrg = (clientes ?? []) as { id: string; nome: string }[];
    const clientesCanonicos = new Map(
      ((clientes ?? []) as any[]).map((c) => [String(c.id), c as Record<string, unknown>]),
    );

    /*
     * 04/09/2026 — achado real (Ana Luiza, Pessoa 360): o vínculo aqui era
     * calculado apenas para preencher `checklist_cadastral.cliente_id`
     * (uma linha derivada), e por igualdade exata de nome — o mesmo erro
     * que deixou `nucleo_membros.cliente_id` nulo para Ana (nome curto no
     * cadastro em `clientes` vs. nome completo em `case_members`). Agora
     * usa a mesma regra tolerante do backfill (clienteCorrespondentePorNome)
     * e também grava o vínculo de volta em `case_members.cliente_id` —
     * fonte, não só a derivada — para que a próxima leitura de qualquer
     * tela não dependa de recalcular o match de novo.
     */
    const pessoas: { tipo: PessoaTipo; nome: string; ref: string | null; tabela: string | null; cliente: string | null }[] = [];
    for (const m of membros) {
      if (m.dependente) continue;
      const clienteId = m.cliente_id ?? clienteCorrespondentePorNome(String(m.nome), clientesOrg);
      // Só grava de volta quando a linha é mesmo de case_members — um membro
      // vindo do fallback de Núcleos (m.id de nucleo_membros) já tem o
      // cliente_id correto lido de lá; escrever em case_members com esse id
      // atingiria a linha errada (ou nenhuma).
      if (clienteId && !m.cliente_id && m.origem === "case_members") {
        await supabase.from("case_members").update({ cliente_id: clienteId }).eq("id", m.id);
      }
      pessoas.push({
        tipo: "titular",
        nome: m.nome,
        ref: m.id,
        tabela: m.origem,
        cliente: clienteId ?? null,
      });
    }
    for (const d of (dependentes ?? []) as any[]) {
      pessoas.push({
        tipo: "dependente",
        nome: d.nome_completo,
        ref: d.dependent_person_id ?? d.id,
        tabela: d.dependent_person_id ? "case_members" : "case_dependents",
        cliente: null,
      });
    }
    // Contratada = perfil institucional org-wide (Tatiana ME). Não gera
    // checklist por caso — pediria a proprietária se reconfirmar a cada caso.

    const semRef = pessoas.filter((p) => !p.ref).map((p) => p.nome);
    if (semRef.length)
      throw new Error(
        `Checklist por pessoa exige referência por ID. Sem referência: ${semRef.join(", ")}. Nenhuma linha foi criada por nome.`,
      );

    const hoje = new Date().toISOString().slice(0, 10);
    const linhas: any[] = [];
    for (const p of pessoas) {
      camposDoTipo(p.tipo).forEach((c, i) => {
        const campoPerfil = p.tipo === "contratada" ? CAMPO_CONTRATADA_PARA_PERFIL[c.campo] : null;
        const valorPerfil = campoPerfil
          ? PERFIL_INSTITUCIONAL.find((x) => x.campo === campoPerfil)?.valor
          : null;
        const resolvidoPeloPerfil = Boolean(valorPerfil && valorPerfil.trim());
        const resolvidoPelaPessoa =
          !resolvidoPeloPerfil &&
          p.tipo === "titular" &&
          Boolean(p.cliente) &&
          valorCanonicoDoCampo(c.campo, clientesCanonicos.get(String(p.cliente))) !== null;
        linhas.push({
          organization_id: caso.organization_id,
          case_id: data.caseId,
          pessoa_tipo: p.tipo,
          pessoa_nome: p.nome,
          pessoa_ref_id: p.ref,
          pessoa_ref_tabela: p.tabela,
          cliente_id: p.cliente,
          campo: c.campo,
          campo_rotulo: c.rotulo,
          // 08/09/2026 — antes era `true` para todo campo, gerando 9 travas por
          // pessoa adulta. Agora respeita a obrigatoriedade declarada no molde.
          obrigatorio: c.obrigatorio,
          /*
           * 09/10/2026: a semeadura passa a consultar a Pessoa 360. Antes
           * criava TODA linha como "pendente" mesmo conhecendo o
           * `cliente_id`, e o caso da Ana nascia com pendência falsa de
           * CPF, RG e endereço que travava o contrato.
           */
          status: resolvidoPeloPerfil
            ? "verificado"
            : resolvidoPelaPessoa
              ? "verificado"
              : p.tipo === "contratada"
                ? "aguarda_fonte_societaria"
                : "pendente",
          fonte: resolvidoPeloPerfil ? "fonte_societaria" : resolvidoPelaPessoa ? "crm" : null,
          data_verificacao: resolvidoPeloPerfil || resolvidoPelaPessoa ? hoje : null,
          acesso_restrito: true,
          ordem: i,
          created_by: userId,
          updated_by: userId,
        });
      });
    }

    const { error } = await supabase
      .from("checklist_cadastral")
      .upsert(linhas, { onConflict: "case_id,pessoa_tipo,pessoa_nome,campo", ignoreDuplicates: true });
    if (error) throw new Error(`Não foi possível registrar o checklist: ${error.message}`);

    return { criados: linhas.length, pessoas: pessoas.length };
  });


/**
 * Atualiza um item: status, fonte, data de verificação, acesso e observação.
 *
 * 30/08/2026 — achado real (P0, reportado pela proprietária no preview):
 * fazia `.update(patch).eq("id", data.id)` e só checava `error`. Um UPDATE
 * que bate em zero linhas (RLS por organização/permissão, ou id de outra
 * organização) não é erro no Postgres/PostgREST — é sucesso com zero linhas
 * afetadas. A tela recebia `{ok:true}` e nada tinha sido gravado. Agora usa
 * `gravarComVerificacao` (persistencia.server.ts): exige organization_id na
 * cláusula do UPDATE, confere linha afetada e relê comparando campo a campo
 * antes de devolver sucesso.
 */
export const salvarItemChecklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id: string;
      status?: string;
      fonte?: string | null;
      data_verificacao?: string | null;
      acesso_restrito?: boolean;
      observacao_interna?: string | null;
      obrigatorio?: boolean;
    }) => ({ ...data, id: exigirUuid(data?.id, "id") }),
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;

    const { data: linha } = await supabase
      .from("checklist_cadastral")
      .select("organization_id,fonte,data_verificacao")
      .eq("id", data.id)
      .maybeSingle();
    if (!linha) throw new Error("Item do checklist não encontrado ou sem permissão de leitura.");

    const patch: Record<string, unknown> = {};
    for (const campo of ["status", "fonte", "data_verificacao", "acesso_restrito", "observacao_interna", "obrigatorio"] as const) {
      if (campo in data) {
        const v = (data as any)[campo];
        patch[campo] = typeof v === "string" && v.trim() === "" ? null : v;
      }
    }
    // Verificado exige fonte declarada e data — nada é inferido.
    if (patch["status"] === "verificado") {
      const fonte = (patch["fonte"] ?? linha.fonte) as string | null;
      const dt = (patch["data_verificacao"] ?? linha.data_verificacao) as string | null;
      if (!fonte || fonte === "nao_declarada" || !dt)
        throw new Error("Para marcar como verificado, declare a fonte e a data de verificação.");
    }

    const r = await gravarComVerificacao({
      supabase,
      tabela: "checklist_cadastral",
      id: data.id,
      organizationId: linha.organization_id,
      userId,
      payload: patch,
    });
    return { ok: true, salvoEm: r.salvoEm };
  });

/**
 * Registra a próxima ação datada do cadastro e um rascunho de comunicação.
 * O rascunho fica em fila com aprovação humana obrigatória: nada é enviado.
 */
export const registrarAcaoCadastro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; prazo: string; pessoa: string }) => {
    return { caseId: exigirUuid(data?.caseId, "caseId"), prazo: data.prazo, pessoa: data.pessoa.trim() };
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const caso = await contexto(supabase, data.caseId);

    const { data: itens } = await supabase
      .from("checklist_cadastral")
      .select("*")
      .eq("case_id", data.caseId)
      .eq("pessoa_nome", data.pessoa)
      .is("archived_at", null);

    const pend = pendenciasCadastro((itens ?? []) as ItemChecklist[]);
    const rascunho = rascunhoSolicitacaoCadastro({ pessoa: data.pessoa, pendencias: pend, prazo: data.prazo });

    const { error: e1 } = await supabase.from("communication_queue").insert({
      organization_id: caso.organization_id,
      case_id: data.caseId,
      acao_codigo: "cadastro_pendente",
      target_audience: "cliente",
      visibility: "interno",
      suggested_channel: "whatsapp",
      assunto: rascunho.assunto,
      corpo_rascunho: rascunho.corpo,
      status: "rascunho",
      requires_human_approval: true,
      observacao_interna: `Rascunho gerado pelo checklist cadastral. ${pend.length} pendência(s). Nenhum envio executado.`,
      created_by: userId,
      updated_by: userId,
    });
    if (e1) throw new Error(`Não foi possível gravar o rascunho: ${e1.message}`);

    const { error: e2 } = await supabase
      .from("crm_casos")
      .update({
        proxima_acao: `Confirmar dados cadastrais de ${data.pessoa}`,
        prazo_proxima_acao: data.prazo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.caseId);
    if (e2) throw new Error(`Não foi possível registrar a próxima ação: ${e2.message}`);

    return { pendencias: pend.length, enviado: false };
  });
