/**
 * Planejador Universal Multipaís — regras puras do prompt canônico v2.1.
 *
 * Não inventa tabelas (`family_branch`, `research_base`, `nationality_track`).
 * Conceitos mapeiam via `DE_PARA_ENTIDADES_CADEIA`; gaps em `GAPS_SCHEMA_PENDENTES`.
 * Sem ato externo (sem cobrança, link, proposta enviada ou publicação).
 */

import {
  DE_PARA_ENTIDADES_CADEIA,
  GAPS_SCHEMA_PENDENTES,
  itemPermitidoEmRecomendacaoComercial,
  podeExporPrecoComercialmente,
  proibirPlanilhaMestreRuntime,
  type EstadoPrecoResgatado,
} from "@/lib/cadeia-catalogo-planejador";
import { skuArquivadoDecisao } from "@/lib/dicionario-skus-91";
import { PRODUTOS_PAI_CANONICOS } from "@/lib/planejador-produtos-pai";
import {
  MATRIZ_PRECOS_RESGATADOS,
  PRECO_ANA_LUIZA_AT,
  avaliarExposicaoPrecoResgatado,
  type PrecoResgatadoSpec,
} from "@/lib/precos-resgatados-matriz";

export const FASES_JORNADA_UNIVERSAL = [
  { id: "F0", nome: "Entrada" },
  { id: "F1", nome: "Diagnóstico autorizado" },
  { id: "F2", nome: "Pesquisa e prova" },
  { id: "F3", nome: "Estratégia e formalização" },
  { id: "F4", nome: "Execução" },
  { id: "F5", nome: "Pós-reconhecimento" },
  { id: "F6", nome: "Memória e legado" },
  { id: "F7", nome: "Continuidade" },
] as const;

export type FaseJornadaUniversalId = (typeof FASES_JORNADA_UNIVERSAL)[number]["id"];

export const ESTADOS_MICROENTREGA_UNIVERSAL = [
  "PLANEJADA",
  "EM_PRODUCAO",
  "EM_REVISAO",
  "APROVADA",
  "LIBERADA",
  "PUBLICADA",
  "ARQUIVADA",
] as const;

export function microentregaVisivelNoApp(status: string | null | undefined): boolean {
  return status === "LIBERADA" || status === "PUBLICADA";
}

export const ITENS_GEN_MULTI_PENDENTES = [
  "CA-GEN-MULTI-001",
  "CA-GEN-MULTI-002",
  "CA-GEN-MULTI-003",
  "CA-GEN-MULTI-004",
  "CA-GEN-MULTI-005",
  "CA-GEN-MULTI-006",
] as const;

export const ESPECIFICACOES_PAIS_PENDENTES = [
  "CA-CID-HR-001", "CA-CID-HR-002", "CA-CID-HR-003",
  "CA-CID-PT-001", "CA-CID-PT-002", "CA-CID-PT-003",
  "CA-CID-ES-001", "CA-CID-ES-002", "CA-CID-ES-003",
  "CA-CID-PL-001", "CA-CID-PL-002", "CA-CID-PL-003",
  "CA-CID-RO-001", "CA-CID-RO-002", "CA-CID-RO-003",
  "CA-CID-AT-002", "CA-CID-AT-003",
  "CA-CID-LU-001", "CA-CID-LU-002", "CA-CID-LU-003",
  "CA-CID-HU-001", "CA-CID-HU-002", "CA-CID-HU-003",
  "CA-CID-IE-001", "CA-CID-IE-002", "CA-CID-IE-003",
  "CA-NAT-BR-001", "CA-NAT-BR-002",
  "CA-NAT-FR-001", "CA-NAT-FR-002",
] as const;

export const PAISES_SEM_VALOR_INFERIDO = ["HU", "LU", "IE"] as const;

export type GatePagamentoParaCaso = {
  pagamentoConfirmado: boolean;
  onboardingConcluido: boolean;
  decisaoOperacional: boolean;
};

/** Pagamento confirmado NÃO cria caso ativo automaticamente. */
export function pagamentoAtivaCasoAutomaticamente(_gate: GatePagamentoParaCaso): boolean {
  return false;
}

export function podeAbrirCasoAtivoAposPagamento(gate: GatePagamentoParaCaso): boolean {
  return gate.pagamentoConfirmado && gate.onboardingConcluido && gate.decisaoOperacional;
}

export function diagnosticoAbreWorkspaceCompleto(_autorizado: boolean): boolean {
  return false;
}

export function upgradePodeSerSugerido(opts: {
  valorEntregue: boolean;
  itemHomologado: boolean;
  precoStatus: EstadoPrecoResgatado | null;
}): boolean {
  if (!opts.valorEntregue || !opts.itemHomologado) return false;
  return podeExporPrecoComercialmente(opts.precoStatus);
}

export type TrilhaNacionalSpec = {
  trackId: string;
  countryCode: string;
  branchId: string;
  researchBaseId: string;
};

export type EscopoIncrementalSpec = {
  trackId: string;
  itemId: string;
  amount: number;
  approvalStatus: "aprovado" | "pendente" | "rejeitado";
};

/**
 * Multipaís: base compartilhada cobrada uma vez + incrementais aprovados.
 * Nunca duplicar custo da mesma research_base.
 */
export function calcularCustoMultipais(opts: {
  basePesquisaCompartilhada: number;
  researchBaseId: string;
  trilhas: readonly TrilhaNacionalSpec[];
  incrementais: readonly EscopoIncrementalSpec[];
}): { total: number; baseCobradaVezes: number; motivoBloqueio: string | null } {
  const bases = new Set(opts.trilhas.map((t) => t.researchBaseId));
  if (bases.size !== 1 || !bases.has(opts.researchBaseId)) {
    return {
      total: 0,
      baseCobradaVezes: 0,
      motivoBloqueio:
        "Trilhas devem compartilhar a mesma research_base ou declarar bases distintas com aprovação.",
    };
  }
  const incrementais = opts.incrementais
    .filter((i) => i.approvalStatus === "aprovado")
    .reduce((acc, i) => acc + i.amount, 0);
  return {
    total: opts.basePesquisaCompartilhada + incrementais,
    baseCobradaVezes: 1,
    motivoBloqueio: null,
  };
}

export type CondicaoComercialCasoSpec = {
  conditionId: string;
  caseId: string;
  version: number;
  approvalStatus: "rascunho" | "aprovada" | "arquivada";
  honorarios: number;
  despesasTerceiros: number;
  taxasOficiais: number;
  descontos: number;
  fonteLeitura: string;
};

const FONTES_PROIBIDAS_PROPOSTA = [
  "parametros_xlsx",
  "skus_referencia_xlsx",
  "planilha_mestre",
  "ops_legado",
  "lancamentos_legados",
] as const;

export function propostaCanvaPodeLerFonte(fonte: string): { ok: boolean; motivo: string } {
  const legado = proibirPlanilhaMestreRuntime(fonte);
  if (!legado.permitido) {
    return { ok: false, motivo: legado.motivo };
  }
  if ((FONTES_PROIBIDAS_PROPOSTA as readonly string[]).includes(fonte.toLowerCase())) {
    return {
      ok: false,
      motivo: `Proposta Canva não pode ler ${fonte} — só condição comercial aprovada do caso.`,
    };
  }
  const ok =
    fonte === DE_PARA_ENTIDADES_CADEIA.condicao_comercial ||
    fonte === "commercial_conditions" ||
    fonte === "approved_offer_items" ||
    fonte === "case_commercial_condition";
  return ok
    ? { ok: true, motivo: "" }
    : {
        ok: false,
        motivo:
          "Proposta deve ler exclusivamente commercial_conditions / approved_offer_items da versão aprovada.",
      };
}

export function totalCondicaoCaso(c: CondicaoComercialCasoSpec): number | null {
  if (c.approvalStatus !== "aprovada") return null;
  const leitura = propostaCanvaPodeLerFonte(c.fonteLeitura);
  if (!leitura.ok) return null;
  return c.honorarios + c.despesasTerceiros + c.taxasOficiais - c.descontos;
}

export const CENARIO_ANA_LUIZA = {
  produtoPai: "Diagnóstico Familiar Multipaís",
  trilha: { countryCode: "AT", route: "58c" },
  condicaoParticular: PRECO_ANA_LUIZA_AT,
  referenciaCatalogoAt: 4800,
} as const;

export const CENARIO_JOAO = {
  produtoPai: "Diagnóstico de Cidadania por Etapas",
  countryCode: "PT",
  viaConfirmada: false,
  aceiteVerbal: true,
  pagamentoConfirmado: false,
  onboardingConcluido: false,
  decisaoOperacional: false,
} as const;

export const CENARIO_DANILO = {
  countryCodeReal: "HR",
  trilhasModeloARemover: ["IT", "DE"] as const,
} as const;

export function filtrarTrilhasReaisDanilo(
  trilhas: readonly { countryCode: string; origem: "real" | "modelo" }[],
): { countryCode: string; origem: "real" | "modelo" }[] {
  return trilhas.filter(
    (t) => t.origem === "real" && t.countryCode === CENARIO_DANILO.countryCodeReal,
  );
}

export function recomendacaoComercialSemCurso(itens: readonly string[]): string[] {
  return itens.filter((id) => itemPermitidoEmRecomendacaoComercial(id) && !skuArquivadoDecisao(id));
}

export function paisSemCtaLinkCobranca(
  countryCode: string,
  matriz: readonly PrecoResgatadoSpec[] = MATRIZ_PRECOS_RESGATADOS,
): boolean {
  if (!(PAISES_SEM_VALOR_INFERIDO as readonly string[]).includes(countryCode)) return false;
  const rows = matriz.filter((row) => row.countryCode === countryCode);
  if (!rows.length) return true;
  return rows.every(
    (row) =>
      !avaliarExposicaoPrecoResgatado(row).podeExpor &&
      (row.amount === null || row.priceStatus === "PENDENTE_DE_HOMOLOGACAO"),
  );
}

export function produtoPaiCanonicoPorNome(nome: string): boolean {
  return PRODUTOS_PAI_CANONICOS.some((p) => p.nome === nome);
}

export function gapResearchBaseDeclarado(): boolean {
  return GAPS_SCHEMA_PENDENTES.some((g) => g.conceito === "research_base");
}

export const PLANEJADOR_UNIVERSAL_SEM_ATO_EXTERNO = true as const;
