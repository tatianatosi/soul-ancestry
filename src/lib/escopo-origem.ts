/**
 * Origem de cada contract_scope_item — camada SOMENTE-LEITURA.
 *
 * Reconstitui, para cada item de escopo contratual, a cadeia
 * Proposta vN → SKU → Condição comercial → Ordem de serviço.
 * Nada é criado, promovido, corrigido ou enviado aqui: o painel apenas
 * evidencia o que está vinculado, o que foi herdado do contrato, o que está
 * apenas declarado em texto de origem e o que está ausente.
 */

export type EstadoVinculo = "vinculado" | "herdado" | "declarado" | "ausente";

export type Vinculo = {
  estado: EstadoVinculo;
  rotulo: string;
  detalhe: string | null;
  id: string | null;
};

export type ItemEscopoBruto = {
  id: string;
  contract_id: string | null;
  category: string | null;
  title: string | null;
  status: string | null;
  source_type: string | null;
  source_reference: string | null;
  scope_version: number | null;
  proposal_id: string | null;
  commercial_condition_id: string | null;
  service_order_id: string | null;
};

export type ContratoBruto = {
  id: string;
  contract_number: string | null;
  case_id: string | null;
  proposal_id: string | null;
  status: string | null;
  demo: boolean | null;
};

export type PropostaBruta = {
  id: string;
  versao: number | null;
  status: string | null;
  case_id: string | null;
  product_catalog_id: string | null;
  dados_teste: boolean | null;
};

export type CondicaoBruta = {
  id: string;
  codigo: string | null;
  status: string | null;
  case_id: string | null;
  proposal_id: string | null;
  product_catalog_id: string | null;
  dados_teste: boolean | null;
};

export type OrdemBruta = {
  id: string;
  service_order_number: string | null;
  status: string | null;
  case_id: string | null;
  contract_id: string | null;
  commercial_condition_id: string | null;
  dados_teste: boolean | null;
};

export type ProdutoBruto = { id: string; code: string | null; nome_comercial: string | null };
export type CasoBruto = { id: string; codigo: string | null; titulo: string | null; demo: boolean | null; dados_teste: boolean | null };

export type EntradaOrigem = {
  itens: ItemEscopoBruto[];
  contratos: ContratoBruto[];
  propostas: PropostaBruta[];
  condicoes: CondicaoBruta[];
  ordens: OrdemBruta[];
  produtos: ProdutoBruto[];
  casos: CasoBruto[];
};

export type LinhaOrigem = {
  id: string;
  contrato: string;
  contrato_id: string | null;
  caso: string;
  caso_id: string | null;
  categoria: string;
  titulo: string;
  status: string;
  versao_escopo: number | null;
  tipo_origem: string;
  referencia_origem: string | null;
  proposta: Vinculo;
  sku: Vinculo;
  condicao: Vinculo;
  ordem: Vinculo;
  cadeia_completa: boolean;
  lacunas: string[];
  fixture: boolean;
};

export type ResumoOrigem = {
  total: number;
  cadeias_completas: number;
  com_lacuna: number;
  por_eixo: Record<"proposta" | "sku" | "condicao" | "ordem", Record<EstadoVinculo, number>>;
};

export const ROTULO_CATEGORIA: Record<string, string> = {
  contracted_scope: "Escopo contratado",
  deliverable: "Entrega",
  exclusion: "Exclusão",
  condition: "Condição",
  annex: "Anexo",
};

export const ROTULO_ESTADO: Record<EstadoVinculo, string> = {
  vinculado: "Vinculado",
  herdado: "Herdado",
  declarado: "Só declarado",
  ausente: "Ausente",
};

export const EIXOS = [
  { chave: "proposta", rotulo: "Proposta vN" },
  { chave: "sku", rotulo: "SKU" },
  { chave: "condicao", rotulo: "Condição comercial" },
  { chave: "ordem", rotulo: "Ordem de serviço" },
] as const;

const ausente = (motivo: string): Vinculo => ({ estado: "ausente", rotulo: "—", detalhe: motivo, id: null });

/** Detecta menção textual à proposta na referência de origem (ex.: "proposta v1 · ..."). */
export function propostaDeclarada(referencia: string | null): string | null {
  if (!referencia) return null;
  const m = /proposta\s*v(\d+)/i.exec(referencia);
  return m ? `Proposta v${m[1]}` : null;
}

function indexar<T extends { id: string }>(linhas: T[]): Map<string, T> {
  return new Map(linhas.map((l) => [l.id, l]));
}

function unico<T>(linhas: T[]): T | null {
  return linhas.length === 1 ? (linhas[0] as T) : null;
}

export function montarOrigemEscopo(e: EntradaOrigem): LinhaOrigem[] {
  const contratos = indexar(e.contratos);
  const propostas = indexar(e.propostas);
  const condicoes = indexar(e.condicoes);
  const ordens = indexar(e.ordens);
  const produtos = indexar(e.produtos);
  const casos = indexar(e.casos);

  return e.itens.map((item) => {
    const contrato = item.contract_id ? (contratos.get(item.contract_id) ?? null) : null;
    const casoId = contrato?.case_id ?? null;
    const caso = casoId ? (casos.get(casoId) ?? null) : null;

    // ---- Proposta -------------------------------------------------------
    let proposta: Vinculo;
    const propDireta = item.proposal_id ? (propostas.get(item.proposal_id) ?? null) : null;
    const propContrato = contrato?.proposal_id ? (propostas.get(contrato.proposal_id) ?? null) : null;
    const declarada = propostaDeclarada(item.source_reference);
    if (propDireta) {
      proposta = {
        estado: "vinculado",
        rotulo: `Proposta v${propDireta.versao ?? "?"}`,
        detalhe: propDireta.status,
        id: propDireta.id,
      };
    } else if (propContrato) {
      proposta = {
        estado: "herdado",
        rotulo: `Proposta v${propContrato.versao ?? "?"}`,
        detalhe: "Herdada do contrato — item sem vínculo próprio.",
        id: propContrato.id,
      };
    } else if (declarada) {
      proposta = {
        estado: "declarado",
        rotulo: declarada,
        detalhe: "Mencionada apenas na referência de origem, sem vínculo persistido.",
        id: null,
      };
    } else {
      proposta = ausente("Nenhuma proposta vinculada, herdada ou declarada.");
    }

    // ---- Condição comercial ---------------------------------------------
    let condicao: Vinculo;
    const condDireta = item.commercial_condition_id ? (condicoes.get(item.commercial_condition_id) ?? null) : null;
    const propId = propDireta?.id ?? propContrato?.id ?? null;
    const condPorProposta = propId ? unico(e.condicoes.filter((c) => c.proposal_id === propId)) : null;
    const condPorCaso = casoId ? unico(e.condicoes.filter((c) => c.case_id === casoId)) : null;
    if (condDireta) {
      condicao = { estado: "vinculado", rotulo: condDireta.codigo ?? condDireta.id.slice(0, 8), detalhe: condDireta.status, id: condDireta.id };
    } else if (condPorProposta) {
      condicao = {
        estado: "herdado",
        rotulo: condPorProposta.codigo ?? condPorProposta.id.slice(0, 8),
        detalhe: "Única condição da proposta — item sem vínculo próprio.",
        id: condPorProposta.id,
      };
    } else if (condPorCaso) {
      condicao = {
        estado: "herdado",
        rotulo: condPorCaso.codigo ?? condPorCaso.id.slice(0, 8),
        detalhe: "Única condição do caso — item sem vínculo próprio.",
        id: condPorCaso.id,
      };
    } else {
      condicao = ausente("Sem condição comercial vinculada ao item, à proposta ou ao caso.");
    }

    // ---- SKU -------------------------------------------------------------
    const condRef = condDireta ?? condPorProposta ?? condPorCaso;
    const skuId = condRef?.product_catalog_id ?? propDireta?.product_catalog_id ?? propContrato?.product_catalog_id ?? null;
    const produto = skuId ? (produtos.get(skuId) ?? null) : null;
    const sku: Vinculo = produto
      ? {
          estado: condDireta?.product_catalog_id ? "vinculado" : "herdado",
          rotulo: produto.code ?? produto.id.slice(0, 8),
          detalhe: produto.nome_comercial ?? null,
          id: produto.id,
        }
      : ausente("Nenhum SKU homologado alcançável pela condição ou pela proposta.");

    // ---- Ordem de serviço -------------------------------------------------
    let ordem: Vinculo;
    const osDireta = item.service_order_id ? (ordens.get(item.service_order_id) ?? null) : null;
    const osContrato = contrato ? unico(e.ordens.filter((o) => o.contract_id === contrato.id)) : null;
    const osCaso = casoId ? unico(e.ordens.filter((o) => o.case_id === casoId)) : null;
    if (osDireta) {
      ordem = { estado: "vinculado", rotulo: osDireta.service_order_number ?? osDireta.id.slice(0, 8), detalhe: osDireta.status, id: osDireta.id };
    } else if (osContrato) {
      ordem = {
        estado: "herdado",
        rotulo: osContrato.service_order_number ?? osContrato.id.slice(0, 8),
        detalhe: "Única OS do contrato — item sem vínculo próprio.",
        id: osContrato.id,
      };
    } else if (osCaso) {
      ordem = {
        estado: "herdado",
        rotulo: osCaso.service_order_number ?? osCaso.id.slice(0, 8),
        detalhe: "Única OS do caso — item sem vínculo próprio.",
        id: osCaso.id,
      };
    } else {
      ordem = ausente("Nenhuma ordem de serviço vinculada ao item, ao contrato ou ao caso.");
    }

    const lacunas: string[] = [];
    if (proposta.estado !== "vinculado") lacunas.push(`Proposta: ${ROTULO_ESTADO[proposta.estado].toLowerCase()}`);
    if (sku.estado !== "vinculado") lacunas.push(`SKU: ${ROTULO_ESTADO[sku.estado].toLowerCase()}`);
    if (condicao.estado !== "vinculado") lacunas.push(`Condição: ${ROTULO_ESTADO[condicao.estado].toLowerCase()}`);
    if (ordem.estado !== "vinculado") lacunas.push(`OS: ${ROTULO_ESTADO[ordem.estado].toLowerCase()}`);

    return {
      id: item.id,
      contrato: contrato?.contract_number ?? "—",
      contrato_id: contrato?.id ?? null,
      caso: caso?.codigo ?? caso?.titulo ?? "—",
      caso_id: casoId,
      categoria: ROTULO_CATEGORIA[item.category ?? ""] ?? (item.category ?? "—"),
      titulo: item.title ?? "—",
      status: item.status ?? "—",
      versao_escopo: item.scope_version ?? null,
      tipo_origem: item.source_type ?? "—",
      referencia_origem: item.source_reference,
      proposta,
      sku,
      condicao,
      ordem,
      cadeia_completa: lacunas.length === 0,
      lacunas,
      fixture: Boolean(contrato?.demo || caso?.demo || caso?.dados_teste),
    };
  });
}

export function resumirOrigem(linhas: LinhaOrigem[]): ResumoOrigem {
  const vazio = (): Record<EstadoVinculo, number> => ({ vinculado: 0, herdado: 0, declarado: 0, ausente: 0 });
  const por_eixo = { proposta: vazio(), sku: vazio(), condicao: vazio(), ordem: vazio() };
  for (const l of linhas) {
    por_eixo.proposta[l.proposta.estado] += 1;
    por_eixo.sku[l.sku.estado] += 1;
    por_eixo.condicao[l.condicao.estado] += 1;
    por_eixo.ordem[l.ordem.estado] += 1;
  }
  return {
    total: linhas.length,
    cadeias_completas: linhas.filter((l) => l.cadeia_completa).length,
    com_lacuna: linhas.filter((l) => !l.cadeia_completa).length,
    por_eixo,
  };
}

export const CABECALHO_ORIGEM_CSV = [
  "item_id",
  "contrato",
  "caso",
  "categoria",
  "titulo",
  "status",
  "versao_escopo",
  "tipo_origem",
  "referencia_origem",
  "proposta",
  "proposta_estado",
  "sku",
  "sku_estado",
  "condicao",
  "condicao_estado",
  "ordem_servico",
  "ordem_estado",
  "cadeia_completa",
  "lacunas",
  "fixture_demo",
] as const;

function celula(valor: string | number | boolean | null): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return `"${texto.replace(/"/g, '""')}"`;
}

export function csvOrigemEscopo(linhas: LinhaOrigem[]): string {
  const corpo = linhas.map((l) =>
    [
      l.id,
      l.contrato,
      l.caso,
      l.categoria,
      l.titulo,
      l.status,
      l.versao_escopo,
      l.tipo_origem,
      l.referencia_origem,
      l.proposta.rotulo,
      ROTULO_ESTADO[l.proposta.estado],
      l.sku.rotulo,
      ROTULO_ESTADO[l.sku.estado],
      l.condicao.rotulo,
      ROTULO_ESTADO[l.condicao.estado],
      l.ordem.rotulo,
      ROTULO_ESTADO[l.ordem.estado],
      l.cadeia_completa ? "sim" : "nao",
      l.lacunas.join(" | "),
      l.fixture ? "sim" : "nao",
    ].map(celula).join(","),
  );
  return [CABECALHO_ORIGEM_CSV.join(","), ...corpo].join("\r\n");
}

export function baixarCsvOrigemEscopo(linhas: LinhaOrigem[]) {
  const conteudo = `\uFEFF${csvOrigemEscopo(linhas)}`;
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `origem-escopo-contratual-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
