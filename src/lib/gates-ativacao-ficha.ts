/**
 * Gates de ativação da ficha operacional canônica (leitura).
 *
 * Nada aqui executa transição: a avaliação existe para tornar o bloqueio
 * inequívoco na tela. A trava real continua no servidor/banco.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

/** Categorias canônicas da ficha operacional (mesma ordem da lista de casos). */
export const CATEGORIAS_GATE = ["Comercial", "Formalização", "Financeiro", "Operação"] as const;
export type CategoriaGate = (typeof CATEGORIAS_GATE)[number];

export type GateAtivacao = {
  chave: string;
  rotulo: string;
  ok: boolean;
  responsavel: string;
  /** Categoria operacional a que o requisito pertence. */
  categoria: CategoriaGate;
  motivo: string | null;
  /** Registro canônico que resolve a pendência (um clique). */
  destino: { rota: string; rotulo: string };
  /** Evidência exigida para validar o requisito. */
  evidencia: string;
};

const CATEGORIA_POR_GATE: Record<string, CategoriaGate> = {
  escopo_sku_preco: "Comercial",
  canva_completo: "Comercial",
  instrumentos_preparados: "Formalização",
  assinatura: "Formalização",
  cobranca_aprovada: "Financeiro",
  pagamento_confirmado: "Financeiro",
  aprovacao_ativacao: "Operação",
};

const preenchido = (v: unknown) => typeof v === "string" && v.trim().length > 0;


/** Os 7 requisitos de ativação, na ordem em que precisam ser cumpridos. */
/**
 * Requisitos de ativação já validados à mão em `case_activation_checks`,
 * mapeados para o gate correspondente desta ficha.
 *
 * Diagnóstico de 05/09/2026, caso CA-CID-AT-FAM-2026-001 (Ana Luiza): os 14
 * requisitos estavam validados no banco desde 04/09, e a ficha continuava
 * dizendo "Não elegível — ativação bloqueada". A tela derivava tudo da linha
 * de `crm_casos` e nunca lia os requisitos validados. Duas fontes de verdade
 * discordando na mesma tela.
 */
const GATE_POR_CHECK: Record<string, string> = {
  proposta_aprovada_ou_isencao_autorizada: "canva_completo",
  contrato_assinado_ou_isencao_autorizada: "assinatura",
  pagamento_confirmado_ou_condicao_financeira_autorizada: "pagamento_confirmado",
  aprovacao_interna_ativacao: "aprovacao_ativacao",
  escopo_definido: "escopo_sku_preco",
  ordem_de_servico_criada: "instrumentos_preparados",
};

export type CheckValidado = { check_key: string; status?: string | null };

/** Gates satisfeitos por requisito validado à mão. */
function gatesValidadosPorCheck(checks: readonly CheckValidado[] = []): Set<string> {
  const satisfeitos = new Set<string>();
  for (const c of checks) {
    const status = String(c?.status ?? "").toLowerCase();
    if (status !== "validado" && status !== "isento" && status !== "ok") continue;
    const gate = GATE_POR_CHECK[c.check_key];
    if (gate) satisfeitos.add(gate);
    // 26/10/2026: "cobrança aprovada" não tinha check próprio e nunca era
    // satisfeita pelos requisitos validados. O check de pagamento/condição
    // financeira autorizada cobre a cobrança também.
    if (gate === "pagamento_confirmado") satisfeitos.add("cobranca_aprovada");
  }
  return satisfeitos;
}

export function gatesAtivacaoFicha(
  caso: Linha,
  checksValidados: readonly CheckValidado[] = [],
): GateAtivacao[] {
  const porCheck = gatesValidadosPorCheck(checksValidados);
  const escopoConferido = preenchido(caso["condicoes_verificadas_em"]);
  const canvaCompleto =
    preenchido(caso["proposta_referencia_interna"]) &&
    preenchido(caso["escopo_incluido_resumido"]) &&
    preenchido(caso["escopo_excluido_resumido"]) &&
    preenchido(caso["marcos_gerais_da_proposta"]);
  const instrumentosProntos = ["contrato_preparado", "revisado", "pronto_para_assinatura"].includes(
    String(caso["preparacao_status"] ?? ""),
  );
  const assinado = Boolean(caso["contrato_assinado"]);
  const pago = Boolean(caso["pagamento_confirmado"]);
  // Pagamento confirmado implica cobrança aprovada (26/10/2026).
  const cobrancaAprovada =
    pago ||
    ["cobranca_emitida", "pagamento_inicial_confirmado", "pagamento_parcial", "quitado"].includes(
      String(caso["situacao_financeira"] ?? ""),
    );
  const ativacaoAprovada = preenchido(caso["ativado_em"]) || String(caso["ativacao_operacional"] ?? "") === "aprovada";

  const caseId = String(caso["id"] ?? "");
  const destinos: Record<string, { rota: string; rotulo: string }> = {
    escopo_sku_preco: { rota: `/casos/${caseId}/contrato/preparar`, rotulo: "Abrir reconciliação de oferta" },
    canva_completo: { rota: `/casos/${caseId}`, rotulo: "Abrir ficha comercial do caso" },
    instrumentos_preparados: { rota: `/casos/${caseId}/contrato/preparar`, rotulo: "Abrir preparação de instrumentos" },
    assinatura: { rota: "/contratos", rotulo: "Abrir contratos e assinaturas" },
    cobranca_aprovada: { rota: "/financeiro", rotulo: "Abrir aprovação de cobrança" },
    pagamento_confirmado: { rota: "/financeiro", rotulo: "Abrir confirmação de pagamento" },
    aprovacao_ativacao: { rota: `/onboarding/${caseId}`, rotulo: "Abrir requisitos e decisão de ativação" },
  };
  const evidencias: Record<string, string> = {
    escopo_sku_preco: "Registro de conferência com data, autor e versão de escopo/SKU/preço.",
    canva_completo: "Proposta aprovada (páginas 1–7) com campos mandatórios validados.",
    instrumentos_preparados: "Prévia contratual, Anexo I e OS gerados da fonte aprovada e revisados.",
    assinatura: "Contrato assinado: versão, data, partes e referência externa.",
    cobranca_aprovada: "Aprovação humana de cobrança registrada no financeiro.",
    pagamento_confirmado: "Confirmação na fonte transacional (não basta informe verbal).",
    aprovacao_ativacao: "Decisão humana de ativação: quem aprovou, quando e com qual evidência.",
  };

  const g = (chave: string, rotulo: string, ok: boolean, responsavel: string, motivo: string): GateAtivacao => ({
    chave,
    rotulo,
    // Requisito validado à mão vale como atendido: é decisão humana registrada,
    // com autor e data, e não pode ser ignorada pela derivação da tela.
    ok: ok || porCheck.has(chave),
    responsavel,
    categoria: CATEGORIA_POR_GATE[chave] ?? "Operação",

    motivo: ok || porCheck.has(chave) ? null : motivo,
    destino: destinos[chave] ?? { rota: `/onboarding/${caseId}`, rotulo: "Abrir requisitos de ativação" },
    evidencia: evidencias[chave] ?? "Evidência documental registrada.",
  });

  return [
    g(
      "escopo_sku_preco",
      "Conferência de escopo, SKU, preço e condição comercial",
      escopoConferido,
      "Comercial",
      "Conferência de condições ainda não registrada no caso.",
    ),
    g(
      "canva_completo",
      "Campos obrigatórios da proposta/Canva completos",
      canvaCompleto,
      "Comercial",
      "Páginas 1–7 da proposta sem todos os campos mandatórios preenchidos e validados.",
    ),
    g(
      "instrumentos_preparados",
      "Contrato e Anexo I/OS preparados e revisados",
      instrumentosProntos,
      "Operações",
      "Prévia contratual e Anexo I/OS ainda não preparados e revisados.",
    ),
    g(
      "assinatura",
      "Contrato assinado por partes competentes",
      assinado,
      "Operações",
      "Assinatura das partes competentes não registrada.",
    ),
    g(
      "cobranca_aprovada",
      "Cobrança aprovada por responsável humano",
      cobrancaAprovada,
      "Financeiro",
      "Nenhuma aprovação humana de cobrança registrada.",
    ),
    g(
      "pagamento_confirmado",
      "Pagamento inicial confirmado na fonte transacional",
      pago,
      "Financeiro",
      "Pagamento inicial não confirmado na fonte transacional.",
    ),
    g(
      "aprovacao_ativacao",
      "Aprovação interna de ativação registrada",
      ativacaoAprovada,
      "Admin",
      "Decisão humana de ativação ainda não registrada.",
    ),
  ];
}

export function resumoGatesAtivacao(caso: Linha, checksValidados: readonly CheckValidado[] = []): {
  itens: GateAtivacao[];
  concluidos: number;
  total: number;
  elegivel: boolean;
  rotuloBotao: string;
  rotaAcao: string;
} {
  const itens = gatesAtivacaoFicha(caso, checksValidados);
  const concluidos = itens.filter((i) => i.ok).length;
  const elegivel = concluidos === itens.length;
  return {
    itens,
    concluidos,
    total: itens.length,
    elegivel,
    rotuloBotao: elegivel ? "Ativar caso" : "Ver requisitos de ativação",
    // Mesmo elegível, a ativação acontece na tela de requisitos, onde a
    // decisão humana é registrada e revalidada no servidor.
    rotaAcao: `/onboarding/${String(caso["id"] ?? "")}`,
  };
}

/* ---------------- Requisitos agrupados por categoria ---------------- */

export type BlocoCategoriaGate = {
  categoria: CategoriaGate;
  itens: GateAtivacao[];
  concluidos: number;
  total: number;
  /** Estado derivado da categoria: só é "concluída" quando todos os requisitos têm evidência. */
  estado: "concluida" | "pendente";
};

export function gatesPorCategoria(caso: Linha, checksValidados: readonly CheckValidado[] = []): BlocoCategoriaGate[] {
  const itens = gatesAtivacaoFicha(caso, checksValidados);
  return CATEGORIAS_GATE.map((categoria) => {
    const doGrupo = itens.filter((i) => i.categoria === categoria);
    const concluidos = doGrupo.filter((i) => i.ok).length;
    return {
      categoria,
      itens: doGrupo,
      concluidos,
      total: doGrupo.length,
      estado: doGrupo.length > 0 && concluidos === doGrupo.length ? "concluida" : "pendente",
    };
  });
}

/**
 * Estado derivado da ficha a partir dos gates pendentes.
 * É leitura explicável: nunca altera status, nunca habilita ação externa.
 */
export type EstadoDerivadoGates = {
  rotulo: string;
  explicacao: string;
  categoriaBloqueante: CategoriaGate | null;
  pendentes: GateAtivacao[];
  elegivel: boolean;
};

export function estadoDerivadoPorGates(caso: Linha, checksValidados: readonly CheckValidado[] = []): EstadoDerivadoGates {
  const itens = gatesAtivacaoFicha(caso, checksValidados);
  const pendentes = itens.filter((i) => !i.ok);
  if (pendentes.length === 0) {
    return {
      rotulo: "Requisitos completos — ativação depende de decisão humana",
      explicacao:
        "Todos os requisitos têm evidência registrada. A ativação continua sendo decidida por pessoa autorizada e revalidada no servidor.",
      categoriaBloqueante: null,
      pendentes: [],
      elegivel: true,
    };
  }
  const primeiro = pendentes[0]!;
  return {
    rotulo: `Bloqueado em ${primeiro.categoria}`,
    explicacao: `${pendentes.length} requisito(s) sem evidência. Primeiro bloqueio: ${primeiro.rotulo} — ${primeiro.motivo ?? "pendente"} (responsável: ${primeiro.responsavel}).`,
    categoriaBloqueante: primeiro.categoria,
    pendentes,
    elegivel: false,
  };
}

/* ---------------- Plano de formalização com critério de conclusão ---------------- */

export type PassoFormalizacao = {
  ordem: number;
  acao: string;
  concluidaQuando: string;
  responsavel: string;
  ok: boolean;
};

export function passosFormalizacao(caso: Linha): PassoFormalizacao[] {
  const gates = Object.fromEntries(gatesAtivacaoFicha(caso).map((g) => [g.chave, g.ok]));
  return [
    {
      ordem: 1,
      acao: "Conferir páginas 1–7 da proposta Canva",
      concluidaQuando: "Todos os campos mandatórios estão preenchidos e validados internamente.",
      responsavel: "Comercial",
      ok: Boolean(gates["canva_completo"]),
    },
    {
      ordem: 2,
      acao: "Reconciliar oferta",
      concluidaQuando:
        "Produto-pai, trilha, escopo, SKU, valor, condições e participantes correspondem à proposta aceita.",
      responsavel: "Comercial",
      ok: Boolean(gates["escopo_sku_preco"]),
    },
    {
      ordem: 3,
      acao: "Preparar contrato e OS",
      concluidaQuando: "Prévia contratual baseada na versão de escopo reconciliada.",
      responsavel: "Operações",
      ok: Boolean(gates["instrumentos_preparados"]),
    },
    {
      ordem: 4,
      acao: "Revisar formalização",
      concluidaQuando: "Responsável aprova a prévia para envio, sem cobrança automática.",
      responsavel: "Operações",
      ok: Boolean(gates["instrumentos_preparados"]),
    },
    {
      ordem: 5,
      acao: "Enviar para assinatura",
      concluidaQuando: "Evento separado, com versão, signatários e prazo de assinatura registrados.",
      responsavel: "Operações",
      ok: Boolean(gates["assinatura"]),
    },
  ];
}

/** Checagem formal de poderes de representação antes da versão definitiva. */
export const CHECAGEM_REPRESENTACAO = [
  "Poderes de representação conferidos para cada signatário adulto.",
  "Documentação de identificação e qualificação anexada e validada.",
  "Dependente menor representado por responsável legal identificado no instrumento.",
  "Campos obrigatórios de partes e signatários completos na versão definitiva.",
];

/* ---------------- Datas: previsão condicional, nunca marco garantido ---------------- */

export type PrevisaoCondicional = {
  chave: string;
  rotulo: string;
  data: string;
  condicao: string;
};

function formatar(valor: unknown): string | null {
  const bruto = typeof valor === "string" ? valor.trim() : "";
  if (!bruto) return null;
  const d = new Date(bruto.length <= 10 ? `${bruto}T12:00:00` : bruto);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("pt-BR");
}

export function previsoesCondicionais(caso: Linha): PrevisaoCondicional[] {
  const itens: (PrevisaoCondicional | null)[] = [
    formatar(caso["prazo_proxima_acao"])
      ? {
          chave: "completude_proposta",
          rotulo: "Meta interna de completude da proposta",
          data: formatar(caso["prazo_proxima_acao"])!,
          condicao: "Meta interna de equipe. Não é marco contratado nem compromisso com o cliente.",
        }
      : null,
    formatar(caso["data_prevista_contrato"])
      ? {
          chave: "contrato",
          rotulo: "Previsão de contrato",
          data: formatar(caso["data_prevista_contrato"])!,
          condicao: "Condicionada à completude de escopo, revisão de formalização e assinatura das partes.",
        }
      : null,
    formatar(caso["data_prevista_pagamento"])
      ? {
          chave: "pagamento",
          rotulo: "Previsão de pagamento inicial",
          data: formatar(caso["data_prevista_pagamento"])!,
          condicao: "Condicionada a contrato assinado e cobrança aprovada por responsável humano.",
        }
      : null,
    formatar(caso["data_prevista_onboarding"])
      ? {
          chave: "onboarding",
          rotulo: "Previsão de onboarding",
          data: formatar(caso["data_prevista_onboarding"])!,
          condicao:
            "Condicionada a contrato assinado, pagamento inicial confirmado e aprovação interna de ativação.",
        }
      : null,
  ];
  return itens.filter((i): i is PrevisaoCondicional => i !== null);
}

/** Limite da solicitação em D+1: só o estritamente necessário à formalização. */
export const ESCOPO_SOLICITACAO_D1 = {
  permitido: [
    "Qualificação das partes signatárias (nome completo, documento, estado civil, endereço).",
    "Representação legal do dependente menor.",
    "Confirmação de escopo e condição comercial aceita.",
  ],
  bloqueado: [
    "Coleta documental ampla para pesquisa.",
    "Ambiente do cliente e acessos ao App.",
    "Checklist de operação e onboarding.",
    "Comunicações de boas-vindas.",
  ],
};

/** Condições mínimas para que uma exceção altere um gate. Exceção não é marcação manual. */
export const REGRAS_EXCECAO_GATE = [
  "Somente perfis autorizados (admin ou operações) podem registrar exceção.",
  "Justificativa escrita obrigatória, vinculada ao requisito específico.",
  "Evidência documental anexada; ausência de evidência invalida a exceção.",
  "Validade com data-limite: exceção expirada volta a bloquear a ativação.",
  "Exceção, validação, invalidação e tentativa bloqueada ficam na trilha de auditoria.",
];
