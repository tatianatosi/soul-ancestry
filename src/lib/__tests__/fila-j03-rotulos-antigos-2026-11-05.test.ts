import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { resolverSecaoCaso } from "@/lib/ficha-unica-caso";

/** J03 (05/11/2026): rótulos antigos do Caso 360 redirecionam para a seção atual (Ficha Única em Pesquisa). */
const IDS = ["visao", "jornada", "pessoas", "tecnico", "documentos", "comercial", "financeiro", "log"] as const;

describe("J03 — endereços antigos do Caso 360", () => {
  it("Ficha Piloto, Ficha Master, Técnico e riscos e Pesquisa Genealógica abrem a Pesquisa (Ficha Única)", () => {
    for (const antigo of ["#ficha-piloto", "#ficha-master", "#tecnico-e-riscos", "#pesquisa-genealogica", "#ficha", "ficha-unica"]) {
      expect(resolverSecaoCaso(antigo, IDS)).toBe("tecnico");
    }
  });

  it("Formalização, Histórico e Família caem nas seções atuais; seções atuais seguem iguais", () => {
    expect(resolverSecaoCaso("#formalizacao", IDS)).toBe("comercial");
    expect(resolverSecaoCaso("#historico", IDS)).toBe("log");
    expect(resolverSecaoCaso("#familia", IDS)).toBe("pessoas");
    expect(resolverSecaoCaso("#documentos", IDS)).toBe("documentos");
  });

  it("âncora interna ou desconhecida não vira seção", () => {
    expect(resolverSecaoCaso("#formalizacao-juridico", IDS)).toBeNull();
    expect(resolverSecaoCaso("#qualquer-coisa", IDS)).toBeNull();
    expect(resolverSecaoCaso("", IDS)).toBeNull();
  });

  it("o Caso 360 usa o resolvedor ao ler o endereço", () => {
    const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    expect(pagina).toMatch(/resolverSecaoCaso\(\s*hashRota \|\| window\.location\.hash/);
  });
});
