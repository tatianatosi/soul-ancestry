/**
 * Lado do navegador do coletor de erro em produção. Envia a `/api/erro`, que grava no banco do app
 * (tabela `audit_logs`, `acao = 'erro_app'`). A rota é pública de propósito: um erro pode acontecer
 * antes de a sessão carregar, e exigir sessão faria o próprio relato falhar em silêncio.
 *
 * Dispara e esquece: uma falha ao relatar não pode travar a tela que o usuário já está vendo.
 *
 * 02/11/2026: além do erro que derruba a tela inteira, passam a ser relatados os erros do dia a dia:
 * ação que falha (salvar, publicar), leitura que falha e promessa rejeitada sem tratamento. Antes
 * eles viravam só uma mensagem rápida na tela e sumiam.
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

/**
 * Relata um erro de ação ou leitura, sem repetir o mesmo erro na mesma aba por um minuto e com teto por
 * aba, para um laço de falhas não inundar o servidor. Devolve `true` quando de fato enviou.
 */
const vistosNaAba = new Map<string, number>();
let enviadosNaAba = 0;
const TETO_POR_ABA = 40;
const SILENCIO_MS = 60_000;

export function reportarFalhaDeTela(
  erro: unknown,
  mecanismo: "acao" | "leitura" | "promessa_rejeitada",
  agora: number = Date.now(),
): boolean {
  if (enviadosNaAba >= TETO_POR_ABA) return false;
  const erroReal = erro instanceof Error ? erro : new Error(String(erro));
  // Cancelamento de navegação ou de requisição não é falha do app.
  if (erroReal.name === "AbortError" || /aborted|cancel/i.test(erroReal.message)) return false;
  const rota = typeof window !== "undefined" ? window.location.pathname : "";
  const chave = `${mecanismo}|${rota}|${erroReal.message}`;
  const ultimo = vistosNaAba.get(chave);
  if (ultimo !== undefined && agora - ultimo < SILENCIO_MS) return false;
  if (vistosNaAba.size > 100) vistosNaAba.clear();
  vistosNaAba.set(chave, agora);
  enviadosNaAba += 1;
  reportarErroCliente(erroReal, { mechanism: mecanismo });
  return true;
}

/** Só para teste: zera os contadores da aba. */
export function zerarRelatosDaAba() {
  vistosNaAba.clear();
  enviadosNaAba = 0;
}
