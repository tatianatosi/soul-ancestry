import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { pessoasDaArvore, type ProjecaoArvore } from "@/lib/arvore-publicacao";
import { ehPessoaPublicada, publicacoesParaCliente, type PublicacaoCliente } from "@/lib/projecoes-cliente";

/**
 * Corte de sincronização (07/10/2026) — "Fazer Home e Jornada lerem a mesma
 * projeção autorizada já usada pela Árvore", com fonte única
 * `app_projections`/`portal_projecoes`, contagem por `pessoa_id` distinto e
 * Árvore como a única tela que lista nomes e vínculos por geração.
 *
 * Medido no banco em 07/10/2026 (caso da Ana): a view `portal_projecoes`
 * devolve 6 nós de árvore, um por `pessoa_id`, e nenhum outro caso tem nó de
 * árvore — a prova de dado está no relato; aqui ficam as travas de regressão.
 */

const ler = (p: string) => readFileSync(p, "utf8");

const base = { projection_type: "arvore", effective_from: "2026-10-05T00:00:00Z" };

describe("1. pessoa publicada duas vezes não infla a contagem", () => {
  it("duas publicações do mesmo pessoa_id contam como uma pessoa", () => {
    const projecoes: ProjecaoArvore[] = [
      { ...base, id: "p-antiga", pessoa_id: "pessoa-1", content_sanitized: "Otto Reimer", geracao_cliente: 5 },
      {
        ...base,
        id: "p-nova",
        pessoa_id: "pessoa-1",
        content_sanitized: "Otto Reimer · bisavô materno",
        geracao_cliente: 5,
        effective_from: "2026-10-06T00:00:00Z",
      },
    ];
    const pessoas = pessoasDaArvore(projecoes);
    expect(pessoas).toHaveLength(1);
    // Vale a publicação mais recente, não a soma.
    expect(pessoas[0]!.vinculo).toBe("bisavô materno");
  });

  it("pessoas distintas somam; projeção sem pessoa_id não entra na contagem", () => {
    const pessoas = pessoasDaArvore([
      { ...base, id: "1", pessoa_id: "pessoa-1", content_sanitized: "Otto Reimer", geracao_cliente: 5 },
      { ...base, id: "2", pessoa_id: "pessoa-2", content_sanitized: "Lotte Friedmann", geracao_cliente: 5 },
      { ...base, id: "3", pessoa_id: null, content_sanitized: "Nota geral sobre a árvore" },
    ]);
    expect(pessoas).toHaveLength(2);
  });
});

describe("2. pessoa retirada deixa de aparecer", () => {
  it("a projeção retirada não chega ao leitor, e a contagem cai", () => {
    const comDuas: ProjecaoArvore[] = [
      { ...base, id: "1", pessoa_id: "pessoa-1", content_sanitized: "Otto Reimer", geracao_cliente: 5 },
      { ...base, id: "2", pessoa_id: "pessoa-2", content_sanitized: "Lotte Friedmann", geracao_cliente: 5 },
    ];
    expect(pessoasDaArvore(comDuas)).toHaveLength(2);

    // Retirada = arquivada no Desk; a view do portal não devolve a linha.
    const depoisDaRetirada = comDuas.filter((p) => p.id !== "2");
    const pessoas = pessoasDaArvore(depoisDaRetirada);
    expect(pessoas).toHaveLength(1);
    expect(pessoas.map((p) => p.nome)).not.toContain("Lotte Friedmann");
  });

  it("a view do portal exclui arquivada e não publicada — o App nunca filtra isso sozinho", () => {
    const sql = ler("supabase/migrations/20260928120000_app_projections_geracao_cliente_portal_pessoa.sql");
    expect(sql).toContain("p.approval_status = 'published'");
    expect(sql).toContain("archived_at IS NULL");
  });
});

/**
 * Retificação A e B (07/10/2026): a separação semântica. Pessoa publicada
 * alimenta "Pessoas conectadas"; nunca "Achados" nem a linha de
 * acontecimentos. Nota sobre a árvore (projeção de árvore SEM pessoa)
 * continua sendo achado/acontecimento.
 */
describe("A/B. pessoa não produz achado nem acontecimento", () => {
  const bruta = (over: Record<string, unknown>) => ({
    id: "x",
    projection_type: "arvore",
    content_sanitized: "Otto Reimer",
    effective_from: "2026-10-05T00:00:00Z",
    ...over,
  });

  it("a sanitização marca pessoa sem vazar id interno, para distinguir nó de nota", () => {
    const publicadas = publicacoesParaCliente([
      bruta({ id: "no", pessoa_id: "pessoa-1", geracao_cliente: 5 }),
      bruta({ id: "nota", pessoa_id: null, content_sanitized: "Prancha da linha materna concluída em 1912." }),
    ]);
    const no = publicadas.find((p) => p.id === "no")!;
    const nota = publicadas.find((p) => p.id === "nota")!;
    expect(no.ehPessoa).toBe(true);
    expect(nota.ehPessoa).toBe(false);
    // O id interno de research_people NUNCA atravessa a fronteira do App.
    expect(JSON.stringify(publicadas)).not.toContain("pessoa-1");
    expect(ehPessoaPublicada(no)).toBe(true);
    expect(ehPessoaPublicada(nota)).toBe(false);
  });

  it("A. seis pessoas e nenhum achado dão seis conectadas e zero achados", () => {
    const seisPessoas = Array.from({ length: 6 }, (_, i) =>
      bruta({ id: `no-${i}`, pessoa_id: `pessoa-${i}`, content_sanitized: `Ancestral ${i}`, geracao_cliente: 3 }),
    );
    const publicadas = publicacoesParaCliente(seisPessoas);

    // Home: a contagem de pessoas conectadas vem do leitor da Árvore.
    expect(pessoasDaArvore(seisPessoas as ProjecaoArvore[])).toHaveLength(6);

    // Home: o filtro de achados (mesma regra da tela) não recebe nenhuma delas.
    const achados = publicadas.filter(
      (item: PublicacaoCliente) =>
        ["achado", "arvore", "evidencia", "linha_tempo", "legado", "relatorio_fase"].includes(item.tipo) &&
        !ehPessoaPublicada(item),
    );
    expect(achados).toHaveLength(0);
  });

  it("B. pessoa sem fato não entra na linha; nota com ano documentado entra", () => {
    const publicadas = publicacoesParaCliente([
      bruta({ id: "no", pessoa_id: "pessoa-1", content_sanitized: "Otto Reimer", geracao_cliente: 5 }),
      bruta({ id: "fato", pessoa_id: null, content_sanitized: "Casamento Silveira registrado em 1912, em Anápolis." }),
    ]);
    const linha = publicadas.filter((item) => !ehPessoaPublicada(item));
    expect(linha.map((i) => i.id)).toEqual(["fato"]);
  });
});

/**
 * Retificação D (07/10/2026): contagem de um caso só não prova isolamento —
 * é ausência de dado de contraste. Aqui há duas famílias com dado, e o
 * recorte é exercido nos dois sentidos. É teste UNITÁRIO do recorte por
 * caso (mock), não teste de integração de RLS: a policy do banco e o login
 * real seguem fora do alcance desta suíte, e isso está dito no relato.
 */
describe("D. isolamento com dois casos que têm dado (unitário, não integração)", () => {
  const CASO_A = "caso-a";
  const CASO_B = "caso-b";

  const universo = [
    { id: "a1", case_id: CASO_A, projection_type: "arvore", pessoa_id: "pa-1", content_sanitized: "Ancestral A1", geracao_cliente: 5, effective_from: "2026-10-05T00:00:00Z" },
    { id: "a2", case_id: CASO_A, projection_type: "arvore", pessoa_id: "pa-2", content_sanitized: "Ancestral A2", geracao_cliente: 4, effective_from: "2026-10-05T00:00:00Z" },
    { id: "b1", case_id: CASO_B, projection_type: "arvore", pessoa_id: "pb-1", content_sanitized: "Ancestral B1", geracao_cliente: 3, effective_from: "2026-10-05T00:00:00Z" },
  ];

  /** Mesmo recorte do leitor: `.in("case_id", [casoAutorizado])`. */
  const comoOLeitor = (casoAutorizado: string | null) =>
    casoAutorizado ? universo.filter((p) => p.case_id === casoAutorizado) : [];

  it("cada família vê só a sua, e as duas têm dado (contraste real)", () => {
    const a = pessoasDaArvore(comoOLeitor(CASO_A) as ProjecaoArvore[]);
    const b = pessoasDaArvore(comoOLeitor(CASO_B) as ProjecaoArvore[]);
    expect(a.map((p) => p.nome)).toEqual(["Ancestral A1", "Ancestral A2"]);
    expect(b.map((p) => p.nome)).toEqual(["Ancestral B1"]);
    // O teste não se satisfaz por B estar vazio.
    expect(b.length).toBeGreaterThan(0);
    expect(a.some((p) => p.nome.includes("B1"))).toBe(false);
    expect(b.some((p) => p.nome.includes("A1"))).toBe(false);
  });

  it("acesso negado (sem caso autorizado) não devolve nó de ninguém", () => {
    expect(pessoasDaArvore(comoOLeitor(null) as ProjecaoArvore[])).toEqual([]);
  });

  it("o leitor do App filtra pelo caso autorizado, nunca por organização inteira", () => {
    const fn = ler("src/lib/portal-dados-vivos.functions.ts");
    expect(fn).toContain('.from("portal_projecoes")');
    expect(fn).toContain('.in("case_id", alvo)');
    expect(fn).toContain("const alvo = [String(casoAtivo.id)]");
  });
});

describe("4. Home, Jornada e Árvore chegam ao mesmo conjunto, cada uma na sua linguagem", () => {
  const home = ler("src/routes/portal/index.tsx");
  const jornada = ler("src/routes/portal/jornada.tsx");
  const arvore = ler("src/routes/portal/arvore.tsx");

  it("fonte única: as três telas vivem do mesmo leitor de projeções", () => {
    for (const tela of [home, jornada, arvore]) expect(tela).toMatch(/usePortalVivo|portalVivo/);
    expect(home).toContain("pessoasDaArvore(");
    expect(arvore).toContain("pessoasDaArvore(");
  });

  it("Home mostra só a contagem de pessoas distintas e o link para a Árvore", () => {
    expect(home).toContain("pessoasDaArvore(vivo.data?.projecoes ?? []).length");
    expect(home).toContain("Pessoas conectadas");
    expect(home).toContain('to="/portal/arvore"');
    expect(home).toContain("Ver Árvore");
  });

  it("Árvore é a única tela que lista nome e vínculo por geração", () => {
    expect(arvore).toContain("geracao");
    // Home consome só o tamanho da lista: nenhum nome é renderizado lá.
    expect(home).not.toMatch(/pessoasDaArvore\([^)]*\)\s*\.map\(/);
  });

  /*
   * Retificação de 07/10/2026: a asserção anterior congelava justamente o
   * defeito — "árvore vira Passado". Pessoa não é acontecimento. O que o
   * teste trava agora é o contrário: o nó de pessoa é excluído da linha.
   */
  it("Jornada exclui o nó de pessoa da linha — nome não vira acontecimento", () => {
    expect(jornada).toContain("ehPessoaPublicada");
    expect(jornada).toContain("!ehPessoaPublicada(item)");
    expect(jornada).toContain("anoHistoricoCitado");
  });

  it("E. a convenção G1–G10 permanece — G6/G7 não desaparecem da leitura", () => {
    const pessoas = pessoasDaArvore([
      { ...base, id: "1", pessoa_id: "p-6", content_sanitized: "Rudolf Friedmann", geracao_cliente: 6 },
      { ...base, id: "2", pessoa_id: "p-7", content_sanitized: "Heinrich Friedmann", geracao_cliente: 7 },
    ]);
    expect(pessoas.map((p) => p.geracao).sort()).toEqual([6, 7]);
  });

  it("nenhuma das três telas exibe preço, SKU, contrato ou dado civil", () => {
    for (const tela of [home, jornada, arvore]) {
      expect(tela).not.toMatch(/\bR\$\s?\d/);
      expect(tela).not.toMatch(/\bSKU\b/);
      expect(tela).not.toMatch(/\bcpf\b/i);
    }
  });
});
