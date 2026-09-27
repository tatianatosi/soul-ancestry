import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  blocosSpinFechados,
  consentimentoTranscricao,
  normalizarRegistro,
  registrarBloco,
  registrarSugestao,
  situacaoBlocos,
} from "@/lib/discovery-registro";
import { autorEhDaCasa, formatoDaConversa, varrerConversa } from "@/lib/varredura-whatsapp";
import { etapaPipeline, leadForaDoPipeline, type LeadDesk } from "@/lib/crm-desk";
import { PERGUNTAS_MESA } from "@/lib/discovery-roteiro";

/**
 * Mesa Discovery como camada viva do CRM (autorização explícita da
 * Proprietária, 27/09/2026 — "EXECUTE EM MAIN"): o que antes vivia só na
 * memória da tela passa a ser gravado no lead canônico, com origem.
 */

const meta = { em: "2026-09-27T12:00:00Z", por: "u1" };
const ler = (p: string) => readFileSync(p, "utf8");

describe("transcrição: WhatsApp e 'Pessoa: texto', fala do consultor ignorada", () => {
  const whats = "[10/08/2026, 14:35] Ana Luiza: meu bisavô era italiano\n[10/08/2026, 14:36] Tatiana: você tem passaporte?";
  const transcricao = "Consultor: Você tem passaporte italiano?\nAna: Tenho a certidão de nascimento do meu bisavô, ele era da Itália.";

  it("detecta o formato de origem de cada conversa", () => {
    expect(formatoDaConversa(whats)).toBe("whatsapp");
    expect(formatoDaConversa(transcricao)).toBe("transcricao");
  });

  it("fala marcada como Consultor nunca vira achado, sem precisar digitar nomes", () => {
    const r = varrerConversa(transcricao);
    const valores = r.achados.map((a) => a.valor);
    expect(valores).not.toContain("passaporte");
    expect(valores).toContain("certidão de nascimento");
    expect(r.achados.every((a) => a.autor === "Ana")).toBe(true);
  });

  it("rótulos de papel da casa são reconhecidos com ou sem acento; o prospect não", () => {
    for (const casa of ["Consultor", "consultora", "Atendente", "Equipe Clube Ancestral", "Assessora (Bia)"]) {
      expect(autorEhDaCasa(casa)).toBe(true);
    }
    expect(autorEhDaCasa("Ana Luiza")).toBe(false);
    expect(autorEhDaCasa("Tatiana Tosi", ["Tatiana"])).toBe(true);
  });
});

describe("sugestão aceita/rejeitada fica registrada, com origem", () => {
  const origem = { fonte: "transcricao" as const, autor: "Ana", trecho: "ele era da Itália", data: null };

  it("registra decisão com fonte, autor e trecho; decidir de novo substitui", () => {
    const r1 = registrarSugestao(normalizarRegistro({}), { campo: "nacionalidades_interesse", valor: "italiana", decisao: "aceita", origem }, meta);
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    expect(r1.sugestao.origem).toEqual({ fonte: "transcricao", autor: "Ana", trecho: "ele era da Itália", data: null });
    const r2 = registrarSugestao(r1.registro, { campo: "nacionalidades_interesse", valor: "italiana", decisao: "rejeitada", origem }, meta);
    expect(r2.ok && r2.registro.sugestoes).toHaveLength(1);
    expect(r2.ok && r2.registro.sugestoes[0].decisao).toBe("rejeitada");
  });

  it("o registro relido do banco (reload) preserva as decisões", () => {
    const r = registrarSugestao(normalizarRegistro(null), { campo: "documentos_chave", valor: "nascimento", decisao: "hipotese", origem }, meta);
    const relido = normalizarRegistro(JSON.parse(JSON.stringify(r.ok ? r.registro : {})));
    expect(relido.sugestoes[0]).toMatchObject({ campo: "documentos_chave", valor: "nascimento", decisao: "hipotese" });
  });

  it("o escritor do servidor grava decisão + valor no lead e audita com a origem", () => {
    const src = ler("src/lib/crm-desk.functions.ts");
    const fn = src.slice(src.indexOf("export const decidirSugestaoDiscovery"), src.indexOf("/**\n * P2 CRM Vivo (24/09/2026): trilha do lead"));
    expect(fn).toContain("gravarComVerificacao");
    expect(fn).toContain("discovery_registro: r.registro");
    expect(fn).toContain("errosBloqueantesAlteracao");
    expect(fn).toContain("`discovery_sugestao_${data.decisao}`");
    expect(fn).toContain("origem: r.sugestao.origem");
  });

  it("aceitar não cria caso, pesquisa, hipótese jurídica, produto/SKU, preço, proposta, contrato, cobrança ou acesso ao App", () => {
    const src = ler("src/lib/crm-desk.functions.ts");
    const fn = src.slice(src.indexOf("export const decidirSugestaoDiscovery"), src.indexOf("/**\n * P2 CRM Vivo (24/09/2026): trilha do lead"));
    for (const t of ["crm_casos", "research_", "product_catalog", "proposals", "contracts", "invoices", "client_portal_access", "app_projections"]) {
      expect(fn).not.toContain(`from("${t}`);
    }
  });

  it("/calls liga Aceitar/Rejeitar ao escritor real (não só ao rascunho)", () => {
    const src = ler("src/components/crm/painel-calls.tsx");
    expect(src).toContain('decisao: "aceita"');
    expect(src).toContain('decisao: "rejeitada"');
    expect(src).toContain("decidirSugestaoDiscovery");
  });
});

describe("4 blocos SPIN: completos ou dispensados com motivo", () => {
  const leadCompleto = Object.fromEntries(PERGUNTAS_MESA.flatMap((p) => p.campos.map((c) => [c, "x"]))) as unknown as LeadDesk;

  it("dispensar sem motivo é recusado; com motivo fica registrado", () => {
    const sem = registrarBloco(normalizarRegistro({}), "problema", { dispensado: true, motivo: "" }, meta);
    expect(sem.ok).toBe(false);
    const com = registrarBloco(normalizarRegistro({}), "problema", { dispensado: true, motivo: "Lead só quer memória familiar" }, meta);
    expect(com.ok && com.registro.blocos.problema).toMatchObject({ dispensado: true, motivo_dispensa: "Lead só quer memória familiar" });
  });

  it("nota opcional por bloco é gravada e relida", () => {
    const r = registrarBloco(normalizarRegistro({}), "situacao", { nota: "Mãe já tem certidão" }, meta);
    const relido = normalizarRegistro(JSON.parse(JSON.stringify(r.ok ? r.registro : {})));
    expect(relido.blocos.situacao?.nota).toBe("Mãe já tem certidão");
  });

  it("fecha quando os 4 blocos estão completos ou dispensados", () => {
    expect(blocosSpinFechados({ nome: "A" } as LeadDesk, normalizarRegistro({}))).toBe(false);
    expect(blocosSpinFechados(leadCompleto, normalizarRegistro({}))).toBe(true);
    let reg = normalizarRegistro({});
    for (const b of ["situacao", "problema", "implicacao", "necessidade"] as const) {
      const r = registrarBloco(reg, b, { dispensado: true, motivo: "Call curta, retomar" }, meta);
      if (r.ok) reg = r.registro;
    }
    expect(situacaoBlocos({ nome: "A" } as LeadDesk, reg).every((b) => b.estado === "dispensado")).toBe(true);
    expect(blocosSpinFechados({ nome: "A" } as LeadDesk, reg)).toBe(true);
  });
});

describe("consentimento separado e obrigatório para transcrição", () => {
  it("só libera com consentimento concedido; recusado bloqueia com motivo", () => {
    expect(consentimentoTranscricao(null).liberado).toBe(false);
    expect(consentimentoTranscricao({ consentimento_status: "pendente" } as LeadDesk).liberado).toBe(false);
    expect(consentimentoTranscricao({ consentimento_status: "recusado" } as LeadDesk).motivo).toContain("recusou");
    expect(consentimentoTranscricao({ consentimento_status: "concedido" } as LeadDesk).liberado).toBe(true);
  });

  it("/calls passa a trava para a varredura", () => {
    expect(ler("src/components/crm/painel-calls.tsx")).toContain("bloqueio={consentimento.motivo}");
    expect(ler("src/components/crm/varredura-whatsapp.tsx")).toContain("data-varredura-bloqueada");
  });
});

describe("CRM Vivo: pipeline Leads → Discovery → Diagnóstico → Proposta → Contrato", () => {
  it("etapa do pipeline vem dos eixos existentes", () => {
    expect(etapaPipeline({ eixo_comercial: "novo_lead" })).toBe("leads");
    expect(etapaPipeline({ eixo_comercial: "discovery_realizada" })).toBe("discovery");
    expect(etapaPipeline({ eixo_comercial: "diagnostico_em_elaboracao" })).toBe("diagnostico");
    expect(etapaPipeline({ eixo_comercial: "proposta_enviada" })).toBe("proposta");
    expect(etapaPipeline({ eixo_comercial: "aceite_verbal", eixo_formalizacao: "contrato_enviado" })).toBe("contrato");
  });

  it("lead convertido em caso, cliente ativo ou encerrado sai do pipeline", () => {
    expect(leadForaDoPipeline({ case_id: "c1" })).toBe(true);
    expect(leadForaDoPipeline({ eixo_formalizacao: "cliente_ativo" })).toBe(true);
    expect(leadForaDoPipeline({ eixo_comercial: "perdido" })).toBe(true);
    expect(leadForaDoPipeline({ eixo_comercial: "discovery_realizada" })).toBe(false);
  });
});

describe("dados da Discovery nunca chegam ao App", () => {
  it("o registro da Discovery não é lido por nenhuma tela do portal", () => {
    const telas = ["src/routes/portal/index.tsx", "src/routes/portal/jornada.tsx", "src/routes/portal/conta.tsx"];
    for (const t of telas) expect(ler(t)).not.toContain("discovery_registro");
  });
});
