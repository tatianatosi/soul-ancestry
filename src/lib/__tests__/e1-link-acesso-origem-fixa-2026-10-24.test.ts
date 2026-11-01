/**
 * E1 — link de acesso do cliente com origem fixa (24/10/2026).
 * Laudo de prontidão (PR #176), item crítico: o destino do link de login era montado
 * a partir dos cabeçalhos Origin/Host, controláveis por quem chama, em endpoint público.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  ORIGENS_PERMITIDAS,
  ORIGEM_PRODUCAO,
  origemDeAutenticacao,
  urlDeRetorno,
} from "@/lib/origem-canonica";

const PROD = "https://soul-ancestry.lovable.app";

describe("origemDeAutenticacao — lista de permissão exata", () => {
  it("produção é a única origem permitida hoje", () => {
    expect(ORIGEM_PRODUCAO).toBe(PROD);
    expect([...ORIGENS_PERMITIDAS]).toEqual([PROD]);
  });

  it("sem cabeçalho, usa a produção", () => {
    expect(origemDeAutenticacao(undefined)).toBe(PROD);
    expect(origemDeAutenticacao(null)).toBe(PROD);
    expect(origemDeAutenticacao("")).toBe(PROD);
  });

  it("aceita a própria produção (com e sem barra final ou espaços)", () => {
    expect(origemDeAutenticacao(PROD)).toBe(PROD);
    expect(origemDeAutenticacao(`${PROD}/`)).toBe(PROD);
    expect(origemDeAutenticacao(`  ${PROD}  `)).toBe(PROD);
  });

  it.each([
    ["domínio do atacante", "https://dominio-falso.example"],
    ["Host forjado com porta", "https://soul-ancestry.lovable.app:8443"],
    ["http em vez de https", "http://soul-ancestry.lovable.app"],
    ["subdomínio da produção", "https://x.soul-ancestry.lovable.app"],
    ["produção como prefixo do domínio do atacante", "https://soul-ancestry.lovable.app.evil.com"],
    ["credencial na URL (userinfo)", "https://soul-ancestry.lovable.app@evil.com"],
    ["credencial com a produção depois", "https://evil.com@soul-ancestry.lovable.app"],
    ["curinga lovable.app", "https://qualquer-projeto.lovable.app"],
    ["prévia do editor", "https://id-preview--abc.lovable.app"],
    ["lovableproject", "https://abc.lovableproject.com"],
    ["localhost", "http://localhost:3000"],
    ["lixo", "não é uma url"],
    ["esquema perigoso", "javascript:alert(1)"],
    ["só o host sem esquema", "soul-ancestry.lovable.app"],
  ])("recusa e cai na produção: %s", (_nome, entrada) => {
    expect(origemDeAutenticacao(entrada)).toBe(PROD);
  });

  it("urlDeRetorno monta o caminho sempre sob a produção", () => {
    expect(urlDeRetorno("/acesso/confirmar", "https://dominio-falso.example")).toBe(`${PROD}/acesso/confirmar`);
    expect(urlDeRetorno("acesso/confirmar")).toBe(`${PROD}/acesso/confirmar`);
    expect(urlDeRetorno("/equipe/redefinir-senha", PROD)).toBe(`${PROD}/equipe/redefinir-senha`);
  });
});

describe("nenhum link de autenticação é montado a partir de cabeçalho", () => {
  const portal = readFileSync("src/lib/portal.functions.ts", "utf8");
  const equipe = readFileSync("src/lib/equipe.functions.ts", "utf8");

  it("portal: os 3 pontos de e-mail de acesso usam urlDeRetorno", () => {
    expect((portal.match(/urlDeRetorno\("\/acesso\/confirmar", getRequestHeader\("origin"\)\)/g) ?? []).length).toBe(3);
    expect(portal).not.toMatch(/\$\{origem\}\/acesso\/confirmar/);
    expect(portal).not.toMatch(/https:\/\/\$\{getRequestHeader\("host"\)\}/);
  });

  it("equipe: origem() deixou de usar Host e lista de bloqueio", () => {
    expect(equipe).toContain("origemDeAutenticacao(getRequestHeader(\"origin\"))");
    expect(equipe).not.toMatch(/getRequestHeader\("host"\)/);
    expect(equipe).not.toMatch(/lovableproject|id-preview/);
  });

  it("todo emailRedirectTo/redirectTo de auth vem de origem canônica", () => {
    expect(readFileSync("src/lib/portal.server.ts", "utf8")).toMatch(/emailRedirectTo: redirectTo/);
    expect(equipe.match(/redirectTo: `\$\{origem\(\)\}\/equipe\/redefinir-senha`/g)?.length).toBe(2);
  });
});
