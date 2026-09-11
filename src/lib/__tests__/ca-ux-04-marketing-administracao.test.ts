/**
 * CA-UX-04 — Marketing como 2º grupo e Administração no menu da conta.
 * Testes de leitura estática: nenhuma ação externa, dado ou migration.
 */
import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { GRUPOS_DESK, rotasDoMenuConta } from "@/lib/navegacao-desk";
import {
  CAMADAS_WHATSAPP,
  CATALOGO_ORIGENS,
  METRICAS_PRINCIPAIS_MARKETING,
  ORIGEM_A_CONFIRMAR,
  SEM_DADOS,
  TETO_METRICAS_MARKETING,
  VAZIOS_MARKETING,
  classificarOrigem,
  distribuicaoOrigens,
  leituraMetricas,
  separarMetricas,
} from "@/lib/marketing-aquisicao";

const ler = (p: string) => readFileSync(p, "utf8");
const ORDEM = ["hoje", "comercial", "casos", "pesquisa", "contratos", "governanca"];

describe("CA-UX-04 — navegação", () => {
  it("tem exatamente 6 grupos; Marketing mora em Marketing & Comercial", () => {
    expect(GRUPOS_DESK).toHaveLength(6);
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual(ORDEM);
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    expect(comercial.sub.some((s) => "to" in s && s.to === "/marketing")).toBe(true);
  });

  it("não expõe Administração como id próprio — mora em Governança", () => {
    expect(GRUPOS_DESK.some((g) => g.id === "administracao")).toBe(false);
    expect(GRUPOS_DESK.some((g) => g.id === "governanca")).toBe(true);
  });

  it("mantém rotas administrativas em Governança, com permissão preservada", () => {
    expect(rotasDoMenuConta()).toEqual([]);
    const gov = GRUPOS_DESK.find((g) => g.id === "governanca")!;
    expect(gov.sub.some((s) => "to" in s && s.to === "/app-cliente-demo")).toBe(true);
    const rotas = gov.sub.filter((s) => "to" in s).map((s) => s.to);
    for (const r of ["/equipe", "/configuracoes", "/etiquetas"]) {
      expect(rotas).toContain(r);
    }
    const equipe = gov.sub.find((i) => "to" in i && i.to === "/equipe") as { adminOnly?: boolean };
    expect(equipe.adminOnly).toBe(true);
  });

  it("mantém Integrações em Governança, não na Inteligência", () => {
    const gov = GRUPOS_DESK.find((g) => g.id === "governanca")!;
    expect(gov.sub.some((s) => "to" in s && s.to === "/integracoes")).toBe(true);
    const pesquisa = GRUPOS_DESK.find((g) => g.id === "pesquisa")!;
    expect(pesquisa.sub.some((s) => "to" in s && s.to === "/integracoes")).toBe(false);
    expect(rotasDoMenuConta()).not.toContain("/integracoes");
  });

  it("rotas administrativas e Marketing vivem sob _authenticated (cliente não acessa)", () => {
    for (const f of [
      "src/routes/_authenticated/marketing.tsx",
      "src/routes/_authenticated/equipe.tsx",
      "src/routes/_authenticated/configuracoes.tsx",
    ]) {
      expect(existsSync(f)).toBe(true);
    }
  });
});

describe("CA-UX-04 — Marketing não é Comercial", () => {
  const pagina = ler("src/routes/_authenticated/marketing.tsx");

  it("não cria CRM paralelo nem lista duplicada de leads", () => {
    expect(pagina).not.toMatch(/criarLead|salvarLead|atualizarLead|novaProposta/);
    expect(pagina).toContain('to="/leads"');
    expect(pagina).toContain('to="/conversao"');
  });

  it("não replica funil detalhado, saúde ou higiene comercial", () => {
    expect(pagina).not.toContain("montarFunil");
    expect(pagina).not.toContain("montarSaude");
    expect(pagina).not.toContain("Higiene comercial");
  });

  it("não cria dado demo, campanha, UTM, formulário ou anúncio", () => {
    expect(pagina).not.toMatch(/is_demo:\s*true|seed|insert\(/i);
  });
});

describe("CA-UX-04 — origem, atribuição e estados vazios", () => {
  it("origem fora do catálogo vira origem_a_confirmar sem alterar o dado", () => {
    expect(classificarOrigem("indicacao").canonico).toBe("indicacao");
    const livre = classificarOrigem("veio pelo grupo do zap");
    expect(livre.canonico).toBe(ORIGEM_A_CONFIRMAR);
    expect(livre.bruto).toBe("veio pelo grupo do zap");
    expect(classificarOrigem(null).canonico).toBe(ORIGEM_A_CONFIRMAR);
    expect(CATALOGO_ORIGENS.length).toBeGreaterThan(0);
    const dist = distribuicaoOrigens([{ origem: "manual" }, { origem: "xpto" }, { origem: null }]);
    expect(dist.find((d) => d.canonico === ORIGEM_A_CONFIRMAR)!.total).toBe(2);
  });

  it("expõe os textos de estado vazio aprovados", () => {
    const pagina = ler("src/routes/_authenticated/marketing.tsx");
    for (const t of Object.values(VAZIOS_MARKETING)) expect(t.length).toBeGreaterThan(10);
    expect(VAZIOS_MARKETING.campanhas).toBe("Ainda não há campanhas cadastradas.");
    expect(VAZIOS_MARKETING.cacRoi).toBe(
      "CAC, ROI e ROAS exigem investimento classificado e atribuição confiável.",
    );
    for (const chave of [
      "campanhas",
      "investimento",
      "atribuicao",
      "cac-roi",
      "captura",
      "whatsapp",
      "handoff",
    ]) {
      expect(pagina).toContain(`data-marketing-vazio="${chave}"`);
    }
  });
});

describe("CA-UX-04 — métricas e WhatsApp", () => {
  const vazio = {
    leads: [],
    eventos: [],
    investimentos: [],
    campanhas: [],
    fontes: [],
    atribuicoes: [],
  };

  it("CAC, ROI e ROAS não retornam número sem dados suficientes", () => {
    const leitura = leituraMetricas(vazio);
    for (const chave of ["cac", "roi"]) {
      const m = leitura.find((x) => x.chave === chave)!;
      expect(m.valor).toBe(SEM_DADOS);
      expect(m.confianca).toBe("sem_dados");
    }
  });

  it("respeita o teto de 5 métricas principais e manda o resto para Histórico e análise", () => {
    const { principais, historico } = separarMetricas(leituraMetricas(vazio));
    expect(principais.length).toBeLessThanOrEqual(TETO_METRICAS_MARKETING);
    expect(principais.map((m) => m.chave)).toEqual([...METRICAS_PRINCIPAIS_MARKETING]);
    expect(historico.length).toBeGreaterThan(0);
    const pagina = ler("src/routes/_authenticated/marketing.tsx");
    expect(pagina).toContain('data-marketing="historico"');
    expect(pagina).not.toMatch(/<details[^>]*data-marketing="historico"[^>]*open/);
  });

  it("mantém as cinco camadas de WhatsApp com envio externo desligado", () => {
    expect(CAMADAS_WHATSAPP).toHaveLength(5);
    const externo = CAMADAS_WHATSAPP.find((c) => c.natureza === "externo")!;
    expect(externo.estado).toBe("ausente");
  });
});

describe("CA-UX-04 — artefatos", () => {
  it("documentos obrigatórios existem e refletem a decisão", () => {
    const doc = ler("docs/arquitetura/CA-UX-04_Marketing_e_Administracao.md");
    expect(doc).toContain("Marketing");
    expect(doc).toContain("/integracoes` **permanece em Governança");
    const csv = ler("docs/arquitetura/CA-UX-04_Matriz_Marketing_Comercial.csv");
    expect(csv.split("\n")[0]).toBe(
      "entidade_ou_indicador;fonte_canonica;grupo;tipo;quando_entra_em_comercial;permissao;pode_criar_registro;pode_enviar_externamente;estado_sem_dado;observacao",
    );
    expect(ler("docs/changelog/2026-08-23_CA-UX-04.md")).toContain("Marketing como 2º grupo");
    expect(ler("docs/ux/CA-UX-03_Fontes_Canonicas_Indicadores.md")).toContain(
      "## Marketing (CA-UX-04)",
    );
  });
});
