import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * §5 do "Prompt de Implantação — Política Unificada de Casos Familiares"
 * (21/09/2026): registra a existência/propósito/status de um grupo
 * familiar/WhatsApp por caso, sem nunca criar ou integrar nada no
 * WhatsApp real — mesmo princípio já usado em `drive_provisioning_queue`
 * (migration 20260820010018): registrar antes de agir, execução externa
 * sempre manual.
 */

const migration = readFileSync(
  "supabase/migrations/20260921110000_case_grupos_comunicacao.sql",
  "utf8",
);
const funcoes = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");
const componente = readFileSync("src/components/caso/grupo-comunicacao-caso.tsx", "utf8");
const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("migration case_grupos_comunicacao", () => {
  it("cria a tabela com status fechado (planejado/ativo/arquivado)", () => {
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS public.case_grupos_comunicacao");
    expect(migration).toContain("CHECK (status IN ('planejado', 'ativo', 'arquivado'))");
  });

  it("tem RLS habilitada e políticas de leitura/escrita por organização", () => {
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("is_org_member(organization_id)");
    expect(migration).toContain("can_write(organization_id)");
  });

  it("bloqueia exclusão física (mesmo padrão de drive_provisioning_queue)", () => {
    expect(migration).toContain("fn_block_delete");
  });
});

describe("CRUD (caso-canonico.functions.ts) — só registra, nunca integra WhatsApp", () => {
  it("exige propósito não vazio ao registrar", () => {
    expect(funcoes).toContain('if (!data.proposito.trim()) throw new Error');
  });

  it("registra evento na timeline do caso ao criar e ao mudar status", () => {
    expect(funcoes).toContain('title: "Grupo de comunicação registrado"');
    expect(funcoes).toContain("Grupo de comunicação: status atualizado para");
  });

  it("não chama nenhuma API externa de WhatsApp", () => {
    expect(funcoes.toLowerCase()).not.toContain("whatsapp.com");
    expect(funcoes.toLowerCase()).not.toContain("meta.com");
  });
});

describe("GrupoComunicacaoCaso (componente) — deixa claro que a criação externa é manual", () => {
  it("o texto explica que não cria nada no WhatsApp real", () => {
    expect(componente).toContain("sem criar nem integrar nada no WhatsApp real");
  });

  it("permite colar o link só depois de o grupo já existir de verdade", () => {
    expect(componente).toContain("Colar link do grupo");
  });
});

describe("casos.$caseId.index.tsx — wiring na aba Pessoas", () => {
  it("importa o novo componente", () => {
    expect(pagina).toContain(
      'import { GrupoComunicacaoCaso } from "@/components/caso/grupo-comunicacao-caso";',
    );
  });

  it("aparece nos dois ramos da aba (com núcleo e sem núcleo)", () => {
    const ocorrencias = pagina.match(/<GrupoComunicacaoCaso/g) ?? [];
    expect(ocorrencias.length).toBe(2);
  });
});
