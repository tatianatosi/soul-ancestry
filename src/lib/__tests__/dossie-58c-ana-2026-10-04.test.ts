import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  ACOES_PLANO,
  acaoDoItem,
  BLOCOS_58C,
  CANAIS_PLANO,
  CHECKLIST_58C,
  DE_PARA_CAMPOS_CHECKLIST,
  DE_PARA_STATUS_DOCUMENTO,
  MARCA_CHECKLIST_58C,
  estadoInicialDespesa,
  itensComAcao,
  itensDoBloco,
  itensSemAcaoDeTerceiro,
  tituloInstancia,
  totalDeInstancias,
} from "@/lib/dossie-58c";

/**
 * Proprietária, 04/10/2026: "pode seguir executar pela tabela de rotas, leia e
 * execute o dossiê da Ana e junto do histórico completo da Ana... anexei também
 * o skill que foi criado para trazer e montar o dossiê de cada cliente".
 *
 * Medido antes de executar, e ela está certa: o caso dela tinha 6 pendências de
 * pesquisa, todas `resolved`, e **nenhuma** linha dos quatro BLOCOS do
 * checklist §58c. O material foi enviado três vezes e nunca teve destino.
 *
 * O template é código porque é a trilha §58c — serve ao próximo cliente. As
 * instâncias são dado do caso. Nome de ascendente, data e localidade NÃO entram
 * no código: vêm de `research_people`.
 */

describe("o template §58c cobre os quatro BLOCOS do documento", () => {
  it("são quatro blocos, com os títulos do documento", () => {
    expect(BLOCOS_58C.map((b) => b.numero)).toEqual([1, 2, 3, 4]);
    expect(BLOCOS_58C[0]!.titulo).toContain("requerente");
    expect(BLOCOS_58C[1]!.titulo).toContain("ascendente perseguido");
    expect(BLOCOS_58C[2]!.titulo).toContain("perseguição");
    expect(BLOCOS_58C[3]!.titulo).toContain("descendência");
  });

  it("cada bloco tem itens, e cada item tem seção, categoria e severidade reais", () => {
    const categorias = [
      "identity",
      "relationship",
      "event",
      "source",
      "document",
      "conflict",
      "authorization",
      "external_gate",
      "review",
      "other",
    ];
    const severidades = ["critical", "high", "medium", "low"];
    for (const b of BLOCOS_58C) {
      expect(itensDoBloco(b.numero).length).toBeGreaterThan(0);
    }
    for (const i of CHECKLIST_58C) {
      expect(i.secao.length).toBeGreaterThan(3);
      expect(categorias).toContain(i.categoria);
      expect(severidades).toContain(i.severidade);
    }
  });

  it("todo id é único e o título da instância carrega a marca §58c", () => {
    const ids = CHECKLIST_58C.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    const t = tituloInstancia(CHECKLIST_58C[0]!, "Ana Luiza Gomes Silveira Rodrigues");
    expect(t.startsWith(MARCA_CHECKLIST_58C)).toBe(true);
    expect(t).toContain("·");
    expect(tituloInstancia(CHECKLIST_58C[0]!, null)).not.toContain("·");
    expect(tituloInstancia(CHECKLIST_58C[0]!, "   ")).not.toContain("·");
  });

  it("o eixo crítico da não naturalização brasileira está no template", () => {
    const item = CHECKLIST_58C.find((i) => i.id === "3.4.certidao_naturalizacao")!;
    expect(item.severidade).toBe("critical");
    expect(item.observacao).toContain("23/07/1938");
  });

  it("representação de menor é crítica e diz que o menor não assina", () => {
    const item = CHECKLIST_58C.find((i) => i.id === "1.2.representacao")!;
    expect(item.severidade).toBe("critical");
    expect(item.observacao).toContain("não assina");
  });
});

describe("o template não guarda dado da Ana", () => {
  const fonte = readFileSync("src/lib/dossie-58c.ts", "utf8");

  it("nenhum nome da família aparece no código do template", () => {
    for (const nome of [
      "Ana Luiza",
      "Adair",
      "Alice",
      "Felipe",
      "Friedmann",
      "Reimer",
      "Silveira",
      "Cleusa",
      "Lotte",
      "Otto",
      "Rudolf",
      "Heinrich",
    ]) {
      expect(fonte).not.toContain(nome);
    }
  });

  it("nenhuma localidade nem ano de ascendente aparece no template", () => {
    for (const dado of ["Graz", "Iglau", "Boskowitz", "Stefansrueh", "1895", "1873"]) {
      expect(fonte).not.toContain(dado);
    }
  });

  /*
   * Consequência da regra acima: o arquivo da localidade do ascendente não pode
   * ser instituição do template — depende de qual é a localidade. Nesses itens
   * a instituição é por caso, e o semeador declara a lacuna.
   */
  it("itens de localidade do ascendente têm instituição por caso, não fixa", () => {
    for (const id of [
      "2.3.localidade_nascimento",
      "2.3.localidade_pertenca",
      "2.3.localidade_residencia",
      "2.3.localidade_casamento",
      "2.3.localidade_filiacao",
    ]) {
      const item = CHECKLIST_58C.find((i) => i.id === id)!;
      expect(acaoDoItem(item)!.instituicao).toBeNull();
    }
  });

  it("nenhuma URL no template — fonte é texto, nunca endereço ao cliente", () => {
    expect(fonte).not.toContain("http");
  });
});

describe("a contagem de instâncias é derivada da composição, não fixa", () => {
  it("muda com o número de adultos, dependentes e elos", () => {
    const base = totalDeInstancias({ adultos: 3, dependentes: 1, elos: 10 });
    expect(base).toBeGreaterThan(CHECKLIST_58C.length);
    expect(totalDeInstancias({ adultos: 1, dependentes: 0, elos: 10 })).toBeLessThan(base);
    expect(totalDeInstancias({ adultos: 3, dependentes: 1, elos: 20 })).toBeGreaterThan(base);
  });

  it("composição vazia ainda devolve os itens de caso e de ascendentes", () => {
    const vazio = totalDeInstancias({ adultos: 0, dependentes: 0, elos: 0 });
    const soCasoEAscendentes = CHECKLIST_58C.filter(
      (i) => i.alcance === "caso" || i.alcance === "ascendentes_prioritarios",
    ).length;
    expect(vazio).toBe(soCasoEAscendentes);
  });

  it("a composição da Ana (3 adultos, 1 dependente, 10 pessoas) dá as 97 instâncias semeadas", () => {
    expect(totalDeInstancias({ adultos: 3, dependentes: 1, elos: 10 })).toBe(97);
  });
});

describe("os oito campos do checklist têm destino, e nenhum é cópia", () => {
  it("os oito campos que a Proprietária exige por item estão mapeados", () => {
    const campos = DE_PARA_CAMPOS_CHECKLIST.map((d) => d.campo);
    expect(campos).toEqual([
      "status",
      "responsável",
      "data de solicitação",
      "fonte",
      "custo estimado",
      "aprovação de despesa",
      "arquivo/link",
      "conclusão probatória",
    ]);
  });

  /*
   * Corrigido em 04/10/2026: eu havia mandado o custo para o catálogo de
   * fontes. O dono por item é `research_action_plan_items`; o catálogo segue
   * como referência de preço da fonte, não como destino do custo do item.
   */
  it("nenhum campo é copiado, e o custo mora no item de ação", () => {
    for (const d of DE_PARA_CAMPOS_CHECKLIST) {
      expect(d.copia).toBe(false);
      expect(d.destino.length).toBeGreaterThan(10);
      expect(d.nota.length).toBeGreaterThan(20);
    }
    const custo = DE_PARA_CAMPOS_CHECKLIST.find((d) => d.campo === "custo estimado")!;
    expect(custo.destino).toContain("research_action_plan_items");
    expect(custo.nota).toContain("catálogo de fontes é referência de preço");
  });

  it("conclusão probatória nunca mora no item de checklist", () => {
    const c = DE_PARA_CAMPOS_CHECKLIST.find((d) => d.campo === "conclusão probatória")!;
    expect(c.destino).toContain("research_evidence_items");
    expect(c.nota).toContain("nunca conclui prova");
  });

  it("os nove status do documento mapeiam para o CHECK real, sem valor novo", () => {
    const permitidos = ["open", "in_progress", "blocked", "resolved", "not_applicable", "archived"];
    expect(Object.keys(DE_PARA_STATUS_DOCUMENTO)).toHaveLength(9);
    for (const v of Object.values(DE_PARA_STATUS_DOCUMENTO)) expect(permitidos).toContain(v);
  });
});

describe("o leitor e o semeador ficaram ligados — nada de peça órfã", () => {
  const fn = readFileSync("src/lib/dossie-58c.functions.ts", "utf8");

  it("o painel está montado em Caso 360, na seção Pesquisa", () => {
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    expect(rota).toContain("<DossieConsolidado caseId={id} />");
  });

  it("o painel chama o leitor e o semeador", () => {
    const painel = readFileSync("src/components/caso/dossie-consolidado.tsx", "utf8");
    expect(painel).toContain("dossieConsolidadoDoCaso");
    expect(painel).toContain("semearChecklist58cNoCaso");
  });

  it("o semeador é idempotente por título e exige motivo", () => {
    expect(fn).toContain("jaGravados");
    expect(fn).toContain("Informe o motivo da semeadura");
    expect(fn).toContain("inserirComVerificacao");
  });

  it("o semeador nunca altera item existente: só insere", () => {
    expect(fn).not.toContain('.from("research_pending_items").update');
    expect(fn).not.toMatch(/update\(\{[^}]*status: "resolved"/);
  });

  it("nada aqui consulta fonte externa, solicita documento ou publica ao cliente", () => {
    for (const proibido of [
      'from("research_document_requests")',
      'from("app_projections")',
      'from("client_deliverables")',
      "fetch(",
    ]) {
      expect(fn).not.toContain(proibido);
    }
  });

  it("todo item nasce aberto — semear não conclui nada", () => {
    expect(fn).toContain('status: "open"');
    expect(fn).not.toContain('status: "resolved"');
  });
});

/**
 * Corte C (04/10/2026) — correção contra o que eu mesmo entreguei.
 *
 * Eu havia dito que "custo estimado" e "aprovação de despesa" não tinham dono
 * por item e os mandei para o catálogo de fontes e para o gate. Tinham dono:
 * `research_action_plan_items` já carrega custo, moeda, aprovação de despesa,
 * pagador, prazo, canal, instituição e link de evidência — e a tabela estava
 * com **0 linhas** no caso dela. É isto que ela pediu com "adicione todos os
 * campos necessários, não somente renderizados".
 */
describe("todos os campos do item: custo, despesa, pagador, prazo, instituição", () => {
  it("o de-para aponta custo e aprovação de despesa para o plano de ação", () => {
    const custo = DE_PARA_CAMPOS_CHECKLIST.find((d) => d.campo === "custo estimado")!;
    expect(custo.destino).toContain("research_action_plan_items.estimated_cost_amount");
    expect(custo.nota).toContain("Custo é do item de ação");
    const despesa = DE_PARA_CAMPOS_CHECKLIST.find((d) => d.campo === "aprovação de despesa")!;
    expect(despesa.destino).toContain("expense_approval_status");
    expect(despesa.vocabulario).toContain("nao_submetida");
    expect(despesa.nota).toContain("nunca aprovada por omissão");
  });

  it("cada ação tem tipo, canal, prioridade e instituição do vocabulário real", () => {
    for (const { item, acao } of itensComAcao()) {
      expect(ACOES_PLANO).toContain(acao.tipo);
      expect(CANAIS_PLANO).toContain(acao.canal);
      expect(["critica", "alta", "media", "baixa"]).toContain(acao.prioridade);
      // O guard do plano recusa canal externo sem instituição: o template
      // precisa nomear uma, ou ser desk_only.
      if (acao.canal !== "desk_only" && !item.id.startsWith("2.3.")) {
        expect(acao.instituicao, `${item.id} sem instituição de referência`).toBeTruthy();
      }
    }
  });

  it("prioridade da ação acompanha a severidade do item", () => {
    const critico = itensComAcao().find((x) => x.item.severidade === "critical")!;
    expect(critico.acao.prioridade).toBe("critica");
    const baixo = itensComAcao().find((x) => x.item.severidade === "low");
    if (baixo) expect(baixo.acao.prioridade).toBe("baixa");
  });

  it("despesa nasce não submetida quando é esperada, e não aplicável quando não é", () => {
    const comDespesa = itensComAcao().find((x) => x.acao.despesaEsperada)!;
    expect(estadoInicialDespesa(comDespesa.acao)).toBe("nao_submetida");
    const semDespesa = itensComAcao().find((x) => !x.acao.despesaEsperada)!;
    expect(estadoInicialDespesa(semDespesa.acao)).toBe("nao_aplicavel");
  });

  it("conferência interna não gera ação de terceiro nem despesa", () => {
    const internos = itensSemAcaoDeTerceiro().map((i) => i.id);
    expect(internos).toContain("1.3.cadastro");
    expect(internos).toContain("1.1.passaporte");
    expect(itensComAcao().length + internos.length).toBe(CHECKLIST_58C.length);
  });

  it("o semeador cria a ação com custo e prazo em branco e exige instituição", () => {
    const fn = readFileSync("src/lib/dossie-58c.functions.ts", "utf8");
    expect(fn).toContain("research_action_plan_items");
    expect(fn).toContain("estimated_cost_amount: null");
    expect(fn).toContain("due_date: null");
    expect(fn).toContain('payer: "nao_definido"');
    expect(fn).toContain("institution_id: instituicaoId");
    expect(fn).toContain("não está cadastrada");
    // Nunca nasce aprovada.
    expect(fn).not.toContain('expense_approval_status: "aprovada"');
  });

  it("o painel mostra custo, despesa, pagador, prazo, responsável e arquivo por item", () => {
    const painel = readFileSync("src/components/caso/dossie-consolidado.tsx", "utf8");
    expect(painel).toContain("data-acoes-checklist");
    for (const rotulo of ["custo", "despesa", "pagador", "prazo", "responsável", "arquivo"]) {
      expect(painel).toContain(rotulo);
    }
    expect(painel).toContain("não estimado");
  });
});
