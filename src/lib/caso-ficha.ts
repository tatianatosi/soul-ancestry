/**
 * Ficha operacional canônica do caso (Desk Intelligence).
 *
 * Catálogos controlados e derivações. Nada aqui infere dado ausente:
 * quando falta informação, o estado é explicitamente "pendente".
 */

import { DIAS_CADENCIA_ATENCAO, DIAS_CADENCIA_CRITICA } from "@/lib/cadencia-limiares";
import { ehRegistroDeTeste } from "@/lib/registros-teste";


export type Opcao = { valor: string; rotulo: string };

/**
 * 27/08/2026 — unificação pedida pela Proprietária: lead e caso são a mesma
 * pessoa, então os dois eixos não podem ter definições próprias que
 * divergem. `crm-desk.ts` (o que roda em `/leads`) passa a ser a fonte
 * única; este módulo reexporta em vez de duplicar.
 */
export { EIXO_COMERCIAL, EIXO_FORMALIZACAO } from "@/lib/crm-desk";

/** Papel do registro: separa caso operacional, piloto real e dado de demonstração. */
export const PAPEL_REGISTRO: Opcao[] = [
  { valor: "operacional", rotulo: "Caso operacional" },
  { valor: "piloto_real", rotulo: "Primeira cliente — caso operacional de referência" },
  { valor: "demonstracao", rotulo: "Demonstração — não operacional" },
];

export const STATUS_DERIVADO: Opcao[] = [
  { valor: "pre_onboarding_bloqueado", rotulo: "Pendências de pré-onboarding" },
  { valor: "formalizacao_pendente", rotulo: "Formalização pendente" },
  { valor: "onboarding_pendente", rotulo: "Onboarding pendente" },
  { valor: "em_execucao", rotulo: "Em execução" },
  { valor: "aguardando_cliente", rotulo: "Aguardando cliente" },
  { valor: "aguardando_terceiro", rotulo: "Aguardando terceiro" },
  { valor: "concluido", rotulo: "Concluído" },
  { valor: "arquivado", rotulo: "Arquivado" },
];

export const PAISES_LINHA: Opcao[] = [
  { valor: "austria", rotulo: "Áustria" },
  { valor: "italia", rotulo: "Itália" },
  { valor: "portugal", rotulo: "Portugal" },
  { valor: "espanha", rotulo: "Espanha" },
  { valor: "alemanha", rotulo: "Alemanha" },
  { valor: "polonia", rotulo: "Polônia" },
  { valor: "brasil", rotulo: "Brasil" },
  { valor: "a_definir", rotulo: "A definir" },
];

export const VIAS_JURIDICAS: Opcao[] = [
  { valor: "administrativa", rotulo: "Administrativa" },
  { valor: "judicial_em_confirmacao", rotulo: "Judicial — em confirmação" },
  { valor: "naturalizacao_residencia_em_confirmacao", rotulo: "Naturalização/residência — em confirmação" },
  { valor: "reparacao_historica_em_confirmacao", rotulo: "Reparação histórica — em confirmação" },
  { valor: "a_definir", rotulo: "A definir" },
];

export const STATUS_VIA: Opcao[] = [
  { valor: "sugerida", rotulo: "Sugerida pelo sistema" },
  { valor: "em_confirmacao", rotulo: "Em confirmação" },
  { valor: "confirmada_internamente", rotulo: "Confirmada internamente" },
  { valor: "a_definir", rotulo: "A definir" },
];

export const STATUS_RADAR: Opcao[] = [
  { valor: "nao_calculado", rotulo: "Não calculado" },
  { valor: "em_revisao", rotulo: "Em revisão" },
  { valor: "validado_internamente", rotulo: "Validado internamente" },
];

export const REVISAO_JURIDICA: Opcao[] = [
  { valor: "obrigatoria", rotulo: "Obrigatória" },
  { valor: "dispensa_homologada", rotulo: "Dispensa homologada" },
  { valor: "a_definir", rotulo: "A definir" },
];

export const ORIGEM_BRIEF: Opcao[] = [
  { valor: "proposta", rotulo: "Proposta" },
  { valor: "transcricao", rotulo: "Transcrição" },
  { valor: "whatsapp", rotulo: "WhatsApp" },
  { valor: "reuniao", rotulo: "Reunião" },
  { valor: "documento", rotulo: "Documento" },
  { valor: "outro", rotulo: "Outro" },
];

export const RISCOS: Opcao[] = [
  { valor: "nenhum_identificado", rotulo: "Nenhum identificado" },
  { valor: "naturalizacao_estrangeira", rotulo: "Naturalização estrangeira" },
  { valor: "divergencia_nomes_datas", rotulo: "Divergência de nomes/datas" },
  { valor: "casamento_estado_civil", rotulo: "Casamento/estado civil" },
  { valor: "linha_materna_pre_1948", rotulo: "Linha materna pré-1948" },
  { valor: "adocao_reconhecimento", rotulo: "Adoção/reconhecimento" },
  { valor: "falta_certidao", rotulo: "Falta de certidão" },
  { valor: "perseguicao_prova_historica", rotulo: "Perseguição/prova histórica" },
  { valor: "documento_estrangeiro_idioma", rotulo: "Documento estrangeiro/idioma" },
  { valor: "representacao_de_menor", rotulo: "Representação de menor" },
  { valor: "prazo_legal_administrativo", rotulo: "Prazo legal ou administrativo" },
  { valor: "escopo_contrato_pendente", rotulo: "Escopo/contrato pendente" },
  { valor: "pagamento_formalizacao_pendente", rotulo: "Pagamento/formalização pendente" },
  { valor: "revisao_juridica_pendente", rotulo: "Revisão jurídica pendente" },
  { valor: "dados_cadastrais_pendentes", rotulo: "Dados cadastrais pendentes" },
  { valor: "em_investigacao", rotulo: "Em investigação" },
  { valor: "outro_justificar", rotulo: "Outro — justificar" },
];

export const PROXIMAS_ACOES: Opcao[] = [
  { valor: "solicitar_confirmacao_formal", rotulo: "Solicitar confirmação formal" },
  { valor: "solicitar_dados_cadastrais", rotulo: "Solicitar dados cadastrais" },
  { valor: "validar_nucleo_familiar", rotulo: "Validar núcleo familiar" },
  { valor: "validar_representacao_menor", rotulo: "Validar representação de menor" },
  { valor: "revisar_proposta_escopo", rotulo: "Revisar proposta e escopo" },
  { valor: "definir_produto_trilha", rotulo: "Definir produto-pai/trilha/case service" },
  { valor: "preparar_contrato", rotulo: "Preparar contrato" },
  { valor: "preparar_ordem_servico", rotulo: "Preparar Ordem de Serviço" },
  { valor: "solicitar_revisao_juridica", rotulo: "Solicitar revisão jurídica" },
  { valor: "definir_assinatura", rotulo: "Definir assinatura" },
  { valor: "enviar_contrato", rotulo: "Enviar contrato" },
  { valor: "confirmar_assinatura", rotulo: "Confirmar assinatura" },
  { valor: "preparar_cobranca", rotulo: "Preparar cobrança" },
  { valor: "confirmar_pagamento", rotulo: "Confirmar pagamento" },
  { valor: "iniciar_onboarding", rotulo: "Iniciar onboarding" },
  { valor: "criar_validar_dossie_mae", rotulo: "Criar/validar dossiê-mãe" },
  { valor: "criar_grupo_familiar", rotulo: "Criar grupo familiar" },
  { valor: "enviar_checklist_inicial", rotulo: "Enviar checklist inicial" },
  { valor: "solicitar_documentos", rotulo: "Solicitar documentos" },
  { valor: "revisar_documentos", rotulo: "Revisar documentos" },
  { valor: "preparar_diagnostico", rotulo: "Preparar diagnóstico" },
  { valor: "preparar_plano_acao", rotulo: "Preparar plano de ação" },
  { valor: "publicar_primeira_micro_entrega", rotulo: "Publicar primeira micro-entrega" },
  { valor: "atualizar_cliente", rotulo: "Atualizar cliente" },
  { valor: "encerrar", rotulo: "Encerrar" },
  { valor: "sem_nova_acao_necessaria", rotulo: "Sem nova ação necessária" },
  { valor: "outro_justificar", rotulo: "Outro — justificar" },
];

export const PAPEIS_PESSOA: Opcao[] = [
  { valor: "contratante", rotulo: "Contratante" },
  { valor: "titular", rotulo: "Titular" },
  { valor: "dependente", rotulo: "Dependente" },
  { valor: "interlocutor", rotulo: "Interlocutor (fora do núcleo contratual)" },
];

export const STATUS_CADASTRAL: Opcao[] = [
  { valor: "pendente", rotulo: "Pendente" },
  { valor: "parcial", rotulo: "Parcial" },
  { valor: "completo", rotulo: "Completo" },
];

// De-para Pessoa Unificada (docs/design-system/de-para-pessoa-unificada.md,
// item 4 "case_members"): "estado civil cru" na ficha do caso, mesmo
// conceito já é lista fechada em `clientes` (check `clientes_estado_civil`,
// migration 20260902144855). `case_members.estado_civil` não tem check no
// banco — continua texto livre na coluna — mas a UI passa a oferecer só os
// mesmos 5 valores já usados em `pessoas.$clienteId.tsx`, sem inventar
// vocabulário novo nem adicionar constraint.
export const ESTADO_CIVIL: Opcao[] = [
  { valor: "solteiro", rotulo: "Solteiro(a)" },
  { valor: "casado", rotulo: "Casado(a)" },
  { valor: "divorciado", rotulo: "Divorciado(a)" },
  { valor: "viuvo", rotulo: "Viúvo(a)" },
  { valor: "uniao_estavel", rotulo: "União estável" },
];

export function rotulo(lista: Opcao[], valor: unknown): string {
  const v = typeof valor === "string" ? valor : "";
  return lista.find((o) => o.valor === v)?.rotulo ?? (v || "—");
}

/* ---------------- Derivação de status ---------------- */

export type CasoDerivacao = {
  eixo_comercial?: string | null;
  eixo_formalizacao?: string | null;
  contrato_assinado?: boolean | null;
  pagamento_confirmado?: boolean | null;
  responsavel_principal?: string | null;
  nucleo_ok?: boolean;
  plano_inicial_ok?: boolean;
  archived_at?: string | null;
};

/**
 * "Cliente ativo" nunca é etapa isolada: só é derivado com contrato assinado,
 * pagamento inicial confirmado, responsável, núcleo/dossiê e plano inicial.
 */
export function derivarStatusCaso(c: CasoDerivacao): { valor: string; motivo: string } {
  if (c.archived_at || c.eixo_formalizacao === "arquivado") {
    return { valor: "arquivado", motivo: "Caso arquivado." };
  }
  const assinado = Boolean(c.contrato_assinado) || ["contrato_assinado", "pagamento_inicial_confirmado", "onboarding_iniciado", "caso_ativo"].includes(String(c.eixo_formalizacao));
  const pago = Boolean(c.pagamento_confirmado) || ["pagamento_inicial_confirmado", "onboarding_iniciado", "caso_ativo"].includes(String(c.eixo_formalizacao));

  if (!assinado) {
    if (c.eixo_comercial === "confirmacao_formal_recebida" || c.eixo_formalizacao === "formalizacao_em_preparacao") {
      return { valor: "pre_onboarding_bloqueado", motivo: "Confirmação formal recebida, mas contrato ainda não assinado." };
    }
    return { valor: "formalizacao_pendente", motivo: "Sem contrato assinado registrado." };
  }
  if (!pago) return { valor: "formalizacao_pendente", motivo: "Contrato assinado, pagamento inicial não confirmado." };
  if (!c.responsavel_principal) return { valor: "onboarding_pendente", motivo: "Responsável principal não definido." };
  if (!c.nucleo_ok) return { valor: "onboarding_pendente", motivo: "Núcleo familiar/dossiê-mãe não validado." };
  if (!c.plano_inicial_ok) return { valor: "onboarding_pendente", motivo: "Plano inicial não registrado." };
  return { valor: "em_execucao", motivo: "Contrato, pagamento, responsável, núcleo e plano inicial registrados." };
}

/* ---------------- Sugestões de jornada (sem automação externa) ---------------- */

export type Sugestao = { titulo: string; detalhe: string; nivel: "informativo" | "atencao" | "critico" };

export function sugestoesJornada(input: {
  eixo_comercial?: string | null;
  eixo_formalizacao?: string | null;
  contrato_assinado?: boolean | null;
  pagamento_confirmado?: boolean | null;
  updated_at?: string | null;
  agora?: Date;
}): Sugestao[] {
  const out: Sugestao[] = [];
  const agora = input.agora ?? new Date();

  if (input.eixo_comercial === "aceite_verbal") {
    out.push({ titulo: "Solicitar confirmação formal em até D+2", detalhe: "Aceite verbal registrado.", nivel: "atencao" });
  }
  if (input.eixo_comercial === "confirmacao_formal_recebida") {
    out.push({
      titulo: "Solicitar em D+1 apenas os dados necessários à formalização",
      detalhe:
        "Confirmação formal recebida. Limitar à qualificação de signatários, representação do menor e confirmação de escopo/condição. Coleta documental ampla, ambiente do cliente, checklist de operação e boas-vindas seguem bloqueados até a ativação.",
      nivel: "atencao",
    });
  }
  if (input.contrato_assinado && input.pagamento_confirmado && input.eixo_formalizacao !== "onboarding_iniciado" && input.eixo_formalizacao !== "caso_ativo") {
    out.push({ titulo: "Iniciar onboarding", detalhe: "Contrato assinado e pagamento confirmado.", nivel: "atencao" });
  }
  if (input.eixo_formalizacao === "onboarding_iniciado") {
    out.push({
      titulo: "Plano, checklist, grupo familiar e primeira entrega até D7",
      detalhe: "Onboarding iniciado.",
      nivel: "informativo",
    });
  }
  if (input.updated_at) {
    const dias = Math.floor((agora.getTime() - new Date(input.updated_at).getTime()) / 86_400_000);
    if (dias >= DIAS_CADENCIA_CRITICA) {
      out.push({ titulo: "Alerta crítico: 14 dias sem atualização", detalhe: `Última atualização há ${dias} dias.`, nivel: "critico" });
    } else if (dias >= DIAS_CADENCIA_ATENCAO) {
      out.push({ titulo: "Alerta interno: 10 dias sem atualização", detalhe: `Última atualização há ${dias} dias.`, nivel: "atencao" });
    }
  }
  return out;
}

/** Sugestão de via preliminar — sempre editável, nunca conclusão jurídica. */
export function sugerirVia(input: { pais?: string | null; processoConsular?: boolean; hipoteseJudicial?: boolean; naturalizacaoBrasileira?: boolean; austria58c?: boolean }): string | null {
  if (input.austria58c || input.pais === "austria") return "reparacao_historica_em_confirmacao";
  if (input.pais === "italia" && input.hipoteseJudicial) return "judicial_em_confirmacao";
  if (input.naturalizacaoBrasileira) return "naturalizacao_residencia_em_confirmacao";
  if (input.processoConsular) return "administrativa";
  return null;
}

/* ---------------- Próxima ação: público, visibilidade e canal ---------------- */

export const TARGET_AUDIENCE: Opcao[] = [
  { valor: "interno_tatiana", rotulo: "Interno — Tatiana" },
  { valor: "cliente_contratante", rotulo: "Cliente contratante" },
  { valor: "participante_nucleo", rotulo: "Participante do núcleo" },
  { valor: "responsavel_legal", rotulo: "Responsável legal" },
  { valor: "colaborador_autorizado", rotulo: "Colaborador autorizado" },
];

export const VISIBILITY: Opcao[] = [
  { valor: "internal_only", rotulo: "Somente interno" },
  { valor: "client_sanitized", rotulo: "Cliente — conteúdo sanitizado" },
  { valor: "restricted", rotulo: "Restrito" },
];

export const SUGGESTED_CHANNEL: Opcao[] = [
  { valor: "desk_only", rotulo: "Somente Desk" },
  { valor: "app", rotulo: "App Cliente" },
  { valor: "whatsapp", rotulo: "WhatsApp" },
  { valor: "app_and_whatsapp", rotulo: "App + WhatsApp" },
  { valor: "email", rotulo: "E-mail" },
  { valor: "decide_later", rotulo: "Decidir depois" },
];

export const COMMUNICATION_STATUS: Opcao[] = [
  { valor: "not_applicable", rotulo: "Não se aplica" },
  { valor: "draft_created", rotulo: "Rascunho criado" },
  { valor: "awaiting_approval", rotulo: "Aguardando aprovação" },
  { valor: "approved", rotulo: "Aprovado (sem envio)" },
  { valor: "sent", rotulo: "Enviado" },
  { valor: "cancelled", rotulo: "Cancelado" },
  { valor: "failed", rotulo: "Falhou" },
];

export const ALERT_STATUS: Opcao[] = [
  { valor: "pending", rotulo: "Pendente" },
  { valor: "alerted", rotulo: "Alertado" },
  { valor: "acknowledged", rotulo: "Ciente" },
  { valor: "completed", rotulo: "Concluído" },
  { valor: "overdue", rotulo: "Vencido" },
];

export const SINAL_ADERENCIA: Opcao[] = [
  { valor: "forte", rotulo: "Forte" },
  { valor: "provavel", rotulo: "Provável" },
  { valor: "possivel_com_pesquisa", rotulo: "Possível com pesquisa" },
  { valor: "inconclusivo", rotulo: "Inconclusivo" },
  { valor: "sem_aderencia", rotulo: "Sem aderência" },
  { valor: "em_investigacao", rotulo: "Em investigação" },
];

// 27/08/2026 — reexporta de crm-desk.ts em vez de duplicar (mesmos códigos,
// "a_definir" já incorporado lá).
export { CONFIANCA_TRIAGEM } from "@/lib/crm-desk";

export const STATUS_CASE_SERVICE: Opcao[] = [
  { valor: "draft", rotulo: "Rascunho" },
  { valor: "approved", rotulo: "Aprovado" },
  { valor: "contracted", rotulo: "Contratado" },
  { valor: "active", rotulo: "Ativo" },
  { valor: "completed", rotulo: "Concluído" },
  { valor: "cancelled", rotulo: "Cancelado" },
];

export const STATUS_ONBOARDING_ITEM: Opcao[] = [
  { valor: "pendente", rotulo: "Pendente" },
  { valor: "em_andamento", rotulo: "Em andamento" },
  { valor: "concluido", rotulo: "Concluído" },
  { valor: "nao_aplicavel", rotulo: "Não aplicável" },
];

/** Mapeamento normativo de destino por próxima ação. Nada é enviado automaticamente. */
export type MapaAcao = {
  desk: boolean;
  app: "bloqueado" | "sanitizado_com_onboarding" | "publicado";
  rascunhoWhatsapp: boolean;
  audience: string;
  visibility: string;
  channel: string;
};

export const MAPA_ACOES: Record<string, MapaAcao> = {
  solicitar_confirmacao_formal: { desk: true, app: "bloqueado", rascunhoWhatsapp: true, audience: "cliente_contratante", visibility: "client_sanitized", channel: "whatsapp" },
  solicitar_dados_cadastrais: { desk: true, app: "bloqueado", rascunhoWhatsapp: true, audience: "cliente_contratante", visibility: "client_sanitized", channel: "whatsapp" },
  preparar_contrato: { desk: true, app: "bloqueado", rascunhoWhatsapp: false, audience: "interno_tatiana", visibility: "internal_only", channel: "desk_only" },
  confirmar_assinatura: { desk: true, app: "bloqueado", rascunhoWhatsapp: true, audience: "cliente_contratante", visibility: "client_sanitized", channel: "whatsapp" },
  confirmar_pagamento: { desk: true, app: "bloqueado", rascunhoWhatsapp: true, audience: "cliente_contratante", visibility: "client_sanitized", channel: "whatsapp" },
  iniciar_onboarding: { desk: true, app: "sanitizado_com_onboarding", rascunhoWhatsapp: false, audience: "interno_tatiana", visibility: "internal_only", channel: "desk_only" },
  enviar_checklist_inicial: { desk: true, app: "sanitizado_com_onboarding", rascunhoWhatsapp: true, audience: "cliente_contratante", visibility: "client_sanitized", channel: "app_and_whatsapp" },
  solicitar_documentos: { desk: true, app: "sanitizado_com_onboarding", rascunhoWhatsapp: true, audience: "cliente_contratante", visibility: "client_sanitized", channel: "app_and_whatsapp" },
  revisar_documentos: { desk: true, app: "bloqueado", rascunhoWhatsapp: false, audience: "interno_tatiana", visibility: "internal_only", channel: "desk_only" },
  publicar_primeira_micro_entrega: { desk: true, app: "publicado", rascunhoWhatsapp: true, audience: "cliente_contratante", visibility: "client_sanitized", channel: "app_and_whatsapp" },
  atualizar_cliente: { desk: true, app: "sanitizado_com_onboarding", rascunhoWhatsapp: true, audience: "cliente_contratante", visibility: "client_sanitized", channel: "whatsapp" },
};

export function mapaDaAcao(codigo: string | null | undefined): MapaAcao {
  return (
    MAPA_ACOES[String(codigo ?? "")] ?? {
      desk: true,
      app: "bloqueado",
      rascunhoWhatsapp: false,
      audience: "interno_tatiana",
      visibility: "internal_only",
      channel: "desk_only",
    }
  );
}

/** Gates mínimos exigidos antes de considerar "cliente/caso ativo". */
export function gatesClienteAtivo(input: {
  contrato_assinado?: boolean | null;
  pagamento_confirmado?: boolean | null;
  responsavel_principal?: string | null;
  nucleo_ok?: boolean;
  dossie_mae?: string | null;
  plano_inicial_ok?: boolean;
}): { chave: string; rotulo: string; ok: boolean }[] {
  return [
    { chave: "contrato", rotulo: "Contrato assinado", ok: Boolean(input.contrato_assinado) },
    { chave: "pagamento", rotulo: "Pagamento inicial confirmado", ok: Boolean(input.pagamento_confirmado) },
    { chave: "responsavel", rotulo: "Responsável principal definido", ok: Boolean(input.responsavel_principal) },
    { chave: "nucleo", rotulo: "Núcleo familiar definido", ok: Boolean(input.nucleo_ok) },
    { chave: "dossie", rotulo: "Dossiê-mãe vinculado", ok: Boolean(input.dossie_mae) },
    { chave: "plano", rotulo: "Plano inicial/checklist criados", ok: Boolean(input.plano_inicial_ok) },
  ];
}

/* ---------------- Prompt 05: eixos independentes da lista de Casos ---------------- */

/** Hipótese é sempre provisória: nunca equivale a elegibilidade definitiva. */
export const HIPOTESE_ELEGIBILIDADE: Opcao[] = [
  { valor: "nao_avaliada", rotulo: "Não avaliada" },
  { valor: "possivel", rotulo: "Possível (hipótese)" },
  { valor: "em_validacao_documental", rotulo: "Em validação documental" },
  { valor: "documentalmente_confirmada", rotulo: "Documentalmente confirmada" },
  { valor: "inconclusiva", rotulo: "Inconclusiva" },
];

export const SITUACAO_FINANCEIRA: Opcao[] = [
  { valor: "sem_cobranca", rotulo: "Sem cobrança" },
  { valor: "cobranca_prevista", rotulo: "Cobrança prevista" },
  { valor: "cobranca_emitida", rotulo: "Cobrança emitida" },
  { valor: "pagamento_inicial_confirmado", rotulo: "Pagamento inicial confirmado" },
  { valor: "pagamento_parcial", rotulo: "Pagamento parcial" },
  { valor: "inadimplente", rotulo: "Inadimplente" },
  { valor: "quitado", rotulo: "Quitado" },
  { valor: "isencao_autorizada", rotulo: "Isenção autorizada" },
];

export const SITUACAO_OPERACIONAL: Opcao[] = [
  { valor: "nao_iniciada", rotulo: "Não iniciada" },
  { valor: "preparacao_interna", rotulo: "Preparação interna" },
  { valor: "aguardando_documentos_cliente", rotulo: "Aguardando documentos do cliente" },
  { valor: "pesquisa_em_andamento", rotulo: "Pesquisa em andamento" },
  { valor: "aguardando_instituicao_externa", rotulo: "Aguardando instituição externa" },
  { valor: "entrega_em_preparacao", rotulo: "Entrega em preparação" },
  { valor: "em_execucao", rotulo: "Em execução" },
  { valor: "suspensa", rotulo: "Suspensa" },
  { valor: "concluida", rotulo: "Concluída" },
  { valor: "arquivada", rotulo: "Arquivada" },
];

/** Datas futuras de contrato/pagamento/onboarding são previsão condicional, nunca fato. */
export function qualificarData(valor: unknown, agora: Date = new Date()): { texto: string; condicional: boolean } {
  const bruto = typeof valor === "string" ? valor.trim() : "";
  if (!bruto) return { texto: "—", condicional: false };
  const data = new Date(bruto.length <= 10 ? `${bruto}T12:00:00` : bruto);
  if (Number.isNaN(data.getTime())) return { texto: "—", condicional: false };
  const texto = data.toLocaleDateString("pt-BR");
  return { texto, condicional: data.getTime() > agora.getTime() };
}

/** Próxima ação só é acionável com título, responsável, prazo, dependência e critério. */
export type ProximaAcaoCampos = {
  proxima_acao?: unknown;
  proxima_acao_responsavel?: unknown;
  prazo_proxima_acao?: unknown;
  proxima_acao_dependencia?: unknown;
  proxima_acao_criterio_conclusao?: unknown;
};

export function lacunasProximaAcao(c: ProximaAcaoCampos): string[] {
  const falta: string[] = [];
  const preenchido = (v: unknown) => typeof v === "string" && v.trim().length > 0;
  if (!preenchido(c.proxima_acao)) falta.push("título");
  if (!preenchido(c.proxima_acao_responsavel)) falta.push("responsável");
  if (!preenchido(c.prazo_proxima_acao)) falta.push("prazo");
  if (!preenchido(c.proxima_acao_dependencia)) falta.push("dependência");
  if (!preenchido(c.proxima_acao_criterio_conclusao)) falta.push("critério de conclusão");
  return falta;
}

/**
 * Corte A (09/09/2026) — próxima ação canônica única.
 * docs/relatorios/2026-09-09_consolidacao_3_redundancias_criticas_execucao.md
 *
 * Achado real: a RPC `proxima_acao_prioritaria` (SQL) já é o motor canônico —
 * ela verifica bloqueio de ativação, tarefa vencida, tarefa do dia, documento
 * pendente, proposta/contrato aguardando resposta e pagamento pendente
 * (níveis 1–6, sempre em primeiro lugar) antes de olhar para o override
 * manual (`crm_casos.proxima_acao`, nível 8) e só then cai no fallback fixo
 * (nível 9). Ou seja, a garantia "P0 real nunca fica escondido atrás de ação
 * manual" já existe na função SQL, por construção — não precisava de motor
 * novo em TypeScript.
 *
 * O que faltava era só a leitura consistente do resultado: as telas liam a
 * RPC e o campo manual como duas coisas separadas. Esta função só empacota o
 * retorno da RPC no formato único pedido, com o selo de origem.
 */
export type ProximaAcaoCanonica = {
  caseId: string;
  acao: string;
  origem: "automatica" | "manual";
  prioridade: number | null;
  motivo: string;
  responsavel: string | null;
  prazo: string | null;
  referenciaEntidade: string | null;
  podeVoltarAoAutomatico: boolean;
  /**
   * Decisão 2 (CA-DECISÕES-DA-PROPRIETÁRIA, 09/09/2026) — dependência e
   * critério de conclusão (`crm_casos.proxima_acao_dependencia`/
   * `proxima_acao_criterio_conclusao`) são metadados da mesma ação, não uma
   * terceira fonte. Antes só apareciam como bloco exclusivo da Lista de
   * Casos; agora fazem parte da leitura canônica, disponíveis em qualquer
   * tela que mostre a próxima ação.
   */
  dependencia: string | null;
  criterioConclusao: string | null;
};

export function obterProximaAcaoCanonica(input: {
  caseId: string;
  rpc: { nivel: number; motivo: string; origem_tabela: string | null; origem_id: string | null; prazo: string | null } | null;
  /**
   * Responsável pela ação. Cada tela tem historicamente um campo diferente
   * para isto (`responsavel_principal` na Ficha 360,
   * `proxima_acao_responsavel` na Lista de Casos) — passe o que a tela tiver;
   * o registro do override manual (registrarProximaAcao) sincroniza os dois.
   */
  responsavelPrincipal?: string | null;
  dependencia?: string | null;
  criterioConclusao?: string | null;
}): ProximaAcaoCanonica {
  const rpc = input.rpc;
  const dependencia = input.dependencia ?? null;
  const criterioConclusao = input.criterioConclusao ?? null;
  if (!rpc) {
    return {
      caseId: input.caseId,
      acao: "Definir próximo passo",
      origem: "automatica",
      prioridade: null,
      motivo: "Definir próximo passo",
      responsavel: input.responsavelPrincipal ?? null,
      prazo: null,
      referenciaEntidade: null,
      podeVoltarAoAutomatico: false,
      dependencia,
      criterioConclusao,
    };
  }
  // Nível 8 é a própria definição da RPC para "override manual sem sinal
  // automático mais urgente pendente" — não é uma segunda fonte, é o mesmo
  // resultado que a RPC já decidiu mostrar.
  const manual = rpc.nivel === 8;
  return {
    caseId: input.caseId,
    acao: rpc.motivo,
    origem: manual ? "manual" : "automatica",
    prioridade: rpc.nivel,
    motivo: rpc.motivo,
    responsavel: input.responsavelPrincipal ?? null,
    prazo: rpc.prazo,
    referenciaEntidade: rpc.origem_tabela,
    podeVoltarAoAutomatico: manual,
    dependencia,
    criterioConclusao,
  };
}

export const SELO_PROXIMA_ACAO: Record<ProximaAcaoCanonica["origem"], string> = {
  automatica: "Sugerida pela operação",
  manual: "Definida manualmente",
};

/** Papel do registro na lista: operacional, referência (piloto) ou demonstração/teste. */
export function papelDoRegistro(linha: {
  papel_registro?: unknown;
  demo?: unknown;
  piloto?: unknown;
  codigo?: unknown;
  titulo?: unknown;
}): {
  valor: "operacional" | "referencia" | "demo";
  rotulo: string;
} {
  if (linha.demo === true || linha.papel_registro === "demonstracao") {
    return { valor: "demo", rotulo: "Demonstração" };
  }
  if (linha.piloto === true || linha.papel_registro === "piloto_real") {
    return { valor: "referencia", rotulo: "Primeira cliente" };
  }
  // 14/09/2026 — registros criados para teste/homologação saem das listas reais
  // por padrão; continuam no banco e reaparecem com "mostrar registros de teste".
  if (ehRegistroDeTeste({ codigo: linha.codigo, titulo: linha.titulo })) {
    return { valor: "demo", rotulo: "Teste / homologação" };
  }
  return { valor: "operacional", rotulo: "Operacional" };
}

