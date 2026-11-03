import { decidirAcao } from "@/lib/autoridade-operacional";
import { CAPACIDADES_PROPRIETARIA } from "@/lib/modo-proprietaria";
import { bloqueioDoCaso, estadoDoLink, type CasoPortal } from "@/lib/portal-elegibilidade";

export type MembroConferencia = {
  id: string; organization_id: string; auth_user_id: string | null;
  role: string; status: string; demo?: boolean | null;
};
export type PapelRegistrado = { user_id: string; organization_id: string; role: string; archived_at?: string | null };

/** Projection only: no grant, role assignment, impersonation or write. */
export function conferirMembro(membro: MembroConferencia, papeis: readonly PapelRegistrado[]) {
  const registrados = papeis.filter(p => p.organization_id === membro.organization_id &&
    p.user_id === membro.auth_user_id && !p.archived_at).map(p => p.role);
  const ativo = membro.status === "active" && Boolean(membro.auth_user_id) && !membro.demo;
  const efetivos = ativo ? [...new Set([membro.role, ...registrados])] : [];
  const contexto = { papeis: efetivos, organizationId: ativo ? membro.organization_id : null };
  return {
    registrados, efetivos, organizationId: contexto.organizationId,
    operacoes: CAPACIDADES_PROPRIETARIA.map(capacidade => ({ capacidade, ...decidirAcao(contexto, { capacidade }) })),
  };
}

export function exigirLeitura<T>(resultado: { data: T | null; error: { message: string } | null }, recurso: string): T {
  if (resultado.error) throw new Error(`Não foi possível carregar ${recurso}: ${resultado.error.message}`);
  if (resultado.data === null) throw new Error(`Leitura de ${recurso} não retornou dados.`);
  return resultado.data;
}

export type AcessoConferencia = {
  id: string; client_id: string | null; auth_user_id?: string | null;
  access_status: string; access_level: string; authorized_email_id?: string | null;
  is_demo?: boolean | null; first_authenticated_at?: string | null; last_authenticated_at?: string | null;
  invited_at?: string | null; invitation_expires_at?: string | null; magic_link_expires_at?: string | null;
  magic_link_uses?: number | null; magic_link_max_uses?: number | null;
};
export type VinculoConferencia = { id?: string; case_id: string; client_portal_access_id: string; access_status: string };

/** Registered scope is not proof of login or successful RLS reads as that client. */
export function conferirCasoDoAcesso(acesso: AcessoConferencia, vinculo: VinculoConferencia, caso?: CasoPortal) {
  const motivos: string[] = [];
  if (acesso.is_demo || caso?.demo) motivos.push("Registro de demonstração — fora da conferência real");
  if (!acesso.client_id || !acesso.auth_user_id) motivos.push("Identidade vinculada incompleta");
  if (acesso.access_status !== "active") motivos.push("Acesso do cliente ainda não está ativo");
  if (vinculo.client_portal_access_id !== acesso.id || vinculo.access_status !== "active") motivos.push("Vínculo do caso não está ativo");
  if (!caso || caso.id !== vinculo.case_id) motivos.push("Caso não encontrado nesta leitura");
  else if (caso.app_access_status !== "liberado") motivos.push("Caso não liberado no App");
  return {
    escopoAtivo: motivos.length === 0, motivos,
    elegibilidade: caso ? bloqueioDoCaso(caso) : null,
    link: estadoDoLink(acesso),
    loginRegistrado: Boolean(acesso.first_authenticated_at),
  };
}