import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  composicaoDoCasoCliente,
  etapaDoCasoCliente,
  ROTULOS_ETAPA_CLIENTE,
} from "@/lib/portal-dados-vivos";
import { FASES_JORNADA } from "@/lib/onboarding-jornada";
import { COMPOSICOES } from "@/lib/cadeia-operacional";

const raiz = resolve(__dirname, "../../..");
const ler = (p: string) => readFileSync(resolve(raiz, p), "utf8");

describe("etapa do caso projetada ao cliente", () => {
  it("devolve a posição real dentro das 8 fases canônicas", () => {
    const etapa = etapaDoCasoCliente("pesquisa_e_validacao");
    expect(etapa).not.toBeNull();
    expect(etapa!.posicao).toBe(4);
    expect(etapa!.total).toBe(8);
    expect(etapa!.rotulo).toBe("Pesquisa em andamento");
    expect(etapa!.fracao).toBeCloseTo(4 / 8);
  });

  it("aceita a grafia sem '_e_' do outro vocabulário de fase", () => {
    // `jornada-cliente.ts` grava `pesquisa_validacao`; `onboarding-jornada.ts`
    // grava `pesquisa_e_validacao`. As duas apontam para a mesma etapa.
    expect(etapaDoCasoCliente("pesquisa_validacao")?.posicao).toBe(
      etapaDoCasoCliente("pesquisa_e_validacao")?.posicao,
    );
  });

  it("cobre todas as fases do CHECK, sem buraco", () => {
    for (const fase of FASES_JORNADA) {
      const etapa = etapaDoCasoCliente(fase.id);
      expect(etapa, fase.id).not.toBeNull();
      expect(etapa!.rotulo).toBe(fase.cliente);
    }
  });

  it("fase ausente ou fora do catálogo não vira etapa inventada", () => {
    expect(etapaDoCasoCliente(null)).toBeNull();
    expect(etapaDoCasoCliente("")).toBeNull();
    expect(etapaDoCasoCliente("fase_2")).toBeNull();
    expect(etapaDoCasoCliente("qualquer_coisa")).toBeNull();
  });

  it("os rótulos de etapa do App são exatamente os do catálogo, na ordem", () => {
    expect(ROTULOS_ETAPA_CLIENTE).toEqual(FASES_JORNADA.map((f) => f.cliente));
  });
});

describe("composição do caso projetada ao cliente", () => {
  it("traduz os três valores canônicos", () => {
    expect(composicaoDoCasoCliente("individual")).toBe("Caso individual");
    expect(composicaoDoCasoCliente("casal")).toBe("Caso do casal");
    expect(composicaoDoCasoCliente("nucleo_familiar")).toBe("Caso da família");
  });

  it("cobre todo o vocabulário de COMPOSICOES", () => {
    for (const c of COMPOSICOES) expect(composicaoDoCasoCliente(c), c).not.toBeNull();
  });

  it("valor fora do vocabulário não vira rótulo inventado", () => {
    expect(composicaoDoCasoCliente(null)).toBeNull();
    expect(composicaoDoCasoCliente("familia_extensa")).toBeNull();
  });
});

describe("migration que estende portal_casos", () => {
  const sql = ler("supabase/migrations/20260921160000_portal_casos_fase_e_composicao.sql");

  it("projeta fase e composição do plano ativo mais recente", () => {
    expect(sql).toContain("p.fase_jornada");
    expect(sql).toContain("p.composicao");
    expect(sql).toContain("cp.status = 'ativo'");
    expect(sql).toContain("cp.archived_at is null");
    expect(sql).toContain("order by cp.updated_at desc");
    expect(sql).toContain("limit 1");
  });

  it("mantém o gate de portal e não cria policy nem grant novo", () => {
    expect(sql).toContain("public.portal_caso_permitido(c.id)");
    expect(sql).toContain("security_barrier = true");
    expect(sql).not.toMatch(/create\s+policy/i);
    expect(sql).not.toMatch(/alter\s+table/i);
    expect(sql).not.toMatch(/grant[\s\S]{0,40}anon/i);
  });

  it("não expõe nenhuma outra coluna de case_plans", () => {
    const interno = [
      "observacao_interna",
      "responsavel_user_id",
      "pendencias_internas",
      "status_saude",
      "proxima_acao",
      "marco_atual",
      "dias_sem_touchpoint",
    ];
    for (const coluna of interno) expect(sql, coluna).not.toContain(`cp.${coluna}`);
  });
});

describe("App consome a etapa real, não uma lista fixa", () => {
  it("a Home desenha o progresso a partir da etapa do servidor", () => {
    const home = ler("src/routes/portal/index.tsx");
    expect(home).toContain("ROTULOS_ETAPA_CLIENTE");
    expect(home).toContain("vivo.data?.composicao");
    // O valor à direita da barra é a posição real, não um percentual inferido.
    expect(home).toContain("`Etapa ${etapa.posicao} de ${etapa.total}`");
  });

  it("a Jornada deixou de usar passos fixos para o cliente real", () => {
    const jornada = ler("src/routes/portal/jornada.tsx");
    expect(jornada).toContain("const passos = ehDemo ? PASSOS_CASO : ROTULOS_ETAPA_CLIENTE");
    expect(jornada).toContain("vivo.etapa");
    // A trilha não pode voltar a ler a constante direto no corpo do componente.
    const trilha = jornada.slice(
      jornada.indexOf("function TrilhaCompacta"),
      jornada.indexOf("function TrilhaCompacta") + 2200,
    );
    expect(trilha).not.toContain("PASSOS_CASO.map");
    expect(trilha).not.toContain("PASSOS_CASO[passoAtualIndice]");
  });

  it("o servidor entrega etapa e composição já sanitizadas", () => {
    const fn = ler("src/lib/portal-dados-vivos.functions.ts");
    expect(fn).toContain("fase_jornada, composicao");
    expect(fn).toContain("etapa: etapaDoCasoCliente(casoAtivo.fase_jornada)");
    expect(fn).toContain("composicao: composicaoDoCasoCliente(casoAtivo.composicao)");
    // Caso não autorizado segue devolvendo vazio, agora também sem etapa.
    expect(fn).toContain("etapa: null, composicao: null");
    // A fronteira não se rompe: o portal não lê case_plans direto.
    expect(fn).not.toContain('from("case_plans")');
  });
});
