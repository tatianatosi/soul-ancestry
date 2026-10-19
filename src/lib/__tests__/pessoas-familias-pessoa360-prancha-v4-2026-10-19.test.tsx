import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({ Link: (p: { children: React.ReactNode }) => <a>{p.children}</a> }));

/*
 * 19/10/2026 — Pessoas & Famílias e Pessoa 360 na composição exata da
 * prancha V4: todo elemento gráfico aparece; sem dado, estado vazio honesto.
 */
const funcoes = readFileSync("src/lib/pessoas-linhagens.functions.ts", "utf8");

describe("Pessoas & Famílias — prancha V4", () => {
  it("grade de gerações: duas células por linha, nome · ano, vazio tracejado sem nome", async () => {
    const { GradeGeracoes } = await import("@/components/pessoas/composicao-linhagem-v4");
    const html = renderToStaticMarkup(
      <GradeGeracoes total={5} geracoes={new Map([[2, [{ id: "a", nome: "Pessoa A", ano: "1891", confirmado: true }]]])} />,
    );
    expect(html.match(/data-geracao="G\d"/g)).toHaveLength(5);
    expect(html.indexOf('data-geracao="G5"')).toBeLessThan(html.indexOf('data-geracao="G1"'));
    expect(html).toContain("Pessoa A · 1891");
    expect(html).toContain("Nenhuma pessoa registrada em G1");
  }, 20000);

  it("árvore do núcleo: sem registro, os lugares aparecem tracejados e sem nome inventado", async () => {
    const { ArvoreNucleo } = await import("@/components/pessoas/composicao-linhagem-v4");
    const html = renderToStaticMarkup(<ArvoreNucleo acima={[]} centro={null} abaixo={[]} />);
    for (const papel of ["Ascendente", "Cônjuge", "Requerente", "Dependente"]) expect(html).toContain(papel);
    expect(html.match(/data-vaga-arvore/g)).toHaveLength(4);
  }, 20000);

  it("ano e cônjuge vêm só do perfil e da relação gravada (leitura pura)", () => {
    expect(funcoes).toContain("nascimento_data_aproximada");
    expect(funcoes).toContain('r.relation_type === "conjuge"');
    expect(funcoes).toContain("conjugesAncora,");
  });
});

describe("Pessoa 360 — prancha V4 (19/10)", () => {
  const vazio = { cliente: { id: "c" }, casos: [], caseMembers: [], documentos: [] };

  it("confiança: sem nota registrada não há número nem estrela acesa", async () => {
    const { ComposicaoPessoa360V4 } = await import("@/components/pessoa/composicao-pessoa360-v4");
    const html = renderToStaticMarkup(
      <ComposicaoPessoa360V4
        nome="A"
        dados={{ ...vazio, documentos: [{ id: "d", titulo: "Certidão", status: "aprovado" }] }}
      />,
    );
    expect(html).toContain("Confiança sem nota registrada");
    expect(html).not.toContain("5.0");
    expect(html).not.toContain("fill-gold text-gold");
  }, 20000);

  it("rede de vínculos: estar no mesmo caso não vira aresta", async () => {
    const { ComposicaoPessoa360V4 } = await import("@/components/pessoa/composicao-pessoa360-v4");
    const html = renderToStaticMarkup(
      <ComposicaoPessoa360V4
        nome="Ana Silva"
        dados={{
          ...vazio,
          caseMembers: [
            { id: "eu", cliente_id: "c", nome: "Ana Silva", pai_id: "p" },
            { id: "p", nome: "José Silva" },
            { id: "x", nome: "Xavier Souza" },
          ],
        }}
      />,
    );
    const rede = html.slice(html.indexOf("data-pessoa360-rede"));
    expect(rede).toContain(">JS<");
    expect(rede).not.toContain(">XS<");
  }, 20000);

  it("parentesco no desenho da prancha: lugares vazios tracejados", async () => {
    const { ComposicaoPessoa360V4 } = await import("@/components/pessoa/composicao-pessoa360-v4");
    const html = renderToStaticMarkup(<ComposicaoPessoa360V4 nome="A" dados={vazio} />);
    expect(html.match(/data-vaga-parentesco/g)?.length).toBeGreaterThanOrEqual(4);
    expect(html).toContain("Pessoa canônica");
  }, 20000);
});
