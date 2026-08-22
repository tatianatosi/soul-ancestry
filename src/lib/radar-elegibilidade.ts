/**
 * Radar de Elegibilidade Preliminar — instrumento INTERNO, explicável e auditável.
 *
 * Não é parecer jurídico, não decide, não garante direito, não estima prazo,
 * não seleciona SKU, não cria proposta/contrato/cobrança e não inicia pesquisa
 * externa. Nada aqui é projetado ao App Cliente sem sanitização humana.
 */

import type { LeadDesk } from "@/lib/crm-desk";

export const RADAR_VERSAO = "matriz-radar-v1.0";

export type FaixaSinal =
  | "forte"
  | "provavel"
  | "possivel_com_pesquisa"
  | "baixa"
  | "inconclusiva"
  | "sem_aderencia";

export const ROTULO_FAIXA: Record<FaixaSinal, string> = {
  forte: "Forte",
  provavel: "Provável",
  possivel_com_pesquisa: "Possível com pesquisa",
  baixa: "Baixa",
  inconclusiva: "Inconclusiva",
  sem_aderencia: "Sem aderência atual",
};

export type Confianca = "alta" | "media" | "baixa";

export type FatorRadar = {
  codigo: string;
  nome: string;
  /** Campo do lead que alimenta o fator. */
  campo: keyof LeadDesk;
  /** Fator exigido para sustentar sinal Forte/Provável. */
  exigido_para_forte: boolean;
};

/** 12 dimensões configuráveis da matriz (versão declarada em RADAR_VERSAO). */
export const FATORES_RADAR: FatorRadar[] = [
  { codigo: "F01", nome: "Identificação do ascendente/linha", campo: "linha_transmissao", exigido_para_forte: true },
  { codigo: "F02", nome: "Geração e continuidade da transmissão", campo: "geracao_ascendente", exigido_para_forte: true },
  { codigo: "F03", nome: "Estado documental inicial", campo: "estado_documental_inicial", exigido_para_forte: true },
  { codigo: "F04", nome: "Existência de documento-chave", campo: "documentos_chave", exigido_para_forte: false },
  { codigo: "F05", nome: "Riscos de ruptura conhecidos", campo: "risco_ruptura", exigido_para_forte: false },
  { codigo: "F06", nome: "Coerência de nomes, datas e localidades", campo: "localidades_conhecidas", exigido_para_forte: false },
  { codigo: "F07", nome: "Status e vigência da via de referência", campo: "status_via", exigido_para_forte: true },
  { codigo: "F08", nome: "Marco jurídico e necessidade de revisão", campo: "marco_referencia_id", exigido_para_forte: false },
  { codigo: "F09", nome: "Exigência de idioma/entrevista", campo: "exige_idioma_entrevista", exigido_para_forte: false },
  { codigo: "F10", nome: "Estrutura familiar e dependências", campo: "estrutura_familiar", exigido_para_forte: false },
  { codigo: "F11", nome: "Autorização e escopo de pesquisa", campo: "pesquisa_previa_autorizacao", exigido_para_forte: false },
  { codigo: "F12", nome: "Confiança da triagem", campo: "confianca_triagem", exigido_para_forte: true },
];

export type ResultadoRadar = {
  versao: string;
  faixa: FaixaSinal;
  rotulo: string;
  confianca: Confianca;
  /** Percentual de fatores disponíveis. NÃO é chance de êxito. */
  completude: number;
  favoraveis: string[];
  pendentes: { fator: string; acao: string }[];
  /** Motivos que impedem uso externo da leitura como referência vigente. */
  bloqueios_externos: string[];
  exige_revisao_humana: boolean;
  observacao: string;
};

const preenchido = (v: unknown) =>
  Array.isArray(v) ? v.filter((x) => x !== "nenhum_ainda").length > 0 : v !== null && v !== undefined && String(v).trim() !== "";

/** Marcos e vias que impedem recomendação automática / uso externo. */
export const VIAS_QUE_EXIGEM_REVISAO = ["restrita", "encerrada", "em_confirmacao_juridica"];

export type ContextoRadar = {
  /** Situação do marco jurídico de referência (STATUS_MARCO). */
  status_marco?: string | null;
};

/** Dados mínimos: objetivo, país/linha, ascendente/estrutura ou estado documental. */
export function temDadosMinimos(lead: LeadDesk): boolean {
  const objetivo = preenchido(lead.objetivo);
  const pais = preenchido(lead.pais_linha_prioritaria) || preenchido(lead.nacionalidade) || preenchido(lead.nacionalidades_interesse);
  const estrutura = preenchido(lead.geracao_ascendente) || preenchido(lead.linha_transmissao) || preenchido(lead.estrutura_familiar);
  const documental = preenchido(lead.estado_documental_inicial);
  return objetivo && pais && (estrutura || documental);
}

export function calcularRadar(lead: LeadDesk, ctx: ContextoRadar = {}): ResultadoRadar {
  const disponiveis = FATORES_RADAR.filter((f) => preenchido(lead[f.campo]));
  const completude = Math.round((disponiveis.length / FATORES_RADAR.length) * 100);
  const favoraveis = disponiveis.map((f) => f.nome);
  const pendentes = FATORES_RADAR.filter((f) => !preenchido(lead[f.campo])).map((f) => ({
    fator: f.nome,
    acao: `Registrar ${f.nome.toLowerCase()} na ficha de Discovery.`,
  }));

  const bloqueios: string[] = [];
  const marco = ctx.status_marco ?? null;
  if (marco && ["a_revisar", "desatualizado", "encerrado"].includes(marco)) {
    bloqueios.push("Marco jurídico a revisar/desatualizado: leitura não pode ser usada como referência vigente fora do Desk.");
  }
  const viaCritica = VIAS_QUE_EXIGEM_REVISAO.includes(String(lead.status_via ?? ""));
  if (viaCritica) {
    bloqueios.push("Via preliminar restrita, encerrada ou em confirmação jurídica: exige revisão humana antes de qualquer recomendação.");
  }

  if (!temDadosMinimos(lead)) {
    return {
      versao: RADAR_VERSAO,
      faixa: "inconclusiva",
      rotulo: ROTULO_FAIXA.inconclusiva,
      confianca: "baixa",
      completude,
      favoraveis,
      pendentes: pendentes.length
        ? pendentes
        : [{ fator: "Dados mínimos", acao: "Registrar objetivo, país/linha e estrutura ou estado documental." }],
      bloqueios_externos: bloqueios,
      exige_revisao_humana: true,
      observacao: "Sem dados suficientes para leitura preliminar. Nenhum sinal é atribuído.",
    };
  }

  const confianca: Confianca =
    lead.confianca_triagem === "documentos_vistos"
      ? "alta"
      : lead.confianca_triagem === "narrativa_parcial"
        ? "media"
        : "baixa";

  const declarado = String(lead.elegibilidade_preliminar ?? "");
  const faltamExigidos = FATORES_RADAR.filter((f) => f.exigido_para_forte && !preenchido(lead[f.campo]));

  let faixa: FaixaSinal;
  if (declarado === "sem_aderencia" || declarado === "sem_aderencia_atual") faixa = "sem_aderencia";
  else if (declarado === "forte" || declarado === "provavel") {
    faixa = faltamExigidos.length === 0 ? (declarado as FaixaSinal) : "possivel_com_pesquisa";
  } else if (declarado === "possivel_com_pesquisa" || declarado === "possivel") faixa = "possivel_com_pesquisa";
  else if (declarado === "baixa") faixa = "baixa";
  else faixa = completude >= 60 ? "possivel_com_pesquisa" : "inconclusiva";

  if ((faixa === "forte" || faixa === "provavel") && (viaCritica || confianca === "baixa")) {
    faixa = "possivel_com_pesquisa";
  }

  const pendentesFinais = faltamExigidos.length
    ? faltamExigidos.map((f) => ({
        fator: f.nome,
        acao: `Fator obrigatório para sinal Forte/Provável — confirmar ${f.nome.toLowerCase()}.`,
      }))
    : pendentes;

  return {
    versao: RADAR_VERSAO,
    faixa,
    rotulo: ROTULO_FAIXA[faixa],
    confianca,
    completude,
    favoraveis,
    pendentes: pendentesFinais,
    bloqueios_externos: bloqueios,
    exige_revisao_humana: viaCritica || bloqueios.length > 0 || faixa === "inconclusiva",
    observacao:
      "Leitura preliminar interna. Não é parecer jurídico, não garante direito e não define prazo, produto ou preço.",
  };
}

export type AlteracaoManual = {
  faixa: FaixaSinal;
  justificativa?: string | null;
  responsavel?: string | null;
  versao_matriz?: string | null;
};

/** Alteração manual do sinal exige justificativa, responsável e versão da matriz. */
export function validarAlteracaoManual(a: AlteracaoManual): string[] {
  const erros: string[] = [];
  if (!a.justificativa || a.justificativa.trim().length < 10) erros.push("Justificativa obrigatória (mínimo 10 caracteres).");
  if (!a.responsavel || !a.responsavel.trim()) erros.push("Responsável pela alteração é obrigatório.");
  if (!a.versao_matriz || !a.versao_matriz.trim()) erros.push("Versão da matriz do Radar é obrigatória.");
  return erros;
}

/** Projeção sanitizada para o App Cliente (somente após aprovação humana). */
export function leituraSanitizada(r: ResultadoRadar): {
  titulo: string;
  pontos_favoraveis: string[];
  a_confirmar: string[];
  proximo_passo: string;
} {
  return {
    titulo: "Leitura inicial da jornada",
    pontos_favoraveis: r.favoraveis.slice(0, 3),
    a_confirmar: r.pendentes.slice(0, 3).map((p) => p.fator),
    proximo_passo: "Reunir os documentos indicados pela equipe para confirmação documental.",
  };
}
