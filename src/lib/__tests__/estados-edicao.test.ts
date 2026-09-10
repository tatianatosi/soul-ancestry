import { describe, expect, it } from "vitest";
import {
  campoSatisfazAvanco,
  decidirEdicao,
  ehOperacaoAvanco,
  ehOperacaoRascunho,
  OPERACOES_AVANCO,
  pendenciasPorGate,
  type Pendencia,
} from "../estados-edicao";

const pendencia = (gate: Pendencia["gate"], campo = "parcelas"): Pendencia => ({
  campo,
  fonte: "proposta Canva aprovada",
  responsavel: "comercial",
  proximaAcao: "registrar parcelas e vencimentos declarados",
  gate,
});

describe("estados de edição × avanço", () => {
  it("proposta incompleta salva rascunho e informa o que falta", () => {
    const d = decidirEdicao({
      estado: "bloqueado_por_pendencia",
      operacao: "salvar_rascunho",
      papel: "operacoes",
      pendencias: [pendencia("aprovar_proposta")],
    });
    expect(d.permitido).toBe(true);
    expect(d.mensagem).toContain("Rascunho salvo.");
    expect(d.mensagem).toContain("A formalização permanece bloqueada até resolver");
  });

  it("proposta incompleta bloqueia avanço de quem não é proprietária", () => {
    for (const op of ["aprovar_proposta", "gerar_os_final", "congelar_previa"] as const) {
      const d = decidirEdicao({
        estado: "bloqueado_por_pendencia",
        operacao: op,
        papel: "comercial",
        pendencias: [pendencia(op)],
      });
      expect(d.permitido).toBe(false);
    }
  });

  it("a proprietária avança mesmo com pendência: libera, preserva e exige confirmação", () => {
    for (const op of ["aprovar_proposta", "gerar_os_final", "congelar_previa"] as const) {
      const d = decidirEdicao({
        estado: "bloqueado_por_pendencia",
        operacao: op,
        papel: "admin",
        pendencias: [pendencia(op)],
      });
      expect(d.permitido).toBe(true);
      if (d.permitido) {
        expect(d.efeito).toBe("avanco_por_decisao_proprietaria");
        expect(d.exigeConfirmacao).toBe(true);
        // A pendência continua visível: liberar não é apagar.
        expect(d.pendencias?.length).toBe(1);
      }
    }
  });

  it("usuário sem permissão não edita", () => {
    const d = decidirEdicao({
      estado: "rascunho_editavel",
      operacao: "corrigir_campo",
      papel: "leitura",
      pendencias: [],
    });
    expect(d).toMatchObject({ permitido: false, motivo: "sem_permissao" });
  });

  it("edição de versão congelada cria derivada e preserva histórico", () => {
    const d = decidirEdicao({
      estado: "aprovado_para_formalizacao",
      operacao: "salvar_escopo_rascunho",
      papel: "admin",
      pendencias: [],
    });
    expect(d).toMatchObject({ permitido: true, efeito: "criar_versao_derivada" });
  });

  it("campo divergente salva como divergente e bloqueia avanço", () => {
    expect(campoSatisfazAvanco("divergente")).toBe(false);
    expect(campoSatisfazAvanco("coberto_validado")).toBe(true);
    const d = decidirEdicao({
      estado: "em_revisao",
      operacao: "registrar_conflito",
      papel: "operacoes",
      pendencias: [pendencia("aprovar_proposta", "valor")],
    });
    expect(d.permitido).toBe(true);
  });

  it("parcela/vencimento ausentes ficam como pendência e não são inferidos", () => {
    const p = pendencia("converter_condicao_comercial_final", "vencimentos");
    const d = decidirEdicao({
      estado: "em_revisao",
      operacao: "converter_condicao_comercial_final",
      papel: "admin",
      pendencias: [p],
    });
    expect(d.permitido).toBe(true);
    if (d.permitido) {
      expect(d.efeito).toBe("avanco_por_decisao_proprietaria");
      expect(d.exigeConfirmacao).toBe(true);
      expect(d.pendencias?.[0]?.campo).toBe("vencimentos");
    }
  });

  it("nenhum ato externo é liberado por operação de rascunho", () => {
    const externos = [
      "solicitar_assinatura",
      "liberar_financeiro",
      "liberar_pesquisa_externa",
      "publicar_app_cliente",
    ] as const;
    for (const op of externos) {
      expect(ehOperacaoAvanco(op)).toBe(true);
      // Rascunho nunca dispara ato externo.
      expect(ehOperacaoRascunho(op)).toBe(false);

      // Para quem não é proprietária, o ato externo segue bloqueado.
      const outro = decidirEdicao({
        estado: "bloqueado_por_pendencia",
        operacao: op,
        papel: "comercial",
        pendencias: [],
      });
      expect(outro.permitido).toBe(false);

      // Para a proprietária o ato externo nunca é automático: exige aceite.
      const dona = decidirEdicao({
        estado: "bloqueado_por_pendencia",
        operacao: op,
        papel: "admin",
        pendencias: [],
      });
      expect(dona.permitido).toBe(true);
      if (dona.permitido) expect(dona.exigeConfirmacao).toBe(true);
    }
  });

  it("todo gate de avanço é enumerado e agrupável", () => {
    expect(OPERACOES_AVANCO.length).toBe(10);
    const mapa = pendenciasPorGate([pendencia("aprovar_proposta"), pendencia("gerar_os_final")]);
    expect(Object.keys(mapa).sort()).toEqual(["aprovar_proposta", "gerar_os_final"]);
  });
});
