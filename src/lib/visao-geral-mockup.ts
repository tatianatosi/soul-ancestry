/**
 * Composição da Visão Geral (mockup de 17 páginas, p. 11): Casos, Alertas,
 * Receita, Taxa de conversão e funil de 4 células. Números vêm de fonte real.
 * Sem dado, o card declara ausência — nunca R$ 18.400 nem 34% de demonstração.
 */

export const ETAPAS_FUNIL_HOJE = [
  { codigo: "lead_criado", rotulo: "Leads" },
  { codigo: "discovery_realizada", rotulo: "Discovery" },
  { codigo: "proposta_enviada", rotulo: "Propostas" },
  { codigo: "contrato_assinado", rotulo: "Contratos" },
  { codigo: "caso_ativo", rotulo: "Casos" },
] as const;

export type PagamentoReceita = {
  status?: unknown;
  pago_em?: unknown;
  valor?: unknown;
  dados_teste?: unknown;
};

/** Soma pagamentos confirmados no mês (YYYY-MM). Lista vazia = 0; falha de leitura = null. */
export function receitaDoMes(
  pagamentos: readonly PagamentoReceita[] | null | undefined,
  mesISO: string,
  incluirDemo = false,
): number | null {
  if (!pagamentos) return null;
  const prefixo = mesISO.slice(0, 7);
  let total = 0;
  for (const l of pagamentos) {
    if (!incluirDemo && l.dados_teste === true) continue;
    if (l.status !== "confirmado" || !l.pago_em) continue;
    if (!String(l.pago_em).startsWith(prefixo)) continue;
    total += Number(l.valor) || 0;
  }
  return total;
}

export type LinhaFunilMinima = { codigo: string; entidades: number };

/** Conversão lead → caso ativo. Sem denominador, não inventa percentual. */
export function taxaConversaoLeadParaCaso(funil: readonly LinhaFunilMinima[]): number | null {
  const leads = funil.find((l) => l.codigo === "lead_criado")?.entidades ?? 0;
  const casos = funil.find((l) => l.codigo === "caso_ativo")?.entidades ?? 0;
  if (leads <= 0) return null;
  return casos / leads;
}

/** Discovery realizada sobre leads criados — “Lead → diagnóstico” da p. 11. */
export function taxaLeadParaDiagnostico(funil: readonly LinhaFunilMinima[]): number | null {
  const leads = funil.find((l) => l.codigo === "lead_criado")?.entidades ?? 0;
  const discovery = funil.find((l) => l.codigo === "discovery_realizada")?.entidades ?? 0;
  if (leads <= 0) return null;
  return discovery / leads;
}

/** Percentual inteiro do mockup (42%, 12%). Sem valor, null — a UI escreve “—”. */
export function percentualInteiro(v: number | null | undefined): string | null {
  if (v == null) return null;
  return `${Math.round(v * 100)}%`;
}

export function recorteFunilHoje<T extends LinhaFunilMinima & { rotulo?: string }>(
  funil: readonly T[],
): { codigo: string; rotulo: string; entidades: number }[] {
  return ETAPAS_FUNIL_HOJE.map((e) => {
    const linha = funil.find((l) => l.codigo === e.codigo);
    return { codigo: e.codigo, rotulo: e.rotulo, entidades: linha?.entidades ?? 0 };
  });
}

export type LeadCanal = { id: string; canal?: string | null; origem?: string | null };
export type EventoCanal = {
  event_type: string;
  lead_id?: string | null;
  canal?: string | null;
  origem?: string | null;
};

export function ehCanalWhatsApp(...textos: Array<string | null | undefined>): boolean {
  return textos.some((t) => (t ?? "").toLowerCase().includes("whatsapp"));
}

export function contarLeadsWhatsApp(
  leads: readonly LeadCanal[] = [],
  eventos: readonly EventoCanal[] = [],
): number {
  const ids = new Set<string>();
  for (const l of leads) {
    if (l.id && ehCanalWhatsApp(l.canal, l.origem)) ids.add(l.id);
  }
  for (const e of eventos) {
    if (e.lead_id && ehCanalWhatsApp(e.canal, e.origem)) ids.add(e.lead_id);
  }
  return ids.size;
}

export type CelulaFunilMockup = {
  codigo: "novos_leads" | "leads_whatsapp" | "lead_diagnostico" | "lead_cliente";
  rotulo: string;
  texto: string;
  largura: number;
  barra: "bg-navy" | "bg-sage" | "bg-gold" | "bg-terracotta";
  semDado: boolean;
};

/**
 * Quatro células da p. 11: Novos leads, WhatsApp, Lead → diagnóstico, Lead → cliente.
 * Barras: navy, sage, dourado, terracota. Percentual sem denominador fica “—” .
 */
export function celulasFunilMockup17(args: {
  funil: readonly LinhaFunilMinima[];
  leads?: readonly LeadCanal[];
  eventos?: readonly EventoCanal[];
}): CelulaFunilMockup[] {
  const novos = args.funil.find((l) => l.codigo === "lead_criado")?.entidades ?? 0;
  const whatsapp = contarLeadsWhatsApp(args.leads ?? [], args.eventos ?? []);
  const diagnostico = taxaLeadParaDiagnostico(args.funil);
  const cliente = taxaConversaoLeadParaCaso(args.funil);
  const denom = Math.max(novos, 1);

  return [
    {
      codigo: "novos_leads",
      rotulo: "Novos leads",
      texto: String(novos),
      largura: novos <= 0 ? 0 : 100,
      barra: "bg-navy",
      semDado: false,
    },
    {
      codigo: "leads_whatsapp",
      rotulo: "Leads em WhatsApp",
      texto: String(whatsapp),
      largura: novos <= 0 ? 0 : Math.round((whatsapp / denom) * 100),
      barra: "bg-sage",
      semDado: false,
    },
    {
      codigo: "lead_diagnostico",
      rotulo: "Lead → diagnóstico",
      texto: percentualInteiro(diagnostico) ?? "—",
      largura: diagnostico == null ? 0 : Math.round(diagnostico * 100),
      barra: "bg-gold",
      semDado: diagnostico == null,
    },
    {
      codigo: "lead_cliente",
      rotulo: "Lead → cliente",
      texto: percentualInteiro(cliente) ?? "—",
      largura: cliente == null ? 0 : Math.round(cliente * 100),
      barra: "bg-terracotta",
      semDado: cliente == null,
    },
  ];
}

const MESES_PT = [
  "JANEIRO",
  "FEVEREIRO",
  "MARÇO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO",
] as const;

/** Eyebrow da p. 11: “VISÃO GERAL · JULHO 2026”. */
export function recorteMesVisaoGeral(agora: Date = new Date()): string {
  return `${MESES_PT[agora.getMonth()]} ${agora.getFullYear()}`;
}

/** Dias corridos desde a ocorrência até o dia de hoje (calendário). */
export function diasDeEspera(ocorridoISO: string, hoje: string): number {
  const a = Date.parse(`${ocorridoISO.slice(0, 10)}T00:00:00`);
  const b = Date.parse(`${hoje}T00:00:00`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/** 2d verde, 4d âmbar, 5d+ terracota — como a coluna Espera da p. 11. */
export function tomEspera(dias: number): "ok" | "atencao" | "critico" {
  if (dias <= 2) return "ok";
  if (dias <= 4) return "atencao";
  return "critico";
}
