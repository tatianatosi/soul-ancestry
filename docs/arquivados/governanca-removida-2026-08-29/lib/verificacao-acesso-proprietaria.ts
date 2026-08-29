/**
 * Verificação de acesso da Proprietária Administradora.
 *
 * Camada pura (sem I/O): recebe o retrato lido do banco e decide se o acesso
 * continua íntegro após a restauração lógica da organização.
 *
 * Regras verificadas:
 * - a conta existe e é única (um único perfil para o e-mail);
 * - a organização canônica está ativa (sem arquivamento lógico);
 * - o vínculo (membership) está ativo;
 * - o papel `admin` está persistido na organização canônica;
 * - o cadastro de equipe está `active` e não arquivado.
 */

export const EMAIL_PROPRIETARIA = "tati@pluggedresearch.com";
export const ORGANIZACAO_CANONICA_ID = "11f32aae-ea08-47e0-8114-f5d8a900c9a1";
export const ORGANIZACAO_CANONICA_SLUG = "clube-ancestral";

export type RetratoAcesso = {
  perfis: { id: string; email: string }[];
  organizacao: { id: string; slug: string; archived_at: string | null } | null;
  memberships: { organization_id: string; user_id: string; archived_at: string | null }[];
  papeis: { organization_id: string; user_id: string; role: string }[];
  staff: { organization_id: string; auth_user_id: string | null; status: string; role: string; archived_at: string | null }[];
};

export type ItemVerificacao = {
  chave: string;
  titulo: string;
  aprovado: boolean;
  detalhe: string;
};

export type ResultadoVerificacao = {
  aprovado: boolean;
  userId: string | null;
  itens: ItemVerificacao[];
};

function normalizar(email: string) {
  return String(email ?? "").trim().toLowerCase();
}

export function verificarAcessoProprietaria(retrato: RetratoAcesso): ResultadoVerificacao {
  const perfis = (retrato.perfis ?? []).filter((p) => normalizar(p.email) === EMAIL_PROPRIETARIA);
  const userId = perfis.length === 1 ? perfis[0]!.id : null;
  const itens: ItemVerificacao[] = [];

  itens.push({
    chave: "conta_unica",
    titulo: "Conta única para o e-mail da proprietária",
    aprovado: perfis.length === 1,
    detalhe: `${perfis.length} perfil(is) encontrado(s)`,
  });

  const org = retrato.organizacao;
  itens.push({
    chave: "organizacao_ativa",
    titulo: "Organização Clube Ancestral ativa",
    aprovado:
      !!org && org.id === ORGANIZACAO_CANONICA_ID && org.slug === ORGANIZACAO_CANONICA_SLUG && org.archived_at === null,
    detalhe: !org
      ? "organização não encontrada"
      : org.archived_at
        ? `arquivada em ${org.archived_at}`
        : "ativa e sem arquivamento lógico",
  });

  const membership = (retrato.memberships ?? []).find(
    (m) => m.organization_id === ORGANIZACAO_CANONICA_ID && m.user_id === userId,
  );
  itens.push({
    chave: "membership_ativo",
    titulo: "Vínculo com a organização ativo",
    aprovado: !!membership && membership.archived_at === null,
    detalhe: !membership
      ? "vínculo inexistente"
      : membership.archived_at
        ? `vínculo arquivado em ${membership.archived_at}`
        : "vínculo ativo",
  });

  const papeisOrg = (retrato.papeis ?? []).filter(
    (r) => r.organization_id === ORGANIZACAO_CANONICA_ID && r.user_id === userId,
  );
  itens.push({
    chave: "papel_admin",
    titulo: "Papel admin persistido na organização",
    aprovado: papeisOrg.some((r) => r.role === "admin"),
    detalhe: papeisOrg.length ? papeisOrg.map((r) => r.role).join(", ") : "nenhum papel atribuído",
  });

  const staff = (retrato.staff ?? []).find(
    (s) => s.organization_id === ORGANIZACAO_CANONICA_ID && s.auth_user_id === userId,
  );
  itens.push({
    chave: "staff_ativo",
    titulo: "Cadastro de equipe ativo com papel admin",
    aprovado: !!staff && staff.status === "active" && staff.role === "admin" && staff.archived_at === null,
    detalhe: !staff ? "cadastro de equipe inexistente" : `status ${staff.status} · papel ${staff.role}`,
  });

  return { aprovado: itens.every((i) => i.aprovado), userId, itens };
}
