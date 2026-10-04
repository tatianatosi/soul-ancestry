import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  CAMPOS_FORA_DO_CANVA,
  DE_PARA_CANVA_PARAMETRO,
  ORIGEM_CANVA,
  STATUS_CANVA,
  aPreencher,
  camposNaoLocalizadosReais,
  divergencias,
  falsosNaoLocalizados,
  planoDePreenchimento,
  valoresDoCanva,
  type PaginaCanva,
} from "@/lib/canva-para-parametros";

/**
 * Proprietária, 04/10/2026: "o Canva já está autorizado na proposta para o
 * dossiê, execute tudo do dossiê e checklist da Ana, adicione todos os campos
 * necessários, não somente renderizados".
 *
 * Medido antes de executar: as 7 páginas do caso dela estão `extraida` e
 * carregam o texto de serviços excluídos (p3) e despesas externas (p7), e os
 * dois parâmetros correspondentes estavam **vazios** — serviços excluídos era a
 * única pendência impeditiva de conteúdo do contrato. Nada escrevia o conteúdo
 * do deck nos parâmetros: `escopo-proposta.ts` só agregava para conferência.
 *
 * Além disso, `campos_nao_localizados` marcava como não localizado exatamente
 * campos cujo texto está na própria linha.
 */

const PAGINAS: PaginaCanva[] = [
  { page_number: 3, extracao_status: "extraida", page_content_structured: { servicos_incluidos: "Diagnóstico · Pesquisa", servicos_excluidos: "Certidões, traduções e apostilas fora dos honorários." }, campos_nao_localizados: ["servicos_incluidos", "servicos_excluidos"] },
  { page_number: 5, extracao_status: "extraida", page_content_structured: { entregas_jornada: "1. Diagnóstico · 2. Pendências" }, campos_nao_localizados: ["entregas_jornada"] },
  { page_number: 6, extracao_status: "extraida", page_content_structured: { valor_total: "R$ 9.600", forma_pagamento: "3 assinaturas mensais", parcelas: "10x de R$ 320" } },
  { page_number: 7, extracao_status: "extraida", page_content_structured: { despesas_externas: "Toda despesa é comunicada e aprovada." }, campos_nao_localizados: ["despesas_externas", "proximos_passos"] },
  { page_number: 8, extracao_status: "pendente", page_content_structured: { servicos_excluidos: "rascunho não extraído" } },
];

describe("o de-para só cobre o que o deck realmente traz", () => {
  it("cada linha tem campo, grupo real e pelo menos uma chave", () => {
    const grupos = ["partes", "membros", "objeto", "servicos", "comerciais", "assinatura"];
    for (const l of DE_PARA_CANVA_PARAMETRO) {
      expect(grupos).toContain(l.grupo);
      expect(l.chaves.length).toBeGreaterThan(0);
      expect(l.paginas.length).toBeGreaterThan(0);
    }
  });

  it("os campos que o deck não traz estão declarados com motivo", () => {
    const campos = CAMPOS_FORA_DO_CANVA.map((c) => c.campo);
    expect(campos).toContain("produto_sku");
    expect(campos).toContain("prazos_referencia");
    expect(campos).toContain("data_assinatura");
    for (const c of CAMPOS_FORA_DO_CANVA) expect(c.motivo.length).toBeGreaterThan(30);
    // Nenhum deles aparece no de-para: não há destino fingido.
    for (const c of campos) expect(DE_PARA_CANVA_PARAMETRO.find((l) => l.campo === c)).toBeUndefined();
  });

  it("página não extraída nunca entra como fonte", () => {
    const valores = valoresDoCanva(PAGINAS);
    const excluidos = valores.find((v) => v.campo === "servicos_excluidos")!;
    expect(excluidos.pagina).toBe(3);
    expect(excluidos.valor).not.toContain("rascunho");
  });
});

describe("o plano preenche só campo vazio e nunca sobrescreve", () => {
  const ATUAIS = [
    { campo: "servicos_excluidos", valor: null, status: "vazio", origem: null },
    { campo: "despesas_externas", valor: "", status: "vazio", origem: null },
    { campo: "servicos_incluidos", valor: "Diagnóstico · Pesquisa", status: "validado", origem: "proposta" },
    { campo: "fases_entregas", valor: "Outra coisa", status: "validado", origem: "planejador" },
    { campo: "valor_total", valor: "9600", status: "importado_a_confirmar", origem: "preenchimento_humano" },
  ];

  const plano = planoDePreenchimento(PAGINAS, ATUAIS);

  it("campo vazio com conteúdo no deck entra como preencher, citando a página", () => {
    const preencher = aPreencher(plano).map((i) => i.campo);
    expect(preencher).toContain("servicos_excluidos");
    expect(preencher).toContain("despesas_externas");
    const item = plano.find((i) => i.campo === "servicos_excluidos")!;
    expect(item.pagina).toBe(3);
    expect(item.motivo).toContain("página 3");
    expect(item.motivo).toContain(STATUS_CANVA);
  });

  it("campo com o mesmo texto do deck não é regravado", () => {
    expect(plano.find((i) => i.campo === "servicos_incluidos")!.acao).toBe("ja_igual");
  });

  it("campo preenchido e diferente vira divergência, e o validado diz que está validado", () => {
    const div = divergencias(plano).map((i) => i.campo);
    expect(div).toContain("fases_entregas");
    expect(div).toContain("valor_total");
    expect(plano.find((i) => i.campo === "fases_entregas")!.motivo).toContain("validado");
    expect(plano.find((i) => i.campo === "valor_total")!.motivo).toContain("Nada foi sobrescrito");
    // Divergência nunca é gravação.
    expect(aPreencher(plano).map((i) => i.campo)).not.toContain("fases_entregas");
  });

  it("campo sem conteúdo em nenhuma página extraída diz exatamente isso", () => {
    const item = plano.find((i) => i.campo === "escopo_resumo")!;
    expect(item.acao).toBe("sem_conteudo_no_canva");
    expect(item.motivo).toContain("escopo_macro");
  });

  it("a origem gravada é a proposta e o status nunca nasce validado", () => {
    expect(ORIGEM_CANVA).toBe("proposta");
    expect(STATUS_CANVA).toBe("importado_a_confirmar");
  });
});

describe("campos_nao_localizados é recalculado contra o conteúdo real", () => {
  it("campo marcado como não localizado, mas com texto na página, é falso positivo", () => {
    const p3 = PAGINAS[0]!;
    expect(camposNaoLocalizadosReais(p3)).toEqual([]);
    expect(falsosNaoLocalizados(p3).sort()).toEqual(["servicos_excluidos", "servicos_incluidos"]);
  });

  it("campo realmente ausente continua não localizado", () => {
    const p7 = PAGINAS.find((p) => p.page_number === 7)!;
    expect(camposNaoLocalizadosReais(p7)).toEqual(["proximos_passos"]);
    expect(falsosNaoLocalizados(p7)).toEqual(["despesas_externas"]);
  });
});

describe("o escritor está ligado e é conservador", () => {
  const fn = readFileSync("src/lib/contrato-parametros.functions.ts", "utf8");

  it("exige motivo e recusa deck sem página extraída", () => {
    expect(fn).toContain("Informe o motivo do preenchimento a partir do deck");
    expect(fn).toContain("Nenhuma página do deck está extraída");
  });

  it("grava por gravarComVerificacao, audita e recalcula completude", () => {
    expect(fn).toContain("preencherParametrosDoCanva");
    expect(fn).toContain("parametros_preenchidos_do_deck_canva");
    expect(fn).toContain("atualizarCompletude");
  });

  it("só o que o plano manda preencher é gravado — divergência não", () => {
    expect(fn).toContain("for (const item of aPreencher(plano))");
    expect(fn).not.toContain("for (const item of divergencias(plano))");
  });

  it("a tela mostra o plano antes de gravar e está montada na preparação", () => {
    const painel = readFileSync("src/components/contrato/trazer-do-canva.tsx", "utf8");
    expect(painel).toContain("data-canva-preencher");
    expect(painel).toContain("data-canva-divergente");
    expect(painel).toContain("data-canva-fora");
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
    expect(rota).toContain("<TrazerDoCanva canva={d.canva as any}");
  });

  it("nada aqui envia, assina, cobra ou publica", () => {
    const painel = readFileSync("src/components/contrato/trazer-do-canva.tsx", "utf8");
    expect(painel).toContain("não envia, não assina e não cobra");
    expect(readFileSync("src/lib/canva-para-parametros.ts", "utf8")).not.toContain(".insert(");
  });
});
