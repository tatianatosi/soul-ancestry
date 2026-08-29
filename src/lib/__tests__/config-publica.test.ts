import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  CHAVE_GLOBAL,
  PROJETO_DECLARADO,
  ambienteDivergente,
  configPublicaDoNavegador,
  configPublicaDoServidor,
  refDaUrl,
  scriptDeConfigPublica,
} from "@/lib/config-publica";

describe("configuração pública em tempo de execução", () => {
  it("o ambiente prevalece quando aponta para o projeto declarado", () => {
    const c = configPublicaDoServidor({
      SUPABASE_URL: PROJETO_DECLARADO.url,
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_do_ambiente",
    });
    expect(c.url).toBe(PROJETO_DECLARADO.url);
    expect(c.publishableKey).toBe("sb_publishable_do_ambiente");
  });

  it("ambiente apontando para OUTRO projeto é ignorado — foi o bug do dia inteiro", () => {
    // A Vercel apontava para um projeto vazio; o login dizia "senha incorreta"
    // para uma conta que existe, só que no projeto declarado.
    const c = configPublicaDoServidor({
      SUPABASE_URL: "https://outroprojetovazio.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_do_projeto_errado",
    });
    expect(c.url).toBe(PROJETO_DECLARADO.url);
    expect(c.publishableKey).toBe(PROJETO_DECLARADO.publishableKey);
  });

  it("a divergência é detectável, para poder ser dita na tela", () => {
    expect(ambienteDivergente({ SUPABASE_URL: "https://outro.supabase.co" })).toBe("outro");
    expect(ambienteDivergente({ SUPABASE_URL: PROJETO_DECLARADO.url })).toBeNull();
    expect(ambienteDivergente({})).toBeNull();
  });

  it("o projeto declarado é o mesmo de supabase/config.toml", () => {
    const toml = readFileSync("supabase/config.toml", "utf8");
    expect(toml).toContain(`project_id = "${PROJETO_DECLARADO.ref}"`);
  });

  it("NUNCA há chave secreta ou service role no valor declarado", () => {
    const json = JSON.stringify(PROJETO_DECLARADO);
    expect(json).not.toMatch(/secret|service_role/i);
    expect(PROJETO_DECLARADO.publishableKey.startsWith("sb_publishable_")).toBe(true);
  });

  it("aceita também a grafia VITE_, quando aponta ao projeto declarado", () => {
    const c = configPublicaDoServidor({
      VITE_SUPABASE_URL: PROJETO_DECLARADO.url,
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_exemplo",
    });
    expect(c.publishableKey).toBe("sb_publishable_exemplo");
  });

  it("refDaUrl extrai o projeto e recusa lixo", () => {
    expect(refDaUrl("https://abc123.supabase.co")).toBe("abc123");
    expect(refDaUrl("  https://ABC.supabase.co/rest ")).toBe("abc");
    expect(refDaUrl("nao-e-url")).toBeNull();
  });

  it("faltando qualquer metade, cai no projeto declarado — nunca em meia configuração", () => {
    for (const env of [
      { SUPABASE_URL: "https://x.supabase.co" },
      { SUPABASE_PUBLISHABLE_KEY: "k" },
      {},
    ]) {
      expect(configPublicaDoServidor(env)).toEqual({
        url: PROJETO_DECLARADO.url,
        publishableKey: PROJETO_DECLARADO.publishableKey,
      });
    }
  });

  it("sem configuração, nenhum script é injetado", () => {
    expect(scriptDeConfigPublica(null)).toBe("");
  });

  it("NUNCA carrega chave secreta ou service role", () => {
    // A trava que importa: só o que é público por desenho atravessa.
    const c = configPublicaDoServidor({
      SUPABASE_URL: PROJETO_DECLARADO.url,
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_exemplo",
      SUPABASE_SECRET_KEY: "sb_secret_NAO_PODE_VAZAR",
      SUPABASE_SERVICE_ROLE_KEY: "service_role_NAO_PODE_VAZAR",
    });
    const script = scriptDeConfigPublica(c);
    expect(script).not.toContain("NAO_PODE_VAZAR");
    expect(script).not.toMatch(/secret/i);
    expect(script).not.toMatch(/service_role/i);
    expect(Object.keys(c)).toEqual(["url", "publishableKey"]);
  });

  it("o script não pode fechar a tag nem injetar código", () => {
    const script = scriptDeConfigPublica({
      url: "https://x.supabase.co</script><script>alert(1)</script>",
      publishableKey: "k",
    });
    // O valor vira literal de string; nenhuma tag escapa do JSON.parse.
    expect(script).not.toMatch(/<\/script>/);
    expect(script).toContain("JSON.parse(");
  });

  it("o navegador lê o que o servidor injetou", () => {
    const g = globalThis as unknown as Record<string, unknown>;
    const antes = g.window;
    g.window = { [CHAVE_GLOBAL]: { url: "https://x.supabase.co", publishableKey: "k" } };
    expect(configPublicaDoNavegador()).toEqual({
      url: "https://x.supabase.co",
      publishableKey: "k",
    });
    g.window = { [CHAVE_GLOBAL]: { url: "https://x.supabase.co" } };
    expect(configPublicaDoNavegador()).toBeNull();
    g.window = {};
    expect(configPublicaDoNavegador()).toBeNull();
    if (antes === undefined) delete g.window;
    else g.window = antes;
  });
});

describe("o cliente Supabase resolve a configuração em três degraus", () => {
  it("build → execução → servidor, nessa ordem", () => {
    const src = readFileSync("src/integrations/supabase/client.ts", "utf8");
    const iVite = src.indexOf("import.meta.env.VITE_SUPABASE_URL");
    const iRuntime = src.indexOf("runtime?.url");
    const iProcess = src.indexOf("process.env.SUPABASE_URL");
    expect(iVite).toBeGreaterThan(-1);
    expect(iRuntime).toBeGreaterThan(iVite);
    expect(iProcess).toBeGreaterThan(iRuntime);
  });

  it("a mensagem de erro deixou de mandar para o Lovable Cloud", () => {
    // Quem está na Vercel não tem o que fazer com essa instrução.
    const src = readFileSync("src/integrations/supabase/client.ts", "utf8");
    expect(src).not.toContain("Connect Supabase in Lovable Cloud");
    expect(src).toContain("SUPABASE_PUBLISHABLE_KEY");
  });
});

describe("o escape sobrevive à ida e à volta", () => {
  it("o valor injetado é idêntico ao original depois do JSON.parse", () => {
    const original = {
      url: "https://x.supabase.co</script><script>alert(1)</script>&amp;",
      publishableKey: "chave<>&",
    };
    const script = scriptDeConfigPublica(original);
    // Executa o script num objeto de janela falso e confere o resultado.
    const janela: Record<string, unknown> = {};
    new Function("window", script)(janela);
    expect(janela[CHAVE_GLOBAL]).toEqual(original);
  });

  it("nenhum caractere que fecha tag sobra no script", () => {
    const script = scriptDeConfigPublica({ url: "a</script>b", publishableKey: "c<d>e&f" });
    expect(script).not.toMatch(/[<>]/);
  });
});

describe("o shell do servidor injeta a configuração", () => {
  it("__root.tsx monta o script no <head>", () => {
    const src = readFileSync("src/routes/__root.tsx", "utf8");
    expect(src).toContain("configPublicaDoServidor()");
    expect(src).toContain("scriptDeConfigPublica");
    // Dentro do <head>, antes dos módulos do cliente rodarem.
    const iHead = src.indexOf("<HeadContent />");
    const iScript = src.indexOf("dangerouslySetInnerHTML={{ __html: config }}");
    expect(iScript).toBeGreaterThan(iHead);
    expect(iScript).toBeLessThan(src.indexOf("<Scripts />"));
  });

  it("sem configuração no servidor, nenhuma tag vazia é emitida", () => {
    const src = readFileSync("src/routes/__root.tsx", "utf8");
    expect(src).toContain("config ? <script");
    expect(src).toContain(": null}");
  });
});

describe("robustez fora do servidor", () => {
  it("chamada sem process não lança — cai no projeto declarado", () => {
    const g = globalThis as unknown as Record<string, unknown>;
    const antes = g.process;
    // Simula o navegador, onde `process` não existe.
    delete g.process;
    expect(() => configPublicaDoServidor()).not.toThrow();
    expect(configPublicaDoServidor().url).toBe(PROJETO_DECLARADO.url);
    g.process = antes;
  });
});

describe("aviso de configuração na tela de login", () => {
  it("só aparece quando não há configuração por nenhum dos caminhos", () => {
    const src = readFileSync("src/components/equipe/aviso-configuracao.tsx", "utf8");
    expect(src).toContain("import.meta.env.VITE_SUPABASE_URL");
    expect(src).toContain("configPublicaDoNavegador()");
    expect(src).toContain("if (temBuildTime || temRuntime) return null;");
  });

  it("não expõe valor de configuração, só informa a ausência", () => {
    const src = readFileSync("src/components/equipe/aviso-configuracao.tsx", "utf8");
    // Booleanos apenas: nada do valor entra no texto.
    expect(src).toContain("!!configPublicaDoNavegador()");
    expect(src).not.toMatch(/\.url\b|\.publishableKey\b/);
  });

  it("a tela de login renderiza o aviso", () => {
    const rota = readFileSync("src/routes/equipe.entrar.tsx", "utf8");
    expect(rota).toContain("<AvisoConfiguracao />");
  });
});

describe("o aviso não dá alarme falso", () => {
  it("não decide antes de hidratar", () => {
    // No servidor `window` não existe: sem esta guarda, o aviso vermelho
    // aparecia na primeira pintura mesmo com a configuração presente.
    const src = readFileSync("src/components/equipe/aviso-configuracao.tsx", "utf8");
    expect(src).toContain("useHydrated()");
    const iHidratado = src.indexOf("if (!hidratado) return null;");
    const iLeitura = src.indexOf("configPublicaDoNavegador()");
    expect(iHidratado).toBeGreaterThan(-1);
    expect(iHidratado).toBeLessThan(iLeitura);
  });
});
