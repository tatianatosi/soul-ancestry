import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { GRUPOS_DESK, MENU_CONTA, rotasDoMenu } from "@/lib/navegacao-desk";
import {
  CLASSIFICACAO_SUPERFICIES,
  KPIS_TRANSVERSAIS,
  ROTAS_ACAO_KPI,
  contextoDosKpis,
  daFilaDe,
  kpisDaAba,
  valorDoKpi,
} from "@/lib/kpis-transversais";
import { comercialHoje, hojeISO } from "@/lib/painel-dia";
import type { Fila } from "@/lib/crm-desk";

describe("Entrega 1 — classificação das superfícies", () => {
  it("tem os nove KPIs e não inventa aba sétima", () => {
    expect(KPIS_TRANSVERSAIS).toHaveLength(9);
    expect(new Set(KPIS_TRANSVERSAIS.map((k) => k.id)).size).toBe(9);
  });

  it("dicionário, legado e DEMO não competem nas abas operacionais", () => {
    const menuOperacional = new Set(
      GRUPOS_DESK.filter((g) => g.id !== "governanca")
        .flatMap((g) => g.sub)
        .filter((s) => "to" in s)
        .map((s) => s.to),
    );
    for (const s of CLASSIFICACAO_SUPERFICIES) {
      if (s.natureza === "DICIONARIO_ADMIN" || s.natureza === "LEGADO" || s.natureza === "DEMO_LOCAL") {
        expect(menuOperacional.has(s.rota)).toBe(false);
      }
    }
    expect(MENU_CONTA.itens.some((s) => "to" in s && s.to === "/app-cliente-demo")).toBe(true);
  });

  it("toda rota classificada como visível no fluxo diário tem link de menu", () => {
    const menu = new Set(rotasDoMenu());
    for (const s of CLASSIFICACAO_SUPERFICIES.filter((x) => x.visivelNoFluxoDiario)) {
      expect(menu.has(s.rota), s.rota).toBe(true);
    }
  });

  it("toda rota do menu tem uma classificação e uma aba dona", () => {
    const classificadas = new Set(CLASSIFICACAO_SUPERFICIES.map((s) => s.rota));
    for (const rota of rotasDoMenu()) {
      expect(classificadas.has(rota), rota).toBe(true);
    }
    for (const s of CLASSIFICACAO_SUPERFICIES) {
      expect(s.abaProprietaria).toBeTruthy();
    }
  });

  it("as abas donas mostram a faixa de KPI, sem criar rota nova", () => {
    const arquivos = [
      "src/routes/_authenticated/leads.tsx",
      "src/routes/_authenticated/calls.tsx",
      "src/routes/_authenticated/casos.index.tsx",
      "src/routes/_authenticated/biblioteca.tsx",
      "src/routes/_authenticated/contratos.index.tsx",
    ];
    for (const arquivo of arquivos) {
      expect(readFileSync(arquivo, "utf8")).toContain("FaixaKpisVivos");
    }
    expect(readFileSync("src/routes/_authenticated/casos.index.tsx", "utf8")).not.toContain(
      'rotulo="Casos ativos"',
    );
  });
});

describe("Entrega 2 — nove KPIs com fonte, cobertura e drill-down", () => {
  it("cada KPI declara fonte, aba dona e rota de ação existente", () => {
    const menu = new Set(rotasDoMenu());
    for (const k of KPIS_TRANSVERSAIS) {
      expect(k.fonte.length).toBeGreaterThan(8);
      expect(k.rotaAcao.startsWith("/")).toBe(true);
      expect(menu.has(k.rotaAcao), k.rotaAcao).toBe(true);
      expect(k.apareceEm.includes("hoje")).toBe(true);
    }
  });

  it("KPI sem fila no Painel devolve SEM_DADO_SUFICIENTE, nunca zero fabricado", () => {
    const ctx = { daFila: () => 0, semResponsavel: 0 };
    const marco = KPIS_TRANSVERSAIS.find((k) => k.id === "proximo_marco")!;
    const entrega = KPIS_TRANSVERSAIS.find((k) => k.id === "entrega_revisao")!;
    const conteudo = KPIS_TRANSVERSAIS.find((k) => k.id === "conteudo_atraso")!;
    expect(valorDoKpi(marco, ctx).total).toBeNull();
    expect(valorDoKpi(entrega, ctx).total).toBeNull();
    expect(valorDoKpi(conteudo, ctx).total).toBeNull();
    expect(valorDoKpi(marco, ctx).destino).toBe("/casos");
    expect(valorDoKpi(conteudo, ctx).destino).toBe("/biblioteca-mensagens");
    for (const k of KPIS_TRANSVERSAIS) {
      expect(ROTAS_ACAO_KPI).toContain(k.rotaAcao);
    }
  });

  it("Hoje resume os nove; Comercial resume Lead/Discovery e conteúdo", () => {
    expect(kpisDaAba("hoje")).toHaveLength(9);
    const comercial = kpisDaAba("comercial").map((k) => k.id);
    expect(comercial).toContain("lead_discovery_parado");
    expect(comercial).toContain("conteudo_atraso");
    expect(kpisDaAba("casos").map((k) => k.id)).toEqual(
      expect.arrayContaining(["acao_vencida_sem_dono", "bloqueio_ativo", "proximo_marco"]),
    );
    expect(kpisDaAba("pesquisa").map((k) => k.id)).toContain("lacuna_probatoria");
    expect(kpisDaAba("contratos").map((k) => k.id)).toEqual(
      expect.arrayContaining(["formalizacao_pendente", "financeiro_sem_confirmacao"]),
    );
  });
});

const fila = (chave: string, itens: Fila["itens"]): Fila =>
  ({ chave, rotulo: chave, criticidade: 1, itens }) as Fila;

describe("Entrega 3 — o mesmo fato em Comercial e Hoje, sem duplicar registro", () => {
  it("lead sem próxima ação aparece no KPI e some quando a ação é gravada", () => {
    const hoje = hojeISO();
    const parado: Fila[] = [
      fila("leads_sem_proxima_acao", [
        {
          id: "lead-ana",
          tipo: "lead",
          rotulo: "Ana Luiza",
          detalhe: "sem próxima ação",
          data: hoje,
          responsavel: "Tati",
          area: null,
          etapa: null,
        },
      ]),
      fila("discoveries_sem_desdobramento", []),
    ];
    const kpi = KPIS_TRANSVERSAIS.find((k) => k.id === "lead_discovery_parado")!;
    const antes = valorDoKpi(kpi, {
      daFila: (c) => daFilaDe(parado, c),
      semResponsavel: 0,
    });
    expect(antes.total).toBe(1);
    expect(antes.destino).toBe("/calls");
    const comercial = comercialHoje(parado, { hoje });
    expect(comercial.semDisciplina.some((i) => i.id === "lead-ana")).toBe(true);

    const depoisFilas: Fila[] = [
      fila("leads_sem_proxima_acao", []),
      fila("discoveries_sem_desdobramento", []),
    ];
    const depois = valorDoKpi(kpi, {
      daFila: (c) => daFilaDe(depoisFilas, c),
      semResponsavel: 0,
    });
    expect(depois.total).toBe(0);
    expect(comercialHoje(depoisFilas, { hoje }).semDisciplina).toHaveLength(0);
  });

  it("pedido documental vencido conta em lacuna e em bloqueio, no mesmo caso, sem segunda pendência", () => {
    const hoje = hojeISO();
    const filas: Fila[] = [
      fila("casos_pendencia_documental", [
        {
          id: "caso-ana",
          tipo: "caso",
          rotulo: "CA-ANA",
          detalhe: "certidão aguardada",
          data: hoje,
          responsavel: "Pesquisa",
          area: null,
          etapa: null,
        },
      ]),
      fila("contratos_enviados_pendentes", []),
      fila("pagamentos_aguardados", []),
      fila("onboardings_pendentes", []),
    ];
    const ctx = { daFila: (c: string) => daFilaDe(filas, c), semResponsavel: 0 };
    const lacuna = valorDoKpi(KPIS_TRANSVERSAIS.find((k) => k.id === "lacuna_probatoria")!, ctx);
    const bloqueio = valorDoKpi(KPIS_TRANSVERSAIS.find((k) => k.id === "bloqueio_ativo")!, ctx);
    expect(lacuna.total).toBe(1);
    expect(lacuna.destino).toBe("/evidencias");
    expect(bloqueio.total).toBe(1);
    expect(bloqueio.destino).toBe("/ops-excecoes");
  });

  it("dado DEMO não entra na contagem do KPI", () => {
    const filas: Fila[] = [
      fila("leads_sem_proxima_acao", [
        {
          id: "lead-demo",
          tipo: "lead",
          rotulo: "Lead DEMO",
          detalhe: "sem próxima ação",
          data: hojeISO(),
          responsavel: "Tati",
          area: null,
          etapa: null,
        },
      ]),
      fila("discoveries_sem_desdobramento", []),
    ];
    const kpi = KPIS_TRANSVERSAIS.find((k) => k.id === "lead_discovery_parado")!;
    expect(valorDoKpi(kpi, contextoDosKpis(filas, false)).total).toBe(0);
    expect(valorDoKpi(kpi, contextoDosKpis(filas, true)).total).toBe(1);
  });
});
