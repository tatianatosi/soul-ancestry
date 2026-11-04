/**
 * Regras puras do painel de prazos contratuais do Desk.
 * Nunca infere vencimento a partir de parcelas previstas nem fabrica pagamento:
 * só datas registradas viram prazo; previsão nunca vira débito.
 */

export type EstadoPrazo = "futuro" | "hoje" | "expirado" | "sem_data";

/** Lê "AAAA-MM-DD" (ou ISO) como dia civil local, sem deslocamento de fuso. */
export function diaCivil(valor: unknown): Date | null {
  if (typeof valor !== "string" || !valor.trim()) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatarDia(valor: unknown): string {
  const d = diaCivil(valor);
  return d ? d.toLocaleDateString("pt-BR") : "Não registrado";
}

/** Dias até a data (negativo = passou). Sem data registrada → null. */
export function diasRestantes(valor: unknown, hoje: Date = new Date()): number | null {
  const d = diaCivil(valor);
  if (!d) return null;
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((d.getTime() - base.getTime()) / 86_400_000);
}

export function estadoPrazo(valor: unknown, hoje: Date = new Date()): EstadoPrazo {
  const n = diasRestantes(valor, hoje);
  if (n === null) return "sem_data";
  if (n === 0) return "hoje";
  return n < 0 ? "expirado" : "futuro";
}

export function rotuloPrazo(valor: unknown, hoje: Date = new Date()): string {
  const n = diasRestantes(valor, hoje);
  if (n === null) return "Não registrado";
  if (n === 0) return "Vence hoje";
  if (n < 0) return `Expirou há ${-n} ${-n === 1 ? "dia" : "dias"}`;
  return `${n} ${n === 1 ? "dia restante" : "dias restantes"}`;
}

export type FaturaLida = {
  id: string;
  status: string | null;
  valor: number | null;
  valor_pago: number | null;
  vencimento: string | null;
  paga_em?: string | null;
  contract_id?: string | null;
};

const PAGAS = new Set(["paga", "pago", "paid", "quitada", "recebida"]);
const FORA = new Set(["cancelada", "cancelado", "cancelled", "canceled", "estornada", "arquivada"]);

export function faturaPaga(f: FaturaLida): boolean {
  const st = String(f.status ?? "").toLowerCase();
  if (PAGAS.has(st)) return true;
  const v = Number(f.valor ?? 0);
  return v > 0 && Number(f.valor_pago ?? 0) >= v;
}

/** Próxima fatura registrada, não paga e não cancelada, com vencimento real. */
export function proximoVencimento(faturas: FaturaLida[]): FaturaLida | null {
  const abertas = faturas
    .filter((f) => !faturaPaga(f) && !FORA.has(String(f.status ?? "").toLowerCase()))
    .filter((f) => diaCivil(f.vencimento));
  abertas.sort((a, b) => diaCivil(a.vencimento)!.getTime() - diaCivil(b.vencimento)!.getTime());
  return abertas[0] ?? null;
}

export type Alerta = { tom: "alerta" | "erro" | "neutro"; texto: string };

/**
 * Alertas internos (sem envio externo). Só fatura registrada gera lembrete de
 * pagamento; condição prevista (ex.: parcelas) nunca vira débito.
 */
export function alertasDoContrato(args: {
  validadeProposta: string | null;
  fimVigencia: string | null;
  faturas: FaturaLida[];
  hoje?: Date;
}): Alerta[] {
  const hoje = args.hoje ?? new Date();
  const out: Alerta[] = [];
  const vp = estadoPrazo(args.validadeProposta, hoje);
  if (vp === "expirado") out.push({ tom: "erro", texto: "Validade da proposta expirou" });
  else if (vp === "hoje") out.push({ tom: "alerta", texto: "Validade da proposta termina hoje" });
  const vc = estadoPrazo(args.fimVigencia, hoje);
  if (vc === "expirado") out.push({ tom: "erro", texto: "Vigência do contrato encerrada" });
  else if (vc === "hoje") out.push({ tom: "alerta", texto: "Vigência do contrato termina hoje" });
  const prox = proximoVencimento(args.faturas);
  if (prox) {
    const e = estadoPrazo(prox.vencimento, hoje);
    if (e === "expirado") out.push({ tom: "erro", texto: "Fatura registrada vencida e não paga" });
    else if (e === "hoje") out.push({ tom: "alerta", texto: "Fatura registrada vence hoje" });
  }
  return out;
}
