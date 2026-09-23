/**
 * Acessos ao portal — elegibilidade por nível.
 *
 * Espelha as travas do banco (fn_portal_access_autorizacao_guard e
 * fn_portal_case_access_guard) para que o seletor mostre o motivo do bloqueio
 * antes do envio. A decisão de segurança continua sendo do servidor/banco.
 */

export type NivelPortal = "proposal_portal" | "client_workspace";

export const NIVEL_LABEL: Record<NivelPortal, string> = {
  proposal_portal: "Portal de proposta",
  client_workspace: "Espaço do cliente",
};

export const NIVEL_DESCRICAO: Record<NivelPortal, string> = {
  proposal_portal:
    "Somente conteúdo de proposta explicitamente autorizado. Não expõe dossiê, pesquisa, documentos internos, tarefas, auditoria, financeiro interno nem hipóteses.",
  client_workspace: "Ambiente do cliente para casos elegíveis, expressamente associados a este acesso.",
};

export const STATUS_ACESSO_LABEL: Record<string, string> = {
  pending: "Pendente",
  invited: "Convidado",
  active: "Ativo",
  suspended: "Suspenso",
  revoked: "Revogado",
  expired: "Expirado",
};

export const STATUS_AUTORIZACAO_LABEL: Record<string, string> = {
  pendente: "Pendente de validação",
  aprovado: "Aprovado",
  recusado: "Recusado",
  revogado: "Revogado",
};

export const EVENTO_LABEL: Record<string, string> = {
  invite_created: "Convite criado",
  invite_resent: "Convite reenviado",
  magic_link_requested: "Link mágico solicitado",
  magic_link_sent: "Link enviado",
  authenticated: "Acesso utilizado",
  authentication_denied: "Tentativa bloqueada",
  access_denied: "Tentativa bloqueada",
  access_revoked: "Acesso revogado",
  access_suspended: "Acesso suspenso",
  case_access_granted: "Caso autorizado",
  case_access_revoked: "Caso revogado",
  session_expired: "Link expirado ou já utilizado",
};

export type AutorizacaoEmail = {
  id: string;
  client_id: string | null;
  case_id: string | null;
  email: string;
  finalidade: string;
  nivel_pretendido: NivelPortal;
  status: string;
  validado_em: string | null;
  is_demo: boolean;
  archived_at: string | null;
};

export type CasoPortal = {
  id: string;
  codigo: string | null;
  titulo: string | null;
  cliente_id: string | null;
  contrato_assinado: boolean | null;
  pagamento_confirmado: boolean | null;
  documentos_minimos_ok: boolean | null;
  ativado_em: string | null;
  onboarding_iniciado_em: string | null;
  app_access_status: string | null;
  demo: boolean | null;
};

export type ProjecaoPortal = { case_id: string | null; approval_status: string | null; archived_at: string | null };
export type ResumoPublicacaoCaso = { publicadas: number; pendentes: number; arquivadas: number };

/**
 * §22 do De-Para (Desk — Portal do Cliente, zona "Resumo por família/caso
 * — status geral de publicação do App"): módulos publicados, pendentes,
 * última atualização.
 *
 * DIVERGÊNCIA REGISTRADA (§29): a prancha nomeia uma "Matriz de módulos"
 * (uma linha por aba do App — Home/Jornada/Radar/Árvore/Documentos/
 * Legado/Conta — cada uma com estado próprio de visível/oculto/rascunho/
 * publicado). Isso não existe no modelo de dado: `app_projections` grava
 * estado de aprovação por ITEM de conteúdo (achado, marco, relatório...),
 * não por aba — as 7 abas do App são sempre visíveis e mostram o que
 * estiver publicado dentro delas, sem estado de publicação próprio por
 * aba. Em vez de inventar 7 linhas fictícias, agrego o que o dado
 * realmente sustenta: contagem de itens publicados/pendentes/arquivados
 * por caso — mesma classificação que `resumoVisaoClienteCaso` já usa
 * para um caso só (Caso 360 → "Visão do cliente"), aqui para todos de
 * uma vez, sem N+1 query.
 */
export function resumoPublicacaoPorCaso(
  projecoes: readonly ProjecaoPortal[],
): Map<string, ResumoPublicacaoCaso> {
  const mapa = new Map<string, ResumoPublicacaoCaso>();
  for (const p of projecoes) {
    if (!p.case_id) continue;
    const atual = mapa.get(p.case_id) ?? { publicadas: 0, pendentes: 0, arquivadas: 0 };
    if (p.approval_status === "published" && !p.archived_at) {
      atual.publicadas += 1;
    } else if (p.approval_status === "archived" || p.archived_at) {
      atual.arquivadas += 1;
    } else if (["draft", "in_review", "approved"].includes(String(p.approval_status))) {
      atual.pendentes += 1;
    }
    mapa.set(p.case_id, atual);
  }
  return mapa;
}

export type PessoaPortal = {
  id: string;
  nome: string;
  email: string | null;
  classificacao: string | null;
  is_demo: boolean;
};

export type PropostaPortal = {
  id: string;
  client_id: string | null;
  case_id: string | null;
  status: string | null;
  archived_at: string | null;
};

export type Bloqueio = { bloqueado: boolean; motivos: string[] };

/** Motivo canônico exibido no seletor quando faltam as travas operacionais. */
export const MOTIVO_GATES = "Acesso bloqueado: contrato/pagamento/documentos pendentes";

/** Caso elegível ao Espaço do cliente. */
export function bloqueioDoCaso(caso: CasoPortal): Bloqueio {
  const motivos: string[] = [];
  if (!caso.contrato_assinado) motivos.push("Bloqueado: contrato não assinado");
  if (!caso.pagamento_confirmado) motivos.push("Bloqueado: pagamento inicial não confirmado");
  if (!caso.documentos_minimos_ok) motivos.push("Bloqueado: documentos mínimos pendentes");
  if (!caso.ativado_em && !caso.onboarding_iniciado_em) {
    motivos.push("Bloqueado: falta decisão humana de ativação ou onboarding elegível");
  }
  return { bloqueado: motivos.length > 0, motivos };
}

/** Propostas que autorizam leitura no Portal de proposta. */
export function propostasAutorizadas(propostas: PropostaPortal[], clientId: string): PropostaPortal[] {
  return propostas.filter(
    (p) => !p.archived_at && p.client_id === clientId && ["enviada", "aprovada"].includes(p.status ?? ""),
  );
}

/** Pessoa elegível ao nível escolhido: exige autorização aprovada e finalidade registrada. */
export function bloqueioDaPessoa(
  pessoa: PessoaPortal,
  nivel: NivelPortal,
  autorizacoes: AutorizacaoEmail[],
  casos: CasoPortal[],
  propostas: PropostaPortal[] = [],
): Bloqueio {
  const motivos: string[] = [];
  const aprovadas = autorizacoes.filter(
    (a) => !a.archived_at && a.status === "aprovado" && a.nivel_pretendido === nivel && a.client_id === pessoa.id,
  );
  if (aprovadas.length === 0) {
    motivos.push(
      pessoa.classificacao === "participante_familiar"
        ? "Bloqueado: participante do núcleo — sem regra e autorização documental própria"
        : "Bloqueado: nenhum e-mail autorizado e aprovado para este nível",
    );
  }
  if (nivel === "client_workspace") {
    const meus = casos.filter((c) => c.cliente_id === pessoa.id);
    if (meus.length === 0) motivos.push("Bloqueado: pessoa sem caso associado");
    else if (meus.every((c) => bloqueioDoCaso(c).bloqueado)) motivos.push(MOTIVO_GATES);
  } else if (propostasAutorizadas(propostas, pessoa.id).length === 0) {
    motivos.push("Bloqueado: sem proposta enviada ou aprovada para leitura");
  }
  return { bloqueado: motivos.length > 0, motivos };
}

export type PessoaAvaliada = { pessoa: PessoaPortal; bloqueio: Bloqueio };

/**
 * Separa o seletor em três grupos: elegíveis (podem receber convite),
 * bloqueados (somente leitura do motivo) e demonstrações (isoladas das métricas).
 */
export function classificarPessoas(
  pessoas: PessoaPortal[],
  nivel: NivelPortal,
  autorizacoes: AutorizacaoEmail[],
  casos: CasoPortal[],
  propostas: PropostaPortal[] = [],
): { elegiveis: PessoaAvaliada[]; bloqueadas: PessoaAvaliada[]; demo: PessoaAvaliada[] } {
  const elegiveis: PessoaAvaliada[] = [];
  const bloqueadas: PessoaAvaliada[] = [];
  const demo: PessoaAvaliada[] = [];
  for (const pessoa of pessoas) {
    const bloqueio = bloqueioDaPessoa(pessoa, nivel, autorizacoes, casos, propostas);
    const item = { pessoa, bloqueio };
    if (pessoa.is_demo) demo.push(item);
    else if (bloqueio.bloqueado) bloqueadas.push(item);
    else elegiveis.push(item);
  }
  return { elegiveis, bloqueadas, demo };
}

/** E-mails aprovados que podem receber convite naquele nível, para aquela pessoa. */
export function emailsElegiveis(
  autorizacoes: AutorizacaoEmail[],
  clientId: string,
  nivel: NivelPortal,
): AutorizacaoEmail[] {
  return autorizacoes.filter(
    (a) => !a.archived_at && a.status === "aprovado" && a.nivel_pretendido === nivel && a.client_id === clientId,
  );
}


export type EstadoLink = "valido" | "expirado" | "esgotado" | "indisponivel";

/** Link mágico: uso controlado e com expiração. */
export function estadoDoLink(acesso: {
  access_status: string;
  magic_link_expires_at?: string | null;
  invitation_expires_at?: string | null;
  magic_link_uses?: number | null;
  magic_link_max_uses?: number | null;
}, agora = Date.now()): EstadoLink {
  if (!["pending", "invited", "active"].includes(acesso.access_status)) return "indisponivel";
  const expira = acesso.magic_link_expires_at ?? acesso.invitation_expires_at;
  if (expira && new Date(expira).getTime() < agora) return "expirado";
  const usos = acesso.magic_link_uses ?? 0;
  const max = acesso.magic_link_max_uses ?? 1;
  if (usos >= max) return "esgotado";
  return "valido";
}

/**
 * Janelas de validade do link mágico.
 *
 * Login/reenvio é curto por padrão: reduz a exposição se o e-mail for
 * encaminhado ou acessado por terceiros. O convite inicial pode durar até
 * 24h porque o primeiro clique passa pela confirmação em /acesso/confirmar,
 * que consome o uso imediatamente.
 */
export const LINK_LOGIN_VALIDADE_MINUTOS = 20;
export const CONVITE_VALIDADE_HORAS = 24;

export function rotuloValidadeLink(contexto: "login" | "convite"): string {
  return contexto === "login"
    ? `${LINK_LOGIN_VALIDADE_MINUTOS} minutos`
    : `${CONVITE_VALIDADE_HORAS} horas`;
}
