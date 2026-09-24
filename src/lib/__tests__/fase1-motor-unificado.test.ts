import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const ler = (p: string) => readFileSync(p, "utf8");

describe("Fase 1 — motor unificado (corte vertical, sem apagar peças)", () => {
  it("lista de casos abre pelo writer persistente e exige cliente/serviço", () => {
    const lista = ler("src/routes/_authenticated/casos.index.tsx");
    expect(lista).toContain("AbrirCasoMotor");
    expect(lista).toContain("obrigatorio: true");
    expect(ler("src/components/caso/abrir-caso-motor.tsx")).toContain("abrirCasoOperacional");
  });

  it("ficha do caso tem formulário de tarefa, planejador e não usa tipo caso", () => {
    const ficha = ler("src/routes/_authenticated/casos.$caseId.index.tsx");
    expect(ficha).toContain("FormularioTarefaCaso");
    expect(ficha).toContain("PlanejadorOperacional");
    // Radar Individual usa `posicionar({ tipo: "caso" })` (eixo do radar, não tipo de tarefa).
    expect(ficha.replace(/posicionar\(\{\s*tipo:\s*"caso"/g, "posicionar({")).not.toMatch(/tipo:\s*"caso"/);
    const form = ler("src/components/caso/formulario-tarefa-caso.tsx");
    expect(form).toContain("salvarTarefa");
    expect(form).toContain("responsavel_id");
    expect(form).toContain("motivo_bloqueio");
  });

  it("checklist exige caso e responsável; writer recusa tarefa órfã", () => {
    const tarefas = ler("src/routes/_authenticated/tarefas.tsx");
    expect(tarefas).toContain('chave: "caso_id"');
    expect(tarefas).toContain("obrigatorio: true");
    expect(tarefas).toContain('chave: "responsavel_id"');
    expect(ler("src/lib/ops.functions.ts")).toContain("Tarefa operacional exige caso vinculado.");
    expect(ler("src/lib/saas.functions.ts")).toContain("Tarefa operacional exige caso vinculado.");
  });

  it("Painel de Calls não saiu da face — rota e componente intactos", () => {
    expect(ler("src/routes/_authenticated/calls.tsx")).toContain("PainelCalls");
    expect(ler("src/lib/navegacao-desk.ts")).toContain('to: "/calls"');
    expect(ler("src/components/painel/painel-dia.tsx")).toContain('to="/calls"');
  });

  it("migration corretiva grava timeline e restringe portal sem DROP TABLE", () => {
    const sql = ler("supabase/migrations/20260910184500_timeline_operacional_e_rls_portal.sql");
    expect(sql).toContain("clube_ancestral_timeline_operacional");
    expect(sql).toContain("cte_select_portal");
    expect(sql).toContain("visibility = 'cliente_aprovado'");
    expect(sql).toContain("is_staff_ativo");
    expect(sql).not.toMatch(/^\s*DROP TABLE/im);
    expect(sql).not.toContain("eh_equipe_interna");
  });

  it("escritor de app grava timeline mesmo antes da migration ser aplicada", () => {
    expect(ler("src/lib/abrir-caso-operacional.functions.ts")).toContain("registrarTimelineCaso");
    expect(ler("src/lib/ops.functions.ts")).toContain("registrarTimelineCaso");
    expect(ler("src/lib/saas.functions.ts")).toContain("registrarTimelineCaso");
    expect(ler("src/lib/timeline-operacional.server.ts")).toContain('visibility: "interno"');
  });
});
