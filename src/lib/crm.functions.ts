import { createServerFn } from "@tanstack/react-start";
import { sanitizarRotuloCliente } from "@/lib/canvas-sanitize";

/**
 * CRM vivo — leitura e escrita da base de casos já migrada.
 * Uso interno (Desk). O Canvas público é lido apenas por token e sanitizado.
 */

export type CrmCaso = {
  id: string;
  case_id: string;
  cliente_nome: string;
  case_nome: string | null;
  pais: string | null;
  via: string | null;
  status: string | null;
  responsavel: string | null;
  produto_sku: string | null;
  produto_nome: string | null;
  canvas_token: string;
  canvas_publicado: boolean;
  ultima_atualizacao: string | null;
};

export type CrmTouchpoint = {
  id: string;
  canal: string;
  direcao: string | null;
  resumo: string | null;
  transcricao: string | null;
  autor: string | null;
  aguardando_resposta: boolean | null;
  ocorrido_em: string;
};

export type CrmMicroentrega = {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string | null;
  visivel_cliente: boolean | null;
  entregue_em: string | null;
};

export type CrmTarefa = {
  id: string;
  titulo: string;
  etapa: string | null;
  prioridade: string | null;
  status: string | null;
  responsavel: string | null;
  observacao: string | null;
  concluida_em: string | null;
};

export type CrmSla = {
  chave: string;
  rotulo: string;
  descricao: string | null;
  horas_alvo: number;
  aplica_a: string | null;
};

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const listCrmCasos = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await db();
  const [casos, tarefas, entregas, tps, slas] = await Promise.all([
    supabase.from("casos").select("*").order("cliente_nome"),
    supabase.from("planner_tarefas").select("id,caso_id,status,prioridade"),
    supabase.from("microentregas").select("id,caso_id,status,visivel_cliente"),
    supabase.from("touchpoints").select("id,caso_id,canal,ocorrido_em,aguardando_resposta"),
    supabase.from("sla_regras").select("chave,rotulo,descricao,horas_alvo,aplica_a").order("horas_alvo"),
  ]);
  if (casos.error) throw new Error(casos.error.message);

  const lista = (casos.data ?? []) as unknown as CrmCaso[];
  const resumo = lista.map((c) => {
    const t = (tarefas.data ?? []).filter((x) => x["caso_id"] === c.id);
    const m = (entregas.data ?? []).filter((x) => x["caso_id"] === c.id);
    const p = (tps.data ?? []).filter((x) => x["caso_id"] === c.id);
    const ultimo = p
      .map((x) => x["ocorrido_em"] as string)
      .sort()
      .at(-1);
    return {
      ...c,
      tarefas_abertas: t.filter((x) => x["status"] !== "concluida").length,
      tarefas_alta: t.filter((x) => x["status"] !== "concluida" && x["prioridade"] === "alta").length,
      entregas_total: m.length,
      entregas_visiveis: m.filter((x) => x["visivel_cliente"]).length,
      touchpoints: p.length,
      aguardando_resposta: p.some((x) => x["aguardando_resposta"]),
      ultimo_touchpoint: ultimo ?? null,
    };
  });

  return { casos: resumo, sla: (slas.data ?? []) as unknown as CrmSla[] };
});

export const getCrmCaso = createServerFn({ method: "GET" })
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data }) => {
    const supabase = await db();
    const caso = await supabase.from("casos").select("*").eq("case_id", data.caseId).maybeSingle();
    if (caso.error) throw new Error(caso.error.message);
    if (!caso.data) return null;
    const id = (caso.data as unknown as CrmCaso).id;
    const [tps, mes, tarefas] = await Promise.all([
      supabase.from("touchpoints").select("*").eq("caso_id", id).order("ocorrido_em", { ascending: false }),
      supabase.from("microentregas").select("*").eq("caso_id", id).order("created_at"),
      supabase.from("planner_tarefas").select("*").eq("caso_id", id).order("created_at"),
    ]);
    return {
      caso: caso.data as unknown as CrmCaso,
      touchpoints: (tps.data ?? []) as unknown as CrmTouchpoint[],
      microentregas: (mes.data ?? []) as unknown as CrmMicroentrega[],
      tarefas: (tarefas.data ?? []) as unknown as CrmTarefa[],
    };
  });

export const registrarTouchpoint = createServerFn({ method: "POST" })
  .inputValidator((data: {
    caseId: string;
    canal: string;
    resumo: string;
    transcricao?: string;
    autor?: string;
    aguardandoResposta?: boolean;
  }) => data)
  .handler(async ({ data }) => {
    const supabase = await db();
    const caso = await supabase.from("casos").select("id").eq("case_id", data.caseId).maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado");
    const { error } = await supabase.from("touchpoints").insert({
      caso_id: (caso.data as { id: string }).id,
      canal: data.canal,
      direcao: "entrada",
      resumo: data.resumo,
      transcricao: data.transcricao ?? null,
      autor: data.autor ?? null,
      aguardando_resposta: data.aguardandoResposta ?? false,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const alternarTarefa = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; concluida: boolean }) => data)
  .handler(async ({ data }) => {
    const supabase = await db();
    const { error } = await supabase
      .from("planner_tarefas")
      .update({
        status: data.concluida ? "concluida" : "pendente",
        concluida_em: data.concluida ? new Date().toISOString() : null,
      } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const alternarVisibilidadeEntrega = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; visivel: boolean }) => data)
  .handler(async ({ data }) => {
    const supabase = await db();
    const { error } = await supabase
      .from("microentregas")
      .update({
        visivel_cliente: data.visivel,
        entregue_em: data.visivel ? new Date().toISOString() : null,
      } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const publicarCanvas = createServerFn({ method: "POST" })
  .inputValidator((data: { caseId: string; publicado: boolean }) => data)
  .handler(async ({ data }) => {
    const supabase = await db();
    const { error } = await supabase
      .from("casos")
      .update({ canvas_publicado: data.publicado } as never)
      .eq("case_id", data.caseId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Canvas isolado por cliente: só devolve dados sanitizados e apenas se publicado. */
export const getCanvasPorToken = createServerFn({ method: "GET" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    if (!data.token || data.token.length < 16) return null;
    const supabase = await db();
    const caso = await supabase
      .from("casos")
      .select("id,cliente_nome,case_nome,pais,via,status,produto_nome,canvas_publicado,ultima_atualizacao")
      .eq("canvas_token", data.token)
      .maybeSingle();
    if (caso.error || !caso.data) return null;
    const row = caso.data as unknown as {
      id: string;
      cliente_nome: string;
      case_nome: string | null;
      pais: string | null;
      via: string | null;
      status: string | null;
      produto_nome: string | null;
      canvas_publicado: boolean;
      ultima_atualizacao: string | null;
    };
    if (!row.canvas_publicado) return null;

    const entregas = await supabase
      .from("microentregas")
      .select("id,titulo,descricao,status,entregue_em")
      .eq("caso_id", row.id)
      .eq("visivel_cliente", true)
      .order("created_at");

    return {
      cliente_nome: row.cliente_nome,
      pais: row.pais,
      via: row.via,
      status: row.status,
      produto_nome: row.produto_nome,
      ultima_atualizacao: row.ultima_atualizacao,
      entregas: (entregas.data ?? []) as unknown as {
        id: string;
        titulo: string;
        descricao: string | null;
        status: string | null;
        entregue_em: string | null;
      }[],
    };
  });
