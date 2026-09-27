import { describe, expect, it } from "vitest";

import { eventosVisiveisAoCliente, validarAprovacaoEventoCliente, type EventoTimeline } from "@/lib/timeline-caso";

describe("REVERIFICACAO-ADVERSARIAL-GIOVANNA — histórico aprovado para o cliente", () => {
  it("nunca aprova em branco: exige o texto que a família vai ler", () => {
    expect(validarAprovacaoEventoCliente(undefined).valido).toBe(false);
    expect(validarAprovacaoEventoCliente(null).valido).toBe(false);
    expect(validarAprovacaoEventoCliente("   ").valido).toBe(false);
  });

  it("rejeita resumo curto demais para ser um marco compreensível", () => {
    const r = validarAprovacaoEventoCliente("ok");
    expect(r.valido).toBe(false);
    expect(r.motivo).toMatch(/curto/);
  });

  it("aceita um resumo real, preservado com trim ao gravar", () => {
    const r = validarAprovacaoEventoCliente("  Erwin Prade foi conectado à linha paterna Prade.  ");
    expect(r.valido).toBe(true);
    expect(r.motivo).toBeNull();
  });

  it("eventosVisiveisAoCliente só deixa passar visibility=cliente_aprovado com resumo preenchido", () => {
    const eventos: EventoTimeline[] = [
      { event_type: "caso", title: "Status do caso alterado", status: "registrado", visibility: "interno" },
      {
        event_type: "caso",
        title: "Marco de jornada",
        status: "registrado",
        visibility: "cliente_aprovado",
        summary_client_approved: "",
      },
      {
        event_type: "caso",
        title: "Marco de jornada",
        status: "registrado",
        visibility: "cliente_aprovado",
        summary_client_approved: "Erwin Prade foi conectado à linha paterna Prade.",
      },
    ];
    const visiveis = eventosVisiveisAoCliente(eventos);
    expect(visiveis).toHaveLength(1);
    expect(visiveis[0]!.summary_client_approved).toMatch(/Erwin Prade/);
  });
});
