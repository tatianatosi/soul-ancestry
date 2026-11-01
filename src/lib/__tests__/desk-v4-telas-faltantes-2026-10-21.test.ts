import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { conversaoPorEtapaV4, funilV4, origemDoLead } from "@/components/crm/comercial-v4-topo";
import { completudeFormal } from "@/components/contratos/juridico-contrato-v4";
import { separarAcessosDoCaso } from "@/components/desk/nucleos-acesso-caso";
import type { LeadDesk } from "@/lib/crm-desk";

const lead = (p: Partial<LeadDesk>) => ({ id: Math.random().toString(), nome: "x", ...p }) as LeadDesk;

describe("Funil comercial V4 em /calls", () => {
  it("conta pela etapa gravada e deixa perdidos/encerrados fora", () => {
    const f = funilV4([
      lead({ eixo_comercial: "discovery_realizada" }),
      lead({ eixo_comercial: "proposta_enviada" }),
      lead({ eixo_comercial: "perdido" }),
      lead({}),
    ]);
    expect(f.map((x) => x.total)).toEqual([1, 1, 0, 1, 0]);
  });

  it("conversão usa só a base real; sem leads não há percentual", () => {
    expect(conversaoPorEtapaV4(funilV4([]))[0]?.pct).toBeNull();
    const c = conversaoPorEtapaV4(funilV4([lead({}), lead({ eixo_comercial: "discovery_agendada" })]));
    expect(c[1]).toMatchObject({ chegaram: 1, base: 2, pct: 50 });
  });

  it('lead sem origem entra como "Sem origem registrada"', () => {
    expect(origemDoLead({ origem: null })).toBe("Sem origem registrada");
  });
});

describe("Jurídico & Contrato V4", () => {
  it("contrato em revisão humana não aparece como assinado e sem validações registradas não há percentual", () => {
    const b = completudeFormal({ status: "under_human_review", anexos: [{ status: "not_applicable" }], validacoes: [] });
    expect(b.find((x) => x.label === "Assinatura")).toMatchObject({ pct: 0, detalhe: "Não assinado" });
    expect(b.find((x) => x.label === "Validações do instrumento")?.pct).toBeNull();
    expect(b.find((x) => x.label === "Anexos I–V")?.pct).toBe(100);
  });

  it("/contratos mostra no máximo 4 indicadores no topo (sem o painel de 7 contadores)", () => {
    const rota = readFileSync("src/routes/_authenticated/contratos.index.tsx", "utf8");
    const comp = readFileSync("src/components/contratos/juridico-contrato-v4.tsx", "utf8");
    // 31/10/2026: religado por ordem da Proprietária, mas só dentro do bloco recolhido (não no topo).
    const antesDoBloco = rota.slice(0, rota.indexOf("Abrir instrumentos, inventário e gestão contratual"));
    expect(antesDoBloco).not.toContain("<PainelEstadoContratual");
    expect(rota).toContain("<PainelEstadoContratual");
    expect(rota).not.toContain("<FormalizacaoConectada");
    expect((comp.match(/<KpiCard /g) ?? []).length).toBeLessThanOrEqual(4);
  });
});

describe("Núcleos com/sem acesso", () => {
  it("só acesso ativo no caso conta como 'com acesso'; titular sem acesso ativo fica em 'sem acesso'", () => {
    const r = separarAcessosDoCaso(
      {
        acessos: [{ id: "a1", client_id: "c1", access_status: "invited" }],
        casosAcesso: [{ client_portal_access_id: "a1", case_id: "k", access_status: "active" }],
        clientes: [{ id: "c1", nome: "Ana" }],
        casos: [{ id: "k", cliente_id: "c1" }],
        autorizacoes: [],
      },
      "k",
    );
    expect(r.com).toHaveLength(0);
    expect(r.sem).toEqual([{ id: "c1", nome: "Ana" }]);
  });
});
