/**
 * Cálculos de apresentação das superfícies Hoje, Kanban e Caso 360.
 *
 * Funções puras: recebem o que o motor aprovado já leu (caso/planejador,
 * ações, microentregas, eventos e carteira) e devolvem contagens. Não buscam
 * dado, não inferem valor ausente e não criam estado novo — quando não há
 * registro, a contagem é zero e a tela mostra o estado vazio canônico.
 *
 * Datas e fuso (documentado, sem conversão nova):
 * - `prazo` chega como `date` (só dia, "AAAA-MM-DD") em `tarefas.prazo` e
 *   `microentregas.prazo`, ou como timestamp em `tarefas.sla_prazo_em`.
 * - `concluidaEm` chega como timestamp (`timestamptz`, ISO com fuso).
 * - Data sem horário é lida como meia-noite **local**, nunca como UTC: usar
 *   `new Date("2026-09-14")` deslocaria o dia para trás no fuso de São Paulo
 *   (UTC-3). Por isso `paraData()` monta a data componente a componente.
 * - Toda função temporal aceita `agora` injetável para teste determinístico.
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

/** Só dia, sem horário: "AAAA-MM-DD". */
const SO_DIA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Converte o texto gravado em Date local. Data sem horário vira meia-noite
 * local (sem deslocamento UTC); timestamp com fuso é respeitado como veio.
 */
export function paraData(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  if (SO_DIA.test(valor)) {
    const [a, m, d] = valor.split("-").map(Number);
    return new Date(a!, m! - 1, d!, 0, 0, 0, 0);
  }
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

function meiaNoite(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Dias entre a data de referência e a data gravada; null sem data válida. */
export function diasAte(prazo: string | null | undefined, agora: Date = new Date()): number | null {
  const d = paraData(prazo);
  if (!d) return null;
  return Math.round((meiaNoite(d).getTime() - meiaNoite(agora).getTime()) / DIA);
}

const CONCLUIDO = /(conclu|public|entreg|aprovad|finaliz)/i;
const ENCERRADO = /(arquiv|cancel)/i;
/** Espera externa: só status explícito. `bloqueio` sozinho não classifica. */
const EXTERNO = /(aguard|extern|espera|pendente_cliente)/i;

export function estaConcluida(a: { status: string | null; concluidaEm: string | null }) {
  return Boolean(a.concluidaEm) || CONCLUIDO.test(a.status ?? "");
}

/** Cancelada ou arquivada: sai da carga e da distribuição de trabalho. */
export function estaEncerrada(a: { status: string | null }) {
  return ENCERRADO.test(a.status ?? "");
}

/** Fora do trabalho em aberto: concluída, cancelada ou arquivada. */
export function foraDoTrabalho(a: { status: string | null; concluidaEm: string | null }) {
  return estaConcluida(a) || estaEncerrada(a);
}

/**
 * Espera externa depende de status explícito. O campo `bloqueio` só conta
 * quando o próprio status também declara a espera — bloqueio não é sinônimo
 * de dependência externa.
 */
export function aguardandoExterno(a: { status: string | null }) {
  return EXTERNO.test(a.status ?? "");
}

/** Caso ativo: mesma definição usada pelos KPIs e pela rosca de prioridade. */
export function casoAtivo(c: CasoCarteira) {
  return !/(encerr|cancel|arquiv|perdid)/i.test(c.status ?? "");
}

/** Faixa de prazo de uma ação, pelo estado e pela data já gravados. */
export type FaixaPrazo =
  | "Vencida"
  | "Hoje"
  | "Próximos 7 dias"
  | "Aguardando externo"
  | "Concluída"
  | "Sem prazo";

export function faixaDePrazo(
  a: AcaoOperacional | MicroentregaOperacional,
  agora: Date = new Date(),
): FaixaPrazo {
  if (foraDoTrabalho(a)) return "Concluída";
  const d = diasAte(a.prazo, agora);
  // Prazo vencido prevalece sobre espera externa: o atraso precisa aparecer.
  if (d !== null && d < 0) return "Vencida";
  if (aguardandoExterno(a)) return "Aguardando externo";
  if (d === null) return "Sem prazo";
  if (d === 0) return "Hoje";
  if (d <= 7) return "Próximos 7 dias";
  return "Sem prazo";
}

/** KPIs de Hoje: carteira ativa e saúde das ações do caso. */
export function kpisHoje(
  carteira: readonly CasoCarteira[],
  acoes: readonly AcaoOperacional[],
  agora: Date = new Date(),
) {
  const ativa = carteira.filter(casoAtivo);
  const ativos = ativa.length;
  const vencidas = acoes.filter((a) => faixaDePrazo(a, agora) === "Vencida").length;
  const semProxima = ativa.filter((c) => !c.temProximaAcao).length;
  const externo = acoes.filter((a) => faixaDePrazo(a, agora) === "Aguardando externo").length;
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
  agora: Date = new Date(),
): { rotulo: string; valor: number }[] {
  const hoje = meiaNoite(agora);
  // Semana começa na segunda: domingo pertence à semana que começou antes.
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
    if (!estaConcluida(m) || estaEncerrada(m)) continue;
    const data = paraData(m.concluidaEm);
    if (!data) continue;
    const t = data.getTime();
    const balde = baldes.find((b) => t >= b.inicio && t < b.fim);
    if (balde) balde.valor += 1;
  }
  return baldes.map((b) => ({ rotulo: b.rotulo, valor: b.valor }));
}

/** Há alguma microentrega concluída com data? Sem isso, a linha fica vazia. */
export function temRitmo(microentregas: readonly MicroentregaOperacional[]) {
  return microentregas.some((m) => estaConcluida(m) && !estaEncerrada(m) && Boolean(m.concluidaEm));
}

/**
 * Contagem de casos por prioridade — mesma carteira ativa dos KPIs. Caso
 * encerrado não entra na rosca, mesmo com prioridade alta gravada.
 */
export function prioridadeDaCarteira(carteira: readonly CasoCarteira[]) {
  const mapa = new Map<string, number>();
  for (const c of carteira) {
    if (!casoAtivo(c)) continue;
    if (!c.prioridade) continue;
    mapa.set(c.prioridade, (mapa.get(c.prioridade) ?? 0) + 1);
  }
  return [...mapa.entries()].map(([rotulo, valor]) => ({ rotulo, valor }));
}

/** Contagem por faixa de prazo, para os KPIs do Kanban. */
export function kpisPrazo(acoes: readonly AcaoOperacional[], agora: Date = new Date()) {
  const conta = (f: FaixaPrazo) => acoes.filter((a) => faixaDePrazo(a, agora) === f).length;
  return {
    vencida: conta("Vencida"),
    hoje: conta("Hoje"),
    proximos7: conta("Próximos 7 dias"),
    externo: conta("Aguardando externo"),
  };
}

/**
 * Distribuição de trabalho por etapa. Por padrão conta só o que está em
 * aberto; `incluirHistorico` é para card explicitamente histórico.
 */
export function distribuicaoPorEtapa(
  microentregas: readonly MicroentregaOperacional[],
  opcoes: { incluirHistorico?: boolean } = {},
) {
  const mapa = new Map<string, number>();
  for (const m of microentregas) {
    if (!m.fase) continue;
    if (!opcoes.incluirHistorico && foraDoTrabalho(m)) continue;
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
    if (foraDoTrabalho(i)) continue;
    if (!i.responsavel) continue;
    mapa.set(i.responsavel, (mapa.get(i.responsavel) ?? 0) + 1);
  }
  return [...mapa.entries()].map(([rotulo, valor]) => ({ rotulo, valor }));
}

/**
 * Área que originou cada evento do caso. Preferimos o tipo de entidade
 * canônico (`source_entity_type`); só caímos no tipo do evento quando a
 * entidade não veio. Evento não mapeado aparece como
 * "Outros/sem classificação" — nunca é escondido da contagem.
 */
export const SEM_CLASSIFICACAO = "Outros/sem classificação";

const AREAS: { rotulo: string; teste: RegExp }[] = [
  { rotulo: "Comercial", teste: /(lead|proposal|proposta|call|discovery|opportunit)/i },
  { rotulo: "Operação", teste: /(task|tarefa|microentrega|ops|onboarding|plan)/i },
  {
    rotulo: "Pesquisa",
    teste: /(research|pesquisa|evidence|evidencia|finding|achado|source|fonte)/i,
  },
  { rotulo: "Jurídico", teste: /(contract|contrato|annex|anexo|service_order|legal)/i },
  { rotulo: "Cliente", teste: /(client|portal|cliente|projection|projecao|document)/i },
];

function areaDoEvento(e: EventoCaso) {
  const canonico = (e.origem ?? "").trim();
  if (canonico) {
    const porEntidade = AREAS.find((a) => a.teste.test(canonico));
    if (porEntidade) return porEntidade.rotulo;
  }
  const tipo = (e.tipo ?? "").trim();
  if (tipo) {
    const porTipo = AREAS.find((a) => a.teste.test(tipo));
    if (porTipo) return porTipo.rotulo;
  }
  return SEM_CLASSIFICACAO;
}

export function origemDoSinal(eventos: readonly EventoCaso[]) {
  const mapa = new Map<string, number>(AREAS.map((a) => [a.rotulo, 0]));
  mapa.set(SEM_CLASSIFICACAO, 0);
  for (const e of eventos) {
    const area = areaDoEvento(e);
    mapa.set(area, (mapa.get(area) ?? 0) + 1);
  }
  const itens = [...mapa.entries()].map(([rotulo, valor]) => ({ rotulo, valor }));
  return itens.some((i) => i.valor > 0) ? itens : [];
}
