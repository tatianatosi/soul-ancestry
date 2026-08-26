import { describe, expect, it } from "vitest";

import {
  ELOS_CADEIA,
  avaliarCadeia,
  calendarioVencimentos,
  condicaoComercialFormal,
  derivarItensDaProposta,
  perfilEPoliticaVigentes,
  quebrarEmItens,
  vencimentosDefinidos,
} from "@/lib/cadeia-formalizacao";
import type { CampoExtraido } from "@/lib/escopo-proposta";

const campo = (c: string, valor: string | null, obrigatorio = true): CampoExtraido => ({
  campo: c,
  label: c,
  paginas: [3],
  valor,
  localizado: valor !== null,
  obrigatorio,
});

const condicaoOk = {
  id: "cc",
  status: "homologada",
  origem: "proposta_os",
  forma_pagamento: "10 parcelas mensais",
  parcelas: 10,
  valor_parcela: 320,
  valor_total_referencia: 3200,
  vencimento_dia: 10,
  primeiro_vencimento: "2026-09-10",
  product_catalog_id: "prod",
  homologado_por: "Tatiana",
  homologado_em: "2026-08-01",
};

describe("cadeia de formalização", () => {
  it("tem os nove elos na ordem institucional", () => {
    expect(ELOS_CADEIA.map((e) => e.chave)).toEqual([
      "proposta_aprovada",
      "itens_derivados",
      "anexo_i",
      "condicao_comercial",
      "vencimentos",
      "perfil_politica",
      "anexos_aplicaveis",
      "revisao_humana",
      "assinatura",
    ]);
  });

  it("quebra apenas o texto declarado, sem inventar item", () => {
    expect(quebrarEmItens("- Pesquisa\n- Dossiê; Tradução")).toEqual([
      "Pesquisa",
      "Dossiê",
      "Tradução",
    ]);
    expect(quebrarEmItens(null)).toEqual([]);
  });

  it("não deriva nada de campo obrigatório ausente e reporta falta", () => {
    const r = derivarItensDaProposta({
      extraidos: [campo("servicos_incluidos", null), campo("entregas_jornada", null)],
    });
    expect(r.itens).toHaveLength(0);
    expect(r.faltantes.map((f) => f.campo)).toEqual(["servicos_incluidos", "entregas_jornada"]);
  });

  it("classifica inclusões, exclusões e entregas derivadas", () => {
    const r = derivarItensDaProposta({
      extraidos: [
        campo("servicos_incluidos", "Pesquisa histórica\nDossiê-base"),
        campo("servicos_excluidos", null),
        campo("entregas_jornada", "Relatório de elegibilidade"),
      ],
      exclusoesTexto: "Certidões e traduções",
    });
    expect(r.itens.filter((i) => i.tipo === "inclusao")).toHaveLength(2);
    expect(r.itens.filter((i) => i.tipo === "exclusao")).toHaveLength(1);
    expect(r.itens.filter((i) => i.tipo === "entrega")).toHaveLength(1);
    expect(r.itens.every((i) => i.origem === "proposta_os")).toBe(true);
  });

  it("exige homologação completa para condição comercial formal", () => {
    expect(condicaoComercialFormal(condicaoOk).ok).toBe(true);
    expect(condicaoComercialFormal({ ...condicaoOk, status: "rascunho" }).ok).toBe(false);
    expect(condicaoComercialFormal(null).ok).toBe(false);
  });

  it("nunca infere vencimento ausente", () => {
    const r = vencimentosDefinidos({ ...condicaoOk, primeiro_vencimento: null });
    expect(r.ok).toBe(false);
    expect(r.datas).toEqual([]);
    expect(r.motivos.join(" ")).toContain("não infere");
  });

  it("calcula o calendário só a partir dos campos declarados", () => {
    expect(calendarioVencimentos({ primeiro: "2026-09-10", dia: 10, parcelas: 3 })).toEqual([
      "2026-09-10",
      "2026-10-10",
      "2026-11-10",
    ]);
    expect(vencimentosDefinidos(condicaoOk).datas).toHaveLength(10);
  });

  it("só considera política jurídica vigente com status, vigência e fonte", () => {
    const base = { tema: "AT", versao: "v1", fonte_referencia: "StbG 58c", vigencia_fim: null };
    expect(
      perfilEPoliticaVigentes({
        perfilVigente: true,
        perfilPendencias: [],
        regras: [{ ...base, status: "em_revisao", vigencia_inicio: "2026-01-01" }],
      }).ok,
    ).toBe(false);
    expect(
      perfilEPoliticaVigentes({
        perfilVigente: true,
        perfilPendencias: [],
        regras: [{ ...base, status: "vigente", vigencia_inicio: "2026-01-01" }],
        hoje: new Date("2026-08-22"),
      }).ok,
    ).toBe(true);
  });

  it("bloqueia elos posteriores ao primeiro pendente e nunca libera assinatura", () => {
    const r = avaliarCadeia({
      validadeProposta: { valida: false, motivos: ["Proposta não aprovada."] },
      extraidos: [],
      ordemServico: null,
      itensPersistidos: 0,
      condicao: null,
      perfilVigente: false,
      perfilPendencias: ["Perfil sob revisão jurídica."],
      regras: [],
      pendenciasAnexos: [],
      gatesAnexos: [],
      revisaoHumanaAprovadaEm: null,
      assinaturaRegistradaEm: null,
    });
    expect(r.elos[0].estado).toBe("pendente");
    expect(r.elos.slice(1).every((e) => e.estado === "bloqueado")).toBe(true);
    expect(r.assinaturaLiberada).toBe(false);
    expect(r.proximoElo).toBe("proposta_aprovada");
  });

  it("libera assinatura apenas quando todos os elos anteriores estão cumpridos", () => {
    const r = avaliarCadeia({
      validadeProposta: { valida: true, motivos: [] },
      extraidos: [
        campo("servicos_incluidos", "Pesquisa"),
        campo("servicos_excluidos", "Traduções"),
        campo("entregas_jornada", "Relatório"),
      ],
      ordemServico: {
        id: "os",
        case_id: "caso",
        status: "draft",
        scope_summary: "• Pesquisa",
        deliverable_summary: "• Relatório",
      },
      itensPersistidos: 3,
      condicao: condicaoOk,
      perfilVigente: true,
      perfilPendencias: [],
      regras: [
        {
          tema: "AT",
          versao: "v1",
          status: "vigente",
          vigencia_inicio: "2026-01-01",
          vigencia_fim: null,
          fonte_referencia: "StbG 58c",
        },
      ],
      pendenciasAnexos: [],
      gatesAnexos: [],
      revisaoHumanaAprovadaEm: "2026-08-20T10:00:00Z",
      assinaturaRegistradaEm: null,
      hoje: new Date("2026-08-22"),
    });
    expect(r.elos.filter((e) => e.chave !== "assinatura").every((e) => e.estado === "ok")).toBe(
      true,
    );
    expect(r.assinaturaLiberada).toBe(true);
    expect(r.elos.at(-1)?.estado).toBe("pendente");
  });
});
