import { describe, expect, it } from "vitest";

import {
  calcularMetricasCrm,
  errosBloqueantesAlteracao,
  montarFilasHoje,
  resultadoComercialDerivado,
  validarLead,
  type LeadDesk,
} from "@/lib/crm-desk";
import { bloqueiosDependentes, participaDeFormalizacao, type Dependente } from "@/lib/dependentes";
import {
  TEMAS_JURIDICOS,
  podeGerarClausula,
  temasBloqueantesPendentes,
  type LinhaMatriz,
} from "@/lib/matriz-juridica";

const base: LeadDesk = {
  nome: "Teste",
  area_responsavel: "comercial",
  responsavel_nome: "Tatiana Tosi",
  proxima_acao: "agendar_call",
  proxima_acao_em: "2026-08-20",
  eixo_comercial: "novo_lead",
  eixo_formalizacao: "nao_iniciado",
};

describe("CRM desk — listas controladas e travas", () => {
  it("aceita lead ativo completo", () => {
    expect(validarLead(base)).toEqual([]);
  });

  it("recusa valor fora da lista controlada", () => {
    const erros = validarLead({ ...base, origem: "tiktok_livre" });
    expect(erros.some((e) => e.campo === "origem")).toBe(true);
  });

  it("permite editar outro campo quando a ficha contém classificação legada", () => {
    const legado = { ...base, origem: "manual", proxima_acao: "completar_cadastro_lead" };
    const candidato = { ...legado, responsavel_nome: "Proprietária Administradora" };
    expect(errosBloqueantesAlteracao(legado, candidato, ["responsavel_nome"])).toEqual([]);
  });

  it("bloqueia valor inválido inserido no campo alterado", () => {
    const candidato = { ...base, origem: "canal_novo_nao_homologado" };
    expect(errosBloqueantesAlteracao(base, candidato, ["origem"]).map((e) => e.campo)).toContain("origem");
  });

  it("mantém bloqueio quando a alteração cria uma nova violação de gate", () => {
    const candidato = { ...base, eixo_comercial: "proposta_enviada" };
    const erros = errosBloqueantesAlteracao(base, candidato, ["eixo_comercial"]);
    expect(erros.map((e) => e.campo)).toEqual(expect.arrayContaining(["discovery_resultado", "resumo_validado", "proposta_link_interno"]));
  });

  it("exige responsável e próxima ação em lead ativo", () => {
    const erros = validarLead({
      ...base,
      responsavel_nome: null,
      proxima_acao: null,
      proxima_acao_em: null,
    });
    expect(erros.map((e) => e.campo)).toEqual(
      expect.arrayContaining(["responsavel_nome", "proxima_acao", "proxima_acao_em"]),
    );
  });

  it("exige resumo validado e resultado após Discovery", () => {
    const erros = validarLead({ ...base, eixo_comercial: "discovery_realizada" });
    expect(erros.map((e) => e.campo)).toEqual(
      expect.arrayContaining(["discovery_resultado", "resumo_validado"]),
    );
  });

  it("exige referência do Asaas para pagamento inicial confirmado", () => {
    const erros = validarLead({
      ...base,
      eixo_formalizacao: "pagamento_inicial_confirmado",
      contrato_link_interno: "interno://contrato",
    });
    expect(erros.some((e) => e.campo === "asaas_evento_referencia")).toBe(true);
  });

  it("não abre caso sem caso operacional vinculado", () => {
    const erros = validarLead({
      ...base,
      eixo_formalizacao: "caso_ativo",
      contrato_link_interno: "interno://c",
      asaas_evento_referencia: "evt-1",
    });
    expect(erros.some((e) => e.motivo.includes("caso operacional"))).toBe(true);
  });

  it("deriva o resultado comercial sem substituir os eixos", () => {
    expect(resultadoComercialDerivado({ ...base, eixo_formalizacao: "caso_ativo" })).toContain(
      "Ganho",
    );
    expect(resultadoComercialDerivado({ ...base, eixo_comercial: "perdido" })).toBe("Perdido");
  });
});

describe("Painel Hoje e métricas", () => {
  const hoje = new Date("2026-08-19T12:00:00Z");
  const leads: LeadDesk[] = [
    {
      ...base,
      id: "1",
      codigo: "CA-LEAD-2026-0001",
      proxima_acao_em: "2026-08-10",
      created_at: "2026-08-01T00:00:00Z",
      origem: "indicacao",
    },
    {
      ...base,
      id: "2",
      codigo: "CA-LEAD-2026-0002",
      proxima_acao_em: "2026-08-19",
      created_at: "2026-08-05T00:00:00Z",
      origem: "indicacao",
    },
  ];

  it("ordena filas por criticidade e coloca vencidas primeiro", () => {
    const filas = montarFilasHoje({ leads, casos: [], hoje });
    expect(filas[0].chave).toBe("acoes_vencidas");
    expect(filas[0].itens).toHaveLength(1);
  });

  it("agrega origem e higiene operacional", () => {
    const m = calcularMetricasCrm({ leads, casos: [], hoje });
    expect(m.porOrigem[0].total).toBe(2);
    expect(m.followupsVencidos).toBe(1);
  });
});

describe("Dependentes", () => {
  const d: Dependente = {
    case_id: "c",
    nome_completo: "Felipe",
    vinculo_com_titular: "filho",
    status_representacao: "pendente",
    participa_do_contrato: false,
    possui_acesso_app: false,
    anexo_individual_aplicavel: false,
  };

  it("dependente que não participa não bloqueia", () => {
    expect(participaDeFormalizacao(d)).toBe(false);
    expect(bloqueiosDependentes([d])).toEqual([]);
  });

  it("participação com representação pendente bloqueia", () => {
    const b = bloqueiosDependentes([{ ...d, participa_do_contrato: true }]);
    expect(b[0].codigo).toBe("DEPENDENTE_REPRESENTACAO_PENDENTE");
  });

  it("acesso ao App exige representação documentada", () => {
    const b = bloqueiosDependentes([
      { ...d, possui_acesso_app: true, status_representacao: "nao_aplicavel" },
    ]);
    expect(b.some((x) => x.codigo === "DEPENDENTE_APP_SEM_REPRESENTACAO")).toBe(true);
  });
});

describe("Matriz jurídica", () => {
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

  it("lista temas bloqueantes sem decisão", () => {
    expect(temasBloqueantesPendentes(linhas).length).toBeGreaterThan(0);
  });

  it("tema pendente nunca vira cláusula", () => {
    expect(podeGerarClausula(linhas[0]).permitido).toBe(false);
  });

  it("tema aprovado sem versão jurídica também não gera cláusula", () => {
    expect(podeGerarClausula({ ...linhas[0], status: "aprovado" }).permitido).toBe(false);
    expect(
      podeGerarClausula({ ...linhas[0], status: "aprovado", versao_juridica_aplicavel: "v1" })
        .permitido,
    ).toBe(true);
  });
});
