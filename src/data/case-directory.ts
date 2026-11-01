import type { CaseData } from "@/types/case";
import { activeCase } from "./activeCase";
import { caseDataGiovanna } from "./caseDataGiovanna";
import { caseDataSophia } from "./caseDataSophia";

/**
 * DIRETÓRIO DE CASOS.
 *
 * Cada cliente é carregado dinamicamente pelo `caseId` (parâmetro `?caso=` na
 * URL). Nenhuma tela deve importar um caso fixo: use `useActiveCase()`.
 */
export const CASE_DIRECTORY: CaseData[] = [caseDataGiovanna, caseDataSophia];

/**
 * Caso pelo id. Id ausente ou desconhecido devolve `activeCase` (modelo vazio),
 * nunca o caso de outro cliente: o dado de uma família não aparece para outra.
 */
export const casoPorId = (id?: string | null): CaseData =>
  CASE_DIRECTORY.find((c) => c.geral.case_id === id) ?? activeCase;

export const CASOS_DISPONIVEIS = CASE_DIRECTORY.map((c) => ({
  id: c.geral.case_id,
  nome: c.geral.cliente_nome,
}));
