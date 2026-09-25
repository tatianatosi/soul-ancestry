import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import {
  aceitarSugestaoTrilha,
  criarLeadDaTriagem,
  importarTriagemAncestralScan,
  obterTriagemDoLead,
  rejeitarSugestaoTrilha,
  sugerirTrilhasParaLead,
} from "@/lib/ancestralscan-triagem.server";
import type { PayloadTriagemAncestralScan, TrilhaAtiva } from "@/lib/ancestralscan-triagem";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Camada A — importação manual de uma triagem já respondida no Scan público. */
export const importarTriagem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { payload: Partial<PayloadTriagemAncestralScan> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    return importarTriagemAncestralScan(supabase, { userId, payload: data.payload });
  });

/** Camada B — cria o lead só por ação humana explícita, nunca automático. */
export const criarLeadDeTriagem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { triagemId: string; nome: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    return criarLeadDaTriagem(supabase, { userId, triagemId: data.triagemId, nome: data.nome });
  });

/** Camada B item 3 — resumo de contexto de call, se o lead veio do Scan. */
export const lerTriagemDoLead = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    return obterTriagemDoLead(supabase, { leadId: data.leadId });
  });

/** Camada C — sugestão explicável de trilha, nunca veredito jurídico. */
export const listarSugestoesTrilha = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadId: string; trilhasAtivas: readonly TrilhaAtiva[] }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    return sugerirTrilhasParaLead(supabase, { leadId: data.leadId, trilhasAtivas: data.trilhasAtivas });
  });

/** Camada C — aceitar nunca sobrescreve trilha humana já escolhida. */
export const aceitarSugestaoDeTrilha = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadId: string; trackId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    return aceitarSugestaoTrilha(supabase, { userId, leadId: data.leadId, trackId: data.trackId });
  });

/** Camada C — rejeitar exige motivo; nunca cria/altera caso. */
export const rejeitarSugestaoDeTrilha = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadId: string; trackId: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    return rejeitarSugestaoTrilha(supabase, { userId, leadId: data.leadId, trackId: data.trackId, motivo: data.motivo });
  });
