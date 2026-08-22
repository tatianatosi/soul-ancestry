/**
 * Camada de REFERÊNCIA e BLOQUEIO de catálogo.
 *
 * A Planilha Mestre de Produtos (projetada em `public.product_catalog`) é a
 * fonte canônica de SKU, status, escopo, preço comercial vigente, condição e
 * link autorizado. O CRM/Painel de Calls NÃO é fonte de verdade e não pode
 * editar nem duplicar esses dados: no Desk eles são somente leitura.
 *
 * Nada aqui cria ou altera cobrança, link Asaas, produto, preço, assinatura,
 * cliente Asaas, proposta ou contrato. Nenhuma integração externa é executada.
 * Asaas é apenas fonte de status de cobrança/pagamento — nunca de escopo ou preço.
 */

export type StatusProduto =
  | "ativo"
  | "inativo"
  | "arquivado"
  | "historico"
  | "descontinuado"
  | "desconhecido";

export type StatusHomologacao = "homologado" | "em_revisao" | "bloqueado" | "arquivado";

export type StatusLinkAsaas =
  | "validado"
  | "pendente"
  | "desatualizado"
  | "nao_aplicavel"
  | "desconhecido";

export const ROTULO_STATUS_PRODUTO: Record<StatusProduto, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  arquivado: "Arquivado",
  historico: "Histórico",
  descontinuado: "Descontinuado",
  desconhecido: "Sem status na fonte",
};

export const ROTULO_STATUS_HOMOLOGACAO: Record<StatusHomologacao, string> = {
  homologado: "Homologado",
  em_revisao: "Em revisão",
  bloqueado: "Bloqueado",
  arquivado: "Arquivado",
};

export const ROTULO_STATUS_LINK: Record<StatusLinkAsaas, string> = {
  validado: "Link validado",
  pendente: "Link pendente",
  desatualizado: "Link desatualizado",
  nao_aplicavel: "Link não aplicável",
  desconhecido: "Link sem status",
};

/** Linha canônica de referência, exatamente como o Desk pode exibir (somente leitura). */
export type ReferenciaSku = {
  sku: string;
  nome_produto: string;
  status_produto: StatusProduto;
  status_homologacao: StatusHomologacao;
  preco_comercial_vigente: number | null;
  condicao_comercial_vigente: string | null;
  versao_vigencia: string | null;
  data_ultima_validacao: string | null;
  responsavel_homologacao: string | null;
  link_asaas_validado: string | null;
  status_link_asaas: StatusLinkAsaas;
  escopo_aprovado: string | null;
  observacao_de_governanca: string | null;
  /** Comparações de reconciliação com a fonte (nunca inferidas, apenas lidas). */
  preco_atual_fonte: number | null;
  preco_sugerido_fonte: number | null;
  link_asaas_fonte: string | null;
  escopo_fonte: string | null;
  moeda: string;
  dados_teste: boolean;
};

const STATUS_PRODUTO: Record<string, StatusProduto> = {
  ativo: "ativo",
  active: "ativo",
  inativo: "inativo",
  arquivado: "arquivado",
  historico: "historico",
  histórico: "historico",
  descontinuado: "descontinuado",
};

const STATUS_HOMOLOGACAO: Record<string, StatusHomologacao> = {
  homologado: "homologado",
  em_revisao: "em_revisao",
  "em revisão": "em_revisao",
  "em revisao": "em_revisao",
  bloqueado: "bloqueado",
  arquivado: "arquivado",
};

const STATUS_LINK: Record<string, StatusLinkAsaas> = {
  validado: "validado",
  pendente: "pendente",
  desatualizado: "desatualizado",
  nao_aplicavel: "nao_aplicavel",
  "não aplicável": "nao_aplicavel",
};

const texto = (v: unknown): string | null => {
  const s = v === null || v === undefined ? "" : String(v).trim();
  return s ? s : null;
};
const numero = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const chave = (v: unknown): string => String(v ?? "").trim().toLowerCase();

/** Normaliza uma linha de `product_catalog` na referência canônica. Sem inferência de preço/condição. */
export function referenciaDeProduto(row: Record<string, unknown>): ReferenciaSku {
  const escopo = row["escopo_aprovado"];
  const escopoFonte = row["escopo_aplicavel"];
  return {
    sku: String(row["code"] ?? "").trim(),
    nome_produto: String(row["nome_comercial"] ?? "").trim(),
    status_produto: STATUS_PRODUTO[chave(row["status_produto"])] ?? "desconhecido",
    status_homologacao: STATUS_HOMOLOGACAO[chave(row["status_homologacao"])] ?? "em_revisao",
    preco_comercial_vigente: numero(row["preco_comercial_vigente"]),
    condicao_comercial_vigente:
      texto(row["condicao_comercial_vigente"]) ?? texto(row["condicao_comercial_padrao"]),
    versao_vigencia: texto(row["versao_vigencia"]) ?? texto(row["versao_catalogo"]),
    data_ultima_validacao: texto(row["data_ultima_validacao"]),
    responsavel_homologacao: texto(row["responsavel_homologacao"]) ?? texto(row["homologado_por"]),
    link_asaas_validado: texto(row["link_asaas_validado"]),
    status_link_asaas: STATUS_LINK[chave(row["status_link_asaas"])] ?? "desconhecido",
    escopo_aprovado: Array.isArray(escopo) ? escopo.map(String).join(" · ") || null : texto(escopo),
    observacao_de_governanca: texto(row["observacao_de_governanca"]),
    preco_atual_fonte: numero(row["preco_atual_fonte"]),
    preco_sugerido_fonte: numero(row["preco_sugerido_fonte"]),
    link_asaas_fonte: texto(row["link_asaas_fonte"]),
    escopo_fonte: Array.isArray(escopoFonte) ? escopoFonte.map(String).join(" · ") || null : texto(escopoFonte),
    moeda: String(row["moeda"] ?? "BRL"),
    dados_teste: row["dados_teste"] === true,
  };
}

/**
 * Divergências entre o vigente e a fonte. Havendo qualquer uma, o SKU é tratado
 * como "Bloqueado por validação comercial" (regra 8) — sem alterar a fonte.
 */
export function divergenciasComerciais(r: ReferenciaSku): string[] {
  const d: string[] = [];
  if (
    r.preco_comercial_vigente !== null &&
    r.preco_sugerido_fonte !== null &&
    Number(r.preco_comercial_vigente) !== Number(r.preco_sugerido_fonte)
  ) {
    d.push("Preço vigente divergente do preço sugerido pela fonte");
  }
  if (
    r.preco_comercial_vigente !== null &&
    r.preco_atual_fonte !== null &&
    Number(r.preco_comercial_vigente) !== Number(r.preco_atual_fonte)
  ) {
    d.push("Preço vigente divergente do preço atual da fonte");
  }
  if (r.link_asaas_validado && r.link_asaas_fonte && r.link_asaas_validado !== r.link_asaas_fonte) {
    d.push("Link validado divergente do link da fonte");
  }
  if (r.escopo_aprovado && r.escopo_fonte && r.escopo_aprovado !== r.escopo_fonte) {
    d.push("Escopo aprovado divergente do escopo da fonte");
  }
  return d;
}

/** Status efetivo exibido no Desk (leitura), já considerando divergência comercial. */
export function statusEfetivo(r: ReferenciaSku): {
  status: StatusHomologacao;
  rotulo: string;
  motivo: string | null;
} {
  const div = divergenciasComerciais(r);
  if (div.length) {
    return { status: "bloqueado", rotulo: "Bloqueado por validação comercial", motivo: div[0] };
  }
  return { status: r.status_homologacao, rotulo: ROTULO_STATUS_HOMOLOGACAO[r.status_homologacao], motivo: null };
}

/**
 * Regra 5: SKU Inativo, Arquivado, Histórico ou Descontinuado nunca aparece no
 * seletor de oferta nova. Ativo aparece (mesmo Em revisão/Bloqueado), porque a
 * visualização interna é permitida — a seleção é que fica bloqueada.
 */
export function visivelNoSeletorDeOfertaNova(r: ReferenciaSku): boolean {
  return r.status_produto === "ativo" && !r.dados_teste;
}

/** Regras 2/3/4/8: motivos que impedem gerar proposta, contrato, cobrança, link ou onboarding. */
export function bloqueiosDeSelecao(
  r: ReferenciaSku,
  contexto?: { produtosRecomendadosDefinidos?: boolean },
): string[] {
  const b: string[] = [];
  if (contexto && contexto.produtosRecomendadosDefinidos === false) {
    b.push("SKU só pode ser selecionado após definir produtos/serviços recomendados");
  }
  if (r.dados_teste) b.push("SKU marcado como TESTE/DEMO");
  if (r.status_produto !== "ativo") {
    b.push(`Status do produto ${ROTULO_STATUS_PRODUTO[r.status_produto]}: fora do seletor de oferta nova`);
  }
  const efetivo = statusEfetivo(r);
  if (efetivo.status !== "homologado") {
    b.push(
      efetivo.motivo
        ? `Bloqueado por validação comercial — ${efetivo.motivo}`
        : `Status de homologação ${ROTULO_STATUS_HOMOLOGACAO[efetivo.status]}: sem homologação explícita`,
    );
  }
  if (r.preco_comercial_vigente === null) b.push("Sem preço comercial vigente na fonte canônica");
  if (!r.versao_vigencia) b.push("Sem versão de vigência registrada");
  if (!r.data_ultima_validacao) b.push("Sem data de última validação");
  if (!r.responsavel_homologacao) b.push("Sem responsável de homologação");
  if (r.status_link_asaas !== "validado" && r.status_link_asaas !== "nao_aplicavel") {
    b.push(`${ROTULO_STATUS_LINK[r.status_link_asaas]}: cobrança e link não liberados`);
  }
  if (!r.escopo_aprovado) b.push("Sem escopo aprovado na fonte canônica");
  return b;
}

/** Regra 3: só SKU Ativo + Homologado, sem divergência, entra em proposta. */
export function selecionavelEmProposta(
  r: ReferenciaSku,
  contexto?: { produtosRecomendadosDefinidos?: boolean },
): boolean {
  return bloqueiosDeSelecao(r, contexto).length === 0;
}

/** Referência gravável no Desk: nunca preço livre — só ponteiro, versão e data. */
export type ReferenciaGravavel = {
  sku: string;
  versao_vigencia: string | null;
  data_ultima_validacao: string | null;
};

export function referenciaGravavel(r: ReferenciaSku): ReferenciaGravavel {
  return { sku: r.sku, versao_vigencia: r.versao_vigencia, data_ultima_validacao: r.data_ultima_validacao };
}

/** Campos que o Desk exibe em modo somente leitura (regra 6). */
export const CAMPOS_SOMENTE_LEITURA_NO_DESK = [
  "preco_comercial_vigente",
  "condicao_comercial_vigente",
  "link_asaas_validado",
  "status_link_asaas",
  "escopo_aprovado",
  "status_produto",
  "status_homologacao",
  "versao_vigencia",
] as const;

/** Critérios objetivos para liberar um SKU para uso comercial. */
export const CRITERIOS_LIBERACAO_SKU = [
  "Status do Produto = Ativo na Planilha Mestre",
  "Status de Homologação = Homologado, com responsável nominal e data de última validação",
  "Preço comercial vigente e condição comercial vigente publicados na fonte canônica",
  "Escopo aprovado registrado e idêntico ao escopo da fonte",
  "Link Asaas validado (ou explicitamente não aplicável), coerente com o link da fonte",
  "Versão de vigência registrada e sem divergência de preço, link ou escopo",
] as const;

/** Filas de governança de catálogo — vivem na área proprietária, não no Painel Hoje. */
export type FilaReferencia = "ativos_sem_homologacao" | "link_pendente_ou_desatualizado" | "bloqueados";

export const ROTULO_FILA_REFERENCIA: Record<FilaReferencia, string> = {
  ativos_sem_homologacao: "SKUs ativos sem homologação",
  link_pendente_ou_desatualizado: "SKUs com link Asaas pendente ou desatualizado",
  bloqueados: "SKUs bloqueados por validação comercial",
};

export type ItemReferencia = {
  fila: FilaReferencia;
  sku: string;
  nome_produto: string;
  status_produto: StatusProduto;
  status_homologacao: StatusHomologacao;
  motivo: string;
  responsavel: string | null;
  data_ultima_validacao: string | null;
  dados_teste: boolean;
};

export function filasDeReferencia(
  refs: ReadonlyArray<ReferenciaSku>,
  opcoes?: { incluirTeste?: boolean },
): Record<FilaReferencia, ItemReferencia[]> {
  const lista = refs.filter((r) => (opcoes?.incluirTeste ? true : !r.dados_teste));
  const base = (r: ReferenciaSku, fila: FilaReferencia, motivo: string): ItemReferencia => ({
    fila,
    sku: r.sku,
    nome_produto: r.nome_produto,
    status_produto: r.status_produto,
    status_homologacao: statusEfetivo(r).status,
    motivo,
    responsavel: r.responsavel_homologacao,
    data_ultima_validacao: r.data_ultima_validacao,
    dados_teste: r.dados_teste,
  });

  const ativos_sem_homologacao: ItemReferencia[] = [];
  const link_pendente_ou_desatualizado: ItemReferencia[] = [];
  const bloqueados: ItemReferencia[] = [];

  for (const r of lista) {
    const efetivo = statusEfetivo(r);
    if (r.status_produto === "ativo" && efetivo.status !== "homologado" && efetivo.status !== "bloqueado") {
      ativos_sem_homologacao.push(base(r, "ativos_sem_homologacao", "Ativo sem homologação explícita"));
    }
    if (r.status_link_asaas === "pendente" || r.status_link_asaas === "desatualizado" || r.status_link_asaas === "desconhecido") {
      link_pendente_ou_desatualizado.push(
        base(r, "link_pendente_ou_desatualizado", ROTULO_STATUS_LINK[r.status_link_asaas]),
      );
    }
    if (efetivo.status === "bloqueado") {
      bloqueados.push(base(r, "bloqueados", efetivo.motivo ?? "Bloqueado por decisão de governança"));
    }
  }

  const ordenar = (l: ItemReferencia[]) => l.sort((a, b) => a.sku.localeCompare(b.sku));
  return {
    ativos_sem_homologacao: ordenar(ativos_sem_homologacao),
    link_pendente_ou_desatualizado: ordenar(link_pendente_ou_desatualizado),
    bloqueados: ordenar(bloqueados),
  };
}

/**
 * Exceção operacional exibida no Painel Hoje quando um caso depende de SKU,
 * preço ou condição não homologados. O Painel Hoje não é catálogo: aqui só
 * existe o texto da exceção e o encaminhamento para a área proprietária.
 */
export const EXCECAO_CONDICAO_COMERCIAL =
  "Bloqueado por condição comercial não homologada — abrir Governança de Catálogo";

export const ROTA_GOVERNANCA_CATALOGO = "/catalogo" as const;
