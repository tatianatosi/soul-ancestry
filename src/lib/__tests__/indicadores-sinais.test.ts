import { describe, expect, it } from "vitest";

import {
  avaliarSugestao,
  montarFilaHumana,
  ENVIO_AUTOMATICO_HABILITADO,
  textoSuspeito,
  type Contexto,
} from "@/lib/fila-comunicacao";
import {
  cac,
  cpl,
  formatarIndicador,
  montarFunil,
  previsoesControladas,
  resultadoCaixa,
  roi,
} from "@/lib/indicadores-marketing";
import { calcularRadar, validarAlteracaoManual } from "@/lib/radar-elegibilidade";
import type { LeadDesk } from "@/lib/crm-desk";

const lead: LeadDesk = {
  nome: "Teste",
  objetivo: "Cidadania portuguesa",
  pais_linha_prioritaria: "portugal",
  geracao_ascendente: "avo",
  estado_documental_inicial: "parcial",
  linha_transmissao: "materna",
  confianca_triagem: "documentos_vistos",
  status_via: "vigente",
  elegibilidade_preliminar: "forte",
};

describe("Radar de elegibilidade preliminar", () => {
  it("sem dados mínimos devolve leitura inconclusiva", () => {
    const r = calcularRadar({ nome: "X" });
    expect(r.faixa).toBe("inconclusiva");
    expect(r.exige_revisao_humana).toBe(true);
  });

  it("sinal forte exige todos os fatores obrigatórios", () => {
    expect(calcularRadar(lead).faixa).toBe("forte");
    expect(calcularRadar({ ...lead, linha_transmissao: null }).faixa).toBe("possivel_com_pesquisa");
  });

  it("via em confirmação jurídica rebaixa e exige revisão humana", () => {
    const r = calcularRadar({ ...lead, status_via: "em_confirmacao_juridica" });
    expect(r.faixa).toBe("possivel_com_pesquisa");
    expect(r.exige_revisao_humana).toBe(true);
  });

  it("marco a revisar bloqueia uso externo", () => {
    const r = calcularRadar(lead, { status_marco: "a_revisar" });
    expect(r.bloqueios_externos.length).toBeGreaterThan(0);
  });

  it("alteração manual exige responsável e versão; justificativa nunca bloqueia", () => {
    expect(validarAlteracaoManual({ faixa: "baixa" })).toHaveLength(2);
    expect(
      validarAlteracaoManual({
        faixa: "baixa",
        responsavel: "Tatiana",
        versao_matriz: "v1",
      }),
    ).toEqual([]);
    expect(
      validarAlteracaoManual({
        faixa: "baixa",
        justificativa: "documento contradiz relato",
        responsavel: "Tatiana",
        versao_matriz: "v1",
      }),
    ).toEqual([]);
  });
});

describe("Indicadores de marketing e financeiro", () => {
  it("sem custo ou atribuição não inventa zero", () => {
    expect(cpl({}).estado).toBe("sem_dados");
    expect(cac({ investimento_midia: 1000 }).estado).toBe("sem_dados");
    expect(formatarIndicador(roi({}))).toBe("Sem dados suficientes");
  });

  it("calcula CPL/CAC/ROI com base completa", () => {
    const base = {
      investimento_midia: 1000,
      leads_atribuiveis: 10,
      pagamentos_atribuiveis: 2,
      receita_atribuivel: 3000,
    };
    expect(cpl(base)).toMatchObject({ valor: 100 });
    expect(cac(base)).toMatchObject({ valor: 500 });
    expect(roi(base)).toMatchObject({ valor: 200 });
  });

  it("caixa usa receita recebida e nunca a contratada", () => {
    const r = resultadoCaixa({
      receita_recebida: 5000,
      receita_contratada: 50000,
      despesas_operacionais: 1000,
      investimento_midia: 500,
    });
    expect(r).toMatchObject({ valor: 3500 });
  });

  it("previsão nunca conta como receita", () => {
    expect(
      previsoesControladas({ contratada_nao_recebida: 900 }).every(
        (p) => p.conta_como_receita === false,
      ),
    ).toBe(true);
  });

  it("funil não compara etapa sem evento registrado", () => {
    const f = montarFunil({ lead_captado: 20, discovery_realizada: 5 });
    expect(f[0]?.volume).toMatchObject({ valor: 20 });
    expect(f.find((l) => l.chave === "discovery_agendada")?.volume.estado).toBe("sem_dados");
    expect(f.find((l) => l.chave === "discovery_realizada")?.taxa_etapa_anterior).toMatchObject({
      valor: 25,
    });
  });
});

describe("Fila humana de comunicação", () => {
  const base: Contexto = {
    gatilho: "followup_proposta",
    rotulo: "João",
    canal: "whatsapp",
    consentimento: "concedido",
  };

  it("nunca habilita envio automático", () => {
    expect(ENVIO_AUTOMATICO_HABILITADO).toBe(false);
  });

  it("sugestão nasce em rascunho e não enviada", () => {
    expect(avaliarSugestao(base)).toMatchObject({
      approval_status: "rascunho",
      delivery_status: "nao_enviado",
      priority: 1,
    });
  });

  it("bloqueia sem consentimento e sem canal", () => {
    expect(avaliarSugestao({ ...base, consentimento: "pendente" })).toMatchObject({
      bloqueado: true,
    });
    expect(avaliarSugestao({ ...base, canal: null })).toMatchObject({ bloqueado: true });
  });

  it("cobrança exige referência financeira autorizada", () => {
    expect(avaliarSugestao({ ...base, gatilho: "pagamento_inicial_aguardado" })).toMatchObject({
      bloqueado: true,
    });
  });

  it("boas-vindas exige contrato assinado e pagamento confirmado", () => {
    expect(
      avaliarSugestao({ ...base, gatilho: "boas_vindas_onboarding", contrato_assinado: true }),
    ).toMatchObject({ bloqueado: true });
  });

  it("demonstração fica fora da fila real", () => {
    const { sugestoes, bloqueadas } = montarFilaHumana([
      { ...base, is_demo: true },
      { ...base, consentimento: "recusado" },
    ]);
    expect(sugestoes).toHaveLength(0);
    expect(bloqueadas).toHaveLength(1);
  });

  it("detecta termos internos proibidos no texto", () => {
    expect(
      textoSuspeito("veja o link https://drive interno com a hipótese").length,
    ).toBeGreaterThan(0);
    expect(textoSuspeito("Olá João, seguimos com o próximo passo do seu processo.")).toEqual([]);
  });
});
