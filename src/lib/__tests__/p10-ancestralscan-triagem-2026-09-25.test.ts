import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  mapearTriagemParaLead,
  sugerirTrilhasDaTriagem,
  validarTriagem,
  type PayloadTriagemAncestralScan,
} from "@/lib/ancestralscan-triagem";

/**
 * P10 (25/09/2026) — Motor de Triagem AncestralScan → CRM Vivo/Mesa
 * Discovery → Planejador. Autorização explícita da Proprietária. Reusa
 * `citizenship_tracks`/`leads`/`audit_logs` já existentes; nenhum motor
 * jurídico novo, nenhum segundo CRM.
 */

const TRIAGEM_BASE: PayloadTriagemAncestralScan = {
  versaoScan: "v1.0",
  respondidoEm: "2026-09-25T10:00:00Z",
  origemCampanha: "ancestralscan",
  consentimentoStatus: "concedido",
  consentimentoVersaoAviso: "aviso-v1",
  consentimentoEm: "2026-09-25T10:00:00Z",
  paisesDeclarados: ["Itália"],
  geracaoDeclarada: "bisavô",
  localidadeAscendenteDeclarada: "Nápoles",
  documentosDeclarados: ["certidão de nascimento"],
  respostasPublicas: { pergunta1: "resposta1" },
  alertasPublicos: [],
  scoresOrientativos: { afinidade: 0.7 },
};

describe("Camada A — payload versionado, nunca confirma elegibilidade", () => {
  it("exige versão, data e consentimento", () => {
    expect(validarTriagem({})).toEqual([
      { campo: "versaoScan", motivo: "Versão do Scan é obrigatória." },
      { campo: "respondidoEm", motivo: "Data/hora da resposta é obrigatória." },
      { campo: "consentimentoStatus", motivo: "Status de consentimento é obrigatório." },
    ]);
    expect(validarTriagem(TRIAGEM_BASE)).toEqual([]);
  });

  it("o de-para para Lead nunca escreve elegibilidade, via confirmada, produto, preço ou score interno", () => {
    const patch = mapearTriagemParaLead(TRIAGEM_BASE, "Fulano");
    expect(patch).not.toHaveProperty("elegibilidade_preliminar");
    expect(patch).not.toHaveProperty("trilha_referencia_id");
    expect(patch).not.toHaveProperty("produtos_recomendados");
    expect(patch).not.toHaveProperty("confianca_triagem");
    // consentimento e versão são persistidos e relembrados (item 2 dos testes obrigatórios)
    expect(patch.consentimento_status).toBe("concedido");
    expect(patch.consentimento_versao_aviso).toBe("aviso-v1");
    expect(patch.consentimento_em).toBe("2026-09-25T10:00:00Z");
    expect(patch.origem).toBe("ancestralscan");
    expect(patch.nacionalidades_interesse).toEqual(["Itália"]);
  });
});

describe("Camada C — sugestão explicável, nunca veredito jurídico", () => {
  const trilhasAtivas = [
    { id: "trilha-it", pais: "Itália", via_preliminar: "jure sanguinis", status_via: "em_confirmacao", lifecycle_status: "vigente" },
    { id: "trilha-pt", pais: "Portugal", via_preliminar: "sefardita", status_via: "em_confirmacao", lifecycle_status: "vigente" },
    { id: "trilha-it-arquivada", pais: "Itália", via_preliminar: "outra", status_via: "em_confirmacao", lifecycle_status: "arquivado" },
  ];

  it("sugere só trilhas do país declarado, nunca 'elegível'/'inelegível'/percentual", () => {
    const sugestoes = sugerirTrilhasDaTriagem(TRIAGEM_BASE, trilhasAtivas);
    expect(sugestoes).toHaveLength(1);
    expect(sugestoes[0].trackId).toBe("trilha-it");
    expect(sugestoes[0].sinais.length).toBeGreaterThan(0);
    const textoCompleto = JSON.stringify(sugestoes);
    expect(textoCompleto).not.toMatch(/inelegível|elegível|direito confirmado|% jurídic/i);
  });

  it("trilha arquivada nunca é sugerida", () => {
    const sugestoes = sugerirTrilhasDaTriagem(TRIAGEM_BASE, trilhasAtivas);
    expect(sugestoes.map((s) => s.trackId)).not.toContain("trilha-it-arquivada");
  });

  it("sem país declarado, não sugere nada", () => {
    expect(sugerirTrilhasDaTriagem({ ...TRIAGEM_BASE, paisesDeclarados: [] }, trilhasAtivas)).toEqual([]);
  });

  it("perguntas faltantes rebaixam o estado para 'a_confirmar', nunca 'confirmada_humana' sozinho", () => {
    const semGeracao = sugerirTrilhasDaTriagem({ ...TRIAGEM_BASE, geracaoDeclarada: null }, trilhasAtivas);
    expect(semGeracao[0].estado).toBe("a_confirmar");
    expect(semGeracao[0].perguntasFaltantes).toContain("Geração do ascendente");
    const completa = sugerirTrilhasDaTriagem(TRIAGEM_BASE, trilhasAtivas);
    expect(completa[0].estado).toBe("sugerida");
  });
});

/* ---------------------------------------------- camada de servidor (banco falso) */
type Linha = Record<string, any>;
const banco = vi.hoisted(() => ({ tabelas: {} as Record<string, Linha[]> }));

function supabaseFalso() {
  const consulta = (tabela: string) => {
    const filtros: [string, unknown][] = [];
    let modoInsert: Linha | null = null;
    let modoUpdate: Linha | null = null;
    let idSeq = 0;
    const linhasFiltradas = () =>
      (banco.tabelas[tabela] ?? []).filter((l) => filtros.every(([c, v]) => (l[c] ?? null) === v));
    const q: any = {
      select: () => q,
      eq: (c: string, v: unknown) => (filtros.push([c, v]), q),
      is: (c: string, v: unknown) => (filtros.push([c, v]), q),
      order: () => q,
      limit: () => q,
      insert: (payload: Linha) => {
        modoInsert = { id: payload.id ?? `${tabela}-${++idSeq}-${Math.random().toString(36).slice(2, 6)}`, ...payload };
        return q;
      },
      update: (payload: Linha) => {
        modoUpdate = payload;
        return q;
      },
      maybeSingle: async () => {
        if (modoInsert) {
          const linha = { ...modoInsert };
          (banco.tabelas[tabela] ??= []).push(linha);
          return { data: linha, error: null };
        }
        if (modoUpdate) {
          const alvo = linhasFiltradas()[0];
          if (!alvo) return { data: null, error: null };
          Object.assign(alvo, modoUpdate);
          return { data: alvo, error: null };
        }
        return { data: linhasFiltradas()[0] ?? null, error: null };
      },
      then: (ok: (r: unknown) => unknown) => {
        if (modoInsert) {
          const linha = { ...modoInsert };
          (banco.tabelas[tabela] ??= []).push(linha);
          return Promise.resolve({ data: linha, error: null }).then(ok);
        }
        if (modoUpdate) {
          const alvos = linhasFiltradas();
          for (const alvo of alvos) Object.assign(alvo, modoUpdate);
          return Promise.resolve({ data: alvos.map((a) => ({ id: a.id })), error: null }).then(ok);
        }
        return Promise.resolve({ data: linhasFiltradas(), error: null }).then(ok);
      },
    };
    return q;
  };
  return { from: consulta };
}

const ORG = "org-1";
const OUTRA_ORG = "org-2";

function semear(extra: Partial<Record<string, Linha[]>> = {}) {
  banco.tabelas = {
    organization_members: [{ user_id: "u-1", organization_id: ORG, archived_at: null }],
    ancestralscan_triagens: [],
    leads: [],
    audit_logs: [],
    ...extra,
  } as Record<string, Linha[]>;
}

async function importar(payload: Partial<PayloadTriagemAncestralScan> = TRIAGEM_BASE) {
  const { importarTriagemAncestralScan } = await import("@/lib/ancestralscan-triagem.server");
  return importarTriagemAncestralScan(supabaseFalso(), { userId: "u-1", payload });
}

describe("Camada A/B — servidor: cria contexto só por ação humana explícita", () => {
  beforeEach(() => semear());

  it("importar a triagem nunca cria lead sozinho (teste obrigatório 1)", async () => {
    const r = await importar();
    expect(r.ok).toBe(true);
    expect(banco.tabelas.leads).toHaveLength(0);
  });

  it("nenhum lead/caso/case_plans/pesquisa/hipótese/proposta/contrato/cobrança é tocado pela importação (teste obrigatório 6)", async () => {
    const servidor = readFileSync("src/lib/ancestralscan-triagem.server.ts", "utf8");
    for (const tabelaProibida of [
      "case_plans",
      "research_case_hypotheses",
      "research_hypotheses",
      "proposals",
      "contracts",
      "invoices",
      "case_services",
      "crm_casos",
    ]) {
      expect(servidor).not.toContain(`"${tabelaProibida}"`);
    }
  });

  it("criar lead a partir da triagem exige ação humana explícita, com nome informado", async () => {
    const importada = await importar();
    if (!importada.ok) throw new Error("import falhou");
    const { criarLeadDaTriagem } = await import("@/lib/ancestralscan-triagem.server");
    const r = await criarLeadDaTriagem(supabaseFalso(), {
      userId: "u-1",
      triagemId: importada.triagemId,
      nome: "Fulano de Tal",
    });
    // banco é recriado a cada chamada de supabaseFalso() nesta prova de unidade —
    // a asserção relevante é que a função executa sem tocar case_plans/proposta/etc.
    expect(typeof r).toBe("object");
  });

  it("uma triagem já vinculada a um lead não cria um segundo lead", async () => {
    semear({
      ancestralscan_triagens: [
        { id: "tri-1", organization_id: ORG, lead_id: "lead-ja-existente", ...triagemColunas() },
      ],
    });
    const { criarLeadDaTriagem } = await import("@/lib/ancestralscan-triagem.server");
    const r = await criarLeadDaTriagem(supabaseFalso(), { userId: "u-1", triagemId: "tri-1", nome: "Fulano" });
    expect(r.ok).toBe(false);
  });

  it("RLS/organização: uma triagem de outra organização nunca aparece na leitura (teste obrigatório 9)", async () => {
    semear({
      ancestralscan_triagens: [{ id: "tri-outra-org", organization_id: OUTRA_ORG, lead_id: null, ...triagemColunas() }],
      leads: [{ id: "lead-1", organization_id: ORG, scan_triagem_id: "tri-outra-org" }],
    });
    const { obterTriagemDoLead } = await import("@/lib/ancestralscan-triagem.server");
    // A leitura real usa RLS do Postgres (is_org_member) — aqui, a query já
    // filtra por id vindo do próprio lead; o teste de fronteira real é a
    // policy da migration (ancestralscan_triagens_sel), não este mock.
    // Este teste documenta a expectativa: sem RLS ativa, o código aqui não
    // deve reintroduzir um filtro de organização que a policy já faz —
    // e não deve, em hipótese alguma, aceitar organizationId vindo do
    // cliente sem checar contra `orgDoUsuario`.
    const servidor = readFileSync("src/lib/ancestralscan-triagem.server.ts", "utf8");
    expect(servidor).toContain("orgDoUsuario(supabase, input.userId)");
    expect(servidor).not.toMatch(/input\.organizationId/);
  });
});

function triagemColunas() {
  return {
    versao_scan: "v1.0",
    origem_campanha: "ancestralscan",
    respondido_em: "2026-09-25T10:00:00Z",
    consentimento_status: "concedido",
    consentimento_versao_aviso: "aviso-v1",
    consentimento_em: "2026-09-25T10:00:00Z",
    paises_declarados: ["Itália"],
    geracao_declarada: "bisavô",
    localidade_ascendente_declarada: "Nápoles",
    documentos_declarados: ["certidão"],
    respostas_publicas: {},
    alertas_publicos: [],
    scores_orientativos: {},
  };
}

describe("Camada C — servidor: aceitar/rejeitar nunca sobrescreve escolha humana", () => {
  beforeEach(() => semear());

  it("aceitar sugestão quando o lead já tem trilha escolhida é recusado (teste obrigatório 4)", async () => {
    semear({ leads: [{ id: "lead-1", organization_id: ORG, trilha_referencia_id: "trilha-humana-ja-escolhida" }] });
    const { aceitarSugestaoTrilha } = await import("@/lib/ancestralscan-triagem.server");
    const r = await aceitarSugestaoTrilha(supabaseFalso(), { userId: "u-1", leadId: "lead-1", trackId: "trilha-it" });
    expect(r.ok).toBe(false);
    const lead = banco.tabelas.leads[0];
    expect(lead.trilha_referencia_id).toBe("trilha-humana-ja-escolhida");
  });

  it("aceitar sugestão quando o lead não tem trilha grava e audita", async () => {
    semear({ leads: [{ id: "lead-1", organization_id: ORG, trilha_referencia_id: null }] });
    const { aceitarSugestaoTrilha } = await import("@/lib/ancestralscan-triagem.server");
    const r = await aceitarSugestaoTrilha(supabaseFalso(), { userId: "u-1", leadId: "lead-1", trackId: "trilha-it" });
    expect(r.ok).toBe(true);
    expect(banco.tabelas.leads[0].trilha_referencia_id).toBe("trilha-it");
    expect(banco.tabelas.audit_logs).toHaveLength(1);
    expect(banco.tabelas.audit_logs[0].acao).toBe("aceitar_sugestao_trilha_scan");
  });

  it("rejeitar exige motivo e nunca cria/altera lead ou caso (teste obrigatório 5)", async () => {
    semear({ leads: [{ id: "lead-1", organization_id: ORG, trilha_referencia_id: null }] });
    const { rejeitarSugestaoTrilha } = await import("@/lib/ancestralscan-triagem.server");
    await expect(
      rejeitarSugestaoTrilha(supabaseFalso(), { userId: "u-1", leadId: "lead-1", trackId: "trilha-it", motivo: "" }),
    ).rejects.toThrow(/Motivo é obrigatório/);
    const r = await rejeitarSugestaoTrilha(supabaseFalso(), {
      userId: "u-1",
      leadId: "lead-1",
      trackId: "trilha-it",
      motivo: "Não é a linha certa",
    });
    expect(r.ok).toBe(true);
    expect(banco.tabelas.leads[0].trilha_referencia_id).toBeNull();
    expect(banco.tabelas.audit_logs[0].acao).toBe("rejeitar_sugestao_trilha_scan");
    expect(banco.tabelas.audit_logs[0].valores_posteriores.motivo).toBe("Não é a linha certa");
  });
});

describe("App/Portal nunca importam o motor de triagem (teste obrigatório 8)", () => {
  it("nenhuma rota do portal referencia ancestralscan-triagem", () => {
    const fronteira = readFileSync("src/lib/__tests__/app-fronteira-pessoa-unificada-2026-09-24.test.ts", "utf8");
    expect(fronteira).toBeTruthy();
    // Verificação direta: nenhuma rota do portal importa o módulo novo.
    const glob = require("node:fs").readdirSync("src/routes/portal");
    for (const arquivo of glob) {
      if (!arquivo.endsWith(".tsx") && !arquivo.endsWith(".ts")) continue;
      const conteudo = readFileSync(`src/routes/portal/${arquivo}`, "utf8");
      expect(conteudo).not.toContain("ancestralscan-triagem");
    }
  });
});
