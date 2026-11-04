import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { decidirAcao } from "@/lib/autoridade-operacional";
import { ACOES_EXTERNAS, CAPACIDADES_PROPRIETARIA } from "@/lib/modo-proprietaria";
import { ESTADOS_AUTORIZACAO_PESQUISA } from "@/lib/autorizacao-pesquisa";

/**
 * Fila v2, bloco A (04/11/2026). Decisão D5: a proprietária administradora não é bloqueada em
 * nenhuma ação interna; ato externo pede confirmação explícita dela mesma.
 */
const ler = (p: string) => readFileSync(p, "utf8");

describe("A05 — exigirGate: a proprietária assume a pendência interna, com auditoria", () => {
  const src = ler("src/lib/escopo-conferencia.server.ts");
  const corpo = src.slice(src.indexOf("export async function exigirGate"));
  const ramoInterno = corpo.slice(corpo.indexOf("if (ehAcaoGateadaInterna(input.acao))"), corpo.indexOf("throw new GateBloqueadoError"));

  it("sem decisão prévia, a proprietária operando passa e a superação é auditada", () => {
    expect(ramoInterno).toContain("await proprietariaOperando(supabase, input.userId)");
    expect(ramoInterno).toContain('origem: "proprietaria_assumiu_no_ato"');
    expect(ramoInterno).toContain("pendencia_preservada: true");
    // reutiliza a ação de auditoria já existente; nenhum literal novo
    expect(ramoInterno.split('acao: "gate_superado_por_decisao_proprietaria"').length - 1).toBe(2);
  });

  it("a passagem da proprietária fica restrita a ação interna (ação externa continua no fluxo de confirmação)", () => {
    const antesDoRamo = corpo.slice(0, corpo.indexOf("if (ehAcaoGateadaInterna(input.acao))"));
    expect(antesDoRamo).not.toContain("proprietariaOperando");
  });

  it("erro ao ler as decisões registradas aparece, em vez de virar bloqueio silencioso", () => {
    expect(ramoInterno).toContain("if (erroDecisao) throw new Error(");
  });
});

describe("A07 — autorização de pesquisa registrada na ficha do caso", () => {
  it("o escritor do caso aceita estado_de_autorizacao_pesquisa", () => {
    const saas = ler("src/lib/saas.functions.ts");
    const bloco = saas.slice(saas.indexOf("crm_casos: ["), saas.indexOf("],", saas.indexOf("crm_casos: [")));
    expect(bloco).toContain('"estado_de_autorizacao_pesquisa"');
  });

  it("os valores oferecidos são exatamente os do CHECK do banco", () => {
    const sql = ler("supabase/migrations/20260821135341_6a8d63e6-0395-41e3-b0fe-845f61e621e4.sql");
    const m = /estado_de_autorizacao_pesquisa IN \(([^)]*)\)/.exec(sql);
    if (!m) throw new Error("CHECK não encontrado");
    const doBanco = m[1].split(",").map((s) => s.trim().replace(/'/g, "")).sort();
    expect(ESTADOS_AUTORIZACAO_PESQUISA.map((e) => e.valor).sort()).toEqual(doBanco);
  });

  it("o assistente mostra o registro de autorização quando o servidor responde pesquisa_nao_autorizada", () => {
    const assistente = ler("src/components/pesquisa/assistente.tsx");
    expect(assistente).toContain('corpo?.erro === "pesquisa_nao_autorizada"');
    expect(assistente).toContain("<RegistrarAutorizacaoPesquisa");
  });
});

describe("A08 — invariante: para a proprietária, nada interno ou externo vira bloqueio", () => {
  const pendencias = [null, "Documentos mínimos pendentes"] as const;
  const externas: (string | undefined)[] = [undefined, ...ACOES_EXTERNAS];

  for (const papel of ["admin", "proprietaria_administradora"]) {
    it(`papel ${papel}: nenhuma combinação devolve "bloquear" com identidade e organização presentes`, () => {
      let combinacoes = 0;
      for (const capacidade of [undefined, ...CAPACIDADES_PROPRIETARIA]) {
        for (const acaoExterna of externas) {
          for (const pendenciaGate of pendencias) {
            const r = decidirAcao(
              { papeis: [papel], organizationId: "org-1" },
              { capacidade, acaoExterna, pendenciaGate },
            );
            combinacoes += 1;
            expect(r.decisao, `${capacidade}/${acaoExterna}/${pendenciaGate}`).not.toBe("bloquear");
            if (acaoExterna) expect(r.decisao).toBe("confirmar");
            if (pendenciaGate) expect(r.pendencia).toBe(pendenciaGate);
          }
        }
      }
      expect(combinacoes).toBeGreaterThan(20);
    });
  }

  it("só falta de identidade ou de organização bloqueia a proprietária", () => {
    expect(decidirAcao({ papeis: [], organizationId: "org-1" }, {}).decisao).toBe("bloquear");
    expect(decidirAcao({ papeis: ["admin"], organizationId: null }, {}).decisao).toBe("bloquear");
    expect(decidirAcao({ papeis: ["proprietaria_administradora"], organizationId: null }, {}).decisao).toBe("bloquear");
  });
});
