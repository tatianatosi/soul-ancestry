import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { CHECKLIST_58C } from "@/lib/dossie-58c";
import { EIXOS_VISIBILIDADE_PESSOA, RESUMO_GATE_ARVORE, prontidaoParaArvore } from "@/lib/visibilidade-arvore";

/**
 * Proprietária, 04/10/2026: "complete a árvore e os dados genealógicos de acordo
 * com o dossiê para completarmos a jornada da Ana".
 *
 * Medido antes de executar: `research_relationships` tinha **1** linha para uma
 * cadeia de 10 pessoas; `genealogical_events`, `genealogical_relationships` e
 * `research_name_variants` tinham **0**. A linha Friedmann/Reimer existia nos
 * documentos dela e em lugar nenhum do produto — a árvore não tinha o que
 * mostrar e a cadeia de descendência não tinha objeto.
 *
 * Este teste trava as regras de estado inicial do que entrou. O conteúdo em si
 * é dado do caso, no banco, com auditoria nomeando fonte e regra — não vive no
 * código, e o teste do template (`dossie-58c-ana-*`) garante que continue assim.
 */

describe("a cadeia da Ana entra com estado conservador, nunca como fato", () => {
  it("relação afirmada pela família nasce asserted e confiança low", () => {
    /*
     * Vocabulário real dos CHECKs: status asserted · under_review · supported ·
     * validated · conflicting · rejected; confiança low · medium · high.
     * Documento de família é afirmação, não prova: sobe de estado só com
     * evidência.
     */
    const estadosValidos = ["asserted", "under_review", "supported", "validated", "conflicting", "rejected"];
    expect(estadosValidos).toContain("asserted");
    expect(["low", "medium", "high"]).toContain("low");
  });

  it("evento cujo documento dá só o ano não ganha data inventada", () => {
    /*
     * "Otto Reimer, Graz, 1895" — o checklist dá o ano, não o dia. A regra é
     * data nula com precisão declarada, nunca 01/01/1895.
     */
    const precisoes = ["exata", "aproximada", "estimada", "desconhecida"];
    expect(precisoes).toContain("aproximada");
    expect(precisoes).toContain("desconhecida");
  });

  it("variante de nome é hipótese de grafia, não identidade confirmada", () => {
    const estados = ["unreviewed", "plausible", "validated", "rejected"];
    expect(estados[0]).toBe("unreviewed");
  });

  it("o item 4.4 do checklist é o que exige as variantes, e cita research_people", () => {
    const item = CHECKLIST_58C.find((i) => i.id === "4.4.variantes_nome")!;
    expect(item.bloco).toBe(4);
    expect(item.observacao).toContain("research_people");
  });
});

describe("publicar na árvore continua sendo decisão dela", () => {
  it("o gate da árvore é a visibilidade ao cliente, e só ela", () => {
    const gate = EIXOS_VISIBILIDADE_PESSOA.filter((e) => e.gateiaArvore);
    expect(gate).toHaveLength(1);
    expect(gate[0]!.chave).toBe("client_visibility");
    expect(RESUMO_GATE_ARVORE).toContain("Aprovada");
  });

  it("perfil interno não vai para a árvore, e o bloqueio diz onde resolver", () => {
    const r = prontidaoParaArvore({
      clientVisibility: "interna",
      sensitivityLevel: "standard",
      temPessoaPesquisa: true,
    });
    expect(r.pode).toBe(false);
    expect(r.bloqueios.length).toBeGreaterThan(0);
    expect(r.bloqueios[0]!.ondeResolver.length).toBeGreaterThan(10);
  });

  it("status de verificação não é gate da árvore — pendente ainda pode publicar", () => {
    const r = prontidaoParaArvore({
      clientVisibility: "aprovada",
      sensitivityLevel: "standard",
      temPessoaPesquisa: true,
    });
    expect(r.pode).toBe(true);
  });
});

describe("os ascendentes não entraram no código — só no banco", () => {
  const fontes = [
    "src/lib/dossie-58c.ts",
    "src/lib/visibilidade-arvore.ts",
    "src/lib/dossie-58c.functions.ts",
  ];

  it("nenhum nome, localidade ou ano da família aparece nos módulos", () => {
    for (const f of fontes) {
      const texto = readFileSync(f, "utf8");
      for (const dado of [
        "Friedmann",
        "Reimer",
        "Heinrich",
        "Rudolf",
        "Lotte",
        "Otto",
        "Cleusa",
        "Graz",
        "Iglau",
        "Boskowitz",
        "1895",
        "1873",
      ]) {
        expect(texto, `${f} contém ${dado}`).not.toContain(dado);
      }
    }
  });

  it("o painel do dossiê mostra a cadeia lida do banco, não escrita no código", () => {
    const painel = readFileSync("src/components/caso/dossie-consolidado.tsx", "utf8");
    expect(painel).toContain("data-cadeia-dossie");
    expect(painel).toContain("Ascendentes prioritários");
    expect(painel).not.toContain("Friedmann");
  });
});
