import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

// CA-CORTE-ALERTAS-ROTA-CANONICA (09/09/2026): a rota Alertas usa a fonte já
// existente (case_alerts, via listarAlertas), sem tabela ou escritor novo.
const alertasFn = readFileSync("src/lib/alertas.functions.ts", "utf8");
const rota = readFileSync("src/routes/_authenticated/alertas.tsx", "utf8");
const painel = readFileSync("src/components/painel/painel-dia.tsx", "utf8");
const canonico = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");
const navegacao = readFileSync("src/lib/navegacao-desk.ts", "utf8");

describe("CA-CORTE-ALERTAS-ROTA-CANONICA", () => {
  it("a rota /alertas existe, autenticada, e está na navegação", () => {
    expect(existsSync("src/routes/_authenticated/alertas.tsx")).toBe(true);
    expect(navegacao).toContain('{ to: "/alertas", label: "Alertas" }');
  });

  it("lê apenas a fonte já existente (case_alerts) — nenhuma tabela nova", () => {
    expect(alertasFn).toContain('.from("case_alerts")');
    expect(alertasFn).not.toMatch(/create table|alertas_v2|case_alerts_v2/i);
  });

  it("Painel Hoje e a rota Alertas chamam a mesma função de leitura", () => {
    expect(painel).toContain('import { listarAlertas } from "@/lib/alertas.functions"');
    // A rota também importa a leitura central (listarAlertasCentrais) — mesma fonte.
    expect(rota).toMatch(/import \{[^}]*\blistarAlertas\b[^}]*\} from "@\/lib\/alertas\.functions"/);
    expect(rota).toMatch(/type LinhaAlerta/);
  });

  it("Painel Hoje pede só o subconjunto pendente e limitado; a rota Alertas não força status nem limite", () => {
    const painelChamada = painel.match(/carregar\(\{ data: \{ ([^}]*) \} \}\)/)?.[1] ?? "";
    expect(painelChamada).toContain('status: "pending"');
    expect(painelChamada).toContain("limite: 5");

    // A rota completa manda o filtro escolhido pelo usuário (pode ser vazio = tudo).
    expect(rota).toContain("status: status || undefined");
    expect(rota).not.toMatch(/carregar\(\{\s*data:\s*\{\s*status:\s*"pending"/);
  });

  it("reconhecer e reprogramar reusam o mesmo escritor (atualizarAlerta) — nenhum escritor novo", () => {
    expect(rota).toContain('import { atualizarAlerta } from "@/lib/caso-canonico.functions"');
    // Um único update em case_alerts no writer canônico.
    const updates = canonico.match(/\.from\("case_alerts"\)\.update/g) ?? [];
    expect(canonico).toMatch(/dueAt\?: string \| null/);
    expect(updates.length).toBeGreaterThan(0);
  });

  it("abrir tarefa a partir de um alerta reusa salvarTarefa (mesmo escritor já deduplicado)", () => {
    expect(rota).toContain('import { salvarTarefa } from "@/lib/ops.functions"');
    // A lista já resolve a tarefa aberta existente por caso antes de oferecer criar uma nova.
    expect(alertasFn).toContain("tarefaExistente");
    expect(rota).toContain("a.tarefaExistente");
  });

  it("a leitura é sempre filtrada por organização — sem exposição entre organizações", () => {
    expect(alertasFn).toContain('.eq("organization_id", organizationId)');
    // As duas leituras auxiliares (casos e tarefas) também filtram por organização.
    const filtros = alertasFn.match(/\.eq\("organization_id", organizationId\)/g) ?? [];
    expect(filtros.length).toBeGreaterThanOrEqual(3);
  });

  it("nenhuma ação proibida pela missão aparece na rota (WhatsApp, e-mail, publicar, RLS)", () => {
    for (const proibido of ["enviarWhatsapp", "enviarEmail", "publicarProjecaoApp", "disable row level security", "service_role"]) {
      expect(rota).not.toContain(proibido);
      expect(alertasFn).not.toContain(proibido);
    }
  });
});
