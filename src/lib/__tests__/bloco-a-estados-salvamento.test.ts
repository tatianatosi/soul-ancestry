import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { ESTADOS_SALVAMENTO, horaAgora } from "../persistencia-erros";

/**
 * Bloco A da ordem "Execução Técnica Total" (21/09/2026).
 *
 * `ESTADOS_SALVAMENTO` existia em `persistencia-erros.ts` com ZERO
 * consumidores em `src/` — peça órfã. Enquanto isso, a mesma lista de
 * rótulos ("Salvando…", "Alterações não salvas", "Salvo às …", "Sem
 * alterações pendentes") estava reescrita à mão em três pontos do Caso 360.
 *
 * A regra do projeto é conectar peça órfã existente antes de criar
 * arquitetura paralela. Estes testes impedem que ela volte a ficar órfã e
 * que os rótulos se dupliquem de novo.
 */

const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("vocabulário de salvamento tem uma fonte só", () => {
  it("o Caso 360 consome ESTADOS_SALVAMENTO", () => {
    expect(caso360).toContain("ESTADOS_SALVAMENTO");
    expect(caso360).toContain('from "@/lib/persistencia-erros"');
  });

  it("os rótulos não estão mais escritos à mão na tela", () => {
    // Reintroduzir qualquer um deles como literal devolve a duplicação.
    expect(caso360).not.toContain('"Salvando…"');
    expect(caso360).not.toContain('"Alterações não salvas"');
    expect(caso360).not.toContain("`Salvo às ${");
    expect(caso360).not.toContain('"Sem alterações pendentes"');
  });

  it("os quatro estados continuam disponíveis e com o texto esperado", () => {
    expect(ESTADOS_SALVAMENTO.salvando).toBe("Salvando…");
    expect(ESTADOS_SALVAMENTO.sujo).toBe("Alterações não salvas");
    expect(ESTADOS_SALVAMENTO.limpo).toBe("Sem alterações pendentes");
    expect(ESTADOS_SALVAMENTO.salvo("14:32")).toBe("Salvo às 14:32");
  });

  it("a hora do salvamento sai no formato pt-BR de hora e minuto", () => {
    const hora = horaAgora(new Date("2026-09-21T14:32:00"));
    expect(hora).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("estado de erro continua distinto de estado vazio", () => {
  it('erro de gravação mostra "Não salvo", não um dos estados de sucesso', () => {
    // Distinguir erro de "nada mudou" é regra do projeto: falha tem de ser
    // visível, nunca silenciosa nem confundida com ausência de alteração.
    expect(caso360).toContain('"Não salvo"');
    expect(caso360).toContain("classificarErroPersistencia");
  });
});
