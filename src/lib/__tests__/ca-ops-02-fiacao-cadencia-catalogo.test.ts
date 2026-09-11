import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  ACAO_PERMITIDA,
  AUDITORIA_MODULOS_ALERTA,
  DUPLICIDADE_CATALOGOS_TEMPLATE,
  INTEGRACAO_CADENCIA_PAINEL,
  MAPA_ALERTA_TEMPLATE,
  contextoSeguro,
  resolverModeloVigente,
  tipoAlertaDeTexto,
  type ModeloCatalogo,
} from "@/lib/fiacao-cadencia-catalogo";
import { MODULOS_DESK } from "@/lib/desk-modulos";

const modelos: ModeloCatalogo[] = [
  { id: "t1", key: "reengajamento_10d", nome: "Reengajamento", status: "vigente", versao: 2 },
  { id: "t2", key: "atualizacao_andamento", nome: "Atualização de andamento", status: "rascunho" },
  {
    id: "t3",
    key: "reengajamento_antigo",
    nome: "Reengajamento antigo",
    status: "arquivado",
    arquivado: true,
  },
];

describe("CA-OPS-02 — resolução de modelo por alerta", () => {
  it("1. alerta de /ops resolve template vigente aplicável", () => {
    const r = resolverModeloVigente("sem_touchpoint_10d", modelos);
    expect(r.modelo?.id).toBe("t1");
    expect(r.mensagem).toBeNull();
    expect(r.acaoPermitida).toBe(ACAO_PERMITIDA);
  });

  it("2. ausência de template vigente não cria nada", () => {
    const r = resolverModeloVigente("sem_atualizacao_14d", modelos);
    expect(r.modelo).toBeNull();
    expect(r.mensagem).toBe("Não há modelo vigente para este alerta.");
    expect(modelos).toHaveLength(3);
  });

  it("3/4. resolução e contexto nunca enviam nem persistem", () => {
    const r = resolverModeloVigente("caso_bloqueado", modelos);
    expect(r.envioExecutado).toBe(false);
    expect(r.persistido).toBe(false);
    expect(r.usoRegistrado).toBe(false);
    const ctx = contextoSeguro("caso_bloqueado", { caseId: "c1", codigo: "CA-1" });
    expect(ctx?.persistido).toBe(false);
    expect(ctx?.envioExecutado).toBe(false);
    expect(ctx?.caseId).toBe("c1");
  });

  it("modelo demo nunca é sugerido", () => {
    const r = resolverModeloVigente("sem_touchpoint_10d", [
      { id: "d", key: "reengajamento_demo", nome: "Demo", status: "vigente", demo: true },
    ]);
    expect(r.modelo).toBeNull();
  });

  it("títulos internos de cadência mapeiam para o tipo canônico", () => {
    expect(tipoAlertaDeTexto("10 dias sem touchpoint registrado")).toBe("sem_touchpoint_10d");
    expect(tipoAlertaDeTexto("14 dias sem atualização contextualizada")).toBe(
      "sem_atualizacao_14d",
    );
    expect(tipoAlertaDeTexto("Primeira microentrega não planejada até D7")).toBe(
      "sem_microentrega_planejada",
    );
    expect(tipoAlertaDeTexto("texto sem correspondência")).toBeNull();
  });

  it("todo alerta mapeado declara gate e variáveis permitidas", () => {
    for (const m of MAPA_ALERTA_TEMPLATE) {
      expect(m.gate).toBeTruthy();
      expect(m.variaveisPermitidas.length).toBeGreaterThan(0);
    }
  });
});

describe("CA-OPS-02 — Painel Hoje e catálogo", () => {
  const painel = readFileSync("src/components/painel/painel-dia.tsx", "utf8");
  const ops = readFileSync("src/components/painel/painel-onboarding-jornada.tsx", "utf8");
  const biblioteca = readFileSync("src/routes/_authenticated/biblioteca-mensagens.tsx", "utf8");

  it("5. Painel Hoje usa somente atalho para /ops, sem recálculo de cadência", () => {
    expect(INTEGRACAO_CADENCIA_PAINEL.estado).toBe("BLOQUEADO");
    expect(INTEGRACAO_CADENCIA_PAINEL.criaTarefa).toBe(false);
    expect(INTEGRACAO_CADENCIA_PAINEL.criaContagemParalela).toBe(false);
    expect(painel).toContain("Ver cadência e onboarding em risco");
    expect(painel).not.toContain("avaliarCadencia");
  });

  it("6. sinais não duplicam GATILHOS existentes", () => {
    expect(painel).toContain("import { GATILHOS");
    // Os grupos saíram da grade do Hoje: cada um abre a aba dona uma única vez.
    expect(painel.match(/<SinaisPorGrupo/g)?.length ?? 0).toBe(0);
    expect(painel.match(/GRUPOS_INDICADOR\.map/g)?.length ?? 0).toBe(1);
    const comp = readFileSync("src/components/painel/sinais-por-grupo.tsx", "utf8");
    expect(comp.match(/grupos\.map/g)?.length ?? 0).toBe(1);
  });

  it("7. atalho abre o objeto canônico com case_id real", () => {
    expect(ops).toContain('to="/biblioteca-mensagens"');
    expect(ops).toContain("caso: c.case_id");
    expect(ops).not.toMatch(/registrarUso|enviar|fila/i);
  });

  it("3/4. abrir o modelo não registra uso nem cria rascunho", () => {
    const bloco = biblioteca.slice(
      biblioteca.indexOf('data-fiacao="alerta-cadencia"'),
      biblioteca.indexOf("<OrquestracaoContextual"),
    );
    expect(bloco).not.toMatch(/registrarUso|mutate|insert/);
    expect(bloco).toContain("Nenhuma");
  });

  it("8. duplicidade de catálogos está documentada", () => {
    expect(DUPLICIDADE_CATALOGOS_TEMPLATE.mesmaFonte).toBe(false);
    // CA-OPS-03 resolveu a duplicidade: precedência fixada, sem pendência humana.
    expect(DUPLICIDADE_CATALOGOS_TEMPLATE.decisaoHumanaPendente).toBe(false);
    const doc = readFileSync(
      "docs/operacao/CA-OPS-02_Fiacao_Cadencia_Mensagens_Alertas.md",
      "utf8",
    );
    expect(doc).toContain("Duplicidade de catálogos");
  });

  it("9. desk-modulos não declara rota inexistente", () => {
    const rotas = [
      "/achados/$caseId",
      "/ops",
      "/evidencias",
      "/tarefas",
      "/matriz-juridica",
      "/biblioteca-mensagens",
    ];
    for (const m of MODULOS_DESK) {
      if (m.estadoReal === "conectado") {
        expect(rotas.some((r) => m.destino.includes(r))).toBe(true);
      }
      if (m.estadoReal && m.estadoReal !== "conectado") {
        expect(m.destino).toMatch(/Sem rota|Sem fonte|Apontador histórico/);
      }
    }
    const semSuperficie = MODULOS_DESK.find((m) => m.id === "ale-rascunhos");
    expect(semSuperficie?.estadoReal).toBe("catalogado, sem superfície implementada");
  });

  it("catálogo de alertas cobre os sete módulos", () => {
    expect(AUDITORIA_MODULOS_ALERTA).toHaveLength(7);
    for (const m of AUDITORIA_MODULOS_ALERTA) {
      if (!m.rotaReal) expect(m.estado).not.toBe("conectado");
    }
  });

  it("10. superfícies de alerta e preview são internas (rota autenticada)", () => {
    expect(biblioteca).toContain('createFileRoute("/_authenticated/biblioteca-mensagens")');
    for (const arquivo of [
      "src/routes/portal/route.tsx",
      "src/routes/portal/index.tsx",
      "src/routes/portal/mensagens.$id.tsx",
    ]) {
      const portal = readFileSync(arquivo, "utf8");
      expect(portal).not.toContain("fiacao-cadencia-catalogo");
      expect(portal).not.toContain("biblioteca-mensagens");
      expect(portal).not.toContain("Abrir modelo sugerido");
    }
  });
});
