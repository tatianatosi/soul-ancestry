import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { avaliarFasesMotorCidadania, FASES_MOTOR_CIDADANIA } from "@/lib/motor-cidadania";
import {
  MOTOR_CIDADANIA_SOB,
  MOTORES_TABELAS,
  ORDEM_MOTORES_PRIMORDIAIS,
} from "@/lib/motores-tabelas";
import { skuVivoDoCatalogo } from "@/lib/planejador-parametros";
import { ENTIDADES_HIPOTETICAS_NAO_CRIAR } from "@/lib/motor-caso";
import { GRUPOS_DESK } from "@/lib/navegacao-desk";

const types = readFileSync("src/integrations/supabase/types.ts", "utf8");
const sql = readdirSync("supabase/migrations")
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(join("supabase/migrations", f), "utf8"))
  .join("\n");

function tabelaExiste(nome: string) {
  if (types.includes(`${nome}: {`)) return true;
  return new RegExp(`create table (if not exists )?public\\.${nome}\\b`, "i").test(sql);
}

describe("Motores primordiais P0–P11", () => {
  it("lista os 12 motores na ordem do prompt-mestre e cada um aponta para uma rota do Desk", () => {
    expect(MOTORES_TABELAS.map((m) => m.id)).toEqual([...ORDEM_MOTORES_PRIMORDIAIS]);
    expect(MOTORES_TABELAS).toHaveLength(12);
    expect(MOTORES_TABELAS[0]?.estado).toBe("operando");
    expect(MOTORES_TABELAS.find((m) => m.id === "P10")?.estado).toBe("planta");
    for (const m of MOTORES_TABELAS) {
      expect(m.rotaDesk.startsWith("/")).toBe(true);
      expect(m.oQueJaEscreve.length).toBeGreaterThan(10);
    }
    const p1 = MOTORES_TABELAS.find((m) => m.id === "P1");
    expect(p1?.estado).toBe("parcial");
    expect(p1?.oQueJaEscreve).toMatch(/archived_at/);
  });

  it("não cria 13º motor: cidadania 0–8 mora em P7", () => {
    expect(MOTOR_CIDADANIA_SOB).toBe("P7");
    expect(MOTORES_TABELAS.find((m) => m.id === "P7")?.tabelas).toContain("citizenship_tracks");
    expect(MOTORES_TABELAS.find((m) => m.id === "P7")?.tabelas).toContain("product_catalog");
  });

  it("cada tabela apontada existe no banco gerado ou na migration — nenhuma hipotética vira eixo", () => {
    const tabelas = MOTORES_TABELAS.flatMap((m) => [...m.tabelas]);
    const recusas = MOTORES_TABELAS.flatMap((m) => [...m.naoCriar]);
    for (const tabela of tabelas) {
      expect(tabelaExiste(tabela), `tabela ${tabela} ausente em types.ts e nas migrations`).toBe(true);
    }
    for (const h of ENTIDADES_HIPOTETICAS_NAO_CRIAR) {
      expect(tabelas).not.toContain(h);
    }
    expect(recusas).toEqual(expect.arrayContaining([...ENTIDADES_HIPOTETICAS_NAO_CRIAR]));
  });

  it("Biblioteca Mestre aponta para a tela que executa, sem 9º grupo no Desk", () => {
    const biblio = readFileSync("src/routes/_authenticated/biblioteca.tsx", "utf8");
    const componente = readFileSync("src/components/biblioteca/motores-primordiais.tsx", "utf8");
    const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    expect(biblio).toContain("MotoresPrimordiais");
    expect(componente).toContain("Abrir no Desk");
    expect(componente).toContain("Link");
    expect(pagina).toContain("FasesMotorCidadania");
    expect(pagina).not.toMatch(/setAba\(/);
    expect(GRUPOS_DESK).toHaveLength(6);
  });
});

describe("P4 — onboarding cria a linha se faltar", () => {
  it("recalcular insere em onboarding_planos e não ativa cliente", () => {
    const fn = readFileSync("src/lib/onboarding-plano.functions.ts", "utf8");
    expect(fn).toContain("garantirPlanoOnboarding");
    expect(fn).toContain('.from("onboarding_planos")');
    expect(fn).toContain(".insert(");
    expect(fn).toContain("clienteAtivado: false");
    expect(fn).toContain("titulosTarefasDosGates");
    expect(fn).not.toMatch(/onboarding_runs/);
  });
});

describe("P7 — SKU vivo no catálogo", () => {
  it("só confirma código ativo e homologado", () => {
    expect(
      skuVivoDoCatalogo(
        [{ code: "CA-CID-AT-001", nome_comercial: "Vivo", ativo: true, status_homologacao: "homologado" }],
        "CA-CID-AT-001",
      ),
    ).toEqual({ code: "CA-CID-AT-001", nome_comercial: "Vivo" });
    expect(
      skuVivoDoCatalogo(
        [{ code: "CA-CID-AT-001", nome_comercial: "Rascunho", ativo: true, status_homologacao: "em_revisao" }],
        "CA-CID-AT-001",
      ),
    ).toBeNull();
  });

  it("pré-carga de contrato consulta product_catalog", () => {
    const params = readFileSync("src/lib/contrato-parametros.functions.ts", "utf8");
    const prep = readFileSync("src/lib/contrato-preparar.functions.ts", "utf8");
    expect(params).toContain("skuHomologadoParaCaso");
    expect(prep).toContain("skuHomologadoParaCaso");
    expect(readFileSync("src/lib/catalogo-sku.server.ts", "utf8")).toContain('.from("product_catalog")');
  });
});

describe("Planejador de Cidadania 0–8", () => {
  it("tem as nove fases consecutivas e recusa country_catalog", () => {
    expect(FASES_MOTOR_CIDADANIA.map((f) => f.fase)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(FASES_MOTOR_CIDADANIA[1]?.naoCriar).toContain("country_catalog");
    expect(types).not.toMatch(/country_catalog: \{/);
    for (const f of FASES_MOTOR_CIDADANIA) {
      for (const t of f.tabelas) {
        expect(tabelaExiste(t), `fase ${f.fase} aponta para ${t}`).toBe(true);
      }
    }
  });

  it("fase 6 é projeção sanitizada; fase 8 permanece planta", () => {
    const leitura = avaliarFasesMotorCidadania({
      trilhas: 1,
      marcos: 0,
      pessoas: 2,
      evidencias: 1,
      planoCaso: true,
      pesquisa: true,
      skuCatalogo: false,
    });
    expect(leitura[6]?.estado).toBe("com_dado");
    expect(leitura[7]?.estado).toBe("sem_dado");
    expect(leitura[8]?.estado).toBe("planta");
    expect(leitura[0]?.estado).toBe("com_dado");
  });
});
