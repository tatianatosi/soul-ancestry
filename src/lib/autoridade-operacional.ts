/**
 * Autoridade operacional — regra única de decisão para toda a superfície.
 *
 * Diagnóstico de 05/09/2026: a infraestrutura de modo proprietária já existia
 * (`modo-proprietaria.ts`, `gates-override.ts`), mas estava ligada a 1 de 82
 * rotas. Na prática a proprietária ficava sem autoridade em toda parte, porque
 * cada tela decidia sozinha desabilitar botão por `somenteLeitura`, por gate de
 * domínio ou por erro de carga silencioso.
 *
 * Este módulo é a decisão canônica. Regras puras, sem React e sem I/O:
 *
 *   permitir  → executa direto;
 *   confirmar → executa após confirmação explícita da autora (ação externa,
 *               voltada ao cliente ou irreversível);
 *   bloquear  → recusa, sempre com motivo legível.
 *
 * Invariante: para a proprietária administradora, `bloquear` só existe quando
 * falta identidade ou organização. Nenhum gate de domínio bloqueia — ele vira
 * `confirmar` com a pendência preservada e registrada.
 *
 * Retificação de 18/10/2026: para a proprietária administradora (papel admin/owner),
 * qualquer ação operacional interna em rascunho é PERMITIDA imediatamente sem
 * bloquear a interface nem exigir justificativa para cadastros e rascunhos.
 */

import {
  ACOES_EXTERNAS,
  ehProprietariaAdministradora,
  podeAssumirDecisao,
  type AcaoExterna,
  type Capacidade,
} from "@/lib/modo-proprietaria";

export type Decisao = "permitir" | "confirmar" | "bloquear";

export type ResultadoAutoridade = {
  decisao: Decisao;
  /** Motivo legível — sempre preenchido em `confirmar` e `bloquear`. */
  motivo: string;
  /** Pendência de gate preservada, mesmo quando a ação é liberada. */
  pendencia: string | null;
  /** Verdadeiro quando o avanço se dá por decisão da proprietária. */
  porDecisaoDaProprietaria: boolean;
  /** Exige motivo escrito da autora antes de executar. */
  exigeMotivo: boolean;
};

export type ContextoAutoridade = {
  /** Papéis lidos de `user_roles` para o usuário atual. */
  papeis: readonly string[];
  /** Organização ativa do usuário. */
  organizationId?: string | null;
  /** Leitura de contexto ainda em andamento. */
  carregando?: boolean;
  /** Mensagem do erro ao ler o contexto de acesso (a leitura falhou, não "não há papel"). */
  erroContexto?: string | null;
};

export type PedidoAcao = {
  /** Capacidade interna exercida, quando houver. */
  capacidade?: Capacidade;
  /** Ação externa/irreversível, quando houver. */
  acaoExterna?: AcaoExterna | string;
  /** Pendência de gate de domínio que a tela detectou. */
  pendenciaGate?: string | null;
  /**
   * Validação trivial de formulário (ex.: "informe o título") — não é
   * pendência de processo, é dado ausente que a própria pessoa preenche na
   * hora.
   */
  validacaoFormulario?: string | null;
};

export function ehAcaoExterna(acao: string | null | undefined): boolean {
  return typeof acao === "string" && (ACOES_EXTERNAS as readonly string[]).includes(acao);
}

export function ehProprietaria(papeis: readonly string[]): boolean {
  return papeis.some((p) => ehProprietariaAdministradora(p));
}

/**
 * Decisão canônica. Ordem deliberada: identidade → ação externa → gate → papel.
 * Para a proprietária administradora, ações operacionais internas são PERMITIDAS
 * diretamente, sem exigência de justificativa para cadastros e rascunhos.
 */
export function decidirAcao(
  contexto: ContextoAutoridade,
  pedido: PedidoAcao,
): ResultadoAutoridade {
  const proprietaria = ehProprietaria(contexto.papeis);
  const pendencia = pedido.pendenciaGate?.trim() || null;

  if (contexto.carregando) {
    return {
      decisao: "bloquear",
      motivo: "Carregando seu contexto de acesso. Aguarde um instante e tente de novo.",
      pendencia,
      porDecisaoDaProprietaria: false,
      exigeMotivo: false,
    };
  }

  if (contexto.papeis.length === 0 && contexto.erroContexto) {
    return {
      decisao: "bloquear",
      motivo: `Não foi possível carregar seu contexto de acesso (${contexto.erroContexto}). Recarregue a página; se continuar, o erro fica registrado em Qualidade.`,
      pendencia,
      porDecisaoDaProprietaria: false,
      exigeMotivo: false,
    };
  }

  if (contexto.papeis.length === 0) {
    return {
      decisao: "bloquear",
      motivo:
        "Nenhum papel de equipe encontrado para a sua conta nesta organização. Sem isso o banco recusa qualquer escrita.",
      pendencia,
      porDecisaoDaProprietaria: false,
      exigeMotivo: false,
    };
  }

  if (proprietaria && !contexto.organizationId) {
    return {
      decisao: "bloquear",
      motivo:
        "Organização ativa não identificada. A escrita depende dela para passar na política do banco.",
      pendencia,
      porDecisaoDaProprietaria: false,
      exigeMotivo: false,
    };
  }

  // Validação trivial de formulário: bloqueia pra todo mundo, sem motivo,
  // sem virar pendência auditada. Não é gate de domínio, é campo vazio.
  if (pedido.validacaoFormulario?.trim()) {
    return {
      decisao: "bloquear",
      motivo: pedido.validacaoFormulario.trim(),
      pendencia: null,
      porDecisaoDaProprietaria: false,
      exigeMotivo: false,
    };
  }

  // Ação externa ou irreversível: confirmação explícita para qualquer papel.
  if (pedido.acaoExterna) {
    if (!proprietaria && pedido.capacidade && !podeAssumirDecisao(contexto.papeis[0], pedido.capacidade)) {
      return {
        decisao: "bloquear",
        motivo: "Esta ação externa exige o papel de proprietária administradora.",
        pendencia,
        porDecisaoDaProprietaria: false,
        exigeMotivo: false,
      };
    }
    return {
      decisao: "confirmar",
      motivo:
        "Ação externa ou irreversível: confirme explicitamente antes de executar. Nada sai daqui sem o seu aceite.",
      pendencia,
      porDecisaoDaProprietaria: proprietaria,
      exigeMotivo: true,
    };
  }

  // Para a proprietária administradora, qualquer operação interna é permitida diretamente:
  // a pendência continua visível como aviso (pendencia), mas não bloqueia a interface.
  if (proprietaria) {
    return {
      decisao: "permitir",
      motivo: pendencia ? "Operação realizada com pendência registrada como aviso." : "",
      pendencia,
      porDecisaoDaProprietaria: Boolean(pendencia),
      exigeMotivo: false,
    };
  }

  // Gate de domínio pendente para outros papéis: bloqueia.
  if (pendencia) {
    return {
      decisao: "bloquear",
      motivo: pendencia,
      pendencia,
      porDecisaoDaProprietaria: false,
      exigeMotivo: false,
    };
  }

  if (pedido.capacidade) {
    const autorizado = contexto.papeis.some((p) => podeAssumirDecisao(p, pedido.capacidade!));
    if (!autorizado) {
      return {
        decisao: "bloquear",
        motivo: "Seu papel não inclui esta operação.",
        pendencia: null,
        porDecisaoDaProprietaria: false,
        exigeMotivo: false,
      };
    }
  }

  return {
    decisao: "permitir",
    motivo: "",
    pendencia: null,
    porDecisaoDaProprietaria: false,
    exigeMotivo: false,
  };
}

/**
 * Um controle só pode ficar desabilitado quando a decisão é `bloquear`.
 * `confirmar` mantém o controle ativo — quem decide é a janela de confirmação.
 */
export function deveDesabilitar(resultado: ResultadoAutoridade): boolean {
  return resultado.decisao === "bloquear";
}

/** Rótulo curto para o estado da ação, exibido ao lado do controle. */
export function rotuloDecisao(resultado: ResultadoAutoridade): string | null {
  if (resultado.decisao === "permitir") return null;
  if (resultado.decisao === "confirmar") {
    return resultado.porDecisaoDaProprietaria && resultado.pendencia
      ? "Segue por decisão da proprietária"
      : "Exige confirmação";
  }
  return "Indisponível";
}
