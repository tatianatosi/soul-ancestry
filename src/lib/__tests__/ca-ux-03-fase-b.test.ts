import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  contarLeadsAguardandoAcao,
  fraseComercialHoje,
  ROTA_DETALHE_COMERCIAL,
} from "@/lib/comercial-hoje-canonico";
import {
  AVISO_VISAO_HISTORICA,
  INDICADORES_CANONICOS,
  PAINEIS_HISTORICOS,
  ROTA_PAINEL_CANONICO,
  TETO_METRICAS_PRINCIPAIS,
  contagensPermitidas,
  ehPainelHistorico,
  indicadoresComContagemConcorrente,
  respeitaTetoMetricas,
  somenteEtiqueta,
} from "@/lib/fontes-canonicas-indicadores";

const ler = (p: string) => readFileSync(p, "utf8");

describe("CA-UX-03 Fase B — Painel Hoje como fila diária única", () => {
  const painel = ler("src/components/painel/painel-dia.tsx");

  it("mantém os cinco blocos operacionais aprovados", () => {
    // Varre todos os componentes do painel, não só painel-dia.tsx: um bloco
    // declarado em componente filho também ocupa superfície na tela.
    const dir = "src/components/painel";
    const fontes = readdirSync(dir)
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => ler(`${dir}/${f}`))
      .join("\n");
    const blocos = new Set([...fontes.matchAll(/data-painel-bloco="([a-z_]+)"/g)].map((m) => m[1]));

    // Os cinco blocos do CA-UX-02 §6.
    for (const b of ["fila_priorizada", "excecoes", "comercial", "prazos", "descoberta"]) {
      expect(blocos.has(b)).toBe(true);
    }

    // Nenhuma superfície nova além dos cinco e dos auxiliares de leitura
    // aprovados: métricas de decisão, caso em destaque, sinais de atenção e
    // jornada dos casos.
    //
    // 26/08/2026 — "jornada" entrou por decisão da Proprietária ("não quero
    // listas e sim jornada dentro do sistema"). É auxiliar de leitura, não um
    // sexto bloco de trabalho: `fila: false` em ORDEM_BLOCOS_PAINEL, não gera
    // linha por registro e não disputa a fila diária. Diz onde a carteira
    // está; quem diz o que fazer hoje continua sendo "Minha fila priorizada".
    const permitidos = [
      "cards",
      "destaque",
      "jornada",
      "fila_priorizada",
      "excecoes",
      "sinais",
      "alertas",
      "comercial",
      "prazos",
      "descoberta",
    ];
    for (const b of blocos) expect(permitidos).toContain(b);

    // Decisão da Proprietária (25/08): "Atalhos" foi fundido em
    // "Encontrar no Desk" e não volta como bloco próprio.
    expect(blocos.has("atalhos")).toBe(false);
  });

  it("é a única superfície que conta a fila do dia", () => {
    expect(contagensPermitidas(ROTA_PAINEL_CANONICO)).toContain("Vencidos e vence hoje");
    expect(somenteEtiqueta("Vencidos e vence hoje", "/metricas")).toBe(true);
  });

  it("nenhum indicador tem duas origens de contagem concorrentes", () => {
    expect(indicadoresComContagemConcorrente()).toEqual([]);
  });
});

describe("CA-UX-03 Fase B — painéis legados", () => {
  it("estão registrados como históricos e substituídos pelo Painel Hoje", () => {
    expect(PAINEIS_HISTORICOS).toHaveLength(2);
    for (const p of PAINEIS_HISTORICOS) {
      expect(p.substituidoPor).toBe(ROTA_PAINEL_CANONICO);
      expect(ehPainelHistorico(p.rotaHistorica)).toBe(true);
      expect(existsSync(p.componente)).toBe(true);
    }
  });

  // 08/09/2026 — as duas rotas históricas foram arquivadas no git. Elas se
  // declaravam legado ("preservado apenas para consulta interna", "sem uso
  // diário") e mostravam o mesmo dia de trabalho que o PainelDia de /painel.
  // Manter tela morta alcançável só somava mais um lugar para olhar. O aviso e a
  // faixa continuam existindo para qualquer visão histórica futura.
  it("a faixa histórica segue apontando para o painel canônico, sem redirect", () => {
    const faixa = ler("src/components/painel/faixa-historica.tsx");
    expect(faixa).toContain("AVISO_VISAO_HISTORICA");
    expect(faixa).toContain('to="/painel"');
    expect(faixa).not.toMatch(/redirect|navigate\(/);
    expect(AVISO_VISAO_HISTORICA).toBe("Visão histórica — use Painel Hoje para execução diária.");
  });

  it("as rotas de painel legado não existem mais", () => {
    for (const arquivo of [
      "src/routes/_authenticated/historico.painel-hoje.tsx",
      "src/routes/_authenticated/historico.painel-desk-hoje.tsx",
    ]) {
      expect(existsSync(arquivo)).toBe(false);
    }
  });

  it("/painel não oferece mais atalho para painel legado", () => {
    const painel = ler("src/routes/_authenticated/painel.tsx");
    expect(painel).not.toContain('to="/historico/painel-hoje"');
    expect(painel).not.toContain('to="/historico/painel-desk-hoje"');
  });

  it("ficam fora de menus, atalhos e descoberta", () => {
    const nav = ler("src/lib/navegacao-desk.ts");
    const shell = ler("src/components/saas/shell.tsx");
    for (const p of PAINEIS_HISTORICOS) {
      expect(nav).not.toContain(p.rotaHistorica);
      expect(shell).not.toContain(p.rotaHistorica);
    }
  });

  it("cliente não acessa: nenhuma rota de painel legado exposta", () => {
    // Antes este teste exigia que os arquivos existissem sob _authenticated.
    // Com as rotas arquivadas, a garantia passa a ser mais forte: elas não
    // existem em lugar nenhum de src/routes, autenticado ou não.
    for (const p of PAINEIS_HISTORICOS) {
      const sufixo = `${p.rotaHistorica.replace("/historico/", "historico.")}.tsx`;
      expect(existsSync(`src/routes/_authenticated/${sufixo}`)).toBe(false);
      expect(existsSync(`src/routes/${sufixo}`)).toBe(false);
    }
  });
});

describe("CA-UX-03 Fase B — métricas", () => {
  const metricas = ler("src/routes/_authenticated/metricas.tsx");

  it("respeita o teto de cinco métricas principais", () => {
    const bloco = metricas
      .split('data-metricas="principais"')[1]!
      .split('data-metricas="link-conversao"')[0]!;
    const cartoes = [...bloco.matchAll(/<Cartao titulo=/g)].length;
    expect(cartoes).toBe(TETO_METRICAS_PRINCIPAIS);
    expect(respeitaTetoMetricas(cartoes)).toBe(true);
  });

  it("tem seção Histórico e análise fechada por padrão", () => {
    expect(metricas).toContain('data-metricas="historico"');
    expect(metricas).toContain("Histórico e análise");
    expect(metricas).not.toMatch(/<details[^>]*open/);
  });

  it("não concorre com funil de conversão nem higiene comercial", () => {
    expect(metricas).not.toContain('<Cartao titulo="Funil de conversão"');
    expect(metricas).not.toContain('<Cartao titulo="Higiene comercial"');
    expect(metricas).toContain("Conversão e saúde comercial — ver no Comercial");
    expect(metricas).toContain('to="/conversao"');
  });

  it("/conversao é o detalhe canônico de funil e higiene", () => {
    for (const nome of ["Funil comercial", "Higiene comercial"]) {
      const i = INDICADORES_CANONICOS.find((x) => x.indicador === nome)!;
      expect(i.contagemEm).toEqual(["/conversao"]);
      expect(i.etiquetaEm).toContain("/metricas");
    }
    expect(existsSync("src/routes/_authenticated/conversao.tsx")).toBe(true);
    const conversao = ler("src/routes/_authenticated/conversao.tsx");
    expect(conversao).toContain("Fonte canônica de conversão e saúde comercial");
    expect(conversao).toContain("montarFunil");
    expect(conversao).toContain("montarSaude");
  });
});

describe("CA-UX-03 Fase B — resumo comercial e financeiro no Painel Hoje", () => {
  const painel = ler("src/components/painel/painel-dia.tsx");

  it("conta leads aguardando ação sem repetir registro", () => {
    const total = contarLeadsAguardandoAcao({
      calls: [{ id: "a", tipo: "lead" }],
      propostas: [
        { id: "a", tipo: "lead" },
        { id: "b", tipo: "lead" },
      ],
      semDisciplina: [{ id: "c", tipo: "lead" }],
    });
    expect(total).toBe(3);
    expect(fraseComercialHoje(3)).toBe("Comercial hoje: 3 leads aguardando ação");
    expect(fraseComercialHoje(1)).toBe("Comercial hoje: 1 lead aguardando ação");
    expect(ROTA_DETALHE_COMERCIAL).toBe("/conversao");
  });

  it("exibe um único resumo comercial, com clique para /conversao", () => {
    expect([...painel.matchAll(/data-painel-resumo="comercial"/g)]).toHaveLength(1);
    expect(painel).toContain("fraseComercialHoje(");
    expect(painel).not.toContain('{ rotulo: "Propostas sem follow-up"');
  });

  it("preserva resumo financeiro com detalhe em /financeiro", () => {
    expect(painel).toContain('data-painel-resumo="financeiro"');
    expect(painel).toContain('to="/financeiro"');
  });
});

describe("CA-UX-03 Fase B — prioridade e artefatos", () => {
  it("prioridade: divergência de entradas registrada, sem alteração de cálculo", () => {
    const consumidores = [
      "src/components/painel/painel-dia.tsx",
      "src/routes/_authenticated/casos.index.tsx",
    ];
    for (const c of consumidores) {
      expect(ler(c)).toContain('from "@/lib/prioridade-matriz"');
    }
    const doc = ler("docs/ux/CA-UX-03_Fontes_Canonicas_Indicadores.md");
    expect(doc).toContain("DIVERGÊNCIA DE PRIORIDADE — DECISÃO HUMANA NECESSÁRIA");
    expect(doc).toContain("Radar Interno / Qualidade");
    // Radar Interno/Qualidade não consome a matriz: divergência confirmada.
    expect(ler("src/components/qualidade/painel.tsx")).not.toContain("prioridade-matriz");
    // Nenhum cálculo alterado.
    expect(ler("src/lib/prioridade-matriz.ts")).toContain("matriz-elegibilidade-urgencia-v1.0");
  });

  it("artefatos obrigatórios existem", () => {
    for (const f of [
      "docs/ux/CA-UX-03_Fontes_Canonicas_Indicadores.md",
      "docs/ux/fase-a-auditoria-metricas-desk.md",
      "docs/changelog/2026-08-23_CA-UX-03_Fase-B.md",
    ]) {
      expect(existsSync(f)).toBe(true);
    }
    expect(ler("docs/ux/fase-a-auditoria-metricas-desk.md")).toContain(
      "Fase B — Implementação e resultado",
    );
  });
});
