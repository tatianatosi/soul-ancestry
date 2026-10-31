import { readFileSync } from "node:fs";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { capturarErroProducao } from "../producao-erros.server";

/**
 * Item 16 da prontidão #176 (31/10/2026): "coletor de erro em produção".
 *
 * Antes deste arquivo o único caminho de erro em produção era
 * `console.error` e, no navegador, `window.__lovableEvents` — que só existe
 * dentro do ambiente do Lovable, nunca para um visitante real em produção.
 *
 * `capturarErroProducao` nunca lança e nunca bloqueia quem chamou: DSN
 * ausente (ainda não configurado) é um estado válido, não uma falha.
 */
describe("Coletor de erro em produção (Sentry, envelope manual)", () => {
  const dsnOriginal = process.env.SENTRY_DSN;

  beforeEach(() => {
    delete process.env.SENTRY_DSN;
  });

  afterEach(() => {
    if (dsnOriginal === undefined) delete process.env.SENTRY_DSN;
    else process.env.SENTRY_DSN = dsnOriginal;
    vi.unstubAllGlobals();
  });

  it("sem SENTRY_DSN configurado, não lança e não tenta enviar nada", () => {
    const fetchEspiao = vi.fn();
    vi.stubGlobal("fetch", fetchEspiao);
    expect(() => capturarErroProducao(new Error("falha de teste"))).not.toThrow();
    expect(fetchEspiao).not.toHaveBeenCalled();
  });

  it("com SENTRY_DSN configurado, envia um envelope para a URL de ingestão correta", () => {
    process.env.SENTRY_DSN = "https://chavepublica@o123.ingest.sentry.io/456";
    const fetchEspiao = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchEspiao);

    capturarErroProducao(new Error("falha real"), { origem: "servidor" });

    expect(fetchEspiao).toHaveBeenCalledTimes(1);
    const [url, init] = fetchEspiao.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://o123.ingest.sentry.io/api/456/envelope/?sentry_key=chavepublica&sentry_version=7",
    );
    expect(init.method).toBe("POST");
    expect(String(init.body)).toContain("falha real");
    expect(String(init.body)).toContain("servidor");
  });

  it("uma falha de rede ao enviar nunca escapa como rejeição não tratada", async () => {
    process.env.SENTRY_DSN = "https://chavepublica@o123.ingest.sentry.io/456";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("rede fora")));
    expect(() => capturarErroProducao(new Error("x"))).not.toThrow();
    // dá um tick para a promise rejeitada (já tratada com .catch) assentar
    await new Promise((r) => setTimeout(r, 0));
  });

  it("DSN malformado é tratado como ausente, não como exceção", () => {
    process.env.SENTRY_DSN = "não é uma url";
    const fetchEspiao = vi.fn();
    vi.stubGlobal("fetch", fetchEspiao);
    expect(() => capturarErroProducao(new Error("x"))).not.toThrow();
    expect(fetchEspiao).not.toHaveBeenCalled();
  });
});

describe("Rota pública /api/erro — recebe o relato do navegador sem exigir sessão", () => {
  const src = readFileSync("src/routes/api/erro.ts", "utf8");

  it("é uma rota POST pública, sem exigir Authorization", () => {
    expect(src).toContain('createFileRoute("/api/erro")');
    expect(src).toContain("POST:");
    expect(src).not.toContain("Authorization");
    expect(src).not.toContain("requireSupabaseAuth");
  });

  it("repassa ao coletor de produção, nunca ao DSN direto no cliente", () => {
    expect(src).toContain("capturarErroProducao");
  });

  it("limita o tamanho do corpo recebido", () => {
    expect(src).toContain("TAMANHO_MAXIMO_CORPO");
  });

  it("a rota está registrada no roteiro gerado", () => {
    const routeTree = readFileSync("src/routeTree.gen.ts", "utf8");
    expect(routeTree).toContain("/api/erro");
  });
});

describe("Pontos de captura existentes passam a reportar ao coletor de produção", () => {
  it("error-capture.ts (listeners globais do servidor) chama capturarErroProducao", () => {
    const src = readFileSync("src/lib/error-capture.ts", "utf8");
    expect(src).toContain("capturarErroProducao");
  });

  it("start.ts (middleware de requisição) chama capturarErroProducao", () => {
    const src = readFileSync("src/start.ts", "utf8");
    expect(src).toContain("capturarErroProducao");
  });

  it("server.ts (fetch handler e caminho h3_swallowed) chama capturarErroProducao", () => {
    const src = readFileSync("src/server.ts", "utf8");
    const ocorrencias = src.split("capturarErroProducao").length - 1;
    expect(ocorrencias).toBeGreaterThanOrEqual(2);
  });

  it("__root.tsx (ErrorComponent do cliente) chama reportarErroCliente", () => {
    const src = readFileSync("src/routes/__root.tsx", "utf8");
    expect(src).toContain("reportarErroCliente");
  });
});

describe("SENTRY_DSN documentado no .env.example, sem prefixo VITE_", () => {
  it("existe a variável, e nenhuma variante exposta ao navegador", () => {
    const env = readFileSync(".env.example", "utf8");
    expect(env).toContain("SENTRY_DSN");
    expect(env).not.toContain("VITE_SENTRY_DSN");
  });
});
