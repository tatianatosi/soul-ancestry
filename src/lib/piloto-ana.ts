/**
 * Caso-piloto Ana Luiza — estado interno consolidado, sem ação externa.
 * Nada aqui cria contrato, cobrança, assinatura, pasta, documento ou comunicação.
 */

export const PILOTO_ANA = {
  nome: "Ana Luiza Gomes Silveira Rodrigues",
  pais: "Áustria",
  referencia_juridica_interna: "§ 58c StbG",
  aceite_formal_confirmado_em: "2026-08-14",
  estado_aceite: "formalizacao_em_preparacao" as const,
  proposta_referencia_valor: 9600,
  proposta_referencia_participantes: 3,
  proposta_observacao:
    "R$ 9.600 e composição familiar de 3 participantes constam apenas como evidência interna de proposta de referência. Não é cobrança, não é preço homologado e não autoriza Asaas.",
  ids_historicos: ["CA-AUT-ANALUIZA-FAM-2026-001", "CA-2026-ANA-001", "CA-CID-AT-2026-002"],
  id_canonico_decidido: "CA-CID-AT-FAM-2026-001" as string | null,
  nome_operacional: "Projeto familiar — Ana Luiza",
  classificacao: "Primeira cliente",
  decisao_id_canonico:
    "Decisão da Proprietária Administradora em 22/08/2026: identificador canônico já definido na operação. Referência legada resolvida para CA-CID-AT-FAM-2026-001.",
  responsavel: "Tatiana Melani Tosi",
};

/**
 * 30/08/2026 — Piloto Real: a lista fixa de 11 bloqueios (BLOQUEIOS_PILOTO)
 * foi retirada. Era um array hardcoded, sem query, sem ação — sempre os
 * mesmos 11 itens, independente do estado real do caso, e vários campos
 * dos gates A–H (piloto-conferencia.ts, também removido) eram permanentemente
 * `conferido: false` por construção, o que tornava NO_GO estrutural e
 * impossível de sair mesmo com o caso avançando de verdade.
 *
 * derivarPendenciasPiloto substitui os dois por uma leitura derivada do
 * estado real do caso (crm_casos, nucleo_membros, contracts, service_orders,
 * perfil institucional). Só aparece pendência quando o dado real ainda não
 * está preenchido; nenhuma delas bloqueia editar caso, pessoa, pesquisa,
 * tarefa, fonte, proposta rascunho, contrato rascunho ou OS.
 */
export type OrigemPendenciaPiloto =
  | "cadastro_participante"
  | "documento"
  | "contrato"
  | "proposta_comercial"
  | "ativacao"
  | "integracao_acao_externa";

export type PendenciaPiloto = {
  codigo: string;
  descricao: string;
  entidade: string;
  origem: OrigemPendenciaPiloto;
  acaoRelacionada: { rotulo: string; to: string; params?: Record<string, string> } | null;
  tarefaVinculada: string | null;
  estadoAtual: string;
};

export const ROTULO_ORIGEM_PENDENCIA: Record<OrigemPendenciaPiloto, string> = {
  cadastro_participante: "Cadastro/participante",
  documento: "Documento",
  contrato: "Contrato",
  proposta_comercial: "Proposta/comercial",
  ativacao: "Ativação",
  integracao_acao_externa: "Integração/ação externa",
};

const CONFERIDO = (v: unknown) => (typeof v === "string" ? v.trim().length > 0 : Boolean(v));

/** Leitura derivada, somente leitura: nenhuma pendência aqui altera dado ou bloqueia ação. */
export function derivarPendenciasPiloto(input: {
  caseId: string | null;
  caso: Record<string, unknown> | null;
  membros: { nome: string; papel: string; processo?: string | null }[];
  contrato: { status: string } | null;
  ordemServico: { status: string } | null;
  perfilInstitucionalVigente: boolean;
}): PendenciaPiloto[] {
  const c = input.caso ?? {};
  const paramsCaso = input.caseId ? { caseId: input.caseId } : undefined;
  const paramsId = input.caseId ? { id: input.caseId } : undefined;
  const pendencias: PendenciaPiloto[] = [];

  if (!CONFERIDO(c["id_canonico_decidido"])) {
    pendencias.push({
      codigo: "id_canonico_pendente",
      descricao: "Identificador canônico ainda não decidido.",
      entidade: "Caso",
      origem: "cadastro_participante",
      acaoRelacionada: { rotulo: "Registrar decisão do ID canônico", to: "/onboarding" },
      tarefaVinculada: null,
      estadoAtual: "aberto",
    });
  }

  for (const m of input.membros) {
    const nomeCompleto = m.nome.trim().includes(" ");
    if (!nomeCompleto) {
      pendencias.push({
        codigo: `nome_incompleto_${m.nome}`,
        descricao: `Nome completo de ${m.nome} ainda não conferido.`,
        entidade: m.nome,
        origem: "cadastro_participante",
        acaoRelacionada: paramsCaso ? { rotulo: "Editar pessoa", to: "/pessoas-linhagens/$caseId", params: paramsCaso } : null,
        tarefaVinculada: null,
        estadoAtual: "aberto",
      });
    }
    if (m.papel === "dependente" && !/representa/i.test(String(m.processo ?? ""))) {
      pendencias.push({
        codigo: `representacao_${m.nome}`,
        descricao: `Representação legal de ${m.nome} ainda não documentada.`,
        entidade: m.nome,
        origem: "cadastro_participante",
        acaoRelacionada: paramsCaso ? { rotulo: "Editar pessoa", to: "/pessoas-linhagens/$caseId", params: paramsCaso } : null,
        tarefaVinculada: null,
        estadoAtual: "aberto",
      });
    }
  }

  if (!input.contrato) {
    pendencias.push({
      codigo: "contrato_ausente",
      descricao: "Nenhum contrato aberto para este caso.",
      entidade: "Contrato",
      origem: "contrato",
      acaoRelacionada: paramsCaso ? { rotulo: "Abrir caso", to: "/casos/$caseId", params: paramsCaso } : null,
      tarefaVinculada: null,
      estadoAtual: "não iniciado",
    });
  } else if (input.contrato.status === "draft") {
    pendencias.push({
      codigo: "contrato_rascunho",
      descricao: "Contrato em rascunho: partes, escopo, cláusulas ou anexos podem estar incompletos.",
      entidade: "Contrato",
      origem: "contrato",
      acaoRelacionada: { rotulo: "Editar contrato", to: "/contratos" },
      tarefaVinculada: null,
      estadoAtual: "rascunho",
    });
  }

  if (!input.ordemServico) {
    pendencias.push({
      codigo: "anexo_os_ausente",
      descricao: "Anexo I / Ordem de Serviço ainda não gerado.",
      entidade: "Ordem de serviço",
      origem: "documento",
      acaoRelacionada: { rotulo: "Ordens de serviço", to: "/ordens-servico" },
      tarefaVinculada: null,
      estadoAtual: "aberto",
    });
  }

  if (!CONFERIDO(c["metodo_assinatura"])) {
    pendencias.push({
      codigo: "metodo_assinatura_pendente",
      descricao: "Método de assinatura ainda não definido.",
      entidade: "Contrato",
      origem: "contrato",
      acaoRelacionada: null,
      tarefaVinculada: null,
      estadoAtual: "aberto",
    });
  }

  const revisaoJuridica = String(c["revisao_juridica_status"] ?? "");
  if (revisaoJuridica !== "aprovada") {
    pendencias.push({
      codigo: "revisao_juridica_pendente",
      descricao: "Revisão jurídica ainda não aprovada.",
      entidade: "Contrato",
      origem: "contrato",
      acaoRelacionada: { rotulo: "Validação jurídica", to: "/matriz-juridica" },
      tarefaVinculada: null,
      estadoAtual: revisaoJuridica || "pendente",
    });
  }

  if (!input.perfilInstitucionalVigente) {
    pendencias.push({
      codigo: "perfil_institucional_nao_vigente",
      descricao: "Perfil institucional da contratada ainda não está vigente.",
      entidade: "Perfil institucional",
      origem: "contrato",
      acaoRelacionada: { rotulo: "Governança — contrato-base", to: "/governanca/contrato-base" },
      tarefaVinculada: null,
      estadoAtual: "não vigente",
    });
  }

  const situacaoFinanceira = String(c["situacao_financeira"] ?? "");
  const RECONCILIADA = ["cobranca_emitida", "pagamento_inicial_confirmado", "pagamento_parcial", "quitado"];
  if (!RECONCILIADA.includes(situacaoFinanceira)) {
    pendencias.push({
      codigo: "reconciliacao_comercial_pendente",
      descricao: "SKU, preço, escopo e condição comercial ainda não reconciliados por fonte homologada.",
      entidade: "Condição comercial",
      origem: "proposta_comercial",
      acaoRelacionada: null,
      tarefaVinculada: null,
      estadoAtual: situacaoFinanceira || "pendente",
    });
  }

  const ativado = String(c["ativacao_operacional"] ?? "") === "aprovada" || CONFERIDO(c["ativado_em"]);
  if (!ativado) {
    pendencias.push({
      codigo: "ativacao_pendente",
      descricao: "Ativação operacional ainda não aprovada.",
      entidade: "Caso",
      origem: "ativacao",
      acaoRelacionada: paramsId ? { rotulo: "Painel de onboarding e ativação", to: "/onboarding/$id", params: paramsId } : null,
      tarefaVinculada: null,
      estadoAtual: String(c["ativacao_operacional"] ?? "pendente"),
    });
  }

  return pendencias;
}

/**
 * 30/08/2026 — achado real (P0, confirmado nos logs do Postgres): esta
 * lista tinha `papel: "participante"` e nomes curtos ("Pai (Adair)",
 * "Alice") que não existem em `nucleo_membros.papel_check` (só aceita
 * `contratante_signatario`/`dependente`) nem batem com o nome completo já
 * cadastrado no banco desde 18/08. Toda vez que `materializarPilotoAna`
 * rodava, tentava inserir Adair e Alice de novo — o dedupe por nome exato
 * não reconhecia "Pai (Adair)" como "Adair Pinto Silveira Júnior" — e o
 * INSERT era rejeitado pela constraint, silenciosamente (o loop não
 * verificava erro). Nomes e papéis agora batem com o registro real.
 */
export type MembroPiloto = {
  nome: string;
  papel: "contratante_signatario" | "dependente";
  signatario: boolean;
  situacao: string;
  observacao: string;
};

export const NUCLEO_PILOTO: MembroPiloto[] = [
  { nome: "Ana Luiza Gomes Silveira Rodrigues", papel: "contratante_signatario", signatario: true, situacao: "cadastro em conferência", observacao: "Contratante e signatária." },
  { nome: "Adair Pinto Silveira Júnior", papel: "contratante_signatario", signatario: true, situacao: "cadastro em conferência", observacao: "Participante adulto signatário." },
  { nome: "Alice Gomes Silveira", papel: "contratante_signatario", signatario: true, situacao: "pendente de dados completos", observacao: "Nome completo e documento pendentes." },
  { nome: "Felipe", papel: "dependente", signatario: false, situacao: "menor vinculado à Ana", observacao: "Representação legal pendente; menor não é signatário." },
];

export const FORA_DE_ESCOPO_PILOTO = [
  {
    nome: "Adriel Felipe",
    motivo: "Não integra este caso. Registrado apenas como processo separado, fora do escopo da cidadania familiar.",
  },
];
