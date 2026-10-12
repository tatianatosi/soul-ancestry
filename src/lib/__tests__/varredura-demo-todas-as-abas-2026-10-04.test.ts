import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { ehFixtureLinha, semFixtures } from "@/lib/fixtures";

/**
 * "Demo revise e faça uma varredura em todas as abas" (Proprietária,
 * 04/10/2026).
 *
 * A varredura percorre as 38 rotas do menu, segue os `createServerFn` que cada
 * rota importa e exige filtro de demonstração em toda função que lista caso,
 * cliente, lead, proposta, contrato, fatura, tarefa ou ordem de serviço. O
 * teste é a própria varredura: se alguém acrescentar uma aba ou um leitor sem
 * filtro, ele falha aqui, não em produção.
 *
 * Resultado da varredura: nenhuma aba do menu precisa de exceção. Fora do
 * menu fica `/golive*`, o Desk paralelo cuja canonicidade a Proprietária
 * ainda não decidiu (AGENTS.md) — não se mexe nele por iniciativa de agente.
 */

const TABELAS_OPERACIONAIS = [
  "crm_casos",
  "clientes",
  "leads",
  "proposals",
  "contracts",
  "invoices",
  "tarefas",
  "service_orders",
];

const MARCAS_DE_FILTRO = [
  "semFixtures",
  "ehFixtureLinha",
  "is_demo",
  "dados_teste",
  "data_origin",
  "mostrarDemo",
  "incluirDemo",
  /\bdemo\b/.source,
];

/*
 * Nenhuma aba precisa de exceção. `/importacoes` chegou a entrar aqui na
 * primeira passada, mas era falso positivo da varredura grossa: `carregarMigracao`
 * lê lotes, exceções e vínculos — quem toca `leads` naquele módulo é o escritor
 * da importação, que é POST e não é lista.
 */
const ABAS_COM_EXCECAO_DECLARADA: string[] = [];

/**
 * Só LISTA precisa de filtro. Escritor (POST) e leitor de um registro
 * escolhido (que estreita por `id`/`case_id` vindo da entrada) não filtram
 * demonstração: a pessoa já escolheu o registro, e o seletor de onde ela
 * escolheu é que tem de estar limpo.
 */
function ehListaOperacional(corpo: string): boolean {
  if (!/createServerFn\(\{ method: "GET" \}\)/.test(corpo)) return false;
  const estreitaPorEntrada =
    /\.eq\("id", data\./.test(corpo) ||
    /\.eq\("case_id", data\./.test(corpo) ||
    /\.eq\("caso_id", data\./.test(corpo) ||
    /\.eq\("id", caso/.test(corpo) ||
    /\.eq\("case_id", caso/.test(corpo);
  return !estreitaPorEntrada;
}

function arquivoDaRota(rota: string): string | null {
  const base = rota.replace(/^\//, "").replace(/\//g, ".");
  for (const c of [
    `src/routes/_authenticated/${base}.tsx`,
    `src/routes/_authenticated/${base}.index.tsx`,
    `src/routes/${base}.tsx`,
  ]) {
    if (existsSync(c)) return c;
  }
  return null;
}

function rotasDoMenuNoArquivo(): string[] {
  const nav = readFileSync("src/lib/navegacao-desk.ts", "utf8");
  return [...new Set([...nav.matchAll(/\{ to: "(\/[^"]*)"/g)].map((m) => m[1]))];
}

function temFiltro(texto: string): boolean {
  return MARCAS_DE_FILTRO.some((m) => new RegExp(m).test(texto));
}

/**
 * Corpo de UMA `createServerFn`. O limite tem de incluir função auxiliar
 * (`function`/`async function`) e `export const`, senão o corpo vaza para o
 * helper seguinte — foi o que fez `/importacoes` aparecer como falso positivo
 * na primeira passada da varredura: o `.from("leads")` é do planejador da
 * importação, não de `carregarMigracao`.
 */
function corpoDaServerFn(fonte: string, fn: string): string | null {
  const i = fonte.indexOf(`export const ${fn} = createServerFn`);
  if (i < 0) return null;
  const fins = ["\nexport const ", "\nasync function ", "\nfunction ", "\nexport function "]
    .map((marca) => fonte.indexOf(marca, i + 10))
    .filter((x) => x > i);
  const j = fins.length ? Math.min(...fins) : -1;
  return fonte.slice(i, j > i ? j : undefined);
}

const FONTES_LIB = Object.fromEntries(
  readdirSync("src/lib")
    .filter((f) => f.endsWith(".functions.ts"))
    .map((f) => [f, readFileSync(join("src/lib", f), "utf8")]),
);

function leitoresSemFiltro(arquivoRota: string): string[] {
  const txt = readFileSync(arquivoRota, "utf8");
  if (temFiltro(txt)) return [];
  const achados: string[] = [];
  for (const m of txt.matchAll(/import\s*\{([^}]+)\}\s*from\s*"@\/lib\/([a-z0-9.-]+\.functions)"/gs)) {
    const nomes = m[1]
      .split(",")
      .map((x) => x.trim().split(/\s+as\s+/)[0])
      .filter(Boolean);
    const fonte = FONTES_LIB[`${m[2]}.ts`];
    if (!fonte) continue;
    for (const fn of nomes) {
      const corpo = corpoDaServerFn(fonte, fn);
      if (!corpo) continue;
      const tabelas = TABELAS_OPERACIONAIS.filter((t) => corpo.includes(`.from("${t}")`));
      if (tabelas.length && ehListaOperacional(corpo) && !temFiltro(corpo)) {
        achados.push(`${fn} [${tabelas.join("/")}]`);
      }
    }
  }
  return achados;
}

describe("Varredura de demonstração — todas as abas do menu (04/10/2026)", () => {
  const rotas = rotasDoMenuNoArquivo();

  it("1. a varredura cobre todas as abas do menu, e cada aba tem arquivo", () => {
    // 38 até 10/10; 37 desde 11/10, quando /app-cliente-demo saiu do menu da Conta por decisão da Proprietária.
    expect(rotas.length).toBeGreaterThanOrEqual(37);
    for (const r of rotas) expect(arquivoDaRota(r), r).not.toBeNull();
  });

  it("2. nenhuma aba lista caso, cliente ou lead operacional sem filtro de demonstração", () => {
    const falhas: string[] = [];
    for (const r of rotas) {
      if (ABAS_COM_EXCECAO_DECLARADA.includes(r)) continue;
      const arq = arquivoDaRota(r);
      if (!arq) continue;
      const semFiltro = leitoresSemFiltro(arq);
      if (semFiltro.length) falhas.push(`${r} → ${semFiltro.join("; ")}`);
    }
    expect(falhas, falhas.join("\n")).toEqual([]);
  });

  it("3. nenhuma aba do menu precisa de exceção, e /golive fica fora do menu", () => {
    expect(ABAS_COM_EXCECAO_DECLARADA).toEqual([]);
    // /golive* é Desk paralelo sem decisão da Proprietária: fica fora do menu.
    expect(rotas.filter((r) => r.startsWith("/golive"))).toEqual([]);
  });

  it("4. o helper continua decidindo por coluna E por rótulo, sem apagar nada", () => {
    expect(ehFixtureLinha({ dados_teste: true })).toBe(true);
    expect(ehFixtureLinha({ is_demo: true })).toBe(true);
    expect(ehFixtureLinha({ data_origin: "fixture_demo" })).toBe(true);
    expect(ehFixtureLinha({ codigo: "CA-TESTE-VAL-2026-001" })).toBe(true);
    expect(ehFixtureLinha({ codigo: "CA-CID-AT-FAM-2026-001" })).toBe(false);
    expect(semFixtures([{ codigo: "CA-DEMO-IT-2026-001" }, { codigo: "CA-CID-AT-FAM-2026-001" }])).toHaveLength(1);
  });

  it("5. onde a lista é da própria pessoa, demonstração é rotulada em vez de escondida", () => {
    for (const arq of [
      "src/routes/_authenticated/pessoas.$clienteId.tsx",
      "src/components/pessoa/decisao-apos-salvar.tsx",
    ]) {
      const txt = readFileSync(arq, "utf8");
      expect(txt, arq).toContain("ROTULO_DEMONSTRACAO");
      expect(txt, arq).toContain("ehFixtureLinha");
    }
  });

  it("6. as funções corrigidas nesta varredura seguem filtrando", () => {
    const alvos: [string, string][] = [
      ["src/lib/alertas.functions.ts", "listarAlertas"],
      ["src/lib/nucleos-desk.functions.ts", "listarClientesParaVinculo"],
      ["src/lib/caso-ficha.functions.ts", "listarCasosFicha"],
      ["src/lib/documentos.functions.ts", "listarClientesECasos"],
      ["src/lib/biblioteca-evidencias.functions.ts", "listarFilaMicroentregas"],
      ["src/lib/nucleo-duplicidade.functions.ts", "listarCandidatosDuplicidadeNucleo"],
    ];
    for (const [arq, fn] of alvos) {
      const corpo = corpoDaServerFn(readFileSync(arq, "utf8"), fn);
      expect(corpo, `${fn} não encontrada`).not.toBeNull();
      expect(temFiltro(corpo!), fn).toBe(true);
    }
  });

  it("7. o seletor de clientes dos núcleos também ganhou filtro de organização", () => {
    const corpo = corpoDaServerFn(
      readFileSync("src/lib/nucleos-desk.functions.ts", "utf8"),
      "listarClientesParaVinculo",
    );
    expect(corpo).toContain('eq("organization_id"');
  });

  it("8. a tela que unifica núcleos nunca recebe candidato de demonstração", () => {
    const corpo = corpoDaServerFn(
      readFileSync("src/lib/nucleo-duplicidade.functions.ts", "utf8"),
      "listarCandidatosDuplicidadeNucleo",
    );
    expect(corpo).toContain("nucleosReais");
    expect(corpo).toContain("ehFixtureLinha");
  });
});
