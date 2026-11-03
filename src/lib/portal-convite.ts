/**
 * Gravação do convite do portal em duas tabelas (client_portal_access e
 * client_portal_case_access) sem transação.
 *
 * Sem esta proteção, se o 2º insert falhava a linha de client_portal_access
 * ficava órfã e o índice único `client_portal_access_ativo_unico`
 * (organization_id, client_id, email onde archived_at is null e status <> revoked)
 * bloqueava o reconvite. Regras:
 * - 2ª gravação falhou e a 1ª foi criada agora: arquiva a 1ª com motivo (sem
 *   exclusão física) e relança o erro original;
 * - reconvite com linha órfã (acesso de workspace sem vínculo de caso): reaproveita
 *   a linha existente em vez de bater no índice único;
 * - caso demo só recebe acesso demo, e caso real só acesso real.
 *
 * Módulo puro (cliente Supabase injetado): sem imports de servidor.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

export const MOTIVO_ARQUIVO_CONVITE_INCOMPLETO =
  "convite_incompleto: vínculo de caso não gravado; linha arquivada automaticamente";

/** Caso real não aceita acesso demo e caso demo não aceita acesso real. */
export function erroDemoIncompativel(
  casoDemo: boolean | null | undefined,
  acessoDemo: boolean,
): string | null {
  const demo = casoDemo === true;
  if (demo === acessoDemo) return null;
  return demo
    ? "Caso de demonstração só pode receber acesso de demonstração."
    : "Caso real não pode receber acesso de demonstração (nem o inverso).";
}

export type ParametrosConvite = {
  organizationId: string;
  userId: string;
  clientId: string;
  email: string;
  nivel: "proposal_portal" | "client_workspace";
  finalidade: string | null;
  autorizacaoId: string;
  isDemo: boolean;
  casoId: string | null;
  agora: Date;
  expira: Date;
};

export async function gravarConvitePortal(
  supabase: any,
  p: ParametrosConvite,
): Promise<{ acessoId: string; reaproveitado: boolean }> {
  const campos = {
    access_status: "invited",
    finalidade: p.finalidade,
    authorized_email_id: p.autorizacaoId,
    is_demo: p.isDemo,
    invited_at: p.agora.toISOString(),
    invited_by: p.userId,
    invitation_expires_at: p.expira.toISOString(),
    magic_link_expires_at: p.expira.toISOString(),
    magic_link_uses: 0,
    magic_link_max_uses: 1,
  };

  // Reconvite: linha ativa de workspace sem nenhum vínculo de caso é órfã de um
  // convite que falhou no meio; reaproveita em vez de colidir com o índice único.
  let acessoId: string | null = null;
  let reaproveitado = false;
  if (p.casoId) {
    const existente = await supabase
      .from("client_portal_access")
      .select("id, access_level, access_status, is_demo")
      .eq("organization_id", p.organizationId)
      .eq("client_id", p.clientId)
      .eq("email", p.email)
      .is("archived_at", null)
      .neq("access_status", "revoked")
      .maybeSingle();
    const linha = existente?.data;
    if (linha && linha.access_level === p.nivel && !!linha.is_demo === p.isDemo) {
      const vinculos = await supabase
        .from("client_portal_case_access")
        .select("id")
        .eq("client_portal_access_id", linha.id);
      if (vinculos.error) throw new Error(vinculos.error.message);
      if (!vinculos.data || vinculos.data.length === 0) {
        const atualizado = await supabase
          .from("client_portal_access")
          .update(campos)
          .eq("id", linha.id);
        if (atualizado?.error) throw new Error(atualizado.error.message);
        acessoId = linha.id as string;
        reaproveitado = true;
      }
    }
  }

  if (!acessoId) {
    const inserido = await supabase
      .from("client_portal_access")
      .insert({
        organization_id: p.organizationId,
        client_id: p.clientId,
        email: p.email,
        access_level: p.nivel,
        ...campos,
      })
      .select("id")
      .maybeSingle();
    if (inserido.error) throw new Error(inserido.error.message);
    acessoId = inserido.data.id as string;
  }

  if (p.casoId) {
    const vinculo = await supabase.from("client_portal_case_access").insert({
      organization_id: p.organizationId,
      client_portal_access_id: acessoId,
      case_id: p.casoId,
    });
    if (vinculo.error) {
      // Sem transação: desfaz só o que criamos agora, sem exclusão física.
      if (!reaproveitado) {
        await supabase
          .from("client_portal_access")
          .update({
            archived_at: new Date().toISOString(),
            archived_by: p.userId,
            archive_motivo: MOTIVO_ARQUIVO_CONVITE_INCOMPLETO,
          })
          .eq("id", acessoId);
      }
      throw new Error(vinculo.error.message);
    }
  }

  return { acessoId, reaproveitado };
}
