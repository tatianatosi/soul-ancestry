import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { normalizarRegistro, registrarResposta } from "@/lib/discovery-registro";
import {
  CONSENTIMENTOS,
  EXTENSOES_PAIS,
  extensoesDoLead,
  pendenciasPosCall,
  validarPosCall,
} from "@/lib/discovery-roteiro-mestre";
import { indicadoresLeads, leadNoIndicador } from "@/lib/crm-vivo-metricas";
import { listaAcoes } from "@/lib/proximas-acoes";
import type { LeadDesk } from "@/lib/crm-desk";

/**
 * CRM Vivo / Painel de Calls / Roteiro Discovery — execução dos documentos da
 * Proprietária de 10–11/08/2026 (27–28/09/2026). Catálogo/SKU é legado; CRM
 * Mestre/OPS não é CRM operacional; o registro canônico é o lead.
 */

const meta = { em: "2026-09-28T10:00:00Z", por: "u1" };
const ler = (p: string) => readFileSync(p, "utf8");

describe("roteiro mestre: resposta narrativa com origem", () => {
  it("grava texto e origem; relida do banco continua igual", () => {
    const r = registrarResposta(normalizarRegistro({}), "ascendente", { texto: "Bisavô Giovanni, de Treviso", origem: "relato_call" }, meta);
    expect(r.ok).toBe(true);
    const relido = normalizarRegistro(JSON.parse(JSON.stringify(r.ok ? r.registro : {})));
    expect(relido.respostas.ascendente).toMatchObject({ texto: "Bisavô Giovanni, de Treviso", origem: "relato_call", nao_sabe: false });
  });

  it("'não sabe / não tem agora' é lacuna registrada, não falha", () => {
    const r = registrarResposta(normalizarRegistro({}), "docs_em_maos", { naoSabe: true }, meta);
    expect(r.ok && r.registro.respostas.docs_em_maos?.nao_sabe).toBe(true);
  });

  it("origem fora da lista é recusada", () => {
    expect(registrarResposta(normalizarRegistro({}), "x", { texto: "a", origem: "inventada" }, meta).ok).toBe(false);
  });
});

describe("extensões por país: 2 a 4 perguntas, sempre 'a validar'", () => {
  it("cada país tem de 2 a 4 perguntas e contexto marcado a validar", () => {
    for (const e of EXTENSOES_PAIS) {
      expect(e.perguntas.length).toBeGreaterThanOrEqual(2);
      expect(e.perguntas.length).toBeLessThanOrEqual(4);
      expect(e.contexto).toMatch(/validar/i);
    }
  });

  it("aparecem pelo país prioritário ou pelos países de interesse — nunca inferidas", () => {
    expect(extensoesDoLead({ pais_linha_prioritaria: null, nacionalidades_interesse: [] } as unknown as LeadDesk)).toEqual([]);
    const paises = extensoesDoLead({ pais_linha_prioritaria: "hungria", nacionalidades_interesse: ["alema"] } as unknown as LeadDesk).map((e) => e.pais);
    expect(paises.sort()).toEqual(["alemanha", "hungria"]);
  });

  it("nenhuma pergunta usa lei como pressão nem promete resultado", () => {
    const texto = EXTENSOES_PAIS.flatMap((e) => e.perguntas.map((p) => p.pergunta)).join(" ");
    expect(texto).not.toMatch(/garant|promet|prazo final|corra|última chance|mata a venda/i);
  });
});

describe("consentimentos separados e pós-call em níveis", () => {
  it("quatro consentimentos distintos", () => {
    expect(CONSENTIMENTOS.map((c) => c.tipo)).toEqual(["contato", "dados", "gravacao", "documentos"]);
  });

  it("pós-call aceita só valores das listas; hipótese de rota nunca é conclusão", () => {
    expect(validarPosCall({ hipotese_rota: "confirmada" }).ok).toBe(false);
    expect(validarPosCall({ hipotese_rota: "depende_de_evidencias", maturidade: "comparando" }).ok).toBe(true);
    expect(validarPosCall({ campo_inventado: "x" }).ok).toBe(false);
  });

  it("nível 1 vale para toda call; nível 2 só quando a call qualificou", () => {
    const lead = { nome: "A" } as LeadDesk;
    const naoQualificada = pendenciasPosCall(lead, {}, {});
    expect(naoQualificada.nivel1.map((p) => p.campo)).toContain("resumo_call");
    expect(naoQualificada.nivel2).toEqual([]);
    const qualificada = pendenciasPosCall(lead, { decisao: "qualificar" }, {});
    expect(qualificada.nivel2.map((p) => p.campo)).toContain("hipotese_rota");
  });

  it("o consentimento de gravação espelha as colunas do lead que a trava da varredura lê", () => {
    const src = ler("src/lib/crm-desk.functions.ts");
    const fn = src.slice(src.indexOf("export const salvarConsentimentosDiscovery"));
    expect(fn).toContain('payload.consentimento_status = g === "sim" ? "concedido"');
    expect(fn).toContain("payload.consentimento_gravacao");
    expect(fn).toContain("gravarComVerificacao");
  });
});

describe("/calls: roteiro vivo, sem forms soltos e sem Desk antes do caso", () => {
  const painel = ler("src/components/crm/painel-calls.tsx");
  it("abertura, bloco SPIN, resposta narrativa, extensões e pós-call estão na Mesa", () => {
    for (const c of ["<AberturaConsentimentos", "<BlocoSpinCard", "<RespostaNarrativa", "<ExtensoesPais", "<FechamentoPosCall", "<DecisoesDiscovery"]) {
      expect(painel).toContain(c);
    }
  });
  it("histórico vem antes do roteiro", () => {
    expect(painel.indexOf("<TrilhaDoLead leadId={lead.id} />")).toBeLessThan(painel.indexOf("<MesaDiscovery\n"));
  });
  it("não cria mais tarefa no caso a partir da próxima ação do lead", () => {
    expect(painel).not.toContain("salvarTarefa");
    expect(painel).not.toContain("Criar/atualizar tarefa desta próxima ação");
  });
  it("lead convertido ou encerrado sai da lista da Mesa", () => {
    expect(painel).toContain("leadForaDoPipeline(");
  });
});

describe("uma só próxima ação, mesmo ID, com link de origem", () => {
  const hoje = new Date("2026-09-28T12:00:00Z");
  const leads = [
    { id: "a", nome: "Ativo", proxima_acao: "ligar", proxima_acao_em: "2026-09-27", responsavel_nome: "T" },
    { id: "b", nome: "Convertido", case_id: "c1", proxima_acao: "ligar", proxima_acao_em: "2026-09-27" },
    { id: "c", nome: "Perdido", eixo_comercial: "perdido", proxima_acao: "ligar", proxima_acao_em: "2026-09-27" },
  ] as unknown as LeadDesk[];

  it("/proximas-acoes lista só leads do pipeline, pelo id do lead", () => {
    expect(listaAcoes(leads, { hoje }).map((l) => l.leadId)).toEqual(["a"]);
  });

  it("/proximas-acoes e Hoje ligam para /calls?lead=<id>", () => {
    expect(ler("src/components/crm/proximas-acoes.tsx")).toContain("search={{ lead: l.leadId }}");
    const painelHoje = ler("src/routes/_authenticated/painel.tsx");
    expect(painelHoje).toContain("data-proximas-acoes-hoje");
    expect(painelHoje).toContain("search={{ lead: l.id }}");
    expect(ler("src/lib/golive.functions.ts")).toContain("!leadForaDoPipeline(l as never)");
  });

  it("indicadores de /leads contam só leads reais do pipeline", () => {
    const r = indicadoresLeads(
      [
        ...leads,
        { id: "t", nome: "Teste", dados_teste: true } as unknown as LeadDesk,
      ] as never,
      hoje,
    );
    expect(r.followup_vencido).toBe(1);
    expect(r.sem_responsavel).toBe(0);
    expect(leadNoIndicador({ id: "x", nome: "x" } as never, "sem_proxima_acao", hoje)).toBe(true);
  });
});

describe("legado fora da linha ativa em /leads", () => {
  const leadsTela = ler("src/routes/_authenticated/leads.tsx");
  it("SKU é só leitura e rotulado legado", () => {
    expect(leadsTela).not.toContain('onChange={set("sku_referencia")}');
    expect(leadsTela).toContain("Legado (catálogo/SKU) — não governa proposta, preço nem escopo.");
  });
  it("dossiê-mãe é só leitura (dono: Núcleo) e país tem um só campo editável", () => {
    expect(leadsTela).not.toContain('onChange={set("dossie_mae_ref")}');
    expect(leadsTela).toContain("Dossiê-mãe é do Núcleo familiar.");
    expect(leadsTela).not.toContain('onChange={set("nacionalidade")}');
  });
  it("via jurídica aparece como hipótese de rota pendente de validação humana", () => {
    expect(leadsTela).toContain("Hipótese de rota — via preliminar (pendente de validação humana)");
  });
});
