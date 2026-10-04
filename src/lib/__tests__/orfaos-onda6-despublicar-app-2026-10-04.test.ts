import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Onda 6 dos órfãos (04/10/2026).
 *
 * `despublicarProjecaoApp` existia em `portal-atendimento.functions.ts` com
 * papel, auditoria, timeline e arquivamento (nunca exclusão) — e zero
 * chamadores: despublicar do App Cliente só saía por SQL manual. O artefato
 * 007 do AGENTS.md exige o contrário: "Desk publica e despublica (autor,
 * data, caso, estado) sem SQL manual".
 *
 * O que faltava era a leitura: `painelAtendimento` não devolvia as publicações
 * vivas, então a ação não tinha onde aparecer.
 */

const FN = "src/lib/portal-atendimento.functions.ts";
const UI = "src/components/portal/atendimento-interno.tsx";

describe("Despublicar do App Cliente deixa de depender de SQL", () => {
  it("1. o painel passa a ler as publicações vivas do caso", () => {
    const s = readFileSync(FN, "utf8");
    expect(s).toContain('.from("app_projections")');
    expect(s).toContain("projecoes: (projecoes.data ?? []) as any[]");
    // Só publicação viva: arquivada não volta para a lista.
    const trecho = s.slice(s.indexOf('.from("app_projections")\n            .select'));
    expect(trecho.slice(0, 600)).toContain('.is("archived_at", null)');
  });

  it("2. a tela chama o escritor que existia, sem writer novo", () => {
    const s = readFileSync(UI, "utf8");
    expect(s).toContain("despublicarProjecaoApp");
    expect(s).toContain("despublicar.mutate({ projecaoId: p.id, motivo })");
    expect(s).not.toContain('from("app_projections")');
  });

  it("3. cada publicação mostra tipo, data e autor — o que o artefato 007 exige", () => {
    const s = readFileSync(UI, "utf8");
    expect(s).toContain("ROTULO_PUBLICACAO");
    /*
     * 04/10/2026, modo execução controlada: medi no caso da Ana que 5 das 6
     * projeções vivas NÃO estão publicadas (approval_status "archived" ou
     * "draft"). O título "No App agora" seria mentira para elas, então cada
     * linha passa a dizer se está no App ou não, e a data/autor vêm da
     * aprovação quando existe.
     */
    expect(s).toContain("p.approved_at ?? p.created_at");
    expect(s).toContain("nomePessoa(p.approved_by ?? p.created_by)");
    expect(s).toContain("data-no-app");
    expect(s).toContain("não publicado");
  });

  it("4. despublicar arquiva com motivo e nunca apaga", () => {
    const s = readFileSync(FN, "utf8");
    const bloco = s.slice(s.indexOf("export const despublicarProjecaoApp"));
    expect(bloco.slice(0, 1600)).toContain("archived_at");
    expect(bloco.slice(0, 1600)).toContain("archived_reason");
    expect(bloco.slice(0, 1600)).not.toContain(".delete()");
    expect(bloco.slice(0, 1600)).toContain("projecao_app_despublicada");
    const ui = readFileSync(UI, "utf8");
    expect(ui).toContain("Nada é apagado");
  });

  it("5. a ação respeita o papel e passa por confirmação com motivo", () => {
    const s = readFileSync(FN, "utf8");
    const bloco = s.slice(s.indexOf("export const despublicarProjecaoApp"));
    expect(bloco.slice(0, 900)).toContain("PAPEIS_ENTREGA");
    const ui = readFileSync(UI, "utf8");
    expect(ui).toContain('acaoExterna="despublicar_projecao_app_cliente"');
    expect(ui).toContain("Só admin e operações despublicam.");
  });

  it("6. estado vazio é específico, não genérico", () => {
    const ui = readFileSync(UI, "utf8");
    expect(ui).toContain("Nada publicado neste caso ainda");
    expect(ui).toContain("Não foi possível ler as publicações.");
  });
});
