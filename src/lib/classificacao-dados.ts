/**
 * P0.2 — Classificação de origem do dado e proteção de projeção ao cliente.
 *
 * Regra inegociável: só registro comprovadamente `real` pode ser projetado a
 * um cliente autenticado. Qualquer outra classificação — inclusive a ausência
 * de classificação — é interna, rotulada e nunca sai do Desk.
 *
 * Este módulo NÃO apaga, move, converte nem reclassifica registro algum:
 * é uma camada de leitura/decisão sobre o que já existe.
 */

import { ehFixtureLinha, type LinhaComOrigem } from "./fixtures";

export const CLASSIFICACOES = [
  "real",
  "demo",
  "mock",
  "seed",
  "modelo",
  "importado_a_confirmar",
  "nao_classificado",
] as const;

export type ClassificacaoDado = (typeof CLASSIFICACOES)[number];

/** Única classificação projetável a cliente autenticado. */
export const CLASSIFICACOES_VISIVEIS_CLIENTE: readonly ClassificacaoDado[] = ["real"];

/** Rótulos internos (Desk). Nunca renderizar no App Cliente. */
export const ROTULO_CLASSIFICACAO: Record<ClassificacaoDado, string> = {
  real: "REAL",
  demo: "DEMONSTRAÇÃO",
  mock: "MOCK",
  seed: "SEED",
  modelo: "CASO-MODELO",
  importado_a_confirmar: "IMPORTADO — A CONFIRMAR",
  nao_classificado: "NÃO CLASSIFICADO",
};

export function ehClassificacao(valor: unknown): valor is ClassificacaoDado {
  return typeof valor === "string" && (CLASSIFICACOES as readonly string[]).includes(valor);
}

/** Sem classificação provável e explícita ⇒ `nao_classificado`. Nunca `real` por omissão. */
export function normalizarClassificacao(valor: unknown): ClassificacaoDado {
  return ehClassificacao(valor) ? valor : "nao_classificado";
}

export function visivelParaCliente(classificacao: ClassificacaoDado): boolean {
  return CLASSIFICACOES_VISIVEIS_CLIENTE.includes(classificacao);
}

export type LinhaClassificavel = LinhaComOrigem & {
  classificacao_dado?: unknown;
  data_origin?: string | null;
  origem_confirmada?: boolean | null;
};

/**
 * Classifica uma linha vinda do banco ou de fixture.
 * Ordem: classificação explícita > heurística de fixture/demo > origem
 * confirmada por pessoa da equipe > `nao_classificado`.
 */
export function classificarLinha(linha: LinhaClassificavel | null | undefined): ClassificacaoDado {
  if (!linha) return "nao_classificado";
  if (ehClassificacao(linha.classificacao_dado)) return linha.classificacao_dado;
  if (ehFixtureLinha(linha)) return "demo";
  if (linha.origem_confirmada === true) return "real";
  if ((linha.data_origin ?? "") === "real") return "real";
  return "nao_classificado";
}

/** Mantém apenas o que pode ser projetado a cliente autenticado. */
export function filtrarParaCliente<T extends LinhaClassificavel>(
  linhas: readonly T[] | null | undefined,
): T[] {
  return (linhas ?? []).filter((l) => visivelParaCliente(classificarLinha(l)));
}

/** Verdadeiro quando a linha NÃO pode ser mostrada ao cliente. */
export function bloqueadoParaCliente(linha: LinhaClassificavel | null | undefined): boolean {
  return !visivelParaCliente(classificarLinha(linha));
}

/**
 * Rótulo interno de classificação. Retorna `null` fora da superfície interna,
 * garantindo que nenhum componente vaze origem/classificação ao cliente.
 */
export function rotuloClassificacaoInterno(
  linha: LinhaClassificavel | null | undefined,
  superficieInterna: boolean,
): string | null {
  if (!superficieInterna) return null;
  return ROTULO_CLASSIFICACAO[classificarLinha(linha)];
}

/* ------------------------------------------------------------------ */
/* Inventário de fontes auditadas (P0.2)                               */
/* ------------------------------------------------------------------ */

export type Superficie = "app_cliente" | "desk" | "mockup_interno";

export interface FonteClassificada {
  modulo: string;
  descricao: string;
  classificacao: ClassificacaoDado;
  superficies: readonly Superficie[];
  /** Prova da origem. Vazio ⇒ pendência interna, jamais promovido a `real`. */
  prova: string;
}

/**
 * Fontes estáticas auditadas em `src/data`. Nenhuma foi apagada, movida ou
 * promovida a `real`: a classificação apenas documenta o que já são.
 */
export const INVENTARIO_FONTES: readonly FonteClassificada[] = [
  {
    modulo: "src/data/caseDataGiovanna.ts",
    descricao: "Caso de demonstração do mockup navegável",
    classificacao: "demo",
    superficies: ["mockup_interno"],
    prova: "Confirmado pela proprietária (01/09/2026): caso piloto não se realizou, nunca foi cliente real — cabeçalho do módulo corrigido para refletir isso.",
  },
  {
    modulo: "src/data/caseDataSophia.ts",
    descricao: "Caso-modelo de entrega consultiva",
    classificacao: "modelo",
    superficies: ["mockup_interno"],
    prova: "Usado como modelo de formato de entrega, não é cliente.",
  },
  {
    modulo: "src/data/case-registry.ts",
    descricao: "Registro central de estado do caso (mockup)",
    classificacao: "demo",
    superficies: ["mockup_interno"],
    prova: "Cabeçalho: 'Dados demonstrativos'.",
  },
  {
    modulo: "src/data/case-directory.ts",
    descricao: "Diretório dos casos do mockup",
    classificacao: "demo",
    superficies: ["mockup_interno"],
    prova: "Compõe apenas Giovanna + Sophia (ambos não-reais).",
  },
  {
    modulo: "src/data/caso-sophia.ts",
    descricao: "Modelo de entrega por caso",
    classificacao: "modelo",
    superficies: ["mockup_interno"],
    prova: "Derivado de caseDataSophia (modelo).",
  },
  {
    modulo: "src/data/casos.ts",
    descricao: "Jornada e financeiro do mockup",
    classificacao: "demo",
    superficies: ["mockup_interno"],
    prova: "Massa do mockup navegável, nunca sincronizada com o banco.",
  },
  {
    modulo: "src/data/client-one-page.ts",
    descricao: "One-page de pesquisa (mockup)",
    classificacao: "demo",
    superficies: ["mockup_interno"],
    prova: "Conteúdo ilustrativo do mockup.",
  },
  {
    modulo: "src/data/entrega-consultiva.ts",
    descricao: "Estrutura de entrega consultiva",
    classificacao: "modelo",
    superficies: ["mockup_interno"],
    prova: "Formato de entrega aprovado, sem dado de cliente.",
  },
  {
    modulo: "src/data/studio-devolutivas.ts",
    descricao: "Studio de devolutivas (interno)",
    classificacao: "modelo",
    superficies: ["desk"],
    prova: "Biblioteca de formato interno.",
  },
  {
    modulo: "src/data/relatorio-visual.ts",
    descricao: "Relatório visual (mockup)",
    classificacao: "demo",
    superficies: ["mockup_interno"],
    prova: "Conteúdo ilustrativo do mockup.",
  },
  {
    modulo: "src/data/relatorio-fase02.ts",
    descricao: "Relatório da fase 02 (mockup)",
    classificacao: "demo",
    superficies: ["mockup_interno"],
    prova: "Conteúdo ilustrativo do mockup.",
  },
  {
    modulo: "src/data/activeCase.ts",
    descricao: "Seleção do caso ativo do mockup",
    classificacao: "demo",
    superficies: ["mockup_interno"],
    prova: "Aponta para o diretório de casos demonstrativos.",
  },
  {
    modulo: "src/data/caseTemplate.ts",
    descricao: "Template vazio para novo caso",
    classificacao: "modelo",
    superficies: ["mockup_interno"],
    prova: "Gabarito sem dado.",
  },
  {
    modulo: "src/data/propostas.ts",
    descricao: "Estrutura de proposta (referência)",
    classificacao: "modelo",
    superficies: ["desk"],
    prova: "Formato de proposta, valores vêm de fonte homologada.",
  },
  {
    modulo: "src/data/catalogo-fonte-mestre.ts",
    descricao: "Catálogo de fontes genealógicas",
    classificacao: "seed",
    superficies: ["desk"],
    prova: "Carga inicial curada pela equipe; não é dado de cliente.",
  },
  {
    modulo: "src/data/saneamento.ts",
    descricao: "Fila de saneamento interno",
    classificacao: "seed",
    superficies: ["desk"],
    prova: "Carga inicial de governança interna.",
  },
];

/** Fontes cuja origem não pôde ser provada — permanecem bloqueadas. */
export function fontesNaoClassificadas(
  inventario: readonly FonteClassificada[] = INVENTARIO_FONTES,
): FonteClassificada[] {
  return inventario.filter((f) => f.classificacao === "nao_classificado" || !f.prova.trim());
}

/** Fontes que, se chegarem ao App Cliente, configuram vazamento. */
export function fontesProibidasNoCliente(
  inventario: readonly FonteClassificada[] = INVENTARIO_FONTES,
): FonteClassificada[] {
  return inventario.filter(
    (f) => f.superficies.includes("app_cliente") && !visivelParaCliente(f.classificacao),
  );
}

export function totaisPorClassificacao(
  inventario: readonly FonteClassificada[] = INVENTARIO_FONTES,
): Record<ClassificacaoDado, number> {
  const base = Object.fromEntries(CLASSIFICACOES.map((c) => [c, 0])) as Record<
    ClassificacaoDado,
    number
  >;
  for (const f of inventario) base[f.classificacao] += 1;
  return base;
}
