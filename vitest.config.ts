/**
 * Configuração dedicada do Vitest.
 *
 * POR QUE EXISTE UM ARQUIVO SÓ PARA ISTO, em vez de um bloco `test` no
 * vite.config.ts: aquele arquivo é gerenciado pelo @lovable.dev/vite-tanstack-config
 * e avisa, no topo, para não receber configuração manual — "do NOT add them
 * manually or the app will break". O Vitest prefere `vitest.config.ts` quando
 * ele existe, então a suíte ganha configuração própria sem tocar no build.
 *
 * O QUE ISTO CONSERTA (medido em 24/10/2026): `npm test` era `vitest run` sem
 * `exclude`. Havia 10.680 arquivos de teste dentro de `.claude/worktrees/`
 * contra 595 reais do projeto. Como `.claude/` está no .gitignore, o CI passava
 * limpo e só quebrava quem rodava localmente — humano ou agente —, que precisava
 * lembrar de `--exclude '.claude/**'` em toda invocação. Agora não precisa mais.
 *
 * O alias `@` vem de `vite-tsconfig-paths`, lendo o tsconfig: sem ele, os 595
 * arquivos de teste que importam `@/lib/...` deixariam de resolver.
 */
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.nitro/**",
      "**/.output/**",
      // Worktrees de sessão de agente: checkouts git aninhados do próprio
      // repositório. Rodá-los duplica a suíte inteira e produz falha falsa.
      ".claude/**",
      "tmp/**",
    ],
  },
});
