import { describe, expect, it } from "vitest";

import { COMPLEMENTOS_TOP30, acionaComunicacaoAutomatica, efeitosEstruturaisAutomaticos } from "@/lib/catalogo-desk";
import { precoDoServico, validarBlueprint, type Blueprint, type ProdutoBlueprint } from "@/lib/blueprint";
import { montarLinhaDoTempo, TIPOS_EVENTO, type EventoTimeline } from "@/lib/timeline-caso";
import { avaliarFilaDrive, podeTransicionar } from "@/lib/drive-provisioning";

const item = (code: string) => COMPLEMENTOS_TOP30.find((i) => i.code === code)!;

const produtoHomologado: ProdutoBlueprint = {
  ...item("CA-WPP-001"),
  preco_comercial_vigente: 1200,
};

const bpBase: Blueprint = {
  case_service_id: "cs-1",
  escopo_aprovado: "Acompanhamento aprovado na proposta.",
  origem_preco: "product_catalog",
};

describe("Catálogo e Blueprint", () => {
  it("1. produto contextual sem case_service não entra no Blueprint", () => {
    const b = validarBlueprint({ ...bpBase, case_service_id: null }, { produto: { ...item("CA-FAM-001") } });
    expect(b.some((x) => x.codigo === "SEM_CASE_SERVICE")).toBe(true);
  });

  it("2. pacote WhatsApp não gera comunicação automática", () => {
    expect(item("CA-WPP-002").gera_comunicacao_automatica).toBe(false);
    expect(acionaComunicacaoAutomatica("CA-WPP-002")).toBe(false);
  });

  it("3. Familiar Conectado não cria núcleo nem dossiê automaticamente", () => {
    expect(efeitosEstruturaisAutomaticos("CA-FAM-001")).toEqual({
      criaNucleo: false,
      criaDossie: false,
      criaAcompanhamentoProcesso: false,
    });
  });

  it("4. preço manual é bloqueado", () => {
    const b = validarBlueprint({ ...bpBase, preco_comercial_vigente: 999 }, { produto: produtoHomologado });
    expect(b.some((x) => x.codigo === "PRECO_MANUAL_BLOQUEADO")).toBe(true);
    const ok = validarBlueprint({ ...bpBase, preco_comercial_vigente: 1200 }, { produto: produtoHomologado });
    expect(ok).toEqual([]);
  });

  it("5. Blueprint com preço sem catálogo homologado é bloqueado", () => {
    const b = validarBlueprint({ ...bpBase, preco_comercial_vigente: 500 }, { produto: { ...item("CA-ASS-001") } });
    expect(b.some((x) => x.codigo === "PRODUTO_EM_REVISAO")).toBe(true);
    expect(b.some((x) => x.codigo === "PRECO_SEM_CATALOGO_HOMOLOGADO")).toBe(true);
  });

  it("6. despesa de terceiro não soma ao preço do serviço", () => {
    const r = precoDoServico({ ...bpBase, preco_comercial_vigente: 1200 }, [800, 300]);
    expect(r.preco).toBe(1200);
    expect(r.despesas).toBe(1100);
  });
});

describe("Linha do tempo operacional", () => {
  it("7. evento aparece no caso sem duplicar o Roteiro Master", () => {
    const eventos: EventoTimeline[] = [
      { event_type: "discovery", title: "Discovery realizada", status: "registrado", occurred_at: "2026-08-10T12:00:00Z" },
      {
        event_type: "contrato",
        title: "Contrato em preparação",
        status: "previsto",
        due_at: "2026-08-25T12:00:00Z",
        next_action: "Conferir páginas 1–7 da proposta",
        responsavel_nome: "Tatiana Tosi",
      },
      { event_type: "pagamento", title: "Pagamento inicial", status: "bloqueado", bloqueio: true, alerta: "Contrato não assinado" },
    ];
    const t = montarLinhaDoTempo(eventos, new Date("2026-08-20T00:00:00Z"));
    expect(t.passado).toHaveLength(1);
    expect(t.proximosMarcos[0]?.event_type).toBe("contrato");
    expect(t.bloqueios).toHaveLength(1);
    expect(t.alertas.join(" ")).toContain("Contrato não assinado");
    expect(t.responsaveis).toEqual(["Tatiana Tosi"]);
    // Roteiro Master não vira evento: só Discovery/Brief alimentam a timeline.
    expect(TIPOS_EVENTO.some((x) => x.valor.includes("roteiro"))).toBe(false);
  });
});

describe("Fila de provisionamento Drive", () => {
  it("8. fila fica bloqueada em Oportunidade", () => {
    const r = avaliarFilaDrive("oportunidade", { contrato_assinado: true, pagamento_confirmado: true, onboarding_aprovado: true });
    expect(r.status).toBe("blocked");
    expect(r.executaDrive).toBe(false);
  });

  it("9. fila fica pronta só depois dos gates, sem executar Drive", () => {
    const parcial = avaliarFilaDrive("contrato_assinado", { contrato_assinado: true });
    expect(parcial.status).toBe("blocked");

    const pronta = avaliarFilaDrive("onboarding_aprovado", {
      contrato_assinado: true,
      pagamento_confirmado: true,
      onboarding_aprovado: true,
    });
    expect(pronta.status).toBe("ready_for_review");
    expect(pronta.executaDrive).toBe(false);

    expect(podeTransicionar("ready_for_review", "approved", {}).ok).toBe(false);
    expect(podeTransicionar("ready_for_review", "approved", { aprovadoPor: "Tatiana Tosi" }).ok).toBe(true);
    expect(podeTransicionar("approved", "executed", { resultadoExterno: "" }).ok).toBe(false);
    expect(podeTransicionar("approved", "executed", { resultadoExterno: "drive://ref" }).ok).toBe(true);
  });

  it("confirmação formal só cria item bloqueado", () => {
    expect(avaliarFilaDrive("confirmacao_formal", { contrato_assinado: true, pagamento_confirmado: true }).status).toBe("blocked");
  });
});
