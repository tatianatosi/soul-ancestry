import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Peça C do laudo "nada persiste" (#189): "O comentário de 05/09 neste
 * repositório descreve esta mesma classe de bug sendo corrigida para 4
 * fontes — e a quinta escapou. Sem trava, escapa de novo. Teste que falha
 * se um portão de banco existir sem estar no inventário da Peça A."
 *
 * Medição no banco vivo (28/10/2026, `pg_trigger` + `pg_get_functiondef`,
 * query: `select t.tgname, p.proname from pg_trigger t join pg_proc p on
 * p.oid = t.tgfoid join pg_class c on c.oid = t.tgrelid where c.relname =
 * 'crm_casos' and not t.tgisinternal`): 20 triggers em `crm_casos`. Destes,
 * 6 são guardas que recusam a ATIVAÇÃO (fazem `RAISE EXCEPTION` na
 * transição para ativo/caso_ativo) — os outros 14 são auditoria, metadado
 * ou normalização (fn_audit, fn_archive_meta, update_updated_at_column,
 * fn_case_codigo_canonico, fn_registrar_case_phase_history,
 * fn_caso_alias_guard, fn_caso_papel_registro, fn_data_origin_coerencia,
 * clube_ancestral_timeline_operacional, fn_seed_activation_checks,
 * fn_suspensao_tarefa_revisao, fn_audit_status, fn_block_delete,
 * fn_estado_caso — nenhum recusa ativação).
 *
 * Dos 6 guardas de ativação, 5 JÁ estão no inventário da Peça A
 * (src/lib/inventario-portoes.server.ts), porque leem a mesma tabela que
 * uma das categorias já cobertas por `case_ativacao_bloqueios_reais` ou
 * por `piloto_bloqueios`:
 *
 * | Trigger                        | Lê (tabela/condição)                          | Cobertura na Peça A |
 * |---------------------------------|------------------------------------------------|----------------------|
 * | fn_guard_ativacao                | case_activation_pendencias (case_activation_checks) | "checklist_ativacao_14_itens" |
 * | fn_piloto_caso_guard              | piloto_bloqueios                              | portoesDoPilotoDoCaso |
 * | fn_guard_consentimento_ativacao   | consentimento_ativo/consentimento_dispensado  | "consentimento_real_ativacao" |
 * | fn_quality_guard_ativacao         | quality_issues (severidade=critica)           | "quality_issue_critica" |
 * | fn_caso_ativacao_gates_guard      | case_activation_gates (mesma fonte que #1)    | "checklist_ativacao_14_itens" |
 *
 * **A 6ª escapou de verdade**: `fn_caso_ativo_guard` recusa a transição
 * `eixo_operacao = 'caso_ativo'` (condição DIFERENTE de `ativo`/`status`)
 * quando falta `onboarding_iniciado_em` ou há item obrigatório de
 * `onboarding_checklist` pendente — e NADA no inventário da Peça A lê essa
 * condição. Está fora do inventário hoje porque, medido no banco
 * (`select eixo_operacao, count(*) from crm_casos group by eixo_operacao`),
 * **nenhum caso real tem `eixo_operacao <> 'nao_iniciado'`** e nenhum
 * código TypeScript escreve esse valor (grep confirmado abaixo) — o
 * portão é real mas está dormente, nunca a recusa aconteceu para um
 * usuário.
 *
 * A trava: se qualquer escrita futura setar `eixo_operacao: "caso_ativo"`,
 * este teste falha e aponta exatamente para onde estender a Peça A ANTES
 * do portão acordar — não depois, como aconteceu com piloto_bloqueios.
 */
describe("Peça C — trava contra reincidência (portão de crm_casos fora do inventário da Peça A)", () => {
  it('fn_caso_ativo_guard permanece dormente: nenhum código escreve eixo_operacao="caso_ativo"', () => {
    const arquivos: string[] = [];
    const caminha = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.name === "__tests__" || e.name === "node_modules") continue;
        const p = join(dir, e.name);
        if (e.isDirectory()) caminha(p);
        else if (/\.tsx?$/.test(e.name)) arquivos.push(p);
      }
    };
    caminha("src");

    const comEscrita: string[] = [];
    for (const f of arquivos) {
      const src = readFileSync(f, "utf8");
      if (/eixo_operacao\s*:\s*["']caso_ativo["']/.test(src)) comEscrita.push(f);
    }
    expect(
      comEscrita,
      "eixo_operacao='caso_ativo' passou a ser escrito — fn_caso_ativo_guard acordou. " +
        "Estenda src/lib/inventario-portoes.server.ts (onboarding_checklist + onboarding_iniciado_em) " +
        "ANTES de prosseguir, para não repetir o incidente de piloto_bloqueios (#188/#189).",
    ).toEqual([]);
  });

  it("os 5 guardas de ativação já cobertos continuam documentados no arquivo da Peça A", () => {
    const src = readFileSync("src/lib/inventario-portoes.server.ts", "utf8");
    for (const referencia of [
      "fn_piloto_caso_guard",
      "case_ativacao_bloqueios_reais",
      "case_activation_pendencias",
    ]) {
      expect(src, `referência ausente: ${referencia}`).toContain(referencia);
    }
  });

  it("Peça B (tradutor) conhece os dois guards de ativação mais acionados (fn_guard_ativacao, fn_piloto_caso_guard)", () => {
    const src = readFileSync("src/lib/recusa-traducao.server.ts", "utf8");
    expect(src).toContain("fn_piloto_caso_guard");
    expect(src).toContain("fn_guard_ativacao");
  });
});
