import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  agruparFamiliaPorNucleo,
  fatosComerciaisDaPessoa,
  formatarValorProposta,
  leadEhWhatsApp,
  leadTemDiscovery,
  montarLinhaDoTempoDoCliente,
  rotuloPapelNucleo,
} from "../pessoa-360-cards";

describe("classificar lead WhatsApp e Discovery", () => {
  it("WhatsApp só pela origem canônica do catálogo, não por texto solto", () => {
    expect(leadEhWhatsApp({ origem: "whatsapp" })).toBe(true);
    expect(leadEhWhatsApp({ origem: "formulario", consentimento_canal: "whatsapp" })).toBe(true);
    expect(leadEhWhatsApp({ origem: "indicacao" })).toBe(false);
    expect(leadEhWhatsApp({ origem: "conversa no zap" })).toBe(false);
  });

  it("Discovery é call ou resultado gravado — SPIN checkbox não conta", () => {
    expect(leadTemDiscovery({ discovery_resultado: "aderente" })).toBe(true);
    expect(leadTemDiscovery({ call_realizada_em: "2026-08-10T14:00:00Z" })).toBe(true);
    expect(leadTemDiscovery({ resumo_call: "Família italiana pelo bisavô." })).toBe(true);
    expect(leadTemDiscovery({})).toBe(false);
  });
});

describe("núcleo familiar em cards", () => {
  it("agrupa membros pelo núcleo e preserva papel canônico", () => {
    const grupos = agruparFamiliaPorNucleo(
      [{ id: "n1", nome: "Família Ana" }],
      [
        { id: "m1", nucleo_id: "n1", nome: "Ana", papel: "contratante_signatario" },
        { id: "m2", nucleo_id: "n1", nome: "Felipe", papel: "dependente" },
      ],
    );
    expect(grupos).toHaveLength(1);
    expect(grupos[0].nucleo.nome).toBe("Família Ana");
    expect(grupos[0].membros.map((m) => m.nome)).toEqual(["Ana", "Felipe"]);
    expect(rotuloPapelNucleo("contratante_signatario")).toBe("Contratante signatário");
    expect(rotuloPapelNucleo("requerente")).toBe("Requerente");
  });
});

describe("linha do tempo do cliente junta as fontes", () => {
  it("mistura caso, lead WhatsApp, Discovery, proposta, contrato e achado", () => {
    const linha = montarLinhaDoTempoDoCliente({
      casos: [
        {
          id: "caso-1",
          casoCodigo: "CA-ANA-001",
          casoTitulo: "Ana",
          eventos: [{ occurred_at: "2026-08-20T10:00:00Z", title: "Caso aberto" }],
        },
      ],
      leads: [
        {
          id: "lead-1",
          origem: "whatsapp",
          created_at: "2026-08-01T12:00:00Z",
          call_realizada_em: "2026-08-05T15:00:00Z",
          discovery_resultado: "aderente",
          case_id: "caso-1",
        },
      ],
      propostas: [{ id: "p1", case_id: "caso-1", status: "enviada", valor: 4800, created_at: "2026-08-08T10:00:00Z", enviada_em: "2026-08-08T12:00:00Z" }],
      contratos: [{ id: "c1", case_id: "caso-1", status: "signed", signed_at: "2026-08-12T10:00:00Z" }],
      achados: [{ id: "a1", case_id: "caso-1", title: "Bisavô em Vicenza", found_at: "2026-08-18T10:00:00Z", validation_status: "confirmado" }],
      touchpointsWhatsapp: [{ id: "t1", caso_id: "caso-1", ocorrido_em: "2026-08-02T09:00:00Z", resumo: "Primeiro toque" }],
    });
    const titulos = linha.eventos.map((e) => e.titulo);
    expect(titulos).toContain("Lead WhatsApp");
    expect(titulos).toContain("Discovery realizada");
    expect(titulos).toContain("WhatsApp");
    expect(titulos).toContain("Proposta enviada");
    expect(titulos).toContain("Contrato assinado");
    expect(titulos).toContain("Bisavô em Vicenza");
    expect(titulos).toContain("Caso aberto");
    expect(linha.eventos[0].titulo).toBe("Lead WhatsApp");
  });

  it("não descarta fato sem data em silêncio", () => {
    const extra = fatosComerciaisDaPessoa({
      leads: [{ id: "x", origem: "whatsapp" }],
      propostas: [],
      contratos: [],
      achados: [],
      touchpointsWhatsapp: [],
    });
    expect(extra.eventos).toEqual([]);
    expect(extra.semData).toBe(1);
  });

  it("formata valor da proposta em real", () => {
    expect(formatarValorProposta(4800, "BRL")).toMatch(/4\.800/);
    expect(formatarValorProposta(null)).toBeNull();
  });
});

describe("Pessoa 360 — loader e cards no runtime", () => {
  const fn = readFileSync("src/lib/pessoa.functions.ts", "utf8");
  const rota = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");
  const mapa = readFileSync("src/components/pessoa/mapa-pessoa-360.tsx", "utf8");

  it("lê núcleo, achados, evidências e WhatsApp nas tabelas reais", () => {
    expect(fn).toContain('.from("nucleos_familiares")');
    expect(fn).toContain('.from("genealogical_findings")');
    expect(fn).toContain('.from("evidences")');
    expect(fn).toContain('.from("touchpoints")');
    expect(fn).toContain('.eq("canal", "whatsapp")');
    expect(fn).toContain("consentimento_canal");
    expect(fn).toContain("discovery_resultado");
    expect(fn).not.toMatch(/citizenship_cases|case_participants/);
  });

  it("mostra os oito cards mesmo vazios, sem esconder pesquisa", () => {
    for (const titulo of [
      "Núcleo familiar",
      "Pesquisa genealógica",
      "Achados",
      "Proposta",
      "Contrato",
      "Discovery",
      "Lead WhatsApp",
      "Linha do tempo do cliente",
    ]) {
      expect(mapa).toContain(`titulo="${titulo}"`);
    }
    expect(mapa).toContain("Ainda não há ficha genealógica ligada aos casos desta pessoa");
    expect(rota).toContain("MapaPessoa360");
    expect(rota).not.toContain("fichaGenealogica.length > 0 ||");
  });

  it("Discovery abre a Mesa com o lead, não um CRM paralelo", () => {
    expect(mapa).toContain('to="/calls"');
    expect(mapa).toContain("search={{ lead:");
  });
});
