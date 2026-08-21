import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import type { Classificacao, PessoaLista } from "@/lib/clientes-lista";
import { semCache } from "@/lib/no-store";

/* eslint-disable @typescript-eslint/no-explicit-any */

const seguro = async (p: any): Promise<any[]> => {
  try {
    const r = await p;
    return (r?.data ?? []) as any[];
  } catch {
    return [];
  }
};

/** Leitura da base de pessoas com classificação, condições objetivas e vínculos de núcleo. */
export const listarPessoasCliente = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PessoaLista[]> => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const eq = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);

    const [pessoas, casos, membros, nucleos] = await Promise.all([
      seguro(eq("clientes").order("nome")),
      seguro(eq("crm_casos").is("archived_at", null)),
      seguro(eq("nucleo_membros")),
      seguro(eq("nucleos_familiares").is("archived_at", null)),
    ]);

    const nomeNucleo = new Map<string, string>(nucleos.map((n) => [n.id, n.nome ?? "Núcleo familiar"]));

    return pessoas.map((p) => {
      const meus = casos.filter((c) => c.cliente_id === p.id);
      return {
        id: p.id,
        nome: p.nome,
        nome_social: p.nome_social ?? null,
        email: p.email ?? null,
        telefone: p.telefone ?? null,
        origem: p.origem ?? null,
        status_comercial: p.status_comercial ?? null,
        pais_interesse: p.pais_interesse ?? null,
        status: p.status ?? "pre_onboarding",
        classificacao: (p.classificacao ?? "pre_cliente") as Classificacao,
        is_demo: Boolean(p.is_demo ?? p.demo),
        archived_at: p.archived_at ?? null,
        archive_motivo: p.archive_motivo ?? null,
        ativacao_decidida_em: p.ativacao_decidida_em ?? null,
        ativacao_justificativa: p.ativacao_justificativa ?? null,
        contratoAssinado: meus.some((c) => Boolean(c.contrato_assinado)),
        pagamentoConfirmado: meus.some((c) => Boolean(c.pagamento_confirmado)),
        participacoes: membros
          .filter((m) => m.cliente_id === p.id)
          .map((m) => ({ nucleo: nomeNucleo.get(m.nucleo_id) ?? null, papel: m.papel ?? m.vinculo ?? null })),
      } satisfies PessoaLista;
    });
  });

/** Decisão humana de ativação. O banco recusa sem contrato assinado e pagamento confirmado. */
export const ativarCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; justificativa: string }) => {
    if (!data.justificativa || data.justificativa.trim().length < 5) {
      throw new Error("Registre a justificativa da decisão de ativação (mínimo 5 caracteres).");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const { error } = await supabase
      .from("clientes")
      .update({
        classificacao: "cliente_ativo",
        status: "ativo",
        ativacao_decidida_em: new Date().toISOString(),
        ativacao_decidida_por: context.userId,
        ativacao_justificativa: data.justificativa.trim(),
        updated_by: context.userId,
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Reclassifica a pessoa (pré-cliente ou participante do núcleo), sem exclusão física. */
export const reclassificarPessoa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; classificacao: Exclude<Classificacao, "cliente_ativo">; motivo: string }) => {
    if (!data.motivo || data.motivo.trim().length < 5) throw new Error("Informe o motivo da reclassificação.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const { error } = await supabase
      .from("clientes")
      .update({
        classificacao: data.classificacao,
        status: "pre_onboarding",
        ativacao_decidida_em: null,
        ativacao_decidida_por: null,
        ativacao_justificativa: data.motivo.trim(),
        updated_by: context.userId,
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
