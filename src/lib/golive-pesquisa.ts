/**
 * Cálculos de apresentação da Pesquisa do caso e da Biblioteca.
 *
 * Funções puras: recebem o que o motor aprovado já leu (fontes, evidências,
 * achados e fila editorial) e devolvem contagens. Não buscam dado, não
 * inferem estado ausente e não criam fonte fictícia — sem registro, a
 * contagem é zero e a tela mostra o estado vazio canônico.
 *
 * Datas: `created_at`, `reviewed_at`, `validated_at`, `published_at` chegam
 * como timestamp com fuso; `planned_for` é só dia. A leitura reaproveita
 * `paraData()` de `golive-operacao`, que trata data sem horário como
 * meia-noite local. Toda função temporal aceita `agora` injetável.
 */

import { paraData } from "@/lib/golive-operacao";

export type FontePesquisa = {
  id: string;
  titulo: string;
  tipo: string | null;
  status: string | null;
  instituicao?: string | null;
  criadaEm?: string | null;
};

export type EvidenciaPesquisa = {
  id: string;
  titulo: string;
  tipo: string | null;
  status: string | null;
  confianca: string | null;
  fonteId?: string | null;
  responsavel?: string | null;
  criadaEm?: string | null;
  fornecidaPeloCliente?: boolean;
  origemExterna?: boolean;
};

export type AchadoPesquisa = {
  id: string;
  titulo: string;
  confianca: string | null;
  validacao: string | null;
  publicavel?: boolean;
  criadoEm?: string | null;
};

export type ItemEditorial = {
  id: string;
  titulo: string;
  tipo: string | null;
  status: string | null;
  responsavel?: string | null;
  previstoPara?: string | null;
  publicadoEm?: string | null;
};

const DIA = 86_400_000;

/* ------------------------------------------------------------------ *
 * 1. Cobertura por fonte
 * ------------------------------------------------------------------ */

const ROTULO_TIPO: Record<string, string> = {
  document: "Documento",
  record_excerpt: "Trecho de registro",
  photo: "Fotografia",
  oral_history: "História oral",
  registry_entry: "Registro civil",
  archive_reference: "Referência de arquivo",
  timeline_item: "Linha do tempo",
  correspondence: "Correspondência",
  structured_note: "Nota estruturada",
  other: "Outros/sem classificação",
};

export function rotuloTipoEvidencia(tipo: string | null | undefined) {
  if (!tipo) return "Outros/sem classificação";
  return ROTULO_TIPO[tipo] ?? "Outros/sem classificação";
}

/** Validada = `validated`. Em revisão = coletada ou em revisão. */
export function estadoEvidencia(e: EvidenciaPesquisa): "validada" | "em_revisao" | "outro" {
  if (e.status === "validated") return "validada";
  if (e.status === "collected" || e.status === "under_review") return "em_revisao";
  return "outro";
}

export type CoberturaFonte = {
  rotulo: string;
  validadas: number;
  emRevisao: number;
  total: number;
};

export function coberturaPorFonte(evidencias: EvidenciaPesquisa[]): CoberturaFonte[] {
  const mapa = new Map<string, CoberturaFonte>();
  for (const e of evidencias) {
    const rotulo = rotuloTipoEvidencia(e.tipo);
    const atual = mapa.get(rotulo) ?? { rotulo, validadas: 0, emRevisao: 0, total: 0 };
    const estado = estadoEvidencia(e);
    if (estado === "validada") atual.validadas += 1;
    if (estado === "em_revisao") atual.emRevisao += 1;
    atual.total += 1;
    mapa.set(rotulo, atual);
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total || a.rotulo.localeCompare(b.rotulo));
}

/* ------------------------------------------------------------------ *
 * 2. Produção de evidência por semana
 * ------------------------------------------------------------------ */

/** Segunda-feira da semana da data, meia-noite local. */
export function inicioDaSemana(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  const diaSemana = (c.getDay() + 6) % 7; // segunda = 0
  c.setDate(c.getDate() - diaSemana);
  return c;
}

export type ProducaoSemana = {
  chave: string;
  rotulo: string;
  fontes: number;
  evidencias: number;
  achados: number;
  total: number;
};

const chaveSemana = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const rotuloSemana = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

export function producaoSemanal(
  entrada: { fontes: FontePesquisa[]; evidencias: EvidenciaPesquisa[]; achados: AchadoPesquisa[] },
  semanas = 7,
  agora: Date = new Date(),
): ProducaoSemana[] {
  const base = inicioDaSemana(agora);
  const janelas: ProducaoSemana[] = [];
  for (let i = semanas - 1; i >= 0; i -= 1) {
    const inicio = new Date(base.getTime() - i * 7 * DIA);
    janelas.push({
      chave: chaveSemana(inicio),
      rotulo: rotuloSemana(inicio),
      fontes: 0,
      evidencias: 0,
      achados: 0,
      total: 0,
    });
  }
  const indice = new Map(janelas.map((j) => [j.chave, j]));

  const somar = (valor: string | null | undefined, campo: "fontes" | "evidencias" | "achados") => {
    const d = paraData(valor ?? null);
    if (!d) return;
    const alvo = indice.get(chaveSemana(inicioDaSemana(d)));
    if (!alvo) return;
    alvo[campo] += 1;
    alvo.total += 1;
  };

  for (const f of entrada.fontes) somar(f.criadaEm, "fontes");
  for (const e of entrada.evidencias) somar(e.criadaEm, "evidencias");
  for (const a of entrada.achados) somar(a.criadoEm, "achados");

  return janelas;
}

/* ------------------------------------------------------------------ *
 * 3. Fila editorial
 * ------------------------------------------------------------------ */

export type EtapaEditorial = "rascunho" | "revisao" | "aprovado" | "publicado" | "outros";

const MAPA_EDITORIAL: Record<string, EtapaEditorial> = {
  ideia: "rascunho",
  pauta_aprovada: "rascunho",
  rascunho: "rascunho",
  em_revisao: "revisao",
  aprovado: "aprovado",
  agendado: "aprovado",
  publicado: "publicado",
};

export function etapaEditorial(status: string | null | undefined): EtapaEditorial {
  if (!status) return "outros";
  return MAPA_EDITORIAL[status] ?? "outros";
}

export const ROTULO_ETAPA_EDITORIAL: Record<EtapaEditorial, string> = {
  rascunho: "Rascunho",
  revisao: "Em revisão",
  aprovado: "Aprovado",
  publicado: "Publicado",
  outros: "Outros/sem classificação",
};

export const ORDEM_EDITORIAL: EtapaEditorial[] = ["rascunho", "revisao", "aprovado", "publicado", "outros"];

export function filaEditorial(itens: ItemEditorial[]): { etapa: EtapaEditorial; rotulo: string; itens: ItemEditorial[] }[] {
  return ORDEM_EDITORIAL.map((etapa) => ({
    etapa,
    rotulo: ROTULO_ETAPA_EDITORIAL[etapa],
    itens: itens.filter((i) => etapaEditorial(i.status) === etapa),
  })).filter((coluna) => coluna.etapa !== "outros" || coluna.itens.length > 0);
}

/* ------------------------------------------------------------------ *
 * Cadeia visual: pergunta → fonte → evidência → achado → revisão → publicação
 * ------------------------------------------------------------------ */

export type PassoCadeia = { rotulo: string; quantidade: number; feito: boolean };

export function cadeiaPesquisa(entrada: {
  perguntas: number;
  fontes: FontePesquisa[];
  evidencias: EvidenciaPesquisa[];
  achados: AchadoPesquisa[];
  editorial: ItemEditorial[];
}): PassoCadeia[] {
  const emRevisao = entrada.evidencias.filter((e) => estadoEvidencia(e) === "em_revisao").length;
  const publicados = entrada.editorial.filter((i) => etapaEditorial(i.status) === "publicado").length;
  const passos: PassoCadeia[] = [
    { rotulo: "Pergunta", quantidade: entrada.perguntas, feito: entrada.perguntas > 0 },
    { rotulo: "Fonte", quantidade: entrada.fontes.length, feito: entrada.fontes.length > 0 },
    { rotulo: "Evidência", quantidade: entrada.evidencias.length, feito: entrada.evidencias.length > 0 },
    { rotulo: "Achado", quantidade: entrada.achados.length, feito: entrada.achados.length > 0 },
    { rotulo: "Revisão", quantidade: emRevisao, feito: emRevisao > 0 },
    { rotulo: "Publicação", quantidade: publicados, feito: publicados > 0 },
  ];
  return passos;
}
