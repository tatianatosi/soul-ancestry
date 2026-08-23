/**
 * Lote único de aprovação S-01 a S-05.
 *
 * Projeta as cinco primeiras linhas do pacote de aprovações (APR-01 a APR-05)
 * como itens numerados S-01…S-05 para uma janela de confirmação única.
 *
 * Regras invioláveis preservadas:
 * - a janela apenas registra decisão interna auditada e avança estado interno;
 * - nenhuma ação externa, envio, cobrança, migration ou publicação é executada;
 * - itens com efeito externo param em `pronto_para_confirmacao_externa` e
 *   continuam exigindo confirmação final explícita, item a item.
 */
import {
  PACOTE_APROVACOES,
  confirmacaoExternaObrigatoria,
  type LinhaAprovacao,
} from "@/lib/varredura-administracao";

export const MOTIVO_MINIMO_LOTE = 10;

export const TEXTO_CHECKBOX_LOTE =
  "Confirmo que revisei cada item selecionado e assumo a decisão como proprietária administradora. Nenhuma ação externa será executada por esta janela.";

export type EstadoInternoLote = "aprovado_internamente" | "pronto_para_confirmacao_externa";

export type ItemLoteAprovacao = {
  /** Identificador da janela (S-01…S-05). */
  id: string;
  /** Identificador canônico de origem (APR-01…APR-05). */
  origem_id: string;
  linha: LinhaAprovacao;
  exigeConfirmacaoExterna: boolean;
  estadoInternoAlvo: EstadoInternoLote;
};

export const ROTULO_ESTADO_INTERNO: Record<EstadoInternoLote, string> = {
  aprovado_internamente: "Aprovado internamente",
  pronto_para_confirmacao_externa: "Pronto para confirmação externa (não executado)",
};

/** Itens S-01 a S-05, derivados das cinco primeiras aprovações pendentes. */
export function itensLoteS01aS05(): ItemLoteAprovacao[] {
  return PACOTE_APROVACOES.slice(0, 5).map((linha, i) => {
    const externa = confirmacaoExternaObrigatoria(linha);
    return {
      id: `S-0${i + 1}`,
      origem_id: linha.id,
      linha,
      exigeConfirmacaoExterna: externa,
      estadoInternoAlvo: externa
        ? ("pronto_para_confirmacao_externa" as const)
        : ("aprovado_internamente" as const),
    };
  });
}

export type EntradaLote = {
  selecionados: string[];
  motivo: string;
  checkboxConfirmado: boolean;
};

export function validarLote(entrada: EntradaLote): string[] {
  const erros: string[] = [];
  const validos = new Set(itensLoteS01aS05().map((i) => i.id));
  const selecionados = entrada.selecionados.filter((s) => validos.has(s));
  if (selecionados.length === 0) {
    erros.push("Selecione ao menos um item de S-01 a S-05.");
  }
  if (entrada.selecionados.some((s) => !validos.has(s))) {
    erros.push("Item fora do lote S-01 a S-05.");
  }
  if ((entrada.motivo ?? "").trim().length < MOTIVO_MINIMO_LOTE) {
    erros.push(`Motivo obrigatório com pelo menos ${MOTIVO_MINIMO_LOTE} caracteres.`);
  }
  if (entrada.checkboxConfirmado !== true) {
    erros.push("Confirmação explícita obrigatória: marque a caixa de confirmação do lote.");
  }
  return erros;
}

/** Decisão auditada de um item do lote — sempre interna, nunca executa ação externa. */
export function decisaoLoteDoItem(item: ItemLoteAprovacao, motivo: string) {
  return {
    acao: "aprovar_lote_item_interno",
    operacao: item.estadoInternoAlvo,
    entidade: "pacote_aprovacoes_pendentes",
    entidade_id: item.origem_id,
    campo: "estado_interno",
    valor_anterior: "pendente",
    valor_novo: item.estadoInternoAlvo,
    motivo: motivo.trim(),
    fonte: "janela_lote_s01_s05",
    impacto: item.linha.impacto,
    pendencias_assumidas: item.exigeConfirmacaoExterna
      ? [`${item.id}: confirmação externa explícita permanece pendente`]
      : [],
    dados_teste: false,
  };
}

/** Payloads auditados do lote, um por item selecionado, na ordem S-01…S-05. */
export function montarLote(entrada: EntradaLote) {
  const erros = validarLote(entrada);
  if (erros.length) return { valido: false as const, erros, decisoes: [] };
  const selecionados = new Set(entrada.selecionados);
  const decisoes = itensLoteS01aS05()
    .filter((i) => selecionados.has(i.id))
    .map((i) => ({ item: i, decisao: decisaoLoteDoItem(i, entrada.motivo) }));
  return { valido: true as const, erros: [], decisoes };
}
