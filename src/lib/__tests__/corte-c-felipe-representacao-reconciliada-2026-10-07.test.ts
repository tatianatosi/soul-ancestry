import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  pendenciasHumanasDoCaso,
  representacaoJaDocumentada,
  type MembroNucleoPendencia,
} from "@/lib/pendencias-humanas-caso";

/**
 * Retificação C (07/10/2026) — "relato representação pendente contradiz
 * representação documentada relatada anteriormente e mostrada nos parâmetros
 * (...) Medir registro, campo, timestamp, status e gate específico.
 * Identificar se texto/hook usa fonte antiga ou outra coluna."
 *
 * Medido no banco: NÃO era contradição, era espelho defasado.
 *  - `case_dependents.status_representacao` = "documentada" (07/10 13:18),
 *    com a decisão da Proprietária de 05/10 registrada no campo de documento,
 *    que diz que a certidão de nascimento segue NÃO anexada;
 *  - `nucleo_membros.representacao_necessaria` = false (18/08, nunca
 *    atualizado) — é esta a coluna que a regra lia;
 *  - `case_members.status_cadastral` = "pendente" → é CADASTRO, não
 *    representação;
 *  - `genealogical_person_profiles.client_visibility` = "interna" → bloqueia
 *    publicação por si só, regra separada da representação.
 *
 * Nenhum status e nenhuma visibilidade foram alterados: a correção é de
 * leitura.
 */

const caso = { id: "caso-1", dossie_mae_referencia: null } as never;
const hoje = new Date("2026-10-07T12:00:00Z");

const felipe = (over: Partial<MembroNucleoPendencia> = {}): MembroNucleoPendencia => ({
  nome: "Felipe",
  papel_no_caso: "dependente",
  vinculo: "filho menor",
  representacao_necessaria: false,
  ...over,
});

describe("representacaoJaDocumentada — qual fonte responde pela representação", () => {
  it("aceita o registro vigente do dependente", () => {
    expect(representacaoJaDocumentada(felipe({ status_representacao: "documentada" }))).toBe(true);
    expect(representacaoJaDocumentada(felipe({ status_representacao: "confirmada" }))).toBe(true);
  });

  it("o espelho do núcleo continua valendo quando é ele que está marcado", () => {
    expect(representacaoJaDocumentada(felipe({ representacao_necessaria: true }))).toBe(true);
  });

  it("sem nenhum dos dois, segue não documentada", () => {
    expect(representacaoJaDocumentada(felipe())).toBe(false);
    expect(representacaoJaDocumentada(felipe({ status_representacao: "pendente" }))).toBe(false);
  });
});

describe("a pendência de menor não se repete quando a representação está registrada", () => {
  it("espelho defasado + registro documentado => NÃO pede representação de novo", () => {
    const r = pendenciasHumanasDoCaso({
      caso,
      nucleo: null,
      membros: [felipe({ status_representacao: "documentada" })],
      leads: [],
      hoje,
    });
    expect(r.some((p) => p.tipo === "menor_sem_representacao")).toBe(false);
  });

  it("menor sem registro nenhum continua aparecendo — a proteção não foi afrouxada", () => {
    const r = pendenciasHumanasDoCaso({ caso, nucleo: null, membros: [felipe()], leads: [], hoje });
    const pendencia = r.find((p) => p.tipo === "menor_sem_representacao");
    expect(pendencia).toBeDefined();
    expect(pendencia!.titulo).toContain("Felipe");
  });
});

describe("o leitor passa a consultar o registro vigente, sem escrever nada", () => {
  const fn = readFileSync("src/lib/pendencias-humanas-caso.functions.ts", "utf8");

  it("lê case_dependents.status_representacao e o entrega à regra", () => {
    expect(fn).toContain('.from("case_dependents")');
    expect(fn).toContain("status_representacao");
    expect(fn).toContain("status_representacao: statusPorNome.get(");
  });

  it("não grava, não muda status nem visibilidade neste caminho", () => {
    expect(fn).not.toMatch(/\.update\(/);
    expect(fn).not.toMatch(/\.insert\(/);
    expect(fn).not.toContain("client_visibility");
  });
});
