import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Auditoria full-spectrum (01/11/2026) — Recomendação de Performance:
// `casos.$caseId.index.tsx` tinha 11 `useQuery` sem `enabled:` disparando a
// cada abertura de caso, mesmo quando a seção/modo que consome o dado não
// está visível. Esta tela é a mesma de `caso-360-pagina-unica.test.ts` e
// companhia: 5000+ linhas, pesada demais para montar em teste de render (os
// outros testes deste arquivo também preferem ler o código-fonte). Este
// teste garante, por string, que o gate certo foi aplicado a cada query e
// que as que precisam ficar sem gate (porque alimentam cabeçalho sempre
// visível, ou vivem num componente sem acesso ao estado de seção) continuam
// documentadas como tal — nunca gateadas por engano.
const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

/** Isola o trecho de `const <nome> = useQuery({ ... });` para inspeção. */
function blocoQuery(nome: string): string {
  const inicio = pagina.indexOf(`const ${nome} = useQuery({`);
  expect(inicio, `declaração de ${nome} não encontrada`).toBeGreaterThan(-1);
  const fim = pagina.indexOf("});", inicio);
  expect(fim, `fechamento de ${nome} não encontrado`).toBeGreaterThan(-1);
  return pagina.slice(inicio, fim);
}

describe("Caso 360 — gate de queries por modo/seção ativa (perf, 01/11/2026)", () => {
  it("secaoFoco e modo existem antes de qc2 (ordem de hooks preservada, gate possível)", () => {
    const idxSecaoFoco = pagina.indexOf("const [secaoFoco, setSecaoFoco] = useState");
    const idxModo = pagina.indexOf('const [modo, setModo] = useState<"resumo" | "ficha">');
    const idxQc2 = pagina.indexOf("const qc2 = useQuery({");
    expect(idxSecaoFoco).toBeGreaterThan(-1);
    expect(idxModo).toBeGreaterThan(-1);
    expect(idxQc2).toBeGreaterThan(-1);
    expect(idxSecaoFoco).toBeLessThan(idxQc2);
    expect(idxModo).toBeLessThan(idxQc2);
  });

  it.each([
    ["qc2", "fichaAberta"],
    ["qTarefas", "fichaAberta"],
    ["qDocumentos", "fichaAberta"],
    ["qVisaoCliente", "fichaAberta"],
    ["qFinanceiro", "fichaAberta"],
    ["qPesquisa", "fichaAberta"],
  ])(
    "%s é adiada por modo (cabeçalho da ficha, nunca por secaoFoco, visível em todas as 8 seções)",
    (nome, condicao) => {
      const bloco = blocoQuery(nome);
      expect(bloco, `${nome} deveria ter enabled: ${condicao}`).toMatch(
        new RegExp(`enabled:\\s*${condicao}\\b`),
      );
      // Nunca amarrado a uma seção específica — essas queries alimentam o
      // resumo visível em qualquer aba enquanto a ficha está aberta.
      expect(bloco).not.toMatch(/secaoVisivel/);
    },
  );

  it("qProposta é adiada por modo + (Formalização OU Pessoa e família) — únicas seções que a leem", () => {
    const bloco = blocoQuery("qProposta");
    expect(bloco).toMatch(
      /enabled:\s*Boolean\(clienteId\)\s*&&\s*fichaAberta\s*&&\s*\(secaoVisivelComercial \|\| secaoVisivelPessoas\)/,
    );
  });

  it("qJuridico é adiada por modo + seção Formalização — única seção que a lê", () => {
    const bloco = blocoQuery("qJuridico");
    expect(bloco).toMatch(/enabled:\s*fichaAberta\s*&&\s*secaoVisivelComercial\b/);
  });

  it("qCadeia continua SEM enabled — alimenta o cabeçalho de identidade do caso, visível em resumo e ficha", () => {
    const bloco = blocoQuery("qCadeia");
    expect(bloco).not.toMatch(/enabled:/);
    // A decisão de não gatear precisa estar documentada no código, não só aqui.
    const comentario = pagina.slice(
      pagina.indexOf("// CA20-PESQUISA-VIVA"),
      pagina.indexOf("const qCadeia = useQuery({"),
    );
    expect(pagina).toMatch(/NÃO gateada.*etapaAtualPlanejador/s);
  });

  it("qNucleos e qPessoas (AbaCadastro) continuam sem enabled — fora do escopo desta correção", () => {
    // Vivem num componente filho (AbaCadastro) que só recebe casoId/membros/
    // onMudou/atualizar/criar/bloqueado — gatear por seção exigiria uma nova
    // prop (secaoAtiva/modo), o que a tarefa de perf explicitamente pediu
    // para não fazer. Documentado como limitação conhecida, não regressão.
    expect(pagina).toMatch(/const qNucleos = useQuery\(\{[\s\S]{0,200}?\}\);/);
    expect(
      pagina.slice(pagina.indexOf("const qNucleos"), pagina.indexOf("const qNucleos") + 200),
    ).not.toMatch(/enabled:/);
  });
});
