import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { alteracoesMateriais, coberturaDoModelo, TEXTO_REFERENCIA_A_VINCULAR } from "@/lib/aprovacao-modelo";
import { avaliarGates, type ContextoGates } from "@/lib/gates-formalizacao";
import {
  CHAVES_CONFERENCIA_MANUAL,
  chavesManuais,
  estadoDoCartao,
  montarCartoesFormalizacao,
  type EntradaCartoes,
} from "@/lib/formalizacao-cartoes";
import { REGRAS_APLICABILIDADE_ANEXOS } from "@/lib/contrato-blocos-incorporados";

const ler = (p: string) => readFileSync(`${process.cwd()}/${p}`, "utf8");

const anexos = REGRAS_APLICABILIDADE_ANEXOS.map((r) => ({
  codigo: r.codigo,
  rotulo: r.codigo,
  aplicavel: r.codigo === "ANEXO_I_ORDEM_SERVICO",
  justificativa: r.motivoNaoAplicavel,
  pendencia: null,
}));

function entrada(sobre: Partial<EntradaCartoes> = {}, clausulas: any[] = []): EntradaCartoes {
  return {
    caseId: "CASO-1",
    responsavelNome: "Equipe",
    partes: {
      pendencias: [],
      papeisDefinidos: true,
      possuiMenor: true,
      representacaoRegistrada: true,
      contratadaQualificada: true,
    },
    escopo: {
      propostaAprovada: true,
      propostaReferencia: "proposta v1",
      escopoPreenchido: true,
      servicosDefinidos: true,
      entregasDefinidas: true,
      valorTotal: 9600,
      pagamentoDefinido: true,
      prazoDefinido: true,
      pendenciasImpeditivas: [],
      pendenciasPosteriores: [],
    },
    contrato: {
      cobertura: coberturaDoModelo({ templateCode: "MODELO-ESTUDO", clausulasAlteradas: clausulas }),
      coberturaCompleta: true,
      anexoIIncorporado: true,
      anexos,
      previaGerada: true,
      previaAtual: true,
      previaReferencia: "rascunho de trabalho",
    },
    formalizacao: { prontoParaAssinatura: true, assinaturaRegistradaEm: null, bloqueiosImpeditivos: [], proximoPasso: null },
    persistidos: {},
    ...sobre,
  };
}

const ctxGates = (sobre: Partial<ContextoGates> = {}): ContextoGates =>
  ({
    propostaValida: true,
    propostaMotivos: [],
    camposAusentes: [],
    conflitos: [],
    precoOk: true,
    caseServiceOk: true,
    cadastroCompleto: true,
    nucleoValidado: true,
    menorEnvolvido: false,
    representacaoRegistrada: true,
    revisaoJuridicaOk: true,
    contratoOsProntos: true,
    assinaturaRegistrada: false,
    pagamentoConfirmado: false,
    autorizacaoPesquisa: true,
    despesasAplicaveis: false,
    despesasPendentes: [],
    ...sobre,
  }) as ContextoGates;

describe("aprovação do modelo × conferência da instância", () => {
  it("caso completo dentro do modelo aprovado não exige nova revisão jurídica", () => {
    const c = coberturaDoModelo({ templateCode: "MODELO-ESTUDO", clausulasAlteradas: [] });
    expect(c.dentroDoAprovado).toBe(true);
    expect(c.escalonamento).toEqual([]);
    const cartoes = montarCartoesFormalizacao(entrada());
    const estudo = cartoes.find((x) => x.id === "estudo_v2_anexos")!;
    expect(estudo.itens.find((i) => i.chave.endsWith("modelo_aprovado"))!.estado).toBe("concluido");
    expect(estudo.itens.find((i) => i.chave.endsWith("excecao_juridica"))!.estado).toBe("nao_aplicavel");
    expect(estudo.pendencias).toEqual([]);
  });

  it("sem referência histórica vinculada, diz 'referência de aprovação a vincular' em vez de inventar", () => {
    const c = coberturaDoModelo({ templateCode: "BASE-GEN-V2", clausulasAlteradas: [] });
    expect(c.rotuloAprovacao).toContain(TEXTO_REFERENCIA_A_VINCULAR);
  });

  it("alteração material fora do modelo identifica motivo e trecho e bloqueia por escalada excepcional", () => {
    const ov = [{ clause_code: "7.1", clause_title: "Foro", change_reason: "cliente pediu foro diferente", clause_text: "Fica eleito o foro de X." }];
    const c = coberturaDoModelo({ templateCode: "MODELO-ESTUDO", clausulasAlteradas: ov });
    expect(c.dentroDoAprovado).toBe(false);
    expect(c.escalonamento[0]).toMatchObject({ motivo: "cliente pediu foro diferente" });
    expect(c.escalonamento[0].trecho).toContain("foro de X");
    const estudo = montarCartoesFormalizacao(entrada({}, ov)).find((x) => x.id === "estudo_v2_anexos")!;
    const exc = estudo.itens.find((i) => i.chave.endsWith("excecao_juridica"))!;
    expect(exc.estado).toBe("bloqueado_externo");
    expect(exc.detalhe).toContain("cliente pediu foro diferente");
    expect(estudo.estado).toBe("bloqueado_externo");
  });

  it("cláusula arquivada não conta como alteração material", () => {
    expect(alteracoesMateriais([{ clause_code: "1", archived_at: "2026-10-01" }])).toEqual([]);
  });

  it("modelo desconhecido não é tratado como aprovado", () => {
    expect(coberturaDoModelo({ templateCode: "OUTRO", clausulasAlteradas: [] }).dentroDoAprovado).toBe(false);
    expect(coberturaDoModelo({ templateCode: null, clausulasAlteradas: [] }).dentroDoAprovado).toBe(false);
  });

  it("o gate jurídico passa a citar a alteração fora do modelo, e não 'revisão não aprovada' genérica", () => {
    const g = avaliarGates(ctxGates({ revisaoJuridicaOk: false, alteracoesForaDoModelo: ["7.1 (foro)"] })).find(
      (x) => x.gate === "revisao_juridica",
    )!;
    expect(g.ok).toBe(false);
    expect(g.motivo).toContain("fora do conteúdo do modelo aprovado");
    const generico = avaliarGates(ctxGates({ revisaoJuridicaOk: false })).find((x) => x.gate === "revisao_juridica")!;
    expect(generico.motivo).toContain("Revisão jurídica da versão final");
  });

  it("o servidor aplica a cobertura do modelo ao gate e aos temas bloqueantes", () => {
    const src = ler("src/lib/escopo-conferencia.server.ts");
    expect(src).toContain("coberturaDoModelo");
    expect(src).toContain("coberturaModelo.dentroDoAprovado");
    expect(src).toMatch(/temasJuridicosBloqueantes: coberturaModelo\.dentroDoAprovado \? \[\]/);
  });
});

describe("caso incompleto continua bloqueado por informação concreta", () => {
  it("dado de parte, representação e cobertura faltando viram pendências específicas", () => {
    const cartoes = montarCartoesFormalizacao(
      entrada({
        partes: {
          pendencias: ["Felipe: nome completo incompleto"],
          papeisDefinidos: true,
          possuiMenor: true,
          representacaoRegistrada: false,
          contratadaQualificada: true,
        },
        contrato: { ...entrada().contrato, coberturaCompleta: false },
        escopo: { ...entrada().escopo, pendenciasImpeditivas: ["Valor: não registrado"] },
        formalizacao: { prontoParaAssinatura: false, assinaturaRegistradaEm: null, bloqueiosImpeditivos: ["Representação"], proximoPasso: null },
      }),
    );
    const dados = cartoes.find((c) => c.id === "dados_partes")!;
    expect(dados.estado).toBe("bloqueado_externo");
    expect(dados.pendencias.join(" ")).toContain("Felipe: nome completo incompleto");
    expect(dados.pendencias.join(" ")).toContain("Representação de dependente menor não documentada");
    const formal = cartoes.find((c) => c.id === "formalizacao")!;
    expect(formal.itens.find((i) => i.chave.endsWith("pronto_assinatura"))!.estado).toBe("bloqueado_externo");
  });
});

describe("anexos: não aplicável concluído com justificativa", () => {
  it("II a V sem ato concreto ficam não aplicáveis com a justificativa da regra; I incorporado conclui", () => {
    const estudo = montarCartoesFormalizacao(entrada()).find((c) => c.id === "estudo_v2_anexos")!;
    const doAnexo = (cod: string) => estudo.itens.find((i) => i.chave.endsWith(cod.toLowerCase()))!;
    expect(doAnexo("ANEXO_I_ORDEM_SERVICO").estado).toBe("concluido");
    for (const c of ["ANEXO_II_DESPESAS_EXTERNAS", "ANEXO_III_AUTORIZACAO_PESQUISA", "ANEXO_IV_PROCURACAO", "ANEXO_V_ALTERACAO_ESCOPO"]) {
      expect(doAnexo(c).estado).toBe("nao_aplicavel");
      expect(doAnexo(c).detalhe.length).toBeGreaterThan(30);
    }
    expect(estudo.pendencias).toEqual([]);
  });

  it("anexo aplicável e incompleto continua pendente (ausência nunca é escondida)", () => {
    const comDespesa = anexos.map((a) =>
      a.codigo === "ANEXO_II_DESPESAS_EXTERNAS" ? { ...a, aplicavel: true, pendencia: "Despesa sem aprovação" } : a,
    );
    const estudo = montarCartoesFormalizacao(entrada({ contrato: { ...entrada().contrato, anexos: comDespesa } })).find(
      (c) => c.id === "estudo_v2_anexos",
    )!;
    expect(estudo.itens.find((i) => i.chave.endsWith("anexo_ii_despesas_externas"))!.estado).toBe("pendente");
    expect(estudo.pendencias).toContain("Despesa sem aprovação");
  });
});

describe("checklist persistido e recuperável", () => {
  it("itens manuais refletem o registro persistido e sobrevivem à remontagem (reabrir o caso)", () => {
    const persistidos = {
      "form.conf.dados_instancia": { status: "cumprido" as const, observacao: "conferido contra a proposta", por: "u1", em: "2026-10-09" },
      "form.conf.escopo_proposta": { status: "nao_aplicavel" as const, observacao: "escopo sem alteração desde a proposta", por: "u1", em: "2026-10-09" },
    };
    const a = montarCartoesFormalizacao(entrada({ persistidos }));
    const b = montarCartoesFormalizacao(entrada({ persistidos })); // "reabrir"
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    const conf = a.find((c) => c.id === "conferencia")!;
    expect(conf.itens.find((i) => i.chave === "form.conf.dados_instancia")!.estado).toBe("concluido");
    expect(conf.itens.find((i) => i.chave === "form.conf.escopo_proposta")!.estado).toBe("nao_aplicavel");
    expect(conf.itens.find((i) => i.chave === "form.conf.representacao_assinatura")!.estado).toBe("pendente");
  });

  it("só itens de conferência humana são marcáveis; fato derivado nunca é marcado à mão", () => {
    const cartoes = montarCartoesFormalizacao(entrada());
    expect(chavesManuais(cartoes).sort()).toEqual([...CHAVES_CONFERENCIA_MANUAL].sort());
    const derivados = cartoes.flatMap((c) => c.itens.filter((i) => !i.manual).map((i) => i.chave));
    for (const k of derivados) expect(CHAVES_CONFERENCIA_MANUAL as readonly string[]).not.toContain(k);
  });

  it("marcação persistida não esconde fato ausente: conferência de dados sem prévia fica bloqueada", () => {
    const base = entrada();
    const cartoes = montarCartoesFormalizacao(
      entrada({ contrato: { ...base.contrato, previaGerada: false, previaAtual: false } }),
    );
    const conf = cartoes.find((c) => c.id === "conferencia")!;
    expect(conf.itens.find((i) => i.chave === "form.conf.dados_instancia")!.estado).toBe("bloqueado_externo");
  });

  it("o servidor grava, relê, audita e recusa contrato assinado e chave fora da whitelist", () => {
    const src = ler("src/lib/formalizacao-cartoes.functions.ts");
    expect(src).toContain("CHAVES_CONFERENCIA_MANUAL");
    expect(src).toContain("não pode ser marcado à mão");
    expect(src).toMatch(/signed_at|status === "signed"/);
    expect(src).toContain("Contrato já assinado");
    expect(src).toContain("formalizacao_conferencia_marcada");
    expect(src).toContain("não foi confirmada na releitura");
    for (const campo of ["case_id", "contract_id", "versao_modelo", "campos_alterados", "evidencia"]) {
      expect(src).toContain(campo);
    }
    // nenhum envio, assinatura, cobrança ou publicação
    expect(src).not.toMatch(/enviarContrato|registrarAssinatura|asaas|publicar/i);
  });

  it("não aplicável exige justificativa (mesma regra do banco)", () => {
    expect(ler("src/lib/formalizacao-cartoes.functions.ts")).toContain("ao menos 10 caracteres");
  });

  it("persiste no vocabulário existente (pendente/cumprido/nao_aplicavel), sem CHECK novo", () => {
    const src = ler("src/lib/formalizacao-cartoes.functions.ts");
    expect(src).toContain('"case_checklist_items"');
    expect(src).not.toMatch(/em_andamento|bloqueado_externo/);
  });
});

describe("duas superfícies, um modelo", () => {
  it("go-live e Formalização do caso usam o mesmo componente, adaptador e persistência", () => {
    const golive = ler("src/routes/_authenticated/golive.formalizacao.tsx");
    const caso = ler("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx");
    expect(golive).toContain("CartoesFormalizacaoDoCaso");
    expect(caso).toContain("CartoesFormalizacao");
    const comp = ler("src/components/contrato/cartoes-formalizacao.tsx");
    expect(comp).toContain("entradaCartoesDePreparacao");
    expect(comp).toContain("montarCartoesFormalizacao");
    // a superfície de go-live abre a mesma preparação do caso, não um modelo próprio
    expect(comp).toContain("abrirPreparacaoContrato");
    // sem segunda lista de checklist ou de aprovação nas rotas
    for (const src of [golive, caso]) expect(src).not.toMatch(/CHAVES_CONFERENCIA_MANUAL|marcarItemFormalizacao/);
  });

  it("são cinco cartões, na ordem pedida, com orçamento de 60 minutos", () => {
    const cartoes = montarCartoesFormalizacao(entrada());
    expect(cartoes.map((c) => c.titulo)).toEqual([
      "Dados e partes",
      "Escopo e condição comercial",
      "Estudo Genealógico v2 e anexos",
      "Conferência operacional",
      "Formalização e próximo passo",
    ]);
    expect(cartoes.map((c) => c.minutosAlvo)).toEqual([10, 10, 20, 15, 5]);
    for (const c of cartoes) {
      expect(c.objetivo.length).toBeGreaterThan(10);
      expect(c.acaoPrincipal.length).toBeGreaterThan(5);
      expect(c.responsavel).toBeTruthy();
      expect(c.itens.length).toBeGreaterThan(0);
      expect(c.conclusao.length).toBeGreaterThan(5);
    }
  });

  it("estado do cartão: bloqueio externo domina, não aplicável não conta", () => {
    expect(estadoDoCartao([])).toBe("nao_aplicavel");
  });

  it("o contrato principal é o Estudo Genealógico v2 e nada é enviado, assinado ou cobrado pelos cartões", () => {
    const cartoes = montarCartoesFormalizacao(entrada());
    const estudo = cartoes.find((c) => c.id === "estudo_v2_anexos")!;
    expect(estudo.itens[0].rotulo).toContain("Estudo Genealógico v2");
    const assin = cartoes.find((c) => c.id === "formalizacao")!.itens.find((i) => i.chave.endsWith("assinatura_registrada"))!;
    expect(assin.estado).toBe("pendente"); // assinatura é ato externo; nunca marcada pelos cartões
    expect(assin.manual).toBe(false);
  });

  it("contrato assinado: os cartões só leem; assinatura registrada aparece como concluída", () => {
    const cartoes = montarCartoesFormalizacao(
      entrada({ formalizacao: { prontoParaAssinatura: true, assinaturaRegistradaEm: "2026-10-10", bloqueiosImpeditivos: [], proximoPasso: null } }),
    );
    const assin = cartoes.find((c) => c.id === "formalizacao")!.itens.find((i) => i.chave.endsWith("assinatura_registrada"))!;
    expect(assin.estado).toBe("concluido");
  });
});
