import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * §11 e §26 do De-Para: a contagem do Hoje tem de ser CLICÁVEL e
 * reconciliada com a lista de origem. Número que não abre nada é painel
 * decorativo.
 *
 * Correção de rumo registrada aqui: no corte anterior marquei
 * "Microentregas para revisão" como "Não registrado" por concluir que o
 * vocabulário não tinha estado de revisão. Estava errado —
 * `/golive/microentregas` já publica "Aguardando revisão" com fonte e
 * fórmula declaradas ("Itens ainda não concluídos"). O número existe; era
 * eu que não tinha achado. Agora sai da mesma função canônica.
 */

const painel = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");

describe("toda contagem com regra abre sua origem", () => {
  it("cadências vencidas e casos sem próxima ação abrem /golive", () => {
    // /golive publica exatamente "Vencidas" e "Sem próxima ação" dos
    // mesmos kpis — abrir ali reconcilia, não leva a lista parecida.
    expect(painel).toContain('apoio: "pedem retomada", to: "/golive"');
    expect(painel).toContain('apoio: "precisam de decisão", to: "/golive"');
  });

  it("microentregas abre a fila de microentregas", () => {
    expect(painel).toContain('to: "/golive/microentregas"');
  });

  it("o card vira link quando há destino", () => {
    expect(painel).toContain("k.to ? (");
    expect(painel).toContain("<Link key={k.rotulo} to={k.to}");
  });
});

describe("microentregas para revisão passou a ter número real", () => {
  it("usa a função canônica, não um critério reimplementado", () => {
    expect(painel).toContain('import { concluida } from "@/lib/golive-microentregas"');
    expect(painel).toContain("caso.microentregas.filter((m) => !concluida(m)).length");
  });

  it("não é mais 'Não registrado'", () => {
    expect(painel).toContain("valor: microentregasAguardandoRevisao");
    expect(painel).not.toContain('rotulo: "Microentregas para revisão", valor: null');
  });
});

describe("decisões do dia passou a ter fonte", () => {
  /*
    Segunda correção de rumo no mesmo painel, pelo mesmo motivo da primeira:
    eu tinha declarado "sem regra publicada". A regra existia —
    `filaDeAprovacoes` já classificava achado, proposta e contrato em
    pendente/pronto, e /golive/aprovacoes já a usava. O que faltava era a
    Visão Geral chamar a mesma função em vez de inventar a própria conta.
  */
  it("usa a mesma função pura da tela de aprovações", () => {
    expect(painel).toContain('from "@/lib/golive-aprovacoes"');
    expect(painel).toContain("filaDeAprovacoes({");
    expect(painel).toContain("resumoAprovacoes(filaDecisoes).pendentes");
  });

  it("a contagem abre a fila de onde ela sai", () => {
    expect(painel).toContain("valor: decisoesDoDia");
    expect(painel).toContain('to: "/golive/aprovacoes"');
    expect(painel).not.toContain('rotulo: "Decisões do dia", valor: null');
  });

  it("o card Decisões prioritárias lista o que compõe o número", () => {
    // §11 linha 3: cada linha abre contexto e ação possível. A lista sai do
    // MESMO array que gera a contagem — reconciliação por construção.
    expect(painel).toContain('titulo="Decisões prioritárias"');
    expect(painel).toContain('filaDecisoes.filter((i) => i.situacao === "pendente")');
    expect(painel).toContain("decisoesPendentes.slice(0, 6)");
    expect(painel).toContain("ROTULO_DECISAO[item.acao]");
  });

  it("nenhuma ação é renomeada para caber num exemplo do De-Para", () => {
    // "Liberar pesquisa" é liberação externa e "Confirmar documento mínimo"
    // é o gate de documentos — nenhuma das duas está nesta fila. Rotular
    // `aprovar_achado` como "Liberar pesquisa" fingiria cobertura.
    expect(painel).toContain('aprovar_achado: "Aprovar achado"');
    expect(painel).not.toContain('aprovar_achado: "Liberar pesquisa"');
    expect(painel).not.toContain('enviar_revisao: "Rever proposta"');
  });

  it("fila vazia diz que está vazia, em vez de sumir", () => {
    expect(painel).toContain("Nenhuma decisão pendente de achado, proposta ou contrato");
  });
});
