import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 2, batch 1 (confirmação
// crítica ausente). Varredura exaustiva de todos os 6 grupos do Desk
// encontrou três ações que concedem/revogam acesso (inclusive admin) ou
// liberam o caso no App Cliente com um único clique, sem AcaoOperacional
// nem motivo. Prova por leitura do código real.

const portalFn = readFileSync("src/lib/portal.functions.ts", "utf8");
const acessosPortalRota = readFileSync("src/routes/_authenticated/acessos-portal.tsx", "utf8");
const saasFn = readFileSync("src/lib/saas.functions.ts", "utf8");
const configuracoesRota = readFileSync("src/routes/_authenticated/configuracoes.tsx", "utf8");
const equipeFn = readFileSync("src/lib/equipe.functions.ts", "utf8");
const equipeRota = readFileSync("src/routes/_authenticated/equipe.tsx", "utf8");

describe("definirLiberacaoCaso — liberar/bloquear acesso ao App Cliente", () => {
  const trecho = portalFn.slice(
    portalFn.indexOf("export const definirLiberacaoCaso"),
    portalFn.indexOf("export const definirLiberacaoCaso") + 2200,
  );

  it("aceita motivo e registra histórico depois da escrita confirmada", () => {
    expect(trecho).toContain("motivo?: string");
    const posGravar = trecho.indexOf("await gravarComVerificacao(");
    const posTimeline = trecho.indexOf("registrarTimelineCaso(");
    expect(posGravar).toBeGreaterThan(-1);
    expect(posTimeline).toBeGreaterThan(posGravar);
  });

  it("'Liberar no app'/'Bloquear no app' não é mais botão cru — está dentro de AcaoOperacional com acaoExterna", () => {
    const idx = acessosPortalRota.indexOf("Liberar no app");
    expect(idx).toBeGreaterThan(-1);
    const inicio = acessosPortalRota.lastIndexOf("<AcaoOperacional", idx);
    expect(inicio).toBeGreaterThan(-1);
    const trechoUi = acessosPortalRota.slice(inicio, idx + 700);
    expect(trechoUi).toContain('acaoExterna="liberar_acesso_app_cliente"');
    expect(acessosPortalRota).not.toMatch(/<button\s*\n?\s*onClick=\{async \(\) => \{\s*\n\s*try \{\s*\n\s*await liberar/);
  });
});

describe("definirPapel — conceder/revogar papel (inclusive admin) em /configuracoes", () => {
  const trecho = saasFn.slice(
    saasFn.indexOf("export const definirPapel"),
    saasFn.indexOf("export const definirPapel") + 2400,
  );

  it("checa linha afetada no insert, no delete e no audit_logs — antes só checava error em alguns pontos", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: papel não foi concedido");
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: papel não foi removido");
    expect(trecho).toContain("if (auditRes.error) throw new Error(auditRes.error.message);");
  });

  it("exige motivo, com texto de dívida quando ausente", () => {
    expect(trecho).toContain("Motivo não informado (fluxo sem confirmação humana explícita).");
  });

  it("o botão de papel em /configuracoes não é mais clique único — está dentro de AcaoOperacional", () => {
    expect(configuracoesRota).toContain("<AcaoOperacional");
    expect(configuracoesRota).toContain('acaoExterna="definir_papel_membro"');
    expect(configuracoesRota).not.toMatch(/onClick=\{\(\) => m\.mutate\(\{ userId: u\.userId, papel, conceder: !ativo \}\)\}/);
  });
});

describe("equipe.functions.ts — alterarPapelMembro/alterarStatusMembro/arquivarMembroEquipe", () => {
  it("alterarPapelMembro checa linha afetada e exige motivo", () => {
    const trecho = equipeFn.slice(
      equipeFn.indexOf("export const alterarPapelMembro"),
      equipeFn.indexOf("export const alterarStatusMembro"),
    );
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: papel do membro não foi alterado.");
    expect(trecho).toContain("Motivo não informado (fluxo sem confirmação humana explícita).");
  });

  it("alterarStatusMembro checa linha afetada", () => {
    const trecho = equipeFn.slice(
      equipeFn.indexOf("export const alterarStatusMembro"),
      equipeFn.indexOf("export const arquivarMembroEquipe"),
    );
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: status do membro não foi alterado.");
  });

  it("arquivarMembroEquipe checa linha afetada", () => {
    const trecho = equipeFn.slice(equipeFn.indexOf("export const arquivarMembroEquipe"));
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: membro não foi arquivado.");
  });

  it("a UI de /equipe troca papel/status/arquivamento via AcaoOperacional, não select cru nem window.prompt", () => {
    expect(equipeRota).toContain('acaoExterna="alterar_papel_membro"');
    expect(equipeRota).toContain('acaoExterna="suspender_membro_equipe"');
    expect(equipeRota).toContain('acaoExterna="revogar_membro_equipe"');
    expect(equipeRota).toContain('acaoExterna="arquivar_membro_equipe"');
    expect(equipeRota).not.toContain("window.prompt(\"Motivo da suspensão");
    expect(equipeRota).not.toContain("window.prompt(\"Motivo da revogação");
    expect(equipeRota).not.toContain("window.prompt(\"Motivo do arquivamento");
  });
});
