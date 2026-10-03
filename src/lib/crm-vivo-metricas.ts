/**
 * CRM Vivo (27/09/2026, documentos da Proprietária de 10–11/08/2026):
 * indicadores acionáveis de /leads calculados só de leads reais do pipeline —
 * sem teste, demo, arquivado, convertido em caso ou encerrado.
 */
import { leadForaDoPipeline, type LeadDesk } from "@/lib/crm-desk";

export type IndicadorLeads =
  | "novos"
  | "sem_responsavel"
  | "sem_proxima_acao"
  | "followup_vencido"
  | "discovery"
  | "sem_consentimento";

export const INDICADORES_LEADS: readonly { chave: IndicadorLeads; rotulo: string }[] = [
  { chave: "novos", rotulo: "Novos leads (7 dias)" },
  { chave: "sem_responsavel", rotulo: "Sem responsável" },
  { chave: "sem_proxima_acao", rotulo: "Sem próxima ação" },
  { chave: "followup_vencido", rotulo: "Follow-ups vencidos" },
  { chave: "discovery", rotulo: "Discovery agendadas/realizadas" },
  // 03/10/2026 (D-01) — o gate de consentimento existia por lead, mas não
  // havia nenhuma lista de quem está sem ele. "Pendência informa, não
  // impede": o indicador mostra os leads reais sem consentimento registrado,
  // em vez de o gate só aparecer quando alguém abre o lead certo.
  { chave: "sem_consentimento", rotulo: "Sem consentimento registrado" },
];

type LeadMetrica = LeadDesk & { archived_at?: string | null; created_at?: string | null; demo?: boolean | null };

const vazio = (v: unknown) => v == null || String(v).trim() === "";

/** Lead que entra nos indicadores: real e ainda no pipeline. */
export function leadValidoParaIndicadores(l: LeadMetrica): boolean {
  if (l.dados_teste === true || l.demo === true) return false;
  return !leadForaDoPipeline(l);
}

export function leadNoIndicador(l: LeadMetrica, chave: IndicadorLeads, hoje: Date): boolean {
  const dia = hoje.toISOString().slice(0, 10);
  switch (chave) {
    case "novos": {
      const criado = l.created_at ? Date.parse(l.created_at) : NaN;
      return Number.isFinite(criado) && hoje.getTime() - criado <= 7 * 86_400_000;
    }
    case "sem_responsavel":
      return vazio(l.responsavel_nome);
    case "sem_proxima_acao":
      return vazio(l.proxima_acao) || vazio(l.proxima_acao_em);
    case "followup_vencido":
      return !vazio(l.proxima_acao_em) && String(l.proxima_acao_em).slice(0, 10) < dia;
    case "sem_consentimento": {
      const status = String((l as unknown as Record<string, unknown>).consentimento_status ?? "").trim();
      return status === "" || status === "nao_solicitado";
    }
    case "discovery": {
      const x = l as unknown as Record<string, unknown>;
      return !vazio(x.call_agendada_em) || !vazio(x.call_realizada_em) || ["agendada", "confirmada", "realizada"].includes(String(x.status_call ?? ""));
    }
  }
}

export function indicadoresLeads(leads: readonly LeadMetrica[], hoje = new Date()): Record<IndicadorLeads, number> {
  const validos = leads.filter(leadValidoParaIndicadores);
  const r = {} as Record<IndicadorLeads, number>;
  for (const i of INDICADORES_LEADS) r[i.chave] = validos.filter((l) => leadNoIndicador(l, i.chave, hoje)).length;
  return r;
}
