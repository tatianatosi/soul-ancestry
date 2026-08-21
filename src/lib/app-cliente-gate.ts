/**
 * GATE DE VISIBILIDADE DO APP CLIENTE (CA-LOVABLE-ONBOARDING-JORNADA-v1.1)
 *
 * As telas do App aprovado nunca são removidas do menu. O que muda é o ESTADO
 * exibido. Acesso direto por URL a uma área não liberada devolve o mesmo estado
 * seguro, sem qualquer conteúdo interno.
 */

import type { TelaApp } from "@/lib/app-visibilidade";
import { TEXTO_BLOQUEIO_SEGURO, TEXTO_JORNADA_PRE_ONBOARDING } from "@/lib/onboarding-jornada";

export type EstadoTelaCliente =
  | "disponivel"
  | "sem_itens"
  | "em_preparacao"
  | "aguardando_formalizacao"
  | "sem_acesso";

export const ESTADO_TELA_TEXTO: Record<EstadoTelaCliente, string> = {
  disponivel: "Conteúdo disponível para consulta.",
  sem_itens: "Ainda não há itens publicados nesta área.",
  em_preparacao: "Este conteúdo está em preparação pela equipe.",
  aguardando_formalizacao: TEXTO_JORNADA_PRE_ONBOARDING,
  sem_acesso: TEXTO_BLOQUEIO_SEGURO,
};

export type ContextoCliente = {
  /** Eixo operacional do caso vindo do Desk. */
  eixoOperacao?: string | null;
  /** Quantidade de entregas publicadas e sanitizadas. */
  entregasPublicadas?: number;
  /** Documentos liberados ao cliente. */
  documentosLiberados?: number;
  /** Itens de legado autorizados e publicados. */
  legadoPublicado?: number;
};

const TELAS_SEMPRE_VISIVEIS: TelaApp[] = [
  "home",
  "jornada",
  "radar",
  "arvore",
  "docs",
  "entrega",
  "relatorio",
  "fase02",
  "biblio",
  "conta",
];

export function telasVisiveis(): TelaApp[] {
  return [...TELAS_SEMPRE_VISIVEIS];
}

function onboardingIniciado(ctx: ContextoCliente): boolean {
  return ctx.eixoOperacao === "onboarding_iniciado" || ctx.eixoOperacao === "caso_ativo";
}

/** Estado seguro por tela. Nunca revela por que algo está indisponível. */
export function estadoDaTela(tela: TelaApp, ctx: ContextoCliente): EstadoTelaCliente {
  if (tela === "home" || tela === "conta") return "disponivel";

  if (!onboardingIniciado(ctx)) {
    return tela === "jornada" ? "aguardando_formalizacao" : "em_preparacao";
  }

  switch (tela) {
    case "jornada":
      return "disponivel";
    case "docs":
      return (ctx.documentosLiberados ?? 0) > 0 ? "disponivel" : "sem_itens";
    case "biblio":
      return (ctx.legadoPublicado ?? 0) > 0 ? "disponivel" : "sem_itens";
    case "entrega":
    case "relatorio":
    case "radar":
    case "arvore":
    case "fase02":
      return (ctx.entregasPublicadas ?? 0) > 0 ? "disponivel" : "em_preparacao";
    default:
      return "sem_itens";
  }
}

/** Acesso direto por URL: bloqueia leitura de conteúdo sem estado liberado. */
export function podeLerConteudo(tela: TelaApp, ctx: ContextoCliente): boolean {
  return estadoDaTela(tela, ctx) === "disponivel";
}

export function textoEstado(tela: TelaApp, ctx: ContextoCliente): string {
  return ESTADO_TELA_TEXTO[estadoDaTela(tela, ctx)];
}
