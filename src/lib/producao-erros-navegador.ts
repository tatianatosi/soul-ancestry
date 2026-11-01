/**
 * Lado do navegador do coletor de erro em produção (#176). Envia a
 * `/api/erro`, que repassa ao Sentry server-side — o DSN nunca viaja ao
 * navegador. Dispara e esquece: uma falha ao relatar não pode travar a tela
 * de erro que o usuário já está vendo.
 */
export function reportarErroCliente(error: unknown, contexto: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || typeof fetch !== "function") return;
  const erroReal = error instanceof Error ? error : new Error(String(error));
  try {
    void fetch("/api/erro", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        mensagem: erroReal.message,
        pilha: erroReal.stack,
        rota: window.location.pathname,
        mecanismo: contexto.mechanism ?? contexto.mecanismo ?? "manual",
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* nunca lançar por causa de um relato de erro */
  }
}
