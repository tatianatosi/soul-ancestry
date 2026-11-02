import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Auditoria 02/11/2026 (app-cliente-portal, P0): `useState` ficava depois dos retornos antecipados
 * de `PrivacidadeCaso`, o que derruba a tela ("Retirar do App") quando a consulta muda de estado.
 * Todo hook do componente precisa vir antes do primeiro `return`.
 */
describe("Privacidade do caso: hooks antes dos retornos antecipados", () => {
  const src = readFileSync("src/components/privacidade/painel.tsx", "utf8");
  const inicio = src.indexOf("export function PrivacidadeCaso");
  const corpo = src.slice(inicio);

  it("nenhum hook aparece depois do primeiro retorno antecipado", () => {
    const primeiroRetorno = corpo.search(/\n {2}if \([^\n]*\)\s*\n?\s*return /);
    expect(primeiroRetorno).toBeGreaterThan(0);
    const depois = corpo.slice(primeiroRetorno);
    expect(depois).not.toMatch(/\buse(State|Memo|Effect|Query|Mutation|Ref|Callback)\(/);
  });

  it("categoriaForm é declarado junto dos outros hooks", () => {
    expect(corpo.indexOf("const [categoriaForm, setCategoriaForm] = useState")).toBeGreaterThan(0);
    expect(corpo.indexOf("const [categoriaForm, setCategoriaForm] = useState")).toBeLessThan(
      corpo.indexOf("const painel = useQuery"),
    );
  });
});
