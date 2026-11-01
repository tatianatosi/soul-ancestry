import { caseTemplate } from "./caseTemplate";

/**
 * FALLBACK DO CASO ATIVO.
 *
 * O app resolve o cliente dinamicamente pelo `caseId` da URL (`useActiveCase()`
 * em `src/lib/useActiveCase.ts`, diretório em `src/data/case-directory.ts`).
 * Esta constante é o que a tela recebe quando nenhum `caseId` é informado ou
 * quando ele não existe no diretório.
 *
 * 31/10/2026 — antes apontava para `caseDataGiovanna` (caso de um cliente
 * real): quem abrisse a tela sem `?caso=` via os dados de outro cliente. Agora
 * é o modelo vazio: campos vazios são ocultados na interface, que mostra o
 * estado honesto de "sem caso", nunca o dado de outra família.
 */
export const activeCase = caseTemplate;
