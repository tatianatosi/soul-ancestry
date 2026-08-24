import { describe, expect, it } from "vitest";

import {
  arvoreSanitizada,
  jornadaSanitizada,
  radarSanitizado,
  BLOQUEIOS_CA_PORTAL_02,
} from "@/lib/portal-dados-vivos";
import { visibilidadeTela } from "@/lib/app-visibilidade";
import { EIXOS_RADAR_CANONICOS } from "@/lib/radar-eixos";

const hoje = new Date("2026-08-24T00:00:00Z");

describe("CA-PORTAL-02 — dados vivos sanitizados", () => {
  it("sem publicação, a jornada mantém estado seguro e não inventa progresso", () => {
    const j = jornadaSanitizada([], hoje);
    expect(j.marcosPublicados).toBe(0);
    expect(j.linha).toEqual([]);
    expect(j.proximoPasso).toMatch(/atualização publicada/i);
  });

  it("jornada usa a mesma régua de cadência da equipe, em linguagem humana", () => {
    const antiga = jornadaSanitizada(
      [
        {
          id: "1",
          case_id: "A",
          projection_type: "marco",
          content_sanitized: "Etapa inicial concluída.",
          effective_from: "2026-08-01T00:00:00Z",
        },
      ],
      hoje,
    );
    expect(antiga.marcosPublicados).toBe(1);
    expect(antiga.proximoPasso).not.toMatch(/gate|SLA|alerta|touchpoint/i);
  });

  it("radar mantém exatamente os quatro eixos canônicos", () => {
    const eixos = radarSanitizado({ projecoes: [], documentos: [] });
    expect(eixos.map((e) => e.id)).toEqual(EIXOS_RADAR_CANONICOS.map((e) => e.id));
    expect(eixos.every((e) => e.itens.length === 0)).toBe(true);
  });

  it("radar não conta documento demo e nunca emite parecer na estratégia", () => {
    const eixos = radarSanitizado({
      projecoes: [],
      documentos: [
        { id: "d1", liberado_cliente: true, is_demo: true },
        { id: "d2", liberado_cliente: true, is_demo: false },
        { id: "d3", origem: "cliente", is_demo: false },
      ],
    });
    const docs = eixos.find((e) => e.id === "documentos")!;
    expect(docs.itens).toEqual([
      { rotulo: "Disponíveis para você", valor: "1" },
      { rotulo: "Enviados por você", valor: "1" },
    ]);
    expect(eixos.find((e) => e.id === "estrategia")!.estado).toBe("in_preparation");
  });

  it("árvore só exibe projeção publicada do tipo árvore", () => {
    const itens = arvoreSanitizada([
      { id: "1", projection_type: "arvore", content_sanitized: "Bisavó materna reconhecida." },
      { id: "2", projection_type: "achado", content_sanitized: "Registro localizado." },
    ]);
    expect(itens).toHaveLength(1);
    expect(itens[0]!.conteudo).toMatch(/Bisavó/);
  });

  it("conteúdo com termo interno não atravessa para o cliente", () => {
    const j = jornadaSanitizada([
      { id: "1", projection_type: "marco", content_sanitized: "Hipótese confirmada pela evidência." },
    ]);
    expect(j.linha).toEqual([]);
  });

  it("Fase 02 preserva permiteUpsell false mesmo liberada", () => {
    const r = visibilidadeTela("fase02", {
      temAcesso: true,
      entregasLiberadas: 3,
      fase1Contratada: true,
      fase1Status: "entregue",
      escopoIncluiFase2: true,
      fase2Status: "disponivel",
    });
    expect(r.permiteUpsell).toBe(false);
  });

  it("fontes sem policy de portal permanecem registradas como bloqueio", () => {
    expect(BLOQUEIOS_CA_PORTAL_02.map((b) => b.fonte)).toContain("public.client_deliverables");
  });
});
