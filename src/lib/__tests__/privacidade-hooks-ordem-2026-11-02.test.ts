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

import { decidirAcao } from "@/lib/autoridade-operacional";

describe("Autoridade: falha ao ler o contexto não vira 'sem papel'", () => {
  it("com erro de contexto o motivo mostra o erro real", () => {
    const r = decidirAcao(
      { papeis: [], organizationId: null, carregando: false, erroContexto: "Unauthorized" },
      {},
    );
    expect(r.decisao).toBe("bloquear");
    expect(r.motivo).toContain("Unauthorized");
    expect(r.motivo).not.toContain("Nenhum papel de equipe");
  });

  it("sem erro e sem papel, a mensagem continua a de falta de papel", () => {
    const r = decidirAcao({ papeis: [], organizationId: null, carregando: false }, {});
    expect(r.motivo).toContain("Nenhum papel de equipe");
  });
});
