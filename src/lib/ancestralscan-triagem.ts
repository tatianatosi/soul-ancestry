/**
 * Motor de Triagem AncestralScan → CRM Vivo/Mesa Discovery (P10, 25/09/2026).
 *
 * Camada pura: não lê banco, não grava, não decide elegibilidade. O
 * AncestralScan público é orientativo — pode sugerir país/trilha e perguntas
 * seguintes; nunca confirma elegibilidade, via, produto, preço ou direito.
 * "AncestralScan" não existe como código neste repositório (é uma
 * ferramenta do site institucional, fora deste app) — este módulo define o
 * contrato de payload que uma importação manual (Camada A) preenche, nos
 * termos que a Proprietária já especificou.
 */

export type StatusConsentimentoTriagem = "concedido" | "recusado" | "pendente" | "nao_solicitado";

/** Payload versionado e auditável de uma resposta pública do Scan. */
export type PayloadTriagemAncestralScan = {
  versaoScan: string;
  respondidoEm: string;
  origemCampanha: string | null;
  consentimentoStatus: StatusConsentimentoTriagem;
  consentimentoVersaoAviso: string | null;
  consentimentoEm: string | null;
  paisesDeclarados: string[];
  geracaoDeclarada: string | null;
  localidadeAscendenteDeclarada: string | null;
  documentosDeclarados: string[];
  respostasPublicas: Record<string, string | number | boolean | null>;
  alertasPublicos: string[];
  /** Scores orientativos do Scan — nunca lidos como elegibilidade/aprovação. */
  scoresOrientativos: Record<string, string | number | boolean | null>;
};

export type ErroValidacaoTriagem = { campo: string; motivo: string };

/** Só o mínimo para o registro ser auditável: versão, data e consentimento. */
export function validarTriagem(p: Partial<PayloadTriagemAncestralScan>): ErroValidacaoTriagem[] {
  const erros: ErroValidacaoTriagem[] = [];
  if (!p.versaoScan?.trim()) erros.push({ campo: "versaoScan", motivo: "Versão do Scan é obrigatória." });
  if (!p.respondidoEm?.trim()) erros.push({ campo: "respondidoEm", motivo: "Data/hora da resposta é obrigatória." });
  if (!p.consentimentoStatus) erros.push({ campo: "consentimentoStatus", motivo: "Status de consentimento é obrigatório." });
  return erros;
}

const texto = (v: unknown): string | null => {
  const s = String(v ?? "").trim();
  return s || null;
};

/** Só os 4 status já usados em `leads.consentimento_status` — mesmo vocabulário, sem inventar. */
export function mapearConsentimento(status: StatusConsentimentoTriagem): StatusConsentimentoTriagem {
  return status;
}

/**
 * Camada B — o único de-para entre a triagem declarada e o Lead canônico.
 * Nunca escreve elegibilidade, via confirmada, produto, preço ou score
 * interno: só o que a pessoa declarou no Scan.
 */
export function mapearTriagemParaLead(
  triagem: PayloadTriagemAncestralScan,
  nome: string,
): Record<string, unknown> {
  return {
    nome: texto(nome) ?? "Lead do AncestralScan",
    origem: "ancestralscan",
    data_origin: "real",
    nacionalidades_interesse: triagem.paisesDeclarados.map((p) => p.trim()).filter(Boolean),
    pais_interesse: triagem.paisesDeclarados[0]?.trim() || null,
    geracao_ascendente: texto(triagem.geracaoDeclarada),
    localidades_conhecidas: texto(triagem.localidadeAscendenteDeclarada),
    documentos_chave: triagem.documentosDeclarados.map((d) => d.trim()).filter(Boolean),
    consentimento_status: mapearConsentimento(triagem.consentimentoStatus),
    consentimento_versao_aviso: texto(triagem.consentimentoVersaoAviso),
    consentimento_em: triagem.consentimentoEm,
  };
}

export type TrilhaAtiva = {
  id: string;
  pais: string | null;
  via_preliminar: string | null;
  status_via: string | null;
  lifecycle_status: string;
};

export type EstadoSugestaoTrilha = "sugerida" | "a_confirmar" | "descartada" | "confirmada_humana";

export type SugestaoTrilha = {
  trackId: string;
  pais: string | null;
  via: string | null;
  /** Sinais que contribuíram — explicável, nunca um veredito. */
  sinais: string[];
  perguntasFaltantes: string[];
  alertasPublicos: string[];
  estado: EstadoSugestaoTrilha;
};

/**
 * Camada C — sugestão explicável, nunca veredito. Usa só respostas
 * declaradas + trilhas já ativas (`citizenship_tracks`, via
 * `listarTrilhasJuridicas`). Nunca retorna "elegível"/"inelegível"/"via
 * confirmada" nem percentual jurídico.
 */
export function sugerirTrilhasDaTriagem(
  triagem: Pick<PayloadTriagemAncestralScan, "paisesDeclarados" | "geracaoDeclarada" | "documentosDeclarados" | "alertasPublicos">,
  trilhasAtivas: readonly TrilhaAtiva[],
): SugestaoTrilha[] {
  const paisesDeclarados = new Set(triagem.paisesDeclarados.map((p) => p.trim().toLowerCase()).filter(Boolean));
  if (paisesDeclarados.size === 0) return [];

  const candidatas = trilhasAtivas.filter(
    (t) => t.lifecycle_status !== "arquivado" && t.pais && paisesDeclarados.has(t.pais.trim().toLowerCase()),
  );

  return candidatas
    .map((t): SugestaoTrilha => {
      const sinais = [`País declarado no Scan: ${t.pais}`];
      const perguntasFaltantes: string[] = [];
      if (!triagem.geracaoDeclarada) perguntasFaltantes.push("Geração do ascendente");
      if (triagem.documentosDeclarados.length === 0) perguntasFaltantes.push("Documentos disponíveis declarados");
      return {
        trackId: t.id,
        pais: t.pais,
        via: t.via_preliminar,
        sinais,
        perguntasFaltantes,
        alertasPublicos: [...triagem.alertasPublicos],
        estado: perguntasFaltantes.length > 0 ? "a_confirmar" : "sugerida",
      };
    })
    .sort((a, b) => a.perguntasFaltantes.length - b.perguntasFaltantes.length);
}

/**
 * Resumo de contexto de call (Camada B item 3) — nunca uma conclusão. Mostra
 * o que a pessoa declarou, para o humano perguntar, não para decidir sozinho.
 */
export type ResumoTriagemParaCall = {
  paisesDeclarados: string[];
  geracaoDeclarada: string | null;
  documentosDeclarados: string[];
  alertasPublicos: string[];
  perguntasSpinSugeridas: string[];
};

export function resumoTriagemParaCall(triagem: PayloadTriagemAncestralScan): ResumoTriagemParaCall {
  const perguntasSpinSugeridas: string[] = [];
  if (!triagem.geracaoDeclarada) perguntasSpinSugeridas.push("Qual a geração do ascendente com a nacionalidade declarada?");
  if (triagem.documentosDeclarados.length === 0) perguntasSpinSugeridas.push("Quais documentos a família já tem em mãos?");
  if (!triagem.localidadeAscendenteDeclarada) perguntasSpinSugeridas.push("Qual a localidade de origem do ascendente?");
  return {
    paisesDeclarados: triagem.paisesDeclarados,
    geracaoDeclarada: triagem.geracaoDeclarada,
    documentosDeclarados: triagem.documentosDeclarados,
    alertasPublicos: triagem.alertasPublicos,
    perguntasSpinSugeridas,
  };
}
