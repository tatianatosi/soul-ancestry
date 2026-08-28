import { describe, expect, it } from "vitest";

import { ROTULO_ESTADO_ANEXO, dicionarioAnexos, pessoasDeLista } from "@/lib/anexos-dicionario";
import { bloqueiosResolutivos, temBloqueioImpeditivo } from "@/lib/bloqueios-dicionario";
import { validarFluxo } from "@/lib/comercial-fluxo";
import { EVENTOS_SNAPSHOT, hashConteudo } from "@/lib/contrato-parametros.server";
import { validarValorCampo } from "@/lib/parametros-dicionario";

/** Caso de referência: CA-CID-AT-FAM-2026-001 — um núcleo, um contrato-base. */
const CASO = {
  produto: "CA-CID-AT-001",
  paisRota: "Austria",
  beneficiarios: "Ana Luiza || Adair || Alice",
  dependentes: "Felipe (Ana Luiza)",
  representacaoLegal: "Não há representação: Ana Luiza, Adair e Alice são maiores de idade.",
  valorTotal: "9600",
  formaPagamento: "assinatura_mensal",
  parcelas: "3 assinaturas mensais de 320 por 10 meses",
  escopoResumo: "Cidadania austríaca — atendimento familiar (§ 58c StbG).",
};

describe("família, contrato-base e anexos individuais", () => {
  const anexos = dicionarioAnexos(CASO);
  const individual = anexos.find((a) => a.codigo === "ANX-INDIVIDUAL")!;

  it("gera exatamente três instâncias individuais, sem duplicidade", () => {
    expect(individual.instancias).toHaveLength(3);
    expect(new Set(individual.instancias.map((i) => i.chave)).size).toBe(3);
    expect(individual.obrigatorio).toBe(true);
  });

  it("mantém Felipe como dependente dentro da instância da Ana", () => {
    expect(individual.instancias[0].titulo).toBe("Ana Luiza + Felipe (dependente)");
    expect(individual.instancias.map((i) => i.pessoa)).toEqual(["Ana Luiza", "Adair", "Alice"]);
  });

  it("não aplica ANX-REPRESENTACAO quando o dependente não pratica ato próprio", () => {
    const rep = anexos.find((a) => a.codigo === "ANX-REPRESENTACAO")!;
    expect(rep.aplicavel).toBe(false);
    expect(rep.estado).toBe("nao_aplicavel");
  });

  it("aplica ANX-REPRESENTACAO quando os documentos do menor exigem", () => {
    const rep = dicionarioAnexos({
      ...CASO,
      representacaoLegal: "Felipe, menor, representado por Ana Luiza para atos documentais.",
    }).find((a) => a.codigo === "ANX-REPRESENTACAO")!;
    expect(rep.obrigatorio).toBe(true);
    expect(rep.instancias.map((i) => i.titulo)).toEqual(["Felipe representado por Ana Luiza"]);
  });

  it("expõe finalidade, regra, aplicabilidade, campos, pendências e impacto", () => {
    for (const a of anexos) {
      expect(a.finalidade.length).toBeGreaterThan(10);
      expect(a.regra.length).toBeGreaterThan(10);
      expect(a.aplicabilidade.length).toBeGreaterThan(10);
      expect(a.campos.length).toBeGreaterThan(0);
      expect(a.impactoAusencia.length).toBeGreaterThan(10);
      expect(Array.isArray(a.pendencias)).toBe(true);
      expect(ROTULO_ESTADO_ANEXO[a.estado]).toBeTruthy();
    }
  });

  it("marca anexo comercial como pendente enquanto faltarem parcelas", () => {
    const com = dicionarioAnexos({ ...CASO, parcelas: "" }).find(
      (a) => a.codigo === "ANX-COMERCIAL",
    )!;
    expect(com.estado).toBe("pendente");
    expect(com.pendencias.join(" ")).toMatch(/Parcelas/);
  });

  it("respeita estado registrado de revisão/arquivamento", () => {
    const com = dicionarioAnexos({ ...CASO, estados: { "ANX-COMERCIAL": "aprovado" } }).find(
      (a) => a.codigo === "ANX-COMERCIAL",
    )!;
    expect(com.estado).toBe("aprovado");
  });

  it("lê a lista de pessoas em qualquer separador aceito", () => {
    expect(pessoasDeLista("Ana || Adair; Alice")).toEqual(["Ana", "Adair", "Alice"]);
  });
});

describe("versionamento de prévia", () => {
  const conteudo = {
    caso: "CA-CID-AT-FAM-2026-001",
    valores: [{ campo: "valor_total", valor: "9600" }],
  };

  it("conteúdo idêntico produz a mesma impressão digital (salvar não vira versão nova)", () => {
    expect(hashConteudo(conteudo)).toBe(hashConteudo({ ...conteudo }));
  });

  it("mudança real muda a impressão digital", () => {
    expect(hashConteudo(conteudo)).not.toBe(
      hashConteudo({ ...conteudo, valores: [{ campo: "valor_total", valor: "9601" }] }),
    );
  });

  it("só eventos de governança congelam versão — salvar não é evento", () => {
    expect([...EVENTOS_SNAPSHOT]).toEqual([
      "revisao_solicitada",
      "retorno_ajuste",
      "aprovacao",
      "envio_assinatura",
      "assinatura_registrada",
    ]);
    expect(EVENTOS_SNAPSHOT).not.toContain("rascunho_atualizado" as never);
  });
});

describe("campos parametrizáveis e propostas", () => {
  it("rejeita valor fora da lista em campo classificatório", () => {
    expect(
      validarValorCampo({ campo: "forma_pagamento", valor: "combinado no zap", origem: "proposta" })
        .ok,
    ).toBe(false);
  });

  it("bloqueia salvamento sem justificativa quando a regra exige", () => {
    const r = validarValorCampo({
      campo: "despesas_externas",
      valor: "estimada",
      origem: "proposta",
    });
    expect(r.ok).toBe(false);
    expect(r.ok === false ? r.erro : "").toMatch(/justificativa/i);
  });

  it("mantém nome civil como texto livre", () => {
    expect(
      validarValorCampo({
        campo: "contratante_nome",
        valor: "Ana Luiza Gomes Silveira Rodrigues",
        origem: "crm",
      }).ok,
    ).toBe(true);
  });

  it("proposta arquivada/substituída não volta a valer para contrato", () => {
    expect(() => validarFluxo("proposals", "substituida", "aprovada")).toThrow();
    expect(() => validarFluxo("proposals", "enviada", "em_negociacao")).not.toThrow();
  });
});

describe("bloqueios resolutivos", () => {
  const valores = [
    {
      id: "v1",
      campo: "parcelas",
      label: "Parcelas",
      obrigatorio: true,
      valor: null,
      status: "vazio",
    },
    {
      id: "v2",
      campo: "partes_signatarias",
      label: "Partes signatárias",
      obrigatorio: true,
      valor: "Ana",
      status: "importado_a_confirmar",
    },
  ];

  it("aponta campo e entidade de cada bloqueio, sem duplicar", () => {
    const r = bloqueiosResolutivos(
      [
        { chave: "campo_obrigatorio", motivo: "1 campo vazio" },
        { chave: "campo_obrigatorio", motivo: "1 campo vazio" },
        { chave: "signatario", motivo: "qualificação incompleta" },
      ],
      valores as never,
    );
    expect(r.filter((b) => b.chave === "campo_obrigatorio")).toHaveLength(1);
    expect(r[0].camposAfetados[0]).toEqual({ id: "v1", label: "Parcelas" });
  });

  it("mantém revisão humana indisponível enquanto houver bloqueio impeditivo", () => {
    expect(
      temBloqueioImpeditivo(
        bloqueiosResolutivos([{ chave: "signatario", motivo: "x" }], valores as never),
      ),
    ).toBe(true);
    expect(
      temBloqueioImpeditivo(
        bloqueiosResolutivos([{ chave: "revisao_humana", motivo: "x" }], valores as never),
      ),
    ).toBe(false);
  });
});
