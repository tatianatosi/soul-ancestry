import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Fase 1 do achado crítico Frontend/Repo Maintainer da auditoria full-spectrum
 * de 01/11/2026 (reviews/audit-as-frontend-eng.md): 210 arquivos com
 * `eslint-disable @typescript-eslint/no-explicit-any`, concentrados na borda
 * `createServerFn` — `context.supabase as any` era quase sempre desnecessário,
 * porque `requireSupabaseAuth` já tipa `context.supabase` como
 * `SupabaseClient<Database>` de verdade (ver auth-middleware.ts).
 *
 * Esta fase remove o cast e o disable só nos arquivos onde isso era o ÚNICO
 * uso de `any` — sem tocar `Sb = any` (pesquisa-modulo.server.ts), que precisa
 * de uma fase própria por ser um tipo compartilhado por muitos arquivos.
 * Iniciativa em fases; não é o cleanup completo dos 210 arquivos.
 */

const ARQUIVOS_CORRIGIDOS = [
  "src/lib/abrir-caso-operacional.functions.ts",
  "src/lib/atos-representacao.functions.ts",
  "src/lib/caso-busca.functions.ts",
  "src/lib/contrato-docx.functions.ts",
  "src/lib/contrato-pdf.functions.ts",
  "src/lib/planejador-produtos-pai.functions.ts",
  "src/lib/radar-marcos-juridicos.functions.ts",
  "src/lib/trilhas-juridicas.functions.ts",
];

describe("Frontend — fase 1 do cleanup de eslint-disable no-explicit-any (01/11/2026)", () => {
  it.each(ARQUIVOS_CORRIGIDOS)(
    "%s não desabilita mais a regra nem faz cast de context.supabase",
    (caminho) => {
      const conteudo = readFileSync(caminho, "utf8");
      expect(conteudo).not.toContain("eslint-disable @typescript-eslint/no-explicit-any");
      expect(conteudo).not.toMatch(/context\.supabase as any|\(context as any\)\.supabase/);
    },
  );

  it("abrir-caso-operacional.functions.ts documenta, com cast estreito e não 'as never', o campo gerado por trigger", () => {
    const conteudo = readFileSync("src/lib/abrir-caso-operacional.functions.ts", "utf8");
    // 'as never' foi removido do projeto como anti-padrão (achado R6 da auditoria de 27/10/2026).
    expect(conteudo).not.toContain("as never");
    expect(conteudo).toContain('as unknown as Database["public"]["Tables"]["crm_casos"]["Insert"]');
    expect(conteudo).toMatch(/codigo.*gerado por trigger/);
  });

  it("sku-produto-pai.functions.ts NÃO entra nesta fase — depende do tipo compartilhado Sb = any", () => {
    const conteudo = readFileSync("src/lib/sku-produto-pai.functions.ts", "utf8");
    expect(conteudo).toContain("eslint-disable @typescript-eslint/no-explicit-any");
    const sb = readFileSync("src/lib/pesquisa-modulo.server.ts", "utf8");
    expect(sb).toContain("export type Sb = any");
  });
});
