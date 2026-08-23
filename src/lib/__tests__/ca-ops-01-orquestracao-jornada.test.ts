import { describe, expect, it } from "vitest";
import {
  ACOES_NAO_AUTORIZADAS,
  EVENTOS_INTERNOS,
  TEMPLATES_GOVERNADOS,
  acaoAutorizada,
  assistentePodeExecutar,
  eventoDeCadencia,
  filaPainelHoje,
  orquestrarEvento,
  planejarOnboarding,
  projetarAoCliente,
  publicarMicroentrega,
  registrarTouchpoint,
  sugerirTemplate,
  transicaoMicroentregaPermitida,
  vinculoCompleto,
  avaliarTentativaSemCondicao,
  selecionarVersaoVigente,
  versaoTemplate,
  templatesVigentesPorEtapaCanal,
} from "@/lib/orquestracao-jornada";
import type { EstadoCaso } from "@/lib/jornada-cliente";

const HOJE = "2026-08-23";

const estadoBase = (over: Partial<EstadoCaso> = {}): EstadoCaso => ({
  aceiteComercial: true,
  cadastroCompleto: true,
  contratoPreparado: true,
  contratoEnviado: true,
  contratoAssinado: true,
  cobrancaCriada: true,
  pagamentoInicialConfirmado: true,
  dossieMae: true,
  ambienteDossie: true,
  nucleoFamiliar: true,
  requerentes: true,
  autorizacaoPesquisa: true,
  despesasTerceirosAprovadas: true,
  onboardingIniciado: false,
  onboardingMinimoConcluido: false,
  ...over,
});

describe("A. Biblioteca de Mensagens — templates governados", () => {
  it("todo template declara os sete atributos de governança", () => {
    for (const t of TEMPLATES_GOVERNADOS) {
      expect(t.etapa_jornada).toBeTruthy();
      expect(EVENTOS_INTERNOS).toContain(t.evento_canonico);
      expect(t.finalidade).toBeTruthy();
      expect(t.canal_previsto).toBeTruthy();
      expect(t.publico_elegivel).toBeTruthy();
      expect(t.regra_de_bloqueio).toBeTruthy();
      expect(t.vigencia.inicio).toBeTruthy();
    }
  });

  it("sugere template sem executar envio", () => {
    const s = sugerirTemplate("lead_novo", { hoje: HOJE });
    expect(s.template?.chave).toBe("primeiro_contato");
    expect(s.resultado).toBe("rascunho_interno");
  });

  it("respeita regra de bloqueio do template", () => {
    const s = sugerirTemplate("lead_novo", {
      hoje: HOJE,
      bloqueios: ["Lead sem consentimento de contato registrado."],
    });
    expect(s.template).toBeNull();
    expect(s.bloqueado).toBe(true);
  });
});

describe("B. Eventos internos", () => {
  it("nenhum plano contém ação externa e todas as ações são da lista fechada", () => {
    for (const evento of EVENTOS_INTERNOS) {
      const plano = orquestrarEvento(evento, { hoje: HOJE });
      expect(plano.contemAcaoExterna).toBe(false);
      for (const acao of plano.acoes) expect(acaoAutorizada(acao)).toBe(true);
      for (const proibida of ACOES_NAO_AUTORIZADAS) expect(plano.acoes).not.toContain(proibida);
    }
  });
});

describe("C. Onboarding condicionado a gate", () => {
  it("bloqueia acolhimento sem contrato assinado e pagamento", () => {
    const plano = planejarOnboarding({
      estado: estadoBase({ contratoAssinado: false, pagamentoInicialConfirmado: false }),
      hoje: HOJE,
    });
    expect(plano.permitido).toBe(false);
    expect(plano.tarefaAcolhimento).toBeNull();
    expect(plano.rascunhoBoasVindas).toBeNull();
    expect(plano.bloqueios).toContain("CONTRATO_NAO_ASSINADO");
  });

  it("com gates cumpridos cria tarefa, prazo, marco e rascunho — sem ativar caso", () => {
    const plano = planejarOnboarding({ estado: estadoBase(), hoje: HOJE, responsavel: "u1" });
    expect(plano.permitido).toBe(true);
    expect(plano.tarefaAcolhimento).toBe("Acolhimento de onboarding");
    expect(plano.prazo).toBe("2026-08-26");
    expect(plano.proximoMarcoVerificavel).toBeTruthy();
    expect(plano.primeiraMicroentrega).toBe("boas_vindas");
    expect(plano.naoExecuta).toEqual(["ativar_caso", "cobrar", "assinar", "enviar_mensagem"]);
  });
});

describe("D. Microentregas", () => {
  it("microentrega não publicada não chega ao cliente", () => {
    const projetadas = projetarAoCliente([
      { id: "1", approval_status: "aprovado", title_client: "Árvore inicial", summary_approved: "Resumo" },
      { id: "2", approval_status: "publicado", title_client: "Árvore inicial", summary_approved: "Resumo" },
    ]);
    expect(projetadas.map((p) => p.id)).toEqual(["2"]);
  });

  it("mantém os estados existentes do fluxo de aprovação", () => {
    expect(transicaoMicroentregaPermitida("rascunho", "em_revisao")).toBe(true);
    expect(transicaoMicroentregaPermitida("aprovado", "publicado")).toBe(true);
    expect(transicaoMicroentregaPermitida("rascunho", "publicado")).toBe(false);
  });

  it("exige vínculo com caso, fase, responsável, prazo e origem", () => {
    const r = vinculoCompleto({ caso_id: "c1", fase: "onboarding", responsavel_id: null, prazo: null, objeto_origem: null });
    expect(r.valido).toBe(false);
    expect(r.faltando).toEqual(["responsável", "prazo", "objeto de origem", "resumo interno"]);
  });

  it("exige resumo sanitizado apenas para publicar", () => {
    const vinculo = {
      caso_id: "c1",
      fase: "onboarding" as const,
      responsavel_id: "u1",
      prazo: "2026-09-01",
      objeto_origem: "tarefa:1",
      resumo_interno: "Contexto interno",
    };
    expect(vinculoCompleto(vinculo).valido).toBe(true);
    expect(vinculoCompleto(vinculo, { paraPublicacao: true }).faltando).toEqual([
      "resumo sanitizado ao cliente",
    ]);
  });

  it("tentativa de publicação sem condição vira alerta derivado que abre o objeto", () => {
    const r = avaliarTentativaSemCondicao({
      acao: "publicar",
      objeto: { entidade: "ops_microentregas", id: "9", destino: "/ops?microentrega=9" },
      condicoesFaltantes: ["resumo sanitizado ao cliente"],
    });
    expect(r.permitido).toBe(false);
    expect(r.alerta?.destino).toBe("/ops?microentrega=9");
    expect(r.alerta?.criaRegistro).toBe(false);
    expect(avaliarTentativaSemCondicao({
      acao: "comunicar",
      objeto: { entidade: "crm_casos", id: "1", destino: "/casos/1" },
      condicoesFaltantes: [],
    })).toEqual({ permitido: true, alerta: null });
  });

  it("publicação atualiza cadência internamente sem enviar mensagem", () => {
    const efeito = publicarMicroentrega({ hoje: HOJE });
    expect(efeito.eventoInterno).toBe("microentrega_publicada");
    expect(efeito.cadencia.status).toBe("regular");
    expect(efeito.envioExecutado).toBe(false);
  });
});

describe("E. Cadência e alertas", () => {
  it("touchpoint inválido não atualiza cadência", () => {
    const r = registrarTouchpoint({
      hoje: HOJE,
      conteudo: { oQueFoiFeito: "Consulta ao arquivo" },
      ultimoTouchpointValidoEm: "2026-08-01",
    });
    expect(r.aceito).toBe(false);
    expect(r.cadencia.diasSemTouchpoint).toBe(22);
    expect(r.cadencia.status).toBe("critico");
  });

  it("touchpoint completo zera a cadência", () => {
    const r = registrarTouchpoint({
      hoje: HOJE,
      conteudo: {
        oQueFoiFeito: "Consulta ao arquivo",
        oQueEstaAguardando: "Retorno do arquivo",
        oQueNaoDependeDoCliente: "Prazo do órgão",
        proximoMarcoVerificavel: "Resposta em 30 dias",
      },
      ultimoTouchpointValidoEm: "2026-08-01",
    });
    expect(r.aceito).toBe(true);
    expect(r.cadencia.status).toBe("regular");
  });

  it("deriva evento de cadência a partir do status existente", () => {
    expect(eventoDeCadencia("critico")).toBe("cadencia_critica");
    expect(eventoDeCadencia("atencao")).toBe("cadencia_atencao");
    expect(eventoDeCadencia("regular")).toBeNull();
  });

  it("alerta derivado abre objeto canônico", () => {
    const plano = orquestrarEvento("microentrega_atrasada", { hoje: HOJE });
    expect(plano.acoes).toContain("gerar_alerta_derivado");
    expect(plano.acoes).toContain("abrir_objeto_canonico");
    expect(plano.objetoCanonico).toBe("/ops-excecoes");
  });
});

describe("F. Painel Hoje", () => {
  it("não duplica o mesmo objeto na fila", () => {
    const fila = filaPainelHoje([
      { chave: "crm_casos:1", categoria: "cadencia", rotulo: "Cadência", destino: "/casos/1" },
      { chave: "crm_casos:1", categoria: "vencidos", rotulo: "Prazo vencido", destino: "/casos/1" },
      { chave: "ops_microentregas:9", categoria: "microentrega_aguardando", rotulo: "Revisão", destino: "/ops" },
    ]);
    expect(fila).toHaveLength(2);
    expect(fila[0]!.categoria).toBe("vencidos");
  });
});

describe("G. Assistente", () => {
  it("explica, mas não executa ação", () => {
    expect(assistentePodeExecutar("explicar_bloqueio")).toBe(true);
    for (const proibida of ["enviar", "publicar", "cobrar", "assinar", "alterar_gate", "pesquisar_externamente"]) {
      expect(assistentePodeExecutar(proibida)).toBe(false);
    }
  });
});

describe("versionamento e vigência de templates", () => {
  it("seleciona a maior versão vigente para etapa e canal", () => {
    const t = selecionarVersaoVigente({ evento: "lead_novo" }, "2026-08-23");
    expect(t?.evento_canonico).toBe("lead_novo");
    expect(versaoTemplate(t!)).toBeGreaterThanOrEqual(1);
  });

  it("não sugere template com vigência encerrada", () => {
    const s = sugerirTemplate("lead_novo", { hoje: "2025-01-01" });
    expect(s.resultado).toBe("sem_template");
  });

  it("catálogo vigente traz uma versão por etapa × canal × evento", () => {
    const lista = templatesVigentesPorEtapaCanal("2026-08-23");
    const chaves = lista.map((t) => `${t.etapa_jornada}|${t.canal_previsto}|${t.evento_canonico}`);
    expect(new Set(chaves).size).toBe(chaves.length);
  });
});
