/**
 * Revisão item a item dos SKUs ativos antes da homologação em lote.
 *
 * Regras preservadas:
 * - homologação é decisão humana explícita, item a item; nada é inferido;
 * - preço, vigência, responsáveis e origem vêm da fonte homologada, nunca são
 *   preenchidos aqui;
 * - a confirmação em lote só considera itens revisados e sem pendência
 *   bloqueante; nenhuma ação externa (link, cobrança, envio) é executada.
 */
import {
  pendenciasDeHomologacao,
  type SkuCanonico,
} from "@/lib/catalogo-canonico";

export type DecisaoRevisao = "pendente" | "homologar" | "manter_rascunho";

export const ROTULO_DECISAO: Record<DecisaoRevisao, string> = {
  pendente: "Não revisado",
  homologar: "Homologar",
  manter_rascunho: "Manter fora da homologação",
};

export const MOTIVO_MINIMO_HOMOLOGACAO = 10;

export const TEXTO_CONFIRMACAO_HOMOLOGACAO =
  "Confirmo que revisei item a item os SKUs marcados e assumo a homologação como proprietária administradora. Nenhum link de cobrança, envio ou ação externa é executado por esta confirmação.";

/**
 * Pendência que impede homologar. A ausência de auditoria de aprovação humana
 * é justamente o que esta tela resolve, então não conta como bloqueio; o
 * estado do preço também é definido pela própria homologação, desde que exista
 * valor e fonte de preço declarada.
 */
export function pendenciasBloqueantes(s: SkuCanonico): string[] {
  const cobravel = s.tipo_cobranca !== "sob_consulta" && s.tipo_cobranca !== "nao_cobravel_diretamente";
  const base = pendenciasDeHomologacao(s).filter(
    (p) => p !== "Sem auditoria de aprovação humana" && p !== "Preço sem fonte homologada",
  );
  if (cobravel) {
    if (s.preco === null) base.push("Preço ausente");
    if (!s.preco_fonte) base.push("Preço sem fonte declarada");
  }
  if (s.dados_teste) base.push("SKU marcado como TESTE");
  if (s.estado_reconciliacao === "divergente") base.push("Conflito de versão/preço com a fonte");
  return Array.from(new Set(base));
}

export type ItemRevisaoSku = {
  id: string;
  sku: string;
  produto: string;
  categoria: string | null;
  preco: number | null;
  moeda: string;
  preco_fonte: string | null;
  tipo_cobranca: string;
  versao_catalogo: string;
  vigencia_inicio: string | null;
  responsaveis: string;
  origem: string;
  entregaveis: number;
  ja_homologado: boolean;
  pendencias: string[];
  elegivel: boolean;
};

/** Itens de revisão dos SKUs ativos (exclui arquivados/TESTE por padrão). */
export function itensRevisao(
  skus: SkuCanonico[],
  opcoes?: { incluirTeste?: boolean },
): ItemRevisaoSku[] {
  return skus
    .filter((s) => (opcoes?.incluirTeste ? true : !s.dados_teste))
    .filter((s) => s.estado_catalogo !== "arquivado" && s.estado_catalogo !== "substituido")
    .map((s) => {
      const pendencias = pendenciasBloqueantes(s);
      return {
        id: s.id,
        sku: s.sku_codigo,
        produto: s.produto,
        categoria: s.categoria,
        preco: s.preco,
        moeda: s.moeda || "BRL",
        preco_fonte: s.preco_fonte,
        tipo_cobranca: s.tipo_cobranca,
        versao_catalogo: s.versao_catalogo,
        vigencia_inicio: s.vigencia_inicio,
        responsaveis: [s.responsavel_comercial, s.responsavel_operacional].filter(Boolean).join(" · ") || "—",
        origem: [s.planilha_mestre_identificador, s.planilha_mestre_versao].filter(Boolean).join(" · ") || "—",
        entregaveis: s.entregaveis.length,
        ja_homologado: s.estado_catalogo === "homologado_ativo",
        pendencias,
        elegivel: pendencias.length === 0 && s.estado_catalogo !== "homologado_ativo",
      };
    })
    .sort((a, b) => a.sku.localeCompare(b.sku, "pt-BR"));
}

export type ResumoRevisao = {
  total: number;
  revisados: number;
  nao_revisados: number;
  marcados_homologar: number;
  mantidos_rascunho: number;
  elegiveis: number;
  bloqueados: number;
  ja_homologados: number;
};

export function resumoRevisao(
  itens: ItemRevisaoSku[],
  decisoes: Record<string, DecisaoRevisao>,
): ResumoRevisao {
  const d = (id: string) => decisoes[id] ?? "pendente";
  return {
    total: itens.length,
    revisados: itens.filter((i) => d(i.id) !== "pendente").length,
    nao_revisados: itens.filter((i) => d(i.id) === "pendente").length,
    marcados_homologar: itens.filter((i) => d(i.id) === "homologar").length,
    mantidos_rascunho: itens.filter((i) => d(i.id) === "manter_rascunho").length,
    elegiveis: itens.filter((i) => i.elegivel).length,
    bloqueados: itens.filter((i) => !i.elegivel && !i.ja_homologado).length,
    ja_homologados: itens.filter((i) => i.ja_homologado).length,
  };
}

export type EntradaConfirmacao = {
  itens: ItemRevisaoSku[];
  decisoes: Record<string, DecisaoRevisao>;
  motivo: string;
  confirmado: boolean;
};

export function validarConfirmacaoLote(e: EntradaConfirmacao): string[] {
  const erros: string[] = [];
  const d = (id: string) => e.decisoes[id] ?? "pendente";
  const marcados = e.itens.filter((i) => d(i.id) === "homologar");

  if (e.itens.some((i) => d(i.id) === "pendente")) {
    erros.push("Revise item a item: ainda há SKU sem decisão registrada.");
  }
  if (marcados.length === 0) {
    erros.push("Marque ao menos um SKU para homologar.");
  }
  const inelegiveis = marcados.filter((i) => !i.elegivel);
  if (inelegiveis.length) {
    erros.push(
      `SKU com pendência bloqueante não pode ser homologado: ${inelegiveis.map((i) => i.sku).join(", ")}.`,
    );
  }
  if ((e.motivo ?? "").trim().length < MOTIVO_MINIMO_HOMOLOGACAO) {
    erros.push(`Motivo obrigatório com pelo menos ${MOTIVO_MINIMO_HOMOLOGACAO} caracteres.`);
  }
  if (e.confirmado !== true) {
    erros.push("Confirmação explícita obrigatória: marque a caixa de confirmação.");
  }
  return erros;
}

/** IDs efetivamente homologáveis, na ordem de exibição. */
export function selecaoHomologavel(e: EntradaConfirmacao): string[] {
  return e.itens.filter((i) => (e.decisoes[i.id] ?? "pendente") === "homologar" && i.elegivel).map((i) => i.id);
}
