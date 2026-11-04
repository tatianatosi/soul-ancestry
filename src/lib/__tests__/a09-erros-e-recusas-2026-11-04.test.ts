import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { ACOES_DE_RECUSA, ehRegistroDeTeste, legivel } from "@/lib/erros-e-recusas";

/** A09 (04/11/2026, D13): a proprietária lê erros do app e recusas do servidor em /qualidade. */
describe("A09 — erros e recusas legíveis", () => {
  it("só usa ações de recusa que o código já grava (nenhum literal novo)", () => {
    const fontes = [
      "src/lib/escopo-conferencia.server.ts",
      "src/routes/api/pesquisa-assistente.ts",
    ].map((p) => readFileSync(p, "utf8"));
    for (const acao of ["gate_formalizacao_bloqueado", "analysis_blocked_research_not_authorized"]) {
      expect(ACOES_DE_RECUSA).toContain(acao);
      expect(fontes.some((f) => f.includes(`acao: "${acao}"`))).toBe(true);
    }
  });

  it("registro gravado pela suíte de testes é marcado, sem ser apagado", () => {
    expect(ehRegistroDeTeste({ pilha: "Error: x\n at /dev-server/src/lib/__tests__/coletor.test.ts:23:36" })).toBe(true);
    expect(ehRegistroDeTeste({ pilha: "Error: h3 swallowed SSR error\n at normalizeCatastrophic" })).toBe(false);
    const r = legivel({
      id: "1",
      created_at: "2026-11-04T23:18:24Z",
      acao: "erro_app",
      entidade: "app",
      user_id: null,
      metadados: { mensagem: "texto solto", pilha: "at /tmp/w233/src/lib/__tests__/coletor-erro-producao-2026-10-31.test.ts:27:7" },
    });
    expect(r.tipo).toBe("erro");
    expect(r.deTeste).toBe(true);
    expect(r.motivo).toBe("texto solto");
  });

  it("recusa mostra o motivo gravado e a tela; ausência é explícita", () => {
    const recusa = legivel({
      id: "2",
      created_at: "2026-11-04T23:40:00Z",
      acao: "analysis_blocked_research_not_authorized",
      entidade: "crm_casos",
      user_id: "u1",
      metadados: { motivo: "Pesquisa não autorizada na ficha do caso.", tela: "Assistente de pesquisa genealógica" },
    });
    expect(recusa).toMatchObject({
      tipo: "recusa",
      rotulo: "Análise de pesquisa recusada: sem autorização",
      onde: "Assistente de pesquisa genealógica",
      motivo: "Pesquisa não autorizada na ficha do caso.",
      deTeste: false,
    });
    const gate = legivel({
      id: "3",
      created_at: "2026-11-04T23:41:00Z",
      acao: "gate_formalizacao_bloqueado",
      entidade: "crm_casos",
      user_id: "u1",
      metadados: { descricoes: ["Pagamento inicial não confirmado"] },
    });
    expect(gate.motivo).toBe("Pagamento inicial não confirmado");
    expect(legivel({ id: "4", created_at: "x", acao: "bootstrap_denied", entidade: null, user_id: null, metadados: null }).motivo).toBe(
      "Motivo não registrado",
    );
  });

  it("a leitura no servidor é só do admin, por organização, e erro de leitura aparece", () => {
    const src = readFileSync("src/lib/qualidade.functions.ts", "utf8");
    const fn = src.slice(src.indexOf("export const listarErrosERecusas"), src.indexOf("/** Monta as linhas de cada conjunto"));
    expect(fn).toContain("if (!ctx.ehAdmin)");
    expect(fn).toContain('.eq("organization_id", ctx.organizationId)');
    expect(fn).toContain("if (error) throw new Error(");
    expect(readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8")).toContain("<ErrosERecusas />");
  });
});
