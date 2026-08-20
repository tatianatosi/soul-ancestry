/**
 * Matriz interna de decisão jurídica.
 *
 * Registra TEMAS pendentes de revisão — nunca texto de cláusula. Nenhum tema
 * pendente pode virar cláusula, e nenhum conteúdo do site é tratado como
 * versão jurídica vigente.
 */

export const STATUS_TEMA = [
  { valor: "pendente_revisao_juridica", rotulo: "Pendente de revisão jurídica" },
  { valor: "aprovado", rotulo: "Aprovado" },
  { valor: "rejeitado", rotulo: "Rejeitado" },
  { valor: "substituir", rotulo: "Substituir" },
  { valor: "nao_aplicavel", rotulo: "Não aplicável" },
] as const;
export type StatusTema = (typeof STATUS_TEMA)[number]["valor"];

export type TemaJuridico = {
  tema_codigo: string;
  tema: string;
  bloqueia_assinatura: boolean;
  impacto_templates: string[];
};

/** Temas normativos cadastrados na matriz. Sem redação, só decisão. */
export const TEMAS_JURIDICOS: TemaJuridico[] = [
  { tema_codigo: "natureza_servico", tema: "Natureza intelectual/técnica do serviço", bloqueia_assinatura: true, impacto_templates: ["MODELO-ESTUDO", "BASE-GEN-V2"] },
  { tema_codigo: "nao_garantia", tema: "Não garantia de documento, linhagem, cidadania, resultado ou prazo", bloqueia_assinatura: true, impacto_templates: ["MODELO-ESTUDO", "BASE-GEN-V2"] },
  { tema_codigo: "limite_relatorio", tema: "Limite do relatório e ausência de parecer jurídico individual", bloqueia_assinatura: true, impacto_templates: ["MODELO-ESTUDO"] },
  { tema_codigo: "retencao_dados", tema: "Retenção, descarte e acesso a dados/documentos", bloqueia_assinatura: true, impacto_templates: ["ANX-PRIVACIDADE"] },
  { tema_codigo: "suspensao_prazo", tema: "Suspensão de prazo", bloqueia_assinatura: false, impacto_templates: ["BASE-GEN-V2"] },
  { tema_codigo: "encerramento", tema: "Encerramento", bloqueia_assinatura: true, impacto_templates: ["BASE-GEN-V2"] },
  { tema_codigo: "inadimplemento", tema: "Inadimplemento", bloqueia_assinatura: true, impacto_templates: ["ANX-COMERCIAL"] },
  { tema_codigo: "rescisao", tema: "Rescisão", bloqueia_assinatura: true, impacto_templates: ["BASE-GEN-V2"] },
  { tema_codigo: "foro", tema: "Foro", bloqueia_assinatura: true, impacto_templates: ["BASE-GEN-V2"] },
  { tema_codigo: "parcelamento", tema: "Parcelamento", bloqueia_assinatura: false, impacto_templates: ["ANX-COMERCIAL"] },
  { tema_codigo: "despesas_terceiros", tema: "Despesas de terceiros", bloqueia_assinatura: true, impacto_templates: ["ANX-COMERCIAL"] },
  { tema_codigo: "dependentes_representacao", tema: "Dependentes e representação", bloqueia_assinatura: true, impacto_templates: ["ANX-INDIVIDUAL", "ANX-REPRESENTACAO"] },
];

export type LinhaMatriz = {
  tema_codigo: string;
  tema: string;
  status: string;
  versao_juridica_aplicavel: string | null;
  responsavel_revisao: string | null;
  decisao: string | null;
  justificativa: string | null;
  decidido_em: string | null;
  referencia_versao: string | null;
  impacto_templates: string[];
  bloqueia_assinatura: boolean;
};

export function rotuloStatusTema(v: string | null | undefined): string {
  return STATUS_TEMA.find((s) => s.valor === v)?.rotulo ?? "—";
}

/** Códigos históricos preservados como alias do código canônico. */
export const ALIASES_TEMA: Record<string, string> = {
  dados_retencao: "retencao_dados",
};

export function canonicalizarTemaCodigo(codigo: string | null | undefined): string {
  const c = String(codigo ?? "");
  return ALIASES_TEMA[c] ?? c;
}

/** Temas bloqueantes ainda sem decisão registrada. */
export function temasBloqueantesPendentes(linhas: LinhaMatriz[]): string[] {
  return linhas
    .filter((l) => l.bloqueia_assinatura && l.status === "pendente_revisao_juridica")
    .map((l) => l.tema);
}

/** Só há cláusula quando o tema está aprovado com versão jurídica vigente. */
export function podeGerarClausula(linha: LinhaMatriz | undefined | null): { permitido: boolean; motivo: string | null } {
  if (!linha) return { permitido: false, motivo: "Tema não cadastrado na matriz jurídica." };
  if (linha.status !== "aprovado") return { permitido: false, motivo: `Tema com status “${rotuloStatusTema(linha.status)}”.` };
  if (!linha.versao_juridica_aplicavel) return { permitido: false, motivo: "Tema aprovado sem versão jurídica aplicável." };
  return { permitido: true, motivo: null };
}

/**
 * Preparação interna (não redação) só é liberada com tema aprovado e versão
 * jurídica vigente. Nunca gera cláusula, contrato ou artefato externo.
 */
export function preparacaoInternaPermitida(
  linha: LinhaMatriz | undefined | null,
  versoesVigentes: string[],
): { permitido: boolean; motivo: string | null } {
  const base = podeGerarClausula(linha);
  if (!base.permitido) return base;
  if (!versoesVigentes.includes(String(linha!.versao_juridica_aplicavel))) {
    return { permitido: false, motivo: "Versão jurídica do tema não está vigente." };
  }
  return { permitido: true, motivo: null };
}

export type LinhaBruta = {
  id: string;
  tema_codigo: string;
  decidido_em?: string | null;
  updated_at?: string | null;
  archived_at?: string | null;
};

export type PlanoDeduplicacao = {
  tema_codigo: string;
  canonica_id: string;
  arquivar: { id: string; motivo: string; substituido_por_id: string }[];
};

/**
 * Plano de deduplicação lógica: uma linha canônica por tema, demais arquivadas
 * com trilha de substituição. Nunca remove fisicamente.
 */
export function planejarDeduplicacao(linhas: LinhaBruta[]): PlanoDeduplicacao[] {
  const ativas = linhas.filter((l) => !l.archived_at);
  const porTema = new Map<string, LinhaBruta[]>();
  for (const l of ativas) {
    const tc = canonicalizarTemaCodigo(l.tema_codigo);
    porTema.set(tc, [...(porTema.get(tc) ?? []), l]);
  }
  const planos: PlanoDeduplicacao[] = [];
  for (const [tema_codigo, grupo] of porTema) {
    if (grupo.length < 2) continue;
    const ordenado = [...grupo].sort((a, b) => {
      const da = a.decidido_em ? 1 : 0;
      const db = b.decidido_em ? 1 : 0;
      if (da !== db) return db - da;
      return String(b.decidido_em ?? b.updated_at ?? "").localeCompare(String(a.decidido_em ?? a.updated_at ?? ""));
    });
    const canonica = ordenado[0]!;
    planos.push({
      tema_codigo,
      canonica_id: canonica.id,
      arquivar: ordenado.slice(1).map((l) => ({
        id: l.id,
        motivo: "Deduplicação ANA-E-01: linha substituída pela canônica do tema.",
        substituido_por_id: canonica.id,
      })),
    });
  }
  return planos;
}

export type AvaliacaoAssinatura = {
  liberada: boolean;
  bloqueios: { tema_codigo: string; tema: string; motivo: string }[];
};

/** Assinatura só é liberada quando nenhum tema bloqueante está sem decisão válida. */
export function avaliarAssinaturaPelaMatriz(linhas: LinhaMatriz[]): AvaliacaoAssinatura {
  const bloqueios: AvaliacaoAssinatura["bloqueios"] = [];
  for (const l of linhas) {
    if (!l.bloqueia_assinatura) continue;
    if (l.status === "aprovado" || l.status === "nao_aplicavel") {
      if (l.status === "aprovado" && !l.versao_juridica_aplicavel) {
        bloqueios.push({ tema_codigo: l.tema_codigo, tema: l.tema, motivo: "Tema aprovado sem versão jurídica aplicável." });
      }
      continue;
    }
    bloqueios.push({
      tema_codigo: l.tema_codigo,
      tema: l.tema,
      motivo: `Tema bloqueante com status “${rotuloStatusTema(l.status)}”.`,
    });
  }
  return { liberada: bloqueios.length === 0, bloqueios };
}

