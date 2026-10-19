import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  ENTIDADES_HIPOTETICAS_NAO_CRIAR,
  ENTIDADES_MOTOR,
  MOTORES_TABELAS,
  NIVEIS_PROXIMA_ACAO,
  obterProximaAcaoCanonica,
  projetarProximaAcaoCliente,
  rpcVazaParaCliente,
  sinaisDoCasoPortal,
} from "@/lib/motor-caso";
import { GRUPOS_DESK } from "@/lib/navegacao-desk";

describe("grafo do motor unificado", () => {
  it("nomeia as 6 entidades distintas e aponta só para tabelas reais", () => {
    expect(ENTIDADES_MOTOR.map((e) => e.conceito)).toEqual([
      "Pessoa",
      "Núcleo",
      "Lead",
      "Caso",
      "Pesquisa",
      "Contrato",
    ]);
    expect(ENTIDADES_MOTOR.find((e) => e.conceito === "Caso")?.tabelas).toEqual(["crm_casos"]);
    expect(ENTIDADES_MOTOR.find((e) => e.conceito === "Núcleo")?.tabelas).toContain("nucleo_membros");
  });

  it("recusa os nomes hipotéticos de prompts antigos", () => {
    expect(ENTIDADES_HIPOTETICAS_NAO_CRIAR).toEqual([
      "case_participants",
      "citizenship_cases",
      "onboarding_runs",
      "cadence_runs",
    ]);
    const motor = readFileSync("src/lib/motor-caso.ts", "utf8");
    expect(motor).not.toMatch(/from ["']@\/lib\/case.participants/);
  });

  it("P0–P11 apontam só para tabelas reais e recusam engines paralelos", () => {
    expect(MOTORES_TABELAS.map((m) => m.motor).length).toBe(12);
    expect(MOTORES_TABELAS.map((m) => m.id)).toEqual([
      "P0",
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "P8",
      "P9",
      "P10",
      "P11",
    ]);
    const p3 = MOTORES_TABELAS.find((m) => m.motor.startsWith("P3"));
    expect(p3?.tabelas).toContain("tarefas");
    expect(p3?.naoCriar).toContain("cadence_runs");
    const p4 = MOTORES_TABELAS.find((m) => m.motor.startsWith("P4"));
    expect(p4?.tabelas).toContain("onboarding_planos");
    expect(p4?.naoCriar).toContain("onboarding_runs");
    const p7 = MOTORES_TABELAS.find((m) => m.motor.startsWith("P7"));
    expect(p7?.tabelas).toContain("product_catalog");
    expect(p7?.tabelas).toContain("citizenship_tracks");
  });

  it("reusa obterProximaAcaoCanonica — não inventa segunda RPC", () => {
    const c = obterProximaAcaoCanonica({
      caseId: "caso-1",
      rpc: {
        nivel: NIVEIS_PROXIMA_ACAO.tarefaVencida,
        motivo: "Tarefa vencida: enviar checklist",
        origem_tabela: "tarefas",
        origem_id: "t1",
        prazo: "2026-09-01",
      },
    });
    expect(c.acao).toBe("Tarefa vencida: enviar checklist");
    expect(c.origem).toBe("automatica");
  });
});

describe("projeção autorizada no App Cliente (mesma ordem da RPC)", () => {
  it("documento pendente (nível 4) vence pagamento (nível 6)", () => {
    const p = projetarProximaAcaoCliente({
      documentosPendentes: 2,
      pagamentoPendente: true,
      pendenciaClientePendente: false,
      casoAtivo: true,
      casoEncerrado: false,
      casoPausado: false,
    });
    expect(p.nivelEquivalente).toBe(4);
    expect(p.destino).toBe("/portal/documentos");
    expect(p.acao).toMatch(/2 documentos/);
  });

  it("pagamento só aparece quando não há documento pendente", () => {
    const p = projetarProximaAcaoCliente({
      documentosPendentes: 0,
      pagamentoPendente: true,
      pendenciaClientePendente: false,
      casoAtivo: true,
      casoEncerrado: false,
      casoPausado: false,
    });
    expect(p.nivelEquivalente).toBe(6);
    expect(p.destino).toBe("/portal/conta");
  });

  it("não vaza título de tarefa interna nem gate", () => {
    expect(rpcVazaParaCliente("Tarefa vencida: homologar SKU")).toBe(true);
    expect(rpcVazaParaCliente("Núcleo familiar não conferido")).toBe(false);
    const cliente = projetarProximaAcaoCliente(
      sinaisDoCasoPortal({
        status: "ativo",
        ativo: true,
        documentosPendentes: 0,
        pagamentoPendente: false,
      pendenciaClientePendente: false,
      }),
    );
    expect(cliente.acao).not.toMatch(/tarefa|gate|SKU|CRM/i);
    expect(cliente.destino).toBe("/portal/jornada");
  });

  it("encerrado e pausado são estados explícitos, nunca 'sem informação'", () => {
    expect(
      projetarProximaAcaoCliente({
        documentosPendentes: 0,
        pagamentoPendente: false,
      pendenciaClientePendente: false,
        casoAtivo: false,
        casoEncerrado: true,
        casoPausado: false,
      }).acao,
    ).toMatch(/encerrado/i);
    expect(
      projetarProximaAcaoCliente({
        documentosPendentes: 1,
        pagamentoPendente: false,
      pendenciaClientePendente: false,
        casoAtivo: false,
        casoEncerrado: false,
        casoPausado: true,
      }).acao,
    ).toMatch(/pausado/i);
  });
});

describe("premissas que o motor não pode desfazer", () => {
  it("Desk continua com 6 grupos; Inteligência hospeda a Biblioteca Mestre", () => {
    expect(GRUPOS_DESK).toHaveLength(8); // 18/10/2026: 7 grupos V4 + Financeiro
    expect(GRUPOS_DESK[4]?.id).toBe("pesquisa");
    expect(GRUPOS_DESK[2]?.label).toMatch(/Casos/i);
  });

  it("escritor da RPC e consumidores Desk seguem no lugar (sem motor paralelo)", () => {
    const sql = readFileSync("supabase/migrations/20260905130000_proxima_acao_prioritaria_caso.sql", "utf8");
    expect(sql).toContain("proxima_acao_prioritaria");
    const ficha = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    const lista = readFileSync("src/routes/_authenticated/casos.index.tsx", "utf8");
    const painel = readFileSync("src/lib/crm-desk.ts", "utf8");
    for (const arq of [ficha, lista, painel]) {
      expect(arq).toContain("obterProximaAcaoCanonica");
    }
  });

  it("App Cliente (Home e detalhe) consome a projeção, não a RPC cru", () => {
    const portalFn = readFileSync("src/lib/portal-cliente.functions.ts", "utf8");
    const home = readFileSync("src/routes/portal/index.tsx", "utf8");
    const detalhe = readFileSync("src/components/portal/caso-detalhe.tsx", "utf8");
    expect(portalFn).toContain("projetarProximaAcaoCliente");
    expect(portalFn).not.toContain('rpc("proxima_acao_prioritaria');
    expect(home).toContain("proximoPasso");
    expect(detalhe).toContain("proximoPasso");
  });

  it("Jornada consome a mesma projeção do motor, com cadência só como fallback", () => {
    const jornada = readFileSync("src/routes/portal/jornada.tsx", "utf8");
    const vivo = readFileSync("src/lib/portal-dados-vivos.ts", "utf8");
    const fn = readFileSync("src/lib/portal-dados-vivos.functions.ts", "utf8");
    expect(jornada).toContain("jornadaSanitizada(vivo.projecoes, new Date(), vivo.proximaAcao)");
    expect(vivo).toContain("proximaDoMotor");
    expect(fn).toContain("projetarProximaAcaoCliente");
  });
});
