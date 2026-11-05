import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { decisaoHumanaAtual } from "@/lib/decisao-humana-contrato";

/** Fila v2, bloco B (05/11/2026): contrato — B05. */
const ler = (p: string) => readFileSync(p, "utf8");
const tela = ler("src/routes/_authenticated/contratos.$id.tsx");

describe("B05 — decisão humana atual (causa, impacto, responsável)", () => {
  it("aprovado para envio: envio é ato externo e o cliente ainda não recebeu", () => {
    const d = decisaoHumanaAtual({ status: "approved_for_send", responsavelNome: "Tatiana" });
    expect(d.causa).toContain("Enviar é ato externo");
    expect(d.impacto).toBe("O cliente ainda não recebeu o contrato.");
    expect(d.responsavel).toBe("Tatiana");
  });

  it("sem responsável e cancelado: ausência explícita e motivo gravado", () => {
    const d = decisaoHumanaAtual({ status: "cancelled", motivoCancelamento: "Família desistiu" });
    expect(d.causa).toBe("Contrato cancelado — Família desistiu");
    expect(d.responsavel).toBe("Responsável pela revisão não definido");
  });

  it("rascunho com pendência do checklist mostra a pendência como causa", () => {
    const d = decisaoHumanaAtual({ status: "draft", pendenciaChecklist: "2 bloqueio(s) formal(is) no checklist jurídico." });
    expect(d.causa).toContain("2 bloqueio(s)");
  });

  it("instrumento em preparação com versão aprovada: diz qual versão está aprovada e qual está em preparo", () => {
    const d = decisaoHumanaAtual({
      status: "pending_data",
      versoes: [
        { numero: 6, status: "approved_for_send" },
        { numero: 7, status: "working" },
      ],
    });
    expect(d.causa).toBe("A versão 6 está aprovada para envio. A versão 7, mais recente, está em preparação.");
    expect(d.impacto).toContain("o cliente ainda não recebeu");
  });

  it("o card aparece no topo do instrumento com o selo de atos externos", () => {
    expect(tela).toContain("<DecisaoHumanaAtual");
    expect(ler("src/components/contrato/decisao-humana-atual.tsx")).toContain('texto="Sem atos externos automáticos"');
  });
});
