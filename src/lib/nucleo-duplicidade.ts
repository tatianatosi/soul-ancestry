/**
 * Unificação controlada de núcleos familiares (prompt canônico, fases 1–6).
 *
 * Fase 1 (detecção) é puramente sugestiva: nunca decide, nunca funde, nunca
 * marca nada como igual. Cada candidato carrega o motivo objetivo para que a
 * decisão continue sendo humana.
 *
 * (nucleo_canonico_id, unificado_em, status mesclado).
 *
 * A lista de candidatos continua recalculada a cada carregamento: não há
 * coluna para "em revisão"/"descartado". Núcleo arquivado some da detecção.
 */

export const CONFIRMACAO_UNIFICAR = "UNIFICAR";

export type MembroParaComparar = { id?: string; nome: string; papel?: string | null };

export type NucleoParaComparar = {
  id: string;
  nome: string;
  dossie_mae: string | null;
  contratante_nome: string | null;
  dossie_status: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  case_id: string | null;
  caso: { id: string; codigo: string | null; titulo: string | null; pais: string | null } | null;
  membros: MembroParaComparar[];
  /** Leads ativos apontando para este núcleo — só para o plano de unificação. */
  leadsAtivos?: number;
};

export type NivelConfianca = "alta" | "media" | "baixa";

export type CandidatoDuplicidade = {
  chave: string;
  nucleoA: NucleoParaComparar;
  nucleoB: NucleoParaComparar;
  motivos: string[];
  confianca: NivelConfianca;
  pessoasEmComum: string[];
  status: "sugerido";
};

function normalizar(v: string | null | undefined): string {
  return (v ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function nomesDeMembros(n: NucleoParaComparar): Set<string> {
  return new Set(n.membros.map((m) => normalizar(m.nome)).filter(Boolean));
}

/** Só considera "em comum" nome com pelo menos 2 palavras — evita falso positivo por primeiro nome comum ("Ana", "João"). */
function nomeComparavel(nome: string): boolean {
  return nome.split(/\s+/).filter(Boolean).length >= 2;
}

export function detectarDuplicidades(nucleos: NucleoParaComparar[]): CandidatoDuplicidade[] {
  const ativos = nucleos.filter((n) => n.status !== "arquivado");
  const candidatos: CandidatoDuplicidade[] = [];

  for (let i = 0; i < ativos.length; i++) {
    for (let j = i + 1; j < ativos.length; j++) {
      const a = ativos[i];
      const b = ativos[j];
      const motivos: string[] = [];

      const mesmoCaso = Boolean(a.case_id && b.case_id && a.case_id === b.case_id);
      if (mesmoCaso) motivos.push("Os dois núcleos apontam para o mesmo caso.");

      const nomesA = nomesDeMembros(a);
      const nomesB = nomesDeMembros(b);
      const emComum = [...nomesA].filter((n) => nomeComparavel(n) && nomesB.has(n));
      if (emComum.length > 0) {
        motivos.push(`${emComum.length} pessoa(s) com nome completo em comum entre os núcleos.`);
      }

      const nomeNucleoA = normalizar(a.nome);
      const nomeNucleoB = normalizar(b.nome);
      const nomeSemelhante =
        nomeNucleoA.length > 3 &&
        nomeNucleoB.length > 3 &&
        (nomeNucleoA.includes(nomeNucleoB) || nomeNucleoB.includes(nomeNucleoA));
      if (nomeSemelhante && !mesmoCaso) motivos.push("Nome do núcleo semelhante.");

      const contratanteIgual =
        a.contratante_nome && b.contratante_nome && normalizar(a.contratante_nome) === normalizar(b.contratante_nome);
      if (contratanteIgual) motivos.push("Mesmo nome de contratante registrado nos dois núcleos.");

      if (motivos.length === 0) continue;

      let confianca: NivelConfianca = "baixa";
      if (mesmoCaso || emComum.length >= 2 || contratanteIgual) confianca = "alta";
      else if (emComum.length === 1) confianca = "media";

      candidatos.push({
        chave: `${a.id}:${b.id}`,
        nucleoA: a,
        nucleoB: b,
        motivos,
        confianca,
        pessoasEmComum: emComum,
        status: "sugerido",
      });
    }
  }

  const peso: Record<NivelConfianca, number> = { alta: 0, media: 1, baixa: 2 };
  return candidatos.sort((x, y) => peso[x.confianca] - peso[y.confianca]);
}

/** Chave da unique nucleo_membros_unico: (nucleo_id, lower(nome)). */
export function chaveNomeUnico(nome: string): string {
  return nome.trim().toLowerCase();
}

export function exigirConfirmacaoUnificar(confirmacao: string): void {
  if (confirmacao !== CONFIRMACAO_UNIFICAR) {
    throw new Error(
      `Unificação recusada: digite ${CONFIRMACAO_UNIFICAR} para confirmar. Não há fusão automática.`,
    );
  }
}

export type AcaoMembroPlano =
  | { acao: "mover"; nome: string; membroId?: string }
  | { acao: "arquivar_por_conflito"; nome: string; membroId?: string };

export type AcaoCasoPlano = "manter" | "transferir" | "nenhum" | "recusar";

export type PlanoUnificacao = {
  recusado: boolean;
  motivoRecusa: string | null;
  canonicoId: string;
  origemId: string;
  canonicoNome: string;
  origemNome: string;
  caso: {
    acao: AcaoCasoPlano;
    caseIdCanonico: string | null;
    caseIdOrigem: string | null;
    caseIdFinal: string | null;
  };
  membros: AcaoMembroPlano[];
  leads: { acao: "reapontar"; quantidade: number };
  arquivoOrigem: { status: "arquivado"; motivo: string };
};

function motivoArquivoOrigem(canonico: NucleoParaComparar): string {
  return `Unificado no núcleo canônico "${canonico.nome}" (${canonico.id}).`;
}

/**
 * Matriz de reconciliação (fase 3) — o que move, o que arquiva, o que recusa.
 * Não executa nada. Conflito de nome segue a unique (nucleo_id, lower(nome)):
 * o membro da origem é arquivado, nunca inserido de novo no canônico.
 */
export function montarPlanoUnificacao(
  canonico: NucleoParaComparar,
  origem: NucleoParaComparar,
): PlanoUnificacao {
  const arquivoOrigem = { status: "arquivado" as const, motivo: motivoArquivoOrigem(canonico) };
  const base = {
    canonicoId: canonico.id,
    origemId: origem.id,
    canonicoNome: canonico.nome,
    origemNome: origem.nome,
    arquivoOrigem,
    leads: { acao: "reapontar" as const, quantidade: origem.leadsAtivos ?? 0 },
  };

  if (canonico.id === origem.id) {
    return {
      ...base,
      recusado: true,
      motivoRecusa: "Canônico e origem são o mesmo núcleo.",
      caso: {
        acao: "recusar",
        caseIdCanonico: canonico.case_id,
        caseIdOrigem: origem.case_id,
        caseIdFinal: null,
      },
      membros: [],
    };
  }

  const caseCanonico = canonico.case_id;
  const caseOrigem = origem.case_id;
  const casosDiferentes = Boolean(caseCanonico && caseOrigem && caseCanonico !== caseOrigem);

  if (casosDiferentes) {
    return {
      ...base,
      recusado: true,
      motivoRecusa:
        "Os dois núcleos apontam para casos diferentes. Resolva os casos antes de unificar — a unificação não transfere nem funde casos.",
      caso: {
        acao: "recusar",
        caseIdCanonico: caseCanonico,
        caseIdOrigem: caseOrigem,
        caseIdFinal: null,
      },
      membros: [],
    };
  }

  let acaoCaso: AcaoCasoPlano = "nenhum";
  let caseIdFinal: string | null = caseCanonico;
  if (caseOrigem && !caseCanonico) {
    acaoCaso = "transferir";
    caseIdFinal = caseOrigem;
  } else if (caseCanonico) {
    acaoCaso = "manter";
    caseIdFinal = caseCanonico;
  }

  const nomesCanonico = new Set(canonico.membros.map((m) => chaveNomeUnico(m.nome)).filter(Boolean));
  const membros: AcaoMembroPlano[] = origem.membros
    .filter((m) => m.nome.trim())
    .map((m) => {
      const chave = chaveNomeUnico(m.nome);
      if (nomesCanonico.has(chave)) {
        return { acao: "arquivar_por_conflito" as const, nome: m.nome, membroId: m.id };
      }
      return { acao: "mover" as const, nome: m.nome, membroId: m.id };
    });

  return {
    ...base,
    recusado: false,
    motivoRecusa: null,
    caso: {
      acao: acaoCaso,
      caseIdCanonico: caseCanonico,
      caseIdOrigem: caseOrigem,
      caseIdFinal,
    },
    membros,
  };
}

export type NucleoPosMerge = {
  id: string;
  status: string | null;
  archived_at: string | null;
  case_id: string | null;
};

export type MembroPosMerge = {
  id: string;
  nucleo_id: string;
  nome: string;
  archived_at: string | null;
};

export type LeadPosMerge = {
  id: string;
  nucleo_id: string | null;
};

/**
 * Validação pós-merge (fase 6): origem arquivada, membros/leads no canônico,
 * nenhum nome duplicado ativo no canônico.
 */
export function validarPosMerge(input: {
  canonicoId: string;
  origemId: string;
  caseIdEsperado: string | null;
  origem: NucleoPosMerge;
  canonico: NucleoPosMerge;
  membros: MembroPosMerge[];
  leads: LeadPosMerge[];
}): { ok: boolean; falhas: string[] } {
  const falhas: string[] = [];

  if (input.origem.id !== input.origemId) {
    falhas.push("Núcleo de origem relido não corresponde ao pedido.");
  }
  if (input.canonico.id !== input.canonicoId) {
    falhas.push("Núcleo canônico relido não corresponde ao pedido.");
  }
  if (input.origem.status !== "arquivado" || !input.origem.archived_at) {
    falhas.push("Núcleo de origem não ficou arquivado.");
  }
  if (input.canonico.status === "arquivado" || input.canonico.archived_at) {
    falhas.push("Núcleo canônico não pode ficar arquivado na unificação.");
  }
  if ((input.canonico.case_id ?? null) !== (input.caseIdEsperado ?? null)) {
    falhas.push("Caso do núcleo canônico não bate com o plano de unificação.");
  }

  const leadsNaOrigem = input.leads.filter((l) => l.nucleo_id === input.origemId);
  if (leadsNaOrigem.length > 0) {
    falhas.push(`${leadsNaOrigem.length} lead(s) ainda apontam para o núcleo de origem.`);
  }

  const ativosCanonico = input.membros.filter(
    (m) => m.nucleo_id === input.canonicoId && !m.archived_at,
  );
  const vistos = new Set<string>();
  for (const m of ativosCanonico) {
    const chave = chaveNomeUnico(m.nome);
    if (!chave) continue;
    if (vistos.has(chave)) {
      falhas.push(`Nome duplicado no núcleo canônico: "${m.nome}".`);
    }
    vistos.add(chave);
  }

  const ativosOrigem = input.membros.filter((m) => m.nucleo_id === input.origemId && !m.archived_at);
  if (ativosOrigem.length > 0) {
    falhas.push(
      `${ativosOrigem.length} membro(s) ativo(s) ainda no núcleo de origem; deveriam ter sido movidos ou arquivados.`,
    );
  }

  return { ok: falhas.length === 0, falhas };
}
