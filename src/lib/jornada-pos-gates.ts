/**
 * Jornada após gates — regras de preparação (Corte J).
 *
 * Nada aqui envia, publica ou executa. As regras apenas dizem o que estaria
 * habilitado quando os gates reais forem confirmados; enquanto isso, tudo
 * permanece como preparação interna.
 */

import {
  DIAS_PRIMEIRA_MICROENTREGA,
  DIAS_CADENCIA_ATENCAO,
  DIAS_CADENCIA_CRITICA,
} from "@/lib/cadencia-limiares";

export type EstadoJornada = {
  contrato_assinado?: boolean | null;
  pagamento_confirmado?: boolean | null;
  responsavel_principal?: string | null;
  nucleo_ok?: boolean | null;
  dossie_mae?: string | null;
  plano_acao_ok?: boolean | null;
  autorizacao_pesquisa?: string | null;
  /** Dias desde o início do onboarding, quando já iniciado. */
  dias_desde_inicio?: number | null;
  /** Dias desde a última atualização contextualizada entregue ao cliente. */
  dias_sem_atualizacao?: number | null;
  primeira_microentrega_publicada?: boolean | null;
  /** Estado real da pesquisa (research_cases.status). */
  status_pesquisa?: string | null;
  /** Linhas/evidências validadas na pesquisa. */
  evidencias_validadas?: number | null;
  linhas_validadas?: number | null;
};

export type Regra = {
  chave: string;
  titulo: string;
  descricao: string;
  atendida: boolean;
  pendencias: string[];
  /** Nenhuma regra desta camada executa, envia ou publica. */
  executa: false;
};

/** Alias da régua Ana (cadencia-limiares) — não redeclarar números. */
export const D_PRIMEIRA_ENTREGA = DIAS_PRIMEIRA_MICROENTREGA;
export const D_ALERTA_INTERNO = DIAS_CADENCIA_ATENCAO;
export const D_ALERTA_CRITICO = DIAS_CADENCIA_CRITICA;

/** Onboarding iniciado exige os seis fatos registrados. */
export function onboardingIniciado(e: EstadoJornada): { ok: boolean; pendencias: string[] } {
  const pendencias: string[] = [];
  if (!e.contrato_assinado) pendencias.push("Contrato assinado pendente.");
  if (!e.pagamento_confirmado) pendencias.push("Pagamento inicial confirmado pendente.");
  if (!e.responsavel_principal) pendencias.push("Responsável principal não definido.");
  if (!e.nucleo_ok) pendencias.push("Núcleo familiar não registrado.");
  if (!e.dossie_mae) pendencias.push("Dossiê-mãe não vinculado.");
  if (!e.plano_acao_ok) pendencias.push("Plano de ação não registrado.");
  return { ok: pendencias.length === 0, pendencias };
}

export type Alerta = { nivel: "nenhum" | "interno" | "critico"; motivo: string; rascunhoAtualizacao: boolean };

/** D10 gera alerta interno; D14 gera alerta crítico e rascunho de atualização (sem envio). */
export function alertaDeAcompanhamento(dias: number | null | undefined): Alerta {
  const d = dias ?? null;
  if (d === null) return { nivel: "nenhum", motivo: "Onboarding ainda não iniciado.", rascunhoAtualizacao: false };
  if (d >= D_ALERTA_CRITICO)
    return { nivel: "critico", motivo: `D${d}: limite de ${D_ALERTA_CRITICO} dias sem atualização atingido.`, rascunhoAtualizacao: true };
  if (d >= D_ALERTA_INTERNO)
    return { nivel: "interno", motivo: `D${d}: acompanhamento interno em ${D_ALERTA_INTERNO} dias.`, rascunhoAtualizacao: false };
  return { nivel: "nenhum", motivo: `D${d}: dentro do prazo de acompanhamento.`, rascunhoAtualizacao: false };
}

/** Primeira micro-entrega planejada até D7 após o onboarding iniciado. */
export function primeiraMicroEntrega(e: EstadoJornada): { prazoDias: number; atrasada: boolean; motivo: string } {
  const d = e.dias_desde_inicio ?? null;
  if (d === null) return { prazoDias: D_PRIMEIRA_ENTREGA, atrasada: false, motivo: "Planejada até D7 após o início do onboarding." };
  if (e.primeira_microentrega_publicada) return { prazoDias: D_PRIMEIRA_ENTREGA, atrasada: false, motivo: "Primeira micro-entrega já registrada." };
  return {
    prazoDias: D_PRIMEIRA_ENTREGA,
    atrasada: d > D_PRIMEIRA_ENTREGA,
    motivo: d > D_PRIMEIRA_ENTREGA ? `Atrasada: D${d} sem primeira micro-entrega.` : `D${d} de ${D_PRIMEIRA_ENTREGA}.`,
  };
}

/** Toda entrega cliente-facing exige projeção/entregável aprovado. Sem aprovação, não há publicação. */
export function podePublicarParaCliente(entrega: {
  app_projection_status?: string | null;
  client_deliverable_status?: string | null;
}): { ok: boolean; motivo: string } {
  const projecao = entrega.app_projection_status ?? null;
  const entregavel = entrega.client_deliverable_status ?? null;
  if (projecao !== "aprovada" && entregavel !== "aprovado")
    return { ok: false, motivo: "Exige app_projection ou client_deliverable aprovada." };
  return { ok: true, motivo: "Projeção aprovada: publicação depende de ação humana." };
}

/** Relatórios F1/F2 seguem o estado real da pesquisa, nunca a expectativa comercial. */
export function relatoriosHabilitados(e: EstadoJornada): { f1: boolean; f2: boolean; motivo: string } {
  const status = e.status_pesquisa ?? "not_started";
  const autorizada = e.autorizacao_pesquisa === "registered";
  const f1 = autorizada && ["internal_research", "awaiting_documents", "awaiting_review", "completed"].includes(status);
  const f2 = autorizada && ["awaiting_review", "completed"].includes(status) && (e.evidencias_validadas ?? 0) > 0;
  return {
    f1,
    f2,
    motivo: !autorizada
      ? "Autorização de pesquisa pendente: nenhum relatório inicia."
      : `Estado real da pesquisa: ${status}.`,
  };
}

/** Encontro de Linhagem só nasce com duas linhas/evidências validadas. */
export function encontroDeLinhagemHabilitado(e: EstadoJornada): { ok: boolean; motivo: string } {
  const linhas = e.linhas_validadas ?? 0;
  const evidencias = e.evidencias_validadas ?? 0;
  const validadas = Math.max(linhas, evidencias);
  if (validadas < 2) return { ok: false, motivo: `Exige duas linhas/evidências validadas; há ${validadas}.` };
  return { ok: true, motivo: "Duas linhas validadas: pode ser preparado, com revisão humana antes de publicar." };
}

/** Painel completo de regras de preparação — sempre sem execução. */
export function regrasDaJornada(e: EstadoJornada): Regra[] {
  const inicio = onboardingIniciado(e);
  const micro = primeiraMicroEntrega(e);
  const alerta10 = alertaDeAcompanhamento(e.dias_sem_atualizacao ?? e.dias_desde_inicio ?? null);
  const rel = relatoriosHabilitados(e);
  const enc = encontroDeLinhagemHabilitado(e);

  return [
    {
      chave: "onboarding_iniciado",
      titulo: "Onboarding iniciado",
      descricao: "Contrato assinado + pagamento inicial + responsável + núcleo + dossiê + plano.",
      atendida: inicio.ok,
      pendencias: inicio.pendencias,
      executa: false,
    },
    {
      chave: "primeira_microentrega",
      titulo: "Primeira micro-entrega até D7",
      descricao: micro.motivo,
      atendida: inicio.ok && !micro.atrasada,
      pendencias: inicio.ok ? (micro.atrasada ? [micro.motivo] : []) : ["Depende do onboarding iniciado."],
      executa: false,
    },
    {
      chave: "alerta_d10",
      titulo: "D10 — alerta interno",
      descricao: alerta10.motivo,
      atendida: alerta10.nivel !== "interno",
      pendencias: alerta10.nivel === "interno" ? [alerta10.motivo] : [],
      executa: false,
    },
    {
      chave: "alerta_d14",
      titulo: "D14 — alerta crítico e rascunho de atualização",
      descricao: alerta10.rascunhoAtualizacao
        ? "Rascunho de atualização exigido; envio depende de aprovação humana."
        : alerta10.motivo,
      atendida: alerta10.nivel !== "critico",
      pendencias: alerta10.nivel === "critico" ? [alerta10.motivo] : [],
      executa: false,
    },
    {
      chave: "entrega_cliente",
      titulo: "Entrega cliente-facing",
      descricao: "Só existe com app_projection/client_deliverable aprovada.",
      atendida: false,
      pendencias: ["Nenhuma projeção aprovada nesta etapa."],
      executa: false,
    },
    {
      chave: "relatorios_f1_f2",
      titulo: "Relatórios F1 e F2",
      descricao: rel.motivo,
      atendida: rel.f1 || rel.f2,
      pendencias: rel.f1 || rel.f2 ? [] : [rel.motivo],
      executa: false,
    },
    {
      chave: "encontro_linhagem",
      titulo: "Encontro de Linhagem",
      descricao: enc.motivo,
      atendida: enc.ok,
      pendencias: enc.ok ? [] : [enc.motivo],
      executa: false,
    },
  ];
}
