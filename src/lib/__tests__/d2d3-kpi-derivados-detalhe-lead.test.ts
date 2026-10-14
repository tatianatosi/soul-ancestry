import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * D2 (§12) e D3 (§13) — travas de comportamento canônico que ainda não
 * existiam. Implementação já publicada nos SHAs:
 *
 *   D2 pipeline (bloqueio + chip qualidade): `666eef36`
 *   D2 auditoria de leads (audit_logs):        `00dbfce4`
 *   D3 card com próximo passo:                  `666eef36`
 *   D3 "Nova tarefa" único ponto:               `82ffdaf9`
 *
 * Este teste trava dois gaps ainda não cobertos:
 *
 * §13 linha 2 — "Cada total deriva dos cards mostrados e dos filtros
 *               ativos". `kpisKanban` do Desk Operacional precisa contar
 *               sobre o mesmo array `tarefas` que alimenta as colunas,
 *               nunca sobre um agregado paralelo do servidor (`painel`).
 *
 * §12 zona 4 — "Detalhe de lead: Dados essenciais + interação recente +
 *               próxima ação; consentimento". A rota /leads precisa expor
 *               os 4 blocos canônicos: próxima ação, discovery/interação,
 *               resumo da call, consentimento — sem esconder atrás de
 *               tooltip nem substituir por texto genérico.
 */

const KANBAN = resolve(__dirname, "../../components/ops/desk-operacional.tsx");
const LEADS = resolve(__dirname, "../../routes/_authenticated/leads.tsx");

describe("D3 · §13 linha 2 — KPIs do Kanban derivam do array de cards visíveis", () => {
  const kanban = readFileSync(KANBAN, "utf8");

  it("kpisKanban é useMemo cuja dependência é `tarefas` (mesmo array das colunas)", () => {
    expect(kanban).toMatch(/const kpisKanban = useMemo\(/);
    expect(kanban).toMatch(/\}, \[tarefas\]\);/);
  });

  it("cada KPI é uma contagem sobre `tarefas` (total ou `.filter`), não sobre um agregado paralelo do servidor", () => {
    const trecho = kanban.slice(
      kanban.indexOf("const kpisKanban = useMemo("),
      kanban.indexOf("}, [tarefas]);"),
    );
    // Microentregas no ciclo = tarefas.length; as outras três passam por tarefas.filter(...)
    expect(trecho).toContain("valor: tarefas.length");
    const contagens = trecho.match(/tarefas\.filter\(/g) ?? [];
    expect(contagens.length).toBeGreaterThanOrEqual(3);
    // e nenhum KPI usa o agregado do servidor `p[...]` (que ignora filtro)
    expect(trecho).not.toMatch(/p\[".*?"\]/);
  });

  it("sétima rodada (14/10/2026, HOMOLOGAÇÃO FINAL) — os 4 rótulos renomeados aparecem, sem inventar KPI fora do CHECK", () => {
    // Prancha V4: Microentregas no ciclo / Em execução / Travadas-Bloqueadas /
    // Concluídas no mês substituem os rótulos anteriores (Pendente crítico/
    // SLA em risco/Atrasadas/Bloqueadas); todos mapeiam para `tarefas` e
    // `concluida_em` reais. A divergência de "Confirmar/Em revisão" (§29)
    // segue registrada no próprio arquivo — nenhum dos dois foi usado.
    expect(kanban).toMatch(/rotulo: "Microentregas no ciclo"/);
    expect(kanban).toMatch(/rotulo: "Em execução"/);
    expect(kanban).toMatch(/rotulo: "Travadas \/ Bloqueadas"/);
    expect(kanban).toMatch(/rotulo: "Concluídas no mês"/);
    expect(kanban).toMatch(/DIVERGÊNCIA REGISTRADA \(§29/);
    expect(kanban).not.toContain('rotulo: "Confirmar"');
    expect(kanban).not.toContain('rotulo: "Em revisão"');
  });
});

describe("D2 · §12 zona 4 — Detalhe do lead expõe 4 blocos canônicos", () => {
  const leads = readFileSync(LEADS, "utf8");

  it("Próxima ação: select de PROXIMAS_ACOES + data separada", () => {
    expect(leads).toMatch(/label="Próxima ação"/);
    expect(leads).toMatch(/opcoes=\{PROXIMAS_ACOES\}/);
    expect(leads).toMatch(/label="Data da próxima ação"/);
  });

  it("Discovery: R3 (23/09/2026) moveu a edição para /calls — /leads mostra resumo real e link", () => {
    // Achado do R3: /leads tinha o único writer de call_agendada_em/
    // discovery_resultado, mas nunca era a tela usada durante a call.
    // Mesmo padrão já usado para SPIN em 09/09/2026 — edição concentrada
    // em /calls, /leads vira leitura + link.
    expect(leads).not.toMatch(/onChange=\{set\("call_agendada_em"\)\}/);
    expect(leads).not.toMatch(/onChange=\{set\("discovery_resultado"\)\}/);
    expect(leads).toMatch(/rotulo\("discovery_resultado", editado\.discovery_resultado\)/);
    expect(leads).toMatch(/to="\/calls"/);
  });

  it("Resumo da call: edição concentrada em /calls (R3), /leads não duplica o writer", () => {
    expect(leads).not.toMatch(/onChange=\{set\("resumo_call"\)\}/);
  });

  it("Consentimento: status + data + canal + versão do aviso, todos editáveis", () => {
    expect(leads).toMatch(/valor=\{campo\("consentimento_status"\)\}/);
    expect(leads).toMatch(/valor=\{campo\("consentimento_canal"\)\}/);
    expect(leads).toMatch(/valor=\{campo\("consentimento_versao_aviso"\)\}/);
    expect(leads).toMatch(/consentimento_em/);
  });

  it("Consentimento não-concedido gera pendência visível (não silencia)", () => {
    expect(leads).toMatch(/consentimento ainda não consta como concedido/i);
  });
});
