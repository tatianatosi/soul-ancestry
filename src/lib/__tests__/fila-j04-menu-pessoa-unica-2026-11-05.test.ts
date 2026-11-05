import { describe, expect, it } from "vitest";

import { GRUPOS_DESK } from "@/lib/navegacao-desk";

/**
 * J04 (05/11/2026): uma pessoa, um cadastro (Pessoa 360). O menu não oferece Cliente, Perfil, Participante
 * ou Membro como cadastros separados; a revisão de núcleos duplicados continua acessível com o nome real.
 */
const CADASTRO_SEPARADO = /^(Clientes?|Perfis|Perfil(?! institucional)|Participantes?|Membros?)\b/i;

describe("J04 — menu sem cadastros separados de pessoa", () => {
  const subs = GRUPOS_DESK.flatMap((g) => (g.sub ?? []).map((s) => ({ grupo: g.id, ...s })));

  it("nenhuma entrada de menu se apresenta como cadastro de Cliente, Perfil, Participante ou Membro", () => {
    expect(subs.filter((s) => CADASTRO_SEPARADO.test(s.label))).toEqual([]);
  });

  it("Pessoa 360 é a entrada única de pessoa; a revisão de duplicidades mantém a rota", () => {
    const pessoas = GRUPOS_DESK.find((g) => g.id === "pessoas");
    expect(pessoas?.sub?.find((s) => s.to === "/clientes")?.label).toBe("Pessoa 360");
    expect(pessoas?.sub?.find((s) => s.to === "/nucleos-duplicidades")?.label).toBe("Possíveis núcleos duplicados");
    expect(pessoas?.prefixos).toContain("/nucleos-duplicidades");
  });
});
