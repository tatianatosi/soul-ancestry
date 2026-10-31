/**
 * Adaptador puro: linhas reais do caso → o que o Kit Contratual exibe (31/10/2026).
 *
 * O `KitContratual` nasceu lendo o modelo estático `CaseData` (`useActiveCase`)
 * e ficou sem tela. Aqui o mesmo componente passa a ler o que está no banco
 * (contratos, versões, ordem de serviço, despesas de terceiros, anexos e
 * eventos de revisão), sem tabela nova. Regra do produto: vazio honesto — o que
 * não existe vira "não criado / sem registro", nunca valor inferido, e nada
 * aqui assina, envia ou baixa.
 */

import type {
  AlteracaoEscopo,
  AutorizacaoPesquisa,
  CaseContratacao,
  DespesaItem,
  EtapaContratual,
  PoliticaDespesas,
  ProcuracaoDocumento,
  StatusDespesas,
  StatusOrdemServico,
  StatusProcuracao,
} from "@/types/case";
import { conteudoDoAnexoSalvo } from "@/lib/anexos-conteudo";

export type LinhaContrato = {
  id: string;
  contract_number: string | null;
  status: string;
  signed_at: string | null;
  approved_for_send_at: string | null;
  created_at: string | null;
};

export type LinhaVersao = { version_number: number | null; created_at: string | null };

export type LinhaOrdemServico = {
  service_order_number: string | null;
  status: string;
  versao: number | null;
  scope_summary: string | null;
  deliverable_summary: string | null;
  start_date: string | null;
  case_id: string | null;
};

export type LinhaDespesa = {
  descricao: string;
  categoria: string | null;
  estado: string;
  pagador: string | null;
  estimativa_min: number | null;
  estimativa_max: number | null;
  valor_pago: number | null;
  moeda: string | null;
  aprovado_pelo_cliente_em: string | null;
  observacoes: string | null;
};

export type LinhaAnexo = {
  annex_code: string;
  status: string;
  annex_version: number | null;
  structured_data: unknown;
};

export type LinhaEvento = {
  id: string;
  event_type: string;
  occurred_at: string | null;
  created_at: string | null;
};

export type EntradaKit = {
  caso: {
    id: string;
    codigo: string | null;
    clienteNome: string | null;
    responsavel: string | null;
    abertoEm: string | null;
    pais: string | null;
  };
  contrato: LinhaContrato | null;
  versao: LinhaVersao | null;
  ordemServico: LinhaOrdemServico | null;
  despesas: LinhaDespesa[];
  anexos: LinhaAnexo[];
  eventos: LinhaEvento[];
};

/** Só o que o componente lê do caso; nunca um caso fixo. */
export type CasoDoKit = {
  codigo: string;
  clienteNome: string;
  responsavel: string;
  abertoEm: string;
  /** País registrado no caso (`crm_casos`); alimenta o resolvedor de contexto europeu, sem default. */
  pais: string | null;
  contratacao: CaseContratacao;
  /** Fatos que existem no banco mas que o componente não consegue ligar a um cartão sem adivinhar. */
  avisos: string[];
};

const VAZIO_STATUS_PROC: StatusProcuracao = "nao_iniciada";

export function statusContratoBase(
  status: string | null | undefined,
): CaseContratacao["contrato_base"]["status"] {
  if (status === "signed") return "aceito";
  if (status === "archived" || status === "cancelled") return "arquivado";
  if (status === "sent" || status === "approved_for_send") return "aguardando_aceite";
  return "nao_enviado";
}

export function statusOrdemServico(status: string | null | undefined): StatusOrdemServico {
  switch (status) {
    case "draft":
      return "rascunho";
    case "pending_approval":
      return "aguardando_aceite";
    case "approved":
    case "active":
    case "paused":
    case "completed":
      return "aceita";
    case "cancelled":
    case "archived":
      return "arquivada";
    default:
      return "nao_criada";
  }
}

const ESTADO_DESPESA: Record<string, StatusDespesas> = {
  nao_aplicavel: "nao_aplicavel",
  estimativa_pendente: "estimativa",
  estimada_comunicada: "estimativa",
  aguardando_aprovacao: "ajuste_pendente",
  aprovada: "aprovada_pela_cliente",
  paga_diretamente_pelo_cliente: "aprovada_pela_cliente",
  parcialmente_paga: "ajuste_pendente",
  pendencia_do_cliente: "ajuste_pendente",
};

/** Unanimidade ou nada: pagadores misturados ou ausentes não viram política inventada. */
export function politicaDeDespesas(linhas: LinhaDespesa[]): PoliticaDespesas {
  const pagadores = new Set(linhas.map((l) => l.pagador ?? ""));
  if (pagadores.size !== 1) return "nao_definida";
  const [unico] = [...pagadores];
  if (unico === "cliente") return "pagamento_direto_pela_cliente";
  if (unico === "clube_antecipa") return "antecipacao_total_pelo_clube";
  return "nao_definida";
}

function moedaTexto(n: number | null, moeda: string | null): string {
  if (n === null || n === undefined) return "";
  const m = moeda ?? "BRL";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: m }).format(n);
  } catch {
    return `${m} ${n}`;
  }
}

function faixa(l: LinhaDespesa): string {
  const a = moedaTexto(l.estimativa_min, l.moeda);
  const b = moedaTexto(l.estimativa_max, l.moeda);
  if (a && b && a !== b) return `${a} a ${b}`;
  return a || b;
}

function despesaItem(l: LinhaDespesa): DespesaItem {
  return {
    item: l.descricao,
    finalidade: l.categoria ?? "",
    estimativa: faixa(l),
    valor_real: moedaTexto(l.valor_pago, l.moeda),
    status: ESTADO_DESPESA[l.estado] ?? "estimativa",
    aprovacao: l.aprovado_pelo_cliente_em ?? "",
    comprovante: false,
    reembolso: "",
  };
}

/** Status do anexo salvo → vocabulário de procuração/autorização do kit. Sem salto de etapa. */
export function statusProcuracaoDoAnexo(status: string | null | undefined): StatusProcuracao {
  switch (status) {
    case "drafting":
      return "rascunho_em_preparacao";
    case "ready_for_review":
      return "aguardando_revisao_interna";
    case "approved":
    case "attached":
      return "aguardando_assinatura_cliente";
    case "signed_with_contract":
      return "assinada";
    default:
      return VAZIO_STATUS_PROC;
  }
}

function anexoVivo(anexos: LinhaAnexo[], prefixo: string): LinhaAnexo | null {
  const candidatos = anexos
    .filter(
      (a) =>
        a.annex_code.startsWith(prefixo) &&
        a.status !== "not_applicable" &&
        a.status !== "archived",
    )
    .sort((a, b) => (b.annex_version ?? 0) - (a.annex_version ?? 0));
  return candidatos[0] ?? null;
}

function campo(a: LinhaAnexo, trecho: string): string {
  const c = conteudoDoAnexoSalvo(a.structured_data)?.campos.find((x) =>
    x.rotulo.toLowerCase().includes(trecho),
  );
  return c?.valor ?? "";
}

const PROCURACAO_VAZIA: ProcuracaoDocumento = {
  status: VAZIO_STATUS_PROC,
  finalidade: "",
  orgao_destinatario: "",
  documento_disponivel: false,
  secure_url: "",
};

function procuracaoDe(a: LinhaAnexo): ProcuracaoDocumento {
  return {
    status: statusProcuracaoDoAnexo(a.status),
    finalidade: campo(a, "finalidade"),
    orgao_destinatario: campo(a, "órgão") || campo(a, "orgao"),
    documento_disponivel: false,
    secure_url: "",
  };
}

const ROTULO_EVENTO: Record<string, string> = {
  created: "Instrumento criado",
  send_drafted: "Rascunho de envio criado",
  send_blocked: "Preparação do envio bloqueada",
  signature_requested: "Assinatura solicitada",
  signed: "Assinatura registrada",
  review_requested: "Revisão humana solicitada",
};

function etapaDeEvento(e: LinhaEvento): EtapaContratual {
  return {
    id: e.id,
    titulo: ROTULO_EVENTO[e.event_type] ?? e.event_type.replace(/_/g, " "),
    status: "concluido",
    data: e.occurred_at ?? e.created_at ?? "",
    responsavel: "",
    descricao: "Evento registrado em contract_review_events.",
    proxima_acao: "",
    visibilidade: "interna",
  };
}

export function kitContratualDoCaso(entrada: EntradaKit): CasoDoKit {
  const avisos: string[] = [];
  const { contrato, versao, ordemServico: os, despesas, anexos, eventos } = entrada;

  const versaoTexto = contrato
    ? [
        contrato.contract_number,
        versao?.version_number != null ? `v${versao.version_number}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  const anexoIII = anexoVivo(anexos, "ANEXO_III");
  const anexoIV = anexoVivo(anexos, "ANEXO_IV");
  const anexoV = anexoVivo(anexos, "ANEXO_V");

  const pesquisa: AutorizacaoPesquisa[] = anexoIII
    ? [
        {
          finalidade: campo(anexoIII, "finalidade"),
          orgao_destinatario: campo(anexoIII, "órgão") || campo(anexoIII, "orgao"),
          pessoas_relacionadas: [],
          documentos_solicitados: [],
          teto_valor: "",
          prazo: "",
          status: statusProcuracaoDoAnexo(anexoIII.status),
          aceite: "",
        },
      ]
    : [];

  let brasileira = PROCURACAO_VAZIA;
  let europeia = PROCURACAO_VAZIA;
  if (anexoIV) {
    const jurisdicao = campo(anexoIV, "jurisdi").trim().toLowerCase();
    if (jurisdicao === "brasil") brasileira = procuracaoDe(anexoIV);
    else if (jurisdicao) europeia = procuracaoDe(anexoIV);
    else
      avisos.push(
        "Existe um Anexo IV salvo sem jurisdição registrada: ele não foi atribuído à procuração do Brasil nem à europeia.",
      );
  }

  const escopo: AlteracaoEscopo[] = anexoV
    ? [
        {
          escopo_anterior: campo(anexoV, "escopo"),
          alteracao: campo(anexoV, "alteração") || campo(anexoV, "alteracao"),
          motivo: campo(anexoV, "motivo"),
          impacto_prazo: campo(anexoV, "prazo"),
          impacto_financeiro: campo(anexoV, "financeiro"),
          aceite: "",
          data: "",
        },
      ]
    : [];

  const estadoDespesas: StatusDespesas =
    despesas.length === 0
      ? "nao_aplicavel"
      : despesas.every((d) => ESTADO_DESPESA[d.estado] === "nao_aplicavel")
        ? "nao_aplicavel"
        : (ESTADO_DESPESA[despesas.find((d) => d.estado !== "nao_aplicavel")?.estado ?? ""] ??
          "estimativa");

  const contratacao: CaseContratacao = {
    contrato_base: {
      versao: versaoTexto,
      status: statusContratoBase(contrato?.status),
      data_aceite: contrato?.signed_at ?? "",
      documento_disponivel: false,
      secure_url: "",
    },
    ordem_servico: {
      status: statusOrdemServico(os?.status),
      case_id: entrada.caso.codigo ?? "",
      // O cartão exibe este campo como identificação; a OS real não tem SKU.
      produto_sku: os
        ? [os.service_order_number, os.versao != null ? `v${os.versao}` : null]
            .filter(Boolean)
            .join(" · ")
        : "",
      produto_nome: "",
      escopo_resumo: os?.scope_summary ?? "",
      etapa_inicial: "",
      entregaveis: os?.deliverable_summary ? [os.deliverable_summary] : [],
      modalidade_escolhida: "",
      valor_contratado: "",
      meio_pagamento: "",
      parcelas_ou_recorrencia: "",
      primeiro_vencimento: os?.start_date ?? "",
      proximo_vencimento: "",
      documento_disponivel: false,
      secure_url: "",
    },
    despesas_externas: {
      politica: politicaDeDespesas(despesas),
      descricao_cliente: "",
      status: estadoDespesas,
      valor_estimado_total: "",
      valor_real_confirmado: "",
      saldo_ajuste: "",
      requer_aprovacao_para_excedente: false,
      itens: despesas.map(despesaItem),
      comprovantes_disponiveis: false,
      secure_url: "",
    },
    autorizacoes: {
      pesquisa_especifica: pesquisa,
      procuracao_brasileira: brasileira,
      procuracao_europeia: europeia,
    },
    alteracoes_escopo: escopo,
    timeline: eventos.map(etapaDeEvento),
  };

  return {
    codigo: entrada.caso.codigo ?? "",
    clienteNome: entrada.caso.clienteNome ?? "",
    responsavel: entrada.caso.responsavel ?? "",
    abertoEm: entrada.caso.abertoEm ?? "",
    pais: entrada.caso.pais,
    contratacao,
    avisos,
  };
}
