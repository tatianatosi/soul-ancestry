/**
 * Cadência do Painel Hoje — derivação das entradas de acompanhamento.
 *
 * Liga o motor puro `fila-follow-up-proprietaria` aos sinais que o Painel Hoje
 * já carrega. Esta camada é SOMENTE LEITURA e pura: traduz fila e cadência em
 * `EntradaFollowUp`, sem ler banco, criar tarefa, agendar, cobrar ou enviar.
 *
 * O que a fila responde é diferente do que a fila priorizada responde. A fila
 * priorizada ordena por data ("o que vence"); a cadência explica por que o
 * cliente parou e qual o toque que o faz avançar. Por isso cada item carrega
 * motivo, evidência de origem e recomendação — nunca só um número.
 */

import {
  montarFilaFollowUp,
  type EntradaFollowUp,
  type ItemFollowUp,
  type MotivoFollowUp,
} from "@/lib/fila-follow-up-proprietaria";

/** Recorte de `ItemFila` de que esta derivação depende. */
export type ItemFilaCadencia = {
  id: string;
  rotulo: string;
  detalhe?: string | null;
  data?: string | null;
  tipo?: "lead" | "caso" | null;
  responsavel?: string | null;
};

export type FilaCadencia = { chave: string; itens: readonly ItemFilaCadencia[] };

/**
 * Filas do Painel Hoje que descrevem um cliente parado esperando um toque.
 *
 * Três motivos do motor ficam de fora de propósito, por não terem fonte
 * carregada nesta tela: `override_proximo_da_expiracao` (depende de
 * `owner_override_events`), `reuniao_nao_agendada` e `proposta_pronta_sem_envio`
 * (dependem de vínculo proposta ↔ evento de agenda). Inventar entrada sem fonte
 * seria pior do que a ausência.
 */
const MOTIVO_POR_FILA: Record<string, MotivoFollowUp> = {
  pagamentos_aguardados: "vencimento_financeiro",
  contratos_enviados_pendentes: "confirmacao_formal_pendente",
  cadeia_operacional: "ultimo_elo_pendente",
  propostas_sem_followup: "follow_up_vencido",
};

/**
 * O toque que faz o caso andar, por motivo. Texto de recomendação interna:
 * descreve a decisão a registrar, nunca dispara ação externa.
 */
export const RECOMENDACAO_POR_MOTIVO: Record<MotivoFollowUp, string> = {
  vencimento_financeiro:
    "Confirmar o pagamento inicial pela referência transacional, ou registrar override da Proprietária para iniciar antes. Nenhuma cobrança parte daqui.",
  confirmacao_formal_pendente:
    "Verificar se a assinatura voltou e registrá-la. Sem assinatura registrada, o caso não passa para onboarding.",
  override_proximo_da_expiracao:
    "Revisar a exceção antes da data de revisão: renovar com nova justificativa, ou deixar o bloqueio voltar.",
  follow_up_vencido:
    "Definir a próxima ação e a data. Proposta sem próxima ação datada não entra na fila do dia.",
  ultimo_elo_pendente:
    "Abrir a cadeia operacional do caso e fechar o elo pendente — é ele que trava a passagem de fase.",
  cadencia_vencida:
    "Registrar um touchpoint que responda às quatro perguntas: o que foi feito, o que se aguarda, o que não depende do cliente e qual o próximo marco verificável.",
  reuniao_nao_agendada:
    "Propor janela de reunião e registrar o convite. A agenda assistida sugere; quem confirma é uma pessoa.",
  proposta_pronta_sem_envio:
    "Revisar a prévia e decidir o envio. A proposta permanece como rascunho interno até a confirmação humana.",
};

const eDemo = (rotulo: string) => /demo|demonstra|fixture|teste/i.test(rotulo);

const rotaDe = (tipo: "lead" | "caso", id: string) => (tipo === "caso" ? `/casos/${id}` : "/leads");

/**
 * Traduz as filas e a cadência dos casos em entradas de acompanhamento.
 *
 * Respeita a precedência do painel: registro já exibido em bloco anterior
 * (`jaExibidos`) não reaparece aqui — a regra de um registro por tela vale
 * também para a cadência.
 */
export function derivarCadenciaDoPainel(input: {
  filas: readonly FilaCadencia[];
  casosCadencia: readonly Record<string, unknown>[];
  jaExibidos?: ReadonlySet<string>;
  incluirDemo?: boolean;
}): ItemFollowUp[] {
  const { filas, casosCadencia, jaExibidos, incluirDemo = false } = input;
  const entradas: EntradaFollowUp[] = [];
  const visivel = (rotulo: string) => incluirDemo || !eDemo(rotulo);

  for (const fila of filas) {
    const motivo = MOTIVO_POR_FILA[fila.chave];
    if (!motivo) continue;
    for (const item of fila.itens) {
      const tipo = item.tipo ?? "lead";
      if (!visivel(item.rotulo)) continue;
      if (jaExibidos?.has(`${tipo}:${item.id}`)) continue;
      entradas.push({
        pessoaOuCasoId: `${tipo}:${item.id}`,
        pessoa: item.rotulo,
        casoId: tipo === "caso" ? item.id : null,
        motivo,
        estado: item.detalhe?.trim() || "Sem detalhe registrado na fila de origem.",
        responsavel: item.responsavel ?? null,
        prazo: item.data ?? null,
        rotaDestino: rotaDe(tipo, item.id),
        evidenciaOrigem: `Fila “${fila.chave}” do Painel Hoje.`,
        recomendacao: RECOMENDACAO_POR_MOTIVO[motivo],
      });
    }
  }

  for (const caso of casosCadencia) {
    const c = caso as Record<string, unknown>;
    const cadencia = c["cadencia"] as
      { diasSemTouchpoint?: unknown; status?: unknown; motivo?: unknown } | undefined;
    if (!cadencia) continue;
    if (cadencia.status !== "atencao" && cadencia.status !== "critico") continue;
    const id = String(c["id"] ?? "");
    if (!id) continue;
    if (jaExibidos?.has(`caso:${id}`)) continue;
    const rotulo = String(c["codigo"] ?? c["titulo"] ?? "Caso");
    if (!visivel(rotulo)) continue;
    const dias = Number(cadencia.diasSemTouchpoint);
    entradas.push({
      pessoaOuCasoId: `caso:${id}`,
      pessoa: rotulo,
      casoId: id,
      motivo: "cadencia_vencida",
      estado: String(cadencia.motivo ?? "Cadência fora do limite acordado."),
      responsavel: null,
      prazo: c["proxima_atualizacao_limite_em"]
        ? String(c["proxima_atualizacao_limite_em"]).slice(0, 10)
        : null,
      rotaDestino: rotaDe("caso", id),
      evidenciaOrigem: Number.isFinite(dias)
        ? `${dias} dia(s) sem touchpoint registrado.`
        : "Cadência calculada sobre o último touchpoint do caso.",
      recomendacao: RECOMENDACAO_POR_MOTIVO["cadencia_vencida"],
    });
  }

  return montarFilaFollowUp(entradas);
}
