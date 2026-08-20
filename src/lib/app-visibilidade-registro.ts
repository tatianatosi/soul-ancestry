import type { CaseRecord } from "@/data/case-registry";

import type { EscopoCliente } from "./app-visibilidade";

/**
 * Deriva o escopo de visibilidade do App a partir do registro do caso.
 * Fonte: case_service/proposta aprovada (aqui projetada pelo registro).
 * Nenhum prazo ou data é inferido.
 */
export function escopoDoRegistro(registro: CaseRecord): EscopoCliente {
  const f1 = registro.phase1Status;
  const f2 = registro.phase2Status;

  const fase1Contratada = f1 !== "Não prevista";
  const fase1Status: EscopoCliente["fase1Status"] = !fase1Contratada
    ? "nao_prevista"
    : f1 === "Entregue"
      ? "entregue"
      : f1 === "Diagnóstico inicial disponível"
        ? "disponivel"
        : "em_preparacao";

  const escopoIncluiFase2 = f2 !== "Não prevista";
  const fase2Status: EscopoCliente["fase2Status"] = !escopoIncluiFase2
    ? "nao_aplicavel"
    : f2 === "Entregue"
      ? "entregue"
      : f2 === "Diagnóstico inicial disponível"
        ? "disponivel"
        : f2 === "Prevista"
          ? "prevista"
          : "em_preparacao";

  const entregasLiberadas = registro.reports.filter((r) => r.status === "Entregue").length;

  return {
    temAcesso: true,
    entregasLiberadas,
    fase1Contratada,
    fase1Status,
    escopoIncluiFase2,
    fase2Status,
  };
}
