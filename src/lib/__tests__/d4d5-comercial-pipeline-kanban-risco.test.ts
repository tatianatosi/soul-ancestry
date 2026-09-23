import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { etapaComercialDoLead } from "@/lib/golive-comercial";
import { STATUS_TAREFA, ROTULO_SLA } from "@/lib/ops.server";

const comercial = readFileSync("src/components/desk/superficies-kit-conectadas.tsx", "utf8");
const kanban = readFileSync("src/components/ops/desk-operacional.tsx", "utf8");
const golive = readFileSync("src/lib/golive.functions.ts", "utf8");

/* ------------------------------------------------- D4 · §12 Comercial */

describe("a etapa comercial tem uma definição só", () => {
  /*
    23/09/2026 — achado real, corrigido: `estagio` tem DEFAULT 'novo' no
    banco e não está entre os campos editáveis do Desk (CAMPOS_LEAD); só
    muda via a trilha de handoff ou escritores de piloto/integração.
    `eixo_comercial` é o campo que /leads e /calls realmente editam todo
    dia. A prioridade antiga (estagio primeiro) escondia a progressão real
    da equipe atrás do valor default — corrigida: eixo_comercial primeiro,
    estagio só como reserva quando o eixo estiver vazio.
  */
  it("vale o eixo comercial gravado; o estágio é reserva", () => {
    expect(etapaComercialDoLead({ estagio: "discovery", eixo_comercial: "lead" })).toBe("lead");
    expect(etapaComercialDoLead({ estagio: "discovery" })).toBe("discovery");
  });

  it("vazio e espaço em branco não viram etapa", () => {
    expect(etapaComercialDoLead({})).toBeNull();
    expect(etapaComercialDoLead({ estagio: "   ", eixo_comercial: "" })).toBeNull();
  });

  it("o normalizador do golive passou a usar a mesma função", () => {
    // Antes a regra vivia inline aqui e seria copiada para a segunda tela.
    expect(golive).toContain("etapaComercialDoLead(l as Record<string, unknown>)");
    expect(golive).not.toContain('etapa: (l["estagio"] as string) ?? (l["eixo_comercial"] as string)');
  });
});

describe("o pipeline do Comercial é de leads, não de casos", () => {
  it("as colunas saem de etapa comercial, não de fase do caso", () => {
    // 22/09/2026: `listaLeads` foi extraído como intermediário para
    // que o chip de qualidade e o pipeline compartilhem o mesmo array.
    expect(comercial).toMatch(/columns=\{colunasPorEtapaComercial\((listaLeads|leads\.data \?\? \[\])\)\}/);
    expect(comercial).not.toContain("columns={colunasPorFase(d)}");
  });

  it("o cartão traz os seis campos que §12 nomeia", () => {
    const fn = comercial.slice(
      comercial.indexOf("function colunasPorEtapaComercial"),
      comercial.indexOf("function colunasPorFase"),
    );
    for (const campo of ["nome", "origem", "responsavel_nome", "proxima_acao", "proxima_acao_em"]) {
      expect(fn, campo).toContain(campo);
    }
  });

  it("lead sem responsável ou sem próxima ação avisa em vez de omitir", () => {
    // §12 "Legado": cards de lead sem próxima ação/responsável não podem
    // passar silenciosamente. 22/09/2026: alerta agora prioriza bloqueio
    // real (discovery sem_aderencia, consentimento recusado) e cai para o
    // aviso de faltando quando não há bloqueio.
    expect(comercial).toContain('Sem ${faltando.join(" e ")}');
    expect(comercial).toContain('"Sem próxima ação registrada"');
    expect(comercial).toContain("Bloqueado:");
  });

  it("compartilha o cache de leads com o PainelCalls da mesma rota", () => {
    const calls = readFileSync("src/components/crm/painel-calls.tsx", "utf8");
    expect(calls).toContain('queryKey: ["leads-desk"]');
    expect(comercial).toContain('queryKey: ["leads-desk"]');
    expect(comercial).toContain("listarLeadsDesk");
  });

  it("erro de leitura de leads não é confundido com pipeline vazio", () => {
    expect(comercial).toContain("Isto é erro de leitura, não pipeline vazio");
  });

  it("a leitura de casos por fase não foi apagada, só saiu do Comercial", () => {
    expect(comercial).toContain("function colunasPorFase");
  });
});

/* ---------------------------------------------------- D5 · §13 Kanban */

describe("as cinco colunas de §13 já eram as certas", () => {
  it("o vocabulário real bate com a prancha, sem coluna 'aguardando'", () => {
    expect([...STATUS_TAREFA]).toEqual([
      "nao_iniciada",
      "em_andamento",
      "bloqueada",
      "concluida",
      "cancelada",
    ]);
    expect(STATUS_TAREFA).not.toContain("aguardando");
  });
});

describe("o cartão do kanban deixou de comunicar risco só por cor", () => {
  const cartao = kanban.slice(kanban.indexOf('{aba === "kanban" &&'), kanban.indexOf('{aba === "micro" &&'));

  it("SLA e prioridade aparecem como selo de texto", () => {
    expect(cartao).toContain("ROTULO_SLA[t[\"sla_status\"]]");
    expect(cartao).toContain("ROTULO_PRIORIDADE[t[\"prioridade\"]]");
    // O vocabulário de SLA que o selo mostra é o canônico, não um novo.
    expect(ROTULO_SLA["em_risco"]).toBe("SLA em risco");
    expect(ROTULO_SLA["atrasada"]).toBe("Atrasada");
  });

  it("bloqueio mostra o motivo no próprio cartão", () => {
    expect(cartao).toContain('t["status"] === "bloqueada" ? (');
    expect(cartao).toContain("motivo não registrado");
  });

  it("a borda colorida continua, como reforço e não como único sinal", () => {
    expect(cartao).toContain('t["sla_status"] === "atrasada" && "border-terracotta');
  });
});

describe("os KPIs do kanban derivam dos cards mostrados", () => {
  it("contam sobre o mesmo array das colunas, não sobre o agregado do servidor", () => {
    expect(kanban).toContain("const kpisKanban = useMemo(");
    expect(kanban).toContain("}, [tarefas]);");
    // O agregado do servidor (`p[...]`) é da aba Painel e não responde a filtro.
    const bloco = kanban.slice(kanban.indexOf("const kpisKanban"), kanban.indexOf("}, [tarefas]);"));
    expect(bloco).not.toContain('p["');
  });

  it("concluída e cancelada não contam como pendência em aberto", () => {
    expect(kanban).toContain('!["concluida", "cancelada"].includes(String(t["status"]))');
  });

  it("nenhum estado fora do CHECK foi inventado para caber na prancha", () => {
    // §13 nomeia "Confirmar" e "Em revisão"; nem tarefas nem microentregas
    // têm esses estados. A divergência fica registrada, não preenchida.
    expect(kanban).not.toContain('rotulo: "Em revisão"');
    expect(kanban).not.toContain('rotulo: "Confirmar"');
    expect(kanban).toContain("DIVERGÊNCIA REGISTRADA");
  });
});
