import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  ATALHOS_DESCOBERTA,
  BANNER_REFERENCIA_MOCKUP,
  ROTULOS_HUMANOS,
  ROTULO_PRIORIDADE,
  decidirAcessoReferencia,
  rotuloHumano,
} from "@/lib/descoberta-desk";
import { ORDEM_BLOCOS_PAINEL, validarOrdemPainel } from "@/lib/painel-ordem";

const shell = readFileSync("src/components/saas/shell.tsx", "utf8");
const painel = readFileSync("src/components/painel/painel-dia.tsx", "utf8");

describe("acesso à referência histórica", () => {
  it("permite papéis internos", () => {
    for (const papel of ["admin", "operacoes", "pesquisador", "comercial", "financeiro", "leitura"]) {
      expect(decidirAcessoReferencia({ autenticado: true, papeis: [papel] })).toBe("permitir");
    }
  });

  it("manda cliente autenticado sem papel para o App Cliente", () => {
    expect(decidirAcessoReferencia({ autenticado: true, papeis: [] })).toBe("portal");
    expect(decidirAcessoReferencia({ autenticado: true, papeis: ["cliente"] })).toBe("portal");
  });

  it("manda visitante para a entrada da equipe", () => {
    expect(decidirAcessoReferencia({ autenticado: false, papeis: [] })).toBe("entrar");
  });

  it("declara o banner de referência histórica", () => {
    expect(BANNER_REFERENCIA_MOCKUP).toContain("REFERÊNCIA HISTÓRICA");
    expect(BANNER_REFERENCIA_MOCKUP).toContain("NÃO É A SUPERFÍCIE OPERACIONAL");
  });
});

describe("nomenclatura humana", () => {
  it("mapeia rotas técnicas para rótulos humanos sem mudar a URL", () => {
    expect(rotuloHumano("/qualidade")).toBe("Radar Interno");
    expect(rotuloHumano("/matriz-juridica")).toBe("Validação Jurídica");
    expect(ROTULO_PRIORIDADE).toBe("Prioridade dos casos");
    expect(Object.keys(ROTULOS_HUMANOS).every((r) => r.startsWith("/"))).toBe(true);
  });

  it("exibe os rótulos na navegação do Desk real", () => {
    expect(shell).toContain('{ to: "/qualidade", label: "Radar Interno" }');
    expect(shell).toContain('{ to: "/matriz-juridica", label: "Validação Jurídica" }');
  });

  it("mantém os cabeçalhos das telas alinhados ao rótulo humano", () => {
    expect(readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8")).toContain('titulo="Radar Interno"');
    expect(readFileSync("src/routes/_authenticated/matriz-juridica.tsx", "utf8")).toContain(
      'titulo="Validação Jurídica"',
    );
  });
});

describe("atalhos de descoberta", () => {
  const rotasExistentes = new Set([
    "/qualidade",
    "/matriz-juridica",
    "/casos",
    "/pesquisa-modulo",
    "/integracoes",
    "/acessos-portal",
    "/referencia-mockup-desk",
  ]);

  it("aponta apenas para rotas existentes, sem duplicar", () => {
    const rotas = ATALHOS_DESCOBERTA.map((a) => a.rota);
    expect(new Set(rotas).size).toBe(rotas.length);
    for (const r of rotas) expect(rotasExistentes.has(r)).toBe(true);
  });

  it("cobre os seis módulos pedidos mais a referência", () => {
    expect(ATALHOS_DESCOBERTA).toHaveLength(7);
    expect(ATALHOS_DESCOBERTA.filter((a) => a.referencia)).toHaveLength(1);
  });

  it("é descoberta pura: nenhum atalho carrega ação, mutação ou status", () => {
    for (const a of ATALHOS_DESCOBERTA) {
      expect(Object.keys(a).sort()).toEqual(
        a.referencia ? ["onde", "referencia", "rota", "rotulo"] : ["onde", "rota", "rotulo"],
      );
    }
    expect(painel).toContain('data-painel-bloco="descoberta"');
    expect(painel).not.toContain("ATALHOS_DESCOBERTA.map((a) => a.acao");
  });

  it("mantém o bloco no fim da ordem canônica, sem quebrar exceções → sinais", () => {
    const chaves = ORDEM_BLOCOS_PAINEL.map((b) => b.chave);
    expect(chaves[chaves.length - 1]).toBe("descoberta");
    expect(validarOrdemPainel(chaves)).toEqual([]);
  });
});

describe("superfícies preservadas", () => {
  it("mantém os 7 grupos de navegação do Desk operacional", () => {
    const grupos = [
      "Visão geral",
      "Comercial",
      "Casos e núcleos",
      "Pesquisa genealógica",
      "Contratos e financeiro",
      "Governança e biblioteca",
      "App Cliente",
    ];
    for (const g of grupos) expect(shell).toContain(`label: "${g}"`);
  });

  it("o mockup histórico não recebe dados reais nem chamadas de servidor", () => {
    const mockup = readFileSync("src/components/desk-app.tsx", "utf8");
    expect(mockup).not.toContain("@/integrations/supabase/client");
    expect(mockup).not.toContain("useServerFn");
  });

  it("a rota / continua com o redirecionamento atual, sem apontar para o mockup", () => {
    const raiz = readFileSync("src/routes/index.tsx", "utf8");
    expect(raiz).not.toContain("referencia-mockup-desk");
  });
});
