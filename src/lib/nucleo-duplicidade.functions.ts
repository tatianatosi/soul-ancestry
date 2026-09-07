import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { detectarDuplicidades, type NucleoParaComparar } from "@/lib/nucleo-duplicidade";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Fase 1 (Detecção) do prompt canônico "Unificação controlada de núcleos
 * familiares". Carrega os núcleos ativos da organização, junto com seus
 * requerentes e o caso vinculado, e roda `detectarDuplicidades` sobre eles.
 *
 * Não decide, não funde, não persiste nada — ver `nucleo-duplicidade.ts`.
 * As Fases 2 a 6 (comparação assistida, plano de unificação, confirmação da
 * proprietária, execução atômica e validação pós-merge) dependem de colunas
 * que ainda não existem no schema (ex.: `nucleo_canonico_id`, `unificado_em`,
 * `unificado_por`, status `mesclado`) e ficam fora deste corte.
 */
export const listarCandidatosDuplicidadeNucleo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;

    const { data: nucleos, error } = await supabase
      .from("nucleos_familiares")
      .select(
        "id,case_id,nome,dossie_mae,contratante_nome,dossie_status,status,created_at,updated_at",
      )
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = ((nucleos ?? []) as any[]).map((n) => n.id);
    const caseIds = Array.from(new Set(((nucleos ?? []) as any[]).map((n) => n.case_id).filter(Boolean)));

    const [{ data: membros }, { data: casos }] = await Promise.all([
      ids.length
        ? supabase.from("nucleo_membros").select("nucleo_id,nome,papel").in("nucleo_id", ids).is("archived_at", null)
        : Promise.resolve({ data: [] }),
      caseIds.length
        ? supabase.from("crm_casos").select("id,codigo,titulo,pais").in("id", caseIds)
        : Promise.resolve({ data: [] }),
    ]);

    const porCaso = new Map(((casos ?? []) as any[]).map((c) => [c.id, c]));

    const paraComparar: NucleoParaComparar[] = ((nucleos ?? []) as any[]).map((n) => ({
      id: n.id,
      nome: n.nome,
      dossie_mae: n.dossie_mae,
      contratante_nome: n.contratante_nome,
      dossie_status: n.dossie_status,
      status: n.status,
      created_at: n.created_at,
      updated_at: n.updated_at,
      case_id: n.case_id,
      caso: n.case_id ? (porCaso.get(n.case_id) ?? null) : null,
      membros: ((membros ?? []) as any[])
        .filter((m) => m.nucleo_id === n.id)
        .map((m) => ({ nome: m.nome, papel: m.papel })),
    }));

    return detectarDuplicidades(paraComparar);
  });
