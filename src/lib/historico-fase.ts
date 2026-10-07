/**
 * Histórico por fase (item E, 07/10/2026) — "em cada fase (Lead, Discovery,
 * Proposta, Contrato, Pesquisa, Árvore) a equipe registra o histórico
 * daquela fase, com data, fonte e anexo ou texto colado. Auditado, sem
 * importação em bloco."
 *
 * Sem tabela nova: `case_timeline_events.phase` já existe (texto livre, hoje
 * quase sempre vazio ou usado ad hoc: "Formalização", "Go-live",
 * "Discovery") e `event_type` já é usado informalmente como fase em outros
 * lugares (valores reais no banco incluem `lead`, `discovery`, `proposta`,
 * `contrato`). Este módulo fixa um vocabulário explícito de 6 fases para o
 * registro MANUAL de histórico, usando `event_type` para a fase e
 * `source_entity_type = MARCADOR_HISTORICO_FASE` como marca de que a linha é
 * um registro manual desta ficha (não um evento automático de outro motor).
 *
 * "Sem importação em bloco": um registro por vez, cada um com data (pode ser
 * retroativa — o evento aconteceu no passado), fonte (quem/o quê) e o
 * conteúdo (texto colado ou descrição do anexo). Nunca edita um registro já
 * arquivado; arquivar sempre exige motivo.
 */

export const FASES_HISTORICO = [
  { valor: "lead", rotulo: "Lead" },
  { valor: "discovery", rotulo: "Discovery" },
  { valor: "proposta", rotulo: "Proposta" },
  { valor: "contrato", rotulo: "Contrato" },
  { valor: "pesquisa", rotulo: "Pesquisa" },
  { valor: "arvore", rotulo: "Árvore" },
] as const;

export type FaseHistorico = (typeof FASES_HISTORICO)[number]["valor"];

export const MARCADOR_HISTORICO_FASE = "historico_fase_registro";

export type EntradaHistoricoFase = {
  fase: string;
  dataOcorrencia: string;
  fonte: string;
  conteudo: string;
};

const t = (v: unknown) => (v == null ? "" : String(v).trim());

export function faseValida(fase: string): fase is FaseHistorico {
  return FASES_HISTORICO.some((f) => f.valor === fase);
}

export function rotuloFase(fase: string): string {
  return FASES_HISTORICO.find((f) => f.valor === fase)?.rotulo ?? fase;
}

export function validarEntradaHistorico(e: EntradaHistoricoFase): string[] {
  const erros: string[] = [];
  if (!faseValida(t(e.fase))) {
    erros.push(`Escolha uma fase válida (${FASES_HISTORICO.map((f) => f.rotulo).join(", ")}).`);
  }
  const data = t(e.dataOcorrencia);
  if (!data || Number.isNaN(Date.parse(data))) {
    erros.push("Informe a data em que isso aconteceu.");
  } else if (new Date(data).getTime() > Date.now() + 24 * 60 * 60 * 1000) {
    erros.push("A data não pode estar no futuro.");
  }
  if (t(e.fonte).length < 3) {
    erros.push("Informe a fonte (quem registrou, de onde veio a informação).");
  }
  if (t(e.conteudo).length < 5) {
    erros.push("Cole o texto ou descreva o anexo — o histórico não pode ficar vazio.");
  }
  return erros;
}

export type RegistroHistoricoFase = {
  id: string;
  fase: string;
  dataOcorrencia: string | null;
  fonte: string;
  conteudo: string | null;
  registradoEm: string | null;
  registradoPor: string | null;
};

/** Normaliza a linha crua de `case_timeline_events` para o formato da tela. */
export function paraRegistroHistorico(linha: Record<string, unknown>): RegistroHistoricoFase {
  return {
    id: String(linha["id"]),
    fase: t(linha["event_type"]),
    dataOcorrencia: (linha["occurred_at"] as string | null) ?? null,
    fonte: t(linha["title"]),
    conteudo: (linha["summary_internal"] as string | null) ?? null,
    registradoEm: (linha["created_at"] as string | null) ?? null,
    registradoPor: (linha["responsavel_nome"] as string | null) ?? null,
  };
}
