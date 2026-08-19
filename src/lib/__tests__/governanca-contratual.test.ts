import { describe, expect, it } from "vitest";

import { conferirEscopo, contextoGatesDaConferencia, auditoriaSanitizada, type EntradaConferencia } from "@/lib/escopo-conferencia";
import { CAMPOS_ESCOPO_PROPOSTA, type PropostaCanva } from "@/lib/escopo-proposta";
import { bloqueiosDaAcao, podeExecutar } from "@/lib/gates-formalizacao";
import { conferirPrecoCanonico, type ProdutoCanonico } from "@/lib/preco-canonico";

const CASE = "22222222-2222-2222-2222-222222222222";
const HOJE = new Date("2026-08-20T12:00:00Z");

const escopoCompleto = Object.fromEntries(
  CAMPOS_ESCOPO_PROPOSTA.map((c) => [c.campo, `Conteúdo declarado para ${c.label}`]),
);

const proposta: PropostaCanva = {
  id: "prop-1",
  case_id: CASE,
  versao: 3,
  status: "aprovada",
  archived_at: null,
  origem: "canva",
  origem_referencia: "DECK-ANA-V3",
  paginas_registradas: [1, 2, 3, 4, 5, 6, 7],
  escopo_paginas: escopoCompleto,
};

const produto: ProdutoCanonico = {
  id: "prod-1",
  code: "CA-CID-AT-001",
  nome_comercial: "Cidadania austríaca — § 58c",
  status_homologacao: "homologado",
  elegivel_para_proposta: true,
  preco_comercial_vigente: 30000,
  condicao_comercial_padrao: "12x",
  parcelas_padrao: 12,
  vigencia_inicio: "2026-01-01",
  vigencia_fim: "2026-12-31",
  homologado_por: "Tatiana Tosi",
  homologado_em: "2026-01-02",
  origem_legada_referencia: null,
  ativo: true,
  archived_at: null,
} as ProdutoCanonico;

function entrada(over: Partial<EntradaConferencia> = {}): EntradaConferencia {
  const preco = over.preco ?? conferirPrecoCanonico({ produto, observados: [], hoje: HOJE });
  return {
    caseId: CASE,
    proposta,
    valores: [],
    caseService: { id: "cs-1", product_catalog_id: produto.id, status: "ativo", preco_acordado: 30000 },
    preco,
    nucleo: { validado: true, menorEnvolvido: false, representacaoRegistrada: true, cadastroCompleto: true },
    checklist: {
      revisaoJuridicaOk: true,
      contratoOsProntos: true,
      assinaturaRegistrada: false,
      pagamentoConfirmado: false,
      autorizacaoPesquisa: false,
    },
    despesas: [],
    hoje: HOJE,
    ...over,
  };
}

describe("governança contratual — conferência, preço e gates", () => {
  it("1. proposta Canva válida e completa aprova a preparação", () => {
    const r = conferirEscopo(entrada());
    expect(r.status).toBe("aprovado_para_preparacao");
    expect(r.proposal_version).toBe(3);
    expect(r.paginas_usadas).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("2. proposta ausente bloqueia e impede gerar versão final", () => {
    const r = conferirEscopo(entrada({ proposta: null }));
    expect(r.status).toBe("bloqueado");
    expect(r.bloqueios.some((b) => b.codigo === "PROPOSTA_INVALIDA")).toBe(true);
    expect(podeExecutar("gerar_versao_final", contextoGatesDaConferencia(r))).toBe(false);
  });

  it("3. campo obrigatório ausente na proposta vira bloqueio nomeado", () => {
    const { servicos_excluidos: _omitido, ...parcial } = escopoCompleto;
    const r = conferirEscopo(entrada({ proposta: { ...proposta, escopo_paginas: parcial } }));
    expect(r.bloqueios.some((b) => b.codigo === "ESCOPO_CAMPO_OBRIGATORIO_AUSENTE")).toBe(true);
    expect(r.campos_ausentes.some((c) => c.campo === "servicos_excluidos")).toBe(true);
  });

  it("4. página fora do intervalo 1–7 é rejeitada", () => {
    const r = conferirEscopo(entrada({ proposta: { ...proposta, paginas_registradas: [1, 2, 3, 4, 5, 6, 7, 9] } }));
    expect(r.bloqueios.some((b) => b.codigo === "PROPOSTA_PAGINA_FORA_DO_INTERVALO")).toBe(true);
  });

  it("5. preço só é canônico no product_catalog homologado", () => {
    const naoHomologado = conferirPrecoCanonico({
      produto: { ...produto, status_homologacao: "rascunho" },
      observados: [],
      hoje: HOJE,
    });
    expect(naoHomologado.ok).toBe(false);
    expect(naoHomologado.bloqueios.some((b) => b.codigo === "PRECO_NAO_HOMOLOGADO")).toBe(true);

    const semProduto = conferirPrecoCanonico({ produto: null, observados: [], hoje: HOJE });
    expect(semProduto.bloqueios.some((b) => b.codigo === "PRECO_SEM_PRODUTO")).toBe(true);
  });

  it("6. valor de WhatsApp/planejador divergente vira conflito, nunca preço aplicado", () => {
    const preco = conferirPrecoCanonico({
      produto,
      observados: [{ fonte: "whatsapp", valor: 27000 }],
      hoje: HOJE,
    });
    expect(preco.preco).toBe(30000);
    expect(preco.ok).toBe(false);
    const r = conferirEscopo(entrada({ preco }));
    expect(r.conflitos.some((c) => c.codigo === "CONFLITO_PRECO_ORIGEM")).toBe(true);
    expect(r.status).toBe("bloqueado");
  });

  it("7. exceção comercial só vale aprovada e dentro da validade", () => {
    const semAprovacao = conferirPrecoCanonico({
      produto,
      excecao: { id: "e1", aprovada: false, valor: 25000, condicao: "6x", valida_ate: "2026-12-31", motivo: "negociação" },
      observados: [],
      hoje: HOJE,
    });
    expect(semAprovacao.bloqueios.some((b) => b.codigo === "EXCECAO_COMERCIAL_INVALIDA")).toBe(true);

    const vigente = conferirPrecoCanonico({
      produto,
      excecao: { id: "e2", aprovada: true, valor: 25000, condicao: "6x", valida_ate: "2026-12-31", motivo: "negociação" },
      observados: [],
      hoje: HOJE,
    });
    expect(vigente.ok).toBe(true);
    expect(vigente.fonte).toBe("excecao_comercial_aprovada");
    expect(vigente.preco).toBe(25000);
  });

  it("8. menor sem representação e despesa pendente travam assinatura e onboarding", () => {
    const r = conferirEscopo(
      entrada({
        nucleo: { validado: true, menorEnvolvido: true, representacaoRegistrada: false, cadastroCompleto: true },
        despesas: [
          {
            id: "d1",
            descricao: "Taxa consular",
            categoria: "taxa",
            estado: "aguardando_aprovacao",
            estimativa_min: 100,
            estimativa_max: 200,
            moeda: "EUR",
            pagador: "cliente",
            comunicado_em: null,
            aprovado_pelo_cliente_em: null,
            aprovacao_evidencia: null,
            executado_em: null,
            valor_pago: null,
            excecao_id: null,
          },
        ],
      }),
    );
    const ctx = contextoGatesDaConferencia(r);
    expect(bloqueiosDaAcao("solicitar_assinatura", ctx).length).toBeGreaterThan(0);
    expect(podeExecutar("liberar_onboarding", ctx)).toBe(false);
  });

  it("9. auditoria só expõe códigos e nomes de campo, sem conteúdo sensível", () => {
    const r = conferirEscopo(entrada());
    const payload = auditoriaSanitizada({ caseId: CASE, resultado: r, actorId: "user-1", approverId: null });
    const texto = JSON.stringify(payload);
    expect(texto).not.toContain("Conteúdo declarado");
    expect(payload.origin).toBe("Canva");
    expect(payload.proposal_id).toBe("prop-1");
    expect(payload.actor_id).toBe("user-1");
  });
});
