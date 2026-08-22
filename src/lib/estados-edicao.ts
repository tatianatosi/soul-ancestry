/**
 * Estados de edição × estados de avanço.
 *
 * Regra central: bloqueio de completude nunca torna a tela somente leitura.
 * Ele impede apenas os atos de avanço (aprovar, gerar OS final, congelar,
 * assinar, liberar financeiro/onboarding/pesquisa externa/portal).
 *
 * Nada aqui executa ação externa: é apenas classificação e texto de bloqueio.
 */

export const ESTADOS_EDICAO = [
  "rascunho_editavel",
  "em_revisao",
  "bloqueado_por_pendencia",
  "aprovado_para_preparacao",
  "aprovado_para_formalizacao",
  "legado",
  "arquivado",
] as const;
export type EstadoEdicao = (typeof ESTADOS_EDICAO)[number];

/** Estados por campo — sempre explícitos, jamais inferidos. */
export const ESTADOS_CAMPO = [
  "coberto_validado",
  "importado_a_confirmar",
  "parametro_vazio",
  "nao_localizado_na_proposta",
  "divergente",
  "opcional_nao_declarado",
] as const;
export type EstadoCampo = (typeof ESTADOS_CAMPO)[number];

/** Estados de campo que não satisfazem gate de avanço. */
export const ESTADOS_CAMPO_PENDENTES: readonly EstadoCampo[] = [
  "importado_a_confirmar",
  "parametro_vazio",
  "nao_localizado_na_proposta",
  "divergente",
];

export function campoSatisfazAvanco(estado: EstadoCampo): boolean {
  return !ESTADOS_CAMPO_PENDENTES.includes(estado);
}

/** Operações de trabalho — sempre liberadas a quem tem permissão de edição. */
export const OPERACOES_RASCUNHO = [
  "salvar_rascunho",
  "corrigir_campo",
  "registrar_fonte",
  "registrar_nao_localizado",
  "registrar_importado_a_confirmar",
  "registrar_conflito",
  "anexar_referencia_interna",
  "revalidar_proposta",
  "salvar_decisao_humana",
  "atualizar_responsavel",
  "atualizar_proxima_acao",
  "salvar_escopo_rascunho",
  "salvar_pessoas_rascunho",
  "salvar_condicao_comercial_rascunho",
] as const;
export type OperacaoRascunho = (typeof OPERACOES_RASCUNHO)[number];

/** Operações de avanço — bloqueadas enquanto houver pendência. */
export const OPERACOES_AVANCO = [
  "aprovar_proposta",
  "converter_condicao_comercial_final",
  "gerar_os_final",
  "congelar_previa",
  "solicitar_assinatura",
  "liberar_financeiro",
  "liberar_onboarding",
  "liberar_pesquisa_externa",
  "ato_em_nome_do_cliente",
  "publicar_app_cliente",
] as const;
export type OperacaoAvanco = (typeof OPERACOES_AVANCO)[number];

export type Operacao = OperacaoRascunho | OperacaoAvanco;

export function ehOperacaoRascunho(op: string): op is OperacaoRascunho {
  return (OPERACOES_RASCUNHO as readonly string[]).includes(op);
}
export function ehOperacaoAvanco(op: string): op is OperacaoAvanco {
  return (OPERACOES_AVANCO as readonly string[]).includes(op);
}

/** Papéis com permissão de escrita em rascunho. */
export const PAPEIS_EDICAO: readonly string[] = ["admin", "operacoes", "comercial"];

/** Estados em que o conteúdo é imutável: editar exige versão derivada. */
export const ESTADOS_CONGELADOS: readonly EstadoEdicao[] = [
  "aprovado_para_formalizacao",
  "legado",
  "arquivado",
];

export type Pendencia = {
  /** Campo ou elo faltante. */
  campo: string;
  /** Fonte necessária para resolver. */
  fonte: string;
  /** Papel/pessoa que pode resolver. */
  responsavel: string;
  /** Próxima ação objetiva. */
  proximaAcao: string;
  /** Gate afetado. */
  gate: OperacaoAvanco;
};

export type DecisaoEdicao =
  | { permitido: true; efeito: "editar_rascunho" | "criar_versao_derivada"; mensagem: string }
  | { permitido: false; motivo: "sem_permissao" | "gate_de_avanco"; mensagem: string; pendencias: Pendencia[] };

function listaPendencias(pendencias: Pendencia[]): string {
  return pendencias.map((p) => `${p.campo} (fonte: ${p.fonte} · resolve: ${p.responsavel} · próxima ação: ${p.proximaAcao})`).join("; ");
}

/**
 * Decide se uma operação pode ocorrer.
 * Rascunho: liberado por permissão, mesmo com pendências.
 * Avanço: exige ausência de pendências e estado apto.
 */
export function decidirEdicao(input: {
  estado: EstadoEdicao;
  operacao: Operacao;
  papel: string;
  pendencias: Pendencia[];
}): DecisaoEdicao {
  const { estado, operacao, papel, pendencias } = input;
  const podeEditar = PAPEIS_EDICAO.includes(papel);

  if (ehOperacaoRascunho(operacao)) {
    if (!podeEditar) {
      return {
        permitido: false,
        motivo: "sem_permissao",
        mensagem: "Seu papel não tem permissão de edição neste registro. Solicite a quem responde pela área.",
        pendencias: [],
      };
    }
    if (estado === "arquivado") {
      return {
        permitido: false,
        motivo: "gate_de_avanco",
        mensagem: "Registro arquivado: o histórico é preservado e não recebe novas edições. Reabra como versão derivada.",
        pendencias: [],
      };
    }
    if (ESTADOS_CONGELADOS.includes(estado)) {
      return {
        permitido: true,
        efeito: "criar_versao_derivada",
        mensagem: "Versão congelada preservada. Sua edição foi aberta como nova versão derivada, vinculada à origem.",
      };
    }
    const sufixo = pendencias.length
      ? ` A formalização permanece bloqueada até resolver: ${listaPendencias(pendencias)}.`
      : "";
    return { permitido: true, efeito: "editar_rascunho", mensagem: `Rascunho salvo.${sufixo}` };
  }

  // Operação de avanço.
  const relevantes = pendencias.filter((p) => p.gate === operacao);
  if (relevantes.length > 0) {
    return {
      permitido: false,
      motivo: "gate_de_avanco",
      mensagem: `Rascunho salvo. A formalização permanece bloqueada até resolver: ${listaPendencias(relevantes)}.`,
      pendencias: relevantes,
    };
  }
  if (estado === "bloqueado_por_pendencia" || estado === "legado" || estado === "arquivado") {
    return {
      permitido: false,
      motivo: "gate_de_avanco",
      mensagem: `Rascunho salvo. O avanço permanece bloqueado pelo estado atual do registro (${estado}).`,
      pendencias,
    };
  }
  if (!podeEditar) {
    return {
      permitido: false,
      motivo: "sem_permissao",
      mensagem: "Seu papel não tem permissão para este avanço.",
      pendencias: [],
    };
  }
  return { permitido: true, efeito: "editar_rascunho", mensagem: "Requisitos atendidos para esta etapa." };
}

/** Texto por seção, para a tela mostrar o que falta sem erro técnico genérico. */
export function pendenciasPorGate(pendencias: Pendencia[]): Record<string, Pendencia[]> {
  const mapa: Record<string, Pendencia[]> = {};
  for (const p of pendencias) (mapa[p.gate] ??= []).push(p);
  return mapa;
}
