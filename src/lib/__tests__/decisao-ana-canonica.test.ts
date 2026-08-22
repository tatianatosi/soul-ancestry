import { describe, expect, it } from "vitest";
import {
  DECISAO_ANA_CANONICA,
  divergenciaIdAnaEhBloqueio,
  ehReferenciaLegadaAna,
  linhaAuditoriaReferenciaLegada,
  resolverReferenciaAna,
  rotuloExibicaoAna,
} from "@/lib/decisao-ana-canonica";
import { BLOQUEIOS_PILOTO, PILOTO_ANA } from "@/lib/piloto-ana";
import { MATRIZ_PENDENCIAS } from "@/lib/varredura-completude";

describe("decisão canônica de Ana Luiza", () => {
  it("resolve o código canônico e a referência legada para o mesmo caso", () => {
    const canonico = resolverReferenciaAna("ca-cid-at-fam-2026-001");
    const legado = resolverReferenciaAna(" CA-AUT-ANALUIZA-FAM-2026-001 ");
    expect(canonico?.caseId).toBe(DECISAO_ANA_CANONICA.caseId);
    expect(legado?.caseId).toBe(DECISAO_ANA_CANONICA.caseId);
    expect(legado?.codigoCanonico).toBe("CA-CID-AT-FAM-2026-001");
    expect(legado?.viaAlias).toBe(true);
    expect(canonico?.viaAlias).toBe(false);
    expect(resolverReferenciaAna("CA-CID-PT-IND-2026-002")).toBeNull();
  });

  it("exibe apenas o código canônico, com 'Piloto real' como selo", () => {
    const r = rotuloExibicaoAna();
    expect(r.codigo).toBe("CA-CID-AT-FAM-2026-001");
    expect(r.nome).toBe("Projeto familiar — Ana Luiza");
    expect(r.nome).not.toContain("CA-AUT");
    expect(r.selo).toBe("Piloto real");
  });

  it("mantém o código legado no histórico com a nota de resolução", () => {
    expect(ehReferenciaLegadaAna("CA-2026-ANA-001")).toBe(true);
    expect(linhaAuditoriaReferenciaLegada("CA-AUT-ANALUIZA-FAM-2026-001")).toBe(
      "CA-AUT-ANALUIZA-FAM-2026-001 — Referência legada resolvida para CA-CID-AT-FAM-2026-001.",
    );
  });

  it("não é bloqueio, pendência nem gate aberto", () => {
    expect(divergenciaIdAnaEhBloqueio()).toBe(false);
    expect(BLOQUEIOS_PILOTO.some((b) => b.codigo === "id_canonico")).toBe(false);
    expect(PILOTO_ANA.id_canonico_decidido).toBe("CA-CID-AT-FAM-2026-001");
    const pend01 = MATRIZ_PENDENCIAS.find((l) => l.id === "PEND-01");
    expect(pend01?.status).toBe("RESOLVIDO_POR_DECISAO_DA_PROPRIETARIA");
    expect(pend01?.criticidade).toBe("baixo");
  });
});
