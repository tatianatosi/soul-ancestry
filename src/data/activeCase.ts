import { caseDataGiovanna } from "./caseDataGiovanna";

/**
 * FALLBACK DO CASO ATIVO.
 *
 * O app agora resolve o cliente dinamicamente pelo `caseId` da URL
 * (`useActiveCase()` em `src/lib/useActiveCase.ts`, diretório em
 * `src/data/case-directory.ts`). Esta constante é apenas o caso padrão usado
 * quando nenhum `caseId` é informado.
 */
export const activeCase = caseDataGiovanna;
