/**
 * Coletor de erro em produção.
 *
 * Todo erro de servidor (`src/start.ts`, `src/server.ts`) e todo erro relatado pelo navegador
 * (`/api/erro`) passa por aqui e vai para dois lugares, os dois do próprio app:
 *   1. o log do servidor (`console.error`);
 *   2. a tabela `audit_logs` do banco (`acao = 'erro_app'`), lida só por admin — ver
 *      `src/lib/erro-no-banco.server.ts`.
 *
 * 02/11/2026: o envio ao Sentry foi retirado. Ele exigia uma conta e um DSN que a Proprietária não
 * consegue criar, então os erros do dia a dia não chegavam a lugar nenhum. O banco do app já existe,
 * já tem dono e já tem leitura restrita; nenhum serviço externo é necessário.
 *
 * Nunca lança e nunca bloqueia quem chamou.
 */

export type ContextoErro = Record<string, unknown>;

export function capturarErroProducao(error: unknown, contexto: ContextoErro = {}): void {
  const erroReal = error instanceof Error ? error : new Error(String(error));
  try {
    console.error("[erro_app]", String(contexto.mecanismo ?? "manual"), erroReal.message);
  } catch {
    /* log indisponível: segue para o banco */
  }
  void import("@/lib/erro-no-banco.server")
    .then((m) => m.gravarErroNoBanco(erroReal, contexto))
    .catch(() => {
      /* gravar o erro nunca pode virar um segundo erro */
    });
}
