/**
 * G-05 — Relatórios de fase do caso (F1..F5 e memória de legado).
 *
 * Este módulo apenas descreve e valida o registro canônico dos relatórios que
 * já existem na operação. Não gera PDF, não envia ao cliente e não publica no
 * App. Relatório é entrega robusta e nunca substitui evidência, documento,
 * achado ou micro-entrega.
 */

export type TipoRelatorio =
  | "REPORT_F1_DIAGNOSTICO"
  | "REPORT_F2_PESQUISA"
  | "REPORT_F3_PRONTIDAO_DOCUMENTAL"
  | "REPORT_F4_PROTOCOLO"
  | "REPORT_F5_CONCLUSAO"
  | "REPORT_MEM_LEGADO";

export type StatusRelatorio =
  | "a_preparar"
  | "em_elaboracao"
  | "em_revisao"
  | "aprovado_internamente"
  | "entregue"
  | "arquivado";

export type RelacaoEvidencia = "principal" | "suporte" | "pendencia" | "contraponto";

export const TIPOS_RELATORIO: { valor: TipoRelatorio; rotulo: string; fase: string; descricao: string }[] = [
  {
    valor: "REPORT_F1_DIAGNOSTICO",
    rotulo: "F1 — Relatório de Diagnóstico e Direcionamento",
    fase: "fase_1_diagnostico",
    descricao: "Consolida o diagnóstico do caso e o direcionamento da jornada. Inicia somente com dados reais do caso.",
  },
  {
    valor: "REPORT_F2_PESQUISA",
    rotulo: "F2 — Relatório de Pesquisa Genealógica e Evidências",
    fase: "fase_2_pesquisa",
    descricao: "Consolida a pesquisa e as evidências reunidas. Não inicia automaticamente por haver proposta aprovada.",
  },
  {
    valor: "REPORT_F3_PRONTIDAO_DOCUMENTAL",
    rotulo: "F3 — Relatório de Prontidão Documental",
    fase: "fase_3_prontidao",
    descricao: "Consolida a prontidão dos documentos reunidos para a fase seguinte.",
  },
  {
    valor: "REPORT_F4_PROTOCOLO",
    rotulo: "F4 — Relatório de Protocolo",
    fase: "fase_4_protocolo",
    descricao: "Consolida o protocolo e seus registros internos.",
  },
  {
    valor: "REPORT_F5_CONCLUSAO",
    rotulo: "F5 — Relatório de Conclusão",
    fase: "fase_5_conclusao",
    descricao: "Consolida o encerramento do ciclo contratado.",
  },
  {
    valor: "REPORT_MEM_LEGADO",
    rotulo: "Memória de Legado",
    fase: "memoria_legado",
    descricao: "Consolida a memória familiar como entrega de legado.",
  },
];

export const STATUS_RELATORIO: { valor: StatusRelatorio; rotulo: string }[] = [
  { valor: "a_preparar", rotulo: "A preparar" },
  { valor: "em_elaboracao", rotulo: "Em elaboração" },
  { valor: "em_revisao", rotulo: "Em revisão" },
  { valor: "aprovado_internamente", rotulo: "Aprovado internamente" },
  { valor: "entregue", rotulo: "Entregue" },
  { valor: "arquivado", rotulo: "Arquivado" },
];

export const RELACOES_EVIDENCIA: { valor: RelacaoEvidencia; rotulo: string }[] = [
  { valor: "principal", rotulo: "Principal" },
  { valor: "suporte", rotulo: "Suporte" },
  { valor: "pendencia", rotulo: "Pendência" },
  { valor: "contraponto", rotulo: "Contraponto" },
];

/** Campos internos que nunca podem sair em projeção ao App. */
export const CAMPOS_NUNCA_NO_APP = ["link_interno", "observacao_interna", "revisor_id", "data_origin"];

export function rotuloTipo(valor: string): string {
  return TIPOS_RELATORIO.find((t) => t.valor === valor)?.rotulo ?? valor;
}

export function faseDoTipo(valor: string): string {
  return TIPOS_RELATORIO.find((t) => t.valor === valor)?.fase ?? "indefinida";
}

export function rotuloStatus(valor: string): string {
  return STATUS_RELATORIO.find((s) => s.valor === valor)?.rotulo ?? valor;
}

export type RelatorioEntrada = {
  report_type?: unknown;
  report_status?: unknown;
  fase_jornada?: unknown;
  versao?: unknown;
  data_aprovacao?: unknown;
  data_entrega?: unknown;
  resumo_aprovado_cliente?: unknown;
  publicado_no_app?: unknown;
};

/** Validação de formulário espelhando as travas do banco. */
export function validarRelatorio(v: RelatorioEntrada): string[] {
  const erros: string[] = [];
  const tipo = String(v.report_type ?? "");
  const status = String(v.report_status ?? "");

  if (!TIPOS_RELATORIO.some((t) => t.valor === tipo)) erros.push("Selecione um tipo de relatório do dicionário.");
  if (!STATUS_RELATORIO.some((s) => s.valor === status)) erros.push("Selecione uma situação do dicionário.");
  if (Number(v.versao ?? 1) < 1) erros.push("A versão começa em 1.");

  if ((status === "aprovado_internamente" || status === "entregue") && !v.data_aprovacao) {
    erros.push("Data de aprovação é obrigatória a partir de aprovado internamente.");
  }
  if (status === "entregue") {
    if (!v.data_entrega) erros.push("Data de entrega é obrigatória quando o relatório está entregue.");
    if (!String(v.resumo_aprovado_cliente ?? "").trim()) {
      erros.push("Entrega exige resumo aprovado e sanitizado para o cliente.");
    }
  }
  if (v.publicado_no_app === true) {
    if (status !== "entregue") erros.push("Relatório não entregue não pode ser publicado no App.");
    if (!String(v.resumo_aprovado_cliente ?? "").trim()) erros.push("Publicação exige projeção aprovada e sanitizada.");
  }
  return erros;
}

/** Um relatório só chega ao App quando entregue, publicado e com resumo aprovado. */
export function visivelNoApp(r: { report_status?: unknown; publicado_no_app?: unknown; resumo_aprovado_cliente?: unknown }): boolean {
  return (
    r.publicado_no_app === true &&
    String(r.report_status ?? "") === "entregue" &&
    String(r.resumo_aprovado_cliente ?? "").trim().length > 0
  );
}

/** Projeção mínima e sanitizada para o App Cliente. */
export function projetarParaApp(r: Record<string, unknown>): { titulo: string; fase: string; resumo: string; data_entrega: string | null } | null {
  if (!visivelNoApp(r)) return null;
  return {
    titulo: rotuloTipo(String(r.report_type ?? "")),
    fase: String(r.fase_jornada ?? faseDoTipo(String(r.report_type ?? ""))),
    resumo: String(r.resumo_aprovado_cliente ?? ""),
    data_entrega: (r.data_entrega as string) ?? null,
  };
}

/** Deduplica vínculos: uma evidência entra uma única vez por relatório. */
export function vincularEvidencia<T extends { report_id: string; evidence_id: string }>(existentes: T[], novo: T): T[] {
  const jaExiste = existentes.some((e) => e.report_id === novo.report_id && e.evidence_id === novo.evidence_id);
  return jaExiste ? existentes : [...existentes, novo];
}

/**
 * Micro-entrega nunca cria relatório: ela se vincula a um relatório existente
 * da mesma fase. Sem relatório correspondente, o vínculo é recusado.
 */
export function resolverRelatorioDaMicroentrega(
  relatorios: { id: string; report_type: string; fase_jornada: string }[],
  microentrega: { fase: string },
): { ok: true; reportId: string } | { ok: false; motivo: string } {
  const alvo = relatorios.find((r) => r.fase_jornada === microentrega.fase);
  if (!alvo) {
    return { ok: false, motivo: "Não há relatório desta fase. Micro-entrega não cria relatório novo." };
  }
  return { ok: true, reportId: alvo.id };
}

/** F1 e F2 são cards distintos, nunca fundidos. */
export function cardsDeFase(relatorios: { report_type: string }[]) {
  return TIPOS_RELATORIO.map((t) => ({
    tipo: t.valor,
    rotulo: t.rotulo,
    fase: t.fase,
    descricao: t.descricao,
    existentes: relatorios.filter((r) => r.report_type === t.valor).length,
  }));
}
