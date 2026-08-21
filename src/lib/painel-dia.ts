/**
 * Painel Hoje — consolidação diária.
 *
 * Regra central: o painel responde apenas "o que precisa de ação hoje, por quem
 * e até quando". Cada lead/caso aparece UMA vez, com a ação principal e os
 * demais bloqueios listados dentro do próprio item (a ficha contextual detalha).
 * Governança de catálogo, planejamento, métricas de jornada e conversão não
 * pertencem a esta tela.
 */

import type { Fila, ItemFila } from "@/lib/crm-desk";

export type ItemDia = {
  id: string;
  tipo: "lead" | "caso";
  rotulo: string;
  /** Ação principal consolidada (fila mais crítica com prazo mais antigo). */
  acao: string;
  data: string | null;
  responsavel: string | null;
  area: string | null;
  etapa: string | null;
  /** Demais bloqueios do mesmo registro, para abrir na ficha. */
  bloqueios: string[];
  demo: boolean;
  /** Falha de qualidade: item operacional sem dono resolvido. */
  semResponsavel: boolean;
  semPrazo: boolean;
};

/** Filas que descrevem disciplina comercial (não bloqueio de execução). */
const FILAS_COMERCIAIS = new Set(["calls_hoje", "propostas_sem_followup", "leads_sem_proxima_acao"]);

/** Filas que representam bloqueio crítico acionável hoje. */
const FILAS_BLOQUEIO = new Set([
  "contratos_enviados_pendentes",
  "pagamentos_aguardados",
  "onboardings_pendentes",
  "casos_pendencia_documental",
]);

const eDemo = (rotulo: string) => /demo|demonstra|fixture|teste/i.test(rotulo);

export const hojeISO = (d = new Date()) => d.toISOString().slice(0, 10);

export function somarDias(base: string, dias: number) {
  const d = new Date(`${base}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Consolida todas as filas em um item por registro. */
export function consolidarDia(filas: Fila[], opcoes?: { incluirDemo?: boolean }): ItemDia[] {
  const mapa = new Map<string, ItemDia & { criticidade: number }>();

  const ordenadas = [...filas].sort((a, b) => a.criticidade - b.criticidade);
  for (const fila of ordenadas) {
    for (const item of fila.itens as ItemFila[]) {
      const chave = `${item.tipo}:${item.id}`;
      const atual = mapa.get(chave);
      const descricao = `${fila.rotulo}: ${item.detalhe}`;
      if (!atual) {
        mapa.set(chave, {
          id: item.id,
          tipo: item.tipo,
          rotulo: item.rotulo,
          acao: item.detalhe,
          data: item.data ? String(item.data).slice(0, 10) : null,
          responsavel: item.responsavel,
          area: item.area,
          etapa: item.etapa,
          bloqueios: [],
          demo: eDemo(item.rotulo),
          semResponsavel: !item.responsavel,
          semPrazo: !item.data,
          criticidade: fila.criticidade,
        });
        continue;
      }
      atual.bloqueios.push(descricao);
      const nova = item.data ? String(item.data).slice(0, 10) : null;
      if (nova && (!atual.data || nova < atual.data)) {
        atual.data = nova;
        atual.acao = item.detalhe;
      }
      if (!atual.responsavel && item.responsavel) atual.responsavel = item.responsavel;
      atual.semResponsavel = !atual.responsavel;
      atual.semPrazo = !atual.data;
    }
  }

  const lista = [...mapa.values()].map(({ criticidade: _c, ...i }) => i);
  return opcoes?.incluirDemo ? lista : lista.filter((i) => !i.demo);
}

const porPrazo = (a: ItemDia, b: ItemDia) =>
  (a.data ?? "9999-12-31").localeCompare(b.data ?? "9999-12-31") ||
  (a.responsavel ?? "zzz").localeCompare(b.responsavel ?? "zzz");

export type FilaDia = { chave: "vencidas" | "hoje" | "proximos7"; rotulo: string; itens: ItemDia[] };

/** Fila priorizada única: vencidas, hoje e próximos 7 dias. */
export function filaPriorizada(itens: ItemDia[], hoje = hojeISO()): FilaDia[] {
  const limite = somarDias(hoje, 7);
  const comData = itens.filter((i) => i.data);
  return [
    { chave: "vencidas", rotulo: "Vencidas", itens: comData.filter((i) => i.data! < hoje).sort(porPrazo) },
    { chave: "hoje", rotulo: "Hoje", itens: comData.filter((i) => i.data === hoje).sort(porPrazo) },
    {
      chave: "proximos7",
      rotulo: "Próximos 7 dias",
      itens: comData.filter((i) => i.data! > hoje && i.data! <= limite).sort(porPrazo),
    },
  ];
}

export type Excecao = { chave: string; rotulo: string; itens: ItemDia[] };

/** Exceções que exigem dono — somente itens acionáveis. */
export function excecoesQueExigemDono(itens: ItemDia[], filas: Fila[], hoje = hojeISO()): Excecao[] {
  const bloqueioIds = new Set(
    filas.filter((f) => FILAS_BLOQUEIO.has(f.chave)).flatMap((f) => f.itens.map((i) => `${i.tipo}:${i.id}`)),
  );
  const naFila = new Set(
    filaPriorizada(itens, hoje)
      .flatMap((f) => f.itens)
      .map((i) => `${i.tipo}:${i.id}`),
  );
  const sem = (fn: (i: ItemDia) => boolean) => itens.filter(fn).sort(porPrazo);
  return [
    { chave: "sem_responsavel", rotulo: "Sem responsável", itens: sem((i) => i.semResponsavel) },
    { chave: "sem_proxima_acao", rotulo: "Sem próxima ação ou prazo", itens: sem((i) => i.semPrazo) },
    {
      chave: "bloqueio_critico",
      rotulo: "Bloqueio crítico acionável",
      itens: sem((i) => bloqueioIds.has(`${i.tipo}:${i.id}`) && (naFila.has(`${i.tipo}:${i.id}`) || i.semPrazo)),
    },
  ].filter((e) => e.itens.length > 0);
}

/** Comercial de hoje: calls, propostas sem follow-up e leads sem disciplina. */
export function comercialHoje(filas: Fila[], opcoes?: { incluirDemo?: boolean }) {
  const filtrar = (chave: string) =>
    (filas.find((f) => f.chave === chave)?.itens ?? []).filter((i) => opcoes?.incluirDemo || !eDemo(i.rotulo));
  return {
    calls: filtrar("calls_hoje"),
    propostas: filtrar("propostas_sem_followup"),
    semDisciplina: filtrar("leads_sem_proxima_acao"),
  };
}

/** Casos com documento, contrato ou ação com prazo vencido/para hoje. */
export function casosHoje(itens: ItemDia[], hoje = hojeISO()) {
  return itens.filter((i) => i.tipo === "caso" && i.data && i.data <= hoje).sort(porPrazo);
}

/** Dias sem touchpoint apresentáveis. Sentinelas (999, 9999) viram texto. */
export function textoDiasSemTouchpoint(dias: unknown): string {
  const n = Number(dias);
  if (!Number.isFinite(n) || n < 0 || n >= 365) return "sem touchpoint registrado";
  return `${n} dia${n === 1 ? "" : "s"} sem contato`;
}

export const FILAS_COMERCIAIS_CHAVES = FILAS_COMERCIAIS;
