/**
 * CORTE C — consolidação do case service, escopo e condição comercial.
 *
 * Regras institucionais aplicadas aqui:
 * - Nenhum SKU novo e nenhum preço novo nascem nesta camada. O preço só existe
 *   como referência interna espelhada do product_catalog homologado.
 * - O escopo vem da proposta Canva conferida (páginas 1–7). Sem conferência
 *   válida, o case service não pode sair de rascunho.
 * - `approved` só é permitido com todos os campos internos preenchidos e sem
 *   divergência aberta entre proposta, catálogo, planejador e condição.
 * - Consolidar case service NUNCA libera financeiro, cobrança ou link externo.
 */

export type StatusCaseService = "draft" | "approved" | "contracted" | "active" | "completed" | "cancelled";

export type CaseServiceConsolidado = {
  id?: string | null;
  product_catalog_id?: string | null;
  citizenship_track_id?: string | null;
  escopo_aprovado?: string | null;
  composicao_familiar?: string | null;
  condicao_comercial_aprovada?: string | null;
  preco_acordado?: number | null;
  preco_somente_leitura?: boolean | null;
  observacao_interna?: string | null;
  status?: string | null;
};

export type CampoInterno = { campo: keyof CaseServiceConsolidado; label: string; ajuda: string };

/** Campos internos exigidos para que o serviço possa ser aprovado. */
export const CAMPOS_INTERNOS_CASE_SERVICE: CampoInterno[] = [
  { campo: "product_catalog_id", label: "Produto-pai homologado", ajuda: "Vem do catálogo; nunca criado na tela." },
  { campo: "citizenship_track_id", label: "Trilha técnica", ajuda: "País/via preliminar e revisável." },
  { campo: "escopo_aprovado", label: "Escopo aprovado", ajuda: "Texto derivado da proposta Canva conferida." },
  { campo: "composicao_familiar", label: "Composição familiar", ajuda: "Titulares, signatários e dependentes representados." },
  {
    campo: "condicao_comercial_aprovada",
    label: "Condição comercial",
    ajuda: "Referência interna enquanto não houver formalização.",
  },
  { campo: "observacao_interna", label: "Observação interna", ajuda: "Contexto operacional para a equipe." },
];

export function camposInternosPendentes(s: CaseServiceConsolidado | null | undefined): CampoInterno[] {
  if (!s) return CAMPOS_INTERNOS_CASE_SERVICE;
  return CAMPOS_INTERNOS_CASE_SERVICE.filter((c) => {
    const v = s[c.campo];
    return v === null || v === undefined || String(v).trim() === "";
  });
}

// ---------------------------------------------------------------------------
// Divergências entre proposta, catálogo, planejador e condição registrada
// ---------------------------------------------------------------------------

export type OrigemValor = "proposta_canva" | "product_catalog" | "planejador" | "condicao_case_service";

export const ROTULO_ORIGEM_VALOR: Record<OrigemValor, string> = {
  proposta_canva: "Proposta Canva conferida",
  product_catalog: "Catálogo homologado",
  planejador: "Planejador",
  condicao_case_service: "Condição registrada no case service",
};

export type Divergencia = {
  codigo: string;
  origem: OrigemValor;
  descricao: string;
  gravidade: "bloqueio" | "atencao";
};

export type EntradaConsolidacao = {
  servico: CaseServiceConsolidado | null | undefined;
  catalogo: {
    id: string;
    code: string | null;
    nome_comercial: string | null;
    status_homologacao: string | null;
    preco_comercial_vigente: number | null;
    condicao_comercial_padrao: string | null;
  } | null;
  /** Valor observado na proposta Canva conferida, quando extraído. */
  propostaValor?: number | null;
  /** Situação da conferência de escopo da proposta Canva. */
  escopoConferido: { status: string | null; camposAusentes: number; conflitos: number } | null;
  /** Valor observado no planejador, quando homologado. */
  planejadorValor?: number | null;
  nucleo: { titulares: string[]; dependentes: string[]; representacaoPendente: boolean };
};

export type ResultadoConsolidacao = {
  divergencias: Divergencia[];
  camposPendentes: CampoInterno[];
  statusPermitido: Extract<StatusCaseService, "draft" | "approved">;
  motivosBloqueioAprovacao: string[];
  precoReferenciaInterna: number | null;
  origemPreco: "product_catalog" | null;
  financeiroLiberado: false;
  resumoNucleo: string;
};

const dif = (a: number, b: number) => Number((a - b).toFixed(2));

export function consolidarCaseService(e: EntradaConsolidacao): ResultadoConsolidacao {
  const divergencias: Divergencia[] = [];
  const motivos: string[] = [];

  const catalogo = e.catalogo;
  const precoCanonico = catalogo?.preco_comercial_vigente ?? null;

  if (!catalogo) {
    motivos.push("Serviço sem produto-pai homologado vinculado.");
  } else if (catalogo.status_homologacao !== "homologado") {
    divergencias.push({
      codigo: "CATALOGO_NAO_HOMOLOGADO",
      origem: "product_catalog",
      gravidade: "bloqueio",
      descricao: `Produto ${catalogo.code ?? catalogo.id} não está homologado.`,
    });
  }

  const comparar = (origem: OrigemValor, valor: number | null | undefined) => {
    if (valor == null || precoCanonico == null) return;
    const d = dif(valor, precoCanonico);
    if (Math.abs(d) >= 0.01) {
      divergencias.push({
        codigo: "VALOR_DIVERGENTE",
        origem,
        gravidade: "bloqueio",
        descricao: `${ROTULO_ORIGEM_VALOR[origem]} registra ${valor.toFixed(2)}; catálogo homologado registra ${precoCanonico.toFixed(2)} (diferença ${d.toFixed(2)}).`,
      });
    }
  };

  comparar("proposta_canva", e.propostaValor);
  comparar("planejador", e.planejadorValor);
  comparar("condicao_case_service", e.servico?.preco_acordado ?? null);

  if (precoCanonico == null) {
    divergencias.push({
      codigo: "PRECO_CANONICO_AUSENTE",
      origem: "product_catalog",
      gravidade: "bloqueio",
      descricao: "Catálogo homologado sem preço comercial vigente — nenhum valor pode ser criado fora dele.",
    });
  }

  if (e.propostaValor == null) {
    divergencias.push({
      codigo: "PROPOSTA_SEM_VALOR",
      origem: "proposta_canva",
      gravidade: "atencao",
      descricao: "Proposta Canva conferida ainda não tem valor total extraído — nada foi inferido.",
    });
  }

  const escopo = e.escopoConferido;
  if (!escopo || escopo.status !== "aprovado_para_preparacao") {
    divergencias.push({
      codigo: "ESCOPO_NAO_CONFERIDO",
      origem: "proposta_canva",
      gravidade: "bloqueio",
      descricao: escopo
        ? `Conferência de escopo em “${escopo.status ?? "—"}”: ${escopo.camposAusentes} campo(s) ausente(s) e ${escopo.conflitos} conflito(s).`
        : "Escopo da proposta Canva ainda não conferido.",
    });
  }

  if (e.servico?.preco_somente_leitura === false) {
    divergencias.push({
      codigo: "PRECO_EDITAVEL",
      origem: "condicao_case_service",
      gravidade: "bloqueio",
      descricao: "Preço do case service marcado como editável — deve espelhar o catálogo em somente leitura.",
    });
  }

  if (e.nucleo.representacaoPendente) {
    divergencias.push({
      codigo: "REPRESENTACAO_PENDENTE",
      origem: "condicao_case_service",
      gravidade: "bloqueio",
      descricao: "Dependente menor com representação pendente — núcleo ainda não fechado para aprovação.",
    });
  }

  const camposPendentes = camposInternosPendentes(e.servico);
  if (camposPendentes.length) {
    motivos.push(`Campos internos não preenchidos: ${camposPendentes.map((c) => c.label).join(", ")}.`);
  }
  for (const d of divergencias.filter((x) => x.gravidade === "bloqueio")) motivos.push(d.descricao);

  const resumoNucleo = [
    e.nucleo.titulares.length ? `Titulares: ${e.nucleo.titulares.join(", ")}` : "Sem titulares registrados",
    e.nucleo.dependentes.length ? `Dependentes: ${e.nucleo.dependentes.join(", ")}` : "Sem dependentes",
  ].join(" · ");

  return {
    divergencias,
    camposPendentes,
    statusPermitido: motivos.length === 0 ? "approved" : "draft",
    motivosBloqueioAprovacao: motivos,
    precoReferenciaInterna: precoCanonico,
    origemPreco: precoCanonico == null ? null : "product_catalog",
    financeiroLiberado: false,
    resumoNucleo,
  };
}

/** Texto padrão da condição comercial enquanto não há formalização. */
export function condicaoReferenciaInterna(valor: number | null): string {
  const v = valor == null ? "valor não homologado" : `R$ ${valor.toFixed(2).replace(".", ",")}`;
  return `${v} — referência interna pendente de formalização. Sem cobrança, link Asaas, contrato ou assinatura.`;
}

// ---------------------------------------------------------------------------
// Critérios de aceite por entrega (pendentes de decisão humana)
// ---------------------------------------------------------------------------

export type CriterioAceiteDef = { codigo: string; descricao: string; obrigatorio: boolean };
export type EntregaAceiteDef = { codigo: string; rotulo: string; criterios: CriterioAceiteDef[] };

export const ENTREGAS_ACEITE: EntregaAceiteDef[] = [
  {
    codigo: "ENT-DIAG-FAM",
    rotulo: "Diagnóstico familiar multipaís",
    criterios: [
      { codigo: "CRIT-ESCOPO-CANVA", descricao: "Escopo entregue confere com as páginas 1–7 da proposta Canva conferida.", obrigatorio: true },
      { codigo: "CRIT-NUCLEO", descricao: "Núcleo considerado é o registrado: Ana, Adair, Alice e Felipe como dependente.", obrigatorio: true },
      { codigo: "CRIT-SEM-MERITO", descricao: "Material entregue ao cliente não contém juízo de mérito nem promessa de resultado.", obrigatorio: true },
    ],
  },
  {
    codigo: "ENT-TRILHA-AT",
    rotulo: "Linha prioritária Áustria — § 58c StbG",
    criterios: [
      { codigo: "CRIT-TRILHA-PRELIMINAR", descricao: "Trilha apresentada como preliminar e revisável, com base legal citada.", obrigatorio: true },
      { codigo: "CRIT-FONTES", descricao: "Fontes catalogadas sem disparar consulta externa não autorizada.", obrigatorio: true },
    ],
  },
  {
    codigo: "ENT-DOSSIE",
    rotulo: "Dossiê e evidências",
    criterios: [
      { codigo: "CRIT-EVIDENCIA-PROJECAO", descricao: "Nenhuma evidência exibida ao cliente sem projeção autorizada.", obrigatorio: true },
      { codigo: "CRIT-RASTREIO", descricao: "Cada afirmação do dossiê aponta para evidência registrada no Desk.", obrigatorio: true },
    ],
  },
  {
    codigo: "ENT-COMERCIAL",
    rotulo: "Condição comercial e formalização",
    criterios: [
      { codigo: "CRIT-PRECO-HOMOLOGADO", descricao: "Valor praticado vem do catálogo homologado ou de exceção comercial aprovada.", obrigatorio: true },
      { codigo: "CRIT-TERCEIROS", descricao: "Despesas de terceiros declaradas fora dos honorários.", obrigatorio: true },
      { codigo: "CRIT-SEM-AUTOMACAO", descricao: "Nenhuma cobrança, link ou mensagem disparada sem decisão humana.", obrigatorio: true },
    ],
  },
];

export type ItemCriterio = {
  id?: string;
  entrega_codigo: string;
  entrega_rotulo: string;
  criterio_codigo: string;
  criterio_descricao: string;
  obrigatorio: boolean;
  status: "pendente_decisao_humana" | "aceito" | "recusado" | "nao_aplicavel";
  decidido_por?: string | null;
  decidido_em?: string | null;
  observacao_interna?: string | null;
};

export function semearCriterios(): Omit<ItemCriterio, "id">[] {
  return ENTREGAS_ACEITE.flatMap((e) =>
    e.criterios.map((c) => ({
      entrega_codigo: e.codigo,
      entrega_rotulo: e.rotulo,
      criterio_codigo: c.codigo,
      criterio_descricao: c.descricao,
      obrigatorio: c.obrigatorio,
      status: "pendente_decisao_humana" as const,
    })),
  );
}

export function criterioDecidido(i: ItemCriterio): boolean {
  if (i.status === "nao_aplicavel") return true;
  if (i.status !== "aceito" && i.status !== "recusado") return false;
  return Boolean(i.decidido_por && i.decidido_em);
}

export function resumoCriterios(itens: ItemCriterio[]) {
  const grupos = new Map<string, { entrega_codigo: string; entrega_rotulo: string; total: number; decididos: number; pendentes: number; recusados: number }>();
  for (const i of itens) {
    const g =
      grupos.get(i.entrega_codigo) ??
      { entrega_codigo: i.entrega_codigo, entrega_rotulo: i.entrega_rotulo, total: 0, decididos: 0, pendentes: 0, recusados: 0 };
    g.total += 1;
    if (criterioDecidido(i)) g.decididos += 1;
    else g.pendentes += 1;
    if (i.status === "recusado") g.recusados += 1;
    grupos.set(i.entrega_codigo, g);
  }
  return [...grupos.values()];
}

export function aceitePendente(itens: ItemCriterio[]): boolean {
  return itens.some((i) => i.obrigatorio && !criterioDecidido(i));
}
