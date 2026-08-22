/**
 * P1 — Procuração europeia parametrizada por proposta, produto e país.
 *
 * Resolvedor SOMENTE LEITURA do contexto de jurisdição da segunda procuração.
 * Itália nunca é default. Nada aqui cria procuração, texto, poderes, envio,
 * assinatura, contato com órgão ou pesquisa externa.
 */

export const PROCURACAO_EUROPEIA_VERSAO = "PROCURACAO-EUROPEIA-CONTEXTO-v1.0";

/** Países europeus homologados para rótulo (sem qualquer inferência de poderes). */
export const PAISES_EUROPEUS = [
  "Áustria",
  "Itália",
  "Portugal",
  "Espanha",
  "Alemanha",
  "Polônia",
  "Hungria",
  "Luxemburgo",
  "Croácia",
  "Romênia",
] as const;
export type PaisEuropeu = (typeof PAISES_EUROPEUS)[number];

export const PAIS_A_CONFIRMAR = "A confirmar" as const;
export type PaisProcuracao = PaisEuropeu | typeof PAIS_A_CONFIRMAR;

export type FonteContextoEuropeu =
  | "proposta_os_aprovada"
  | "produto_sku_homologado"
  | "planejador_homologado"
  | "caso_confirmado"
  | "pendente";

export const FONTE_LABEL: Record<FonteContextoEuropeu, string> = {
  proposta_os_aprovada: "Proposta/OS aprovada e vinculada ao caso",
  produto_sku_homologado: "Produto/SKU homologado",
  planejador_homologado: "País/rota homologados no Planejador",
  caso_confirmado: "País/rota confirmados no caso",
  pendente: "Sem fonte rastreável — país pendente",
};

/** Precedência canônica: 1 proposta, 2 SKU, 3 Planejador, 4 caso, 5 pendente. */
export const PRECEDENCIA_FONTES: FonteContextoEuropeu[] = [
  "proposta_os_aprovada",
  "produto_sku_homologado",
  "planejador_homologado",
  "caso_confirmado",
];

export type EstadoContextoEuropeu = "confirmado" | "a_confirmar" | "conflito";

export type EntradaContextoEuropeu = {
  /** País declarado na proposta/OS aprovada e vinculada ao mesmo caso. */
  propostaAprovadaVinculada?: { pais?: string | null; versao?: string | null } | null;
  produtoSkuHomologado?: { pais?: string | null; versao?: string | null } | null;
  planejadorHomologado?: { pais?: string | null; versao?: string | null } | null;
  casoConfirmado?: { pais?: string | null; versao?: string | null } | null;
};

export type ContextoProcuracaoEuropeia = {
  jurisdiction_scope: "Europa";
  country: PaisProcuracao;
  country_label: string;
  title: string;
  source: FonteContextoEuropeu;
  source_label: string;
  version: string;
  state: EstadoContextoEuropeu;
  conflito: { fonte: FonteContextoEuropeu; pais: PaisEuropeu }[] | null;
  motivos: string[];
};

/** Rótulo da procuração de atuação no Brasil (jurisdição fixa, sem resolvedor). */
export const TITULO_PROCURACAO_BRASIL = "Procuração para atuação no Brasil";

/** Rótulo genérico da segunda procuração antes da confirmação de país. */
export const TITULO_PROCURACAO_EUROPEIA_GENERICO = "Procuração para atuação no país/órgão europeu aplicável";

/** Preposição correta por país, sem inventar país algum. */
function tituloPorPais(pais: PaisEuropeu): string {
  const em = new Set<PaisEuropeu>(["Portugal", "Espanha"]);
  return em.has(pais)
    ? `Procuração para atuação em ${pais}`
    : `Procuração para atuação na ${pais}`;
}

/** Normaliza um país declarado para a lista homologada. Não adivinha. */
export function normalizarPaisEuropeu(valor: string | null | undefined): PaisEuropeu | null {
  if (!valor) return null;
  const bruto = valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  const mapa: Record<string, PaisEuropeu> = {
    austria: "Áustria",
    at: "Áustria",
    italia: "Itália",
    it: "Itália",
    portugal: "Portugal",
    pt: "Portugal",
    espanha: "Espanha",
    es: "Espanha",
    alemanha: "Alemanha",
    de: "Alemanha",
    polonia: "Polônia",
    pl: "Polônia",
    hungria: "Hungria",
    hu: "Hungria",
    luxemburgo: "Luxemburgo",
    lu: "Luxemburgo",
    croacia: "Croácia",
    hr: "Croácia",
    romenia: "Romênia",
    ro: "Romênia",
  };
  return mapa[bruto] ?? null;
}

function fonteDe(entrada: EntradaContextoEuropeu, fonte: FonteContextoEuropeu) {
  switch (fonte) {
    case "proposta_os_aprovada":
      return entrada.propostaAprovadaVinculada ?? null;
    case "produto_sku_homologado":
      return entrada.produtoSkuHomologado ?? null;
    case "planejador_homologado":
      return entrada.planejadorHomologado ?? null;
    case "caso_confirmado":
      return entrada.casoConfirmado ?? null;
    default:
      return null;
  }
}

/**
 * Resolve o contexto europeu por precedência. Divergência entre fontes gera
 * conflito rastreável — nunca escolhe país por padrão para resolvê-lo.
 */
export function resolverContextoEuropeu(entrada: EntradaContextoEuropeu): ContextoProcuracaoEuropeia {
  const declarados: { fonte: FonteContextoEuropeu; pais: PaisEuropeu; versao: string | null }[] = [];
  const motivos: string[] = [];

  for (const fonte of PRECEDENCIA_FONTES) {
    const bruto = fonteDe(entrada, fonte);
    if (!bruto || !bruto.pais) continue;
    const pais = normalizarPaisEuropeu(bruto.pais);
    if (!pais) {
      motivos.push(`${FONTE_LABEL[fonte]}: país declarado fora da lista homologada — não interpretado.`);
      continue;
    }
    declarados.push({ fonte, pais, versao: bruto.versao ?? null });
  }

  const distintos = Array.from(new Set(declarados.map((d) => d.pais)));

  if (distintos.length > 1) {
    motivos.push(
      "Divergência de país entre fontes canônicas: nenhuma procuração europeia pode ser preparada, revisada, assinada ou usada até a resolução humana.",
    );
    return {
      jurisdiction_scope: "Europa",
      country: PAIS_A_CONFIRMAR,
      country_label: PAIS_A_CONFIRMAR,
      title: "Procuração europeia — país e órgão a confirmar",
      source: "pendente",
      source_label: FONTE_LABEL.pendente,
      version: PROCURACAO_EUROPEIA_VERSAO,
      state: "conflito",
      conflito: declarados.map((d) => ({ fonte: d.fonte, pais: d.pais })),
      motivos,
    };
  }

  if (declarados.length === 0) {
    motivos.push("Nenhuma fonte canônica declara o país europeu aplicável — país permanece a confirmar, sem inferência.");
    return {
      jurisdiction_scope: "Europa",
      country: PAIS_A_CONFIRMAR,
      country_label: PAIS_A_CONFIRMAR,
      title: "Procuração europeia — país e órgão a confirmar",
      source: "pendente",
      source_label: FONTE_LABEL.pendente,
      version: PROCURACAO_EUROPEIA_VERSAO,
      state: "a_confirmar",
      conflito: null,
      motivos,
    };
  }

  const vencedor = declarados[0];
  return {
    jurisdiction_scope: "Europa",
    country: vencedor.pais,
    country_label: vencedor.pais,
    title: tituloPorPais(vencedor.pais),
    source: vencedor.fonte,
    source_label: FONTE_LABEL[vencedor.fonte],
    version: vencedor.versao ?? PROCURACAO_EUROPEIA_VERSAO,
    state: "confirmado",
    conflito: null,
    motivos,
  };
}

/** Campos que jamais são preenchidos automaticamente, mesmo com país confirmado. */
export const CAMPOS_NUNCA_AUTOMATICOS = [
  "finalidade",
  "orgao_destinatario",
  "pessoas_vinculadas",
  "poderes",
  "idioma",
  "modelo_local",
  "requisito_assinatura_apostila_reconhecimento",
] as const;
export type CampoNuncaAutomatico = (typeof CAMPOS_NUNCA_AUTOMATICOS)[number];

export const AVISO_PREPARO_PROCURACAO =
  "Preparar somente após confirmar país, finalidade, órgão competente, poderes necessários e requisito formal aplicável.";

export type BloqueioProcuracaoEuropeia = {
  bloqueado: boolean;
  motivos: string[];
  /** Campo/origem que o operador precisa resolver. */
  origemAResolver: string | null;
  gates: ("preparacao" | "revisao_humana" | "assinatura" | "uso_anexo_iv")[];
};

/** Conflito ou país a confirmar bloqueiam preparação, revisão, assinatura e uso do Anexo IV. */
export function bloqueiosProcuracaoEuropeia(ctx: ContextoProcuracaoEuropeia): BloqueioProcuracaoEuropeia {
  if (ctx.state === "conflito") {
    const lista = (ctx.conflito ?? []).map((c) => `${FONTE_LABEL[c.fonte]} → ${c.pais}`).join(" · ");
    return {
      bloqueado: true,
      motivos: [`Conflito de país entre fontes canônicas (${lista}). Resolver na fonte, sem escolher país por padrão.`],
      origemAResolver: "País/rota nas fontes canônicas divergentes (proposta, SKU, Planejador, caso)",
      gates: ["preparacao", "revisao_humana", "assinatura", "uso_anexo_iv"],
    };
  }
  if (ctx.state === "a_confirmar") {
    return {
      bloqueado: true,
      motivos: ["País europeu não confirmado — procuração permanece “Não iniciada” e nenhum texto, poder ou instrumento é gerado."],
      origemAResolver: "País/rota na proposta/OS aprovada ou no Planejador homologado",
      gates: ["preparacao", "revisao_humana", "assinatura", "uso_anexo_iv"],
    };
  }
  return { bloqueado: false, motivos: [], origemAResolver: null, gates: [] };
}

/** Mesmo com país confirmado, nenhum destes campos é derivado do país. */
export function camposPendentesAposPais(
  preenchidos: Partial<Record<CampoNuncaAutomatico, unknown>>,
): CampoNuncaAutomatico[] {
  return CAMPOS_NUNCA_AUTOMATICOS.filter((c) => {
    const v = preenchidos[c];
    if (Array.isArray(v)) return v.length === 0;
    return v === undefined || v === null || v === "";
  });
}
