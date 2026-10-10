/**
 * CA-LOVABLE-ONBOARDING-JORNADA-v1.1 — regras puras.
 *
 * Este módulo apenas diagnostica e deriva estado. Ele nunca inicia onboarding,
 * nunca publica entrega, nunca gera contrato, cobrança, assinatura, pesquisa
 * externa ou comunicação. Toda mudança real acontece via server function com
 * gate, persistência e auditoria.
 */

import { EIXO_FORMALIZACAO } from "@/lib/crm-desk";
import {
  DIAS_CADENCIA_ATENCAO,
  DIAS_CADENCIA_CRITICA,
  DIAS_PRIMEIRA_MICROENTREGA,
} from "@/lib/cadencia-limiares";
import { contemCpf } from "@/lib/validacao-pessoa";

/* ---------------------------------------------------------------- estados */

export const EIXO_OPERACAO = [
  { id: "nao_iniciado", rotulo: "Não iniciado" },
  { id: "formalizacao_em_preparacao", rotulo: "Formalização em preparação" },
  { id: "contrato_enviado", rotulo: "Contrato enviado" },
  { id: "contrato_assinado", rotulo: "Contrato assinado" },
  { id: "pagamento_inicial_confirmado", rotulo: "Pagamento inicial confirmado" },
  { id: "onboarding_iniciado", rotulo: "Onboarding iniciado" },
  { id: "caso_ativo", rotulo: "Caso ativo" },
  { id: "arquivado", rotulo: "Arquivado" },
] as const;

export type EixoOperacao = (typeof EIXO_OPERACAO)[number]["id"];

export const ESTADO_DERIVADO = [
  { id: "pre_onboarding_bloqueado", rotulo: "Pendências de pré-onboarding" },
  { id: "formalizacao_pendente", rotulo: "Formalização pendente" },
  { id: "onboarding_pendente", rotulo: "Onboarding pendente" },
  { id: "em_execucao", rotulo: "Em execução" },
  { id: "aguardando_cliente", rotulo: "Aguardando cliente" },
  { id: "aguardando_terceiro", rotulo: "Aguardando terceiro" },
  { id: "concluido", rotulo: "Concluído" },
  { id: "arquivado", rotulo: "Arquivado" },
] as const;

export type EstadoDerivado = (typeof ESTADO_DERIVADO)[number]["id"];

export const FASES_JORNADA = [
  { id: "aceite_e_formalizacao", rotulo: "Aceite e formalização", cliente: "Etapas iniciais" },
  { id: "onboarding", rotulo: "Onboarding", cliente: "Preparação do seu acompanhamento" },
  { id: "pesquisa_inicial", rotulo: "Pesquisa inicial", cliente: "Início da pesquisa" },
  { id: "pesquisa_e_validacao", rotulo: "Pesquisa e validação", cliente: "Pesquisa em andamento" },
  { id: "preparacao_documental", rotulo: "Preparação documental", cliente: "Organização dos documentos" },
  { id: "protocolo_e_acompanhamento", rotulo: "Protocolo e acompanhamento", cliente: "Acompanhamento" },
  { id: "reconhecimento", rotulo: "Reconhecimento", cliente: "Reconhecimento" },
  { id: "pos_reconhecimento", rotulo: "Pós-reconhecimento", cliente: "Depois do reconhecimento" },
] as const;

export type FaseJornada = (typeof FASES_JORNADA)[number]["id"];

export const STATUS_CHECKLIST = [
  { id: "pendente", rotulo: "Pendente" },
  { id: "em_revisao", rotulo: "Em revisão" },
  { id: "concluido", rotulo: "Concluído" },
  { id: "bloqueado", rotulo: "Bloqueado" },
  { id: "nao_aplicavel", rotulo: "Não aplicável" },
] as const;

export type StatusChecklist = (typeof STATUS_CHECKLIST)[number]["id"];

/*
 * 04/09/2026 — decisão da Proprietária: vocabulário em português sempre
 * prevalece. `client_deliverables.approval_status` tinha dois conjuntos de
 * strings conflitantes na mesma coluna — este (inglês) e o de
 * `jornada-cliente.ts` (`STATUS_APROVACAO`, português). Alinhado aqui aos
 * mesmos 5 valores/mesma ordem de `STATUS_APROVACAO` para que os dois
 * módulos leiam e gravem exatamente a mesma coisa.
 */
export const STATUS_ENTREGA = [
  { id: "rascunho", rotulo: "Rascunho" },
  { id: "em_revisao", rotulo: "Em revisão" },
  { id: "aprovado", rotulo: "Aprovada" },
  { id: "publicado", rotulo: "Publicada" },
  { id: "arquivado", rotulo: "Arquivada" },
] as const;

export type StatusEntrega = (typeof STATUS_ENTREGA)[number]["id"];

export const TIPOS_ENTREGA = [
  { id: "boas_vindas", rotulo: "Boas-vindas" },
  { id: "plano_de_acao", rotulo: "Plano de ação" },
  { id: "checklist_documental", rotulo: "Checklist documental" },
  { id: "confirmacao_documento_recebido", rotulo: "Confirmação de documento recebido" },
  { id: "documento_localizado", rotulo: "Documento localizado" },
  { id: "documento_validado", rotulo: "Documento validado" },
  { id: "pendencia_contextualizada", rotulo: "Pendência contextualizada" },
  { id: "atualizacao_sem_acao_cliente", rotulo: "Atualização sem ação do cliente" },
  { id: "arvore_inicial", rotulo: "Árvore inicial" },
  { id: "relatorio_parcial", rotulo: "Relatório parcial" },
  { id: "proximo_passo_personalizado", rotulo: "Próximo passo personalizado" },
  { id: "marco_de_etapa", rotulo: "Marco de etapa" },
  { id: "atualizacao_de_jornada", rotulo: "Atualização de jornada" },
] as const;

export type TipoEntrega = (typeof TIPOS_ENTREGA)[number]["id"];

export function rotulo(lista: readonly { id: string; rotulo: string }[], id?: string | null) {
  return lista.find((x) => x.id === id)?.rotulo ?? id ?? "—";
}

/* ------------------------------------------------------------- checklist */

export type ItemPadrao = {
  item_codigo: string;
  titulo: string;
  descricao_interna: string;
  obrigatorio: boolean;
  /** Gate correspondente no diagnóstico. */
  gate: string;
};

export const CHECKLIST_ONBOARDING_PADRAO: ItemPadrao[] = [
  { item_codigo: "contrato_assinado", titulo: "Contrato assinado", descricao_interna: "Assinatura registrada internamente.", obrigatorio: true, gate: "contrato_assinado" },
  { item_codigo: "pagamento_inicial", titulo: "Pagamento inicial confirmado", descricao_interna: "Confirmação financeira registrada.", obrigatorio: true, gate: "pagamento_inicial" },
  { item_codigo: "responsavel_principal", titulo: "Responsável principal definido", descricao_interna: "Derivado do caso (padrão Tatiana). Sem tick manual.", obrigatorio: false, gate: "responsavel_principal" },
  { item_codigo: "nucleo_familiar", titulo: "Núcleo familiar validado", descricao_interna: "Validação do núcleo quando aplicável.", obrigatorio: true, gate: "nucleo_familiar" },
  { item_codigo: "participantes", titulo: "Participantes vinculados", descricao_interna: "Contratante e participantes identificados.", obrigatorio: true, gate: "participantes" },
  { item_codigo: "representacao_menor", titulo: "Representação de menor validada", descricao_interna: "Documentação de representação quando houver menor ou dependente.", obrigatorio: true, gate: "representacao_menor" },
  { item_codigo: "dossie_mae", titulo: "Dossiê-mãe criado ou vinculado", descricao_interna: "Referência interna do dossiê-mãe.", obrigatorio: true, gate: "dossie_mae" },
  { item_codigo: "ambiente_acesso", titulo: "Ambiente e nível de acesso definidos", descricao_interna: "Nível de acesso do App Cliente definido.", obrigatorio: true, gate: "ambiente_acesso" },
  { item_codigo: "case_service", titulo: "Produto, trilha e case_service consolidados", descricao_interna: "Serviço consolidado a partir de fonte homologada.", obrigatorio: true, gate: "case_service" },
  { item_codigo: "escopo_aprovado", titulo: "Escopo aprovado", descricao_interna: "Escopo aprovado na proposta/OS.", obrigatorio: true, gate: "escopo_aprovado" },
  { item_codigo: "checklist_documental", titulo: "Checklist documental inicial criado", descricao_interna: "Lista inicial de documentos do caso.", obrigatorio: true, gate: "checklist_documental" },
  { item_codigo: "plano_acao", titulo: "Plano de ação criado", descricao_interna: "Plano operacional do caso registrado.", obrigatorio: true, gate: "plano_acao" },
  { item_codigo: "proxima_acao_inicial", titulo: "Próxima ação inicial definida", descricao_interna: "Próxima ação, responsável e prazo definidos.", obrigatorio: true, gate: "proxima_acao_inicial" },
  { item_codigo: "primeira_microentrega", titulo: "Primeira microentrega planejada", descricao_interna: "Microentrega planejada até D7.", obrigatorio: true, gate: "primeira_microentrega" },
  { item_codigo: "limite_atualizacao", titulo: "Data-limite de atualização contextualizada definida", descricao_interna: "Limite da próxima atualização ao cliente.", obrigatorio: true, gate: "limite_atualizacao" },
];

/* ------------------------------------------------------------ diagnóstico */

export type CasoDiagnostico = {
  id?: string;
  codigo?: string | null;
  eixo_operacao?: string | null;
  status_caso_derivado?: string | null;
  onboarding_iniciado_em?: string | null;
  contrato_assinado?: boolean | null;
  pagamento_confirmado?: boolean | null;
  responsavel_principal?: string | null;
  responsavel_id?: string | null;
  case_service_id?: string | null;
  dossie_mae_referencia?: string | null;
  app_visibility_level?: string | null;
  proxima_acao?: string | null;
  prazo_proxima_acao?: string | null;
  archived_at?: string | null;
  aguardando_instituicao_externa?: boolean | null;
};

export type ContextoDiagnostico = {
  checklist?: { item_code?: string | null; status?: string | null; obrigatorio?: boolean | null; archived_at?: string | null }[];
  plano?: {
    status?: string | null;
    responsavel_user_id?: string | null;
    proxima_acao?: string | null;
    prazo_proxima_acao?: string | null;
    proxima_microentrega?: string | null;
    proxima_atualizacao_limite_em?: string | null;
    ultima_atualizacao_cliente_em?: string | null;
    pendencias_cliente_qtd?: number | null;
    pendencias_cliente?: string[] | null;
    archived_at?: string | null;
  } | null;
  nucleoValidado?: boolean;
  /** Dossiê-mãe canônico (núcleo do caso) — ver dossieMaeDoCaso em nucleo-completude.ts. */
  dossieMae?: { ativo: boolean; fonte: "nucleo" | "legado_caso" | "ausente" } | null;
  /**
   * D7 derivado de dado real: existe micro-entrega em ops_microentregas do
   * caso (não arquivada, não cancelada) — ver primeiraMicroentregaReal em
   * onboarding-plano.ts. Texto livre e checkbox manual não contam.
   */
  primeiraMicroentregaReal?: boolean;
  participantesVinculados?: boolean;
  representacaoOk?: boolean;
  escopoAprovado?: boolean;
  checklistDocumentalCriado?: boolean;
  bloqueiosExternos?: string[];
};

export type Gate = { codigo: string; titulo: string; ok: boolean; motivo?: string };

export type DiagnosticoOnboarding = {
  status: "pronto_para_iniciar" | "requer_revisao" | "bloqueado";
  gates_ok: Gate[];
  gates_pendentes: Gate[];
  bloqueios: string[];
  proxima_acao: string | null;
  responsavel: string | null;
  prazo: string | null;
};

const GATES_CRITICOS = ["contrato_assinado", "pagamento_inicial"];

/** Somente leitura: diagnostica gates de onboarding. Não altera nada. */
export function diagnosticarOnboarding(caso: CasoDiagnostico, ctx: ContextoDiagnostico = {}): DiagnosticoOnboarding {
  const planoAtivo = ctx.plano && ctx.plano.status === "ativo" && !ctx.plano.archived_at ? ctx.plano : null;
  const item = (codigo: string) =>
    (ctx.checklist ?? []).find((c) => c.item_code === codigo && !c.archived_at) ?? null;
  const concluido = (codigo: string) => {
    const i = item(codigo);
    return i ? i.status === "concluido" || i.status === "nao_aplicavel" : false;
  };

  const g = (codigo: string, titulo: string, ok: boolean, motivo?: string): Gate => ({ codigo, titulo, ok, motivo });

  const gates: Gate[] = [
    g("contrato_assinado", "Contrato assinado registrado", Boolean(caso.contrato_assinado) || concluido("contrato_assinado"), "Contrato assinado não registrado."),
    g("pagamento_inicial", "Pagamento inicial confirmado", Boolean(caso.pagamento_confirmado) || concluido("pagamento_inicial"), "Pagamento inicial não confirmado."),
    g("responsavel_principal", "Responsável principal definido", Boolean(caso.responsavel_principal?.trim() || caso.responsavel_id) || concluido("responsavel_principal"), "Caso sem responsável principal."),
    g("nucleo_familiar", "Núcleo familiar validado", ctx.nucleoValidado === true || concluido("nucleo_familiar"), "Núcleo familiar não validado."),
    g("participantes", "Participantes vinculados", ctx.participantesVinculados === true || concluido("participantes"), "Contratante e participantes não identificados."),
    g("representacao_menor", "Representação legal documentada", ctx.representacaoOk === true || concluido("representacao_menor"), "Representação de menor ou dependente não documentada."),
    // Dossiê-mãe é do núcleo: com leitura canônica disponível, só o núcleo
    // com dossiê "ativo" libera; o ponteiro antigo do caso vira "legado".
    g(
      "dossie_mae",
      "Dossiê-mãe ativo no núcleo",
      (ctx.dossieMae ? ctx.dossieMae.ativo : Boolean(caso.dossie_mae_referencia?.trim())) || concluido("dossie_mae"),
      ctx.dossieMae?.fonte === "legado_caso"
        ? "Dossiê-mãe só no registro antigo do caso — cadastre-o no núcleo familiar."
        : ctx.dossieMae?.fonte === "nucleo"
          ? "Dossiê-mãe do núcleo ainda não está ativo."
          : "Dossiê-mãe ausente.",
    ),
    g("ambiente_acesso", "Ambiente e nível de acesso definidos", Boolean(caso.app_visibility_level?.trim()) || concluido("ambiente_acesso"), "Ambiente e nível de acesso não definidos."),
    g("case_service", "Produto/case_service consolidado", Boolean(caso.case_service_id) || concluido("case_service"), "case_service não consolidado."),
    g("escopo_aprovado", "Escopo aprovado", ctx.escopoAprovado === true || concluido("escopo_aprovado"), "Escopo não aprovado."),
    g("checklist_documental", "Checklist documental inicial criado", ctx.checklistDocumentalCriado === true || concluido("checklist_documental"), "Checklist documental inicial não criado."),
    g("plano_acao", "Plano de ação criado", Boolean(planoAtivo) || concluido("plano_acao"), "Plano operacional ativo inexistente."),
    g(
      "proxima_acao_inicial",
      "Próxima ação, responsável e prazo definidos",
      Boolean(planoAtivo?.responsavel_user_id && planoAtivo?.proxima_acao && planoAtivo?.prazo_proxima_acao) ||
        Boolean(caso.proxima_acao?.trim() && caso.prazo_proxima_acao) ||
        concluido("proxima_acao_inicial"),
      "Próxima ação, responsável ou prazo ausentes.",
    ),
    // 24/09/2026 — corte D: só micro-entrega real (ops_microentregas) aprova
    // o D7. Antes bastava texto em case_plans.proxima_microentrega ou marcar
    // o item à mão no checklist — nenhum dos dois prova que ela existe.
    g("primeira_microentrega", "Primeira microentrega planejada", ctx.primeiraMicroentregaReal === true, "Nenhuma micro-entrega registrada para o caso (ops_microentregas)."),
    g("limite_atualizacao", "Data-limite de atualização definida", Boolean(planoAtivo?.proxima_atualizacao_limite_em) || concluido("limite_atualizacao"), "Data-limite de atualização contextualizada não definida."),
  ];

  const gates_ok = gates.filter((x) => x.ok);
  const gates_pendentes = gates.filter((x) => !x.ok);

  const bloqueios = [
    ...(ctx.bloqueiosExternos ?? []),
    ...gates_pendentes.filter((x) => GATES_CRITICOS.includes(x.codigo)).map((x) => x.motivo!),
  ];

  let status: DiagnosticoOnboarding["status"] = "pronto_para_iniciar";
  if (bloqueios.length) status = "bloqueado";
  else if (gates_pendentes.length) status = "requer_revisao";

  return {
    status,
    gates_ok,
    gates_pendentes,
    bloqueios,
    proxima_acao: planoAtivo?.proxima_acao ?? caso.proxima_acao ?? gates_pendentes[0]?.motivo ?? null,
    responsavel: caso.responsavel_principal ?? planoAtivo?.responsavel_user_id ?? null,
    prazo: planoAtivo?.prazo_proxima_acao ?? caso.prazo_proxima_acao ?? null,
  };
}

/** Estado derivado do caso a partir do eixo, gates e pendências. */
export function derivarEstadoCaso(caso: CasoDiagnostico, diag: DiagnosticoOnboarding, ctx: ContextoDiagnostico = {}): EstadoDerivado {
  if (caso.archived_at || caso.eixo_operacao === "arquivado") return "arquivado";
  if (caso.eixo_operacao === "caso_ativo") {
    if (caso.aguardando_instituicao_externa) return "aguardando_terceiro";
    const pendCliente = ctx.plano?.pendencias_cliente_qtd ?? ctx.plano?.pendencias_cliente?.length ?? 0;
    if (pendCliente > 0) return "aguardando_cliente";
    return "em_execucao";
  }
  if (caso.eixo_operacao === "onboarding_iniciado") return "onboarding_pendente";
  if (diag.bloqueios.length) return "pre_onboarding_bloqueado";
  if (diag.status === "pronto_para_iniciar") return "onboarding_pendente";
  return "formalizacao_pendente";
}

/* -------------------------------------------------------------- cadência */

export const CADENCIA = {
  primeiraMicroentregaDias: DIAS_PRIMEIRA_MICROENTREGA,
  atencaoDias: DIAS_CADENCIA_ATENCAO,
  criticoDias: DIAS_CADENCIA_CRITICA,
} as const;

export type AlertaCadencia = {
  regra: "D7" | "D10" | "D14";
  criticidade: "media" | "alta" | "critica";
  titulo: string;
  detalhe: string;
};

export function diasEntre(desde?: string | null, hoje = new Date()): number | null {
  if (!desde) return null;
  const d = new Date(desde);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((hoje.getTime() - d.getTime()) / 86_400_000);
}

/**
 * Alertas internos de cadência. Nunca envia mensagem, e-mail, WhatsApp ou push
 * e nunca é exibido ao cliente.
 */
export function avaliarCadencia(
  entrada: {
    onboardingIniciadoEm?: string | null;
    primeiraMicroentregaPlanejada?: boolean;
    ultimoTouchpointEm?: string | null;
    ultimaAtualizacaoClienteEm?: string | null;
    esperaExternaAtiva?: boolean;
  },
  hoje = new Date(),
): AlertaCadencia[] {
  const alertas: AlertaCadencia[] = [];
  const dOnb = diasEntre(entrada.onboardingIniciadoEm, hoje);
  if (dOnb !== null && dOnb >= CADENCIA.primeiraMicroentregaDias && !entrada.primeiraMicroentregaPlanejada) {
    alertas.push({
      regra: "D7",
      criticidade: "media",
      titulo: "Primeira microentrega não planejada até D7",
      detalhe: `Onboarding iniciado há ${dOnb} dias sem microentrega planejada. Alerta interno: nenhuma mensagem foi enviada.`,
    });
  }
  if (entrada.esperaExternaAtiva) return alertas;

  const dTouch = diasEntre(entrada.ultimoTouchpointEm, hoje);
  if (dTouch !== null && dTouch >= CADENCIA.atencaoDias) {
    alertas.push({
      regra: "D10",
      criticidade: "alta",
      titulo: "10 dias sem touchpoint registrado",
      detalhe: `Último touchpoint há ${dTouch} dias. Alerta interno: nenhuma mensagem foi enviada.`,
    });
  }
  const dAtual = diasEntre(entrada.ultimaAtualizacaoClienteEm ?? entrada.ultimoTouchpointEm, hoje);
  if (dAtual !== null && dAtual >= CADENCIA.criticoDias) {
    alertas.push({
      regra: "D14",
      criticidade: "critica",
      titulo: "14 dias sem atualização contextualizada",
      detalhe: `Última atualização há ${dAtual} dias. Criar rascunho interno de atualização. Nenhuma mensagem foi enviada.`,
    });
  }
  return alertas;
}

export type EsperaExterna = {
  motivo?: string | null;
  responsavel_user_id?: string | null;
  prazo_rechecagem?: string | null;
  ultima_atualizacao_contextualizada_em?: string | null;
  status?: string | null;
  archived_at?: string | null;
};

/** Espera externa só suspende alerta quando completa e vigente. */
export function esperaExternaSuspendeAlerta(e?: EsperaExterna | null, hoje = new Date()): boolean {
  if (!e || e.archived_at) return false;
  if (e.status !== "em_espera") return false;
  if (!e.motivo?.trim() || !e.responsavel_user_id || !e.prazo_rechecagem) return false;
  if (!e.ultima_atualizacao_contextualizada_em) return false;
  return new Date(`${String(e.prazo_rechecagem).slice(0, 10)}T23:59:59`).getTime() >= hoje.getTime();
}

export function saudeDoPlano(diasSemTouchpoint: number): "regular" | "atencao" | "critico" {
  if (diasSemTouchpoint >= CADENCIA.criticoDias) return "critico";
  if (diasSemTouchpoint >= CADENCIA.atencaoDias) return "atencao";
  return "regular";
}

/* ------------------------------------------------ transições controladas */

export function podeIniciarOnboarding(diag: DiagnosticoOnboarding): { ok: boolean; motivo?: string } {
  if (diag.status === "bloqueado") return { ok: false, motivo: diag.bloqueios[0] ?? "Caso bloqueado." };
  if (diag.gates_pendentes.length) {
    return { ok: false, motivo: `Gates pendentes: ${diag.gates_pendentes.map((g) => g.titulo).join(", ")}.` };
  }
  return { ok: true };
}

export function podeAtivarCaso(caso: CasoDiagnostico, diag: DiagnosticoOnboarding): { ok: boolean; motivo?: string } {
  if (!caso.onboarding_iniciado_em || caso.eixo_operacao === "nao_iniciado") {
    return { ok: false, motivo: "Caso ativo exige onboarding iniciado." };
  }
  if (diag.gates_pendentes.length || diag.bloqueios.length) {
    return { ok: false, motivo: "Caso ativo exige todos os gates mínimos atendidos." };
  }
  return { ok: true };
}

/* -------------------------------------------------- sanitização de saída */

const TERMOS_PROIBIDOS = [
  "sku",
  "hipótese",
  "hipotese",
  "evidência",
  "evidencia",
  "fonte",
  "acervo",
  "risco",
  "margem",
  "preço",
  "preco",
  "r$",
  "honorário",
  "honorario",
  "contrato",
  "cobrança",
  "cobranca",
  "condição comercial",
  "condicao comercial",
  "cartório interno",
  "dossiê",
  "dossie",
];

/**
 * Corte 1-quater (03/10/2026) — a parte que o plano pedia e nunca tinha sido
 * executada: nome técnico de fonte, URL, token, endpoint, API, matching,
 * score e RG também não chegam ao cliente. Medido em 03/10: nenhum destes
 * termos estava na lista, então o App publicaria "encontramos no
 * FamilySearch" ou uma URL para a cliente real.
 *
 * Vai em lista SEPARADA, por regex com limite de palavra, porque a lista
 * acima compara por substring: "api" casaria dentro de "capital" e "rg"
 * dentro de "organização", e o texto legítimo passaria a ser descartado —
 * exatamente o defeito que o guard de publicação acabou de fechar.
 *
 * `PARES` (Portal de Arquivos Espanhóis) só conta em caixa alta isolada:
 * "pares" é palavra comum em português e barrá-la custaria mais do que
 * protege.
 */
const PADROES_PROIBIDOS: RegExp[] = [
  // Nomes técnicos de fonte (Adendo Bloco 5A).
  /\b(familysearch|antenati|digitarq|geneanet|myheritage|ancestry|matricula\s*online|szukaj|find\s*a\s*grave|findagrave|genteam|archion|geneteka|cisei|altreitalie|oesta)\b/i,
  // "ÖStA" começa com caractere não-ASCII: `\b` do JS não o reconhece como
  // limite de palavra, então precisa de limite por propriedade Unicode.
  /(^|[^\p{L}])östa([^\p{L}]|$)/iu,
  /\bPARES\b/, // só caixa alta: "pares" comum não é a fonte espanhola
  /\bportal\s+de\s+arquivos\s+espanh/i,
  // Endereço e mecanismo técnico.
  /\bhttps?:\/\//i,
  /\bwww\./i,
  /\b(token|endpoint|api|webhook|oauth|scraping|matching|score)\b/i,
  // Documento de identidade (CPF já é coberto por `contemCpf`).
  /\brg\b/i,
];

/**
 * Só o recorte técnico do guard acima: nome de fonte, URL, token/API/score e RG.
 * É o que a fila de publicação da Biblioteca precisa checar ao aprovar um item
 * para o App, sem a lista ampla de termos (evidência, fonte, contrato...), que
 * descartaria texto legítimo de entrega.
 */
export function contemFonteOuMecanismoTecnico(texto?: string | null): boolean {
  const bruto = String(texto ?? "");
  return PADROES_PROIBIDOS.some((re) => re.test(bruto));
}

/** Verdadeiro quando o texto contém conteúdo que não pode chegar ao cliente. */
export function contemConteudoInterno(texto?: string | null): boolean {
  const bruto = String(texto ?? "");
  const t = bruto.toLowerCase();
  // P5 (26/09/2026) — filtro de CPF reaproveitado (validacao-pessoa.ts):
  // este gate cobre entregas de onboarding cliente-facing (portal-dados-vivos.ts,
  // portal-atendimento.functions.ts) que também não tinham proteção contra CPF.
  if (TERMOS_PROIBIDOS.some((p) => t.includes(p))) return true;
  // Corte 1-quater: os padrões com limite de palavra rodam sobre o texto
  // ORIGINAL, porque `\bPARES\b` distingue a fonte espanhola da palavra
  // comum "pares" justamente pela caixa.
  if (PADROES_PROIBIDOS.some((re) => re.test(bruto))) return true;
  return contemCpf(bruto);
}

export type EntregaBruta = {
  id?: string;
  case_id?: string | null;
  deliverable_type?: string | null;
  journey_phase?: string | null;
  title_client?: string | null;
  summary_approved?: string | null;
  approval_status?: string | null;
  approved_by?: string | null;
  published_at?: string | null;
  available_at?: string | null;
  archived_at?: string | null;
};

export type EntregaCliente = {
  id: string;
  titulo: string;
  resumo: string;
  fase: string;
  tipo: string;
  publicado_em: string | null;
};

/** Projeção para o App Cliente: só entregas publicadas, aprovadas e sanitizadas. */
export function projetarEntregasCliente(entregas: EntregaBruta[], caseId?: string | null): EntregaCliente[] {
  return entregas
    .filter((e) => !e.archived_at)
    .filter((e) => e.approval_status === "publicado")
    .filter((e) => Boolean(e.approved_by))
    .filter((e) => (caseId ? e.case_id === caseId : true))
    .filter((e) => Boolean(e.summary_approved?.trim()))
    .filter((e) => !contemConteudoInterno(e.summary_approved) && !contemConteudoInterno(e.title_client))
    .map((e) => ({
      id: String(e.id),
      titulo: String(e.title_client ?? "Atualização"),
      resumo: String(e.summary_approved),
      fase: rotuloClienteDaFase(e.journey_phase),
      tipo: rotulo(TIPOS_ENTREGA, e.deliverable_type),
      publicado_em: e.published_at ?? e.available_at ?? null,
    }));
}

export function rotuloClienteDaFase(fase?: string | null): string {
  return FASES_JORNADA.find((f) => f.id === fase)?.cliente ?? "Acompanhamento";
}

export const TEXTO_JORNADA_PRE_ONBOARDING =
  "Sua jornada será atualizada após a conclusão das etapas iniciais de formalização.";

export const TEXTO_BLOQUEIO_SEGURO =
  "Esta área ainda não está disponível no seu acompanhamento.";

/* ------------------------------------------------- sugestão de microentrega */

/**
 * 28/08/2026 — "a ana fechou, deu o seu aceite verbal, deu o aceite escrito,
 * qual será a primeira microentrega no app" (Proprietária). A biblioteca de
 * micro-entregas era só formulário em branco: nada dizia qual é a próxima
 * entrega dado o estágio real do caso. Esta função deriva isso do mesmo par
 * de eixos já unificado em `crm-desk.ts` (EIXO_COMERCIAL + EIXO_FORMALIZACAO)
 * — sem catálogo paralelo. Sugere, não decide: quem cria a micro-entrega
 * confirma ou troca. Sem aceite comercial registrado, não sugere nada —
 * nunca inventa estágio.
 */
export type EstadoParaSugestaoMicroentrega = {
  eixoComercial?: string | null;
  eixoFormalizacao?: string | null;
};

export type SugestaoMicroentrega = {
  tipo: TipoEntrega;
  fase: FaseJornada;
  titulo: string;
  motivo: string;
};

const ORDEM_FORMALIZACAO = EIXO_FORMALIZACAO.map((o) => o.valor);
const idxFormalizacao = (v?: string | null) => {
  const i = ORDEM_FORMALIZACAO.indexOf(String(v ?? ""));
  return i === -1 ? 0 : i;
};
const antes = (idx: number, marco: string) => idx < ORDEM_FORMALIZACAO.indexOf(marco);

const EIXO_COMERCIAL_ACEITO = ["aceite_verbal", "confirmacao_formal_recebida"];

export function sugerirProximaMicroentrega(
  estado: EstadoParaSugestaoMicroentrega,
): SugestaoMicroentrega | null {
  if (!estado.eixoComercial || !EIXO_COMERCIAL_ACEITO.includes(estado.eixoComercial)) return null;

  const formalIdx = idxFormalizacao(estado.eixoFormalizacao);

  if (antes(formalIdx, "contrato_assinado")) {
    return {
      tipo: "boas_vindas",
      fase: "aceite_e_formalizacao",
      titulo: "Boas-vindas — contrato em preparação",
      motivo:
        "Aceite verbal e confirmação formal já recebidos; contrato ainda não assinado. Primeira microentrega é boas-vindas, para não deixar o cliente em silêncio enquanto o contrato é formalizado.",
    };
  }
  if (antes(formalIdx, "pagamento_inicial_confirmado")) {
    return {
      tipo: "plano_de_acao",
      fase: "aceite_e_formalizacao",
      titulo: "Plano de ação inicial",
      motivo: "Contrato assinado. Próxima microentrega é o plano de ação, base do onboarding.",
    };
  }
  if (antes(formalIdx, "onboarding_iniciado")) {
    return {
      tipo: "checklist_documental",
      fase: "onboarding",
      titulo: "Checklist documental inicial",
      motivo: "Pagamento inicial confirmado. Próxima microentrega é o checklist documental, preparando o onboarding.",
    };
  }
  if (antes(formalIdx, "caso_ativo")) {
    return {
      tipo: "arvore_inicial",
      fase: "pesquisa_inicial",
      titulo: "Árvore inicial",
      motivo: "Onboarding iniciado. Próxima microentrega é a árvore inicial, abrindo a pesquisa.",
    };
  }
  return null;
}
