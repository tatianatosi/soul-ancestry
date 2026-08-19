import { describe, expect, it } from "vitest";
import { aplicarMapeamento, lerCsv, planejarImportacao, sugerirMapeamento } from "@/lib/migracao-legado";
import { calcularMetricas, validarTransicaoAceite } from "@/lib/conversao";

const csv = [
  "lead_id_placego,nome,email,telefone,origem,data_entrada",
  "P-1,Maria Souza,maria@ex.com,11988887777,instagram,2026-01-10",
  "P-2,João Lima,joao@ex.com,11977776666,meta_ads,2026-01-11",
  "P-2,João Lima,joao@ex.com,11977776666,meta_ads,2026-01-11",
  "P-3,,sem@ex.com,,,",
].join("\n");

describe("importação Placego", () => {
  const { cabecalho, linhas } = lerCsv(csv);
  const registros = aplicarMapeamento(cabecalho, linhas, sugerirMapeamento(cabecalho));

  it("mapeia colunas declaradas sem inventar campos", () => {
    expect(registros).toHaveLength(4);
    expect(registros[0].lead_id_placego).toBe("P-1");
    expect(registros[0].campanha).toBeUndefined();
  });

  it("deduplica por ID legado, e-mail e telefone e rejeita registro sem nome", () => {
    const plano = planejarImportacao(registros, [{ id: "lead-1", nome: "Maria Souza", email: "maria@ex.com", telefone: "11988887777" }], []);
    expect(plano.resumo.duplicado).toBe(2);
    expect(plano.resumo.rejeitado).toBe(1);
    expect(plano.resumo.criar).toBe(1);
  });

  it("marca como atualização quando o ID Placego já está vinculado", () => {
    const plano = planejarImportacao(registros, [], [{ legacy_record_id: "P-1", canonical_record_id: "lead-9" }]);
    expect(plano.linhas[0].acao).toBe("atualizar");
    expect(plano.linhas[0].alvoId).toBe("lead-9");
  });
});

describe("regra de aceite padrão", () => {
  it("aceite verbal não libera preparação de contrato", () => {
    expect(validarTransicaoAceite("formalizacao_em_preparacao", { confirmacaoFormalRecebida: false }).permitido).toBe(false);
  });

  it("onboarding exige contrato assinado e pagamento confirmado", () => {
    expect(validarTransicaoAceite("onboarding_iniciado", { contratoAssinado: true, pagamentoInicialConfirmado: false }).permitido).toBe(false);
    expect(validarTransicaoAceite("onboarding_iniciado", { contratoAssinado: true, pagamentoInicialConfirmado: true }).permitido).toBe(true);
  });

  it("caso ativo exige onboarding mínimo, núcleo e responsável", () => {
    const r = validarTransicaoAceite("caso_ativo", { onboardingMinimoConcluido: false, temNucleoOuDossie: false, temResponsavel: false });
    expect(r.motivos).toHaveLength(3);
  });
});

describe("métricas de conversão", () => {
  it("calcula CPL, CAC e tempo entrada→pagamento", () => {
    const m = calcularMetricas(
      [
        { event_type: "lead_criado", occurred_at: "2026-01-01T00:00:00Z", lead_id: "l1", canal: "meta" },
        { event_type: "lead_qualificado", occurred_at: "2026-01-02T00:00:00Z", lead_id: "l1", canal: "meta" },
        { event_type: "pagamento_inicial_confirmado", occurred_at: "2026-01-11T00:00:00Z", lead_id: "l1", canal: "meta" },
      ],
      [{ valor: 1000, canal: "meta", campaign_id: null }],
      () => "sem campanha",
    );
    expect(m.investimentoTotal).toBe(1000);
    expect(m.cac).toBe(1000);
    expect(m.porCanal[0].cpl).toBe(1000);
    expect(m.tempoMedioEntradaPagamentoDias).toBe(10);
  });
});
