import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { montarBlocosFichaUnica } from "@/lib/ficha-unica-caso";

const rotulos = {
  statusPesquisa: { em_andamento: "Em andamento" } as Record<string, string>,
  statusAutorizacao: { autorizado: "Autorizado" } as Record<string, string>,
  statusGatePesquisa: { liberado: "Liberado" } as Record<string, string>,
  statusPessoa: { ativo: "Ativo" } as Record<string, string>,
  statusIdentidade: { confirmed: "Confirmada" } as Record<string, string>,
  statusVinculo: { confirmado: "Confirmado" } as Record<string, string>,
  statusFonte: { catalogada: "Catalogada" } as Record<string, string>,
  statusSolicitacao: { pendente: "Pendente" } as Record<string, string>,
};

describe("ficha-unica-caso (02/10/2026) — Ficha Única progressiva, sem duas fichas concorrentes", () => {
  it("sem ficha master nem piloto: nenhum bloco, nada inventado", () => {
    const blocos = montarBlocosFichaUnica({ caseId: "c1", ficha: null, piloto: null, rotulos });
    expect(blocos).toEqual([]);
  });

  it("com ficha master: gera os blocos macro (visão do caso, origem/árvore/documentos), cada um com dono/origem/rota de edição", () => {
    const blocos = montarBlocosFichaUnica({
      caseId: "c1",
      ficha: {
        case_id: "CA-1",
        case_nome: "Ana",
        cliente_nome: "Ana",
        status_caso: "em_pesquisa",
        rota_provavel: "jure sanguinis",
        etapa_atual: "Pesquisa inicial",
        hipotese_principal: "linha materna",
        heatmap_pais_1: "Itália",
        heatmap_pct_1: 62,
        origem_pessoas_conectadas: 4,
        origem_geracoes_lidas: 3,
        doc_principal: "Certidão",
        doc_pendencia: null,
        alerta_titulo: null,
        descoberta_1: null,
        conta_historico_1: null,
      } as never,
      piloto: null,
      rotulos,
    });
    const visao = blocos.find((b) => b.id === "visao")!;
    expect(visao.dono).toBe("Caso / Planejador");
    expect(visao.rotaEdicao?.to).toBe("/casos/$caseId");
    expect(visao.campos?.find((c) => c.rotulo === "Caso")?.valor).toBe("CA-1 — Ana");

    expect(visao.campos?.find((c) => c.rotulo === "País 1 (heatmap)")?.valor).toBe("Itália");

    const origem = blocos.find((b) => b.id === "origem-documentos")!;
    expect(origem.rotaEdicao?.to).toBe("/pessoas-linhagens/$caseId");
    expect(origem.campos?.find((c) => c.rotulo === "Documento principal liberado")?.valor).toBe("Certidão");
  });

  it("com piloto: gera os blocos de preparação de pesquisa (pessoas, vínculos, hipóteses, lacunas, fontes, documentos, plano), cada um com dono 'Pesquisa do caso'", () => {
    const blocos = montarBlocosFichaUnica({
      caseId: "c1",
      ficha: null,
      piloto: {
        pesquisa: { id: "rc1", country_context: "Itália", status: "em_andamento", external_research_authorization_status: "autorizado", external_research_gate_status: "liberado", family_line_summary_internal: "resumo" },
        pessoas: [{ id: "p1", canonical_name: "Ana", person_status: "ativo", identity_status: "confirmed" }],
        vinculos: [{ person_from_id: "p1", person_to_id: "p1", relation_type: "mae", status: "confirmado", supporting_evidence_count: 2 }],
        hipoteses: [{ titulo: "H1", status: "aberta", grau_confianca: "media" }],
        lacunas: [{ title: "Falta certidão", category: "documento", severity: "alta", status: "aberta" }],
        fontes: [{ title: "Antenati", source_status: "catalogada", source_type: "arquivo" }],
        solicitacoes: [{ requested_document_type: "certidao", status: "pendente", person_id: "p1" }],
        bloqueios: [],
        planoAberto: true,
      },
      rotulos,
    });
    const ids = blocos.map((b) => b.id);
    expect(ids).toEqual([
      "preparacao-pesquisa",
      "pessoas",
      "vinculos",
      "hipoteses",
      "lacunas",
      "fontes",
      "documentos-solicitacoes",
      "plano-acao",
    ]);
    for (const b of blocos) {
      expect(b.dono === "Pesquisa do caso" || b.dono === "Caso / Planejador").toBe(true);
      expect(b.origem).toBeTruthy();
    }
    const pessoas = blocos.find((b) => b.id === "pessoas")!;
    expect(pessoas.linhas?.[0]).toContain("Ana");
    expect(pessoas.rotaEdicao?.to).toBe("/pessoas-linhagens/$caseId");

    const hipoteses = blocos.find((b) => b.id === "hipoteses")!;
    expect(hipoteses.rotaEdicao).toEqual({ to: "/pesquisa-modulo/$id", params: { id: "rc1" }, label: "Abrir hipóteses estruturadas" });

    const plano = blocos.find((b) => b.id === "plano-acao")!;
    expect(plano.rotaEdicao?.to).toBe("/plano-acao/$caseId");
    expect(plano.linhas?.[0]).toContain("Autorização registrada");
  });

  it("com ficha master E piloto: os dois conjuntos de blocos coexistem numa só lista progressiva (não duas fichas separadas)", () => {
    const blocos = montarBlocosFichaUnica({
      caseId: "c1",
      ficha: { case_id: "CA-1", case_nome: "Ana" } as never,
      piloto: {
        pesquisa: { id: "rc1" },
        pessoas: [],
        vinculos: [],
        hipoteses: [],
        lacunas: [],
        fontes: [],
        solicitacoes: [],
        bloqueios: [],
        planoAberto: false,
      },
      rotulos,
    });
    expect(blocos[0].id).toBe("visao");
    expect(blocos.some((b) => b.id === "preparacao-pesquisa")).toBe(true);
  });
});

describe("Corte Ficha Única (02/10/2026) — Caso 360 monta um único componente, não dois painéis concorrentes", () => {
  const casoIndex = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

  it("renderiza PainelFichaUnica e não renderiza mais PainelFichaPiloto/PainelFichaMaster separados", () => {
    expect(casoIndex).toContain("<PainelFichaUnica caseId={id} />");
    expect(casoIndex).not.toContain("<PainelFichaPiloto");
    expect(casoIndex).not.toContain("<PainelFichaMaster");
  });

  it("a aba Pesquisa tem um atalho de salto direto para a Ficha Única", () => {
    expect(casoIndex).toContain("#ficha-unica");
  });
});

describe("Corte Ficha Única (02/10/2026) — os dois componentes antigos foram removidos, não só desmontados", () => {
  it("ficha-master.tsx e ficha-piloto-genealogica.tsx (componentes) não existem mais no disco", () => {
    expect(() => readFileSync("src/components/caso/ficha-master.tsx", "utf8")).toThrow();
    expect(() => readFileSync("src/components/caso/ficha-piloto-genealogica.tsx", "utf8")).toThrow();
  });

  it("o módulo puro ficha-piloto-genealogica.ts (não o componente) continua existindo — ainda usado por outros motores", () => {
    expect(() => readFileSync("src/lib/ficha-piloto-genealogica.ts", "utf8")).not.toThrow();
  });
});
