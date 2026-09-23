import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * BUG-MATRIZ-DEMO-VAZA (D6, §16 do De-Para): `posicionar()` já calculava
 * `origemNaoReal` internamente via `calcularPrioridade`, mas
 * `CasoPosicionado` nunca expunha esse campo — nenhum caso demo era
 * excluído da matriz de prioridade, violando a regra "registros com selo
 * DEMO nunca entram em indicadores". Este teste trava a correção: filtro
 * ANTES de `posicionar`, oculto por padrão, com checkbox explícita —
 * nunca escondido silenciosamente sem dizer quantos foram ocultados.
 */

const ARQUIVO = resolve(__dirname, "../../components/desk/matriz-prioridades-conectada.tsx");
const codigo = readFileSync(ARQUIVO, "utf8");

describe("D6 · Matriz de prioridade exclui demo por padrão", () => {
  it("filtra linhasTodas por papelDoRegistro antes de chamar posicionar, não depois", () => {
    expect(codigo).toMatch(/linhasTodas\.filter\(\(l\) => papelDoRegistro\(l\)\.valor !== "demo"\)/);
  });

  it("incluirDemos começa false — demo oculto por padrão, não opt-out", () => {
    expect(codigo).toMatch(/const \[incluirDemos, setIncluirDemos\] = useState\(false\)/);
  });

  it("checkbox existe e é reversível (nunca esconde sem explicar quantos)", () => {
    expect(codigo).toContain("data-matriz-toggle-demo");
    expect(codigo).toMatch(/checked=\{incluirDemos\}/);
    expect(codigo).toMatch(/oculta.*por padrão; nunca entram em/);
  });

  it("useMemo de casos depende de incluirDemos — recalcula ao marcar/desmarcar", () => {
    expect(codigo).toMatch(/\[linhasTodas, incluirDemos\]/);
  });

  it("checkbox só aparece quando há pelo menos 1 caso demo na carteira", () => {
    const idxCondicao = codigo.indexOf("linhasDemo > 0");
    const idxCheckbox = codigo.indexOf("data-matriz-toggle-demo");
    expect(idxCondicao).toBeGreaterThan(0);
    expect(idxCheckbox).toBeGreaterThan(idxCondicao);
    expect(idxCheckbox - idxCondicao).toBeLessThan(200);
  });
});
