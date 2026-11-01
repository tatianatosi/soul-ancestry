import type { CaseData } from "@/types/case";
import { caseDataGiovanna } from "./caseDataGiovanna";
import { caseDataSophia } from "./caseDataSophia";

/**
 * DIRETÓRIO DE CASOS.
 *
 * Cada cliente é carregado dinamicamente pelo `caseId` (parâmetro `?caso=` na
 * URL). Nenhuma tela deve importar um caso fixo: use `useActiveCase()`.
 */
export const CASE_DIRECTORY: CaseData[] = [caseDataGiovanna, caseDataSophia];

export const CASO_PADRAO_ID = caseDataGiovanna.geral.case_id;

export const casoPorId = (id?: string | null): CaseData =>
  CASE_DIRECTORY.find((c) => c.geral.case_id === id) ??
  CASE_DIRECTORY.find((c) => c.geral.case_id === CASO_PADRAO_ID)!;

export const CASOS_DISPONIVEIS = CASE_DIRECTORY.map((c) => ({
  id: c.geral.case_id,
  nome: c.geral.cliente_nome,
}));
