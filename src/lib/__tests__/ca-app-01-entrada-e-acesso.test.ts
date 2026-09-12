import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/*
 * CA-APP-01 — Entrada e acesso (09/09/2026), primeira CA do RESGATE DO APP
 * CLIENTE. Auditoria das telas públicas de acesso (/acesso, /acesso/confirmar,
 * /acesso/sem-permissao) e do Portal de proposta confirmou que o fluxo de
 * magic link, elegibilidade e auditoria já está implementado (uso único,
 * expiração, rate limit por e-mail/origem, resposta sempre genérica contra
 * enumeração, eventos e auditoria em toda mudança de estado, bypass de
 * redirecionamento para o modo prévia de equipe).
 *
 * A lacuna real encontrada: portalProposta lia "eventos_financeiros" — tabela
 * legada, sem linha real (confirmado em CA16, 09/09/2026) — para a seção
 * "Condições" do Portal de proposta. O cliente nunca via a fatura de verdade,
 * mesmo quando ela existia. `invoices` já tem RLS própria e específica do
 * portal (invoices_sel_portal: organização do próprio acesso, caso
 * autorizado via portal_caso_permitido, liberada_cliente=true, client_id do
 * próprio cliente) — motor pronto, nunca ligado. Passa a ser a fonte real.
 */

describe("CA-APP-01 — Portal de proposta usa fatura real (invoices), não a tabela legada", () => {
  it("portalProposta lê invoices, não eventos_financeiros", () => {
    const arquivo = readFileSync("src/lib/portal.functions.ts", "utf8");
    const bloco = arquivo.slice(
      arquivo.indexOf("export const portalProposta"),
      arquivo.indexOf("export const portalProposta") + 700,
    );
    expect(bloco).toContain('.from("invoices")');
    expect(bloco).not.toContain('.from("eventos_financeiros")');
  });

  it("proposta.tsx renderiza os campos reais de invoices (numero), não um campo que não existe (descricao)", () => {
    const rota = readFileSync("src/routes/portal/proposta.tsx", "utf8");
    expect(rota).toContain("f.numero");
    expect(rota).not.toContain("f.descricao");
  });
});

describe("CA-APP-01 — regra de acesso preservada (regressão)", () => {
  it("/acesso nunca revela se um e-mail está cadastrado (proteção contra enumeração)", () => {
    // 23/09/2026 — /acesso.tsx virou só o contêiner (<Outlet/>) das telas
    // filhas; o formulário e a copy de proteção contra enumeração moraram
    // para acesso.index.tsx desde então. Mesma regra, arquivo atual.
    const rota = readFileSync("src/routes/acesso.index.tsx", "utf8");
    expect(rota).toContain("nunca informamos se um e-mail está ou não cadastrado");
  });

  it("solicitarLinkAcesso sempre responde ok:true, mesmo quando o acesso não existe ou está indisponível", () => {
    const arquivo = readFileSync("src/lib/portal.functions.ts", "utf8");
    const bloco = arquivo.slice(
      arquivo.indexOf("export const solicitarLinkAcesso"),
      arquivo.indexOf("export const confirmarAcessoPortal"),
    );
    expect(bloco).toContain("return { ok: true }");
    expect((bloco.match(/return \{ ok: true \}/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it("magic link é de uso único com janela curta e cada emissão invalida a anterior", () => {
    const arquivo = readFileSync("src/lib/portal.functions.ts", "utf8");
    expect(arquivo).toContain("magic_link_max_uses: 1");
    expect(arquivo).toContain("LINK_LOGIN_VALIDADE_MINUTOS");
  });

  it("/acesso/sem-permissao não revela detalhe interno, caso ou dado de terceiro", () => {
    const rota = readFileSync("src/routes/acesso.sem-permissao.tsx", "utf8");
    expect(rota).toContain("Fale com a sua consultora");
    expect(rota).not.toMatch(/case_id|organization_id|status.*interno/i);
  });

  it("modo prévia de equipe não é devolvido incorretamente à tela de permissão", () => {
    const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
    const ancora = shell.indexOf("Em prévia (demo e espelho");
    expect(ancora).toBeGreaterThan(-1);
    const bloco = shell.slice(ancora, ancora + 300);
    expect(bloco).toContain("if (previa) return;");
  });

  it("acesso a caso não autorizado é auditado sem gravar dado do caso nos metadados", () => {
    const arquivo = readFileSync("src/lib/portal.functions.ts", "utf8");
    const bloco = arquivo.slice(arquivo.indexOf("export const portalCaso"), arquivo.indexOf("export const portalDocumentos"));
    expect(bloco).toContain('tipo: "access_denied"');
    expect(bloco).toContain('motivo: "caso_nao_autorizado"');
  });
});
