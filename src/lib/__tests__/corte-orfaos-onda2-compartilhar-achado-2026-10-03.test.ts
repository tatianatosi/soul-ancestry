import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Corte ÓRFÃOS — onda 2: compartilhamento de achado (03/10/2026).
 *
 * Decisão da Proprietária, 09/09/2026: "achado é compartilhável apenas
 * quando sanitizado e autorizado" e "cliente decide se deseja compartilhar".
 * Para cumprir isso foram escritos SEIS server functions — três no Desk e
 * três no App — com RLS própria em `app_projection_shares`. Nenhuma tinha um
 * único chamador: a decisão existia no banco, na RLS e no servidor, e em
 * tela nenhuma. Ninguém conseguia compartilhar nada.
 *
 * Esta onda liga a ponta do DESK. A ponta do App fica declarada, não
 * fabricada: exige um leitor de membros da família no portal que não existe,
 * e expor ao titular quais parentes existem é decisão de privacidade.
 */

const PAINEL = readFileSync("src/components/pesquisa/compartilhar-achado.tsx", "utf8");
const ROTA = readFileSync("src/routes/_authenticated/biblioteca-evidencias.$caseId.tsx", "utf8");
const FN = readFileSync("src/lib/biblioteca-evidencias.functions.ts", "utf8");
const PORTAL = readFileSync("src/lib/portal-cliente.functions.ts", "utf8");

describe("Ponta do Desk — os três escritores deixaram de ser órfãos", () => {
  for (const fn of [
    "registrarCompartilhamentoAchado",
    "listarCompartilhamentosAchado",
    "revogarCompartilhamentoAchado",
  ]) {
    it(`${fn} é chamado pela UI`, () => {
      expect(PAINEL).toContain(fn);
    });
  }

  it("o painel está montado na aba de projeções da Biblioteca", () => {
    const aba = ROTA.indexOf('aba === "projecoes"');
    const painel = ROTA.indexOf("<CompartilharAchado", aba);
    expect(aba).toBeGreaterThan(-1);
    expect(painel).toBeGreaterThan(aba);
  });

  it("a lista acompanha o ACHADO, respeitando a assinatura real do leitor", () => {
    /*
      `listarCompartilhamentosAchado` recebe `projecaoId`, não `caseId`.
      Inventar um leitor por caso seria criar uma segunda forma de ler a
      mesma coisa — o erro que esta sessão está justamente desfazendo.
    */
    expect(FN).toContain("(d: { projecaoId: string }) => d");
    expect(PAINEL).toContain("listar({ data: { projecaoId } })");
    expect(PAINEL).toContain("enabled: Boolean(projecaoId)");
  });

  it("o painel só oferece achado aprovado/publicado com titular — o que o servidor aceitaria", () => {
    expect(PAINEL).toContain('estado === "approved" || estado === "published"');
    expect(PAINEL).toContain('p["titular_client_id"]');
  });

  it("o leitor do painel passou a devolver as pessoas do caso, reusando o helper canônico", () => {
    expect(FN).toContain("pessoasDoCasoComFallbackNucleo");
    expect(FN).toContain("membrosDoCaso");
    // Só quem tem ficha de pessoa vinculada: é o id que o compartilhamento aponta.
    expect(FN).toContain("m.cliente_id)");
  });

  it("revogar exige motivo e nunca apaga", () => {
    expect(PAINEL).toContain("Escreva o motivo (mínimo 5 letras)");
    expect(PAINEL).toContain("Nada é apagado");
    expect(PAINEL).not.toMatch(/\.delete\(\)/);
  });

  it("a fronteira está dita na tela: nunca o documento original", () => {
    expect(PAINEL).toContain("nunca o documento original");
    expect(PAINEL).toContain("Nenhuma mensagem é enviada");
  });

  it("estado vazio é específico, não genérico", () => {
    expect(PAINEL).toContain("Escolha um achado aprovado abaixo");
    expect(PAINEL).toContain("ainda não foi compartilhado com ninguém");
  });
});

describe("Ponta do App — declarada como pendente, não fabricada", () => {
  it("os três escritores do portal continuam existindo, intocados", () => {
    for (const fn of [
      "autorizarCompartilhamentoAchado",
      "revogarCompartilhamentoAchadoPortal",
      "meusCompartilhamentosDeAchado",
    ]) {
      expect(PORTAL).toContain(`export const ${fn}`);
    }
  });

  it("o portal NÃO ganhou um leitor de membros da família por conta de um agente", () => {
    /*
      Para o titular escolher com quem compartilhar, o portal precisaria
      listar os parentes e os ids deles. Isso é decisão de privacidade da
      Proprietária, não de código: nenhum leitor desses foi criado.
    */
    expect(PORTAL).not.toMatch(/export const (meusFamiliares|membrosDaMinhaFamilia|minhaFamilia)/);
  });

  it("a pendência está escrita na tela do Desk, para não se perder", () => {
    expect(PAINEL).toContain("ainda pendente de decisão sua sobre quais");
  });
});
