import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { radarSeisDimensoes } from "@/lib/radar-seis-eixos";
import { lerResumoCaso } from "@/lib/portal-resumo-caso";
import { radarSanitizado } from "@/lib/portal-dados-vivos";

/** C4 (02/11/2026) — dados enganosos e vazamento no App Cliente. */
const doc = (id: string, liberado: boolean) => ({ id, liberado_cliente: liberado });
const docOf = (dims: ReturnType<typeof radarSeisDimensoes>) => dims.find((d) => d.id === "documentacao")!;

describe("C4a — Radar: Documentação vem do checklist canônico", () => {
  it("todos os arquivos liberados, sem checklist: 'Não registrado', nunca 100%", () => {
    const d = docOf(radarSeisDimensoes({ projecoes: [], documentos: [doc("1", true), doc("2", true)] }));
    expect(d.percentual).toBeNull();
    expect(d.rotuloNumero).toBe("Não registrado");
    expect(d.rotuloNumero).not.toContain("100");
  });
  it("checklist vazio também é 'Não registrado'", () => {
    const d = docOf(
      radarSeisDimensoes({ projecoes: [], documentos: [doc("1", true)], checklist: { itens: [], total: 0, concluidos: 0 } }),
    );
    expect(d.rotuloNumero).toBe("Não registrado");
  });
  it("com checklist, usa concluídos ÷ total, ignorando arquivos liberados", () => {
    const d = docOf(
      radarSeisDimensoes({
        projecoes: [],
        documentos: [doc("1", true), doc("2", true), doc("3", true)],
        checklist: { itens: [], total: 4, concluidos: 1 },
      }),
    );
    expect(d.percentual).toBe(25);
    expect(d.rotuloNumero).toBe("25%");
  });
  it("a tela do Radar e o andamento passam o checklist", () => {
    expect(readFileSync("src/routes/portal/radar.tsx", "utf8")).toMatch(/checklist: vivo\.checklist/);
    expect(readFileSync("src/components/portal/andamento-publicado.tsx", "utf8")).toMatch(/checklist: data\.checklist/);
  });
});

function dbFalso() {
  const tabelas: Record<string, any> = {
    crm_casos: { status: "ativo", ativo: true, cliente_id: "titular-1" },
    case_activation_checks: [],
    clientes: { nome: "Ana", email: "ana@exemplo.com", telefone: "+5511999999999" },
  };
  const builder = (t: string) => {
    const r: any = {
      select: () => r,
      eq: () => r,
      maybeSingle: async () => ({ data: tabelas[t] }),
      then: (ok: (v: unknown) => unknown) => ok({ data: tabelas[t] }),
    };
    return r;
  };
  return { from: builder };
}

describe("C4b — contato do titular só para o próprio titular", () => {
  it("membro não titular não recebe e-mail nem telefone", async () => {
    const r = await lerResumoCaso(dbFalso(), "c1", { visualizadorClienteId: "outro-9" });
    expect(r?.perfil.email).toBeNull();
    expect(r?.perfil.telefone).toBeNull();
    expect(r?.perfil.contatoVisivel).toBe(false);
  });
  it("visualizador sem vínculo conhecido (nulo) também não recebe", async () => {
    const r = await lerResumoCaso(dbFalso(), "c1", { visualizadorClienteId: null });
    expect(r?.perfil.email).toBeNull();
    expect(r?.perfil.telefone).toBeNull();
  });
  it("o próprio titular recebe os próprios dados", async () => {
    const r = await lerResumoCaso(dbFalso(), "c1", { visualizadorClienteId: "titular-1" });
    expect(r?.perfil.email).toBe("ana@exemplo.com");
    expect(r?.perfil.telefone).toBe("+5511999999999");
  });
  it("leitura administrativa (prévia do Desk, sem opções) segue igual", async () => {
    const r = await lerResumoCaso(dbFalso(), "c1");
    expect(r?.perfil.email).toBe("ana@exemplo.com");
  });
  it("o servidor passa o vínculo do visualizador e a Conta oculta as linhas", () => {
    expect(readFileSync("src/lib/portal-dados-vivos.functions.ts", "utf8")).toMatch(
      /lerResumoCaso\(supabaseAdmin, String\(casoAtivo\.id\), \{ visualizadorClienteId \}\)/,
    );
    expect(readFileSync("src/routes/portal/conta.tsx", "utf8")).toMatch(/contatoVisivel === false/);
  });
});

describe("C4c — Documentos sem caso ativo: vazio honesto", () => {
  it("o filtro por caso não deixa passar tudo quando casoAtivo é nulo", () => {
    const f = readFileSync("src/routes/portal/documentos.tsx", "utf8");
    expect(f).not.toMatch(/!casoAtivo \|\|/);
    expect(f).toMatch(/casoAtivo \? \(l \?\? \[\]\)\.filter/);
    expect(f).toMatch(/: \[\];/);
  });
});

describe("C4d — nenhum filtro is_demo sobre documents (coluna não existe)", () => {
  for (const arq of [
    "src/lib/portal-dados-vivos.ts",
    "src/lib/radar-seis-eixos.ts",
    "src/routes/portal/documentos.tsx",
    "src/routes/portal/conta.tsx",
  ]) {
    it(`${arq} não filtra por is_demo`, () => {
      const f = readFileSync(arq, "utf8").split("\n").filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"));
      expect(f.join("\n")).not.toMatch(/\.is_demo|is_demo\s*[!=]/);
    });
  }
  it("radarSanitizado conta documentos sem filtro inerte", () => {
    const eixos = radarSanitizado({ projecoes: [], documentos: [{ id: "1", liberado_cliente: true, is_demo: true } as any] });
    const docs = eixos.find((e) => e.id === "documentos");
    expect(docs?.itens.find((i) => i.rotulo === "Disponíveis para você")?.valor).toBe("1");
  });
});
