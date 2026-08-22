/**
 * Camada servidor do Perfil Institucional persistido.
 *
 * Responsabilidades:
 *  - garantir a versão institucional persistida da organização (idempotente);
 *  - registrar eventos append-only de governança institucional;
 *  - gravar o snapshot institucional na versão contratual, sem sobrescrever.
 *
 * Nada aqui executa ação externa nem altera dados operacionais do caso.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  deveCriarSnapshotInstitucional,
  montarPayloadInstitucional,
  violacoesDoPayload,
  type PayloadPerfilInstitucional,
} from "@/lib/perfil-institucional-persistido";

type Sb = any;

export type PerfilInstitucionalPersistido = {
  id: string;
  versao: string;
  status: string;
  campos: { campo: string; rotulo: string; valor: string }[];
  whatsapp_configurado: boolean;
};

/** Registra o evento append-only do perfil institucional (nunca falha o fluxo chamador). */
export async function registrarEventoInstitucional(
  supabase: Sb,
  input: { org: string; profileId: string; evento: string; detalhe: string; payload: Record<string, unknown>; userId?: string | null },
) {
  const { error } = await supabase.from("institutional_profile_events").insert({
    organization_id: input.org,
    profile_id: input.profileId,
    evento: input.evento,
    detalhe: input.detalhe,
    payload: input.payload,
    created_by: input.userId ?? null,
  });
  return { registrado: !error, motivo: error?.message ?? null };
}

/**
 * Garante que a organização tenha a versão institucional vigente persistida.
 * Idempotente por (organização, versão): nunca duplica nem sobrescreve.
 */
export async function garantirPerfilInstitucional(
  supabase: Sb,
  input: { org: string; userId?: string | null; whatsappConfigurado?: boolean },
): Promise<{ perfil: PerfilInstitucionalPersistido | null; criado: boolean; motivo: string }> {
  const payload: PayloadPerfilInstitucional = montarPayloadInstitucional(!!input.whatsappConfigurado);
  const violacoes = violacoesDoPayload(payload);
  if (violacoes.length) return { perfil: null, criado: false, motivo: violacoes[0] };

  const { data: existente } = await supabase
    .from("institutional_profiles")
    .select("id,versao,status,campos,whatsapp_configurado")
    .eq("organization_id", input.org)
    .eq("versao", payload.versao)
    .maybeSingle();
  if (existente?.id) {
    return { perfil: existente as PerfilInstitucionalPersistido, criado: false, motivo: "Versão institucional já persistida." };
  }

  const { data: inserido, error } = await supabase
    .from("institutional_profiles")
    .insert({
      organization_id: input.org,
      versao: payload.versao,
      status: payload.status,
      campos: payload.campos,
      whatsapp_configurado: payload.whatsapp_configurado,
      created_by: input.userId ?? null,
      updated_by: input.userId ?? null,
    })
    .select("id,versao,status,campos,whatsapp_configurado")
    .maybeSingle();
  if (error || !inserido) return { perfil: null, criado: false, motivo: error?.message ?? "Falha ao persistir perfil institucional." };

  await registrarEventoInstitucional(supabase, {
    org: input.org,
    profileId: inserido.id,
    evento: "perfil_institucional_registrado",
    detalhe: `Versão ${payload.versao} registrada em ${payload.status}.`,
    payload: { versao: payload.versao, status: payload.status },
    userId: input.userId ?? null,
  });

  return { perfil: inserido as PerfilInstitucionalPersistido, criado: true, motivo: "Versão institucional registrada." };
}

/**
 * Grava o snapshot institucional na versão contratual em evento de governança
 * aplicável. Nunca sobrescreve snapshot anterior.
 */
export async function gravarSnapshotInstitucional(
  supabase: Sb,
  input: { org: string; contractVersionId: string; evento: string; userId?: string | null },
): Promise<{ gravado: boolean; motivo: string }> {
  const { data: versao } = await supabase
    .from("contract_versions")
    .select("id,institutional_profile_snapshot")
    .eq("organization_id", input.org)
    .eq("id", input.contractVersionId)
    .maybeSingle();
  if (!versao) return { gravado: false, motivo: "Versão contratual não encontrada." };

  const decisao = deveCriarSnapshotInstitucional(input.evento, !!versao.institutional_profile_snapshot);
  if (!decisao.criar) return { gravado: false, motivo: decisao.motivo };

  const { perfil } = await garantirPerfilInstitucional(supabase, { org: input.org, userId: input.userId ?? null });
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
        evento: input.evento,
        capturado_em: new Date().toISOString(),
      },
    })
    .eq("organization_id", input.org)
    .eq("id", input.contractVersionId)
    .is("institutional_profile_snapshot", null);
  if (error) return { gravado: false, motivo: error.message };

  await registrarEventoInstitucional(supabase, {
    org: input.org,
    profileId: perfil.id,
    evento: "snapshot_institucional_registrado",
    detalhe: `Snapshot vinculado à versão contratual ${input.contractVersionId} pelo evento ${input.evento}.`,
    payload: { contract_version_id: input.contractVersionId, evento: input.evento, versao: perfil.versao },
    userId: input.userId ?? null,
  });

  return { gravado: true, motivo: decisao.motivo };
}
