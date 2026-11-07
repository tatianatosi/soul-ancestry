/**
 * D01 (05/11/2026) — filtros do catálogo de fontes genealógicas: país, período, tipo de acervo,
 * acesso e grau de automação. As opções vêm só dos valores gravados em
 * genealogical_sources_catalog; nada é inferido. Período sai de anos de 4 dígitos escritos em
 * `cobertura_temporal`; fonte sem ano legível nunca entra num filtro de período.
 */
import { ACESSOS, rotuloDe, type Fonte } from "@/lib/fontes-genealogicas";

export const TIPOS_ACERVO: Record<string, string> = {
  arquivo_local: "Arquivo local",
  arquivo_publico: "Arquivo público",
  indice_digitalizado: "Índice digitalizado",
  registro_civil: "Registro civil",
  nao_classificado: "Não classificado",
};

export const GRAUS_AUTOMACAO: Record<string, string> = {
  sim: "Automação permitida",
  nao: "Sem automação",
  "a-confirmar": "Automação a confirmar",
};

export const SEM_REGISTRO = "__sem_registro__";

export type FiltrosFontes = {
  pais: string;
  seculo: string;
  tipo: string;
  acesso: string;
  automacao: string;
};

export const FILTROS_VAZIOS: FiltrosFontes = { pais: "", seculo: "", tipo: "", acesso: "", automacao: "" };

/** Anos de 4 dígitos (1000–2099) escritos na cobertura temporal; sem ano → null. */
export function intervaloDeAnos(cobertura: unknown): { inicio: number; fim: number } | null {
  if (typeof cobertura !== "string") return null;
  const anos = (cobertura.match(/\b(1\d{3}|20\d{2})\b/g) ?? []).map(Number);
  if (anos.length === 0) return null;
  return { inicio: Math.min(...anos), fim: Math.max(...anos) };
}

function seculoDe(ano: number): number {
  return Math.floor((ano - 1) / 100) + 1;
}

const ROMANOS: Record<number, string> = {
  11: "XI", 12: "XII", 13: "XIII", 14: "XIV", 15: "XV", 16: "XVI", 17: "XVII", 18: "XVIII", 19: "XIX", 20: "XX", 21: "XXI",
};

export function rotuloSeculo(seculo: number): string {
  return `Século ${ROMANOS[seculo] ?? seculo}`;
}

/** Séculos cobertos pela fonte, a partir do intervalo de anos gravado. */
export function seculosDaFonte(f: Fonte): number[] {
  const i = intervaloDeAnos(f.cobertura_temporal);
  if (!i) return [];
  const lista: number[] = [];
  for (let s = seculoDe(i.inicio); s <= seculoDe(i.fim); s++) lista.push(s);
  return lista;
}

type Opcao = { valor: string; rotulo: string; total: number };

function contar(fontes: Fonte[], chave: (f: Fonte) => string | null | undefined, rotulo: (v: string) => string): Opcao[] {
  const mapa = new Map<string, number>();
  for (const f of fontes) {
    const v = chave(f)?.toString().trim() || SEM_REGISTRO;
    mapa.set(v, (mapa.get(v) ?? 0) + 1);
  }
  return [...mapa.entries()]
    .map(([valor, total]) => ({ valor, total, rotulo: valor === SEM_REGISTRO ? "Não registrado" : rotulo(valor) }))
    .sort((a, b) => (a.valor === SEM_REGISTRO ? 1 : b.valor === SEM_REGISTRO ? -1 : a.rotulo.localeCompare(b.rotulo, "pt-BR")));
}

export function opcoesDosFiltros(fontes: Fonte[]) {
  const seculos = new Map<number, number>();
  let semPeriodo = 0;
  for (const f of fontes) {
    const lista = seculosDaFonte(f);
    if (lista.length === 0) semPeriodo++;
    for (const s of lista) seculos.set(s, (seculos.get(s) ?? 0) + 1);
  }
  return {
    pais: contar(fontes, (f) => f.pais_eixo, (v) => v),
    tipo: contar(fontes, (f) => f.tipo_de_acervo, (v) => TIPOS_ACERVO[v] ?? v),
    acesso: contar(fontes, (f) => f.acesso, (v) => rotuloDe(ACESSOS, v)),
    automacao: contar(fontes, (f) => f.permite_automacao, (v) => GRAUS_AUTOMACAO[v] ?? v),
    seculo: [...seculos.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([s, total]) => ({ valor: String(s), rotulo: rotuloSeculo(s), total })),
    semPeriodo,
  };
}

function confere(valor: unknown, filtro: string): boolean {
  if (!filtro) return true;
  const v = typeof valor === "string" ? valor.trim() : "";
  return filtro === SEM_REGISTRO ? v === "" : v === filtro;
}

export function aplicarFiltrosFontes(fontes: Fonte[], filtros: FiltrosFontes): Fonte[] {
  return fontes.filter(
    (f) =>
      confere(f.pais_eixo, filtros.pais) &&
      confere(f.tipo_de_acervo, filtros.tipo) &&
      confere(f.acesso, filtros.acesso) &&
      confere(f.permite_automacao, filtros.automacao) &&
      (!filtros.seculo || seculosDaFonte(f).includes(Number(filtros.seculo))),
  );
}

export function filtrosAtivos(filtros: FiltrosFontes): number {
  return Object.values(filtros).filter(Boolean).length;
}
