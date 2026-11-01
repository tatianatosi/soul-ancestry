import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { rotuloTarefaDoCaso, separarTarefasDoCaso } from "@/lib/tarefas-do-caso";

/**
 * Resgate da PR #32 (31/10/2026) — o que sobrou dela depois do #199, do #204 e
 * do formulário de tarefa que o Caso 360 já tem: o cartão "Tarefas" separa
 * abertas de encerradas e mostra rótulo legível em vez do código do status.
 *
 * Partes da #32 que a `main` já cumpria e por isso NÃO foram portadas:
 *  - criar tarefa no caso: `FormularioTarefaCaso` (responsável, prazo, prioridade);
 *  - cartões mobile de Partes: `CardsPartes` (md:hidden) + `Tabela` (hidden md:block);
 *  - safe-area do rodapé: `saas/shell.tsx`; o botão do assistente só existe em md:.
 */
describe("Cartão Tarefas da ficha do Caso 360", () => {
  const tarefas = [
    { id: "1", titulo: "Pedir certidão", status: "em_andamento", prioridade: "alta" },
    { id: "2", titulo: "Conferir nome", status: "nao_iniciada", prioridade: "media" },
    { id: "3", titulo: "Enviar anexo", status: "concluida", prioridade: "baixa" },
    { id: "4", titulo: "Contato antigo", status: "cancelada", prioridade: "baixa" },
  ];

  it("separa abertas de concluídas e canceladas", () => {
    const { abertas, encerradas } = separarTarefasDoCaso(tarefas);
    expect(abertas.map((t) => t.id)).toEqual(["1", "2"]);
    expect(encerradas.map((t) => t.id)).toEqual(["3", "4"]);
  });

  it("sem tarefas, nada aberto e nada encerrado (sem lançar)", () => {
    expect(separarTarefasDoCaso(undefined)).toEqual({ abertas: [], encerradas: [] });
    expect(separarTarefasDoCaso(null)).toEqual({ abertas: [], encerradas: [] });
  });

  it("tarefa só concluída não conta como aberta", () => {
    expect(separarTarefasDoCaso([tarefas[2]]).abertas).toEqual([]);
  });

  it("mostra status e prioridade pelo vocabulário real, não pelo código", () => {
    expect(rotuloTarefaDoCaso(tarefas[0])).toBe("Em andamento · Alta");
    expect(rotuloTarefaDoCaso(tarefas[1])).toBe("Não iniciada · Média");
  });

  it("vocabulário desconhecido aparece como veio, nunca inventado", () => {
    expect(rotuloTarefaDoCaso({ id: "x", status: "novo_status", prioridade: null })).toBe(
      "novo_status",
    );
    expect(rotuloTarefaDoCaso({ id: "y" })).toBe("");
  });

  it("a ficha usa o helper e mantém o formulário que já existia", () => {
    const fonte = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    expect(fonte).toContain('from "@/lib/tarefas-do-caso"');
    expect(fonte).toContain("separarTarefasDoCaso(qTarefas.data?.tarefas)");
    expect(fonte).toContain("rotuloTarefaDoCaso(t)");
    expect(fonte).toContain("<FormularioTarefaCaso caseId={id}");
    // não nasce um segundo formulário de criação de tarefa
    expect(fonte).not.toMatch(/\bTarefasDoCaso\b/);
  });

  it("as três partes que a main já cumpria continuam no lugar", () => {
    const contrato = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");
    expect(contrato).toContain("CardsPartes");
    expect(contrato).toContain('className="flex flex-col gap-2 md:hidden"');
    expect(contrato).toContain('className="hidden overflow-x-auto md:block"');
    expect(readFileSync("src/components/saas/shell.tsx", "utf8")).toContain(
      "safe-area-inset-bottom",
    );
  });
});
