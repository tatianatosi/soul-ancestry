/**
 * Cálculos da tela de Microentregas — funções puras, sem banco.
 *
 * Só usa o que já está gravado: título, fase, prazo, situação e conclusão.
 * Nada é inferido e nenhum prazo é inventado quando o campo está vazio.
 */

import { diasAte } from "./golive-radar";

export type MicroentregaGoLive = {
  id: string;
  titulo: string;
  status: string | null;
  fase: string | null;
  prazo: string | null;
  responsavel: string | null;
  concluidaEm: string | null;
};

export type FaixaPrazo = "vencida" | "ate_7_dias" | "acima_de_7_dias" | "sem_prazo" | "concluida";

export const ROTULO_FAIXA: Record<FaixaPrazo, string> = {
  vencida: "Prazo vencido",
  ate_7_dias: "Vence em até 7 dias",
  acima_de_7_dias: "Vence depois de 7 dias",
  sem_prazo: "Sem prazo registrado",
  concluida: "Concluída",
};

export function faixaDoPrazo(m: MicroentregaGoLive, agora: Date = new Date()): FaixaPrazo {
  if (m.concluidaEm || String(m.status ?? "").toLowerCase() === "concluida") return "concluida";
  const dias = diasAte(m.prazo, agora);
  if (dias === null) return "sem_prazo";
  if (dias < 0) return "vencida";
  if (dias <= 7) return "ate_7_dias";
  return "acima_de_7_dias";
}

/** Contagem por faixa de prazo, na ordem fixa do gráfico. */
export function prazoEmFatias(
  itens: MicroentregaGoLive[],
  agora: Date = new Date(),
): { rotulo: string; valor: number }[] {
  const ordem: FaixaPrazo[] = ["vencida", "ate_7_dias", "acima_de_7_dias", "sem_prazo", "concluida"];
  const contagem = new Map<FaixaPrazo, number>(ordem.map((f) => [f, 0]));
  for (const m of itens) {
    const f = faixaDoPrazo(m, agora);
    contagem.set(f, (contagem.get(f) ?? 0) + 1);
  }
  return ordem.map((f) => ({ rotulo: ROTULO_FAIXA[f], valor: contagem.get(f) ?? 0 }));
}

/** Pendentes primeiro, das mais atrasadas para as mais distantes. */
export function ordenarMicroentregas(
  itens: MicroentregaGoLive[],
  agora: Date = new Date(),
): MicroentregaGoLive[] {
  const peso = (m: MicroentregaGoLive) => {
    const f = faixaDoPrazo(m, agora);
    return f === "vencida" ? 0 : f === "ate_7_dias" ? 1 : f === "acima_de_7_dias" ? 2 : f === "sem_prazo" ? 3 : 4;
  };
  return [...itens].sort((a, b) => {
    const d = peso(a) - peso(b);
    if (d !== 0) return d;
    const da = diasAte(a.prazo, agora);
    const db = diasAte(b.prazo, agora);
    if (da !== null && db !== null && da !== db) return da - db;
    return a.titulo.localeCompare(b.titulo, "pt-BR");
  });
}

export function concluida(m: MicroentregaGoLive): boolean {
  return Boolean(m.concluidaEm) || String(m.status ?? "").toLowerCase() === "concluida";
}
