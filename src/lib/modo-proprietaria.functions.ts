/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Leitura declarativa do Modo Proprietária — a pergunta que nenhuma tela
 * respondia: "isso está de fato ligado pra mim?"
 *
 * Não decide nada novo: `ehProprietariaAdministradora`/`capacidadesDe`
 * (modo-proprietaria.ts) já são a fonte de verdade da decisão, usada em toda
 * a autoridade operacional. Esta função só lê o estado real — papel,
 * organização e os últimos eventos gravados em `owner_override_events` —
 * para uma tela poder mostrar, sem inferência, que o modo está ativo e o que
 * ele já fez.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoInterno } from "@/lib/comercial.server";
import { ehProprietariaAdministradora } from "@/lib/modo-proprietaria";
import { semCache } from "@/lib/no-store";

export type EventoProprietaria = {
  id: string;
  acao: string;
  entidade: string | null;
  entidadeId: string | null;
  motivo: string | null;
  autorPapel: string | null;
  criadoEm: string;
};

export const obterModoProprietaria = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const userId = context.userId as string;

    const { organizationId, papel } = await contextoInterno(supabase, userId);
    const ativo = ehProprietariaAdministradora(papel);

    if (!ativo) {
      return { ativo: false, papel, organizationId, ultimosEventos: [] as EventoProprietaria[] };
    }

    const { data: eventos, error } = await supabase
      .from("owner_override_events")
      .select("id,acao,entidade,entidade_id,motivo,actor_papel,created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);

    const ultimosEventos: EventoProprietaria[] = (eventos ?? []).map((e: any) => ({
      id: e.id as string,
      acao: e.acao as string,
      entidade: (e.entidade as string) ?? null,
      entidadeId: (e.entidade_id as string) ?? null,
      motivo: (e.motivo as string) ?? null,
      autorPapel: (e.actor_papel as string) ?? null,
      criadoEm: e.created_at as string,
    }));

    return { ativo, papel, organizationId, ultimosEventos };
  });
