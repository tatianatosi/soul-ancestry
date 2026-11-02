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
 * Devolve uma promessa que NUNCA rejeita e termina em no máximo 3 s. Quem pode esperar (rota
 * `/api/erro`, middleware de erro) deve usar `await`: em servidor sem estado, o que ficou pendente é
 * encerrado quando a resposta sai, e a gravação em segundo plano se perdia (medido em produção em
 * 02/11/2026, quando o teste manual da rota respondeu 204 e nada chegou ao banco).
 */

export type ContextoErro = Record<string, unknown>;

const LIMITE_ESPERA_MS = 3_000;

export function capturarErroProducao(error: unknown, contexto: ContextoErro = {}): Promise<void> {
  const erroReal = error instanceof Error ? error : new Error(String(error));
  try {
    console.error("[erro_app]", String(contexto.mecanismo ?? "manual"), erroReal.message);
  } catch {
    /* log indisponível: segue para o banco */
  }
  const gravacao = import("@/lib/erro-no-banco.server")
    .then((m) => m.gravarErroNoBanco(erroReal, contexto))
    .catch(() => {
      /* gravar o erro nunca pode virar um segundo erro */
    });
  const limite = new Promise<void>((resolver) => setTimeout(resolver, LIMITE_ESPERA_MS));
  return Promise.race([gravacao, limite]);
}
