/**
 * Cano operacional mínimo (sem tabela nova):
 * Legado → lista-alimento → produtos-pai → Caso (serviço + plano) → Desk libera → App → WhatsApp (cópia).
 *
 * Funções puras + sincronização leve após salvar case_service.
 */

import { traduzirFase } from "@/lib/jornada-de-para";

export const ELOS_CANO = [
  "legado",
  "lista_alimento",
  "catalogo_planejador",
  "caso_360",
  "desk_libera",
  "app_autorizado",
  "whatsapp_manual",
] as const;

export type EloCano = (typeof ELOS_CANO)[number];

export type EstadoElo = "ok" | "parcial" | "ausente" | "bloqueado";

export type ResumoCano = {
  elos: Record<EloCano, { estado: EstadoElo; detalhe: string }>;
  proximoPassoDesk: string;
};

/** Fase canônica a partir do journey_phase_default da lista-alimento (F1…F7). */
export function faseCanonicaDaListaAlimento(faseFeed: string | null | undefined): string | null {
  if (!faseFeed) return null;
  const chave = String(faseFeed).trim().toUpperCase();
  return traduzirFase("lista_alimento", chave)?.canonico ?? null;
}

/**
 * Monta o resumo do cano a partir de dados já carregados no Desk (sem I/O).
 * WhatsApp nunca é "ok" de envio — só "parcial" quando há alerta/template.
 */
export function resumirCano(input: {
  temItemListaAlimento: boolean;
  produtoPai: string | null;
  caseServiceId: string | null;
  casePlanId: string | null;
  faseJornada: string | null;
  projecoesPublicadas: number;
  alertasAbertos: number;
}): ResumoCano {
  const elos: ResumoCano["elos"] = {
    legado: {
      estado: "ok",
      detalhe: "Planilha Mestre isolada — só migração para lista-alimento.",
    },
    lista_alimento: {
      estado: input.temItemListaAlimento ? "ok" : "parcial",
      detalhe: input.temItemListaAlimento
        ? "SKU amarrado à lista-alimento (planner_catalog_feed)."
        : "SKU sem linha na lista-alimento — reconciliar no Catálogo.",
    },
    catalogo_planejador: {
      estado: input.produtoPai ? "ok" : "parcial",
      detalhe: input.produtoPai
        ? `Produto-pai: ${input.produtoPai}.`
        : "Sem produto-pai — escolher SKU enriquecido no Caso 360.",
    },
    caso_360: {
      estado: input.caseServiceId && input.casePlanId ? "ok" : input.caseServiceId ? "parcial" : "ausente",
      detalhe:
        input.caseServiceId && input.casePlanId
          ? `Serviço + plano ligados${input.faseJornada ? ` · fase ${input.faseJornada}` : ""}.`
          : input.caseServiceId
            ? "Serviço existe; plano ainda não amarrado."
            : "Salvar produto + trilha no Caso 360.",
    },
    desk_libera: {
      estado: input.projecoesPublicadas > 0 ? "ok" : "parcial",
      detalhe:
        input.projecoesPublicadas > 0
          ? `${input.projecoesPublicadas} projeção(ões) publicada(s) no App.`
          : "Biblioteca: revisar → aprovar → publicar (ou projetar micro-entrega).",
    },
    app_autorizado: {
      estado: input.projecoesPublicadas > 0 ? "ok" : "ausente",
      detalhe:
        input.projecoesPublicadas > 0
          ? "App Cliente lê via portal_projecoes / RLS."
          : "Nada publicado — empty state legítimo no App.",
    },
    whatsapp_manual: {
      estado: input.alertasAbertos > 0 ? "parcial" : "bloqueado",
      detalhe:
        input.alertasAbertos > 0
          ? `${input.alertasAbertos} alerta(s) — abrir Biblioteca de Mensagens e copiar (sem envio automático).`
          : "Sem alerta interno; WhatsApp só após autorização humana.",
    },
  };

  let proximoPassoDesk = "Caso operável — acompanhar próxima ação canônica.";
  if (!input.caseServiceId) proximoPassoDesk = "Salvar produto-pai + trilha no Caso 360.";
  else if (!input.casePlanId) proximoPassoDesk = "Abrir Planejador operacional e gravar o plano (ou re-salvar o serviço).";
  else if (input.projecoesPublicadas === 0) proximoPassoDesk = "Liberar conteúdo na Biblioteca de evidências/projeções.";
  else if (input.alertasAbertos > 0) proximoPassoDesk = "Preparar mensagem WhatsApp (cópia manual) a partir do alerta.";

  return { elos, proximoPassoDesk };
}
