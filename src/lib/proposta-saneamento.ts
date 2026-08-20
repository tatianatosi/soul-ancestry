/**
 * ANA-A-01 — saneamento interno da proposta Canva e conferência de escopo.
 *
 * Lógica pura, somente leitura interna. Não cria, edita ou copia design no
 * Canva; não gera contrato, OS, anexo, assinatura, cobrança, link, pasta,
 * mensagem, pesquisa externa ou publicação. Nunca infere campo ausente:
 * ausência vira pendência explícita, jamais valor padrão.
 */

import {
  PAGINAS_PROPOSTA,
  ROTULO_COBERTURA,
  type EstadoCobertura,
  type LinhaCobertura,
  type PropostaCanva,
} from "@/lib/escopo-proposta";

/** Estados de extração admitidos por página (nenhum outro é aceito). */
export const ESTADOS_PAGINA = ["extraida", "em_extracao", "nao_registrada"] as const;
export type EstadoPagina = (typeof ESTADOS_PAGINA)[number];

export const ROTULO_PAGINA: Record<EstadoPagina, string> = {
  extraida: "Extraída e conferida",
  em_extracao: "Em extração — sem conteúdo verificável",
  nao_registrada: "Não registrada",
};

/**
 * Códigos de estado por campo exigidos pelo saneamento. O dicionário interno
 * usa "coberto"; aqui ele é lido como "coberto_validado", sem renomear dado.
 */
export const CODIGO_ESTADO_CAMPO: Record<EstadoCobertura, string> = {
  coberto: "coberto_validado",
  importado_a_confirmar: "importado_a_confirmar",
  parametro_vazio: "parametro_vazio",
  nao_localizado_na_proposta: "nao_localizado_na_proposta",
  divergente: "divergente",
  opcional_nao_declarado: "opcional_nao_declarado",
};

export type LinhaPagina = {
  page_number: number;
  estado: EstadoPagina;
  rotulo: string;
  campos_nao_localizados: string[];
  observacao_interna: string | null;
  bloqueia: boolean;
};

export type PaginaRegistrada = {
  page_number: number;
  extracao_status?: string | null;
  campos_nao_localizados?: string[] | null;
  observacao_interna?: string | null;
};

/** Status individual das páginas 1–7 (nenhuma página é presumida extraída). */
export function statusPaginas(paginas: readonly PaginaRegistrada[] | null | undefined): LinhaPagina[] {
  return (PAGINAS_PROPOSTA as readonly number[]).map((n) => {
    const linha = (paginas ?? []).find((p) => Number(p.page_number) === n);
    const bruto = String(linha?.extracao_status ?? "");
    const estado: EstadoPagina = !linha
      ? "nao_registrada"
      : (ESTADOS_PAGINA as readonly string[]).includes(bruto)
        ? (bruto as EstadoPagina)
        : "em_extracao";
    return {
      page_number: n,
      estado,
      rotulo: ROTULO_PAGINA[estado],
      campos_nao_localizados: linha?.campos_nao_localizados ?? [],
      observacao_interna: linha?.observacao_interna ?? null,
      bloqueia: estado !== "extraida",
    };
  });
}

export type EstadoValidade = "vigente" | "vencida" | "substituida" | "sem_validade_registrada" | "sem_proposta";

export type LeituraValidade = {
  estado: EstadoValidade;
  validade: string | null;
  bloqueia: boolean;
  descricao: string;
  /** Decisão humana exigida — nenhuma opção é executada automaticamente. */
  decisoes_humanas: readonly ("renovar" | "substituir" | "encerrar")[];
};

export const DECISOES_VALIDADE = ["renovar", "substituir", "encerrar"] as const;

export const ROTULO_DECISAO_VALIDADE: Record<(typeof DECISOES_VALIDADE)[number], string> = {
  renovar: "Renovar a vigência comercial",
  substituir: "Substituir por nova versão da proposta",
  encerrar: "Encerrar a vigência",
};

/** Lê a validade comercial sem tratar URL externa como requisito. */
export function lerValidade(p: PropostaCanva | null | undefined, hoje = new Date()): LeituraValidade {
  if (!p)
    return {
      estado: "sem_proposta",
      validade: null,
      bloqueia: true,
      descricao: "Nenhuma proposta vinculada ao caso.",
      decisoes_humanas: DECISOES_VALIDADE,
    };
  if (p.substituida_em || p.substituida_por_id)
    return {
      estado: "substituida",
      validade: p.validade ?? null,
      bloqueia: true,
      descricao: "Proposta substituída por versão posterior: não serve como fonte de escopo.",
      decisoes_humanas: ["substituir"],
    };
  if (!p.validade)
    return {
      estado: "sem_validade_registrada",
      validade: null,
      bloqueia: true,
      descricao: "Validade comercial não registrada — ausência não vira prazo padrão.",
      decisoes_humanas: DECISOES_VALIDADE,
    };
  const vencida = new Date(p.validade) < hoje;
  return {
    estado: vencida ? "vencida" : "vigente",
    validade: p.validade,
    bloqueia: vencida,
    descricao: vencida
      ? `Validade comercial vencida em ${formatarData(p.validade)}: assinatura, financeiro, versão final e onboarding permanecem bloqueados.`
      : `Validade comercial vigente até ${formatarData(p.validade)}.`,
    decisoes_humanas: vencida ? DECISOES_VALIDADE : [],
  };
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/** Ação interna exigida pela validade vencida. Não envia mensagem nem edita Canva. */
export const ACAO_REVALIDAR = {
  tipo: "revalidacao_proposta",
  titulo: "Revalidar proposta/validade comercial",
  criticidade: "critica",
} as const;

export function detalheAcaoRevalidar(leitura: LeituraValidade): string {
  return [
    leitura.descricao,
    `Decisão humana requerida: ${leitura.decisoes_humanas.map((d) => ROTULO_DECISAO_VALIDADE[d]).join(" | ")}.`,
    "Ação interna: nenhuma mensagem é enviada, nenhum design é criado ou editado no Canva.",
  ].join(" ");
}

export type LinhaCampoSaneamento = {
  campo: string;
  label: string;
  paginas: number[];
  estado_codigo: string;
  estado_rotulo: string;
  obrigatorio: boolean;
  pendencia: boolean;
  bloqueia: boolean;
};

/** Estados por campo, sem preencher preço, pagamento ou parcelas ausentes. */
export function camposSaneados(cobertura: readonly LinhaCobertura[]): LinhaCampoSaneamento[] {
  return cobertura.map((l) => {
    const pendencia = l.estado !== "coberto";
    return {
      campo: l.campo,
      label: l.label,
      paginas: l.paginas,
      estado_codigo: CODIGO_ESTADO_CAMPO[l.estado],
      estado_rotulo: ROTULO_COBERTURA[l.estado],
      obrigatorio: l.obrigatorio,
      pendencia,
      bloqueia: pendencia && l.obrigatorio && l.estado !== "importado_a_confirmar",
    };
  });
}

export type SaneamentoProposta = {
  deck_referencia_interna: string | null;
  paginas: LinhaPagina[];
  validade: LeituraValidade;
  campos: LinhaCampoSaneamento[];
  bloqueios: { codigo: string; descricao: string }[];
  acao_humana_requerida: string | null;
};

/** Consolida o saneamento: páginas, validade, campos e bloqueios explícitos. */
export function sanearProposta(input: {
  proposta: PropostaCanva | null | undefined;
  paginas: readonly PaginaRegistrada[] | null | undefined;
  cobertura: readonly LinhaCobertura[];
  hoje?: Date;
}): SaneamentoProposta {
  const paginas = statusPaginas(input.paginas);
  const validade = lerValidade(input.proposta, input.hoje);
  const campos = camposSaneados(input.cobertura);

  const bloqueios: { codigo: string; descricao: string }[] = [];
  const paginasPendentes = paginas.filter((p) => p.bloqueia);
  if (paginasPendentes.length)
    bloqueios.push({
      codigo: "PROPOSTA_PAGINA_SEM_EXTRACAO",
      descricao: `Páginas sem extração concluída: ${paginasPendentes.map((p) => p.page_number).join(", ")}.`,
    });
  if (validade.bloqueia)
    bloqueios.push({
      codigo: validade.estado === "substituida" ? "PROPOSTA_SUBSTITUIDA" : "PROPOSTA_VALIDADE_VENCIDA",
      descricao: validade.descricao,
    });
  const obrigatoriosPendentes = campos.filter((c) => c.bloqueia);
  if (obrigatoriosPendentes.length)
    bloqueios.push({
      codigo: "ESCOPO_CAMPO_OBRIGATORIO_AUSENTE",
      descricao: `Campos obrigatórios sem cobertura: ${obrigatoriosPendentes.map((c) => c.label).join(", ")}.`,
    });

  return {
    deck_referencia_interna: input.proposta?.origem_referencia ?? null,
    paginas,
    validade,
    campos,
    bloqueios,
    acao_humana_requerida: validade.bloqueia ? detalheAcaoRevalidar(validade) : null,
  };
}
