/**
 * Jornada dos casos no Painel — a fase como percurso, não como lista.
 *
 * Decisão da Proprietária (26/08/2026): "não quero listas e sim jornada dentro
 * do sistema". O Desk já sabia a fase de cada caso e já sabia há quantos dias
 * cada um está sem toque; o que faltava era ler as duas coisas juntas, na
 * ordem em que a jornada acontece.
 *
 * Fonte: `crm_casos.fase` + a cadência já calculada pelo Painel. Nenhuma
 * consulta nova — só o campo `fase`, que passou a vir no mesmo `select`.
 *
 * Módulo puro: não grava, não envia, não decide nada. Só ordena e conta.
 */

import { FASES_JORNADA } from "@/lib/onboarding-jornada";
import { rotuloFase, rotuloFaseCliente } from "@/lib/fase-rotulo";

/** O que a jornada precisa de cada caso já carregado no Painel. */
export type CasoNaJornada = {
  id: string;
  codigo?: string | null;
  titulo?: string | null;
  fase?: string | null;
  cadencia?: { status?: string | null; diasSemTouchpoint?: number | null } | null;
};

export type EtapaJornada = {
  id: string;
  rotulo: string;
  /** Como o cliente lê esta etapa no App — a coluna "Onde unifica" do fluxo. */
  rotuloCliente: string;
  ordem: number;
  total: number;
  /** Casos desta etapa sem toque há tempo demais (atenção + crítico). */
  semToque: number;
  /** Maior número de dias sem toque dentro da etapa; null se não há caso. */
  piorEspera: number | null;
  /** Um caso concreto para abrir, escolhido pela pior espera. */
  exemplo: { id: string; rotulo: string; dias: number | null } | null;
};

export type LeituraJornada = {
  etapas: EtapaJornada[];
  /** Casos cuja fase não está no catálogo — nunca somem em silêncio. */
  foraDoCatalogo: { fase: string; total: number }[];
  semFase: number;
  total: number;
};

const norm = (v: string) => v.trim().toLowerCase().replace(/_e_/g, "_");

function rotuloDoCaso(c: CasoNaJornada): string {
  return c.codigo?.trim() || c.titulo?.trim() || c.id;
}

function diasDe(c: CasoNaJornada): number | null {
  const d = c.cadencia?.diasSemTouchpoint;
  return typeof d === "number" && Number.isFinite(d) ? d : null;
}

/**
 * Monta a jornada na ordem canônica das oito fases.
 *
 * Uma etapa vazia continua aparecendo: o vazio é informação — mostra onde a
 * carteira não tem ninguém. O que nunca aparece inventado é número: caso sem
 * fase registrada vai para `semFase`, e fase fora do catálogo vai para
 * `foraDoCatalogo`, em vez de ser empurrado para a etapa mais parecida.
 */
export function lerJornada(casos: readonly CasoNaJornada[] = []): LeituraJornada {
  const porEtapa = new Map<string, CasoNaJornada[]>();
  for (const f of FASES_JORNADA) porEtapa.set(norm(f.id), []);

  const fora = new Map<string, number>();
  let semFase = 0;

  for (const c of casos) {
    const bruta = String(c.fase ?? "").trim();
    if (!bruta) {
      semFase += 1;
      continue;
    }
    const chave = norm(bruta);
    const balde = porEtapa.get(chave);
    if (balde) balde.push(c);
    else fora.set(bruta, (fora.get(bruta) ?? 0) + 1);
  }

  const etapas = FASES_JORNADA.map((f, i) => {
    const lista = porEtapa.get(norm(f.id)) ?? [];
    const comDias = lista
      .map((c) => ({ c, dias: diasDe(c) }))
      .sort((a, b) => (b.dias ?? -1) - (a.dias ?? -1));
    const pior = comDias[0];

    return {
      id: f.id,
      rotulo: rotuloFase(f.id),
      rotuloCliente: rotuloFaseCliente(f.id) ?? f.rotulo,
      ordem: i + 1,
      total: lista.length,
      semToque: lista.filter((c) => {
        const s = c.cadencia?.status;
        return s === "atencao" || s === "critico";
      }).length,
      piorEspera: pior?.dias ?? null,
      exemplo: pior ? { id: pior.c.id, rotulo: rotuloDoCaso(pior.c), dias: pior.dias } : null,
    } satisfies EtapaJornada;
  });

  return {
    etapas,
    foraDoCatalogo: [...fora.entries()]
      .map(([fase, total]) => ({ fase, total }))
      .sort((a, b) => b.total - a.total),
    semFase,
    total: casos.length,
  };
}

/**
 * A etapa que merece o olho primeiro: mais casos parados por falta de toque e,
 * no empate, a que espera há mais tempo. Devolve null quando não há nada
 * parado — nesse caso a tela não deve inventar urgência.
 */
export function etapaQuePedeAtencao(leitura: LeituraJornada): EtapaJornada | null {
  const candidatas = leitura.etapas.filter((e) => e.semToque > 0);
  if (!candidatas.length) return null;
  return candidatas.sort(
    (a, b) => b.semToque - a.semToque || (b.piorEspera ?? -1) - (a.piorEspera ?? -1),
  )[0];
}
