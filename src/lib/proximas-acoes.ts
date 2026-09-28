/**
 * Próximas ações — camada derivada do lead canônico.
 *
 * Cada lead gera no máximo UMA linha de próxima ação: não existe entidade
 * paralela de tarefa comercial, não há duplicação de fila e a correção rápida
 * grava sempre nos campos canônicos do próprio lead (`proxima_acao`,
 * `proxima_acao_em`, `responsavel_nome`, `ultimo_followup_em`).
 * Nenhuma ação externa (mensagem, proposta, cobrança) é executada aqui.
 */

import { PROXIMAS_ACOES, leadForaDoPipeline, type LeadDesk } from "@/lib/crm-desk";

export type EstadoAcao = "sem_acao" | "sem_data" | "atrasada" | "hoje" | "proxima" | "futura";

export const ROTULO_ESTADO_ACAO: Record<EstadoAcao, string> = {
  sem_acao: "Sem próxima ação definida",
  sem_data: "Sem data definida",
  atrasada: "Atrasada",
  hoje: "Para hoje",
  proxima: "Próximos 7 dias",
  futura: "Agendada",
};

export type LinhaAcao = {
  leadId: string;
  codigo: string;
  nome: string;
  acao: string;
  acaoRotulo: string;
  prazo: string | null;
  responsavel: string;
  estado: EstadoAcao;
  diasAtraso: number;
  ultimoFollowup: string | null;
  teste: boolean;
  pendencias: string[];
};

const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

const soData = (iso: string) => iso.slice(0, 10);

/** Rótulo humano da ação; valores fora da lista controlada aparecem como estão. */
export function rotuloAcao(valor: string | null | undefined): string {
  if (vazio(valor)) return "—";
  return PROXIMAS_ACOES.find((o) => o.valor === valor)?.rotulo ?? String(valor);
}

/** Estado derivado do prazo da próxima ação em relação à data de referência. */
export function estadoAcao(lead: LeadDesk, hoje: Date = new Date()): EstadoAcao {
  if (vazio(lead.proxima_acao)) return "sem_acao";
  if (vazio(lead.proxima_acao_em)) return "sem_data";
  const ref = soData(hoje.toISOString());
  const prazo = soData(String(lead.proxima_acao_em));
  if (prazo < ref) return "atrasada";
  if (prazo === ref) return "hoje";
  const limite = new Date(hoje.getTime() + 7 * 86_400_000);
  return prazo <= soData(limite.toISOString()) ? "proxima" : "futura";
}

function diasEntre(prazo: string, hoje: Date) {
  const a = Date.parse(`${soData(prazo)}T00:00:00Z`);
  const b = Date.parse(`${soData(hoje.toISOString())}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** Pendências de saneamento da linha, sem juízo de mérito sobre o caso. */
export function pendenciasAcao(lead: LeadDesk): string[] {
  const p: string[] = [];
  if (vazio(lead.proxima_acao)) p.push("Definir a próxima ação do lead.");
  if (!vazio(lead.proxima_acao) && vazio(lead.proxima_acao_em)) p.push("Definir a data da próxima ação.");
  if (vazio(lead.responsavel_nome)) p.push("Definir quem é a pessoa responsável.");
  return p;
}

/** Converte um lead na sua única linha de próxima ação. */
export function linhaAcao(lead: LeadDesk, hoje: Date = new Date()): LinhaAcao {
  const estado = estadoAcao(lead, hoje);
  return {
    leadId: String(lead.id ?? ""),
    codigo: String(lead.codigo ?? "—"),
    nome: lead.nome,
    acao: String(lead.proxima_acao ?? ""),
    acaoRotulo: rotuloAcao(lead.proxima_acao),
    prazo: vazio(lead.proxima_acao_em) ? null : soData(String(lead.proxima_acao_em)),
    responsavel: String(lead.responsavel_nome ?? ""),
    estado,
    diasAtraso: estado === "atrasada" ? diasEntre(String(lead.proxima_acao_em), hoje) : 0,
    ultimoFollowup: vazio(lead.ultimo_followup_em) ? null : soData(String(lead.ultimo_followup_em)),
    teste: lead.dados_teste === true,
    pendencias: pendenciasAcao(lead),
  };
}

const ORDEM: EstadoAcao[] = ["atrasada", "hoje", "proxima", "sem_data", "sem_acao", "futura"];

/**
 * Lista completa de próximas ações, uma linha por lead ativo.
 * Leads arquivados ficam fora; leads sem id não geram linha.
 */
export function listaAcoes(
  leads: readonly LeadDesk[],
  opcoes: { hoje?: Date; incluirTeste?: boolean } = {},
): LinhaAcao[] {
  const hoje = opcoes.hoje ?? new Date();
  const vistos = new Set<string>();
  const linhas: LinhaAcao[] = [];
  for (const lead of leads) {
    const id = String(lead.id ?? "");
    if (!id || vistos.has(id)) continue;
    if (!vazio(lead.archived_at)) continue;
    // CRM Vivo (27/09/2026): convertido em caso ou encerrado sai da fila — a
    // próxima ação passa a ser a do caso (Caso 360 / Planejador).
    if (leadForaDoPipeline(lead as LeadDesk & { archived_at?: string | null })) continue;
    if (lead.dados_teste === true && opcoes.incluirTeste !== true) continue;
    vistos.add(id);
    linhas.push(linhaAcao(lead, hoje));
  }
  return linhas.sort((a, b) => {
    const oa = ORDEM.indexOf(a.estado);
    const ob = ORDEM.indexOf(b.estado);
    if (oa !== ob) return oa - ob;
    if (a.prazo && b.prazo && a.prazo !== b.prazo) return a.prazo < b.prazo ? -1 : 1;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}

export type ResumoAcoes = Record<EstadoAcao, number> & { total: number; pendentesSaneamento: number };

/** Contadores derivados; cada linha entra em um único estado. */
export function resumoAcoes(linhas: readonly LinhaAcao[]): ResumoAcoes {
  const base = {
    sem_acao: 0,
    sem_data: 0,
    atrasada: 0,
    hoje: 0,
    proxima: 0,
    futura: 0,
    total: linhas.length,
    pendentesSaneamento: linhas.filter((l) => l.pendencias.length > 0).length,
  } as ResumoAcoes;
  for (const l of linhas) base[l.estado] += 1;
  return base;
}
