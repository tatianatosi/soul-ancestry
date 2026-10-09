/**
 * Fila derivada de acompanhamento — Painel Hoje (PROMPT 05).
 *
 * Camada SOMENTE-LEITURA e pura: monta sugestões de próximo passo a partir
 * de sinais já existentes (proposta, confirmação formal, agenda, follow-up,
 * financeiro, cadência, override). Nunca cria tarefa persistida, evento de
 * calendário, contato, cobrança, envio de mensagem ou mudança de etapa —
 * apenas sugere e explica por que o item apareceu.
 */

export const MOTIVOS_FOLLOW_UP = [
  "vencimento_financeiro",
  "confirmacao_formal_pendente",
  "override_proximo_da_expiracao",
  "follow_up_vencido",
  "ultimo_elo_pendente",
  "cadencia_vencida",
  "reuniao_nao_agendada",
  "proposta_pronta_sem_envio",
] as const;
export type MotivoFollowUp = (typeof MOTIVOS_FOLLOW_UP)[number];

/**
 * Ordem de precedência: quando a mesma pessoa/caso teria mais de um motivo,
 * só o de maior precedência aparece na fila — o mesmo objeto nunca é
 * duplicado em filas diferentes.
 */
const PRECEDENCIA: Record<MotivoFollowUp, number> = Object.fromEntries(
  MOTIVOS_FOLLOW_UP.map((m, i) => [m, i]),
) as Record<MotivoFollowUp, number>;

export const ROTULO_MOTIVO_FOLLOW_UP: Record<MotivoFollowUp, string> = {
  vencimento_financeiro: "Vencimento financeiro",
  confirmacao_formal_pendente: "Confirmação formal pendente",
  override_proximo_da_expiracao: "Override próximo da expiração",
  follow_up_vencido: "Follow-up vencido",
  ultimo_elo_pendente: "Último elo pendente",
  cadencia_vencida: "Cadência vencida",
  reuniao_nao_agendada: "Reunião não agendada",
  proposta_pronta_sem_envio: "Proposta pronta sem envio",
};

export type EntradaFollowUp = {
  /** Identidade estável da pessoa/caso — a chave de deduplicação é derivada disto + motivo. */
  pessoaOuCasoId: string;
  pessoa: string;
  casoId: string | null;
  motivo: MotivoFollowUp;
  estado: string;
  responsavel: string | null;
  prazo: string | null;
  rotaDestino: string;
  evidenciaOrigem: string;
  recomendacao: string;
};

export type ItemFollowUp = EntradaFollowUp & {
  chave: string;
  prioridade: 1 | 2 | 3;
};

const PRIORIDADE_POR_MOTIVO: Record<MotivoFollowUp, 1 | 2 | 3> = {
  vencimento_financeiro: 1,
  confirmacao_formal_pendente: 1,
  override_proximo_da_expiracao: 2,
  follow_up_vencido: 2,
  ultimo_elo_pendente: 2,
  cadencia_vencida: 2,
  reuniao_nao_agendada: 3,
  proposta_pronta_sem_envio: 3,
};

/**
 * Monta a fila com precedência e deduplicação: cada pessoa/caso aparece no
 * máximo uma vez, com o motivo de maior precedência entre os aplicáveis.
 * Pura: não lê banco, não escreve nada.
 */
export function montarFilaFollowUp(entradas: EntradaFollowUp[]): ItemFollowUp[] {
  const melhorPorObjeto = new Map<string, EntradaFollowUp>();
  for (const e of entradas) {
    const atual = melhorPorObjeto.get(e.pessoaOuCasoId);
    if (!atual || PRECEDENCIA[e.motivo] < PRECEDENCIA[atual.motivo]) {
      melhorPorObjeto.set(e.pessoaOuCasoId, e);
    }
  }

  const itens: ItemFollowUp[] = [...melhorPorObjeto.values()].map((e) => ({
    ...e,
    chave: `${e.motivo}:${e.pessoaOuCasoId}`,
    prioridade: PRIORIDADE_POR_MOTIVO[e.motivo],
  }));

  return itens.sort((a, b) => a.prioridade - b.prioridade || a.pessoa.localeCompare(b.pessoa));
}

/** Estado de carregamento da fila — nunca conclui pendência resolvida em falha. */
export type EstadoCarregamentoFila = "carregando" | "erro" | "vazio" | "pronto";

export function estadoCarregamentoFila(input: {
  carregando: boolean;
  erro: boolean;
  quantidade: number;
}): EstadoCarregamentoFila {
  if (input.carregando) return "carregando";
  if (input.erro) return "erro";
  if (input.quantidade === 0) return "vazio";
  return "pronto";
}

/* ------------------------------------------------------------------ */
/* Fixtures de teste — Ana Luiza, João e Lara (PROMPT 05)               */
/* Nunca usadas como escrita real; apenas para provar o comportamento. */
/* ------------------------------------------------------------------ */

export const FIXTURE_ANA_LUIZA: EntradaFollowUp = {
  pessoaOuCasoId: "CA-CID-AT-FAM-2026-001",
  pessoa: "Ana Luiza",
  casoId: "CA-CID-AT-FAM-2026-001",
  motivo: "vencimento_financeiro",
  estado: "Aceite formal registrado; primeira cobrança prevista para 01/10/2026, ainda não confirmada.",
  responsavel: "Proprietária administradora",
  prazo: "2026-10-01",
  rotaDestino: "/casos/a11a0000-0000-4000-8000-000000000002",
  evidenciaOrigem:
      "Proposta familiar aprovada: R$ 9.600,00 no total — R$ 960,00 por mês, divididos em três assinaturas " +
      "de R$ 320 (Ana Luiza, Adair e Alice), durante 10 meses. Estrutura confirmada pela Proprietária em " +
      "09/10/2026. Aceite formal registrado.",
  recomendacao: "Decidir e registrar: iniciar preparação antes do pagamento (override) ou manter bloqueio financeiro.",
};

export const FIXTURE_JOAO: EntradaFollowUp = {
  pessoaOuCasoId: "joao-fixture",
  pessoa: "João",
  casoId: null,
  motivo: "confirmacao_formal_pendente",
  estado: "Aceite verbal com evidência registrado; confirmação formal por escrito ainda pendente.",
  responsavel: "Comercial",
  prazo: null,
  rotaDestino: "/leads",
  evidenciaOrigem: "Registro de aceite verbal no CRM, sem confirmação escrita associada.",
  recomendacao: "Preparar o modelo \"confirme\" como rascunho interno e criar tarefa de acompanhamento.",
};

export const FIXTURE_LARA: EntradaFollowUp = {
  pessoaOuCasoId: "lara-fixture",
  pessoa: "Lara",
  casoId: null,
  motivo: "reuniao_nao_agendada",
  estado: "Proposta pronta; reunião de apresentação da proposta ainda não agendada.",
  responsavel: "Comercial",
  prazo: null,
  rotaDestino: "/propostas",
  evidenciaOrigem: "Proposta registrada como pronta, sem evento de agenda vinculado.",
  recomendacao: "Criar follow-up interno e rascunho de mensagem para convidar ao agendamento.",
};

export const FIXTURES_FOLLOW_UP_PROPRIETARIA = [FIXTURE_ANA_LUIZA, FIXTURE_JOAO, FIXTURE_LARA];
