/**
 * Sistema operacional do dia — contrato canônico do Desk Interno.
 *
 * Converte superfícies contextuais/derivadas em fila diária explicável:
 * um item, uma chave, uma categoria de precedência, motivo, evidência,
 * responsável, prazo, próxima ação e rota. Não escreve banco, não envia
 * comunicação, não cria cobrança/assinatura/evento externo.
 *
 * Fontes vivas reaproveitadas: `montarFilasHoje` / `consolidarDia` /
 * `filaPriorizada` / `alertas-derivados` / `agenda-assistida` /
 * `override-proprietaria-comercial` / `fila-follow-up-proprietaria`.
 */

import { montarSugestaoAgenda, type SugestaoAgenda } from "@/lib/agenda-assistida";
import type { Fila, ItemFila } from "@/lib/crm-desk";
import {
  consolidarDia,
  hojeISO,
  somarDias,
  type ItemDia,
} from "@/lib/painel-dia";
import {
  FIXTURES_FOLLOW_UP_PROPRIETARIA,
  montarFilaFollowUp,
  type EntradaFollowUp,
  type ItemFollowUp,
} from "@/lib/fila-follow-up-proprietaria";
import {
  ACOES_JAMAIS_LIBERADAS_POR_OVERRIDE,
  estadoOverride,
  type EstadoOverride,
} from "@/lib/override-proprietaria-comercial";

/* ------------------------------------------------------------------ */
/* Classificação de capacidade (aceite do prompt)                      */
/* ------------------------------------------------------------------ */

export const CLASSIFICACOES_CAPACIDADE = [
  "OPERACIONAL",
  "CONTEXTO",
  "LEITURA_DERIVADA",
  "PENDENTE_DE_DADO",
  "BLOQUEADO_POR_GATILHO",
  "PENDENTE_DE_DECISAO_PROPRIETARIA",
  "PENDENTE_DE_VALIDACAO_PUBLICADA",
] as const;
export type ClassificacaoCapacidade = (typeof CLASSIFICACOES_CAPACIDADE)[number];

/* ------------------------------------------------------------------ */
/* Categorias mínimas (precedência: menor número = maior prioridade)   */
/* ------------------------------------------------------------------ */

export const CATEGORIAS_OPERACIONAIS = [
  "proxima_acao_caso",
  "gates_ativacao_formalizacao",
  "comercial_followup",
  "cadencia_touchpoints",
  "contrato_os_anexos",
  "financeiro_reconciliacao",
  "pesquisa_documentos_evidencias",
  "conteudo_microentregas",
  "excecoes_proprietaria_expirando",
  "falhas_dado_integracao",
] as const;
export type CategoriaOperacional = (typeof CATEGORIAS_OPERACIONAIS)[number];

export const ROTULO_CATEGORIA_OPERACIONAL: Record<CategoriaOperacional, string> = {
  proxima_acao_caso: "Próxima ação de caso",
  gates_ativacao_formalizacao: "Gates de ativação e formalização",
  comercial_followup: "Comercial e follow-up",
  cadencia_touchpoints: "Cadência / touchpoints",
  contrato_os_anexos: "Contrato, OS e anexos",
  financeiro_reconciliacao: "Financeiro e reconciliação (leitura)",
  pesquisa_documentos_evidencias: "Pesquisa, documentos e evidências",
  conteudo_microentregas: "Conteúdo / microentregas a revisar",
  excecoes_proprietaria_expirando: "Exceções da Proprietária perto de expirar",
  falhas_dado_integracao: "Falhas de dado, integração ou leitura",
};

/** Precedência exclusiva: um objeto canônico aparece só na categoria de maior peso. */
export const PRECEDENCIA_CATEGORIA: Record<CategoriaOperacional, number> = {
  falhas_dado_integracao: 1,
  gates_ativacao_formalizacao: 2,
  proxima_acao_caso: 3,
  contrato_os_anexos: 4,
  financeiro_reconciliacao: 5,
  comercial_followup: 6,
  cadencia_touchpoints: 7,
  pesquisa_documentos_evidencias: 8,
  conteudo_microentregas: 9,
  excecoes_proprietaria_expirando: 10,
};

export const ESTADOS_ITEM_OPERACIONAL = [
  "pendente",
  "bloqueado",
  "em_atencao",
  "critico",
  "aguardando_externo",
  "nao_se_aplica",
] as const;
export type EstadoItemOperacional = (typeof ESTADOS_ITEM_OPERACIONAL)[number];

export const TIPOS_ACAO_OPERACIONAL = [
  "somente_leitura",
  "acao_interna_permitida",
  "decisao_proprietaria",
  "acao_externa_bloqueada",
  "nao_disponivel",
] as const;
export type TipoAcaoOperacional = (typeof TIPOS_ACAO_OPERACIONAL)[number];

export const INDICADORES_ORIGEM = [
  "real",
  "demo",
  "previsao",
  "hipotese",
  "pendente_de_dado",
] as const;
export type IndicadorOrigem = (typeof INDICADORES_ORIGEM)[number];

export type ItemOperacionalDia = {
  /** Chave canônica de deduplicação: `tipo:id` ou chave estável de falha. */
  id: string;
  categoria: CategoriaOperacional;
  prioridade: number;
  estado: EstadoItemOperacional;
  objetoTipo: "lead" | "caso" | "override" | "sistema" | "agenda";
  objetoId: string | null;
  rotulo: string;
  motivo: string;
  evidencia: string;
  atualizadoEm: string | null;
  responsavel: string | null;
  prazo: string | null;
  regraPrazo: string | null;
  proximaAcao: string;
  rotaDestino: string;
  tipoAcao: TipoAcaoOperacional;
  origem: IndicadorOrigem;
  /** Quando tipoAcao = nao_disponivel: o que falta para a ação existir. */
  dependeDe: string | null;
  classificacao: ClassificacaoCapacidade;
};

/* ------------------------------------------------------------------ */
/* Mapeamento das filas existentes → categorias                        */
/* ------------------------------------------------------------------ */

const FILA_PARA_CATEGORIA: Record<string, CategoriaOperacional> = {
  acoes_vencidas: "comercial_followup",
  acoes_hoje: "comercial_followup",
  leads_sem_responsavel: "falhas_dado_integracao",
  leads_sem_proxima_acao: "comercial_followup",
  calls_hoje: "comercial_followup",
  propostas_sem_followup: "comercial_followup",
  contratos_enviados_pendentes: "contrato_os_anexos",
  pagamentos_aguardados: "financeiro_reconciliacao",
  onboardings_pendentes: "gates_ativacao_formalizacao",
  leads_sem_origem: "falhas_dado_integracao",
  discoveries_sem_desdobramento: "comercial_followup",
  aceites_sem_confirmacao: "comercial_followup",
  cadeia_operacional: "proxima_acao_caso",
  casos_pendencia_documental: "pesquisa_documentos_evidencias",
};

export function categoriaDaFila(chaveFila: string): CategoriaOperacional {
  return FILA_PARA_CATEGORIA[chaveFila] ?? "falhas_dado_integracao";
}

export function rotaCanonicoDoObjeto(
  tipo: "lead" | "caso" | "override" | "sistema" | "agenda",
  id: string | null,
  categoria: CategoriaOperacional,
): string {
  if (tipo === "caso" && id) return `/casos/${id}`;
  if (tipo === "lead" && id) return `/calls?lead=${id}`;
  if (tipo === "override") return "/contratos";
  switch (categoria) {
    case "comercial_followup":
      return "/calls";
    case "contrato_os_anexos":
      return "/contratos";
    case "financeiro_reconciliacao":
      return "/financeiro";
    case "pesquisa_documentos_evidencias":
      return "/casos";
    case "conteudo_microentregas":
      return "/atendimento";
    case "cadencia_touchpoints":
      return "/ops";
    case "gates_ativacao_formalizacao":
      return "/casos";
    case "excecoes_proprietaria_expirando":
      return "/contratos";
    default:
      return "/painel";
  }
}

function eDemoRotulo(rotulo: string): boolean {
  return /demo|demonstra|fixture|teste/i.test(rotulo);
}

function estadoDePrazo(prazo: string | null, hoje: string, bloqueado: boolean): EstadoItemOperacional {
  if (bloqueado) return "bloqueado";
  if (!prazo) return "em_atencao";
  if (prazo < hoje) return "critico";
  if (prazo === hoje) return "em_atencao";
  return "pendente";
}

function tipoAcaoDaCategoria(
  categoria: CategoriaOperacional,
  semResponsavel: boolean,
): TipoAcaoOperacional {
  if (categoria === "financeiro_reconciliacao") return "somente_leitura";
  if (categoria === "excecoes_proprietaria_expirando") return "decisao_proprietaria";
  if (categoria === "falhas_dado_integracao" && semResponsavel) return "acao_interna_permitida";
  if (categoria === "contrato_os_anexos") return "acao_interna_permitida";
  if (categoria === "comercial_followup") return "acao_interna_permitida";
  if (categoria === "proxima_acao_caso") return "acao_interna_permitida";
  return "somente_leitura";
}

/** Converte um ItemFila + chave de fila em ItemOperacionalDia. */
export function itemFilaParaOperacional(
  filaChave: string,
  item: ItemFila,
  hoje = hojeISO(),
): ItemOperacionalDia {
  const categoria = categoriaDaFila(filaChave);
  const demo = eDemoRotulo(item.rotulo);
  const prazo = item.data ? String(item.data).slice(0, 10) : null;
  const bloqueado =
    categoria === "gates_ativacao_formalizacao" ||
    categoria === "contrato_os_anexos" ||
    categoria === "financeiro_reconciliacao";
  const objetoTipo = item.tipo;
  return {
    id: `${objetoTipo}:${item.id}`,
    categoria,
    prioridade: PRECEDENCIA_CATEGORIA[categoria],
    estado: estadoDePrazo(prazo, hoje, bloqueado && !prazo),
    objetoTipo,
    objetoId: item.id,
    rotulo: item.rotulo,
    motivo: item.detalhe,
    evidencia: `fila:${filaChave}`,
    atualizadoEm: prazo,
    responsavel: item.responsavel,
    prazo,
    regraPrazo: prazo ? "data da próxima ação registrada" : "prazo ausente — falha de qualidade",
    proximaAcao: item.detalhe,
    rotaDestino: rotaCanonicoDoObjeto(objetoTipo, item.id, categoria),
    tipoAcao: tipoAcaoDaCategoria(categoria, !item.responsavel),
    origem: demo ? "demo" : "real",
    dependeDe: null,
    classificacao: demo ? "CONTEXTO" : "OPERACIONAL",
  };
}

/** Enriquece ItemDia consolidado com o contrato operacional (UI). */
export function enriquecerItemDia(
  item: ItemDia,
  opcoes?: { categoria?: CategoriaOperacional; evidencia?: string; hoje?: string },
): ItemOperacionalDia {
  const hoje = opcoes?.hoje ?? hojeISO();
  const categoria = opcoes?.categoria ?? (item.tipo === "caso" ? "proxima_acao_caso" : "comercial_followup");
  const bloqueado = item.bloqueios.length > 0 && item.semPrazo;
  return {
    id: `${item.tipo}:${item.id}`,
    categoria,
    prioridade: PRECEDENCIA_CATEGORIA[categoria],
    estado: estadoDePrazo(item.data, hoje, bloqueado),
    objetoTipo: item.tipo,
    objetoId: item.id,
    rotulo: item.rotulo,
    motivo: item.acao,
    evidencia: opcoes?.evidencia ?? (item.origemAcao ? `proxima_acao:${item.origemAcao}` : "consolidarDia"),
    atualizadoEm: item.data,
    responsavel: item.responsavel,
    prazo: item.data,
    regraPrazo: item.data ? "prazo da ação consolidada" : "Sem prazo definido",
    proximaAcao: item.acao,
    rotaDestino: rotaCanonicoDoObjeto(item.tipo, item.id, categoria),
    tipoAcao: item.semResponsavel
      ? "acao_interna_permitida"
      : tipoAcaoDaCategoria(categoria, false),
    origem: item.demo ? "demo" : "real",
    dependeDe: null,
    classificacao: item.demo ? "CONTEXTO" : "OPERACIONAL",
  };
}

/**
 * Fila canônica deduplicada: um id → uma categoria (maior precedência).
 * Demo fora por padrão. Falha de leitura não vira item "resolvido".
 */
export function montarFilaCanonicaOperacional(
  filas: Fila[],
  opcoes?: { incluirDemo?: boolean; hoje?: string; falhaLeitura?: string | null },
): ItemOperacionalDia[] {
  const hoje = opcoes?.hoje ?? hojeISO();
  const mapa = new Map<string, ItemOperacionalDia>();

  if (opcoes?.falhaLeitura) {
    const falha: ItemOperacionalDia = {
      id: "sistema:falha-leitura",
      categoria: "falhas_dado_integracao",
      prioridade: PRECEDENCIA_CATEGORIA.falhas_dado_integracao,
      estado: "critico",
      objetoTipo: "sistema",
      objetoId: null,
      rotulo: "Falha de leitura do dia",
      motivo: opcoes.falhaLeitura,
      evidencia: "erro de consulta — não interpretar como fila vazia",
      atualizadoEm: hoje,
      responsavel: null,
      prazo: hoje,
      regraPrazo: "imediato",
      proximaAcao: "Corrigir a fonte de leitura e recarregar o Painel",
      rotaDestino: "/painel",
      tipoAcao: "nao_disponivel",
      origem: "pendente_de_dado",
      dependeDe: "consulta do Painel Hoje sem erro",
      classificacao: "PENDENTE_DE_DADO",
    };
    return [falha];
  }

  for (const fila of filas) {
    for (const item of fila.itens) {
      const op = itemFilaParaOperacional(fila.chave, item, hoje);
      if (!opcoes?.incluirDemo && op.origem === "demo") continue;
      const atual = mapa.get(op.id);
      if (!atual || op.prioridade < atual.prioridade) mapa.set(op.id, op);
    }
  }

  return [...mapa.values()].sort(
    (a, b) =>
      a.prioridade - b.prioridade ||
      (a.prazo ?? "9999").localeCompare(b.prazo ?? "9999") ||
      a.rotulo.localeCompare(b.rotulo),
  );
}

/** Garante que nenhum id aparece duas vezes na fila canônica. */
export function idsDuplicadosNaFila(itens: readonly ItemOperacionalDia[]): string[] {
  const visto = new Set<string>();
  const dups: string[] = [];
  for (const i of itens) {
    if (visto.has(i.id)) dups.push(i.id);
    visto.add(i.id);
  }
  return dups;
}

/* ------------------------------------------------------------------ */
/* Agenda assistida derivada do dia (só rascunhos internos)            */
/* ------------------------------------------------------------------ */

export type EntradaAgendaDoDia = {
  titulo: string;
  objetivo: string;
  pessoaOuCaso: string;
  responsavel: string | null;
  janelaInicio: string | null;
  janelaFim: string | null;
  duracaoMinutos: number | null;
  motivo: string;
  pauta: string;
  rota: string;
  dependencias: string[];
  confirmadoPelaProprietaria?: boolean;
};

export function sugerirAgendaDoDia(entrada: EntradaAgendaDoDia): SugestaoAgenda {
  return montarSugestaoAgenda({
    titulo: entrada.titulo,
    objetivo: entrada.objetivo,
    participantesPropostos: [entrada.pessoaOuCaso, entrada.responsavel ?? "Equipe"].filter(Boolean),
    janela:
      entrada.janelaInicio && entrada.janelaFim
        ? { inicio: entrada.janelaInicio, fim: entrada.janelaFim }
        : null,
    duracaoMinutos: entrada.duracaoMinutos,
    contexto: entrada.motivo,
    rotaDoObjeto: entrada.rota,
    dependencias: entrada.dependencias,
    textoPauta: entrada.pauta,
    destino: "interno",
    confirmadoPelaProprietaria: Boolean(entrada.confirmadoPelaProprietaria),
    cancelado: false,
  });
}

/**
 * Deriva sugestões de agenda a partir de itens operacionais já deduplicados.
 * Nunca cria evento externo. Itens sem pessoa/caso ficam de fora.
 */
export function derivarAgendaDoPainel(
  itens: readonly ItemOperacionalDia[],
  jaExibidos?: Set<string>,
): SugestaoAgenda[] {
  const sugestoes: SugestaoAgenda[] = [];
  for (const i of itens) {
    if (jaExibidos?.has(i.id)) continue;
    if (i.objetoTipo !== "lead" && i.objetoTipo !== "caso") continue;
    if (
      i.categoria !== "comercial_followup" &&
      i.categoria !== "cadencia_touchpoints" &&
      i.categoria !== "excecoes_proprietaria_expirando" &&
      i.categoria !== "contrato_os_anexos"
    ) {
      continue;
    }
    sugestoes.push(
      sugerirAgendaDoDia({
        titulo: `Acompanhar — ${i.rotulo}`,
        objetivo: i.proximaAcao,
        pessoaOuCaso: i.rotulo,
        responsavel: i.responsavel,
        janelaInicio: i.prazo ? `${i.prazo}T14:00:00.000Z` : null,
        janelaFim: i.prazo ? `${i.prazo}T15:00:00.000Z` : null,
        duracaoMinutos: 30,
        motivo: i.motivo,
        pauta: `Revisar pendência interna: ${i.motivo}. Evidência: ${i.evidencia}.`,
        rota: i.rotaDestino,
        dependencias: i.dependeDe ? [i.dependeDe] : [],
      }),
    );
  }
  return sugestoes;
}

/* ------------------------------------------------------------------ */
/* Override perto de expirar → item operacional                        */
/* ------------------------------------------------------------------ */

export type OverrideParaPainel = {
  id: string;
  casoId: string;
  rotulo: string;
  dataRevisao: string;
  condicaoOriginal: string;
  escopoLiberado: string[];
  revogadoEm?: string | null;
};

export function itensOverrideExpirando(
  overrides: readonly OverrideParaPainel[],
  opcoes?: { hoje?: string; diasAlerta?: number },
): ItemOperacionalDia[] {
  const hoje = opcoes?.hoje ?? hojeISO();
  const dias = opcoes?.diasAlerta ?? 7;
  const limite = somarDias(hoje, dias);
  const out: ItemOperacionalDia[] = [];

  for (const o of overrides) {
    const estado: EstadoOverride = estadoOverride({
      dataRevisao: o.dataRevisao,
      revogadoEm: o.revogadoEm,
      agora: `${hoje}T12:00:00.000Z`,
    });
    if (estado === "REVOGADO") continue;
    const revisao = o.dataRevisao.slice(0, 10);
    const perto = estado === "EXPIRADO_AGUARDA_REVISAO" || (revisao >= hoje && revisao <= limite);
    if (!perto) continue;

    out.push({
      id: `override:${o.id}`,
      categoria: "excecoes_proprietaria_expirando",
      prioridade: PRECEDENCIA_CATEGORIA.excecoes_proprietaria_expirando,
      estado: estado === "EXPIRADO_AGUARDA_REVISAO" ? "critico" : "em_atencao",
      objetoTipo: "override",
      objetoId: o.id,
      rotulo: o.rotulo,
      motivo:
        estado === "EXPIRADO_AGUARDA_REVISAO"
          ? "Override expirado — aguarda revisão da Proprietária"
          : "Override próximo da data de revisão",
      evidencia: `condicao_original:${o.condicaoOriginal}; escopo:${o.escopoLiberado.join(",")}`,
      atualizadoEm: revisao,
      responsavel: "Proprietária administradora",
      prazo: revisao,
      regraPrazo: "data_revisao do override",
      proximaAcao: "Revisar, renovar ou revogar a exceção — sem efeito externo automático",
      rotaDestino: rotaCanonicoDoObjeto("override", o.casoId, "excecoes_proprietaria_expirando"),
      tipoAcao: "decisao_proprietaria",
      origem: "real",
      dependeDe: null,
      classificacao: "OPERACIONAL",
    });
  }
  return out;
}

/** Política: override nunca libera ações externas listadas. */
export function overrideNuncaLiberaAcaoExterna(acao: string): boolean {
  return (ACOES_JAMAIS_LIBERADAS_POR_OVERRIDE as readonly string[]).includes(acao);
}

/* ------------------------------------------------------------------ */
/* Follow-up proprietária (fixtures de referência, sem escrita)        */
/* ------------------------------------------------------------------ */

export function filaFollowUpReferencia(): ItemFollowUp[] {
  return montarFilaFollowUp(FIXTURES_FOLLOW_UP_PROPRIETARIA as EntradaFollowUp[]);
}

export function followUpParaOperacional(item: ItemFollowUp): ItemOperacionalDia {
  const categoria: CategoriaOperacional =
    item.motivo === "override_proximo_da_expiracao"
      ? "excecoes_proprietaria_expirando"
      : item.motivo === "vencimento_financeiro"
        ? "financeiro_reconciliacao"
        : item.motivo === "cadencia_vencida"
          ? "cadencia_touchpoints"
          : "comercial_followup";
  return {
    id: `followup:${item.chave}`,
    categoria,
    prioridade: PRECEDENCIA_CATEGORIA[categoria],
    estado: item.prioridade === 1 ? "critico" : item.prioridade === 2 ? "em_atencao" : "pendente",
    objetoTipo: item.casoId ? "caso" : "lead",
    objetoId: item.casoId ?? item.pessoaOuCasoId,
    rotulo: item.pessoa,
    motivo: item.estado,
    evidencia: item.evidenciaOrigem,
    atualizadoEm: item.prazo,
    responsavel: item.responsavel,
    prazo: item.prazo,
    regraPrazo: item.prazo ? "prazo do follow-up" : null,
    proximaAcao: item.recomendacao,
    rotaDestino: item.rotaDestino,
    tipoAcao:
      item.motivo === "override_proximo_da_expiracao" || item.motivo === "vencimento_financeiro"
        ? "decisao_proprietaria"
        : "acao_interna_permitida",
    origem: "demo",
    dependeDe: null,
    classificacao: "CONTEXTO",
  };
}

/* ------------------------------------------------------------------ */
/* Matriz de validação autenticada do Portal (roteiro, sem prova falsa)*/
/* ------------------------------------------------------------------ */

export const CHECKS_PORTAL_AUTENTICADO = [
  {
    id: "login_homologacao",
    rotulo: "Login de cliente de homologação",
    resultadoPadrao: "NAO_COMPROVADO_NO_DOMINIO_PUBLICADO" as const,
  },
  {
    id: "caso_autorizado",
    rotulo: "Caso autorizado visível",
    resultadoPadrao: "NAO_COMPROVADO_NO_DOMINIO_PUBLICADO" as const,
  },
  {
    id: "bloqueio_caso_alheio",
    rotulo: "Bloqueio de caso alheio",
    resultadoPadrao: "NAO_COMPROVADO_NO_DOMINIO_PUBLICADO" as const,
  },
  {
    id: "estado_vazio_seguro",
    rotulo: "Estado vazio seguro",
    resultadoPadrao: "NAO_COMPROVADO_NO_DOMINIO_PUBLICADO" as const,
  },
  {
    id: "conteudo_sanitizado",
    rotulo: "Conteúdo sanitizado publicado",
    resultadoPadrao: "NAO_COMPROVADO_NO_DOMINIO_PUBLICADO" as const,
  },
  {
    id: "ausencia_dado_interno",
    rotulo: "Ausência de dado interno, preço, SKU, gate, SLA, hipótese e fonte bruta",
    resultadoPadrao: "NAO_COMPROVADO_NO_DOMINIO_PUBLICADO" as const,
  },
  {
    id: "sessao_apos_reload",
    rotulo: "Persistência da sessão após reload",
    resultadoPadrao: "NAO_COMPROVADO_NO_DOMINIO_PUBLICADO" as const,
  },
] as const;

export type ResultadoCheckPortal =
  | "PASSOU"
  | "FALHOU"
  | "NAO_COMPROVADO_NO_DOMINIO_PUBLICADO"
  | "BLOQUEADO_POR_DADO"
  | "BLOQUEADO_POR_DECISAO";

/**
 * HTTP 200 da casca SPA nunca prova portal autenticado.
 * Sem sessão autorizada, todos os checks permanecem NAO_COMPROVADO.
 */
export function matrizValidacaoPortal(input: {
  sessaoClienteAutorizada: boolean;
  resultados?: Partial<Record<(typeof CHECKS_PORTAL_AUTENTICADO)[number]["id"], ResultadoCheckPortal>>;
}): { checks: { id: string; rotulo: string; resultado: ResultadoCheckPortal }[]; comprovado: boolean } {
  const checks = CHECKS_PORTAL_AUTENTICADO.map((c) => {
    if (!input.sessaoClienteAutorizada) {
      return { id: c.id, rotulo: c.rotulo, resultado: c.resultadoPadrao };
    }
    return {
      id: c.id,
      rotulo: c.rotulo,
      resultado: input.resultados?.[c.id] ?? ("BLOQUEADO_POR_DADO" as ResultadoCheckPortal),
    };
  });
  const comprovado =
    input.sessaoClienteAutorizada && checks.every((c) => c.resultado === "PASSOU");
  return { checks, comprovado };
}

/* ------------------------------------------------------------------ */
/* Inventário de capacidades do sistema do dia                         */
/* ------------------------------------------------------------------ */

export type LinhaCapacidadeDia = {
  capacidade: string;
  classificacao: ClassificacaoCapacidade;
  rota: string;
  evidencia: string;
  lacuna: string | null;
};

export const INVENTARIO_CAPACIDADES_DIA: readonly LinhaCapacidadeDia[] = [
  {
    capacidade: "Painel Hoje — fila canônica deduplicada",
    classificacao: "OPERACIONAL",
    rota: "/painel",
    evidencia: "montarFilaCanonicaOperacional + consolidarDia + PainelDia",
    lacuna: null,
  },
  {
    capacidade: "Próxima ação com rota e responsável",
    classificacao: "OPERACIONAL",
    rota: "/painel",
    evidencia: "ItemOperacionalDia + RPC proxima_acao_prioritaria (texto)",
    lacuna: "Unificar 100% dos casos via RPC — decisão proprietária",
  },
  {
    capacidade: "Gates ativação / formalização na fila",
    classificacao: "LEITURA_DERIVADA",
    rota: "/casos",
    evidencia: "gates-ativacao-ficha + filas onboardings/contratos",
    lacuna: null,
  },
  {
    capacidade: "Comercial diário (rascunhos, sem envio)",
    classificacao: "OPERACIONAL",
    rota: "/calls",
    evidencia: "comercialHoje + fila-comunicacao (rascunho)",
    lacuna: "Envio externo permanece bloqueado",
  },
  {
    capacidade: "Agenda assistida no Painel",
    classificacao: "LEITURA_DERIVADA",
    rota: "/painel",
    evidencia: "derivarAgendaDoPainel → RASCUNHO_INTERNO",
    lacuna: "Criação de evento externo exige autorização posterior",
  },
  {
    capacidade: "Override proprietária auditável",
    classificacao: "OPERACIONAL",
    rota: "/contratos",
    evidencia: "override-proprietaria-comercial + owner_override_events",
    lacuna: "Não aplicar em dado real sem confirmação específica",
  },
  {
    capacidade: "Financeiro no Desk (leitura)",
    classificacao: "LEITURA_DERIVADA",
    rota: "/financeiro",
    evidencia: "fila pagamentos_aguardados → somente_leitura",
    lacuna: "Sem criar cobrança/link Asaas",
  },
  {
    capacidade: "Contrato/OS preparação interna",
    classificacao: "OPERACIONAL",
    rota: "/contratos",
    evidencia: "estadoArtefatoMaterializacao + painel preparação",
    lacuna: "Assinatura/envio externos bloqueados",
  },
  {
    capacidade: "Pesquisa / evidências / microentregas",
    classificacao: "LEITURA_DERIVADA",
    rota: "/casos",
    evidencia: "casos_pendencia_documental + cadeia pesquisa",
    lacuna: "Sem pesquisa externa nesta fatia",
  },
  {
    capacidade: "Portal cliente — isolamento",
    classificacao: "PENDENTE_DE_VALIDACAO_PUBLICADA",
    rota: "/portal",
    evidencia: "matrizValidacaoPortal — HTTP 200 SPA ≠ prova",
    lacuna: "Prova autenticada da proprietária no domínio publicado",
  },
  {
    capacidade: "Card SLA em risco",
    classificacao: "PENDENTE_DE_DADO",
    rota: "/ops",
    evidencia: "cardsHoje.sla_em_risco = null (fonte não carregada)",
    lacuna: "Carregar tarefas.sla_status / microentregas sem inventar zero",
  },
  {
    capacidade: "Taxonomia Desk 6 vs 8 grupos",
    classificacao: "PENDENTE_DE_DECISAO_PROPRIETARIA",
    rota: "/painel",
    evidencia: "GRUPOS_DESK no código = 6; AGENTS.md cita 8",
    lacuna: "Certificação explícita da proprietária",
  },
] as const;

export function contarCapacidadesPorClassificacao(): Record<ClassificacaoCapacidade, number> {
  const base = Object.fromEntries(CLASSIFICACOES_CAPACIDADE.map((c) => [c, 0])) as Record<
    ClassificacaoCapacidade,
    number
  >;
  for (const l of INVENTARIO_CAPACIDADES_DIA) base[l.classificacao] += 1;
  return base;
}

/** Caracterização: consolidarDia + fila operacional compartilham a mesma chave. */
export function chavesAlinhadasComConsolidacao(
  filas: Fila[],
  opcoes?: { incluirDemo?: boolean },
): { consolidados: string[]; operacionais: string[]; soConsolidados: string[]; soOperacionais: string[] } {
  const consolidados = consolidarDia(filas, opcoes).map((i) => `${i.tipo}:${i.id}`).sort();
  const operacionais = montarFilaCanonicaOperacional(filas, opcoes).map((i) => i.id).sort();
  const setC = new Set(consolidados);
  const setO = new Set(operacionais);
  return {
    consolidados,
    operacionais,
    soConsolidados: consolidados.filter((k) => !setO.has(k)),
    soOperacionais: operacionais.filter((k) => !setC.has(k)),
  };
}

export const SISTEMA_DIA_NUNCA_ESCREVE_EXTERNO = true as const;
