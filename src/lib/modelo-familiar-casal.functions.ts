import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  MODELO_FAMILIAR_CASAL_AUTOR,
  MODELO_FAMILIAR_CASAL_BASE,
  MODELO_FAMILIAR_CASAL_FINALIDADE,
  MODELO_FAMILIAR_CASAL_FONTE,
  MODELO_FAMILIAR_CASAL_ID,
  MODELO_FAMILIAR_CASAL_NOME,
  MODELO_FAMILIAR_CASAL_STATUS,
  MODELO_FAMILIAR_CASAL_VERSAO,
} from "@/lib/modelo-familiar-casal";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Registro versionado do modelo familiar de composição contratual.
 * Somente governança interna: não cria contrato, proposta, OS, assinatura,
 * cobrança, procuração, pesquisa externa, portal ou comunicação.
 */

async function orgDoUsuario(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}

export const lerRegistroModeloFamiliarCasal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;

    const { data: modelo, error } = await supabase
      .from("composition_templates")
      .select("id,template_key,nome,versao,status,finalidade,fonte,base_contratual,autor,criado_em")
      .eq("template_key", MODELO_FAMILIAR_CASAL_ID)
      .eq("versao", MODELO_FAMILIAR_CASAL_VERSAO)
      .is("archived_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);

    if (!modelo) return { modelo: null, eventos: [] as any[] };

    const { data: eventos } = await supabase
      .from("composition_template_events")
      .select("id,evento,detalhe,criado_em")
      .eq("template_id", modelo.id)
      .order("criado_em", { ascending: false })
      .limit(20);

    return { modelo, eventos: eventos ?? [] };
  });

export const registrarModeloFamiliarCasal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);

    const { data: existente } = await supabase
      .from("composition_templates")
      .select("id")
      .eq("organization_id", organization_id)
      .eq("template_key", MODELO_FAMILIAR_CASAL_ID)
      .eq("versao", MODELO_FAMILIAR_CASAL_VERSAO)
      .maybeSingle();
    if (existente) return { id: existente.id as string, novo: false };

    const { data: criado, error } = await supabase
      .from("composition_templates")
      .insert({
        organization_id,
        template_key: MODELO_FAMILIAR_CASAL_ID,
        nome: MODELO_FAMILIAR_CASAL_NOME,
        versao: MODELO_FAMILIAR_CASAL_VERSAO,
        status: MODELO_FAMILIAR_CASAL_STATUS,
        finalidade: MODELO_FAMILIAR_CASAL_FINALIDADE,
        fonte: MODELO_FAMILIAR_CASAL_FONTE,
        base_contratual: MODELO_FAMILIAR_CASAL_BASE,
        autor: MODELO_FAMILIAR_CASAL_AUTOR,
        criado_por: userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("composition_template_events").insert({
      organization_id,
      template_id: criado.id,
      evento: "template_registrado",
      detalhe: `${MODELO_FAMILIAR_CASAL_NOME} ${MODELO_FAMILIAR_CASAL_VERSAO} · ${MODELO_FAMILIAR_CASAL_STATUS}`,
      ator: userId,
    });

    return { id: criado.id as string, novo: true };
  });
