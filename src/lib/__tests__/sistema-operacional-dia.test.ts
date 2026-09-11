import { describe, expect, it } from "vitest";

import type { Fila } from "@/lib/crm-desk";
import {
  CATEGORIAS_OPERACIONAIS,
  CHECKS_PORTAL_AUTENTICADO,
  SISTEMA_DIA_NUNCA_ESCREVE_EXTERNO,
  chavesAlinhadasComConsolidacao,
  contarCapacidadesPorClassificacao,
  derivarAgendaDoPainel,
  enriquecerItemDia,
  followUpParaOperacional,
  filaFollowUpReferencia,
  idsDuplicadosNaFila,
  itensOverrideExpirando,
  matrizValidacaoPortal,
  montarFilaCanonicaOperacional,
  overrideNuncaLiberaAcaoExterna,
  sugerirAgendaDoDia,
  type ItemOperacionalDia,
} from "@/lib/sistema-operacional-dia";

const fila = (chave: string, itens: Fila["itens"], criticidade = 1): Fila => ({
  chave,
  rotulo: chave,
  criticidade,
  itens,
});

const lead = (
  id: string,
  detalhe: string,
  over: Partial<Fila["itens"][number]> = {},
): Fila["itens"][number] => ({
  id,
  rotulo: `L-${id} · Pessoa`,
  detalhe,
  data: "2026-09-11",
  tipo: "lead",
  area: "comercial",
  responsavel: "Ana",
  etapa: "proposta_enviada",
  ...over,
});

const caso = (
  id: string,
  detalhe: string,
  over: Partial<Fila["itens"][number]> = {},
): Fila["itens"][number] => ({
  id,
  rotulo: `C-${id} · Caso`,
  detalhe,
  data: "2026-09-10",
  tipo: "caso",
  area: "operacao",
  responsavel: "Bia",
  etapa: "pesquisa_inicial",
  origemAcao: "automatica",
  ...over,
});

describe("sistema operacional do dia — categorias e precedência", () => {
  it("expõe exatamente as 10 categorias mínimas do prompt", () => {
    expect(CATEGORIAS_OPERACIONAIS).toHaveLength(10);
  });

  it("deduplica o mesmo objeto na categoria de maior precedência", () => {
    const filas: Fila[] = [
      fila("propostas_sem_followup", [lead("1", "Proposta sem follow-up")], 4),
      fila("casos_pendencia_documental", [caso("1", "Documento mínimo")], 2),
      // mesmo caso também em cadeia (próxima ação) — deve ganhar de comercial
      fila("cadeia_operacional", [caso("1", "Próxima ação canônica")], 1),
      fila("pagamentos_aguardados", [lead("2", "Pagamento aguardado", { data: null })], 3),
    ];
    const itens = montarFilaCanonicaOperacional(filas, { hoje: "2026-09-11" });
    expect(idsDuplicadosNaFila(itens)).toEqual([]);
    const doCaso = itens.find((i) => i.id === "caso:1");
    expect(doCaso?.categoria).toBe("proxima_acao_caso");
    expect(itens.filter((i) => i.id === "caso:1")).toHaveLength(1);
  });

  it("exclui demo por padrão e não promove falha de leitura a fila vazia", () => {
    const filas: Fila[] = [
      fila("calls_hoje", [
        lead("demo1", "Call", { rotulo: "Demo Fixture · X" }),
        lead("real1", "Call real"),
      ]),
    ];
    const semDemo = montarFilaCanonicaOperacional(filas, { hoje: "2026-09-11" });
    expect(semDemo.map((i) => i.id)).toEqual(["lead:real1"]);

    const falha = montarFilaCanonicaOperacional([], {
      hoje: "2026-09-11",
      falhaLeitura: "timeout na consulta de leads",
    });
    expect(falha).toHaveLength(1);
    expect(falha[0]!.categoria).toBe("falhas_dado_integracao");
    expect(falha[0]!.estado).toBe("critico");
    expect(falha[0]!.tipoAcao).toBe("nao_disponivel");
    expect(falha[0]!.classificacao).toBe("PENDENTE_DE_DADO");
  });

  it("financeiro permanece somente_leitura", () => {
    const itens = montarFilaCanonicaOperacional(
      [fila("pagamentos_aguardados", [lead("p1", "Pagamento inicial")])],
      { hoje: "2026-09-11" },
    );
    expect(itens[0]!.tipoAcao).toBe("somente_leitura");
    expect(itens[0]!.categoria).toBe("financeiro_reconciliacao");
  });
});

describe("sistema operacional do dia — ItemDia enriquecido", () => {
  it("carrega motivo, evidência, responsável, prazo, próxima ação e rota", () => {
    const op = enriquecerItemDia({
      id: "abc",
      tipo: "caso",
      rotulo: "Caso ABC",
      acao: "Validar documento",
      data: "2026-09-11",
      responsavel: "Bia",
      area: "pesquisa",
      etapa: "pesquisa_inicial",
      bloqueios: [],
      demo: false,
      semResponsavel: false,
      semPrazo: false,
      origemAcao: "automatica",
    });
    expect(op.motivo).toBe("Validar documento");
    expect(op.evidencia).toContain("proxima_acao");
    expect(op.responsavel).toBe("Bia");
    expect(op.prazo).toBe("2026-09-11");
    expect(op.proximaAcao).toBe("Validar documento");
    expect(op.rotaDestino).toBe("/casos/abc");
    expect(op.origem).toBe("real");
  });
});

describe("sistema operacional do dia — agenda interna", () => {
  it("sugestões nascem RASCUNHO_INTERNO sem confirmação e nunca escrevem externo", () => {
    expect(SISTEMA_DIA_NUNCA_ESCREVE_EXTERNO).toBe(true);
    const s = sugerirAgendaDoDia({
      titulo: "Follow-up Lara",
      objetivo: "Agendar apresentação",
      pessoaOuCaso: "Lara",
      responsavel: "Comercial",
      janelaInicio: null,
      janelaFim: null,
      duracaoMinutos: 30,
      motivo: "Proposta pronta",
      pauta: "Apresentar proposta",
      rota: "/propostas",
      dependencias: [],
    });
    expect(s.estado).toBe("RASCUNHO_INTERNO");
    expect((s as { criarEvento?: unknown }).criarEvento).toBeUndefined();
  });

  it("deriva agenda só de categorias permitidas e respeita jaExibidos", () => {
    const base: ItemOperacionalDia = {
      id: "lead:lara",
      categoria: "comercial_followup",
      prioridade: 6,
      estado: "pendente",
      objetoTipo: "lead",
      objetoId: "lara",
      rotulo: "Lara",
      motivo: "Reunião não agendada",
      evidencia: "fixture",
      atualizadoEm: null,
      responsavel: "Comercial",
      prazo: "2026-09-12",
      regraPrazo: null,
      proximaAcao: "Agendar apresentação",
      rotaDestino: "/propostas",
      tipoAcao: "acao_interna_permitida",
      origem: "demo",
      dependeDe: null,
      classificacao: "CONTEXTO",
    };
    expect(derivarAgendaDoPainel([base])).toHaveLength(1);
    expect(derivarAgendaDoPainel([base], new Set(["lead:lara"]))).toHaveLength(0);
    expect(
      derivarAgendaDoPainel([{ ...base, categoria: "financeiro_reconciliacao" }]),
    ).toHaveLength(0);
  });
});

describe("sistema operacional do dia — override e follow-up de referência", () => {
  it("lista overrides perto de expirar sem liberar ações externas", () => {
    expect(overrideNuncaLiberaAcaoExterna("criar_cobranca")).toBe(true);
    expect(overrideNuncaLiberaAcaoExterna("editar_rascunho")).toBe(false);

    const itens = itensOverrideExpirando(
      [
        {
          id: "ov1",
          casoId: "c1",
          rotulo: "Ana Luiza — início antes do pagamento",
          dataRevisao: "2026-09-14",
          condicaoOriginal: "pagamento_inicial_confirmado",
          escopoLiberado: ["preparacao_contratual"],
        },
        {
          id: "ov2",
          casoId: "c2",
          rotulo: "Expirado",
          dataRevisao: "2026-09-01",
          condicaoOriginal: "gate_x",
          escopoLiberado: ["planejamento"],
        },
      ],
      { hoje: "2026-09-11", diasAlerta: 7 },
    );
    expect(itens).toHaveLength(2);
    expect(itens.every((i) => i.tipoAcao === "decisao_proprietaria")).toBe(true);
    expect(itens.every((i) => i.categoria === "excecoes_proprietaria_expirando")).toBe(true);
  });

  it("fixtures Ana/João/Lara viram itens de contexto, sem escrita", () => {
    const refs = filaFollowUpReferencia().map(followUpParaOperacional);
    expect(refs.map((r) => r.rotulo).sort()).toEqual(["Ana Luiza", "João", "Lara"]);
    expect(refs.every((r) => r.origem === "demo")).toBe(true);
    expect(refs.every((r) => r.classificacao === "CONTEXTO")).toBe(true);
  });
});

describe("sistema operacional do dia — portal e inventário", () => {
  it("sem sessão autorizada não usa HTTP 200 como prova", () => {
    const m = matrizValidacaoPortal({ sessaoClienteAutorizada: false });
    expect(m.comprovado).toBe(false);
    expect(m.checks).toHaveLength(CHECKS_PORTAL_AUTENTICADO.length);
    expect(m.checks.every((c) => c.resultado === "NAO_COMPROVADO_NO_DOMINIO_PUBLICADO")).toBe(
      true,
    );
  });

  it("só comprova quando todos os checks PASSOU com sessão", () => {
    const ids = Object.fromEntries(
      CHECKS_PORTAL_AUTENTICADO.map((c) => [c.id, "PASSOU" as const]),
    );
    const m = matrizValidacaoPortal({ sessaoClienteAutorizada: true, resultados: ids });
    expect(m.comprovado).toBe(true);
  });

  it("inventário conta capacidades sem inventar OPERACIONAL falso", () => {
    const c = contarCapacidadesPorClassificacao();
    expect(c.OPERACIONAL).toBeGreaterThan(0);
    expect(c.PENDENTE_DE_VALIDACAO_PUBLICADA).toBeGreaterThanOrEqual(1);
    expect(c.PENDENTE_DE_DECISAO_PROPRIETARIA).toBeGreaterThanOrEqual(1);
  });

  it("chaves da fila operacional alinhadas à consolidação (caracterização)", () => {
    const filas: Fila[] = [
      fila("acoes_hoje", [lead("a", "Ação hoje")]),
      fila("casos_pendencia_documental", [caso("b", "Doc")]),
      fila("leads_sem_responsavel", [
        lead("c", "Sem dono", { responsavel: null, data: null }),
      ]),
    ];
    const alin = chavesAlinhadasComConsolidacao(filas);
    expect(alin.soConsolidados).toEqual([]);
    expect(alin.soOperacionais).toEqual([]);
  });
});
