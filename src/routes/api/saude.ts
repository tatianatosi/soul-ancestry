import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Rota de saúde pública (#176, item 8 do laudo de prontidão, 27/10/2026):
 * "main pode divergir da produção sem alarme — nenhuma rota de saúde
 * expondo o SHA publicado". Esta rota expõe o commit publicado quando o
 * ambiente de deploy injeta alguma das variáveis comuns de CI/CD.
 *
 * Limite conhecido, documentado em vez de fingido: não há confirmação de
 * que o deploy do Lovable injeta qualquer uma destas variáveis hoje — se
 * nenhuma existir, `sha` responde `null` e `shaConhecida: false`
 * honestamente, em vez de inventar um valor. Se o ambiente de deploy
 * expuser outra variável, basta somar seu nome à lista abaixo.
 */
const VARIAVEIS_SHA = [
  "VERCEL_GIT_COMMIT_SHA",
  "GITHUB_SHA",
  "COMMIT_SHA",
  "SOURCE_VERSION",
  "RENDER_GIT_COMMIT",
] as const;

export const Route = createFileRoute("/api/saude")({
  server: {
    handlers: {
      GET: async () => {
        const sha = VARIAVEIS_SHA.map((v) => process.env[v]).find((v) => Boolean(v)) ?? null;
        return new Response(
          JSON.stringify({
            ok: true,
            sha,
            shaConhecida: sha !== null,
            agora: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "no-store",
            },
          },
        );
      },
    },
  },
});
