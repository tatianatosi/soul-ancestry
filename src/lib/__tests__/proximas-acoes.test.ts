import { describe, expect, it } from "vitest";

import type { LeadDesk } from "@/lib/crm-desk";
import { estadoAcao, listaAcoes, pendenciasAcao, resumoAcoes } from "@/lib/proximas-acoes";

const HOJE = new Date("2026-08-22T12:00:00Z");

const lead = (p: Partial<LeadDesk>): LeadDesk => ({ id: crypto.randomUUID(), nome: "Lead", ...p }) as LeadDesk;

describe("próximas ações", () => {
  it("deriva o estado a partir do prazo", () => {
    expect(estadoAcao(lead({}), HOJE)).toBe("sem_acao");
    expect(estadoAcao(lead({ proxima_acao: "agendar_call" }), HOJE)).toBe("sem_data");
    expect(estadoAcao(lead({ proxima_acao: "agendar_call", proxima_acao_em: "2026-08-20" }), HOJE)).toBe("atrasada");
    expect(estadoAcao(lead({ proxima_acao: "agendar_call", proxima_acao_em: "2026-08-22" }), HOJE)).toBe("hoje");
    expect(estadoAcao(lead({ proxima_acao: "agendar_call", proxima_acao_em: "2026-08-26" }), HOJE)).toBe("proxima");
    expect(estadoAcao(lead({ proxima_acao: "agendar_call", proxima_acao_em: "2026-10-01" }), HOJE)).toBe("futura");
  });

  it("gera uma única linha por lead e ignora arquivados e testes", () => {
    const id = crypto.randomUUID();
    const linhas = listaAcoes(
      [
        lead({ id, proxima_acao: "agendar_call", proxima_acao_em: "2026-08-20" }),
        lead({ id, proxima_acao: "enviar_proposta", proxima_acao_em: "2026-08-21" }),
        lead({ archived_at: "2026-08-01T00:00:00Z" }),
        lead({ dados_teste: true }),
      ],
      { hoje: HOJE },
    );
    expect(linhas).toHaveLength(1);
    expect(linhas[0]?.diasAtraso).toBe(2);
  });

  it("prioriza atrasadas e hoje na ordenação", () => {
    const linhas = listaAcoes(
      [
        lead({ proxima_acao: "agendar_call", proxima_acao_em: "2026-10-01" }),
        lead({ proxima_acao: "agendar_call", proxima_acao_em: "2026-08-22" }),
        lead({ proxima_acao: "agendar_call", proxima_acao_em: "2026-08-10" }),
      ],
      { hoje: HOJE },
    );
    expect(linhas.map((l) => l.estado)).toEqual(["atrasada", "hoje", "futura"]);
  });

  it("aponta pendências de saneamento sem juízo de mérito", () => {
    expect(pendenciasAcao(lead({}))).toHaveLength(2);
    expect(pendenciasAcao(lead({ proxima_acao: "agendar_call", proxima_acao_em: "2026-08-30", responsavel_nome: "Tati" }))).toEqual([]);
  });

  it("resume a fila com cada linha em um único estado", () => {
    const linhas = listaAcoes(
      [
        lead({ proxima_acao: "agendar_call", proxima_acao_em: "2026-08-10", responsavel_nome: "Tati" }),
        lead({ proxima_acao: "agendar_call" }),
      ],
      { hoje: HOJE },
    );
    const r = resumoAcoes(linhas);
    expect(r.total).toBe(2);
    expect(r.atrasada + r.sem_data).toBe(2);
    expect(r.pendentesSaneamento).toBe(1);
  });
});
