import { describe, expect, it } from "vitest";

import {
  bloqueiosDeEscopo,
  extrairEscopoDaProposta,
  validarPropostaCanva,
  type PropostaCanva,
} from "@/lib/escopo-proposta";
import { bloqueiosDependentes, resumoParametroDependentes, type Dependente } from "@/lib/dependentes";
import { TEMAS_JURIDICOS, podeGerarClausula, temasBloqueantesPendentes, type LinhaMatriz } from "@/lib/matriz-juridica";

const CASE_ID = "00000000-0000-4000-8000-000000000001";
const HOJE = new Date("2026-08-19T00:00:00Z");

const conteudoCompleto = {
  "1": { proposta_referencia: "Proposta v3 — referência interna", caso_contexto: "Caso familiar — país de referência" },
  "2": { processos_participantes: "3 processos", escopo_macro: "Estudo genealógico" },
  "3": { servicos_incluidos: "Pesquisa e dossiê", servicos_excluidos: "Tradução juramentada" },
  "4": { escopos_individuais: "Recorte por participante", composicao_familiar: "Titular e beneficiários", responsabilidades: "Divisão declarada" },
  "5": { entregas_jornada: "Fases 1 a 4" },
  "6": { valor_total: "Valor declarado", forma_pagamento: "Parcelado", parcelas: "12", responsaveis_financeiros: "Titular" },
  "7": { despesas_externas: "Despesas de terceiros por conta do contratante" },
};

function proposta(over: Partial<PropostaCanva> = {}): PropostaCanva {
  return {
    id: "p1",
    case_id: CASE_ID,
    versao: 3,
    status: "aprovada",
    archived_at: null,
    substituida_em: null,
    substituida_por_id: null,
    recusada_em: null,
    validade: "2026-12-31",
    origem: "canva",
    origem_referencia: "deck interno CA-DECK-001",
    paginas_registradas: [1, 2, 3, 4, 5, 6, 7],
    escopo_paginas: conteudoCompleto,
    ...over,
  };
}

function bloqueios(p: PropostaCanva) {
  const validade = validarPropostaCanva(p, CASE_ID, HOJE);
  const extraidos = extrairEscopoDaProposta(p);
  return bloqueiosDeEscopo({ validade, extraidos, conflitos: [] });
}

describe("A/B. Completude da proposta Canva", () => {
  it("1. deck + páginas 1–7 + conteúdo completo → conferência executável", () => {
    const p = proposta();
    expect(validarPropostaCanva(p, CASE_ID, HOJE).valida).toBe(true);
    expect(bloqueios(p)).toEqual([]);
  });

  it("2. página faltante bloqueia", () => {
    const b = bloqueios(proposta({ paginas_registradas: [1, 2, 3, 4, 5, 6] }));
    expect(b.some((x) => x.motivo.includes("Páginas 1–7 incompletas"))).toBe(true);
  });

  it("3. campo obrigatório não localizado bloqueia e é nomeado", () => {
    const semDespesas = { ...conteudoCompleto, "7": {} };
    const b = bloqueios(proposta({ escopo_paginas: semDespesas }));
    expect(b.some((x) => x.motivo.includes("Regra de despesas de terceiros"))).toBe(true);
  });

  it("4. proposta substituída bloqueia", () => {
    const b = bloqueios(proposta({ substituida_por_id: "p2", substituida_em: "2026-08-10" }));
    expect(b.some((x) => x.motivo.includes("substituída"))).toBe(true);
  });

  it("referência interna do deck ausente bloqueia, sem exigir URL externa", () => {
    const b = bloqueios(proposta({ origem_referencia: null }));
    expect(b.some((x) => x.motivo.includes("Referência do deck"))).toBe(true);
    expect(JSON.stringify(b)).not.toMatch(/https?:\/\//);
  });

  it("campo opcional não declarado não bloqueia", () => {
    expect(bloqueios(proposta())).toEqual([]);
    const opc = extrairEscopoDaProposta(proposta()).find((e) => e.campo === "prazo_validade");
    expect(opc?.localizado).toBe(false);
    expect(opc?.obrigatorio).toBe(false);
  });
});

describe("C. Parâmetro dependentes", () => {
  const felipe: Dependente = {
    case_id: CASE_ID,
    nome_completo: "Dependente Exemplo",
    vinculo_com_titular: "filho",
    titular_responsavel_legal_nome: "Titular Exemplo",
    status_representacao: "pendente",
    participa_do_contrato: false,
    possui_acesso_app: false,
    anexo_individual_aplicavel: false,
  };

  it("5. dependente pendente que participa do contrato bloqueia", () => {
    const b = bloqueiosDependentes([{ ...felipe, participa_do_contrato: true }]);
    expect(b[0].codigo).toBe("DEPENDENTE_REPRESENTACAO_PENDENTE");
  });

  it("6. dependente sem participação não bloqueia só por existir", () => {
    expect(bloqueiosDependentes([felipe])).toEqual([]);
  });

  it("resumo do parâmetro não expõe dado sensível", () => {
    const r = resumoParametroDependentes([felipe]);
    expect(r).toContain("representação pendente");
    expect(r).not.toMatch(/cpf|rg|passaporte/i);
  });
});

describe("D. Matriz de temas jurídicos", () => {
  const linhas: LinhaMatriz[] = TEMAS_JURIDICOS.map((t) => ({
    tema_codigo: t.tema_codigo,
    tema: t.tema,
    status: "pendente_revisao_juridica",
    versao_juridica_aplicavel: null,
    responsavel_revisao: null,
    decisao: null,
    justificativa: null,
    decidido_em: null,
    referencia_versao: null,
    impacto_templates: t.impacto_templates,
    bloqueia_assinatura: t.bloqueia_assinatura,
  }));

  it("7. tema pendente que bloqueia assinatura mantém assinatura bloqueada", () => {
    const pendentes = temasBloqueantesPendentes(linhas);
    expect(pendentes.length).toBeGreaterThan(0);
    expect(pendentes).toContain(TEMAS_JURIDICOS.find((t) => t.bloqueia_assinatura)!.tema);
  });

  it("8. cláusula sem versão jurídica aprovada é recusada", () => {
    expect(podeGerarClausula(linhas[0]).permitido).toBe(false);
    expect(podeGerarClausula({ ...linhas[0], status: "aprovado" }).permitido).toBe(false);
    expect(podeGerarClausula({ ...linhas[0], status: "aprovado", versao_juridica_aplicavel: "v1" }).permitido).toBe(true);
  });
});
