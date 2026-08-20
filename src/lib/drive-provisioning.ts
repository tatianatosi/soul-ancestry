/**
 * Fila de provisionamento do Drive — preparação, nunca execução.
 *
 * Nada aqui cria, move ou exclui pasta/arquivo. A fila apenas declara a
 * estrutura desejada e o estado de liberação. Execução futura exige
 * confirmação humana e registro do resultado externo.
 */

export const STATUS_FILA_DRIVE = [
  { valor: "blocked", rotulo: "Bloqueada" },
  { valor: "ready_for_review", rotulo: "Pronta para revisão" },
  { valor: "approved", rotulo: "Aprovada" },
  { valor: "executed", rotulo: "Executada" },
  { valor: "failed", rotulo: "Falhou" },
  { valor: "cancelled", rotulo: "Cancelada" },
] as const;
export type StatusFilaDrive = (typeof STATUS_FILA_DRIVE)[number]["valor"];

export const GATILHOS_FILA = [
  { valor: "oportunidade", rotulo: "Oportunidade" },
  { valor: "confirmacao_formal", rotulo: "Confirmação formal" },
  { valor: "contrato_assinado", rotulo: "Contrato assinado" },
  { valor: "pagamento_confirmado", rotulo: "Pagamento confirmado" },
  { valor: "onboarding_aprovado", rotulo: "Onboarding aprovado" },
] as const;

export type GatesDrive = {
  contrato_assinado?: boolean;
  pagamento_confirmado?: boolean;
  onboarding_aprovado?: boolean;
};

export type AvaliacaoFilaDrive = {
  status: StatusFilaDrive;
  executaDrive: false;
  motivos: string[];
};

/**
 * Situação da fila a partir do gatilho e dos gates reais do caso.
 * Oportunidade nunca sai de "bloqueada"; confirmação formal só cria item
 * bloqueado; a fila só fica pronta para revisão com contrato assinado,
 * pagamento confirmado e onboarding aprovado.
 */
export function avaliarFilaDrive(stage: string, gates: GatesDrive): AvaliacaoFilaDrive {
  const motivos: string[] = [];
  if (stage === "oportunidade") {
    return { status: "blocked", executaDrive: false, motivos: ["Oportunidade não cria dossiê operacional."] };
  }
  if (stage === "confirmacao_formal") {
    return {
      status: "blocked",
      executaDrive: false,
      motivos: ["Confirmação formal cria apenas item de fila bloqueado; nenhuma pasta é criada."],
    };
  }
  if (!gates.contrato_assinado) motivos.push("Contrato assinado pendente.");
  if (!gates.pagamento_confirmado) motivos.push("Pagamento confirmado pendente.");
  if (!gates.onboarding_aprovado) motivos.push("Onboarding aprovado pendente.");
  if (motivos.length) return { status: "blocked", executaDrive: false, motivos };
  return {
    status: "ready_for_review",
    executaDrive: false,
    motivos: ["Gates completos: fila elegível para revisão humana. Execução não é automática."],
  };
}

/** Transições permitidas. Execução exige aprovação humana e resultado registrado. */
export function podeTransicionar(
  de: StatusFilaDrive,
  para: StatusFilaDrive,
  ctx: { aprovadoPor?: string | null; resultadoExterno?: string | null } = {},
): { ok: boolean; motivo?: string } {
  const permitidas: Record<StatusFilaDrive, StatusFilaDrive[]> = {
    blocked: ["ready_for_review", "cancelled"],
    ready_for_review: ["approved", "blocked", "cancelled"],
    approved: ["executed", "failed", "cancelled"],
    executed: [],
    failed: ["ready_for_review", "cancelled"],
    cancelled: [],
  };
  if (!permitidas[de].includes(para)) return { ok: false, motivo: `Transição ${de} → ${para} não permitida.` };
  if (para === "approved" && !ctx.aprovadoPor) return { ok: false, motivo: "Aprovação exige responsável humano registrado." };
  if (para === "executed" && !ctx.resultadoExterno?.trim())
    return { ok: false, motivo: "Execução exige referência do resultado externo registrada." };
  return { ok: true };
}

/** Nunca há exclusão automática no Drive. */
export function podeExcluirNoDrive(): false {
  return false;
}

export const ESTRUTURA_PADRAO_DOSSIE = [
  "00_Dossie_Mae",
  "01_Documentos_Cliente",
  "02_Evidencias",
  "03_Relatorios",
  "04_Contratos_e_Comercial",
  "05_Protocolo",
];
