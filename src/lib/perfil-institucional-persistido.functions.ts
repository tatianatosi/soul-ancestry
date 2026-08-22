import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  deveCriarSnapshotInstitucional,
  montarPayloadInstitucional,
  pendenciasConfiguracao,
  violacoesDoPayload,
} from "@/lib/perfil-institucional-persistido";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Leitura da versão institucional persistida da organização do usuário. */
export const lerPerfilInstitucionalPersistido = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as any).supabase;
    const { data, error } = await supabase
      .from("institutional_profiles")
      .select("id,organization_id,versao,status,campos,whatsapp_configurado,created_at,updated_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const registro = (data ?? [])[0] ?? null;
    const payload = registro
      ? {
          versao: registro.versao as string,
          status: registro.status as string,
          campos: (registro.campos ?? []) as { campo: string; rotulo: string; valor: string }[],
          whatsapp_configurado: !!registro.whatsapp_configurado,
        }
      : montarPayloadInstitucional(false);

    return {
      persistido: !!registro,
      registroId: (registro?.id ?? null) as string | null,
      payload,
      violacoes: violacoesDoPayload(payload),
      pendencias: pendenciasConfiguracao(payload),
      editavelPeloCaso: false,
      habilitaAssinatura: false,
    };
  });

/** Registra (ou reaproveita) a versão institucional vigente da organização. */
export const registrarPerfilInstitucional = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { organizationId: string; whatsappConfigurado?: boolean }) => data)
  .handler(async ({ context, data }) => {
    const supabase = (context as any).supabase;
    const payload = montarPayloadInstitucional(!!data.whatsappConfigurado);
    const violacoes = violacoesDoPayload(payload);
    if (violacoes.length) throw new Error(violacoes[0]);

    const { data: existente, error: erroLeitura } = await supabase
      .from("institutional_profiles")
      .select("id")
      .eq("organization_id", data.organizationId)
      .eq("versao", payload.versao)
      .maybeSingle();
    if (erroLeitura) throw new Error(erroLeitura.message);
    if (existente?.id) {
      return { id: existente.id as string, criado: false, pendencias: pendenciasConfiguracao(payload) };
    }

    const { data: inserido, error } = await supabase
      .from("institutional_profiles")
      .insert({
        organization_id: data.organizationId,
        versao: payload.versao,
        status: payload.status,
        campos: payload.campos,
        whatsapp_configurado: payload.whatsapp_configurado,
        created_by: (context as any).userId,
        updated_by: (context as any).userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("institutional_profile_events").insert({
      organization_id: data.organizationId,
      profile_id: inserido.id,
      evento: "perfil_institucional_registrado",
      detalhe: `Versão ${payload.versao} registrada em revisão jurídica.`,
      payload: { versao: payload.versao, status: payload.status },
      created_by: (context as any).userId,
    });

    return { id: inserido.id as string, criado: true, pendencias: pendenciasConfiguracao(payload) };
  });

/**
 * Grava o snapshot institucional em uma versão contratual existente.
 * Só grava em evento de governança aplicável e nunca sobrescreve snapshot anterior.
 */
export const registrarSnapshotInstitucional = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contractVersionId: string; evento: string }) => data)
  .handler(async ({ context, data }) => {
    const supabase = (context as any).supabase;

    const { data: versao, error: erroVersao } = await supabase
      .from("contract_versions")
      .select("id,organization_id,institutional_profile_snapshot")
      .eq("id", data.contractVersionId)
      .maybeSingle();
    if (erroVersao) throw new Error(erroVersao.message);
    if (!versao) throw new Error("Versão contratual não encontrada.");

    const decisao = deveCriarSnapshotInstitucional(data.evento, !!versao.institutional_profile_snapshot);
    if (!decisao.criar) return { gravado: false, motivo: decisao.motivo };

    const { data: perfil, error: erroPerfil } = await supabase
      .from("institutional_profiles")
      .select("id,versao,status,campos,whatsapp_configurado")
      .eq("organization_id", versao.organization_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (erroPerfil) throw new Error(erroPerfil.message);
    if (!perfil) return { gravado: false, motivo: "Nenhuma versão institucional persistida para snapshot." };

    const { error } = await supabase
      .from("contract_versions")
      .update({
        institutional_profile_id: perfil.id,
        institutional_profile_snapshot: {
          versao: perfil.versao,
          status: perfil.status,
          campos: perfil.campos,
          whatsapp_configurado: !!perfil.whatsapp_configurado,
          evento: data.evento,
          capturado_em: new Date().toISOString(),
        },
      })
      .eq("id", data.contractVersionId)
      .is("institutional_profile_snapshot", null);
    if (error) throw new Error(error.message);

    await supabase.from("institutional_profile_events").insert({
      organization_id: versao.organization_id,
      profile_id: perfil.id,
      evento: "snapshot_institucional_registrado",
      detalhe: `Snapshot vinculado à versão contratual ${data.contractVersionId} pelo evento ${data.evento}.`,
      payload: { contract_version_id: data.contractVersionId, evento: data.evento, versao: perfil.versao },
      created_by: (context as any).userId,
    });

    return { gravado: true, motivo: decisao.motivo };
  });
