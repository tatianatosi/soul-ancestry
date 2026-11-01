/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Corte 1 (01/10/2026) — **o único escritor de evidência do sistema.**
 *
 * Decisão da Proprietária: módulo canônico; as rotas só chamam. Antes havia
 * cinco escritores em duas tabelas, e só um aplicava o grafo de transição.
 * Aqui toda gravação passa pelo mesmo caminho: valida → grava com releitura →
 * audita → registra na timeline do caso.
 *
 * Tabela canônica: `research_evidence_items` (regras em `evidencia-canonica.ts`).
 *
 * Corte 0 (01/10/2026): o corpo saiu para `evidencia-canonica.server.ts`. Este
 * arquivo é só a casca HTTP; os escritores antigos chamam o mesmo núcleo, em
 * vez de recusar a gravação — que era o defeito deixado pelo Corte 1a.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE } from "@/lib/pesquisa-modulo.server";
import { semCache } from "@/lib/no-store";
import { estadoFinoDaLinha } from "@/lib/evidencia-canonica";
import {
  areaDePesquisaDoCaso,
  arquivarEvidenciaCanonicaCore,
  gravarEvidenciaCanonica,
  mudarSituacaoEvidenciaCanonica,
} from "@/lib/evidencia-canonica.server";

/**
 * Mesmo gate de papel que o resto do módulo de pesquisa usa (`PAPEIS_EDITA` /
 * `PAPEIS_LE_DETALHE`). Antes esta camada só pedia sessão: quem a chamasse
 * escrevia evidência sem passar pelo gate de papel que as telas já tinham.
 */
async function organizacaoComPapel(
  supabase: any,
  userId: string,
  permitidos: string[],
  acao: string,
): Promise<string> {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  if (!permitidos.includes(papel)) throw new Error(`Seu papel não pode ${acao}.`);
  return organizationId;
}

/** As evidências do caso, com o estado fino já resolvido. */
export const listarEvidenciasDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!data?.caseId) throw new Error("Caso não informado.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoComPapel(
      supabase,
      context.userId as string,
      PAPEIS_LE_DETALHE,
      "ler as evidências do caso",
    );
    const researchCaseId = await areaDePesquisaDoCaso(supabase, organizationId, data.caseId);
    const { data: linhas, error } = await supabase
      .from("research_evidence_items")
      .select(
        "id,title,description,evidence_type,evidence_status,workflow_status,source_id,person_id,confidence_level,client_visibility,updated_at",
      )
      .eq("organization_id", organizationId)
      .eq("research_case_id", researchCaseId)
      .is("archived_at", null)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((linhas ?? []) as Record<string, unknown>[]).map((l) => ({
      ...l,
      situacao: estadoFinoDaLinha(l as { workflow_status?: unknown; evidence_status?: unknown }),
    }));
  });

/**
 * Cria ou atualiza evidência. Situação nasce no primeiro estado do grafo e só
 * muda por `mudarSituacaoEvidencia`, que exige justificativa e respeita o grafo.
 */
export const salvarEvidenciaCanonica = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      caseId: string;
      id?: string | null;
      titulo: string;
      tipo: string;
      descricao?: string | null;
      fonteId?: string | null;
      pessoaId?: string | null;
      origem?: string | null;
    }) => {
      if (!data?.caseId) throw new Error("Caso é obrigatório.");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoComPapel(
      supabase,
      context.userId as string,
      PAPEIS_EDITA,
      "registrar evidência",
    );
    return gravarEvidenciaCanonica(supabase, context.userId as string, organizationId, data);
  });

/**
 * Muda a situação pelo grafo. Exige autor, justificativa e origem — a mesma
 * regra que antes valia em um só dos cinco escritores.
 */
export const mudarSituacaoEvidencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      caseId?: string | null;
      id: string;
      para: string;
      justificativa: string;
      origem: string;
    }) => {
      if (!data?.id) throw new Error("Evidência é obrigatória.");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoComPapel(
      supabase,
      context.userId as string,
      PAPEIS_EDITA,
      "mudar a situação de evidência",
    );
    return mudarSituacaoEvidenciaCanonica(supabase, context.userId as string, organizationId, data);
  });

/** Arquiva com motivo. Nunca apaga. */
export const arquivarEvidenciaCanonica = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId?: string | null; id: string; motivo: string }) => {
    if ((data?.motivo ?? "").trim().length < 5)
      throw new Error("Informe o motivo (mínimo 5 letras) para arquivar a evidência.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoComPapel(
      supabase,
      context.userId as string,
      PAPEIS_EDITA,
      "arquivar evidência",
    );
    return arquivarEvidenciaCanonicaCore(supabase, context.userId as string, organizationId, data);
  });
