/**
 * CRM Vivo — regras puras compartilhadas pela Mesa de Discovery (/calls) e
 * por Leads e Triagem (/leads). P2 (24/09/2026): nada aqui cria tabela,
 * ficha ou kanban paralelo; tudo deriva da mesma linha de `leads`.
 */
import {
  aceiteSemConfirmacaoFormal,
  discoverySemDesdobramento,
  type LeadDesk,
} from "@/lib/crm-desk";
import { filasCalls } from "@/lib/painel-calls";
import { normalizarEmail, normalizarTelefone } from "@/lib/pessoa-identidade";

/* ------------------------------------------------------ fila CRM Vivo */

export type ChaveFilaCrmVivo =
  | "call_sem_registro"
  | "discovery_sem_desfecho"
  | "lead_sem_responsavel"
  | "lead_sem_proxima_acao"
  | "qualificacao_pendente"
  | "aceite_sem_confirmacao"
  | "pronto_handoff";

export type FilaCrmVivo = { chave: ChaveFilaCrmVivo; rotulo: string; leads: LeadDesk[] };

export const ROTULO_FILA_CRM_VIVO: Record<ChaveFilaCrmVivo, string> = {
  call_sem_registro: "Call sem registro",
  discovery_sem_desfecho: "Discovery sem desfecho",
  lead_sem_responsavel: "Lead sem responsável",
  lead_sem_proxima_acao: "Lead sem próxima ação",
  qualificacao_pendente: "Qualificação pendente",
  aceite_sem_confirmacao: "Aceite verbal sem confirmação formal",
  pronto_handoff: "Pronto para handoff",
};

/** Mesma regra de "lead ativo" do Painel Hoje (montarFilasHoje). */
export function leadAtivo(l: LeadDesk): boolean {
  return !l.archived_at && !["perdido", "encerrado_sem_aderencia"].includes(String(l.eixo_comercial));
}

/**
 * As sete filas do CRM Vivo, derivadas das mesmas regras já usadas pela
 * Mesa (filasCalls) e pelo Painel Hoje (discoverySemDesdobramento,
 * aceiteSemConfirmacaoFormal, sem responsável/sem próxima ação). Um lead
 * pode estar em mais de uma fila — cada fila é uma pendência distinta.
 * Só entram leads ativos e ainda sem caso.
 */
export function filaCrmVivo(leads: LeadDesk[], hojeIso: string): FilaCrmVivo[] {
  // Lead já convertido (com caso) sai do CRM Vivo: a próxima ação passa a
  // morar no caso. O lead e a trilha continuam intactos.
  const ativos = leads.filter((l) => leadAtivo(l) && !l.case_id);
  const calls = filasCalls(ativos, hojeIso);
  const daMesa = (c: "aguardando_registro" | "qualificacao_pendente" | "pronto_handoff") =>
    calls.find((f) => f.chave === c)?.leads ?? [];
  const filas: Record<ChaveFilaCrmVivo, LeadDesk[]> = {
    call_sem_registro: daMesa("aguardando_registro"),
    discovery_sem_desfecho: ativos.filter(discoverySemDesdobramento),
    lead_sem_responsavel: ativos.filter((l) => !String(l.responsavel_nome ?? "").trim()),
    lead_sem_proxima_acao: ativos.filter((l) => !String(l.proxima_acao ?? "").trim() || !l.proxima_acao_em),
    qualificacao_pendente: daMesa("qualificacao_pendente"),
    aceite_sem_confirmacao: ativos.filter(aceiteSemConfirmacaoFormal),
    pronto_handoff: daMesa("pronto_handoff"),
  };
  return (Object.keys(ROTULO_FILA_CRM_VIVO) as ChaveFilaCrmVivo[]).map((chave) => ({
    chave,
    rotulo: ROTULO_FILA_CRM_VIVO[chave],
    leads: filas[chave],
  }));
}

/* ------------------------------------------------ eventos da call */

export type EventoCall =
  | "call_agendada"
  | "call_realizada"
  | "call_no_show"
  | "call_cancelada"
  | "discovery_concluida";

export const ROTULO_EVENTO_CALL: Record<EventoCall, string> = {
  call_agendada: "Call agendada",
  call_realizada: "Call realizada",
  call_no_show: "No-show",
  call_cancelada: "Call cancelada",
  discovery_concluida: "Discovery concluída",
};

const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === "";
const STATUS_CANCELADA = ["cancelada_lead", "cancelada_clube"];

/**
 * Eventos nomeados da call, comparando o lead antes e depois da gravação.
 * Só o que mudou vira evento — regravar o mesmo estado não duplica trilha.
 */
export function eventosDeCall(
  anterior: Partial<LeadDesk> | null,
  posterior: Partial<LeadDesk>,
): EventoCall[] {
  const a = anterior ?? {};
  const eventos: EventoCall[] = [];
  const statusA = String(a.status_call ?? "");
  const statusP = String(posterior.status_call ?? "");
  const agendouAgora =
    (!vazio(posterior.call_agendada_em) && String(posterior.call_agendada_em) !== String(a.call_agendada_em ?? "")) ||
    (["agendada", "confirmada", "remarcada"].includes(statusP) && statusP !== statusA);
  if (agendouAgora) eventos.push("call_agendada");
  const realizouAgora =
    (statusP === "realizada" && statusA !== "realizada") ||
    (!vazio(posterior.call_realizada_em) && vazio(a.call_realizada_em));
  if (realizouAgora) eventos.push("call_realizada");
  if (statusP === "no_show" && statusA !== "no_show") eventos.push("call_no_show");
  if (STATUS_CANCELADA.includes(statusP) && statusP !== statusA) eventos.push("call_cancelada");
  if (!vazio(posterior.discovery_resultado) && vazio(a.discovery_resultado)) eventos.push("discovery_concluida");
  return eventos;
}

/** No-show e cancelamento exigem motivo registrado por humano. */
export function exigeMotivoDeCall(eventos: EventoCall[]): boolean {
  return eventos.includes("call_no_show") || eventos.includes("call_cancelada");
}

/** O status escolhido na tela pede motivo (para mostrar o campo). */
export function statusPedeMotivo(status: unknown): boolean {
  const s = String(status ?? "");
  return s === "no_show" || STATUS_CANCELADA.includes(s);
}

/* ------------------------------------------------ trilha do lead */

/**
 * Rótulos da trilha do lead (audit_logs, entidade "lead"): gravações do
 * CRM (crm-desk), eventos da call (crm-vivo) e o handoff/conversão.
 */
export const ROTULO_TRILHA_LEAD: Record<string, string> = {
  criar_lead: "Lead criado",
  atualizar_lead: "Lead atualizado",
  atualizar_etapa: "Etapa comercial alterada",
  registrar_interacao: "Registro da call gravado",
  definir_proxima_acao: "Próxima ação definida",
  arquivar_lead: "Lead arquivado",
  ...ROTULO_EVENTO_CALL,
  handoff_concluido: "Handoff concluído",
  lead_convertido: "Convertido em pessoa canônica e caso",
};

export function rotuloTrilhaLead(acao: string): string {
  return ROTULO_TRILHA_LEAD[acao] ?? acao;
}

/* ------------------------------------------------------- contatos */

export type PessoaConhecida = { id: string; nome: string; email?: string | null; telefone?: string | null };

/**
 * Contato é vínculo da pessoa canônica, nunca segundo cadastro. Se o e-mail
 * ou o telefone do contato já pertencem a uma pessoa cadastrada, devolve essa
 * pessoa para a tela avisar — quem decide é a equipe; nada é fundido.
 */
export function contatoCoincideComPessoa(
  contato: { email?: string | null; telefone?: string | null },
  pessoas: PessoaConhecida[],
): { pessoa: PessoaConhecida; motivo: "email" | "telefone" } | null {
  const email = normalizarEmail(contato.email);
  const telefone = normalizarTelefone(contato.telefone);
  for (const p of pessoas) {
    if (email && normalizarEmail(p.email) === email) return { pessoa: p, motivo: "email" };
    if (telefone && normalizarTelefone(p.telefone) === telefone) return { pessoa: p, motivo: "telefone" };
  }
  return null;
}

export type ContatoExistente = { id: string; nome: string; email?: string | null; telefone?: string | null };

export type AvaliacaoNovoContato =
  | { ok: true }
  | { ok: false; motivo: string; pessoaId?: string; contatoId?: string };

/**
 * Regra única do vínculo de contato (P2, 24/09/2026). Recusa, sem fundir
 * nada: (1) contato sem nome ou sem nenhum meio (e-mail/telefone);
 * (2) contato com o mesmo e-mail/telefone da própria pessoa — é ela mesma;
 * (3) contato que já é outra pessoa canônica — o vínculo certo é abrir a
 * Pessoa 360 dela, não copiar a identidade; (4) contato repetido na mesma
 * pessoa.
 */
export function avaliarNovoContato(
  contato: { nome?: string | null; email?: string | null; telefone?: string | null },
  ctx: { pessoa: PessoaConhecida; outrasPessoas: PessoaConhecida[]; contatosExistentes: ContatoExistente[] },
): AvaliacaoNovoContato {
  if (!String(contato.nome ?? "").trim()) return { ok: false, motivo: "Informe o nome do contato." };
  if (!normalizarEmail(contato.email) && !normalizarTelefone(contato.telefone)) {
    return { ok: false, motivo: "Informe um e-mail válido ou um telefone com DDD." };
  }
  if (contatoCoincideComPessoa(contato, [ctx.pessoa])) {
    return {
      ok: false,
      motivo: "Este e-mail/telefone é da própria pessoa — edite os dados civis dela em vez de criar contato.",
      pessoaId: ctx.pessoa.id,
    };
  }
  const outra = contatoCoincideComPessoa(
    contato,
    ctx.outrasPessoas.filter((p) => p.id !== ctx.pessoa.id),
  );
  if (outra) {
    return {
      ok: false,
      motivo: `Este ${outra.motivo === "email" ? "e-mail" : "telefone"} já pertence a ${outra.pessoa.nome}, pessoa canônica cadastrada. Abra a Pessoa 360 dela — contato não copia identidade.`,
      pessoaId: outra.pessoa.id,
    };
  }
  const repetido = contatoCoincideComPessoa(contato, ctx.contatosExistentes);
  if (repetido) {
    return {
      ok: false,
      motivo: `Contato já registrado nesta pessoa (${repetido.pessoa.nome}).`,
      contatoId: repetido.pessoa.id,
    };
  }
  return { ok: true };
}
