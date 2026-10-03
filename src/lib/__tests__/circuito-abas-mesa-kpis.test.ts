/**
 * Circuito mínimo Desk: Abas → Mesa Discovery → KPIs.
 * Classifica onde cada peça vive — não cria tela nova. PT-BR.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { GRUPOS_DESK } from "@/lib/navegacao-desk";
import {
  decidirClienteDoHandoff,
  podeExecutarHandoffDiscovery,
  tipoServicoDoLead,
  tituloCasoDoLead,
} from "@/lib/handoff-discovery";
import type { LeadDesk } from "@/lib/crm-desk";

const ler = (p: string) => readFileSync(p, "utf8");

describe("Abas — circuito nas seis áreas (sem tela nova)", () => {
  it("Desk tem exatamente 6 grupos e Calls mora em Marketing & Comercial", () => {
    expect(GRUPOS_DESK).toHaveLength(7);
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial");
    expect(comercial?.label).toBe("Comercial");
    expect(comercial?.sub.some((i) => "to" in i && i.to === "/calls")).toBe(true);
  });

  it("Hoje aponta para /painel e não hospeda Calls na face", () => {
    const hoje = GRUPOS_DESK.find((g) => g.id === "hoje");
    expect(hoje?.to).toBe("/painel");
    expect(hoje?.sub.some((i) => "to" in i && i.to === "/calls")).toBe(false);
  });

  it("Pessoas & Casos recebe o destino do handoff (/casos, /clientes)", () => {
    const casos = GRUPOS_DESK.find((g) => g.id === "casos");
    expect(casos?.sub.some((i) => "to" in i && i.to === "/casos")).toBe(true);
    // V4: /clientes é Pessoa 360, no grupo Pessoas & Famílias.
    const pessoas = GRUPOS_DESK.find((g) => g.id === "pessoas");
    expect(pessoas?.sub.some((i) => "to" in i && i.to === "/clientes")).toBe(true);
  });
});

describe("Mesa Discovery — handoff cria/reusa pessoa+caso sem redigitar", () => {
  const base: LeadDesk = {
    nome: "Ana Teste",
    email: "ana.teste@example.com",
    telefone: "11999990000",
    discovery_resultado: "aderente",
    resumo_validado: true,
    responsavel_nome: "Closer",
    proxima_acao: "Enviar diagnóstico",
    proxima_acao_em: "2026-09-12",
    objetivo: "Cidadania italiana",
    pais_linha_prioritaria: "Itália",
    via_juridica_preliminar: "jus_sanguinis",
    nacionalidades_interesse: ["italiana"],
    status_call: "realizada",
    call_realizada_em: "2026-09-10T12:00:00Z",
  };

  it("e-mail confirmado reusa cliente; telefone pede confirmação; sem elo cria", () => {
    const reuso = decidirClienteDoHandoff(base, [
      { id: "c1", nome: "Ana Outra", email: "ana.teste@example.com", telefone: null },
    ]);
    expect(reuso.acao).toBe("reusar");

    const conf = decidirClienteDoHandoff(
      { nome: "Ana", email: null, telefone: "11999990000" },
      [{ id: "c2", nome: "Familiar", email: null, telefone: "11999990000" }],
    );
    expect(conf.acao).toBe("confirmar");

    const criar = decidirClienteDoHandoff(base, [
      { id: "c3", nome: "Outra Pessoa", email: "x@y.com", telefone: "11000000000" },
    ]);
    expect(criar.acao).toBe("criar");
  });

  it("tipo e título do caso saem do lead — sem ficha paralela", () => {
    expect(tipoServicoDoLead(base)).toBe("cidadania");
    expect(tituloCasoDoLead(base)).toContain("Ana Teste");
    expect(tituloCasoDoLead(base)).toContain("Itália");
  });

  it("escritor de handoff existe e grava case_id + clientes + crm_casos", () => {
    const fn = ler("src/lib/handoff-discovery.functions.ts");
    expect(fn).toContain("executarHandoffDiscovery");
    expect(fn).toContain('tabela: "clientes"');
    expect(fn).toContain('from("crm_casos")');
    expect(fn).toContain("case_id");
    expect(fn).toContain("diagnostico_em_elaboracao");
    // Guard do banco: case_id só com estágio ganho (abertura formal).
    expect(fn).toContain("promoverLeadParaGanho");
    expect(fn).toContain('estagio: "ganho"');
    expect(fn).not.toMatch(/create table|nova_tabela/i);
  });

  it("Painel de Calls chama o handoff real — não só muda eixo_comercial", () => {
    const ui = ler("src/components/crm/painel-calls.tsx");
    expect(ui).toContain("executarHandoffDiscovery");
    expect(ui).toContain("Concluir handoff");
  });
});

describe("KPIs — deep-link Hoje → lead no Painel de Calls", () => {
  it("rota /calls aceita ?lead= e o Painel seleciona o registro", () => {
    const rota = ler("src/routes/_authenticated/calls.tsx");
    const ui = ler("src/components/crm/painel-calls.tsx");
    expect(rota).toContain("validateSearch");
    expect(rota).toMatch(/lead/);
    expect(ui).toContain("leadIdInicial");
  });

  it("itens de lead no Painel Hoje apontam para /calls?lead=", () => {
    const painel = ler("src/components/painel/painel-dia.tsx");
    // JSX: search={{ lead: item.id }}
    expect(painel).toMatch(/search=\{\{\s*lead:/);
  });
});

describe("podeExecutarHandoffDiscovery — destino proposta", () => {
  it("lead já com case_id passa (reusa)", () => {
    const r = podeExecutarHandoffDiscovery({
      nome: "X",
      case_id: "00000000-0000-0000-0000-000000000001",
    });
    expect(r.ok).toBe(true);
  });
});
