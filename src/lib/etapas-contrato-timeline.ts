import type { PassoContrato } from "@/lib/contrato-prontidao";
import type { EtapaContratual } from "@/types/case";

/**
 * Passos reais da prontidão do contrato → etapas da timeline contratual.
 *
 * A timeline (`TimelineContratualDesk`) lia `caso.contratacao.timeline` de um
 * diretório de casos fictícios. Aqui ela passa a ler os MESMOS 8 passos que o
 * trilho de prontidão já calcula (proposta → assinatura): nenhuma etapa nova e
 * nenhuma data inventada. Data e responsável ficam vazios (a tela só mostra o
 * que está registrado).
 */
export function etapasContratuaisDosPassos(passos: PassoContrato[]): EtapaContratual[] {
  let primeiroPendenteVisto = false;
  return passos.map((p) => {
    let status: EtapaContratual["status"];
    if (p.estado === "ok") status = "concluido";
    else if (p.estado === "bloqueado") status = "bloqueado";
    else if (!primeiroPendenteVisto) {
      status = "em_andamento";
      primeiroPendenteVisto = true;
    } else status = "aguardando";
    return {
      id: p.chave,
      titulo: p.rotulo,
      status,
      data: "",
      responsavel: "",
      descricao: p.estado === "ok" ? p.detalhe : "",
      proxima_acao: p.estado === "ok" ? "" : p.detalhe,
      visibilidade: "interna" as const,
      motivo_bloqueio: p.estado === "bloqueado" ? p.detalhe : undefined,
    };
  });
}
