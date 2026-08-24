/**
 * CA-OPS-02 — Fiação read-only entre cadência (Onboarding-Jornada), Biblioteca
 * de Mensagens e catálogo de módulos.
 *
 * Invariantes desta camada (garantidos por construção, sem I/O):
 * - nada é enviado, agendado, persistido ou registrado como uso;
 * - nenhum touchpoint, fila, rascunho ou evento de comunicação é criado;
 * - nenhum gate de contrato, pagamento, onboarding, entrega ou publicação é
 *   alterado: a resolução apenas indica o modelo vigente para leitura e cópia
 *   manual, e a validação de gate continua no banco, no uso manual.
 */

export const ACAO_PERMITIDA = "abrir_preview_e_copiar_manual" as const;

export type TipoAlertaCadencia =
  | "sem_touchpoint_10d"
  | "sem_atualizacao_14d"
  | "sem_proxima_acao"
  | "sem_microentrega_planejada"
  | "caso_bloqueado";

export type SeveridadeAlerta = "media" | "alta" | "critica";

export type MapaAlertaTemplate = {
  alerta: TipoAlertaCadencia;
  rotulo: string;
  severidade: SeveridadeAlerta;
  /** Palavras-chave usadas para resolver o modelo vigente já existente. */
  chaves: string[];
  /** Variáveis seguras permitidas no contexto de preview. */
  variaveisPermitidas: string[];
  /** Gate que continua sendo validado no uso manual do modelo. */
  gate: string;
};

export const MAPA_ALERTA_TEMPLATE: MapaAlertaTemplate[] = [
  {
    alerta: "sem_touchpoint_10d",
    rotulo: "10+ dias sem touchpoint",
    severidade: "alta",
    chaves: ["reengajamento", "acompanhamento", "touchpoint", "follow"],
    variaveisPermitidas: ["nome_cliente", "codigo_caso", "dias_sem_contato"],
    gate: "onboarding",
  },
  {
    alerta: "sem_atualizacao_14d",
    rotulo: "14+ dias sem atualização",
    severidade: "critica",
    chaves: ["atualizacao", "andamento", "status"],
    variaveisPermitidas: ["nome_cliente", "codigo_caso", "dias_sem_atualizacao"],
    gate: "entrega",
  },
  {
    alerta: "sem_proxima_acao",
    rotulo: "Sem próxima ação",
    severidade: "media",
    chaves: ["proximo_passo", "proxima_acao", "interno"],
    variaveisPermitidas: ["codigo_caso", "responsavel"],
    gate: "interno",
  },
  {
    alerta: "sem_microentrega_planejada",
    rotulo: "Sem microentrega planejada",
    severidade: "media",
    chaves: ["microentrega", "entrega", "alinhamento"],
    variaveisPermitidas: ["codigo_caso", "responsavel"],
    gate: "entrega",
  },
  {
    alerta: "caso_bloqueado",
    rotulo: "Caso bloqueado",
    severidade: "critica",
    chaves: ["bloqueio", "pendencia", "gate"],
    variaveisPermitidas: ["codigo_caso", "motivo_bloqueio"],
    gate: "contrato_ou_pagamento",
  },
];

export function mapaDoAlerta(alerta: string): MapaAlertaTemplate | null {
  return MAPA_ALERTA_TEMPLATE.find((m) => m.alerta === alerta) ?? null;
}

/** Converte o título/regra interna de cadência no tipo canônico de alerta. */
export function tipoAlertaDeTexto(texto: string): TipoAlertaCadencia | null {
  const t = texto.toLowerCase();
  if (t.includes("d14") || t.includes("14 dias") || t.includes("atualiza")) return "sem_atualizacao_14d";
  if (t.includes("d10") || t.includes("10 dias") || t.includes("touchpoint")) return "sem_touchpoint_10d";
  if (t.includes("microentrega")) return "sem_microentrega_planejada";
  if (t.includes("próxima ação") || t.includes("proxima acao")) return "sem_proxima_acao";
  if (t.includes("bloque")) return "caso_bloqueado";
  return null;
}

/** Forma mínima de um modelo da Biblioteca de Mensagens (leitura). */
export type ModeloCatalogo = {
  id: string;
  key: string;
  nome: string;
  etapa?: string | null;
  status: string;
  arquivado?: boolean;
  demo?: boolean;
  versao?: number;
};

export type ResolucaoModelo = {
  alerta: TipoAlertaCadencia;
  modelo: ModeloCatalogo | null;
  mensagem: string | null;
  acaoPermitida: typeof ACAO_PERMITIDA;
  envioExecutado: false;
  persistido: false;
  usoRegistrado: false;
};

const SEM_MODELO = "Não há modelo vigente para este alerta.";

/**
 * Resolve o modelo vigente aplicável a um alerta. Somente leitura: recebe a
 * lista já carregada pela Biblioteca de Mensagens e nunca cria modelo.
 */
export function resolverModeloVigente(
  alerta: string,
  modelos: ModeloCatalogo[],
): ResolucaoModelo {
  const base = {
    acaoPermitida: ACAO_PERMITIDA,
    envioExecutado: false,
    persistido: false,
    usoRegistrado: false,
  } as const;
  const mapa = mapaDoAlerta(alerta);
  if (!mapa) {
    return { alerta: "sem_proxima_acao", modelo: null, mensagem: SEM_MODELO, ...base };
  }
  const elegiveis = modelos.filter(
    (m) => m.status === "vigente" && !m.arquivado && !m.demo,
  );
  const pontuar = (m: ModeloCatalogo) => {
    const alvo = `${m.key} ${m.nome} ${m.etapa ?? ""}`.toLowerCase();
    return mapa.chaves.reduce((acc, c) => (alvo.includes(c) ? acc + 1 : acc), 0);
  };
  const escolhido = elegiveis
    .map((m) => ({ m, p: pontuar(m) }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p || (b.m.versao ?? 0) - (a.m.versao ?? 0))[0]?.m ?? null;

  return {
    alerta: mapa.alerta,
    modelo: escolhido,
    mensagem: escolhido ? null : SEM_MODELO,
    ...base,
  };
}

export type ContextoSeguro = {
  caseId: string | null;
  codigoCaso: string | null;
  alerta: TipoAlertaCadencia;
  rotuloAlerta: string;
  severidade: SeveridadeAlerta;
  gate: string;
  variaveisPermitidas: string[];
  persistido: false;
  envioExecutado: false;
};

/** Contexto exibido ao lado do modelo. Nunca é gravado nem enviado. */
export function contextoSeguro(
  alerta: string,
  caso: { caseId?: string | null; codigo?: string | null },
): ContextoSeguro | null {
  const mapa = mapaDoAlerta(alerta);
  if (!mapa) return null;
  return {
    caseId: caso.caseId ?? null,
    codigoCaso: caso.codigo ?? null,
    alerta: mapa.alerta,
    rotuloAlerta: mapa.rotulo,
    severidade: mapa.severidade,
    gate: mapa.gate,
    variaveisPermitidas: mapa.variaveisPermitidas,
    persistido: false,
    envioExecutado: false,
  };
}

/* --------------------------------------------- Painel Hoje × cadência */

/**
 * Decisão registrada: a fonte do Onboarding-Jornada expõe `case_id` e títulos
 * de alerta, mas não expõe severidade normalizada nem rota canônica por
 * ocorrência no mesmo payload dos contadores. Integrar linha a linha exigiria
 * recalcular no Painel Hoje — proibido. Logo, apenas o atalho é implementado.
 */
export const INTEGRACAO_CADENCIA_PAINEL = {
  estado: "BLOQUEADO" as const,
  motivo:
    "Os contadores do Onboarding-Jornada são agregados e as ocorrências não trazem severidade normalizada nem rota canônica por linha; integrar exigiria recálculo no Painel Hoje.",
  alternativa: {
    tipo: "atalho" as const,
    rotulo: "Ver cadência e onboarding em risco",
    rota: "/ops",
  },
  criaTarefa: false,
  criaContagemParalela: false,
} as const;

/* ------------------------------------------------- catálogo de alertas */

export type EstadoModuloAlerta =
  | "conectado"
  | "catalogado, sem superfície implementada"
  | "gap real — não implementado";

export type AuditoriaModuloAlerta = {
  moduloId: string;
  modulo: string;
  fonteReal: string;
  rotaReal: string | null;
  calculo: string;
  uiExistente: boolean;
  reutilizavelNoPainelHoje: boolean;
  estado: EstadoModuloAlerta;
};

export const AUDITORIA_MODULOS_ALERTA: AuditoriaModuloAlerta[] = [
  {
    moduloId: "ale-achados",
    modulo: "Achados novos",
    fonteReal: "research_findings (via caso) — src/routes/_authenticated/achados.$caseId.tsx",
    rotaReal: "/achados/$caseId",
    calculo: "Listagem por caso; nenhum contador global derivado.",
    uiExistente: true,
    reutilizavelNoPainelHoje: false,
    estado: "conectado",
  },
  {
    moduloId: "ale-microentregas",
    modulo: "Micro-entregas em revisão",
    fonteReal: "client_deliverables — src/lib/onboarding-jornada.functions.ts",
    rotaReal: "/ops",
    calculo: "Contador entregas_aguardando_aprovacao do Onboarding-Jornada.",
    uiExistente: true,
    reutilizavelNoPainelHoje: false,
    estado: "conectado",
  },
  {
    moduloId: "ale-documentos",
    modulo: "Pendências documentais",
    fonteReal: "evidences / documents — src/lib/biblioteca-evidencias.functions.ts",
    rotaReal: "/evidencias",
    calculo: "Estado de validação por evidência; sem contador global de pendência.",
    uiExistente: true,
    reutilizavelNoPainelHoje: false,
    estado: "conectado",
  },
  {
    moduloId: "ale-acoes-vencidas",
    modulo: "Próximas ações vencidas",
    fonteReal: "tarefas operacionais — src/routes/_authenticated/tarefas.tsx",
    rotaReal: "/tarefas",
    calculo: "Prazo interno vencido por tarefa.",
    uiExistente: true,
    reutilizavelNoPainelHoje: true,
    estado: "conectado",
  },
  {
    moduloId: "ale-rascunhos",
    modulo: "Rascunhos de comunicação",
    fonteReal: "src/lib/fila-comunicacao.ts (lógica pura, envio desligado)",
    rotaReal: null,
    calculo: "montarFilaHumana sobre contextos informados; nada persistido.",
    uiExistente: false,
    reutilizavelNoPainelHoje: false,
    estado: "catalogado, sem superfície implementada",
  },
  {
    moduloId: "ale-d10-d14",
    modulo: "Alertas D10 / D14",
    fonteReal: "avaliarCadencia — src/lib/onboarding-jornada.ts",
    rotaReal: "/ops",
    calculo: "diasEntre(ultimo touchpoint/atualização) ≥ 10 / ≥ 14, com espera externa suspendendo.",
    uiExistente: true,
    reutilizavelNoPainelHoje: false,
    estado: "conectado",
  },
  {
    moduloId: "ale-fila-revisao",
    modulo: "Fila de revisão",
    fonteReal: "fila de revisão jurídica — src/components/contratos/fila-revisao-juridica.tsx",
    rotaReal: "/matriz-juridica",
    calculo: "Itens jurídicos aguardando revisão humana.",
    uiExistente: true,
    reutilizavelNoPainelHoje: true,
    estado: "conectado",
  },
];

/**
 * Duplicidade de catálogos de templates — RESOLVIDA em CA-OPS-03.
 * Precedência canônica em src/lib/consolidacao-catalogos-templates.ts.
 * Mantido aqui como registro histórico da decisão; nenhuma rota foi removida.
 */
export const DUPLICIDADE_CATALOGOS_TEMPLATE = {
  oficialOperacional: {
    id: "biblioteca-mensagens",
    rotulo: "Biblioteca de mensagens operacionais",
    rota: "/biblioteca-mensagens",
    fonte: "message_templates / message_template_versions / message_template_usage",
  },
  vitrineInstitucional: {
    id: "bib-templates-com",
    rotulo: "Modelos institucionais",
    rota: null,
    fonte: "sem fonte de dados própria implementada",
  },
  mesmaFonte: false,
  precedencia: "/biblioteca-mensagens prevalece para qualquer comunicação operacional.",
  decisaoHumanaPendente: false,
  resolucao: "CA-OPS-03: 'Modelos institucionais' vira apontador histórico para /biblioteca-mensagens.",
} as const;

