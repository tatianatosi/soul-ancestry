import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

import { ordenarPorPrioridade, sinaisDaPessoa } from "@/lib/pessoa-sinais";

/**
 * §15 do De-Para (Pessoa 360, linha Sinais). Teste focado de comportamento:
 * - cada um dos 4 tipos aparece quando a entrada canônica ativa a regra;
 * - nenhum aparece com dado completo e sem candidato;
 * - a ordenação canônica leva crítica antes de baixa;
 * - a rota Pessoa 360 renderiza o bloco `data-pessoa360-sinais`.
 */

const ROTA = resolve(__dirname, "../../routes/_authenticated/pessoas.$clienteId.tsx");

const clienteCompleto = {
  id: "cli-1",
  nome: "Ana Luiza",
  cpf: "123.456.789-00",
  email: "ana@example.com",
  telefone: "(11) 99999-9999",
  data_nascimento: "1985-04-12",
};

describe("D5 Pessoa 360 — sinaisDaPessoa", () => {
  it("não emite sinal quando cliente está completo, sem leads em conflito e sem candidato", () => {
    const sinais = sinaisDaPessoa({ cliente: clienteCompleto, leads: [], casos: [] });
    expect(sinais).toEqual([]);
  });

  it("emite conflito crítico quando um lead aponta para outro cliente", () => {
    const sinais = sinaisDaPessoa({
      cliente: clienteCompleto,
      leads: [{ id: "l-1", nome: "Ana", cliente_id: "cli-outro" }],
      casos: [],
    });
    const conflito = sinais.find((s) => s.tipo === "conflito");
    expect(conflito).toBeDefined();
    expect(conflito?.prioridade).toBe("critica");
    expect(conflito?.acaoRecomendada).toMatch(/canônico/i);
  });

  it("emite lacuna documental alta quando CPF/e-mail/data_nascimento vazio", () => {
    const sinais = sinaisDaPessoa({
      cliente: { id: "cli-1", nome: "Ana", cpf: "", email: "", data_nascimento: null },
      leads: [],
      casos: [],
    });
    const lacuna = sinais.find((s) => s.tipo === "lacuna_documental");
    expect(lacuna).toBeDefined();
    expect(lacuna?.prioridade).toBe("alta");
    expect(lacuna?.detalhe).toMatch(/CPF/);
    expect(lacuna?.detalhe).toMatch(/e-mail/);
    expect(lacuna?.detalhe).toMatch(/data de nascimento/);
  });

  it("emite consentimento médio só quando há caso ativo e lead com consentimento pendente ou recusado", () => {
    const semCasoAtivo = sinaisDaPessoa({
      cliente: clienteCompleto,
      leads: [{ id: "l-1", cliente_id: "cli-1", consentimento_status: "pendente" }],
      casos: [{ id: "c-1", ativo: false, status: "encerrado" }],
    });
    expect(semCasoAtivo.find((s) => s.tipo === "consentimento")).toBeUndefined();

    const comCasoAtivo = sinaisDaPessoa({
      cliente: clienteCompleto,
      leads: [{ id: "l-1", cliente_id: "cli-1", consentimento_status: "pendente" }],
      casos: [{ id: "c-1", ativo: true, status: "ativo" }],
    });
    const cons = comCasoAtivo.find((s) => s.tipo === "consentimento");
    expect(cons).toBeDefined();
    expect(cons?.prioridade).toBe("media");

    const naoSolicitado = sinaisDaPessoa({
      cliente: clienteCompleto,
      leads: [{ id: "l-1", cliente_id: "cli-1", consentimento_status: "nao_solicitado" }],
      casos: [{ id: "c-1", ativo: true }],
    });
    expect(naoSolicitado.find((s) => s.tipo === "consentimento")).toBeUndefined();
  });

  it("emite duplicidade baixa quando há candidatos por nome, informativa e sem fusão", () => {
    const sinais = sinaisDaPessoa({
      cliente: clienteCompleto,
      leads: [],
      casos: [],
      possiveisDuplicidades: [
        { id: "cand-1", nome: "Ana Luiza da Silva", motivo: "Nome parcial" },
      ],
    });
    const dup = sinais.find((s) => s.tipo === "duplicidade");
    expect(dup).toBeDefined();
    expect(dup?.prioridade).toBe("baixa");
    expect(dup?.acaoRecomendada).toMatch(/nenhuma fusão automática/i);
  });

  it("ordenarPorPrioridade leva crítica antes de alta, média, baixa", () => {
    const entrada = [
      { tipo: "duplicidade" as const, prioridade: "baixa" as const, titulo: "d", detalhe: "", acaoRecomendada: "" },
      { tipo: "conflito" as const, prioridade: "critica" as const, titulo: "c", detalhe: "", acaoRecomendada: "" },
      { tipo: "consentimento" as const, prioridade: "media" as const, titulo: "m", detalhe: "", acaoRecomendada: "" },
      { tipo: "lacuna_documental" as const, prioridade: "alta" as const, titulo: "a", detalhe: "", acaoRecomendada: "" },
    ];
    const ordenado = ordenarPorPrioridade(entrada);
    expect(ordenado.map((s) => s.prioridade)).toEqual(["critica", "alta", "media", "baixa"]);
  });
});

describe("D5 Pessoa 360 — rota renderiza bloco Sinais", () => {
  const codigoRota = readFileSync(ROTA, "utf8");

  it("importa sinaisDaPessoa e ordenarPorPrioridade do módulo canônico", () => {
    expect(codigoRota).toMatch(/from "@\/lib\/pessoa-sinais"/);
    expect(codigoRota).toContain("sinaisDaPessoa(");
    expect(codigoRota).toContain("ordenarPorPrioridade(");
  });

  it("marca o bloco com data-pessoa360-sinais para o Lovable achar", () => {
    expect(codigoRota).toContain("data-pessoa360-sinais");
  });

  it("expõe a prioridade em data-attribute (não só em cor)", () => {
    expect(codigoRota).toContain("data-pessoa360-sinal-prioridade=");
  });

  it("mostra estado vazio explícito quando não há sinal, sem inventar alerta", () => {
    expect(codigoRota).toMatch(/Nenhum sinal aberto para esta pessoa/);
  });
});
