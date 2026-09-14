/**
 * Cálculos de apresentação das superfícies Hoje, Kanban e Caso 360.
 *
 * Funções puras: recebem o que o motor aprovado já leu (caso/planejador,
 * ações, microentregas, eventos e carteira) e devolvem contagens. Não buscam
 * dado, não inferem valor ausente e não criam estado novo — quando não há
 * registro, a contagem é zero e a tela mostra o estado vazio canônico.
 */

export type AcaoOperacional = {
  id: string;
  titulo: string;
  status: string | null;
  prazo: string | null;
  bloqueio: boolean;
  concluidaEm: string | null;
  responsavel: string | null;
};

export type MicroentregaOperacional = {
  id: string;
  titulo: string;
  status: string | null;
  fase: string | null;
  prazo: string | null;
  concluidaEm: string | null;
  responsavel: string | null;
};

export type EventoCaso = {
  id: string;
  titulo: string;
  tipo: string | null;
  fase: string | null;
  em: string | null;
  origem: string | null;
  responsavel: string | null;
};

export type CasoCarteira = {
  id: string;
  status: string | null;
  prioridade: string | null;
  temProximaAcao: boolean;
  prazoProximaAcao: string | null;
};

const DIA = 86_400_000;

function meiaNoite(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Dias entre hoje e a data gravada; null quando não há data válida. */
export function diasAte(prazo: string | null | undefined): number | null {
  if (!prazo) return null;
  const d = new Date(prazo);
  if (Number.isNaN(d.getTime())) return null;
  return Math.round((meiaNoite(d).getTime() - meiaNoite(new Date()).getTime()) / DIA);
}

const CONCLUIDO = /(conclu|public|entreg|aprovad|finaliz|arquiv|cancel)/i;
const EXTERNO = /(aguard|extern|espera|pendente_cliente|bloque)/i;

export function estaConcluida(a: { status: string | null; concluidaEm: string | null }) {
  return Boolean(a.concluidaEm) || CONCLUIDO.test(a.status ?? "");
}

export function aguardandoExterno(a: { status: string | null; bloqueio?: boolean }) {
  return a.bloqueio === true || EXTERNO.test(a.status ?? "");
}

/** Faixa de prazo de uma ação, pelo estado e pela data já gravados. */
export type FaixaPrazo = "Vencida" | "Hoje" | "Próximos 7 dias" | "Aguardando externo" | "Concluída" | "Sem prazo";

export function faixaDePrazo(a: AcaoOperacional | MicroentregaOperacional): FaixaPrazo {
  if (estaConcluida(a)) return "Concluída";
  if (aguardandoExterno(a as AcaoOperacional)) return "Aguardando externo";
  const d = diasAte(a.prazo);
  if (d === null) return "Sem prazo";
  if (d < 0) return "Vencida";
  if (d === 0) return "Hoje";
  if (d <= 7) return "Próximos 7 dias";
  return "Sem prazo";
}

/** KPIs de Hoje: carteira ativa e saúde das ações do caso. */
export function kpisHoje(carteira: readonly CasoCarteira[], acoes: readonly AcaoOperacional[]) {
  const ativos = carteira.filter((c) => !/(encerr|cancel|arquiv|perdid)/i.test(c.status ?? "")).length;
  const vencidas = acoes.filter((a) => faixaDePrazo(a) === "Vencida").length;
  const semProxima = carteira.filter((c) => !c.temProximaAcao).length;
  const externo = acoes.filter((a) => !estaConcluida(a) && aguardandoExterno(a)).length;
  return { ativos, vencidas, semProxima, externo };
}

/** Rótulo curto da semana (dd/mm) a partir da segunda-feira. */
function rotuloSemana(inicio: Date) {
  return inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Microentregas aprovadas/publicadas por semana, nas últimas `semanas` semanas. */
export function ritmoSemanal(
  microentregas: readonly MicroentregaOperacional[],
  semanas = 7,
): { rotulo: string; valor: number }[] {
  const hoje = meiaNoite(new Date());
  const segunda = new Date(hoje.getTime() - ((hoje.getDay() + 6) % 7) * DIA);
  const baldes: { rotulo: string; valor: number; inicio: number; fim: number }[] = [];
  for (let i = semanas - 1; i >= 0; i--) {
    const inicio = new Date(segunda.getTime() - i * 7 * DIA);
    baldes.push({
      rotulo: rotuloSemana(inicio),
      valor: 0,
      inicio: inicio.getTime(),
      fim: inicio.getTime() + 7 * DIA,
    });
  }
  for (const m of microentregas) {
    if (!estaConcluida(m)) continue;
    const data = m.concluidaEm ? new Date(m.concluidaEm) : null;
    if (!data || Number.isNaN(data.getTime())) continue;
    const t = data.getTime();
    const balde = baldes.find((b) => t >= b.inicio && t < b.fim);
    if (balde) balde.valor += 1;
  }
  return baldes.map((b) => ({ rotulo: b.rotulo, valor: b.valor }));
}

/** Há alguma microentrega concluída com data? Sem isso, a linha fica vazia. */
export function temRitmo(microentregas: readonly MicroentregaOperacional[]) {
  return microentregas.some((m) => estaConcluida(m) && Boolean(m.concluidaEm));
}

/** Contagem de casos por prioridade gravada. */
export function prioridadeDaCarteira(carteira: readonly CasoCarteira[]) {
  const mapa = new Map<string, number>();
  for (const c of carteira) {
    if (!c.prioridade) continue;
    mapa.set(c.prioridade, (mapa.get(c.prioridade) ?? 0) + 1);
  }
  return [...mapa.entries()].map(([rotulo, valor]) => ({ rotulo, valor }));
}

/** Contagem por faixa de prazo, para os KPIs do Kanban. */
export function kpisPrazo(acoes: readonly AcaoOperacional[]) {
  const conta = (f: FaixaPrazo) => acoes.filter((a) => faixaDePrazo(a) === f).length;
  return {
    vencida: conta("Vencida"),
    hoje: conta("Hoje"),
    proximos7: conta("Próximos 7 dias"),
    externo: conta("Aguardando externo"),
  };
}

/** Distribuição por etapa já gravada (fase da microentrega). */
export function distribuicaoPorEtapa(microentregas: readonly MicroentregaOperacional[]) {
  const mapa = new Map<string, number>();
  for (const m of microentregas) {
    if (!m.fase) continue;
    mapa.set(m.fase, (mapa.get(m.fase) ?? 0) + 1);
  }
  return [...mapa.entries()].map(([rotulo, valor]) => ({ rotulo, valor }));
}

/** Carga por responsável: itens em aberto por pessoa registrada. */
export function cargaPorResponsavel(
  itens: readonly (AcaoOperacional | MicroentregaOperacional)[],
) {
  const mapa = new Map<string, number>();
  for (const i of itens) {
    if (estaConcluida(i)) continue;
    if (!i.responsavel) continue;
    mapa.set(i.responsavel, (mapa.get(i.responsavel) ?? 0) + 1);
  }
  return [...mapa.entries()].map(([rotulo, valor]) => ({ rotulo, valor }));
}

/** Área que originou cada evento do caso, pelo tipo de entidade já gravado. */
const AREAS: { rotulo: string; teste: RegExp }[] = [
  { rotulo: "Comercial", teste: /(lead|proposal|proposta|call|discovery|opportunit)/i },
  { rotulo: "Operação", teste: /(task|tarefa|microentrega|ops|onboarding|plan)/i },
  { rotulo: "Pesquisa", teste: /(research|pesquisa|evidence|evidencia|finding|achado|source|fonte)/i },
  { rotulo: "Jurídico", teste: /(contract|contrato|annex|anexo|service_order|os|legal)/i },
  { rotulo: "Cliente", teste: /(client|portal|cliente|projection|projecao|document)/i },
];

export function origemDoSinal(eventos: readonly EventoCaso[]) {
  const mapa = new Map<string, number>(AREAS.map((a) => [a.rotulo, 0]));
  for (const e of eventos) {
    const chave = `${e.origem ?? ""} ${e.tipo ?? ""}`;
    const area = AREAS.find((a) => a.teste.test(chave));
    if (!area) continue;
    mapa.set(area.rotulo, (mapa.get(area.rotulo) ?? 0) + 1);
  }
  const itens = [...mapa.entries()].map(([rotulo, valor]) => ({ rotulo, valor }));
  return itens.some((i) => i.valor > 0) ? itens : [];
}
