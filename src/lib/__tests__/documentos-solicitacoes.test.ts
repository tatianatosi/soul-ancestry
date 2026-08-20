import { describe, expect, it } from "vitest";

import {
  CAMPOS_NUNCA_NO_APP,
  efeitoFinanceiro,
  efeitosDoStatus,
  projecaoClienteDaSolicitacao,
  STATUS_SOLICITACAO,
  validarSolicitacao,
} from "@/lib/documentos-solicitacoes";

const base = {
  case_id: "caso-1",
  research_person_id: "pessoa-1",
  document_type: "Certidão de nascimento",
  source_id: "fonte-1",
  status: "a_preparar",
  request_type: "certidao",
  priority: "media",
  access_level: "equipe_do_caso",
};

describe("G-04 — Documentos e Solicitações", () => {
  it("1. solicitação vinculada a pessoa, fonte e caso é válida e mantém os vínculos", () => {
    const r = validarSolicitacao(base);
    expect(r.ok).toBe(true);
    expect(base.research_person_id && base.source_id && base.case_id).toBeTruthy();
  });

  it("2. Recebido cria/vincula evidência com fluxo Recebida", () => {
    const efeitos = efeitosDoStatus({ ...base, status: "recebido", received_at: "2026-08-20" });
    expect(efeitos.vinculaEvidencia).toBe(true);
    expect(efeitos.workflowEvidencia).toBe("recebida");
  });

  it("3. Aguardando cliente gera alerta e rascunho, sem envio", () => {
    const efeitos = efeitosDoStatus({ ...base, status: "aguardando_cliente" });
    expect(efeitos.criaAlerta).toBe(true);
    expect(efeitos.criaRascunhoComunicacao).toBe(true);
    expect(efeitos.enviaMensagem).toBe(false);
  });

  it("4. Requer tradução/apostila não gera despesa nem cobrança", () => {
    const fin = efeitoFinanceiro({ ...base, status: "requer_traducao_apostila", estimated_external_cost: 320 });
    expect(fin.criaDespesa).toBe(false);
    expect(fin.criaCobranca).toBe(false);
    expect(fin.natureza).toBe("previsao_interna");
  });

  it("5. Não localizado exige ação alternativa com prazo e responsável", () => {
    const semAcao = validarSolicitacao({ ...base, status: "nao_localizado", requested_at: "2026-08-01" });
    expect(semAcao.ok).toBe(false);
    expect(semAcao.erros.join(" ")).toContain("próxima ação");
    expect(efeitosDoStatus({ ...base, status: "nao_localizado" }).exigeAcaoAlternativa).toBe(true);

    const comAcao = validarSolicitacao({
      ...base,
      status: "nao_localizado",
      requested_at: "2026-08-01",
      next_action: "Consultar acervo paroquial alternativo",
      next_action_due: "2026-09-15",
      responsible_user_id: "user-1",
    });
    expect(comAcao.ok).toBe(true);
  });

  it("data do pedido é obrigatória a partir de Solicitado", () => {
    expect(validarSolicitacao({ ...base, status: "solicitado" }).ok).toBe(false);
    expect(validarSolicitacao({ ...base, status: "solicitado", requested_at: "2026-08-10" }).ok).toBe(true);
  });

  it("data de recebimento é obrigatória em Recebido", () => {
    expect(validarSolicitacao({ ...base, status: "recebido", requested_at: "2026-08-01" }).ok).toBe(false);
  });

  it("nome completo não é texto livre quando há pessoa cadastrada", () => {
    const r = validarSolicitacao({ ...base, full_name_text: "Adair" });
    expect(r.ok).toBe(false);
  });

  it("sem pessoa cadastrada aceita nome completo em texto", () => {
    const r = validarSolicitacao({ ...base, research_person_id: null, full_name_text: "Adair Tosi" });
    expect(r.ok).toBe(true);
  });

  it("campos classificatórios usam dicionário fechado", () => {
    expect(validarSolicitacao({ ...base, status: "inventado" }).ok).toBe(false);
    expect(validarSolicitacao({ ...base, priority: "urgentissima" }).ok).toBe(false);
    expect(STATUS_SOLICITACAO).toHaveLength(17);
  });

  it("projeção ao cliente não expõe link interno nem dado bruto", () => {
    const p = projecaoClienteDaSolicitacao({
      ...base,
      internal_link: "https://drive.google.com/x",
      observation_internal: "risco de divergência",
      updated_at: "2026-08-20",
    });
    for (const campo of CAMPOS_NUNCA_NO_APP) expect(Object.keys(p)).not.toContain(campo);
    expect(JSON.stringify(p)).not.toContain("drive.google");
  });
});
