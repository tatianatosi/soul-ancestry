import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { ORFAS_CLASSIFICADAS } from "@/lib/orfaos-classificados";

/**
 * Proprietária, 04/10/2026: "antes pesquisa 🔬 tinha até lacunas, plano de
 * ação, módulos históricos, eventos, linhagens, entre outros — isso em
 * pesquisa módulo é só em pesquisa 🔬? não sei"; e "faça uma nova varredura de
 * órfãos só referente a bases genealógicas, fontes genealógicas, fontes
 * primárias e secundárias, centro de inteligência, assistente de pesquisa,
 * dossiê histórico".
 *
 * Medição (04/10):
 *  - as superfícies existem e NÃO estão no módulo `/pesquisa-modulo`: lacunas,
 *    módulos históricos, eventos, linhagens, árvore interna, por geração,
 *    variantes e linha do tempo moram em `/pessoas-linhagens/$caseId` (11
 *    abas); plano de ação em `/plano-acao/$caseId`; achados em
 *    `/achados/$caseId`; evidências do caso em `/pesquisa-evidencias/$caseId`.
 *  - nenhuma dessas quatro rotas tem índice, e o grupo Pesquisa do menu não as
 *    lista — eram alcançáveis só de dentro do caso. Daí a impressão de que
 *    "tinha antes": o caminho se perdeu, o dado não.
 *  - a varredura de órfãos restrita a esses temas não achou órfã nova: as 5
 *    que aparecem já estão classificadas em `orfaos-classificados.ts`.
 */

const leitura = (p: string) => readFileSync(p, "utf8");
const PAINEL = "src/routes/_authenticated/pesquisa-modulo.index.tsx";
const FICHA = "src/routes/_authenticated/pessoas-linhagens.$caseId.tsx";

describe("onde moram lacunas, módulos históricos, eventos e linhagens", () => {
  it("as abas estão na ficha genealógica do caso, não no painel de pesquisa", () => {
    const fonte = leitura(FICHA);
    for (const aba of ["Lacunas e próximas pesquisas", "Módulos históricos", "Eventos", "Linhagens", "Por geração"]) {
      expect(fonte).toContain(aba);
    }
  });

  it("as quatro rotas de pesquisa por caso continuam sem índice — por isso o atalho é necessário", () => {
    const rotas = readdirSync("src/routes/_authenticated");
    for (const base of ["pessoas-linhagens", "plano-acao", "achados", "pesquisa-evidencias"]) {
      expect(rotas).toContain(`${base}.$caseId.tsx`);
      expect(rotas).not.toContain(`${base}.index.tsx`);
    }
  });

  it("o painel de pesquisa religou os quatro caminhos por caso", () => {
    const fonte = leitura(PAINEL);
    expect(fonte).toContain("data-pesquisa-atalhos");
    expect(fonte).toContain("/pessoas-linhagens/$caseId");
    expect(fonte).toContain("/pesquisa-evidencias/$caseId");
    expect(fonte).toContain("/achados/$caseId");
    expect(fonte).toContain("/plano-acao/$caseId");
    expect(fonte).toContain("lacunas, módulos históricos, eventos, linhagens");
  });

  it("não cria rota, tela nem item de menu novo (menu segue com 6 grupos)", () => {
    const nav = leitura("src/lib/navegacao-desk.ts");
    expect(nav).not.toContain('to: "/pessoas-linhagens"');
    expect(nav).not.toContain('to: "/plano-acao"');
  });
});

describe("varredura de órfãos restrita aos temas pedidos", () => {
  const MODULOS = [
    "fontes-genealogicas",
    "fontes-documentos",
    "fontes-documentos-integracao",
    "biblioteca-mestre",
    "biblioteca-evidencias",
    "catalogo-canonico",
    "conciliacao-catalogo",
    "pesquisa-modulo",
    "pesquisa-cadeia",
    "achados-genealogicos",
    "pessoas-linhagens",
    "evidencia-canonica",
  ];

  function arquivosDeUI(): string[] {
    const saida: string[] = [];
    const andar = (dir: string) => {
      for (const nome of readdirSync(dir)) {
        const caminho = join(dir, nome);
        if (statSync(caminho).isDirectory()) andar(caminho);
        else if (/\.tsx?$/.test(nome)) saida.push(caminho);
      }
    };
    andar("src/components");
    andar("src/routes");
    return saida;
  }

  const textoUI = arquivosDeUI()
    .map((p) => readFileSync(p, "utf8"))
    .join("\n");

  it("toda serverFn sem chamador nesses módulos já está classificada", () => {
    const semClassificacao: string[] = [];
    for (const modulo of MODULOS) {
      let fonte: string;
      try {
        fonte = leitura(`src/lib/${modulo}.functions.ts`);
      } catch {
        continue;
      }
      for (const [, fn] of fonte.matchAll(/^export const (\w+) = createServerFn/gm)) {
        if (new RegExp(`\\b${fn}\\b`).test(textoUI)) continue;
        if (ORFAS_CLASSIFICADAS.some((o) => o.fn === fn)) continue;
        semClassificacao.push(`${modulo}#${fn}`);
      }
    }
    expect(semClassificacao).toEqual([]);
  });

  it("o assistente de pesquisa não é órfão — tem tela e rota de API", () => {
    expect(leitura("src/components/pesquisa/assistente.tsx")).toContain("pesquisa-assistente");
    expect(() => leitura("src/routes/api/pesquisa-assistente.ts")).not.toThrow();
  });

  it("bases e repositórios (fontes genealógicas) continuam ligados ao menu de Pesquisa", () => {
    expect(leitura("src/lib/navegacao-desk.ts")).toContain('to: "/fontes-genealogicas", label: "Bases e repositórios"');
  });
});
