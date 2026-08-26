import { describe, expect, it } from "vitest";

import {
  MENSAGEM_FALHA,
  MENSAGEM_NEUTRA,
  ROTULO_ESTADO_NEUTRO,
  listaParaCliente,
  mensagemDeFalha,
  mensagemIndisponivel,
  rotuloEstadoVivo,
  textoParaCliente,
} from "@/lib/portal-linguagem-viva";
import { publicacoesParaCliente, rotuloTipoProjecao } from "@/lib/projecoes-cliente";
import { TIPO_CLIENTE } from "@/lib/marca";
import { AZUIS_RETIRADOS } from "@/lib/marca";
import { contemTermoProibido } from "@/lib/portal-copy";

describe("CA-PORTAL-04 — critério 11: dados vivos com copy de cliente", () => {
  it("remove ID, tabela, política, endpoint e código interno", () => {
    const bruto =
      "Documento 3f1c0f2a-9b71-4d2e-8a3d-0c1b2e3f4a5b em public.documents (policy documents_sel_portal) https://api.exemplo/rest/v1/documents — CA-CID-AT-FAM-2026-001";
    const saida = textoParaCliente(bruto);
    expect(saida).not.toMatch(/3f1c0f2a|public\.|policy|https?:|CA-CID/i);
  });

  it("descarta nota interna e termo técnico proibido", () => {
    expect(textoParaCliente("Obs. interna: hipótese forte de êxito.")).toBe("");
    expect(textoParaCliente("Aguardando gate do Desk.")).toBe("");
  });

  it("preserva texto humano legítimo", () => {
    expect(textoParaCliente("Certidão de nascimento localizada no arquivo paroquial.")).toBe(
      "Certidão de nascimento localizada no arquivo paroquial.",
    );
  });

  it("lista descarta itens vazios e duplicados", () => {
    expect(
      listaParaCliente(["Registro localizado.", "Registro localizado.", "case_id 12"]),
    ).toEqual(["Registro localizado."]);
  });

  it("estado técnico vira linguagem humana; desconhecido vira rótulo neutro", () => {
    expect(rotuloEstadoVivo("pendente")).toBe("Em análise pela equipe");
    expect(rotuloEstadoVivo("em analise")).toBe("Em análise pela equipe");
    expect(rotuloEstadoVivo("awaiting_internal_gate")).toBe(ROTULO_ESTADO_NEUTRO);
    expect(rotuloEstadoVivo(null)).toBe(ROTULO_ESTADO_NEUTRO);
  });

  it("tipo de projeção sem rótulo aprovado não vaza valor cru", () => {
    expect(rotuloTipoProjecao("interno_sku_control")).toBe("Atualização da equipe");
  });

  it("publicação com marca técnica não atravessa para o cliente", () => {
    const linhas = publicacoesParaCliente([
      {
        id: "1",
        projection_type: "marco",
        content_sanitized: "Etapa concluída no case_id 42 (public.crm_casos).",
      },
      {
        id: "2",
        projection_type: "marco",
        content_sanitized: "Primeira etapa da sua jornada concluída.",
      },
    ]);
    expect(linhas.map((l) => l.conteudo)).toContain("Primeira etapa da sua jornada concluída.");
    expect(linhas.every((l) => !/case_id|public\./i.test(l.conteudo))).toBe(true);
  });
});

describe("CA-PORTAL-04 — critério 12: estados não revelam existência de dado", () => {
  it("negado, indisponível e não liberado usam exatamente a mesma frase", () => {
    expect(mensagemIndisponivel("negado")).toBe(MENSAGEM_NEUTRA);
    expect(mensagemIndisponivel("indisponivel")).toBe(MENSAGEM_NEUTRA);
    expect(mensagemIndisponivel("nao_liberado")).toBe(MENSAGEM_NEUTRA);
  });

  it("mensagem neutra e de falha não citam caso, dono, tabela ou regra", () => {
    for (const m of [MENSAGEM_NEUTRA, MENSAGEM_FALHA]) {
      expect(m).not.toMatch(/caso|cliente [A-Z]|tabela|policy|endpoint|permissão negada|id/i);
      expect(contemTermoProibido(m)).toBe(false);
    }
  });

  it("erro real é substituído por mensagem de cliente", () => {
    expect(mensagemDeFalha(new Error("permission denied for table documents (RLS)"))).toBe(
      MENSAGEM_FALHA,
    );
  });
});

describe("CA-PORTAL-04 — critérios 13 e 14: marca dos componentes de dado vivo", () => {
  it("hierarquia tipográfica do cliente usa apenas tokens de marca", () => {
    const todos = Object.values(TIPO_CLIENTE).join(" ");
    expect(todos).not.toMatch(/#[0-9a-f]{6}/i);
    expect(todos).toMatch(/font-serif/);
    expect(todos).toMatch(/text-navy/);
  });

  it("azuis retirados não aparecem na camada de linguagem", () => {
    const fonte = [MENSAGEM_NEUTRA, MENSAGEM_FALHA, ...Object.values(TIPO_CLIENTE)].join(" ");
    for (const azul of AZUIS_RETIRADOS) expect(fonte).not.toContain(azul);
  });
});
