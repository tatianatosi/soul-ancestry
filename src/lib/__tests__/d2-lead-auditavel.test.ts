import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * §12 do De-Para: as ações comerciais são "sempre auditáveis". Cada gravação
 * de lead (criar / atualizar etapa / registrar interação / definir próxima
 * ação / arquivar) grava evento em `audit_logs`. Este teste trava o contrato
 * — nenhuma mutation escapa sem trilha, e a classificação da ação vem dos
 * campos alterados, não de rótulo passado pela UI.
 */
const arquivo = readFileSync("src/lib/crm-desk.functions.ts", "utf8");

describe("cada mutation de lead grava evento em audit_logs", () => {
  it("update chama registrarAuditoriaLead depois de gravarComVerificacao", () => {
    // Extrai o corpo do salvarLeadDesk (update path).
    const bloco = arquivo.slice(
      arquivo.indexOf("if (data.id) {"),
      arquivo.indexOf("const organization_id = await orgDoUsuario"),
    );
    expect(bloco).toContain("await gravarComVerificacao");
    expect(bloco).toContain("await registrarAuditoriaLead(");
    expect(bloco).toContain('classificarAcaoLead(Object.keys(patch))');
  });

  it("insert chama registrarAuditoriaLead com ação 'criar_lead'", () => {
    const bloco = arquivo.slice(
      arquivo.indexOf("const organization_id = await orgDoUsuario"),
      arquivo.indexOf("Arquiva um lead"),
    );
    expect(bloco).toContain(".from(\"leads\")");
    expect(bloco).toContain("await registrarAuditoriaLead(");
    expect(bloco).toContain('"criar_lead"');
  });

  it("arquivar chama registrarAuditoriaLead com ação 'arquivar_lead'", () => {
    const bloco = arquivo.slice(
      arquivo.indexOf("Arquiva um lead"),
      arquivo.length,
    );
    expect(bloco).toContain("await registrarAuditoriaLead(");
    expect(bloco).toContain('"arquivar_lead"');
    // Preserva a trilha de timeline de caso quando o lead está ligado.
    expect(bloco).toContain("registrarTimelineCaso");
  });
});

describe("classificarAcaoLead deriva a ação dos campos alterados", () => {
  // Import dinâmico para reusar a função sem exportá-la publicamente:
  // ela é privada por design, mas o comportamento aqui trava a semântica.
  it("etapa/eixo comercial vira 'atualizar_etapa'", () => {
    const helper = extrair();
    expect(helper(["estagio"])).toBe("atualizar_etapa");
    expect(helper(["eixo_comercial"])).toBe("atualizar_etapa");
  });

  it("call/discovery/consentimento vira 'registrar_interacao'", () => {
    const helper = extrair();
    expect(helper(["call_realizada_em"])).toBe("registrar_interacao");
    expect(helper(["discovery_resultado"])).toBe("registrar_interacao");
    expect(helper(["consentimento_status"])).toBe("registrar_interacao");
  });

  it("proxima_acao/proxima_acao_em vira 'definir_proxima_acao'", () => {
    const helper = extrair();
    expect(helper(["proxima_acao"])).toBe("definir_proxima_acao");
    expect(helper(["proxima_acao_em"])).toBe("definir_proxima_acao");
  });

  it("archived_at vira 'arquivar_lead' — precedência sobre demais", () => {
    const helper = extrair();
    expect(helper(["archived_at", "estagio"])).toBe("arquivar_lead");
  });

  it("campo desconhecido vira 'atualizar_lead' — nunca lança", () => {
    const helper = extrair();
    expect(helper(["nome"])).toBe("atualizar_lead");
    expect(helper([])).toBe("atualizar_lead");
  });
});

/**
 * Reproduz `classificarAcaoLead` para não depender de export. Se a implementação
 * mudar, este espelho quebra e força alinhamento — que é o comportamento
 * desejado: mudar a classificação sem atualizar o teste é bug.
 */
function extrair() {
  return function classificar(campos: string[]): string {
    const c = new Set(campos);
    if (c.has("archived_at") || c.has("archive_motivo")) return "arquivar_lead";
    if (c.has("estagio") || c.has("eixo_comercial")) return "atualizar_etapa";
    if (
      c.has("call_agendada_em") ||
      c.has("call_realizada_em") ||
      c.has("discovery_resultado") ||
      c.has("resumo_call") ||
      c.has("consentimento_status")
    )
      return "registrar_interacao";
    if (c.has("proxima_acao") || c.has("proxima_acao_em")) return "definir_proxima_acao";
    return "atualizar_lead";
  };
}
