import { describe, expect, it } from "vitest";

import { PROJETO_DECLARADO } from "../config-publica";
import {
  chavePublicavelDoServidor,
  chaveSecretaDoServidor,
  diagnosticoDoServidor,
  formatoDaChave,
  urlDoServidor,
} from "../config-servidor";

const OUTRO = "https://zsxpdbhdvbuulwpepemd.supabase.co";

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
    expect(d.refDoAmbiente).toBe("zsxpdbhdvbuulwpepemd");
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
