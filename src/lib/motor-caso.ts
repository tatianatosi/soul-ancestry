/**
 * Motor unificado de caso — superfície única, sem tabelas novas.
 *
 * Desk: a RPC `proxima_acao_prioritaria` / `_lote` já é o escritor de
 * decisão (SQL, 05/09). `obterProximaAcaoCanonica` empacota o resultado.
 * Este módulo não recalcula prioridade: só (1) nomeia o grafo de entidades
 * reais e (2) projeta a mesma ordem para o App Cliente com sinais que o
 * portal já está autorizado a ler.
 *
 * Não criar `case_participants`, `citizenship_cases`, nem vocabulário CHECK.
 */

import { MOTORES_TABELAS } from "@/lib/motores-tabelas";
import {
  obterProximaAcaoCanonica,
  SELO_PROXIMA_ACAO,
  type ProximaAcaoCanonica,
} from "@/lib/caso-ficha";

export { obterProximaAcaoCanonica, SELO_PROXIMA_ACAO };
export type { ProximaAcaoCanonica };
export { MOTORES_TABELAS };

/** Níveis da RPC `proxima_acao_prioritaria` (nível 7 nunca existiu no banco). */
export const NIVEIS_PROXIMA_ACAO = {
  ativacao: 1,
  tarefaVencida: 2,
  tarefaHoje: 3,
  documentoCliente: 4,
  propostaContrato: 5,
  pagamento: 6,
  manual: 8,
  indefinido: 9,
} as const;

/**
 * Conceito de produto → tabelas que já existem.
 * Participantes do caso: `case_members` / `case_dependents` / `nucleo_membros`.
 */
export const ENTIDADES_MOTOR = [
  {
    conceito: "Pessoa",
    tabelas: ["clientes", "contacts", "client_contacts", "genealogical_person_profiles"] as const,
    ligaPor: ["id", "cliente_id"] as const,
  },
  {
    conceito: "Núcleo",
    tabelas: ["nucleos_familiares", "nucleo_membros", "case_dependents"] as const,
    ligaPor: ["case_id", "nucleo_id"] as const,
  },
  {
    conceito: "Lead",
    tabelas: ["leads"] as const,
    ligaPor: ["id", "case_id", "cliente_id"] as const,
  },
  {
    conceito: "Caso",
    tabelas: ["crm_casos"] as const,
    ligaPor: ["id"] as const,
  },
  {
    conceito: "Pesquisa",
    tabelas: ["research_cases", "research_people", "research_sources"] as const,
    ligaPor: ["id", "case_id"] as const,
  },
  {
    conceito: "Contrato",
    tabelas: ["contracts", "invoices", "payments"] as const,
    ligaPor: ["id", "case_id"] as const,
  },
] as const;

export type ConceitoMotor = (typeof ENTIDADES_MOTOR)[number]["conceito"];

/** Nomes hipotéticos de prompts antigos — não criar, não consultar como eixo. */
export const ENTIDADES_HIPOTETICAS_NAO_CRIAR = [
  "case_participants",
  "citizenship_cases",
  "onboarding_runs",
  "cadence_runs",
] as const;

export type SinalClienteProximaAcao = {
  documentosPendentes: number;
  pagamentoPendente: boolean;
  casoAtivo: boolean;
  casoEncerrado: boolean;
  casoPausado: boolean;
};

export type DestinoProximaAcaoCliente = "/portal/documentos" | "/portal/conta" | "/portal/jornada" | null;

export type ProximaAcaoCliente = {
  acao: string;
  /** Equivale ao nível da RPC visível ao cliente (4, 6) ou fallback (9). */
  nivelEquivalente: 4 | 6 | 9;
  destino: DestinoProximaAcaoCliente;
};

/**
 * Mesma ordem da RPC, só com fatos que o portal já lê (document_requests /
 * invoices). Níveis 1–3 e 5 não vazam: são tarefa interna, bloqueio de
 * ativação ou proposta/contrato sem policy de portal.
 */
export function projetarProximaAcaoCliente(s: SinalClienteProximaAcao): ProximaAcaoCliente {
  if (s.casoEncerrado) {
    return {
      acao: "Este acompanhamento está encerrado.",
      nivelEquivalente: 9,
      destino: null,
    };
  }
  if (s.casoPausado) {
    return {
      acao: "Este acompanhamento está pausado. A equipe retoma o contato quando for o momento.",
      nivelEquivalente: 9,
      destino: null,
    };
  }
  if (s.documentosPendentes > 0) {
    return {
      acao:
        s.documentosPendentes === 1
          ? "Há 1 documento para você enviar."
          : `Há ${s.documentosPendentes} documentos para você enviar.`,
      nivelEquivalente: 4,
      destino: "/portal/documentos",
    };
  }
  if (s.pagamentoPendente) {
    return {
      acao: "Há um pagamento em aberto deste acompanhamento.",
      nivelEquivalente: 6,
      destino: "/portal/conta",
    };
  }
  if (s.casoAtivo) {
    return {
      acao: "A equipe está avançando no seu acompanhamento.",
      nivelEquivalente: 9,
      destino: "/portal/jornada",
    };
  }
  return {
    acao: "Assim que houver um próximo passo para você, ele aparece aqui.",
    nivelEquivalente: 9,
    destino: null,
  };
}

/** Status simples do portal → sinais do motor (sem segunda narrativa). */
export function sinaisDoCasoPortal(input: {
  status?: unknown;
  ativo?: unknown;
  suspensoEm?: unknown;
  documentosPendentes: number;
  pagamentoPendente: boolean;
}): SinalClienteProximaAcao {
  const bruto = String(input.status ?? "").toLowerCase();
  const pausado = ["pausado", "suspenso", "em_pausa"].includes(bruto) || Boolean(input.suspensoEm);
  const encerrado = ["concluido", "encerrado", "finalizado", "entregue"].includes(bruto);
  const ativo =
    !pausado &&
    !encerrado &&
    (input.ativo === true || ["ativo", "em_execucao", "em_andamento"].includes(bruto));
  return {
    documentosPendentes: input.documentosPendentes,
    pagamentoPendente: input.pagamentoPendente,
    casoAtivo: ativo,
    casoEncerrado: encerrado,
    casoPausado: pausado,
  };
}

const TERMOS_INTERNOS =
  /\b(gate|sku|crm|desk|fila|sla|tarefa vencida|bloqueio de ativação|case_ativacao|próxima_acao)\b/i;

/** Texto de cliente nunca reproduz motivo cru da RPC (título de tarefa, tabela, gate). */
export function rpcVazaParaCliente(motivo: string): boolean {
  return TERMOS_INTERNOS.test(motivo) || /Tarefa (vencida|com vencimento hoje):/i.test(motivo);
}
