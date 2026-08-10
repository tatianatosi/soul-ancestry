import { useSearch } from "@tanstack/react-router";
import { casoPorId } from "@/data/case-directory";
import type { CaseData } from "@/types/case";

/**
 * Caso ativo resolvido dinamicamente pelo `caseId` da URL (`?caso=...`).
 * Sem parâmetro, cai no caso padrão do diretório.
 */
export function useActiveCase(): CaseData {
  const search = useSearch({ strict: false }) as { caso?: string };
  return casoPorId(search?.caso);
}

export function useActiveCaseId(): string {
  return useActiveCase().geral.case_id;
}
