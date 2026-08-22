import { montarFilasHoje } from "@/lib/crm-desk";
import { consolidarDia } from "@/lib/painel-dia";
import { describe, expect, it } from "vitest";

import {
  avaliarPlanejador,
  bloqueiosAprovacaoProposta,
  bloqueiosOS,
  conteudoOSDaProposta,
  consolidarCadeia,
  derivarCondicaoComercial,
  hashConteudo,
  montarEscopoEstruturado,
  planejadorLiberaProposta,
  pendenciasParaPainel,
  type ChaveEloOperacional,
  type EntradaPlanejador,
  type PropostaEstruturada,
  type SkuCanonicoProposta,
} from "@/lib/cadeia-operacional";

const planoCompleto = (): EntradaPlanejador => ({
  caseId: "caso-1",
  objetivo: "Reconhecimento de cidadania italiana",
  etapa: "estudo genealógico",
  composicao: "nucleo_familiar",
  rotaConfirmada: "Itália",
  produtoSkuCodigo: "CID-AT-FAM",
  dadosDisponiveis: ["certidão do avô"],
  dependenciasCliente: ["envio de certidões"],
  dependenciasTerceiros: ["comune de origem"],
  fontes: [{ chave: "planilha_mestre", estado: "confirmada", referencia: "v2" }],
  responsavelUserId: "user-1",
  proximaAcao: "Confirmar linha materna",
  prazoProximaAcao: "2026-03-10",
  faseJornada: "fase_2",
  checklist: ["conferir nomes"],
  perguntas: ["há registro civil?"],
  marcos: ["linha confirmada"],
  entregas: ["relatório genealógico"],
  microentregas: ["mapa preliminar"],
  regrasAnexos: ["ANX-ESCOPO"],
});

const sku = (over: Partial<SkuCanonicoProposta> = {}): SkuCanonicoProposta => ({
  id: "sku-1",
  code: "CID-AT-FAM",
  ativo: true,
  elegivel_para_proposta: true,
  preco_sugerido: 9600,
  moeda: "BRL",
  fonte_referencia: "Planilha Mestre v2",
  inclusoes: ["pesquisa documental"],
  exclusoes: ["taxas consulares"],
  entregaveis: ["dossiê genealógico"],
  dados_teste: false,
  ...over,
});

function propostaValida(): PropostaEstruturada {
  const entrada = planoCompleto();
  const saida = avaliarPlanejador(entrada);
  const escopo = montarEscopoEstruturado({
    entrada,
    saida,
    planId: "plan-1",
    sku: sku(),
    pessoas: [{ nome: "Ana Luiza", papel: "titular" }],
  });
  return {
    id: "prop-1",
    case_id: "caso-1",
    plan_id: "plan-1",
    versao: 1,
    status: "rascunho",
    escopo_estruturado: escopo,
    product_catalog_id: "sku-1",
    valor: 9600,
    moeda: "BRL",
    preco_fonte_referencia: "Planilha Mestre v2",
    forma_pagamento: "pix",
    parcelas_declaradas: 3,
    primeiro_vencimento_declarado: "2026-04-05",
    responsavel_comercial: "Comercial",
    responsavel_operacional: "Operações",
  };
}

describe("planejador operacional", () => {
  it("libera a proposta quando todos os campos e fontes estão declarados", () => {
    const s = avaliarPlanejador(planoCompleto());
    expect(planejadorLiberaProposta(s).ok).toBe(true);
  });

  it("gera pendência sem rota confirmada e nunca infere rota", () => {
    const s = avaliarPlanejador({ ...planoCompleto(), rotaConfirmada: null });
    expect(planejadorLiberaProposta(s).ok).toBe(false);
    expect(s.pendencias.some((p) => p.includes("rota"))).toBe(true);
  });

  it("bloqueia fonte em conflito", () => {
    const s = avaliarPlanejador({
      ...planoCompleto(),
      fontes: [{ chave: "planilha_mestre", estado: "conflito" }],
    });
    expect(s.bloqueios).toHaveLength(1);
  });

  it("hash é estável para o mesmo conteúdo (idempotência)", () => {
    expect(avaliarPlanejador(planoCompleto()).hash).toBe(avaliarPlanejador(planoCompleto()).hash);
    expect(hashConteudo({ a: 1 })).not.toBe(hashConteudo({ a: 2 }));
  });
});

describe("proposta estruturada e preço da fonte mestre", () => {
  it("aprova quando o escopo vem do planejador e o preço vem do SKU", () => {
    expect(bloqueiosAprovacaoProposta(propostaValida(), sku())).toEqual([]);
  });

  it("bloqueia preço divergente da fonte mestre (preço livre proibido)", () => {
    const p = { ...propostaValida(), valor: 7000 };
    expect(bloqueiosAprovacaoProposta(p, sku()).some((b) => b.includes("preço livre"))).toBe(true);
  });

  it("bloqueia SKU sem referência da Planilha Mestre", () => {
    const p = { ...propostaValida(), preco_fonte_referencia: null };
    expect(bloqueiosAprovacaoProposta(p, sku({ fonte_referencia: null })).length).toBeGreaterThan(0);
  });

  it("bloqueia proposta sem origem no planejador", () => {
    const p = { ...propostaValida(), plan_id: null };
    expect(bloqueiosAprovacaoProposta(p, sku()).some((b) => b.includes("planejador"))).toBe(true);
  });
});

describe("condição comercial e OS/Anexo I", () => {
  it("não infere parcelas nem vencimento ausentes", () => {
    const c = derivarCondicaoComercial(
      { ...propostaValida(), parcelas_declaradas: null, primeiro_vencimento_declarado: null },
      sku(),
    );
    expect(c.parcelas).toBeNull();
    expect(c.primeiro_vencimento).toBeNull();
    expect(c.pendencias).toHaveLength(2);
  });

  it("OS deriva o conteúdo real da proposta", () => {
    const os = conteudoOSDaProposta(propostaValida(), "cc-1");
    expect(bloqueiosOS(os)).toEqual([]);
    expect(os.sku_codigo).toBe("CID-AT-FAM");
  });

  it("OS sem condição comercial persistida é bloqueada", () => {
    expect(bloqueiosOS(conteudoOSDaProposta(propostaValida(), null))).toContain("OS sem condição comercial persistida.");
  });
});

describe("consolidação da cadeia", () => {
  const base = (): Record<ChaveEloOperacional, { motivos: string[] }> => ({
    planejador: { motivos: [] },
    proposta: { motivos: [] },
    catalogo: { motivos: [] },
    condicao_comercial: { motivos: [] },
    os_anexo_i: { motivos: [] },
    previa: { motivos: [] },
    revisao_humana: { motivos: [] },
    assinatura: { motivos: ["Assinatura permanece desabilitada nesta entrega."] },
  });

  it("mantém a assinatura desabilitada mesmo com a cadeia completa", () => {
    const r = consolidarCadeia(base());
    expect(r.assinaturaLiberada).toBe(false);
    expect(r.proximoElo).toBe("assinatura");
  });

  it("propaga bloqueio para os elos seguintes ao primeiro pendente", () => {
    const entradas = base();
    entradas.proposta = { motivos: ["Proposta não materializada."] };
    const r = consolidarCadeia(entradas);
    expect(r.elos.find((e) => e.chave === "proposta")?.estado).toBe("pendente");
    expect(r.elos.find((e) => e.chave === "os_anexo_i")?.estado).toBe("bloqueado");
  });

  it("expõe uma pendência priorizada para o Painel Hoje", () => {
    const entradas = base();
    entradas.condicao_comercial = { motivos: ["Condição comercial não persistida."] };
    const r = consolidarCadeia(entradas);
    const item = pendenciasParaPainel({
      caseId: "caso-1",
      rotulo: "CA-CID-AT-FAM-2026-001",
      responsavel: "user-1",
      prazo: "2026-03-10",
      elos: r.elos,
    });
    expect(item?.acao).toContain("Condição comercial");
    expect(item?.bloqueios.length).toBeGreaterThan(0);
  });
});

describe("cadeia operacional no Painel Hoje", () => {
  const itemCadeia = {
    id: "c1",
    rotulo: "CA-OPS-001 · Caso",
    detalhe: "Proposta estruturada: pendência",
    data: "2026-08-20",
    tipo: "caso" as const,
    area: "operacoes",
    responsavel: null,
    etapa: "cadeia_operacional",
  };

  it("cria a fila cadeia_operacional a partir das pendências derivadas", () => {
    const filas = montarFilasHoje({ leads: [], casos: [], cadeia: [itemCadeia] });
    const fila = filas.find((f) => f.chave === "cadeia_operacional");
    expect(fila?.itens).toHaveLength(1);
    expect(fila?.rotulo).toBe("Cadeia operacional pendente");
  });

  it("mantém o caso uma única vez mesmo quando também tem pendência documental", () => {
    const filas = montarFilasHoje({
      leads: [],
      casos: [
        {
          id: "c1",
          codigo: "CA-OPS-001",
          titulo: "Caso",
          documentos_minimos_ok: false,
          prazo_proxima_acao: "2026-08-25",
        },
      ],
      cadeia: [itemCadeia],
    });
    const itens = consolidarDia(filas);
    expect(itens.filter((i) => i.id === "c1")).toHaveLength(1);
    expect(itens[0]?.acao).toContain("Proposta estruturada");
  });
});
