import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  camposDoTipo,
  pendenciasCadastro,
  rascunhoSolicitacaoCadastro,
  resumoPorPessoa,
  type ItemChecklist,
  type PessoaTipo,
} from "@/lib/cadastro-checklist";

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

/** Leitura do checklist + resumo por pessoa + pendências + rascunhos já registrados. */
export const carregarChecklistCadastral = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => ({ caseId: exigirUuid(data?.caseId, "caseId") }))
  .handler(async ({ data, context }) => {
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

    const lista = (itens ?? []) as ItemChecklist[];
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

    const { data: membros } = await supabase
      .from("case_members")
      .select("id,nome,papel_no_caso,titular,contratante,dependente")
      .eq("case_id", data.caseId)
      .is("archived_at", null);

    const { data: dependentes } = await supabase
      .from("case_dependents")
      .select("id,nome_completo,dependent_person_id")
      .eq("case_id", data.caseId)
      .is("archived_at", null);

    // Clientes canônicos da organização para reconciliar pessoa → cliente por ID.
    const { data: clientes } = await supabase
      .from("clientes")
      .select("id,nome")
      .eq("organization_id", caso.organization_id)
      .is("archived_at", null);
    const clientePorNome = new Map(
      ((clientes ?? []) as any[]).map((c) => [String(c.nome).trim().toLowerCase(), c.id as string]),
    );

    const pessoas: { tipo: PessoaTipo; nome: string; ref: string | null; tabela: string | null; cliente: string | null }[] = [];
    for (const m of (membros ?? []) as any[]) {
      if (m.dependente) continue;
      pessoas.push({
        tipo: "titular",
        nome: m.nome,
        ref: m.id,
        tabela: "case_members",
        cliente: clientePorNome.get(String(m.nome).trim().toLowerCase()) ?? null,
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
    pessoas.push({ tipo: "contratada", nome: "Clube Ancestral (contratada)", ref: null, tabela: null, cliente: null });

    const semRef = pessoas.filter((p) => p.tipo !== "contratada" && !p.ref).map((p) => p.nome);
    if (semRef.length)
      throw new Error(
        `Checklist por pessoa exige referência por ID. Sem referência: ${semRef.join(", ")}. Nenhuma linha foi criada por nome.`,
      );

    const linhas: any[] = [];
    for (const p of pessoas) {
      camposDoTipo(p.tipo).forEach((c, i) => {
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
          obrigatorio: true,
          status: p.tipo === "contratada" ? "aguarda_fonte_societaria" : "pendente",
          fonte: null,
          data_verificacao: null,
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


/** Atualiza um item: status, fonte, data de verificação, acesso e observação. */
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

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: userId };
    for (const campo of ["status", "fonte", "data_verificacao", "acesso_restrito", "observacao_interna", "obrigatorio"] as const) {
      if (campo in data) {
        const v = (data as any)[campo];
        patch[campo] = typeof v === "string" && v.trim() === "" ? null : v;
      }
    }
    // Verificado exige fonte declarada e data — nada é inferido.
    if (patch["status"] === "verificado") {
      const { data: atual } = await supabase
        .from("checklist_cadastral")
        .select("fonte,data_verificacao")
        .eq("id", data.id)
        .maybeSingle();
      const fonte = (patch["fonte"] ?? atual?.fonte) as string | null;
      const dt = (patch["data_verificacao"] ?? atual?.data_verificacao) as string | null;
      if (!fonte || fonte === "nao_declarada" || !dt)
        throw new Error("Para marcar como verificado, declare a fonte e a data de verificação.");
    }

    const { error } = await supabase.from("checklist_cadastral").update(patch).eq("id", data.id);
    if (error) throw new Error(`Não foi possível salvar: ${error.message}`);
    return { ok: true };
  });

/**
 * Registra a próxima ação datada do cadastro e um rascunho de comunicação.
 * O rascunho fica em fila com aprovação humana obrigatória: nada é enviado.
 */
export const registrarAcaoCadastro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; prazo: string; pessoa: string }) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data?.prazo ?? ""))) throw new Error("Informe a data da próxima ação.");
    if (!String(data?.pessoa ?? "").trim()) throw new Error("Informe a pessoa da ação.");
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
