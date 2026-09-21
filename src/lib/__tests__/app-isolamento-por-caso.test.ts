import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * P0 do App Cliente — isolamento por caso (21/09/2026).
 *
 * Dois defeitos fechados aqui:
 *
 * 1. `dadosVivosDoPortal` sabia recortar por `casoId`, mas o recorte era
 *    opcional e o único chamador nunca o passava. Sem `casoId`, as quatro
 *    consultas usavam `.in("case_id", <todos os autorizados>)` e cinco abas
 *    somavam conteúdo de casos diferentes na mesma tela. A próxima ação
 *    ainda saía do PRIMEIRO caso, sobre o conteúdo de todos.
 * 2. Não existia caso ativo: nenhuma rota do portal lia search param, e
 *    Home/Conta fixavam `[0]`. Sem escolha, não havia o que persistir no F5.
 *
 * A defesa principal é no servidor: agregar nunca é correto numa superfície
 * de cliente, então o padrão passou a ser um caso só — mesmo que algum
 * chamador futuro esqueça de passar o caso.
 */

const servidor = readFileSync("src/lib/portal-dados-vivos.functions.ts", "utf8");
const rotaPortal = readFileSync("src/routes/portal/route.tsx", "utf8");
const fonte = readFileSync("src/components/portal/fonte-portal.tsx", "utf8");
const home = readFileSync("src/routes/portal/index.tsx", "utf8");
const conta = readFileSync("src/routes/portal/conta.tsx", "utf8");
const master = readFileSync("src/routes/_authenticated/app-cliente-como-pessoa.tsx", "utf8");

describe("o servidor nunca agrega casos", () => {
  it("o alvo é sempre um único caso", () => {
    expect(servidor).toContain("const alvo = [String(casoAtivo.id)]");
    // A forma antiga montava o alvo a partir de todos os ids autorizados.
    expect(servidor).not.toContain("const ids = permitidos.map");
    expect(servidor).not.toContain("? ids.filter((id) => id === data.casoId) : ids");
  });

  it("sem casoId cai no primeiro autorizado, não em todos", () => {
    expect(servidor).toContain("(permitidos[0] ?? null)");
  });

  it("casoId só vale se estiver entre os autorizados", () => {
    // Revogação: pedir um caso que não é seu devolve vazio, nunca outro caso.
    expect(servidor).toContain('permitidos.find((c) => String(c.id) === data.casoId) ?? null');
    expect(servidor).toContain("casoAtivoId: null");
  });

  it("a próxima ação sai do mesmo caso do conteúdo", () => {
    expect(servidor).toContain("status: casoAtivo.status");
    expect(servidor).toContain("ativo: casoAtivo.ativo");
    expect(servidor).toContain("suspensoEm: casoAtivo.suspenso_em");
    // O bug era derivar a próxima ação de `permitidos[0]` com alvo agregado.
    expect(servidor).not.toContain("permitidos.find((c) => alvo.includes");
  });

  it("devolve qual caso usou, para a tela não recalcular", () => {
    expect(servidor).toContain("casoAtivoId: String(casoAtivo.id)");
  });
});

describe("caso ativo vive na URL", () => {
  it("a rota de layout das 7 abas valida o parâmetro", () => {
    expect(rotaPortal).toContain("validateSearch");
    expect(rotaPortal).toContain("casoId");
  });

  it("o parâmetro é opcional — nenhum link para /portal passa a exigi-lo", () => {
    // Declarar a chave como `string | undefined` tornaria `search`
    // obrigatório em todo Link para /portal/*; o tipo opcional evita isso.
    expect(rotaPortal).toContain("): { casoId?: string } =>");
  });

  it("a leitura repassa o caso da URL ao servidor", () => {
    expect(fonte).toContain("carregar({ data: casoId ? { casoId } : {} })");
  });

  it("o caso entra na chave de cache", () => {
    // Sem isso, trocar de caso devolveria o conteúdo do caso anterior.
    expect(fonte).toContain('queryKey: ["portal-dados-vivos", casoId ?? "padrao"]');
  });

  it("lê a URL sem lançar fora da árvore do portal", () => {
    // O mesmo hook roda na visão Master do Desk, fora de /portal.
    expect(fonte).toContain('useSearch({ strict: false })');
  });
});

describe("as telas seguem o caso ativo, não o primeiro da lista", () => {
  it("a Home usa o caso que a leitura de fato usou", () => {
    expect(home).toContain("vivo.data?.casoAtivoId");
    expect(home).toContain("casos.find((c) => c.id === casoIdAtivo)");
    expect(home).not.toContain("const principal = casos[0];");
  });

  it("a Home troca o caso ativo em vez de abrir rota profunda", () => {
    expect(home).toContain('search={{ casoId: c.id }}');
    expect(home).not.toContain("casos.slice(1)");
  });

  it("a Conta mostra o mesmo caso das outras abas", () => {
    expect(conta).toContain("c.id === vivo.data?.casoAtivoId");
    expect(conta).not.toContain("casosPortal?.[0]?.codigo");
  });
});

describe("a visão Master não perde o caso no F5", () => {
  it("a troca de caso reescreve a URL", () => {
    expect(master).toContain("useNavigate");
    expect(master).toContain("search: { casoId: escolhido || undefined }");
  });

  it("continua lendo o caso da URL ao montar", () => {
    expect(master).toContain("Route.useSearch()");
  });
});
