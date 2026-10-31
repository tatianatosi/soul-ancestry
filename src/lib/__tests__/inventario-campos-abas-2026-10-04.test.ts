import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  INVENTARIO_CAMPOS_ABAS,
  VARREDURA_DE_MASCARAS,
  abasPorTabela,
  totalDeCampos,
} from "@/lib/inventario-campos-abas";

/**
 * Proprietária, 04/10/2026: "prepare a tabela de Campos não só dos 54 campos
 * da ficha única, como dos demais cadastros em todas as abas item por item,
 * veja o que está coberto o que tem rota o que está vivo morto, e o que falta
 * ser executado com máscaras".
 *
 * Este teste é o que impede a tabela de virar documento morto: ele RECALCULA
 * a contagem de cada aba lendo a allowlist no código. Se alguém acrescentar
 * ou remover um campo e não atualizar o inventário, isto falha e diz onde.
 */

const leitura = (p: string) => readFileSync(p, "utf8");

/** Todos os .ts/.tsx de src — para achar uso de allowlist exportada. */
function arquivosTs(dir = "src", saida: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      if (nome === "node_modules") continue;
      arquivosTs(caminho, saida);
    } else if (/\.tsx?$/.test(nome)) saida.push(caminho);
  }
  return saida;
}

/** Conta os campos de uma allowlist `const X = [ "a", "b", ... ]`. */
function camposDaAllowlist(modulo: string, allowlist: string): string[] {
  const fonte = leitura(modulo);
  const re = new RegExp(`const ${allowlist}\\s*(?::[^=]*)?=\\s*\\[([\\s\\S]*?)\\]\\s*(?:as const)?;`);
  const m = fonte.match(re);
  if (!m) throw new Error(`allowlist ${allowlist} não encontrada em ${modulo}`);
  return [...m[1]!.matchAll(/"([a-z0-9_]+)"/g)].map((x) => x[1]!);
}

describe("inventário de campos por aba — recalculado do código", () => {
  it("cada aba aponta um módulo e uma allowlist que existem de fato", () => {
    for (const item of INVENTARIO_CAMPOS_ABAS) {
      expect(existsSync(item.modulo), `módulo ausente: ${item.modulo}`).toBe(true);
      expect(() => camposDaAllowlist(item.modulo, item.allowlist)).not.toThrow();
    }
  });

  it("a contagem de campos de cada aba bate com a allowlist real", () => {
    const divergentes: string[] = [];
    for (const item of INVENTARIO_CAMPOS_ABAS) {
      const reais = camposDaAllowlist(item.modulo, item.allowlist).length;
      if (reais !== item.campos) divergentes.push(`${item.aba}: inventário ${item.campos}, código ${reais}`);
    }
    expect(divergentes).toEqual([]);
  });

  it("cada aba aponta uma rota que existe no disco", () => {
    const semRota = INVENTARIO_CAMPOS_ABAS.filter((i) => !existsSync(i.rota)).map((i) => `${i.aba} → ${i.rota}`);
    expect(semRota).toEqual([]);
  });

  it("nenhuma aba do inventário está morta: todas têm escritor ou são declaradas leitura/legado", () => {
    for (const item of INVENTARIO_CAMPOS_ABAS) {
      expect(["vivo", "leitura", "legado"]).toContain(item.estado);
      if (item.estado === "vivo") {
        /*
         * Escritor vivo = a allowlist é usada, não só declarada. Algumas são
         * exportadas e consumidas por outro módulo (CAMPOS_PESSOA de
         * `pesquisa.server.ts`, lido pelo `.functions.ts`), então a busca é
         * no `src` inteiro, não só no arquivo que declara.
         */
        const usosLocais = leitura(item.modulo).split(item.allowlist).length - 1;
        const usosNoSrc = arquivosTs().filter((f) => leitura(f).includes(item.allowlist)).length;
        expect(
          usosLocais > 1 || usosNoSrc > 1,
          `${item.allowlist} é declarada em ${item.modulo} e nunca usada em nenhum lugar`,
        ).toBe(true);
      }
    }
    // Varre o src inteiro por allowlist; sob a suíte completa passa de 5 s.
  }, 30_000);

  it("o total inventariado é a soma das abas, e é grande o bastante para não ser amostra", () => {
    expect(totalDeCampos()).toBe(INVENTARIO_CAMPOS_ABAS.reduce((s, i) => s + i.campos, 0));
    expect(totalDeCampos()).toBeGreaterThan(500);
  });

  it("mostra onde duas abas tocam a mesma tabela — sobreposição declarada, não escondida", () => {
    const porTabela = abasPorTabela();
    const compartilhadas = [...porTabela.entries()].filter(([, abas]) => abas.length > 1);
    // research_evidence_items é tocada por Pesquisa e pela Biblioteca; as duas
    // delegam ao mesmo módulo canônico desde o Corte 0.
    expect(compartilhadas.map(([t]) => t)).toContain("research_evidence_items");
    for (const [, abas] of compartilhadas) expect(abas.every((a) => a.estado === "vivo")).toBe(true);
  });

  it("máscaras continuam medidas em um lugar só, e aquele teste existe", () => {
    expect(existsSync(VARREDURA_DE_MASCARAS.teste)).toBe(true);
    expect(VARREDURA_DE_MASCARAS.cobertura).toContain("26 de 26");
    // o inventário não repete o número de máscaras por aba: aponta para a varredura
    expect(leitura("src/lib/inventario-campos-abas.ts")).toContain("não entram como coluna aqui");
  });

  it("a Ficha Única de 54 campos continua sendo camada de projeção, não um 39º cadastro", () => {
    const abas = INVENTARIO_CAMPOS_ABAS.map((i) => i.aba.toLowerCase());
    expect(abas.some((a) => a.includes("ficha única") || a.includes("ficha master"))).toBe(false);
    expect(existsSync("src/lib/ficha-master-estado-campos.ts")).toBe(true);
  });
});

describe("Corte G item 1 — descrição por campo (09/10/2026)", () => {
  it("cada campo descrito existe de fato na allowlist real — nunca inventado", () => {
    const erros: string[] = [];
    for (const item of INVENTARIO_CAMPOS_ABAS) {
      if (!item.camposDescritos) continue;
      const reais = new Set(camposDaAllowlist(item.modulo, item.allowlist));
      for (const cd of item.camposDescritos) {
        if (!reais.has(cd.campo)) erros.push(`${item.aba}: "${cd.campo}" não está em ${item.allowlist}`);
      }
    }
    expect(erros).toEqual([]);
  });

  it("quando uma aba declara camposDescritos, cobre TODOS os campos da allowlist — nunca parcial e silencioso", () => {
    const incompletas: string[] = [];
    for (const item of INVENTARIO_CAMPOS_ABAS) {
      if (!item.camposDescritos) continue;
      const reais = camposDaAllowlist(item.modulo, item.allowlist);
      if (item.camposDescritos.length !== reais.length) {
        incompletas.push(`${item.aba}: ${item.camposDescritos.length} descritos, ${reais.length} reais`);
      }
    }
    expect(incompletas).toEqual([]);
  });

  it("nenhum campo descrito se repete dentro da mesma aba", () => {
    const duplicados: string[] = [];
    for (const item of INVENTARIO_CAMPOS_ABAS) {
      if (!item.camposDescritos) continue;
      const vistos = new Set<string>();
      for (const cd of item.camposDescritos) {
        if (vistos.has(cd.campo)) duplicados.push(`${item.aba}: "${cd.campo}" duplicado`);
        vistos.add(cd.campo);
      }
    }
    expect(duplicados).toEqual([]);
  });

  it("nenhuma descrição é o nome técnico cru repetido — tem de explicar o que o campo coleta", () => {
    const vagas: string[] = [];
    for (const item of INVENTARIO_CAMPOS_ABAS) {
      if (!item.camposDescritos) continue;
      for (const cd of item.camposDescritos) {
        if (cd.oQueColeta.trim().length < 15 || cd.oQueColeta === cd.campo) {
          vagas.push(`${item.aba}: "${cd.campo}" sem descrição real`);
        }
        if (!cd.quemPreenche.trim()) vagas.push(`${item.aba}: "${cd.campo}" sem quemPreenche`);
      }
    }
    expect(vagas).toEqual([]);
  });

  it("'Contrato › dados gerais' e 'Contrato › financeiro' têm os 19 campos reais descritos (prova do corte)", () => {
    const gerais = INVENTARIO_CAMPOS_ABAS.find((i) => i.aba === "Contrato › dados gerais")!;
    const financeiro = INVENTARIO_CAMPOS_ABAS.find((i) => i.aba === "Contrato › financeiro")!;
    expect(gerais.camposDescritos?.length).toBe(14);
    expect(financeiro.camposDescritos?.length).toBe(5);
  });
});
