import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { contextoRg } from "@/lib/pesquisa-modulo.server";
import {
  deveCriarSnapshotInstitucional,
  montarPayloadInstitucional,
  pendenciasConfiguracao,
  violacoesDoPayload,
} from "@/lib/perfil-institucional-persistido";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Quem pode registrar perfil/snapshot institucional (religação de 31/10/2026). */
const PAPEIS_PERFIL_INSTITUCIONAL = ["admin", "operacoes"];

/** Organização da sessão + papel; recusa quem não pode gravar o perfil institucional. */
async function organizacaoDeQuemGrava(supabase: any, userId: string): Promise<string> {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  if (!PAPEIS_PERFIL_INSTITUCIONAL.includes(papel)) {
    throw new Error("Seu papel não pode registrar o perfil institucional.");
  }
  return organizationId;
}

/**
 * CA12-PERFIL (09/09/2026) — leitura sem `.eq("organization_id", ...)`
 * devolvia o registro mais recente de QUALQUER organização, nunca
 * necessariamente o da sessão chamadora. Corrigido para escopar pela
 * organização do usuário autenticado, igual a todo escritor deste módulo.
 */
export const lerPerfilInstitucionalPersistido = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, (context as any).userId);
    const { data, error } = await supabase
      .from("institutional_profiles")
      .select("id,organization_id,versao,status,campos,whatsapp_configurado,created_at,updated_at")
      .eq("organization_id", organizationId)
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

/**
 * CA12-PERFIL (09/09/2026) — registra (ou reaproveita, idempotente) a versão
 * institucional vigente da organização da sessão chamadora. `garantirPerfilInstitucional`
 * e `registrarPerfilInstitucional` já existiam com essa mesma regra, mas
 * nenhuma tela os chamava: a organização podia nunca ter um perfil
 * institucional persistido, e nada avisava disso. Este wrapper existe só
 * para não obrigar o cliente a descobrir e enviar seu próprio organization_id
 * — o mesmo dado que todo outro escritor deste módulo já deriva no servidor.
 */
export const garantirPerfilInstitucionalDaSessao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, (context as any).userId);
    const { garantirPerfilInstitucional } = await import("@/lib/perfil-institucional-persistido.server");
    const r = await garantirPerfilInstitucional(supabase, { org: organizationId, userId: (context as any).userId });
    if (!r.perfil) throw new Error(r.motivo);
    return r;
  });

/** Registra (ou reaproveita) a versão institucional vigente da organização. */
export const registrarPerfilInstitucional = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { whatsappConfigurado?: boolean }) => data)
  .handler(async ({ context, data }) => {
    const supabase = (context as any).supabase;
    // A organização vem da sessão, nunca do cliente (religação 31/10/2026).
    const organizationId = await organizacaoDeQuemGrava(supabase, (context as any).userId);
    const payload = montarPayloadInstitucional(!!data.whatsappConfigurado);
    const violacoes = violacoesDoPayload(payload);
    if (violacoes.length) throw new Error(violacoes[0]);

    const { data: existente, error: erroLeitura } = await supabase
      .from("institutional_profiles")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("versao", payload.versao)
      .maybeSingle();
    if (erroLeitura) throw new Error(erroLeitura.message);
    if (existente?.id) {
      return { id: existente.id as string, criado: false, pendencias: pendenciasConfiguracao(payload) };
    }

    const { data: inserido, error } = await supabase
      .from("institutional_profiles")
      .insert({
        organization_id: organizationId,
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
      organization_id: organizationId,
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
    const organizationId = await organizacaoDeQuemGrava(supabase, (context as any).userId);

    const { data: versao, error: erroVersao } = await supabase
      .from("contract_versions")
      .select("id,organization_id,institutional_profile_snapshot")
      .eq("id", data.contractVersionId)
      .eq("organization_id", organizationId)
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

    const { data: linhaAtualizada, error } = await supabase
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
      .is("institutional_profile_snapshot", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!linhaAtualizada?.id) {
      return { gravado: false, motivo: "Snapshot já registrado nesta versão contratual (condição de corrida)." };
    }

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
