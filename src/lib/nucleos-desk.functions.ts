import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */

const UUID = /^[0-9a-f-]{36}$/i;

export const NUCLEO_AMBIENTES = [
  "drive_clube_ancestral",
  "desk_intelligence",
  "acervo_interno",
] as const;

export const NUCLEO_NIVEIS_ACESSO = ["restrito", "equipe", "coordenacao"] as const;

export const NUCLEO_DOSSIE_STATUS = ["nao_iniciado", "em_preparacao", "ativo", "arquivado"] as const;

export const NUCLEO_PAPEIS = [
  "contratante_signatario",
  "requerente",
  "dependente",
  "referencia_genealogica",
] as const;

/** Lista os núcleos familiares da organização com requerentes vinculados. */
export const listarNucleos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;

    const { data: nucleos, error } = await supabase
      .from("nucleos_familiares")
      .select(
        "id,case_id,nome,descricao,dossie_mae,contratante_nome,ambiente,nivel_acesso,link_interno,responsavel_nome,dossie_status,created_at",
      )
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = (nucleos ?? []).map((n: any) => n.id);
    const caseIds = Array.from(new Set((nucleos ?? []).map((n: any) => n.case_id).filter(Boolean)));

    const [{ data: membros }, { data: casos }] = await Promise.all([
      ids.length
        ? supabase
            .from("nucleo_membros")
            .select("id,nucleo_id,nome,papel,vinculo,processo,ordem,cliente_id")
            .in("nucleo_id", ids)
            .is("archived_at", null)
            .order("ordem")
        : Promise.resolve({ data: [] }),
      caseIds.length
        ? supabase.from("crm_casos").select("id,codigo,titulo,demo").in("id", caseIds)
        : Promise.resolve({ data: [] }),
    ]);

    const porCaso = new Map((casos ?? []).map((c: any) => [c.id, c]));

    return (nucleos ?? []).map((n: any) => ({
      ...n,
      caso: n.case_id ? (porCaso.get(n.case_id) ?? null) : null,
      membros: (membros ?? []).filter((m: any) => m.nucleo_id === n.id),
    }));
  });

/** Atualiza o cadastro do dossiê-mãe de um núcleo. Campos classificatórios são listas fechadas. */
export const salvarDossieNucleo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    nucleoId: string;
    dossie_mae: string;
    ambiente: string;
    nivel_acesso: string;
    link_interno: string;
    responsavel_nome: string;
    dossie_status: string;
  }) => {
    if (!UUID.test(data?.nucleoId ?? "")) throw new Error("Núcleo inválido.");
    if (data.ambiente && !(NUCLEO_AMBIENTES as readonly string[]).includes(data.ambiente)) {
      throw new Error("Ambiente autorizado fora da lista controlada.");
    }
    if (data.nivel_acesso && !(NUCLEO_NIVEIS_ACESSO as readonly string[]).includes(data.nivel_acesso)) {
      throw new Error("Nível de acesso fora da lista controlada.");
    }
    if (!(NUCLEO_DOSSIE_STATUS as readonly string[]).includes(data.dossie_status)) {
      throw new Error("Situação do dossiê fora da lista controlada.");
    }
    if (data.link_interno && !/^https?:\/\//i.test(data.link_interno)) {
      throw new Error("O link interno deve ser uma URL válida.");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;

    const patch = {
      dossie_mae: data.dossie_mae?.trim() || null,
      ambiente: data.ambiente || null,
      nivel_acesso: data.nivel_acesso || null,
      link_interno: data.link_interno?.trim() || null,
      responsavel_nome: data.responsavel_nome?.trim() || null,
      dossie_status: data.dossie_status,
    };

    const { data: salvo, error } = await supabase
      .from("nucleos_familiares")
      .update(patch)
      .eq("id", data.nucleoId)
      .select("id,dossie_mae,ambiente,nivel_acesso,link_interno,responsavel_nome,dossie_status")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!salvo) throw new Error("Núcleo não encontrado ou sem permissão de escrita.");

    // Verificação pós-gravação: o dado precisa estar realmente persistido.
    for (const [campo, valor] of Object.entries(patch)) {
      if ((salvo as any)[campo] !== valor) {
        throw new Error(`O campo ${campo} não foi persistido. Nenhuma alteração foi confirmada.`);
      }
    }
    return salvo;
  });
