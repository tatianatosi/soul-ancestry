import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  CONFIRMACAO_UNIFICAR,
  detectarDuplicidades,
  exigirConfirmacaoUnificar,
  montarPlanoUnificacao,
  validarPosMerge,
  type NucleoParaComparar,
} from "@/lib/nucleo-duplicidade";

function nucleo(overrides: Partial<NucleoParaComparar>): NucleoParaComparar {
  return {
    id: "id",
    nome: "Núcleo",
    dossie_mae: null,
    contratante_nome: null,
    dossie_status: null,
    status: "ativo",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    case_id: null,
    caso: null,
    membros: [],
    ...overrides,
  };
}

describe("detectarDuplicidades — Fase 1 (Detecção) da unificação de núcleos", () => {
  it("não sugere nada quando não há nenhum sinal em comum", () => {
    const a = nucleo({ id: "a", nome: "Família Silva" });
    const b = nucleo({ id: "b", nome: "Família Costa" });
    expect(detectarDuplicidades([a, b])).toEqual([]);
  });

  it("marca confiança alta quando os dois núcleos apontam para o mesmo caso", () => {
    const a = nucleo({ id: "a", case_id: "caso-1" });
    const b = nucleo({ id: "b", case_id: "caso-1" });
    const [c] = detectarDuplicidades([a, b]);
    expect(c.confianca).toBe("alta");
    expect(c.motivos).toContain("Os dois núcleos apontam para o mesmo caso.");
  });

  it("marca confiança alta quando duas ou mais pessoas de nome completo coincidem", () => {
    const a = nucleo({ id: "a", membros: [{ nome: "João Pedro Silva" }, { nome: "Maria Costa Silva" }] });
    const b = nucleo({ id: "b", membros: [{ nome: "João Pedro Silva" }, { nome: "Maria Costa Silva" }] });
    const [c] = detectarDuplicidades([a, b]);
    expect(c.confianca).toBe("alta");
    expect(c.pessoasEmComum).toEqual(["joao pedro silva", "maria costa silva"]);
  });

  it("marca confiança média quando só uma pessoa de nome completo coincide", () => {
    const a = nucleo({ id: "a", membros: [{ nome: "João Pedro Silva" }] });
    const b = nucleo({ id: "b", membros: [{ nome: "João Pedro Silva" }, { nome: "Outra Pessoa Distinta" }] });
    const [c] = detectarDuplicidades([a, b]);
    expect(c.confianca).toBe("media");
  });

  it("ignora primeiro nome isolado em comum para não gerar falso positivo", () => {
    const a = nucleo({ id: "a", nome: "Família Silva", membros: [{ nome: "Ana" }] });
    const b = nucleo({ id: "b", nome: "Família Costa", membros: [{ nome: "Ana" }] });
    expect(detectarDuplicidades([a, b])).toEqual([]);
  });

  it("marca confiança alta quando o nome do contratante é igual, ignorando acento e caixa", () => {
    const a = nucleo({ id: "a", contratante_nome: "José da Silva" });
    const b = nucleo({ id: "b", contratante_nome: "JOSE DA SILVA" });
    const [c] = detectarDuplicidades([a, b]);
    expect(c.confianca).toBe("alta");
    expect(c.motivos).toContain("Mesmo nome de contratante registrado nos dois núcleos.");
  });

  it("nunca compara núcleo arquivado", () => {
    const a = nucleo({ id: "a", status: "arquivado", case_id: "caso-1" });
    const b = nucleo({ id: "b", case_id: "caso-1" });
    expect(detectarDuplicidades([a, b])).toEqual([]);
  });

  it("nunca decide nem funde: todo candidato sai com status 'sugerido'", () => {
    const a = nucleo({ id: "a", case_id: "caso-1" });
    const b = nucleo({ id: "b", case_id: "caso-1" });
    const [c] = detectarDuplicidades([a, b]);
    expect(c.status).toBe("sugerido");
  });

  it("ordena candidatos por confiança, da alta para a baixa", () => {
    const a = nucleo({ id: "a", nome: "Dossiê Alpha", case_id: "caso-1" });
    const b = nucleo({ id: "b", nome: "Dossiê Alpha", case_id: "caso-1" });
    const x = nucleo({ id: "x", membros: [{ nome: "Pedro Henrique Lima" }] });
    const y = nucleo({ id: "y", membros: [{ nome: "Pedro Henrique Lima" }, { nome: "Sem Relação Nenhuma" }] });
    const candidatos = detectarDuplicidades([x, y, a, b]);
    expect(candidatos[0]!.confianca).toBe("alta");
    expect(candidatos[candidatos.length - 1]!.confianca).not.toBe("alta");
  });
});

describe("montarPlanoUnificacao — fases 2–3", () => {
  it("recusa quando canônico e origem são o mesmo id", () => {
    const n = nucleo({ id: "c", nome: "Família Silva" });
    const plano = montarPlanoUnificacao(n, n);
    expect(plano.recusado).toBe(true);
    expect(plano.caso.acao).toBe("recusar");
    expect(plano.motivoRecusa).toMatch(/mesmo núcleo/i);
  });

  it("recusa quando um dos núcleos já está arquivado", () => {
    const canonico = nucleo({ id: "c", nome: "Família Silva", status: "arquivado", archived_at: "2026-09-01T00:00:00Z" });
    const origem = nucleo({ id: "o", nome: "Família Silva 2" });
    const plano = montarPlanoUnificacao(canonico, origem);
    expect(plano.recusado).toBe(true);
    expect(plano.motivoRecusa).toMatch(/arquivado/i);
  });

  it("recusa quando os dois núcleos apontam para casos diferentes", () => {
    const canonico = nucleo({ id: "c", nome: "Família Silva", case_id: "caso-a" });
    const origem = nucleo({ id: "o", nome: "Família Silva 2", case_id: "caso-b" });
    const plano = montarPlanoUnificacao(canonico, origem);
    expect(plano.recusado).toBe(true);
    expect(plano.caso.acao).toBe("recusar");
    expect(plano.motivoRecusa).toMatch(/casos diferentes/i);
    expect(plano.membros).toEqual([]);
  });

  it("transfere o caso da origem quando o canônico não tem caso", () => {
    const canonico = nucleo({ id: "c", nome: "Família Silva", case_id: null });
    const origem = nucleo({ id: "o", nome: "Família Silva 2", case_id: "caso-1", leadsAtivos: 2 });
    const plano = montarPlanoUnificacao(canonico, origem);
    expect(plano.recusado).toBe(false);
    expect(plano.caso.acao).toBe("transferir");
    expect(plano.caso.caseIdFinal).toBe("caso-1");
    expect(plano.leads).toEqual({ acao: "reapontar", quantidade: 2 });
    expect(plano.arquivoOrigem.status).toBe("arquivado");
    expect(plano.arquivoOrigem.motivo).toContain("c");
  });

  it("arquiva o membro da origem em conflito de nome em vez de mover", () => {
    const canonico = nucleo({
      id: "c",
      nome: "Família Silva",
      membros: [{ id: "m1", nome: "João Pedro Silva" }],
    });
    const origem = nucleo({
      id: "o",
      nome: "Família Silva 2",
      membros: [
        { id: "m2", nome: "JOÃO PEDRO SILVA" },
        { id: "m3", nome: "Maria Costa Silva" },
      ],
    });
    const plano = montarPlanoUnificacao(canonico, origem);
    expect(plano.recusado).toBe(false);
    expect(plano.membros).toEqual([
      { acao: "arquivar_por_conflito", nome: "JOÃO PEDRO SILVA", membroId: "m2" },
      { acao: "mover", nome: "Maria Costa Silva", membroId: "m3" },
    ]);
  });

  it("não move membro já arquivado na origem e trata nome arquivado no canônico como conflito da unique", () => {
    const canonico = nucleo({
      id: "c",
      nome: "Família Silva",
      membros: [{ id: "m0", nome: "Ana Beatriz Lima", archived_at: "2026-01-01T00:00:00Z" }],
    });
    const origem = nucleo({
      id: "o",
      nome: "Família Silva 2",
      membros: [
        { id: "m1", nome: "Ana Beatriz Lima" },
        { id: "m2", nome: "Arquivado Origem", archived_at: "2026-02-01T00:00:00Z" },
      ],
    });
    const plano = montarPlanoUnificacao(canonico, origem);
    expect(plano.membros).toEqual([
      { acao: "arquivar_por_conflito", nome: "Ana Beatriz Lima", membroId: "m1" },
    ]);
  });

  it("mantém o case_id do canônico quando os dois apontam para o mesmo caso", () => {
    const canonico = nucleo({ id: "c", nome: "A", case_id: "caso-1" });
    const origem = nucleo({ id: "o", nome: "B", case_id: "caso-1" });
    const plano = montarPlanoUnificacao(canonico, origem);
    expect(plano.caso.acao).toBe("manter");
    expect(plano.caso.caseIdFinal).toBe("caso-1");
    expect(plano.arquivoOrigem.status).toBe("arquivado");
    expect(plano.arquivoOrigem.motivo).toContain("c");
  });
});

describe("exigirConfirmacaoUnificar — sem fusão automática", () => {
  it("recusa qualquer confirmação diferente de UNIFICAR", () => {
    expect(() => exigirConfirmacaoUnificar("unificar")).toThrow(/UNIFICAR/);
    expect(() => exigirConfirmacaoUnificar("")).toThrow(/Não há fusão automática/);
    expect(() => exigirConfirmacaoUnificar("SIM")).toThrow(/UNIFICAR/);
    expect(() => exigirConfirmacaoUnificar(CONFIRMACAO_UNIFICAR)).not.toThrow();
  });
});

describe("validarPosMerge — fase 6", () => {
  const base = {
    canonicoId: "c",
    origemId: "o",
    caseIdEsperado: "caso-1" as string | null,
    origem: { id: "o", status: "arquivado", archived_at: "2026-09-10T00:00:00Z", case_id: "caso-1" },
    canonico: { id: "c", status: "ativo", archived_at: null, case_id: "caso-1" },
    membros: [
      { id: "m1", nucleo_id: "c", nome: "João Pedro Silva", archived_at: null },
      { id: "m2", nucleo_id: "o", nome: "João Pedro Silva", archived_at: "2026-09-10T00:00:00Z" },
    ],
    leads: [{ id: "l1", nucleo_id: "c" }],
  };

  it("aceita origem arquivada, membros/leads no canônico e nomes únicos", () => {
    expect(validarPosMerge(base).ok).toBe(true);
  });

  it("falha se a origem não ficou arquivada", () => {
    const r = validarPosMerge({
      ...base,
      origem: { ...base.origem, status: "ativo", archived_at: null },
    });
    expect(r.ok).toBe(false);
    expect(r.falhas.join(" ")).toMatch(/não ficou arquivado/);
  });

  it("falha se ainda há lead na origem", () => {
    const r = validarPosMerge({ ...base, leads: [{ id: "l1", nucleo_id: "o" }] });
    expect(r.ok).toBe(false);
    expect(r.falhas.join(" ")).toMatch(/lead/i);
  });

  it("falha se ainda há membro ativo na origem", () => {
    const r = validarPosMerge({
      ...base,
      membros: [
        { id: "m1", nucleo_id: "c", nome: "João Pedro Silva", archived_at: null },
        { id: "m2", nucleo_id: "o", nome: "Maria Costa Silva", archived_at: null },
      ],
    });
    expect(r.ok).toBe(false);
    expect(r.falhas.join(" ")).toMatch(/membro/i);
  });

  it("falha se o canônico ficou com nomes duplicados ativos", () => {
    const r = validarPosMerge({
      ...base,
      membros: [
        { id: "m1", nucleo_id: "c", nome: "João Pedro Silva", archived_at: null },
        { id: "m3", nucleo_id: "c", nome: "joão pedro silva", archived_at: null },
      ],
    });
    expect(r.ok).toBe(false);
    expect(r.falhas.join(" ")).toMatch(/duplicado/i);
  });
});

describe("writer executarUnificacaoNucleo — contrato de persistência", () => {
  it("exige UNIFICAR, grava com verificação e não pede coluna nova", () => {
    const src = readFileSync("src/lib/nucleo-duplicidade.functions.ts", "utf8");
    const ui = readFileSync("src/routes/_authenticated/nucleos-duplicidades.tsx", "utf8");
    expect(src).toContain("executarUnificacaoNucleo");
    expect(src).toContain("exigirConfirmacaoUnificar");
    expect(src).toContain("gravarComVerificacao");
    expect(src).toContain("method: \"POST\"");
    expect(src).toContain('tabela: "nucleos_familiares"');
    expect(src).toContain('tabela: "nucleo_membros"');
    expect(src).toContain('tabela: "leads"');
    expect(src).toContain('status: "arquivado"');
    expect(src).toContain("archived_by");
    expect(src).toContain("archive_motivo");
    expect(src).toContain("select(\"id,nucleo_id,nome,papel,archived_at\")");
    expect(src).toContain("audit_logs");
    expect(src).toContain("validarPosMerge");
    expect(src).toContain("requireSupabaseAuth");
    expect(src).not.toMatch(/dependem de colunas/);
    expect(src).not.toMatch(/status `mesclado`/);
    expect(ui).toContain("CONFIRMACAO_UNIFICAR");
    expect(ui).toContain("montarPlanoUnificacao");
    expect(ui).toContain("invalidateQueries");
    expect(ui).not.toMatch(/dependem de colunas novas/);
  });
});
