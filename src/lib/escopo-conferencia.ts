/**
 * Conferência de escopo da proposta Canva — lógica pura reutilizada pela
 * server function conferirEscopoProposta e pelo painel de preparação.
 *
 * Não infere campo ausente, não lê conteúdo fora dos campos fechados de
 * src/lib/escopo-proposta.ts e produz auditoria sanitizada (sem URL do Canva,
 * conteúdo integral, dado pessoal, anexo bruto, token ou link sensível).
 */

import {
  CAMPOS_ESCOPO_PROPOSTA,
  MAPA_ESCOPO_DESTINO,
  PAGINAS_PROPOSTA,
  extrairEscopoDaProposta,
  mapaCoberturaEscopo,
  validarPropostaCanva,
  type PropostaCanva,
  type ValorFicha,
} from "@/lib/escopo-proposta";
import {
  avaliarGates,
  proximaAcaoRecomendada,
  type ContextoGates,
} from "@/lib/gates-formalizacao";
import type { ConferenciaPrecoCanonico } from "@/lib/preco-canonico";
import { pendenciasDespesa, type Despesa } from "@/lib/despesas-terceiros";

export type StatusConferencia = "aprovado_para_preparacao" | "bloqueado" | "requer_revisao";

export type ConflitoConferencia = { codigo: string; campo: string; descricao: string };
export type BloqueioConferencia = { codigo: string; descricao: string };

export type ResultadoConferencia = {
  status: StatusConferencia;
  proposal_id: string | null;
  proposal_version: number | null;
  origin: "Canva";
  paginas_usadas: number[];
  campos_extraidos: { campo: string; label: string; paginas: number[] }[];
  campos_ausentes: { campo: string; label: string; paginas: number[]; obrigatorio: boolean }[];
  conflitos: ConflitoConferencia[];
  bloqueios: BloqueioConferencia[];
  anexos_afetados: string[];
  proxima_acao_recomendada: string;
  gates: ReturnType<typeof avaliarGates>;
};

export type EntradaConferencia = {
  caseId: string;
  proposta: PropostaCanva | null | undefined;
  valores: ValorFicha[];
  caseService: { id: string; product_catalog_id: string | null; status: string | null; preco_acordado: number | null } | null;
  preco: ConferenciaPrecoCanonico;
  nucleo: { validado: boolean; menorEnvolvido: boolean; representacaoRegistrada: boolean; cadastroCompleto: boolean };
  checklist: {
    revisaoJuridicaOk: boolean;
    contratoOsProntos: boolean;
    assinaturaRegistrada: boolean;
    pagamentoConfirmado: boolean;
    autorizacaoPesquisa: boolean;
  };
  despesas: Despesa[];
  /** Dependentes com representação pendente que participam de contrato, App ou anexo. */
  dependentesPendentes?: string[];
  /** Temas jurídicos bloqueantes ainda sem decisão registrada. */
  temasJuridicosBloqueantes?: string[];
  hoje?: Date;
};

export function conferirEscopo(e: EntradaConferencia): ResultadoConferencia {
  const validade = validarPropostaCanva(e.proposta, e.caseId, e.hoje);
  const extraidos = extrairEscopoDaProposta(e.proposta);
  const cobertura = mapaCoberturaEscopo({ proposta: e.proposta, extraidos, valores: e.valores });

  const campos_extraidos = extraidos
    .filter((c) => c.localizado)
    .map((c) => ({ campo: c.campo, label: c.label, paginas: c.paginas }));
  const campos_ausentes = extraidos
    .filter((c) => !c.localizado)
    .map((c) => ({ campo: c.campo, label: c.label, paginas: c.paginas, obrigatorio: c.obrigatorio }));

  const conflitos: ConflitoConferencia[] = cobertura
    .filter((l) => l.estado === "divergente")
    .map((l) => ({ codigo: "CONFLITO_ESCOPO_PROPOSTA", campo: l.campo, descricao: l.divergencia ?? `Divergência em ${l.label}.` }));

  for (const d of e.preco.divergencias) {
    conflitos.push({ codigo: "CONFLITO_PRECO_ORIGEM", campo: "valor_total", descricao: d.mensagem });
  }

  const paginasDeclaradas = new Set((e.proposta?.paginas_registradas ?? []).map(Number));
  const paginas_usadas = [...new Set(campos_extraidos.flatMap((c) => c.paginas))].sort((a, b) => a - b);
  const paginasForaDoIntervalo = [...paginasDeclaradas].filter((p) => !(PAGINAS_PROPOSTA as readonly number[]).includes(p));

  const bloqueios: BloqueioConferencia[] = [];
  for (const m of validade.motivos) bloqueios.push({ codigo: "PROPOSTA_INVALIDA", descricao: m });
  if (paginasForaDoIntervalo.length)
    bloqueios.push({
      codigo: "PROPOSTA_PAGINA_FORA_DO_INTERVALO",
      descricao: `Páginas fora de 1–7 registradas: ${paginasForaDoIntervalo.join(", ")}.`,
    });
  const obrigatoriosAusentes = campos_ausentes.filter((c) => c.obrigatorio);
  if (obrigatoriosAusentes.length)
    bloqueios.push({
      codigo: "ESCOPO_CAMPO_OBRIGATORIO_AUSENTE",
      descricao: `${obrigatoriosAusentes.length} campo(s) obrigatório(s) não localizado(s): ${obrigatoriosAusentes
        .map((c) => c.label)
        .join(", ")}.`,
    });
  if (conflitos.length)
    bloqueios.push({ codigo: "CONFLITO_NAO_RESOLVIDO", descricao: `${conflitos.length} conflito(s) aguardando revisão humana.` });
  if (!e.caseService) bloqueios.push({ codigo: "CASE_SERVICE_AUSENTE", descricao: "Caso sem case_service (produto-pai/trilha)." });
  for (const b of e.preco.bloqueios) bloqueios.push(b);

  const despesasAplicaveis = e.despesas.some((d) => d.estado !== "nao_aplicavel");
  const despesasPendentes = e.despesas.flatMap((d) => pendenciasDespesa(d));
  if ((e.dependentesPendentes ?? []).length)
    bloqueios.push({
      codigo: "DEPENDENTE_REPRESENTACAO_PENDENTE",
      descricao: `${(e.dependentesPendentes ?? []).length} dependente(s) com representação pendente participando de contrato, App ou anexo.`,
    });
  if ((e.temasJuridicosBloqueantes ?? []).length)
    bloqueios.push({
      codigo: "TEMA_JURIDICO_PENDENTE",
      descricao: `${(e.temasJuridicosBloqueantes ?? []).length} tema(s) jurídico(s) bloqueante(s) sem decisão registrada.`,
    });
  if (despesasAplicaveis && despesasPendentes.length)
    bloqueios.push({
      codigo: "DESPESA_TERCEIRO_PENDENTE",
      descricao: `${despesasPendentes.length} pendência(s) em despesas de terceiros.`,
    });

  const anexos_afetados = [
    ...new Set(
      [...campos_extraidos, ...campos_ausentes].flatMap(
        (c) => MAPA_ESCOPO_DESTINO.find((m) => m.campo === c.campo)?.anexos ?? [],
      ),
    ),
  ].sort();

  const contexto: ContextoGates = {
    propostaValida: validade.valida,
    propostaMotivos: validade.motivos,
    camposAusentes: obrigatoriosAusentes.map((c) => c.label),
    conflitos: conflitos.map((c) => c.descricao),
    precoOk: e.preco.ok,
    precoMotivos: e.preco.bloqueios.map((b) => b.descricao),
    caseServiceOk: Boolean(e.caseService),
    cadastroCompleto: e.nucleo.cadastroCompleto,
    nucleoValidado: e.nucleo.validado,
    menorEnvolvido: e.nucleo.menorEnvolvido,
    representacaoRegistrada: e.nucleo.representacaoRegistrada,
    revisaoJuridicaOk: e.checklist.revisaoJuridicaOk,
    contratoOsProntos: e.checklist.contratoOsProntos,
    assinaturaRegistrada: e.checklist.assinaturaRegistrada,
    pagamentoConfirmado: e.checklist.pagamentoConfirmado,
    autorizacaoPesquisa: e.checklist.autorizacaoPesquisa,
    despesasAplicaveis,
    despesasPendentes,
    dependentesPendentes: e.dependentesPendentes ?? [],
    temasJuridicosBloqueantes: e.temasJuridicosBloqueantes ?? [],
  };

  const impeditivos = bloqueios.filter((b) => b.codigo !== "CONFLITO_NAO_RESOLVIDO");
  const status: StatusConferencia = impeditivos.length
    ? "bloqueado"
    : conflitos.length
      ? "requer_revisao"
      : "aprovado_para_preparacao";

  return {
    status,
    proposal_id: e.proposta?.id ?? null,
    proposal_version: e.proposta?.versao ?? null,
    origin: "Canva",
    paginas_usadas,
    campos_extraidos,
    campos_ausentes,
    conflitos,
    bloqueios,
    anexos_afetados,
    proxima_acao_recomendada: proximaAcaoRecomendada(contexto),
    gates: avaliarGates(contexto),
  };
}

export function contextoGatesDaConferencia(r: ResultadoConferencia): ContextoGates {
  // Reconstitui o contexto a partir das avaliações já calculadas (para reuso
  // no servidor sem recomputar leituras).
  const ok = (g: string) => r.gates.find((a) => a.gate === g)?.ok ?? false;
  return {
    propostaValida: ok("proposta_valida"),
    camposAusentes: ok("escopo_conferido") ? [] : r.campos_ausentes.filter((c) => c.obrigatorio).map((c) => c.label),
    conflitos: r.conflitos.map((c) => c.descricao),
    precoOk: ok("produto_condicao_homologados"),
    caseServiceOk: ok("produto_condicao_homologados"),
    cadastroCompleto: ok("cadastro_completo"),
    nucleoValidado: ok("nucleo_familiar_validado"),
    menorEnvolvido: !ok("representacao_menor"),
    representacaoRegistrada: ok("representacao_menor"),
    revisaoJuridicaOk: ok("revisao_juridica"),
    contratoOsProntos: ok("contrato_os_prontos"),
    assinaturaRegistrada: ok("assinatura"),
    pagamentoConfirmado: ok("pagamento"),
    autorizacaoPesquisa: ok("autorizacao_pesquisa"),
    despesasAplicaveis: !ok("despesas_aprovadas"),
    despesasPendentes: ok("despesas_aprovadas") ? [] : ["Pendência registrada em despesas de terceiros."],
    dependentesPendentes: ok("dependentes_representacao") ? [] : ["Dependente com representação pendente."],
    temasJuridicosBloqueantes: ok("matriz_juridica") ? [] : ["Tema jurídico bloqueante sem decisão."],
  };
}

/** Payload de auditoria sanitizado: só códigos, rótulos de campo e contagens. */
export function auditoriaSanitizada(input: {
  caseId: string;
  resultado: ResultadoConferencia;
  actorId: string;
  approverId?: string | null;
}) {
  const permitidos = new Set(CAMPOS_ESCOPO_PROPOSTA.map((c) => c.campo));
  return {
    case_id: input.caseId,
    proposal_id: input.resultado.proposal_id,
    version: input.resultado.proposal_version,
    origin: "Canva",
    paginas_utilizadas: input.resultado.paginas_usadas,
    campos_extraidos: input.resultado.campos_extraidos.map((c) => c.campo).filter((c) => permitidos.has(c)),
    campos_ausentes: input.resultado.campos_ausentes.map((c) => c.campo).filter((c) => permitidos.has(c)),
    codigos_conflito: [...new Set(input.resultado.conflitos.map((c) => c.codigo))],
    codigos_bloqueio: [...new Set(input.resultado.bloqueios.map((b) => b.codigo))],
    status: input.resultado.status,
    anexos_afetados: input.resultado.anexos_afetados,
    actor_id: input.actorId,
    reviewed_at: new Date().toISOString(),
    approver_id: input.approverId ?? null,
  };
}
