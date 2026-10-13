import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

import {
  ATALHOS_DESCOBERTA,
  ROTULOS_HUMANOS,
  ROTULO_PRIORIDADE,
  rotuloHumano,
} from "@/lib/descoberta-desk";
import { GRUPOS_DESK, SETORES_DESK_V5, setorDaRota } from "@/lib/navegacao-desk";
import { ORDEM_BLOCOS_PAINEL, validarOrdemPainel } from "@/lib/painel-ordem";

const shell = readFileSync("src/components/saas/shell.tsx", "utf8");
// A navegação passou a viver no registro canônico CA-UX-03.
const navegacao = readFileSync("src/lib/navegacao-desk.ts", "utf8");
const painel = readFileSync("src/components/painel/painel-dia.tsx", "utf8");

describe("nomenclatura humana", () => {
  it("mapeia rotas técnicas para rótulos humanos sem mudar a URL", () => {
    expect(rotuloHumano("/qualidade")).toBe("Radar & Matrizes");
    expect(rotuloHumano("/matriz-juridica")).toBe("Validação Jurídica");
    expect(ROTULO_PRIORIDADE).toBe("Prioridade dos casos");
    expect(Object.keys(ROTULOS_HUMANOS).every((r) => r.startsWith("/"))).toBe(true);
  });

  it("exibe os rótulos na navegação do Desk real", () => {
    /*
     * 04/10/2026 — decisão da Proprietária: "Retire todas as auditorias
     * repetidas do menu". O item passou de "Qualidade e auditoria" (rótulo da
     * prancha V4) para "Radar e matrizes", que é o que a rota realmente é. A
     * parte de qualidade/checklists continua dentro dela, recolhida.
     */
    expect(navegacao).toContain('{ to: "/qualidade", label: "Radar e matrizes" }');
    // V4: trilha jurídica virou alimento do caso e saiu do menu.
    expect(navegacao).toContain('"/matriz-juridica": "ALIMENTO_CONTEXTUAL"');
  });

  it("mantém os cabeçalhos das telas alinhados ao rótulo humano", () => {
    expect(readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8")).toContain(
      'titulo="Radar & Matrizes"',
    );
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
  ]);

  it("aponta apenas para rotas existentes, sem duplicar", () => {
    const rotas = ATALHOS_DESCOBERTA.map((a) => a.rota);
    expect(new Set(rotas).size).toBe(rotas.length);
    for (const r of rotas) expect(rotasExistentes.has(r)).toBe(true);
  });

  it("cobre exatamente os seis módulos operacionais, sem referência histórica", () => {
    expect(ATALHOS_DESCOBERTA).toHaveLength(6);
    expect(ATALHOS_DESCOBERTA.some((a) => a.rotulo.toLowerCase().includes("mockup"))).toBe(false);
  });

  it("é descoberta pura: nenhum atalho carrega ação, mutação ou status", () => {
    for (const a of ATALHOS_DESCOBERTA) {
      expect(Object.keys(a).sort()).toEqual(["onde", "rota", "rotulo"]);
    }
    expect(painel).toContain('data-painel-bloco="descoberta"');
    expect(painel).not.toContain("ATALHOS_DESCOBERTA.map((a) => a.acao");
  });

  it("o atalho aponta para a aba dona da função, não para o nome antigo do grupo", () => {
    expect(ATALHOS_DESCOBERTA.find((a) => a.rota === "/qualidade")?.onde).toBe("Configuração");
    expect(ATALHOS_DESCOBERTA.find((a) => a.rota === "/matriz-juridica")?.onde).toBeDefined();
    expect(ATALHOS_DESCOBERTA.find((a) => a.rota === "/qualidade")?.onde).toBe(
      "Configuração",
    );
    expect(ATALHOS_DESCOBERTA.find((a) => a.rota === "/integracoes")?.onde).toBe(
      "Configuração",
    );
    expect(painel).toContain('to: "/calls"');
    expect(painel).toContain("Mesa de Discovery");
  });

  it("mantém o bloco no fim da ordem canônica, sem quebrar exceções → sinais", () => {
    const chaves = ORDEM_BLOCOS_PAINEL.map((b) => b.chave);
    expect(chaves[chaves.length - 1]).toBe("descoberta");
    expect(validarOrdemPainel(chaves)).toEqual([]);
  });
});

describe("superfícies preservadas", () => {
  it("mantém os 6 grupos na navegação do Desk", () => {
    const grupos = [
      "Hoje",
      "Comercial",
      "Casos",
      "Pessoas & Famílias",
      "Pesquisa",
      "Marketing",
      "Configuração",
    ];
    for (const g of grupos) expect(navegacao).toContain(`label: "${g}"`);

    /*
      06/10/2026 — este teste exigia a string "GRUPOS_DESK" dentro do shell.
      O commit do Lovable "Construiu layout e 6 grupos do desk" trouxe uma
      SEGUNDA lista de setores escrita dentro de `shell.tsx` (rótulos de
      02/10), e a string literal não pegou isso: o shell deixou de ler a
      fonte única e o teste continuaria verde se eu só reimportasse o nome.

      Então a asserção passou a ser a propriedade que importa, não a string:
      o shell lê navegação de `@/lib/navegacao-desk` e não declara lista
      própria de setor/grupo. A lista que a Proprietária viu hoje foi
      preservada em `SETORES_DESK_V5` (lá, com a divergência V4 × V5
      declarada por escrito) — decisão de primeiro nível é dela, não minha.
    */
    expect(shell).toContain('from "@/lib/navegacao-desk"');
    expect(shell).toContain("SETORES_DESK_V5");
    expect(shell).not.toMatch(/const\s+(SETORES_DESK|GRUPOS_DESK)\s*(:[^=]*)?=\s*\[/);
  });

  /*
   * 13/10/2026 — a Proprietária decidiu a divergência V4 × V5: a lateral
   * passa a ter os 7 ecossistemas canônicos + Governança & Configuração, e
   * as rotas concorrentes ficam só na seção recolhida "Governança / Legado".
   */
  it("a lateral tem os 7 ecossistemas canônicos + Governança, e o legado fica recolhido", () => {
    expect(GRUPOS_DESK).toHaveLength(7);
    expect(SETORES_DESK_V5.map((s) => s.label)).toEqual([
      "Hoje",
      "Comercial",
      "Casos",
      "Pessoas & Famílias",
      "Pesquisa",
      "Marketing",
      "Formalização & Financeiro",
      "Governança & Configuração",
    ]);
    const abas = SETORES_DESK_V5.flatMap((s) => s.abas.map((a) => a.to));
    for (const r of ["/crm-mestre", "/conversao", "/ops", "/ops-excecoes", "/tarefas", "/proximas-acoes", "/microentregas", "/metricas"]) {
      expect(abas, r).not.toContain(r);
      expect(setorDaRota(r)?.id, r).toBe("governanca");
    }
    expect(navegacao).toContain("DIVERGÊNCIA RESOLVIDA em 13/10/2026");
    expect(shell).toContain("MENU_LEGADO_DESK");
    // Rota→setor resolve inclusive página contextual fora do menu.
    expect(setorDaRota("/casos/abc-123")?.id).toBe("casos");
    expect(setorDaRota("/contrato-parametros/xyz")?.id).toBe("contratos");
    expect(setorDaRota("/rota-que-nao-existe")).toBeUndefined();
  });

  it("o protótipo antigo saiu do runtime; o mockup aprovado volta como referência (CA-UX-04, revisto 05/09/2026)", () => {
    expect(existsSync("src/components/desk-app.tsx")).toBe(false);
    expect(existsSync("src/components/cliente-app.tsx")).toBe(false);
    expect(existsSync("src/routes/prototipo.tsx")).toBe(false);
    expect(existsSync("src/routes/_authenticated/referencia-mockup-desk.tsx")).toBe(false);
    // Rota de referencia visual do mockup aprovado, isolada e sem dados.
    // Corte D (09/09/2026): movida para dentro de _authenticated — a rota
    // vivia fora de qualquer guard e era alcançável por visitante sem login.
    expect(existsSync("src/routes/_authenticated/mockup.tsx")).toBe(false);
    expect(existsSync("archive/mockups/rotas/mockup-authenticated.tsx")).toBe(true);
    expect(existsSync("archive/mockups/componentes/desk-app.tsx")).toBe(true);
    expect(existsSync("archive/mockups/rotas/prototipo.tsx")).toBe(true);
  });

  it("a rota / é vitrine institucional limpa, sem mockup nem rótulos internos", () => {
    const raiz = readFileSync("src/routes/index.tsx", "utf8");
    for (const proibido of [
      "referencia-mockup-desk",
      "DeskApp",
      "ClienteApp",
      "AppSwitcher",
      "Módulos internos",
    ]) {
      expect(raiz).not.toContain(proibido);
    }
  });

  it("nenhum registro de navegação cita o protótipo antigo de 14 abas", () => {
    expect(navegacao).not.toContain("protótipo");
    expect(navegacao).not.toContain("Protótipo");
    expect(navegacao).not.toContain("14 abas");
  });
});
