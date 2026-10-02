import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { geracaoAscendente, arestasFiliacao, type Perfil, type Relacao } from "@/lib/pessoas-linhagens";

const perfil = (id: string, nome: string, status = "pendente"): Perfil =>
  ({
    research_person_id: id,
    nome_completo: nome,
    nome_nascimento: null,
    sexo: null,
    nascimento_data: null,
    nascimento_localidade: null,
    morte_data: null,
    morte_localidade: null,
    status_verificacao: status,
    archived_at: null,
  }) as unknown as Perfil;

const relacaoPaiMae = (de: string, para: string, status = "confirmado"): Relacao =>
  ({
    id: `${de}-${para}`,
    person_from_id: de,
    person_to_id: para,
    relation_type: "pai_mae",
    status_pesquisa: status,
    confidence_level: null,
    archived_at: null,
  }) as unknown as Relacao;

describe("geracaoAscendente (Corte Pesquisa G1...Gn, 02/10/2026) — G1=âncora, sobe por filiação real", () => {
  it("sem âncora: lista vazia, nada inventado", () => {
    expect(geracaoAscendente(null, [], [])).toEqual([]);
    expect(geracaoAscendente("p1", [], [])).toEqual([]);
  });

  it("âncora sozinha, sem pais gravados: só G1", () => {
    const perfis = [perfil("p1", "Ana")];
    const r = geracaoAscendente("p1", perfis, []);
    expect(r).toEqual([{ personId: "p1", nome: "Ana", status: "pendente", geracao: 1 }]);
  });

  it("âncora com pai e mãe: G1=âncora, G2=pais, G3=avós — nunca inferido, só por aresta pai_mae gravada", () => {
    const perfis = [perfil("filha", "Ana"), perfil("mae", "Clara"), perfil("pai", "Bento"), perfil("avo", "Zé")];
    const relacoes = [
      relacaoPaiMae("mae", "filha"),
      relacaoPaiMae("pai", "filha"),
      relacaoPaiMae("avo", "pai"),
    ];
    const r = geracaoAscendente("filha", perfis, relacoes);
    const porGeracao = new Map<number, string[]>();
    for (const p of r) porGeracao.set(p.geracao, [...(porGeracao.get(p.geracao) ?? []), p.nome]);
    expect(porGeracao.get(1)).toEqual(["Ana"]);
    expect(new Set(porGeracao.get(2))).toEqual(new Set(["Clara", "Bento"]));
    expect(porGeracao.get(3)).toEqual(["Zé"]);
  });

  it("relação refutada/descartada nunca conta como filiação (mesma regra de arestasFiliacao)", () => {
    const perfis = [perfil("filha", "Ana"), perfil("suposto_pai", "X")];
    const relacoes = [relacaoPaiMae("suposto_pai", "filha", "refutado")];
    const r = geracaoAscendente("filha", perfis, relacoes);
    expect(r.map((p) => p.personId)).toEqual(["filha"]);
  });

  it("pessoa arquivada nunca entra, mesmo que a relação exista", () => {
    const perfis = [perfil("filha", "Ana"), { ...perfil("mae", "Clara"), archived_at: "2026-01-01" } as Perfil];
    const relacoes = [relacaoPaiMae("mae", "filha")];
    const r = geracaoAscendente("filha", perfis, relacoes);
    expect(r.map((p) => p.personId)).toEqual(["filha"]);
  });

  it("arestasFiliacao segue exportada e com a mesma regra (não duplicada em geracaoAscendente)", () => {
    const relacoes = [relacaoPaiMae("pai", "filho")];
    const arestas = arestasFiliacao(relacoes);
    expect(arestas).toEqual([{ pai: "pai", filho: "filho", tipo: "pai_mae", status: "confirmado" }]);
  });
});

describe("Corte Pesquisa G1...Gn (02/10/2026) — aba nova no Desk, sem rota paralela, reaproveitando dado já carregado", () => {
  const pagina = readFileSync("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx", "utf8");

  it("tem a aba 'Por geração' e usa geracaoAscendente", () => {
    expect(pagina).toContain('{ id: "geracao", rotulo: "Por geração (G1...Gn)" }');
    expect(pagina).toContain("geracaoAscendente(");
  });

  it("CTA real: registrar evento/módulo a partir da pessoa da geração, pré-selecionando a pessoa (não é link morto)", () => {
    expect(pagina).toContain("Registrar evento desta pessoa");
    expect(pagina).toContain("Registrar módulo histórico desta pessoa");
    expect(pagina).toContain("personFocoInicial={personFoco}");
  });

  it("nenhuma tabela, rota ou escritor novo: a aba só lê dados que painelPessoasLinhagens já carrega", () => {
    expect(pagina).not.toMatch(/\.from\("geracoes"\)/);
    expect(pagina).not.toContain("salvarGeracao");
  });
});

describe("Corte Pesquisa G1...Gn (02/10/2026) — AbaEventos ganhou os campos que o servidor já aceitava e o form nunca mostrou", () => {
  const pagina = readFileSync("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx", "utf8");

  it("formulário de evento agora expõe impact_type, data_precisao e client_visibility", () => {
    expect(pagina).toContain("IMPACTO_EVENTO");
    expect(pagina).toContain('novo.data_precisao');
    expect(pagina).toContain('novo.client_visibility');
  });
});

describe("Corte Pesquisa G1...Gn (02/10/2026) — IMPACTO_EVENTO é o vocabulário real do CHECK, não inventado", () => {
  const migration = readFileSync("supabase/migrations/20260822205306_db49fc07-e131-469b-b28a-f0e9220509e5.sql", "utf8");

  it("os 6 valores batem com o CHECK de genealogical_events.impact_type", () => {
    expect(migration).toContain("CHECK (impact_type IN ('familiar','patrimonial','migratorio','documental','juridico','memoria'))");
  });
});
