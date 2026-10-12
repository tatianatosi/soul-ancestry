/**
 * Cinco etapas de leitura do Caso 360 (plano aprovado 12/10/2026).
 * Não é gate novo: só agrupa as verificações já existentes em
 * case_activation_checks. Fonte única para Caso 360, Lista de Casos, Radar e Painel.
 */
export type EstadoEtapa = "concluido" | "andamento" | "aguardando";

export const ETAPAS_CASO = [
  {
    id: "diagnostico",
    rotulo: "Diagnóstico",
    secao: "pessoas",
    chaves: ["cliente_identificado", "consentimento_registrado", "nucleo_familiar_conferido", "dossie_mae_criado"],
  },
  {
    id: "documentacao",
    rotulo: "Documentação",
    secao: "documentos",
    chaves: ["checklist_documental_e_plano_preparados", "escopo_definido"],
  },
  {
    id: "juridico",
    rotulo: "Jurídico",
    secao: "comercial",
    chaves: ["proposta_aprovada_ou_isencao_autorizada", "contrato_assinado_ou_isencao_autorizada"],
  },
  {
    id: "financeiro",
    rotulo: "Financeiro",
    secao: "financeiro",
    chaves: ["pagamento_confirmado_ou_condicao_financeira_autorizada"],
  },
  {
    id: "app_cliente",
    rotulo: "App Cliente",
    secao: "jornada",
    chaves: ["ambiente_acesso_definido", "aprovacao_interna_ativacao"],
  },
] as const;

export type CheckLido = { check_key: string; status: string; isencao_expira_em?: string | null };

export type EtapaCalculada = {
  id: (typeof ETAPAS_CASO)[number]["id"];
  rotulo: string;
  secao: string;
  feitos: number;
  total: number;
  estado: EstadoEtapa;
};

export const ROTULO_ESTADO_ETAPA: Record<EstadoEtapa, string> = {
  concluido: "Concluído",
  andamento: "Em andamento",
  aguardando: "Aguardando",
};

function satisfeito(c: CheckLido | undefined, agora: number): boolean {
  if (!c) return false;
  if (c.status === "isento") {
    return !c.isencao_expira_em || new Date(c.isencao_expira_em).getTime() >= agora;
  }
  return c.status === "validado" || c.status === "nao_aplicavel";
}

export function calcularEtapas(checks: CheckLido[], agora = Date.now()): EtapaCalculada[] {
  const mapa = new Map(checks.map((c) => [c.check_key, c]));
  return ETAPAS_CASO.map((e) => {
    const feitos = e.chaves.filter((k) => satisfeito(mapa.get(k), agora)).length;
    const total = e.chaves.length;
    const estado: EstadoEtapa = feitos === total ? "concluido" : feitos > 0 ? "andamento" : "aguardando";
    return { id: e.id, rotulo: e.rotulo, secao: e.secao, feitos, total, estado };
  });
}

/** Primeira etapa não concluída, na ordem; null quando todas concluídas. */
export function etapaAtual(etapas: EtapaCalculada[]): EtapaCalculada | null {
  return etapas.find((e) => e.estado !== "concluido") ?? null;
}
