import { somarDias } from "@/lib/painel-dia";

export type EventoRegistro = {
  id: string;
  title: string;
  occurred_at: string | null;
  case_id: string;
  case_codigo?: string | null;
  case_titulo?: string | null;
  next_action?: string | null;
};

/** Separa o que já ocorreu ontem e no restante da semana (fonte: timeline). */
export function recortarRegistroSemana(
  eventos: readonly EventoRegistro[],
  hoje: string,
): { ontem: EventoRegistro[]; semana: EventoRegistro[] } {
  const ontem = somarDias(hoje, -1);
  const inicio = somarDias(hoje, -6);
  const ontemLista: EventoRegistro[] = [];
  const semanaLista: EventoRegistro[] = [];
  for (const e of eventos) {
    const dia = (e.occurred_at ?? "").slice(0, 10);
    if (!dia || dia < inicio || dia > hoje) continue;
    if (dia === ontem) ontemLista.push(e);
    else semanaLista.push(e);
  }
  return { ontem: ontemLista, semana: semanaLista };
}

export function rotuloEventoRegistro(e: EventoRegistro): string {
  const caso = e.case_codigo || e.case_titulo;
  return caso ? `${e.title} — ${caso}` : e.title;
}
