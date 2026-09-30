import { describe, expect, it } from "vitest";

import { PROJETO_DECLARADO } from "../config-publica";
import {
  chavePublicavelDoServidor,
  chaveSecretaDoServidor,
  diagnosticoDoServidor,
  formatoDaChave,
  urlDoServidor,
} from "../config-servidor";

const OUTRO = "https://outroprojetovazio.supabase.co";

describe("o servidor obedece ao projeto declarado", () => {
  it("usa o declarado quando não há ambiente nenhum", () => {
    expect(urlDoServidor({})).toBe(PROJETO_DECLARADO.url);
    expect(chavePublicavelDoServidor({})).toBe(PROJETO_DECLARADO.publishableKey);
  });

  it("aproveita o ambiente quando ele aponta para o MESMO projeto", () => {
    const env = {
      SUPABASE_URL: PROJETO_DECLARADO.url,
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_doAmbiente",
    };
    expect(urlDoServidor(env)).toBe(PROJETO_DECLARADO.url);
    expect(chavePublicavelDoServidor(env)).toBe("sb_publishable_doAmbiente");
  });

  it("ignora o ambiente quando ele aponta para OUTRO projeto", () => {
    // Este é o caso que quebrou o login: a Vercel apontava para um projeto
    // vazio, e o servidor validava ali um token emitido pelo projeto certo.
    const env = { SUPABASE_URL: OUTRO, SUPABASE_PUBLISHABLE_KEY: "sb_publishable_doOutro" };
    expect(urlDoServidor(env)).toBe(PROJETO_DECLARADO.url);
    expect(chavePublicavelDoServidor(env)).toBe(PROJETO_DECLARADO.publishableKey);
  });

  it("nunca mistura URL de um projeto com chave de outro", () => {
    // Sem esta regra, a chave do ambiente sobreviveria à troca da URL — e
    // chave de um projeto com URL de outro não autentica coisa alguma.
    const env = { SUPABASE_URL: OUTRO, SUPABASE_PUBLISHABLE_KEY: "sb_publishable_doOutro" };
    const url = urlDoServidor(env);
    const chave = chavePublicavelDoServidor(env);
    const doMesmoLugar =
      url === PROJETO_DECLARADO.url && chave === PROJETO_DECLARADO.publishableKey;
    expect(doMesmoLugar).toBe(true);
  });

  it("navegador e servidor resolvem para o mesmo projeto", async () => {
    // A divergência entre os dois lados foi a causa raiz. Este teste existe
    // para que ela não possa voltar em silêncio.
    const { configPublicaDoServidor } = await import("../config-publica");
    const env = { SUPABASE_URL: OUTRO, SUPABASE_PUBLISHABLE_KEY: "sb_publishable_doOutro" };
    expect(configPublicaDoServidor(env).url).toBe(urlDoServidor(env));
  });
});

describe("a chave secreta só vem do ambiente", () => {
  it("é indefinida quando o ambiente não a tem", () => {
    expect(chaveSecretaDoServidor({})).toBeUndefined();
  });

  it("aceita os dois nomes usados pela Vercel", () => {
    expect(chaveSecretaDoServidor({ SUPABASE_SERVICE_ROLE_KEY: "s1" })).toBe("s1");
    expect(chaveSecretaDoServidor({ SUPABASE_SECRET_KEY: "s2" })).toBe("s2");
  });

  it("nenhum segredo está escrito no repositório", () => {
    // A regra que a Proprietária fixou: publicável pode circular, secreta
    // nunca sai do painel do Supabase e da variável de ambiente do servidor.
    const declarado = JSON.stringify(PROJETO_DECLARADO);
    expect(declarado).not.toMatch(/sb_secret_/);
    expect(declarado).not.toMatch(/service_role/);
  });
});

describe("o diagnóstico não vaza segredo", () => {
  it("não repete nenhum valor de chave, só o formato", () => {
    const env = {
      SUPABASE_URL: PROJETO_DECLARADO.url,
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_valorSensivel",
      SUPABASE_SERVICE_ROLE_KEY: "sb_secret_valorMuitoSensivel",
    };
    const texto = JSON.stringify(diagnosticoDoServidor(env));
    expect(texto).not.toContain("valorSensivel");
    expect(texto).not.toContain("valorMuitoSensivel");
    expect(texto).toContain("sb_secret_");
  });

  it("afirma com certeza que o segredo não serve quando o ambiente é de outro projeto", () => {
    const d = diagnosticoDoServidor({ SUPABASE_URL: OUTRO, SUPABASE_SERVICE_ROLE_KEY: "sb_secret_x" });
    expect(d.ambienteConcorda).toBe(false);
    expect(d.refDoAmbiente).toBe("outroprojetovazio");
    expect(d.refEmUso).toBe(PROJETO_DECLARADO.ref);
    expect(d.segredoPodeServir).toBe("nao");
  });

  it("não afirma mais do que sabe quando o ambiente concorda", () => {
    const d = diagnosticoDoServidor({
      SUPABASE_URL: PROJETO_DECLARADO.url,
      SUPABASE_SERVICE_ROLE_KEY: "sb_secret_x",
    });
    expect(d.segredoPodeServir).toBe("provavel");
  });

  it("distingue ausência de segredo de segredo errado", () => {
    expect(diagnosticoDoServidor({}).segredoPodeServir).toBe("ausente");
  });

  it("descreve o formato sem revelar o conteúdo", () => {
    expect(formatoDaChave(undefined)).toBe("ausente");
    expect(formatoDaChave("sb_secret_abc")).toBe("sb_secret_");
    expect(formatoDaChave("eyJhbGciOi")).toBe("jwt");
  });
});

describe("chave do ambiente que não serve ao projeto (Invalid API key, 30/09/2026)", () => {
  const jwt = (payload: object) =>
    `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.assinatura`;
  const url = PROJETO_DECLARADO.url;

  it("URL certa + JWT de outro projeto → usa a chave declarada", () => {
    const env = {
      SUPABASE_URL: url,
      SUPABASE_PUBLISHABLE_KEY: jwt({ ref: "zsxpdbhdvbuulwpepemd", role: "anon" }),
    };
    expect(chavePublicavelDoServidor(env)).toBe(PROJETO_DECLARADO.publishableKey);
  });

  it("URL certa + JWT anon do mesmo projeto → mantém a do ambiente", () => {
    const chave = jwt({ ref: PROJETO_DECLARADO.ref, role: "anon" });
    expect(chavePublicavelDoServidor({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: chave })).toBe(chave);
  });

  it("service_role e sb_secret_ nunca viram chave publicável", () => {
    const servico = jwt({ ref: PROJETO_DECLARADO.ref, role: "service_role" });
    expect(chavePublicavelDoServidor({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: servico })).toBe(
      PROJETO_DECLARADO.publishableKey,
    );
    expect(
      chavePublicavelDoServidor({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: "sb_secret_x" }),
    ).toBe(PROJETO_DECLARADO.publishableKey);
  });

  it("chave ilegível ou vazia → a declarada, nunca a quebrada", () => {
    for (const k of ["lixo", "eyJ.quebrado", "   "]) {
      expect(chavePublicavelDoServidor({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: k })).toBe(
        PROJETO_DECLARADO.publishableKey,
      );
    }
  });

  it("o cliente do navegador aplica a mesma regra", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync("src/integrations/supabase/client.ts", "utf8");
    expect(src).toContain("chaveServeAoProjeto(bruto.publishableKey, PROJETO_DECLARADO.ref)");
  });
});

describe('segredo de outro projeto ("Invalid API key" em Acesso app como pessoa, 30/09/2026)', () => {
  const jwtDe = (ref: string, role = "service_role") =>
    `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ ref, role })).toString("base64url")}.assinatura`;

  it("o dono gravado na chave decide, mesmo quando a URL do ambiente está certa", async () => {
    const { segredoServeAoProjeto } = await import("../config-servidor");
    expect(segredoServeAoProjeto(jwtDe("zsxpdbhdvbuulwpepemd"), PROJETO_DECLARADO.ref)).toBe(false);
    expect(segredoServeAoProjeto(jwtDe(PROJETO_DECLARADO.ref), PROJETO_DECLARADO.ref)).toBe(true);
  });

  it("chave opaca não tem dono legível: responde 'não sei', nunca um palpite", async () => {
    const { segredoServeAoProjeto } = await import("../config-servidor");
    for (const k of ["sb_secret_opaca", "sb_publishable_opaca", "", undefined, null])
      expect(segredoServeAoProjeto(k, PROJETO_DECLARADO.ref)).toBeNull();
  });

  it("o diagnóstico afirma 'nao' com o segredo do projeto legado e 'sim' com o certo", () => {
    const base = { SUPABASE_URL: PROJETO_DECLARADO.url };
    expect(
      diagnosticoDoServidor({ ...base, SUPABASE_SERVICE_ROLE_KEY: jwtDe("zsxpdbhdvbuulwpepemd") })
        .segredoPodeServir,
    ).toBe("nao");
    expect(
      diagnosticoDoServidor({ ...base, SUPABASE_SERVICE_ROLE_KEY: jwtDe(PROJETO_DECLARADO.ref) })
        .segredoPodeServir,
    ).toBe("sim");
    // Opaca continua "provavel": dúvida não vira acusação.
    expect(
      diagnosticoDoServidor({ ...base, SUPABASE_SERVICE_ROLE_KEY: "sb_secret_opaca" })
        .segredoPodeServir,
    ).toBe("provavel");
    expect(diagnosticoDoServidor(base).segredoPodeServir).toBe("ausente");
    // Nenhum valor de chave atravessa o diagnóstico.
    const d = JSON.stringify(
      diagnosticoDoServidor({ ...base, SUPABASE_SERVICE_ROLE_KEY: jwtDe("outro") }),
    );
    expect(d).not.toContain("eyJ");
  });

  it("o cliente admin recusa com mensagem que nomeia os dois projetos", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync("src/integrations/supabase/client.server.ts", "utf8");
    expect(src).toContain("segredoServeAoProjeto(SUPABASE_SERVICE_ROLE_KEY, PROJETO_DECLARADO.ref) === false");
    expect(src).toContain("Troque SUPABASE_SERVICE_ROLE_KEY");
  });

  it("link mágico do cliente e assistente usam o resolvedor, não process.env cru", async () => {
    const { readFileSync } = await import("node:fs");
    for (const f of ["src/lib/portal.server.ts", "src/routes/api/pesquisa-assistente.ts"]) {
      const src = readFileSync(f, "utf8");
      expect(src).toContain("chavePublicavelDoServidor()");
      expect(src).toContain("urlDoServidor()");
      expect(src).not.toMatch(/process\.env\[?"?SUPABASE_(URL|PUBLISHABLE_KEY)/);
    }
  });
});
