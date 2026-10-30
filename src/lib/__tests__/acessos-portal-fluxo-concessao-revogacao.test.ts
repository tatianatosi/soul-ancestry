import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Auditoria de prontidão de lançamento (18/10/2026): `acessos-portal.tsx`
 * só tinha teste de forma superficial (montagem/CTAs isolados — ver
 * `dsa11-acessos-portal-cacard.test.ts`, `d11-portal-publicacao-por-caso.test.ts`
 * e `motor-lote4-batch15-alta-prioridade.test.ts`). Nenhum provava o FLUXO
 * completo de concessão/revogação de acesso ao Portal/App Cliente — a tela
 * que decide quem entra no App Cliente do cliente final.
 *
 * Por que este teste lê código-fonte em vez de renderizar a página: as
 * rotas em `src/routes/_authenticated/*` são code-split pelo plugin do
 * TanStack Start (`createFileRoute({ component })` é reescrito para
 * `lazyRouteComponent(() => import(...))` na transformação do arquivo,
 * antes de qualquer `vi.mock`), e `AcessosPortalPage` não é exportada —
 * só `Route`. Comprovado durante este trabalho: renderizar `Route.component`
 * trava indefinidamente dentro de um `<Suspense>` sem nunca resolver e sem
 * lançar erro. As rotas que o projeto já renderiza em teste
 * (`portal-resiliencia-rede.test.tsx`) são as de `src/routes/portal/*`,
 * que exportam a função de página separadamente do `Route` — não é o caso
 * aqui. Por isso este teste prova, com o mesmo rigor usado nos testes de
 * forma já existentes, que cada ação de concessão/revogação na tela chama
 * a server function certa, com o payload certo.
 */
const ROTA = readFileSync("src/routes/_authenticated/acessos-portal.tsx", "utf8");
const PORTAL_FN = readFileSync("src/lib/portal.functions.ts", "utf8");

function trecho(fonte: string, marcador: string, tamanho = 2500): string {
  const i = fonte.indexOf(marcador);
  expect(i, `marcador ausente: ${marcador}`).toBeGreaterThan(-1);
  return fonte.slice(i, i + tamanho);
}

describe("Acessos ao portal — concessão (Novo convite → criarConvitePortal)", () => {
  it("o botão real de concessão chama mConvite, que chama criarConvitePortal com clientId/autorizacaoId/nivel/casoId escolhidos na tela", () => {
    expect(ROTA).toContain("useServerFn(criarConvitePortal)");
    expect(ROTA).toMatch(
      /mConvite = useMutation\(\{\s*mutationFn: \(\) =>\s*criar\(\{ data: \{ clientId, autorizacaoId, nivel, casoId: casoId \|\| undefined \} \}\)/,
    );
    // O CTA é a mesma ação que concede, por acaoExterna + confirmação explícita.
    expect(ROTA).toContain('acaoExterna="enviar_email"');
    expect(ROTA).toContain("onConfirmar={async () => {\n                    await mConvite.mutateAsync();");
  });

  it("o seletor de pessoa só oferece quem é elegível ao nível escolhido — nunca lista bloqueada por padrão", () => {
    expect(ROTA).toMatch(/from "@\/lib\/portal-elegibilidade"/);
    expect(ROTA).toContain("classificarPessoas(pessoas, nivel, autorizacoes, casos, propostas)");
    expect(ROTA).toContain('<optgroup label="Elegíveis">');
    expect(ROTA).toContain("mostrarBloqueados &&");
  });

  it("o botão fica desabilitado (sem mandar nada ao servidor) até clientId, autorizacaoId e, se workspace, casoId estarem preenchidos", () => {
    expect(ROTA).toMatch(
      /!clientId \|\| !autorizacaoId \|\| \(nivel === "client_workspace" && !casoId\)/,
    );
  });

  it("criarConvitePortal exige e-mail aprovado no nível certo e reconsulta a elegibilidade no servidor — payload do front nunca é fonte de verdade", () => {
    const t = trecho(PORTAL_FN, "export const criarConvitePortal", 5000);
    expect(t).toMatch(/if \(auth\.status !== "aprovado"\)/);
    expect(t).toMatch(/if \(auth\.nivel_pretendido !== data\.nivel\)/);
    expect(t).toMatch(/if \(auth\.client_id !== data\.clientId\)/);
    expect(t).toContain("helpers.revalidarElegibilidade(supabase, organizationId, {");
    expect(t).toMatch(/\.insert\(\{\s*organization_id: organizationId,\s*client_id: data\.clientId,/);
    expect(t).toContain('access_status: "invited"');
  });
});

describe("Acessos ao portal — revogação/suspensão do acesso (alterarStatusAcessoPortal)", () => {
  it("Suspender, Reativar e Revogar são os três CTAs reais do card Acessos, com acaoExterna própria", () => {
    const t = trecho(ROTA, 'titulo="Acessos"', 6000);
    expect(t).toContain('acaoExterna="suspender_acesso_portal"');
    expect(t).toContain('acaoExterna="reativar_acesso_portal"');
    expect(t).toContain('acaoExterna="revogar_acesso_portal"');
    expect(t).toMatch(/alterar\(\{ data: \{ acessoId: a\.id, status: "suspended", motivo \} \}\)/);
    expect(t).toMatch(/alterar\(\{ data: \{ acessoId: a\.id, status: "active", motivo \} \}\)/);
    expect(t).toMatch(/alterar\(\{ data: \{ acessoId: a\.id, status: "revoked", motivo \} \}\)/);
  });

  it("alterarStatusAcessoPortal revalida elegibilidade na reativação e nunca reaproveita o link mágico anterior", () => {
    const t = trecho(PORTAL_FN, "export const alterarStatusAcessoPortal");
    expect(t).toContain('if (data.status === "active") {');
    expect(t).toContain("helpers.revalidarElegibilidade(supabase, organizationId, {");
    expect(t).toMatch(/magic_link_expires_at.*=.*new Date\(Date\.now\(\) - 1000\)/);
  });

  it("revogar em cascata revoga também os vínculos de caso do mesmo acesso", () => {
    const t = trecho(PORTAL_FN, "export const alterarStatusAcessoPortal", 3200);
    expect(t).toContain('if (data.status === "revoked") {');
    expect(t).toMatch(/\.from\("client_portal_case_access"\)\s*\n\s*\.update\(\{\s*\n\s*access_status: "revoked"/);
  });

  it("toda mudança de status fica no histórico do caso vinculado, não só no log de auditoria do acesso", () => {
    const t = trecho(PORTAL_FN, "export const alterarStatusAcessoPortal", 5200);
    expect(t).toContain("registrarTimelineCaso(supabase, {");
    expect(t).toMatch(/"Acesso ao Portal do Cliente revogado"/);
    expect(t).toMatch(/"Acesso ao Portal do Cliente suspenso"/);
    expect(t).toMatch(/"Acesso ao Portal do Cliente reativado"/);
  });
});

describe("Acessos ao portal — revogação/concessão do vínculo de caso (definirCasoDoAcesso)", () => {
  it("Revogar caso / Reativar caso chamam definirCasoDoAcesso com conceder=false/true para o case_id certo", () => {
    expect(ROTA).toMatch(
      /definirCaso\(\{\s*data: \{ acessoId: a\.id, casoId: v\.case_id, conceder: false, motivo \},\s*\}\)/,
    );
    expect(ROTA).toMatch(
      /definirCaso\(\{\s*data: \{ acessoId: a\.id, casoId: v\.case_id, conceder: true \},\s*\}\)/,
    );
  });

  it("definirCasoDoAcesso exige o caso elegível (contrato/pagamento/documentos) antes de conceder", () => {
    const t = trecho(PORTAL_FN, "export const definirCasoDoAcesso");
    expect(t).toContain("if (data.conceder) {");
    expect(t).toMatch(
      /if \(!caso\.data\.contrato_assinado \|\| !caso\.data\.pagamento_confirmado \|\| !caso\.data\.documentos_minimos_ok\)/,
    );
  });
});

describe("Acessos ao portal — liberação/bloqueio do caso no App Cliente (definirLiberacaoCaso)", () => {
  it('o CTA "Liberar/Bloquear no app" chama definirLiberacaoCaso com liberado conforme o estado atual de app_access_status', () => {
    expect(ROTA).toContain('acaoExterna="liberar_acesso_app_cliente"');
    expect(ROTA).toMatch(
      /rotulo=\{caso\?\.app_access_status === "liberado" \? "Bloquear no app" : "Liberar no app"\}/,
    );
    expect(ROTA).toMatch(
      /liberar\(\{\s*data: \{\s*casoId: v\.case_id,\s*liberado: caso\?\.app_access_status !== "liberado",\s*nivel: "workspace",\s*consentimento: true,\s*infoLiberada: true,\s*motivo,\s*\},\s*\}\)/,
    );
  });

  it("definirLiberacaoCaso é a ação mais sensível da tela — deixa rastro no histórico do caso", () => {
    const t = trecho(PORTAL_FN, "export const definirLiberacaoCaso");
    expect(t).toContain('app_access_status: data.liberado ? "liberado" : "bloqueado"');
    expect(t).toContain("registrarTimelineCaso(supabase, {");
    expect(t).toMatch(/"Acesso ao App Cliente liberado"/);
    expect(t).toMatch(/"Acesso ao App Cliente bloqueado"/);
  });
});

describe("Acessos ao portal — aprovação/revogação do e-mail autorizado (validarEmailAutorizado)", () => {
  it("Aprovar é uma chamada direta; Revogar/Recusar passam por confirmação com motivo", () => {
    const t = trecho(ROTA, 'titulo="E-mails autorizados"', 7000);
    expect(t).toMatch(/await validarEmail\(\{ data: \{ id: a\.id, status: "aprovado" \} \}\)/);
    expect(t).toContain('rotulo={a.status === "aprovado" ? "Revogar" : "Recusar"}');
    expect(t).toMatch(
      /validarEmail\(\{\s*data: \{ id: a\.id, status: a\.status === "aprovado" \? "revogado" : "recusado", motivo \},\s*\}\)/,
    );
  });

  it("validarEmailAutorizado revoga em cascata os acessos ao portal originados dessa autorização quando o e-mail é revogado", () => {
    const t = trecho(PORTAL_FN, "export const validarEmailAutorizado");
    expect(t).toContain('if (data.status === "revogado") {');
    expect(t).toMatch(/\.from\("client_portal_access"\)\s*\n\s*\.update\(\{\s*\n\s*access_status: "revoked"/);
    expect(t).toMatch(/\.eq\("authorized_email_id", data\.id\)/);
  });
});

describe("Acessos ao portal — a tela de fato decide quem entra no App Cliente", () => {
  it("carrega os acessos reais via listarAcessosPortal, sem fonte paralela", () => {
    expect(ROTA).toContain("useServerFn(listarAcessosPortal)");
    expect(ROTA).toMatch(/useQuery\(\{ queryKey: \["acessos-portal"\]/);
  });

  it("os indicadores de decisão (ativos/pendentes/aguardando validação/suspensos) contam só o que já foi carregado, nunca inventado", () => {
    expect(ROTA).toMatch(
      /acessosAtivos = q\.data \? acessosVisiveis\.filter\(\(a\) => a\.access_status === "active"\)\.length : null/,
    );
    expect(ROTA).toMatch(
      /acessosSuspensos = q\.data\s*\n\s*\? acessosVisiveis\.filter\(\(a\) => \["suspended", "revoked", "expired"\]\.includes\(a\.access_status\)\)\.length\s*\n\s*: null/,
    );
  });

  it("clientes entram apenas por link mágico de uso único — nunca senha ou autocadastro (declarado na própria tela)", () => {
    expect(ROTA).toMatch(/Clientes entram apenas por link mágico de uso único/);
    expect(ROTA).toMatch(/Sem senha e sem autocadastro/);
  });
});
