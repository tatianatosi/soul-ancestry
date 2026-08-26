import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  CHAVE_GLOBAL,
  configPublicaDoNavegador,
  configPublicaDoServidor,
  scriptDeConfigPublica,
} from "@/lib/config-publica";

describe("configuração pública em tempo de execução", () => {
  it("lê as variáveis de servidor que já existem no deploy", () => {
    const c = configPublicaDoServidor({
      SUPABASE_URL: "https://exemplo.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_exemplo",
    });
    expect(c).toEqual({
      url: "https://exemplo.supabase.co",
      publishableKey: "sb_publishable_exemplo",
    });
  });

  it("aceita também a grafia VITE_, para não quebrar quem já a definiu", () => {
    const c = configPublicaDoServidor({
      VITE_SUPABASE_URL: "https://exemplo.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_exemplo",
    });
    expect(c?.url).toBe("https://exemplo.supabase.co");
  });

  it("faltando qualquer metade, não devolve configuração pela metade", () => {
    expect(configPublicaDoServidor({ SUPABASE_URL: "https://x.supabase.co" })).toBeNull();
    expect(configPublicaDoServidor({ SUPABASE_PUBLISHABLE_KEY: "k" })).toBeNull();
    expect(configPublicaDoServidor({})).toBeNull();
  });

  it("sem configuração, nenhum script é injetado", () => {
    expect(scriptDeConfigPublica(null)).toBe("");
  });

  it("NUNCA carrega chave secreta ou service role", () => {
    // A trava que importa: só o que é público por desenho atravessa.
    const c = configPublicaDoServidor({
      SUPABASE_URL: "https://exemplo.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_exemplo",
      SUPABASE_SECRET_KEY: "sb_secret_NAO_PODE_VAZAR",
      SUPABASE_SERVICE_ROLE_KEY: "service_role_NAO_PODE_VAZAR",
    });
    const script = scriptDeConfigPublica(c);
    expect(script).not.toContain("NAO_PODE_VAZAR");
    expect(script).not.toMatch(/secret/i);
    expect(script).not.toMatch(/service_role/i);
    expect(Object.keys(c ?? {})).toEqual(["url", "publishableKey"]);
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
  it("chamada sem process não lança — devolve null", () => {
    const g = globalThis as unknown as Record<string, unknown>;
    const antes = g.process;
    // Simula o navegador, onde `process` não existe.
    delete g.process;
    expect(() => configPublicaDoServidor()).not.toThrow();
    expect(configPublicaDoServidor()).toBeNull();
    g.process = antes;
  });
});
