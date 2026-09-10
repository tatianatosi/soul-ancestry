import { describe, expect, it } from "vitest";
import { gatesAtivacaoFicha, estadoDerivadoPorGates } from "@/lib/gates-ativacao-ficha";

// Linha real do caso CA-CID-AT-FAM-2026-001 (Ana Luiza) em 05/09/2026.
const ana = {
  id: "a11a0000-0000-4000-8000-000000000002",
  contrato_assinado: false,
  pagamento_confirmado: false,
  documentos_minimos_ok: false,
  condicoes_verificadas_em: null,
  proposta_referencia_interna: null,
  escopo_incluido_resumido: null,
  escopo_excluido_resumido: null,
  marcos_gerais_da_proposta: null,
  preparacao_status: null,
  situacao_financeira: null,
  ativado_em: null,
  ativacao_operacional: null,
};

// Os 14 requisitos validados a mao no banco em 04/09/2026.
const checks = [
  "proposta_aprovada_ou_isencao_autorizada",
  "contrato_assinado_ou_isencao_autorizada",
  "pagamento_confirmado_ou_condicao_financeira_autorizada",
  "ambiente_acesso_definido",
  "aprovacao_interna_ativacao",
  "checklist_documental_e_plano_preparados",
  "cliente_identificado",
  "consentimento_registrado",
  "dossie_mae_criado",
  "escopo_definido",
  "nucleo_familiar_conferido",
  "ordem_de_servico_criada",
  "primeira_tarefa_criada",
  "responsavel_designado",
].map((check_key) => ({ check_key, status: "validado" }));

describe("caso Ana Luiza — ativacao", () => {
  it("ANTES: sem ler os requisitos validados, a ficha bloqueia", () => {
    const g = gatesAtivacaoFicha(ana);
    const abertos = g.filter((x) => !x.ok);
    expect(abertos.length).toBeGreaterThan(0);
  });

  it("DEPOIS: lendo os 14 requisitos validados, os gates correspondentes passam", () => {
    const g = gatesAtivacaoFicha(ana, checks);
    const mapa = Object.fromEntries(g.map((x) => [x.chave, x.ok]));
    expect(mapa["assinatura"]).toBe(true);
    expect(mapa["pagamento_confirmado"]).toBe(true);
    expect(mapa["aprovacao_ativacao"]).toBe(true);
    expect(mapa["escopo_sku_preco"]).toBe(true);
    expect(mapa["canva_completo"]).toBe(true);
    expect(mapa["instrumentos_preparados"]).toBe(true);
  });

  it("o estado derivado deixa de dizer bloqueado", () => {
    const antes = estadoDerivadoPorGates(ana);
    const depois = estadoDerivadoPorGates(ana, checks);
    expect(JSON.stringify(depois)).not.toBe(JSON.stringify(antes));
  });
});
