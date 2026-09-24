import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  ELOS_FLUXO_REAL,
  FLUXOS_PESSOA_UNIFICADA,
  MOTORES_TABELAS,
  ROTULO_ESTADO_MOTOR,
  elosAusentes,
  type EvidenciaMotor,
} from "@/lib/motores-tabelas";

/**
 * Corte E (24/09/2026): "IMPLEMENTADO_EM_FLUXO_REAL" só com writer, tabela,
 * reader, releitura, permissão, rota oficial e teste — e cada um conferido
 * no disco, não só declarado. Nenhum motor tem homologação da Proprietária.
 */
const types = readFileSync("src/integrations/supabase/types.ts", "utf8");
const sql = readdirSync("supabase/migrations")
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(join("supabase/migrations", f), "utf8"))
  .join("\n");

const tabelaExiste = (nome: string) =>
  types.includes(`${nome}: {`) || new RegExp(`create table (if not exists )?public\\.${nome}\\b`, "i").test(sql);

function funcaoExiste(ref: string): boolean {
  const [arquivo, funcao] = ref.split("#");
  if (!arquivo || !funcao || !existsSync(arquivo)) return false;
  return new RegExp(`export (const|function|async function) ${funcao}\\b`).test(readFileSync(arquivo, "utf8"));
}

function rotaExiste(rota: string): boolean {
  const base = join("src/routes/_authenticated", rota.slice(1).replaceAll("/", "."));
  return existsSync(`${base}.tsx`) || existsSync(`${base}.index.tsx`);
}

const todos: {
  id: string;
  estado: string;
  evidencia: EvidenciaMotor;
  lacunas: readonly string[];
  homologacaoProprietaria: string;
  provaAutenticada: string | null;
}[] = [
  ...MOTORES_TABELAS,
  ...FLUXOS_PESSOA_UNIFICADA,
];

describe("vocabulário honesto", () => {
  it("só os 5 estados, todos com rótulo", () => {
    expect(Object.keys(ROTULO_ESTADO_MOTOR).sort()).toEqual(
      [
        "CODIGO_E_TESTE_SEM_HOMOLOGACAO",
        "IMPLEMENTADO_EM_FLUXO_REAL",
        "IMPLEMENTADO_SOMENTE_LEITURA",
        "NAO_IMPLEMENTADO",
        "REFERENCIA_LEGADA",
      ].sort(),
    );
    for (const m of todos) expect(Object.keys(ROTULO_ESTADO_MOTOR)).toContain(m.estado);
  });
  it("elosAusentes aponta o que falta", () => {
    expect(
      elosAusentes({ writer: "a#b", tabela: "t", reader: null, releitura: " ", permissao: "p", rota: "/x", teste: "t" }),
    ).toEqual(["reader", "releitura"]);
  });
  it("nenhum item diz ter homologação da Proprietária sem prints autenticados", () => {
    for (const m of todos) expect(m.homologacaoProprietaria, m.id).toBe("pendente");
  });
});

/*
 * 24/09/2026 — decisão da Proprietária: teste de disco, fixture ou build
 * NÃO promovem. FLUXO_REAL exige os 7 elos E prova autenticada em
 * docs/provas/. Os elos técnicos continuam conferidos no disco para quem os
 * declara completos — mas isso só sustenta CODIGO_E_TESTE_SEM_HOMOLOGACAO.
 */
describe("IMPLEMENTADO_EM_FLUXO_REAL — só com prova autenticada", () => {
  it("nenhum item é fluxo real sem provaAutenticada existente em docs/provas/", () => {
    for (const m of todos.filter((x) => x.estado === "IMPLEMENTADO_EM_FLUXO_REAL")) {
      expect(m.provaAutenticada, m.id).toBeTruthy();
      expect(m.provaAutenticada!.startsWith("docs/provas/"), m.id).toBe(true);
      expect(existsSync(m.provaAutenticada!), m.id).toBe(true);
      expect(elosAusentes(m.evidencia), m.id).toEqual([]);
    }
  });
  it("hoje nenhum item tem prova autenticada — portanto nenhum é fluxo real", () => {
    for (const m of todos) expect(m.provaAutenticada, m.id).toBeNull();
    expect(todos.filter((m) => m.estado === "IMPLEMENTADO_EM_FLUXO_REAL")).toEqual([]);
  });
});

describe("elos técnicos completos — conferidos no disco (não promovem)", () => {
  const completos = todos.filter((m) => elosAusentes(m.evidencia).length === 0);
  it("há itens com os 7 elos técnicos", () => {
    expect(completos.length).toBeGreaterThan(0);
    expect(ELOS_FLUXO_REAL).toHaveLength(7);
  });
  for (const m of completos) {
    it(`${m.id}: writer e reader existem como export; tabela, rota e teste existem`, () => {
      expect(funcaoExiste(m.evidencia.writer!), `writer ${m.evidencia.writer}`).toBe(true);
      expect(funcaoExiste(m.evidencia.reader!), `reader ${m.evidencia.reader}`).toBe(true);
      expect(tabelaExiste(m.evidencia.tabela!), `tabela ${m.evidencia.tabela}`).toBe(true);
      expect(rotaExiste(m.evidencia.rota!), `rota ${m.evidencia.rota}`).toBe(true);
      expect(existsSync(m.evidencia.teste!), `teste ${m.evidencia.teste}`).toBe(true);
    });
    it(`${m.id}: o writer grava na tabela declarada`, () => {
      const [arquivo, funcao] = m.evidencia.writer!.split("#");
      const src = readFileSync(arquivo!, "utf8");
      const corpo = src.slice(src.search(new RegExp(`export (const|function|async function) ${funcao}\\b`)));
      const proximo = corpo.slice(1).search(/\nexport (const|function|async function) /);
      const trecho = proximo > 0 ? corpo.slice(0, proximo + 1) : corpo;
      expect(trecho.includes(`"${m.evidencia.tabela}"`) || (trecho.includes("data.tabela") && src.includes(`${m.evidencia.tabela}:`)), m.id).toBe(true);
    });
  }
});

describe("demais estados declaram a lacuna", () => {
  for (const m of todos.filter((x) => x.estado !== "IMPLEMENTADO_EM_FLUXO_REAL")) {
    it(`${m.id} (${m.estado}) tem lacuna escrita`, () => {
      expect(m.lacunas.length, m.id).toBeGreaterThan(0);
    });
  }
  it("todo CODIGO_E_TESTE_SEM_HOMOLOGACAO declara a falta de prova autenticada", () => {
    for (const m of todos.filter((x) => x.estado === "CODIGO_E_TESTE_SEM_HOMOLOGACAO")) {
      expect(m.lacunas.some((l) => l.includes("Sem prova autenticada")), m.id).toBe(true);
    }
  });
  it("somente leitura não declara writer", () => {
    for (const m of todos.filter((x) => x.estado === "IMPLEMENTADO_SOMENTE_LEITURA")) {
      expect(m.evidencia.writer, m.id).toBeNull();
      expect(funcaoExiste(m.evidencia.reader!), m.id).toBe(true);
    }
  });
});

describe("cadeia Pessoa Unificada reclassificada", () => {
  const porId = Object.fromEntries(FLUXOS_PESSOA_UNIFICADA.map((f) => [f.id, f.estado]));
  it("R2, núcleo/dossiê, perfil e D7 ficam sem homologação até a prova autenticada", () => {
    expect(porId).toEqual({
      "R2-CPF": "CODIGO_E_TESTE_SEM_HOMOLOGACAO",
      "NUCLEO-DOSSIE": "CODIGO_E_TESTE_SEM_HOMOLOGACAO",
      "DOSSIE-LEGADO-CASO": "REFERENCIA_LEGADA",
      "INVENTARIO-PESSOA": "IMPLEMENTADO_SOMENTE_LEITURA",
      "PERFIL-VINCULADO": "CODIGO_E_TESTE_SEM_HOMOLOGACAO",
      D7: "CODIGO_E_TESTE_SEM_HOMOLOGACAO",
    });
  });
  it("os 4 fluxos a homologar apontam para uma seção existente do roteiro", () => {
    for (const f of FLUXOS_PESSOA_UNIFICADA) {
      const roteiro = (f as { roteiroHomologacao?: string }).roteiroHomologacao;
      if (!["R2-CPF", "NUCLEO-DOSSIE", "PERFIL-VINCULADO", "D7"].includes(f.id)) continue;
      expect(roteiro, f.id).toBeTruthy();
      const [arquivo, ancora] = roteiro!.split("#");
      expect(existsSync(arquivo!), f.id).toBe(true);
      expect(readFileSync(arquivo!, "utf8"), f.id).toContain(`<a id="${ancora}"></a>`);
    }
  });
  it("cada fluxo mora num motor P existente — não há 13º motor", () => {
    const ids = MOTORES_TABELAS.map((m) => m.id as string);
    for (const f of FLUXOS_PESSOA_UNIFICADA) expect(ids).toContain(f.motor);
  });
});
