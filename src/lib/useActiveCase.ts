import { useRouterState } from "@tanstack/react-router";
import { casoPorId } from "@/data/case-directory";
import type { CaseData } from "@/types/case";

/**
 * Caso ativo resolvido dinamicamente pelo `caseId` da URL (`?caso=...`).
 * Sem parâmetro, cai no caso padrão do diretório.
 */
export function useActiveCase(): CaseData {
  const search = useRouterState({ select: (s) => s.location.search }) as Record<string, unknown>;
  const id = typeof search?.["caso"] === "string" ? (search["caso"] as string) : undefined;
  return casoPorId(id);
}

export function useActiveCaseId(): string {
  return useActiveCase().geral.case_id;
}
