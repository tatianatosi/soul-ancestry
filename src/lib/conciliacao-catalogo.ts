/**
 * Rotina de conciliação e bloqueio — SKU, preço e escopo homologados.
 *
 * Regra institucional: a única fonte válida de SKU, preço, condição e escopo
 * é o `product_catalog` homologado (ou exceção comercial aprovada e vigente,
 * tratada fora desta camada). Proposta, planejador, WhatsApp, template ou
 * valor manual servem apenas como valor observado a ser conciliado.
 *
 * Esta camada é pura: não grava, não cobra, não comunica e não aprova nada.
 * Ela produz divergências classificadas e a lista de bloqueios que impedem
 * a geração de OS e de contrato.
 */

export type SeveridadeDivergencia = "bloqueante" | "atencao";

export type DivergenciaConciliacao = {
  codigo: string;
  sku: string;
  severidade: SeveridadeDivergencia;
  descricao: string;
  valor_catalogo?: string | number | null;
  valor_observado?: string | number | null;
};

export type ProdutoHomologado = {
  id: string;
  code: string | null;
  nome: string | null;
  ativo: boolean;
  archived_at?: string | null;
  status_homologacao: string | null;
  elegivel_para_proposta: boolean;
  preco_comercial_vigente: number | null;
  condicao_comercial_padrao: string | null;
  moeda: string | null;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  inclusoes: string[];
  exclusoes: string[];
  entregaveis: string[];
  escopo_aprovado: string | null;
};

export type EscopoObservado = {
  objetivo: string | null;
  servicos: string[];
  inclusoes: string[];
  exclusoes: string[];
  entregas: string[];
  pessoas: number;
};

export type EntradaConciliacao = {
  caseId: string;
  skuObservado: string | null;
  produto: ProdutoHomologado | null;
  precoObservado: number | null;
  condicaoObservada: string | null;
  origemPreco: string | null;
  escopo: EscopoObservado;
  condicaoComercialPersistida: boolean;
  hoje?: Date;
};

export type ResultadoConciliacao = {
  caseId: string;
  sku: string | null;
  fonte: "product_catalog" | null;
  preco_homologado: number | null;
  condicao_homologada: string | null;
  divergencias: DivergenciaConciliacao[];
  bloqueios: string[];
  pode_gerar_os: boolean;
  pode_gerar_contrato: boolean;
  conciliado_em: string;
};

export const COD = {
  SEM_SKU: "CONC_SEM_SKU",
  SKU_FORA_CATALOGO: "CONC_SKU_FORA_CATALOGO",
  SKU_NAO_HOMOLOGADO: "CONC_SKU_NAO_HOMOLOGADO",
  SKU_INATIVO: "CONC_SKU_INATIVO",
  FORA_VIGENCIA: "CONC_SKU_FORA_VIGENCIA",
  PRECO_AUSENTE: "CONC_PRECO_HOMOLOGADO_AUSENTE",
  PRECO_DIVERGENTE: "CONC_PRECO_DIVERGENTE",
  ORIGEM_PRECO_NAO_CANONICA: "CONC_ORIGEM_PRECO_NAO_CANONICA",
  CONDICAO_DIVERGENTE: "CONC_CONDICAO_DIVERGENTE",
  ESCOPO_CATALOGO_AUSENTE: "CONC_ESCOPO_CATALOGO_AUSENTE",
  ESCOPO_INSUFICIENTE: "CONC_ESCOPO_INSUFICIENTE",
  ESCOPO_FORA_DO_CATALOGO: "CONC_ESCOPO_FORA_DO_CATALOGO",
  SEM_CONDICAO_PERSISTIDA: "CONC_SEM_CONDICAO_COMERCIAL",
} as const;

/** Tolerância de arredondamento entre preço observado e preço homologado. */
export const TOLERANCIA_PRECO = 0.01;

const norm = (v: string) =>
  v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

function dentroDaVigencia(p: ProdutoHomologado, hoje: Date): boolean {
  if (p.vigencia_inicio && new Date(p.vigencia_inicio) > hoje) return false;
  if (p.vigencia_fim && new Date(p.vigencia_fim) < hoje) return false;
  return true;
}

/** Executa a conciliação de um caso contra o catálogo homologado. */
export function conciliarCatalogo(e: EntradaConciliacao): ResultadoConciliacao {
  const hoje = e.hoje ?? new Date();
  const d: DivergenciaConciliacao[] = [];
  const sku = (e.skuObservado ?? e.produto?.code ?? null)?.toUpperCase() ?? null;
  const chave = sku ?? "—";
  const add = (
    codigo: string,
    severidade: SeveridadeDivergencia,
    descricao: string,
    valor_catalogo?: string | number | null,
    valor_observado?: string | number | null,
  ) => d.push({ codigo, sku: chave, severidade, descricao, valor_catalogo, valor_observado });

  const p = e.produto;

  if (!sku) {
    add(COD.SEM_SKU, "bloqueante", "Caso sem SKU declarado: não há âncora no catálogo homologado.");
  } else if (!p) {
    add(COD.SKU_FORA_CATALOGO, "bloqueante", `SKU ${sku} não existe no catálogo homologado.`, null, sku);
  }

  if (p) {
    if (!p.ativo || p.archived_at) {
      add(COD.SKU_INATIVO, "bloqueante", `SKU ${chave} inativo ou arquivado no catálogo.`, "ativo", "inativo/arquivado");
    }
    if (p.status_homologacao !== "homologado" || !p.elegivel_para_proposta) {
      add(
        COD.SKU_NAO_HOMOLOGADO,
        "bloqueante",
        `SKU ${chave} sem homologação vigente (status: ${p.status_homologacao ?? "não informado"}).`,
        p.status_homologacao,
        null,
      );
    }
    if (!dentroDaVigencia(p, hoje)) {
      add(COD.FORA_VIGENCIA, "bloqueante", `SKU ${chave} fora da vigência homologada.`, p.vigencia_fim, hoje.toISOString());
    }

    if (p.preco_comercial_vigente === null || p.preco_comercial_vigente === undefined) {
      add(COD.PRECO_AUSENTE, "bloqueante", `SKU ${chave} sem preço comercial vigente homologado.`);
    } else if (e.precoObservado !== null && e.precoObservado !== undefined) {
      const dif = Number((e.precoObservado - p.preco_comercial_vigente).toFixed(2));
      if (Math.abs(dif) > TOLERANCIA_PRECO) {
        add(
          COD.PRECO_DIVERGENTE,
          "bloqueante",
          `Preço praticado diverge do homologado em ${dif > 0 ? "+" : ""}${dif.toFixed(2)}. Exige exceção comercial aprovada.`,
          p.preco_comercial_vigente,
          e.precoObservado,
        );
      }
    }

    if (
      p.condicao_comercial_padrao &&
      e.condicaoObservada &&
      norm(p.condicao_comercial_padrao) !== norm(e.condicaoObservada)
    ) {
      add(
        COD.CONDICAO_DIVERGENTE,
        "atencao",
        "Condição comercial praticada diverge da condição padrão homologada.",
        p.condicao_comercial_padrao,
        e.condicaoObservada,
      );
    }

    const temEscopoCatalogo = !!p.escopo_aprovado || p.inclusoes.length > 0 || p.entregaveis.length > 0;
    if (!temEscopoCatalogo) {
      add(COD.ESCOPO_CATALOGO_AUSENTE, "bloqueante", `SKU ${chave} sem escopo aprovado no catálogo.`);
    } else {
      const catalogo = new Set([...p.inclusoes, ...p.entregaveis].map(norm));
      const extras = [...e.escopo.servicos, ...e.escopo.inclusoes]
        .map((s) => s.trim())
        .filter((s) => s && !catalogo.has(norm(s)));
      if (extras.length) {
        add(
          COD.ESCOPO_FORA_DO_CATALOGO,
          "atencao",
          `Itens de escopo sem correspondência no catálogo homologado: ${extras.slice(0, 5).join("; ")}.`,
          null,
          extras.length,
        );
      }
    }
  }

  if (e.origemPreco && e.origemPreco !== "product_catalog" && e.origemPreco !== "excecao_comercial_aprovada") {
    add(
      COD.ORIGEM_PRECO_NAO_CANONICA,
      "bloqueante",
      `Origem de preço não canônica: ${e.origemPreco}. Somente catálogo homologado ou exceção aprovada valem.`,
      "product_catalog",
      e.origemPreco,
    );
  }

  const faltas: string[] = [];
  if (!e.escopo.objetivo || !e.escopo.objetivo.trim()) faltas.push("objetivo");
  if (!e.escopo.servicos.length) faltas.push("serviços contratados");
  if (!e.escopo.inclusoes.length) faltas.push("inclusões");
  if (!e.escopo.exclusoes.length) faltas.push("exclusões");
  if (!e.escopo.entregas.length) faltas.push("entregas");
  if (!e.escopo.pessoas) faltas.push("pessoas abrangidas");
  if (faltas.length) {
    add(
      COD.ESCOPO_INSUFICIENTE,
      "bloqueante",
      `Escopo insuficiente para gerar OS/contrato: falta ${faltas.join(", ")}.`,
      null,
      faltas.length,
    );
  }

  if (!e.condicaoComercialPersistida) {
    add(
      COD.SEM_CONDICAO_PERSISTIDA,
      "bloqueante",
      "Sem condição comercial persistida a partir da proposta aprovada (Proposta → Condição → OS).",
    );
  }

  const bloqueios = d.filter((x) => x.severidade === "bloqueante").map((x) => x.descricao);
  const pode = bloqueios.length === 0;

  return {
    caseId: e.caseId,
    sku,
    fonte: p && pode ? "product_catalog" : null,
    preco_homologado: p?.preco_comercial_vigente ?? null,
    condicao_homologada: p?.condicao_comercial_padrao ?? null,
    divergencias: d,
    bloqueios,
    pode_gerar_os: pode,
    pode_gerar_contrato: pode,
    conciliado_em: hoje.toISOString(),
  };
}

/** Mensagem única usada para barrar a emissão de OS/contrato. */
export function mensagemBloqueio(r: ResultadoConciliacao): string | null {
  if (!r.bloqueios.length) return null;
  return `Conciliação de catálogo bloqueou a geração: ${r.bloqueios.join(" · ")}`;
}
