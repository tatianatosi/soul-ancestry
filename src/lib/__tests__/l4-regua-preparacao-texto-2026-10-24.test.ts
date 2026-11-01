import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * L4, opção A (plano de lançamento de 25/10/2026). A régua da Home e a caixa da
 * Linha do Processo usam as 5 etapas de ATIVAÇÃO (Diagnóstico, Documentação,
 * Jurídico, Financeiro, App Cliente). Elas não são as fases da jornada do
 * mockup p.3, então o texto passa a dizer "preparação". O percentual publicado
 * (média dos eixos com base real) passa a se chamar "Andamento da pesquisa",
 * para não ser lido como avanço das etapas.
 */
const ler = (rel: string) => readFileSync(resolve(__dirname, "..", "..", rel), "utf8");

describe("L4-A — régua de preparação e percentual com rótulo próprio", () => {
  const regua = (() => {
    const f = ler("components/portal/elementos-mockup.tsx");
    const i = f.indexOf("export function ReguaEtapas");
    return f.slice(i, f.indexOf("\n}\n", i));
  })();

  it("a régua da Home se chama 'Preparação do seu caso'", () => {
    expect(regua).toContain("Preparação do seu caso");
    expect(regua).not.toContain("Hoje você está aqui");
    expect(regua).toContain("Etapa da preparação:");
  });

  it("a Linha do Processo da Jornada rotula a caixa como preparação", () => {
    const jornada = ler("routes/portal/jornada.tsx");
    // Prettier pode quebrar o conteúdo do <span> em sua própria linha; checar a tag de abertura e o texto separadamente.
    expect(jornada).toMatch(/<span className="[^"]*">\s*Preparação do caso\s*<\/span>/);
    expect(jornada).toContain("Concluída — as cinco etapas de preparação");
    expect(jornada).not.toMatch(/<span className="[^"]*">\s*Etapa atual\s*<\/span>/);
  });

  it("o percentual publicado se chama 'Andamento da pesquisa'", () => {
    const andamento = ler("components/portal/andamento-publicado.tsx");
    expect(andamento).toContain('"Andamento da pesquisa"');
    expect(andamento).not.toContain("Como sua jornada está avançando");
    expect(andamento).not.toContain("Avanço da sua jornada");
  });
});
