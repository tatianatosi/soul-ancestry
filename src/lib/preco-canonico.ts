/**
 * Regra institucional — fonte canônica de preço comercial.
 *
 * Fonte viva: Desk Intelligence / product_catalog homologado (ou exceção
 * comercial aprovada e vigente). A Planilha Mestre passa a ser LEGADO de
 * migração, reconciliação e auditoria histórica — nunca fonte operacional.
 * Preço manual, de WhatsApp, de planejador ou legado nunca é final.
 */

export const FONTES_CANONICAS_PRECO = ["product_catalog", "excecao_comercial_aprovada"] as const;

export const FONTES_NAO_CANONICAS_PRECO = [
  "planilha_mestre_legado",
  "planejador",
  "whatsapp",
  "manual",
  "proposta_canva",
  "case_service",
] as const;

export const ROTULO_FONTE_CANONICA: Record<string, string> = {
  product_catalog: "Catálogo homologado (Desk Intelligence)",
  excecao_comercial_aprovada: "Exceção comercial aprovada",
  planilha_mestre_legado: "Planilha Mestre (legado — auditoria histórica)",
  planejador: "Planejador",
  whatsapp: "WhatsApp/manual",
  manual: "Dado manual",
  proposta_canva: "Proposta Canva",
  case_service: "Case service",
};

export type ProdutoCanonico = {
  id: string;
  code: string | null;
  nome_comercial: string | null;
  status_homologacao: string | null;
  elegivel_para_proposta: boolean | null;
  preco_comercial_vigente: number | null;
  condicao_comercial_padrao: string | null;
  parcelas_padrao: number | null;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  homologado_por: string | null;
  homologado_em: string | null;
  origem_legada_referencia: string | null;
  ativo?: boolean | null;
  archived_at?: string | null;
};

export type ExcecaoComercial = {
  id: string;
  aprovada: boolean;
  valor: number | null;
  condicao?: string | null;
  valida_ate?: string | null;
  motivo?: string | null;
};

export type ValorObservado = { fonte: string; valor: number | null; condicao?: string | null };

export type ConferenciaPrecoCanonico = {
  ok: boolean;
  fonte: (typeof FONTES_CANONICAS_PRECO)[number] | null;
  preco: number | null;
  condicao: string | null;
  parcelas: number | null;
  divergencias: { fonte: string; valor: number | null; diferenca: number | null; mensagem: string }[];
  bloqueios: { codigo: string; descricao: string }[];
};

export const COD_SEM_PRODUTO = "PRECO_SEM_PRODUTO";
export const COD_NAO_HOMOLOGADO = "PRECO_NAO_HOMOLOGADO";
export const COD_FORA_VIGENCIA = "PRECO_FORA_DE_VIGENCIA";
export const COD_SEM_PRECO = "PRECO_VIGENTE_AUSENTE";
export const COD_DIVERGENTE = "PRECO_DIVERGENTE";
export const COD_EXCECAO_INVALIDA = "EXCECAO_COMERCIAL_INVALIDA";

function dentroDaVigencia(p: ProdutoCanonico, hoje: Date): boolean {
  if (p.vigencia_inicio && new Date(p.vigencia_inicio) > hoje) return false;
  if (p.vigencia_fim && new Date(p.vigencia_fim) < hoje) return false;
  return true;
}

/**
 * Confere o preço vigente do caso contra a fonte canônica e aponta divergências
 * das demais origens. Nunca escolhe um preço de origem não canônica.
 */
export function conferirPrecoCanonico(input: {
  produto: ProdutoCanonico | null | undefined;
  excecao?: ExcecaoComercial | null;
  observados: ValorObservado[];
  hoje?: Date;
}): ConferenciaPrecoCanonico {
  const hoje = input.hoje ?? new Date();
  const bloqueios: ConferenciaPrecoCanonico["bloqueios"] = [];
  const divergencias: ConferenciaPrecoCanonico["divergencias"] = [];

  const excecao = input.excecao ?? null;
  if (excecao && !excecao.aprovada) {
    bloqueios.push({ codigo: COD_EXCECAO_INVALIDA, descricao: "Exceção comercial registrada sem aprovação humana." });
  }
  const excecaoVigente =
    excecao?.aprovada && excecao.valor != null && (!excecao.valida_ate || new Date(excecao.valida_ate) >= hoje)
      ? excecao
      : null;
  if (excecao?.aprovada && !excecaoVigente) {
    bloqueios.push({ codigo: COD_EXCECAO_INVALIDA, descricao: "Exceção comercial aprovada sem valor ou fora da validade." });
  }

  const p = input.produto ?? null;
  if (!p) bloqueios.push({ codigo: COD_SEM_PRODUTO, descricao: "Caso sem produto-pai homologado vinculado (product_catalog)." });
  else {
    if (p.archived_at) bloqueios.push({ codigo: COD_NAO_HOMOLOGADO, descricao: "Produto do catálogo arquivado." });
    if (p.status_homologacao !== "homologado")
      bloqueios.push({
        codigo: COD_NAO_HOMOLOGADO,
        descricao: `Produto “${p.code ?? p.id}” com homologação “${p.status_homologacao ?? "—"}”.`,
      });
    if (p.elegivel_para_proposta === false)
      bloqueios.push({ codigo: COD_NAO_HOMOLOGADO, descricao: "Produto não elegível para proposta/contrato." });
    if (!dentroDaVigencia(p, hoje))
      bloqueios.push({ codigo: COD_FORA_VIGENCIA, descricao: "Preço do catálogo fora da vigência declarada." });
    if (p.preco_comercial_vigente == null && !excecaoVigente)
      bloqueios.push({ codigo: COD_SEM_PRECO, descricao: "Produto sem preço comercial vigente homologado." });
  }

  const fonte = excecaoVigente ? "excecao_comercial_aprovada" : p ? "product_catalog" : null;
  const preco = excecaoVigente ? (excecaoVigente.valor ?? null) : (p?.preco_comercial_vigente ?? null);
  const condicao = excecaoVigente ? (excecaoVigente.condicao ?? null) : (p?.condicao_comercial_padrao ?? null);

  if (preco != null) {
    for (const o of input.observados) {
      if (o.valor == null) continue;
      const dif = Number((o.valor - preco).toFixed(2));
      if (Math.abs(dif) >= 0.01) {
        divergencias.push({
          fonte: o.fonte,
          valor: o.valor,
          diferenca: dif,
          mensagem: `${ROTULO_FONTE_CANONICA[o.fonte] ?? o.fonte} registra ${o.valor}, catálogo vigente registra ${preco}.`,
        });
      }
    }
    if (divergencias.length) {
      bloqueios.push({
        codigo: COD_DIVERGENTE,
        descricao: `${divergencias.length} origem(ns) com valor divergente do preço canônico: ${divergencias
          .map((d) => ROTULO_FONTE_CANONICA[d.fonte] ?? d.fonte)
          .join(", ")}.`,
      });
    }
  }

  return {
    ok: bloqueios.length === 0 && preco != null,
    fonte: bloqueios.length ? null : (fonte as ConferenciaPrecoCanonico["fonte"]),
    preco,
    condicao,
    parcelas: excecaoVigente ? null : (p?.parcelas_padrao ?? null),
    divergencias,
    bloqueios,
  };
}

export const REGRAS_PRECO_CANONICO = [
  "Fonte canônica de preço comercial vigente: Desk Intelligence / product_catalog homologado.",
  "Planilha Mestre é legado de migração, reconciliação e auditoria histórica — não é fonte operacional viva.",
  "Preço manual, de WhatsApp, de planejador ou legado nunca vale como valor final.",
  "Cobrança, checkout, contrato e condição comercial futura consultam catálogo homologado ou exceção comercial aprovada.",
];
