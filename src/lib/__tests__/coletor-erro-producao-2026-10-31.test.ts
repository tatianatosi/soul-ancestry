import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { capturarErroProducao } from "../producao-erros.server";
import {
  ACAO_ERRO_APP,
  devoRegistrar,
  higienizarTextoDeErro,
  montarRegistroErro,
} from "../erro-no-banco.server";
import { reportarFalhaDeTela, zerarRelatosDaAba } from "../producao-erros-navegador";

/**
 * Coletor de erro em produção. Desde 02/11/2026 os erros vão para o PRÓPRIO banco do app
 * (`audit_logs`, `acao = 'erro_app'`), e não mais ao serviço externo, que exigia uma conta que a
 * Proprietária não consegue criar.
 */
describe("Coletor de erro em produção (grava no banco do app)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("nunca lança nem rejeita, e devolve uma promessa que quem pode esperar aguarda", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const p = capturarErroProducao(new Error("falha de teste"));
    expect(p).toBeInstanceOf(Promise);
    await expect(p).resolves.toBeUndefined();
    await expect(
      capturarErroProducao("texto solto", { mecanismo: "manual" }),
    ).resolves.toBeUndefined();
    await expect(capturarErroProducao(undefined)).resolves.toBeUndefined();
  });

  it("a rota /api/erro e os middlewares ESPERAM a gravação antes de responder (em produção o que ficava pendente se perdia)", () => {
    expect(readFileSync("src/routes/api/erro.ts", "utf8")).toContain("await capturarErroProducao(");
    expect(readFileSync("src/start.ts", "utf8")).toContain("await capturarErroProducao(");
    const servidor = readFileSync("src/server.ts", "utf8");
    expect(servidor.split("await capturarErroProducao(").length - 1).toBeGreaterThanOrEqual(2);
  });

  it("registra a ação 'erro_app' com mecanismo, origem e a mensagem do erro", () => {
    const r = montarRegistroErro(new Error("Unauthorized: No authorization header provided"), {
      origem: "navegador",
      mecanismo: "acao",
      rota: "/casos/abc",
    });
    expect(r.acao).toBe(ACAO_ERRO_APP);
    expect(r.entidade).toBe("/casos/abc");
    expect(r.metadados).toMatchObject({
      origem: "navegador",
      mecanismo: "acao",
      mensagem: "Unauthorized: No authorization header provided",
    });
  });

  it("não grava e-mail, token de sessão nem número longo (CPF, telefone)", () => {
    // O token de exemplo é montado aqui para não existir como texto no arquivo.
    const tokenDeExemplo = [
      "eyJ" + "hbGciOiJIUzI1NiJ9",
      "eyJ" + "zdWIiOiIxMjMifQ",
      "assinaturaabcdef",
    ].join(".");
    const sujo = `falhou para ana@exemplo.com com ${tokenDeExemplo} e CPF 123.456.789-09`;
    const limpo = higienizarTextoDeErro(sujo);
    expect(limpo).not.toContain("ana@exemplo.com");
    expect(limpo).not.toContain(tokenDeExemplo);
    expect(limpo).not.toContain("123.456.789-09");
    expect(limpo).toContain("«e-mail»");
    expect(limpo).toContain("«token»");
  });

  it("o mesmo erro só entra uma vez por minuto e há teto por minuto", () => {
    const s = { inicio: 0, usados: 0, vistos: new Map<string, number>() };
    expect(devoRegistrar("a|erro", 1_000, s)).toBe(true);
    expect(devoRegistrar("a|erro", 2_000, s)).toBe(false);
    expect(devoRegistrar("a|erro", 62_000, s)).toBe(true);
    for (let i = 0; i < 40; i++) devoRegistrar(`b|${i}`, 70_000, s);
    expect(s.usados).toBeLessThanOrEqual(30);
  });

  it("o texto do erro fica limitado (mensagem 500, pilha 800)", () => {
    const r = montarRegistroErro(
      Object.assign(new Error("x".repeat(5000)), { stack: "y".repeat(5000) }),
      {},
    );
    expect(String(r.metadados.mensagem).length).toBeLessThanOrEqual(500);
    expect(String(r.metadados.pilha).length).toBeLessThanOrEqual(800);
  });
});

describe("Falhas do dia a dia no navegador são relatadas", () => {
  afterEach(() => {
    zerarRelatosDaAba();
    vi.unstubAllGlobals();
  });

  it("uma falha de ação vai para /api/erro uma vez, e a repetição imediata é ignorada", () => {
    const enviar = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("window", { location: { pathname: "/casos/abc" } });
    vi.stubGlobal("fetch", enviar);
    expect(reportarFalhaDeTela(new Error("nada foi gravado em crm_casos"), "acao", 1_000)).toBe(
      true,
    );
    expect(reportarFalhaDeTela(new Error("nada foi gravado em crm_casos"), "acao", 2_000)).toBe(
      false,
    );
    expect(enviar).toHaveBeenCalledTimes(1);
    const corpo = JSON.parse(String((enviar.mock.calls[0] as [string, RequestInit])[1].body));
    expect(corpo).toMatchObject({
      mensagem: "nada foi gravado em crm_casos",
      rota: "/casos/abc",
      mecanismo: "acao",
    });
  });

  it("cancelamento de requisição não é falha do app", () => {
    vi.stubGlobal("window", { location: { pathname: "/painel" } });
    vi.stubGlobal("fetch", vi.fn());
    const cancelado = Object.assign(new Error("The user aborted a request"), {
      name: "AbortError",
    });
    expect(reportarFalhaDeTela(cancelado, "leitura")).toBe(false);
  });

  it("o roteador relata ação, leitura e promessa rejeitada", () => {
    const src = readFileSync("src/router.tsx", "utf8");
    expect(src).toContain("new MutationCache");
    expect(src).toContain("new QueryCache");
    expect(src).toContain('"unhandledrejection"');
    expect(src).toContain("reportarFalhaDeTela");
  });
});

describe("Rota pública /api/erro: recebe o relato do navegador sem exigir sessão", () => {
  const src = readFileSync("src/routes/api/erro.ts", "utf8");

  it("é uma rota POST pública, sem exigir Authorization", () => {
    expect(src).toContain('createFileRoute("/api/erro")');
    expect(src).toContain("POST:");
    expect(src).not.toContain("Authorization");
    expect(src).not.toContain("requireSupabaseAuth");
  });

  it("repassa ao coletor de produção", () => {
    expect(src).toContain("capturarErroProducao");
  });

  it("limita o tamanho do corpo recebido", () => {
    expect(src).toContain("TAMANHO_MAXIMO_CORPO");
  });

  it("a rota está registrada no roteiro gerado", () => {
    expect(readFileSync("src/routeTree.gen.ts", "utf8")).toContain("/api/erro");
  });
});

describe("Pontos de captura existentes reportam ao coletor", () => {
  it("error-capture.ts, start.ts e server.ts chamam capturarErroProducao", () => {
    expect(readFileSync("src/lib/error-capture.ts", "utf8")).toContain("capturarErroProducao");
    expect(readFileSync("src/start.ts", "utf8")).toContain("capturarErroProducao");
    expect(
      readFileSync("src/server.ts", "utf8").split("capturarErroProducao").length - 1,
    ).toBeGreaterThanOrEqual(2);
  });

  it("__root.tsx (ErrorComponent do cliente) chama reportarErroCliente", () => {
    expect(readFileSync("src/routes/__root.tsx", "utf8")).toContain("reportarErroCliente");
  });
});

describe("O serviço externo de erros saiu do projeto", () => {
  it("nenhum arquivo de código nem o .env.example depende dele", () => {
    const termo = ["SEN", "TRY_DSN"].join("");
    for (const f of [
      "src/lib/producao-erros.server.ts",
      "src/lib/producao-erros-navegador.ts",
      "src/lib/erro-no-banco.server.ts",
      "src/routes/api/erro.ts",
      ".env.example",
    ]) {
      expect(readFileSync(f, "utf8"), f).not.toContain(termo);
    }
    expect(readFileSync("package.json", "utf8")).not.toMatch(/@sen[t]ry/);
  });
});

import { ehCancelamentoDeRequisicao } from "../producao-erros.server";

describe("Coletor: cancelamento de requisição não é erro do app (medido em 02/11/2026: 43 linhas, maioria 'aborted')", () => {
  it("reconhece aborted, This operation was aborted e AbortError", () => {
    expect(ehCancelamentoDeRequisicao(new Error("aborted"))).toBe(true);
    expect(ehCancelamentoDeRequisicao(new Error("This operation was aborted"))).toBe(true);
    expect(
      ehCancelamentoDeRequisicao(Object.assign(new Error("x"), { name: "AbortError" })),
    ).toBe(true);
  });

  it("erro de verdade continua sendo registrado", () => {
    expect(ehCancelamentoDeRequisicao(new Error("Unauthorized: No authorization header"))).toBe(
      false,
    );
    expect(ehCancelamentoDeRequisicao(undefined)).toBe(false);
  });

  it("o 500 engolido pelo h3 guarda a rota que quebrou", () => {
    expect(readFileSync("src/server.ts", "utf8")).toContain('mecanismo: "h3_swallowed", rota');
  });
});
