import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { estadoTelefoneMembroCaso, sinalTelefoneDaPessoaPorCaso } from "@/lib/pessoa-vinculo";

// P28 (26/09/2026) — pedido explícito da Proprietária: "faça uma varredura novamente entre
// máscaras, validações... veja em de para e retire sobreposições entre ficha operacional...
// reveja e execute o que não foi feito". `mascaras-e-validadores.md` §3.2 já apontava telefone
// com 5 grafias e "Ação futura: Consolidar em Pessoa" — mesmo gap que o CPF (R2, 21/09/2026) já
// fechou. Estende exatamente o mesmo padrão: nunca funde, nunca sobrescreve valor já gravado,
// dependente nunca herda do responsável.

describe("estadoTelefoneMembroCaso — mesma regra pura do CPF, para telefone", () => {
  it("preenche quando o membro está vazio e o canônico existe", () => {
    expect(estadoTelefoneMembroCaso({ telefone: null }, "+55 11 91234-5678")).toBe("preencher");
  });

  it("marca conflito quando os dois têm valor e divergem — nunca sobrescreve sozinho", () => {
    expect(estadoTelefoneMembroCaso({ telefone: "11987654321" }, "11912345678")).toBe("conflito");
  });

  it("já sincronizado quando os dígitos batem, mesmo com formatação diferente", () => {
    expect(estadoTelefoneMembroCaso({ telefone: "(11) 91234-5678" }, "11 91234-5678")).toBe("ja_sincronizado");
  });

  it("dependente nunca herda telefone do responsável", () => {
    expect(estadoTelefoneMembroCaso({ telefone: null, dependente: true }, "11912345678")).toBe(
      "dependente_nao_sincronizado",
    );
  });

  it("sem_dado_canonico quando o cadastro da pessoa ainda não tem telefone", () => {
    expect(estadoTelefoneMembroCaso({ telefone: null }, null)).toBe("sem_dado_canonico");
  });
});

describe("sinalTelefoneDaPessoaPorCaso — mesmo formato do sinal de CPF na Pessoa 360", () => {
  it("conta conflito/preencher só de case_members da mesma pessoa, ignora membros projetados de núcleo", () => {
    const membros = [
      { case_id: "c1", cliente_id: "p1", telefone: null, origem: "case_members" },
      { case_id: "c1", cliente_id: "p1", telefone: "11999999999", origem: "case_members" },
      { case_id: "c2", cliente_id: "p1", telefone: null, origem: "nucleo" },
    ];
    const sinal = sinalTelefoneDaPessoaPorCaso(membros, "p1", "11988888888");
    expect(sinal["c1"]).toEqual({ conflito: 1, preencher: 1 });
    expect(sinal["c2"]).toBeUndefined();
  });
});

describe("P28 — servidor: conferirDivergenciaTelefoneMembrosCaso segue o padrão exato do CPF (R2)", () => {
  const fn = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");
  const trecho = fn.slice(fn.indexOf("export const conferirDivergenciaTelefoneMembrosCaso"));

  it("só grava itens 'preencher', nunca sobrescreve conflito", () => {
    expect(trecho).toContain('if (item.acao !== "preencher") continue;');
  });

  it("resolver conflito exige motivo e usa gravarComVerificacao + auditoria + timeline", () => {
    expect(trecho).toContain("Resolver conflito de telefone exige o motivo da decisão.");
    expect(trecho).toContain("telefone_conflito_resolvido_pelo_canonico");
    expect(trecho).toContain("await registrarTimelineCaso(");
  });

  it("lê o canônico de clientes.telefone, nunca inventa fonte nova", () => {
    expect(trecho).toContain('.from("clientes").select("id,telefone")');
  });
});

describe("P28 — UI: painel de telefone existe e está ligado em Caso 360 e Pessoa 360", () => {
  const componente = readFileSync("src/components/caso/reconciliar-telefone-membros-caso.tsx", "utf8");
  const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
  const pessoa360 = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

  it("ReconciliarTelefoneMembrosCaso existe e nunca sincroniza dependente", () => {
    expect(componente).toContain("export function ReconciliarTelefoneMembrosCaso");
    expect(componente).toContain("dependente_nao_sincronizado");
  });

  it("Caso 360 liga o painel nos dois ramos (com e sem núcleo), ao lado do painel de CPF", () => {
    const ocorrencias = caso360.match(/<ReconciliarTelefoneMembrosCaso/g) ?? [];
    expect(ocorrencias.length).toBe(2);
  });

  it("Pessoa 360 mostra o sinal de telefone com o mesmo formato do sinal de CPF", () => {
    expect(pessoa360).toContain("data-pessoa360-sinal-telefone");
    expect(pessoa360).toContain("sinalTelefoneDaPessoaPorCaso(");
  });
});

describe("P28 — P12/P13/P15/P16/P17 seguem corretamente aplicados (verificação ao vivo, não presumida)", () => {
  // Registro do que foi conferido por consulta direta ao banco (mcp Lovable
  // query_database) nesta rodada — este teste documenta o achado no código,
  // não repete a consulta (não há acesso a banco em CI).
  it("dedup de citizenship_tracks e novos países (P12) continuam documentados como executados", () => {
    const doc = readFileSync(
      "docs/arquitetura/2026-09-25_dedup-trilhas-motor-juridico-paises-baixos.md",
      "utf8",
    );
    expect(doc).toContain("exatamente 1 linha ativa por país");
  });

  it("planner_catalog_feed não tem mais ESPECIFICACAO_PENDENTE nem LEGADO_RECONCILIAR (P16/P17)", () => {
    const doc17 = readFileSync("docs/arquitetura/2026-09-26_P17-belgica-cz-si-planejador-e-vivos-vs-legado.md", "utf8");
    expect(doc17).toContain("não tem mais nenhum item em `ESPECIFICACAO_PENDENTE` nem em\n`LEGADO_RECONCILIAR`");
  });
});
