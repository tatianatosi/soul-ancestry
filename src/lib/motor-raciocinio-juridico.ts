/**
 * Motor de raciocínio jurídico automático (Corte 2, 27/09/2026).
 *
 * Autorização explícita da Proprietária ("pode executar o motor de
 * raciocínio jurídico automático, pode construir"). A especificação
 * original (`docs/prompts/instrucoes-motor-cidadania-v1.0.md`, nunca
 * aprovada como schema) proíbe explicitamente um único "score de
 * elegibilidade" — pede 3 índices separados (completude documental,
 * continuidade da linha, confiabilidade jurídica), nunca fundidos num
 * percentual. Este módulo é puro, só leitura, nunca escreve, nunca
 * inventa fato jurídico/genealógico — mesmo padrão de
 * `avaliarValidacaoJuridicaCaso`/`calcularRadar`.
 *
 * Nenhuma tabela nova, nenhum writer novo: os 3 índices são derivados de
 * dado já existente e já lido em outros módulos (lineage_paths,
 * lineage_encounters, versioned_legal_rules, legal_reference_milestones,
 * research_evidence_items, crm_casos.documentos_minimos_ok).
 */

export type LineagePathBruto = {
  id: string;
  status: "em_estruturacao" | "em_pesquisa" | "com_suporte" | "bloqueada" | "concluida" | "descartada";
  evidencias_chave: readonly string[];
};

export type LineageEncounterBruto = {
  id: string;
  lineage_path_a_id: string | null;
  lineage_path_b_id: string | null;
  confidence_internal: "hipotese" | "indicio" | "consistente" | "documentado";
  validation_status: "rascunho" | "em_revisao" | "validado_internamente" | "divergente" | "arquivado";
};

export type ContinuidadeDaLinha = {
  statusLinha: LineagePathBruto["status"];
  totalElos: number;
  elosComprovados: number;
  proporcao: number | null;
  pendencias: string[];
};

/**
 * Índice 1 — continuidade da linha: proporção de encontros/junções desta
 * linha (`lineage_encounters`, ligados por `lineage_path_a_id`/`_b_id`)
 * já com confiança interna consistente/documentada E validação interna
 * confirmada. Nunca infere o elo que falta — só sinaliza a lacuna.
 */
export function continuidadeDaLinha(
  path: LineagePathBruto,
  encontros: readonly LineageEncounterBruto[],
): ContinuidadeDaLinha {
  const relacionados = encontros.filter(
    (e) => e.lineage_path_a_id === path.id || e.lineage_path_b_id === path.id,
  );
  const comprovados = relacionados.filter(
    (e) =>
      (e.confidence_internal === "consistente" || e.confidence_internal === "documentado") &&
      e.validation_status === "validado_internamente",
  );

  const pendencias: string[] = [];
  if (relacionados.length === 0) {
    pendencias.push(
      "Nenhum encontro/junção de linhagem registrado para esta linha — continuidade ainda não verificável.",
    );
  } else if (comprovados.length < relacionados.length) {
    pendencias.push(
      `${relacionados.length - comprovados.length} elo(s) desta linha ainda em hipótese/indício ou sem validação interna.`,
    );
  }
  if (path.status === "bloqueada" || path.status === "descartada") {
    pendencias.push(`Linha marcada como "${path.status}" — transmissão não pode ser considerada em curso.`);
  }
  if (path.evidencias_chave.length === 0) {
    pendencias.push("Nenhuma evidência-chave vinculada a esta linha ainda.");
  }

  return {
    statusLinha: path.status,
    totalElos: relacionados.length,
    elosComprovados: comprovados.length,
    proporcao: relacionados.length ? comprovados.length / relacionados.length : null,
    pendencias,
  };
}

export type EvidenciaBrutaParaCompletude = {
  evidence_status: "collected" | "under_review" | "validated" | "inconclusive" | "discarded" | "archived";
};

export type CompletudeDocumental = {
  documentosMinimosOk: boolean;
  totalEvidencias: number;
  evidenciasValidadas: number;
  proporcaoValidada: number | null;
  pendencias: string[];
};

/**
 * Índice 2 — completude documental: reaproveita o mesmo sinal já usado no
 * gate do Portal (`crm_casos.documentos_minimos_ok`) e a proporção de
 * evidências já com `evidence_status = 'validated'` sobre o total do
 * caso. Nunca calcula "% de elegibilidade" — só descreve o que já foi
 * documentado vs. o que falta.
 */
export function completudeDocumental(
  documentosMinimosOk: boolean,
  evidencias: readonly EvidenciaBrutaParaCompletude[],
): CompletudeDocumental {
  const validadas = evidencias.filter((e) => e.evidence_status === "validated");
  const pendencias: string[] = [];
  if (!documentosMinimosOk) {
    pendencias.push("Documentos mínimos do caso ainda não confirmados (crm_casos.documentos_minimos_ok).");
  }
  if (evidencias.length === 0) {
    pendencias.push("Nenhuma evidência registrada para este caso ainda.");
  } else if (validadas.length < evidencias.length) {
    pendencias.push(`${evidencias.length - validadas.length} evidência(s) ainda não validada(s).`);
  }
  return {
    documentosMinimosOk,
    totalEvidencias: evidencias.length,
    evidenciasValidadas: validadas.length,
    proporcaoValidada: evidencias.length ? validadas.length / evidencias.length : null,
    pendencias,
  };
}

export type RegraJuridicaBruta = { status: "rascunho" | "em_revisao" | "aprovado" | "arquivado" };
export type MarcoJuridicoBruto = {
  status: string;
  lifecycle_status: string;
};

export type ConfiabilidadeJuridica = {
  totalRegras: number;
  regrasAprovadas: number;
  totalMarcos: number;
  marcosVigentes: number;
  proporcaoRegrasAprovadas: number | null;
  proporcaoMarcosVigentes: number | null;
  pendencias: string[];
};

/**
 * Índice 3 — confiabilidade jurídica: maturidade das regras
 * (`versioned_legal_rules.status`) e marcos (`legal_reference_milestones.
 * status`/`lifecycle_status`) já aplicáveis à trilha — mesmos campos que
 * `avaliarValidacaoJuridicaCaso` já lê para o gate de conformidade, agora
 * expostos como proporção de maturidade, nunca como parecer jurídico.
 */
export function confiabilidadeJuridica(
  regras: readonly RegraJuridicaBruta[],
  marcos: readonly MarcoJuridicoBruto[],
): ConfiabilidadeJuridica {
  const regrasAprovadas = regras.filter((r) => r.status === "aprovado");
  const marcosVigentes = marcos.filter(
    (m) => m.status === "vigente" && (m.lifecycle_status === "vigente" || m.lifecycle_status === "homologado"),
  );
  const pendencias: string[] = [];
  if (regras.length && regrasAprovadas.length < regras.length) {
    pendencias.push(`${regras.length - regrasAprovadas.length} regra(s) jurídica(s) ainda não aprovada(s).`);
  }
  if (marcos.length && marcosVigentes.length < marcos.length) {
    pendencias.push(`${marcos.length - marcosVigentes.length} marco(s) jurídico(s) ainda não vigente(s)/homologado(s).`);
  }
  return {
    totalRegras: regras.length,
    regrasAprovadas: regrasAprovadas.length,
    totalMarcos: marcos.length,
    marcosVigentes: marcosVigentes.length,
    proporcaoRegrasAprovadas: regras.length ? regrasAprovadas.length / regras.length : null,
    proporcaoMarcosVigentes: marcos.length ? marcosVigentes.length / marcos.length : null,
    pendencias,
  };
}

export type RaciocinioJuridicoCaso = {
  continuidade: ContinuidadeDaLinha[];
  completude: CompletudeDocumental;
  confiabilidade: ConfiabilidadeJuridica;
};

/**
 * Composição dos 3 índices para um caso — sempre separados, nunca
 * combinados num score único ou percentual de elegibilidade. Cada linha
 * de pesquisa (`lineage_paths`) recebe sua própria continuidade; o caso
 * inteiro recebe uma completude documental e uma confiabilidade jurídica.
 */
export function raciocinioJuridicoDoCaso(entrada: {
  linhas: readonly LineagePathBruto[];
  encontros: readonly LineageEncounterBruto[];
  documentosMinimosOk: boolean;
  evidencias: readonly EvidenciaBrutaParaCompletude[];
  regras: readonly RegraJuridicaBruta[];
  marcos: readonly MarcoJuridicoBruto[];
}): RaciocinioJuridicoCaso {
  return {
    continuidade: entrada.linhas.map((linha) => continuidadeDaLinha(linha, entrada.encontros)),
    completude: completudeDocumental(entrada.documentosMinimosOk, entrada.evidencias),
    confiabilidade: confiabilidadeJuridica(entrada.regras, entrada.marcos),
  };
}
