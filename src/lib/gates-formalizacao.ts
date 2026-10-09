/**
 * Gates de formalização — travas executáveis compartilhadas entre a tela de
 * preparação contratual e as transições reais no servidor.
 *
 * Nenhuma transição pode ser liberada pelo front-end: a mesma avaliação roda
 * no servidor antes de gerar versão final, preparar anexo, pedir assinatura,
 * liberar financeiro/onboarding ou mover o eixo de formalização.
 */

export const ACOES_GATEADAS = [
  "gerar_versao_final",
  "preparar_anexo_escopo",
  "preparar_anexo_comercial",
  "solicitar_assinatura",
  "liberar_formalizacao_financeiro",
  "liberar_cobranca_futura",
  "formalizacao_contrato_enviado",
  "formalizacao_contrato_assinado",
  "formalizacao_pagamento_confirmado",
  "liberar_onboarding",
] as const;
export type AcaoGateada = (typeof ACOES_GATEADAS)[number];

export const ROTULO_ACAO: Record<AcaoGateada, string> = {
  gerar_versao_final: "Gerar versão final do contrato",
  preparar_anexo_escopo: "Preparar Anexo de Escopo",
  preparar_anexo_comercial: "Preparar Anexo Comercial",
  solicitar_assinatura: "Solicitar assinatura",
  liberar_formalizacao_financeiro: "Liberar formalização para o financeiro",
  liberar_cobranca_futura: "Liberar criação futura de cobrança/checkout",
  formalizacao_contrato_enviado: "Eixo formalização → Contrato enviado",
  formalizacao_contrato_assinado: "Eixo formalização → Contrato assinado",
  formalizacao_pagamento_confirmado: "Eixo formalização → Pagamento inicial confirmado",
  liberar_onboarding: "Liberar onboarding",
};

export const GATES = [
  "proposta_valida",
  "completude_canva",
  "escopo_conferido",
  "conflitos_resolvidos",
  "produto_condicao_homologados",
  "cadastro_completo",
  "nucleo_familiar_validado",
  "representacao_menor",
  "revisao_juridica",
  "contrato_os_prontos",
  "assinatura",
  "pagamento",
  "autorizacao_pesquisa",
  "despesas_aprovadas",
  "dependentes_representacao",
  "matriz_juridica",
] as const;
export type Gate = (typeof GATES)[number];

export const ROTULO_GATE: Record<Gate, string> = {
  proposta_valida: "Proposta Canva válida",
  completude_canva: "Proposta Canva extraída e completa (páginas 1–7)",
  escopo_conferido: "Escopo conferido",
  conflitos_resolvidos: "Conflitos resolvidos",
  produto_condicao_homologados: "Produto e condição homologados",
  cadastro_completo: "Cadastro completo",
  nucleo_familiar_validado: "Núcleo familiar validado",
  representacao_menor: "Representação de menor (se aplicável)",
  revisao_juridica: "Revisão jurídica",
  contrato_os_prontos: "Contrato e OS prontos",
  assinatura: "Assinatura",
  pagamento: "Pagamento",
  autorizacao_pesquisa: "Autorização de pesquisa",
  despesas_aprovadas: "Despesas de terceiros aprovadas (se aplicável)",
  dependentes_representacao: "Dependentes com representação resolvida (se aplicável)",
  matriz_juridica: "Temas jurídicos bloqueantes decididos",
};

/** Gates exigidos por ação. Cada ação só passa com todos os seus gates verdes. */
export const GATES_POR_ACAO: Record<AcaoGateada, Gate[]> = {
  gerar_versao_final: [
    "proposta_valida",
    "completude_canva",
    "escopo_conferido",
    "conflitos_resolvidos",
    "produto_condicao_homologados",
    "cadastro_completo",
    "nucleo_familiar_validado",
    "representacao_menor",
    "dependentes_representacao",
  ],
  preparar_anexo_escopo: ["proposta_valida", "completude_canva", "escopo_conferido", "conflitos_resolvidos"],
  preparar_anexo_comercial: [
    "proposta_valida",
    "completude_canva",
    "escopo_conferido",
    "conflitos_resolvidos",
    "produto_condicao_homologados",
    "despesas_aprovadas",
  ],
  solicitar_assinatura: [
    "proposta_valida",
    "completude_canva",
    "escopo_conferido",
    "conflitos_resolvidos",
    "produto_condicao_homologados",
    "cadastro_completo",
    "nucleo_familiar_validado",
    "representacao_menor",
    "revisao_juridica",
    "contrato_os_prontos",
    "dependentes_representacao",
    "matriz_juridica",
  ],
  liberar_formalizacao_financeiro: [
    "proposta_valida",
    "completude_canva",
    "escopo_conferido",
    "conflitos_resolvidos",
    "produto_condicao_homologados",
    "despesas_aprovadas",
  ],
  liberar_cobranca_futura: [
    "proposta_valida",
    "escopo_conferido",
    "conflitos_resolvidos",
    "produto_condicao_homologados",
    "assinatura",
    "despesas_aprovadas",
  ],
  formalizacao_contrato_enviado: [
    "proposta_valida",
    "completude_canva",
    "escopo_conferido",
    "conflitos_resolvidos",
    "produto_condicao_homologados",
    "revisao_juridica",
    "contrato_os_prontos",
  ],
  formalizacao_contrato_assinado: [
    "proposta_valida",
    "escopo_conferido",
    "conflitos_resolvidos",
    "contrato_os_prontos",
    "assinatura",
    "matriz_juridica",
  ],
  formalizacao_pagamento_confirmado: [
    "proposta_valida",
    "escopo_conferido",
    "produto_condicao_homologados",
    "assinatura",
    "pagamento",
  ],
  liberar_onboarding: [
    "proposta_valida",
    "escopo_conferido",
    "conflitos_resolvidos",
    "produto_condicao_homologados",
    "cadastro_completo",
    "nucleo_familiar_validado",
    "assinatura",
    "pagamento",
    "autorizacao_pesquisa",
    "despesas_aprovadas",
    "dependentes_representacao",
  ],
};

export type ContextoGates = {
  propostaValida: boolean;
  propostaMotivos?: string[];
  camposAusentes: string[];
  conflitos: string[];
  precoOk: boolean;
  precoMotivos?: string[];
  caseServiceOk: boolean;
  cadastroCompleto: boolean;
  nucleoValidado: boolean;
  menorEnvolvido: boolean;
  representacaoRegistrada: boolean;
  revisaoJuridicaOk: boolean;
  contratoOsProntos: boolean;
  assinaturaRegistrada: boolean;
  pagamentoConfirmado: boolean;
  autorizacaoPesquisa: boolean;
  despesasAplicaveis: boolean;
  despesasPendentes: string[];
  /** Dependentes que participam de contrato/App/anexo com representação pendente. */
  dependentesPendentes?: string[];
  /** Temas da matriz jurídica marcados como bloqueantes e ainda não decididos. */
  temasJuridicosBloqueantes?: string[];
  /**
   * Alterações materiais FORA do conteúdo do modelo aprovado (cláusula + motivo).
   * Só elas reabrem revisão jurídica quando o modelo vigente já foi aprovado.
   */
  alteracoesForaDoModelo?: string[];
  /** Páginas 1–7 da proposta Canva sem extração concluída. */
  paginasCanvaPendentes?: number[];
  /** Campos declarados como não localizados na extração das páginas. */
  camposNaoLocalizadosCanva?: string[];
};

export type AvaliacaoGate = { gate: Gate; label: string; ok: boolean; motivo: string | null };

export function avaliarGates(c: ContextoGates): AvaliacaoGate[] {
  const g = (gate: Gate, ok: boolean, motivo: string | null): AvaliacaoGate => ({
    gate,
    label: ROTULO_GATE[gate],
    ok,
    motivo: ok ? null : motivo,
  });

  return [
    g(
      "proposta_valida",
      c.propostaValida,
      c.propostaMotivos?.length ? c.propostaMotivos.join(" ") : "Proposta Canva inválida como fonte de escopo.",
    ),
    g(
      "completude_canva",
      (c.paginasCanvaPendentes ?? []).length === 0 && (c.camposNaoLocalizadosCanva ?? []).length === 0,
      `Extração da proposta Canva incompleta: ${[...(c.paginasCanvaPendentes ?? []).map((p) => `página ${p}`), ...(c.camposNaoLocalizadosCanva ?? [])].join(", ")}.`,
    ),
    g(
      "escopo_conferido",
      c.camposAusentes.length === 0,
      `${c.camposAusentes.length} campo(s) obrigatório(s) não localizado(s) na proposta: ${c.camposAusentes.join(", ")}.`,
    ),
    g("conflitos_resolvidos", c.conflitos.length === 0, `${c.conflitos.length} conflito(s) aguardando revisão humana.`),
    g(
      "produto_condicao_homologados",
      c.precoOk && c.caseServiceOk,
      !c.caseServiceOk
        ? "Case service (produto-pai/trilha) não configurado no caso."
        : (c.precoMotivos?.join(" ") ?? "Preço/condição sem homologação vigente."),
    ),
    g("cadastro_completo", c.cadastroCompleto, "Cadastro de partes/qualificação incompleto."),
    g("nucleo_familiar_validado", c.nucleoValidado, "Núcleo familiar não validado."),
    g(
      "representacao_menor",
      !c.menorEnvolvido || c.representacaoRegistrada,
      "Menor/incapaz no núcleo sem representação legal registrada.",
    ),
    g(
      "revisao_juridica",
      c.revisaoJuridicaOk,
      (c.alteracoesForaDoModelo ?? []).length
        ? `Alteração fora do conteúdo do modelo aprovado sem revisão jurídica: ${(c.alteracoesForaDoModelo ?? []).join("; ")}.`
        : "Revisão jurídica da versão final não aprovada.",
    ),
    g("contrato_os_prontos", c.contratoOsProntos, "Contrato/OS ainda não preparados."),
    g("assinatura", c.assinaturaRegistrada, "Assinatura não registrada."),
    g("pagamento", c.pagamentoConfirmado, "Pagamento inicial não confirmado."),
    g("autorizacao_pesquisa", c.autorizacaoPesquisa, "Autorização de pesquisa não registrada."),
    g(
      "despesas_aprovadas",
      !c.despesasAplicaveis || c.despesasPendentes.length === 0,
      `${c.despesasPendentes.length} pendência(s) em despesas de terceiros: ${c.despesasPendentes.join(" ")}`,
    ),
    g(
      "dependentes_representacao",
      (c.dependentesPendentes ?? []).length === 0,
      `${(c.dependentesPendentes ?? []).length} dependente(s) com representação pendente participando de contrato, App ou anexo: ${(
        c.dependentesPendentes ?? []
      ).join(", ")}.`,
    ),
    g(
      "matriz_juridica",
      (c.temasJuridicosBloqueantes ?? []).length === 0,
      `${(c.temasJuridicosBloqueantes ?? []).length} tema(s) jurídico(s) bloqueante(s) sem decisão registrada: ${(
        c.temasJuridicosBloqueantes ?? []
      ).join(", ")}.`,
    ),
  ];
}

export type ErroGate = { codigo: string; descricao: string };

/**
 * Pendências legíveis por código para a ação pedida.
 *
 * Sempre retorna a lista real, independentemente do papel: a pendência nunca
 * desaparece da tela. Quem decide se ela bloqueia é `podeExecutar`.
 */
export function bloqueiosDaAcao(acao: AcaoGateada, c: ContextoGates): ErroGate[] {
  const avaliacao = avaliarGates(c);
  const exigidos = GATES_POR_ACAO[acao];
  return avaliacao
    .filter((a) => exigidos.includes(a.gate) && !a.ok)
    .map((a) => ({ codigo: `GATE_${a.gate.toUpperCase()}`, descricao: `${a.label}: ${a.motivo}` }));
}

/**
 * Pode executar a ação?
 *
 * Para a proprietária administradora (`papel = "admin"`), pendência de gate
 * deixa de impedir: ela segue por decisão própria, com a pendência preservada
 * e o avanço auditado. Sem papel informado, mantém o comportamento anterior.
 */
export function podeExecutar(acao: AcaoGateada, c: ContextoGates, papel?: string): boolean {
  if (papel === "admin" || papel === "proprietaria_administradora") return true;
  return bloqueiosDaAcao(acao, c).length === 0;
}

/**
 * A ação segue adiante, mas exige aceite explícito? Verdadeiro quando há
 * pendência superada por decisão da proprietária ou quando a ação é externa.
 */
export function exigeAceiteExplicito(acao: AcaoGateada, c: ContextoGates, papel?: string): boolean {
  const externa = (ACOES_GATEADAS_EXTERNAS as readonly string[]).includes(acao);
  if (externa) return true;
  if (papel === "admin" || papel === "proprietaria_administradora") {
    return bloqueiosDaAcao(acao, c).length > 0;
  }
  return false;
}

/** Próxima ação recomendada: primeiro gate vermelho na ordem normativa. */
export function proximaAcaoRecomendada(c: ContextoGates): string {
  const primeiro = avaliarGates(c).find((a) => !a.ok);
  if (!primeiro) return "Todos os gates verdes: seguir para revisão jurídica final e preparação de versão.";
  return `Resolver “${primeiro.label}” — ${primeiro.motivo}`;
}

/**
 * Ações gateadas que representam avanço INTERNO. A Proprietária Administradora
 * pode assumir a decisão e prosseguir mesmo com pendência: o bloqueio continua
 * visível e registrado, mas não impede o fluxo interno.
 */
export const ACOES_GATEADAS_INTERNAS = [
  "gerar_versao_final",
  "preparar_anexo_escopo",
  "preparar_anexo_comercial",
  "liberar_formalizacao_financeiro",
  "liberar_cobranca_futura",
  "liberar_onboarding",
] as const;

/**
 * Ações que produzem efeito externo/irreversível: nunca são liberadas por
 * override; permanecem na janela final de confirmação explícita.
 */
export const ACOES_GATEADAS_EXTERNAS = [
  "solicitar_assinatura",
  "formalizacao_contrato_enviado",
  "formalizacao_contrato_assinado",
  "formalizacao_pagamento_confirmado",
] as const;

export function ehAcaoGateadaInterna(acao: string): boolean {
  return (ACOES_GATEADAS_INTERNAS as readonly string[]).includes(acao);
}

export class GateBloqueadoError extends Error {
  readonly erros: ErroGate[];
  constructor(acao: AcaoGateada, erros: ErroGate[]) {
    super(`${ROTULO_ACAO[acao]} bloqueada: ${erros.map((e) => `[${e.codigo}] ${e.descricao}`).join(" · ")}`);
    this.name = "GateBloqueadoError";
    this.erros = erros;
  }
}

