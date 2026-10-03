import { describe, expect, it } from "vitest";

import { PAISES_LINHA_PRIORITARIA } from "@/lib/crm-desk";
import { PROJETO_DECLARADO, PROJETO_LEGADO } from "@/lib/config-publica";
import { SUPERFICIE_DE_LANCAMENTO } from "@/lib/decisoes-da-proprietaria";
import { chavePublicavelDoServidor, urlDoServidor } from "@/lib/config-servidor";
import {
  eixoDoPais,
  FONTES_EM_PREPARACAO,
  resumoFontesPorPais,
  type FonteCatalogo,
} from "@/lib/fontes-por-pais";

/**
 * Corte PAÍSES + superfície de lançamento (03/10/2026).
 *
 * "corte países execute todos que temos a bases nas fontes de pesquisas
 * genealogicas 5a" e "o lançamento será no Lovable e toda a base que rege
 * está lá no supabase dele e não no outro, pode mudar pra sempre".
 */

/* Espelho do catálogo medido no banco em 03/10 (23 fontes vivas). */
const CATALOGO: FonteCatalogo[] = [
  { pais_eixo: "Itália", url_canonica: "https://antenati.cultura.gov.it/" },
  { pais_eixo: "Itália", url_canonica: null },
  { pais_eixo: "Portugal", url_canonica: "https://digitarq.arquivos.pt/" },
  { pais_eixo: "Portugal", url_canonica: null },
  { pais_eixo: "Espanha", url_canonica: "https://pares.mcu.es/" },
  { pais_eixo: "Áustria", url_canonica: "https://www.oesta.gv.at/" },
  { pais_eixo: "Áustria", url_canonica: "https://data.matricula-online.eu/" },
  { pais_eixo: "Polônia", url_canonica: "https://www.szukajwarchiwach.gov.pl/" },
  { pais_eixo: "Croácia", url_canonica: "https://www.arhiv.hr/" },
  { pais_eixo: "Global", url_canonica: "https://www.familysearch.org/" },
  { pais_eixo: "Brasil", url_canonica: "https://www.gov.br/arquivonacional/" },
  { pais_eixo: "Croácia", url_canonica: null, archived_at: "2026-01-01" },
];

describe("Corte PAÍSES — base real por país, ausência declarada no resto", () => {
  const resumo = resumoFontesPorPais(PAISES_LINHA_PRIORITARIA, CATALOGO);

  it("não trata multipaís nem 'a definir' como país", () => {
    const valores = resumo.map((r) => r.valor);
    expect(valores).not.toContain("multipais");
    expect(valores).not.toContain("a_definir");
  });

  it("os países com base no 5A aparecem com base", () => {
    for (const pais of ["italia", "portugal", "espanha", "austria", "polonia", "croacia"]) {
      const r = resumo.find((x) => x.valor === pais)!;
      expect(r.estado, pais).toBe("com_base");
      expect(r.fontes, pais).toBeGreaterThan(0);
      expect(r.mensagem, pais).toBeNull();
    }
  });

  it("os países sem base dizem isso em vez de ficarem em silêncio", () => {
    /*
      Silêncio é pior que ausência declarada: a equipe escolhia o país, não
      achava fonte nenhuma e não sabia se era falta de cadastro, erro de
      filtro ou ausência real.
    */
    for (const pais of ["alemanha", "hungria", "luxemburgo", "romenia"]) {
      const r = resumo.find((x) => x.valor === pais)!;
      expect(r.estado, pais).toBe("em_preparacao");
      expect(r.fontes, pais).toBe(0);
      expect(r.mensagem, pais).toBe(FONTES_EM_PREPARACAO);
    }
  });

  it("fonte arquivada não conta como base", () => {
    const so = resumoFontesPorPais(PAISES_LINHA_PRIORITARIA, [
      { pais_eixo: "Croácia", url_canonica: null, archived_at: "2026-01-01" },
    ]);
    expect(so.find((x) => x.valor === "croacia")!.estado).toBe("em_preparacao");
  });

  it("eixo transversal (Global/Europa) não vira base própria de um país", () => {
    // Uma árvore colaborativa global não substitui o arquivo nacional.
    const so = resumoFontesPorPais(PAISES_LINHA_PRIORITARIA, [
      { pais_eixo: "Global", url_canonica: "https://www.familysearch.org/" },
    ]);
    expect(so.every((r) => r.estado === "em_preparacao")).toBe(true);
  });

  it("conta quantas fontes do país têm endereço próprio", () => {
    expect(resumo.find((r) => r.valor === "austria")!.comRota).toBe(2);
    // Itália tem 2 fontes, mas só 1 é um site: a outra é categoria
    // ("comune, arquivo distrital ou paróquia aplicável"), sem endereço único.
    expect(resumo.find((r) => r.valor === "italia")!.comRota).toBe(1);
  });

  it("o texto de preparação não promete pesquisa nem parecer", () => {
    expect(FONTES_EM_PREPARACAO).toContain("análise interna");
    expect(FONTES_EM_PREPARACAO).toContain("backlog de ativação");
    expect(/garantia|elegibilidade|prazo|chance/i.test(FONTES_EM_PREPARACAO)).toBe(false);
  });

  it("país sem eixo no catálogo não gera estado inventado", () => {
    expect(eixoDoPais("multipais")).toBeNull();
    expect(eixoDoPais("")).toBeNull();
  });
});

describe("Superfície de lançamento — Lovable, e o legado nunca rege", () => {
  it("a decisão está registrada em código, com o projeto e o banco certos", () => {
    expect(SUPERFICIE_DE_LANCAMENTO.plataforma).toBe("Lovable");
    expect(SUPERFICIE_DE_LANCAMENTO.supabaseRef).toBe(PROJETO_DECLARADO.ref);
    expect(SUPERFICIE_DE_LANCAMENTO.legado.supabaseRef).toBe(PROJETO_LEGADO.ref);
  });

  it("ambiente apontando para o projeto legado NÃO prevalece — nem a URL, nem a chave", () => {
    /*
      Medido em 03/10 no deploy legado: `SUPABASE_URL` vinha da integração
      antiga. Se o ambiente vencesse, o produto falaria com o banco errado.
      Aqui o declarado vence sempre.
    */
    const ambienteLegado = {
      SUPABASE_URL: `https://${PROJETO_LEGADO.ref}.supabase.co`,
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_de_outro_projeto",
    };
    expect(urlDoServidor(ambienteLegado)).toBe(PROJETO_DECLARADO.url);
    expect(chavePublicavelDoServidor(ambienteLegado)).toBe(PROJETO_DECLARADO.publishableKey);
  });

  it("ambiente vazio também resolve para o projeto declarado", () => {
    expect(urlDoServidor({})).toBe(PROJETO_DECLARADO.url);
    expect(chavePublicavelDoServidor({})).toBe(PROJETO_DECLARADO.publishableKey);
  });

  it("segredo de outro projeto é recusado com erro nomeado, não vira Invalid API key mudo", async () => {
    const src = await import("node:fs").then((fs) =>
      fs.readFileSync("src/integrations/supabase/client.server.ts", "utf8"),
    );
    expect(src).toContain("segredoServeAoProjeto(SUPABASE_SERVICE_ROLE_KEY, PROJETO_DECLARADO.ref) === false");
    expect(src).toContain("Invalid API key");
  });
});
